import os
import schedule
from dotenv import load_dotenv
import imaplib 
import email
from email.header import decode_header
import time
import re



## PASO 2: Proceso de decodificacion del asunto del mensaje. 
#         - Esta funcion se utiliza para decodificar correctamente las cabeceras de los emails, en particular el 
#           asunto del mismo, que puede estar codificado en diferentes formatos dependiendo de como fue enviado.
#           En los correos emails, ciertas cabeceras como el asunto, el remitente, el destinatario, entre otras, 
#           pueden estar codificadas utilizando esquemas como Base64 o Quoted-Printable para manejar caracteres 
#           especiales o no ASCII (por ejemplo, letras acentuadas o simbolos). Por ende, con esta funcion nos 
#           aseguramos que esos encabezados sean legibles correctamente en texto plano. 
#           Por ejemplo: si un email llega con el asunto '=?UTF-8?B?REVTQ0FSR0FS?=' (que es "DESCARGAR" codificado 
#           en Base64), esta funcion se encargará de convertirlo a "DESCARGAR" en texto plano para que el la funcion
#           "recieve_email()" lo pueda reconocer.
#         - Con "decode_header" devolvemos una lista de tuplas, donde cada tupla tiene la forma (decoded_part, encoding). 
#           Cada tupla representa una parte de la cabecera que ha sido codificada, junto con su tipo de codificación.
#           Tomamos solo la primera parte (indice [0]), que es generalmente la más relevante. "decoded_bytes" es el 
#           contenido decodificado (que puede ser una cadena o bytes), y "encoding" es el esquema de codificación 
#           utilizado (por ejemplo, 'utf-8', 'iso-8859-1', etc.). Si el encabezado no tiene codificación especial, 
#           "encoding" será None.
#         - Verificamos si la parte decodificada (decoded_bytes) es de tipo bytes:
#           - Si "decoded_bytes" es de tipo bytes, lo decodificamos a una cadena legible utilizando el método decode()
#             y usamos la codificacion original si esta presente (encoding), pero si no hay una codificación explícita, 
#             se utiliza 'utf-8' como predeterminado, ya que es una codificación estandar y muy usada en correos 
#             electrónicos. Entonces, por ejemplo, si la codificación es 'utf-8', la cadena de bytes se convierte a 
#             texto legible usando dicha codificacion.
#           - Si la cabecera no está codificada (es decir, no es de tipo bytes), simplemente se devuelve como esta, y
#             esto puede suceder cuando el asunto del correo es simplemente texto ASCII.
def decode_mail_header(header):
    decoded_bytes, encoding = decode_header(header)[0]
    if isinstance(decoded_bytes, bytes):
        return decoded_bytes.decode(encoding if encoding else 'utf-8')
    return decoded_bytes

####################################################################################################################

## PASO 3: Proceso de lectura del cuerpo del email y obtencion de las fechas de descarga. 
#         - La funcion recibe como parametro el cuerpo del mensaje, y se utiliza "re.search" del modulo re 
#           (expresiones regulares) para buscar coincidencias en el texto del cuerpo del correo, en donde el patron
#           que se esta buscando es "Fecha de inicio: YYYY-MM-DD" y "Fecha de fin: YYYY-MM-DD". La parte de
#           (\d{4}-\d{2}-\d{2}), de la expresión regular, captura un patron de fecha en formato YYYY-MM-DD (año-mes-día) 
#           y lo agrupa para que podamos extraerlo. 
#         - Para ambos casos, si se encuentran las coincidencias, "re.search" devolverá un objeto de coincidencia 
#           (match object) y se extraen las fechas indicando que los datos estan en el grupo 1, que en definitiva es
#           la unica agrupacion, pero de lo contrario, si no hay coincidencia se asigna None.
#         - Finalmente se retornan las fechas de inicio y fin.
def extract_dates_from_body(body):
    begTime_match = re.search(r"Fecha de inicio: (\d{4}-\d{2}-\d{2})", body)
    endTime_match = re.search(r"Fecha de fin: (\d{4}-\d{2}-\d{2})", body)
    
    begTime = begTime_match.group(1) if begTime_match else None
    endTime = endTime_match.group(1) if endTime_match else None

    return begTime, endTime

####################################################################################################################

## PASO 1: Proceso de recepcion de mensaje via Gmail. 
#         - Como primera medida extraemos las variables de entornos necesarias del archivo ".env" para realizar la 
#           captura de los emails, y estas son el email recpetor y su contraseña, el email emisor, y el servidor IMAP
#           de Gmail de Google. Ademas, definimos el subject o el asunto que se va a buscar en los correos recibidos,
#           y si estos lo poseen, entonces seran procesados.
#         - Se establece una conexión segura con el servidor IMAP utilizando SSL, y se procede a iniciar sesion en 
#           el servidor IMAP con las credenciales del destinatario (email y contraseña). Por otro lado, se inicializa
#           una lista que va a almacenar los IDs de los emails que ya han sido procesados para evitar que los correos 
#           se procesen varias veces en futuras iteraciones del bucle.
#         - Se crea un bucle infinito (que se ejecuta en periodos definidos por el CRON en el script app, pero se 
#           puede definir cada cuanto repetir el escaneo de los correos, por ejemplo, cada 5 segundos). Dicho bucle
#           es "True" para monitorear continuamente una bandeja de entrada en busca de nuevos correos hasta una 
#           interrupcion manual.
#         - Dentro del bucle, se indica la bandeja de entrada ("INBOX") en la cuenta de correo destinatario para 
#           buscar mensajes. En la bandeja de entrada se buscan los correos que no han sido leidos (UNSEEN) y que 
#           provienen del remitente especificado. Mediante "status" indicamos si la búsqueda fue exitosa, y "messages"
#           contiene los IDs de los correos electronicos que cumplen con los criterios de la busqueda.
#         - Si la busqueda fue exitosa, y si se encontraron resultados, los IDs de los correos devueltos por el servidor
#           se devuelven como una cadena unica, por lo que se los divide en una lista de IDs individuales. Si no se 
#           encontraron correos, se retorna un mensaje que indica que no se ha detectado una peticion de descarga, 
#           junto con dos valores None para begTime y endTime.
#         - Se recorre cada uno de los IDs de correo encontrados. Si el correo ya ha sido procesado (es decir, su ID 
#           ya está en el conjunto read_emails), se salta y no se procesa nuevamente. Pero sino, se obtiene el contenido 
#           completo del correo electrónico en formato "RFC822" (que incluye todas las cabeceras y el cuerpo del mensaje). 
#           y con "response_part" se recorre cada parte del mensaje (ya que los mensajes pueden ser multipartes), y se
#           convierte el contenido en bytes a un objeto de tipo email. Y se extrae el subject o el asunto del mail y se
#           le aplica la funcion decode_mail_header() para decodificar el asunto por si es necesario.
#         - Una vez detectado el asunto, y decodificado si fue necesario, se lo convierte en mayusculas, y se lo compara 
#           con el asunto que deseamos obtener, previamente definido en "subject_to_search". Si dicha comparacion es 
#           correcta, se avisa que se encontro una peticion de descarga. Luego, se procesa el cuerpo del correo, en 
#           donde si el mensaje tiene varias partes como, por ejemplo, texto y adjuntos, se recorre cada parte, y si la 
#           parte es de tipo texto plano, se extrae el contenido del cuerpo y se lo decodifica, y dicho cuerpo es 
#           enviado a la funcion "extract_dates_from_body()" para extraer las fechas. Si el contenido o el cuerpo del 
#           mensaje no es multiparte directamente se extrae el contenido del cuerpo y se lo decodifica, y dicho cuerpo es 
#           enviado a la funcion "extract_dates_from_body()" para extraer las fechas.
#         - Finalmente, se agrega el email detectado a la lista de correos leidos añadiendo su ID al conjunto read_emails.
#           Y se retornan las fechas de inicio y fin extraídas del correo, junto con un valor None para el tercer valor, 
#           lo cual indica que la operación fue exitosa y que no hubo errores.
def recieve_email():
    dotenv_path = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'credentials', '.env'))
    load_dotenv(dotenv_path)

    ehcpa_email = os.getenv('EHCPA_EMAIL')
    ehcpa_password = os.getenv('EHCPA_PASSWORD')
    vietto_email_sender = os.getenv('VIETTO_EMAIL')
    imap_server = os.getenv('IMAP_GMAIL_SERVER')

    subject_to_search = 'DESCARGAR'

    imap = imaplib.IMAP4_SSL(imap_server)
    imap.login(ehcpa_email, ehcpa_password)
    
    read_emails = set()

    while True:

        imap.select("INBOX")

        status, messages = imap.search(None, f'(UNSEEN FROM "{vietto_email_sender}")')

        if status == "OK":
            email_ids = messages[0].split()

            if not email_ids:
                not_found_petition = "No se detectó petición de descarga remota."
                return None, None, not_found_petition

            for email_id in email_ids:
                if email_id in read_emails:
                    continue 
                
                _, msg_data = imap.fetch(email_id, "(RFC822)")
                for response_part in msg_data:
                    if isinstance(response_part, tuple):

                        msg = email.message_from_bytes(response_part[1])

                        subject = decode_mail_header(msg["Subject"])

                        if subject_to_search in subject.upper():
                            print("Petición de descarga remota recibida.")
                            
                            if msg.is_multipart():
                                for part in msg.walk():
                                    if part.get_content_type() == "text/plain":
                                        body = part.get_payload(decode=True).decode()
                                        begTime, endTime = extract_dates_from_body(body)
                            else:
                                body = msg.get_payload(decode=True).decode()
                                begTime, endTime = extract_dates_from_body(body)
                            
                            read_emails.add(email_id)

                            begTime = f'{begTime}'
                            endTime = f'{endTime}'

                            return begTime, endTime, None
            
    





## Funcion check_and_print_email(): Sirve unicamente para probar la funcion recieve_email() localmente.
def check_and_print_email():
    begTime, endTime, not_found_petition = recieve_email()
    if begTime and endTime:
        print(f"Fechas a descargar: {begTime} - {endTime}")
    else:
        print(not_found_petition)



if __name__ == '__main__':
    schedule.every(5).minutes.do(check_and_print_email)
    while True:
        schedule.run_pending()
        time.sleep(1)

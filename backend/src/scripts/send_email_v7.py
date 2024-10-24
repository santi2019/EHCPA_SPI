import os
from dotenv import load_dotenv
import smtplib
import ssl
from email.message import EmailMessage

try:
    from check_internet_connection_v7 import check_internet_connection 
except ModuleNotFoundError:
    from src.scripts.check_internet_connection_v7 import check_internet_connection


## PASO 1: Proceso de verificacion de conexion a internet para enviar el email.
#          - Como primera medida se llama a la funcion "check_internet_connection()" para verificar conectividad.  
#            - En caso de que haya conexion a Internet:
#              - Se intenta enviar un mensaje llamando a la funcion "send_email(subject, body)", a la cual se pasa 
#                por parametros los valores de "subject" y "body" que previamente fueron recibidos por la funcion 
#                principal y se retorna "True" para indicar que se efectuo la operacion. 
#              - Si ocurre un error, se inprime el mismo por pantalla y se retorna "False".
#            - Si no hay conexion, se imprime el mensaje y se retorna "False".
def send_email_with_internet(subject, body):

    if check_internet_connection():
        try:
            send_email(subject, body)
            return True
        except smtplib.SMTPException as e:
            print(f"Error al enviar el correo: {e}")
            return False
    else:
        print("Error al enviar el correo: No hay conexión a internet.")
        return False

####################################################################################################################

## PASO 2: Proceso de envio de mensaje via Gmail. 
#         - Como primera medida extraemos las variables de entornos necesarias del archivo ".env" para realizar el 
#           envio del mensaje, y estas son el email emisor y su contraseña, el email receptor, el servidor SMTP de
#           Gmail de Google, y el puerto SMTP asignado.
#         - Posteriormente creamos la estructura del mensaje, creando un objeto de tipo "EmailMessage()", y luego
#           establecemos el remitente, destinatario, asunto del correo y el contenido, segun las variables obtenidas
#           anteriormente.
#         - Se crea un contexto SSL para manejar la conexion segura entre el servidor SMTP y el cliente. Despues, 
#           se establece una conexion con el servidor SMTP de Gmail en el puerto SMTP definido usando el contexto 
#           SSL creado previamente para que dicha conexion sea segura. Al establecer la conexion, se procede a 
#           iniciar sesion en el servidor SMTP con las credenciales del remitente (email y contraseña), y finalmente
#           se envia el correo desde el remitente al destinatario. 
def send_email(subject, body):
    dotenv_path = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'credentials', '.env'))
    load_dotenv(dotenv_path)
    ehcpa_email_sender = os.getenv('EHCPA_EMAIL')
    ehcpa_email_password = os.getenv('EHCPA_PASSWORD')
    vietto_email_receiver = os.getenv('VIETTO_EMAIL')
    smtp_gmail_server = os.getenv('SMTP_GMAIL_SERVER')
    smtp_port = os.getenv('SMTP_PORT')

    em = EmailMessage()
    em['From'] = ehcpa_email_sender
    em['To'] = vietto_email_receiver
    em['Subject'] = subject
    em.set_content(body)

    context = ssl.create_default_context()

    with smtplib.SMTP_SSL(smtp_gmail_server, smtp_port, context=context) as smtp:
        smtp.login(ehcpa_email_sender, ehcpa_email_password)
        smtp.sendmail(ehcpa_email_sender, vietto_email_receiver, em.as_string())





if __name__ == '__main__':
    subject = "EHCPA Email Test"
    body = "Este es un mensaje de prueba"
    send_email_with_internet(subject, body)




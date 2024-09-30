import os
from dotenv import load_dotenv
import imaplib 
import email
from email.header import decode_header
import time
import re

def decode_mail_header(header):
    decoded_bytes, encoding = decode_header(header)[0]
    if isinstance(decoded_bytes, bytes):
        return decoded_bytes.decode(encoding if encoding else 'utf-8')
    return decoded_bytes

def extract_dates_from_body(body):
    begTime_match = re.search(r"Fecha de inicio: (\d{4}-\d{2}-\d{2})", body)
    endTime_match = re.search(r"Fecha de fin: (\d{4}-\d{2}-\d{2})", body)
    
    begTime = begTime_match.group(1) if begTime_match else None
    endTime = endTime_match.group(1) if endTime_match else None

    return begTime, endTime

def recieve_email():
    dotenv_path = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'credentials', '.env'))
    load_dotenv(dotenv_path)

    ehcpa_email = os.getenv('EHCPA_EMAIL')
    ehcpa_password = os.getenv('EHCPA_PASSWORD')
    email_sender = os.getenv('EMAIL_SENDER')
    subject_to_search = 'DESCARGAR'

    imap_server = 'imap.gmail.com'

    imap = imaplib.IMAP4_SSL(imap_server)
    imap.login(ehcpa_email, ehcpa_password)
    
    read_emails = set()

    try:
        while True:

            imap.select("INBOX")

            status, messages = imap.search(None, f'(UNSEEN FROM "{email_sender}")')

            if status == "OK":
                # Divide los correos en la lista
                email_ids = messages[0].split()

                for email_id in email_ids:
                    if email_id in read_emails:
                        continue  # Si ya se leyó, se omite
                    
                    # Obtiene el correo
                    _, msg_data = imap.fetch(email_id, "(RFC822)")
                    for response_part in msg_data:
                        if isinstance(response_part, tuple):
                            # Procesa el mensaje de correo
                            msg = email.message_from_bytes(response_part[1])

                            # Decodifica el asunto
                            subject = decode_mail_header(msg["Subject"])

                            # Si el asunto es DESCARGAR, mostramos el contenido
                            if subject_to_search in subject.upper():
                                print("Petición de descarga remota recibida.")
                                
                                # Procesa el cuerpo del correo
                                if msg.is_multipart():
                                    for part in msg.walk():
                                        if part.get_content_type() == "text/plain":
                                            body = part.get_payload(decode=True).decode()
                                            begTime, endTime = extract_dates_from_body(body)
                                else:
                                    body = msg.get_payload(decode=True).decode()
                                    begTime, endTime = extract_dates_from_body(body)
                                
                                # Agrega el correo a la lista de leídos
                                read_emails.add(email_id)

                                begTime = f'{begTime}'
                                endTime = f'{endTime}'

                                return begTime, endTime
            
            #time.sleep(5)
    except KeyboardInterrupt:
        print("Terminando proceso...")
    




if __name__ == '__main__':
    recieve_email()

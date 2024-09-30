import os
from dotenv import load_dotenv
import smtplib
import ssl
from email.message import EmailMessage
import socket



## Funcion para verificar conectividad de Internet
def check_internet_connection(host="8.8.8.8", port=53, timeout=3):
    try:
        socket.setdefaulttimeout(timeout)
        socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect((host, port))
        return True
    except socket.error as ex:
        print(f"No hay conexión a internet: {ex}")
        return False


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


def send_email(subject, body):
    dotenv_path = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'credentials', '.env'))
    load_dotenv(dotenv_path)
    email_sender = os.getenv('EHCPA_EMAIL')
    email_password = os.getenv('EHCPA_PASSWORD')
    email_receiver = os.getenv('EMAIL_RECEIVER')

    em = EmailMessage()
    em['From'] = email_sender
    em['To'] = email_receiver
    em['Subject'] = subject
    em.set_content(body)

    context = ssl.create_default_context()

    with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as smtp:
        smtp.login(email_sender, email_password)
        smtp.sendmail(email_sender, email_receiver, em.as_string())









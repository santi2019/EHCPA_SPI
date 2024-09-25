import time
import schedule
import json
import socket
import smtplib
from datetime import datetime
from dateutil.relativedelta import relativedelta
from urllib3.exceptions import MaxRetryError, NameResolutionError
from geo.Geoserver import GeoserverException
from src.scripts.download_subset_v7 import download_subset, results_length
from src.scripts.P_acu_mensual_v7 import p_acu_mensual
from src.scripts.concat_reord_v7 import concat_reord
from src.scripts.ptm_conversion_crop_v7 import ptm_convertion_and_crop
from src.scripts.spi_conversion_crop_v7 import spi_convertion_and_crop
from src.scripts.spi_process_v7 import spi_process
from src.scripts.geoserver_upload_v7 import geoserver_upload
from src.scripts.zip_output_data_v7 import zip_output_data
from src.scripts.send_email_v7 import send_email
from src.scripts.inspect_arglate_v7 import inspect_arglate, formatted_date


## Funcion de delay para evitar colisiones entre funciones del proceso
#
def sleep_for_a_bit(seconds):
    print(f"Sleeping {seconds} second(s)")
    time.sleep(seconds)
    print("Done sleeping, continuing the process...")


## Funcion para verificar conectividad de Internet
#
def checkInternetConnection(host="8.8.8.8", port=53, timeout=3):
    try:
        socket.setdefaulttimeout(timeout)
        socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect((host, port))
        return True
    except socket.error as ex:
        print(f"No hay conexión a internet: {ex}")
        return False



def ehcpa_process():

    downloadError = False
    error_message = ""
    apiErrorMessage = "API Error: Solicitud defectuosa."
    no_data_downloaded = False

    today_date = datetime.today()
    next_month_third_day = (today_date + relativedelta(months=1)).replace(day=3)
    if today_date.day < 3:
        formatted_third_day = today_date.replace(day=3).strftime('%Y-%m-%d')
    else:
        formatted_third_day = next_month_third_day.strftime('%Y-%m-%d')


    try:
        sleep_for_a_bit(5)

        try:
            results_length = download_subset()
            formatted_date = inspect_arglate()
        except KeyError as e:
            formatted_date = inspect_arglate()
            downloadError = True
            error_message = (
                f"{apiErrorMessage}\n"
                f"- Descripción: Parametros de solicitud del subset incorrectos o sitio GES DISC en mantenimiento.\n"
                f"- Verificar estado del sitio GES DISC en:\n"
                f"https://disc.gsfc.nasa.gov/datasets/GPM_3IMERGDL_07/summary?keywords=imerg\n"
                f"- Detalles: El campo o clave {e} no se encontró en la respuesta.\n"
                f"\n"
                f"- Última fecha descargada: \n"
                f" {formatted_date}\n"
                f"- Fecha de formateo de carpeta ARG_Late: \n"
                f" {formatted_third_day}\n"
            )
            print(error_message)
        except json.JSONDecodeError as e:
            formatted_date = inspect_arglate()
            downloadError = True
            error_message = (
                f"Error decoding JSON: Fallo en la solicitud a la API.\n"
                f"- Descripción: Posible problema de conectividad local o API fuera de servicio, por lo que se obtuvo una respuesta vacía o en un formato inesperado.\n"
                f"- Detalles: {e}\n"
                f"\n"
                f"- Última fecha descargada: \n"
                f" {formatted_date}\n"
                f"- Fecha de formateo de carpeta ARG_Late: \n"
                f" {formatted_third_day}\n"
            )
            print(error_message)
        except (NameResolutionError, MaxRetryError) as e:
            formatted_date = inspect_arglate()
            downloadError = True
            error_message = (
                f"Error de conexión Wifi.\n"
                f"- Descripción: Máximo número de intentos superados y no se pudo resolver el nombre del servidor.\n"
                f"- Detalles: {e}\n"
                f"\n"
                f"- Última fecha descargada: \n"
                f" {formatted_date}\n"
                f"- Fecha de formateo de carpeta ARG_Late: \n"
                f" {formatted_third_day}\n"
            )
            print(error_message)



        if not downloadError and results_length == 0:
            no_data_downloaded = True



        sleep_for_a_bit(30)
        p_acu_mensual()
        sleep_for_a_bit(30)
        concat_reord()
        sleep_for_a_bit(30)
        ptm_convertion_and_crop()
        sleep_for_a_bit(30)
        spi_process()
        sleep_for_a_bit(30)
        spi_convertion_and_crop()
        sleep_for_a_bit(30)

        if checkInternetConnection():
            try:
                geoserver_upload()
            except GeoserverException as e:
                downloadError = True
                error_message = (
                    f"Geoserver Error."
                    f"- Descripción: Error al subir datos al servidor Geoserver.\n"
                    f"- Detalles: {e}\n"
                    f"\n"
                    f"- Última fecha descargada: \n"
                    f" {formatted_date}\n"
                    f"- Fecha de formateo de carpeta ARG_Late: \n"
                    f" {formatted_third_day}\n"
                )
                print(error_message)
        else:
            downloadError = True
            error_message = "No se puede subir a Geoserver: No hay conexión a internet."
            error_message = (
                f"Error de conexión a Internet.\n"
                f"- Descripción: No se pueden subir datos al servidor Geoserver, no hay conexión a internet.\n"
                f"- Detalles: {e}\n"
                f"\n"
                f"- Última fecha descargada: \n"
                f" {formatted_date}\n"
                f"- Fecha de formateo de carpeta ARG_Late: \n"
                f" {formatted_third_day}\n"
            )
            print(error_message)

        sleep_for_a_bit(30)
        
        if no_data_downloaded:
            subject = "EHCPA - No se descargaron datos"
            body = (
                f"Alerta: El proceso finalizó, pero se descargaron 0 datos.\n"
                f"- Verificar disponibilidad de datos IMERG en:\n"
                f"https://disc.gsfc.nasa.gov/datasets/GPM_3IMERGDL_07/summary?keywords=imerg\n"
                f"\n"
                f"- Última fecha descargada: \n"
                f" {formatted_date}\n"
                f"- Fecha de formateo de carpeta ARG_Late: \n"
                f" {formatted_third_day}\n"
            )
            send_email_with_internet(subject, body) 
            print("El proceso finalizó, pero no se descargaron datos. Se ha enviado una alerta por correo.")
        elif downloadError:
            subject = "EHCPA - Error en el proceso"
            body = f"{error_message}"
            send_email_with_internet(subject, body)
            print("El proceso finalizó con errores. Se ha enviado una alerta por correo.")
        else:
            subject = "EHCPA - Proceso exitoso"
            body = (
                f"El proceso finalizó con éxito y sin errores.\n"
                f"\n"
                f"- Última fecha descargada: \n"
                f" {formatted_date}\n"
                f"- Fecha de formateo de carpeta ARG_Late: \n"
                f" {formatted_third_day}\n"
            )
            send_email_with_internet(subject, body) 
            print("El proceso finalizó con éxito y sin errores.")

    except Exception as e:
        subject = "EHCPA - Error en el proceso"
        error_message = (
            f"Alerta: Error inesperado.\n"
            f"- Detalles: {e}\n"
            f"\n"
            f"- Última fecha descargada: \n"
            f" {formatted_date}\n"
            f"- Fecha de formateo de carpeta ARG_Late: \n"
            f" {formatted_third_day}\n"
        )
        email_sent = send_email_with_internet(subject, error_message)
        if email_sent:
            print("El proceso finalizó con errores. Se ha enviado una alerta por correo.")
        else:
            print("El proceso finalizó con errores, pero no se pudo enviar la alerta por correo debido a problemas de conexión.")



def send_email_with_internet(subject, body):

    if checkInternetConnection():
        try:
            send_email(subject, body)
            return True
        except smtplib.SMTPException as e:
            print(f"Error al enviar el correo: {e}")
            return False
    else:
        print("Error al enviar el correo: No hay conexión a internet.")
        return False



def main():
   ehcpa_process()


if __name__ == "__main__":
    schedule.every().day.at("03:00").do(main)
    while True:
        schedule.run_pending()
        time.sleep(1)






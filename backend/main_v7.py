import time
import schedule
import json
from datetime import datetime
from dateutil.relativedelta import relativedelta
from geo.Geoserver import GeoserverException
from src.scripts.automatic_s3_downloader_v7 import automatic_s3_downloader
from src.scripts.download_subset_v7 import download_subset
from src.scripts.inspect_arglate_v7 import inspect_arglate
from src.scripts.get_calibration_date_v7 import get_calibration_date
from src.scripts.P_acu_mensual_v7 import p_acu_mensual
from src.scripts.automatic_s3_uploader_v7 import automatic_s3_uploader
from src.scripts.concat_reord_v7 import concat_reord
from src.scripts.ptm_conversion_crop_v7 import ptm_convertion_and_crop
from src.scripts.spi_process_v7 import spi_process
from src.scripts.spi_conversion_crop_v7 import spi_convertion_and_crop
from src.scripts.geoserver_upload_v7 import geoserver_upload
from src.scripts.send_email_v7 import check_internet_connection, send_email_with_internet
from src.scripts.recieve_email_v7 import recieve_email



## Funcion de delay para evitar colisiones entre funciones del proceso
#
def sleep_for_a_bit(seconds):
    print(f"Pausando proceso por {seconds} segundo(s)")
    time.sleep(seconds)
    print("Fin de la pausa, continuando proceso...")



def ehcpa_process():

    no_data_downloaded = False

    today_date = datetime.today()

    download_date = today_date - relativedelta(days=2)

    download_date_year = download_date.year
    download_date_month = download_date.month
    download_date_day = download_date.day

    begTime = f'{download_date_year:04d}-{download_date_month:02d}-{download_date_day:02d}'
    endTime = f'{download_date_year:04d}-{download_date_month:02d}-{download_date_day:02d}'

    next_month_third_day = (today_date + relativedelta(months=1)).replace(day=3)
    if today_date.day < 3:
        formatted_third_day = today_date.replace(day=3).strftime('%Y-%m-%d')
    else:
        formatted_third_day = next_month_third_day.strftime('%Y-%m-%d')


    try:
        sleep_for_a_bit(10)

        automatic_s3_downloader()
        sleep_for_a_bit(30)

        print(f"Fecha actual: {today_date.strftime('%Y-%m-%d')}")

        results_length, downloadError, error_message = download_subset(begTime, endTime)

        formatted_date = inspect_arglate()

        calibration_end_year, calibration_end_month = get_calibration_date()

        if not downloadError and results_length == 0:
            no_data_downloaded = True

        sleep_for_a_bit(30)
        p_acu_mensual()
        sleep_for_a_bit(30)
        automatic_s3_uploader()
        sleep_for_a_bit(30)
        concat_reord()
        sleep_for_a_bit(30)
        ptm_convertion_and_crop(calibration_end_year, calibration_end_month)
        sleep_for_a_bit(30)
        spi_process()
        sleep_for_a_bit(30)
        spi_convertion_and_crop(calibration_end_year, calibration_end_month)
        sleep_for_a_bit(30)

        if check_internet_connection():
            try:
                geoserver_upload()
            except GeoserverException as e:
                downloadError = True
                error_message = (
                    f"Geoserver Error.\n"
                    f"- Descripción: Error al subir datos al servidor Geoserver.\n"
                    f"- Detalles: {e}\n"
                )
                print(error_message)
        else:
            downloadError = True
            error_message = (
                f"Error de conexión a Internet.\n"
                f"- Descripción: No se pueden subir datos al servidor Geoserver, no hay conexión a internet.\n"
                f"- Detalles: {e}\n"
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
            body = ( 
                f"{error_message}"
                f"\n"
                f"- Última fecha descargada: \n"
                f" {formatted_date}\n"
                f"- Fecha de formateo de carpeta ARG_Late: \n"
                f" {formatted_third_day}\n" 
            )
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
    
    except KeyboardInterrupt:
        print("Terminando proceso...")




## Funcion para descarga remota
#
def remote_download_process():

    no_data_downloaded = False

    today_date = datetime.today()

    next_month_third_day = (today_date + relativedelta(months=1)).replace(day=3)
    if today_date.day < 3:
        formatted_third_day = today_date.replace(day=3).strftime('%Y-%m-%d')
    else:
        formatted_third_day = next_month_third_day.strftime('%Y-%m-%d')

    try:

        begTime, endTime, not_found_petition = recieve_email()

        if begTime and endTime:

            sleep_for_a_bit(15)

            results_length, downloadError, error_message = download_subset(begTime, endTime)

            sleep_for_a_bit(15)

            formatted_date = inspect_arglate()

            if not downloadError and results_length == 0:
                no_data_downloaded = True

            if no_data_downloaded:
                subject = "EHCPA - Descarga remota - No se descargaron datos"
                body = (
                    f"Alerta: El proceso de descarga remota finalizó, pero se descargaron 0 datos.\n"
                    f"- Verificar disponibilidad de datos IMERG en:\n"
                    f"https://disc.gsfc.nasa.gov/datasets/GPM_3IMERGDL_07/summary?keywords=imerg\n"
                    f"\n"
                    f"- Última fecha descargada: \n"
                    f" {formatted_date}\n"
                    f"- Fecha de formateo de carpeta ARG_Late: \n"
                    f" {formatted_third_day}\n"
                )
                send_email_with_internet(subject, body) 
                print("El proceso de descarga remota finalizó, pero no se descargaron datos. Se ha enviado una alerta por correo.")
            elif downloadError:
                subject = "EHCPA - Error en descarga remota"
                body = ( 
                    f"{error_message}"
                    f"\n"
                    f"- Última fecha descargada: \n"
                    f" {formatted_date}\n"
                    f"- Fecha de formateo de carpeta ARG_Late: \n"
                    f" {formatted_third_day}\n" 
                )
                send_email_with_internet(subject, body)
                print("El proceso de descarga remota finalizó con errores. Se ha enviado una alerta por correo.")
            else:
                subject = "EHCPA - Descarga remota exitosa"
                body = (
                    f"El proceso de descarga remota finalizó con éxito y sin errores.\n"
                    f"\n"
                    f"- Última fecha descargada: \n"
                    f" {formatted_date}\n"
                    f"- Fecha de formateo de carpeta ARG_Late: \n"
                    f" {formatted_third_day}\n"
                )
                send_email_with_internet(subject, body) 
                print("El proceso de descarga remota finalizó con éxito y sin errores.")
        else:
            print(f"{not_found_petition}")

    
    except Exception as e:
        subject = "EHCPA - Error en Descarga Remota"
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
            print("El proceso de descarga remota finalizó con errores. Se ha enviado una alerta por correo.")
        else:
            print("El proceso de descarga remota finalizó con errores, pero no se pudo enviar la alerta por correo debido a problemas de conexión.")

    except KeyboardInterrupt:
        print("Terminando proceso...")








def main():
   ehcpa_process()
   #remote_download_process()


if __name__ == "__main__":
    #main()
    schedule.every().day.at("03:00").do(main)
    while True:
        schedule.run_pending()
        time.sleep(1)





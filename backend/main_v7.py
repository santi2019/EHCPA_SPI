import time
import schedule
import json
from datetime import datetime
from dateutil.relativedelta import relativedelta
from src.scripts.check_internet_connection_v7 import check_internet_connection
from src.scripts.automatic_s3_downloader_v7 import automatic_s3_downloader
from src.scripts.download_subset_v7 import download_subset
from src.scripts.get_dates_v7 import get_today_date, get_download_date, get_ARG_late_last_date, get_ARG_late_reset_date
from src.scripts.P_acu_mensual_v7 import p_acu_mensual
from src.scripts.automatic_s3_uploader_v7 import automatic_s3_uploader
from src.scripts.concat_reord_v7 import concat_reord
from src.scripts.ptm_conversion_crop_v7 import ptm_convertion_and_crop
from src.scripts.spi_process_v7 import spi_process
from src.scripts.spi_conversion_crop_v7 import spi_convertion_and_crop
from src.scripts.geoserver_upload_v7 import geoserver_upload
from src.scripts.send_email_v7 import send_email_with_internet
from src.scripts.recieve_email_v7 import recieve_email



## Funcion sleep_for_a_bit(): Sirve para generar un delay, con el objetivo de evitar colisiones entre las 
#                             funciones de los procesos.
#       - La funcion recibe como parametros los segundos deseados para pausar el proceso, y se utiliza el modulo
#         "sleep" de la libraria "time", para pausar la ejecucion durante el tiempo definido.
def sleep_for_a_bit(seconds):
    print(f"Pausando proceso por {seconds} segundo(s)")
    time.sleep(seconds)
    print("Fin de la pausa, continuando proceso...")

####################################################################################################################
## Funcion ehcpa_process(): Funcion central del sistema, que permite la automatizacion de la siguiente secuencia:
#       1. Mediante "get_ARG_late_last_date()" se obtiene la fecha del archivo IMERG de precipitacion diaria mas 
#          recientemente descargado, para que pueda ser notificado via email, al finalizar el proceso. De igual
#          manera con "get_ARG_late_reset_date()" para obtener la fecha de formateo de la carpeta ARG_late, para que 
#          pueda ser notificado via email cuando termine el proceso.
#       2. El proceso unicamente se ejecutara si hay conectividad a Internet, por lo tanto se realiza dicha verificacion
#          mediante "check_internet_connection()". Si hay conectividad continua el proceso, caso contrario el proceso 
#          se no se ejecutara indicando que hay conectividad.
#       3. En caso de haber conexion, durante el proceso se ejecutan, entre funcion y funcion, las funciones 
#          "sleep_for_a_bit()" para pausar el proceso durante unos segundos y asi evitar sobrecargas.
#       4. Se ejecuta "automatic_s3_downloader()" para verificar que en el directorio del proyecto este la carpeta 
#          "IMERG_late_month" con todos los archivos de los acumulados mensuales. En caso de no existir la carpeta, 
#          esta se creara y se descargaran todos los archivos desde el servicio de backup S3 de AWS. Si la carpeta 
#          existe paro la cantidad de archivos locales son menores a la cantidad almacenada en el backup de S3, se 
#          procede a descargarlos a todos nuevamente, caso contrario el proceso continua.
#       5. Se ejecuta "get_today_date()" para obtener la fecha actual.
#       6. Se ejecuta "get_download_date()"" para obtener las fechas de descarga. 
#       7. Se ejecuta download_subset(begTime, endTime, reset_ARG_late), la cual recibe como parametros la fecha de 
#          inicio y fin de descarga, y el valor de la flag reset_ARG_late en "True" para indicar que se formatee el 
#          directorio "ARG_late" siempre y cuando sea la fecha de formateo. De dicha funcion se extrae la flag 
#          "error_found" y el valor del mensaje de error en "error_message". Y se verifica que si la flag "error_found"
#          es "True", se envia un email avisando que el proceso finalizo con errores, enviando "error_message", y el 
#          proceso se detiene. En caso de que ocurra un error y no haya conectividad, el mensaje se indica y se 
#          informa que el mail no podra enviarse.
#       8. Se ejecuta nuevamente "get_ARG_late_last_date()" para obtener la fecha del nuevo archivo IMERG de precipitacion 
#          diaria descargado, para que pueda ser notificado via email, al finalizar el proceso.
#       9. Se ejecuta "p_acu_mensual()" para generar el archivo de precipitacion mensual acumulada del correspondiente 
#          mes de los archivos IMERG diarios descargados.
#       10. Se ejecuta "automatic_s3_uploader()" para generar backup, en el servicio S3 de AWS, de todos los archivos de 
#           precipitacion mensual acumulada almacenados en el directorio "IMERG_late_month".
#       11. Se ejecuta concat_reord() para la concatenacion de los archivos de precipitacion mensual acumulada, el 
#           reordenamiento y correcion de variables.
#       12. Se ejecuta "ptm_convertion_and_crop()" para generar el archivo de Precipitacion Total Mensual (PTM), en 
#           formato “tif” y recordado en Argentina, tanto de todas las bandas como el de la ultima banda.
#       13. Se ejecuta "spi_process()" para generar los archivos de SPI (Indice de Precipitacion Estandarizado) en escala 
#           1, 2, 3, 6, 9, 12, 24, 36, 48, 60 y 72 tanto Gamma como Pearson, y luego se reordena las variables unicamente 
#           en los archivos Gamma.
#       14. Se ejecuta "spi_convertion_and_crop()" para generar los archivos de SPI, de todas las escalas, en formato “tif” 
#           y recordados en Argentina, tanto de todas las bandas como el de la ultima banda.
#       15. Se ejecuta "geoserver_upload()" para enviar los archivos que poseen la ultima banda, tanto de PTM como de SPI 
#           de todas las escalas, al servidor Geoserver para su visualizacion.
#       - Al terminar el proceso se obtienen varios resultados:
#         - Si el proceso finalizó con éxito y sin errores, se envia un mensaje por correo. Y en caso de que no haya conexion
#           u ocurrio un error al enviar el email, se indica que todo termino bien pero que no se puede enviar el correo.
#         - Si ocurre cualquier error no conocido durante el proceso, el mismo se detiene y se envia un mensaje por correo 
#           indicando dicho error. Y en caso de que no haya conexion u ocurra un error al enviar el email, se indica que 
#           el proceso termino mal, pero que no se puede enviar el correo.
#         - Si no hay conexion a internet al inicio del proceso, este no se ejecutara, y se mostrara el mensaje de que no 
#           hay conexion. Y en caso de que durante la ejecucion del proceso, se cortara la conexion, unicamente las funciones
#           "automatic_s3_downloader()", "download_subset(begTime, endTime, reset_ARG_late)", "automatic_s3_uploader()" y 
#           "geoserver_upload()" seran capaces de detectar errores de conectividad y detendran el proceso, por dicho motivo,
#           pero no podra ser enviado el email.
def ehcpa_process():

    ARG_late_last_date = get_ARG_late_last_date()
    ARG_late_reset_date = get_ARG_late_reset_date()

    if check_internet_connection():
        try:
            sleep_for_a_bit(10)
            #automatic_s3_downloader()
            sleep_for_a_bit(30)
            get_today_date()

            begTime, endTime = get_download_date()
            reset_ARG_late = True
            error_found, error_message = download_subset(begTime, endTime, reset_ARG_late)

            if error_found:
                subject = "EHCPA - Error en el proceso"
                body = ( 
                    f"{error_message}"
                    f"\n"
                    f"- Última fecha descargada: \n"
                    f" {ARG_late_last_date}\n"
                    f"- Fecha de formateo de carpeta ARG_Late: \n"
                    f" {ARG_late_reset_date}\n" 
                )
                email_sent = send_email_with_internet(subject, body)
                if email_sent:
                    print("El proceso finalizó con errores. Se ha enviado una alerta por correo.")
                else:
                    print("El proceso finalizó con errores, pero no se pudo enviar la alerta por correo.")

                return


            ARG_late_last_date = get_ARG_late_last_date()

            sleep_for_a_bit(30)
            p_acu_mensual()
            sleep_for_a_bit(30)
            #automatic_s3_uploader()
            sleep_for_a_bit(30)
            concat_reord()
            sleep_for_a_bit(30)
            ptm_convertion_and_crop()
            sleep_for_a_bit(30)
            spi_process()
            sleep_for_a_bit(30)
            spi_convertion_and_crop()
            sleep_for_a_bit(30)
            geoserver_upload()
            sleep_for_a_bit(30)
            
            
            subject = "EHCPA - Proceso exitoso"
            body = (
                f"El proceso finalizó con éxito y sin errores.\n"
                f"\n"
                f"- Última fecha descargada: \n"
                f" {ARG_late_last_date}\n"
                f"- Fecha de formateo de carpeta ARG_Late: \n"
                f" {ARG_late_reset_date}\n"
            )
            email_sent = send_email_with_internet(subject, body) 
            if email_sent:
                print("El proceso finalizó con éxito y sin errores.")
            else:
                print("El proceso finalizó con éxito y sin errores, pero no se pudo enviar la alerta por correo.")

        except Exception as e:
            subject = "EHCPA - Error en el proceso"
            error_message = (
                f"Error inesperado:\n"
                f"- Detalles: {e}\n"
                f"\n"
                f"- Última fecha descargada: \n"
                f" {ARG_late_last_date}\n"
                f"- Fecha de formateo de carpeta ARG_Late: \n"
                f" {ARG_late_reset_date}\n"
            )
            print(error_message)
            email_sent = send_email_with_internet(subject, error_message)
            if email_sent:
                print("El proceso finalizó con errores. Se ha enviado una alerta por correo.")
            else:
                print("El proceso finalizó con errores, pero no se pudo enviar la alerta por correo.")
        

        except KeyboardInterrupt:
            print("Terminando proceso...")

    else:
        error_message = (
            f"EHCPA - Error de conexión a Internet :(\n"
            f"- Descripción: El proceso EHCPA no se puede ejecutar debido a que no hay conexión a Internet.\n"
        )
        print(error_message)

####################################################################################################################

## Funcion remote_download_process(): Sirve para efectura la descarga remota de archivos IMERG de precipitacion 
#                                     diaria, via Gmail.
#       1. Mediante "get_ARG_late_last_date()" se obtiene la fecha del archivo IMERG de precipitacion diaria mas 
#          recientemente descargado, para que pueda ser notificado via email, al finalizar el proceso. De igual
#          manera con "get_ARG_late_reset_date()" para obtener la fecha de formateo de la carpeta ARG_late, para que 
#          pueda ser notificado via email cuando termine el proceso.
#       2. El proceso unicamente se ejecutara si hay conectividad a Internet, por lo tanto se realiza dicha verificacion
#          mediante "check_internet_connection()". Si hay conectividad continua el proceso, caso contrario el proceso 
#          se no se ejecutara indicando que hay conectividad.
#       3. En caso de haber conexion, durante el proceso se ejecutan, entre funcion y funcion, las funciones 
#          "sleep_for_a_bit()" para pausar el proceso durante unos segundos y asi evitar sobrecargas.
#       4. Se ejecuta "recieve_email()" la cual permite identificar si llego un mail con peticion de descarga remota. 
#          De dicha funcion se extraen las fechas indicadas a descargar y una señal de deteccion de solicitud.
#       5. En caso de que las fechas de descarga extraidas tengan datos, continua el proceso, caso contrario, se 
#          muestra el mensaje de "not_found_petition" indicando que no se detecto peticion de descarga remota.
#       6. Se ejecuta download_subset(begTime, endTime, reset_ARG_late), la cual recibe como parametros la fecha de 
#          inicio y fin de descarga de la peticion via email, y el valor de la flag reset_ARG_late en "False" para 
#          indicar que no se formatee el directorio "ARG_late". De dicha funcion se extrae la flag "error_found" y el 
#          valor del mensaje de error en "error_message". Y se verifica que si la flag "error_found" es "True", se 
#          envia un email avisando que el proceso finalizo con errores, enviando "error_message", y el proceso se detiene. 
#          En caso de que ocurra un error y no haya conectividad, el mensaje se indica y se informa que el mail no podra 
#          enviarse.
#       7. Se ejecuta nuevamente "get_ARG_late_last_date()" para obtener la fecha del nuevo archivo IMERG de precipitacion 
#          diaria descargado, para que pueda ser notificado via email, al finalizar el proceso. Y el proceso finaliza.
#       - Al terminar el proceso se obtienen varios resultados:
#         - Si el proceso finalizó con éxito y sin errores, se envia un mensaje por correo. Y en caso de que no haya conexion
#           u ocurrio un error al enviar el email, se indica que todo termino bien pero que no se puede enviar el correo.
#         - Si ocurre cualquier error no conocido durante el proceso, el mismo se detiene y se envia un mensaje por correo 
#           indicando dicho error. Y en caso de que no haya conexion u ocurra un error al enviar el email, se indica que 
#           el proceso termino mal, pero que no se puede enviar el correo.
#         - Si no hay conexion a internet al inicio del proceso de descarga remota, este no se ejecutara, y se mostrara el 
#           mensaje de que no hay conexion. Y en caso de que durante la ejecucion del proceso, se cortara la conexion, 
#           unicamente la funcion "download_subset(begTime, endTime, reset_ARG_late)" sera capaz de detectar errores de 
#           conectividad y detendra el proceso, pero no podra ser enviado el email, indicando igualmente que ocurrio el 
#           error.
def remote_download_process():

    ARG_late_last_date = get_ARG_late_last_date()
    ARG_late_reset_date = get_ARG_late_reset_date()

    if check_internet_connection():
        try:

            begTime, endTime, not_found_petition = recieve_email()

            if begTime and endTime:

                sleep_for_a_bit(15)

                reset_ARG_late = False
                error_found, error_message = download_subset(begTime, endTime, reset_ARG_late)

                if error_found:
                    subject = "EHCPA - Error en descarga remota"
                    body = ( 
                        f"{error_message}"
                        f"\n"
                        f"- Última fecha descargada: \n"
                        f" {ARG_late_last_date}\n"
                        f"- Fecha de formateo de carpeta ARG_Late: \n"
                        f" {ARG_late_reset_date}\n" 
                    )
                    email_sent = send_email_with_internet(subject, body)
                    if email_sent:
                        print("El proceso de descarga remota finalizó con errores. Se ha enviado una alerta por correo.")
                    else:
                        print("El proceso de descarga remota finalizó con errores, pero no se pudo enviar la alerta por correo.")

                    return

                sleep_for_a_bit(15)

                ARG_late_last_date = get_ARG_late_last_date()

                subject = "EHCPA - Descarga remota exitosa"
                body = (
                    f"El proceso de descarga remota finalizó con éxito y sin errores.\n"
                    f"\n"
                    f"- Última fecha descargada: \n"
                    f" {ARG_late_last_date}\n"
                    f"- Fecha de formateo de carpeta ARG_Late: \n"
                    f" {ARG_late_reset_date}\n"
                )
                email_sent = send_email_with_internet(subject, body)
                if email_sent:
                    print("El proceso de descarga remota finalizó con éxito y sin errores.")
                else:
                    print("El proceso de descarga remota finalizó con éxito y sin errores, pero no se pudo enviar la alerta por correo.")
            else:
                print(not_found_petition)

        except Exception as e:
            subject = "EHCPA - Error en descarga remota"
            error_message = (
                f"Error inesperado:\n"
                f"- Detalles: {e}\n"
                f"\n"
                f"- Última fecha descargada: \n"
                f" {ARG_late_last_date}\n"
                f"- Fecha de formateo de carpeta ARG_Late: \n"
                f" {ARG_late_reset_date}\n"
            )
            print(error_message)
            email_sent = send_email_with_internet(subject, error_message)
            if email_sent:
                print("El proceso de descarga remota finalizó con errores. Se ha enviado una alerta por correo.")
            else:
                print("El proceso de descarga remota finalizó con errores, pero no se pudo enviar la alerta por correo.")


        except KeyboardInterrupt:
            print("Terminando proceso...")

    else:
        error_message = (
            f"EHCPA - Error de conexión a Internet :(\n"
            f"- Descripción: El proceso EHCPA no puede verificar solicitudes de descarga remota debido a que no hay conexión a Internet.\n"
        )
        print(error_message)







def main():
   #ehcpa_process()
   remote_download_process()


if __name__ == "__main__":
    remote_download_process()
    '''
    schedule.every().day.at("03:00").do(main)
    while True:
        schedule.run_pending()
        time.sleep(1)
    '''

import time
import schedule
from src.scripts.download_subset_v7 import download_subset
from src.scripts.P_acu_mensual_v7 import p_acu_mensual
from src.scripts.concat_reord_v7 import concat_reord
from src.scripts.ptm_conversion_crop_v7 import ptm_convertion_and_crop
from src.scripts.spi_conversion_crop_v7 import spi_convertion_and_crop
from src.scripts.spi_process_v7 import spi_process
from src.scripts.geoserver_upload_v7 import geoserver_upload
from src.scripts.zip_output_data_v7 import zip_output_data


## Funcion de delay para evitar colisiones entre funciones del proceso
#
def sleep_for_a_bit(seconds):
    print(f"Sleeping {seconds} second(s)")
    time.sleep(seconds)
    print("Done sleeping, continuing the process...")


def ehcpa_process():
    sleep_for_a_bit(5)
    download_subset()
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
    geoserver_upload()
    sleep_for_a_bit(30)
    zip_output_data()
    sleep_for_a_bit(30)
    print("El proceso finalizo sin errores")



def main():
   ehcpa_process()


if __name__ == "__main__":
    schedule.every().day.at("03:00").do(main)
    while True:
        schedule.run_pending()
        time.sleep(1)






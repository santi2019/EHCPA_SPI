import time
import schedule
from download_subset_v7 import download_subset
from P_acu_mensual_v7 import p_acu_mensual
from concat_reord_v7 import concat_reord
from spi_process_v7 import spi_process


## Funcion de delay para evitar colisiones entre funciones del proceso
def sleep_for_a_bit(seconds):
    print(f"Sleeping {seconds} second(s)")
    time.sleep(seconds)
    print("Done sleeping, continuing the process...")


def main():
    sleep_for_a_bit(5)
    download_subset()
    sleep_for_a_bit(30)
    p_acu_mensual()
    sleep_for_a_bit(30)
    concat_reord()
    sleep_for_a_bit(30)
    spi_process()


schedule.every().day.at("03:00").do(main)

while True:
    schedule.run_pending()
    time.sleep(1)


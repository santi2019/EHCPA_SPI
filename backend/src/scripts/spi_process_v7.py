import os
import shutil
from subprocess import Popen
from datetime import datetime
from dateutil.relativedelta import relativedelta

try:
    from sleep_for_a_bit_v7 import sleep_for_a_bit 
except ModuleNotFoundError:
    from src.scripts.sleep_for_a_bit_v7 import sleep_for_a_bit


###################################################################################################################################

## Funcion spi_process: Sirve para calcular el Indice de Precipitacion Estandarizado (SPI) en escalas 1 2 3 6 9 12 24 36 48 60 72,
#  mediante el procesamiento de los archivos de precipitacion mensual acumulada.

def spi_process():

    ## Distribucion de carpetas/directorios:
    #
    #   - concat_reord_dir: Carpeta donde encuentra el archivo IMERG_reord_lat_fix.nc4.
    #   - SPI_dir: Carpeta donde se van a guardar todos los resultados relacionados son el SPI.
    #   - SPI_gp_dir: Carpeta donde se van a guardar los SPI tanto Gamma como Pearson, crudos.
    #   - SPI_gamma_reord_dir: Carpeta donde se van a guardar los SPI gamma reordenados en time,lat,lon.
    #
    #   - Si la carpeta SPI no existe, se la crea.
    #   - Para las carpetas SPI_gamma_pearson y SPI_gamma_reord, en caso de que estas existan, al momento de ejecutar 
    #     el proceso, estas se borran y vuelven a crear vacias, y en caso de que no existan, solo se crean.

    concat_reord_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'input', 'concat_reord'))
    reord_file = os.path.join(concat_reord_dir, 'IMERG_reord_lat_fix.nc4')

    SPI_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'input', 'SPI'))

    if not os.path.exists(SPI_dir):
        os.makedirs(SPI_dir)
    sleep_for_a_bit(20)

    SPI_gp_dir = os.path.join(SPI_dir, 'SPI_gamma_pearson')

    if os.path.exists(SPI_gp_dir):
        shutil.rmtree(SPI_gp_dir)
        sleep_for_a_bit(20)
        os.makedirs(SPI_gp_dir)
    else:
        os.makedirs(SPI_gp_dir)
    sleep_for_a_bit(160)

    SPI_gamma_reord_dir = os.path.join(SPI_dir, 'SPI_gamma_reord')

    if os.path.exists(SPI_gamma_reord_dir):
        for file in os.listdir(SPI_gamma_reord_dir):
            file_path = os.path.join(SPI_gamma_reord_dir, file)
            try:
                with open(file_path, 'rb') as f:
                    f.read()

                # Renombrar el archivo para evitar bloqueos temporales
                temp_path = file_path + ".temp"
                os.rename(file_path, temp_path)

                # Eliminar el archivo renombrado
                os.remove(temp_path)
                print(f"Archivo eliminado: {file_path}")
                sleep_for_a_bit(100)
            except Exception as e:
                print(f"No se pudo eliminar el archivo {file_path}: {e}")
        shutil.rmtree(SPI_gamma_reord_dir)  # Elimina el directorio vacío
        os.makedirs(SPI_gamma_reord_dir)
    else:
        os.makedirs(SPI_gamma_reord_dir)
    sleep_for_a_bit(60)

    ###################################################################################################################################

    ## PASO 1: Proceso de calculo de SPI.
    #  1. Para determinar el final del año de calibracion, como primera medida obtenemos la fecha de actual, luego calculamos el primer 
    #     dia del proximo año, y restamos 1 al año, del primer dia del proximo año, para la comparacion. Por otro lado, calculamos el 
    #     tercer dia del proximo año, le restamos 1 al año, del tercer dia del proximo año, para la comparacion. Ahora bien, para la 
    #     asignacion del final del año de calibracion:
    #     - Si la fecha actual es mayor o igual al tercer dia del proximo año de la comparacion, se asigna el año del tercer dia de 
    #       comparacion.
    #     - Si la fecha actual es mayor o igual al primer dia del proximo año de la comparacion, y menor al tercer dia del proximo año 
    #       de comparacion, se asigna el año actual menos uno.
    #     - Caso contrario, se asigna el año actual.
    #  2. Luego, se ejecuta el comando del SPI, en funcion de sus parametros, lo que genera los archivos crudos del SPI en funcion de 
    #     Gamma y Pearson. Se ejecuta con "Popen" y el proceso espera hasta que finalice con "wait()".

    today_date = datetime.today()

    next_year_first_day = (today_date + relativedelta(years=1)).replace(day=1).replace(month=1)

    comparison_first_day = next_year_first_day - relativedelta(years=1)

    next_year_third_day = (today_date + relativedelta(years=1)).replace(day=3).replace(month=1)

    comparison_third_day = next_year_third_day - relativedelta(years=1)

    if today_date.date() >= comparison_third_day.date():
        calibration_end_year = comparison_third_day.year
    elif today_date.date() >= comparison_first_day.date() and today_date.date() < comparison_third_day.date():
        calibration_end_year = today_date.year - 1
        calibration_end_year = "dec"
    else:
        calibration_end_year = today_date.year

    spi_command = (
        f"spi --periodicity monthly --netcdf_precip {reord_file} "
        f"--var_name_precip precipitation "
        f"--output_file_base {os.path.join(SPI_gp_dir, 'nclimgrid')} "
        f"--scales 1 2 3 6 9 12 24 36 48 60 72 "
        f"--calibration_start_year 2000 "
        f"--calibration_end_year {calibration_end_year} "
        f"--multiprocessing all "
    )
    Popen(spi_command, shell=True).wait()

    ###################################################################################################################################

    ## PASO 2: Proceso de reordenamiento de las dimensiones time, lat, lon de los archivos "nclimgrid_gamma.nc4".  
    #  1. Se define una lista con las escalas del SPI que generamos en el paso anterior. Para cada escala se genera un archivo reordenado 
    #     mediante el comando "ncpdq". Este comando se ejecuta con "Popen" y el proceso espera hasta que finalice con "wait()".

    spi_scales = ['1', '2', '3', '6', '9', '12', '24', '36', '48', '60', '72']

    for scale in spi_scales:
        input_spi_file = os.path.join(SPI_gp_dir, f'nclimgrid_spi_gamma_{scale}_month.nc')
        output_spi_file = os.path.join(SPI_gamma_reord_dir, f'spi_gamma_{scale}_reord.nc4')
        
        reorder_command = f'ncpdq -a time,lat,lon {input_spi_file} {output_spi_file}'
        Popen(reorder_command, shell=True).wait()
        sleep_for_a_bit(20)

        print(f"Reordenamiento de dimensiones para escala SPI {scale} completado")







if __name__ == '__main__':
    spi_process()

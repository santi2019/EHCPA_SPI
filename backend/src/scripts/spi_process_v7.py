import os
import shutil
from subprocess import Popen
from datetime import datetime
from dateutil.relativedelta import relativedelta


def spi_process():

    # Carpeta donde se encuentra el archivo IMERG_reord
    EHCPA_SPI_input_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'input'))

    # Carpeta donde se van a guardar todos los archivos
    EHCPA_SPI_output_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'output'))

    # Carpeta donde se van a guardar los SPI crudos:
    output_spi_gp_dir = os.path.join(EHCPA_SPI_output_dir, 'SPI_gamma_pearson')

    # Si la carpeta existe:
    if os.path.exists(output_spi_gp_dir):
        # Borramos todo el contenido de la carpeta
        shutil.rmtree(output_spi_gp_dir)
        # Creamos de nuevo la carpeta vacía
        os.makedirs(output_spi_gp_dir)
    else:
        os.makedirs(output_spi_gp_dir)


    # Carpeta donde se van a guardar los SPI gamma reordenados con time,lat,lon:
    output_spi_greord_dir = os.path.join(EHCPA_SPI_output_dir, 'SPI_gamma_reord')

    # Si la carpeta existe:
    if os.path.exists(output_spi_greord_dir):
        # Borramos todo el contenido de la carpeta
        shutil.rmtree(output_spi_greord_dir)
        # Creamos de nuevo la carpeta vacía
        os.makedirs(output_spi_greord_dir)
    else:
        os.makedirs(output_spi_greord_dir)


    # Carpeta donde se van a guardar los parametros de ajuste
    output_fitting_dir = os.path.join(EHCPA_SPI_output_dir, 'Fitting')

    # Si la carpeta existe:
    if os.path.exists(output_fitting_dir):
        # Borramos todo el contenido de la carpeta
        shutil.rmtree(output_fitting_dir)
        # Creamos de nuevo la carpeta vacía
        os.makedirs(output_fitting_dir)
    else:
        os.makedirs(output_fitting_dir)


    # Archivo de entrada para el calculo del SPI
    reord_file = os.path.join(EHCPA_SPI_input_dir, 'IMERG_reord.nc4')


    ####################################################################################################################


    ## PASO 1: Proceso de calculo de SPI


    # Obtenemos la fecha de actual
    today_date = datetime.today()

    # Calculamos el primer dia del proximo año
    next_year_first_day = (today_date + relativedelta(years=1)).replace(day=1).replace(month=1)

    # Restamos 1 al año del primer dia del proximo año para la comparacion
    comparison_first_day = next_year_first_day - relativedelta(years=1)

    # Calculamos el tercer dia del proximo año
    next_year_third_day = (today_date + relativedelta(years=1)).replace(day=3).replace(month=1)

    # Restamos 1 al año del tercer dia del proximo año para la comparacion
    comparison_third_day = next_year_third_day - relativedelta(years=1)

    # Si la fecha actual es mayor o igual al tercer dia del proximo año de la comparacion, se asigna el año 
    # del tercer dia de comparacion, y el mes al que corresponda dicha fecha
    if today_date.date() >= comparison_third_day.date():
        calibration_end_year = comparison_third_day.year
        calibration_end_month = today_date.strftime('%b').lower()
    # Si la fecha actual es mayor o igual al primer dia del proximo año de la comparacion, y menor al tercer
    # dia del proximo año de comparacion, se asigna el año actual menos uno, y el mes de diciembre
    elif today_date.date() >= comparison_first_day.date() and today_date.date() < comparison_third_day.date():
        calibration_end_year = today_date.year - 1
        calibration_end_year = "dec"
    # Caso contrario se asigna el año y mes actual
    else:
        calibration_end_year = today_date.year
        calibration_end_month = today_date.strftime('%b').lower()


    spi_command = (
        f"spi --periodicity monthly --netcdf_precip {reord_file} "
        f"--var_name_precip precipitation "
        f"--output_file_base {os.path.join(output_spi_gp_dir, f'nclimgrid_jun_2000_{calibration_end_month}_{calibration_end_year}')} "
        f"--scales 1 2 3 6 9 12 24 36 48 60 72 "
        f"--calibration_start_year 2000 "
        f"--calibration_end_year {calibration_end_year} "
        f"--multiprocessing all "
        f"--save_params {os.path.join(output_fitting_dir, f'nclimgrid_jun_2000_{calibration_end_month}_{calibration_end_year}_fitting.nc')} "
        f"--overwrite"
    )
    Popen(spi_command, shell=True).wait()

    print("Calculo SPI completado")


    ####################################################################################################################


    ## PASO 2: Proceso de reordenamiento de las dimensiones time, lat, lon de los archivos nclimgrid_gamma  
    #          para poder visualizarlos correctamente en QGIS

    # Lista de escalas SPI a procesar:
    spi_scales = ['1', '2', '3', '6', '9', '12', '24', '36', '48', '60', '72']

    # Reordenamiento de las dimensiones para cada archivo de SPI generado
    for scale in spi_scales:
        input_spi_file = os.path.join(output_spi_gp_dir, f'nclimgrid_jun_2000_{calibration_end_month}_{calibration_end_year}_spi_gamma_{scale}_month.nc')
        output_spi_file = os.path.join(output_spi_greord_dir, f'spi_jun_2000_{calibration_end_month}_{calibration_end_year}_gamma_{scale}_reord.nc4')
        
        reorder_command = f'ncpdq -a time,lat,lon {input_spi_file} {output_spi_file}'
        Popen(reorder_command, shell=True).wait()

        print(f"Reordenamiento de dimensiones para escala SPI {scale} completado")


    print("El procesamiento se completó con exito")




if __name__ == '__main__':
    spi_process()
import os
import shutil
from subprocess import Popen

# Carpeta donde se encuentra el archivo IMERG_reord
EHCPA_SPI_input_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'input'))

# Carpeta donde se van a guardar todos los archivos
EHCPA_SPI_output_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'output'))

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

spi_command = (
    f"spi --periodicity monthly --netcdf_precip {reord_file} "
    f"--var_name_precip precipitation "
    f"--output_file_base {os.path.join(output_spi_gp_dir, 'nclimgrid')} "
    f"--scales 1 2 3 6 9 12 "
    f"--calibration_start_year 2000 "
    f"--calibration_end_year 2005 "
    f"--multiprocessing all "
    f"--save_params {os.path.join(output_fitting_dir, 'nclimgrid_fitting.nc')} "
    f"--overwrite"
)
Popen(spi_command, shell=True).wait()

print("Calculo SPI completado")


####################################################################################################################


## PASO 2: Proceso de reordenamiento de las dimensiones time, lat, lon de los archivos nclimgrid_gamma  
#          para poder visualizarlos correctamente en QGIS

# Lista de escalas SPI a procesar:
spi_scales = ['1', '2', '3', '6', '9', '12']

# Reordenamiento de las dimensiones para cada archivo de SPI generado
for scale in spi_scales:
    input_spi_file = os.path.join(output_spi_gp_dir, f'nclimgrid_spi_gamma_{scale}_month.nc')
    output_spi_file = os.path.join(output_spi_greord_dir, f'spi_gamma{scale}.nc4')
    
    reorder_command = f'ncpdq -a time,lat,lon {input_spi_file} {output_spi_file}'
    Popen(reorder_command, shell=True).wait()

    print(f"Reordenamiento de dimensiones para escala SPI {scale} completado")


print("El procesamiento se completó con exito")

import os
import platform
import shutil
from subprocess import Popen

# Carpeta donde se encuentran los acumulados mensuales
EHCPA_SPI_IMERG_late_month_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'IMERG_late_month'))

# Carpeta donde se van a guardar los archivos procesados concat, concat_reord y reord
EHCPA_SPI_input_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'input'))

# Si la carpeta existe:
if os.path.exists(EHCPA_SPI_input_dir):
    # Borramos todo el contenido de la carpeta
    shutil.rmtree(EHCPA_SPI_input_dir)
    # Creamos de nuevo la carpeta vacía
    os.makedirs(EHCPA_SPI_input_dir)
else:
    os.makedirs(EHCPA_SPI_input_dir)


# Carpeta donde se van a guardar el archivo de precipitacion
EHCPA_SPI_output_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'output', 'precip_max_mensual'))

# Si la carpeta existe:
if os.path.exists(EHCPA_SPI_output_dir):
    # Borramos todo el contenido de la carpeta
    shutil.rmtree(EHCPA_SPI_output_dir)
    # Creamos de nuevo la carpeta vacía
    os.makedirs(EHCPA_SPI_output_dir)
else:
    os.makedirs(EHCPA_SPI_output_dir)

# Lista de acumulados mensuales en la carpeta IMERG_late_month
files = [f for f in os.listdir(EHCPA_SPI_IMERG_late_month_dir) if f.endswith('.nc4')]


####################################################################################################################


## PASO 1: Proceso para hacer que la dimension "time", de los acumulados mensuales 
#          sea la variable/dimension registrada para concatenar los archivos

if platform.system() != "Windows":
    # Comando para macOS/Linux
    for fl in files:
        input_file = os.path.join(EHCPA_SPI_IMERG_late_month_dir, fl)
        command = f'ncks -O --mk_rec_dmn time {input_file} {input_file}'
        Popen(command, shell=True).wait()
else:
    # Comando para Windows
    for fl in files:
        input_file = os.path.join(EHCPA_SPI_IMERG_late_month_dir, fl)
        temp_file = os.path.join(EHCPA_SPI_IMERG_late_month_dir, fl + '.TMP')
        
        # Primer comando: Crear archivo temporal
        command1 = f'ncks --mk_rec_dmn time {input_file} -o {temp_file}'
        Popen(command1, shell=True).wait()
        
        # Segundo comando: Mover archivo temporal al original
        command2 = f'move {temp_file} {input_file}'
        Popen(command2, shell=True).wait()

print("Procesamiento de acumulados mensuales completado")


####################################################################################################################


## PASO 2: Proceso de concatenacion de los acumulados mensuales

if platform.system() != "Windows":
    # Comando para macOS/Linux
    concat_file = os.path.join(EHCPA_SPI_input_dir, 'IMERG_concat.nc4')
    command_concat = f'ncrcat -h {os.path.join(EHCPA_SPI_IMERG_late_month_dir, "*.nc4")} {concat_file}'
    Popen(command_concat, shell=True).wait()
else:
    # Comando para Windows
    files_list = ' '.join([os.path.join(EHCPA_SPI_IMERG_late_month_dir, f) for f in files])
    concat_file = os.path.join(EHCPA_SPI_input_dir, 'IMERG_concat.nc4')
    command_concat = f'ncrcat -h {files_list} {concat_file}'
    Popen(command_concat, shell=True).wait()

print("Concatenacion completada")


####################################################################################################################


## PASO 3: Proceso de reordenamiento de dimensiones lat, lon, time sobre archivo IMER_concat

concat_reord_file = os.path.join(EHCPA_SPI_input_dir, 'IMERG_concat_reord.nc4')
command_reorder = f'ncpdq -a lat,lon,time {concat_file} {concat_reord_file}'
Popen(command_reorder, shell=True).wait()

print("Reordenamiento completado")


####################################################################################################################


## PASO 4: Proceso de correccion de la dimension lat en archivo IMERG_concat_reord

fixed_file = os.path.join(EHCPA_SPI_input_dir, 'outfixed.nc4')
reord_file = os.path.join(EHCPA_SPI_input_dir, 'IMERG_reord.nc4')
command_fix_rec_dmn = f'ncks --fix_rec_dmn lat {concat_reord_file} -o {fixed_file}'
Popen(command_fix_rec_dmn, shell=True).wait()

# Mover el archivo corregido al nombre final
if platform.system() != "Windows":
    os.rename(fixed_file, reord_file)
else:
    move_command = f'move {fixed_file} {reord_file}'
    Popen(move_command, shell=True).wait()

print("Correccion de la dimension 'lat' completada")


####################################################################################################################


## PASO 5: Proceso de reordenamiento de las dimensiones time, lat, lon del archivo IMERG_reord  
#          para obtener archivo de precipitaciones maximas

IMERG_precip_file = os.path.join(EHCPA_SPI_output_dir, 'IMERG_precip_2000_2005.nc4')
command_final_reorder = f'ncpdq -a time,lat,lon {reord_file} {IMERG_precip_file}'
Popen(command_final_reorder, shell=True).wait()

print("Reordenamiento para precipitaciones maximas completado")


print("El procesamiento se completó con exito")

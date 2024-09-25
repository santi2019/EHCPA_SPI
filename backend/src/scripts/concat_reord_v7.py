import os
import platform
import shutil
from subprocess import Popen
import math
from datetime import datetime
from dateutil.relativedelta import relativedelta

def concat_reord():
    
    ## Distribucion de carpetas/directorios:
    #
    #   - IMERG_late_month_dir: Carpeta donde se encuentran los acumulados mensuales.
    #   - input: Carpeta donde se guardan todos los archivos utilizados para el procesamiento.
    #   - concat_reord_dir: Carpeta donde se van a guardar los archivos procesados IMERG_concat_chunk_N, IMER_concat, 
    #     IMER_reord e IMERG_reord_lat_fix.  
    #   - PTM_dir: Carpeta donde se van a guardar todos los resultados relkacionados con la precipitacion total mensual.
    #
    #   - Si la carpeta input no existe, se la crea.
    #   - Para las carpetas concat_reord y PTM, en caso de que estas existan, al momento de ejecutar el proceso, 
    #     estas se borran y vuelven a crear vacias, y en caso de que no existan, solo se crean.
    #   - Almacenamos en una variable "file", todos los acumulados mensuales, iterando sobre la carpeta IMERG_late_month.

    IMERG_late_month_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'IMERG_late_month'))

    input_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'input'))

    if not os.path.exists(input_dir):
        os.makedirs(input_dir)

    concat_reord_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'input', 'concat_reord'))

    if os.path.exists(concat_reord_dir):
        shutil.rmtree(concat_reord_dir)
        os.makedirs(concat_reord_dir)
    else:
        os.makedirs(concat_reord_dir)

    PTM_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'input', 'PTM'))

    if os.path.exists(PTM_dir):
        shutil.rmtree(PTM_dir)
        os.makedirs(PTM_dir)
    else:
        os.makedirs(PTM_dir)


    files = [f for f in os.listdir(IMERG_late_month_dir) if f.endswith('.nc4')]

    ####################################################################################################################

    ## PASO 1: Proceso para hacer que la dimension "time", de los acumulados mensuales, sea la variable/dimension 
    #          registrada o fija, para concatenar los archivos.
    #          - Para macOS/Linux: Se itera sobre la variable "file", guardando la ruta de cada uno de los acumulados 
    #            mensuales, y se la aplica al comando de "ncks", en donde modifica la variable "time". Con el parametro 
    #            "-O" se sobreescribe el archivo original con el modificado. Y a traves de "popen" indicamos que el comando 
    #            se ejecuta como si estuviese en la terminal, y con "wait" se espera a que el proceso termine antes de 
    #            continuar con el siguiente archivo.
    #          - Para Windows: Se itera sobre la variable "file", guardando la ruta de cada uno de los acumulados 
    #            mensuales, y se la aplica al comando de "ncks", en donde modifica la variable "time", pero en este caso 
    #            se crea un archivo temporal, y los resultados del archivo original modificado se escriben en el temporal.
    #            Una vez que el temporal esta listo, se reemplaza el archivo original con el temporal modificado. A traves 
    #            de "popen" indicamos que el comando se ejecuta como si estuviese en la terminal, y con "wait" se espera a 
    #            que el proceso termine antes de continuar con el siguiente archivo.

    if platform.system() != "Windows":
        for fl in files:
            input_file = os.path.join(IMERG_late_month_dir, fl)
            command = f'ncks -O --mk_rec_dmn time {input_file} {input_file}'
            Popen(command, shell=True).wait()
    else:
        for fl in files:
            input_file = os.path.join(IMERG_late_month_dir, fl)
            temp_file = os.path.join(IMERG_late_month_dir, fl + '.TMP')
            
            command1 = f'ncks --mk_rec_dmn time {input_file} -o {temp_file}'
            Popen(command1, shell=True).wait()
            
            command2 = f'move {temp_file} {input_file}'
            Popen(command2, shell=True).wait()

    ####################################################################################################################

    ## PASO 2: Proceso de concatenacion de los acumulados mensuales, es decir, agrupar todos los archivos en uno unico.
    #          - Para macOS/Linux: Primero definimos la ruta y el nombre del archivo concatenado, luego, a traves del
    #            comando "ncrcat", concatenamos todos los archivos del directorio IMERG_late_month mediante "*", y se le
    #            asigna el nombre y ruta definidos anteriormente. A traves de "popen" indicamos que el comando se ejecuta 
    #            como si estuviese en la terminal, y con "wait" se espera a que el proceso termine antes de continuar.
    #          - Para Windows: En este caso dividimos la concatenacion en bloques mas pequeños (en este caso de a 50 
    #                          archivos). Se itera sobre cada bloque o chuck de archivos, en donde para cada bloque, se 
    #                          define un path de salida con el nombre "IMERG_concat_chunk_{i}.nc4", donde {i} es el indice 
    #                          del bloque. A traves del comando "ncrcat", concatenamos todos los archivos dentro de cada 
    #                          bloque mediante "*", y el resultado de la concatenacion por bloque se almacena en un archivo 
    #                          temporal. A su vez ,todos los archivos temporales correspondientes a cada bloque, se van
    #                          agregando a un arreglo que definimos previamente. Una vez que se han concatenado todos los 
    #                          archivos en bloques, se procede a concatenar los archivos resultantes de cada bloque, en un 
    #                          solo archivo final, y para esto utilizamos nuevamente el comando "ncrcat" para concatenar
    #                          lista de archivos de bloques concatenados "chunked_files". Finalmente, a traves de "popen" 
    #                          indicamos que el comando se ejecuta como si estuviese en la terminal, y con "wait" se espera 
    #                          a que el proceso termine antes de continuar.          

    if platform.system() != "Windows":
        concat_file = os.path.join(concat_reord_dir, 'IMERG_concat.nc4')
        command_concat = f'ncrcat -h {os.path.join(IMERG_late_month_dir, "*.nc4")} {concat_file}'
        Popen(command_concat, shell=True).wait()
    else:
        chunk_size = 50  
        num_chunks = math.ceil(len(files) / chunk_size)
        chunked_files = []

        for i in range(num_chunks):
            chunk = files[i * chunk_size:(i + 1) * chunk_size]
            chunk_output = os.path.join(concat_reord_dir, f"IMERG_concat_chunk_{i}.nc4")
            chunked_files.append(chunk_output)
            files_list = ' '.join([os.path.join(IMERG_late_month_dir, f) for f in chunk])
            command_concat_chunk = f'ncrcat -h {files_list} {chunk_output}'
            Popen(command_concat_chunk, shell=True).wait()

        final_concat_file = os.path.join(concat_reord_dir, 'IMERG_concat.nc4')
        chunked_files_list = ' '.join(chunked_files)
        command_concat_final = f'ncrcat -h {chunked_files_list} {final_concat_file}'
        Popen(command_concat_final, shell=True).wait()

    ####################################################################################################################

    ## PASO 3: Proceso de reordenamiento de dimensiones lat, lon, time sobre archivo "IMER_concat".
    #          - Utilizamos el comando "ncpdq", y a traves de "popen" indicamos que el comando se ejecuta como si estuviese 
    #            en la terminal, y con "wait" se espera a que el proceso termine antes de continuar. Finalmente el archivo
    #            se guarda con el nombre de "IMERG_reord.nc4".        
    
    reord_file = os.path.join(concat_reord_dir, 'IMERG_reord.nc4')
    command_reorder = f'ncpdq -a lat,lon,time {final_concat_file} {reord_file}'
    Popen(command_reorder, shell=True).wait()

    ####################################################################################################################

    ## PASO 4: Proceso de correccion de la dimension lat en archivo "IMERG_reord".
    #          - El procedimiento es el mismo tanto para Windows como para macOS/Linux, por lo que a traves del comando
    #            "ncks" se guarda el archivo "IMERG_reord.nc4" con la variable lat corrgida, en un archivo auxiliar. A 
    #            traves de "popen" indicamos que el comando se ejecuta como si estuviese en la terminal, y con "wait" se 
    #            espera a que el proceso termine antes de continuar. Finalmente se renombra el archivo temporal como
    #            "IMERG_reord_lat_fix.nc4".

    reord_fixed_file = os.path.join(concat_reord_dir, 'IMERG_reord_lat_fix.nc4')
    temp_fixed_file = os.path.join(concat_reord_dir, 'reord_fixed.nc4')
    command_fix_rec_dmn = f'ncks --fix_rec_dmn lat {reord_file} -o {temp_fixed_file}'
    Popen(command_fix_rec_dmn, shell=True).wait()

    if platform.system() != "Windows":
        os.rename(temp_fixed_file, reord_fixed_file)
    else:
        move_command = f'move {temp_fixed_file} {reord_fixed_file}'
        Popen(move_command, shell=True).wait()

    ####################################################################################################################

    ## PASO 5: Proceso de reordenamiento de las dimensiones time, lat, lon del archivo "IMERG_reord_lat_fix.nc4" para
    #          obtener el archivo de precipitaciones totales mensuales (PTM). Utilizamos el comando ncpdq, y a traves 
    #          de "popen" indicamos que el comando se ejecuta como si estuviese en la terminal, y con "wait" se espera a
    #          que el proceso termine antes de continuar. Finalmente el archivo se guarda con el nombre de "PTM.nc4".        
    
    IMERG_precip_file = os.path.join(PTM_dir, 'PTM.nc4')
    command_final_reorder = f'ncpdq -a time,lat,lon {reord_fixed_file} {IMERG_precip_file}'
    Popen(command_final_reorder, shell=True).wait()





if __name__ == '__main__':
    concat_reord()

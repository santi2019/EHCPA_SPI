import os
import pandas as pd
import numpy as pn
import requests
import xarray as xr
import shutil
import urllib.parse



# Indicamos la ruta del archivo subset
subset_file = 'D:/Santiago/Documentos/EHCPA_SPI/subset.txt'

if not os.path.exists(subset_file):
    print("Error: No se encontró el archivo subset.txt en la ruta especificada")
    exit()

# Carpeta de destino donde se guardaran los archivos descargados
destination_folder = 'D:/Santiago/Documentos/EHCPA_SPI/ARG_Late'

# Si la carpeta de destino existe y posee datos, la borramos y volvemos a crear en cada ocacion
if os.path.exists(destination_folder):
    shutil.rmtree(destination_folder)
os.makedirs(destination_folder)

 # Vemos la cantidad de archivos dentro del subset
df = pd.read_csv(subset_file, header=None)[0]
total_files = len(df)
print("Total de archivos en subset.txt:", total_files)

files_needed = total_files - 2
print("Total de archivos a descargar:", files_needed)

# Contador de archivos descargados
files_downloaded = 0

try:
    # Abrimos el archivo subset.txt en modo de lectura
    with open(subset_file, 'r') as file:

        lines = file.readlines()[2:]

        # Iteramos sobre cada linea en el archivo
        for line in lines:
            
            # Eliminamos los espacios en blanco al inicio y al final de cada linea
            url = line.strip()

            try:
                # Realizamos la solicitud GET para descargar el archivo
                result = requests.get(url)

                # Verificamos si la solicitud fue exitosa
                result.raise_for_status()

                # Parseamos la URL
                parsed_url = urllib.parse.urlparse(url)

                # Obtenemos los parametros de la URL
                query_params = urllib.parse.parse_qs(parsed_url.query)

                # Extraemos el valor asociado al parametro LABEL (nombre del archivo)
                label_value = query_params.get('LABEL', [None])[0]

                # Extraemos el nombre del archivo de la URL
                filename = label_value.split('=')[-1]

                # Guardamos el contenido descargado en la carpeta destino
                file_path = os.path.join(destination_folder, filename)

                with open(file_path, 'wb') as f:
                    f.write(result.content)
                print('Archivo descargado correctamente:', filename)
                files_downloaded += 1
            except requests.exceptions.RequestException as e:
                # Mostramos un mensaje de error, si se produjo alguno durante la descarga
                print('Error al descargar el archivo:', e)

    if files_downloaded == files_needed:
        print("La descarga ha finalizado correctamente")
    else:
        print("La descarga ha finalizado con errores")
except KeyboardInterrupt:
    print('La descarga ha sido cancelada')
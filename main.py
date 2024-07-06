import os
import pandas as pd
import numpy as np
import requests
import xarray as xr
import shutil
import urllib.parse
from subprocess import Popen
import platform
import time


class SPICalculationProcess:

    def credentials_generator(self):
            urs = 'urs.earthdata.nasa.gov'    # Earthdata URL to call for authentication
            print('Autenticacion en NASA Earthdata')
            prompts = ['Username: ', 'Password: ']

            homeDir = os.path.expanduser("~") + os.sep

            with open(homeDir + '.netrc', 'w') as file:
                username = input(prompts[0])
                password = input(prompts[1])
                file.write('machine {} login {} password {}\n'.format(urs, username, password))
                
            with open(homeDir + '.urs_cookies', 'w') as file:
                file.write('')
                
            with open(homeDir + '.dodsrc', 'w') as file:
                file.write('HTTP.COOKIEJAR={}.urs_cookies\n'.format(homeDir))
                file.write('HTTP.NETRC={}.netrc'.format(homeDir))

            print('Saved .netrc, .urs_cookies, and .dodsrc to:', homeDir)

            if platform.system() != "Windows":
                Popen('chmod og-rw ~/.netrc', shell=True)
            else:
                shutil.copy2(homeDir + '.dodsrc', os.getcwd())
                print('Copied .dodsrc to:', os.getcwd())
            
            self.download_subset()



    def download_subset(self):
        subset_file = 'C:/Users/Santiago/EHCPA_SPI/subset.txt'
        destination_folder = 'C:/Users/Santiago/EHCPA_SPI/ARG_Late'

        if not os.path.exists(subset_file):
            print("Error: No se encontró el archivo subset.txt en la ruta especificada")
            return

        if os.path.exists(destination_folder):
            shutil.rmtree(destination_folder)
        os.makedirs(destination_folder)

        df = pd.read_csv(subset_file, header=None)[0]
        total_files = len(df)
        print("Total de archivos en subset.txt:", total_files)

        files_needed = total_files - 2
        print("Total de archivos a descargar:", files_needed)

        files_downloaded = 0

        try:
            with open(subset_file, 'r') as file:
                lines = file.readlines()[2:]

                for line in lines:
                    url = line.strip()

                    try:
                        result = requests.get(url)
                        result.raise_for_status()

                        parsed_url = urllib.parse.urlparse(url)
                        query_params = urllib.parse.parse_qs(parsed_url.query)
                        label_value = query_params.get('LABEL', [None])[0]
                        filename = label_value.split('=')[-1]
                        file_path = os.path.join(destination_folder, filename)

                        with open(file_path, 'wb') as f:
                            f.write(result.content)
                        print('Archivo descargado correctamente:', filename)
                        files_downloaded += 1
                    except requests.exceptions.RequestException as e:
                        print('Error al descargar el archivo:', e)

            if files_downloaded == files_needed:
                print("La descarga ha finalizado correctamente")
            else:
                print("La descarga ha finalizado con errores")
        except KeyboardInterrupt:
            print('La descarga ha sido cancelada')
        
        wait_time = 30
        for i in range(wait_time):
            print(f"Esperando {wait_time - i} segundos antes de calcular los valores de presipitacion acumulada", end='\r')
            time.sleep(1) 
        
        print()
        self.process_IMERGE()



    def process_IMERGE(self):
        # Directorio donde se encuentran los archivos de IMERG
        input_dir = 'C:/Users/Santiago/EHCPA_SPI/ARG_Late'

        # Directorio donde se guardarán los archivos de acumulado mensual
        output_dir = 'C:/Users/Santiago/EHCPA_SPI/IMERG_late_month'

        # Si la carpeta de destino no existe, la creamos
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Lista de archivos de IMERG en el directorio de entrada
        files = os.listdir(input_dir)

        # Calcular la cantidad de archivos en el directorio ARG_Late
        num_files = len(files)
        print("Cantidad de archivos en el directorio ARG_Late:", num_files)

        # Filtrar archivos de IMERG que contienen la cadena "IMERG"
        files = [f for f in files if 'IMERG' in f]

        try:
            for file in files:
                # Abrir el archivo de IMERG
                ds = xr.open_dataset(os.path.join(input_dir, file))

                # Extraer el año y el mes del archivo de IMERG
                year = str(ds.time.dt.year.values[0])
                month = str(ds.time.dt.month.values[0]).zfill(2)

                # Concatenar los archivos diarios correspondientes al mes
                daily_files = [f for f in files if year+month in f]
                ds_month = xr.open_mfdataset([os.path.join(input_dir, f) for f in daily_files], combine='by_coords')

                # Calcular el acumulado mensual de precipitación
                monthly_precip = ds_month['precipitationCal'].sum(dim='time')
                
                # Agregar atributos a la variable mensual de precipitación
                monthly_precip.attrs['long_name'] = 'Monthly accumulated precipitation (combined microwave-IR) estimate'
                monthly_precip.attrs['units'] = 'mm'
                monthly_precip.attrs['_FillValue'] = -9999.9
                monthly_precip.attrs['missing_value'] = -9999.9

                # Reordenar las dimensiones y agregar la dimensión de tiempo
                monthly_precip = monthly_precip.expand_dims(dim='time')
                monthly_precip = monthly_precip.transpose('time', 'lon', 'lat')

                # Crear una variable de tiempo y agregarla al conjunto de datos
                time_var = pd.date_range(start=f'{year}-{month}-01', periods=1, freq='MS')
                ds_out = xr.Dataset({'precipitation': monthly_precip}, coords={'time': time_var, 'lon': monthly_precip.lon, 'lat': monthly_precip.lat})

                # Guardar el archivo de acumulado mensual en el directorio de salida
                output_file = os.path.join(output_dir, f'IMERG_monthly_accumulated_precip_{year}_{month}.nc4')
                ds_out.to_netcdf(output_file)

            print("El procesamiento se completó con exito")

        except KeyboardInterrupt:
            print('El procesamiento fue cancelado')




if __name__ == "__main__":
    spi_instance = SPICalculationProcess()
    spi_instance.credentials_generator()



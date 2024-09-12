import os
import shutil
import platform
import xarray as xr
import rioxarray
import numpy as np
import fiona
import rasterio
import rasterio.mask
from datetime import datetime
from dateutil.relativedelta import relativedelta

def ptm_convertion_and_crop():
    
    ## Distribucion de carpetas/directorios:
    #
    #   - input_PTM_dir: Carpeta donde se encuentra el archivo PTM en formato netCDF.
    #   - ARG_ShapeFiles_dir: Carpeta donde se encuentra el archivo shape de Argentina para realizar el corte.
    #   - output_dir: Carpeta donde se guardan todos los archivos resultantes.
    #   - downloable_data_dir: Carpeta donde se guardan todos los archivos resultantes de PTM y SPI para ser descargados.
    #   - downloable_data_PTM_dir: Carpeta donde se va a guardar el archivo PTM cortado con todas las bandas, para poder 
    #     descargarse.
    #   - geoserver_EHCPA_dir: Carpeta dentro del programa GeoServer donde se van a guardar todos los archivos PTM y SPI 
    #     para poder ser subidos al servidor del mismo.
    #   - geoserver_PTM_dir: Carpeta dentro del programa GeoServer donde se va a guardar el archivo PTM cortado con la 
    #     ultima banda, para poder ser subido al servidor.
    #
    #   - Si las carpetas output_dir, downloable_data_dir y geoserver_EHCPA_dir no existen, se crean.
    #   - Para las carpetas downloable_data_PTM_dir y geoserver_PTM_dir, en caso de que estas existan, al momento de 
    #     ejecutar el proceso, estas se borran y vuelven a crear vacias, y en caso de que no existan, solo se crean.

    input_PTM_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'input', 'PTM'))
    PTM_nc4_file = os.path.join(input_PTM_dir, 'PTM.nc4')

    ARG_ShapeFiles_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'ARG_ShapeFiles'))
    shp_file = os.path.join(ARG_ShapeFiles_dir, 'Argentina.shp')

    output_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'output'))

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    downloable_data_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'output', 'downloable_data'))

    if not os.path.exists(downloable_data_dir):
        os.makedirs(downloable_data_dir)
        
    downloable_data_PTM_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'output', 'downloable_data', 'PTM'))

    if os.path.exists(downloable_data_PTM_dir):
        shutil.rmtree(downloable_data_PTM_dir)
        os.makedirs(downloable_data_PTM_dir)
    else:
        os.makedirs(downloable_data_PTM_dir)


    if platform.system() != "Windows":
        geoserver_EHCPA_dir = os.path.join('/usr', 'local', 'GeoServer', 'data', 'EHCPA')

        if not os.path.exists(geoserver_EHCPA_dir):
            os.makedirs(geoserver_EHCPA_dir)

        geoserver_PTM_dir = os.path.join(geoserver_EHCPA_dir, 'PTM')

        if os.path.exists(geoserver_PTM_dir):
            shutil.rmtree(geoserver_PTM_dir)
            os.makedirs(geoserver_PTM_dir)
        else:
            os.makedirs(geoserver_PTM_dir)
    else:
        geoserver_EHCPA_dir = os.path.join('C:\\', 'ProgramData', 'GeoServer', 'data', 'EHCPA')

        if not os.path.exists(geoserver_EHCPA_dir):
            os.makedirs(geoserver_EHCPA_dir)

        geoserver_PTM_dir =   os.path.join(geoserver_EHCPA_dir, 'PTM')

        if os.path.exists(geoserver_PTM_dir):
            shutil.rmtree(geoserver_PTM_dir)
            os.makedirs(geoserver_PTM_dir)
        else:
            os.makedirs(geoserver_PTM_dir)

    ####################################################################################################################

    ## PASO 1: Proceso de conversion de archivo "PTM" en formato netCDF a GeoTiff, generando dos archivos, uno que incluya 
    #          todas las bandas para ser descargado, y otro con solo la ultima banda para su implementacion en GeoServer.
    #          - Inicializamos el archivo PTM, seleccionamos la variable de interes que es "precipitation". Para el caso 
    #            del archivo tif con todas las bandas, unicamente se configuran las dimensiones espaciales y se aplica el 
    #            CRS (sistema de referencia de coordenadas). Y para el archivo tif de la ultima banda, es lo mismo solo 
    #            que seleccionamos justamente la ultima banda a traves de "isel". 

    nc_PTM_file = xr.open_dataset(PTM_nc4_file)

    pr = nc_PTM_file['precipitation']

    pr_all_bands = pr.rio.set_spatial_dims('lon', 'lat')
    pr_all_bands.rio.write_crs("epsg:4326", inplace=True)

    pr_last_band = pr.isel(time=-1)

    pr_last_band = pr_last_band.rio.set_spatial_dims('lon', 'lat')
    pr_last_band.rio.write_crs("epsg:4326", inplace=True)


    ####################################################################################################################

    ## PASO 2: Proceso de corte de ambos archivos tif generados, sobre el archivo shape de Argentina.
    #          - Se abre el shapefile que contiene el contorno de Argentina. Ahora, para asignar el mes y año de 
    #            calibracion del PTM de todas las bandas, obtenemos la fecha de actual, luego calculamos el primer 
    #            dia del proximo año, y restamos 1 al año, del primer dia del proximo año, para la comparacion. Por 
    #            otro lado, calculamos el tercer dia del proximo año, le restamos 1 al año, del tercer dia del proximo 
    #            año, para la comparacion. Ahora bien, para la asignacion del final del año de calibracion:
    #            - Si la fecha actual es mayor o igual al tercer dia del proximo año de la comparacion, se asigna el 
    #              año del tercer dia de comparacion.
    #            - Si la fecha actual es mayor o igual al primer dia del proximo año de la comparacion, y menor al 
    #              tercer dia del proximo año de comparacion, se asigna el año actual menos uno.
    #            - Caso contrario se asigna el año.
    #          -  Finalmente hacemos el corte espacial en ambos archivos. Para ambos casos se recortan utilizando el 
    #             contorno geografico de Argentina y se almacenan en las variables "pr_cropped_...", luego se define
    #             el nombre y la ubicacion de donde seran guardados ambos archivos, y por utlimo los archivos tif
    #             cortados se guardan en la ruta especificada. 

    with fiona.open(shp_file, "r") as shapefile:
        shapes = [feature["geometry"] for feature in shapefile]
    

    today_date = datetime.today()

    next_year_first_day = (today_date + relativedelta(years=1)).replace(day=1).replace(month=1)

    comparison_first_day = next_year_first_day - relativedelta(years=1)

    next_year_third_day = (today_date + relativedelta(years=1)).replace(day=3).replace(month=1)

    comparison_third_day = next_year_third_day - relativedelta(years=1)

    if today_date.date() >= comparison_third_day.date():
        calibration_end_year = comparison_third_day.year
        calibration_end_month = today_date.strftime('%b').lower()
    elif today_date.date() >= comparison_first_day.date() and today_date.date() < comparison_third_day.date():
        calibration_end_year = today_date.year - 1
        calibration_end_year = "dec"
    else:
        calibration_end_year = today_date.year
        calibration_end_month = today_date.strftime('%b').lower()


    pr_cropped_all_bands = pr_all_bands.rio.clip(shapes, pr.rio.crs)
    PTM_all_bands_cropped_tif = os.path.join(downloable_data_PTM_dir, f'PTM_jun_2000_{calibration_end_month}_{calibration_end_year}_all_bands_ARG_cropped.tif')
    pr_cropped_all_bands.rio.to_raster(PTM_all_bands_cropped_tif)


    pr_cropped_last_band = pr_last_band.rio.clip(shapes, pr.rio.crs)
    PTM_last_band_cropped_tif = os.path.join(geoserver_PTM_dir, f'PTM_jun_2000_present_last_band_ARG_cropped.tif')
    pr_cropped_last_band.rio.to_raster(PTM_last_band_cropped_tif)



    print("La conversión y recorte de PTM se completó con éxito")


if __name__ == '__main__':
    ptm_convertion_and_crop()

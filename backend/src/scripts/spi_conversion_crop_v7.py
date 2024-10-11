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

try:
    from get_dates_v7 import get_calibration_date 
except ModuleNotFoundError:
    from src.scripts.get_dates_v7 import get_calibration_date


def spi_convertion_and_crop():

    ## Distribucion de carpetas/directorios:
    #
    #   - SPI_gamma_reord_dir: Carpeta donde se encuentran todos los archivos SPI reordenados en formato netCDF.
    #   - ARG_ShapeFiles_dir: Carpeta donde se encuentra el archivo shape de Argentina para realizar el corte.
    #   - output_dir: Carpeta donde se guardan todos los archivos resultantes.
    #   - downloable_data_dir: Carpeta donde se guardan todos los archivos resultantes de PTM y SPI para ser descargados.
    #   - downloable_data_SPI_dir: Carpeta donde se van a guardar todos los archivo SPI cortados con todas las bandas, 
    #     para poder descargarse.
    #   - geoserver_EHCPA_dir: Carpeta dentro del programa GeoServer donde se van a guardar todos los archivos PTM y SPI 
    #     para poder ser subidos al servidor de GeoServer.
    #   - geoserver_SPI_dir: Carpeta donde se van a guardar todos los archivos SPI cortados con la ultima banda, para 
    #     poder ser subidos al servidor de GeoServer.
    #
    #   - Si la carpeta output, downloable_data y geoserver_EHCPA_dir no existen, se crean.
    #   - Para las carpetas downloable_data_SPI_dir y geoserver_SPI_dir, en caso de que estas existan, al momento de 
    #     ejecutar el proceso, estas se borran y vuelven a crear vacias, y en caso de que no existan, solo se crean.

    SPI_gamma_reord_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'input', 'SPI', 'SPI_gamma_reord'))

    ARG_ShapeFiles_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'ShapeFiles', 'Argentina'))
    shp_file = os.path.join(ARG_ShapeFiles_dir, 'Argentina.shp')

    output_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'output'))

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    downloable_data_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'output', 'downloable_data'))

    if not os.path.exists(downloable_data_dir):
        os.makedirs(downloable_data_dir)

    downloable_data_SPI_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'output', 'downloable_data', 'SPI'))

    if os.path.exists(downloable_data_SPI_dir):
        shutil.rmtree(downloable_data_SPI_dir)
        os.makedirs(downloable_data_SPI_dir)
    else:
        os.makedirs(downloable_data_SPI_dir)

    geoserver_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'output', 'geoserver'))

    if not os.path.exists(geoserver_dir):
        os.makedirs(geoserver_dir)
    
    geoserver_SPI_dir = os.path.join(geoserver_dir, 'SPI')

    if os.path.exists(geoserver_SPI_dir):
        shutil.rmtree(geoserver_SPI_dir)
        os.makedirs(geoserver_SPI_dir)
    else:
        os.makedirs(geoserver_SPI_dir)

    ####################################################################################################################

    ## PASO 1: Proceso de conversion de archivos "SPI" en formato netCDF a GeoTiff, generando dos archivos, uno que incluya 
    #          todas las bandas para ser descargado, y otro con solo la ultima banda para su implementacion en GeoServer.
    #          - Inicializamos los archivos SPI a traves de un bucle ya que debemos seleccionar todos y los identificamos
    #            a traves de las escalas. Para todas las escalas seleccionamos la variable de interes que es 
    #            "spi_gamma_{scale}_month". Para el caso del archivo tif con todas las bandas, unicamente se configuran
    #            las dimensiones espaciales y se aplica el CRS (sistema de referencia de coordenadas). Y para el archivo 
    #            tif de la ultima banda, es lo mismo solo que seleccionamos justamente la ultima banda a traves de "isel". 

    spi_scales = ['1', '2', '3', '6', '9', '12', '24', '36', '48', '60', '72']
    
    for scale in spi_scales:
        spi_nc_file = os.path.join(SPI_gamma_reord_dir, f'spi_gamma_{scale}_reord.nc4')
        
        # Abrir el archivo NetCDF de SPI
        nc_spi_file = xr.open_dataset(spi_nc_file)
        spi_data = nc_spi_file[f'spi_gamma_{scale}_month'] 

        # Configurar las dimensiones espaciales y el CRS
        spi_all_bands = spi_data.rio.set_spatial_dims('lon', 'lat')
        spi_all_bands.rio.write_crs("epsg:4326", inplace=True)

        spi_last_band = spi_data.isel(time=-1)
        spi_last_band = spi_last_band.rio.set_spatial_dims('lon', 'lat')
        spi_last_band.rio.write_crs("epsg:4326", inplace=True)

    ####################################################################################################################

    ## PASO 2: Proceso de corte de ambos archivos tif generados, sobre el archivo shape de Argentina.
    #          - Se abre el shapefile que contiene el contorno de Argentina. Ahora, para asignar el mes y año de 
    #            calibracion del SPI de todas las bandas, extraemos dichos valores de la funcion "get_calibration_date()". 
    #            Por otro lado, calculamos el tercer dia del proximo año, le restamos 1 al año, del tercer dia del proximo 
    #            año, para la comparacion. Ahora bien, para la asignacion del final del año de calibracion:
    #            - Si la fecha actual es mayor o igual al tercer dia del proximo año de la comparacion, se asigna el 
    #              año del tercer dia de comparacion.
    #            - Si la fecha actual es mayor o igual al primer dia del proximo año de la comparacion, y menor al 
    #              tercer dia del proximo año de comparacion, se asigna el año actual menos uno.
    #            - Caso contrario se asigna el año.
    #          -  Finalmente hacemos el corte espacial en ambos archivos. Para ambos casos se recortan utilizando el 
    #             contorno geografico de Argentina y se almacenan en las variables "spi_cropped_...", luego se define
    #             el nombre y la ubicacion de donde seran guardados ambos archivos, y por utlimo los archivos tif
    #             cortados se guardan en la ruta especificada. 

        with fiona.open(shp_file, "r") as shapefile:
            shapes = [feature["geometry"] for feature in shapefile]

        calibration_end_year, calibration_end_month = get_calibration_date()

        spi_cropped_all_bands = spi_all_bands.rio.clip(shapes, spi_data.rio.crs)
        SPI_all_bands_cropped_tif = os.path.join(downloable_data_SPI_dir, f'SPI_jun_2000_{calibration_end_month}_{calibration_end_year}_scale_{scale}_all_bands_ARG_cropped.tif')
        spi_cropped_all_bands.rio.to_raster(SPI_all_bands_cropped_tif)

        spi_cropped_last_band = spi_last_band.rio.clip(shapes, spi_data.rio.crs)
        SPI_last_band_cropped_tif = os.path.join(geoserver_SPI_dir, f'SPI_jun_2000_present_scale_{scale}_last_band_ARG_cropped.tif')
        spi_cropped_last_band.rio.to_raster(SPI_last_band_cropped_tif)

        print(f"Conversión y recorte completados para escala SPI {scale}")



if __name__ == '__main__':
    spi_convertion_and_crop()

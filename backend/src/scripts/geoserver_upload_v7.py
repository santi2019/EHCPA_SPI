import os
import requests
from dotenv import load_dotenv
from requests.auth import HTTPBasicAuth
from geo.Geoserver import Geoserver, GeoserverException  

def geoserver_upload():

    ## Distribucion de carpetas/directorios:
    #
    #   -
    #   - 

    geoserver_PTM_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'output', 'geoserver', 'PTM'))
    PTM_tif_file = os.path.join(geoserver_PTM_dir, 'PTM_jun_2000_present_last_band_ARG_cropped.tif')

    geoserver_SPI_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'output', 'geoserver', 'SPI'))


    # Datos de autenticación y la URL base de GeoServer
    dotenv_path = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'credentials', '.env'))
    load_dotenv(dotenv_path)
    username = os.getenv('GEOSERVER_USERNAME')
    password = os.getenv('GEOSERVER_PASSWORD')

    geo = Geoserver('http://127.0.0.1:8080/geoserver', username=username, password=password)

    workspace_name = 'EHCPA'

    try:
        geo.get_workspace(workspace_name)
        print(f"El workspace '{workspace_name}' ya existe.")
    except GeoserverException as e:
        if 'No such workspace' in str(e):
            print(f"El workspace '{workspace_name}' no existe. Creando...")
            geo.create_workspace(workspace_name)
            print(f"El workspace '{workspace_name}' se creo con exito")
            geo.set_default_workspace(workspace_name)
            print(f"El workspace '{workspace_name}' ha sido creado y establecido por defecto.")

    ####################################################################################################################

    PTM_layer_name = "PTM_Raster"
    PTM_style_name = 'PTM_Style'

    geo.create_coveragestore(layer_name=PTM_layer_name, path=PTM_tif_file, workspace=workspace_name)
    geo.publish_style(layer_name=PTM_layer_name, style_name=PTM_style_name, workspace=workspace_name)

    print("Publicación de la capa PTM completada.")


    spi_scales = ['1', '2', '3', '6', '9', '12', '24', '36', '48', '60', '72']
    SPI_style_name = 'SPI_Style'

    for scale in spi_scales:
        
        SPI_tif_file = os.path.join(geoserver_SPI_dir, f'SPI_jun_2000_present_scale_{scale}_last_band_ARG_cropped.tif')

        SPI_layer_name = f"SPI_scale_{scale}_Raster"
        
        print(f"Creando coveragestore para la capa: {SPI_layer_name}")
        geo.create_coveragestore(layer_name=SPI_layer_name, path=SPI_tif_file, workspace=workspace_name)

        print(f"Publicando estilo para la capa: {SPI_layer_name}")
        geo.publish_style(layer_name=SPI_layer_name, style_name=SPI_style_name, workspace=workspace_name)

    print("Publicación de todas las capas SPI completada.")

    print("La publicacion de todos los archivos raster se completo con exito.")
        
    


if __name__ == '__main__':
    geoserver_upload()



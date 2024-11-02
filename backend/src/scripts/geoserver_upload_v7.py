import os
import requests
from dotenv import load_dotenv
from requests.auth import HTTPBasicAuth
from geo.Geoserver import Geoserver, GeoserverException  

try:
    from sleep_for_a_bit_v7 import sleep_for_a_bit 
except ModuleNotFoundError:
    from src.scripts.sleep_for_a_bit_v7 import sleep_for_a_bit

###################################################################################################################################

## Funcion concat_reord: Sirve para efectuar la autenticacion y conexion con GeoServer para crear y publicar las capas raster de 
#  Precipitación Total Mensual (PTM) y del Indice de Precipitación Estandarizado (SPI) de todas las escalas, en el espacio de 
#  trabajo definido en el servidor, y aplicando para cada el estilo correspondiente.

def geoserver_upload():

    ## Distribucion de carpetas/directorios:
    #
    #   - geoserver_PTM_dir: Carpeta donde se encuentra el archivo "PTM" con la ultima banda.
    #   - PTM_tif_file: Archivo "PTM" con la ultima banda.
    #   - geoserver_SPI_dir: Carpeta donde se encuentran los archivos "SPI", de todas las escalas, con la ultima banda.

    geoserver_PTM_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'output', 'geoserver', 'PTM'))
    PTM_tif_file = os.path.join(geoserver_PTM_dir, 'PTM_jun_2000_present_last_band_ARG_cropped.tif')

    geoserver_SPI_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'output', 'geoserver', 'SPI'))

    ###################################################################################################################################

    ## PASO 1: Proceso de autenticacion en GeoServer y creacion de espacio de trabajo para almacenar los datos. 
    #  1. Como primera medida, extraemos del archivo ."env" las credenciales necesarias para realizar la autencion y conexion con 
    #     GeoServer. Creamos un objeto de tipo "Geoserver" para poder interactuar con la API del mismo, pasandole como parametro las 
    #     credenciales. 
    #  2. Luego, definimos el espacio de trabajo a nombre de "EHCPA", y realizamos la siguiente comprobacion:
    #     - Si el espacio de trabajo ya existe, se informa y continua el proceso.
    #     - Si el espacio de trabajo no existe, se informa, se lo crea, se lo establece por defecto, y continua el proceso.

    dotenv_path = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'credentials', '.env'))
    load_dotenv(dotenv_path)
    url = os.getenv('GEOSERVER_URL')
    username = os.getenv('GEOSERVER_USERNAME')
    password = os.getenv('GEOSERVER_PASSWORD')

    geo = Geoserver(url, username=username, password=password)

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
            sleep_for_a_bit(10)
    
    ###################################################################################################################################

    ## PASO 2: Proceso de creacion de capas y asignacion de estilos. 
    #  1. Para el archivo de "PTM", definimos el nombre de la capa y el nombre del estilo que se va a aplicar en dicha capa. Posteriormente, 
    #     creamos la capa asignando el nombre de la misa, el archivo de "PTM" y el espacio de trabajo. Luego se publica en la capa creada, 
    #     el estilo definido.
    #  2. Para los archivos de "SPI" de todas las escalas, definimos el nombre de la capa para cada uno y el nombre del estilo que se 
    #     va a aplicar a las mismas. Posteriormente, iteramos cada escala para crear su correspondiente capa asignando el nombre de la 
    #     misma, el archivo de "SPI" y el espacio de trabajo. Luego para cada capa creada, se publica el estilo definido.  

    PTM_layer_name = "PTM_Raster"
    PTM_style_name = 'PTM_Style'

    print(f"Creando coveragestore para la capa: {PTM_layer_name}")
    geo.create_coveragestore(layer_name=PTM_layer_name, path=PTM_tif_file, workspace=workspace_name)
    sleep_for_a_bit(10)
    print(f"Publicando estilo para la capa: {PTM_layer_name}")
    geo.publish_style(layer_name=PTM_layer_name, style_name=PTM_style_name, workspace=workspace_name)
    sleep_for_a_bit(10)


    spi_scales = ['1', '2', '3', '6', '9', '12', '24', '36', '48', '60', '72']
    SPI_style_name = 'SPI_Style'

    for scale in spi_scales:
        
        SPI_tif_file = os.path.join(geoserver_SPI_dir, f'SPI_jun_2000_present_scale_{scale}_last_band_ARG_cropped.tif')

        SPI_layer_name = f"SPI_scale_{scale}_Raster"
        
        print(f"Creando coveragestore para la capa: {SPI_layer_name}")
        geo.create_coveragestore(layer_name=SPI_layer_name, path=SPI_tif_file, workspace=workspace_name)
        sleep_for_a_bit(10)

        print(f"Publicando estilo para la capa: {SPI_layer_name}")
        geo.publish_style(layer_name=SPI_layer_name, style_name=SPI_style_name, workspace=workspace_name)
        sleep_for_a_bit(10)
    




if __name__ == '__main__':
    geoserver_upload()

import os
import requests
from dotenv import load_dotenv
from requests.auth import HTTPBasicAuth


def ptm_convertion_and_crop():
    
    tif_file = 'PTM_jun_2000_present_last_band_ARG_cropped.tif'

    # Datos de autenticación y la URL base de GeoServer
    dotenv_path = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'credentials', '.env'))
    load_dotenv(dotenv_path)
    username = os.getenv('GEOSERVER_USERNAME')
    password = os.getenv('GEOSERVER_PASSWORD')
    geoserver_url = "http://localhost:8080/geoserver/rest"
    workspace = "EHCPA_SPI"  # Nombre del workspace configurado en GeoServer
    store_name = "EHCPA_PTM_python_lastband"  # Nombre para el store del GeoTIFF
    layer_name = "PTM_jun_2000_present_last_band"  # Nombre de la capa en GeoServer
    crs = "EPSG:4326"  # Código del sistema de referencia de coordenadas (CRS)
    style_name = "PTMStyle"  # Estilo que desees aplicar a la capa


    # URL para crear el store del GeoTIFF
    store_url = f"{geoserver_url}/workspaces/{workspace}/coveragestores"
    payload = {
        "coverageStore": {
            "name": store_name,
            "workspace": workspace,
            "type": "GeoTIFF",
            "enabled": True,
            "url": f"file:data/EHCPA/PTM/{tif_file}"  # Ruta completa del archivo PTM a subir
        }
    }

    # URL para crear la capa
    layer_url = f"{geoserver_url}/workspaces/{workspace}/coveragestores/{store_name}/coverages"
    url_ready_layer = f"{geoserver_url}/workspaces/{workspace}/layers/{layer_name}.xml"

    # Payload XML para actualizar el estilo de la capa
    xml_payload = f"""
    <layer>
        <defaultStyle>
            <name>{style_name}</name>
        </defaultStyle>
    </layer>
    """

    # Payload para la capa GeoTIFF
    payloadLayer = {
        "coverage": {
            "name": layer_name,
            "title": layer_name,
            "enabled": True,
            "nativeName": layer_name,
            "srs": crs,
            "metadata": {
                "time": {"enabled": True}  # Ajusta la estructura de metadatos según sea necesario
            },
            "defaultStyle": {
                "name": style_name,
            }
        }
    }

    # Autenticación y solicitud a GeoServer
    auth = HTTPBasicAuth(username, password)
    auth_response = requests.get(geoserver_url, auth=auth)

    if auth_response.status_code == 200:
        print("Authentication successful!")

        # Crear el store del GeoTIFF
        store_response = requests.post(store_url, auth=auth, json=payload)

        if store_response.status_code == 201:
            print(f"GeoTIFF store '{store_name}' created successfully!")

            # Crear la capa GeoTIFF
            layer_response = requests.post(layer_url, auth=auth, json=payloadLayer)

            if layer_response.status_code == 201:
                print(f"GeoTIFF layer '{layer_name}' created successfully!")
            else:
                print(f"Error creating GeoTIFF layer: {layer_response.text}")

            # Actualizar el estilo de la capa
            headers = {'Content-type': 'application/xml'}
            response = requests.put(url_ready_layer, data=xml_payload, headers=headers, auth=auth)

            if response.status_code == 200:
                print("Successfully updated layer style.")
            else:
                print("Error updating layer style:", response.status_code)
        else:
            print(f"Error creating GeoTIFF store: {store_response.text}")
    else:
        print("Authentication failed. Please check your credentials.")
        print(auth_response.text)


if __name__ == '__main__':
    ptm_convertion_and_crop()

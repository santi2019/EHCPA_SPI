import os
from dotenv import load_dotenv
import boto3

###################################################################################################################################

## Funcion automatic_s3_downloader: Sirve para la verificacion de existencia de archivos de precipitacion mensual acumulada en 
#  carpeta local "IMERG_late_month", para efectuar o no la descarga del backup del servicio S3 de AWS.  
#  1. Como primera medida extraemos las variables de entornos necesarias para la autenticacion en AWS y el acceso al bucket del 
#     servicio S3. Entre ellas tenemos las claves de acceso a la cuenta de AWS, luego tenemos el nombre del bucket y por ultimo el 
#     prefijo, es decir, la carpeta dentro del bucket donde se almacena el backup. Luego, se crea un cliente de S3 utilizando las 
#     credenciales de AWS obtenidas, que nos permitirá interactuar con el servicio S3.
#  2. El directorio "IMERG_late_month_dir" es la carpeta donde se guardan los archivos de precipitacion mensual acumulada. En caso 
#     de que dicha carpeta no exista, se la crea y se llama a la funcion "download_files()" para efectuar la descarga de los archivos 
#     en el backup. Caso contrario, listamos la cantidad de archivos que hay en el mismo, luego listamos la cantidad de archivos 
#     almacenados en el bucket del servicio S3, y verificamos que:
#     - Si el número de archivos locales es menor que el número de archivos en S3, se avisa mediante un mensaje, y se vuelve a 
#       llamar a la función "download_files()" para descargar el backup.
#     - Caso contrario, significa que tenemos todos los archivos o incluso mas, por lo que no es necesaria la descarga.

def automatic_s3_downloader():

    dotenv_path = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'credentials', '.env'))
    load_dotenv(dotenv_path)
    access_key = os.getenv('AWS_ACCESS_KEY')
    secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    bucket_name = os.getenv('AWS_S3_BUCKET_NAME')
    prefix = os.getenv('AWS_S3_PREFIX')

    client = boto3.client('s3', aws_access_key_id=access_key, aws_secret_access_key=secret_access_key)

    IMERG_late_month_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'IMERG_late_month'))
    
    if not os.path.exists(IMERG_late_month_dir):
        print(f"El directorio IMERG_late_month no existe. Creándolo y descargando archivos...")
        os.makedirs(IMERG_late_month_dir)
        download_files(client, bucket_name, prefix, IMERG_late_month_dir)
    else:
        files = os.listdir(IMERG_late_month_dir)
        local_num_files = len(files)
        print(f"El directorio IMERG_late_month ya existe y contiene {local_num_files} archivos.")

        response = client.list_objects_v2(Bucket=bucket_name, Prefix=prefix)
        s3_num_files = len(response.get('Contents', []))
        print(f"El bucket S3 {bucket_name} contiene {s3_num_files} archivos.")

        if local_num_files < s3_num_files:
            print("El número de archivos no coincide. Descargando archivos...")
            download_files(client, bucket_name, prefix, IMERG_late_month_dir)
        else:
            print("No es necesaria la descarga del backup.")

###################################################################################################################################

## Funcion download_files: Sirve para efectuar la descarga del backup.
#  1. La funcion recibe como parametros la conexion con el cliente S3, el nombre del bucket y el prefix del backup, y la ruta al 
#     directorio "IMERG_late_month".
#  2. Se utiliza el cliente de S3 para listar los archivos en el bucket, con "list_objects_v2" nuevamente, en donde dentro de 
#     "response", la clave "Contents" contiene la información sobre cada archivo, y verificamos que:
#     - Si la respuesta contiene informacion de cada archivo, iteramos sobre todos los archivos listados, para extraer el "Key" que 
#       es una cadena de texto que representa la ruta completa del archivo dentro del bucket, y luego se obtiene solo el nombre del 
#       archivo, separándolo por / y seleccionando el último elemento, y se lo almacena. 
#       - Si "file_name", es decir, el nombre del archivo, no está vacío, creamos la ruta de descarga "download_path" y mediante 
#         "download_file()" descargamos el archivo de S3 a la ruta especificada. Cuando termina la descarga de todos los archivos se 
#         avisa por mensaje.
#     - Caso contrario, se informa que el bucket no posee archivos.

def download_files(client, bucket_name, prefix, IMERG_late_month_dir):
    response = client.list_objects_v2(Bucket=bucket_name, Prefix=prefix)
    if 'Contents' in response:
        for obj in response['Contents']:
            file_key = obj['Key']  
            file_name = file_key.split('/')[-1]  
            if file_name:  
                download_path = os.path.join(IMERG_late_month_dir, file_name)
                print(f"Descargando archivo: {file_name}")
                client.download_file(bucket_name, file_key, download_path)
        print("Descarga completa.")
    else:
        print("No se encontraron archivos en el bucket.")





if __name__ == '__main__':
    automatic_s3_downloader()
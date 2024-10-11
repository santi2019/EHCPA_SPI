import os
from dotenv import load_dotenv
import boto3



## PROCEDIMIENTO: Proceso de generacion de backup de los archivos de precipitacion mensual acumulada del directorio
#                 IMERG_late_month
#         - Como primera medida extraemos las variables de entornos necesarias para la autenticacion en AWS y el 
#           acceso al bucket del servicio S3. Entre ellas tenemos las claves de acceso a la cuenta de AWS, luego
#           tenemos el nombre del bucket y por ultimo el prefijo, es decir, la carpeta dentro del bucket donde se
#           almacena el backup. Luego, se crea un cliente de S3 utilizando las credenciales de AWS obtenidas, que 
#           nos permitirá interactuar con el servicio S3.
#         - IMERG_late_month_dir: Carpeta donde se guardan los archivos de precipitacion mensual acumulada.
#         - Listamos la canidad de archivos que hay actualmente en el directorio "IMERG_late_month". Filtramos la 
#           lista de archivos para identificar solo con aquellos que contienen la palabra "IMERG" en su nombre para
#           asegurar de que solo se suban los archivos de precipitacion mensual acumulada.
#         - Iteramos sobre cada uno de los archivos para subirlos al servicio S3 de AWS, y para esto utilizamos la
#           funcion "upload_file()" en la cual establecemos la ruta local completa del archivo a subir, luego 
#           definimos el bucket donde se cargaran los archivos, y este es el que extraemos de las variables de
#           entorno, y construimos la key o ruta de S3 para los archivos, que consiste en el prefijo (prefix), es
#           decir, el nombre de la carpeta dentro del bucket, sumado el nombre del archivo. Después de cargar cada 
#           archivo, se imprime un mensaje indicando que el backup para ese archivo se completo.  
def automatic_s3_uploader():
    dotenv_path = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'credentials', '.env'))
    load_dotenv(dotenv_path)
    access_key = os.getenv('AWS_ACCESS_KEY')
    secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    bucket_name = os.getenv('AWS_S3_BUCKET_NAME')
    prefix = os.getenv('AWS_S3_PREFIX')

    client = boto3.client('s3', aws_access_key_id=access_key, aws_secret_access_key=secret_access_key)

    IMERG_late_month_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'IMERG_late_month'))

    files = os.listdir(IMERG_late_month_dir)
    num_files = len(files)
    print("Cantidad de archivos en el directorio IMERG_late_month:", num_files)

    files = [f for f in files if 'IMERG' in f]

    for file in files:
        upload_file_bucket = bucket_name
        upload_file_key = prefix + str(file)
        file_path = os.path.join(IMERG_late_month_dir, file)
        client.upload_file(file_path, upload_file_bucket, upload_file_key)
        print(f"Backup completado para el archivo: {file}")






if __name__ == '__main__':
    automatic_s3_uploader()
import os
from dotenv import load_dotenv
import boto3


def automatic_s3_downloader():
    dotenv_path = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'credentials', '.env'))
    load_dotenv(dotenv_path)
    access_key = os.getenv('AWS_ACCESS_KEY')
    secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')

    client = boto3.client('s3', aws_access_key_id=access_key, aws_secret_access_key=secret_access_key)

    bucket_name = 'ehcpa-ucc-bucket'
    prefix = 'IMERG_late_month_backup/'

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

        if local_num_files != s3_num_files:
            print("El número de archivos no coincide. Descargando archivos...")
            download_files(client, bucket_name, prefix, IMERG_late_month_dir)
        else:
            print("Los archivos locales y los del bucket son los mismos. No es necesaria la descarga.")



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
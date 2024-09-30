import os
from dotenv import load_dotenv
import boto3


def automatic_s3_uploader():
    dotenv_path = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'credentials', '.env'))
    load_dotenv(dotenv_path)
    access_key = os.getenv('AWS_ACCESS_KEY')
    secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')

    bucket_name = 'ehcpa-ucc-bucket'
    prefix = 'IMERG_late_month_backup/'

    IMERG_late_month_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'IMERG_late_month'))

    client = boto3.client('s3', aws_access_key_id=access_key, aws_secret_access_key=secret_access_key)

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
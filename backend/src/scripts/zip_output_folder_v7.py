import os
import zipfile

def zip_folder():

    # Carpeta que queremos comprimir
    source_folder = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'output'))

    # Especificamos el nombre y la ubicación del archivo ZIP que vamos a crear
    output_zip_path = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'EHCPA_Data.zip'))

    with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_folder):
            for file in files:
                file_path = os.path.join(root, file)
                archive_path = os.path.relpath(file_path, source_folder)
                zipf.write(file_path, archive_path)

    print(f"Archivo ZIP creado correctamente")




if __name__ == '__main__':
    zip_folder()
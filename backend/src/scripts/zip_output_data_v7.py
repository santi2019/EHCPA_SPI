import os
from zipfile import ZipFile
from datetime import datetime
from dateutil.relativedelta import relativedelta

def zip_output_data():

    ## Distribucion de carpetas/directorios:
    #

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

    downloable_data_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'output', 'downloable_data'))
    PTM_dir = os.path.expanduser(os.path.join(downloable_data_dir, 'PTM'))
    PTM_file = os.path.expanduser(os.path.join(PTM_dir, f'PTM_jun_2000_{calibration_end_month}_{calibration_end_year}_all_bands_ARG_cropped.tif'))
    PTM_zip_file = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'output', 'downloable_data', 'EHCPA_PTM_Data.zip'))

    SPI_dir = os.path.expanduser(os.path.join(downloable_data_dir, 'SPI'))

    # PASO 1: Proceso de comprimir archivo PTM

    with ZipFile(PTM_zip_file, 'w') as zip:
        zip.write(PTM_file, os.path.basename(PTM_file))

    print(f"Archivo ZIP creado correctamente para PTM.")

    # PASO 2: Proceso de comprimir archivos SPI

    spi_scales = ['1', '2', '3', '6', '9', '12', '24', '36', '48', '60', '72']

    for scale in spi_scales:
        SPI_file = os.path.expanduser(os.path.join(SPI_dir, f'SPI_jun_2000_{calibration_end_month}_{calibration_end_year}_scale_{scale}_all_bands_ARG_cropped.tif'))
        SPI_zip_file = os.path.expanduser(os.path.join(downloable_data_dir, f'EHCPA_SPI_scale_{scale}.zip'))

        if os.path.exists(SPI_file):
            with ZipFile(SPI_zip_file, 'w') as zip:
                zip.write(SPI_file, os.path.basename(SPI_file))
            print(f"Archivo ZIP creado correctamente para SPI escala {scale}.")

    
    print(f"El proceso de comprimir archivos se completo con exito.")




if __name__ == '__main__':
    zip_output_data()
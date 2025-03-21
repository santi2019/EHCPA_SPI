import os
import re
from datetime import datetime
from dateutil.relativedelta import relativedelta

###################################################################################################################################

## Funcion get_today_date: Sirve para obtener la fecha actual. 
#  1. Obtenemos la fecha y hora actual del sistema.
#  2. Se convierte la fecha actual en una cadena con el formato "Año-Mes-Día".

def get_today_date():
    today_date = datetime.today()
    today_date_formatted = today_date.strftime('%Y-%m-%d')
    return today_date_formatted

###################################################################################################################################

## Funcion get_download_date: Sirve para obtener la fecha de descarga para el proceso ehcpa.   
#  1. Como primera medida obtenemos la fecha actual.
#  2. Luego se restan dos dias a la fecha actual, almacenandola en la variable "download_date", ya que esta ultima es la fecha de 
#     descarga.
#  3. De la fecha de descarga se extrae el año, mes y dia, para que las variables begTime y endTime puedan ser formateadas como 
#     cadenas en el formato 'AAAA-MM-DD'. 

def get_download_date():
    today_date = datetime.today()

    download_date = today_date - relativedelta(days=2)

    download_date_year = download_date.year
    download_date_month = download_date.month
    download_date_day = download_date.day

    begTime = f'{download_date_year:04d}-{download_date_month:02d}-{download_date_day:02d}'
    endTime = f'{download_date_year:04d}-{download_date_month:02d}-{download_date_day:02d}'

    return begTime, endTime

###################################################################################################################################

## Funcion get_ARG_late_last_date: Sirve para obtener la fecha del ultimo archivo IMERG de precipitacion diaria descargado en el 
#  directorio "ARG_late".   
#  
#  - arg_late_dir: Carpeta donde se encuentran almacenadas los archivos IMERG de precipitacion diaria descargados.
#       
#  1. Como primera medida obtenemos todos los archivos del directorio "ARG_late". 
#  2. Definimos un patrón de expresión regular que busca secuencias de 8 dígitos (una fecha en formato YYYYMMDD). Y filtramos los 
#     archivos que contienen el patron su nombre.
#  3. Si encuentran archivos con fechas:
#     - Se selecciona el archivo mas reciente (el ultimo descargado) y de el se extrae la fecha.
#     - Si no se puede extraer una fecha, se retorna "No disponible". 
#     Caso contrario, si no se encuentran archivos se retorna "No disponible".

def get_ARG_late_last_date():

    arg_late_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'ARG_late'))

    files = [f for f in os.listdir(arg_late_dir) if os.path.isfile(os.path.join(arg_late_dir, f))]

    pattern = r'\d{8}'
    dated_files = [f for f in files if re.search(pattern, f)]

    if dated_files:
        latest_file = sorted(dated_files)[-1]

        match = re.search(pattern, latest_file)
        if match:
            date_str = match.group(0)  
            ARG_late_last_date = datetime.strptime(date_str, '%Y%m%d').strftime('%d/%m/%Y')
        else:
            ARG_late_last_date = 'No disponible'
    else:
        ARG_late_last_date = 'No disponible'

    return ARG_late_last_date

###################################################################################################################################

## Funcion get_ARG_late_reset_date: Sirve para obtener la fecha de reseteo de la carpeta ARG_late.   
#  1. Dado la fecha actual, se calcula el tercer dia del proximo mes, teniendo como base el mes del dia actual.
#  2. Si el dia actual es menor al dia 3, se establece el dia 3 del mes actual como la fecha de reseteo. Caso contrario, se establece 
#     el dia 3 del mes siguiente como la fecha de reseteo.
#  3. Se establece el formato de la fecha como "DD/MM/AAAA".

def get_ARG_late_reset_date():
    today_date = datetime.today()

    next_month_third_day = (today_date + relativedelta(months=1)).replace(day=3)
    if today_date.day < 3:
        ARG_late_reset_date = today_date.replace(day=3).strftime('%d/%m/%Y')
    else:
        ARG_late_reset_date = next_month_third_day.strftime('%d/%m/%Y')

    return ARG_late_reset_date

###################################################################################################################################

## Funcion get_calibration_date(): Sirve para obtener el mes y año de calibracion de los archivos PTM y SPI de todas las escalas.   
#  1. Dado la fecha actual, obtenemos el primer dia del año siguiente, tomando como base el año actual, y se calcula la fecha de 
#     comparacion, restando un año al año del primer dia del proximo año. La misma logica se aplica para el tercer dia del proximo 
#     año, y para el tercer dia del proximo mes, pero en este ultimo se resta un mes para la fecha de comparacion.
#  2. Ahora bien, si la fecha actual es menor a "comparison_next_month_third_day" (al tercer dia del proximo mes, menos un mes), se 
#     verifica:
#     - Si la fecha actual es mayor o igual a "comparison_next_year_first_day" (al primer dia del proximo año, menos un año) y si 
#       es menor a "comparison_next_year_third_day" (al tercer dia del proximo año, menos un año), entonces se setea como año de 
#       calibracion el año de la fecha actual menos uno, y como mes de calibracion se setea el mes de la fecha actual menos uno, 
#       formateado en minúsculas con tres letras.
#     - Caso contrario se setea como año de calibracion el año de la fecha actual, y como mes de calibracion se setea el mes de la 
#       fecha actual menos uno, formateado en minúsculas con tres letras.
#     Caso contrario, se setea como año de calibracion el año de la fecha actual, y como mes de calibracion se setea el mes de la 
#     fecha actual, formateado en minúsculas con tres letras.

def get_calibration_date():
    today_date = datetime.today()

    next_year_first_day = (today_date + relativedelta(years=1)).replace(day=1).replace(month=1)
    comparison_next_year_first_day = next_year_first_day - relativedelta(years=1)

    next_year_third_day = (today_date + relativedelta(years=1)).replace(day=3).replace(month=1)
    comparison_next_year_third_day = next_year_third_day - relativedelta(years=1)

    next_month_third_day = (today_date + relativedelta(months=1)).replace(day=3)
    comparison_next_month_third_day = next_month_third_day - relativedelta(months=1)


    if today_date.date() < comparison_next_month_third_day.date():
        if(today_date.date() >= comparison_next_year_first_day.date() and today_date.date() < comparison_next_year_third_day.date()):
            calibration_end_year = today_date.year - 1
            calibration_end_month = (today_date - relativedelta(months=1)).strftime('%b').lower()
        else:
            calibration_end_year = today_date.year
            calibration_end_month = (today_date - relativedelta(months=1)).strftime('%b').lower()
    else:
        calibration_end_year = today_date.year
        calibration_end_month = today_date.strftime('%b').lower()
    
    return calibration_end_year, calibration_end_month


def get_data_download_dates():
    # Definir el directorio donde se almacenan los archivos
    imerg_late_month_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'IMERG_late_month'))
    
    # Listar los archivos en el directorio
    files = [f for f in os.listdir(imerg_late_month_dir) if os.path.isfile(os.path.join(imerg_late_month_dir, f))]
    
    # Definir el patrón de búsqueda de archivos con el formato IMERG_monthly_accumulated_precip_YYYY_MM.nc4
    pattern = r'IMERG_monthly_accumulated_precip_(\d{4})_(\d{2})\.nc4'
    
    # Filtrar archivos que cumplan con el patrón
    dated_files = [f for f in files if re.search(pattern, f)]
    
    if dated_files:
        # Ordenar los archivos para obtener el más reciente
        latest_file = sorted(dated_files)[-1]
        
        # Extraer el año y el mes del nombre del archivo
        match = re.search(pattern, latest_file)
        if match:
            year = match.group(1)
            month_num = int(match.group(2))
            month_str = datetime(1900, month_num, 1).strftime('%b').lower()
            
            return month_str, year
    
    return "No disponible", "No disponible"
    


if __name__ == "__main__":
   today_date = get_today_date()
   print(f"Fecha actual: {today_date}")

   begTime, endTime = get_download_date()
   print(f"Periodo a descargar: {begTime} a {endTime}")

   ARG_late_last_date = get_ARG_late_last_date()
   print(f"Ultima fecha descargada: {ARG_late_last_date}")

   ARG_late_reset_date = get_ARG_late_reset_date()
   print(f"Fecha de formateo de carpeta ARG_Late: {ARG_late_reset_date}")

   calibration_end_year, calibration_end_month = get_calibration_date()
   print(f"Periodo de calibracion: {calibration_end_month}_{calibration_end_year}")

   month, year = get_data_download_dates()
   print(f"Último mes procesado: {month}")
   print(f"Último año procesado: {year}")
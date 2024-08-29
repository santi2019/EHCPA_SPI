from datetime import datetime
import shutil
import os
from dateutil.relativedelta import relativedelta

# Obtenemos la fecha de actual
today_date = datetime.today()
print(f"Fecha actual: {today_date.strftime('%Y-%m-%d')}")

# Calculamos la fecha de ayer, restando 1 dia a la fecha actual para reemplazar 
# en las variables begTime y endTime
yesterday_today_date = today_date - relativedelta(days=1)
print(f"Fecha de descarga: {yesterday_today_date.strftime('%Y-%m-%d')}")

# Extraemos el año, mes y dia
yesterday_year = yesterday_today_date.year
yesterday_month = yesterday_today_date.month
yesterday_day = yesterday_today_date.day

# Formateamos y asignamos los datos a la variable begTime y endTime
begTime = f'{yesterday_year:04d}-{yesterday_month:02d}-{yesterday_day:02d}'
print(f"Fecha descarga formateada: {begTime}")




# Segundo dia del proximo mes
next_month_start_date = (today_date + relativedelta(months=1)).replace(day=2)
print(f"Segundo dia del proximo mes: {next_month_start_date.strftime('%Y-%m-%d')}")

# Restar 1 al mes del proximo mes para la comparacion
comparison_date = next_month_start_date - relativedelta(months=1)
print(f"Fecha de comparacion: {comparison_date.strftime('%Y-%m-%d')}")


folder_to_delete = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'ARG_late'))

# Comprobar si hoy es igual a la fecha de comparación ajustada
if today_date.date() == comparison_date.date():
    if os.path.exists(folder_to_delete) and os.path.isdir(folder_to_delete):
        shutil.rmtree(folder_to_delete)
        print(f"La carpeta '{folder_to_delete}' ha sido borrada.")
    else:
        print(f"La carpeta '{folder_to_delete}' no existe o no es un directorio.")
else:
    print(f"Hoy no es la fecha ajustada de comparación. La carpeta '{folder_to_delete}' no será borrada.")

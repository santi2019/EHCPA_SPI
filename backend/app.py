import os
from dotenv import load_dotenv
import zipfile
import locale
from datetime import datetime
from io import BytesIO
from flask import Flask, send_file, render_template, jsonify, request
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from main_v7 import ehcpa_process, remote_download_process
from src.scripts.get_dates_v7 import get_today_date, get_calibration_date, get_ARG_late_last_date
from tempfile import TemporaryDirectory

###################################################################################################################################

## Configuracion del backend: 
#  1. Como primera medida extraemos la variable de entorno necesaria para levantar el servicio del backend, y que es el puerto.
#  2. Creamos una instancia de la aplicacion Flask, que es el núcleo del servidor. "__name__" le indica a Flask que use el nombre 
#     del módulo actual para configurar la aplicación. 
#  3. Configuramos CORS (Cross-Origin Resource Sharing) en la aplicación Flask. Este es un mecanismo de seguridad que los navegadores 
#     usan para controlar las solicitudes HTTP que se hacen desde un origen (dominio, protocolo y puerto) diferente al origen desde 
#     el cual se sirvio la página. Sin CORS, los navegadores bloquean automáticamente estas solicitudes de otro origen por razones 
#     de seguridad.

dotenv_path = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'credentials', '.env'))
load_dotenv(dotenv_path)
backend_port = int(os.getenv('BACKEND_PORT'))

app = Flask(__name__)
cors = CORS(app, origins='*')   # origins=['https://example-front.com']

###################################################################################################################################

## Configuracion del CRON: 
#  1. Creamos un CRON que en definitiva es un planificador en segundo plano, es decir, un proceso que corre simultáneamente, en este
#     caso, con el servidor en Flask, que es la aplicación principal y no interfiere en su flujo. Esto permite que el servidor realice 
#     otras tareas mientras el planificador ejecuta sus propias tareas programadas. Mediante "daemon=True" indicamos que el planificador 
#     debe ejecutarse como un hilo "daemon". Los hilos daemon finalizan automáticamente cuando el proceso principal (la aplicación 
#     Flask) se detiene.
#  2. Creamos un job o tarea para la funcion "ehcpa_process". Mediante "cron" indicamos que se utiliza un disparador cron, que permite 
#     especificar un momento exacto en el que ejecutar la tarea. En este caso definimos que la funcion se ejecute todos los dias a las 
#     3:00 am, y definimos mediante "misfire_grace_time" un tiempo de espera para una ejecución fallida en segundos, para que si el 
#     job no puede ejecutarse exactamente a las 3:00 a.m. (por ejemplo, si el servidor está ocupado o saturado), se le da un tiempo 
#     de gracia de 1 hora (3600 segundos) para ejecutarse. Si pasa este tiempo y la tarea no ha podido ejecutarse, se omite esa ejecución.
#  3. Creamos un job o tarea para la funcion "remote_download_process". Tambien mediante "cron", y en este caso definimos que la funcion 
#     se ejecute todos los dias a las cada 30 minutos entre las 8:00 pm y las 2:00 am del dia siguiente, y definimos de igual manera
#     que para el job anterior, un tiempo de espera de 3600 segundos por si ocurre una ejecución fallida. 
#  4. Por ultimo iniciamos el planificador en segundo plano para que comience a ejecutar los jobs en los horarios especificados, cuando 
#     se inicie el servidor.

scheduler = BackgroundScheduler(daemon=True)
scheduler.add_job(ehcpa_process, 'cron', hour=3, misfire_grace_time=3600)
#scheduler.add_job(ehcpa_process, 'cron', hour='11,13,15,17,19,21', misfire_grace_time=3600)
scheduler.add_job(remote_download_process, 'cron', minute='0,30', hour='20-23,0-2', misfire_grace_time=3600)
scheduler.start()

###################################################################################################################################

## Funcion home: Sirve unicamente para indicar que el backend esta conectado.
#  1. El path o ruta de verificaion es "/".

@app.route('/')
def home():
    return jsonify("backend connected!")

###################################################################################################################################

## Funcion download_file: Sirve para descagar en formato ZIP, tanto de forma individual como grupal, los archivos de PTM y SPI.
#  1. El path o ruta de verificaion es "/download/<id_data>" donde "id_data" es el identificador del o los archivos que se desean
#     descargar.
#  2. El endpoint solo responde a solicitudes "GET", que generalmente se utilizan para recuperar datos o archivos.
#
#  - downloable_data_dir: Carpeta donde se encuentran los archivos de PTM y SPI generados para la descarga.
#  - PTM_dir: Carpeta donde se encuentra el archivo de PTM de todas las bandas.
#  - SPI_dir: Carpeta donde se encuentran los archivos de SPI de todas las bandas.
#
#  3. Listamos las escalas de los archivos SPI, para validar si la escala solicitada es correcta.
#  4. Llamamos a la función "get_calibration_date()"" para obtener el mes y año de calibracion.
#  5. Definimos una variable "ids" la cual divide el contenido de "id_data" en una lista usando la coma como separador, obteniendo 
#     una lista de identificadores. Luego definimos "files_to_zip", que es una lista vacía para almacenar las rutas de los archivos 
#     encontrados. Y "not_found_files" es una lista vacía para almacenar los identificadores de archivos que no se encuentran 
#     disponibles.
#  6. En el ciclo for se procesa cada uno de los identificadores almacenados en "ids", y se verifica:
#     - Si el identificador es "PTM", construye la ruta del archivo PTM correspondiente usando las fechas de "calibration_end_month" 
#       y "calibration_end_year" obtenidas.
#     - Si el identificador comienza con "SPI_", se extrae la escala al dividir el identificador por el carácter "_" y se toma la 
#       segunda parte. De esta manera comprobamos que la escala extraida esta en la lista de escalas definidas previamente, por lo 
#       que:
#       - Si la escala es valida, es decir, el numero extraido coincide con alguno de los definidos en la lista "spi_scales", se 
#         construye la ruta del archivo correspondiente a SPI.
#       - Si la escala es inválida, se responde con un mensaje de error en formato JSON y el código de estado 400 indicando que la
#         escala solicitada es incorrecta.
#     - Si el identificador no es ni "PTM" ni comienza con "SPI_", se responde con un error indicando que el identificador no es 
#       válido.
#  7. Para cada ruta construida de cada identificador, se verifica si dicha ruta existe, por lo que:
#     - Si existe, se la argrega la ruta a la lista "files_to_zip".
#     - Caso contrario, se agraga directamente el identificador a la lista de "not_found_files".
#  8. Para el caso de archivos no encontrados, en caso de que la lista "not_found_files" tenga contenido se verifica que:
#     - Si "not_found_files" posee solo un elemento, es decir, un identificador, se retorna un mensaje de error en formato JSON
#       y el codigo 404, para indicar que el archivo correspondiente a ese identificador no se encuentra disponible para su 
#       descarga en este momento.
#     - Si "not_found_files" posee mas de un elemento, es decir, varios identificador, se retorna un mensaje de error en formato 
#       JSON y el codigo 404, para indicar que dichos archivos correspondientes a los identificadores almacenados no se encuentran
#       disponibles para su descarga en este momento.
#  9. Creamos un objeto de tipo "BytesIO", que es un archivo en memoria (similar a un archivo temporal) que permite escribir y 
#     almacenar datos binarios sin necesidad de crear un archivo físico en el sistema. "BytesIO" servirá como el contenedor del 
#     archivo ZIP que se va a crear, permitiendo empaquetar los archivos especificados sin necesidad de guardarlos en el disco.
#     "zip_buffer" es el objeto de memoria (BytesIO) donde se almacenará el contenido del archivo ZIP, permitiendo que todo el 
#     archivo se mantenga en memoria en lugar de guardarse en el disco. Con el argumento "w" indicamos que el archivo ZIP está 
#     en modo de escritura, permitiendo añadir archivos al ZIP, y sobrescribiéndolo si ya tiene contenido. Y por ultimo se asigna 
#     el archivo ZIP abierto al identificador "zip_file", que se usa para añadir archivos al ZIP durante el resto del bloque.
#  10. En el ciclo for recorremos la lista de "files_to_zip" que contiene las rutas de los archivos que queremos incluir en el ZIP.
#      Y se agrega cada archivo al ZIP, pero hacemos que el archivo se guarde en el ZIP con solo su nombre (sin la ruta completa). 
#  11. Al escribir en "zip_buffer", el puntero en memoria se mueve al final del archivo, y esto ocurre cuando se añaden datos, ya 
#      que se van escribiendo en secuencia hasta completar el archivo. Es por eso que se utiliza "seek(0)", para indicar que la 
#      lectura del archivo en memoria "zip_buffer" comience desde el inicio del mismo y no desde el final, que es donde el puntero
#      queda despues de escribir.
#  12. Finalmente retornamos el archivo ZIP almacenado en memoria como parte de la respuesta HTTP, indicando mediante "as_attachment=True" 
#      que el archivo debe enviarse como un archivo adjunto, y esto significa que el navegador descargará el archivo en lugar de 
#      intentar abrirlo o visualizarlo. Ademas, especificamos el nombre del archivo que se vera al descargarlo. Y mediante  
#      "mimetype='application/zip'" le indicamos al navegador que el contenido es un archivo ZIP, lo que ayuda al mismo a manejar la 
#      descarga correctamente.
#  13. Respecto al funcionamiento del try y el finally, se guarda la configuración actual del idioma que es Español, luego dentro del 
#      bloque try se configura temporalmente el idioma a 'C' (neutral) para evitar conflictos, y luego en el finally se restaura el idioma 
#      original para no afectar a la funcion get_dates.

@app.route('/download/<id_data>', methods=['GET'])
def download_file(id_data):

    locale.setlocale(locale.LC_TIME, 'es_ES.UTF-8')

    downloable_data_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'output', 'downloable_data'))
    PTM_dir = os.path.join(downloable_data_dir, 'PTM')
    SPI_dir = os.path.join(downloable_data_dir, 'SPI')

    spi_scales = ['1', '2', '3', '6', '9', '12', '24', '36', '48', '60', '72']

    calibration_end_year, calibration_end_month = get_calibration_date()

    ids = id_data.split(',')
    files_to_zip = []
    not_found_files = []

    for data_id in ids:
        if data_id == "PTM":
            #file_path = os.path.join(PTM_dir, f'PTM_jun_2000_{calibration_end_month.rstrip(".")}_{calibration_end_year}_all_bands_ARG_cropped.tif')
            file_path = os.path.join(PTM_dir, f'PTM_jun_2000_ene_2025_all_bands_ARG_cropped.tif')
            print(file_path)
        elif data_id.startswith("SPI_"):
            scale = data_id.split("_")[1]
            if scale in spi_scales:
                #file_path = os.path.join(SPI_dir, f'SPI_jun_2000_{calibration_end_month.rstrip(".")}_{calibration_end_year}_scale_{scale}_all_bands_ARG_cropped.tif')
                file_path = os.path.join(SPI_dir, f'SPI_jun_2000_ene_2025_scale_{scale}_all_bands_ARG_cropped.tif')
                print(file_path)
            else:
                return jsonify(message=f'La escala {scale} no es correcta.'), 400
        else:
            return jsonify(message=f'El identificador {data_id} no es correcto.'), 400

        if os.path.exists(file_path):
            files_to_zip.append(file_path)
        else:
            not_found_files.append(data_id)

    if not_found_files:
        if len(not_found_files) == 1:
            return jsonify(message=f'El archivo {not_found_files[0]} no se encuentra disponible para su descarga en este momento.'), 404
        else:
            return jsonify(message=f'Los siguientes archivos no están disponibles para su descarga en este momento: {", ".join(not_found_files)}'), 404

    # Crear un directorio temporal para aislamiento
    with TemporaryDirectory() as temp_dir:
        zip_path = os.path.join(temp_dir, 'EHCPA_Data.zip')

        # Crear el archivo ZIP dentro del directorio temporal
        with zipfile.ZipFile(zip_path, 'w') as zip_file:
            for file_path in files_to_zip:
                zip_file.write(file_path, os.path.basename(file_path))

        # Leer el ZIP y enviarlo como respuesta
        with open(zip_path, 'rb') as zip_file:
            zip_data = zip_file.read()

    return send_file(BytesIO(zip_data), as_attachment=True, download_name='EHCPA_Data.zip', mimetype='application/zip')

###################################################################################################################################

## Funcion get_dates: Sirve para generar un mensaje de tipo JSON que contenga, en formato local, el dia, mes y año de la fecha 
#  actual y la fecha del ultimo dia procesado para los archivos de las ultimas bandas. Y por otro lado obtener la fecha de fin de
#  calibracion. El objetivo es visualizar dichas fechas en el modal informativo del mapa del sitio web. 
#  1. El path o ruta de verificaion es "/get_dates".
#  2. El endpoint solo responde a solicitudes "GET", que generalmente se utilizan para recuperar datos o archivos.
#  3. Configuramos el idioma de las fechas para que se muestren en español mediante el modulo de "locale".
#  3. Obtenemos la fecha actual, y posteriormente, convertimos la misma, que esta en un formato de cadena ('%Y-%m-%d'), nuevamente a 
#     un objeto "datetime" para facilitar el acceso a los componentes de dicha fecha. Despues, extraemos el dia, el nombre del mes 
#     en español y con la primera letra en mayuscula, y por ultimo el año. 
#  4. Obtenemos la fecha del utlimo archivo almacenado en el directorio "ARG_late". Y comprobamos lo siguiente:
#     - Si la fecha esta disponible, convertimos dicha fecha, que esta en un formato de cadena ('%d/%m/%Y'), nuevamente a un objeto 
#       "datetime" para facilitar el acceso a sus componentes. Despues, extraemos el dia, el nombre del mes en español y con la primera 
#       letra en mayuscula, y por ultimo el año.
#     - Caso contrario, se setea "No Disponible" en el dia, mes y año.
#  5. Obtenemos las fechas de calibracion y se crea una cadena de texto en el formato "mes_año". Mediante "rstrip('.')" se elimina 
#     un punto al final del nombre del mes si existe.
#  6. Finalmente creamos un objeto JSON con todas las variables obtenidas y se lo retorna como respuesta a la solicitud HTTP.

@app.route('/get_dates', methods=['GET'])
def get_dates():

    today_date = get_today_date()
    locale.setlocale(locale.LC_TIME, 'es_ES.UTF-8')
    date = datetime.strptime(today_date, '%Y-%m-%d')

    today_day = date.day
    today_month = date.strftime('%B').capitalize()
    today_year = date.year

    ARG_late_last_date = get_ARG_late_last_date()

    if ARG_late_last_date != 'No disponible':
        date = datetime.strptime(ARG_late_last_date, '%d/%m/%Y')
        last_band_day = date.day
        last_band_month = date.strftime('%B').capitalize()
        last_band_year = date.year
    else:
        last_band_day = last_band_month = last_band_year = 'No Disponible'

    calibration_end_year, calibration_end_month = get_calibration_date()
    #calibration_date_str = f"{calibration_end_month.rstrip('.')}_{calibration_end_year}"
    calibration_date_str = "ene_2025"

    response = {
        'today_day': today_day,
        'today_month': today_month,
        'today_year': today_year,
        'last_band_day': last_band_day,
        'last_band_month': last_band_month,
        'last_band_year': last_band_year,
        'calibration_date': calibration_date_str
    }

    return jsonify(response)







if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, use_reloader=False, port=backend_port)
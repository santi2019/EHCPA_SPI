import sys
import json
import urllib3
import requests
from urllib3.exceptions import MaxRetryError, NameResolutionError
from urllib3.exceptions import TimeoutError as UrllibTimeoutError
from requests.exceptions import Timeout as RequestsTimeoutError
from requests.exceptions import HTTPError
import certifi
from time import sleep
from subprocess import Popen
from getpass import getpass
import platform
import os
import shutil
from dotenv import load_dotenv
from datetime import datetime
from dateutil.relativedelta import relativedelta

try:
    from get_dates_v7 import get_ARG_late_reset_date 
except ModuleNotFoundError:
    from src.scripts.get_dates_v7 import get_ARG_late_reset_date

###################################################################################################################################

## Funcion concat_reord: Sirve para descargar el subconjunto de datos de imagenes satelitales IMERG de precipitación diaria desde 
#  la API de la NASA para un rango de fechas específico, y gestionar el almacenamiento y las credenciales de autenticación. 
#  Por otro lado, se realiza un control de errores especificos y conocidos.

def download_subset(begTime, endTime, reset_ARG_late):

    ## Declaracion de variables/flags:
    #
    #   - error_found: Bandera para indicar que ha ocurrido un error conocido en el proceso de descarga.
    #   - error_message: Variable para almacenar el mensaje de un error conocido, indicando titulo, descripcion
    #     inicial y mas detalles especificos.
    #   - downloaded_files: almacenamos en esta variable la cantidad de archivos descargados para la posterior 
    #     verificacion al momento de enviar los emails. 
    #   - dotenv_path: Ruta de acceso a archivo ".env" donde se encuentran las credenciales necesarias para 
    #     realizar operaciones. Mediante "load_dotenv" extraemos los datos de dicho archivo.        

    error_found = False
    error_message = ""
    downloaded_files = 0
    
    dotenv_path = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'credentials', '.env'))
    load_dotenv(dotenv_path)

    ###################################################################################################################################

    try: 

    ## PASO 1: Proceso de obtencion del subset de datos IMERG mediante conexion a la API de la NASA.
    #  1. Conexion con la API y envio de solicitud del subset: Creamos una instancia de PoolManager para realizar solicitudes HTTP 
    #     seguras (con certificacion SSL) usando los certificados proporcionados por certifi. Y luego, establecemos la URL endpoint del 
    #     servicio de subconjunto GES DISC, para obtener los datos del satelite IMERG.
    #  2. La funcion "get_http_data" sirve para hacer una solicitud POST a la API de la NASA, en donde lo que se pasa como parametro a 
    #     dicha funcion es un request en formato JSON WSP que posee todas las caracteristicas del subset de datos que necesitamos obtener. 
    #     En caso de que la respuesta de dicha funcion tenga un error, por ejemplo, por culpa de conexion, se imprime un mensaje de error, 
    #     caso contrario, se devuelve como respuesta de los datos en formato JSON. Para construir la solicitud JSON, seguimos los siguientes 
    #     pasos: 
    #     2.1. Obtenemos la fecha de actual, luego, para determinar la fecha de descarga, calculamos la fecha de dos dias atras de la 
    #          actual, restando 2 dias a la fecha actual. De la fecha de descarga extraemos el año, mes y dia.
    #     2.2. Definimos los parametros del data subset a descargar, en donde definimos el producto, que en nuestro caso son las imagenes 
    #          IMERG de tipo Late Day version 7, luego definimos el corte espacial, es decir, las coordenadas para abarcar todo el territorio 
    #          Argentino, y por ultimo especificamos la variable de interes, que es la precipitacion. Para el caso de las fechas de descarga, 
    #          estas son recibidas por parametros en la funcion.
    #     2.3. Construimos la solicitud JSON para obtener los datos del subset que necesitamos, estableciendo las variables definidas 
    #          anteriormente.
    #     2.4. Por ultimo, pasamos como parametro a la funcion "get_http_data", el request construido.
    #  3. Monitoreo del estado de la solicitud: Una vez enviada la solicituda a la API, de la respuesta obtenida, extraemos un "JobID", es 
    #     decir, un identificador unico asignado a dicha solicitud, que nos permite hacer un seguimiento del estado de la misma. Para 
    #     determinar el estado de la solicitud, construimos una nueva solicitud JSON que se envia como parametro nuevamente a la funcion 
    #     "get_http_data", utilizando el metodo "GetStatus" y asignando el identificador o el "JobID" para especificar que la informacion 
    #     solicitada es sobre la solicitud inicial. A continuacion, tenemos un bucle "while", el cual monitorea constantemente el estado de 
    #     la solicitud. Este ciclo se ejecuta mientras el estado de la solicitud sea:
    #     - "Accepted": Significa que la API acepto la solicitud pero no comenzo a procesarla.
    #     - "Running": Significa que la API esta procesando la solicitud.
    #     Entonces, cada 5 segundos, nuestro programa envia la solicitud "GetStatus" a la API para verificar el estado de la solicitud. Esto 
    #     es asi para no saturar el servidor. La respuesta de la solicitud "GetStatus" incluye ademas del estado, un porcentaje del avance 
    #     del proceso. El ciclo terminna cuando el estado de la solicitud es:
    #     - "Succeeded": Es decir, la solicitud del subset a la API de la NASA se completo correctamente. 
    #     - "Failed": Significa que algo salio mal y termina el programa (VERIFICAR ESTO).
    #  4. Obtencion de los resultados de la solicitud: Una vez que la solicitud del subset a la API se completo con exito, creamos una nueva 
    #     solicitud JSON para pasar como parametro a la funcion "get_http_data" para poder obtener los resultados. En dicho JSON utilizamos 
    #     el metodo "GetResult", e indicamos que queremos obtener los resultados de la solicitud inicial mediante el "JobID", luego definimos 
    #     que vamos a obtener los resultados en bloques de a 20 para evitar sobrecargargas, e indicamos desde que posicion queremos empezar a 
    #     recuperar los resultados, en este caso se indica 0, lo que indica que se descargaran los 2 primeros PDF y luego el dato. 
    #     Inicializamos una lista vacia donde se van a almacenar los resultados que obtenemos de la API, e inicializamos un contador para contar 
    #     cuantos resultados obtenemos. El ciclo "while" nos sirve para controla r que hayamos recibido todos los resultados, en donde se envia 
    #     la solicitud "GetResult" a la funcion "get_http_data", obteniendo un nuevo bloque de resultados, luego se actualiza el contador con 
    #     el numero de resultados obtenidos en la solicitud "GetResult", y se añaden dichos resultados a la lista. Por ultimo, se muestra por 
    #     consola cuantos resultados obtuvimos finalmente, respecto a cuantos resultados esperabamos recibir en total.
    #  5. Recuperacion de los resultados de la solicitud: Enviamos una solicitud HTTP GET a la API de la NASA, utilizando el "JobID" de la 
    #     solicitud inicial para recuperar una lista de resultados en texto sin formato de una sola vez. Verificamos que la solicitud GET sea 
    #     exitosa, en donde en caso de que la respuesta tenga un estado 200, se devuelve una lista de URLs que son en definitiva el resultado 
    #     de la solicitud, es decir, datos del subset solicitado inicialmente. En caso de que la solicitud GET no se exitosa se imprime el 
    #     mensaje de error con su estado. Luego, dividimos los resultados en documentos (PDF) y URLs, a traves de un bucle que recorre todos 
    #     los elementos de la lista de resultados, y verifica que si el elemento de la lista contiene datos relacionados con las fechas de inicio 
    #     y fin (start y end), se lo agrega a la lista de URLs ya que son elementos a descargar, caso contrario, el elemento se añade a la lista 
    #     de documentos para ser ignorados. Finalmente, se imprimen los enlaces de los documentos PDF que se obtuvieron, pero como dijimos 
    #     anteriormente, estos no nos interesan y se ignoran en la descarga.

        http = urllib3.PoolManager(cert_reqs='CERT_REQUIRED',ca_certs=certifi.where())

        svcurl = os.getenv('NASA_SERVICE_SUBSET_JSONWSP')

        def get_http_data(request):
            hdrs = {'Content-Type': 'application/json',
                    'Accept'      : 'application/json'}
            data = json.dumps(request)
            r = http.request('POST', svcurl, body=data, headers=hdrs, timeout=20)
            response = json.loads(r.data)
            
            if response['type'] == 'jsonwsp/fault' :
                print('API Error: faulty request')
            return response
        
        print(f"Periodo a descargar: {begTime} a {endTime}")

        product = 'GPM_3IMERGDL_07'
        west = -73.5
        south = -55
        east = -53
        north = -21
        varName = 'precipitation'

        subset_request = {
            'methodname': 'subset',
            'type': 'jsonwsp/request',
            'version': '1.0',
            'args': {
                'role'  : 'subset',
                'start' : begTime,
                'end'   : endTime,
                'box'   : [west, south, east, north],
                'crop'  : True,
                'data'  : [{'datasetId': product,
                            'variable' : varName
                        }]
            }
        }

        response = get_http_data(subset_request)



        myJobId = response['result']['jobId']
        print('Job ID: '+myJobId)
        print('Job status: '+response['result']['Status'])

        status_request = {
            'methodname': 'GetStatus',
            'version': '1.0',
            'type': 'jsonwsp/request',
            'args': {'jobId': myJobId}
        }

        while response['result']['Status'] in ['Accepted', 'Running']:
            sleep(5)
            response = get_http_data(status_request)
            status  = response['result']['Status']
            percent = response['result']['PercentCompleted']
            print ('Job status: %s (%d%c complete)' % (status,percent,'%'))

        if response['result']['Status'] == 'Succeeded' :
            print ('Job Finished:  %s' % response['result']['message'])
        else :
            print('Job Failed: %s' % response['fault']['code'])
            sys.exit(1)



        batchsize = 20
        results_request = {
            'methodname': 'GetResult',
            'version': '1.0',
            'type': 'jsonwsp/request',
            'args': {
                'jobId': myJobId,
                'count': batchsize,
                'startIndex': 0
            }
        }

        results = []
        count = 0
        response = get_http_data(results_request)
        count = count + response['result']['itemsPerPage']
        results.extend(response['result']['items'])

        total = response['result']['totalResults']
        while count < total :
            results_request['args']['startIndex'] += batchsize
            response = get_http_data(results_request)
            count = count + response['result']['itemsPerPage']
            results.extend(response['result']['items'])

        print('Retrieved %d out of %d expected items' % (len(results), total))
        
        nasa_api_jobs_result = os.getenv('NASA_API_JOBS_RESULT')
        result = requests.get(nasa_api_jobs_result+myJobId)
        try:
            result.raise_for_status()
            urls = result.text.split('\n')
            for i in urls : print('\n%s' % i)
        except :
            print('Request returned error code %d' % result.status_code)

        docs = []
        urls = []
        for item in results :
            try:
                if item['start'] and item['end'] : urls.append(item)
            except:
                docs.append(item)

        print('\nDocumentation:')
        for item in docs : print(item['label']+': '+item['link'])

        results_length = len(results)

    ###################################################################################################################################

    ## PASO 2: Proceso de generacion de credenciales y autenticacion en el sitio NASA Earthdata, para acceder y descargar los datos 
    #  resultantes del paso anterior.
    #  1. Establecemos la URL del sitio, el nombre de usuario y la contraseña en el sitio, para validar la autenticacion.
    #  2. Creamos los siguientes archivos:
    #     - .netrc: Este archivo se utiliza para almacenar las credenciales de acceso (nombre de usuario y contraseña) y la URL para 
    #       autenticar automáticamente las solicitudes sin necesidad de ingresar manualmente las credenciales cada vez. Este archivo 
    #       se guarda en el directorio principal del usuario, implementando la escritura mediante "w". Si este no existe, se crea.
    #     - .urs_cookies: Este archivo se utiliza para almacenar las cookies de autenticacion que pueden ser necesarias durante las 
    #       solicitudes HTTP. Dentro del archivo no es escribe nada, ya que se crea vacio para su uso posterior.
    #     - .dodsrc: Este archivo contiene configuraciones que permiten a las solicitudes HTTP saber donde buscar las cookies y las 
    #       credenciales.
    #  3. Si el sistema no Linux o macOS, se ajustan los permisos para el archivo ".netrc", es decir, el comando que se ejecuta cambia 
    #     los permisos de dicho archivo para que se pueda leer y escribir en el, simepre hablando en estos sistemas. Si el sistema es 
    #     Windows en lugar de cambiar los permisos del archivo ".netrc", se copia el archivo ".dodsrc" al directorio "credentials".   

        urs = os.getenv('NASA_URS')
        username = os.getenv('NASA_USERNAME')
        password = os.getenv('NASA_PASSWORD')

        homeDir = os.path.expanduser("~") + os.sep

        with open(homeDir + '.netrc', 'w') as file:
            file.write(f'machine {urs} login {username} password {password}')
            file.close()
        with open(homeDir + '.urs_cookies', 'w') as file:
            file.write('')
            file.close()
        with open(homeDir + '.dodsrc', 'w') as file:
            file.write('HTTP.COOKIEJAR={}.urs_cookies\n'.format(homeDir))
            file.write('HTTP.NETRC={}.netrc'.format(homeDir))
            file.close()

        print('Saved .netrc, .urs_cookies, and .dodsrc to:', homeDir)


        if platform.system() != "Windows":
            Popen('chmod og-rw ~/.netrc', shell=True)
        else:

            #auth_dir = os.path.join(os.getcwd(), 'credentials')
            auth_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'credentials'))
            
            if not os.path.exists(auth_dir):
                os.makedirs(auth_dir)

            shutil.copy2(os.path.join(homeDir, '.dodsrc'), auth_dir)
            print('Copied .dodsrc to:', auth_dir)

    ###################################################################################################################################

    ## PASO 3: Proceso de descarga de las imagenes IMERG.
    #          
    #  - download_dir: Carpeta donde se almacenaran las imagenes satelitales IMERG de precipitacion diaria, luego de ser descargadas.
    #          
    #  1. Formateo de carpeta ARG_late: en caso de que la variable "reset_ARG_late", pasada por parametro a la funcion, sea "True", 
    #     se verifica:
    #     - Si la fecha actual es igual al tercer dia del proximo mes, tomando como base de comparacion, el mes siguiente al del mes 
    #       actual, guardandolo en una variable para realizar la comparacion ya que sino siempre estariamos un mes adelantado. Cuando 
    #       se cumple esta condicion, se verifica:
    #       - Si la carpeta "ARG_late" existe y si es un directorio, y en caso de que sea asi, dicha carpeta se borra y se vuelve a 
    #         crear. 
    #       - Si el directorio no existe, directamente se crea.
    #     - Si hoy no es la fecha de formateo se emite un mensaje y no se borra la carpeta "ARG_late".
    #     Pero si la variable es "False" no se realizan las verificaciones anteriores y simplemente se procede a realizar la descarga.  
    #  2. Descarga de archivos: Como primera medida se imprime un mensaje indicando que se va a mostrar la salida de los servicios HTTP, 
    #     luego iteramos sobre cada URL de la lista de URLs obtenidas del subset, extrayendo de cada una el enlace o link y guardandolo 
    #     en una variable URL. Con "requests.get(URL)", realizamos una solicitud HTTP GET a la URL tomada en la iteracion para descargar 
    #     el contenido del mismo. Se verifica si la solicitud fue exitosa, y si el código de estado HTTP indica un error (cualquier valor 
    #     distinto de 200), se lanza una excepcion. Todos los archivos se van a guardar en el directorio "ARG_late", por lo tanto se crea 
    #     un archivo con dicha ruta, y se lo abre en modo escritura binaria con "wb", para escribir sobre el contenido del archivo 
    #     descargado mediante la operacion la operacion "write", y luego se imprime el nombre del archivo creado.

        download_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'ARG_late'))

        if reset_ARG_late: 
            today_date = datetime.today()

            next_month_third_day = (today_date + relativedelta(months=1)).replace(day=3)

            comparison_date = next_month_third_day - relativedelta(months=1)

            ARG_late_reset_date = get_ARG_late_reset_date()

            if today_date.date() == comparison_date.date():
                if os.path.exists(download_dir) and os.path.isdir(download_dir):
                    shutil.rmtree(download_dir)
                    os.makedirs(download_dir)
                else:
                    os.makedirs(download_dir)
            else:
                print(f"Hoy no es {ARG_late_reset_date}, por ende la carpeta ARG_late no sera formateada.")
        

        print('\nHTTP_services output:')
        failed_urls = []
        for item in urls :
            URL = item['link']
            result = requests.get(URL)
            try:
                result.raise_for_status()
                ##outfn = item['label']
                ##f = open(outfn,'wb')
                ##f.write(result.content)
                ##f.close()
                ##print(outfn)

                outfn = os.path.join(download_dir, item['label'])
                
                with open(outfn, 'wb') as f:
                    f.write(result.content)
                print(outfn)

                downloaded_files += 1
            except HTTPError as http_err:
                error_found = True
                failed_urls.append(URL)
                failed_urls_content = '\n'.join(failed_urls) 
                error_message = (
                    f"HTTPError: Error en la descarga de archivos IMERG.\n"
                    f"- Descripción: Ocurrió un error de autenticación durante la descarga de los siguientes archivos IMERG del subset:\n"
                    f"{failed_urls_content}\n"
                    f"- Ayuda para descargar datos en:\n"
                    f"https://disc.gsfc.nasa.gov/information/documents?title=Data%20Access\n"
                    f"- Detalles: {http_err}\n"
                )
                print('Error! Status code is %d for this URL:\n%s' % (result.status_code,URL))
        if error_found:
            print(error_message)

    ###################################################################################################################################

    ## Manejo de errores: En caso de que ocurra algunos de los errores capturados, se setea la bandera "error_found" como "True", se 
    #  setea el mensaje de dicho error en "error_message" y se lo imprime.
    #  Los errores conocidos son:
    #  - En caso de que el valor de "results_length" sea 0, se indica que no se descargaron datos, ya sea por ejemplo, porque no estan 
    #    disponibles en el sitio GES DISC. 
    #  - HTTPError: Error en la descarga de archivos IMERG por error de autenticacion.
    #  - KeyError: Error en la solicitud a la API, por mal seteo de parametros en el json de solicitud, o el sitio GES DISC esta roto 
    #    o en mantenimiento.
    #  - JSONDecodeError: Error en la solicitud a la API, por problema de conectividad local o con la API debido a que esta fuera de 
    #    servicio, y se estaria recibiendo un json con un formato erroneo por parte de la misma.
    #  - NameResolutionError, MaxRetryError: Errores de conectividad, cuando no hay internet.
    #  - UrllibTimeoutError, RequestsTimeoutError: Errores de tiempo de espera de respuesta excedido a la hora de consultar o enviar 
    #    el json de solicitud del subset a la API de la NASA. 

        if results_length == 0:
            error_found = True
            error_message = (
                f"No se descargaron datos.\n"
                f"- Descripción: No se efectuo la descarga de datos, para el rango de fechas solicitado, debido a que se obtuvieron {results_length} resultados en la solicitud del subset.\n"
                f"- Verificar disponibilidad de datos IMERG en:\n"
                f"https://disc.gsfc.nasa.gov/datasets/GPM_3IMERGDL_07/summary?keywords=imerg\n"
            )
            print(error_message)                                                              

    except KeyError as e:
        error_found = True
        error_message = (
            f"API Error: Solicitud defectuosa.\n"
            f"- Descripción: Parámetros incorrectos en el json de solicitud del subset o sitio GES DISC en mantenimiento.\n"
            f"- Verificar estado del sitio GES DISC en:\n"
            f"https://disc.gsfc.nasa.gov/datasets/GPM_3IMERGDL_07/summary?keywords=imerg\n"
            f"- Detalles: El campo o clave {e} no se encontró en la respuesta.\n"
        )
        print(error_message)
    except json.JSONDecodeError as e:
        error_found = True
        error_message = (
            f"Error decoding JSON: Fallo en la solicitud a la API.\n"
            f"- Descripción: Posible problema de conectividad local o API fuera de servicio, por lo que se obtuvo una respuesta vacía o en un formato inesperado.\n"
            f"- Verificar estado del sitio GES DISC en:\n"
            f"https://disc.gsfc.nasa.gov/datasets/GPM_3IMERGDL_07/summary?keywords=imerg\n"
            f"- Detalles: {e}\n"
        )
        print(error_message)
    except (NameResolutionError, MaxRetryError) as e:
        error_found = True
        error_message = (
            f"Error de conexión Wifi.\n"
            f"- Descripción: Máximo número de intentos superados y no se pudo resolver el nombre del servidor.\n"
            f"- Detalles: {e}\n"
        )
        print(error_message)
    except (UrllibTimeoutError, RequestsTimeoutError) as e:
        error_found = True
        error_message = (
            f"TimeoutError: El tiempo de espera para la solicitud se excedió.\n"
            f"- Descripción: La solicitud del subset de datos a la API tardó demasiado y no se completó dentro del tiempo límite.\n"
            f"- Detalles: {e}\n"
        )
        print(error_message)
    
    except KeyboardInterrupt:
        print("Terminando proceso...")

   
    return error_found, error_message






if __name__ == '__main__':
    begTime = '2024-11-05'
    endTime = '2024-11-05'
    reset_ARG_late = False

    download_subset(begTime, endTime, reset_ARG_late)


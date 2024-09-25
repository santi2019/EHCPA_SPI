import sys
import json
import urllib3
from urllib3.exceptions import MaxRetryError, NameResolutionError
import certifi
import requests
from time import sleep
from subprocess import Popen
from getpass import getpass
import platform
import os
import shutil
from dotenv import load_dotenv
from datetime import datetime
from dateutil.relativedelta import relativedelta


results_length = 0

def download_subset():
    

    ## PASO 1: Proceso de obtencion del subset de datos IMERG mediante conexion a la API de la NASA.
    #
    #          1. Conexion con la API y envio de solicitud del subset: Creamos una instancia de PoolManager para realizar 
    #             solicitudes HTTP seguras (con certificacion SSL) usando los certificados proporcionados por certifi.  
    #             Y luego, establecemos la URL endpoint del servicio de subconjunto GES DISC, para obtener los datos del 
    #             satelite IMERG.
    #             Funcion "get_http_data": sirve para hacer una solicitud POST a la API de la NASA, en donde lo que se
    #             pasa como parametro a dicha funcion es un request en formato JSON WSP que posee todas las caracteristicas
    #             del subset de datos que necesitamos obtener. En caso de que la respuesta de dicha funcion tenga un error, 
    #             por ejemplo, por culpa de conexion, se imprime un mensaje de error, caso contrario, se devuelve como  
    #             respuesta de los datos en formato JSON. Para construir la solicitud JSON, seguimos los siguientes pasos: 
    #             - Obtenemos la fecha de actual, luego, para determinar la fecha de descarga, calculamos la fecha de dos 
    #               dias atras de la actual, restando 2 dias a la fecha actual. De la fecha de descarga extraemos el año, 
    #               mes y dia.
    #             - Definimos los parametros del data subset a descargar, en donde definimos el producto, que en nuestro 
    #               caso son las imagenes IMERG de tipo Late Day version 7, luego definimos la fecha de descarga formateando
    #               el año, mes y dia de la misma en las variables "begTime" y "endTime", definimos ademas el corte espacial, 
    #               en nuestro caso las coordenadas abarcan todo el territorio Argentino, y por ultimo especificamos la 
    #               variable de interes, que es la precipitacion.
    #             - Construimos la solicitud JSON para obtener los datos del subset que necesitamos, estableciendo las
    #               variables definidas anteriormente.
    #             - Por ultimo, pasamos como parametro a la funcion "get_http_data", el request construido.
    #          2. Monitoreo del estado de la solicitud: Una vez enviada la solicituda a la API, de la respuesta obtenida, 
    #             extraemos un "JobID", es decir, un identificador unico asignado a dicha solicitud, que nos permite hacer 
    #             un seguimiento del estado de la misma. Para determinar el estado de la solicitud, construimos una nueva 
    #             solicitud JSON que se envia como parametro nuevamente a la funcion "get_http_data", utilizando el metodo 
    #             "GetStatus" y asignando el identificador o el "JobID" para especificar que la informacion solicitada es 
    #             sobre la solicitud inicial. A continuacion, tenemos un bucle "while", el cual monitorea constantemente el 
    #             estado de la solicitud. Este ciclo se ejecuta mientras el estado de la solicitud sea:
    #             - "Accepted": Significa que la API acepto la solicitud pero no comenzo a procesarla.
    #             - "Running": Significa que la API esta procesando la solicitud.
    #             Entonces, cada 5 segundos, nuestro programa envia la solicitud "GetStatus" a la API para verificar el estado 
    #             de la solicitud. Esto es asi para no saturar el servidor. La respuesta de la solicitud "GetStatus" incluye 
    #             ademas del estado, un porcentaje del avance del proceso. El ciclo terminna cuando el estado de la solicitud 
    #             es:
    #             - "Succeeded": Es decir, la solicitud del subset a la API de la NASA se completo correctamente. 
    #             - "Failed": Significa que algo salio mal y termina el programa (VERIFICAR ESTO).
    #          3. Obtencion de los resultados de la solicitud: Una vez que la solicitud del subset a la API se completo con 
    #             exito, creamos una nueva solicitud JSON para pasar como parametro a la funcion "get_http_data" para poder
    #             obtener los resultados. En dicho JSON utilizamos el metodo "GetResult", e indicamos que queremos obtener los 
    #             resultados de la solicitud inicial mediante el "JobID", luego definimos que vamos a obtener los resultados en 
    #             bloques de a 20 para evitar sobrecargargas, e indicamos desde que posicion queremos empezar a recuperar los 
    #             resultados, en este caso se indica 0, lo que indica que se descargaran los 2 primeros PDF y luego el dato.
    #             Inicializamos una lista vacia donde se van a almacenar los resultados que obtenemos de la API, e inicializamos 
    #             un contador para contar cuantos resultados obtenemos. 
    #             El ciclo "while" nos sirve para controla r que hayamos recibido todos los resultados, en donde se envia la 
    #             solicitud "GetResult" a la funcion "get_http_data", obteniendo un nuevo bloque de resultados, luego se
    #             actualiza el contador con el numero de resultados obtenidos en la solicitud "GetResult", y se añaden dichos
    #             resultados a la lista. Por ultimo, se muestra por consola cuantos resultados obtuvimos finalmente, respecto a
    #             cuantos resultados esperabamos recibir en total.
    #          4. Recuperacion de los resultados de la solicitud: Enviamos una solicitud HTTP GET a la API de la NASA, utilizando
    #             el "JobID" de la solicitud inicial para recuperar una lista de resultados en texto sin formato de una sola vez.
    #             Verificamos que la solicitud GET sea exitosa, en donde en caso de que la respuesta tenga un estado 200,
    #             se devuelve una lista de URLs que son en definitiva el resultado de la solicitud, es decir, datos del subset 
    #             solicitado inicialmente. En caso de que la solicitud GET no se exitosa se imprime el mensaje de error con su 
    #             estado. Luego, dividimos los resultados en documentos (PDF) y URLs, a traves de un bucle que recorre todos los 
    #             elementos de la lista de resultados, y verifica que si el elemento de la lista contiene datos relacionados con 
    #             las fechas de inicio y fin (start y end), se lo agrega a la lista de URLs ya que son elementos a descargar, 
    #             caso contrario, el elemento se añade a la lista de documentos para ser ignorados. Finalmente, se imprimen los
    #             enlaces de los documentos PDF que se obtuvieron, pero como dijimos anteriormente, estos no nos interesan y se
    #             ignoran en la descarga.

    global results_length

    http = urllib3.PoolManager(cert_reqs='CERT_REQUIRED',ca_certs=certifi.where())

    svcurl = 'https://disc.gsfc.nasa.gov/service/subset/jsonwsp'

    apiErrorMessage = "API Error: Solicitud defectuosa."

    def get_http_data(request):
        hdrs = {'Content-Type': 'application/json',
                'Accept'      : 'application/json'}
        data = json.dumps(request)
        r = http.request('POST', svcurl, body=data, headers=hdrs)
        response = json.loads(r.data)
        
        if response['type'] == 'jsonwsp/fault' :
            nonlocal apiErrorMessage
            apiErrorMessage = "API Error: Solicitud defectuosa."
        return response
    
    today_date = datetime.today()
    print(f"Fecha actual: {today_date.strftime('%Y-%m-%d')}")
    
    download_date = today_date - relativedelta(days=2)
    print(f"Fecha a descargar: {download_date.strftime('%Y-%m-%d')}")

    download_date_year = download_date.year
    download_date_month = download_date.month
    download_date_day = download_date.day

    product = 'GPM_3IMERGDL_07'
    #begTime = '2024-05-01'
    #endTime = '2024-05-31'
    begTime = f'{download_date_year:04d}-{download_date_month:02d}-{download_date_day:02d}'
    endTime = f'{download_date_year:04d}-{download_date_month:02d}-{download_date_day:02d}'
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
    
    result = requests.get('https://disc.gsfc.nasa.gov/api/jobs/results/'+myJobId)
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

    ####################################################################################################################

    ## PASO 2: Proceso de generacion de credenciales y autenticacion en el sitio NASA Earthdata, para acceder y descargar 
    #          los datos resultantes dle paso anterior.
    #
    #          1. Establecemos la URL del sitio, el nombre de usuario y la contraseña en el sitio, para validar la 
    #             autenticacion.
    #          2. Creamos los siguientes archivos:
    #             - .netrc: Este archivo se utiliza para almacenar las credenciales de acceso (nombre de usuario y 
    #                       contraseña) y la URL para autenticar automáticamente las solicitudes sin necesidad de ingresar
    #                       manualmente las credenciales cada vez. Este archivo se guarda en el directorio principal del
    #                       usuario, implementando la escritura mediante "w". Si este no existe, se crea.
    #             - .urs_cookies: Este archivo se utiliza para almacenar las cookies de autenticacion que pueden ser 
    #                             necesarias durante las solicitudes HTTP. Dentro del archivo no es escribe nada, ya 
    #                             que se crea vacio para su uso posterior.
    #             - .dodsrc: Este archivo contiene configuraciones que permiten a las solicitudes HTTP saber donde buscar 
    #                        las cookies y las credenciales.
    #          3. Si el sistema no Linux o macOS, se ajustan los permisos para el archivo ".netrc", es decir, el comando
    #             que se ejecuta cambia los permisos de dicho archivo para que se pueda leer y escribir en el, simepre
    #             hablando en estos sistemas. Si el sistema es Windows en lugar de cambiar los permisos del archivo 
    #             ".netrc", se copia el archivo ".dodsrc" al directorio "credentials".   

    dotenv_path = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'credentials', '.env'))
    load_dotenv(dotenv_path)
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

    ####################################################################################################################

    ## PASO 3: Proceso de descarga de las imagenes IMERG.
    #          
    #          - download_dir: Carpeta donde se almacenaran las imagenes satelitales IMERG de precipitacion diaria, luego
    #            de ser descargadas.
    #          
    #          1.  
    #
    #
    #
    #

    download_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'ARG_late'))
    
    # Calculamos el tercer dia del proximo mes
    next_month_third_day = (today_date + relativedelta(months=1)).replace(day=3)

    # Restamos 1 al mes del proximo mes para la comparacion
    comparison_date = next_month_third_day - relativedelta(months=1)

    # Comprobamos si hoy es igual a la fecha de comparacion
    if today_date.date() == comparison_date.date():
        if os.path.exists(download_dir) and os.path.isdir(download_dir):
            shutil.rmtree(download_dir)
            os.makedirs(download_dir)
        else:
            os.makedirs(download_dir)
    else:
        print(f"Hoy no es la fecha de comparacion, la carpeta ARG_late no sera formateada")
    
    # Utilizamos la biblioteca de solicitudes para enviar las URL de HTTP_Services y escribir los resultados
    print('\nHTTP_services output:')
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

            # Modificamos la ruta de destino para que se guarden en la carpeta 'ARG_late'
            outfn = os.path.join(download_dir, item['label'])
            
            # Guardamos cada archivo en la carpeta 'ARG_late'
            with open(outfn, 'wb') as f:
                f.write(result.content)
            print(outfn)
        except:
            print('Error! Status code is %d for this URL:\n%s' % (result.status.code,URL))
            print('Help for downloading data is at https://disc.gsfc.nasa.gov/information/documents?title=Data%20Access')

    ####################################################################################################################

    return results_length





if __name__ == '__main__':
    download_subset()
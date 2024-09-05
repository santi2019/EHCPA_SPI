import sys
import json
import urllib3
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


def download_subset():

    ## PASO 1: Proceso de obtencion del subset de datos IMERG mediante conexion
    #          a la API de la NASA

    # Creamos una instancia de urllib PoolManager para realizar solicitudes:
    http = urllib3.PoolManager(cert_reqs='CERT_REQUIRED',ca_certs=certifi.where())

    # Establecemos la URL endpoint del servicio del subconjunto GES DISC:
    svcurl = 'https://disc.gsfc.nasa.gov/service/subset/jsonwsp'

    # Este metodo envia o hace POSTs de solicitudes JSON WSP formateadas a la URL
    # endpoint de GES DISC y devuelve la respuesta:
    def get_http_data(request):
        hdrs = {'Content-Type': 'application/json',
                'Accept'      : 'application/json'}
        data = json.dumps(request)
        r = http.request('POST', svcurl, body=data, headers=hdrs)
        response = json.loads(r.data)
        # Control de errores:
        if response['type'] == 'jsonwsp/fault' :
            print('API Error: faulty request')
        return response

    # Obtenemos la fecha de actual
    today_date = datetime.today()
    print(f"Fecha actual: {today_date.strftime('%Y-%m-%d')}")

    # Calculamos la fecha de dos dias atras de la actual, restando 2 dias a la fecha 
    # actual para reemplazar en las variables begTime y endTime
    download_date = today_date - relativedelta(days=2)
    print(f"Fecha a descargar: {download_date.strftime('%Y-%m-%d')}")

    # Extraemos el año, mes y dia
    download_date_year = download_date.year
    download_date_month = download_date.month
    download_date_day = download_date.day

    # Definimos los parametros del data subset
    #product = 'GPM_3IMERGM_07' FINAL MONTHLY
    #product = 'GPM_3IMERGDL_07' LATE DAY
    # Formateamos y asignamos los datos a la variable begTime y endTime
    product = 'GPM_3IMERGDL_07'
    #begTime = '2024-08-29'
    #endTime = '2024-08-31'
    begTime = f'{download_date_year:04d}-{download_date_month:02d}-{download_date_day:02d}'
    endTime = f'{download_date_year:04d}-{download_date_month:02d}-{download_date_day:02d}'
    west = -73.5
    south = -55
    east = -53
    north = -21
    varName = 'precipitation'

    # Construimos la solicitud JSON WSP para el metodo API: subset
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

    # Enviamos la solicitud del subset al servidor GES DISC
    response = get_http_data(subset_request)

    # Informamos el JobID y el estado inicial de la peticion
    myJobId = response['result']['jobId']
    print('Job ID: '+myJobId)
    print('Job status: '+response['result']['Status'])

    # Construimos la solicitud JSON WSP para el metodo API: GetStatus
    status_request = {
        'methodname': 'GetStatus',
        'version': '1.0',
        'type': 'jsonwsp/request',
        'args': {'jobId': myJobId}
    }

    # Revisa el job status (estado del trabajo) despues de una breve siesta
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

    # Construimos la solicitud JSON WSP para el metodo API: GetResult
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

    # Recuperamos los resultados en JSON en multiples lotes
    # Inicializamos las variables y luego enviamos la primera solicitud GetResults
    # Añadimos los resultados de este lote a la lista e incrementa el conteo
    results = []
    count = 0
    response = get_http_data(results_request)
    count = count + response['result']['itemsPerPage']
    results.extend(response['result']['items'])

    # Incrementamos el startIndex y seguimos pidiendo más resultados hasta que los tengamos todos
    total = response['result']['totalResults']
    while count < total :
        results_request['args']['startIndex'] += batchsize
        response = get_http_data(results_request)
        count = count + response['result']['itemsPerPage']
        results.extend(response['result']['items'])

    # Verificamos la contabilidad
    print('Retrieved %d out of %d expected items' % (len(results), total))


    # Recuperamos una lista de resultados en texto sin formato de una sola vez utilizando el JobID guardado
    result = requests.get('https://disc.gsfc.nasa.gov/api/jobs/results/'+myJobId)
    try:
        result.raise_for_status()
        urls = result.text.split('\n')
        for i in urls : print('\n%s' % i)
    except :
        print('Request returned error code %d' % result.status_code)


    # Ordenamos los resultados en documentos y URLs
    docs = []
    urls = []
    for item in results :
        try:
            if item['start'] and item['end'] : urls.append(item)
        except:
            docs.append(item)

    # Mostramos los enlaces de la documentación, pero no los descargamos
    print('\nDocumentation:')
    for item in docs : print(item['label']+': '+item['link'])


    ####################################################################################################################


    ## PASO 2: Proceso de generacion de credenciales

    urs = 'urs.earthdata.nasa.gov'    # Earthdata URL to call for authentication
    dotenv_path = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'credentials', '.env'))
    load_dotenv(dotenv_path)
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

    # Set appropriate permissions for Linux/macOS
    if platform.system() != "Windows":
        Popen('chmod og-rw ~/.netrc', shell=True)
    else:
        # Copy dodsrc to working directory in Windows

        #auth_dir = os.path.join(os.getcwd(), 'credentials')
        auth_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'credentials'))

        shutil.copy2(os.path.join(homeDir, '.dodsrc'), auth_dir)
        print('Copied .dodsrc to:', auth_dir)


    ####################################################################################################################


    ## PASO 3: Proceso de descarga de las imagenes IMERG

    download_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'ARG_late'))

    # Si la carpeta 'ARG_late' existe
    #if os.path.exists(download_dir):
        # Borramos todo el contenido de la carpeta
     #   shutil.rmtree(download_dir)
        # Creamos de nuevo la carpeta vacía
      #  os.makedirs(download_dir)
    #else:
     #   os.makedirs(download_dir)
    
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




if __name__ == '__main__':
    download_subset()
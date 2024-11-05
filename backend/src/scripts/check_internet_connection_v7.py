import os
from dotenv import load_dotenv
import socket

###################################################################################################################################

## Funcion check_internet_connection: Sirve para determinar si hay conectividad a Internet.  
#  1. La funcion recibe como parametros "host" el cual tiene asignado la dirección IP a la que se quiere intentar conectar, que en 
#     este caso, es la IP "8.8.8.8", que pertenece a uno de los servidores DNS de Google siendo un servicio confiable y casi siempre 
#     está en línea. Luego tenemos "port", que es el puerto al que se quiere conectar, que en este caso es el puerto 53, el cual es 
#     utilizado por el protocolo DNS para resolver nombres de dominio. Y por ultimo tenemos a "timeout" que es el tiempo en segundos 
#     que se espera antes de que se agote el tiempo de la conexión.
#  2. Como primera medida, establecemos el tiempo de espera predeterminado para todas las operaciones de red en el socket. De esta 
#     forma aseguramos que las conexiones que tarden más de 3 segundos sean consideradas fallidas. El modulo "socket" permite trabajar 
#     con conexiones de red, proporcionando una interfaz para crear y manejar conexiones TCP/IP y UDP. Dicho esto, creamos un "socket" 
#     de tipo "AF_INET" (familia de direcciones de IPv4) y de tipo "SOCK_STREAM" (socket orientado a la conexión, es decir, TCP), que 
#     va a intentar conectarse al host y puerto especificados. Si la conexión es exitosa, significa que hay conectividad a Internet, 
#     y la función retorna "True". Si ocurre un error en la conexión, por ejemplo, si no hay acceso a Internet o el servidor no 
#     responde, la excepción es capturada y la funcion retorna "False".

def check_internet_connection():

    dotenv_path = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'credentials', '.env'))
    load_dotenv(dotenv_path)
    host = os.getenv('CHECK_INTERNET_HOST')
    port = int(os.getenv('CHECK_INTERNET_PORT'))
    timeout = 3

    try:
        socket.setdefaulttimeout(timeout)
        socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect((host, port))
        return True
    except socket.error:
        return False
    



if __name__ == '__main__':
    if check_internet_connection():
        print("Hay conexión a Internet !")
    else:
        print("No hay conexión a Internet :(")
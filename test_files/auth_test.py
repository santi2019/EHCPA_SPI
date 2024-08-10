#Generador de credenciales (si se ven en la terminal)

from subprocess import Popen
import platform
import os
import shutil

urs = 'urs.earthdata.nasa.gov'    # Earthdata URL to call for authentication
print('Autenticacion en NASA Earthdata')
prompts = ['Username: ', 'Password: ']

homeDir = os.path.expanduser("~") + os.sep

with open(homeDir + '.netrc', 'w') as file:
    username = input(prompts[0])
    password = input(prompts[1])
    file.write('machine {} login {} password {}\n'.format(urs, username, password))
    
with open(homeDir + '.urs_cookies', 'w') as file:
    file.write('')
    
with open(homeDir + '.dodsrc', 'w') as file:
    file.write('HTTP.COOKIEJAR={}.urs_cookies\n'.format(homeDir))
    file.write('HTTP.NETRC={}.netrc'.format(homeDir))

print('Saved .netrc, .urs_cookies, and .dodsrc to:', homeDir)

if platform.system() != "Windows":
    Popen('chmod og-rw ~/.netrc', shell=True)
else:

    auth_dir = os.path.join(os.getcwd(), 'auth')

    # Crear la carpeta 'auth' si no existe
    if not os.path.exists(auth_dir):
        os.makedirs(auth_dir)

    # Copiar el archivo .dodsrc a la subcarpeta 'auth'
    shutil.copy2(os.path.join(homeDir, '.dodsrc'), auth_dir)
    print('Copied .dodsrc to:', os.getcwd())
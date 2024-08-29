from subprocess import Popen
from getpass import getpass
import platform
import os
import shutil
from dotenv import load_dotenv


## Proceso de generacion de credenciales

urs = 'urs.earthdata.nasa.gov'    # Earthdata URL to call for authentication
dotenv_path = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'credentials', '.env'))
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

    auth_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'credentials'))

    shutil.copy2(os.path.join(homeDir, '.dodsrc'), auth_dir)
    print('Copied .dodsrc to:', auth_dir)
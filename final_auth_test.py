#Generador de credenciales (con interfaz grafica)

from subprocess import Popen
import platform
import os
import shutil
import tkinter as tk
from tkinter import messagebox 




def guardar_datos_autenticacion(username, password):
    
    if not username or not password:
        messagebox.showerror(title="Error", message="Los campos de usuario y contraseña no pueden estar vacíos")
        return
    
    urs = 'urs.earthdata.nasa.gov'    # Earthdata URL to call for authentication
    homeDir = os.path.expanduser("~") + os.sep

    with open(homeDir + '.netrc', 'w') as file:
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
        shutil.copy2(homeDir + '.dodsrc', os.getcwd())
        print('Copied .dodsrc to:', os.getcwd())

    messagebox.showinfo(title="Exitoso", message="Se han guardado los datos de autenticación con éxito")





def login():
    username = username_entry.get()
    password = password_entry.get()
    
    # Llamar a la función para guardar los datos de autenticación
    guardar_datos_autenticacion(username, password)




window = tk.Tk()

window.geometry("800x500")
window.title("Test")

login_label = tk.Label(window, text="Generador de credenciales de NASA Earthdata")
username_label = tk.Label(window, text="Nombre de usuario")
username_entry = tk.Entry(window)
password_label = tk.Label(window, text="Contraseña")
password_entry = tk.Entry(window, show="*")
login_button = tk.Button(window, text="Confirmar", command=login)

login_label.grid(row=0, column=0, columnspan=2)
username_label.grid(row=1, column=0)
username_entry.grid(row=1, column=1)
password_label.grid(row=2, column=0)
password_entry.grid(row=2, column=1)
login_button.grid(row=3, column=0, columnspan=2)

window.mainloop()
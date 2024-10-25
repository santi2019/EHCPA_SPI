import time

## Funcion sleep_for_a_bit(): Sirve para generar un delay, con el objetivo de evitar colisiones entre las 
#                             funciones de los procesos.
#       - La funcion recibe como parametros los segundos deseados para pausar el proceso, y se utiliza el modulo
#         "sleep" de la libraria "time", para pausar la ejecucion durante el tiempo definido.
def sleep_for_a_bit(seconds):
    print(f"Pausando proceso por {seconds} segundo(s)")
    time.sleep(seconds)
    print("Fin de la pausa, continuando proceso...")




if __name__ == '__main__':
    sleep_for_a_bit(5)
import os
import subprocess

# Directorio donde se encuentra el archivo concatenado
input_dir = os.path.join(os.getcwd(), 'input')


# Nombre del archivo NetCDF original y reordenado
input_file = os.path.join(input_dir, 'IMERG_late_concat.nc4')
output_file = os.path.join(input_dir, 'IMERG_reord.nc4')

# Comando para reordenar las dimensiones lat y lon
command = ['ncpdq', '-a', 'lat,lon', input_file, output_file]

try:
    # Ejecutar el comando
    result = subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    print(f"Archivo reordenado guardado en: {output_file}")
    if result.stdout:
        print("Salida del comando:", result.stdout)
    if result.stderr:
        print("Errores durante la ejecución:", result.stderr)

except subprocess.CalledProcessError as e:
    print(f"Error al ejecutar el comando: {e.stderr}")
except FileNotFoundError:
    print("El comando 'ncpdq' no fue encontrado")

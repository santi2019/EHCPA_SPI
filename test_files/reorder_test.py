import os
import subprocess

# Directorio donde se encuentra el archivo concatenado
input_dir = os.path.join(os.getcwd(), 'input')

# Directorio donde se guardará el archivo reordenado
output_dir = os.path.join(os.getcwd(), 'output')

# Si la carpeta de destino no existe, la creamos
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Nombre del archivo NetCDF original y reordenado
input_file = os.path.join(input_dir, 'IMERG_late_concat.nc4')
output_file = os.path.join(output_dir, 'IMERG_reord.nc4')

# Función para ejecutar el comando ncpdq
def reorder_netcdf_dimensions(input_file, output_file):
    try:
        # Comando para reordenar las dimensiones lat y lon
        command = ['ncpdq', '-a', 'lat,lon', input_file, output_file]

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
        print("El comando 'ncpdq' no fue encontrado. Asegúrate de que NCO esté instalado y en el PATH.")

# Ejecutar la función de reordenamiento
reorder_netcdf_dimensions(input_file, output_file)

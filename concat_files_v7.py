import os
import xarray as xr

# Directorio donde se encuentran los archivos acumulados mensuales
input_dir = os.path.join(os.getcwd(), 'IMERG_late_month')

# Directorio donde se guardará el archivo concatenado
output_dir = os.path.join(os.getcwd(), 'input')

# Si la carpeta de destino no existe, la creamos
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Lista de archivos netCDF en el directorio de entrada
monthly_files = [os.path.join(input_dir, f) for f in os.listdir(input_dir) if f.endswith('.nc4')]

# Concatenar todos los archivos a lo largo de la dimensión 'time'
ds_concat = xr.open_mfdataset(monthly_files, combine='by_coords')

# Guardar el archivo concatenado en la carpeta 'input'
output_file = os.path.join(output_dir, 'IMERG_late_concat.nc4')
ds_concat.to_netcdf(output_file, unlimited_dims=['time'])

print(f"Archivo concatenado guardado en: {output_file}")

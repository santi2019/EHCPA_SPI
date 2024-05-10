import os
import pandas as pd
import xarray as xr


# Directorio donde se encuentran los archivos de IMERG
input_dir = 'D:/Santiago/Documentos/EHCPA_SPI/ARG_Late'

# Directorio donde se guardarán los archivos de acumulado mensual
output_dir = 'D:/Santiago/Documentos/EHCPA_SPI/IMERG_late_month'

# Si la carpeta de destino no existe, la creamos
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Lista de archivos de IMERG en el directorio de entrada
files = os.listdir(input_dir)

# Calcular la cantidad de archivos en el directorio ARG_Late
num_files = len(files)
print("Cantidad de archivos en el directorio ARG_Late:", num_files)

# Filtrar archivos de IMERG que contienen la cadena "IMERG"
files = [f for f in files if 'IMERG' in f]

try:
    for file in files:
        # Abrir el archivo de IMERG
        ds = xr.open_dataset(os.path.join(input_dir, file))

        # Extraer el año y el mes del archivo de IMERG
        year = str(ds.time.dt.year.values[0])
        month = str(ds.time.dt.month.values[0]).zfill(2)

        # Concatenar los archivos diarios correspondientes al mes
        daily_files = [f for f in files if year+month in f]
        ds_month = xr.open_mfdataset([os.path.join(input_dir, f) for f in daily_files], combine='by_coords')

        # Calcular el acumulado mensual de precipitación
        monthly_precip = ds_month['precipitationCal'].sum(dim='time')
        
        # Agregar atributos a la variable mensual de precipitación
        monthly_precip.attrs['long_name'] = 'Monthly accumulated precipitation (combined microwave-IR) estimate'
        monthly_precip.attrs['units'] = 'mm'
        monthly_precip.attrs['_FillValue'] = -9999.9
        monthly_precip.attrs['missing_value'] = -9999.9

        # Reordenar las dimensiones y agregar la dimensión de tiempo
        monthly_precip = monthly_precip.expand_dims(dim='time')
        monthly_precip = monthly_precip.transpose('time', 'lon', 'lat')

        # Crear una variable de tiempo y agregarla al conjunto de datos
        time_var = pd.date_range(start=f'{year}-{month}-01', periods=1, freq='MS')
        ds_out = xr.Dataset({'precipitation': monthly_precip}, coords={'time': time_var, 'lon': monthly_precip.lon, 'lat': monthly_precip.lat})

        # Guardar el archivo de acumulado mensual en el directorio de salida
        output_file = os.path.join(output_dir, f'IMERG_monthly_accumulated_precip_{year}_{month}.nc4')
        ds_out.to_netcdf(output_file)

    print("El procesamiento se completó con exito")

except KeyboardInterrupt:
    print('El procesamiento fue cancelado')




import os
import pandas as pd
import xarray as xr


def p_acu_mensual():
    
    ## Distribucion de carpetas/directorios:
    #
    #   - arg_late_dir: Carpeta donde se encuentran los archivos IMERG de precipitacion diaria.
    #   - IMERG_late_month_dir: Carpeta donde se van a guardar los archivos de precipitacion mensual acumulada.
    #
    #   - Si la carpeta IMERG_late_month_dir no existe, se crea.

    arg_late_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'ARG_late'))      # input_dir = os.path.join(os.getcwd(), 'ARG_late')

    IMERG_late_month_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'IMERG_late_month'))     # output_dir = os.path.join(os.getcwd(), 'IMERG_late_month')

    if not os.path.exists(IMERG_late_month_dir):
        os.makedirs(IMERG_late_month_dir)

    ####################################################################################################################

    ## PROCEDIMIENTO:  
    #     - Creamos una lista que contenga todos los archivos IMERG de precipitacion diaria en el directorio de entrada
    #       y calculamos la cantidad de archivos en el mismo. Se aplica un filtro a los archivos, dejando aquellos que
    #       que solo contienen la palabra "IMERG" para ser procesados, y esto es asi ya que la descarga desde la API de
    #       la NASA provee dos archivos PDF. 
    #     - Iteramos sobre cada uno de los archivos de entrada, y extraemos el año y el mes de cada uno, y concatenamos
    #       en funcion del mes, es decir, concatenamos aquellos que pertenezcan al mismo mes.
    #     - El acumulado mensual es basicamente la suma de la variable presipitacion de todos los archivos a traves de 
    #       la variable "time". Luego de calcularlo, agregamos atributos a la variable mensual de precipitación, como
    #       una descripcion de la variable, unidad de medida, y valores para representar datos faltantes.
    #     - Expandimos la dimensión time para agregar el mes como una dimensión temporal, y aplicamos un reordenamiento
    #       de las dimensiones para asegurar que "time" este primero, seguido de "lon" y "lat". Configuramos la variable
    #       "precipitation" aplicando una variable "time_var" para representar el tiempo correspondiente al mes de los 
    #       datos procesados (el primer dia del mes), como asi tambien la longitud y latitud extraidas del archivo 
    #       original. 
    #     - Finalmente, los acumulados son guardados como archivos netCDF.

    files = os.listdir(arg_late_dir)
    num_files = len(files)
    print("Cantidad de archivos en el directorio ARG_late:", num_files)

    files = [f for f in files if 'IMERG' in f]

    for file in files:

        ds = xr.open_dataset(os.path.join(arg_late_dir, file))

        year = str(ds.time.dt.year.values[0])
        month = str(ds.time.dt.month.values[0]).zfill(2)

        daily_files = [f for f in files if year+month in f]
        ds_month = xr.open_mfdataset([os.path.join(arg_late_dir, f) for f in daily_files], combine='by_coords')

        monthly_precip = ds_month['precipitation'].sum(dim='time')
        
        monthly_precip.attrs['long_name'] = 'Monthly accumulated precipitation (combined microwave-IR) estimate'
        monthly_precip.attrs['units'] = 'mm'
        monthly_precip.attrs['_FillValue'] = -9999.9
        monthly_precip.attrs['missing_value'] = -9999.9

        monthly_precip = monthly_precip.expand_dims(dim='time')
        monthly_precip = monthly_precip.transpose('time', 'lon', 'lat')

        time_var = pd.date_range(start=f'{year}-{month}-01', periods=1, freq='MS')
        ds_out = xr.Dataset({'precipitation': monthly_precip}, coords={'time': time_var, 'lon': monthly_precip.lon, 'lat': monthly_precip.lat})

        output_file = os.path.join(IMERG_late_month_dir, f'IMERG_monthly_accumulated_precip_{year}_{month}.nc4')
        ds_out.to_netcdf(output_file)



if __name__ == '__main__':
    p_acu_mensual()
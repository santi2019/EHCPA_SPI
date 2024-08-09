import os
import pandas as pd
import numpy as pn
import xarray as xr
from subprocess import Popen


def concatenate_netcdf_files(input_dir, output_dir, output_filename):
    # Crear el directorio de salida si no existe
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Lista de archivos .nc4 en el directorio de entrada
    files = [os.path.join(input_dir, f) for f in os.listdir(input_dir) if f.endswith('.nc4')]

    # Lista para almacenar datasets
    datasets = []

    # Abrir y modificar cada archivo NetCDF
    for file in files:
        ds = xr.open_dataset(file)
        
        # Si la dimensión 'time' ya existe, no hacer nada. 
        # De lo contrario, expandir la dimensión 'time'.
        if 'time' not in ds.dims:
            ds = ds.expand_dims(dim='time')
        
        datasets.append(ds)

    # Concatenar todos los datasets a lo largo de la dimensión 'time'
    concatenated = xr.concat(datasets, dim='time')

    # Guardar el archivo concatenado
    output_path = os.path.join(output_dir, output_filename)
    concatenated.to_netcdf(output_path, mode='w')

    print(f"Archivo concatenado guardado en: {output_path}")

if __name__ == "__main__":
    input_dir = 'C:/Users/Santiago/EHCPA_SPI/IMERG_late_month'
    output_dir = 'C:/Users/Santiago/EHCPA_SPI/IMERG_late_month'
    output_filename = 'IMERG_late_concat.nc4'

    concatenate_netcdf_files(input_dir, output_dir, output_filename)


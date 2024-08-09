import xarray as xr
import os

def reorder_netcdf_dimensions(input_file, output_file, dim_order):
    # Abrir el archivo NetCDF
    ds = xr.open_dataset(input_file)
    
    # Reordenar las dimensiones
    ds = ds.transpose(*dim_order)
    
    # Guardar el archivo NetCDF con las dimensiones reordenadas
    ds.to_netcdf(output_file, mode='w')
    
    print(f"Archivo con dimensiones reordenadas guardado en: {output_file}")

if __name__ == "__main__":
    input_file = 'C:/Users/Santiago/EHCPA_SPI/IMERG_late_month/IMERG_late_concat.nc4'
    output_file = 'C:/Users/Santiago/EHCPA_SPI/IMERG_reord.nc4'
    dim_order = ('lat', 'lon', 'time')  # Orden de las dimensiones
    
    reorder_netcdf_dimensions(input_file, output_file, dim_order)

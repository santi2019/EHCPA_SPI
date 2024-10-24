import os
import zipfile
import locale
from datetime import datetime
from io import BytesIO
from flask import Flask, send_file, render_template, jsonify, request
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from main_v7 import ehcpa_process, remote_download_process
from src.scripts.get_dates_v7 import get_today_date, get_calibration_date, get_ARG_late_last_date


app = Flask(__name__)
cors = CORS(app, origins='*')

scheduler = BackgroundScheduler(daemon=True)
scheduler.add_job(ehcpa_process, 'cron', hour=3, misfire_grace_time=3600)
scheduler.add_job(remote_download_process, 'cron', minute='0,30', hour='20-23,0-2', misfire_grace_time=3600)
scheduler.start()


@app.route('/')
def home():
    return jsonify("backend connected!")


@app.route('/download/<id_data>', methods=['GET'])
def download_file(id_data):

    downloable_data_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'output', 'downloable_data'))
    PTM_dir = os.path.join(downloable_data_dir, 'PTM')
    SPI_dir = os.path.join(downloable_data_dir, 'SPI')
    
    spi_scales = ['1', '2', '3', '6', '9', '12', '24', '36', '48', '60', '72']

    calibration_end_year, calibration_end_month = get_calibration_date()

    
    ids = id_data.split(',')
    files_to_zip = []
    not_found_files = []

    for data_id in ids:
        if data_id == "PTM":
            file_path = os.path.join(PTM_dir, f'PTM_jun_2000_{calibration_end_month.rstrip(".")}_{calibration_end_year}_all_bands_ARG_cropped.tif')
        elif data_id.startswith("SPI_"):
            scale = data_id.split("_")[1]
            if scale in spi_scales:
                file_path = os.path.join(SPI_dir, f'SPI_jun_2000_{calibration_end_month.rstrip(".")}_{calibration_end_year}_scale_{scale}_all_bands_ARG_cropped.tif')
            else:
                return jsonify(message=f'La escala {scale} no es correcta.'), 400
        else:
            return jsonify(message=f'El identificador {data_id} no es correcto.'), 400

        if os.path.exists(file_path):
            files_to_zip.append(file_path)
        else:
            not_found_files.append(data_id)
           
    if not_found_files:
        if len(not_found_files) == 1:
            return jsonify(message=f'El archivo {not_found_files[0]} no se encuentra disponible para su descarga en este momento.'), 404
        else:
            return jsonify(message=f'Los siguientes archivos no están disponibles para su descarga en este momento: {", ".join(not_found_files)}'), 404



    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
        for file_path in files_to_zip:
            zip_file.write(file_path, os.path.basename(file_path)) 
    zip_buffer.seek(0)

    return send_file(zip_buffer, as_attachment=True, download_name='EHCPA_Data.zip', mimetype='application/zip')





@app.route('/get_dates', methods=['GET'])
def get_dates():
    # Obtener la fecha de hoy
    today_date = get_today_date()
    locale.setlocale(locale.LC_TIME, 'es_ES.UTF-8')
    date = datetime.strptime(today_date, '%Y-%m-%d')
    today_day = date.day
    today_month = date.strftime('%B').capitalize()
    today_year = date.year

    # Obtener la última fecha de banda
    ARG_late_last_date = get_ARG_late_last_date()
    if ARG_late_last_date != 'No disponible':
        date = datetime.strptime(ARG_late_last_date, '%d/%m/%Y')
        last_band_day = date.day
        last_band_month = date.strftime('%B').capitalize()
        last_band_year = date.year
    else:
        last_band_day = last_band_month = last_band_year = 'No Disponible'

    calibration_end_year, calibration_end_month = get_calibration_date()
    calibration_date_str = f"{calibration_end_month.rstrip('.')}_{calibration_end_year}"

    response = {
        'today_day': today_day,
        'today_month': today_month,
        'today_year': today_year,
        'last_band_day': last_band_day,
        'last_band_month': last_band_month,
        'last_band_year': last_band_year,
        'calibration_date': calibration_date_str
    }

    return jsonify(response)




if __name__ == "__main__":
    app.run(debug=True, use_reloader=False, port=8800)
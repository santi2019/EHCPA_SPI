import os
from flask import Flask, send_file, render_template, jsonify, request
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from main_v7 import ehcpa_process

app = Flask(__name__)
cors = CORS(app, origins='*')

scheduler = BackgroundScheduler(daemon=True)
scheduler.add_job(ehcpa_process, 'cron', hour=3, misfire_grace_time=3600)
scheduler.start()



@app.route('/')
def home():
    return render_template('index.html')


@app.route('/download/<id_data>', methods=['GET'])
def download_file(id_data):

    downloable_data_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'output', 'downloable_data'))
    spi_scales = ['1', '2', '3', '6', '9', '12', '24', '36', '48', '60', '72']
    
    if id_data == "PTM":
        file_path = os.path.join(downloable_data_dir, 'EHCPA_PTM_Data.zip')
    elif id_data in [f"SPI_{scale}" for scale in spi_scales]:
        scale = id_data.split('_')[-1]
        file_path = os.path.join(downloable_data_dir, f'EHCPA_SPI_scale_{scale}.zip')
    else:
        return jsonify(message='El identificador no es correcto.'), 400

    try:
        return send_file(file_path, as_attachment=True)
    except FileNotFoundError:
        return jsonify(message=f'Lo sentimos, el archivo {id_data} no se encuentra disponible para su descarga en este momento.'), 404
    except Exception as e:
        return jsonify(message=str(e)), 401
    


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False, port=8800)

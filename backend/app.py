import os
from flask import Flask, send_file, render_template, jsonify
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from main_v7 import ehcpa_process

app = Flask(__name__)
cors = CORS(app, origins='*')

scheduler = BackgroundScheduler(daemon=True)
scheduler.add_job(ehcpa_process, 'cron', hour=3)
scheduler.start()


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/download', methods=['GET'])
def download_file():
    zip_file = "EHCPA_Data.zip"

    try:
        return send_file(zip_file, as_attachment=True)
    except FileNotFoundError:
         return jsonify(message= 'Lo sentimos, los datos de EHCPA no se encuentran disponibles para su descarga en este momento.'), 404
    except Exception as e:
        return jsonify(message= str(e)), 401
    


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False, port=8800)

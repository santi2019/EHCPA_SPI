import time
from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask, send_file, render_template
from flask_cors import CORS
from main_v7 import ehcpa_process


app = Flask(__name__)

scheduler = BackgroundScheduler(daemon=True)
scheduler.add_job(ehcpa_process, 'cron', hour=3)
scheduler.start()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/download')
def download_file():
    return send_file("EHCPA_Data.zip", as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False, port=8080)

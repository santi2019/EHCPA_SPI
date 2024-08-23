import schedule
import time

def hola():
    print("Hola como estas")


schedule.every().day.at("22:21").do(hola)


while True:
    schedule.run_pending()
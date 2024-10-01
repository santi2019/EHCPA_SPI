from datetime import datetime
from dateutil.relativedelta import relativedelta


def get_calibration_date():
    today_date = datetime.today()

    next_year_first_day = (today_date + relativedelta(years=1)).replace(day=1).replace(month=1)
    comparison_next_year_first_day = next_year_first_day - relativedelta(years=1)

    next_year_third_day = (today_date + relativedelta(years=1)).replace(day=3).replace(month=1)
    comparison_next_year_third_day = next_year_third_day - relativedelta(years=1)

    next_month_third_day = (today_date + relativedelta(months=1)).replace(day=3)
    comparison_date = next_month_third_day - relativedelta(months=1)


    if today_date.date() < comparison_date.date():
        if(today_date.date() >= comparison_next_year_first_day.date() and today_date.date() < comparison_next_year_third_day.date()):
            calibration_end_year = today_date.year - 1
            calibration_end_month = (today_date - relativedelta(months=1)).strftime('%b').lower()
        else:
            calibration_end_year = today_date.year
            calibration_end_month = (today_date - relativedelta(months=1)).strftime('%b').lower()
    else:
        calibration_end_year = today_date.year
        calibration_end_month = today_date.strftime('%b').lower()
    
    return calibration_end_year, calibration_end_month



if __name__ == "__main__":
   get_calibration_date()

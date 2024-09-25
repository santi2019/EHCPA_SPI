import os
import re
from datetime import datetime
from dateutil.relativedelta import relativedelta

formatted_date = 0

def inspect_arglate():

    global formatted_date

    arg_late_dir = os.path.expanduser(os.path.join('~', 'EHCPA_SPI', 'backend', 'src', 'ARG_late'))

    files = [f for f in os.listdir(arg_late_dir) if os.path.isfile(os.path.join(arg_late_dir, f))]

    pattern = r'\d{8}'
    dated_files = [f for f in files if re.search(pattern, f)]

    if dated_files:
        latest_file = sorted(dated_files)[-1]

        match = re.search(pattern, latest_file)
        if match:
            date_str = match.group(0)  
            formatted_date = datetime.strptime(date_str, '%Y%m%d').strftime('%Y-%m-%d')
        else:
            formatted_date = 'No disponible'
    else:
        formatted_date = 'No disponible'


    return formatted_date



if __name__ == "__main__":
    inspect_arglate()
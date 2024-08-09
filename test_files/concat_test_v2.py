import os
import subprocess

class IMERGConcatenationProcess:

    def __init__(self, input_dir, output_file):
        self.input_dir = input_dir
        self.output_file = output_file

    def make_time_dimension_record(self):
        files = [f for f in os.listdir(self.input_dir) if f.endswith('.nc4')]

        for file in files:
            file_path = os.path.join(self.input_dir, file)
            command = f"ncks -O --mk_rec_dmn time {file_path} {file_path}"
            subprocess.run(command, shell=True, check=True)
            print(f"Processed file for record dimension: {file}")

    def concatenate_files(self):
        files_pattern = os.path.join(self.input_dir, "*.nc4")
        command = f"ncrcat -h {files_pattern} {self.output_file}"
        subprocess.run(command, shell=True, check=True)
        print(f"Concatenated file created: {self.output_file}")

    def run(self):
        self.make_time_dimension_record()
        self.concatenate_files()

if __name__ == "__main__":
    input_directory = 'C:/Users/Santiago/EHCPA_SPI/IMERG_late_month'
    output_filepath = 'C:/Users/Santiago/EHCPA_SPI/IMERG_late_concat.nc4'

    concat_process = IMERGConcatenationProcess(input_directory, output_filepath)
    concat_process.run()
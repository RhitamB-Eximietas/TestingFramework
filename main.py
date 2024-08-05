import subprocess
import time
import os
import csv
import shutil
import signal

def run_robot_tests(collection_name, environment_name):
    if environment_name is None:
        if collection_name:
            print(f"Running Robot Framework test with collection name: {collection_name}")
            result = subprocess.run(['robot', '--variable', f'COLLECTION:{collection_name}', '-d', 'Robot_framework/Output/', 'Robot_framework/TestingFW.robot'], capture_output=True, text=True)
            print(f"Output for {collection_name}:\n{result.stdout}")
            if result.stderr:
                print(f"Errors for {collection_name}:\n{result.stderr}")
    else:
        if collection_name:
            print(f"Running Robot Framework test with collection name: {collection_name}")
            result = subprocess.run(['robot', '--variable', f'COLLECTION:{collection_name}', '--variable', f'ENVIRONMENT:{environment_name}', '-d', 'Robot_framework/Output/', 'Robot_framework/TestingFW.robot'], capture_output=True, text=True)
            print(f"Output for {collection_name}:\n{result.stdout}")
            if result.stderr:
                print(f"Errors for {collection_name}:\n{result.stderr}")

def start_json_server(json_file):
    json_server_cmd = f'npx json-server {json_file}'
    print(f"Starting JSON server with file: {json_file}")
    try:
        json_server_process = subprocess.Popen(json_server_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    except FileNotFoundError:
        raise FileNotFoundError(f"Failed to start JSON server. Could not find 'npx' or 'json-server'.")
    return json_server_process

def run_node_script(script_path):
    print(f"Running Node.js script: {script_path}")
    result = subprocess.run(['node', script_path], capture_output=True, text=True)
    if result.stderr:
        print(f"Errors for {script_path}:\n{result.stderr}")

def stop_json_server(process):
    port = 3000
    if process:
        # process.terminate()
        # process.wait()
        json_server_stop =f'npx kill-port {port}'
        try:
            json_server_stop_process = subprocess.Popen(json_server_stop, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
            print("Stopping JSON server")
        except Exception as e:
            raise e(f'Failed to close server')


def copy_file(source, destination):
    os.makedirs(os.path.dirname(destination), exist_ok=True)
    shutil.copy2(source, destination)
    print(f"File copied from {source} to {destination}")

if __name__ == "__main__":
    file_path = './collection.csv'
    json_file = './Report/JSON/Host/newman_report.json'
    node_script = './htmltopdf/printToPDF.js'
    json_server_process = None

    try:
        with open(file_path, 'r', newline='') as file:
            reader = csv.reader(file, delimiter=',')
            next(reader)  # Skip the header
            for idx, row in enumerate(reader):
                print(f"Processing row {idx + 1}: {row}")
                if len(row) < 1:
                    print("Skipping incomplete row")
                    continue  # This ensures we only continue if the row is incomplete

                collection_path = row[0].strip()
                environment_path = row[1].strip() if len(row) > 1 else None

                if collection_path:
                    storage_path = f'Report/JSON/{collection_path}'
                    run_robot_tests(collection_path, environment_path)
                    copy_file(json_file, storage_path)

                    if json_server_process:
                        stop_json_server(json_server_process)
                        json_server_process = None

                    json_server_process = start_json_server(json_file)
                    time.sleep(2)
                    run_node_script(node_script)
                    time.sleep(5)

                    if json_server_process:
                        stop_json_server(json_server_process)
                        json_server_process = None

    except FileNotFoundError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    except KeyboardInterrupt:
        print('Terminated')
    finally:
        if json_server_process:
            stop_json_server(json_server_process)
            json_server_process = None
        print('End of process. Check the PDF Report folder.')

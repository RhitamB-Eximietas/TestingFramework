import subprocess
import time
import os

def run_robot_tests(collection_name):
    if collection_name:
        print(f"Running Robot Framework test with collection name: {collection_name}")
        result = subprocess.run(['robot', '--variable', f'collection:{collection_name}', '-d', 'Robot_framework/Output/', 'Robot_framework/TestingFW.robot'], capture_output=True, text=True)
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

if __name__ == "__main__":
    file_path = './collection.txt'
    json_file = './Report/JSON/newman_report.json'
    node_script = './htmltopdf/printToPDF.js'
    
    time.sleep(3)
    
    try:
        with open(file_path, 'r') as file:
            for line in file:
                collection_name = line.strip()
                if collection_name:
                    run_robot_tests(collection_name)
                    json_server_process = start_json_server(json_file)
                    run_node_script(node_script)
                    print("Stopping JSON server")
                    json_server_process.terminate()
                    json_server_process.wait()
    except FileNotFoundError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        print(f'End of process \nCheck the PDF Report folder.')

import re
from datetime import datetime, timedelta
import shutil
import os

# Function to extract and transform the data
def transform_js_to_python(js_file, new_file_name):
    with open(js_file, 'r') as file:
        content = file.read()
    
    # Find and extract the array of objects
    match = re.search(r'blocks\s*=\s*\[(.*?)]', content, re.DOTALL)
    if match:
        blocks_content = match.group(1)
        
        # Remove excessive spaces and new lines
        blocks_content = re.sub(r'\s+', ' ', blocks_content).strip()
        
        # Add a new line after each '},'
        blocks_content = re.sub(r'},\s*', '},\n    ', blocks_content)
        
        # Convert double quotes to single quotes
        blocks_content = blocks_content.replace('"', "'")
      
        # Write the result to the new file
        with open(new_file_name, 'w') as file:
            file.write(f"blocks = [\n    {blocks_content}]")

    else:
        print("Unable to find the 'blocks' array declaration in the file.")
        
# Function to find the latest file in the 'level' folder
def find_latest_file(directory):
    files = os.listdir(directory)
    files = [f for f in files if os.path.isfile(os.path.join(directory, f))]
    files.sort(key=lambda x: os.path.getmtime(os.path.join(directory, x)), reverse=True)
    return files[0] if files else None

# Main function
def main():
    # Get the directory where this script is located
    current_directory = os.path.dirname(os.path.abspath(__file__))

    # Build relative paths for the folders
    source_folder = current_directory  # The 'debug' folder
    destination_folder = os.path.join(current_directory, '..', 'level')  # The 'level' folder is one level up
    destination_folder_daily = os.path.join(current_directory, '..', 'script')  # The 'script' folder is one level up

    # Resolve absolute paths
    source_folder = os.path.abspath(source_folder)
    destination_folder = os.path.abspath(destination_folder)
    destination_folder_daily = os.path.abspath(destination_folder_daily)
    
    latest_file = find_latest_file(destination_folder)
    data_str = latest_file.replace('.js', '')
    
    # Convert the string to a datetime object
    data = datetime.strptime(data_str, '%Y%m%d')

    # Add one day
    incremented_date = data + timedelta(days=1)

    # Convert back to string in the desired format, e.g., 'YYYYMMDD'
    file_name = incremented_date.strftime('%Y%m%d') + '.js'
    
    # Full paths for the file
    source_path = os.path.join(source_folder, file_name)
    destination_path = os.path.join(destination_folder, file_name)
    destination_file_daily = os.path.join(destination_folder_daily, 'daily.js')
    
    transform_js_to_python(destination_file_daily, file_name)

    try:
        shutil.copy(source_path, destination_file_daily)
        shutil.move(source_path, destination_path)
        print('Done')
    except FileNotFoundError:
        print(f'The file {file_name} was not found in the folder {source_folder}')
    except Exception as e:
        print(f'An error occurred: {e}')

if __name__ == '__main__':
    main()

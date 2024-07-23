import re
import argparse
from datetime import datetime, timedelta
import shutil
import os

# Funzione per estrarre e trasformare i dati
def transform_js_to_python(js_file):
    with open(js_file, 'r') as file:
        content = file.read()
    
    # Trova e estrae l'array di oggetti
    match = re.search(r'blocks\s*=\s*\[(.*?)]', content, re.DOTALL)
    if match:
        blocks_content = match.group(1)
        
        # Rimuovi gli spazi e le nuove righe in eccesso
        blocks_content = re.sub(r'\s+', ' ', blocks_content).strip()
        
        # Aggiungi una nuova riga dopo ogni '},'
        blocks_content = re.sub(r'},\s*', '},\n    ', blocks_content)
        
        # Converti le virgolette doppie in singole
        blocks_content = blocks_content.replace('"', "'")
        
        # Ottieni la data attuale nel formato YYYYMMDD
        current_date = datetime.now()
        # Aggiungi un giorno
        tomorrow_date = current_date + timedelta(days=1)
        
        current_date = tomorrow_date.strftime('%Y%m%d')
        new_file_name = f"{current_date}.js"
        
        # Scrivi il risultato nel nuovo file
        with open(new_file_name, 'w') as file:
            file.write(f"blocks = [\n    {blocks_content}]")
            
        return new_file_name
    else:
        print("Impossibile trovare la dichiarazione dell'array 'blocks' nel file.")

# Configura argparse per gestire l'input del nome del file
def main():
    parser = argparse.ArgumentParser(description='Trasforma una variabile JS in blocks = []')
    parser.add_argument('input_file', type=str, help='Nome del file JS')
    
    args = parser.parse_args()
    
    # Esegui la trasformazione
    file_name = transform_js_to_python(args.input_file)
    
    
    # Ottieni la directory in cui si trova questo script
    current_directory = os.path.dirname(os.path.abspath(__file__))

    # Costruisci i percorsi relativi per le cartelle
    source_folder = current_directory  # La cartella 'debug'
    destination_folder = os.path.join(current_directory, '..', 'level')  # La cartella 'level' è un livello sopra
    destination_folder_daily = os.path.join(current_directory, '..', 'script')  # La cartella 'level' è un livello sopra
    

    # Risolvi i percorsi assoluti
    source_folder = os.path.abspath(source_folder)
    destination_folder = os.path.abspath(destination_folder)
    destination_folder_daily = os.path.abspath(destination_folder_daily)
    

    # Percorsi completi del file
    source_path = os.path.join(source_folder, file_name)
    destination_path = os.path.join(destination_folder, file_name)
    destination_folder_daily = os.path.join(destination_folder_daily, 'daily.js')
    

    # Spostamento del file
    try:
        shutil.copy(source_path, destination_folder_daily) 
        shutil.move(source_path, destination_path)
        print(f'Fatto')
    except FileNotFoundError:
        print(f'Il file {file_name} non è stato trovato nella cartella {source_folder}')
    except Exception as e:
        print(f'Si è verificato un errore: {e}')


if __name__ == '__main__':
    main()

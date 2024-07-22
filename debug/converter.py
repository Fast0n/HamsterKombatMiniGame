import re
import argparse

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
        
        # Scrivi il risultato nello stesso file di input
        with open(js_file, 'w') as file:
            file.write(f"blocks = [\n    {blocks_content}]")
    else:
        print("Impossibile trovare la dichiarazione dell'array 'blocks' nel file.")

# Configura argparse per gestire l'input del nome del file
def main():
    parser = argparse.ArgumentParser(description='Trasforma un file JS in formato Python.')
    parser.add_argument('input_file', type=str, help='Nome del file JS da trasformare')
    
    args = parser.parse_args()
    
    # Esegui la trasformazione
    transform_js_to_python(args.input_file)

if __name__ == '__main__':
    main()

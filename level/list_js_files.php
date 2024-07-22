<?php
// Specifica la directory dove si trovano i file .js
$directoryPath = __DIR__; // __DIR__ rappresenta la directory corrente

// Ottieni l'elenco dei file nella directory
$files = array_diff(scandir($directoryPath), array('..', '.'));
$jsFiles = array_filter($files, function($file) {
    return pathinfo($file, PATHINFO_EXTENSION) === 'js' && preg_match('/\d/', pathinfo($file, PATHINFO_FILENAME));
});

// Inizializza una stringa per contenere gli elementi della lista
$listItems = '';
$lastFile = end($jsFiles); // Ottieni l'ultimo file della lista

foreach ($jsFiles as $file) {
    // Rimuovi l'estensione '.js' dal nome del file
    $fileNameWithoutExtension = pathinfo($file, PATHINFO_FILENAME);
    
    // Controlla se il nome del file è una data nel formato YYYYMMDD
    if (preg_match('/^\d{8}$/', $fileNameWithoutExtension)) {
        // Formatta la data nel formato YYYY-MM-DD
        $formattedDate = substr($fileNameWithoutExtension, 0, 4) . '-' . substr($fileNameWithoutExtension, 4, 2) . '-' . substr($fileNameWithoutExtension, 6, 2);
    } else {
        // Usa il nome del file senza modifiche se non è una data
        $formattedDate = htmlspecialchars($fileNameWithoutExtension);
    }
    
    // Aggiungi la classe 'ciao' solo all'ultimo elemento
    $classAttribute = ($file === $lastFile) ? ' class="active"' : '';
    
    $listItems .= '<li data-level="' . htmlspecialchars($fileNameWithoutExtension) . '"' . $classAttribute . '>Level ' . htmlspecialchars($formattedDate) . '</li>';
}

// Restituisci la lista come HTML
echo '<ul id="levelList">' . $listItems . '<br><div class="countdown" id="countdown"></div></ul>';
?>

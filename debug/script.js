// Variabili globali
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const bufferCanvas = document.createElement('canvas');
const bufferCtx = bufferCanvas.getContext('2d');
let gridSize = 6;
let cellSize;
let blocks = [];
const images = {};
let selectedBlock = null;
let initialX = 0;
let initialY = 0;
let startTime = null;
let animationFrameId = null;
let win = false;


// Variabili da aggiungere
const borderRadius = 4;
const padding = 2;
const borderWidth = 2; // Larghezza del bordo

// Funzioni principali
function resizeCanvas() {
    const size = Math.min(window.innerWidth, window.innerHeight / 1.5);
    canvas.width = size - 15;
    canvas.height = size - 15;
    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;
    cellSize = canvas.width / gridSize;
    drawGame(); // Ridisegna il gioco con le nuove dimensioni
}

function drawGame() {
    // Pulire il canvas di buffer
    bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
    bufferCtx.fillStyle = '#282828';
    bufferCtx.fillRect(0, 0, bufferCanvas.width, bufferCanvas.height);

    const starSize = 4; // Dimensione della stella (controlla le dimensioni complessive)

    function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        const step = Math.PI / spikes;
        const path = new Path2D();
        for (let i = 0; i < 2 * spikes; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = i * step;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            if (i === 0) {
                path.moveTo(x, y);
            } else {
                path.lineTo(x, y);
            }
        }
        path.closePath();
        ctx.fill(path);
        ctx.stroke(path);
    }

    const starOuterRadius = starSize; // Raggio esterno della stella
    const starInnerRadius = starSize / 2; // Raggio interno della stella (metà della dimensione)

    function drawStarsOnGrid() {
        const starFillColor = '#242424'; // Colore delle stelle
        const starStrokeColor = '#424242'; // Colore del bordo delle stelle
        const starStrokeWidth = 1; // Larghezza del bordo

        bufferCtx.fillStyle = starFillColor; // Colore di riempimento della stella
        bufferCtx.strokeStyle = starStrokeColor; // Colore del bordo
        bufferCtx.lineWidth = starStrokeWidth; // Larghezza del bordo

        for (let i = 0; i <= gridSize; i++) {
            for (let j = 0; j <= gridSize; j++) {
                // Calcola le coordinate della stella
                let x = i * cellSize;
                let y = j * cellSize;

                // Evita di disegnare le stelle sui bordi laterali
                if (x > 0 && x < canvas.width && y > 0 && y < canvas.height) {
                    drawStar(bufferCtx, x, y, 4, starOuterRadius, starInnerRadius);
                }
            }
        }
    }

    // Disegna la griglia
    function drawGrid() {
        bufferCtx.strokeStyle = '#424242';
        bufferCtx.lineWidth = 1;
        bufferCtx.lineJoin = 'round';
        bufferCtx.lineCap = 'round';

        // Disegna le linee verticali
        for (let i = 0; i <= gridSize; i++) {
            bufferCtx.beginPath();
            bufferCtx.moveTo(i * cellSize, 0);
            bufferCtx.lineTo(i * cellSize, canvas.height);
            bufferCtx.stroke();
        }

        // Disegna le linee orizzontali
        for (let i = 0; i <= gridSize; i++) {
            bufferCtx.beginPath();
            bufferCtx.moveTo(0, i * cellSize);
            bufferCtx.lineTo(canvas.width, i * cellSize);
            bufferCtx.stroke();
        }
    }

    // Disegna la griglia e le stelle
    drawGrid();
    drawStarsOnGrid();

    // Disegna gli oggetti sopra la griglia
    blocks.forEach(block => {
        drawBlock(bufferCtx, block.x, block.y, block.width, block.height, block.color);
    });

    // Disegna il buffer sul canvas principale
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bufferCanvas, 0, 0);

}

function moveBlock(block, dx, dy) {
    const newX = block.x + dx;
    const newY = block.y + dy;

    if (canMoveBlock(block, dx, dy)) {
        // Solo se il movimento è valido, avvia l'animazione
        animateMove(block, block.x, block.y, newX, newY, performance.now());
    }
}

function animateMove(block, startX, startY, endX, endY, startTime) {
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed, 1);
        const easedProgress = easeInOutCubic(progress);

        const dx = (endX - startX) * easedProgress;
        const dy = (endY - startY) * easedProgress;

        block.x = Math.round(startX + dx);
        block.y = Math.round(startY + dy);

        drawGame();

        if (progress < 1) {
            animationFrameId = requestAnimationFrame(step);
        } else {
            block.x = endX;
            block.y = endY;
            drawGame();
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    requestAnimationFrame(step);
}
function drawBlock(ctx, x, y, width, height, color) {
    const img = images[color];
    const drawX = x * cellSize + padding;
    const drawY = y * cellSize + padding;
    const drawWidth = width * cellSize - 2 * padding;
    const drawHeight = height * cellSize - 2 * padding;

    // Determina il colore di sfondo in base al colore del blocco
    let backgroundColor;
    if (color === 'red' || color === 'red2') {
        backgroundColor = "rgba(73, 34, 35, 0.5)"; // Colore di sfondo per blocchi rossi con 50% di trasparenza
    } else if (color === 'green' || color === 'green2') {
        backgroundColor = "rgba(35, 71, 34, 0.5)"; // Colore di sfondo per blocchi verdi con 50% di trasparenza
    } else if (color === 'key') {
        backgroundColor = "rgba(62, 59, 37, 0.5)"; // Colore di sfondo per blocchi chiave con 50% di trasparenza
    }

    // Salva il contesto corrente
    ctx.save();

    // Disegna il colore di sfondo
    ctx.fillStyle = backgroundColor;
    ctx.beginPath();
    ctx.moveTo(drawX + borderRadius, drawY);
    ctx.lineTo(drawX + drawWidth - borderRadius, drawY);
    ctx.quadraticCurveTo(drawX + drawWidth, drawY, drawX + drawWidth, drawY + borderRadius);
    ctx.lineTo(drawX + drawWidth, drawY + drawHeight - borderRadius);
    ctx.quadraticCurveTo(drawX + drawWidth, drawY + drawHeight, drawX + drawWidth - borderRadius, drawY + drawHeight);
    ctx.lineTo(drawX + borderRadius, drawY + drawHeight);
    ctx.quadraticCurveTo(drawX, drawY + drawHeight, drawX, drawY + drawHeight - borderRadius);
    ctx.lineTo(drawX, drawY + borderRadius);
    ctx.quadraticCurveTo(drawX, drawY, drawX + borderRadius, drawY);
    ctx.closePath();
    ctx.fill();

    // Disegna il blocco
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(drawX + borderRadius, drawY);
    ctx.lineTo(drawX + drawWidth - borderRadius, drawY);
    ctx.quadraticCurveTo(drawX + drawWidth, drawY, drawX + drawWidth, drawY + borderRadius);
    ctx.lineTo(drawX + drawWidth, drawY + drawHeight - borderRadius);
    ctx.quadraticCurveTo(drawX + drawWidth, drawY + drawHeight, drawX + drawWidth - borderRadius, drawY + drawHeight);
    ctx.lineTo(drawX + borderRadius, drawY + drawHeight);
    ctx.quadraticCurveTo(drawX, drawY + drawHeight, drawX, drawY + drawHeight - borderRadius);
    ctx.lineTo(drawX, drawY + borderRadius);
    ctx.quadraticCurveTo(drawX, drawY, drawX + borderRadius, drawY);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();

    // Disegna il bordo
    ctx.save();
    if (color === 'red' || color === 'red2'){
        ctx.strokeStyle = "#93282b";
    }
    else if (color === 'green' || color === 'green2') {
        ctx.strokeStyle = "#3d6535";
    }
    else if (color === 'key'){
        ctx.strokeStyle = "#819523";
    }
    ctx.lineWidth = borderWidth;
    ctx.beginPath();
    ctx.moveTo(drawX + borderRadius, drawY);
    ctx.lineTo(drawX + drawWidth - borderRadius, drawY);
    ctx.quadraticCurveTo(drawX + drawWidth, drawY, drawX + drawWidth, drawY + borderRadius);
    ctx.lineTo(drawX + drawWidth, drawY + drawHeight - borderRadius);
    ctx.quadraticCurveTo(drawX + drawWidth, drawY + drawHeight, drawX + drawWidth - borderRadius, drawY + drawHeight);
    ctx.lineTo(drawX + borderRadius, drawY + drawHeight);
    ctx.quadraticCurveTo(drawX, drawY + drawHeight, drawX, drawY + drawHeight - borderRadius);
    ctx.lineTo(drawX, drawY + borderRadius);
    ctx.quadraticCurveTo(drawX, drawY, drawX + borderRadius, drawY);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}



function canMoveBlock(block, dx, dy) {
    const newX = block.x + dx;
    const newY = block.y + dy;

    // Verifica che il blocco non esca dai limiti della griglia
    if (newX < 0 || newY < 0 ||
        newX + block.width > gridSize ||
        newY + block.height > gridSize) {
        return false;
    }

    // Verifica che il blocco non esca dai limiti del canvas
    if (newX < 0 || newY < 0 ||
        newX + block.width * cellSize > canvas.width ||
        newY + block.height * cellSize > canvas.height) {
        return false;
    }

    return true;
}




function getBlockAt(x, y) {
    return blocks.find(block => x >= block.x && x < block.x + block.width && y >= block.y && y < block.y + block.height);
}

// Funzioni di input
function startDrag(event) {
    const rect = canvas.getBoundingClientRect();
    let x, y;

    if (event.touches) {
        x = Math.floor((event.touches[0].clientX - rect.left) / cellSize);
        y = Math.floor((event.touches[0].clientY - rect.top) / cellSize);
    } else {
        x = Math.floor((event.clientX - rect.left) / cellSize);
        y = Math.floor((event.clientY - rect.top) / cellSize);
    }

    selectedBlock = getBlockAt(x, y);
    if (selectedBlock) {
        initialX = x - selectedBlock.x;
        initialY = y - selectedBlock.y;
        selectedBlock.clickCount = (selectedBlock.clickCount || 0) + 1;
    }
}

function drag(event) {
    if (selectedBlock) {
        const rect = canvas.getBoundingClientRect();
        let x, y;

        if (event.touches) {
            x = Math.floor((event.touches[0].clientX - rect.left) / cellSize);
            y = Math.floor((event.touches[0].clientY - rect.top) / cellSize);
        } else {
            x = Math.floor((event.clientX - rect.left) / cellSize);
            y = Math.floor((event.clientY - rect.top) / cellSize);
        }

        const dx = x - initialX - selectedBlock.x;
        const dy = y - initialY - selectedBlock.y;

        if (selectedBlock.color === 'red' && dx === 0  || selectedBlock.color === 'red2' && dx === 0 || selectedBlock.color === 'green' && dx === 0 || selectedBlock.color === 'green2' && dx === 0 || selectedBlock.color === 'key' && dx === 0) {
            moveBlock(selectedBlock, 0, dy);
        } else if ((selectedBlock.color === 'red' || selectedBlock.color === 'red2' || selectedBlock.color === 'green'||selectedBlock.color === 'green2'|| selectedBlock.color === 'key') && dy === 0) {
            moveBlock(selectedBlock, dx, 0);
        }
    }
}


function endDrag() {
    selectedBlock = null;
}

// Funzioni di utilità
function svgToDataURL(svg) {
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

function loadSVGs(callback) {
    let loadedCount = 0;
    const totalToLoad = Object.keys(svgFiles).length;

    for (const color in svgFiles) {
        images[color] = new Image();
        images[color].src = svgToDataURL(svgFiles[color]);
        images[color].onload = () => {
            loadedCount++;
            if (loadedCount === totalToLoad) {
                callback();
            }
        };
    }
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
}


// Funzioni di inizializzazione e gestione eventi
function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    document.addEventListener('DOMContentLoaded', function() {

        loadSVGs(drawGame);
    
        
    });
    

    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('mousemove', drag);
    canvas.addEventListener('mouseup', endDrag);
    canvas.addEventListener('touchstart', startDrag);
    canvas.addEventListener('touchmove', drag);
    canvas.addEventListener('touchend', endDrag);

    function preventDefault(event) {
        event.preventDefault();
    }

    function addEventListenerCompat(element, event, handler, options) {
        if (element.addEventListener) {
            element.addEventListener(event, handler, options);
        } else if (element.attachEvent) {
            element.attachEvent('on' + event, handler);
        }
    }

    // Prevenire lo scrolling della pagina su touchmove
    addEventListenerCompat(canvas, 'touchmove', preventDefault, {
        passive: false
    });

    // Prevenire lo scrolling della pagina su wheel
    addEventListenerCompat(canvas, 'wheel', preventDefault, {
        passive: false
    });
}

// Avvia l'inizializzazione
init();

// Funzione per aggiungere un blocco
function addBlock(x, y, color, width, height) {
    blocks.push({ x, y, color, width, height });
    drawGame(); // Ridisegna il gioco dopo aver aggiunto il blocco
}

// Funzione per rimuovere l'ultimo blocco
function removeLastBlock() {
    if (blocks.length > 0) {
        blocks.pop(); // Rimuovi l'ultimo blocco dall'array
        drawGame(); // Ridisegna il gioco dopo aver rimosso il blocco
    }
}

// Gestore di eventi per il pulsante 'red'
document.getElementById("red").addEventListener("click", function() {
    // Aggiungi un blocco rosso al canvas
    addBlock(0, 0, 'red', 1, 2);
});

// Gestore di eventi per il pulsante 'red2'
document.getElementById("red2").addEventListener("click", function() {
    // Aggiungi un blocco rosso al canvas
    addBlock(0, 0, 'red2', 1, 3);
});

// Gestore di eventi per il pulsante 'green'
document.getElementById("green").addEventListener("click", function() {
    // Aggiungi un blocco verde al canvas
    addBlock(0, 0, 'green', 2, 1);
});

// Gestore di eventi per il pulsante 'green2'
document.getElementById("green2").addEventListener("click", function() {
    // Aggiungi un blocco verde chiaro al canvas
    addBlock(0, 0, 'green2', 3, 1);
});

// Gestore di eventi per il pulsante 'key'
document.getElementById("key").addEventListener("click", function() {
    // Aggiungi un blocco 'key' al canvas
    addBlock(0, 0, 'key', 2, 1);
});

// Gestore di eventi per il pulsante 'save'
document.getElementById("save").addEventListener("click", function() {
    // Rimuovi tutte le proprietà clickCount da ogni oggetto in blocks
    blocks.forEach(block => {
        delete block.clickCount;
    });

    // Copia negli appunti
    navigator.clipboard.writeText('blocks = ' + JSON.stringify(blocks, null, 0)).then(function() {
        console.log('Copia negli appunti riuscita.');
        window.open("https://t.me/+7BENd-9CdiJiZWU0");
    }, function(err) {
        console.error('Errore durante la copia negli appunti: ', err);
    });
});

// Gestore di eventi per il pulsante 'erase'
document.getElementById("erase").addEventListener("click", function() {
    // Rimuovi l'ultimo blocco
    removeLastBlock();
});

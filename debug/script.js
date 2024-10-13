// Variabili globali
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const bufferCanvas = document.createElement('canvas');
const bufferCtx = bufferCanvas.getContext('2d');
let gridSize = 6;
let cellSize;
let blocks = [];
const images = {};

// Variabili da aggiungere
const borderRadius = 3;
const padding = 1.5;
const borderWidth = 1.5; // Larghezza del bordo

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

    const starSize = 3; // Dimensione della stella (controlla le dimensioni complessive)

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


function easeInOutCubic(t) {
    return t < 1 ? 1 * t * t * t : 1 - Math.pow(-1 * t + 1, 4) / 2;
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
    if (color === 'red' || color === 'red2') {
        ctx.strokeStyle = "#93282b";
    } else if (color === 'green' || color === 'green2') {
        ctx.strokeStyle = "#3d6535";
    } else if (color === 'key') {
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



// Funzioni di inizializzazione e gestione eventi
function init() {

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    document.addEventListener('DOMContentLoaded', function () {
        loadSVGs(drawGame);
    });
    
}

// Avvia l'inizializzazione
init();
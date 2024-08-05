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


// Funzione per muovere un blocco
function moveBlock(block, dx, dy) {
    const newX = block.x + dx;
    const newY = block.y + dy;

    if (canMoveBlock(block, dx, dy)) {
        animateMove(block, newX, newY);
    }
}


// Funzione per animare il blocco che esce dalla griglia
function animateKeyExit(block) {
    const exitDuration = 2000; // Durata dell'animazione in millisecondi
    const startTime = performance.now();
    const startX = block.x;
    const endX = gridSize; // Sposta il blocco fuori dalla griglia a destra

    function animate(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / exitDuration, 1); // Calcola il progresso dell'animazione
        // Calcola la posizione intermedia del blocco
        const x = startX + (endX - startX) * easeInOutCubic(progress);
        block.x = x;

        drawGame(); // Ridisegna il gioco con la nuova posizione del blocco

        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
        } else {

                canvas.removeEventListener('mousedown', startDrag);
                canvas.removeEventListener('mousemove', drag);
                canvas.removeEventListener('mouseup', endDrag);
                canvas.removeEventListener('touchstart', startDrag);
                canvas.removeEventListener('touchmove', drag);
                canvas.removeEventListener('touchend', endDrag);

                if (!win) {
                    alert('You Won');
                    win = true;
                    setTimeout(() => {
                        location.reload();
                    }, 2000);
                }

        }
    }

    animationFrameId = requestAnimationFrame(animate);
}

// Funzione per animare il movimento di un blocco
function animateMove(block, endX, endY) {
    // Imposta immediatamente le coordinate finali del blocco
    block.x = endX;
    block.y = endY;

    // Ridisegna la canvas per riflettere il nuovo stato del blocco
    drawGame();

    // Controlla se il blocco key è nella posizione vincente
    if (block.color === 'key' && block.x === 4 && block.y === 2) {
            animateKeyExit(block);
    }
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



// Funzione per verificare se un blocco può muoversi
function canMoveBlock(block, dx, dy) {
    const newX = block.x + dx;
    const newY = block.y + dy;

    // Verifica che il blocco non esca dai limiti della griglia
    if (newX < 0 || newY < 0 || newX + block.width > gridSize || newY + block.height > gridSize) {
        return false;
    }

    // Controlla la direzione di movimento consentita per il blocco
    if ((block.color === 'red' || block.color === 'red2') && dx !== 0) {
        return false; // Blocchi rossi possono muoversi solo verticalmente
    }

    if ((block.color === 'green' || block.color === 'green2' || block.color === 'key') && dy !== 0) {
        return false; // Blocchi verdi e chiave possono muoversi solo orizzontalmente
    }

    // Controlla la collisione con altri blocchi
    for (const otherBlock of blocks) {
        if (otherBlock === block) continue;

        const isColliding = !(newX + block.width <= otherBlock.x ||
            newX >= otherBlock.x + otherBlock.width ||
            newY + block.height <= otherBlock.y ||
            newY >= otherBlock.y + otherBlock.height);
        if (isColliding) {
            return false;
        }
    }

    // Prevenire il sorpasso dei blocchi
    for (const otherBlock of blocks) {
        if (otherBlock === block) continue;

        if (block.color === 'red' || block.color === 'red2') {
            // Blocchi rossi possono solo muoversi verticalmente
            if (dx === 0 && (newX === otherBlock.x || newX + block.width === otherBlock.x + otherBlock.width)) {
                const isOverlappingVertically = (dy > 0 && newY + block.height > otherBlock.y && block.y < otherBlock.y) ||
                    (dy < 0 && newY < otherBlock.y + otherBlock.height && block.y > otherBlock.y);
                if (isOverlappingVertically) {
                    // Se il blocco rosso è parzialmente o completamente sopra un altro blocco, il movimento non è consentito
                    return false;
                }
            }
        } else if (block.color === 'green' || block.color === 'green2' || block.color === 'key') {
            // Blocchi verdi e chiave possono solo muoversi orizzontalmente
            if (dy === 0 && (newY === otherBlock.y || newY + block.height === otherBlock.y + otherBlock.height)) {
                const isOverlappingHorizontally = (dx > 0 && newX + block.width > otherBlock.x && block.x < otherBlock.x) ||
                    (dx < 0 && newX < otherBlock.x + otherBlock.width && block.x > otherBlock.x);
                if (isOverlappingHorizontally) {
                    // Se il blocco verde o chiave è parzialmente o completamente sopra un altro blocco, il movimento non è consentito
                    return false;
                }
            }
        }
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
    }
}

// Funzione di drag e drop aggiornata
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

        if (dx !== 0 && dy !== 0) {
            return; // I blocchi non possono muoversi diagonalmente
        }

        if ((selectedBlock.color === 'red' || selectedBlock.color === 'red2') && dx === 0) {
            moveBlock(selectedBlock, 0, dy); // I blocchi rossi possono muoversi solo verticalmente
        } else if ((selectedBlock.color === 'green' || selectedBlock.color === 'green2' || selectedBlock.color === 'key') && dy === 0) {
            moveBlock(selectedBlock, dx, 0); // I blocchi verdi e chiave possono muoversi solo orizzontalmente
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

// Funzioni di aggiornamento e configurazione
function updateCountdown() {
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(21, 59, 30, 0);
    if (now > targetTime) targetTime.setDate(targetTime.getDate() + 1);

    const diff = targetTime - now;
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('countdown').textContent = `${hours}h ${minutes}m left until the next mini game`;
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

    document.addEventListener('DOMContentLoaded', function () {
        setInterval(updateCountdown, 1000);
        updateCountdown();
        loadSVGs(drawGame);

        const levelList = document.getElementById('levelList');

        function getCurrentDate() {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return `${year}${month}${day}`;
        }

        function addOneDay(dateString) {
            const year = parseInt(dateString.substring(0, 4), 10);
            const month = parseInt(dateString.substring(4, 6), 10) - 1;
            const day = parseInt(dateString.substring(6, 8), 10);
            const date = new Date(year, month, day);
            date.setDate(date.getDate() + 1);
            return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        }

        function formatDate(dateString) {
            return `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-${dateString.substring(6, 8)}`;
        }

        const startDate = '20240720'; // Formato string per coerenza
        let endDate = getCurrentDate();

        const now = new Date();
        if (now.getHours() >= 22) {
            endDate = addOneDay(endDate);
        }

        let dateArray = [];
        for (let date = startDate; date <= endDate; date = addOneDay(date)) {
            dateArray.push(date);
        }

        // Aggiungi un giorno extra e applica la classe 'disabled'
        const extraDate = addOneDay(endDate);
        dateArray.push(extraDate);

        let listItems = '';
        dateArray.slice().reverse().forEach(date => {
            const formattedDate = date.toString();
            if (date === endDate) {
                listItems += `<li data-level="${formattedDate}" class="active">Level ${formatDate(formattedDate)}</li>`;
            } else if (date === extraDate) {
                listItems += `<li data-level="${formattedDate}" class="disabled">Level ${formatDate(formattedDate)}</li>`;
            } else {
                listItems += `<li data-level="${formattedDate}">Level ${formatDate(formattedDate)}</li>`;
            }
        });


        levelList.innerHTML = listItems;

        const levelItems = document.querySelectorAll('#levelList li');
        levelItems.forEach(item => {
            item.addEventListener('click', () => {
                if (item.classList.contains('disabled')) return;

                const level = item.getAttribute('data-level');
                const script = document.createElement('script');
                script.src = `level/${level}.js`;
                script.onload = () => {
                    drawGame();
                };
                document.head.appendChild(script);

                levelItems.forEach(i => {
                    i.classList.remove('active');
                });
                item.classList.add('active');
            });
        });
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
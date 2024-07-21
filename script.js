const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const bufferCanvas = document.createElement('canvas');
const bufferCtx = bufferCanvas.getContext('2d');

const gridSize = 6;
const cellSize = canvas.width / gridSize;

document.addEventListener('DOMContentLoaded', (event) => {
    const levelItems = document.querySelectorAll('#levelList li');

    levelItems.forEach(item => {
        item.addEventListener('click', () => {
            const level = item.getAttribute('data-level');
                // Carica dinamicamente il file JavaScript
                const script = document.createElement('script');
                script.src = `level/${level}.js`;
                script.onload = () => {
                    // Quando il file è caricato, ricarica il canvas
                    drawGame();
                };
                document.head.appendChild(script);
            
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const levelList = document.getElementById('levelList');
    const items = levelList.getElementsByTagName('li');

    for (let item of items) {
        item.addEventListener('click', () => {
            // Rimuovi la classe 'active' da tutti gli elementi
            for (let i of items) {
                i.classList.remove('active');
            }
            // Aggiungi la classe 'active' all'elemento cliccato
            item.classList.add('active');
        });
    }
});


const images = {};

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

let blocks = [
    { x: 0, y: 0, color: 'red', width: 1, height: 2 },
    { x: 1, y: 0, color: 'green', width: 2, height: 1 },
    { x: 3, y: 1, color: 'green', width: 2, height: 1 },
    { x: 4, y: 0, color: 'green', width: 2, height: 1 },
    { x: 0, y: 2, color: 'key', width: 2, height: 1 },
    { x: 3, y: 2, color: 'red2', width: 1, height: 3 },
    { x: 5, y: 1, color: 'red', width: 1, height: 2 },
    { x: 2, y: 1, color: 'red', width: 1, height: 2 },
    { x: 4, y: 3, color: 'green', width: 2, height: 1 },
    { x: 1, y: 3, color: 'red2', width: 1, height: 3 },
    { x: 2, y: 5, color: 'green', width: 2, height: 1 },
    { x: 4, y: 4, color: 'red', width: 1, height: 2 },
]

let selectedBlock = null;
let initialX = 0;
let initialY = 0;
let startTime = null;
let animationFrameId = null;

bufferCanvas.width = canvas.width;
bufferCanvas.height = canvas.height;

function updateCountdown() {
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(21, 59, 30, 0);
    if (now > targetTime) targetTime.setDate(targetTime.getDate() + 1);

    const diff = targetTime - now;
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('countdown').textContent = `${hours}h ${minutes}m left until the next minigame`;
}

setInterval(updateCountdown, 1000);
updateCountdown();

function drawBlock(ctx, x, y, width, height, color) {
    const img = images[color];
    ctx.drawImage(img, x * cellSize, y * cellSize, width * cellSize, height * cellSize);
}

function drawGame() {
    bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
    bufferCtx.fillStyle = '#242424';
    bufferCtx.fillRect(0, 0, bufferCanvas.width, bufferCanvas.height);

    blocks.forEach(block => {
        drawBlock(bufferCtx, block.x, block.y, block.width, block.height, block.color);
    });

    bufferCtx.strokeStyle = '#2c2c2c';
    bufferCtx.lineWidth = 1;

    for (let i = 0; i <= gridSize; i++) {
        bufferCtx.beginPath();
        bufferCtx.moveTo(i * cellSize, 0);
        bufferCtx.lineTo(i * cellSize, canvas.height);
        bufferCtx.stroke();
    }

    for (let i = 0; i <= gridSize; i++) {
        bufferCtx.beginPath();
        bufferCtx.moveTo(0, i * cellSize);
        bufferCtx.lineTo(canvas.width, i * cellSize);
        bufferCtx.stroke();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bufferCanvas, 0, 0);
}

function getBlockAt(x, y) {
    return blocks.find(block => x >= block.x && x < block.x + block.width && y >= block.y && y < block.y + block.height);
}

function canMoveBlock(block, dx, dy) {
    const newX = block.x + dx;
    const newY = block.y + dy;
    for (let x = newX; x < newX + block.width; x++) {
        for (let y = newY; y < newY + block.height; y++) {
            if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
                return false;
            }
            if (getBlockAt(x, y) && getBlockAt(x, y) !== block) {
                return false;
            }
        }
    }
    return true;
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

let win = false;
function animateMove(block, startX, startY, endX, endY, startTime) {
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed , 1); // Modifica la durata qui
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

            if (block.color === 'key') {
                console.log(`Key block coordinates: x=${block.x}, y=${block.y}`);
                if (block.x === 4 && block.y === 2) {
                    canvas.removeEventListener('mousedown', startDrag);
                    canvas.removeEventListener('mousemove', drag);
                    canvas.removeEventListener('mouseup', endDrag);
                    canvas.removeEventListener('touchstart', startDrag);
                    canvas.removeEventListener('touchmove', drag);
                    canvas.removeEventListener('touchend', endDrag);
                    if (win == false){
                        alert('Hai vinto');
                        win = true
                    }
                }
            }
        }
    }

    requestAnimationFrame(step);
}

function moveBlock(block, dx, dy) {
    const newX = block.x + dx;
    const newY = block.y + dy;
    if (canMoveBlock(block, dx, dy)) {
        animateMove(block, block.x, block.y, newX, newY, performance.now());
    }
}

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

        if (selectedBlock.color === 'red' || selectedBlock.color === 'red2' && dx === 0) {
            moveBlock(selectedBlock, 0, dy);
        } else if ((selectedBlock.color === 'green' || selectedBlock.color === 'key') && dy === 0) {
            moveBlock(selectedBlock, dx, 0);
        }
    }
}

function endDrag() {
    selectedBlock = null;
}

canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', drag);
canvas.addEventListener('mouseup', endDrag);
canvas.addEventListener('touchstart', startDrag);
canvas.addEventListener('touchmove', drag);
canvas.addEventListener('touchend', endDrag);

loadSVGs(drawGame);

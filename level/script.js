const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const bufferCanvas = document.createElement('canvas');
const bufferCtx = bufferCanvas.getContext('2d');

function resizeCanvas() {

    const size = Math.min(window.innerWidth, window.innerHeight / 1.5);
    canvas.width = size - 15;
    canvas.height = size - 15;
}
// Chiamata iniziale per impostare le dimensioni al caricamento della pagina
resizeCanvas();

// Aggiungi un listener per ridimensionare il canvas quando la finestra cambia dimensione
window.addEventListener('resize', resizeCanvas);

const gridSize = 6;
const cellSize = canvas.width / gridSize;

document.addEventListener('DOMContentLoaded', function() {
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
        date.setDate(date.getDate() +1);
        return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    }

    function formatDate(dateString) {
        return `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-${dateString.substring(6, 8)}`;
    }

    const startDate = 20240720;
    let endDate = getCurrentDate();

    const now = new Date();
    const hours = now.getHours();
    if (hours >= 22 ) {
        endDate = addOneDay(endDate);
    }

    let listItems = '';

    for (let date = startDate; date <= endDate; date++) {
        const formattedDate = date.toString();
        if (date == endDate)
            listItems += `<li data-level="${formattedDate}" class="active">Level ${formatDate(formattedDate)}</li>`;
        else
            listItems += `<li data-level="${formattedDate}">Level ${formatDate(formattedDate)}</li>`;
    }

    levelList.innerHTML = `
        ${listItems}
        <br>
        <div class="countdown" id="countdown"></div>
    `;

    setInterval(updateCountdown, 1000);
    updateCountdown();
    loadSVGs(drawGame);

    const levelItems = document.querySelectorAll('#levelList li');
    levelItems.forEach(item => {
        item.addEventListener('click', () => {
            const level = item.getAttribute('data-level');
            const script = document.createElement('script');
            script.src = `${level}.js`;
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

let blocks = []

let selectedBlock = null;
let initialX = 0;
let initialY = 0;
let startTime = null;
let animationFrameId = null;

bufferCanvas.width = canvas.width;
bufferCanvas.height = canvas.height;

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

            if (block.color === 'key') {
                if (block.x === 4 && block.y === 2) {
                    canvas.removeEventListener('mousedown', startDrag);
                    canvas.removeEventListener('mousemove', drag);
                    canvas.removeEventListener('mouseup', endDrag);
                    canvas.removeEventListener('touchstart', startDrag);
                    canvas.removeEventListener('touchmove', drag);
                    canvas.removeEventListener('touchend', endDrag);
                    if (win == false) {
                        alert('Hai vinto');
                        win = true;
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

        if (selectedBlock.color === 'red' || (selectedBlock.color === 'red2' && dx === 0)) {
            moveBlock(selectedBlock, 0, dy);
        } else if ((selectedBlock.color === 'green' || selectedBlock.color === 'key'|| selectedBlock.color === 'green2') && dy === 0) {
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
addEventListenerCompat(canvas, 'touchmove', preventDefault, { passive: false });

// Prevenire lo scrolling della pagina su wheel
addEventListenerCompat(canvas, 'wheel', preventDefault, { passive: false });


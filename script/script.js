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

function moveBlock(block, dx, dy) {
    const newX = block.x + dx;
    const newY = block.y + dy;

    if (canMoveBlock(block, dx, dy)) {
        animateMove(block, block.x, block.y, newX, newY, performance.now());
    }
}

function animateMove(block, startX, startY, endX, endY, startTime) {
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        // usare sempre il valore 10
        const animation = 10;
        const progress = Math.min(elapsed / animation, 1);
        const easedProgress = easeInOutCubic(progress);

        const dx = (endX - startX) * easedProgress;
        const dy = (endY - startY) * easedProgress;

        block.x = startX + dx;
        block.y = startY + dy;

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
                    if (!win) {
                        alert('You Won');
                        win = true;
                    }
                }
            }
        }
    }

    requestAnimationFrame(step);
}

// Funzioni di gestione blocchi
function drawBlock(ctx, x, y, width, height, color) {
    const img = images[color];
    ctx.drawImage(img, x * cellSize, y * cellSize, width * cellSize, height * cellSize);
}

function canMoveBlock(block, dx, dy) {
    const newX = block.x + dx;
    const newY = block.y + dy;

    if (newX < 0 || newY < 0 || newX + block.width > gridSize || newY + block.height > gridSize) {
        return false;
    }

    for (const otherBlock of blocks) {
        if (otherBlock === block) continue;

        const newBlockWidth = block.width;
        const newBlockHeight = block.height;

        const otherBlockX = otherBlock.x;
        const otherBlockY = otherBlock.y;
        const otherBlockWidth = otherBlock.width;
        const otherBlockHeight = otherBlock.height;

        if (!(newX + newBlockWidth <= otherBlockX || newX >= otherBlockX + otherBlockWidth ||
                newY + newBlockHeight <= otherBlockY || newY >= otherBlockY + otherBlockHeight)) {
            return false;
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
            return;
        }

        if (selectedBlock.color === 'red' || selectedBlock.color === 'red2') {
            if (dx === 0) {
                moveBlock(selectedBlock, 0, dy);
            }
        } else if (selectedBlock.color === 'green' || selectedBlock.color === 'green2' || selectedBlock.color === 'key') {
            if (dy === 0) {
                moveBlock(selectedBlock, dx, 0);
            }
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

function setLevel() {
    const today = new Date();
    const tomorrow = new Date(today);
    const twoDaysAgo = new Date(today);

    if (new Date().getHours() >= 22) {
        today.setDate(today.getDate() + 1);
        tomorrow.setDate(today.getDate() + 1);
        twoDaysAgo.setDate(today.getDate() - 1);
    } else {
        tomorrow.setDate(today.getDate() + 1);
        twoDaysAgo.setDate(today.getDate() - 1);
    }

    const formattedToday_ = formatDate(today);
    const formattedTomorrow_ = formatDate(tomorrow);
    const formattedTwoDaysAgo_ = formatDate(twoDaysAgo);

    const formattedToday = formatDate(today).replace(/-/g, '');
    const formattedTomorrow = formatDate(tomorrow).replace(/-/g, '');
    const formattedTwoDaysAgo = formatDate(twoDaysAgo).replace(/-/g, '');

    const levelList = document.getElementById('levelList');
    levelList.innerHTML = `
        <li data-level="${formattedTwoDaysAgo}">Level ${formattedTwoDaysAgo_}</li>
        <li data-level="${formattedToday}" class="active" >Level ${formattedToday_}</li>
        <li data-level="${formattedTomorrow}" class="disabled" >Level ${formattedTomorrow_}</li>
        <br>
        <div class="countdown" id="countdown"></div>
    `;
}

// Funzioni di inizializzazione e gestione eventi
function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    document.addEventListener('DOMContentLoaded', function() {
        setInterval(updateCountdown, 1000);
        updateCountdown();
        setLevel();
        loadSVGs(drawGame);

        const levelItems = document.querySelectorAll('#levelList li');
        levelItems.forEach(item => {
            item.addEventListener('click', () => {
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
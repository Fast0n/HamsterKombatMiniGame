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

function drawBlock(ctx, x, y, width, height, color) {
    const img = images[color];
    ctx.drawImage(img, x * cellSize, y * cellSize, width * cellSize, height * cellSize);
}

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

    // Controlla se i blocchi rossi possono essere superati verticalmente
    if (block.color === 'red' || block.color === 'red2') {
        for (const otherBlock of blocks) {
            if (otherBlock === block) continue;

            if (block.x === otherBlock.x) {
                const isOverlappingVertically = (dy > 0 && newY + block.height > otherBlock.y && block.y < otherBlock.y) ||
                                                (dy < 0 && newY < otherBlock.y + otherBlock.height && block.y > otherBlock.y);
                if (isOverlappingVertically) {
                    // Verifica se la sovrapposizione è completa
                    const blockTop = block.y;
                    const blockBottom = block.y + block.height;
                    const otherBlockTop = otherBlock.y;
                    const otherBlockBottom = otherBlock.y + otherBlock.height;

                    // Se il blocco rosso è parzialmente o completamente coperto, il movimento non è consentito
                    if ((dy > 0 && (blockTop < otherBlockBottom && blockBottom > otherBlockTop)) ||
                        (dy < 0 && (blockTop < otherBlockBottom && blockBottom > otherBlockTop))) {
                        return false;
                    }
                }
            }
        }
    }

    // Controlla se i blocchi verdi o chiave possono superare un blocco rosso nella stessa riga
    if (block.color === 'green' || block.color === 'green2' || block.color === 'key') {
        for (const otherBlock of blocks) {
            if (otherBlock === block) continue;

            if (block.y === otherBlock.y) {
                const isOverlappingHorizontally = (dx > 0 && newX + block.width > otherBlock.x && block.x < otherBlock.x) ||
                                                  (dx < 0 && newX < otherBlock.x + otherBlock.width && block.x > otherBlock.x);
                if (isOverlappingHorizontally) {
                    if (otherBlock.color === 'red' || otherBlock.color === 'red2') {
                        return false;
                    }
                }
            }
        }
    }

    return true;
}





function moveBlock(block, dx, dy) {
    const newX = block.x + dx;
    const newY = block.y + dy;

    if (canMoveBlock(block, dx, dy)) {
        animateMove(block, block.x, block.y, newX, newY, performance.now());
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
            return; // I blocchi non possono muoversi diagonalmente
        }

        if ((selectedBlock.color === 'red' || selectedBlock.color === 'red2') && dx === 0) {
            moveBlock(selectedBlock, 0, dy); // I blocchi rossi possono muoversi solo verticalmente
        } else if ((selectedBlock.color === 'green' || selectedBlock.color === 'green2' || selectedBlock.color === 'key') && dy === 0) {
            moveBlock(selectedBlock, dx, 0); // I blocchi verdi e chiave possono muoversi solo orizzontalmente
        }
    }
}

function getBlockAt(x, y) {
    return blocks.find(block => x >= block.x && x < block.x + block.width && y >= block.y && y < block.y + block.height);
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

function endDrag() {
    selectedBlock = null;
}




function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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


function svgToDataURL(svg) {
    return 'data:image/svg+xml;base64,' + btoa(svg);
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


function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    document.addEventListener('DOMContentLoaded', function() {
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

        const startDate = 20240720;
        let endDate = getCurrentDate();

        const now = new Date();
        const hours = now.getHours();
        if (hours >= 22) {
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
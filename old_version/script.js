document.addEventListener('DOMContentLoaded', () => {
    const blocks = document.querySelectorAll('.block');
    const grid = document.querySelector('.grid');
    let activeBlock = null;
    let startX, startY, initialRowStart, initialColumnStart;
    let movingDirection = null;

    // Countdown
    function updateCountdown() {
        const now = new Date();
        const targetTime = new Date();
        targetTime.setHours(21, 59, 30, 0); // 21:00:00
        if (now > targetTime) targetTime.setDate(targetTime.getDate() + 1);

        const diff = targetTime - now;
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('countdown').textContent = `${hours}h ${minutes}m left until the next minigame`;
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // Funzione di aggancio alla griglia
    function snapToGrid(value, gridSize) {
        return Math.round(value / gridSize) * gridSize;
    }

    // Event listeners
    function initEventListeners() {
        blocks.forEach(block => {
            block.addEventListener('mousedown', startDrag);
            block.addEventListener('touchstart', startDrag);
        });
    }

    function startDrag(e) {
        activeBlock = e.currentTarget;
        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

        const style = window.getComputedStyle(activeBlock);
        initialRowStart = parseInt(style.getPropertyValue('grid-row-start'));
        initialColumnStart = parseInt(style.getPropertyValue('grid-column-start'));

        const moveEvent = e.type === 'touchstart' ? 'touchmove' : 'mousemove';
        const endEvent = e.type === 'touchstart' ? 'touchend' : 'mouseup';

        document.addEventListener(moveEvent, handleMove);
        document.addEventListener(endEvent, handleEnd);
    }

    function handleMove(e) {
        const x = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const y = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

        updatePosition(x, y);
    }

    function handleEnd(e) {
        const dx = (e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX) - startX;
        const dy = (e.type === 'touchend' ? e.changedTouches[0].clientY : e.clientY) - startY;

        finalizePosition(dx, dy);
        resetEventListeners(e.type);
    }

    function updatePosition(x, y) {
        if (!activeBlock) return;

        const dx = x - startX;
        const dy = y - startY;

        if (activeBlock.classList.contains('red') || activeBlock.classList.contains('red3')) {
            if (Math.abs(dy) > 5) {
                movingDirection = 'vertical';
                activeBlock.style.transform = `translateY(${dy}px)`;
            }
        } else if (activeBlock.classList.contains('green2') || activeBlock.classList.contains('yellow')) {
            if (Math.abs(dx) > 5) {
                movingDirection = 'horizontal';
                activeBlock.style.transform = `translateX(${dx}px)`;
            }
        }
    }

    function finalizePosition(dx, dy) {
        if (!activeBlock) return;

        let newRowStart = initialRowStart;
        let newColumnStart = initialColumnStart;

        if (movingDirection === 'vertical') {
            newRowStart += Math.round(dy / 45);
            newRowStart = snapToGrid(newRowStart, 1); // Aggancio alla griglia
        } else if (movingDirection === 'horizontal') {
            newColumnStart += Math.round(dx / 45);
            newColumnStart = snapToGrid(newColumnStart, 1); // Aggancio alla griglia
        }

        // Verifica se la nuova posizione è valida
        if (checkOverlap(newRowStart, newColumnStart)) {
            if (movingDirection === 'vertical') {
                activeBlock.style.gridRowStart = newRowStart;
            } else if (movingDirection === 'horizontal') {
                activeBlock.style.gridColumnStart = newColumnStart;
            }
        }

        activeBlock.style.transform = 'none';
    }

    function checkOverlap(newRowStart, newColumnStart) {
        const rect = activeBlock.getBoundingClientRect();
        const gridRect = grid.getBoundingClientRect();

        if (rect.top < gridRect.top || rect.left < gridRect.left ||
            rect.bottom > gridRect.bottom || rect.right > gridRect.right) {
            return false;
        }

        for (const block of blocks) {
            if (block === activeBlock) continue;

            const otherRect = block.getBoundingClientRect();
            if (!(rect.right < otherRect.left || rect.left > otherRect.right ||
                rect.bottom < otherRect.top || rect.top > otherRect.bottom)) {
                if (activeBlock.classList.contains('green2') && block.classList.contains('green2')) {
                    return false;
                }
                if (activeBlock.className !== block.className) {
                    return false;
                }
            }
        }

        return true;
    }

    function resetEventListeners(eventType) {
        const moveEvent = eventType === 'touchend' ? 'touchmove' : 'mousemove';
        const endEvent = eventType === 'touchend' ? 'touchend' : 'mouseup';

        document.removeEventListener(moveEvent, handleMove);
        document.removeEventListener(endEvent, handleEnd);

        activeBlock = null;
        movingDirection = null;
    }

    initEventListeners();
});

document.addEventListener('DOMContentLoaded', () => {
    const blocks = document.querySelectorAll('.block');
    let activeBlock = null;
    let startX, startY, initialRowStart, initialColumnStart;
    let movingDirection = null;


    
    blocks.forEach(block => {
        const startTouch = (e) => {
            activeBlock = block;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;

            const style = window.getComputedStyle(block);
            initialRowStart = parseInt(style.getPropertyValue('grid-row-start'));
            initialColumnStart = parseInt(style.getPropertyValue('grid-column-start'));

            document.addEventListener('touchmove', onTouchMove);
            document.addEventListener('touchend', onTouchEnd);
        };

        block.addEventListener('mousedown', (e) => {
            activeBlock = block;
            startX = e.clientX;
            startY = e.clientY;

            const style = window.getComputedStyle(block);
            initialRowStart = parseInt(style.getPropertyValue('grid-row-start'));
            initialColumnStart = parseInt(style.getPropertyValue('grid-column-start'));

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        block.addEventListener('touchstart', startTouch);
    });

    function onMouseMove(e) {
        if (!activeBlock) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

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

    function onTouchMove(e) {
        if (!activeBlock) return;

        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;

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

    function checkOverlap(newRowStart, newColumnStart) {
        const rect = activeBlock.getBoundingClientRect();
        const gridRect = document.querySelector('.grid').getBoundingClientRect();

        // Check for overlap with grid boundaries
        if (
            rect.top < gridRect.top || 
            rect.left < gridRect.left ||
            rect.bottom > gridRect.bottom || 
            rect.right > gridRect.right
        ) {
            return false;
        }

        // Check for overlap with other blocks of different color
        for (const block of blocks) {
            if (block === activeBlock) continue;

            const otherRect = block.getBoundingClientRect();
            if (
                !(rect.right < otherRect.left || 
                rect.left > otherRect.right || 
                rect.bottom < otherRect.top || 
                rect.top > otherRect.bottom)
            ) {
                // Check if the colors are different
                if (activeBlock.className !== block.className) {
                    return false; // There is overlap with a block of a different color
                }
            }
        }

        return true;
    }

    function onMouseUp(e) {
        if (!activeBlock) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newRowStart = initialRowStart;
        let newColumnStart = initialColumnStart;

        if (movingDirection === 'vertical') {
            newRowStart += Math.round(dy / 55);
            newRowStart = Math.max(1, Math.min(newRowStart, 6));
        } else if (movingDirection === 'horizontal') {
            newColumnStart += Math.round(dx / 55);
            newColumnStart = Math.max(1, Math.min(newColumnStart, 6));
        }

        if (checkOverlap(newRowStart, newColumnStart)) {
            if (movingDirection === 'vertical') {
                activeBlock.style.gridRowStart = newRowStart;
            } else if (movingDirection === 'horizontal') {
                activeBlock.style.gridColumnStart = newColumnStart;
            }
        }

        activeBlock.style.transform = 'none';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        activeBlock = null;
        movingDirection = null;
    }

    function onTouchEnd(e) {
        if (!activeBlock) return;

        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;

        let newRowStart = initialRowStart;
        let newColumnStart = initialColumnStart;

        if (movingDirection === 'vertical') {
            newRowStart += Math.round(dy / 55);
            newRowStart = Math.max(1, Math.min(newRowStart, 6));
        } else if (movingDirection === 'horizontal') {
            newColumnStart += Math.round(dx / 55);
            newColumnStart = Math.max(1, Math.min(newColumnStart, 6));
        }

        if (checkOverlap(newRowStart, newColumnStart)) {
            if (movingDirection === 'vertical') {
                activeBlock.style.gridRowStart = newRowStart;
            } else if (movingDirection === 'horizontal') {
                activeBlock.style.gridColumnStart = newColumnStart;
            }
        }

        activeBlock.style.transform = 'none';
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
        activeBlock = null;
        movingDirection = null;
    }
});

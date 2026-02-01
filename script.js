// 2048 Game Logic

class Game2048 {
    constructor() {
        this.gridSize = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore2048')) || 0;
        this.gameOver = false;
        
        this.gridElement = document.getElementById('grid');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.newGameButton = document.getElementById('new-game');
        
        this.init();
    }
    
    init() {
        this.initGame();
        this.setupEventListeners();
        this.setupTouchEvents();
        this.updateDisplay();
    }
    
    initGame() {
        this.grid = Array(this.gridSize).fill(null)
            .map(() => Array(this.gridSize).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        this.newGameButton.addEventListener('click', () => this.initGame());
        
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    this.move('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.move('right');
                    break;
            }
        });
    }
    
    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        
        if (emptyCells.length === 0) return;
        
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        
        // Mark as new for animation
        this.gridElement.querySelector(
            `[data-row="${randomCell.row}"][data-col="${randomCell.col}"]`
        )?.classList.add('new');
    }
    
    move(direction) {
        let moved = false;
        const rotatedGrid = this.rotateGrid(direction);
        
        for (let i = 0; i < this.gridSize; i++) {
            const row = rotatedGrid[i].filter(val => val !== 0);
            const mergedRow = [];
            let skip = false;
            
            for (let j = 0; j < row.length; j++) {
                if (skip) {
                    skip = false;
                    continue;
                }
                
                if (j + 1 < row.length && row[j] === row[j + 1]) {
                    const mergedValue = row[j] * 2;
                    mergedRow.push(mergedValue);
                    this.score += mergedValue;
                    skip = true;
                    moved = true;
                } else {
                    mergedRow.push(row[j]);
                }
            }
            
            while (mergedRow.length < this.gridSize) {
                mergedRow.push(0);
            }
            
            if (rotatedGrid[i].join(',') !== mergedRow.join(',')) {
                moved = true;
            }
            
            rotatedGrid[i] = mergedRow;
        }
        
        this.grid = this.unrotateGrid(rotatedGrid, direction);
        
        if (moved) {
            this.addRandomTile();
            this.updateDisplay();
            this.checkGameOver();
        }
    }
    
    rotateGrid(direction) {
        let rotated = JSON.parse(JSON.stringify(this.grid));
        
        switch (direction) {
            case 'up':
                // No rotation needed
                break;
            case 'down':
                rotated = rotated.reverse();
                break;
            case 'left':
                // Transpose
                rotated = this.transpose(rotated);
                break;
            case 'right':
                // Transpose and reverse
                rotated = this.transpose(rotated);
                rotated = rotated.map(row => row.reverse());
                break;
        }
        
        return rotated;
    }
    
    unrotateGrid(grid, direction) {
        let unrotated = JSON.parse(JSON.stringify(grid));
        
        switch (direction) {
            case 'up':
                // No unrotation needed
                break;
            case 'down':
                unrotated = unrotated.reverse();
                break;
            case 'left':
                // Transpose back
                unrotated = this.transpose(unrotated);
                break;
            case 'right':
                // Reverse and transpose back
                unrotated = unrotated.map(row => row.reverse());
                unrotated = this.transpose(unrotated);
                break;
        }
        
        return unrotated;
    }
    
    transpose(grid) {
        return grid[0].map((_, colIndex) => grid.map(row => row[colIndex]));
    }
    
    checkGameOver() {
        // Check for empty cells
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) return;
            }
        }
        
        // Check for possible merges
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const current = this.grid[i][j];
                if (j + 1 < this.gridSize && current === this.grid[i][j + 1]) return;
                if (i + 1 < this.gridSize && current === this.grid[i + 1][j]) return;
            }
        }
        
        this.gameOver = true;
        this.updateDisplay();
    }
    
    updateDisplay() {
        // Update score
        this.scoreElement.textContent = this.score;
        
        // Update best score
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore2048', this.bestScore);
        }
        this.bestScoreElement.textContent = this.bestScore;
        
        // Update grid display
        this.gridElement.innerHTML = '';
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.setAttribute('data-row', i);
                cell.setAttribute('data-col', j);
                
                const value = this.grid[i][j];
                if (value > 0) {
                    cell.textContent = value;
                    cell.setAttribute('data-value', value);
                }
                
                this.gridElement.appendChild(cell);
            }
        }
        
        // Show game over message
        if (this.gameOver) {
            const gameOverMessage = document.createElement('div');
            gameOverMessage.className = 'game-over';
            gameOverMessage.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgba(238, 228, 218, 0.73);
                padding: 20px 40px;
                border-radius: 10px;
                font-size: 32px;
                font-weight: bold;
                color: #776e65;
                z-index: 1000;
            `;
            gameOverMessage.textContent = '游戏结束！';
            this.gridElement.appendChild(gameOverMessage);
        }
    }
    
    setupTouchEvents() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        
        const grid = this.gridElement;
        
        grid.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        }, { passive: false });
        
        grid.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        grid.addEventListener('touchend', (e) => {
            if (this.gameOver) return;
            
            touchEndX = e.changedTouches[0].clientX;
            touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            const minSwipeDistance = 30;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        this.move('right');
                    } else {
                        this.move('left');
                    }
                }
            } else {
                // Vertical swipe
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        this.move('down');
                    } else {
                        this.move('up');
                    }
                }
            }
        }, { passive: true });
    }
}

// Start the game
const game = new Game2048();

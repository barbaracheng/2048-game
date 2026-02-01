/**
 * 2048 Game Logic
 * Optimized and refactored for better maintainability
 */

// Constants
const GRID_SIZE = 4;
const MIN_SWIPE_DISTANCE = 30;
const MERGE_THRESHOLD = 0.9; // 90% chance for 2, 10% chance for 4
const STORAGE_KEY = 'bestScore2048';

/**
 * 2048 Game Class
 * Manages game state, logic, and UI updates
 */
class Game2048 {
    constructor() {
        // Game state
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem(STORAGE_KEY)) || 0;
        this.gameOver = false;
        this.hasWon = false;
        
        // DOM elements
        this.gridElement = document.getElementById('grid');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.newGameButton = document.getElementById('new-game');
        
        // Touch state
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        this.init();
    }
    
    /**
     * Initialize the game
     */
    init() {
        this.initGame();
        this.setupEventListeners();
        this.setupTouchEvents();
        this.updateDisplay();
    }
    
    /**
     * Initialize/reset game state
     */
    initGame() {
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.gameOver = false;
        this.hasWon = false;
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
    }
    
    /**
     * Create an empty 4x4 grid
     */
    createEmptyGrid() {
        return Array(GRID_SIZE).fill(null)
            .map(() => Array(GRID_SIZE).fill(0));
    }
    
    /**
     * Set up keyboard event listeners
     */
    setupEventListeners() {
        this.newGameButton.addEventListener('click', () => this.initGame());
        
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    /**
     * Handle keyboard input
     */
    handleKeyDown(e) {
        if (this.gameOver) return;
        
        const direction = this.getDirectionFromKey(e.key);
        if (direction) {
            e.preventDefault();
            this.move(direction);
        }
    }
    
    /**
     * Get direction from keyboard key
     */
    getDirectionFromKey(key) {
        const keyMap = {
            'ArrowUp': 'up',
            'w': 'up', 'W': 'up',
            'ArrowDown': 'down',
            's': 'down', 'S': 'down',
            'ArrowLeft': 'left',
            'a': 'left', 'A': 'left',
            'ArrowRight': 'right',
            'd': 'right', 'D': 'right'
        };
        
        return keyMap[key];
    }
    
    /**
     * Add a random tile (2 or 4) to an empty cell
     */
    addRandomTile() {
        const emptyCells = this.getEmptyCells();
        
        if (emptyCells.length === 0) return;
        
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const value = Math.random() < MERGE_THRESHOLD ? 2 : 4;
        
        this.grid[randomCell.row][randomCell.col] = value;
        this.markCellAsNew(randomCell.row, randomCell.col);
    }
    
    /**
     * Get all empty cell positions
     */
    getEmptyCells() {
        const emptyCells = [];
        
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        
        return emptyCells;
    }
    
    /**
     * Mark a cell as new for animation
     */
    markCellAsNew(row, col) {
        const cell = this.gridElement.querySelector(
            `[data-row="${row}"][data-col="${col}"]`
        );
        if (cell) {
            cell.classList.add('new');
        }
    }
    
    /**
     * Move tiles in the specified direction
     */
    move(direction) {
        const result = this.processMove(direction);
        
        if (result.moved) {
            this.grid = result.grid;
            this.score = result.score;
            
            this.addRandomTile();
            this.updateDisplay();
            this.checkGameOver();
        }
    }
    
    /**
     * Process a move and return new grid state
     */
    processMove(direction) {
        const rotatedGrid = this.rotateGrid(direction);
        let moved = false;
        let newScore = this.score;
        
        for (let i = 0; i < GRID_SIZE; i++) {
            const processedRow = this.processRow(rotatedGrid[i], newScore);
            
            if (processedRow.moved) {
                moved = true;
            }
            
            newScore = processedRow.score;
            rotatedGrid[i] = processedRow.row;
        }
        
        return {
            grid: this.unrotateGrid(rotatedGrid, direction),
            moved,
            score: newScore
        };
    }
    
    /**
     * Process a single row (merge and shift)
     */
    processRow(row, currentScore) {
        const nonZeroTiles = row.filter(val => val !== 0);
        const resultRow = [];
        let score = currentScore;
        let moved = false;
        let skip = false;
        
        for (let i = 0; i < nonZeroTiles.length; i++) {
            if (skip) {
                skip = false;
                continue;
            }
            
            if (i + 1 < nonZeroTiles.length && nonZeroTiles[i] === nonZeroTiles[i + 1]) {
                const mergedValue = nonZeroTiles[i] * 2;
                resultRow.push(mergedValue);
                score += mergedValue;
                skip = true;
                
                // Check for win condition
                if (mergedValue === 2048 && !this.hasWon) {
                    this.hasWon = true;
                }
            } else {
                resultRow.push(nonZeroTiles[i]);
            }
        }
        
        // Pad with zeros
        while (resultRow.length < GRID_SIZE) {
            resultRow.push(0);
        }
        
        // Check if row changed
        if (row.join(',') !== resultRow.join(',')) {
            moved = true;
        }
        
        return { row: resultRow, score, moved };
    }
    
    /**
     * Rotate grid for unified processing
     * All moves are processed as "left" moves after rotation
     */
    rotateGrid(direction) {
        let rotated = JSON.parse(JSON.stringify(this.grid));
        
        switch (direction) {
            case 'up':
                // Transpose to make up moves process like left moves
                rotated = this.transpose(rotated);
                break;
            case 'down':
                // Transpose and reverse
                rotated = this.transpose(rotated);
                rotated = rotated.map(row => row.reverse());
                break;
            case 'left':
                // No rotation needed
                break;
            case 'right':
                // Reverse to make right moves process like left moves
                rotated = rotated.map(row => row.reverse());
                break;
        }
        
        return rotated;
    }
    
    /**
     * Unrotate grid back to original orientation
     */
    unrotateGrid(grid, direction) {
        let unrotated = JSON.parse(JSON.stringify(grid));
        
        switch (direction) {
            case 'up':
                // Transpose back
                unrotated = this.transpose(unrotated);
                break;
            case 'down':
                // Reverse and transpose back
                unrotated = unrotated.map(row => row.reverse());
                unrotated = this.transpose(unrotated);
                break;
            case 'left':
                // No unrotation needed
                break;
            case 'right':
                // Reverse back
                unrotated = unrotated.map(row => row.reverse());
                break;
        }
        
        return unrotated;
    }
    
    /**
     * Transpose a 2D array
     */
    transpose(matrix) {
        return matrix[0].map((_, colIndex) => 
            matrix.map(row => row[colIndex])
        );
    }
    
    /**
     * Check if the game is over
     */
    checkGameOver() {
        if (!this.gameOver && this.isGameOver()) {
            this.gameOver = true;
            this.updateDisplay();
        }
    }
    
    /**
     * Determine if game is over (no moves possible)
     */
    isGameOver() {
        // Check for empty cells
        if (this.getEmptyCells().length > 0) {
            return false;
        }
        
        // Check for possible merges horizontally
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE - 1; j++) {
                if (this.grid[i][j] === this.grid[i][j + 1]) {
                    return false;
                }
            }
        }
        
        // Check for possible merges vertically
        for (let i = 0; i < GRID_SIZE - 1; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (this.grid[i][j] === this.grid[i + 1][j]) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Update the UI display
     */
    updateDisplay() {
        this.updateScore();
        this.renderGrid();
        this.renderGameOver();
    }
    
    /**
     * Update score display
     */
    updateScore() {
        this.scoreElement.textContent = this.score;
        
        // Update best score
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem(STORAGE_KEY, this.bestScore);
        }
        
        this.bestScoreElement.textContent = this.bestScore;
    }
    
    /**
     * Render the grid
     */
    renderGrid() {
        this.gridElement.innerHTML = '';
        
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                const cell = this.createCell(i, j, this.grid[i][j]);
                this.gridElement.appendChild(cell);
            }
        }
    }
    
    /**
     * Create a cell element
     */
    createCell(row, col, value) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.setAttribute('data-row', row);
        cell.setAttribute('data-col', col);
        
        if (value > 0) {
            cell.textContent = value;
            cell.setAttribute('data-value', value);
        }
        
        return cell;
    }
    
    /**
     * Render game over message
     */
    renderGameOver() {
        if (!this.gameOver) return;
        
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
    
    /**
     * Set up touch event handlers
     */
    setupTouchEvents() {
        const grid = this.gridElement;
        
        grid.addEventListener('touchstart', (e) => {
            if (this.gameOver) return;
            this.handleTouchStart(e);
        }, { passive: true });
        
        grid.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e);
        }, { passive: false });
        
        grid.addEventListener('touchend', (e) => {
            if (this.gameOver) return;
            this.handleTouchEnd(e);
        });
    }
    
    /**
     * Handle touch start
     */
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }
    
    /**
     * Handle touch move (prevent scrolling during swipe)
     */
    handleTouchMove(e) {
        const deltaX = e.touches[0].clientX - this.touchStartX;
        const deltaY = e.touches[0].clientY - this.touchStartY;
        
        // Only prevent scroll if swipe is significant
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            e.preventDefault();
        }
    }
    
    /**
     * Handle touch end and determine direction
     */
    handleTouchEnd(e) {
        if (this.gameOver) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const deltaX = touchEndX - this.touchStartX;
        const deltaY = touchEndY - this.touchStartY;
        
        const direction = this.getSwipeDirection(deltaX, deltaY);
        
        if (direction) {
            this.move(direction);
        }
    }
    
    /**
     * Determine swipe direction from delta values
     */
    getSwipeDirection(deltaX, deltaY) {
        // Determine if horizontal or vertical swipe
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (Math.abs(deltaX) > MIN_SWIPE_DISTANCE) {
                // deltaX > 0 means swipe to the right
                // deltaX < 0 means swipe to the left
                return deltaX > 0 ? 'right' : 'left';
            }
        } else {
            // Vertical swipe
            if (Math.abs(deltaY) > MIN_SWIPE_DISTANCE) {
                // deltaY > 0 means swipe down
                // deltaY < 0 means swipe up
                return deltaY > 0 ? 'down' : 'up';
            }
        }
        
        return null;
    }
    
    /**
     * Get current game state (for testing)
     */
    getState() {
        return {
            grid: JSON.parse(JSON.stringify(this.grid)),
            score: this.score,
            bestScore: this.bestScore,
            gameOver: this.gameOver
        };
    }
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game2048();
});

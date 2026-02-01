/**
 * 2048 Game Test Suite
 * Comprehensive tests for core functionality
 */

class Game2048Test {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.results = [];
    }
    
    /**
     * Run all tests
     */
    runAll() {
        console.log('🧪 Running 2048 Game Tests...\n');
        
        // Core functionality tests
        this.testGridInitialization();
        this.testEmptyCells();
        this.testAddRandomTile();
        this.testMoveLeft();
        this.testMoveRight();
        this.testMoveUp();
        this.testMoveDown();
        this.testMerging();
        this.testNoMoveWhenBlocked();
        this.testGameOverDetection();
        this.testTranspose();
        this.testRotation();
        
        // Edge case tests
        this.testEmptyGridMove();
        this.testFullGridMerge();
        this.testScoreCalculation();
        
        // Touch swipe direction tests
        this.testSwipeDirection();
        
        this.printResults();
    }
    
    /**
     * Assert condition
     */
    assert(condition, testName, message) {
        if (condition) {
            this.passed++;
            this.results.push({
                test: testName,
                status: '✅ PASS',
                message: message
            });
            console.log(`✅ ${testName}`);
        } else {
            this.failed++;
            this.results.push({
                test: testName,
                status: '❌ FAIL',
                message: message
            });
            console.error(`❌ ${testName}: ${message}`);
        }
    }
    
    /**
     * Test grid initialization
     */
    testGridInitialization() {
        const grid = this.createEmptyGrid();
        
        this.assert(
            grid.length === 4 && grid[0].length === 4,
            'Grid Initialization',
            'Grid should be 4x4'
        );
        
        this.assert(
            grid.every(row => row.every(cell => cell === 0)),
            'Empty Grid',
            'All cells should be 0 initially'
        );
    }
    
    /**
     * Test getting empty cells
     */
    testEmptyCells() {
        const grid = [
            [2, 0, 4, 0],
            [0, 0, 0, 8],
            [2, 2, 2, 2],
            [0, 4, 0, 0]
        ];
        
        const emptyCells = this.getEmptyCells(grid);
        
        // Count: 2 (row 0) + 3 (row 1) + 0 (row 2) + 3 (row 3) = 8
        this.assert(
            emptyCells.length === 8,
            'Count Empty Cells',
            `Should find 8 empty cells, found ${emptyCells.length}`
        );
    }
    
    /**
     * Test adding random tile
     */
    testAddRandomTile() {
        const grid = this.createEmptyGrid();
        let updatedGrid = this.addRandomTileToGrid(grid);
        
        const hasValue = updatedGrid.some(row => 
            row.some(cell => cell === 2 || cell === 4)
        );
        
        this.assert(
            hasValue,
            'Add Random Tile',
            'Should add a 2 or 4 to the grid'
        );
    }
    
    /**
     * Test move left
     */
    testMoveLeft() {
        const grid = [
            [2, 2, 0, 0],
            [4, 0, 4, 0],
            [0, 0, 0, 0],
            [8, 8, 8, 8]
        ];
        
        const result = this.processGridMove(grid, 'left');
        const expected = [
            [4, 0, 0, 0],
            [8, 0, 0, 0],
            [0, 0, 0, 0],
            [16, 16, 0, 0]
        ];
        
        this.assert(
            JSON.stringify(result.grid) === JSON.stringify(expected),
            'Move Left',
            'Tiles should merge and shift left correctly'
        );
    }
    
    /**
     * Test move right
     */
    testMoveRight() {
        const grid = [
            [0, 0, 2, 2],
            [0, 4, 0, 4],
            [0, 0, 0, 0],
            [8, 8, 8, 8]
        ];
        
        const result = this.processGridMove(grid, 'right');
        const expected = [
            [0, 0, 0, 4],
            [0, 0, 0, 8],
            [0, 0, 0, 0],
            [0, 0, 16, 16]
        ];
        
        this.assert(
            JSON.stringify(result.grid) === JSON.stringify(expected),
            'Move Right',
            'Tiles should merge and shift right correctly'
        );
    }
    
    /**
     * Test move up
     */
    testMoveUp() {
        const grid = [
            [2, 0, 4, 8],
            [2, 0, 4, 8],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        
        const result = this.processGridMove(grid, 'up');
        const expected = [
            [4, 0, 8, 16],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        
        this.assert(
            JSON.stringify(result.grid) === JSON.stringify(expected),
            'Move Up',
            'Tiles should merge and shift up correctly'
        );
    }
    
    /**
     * Test move down
     */
    testMoveDown() {
        const grid = [
            [2, 0, 4, 8],
            [2, 0, 4, 8],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        
        const result = this.processGridMove(grid, 'down');
        const expected = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [4, 0, 8, 16]
        ];
        
        this.assert(
            JSON.stringify(result.grid) === JSON.stringify(expected),
            'Move Down',
            'Tiles should merge and shift down correctly'
        );
    }
    
    /**
     * Test merging logic
     */
    testMerging() {
        const grid = [
            [2, 2, 4, 4],
            [8, 8, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        
        const result = this.processGridMove(grid, 'left');
        const expectedScore = 28; // 4+8+16=28
        
        this.assert(
            result.score === expectedScore,
            'Merging Score',
            `Score should be ${expectedScore}, got ${result.score}`
        );
    }
    
    /**
     * Test no move when blocked
     */
    testNoMoveWhenBlocked() {
        const grid = [
            [2, 4, 8, 16],
            [4, 8, 16, 32],
            [8, 16, 32, 64],
            [16, 32, 64, 128]
        ];
        
        const result = this.processGridMove(grid, 'left');
        
        this.assert(
            !result.moved,
            'No Move When Blocked',
            'Should not move when no merges possible'
        );
    }
    
    /**
     * Test game over detection
     */
    testGameOverDetection() {
        // Grid with empty cells - not game over
        const grid1 = [
            [2, 4, 8, 16],
            [4, 0, 16, 32],
            [8, 16, 32, 64],
            [16, 32, 64, 128]
        ];
        
        this.assert(
            !this.isGameOver(grid1),
            'Game Over - Has Empty Cells',
            'Should not be game over with empty cells'
        );
        
        // Grid with possible merges - not game over
        const grid2 = [
            [2, 2, 8, 16],
            [4, 8, 16, 32],
            [8, 16, 32, 64],
            [16, 32, 64, 128]
        ];
        
        this.assert(
            !this.isGameOver(grid2),
            'Game Over - Has Possible Merges',
            'Should not be game over with possible merges'
        );
        
        // Full grid with no moves - game over
        const grid3 = [
            [2, 4, 8, 16],
            [16, 8, 4, 2],
            [2, 4, 8, 16],
            [16, 8, 4, 2]
        ];
        
        this.assert(
            this.isGameOver(grid3),
            'Game Over - No Moves',
            'Should be game over with no possible moves'
        );
    }
    
    /**
     * Test transpose function
     */
    testTranspose() {
        const grid = [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
            [13, 14, 15, 16]
        ];
        
        const transposed = this.transpose(grid);
        const expected = [
            [1, 5, 9, 13],
            [2, 6, 10, 14],
            [3, 7, 11, 15],
            [4, 8, 12, 16]
        ];
        
        this.assert(
            JSON.stringify(transposed) === JSON.stringify(expected),
            'Transpose',
            'Grid should be transposed correctly'
        );
    }
    
    /**
     * Test rotation for different directions
     */
    testRotation() {
        const grid = [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
            [13, 14, 15, 16]
        ];
        
        // Test up rotation (transpose)
        const upRotated = this.rotateGrid(grid, 'up');
        const upExpected = this.transpose(grid);
        
        this.assert(
            JSON.stringify(upRotated) === JSON.stringify(upExpected),
            'Rotate Up',
            'Up rotation should transpose the grid'
        );
        
        // Test left rotation (no change)
        const leftRotated = this.rotateGrid(grid, 'left');
        
        this.assert(
            JSON.stringify(leftRotated) === JSON.stringify(grid),
            'Rotate Left',
            'Left rotation should not change the grid'
        );
        
        // Test right rotation (reverse rows)
        const rightRotated = this.rotateGrid(grid, 'right');
        const rightExpected = grid.map(row => [...row].reverse());
        
        this.assert(
            JSON.stringify(rightRotated) === JSON.stringify(rightExpected),
            'Rotate Right',
            'Right rotation should reverse each row'
        );
    }
    
    /**
     * Test move on empty grid
     */
    testEmptyGridMove() {
        const grid = this.createEmptyGrid();
        const result = this.processGridMove(grid, 'left');
        
        this.assert(
            !result.moved,
            'Empty Grid Move',
            'Should not move on an empty grid'
        );
    }
    
    /**
     * Test full grid with merges
     */
    testFullGridMerge() {
        const grid = [
            [2, 2, 2, 2],
            [4, 4, 4, 4],
            [8, 8, 8, 8],
            [16, 16, 16, 16]
        ];
        
        const result = this.processGridMove(grid, 'left');
        
        this.assert(
            result.moved && result.score === 120,
            'Full Grid Merge',
            'Should merge all possible tiles and score correctly'
        );
    }
    
    /**
     * Test score calculation
     */
    testScoreCalculation() {
        const grid = [
            [2, 2, 4, 4],
            [8, 8, 16, 16],
            [32, 32, 64, 64],
            [128, 128, 256, 256]
        ];
        
        const result = this.processGridMove(grid, 'left');
        const expectedScore = 4 + 8 + 16 + 32 + 64 + 128 + 256 + 512;
        
        this.assert(
            result.score === expectedScore,
            'Score Calculation',
            `Score should be ${expectedScore}, got ${result.score}`
        );
    }
    
    /**
     * Test swipe direction detection
     */
    testSwipeDirection() {
        // Right swipe (positive X)
        let direction = this.getSwipeDirection(50, 10);
        this.assert(
            direction === 'right',
            'Swipe Right',
            ' deltaX=50, deltaY=10 should detect right swipe'
        );
        
        // Left swipe (negative X)
        direction = this.getSwipeDirection(-50, 10);
        this.assert(
            direction === 'left',
            'Swipe Left',
            ' deltaX=-50, deltaY=10 should detect left swipe'
        );
        
        // Up swipe (negative Y)
        direction = this.getSwipeDirection(10, -50);
        this.assert(
            direction === 'up',
            'Swipe Up',
            ' deltaX=10, deltaY=-50 should detect up swipe'
        );
        
        // Down swipe (positive Y)
        direction = this.getSwipeDirection(10, 50);
        this.assert(
            direction === 'down',
            'Swipe Down',
            ' deltaX=10, deltaY=50 should detect down swipe'
        );
        
        // Below threshold
        direction = this.getSwipeDirection(10, 5);
        this.assert(
            direction === null,
            'Swipe Below Threshold',
            ' deltaX=10, deltaY=5 should not trigger a swipe'
        );
        
        // Diagonal swipe should pick the dominant direction
        direction = this.getSwipeDirection(60, 30);
        this.assert(
            direction === 'right',
            'Diagonal Swipe Horizontal',
            ' deltaX=60, deltaY=30 should detect right swipe (horizontal dominant)'
        );
        
        direction = this.getSwipeDirection(30, 60);
        this.assert(
            direction === 'down',
            'Diagonal Swipe Vertical',
            ' deltaX=30, deltaY=60 should detect down swipe (vertical dominant)'
        );
    }
    
    /**
     * Print test results summary
     */
    printResults() {
        console.log('\n' + '='.repeat(50));
        console.log('Test Results Summary');
        console.log('='.repeat(50));
        console.log(`Total Tests: ${this.passed + this.failed}`);
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
        
        if (this.failed > 0) {
            console.log('\nFailed Tests:');
            this.results
                .filter(r => r.status === '❌ FAIL')
                .forEach(r => console.log(`  - ${r.test}: ${r.message}`));
        }
        
        console.log('='.repeat(50));
        
        return this.failed === 0;
    }
    
    // Helper methods (mimic game logic)
    
    createEmptyGrid() {
        return Array(4).fill(null).map(() => Array(4).fill(0));
    }
    
    getEmptyCells(grid) {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        return emptyCells;
    }
    
    addRandomTileToGrid(grid) {
        const emptyCells = this.getEmptyCells(grid);
        if (emptyCells.length === 0) return grid;
        
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        
        const newGrid = grid.map(row => [...row]);
        newGrid[randomCell.row][randomCell.col] = value;
        return newGrid;
    }
    
    processGridMove(grid, direction) {
        const rotatedGrid = this.rotateGrid(grid, direction);
        let moved = false;
        let score = 0;
        
        for (let i = 0; i < 4; i++) {
            const result = this.processRow(rotatedGrid[i]);
            if (result.moved) moved = true;
            score += result.score;
            rotatedGrid[i] = result.row;
        }
        
        return {
            grid: this.unrotateGrid(rotatedGrid, direction),
            moved,
            score
        };
    }
    
    processRow(row) {
        const nonZeroTiles = row.filter(val => val !== 0);
        const resultRow = [];
        let score = 0;
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
            } else {
                resultRow.push(nonZeroTiles[i]);
            }
        }
        
        while (resultRow.length < 4) {
            resultRow.push(0);
        }
        
        if (row.join(',') !== resultRow.join(',')) {
            moved = true;
        }
        
        return { row: resultRow, score, moved };
    }
    
    rotateGrid(grid, direction) {
        let rotated = grid.map(row => [...row]);
        
        switch (direction) {
            case 'up':
                rotated = this.transpose(rotated);
                break;
            case 'down':
                rotated = this.transpose(rotated);
                rotated = rotated.map(row => row.reverse());
                break;
            case 'left':
                break;
            case 'right':
                rotated = rotated.map(row => row.reverse());
                break;
        }
        
        return rotated;
    }
    
    unrotateGrid(grid, direction) {
        let unrotated = grid.map(row => [...row]);
        
        switch (direction) {
            case 'up':
                unrotated = this.transpose(unrotated);
                break;
            case 'down':
                unrotated = unrotated.map(row => row.reverse());
                unrotated = this.transpose(unrotated);
                break;
            case 'left':
                break;
            case 'right':
                unrotated = unrotated.map(row => row.reverse());
                break;
        }
        
        return unrotated;
    }
    
    transpose(matrix) {
        return matrix[0].map((_, colIndex) => 
            matrix.map(row => row[colIndex])
        );
    }
    
    isGameOver(grid) {
        // Check for empty cells
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 0) return false;
            }
        }
        
        // Check for possible merges horizontally
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i][j] === grid[i][j + 1]) return false;
            }
        }
        
        // Check for possible merges vertically
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === grid[i + 1][j]) return false;
            }
        }
        
        return true;
    }
    
    getSwipeDirection(deltaX, deltaY) {
        const MIN_SWIPE_DISTANCE = 30;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.abs(deltaX) > MIN_SWIPE_DISTANCE) {
                return deltaX > 0 ? 'right' : 'left';
            }
        } else {
            if (Math.abs(deltaY) > MIN_SWIPE_DISTANCE) {
                return deltaY > 0 ? 'down' : 'up';
            }
        }
        
        return null;
    }
}

// Run tests when script loads in Node environment
if (typeof window === 'undefined') {
    console.log('Loading test suite...');
    const tester = new Game2048Test();
    tester.runAll();
    process.exit(tester.failed > 0 ? 1 : 0);
} else {
    // Export for use in test.html
    window.Game2048Test = Game2048Test;
    window.tester = tester;
}

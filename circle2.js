const canvas = document.getElementById('gameCanvas');
const gl = canvas.getContext('webgl');

initBoardProgram(gl);

const grid = Array.from({ length: 6 }, () => Array(7).fill(null));
let playerPosition = 0;
let animationFrameId = null;
let currentY = 0.9;
let targetY = currentY;

const pieceRadius = 0.08;
let currentColor = [1.0, 0.0, 0.0, 1.0];
let currentId = 1;
let gameOver = false;

// Shader codes
const vertexShaderSource = `
    attribute vec2 aPosition;
    void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;
const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 uColor;
    void main() {
        gl_FragColor = uColor;
    }
`;

// Compiles a shader from source code
function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(`Shader compile failed with: ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
const circleProgram = gl.createProgram();
gl.attachShader(circleProgram, vertexShader);
gl.attachShader(circleProgram, fragmentShader);
gl.linkProgram(circleProgram);

if (!gl.getProgramParameter(circleProgram, gl.LINK_STATUS)) {
    console.error(`Program failed to link: ${gl.getProgramInfoLog(circleProgram)}`);
}

const aPosition = gl.getAttribLocation(circleProgram, 'aPosition');
const uColor = gl.getUniformLocation(circleProgram, 'uColor');

const buffer = gl.createBuffer();

// Generates vertices for a circle
function createCircleVertices(x, y, radius, segments) {
    const vertices = [];
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * 2.0 * Math.PI;
        vertices.push(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
    }
    return new Float32Array(vertices);
}

// Draws a circle on the canvas
function drawCircle(x, y, color) {
    gl.useProgram(circleProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const vertices = createCircleVertices(x, y, pieceRadius, 50);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);
    gl.uniform4fv(uColor, color);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2);
}

// Draws the entire game board
function drawBoard() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            if (grid[row][col]) {
                const baseX = (col - 3) * 0.2;
                const baseY = 0.5 - (row * 0.2);
                const color = grid[row][col] === 1
                    ? [1.0, 0.0, 0.0, 1.0]
                    : [1.0, 1.0, 0.0, 1.0];
                drawCircle(baseX, baseY, color);
            }
        }
    }

    if (!gameOver) {
        const fallX = (playerPosition - 3) * 0.2;
        drawCircle(fallX, currentY, currentColor);
    }

    drawBoardBackground(gl);
}

// Animates the dropping piece
function animateDrop() {
    if (currentY > targetY) {
        currentY -= 0.015;
        drawBoard();
        animationFrameId = requestAnimationFrame(animateDrop);
    } else {
        currentY = targetY;
        drawBoard();
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;

        const row = Math.round((0.8 - targetY) / 0.2); 
        grid[row][playerPosition] = currentId;

        updateWinMatrix(row, playerPosition, currentId);
        updateMatrixDisplay(grid);

        currentY = 0.9;
        spawnNewCircle();
    }
}

// Prepares the next player's turn
function spawnNewCircle() {
    targetY = currentY;

    if (currentId === 1) {
        currentColor = [1.0, 1.0, 0.0, 1.0];
        currentId = 2;
    } else {
        currentColor = [1.0, 0.0, 0.0, 1.0];
        currentId = 1;
    }

    drawBoard();
}

// Finds the lowest available row in a column
function findLowestAvailableRow(column) {
    for (let row = 5; row >= 0; row--) {
        if (!grid[row][column]) {
            return row;
        }
    }
    return null; //needed so you dont try and place above the game board :D
}

// Shows who won the game
function displayWinner(playerId){
    let winnerText;
    if(playerId === 1){
        winnerText = 'Red Wins!';
    } else {
        winnerText = 'Yellow Wins!';
    }
    const winnerElement = document.getElementById('winnerDisplay');
    winnerElement.innerText = winnerText;
    alert(winnerText);
    gameOver = true;
}

// Sets up the display for the game matrix
function initializeMatrixDisplay() {
    const matrixDisplay = document.getElementById('matrixDisplay');
    matrixDisplay.innerHTML = '';
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${row}-${col}`;
            cell.textContent = '0';
            matrixDisplay.appendChild(cell);
        }
    }
}

// Updates the display based on the game state
function updateMatrixDisplay(matrix) {
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            const cell = document.getElementById(`cell-${row}-${col}`);
            if (matrix[row][col] === 1) {
                cell.textContent = '1';
                cell.className = 'cell red';
            } else if (matrix[row][col] === 2) {
                cell.textContent = '2';
                cell.className = 'cell yellow';
            } else {
                cell.textContent = '0';
                cell.className = 'cell';
            }
        }
    }
}

// Resets the game to start over
function resetGame() {
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            grid[row][col] = null;
            winMatrix[row][col] = 0;
        }
    }

    currentY = 0.9;
    playerPosition = 3;
    currentId = 1;
    currentColor = [1.0, 0.0, 0.0, 1.0];
    gameOver = false; 

    document.getElementById('winnerDisplay').innerText = 'No Winner Yet';
    initializeMatrixDisplay();
    drawBoard();
}

// Sets up the game when the page loads and listens for reset button
window.addEventListener('DOMContentLoaded', () => {
    initializeMatrixDisplay();
    document.getElementById('resetButton').addEventListener('click', resetGame);
});

// Listens for key presses to move or drop the piece
window.addEventListener('keydown', (event) => {
    if (gameOver) return;

    if (event.key === 'ArrowLeft' && !animationFrameId) {
        playerPosition = Math.max(0, playerPosition - 1);
        drawBoard();
    } else if (event.key === 'ArrowRight' && !animationFrameId) {
        playerPosition = Math.min(6, playerPosition + 1);
        drawBoard();
    } else if (event.key === 'ArrowDown' && !animationFrameId) {
        const lowestRow = findLowestAvailableRow(playerPosition);
        if (lowestRow !== null) {
            targetY = 0.8 - (lowestRow * 0.2);
            animateDrop();
        }
    }
});

gl.clearColor(0.9, 0.9, 0.9, 1.0);
drawBoard();

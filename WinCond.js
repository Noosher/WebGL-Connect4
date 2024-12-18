const winMatrix = Array.from({ length: 6 }, () => Array(7).fill(0));

/* updateWinMatrix
// Updates the game state matrix with the player's move
// Step 1: Place the given ID in the row and column
// Step 2: Check if this move wins the game
// Step 3: If win, show the winner
*/
function updateWinMatrix(row, column, playerId) {
    winMatrix[row][column] = playerId;
    if (checkWinCondition(row, column, playerId)) {
        displayWinner(playerId);
    }
}

/* checkWinCondition
// Checks if the latest move causes a win
// Step 1: Check any direction for 4 in a row
// Step 2: If so return true
*/
function checkWinCondition(row, column, playerId) {
    return (
        checkDirection(row, column, playerId, 0, 1) ||
        checkDirection(row, column, playerId, 1, 0) ||
        checkDirection(row, column, playerId, 1, 1) ||
        checkDirection(row, column, playerId, 1, -1)
    );
}

/* checkDirection
// Checks a specific direction for four in a row
// Used by CheckWinCondition, this is for any given direction
*/
function checkDirection(row, column, playerId, rowDelta, colDelta) {
    let count = 1;
    count += countInDirection(row, column, playerId, rowDelta, colDelta);
    count += countInDirection(row, column, playerId, -rowDelta, -colDelta);
    return count >= 4;
}

/* countInDirection
// Counts consecutive pieces in one direction
// Step 1: Start from the next cell in the direction
// Step 2: While the cell has the player's ID, keep counting
// Step 3: Move to the next cell in the same direction
// Step 4: Return the total count
*/
function countInDirection(row, column, playerId, rowDelta, colDelta) {
    let count = 0;
    let r = row + rowDelta;
    let c = column + colDelta;

    while (
        r >= 0 &&
        r < 6 &&
        c >= 0 &&
        c < 7 &&
        winMatrix[r][c] === playerId
    ) {
        count++;
        r += rowDelta;
        c += colDelta;
    }

    return count;
}

/* displayWinner
// Shows the winner of the game
// Step 1: Decide the winner's message based on user ID
// Step 2: Show the message on the webpage
// Step 3: End the game
*/
function displayWinner(playerId) {
    const winnerText = playerId === 1 ? 'Red Wins!' : 'Yellow Wins!';
    document.getElementById('winnerDisplay').innerText = winnerText;
    setTimeout(() => {
        alert(winnerText);
    }, 50);

    gameOver = true;
}

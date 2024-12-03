const cells = document.querySelectorAll('.cell');
const statusDisplay = document.querySelector('.status');
const resetButton = document.querySelector('.reset');
const modeButtons = document.querySelectorAll('.mode');
const board = document.querySelector('.board');
const menu = document.querySelector('.menu');
const messageBox = document.querySelector('.message-box');
const messageText = document.querySelector('.message');
const restartButton = document.querySelector('.restart');
const changeModeButton = document.querySelector('.change-mode');

let gameActive = true;
let currentPlayer = 'X';
let gameState = ["", "", "", "", "", "", "", "", ""];
let gameMode = 'pvp'; // Default mode

const winningConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// Function to start the game based on the selected mode
function startGame(mode) {
  gameMode = mode;
  menu.style.display = 'none';
  board.style.display = 'grid';
  resetButton.style.display = 'block';
  gameActive = true;
  statusDisplay.textContent = `Player ${currentPlayer}'s turn`;
}

// Function to handle AI moves
function handleAIMove() {
  if (gameMode === 'ai-easy') {
    handleRandomMove();
  } else if (gameMode === 'ai-medium') {
    handleMediumMove();
  } else if (gameMode === 'ai-hard') {
    handleHardMove();
  }
}

function handleRandomMove() {
  let availableCells = gameState
    .map((val, idx) => (val === "" ? idx : null))
    .filter(idx => idx !== null);
  const randomIndex = Math.floor(Math.random() * availableCells.length);
  const cellIndex = availableCells[randomIndex];
  makeMove(cellIndex);
}

// Medium AI (Defensive) logic
function handleMediumMove() {
  const opponent = currentPlayer === 'X' ? 'O' : 'X';
  let availableCells = gameState
    .map((val, idx) => (val === "" ? idx : null))
    .filter(idx => idx !== null);

  // Try to win
  for (let cellIndex of availableCells) {
    gameState[cellIndex] = currentPlayer;
    if (checkPotentialWin()) {
      makeMove(cellIndex);
      return;
    }
    gameState[cellIndex] = "";
  }

  // Block opponent from winning
  for (let cellIndex of availableCells) {
    gameState[cellIndex] = opponent;
    if (checkPotentialWin()) {
      gameState[cellIndex] = currentPlayer;
      makeMove(cellIndex);
      return;
    }
    gameState[cellIndex] = "";
  }

  // If no win or block, pick a random cell
  handleRandomMove();
}

function checkPotentialWin() {
  for (let [a, b, c] of winningConditions) {
    if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
      return true;
    }
  }
  return false;
}

// Hard AI (Alpha-Beta Pruning) logic
function handleHardMove() {
  const bestMove = findBestMove();
  makeMove(bestMove);
}

function findBestMove() {
  let bestValue = -Infinity;
  let bestMove = -1;

  gameState.forEach((cell, idx) => {
    if (cell === "") {
      gameState[idx] = currentPlayer;
      let moveValue = minimax(gameState, 0, false, -Infinity, Infinity);
      gameState[idx] = "";

      if (moveValue > bestValue) {
        bestValue = moveValue;
        bestMove = idx;
      }
    }
  });

  return bestMove;
}

function minimax(board, depth, isMaximizing, alpha, beta) {
  let score = evaluate(board);

  // If Maximizer has won the game, return evaluated score
  if (score === 10) return score - depth;

  // If Minimizer has won the game, return evaluated score
  if (score === -10) return score + depth;

  // If the game is a draw, return 0
  if (!board.includes("")) return 0;

  if (isMaximizing) {
    let best = -Infinity;

    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = currentPlayer;
        best = Math.max(best, minimax(board, depth + 1, false, alpha, beta));
        board[i] = "";
        alpha = Math.max(alpha, best);

        if (beta <= alpha) break;
      }
    }
    return best;
  } else {
    let best = Infinity;
    const opponent = currentPlayer === "X" ? "O" : "X";

    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = opponent;
        best = Math.min(best, minimax(board, depth + 1, true, alpha, beta));
        board[i] = "";
        beta = Math.min(beta, best);

        if (beta <= alpha) break;
      }
    }
    return best;
  }
}

function evaluate(board) {
  for (let [a, b, c] of winningConditions) {
    if (board[a] === board[b] && board[b] === board[c]) {
      if (board[a] === currentPlayer) return 10;
      else if (board[a]) return -10;
    }
  }
  return 0;
}

// Function to handle cell clicks
function handleCellClick(event) {
  const clickedCell = event.target;
  const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

  if (gameState[clickedCellIndex] !== "" || !gameActive) {
    return;
  }

  makeMove(clickedCellIndex);

  if (gameMode.startsWith('ai') && gameActive) {
    setTimeout(handleAIMove, 500); // Delay for AI move
  }
}

function makeMove(index) {
  gameState[index] = currentPlayer;
  cells[index].textContent = currentPlayer;
  cells[index].classList.add(currentPlayer);
  checkResult();
}

function checkResult() {
  let roundWon = false;
  for (let [a, b, c] of winningConditions) {
    if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
      roundWon = true;
      break;
    }
  }

  if (roundWon) {
    endGame(`Player ${currentPlayer} Wins!`);
    return;
  }

  if (!gameState.includes("")) {
    endGame("It's a Draw!");
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusDisplay.textContent = `Player ${currentPlayer}'s turn`;
}

function endGame(message) {
  gameActive = false;
  messageText.textContent = message;
  messageBox.style.display = 'block';
}

// Function to restart the game
function restartGame() {
  gameActive = true;
  currentPlayer = 'X';
  gameState = ["", "", "", "", "", "", "", "", ""];
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('X', 'O');
  });
  statusDisplay.textContent = `Player ${currentPlayer}'s turn`;
  messageBox.style.display = 'none';
}

// Event listeners for mode buttons and game interactions
modeButtons.forEach(button => {
  button.addEventListener('click', () => startGame(button.dataset.mode));
});

cells.forEach(cell => {
  cell.addEventListener('click', handleCellClick);
});

resetButton.addEventListener('click', restartGame);

restartButton.addEventListener('click', restartGame);

changeModeButton.addEventListener('click', () => {
  messageBox.style.display = 'none';
  board.style.display = 'none';
  menu.style.display = 'block';
});

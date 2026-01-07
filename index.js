// ------- Selectors -------
// Get all elements from the HTML we need to use
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("statusText");
const restartBtn = document.getElementById("restartBtn");
const resetScoresBtn = document.getElementById("resetScoresBtn");
const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreDEl = document.getElementById("scoreD");

// ------- Constants -------
// All possible winning lines
const winConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// ------- State -------
// The board and game variables
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let running = false;
let scores = { X: 0, O: 0, D: 0 };

// ------- Storage Keys -------
// Names used in localStorage
const STATE_KEY = "ttt_state_v1";
const SCORE_KEY = "ttt_scores_v1";

// ------- Init -------
// Start the game
initializeGame();

function initializeGame() {
  // Load saved game and scores
  loadScores();
  loadState();

  // Add click actions to the buttons
  cells.forEach((cell) => {
    cell.addEventListener("click", cellClicked);
  });
  restartBtn.addEventListener("click", restartGame);
  resetScoresBtn.addEventListener("click", resetAll);

  // Show the board and start playing
  renderBoard();
  updateStatus();
  running = true;
}

// ------- Core Handlers -------
// What happens when a cell is clicked
function cellClicked() {
  if (!running) return;

  const index = Number(this.getAttribute("data-index"));
  if (board[index] !== "") return; // If cell already has value, skip

  board[index] = currentPlayer;
  this.textContent = currentPlayer;

  // Check if someone won
  const result = evaluateBoard(); // "X", "O" ,"D" or null
  if (result) {
    handleGameEnd(result);
  } else {
    changePlayer();
  }
  saveState();
}

// Change turn between X and O
function changePlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatus();
}

// What happens when the game ends
function handleGameEnd(result) {
  running = false;

  // Highlight winning line
  const winLine = findWinningLine();
  if (winLine) {
    for (let i = 0; i < winLine.length; i++) {
      cells[winLine[i]].classList.add("win");
    }
  }

  // Show who won or if draw
  if (result === "D") {
    statusText.textContent = "Draw!";
    scores.D++;
  } else {
    statusText.textContent = result + " wins!";
    scores[result]++;
  }
  updateScoreUI();
  saveScores();
}

// ------- Helpers -------
// Check if there is a winner or a draw
function evaluateBoard() {
  for (let i = 0; i < winConditions.length; i++) {
    const a = winConditions[i][0];
    const b = winConditions[i][1];
    const c = winConditions[i][2];

    if (board[a] !== "" && board[a] === board[b] && board[b] === board[c]) {
      return board[a]; // Return X or O
    }
  }
  // Check for draw
  for (let k = 0; k < board.length; k++) {
    if (board[k] === "") return null;
  }
  return "D"; // Draw
}

// Find the winning cells to highlight
function findWinningLine() {
  for (let i = 0; i < winConditions.length; i++) {
    const a = winConditions[i][0];
    const b = winConditions[i][1];
    const c = winConditions[i][2];

    if (board[a] !== "" && board[a] === board[b] && board[b] === board[c]) {
      return [a, b, c];
    }
  }
  return null;
}

// Update the board display
function renderBoard() {
  for (let i = 0; i < cells.length; i++) {
    cells[i].textContent = board[i];
    cells[i].classList.remove("win");
  }
}

// Update the status text
function updateStatus() {
  statusText.textContent = currentPlayer + "'s turn";
}

// Start a new game but keep scores
function restartGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  running = true;
  currentPlayer = "X";
  renderBoard();
  updateStatus();
  saveState();
}

// Reset everything (scores and board)
function resetAll() {
  scores = { X: 0, O: 0, D: 0 };
  updateScoreUI();
  saveScores();

  localStorage.removeItem(STATE_KEY);
  restartGame();
}

// Update score numbers on screen
function updateScoreUI() {
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDEl.textContent = scores.D;
}

// ------- Persistence -------
// Save current game state
function saveState() {
  const state = {
    board: board,
    currentPlayer: currentPlayer,
    running: running
  };
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

// Load saved game state
function loadState() {
  const raw = localStorage.getItem(STATE_KEY);
  if (!raw) return;

  try {
    const state = JSON.parse(raw);
    if (state && state.board && state.board.length === 9) {
      board = state.board;
      currentPlayer = state.currentPlayer || "X";
      running = typeof state.running === "boolean" ? state.running : true;
    }
  } catch (e) {
    // If error, ignore
  }
}

// Save scores to localStorage
function saveScores() {
  localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
}

// Load scores from localStorage
function loadScores() {
  const raw = localStorage.getItem(SCORE_KEY);
  if (!raw) {
    updateScoreUI();
    return;
  }
  try {
    const s = JSON.parse(raw);
    scores = { X: s.X || 0, O: s.O || 0, D: s.D || 0 };
  } catch (e) {
    scores = { X: 0, O: 0, D: 0 };
  }
  updateScoreUI();
}

const board = document.getElementById('game-board');
const scoreElement = document.getElementById('score');

const boardSize = 20;
let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let food = { x: 5, y: 5 };
let score = 0;

function drawBoard() {
    board.innerHTML = '';
    for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            if (snake.some(segment => segment.x === x && segment.y === y)) {
                cell.classList.add('snake');
            } else if (food.x === x && food.y === y) {
                cell.classList.add('food');
            }

            board.appendChild(cell);
        }
    }
}

function moveSnake() {
    if (direction.x === 0 && direction.y === 0) return;

    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;

    // Ściana
    if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
        return gameOver();
    }

    // Kolizja z samym sobą
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        return gameOver();
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = score;
        spawnFood();
    } else {
        snake.pop();
    }

    drawBoard();
}

function spawnFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * boardSize),
            y: Math.floor(Math.random() * boardSize)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    food = newFood;
}

function gameOver() {
    alert('Koniec gry! Wynik: ' + score);
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    score = 0;
    scoreElement.textContent = score;
    spawnFood();
    drawBoard();
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            if (direction.y === 0) direction = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y === 0) direction = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x === 0) direction = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x === 0) direction = { x: 1, y: 0 };
            break;
    }
});

document.getElementById('back-to-pacman').addEventListener('click', () => {
    window.location.href = 'PacMan 2.html'; // upewnij się, że plik istnieje w tym samym folderze
});

document.addEventListener('DOMContentLoaded', () => {
  const backButton = document.getElementById('back-to-menu');
  if (backButton) {
    backButton.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
});

setInterval(moveSnake, 150);
drawBoard();
spawnFood();

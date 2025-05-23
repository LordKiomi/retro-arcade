const mapa = [
    "#####################",
    "#.........#.........#",
    "#.###.###.#.###.###.#",
    "#.###.###.#.###.###.#",
    "#.........S.........#", // Truskawka
    "#.###.#.#####.#.###.#",
    "#.....#...#...#.....#",
    "#####.###.#.###.#####",
    "#.........C.........#", // Wiśnia
    "#####.#.#...#.#.#####",
    "........#...#........",
    "#####.#.#...#.#.#####",
    "#...#.###.#.###.#...#",
    "#.........#.........#",
    "#####...#####...#####",
    "#.........#.........#",
    "#.###.###.#.###.###.#",
    "#...#.....#.....#...#",
    "##..#.#.#####.#.#..##",
    "#.....#...#...#.....#",
    "#.#######.#.#######.#",
    "#..C.............C..#",
    "#####################"
];



// Początkowa pozycja Pac-Mana
let pacmanPosition = { x: 1, y: 1 };

// Gniazda dla duchów
const ghostSpawns = [
    { x: 5, y: 5 },   // Gniazdo dla pierwszego ducha
    { x: 15, y: 5 },  // Gniazdo dla drugiego ducha
    { x: 5, y: 15 },  // Gniazdo dla trzeciego ducha
    { x: 15, y: 15 }  // Gniazdo dla czwartego ducha
];

// Duchy
let ghosts = [
    { x: 10, y: 10, isFollowing: false },
    { x: 15, y: 10, isFollowing: false },
    { x: 5, y: 5, isFollowing: false },
    { x: 10, y: 5, isFollowing: false }
];

let lives = 3;
let score = 0;
let gameLoopTimeout;
let gameActive = false;
let gameSpeed = 500; // Prędkość gry (ms między pętlami)
let ghostSpeed = 500; // Prędkość poruszania duchów
let ghostReactionDistance = 5; // Odległość reakcji duchów
let ghostCount = 4; // Liczba duchów w grze

// HTML Elements
const gameElement = document.getElementById('game');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverElement = document.getElementById('game-over');
const startFormElement = document.getElementById('start-form');
const restartFormElement = document.getElementById('restart-form');

// Funkcja renderująca mapę gry
function renderMap() {
    gameElement.innerHTML = ''; // Czyści planszę przed renderowaniem
    mapa.forEach((row, rowIndex) => {
        row.split('').forEach((cell, cellIndex) => {
            const div = document.createElement('div');
            div.classList.add('cell'); // Podstawowa klasa dla każdej komórki

            if (cell === '#') {
                div.classList.add('wall'); // Ściana
            } else if (cell === '.') {
                div.classList.add('point'); // Punkt
            } else if (cell === 'S') {
                div.classList.add('fruit', 'truskawka'); // Truskawka
            } else if (cell === 'C') {
                div.classList.add('fruit', 'wisnia'); // Wiśnia
            } else {
                div.classList.add('empty'); // Puste pole
            }

            gameElement.appendChild(div); // Dodanie elementu do planszy
        });
    });
}


// Funkcja rysująca Pac-Mana
function drawPacman() {
    const index = pacmanPosition.y * mapa[0].length + pacmanPosition.x;
    const cells = gameElement.children;

    // Usuwanie poprzedniego Pac-Mana, jeśli istnieje
    Array.from(cells).forEach(cell => cell.classList.remove('pacman'));

    // Dodanie Pac-Mana do nowej pozycji
    cells[index].classList.add('pacman');
}

function spawnFruit() {
    const emptyCells = [];
    mapa.forEach((row, y) => {
        row.split('').forEach((cell, x) => {
            if (cell === '.') { // Tylko na pustych miejscach
                emptyCells.push({ x, y });
            }
        });
    });

    if (emptyCells.length > 0) {
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const fruitPosition = emptyCells[randomIndex];

        // Aktualizacja mapy
        mapa[fruitPosition.y] = mapa[fruitPosition.y].substring(0, fruitPosition.x) +
                                'F' +
                                mapa[fruitPosition.y].substring(fruitPosition.x + 1);

        renderMap(); // Ponowne renderowanie mapy
    }
}

// Wywołuj pojawianie się owoców co pewien czas
setInterval(spawnFruit, 10000); // Owoc pojawia się co 10 sekund


// Funkcja czyszcząca Pac-Mana z planszy
function clearPacman() {
    const cells = gameElement.children;
    Array.from(cells).forEach(cell => cell.classList.remove('pacman'));
}

// Funkcja rysująca duchy
function drawGhosts() {
    const cells = gameElement.children;
    ghosts.forEach(ghost => {
        const index = ghost.y * mapa[0].length + ghost.x;
        cells[index].classList.add('ghost');
    });
}

// Funkcja aktualizująca wynik
function updateScore() {
    scoreElement.textContent = score;
}

// Funkcja aktualizująca liczbę żyć
function updateLives() {
    livesElement.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const img = document.createElement('img');
        img.src = 'PacManMen.gif';
        img.alt = 'Pac-Man Life';
        img.classList.add('life-icon');
        livesElement.appendChild(img);
    }
}

// Funkcja poruszająca duchami losowo lub w kierunku Pac-Mana
function moveGhosts() {
    ghosts.forEach(ghost => {
        if (isInReactionRange(ghost)) {
            ghost.isFollowing = true; // Duch zaczyna podążać za Pac-Manem
            followPacman(ghost); // Funkcja podążania za Pac-Manem
        } else {
            ghost.isFollowing = false; // Duch porusza się losowo
            randomMoveGhost(ghost);
        }
    });
}

function randomMoveGhost(ghost) {
    const directions = [
        { dx: 0, dy: -1 }, // Góra
        { dx: 0, dy: 1 },  // Dół
        { dx: -1, dy: 0 }, // Lewo
        { dx: 1, dy: 0 }   // Prawo
    ];

    // Wybierz losowy kierunek
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const newX = ghost.x + direction.dx;
    const newY = ghost.y + direction.dy;

    // Sprawdź, czy nowa pozycja nie jest ścianą, przejściem teleportacyjnym i nie koliduje z innymi duchami
    if (
        mapa[newY][newX] !== '#' && // Nie ściana
        (newX !== 0 && newX !== mapa[0].length - 1) && // Nie teleportacja
        !ghosts.some(g => g.x === newX && g.y === newY) // Bez kolizji z innymi duchami
    ) {
        ghost.x = newX;
        ghost.y = newY;
    }
}

// Funkcja sprawdzająca, czy Pac-Man jest w zasięgu ducha
function isInReactionRange(ghost) {
    const distance = Math.abs(ghost.x - pacmanPosition.x) + Math.abs(ghost.y - pacmanPosition.y);
    return distance <= ghostReactionDistance;
}

// Funkcja podążania ducha za Pac-Manem
function followPacman(ghost) {
    const dx = pacmanPosition.x - ghost.x;
    const dy = pacmanPosition.y - ghost.y;

    // Poruszaj się w kierunku Pac-Mana, ale bez teleportacji
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && mapa[ghost.y][ghost.x + 1] !== '#' && ghost.x + 1 !== 0) {
            ghost.x++;
        } else if (dx < 0 && mapa[ghost.y][ghost.x - 1] !== '#' && ghost.x - 1 !== mapa[0].length - 1) {
            ghost.x--;
        }
    } else {
        if (dy > 0 && mapa[ghost.y + 1][ghost.x] !== '#') {
            ghost.y++;
        } else if (dy < 0 && mapa[ghost.y - 1][ghost.x] !== '#') {
            ghost.y--;
        }
    }
}

function showStartForm() {
    const startFormElement = document.getElementById('start-form');
    if (startFormElement) {
        startFormElement.classList.remove('hidden'); // Pokazuje formularz startowy
    }
}

document.addEventListener('DOMContentLoaded', showStartForm);

// Funkcja poruszająca duchem losowo, gdy nie podąża za Pac-Manem
function randomMoveGhost(ghost) {
    const direction = Math.floor(Math.random() * 4);
    const newPos = { ...ghost };

    if (direction === 0 && mapa[ghost.y - 1][ghost.x] !== '#') {
        newPos.y--;
    } else if (direction === 1 && mapa[ghost.y + 1][ghost.x] !== '#') {
        newPos.y++;
    } else if (direction === 2 && mapa[ghost.y][ghost.x - 1] !== '#') {
        newPos.x--;
    } else if (direction === 3 && mapa[ghost.y][ghost.x + 1] !== '#') {
        newPos.x++;
    }

    if (!ghosts.some(g => g.x === newPos.x && g.y === newPos.y)) {
        ghost.x = newPos.x;
        ghost.y = newPos.y;
    }
}

// Funkcja sprawdzająca kolizję z duchami
function checkCollisionWithGhost() {
    if (ghosts.some(ghost => ghost.x === pacmanPosition.x && ghost.y === pacmanPosition.y)) {
        lives--;
        updateLives();

        if (lives === 0) {
            gameActive = false;

            // Wyświetl napis Game Over
            gameOverElement.classList.remove('hidden'); // Pokazanie napisu
            console.log("Game Over displayed."); // Debugging

            clearTimeout(gameLoopTimeout);

            // Wyświetl formularz restartu po 2 sekundach
            setTimeout(showRestartForm, 2000);
        } else {
            clearPacman();
            pacmanPosition = { x: 1, y: 1 };
            drawPacman();
        }
    }
}
function showRestartForm() {
    gameOverElement.classList.add('hidden'); // Ukryj Game Over
    restartFormElement.classList.remove('hidden'); // Wyświetl formularz restartu
}

// Funkcja wyświetlająca formularz restartu
function showRestartForm() {
    gameOverElement.classList.add('hidden'); // Ukrywa napis "Game Over"
    restartFormElement.classList.remove('hidden'); // Wyświetla formularz restartu
}
// Funkcja restartująca grę
function restartGame() {
    lives = 3;
    score = 0;
    pacmanPosition = { x: 1, y: 1 };
    gameActive = true;

     // Ukrycie napisu Game Over
     gameOverElement.classList.add('hidden');

     restartFormElement.classList.add('hidden');

    renderMap();
    drawPacman();
    resetGhosts(); // Resetowanie duchów do gniazd
    updateScore();
    updateLives();
    gameLoop(); // Uruchomienie gry
}

document.getElementById('restart-yes').addEventListener('click', restartGame);
document.getElementById('restart-no').addEventListener('click', () => {
    alert('Dziękujemy za grę!');
    restartFormElement.classList.add('hidden'); // Ukrywa formularz restartu
});

// Funkcja resetująca duchy do gniazd
function resetGhosts() {
    ghosts.forEach((ghost, index) => {
        ghost.x = ghostSpawns[index].x;
        ghost.y = ghostSpawns[index].y;
    });
    drawGhosts();
}

// Funkcja pętli gry
function gameLoop() {
    const cells = gameElement.children;

    ghosts.forEach(ghost => {
        const index = ghost.y * mapa[0].length + ghost.x;
        cells[index].classList.remove('ghost');
    });

    moveGhosts();
    drawGhosts();
    checkCollisionWithGhost();

    if (lives > 0) {
        gameLoopTimeout = setTimeout(gameLoop, gameSpeed); // Użyj dynamicznej prędkości gry
    }
}

// Funkcja do pokazania formularza startowego
function showRestartForm() {
    restartFormElement.classList.remove('hidden'); // Pokaż formularz restartu
}

document.getElementById('restart-yes').addEventListener('click', restartGame);
document.getElementById('restart-no').addEventListener('click', () => {
    alert('Dziękujemy za grę!');
    restartFormElement.classList.add('hidden');
});

// Funkcja rozpoczynająca grę po kliknięciu przycisku Start
function startGame() { 
    const difficulty = document.getElementById('difficulty-select').value;

    // Dostosowanie parametrów gry
    if (difficulty === 'easy') {
        gameSpeed = 700; // Wolniejsza gra
        ghostSpeed = 700; // Duchy poruszają się wolniej
        ghostReactionDistance = 7; // Duchy reagują z większej odległości
        ghostCount = 3; // Mniej duchów
    } else if (difficulty === 'medium') {
        gameSpeed = 500; // Standardowa prędkość gry
        ghostSpeed = 500;
        ghostReactionDistance = 5;
        ghostCount = 4;
    } else if (difficulty === 'hard') {
        gameSpeed = 300; // Szybsza gra
        ghostSpeed = 300; // Duchy poruszają się szybciej
        ghostReactionDistance = 3; // Duchy reagują z mniejszej odległości
        ghostCount = 6; // Więcej duchów
    }

    console.log(`Wybrano poziom: ${difficulty}`);
    console.log(`Prędkość gry: ${gameSpeed}, Prędkość duchów: ${ghostSpeed}, Odległość reakcji: ${ghostReactionDistance}, Liczba duchów: ${ghostCount}`);

    // Resetowanie liczby duchów w grze
    ghosts = ghosts.slice(0, ghostCount);

    // Ukryj formularz startowy
    const startFormElement = document.getElementById('start-form');
    if (startFormElement) {
        startFormElement.classList.add('hidden'); // Ukrywa formularz startowy
    }


 
    renderMap();
    drawPacman();
    drawGhosts();
    updateScore();
    updateLives();
    gameLoop();
       // Rozpocznij grę
       gameActive = true;
       gameLoop();
}

// Powiązanie przycisku START z funkcją startGame
document.getElementById('start-button').addEventListener('click', startGame);


// Wywołaj formularz startowy przy załadowaniu strony
document.addEventListener('DOMContentLoaded', showStartForm);

// Funkcja do obsługi ruchu Pac-Mana
document.addEventListener('keydown', (event) => {
    if (!gameActive) return; // Sprawdzenie, czy gra jest aktywna

    // Obliczanie bieżącego indeksu i usuwanie Pacmana z aktualnej pozycji
    const currentIndex = pacmanPosition.y * mapa[0].length + pacmanPosition.x;
    const cells = gameElement.children;
    cells[currentIndex].classList.remove('pacman');

    // Obsługa ruchu Pacmana
    if (event.key === 'ArrowUp') {
        if (pacmanPosition.y > 0 && mapa[pacmanPosition.y - 1][pacmanPosition.x] !== '#') {
            pacmanPosition.y--;
        }
    } else if (event.key === 'ArrowDown') {
        if (pacmanPosition.y < mapa.length - 1 && mapa[pacmanPosition.y + 1][pacmanPosition.x] !== '#') {
            pacmanPosition.y++;
        }
    } else if (event.key === 'ArrowLeft') {
        if (pacmanPosition.x === 0) {
            pacmanPosition.x = mapa[0].length - 1;
        } else if (mapa[pacmanPosition.y][pacmanPosition.x - 1] !== '#') {
            pacmanPosition.x--;
        }
    } else if (event.key === 'ArrowRight') {
        if (pacmanPosition.x === mapa[0].length - 1) {
            pacmanPosition.x = 0;
        } else if (mapa[pacmanPosition.y][pacmanPosition.x + 1] !== '#') {
            pacmanPosition.x++;
        }
    }

// Obliczanie nowego indeksu i sprawdzanie kolizji z punktami lub owocami
const newIndex = pacmanPosition.y * mapa[0].length + pacmanPosition.x;
const fruitType = mapa[pacmanPosition.y][pacmanPosition.x];

if (cells[newIndex].classList.contains('point')) {
    cells[newIndex].classList.remove('point'); // Usuwanie punktu
    score++;
    updateScore();

    // Aktualizacja tablicy `mapa` - usuń punkt
    mapa[pacmanPosition.y] = 
        mapa[pacmanPosition.y].substring(0, pacmanPosition.x) + 
        ' ' + // Zamień punkt na pustą przestrzeń
        mapa[pacmanPosition.y].substring(pacmanPosition.x + 1);
} else if (cells[newIndex].classList.contains('fruit')) {
    // Dodawanie punktów za różne owoce
    if (fruitType === 'S') {
        score += 20; // Truskawka = 20 punktów
    } else if (fruitType === 'C') {
        score += 15; // Wiśnia = 15 punktów
    }

    cells[newIndex].classList.remove('fruit'); // Usuń owoc z planszy
    updateScore();

    // Aktualizacja tablicy `mapa` - usuń owoc
    mapa[pacmanPosition.y] = 
        mapa[pacmanPosition.y].substring(0, pacmanPosition.x) + 
        ' ' + // Zamień owoc na pustą przestrzeń
        mapa[pacmanPosition.y].substring(pacmanPosition.x + 1);
}
    drawPacman();

document.getElementById('other-game-button').addEventListener('click', () => {
    window.location.href = 'snake.html'; // Upewnij się, że nazwa pliku jest poprawna
});



});


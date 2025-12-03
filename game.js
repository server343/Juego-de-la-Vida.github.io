// Conway's Game of Life - Complete Implementation
// ================================================

// Configuration
const CONFIG = {
    cellSize: 8,
    gridWidth: 80,
    gridHeight: 50,
    defaultSpeed: 5,
    minSpeed: 1,
    maxSpeed: 10,
    initialDensity: 0.3, // 30% cells alive on random generation
};

// Game State
let grid = [];
let isRunning = false;
let generation = 0;
let animationId = null;
let speed = CONFIG.defaultSpeed;
let lastUpdateTime = 0;

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playPauseBtn = document.getElementById('playPauseBtn');
const playPauseIcon = document.getElementById('playPauseIcon');
const playPauseText = document.getElementById('playPauseText');
const stepBtn = document.getElementById('stepBtn');
const clearBtn = document.getElementById('clearBtn');
const randomBtn = document.getElementById('randomBtn');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const generationDisplay = document.getElementById('generation');
const populationDisplay = document.getElementById('population');
const saveBtn = document.getElementById('saveBtn');
const saveNameInput = document.getElementById('saveName');
const loadMenuBtn = document.getElementById('loadMenuBtn');
const loadModal = document.getElementById('loadModal');
const closeModalBtn = document.getElementById('closeModal');
const savedGamesList = document.getElementById('savedGamesList');
const noGamesMessage = document.getElementById('noGamesMessage');
const toast = document.getElementById('toast');

// Initialize Canvas
function initCanvas() {
    // Adjust grid size for mobile devices
    if (window.innerWidth < 768) {
        CONFIG.cellSize = 6;
        CONFIG.gridWidth = Math.floor((window.innerWidth - 64) / CONFIG.cellSize);
        CONFIG.gridHeight = Math.floor((window.innerHeight * 0.5) / CONFIG.cellSize);
    } else if (window.innerWidth < 1024) {
        CONFIG.cellSize = 7;
        CONFIG.gridWidth = Math.floor((window.innerWidth * 0.6) / CONFIG.cellSize);
        CONFIG.gridHeight = Math.floor((window.innerHeight * 0.6) / CONFIG.cellSize);
    }

    canvas.width = CONFIG.gridWidth * CONFIG.cellSize;
    canvas.height = CONFIG.gridHeight * CONFIG.cellSize;

    // Set canvas style for crisp rendering
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
}

// Create Empty Grid
function createEmptyGrid() {
    return Array(CONFIG.gridHeight).fill(null).map(() =>
        Array(CONFIG.gridWidth).fill(0)
    );
}

// Create Random Grid
function createRandomGrid() {
    return Array(CONFIG.gridHeight).fill(null).map(() =>
        Array(CONFIG.gridWidth).fill(0).map(() =>
            Math.random() < CONFIG.initialDensity ? 1 : 0
        )
    );
}

// Count Living Neighbors
function countNeighbors(grid, x, y) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;

            const newY = (y + i + CONFIG.gridHeight) % CONFIG.gridHeight;
            const newX = (x + j + CONFIG.gridWidth) % CONFIG.gridWidth;

            count += grid[newY][newX];
        }
    }
    return count;
}

// Calculate Next Generation
function nextGeneration() {
    const newGrid = createEmptyGrid();

    for (let y = 0; y < CONFIG.gridHeight; y++) {
        for (let x = 0; x < CONFIG.gridWidth; x++) {
            const neighbors = countNeighbors(grid, x, y);
            const cell = grid[y][x];

            // Conway's Rules:
            // 1. Any live cell with 2-3 neighbors survives
            // 2. Any dead cell with exactly 3 neighbors becomes alive
            // 3. All other cells die or stay dead

            if (cell === 1 && (neighbors === 2 || neighbors === 3)) {
                newGrid[y][x] = 1;
            } else if (cell === 0 && neighbors === 3) {
                newGrid[y][x] = 1;
            } else {
                newGrid[y][x] = 0;
            }
        }
    }

    grid = newGrid;
    generation++;
    updateStats();
}

// Render Grid
function renderGrid() {
    // Clear canvas
    ctx.fillStyle = '#1e223a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw cells
    for (let y = 0; y < CONFIG.gridHeight; y++) {
        for (let x = 0; x < CONFIG.gridWidth; x++) {
            if (grid[y][x] === 1) {
                // Alive cell with gradient effect
                const gradient = ctx.createLinearGradient(
                    x * CONFIG.cellSize,
                    y * CONFIG.cellSize,
                    (x + 1) * CONFIG.cellSize,
                    (y + 1) * CONFIG.cellSize
                );
                gradient.addColorStop(0, '#667eea');
                gradient.addColorStop(1, '#764ba2');

                ctx.fillStyle = gradient;
                ctx.fillRect(
                    x * CONFIG.cellSize + 0.5,
                    y * CONFIG.cellSize + 0.5,
                    CONFIG.cellSize - 1,
                    CONFIG.cellSize - 1
                );
            }
        }
    }
}

// Animation Loop
function animate(timestamp) {
    if (!isRunning) return;

    const updateInterval = 1000 / speed;

    if (timestamp - lastUpdateTime >= updateInterval) {
        nextGeneration();
        renderGrid();
        lastUpdateTime = timestamp;
    }

    animationId = requestAnimationFrame(animate);
}

// Start Game
function start() {
    if (isRunning) return;
    isRunning = true;
    lastUpdateTime = performance.now();
    playPauseIcon.textContent = '⏸️';
    playPauseText.textContent = 'Pausar';
    playPauseBtn.classList.add('active');
    animationId = requestAnimationFrame(animate);
}

// Pause Game
function pause() {
    if (!isRunning) return;
    isRunning = false;
    playPauseIcon.textContent = '▶️';
    playPauseText.textContent = 'Iniciar';
    playPauseBtn.classList.remove('active');
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
}

// Toggle Play/Pause
function togglePlayPause() {
    if (isRunning) {
        pause();
    } else {
        start();
    }
}

// Step One Generation
function step() {
    pause();
    nextGeneration();
    renderGrid();
}

// Clear Grid
function clear() {
    pause();
    grid = createEmptyGrid();
    generation = 0;
    renderGrid();
    updateStats();
    showToast('Tablero limpiado', 'success');
}

// Randomize Grid
function randomize() {
    pause();
    grid = createRandomGrid();
    generation = 0;
    renderGrid();
    updateStats();
    showToast('Tablero generado aleatoriamente', 'success');
}

// Update Speed
function updateSpeed() {
    speed = parseInt(speedSlider.value);
    speedValue.textContent = `${speed}x`;
}

// Update Statistics
function updateStats() {
    generationDisplay.textContent = generation;

    let population = 0;
    for (let y = 0; y < CONFIG.gridHeight; y++) {
        for (let x = 0; x < CONFIG.gridWidth; x++) {
            population += grid[y][x];
        }
    }
    populationDisplay.textContent = population;
}

// Canvas Click Handler
function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((event.clientX - rect.left) * scaleX / CONFIG.cellSize);
    const y = Math.floor((event.clientY - rect.top) * scaleY / CONFIG.cellSize);

    if (x >= 0 && x < CONFIG.gridWidth && y >= 0 && y < CONFIG.gridHeight) {
        grid[y][x] = grid[y][x] === 1 ? 0 : 1;
        renderGrid();
        updateStats();
    }
}

// Touch Handler for Mobile
function handleTouchMove(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((touch.clientX - rect.left) * scaleX / CONFIG.cellSize);
    const y = Math.floor((touch.clientY - rect.top) * scaleY / CONFIG.cellSize);

    if (x >= 0 && x < CONFIG.gridWidth && y >= 0 && y < CONFIG.gridHeight) {
        grid[y][x] = 1; // Draw mode on touch
        renderGrid();
        updateStats();
    }
}

// Save Game
function saveGame() {
    const name = saveNameInput.value.trim();

    if (!name) {
        showToast('Por favor, ingresa un nombre para la partida', 'error');
        return;
    }

    const savedGames = getSavedGames();

    const gameData = {
        name: name,
        grid: grid,
        generation: generation,
        date: new Date().toISOString(),
        gridWidth: CONFIG.gridWidth,
        gridHeight: CONFIG.gridHeight,
    };

    savedGames[name] = gameData;
    localStorage.setItem('conwayGameSaves', JSON.stringify(savedGames));

    saveNameInput.value = '';
    showToast(`Partida "${name}" guardada correctamente`, 'success');
}

// Load Game
function loadGame(name) {
    const savedGames = getSavedGames();
    const gameData = savedGames[name];

    if (!gameData) {
        showToast('No se pudo cargar la partida', 'error');
        return;
    }

    // Check if grid dimensions match
    if (gameData.gridWidth !== CONFIG.gridWidth || gameData.gridHeight !== CONFIG.gridHeight) {
        showToast('La partida guardada tiene dimensiones diferentes', 'error');
        return;
    }

    pause();
    grid = gameData.grid;
    generation = gameData.generation;
    renderGrid();
    updateStats();
    closeModal();
    showToast(`Partida "${name}" cargada`, 'success');
}

// Delete Game
function deleteGame(name) {
    if (!confirm(`¿Estás seguro de que quieres eliminar la partida "${name}"?`)) {
        return;
    }

    const savedGames = getSavedGames();
    delete savedGames[name];
    localStorage.setItem('conwayGameSaves', JSON.stringify(savedGames));

    showToast(`Partida "${name}" eliminada`, 'success');
    renderSavedGames();
}

// Get Saved Games
function getSavedGames() {
    const saved = localStorage.getItem('conwayGameSaves');
    return saved ? JSON.parse(saved) : {};
}

// Render Saved Games List
function renderSavedGames() {
    const savedGames = getSavedGames();
    const gameNames = Object.keys(savedGames);

    savedGamesList.innerHTML = '';

    if (gameNames.length === 0) {
        noGamesMessage.style.display = 'block';
        return;
    }

    noGamesMessage.style.display = 'none';

    // Sort by date (newest first)
    gameNames.sort((a, b) => {
        return new Date(savedGames[b].date) - new Date(savedGames[a].date);
    });

    gameNames.forEach(name => {
        const game = savedGames[name];
        const item = document.createElement('div');
        item.className = 'saved-game-item';

        const date = new Date(game.date);
        const formattedDate = date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        item.innerHTML = `
            <div class="game-info">
                <div class="game-name">${name}</div>
                <div class="game-date">Generación ${game.generation} • ${formattedDate}</div>
            </div>
            <div class="game-actions">
                <button class="action-btn load-btn" onclick="loadGame('${name}')">
                    📂 Cargar
                </button>
                <button class="action-btn delete-btn" onclick="deleteGame('${name}')">
                    🗑️ Eliminar
                </button>
            </div>
        `;

        savedGamesList.appendChild(item);
    });
}

// Show Load Modal
function showLoadModal() {
    renderSavedGames();
    loadModal.classList.add('active');
}

// Close Modal
function closeModal() {
    loadModal.classList.remove('active');
}

// Show Toast Notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Event Listeners
playPauseBtn.addEventListener('click', togglePlayPause);
stepBtn.addEventListener('click', step);
clearBtn.addEventListener('click', clear);
randomBtn.addEventListener('click', randomize);
speedSlider.addEventListener('input', updateSpeed);
saveBtn.addEventListener('click', saveGame);
loadMenuBtn.addEventListener('click', showLoadModal);
closeModalBtn.addEventListener('click', closeModal);

// Canvas interaction
canvas.addEventListener('click', handleCanvasClick);
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas.addEventListener('touchstart', handleTouchMove, { passive: false });

// Close modal on outside click
loadModal.addEventListener('click', (e) => {
    if (e.target === loadModal) {
        closeModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
    } else if (e.code === 'KeyS') {
        step();
    } else if (e.code === 'KeyC') {
        clear();
    } else if (e.code === 'KeyR') {
        randomize();
    }
});

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        pause();
        initCanvas();
        renderGrid();
    }, 250);
});

// Initialize and Auto-start
function init() {
    initCanvas();
    grid = createRandomGrid();
    renderGrid();
    updateStats();

    // Auto-start the game
    setTimeout(() => {
        start();
        showToast('¡Juego iniciado! Presiona Espacio para pausar', 'success');
    }, 500);
}

// Start the game when page loads
init();

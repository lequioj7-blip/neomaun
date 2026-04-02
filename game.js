// Magic Taiko Game Logic

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let score = 0;
let combo = 0;
let gameActive = false;
let notes = [];
let currentTime = 0;

// Canvas sizing
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Note class
class Note {
    constructor(type, spawnTime) {
        this.type = type; // 'don' or 'ka'
        this.spawnTime = spawnTime;
        this.x = canvas.width;
        this.y = type === 'don' ? canvas.height / 3 : (canvas.height * 2) / 3;
        this.radius = 25;
        this.speed = 3;
        this.hit = false;
    }

    update() {
        this.x -= this.speed;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        if (this.type === 'don') {
            ctx.fillStyle = '#FF6B6B'; // Red for "Don"
        } else {
            ctx.fillStyle = '#4ECDC4'; // Cyan for "Ka"
        }
        
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type === 'don' ? 'ドン' : 'カッ', this.x, this.y);
    }

    isOutOfBounds() {
        return this.x + this.radius < 0;
    }
}

// Hit zone marker
const hitZoneX = 100;
const hitZoneRadius = 40;
const hitMargin = 50;

// Draw hit zone
function drawHitZone() {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(hitZoneX, canvas.height / 2, hitZoneRadius, 0, Math.PI * 2);
    ctx.stroke();
}

// Check if note is hit
function checkHit(note, keyType) {
    const distance = Math.abs(note.x - hitZoneX);
    
    if (distance <= hitMargin && !note.hit) {
        note.hit = true;

        if (
            (note.type === 'don' && keyType === 'don') ||
            (note.type === 'ka' && keyType === 'ka')
        ) {
            // Perfect hit
            if (distance <= 20) {
                score += 300;
                combo += 1;
                document.getElementById('status').textContent = '完璧！';
                document.getElementById('status').style.color = '#00FF00';
            }
            // Good hit
            else if (distance <= 35) {
                score += 200;
                combo += 1;
                document.getElementById('status').textContent = 'グッド！';
                document.getElementById('status').style.color = '#FFD700';
            }
            // OK hit
            else {
                score += 100;
                combo += 1;
                document.getElementById('status').textContent = 'OK';
                document.getElementById('status').style.color = '#00CCFF';
            }
        } else {
            // Wrong note type
            combo = 0;
            document.getElementById('status').textContent = 'ミス！';
            document.getElementById('status').style.color = '#FF0000';
        }

        updateDisplay();
    }
}

// Update score and combo display
function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('combo').textContent = combo;
}

// Keyboard events
document.addEventListener('keydown', (e) => {
    if (!gameActive) return;

    if (e.key.toLowerCase() === 'd') {
        notes.forEach(note => checkHit(note, 'don'));
    } else if (e.key.toLowerCase() === 'k') {
        notes.forEach(note => checkHit(note, 'ka'));
    }
});

// Generate random notes
function generateNotes() {
    const interval = 60; // Frames between notes
    if (currentTime % interval === 0 && currentTime < 3000) {
        const type = Math.random() < 0.5 ? 'don' : 'ka';
        notes.push(new Note(type, currentTime));
    }
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw lane divider
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw lane labels
    ctx.fillStyle = '#666';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('ドン', 10, canvas.height / 3 + 5);
    ctx.fillText('カッ', 10, (canvas.height * 2) / 3 + 5);

    // Draw hit zone
    drawHitZone();

    if (gameActive) {
        // Generate and update notes
        generateNotes();
        
        for (let i = notes.length - 1; i >= 0; i--) {
            notes[i].update();
            notes[i].draw();

            // Remove notes that are out of bounds
            if (notes[i].isOutOfBounds()) {
                if (!notes[i].hit) {
                    combo = 0; // Miss
                    document.getElementById('status').textContent = 'ミス！';
                    document.getElementById('status').style.color = '#FF0000';
                    updateDisplay();
                }
                notes.splice(i, 1);
            }
        }

        currentTime++;

        // End game after 3000 frames (50 seconds at 60fps)
        if (currentTime >= 3000) {
            endGame();
        }

        requestAnimationFrame(gameLoop);
    } else {
        requestAnimationFrame(gameLoop);
    }
}

// Start game
function startGame() {
    if (gameActive) return;
    
    gameActive = true;
    score = 0;
    combo = 0;
    notes = [];
    currentTime = 0;
    updateDisplay();
    document.getElementById('status').textContent = 'ゲーム中...';
    document.getElementById('status').style.color = '#ffaa00';
    gameLoop();
}

// End game
function endGame() {
    gameActive = false;
    document.getElementById('status').textContent = `ゲーム終了！最終スコア: ${score}`;
    document.getElementById('status').style.color = '#FFD700';
}

// Reset game
function resetGame() {
    gameActive = false;
    score = 0;
    combo = 0;
    notes = [];
    currentTime = 0;
    updateDisplay();
    document.getElementById('status').textContent = 'ゲーム開始前';
    document.getElementById('status').style.color = '#ffaa00';
    
    // Redraw canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Button events
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('resetBtn').addEventListener('click', resetGame);

// Initial draw
ctx.fillStyle = '#1a1a2e';
ctx.fillRect(0, 0, canvas.width, canvas.height);
drawHitZone();
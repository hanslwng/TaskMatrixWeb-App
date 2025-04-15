class DinoGame {
    constructor() {
        this.dino = document.getElementById('dino');
        this.game = document.getElementById('game');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.speedElement = document.getElementById('speed');
        this.startButton = document.getElementById('startGame');
        this.obstaclesContainer = document.getElementById('obstacles');
        
        this.isGameRunning = false;
        this.score = 0;
        this.highScore = localStorage.getItem('dinoHighScore') || 0;
        this.speed = 5;
        this.baseSpeed = 7;
        this.obstacles = [];
        this.isJumping = false;
        this.isDucking = false;
        this.gravity = 1.5;
        this.jumpForce = -25;
        this.groundLevel = 0;
        this.dinoY = this.groundLevel;
        this.dinoVelocity = 0;
        this.jumpHeight = 200; // Maximum jump height
        
        // Adjust game physics for much larger screen
        this.minObstacleDistance = 450;
        this.maxObstacleDistance = 800;
        
        // Initialize dino appearance
        this.initializeDino();
        this.init();
    }

    initializeDino() {
        // Create T-Rex structure
        this.dino.innerHTML = `
            <div class="runner-body">
                <div class="head"></div>
                <div class="torso"></div>
                <div class="arm-left"></div>
                <div class="arm-right"></div>
                <div class="leg-left"></div>
                <div class="leg-right"></div>
            </div>
        `;
        
        // Add running class by default
        this.dino.classList.add('running');
        
        // Set initial position
        this.dino.style.bottom = '0px';
        this.dinoY = 0;
        
        // Ensure dino is visible with default theme
        if (!this.game.className) {
            this.game.className = 'classic';
        }
    }
    init() {
        this.setupEventListeners();
        this.updateHighScore();
        this.createParticleSystem();
        this.setupModals();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        this.startButton.addEventListener('click', () => this.startGame());
        
        // Theme buttons
        document.querySelectorAll('.theme-btn-wrapper').forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                document.querySelectorAll('.theme-btn-wrapper').forEach(b => 
                    b.classList.remove('active')
                );
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Change theme
                const theme = btn.dataset.theme;
                this.game.className = theme;
            });
        });
    }

    startGame() {
        if (this.isGameRunning) return;
        
        this.isGameRunning = true;
        this.score = 0;
        this.speed = this.baseSpeed;
        this.obstacles = [];
        this.obstaclesContainer.innerHTML = ''; // Clear existing obstacles
        this.updateScore();
        this.startButton.textContent = 'Game Running';
        this.dino.classList.add('running');
        this.gameLoop();
    }

    gameLoop() {
        if (!this.isGameRunning) {
            this.dino.classList.remove('running');
            return;
        }

        // Update game state
        this.updateDinoPosition();
        this.updateObstacles();
        this.checkCollisions();
        this.updateScore();
        this.adjustDifficulty();

        // Continue the game loop
        requestAnimationFrame(() => this.gameLoop());
    }

    updateDinoPosition() {
        if (this.isJumping) {
            // Apply gravity
            this.dinoVelocity += this.gravity;
            this.dinoY += this.dinoVelocity;

            // Ground collision
            if (this.dinoY >= this.groundLevel) {
                this.dinoY = this.groundLevel;
                this.dinoVelocity = 0;
                this.isJumping = false;
                this.dino.classList.remove('jumping');
                if (!this.isDucking && this.isGameRunning) {
                    this.dino.classList.add('running');
                }
            }

            // Ceiling limit
            if (this.dinoY <= -this.jumpHeight) {
                this.dinoY = -this.jumpHeight;
                this.dinoVelocity = 0;
            }

            // Update dino position
            this.dino.style.bottom = `${-this.dinoY}px`;
        }
    }

    jump() {
        if (this.isJumping || this.isDucking) return;
        
        this.isJumping = true;
        this.dinoVelocity = this.jumpForce;
        this.dino.classList.remove('running');
        this.dino.classList.add('jumping');
        
        // Add jump animation
        this.dino.style.animation = 'jump-motion 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => {
            this.dino.style.animation = '';
        }, 500);
    }

    createObstacle() {
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        
        // Random obstacle height for larger game
        const height = Math.random() * 40 + 50; // Between 50 and 90px
        obstacle.style.height = `${height}px`;
        
        // Random obstacle width
        const width = Math.random() * 15 + 25; // Between 25 and 40px
        obstacle.style.width = `${width}px`;
        
        obstacle.style.right = '-40px';
        this.obstaclesContainer.appendChild(obstacle);
        return obstacle;
    }

    updateObstacles() {
        if (this.obstacles.length === 0 || 
            this.obstacles[this.obstacles.length - 1].offsetLeft < 
            this.game.offsetWidth - this.minObstacleDistance) {
            
            const distance = Math.random() * 
                (this.maxObstacleDistance - this.minObstacleDistance) + 
                this.minObstacleDistance;
                
            if (this.obstacles.length === 0 || 
                this.obstacles[this.obstacles.length - 1].offsetLeft < 
                this.game.offsetWidth - distance) {
                this.obstacles.push(this.createObstacle());
            }
        }

        this.obstacles.forEach((obstacle, index) => {
            const currentPosition = parseInt(obstacle.style.right || 0);
            const newPosition = currentPosition + this.speed;
            
            if (newPosition > this.game.offsetWidth + 50) {
                obstacle.remove();
                this.obstacles.splice(index, 1);
            } else {
                obstacle.style.right = `${newPosition}px`;
            }
        });
    }

    checkCollisions() {
        if (!this.isGameRunning) return;

        const dinoRect = this.dino.getBoundingClientRect();
        
        this.obstacles.forEach(obstacle => {
            const obstacleRect = obstacle.getBoundingClientRect();
            
            // Adjust collision box based on ducking state
            const adjustedDinoRect = {
                left: dinoRect.left + 10,
                right: dinoRect.right - 10,
                top: dinoRect.top + (this.isDucking ? 20 : 10),
                bottom: dinoRect.bottom - 5
            };

            if (this.isColliding(adjustedDinoRect, obstacleRect)) {
                this.gameOver();
            }
        });
    }

    isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }

    adjustDifficulty() {
        this.speed = this.baseSpeed + (Math.floor(this.score / 500) * 0.5);
        this.speedElement.textContent = `Speed: ${(this.speed / this.baseSpeed).toFixed(1)}x`;
    }

    gameOver() {
        this.isGameRunning = false;
        this.dino.classList.remove('running', 'jumping');
        this.startButton.textContent = 'Start Game';
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('dinoHighScore', this.highScore);
            this.updateHighScore();
        }
        
        alert(`Game Over! Score: ${this.score}`);
    }

    handleKeyDown(event) {
        if ((event.code === 'Space' || event.code === 'ArrowUp')) {
            event.preventDefault();
            if (!this.isGameRunning) {
                this.startGame();
            } else {
                this.jump();
            }
        } else if (event.code === 'ArrowDown') {
            event.preventDefault();
            this.duck();
        }
    }

    handleKeyUp(event) {
        if (event.code === 'ArrowDown') {
            this.stopDuck();
        }
    }

    duck() {
        if (this.isJumping) return;
        
        this.isDucking = true;
        this.dino.classList.remove('running', 'jumping');
        this.dino.classList.add('ducking');
        
        // Adjust hitbox for ducking
        this.dino.style.height = '40px';
    }

    stopDuck() {
        if (!this.isDucking) return;
        
        this.isDucking = false;
        this.dino.classList.remove('ducking');
        if (!this.isJumping && this.isGameRunning) {
            this.dino.classList.add('running');
        }
        
        // Reset hitbox
        this.dino.style.height = '80px';
    }

    updateScore() {
        this.score += 1;
        this.scoreElement.textContent = `Score: ${this.score}`;
    }

    updateHighScore() {
        this.highScoreElement.textContent = `High Score: ${this.highScore}`;
    }

    changeTheme(theme) {
        // Remove active class from all buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to selected theme button
        document.querySelector(`.theme-btn[data-theme="${theme}"]`).classList.add('active');
        
        // Change game theme
        this.game.className = theme;
    }

    // Particle system methods
    createParticleSystem() {
        this.particles = [];
        setInterval(() => this.updateParticles(), 16);
    }

    spawnParticle(x, y, theme) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Larger particles
        const size = Math.random() * 8 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Wider spread for particles
        const xVar = Math.random() * 60 - 30;
        const yVar = Math.random() * 60 - 30;
        
        particle.style.left = `${x + xVar}px`;
        particle.style.top = `${y + yVar}px`;
        
        switch(theme) {
            case 'neon':
                particle.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
                particle.style.boxShadow = '0 0 5px currentColor';
                break;
            case 'desert':
                particle.style.background = '#ffd700';
                break;
            case 'space':
                particle.style.background = 'white';
                particle.style.borderRadius = '50%';
                break;
            default:
                particle.style.background = '#333';
        }
        
        this.game.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }

    updateParticles() {
        if (this.isGameRunning) {
            const theme = this.game.className;
            this.spawnParticle(
                Math.random() * this.game.offsetWidth,
                Math.random() * this.game.offsetHeight,
                theme
            );
        }
    }

    setupModals() {
        const settingsBtn = document.getElementById('settingsBtn');
        const infoBtn = document.getElementById('infoBtn');
        const settingsModal = document.getElementById('settingsModal');
        const infoModal = document.getElementById('infoModal');
        
        settingsBtn.addEventListener('click', () => this.openModal(settingsModal));
        infoBtn.addEventListener('click', () => this.openModal(infoModal));
        
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                settingsModal.classList.remove('active');
                infoModal.classList.remove('active');
            });
        });
    }

    openModal(modal) {
        if (this.isGameRunning) {
            this.pauseGame();
        }
        modal.classList.add('active');
    }

    pauseGame() {
        this.isGameRunning = false;
        this.startButton.textContent = 'Resume Game';
        this.dino.classList.remove('running');
    }
}

// Initialize game
const game = new DinoGame(); 

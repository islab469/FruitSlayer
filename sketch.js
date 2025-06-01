let gameState = 'start';
let score = 0;
let lives = 3;
let level = 1;
let currentLevel = 1;
let levelScores = [0, 0, 0, 0];
let comboCount = 0;
let lastSliceTime = 0;
const LEVEL_REQUIREMENTS = [100, 100, 100, 100];

let peachActive = false;
let peachSliceCount = 0;
let peachTimer = 15;
let peachStartTime = 0;
let peachImage;
let peachPosition = { x: 0, y: 0, size: 120 };
let sliceCountDisplay = { text: '', alpha: 0, y: 0 };
let isSlicingPeach = false;

window.FRUIT_TYPES = ['apple', 'banana', 'watermelon', 'strawberry', 'tomato', 'guava', 'pitaya', 'lemon'];

let video;
let handpose;
let hands = [];
let fruits = [];
let bombs = [];
let durians = [];
let bossActive = false;
let bossFruit = null;

let minFingerX = Infinity;
let maxFingerX = -Infinity;
let fingerPositions = [];
let sliceTrail = [];
let lastFingerPos = null;
let lastValidHandTime = 0;
const TRAIL_LENGTH = 10;
const SMOOTHING_FACTOR = 0.3;
const HAND_LOST_THRESHOLD = 800;
const MAX_MOVEMENT_DISTANCE = 50;
const MIN_CONFIDENCE = 0.4;

const MAX_FRUITS = 5;
const FRUIT_INTERVAL = 1000;
let lastFruitTime = 0;
const BOSS_INTERVAL = 30000;
let lastBossTime = 0;

let backgroundFruits = [];
let fruitImages = [];
let fruitSlicedImages = [];
let bombImage;
let durianImage;
let backgroundImage;
let sliceSound;
let bombSound;
let durianSound;

let gameTimer = 20;
let gameStartTime = 0;
let isPaused = false;

let isHurt = false;
let hurtTimer = 0;
let hurtDuration = 500;
let leftHandImage;
let rightHandImage;
let handShowTimer = 0;
let handShowDuration = 1000;
let showHands = false;

function preload() {
    try {
        backgroundImage = loadImage('./Assets/background.jpg', 
            () => console.log('背景圖片載入成功'),
            () => console.error('背景圖片載入失敗')
        );
        
        fruitImages['apple'] = loadImage('./Assets/apple1.png', 
            () => console.log('蘋果圖片載入成功'),
            () => console.error('蘋果圖片載入失敗')
        );
        fruitImages['banana'] = loadImage('./Assets/banana1.png', 
            () => console.log('香蕉圖片載入成功'),
            () => console.error('香蕉圖片載入失敗')
        );
        fruitImages['watermelon'] = loadImage('./Assets/watermelon1.png', 
            () => console.log('西瓜圖片載入成功'),
            () => console.error('西瓜圖片載入失敗')
        );
        fruitImages['strawberry'] = loadImage('./Assets/strawberry1.png', 
            () => console.log('草莓圖片載入成功'),
            () => console.error('草莓圖片載入失敗')
        );
        fruitImages['tomato'] = loadImage('./Assets/tomato1.png', 
            () => console.log('番茄圖片載入成功'),
            () => console.error('番茄圖片載入失敗')
        );
        fruitImages['guava'] = loadImage('./Assets/guava1.png', 
            () => console.log('芭樂圖片載入成功'),
            () => console.error('芭樂圖片載入失敗')
        );
        fruitImages['pitaya'] = loadImage('./Assets/pitaya1.png', 
            () => console.log('火龍果圖片載入成功'),
            () => console.error('火龍果圖片載入失敗')
        );
        fruitImages['lemon'] = loadImage('./Assets/lemon1.png', 
            () => console.log('檸檬圖片載入成功'),
            () => console.error('檸檬圖片載入失敗')
        );

        fruitSlicedImages['apple'] = loadImage('./Assets/apple2.png', 
            () => console.log('切開的蘋果圖片載入成功'),
            () => console.error('切開的蘋果圖片載入失敗')
        );
        fruitSlicedImages['banana'] = loadImage('./Assets/banana2.png', 
            () => console.log('切開的香蕉圖片載入成功'),
            () => console.error('切開的香蕉圖片載入失敗')
        );
        fruitSlicedImages['watermelon'] = loadImage('./Assets/watermelon2.png', 
            () => console.log('切開的西瓜圖片載入成功'),
            () => console.error('切開的西瓜圖片載入失敗')
        );
        fruitSlicedImages['strawberry'] = loadImage('./Assets/strawberry2.png', 
            () => console.log('切開的草莓圖片載入成功'),
            () => console.error('切開的草莓圖片載入失敗')
        );
        fruitSlicedImages['tomato'] = loadImage('./Assets/tomato2.png', 
            () => console.log('切開的番茄圖片載入成功'),
            () => console.error('切開的番茄圖片載入失敗')
        );
        fruitSlicedImages['guava'] = loadImage('./Assets/guava2.png', 
            () => console.log('切開的芭樂圖片載入成功'),
            () => console.error('切開的芭樂圖片載入失敗')
        );
        fruitSlicedImages['pitaya'] = loadImage('./Assets/pitaya2.png', 
            () => console.log('切開的火龍果圖片載入成功'),
            () => console.error('切開的火龍果圖片載入失敗')
        );
        fruitSlicedImages['lemon'] = loadImage('./Assets/lemon2.png', 
            () => console.log('切開的檸檬圖片載入成功'),
            () => console.error('切開的檸檬圖片載入失敗')
        );
        
        bombImage = loadImage('./Assets/boom.png', 
            () => console.log('炸彈圖片載入成功'),
            () => console.error('炸彈圖片載入失敗')
        );
        durianImage = loadImage('./Assets/durian1.png', 
            () => console.log('榴槤圖片載入成功'),
            () => console.error('榴槤圖片載入失敗')
        );

        peachImage = loadImage('./Assets/peach.png',
            () => console.log('桃子圖片載入成功'),
            () => console.error('桃子圖片載入失敗')
        );

        leftHandImage = loadImage('./Assets/LeftHand.png',
            () => console.log('左手圖片載入成功'),
            () => console.error('左手圖片載入失敗')
        );
        rightHandImage = loadImage('./Assets/RightHand.png?' + new Date().getTime(),
            () => console.log('右手圖片載入成功'),
            () => console.error('右手圖片載入失敗')
        );
    } catch (error) {
        console.error('圖片載入過程中發生錯誤:', error);
    }
}

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    let ctx = canvas.elt.getContext('2d', { willReadFrequently: true });    
    canvas.parent('gameContainer');
    canvas.style('background', 'transparent');
    
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();

    window.addEventListener('keydown', handleKeyPress);
}

function modelReady() {
    console.log('Handpose model ready!');
    
    handpose.on('predict', results => {
        hands = results;
    });
    
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('levelSelect').classList.remove('hidden');
}

function startGame() {
    gameState = 'playing';
    console.log('遊戲狀態:', gameState);
    score = 0;
    lives = 3;
    comboCount = 0;
    fruits = [];
    bombs = [];
    durians = [];
    bossFruit = null;
    bossActive = false;
    lastFruitTime = millis();
    lastBossTime = millis();
    gameTimer = 20;
    gameStartTime = millis();
    isPaused = false;
    loop();
    document.getElementById('gameStats').classList.remove('hidden');
    document.getElementById('comboIndicator').classList.add('hidden');
    document.getElementById('pauseMenu').classList.add('hidden');
    updateStats();
}

function restartGame() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    startGame();
}

function gameOver() {
    gameState = 'gameover';
    document.getElementById('gameStats').classList.add('hidden');
    document.getElementById('comboIndicator').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.remove('hidden');
    document.getElementById('finalScore').textContent = score;

    if (score > levelScores[level - 1]) {
        levelScores[level - 1] = score;
    }

    if (score >= LEVEL_REQUIREMENTS[level - 1]) {
        if (level === currentLevel && currentLevel < 4) {
            currentLevel = level + 1;
        }
        const nextLevelButton = document.getElementById('nextLevelButton');
        if (nextLevelButton) {
            if (level < 4 && score >= LEVEL_REQUIREMENTS[level - 1]) {
                nextLevelButton.textContent = `進入第 ${level + 1} 關`;
                nextLevelButton.classList.remove('hidden');
            } else {
                nextLevelButton.classList.add('hidden');
            }
        }
    } else {
        const nextLevelButton = document.getElementById('nextLevelButton');
        if (nextLevelButton) {
            nextLevelButton.classList.add('hidden');
        }
    }
}

function updateStats() {
    const scoreSpan = document.getElementById('score');
    const livesSpan = document.getElementById('lives');
    const currentLevelRequirement = LEVEL_REQUIREMENTS[level - 1];
    scoreSpan.textContent = `${score} / ${currentLevelRequirement}`;
    livesSpan.textContent = lives;
}

function showCombo() {
    const comboIndicator = document.getElementById('comboIndicator');
    const comboElement = document.getElementById('comboCount');
    
    comboElement.textContent = comboCount;
    
    comboIndicator.classList.remove('hidden');
    comboIndicator.classList.add('show');
    
    setTimeout(() => {
        comboIndicator.classList.remove('show');
        setTimeout(() => {
            comboIndicator.classList.add('hidden');
        }, 500);
    }, 1500);
}

function draw() {
    if (isPaused) {
        if (backgroundImage) {
            image(backgroundImage, 0, 0, width, height);
        } else {
            background(100);
        }
        return;
    }
    
    clear();
    
    if (backgroundImage) {
        image(backgroundImage, 0, 0, width, height);
    } else {
        background(100);
    }

    if (gameState === 'start') {
        updateBackgroundFruits();
        drawBackgroundFruits();
    } else if (gameState === 'playing') {
        if (!peachActive) {
            let elapsed = (millis() - gameStartTime) / 1000;
            let timeLeft = Math.max(0, 20 - Math.floor(elapsed));
            gameTimer = timeLeft;
            
            if (timeLeft === 0 && !peachActive) {
                generatePeach();
            }
        }
        
        fill('#FFD700');
        textAlign(RIGHT, TOP);
        textSize(32);
        text('剩餘時間: ' + gameTimer + ' 秒', width - 30, 30);
        
        if (gameTimer <= 0 && !peachActive) {
            generatePeach();
        }
        
        updateHandTracking();
        updateGameLogic();
        drawObjects();
        drawHandTracking();
        
        drawHurtEffect();
        drawHands();
        
        if (hands.length === 0) {
            fill(255, 255, 0, 220);
            textAlign(CENTER, CENTER);
            textSize(36);
            text('請將手放在鏡頭前', width/2, height/2);
        }
    }
}

function updateBackgroundFruits() {
    if (random(1) < 0.02) {
        backgroundFruits.push({
            x: random(width),
            y: height + 50,
            speedY: random(-3, -1),
            type: random(FRUIT_TYPES),
            size: random(60, 100),
            opacity: random(100, 180)
        });
    }
    
    for (let i = backgroundFruits.length - 1; i >= 0; i--) {
        const fruit = backgroundFruits[i];
        fruit.y += fruit.speedY;
        fruit.speedY += 0.1;
        
        if (fruit.y < -100 || fruit.y > height + 100) {
            backgroundFruits.splice(i, 1);
        }
    }
}

function drawBackgroundFruits() {
    for (const fruit of backgroundFruits) {
        push();
        tint(255, fruit.opacity);
        if (fruitImages[fruit.type]) {
            image(fruitImages[fruit.type], fruit.x - fruit.size/2, fruit.y - fruit.size/2, fruit.size, fruit.size);
        }
        pop();
    }
}

function updateHandTracking() {
    const currentTime = millis();
    
    if (hands.length > 0) {
        const hand = hands[0];
        
        if (hand.confidence < MIN_CONFIDENCE) {
            if (lastFingerPos) {
                fingerPositions = [lastFingerPos.copy()];
            }
            return;
        }
        
        const indexFinger = hand.annotations.indexFinger[3];
        const middleFinger = hand.annotations.middleFinger[3];
        
        const avgX = (indexFinger[0] + middleFinger[0]) / 2;
        const avgY = (indexFinger[1] + middleFinger[1]) / 2;

        const newX = avgX * width / video.width;
        const newY = avgY * height / video.height;

        minFingerX = Math.min(minFingerX, newX);
        maxFingerX = Math.max(maxFingerX, newX);
        
        if (lastFingerPos) {
            const distance = dist(lastFingerPos.x, lastFingerPos.y, newX, newY);
            if (distance > MAX_MOVEMENT_DISTANCE) {
                const smoothedX = lastFingerPos.x + (newX - lastFingerPos.x) * 0.2;
                const smoothedY = lastFingerPos.y + (newY - lastFingerPos.y) * 0.2;
                fingerPositions = [createVector(smoothedX, smoothedY)];
                lastFingerPos = createVector(smoothedX, smoothedY);
                return;
            }
        }
        
        if (lastFingerPos) {
            const smoothedX = lastFingerPos.x + (newX - lastFingerPos.x) * SMOOTHING_FACTOR;
            const smoothedY = lastFingerPos.y + (newY - lastFingerPos.y) * SMOOTHING_FACTOR;
            fingerPositions = [createVector(smoothedX, smoothedY)];
            lastFingerPos = createVector(smoothedX, smoothedY);
        } else {
            fingerPositions = [createVector(newX, newY)];
            lastFingerPos = createVector(newX, newY);
        }

        lastValidHandTime = currentTime;

        if (fingerPositions.length > 0) {
            sliceTrail.push({
                pos: fingerPositions[0].copy(),
                life: TRAIL_LENGTH
            });
        }
    } else {
        if (currentTime - lastValidHandTime > HAND_LOST_THRESHOLD) {
            lastFingerPos = null;
            fingerPositions = [];
        } else if (lastFingerPos) {
            fingerPositions = [lastFingerPos.copy()];
        }
    }

    sliceTrail = sliceTrail.filter(slice => --slice.life > 0);
}

function updateGameLogic() {
    const currentTime = millis();
    
    if (peachActive) {
        const elapsedPeachTime = (currentTime - peachStartTime) / 1000;
        peachTimer = Math.max(0, 5 - elapsedPeachTime);

        if (peachTimer <= 0) {
            const bonusScore = calculatePeachBonus(peachSliceCount);
            score += bonusScore;
            
            sliceCountDisplay = {
                text: `+${bonusScore}分！`,
                alpha: 255,
                y: height / 2
            };
            
            peachActive = false;
            updateStats();
            gameOver();
            return;
        }
    }
    
    if (sliceCountDisplay.alpha > 0) {
        sliceCountDisplay.alpha -= 5;
        sliceCountDisplay.y -= 1;
    }
    
    if (!peachActive) {
        let fruitInterval = FRUIT_INTERVAL;
        let maxObjects = MAX_FRUITS;
        
        if (level === 1) {
            fruitInterval *= 1.5;
            maxObjects = 4;
        } else if (level === 2) {
            fruitInterval *= 1.0;
            maxObjects = 6;
        } else if (level === 3) {
            fruitInterval *= 0.7;
            maxObjects = 8;
        } else if (level === 4) {
            fruitInterval *= 0.4;
            maxObjects = 10;
        }
        
        if (currentTime - lastFruitTime > fruitInterval) {
            if (fruits.length + bombs.length + durians.length < maxObjects) {
                generateObject();
                lastFruitTime = currentTime;
            }
        }
        
        updateFruits();
        updateBombs();
        updateDurians();
    }
    
    checkCollisions();
    if (comboCount > 0 && currentTime - lastSliceTime > 2000) {
        comboCount = 0;
    }
}

function generateObject() {
    const rand = random(1);
    
    if (level === 1) {
        generateFruit();
    } else if (level === 2) {
        if (rand < 0.9) {
            generateFruit();
        } else {
            generateDurian();
        }
    } else if (level === 3) {
        if (rand < 0.8) {
            generateFruit();
        } else if (rand < 0.9) {
            generateDurian();
        } else {
            generateBomb();
        }
    } else {
        if (rand < 0.7) {
            generateFruit();
        } else if (rand < 0.85) {
            generateDurian();
        } else {
            generateBomb();
        }
    }
}

function generateFruit() {
    const type = random(FRUIT_TYPES);
    console.log('生成水果:', type, '圖片是否存在:', !!fruitImages[type]);
    
    const targetPeakY = height * 0.3;
    
    const x = random(width * 0.1, width * 0.9);
    const y = height + 100;
    
    const gravity = 0.4;
    const heightDiff = y - targetPeakY;
    const initialSpeedY = -Math.sqrt(2 * gravity * heightDiff);
    
    const timeToPeak = -initialSpeedY / gravity;
    
    let speedX;
    const screenCenter = width / 2;
    const distanceFromCenter = x - screenCenter;
    const maxSpeedX = 4;
    
    if (Math.abs(distanceFromCenter) > width * 0.2) {
        speedX = -Math.sign(distanceFromCenter) * (maxSpeedX * Math.abs(distanceFromCenter) / (width/2));
    } else {
        speedX = random(-2, 2);
    }
    
    const rotationSpeed = random(-0.1, 0.1);
    const size = random(80, 120);
    
    fruits.push({
        type,
        x,
        y,
        speedX,
        speedY: initialSpeedY,
        rotation: 0,
        rotationSpeed,
        size,
        sliced: false,
        gravity: gravity
    });
}

function generateBomb() {
    const targetPeakY = height * 0.3;
    const x = random(width * 0.1, width * 0.9);
    const y = height + 50;
    const gravity = 0.2;
    const heightDiff = y - targetPeakY;
    const initialSpeedY = -Math.sqrt(2 * gravity * heightDiff);
    
    const screenCenter = width / 2;
    const distanceFromCenter = x - screenCenter;
    const maxSpeedX = 3;
    
    let speedX;
    if (Math.abs(distanceFromCenter) > width * 0.2) {
        speedX = -Math.sign(distanceFromCenter) * (maxSpeedX * Math.abs(distanceFromCenter) / (width/2));
    } else {
        speedX = random(-1.5, 1.5);
    }
    
    const size = 80;
    
    bombs.push({
        x,
        y,
        speedX,
        speedY: initialSpeedY,
        size,
        gravity: gravity
    });
}

function generateDurian() {
    const targetPeakY = height * 0.3;
    const x = random(width * 0.1, width * 0.9);
    const y = height + 50;
    const gravity = 0.2;
    const heightDiff = y - targetPeakY;
    const initialSpeedY = -Math.sqrt(2 * gravity * heightDiff);
    
    const screenCenter = width / 2;
    const distanceFromCenter = x - screenCenter;
    const maxSpeedX = 3;
    
    let speedX;
    if (Math.abs(distanceFromCenter) > width * 0.2) {
        speedX = -Math.sign(distanceFromCenter) * (maxSpeedX * Math.abs(distanceFromCenter) / (width/2));
    } else {
        speedX = random(-1.5, 1.5);
    }
    
    const rotationSpeed = random(-0.05, 0.05);
    const size = 90;
    
    durians.push({
        x,
        y,
        speedX,
        speedY: initialSpeedY,
        rotation: 0,
        rotationSpeed,
        size,
        gravity: gravity
    });
}

function generatePeach() {
    if (peachActive) return;
    
    peachActive = true;
    peachSliceCount = 0;
    peachTimer = 5;
    peachStartTime = millis();
    
    peachPosition = {
        x: width / 2,
        y: height * 0.25,
        size: 120,
        rotation: 0,
        speedX: 0,
        speedY: 0,
        gravity: 0,
        reachedTop: true,
        falling: false
    };
}

function updateFruits() {
    for (let i = fruits.length - 1; i >= 0; i--) {
        const fruit = fruits[i];
        
        fruit.speedY += fruit.gravity;
        
        fruit.x += fruit.speedX;
        fruit.y += fruit.speedY;
        fruit.rotation += fruit.rotationSpeed;
        
        if (fruit.y > height + 100) {
            fruits.splice(i, 1);
        }
    }
}

function updateBombs() {
    for (let i = bombs.length - 1; i >= 0; i--) {
        const bomb = bombs[i];
        
        bomb.speedY += bomb.gravity;
        bomb.x += bomb.speedX;
        bomb.y += bomb.speedY;
        
        if (bomb.y > height + 100) {
            bombs.splice(i, 1);
        }
    }
}

function updateDurians() {
    for (let i = durians.length - 1; i >= 0; i--) {
        const durian = durians[i];
        
        durian.speedY += durian.gravity;
        durian.x += durian.speedX;
        durian.y += durian.speedY;
        durian.rotation += durian.rotationSpeed;
        
        if (durian.y > height + 100) {
            durians.splice(i, 1);
        }
    }
}

function checkCollisions() {
    if (fingerPositions.length === 0 || sliceTrail.length < 2) return;
    
    const currentFingerPos = fingerPositions[0];
    const prevSlicePos = sliceTrail.length >= 2 ? sliceTrail[sliceTrail.length - 2].pos : null;
    
    if (!prevSlicePos) return;
    
    if (peachActive) {
        const isIntersecting = lineCircleIntersect(prevSlicePos, currentFingerPos, 
            createVector(peachPosition.x, peachPosition.y), peachPosition.size/2);
            
        if (isIntersecting && !isSlicingPeach) {
            peachSliceCount++;
            isSlicingPeach = true;
            
            sliceCountDisplay = {
                text: peachSliceCount + '次',
                alpha: 255,
                y: peachPosition.y - 50
            };
        } else if (!isIntersecting) {
            isSlicingPeach = false;
        }
    }
    
    for (let i = fruits.length - 1; i >= 0; i--) {
        const fruit = fruits[i];
        if (!fruit.sliced && lineCircleIntersect(prevSlicePos, currentFingerPos, createVector(fruit.x, fruit.y), fruit.size / 2)) {
            fruit.sliced = true;
            fruit.speedX *= 0.5;
            fruit.speedY *= 0.5;
            fruit.rotationSpeed *= 2;
            
            score += 10;
            
            comboCount++;
            if (comboCount >= 3) {
                score += comboCount * 2;
                showCombo();
            }
            
            lastSliceTime = millis();
            updateStats();
        }
    }
    
    for (let i = bombs.length - 1; i >= 0; i--) {
        const bomb = bombs[i];
        if (lineCircleIntersect(prevSlicePos, currentFingerPos, createVector(bomb.x, bomb.y), bomb.size / 2)) {
            isHurt = true;
            hurtTimer = millis();
            showHands = true;
            handShowTimer = millis();
            
            lives = 0;
            updateStats();
            gameOver();
            return;
        }
    }
    
    for (let i = durians.length - 1; i >= 0; i--) {
        const durian = durians[i];
        if (lineCircleIntersect(prevSlicePos, currentFingerPos, createVector(durian.x, durian.y), durian.size / 2)) {
            isHurt = true;
            hurtTimer = millis();
            showHands = true;
            handShowTimer = millis();
            
            lives--;
            durians.splice(i, 1);
            updateStats();
            
            if (lives <= 0) {
                gameOver();
                return;
            }
        }
    }
}

function drawObjects() {
    if (peachActive) {
        push();
        translate(peachPosition.x, peachPosition.y);
        rotate(peachPosition.rotation);
        
        drawingContext.shadowBlur = 20;
        drawingContext.shadowColor = 'rgba(255, 192, 203, 0.7)';
        
        if (peachImage) {
            imageMode(CENTER);
            image(peachImage, 0, 0, peachPosition.size, peachPosition.size);
        } else {
            fill(255, 182, 193);
            ellipse(0, 0, peachPosition.size, peachPosition.size);
        }
        
        textAlign(CENTER);
        textSize(24);
        fill(255);
        text(Math.ceil(peachTimer) + '秒', 0, -peachPosition.size/2 - 20);
        
        textSize(32);
        fill(255, 215, 0);
        text(peachSliceCount + '次', 0, peachPosition.size/2 + 30);
        
        pop();
        
        if (sliceCountDisplay.alpha > 0) {
            push();
            textAlign(CENTER);
            textSize(40);
            fill(255, 215, 0, sliceCountDisplay.alpha);
            text(sliceCountDisplay.text, width/2, sliceCountDisplay.y);
            pop();
        }
    }
    
    for (const fruit of fruits) {
        push();
        translate(fruit.x, fruit.y);
        rotate(fruit.rotation);
        
        if (fruit.sliced) {
            if (fruitSlicedImages[fruit.type]) {
                drawingContext.shadowBlur = 20;
                drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)';
                imageMode(CENTER);
                image(fruitSlicedImages[fruit.type], 0, 0, fruit.size, fruit.size);
                drawingContext.shadowBlur = 0;
            } else {
                console.error('切開的水果圖片未載入:', fruit.type);
                fill(255, 100, 100, 200);
                ellipse(0, 0, fruit.size, fruit.size);
            }
        } else {
            if (fruitImages[fruit.type]) {
                drawingContext.shadowBlur = 20;
                drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)';
                imageMode(CENTER);
                image(fruitImages[fruit.type], 0, 0, fruit.size, fruit.size);
                drawingContext.shadowBlur = 0;
            } else {
                console.error('水果圖片未載入:', fruit.type);
                fill(255, 0, 0);
                ellipse(0, 0, fruit.size, fruit.size);
            }
        }
        pop();
    }
    
    for (const bomb of bombs) {
        push();
        if (bombImage) {
            drawingContext.shadowBlur = 15;
            drawingContext.shadowColor = 'rgba(255, 0, 0, 0.5)';
            image(bombImage, bomb.x - bomb.size/2, bomb.y - bomb.size/2, bomb.size, bomb.size);
            drawingContext.shadowBlur = 0;
        } else {
            fill(0);
            ellipse(bomb.x, bomb.y, bomb.size, bomb.size);
        }
        pop();
    }
    
    for (const durian of durians) {
        push();
        translate(durian.x, durian.y);
        rotate(durian.rotation);
        if (durianImage) {
            drawingContext.shadowBlur = 15;
            drawingContext.shadowColor = 'rgba(255, 255, 0, 0.5)';
            image(durianImage, -durian.size/2, -durian.size/2, durian.size, durian.size);
            drawingContext.shadowBlur = 0;
        } else {
            fill(100);
            ellipse(0, 0, durian.size, durian.size);
        }
        pop();
    }
}

function drawHandTracking() {
    if (fingerPositions.length > 0) {
        push();
        fill(255, 255, 255, 200);
        noStroke();
        ellipse(fingerPositions[0].x, fingerPositions[0].y, 40, 40);
        fill(255, 100, 100, 200);
        ellipse(fingerPositions[0].x, fingerPositions[0].y, 20, 20);
        pop();
    }

    if (sliceTrail.length > 1) {
        push();
        noFill();
        for (let i = 0; i < sliceTrail.length - 1; i++) {
            const slice1 = sliceTrail[i];
            const slice2 = sliceTrail[i + 1];
            const alpha = map(slice1.life, 0, TRAIL_LENGTH, 0, 255);
            const thickness = map(slice1.life, 0, TRAIL_LENGTH, 2, 8);
            
            const hue = map(i, 0, sliceTrail.length, 0, 60);
            stroke(hue, 100, 100, alpha);
            strokeWeight(thickness);
            line(slice1.pos.x, slice1.pos.y, slice2.pos.x, slice2.pos.y);
        }
        pop();
    }
}

function lineCircleIntersect(lineStart, lineEnd, circleCenter, radius) {
    const d = dist(lineStart.x, lineStart.y, lineEnd.x, lineEnd.y);
    if (d === 0) return false;
    
    const expandedRadius = radius * 1.2;
    
    const dot = (((circleCenter.x - lineStart.x) * (lineEnd.x - lineStart.x)) + 
                 ((circleCenter.y - lineStart.y) * (lineEnd.y - lineStart.y))) / (d * d);
    
    const closestX = lineStart.x + (dot * (lineEnd.x - lineStart.x));
    const closestY = lineStart.y + (dot * (lineEnd.y - lineStart.y));
    
    if (dot < -0.1 || dot > 1.1) {
        const distToStart = dist(lineStart.x, lineStart.y, circleCenter.x, circleCenter.y);
        const distToEnd = dist(lineEnd.x, lineEnd.y, circleCenter.x, circleCenter.y);
        return distToStart <= expandedRadius || distToEnd <= expandedRadius;
    }
    
    const distance = dist(closestX, closestY, circleCenter.x, circleCenter.y);
    return distance <= expandedRadius;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    console.log('視窗調整後的畫布大小:', width, height);
}

function handleKeyPress(event) {
    console.log('按下按鍵:', event.key);
    if (event.key === 'Escape') {
        console.log('遊戲狀態:', gameState);
        if (gameState === 'playing') {
            console.log('觸發暫停');
            togglePause();
        }
    }
}

function togglePause() {
    isPaused = !isPaused;
    const pauseMenu = document.getElementById('pauseMenu');
    console.log('切換暫停狀態:', isPaused);
    
    if (isPaused) {
        console.log('顯示暫停選單');
        pauseMenu.classList.remove('hidden');
        noLoop();
    } else {
        console.log('隱藏暫停選單');
        pauseMenu.classList.add('hidden');
        loop();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('keydown', handleKeyPress);
    console.log('已添加鍵盤事件監聽');

    const ruleBtn = document.getElementById('ruleButton');
    const ruleModal = document.getElementById('ruleModal');
    const closeRule = document.getElementById('closeRule');
    if(ruleBtn && ruleModal && closeRule) {
        ruleBtn.onclick = () => ruleModal.classList.remove('hidden');
        closeRule.onclick = () => ruleModal.classList.add('hidden');
    }

    const startBtn = document.getElementById('startButton');
    if(startBtn) {
        startBtn.onclick = () => {
            document.getElementById('startScreen').classList.add('hidden');
            document.getElementById('loadingScreen').classList.remove('hidden');
            handpose = ml5.handpose(video, {
                flipHorizontal: true,
                maxHands: 1,
                detectionConfidence: 0.5,
                maxNumHands: 1
            }, modelReady);
        };
    }

    function updateLevelButtons() {
        for (let i = 1; i <= 4; i++) {
            const btn = document.getElementById('levelBtn' + i);
            if (btn) {
                let levelName = '';
                switch (i) {
                    case 1: levelName = '新手教學'; break;
                    case 2: levelName = '榴槤挑戰'; break;
                    case 3: levelName = '炸彈危機'; break;
                    case 4: levelName = '終極挑戰'; break;
                }
                
                const highScore = levelScores[i - 1];
                const scoreText = highScore > 0 ? ` (最高分：${highScore})` : '';
                
                if (i === 1 || (i <= currentLevel && levelScores[i - 2] >= LEVEL_REQUIREMENTS[i - 2])) {
                    btn.innerHTML = `第${i}關：${levelName}${scoreText}`;
                    btn.classList.remove('locked');
                    btn.onclick = () => {
                        level = i;
                        score = 0;
                        document.getElementById('levelSelect').classList.add('hidden');
                        startGame();
                    };
                } else {
                    btn.innerHTML = `🔒第${i}關：${levelName}`;
                    btn.classList.add('locked');
                    btn.onclick = null;
                }
            }
        }
    }
    
    updateLevelButtons();

    const restartBtn = document.getElementById('restartButton');
    if(restartBtn) {
        restartBtn.onclick = restartGame;
    }

    const backToLevelBtn = document.getElementById('backToLevelSelect');
    if(backToLevelBtn) {
        backToLevelBtn.onclick = () => {
            document.getElementById('gameOverScreen').classList.add('hidden');
            document.getElementById('levelSelect').classList.remove('hidden');
            updateLevelButtons();
        };
    }

    const exitLevelBtn = document.getElementById('exitLevelSelect');
    if(exitLevelBtn) {
        exitLevelBtn.onclick = () => {
            document.getElementById('levelSelect').classList.add('hidden');
            document.getElementById('startScreen').classList.remove('hidden');
        };
    }

    const nextLevelBtn = document.getElementById('nextLevelButton');
    if(nextLevelBtn) {
        nextLevelBtn.onclick = () => {
            currentLevel++;
            document.getElementById('gameOverScreen').classList.add('hidden');
            document.getElementById('loadingScreen').classList.remove('hidden');
            handpose = ml5.handpose(video, {
                flipHorizontal: true,
                maxHands: 1,
                detectionConfidence: 0.5,
                maxNumHands: 1
            }, () => {
                console.log('手部偵測模型重新載入完成');
                document.getElementById('loadingScreen').classList.add('hidden');
                startGame();
            });
        };
    }

    const resumeBtn = document.getElementById('resumeButton');
    const restartFromPauseBtn = document.getElementById('restartFromPause');
    const exitToMenuBtn = document.getElementById('exitToMenu');

    if (resumeBtn) {
        resumeBtn.onclick = () => {
            togglePause();
        };
    }

    if (restartFromPauseBtn) {
        restartFromPauseBtn.onclick = () => {
            isPaused = false;
            loop();
            document.getElementById('pauseMenu').classList.add('hidden');
            restartGame();
        };
    }

    if (exitToMenuBtn) {
        exitToMenuBtn.onclick = () => {
            isPaused = false;
            loop();
            document.getElementById('pauseMenu').classList.add('hidden');
            document.getElementById('levelSelect').classList.remove('hidden');
            document.getElementById('gameStats').classList.add('hidden');
            document.getElementById('comboIndicator').classList.add('hidden');
            document.getElementById('levelIndicator').classList.add('hidden');
            gameState = 'start';
            score = 0;
            lives = 3;
            comboCount = 0;
            fruits = [];
            bombs = [];
            durians = [];
            bossFruit = null;
            bossActive = false;
            level = 1;
            updateLevelButtons();
        };
    }
});

function calculatePeachBonus(sliceCount) {
    let baseScore = sliceCount * 5;
    
    if (sliceCount >= 30) {
        baseScore += 200;
    } else if (sliceCount >= 20) {
        baseScore += 100;
    } else if (sliceCount >= 10) {
        baseScore += 50;
    }
    
    return baseScore;
}

function drawHurtEffect() {
    if (isHurt) {
        const alpha = map(millis() - hurtTimer, 0, hurtDuration, 255, 0);
        if (alpha > 0) {
            push();
            stroke(255, 0, 0, alpha);
            strokeWeight(20);
            noFill();
            rect(0, 0, width, height);
            pop();
        } else {
            isHurt = false;
        }
    }
}

function drawHands() {
    if (showHands) {
        const alpha = map(millis() - handShowTimer, 0, handShowDuration, 255, 0);
        if (alpha > 0) {
            push();
            tint(255, alpha);
            if (leftHandImage) {
                image(leftHandImage, width * 0.1, height * 0.3, 200, 200);
            }
            if (rightHandImage) {
                image(rightHandImage, width * 0.7, height * 0.3, 200, 200);
            }
            pop();
        } else {
            showHands = false;
        }
    }
}
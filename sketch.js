// 遊戲狀態
let gameState = 'start'; // 'start', 'playing', 'gameover'
let score = 0;
let lives = 3;
let level = 1;
let comboCount = 0;
let lastSliceTime = 0;
let currentLevel = 1; // 新增：當前關卡
const LEVEL_REQUIREMENTS = [100, 200, 300, 400]; // 新增：每關所需分數

// P5.js 變數
let video;
let handpose;
let hands = [];
let fruits = [];
let bombs = [];
let durians = [];
let bossActive = false;
let bossFruit = null;

// 手部追踪變數
let fingerPositions = [];
let sliceTrail = [];
let lastFingerPos = null;
let lastValidHandTime = 0; // 新增：記錄最後一次有效手部偵測的時間
const TRAIL_LENGTH = 30;
const SMOOTHING_FACTOR = 0.3;
const HAND_LOST_THRESHOLD = 500; // 新增：手部失去偵測的閾值（毫秒）
const MAX_MOVEMENT_DISTANCE = 100; // 新增：最大允許移動距離

// 遊戲設定
const MAX_FRUITS = 5;
const FRUIT_INTERVAL = 1000; // 水果生成間隔（毫秒）
let lastFruitTime = 0;
const BOSS_INTERVAL = 30000; // Boss 出現間隔（毫秒）
let lastBossTime = 0;

// 圖片資源
let fruitImages = [];
let fruitSlicedImages = []; // 新增：切開後的水果圖片
let bombImage;
let durianImage;
let bossImage;
let backgroundImage;
let sliceSound;
let bombSound;
let durianSound;

// 水果類型
const FRUIT_TYPES = ['apple', 'banana', 'watermelon', 'strawberry', 'tomato', 'guava', 'pitaya', 'lemon'];

// 新增全域變數
let gameTimer = 20; // 秒
let gameStartTime = 0;

// 預加載圖片
function preload() {
    try {
        // 背景圖片
        backgroundImage = loadImage('./Assets/background.jpg', 
            () => console.log('背景圖片載入成功'),
            () => console.error('背景圖片載入失敗')
        );
        
        // 水果圖片
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
        
        fruitImages['lemon'] = loadImage('./Assets/lemon1.png', 
            () => console.log('檸檬圖片載入成功'),
            () => console.error('檸檬圖片載入失敗')
        );

        // 水果圖片（切開後）
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

        // 障礙物圖片
        bombImage = loadImage('./Assets/boom.png', 
            () => console.log('炸彈圖片載入成功'),
            () => console.error('炸彈圖片載入失敗')
        );
        durianImage = loadImage('./Assets/durian1.png', 
            () => console.log('榴槤圖片載入成功'),
            () => console.error('榴槤圖片載入失敗')
        );
        bossImage = loadImage('./Assets/boss.png', 
            () => console.log('Boss圖片載入成功'),
            () => console.error('Boss圖片載入失敗')
        );
    } catch (error) {
        console.error('圖片載入過程中發生錯誤:', error);
    }
}

function setup() {
    // 創建畫布
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('gameContainer');
    
    // 設置視訊
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();
}

function modelReady() {
    console.log('Handpose model ready!');
    
    // 在模型載入完成後設置手部追踪事件
    handpose.on('predict', results => {
        hands = results;
    });
    
    // 模型載入完成後，顯示關卡選擇畫面
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('levelSelect').classList.remove('hidden');
}

function startGame() {
    gameState = 'playing';
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
    currentLevel = 1; // 重置當前關卡
    document.getElementById('gameStats').classList.remove('hidden');
    document.getElementById('comboIndicator').classList.add('hidden');
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
    document.getElementById('finalLevel').textContent = currentLevel;

    // 檢查是否達到下一關的條件
    const nextLevelButton = document.getElementById('nextLevelButton');
    if (currentLevel < 4 && score >= LEVEL_REQUIREMENTS[currentLevel - 1]) {
        nextLevelButton.classList.remove('hidden');
    } else {
        nextLevelButton.classList.add('hidden');
    }
}

function updateStats() {
    const scoreSpan = document.getElementById('score');
    const livesSpan = document.getElementById('lives');
    // 顯示當前分數和下一關所需分數
    const nextLevelScore = currentLevel < 4 ? LEVEL_REQUIREMENTS[currentLevel - 1] : '完成';
    scoreSpan.textContent = `${score} / ${nextLevelScore}`;
    livesSpan.textContent = lives;
}

function showCombo() {
    const comboIndicator = document.getElementById('comboIndicator');
    document.getElementById('comboCount').textContent = comboCount;
    comboIndicator.classList.remove('hidden');
    comboIndicator.style.opacity = '1';
    
    setTimeout(() => {
        comboIndicator.style.opacity = '0';
        setTimeout(() => {
            comboIndicator.classList.add('hidden');
        }, 500);
    }, 1000);
}

function draw() {
    // 清除背景
    clear();
    
    // 繪製背景
    if (backgroundImage) {
        image(backgroundImage, 0, 0, width, height);
    } else {
        background(100);
    }
    
    if (gameState === 'playing') {
        // 倒數計時
        let elapsed = (millis() - gameStartTime) / 1000;
        let timeLeft = Math.max(0, 20 - Math.floor(elapsed));
        gameTimer = timeLeft;
        // 顯示剩餘時間
        fill('#FFD700');
        textAlign(RIGHT, TOP);
        textSize(32);
        text('剩餘時間: ' + gameTimer + ' 秒', width - 30, 30);
        // 時間到自動結束
        if (gameTimer <= 0) {
            gameOver();
            return;
        }
        updateHandTracking();
        updateGameLogic();
        drawObjects();
        drawHandTracking();
        if (hands.length === 0) {
            fill(255, 255, 0, 220);
            textAlign(CENTER, CENTER);
            textSize(36);
            text('請將手放在鏡頭前', width/2, height/2);
        }
    }
}

function updateHandTracking() {
    const currentTime = millis();
    
    if (hands.length > 0) {
        const hand = hands[0];
        const indexFinger = hand.annotations.indexFinger[3];
        const newX = width - (indexFinger[0] * width / video.width);
        const newY = indexFinger[1] * height / video.height;
        
        // 檢查移動距離是否合理
        if (lastFingerPos) {
            const distance = dist(lastFingerPos.x, lastFingerPos.y, newX, newY);
            if (distance > MAX_MOVEMENT_DISTANCE) {
                // 如果移動距離過大，可能是錯誤偵測，保持上一次的位置
                return;
            }
        }
        
        // 平滑處理
        if (lastFingerPos) {
            const smoothedX = lastFingerPos.x + (newX - lastFingerPos.x) * SMOOTHING_FACTOR;
            const smoothedY = lastFingerPos.y + (newY - lastFingerPos.y) * SMOOTHING_FACTOR;
            fingerPositions = [createVector(smoothedX, smoothedY)];
            lastFingerPos = createVector(smoothedX, smoothedY);
        } else {
            fingerPositions = [createVector(newX, newY)];
            lastFingerPos = createVector(newX, newY);
        }

        // 更新最後有效手部偵測時間
        lastValidHandTime = currentTime;

        // 添加到斬擊軌跡
        if (fingerPositions.length > 0) {
            sliceTrail.push({
                pos: fingerPositions[0].copy(),
                life: TRAIL_LENGTH
            });
        }
    } else {
        // 檢查是否超過手部失去偵測的閾值
        if (currentTime - lastValidHandTime > HAND_LOST_THRESHOLD) {
            // 如果超過閾值，清除手指位置
            lastFingerPos = null;
            fingerPositions = [];
        }
    }

    // 移除過期的軌跡
    sliceTrail = sliceTrail.filter(slice => --slice.life > 0);
}

function updateGameLogic() {
    const currentTime = millis();
    // 根據當前關卡調整生成間隔與最大物件數與速度
    let fruitInterval = FRUIT_INTERVAL;
    let maxObjects = MAX_FRUITS;
    if (currentLevel === 1) {
        fruitInterval *= 1.2; // Lv1 掉落速度最慢
        maxObjects = 4;
    } else if (currentLevel === 2) {
        fruitInterval *= 0.8;
        maxObjects = 6;
    } else if (currentLevel === 3) {
        fruitInterval *= 0.6;
        maxObjects = 8;
    } else if (currentLevel === 4) {
        fruitInterval *= 0.4;
        maxObjects = 10;
    }
    // 隨機生成水果/障礙物
    if (currentTime - lastFruitTime > fruitInterval) {
        if (fruits.length + bombs.length + durians.length < maxObjects) {
            generateObject();
            lastFruitTime = currentTime;
        }
    }
    // Boss 出現邏輯
    if (currentLevel >= 4 && !bossActive && currentTime - lastBossTime > BOSS_INTERVAL) {
        generateBoss();
        lastBossTime = currentTime;
    }
    // 更新所有物件
    updateFruits();
    updateBombs();
    updateDurians();
    if (bossActive && bossFruit) {
        updateBoss();
    }
    // 檢查碰撞
    checkCollisions();
    // 檢查是否達到下一關分數要求
    if (currentLevel < 4 && score >= LEVEL_REQUIREMENTS[currentLevel - 1]) {
        currentLevel++;
        updateStats();
    }
    // Combo 系統
    if (comboCount > 0 && currentTime - lastSliceTime > 2000) {
        comboCount = 0;
    }
}

function generateObject() {
    const rand = random(1);
    if (currentLevel === 1) {
        // Lv1：只產生水果，無障礙物
        generateFruit();
    } else if (currentLevel === 2) {
        // Lv2：80% 水果，20% 榴槤
        if (rand < 0.8) {
            generateFruit();
        } else {
            generateDurian();
        }
    } else if (currentLevel === 3) {
        // Lv3：70% 水果，15% 榴槤，15% 炸彈
        if (rand < 0.7) {
            generateFruit();
        } else if (rand < 0.85) {
            generateDurian();
        } else {
            generateBomb();
        }
    } else {
        // Lv4：60% 水果，20% 榴槤，20% 炸彈
        if (rand < 0.6) {
            generateFruit();
        } else if (rand < 0.8) {
            generateDurian();
        } else {
            generateBomb();
        }
    }
}

function generateFruit() {
    const type = random(FRUIT_TYPES);
    console.log('生成水果:', type, '圖片是否存在:', !!fruitImages[type]);
    const x = random(width * 0.1, width * 0.9); // 避免水果生成在太靠邊的位置
    const y = height + 50;
    const speedX = random(-3, 3);
    const speedY = random(-18, -15); // 增加向上的速度
    const rotationSpeed = random(-0.1, 0.1);
    const size = random(80, 120); // 增加水果大小
    
    fruits.push({
        type,
        x,
        y,
        speedX,
        speedY,
        rotation: 0,
        rotationSpeed,
        size,
        sliced: false
    });
}

function generateBomb() {
    const x = random(width * 0.1, width * 0.9);
    const y = height + 50;
    const speedX = random(-2, 2);
    const speedY = random(-16, -13); // 增加向上的速度
    const size = 80; // 增加炸彈大小
    
    bombs.push({
        x,
        y,
        speedX,
        speedY,
        size
    });
}

function generateDurian() {
    const x = random(width * 0.1, width * 0.9);
    const y = height + 50;
    const speedX = random(-2, 2);
    const speedY = random(-16, -13); // 增加向上的速度
    const rotationSpeed = random(-0.05, 0.05);
    const size = 90; // 增加榴槤大小
    
    durians.push({
        x,
        y,
        speedX,
        speedY,
        rotation: 0,
        rotationSpeed,
        size
    });
}

function generateBoss() {
    bossActive = true;
    const x = width / 2;
    const y = height + 100;
    const size = 150;
    
    bossFruit = {
        x,
        y,
        speedX: random(-1, 1),
        speedY: -5,
        rotation: 0,
        rotationSpeed: 0.02,
        size,
        health: 5,
        lastHitTime: 0
    };
}

function updateFruits() {
    for (let i = fruits.length - 1; i >= 0; i--) {
        const fruit = fruits[i];
        // 更新位置
        fruit.speedY += 0.2; // 重力
        fruit.x += fruit.speedX;
        fruit.y += fruit.speedY;
        fruit.rotation += fruit.rotationSpeed;
        // 如果水果已經離開畫面，直接移除，不扣分
        if (fruit.y > height + 100) {
            fruits.splice(i, 1);
        }
        // 如果水果已被切割且離開畫面，移除它
        if (fruit.sliced && fruit.y > height + 100) {
            fruits.splice(i, 1);
        }
    }
}

function updateBombs() {
    for (let i = bombs.length - 1; i >= 0; i--) {
        const bomb = bombs[i];
        
        // 更新位置
        bomb.speedY += 0.2; // 重力
        bomb.x += bomb.speedX;
        bomb.y += bomb.speedY;
        
        // 如果炸彈已經離開畫面，移除它
        if (bomb.y > height + 100) {
            bombs.splice(i, 1);
        }
    }
}

function updateDurians() {
    for (let i = durians.length - 1; i >= 0; i--) {
        const durian = durians[i];
        
        // 更新位置
        durian.speedY += 0.2; // 重力
        durian.x += durian.speedX;
        durian.y += durian.speedY;
        durian.rotation += durian.rotationSpeed;
        
        // 如果榴槤已經離開畫面，移除它
        if (durian.y > height + 100) {
            durians.splice(i, 1);
        }
    }
}

function updateBoss() {
    if (!bossFruit) return;
    
    // 更新位置
    bossFruit.speedY += 0.1; // 較小的重力
    bossFruit.x += bossFruit.speedX;
    bossFruit.y += bossFruit.speedY;
    bossFruit.rotation += bossFruit.rotationSpeed;
    
    // 如果 Boss 水果已經離開畫面且未被擊敗，移除它
    if (bossFruit.y > height + 150) {
        bossFruit = null;
        bossActive = false;
    }
}

function checkCollisions() {
    if (fingerPositions.length === 0 || sliceTrail.length < 2) return;
    
    const currentFingerPos = fingerPositions[0];
    const prevSlicePos = sliceTrail.length >= 2 ? sliceTrail[sliceTrail.length - 2].pos : null;
    
    if (!prevSlicePos) return;
    
    // 檢查水果碰撞
    for (let i = fruits.length - 1; i >= 0; i--) {
        const fruit = fruits[i];
        if (!fruit.sliced && lineCircleIntersect(prevSlicePos, currentFingerPos, createVector(fruit.x, fruit.y), fruit.size / 2)) {
            fruit.sliced = true;
            fruit.speedX *= 0.5;
            fruit.speedY *= 0.5;
            fruit.rotationSpeed *= 2;
            
            // 增加分數
            score += 10;
            
            // 更新 Combo
            comboCount++;
            if (comboCount >= 3) {
                score += comboCount * 2; // Combo 獎勵
                showCombo();
            }
            
            lastSliceTime = millis();
            updateStats();
        }
    }
    
    // 檢查炸彈碰撞
    for (let i = bombs.length - 1; i >= 0; i--) {
        const bomb = bombs[i];
        if (lineCircleIntersect(prevSlicePos, currentFingerPos, createVector(bomb.x, bomb.y), bomb.size / 2)) {
            // 炸彈觸發遊戲結束
            lives = 0;
            updateStats();
            gameOver();
            return;
        }
    }
    
    // 檢查榴槤碰撞
    for (let i = durians.length - 1; i >= 0; i--) {
        const durian = durians[i];
        if (lineCircleIntersect(prevSlicePos, currentFingerPos, createVector(durian.x, durian.y), durian.size / 2)) {
            // 榴槤減少生命值
            lives--;
            durians.splice(i, 1);
            updateStats();
            
            if (lives <= 0) {
                gameOver();
                return;
            }
        }
    }
    
    // 檢查 Boss 碰撞
    if (bossActive && bossFruit) {
        if (lineCircleIntersect(prevSlicePos, currentFingerPos, createVector(bossFruit.x, bossFruit.y), bossFruit.size / 2)) {
            const currentTime = millis();
            // 限制 Boss 受傷頻率
            if (currentTime - bossFruit.lastHitTime > 500) {
                bossFruit.health--;
                bossFruit.lastHitTime = currentTime;
                
                if (bossFruit.health <= 0) {
                    // Boss 被擊敗
                    score += 100; // Boss 獎勵
                    updateStats();
                    bossActive = false;
                    bossFruit = null;
                }
            }
        }
    }
}

function drawObjects() {
    // 繪製所有水果
    for (const fruit of fruits) {
        push();
        translate(fruit.x, fruit.y);
        rotate(fruit.rotation);
        
        if (fruit.sliced) {
            // 使用切開後的水果圖片
            if (fruitSlicedImages[fruit.type]) {
                // 添加發光效果
                drawingContext.shadowBlur = 20;
                drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)';
                image(fruitSlicedImages[fruit.type], -fruit.size/2, -fruit.size/2, fruit.size, fruit.size);
                drawingContext.shadowBlur = 0;
            } else {
                console.error('切開的水果圖片未載入:', fruit.type);
                fill(255, 100, 100, 200);
                ellipse(0, 0, fruit.size, fruit.size);
            }
        } else {
            // 使用未切開的水果圖片
            if (fruitImages[fruit.type]) {
                // 添加發光效果
                drawingContext.shadowBlur = 20;
                drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)';
                image(fruitImages[fruit.type], -fruit.size/2, -fruit.size/2, fruit.size, fruit.size);
                drawingContext.shadowBlur = 0;
            } else {
                console.error('水果圖片未載入:', fruit.type);
                fill(255, 0, 0);
                ellipse(0, 0, fruit.size, fruit.size);
            }
        }
        pop();
    }
    
    // 繪製炸彈
    for (const bomb of bombs) {
        push();
        if (bombImage) {
            // 添加發光效果
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
    
    // 繪製榴槤
    for (const durian of durians) {
        push();
        translate(durian.x, durian.y);
        rotate(durian.rotation);
        if (durianImage) {
            // 添加發光效果
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
    
    // 繪製 Boss
    if (bossActive && bossFruit) {
        push();
        translate(bossFruit.x, bossFruit.y);
        rotate(bossFruit.rotation);
        
        // 繪製 Boss 生命條
        fill(255, 0, 0);
        rect(-bossFruit.size/2, -bossFruit.size/2 - 20, bossFruit.size, 10);
        fill(0, 255, 0);
        rect(-bossFruit.size/2, -bossFruit.size/2 - 20, bossFruit.size * (bossFruit.health / 5), 10);
        
        if (bossImage) {
            // 添加發光效果
            drawingContext.shadowBlur = 25;
            drawingContext.shadowColor = 'rgba(255, 0, 255, 0.7)';
            image(bossImage, -bossFruit.size/2, -bossFruit.size/2, bossFruit.size, bossFruit.size);
            drawingContext.shadowBlur = 0;
        } else {
            fill(255, 0, 0);
            ellipse(0, 0, bossFruit.size, bossFruit.size);
        }
        pop();
    }
}

function drawHandTracking() {
    // 繪製手指位置
    if (fingerPositions.length > 0) {
        // 繪製手指指示器
        push();
        fill(255, 255, 255, 200);
        noStroke();
        // 繪製外圈
        ellipse(fingerPositions[0].x, fingerPositions[0].y, 40, 40);
        // 繪製內圈
        fill(255, 100, 100, 200);
        ellipse(fingerPositions[0].x, fingerPositions[0].y, 20, 20);
        pop();
    }

    // 繪製斬擊軌跡（更流暢的軌跡）
    if (sliceTrail.length > 1) {
        push();
        noFill();
        for (let i = 0; i < sliceTrail.length - 1; i++) {
            const slice1 = sliceTrail[i];
            const slice2 = sliceTrail[i + 1];
            const alpha = map(slice1.life, 0, TRAIL_LENGTH, 0, 255);
            const thickness = map(slice1.life, 0, TRAIL_LENGTH, 2, 8);
            
            // 使用漸變色
            const hue = map(i, 0, sliceTrail.length, 0, 60);
            stroke(hue, 100, 100, alpha);
            strokeWeight(thickness);
            line(slice1.pos.x, slice1.pos.y, slice2.pos.x, slice2.pos.y);
        }
        pop();
    }
}

// 輔助函數：檢查線段與圓形是否相交
function lineCircleIntersect(lineStart, lineEnd, circleCenter, radius) {
    const d = dist(lineStart.x, lineStart.y, lineEnd.x, lineEnd.y);
    if (d === 0) return false;
    
    const dot = (((circleCenter.x - lineStart.x) * (lineEnd.x - lineStart.x)) + 
                 ((circleCenter.y - lineStart.y) * (lineEnd.y - lineStart.y))) / (d * d);
    
    const closestX = lineStart.x + (dot * (lineEnd.x - lineStart.x));
    const closestY = lineStart.y + (dot * (lineEnd.y - lineStart.y));
    
    if (dot < 0 || dot > 1) {
        // 最近點在線段外
        return false;
    }
    
    const distance = dist(closestX, closestY, circleCenter.x, circleCenter.y);
    return distance <= radius;
}

// 當視窗大小改變時調整畫布大小
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    console.log('視窗調整後的畫布大小:', width, height);
}

window.addEventListener('DOMContentLoaded', () => {
    const ruleBtn = document.getElementById('ruleButton');
    const ruleModal = document.getElementById('ruleModal');
    const closeRule = document.getElementById('closeRule');
    if(ruleBtn && ruleModal && closeRule) {
        ruleBtn.onclick = () => ruleModal.classList.remove('hidden');
        closeRule.onclick = () => ruleModal.classList.add('hidden');
    }

    // 開始遊戲按鈕
    const startBtn = document.getElementById('startButton');
    if(startBtn) {
        startBtn.onclick = () => {
            document.getElementById('startScreen').classList.add('hidden');
            document.getElementById('loadingScreen').classList.remove('hidden');
            // 初始化手部追踪
            handpose = ml5.handpose(video, modelReady);
        };
    }

    // 關卡選擇按鈕
    for(let i=1; i<=4; i++) {
        const btn = document.getElementById('levelBtn'+i);
        if(btn) {
            btn.onclick = () => {
                level = i;
                document.getElementById('levelSelect').classList.add('hidden');
                startGame();
            };
        }
    }

    // 重新開始按鈕
    const restartBtn = document.getElementById('restartButton');
    if(restartBtn) {
        restartBtn.onclick = restartGame;
    }

    // 返回選關按鈕
    const backToLevelBtn = document.getElementById('backToLevelSelect');
    if(backToLevelBtn) {
        backToLevelBtn.onclick = () => {
            document.getElementById('gameOverScreen').classList.add('hidden');
            document.getElementById('levelSelect').classList.remove('hidden');
        };
    }

    // 退出選關按鈕
    const exitLevelBtn = document.getElementById('exitLevelSelect');
    if(exitLevelBtn) {
        exitLevelBtn.onclick = () => {
            document.getElementById('levelSelect').classList.add('hidden');
            document.getElementById('startScreen').classList.remove('hidden');
        };
    }

    // 下一關按鈕
    const nextLevelBtn = document.getElementById('nextLevelButton');
    if(nextLevelBtn) {
        nextLevelBtn.onclick = () => {
            currentLevel++;
            document.getElementById('gameOverScreen').classList.add('hidden');
            startGame();
        };
    }
});
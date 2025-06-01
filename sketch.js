// 遊戲狀態
let gameState = 'start'; // 'start', 'playing', 'gameover'
let score = 0;
let lives = 3;
let level = 1;  // 玩家選擇的關卡
let currentLevel = 1; // 當前進度等級（用於解鎖下一關）
let comboCount = 0;
let lastSliceTime = 0;
const LEVEL_REQUIREMENTS = [10, 10, 10, 10]; // 每關所需分數，調整為更合理的數值

// 設為全域變數
window.FRUIT_TYPES = ['apple', 'banana', 'watermelon', 'strawberry', 'tomato', 'guava', 'pitaya', 'lemon'];

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
// 在全域宣告這兩個變數
let minFingerX = Infinity;
let maxFingerX = -Infinity;
let fingerPositions = [];
let sliceTrail = [];
let lastFingerPos = null;
let lastValidHandTime = 0;
const TRAIL_LENGTH = 10; // 減少軌跡長度，使軌跡更精確
const SMOOTHING_FACTOR = 0.3; // 降低平滑因子，使移動更靈敏
const HAND_LOST_THRESHOLD = 800; // 減少手部失去偵測的閾值
const MAX_MOVEMENT_DISTANCE = 50; // 減少最大允許移動距離
const MIN_CONFIDENCE = 0.4; // 提高最小信心度閾值

// 遊戲設定
const MAX_FRUITS = 5;
const FRUIT_INTERVAL = 1000; // 水果生成間隔（毫秒）
let lastFruitTime = 0;
const BOSS_INTERVAL = 30000; // Boss 出現間隔（毫秒）
let lastBossTime = 0;

// 
let backgroundFruits = [];
let fruitImages = [];
let fruitSlicedImages = []; // 新增：切開後的水果圖片
let bombImage;
let durianImage;
let backgroundImage;
let sliceSound;
let bombSound;
let durianSound;

// 新增全域變數
let gameTimer = 20; // 秒
let gameStartTime = 0;
let isPaused = false;  // 確保只有一個 isPaused 變數

// 預加載圖片
function preload() {
    try {
        // 背景圖片
        backgroundImage = loadImage('./Assets/background.jpg', 
            () => console.log('背景圖片載入成功'),
            () => console.error('背景圖片載入失敗')
        );
        
        // 水果圖片（未切開）
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
    } catch (error) {
        console.error('圖片載入過程中發生錯誤:', error);
    }
}

function setup() {
    // 創建畫布
    let canvas = createCanvas(windowWidth, windowHeight);
    let ctx = canvas.elt.getContext('2d', { willReadFrequently: true });    
    canvas.parent('gameContainer');
    canvas.style('background', 'transparent');
    
    // 設置視訊
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();

    // 添加鍵盤事件監聽
    window.addEventListener('keydown', handleKeyPress);
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
    console.log('遊戲狀態:', gameState);  // 除錯用
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
    isPaused = false;  // 確保開始時不是暫停狀態
    loop();  // 確保遊戲循環運行
    document.getElementById('gameStats').classList.remove('hidden');
    document.getElementById('comboIndicator').classList.add('hidden');
    document.getElementById('pauseMenu').classList.add('hidden');  // 確保暫停選單是隱藏的
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

    // 檢查是否達到下一關的條件，如果達到就自動解鎖
    if (currentLevel < 4 && score >= LEVEL_REQUIREMENTS[currentLevel - 1]) {
        currentLevel++; // 自動增加關卡等級
        const nextLevelButton = document.getElementById('nextLevelButton');
        if (nextLevelButton) {
            nextLevelButton.textContent = `進入第 ${currentLevel} 關`;
            nextLevelButton.classList.remove('hidden');
            console.log('解鎖下一關，當前分數:', score, '所需分數:', LEVEL_REQUIREMENTS[currentLevel - 2]);
        }
    } else {
        const nextLevelButton = document.getElementById('nextLevelButton');
        if (nextLevelButton) {
            nextLevelButton.classList.add('hidden');
            console.log('未達到解鎖條件，當前分數:', score, '所需分數:', LEVEL_REQUIREMENTS[currentLevel - 1]);
        }
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
    const comboElement = document.getElementById('comboCount');
    
    comboElement.textContent = comboCount;
    
    comboIndicator.classList.remove('hidden');
    comboIndicator.classList.add('show');
    
    // 動畫持續1.5秒後隱藏
    setTimeout(() => {
        comboIndicator.classList.remove('show');
        setTimeout(() => {
            comboIndicator.classList.add('hidden');
        }, 500);
    }, 1500);
}

function draw() {
    // 檢查遊戲狀態和暫停狀態
    if (isPaused) {
        // 在暫停時仍然繪製背景和暫停選單
        if (backgroundImage) {
            image(backgroundImage, 0, 0, width, height);
        } else {
            background(100);
        }
        return;
    }
    
    clear();
    
    // 繪製背景
    if (backgroundImage) {
        image(backgroundImage, 0, 0, width, height);
    } else {
        background(100);
    }

    if (gameState === 'start') {
        // 處理開始畫面的背景裝飾水果
        updateBackgroundFruits();
        drawBackgroundFruits();
    } else if (gameState === 'playing') {
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

function updateBackgroundFruits() {
    // 偶爾生成背景水果
    if (random(1) < 0.02) { // 2% 機率生成
        backgroundFruits.push({
            x: random(width),
            y: height + 50,
            speedY: random(-3, -1), // 較慢的上升速度
            type: random(FRUIT_TYPES),
            size: random(60, 100),
            opacity: random(100, 180)
        });
    }
    
    // 更新背景水果位置
    for (let i = backgroundFruits.length - 1; i >= 0; i--) {
        const fruit = backgroundFruits[i];
        fruit.y += fruit.speedY;
        fruit.speedY += 0.1; // 輕微重力
        
        // 移除離開畫面的水果
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
        
        // 檢查信心度
        if (hand.confidence < MIN_CONFIDENCE) {
            if (lastFingerPos) {
                fingerPositions = [lastFingerPos.copy()];
            }
            return;
        }
        
        // 使用食指和中指的指尖位置來計算更準確的位置
        const indexFinger = hand.annotations.indexFinger[3];
        const middleFinger = hand.annotations.middleFinger[3];
        
        // 計算兩個指尖的平均位置
        const avgX = (indexFinger[0] + middleFinger[0]) / 2;
        const avgY = (indexFinger[1] + middleFinger[1]) / 2;

        const newX = avgX * width / video.width;
        const newY = avgY * height / video.height;

        // 更新偵測範圍
        minFingerX = Math.min(minFingerX, newX);
        maxFingerX = Math.max(maxFingerX, newX);
        
        // 檢查移動距離是否合理
        if (lastFingerPos) {
            const distance = dist(lastFingerPos.x, lastFingerPos.y, newX, newY);
            if (distance > MAX_MOVEMENT_DISTANCE) {
                // 如果移動距離過大，使用更平滑的過渡
                const smoothedX = lastFingerPos.x + (newX - lastFingerPos.x) * 0.2;
                const smoothedY = lastFingerPos.y + (newY - lastFingerPos.y) * 0.2;
                fingerPositions = [createVector(smoothedX, smoothedY)];
                lastFingerPos = createVector(smoothedX, smoothedY);
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
            lastFingerPos = null;
            fingerPositions = [];
        } else if (lastFingerPos) {
            fingerPositions = [lastFingerPos.copy()];
        }
    }

    // 移除過期的軌跡
    sliceTrail = sliceTrail.filter(slice => --slice.life > 0);
}

function updateGameLogic() {
    const currentTime = millis();
    // 根據選擇的關卡調整生成間隔與最大物件數與速度
    let fruitInterval = FRUIT_INTERVAL;
    let maxObjects = MAX_FRUITS;
    
    // 關卡速度設定
    if (level === 1) {
        fruitInterval *= 1.5;  // Lv1 最慢速度
        maxObjects = 4;
    } else if (level === 2) {
        fruitInterval *= 1.0;  // Lv2 正常速度
        maxObjects = 6;
    } else if (level === 3) {
        fruitInterval *= 0.7;  // Lv3 快速
        maxObjects = 8;
    } else if (level === 4) {
        fruitInterval *= 0.4;  // Lv4 超快
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

    checkCollisions();
    if (comboCount > 0 && currentTime - lastSliceTime > 2000) {
        comboCount = 0;
    }
}

function generateObject() {
    const rand = random(1);
    if (level === 1) {
        // Lv1：只產生水果，無障礙物
        generateFruit();
    } else if (level === 2) {
        // Lv2：90% 水果，10% 榴槤
        if (rand < 0.9) {
            generateFruit();
        } else {
            generateDurian();
        }
    } else if (level === 3) {
        // Lv3：80% 水果，10% 榴槤，10% 炸彈
        if (rand < 0.8) {
            generateFruit();
        } else if (rand < 0.9) {
            generateDurian();
        } else {
            generateBomb();
        }
    } else {
        // Lv4：70% 水果，15% 榴槤，15% 炸彈
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
    
    // 從畫面下方較遠的位置生成，使出現更自然
    const x = random(width * 0.1, width * 0.9);  // 避免在邊緣生成
    const y = height + 100;  // 從畫面更下方開始
    const speedX = random(-2, 2);  // 適當的水平速度
    const speedY = random(-25, -20);  // 更大的向上初始速度
    const rotationSpeed = random(-0.1, 0.1);
    const size = random(80, 120);
    
    fruits.push({
        type,
        x,
        y,
        speedX,
        speedY,
        rotation: 0,
        rotationSpeed,
        size,
        sliced: false,
        gravity: 0.4  // 添加重力參數
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

function updateFruits() {
    for (let i = fruits.length - 1; i >= 0; i--) {
        const fruit = fruits[i];
        
        // 使用水果自己的重力參數
        fruit.speedY += fruit.gravity;
        
        // 更新位置
        fruit.x += fruit.speedX;
        fruit.y += fruit.speedY;
        fruit.rotation += fruit.rotationSpeed;
        
        // 檢查是否到達最高點（speedY 從負數變成正數的瞬間）
        if (fruit.speedY > 0 && fruit.y < height * 0.2) {  // 降低最高點檢查的閾值
            // 確保水果開始下降
            fruit.speedY = Math.max(fruit.speedY, 2);  // 確保有最小下降速度
        }
        
        // 只要水果（不論有沒有被切）掉出畫面才移除
        if (fruit.y > height + 100) {
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
            // 使用未切開的水果圖片
            if (fruitImages[fruit.type]) {
                // 添加發光效果
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
    
    // 增加碰撞判定範圍
    const expandedRadius = radius * 1.2; // 增加 20% 的判定範圍
    
    const dot = (((circleCenter.x - lineStart.x) * (lineEnd.x - lineStart.x)) + 
                 ((circleCenter.y - lineStart.y) * (lineEnd.y - lineStart.y))) / (d * d);
    
    const closestX = lineStart.x + (dot * (lineEnd.x - lineStart.x));
    const closestY = lineStart.y + (dot * (lineEnd.y - lineStart.y));
    
    // 放寬判定條件，允許線段延長線上的點
    if (dot < -0.1 || dot > 1.1) {
        // 檢查線段端點是否在圓內
        const distToStart = dist(lineStart.x, lineStart.y, circleCenter.x, circleCenter.y);
        const distToEnd = dist(lineEnd.x, lineEnd.y, circleCenter.x, circleCenter.y);
        return distToStart <= expandedRadius || distToEnd <= expandedRadius;
    }
    
    const distance = dist(closestX, closestY, circleCenter.x, circleCenter.y);
    return distance <= expandedRadius;
}

// 當視窗大小改變時調整畫布大小
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    console.log('視窗調整後的畫布大小:', width, height);
}

// 添加鍵盤事件處理函數
function handleKeyPress(event) {
    console.log('按下按鍵:', event.key);  // 除錯用
    if (event.key === 'Escape') {
        console.log('遊戲狀態:', gameState); // 除錯用
        if (gameState === 'playing') {
            console.log('觸發暫停');  // 除錯用
            togglePause();
        }
    }
}

// 添加暫停/繼續功能
function togglePause() {
    isPaused = !isPaused;
    const pauseMenu = document.getElementById('pauseMenu');
    console.log('切換暫停狀態:', isPaused);  // 除錯用
    
    if (isPaused) {
        console.log('顯示暫停選單');  // 除錯用
        pauseMenu.classList.remove('hidden');
        noLoop();  // 停止遊戲循環
    } else {
        console.log('隱藏暫停選單');  // 除錯用
        pauseMenu.classList.add('hidden');
        loop();    // 恢復遊戲循環
    }
}

window.addEventListener('DOMContentLoaded', () => {
    // 添加鍵盤事件監聽
    window.addEventListener('keydown', handleKeyPress);
    console.log('已添加鍵盤事件監聽');  // 除錯用

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
            // 初始化手部追踪，增加偵測靈敏度
            handpose = ml5.handpose(video, {
                flipHorizontal: true,
                maxHands: 1,
                detectionConfidence: 0.5,  // 降低偵測信心度閾值
                maxNumHands: 1
            }, modelReady);
        };
    }

    // 更新關卡按鈕狀態
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
                if (i > currentLevel) {
                    btn.innerHTML = `🔒第${i}關：${levelName}`;
                    btn.classList.add('locked');
                    btn.onclick = null; 
                } else {
                    btn.textContent = `第${i}關：${levelName}`;
                    btn.classList.remove('locked');
                    btn.onclick = () => {
                        level = i;
                        document.getElementById('levelSelect').classList.add('hidden');
                        startGame();
                    };
                }
            }
        }
    }
    
    

    // 關卡選擇按鈕
    updateLevelButtons();

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
            updateLevelButtons(); // 更新按鈕狀態
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
            document.getElementById('loadingScreen').classList.remove('hidden');
            // 重新初始化手部偵測
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

    // 暫停選單按鈕事件
    const resumeBtn = document.getElementById('resumeButton');
    const restartFromPauseBtn = document.getElementById('restartFromPause');
    const exitToMenuBtn = document.getElementById('exitToMenu');

    if (resumeBtn) {
        resumeBtn.onclick = () => {
            togglePause();  // 繼續遊戲
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
            document.getElementById('gameStats').classList.add('hidden'); // 隱藏遊戲狀態
            document.getElementById('comboIndicator').classList.add('hidden'); // 隱藏 combo 指示器
            document.getElementById('levelIndicator').classList.add('hidden'); // 隱藏關卡指示器
            gameState = 'start';
            // 重置遊戲相關變數
            score = 0;
            lives = 3;
            comboCount = 0;
            fruits = [];
            bombs = [];
            durians = [];
            bossFruit = null;
            bossActive = false;
        };
    }
});
// ==================== 遊戲常數與設定 ====================
const GAME_SETTINGS = {
    MAX_FRUITS: 5,
    FRUIT_INTERVAL: 1000,
    BOSS_INTERVAL: 30000,
    TRAIL_LENGTH: 10,
    SMOOTHING_FACTOR: 0.3,
    HAND_LOST_THRESHOLD: 800,
    MAX_MOVEMENT_DISTANCE: 50,
    MIN_CONFIDENCE: 0.4
};

const LEVEL_REQUIREMENTS = [100, 100, 100, 100];
const FRUIT_TYPES = ['apple', 'banana', 'watermelon', 'strawberry', 'tomato', 'guava', 'pitaya', 'lemon'];

// ==================== 遊戲狀態變數 ====================
let gameState = 'start';  // 'start', 'playing', 'gameover'
let score = 0;
let lives = 3;
let level = 1;           // 玩家選擇的關卡
let currentLevel = 1;    // 當前進度等級
let comboCount = 0;
let lastSliceTime = 0;
let gameTimer = 20;      // 秒
let gameStartTime = 0;

// ==================== P5.js 與 ML5.js 變數 ====================
let video;
let handpose;
let hands = [];
let fruits = [];
let bombs = [];
let durians = [];
let bossActive = false;
let bossFruit = null;

// ==================== 手部追踪變數 ====================
let minFingerX = Infinity;
let maxFingerX = -Infinity;
let fingerPositions = [];
let sliceTrail = [];
let lastFingerPos = null;
let lastValidHandTime = 0;

// ==================== 遊戲資源 ====================
let fruitImages = [];
let fruitSlicedImages = [];
let bombImage;
let durianImage;
let backgroundImage;
let sliceSound;
let bombSound;
let durianSound;
let cuttingImage;

// ==================== 遊戲初始化 ====================
function preload() {
    try {
        loadBackgroundImage();
        loadFruitImages();
        loadSlicedFruitImages();
        loadObstacleImages();
        cuttingImage = loadImage('Assets/Cutting.png');
    } catch (error) {
        console.error('圖片載入過程中發生錯誤:', error);
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight).parent('gameContainer');
    setupVideo();
}

// ==================== 遊戲核心邏輯 ====================
function draw() {
    clear();
    drawBackground();
    
    if (gameState === 'playing') {
        updateGameTimer();
        if (gameTimer <= 0) {
            gameOver();
            return;
        }
        
        updateHandTracking();
        updateGameLogic();
        drawObjects();
        drawHandTracking();
        drawHandDetectionMessage();
    }
}

// ==================== 遊戲狀態管理 ====================
function startGame() {
    resetGameState();
    showGameUI();
}

function gameOver() {
    gameState = 'gameover';
    hideGameUI();
    showGameOverScreen();
    handleNextLevelButton();
}

function restartGame() {
    hideGameOverScreen();
    startGame();
}

// ==================== 物件生成與更新 ====================
function generateObject() {
    const rand = random(1);
    switch(level) {
        case 1: // Lv1：只產生水果
            generateFruit();
            break;
        case 2: // Lv2：90% 水果，10% 榴槤
            rand < 0.9 ? generateFruit() : generateDurian();
            break;
        case 3: // Lv3：80% 水果，10% 榴槤，10% 炸彈
            if (rand < 0.8) generateFruit();
            else if (rand < 0.9) generateDurian();
            else generateBomb();
            break;
        default: // Lv4：70% 水果，15% 榴槤，15% 炸彈
            if (rand < 0.7) generateFruit();
            else if (rand < 0.85) generateDurian();
            else generateBomb();
    }
}

// ==================== 碰撞檢測 ====================
function checkCollisions() {
    if (fingerPositions.length === 0 || sliceTrail.length < 2) return;
    
    const currentFingerPos = fingerPositions[0];
    const prevSlicePos = sliceTrail.length >= 2 ? sliceTrail[sliceTrail.length - 2].pos : null;
    
    if (!prevSlicePos) return;
    
    checkFruitCollisions(prevSlicePos, currentFingerPos);
    checkBombCollisions(prevSlicePos, currentFingerPos);
    checkDurianCollisions(prevSlicePos, currentFingerPos);
}

// ==================== 繪製函數 ====================
function drawObjects() {
    drawFruits();
    drawBombs();
    drawDurians();
}

function drawCutEffect() {
    if (!cutEffect.active) return;
    
    push();
    const { startX, startY, endX, endY } = cutEffect;
    const dx = endX - startX;
    const dy = endY - startY;
    const angle = atan2(dy, dx);
    const length = dist(startX, startY, endX, endY);
    
    imageMode(CENTER);
    const numImages = floor(length / 20);
    
    for (let i = 0; i < numImages; i++) {
        const t = i / numImages;
        const x = lerp(startX, endX, t);
        const y = lerp(startY, endY, t);
        
        push();
        translate(x, y);
        rotate(angle);
        image(cuttingImage, 0, 0, 40, 40);
        pop();
    }
    pop();
}

// ==================== 事件處理 ====================
window.addEventListener('DOMContentLoaded', () => {
    setupRuleModal();
    setupStartButton();
    setupLevelButtons();
    setupRestartButton();
    setupBackToLevelButton();
    setupExitLevelButton();
    setupNextLevelButton();
});

// ==================== 輔助函數 ====================
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
    
    return dist(closestX, closestY, circleCenter.x, circleCenter.y) <= expandedRadius;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    console.log('視窗調整後的畫布大小:', width, height);
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

function updateHandTracking() {
    const currentTime = millis();
    
    if (hands.length > 0) {
        const hand = hands[0];
        
        // 檢查信心度
        if (hand.confidence < GAME_SETTINGS.MIN_CONFIDENCE) {
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
            if (distance > GAME_SETTINGS.MAX_MOVEMENT_DISTANCE) {
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
            const smoothedX = lastFingerPos.x + (newX - lastFingerPos.x) * GAME_SETTINGS.SMOOTHING_FACTOR;
            const smoothedY = lastFingerPos.y + (newY - lastFingerPos.y) * GAME_SETTINGS.SMOOTHING_FACTOR;
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
                life: GAME_SETTINGS.TRAIL_LENGTH
            });
        }
    } else {
        // 檢查是否超過手部失去偵測的閾值
        if (currentTime - lastValidHandTime > GAME_SETTINGS.HAND_LOST_THRESHOLD) {
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
    let fruitInterval = GAME_SETTINGS.FRUIT_INTERVAL;
    let maxObjects = GAME_SETTINGS.MAX_FRUITS;
    
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
    
    // 隨機生成水果/障礙物
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

function generateFruit() {
    const type = random(FRUIT_TYPES);
    console.log('生成水果:', type, '圖片是否存在:', !!fruitImages[type]);
    
    // 使用手指移動範圍來決定水果生成位置
    let left = minFingerX;
    let right = maxFingerX;
    
    // 如果還沒有手指移動範圍，使用預設值
    if (minFingerX === Infinity || maxFingerX === -Infinity) {
        left = width * 0.35;  // 縮小預設範圍
        right = width * 0.55; // 進一步縮小右邊界
    }

    // 確保生成位置在有效範圍內，並限制右邊界
    left = constrain(left, 0, width * 0.6);  // 限制左邊界
    right = constrain(right, 0, width * 0.6); // 限制右邊界
    
    // 如果左右範圍太窄，使用預設範圍
    if (right - left < 50) {  // 減少最小範圍
        left = width * 0.35;  // 縮小預設範圍
        right = width * 0.55; // 進一步縮小右邊界
    }

    const x = random(left, right);
    const y = height + 50;
    const speedX = random(-2, 2);  // 減少水平速度範圍
    const speedY = random(-18, -15);
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

function updateFruits() {
    for (let i = fruits.length - 1; i >= 0; i--) {
        const fruit = fruits[i];
        // 更新位置
        fruit.speedY += 0.2; // 重力
        fruit.x += fruit.speedX;
        fruit.y += fruit.speedY;
        fruit.rotation += fruit.rotationSpeed;
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

function checkFruitCollisions(prevSlicePos, currentFingerPos) {
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
}

function checkBombCollisions(prevSlicePos, currentFingerPos) {
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
}

function checkDurianCollisions(prevSlicePos, currentFingerPos) {
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

function drawFruits() {
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
}

function drawBombs() {
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
}

function drawDurians() {
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
            const alpha = map(slice1.life, 0, GAME_SETTINGS.TRAIL_LENGTH, 0, 255);
            const thickness = map(slice1.life, 0, GAME_SETTINGS.TRAIL_LENGTH, 2, 8);
            
            // 使用漸變色
            const hue = map(i, 0, sliceTrail.length, 0, 60);
            stroke(hue, 100, 100, alpha);
            strokeWeight(thickness);
            line(slice1.pos.x, slice1.pos.y, slice2.pos.x, slice2.pos.y);
        }
        pop();
    }
}

function drawHandDetectionMessage() {
    if (hands.length === 0) {
        fill(255, 255, 0, 220);
        textAlign(CENTER, CENTER);
        textSize(36);
        text('請將手放在鏡頭前', width/2, height/2);
    }
}

function drawBackground() {
    if (backgroundImage) {
        image(backgroundImage, 0, 0, width, height);
    } else {
        background(100);
    }
}

function updateGameTimer() {
    let elapsed = (millis() - gameStartTime) / 1000;
    let timeLeft = Math.max(0, 20 - Math.floor(elapsed));
    gameTimer = timeLeft;
    // 顯示剩餘時間
    fill('#FFD700');
    textAlign(RIGHT, TOP);
    textSize(32);
    text('剩餘時間: ' + gameTimer + ' 秒', width - 30, 30);
}

function resetGameState() {
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
    document.getElementById('gameStats').classList.remove('hidden');
    document.getElementById('comboIndicator').classList.add('hidden');
    updateStats();
}

function showGameUI() {
    document.getElementById('gameStats').classList.remove('hidden');
    document.getElementById('comboIndicator').classList.add('hidden');
}

function hideGameUI() {
    document.getElementById('gameStats').classList.add('hidden');
    document.getElementById('comboIndicator').classList.add('hidden');
}

function showGameOverScreen() {
    document.getElementById('gameOverScreen').classList.remove('hidden');
    document.getElementById('finalScore').textContent = score;

    // 檢查是否達到下一關的條件
    const nextLevelButton = document.getElementById('nextLevelButton');
    if (currentLevel < 4 && score >= LEVEL_REQUIREMENTS[currentLevel - 1]) {
        nextLevelButton.classList.remove('hidden');
        nextLevelButton.textContent = `進入第 ${currentLevel + 1} 關`;
        console.log('顯示下一關按鈕，當前分數:', score, '所需分數:', LEVEL_REQUIREMENTS[currentLevel - 1]);
    } else {
        nextLevelButton.classList.add('hidden');
        console.log('隱藏下一關按鈕，當前分數:', score, '所需分數:', LEVEL_REQUIREMENTS[currentLevel - 1]);
    }
}

function hideGameOverScreen() {
    document.getElementById('gameOverScreen').classList.add('hidden');
}

function handleNextLevelButton() {
    const nextLevelBtn = document.getElementById('nextLevelButton');
    if (nextLevelBtn) {
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
}

function setupRuleModal() {
    const ruleBtn = document.getElementById('ruleButton');
    const ruleModal = document.getElementById('ruleModal');
    const closeRule = document.getElementById('closeRule');
    if(ruleBtn && ruleModal && closeRule) {
        ruleBtn.onclick = () => ruleModal.classList.remove('hidden');
        closeRule.onclick = () => ruleModal.classList.add('hidden');
    }
}

function setupStartButton() {
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
}

function setupLevelButtons() {
    function updateLevelButtons() {
        for(let i=1; i<=4; i++) {
            const btn = document.getElementById('levelBtn'+i);
            if(btn) {
                if(i > currentLevel) {
                    btn.classList.add('locked');
                    btn.onclick = null;
                } else {
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
    updateLevelButtons();
}

function setupRestartButton() {
    const restartBtn = document.getElementById('restartButton');
    if(restartBtn) {
        restartBtn.onclick = restartGame;
    }
}

function setupBackToLevelButton() {
    const backToLevelBtn = document.getElementById('backToLevelSelect');
    if(backToLevelBtn) {
        backToLevelBtn.onclick = () => {
            document.getElementById('gameOverScreen').classList.add('hidden');
            document.getElementById('levelSelect').classList.remove('hidden');
            updateLevelButtons(); // 更新按鈕狀態
        };
    }
}

function setupExitLevelButton() {
    const exitLevelBtn = document.getElementById('exitLevelSelect');
    if(exitLevelBtn) {
        exitLevelBtn.onclick = () => {
            document.getElementById('levelSelect').classList.add('hidden');
            document.getElementById('startScreen').classList.remove('hidden');
        };
    }
}

function setupNextLevelButton() {
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
}
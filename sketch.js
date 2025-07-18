let gameState = 'start';
let score = 0;
let lives = 3;
let level = 1;
let currentLevel = 1;
let levelScores = [0, 0, 0, 0];
let comboCount = 0;
let lastSliceTime = 0;
const LEVEL_REQUIREMENTS = [100, 100, 100, 100];

// 添加暫停時間相關變量
let pauseStartTime = 0;
let totalPausedTime = 0;

// 音效相關變量
let bgm;
let cutSound;
let cutBossSound;
let boomSound;
let hurtSound;
let failSound;
let completeSound;
let clickSound;
let isBgmPlaying = false;

// 在音效相關變量區域添加
let menuMusic;
let isMenuMusicPlaying = false;

// 音效初始化函數
function initializeSound() {
    try {
        // 設置音效音量
        if (bgm) {
            bgm.setVolume(0.4);
            console.log('背景音樂音量設置成功');
        }
        if (cutSound) cutSound.setVolume(0.6);
        if (cutBossSound) cutBossSound.setVolume(0.7);
        if (boomSound) boomSound.setVolume(0.8);
        if (hurtSound) hurtSound.setVolume(0.6);
        if (failSound) failSound.setVolume(0.7);
        if (completeSound) completeSound.setVolume(0.7);
        if (clickSound) clickSound.setVolume(0.5);
    } catch (error) {
        console.error('音效初始化錯誤:', error);
    }
}

let heartImage;
let heartScale = 1;
let heartAlpha = 255;
let lastHeartLostTime = 0;
const HEART_ANIMATION_DURATION = 500;

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

let screenShakeAmount = 0;
let handScaleEffect = 0;

// 在全局變量區域添加震動相關變量
let screenShakeTime = 0;
let screenShakeDuration = 300; // 震動持續300毫秒
let screenShakeIntensity = 10; // 初始震動強度

// 在全局變量區域添加按鈕觸發相關變量
let hoveredButton = null;
let buttonHoverStartTime = 0;
const BUTTON_HOVER_DURATION = 1500; // 1.5秒

// 在全局變量區域添加
let handTrackingMode = 'normal'; // 'normal' 或 'playing'

// 在全局變量區域添加
let modelLoading = true;
let handDetected = false;
let loadingProgress = 0;
let loadingCheckInterval;
let stableHandDetectionCount = 0;
let lastHandDetectionTime = 0;
const REQUIRED_STABLE_DETECTIONS = 15;  // 從30降到15次
const STABLE_DETECTION_INTERVAL = 150;  // 從100增加到150毫秒
const CONFIDENCE_THRESHOLD = 0.5;      // 從0.7降到0.5
const MAX_LOADING_TIME = 15000;       // 最長等待時間15秒
let loadingStartTime = 0;            // 記錄開始載入的時間

// 在全局變量區域添加 updateLevelButtons 函數
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

function preload() {
    try {
        // 預載入桃子圖片
        peachImage = loadImage('./Assets/peach.png', 
            () => console.log('桃子圖片載入成功'),
            () => console.error('桃子圖片載入失敗')
        );
        
        // 載入圖片資源
        backgroundImage = loadImage('./Assets/background.jpg', 
            () => console.log('背景圖片載入成功'),
            () => console.error('背景圖片載入失敗')
        );
        
        heartImage = loadImage('./Assets/hearts.png',
            () => console.log('愛心圖片載入成功'),
            () => console.error('愛心圖片載入失敗')
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

        leftHandImage = loadImage('./Assets/LeftHand.png',
            () => console.log('左手圖片載入成功'),
            () => console.error('左手圖片載入失敗')
        );
        rightHandImage = loadImage('./Assets/RightHand.png?' + new Date().getTime(),
            () => console.log('右手圖片載入成功'),
            () => console.error('右手圖片載入失敗')
        );

        // 載入音效文件
        try {
            console.log('開始載入音效文件...');
            
            menuMusic = loadSound('./Assets/Sounds/music.mp3',
                () => {
                    console.log('選單音樂載入成功');
                    menuMusic.setVolume(0.4);
                },
                (error) => {
                    console.error('選單音樂載入失敗:', error);
                    menuMusic = null;
                }
            );

            bgm = loadSound('./Assets/Sounds/bgm.mp3',
                () => {
                    console.log('背景音樂載入成功');
                    bgm.setVolume(0.4);
                },
                (error) => {
                    console.error('背景音樂載入失敗:', error);
                    bgm = null;
                }
            );

            cutSound = loadSound('./Assets/Sounds/cut.mp3',
                () => {
                    console.log('切割音效載入成功');
                    cutSound.setVolume(0.6);
                },
                (error) => {
                    console.error('切割音效載入失敗:', error);
                    cutSound = null;
                }
            );

            cutBossSound = loadSound('./Assets/Sounds/cutBoss.mp3',
                () => {
                    console.log('Boss切割音效載入成功');
                    cutBossSound.setVolume(0.7);
                },
                (error) => {
                    console.error('Boss切割音效載入失敗:', error);
                    cutBossSound = null;
                }
            );

            boomSound = loadSound('./Assets/Sounds/boom.mp3',
                () => {
                    console.log('爆炸音效載入成功');
                    boomSound.setVolume(0.8);
                },
                (error) => {
                    console.error('爆炸音效載入失敗:', error);
                    boomSound = null;
                }
            );

            hurtSound = loadSound('./Assets/Sounds/hurt.mp3',
                () => {
                    console.log('受傷音效載入成功');
                    hurtSound.setVolume(0.6);
                },
                (error) => {
                    console.error('受傷音效載入失敗:', error);
                    hurtSound = null;
                }
            );

            failSound = loadSound('./Assets/Sounds/fail.mp3',
                () => {
                    console.log('失敗音效載入成功');
                    failSound.setVolume(0.7);
                },
                (error) => {
                    console.error('失敗音效載入失敗:', error);
                    failSound = null;
                }
            );

            completeSound = loadSound('./Assets/Sounds/complete.mp3',
                () => {
                    console.log('完成音效載入成功');
                    completeSound.setVolume(0.7);
                },
                (error) => {
                    console.error('完成音效載入失敗:', error);
                    completeSound = null;
                }
            );

            clickSound = loadSound('./Assets/Sounds/click.mp3',
                () => {
                    console.log('點擊音效載入成功');
                    clickSound.setVolume(0.5);
                },
                (error) => {
                    console.error('點擊音效載入失敗:', error);
                    clickSound = null;
                }
            );

            console.log('音效文件載入完成');
        } catch (soundError) {
            console.error('音效載入過程中發生錯誤:', soundError);
            // 將所有音效變量設為 null
            bgm = cutSound = cutBossSound = boomSound = hurtSound = failSound = completeSound = clickSound = menuMusic = null;
        }
    } catch (error) {
        console.error('資源載入過程中發生錯誤:', error);
    }
}

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    let ctx = canvas.elt.getContext('2d', { willReadFrequently: true });    
    canvas.parent('gameContainer');
    canvas.style('background', 'transparent');
    
    // 記錄開始載入時間
    loadingStartTime = millis();
    
    // 初始化音效系統
    initializeSound();
    
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();

    // 先隱藏主選單，顯示載入畫面
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('loadingScreen').classList.remove('hidden');

    // 初始化手部追蹤模型，調整參數
    handpose = ml5.handpose(video, {
        flipHorizontal: true,
        maxHands: 1,
        detectionConfidence: 0.5,
        iouThreshold: 0.3,        // 降低 IOU 閾值
        scoreThreshold: 0.5       // 降低分數閾值
    }, modelReady);

    // 設置手部追蹤的回調函數
    handpose.on('predict', results => {
        hands = results;
        const currentTime = millis();
        
        if (hands.length > 0) {
            const hand = hands[0];
            if (hand.confidence >= CONFIDENCE_THRESHOLD) {
                if (currentTime - lastHandDetectionTime <= STABLE_DETECTION_INTERVAL) {
                    stableHandDetectionCount++;
                    if (stableHandDetectionCount >= REQUIRED_STABLE_DETECTIONS && !handDetected) {
                        handDetected = true;
                        console.log('手部偵測穩定');
                    }
                } else {
                    // 如果間隔太長，重置計數
                    stableHandDetectionCount = 1;
                }
                lastHandDetectionTime = currentTime;
            }
        } else {
            // 如果沒有偵測到手部，重置計數
            stableHandDetectionCount = 0;
        }

        // 確保在收到手部追蹤數據時立即更新
        if (!isPaused && gameState !== 'death') {
            loop();
        }
    });

    // 開始檢查載入進度
    startLoadingCheck();

    window.addEventListener('keydown', handleKeyPress);
    
    // 確保遊戲循環開始運行
    loop();

    // 開始播放選單音樂
    if (menuMusic && !isMenuMusicPlaying) {
        menuMusic.loop();
        isMenuMusicPlaying = true;
    }
}

function modelReady() {
    console.log('Handpose model ready!');
    modelLoading = false;
    loadingProgress = 50; // 模型載入完成佔50%
    updateLoadingBar();
}

function startLoadingCheck() {
    loadingProgress = 0;
    loadingCheckInterval = setInterval(() => {
        const currentTime = millis();
        const elapsedTime = currentTime - loadingStartTime;
        
        // 檢查是否超時
        if (elapsedTime >= MAX_LOADING_TIME) {
            // 如果超過最長等待時間，直接進入主畫面
            clearInterval(loadingCheckInterval);
            if (!handDetected) {
                console.log('載入超時，強制完成');
                handDetected = true;
                // 顯示提示訊息
                const loadingText = document.querySelector('.loading-text');
                if (loadingText) {
                    loadingText.innerHTML += '<br><span style="color: #ffa500;">提示：如果遊戲中手部偵測不穩定，請調整鏡頭角度或確保光線充足</span>';
                }
                setTimeout(() => completeLoading(), 2000);
            }
            return;
        }

        if (!modelLoading && handDetected) {
            clearInterval(loadingCheckInterval);
            completeLoading();
        } else if (!modelLoading) {
            const detectionProgress = Math.min(40, (stableHandDetectionCount / REQUIRED_STABLE_DETECTIONS) * 40);
            loadingProgress = 50 + detectionProgress;
            updateLoadingBar();
            updateLoadingText();
        }
    }, 100);
}

function updateLoadingBar() {
    const loadingBar = document.getElementById('loadingBar');
    if (loadingBar) {
        loadingBar.style.width = loadingProgress + '%';
    }
}

function updateLoadingText() {
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
        if (modelLoading) {
            loadingText.innerHTML = `正在初始化手部追蹤模型...<br><span class="loading-percentage">${Math.round(loadingProgress)}%</span>`;
            loadingText.style.color = '#4a90e2';
        } else if (!handDetected) {
            const detectionPercentage = Math.round((stableHandDetectionCount / REQUIRED_STABLE_DETECTIONS) * 100);
            const timeLeft = Math.max(0, Math.ceil((MAX_LOADING_TIME - (millis() - loadingStartTime)) / 1000));
            
            loadingText.innerHTML = `請將手掌放入鏡頭中...<br>
                <span class="loading-percentage">${Math.round(loadingProgress)}%</span><br>
                <span class="detection-status">手部偵測穩定度: ${Math.min(100, detectionPercentage)}%</span><br>
                <span class="time-left">(${timeLeft}秒後自動進入)</span>`;
            loadingText.style.color = '#ff6b6b';
            loadingText.style.fontSize = '24px';
        }
    }
}

function completeLoading() {
    loadingProgress = 100;
    updateLoadingBar();
    
    // 設置最小等待時間（3秒）
    setTimeout(() => {
        // 檢查是否已經偵測到手部
        if (handDetected) {
            // 淡出載入畫面
            const loadingScreen = document.getElementById('loadingScreen');
            loadingScreen.style.transition = 'opacity 0.5s ease-out';
            loadingScreen.style.opacity = '0';
            
            setTimeout(() => {
                // 隱藏載入畫面並顯示主選單
                loadingScreen.classList.add('hidden');
                const startScreen = document.getElementById('startScreen');
                startScreen.classList.remove('hidden');
                startScreen.style.opacity = '0';
                
                requestAnimationFrame(() => {
                    startScreen.style.transition = 'opacity 0.5s ease-in';
                    startScreen.style.opacity = '1';
                });
            }, 500);
        } else {
            // 如果還沒偵測到手部，更新提示文字並繼續等待
            const loadingText = document.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = '請將手掌放入鏡頭中...';
                loadingText.style.color = '#ff6b6b';
                loadingText.style.fontSize = '24px';
            }
            // 每500ms檢查一次是否偵測到手部
            setTimeout(completeLoading, 500);
        }
    }, 3000);
}

function startGame() {
    if (menuMusic && isMenuMusicPlaying) {
        menuMusic.stop();
        isMenuMusicPlaying = false;
    }
    
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
    
    // 播放背景音樂
    if (bgm && !isBgmPlaying) {
        bgm.loop();
        isBgmPlaying = true;
    }
    
    // 重置桃子模式相關狀態
    peachActive = false;
    peachSliceCount = 0;
    peachTimer = 15;
    document.getElementById('peachOverlay').classList.add('hidden');
    
    // 確保死亡畫面被隱藏
    const deathScreen = document.getElementById('deathScreen');
    if (deathScreen) {
        deathScreen.classList.remove('show');
    }
    
    loop();
    document.getElementById('gameStats').classList.remove('hidden');
    document.getElementById('heartsContainer').classList.remove('hidden');
    document.getElementById('timerContainer').classList.remove('hidden');
    document.getElementById('comboIndicator').classList.add('hidden');
    document.getElementById('pauseMenu').classList.add('hidden');
    updateStats();
    
    // 重置暫停相關變量
    pauseStartTime = 0;
    totalPausedTime = 0;
}

function restartGame() {
    // 重置桃子模式相關狀態
    peachActive = false;
    peachSliceCount = 0;
    peachTimer = 15;
    document.getElementById('peachOverlay').classList.add('hidden');
    
    // 停止所有音效
    if (bgm && isBgmPlaying) {
        bgm.stop();
        isBgmPlaying = false;
    }
    
    // 重置遊戲狀態
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('pauseMenu').classList.add('hidden');
    isPaused = false;
    startGame();
}

function gameOver() {
    gameState = 'gameover';
    
    // 停止背景音樂
    if (bgm && isBgmPlaying) {
        bgm.stop();
        isBgmPlaying = false;
    }
    
    // 開始播放選單音樂
    if (menuMusic && !isMenuMusicPlaying) {
        menuMusic.loop();
        isMenuMusicPlaying = true;
    }
    
    // 播放結算音效
    if (score >= LEVEL_REQUIREMENTS[level - 1]) {
        if (completeSound) completeSound.play();
    } else {
        if (failSound) failSound.play();
    }
    
    document.getElementById('gameStats').classList.add('hidden');
    document.getElementById('heartsContainer').classList.add('hidden');
    document.getElementById('timerContainer').classList.add('hidden');
    document.getElementById('comboIndicator').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.remove('hidden');
    document.getElementById('finalScore').textContent = score;

    if (score > levelScores[level - 1]) {
        levelScores[level - 1] = score;
    }

    // 不要停止遊戲循環，讓手指追蹤繼續運作
    loop();

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
    const currentLevelRequirement = LEVEL_REQUIREMENTS[level - 1];
    scoreSpan.textContent = `${score} / ${currentLevelRequirement}`;
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
    clear();
    
    if (backgroundImage) {
        image(backgroundImage, 0, 0, width, height);
    } else {
        background(100);
    }

    // 如果還在載入中，不更新其他內容
    if (modelLoading || !handDetected) {
        return;
    }

    // 更新手部追蹤
    updateHandTracking();

    push(); // 保存當前變換狀態
    
    // 處理畫面震動效果
    if (millis() - screenShakeTime < screenShakeDuration) {
        const progress = (millis() - screenShakeTime) / screenShakeDuration;
        const currentIntensity = screenShakeIntensity * (1 - progress);
        const shakeX = random(-currentIntensity, currentIntensity);
        const shakeY = random(-currentIntensity, currentIntensity);
        translate(shakeX, shakeY);
    }

    if (isPaused) {
        // 在暫停狀態下只顯示背景和手指指示器
        drawHandTracking();
        loop(); // 確保在暫停時也能更新手指位置
    } else if (gameState === 'start') {
        updateBackgroundFruits();
        drawBackgroundFruits();
        drawHandTracking();
    } else if (gameState === 'playing') {
        if (!peachActive) {
            // 計算經過時間時需要減去暫停的時間
            let elapsed = (millis() - gameStartTime - totalPausedTime) / 1000;
            let timeLeft = Math.max(0, 20 - Math.floor(elapsed));
            gameTimer = timeLeft;
            document.getElementById('gameTimer').textContent = timeLeft;
            
            if (timeLeft === 0 && !peachActive) {
                generatePeach();
            }
        }
        
        updateGameLogic();
        drawObjects();
        drawHurtEffect();
        drawHands();
        drawHearts();
        drawHandTracking();
    } else if (gameState === 'death' || gameState === 'gameover') {
        // 在死亡和結算畫面也顯示手指指示器並保持更新
        drawHandTracking();
        loop(); // 確保能繼續更新手指位置
        
        // 在死亡狀態下也檢查按鈕懸停
        const currentTime = millis();
        if (hands && hands.length > 0) {
            const hand = hands[0];
            if (hand.confidence >= CONFIDENCE_THRESHOLD) {
                const indexFinger = hand.annotations.indexFinger[3];
                if (indexFinger) {
                    const x = indexFinger[0] * width / video.width;
                    const y = indexFinger[1] * height / video.height;
                    checkButtonHover(x, y);
                }
            }
        }
    } else {
        // 在其他狀態下也顯示手指指示器
        drawHandTracking();
    }
    
    pop(); // 恢復變換狀態
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
    
    if (hands && hands.length > 0) {
        const hand = hands[0];
        
        if (hand.confidence < MIN_CONFIDENCE) {
            if (lastFingerPos) {
                fingerPositions = [lastFingerPos.copy()];
            }
            resetButtonHover();
            return;
        }
        
        const indexFinger = hand.annotations.indexFinger[3];
        const middleFinger = hand.annotations.middleFinger[3];
        
        if (!indexFinger || !middleFinger) {
            resetButtonHover();
            return;
        }
        
        const avgX = (indexFinger[0] + middleFinger[0]) / 2;
        const avgY = (indexFinger[1] + middleFinger[1]) / 2;

        const newX = avgX * width / video.width;
        const newY = avgY * height / video.height;

        // 根據遊戲狀態設置追蹤模式
        handTrackingMode = (gameState === 'playing' && !isPaused) ? 'playing' : 'normal';

        if (handTrackingMode === 'normal') {
            // 在普通模式下檢查按鈕懸停
            checkButtonHover(newX, newY);
        }

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

        // 只在遊戲進行中更新切割軌跡
        if (handTrackingMode === 'playing') {
            sliceTrail.push({
                pos: fingerPositions[0].copy(),
                life: TRAIL_LENGTH
            });
        }
    } else {
        resetButtonHover();
        if (currentTime - lastValidHandTime > HAND_LOST_THRESHOLD) {
            lastFingerPos = null;
            fingerPositions = [];
        } else if (lastFingerPos) {
            fingerPositions = [lastFingerPos.copy()];
        }
    }

    // 只在遊戲進行中更新切割軌跡
    if (handTrackingMode === 'playing') {
        sliceTrail = sliceTrail.filter(slice => --slice.life > 0);
    } else {
        sliceTrail = []; // 在非遊戲狀態下清空切割軌跡
    }
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
            
            // 直接進入結算畫面
            document.getElementById('peachOverlay').classList.add('hidden');
            peachActive = false;
            updateStats();
            gameOver();
            return;
        }
    } else {
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
        if (rand < 0.7) {
            generateFruit();
        } else {
            generateDurian();
        }
    } else if (level === 3) {
        if (rand < 0.7) {
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
    const size = 135;
    
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
    
    try {
        // 檢查桃子圖片是否已正確載入
        if (!peachImage || !peachImage.width) {
            console.error('桃子圖片未正確載入，嘗試重新載入');
            peachImage = loadImage('./Assets/peach.png', 
                () => {
                    console.log('桃子圖片重新載入成功');
                    // 重新繪製桃子
                    if (peachActive) {
                        redraw();
                    }
                },
                () => {
                    console.error('桃子圖片重新載入失敗');
                    // 使用備用圖形
                    peachImage = null;
                }
            );
        }
        
        peachActive = true;
        peachSliceCount = 0;
        peachTimer = 5;
        peachStartTime = millis();
        
        // 顯示特效元素並隱藏其他UI
        document.getElementById('peachOverlay').classList.remove('hidden');
        document.getElementById('gameStats').classList.add('hidden');
        document.getElementById('heartsContainer').classList.add('hidden');
        document.getElementById('timerContainer').classList.add('hidden');
        
        // 清空所有水果和炸彈
        fruits = [];
        bombs = [];
        durians = [];
        
        // 更新桃子位置到中心
        peachPosition = {
            x: width / 2,
            y: height / 2,
            size: 120,
            rotation: 0
        };
    } catch (error) {
        console.error('生成桃子時發生錯誤:', error);
        // 發生錯誤時重置狀態
        peachActive = false;
        gameOver();
    }
}

function updatePeachMode() {
    if (!peachActive) return;
    
    const elapsedPeachTime = (millis() - peachStartTime) / 1000;
    peachTimer = Math.max(0, 5 - elapsedPeachTime);
    
    // 更新計時器顯示
    document.getElementById('peachTimer').textContent = Math.ceil(peachTimer) + '秒';
    document.getElementById('peachCounter').textContent = peachSliceCount + '次';
    
    if (peachTimer <= 0) {
        const bonusScore = calculatePeachBonus(peachSliceCount);
        score += bonusScore;
        
        // 顯示獎勵分數
        const bonusElement = document.getElementById('peachBonus');
        bonusElement.textContent = `+${bonusScore}分！`;
        bonusElement.classList.remove('hidden');
        bonusElement.classList.add('show');
        
        // 隱藏特效元素
        document.getElementById('peachOverlay').classList.add('hidden');
        document.getElementById('peachTimer').classList.add('hidden');
        document.getElementById('peachCounter').classList.add('hidden');
        
        setTimeout(() => {
            bonusElement.classList.remove('show');
            bonusElement.classList.add('hidden');
        }, 1000);
        
        peachActive = false;
        updateStats();
        gameOver();
        return;
    }
}

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'peach-sparkle';
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    
    // 水墨效果的大小和透明度
    const size = random(3, 6);
    const opacity = random(0.3, 0.5);
    sparkle.style.width = size + 'px';
    sparkle.style.height = size + 'px';
    sparkle.style.background = `rgba(0, 0, 0, ${opacity})`;
    
    document.getElementById('gameContainer').appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1200);
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
        const isIntersecting = lineCircleIntersect(
            prevSlicePos, 
            currentFingerPos, 
            createVector(width/2, height/2),
            peachPosition.size * 1.8 / 2
        );
            
        if (isIntersecting && !isSlicingPeach) {
            peachSliceCount++;
            isSlicingPeach = true;
            
            // 播放Boss切割音效
            if (cutBossSound) cutBossSound.play();
            
            // 更新切割次數顯示
            sliceCountDisplay = {
                text: peachSliceCount.toString(),
                alpha: 1.0,
                y: height/2
            };
            
            // 創建切割特效
            for (let i = 0; i < 6; i++) {
                const angle = random(TWO_PI);
                const distance = random(30, 60);
                const sparkleX = width/2 + cos(angle) * distance;
                const sparkleY = height/2 + sin(angle) * distance;
                createSparkle(sparkleX, sparkleY);
            }
            
            // 添加切割軌跡
            const trailCount = 3;
            for (let i = 0; i < trailCount; i++) {
                const t = i / (trailCount - 1);
                const trailX = lerp(prevSlicePos.x, currentFingerPos.x, t);
                const trailY = lerp(prevSlicePos.y, currentFingerPos.y, t);
                
                const trail = document.createElement('div');
                trail.className = 'sparkle-trail';
                trail.style.left = trailX + 'px';
                trail.style.top = trailY + 'px';
                document.getElementById('gameContainer').appendChild(trail);
                
                setTimeout(() => trail.remove(), 800);
            }
            
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
            
            // 播放切割音效
            if (cutSound) cutSound.play();
            
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
            // 播放爆炸音效
            if (boomSound) boomSound.play();
            
            isHurt = true;
            hurtTimer = millis();
            showHands = true;
            handShowTimer = millis();
            
            lives = 0;
            loseLife();
            return;
        }
    }
    
    for (let i = durians.length - 1; i >= 0; i--) {
        const durian = durians[i];
        if (lineCircleIntersect(prevSlicePos, currentFingerPos, createVector(durian.x, durian.y), durian.size / 2)) {
            // 播放受傷音效
            if (hurtSound) hurtSound.play();
            
            isHurt = true;
            hurtTimer = millis();
            showHands = true;
            handShowTimer = millis();
            
            durians.splice(i, 1);
            loseLife();
            
            if (lives <= 0) {
                return;
            }
        }
    }
}

function drawObjects() {
    if (isPaused) return;
    
    if (peachActive) {
        // 放大的桃子置中顯示
        push();
        translate(width/2, height/2);
        rotate(peachPosition.rotation);
        
        // 放大桃子尺寸
        let enlargedSize = peachPosition.size * 1.8;
        
        try {
            // 確保圖片已經載入且有效
            if (peachImage && peachImage.width > 0) {
                // 水墨效果的陰影
                drawingContext.shadowBlur = 20;
                drawingContext.shadowColor = 'rgba(0, 0, 0, 0.4)';
                
                // 使用 tint() 來調整桃子的顏色和透明度
                tint(255, 230, 230, 220);
                imageMode(CENTER);
                image(peachImage, 0, 0, enlargedSize, enlargedSize);
                noTint();
                
                // 添加輕微的水墨暈染效果
                drawingContext.shadowBlur = 25;
                drawingContext.shadowColor = 'rgba(0, 0, 0, 0.15)';
                noFill();
                stroke(0, 30);
                strokeWeight(2);
                ellipse(0, 0, enlargedSize + 15, enlargedSize + 15);
            } else {
                console.warn('使用備用圓形顯示桃子');
                // 如果圖片無效，使用漂亮的備用圓形
                // 主要圓形
                fill(255, 182, 193, 220);
                noStroke();
                ellipse(0, 0, enlargedSize, enlargedSize);
                
                // 添加漸層效果
                let gradient = drawingContext.createRadialGradient(0, 0, 0, 0, 0, enlargedSize/2);
                gradient.addColorStop(0, 'rgba(255, 192, 203, 0.8)');
                gradient.addColorStop(1, 'rgba(255, 182, 193, 0.2)');
                drawingContext.fillStyle = gradient;
                ellipse(0, 0, enlargedSize, enlargedSize);
            }
        } catch (error) {
            console.error('桃子繪製錯誤:', error);
            // 發生錯誤時使用簡單的圓形
            fill(255, 182, 193, 220);
            noStroke();
            ellipse(0, 0, enlargedSize, enlargedSize);
        }
        
        pop();
        
        // 切割次數顯示
        if (sliceCountDisplay.alpha > 0) {
            try {
                push();
                
                // 計算跳動效果
                let jumpScale = 1.0;
                if (sliceCountDisplay.alpha > 0.7) {
                    jumpScale = 1.0 + (sliceCountDisplay.alpha - 0.7) * 1.5;
                }
                
                // 每5次切割時的特效
                if (peachSliceCount > 0 && peachSliceCount % 5 === 0) {
                    const pulseEffect = sin(frameCount * 0.2) * 0.1;
                    jumpScale += pulseEffect;
                    drawingContext.shadowBlur = 30 + pulseEffect * 100;
                }
                
                // 將位置調整到桃子下方
                translate(width/2, height/2 + peachPosition.size * 1.2);
                scale(jumpScale);
                
                // 主要文字 - 使用金色系
                textAlign(CENTER, CENTER);
                textSize(100);
                textFont('Noto Serif JP');
                
                // 計算文字透明度
                let textAlpha = sliceCountDisplay.alpha * 255;
                
                // 外發光效果 - 金色
                drawingContext.shadowBlur = 30;
                drawingContext.shadowColor = 'rgba(255, 215, 0, 0.6)';
                
                // 深色描邊
                strokeWeight(8);
                stroke(30, 30, 30, textAlpha * 0.8);
                fill(255, 215, 0, textAlpha);
                text(sliceCountDisplay.text, 0, 0);
                
                // 內層明亮文字
                strokeWeight(0);
                fill(255, 223, 0, textAlpha);
                text(sliceCountDisplay.text, 0, 0);
                
                // 額外的光暈效果
                if (peachSliceCount > 0 && peachSliceCount % 5 === 0) {
                    drawingContext.shadowBlur = 40;
                    drawingContext.shadowColor = 'rgba(255, 215, 0, 0.5)';
                    fill(255, 255, 200, textAlpha * 0.7);
                    text(sliceCountDisplay.text, 0, 0);
                }
                
                sliceCountDisplay.alpha -= 0.015;
                
                pop();
            } catch (error) {
                console.error('切割次數顯示錯誤:', error);
            }
        }

        // 倒數計時器
        try {
            push();
            
            let timeLeft = Math.ceil(peachTimer);
            let isUrgent = timeLeft <= 3;
            
            // 位置調整
            let timerX = width - 200;
            let timerY = 120;
            
            // 外框效果
            strokeWeight(3);
            stroke(0);
            fill(255, 255, 255, 20);
            rect(timerX - 100, timerY - 50, 200, 100, 15);
            
            // 內框陰影
            drawingContext.shadowBlur = 10;
            drawingContext.shadowColor = 'rgba(0, 0, 0, 0.3)';
            strokeWeight(2);
            stroke(255, 255, 255, 40);
            noFill();
            rect(timerX - 95, timerY - 45, 190, 90, 12);
            
            // 時間文字
            textAlign(CENTER, CENTER);
            textSize(72);
            textFont('Noto Serif JP');
            
            if (isUrgent) {
                drawingContext.shadowBlur = 20;
                drawingContext.shadowColor = 'rgba(255, 69, 0, 0.6)';
                
                const flashIntensity = sin(frameCount * 0.3) * 0.3 + 0.7;
                
                strokeWeight(6);
                stroke(30, 30, 30, 255 * flashIntensity);
                fill(255, 69, 0, 255 * flashIntensity);
                text(timeLeft + '秒', timerX, timerY);
                
                strokeWeight(0);
                fill(255, 99, 71, 255 * flashIntensity);
                text(timeLeft + '秒', timerX, timerY);
                
                drawingContext.shadowBlur = 30;
                drawingContext.shadowColor = 'rgba(255, 0, 0, 0.4)';
                fill(255, 69, 0, 128 * flashIntensity);
                text(timeLeft + '秒', timerX + 1, timerY + 1);
            } else {
                drawingContext.shadowBlur = 15;
                drawingContext.shadowColor = 'rgba(218, 165, 32, 0.4)';
                
                strokeWeight(6);
                stroke(30, 30, 30, 200);
                fill(218, 165, 32);
                text(timeLeft + '秒', timerX, timerY);
                
                strokeWeight(0);
                fill(255, 215, 0);
                text(timeLeft + '秒', timerX, timerY);
            }
            
            pop();
        } catch (error) {
            console.error('倒數計時器顯示錯誤:', error);
        }
    }
    
    // 繪製其他遊戲物件
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
    const fingerIndicator = document.querySelector('.finger-indicator');
    const sliceTrailElement = document.querySelector('.slice-trail');
    
    // 更新手指指示器
    if (fingerPositions.length > 0) {
        fingerIndicator.style.display = 'block';
        fingerIndicator.style.left = fingerPositions[0].x + 'px';
        fingerIndicator.style.top = fingerPositions[0].y + 'px';
    } else {
        fingerIndicator.style.display = 'none';
    }

    // 只在遊戲進行中顯示切割軌跡
    if (handTrackingMode === 'playing' && sliceTrail.length > 1) {
        // 清除現有的切割軌跡
        while (sliceTrailElement.firstChild) {
            sliceTrailElement.removeChild(sliceTrailElement.firstChild);
        }

        // 創建新的切割軌跡
        for (let i = 0; i < sliceTrail.length - 1; i++) {
            const slice1 = sliceTrail[i];
            const slice2 = sliceTrail[i + 1];
            
            const trail = document.createElement('div');
            trail.className = 'trail-segment';
            
            // 計算線段角度和長度
            const dx = slice2.pos.x - slice1.pos.x;
            const dy = slice2.pos.y - slice1.pos.y;
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            // 設置線段樣式
            const alpha = map(slice1.life, 0, TRAIL_LENGTH, 0, 1);
            const thickness = map(slice1.life, 0, TRAIL_LENGTH, 2, 8);
            const hue = map(i, 0, sliceTrail.length, 0, 60);
            
            trail.style.position = 'absolute';
            trail.style.left = slice1.pos.x + 'px';
            trail.style.top = slice1.pos.y + 'px';
            trail.style.width = length + 'px';
            trail.style.height = thickness + 'px';
            trail.style.background = `hsla(${hue}, 100%, 50%, ${alpha})`;
            trail.style.transform = `rotate(${angle}deg)`;
            trail.style.transformOrigin = '0 50%';
            trail.style.borderRadius = '2px';
            trail.style.boxShadow = `0 0 10px hsla(${hue}, 100%, 50%, ${alpha * 0.5})`;
            
            sliceTrailElement.appendChild(trail);
        }
    } else {
        // 清除切割軌跡
        while (sliceTrailElement.firstChild) {
            sliceTrailElement.removeChild(sliceTrailElement.firstChild);
        }
    }
}

function lineCircleIntersect(lineStart, lineEnd, circleCenter, radius) {
    const d = dist(lineStart.x, lineStart.y, lineEnd.x, lineEnd.y);
    if (d === 0) return false;
    
    // 增加判定範圍，使切割更容易
    const expandedRadius = radius * 1.5;
    
    const dot = (((circleCenter.x - lineStart.x) * (lineEnd.x - lineStart.x)) + 
                 ((circleCenter.y - lineStart.y) * (lineEnd.y - lineStart.y))) / (d * d);
    
    const closestX = lineStart.x + (dot * (lineEnd.x - lineStart.x));
    const closestY = lineStart.y + (dot * (lineEnd.y - lineStart.y));
    
    // 放寬判定條件
    if (dot < -0.2 || dot > 1.2) {
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
    
    if (isPaused) {
        console.log('顯示暫停選單');
        pauseMenu.classList.remove('hidden');
        // 記錄暫停開始時間
        pauseStartTime = millis();
        // 暫停遊戲背景音樂
        if (bgm && isBgmPlaying) {
            bgm.pause();
        }
        // 播放暫停背景音樂
        if (bgm) {
            bgm.loop();
            isBgmPlaying = true;
        }
        noLoop();  // 停止遊戲循環
    } else {
        console.log('隱藏暫停選單');
        pauseMenu.classList.add('hidden');
        // 計算總暫停時間
        if (pauseStartTime > 0) {
            totalPausedTime += millis() - pauseStartTime;
            pauseStartTime = 0;
        }
        // 恢復遊戲背景音樂
        if (bgm && isBgmPlaying) {
            bgm.play();
        }
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
        ruleBtn.onclick = () => {
            if (clickSound) clickSound.play();
            ruleModal.classList.remove('hidden');
        };
        closeRule.onclick = () => {
            if (clickSound) clickSound.play();
            ruleModal.classList.add('hidden');
        };
    }

    const startBtn = document.getElementById('startButton');
    if(startBtn) {
        startBtn.onclick = () => {
            if (clickSound) clickSound.play();
            document.getElementById('startScreen').classList.add('hidden');
            document.getElementById('levelSelect').classList.remove('hidden');
            updateLevelButtons();
        };
    }

    // 初始化時更新關卡按鈕
    updateLevelButtons();

    const restartBtn = document.getElementById('restartButton');
    if(restartBtn) {
        restartBtn.onclick = () => {
            if (clickSound) clickSound.play();
            restartGame();
        };
    }

    const backToLevelBtn = document.getElementById('backToLevelSelect');
    if(backToLevelBtn) {
        backToLevelBtn.onclick = () => {
            if (clickSound) clickSound.play();
            
            // 停止遊戲背景音樂
            if (bgm && isBgmPlaying) {
                bgm.stop();
                isBgmPlaying = false;
            }
            
            // 播放選單音樂
            if (menuMusic && !isMenuMusicPlaying) {
                menuMusic.loop();
                isMenuMusicPlaying = true;
            }
            
            document.getElementById('gameOverScreen').classList.add('hidden');
            document.getElementById('levelSelect').classList.remove('hidden');
            updateLevelButtons();
        };
    }

    const exitLevelBtn = document.getElementById('exitLevelSelect');
    if(exitLevelBtn) {
        exitLevelBtn.onclick = () => {
            if (clickSound) clickSound.play();
            document.getElementById('levelSelect').classList.add('hidden');
            document.getElementById('startScreen').classList.remove('hidden');
        };
    }

    const nextLevelBtn = document.getElementById('nextLevelButton');
    if(nextLevelBtn) {
        nextLevelBtn.onclick = () => {
            if (clickSound) clickSound.play();
            level++;
            document.getElementById('gameOverScreen').classList.add('hidden');
            document.getElementById('levelSelect').classList.remove('hidden');
            updateLevelButtons();
        };
    }

    const resumeBtn = document.getElementById('resumeButton');
    const restartFromPauseBtn = document.getElementById('restartFromPause');
    const exitToMenuBtn = document.getElementById('exitToMenu');

    if (resumeBtn) {
        resumeBtn.onclick = () => {
            if (clickSound) clickSound.play();
            togglePause();
        };
    }

    if (restartFromPauseBtn) {
        restartFromPauseBtn.onclick = () => {
            if (clickSound) clickSound.play();
            isPaused = false;
            loop();
            document.getElementById('pauseMenu').classList.add('hidden');
            restartGame();
        };
    }

    if (exitToMenuBtn) {
        exitToMenuBtn.onclick = () => {
            if (clickSound) clickSound.play();
            isPaused = false;
            loop();
            
            // 停止遊戲背景音樂
            if (bgm && isBgmPlaying) {
                bgm.stop();
                isBgmPlaying = false;
            }
            
            // 播放選單音樂
            if (menuMusic && !isMenuMusicPlaying) {
                menuMusic.loop();
                isMenuMusicPlaying = true;
            }
            
            // 隱藏所有遊戲 UI 元素
            const uiElements = [
                'pauseMenu',
                'gameStats',
                'heartsContainer',
                'timerContainer',
                'comboIndicator',
                'levelIndicator',
                'peachOverlay',
                'peachTimer',
                'peachCounter',
                'peachBonus'
            ];
            
            uiElements.forEach(elementId => {
                const element = document.getElementById(elementId);
                if (element) {
                    element.classList.add('hidden');
                }
            });
            
            document.getElementById('levelSelect').classList.remove('hidden');
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

    const retryButton = document.getElementById('retryButton');
    const backToMenuButton = document.getElementById('backToMenuButton');
    
    if (retryButton) {
        retryButton.onclick = () => {
            if (clickSound) clickSound.play();
            document.getElementById('deathScreen').classList.remove('show');
            startGame();
        };
    }
    
    if (backToMenuButton) {
        backToMenuButton.onclick = () => {
            if (clickSound) clickSound.play();
            document.getElementById('deathScreen').classList.remove('show');
            document.getElementById('levelSelect').classList.remove('hidden');
            gameState = 'start';
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
        const elapsedTime = millis() - hurtTimer;
        const alpha = map(elapsedTime, 0, hurtDuration, 255, 0);
        
        if (alpha > 0) {
            push();
            
            // 紅色閃爍效果
            const flashIntensity = sin(elapsedTime * 0.02) * 0.5 + 0.5;
            stroke(255, 0, 0, alpha * flashIntensity);
            strokeWeight(20);
            noFill();
            rect(0, 0, width, height);
            
            // 添加放射狀的紅色光暈
            const gradientAlpha = alpha * 0.5;
            for (let i = 0; i < 4; i++) {
                const gradSize = 100 + i * 50;
                const gradAlpha = gradientAlpha * (1 - i / 4);
                drawingContext.shadowBlur = gradSize;
                drawingContext.shadowColor = `rgba(255, 0, 0, ${gradAlpha / 255})`;
                rect(0, 0, width, height);
            }
            
            pop();
        } else {
            isHurt = false;
        }
    }
}

function drawHands() {
    if (showHands) {
        const elapsedTime = millis() - handShowTimer;
        const alpha = map(elapsedTime, 0, handShowDuration, 255, 0);
        
        if (alpha > 0) {
            push();
            
            // 計算手部縮放和位置效果
            const scaleProgress = min(1, elapsedTime / 150);
            const initialScale = 0.5;
            const targetScale = 1.2;
            const currentScale = lerp(initialScale, targetScale, scaleProgress);
            
            // 計算Z軸效果（透視感）
            const zProgress = min(1, elapsedTime / 200);
            const zEffect = 1 + sin(zProgress * PI) * 0.3;
            
            tint(255, alpha);
            
            // 左手 - 調整位置確保對稱
            push();
            translate(width * 0.25, height * 0.4); // 從 0.2 改為 0.25
            scale(currentScale * zEffect);
            if (leftHandImage) {
                imageMode(CENTER);
                // 添加動態模糊效果
                if (elapsedTime < 200) {
                    drawingContext.shadowBlur = 20;
                    drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)';
                }
                image(leftHandImage, 0, 0, 300, 300);
            }
            pop();
            
            // 右手 - 調整位置確保對稱
            push();
            translate(width * 0.75, height * 0.4); // 從 0.8 改為 0.75
            scale(currentScale * zEffect);
            if (rightHandImage) {
                imageMode(CENTER);
                // 添加動態模糊效果
                if (elapsedTime < 200) {
                    drawingContext.shadowBlur = 20;
                    drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)';
                }
                image(rightHandImage, 0, 0, 300, 300);
            }
            pop();
            
            // 添加螢幕邊緣的紅色暈染效果
            if (elapsedTime < 300) {
                const edgeAlpha = map(elapsedTime, 0, 300, 100, 0);
                drawingContext.shadowBlur = 50;
                drawingContext.shadowColor = `rgba(255, 0, 0, ${edgeAlpha / 255})`;
                noFill();
                strokeWeight(30);
                stroke(255, 0, 0, edgeAlpha);
                rect(0, 0, width, height);
            }
            
            pop();
        } else {
            showHands = false;
        }
    }
}

function drawHearts() {
    const heartsContainer = document.getElementById('heartsContainer');
    if (!heartsContainer) return;

    heartsContainer.innerHTML = '';
    
    for (let i = 0; i < 3; i++) {
        const heartDiv = document.createElement('div');
        if (i < lives) {
            heartDiv.innerHTML = '❤️';
        } else {
            heartDiv.innerHTML = '🖤';
        }
        heartsContainer.appendChild(heartDiv);
    }
}

function loseLife() {
    if (lives > 0) {
        lives--;
        lastHeartLostTime = millis();
        // 觸發畫面震動
        screenShakeTime = millis();
        screenShakeIntensity = 10;
        
        // 播放受傷音效
        if (hurtSound) hurtSound.play();
        
        updateStats();
    }
    
    if (lives <= 0) {
        showDeathScreen();
    }
}

function showDeathScreen() {
    gameState = 'death';
    
    // 不要停止遊戲循環，讓手指追蹤繼續運作
    // noLoop();  // 移除這行，讓遊戲循環繼續運行
    
    // 停止背景音樂並播放失敗音效
    if (bgm && isBgmPlaying) {
        bgm.stop();
        isBgmPlaying = false;
    }
    
    // 開始播放選單音樂
    if (menuMusic && !isMenuMusicPlaying) {
        menuMusic.loop();
        isMenuMusicPlaying = true;
    }
    
    if (failSound) failSound.play();
    
    // 隱藏遊戲UI
    document.getElementById('gameStats').classList.add('hidden');
    document.getElementById('heartsContainer').classList.add('hidden');
    document.getElementById('timerContainer').classList.add('hidden');
    document.getElementById('comboIndicator').classList.add('hidden');
    
    // 顯示死亡畫面
    const deathScreen = document.getElementById('deathScreen');
    deathScreen.classList.add('show');
    
    // 添加血濺效果
    const splatter = document.createElement('div');
    splatter.className = 'splatter';
    document.getElementById('gameContainer').appendChild(splatter);
    
    // 移除血濺效果
    setTimeout(() => {
        splatter.remove();
    }, 1000);
}

function checkButtonHover(x, y) {
    const currentTime = millis();
    // 獲取所有可見的按鈕，包括死亡畫面的按鈕
    const buttons = document.querySelectorAll('button:not(.hidden), .death-screen.show button');
    let isHoveringAnyButton = false;

    buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        // 增加判定範圍
        const expandedRect = {
            left: rect.left - 10,
            right: rect.right + 10,
            top: rect.top - 10,
            bottom: rect.bottom + 10
        };
        
        if (x >= expandedRect.left && x <= expandedRect.right && 
            y >= expandedRect.top && y <= expandedRect.bottom) {
            isHoveringAnyButton = true;
            
            if (hoveredButton !== button) {
                // 新的按鈕被懸停
                if (hoveredButton) {
                    hoveredButton.classList.remove('loading');
                }
                hoveredButton = button;
                buttonHoverStartTime = currentTime;
                button.classList.add('loading');
            } else if (currentTime - buttonHoverStartTime >= BUTTON_HOVER_DURATION) {
                // 懸停時間達到，觸發按鈕點擊
                if (clickSound) clickSound.play();
                button.click();
                resetButtonHover();
            }
        }
    });

    if (!isHoveringAnyButton && hoveredButton) {
        resetButtonHover();
    }
}

function resetButtonHover() {
    if (hoveredButton) {
        hoveredButton.classList.remove('loading');
        hoveredButton = null;
    }
    buttonHoverStartTime = 0;
}

// 更新 CSS 樣式
const style = document.createElement('style');
style.textContent = `
    .loading-percentage {
        font-size: 36px;
        font-weight: bold;
        color: #FFD700;
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        display: block;
        margin: 10px 0;
    }
    .detection-status {
        font-size: 18px;
        color: #4a90e2;
        display: block;
        margin-top: 5px;
    }
    .time-left {
        font-size: 16px;
        color: #ffa500;
        display: block;
        margin-top: 5px;
    }
`;
document.head.appendChild(style);
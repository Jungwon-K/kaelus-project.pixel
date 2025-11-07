// --- 캔버스 및 UI 요소 가져오기 ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI 요소
const statMoney = document.getElementById('statMoney');
const statMental = document.getElementById('statMental');
const statPrestige = document.getElementById('statPrestige');
const statFortitude = document.getElementById('statFortitude');
const statWillpower = document.getElementById('statWillpower');
const statLuck = document.getElementById('statLuck');
const statGrit = document.getElementById('statGrit');
const messageLog = document.getElementById('messageLog');
const statDay = document.getElementById('statDay'); // 추가
const statActions = document.getElementById('statActions'); // 추가

// 게임 오버 모달 요소
const gameOverModal = document.getElementById('gameOverModal');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverMessage = document.getElementById('gameOverMessage');
const restartButton = document.getElementById('restartButton');

// --- 게임 설정 ---
const TILE_SIZE = 40; // 타일 크기 (픽셀)
const PLAYER_SPEED = 5; // 플레이어 이동 속도
const DAILY_LIVING_COST = 20; // 일일 생활비
const BASE_ACTIONS = 2; // 기본 행동력

// --- 게임 상태 ---
let player;
let playerStats;
let gameObjects;
let keys;
let isGameOver = false;
let gameLoopId;

// --- 게임 초기화 함수 ---
function initGame() {
    isGameOver = false;
    gameOverModal.classList.add('hidden');

    player = {
        x: TILE_SIZE * 5,
        y: TILE_SIZE * 5,
        width: TILE_SIZE,
        height: TILE_SIZE,
        color: '#00FFFF', // 플레이어 색상 (시안)
        name: '니힐'
    };

    playerStats = {
        money: 100,
        mental: 80,
        maxMental: 100,
        prestige: 5,
        fortitude: 5,
        willpower: 5,
        luck: 5,
        grit: 5,
        gameDay: 1,
        // 근성(Grit) 스탯 5당 행동력 1 증가 (기본 2)
        actionsLeft: BASE_ACTIONS + Math.floor(5 / 5),
    };
    
    // playerStats.grit을 기반으로 actionsLeft 재계산
    playerStats.actionsLeft = BASE_ACTIONS + Math.floor(playerStats.grit / 5);

    gameObjects = [
        { 
            x: TILE_SIZE * 2, y: TILE_SIZE * 2, width: TILE_SIZE * 3, height: TILE_SIZE * 2, 
            color: '#8B4513', name: '집 (휴식/E)', 
            interaction: () => restAtHome()
        },
        { 
            x: TILE_SIZE * 10, y: TILE_SIZE * 3, width: TILE_SIZE * 5, height: TILE_SIZE * 4, 
            color: '#FF00FF', name: '하층 카지노 (E)',
            interaction: () => logMessage("자칼이 운영하는 카지노입니다. [미구현]", "casino")
        },
        { 
            x: TILE_SIZE * 3, y: TILE_SIZE * 10, width: TILE_SIZE * 4, height: TILE_SIZE * 3, 
            color: '#708090', name: '채굴장 (노동/E)',
            interaction: () => performLabor()
        },
        { 
            x: TILE_SIZE * 15, y: TILE_SIZE * 10, width: TILE_SIZE * 3, height: TILE_SIZE * 3, 
            color: '#FFFFFF', name: '니콜라 건물 (E)',
            interaction: () => logMessage("과시(Prestige)가 부족하여 입장할 수 없습니다.", "error")
        }
    ];

    keys = {
        w: false, a: false, s: false, d: false, e: false
    };

    // 메시지 로그 초기화
    messageLog.innerHTML = '';
    logMessage(`[${playerStats.gameDay}일차] 하층 구역에 오신 것을 환영합니다.`);
    logMessage("채굴장에서 [E]를 눌러 돈을 버세요.");
    logMessage("집에서 [E]를 눌러 휴식하고 하루를 마감합니다.");

    updateUI();
}


// --- 메시지 로깅 함수 ---
function logMessage(message, type = "normal") {
    const p = document.createElement('p');
    p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    
    if (type === "error") p.style.color = "#FF6B6B";
    if (type === "info") p.style.color = "#6BFFB8";
    if (type === "casino") p.style.color = "#FFD700";
    if (type === "work") p.style.color = "#AAAAAA";

    messageLog.appendChild(p);
    messageLog.scrollTop = messageLog.scrollHeight; // 자동 스크롤
}

// --- 입력 처리 ---
window.addEventListener('keydown', (e) => {
    if (isGameOver) return; // 게임 오버 시 입력 무시
    switch(e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
            keys.w = true;
            break;
        case 'a':
        case 'arrowleft':
            keys.a = true;
            break;
        case 's':
        case 'arrowdown':
            keys.s = true;
            break;
        case 'd':
        case 'arrowright':
            keys.d = true;
            break;
        case 'e':
            keys.e = true;
            handleInteraction(); // E 키를 눌렀을 때 상호작용 시도
            break;
    }
});

window.addEventListener('keyup', (e) => {
    if (isGameOver) return;
    switch(e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
            keys.w = false;
            break;
        case 'a':
        case 'arrowleft':
            keys.a = false;
            break;
        case 's':
        case 'arrowdown':
            keys.s = false;
            break;
        case 'd':
        case 'arrowright':
            keys.d = false;
            break;
        case 'e':
            keys.e = false;
            break;
    }
});

// --- 충돌 감지 함수 ---
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// --- 상호작용 처리 함수 ---
function handleInteraction() {
    // 상호작용을 위한 감지 영역 (플레이어보다 약간 크게)
    const interactionZone = {
        x: player.x - 10,
        y: player.y - 10,
        width: player.width + 20,
        height: player.height + 20
    };

    let interacted = false;
    for (const obj of gameObjects) {
        if (checkCollision(interactionZone, obj) && obj.interaction) {
            obj.interaction();
            interacted = true;
            break; // 한 번에 하나의 오브젝트와만 상호작용
        }
    }
    if (interacted) {
        keys.e = false; // 상호작용 후 키 상태 초기화 (연속 입력 방지)
    }
}

// --- [신규] 핵심 로직 함수 ---

function performLabor() {
    if (playerStats.actionsLeft <= 0) {
        logMessage("너무 피곤해서 더 이상 일할 수 없습니다.", "error");
        return;
    }

    playerStats.actionsLeft--;
    const earnings = 20 + playerStats.grit; // 근성에 따라 수입 증가
    const mentalDrain = 10 - playerStats.fortitude; // 정신력 스탯에 따라 피로도 감소

    playerStats.money += earnings;
    playerStats.mental -= mentalDrain;

    logMessage(`[노동] 채굴을 완료했습니다. ${earnings}G 획득.`, "work");
    logMessage(`[노동] 정신력이 ${mentalDrain} 감소했습니다.`, "error");

    updateUI();
    checkGameOver(); // 정신력이 0이 되었는지 확인
}

function restAtHome() {
    logMessage("집에서 휴식하며 하루를 마감합니다.", "info");
    
    // 의지력(Willpower)에 따라 정신력 회복
    const mentalRecovery = 15 + playerStats.willpower;
    playerStats.mental = Math.min(playerStats.maxMental, playerStats.mental + mentalRecovery);
    logMessage(`[휴식] 정신력이 ${mentalRecovery} 회복되었습니다.`, "info");

    // 다음 날로 이동
    nextDay();
}

function nextDay() {
    playerStats.gameDay++;
    logMessage(`[${playerStats.gameDay}일차] 새로운 날이 밝았습니다.`, "normal");

    // 생활비 지출
    playerStats.money -= DAILY_LIVING_COST;
    logMessage(`[지출] 일일 생활비 ${DAILY_LIVING_COST}G가 지출되었습니다.`, "error");

    // 행동력 초기화 (근성 스탯 기반)
    playerStats.actionsLeft = BASE_ACTIONS + Math.floor(playerStats.grit / 5);

    updateUI();
    checkGameOver(); // 파산했는지 확인
}

function checkGameOver() {
    if (isGameOver) return;

    if (playerStats.money < 0) {
        showGameOverModal("파산", "자산이 0 미만이 되었습니다. 당신은 도시에서 추방당했습니다.");
    } else if (playerStats.mental <= 0) {
        showGameOverModal("폐인", "정신력이 0이 되었습니다. 당신은 모든 의지를 잃었습니다.");
    }
}

function showGameOverModal(title, message) {
    isGameOver = true;
    gameOverTitle.textContent = title;
    gameOverMessage.textContent = message;
    gameOverModal.classList.remove('hidden');
    
    // 기존 게임 루프 중지 (선택적)
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
    }
}

restartButton.addEventListener('click', () => {
    initGame(); // 게임 초기화
    gameLoop(); // 새 게임 루프 시작
});


// --- 게임 로직 업데이트 ---
function update() {
    if (isGameOver) return; // 게임 오버 시 업데이트 중지

    let nextX = player.x;
    let nextY = player.y;

    // 1. 플레이어 이동 입력 처리
    if (keys.w) nextY -= PLAYER_SPEED;
    if (keys.s) nextY += PLAYER_SPEED;
    if (keys.a) nextX -= PLAYER_SPEED;
    if (keys.d) nextX += PLAYER_SPEED;

    // 2. 캔버스 경계 충돌
    if (nextX < 0) nextX = 0;
    if (nextX + player.width > canvas.width) nextX = canvas.width - player.width;
    if (nextY < 0) nextY = 0;
    if (nextY + player.height > canvas.height) nextY = canvas.height - player.height;

    // 3. 오브젝트 충돌 확인
    let potentialMove = { ...player, x: nextX, y: nextY };
    let collision = false;
    for (const obj of gameObjects) {
        if (checkCollision(potentialMove, obj)) {
            collision = true;
            break;
        }
    }
    
    // 4. 충돌하지 않았을 때만 위치 업데이트
    if (!collision) {
        player.x = nextX;
        player.y = nextY;
    }

    // 5. UI 업데이트
    updateUI();
}

// --- UI 업데이트 함수 ---
function updateUI() {
    statDay.textContent = `${playerStats.gameDay}일차`; // 추가
    statActions.textContent = playerStats.actionsLeft; // 추가
    statMoney.textContent = playerStats.money;
    statMental.textContent = `${playerStats.mental} / ${playerStats.maxMental}`;
    statPrestige.textContent = playerStats.prestige;
    statFortitude.textContent = playerStats.fortitude;
    statWillpower.textContent = playerStats.willpower;
    statLuck.textContent = playerStats.luck;
    statGrit.textContent = playerStats.grit;
}

// --- 렌더링 (그리기) ---
function draw() {
    // 캔버스 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. 게임 오브젝트(건물 등) 그리기
    for (const obj of gameObjects) {
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        
        // 오브젝트 이름 표시
        ctx.fillStyle = 'white';
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';
        // 이름이 너무 길면 줄바꿈 (간단하게)
        const nameParts = obj.name.split('(');
        ctx.fillText(nameParts[0], obj.x + obj.width / 2, obj.y - 18);
        if (nameParts[1]) {
             ctx.fillText(`(${nameParts[1]}`, obj.x + obj.width / 2, obj.y - 6);
        }
    }
    
    // 2. 플레이어 그리기
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // 3. 플레이어 이름 표시
    ctx.fillStyle = 'white';
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(player.name, player.x + player.width / 2, player.y - 8);
}

// --- 메인 게임 루프 ---
function gameLoop() {
    if (isGameOver) return; // 게임 오버 시 루프 중단
    update(); // 로직 업데이트
    draw();   // 화면 그리기
    gameLoopId = requestAnimationFrame(gameLoop); // 다음 프레임 요청
}

// --- 게임 시작 ---
document.addEventListener('DOMContentLoaded', (event) => {
    initGame(); // 게임 초기화 함수 호출
    gameLoop(); // 게임 루프 시작
});
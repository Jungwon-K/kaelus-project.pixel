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

// --- 게임 설정 ---
const TILE_SIZE = 40; // 타일 크기 (픽셀)
const PLAYER_SPEED = 5; // 플레이어 이동 속도

// --- 게임 상태 ---
let player = {
    x: TILE_SIZE * 5,
    y: TILE_SIZE * 5,
    width: TILE_SIZE,
    height: TILE_SIZE,
    color: '#00FFFF', // 플레이어 색상 (시안)
    name: '니힐'
};

// 플레이어 스탯 (기획서 기반)
let playerStats = {
    money: 100,
    mental: 80,
    maxMental: 100,
    prestige: 5,
    fortitude: 5,
    willpower: 5,
    luck: 5,
    grit: 5,
};

// 게임 월드 오브젝트 (건물 등)
// 기획서 기반으로 하층 구역의 주요 건물 배치
const gameObjects = [
    { 
        x: TILE_SIZE * 2, y: TILE_SIZE * 2, width: TILE_SIZE * 3, height: TILE_SIZE * 2, 
        color: '#8B4513', name: '집 (안전지대)', 
        interaction: () => logMessage("집에 들어왔습니다. 정신력이 약간 회복됩니다.", "info")
    },
    { 
        x: TILE_SIZE * 10, y: TILE_SIZE * 3, width: TILE_SIZE * 5, height: TILE_SIZE * 4, 
        color: '#FF00FF', name: '하층 구역 카지노',
        interaction: () => logMessage("자칼이 운영하는 카지노입니다. [미구현]", "casino")
    },
    { 
        x: TILE_SIZE * 3, y: TILE_SIZE * 10, width: TILE_SIZE * 4, height: TILE_SIZE * 3, 
        color: '#708090', name: '채굴장 (노동)',
        interaction: () => logMessage("채굴 미니게임을 시작합니다. [미구현]", "work")
    },
    { 
        x: TILE_SIZE * 15, y: TILE_SIZE * 10, width: TILE_SIZE * 3, height: TILE_SIZE * 3, 
        color: '#FFFFFF', name: '니콜라 건물 (중층)',
        interaction: () => logMessage("과시(Prestige)가 부족하여 입장할 수 없습니다.", "error")
    }
];

// 입력 키 상태
let keys = {
    w: false, a: false, s: false, d: false, e: false
};

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


// --- 게임 로직 업데이트 ---
function update() {
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
        ctx.fillText(obj.name, obj.x + obj.width / 2, obj.y - 8);
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
    update(); // 로직 업데이트
    draw();   // 화면 그리기
    requestAnimationFrame(gameLoop); // 다음 프레임 요청
}

// --- 게임 시작 ---
// DOM이 완전히 로드된 후에 게임을 시작합니다.
document.addEventListener('DOMContentLoaded', (event) => {
    logMessage("게임을 시작합니다. 행운을 빕니다.", "info");
    gameLoop(); // 게임 루프 시작
});
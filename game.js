// game.js: 메인 게임 루프, 렌더링, 입력 처리 등 핵심 로직
import { TILE_SIZE, BASE_ACTIONS, PLAYER_SPEED } from './config.js';
import { 
    player, playerStats, keys, gameObjects, 
    isGameOver, isModalOpen, gameLoopId, 
    setGameOver, setModalOpen, setGameLoopId, setGameObjects 
} from './state.js';
import { 
    canvas, ctx, logMessage, updateUI, 
    gameOverModal, slotMachineModal, spinButton, restartButton // restartButton import 추가
} from './ui.js';
import { performLabor, restAtHome, performSpin } from './actions.js';
import { openSlotMachine } from './ui.js';

/**
 * 게임 초기화
 */
export function initGame() {
    // ... (기존 initGame 내용과 동일) ...
    setGameOver(false);
    setModalOpen(false);
    gameOverModal.classList.add('hidden');
    slotMachineModal.classList.add('hidden');

    // 플레이어 상태 초기화
    Object.assign(player, {
        x: TILE_SIZE * 5, y: TILE_SIZE * 5,
        width: TILE_SIZE, height: TILE_SIZE,
        color: '#00FFFF', name: '니힐'
    });

    // 플레이어 스탯 초기화
    Object.assign(playerStats, {
        money: 100, mental: 80, maxMental: 100, prestige: 5,
        fortitude: 5, willpower: 5, luck: 5, grit: 5,
        gameDay: 1
    });
    playerStats.actionsLeft = BASE_ACTIONS + Math.floor(playerStats.grit / 5);

    // 게임 오브젝트 초기화
    setGameObjects([
        { 
            x: TILE_SIZE * 2, y: TILE_SIZE * 2, width: TILE_SIZE * 3, height: TILE_SIZE * 2, 
            color: '#8B4513', name: '집 (휴식/E)', 
            interaction: () => restAtHome()
        },
        { 
            x: TILE_SIZE * 10, y: TILE_SIZE * 3, width: TILE_SIZE * 5, height: TILE_SIZE * 4, 
            color: '#FF00FF', name: '하층 카지노 (E)',
            interaction: () => openSlotMachine()
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
    ]);

    // 키 상태 초기화
    Object.keys(keys).forEach(key => keys[key] = false);

    // 메시지 로그 초기화
    document.getElementById('messageLog').innerHTML = ''; 
    logMessage(`[${playerStats.gameDay}일차] 하층 구역에 오신 것을 환영합니다.`);
    logMessage("채굴장에서 [E]를 눌러 돈을 버세요.");
    logMessage("카지노에서 [E]를 눌러 도박을 하세요.");
    logMessage("집에서 [E]를 눌러 하루를 마감합니다.");

    updateUI();
}

/**
 * 충돌 감지
 */
function checkCollision(rect1, rect2) {
    // ... (기존과 동일) ...
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

/**
 * [E] 키 상호작용 처리
 */
export function handleInteraction() {
    // ... (기존과 동일) ...
    if (isModalOpen) return;

    const interactionZone = {
        x: player.x - 10, y: player.y - 10,
        width: player.width + 20, height: player.height + 20
    };

    let interacted = false;
    for (const obj of gameObjects) {
        if (checkCollision(interactionZone, obj) && obj.interaction) {
            obj.interaction();
            interacted = true;
            break; 
        }
    }
    if (interacted) {
        keys.e = false; 
    }
}

/**
 * 게임 오버 조건 확인
 */
// export function checkGameOver() { // 삭제 (actions.js로 이동)
//     ...
// }


/**
 * 게임 로직 업데이트 (1프레임)
 */
function update() {
    // ... (기존과 동일) ...
    if (isGameOver || isModalOpen) return;

    let nextX = player.x;
    let nextY = player.y;

    // 1. 이동
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
    
    // 4. 위치 업데이트
    if (!collision) {
        player.x = nextX;
        player.y = nextY;
    }
}

/**
 * 화면 그리기 (1프레임)
 */
function draw() {
    // ... (기존과 동일) ...
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. 게임 오브젝트(건물 등) 그리기
    for (const obj of gameObjects) {
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';
        const nameParts = obj.name.split('(');
        ctx.fillText(nameParts[0], obj.x + obj.width / 2, obj.y - 18);
        if (nameParts[1]) {
             ctx.fillText(`(${nameParts[1]}`, obj.x + obj.width / 2, obj.y - 6);
        }
    }
    
    // 2. 플레이어 그리기
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // 3. 플레이어 이름
    ctx.fillStyle = 'white';
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(player.name, player.x + player.width / 2, player.y - 8);
}

/**
 * 메인 게임 루프
 */
export function gameLoop() {
    if (isGameOver) { // isGameOver 상태를 확인하고 루프 중지
        if(gameLoopId) cancelAnimationFrame(gameLoopId);
        setGameLoopId(null);
        return; 
    }
    
    update();
    draw();
    
    const newLoopId = requestAnimationFrame(gameLoop);
    setGameLoopId(newLoopId);
}


// --- 입력 및 이벤트 리스너 설정 ---
// (기존 keydown, keyup 리스너는 동일)
window.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    if (isModalOpen) {
        if (e.key.toLowerCase() === 'e') e.preventDefault();
        return;
    }
    switch(e.key.toLowerCase()) {
        case 'w': case 'arrowup': keys.w = true; break;
        case 'a': case 'arrowleft': keys.a = true; break;
        case 's': case 'arrowdown': keys.s = true; break;
        case 'd': case 'arrowright': keys.d = true; break;
        case 'e':
            if (!keys.e) { 
                handleInteraction();
            }
            keys.e = true;
            break;
    }
});

window.addEventListener('keyup', (e) => {
    if (isGameOver) return;
    switch(e.key.toLowerCase()) {
        case 'w': case 'arrowup': keys.w = false; break;
        case 'a': case 'arrowleft': keys.a = false; break;
        case 's': case 'arrowdown': keys.s = false; break;
        case 'd': case 'arrowright': keys.d = false; break;
        case 'e': keys.e = false; break;
    }
});

// --- [신규] ui.js에서 이동해 온 리스너들 ---
spinButton.addEventListener('click', performSpin);

restartButton.addEventListener('click', () => {
    // game.js 내의 함수를 직접 호출
    initGame(); 
    gameLoop(); 
});
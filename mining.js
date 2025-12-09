import * as config from './config.js';
import { miningState, playerStats } from './state.js';
import { miningGrid, miningMoves, miningScore, openMiningModal, closeMiningModal, logMessage, updateUI } from './ui.js';
import { checkGameOver } from './actions.js';

// 미니게임 시작 함수
export function startMiningGame() {
    if (playerStats.actionsLeft <= 0) {
        logMessage("너무 피곤해서 작업을 시작할 수 없습니다.", "error");
        return;
    }

    // 상태 초기화
    miningState.score = 0;
    miningState.movesLeft = config.MINING_MAX_MOVES;
    
    // 그리드 초기화 (랜덤 광물 배치)
    miningState.grid = [];
    for (let r = 0; r < config.MINING_GRID_SIZE; r++) {
        const row = [];
        for (let c = 0; c < config.MINING_GRID_SIZE; c++) {
            row.push(getRandomBlockType());
        }
        miningState.grid.push(row);
    }

    // 행동력 즉시 소모
    playerStats.actionsLeft--;
    
    updateMiningUI();
    openMiningModal();
    logMessage("채굴 작업을 시작합니다.", "work");
}

function getRandomBlockType() {
    // 가중치 랜덤: 돌(0)이 가장 많이 나옴
    const rand = Math.random();
    if (rand < 0.5) return 0; // 50% 돌
    if (rand < 0.8) return 1; // 30% 구리
    if (rand < 0.95) return 2; // 15% 금
    return 3; // 5% 카일리슘
}

// UI 그리기
function updateMiningUI() {
    miningMoves.textContent = miningState.movesLeft;
    miningScore.textContent = miningState.score;
    miningGrid.innerHTML = ''; // 초기화

    for (let r = 0; r < config.MINING_GRID_SIZE; r++) {
        for (let c = 0; c < config.MINING_GRID_SIZE; c++) {
            const blockType = miningState.grid[r][c];
            const div = document.createElement('div');
            
            div.className = 'mining-block';
            if (blockType === -1) {
                div.classList.add('empty');
            } else {
                div.style.backgroundColor = config.MINING_COLORS[blockType];
                div.dataset.r = r;
                div.dataset.c = c;
                div.addEventListener('click', () => handleBlockClick(r, c));
            }
            miningGrid.appendChild(div);
        }
    }
}

// 블록 클릭 처리 (Flood Fill 알고리즘)
function handleBlockClick(r, c) {
    if (miningState.movesLeft <= 0) return;

    const targetType = miningState.grid[r][c];
    if (targetType === -1) return; // 빈 공간 클릭 무시

    // 연결된 같은 색 블록 찾기
    const connected = getConnectedBlocks(r, c, targetType);

    if (connected.length >= 2) {
        // 2개 이상이면 파괴
        miningState.movesLeft--;
        
        // 점수 계산 (개수 * 광물 가치)
        const blockValue = config.MINING_VALUES[targetType];
        const comboBonus = connected.length * 10; // 많이 터뜨릴수록 보너스
        const earnScore = (blockValue * connected.length) + comboBonus;
        miningState.score += earnScore;

        // 블록 제거 (-1로 변경)
        connected.forEach(pos => {
            miningState.grid[pos.r][pos.c] = -1;
        });

        // 중력 적용 (블록 떨어지기)
        applyGravity();

        // 횟수 종료 체크
        if (miningState.movesLeft <= 0) {
            endMiningGame();
        } else {
            updateMiningUI();
        }
    } else {
        // 흔들림 효과 등 피드백 줄 수 있음
        console.log("Not enough connected blocks");
    }
}

// 연결된 블록 찾기 (DFS)
function getConnectedBlocks(startR, startC, type) {
    const connected = [];
    const visited = new Set();
    const stack = [{r: startR, c: startC}];
    
    while (stack.length > 0) {
        const {r, c} = stack.pop();
        const key = `${r},${c}`;
        
        if (visited.has(key)) continue;
        visited.add(key);

        if (r < 0 || r >= config.MINING_GRID_SIZE || c < 0 || c >= config.MINING_GRID_SIZE) continue;
        if (miningState.grid[r][c] !== type) continue;

        connected.push({r, c});

        // 상하좌우 탐색
        stack.push({r: r+1, c: c});
        stack.push({r: r-1, c: c});
        stack.push({r: r, c: c+1});
        stack.push({r: r, c: c-1});
    }
    return connected;
}

// 중력 적용 및 새 블록 스폰
function applyGravity() {
    for (let c = 0; c < config.MINING_GRID_SIZE; c++) {
        let writeRow = config.MINING_GRID_SIZE - 1; // 바닥부터 채움
        
        // 1. 기존 블록 내리기
        for (let r = config.MINING_GRID_SIZE - 1; r >= 0; r--) {
            if (miningState.grid[r][c] !== -1) {
                miningState.grid[writeRow][c] = miningState.grid[r][c];
                if (writeRow !== r) miningState.grid[r][c] = -1; // 이동 후 원래 자리 비움
                writeRow--;
            }
        }
        
        // 2. 빈 공간(위쪽)에 새 블록 채우기
        while (writeRow >= 0) {
            miningState.grid[writeRow][c] = getRandomBlockType();
            writeRow--;
        }
    }
}

// 게임 종료 및 정산
function endMiningGame() {
    updateMiningUI(); // 마지막 상태 보여주기
    
    setTimeout(() => {
        closeMiningModal();
        
        // 보상 계산
        const bonusMoney = Math.floor(miningState.score / 100) * config.MINING_SCORE_MULTIPLIER;
        const totalEarnings = config.LABOR_EARNINGS_BASE + playerStats.grit + bonusMoney;
        const mentalDrain = Math.max(1, config.LABOR_MENTAL_DRAIN_BASE - playerStats.fortitude);

        playerStats.money += totalEarnings;
        playerStats.mental -= mentalDrain;

        logMessage(`[작업 종료] 채굴 완료!`, "work");
        logMessage(`기본급 ${config.LABOR_EARNINGS_BASE}G + 성과급 ${bonusMoney}G (점수: ${miningState.score})`, "info");
        logMessage(`정신력이 ${mentalDrain} 감소했습니다.`, "error");

        updateUI();
        checkGameOver();
    }, 1000); // 1초 뒤 종료
}
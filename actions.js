// actions.js: 플레이어의 상호작용 로직 (노동, 휴식, 도박)
import * as config from './config.js';
import { playerStats, isGameOver } from './state.js'; // isGameOver import 추가
import { 
    logMessage, updateUI, slotMessage, spinButton, 
    reel1, reel2, reel3, showGameOverModal // showGameOverModal import 추가
} from './ui.js';
// import { checkGameOver } from './game.js'; // 삭제 (순환 참조 원인)

// --- [신규] checkGameOver 함수를 game.js에서 여기로 이동 ---
/**
 * 게임 오버 조건 확인 (actions.js 내부에서 호출됨)
 */
function checkGameOver() {
    if (isGameOver) return;

    if (playerStats.money < 0) {
        showGameOverModal("파산", "자산이 0 미만이 되었습니다. 당신은 도시에서 추방당했습니다.");
    } else if (playerStats.mental <= 0) {
        showGameOverModal("폐인", "정신력이 0이 되었습니다. 당신은 모든 의지를 잃었습니다.");
    }
    
    // gameLoopId를 여기서 직접 제어할 수 없으므로,
    // showGameOverModal이 isGameOver=true로 설정하고,
    // game.js의 메인 루프가 isGameOver를 확인하고 멈추도록 합니다.
}

/**
 * [채굴장] 노동 수행 로직
 */
export function performLabor() {
    if (playerStats.actionsLeft <= 0) {
        logMessage("너무 피곤해서 더 이상 일할 수 없습니다.", "error");
        return;
    }

    playerStats.actionsLeft--;
    const earnings = config.LABOR_EARNINGS_BASE + playerStats.grit;
    const mentalDrain = Math.max(1, config.LABOR_MENTAL_DRAIN_BASE - playerStats.fortitude);

    playerStats.money += earnings;
    playerStats.mental -= mentalDrain;

    logMessage(`[노동] 채굴을 완료했습니다. ${earnings}G 획득.`, "work");
    logMessage(`[노동] 정신력이 ${mentalDrain} 감소했습니다.`, "error");

    updateUI();
    checkGameOver(); // 이제 이 파일 내의 함수를 호출
}

/**
 * [집] 휴식 및 하루 마감 로직
 */
export function restAtHome() {
    logMessage("집에서 휴식하며 하루를 마감합니다.", "info");
    
    const mentalRecovery = config.HOME_MENTAL_RECOVERY_BASE + playerStats.willpower;
    playerStats.mental = Math.min(playerStats.maxMental, playerStats.mental + mentalRecovery);
    logMessage(`[휴식] 정신력이 ${mentalRecovery} 회복되었습니다.`, "info");

    nextDay();
}

/**
 * 다음 날로 넘기는 로직
 */
export function nextDay() {
    playerStats.gameDay++;
    logMessage(`[${playerStats.gameDay}일차] 새로운 날이 밝았습니다.`, "normal");

    playerStats.money -= config.DAILY_LIVING_COST;
    logMessage(`[지출] 일일 생활비 ${config.DAILY_LIVING_COST}G가 지출되었습니다.`, "error");

    playerStats.actionsLeft = config.BASE_ACTIONS + Math.floor(playerStats.grit / 5);

    updateUI();
    checkGameOver(); // 이제 이 파일 내의 함수를 호출
}

/**
 * [카지노] 슬롯 머신 스핀 로직
 */
export function performSpin() {
    // 1. 조건 검사
    if (playerStats.actionsLeft <= 0) {
        slotMessage.textContent = "행동력이 부족합니다.";
        return;
    }
    if (playerStats.money < config.SLOT_BET_AMOUNT) {
        slotMessage.textContent = "자산(G)이 부족합니다.";
        return;
    }

    // 2. 비용 지불
    playerStats.actionsLeft--;
    playerStats.money -= config.SLOT_BET_AMOUNT;
    spinButton.disabled = true;
    slotMessage.textContent = "SPINNING...";
    updateUI();

    // 3. 릴 애니메이션
    let spinInterval = setInterval(() => {
        reel1.textContent = config.slotSymbols[Math.floor(Math.random() * config.slotSymbols.length)];
        reel2.textContent = config.slotSymbols[Math.floor(Math.random() * config.slotSymbols.length)];
        reel3.textContent = config.slotSymbols[Math.floor(Math.random() * config.slotSymbols.length)];
    }, 100);

    // 4. 결과 판정 (1초 후)
    setTimeout(() => {
        clearInterval(spinInterval);

        // 5. 승리 확률 계산 ('운' 스탯)
        const winChance = config.SLOT_WIN_CHANCE_BASE + (playerStats.luck * config.SLOT_WIN_CHANCE_LUCK_MOD);
        const isWinner = (Math.random() * 100) < winChance;

        let finalReels;

        if (isWinner) {
            // 승리
            finalReels = ['💰', '💰', '💰'];
            playerStats.money += config.SLOT_WIN_PRIZE;
            
            const mentalRecovery = config.SLOT_WIN_MENTAL_RECOVERY_BASE + Math.floor(playerStats.willpower / 2);
            playerStats.mental = Math.min(playerStats.maxMental, playerStats.mental + mentalRecovery);
            
            slotMessage.textContent = `승리! +${config.SLOT_WIN_PRIZE}G! (정신력 +${mentalRecovery})`;
            logMessage(`[도박 승리] ${config.SLOT_WIN_PRIZE}G 획득! 정신력 ${mentalRecovery} 회복.`, "info");

        } else {
            // 패배
            finalReels = ['💀', '🍒', '🍋'];
            
            const mentalLoss = Math.max(1, config.SLOT_LOSS_MENTAL_DRAIN_BASE - playerStats.fortitude);
            playerStats.mental -= mentalLoss;
            
            slotMessage.textContent = `패배... (정신력 -${mentalLoss})`;
            logMessage(`[도박 패배] 베팅 실패. 정신력 ${mentalLoss} 감소.`, "error");
        }

        reel1.textContent = finalReels[0];
        reel2.textContent = finalReels[1];
        reel3.textContent = finalReels[2];

        spinButton.disabled = false;
        updateUI();
        checkGameOver(); // 이제 이 파일 내의 함수를 호출

    }, 1000);
}
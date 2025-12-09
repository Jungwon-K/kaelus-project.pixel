import * as config from './config.js';
import { playerStats, isGameOver } from './state.js';
import { 
    logMessage, updateUI, slotMessage, spinButton, 
    reel1, reel2, reel3, showGameOverModal 
} from './ui.js';
// [신규] mining.js import
import { startMiningGame } from './mining.js';

/**
 * 게임 오버 조건 확인
 */
export function checkGameOver() { // export 추가 (mining.js에서 사용)
    if (isGameOver) return;

    if (playerStats.money < 0) {
        showGameOverModal("파산", "자산이 0 미만이 되었습니다. 당신은 도시에서 추방당했습니다.");
    } else if (playerStats.mental <= 0) {
        showGameOverModal("폐인", "정신력이 0이 되었습니다. 당신은 모든 의지를 잃었습니다.");
    }
}

/**
 * [신규] 자칼에게 보호비 지불 로직
 */
export function payProtection() {
    if (playerStats.protectionDays > 0) {
        logMessage(`아직 보호 기간이 ${playerStats.protectionDays}일 남았습니다.`, "info");
        return;
    }
    
    if (playerStats.money < config.PROTECTION_COST) {
        logMessage(`돈이 부족합니다. (필요: ${config.PROTECTION_COST}G)`, "error");
        return;
    }

    playerStats.money -= config.PROTECTION_COST;
    playerStats.protectionDays = config.PROTECTION_DURATION;
    
    logMessage(`[거래] 자칼에게 보호비 ${config.PROTECTION_COST}G를 냈습니다.`, "info");
    logMessage(`[효과] 앞으로 ${config.PROTECTION_DURATION}일간 강도로부터 안전합니다.`, "info");
    
    updateUI();
    checkGameOver();
}

/**
 * [채굴장] 노동 수행 로직 (수정됨: 미니게임 호출)
 */
export function performLabor() {
    // 기존의 즉시 완료 로직을 주석 처리하고 미니게임 시작 함수를 호출합니다.
    startMiningGame();
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
    logMessage(`--- [${playerStats.gameDay}일차] 새벽 ---`, "normal");

    // 1. 생활비 지출
    playerStats.money -= config.DAILY_LIVING_COST;
    logMessage(`[지출] 일일 생활비 ${config.DAILY_LIVING_COST}G 지출.`, "error");

    // 2. 치안 및 강도 이벤트 체크
    if (playerStats.protectionDays > 0) {
        playerStats.protectionDays--;
        logMessage(`[안전] 자칼의 보호 덕분에 밤을 무사히 보냈습니다.`, "info");
    } else {
        if (Math.random() < config.ROBBER_CHANCE) {
            const stolenMoney = Math.floor(playerStats.money * config.ROBBER_MONEY_LOSS_RATE);
            playerStats.money -= stolenMoney;
            playerStats.mental -= config.ROBBER_MENTAL_DMG;

            logMessage(`[경고] 밤사이에 강도가 들었습니다!!`, "danger");
            logMessage(`[피해] ${stolenMoney}G를 뺏기고, 정신력이 ${config.ROBBER_MENTAL_DMG} 감소했습니다.`, "danger");
        } else {
            logMessage(`[운] 다행히 밤사이에 아무 일도 없었습니다.`, "normal");
        }
    }

    // 3. 행동력 초기화
    playerStats.actionsLeft = config.BASE_ACTIONS + Math.floor(playerStats.grit / 5);
    
    logMessage(`--- 아침이 밝았습니다 ---`, "normal");
    updateUI();
    checkGameOver(); 
}

/**
 * [카지노] 슬롯 머신 스핀 로직
 */
export function performSpin() {
    if (playerStats.actionsLeft <= 0) {
        slotMessage.textContent = "행동력이 부족합니다.";
        return;
    }
    if (playerStats.money < config.SLOT_BET_AMOUNT) {
        slotMessage.textContent = "자산(G)이 부족합니다.";
        return;
    }

    playerStats.actionsLeft--;
    playerStats.money -= config.SLOT_BET_AMOUNT;
    spinButton.disabled = true;
    slotMessage.textContent = "SPINNING...";
    updateUI();

    let spinInterval = setInterval(() => {
        reel1.textContent = config.slotSymbols[Math.floor(Math.random() * config.slotSymbols.length)];
        reel2.textContent = config.slotSymbols[Math.floor(Math.random() * config.slotSymbols.length)];
        reel3.textContent = config.slotSymbols[Math.floor(Math.random() * config.slotSymbols.length)];
    }, 100);

    setTimeout(() => {
        clearInterval(spinInterval);

        const winChance = config.SLOT_WIN_CHANCE_BASE + (playerStats.luck * config.SLOT_WIN_CHANCE_LUCK_MOD);
        const isWinner = (Math.random() * 100) < winChance;

        let finalReels;

        if (isWinner) {
            finalReels = ['💰', '💰', '💰'];
            playerStats.money += config.SLOT_WIN_PRIZE;
            
            const mentalRecovery = config.SLOT_WIN_MENTAL_RECOVERY_BASE + Math.floor(playerStats.willpower / 2);
            playerStats.mental = Math.min(playerStats.maxMental, playerStats.mental + mentalRecovery);
            
            slotMessage.textContent = `승리! +${config.SLOT_WIN_PRIZE}G! (정신력 +${mentalRecovery})`;
            logMessage(`[도박 승리] ${config.SLOT_WIN_PRIZE}G 획득! 정신력 ${mentalRecovery} 회복.`, "info");

        } else {
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
        checkGameOver(); 

    }, 1000);
}
// ui.js: 모든 DOM 요소 및 UI 업데이트 함수 관리
import { playerStats } from './state.js';
import { setGameOver, setModalOpen } from './state.js';
// import { initGame, gameLoop } from './game.js'; // 삭제 (순환 참조 원인)

// --- 1. DOM 요소 찾기 ---
export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

// 스탯 UI
export const statMoney = document.getElementById('statMoney');
export const statMental = document.getElementById('statMental');
// ... (다른 UI 요소들) ...
export const statActions = document.getElementById('statActions');
export const messageLog = document.getElementById('messageLog');

// 게임 오버 모달
export const gameOverModal = document.getElementById('gameOverModal');
export const gameOverTitle = document.getElementById('gameOverTitle');
export const gameOverMessage = document.getElementById('gameOverMessage');
export const restartButton = document.getElementById('restartButton'); // export만 함

// 슬롯 머신 모달
export const slotMachineModal = document.getElementById('slotMachineModal');
export const closeSlotModal = document.getElementById('closeSlotModal');
export const spinButton = document.getElementById('spinButton'); // export만 함
export const reel1 = document.getElementById('reel1');
export const reel2 = document.getElementById('reel2');
export const reel3 = document.getElementById('reel3');
export const slotMessage = document.getElementById('slotMessage');


// --- 2. UI 업데이트 함수 ---

/**
 * 메시지를 로그 창에 추가합니다.
 * @param {string} message - 표시할 메시지
 * @param {string} type - 'normal', 'error', 'info', 'casino', 'work'
 */
export function logMessage(message, type = "normal") {
    // ... (기존과 동일) ...
    const p = document.createElement('p');
    p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    
    if (type === "error") p.style.color = "#FF6B6B";
    if (type === "info") p.style.color = "#6BFFB8";
    if (type === "casino") p.style.color = "#FFD700";
    if (type === "work") p.style.color = "#AAAAAA";

    messageLog.appendChild(p);
    messageLog.scrollTop = messageLog.scrollHeight; // 자동 스크롤
}

/**
 * state 객체의 데이터를 기반으로 UI의 모든 스탯을 업데이트합니다.
 */
export function updateUI() {
    // ... (기존과 동일) ...
    statDay.textContent = `${playerStats.gameDay}일차`;
    statActions.textContent = playerStats.actionsLeft;
    statMoney.textContent = playerStats.money;
    statMental.textContent = `${playerStats.mental} / ${playerStats.maxMental}`;
    statPrestige.textContent = playerStats.prestige;
    statFortitude.textContent = playerStats.fortitude;
    statWillpower.textContent = playerStats.willpower;
    statLuck.textContent = playerStats.luck;
    statGrit.textContent = playerStats.grit;
}

/**
 * 게임 오버 모달을 표시합니다.
 * @param {string} title - "파산", "폐인" 등
 * @param {string} message - 게임 오버 사유
 */
export function showGameOverModal(title, message) {
    setGameOver(true);
    setModalOpen(true); // 게임 오버도 모달이 열린 상태
    gameOverTitle.textContent = title;
    gameOverMessage.textContent = message;
    gameOverModal.classList.remove('hidden');
    slotMachineModal.classList.add('hidden'); // 혹시 열려있으면 닫기
}

// --- 3. 모달 UI 제어 함수 ---

export function openSlotMachine() {
    logMessage("슬롯 머신 앞에 섰습니다.", "casino");
    setModalOpen(true); // 게임 상태를 모달 열림으로 변경
    slotMachineModal.classList.remove('hidden');
    slotMessage.textContent = `베팅금: 10G | 행동력: 1 소모`; // TODO: config에서 가져오기
    spinButton.disabled = false; // 버튼 활성화
}

export function closeSlotMachine() {
    setModalOpen(false); // 게임 상태 복원
    slotMachineModal.classList.add('hidden');
}

// --- 4. UI 이벤트 리스너 설정 ---

closeSlotModal.addEventListener('click', closeSlotMachine);

// '다시 시작' 버튼 리스너는 game.js로 이동
// restartButton.addEventListener('click', () => { // 삭제
//     initGame(); // 삭제
//     gameLoop(); // 삭제
// }); // 삭제
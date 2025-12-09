// ui.js: 모든 DOM 요소 및 UI 업데이트 함수 관리
import { playerStats } from './state.js';
import { setGameOver, setModalOpen } from './state.js';

// --- 1. DOM 요소 찾기 ---
export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

// 스탯 UI
export const statMoney = document.getElementById('statMoney');
export const statMental = document.getElementById('statMental');
export const statPrestige = document.getElementById('statPrestige');
export const statFortitude = document.getElementById('statFortitude');
export const statWillpower = document.getElementById('statWillpower');
export const statLuck = document.getElementById('statLuck');
export const statGrit = document.getElementById('statGrit');
export const statDay = document.getElementById('statDay');
export const statActions = document.getElementById('statActions');
export const statProtection = document.getElementById('statProtection'); 
export const messageLog = document.getElementById('messageLog');

// 모달 요소들
export const gameOverModal = document.getElementById('gameOverModal');
export const gameOverTitle = document.getElementById('gameOverTitle');
export const gameOverMessage = document.getElementById('gameOverMessage');
export const restartButton = document.getElementById('restartButton');

export const slotMachineModal = document.getElementById('slotMachineModal');
export const closeSlotModal = document.getElementById('closeSlotModal');
export const spinButton = document.getElementById('spinButton');
export const reel1 = document.getElementById('reel1');
export const reel2 = document.getElementById('reel2');
export const reel3 = document.getElementById('reel3');
export const slotMessage = document.getElementById('slotMessage');

// [신규] 채굴 모달 요소
export const miningModal = document.getElementById('miningModal');
export const miningGrid = document.getElementById('miningGrid');
export const miningMoves = document.getElementById('miningMoves');
export const miningScore = document.getElementById('miningScore');


// --- 2. UI 업데이트 함수 ---
export function logMessage(message, type = "normal") {
    const p = document.createElement('p');
    p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    
    if (type === "error") p.style.color = "#FF6B6B"; 
    if (type === "info") p.style.color = "#6BFFB8"; 
    if (type === "casino") p.style.color = "#FFD700"; 
    if (type === "work") p.style.color = "#AAAAAA"; 
    if (type === "danger") p.style.color = "#FF4500"; 

    messageLog.appendChild(p);
    messageLog.scrollTop = messageLog.scrollHeight; 
}

export function updateUI() {
    statDay.textContent = `${playerStats.gameDay}일차`;
    statActions.textContent = playerStats.actionsLeft;
    statMoney.textContent = playerStats.money;
    statMental.textContent = `${playerStats.mental} / ${playerStats.maxMental}`;
    statPrestige.textContent = playerStats.prestige;
    statFortitude.textContent = playerStats.fortitude;
    statWillpower.textContent = playerStats.willpower;
    statLuck.textContent = playerStats.luck;
    statGrit.textContent = playerStats.grit;

    if (playerStats.protectionDays > 0) {
        statProtection.textContent = `보호중 (${playerStats.protectionDays}일)`;
        statProtection.className = "text-green-500";
    } else {
        statProtection.textContent = "위험";
        statProtection.className = "text-red-500 animate-pulse";
    }
}

export function showGameOverModal(title, message) {
    setGameOver(true);
    setModalOpen(true); 
    gameOverTitle.textContent = title;
    gameOverMessage.textContent = message;
    gameOverModal.classList.remove('hidden');
    slotMachineModal.classList.add('hidden'); 
    miningModal.classList.add('hidden');
}

// --- 3. 모달 UI 제어 함수 ---
export function openSlotMachine() {
    logMessage("슬롯 머신 앞에 섰습니다.", "casino");
    setModalOpen(true); 
    slotMachineModal.classList.remove('hidden');
    slotMessage.textContent = `베팅금: 10G | 행동력: 1 소모`; 
    spinButton.disabled = false; 
}

export function closeSlotMachine() {
    setModalOpen(false); 
    slotMachineModal.classList.add('hidden');
}

// [신규] 채굴 모달 제어
export function openMiningModal() {
    setModalOpen(true);
    miningModal.classList.remove('hidden');
}

export function closeMiningModal() {
    setModalOpen(false);
    miningModal.classList.add('hidden');
}

// --- 4. 이벤트 리스너 ---
closeSlotModal.addEventListener('click', closeSlotMachine);
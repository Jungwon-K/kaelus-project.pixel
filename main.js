// main.js: 게임의 메인 진입점 (Entry Point)
import { initGame, gameLoop } from './game.js';

// DOM이 완전히 로드된 후에 게임을 시작합니다.
document.addEventListener('DOMContentLoaded', (event) => {
    initGame(); // 게임 초기화 함수 호출
    gameLoop(); // 게임 루프 시작
});
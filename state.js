// state.js: 게임의 모든 '상태' 변수를 관리
import { TILE_SIZE } from './config.js';

// 이 객체들을 다른 모듈에서 import하여 직접 수정합니다.
// (더 큰 프로젝트에서는 setter 함수를 쓰지만, 프로토타입에서는 이 방식이 간단합니다.)

export let player = {
    x: TILE_SIZE * 5,
    y: TILE_SIZE * 5,
    width: TILE_SIZE,
    height: TILE_SIZE,
    color: '#00FFFF',
    name: '니힐'
};

export let playerStats = {
    money: 100,
    mental: 80,
    maxMental: 100,
    prestige: 5,
    fortitude: 5,
    willpower: 5,
    luck: 5,
    grit: 5,
    gameDay: 1,
    actionsLeft: 2, // initGame에서 재설정됨
};

export let gameObjects = [];

export let keys = {
    w: false, a: false, s: false, d: false, e: false
};

export let isGameOver = false;
export let isModalOpen = false;
export let gameLoopId = null;

// 상태를 '변경'하는 헬퍼 함수들
export function setGameOver(value) {
    isGameOver = value;
}
export function setModalOpen(value) {
    isModalOpen = value;
}
export function setGameLoopId(id) {
    gameLoopId = id;
}
export function setGameObjects(objects) {
    gameObjects.length = 0; // 배열 비우기
    gameObjects.push(...objects); // 새 객체 추가
}
// state.js: 게임의 모든 '상태' 변수를 관리
import { TILE_SIZE } from './config.js';

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
    actionsLeft: 2,
    protectionDays: 0,
};

// [신규] 채굴 미니게임 상태
export let miningState = {
    grid: [], // 2차원 배열
    score: 0,
    movesLeft: 0,
    selectedGroup: [] // 현재 마우스 오버/클릭 된 그룹
};

export let gameObjects = [];

export let keys = {
    w: false, a: false, s: false, d: false, e: false
};

export let isGameOver = false;
export let isModalOpen = false;
export let gameLoopId = null;

export function setGameOver(value) { isGameOver = value; }
export function setModalOpen(value) { isModalOpen = value; }
export function setGameLoopId(id) { gameLoopId = id; }
export function setGameObjects(objects) { 
    gameObjects.length = 0; 
    gameObjects.push(...objects); 
}
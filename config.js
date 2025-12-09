// config.js: 게임의 모든 설정값 (상수)
export const TILE_SIZE = 40;
export const PLAYER_SPEED = 5;

// 경제 및 생존
export const DAILY_LIVING_COST = 20;
export const BASE_ACTIONS = 2;
export const LABOR_EARNINGS_BASE = 20; 
export const LABOR_MENTAL_DRAIN_BASE = 10; 
export const HOME_MENTAL_RECOVERY_BASE = 15;

// 치안 및 위험
export const PROTECTION_COST = 50; 
export const PROTECTION_DURATION = 3; 
export const ROBBER_CHANCE = 0.3; 
export const ROBBER_MONEY_LOSS_RATE = 0.2; 
export const ROBBER_MENTAL_DMG = 20; 

// 도박 (슬롯)
export const SLOT_BET_AMOUNT = 10;
export const SLOT_WIN_PRIZE = 50;
export const SLOT_WIN_CHANCE_BASE = 20;
export const SLOT_WIN_CHANCE_LUCK_MOD = 1.5;
export const SLOT_WIN_MENTAL_RECOVERY_BASE = 5;
export const SLOT_LOSS_MENTAL_DRAIN_BASE = 15;
export const slotSymbols = ['🍒', '🍋', '🔔', '💰', '💀'];

// [신규] 채굴 미니게임 설정
export const MINING_GRID_SIZE = 6; // 6x6 그리드
export const MINING_MAX_MOVES = 10; // 1회 채굴 당 클릭 횟수
export const MINING_SCORE_MULTIPLIER = 2; // 점수 당 골드 환산율 (100점 = 2G)
export const MINING_COLORS = ['#7f8c8d', '#d35400', '#f1c40f', '#9b59b6']; // 돌, 구리, 금, 카일리슘
export const MINING_TYPE_NAMES = ['돌', '구리', '금', '카일리슘'];
export const MINING_VALUES = [1, 5, 20, 50]; // 각 블록 파괴 시 점수
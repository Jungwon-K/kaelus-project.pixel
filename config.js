// config.js: 게임의 모든 설정값 (상수)
export const TILE_SIZE = 40;
export const PLAYER_SPEED = 5;

// 경제 및 생존
export const DAILY_LIVING_COST = 20; // 일일 생활비
export const BASE_ACTIONS = 2; // 기본 행동력
export const LABOR_EARNINGS_BASE = 20; // 기본 노동 수입
export const LABOR_MENTAL_DRAIN_BASE = 10; // 기본 노동 정신력 소모
export const HOME_MENTAL_RECOVERY_BASE = 15; // 기본 휴식 정신력 회복

// 도박 (슬롯)
export const SLOT_BET_AMOUNT = 10; // 슬롯 베팅금
export const SLOT_WIN_PRIZE = 50; // 슬롯 승리금
export const SLOT_WIN_CHANCE_BASE = 20; // 슬롯 기본 승률 (20%)
export const SLOT_WIN_CHANCE_LUCK_MOD = 1.5; // 운 1포인트당 승률 증가 (1.5%)
export const SLOT_WIN_MENTAL_RECOVERY_BASE = 5; // 승리 시 정신력 회복
export const SLOT_LOSS_MENTAL_DRAIN_BASE = 15; // 패배 시 정신력 소모

// 슬롯 심볼
export const slotSymbols = ['🍒', '🍋', '🔔', '💰', '💀'];
// ============================================================
//  Splendor — Core TypeScript Types
// ============================================================

// ── Gems ────────────────────────────────────────────────────

export type GemColor = "white" | "blue" | "green" | "red" | "black";
export type WildColor = "gold"; // Joker token
export type AnyGem = GemColor | WildColor;

/** A pool of gem tokens (used for the bank, player hand, card cost, etc.) */
export type GemPool = Record<GemColor, number>;

/** Full token pool including gold wild */
export type TokenPool = Record<AnyGem, number>;

// ── Cards ────────────────────────────────────────────────────

export type CardTier = 1 | 2 | 3;

export interface DevelopmentCard {
  id: string;
  tier: CardTier;
  prestige: number; // Victory points (0–5)
  bonus: GemColor; // Permanent gem discount this card provides
  cost: GemPool; // Token cost to purchase
}

// ── Nobles ───────────────────────────────────────────────────

export interface Noble {
  id: string;
  prestige: number; // Always 3
  requirement: GemPool; // Number of bonus cards needed per color
}

// ── Player ───────────────────────────────────────────────────

export interface Player {
  id: string;
  name: string;
  isAI: boolean;

  tokens: TokenPool; // Tokens in hand (max 10)
  reservedCards: DevelopmentCard[]; // Max 3
  purchasedCards: DevelopmentCard[]; // All bought cards
  nobles: Noble[]; // Nobles claimed

  // Derived — computed from purchasedCards
  bonuses: GemPool; // Sum of card bonuses per color
  prestige: number; // Total victory points
}

// ── Deck / Board ─────────────────────────────────────────────

export interface TierDeck {
  draw: DevelopmentCard[]; // Face-down pile
  visible: DevelopmentCard[]; // 4 face-up cards
}

export interface Board {
  tiers: Record<CardTier, TierDeck>;
  nobles: Noble[]; // Nobles still available
  bank: TokenPool; // Tokens remaining in the central pool
}

// ── Game Flow ────────────────────────────────────────────────

export type GamePhase =
  | "idle" // Not started
  | "playing" // Normal turn
  | "lastRound" // Someone hit 15 pts; everyone gets one more turn
  | "ended"; // Game over

export type ActionType =
  | "takeDifferentGems" // Take up to 3 gems of different colors
  | "takeSameGems" // Take 2 gems of the same color (≥4 in bank)
  | "reserveCard" // Reserve a card + take 1 gold (if available)
  | "buyCard"; // Purchase a visible or reserved card

export interface Action {
  type: ActionType;
  // takeDifferentGems
  gems?: Partial<GemPool>;
  // takeSameGems
  gemColor?: GemColor;
  // reserveCard / buyCard
  cardId?: string;
  cardTier?: CardTier; // 'reserveCard' from top of deck needs tier
  fromReserved?: boolean; // buyCard from player's reserved pile
  // buyCard — how many wilds used (auto-calculated, tracked for validation)
  wildUsed?: number;
}

// ── Full Game State ──────────────────────────────────────────

export interface GameState {
  id: string;
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  board: Board;
  lastRoundStartedBy: string | null; // Player id who triggered last round
  winner: string | null; // Player id of winner (or null)
  turnNumber: number;
  actionLog: ActionLog[];
}

// ── Action Log (for replay / undo) ──────────────────────────

export interface ActionLog {
  turn: number;
  playerId: string;
  action: Action;
  timestamp: number;
}

// ── AI ───────────────────────────────────────────────────────

export type AIDifficulty = "easy" | "medium" | "hard";

export interface AIConfig {
  difficulty: AIDifficulty;
  thinkingDelayMs: number; // Fake "thinking" delay for UX
}

// ── Config ───────────────────────────────────────────────────

export const GAME_CONFIG = {
  WIN_PRESTIGE: 15,
  MAX_TOKENS_IN_HAND: 10,
  MAX_RESERVED_CARDS: 3,
  VISIBLE_CARDS_PER_TIER: 4,
  TAKE_SAME_GEM_MIN_IN_BANK: 4,
  TAKE_SAME_GEM_AMOUNT: 2,
  TAKE_DIFFERENT_GEM_MAX: 3,
  NOBLE_PRESTIGE: 3,
  GOLD_TOKENS_TOTAL: 5,
  GEM_TOKENS_PER_COLOR_2P: 4,
  GEM_TOKENS_PER_COLOR_3P: 5,
  GEM_TOKENS_PER_COLOR_4P: 7,
} as const;

// ── Utility Types ────────────────────────────────────────────

/** Empty gem pool helper */
export const emptyGemPool = (): GemPool => ({
  white: 0,
  blue: 0,
  green: 0,
  red: 0,
  black: 0,
});

export const emptyTokenPool = (): TokenPool => ({
  ...emptyGemPool(),
  gold: 0,
});

/** All gem colors (no gold) */
export const GEM_COLORS: GemColor[] = [
  "white",
  "blue",
  "green",
  "red",
  "black",
];

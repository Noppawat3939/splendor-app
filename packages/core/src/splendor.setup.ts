// ============================================================
//  Splendor — Game Setup
//  createGame(players) → GameState ready to play
// ============================================================

import {
  GameState,
  Player,
  Board,
  TokenPool,
  GEM_COLORS,
  GAME_CONFIG,
  emptyGemPool,
  emptyTokenPool,
} from "./splendor.types";
import {
  TIER1_CARDS,
  TIER2_CARDS,
  TIER3_CARDS,
  ALL_NOBLES,
} from "./splendor.data";
import { Noble } from "./splendor.types";

// ── Shuffle ───────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Token counts per player count ────────────────────────────

function gemTokensPerColor(playerCount: number): number {
  if (playerCount === 2) return GAME_CONFIG.GEM_TOKENS_PER_COLOR_2P; // 4
  if (playerCount === 3) return GAME_CONFIG.GEM_TOKENS_PER_COLOR_3P; // 5
  return GAME_CONFIG.GEM_TOKENS_PER_COLOR_4P; // 7
}

function nobleCount(playerCount: number): number {
  return playerCount + 1; // 2p→3, 3p→4, 4p→5
}

// ── Build initial bank ────────────────────────────────────────

function buildBank(playerCount: number): TokenPool {
  const perColor = gemTokensPerColor(playerCount);
  const bank = emptyTokenPool();
  for (const color of GEM_COLORS) {
    bank[color] = perColor;
  }
  bank.gold = GAME_CONFIG.GOLD_TOKENS_TOTAL; // always 5
  return bank;
}

// ── Build board ───────────────────────────────────────────────

function buildBoard(playerCount: number, nobles: Noble[]): Board {
  const tier1 = shuffle(TIER1_CARDS);
  const tier2 = shuffle(TIER2_CARDS);
  const tier3 = shuffle(TIER3_CARDS);

  const visible = GAME_CONFIG.VISIBLE_CARDS_PER_TIER; // 4

  return {
    bank: buildBank(playerCount),
    nobles,
    tiers: {
      1: { visible: tier1.slice(0, visible), draw: tier1.slice(visible) },
      2: { visible: tier2.slice(0, visible), draw: tier2.slice(visible) },
      3: { visible: tier3.slice(0, visible), draw: tier3.slice(visible) },
    },
  };
}

// ── Build players ─────────────────────────────────────────────

function buildPlayer(id: string, name: string, isAI: boolean): Player {
  return {
    id,
    name,
    isAI,
    tokens: emptyTokenPool(),
    reservedCards: [],
    purchasedCards: [],
    nobles: [],
    bonuses: emptyGemPool(),
    prestige: 0,
  };
}

// ── Public API ────────────────────────────────────────────────

export interface PlayerConfig {
  id: string;
  name: string;
  isAI: boolean;
}

/**
 * Create a fresh game ready to play.
 *
 * @param players  2–4 player configs
 * @returns        Full GameState with shuffled decks, dealt nobles, empty player hands
 *
 * @example
 * const state = createGame([
 *   { id: 'p1', name: 'Alice', isAI: false },
 *   { id: 'p2', name: 'AI',    isAI: true  },
 * ])
 */
export function createGame(players: PlayerConfig[]): GameState {
  if (players?.length < 2 || players?.length > 4) {
    throw new Error("Splendor requires 2–4 players");
  }

  const nobles = shuffle(ALL_NOBLES).slice(0, nobleCount(players?.length));
  const board = buildBoard(players.length, nobles);

  return {
    id: `game-${Date.now()}`,
    phase: "playing",
    players: players.map((p) => buildPlayer(p.id, p.name, p.isAI)),
    currentPlayerIndex: 0,
    board,
    lastRoundStartedBy: null,
    winner: null,
    turnNumber: 1,
    actionLog: [],
  };
}

// ── Utility: get legal actions for a player ───────────────────
//  Useful for AI and UI (highlight clickable items)

import { Action, GemPool } from "./splendor.types";
import { computePayment } from "./splendor.engine";

export function getLegalActions(state: GameState): Action[] {
  const actions: Action[] = [];
  const player = state.players[state.currentPlayerIndex];
  const bank = state.board.bank;

  // 1. takeDifferentGems — all combos of 1, 2, or 3 different colors available
  const availableColors = GEM_COLORS.filter((c) => bank[c] > 0);
  const combos = getCombinations(
    availableColors,
    Math.min(3, availableColors.length)
  );
  for (const combo of combos) {
    const gems: Partial<GemPool> = {};
    for (const c of combo) gems[c] = 1;
    actions.push({ type: "takeDifferentGems", gems });
  }

  // 2. takeSameGems — colors with >= min tokens and player won't exceed 10
  const playerCount = state.players.length;
  const minInBank =
    playerCount === 2
      ? GAME_CONFIG.TAKE_SAME_GEM_MIN_IN_BANK_2P
      : playerCount === 3
      ? GAME_CONFIG.TAKE_SAME_GEM_MIN_IN_BANK_3P
      : GAME_CONFIG.TAKE_SAME_GEM_MIN_IN_BANK_4P;

  for (const color of GEM_COLORS) {
    if (bank[color] >= minInBank) {
      const totalAfter = totalTokens(player) + GAME_CONFIG.TAKE_SAME_GEM_AMOUNT;
      if (totalAfter <= GAME_CONFIG.MAX_TOKENS_IN_HAND) {
        actions.push({ type: "takeSameGems", gemColor: color });
      }
    }
  }

  // 3. reserveCard — any visible card or top of any non-empty deck
  if (player.reservedCards.length < GAME_CONFIG.MAX_RESERVED_CARDS) {
    for (const tier of [1, 2, 3] as const) {
      for (const card of state.board.tiers[tier].visible) {
        actions.push({ type: "reserveCard", cardId: card.id });
      }
      if (state.board.tiers[tier].draw.length > 0) {
        actions.push({ type: "reserveCard", cardTier: tier });
      }
    }
  }

  // 4. buyCard — visible cards the player can afford
  for (const tier of [1, 2, 3] as const) {
    for (const card of state.board.tiers[tier].visible) {
      const { canAfford } = computePayment(player, card.cost);
      if (canAfford) {
        actions.push({ type: "buyCard", cardId: card.id, fromReserved: false });
      }
    }
  }

  // 5. buyCard — reserved cards the player can afford
  for (const card of player.reservedCards) {
    const { canAfford } = computePayment(player, card.cost);
    if (canAfford) {
      actions.push({ type: "buyCard", cardId: card.id, fromReserved: true });
    }
  }

  return actions;
}

// ── Helpers ───────────────────────────────────────────────────

function totalTokens(player: Player): number {
  return Object.values(player.tokens).reduce((a, b) => a + b, 0);
}

function getCombinations<T>(arr: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (arr.length < size) return [];
  const [first, ...rest] = arr;
  const withFirst = getCombinations(rest, size - 1).map((c) => [first, ...c]);
  const withoutFirst = getCombinations(rest, size);
  return [...withFirst, ...withoutFirst];
}

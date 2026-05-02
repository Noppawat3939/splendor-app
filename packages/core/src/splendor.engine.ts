// ============================================================
//  Splendor — Game Engine (Pure Logic, No UI)
// ============================================================
//  All functions are pure: (GameState, ...) => GameState
//  Never mutate state directly — always return a new object.
// ============================================================

import {
  GameState,
  Player,
  Board,
  DevelopmentCard,
  Noble,
  GemPool,
  TokenPool,
  GemColor,
  Action,
  ActionLog,
  GEM_COLORS,
  GAME_CONFIG,
  emptyGemPool,
  emptyTokenPool,
} from "./splendor.types";

// ── Helpers ──────────────────────────────────────────────────

function cloneState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state));
}

function currentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

/** Sum of a GemPool */
function totalGems(pool: GemPool | TokenPool): number {
  return Object.values(pool).reduce((a, b) => a + b, 0);
}

/** Player's total token count */
function totalTokens(player: Player): number {
  return totalGems(player.tokens);
}

/** Computed bonuses from purchased cards */
export function computeBonuses(cards: DevelopmentCard[]): GemPool {
  const pool = emptyGemPool();
  for (const card of cards) pool[card.bonus]++;
  return pool;
}

/** Computed prestige from cards + nobles */
export function computePrestige(player: Player): number {
  const fromCards = player.purchasedCards.reduce((s, c) => s + c.prestige, 0);
  const fromNobles = player.nobles.reduce((s, n) => s + n.prestige, 0);
  return fromCards + fromNobles;
}

// ── Validation ───────────────────────────────────────────────

export type ValidationResult = { ok: true } | { ok: false; reason: string };
const ok: ValidationResult = { ok: true };
const fail = (reason: string): ValidationResult => ({ ok: false, reason });

export function validateTakeDifferentGems(
  state: GameState,
  gems: Partial<GemPool>
): ValidationResult {
  const colors = Object.entries(gems).filter(([, v]) => v > 0) as [
    GemColor,
    number
  ][];
  if (colors.length < 1 || colors.length > GAME_CONFIG.TAKE_DIFFERENT_GEM_MAX)
    return fail(
      `Must take 1–${GAME_CONFIG.TAKE_DIFFERENT_GEM_MAX} different gem colors`
    );
  for (const [color, amount] of colors) {
    if (amount !== 1) return fail(`Must take exactly 1 of each color`);
    if (state.board.bank[color] < 1)
      return fail(`Not enough ${color} gems in bank`);
  }
  const player = currentPlayer(state);
  if (totalTokens(player) + colors.length > GAME_CONFIG.MAX_TOKENS_IN_HAND)
    return fail(`Would exceed ${GAME_CONFIG.MAX_TOKENS_IN_HAND} token limit`);
  return ok;
}

export function validateTakeSameGems(
  state: GameState,
  color: GemColor
): ValidationResult {
  const playerCount = state.players.length;
  const minInBank =
    playerCount === 2
      ? GAME_CONFIG.TAKE_SAME_GEM_MIN_IN_BANK_2P
      : playerCount === 3
      ? GAME_CONFIG.TAKE_SAME_GEM_MIN_IN_BANK_3P
      : GAME_CONFIG.TAKE_SAME_GEM_MIN_IN_BANK_4P;

  if (state.board.bank[color] < minInBank)
    return fail(`Need at least ${minInBank} ${color} gems in bank`);

  const player = currentPlayer(state);
  if (
    totalTokens(player) + GAME_CONFIG.TAKE_SAME_GEM_AMOUNT >
    GAME_CONFIG.MAX_TOKENS_IN_HAND
  )
    return fail(`Would exceed ${GAME_CONFIG.MAX_TOKENS_IN_HAND} token limit`);

  return ok;
}

export function validateReserveCard(
  state: GameState,
  cardId: string | undefined,
  tier: number | undefined
): ValidationResult {
  const player = currentPlayer(state);
  if (player.reservedCards.length >= GAME_CONFIG.MAX_RESERVED_CARDS)
    return fail(
      `Already have ${GAME_CONFIG.MAX_RESERVED_CARDS} reserved cards`
    );
  if (!cardId && !tier)
    return fail("Must specify a card or a tier to draw from");
  if (cardId) {
    const found = findVisibleCard(state.board, cardId);
    if (!found) return fail("Card not found on board");
  }
  return ok;
}

export function validateBuyCard(
  state: GameState,
  cardId: string,
  fromReserved: boolean
): ValidationResult {
  const player = currentPlayer(state);
  const card = fromReserved
    ? player.reservedCards.find((c) => c.id === cardId)
    : findVisibleCard(state.board, cardId);
  if (!card) return fail("Card not found");
  const { canAfford } = computePayment(player, card.cost);
  if (!canAfford) return fail("Cannot afford this card");
  return ok;
}

// ── Payment Calculation ──────────────────────────────────────

interface PaymentResult {
  canAfford: boolean;
  payment: TokenPool; // Exact tokens to deduct from player
}

export function computePayment(player: Player, cost: GemPool): PaymentResult {
  const payment = emptyTokenPool();
  let wildNeeded = 0;

  for (const color of GEM_COLORS) {
    const need = Math.max(0, cost[color] - player.bonuses[color]);
    const have = player.tokens[color];
    const fromTokens = Math.min(need, have);
    const fromWild = need - fromTokens;
    payment[color] = fromTokens;
    wildNeeded += fromWild;
  }

  payment.gold = wildNeeded;
  const canAfford = wildNeeded <= player.tokens.gold;
  return { canAfford, payment };
}

// ── Board Helpers ────────────────────────────────────────────

function findVisibleCard(
  board: Board,
  cardId: string
): DevelopmentCard | undefined {
  for (const tier of [1, 2, 3] as const) {
    const found = board.tiers[tier].visible.find((c) => c.id === cardId);
    if (found) return found;
  }
}

function removeVisibleCard(board: Board, cardId: string): Board {
  const newBoard = JSON.parse(JSON.stringify(board)) as Board;
  for (const tier of [1, 2, 3] as const) {
    const idx = newBoard.tiers[tier].visible.findIndex((c) => c.id === cardId);
    if (idx !== -1) {
      newBoard.tiers[tier].visible.splice(idx, 1);
      // Draw replacement from deck
      if (newBoard.tiers[tier].draw.length > 0) {
        newBoard.tiers[tier].visible.splice(
          idx,
          0,
          newBoard.tiers[tier].draw.shift()!
        );
      }
      break;
    }
  }
  return newBoard;
}

function drawFromDeck(
  board: Board,
  tier: 1 | 2 | 3
): [Board, DevelopmentCard | null] {
  const newBoard = JSON.parse(JSON.stringify(board)) as Board;
  const card = newBoard.tiers[tier].draw.shift() ?? null;
  return [newBoard, card];
}

// ── Noble Check ──────────────────────────────────────────────

export function checkNobles(board: Board, player: Player): Noble[] {
  return board.nobles.filter((noble) =>
    GEM_COLORS.every(
      (color) => player.bonuses[color] >= (noble.requirement[color] ?? 0)
    )
  );
}

function claimFirstNoble(board: Board, player: Player): [Board, Player] {
  const eligible = checkNobles(board, player);
  if (eligible.length === 0) return [board, player];

  // If multiple nobles qualify, take the first (can extend to player-choice later)
  const noble = eligible[0];
  const newBoard = {
    ...board,
    nobles: board.nobles.filter((n) => n.id !== noble.id),
  };
  const newPlayer = { ...player, nobles: [...player.nobles, noble] };
  return [newBoard, newPlayer];
}

// ── Player Update Helper ─────────────────────────────────────

function refreshPlayer(player: Player): Player {
  return {
    ...player,
    bonuses: computeBonuses(player.purchasedCards),
    prestige: computePrestige(player),
  };
}

// ── Turn Advance ─────────────────────────────────────────────

function advanceTurn(state: GameState): GameState {
  const next = (state.currentPlayerIndex + 1) % state.players.length;
  let phase = state.phase;
  let winner = state.winner;

  // Check if current player just triggered last-round
  if (state.phase === "playing") {
    const cp = state.players[state.currentPlayerIndex];
    if (cp.prestige >= GAME_CONFIG.WIN_PRESTIGE) {
      phase = "lastRound";
    }
  }

  // If we've wrapped back to the player who triggered last round → game over
  if (state.phase === "lastRound") {
    const triggerer = state.players.findIndex(
      (p) => p.id === state.lastRoundStartedBy
    );
    if (next === triggerer) {
      phase = "ended";
      winner = determineWinner(state.players);
    }
  }

  return {
    ...state,
    phase,
    winner,
    currentPlayerIndex: next,
    turnNumber: next === 0 ? state.turnNumber + 1 : state.turnNumber,
    lastRoundStartedBy:
      state.phase === "playing" &&
      state.players[state.currentPlayerIndex].prestige >=
        GAME_CONFIG.WIN_PRESTIGE
        ? state.players[state.currentPlayerIndex].id
        : state.lastRoundStartedBy,
  };
}

function determineWinner(players: Player[]): string {
  // Most prestige wins; tiebreak: fewer purchased cards
  return [...players].sort(
    (a, b) =>
      b.prestige - a.prestige ||
      a.purchasedCards.length - b.purchasedCards.length
  )[0].id;
}

// ── Log Helper ───────────────────────────────────────────────

function appendLog(state: GameState, action: Action): ActionLog[] {
  return [
    ...state.actionLog,
    {
      turn: state.turnNumber,
      playerId: currentPlayer(state).id,
      action,
      timestamp: Date.now(),
    },
  ];
}

// ── Core Actions ─────────────────────────────────────────────

/**
 * Take up to 3 different-colored gem tokens from the bank.
 */
export function takeDifferentGems(
  state: GameState,
  gems: Partial<GemPool>
): GameState {
  const validation = validateTakeDifferentGems(state, gems);
  if (!validation.ok) throw new Error(validation.reason);

  const s = cloneState(state);
  const player = s.players[s.currentPlayerIndex];

  for (const [color, amount] of Object.entries(gems) as [GemColor, number][]) {
    if (amount <= 0) continue;
    player.tokens[color] += amount;
    s.board.bank[color] -= amount;
  }

  s.actionLog = appendLog(state, { type: "takeDifferentGems", gems });
  return advanceTurn(s);
}

/**
 * Take 2 tokens of the same color (bank must have ≥ 4).
 */
export function takeSameGems(state: GameState, color: GemColor): GameState {
  const validation = validateTakeSameGems(state, color);
  if (!validation.ok) throw new Error(validation.reason);

  const s = cloneState(state);
  const player = s.players[s.currentPlayerIndex];

  player.tokens[color] += GAME_CONFIG.TAKE_SAME_GEM_AMOUNT;
  s.board.bank[color] -= GAME_CONFIG.TAKE_SAME_GEM_AMOUNT;

  s.actionLog = appendLog(state, { type: "takeSameGems", gemColor: color });
  return advanceTurn(s);
}

/**
 * Reserve a visible card (by id) or the top card of a tier deck.
 * Player receives 1 gold token if the bank has any.
 */
export function reserveCard(
  state: GameState,
  cardId?: string,
  tier?: 1 | 2 | 3
): GameState {
  const validation = validateReserveCard(state, cardId, tier);
  if (!validation.ok) throw new Error(validation.reason);

  const s = cloneState(state);
  const player = s.players[s.currentPlayerIndex];
  let card: DevelopmentCard | null = null;

  if (cardId) {
    card = findVisibleCard(s.board, cardId) ?? null;
    if (!card) throw new Error("Card not found");
    s.board = removeVisibleCard(s.board, cardId);
  } else if (tier) {
    const [newBoard, drawn] = drawFromDeck(s.board, tier);
    s.board = newBoard;
    card = drawn;
    if (!card) throw new Error("Deck is empty");
  }

  player.reservedCards.push(card!);

  // Give 1 gold token if available
  if (s.board.bank.gold > 0) {
    player.tokens.gold++;
    s.board.bank.gold--;
  }

  s.players[s.currentPlayerIndex] = refreshPlayer(player);
  s.actionLog = appendLog(state, {
    type: "reserveCard",
    cardId,
    cardTier: tier,
  });
  return advanceTurn(s);
}

/**
 * Purchase a card from the board or from player's reserved pile.
 * Automatically uses gold (wild) tokens for any shortfall.
 */
export function buyCard(
  state: GameState,
  cardId: string,
  fromReserved = false
): GameState {
  const validation = validateBuyCard(state, cardId, fromReserved);
  if (!validation.ok) throw new Error(validation.reason);

  const s = cloneState(state);
  let player = s.players[s.currentPlayerIndex];
  let card: DevelopmentCard;

  if (fromReserved) {
    const idx = player.reservedCards.findIndex((c) => c.id === cardId);
    card = player.reservedCards[idx];
    player.reservedCards.splice(idx, 1);
  } else {
    card = findVisibleCard(s.board, cardId)!;
    s.board = removeVisibleCard(s.board, cardId);
  }

  // Deduct tokens
  const { payment } = computePayment(player, card.cost);
  for (const color of GEM_COLORS) {
    player.tokens[color] -= payment[color];
    s.board.bank[color] += payment[color];
  }
  player.tokens.gold -= payment.gold;
  s.board.bank.gold += payment.gold;

  player.purchasedCards.push(card);
  player = refreshPlayer(player);

  // Noble check — runs after purchase updates bonuses
  const [newBoard, newPlayer] = claimFirstNoble(s.board, player);
  s.board = newBoard;
  s.players[s.currentPlayerIndex] = refreshPlayer(newPlayer);

  s.actionLog = appendLog(state, {
    type: "buyCard",
    cardId,
    fromReserved,
    wildUsed: payment.gold,
  });
  return advanceTurn(s);
}

// ── Return Excess Tokens (after going over 10) ───────────────

/**
 * If a player somehow ends up with > 10 tokens, call this to return excess.
 * (UI should prompt the player to choose which to return.)
 */
export function returnTokens(
  state: GameState,
  toReturn: Partial<TokenPool>
): GameState {
  const s = cloneState(state);
  const player = s.players[s.currentPlayerIndex];

  for (const [color, amount] of Object.entries(toReturn) as [
    keyof TokenPool,
    number
  ][]) {
    if (amount <= 0) continue;
    if (player.tokens[color] < amount)
      throw new Error(`Player doesn't have ${amount} ${color} tokens`);
    player.tokens[color] -= amount;
    s.board.bank[color] += amount;
  }

  if (totalTokens(player) > GAME_CONFIG.MAX_TOKENS_IN_HAND)
    throw new Error(
      `Still over ${GAME_CONFIG.MAX_TOKENS_IN_HAND} token limit after return`
    );

  return s;
}

// ── Dispatch (single entry point) ────────────────────────────

/**
 * Main dispatch function — call this from UI or AI with any Action.
 */
export function applyAction(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "takeDifferentGems":
      return takeDifferentGems(state, action.gems ?? {});
    case "takeSameGems":
      if (!action.gemColor) throw new Error("gemColor required");
      return takeSameGems(state, action.gemColor);
    case "reserveCard":
      return reserveCard(
        state,
        action.cardId,
        action.cardTier as 1 | 2 | 3 | undefined
      );
    case "buyCard":
      if (!action.cardId) throw new Error("cardId required");
      return buyCard(state, action.cardId, action.fromReserved ?? false);
    default:
      throw new Error(`Unknown action type`);
  }
}

// ── Game Init Helper ─────────────────────────────────────────

export function createInitialState(
  players: Pick<Player, "id" | "name" | "isAI">[],
  board: Board,
  nobles: Noble[]
): GameState {
  return {
    id: `game-${Date.now()}`,
    phase: "playing",
    players: players.map((p) => ({
      ...p,
      tokens: emptyTokenPool(),
      reservedCards: [],
      purchasedCards: [],
      nobles: [],
      bonuses: emptyGemPool(),
      prestige: 0,
    })),
    currentPlayerIndex: 0,
    board: { ...board, nobles },
    lastRoundStartedBy: null,
    winner: null,
    turnNumber: 1,
    actionLog: [],
  };
}

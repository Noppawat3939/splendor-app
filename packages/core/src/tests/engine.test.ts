import { describe, it, expect } from "bun:test";
import { createGame } from "../splendor.setup";
import {
  takeDifferentGems,
  takeSameGems,
  reserveCard,
  buyCard,
  computePayment,
} from "../splendor.engine";

// ── Helper ────────────────────────────────────────────────────

function make2pGame() {
  return createGame([
    { id: "p1", name: "Alice", isAI: false },
    { id: "p2", name: "Bob", isAI: false },
  ]);
}

// ── takeDifferentGems ─────────────────────────────────────────

describe("takeDifferentGems", () => {
  it("should take 3 different gems", () => {
    const state = make2pGame();
    const next = takeDifferentGems(state, { red: 1, blue: 1, green: 1 });
    const player = next.players[0];
    expect(player.tokens.red).toBe(1);
    expect(player.tokens.blue).toBe(1);
    expect(player.tokens.green).toBe(1);
  });

  it("should deduct gems from bank", () => {
    const state = make2pGame();
    const next = takeDifferentGems(state, { red: 1, blue: 1, green: 1 });
    expect(next.board.bank.red).toBe(3);
    expect(next.board.bank.blue).toBe(3);
    expect(next.board.bank.green).toBe(3);
  });

  it("should advance to next player", () => {
    const state = make2pGame();
    const next = takeDifferentGems(state, { red: 1, blue: 1, green: 1 });
    expect(next.currentPlayerIndex).toBe(1);
  });

  it("should take 2 different gems", () => {
    const state = make2pGame();
    const next = takeDifferentGems(state, { red: 1, blue: 1 });
    expect(next.players[0].tokens.red).toBe(1);
    expect(next.players[0].tokens.blue).toBe(1);
  });

  it("should throw if bank has no gem", () => {
    const state = make2pGame();
    state.board.bank.red = 0;
    expect(() =>
      takeDifferentGems(state, { red: 1, blue: 1, green: 1 })
    ).toThrow();
  });

  it("should throw if taking more than 3 colors", () => {
    const state = make2pGame();
    expect(() =>
      takeDifferentGems(state, { red: 1, blue: 1, green: 1, white: 1 })
    ).toThrow();
  });
});

// ── takeSameGems ──────────────────────────────────────────────

describe("takeSameGems", () => {
  it("should take 2 of same gem", () => {
    const state = make2pGame();
    const next = takeSameGems(state, "red");
    expect(next.players[0].tokens.red).toBe(2);
    expect(next.board.bank.red).toBe(2);
  });

  it("should throw if bank has less than 4", () => {
    const state = make2pGame();
    state.board.bank.red = 3;
    expect(() => takeSameGems(state, "red")).toThrow();
  });

  it("should advance to next player", () => {
    const state = make2pGame();
    const next = takeSameGems(state, "red");
    expect(next.currentPlayerIndex).toBe(1);
  });
});

// ── reserveCard ───────────────────────────────────────────────

describe("reserveCard", () => {
  it("should reserve a visible card", () => {
    const state = make2pGame();
    const cardId = state.board.tiers[1].visible[0].id;
    const next = reserveCard(state, cardId);
    expect(next.players[0].reservedCards.length).toBe(1);
    expect(next.players[0].reservedCards[0].id).toBe(cardId);
  });

  it("should give 1 gold token when reserving", () => {
    const state = make2pGame();
    const cardId = state.board.tiers[1].visible[0].id;
    const next = reserveCard(state, cardId);
    expect(next.players[0].tokens.gold).toBe(1);
    expect(next.board.bank.gold).toBe(4);
  });

  it("should refill visible cards after reserve", () => {
    const state = make2pGame();
    const cardId = state.board.tiers[1].visible[0].id;
    const next = reserveCard(state, cardId);
    expect(next.board.tiers[1].visible.length).toBe(4);
    const stillThere = next.board.tiers[1].visible.find((c) => c.id === cardId);
    expect(stillThere).toBeUndefined();
  });

  it("should throw if already have 3 reserved cards", () => {
    let state = make2pGame();
    state = reserveCard(state, state.board.tiers[1].visible[0].id);
    // advance back to p1
    state = takeDifferentGems(state, { red: 1 });
    state = reserveCard(state, state.board.tiers[1].visible[0].id);
    state = takeDifferentGems(state, { blue: 1 });
    state = reserveCard(state, state.board.tiers[1].visible[0].id);
    state = takeDifferentGems(state, { green: 1 });
    expect(() =>
      reserveCard(state, state.board.tiers[1].visible[0].id)
    ).toThrow();
  });
});

// ── computePayment ────────────────────────────────────────────

describe("computePayment", () => {
  it("should compute exact payment with no bonuses", () => {
    const state = make2pGame();
    const player = state.players[0];
    const { canAfford, payment } = computePayment(player, {
      red: 2,
      blue: 1,
      green: 0,
      white: 0,
      black: 0,
    });
    expect(canAfford).toBe(false); // player has no tokens yet
    expect(payment.red).toBe(0);
  });

  it("should afford card after taking gems", () => {
    let state = make2pGame();
    state = takeDifferentGems(state, { red: 1, blue: 1, green: 1 });
    // now p2 turn — skip
    state = takeDifferentGems(state, { white: 1 });
    // p1 turn again
    const player = state.players[0];
    const { canAfford } = computePayment(player, {
      red: 1,
      blue: 1,
      green: 0,
      white: 0,
      black: 0,
    });
    expect(canAfford).toBe(true);
  });

  it("should use wild (gold) for shortfall", () => {
    const state = make2pGame();
    const player = {
      ...state.players[0],
      tokens: { red: 1, blue: 0, green: 0, white: 0, black: 0, gold: 2 },
      bonuses: { red: 0, blue: 0, green: 0, white: 0, black: 0 },
    };
    const { canAfford, payment } = computePayment(player, {
      red: 2,
      blue: 1,
      green: 0,
      white: 0,
      black: 0,
    });
    expect(canAfford).toBe(true);
    expect(payment.red).toBe(1);
    expect(payment.gold).toBe(2); // 1 red shortfall + 1 blue shortfall
  });
});

// ── buyCard ───────────────────────────────────────────────────

describe("buyCard", () => {
  it("should throw if cannot afford", () => {
    const state = make2pGame();
    const cardId = state.board.tiers[1].visible[0].id;
    expect(() => buyCard(state, cardId, false)).toThrow();
  });
});

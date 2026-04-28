import { describe, it, expect } from "bun:test";
import { createGame } from "../splendor.setup";

describe("createGame", () => {
  it("should create a game with 2 players", () => {
    const state = createGame([
      { id: "p1", name: "Alice", isAI: false },
      { id: "p2", name: "Bob", isAI: false },
    ]);
    expect(state.players.length).toBe(2);
    expect(state.phase).toBe("playing");
    expect(state.currentPlayerIndex).toBe(0);
  });

  it("should deal correct token count for 2 players", () => {
    const state = createGame([
      { id: "p1", name: "Alice", isAI: false },
      { id: "p2", name: "Bob", isAI: false },
    ]);
    expect(state.board.bank.red).toBe(4);
    expect(state.board.bank.blue).toBe(4);
    expect(state.board.bank.gold).toBe(5);
  });

  it("should deal correct token count for 4 players", () => {
    const state = createGame([
      { id: "p1", name: "A", isAI: false },
      { id: "p2", name: "B", isAI: false },
      { id: "p3", name: "C", isAI: false },
      { id: "p4", name: "D", isAI: false },
    ]);
    expect(state.board.bank.red).toBe(7);
  });

  it("should deal correct noble count per player count", () => {
    const state2p = createGame([
      { id: "p1", name: "A", isAI: false },
      { id: "p2", name: "B", isAI: false },
    ]);
    expect(state2p.board.nobles.length).toBe(3);

    const state4p = createGame([
      { id: "p1", name: "A", isAI: false },
      { id: "p2", name: "B", isAI: false },
      { id: "p3", name: "C", isAI: false },
      { id: "p4", name: "D", isAI: false },
    ]);
    expect(state4p.board.nobles.length).toBe(5);
  });

  it("should show 4 visible cards per tier", () => {
    const state = createGame([
      { id: "p1", name: "Alice", isAI: false },
      { id: "p2", name: "Bob", isAI: false },
    ]);
    expect(state.board.tiers[1].visible.length).toBe(4);
    expect(state.board.tiers[2].visible.length).toBe(4);
    expect(state.board.tiers[3].visible.length).toBe(4);
  });

  it("should throw error if less than 2 players", () => {
    expect(() =>
      createGame([{ id: "p1", name: "Alice", isAI: false }])
    ).toThrow();
  });

  it("should throw error if more than 4 players", () => {
    expect(() =>
      createGame([
        { id: "p1", name: "A", isAI: false },
        { id: "p2", name: "B", isAI: false },
        { id: "p3", name: "C", isAI: false },
        { id: "p4", name: "D", isAI: false },
        { id: "p5", name: "E", isAI: false },
      ])
    ).toThrow();
  });

  it("should start with empty player hands", () => {
    const state = createGame([
      { id: "p1", name: "Alice", isAI: false },
      { id: "p2", name: "Bob", isAI: false },
    ]);
    const player = state.players[0];
    expect(player.tokens.red).toBe(0);
    expect(player.tokens.gold).toBe(0);
    expect(player.reservedCards.length).toBe(0);
    expect(player.purchasedCards.length).toBe(0);
    expect(player.prestige).toBe(0);
  });
});

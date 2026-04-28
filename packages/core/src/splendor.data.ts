// ============================================================
//  Splendor — Card & Noble Data (Official)
//  90 Development Cards + 10 Noble Tiles
// ============================================================

import { DevelopmentCard, Noble, GemPool } from "./splendor.types";

// ── Helpers ──────────────────────────────────────────────────

function cost(white = 0, blue = 0, green = 0, red = 0, black = 0): GemPool {
  return { white, blue, green, red, black };
}

// ── Tier 1 Cards (40 cards) ──────────────────────────────────

export const TIER1_CARDS: DevelopmentCard[] = [
  // bonus: black
  {
    id: "t1-01",
    tier: 1,
    prestige: 0,
    bonus: "black",
    cost: cost(1, 1, 1, 1, 0),
  },
  {
    id: "t1-02",
    tier: 1,
    prestige: 0,
    bonus: "black",
    cost: cost(1, 2, 1, 1, 0),
  },
  {
    id: "t1-03",
    tier: 1,
    prestige: 0,
    bonus: "black",
    cost: cost(2, 2, 0, 1, 0),
  },
  {
    id: "t1-04",
    tier: 1,
    prestige: 0,
    bonus: "black",
    cost: cost(0, 0, 1, 2, 2),
  },
  {
    id: "t1-05",
    tier: 1,
    prestige: 0,
    bonus: "black",
    cost: cost(0, 0, 0, 3, 0),
  },
  {
    id: "t1-06",
    tier: 1,
    prestige: 0,
    bonus: "black",
    cost: cost(0, 0, 0, 2, 1),
  },
  {
    id: "t1-07",
    tier: 1,
    prestige: 0,
    bonus: "black",
    cost: cost(0, 1, 0, 0, 2),
  },
  {
    id: "t1-08",
    tier: 1,
    prestige: 1,
    bonus: "black",
    cost: cost(0, 4, 0, 0, 0),
  },

  // bonus: white
  {
    id: "t1-09",
    tier: 1,
    prestige: 0,
    bonus: "white",
    cost: cost(0, 1, 1, 1, 1),
  },
  {
    id: "t1-10",
    tier: 1,
    prestige: 0,
    bonus: "white",
    cost: cost(0, 1, 2, 1, 1),
  },
  {
    id: "t1-11",
    tier: 1,
    prestige: 0,
    bonus: "white",
    cost: cost(0, 0, 2, 1, 2),
  },
  {
    id: "t1-12",
    tier: 1,
    prestige: 0,
    bonus: "white",
    cost: cost(2, 0, 2, 0, 0),
  },
  {
    id: "t1-13",
    tier: 1,
    prestige: 0,
    bonus: "white",
    cost: cost(0, 0, 3, 0, 0),
  },
  {
    id: "t1-14",
    tier: 1,
    prestige: 0,
    bonus: "white",
    cost: cost(2, 1, 0, 0, 0),
  },
  {
    id: "t1-15",
    tier: 1,
    prestige: 0,
    bonus: "white",
    cost: cost(0, 0, 0, 1, 2),
  },
  {
    id: "t1-16",
    tier: 1,
    prestige: 1,
    bonus: "white",
    cost: cost(0, 0, 4, 0, 0),
  },

  // bonus: blue
  {
    id: "t1-17",
    tier: 1,
    prestige: 0,
    bonus: "blue",
    cost: cost(1, 0, 1, 1, 1),
  },
  {
    id: "t1-18",
    tier: 1,
    prestige: 0,
    bonus: "blue",
    cost: cost(1, 0, 1, 2, 1),
  },
  {
    id: "t1-19",
    tier: 1,
    prestige: 0,
    bonus: "blue",
    cost: cost(1, 0, 0, 2, 2),
  },
  {
    id: "t1-20",
    tier: 1,
    prestige: 0,
    bonus: "blue",
    cost: cost(0, 0, 0, 2, 2),
  },
  {
    id: "t1-21",
    tier: 1,
    prestige: 0,
    bonus: "blue",
    cost: cost(0, 0, 0, 0, 3),
  },
  {
    id: "t1-22",
    tier: 1,
    prestige: 0,
    bonus: "blue",
    cost: cost(0, 0, 1, 0, 2),
  },
  {
    id: "t1-23",
    tier: 1,
    prestige: 0,
    bonus: "blue",
    cost: cost(1, 0, 0, 0, 2),
  },
  {
    id: "t1-24",
    tier: 1,
    prestige: 1,
    bonus: "blue",
    cost: cost(0, 0, 0, 4, 0),
  },

  // bonus: green
  {
    id: "t1-25",
    tier: 1,
    prestige: 0,
    bonus: "green",
    cost: cost(1, 1, 0, 1, 1),
  },
  {
    id: "t1-26",
    tier: 1,
    prestige: 0,
    bonus: "green",
    cost: cost(1, 1, 0, 1, 2),
  },
  {
    id: "t1-27",
    tier: 1,
    prestige: 0,
    bonus: "green",
    cost: cost(2, 1, 0, 0, 2),
  },
  {
    id: "t1-28",
    tier: 1,
    prestige: 0,
    bonus: "green",
    cost: cost(2, 0, 0, 2, 0),
  },
  {
    id: "t1-29",
    tier: 1,
    prestige: 0,
    bonus: "green",
    cost: cost(0, 3, 0, 0, 0),
  },
  {
    id: "t1-30",
    tier: 1,
    prestige: 0,
    bonus: "green",
    cost: cost(1, 0, 0, 2, 0),
  },
  {
    id: "t1-31",
    tier: 1,
    prestige: 0,
    bonus: "green",
    cost: cost(0, 2, 0, 0, 1),
  },
  {
    id: "t1-32",
    tier: 1,
    prestige: 1,
    bonus: "green",
    cost: cost(0, 0, 0, 0, 4),
  },

  // bonus: red
  {
    id: "t1-33",
    tier: 1,
    prestige: 0,
    bonus: "red",
    cost: cost(1, 1, 1, 0, 1),
  },
  {
    id: "t1-34",
    tier: 1,
    prestige: 0,
    bonus: "red",
    cost: cost(2, 1, 1, 0, 1),
  },
  {
    id: "t1-35",
    tier: 1,
    prestige: 0,
    bonus: "red",
    cost: cost(2, 0, 1, 0, 2),
  },
  {
    id: "t1-36",
    tier: 1,
    prestige: 0,
    bonus: "red",
    cost: cost(0, 2, 0, 0, 2),
  },
  {
    id: "t1-37",
    tier: 1,
    prestige: 0,
    bonus: "red",
    cost: cost(0, 0, 0, 0, 3),
  },
  {
    id: "t1-38",
    tier: 1,
    prestige: 0,
    bonus: "red",
    cost: cost(2, 0, 1, 0, 0),
  },
  {
    id: "t1-39",
    tier: 1,
    prestige: 0,
    bonus: "red",
    cost: cost(1, 0, 2, 0, 0),
  },
  {
    id: "t1-40",
    tier: 1,
    prestige: 1,
    bonus: "red",
    cost: cost(4, 0, 0, 0, 0),
  },
];

// ── Tier 2 Cards (30 cards) ──────────────────────────────────

export const TIER2_CARDS: DevelopmentCard[] = [
  // bonus: black
  {
    id: "t2-01",
    tier: 2,
    prestige: 1,
    bonus: "black",
    cost: cost(3, 2, 2, 0, 0),
  },
  {
    id: "t2-02",
    tier: 2,
    prestige: 1,
    bonus: "black",
    cost: cost(3, 0, 3, 0, 2),
  },
  {
    id: "t2-03",
    tier: 2,
    prestige: 2,
    bonus: "black",
    cost: cost(0, 1, 4, 2, 0),
  },
  {
    id: "t2-04",
    tier: 2,
    prestige: 2,
    bonus: "black",
    cost: cost(0, 0, 5, 3, 0),
  },
  {
    id: "t2-05",
    tier: 2,
    prestige: 2,
    bonus: "black",
    cost: cost(5, 0, 0, 0, 0),
  },
  {
    id: "t2-06",
    tier: 2,
    prestige: 3,
    bonus: "black",
    cost: cost(0, 0, 0, 0, 6),
  },

  // bonus: white
  {
    id: "t2-07",
    tier: 2,
    prestige: 1,
    bonus: "white",
    cost: cost(0, 0, 2, 3, 2),
  },
  {
    id: "t2-08",
    tier: 2,
    prestige: 1,
    bonus: "white",
    cost: cost(2, 3, 0, 3, 0),
  },
  {
    id: "t2-09",
    tier: 2,
    prestige: 2,
    bonus: "white",
    cost: cost(0, 0, 1, 0, 4),
  }, // fixed: was 'white'
  {
    id: "t2-10",
    tier: 2,
    prestige: 2,
    bonus: "white",
    cost: cost(0, 0, 0, 5, 3),
  },
  {
    id: "t2-11",
    tier: 2,
    prestige: 2,
    bonus: "white",
    cost: cost(0, 0, 0, 0, 5),
  },
  {
    id: "t2-12",
    tier: 2,
    prestige: 3,
    bonus: "white",
    cost: cost(6, 0, 0, 0, 0),
  },

  // bonus: blue
  {
    id: "t2-13",
    tier: 2,
    prestige: 1,
    bonus: "blue",
    cost: cost(0, 2, 2, 3, 0),
  },
  {
    id: "t2-14",
    tier: 2,
    prestige: 1,
    bonus: "blue",
    cost: cost(0, 2, 3, 0, 3),
  },
  {
    id: "t2-15",
    tier: 2,
    prestige: 2,
    bonus: "blue",
    cost: cost(4, 2, 0, 0, 1),
  },
  {
    id: "t2-16",
    tier: 2,
    prestige: 2,
    bonus: "blue",
    cost: cost(0, 5, 3, 0, 0),
  },
  {
    id: "t2-17",
    tier: 2,
    prestige: 2,
    bonus: "blue",
    cost: cost(0, 5, 0, 0, 0),
  },
  {
    id: "t2-18",
    tier: 2,
    prestige: 3,
    bonus: "blue",
    cost: cost(0, 6, 0, 0, 0),
  },

  // bonus: green
  {
    id: "t2-19",
    tier: 2,
    prestige: 1,
    bonus: "green",
    cost: cost(2, 0, 0, 2, 3),
  },
  {
    id: "t2-20",
    tier: 2,
    prestige: 1,
    bonus: "green",
    cost: cost(0, 3, 0, 2, 3),
  },
  {
    id: "t2-21",
    tier: 2,
    prestige: 2,
    bonus: "green",
    cost: cost(1, 0, 0, 4, 2),
  },
  {
    id: "t2-22",
    tier: 2,
    prestige: 2,
    bonus: "green",
    cost: cost(0, 0, 5, 0, 3),
  },
  {
    id: "t2-23",
    tier: 2,
    prestige: 2,
    bonus: "green",
    cost: cost(0, 0, 5, 0, 0),
  },
  {
    id: "t2-24",
    tier: 2,
    prestige: 3,
    bonus: "green",
    cost: cost(0, 0, 6, 0, 0),
  },

  // bonus: red
  {
    id: "t2-25",
    tier: 2,
    prestige: 1,
    bonus: "red",
    cost: cost(0, 3, 0, 0, 3),
  }, // fixed
  {
    id: "t2-26",
    tier: 2,
    prestige: 1,
    bonus: "red",
    cost: cost(2, 0, 0, 3, 2),
  },
  {
    id: "t2-27",
    tier: 2,
    prestige: 2,
    bonus: "red",
    cost: cost(1, 4, 2, 0, 0),
  },
  {
    id: "t2-28",
    tier: 2,
    prestige: 2,
    bonus: "red",
    cost: cost(3, 0, 0, 0, 5),
  },
  {
    id: "t2-29",
    tier: 2,
    prestige: 2,
    bonus: "red",
    cost: cost(0, 0, 0, 5, 0),
  },
  {
    id: "t2-30",
    tier: 2,
    prestige: 3,
    bonus: "red",
    cost: cost(0, 0, 0, 6, 0),
  },
];

// ── Tier 3 Cards (20 cards) ──────────────────────────────────

export const TIER3_CARDS: DevelopmentCard[] = [
  // bonus: black
  {
    id: "t3-01",
    tier: 3,
    prestige: 3,
    bonus: "black",
    cost: cost(3, 3, 3, 5, 0),
  },
  {
    id: "t3-02",
    tier: 3,
    prestige: 4,
    bonus: "black",
    cost: cost(0, 0, 0, 7, 3),
  },
  {
    id: "t3-03",
    tier: 3,
    prestige: 4,
    bonus: "black",
    cost: cost(3, 0, 0, 0, 7),
  },
  {
    id: "t3-04",
    tier: 3,
    prestige: 5,
    bonus: "black",
    cost: cost(0, 0, 0, 0, 7),
  },

  // bonus: white
  {
    id: "t3-05",
    tier: 3,
    prestige: 3,
    bonus: "white",
    cost: cost(0, 3, 3, 3, 5),
  },
  {
    id: "t3-06",
    tier: 3,
    prestige: 4,
    bonus: "white",
    cost: cost(7, 3, 0, 0, 0),
  },
  {
    id: "t3-07",
    tier: 3,
    prestige: 4,
    bonus: "white",
    cost: cost(7, 0, 0, 0, 3),
  },
  {
    id: "t3-08",
    tier: 3,
    prestige: 5,
    bonus: "white",
    cost: cost(7, 0, 0, 0, 0),
  },

  // bonus: blue
  {
    id: "t3-09",
    tier: 3,
    prestige: 3,
    bonus: "blue",
    cost: cost(3, 0, 3, 3, 5),
  },
  {
    id: "t3-10",
    tier: 3,
    prestige: 4,
    bonus: "blue",
    cost: cost(0, 7, 3, 0, 0),
  },
  {
    id: "t3-11",
    tier: 3,
    prestige: 4,
    bonus: "blue",
    cost: cost(3, 7, 0, 0, 0),
  },
  {
    id: "t3-12",
    tier: 3,
    prestige: 5,
    bonus: "blue",
    cost: cost(0, 7, 0, 0, 0),
  },

  // bonus: green
  {
    id: "t3-13",
    tier: 3,
    prestige: 3,
    bonus: "green",
    cost: cost(5, 3, 0, 3, 3),
  },
  {
    id: "t3-14",
    tier: 3,
    prestige: 4,
    bonus: "green",
    cost: cost(0, 0, 7, 3, 0),
  },
  {
    id: "t3-15",
    tier: 3,
    prestige: 4,
    bonus: "green",
    cost: cost(0, 3, 7, 0, 0),
  },
  {
    id: "t3-16",
    tier: 3,
    prestige: 5,
    bonus: "green",
    cost: cost(0, 0, 7, 0, 0),
  },

  // bonus: red
  {
    id: "t3-17",
    tier: 3,
    prestige: 3,
    bonus: "red",
    cost: cost(3, 5, 3, 0, 3),
  },
  {
    id: "t3-18",
    tier: 3,
    prestige: 4,
    bonus: "red",
    cost: cost(0, 0, 0, 7, 3),
  }, // fixed
  {
    id: "t3-19",
    tier: 3,
    prestige: 4,
    bonus: "red",
    cost: cost(0, 0, 3, 7, 0),
  },
  {
    id: "t3-20",
    tier: 3,
    prestige: 5,
    bonus: "red",
    cost: cost(0, 0, 0, 7, 0),
  },
];

// ── Noble Tiles (10 nobles, use 3+1 per player count) ────────

export const ALL_NOBLES: Noble[] = [
  { id: "n-01", prestige: 3, requirement: cost(0, 0, 4, 4, 0) },
  { id: "n-02", prestige: 3, requirement: cost(3, 3, 3, 0, 0) },
  { id: "n-03", prestige: 3, requirement: cost(0, 4, 0, 0, 4) },
  { id: "n-04", prestige: 3, requirement: cost(0, 4, 4, 0, 0) },
  { id: "n-05", prestige: 3, requirement: cost(3, 0, 0, 3, 3) },
  { id: "n-06", prestige: 3, requirement: cost(0, 0, 0, 4, 4) },
  { id: "n-07", prestige: 3, requirement: cost(4, 0, 0, 0, 4) },
  { id: "n-08", prestige: 3, requirement: cost(0, 3, 3, 3, 0) },
  { id: "n-09", prestige: 3, requirement: cost(4, 4, 0, 0, 0) },
  { id: "n-10", prestige: 3, requirement: cost(3, 0, 3, 0, 3) },
];

// ── Exports ──────────────────────────────────────────────────

export const ALL_CARDS: DevelopmentCard[] = [
  ...TIER1_CARDS,
  ...TIER2_CARDS,
  ...TIER3_CARDS,
];

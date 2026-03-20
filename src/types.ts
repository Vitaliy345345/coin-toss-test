export type CoinSide = "heads" | "tails";

export type GameOutcome = "win" | "lose";

export interface CoinTossResponse {
  result: CoinSide;
}

export type GamePhase = "idle" | "flipping" | "landing" | "result";

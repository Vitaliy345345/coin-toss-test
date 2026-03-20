import { create } from "zustand";
import type { CoinSide, GameOutcome, GamePhase } from "../types";
import { tossCoin } from "../api/coinToss";

export interface GameState {
  playerChoice: CoinSide | null;
  phase: GamePhase;
  result: CoinSide | null;
  outcome: GameOutcome | null;
  wins: number;
  losses: number;
  rounds: number;
}

export interface GameActions {
  makeChoice: (choice: CoinSide) => void;
  onLandingComplete: () => void;
  resetRound: () => void;
  setApiResult: (result: CoinSide) => void;
}

export type GameStore = GameState & GameActions;

const initialState: GameState = {
  playerChoice: null,
  phase: "idle",
  result: null,
  outcome: null,
  wins: 0,
  losses: 0,
  rounds: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  makeChoice: (choice: CoinSide) => {
    if (get().phase !== "idle") return;

    set({
      playerChoice: choice,
      phase: "flipping",
      result: null,
      outcome: null,
    });

    tossCoin()
      .then(({ result }) => {
        get().setApiResult(result);
      })
      .catch(() => {
        set({ phase: "idle", playerChoice: null });
      });
  },

  setApiResult: (result: CoinSide) => {
    const { playerChoice } = get();
    const outcome: GameOutcome = playerChoice === result ? "win" : "lose";

    set({ result, outcome, phase: "landing" });
  },

  onLandingComplete: () => {
    const { outcome, wins, losses, rounds } = get();
    set({
      phase: "result",
      wins: outcome === "win" ? wins + 1 : wins,
      losses: outcome === "lose" ? losses + 1 : losses,
      rounds: rounds + 1,
    });
  },

  resetRound: () => {
    set({
      playerChoice: null,
      phase: "idle",
      result: null,
      outcome: null,
    });
  },
}));

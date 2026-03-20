import type { CoinTossResponse } from "../types";

export function tossCoin(): Promise<CoinTossResponse> {
  return new Promise((resolve) => {
    const delay = 500 + Math.random() * 1000;
    const result = Math.random() > 0.5 ? "heads" : "tails";

    setTimeout(() => {
      resolve({ result });
    }, delay);
  });
}

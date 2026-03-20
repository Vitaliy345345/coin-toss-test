import { useGameStore } from "../store/gameStore";
import type { CoinSide } from "../types";
import styles from "./ChoiceButtons.module.css";

export function ChoiceButtons() {
  const phase = useGameStore((s) => s.phase);
  const makeChoice = useGameStore((s) => s.makeChoice);

  const isDisabled = phase !== "idle";

  const handleClick = (choice: CoinSide) => {
    if (!isDisabled) {
      makeChoice(choice);
    }
  };

  return (
    <div className={styles.buttons}>
      <button
        className={styles.heads}
        disabled={isDisabled}
        onClick={() => handleClick("heads")}
        aria-label="Choose Heads"
      >
        <span className={styles.icon}>H</span>
        <span className={styles.label}>Heads</span>
      </button>

      <button
        className={styles.tails}
        disabled={isDisabled}
        onClick={() => handleClick("tails")}
        aria-label="Choose Tails"
      >
        <span className={styles.icon}>T</span>
        <span className={styles.label}>Tails</span>
      </button>
    </div>
  );
}

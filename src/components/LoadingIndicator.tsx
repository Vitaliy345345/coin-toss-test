import { useGameStore } from "../store/gameStore";
import styles from "./LoadingIndicator.module.css";

export function LoadingIndicator() {
  const phase = useGameStore((s) => s.phase);
  const playerChoice = useGameStore((s) => s.playerChoice);

  if (phase !== "flipping") return null;

  return (
    <div className={styles.indicator} role="status" aria-live="polite">
      <div className={styles.spinner} />
      <span>
        Flipping... You chose <strong>{playerChoice}</strong>
      </span>
    </div>
  );
}

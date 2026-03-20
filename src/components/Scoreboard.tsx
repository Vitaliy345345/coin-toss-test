import { useGameStore } from "../store/gameStore";
import styles from "./Scoreboard.module.css";

export function Scoreboard() {
  const wins = useGameStore((s) => s.wins);
  const losses = useGameStore((s) => s.losses);
  const rounds = useGameStore((s) => s.rounds);

  if (rounds === 0) return null;

  return (
    <div className={styles.scoreboard} aria-label="Score">
      <div className={`${styles.item} ${styles.wins}`}>
        <span className={styles.label}>Wins</span>
        <span className={styles.value}>{wins}</span>
      </div>
      <div className={`${styles.item} ${styles.rounds}`}>
        <span className={styles.label}>Rounds</span>
        <span className={styles.value}>{rounds}</span>
      </div>
      <div className={`${styles.item} ${styles.losses}`}>
        <span className={styles.label}>Losses</span>
        <span className={styles.value}>{losses}</span>
      </div>
    </div>
  );
}

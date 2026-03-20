import { useEffect, useRef, useCallback } from "react";
import { useGameStore } from "../store/gameStore";
import { useSound } from "../hooks/useSound";
import styles from "./ResultPopup.module.css";

export function ResultPopup() {
  const phase = useGameStore((s) => s.phase);
  const outcome = useGameStore((s) => s.outcome);
  const result = useGameStore((s) => s.result);
  const playerChoice = useGameStore((s) => s.playerChoice);
  const resetRound = useGameStore((s) => s.resetRound);
  const { play } = useSound();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const isVisible = phase === "result" && outcome !== null;

  const scheduleAutoDismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      resetRound();
    }, 2500);
  }, [resetRound]);

  useEffect(() => {
    if (isVisible && outcome) {
      play(outcome === "win" ? "win" : "lose");
      scheduleAutoDismiss();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isVisible, outcome, play, scheduleAutoDismiss]);

  if (!isVisible || !outcome) return null;

  const isWin = outcome === "win";

  return (
    <div className={`${styles.overlay} ${styles.visible}`}>
      <div ref={cardRef} className={isWin ? styles.cardWin : styles.cardLose}>
        <div className={styles.title}>{isWin ? "You Win!" : "You Lose!"}</div>
        <div className={styles.details}>
          You chose <strong>{playerChoice}</strong> -- coin landed on{" "}
          <strong>{result}</strong>
        </div>
      </div>
    </div>
  );
}

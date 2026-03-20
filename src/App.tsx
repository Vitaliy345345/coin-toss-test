import { GameCanvas } from "./game/GameCanvas";
import { ChoiceButtons } from "./components/ChoiceButtons";
import { ResultPopup } from "./components/ResultPopup";
import { LoadingIndicator } from "./components/LoadingIndicator";
import { Scoreboard } from "./components/Scoreboard";
import styles from "./App.module.css";

export default function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Coin Toss</h1>
        <Scoreboard />
      </header>

      <main className={styles.main}>
        <div className={styles.canvasArea}>
          <GameCanvas />
        </div>

        <div className={styles.controls}>
          <LoadingIndicator />
          <ChoiceButtons />
        </div>
      </main>

      <ResultPopup />
    </div>
  );
}

import { useRef } from "react";
import { Application } from "@pixi/react";
import { CoinSprite } from "./CoinSprite";
import styles from "./GameCanvas.module.css";

export function GameCanvas() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <Application
        width={400}
        height={400}
        background={0x1a1a2e}
        antialias
        resizeTo={wrapperRef}
      >
        <CoinSprite />
      </Application>
    </div>
  );
}

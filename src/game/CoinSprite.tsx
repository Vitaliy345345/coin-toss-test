import { useCallback, useRef, useEffect } from "react";
import { useTick, useApplication, extend } from "@pixi/react";
import { Graphics, Container, Text, TextStyle } from "pixi.js";
import { useGameStore } from "../store/gameStore";
import { useSound } from "../hooks/useSound";
import type { CoinSide, GamePhase } from "../types";

extend({ Graphics, Container, Text });

const COIN_RADIUS = 80;
const HEADS_COLOR = 0xffd700;
const TAILS_COLOR = 0xc0c0c0;
const BORDER_COLOR_HEADS = 0xb8860b;
const BORDER_COLOR_TAILS = 0x808080;
const FLIP_SPEED = 50;
const FLIP_DECAY = 1.8;
const TOSS_HEIGHT = 120;
const TOSS_DURATION = 0.7;
const MAX_LANDING_DURATION = 1.5;
const MIN_LANDING_DURATION = 0.4;

interface CoinState {
  flipAngle: number;
  yOffset: number;
  landingComplete: boolean;
  landingStartAngle: number;
  landingTargetAngle: number;
  landingStartY: number;
  landingDuration: number;
  landingTime: number;
  idleTime: number;
  flipTime: number;
  prevPhase: GamePhase;
}

function computeTargetAngle(
  currentAngle: number,
  side: CoinSide,
  currentSpeed: number,
): number {
  const maxReach = currentSpeed * MAX_LANDING_DURATION * 0.5;
  const buffer = Math.max(Math.PI * 0.3, Math.min(maxReach * 0.3, Math.PI));
  const minTarget = currentAngle + buffer;
  const multiplesOfPi = Math.ceil(minTarget / Math.PI);

  const needsEven = side === "heads";
  let n = multiplesOfPi;
  if (needsEven && n % 2 !== 0) n += 1;
  if (!needsEven && n % 2 === 0) n += 1;

  return n * Math.PI;
}

export function CoinSprite() {
  const { app } = useApplication();
  const { play } = useSound();

  const phase = useGameStore((s) => s.phase);
  const result = useGameStore((s) => s.result);
  const onLandingComplete = useGameStore((s) => s.onLandingComplete);

  const coinRef = useRef<CoinState>({
    flipAngle: 0,
    yOffset: 0,
    landingComplete: false,
    landingStartAngle: 0,
    landingTargetAngle: 0,
    landingStartY: 0,
    landingDuration: 1,
    landingTime: 0,
    idleTime: 0,
    flipTime: 0,
    prevPhase: "idle",
  });

  const drawCoin = useCallback((g: Graphics, side: CoinSide) => {
    g.clear();

    const isHeads = side === "heads";
    const fillColor = isHeads ? HEADS_COLOR : TAILS_COLOR;
    const borderColor = isHeads ? BORDER_COLOR_HEADS : BORDER_COLOR_TAILS;

    g.circle(0, 0, COIN_RADIUS);
    g.fill({ color: borderColor });

    g.circle(0, 0, COIN_RADIUS - 4);
    g.fill({ color: fillColor });

    g.circle(0, 0, COIN_RADIUS - 12);
    g.stroke({ color: borderColor, width: 2, alpha: 0.4 });

    return g;
  }, []);

  const containerRef = useRef<Container | null>(null);
  const headsGfxRef = useRef<Graphics | null>(null);
  const tailsGfxRef = useRef<Graphics | null>(null);
  const headsTextRef = useRef<Text | null>(null);
  const tailsTextRef = useRef<Text | null>(null);
  const shadowRef = useRef<Graphics | null>(null);

  useEffect(() => {
    if (!app) return;

    const screenW = app.screen.width;
    const screenH = app.screen.height;

    const container = new Container();
    container.x = screenW / 2;
    container.y = screenH / 2;
    app.stage.addChild(container);
    containerRef.current = container;

    const shadow = new Graphics();
    shadow.ellipse(0, COIN_RADIUS + 20, COIN_RADIUS * 0.7, 12);
    shadow.fill({ color: 0x000000, alpha: 0.2 });
    container.addChild(shadow);
    shadowRef.current = shadow;

    const headsGfx = new Graphics();
    drawCoin(headsGfx, "heads");
    container.addChild(headsGfx);
    headsGfxRef.current = headsGfx;

    const headsText = new Text({
      text: "H",
      style: new TextStyle({
        fontFamily: "Georgia, serif",
        fontSize: 64,
        fontWeight: "bold",
        fill: 0xb8860b,
      }),
    });
    headsText.anchor.set(0.5);
    container.addChild(headsText);
    headsTextRef.current = headsText;

    const tailsGfx = new Graphics();
    drawCoin(tailsGfx, "tails");
    tailsGfx.visible = false;
    container.addChild(tailsGfx);
    tailsGfxRef.current = tailsGfx;

    const tailsText = new Text({
      text: "T",
      style: new TextStyle({
        fontFamily: "Georgia, serif",
        fontSize: 64,
        fontWeight: "bold",
        fill: 0x606060,
      }),
    });
    tailsText.anchor.set(0.5);
    tailsText.visible = false;
    container.addChild(tailsText);
    tailsTextRef.current = tailsText;

    return () => {
      app.stage.removeChild(container);
      container.destroy({ children: true });
    };
  }, [app, drawCoin]);

  useEffect(() => {
    if (!app || !containerRef.current) return;

    const onResize = () => {
      if (containerRef.current && app.screen) {
        containerRef.current.x = app.screen.width / 2;
        containerRef.current.y = app.screen.height / 2;
      }
    };

    app.renderer.on("resize", onResize);
    return () => {
      app.renderer.off("resize", onResize);
    };
  }, [app]);

  useTick((ticker) => {
    const state = coinRef.current;
    const dt = ticker.deltaMS / 1000;

    const container = containerRef.current;
    const headsGfx = headsGfxRef.current;
    const tailsGfx = tailsGfxRef.current;
    const headsText = headsTextRef.current;
    const tailsText = tailsTextRef.current;
    const shadow = shadowRef.current;

    if (
      !container ||
      !headsGfx ||
      !tailsGfx ||
      !headsText ||
      !tailsText ||
      !shadow
    )
      return;

    if (phase !== state.prevPhase) {
      if (phase === "flipping") {
        state.flipTime = 0;
        state.idleTime = 0;
      } else if (phase === "landing" && result) {
        const currentSpeed =
          FLIP_SPEED * Math.exp(-FLIP_DECAY * state.flipTime);
        state.landingComplete = false;
        state.landingStartAngle = state.flipAngle;
        state.landingStartY = state.yOffset;
        state.landingTargetAngle = computeTargetAngle(
          state.flipAngle,
          result,
          currentSpeed,
        );
        const distance = state.landingTargetAngle - state.landingStartAngle;
        state.landingDuration = Math.max(
          MIN_LANDING_DURATION,
          Math.min((2 * distance) / currentSpeed, MAX_LANDING_DURATION),
        );
        state.landingTime = 0;
      }
      state.prevPhase = phase;
    }

    if (phase === "flipping") {
      state.flipTime += dt;

      const currentSpeed = FLIP_SPEED * Math.exp(-FLIP_DECAY * state.flipTime);
      const prevAngle = state.flipAngle;
      state.flipAngle += currentSpeed * dt;

      if (state.flipTime < TOSS_DURATION) {
        const t = state.flipTime / TOSS_DURATION;
        state.yOffset = -TOSS_HEIGHT * Math.sin(Math.PI * Math.pow(t, 0.55));
      } else {
        state.yOffset = 0;
      }

      const prevCos = Math.cos(prevAngle);
      const currCos = Math.cos(state.flipAngle);
      if (prevCos * currCos < 0) {
        play("flipTick");
      }
    } else if (phase === "landing") {
      if (!state.landingComplete) {
        state.landingTime += dt;
        const p = Math.min(state.landingTime / state.landingDuration, 1);
        const eased = 1 - (1 - p) * (1 - p);
        const prevAngle = state.flipAngle;

        if (p >= 1) {
          state.flipAngle = state.landingTargetAngle;
          state.yOffset = 0;
          state.landingComplete = true;
          play("land");
          setTimeout(onLandingComplete, 0);
        } else {
          state.flipAngle =
            state.landingStartAngle +
            (state.landingTargetAngle - state.landingStartAngle) * eased;
          state.yOffset = state.landingStartY * (1 - eased);
        }

        const prevCos = Math.cos(prevAngle);
        const currCos = Math.cos(state.flipAngle);
        if (prevCos * currCos < 0) {
          play("flipTick");
        }
      }
    } else if (phase === "idle") {
      state.idleTime += dt;
      state.yOffset = Math.sin(state.idleTime * 1.25) * 4;
    }

    const scaleX = Math.cos(state.flipAngle);
    const absScaleX = Math.abs(scaleX);

    const isShowingHeads = scaleX >= 0;

    headsGfx.visible = isShowingHeads;
    headsText.visible = isShowingHeads;
    tailsGfx.visible = !isShowingHeads;
    tailsText.visible = !isShowingHeads;

    headsGfx.scale.x = absScaleX;
    tailsGfx.scale.x = absScaleX;
    headsText.scale.x = absScaleX;
    tailsText.scale.x = absScaleX;

    headsGfx.y = state.yOffset;
    tailsGfx.y = state.yOffset;
    headsText.y = state.yOffset;
    tailsText.y = state.yOffset;

    const shadowScale = 1 + state.yOffset / 300;
    shadow.scale.x = shadowScale;
    shadow.alpha = 0.2 + state.yOffset / 600;
  });

  return null;
}

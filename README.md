# Coin Toss

A polished mini web game built with React, Pixi.js, and Zustand. Pick Heads or Tails, watch the coin flip with smooth animation, and see if you win.

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### Production Build

```bash
npm run build
npm run preview   # serve the production build locally
```

### Linting & Formatting

```bash
npm run lint        # check for ESLint + Prettier issues
npm run lint:fix    # auto-fix ESLint + Prettier issues
npm run format      # run Prettier only
```

## How It Works

### Game Loop

1. The player sees two buttons -- **Heads** and **Tails** -- and picks one.
2. On click, an asynchronous request is sent to a mock API that randomly determines the outcome.
3. In parallel, a coin flip animation starts on the Pixi.js canvas using the built-in ticker.
4. When the API responds, the coin smoothly decelerates and lands on the correct side (Heads or Tails).
5. A result popup shows **"You Win!"** or **"You Lose!"** for 2.5 seconds and then auto-disappears.
6. The player can start a new round.

### Mock API

The mock API (`src/api/coinToss.ts`) uses `Math.random()` to decide the outcome and wraps the response in a `Promise` with a random delay between 500 ms and 1500 ms, simulating real network latency. The response shape is `{ result: "heads" | "tails" }`.

## Tech Stack

| Tool            | Purpose                                         |
| --------------- | ----------------------------------------------- |
| **Vite**        | Bundler and development server                  |
| **React 19**    | UI framework                                    |
| **TypeScript**  | Type safety throughout the codebase             |
| **Pixi.js v8**  | 2D WebGL/WebGPU rendering for the coin canvas   |
| **@pixi/react** | React bindings for Pixi.js (Application, hooks) |
| **Zustand**     | Lightweight global state management             |
| **ESLint**      | Code quality linting                            |
| **Prettier**    | Consistent code formatting                      |

## Architecture

```
src/
  api/           Mock coin toss API
  store/         Zustand game state
  game/          Pixi.js canvas and coin animation
  components/    React UI overlays (buttons, popup, scoreboard)
  hooks/         Custom hooks (sound effects)
  types.ts       Shared TypeScript types
  App.tsx        Root layout
  main.tsx       Entry point
  index.css      Global styles and responsive layout
```

### Key Architectural Decisions

**State management with Zustand** -- The game state (player choice, phase, API result, outcome, score) lives in a single Zustand store. Components subscribe to individual slices of state for minimal re-renders. The store also contains the action methods (`makeChoice`, `setApiResult`, `onLandingComplete`, `resetRound`), keeping game logic centralized and testable.

**Phase-based game loop** -- Instead of a tangle of boolean flags, the game uses a single `phase` field with four possible values: `idle`, `flipping`, `landing`, and `result`. Each phase drives both the UI and the animation, making the flow easy to reason about.

**Imperative Pixi.js rendering** -- While `@pixi/react` provides a declarative `<Application>` component, the coin itself is managed imperatively via refs and Pixi's `Graphics` / `Text` classes. This gives full control over the flip animation without the overhead of reconciling Pixi display objects through React's virtual DOM on every frame.

**3D flip illusion** -- The flip effect is achieved by modulating `scaleX = cos(angle)` on the coin graphics. When `scaleX` crosses zero (the coin is edge-on), the displayed side swaps between Heads and Tails. Combined with a vertical oscillation (`yOffset`), this creates a convincing toss-and-flip animation.

**Landing deceleration** -- When the API response arrives, the animation transitions to a "landing" phase. The target angle is calculated so the coin stops on the correct side. An ease-out cubic curve decelerates the flip smoothly.

**Synthesized sound effects** -- All sounds are generated programmatically using the Web Audio API (oscillators and gain envelopes). This eliminates the need for external audio files and keeps the build small. Four distinct sounds are used: a metallic tick on each half-flip, a thud on landing, an ascending chime for a win, and a descending tone for a loss.

**Responsive layout** -- The CSS uses `@media (orientation: ...)` queries to switch between a vertical layout (portrait) and a horizontal layout (landscape). In landscape mode, the canvas takes the left side and controls stack on the right, preventing the buttons from being pushed off-screen. The Pixi canvas auto-resizes via `resizeTo`.

## Bonus Features

1. **Sound effects** -- Procedurally generated using the Web Audio API. Coin flip tick, landing thud, win chime, and lose tone. No external audio files needed.
2. **Scoreboard** -- Running win/loss/round counter displayed in the header.

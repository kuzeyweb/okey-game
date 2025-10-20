# Okey Game

A browser-based Okey game built using **React**, **TypeScript**, and **Vite**.

This project features modular components, custom hooks for game logic and drag-and-drop interactions, and a clear separation between UI and core logic.

🎮 Live Demo: https://okey-game-one.vercel.app

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- pnpm, npm, or yarn

### Installation

Install dependencies using one of the following commands:

```bash
pnpm install
# or
npm install
# or
yarn
```

### Development

Run the development server:

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

### Build

Create a production build:

```bash
pnpm build
# or
npm run build
# or
yarn build
```

---

## Project Structure

```
src/
  App.tsx
  components/
    board/
      BoardTop.tsx
      BoardMiddle.tsx
      BoardBottom.tsx
    tiles/
      TileGrid.tsx
      ThrowedTileDeck.tsx
      TileCard.tsx
    media/
      YTVideoPlayer.tsx
  hooks/
    useDragDrop.ts
    useGameState.ts
  utils/
    gameUtils.ts
    gameLogic.ts
    debug.ts
  assets/
    istaka.png
    react.svg
```

Components are grouped logically under **components/board**, **components/tiles**, and **components/media** for better clarity.

---

## Key Concepts

- **UI / Logic Separation:** Core gameplay logic is handled inside `utils/gameLogic.ts`, while pure helper functions are kept in `utils/gameUtils.ts`.
- **State Management:** `useGameState` manages turn flow, sorting, and win conditions.
- **Drag and Drop:** `useDragDrop` handles all tile drag-and-drop interactions.
- **Debugging:** `utils/debug.ts` allows toggling of log outputs for easier troubleshooting.

---

## Debugging

Enable or disable debug logging via `src/utils/debug.ts`:

```ts
export const DEBUG_CONFIG = {
  enabled: false,
  levels: {
    STATE_CHANGES: true,
    GAME_EVENTS: true,
    DRAG_DROP: true,
  },
};
```

When `enabled` is set to `true`, relevant events and state changes will be logged to the console using `console.info`. Render-related logs are intentionally omitted to avoid noise.

---

## Available Scripts

- **dev:** Starts the development server
- **build:** Builds the project for production
- **preview:** Serves the production build locally (if configured in Vite)

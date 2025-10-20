# Okey Game

A browser-based Okey game implemented with React + TypeScript and Vite. The project features modular components, custom hooks for game logic and drag-and-drop, and clear separation of UI and logic.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm, npm, or yarn

### Install

`ash
pnpm install

# or

npm install

# or

yarn
`

### Run

`ash
pnpm dev

# or

npm run dev

# or

yarn dev
`

### Build

`ash
pnpm build

# or

npm run build

# or

yarn build
`

## Project Structure

`src/
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
    react.svg`

## Key Concepts

- Components are organized under components/board, components/tiles, and components/media for clarity.
- Core game logic is contained in utils/gameLogic.ts and pure utilities in utils/gameUtils.ts.
- useGameState manages turn flow, auto-sort, and win checks.
- useDragDrop encapsulates drag/drop interactions.

## Debugging

A simple debug utility is provided in src/utils/debug.ts.

- Toggle all debug logs:
  `	s
// src/utils/debug.ts
export const DEBUG_CONFIG = {
  enabled: false,
  levels: {
    STATE_CHANGES: true,
    GAME_EVENTS: true,
    DRAG_DROP: true,
  },
};
`
- When enabled is true, functions will emit console.info logs according to their level.
- Render and initialization paths intentionally do not emit logs to avoid noisy output.

## Scripts

- dev: start development server
- build: production build
- preview: preview built app (if configured by Vite)

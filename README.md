# VOID//RUN

> Kinetic flight protocol: a physics-driven asteroid survival game built with React, TypeScript, and Canvas.

VOID//RUN puts you in control of an interceptor drifting through an increasingly hostile asteroid field. Build momentum, chain kills, collect powerups, and survive as many waves as possible before your hull gives out.

## Features

- Physics-based movement, collisions, recoil, spin, and shockwave feedback
- Wave-based asteroid pressure with a boss fragment every fourth wave
- Combo scoring with time dilation to reward continuous kill streaks
- Shield, triple-shot, and rapid-fire powerups
- Responsive desktop and touch controls
- Local top-five score history with no account or server required
- Serverless client-side game loop rendered on an HTML canvas

## How to Play

1. Initialize a run from the start screen.
2. Thrust, aim, and fire to clear the asteroid field.
3. Keep your kill streak alive to increase your score and bend time.
4. Collect powerups when they appear and use boost to evade collisions.
5. Complete each wave and keep flying until your hull is destroyed.

### Desktop Controls

| Action | Control |
| --- | --- |
| Thrust | `W` `A` `S` `D` or arrow keys |
| Aim | Move the mouse |
| Fire | Hold the left mouse button or `Space` |
| Boost | Hold `Shift` |
| Pause / resume | `P` or `Escape` |
| Start / restart | `Enter` or `Space` on the start or game-over screen |

### Touch Controls

- Use the virtual joystick to move.
- Use the fire control to aim and fire.
- Tap the boost control to burn through danger.
- Tap the game field or a start button to begin or restart a run.

## Score Storage

Scores are stored locally in the browser with the Web Storage API. There is no backend, shared leaderboard, or network request involved.

- Storage key: `void-run-local-scores-v2`
- Storage location: `window.localStorage`
- Maximum entries: 5
- Saved fields: `score`, `wave`, and a display `date`
- Ranking: entries are sorted from highest score to lowest score
- Save timing: a score is saved once when a run ends, if the score is greater than zero

Because scores are device- and browser-specific, they do not follow you to another browser or device. Clearing site data, using private browsing, or blocking local storage can remove or prevent score history. The game continues to work if storage is unavailable, but the run will not be persisted.

To clear the saved scores, open the browser developer console on the game page and run:

```js
localStorage.removeItem("void-run-local-scores-v2");
```

## Getting Started

### Requirements

- Node.js 18 or newer
- npm

### Install and run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in your browser.

### Production build

```bash
npm run build
npm run preview
```

The Vite configuration includes `vite-plugin-singlefile`, so the production build is prepared for a self-contained browser deployment.

## Tech Stack

- React 19
- TypeScript
- Vite
- HTML Canvas 2D API
- Tailwind CSS tooling

## Project Structure

```text
src/
├── App.tsx          # UI, controls, HUD, and score persistence
├── index.css        # Game interface and responsive styling
├── main.tsx         # React entry point
├── game/
│   └── engine.ts    # Simulation, physics, scoring, and rendering
└── utils/
	└── cn.ts        # Class-name utility
```

## License

No license has been specified for this project.

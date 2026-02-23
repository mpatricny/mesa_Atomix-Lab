# Atomix Lab

A chemistry puzzle game where you slide atoms on a grid to build real molecules. Learn about chemical bonding, molecular structure, and elements as you progress through 50 hand-crafted levels across five themed laboratories.

Play it at [playmesa.com](https://playmesa.com)

## How to Play

Select an atom and slide it in any direction (up, down, left, right). Atoms keep sliding until they hit a wall or another atom. Position all atoms to match the target molecule and complete the level.

**Controls:**
- **Mouse/Touch** — Click an atom to select it, then use the on-screen D-pad or arrow keys to move
- **Arrow Keys / WASD** — Move the selected atom
- **Z** — Undo last move
- **R** — Restart level
- **H** — Get a hint
- **ESC** — Back to menu

Earn up to 3 stars per level based on how close your solution is to the optimal number of moves.

## Labs & Levels

The game is organized into 5 progressive labs, each with 10 levels:

| Lab | Theme | Levels | Examples |
|-----|-------|--------|----------|
| 1 | Basics Lab | 1–10 | Water, Methane, Ammonia, Carbon Dioxide |
| 2 | Organic Chemistry | 11–20 | Ethanol, Acetic Acid, Propane, Formic Acid |
| 3 | Functional Groups | 21–30 | Acetone, Glycine, Urea, Alanine, Cysteine |
| 4 | Complex Molecules | 31–40 | Cyclobutane, Lactic Acid, Glycerin, Serine |
| 5 | Master Chemist | 41–50 | Taurine, Pyrimidine, Glutamine, Aspartic Acid |

The final four levels are harder "Challenge" variants of earlier molecules with more complex grid layouts.

## Features

- **50 puzzle levels** with unique grid layouts
- **45+ real molecules** from water to amino acids
- **Star rating system** — solve in fewer moves for more stars
- **Hint system** powered by A* pathfinding
- **Glossary** — unlock element and molecule entries as you play, with real chemical facts
- **Molecule preview** — see the target structure and formula before each level
- **Undo** — rewind moves freely
- **Touch-friendly** — responsive layout with D-pad controls for mobile

## Tech Stack

- Vanilla JavaScript (ES5), no frameworks or build tools
- HTML5 Canvas for game rendering
- Web Audio API for procedural sound effects
- CSS3 with custom properties and animations
- [Mesa SDK](https://playmesa.com) for data persistence

## Running Locally

Serve the project directory with any static file server:

```bash
python3 -m http.server 8888
```

Then open [http://localhost:8888](http://localhost:8888) in your browser.

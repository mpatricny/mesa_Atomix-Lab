#!/usr/bin/env node
/**
 * Level generator for AtomixLab - Fun, Challenging Puzzles
 *
 * Approach:
 *   1. Build structured maps with irregular shapes, corridors, and chambers
 *   2. Find valid goal placements for the molecule
 *   3. Scatter atoms via long random backward walk (guaranteed solvable)
 *   4. Iteratively adjust barriers to tune difficulty
 *   5. Verify with A* solver for optimal move count
 *
 * Hand-crafted levels from the original game are preserved unchanged.
 */
const fs = require('fs');
const path = require('path');

// ============================================================
// Load game modules (molecules + solver) via window mock
// ============================================================
const window = {};
eval(fs.readFileSync(path.join(__dirname, 'js', 'molecules.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, 'js', 'solver.js'), 'utf8'));
const Molecules = window.Molecules;
const Solver = window.Solver;

// ============================================================
// Campaign plan: 50 levels, 10 per lab
// ============================================================
const campaign = [
  // Lab 1 - Basics (1-10)
  { molecule: 'water',              name: 'Water',              lab: 1 },
  { molecule: 'carbon-dioxide',     name: 'Carbon Dioxide',     lab: 1 },
  { molecule: 'hydrogen-sulfide',   name: 'Hydrogen Sulfide',   lab: 1 },
  { molecule: 'ammonia',            name: 'Ammonia',            lab: 1 },
  { molecule: 'hydrogen-peroxide',  name: 'Hydrogen Peroxide',  lab: 1 },
  { molecule: 'methane',            name: 'Methane',            lab: 1 },
  { molecule: 'nitrous-oxide',      name: 'Nitrous Oxide',      lab: 1 },
  { molecule: 'methanal',           name: 'Methanal',           lab: 1 },
  { molecule: 'methanol',           name: 'Methanol',           lab: 1 },
  { molecule: 'phosphoric-acid',    name: 'Phosphoric Acid',    lab: 1 },
  // Lab 2 - Organic Chemistry (11-20)
  { molecule: 'ethylene',           name: 'Ethylene',           lab: 2 },
  { molecule: 'formic-acid',        name: 'Formic Acid',        lab: 2 },
  { molecule: 'vinyl-chloride',     name: 'Vinyl Chloride',     lab: 2 },
  { molecule: 'ethane',             name: 'Ethane',             lab: 2 },
  { molecule: 'ethanol',            name: 'Ethanol',            lab: 2 },
  { molecule: 'dimethyl-ether',     name: 'Dimethyl Ether',     lab: 2 },
  { molecule: 'acetic-acid',        name: 'Acetic Acid',        lab: 2 },
  { molecule: 'ethylene-glycol',    name: 'Ethylene Glycol',    lab: 2 },
  { molecule: 'propane',            name: 'Propane',            lab: 2 },
  { molecule: 'isopropanol',        name: 'Isopropanol',        lab: 2 },
  // Lab 3 - Functional Groups (21-30)
  { molecule: 'methylamine',        name: 'Methylamine',        lab: 3 },
  { molecule: 'urea',               name: 'Urea',               lab: 3 },
  { molecule: 'nitromethane',       name: 'Nitromethane',       lab: 3 },
  { molecule: 'ethanal',            name: 'Ethanal',            lab: 3 },
  { molecule: 'acetone',            name: 'Acetone',            lab: 3 },
  { molecule: 'glycine',            name: 'Glycine',            lab: 3 },
  { molecule: 'dimethyl-sulfoxide', name: 'Dimethyl Sulfoxide', lab: 3 },
  { molecule: 'alanine',            name: 'Alanine',            lab: 3 },
  { molecule: 'cysteine',           name: 'Cysteine',           lab: 3 },
  { molecule: 'propylene',          name: 'Propylene',          lab: 3 },
  // Lab 4 - Complex Molecules (31-40)
  { molecule: 'acrolein',           name: 'Acrolein',           lab: 4 },
  { molecule: 'propanal',           name: 'Propanal',           lab: 4 },
  { molecule: 'pyruvic-acid',       name: 'Pyruvic Acid',       lab: 4 },
  { molecule: 'oxetane',            name: 'Oxetane',            lab: 4 },
  { molecule: 'cyclobutane',        name: 'Cyclobutane',        lab: 4 },
  { molecule: 'lactic-acid',        name: 'Lactic Acid',        lab: 4 },
  { molecule: 'butanol',            name: 'Butanol',            lab: 4 },
  { molecule: 'serine',             name: 'Serine',             lab: 4 },
  { molecule: 'trans-butylen',      name: 'Trans-Butylene',     lab: 4 },
  { molecule: 'glycerin',           name: 'Glycerin',           lab: 4 },
  // Lab 5 - Master Chemist (41-50)
  { molecule: 'pyran',              name: 'Pyran',              lab: 5 },
  { molecule: 'taurine',            name: 'Taurine',            lab: 5 },
  { molecule: 'pyrimidine',         name: 'Pyrimidine',         lab: 5 },
  { molecule: 'aspartic-acid',      name: 'Aspartic Acid',      lab: 5 },
  { molecule: 'glutamine',          name: 'Glutamine',          lab: 5 },
  { molecule: 'chlorine-heptoxide', name: 'Chlorine Heptoxide', lab: 5 },
  { molecule: 'acetone',            name: 'Acetone Challenge',  lab: 5 },
  { molecule: 'propanal',           name: 'Propanal Challenge', lab: 5 },
  { molecule: 'cyclobutane',        name: 'Cyclobutane Challenge', lab: 5 },
  { molecule: 'glycerin',           name: 'Glycerin Challenge', lab: 5 },
];

// ============================================================
// Seeded PRNG (deterministic for reproducible levels)
// ============================================================
let seed = 42;
function setSeed(s) { seed = s & 0x7fffffff; }
function random() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}
function randInt(min, max) { return min + Math.floor(random() * (max - min + 1)); }
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============================================================
// Sliding mechanics
// ============================================================
const DIRS = [
  { dx: 0, dy: -1 },  // up
  { dx: 0, dy: 1 },   // down
  { dx: -1, dy: 0 },  // left
  { dx: 1, dy: 0 }    // right
];

function slideAtom(atomIdx, dx, dy, atoms, walls, width, height) {
  let cx = atoms[atomIdx].x;
  let cy = atoms[atomIdx].y;
  while (true) {
    const nx = cx + dx;
    const ny = cy + dy;
    if (nx < 0 || ny < 0 || nx >= width || ny >= height) break;
    if (walls[nx + ',' + ny]) break;
    let occupied = false;
    for (let i = 0; i < atoms.length; i++) {
      if (i === atomIdx) continue;
      if (atoms[i].x === nx && atoms[i].y === ny) { occupied = true; break; }
    }
    if (occupied) break;
    cx = nx;
    cy = ny;
  }
  return { x: cx, y: cy };
}

// ============================================================
// Map building - Structured maps with irregular shapes
// ============================================================
const W_CH = '\u2593';  // wall char
const F_CH = '\u00B7';  // floor char
const V_CH = 'V';       // void (outside playfield, becomes O in output)

const GRID_W = 13;
const GRID_H = 13;

/**
 * Shape templates define which cells are "inside" the playfield.
 * Each is a function(w, h) -> 2D boolean array where true = inside.
 */
const SHAPE_TEMPLATES = [
  // Full rectangle
  function fullRect(w, h) {
    const s = make2D(w, h, true);
    return s;
  },
  // L-shape
  function lShape(w, h) {
    const s = make2D(w, h, false);
    const cutW = Math.floor(w * 0.4);
    const cutH = Math.floor(h * 0.45);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        s[y][x] = !(x >= w - cutW && y < cutH);
    return s;
  },
  // T-shape
  function tShape(w, h) {
    const s = make2D(w, h, false);
    const armW = Math.floor(w * 0.3);
    const armH = Math.floor(h * 0.45);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        s[y][x] = (y < h - armH) || (x >= armW && x < w - armW);
    return s;
  },
  // Cross / plus shape
  function crossShape(w, h) {
    const s = make2D(w, h, false);
    const armX = Math.floor(w * 0.25);
    const armY = Math.floor(h * 0.25);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        s[y][x] = (x >= armX && x < w - armX) || (y >= armY && y < h - armY);
    return s;
  },
  // Two rooms connected by corridor
  function twoRooms(w, h) {
    const s = make2D(w, h, false);
    const roomW = Math.floor(w * 0.4);
    const roomH = Math.floor(h * 0.65);
    const corrW = 3;
    const corrYStart = Math.floor(h * 0.4);
    const corrYEnd = corrYStart + corrW;
    // Left room
    for (let y = Math.floor((h - roomH) / 2); y < Math.floor((h - roomH) / 2) + roomH; y++)
      for (let x = 0; x < roomW; x++)
        s[y][x] = true;
    // Right room
    for (let y = Math.floor((h - roomH) / 2); y < Math.floor((h - roomH) / 2) + roomH; y++)
      for (let x = w - roomW; x < w; x++)
        s[y][x] = true;
    // Corridor
    for (let y = corrYStart; y < corrYEnd; y++)
      for (let x = roomW; x < w - roomW; x++)
        s[y][x] = true;
    return s;
  },
  // Octagon (clipped corners)
  function octagon(w, h) {
    const s = make2D(w, h, false);
    const clip = Math.floor(Math.min(w, h) * 0.25);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const inCorner = (x + y < clip) || (x + (h - 1 - y) < clip) ||
                         ((w - 1 - x) + y < clip) || ((w - 1 - x) + (h - 1 - y) < clip);
        s[y][x] = !inCorner;
      }
    return s;
  }
];

function make2D(w, h, val) {
  const arr = [];
  for (let y = 0; y < h; y++) arr.push(new Array(w).fill(val));
  return arr;
}

/** Flip shape horizontally */
function flipH(shape, w, h) {
  const s = make2D(w, h, false);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      s[y][x] = shape[y][w - 1 - x];
  return s;
}

/** Flip shape vertically */
function flipV(shape, w, h) {
  const s = make2D(w, h, false);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      s[y][x] = shape[h - 1 - y][x];
  return s;
}

/** Flood fill to count connected floor cells, returns count */
function floodFillCount(grid, w, h, startX, startY) {
  const visited = {};
  const queue = [{ x: startX, y: startY }];
  visited[startX + ',' + startY] = true;
  let count = 0;
  while (queue.length > 0) {
    const cur = queue.shift();
    count++;
    for (const d of DIRS) {
      const nx = cur.x + d.dx, ny = cur.y + d.dy;
      const nk = nx + ',' + ny;
      if (nx >= 0 && ny >= 0 && nx < w && ny < h && !visited[nk] && grid[ny][nx] === F_CH) {
        visited[nk] = true;
        queue.push({ x: nx, y: ny });
      }
    }
  }
  return count;
}

/** Check if all floor cells are connected */
function isConnected(grid, w, h) {
  let startX = -1, startY = -1;
  let totalFloor = 0;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (grid[y][x] === F_CH) {
        totalFloor++;
        if (startX < 0) { startX = x; startY = y; }
      }
  if (totalFloor === 0) return false;
  return floodFillCount(grid, w, h, startX, startY) === totalFloor;
}

/** Count corridors of given minimum length in the grid */
function countCorridors(grid, w, h, minLen) {
  let count = 0;
  // Horizontal corridors
  for (let y = 1; y < h - 1; y++) {
    let run = 0;
    for (let x = 0; x < w; x++) {
      if (grid[y][x] === F_CH) {
        run++;
      } else {
        if (run >= minLen) count++;
        run = 0;
      }
    }
    if (run >= minLen) count++;
  }
  // Vertical corridors
  for (let x = 1; x < w - 1; x++) {
    let run = 0;
    for (let y = 0; y < h; y++) {
      if (grid[y][x] === F_CH) {
        run++;
      } else {
        if (run >= minLen) count++;
        run = 0;
      }
    }
    if (run >= minLen) count++;
  }
  return count;
}

/**
 * Build a structured map with irregular shape and internal walls.
 * wallDensity: fraction of interior cells to fill with walls (0.08 - 0.25)
 */
function buildMap(wallDensity, shapeIdx) {
  const w = GRID_W, h = GRID_H;

  // Pick and optionally transform shape
  let shape = SHAPE_TEMPLATES[shapeIdx % SHAPE_TEMPLATES.length](w, h);
  if (random() < 0.5) shape = flipH(shape, w, h);
  if (random() < 0.5) shape = flipV(shape, w, h);

  // Initialize grid: void outside shape, wall on boundary, floor inside
  const grid = make2D(w, h, V_CH);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (shape[y][x]) grid[y][x] = F_CH;

  // Place boundary walls: any inside cell adjacent to void or edge
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (grid[y][x] !== F_CH) continue;
      let onBoundary = (x === 0 || y === 0 || x === w - 1 || y === h - 1);
      if (!onBoundary) {
        for (const d of DIRS) {
          const nx = x + d.dx, ny = y + d.dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h || grid[ny][nx] === V_CH) {
            onBoundary = true;
            break;
          }
        }
      }
      if (onBoundary) grid[y][x] = W_CH;
    }

  // Count interior floor cells
  let interiorFloor = 0;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (grid[y][x] === F_CH) interiorFloor++;

  // Place wall segments (horizontal and vertical runs of 2-5 cells)
  const targetWalls = Math.floor(interiorFloor * wallDensity);
  const numSegments = randInt(3, 7);
  let wallsPlaced = 0;

  for (let seg = 0; seg < numSegments && wallsPlaced < targetWalls; seg++) {
    const horizontal = random() < 0.5;
    const segLen = randInt(2, 5);

    // Try random positions
    for (let attempt = 0; attempt < 30; attempt++) {
      const sx = randInt(2, w - 3);
      const sy = randInt(2, h - 3);

      // Check all cells of segment are floor
      let valid = true;
      const cells = [];
      for (let k = 0; k < segLen; k++) {
        const cx = horizontal ? sx + k : sx;
        const cy = horizontal ? sy : sy + k;
        if (cx < 1 || cy < 1 || cx >= w - 1 || cy >= h - 1) { valid = false; break; }
        if (grid[cy][cx] !== F_CH) { valid = false; break; }
        cells.push({ x: cx, y: cy });
      }
      if (!valid) continue;

      // Tentatively place walls
      for (const c of cells) grid[c.y][c.x] = W_CH;

      // Verify connectivity
      if (isConnected(grid, w, h)) {
        wallsPlaced += cells.length;
        break;
      } else {
        // Revert
        for (const c of cells) grid[c.y][c.x] = F_CH;
      }
    }
  }

  // Add single pillars near corridors
  const numPillars = randInt(1, 4);
  for (let p = 0; p < numPillars && wallsPlaced < targetWalls; p++) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const px = randInt(2, w - 3);
      const py = randInt(2, h - 3);
      if (grid[py][px] !== F_CH) continue;

      // Check it has at least 2 adjacent floor cells (not blocking a narrow corridor)
      let adjFloor = 0;
      for (const d of DIRS)
        if (grid[py + d.dy] && grid[py + d.dy][px + d.dx] === F_CH) adjFloor++;
      if (adjFloor < 3) continue;

      grid[py][px] = W_CH;
      if (isConnected(grid, w, h)) {
        wallsPlaced++;
        break;
      } else {
        grid[py][px] = F_CH;
      }
    }
  }

  // Add L-shaped wall pieces
  if (random() < 0.5 && wallsPlaced < targetWalls) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const lx = randInt(2, w - 4);
      const ly = randInt(2, h - 4);
      const cells = [{ x: lx, y: ly }, { x: lx + 1, y: ly }, { x: lx, y: ly + 1 }];
      if (random() < 0.5) {
        cells[1] = { x: lx - 1, y: ly };
        cells[2] = { x: lx, y: ly + 1 };
      }

      let valid = true;
      for (const c of cells) {
        if (c.x < 1 || c.y < 1 || c.x >= w - 1 || c.y >= h - 1) { valid = false; break; }
        if (grid[c.y][c.x] !== F_CH) { valid = false; break; }
      }
      if (!valid) continue;

      for (const c of cells) grid[c.y][c.x] = W_CH;
      if (isConnected(grid, w, h)) {
        wallsPlaced += cells.length;
        break;
      } else {
        for (const c of cells) grid[c.y][c.x] = F_CH;
      }
    }
  }

  // Build walls dict and inside dict
  const walls = {};
  const inside = {};

  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (grid[y][x] === W_CH) {
        walls[x + ',' + y] = true;
        inside[x + ',' + y] = true;
      } else if (grid[y][x] === F_CH) {
        inside[x + ',' + y] = true;
      }
    }

  return { walls, grid, inside, width: w, height: h };
}

// ============================================================
// Backward walk: scatter atoms from goal via random predecessor steps
// ============================================================
function encodeState(atoms) {
  return atoms.map(a => a.x + ',' + a.y).join('|');
}

/**
 * Compute all predecessor states of the given state.
 * A predecessor S' has one atom at a different position such that
 * sliding that atom forward produces the given state.
 */
function getPredecessors(atoms, walls, w, h) {
  const preds = [];
  for (let i = 0; i < atoms.length; i++) {
    const x = atoms[i].x, y = atoms[i].y;
    for (const d of DIRS) {
      // Check that (x+dx, y+dy) is blocked (atom stopped here)
      const bx = x + d.dx, by = y + d.dy;
      let blocked = false;
      if (bx < 0 || by < 0 || bx >= w || by >= h) blocked = true;
      else if (walls[bx + ',' + by]) blocked = true;
      else {
        for (let j = 0; j < atoms.length; j++) {
          if (j !== i && atoms[j].x === bx && atoms[j].y === by) { blocked = true; break; }
        }
      }
      if (!blocked) continue;

      // Walk backward from (x,y) in direction -d to find valid start positions
      for (let k = 1; ; k++) {
        const sx = x - k * d.dx, sy = y - k * d.dy;
        if (sx < 0 || sy < 0 || sx >= w || sy >= h) break;
        if (walls[sx + ',' + sy]) break;
        let occByOther = false;
        for (let j = 0; j < atoms.length; j++) {
          if (j !== i && atoms[j].x === sx && atoms[j].y === sy) { occByOther = true; break; }
        }
        if (occByOther) break;
        preds.push({ atoms: atoms.map((a, j) => j === i ? { x: sx, y: sy } : { x: a.x, y: a.y }), movedIdx: i });
      }
    }
  }
  return preds;
}

/**
 * Compute the center of a set of atom positions.
 */
function atomCenter(atoms) {
  let sx = 0, sy = 0;
  for (const a of atoms) { sx += a.x; sy += a.y; }
  return { x: sx / atoms.length, y: sy / atoms.length };
}

/**
 * Score a candidate start state based on scatter quality.
 * Higher = better (more scattered, more fun).
 */
function scoreScatter(startAtoms, goalAtoms, w, h) {
  // Total Manhattan distance from goal positions
  let totalDist = 0;
  for (let i = 0; i < startAtoms.length; i++) {
    totalDist += Math.abs(startAtoms[i].x - goalAtoms[i].x) + Math.abs(startAtoms[i].y - goalAtoms[i].y);
  }

  // Penalty if atoms are inside the goal bounding box (expanded by 1)
  let gMinX = Infinity, gMaxX = -Infinity, gMinY = Infinity, gMaxY = -Infinity;
  for (const a of goalAtoms) {
    if (a.x < gMinX) gMinX = a.x;
    if (a.x > gMaxX) gMaxX = a.x;
    if (a.y < gMinY) gMinY = a.y;
    if (a.y > gMaxY) gMaxY = a.y;
  }
  gMinX--; gMaxX++; gMinY--; gMaxY++;

  let inGoalBox = 0;
  for (const a of startAtoms) {
    if (a.x >= gMinX && a.x <= gMaxX && a.y >= gMinY && a.y <= gMaxY) inGoalBox++;
  }

  // Spread: standard deviation of positions
  const cx = startAtoms.reduce((s, a) => s + a.x, 0) / startAtoms.length;
  const cy = startAtoms.reduce((s, a) => s + a.y, 0) / startAtoms.length;
  let spread = 0;
  for (const a of startAtoms) {
    spread += (a.x - cx) * (a.x - cx) + (a.y - cy) * (a.y - cy);
  }
  spread = Math.sqrt(spread / startAtoms.length);

  // Direction variety: count quadrants occupied relative to goal center
  const gc = atomCenter(goalAtoms);
  const quadrants = new Set();
  for (const a of startAtoms) {
    const qx = a.x >= gc.x ? 1 : 0;
    const qy = a.y >= gc.y ? 1 : 0;
    quadrants.add(qx * 2 + qy);
  }

  return totalDist * 2.0
    + spread * 3.0
    + quadrants.size * 5.0
    - inGoalBox * 15.0;
}

/**
 * Long random backward walk from goal state.
 * Returns the best-scatter state found along the walk.
 * The walk path guarantees solvability.
 */
function backwardWalk(goalAtoms, walls, w, h, numSteps, biasFactor) {
  let current = goalAtoms.map(a => ({ x: a.x, y: a.y }));
  const visited = new Set();
  visited.add(encodeState(current));

  let bestState = current;
  let bestScore = -Infinity;
  // Track states at intervals for fallback
  const snapshots = [];

  const gc = atomCenter(goalAtoms);

  for (let step = 0; step < numSteps; step++) {
    const preds = getPredecessors(current, walls, w, h);
    if (preds.length === 0) break;

    // Filter out already-visited states
    const novel = preds.filter(p => !visited.has(encodeState(p.atoms)));
    const candidates = novel.length > 0 ? novel : preds;

    let chosen;
    if (random() < biasFactor && candidates.length > 1) {
      // Bias: pick the predecessor that moves the atom closest to goal center furthest away
      let bestPred = null;
      let bestDistGain = -Infinity;
      for (const p of candidates) {
        const movedAtom = p.atoms[p.movedIdx];
        const origAtom = current[p.movedIdx];
        const distBefore = Math.abs(origAtom.x - gc.x) + Math.abs(origAtom.y - gc.y);
        const distAfter = Math.abs(movedAtom.x - gc.x) + Math.abs(movedAtom.y - gc.y);
        const gain = distAfter - distBefore;
        if (gain > bestDistGain) { bestDistGain = gain; bestPred = p; }
      }
      chosen = bestPred || candidates[Math.floor(random() * candidates.length)];
    } else {
      chosen = candidates[Math.floor(random() * candidates.length)];
    }

    current = chosen.atoms;
    visited.add(encodeState(current));

    // Score this state
    const score = scoreScatter(current, goalAtoms, w, h);
    if (score > bestScore) {
      bestScore = score;
      bestState = current.map(a => ({ x: a.x, y: a.y }));
    }

    // Save snapshots every 20 steps for fallback
    if ((step + 1) % 20 === 0) {
      snapshots.push(current.map(a => ({ x: a.x, y: a.y })));
    }
  }

  return { bestState, bestScore, snapshots };
}

// ============================================================
// Barrier adjustment: tweak walls to improve puzzle quality
// ============================================================

/**
 * Try adding a single pillar to the map to create a new stopping point.
 * Returns true if successful.
 */
function tryAddPillar(grid, walls, inside, w, h) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const px = randInt(2, w - 3);
    const py = randInt(2, h - 3);
    if (grid[py][px] !== F_CH) continue;

    // Ensure at least 3 adjacent floor cells remain
    let adjFloor = 0;
    for (const d of DIRS) {
      const nx = px + d.dx, ny = py + d.dy;
      if (ny >= 0 && ny < h && nx >= 0 && nx < w && grid[ny][nx] === F_CH) adjFloor++;
    }
    if (adjFloor < 3) continue;

    grid[py][px] = W_CH;
    if (isConnected(grid, w, h)) {
      walls[px + ',' + py] = true;
      inside[px + ',' + py] = true;
      return true;
    }
    grid[py][px] = F_CH;
  }
  return false;
}

/**
 * Try removing a non-boundary wall to open a path.
 * Returns true if successful.
 */
function tryRemovePillar(grid, walls, inside, w, h) {
  // Find interior walls that can be safely removed
  const candidates = [];
  for (let y = 2; y < h - 2; y++)
    for (let x = 2; x < w - 2; x++) {
      if (grid[y][x] !== W_CH) continue;
      // Don't remove boundary walls
      let isBoundary = false;
      for (const d of DIRS) {
        const nx = x + d.dx, ny = y + d.dy;
        if (ny < 0 || ny >= h || nx < 0 || nx >= w || grid[ny][nx] === V_CH) {
          isBoundary = true;
          break;
        }
      }
      if (!isBoundary) candidates.push({ x, y });
    }

  if (candidates.length === 0) return false;
  const pick = candidates[Math.floor(random() * candidates.length)];
  grid[pick.y][pick.x] = F_CH;
  delete walls[pick.x + ',' + pick.y];
  return true;
}

/**
 * Iteratively adjust barriers to get optimal move count into target range.
 * Returns { optimalMoves, atoms } or null if couldn't tune.
 */
function adjustBarriers(grid, walls, inside, w, h, moleculeSlug, startAtoms, placement, lab, maxAdjustments) {
  const targets = {
    1: { min: 5, pref: 8, max: 12 },
    2: { min: 7, pref: 12, max: 18 },
    3: { min: 8, pref: 14, max: 20 },
    4: { min: 10, pref: 16, max: 24 },
    5: { min: 12, pref: 20, max: 30 }
  };
  const t = targets[lab];

  const solverBudget = getSolverBudget(startAtoms.length);

  const level = {
    molecule: moleculeSlug,
    width: w,
    height: h,
    walls: Object.assign({}, walls),
    inside: Object.assign({}, inside)
  };

  // Build atoms with element info for solver
  const solverAtoms = startAtoms.map((a, i) => ({
    x: a.x, y: a.y,
    element: placement[i].element,
    cellStr: placement[i].cellStr,
    id: i
  }));

  let result = Solver.solve(level, solverAtoms, solverBudget);
  if (!result) return null;

  let optMoves = result.moves.length;

  for (let adj = 0; adj < maxAdjustments; adj++) {
    if (optMoves >= t.min && optMoves <= t.max) break;

    if (optMoves < t.min) {
      // Too easy: add a pillar to create detours
      if (!tryAddPillar(grid, walls, inside, w, h)) continue;
    } else if (optMoves > t.max) {
      // Too hard: remove a wall to open paths
      if (!tryRemovePillar(grid, walls, inside, w, h)) continue;
    }

    // Re-verify with updated walls
    level.walls = Object.assign({}, walls);
    level.inside = Object.assign({}, inside);

    // Check goal placement still valid
    const gp = Solver.computeGoalPlacements(level);
    if (gp.length === 0) {
      // Revert would be complex, just stop adjusting
      break;
    }

    result = Solver.solve(level, solverAtoms, solverBudget);
    if (!result) break;
    optMoves = result.moves.length;
  }

  if (result && optMoves >= t.min) {
    return { optimalMoves: optMoves };
  }
  return null;
}

// ============================================================
// Quality filters
// ============================================================

/**
 * Check if atoms pass quality filters for a good puzzle.
 */
function passesQualityFilters(startAtoms, goalAtoms, lab) {
  // No atom in expanded goal bounding box
  let gMinX = Infinity, gMaxX = -Infinity, gMinY = Infinity, gMaxY = -Infinity;
  for (const a of goalAtoms) {
    if (a.x < gMinX) gMinX = a.x;
    if (a.x > gMaxX) gMaxX = a.x;
    if (a.y < gMinY) gMinY = a.y;
    if (a.y > gMaxY) gMaxY = a.y;
  }
  gMinX--; gMaxX++; gMinY--; gMaxY++;

  let inBox = 0;
  for (const a of startAtoms) {
    if (a.x >= gMinX && a.x <= gMaxX && a.y >= gMinY && a.y <= gMaxY) inBox++;
  }
  // Allow at most 1 atom in the expanded goal box for lab 1, 0 for higher labs
  const maxInBox = lab <= 1 ? 1 : 0;
  if (inBox > maxInBox) return false;

  // Minimum total Manhattan scatter distance
  let totalDist = 0;
  for (let i = 0; i < startAtoms.length; i++) {
    totalDist += Math.abs(startAtoms[i].x - goalAtoms[i].x) + Math.abs(startAtoms[i].y - goalAtoms[i].y);
  }
  const minScatter = [8, 12, 16, 20, 24][lab - 1];
  if (totalDist < minScatter) return false;

  // Quadrant variety: atoms in at least 2 quadrants (3 preferred but 2 acceptable)
  const gc = atomCenter(goalAtoms);
  const quadrants = new Set();
  for (const a of startAtoms) {
    const qx = a.x >= gc.x ? 1 : 0;
    const qy = a.y >= gc.y ? 1 : 0;
    quadrants.add(qx * 2 + qy);
  }
  if (quadrants.size < 2) return false;

  return true;
}

// ============================================================
// Solver budget helper - scale by atom count to avoid OOM
// ============================================================
function getSolverBudget(atomCount) {
  if (atomCount <= 4) return 500000;
  if (atomCount <= 6) return 200000;
  if (atomCount <= 8) return 100000;
  if (atomCount <= 10) return 60000;
  if (atomCount <= 12) return 40000;
  if (atomCount <= 14) return 30000;
  return 20000;
}

// ============================================================
// Level generation pipeline
// ============================================================
function generateSolvableLevel(moleculeSlug, levelIndex, lab) {
  const molAtoms = Molecules.getMoleculeAtoms(moleculeSlug);
  if (!molAtoms || molAtoms.length === 0) {
    throw new Error('Unknown molecule or no atoms: ' + moleculeSlug);
  }

  const atomCount = molAtoms.length;
  const targets = {
    1: { min: 5, pref: 8, max: 12 },
    2: { min: 7, pref: 12, max: 18 },
    3: { min: 8, pref: 14, max: 20 },
    4: { min: 10, pref: 16, max: 24 },
    5: { min: 12, pref: 20, max: 30 }
  };
  const t = targets[lab];

  // Scale walk length: shorter for large molecules (they're harder anyway)
  const baseWalk = [80, 120, 160, 200, 250][lab - 1];
  const walkPenalty = atomCount >= 12 ? 0.4 : atomCount >= 10 ? 0.5 : atomCount >= 8 ? 0.7 : 1.0;
  const walkSteps = Math.floor(baseWalk * walkPenalty);
  // Bias factor
  const biasFactor = [0.6, 0.65, 0.7, 0.75, 0.8][lab - 1];
  // Wall density scales with lab
  const wallDensityBase = [0.08, 0.12, 0.16, 0.20, 0.25][lab - 1];

  const solverBudget = getSolverBudget(atomCount);

  // Reduce target for large molecules (more atoms = harder even with fewer moves)
  const atomPenalty = atomCount >= 14 ? 8 : atomCount >= 12 ? 5 : atomCount >= 10 ? 3 : atomCount >= 8 ? 2 : 0;
  const adjMin = Math.max(3, t.min - atomPenalty);
  const adjPref = Math.max(4, t.pref - atomPenalty);
  const adjMax = t.max;
  // For very large molecules, accept any solver-verified result
  const acceptAny = atomCount >= 12;

  let bestResult = null;
  let bestMoves = 0;

  for (let mapAttempt = 0; mapAttempt < 16; mapAttempt++) {
    const mapSeed = 5000 + levelIndex * 137 + mapAttempt * 31;
    setSeed(mapSeed);

    // Vary shape and density across attempts
    // Use full rectangle (shape 0) more often for large molecules and later attempts
    const shapeIdx = (acceptAny || mapAttempt >= 10) ? 0 : (mapAttempt % SHAPE_TEMPLATES.length);
    const densityVariation = (random() - 0.5) * 0.06;
    // Reduce wall density for later attempts to ensure more open space
    const lateDensityReduction = mapAttempt >= 8 ? 0.04 : 0;
    const wallDensity = Math.max(0.04, Math.min(0.30, wallDensityBase + densityVariation - lateDensityReduction));

    const { walls, grid, inside, width, height } = buildMap(wallDensity, shapeIdx);

    // Check map has enough corridors (relax for later attempts)
    if (mapAttempt < 6 && countCorridors(grid, width, height, 4) < 2) continue;

    const level = {
      molecule: moleculeSlug,
      width,
      height,
      walls,
      inside
    };

    const goalPlacements = Solver.computeGoalPlacements(level);
    if (goalPlacements.length < 1) continue;

    // Try a few goal placements
    setSeed(mapSeed + 7);
    const placementOrder = shuffle(Array.from({ length: goalPlacements.length }, (_, i) => i));
    const placementsToTry = placementOrder.slice(0, Math.min(4, placementOrder.length));

    for (const pi of placementsToTry) {
      const placement = goalPlacements[pi];
      const goalAtoms = placement.map(a => ({ x: a.x, y: a.y }));

      // Multiple walk attempts with different seeds
      // Later walk attempts use shorter walks (easier to solve-verify)
      for (let walkAttempt = 0; walkAttempt < 4; walkAttempt++) {
        setSeed(mapSeed + pi * 100 + walkAttempt * 17 + 42);

        const actualSteps = walkAttempt >= 2 ? Math.floor(walkSteps * 0.5) : walkSteps;
        const { bestState, snapshots } = backwardWalk(goalAtoms, walls, width, height, actualSteps, biasFactor);

        // Try candidates: best state first, then snapshots from recent to old
        // (Earlier snapshots = closer to goal = easier for solver to verify)
        const recentSnaps = snapshots.slice(-5).reverse();
        const candidates = [bestState, ...recentSnaps];

        for (const startAtoms of candidates) {
          // Quality filter (skip for large molecules and later attempts)
          if (!acceptAny && mapAttempt < 8 && !passesQualityFilters(startAtoms, goalAtoms, lab)) continue;

          // Build solver atoms
          const solverAtoms = startAtoms.map((a, i) => ({
            x: a.x, y: a.y,
            element: placement[i].element,
            cellStr: placement[i].cellStr,
            id: i
          }));

          const result = Solver.solve(level, solverAtoms, solverBudget);
          if (!result) continue;

          let optMoves = result.moves.length;

          // Try barrier adjustment if not in range (skip for large molecules)
          if ((optMoves < adjMin || optMoves > adjMax) && atomCount <= 10) {
            const adjGrid = grid.map(row => [...row]);
            const adjWalls = Object.assign({}, walls);
            const adjInside = Object.assign({}, inside);

            const adjResult = adjustBarriers(
              adjGrid, adjWalls, adjInside, width, height,
              moleculeSlug, startAtoms, placement, lab, 6
            );

            if (adjResult && adjResult.optimalMoves >= adjMin) {
              optMoves = adjResult.optimalMoves;
              if (optMoves > bestMoves) {
                bestResult = {
                  grid: adjGrid,
                  atoms: startAtoms.map((a, i) => ({
                    x: a.x, y: a.y,
                    element: placement[i].element,
                    cellStr: placement[i].cellStr,
                    id: i
                  })),
                  optimalMoves: optMoves,
                  width, height
                };
                bestMoves = optMoves;
              }
              if (bestMoves >= adjPref) return finalizeLevelResult(bestResult);
              continue;
            }
          }

          // For large molecules, accept any solver-verified result
          const effectiveMin = acceptAny ? 3 : adjMin;
          if (optMoves >= effectiveMin && optMoves > bestMoves) {
            bestResult = {
              grid: grid.map(row => [...row]),
              atoms: startAtoms.map((a, i) => ({
                x: a.x, y: a.y,
                element: placement[i].element,
                cellStr: placement[i].cellStr,
                id: i
              })),
              optimalMoves: optMoves,
              width, height
            };
            bestMoves = optMoves;
          }

          if (bestMoves >= adjPref) return finalizeLevelResult(bestResult);
        }
      }
    }

    // Accept good-enough after several map attempts
    const earlyAcceptMin = acceptAny ? 3 : adjMin;
    if (bestResult && bestMoves >= earlyAcceptMin && mapAttempt >= 4) {
      return finalizeLevelResult(bestResult);
    }
    // For large molecules, accept even earlier
    if (acceptAny && bestResult && bestMoves >= 3 && mapAttempt >= 2) {
      return finalizeLevelResult(bestResult);
    }
  }

  if (bestResult) {
    return finalizeLevelResult(bestResult);
  }

  throw new Error('FAILED to generate solvable level for "' + moleculeSlug + '" (level ' + (levelIndex + 1) + ')');
}

function finalizeLevelResult(result) {
  const finalGrid = result.grid;

  // Place atom markers on grid
  for (const a of result.atoms) {
    finalGrid[a.y][a.x] = '0';
  }

  // Sort atoms by scan order (top-to-bottom, left-to-right)
  const sortedAtoms = [...result.atoms].sort((a, b) =>
    a.y !== b.y ? a.y - b.y : a.x - b.x
  );

  return {
    mapStrings: finalGrid.map(row => row.join('')),
    atomCells: sortedAtoms.map(a => a.cellStr),
    optimalMoves: result.optimalMoves
  };
}

// ============================================================
// Get molecule cell strings in reading order (for handcrafted levels)
// ============================================================
function getMoleculeAtomCells(slug) {
  const grid = Molecules.MOLECULE_DEFS[slug];
  if (!grid) throw new Error('Unknown molecule: ' + slug);
  const cells = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] !== '') cells.push(grid[y][x]);
    }
  }
  return cells;
}

// ============================================================
// Hand-crafted levels (preserved exactly from original game)
// Key format: "campaignIndex:molecule"
// ============================================================
const existingLevels = {
  '0:water': {
    mapCode: [
      "O+O+O+O+O+O+O+O+O+O+O+O+O",
      "O+W+W+W+W+W+O+O+O+O+O+O+O",
      "O+W+O+O+O+W+O+O+O+O+O+O+O",
      "O+W+O+O+'0'+W+W+W+W+W+W+O+O",
      "O+W+O+O+W+O+O+O+O+O+W+O+O",
      "O+W+O+W+O+O+O+O+O+O+W+W+O",
      "O+W+O+W+O+O+O+O+W+W+O+W+O",
      "O+W+O+O+O+O+W+O+W+'0'+O+W+O",
      "O+W+W+W+'0'+W+O+O+W+O+O+W+O",
      "O+O+W+O+O+O+O+O+O+O+O+W+O",
      "O+O+W+W+W+W+W+W+W+W+W+W+O",
      "O+O+O+O+O+O+O+O+O+O+O+O+O",
      "O+O+O+O+O+O+O+O+O+O+O+O+O"
    ],
    atomIdsCode: "['H\\u2190', 'O\\u2190\\u2192', 'H\\u2192']",
    optimalMoves: 5
  },
  '5:methane': {
    mapCode: [
      "O+O+O+O+O+O+O+O+O+O+O+O+O",
      "W+W+W+W+W+W+W+W+W+W+W+W+W",
      "W+O+O+O+W+O+O+W+O+O+O+O+W",
      "W+O+W+O+O+W+'0'+W+O+O+O+O+W",
      "W+O+O+W+O+O+O+W+'0'+O+W+O+W",
      "W+O+O+O+O+O+O+W+W+W+W+O+W",
      "W+O+O+O+O+O+O+O+W+'0'+W+O+W",
      "W+O+'0'+O+O+W+O+O+W+O+O+O+W",
      "W+O+W+W+W+W+W+O+O+O+O+W+W",
      "W+O+'0'+O+W+O+O+W+O+O+O+W+O",
      "W+W+W+W+W+O+O+W+O+O+O+W+O",
      "O+O+O+O+O+O+O+W+W+W+W+W+O",
      "O+O+O+O+O+O+O+O+O+O+O+O+O"
    ],
    atomIdsCode: "['H\\u2190', 'C\\u2190\\u2191\\u2192\\u2193', 'H\\u2192', 'H\\u2193', 'H\\u2191']",
    optimalMoves: 8
  },
  '7:methanal': {
    mapCode: [
      "W+W+W+W+W+W+W+W+W+W+W+W+W",
      "W+'0'+O+O+O+O+W+O+O+O+O+'0'+W",
      "W+O+O+W+W+O+W+O+W+W+O+O+W",
      "W+W+O+W+O+O+O+O+O+W+O+W+W",
      "W+O+O+W+O+O+O+O+O+W+O+O+W",
      "W+O+W+W+O+O+W+O+O+W+W+O+W",
      "W+O+O+O+O+W+W+W+O+O+O+O+W",
      "W+O+W+W+O+O+W+O+O+W+W+O+W",
      "W+O+O+W+O+O+O+O+O+W+O+O+W",
      "W+W+O+W+O+O+O+O+O+W+O+W+W",
      "W+O+O+W+W+O+W+O+W+W+O+O+W",
      "W+'0'+O+O+O+O+W+O+O+O+O+'0'+W",
      "W+W+W+W+W+W+W+W+W+W+W+W+W"
    ],
    atomIdsCode: "['O\\u21C7', 'C\\u2191\\u2193\\u21C9', 'H\\u2191', 'H\\u2193']",
    optimalMoves: 7
  },
  '8:methanol': {
    mapCode: [
      "O+O+O+O+O+O+O+O+O+W+W+W+W",
      "W+W+W+W+O+O+O+O+O+W+O+O+W",
      "W+O+O+W+O+O+O+O+O+W+O+O+W",
      "W+O+O+W+W+O+O+O+W+W+O+'0'+W",
      "W+O+O+'0'+W+W+W+W+W+O+O+O+W",
      "W+O+W+O+W+O+'0'+W+O+O+O+O+W",
      "W+O+O+O+O+O+O+W+O+'0'+O+O+W",
      "W+O+O+W+O+W+O+O+O+W+O+O+W",
      "W+'0'+O+O+O+O+O+O+O+O+O+O+W",
      "W+O+O+O+W+O+W+O+O+O+W+O+W",
      "W+W+W+W+W+W+'0'+O+O+O+W+O+W",
      "O+O+O+O+O+W+W+W+W+W+W+W+W",
      "O+O+O+O+O+O+O+O+O+O+O+O+O"
    ],
    atomIdsCode: "['O\\u2190\\u2192', 'H\\u2191', 'C\\u2190\\u2191\\u2192\\u2193', 'H\\u2190', 'H\\u2193', 'H\\u2192']",
    optimalMoves: 10
  },
  '10:ethylene': {
    mapCode: [
      "O+O+O+O+O+O+O+O+O+O+O+O+O",
      "O+W+W+W+O+O+O+O+O+W+W+W+O",
      "O+W+O+W+O+O+O+O+O+W+O+W+O",
      "O+W+'0'+W+W+W+W+W+W+W+O+W+O",
      "O+W+O+O+O+O+O+O+W+O+O+W+O",
      "O+W+W+O+O+'0'+O+W+O+O+O+W+O",
      "O+W+O+W+O+O+O+O+'0'+W+'0'+W+O",
      "O+W+O+O+O+W+O+O+O+O+W+W+O",
      "O+W+O+O+W+O+O+O+O+'0'+'0'+W+O",
      "O+W+O+W+W+W+W+W+W+W+O+W+O",
      "O+W+O+W+O+O+O+O+O+W+O+W+O",
      "O+W+W+W+O+O+O+O+O+W+W+W+O",
      "O+O+O+O+O+O+O+O+O+O+O+O+O"
    ],
    atomIdsCode: "['H\\u2197', 'C\\u2197\\u2198\\u21C7', 'H\\u2199', 'C\\u2196\\u2199\\u21C9', 'H\\u2196', 'H\\u2198']",
    optimalMoves: 10
  },
  '13:ethane': {
    mapCode: [
      "O+O+O+O+O+O+O+O+O+O+O+O+O",
      "O+O+O+W+W+W+W+W+W+W+W+W+O",
      "O+O+O+W+O+O+O+O+'0'+O+O+W+O",
      "O+O+O+W+O+O+W+O+W+O+O+W+O",
      "O+O+O+W+'0'+O+'0'+O+W+W+W+W+O",
      "O+W+W+W+W+W+'0'+O+W+'0'+W+O+O",
      "O+W+O+O+O+W+O+O+O+O+W+O+O",
      "O+W+O+O+O+O+O+O+O+O+W+O+O",
      "O+W+O+'0'+O+W+W+W+'0'+O+W+W+O",
      "O+W+W+W+'0'+O+O+O+W+O+O+W+O",
      "O+W+O+O+O+O+O+O+O+O+O+W+O",
      "O+W+W+W+W+W+W+W+W+W+W+W+O",
      "O+O+O+O+O+O+O+O+O+O+O+O+O"
    ],
    atomIdsCode: "['H\\u2197', 'H\\u2193', 'C\\u2191\\u2193\\u2198\\u2199', 'C\\u2191\\u2193\\u2196\\u2197', 'H\\u2198', 'H\\u2191', 'H\\u2196', 'H\\u2199']",
    optimalMoves: 12
  },
  '14:ethanol': {
    mapCode: [
      "O+O+O+O+O+W+W+W+W+W+O+O+O",
      "O+O+O+O+O+W+'0'+'0'+O+W+O+O+O",
      "O+W+W+W+W+W+O+W+O+W+O+O+O",
      "O+W+O+O+O+O+O+O+'0'+W+O+O+O",
      "O+W+W+W+'0'+O+O+O+W+W+O+O+O",
      "O+O+O+W+O+W+'0'+W+O+W+W+W+O",
      "O+O+O+W+W+'0'+O+O+O+W+O+W+O",
      "W+W+W+W+O+'0'+O+O+O+O+O+W+O",
      "W+O+'0'+O+O+O+O+W+O+O+O+W+O",
      "W+W+W+W+W+O+W+O+O+W+O+W+O",
      "O+O+O+W+O+O+O+O+W+O+'0'+W+O",
      "O+O+O+W+W+W+W+W+W+W+W+W+O",
      "O+O+O+O+O+O+O+O+O+O+O+O+O"
    ],
    atomIdsCode: "['H\\u2191', 'C\\u2190\\u2191\\u2192\\u2193', 'H\\u2191', 'H\\u2193', 'H\\u2192', 'H\\u2193', 'C\\u2190\\u2191\\u2192\\u2193', 'O\\u2190\\u2192', 'H\\u2190']",
    optimalMoves: 12
  },
  '15:dimethyl-ether': {
    mapCode: [
      "W+W+W+W+W+W+W+W+W+W+W+W+W",
      "W+O+O+O+'0'+O+W+'0'+O+O+O+'0'+W",
      "W+O+W+W+W+O+W+O+W+W+W+O+W",
      "W+O+W+O+O+'0'+W+O+O+O+W+O+W",
      "W+O+W+O+O+O+W+O+O+O+W+O+W",
      "W+O+O+O+O+O+W+O+O+O+O+O+W",
      "W+W+W+W+'0'+O+O+O+O+W+W+W+W",
      "W+O+O+O+O+O+W+O+O+O+O+O+W",
      "W+O+W+O+O+O+W+O+O+O+W+O+W",
      "W+O+W+O+O+'0'+W+O+O+'0'+W+O+W",
      "W+O+W+W+W+O+W+O+O+W+W+'0'+W",
      "W+O+O+O+O+'0'+W+O+O+O+O+O+W",
      "W+W+W+W+W+W+W+W+W+W+W+W+W"
    ],
    atomIdsCode: "['C\\u2190\\u2191\\u2192\\u2193', 'O\\u2190\\u2192', 'H\\u2192', 'H\\u2191', 'H\\u2193', 'H\\u2190', 'H\\u2191', 'H\\u2193', 'C\\u2190\\u2191\\u2192\\u2193']",
    optimalMoves: 14
  },
  '16:acetic-acid': {
    mapCode: [
      "O+O+O+O+O+O+O+O+O+O+O+O+O",
      "O+W+W+W+W+W+W+W+W+W+W+W+O",
      "O+W+O+O+O+W+O+O+O+W+O+W+O",
      "O+W+O+'0'+O+O+O+O+O+O+O+W+O",
      "O+W+O+W+O+O+'0'+W+O+'0'+O+W+O",
      "O+W+'0'+O+'0'+O+O+O+O+O+O+W+O",
      "O+W+O+O+O+W+O+O+O+W+O+W+O",
      "O+W+O+O+O+O+O+O+O+O+O+W+O",
      "O+W+O+W+O+'0'+O+W+O+O+O+W+O",
      "O+W+'0'+O+O+O+O+O+'0'+O+O+W+O",
      "O+W+O+O+O+W+O+O+O+W+O+W+O",
      "O+W+W+W+W+W+W+W+W+W+W+W+O",
      "O+O+O+O+O+O+O+O+O+O+O+O+O"
    ],
    atomIdsCode: "['O\\u2190\\u2192', 'H\\u2190', 'H\\u2192', 'H\\u2191', 'C\\u2190\\u2191\\u2192\\u2193', 'C\\u2190\\u2192\\u21C8', 'O\\u21CA', 'H\\u2193']",
    optimalMoves: 13
  },
  '24:acetone': {
    mapCode: [
      "O+O+O+W+W+W+W+W+W+W+W+W+W",
      "O+W+W+W+O+O+W+W+O+O+O+O+W",
      "W+W+O+O+O+O+O+W+O+W+O+O+W",
      "W+O+O+O+O+O+'0'+W+O+W+W+W+W",
      "W+O+W+'0'+W+O+'0'+O+'0'+O+O+'0'+W",
      "W+O+W+'0'+W+W+W+O+O+'0'+O+O+W",
      "W+W+W+O+O+'0'+O+O+O+O+W+W+W",
      "W+O+O+O+O+O+W+W+W+O+W+O+W",
      "W+O+O+O+O+O+'0'+O+W+O+W+O+W",
      "W+W+W+W+O+W+O+O+O+O+O+'0'+W",
      "W+O+O+W+O+W+O+O+O+O+O+W+W",
      "W+O+O+O+O+W+W+O+O+W+W+W+O",
      "W+W+W+W+W+W+W+W+W+W+O+O+O"
    ],
    atomIdsCode: "['O\\u21C8', 'C\\u2190\\u2191\\u2192\\u2193', 'H\\u2191', 'C\\u2190\\u2192\\u21CA', 'H\\u2193', 'H\\u2191', 'H\\u2192', 'H\\u2193', 'C\\u2190\\u2191\\u2192\\u2193', 'H\\u2190']",
    optimalMoves: 16
  },
  '34:cyclobutane': {
    mapCode: [
      "O+O+O+O+O+O+O+O+O+O+O+O+O",
      "O+W+W+W+W+W+W+W+W+O+O+O+O",
      "O+W+O+O+O+'0'+O+O+W+W+O+O+O",
      "O+W+W+'0'+O+W+W+O+'0'+W+W+W+O",
      "O+O+W+W+O+'0'+O+O+O+O+O+W+O",
      "O+O+O+W+O+W+O+O+O+O+O+W+O",
      "O+O+W+W+'0'+W+W+O+O+W+'0'+W+O",
      "O+O+W+O+O+O+'0'+W+'0'+W+W+W+O",
      "O+O+W+O+O+O+O+O+O+W+O+W+O",
      "O+O+W+'0'+O+O+O+'0'+O+O+'0'+W+O",
      "O+O+W+'0'+O+W+O+W+W+W+O+W+O",
      "O+O+W+W+W+W+W+W+O+W+W+W+O",
      "O+O+O+O+O+O+O+O+O+O+O+O+O"
    ],
    atomIdsCode: "['H\\u2192', 'H\\u2190', 'H\\u2191', 'C\\u2190\\u2191\\u2192\\u2193', 'H\\u2192', 'C\\u2190\\u2191\\u2192\\u2193', 'H\\u2190', 'H\\u2193', 'C\\u2190\\u2191\\u2192\\u2193', 'C\\u2190\\u2191\\u2192\\u2193', 'H\\u2193', 'H\\u2191']",
    optimalMoves: 18
  },
  '35:lactic-acid': {
    mapCode: [
      "W+W+W+W+W+W+W+W+W+W+W+W+W",
      "W+'0'+O+W+O+O+O+O+O+O+O+'0'+W",
      "W+O+O+W+'0'+O+O+W+O+O+O+O+W",
      "W+O+O+O+O+O+W+O+O+O+W+W+W",
      "W+O+O+O+O+O+W+O+O+O+'0'+O+W",
      "W+O+W+O+O+'0'+W+'0'+O+O+O+O+W",
      "W+O+O+W+W+W+W+W+W+W+O+O+W",
      "W+O+O+O+O+'0'+W+'0'+O+O+W+O+W",
      "W+O+'0'+O+O+O+W+O+O+O+O+O+W",
      "W+W+W+O+O+O+W+O+O+O+O+O+W",
      "W+O+O+O+O+W+O+O+'0'+W+O+O+W",
      "W+'0'+O+O+O+O+O+O+O+W+O+'0'+W",
      "W+W+W+W+W+W+W+W+W+W+W+W+W"
    ],
    atomIdsCode: "['H\\u2198', 'C\\u2196\\u2197\\u2198\\u2199', 'O\\u2196\\u2198', 'C\\u2196\\u2197\\u2198\\u2199', 'C\\u2192\\u2199\\u21C8', 'O\\u21CA', 'H\\u2190', 'O\\u2190\\u2192', 'H\\u2198', 'H\\u2196', 'H\\u2197', 'H\\u2196']",
    optimalMoves: 22
  },
  '38:trans-butylen': {
    mapCode: [
      "W+W+W+W+W+W+W+W+W+W+W+W+W",
      "W+O+O+O+O+O+O+O+O+O+O+O+W",
      "W+O+O+O+W+O+O+'0'+W+O+O+O+W",
      "W+'0'+O+W+O+'0'+O+O+O+W+O+O+W",
      "W+O+W+O+W+W+O+W+W+O+W+O+W",
      "W+O+O+'0'+O+O+O+O+O+O+O+O+W",
      "W+W+W+'0'+W+W+O+W+W+O+W+W+W",
      "W+O+O+O+O+O+O+O+O+O+O+O+W",
      "W+O+W+O+W+W+'0'+W+W+O+W+O+W",
      "W+O+O+W+'0'+'0'+O+O+O+W+'0'+O+W",
      "W+O+O+O+W+O+O+'0'+W+O+O+O+W",
      "W+'0'+O+O+'0'+O+O+O+O+O+O+O+W",
      "W+W+W+W+W+W+W+W+W+W+W+W+W"
    ],
    atomIdsCode: "['C\\u2197\\u2198\\u21C7', 'C\\u2196\\u2199\\u21C9', 'H\\u2199', 'H\\u2197', 'H\\u2196', 'H\\u2198', 'C\\u2196\\u2197\\u2198\\u2199', 'H\\u2198', 'H\\u2198', 'H\\u2196', 'C\\u2196\\u2197\\u2198\\u2199', 'H\\u2196']",
    optimalMoves: 18
  },
  '39:glycerin': {
    mapCode: [
      "O+W+W+W+W+W+W+W+W+W+W+W+O",
      "O+W+O+W+O+'0'+W+'0'+O+W+O+W+O",
      "O+W+O+'0'+W+O+W+O+W+O+O+W+O",
      "O+W+W+O+O+'0'+O+O+O+O+W+W+O",
      "O+W+O+W+O+O+O+O+O+W+O+W+O",
      "O+W+O+'0'+O+O+O+O+'0'+O+O+W+O",
      "O+W+W+W+W+'0'+O+O+W+W+W+W+O",
      "O+W+O+O+O+O+'0'+'0'+O+'0'+O+W+O",
      "O+W+O+W+O+O+O+O+'0'+W+O+W+O",
      "O+W+W+O+O+O+O+O+'0'+O+W+W+O",
      "O+W+O+O+W+O+W+O+W+O+'0'+W+O",
      "O+W+O+W+O+'0'+W+O+O+W+O+W+O",
      "O+W+W+W+W+W+W+W+W+W+W+W+O"
    ],
    atomIdsCode: "['H\\u2191', 'C\\u2190\\u2191\\u2192\\u2193', 'O\\u2190\\u2192', 'C\\u2190\\u2191\\u2192\\u2193', 'H\\u2190', 'H\\u2192', 'O\\u2190\\u2192', 'H\\u2192', 'O\\u2190\\u2192', 'H\\u2192', 'C\\u2190\\u2191\\u2192\\u2193', 'H\\u2190', 'H\\u2193', 'H\\u2190']",
    optimalMoves: 24
  }
};

// ============================================================
// Output helpers
// ============================================================
function escapeCellStr(s) {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c > 127) out += '\\u' + c.toString(16).padStart(4, '0');
    else out += s[i];
  }
  return out;
}

function buildMapExpr(mapStrings) {
  return mapStrings.map(row => {
    const parts = [];
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '\u2593') parts.push('W');
      else if (ch === '\u00B7') parts.push('O');
      else if (ch === '0') parts.push("'0'");
      else if (ch === 'V') parts.push('O');  // void cells become O
      else parts.push('O');
    }
    return '        ' + parts.join('+');
  });
}

function buildAtomIdsExpr(cells) {
  return '[' + cells.map(c => "'" + escapeCellStr(c) + "'").join(', ') + ']';
}

// ============================================================
// Level cache: avoid re-generating levels that already succeeded
// ============================================================
const CACHE_PATH = path.join(__dirname, '.level_cache.json');
let levelCache = {};
try {
  levelCache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
} catch (e) { /* no cache yet */ }

function saveCache() {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(levelCache, null, 2), 'utf8');
}

// ============================================================
// MAIN: Generate all 50 levels
// ============================================================
console.log('=== AtomixLab Level Generator (Fun Challenging Puzzles) ===\n');

const levelEntries = [];
let handcraftedCount = 0;
let generatedCount = 0;
let cachedCount = 0;

for (let i = 0; i < campaign.length; i++) {
  const c = campaign[i];
  const key = i + ':' + c.molecule;
  const existing = existingLevels[key];
  const levelNum = i + 1;
  const labNames = ['Basics', 'Organic Chemistry', 'Functional Groups', 'Complex Molecules', 'Master Chemist'];

  let mapLines, atomIdsExpr, optMoves;

  if (existing) {
    // Use hand-crafted level
    mapLines = existing.mapCode;
    atomIdsExpr = existing.atomIdsCode;
    optMoves = existing.optimalMoves;
    handcraftedCount++;
    console.log(`Level ${levelNum}: ${c.name} (${c.molecule}) - HANDCRAFTED, ${optMoves} moves`);
  } else if (levelCache[key]) {
    // Use cached result
    const cached = levelCache[key];
    mapLines = cached.mapLines;
    atomIdsExpr = cached.atomIdsExpr;
    optMoves = cached.optMoves;
    cachedCount++;
    console.log(`Level ${levelNum}: ${c.name} (${c.molecule}) - CACHED, ${optMoves} moves`);
  } else {
    // Generate with new pipeline
    const startTime = Date.now();
    process.stdout.write(`Level ${levelNum}: ${c.name} (${c.molecule}) - generating...`);

    const result = generateSolvableLevel(c.molecule, i, c.lab);

    mapLines = buildMapExpr(result.mapStrings);
    atomIdsExpr = buildAtomIdsExpr(result.atomCells);
    optMoves = result.optimalMoves;
    generatedCount++;

    // Save to cache
    levelCache[key] = { mapLines, atomIdsExpr, optMoves };
    saveCache();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(` SOLVED in ${elapsed}s, ${optMoves} optimal moves`);
  }

  // Build level entry
  let entry = '';
  if ([1, 11, 21, 31, 41].includes(levelNum)) {
    const labNum = c.lab;
    entry += `    // ===== LAB ${labNum}: ${labNames[c.lab - 1]} (${(labNum - 1) * 10 + 1}-${labNum * 10}) =====\n`;
  }
  entry += `    // ${levelNum}: ${c.name} (${c.molecule})\n`;
  entry += `    { name: "${c.name}", molecule: "${c.molecule}",\n`;
  entry += `      map: [\n`;
  for (let j = 0; j < mapLines.length; j++) {
    const line = typeof mapLines[j] === 'string' ? mapLines[j].trim() : mapLines[j];
    entry += `        ${line}`;
    if (j < mapLines.length - 1) entry += ',';
    entry += '\n';
  }
  entry += `      ],\n`;
  entry += `      atomIds: ${atomIdsExpr},\n`;
  entry += `      optimalMoves: ${optMoves}, location: ${c.lab} }`;

  levelEntries.push(entry);
}

// ============================================================
// Write levels.js
// ============================================================
const output = `/**
 * Levels - 50-level campaign across 5 chemistry labs
 * Each level uses a unique molecule (with 4 challenge variants in Lab 5)
 * Hand-crafted maps preserved where available; solver-verified generated maps
 */
(function () {
  'use strict';

  var LABS = [
    { id: 1, name: "Basics Lab", startLevel: 1, endLevel: 10 },
    { id: 2, name: "Organic Chemistry", startLevel: 11, endLevel: 20 },
    { id: 3, name: "Functional Groups", startLevel: 21, endLevel: 30 },
    { id: 4, name: "Complex Molecules", startLevel: 31, endLevel: 40 },
    { id: 5, name: "Master Chemist", startLevel: 41, endLevel: 50 }
  ];

  var W = '\\u2593';
  var O = '\\u00B7';

  var LEVEL_DATA = [
${levelEntries.join(',\n\n')}
  ];

  // ---- Parser ----
  function parse(levelId) {
    var idx = levelId - 1;
    if (idx < 0 || idx >= LEVEL_DATA.length) return null;

    var data = LEVEL_DATA[idx];
    var map = data.map;
    var walls = {};
    var height = map.length;
    var width = 0;
    var atomPositions = [];

    for (var y = 0; y < height; y++) {
      var row = map[y];
      if (row.length > width) width = row.length;
      for (var x = 0; x < row.length; x++) {
        var ch = row[x];
        var k = x + ',' + y;
        if (ch === W) {
          walls[k] = true;
        } else if (ch === '0') {
          atomPositions.push({ x: x, y: y });
        }
      }
    }

    var atoms = [];
    for (var i = 0; i < atomPositions.length && i < data.atomIds.length; i++) {
      var cellStr = data.atomIds[i];
      var parsed = Molecules.parseAtomCell(cellStr);
      atoms.push({
        id: i,
        element: parsed.element,
        x: atomPositions[i].x,
        y: atomPositions[i].y,
        bonds: parsed.bonds,
        cellStr: cellStr
      });
    }

    var inside = {};
    if (atoms.length > 0) {
      var queue = [atoms[0].x + ',' + atoms[0].y];
      inside[atoms[0].x + ',' + atoms[0].y] = true;
      while (queue.length > 0) {
        var cur = queue.shift();
        var cp = cur.split(',');
        var cx = parseInt(cp[0]);
        var cy = parseInt(cp[1]);
        var dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        for (var d = 0; d < dirs.length; d++) {
          var nx = cx + dirs[d][0];
          var ny = cy + dirs[d][1];
          var nk = nx + ',' + ny;
          if (!inside[nk] && !walls[nk] && nx >= 0 && ny >= 0 && nx < width && ny < height) {
            inside[nk] = true;
            queue.push(nk);
          }
        }
      }
    }
    for (var wk in walls) { inside[wk] = true; }

    return {
      id: levelId,
      name: data.name,
      molecule: data.molecule,
      width: width,
      height: height,
      walls: walls,
      inside: inside,
      atoms: atoms,
      optimalMoves: data.optimalMoves || 0,
      location: data.location
    };
  }

  var Levels = {
    parse: parse,
    getCount: function () { return LEVEL_DATA.length; },
    getMeta: function (levelId) {
      var idx = levelId - 1;
      if (idx < 0 || idx >= LEVEL_DATA.length) return null;
      var d = LEVEL_DATA[idx];
      return { id: levelId, name: d.name, molecule: d.molecule, location: d.location };
    },
    getLocation: function (levelId) {
      var idx = levelId - 1;
      if (idx < 0 || idx >= LEVEL_DATA.length) return 1;
      return LEVEL_DATA[idx].location;
    },
    getLabMeta: function (labId) {
      for (var i = 0; i < LABS.length; i++) {
        if (LABS[i].id === labId) return LABS[i];
      }
      return LABS[0];
    },
    getLabLevels: function (labId) {
      var meta = Levels.getLabMeta(labId);
      var ids = [];
      for (var i = meta.startLevel; i <= meta.endLevel; i++) ids.push(i);
      return ids;
    },
    validate: function () {
      var issues = [];
      for (var i = 0; i < LEVEL_DATA.length; i++) {
        var level = parse(i + 1);
        if (!level || level.atoms.length === 0) {
          issues.push('Level ' + (i + 1) + ' (' + (LEVEL_DATA[i].name) + '): no atoms');
          continue;
        }
        var molAtoms = Molecules.getMoleculeAtoms(level.molecule);
        if (!molAtoms || molAtoms.length === 0) {
          issues.push('Level ' + (i + 1) + ' (' + level.name + '): unknown molecule "' + level.molecule + '"');
        } else if (level.atoms.length !== molAtoms.length) {
          issues.push('Level ' + (i + 1) + ' (' + level.name + '): ' + level.atoms.length + ' atoms in map vs ' + molAtoms.length + ' in molecule "' + level.molecule + '"');
        } else {
          var molElemCounts = {};
          for (var m = 0; m < molAtoms.length; m++) {
            var me = molAtoms[m].element;
            molElemCounts[me] = (molElemCounts[me] || 0) + 1;
          }
          var lvlElemCounts = {};
          for (var a = 0; a < level.atoms.length; a++) {
            var le = level.atoms[a].element;
            lvlElemCounts[le] = (lvlElemCounts[le] || 0) + 1;
          }
          for (var key in molElemCounts) {
            if (molElemCounts[key] !== (lvlElemCounts[key] || 0)) {
              issues.push('Level ' + (i + 1) + ' (' + level.name + '): element mismatch for ' + key);
            }
          }
          for (var lkey in lvlElemCounts) {
            if (!molElemCounts[lkey]) {
              issues.push('Level ' + (i + 1) + ' (' + level.name + '): extra element ' + lkey);
            }
          }
        }
      }
      return issues;
    }
  };

  window.Levels = Levels;
})();
`;

fs.writeFileSync(path.join(__dirname, 'js', 'levels.js'), output, 'utf8');

console.log('\n=== Summary ===');
console.log(`Total levels: ${campaign.length}`);
console.log(`Hand-crafted: ${handcraftedCount}`);
console.log(`From cache: ${cachedCount}`);
console.log(`Newly generated: ${generatedCount}`);
console.log('\nlevels.js written successfully.');

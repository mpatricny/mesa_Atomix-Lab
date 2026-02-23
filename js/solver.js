/**
 * Solver - A* search solver for Atomix Lab puzzles
 * Based on the "Solving Atomix Exactly" approach
 */
(function () {
  'use strict';

  // =========================================================================
  // MinHeap - Priority queue for A* open set
  // =========================================================================

  function MinHeap() {
    this._data = [];
  }

  MinHeap.prototype.size = function () {
    return this._data.length;
  };

  MinHeap.prototype.push = function (item) {
    this._data.push(item);
    this._bubbleUp(this._data.length - 1);
  };

  MinHeap.prototype.pop = function () {
    var data = this._data;
    if (data.length === 0) return undefined;
    var top = data[0];
    var last = data.pop();
    if (data.length > 0) {
      data[0] = last;
      this._sinkDown(0);
    }
    return top;
  };

  MinHeap.prototype._bubbleUp = function (idx) {
    var data = this._data;
    while (idx > 0) {
      var parentIdx = (idx - 1) >> 1;
      if (data[idx].f < data[parentIdx].f) {
        var tmp = data[idx];
        data[idx] = data[parentIdx];
        data[parentIdx] = tmp;
        idx = parentIdx;
      } else {
        break;
      }
    }
  };

  MinHeap.prototype._sinkDown = function (idx) {
    var data = this._data;
    var len = data.length;
    while (true) {
      var left = 2 * idx + 1;
      var right = 2 * idx + 2;
      var smallest = idx;
      if (left < len && data[left].f < data[smallest].f) {
        smallest = left;
      }
      if (right < len && data[right].f < data[smallest].f) {
        smallest = right;
      }
      if (smallest !== idx) {
        var tmp = data[idx];
        data[idx] = data[smallest];
        data[smallest] = tmp;
        idx = smallest;
      } else {
        break;
      }
    }
  };

  // =========================================================================
  // State encoding
  // =========================================================================

  /**
   * Encode atom positions into a string key for the visited set.
   * atoms is an array of {x, y} sorted by index (atom order is fixed).
   * Returns "x0,y0|x1,y1|..."
   */
  function encodeState(atoms) {
    var parts = [];
    for (var i = 0; i < atoms.length; i++) {
      parts.push(atoms[i].x + ',' + atoms[i].y);
    }
    return parts.join('|');
  }

  // =========================================================================
  // Sliding mechanics
  // =========================================================================

  /**
   * Check if a cell is blocked by a wall or out of bounds.
   */
  function isBlocked(x, y, walls, width, height) {
    if (x < 0 || y < 0 || x >= width || y >= height) return true;
    if (walls[x + ',' + y]) return true;
    return false;
  }

  /**
   * Check if any atom (other than atomIdx) occupies the given position.
   */
  function isOccupied(x, y, atoms, atomIdx) {
    for (var i = 0; i < atoms.length; i++) {
      if (i === atomIdx) continue;
      if (atoms[i].x === x && atoms[i].y === y) return true;
    }
    return false;
  }

  /**
   * Simulate sliding atom at atomIdx in direction (dx, dy).
   * Returns the new position {x, y} where the atom stops.
   * Does NOT modify the atoms array.
   */
  function slideAtom(atomIdx, dx, dy, atoms, walls, width, height) {
    var cx = atoms[atomIdx].x;
    var cy = atoms[atomIdx].y;

    while (true) {
      var nx = cx + dx;
      var ny = cy + dy;

      if (isBlocked(nx, ny, walls, width, height)) break;
      if (isOccupied(nx, ny, atoms, atomIdx)) break;

      cx = nx;
      cy = ny;
    }

    return { x: cx, y: cy };
  }

  // =========================================================================
  // Neighbor generation
  // =========================================================================

  var DIRECTIONS = [
    { dx: 0, dy: -1 },  // up
    { dx: 0, dy: 1 },   // down
    { dx: -1, dy: 0 },  // left
    { dx: 1, dy: 0 }    // right
  ];

  /**
   * Returns array of all possible next states from the current state.
   * Each result: {atoms: newAtomsArray, move: {atomIdx, dx, dy, fromX, fromY, toX, toY}}
   */
  function getNeighborStates(atoms, walls, width, height) {
    var neighbors = [];

    for (var i = 0; i < atoms.length; i++) {
      for (var d = 0; d < DIRECTIONS.length; d++) {
        var dir = DIRECTIONS[d];
        var newPos = slideAtom(i, dir.dx, dir.dy, atoms, walls, width, height);

        // Only add if atom actually moved
        if (newPos.x === atoms[i].x && newPos.y === atoms[i].y) continue;

        // Create new atoms array with updated position
        var newAtoms = [];
        for (var j = 0; j < atoms.length; j++) {
          if (j === i) {
            newAtoms.push({ x: newPos.x, y: newPos.y });
          } else {
            newAtoms.push({ x: atoms[j].x, y: atoms[j].y });
          }
        }

        neighbors.push({
          atoms: newAtoms,
          move: {
            atomIdx: i,
            dx: dir.dx,
            dy: dir.dy,
            fromX: atoms[i].x,
            fromY: atoms[i].y,
            toX: newPos.x,
            toY: newPos.y
          }
        });
      }
    }

    return neighbors;
  }

  // =========================================================================
  // Goal checking
  // =========================================================================

  /**
   * Checks if current atom positions match any valid goal placement.
   * Matching is done by position + element, so all atoms of the same element
   * are interchangeable (e.g. any H can fill any H slot).
   * Returns the matched placement index, or -1 if no match.
   */
  function isGoalState(atoms, goalPlacements, atomElements) {
    for (var p = 0; p < goalPlacements.length; p++) {
      var placement = goalPlacements[p];

      // Build map of what atoms we have at each position: "x,y" -> element
      var have = {};
      for (var j = 0; j < atoms.length; j++) {
        have[atoms[j].x + ',' + atoms[j].y] = atomElements[j];
      }

      // Check if every target position has an atom with the matching element
      var match = true;
      for (var i = 0; i < placement.length; i++) {
        var pk = placement[i].x + ',' + placement[i].y;
        if (have[pk] !== placement[i].element) {
          match = false;
          break;
        }
      }
      if (match) return p;
    }
    return -1;
  }

  // =========================================================================
  // Goal placement computation
  // =========================================================================

  /**
   * Given a level, compute all valid positions where the molecule pattern fits
   * without overlapping walls. Returns array of placements, where each placement
   * is an array of {x, y, cellStr} target positions.
   *
   * The molecule definition comes from Molecules.getMoleculeAtoms(slug) which
   * returns an array of {x, y, element, bonds, cellStr} (relative positions in
   * the molecule grid).
   */
  function computeGoalPlacements(level) {
    var moleculeAtoms = Molecules.getMoleculeAtoms(level.molecule);
    if (!moleculeAtoms || moleculeAtoms.length === 0) return [];

    var walls = level.walls;
    var width = level.width;
    var height = level.height;

    // Find bounding box of molecule definition
    var minX = moleculeAtoms[0].x;
    var maxX = moleculeAtoms[0].x;
    var minY = moleculeAtoms[0].y;
    var maxY = moleculeAtoms[0].y;
    for (var m = 1; m < moleculeAtoms.length; m++) {
      if (moleculeAtoms[m].x < minX) minX = moleculeAtoms[m].x;
      if (moleculeAtoms[m].x > maxX) maxX = moleculeAtoms[m].x;
      if (moleculeAtoms[m].y < minY) minY = moleculeAtoms[m].y;
      if (moleculeAtoms[m].y > maxY) maxY = moleculeAtoms[m].y;
    }

    var molWidth = maxX - minX + 1;
    var molHeight = maxY - minY + 1;

    var placements = [];

    // Try every possible offset on the grid
    for (var oy = 0; oy <= height - molHeight; oy++) {
      for (var ox = 0; ox <= width - molWidth; ox++) {
        var valid = true;
        var placement = [];

        for (var k = 0; k < moleculeAtoms.length; k++) {
          var gx = ox + (moleculeAtoms[k].x - minX);
          var gy = oy + (moleculeAtoms[k].y - minY);

          // Check bounds and walls
          if (gx < 0 || gy < 0 || gx >= width || gy >= height) {
            valid = false;
            break;
          }
          if (walls[gx + ',' + gy]) {
            valid = false;
            break;
          }

          // Also check position is inside the playable area
          if (!level.inside[gx + ',' + gy]) {
            valid = false;
            break;
          }

          placement.push({ x: gx, y: gy, cellStr: moleculeAtoms[k].cellStr, element: moleculeAtoms[k].element });
        }

        if (valid) {
          placements.push(placement);
        }
      }
    }

    return placements;
  }

  // =========================================================================
  // Heuristic
  // =========================================================================

  /**
   * Admissible heuristic for sliding puzzles using 1-to-1 assignment.
   *
   * Phase 1: Match atoms already at a target position (cost 0), 1-to-1.
   * Phase 2: For each remaining unmatched atom, cost is 1 if it shares a
   *          row or column with any remaining target of matching element,
   *          otherwise 2 (needs at least 2 slides for a direction change).
   *
   * Returns the minimum total across all goal placements.
   * Admissible because: placed atoms need 0 moves, same-line atoms need >= 1,
   * different-line atoms need >= 2 (must change both row and column).
   */
  function heuristic(atoms, goalPlacements, atomElements) {
    var n = atoms.length;
    var minCost = Infinity;

    for (var p = 0; p < goalPlacements.length; p++) {
      var placement = goalPlacements[p];
      var totalCost = 0;

      // Phase 1: greedily match atoms at target positions (cost 0)
      // Use bitmasks for small n (up to 30 atoms)
      var atomUsed = 0;   // bitmask
      var targetUsed = 0; // bitmask

      for (var i = 0; i < n; i++) {
        if (targetUsed & (1 << i)) continue;
        for (var j = 0; j < n; j++) {
          if (atomUsed & (1 << j)) continue;
          if (atomElements[j] === placement[i].element &&
              atoms[j].x === placement[i].x && atoms[j].y === placement[i].y) {
            atomUsed |= (1 << j);
            targetUsed |= (1 << i);
            break;
          }
        }
      }

      // Phase 2: for each remaining atom, minimum cost to any remaining target
      for (var j = 0; j < n; j++) {
        if (atomUsed & (1 << j)) continue;
        var best = 2;
        for (var i = 0; i < n; i++) {
          if (targetUsed & (1 << i)) continue;
          if (atomElements[j] !== placement[i].element) continue;
          if (atoms[j].x === placement[i].x || atoms[j].y === placement[i].y) {
            best = 1;
            break;
          }
        }
        totalCost += best;
      }

      if (totalCost < minCost) {
        minCost = totalCost;
      }
    }

    return minCost === Infinity ? 0 : minCost;
  }

  // =========================================================================
  // A* solver
  // =========================================================================

  /**
   * Fast (inadmissible) Manhattan-distance heuristic. Not optimal but finds
   * solutions quickly. Used as fallback for hints when the admissible solver
   * exceeds its budget.
   */
  function heuristicFast(atoms, goalPlacements, atomElements) {
    var minDist = Infinity;
    for (var p = 0; p < goalPlacements.length; p++) {
      var placement = goalPlacements[p];
      var totalDist = 0;
      for (var i = 0; i < placement.length; i++) {
        var target = placement[i];
        var bestDist = Infinity;
        for (var j = 0; j < atoms.length; j++) {
          if (atomElements[j] === target.element) {
            var d = Math.abs(atoms[j].x - target.x) + Math.abs(atoms[j].y - target.y);
            if (d < bestDist) bestDist = d;
          }
        }
        totalDist += bestDist;
      }
      if (totalDist < minDist) minDist = totalDist;
    }
    return minDist === Infinity ? 0 : minDist;
  }

  /**
   * A* search solver.
   *
   * Returns {moves: [...], optimal: bool, placementIdx} or null.
   * maxIterations defaults to 50000. heuristicFn can override the heuristic.
   */
  function solve(level, atoms, maxIterations, heuristicFn) {
    if (maxIterations === undefined) maxIterations = 50000;
    var hFn = heuristicFn || heuristic;

    var goalPlacements = computeGoalPlacements(level);
    if (goalPlacements.length === 0) return null;

    var walls = level.walls;
    var width = level.width;
    var height = level.height;

    // Extract elements (fixed for each atom index throughout the search)
    var atomElements = [];
    for (var c = 0; c < atoms.length; c++) {
      atomElements.push(atoms[c].element);
    }

    // Build initial state: extract just {x, y} in atom-index order
    var initPositions = [];
    for (var i = 0; i < atoms.length; i++) {
      initPositions.push({ x: atoms[i].x, y: atoms[i].y });
    }

    // Check if already solved
    var initMatch = isGoalState(initPositions, goalPlacements, atomElements);
    if (initMatch >= 0) {
      return { moves: [], optimal: true, placementIdx: initMatch };
    }

    var startKey = encodeState(initPositions);
    var h0 = hFn(initPositions, goalPlacements, atomElements);

    var openSet = new MinHeap();
    openSet.push({
      f: h0,
      g: 0,
      key: startKey,
      atoms: initPositions,
      parentKey: null,
      move: null
    });

    // visited maps stateKey -> {g, parentKey, move}
    var visited = {};
    visited[startKey] = { g: 0, parentKey: null, move: null };

    var iterations = 0;
    var isOptimal = (hFn === heuristic);

    while (openSet.size() > 0 && iterations < maxIterations) {
      iterations++;

      var current = openSet.pop();

      // Skip if we have already found a better path to this state
      var recorded = visited[current.key];
      if (recorded && recorded.g < current.g) continue;

      // Check goal
      var matchIdx = isGoalState(current.atoms, goalPlacements, atomElements);
      if (matchIdx >= 0) {
        // Reconstruct path
        var moves = [];
        var traceKey = current.key;
        while (traceKey !== null) {
          var info = visited[traceKey];
          if (info.move !== null) {
            moves.push(info.move);
          }
          traceKey = info.parentKey;
        }
        moves.reverse();
        return { moves: moves, optimal: isOptimal, placementIdx: matchIdx };
      }

      // Expand neighbors
      var neighbors = getNeighborStates(current.atoms, walls, width, height);

      for (var n = 0; n < neighbors.length; n++) {
        var neighbor = neighbors[n];
        var nKey = encodeState(neighbor.atoms);
        var nG = current.g + 1;

        var existing = visited[nKey];
        if (existing && existing.g <= nG) continue;

        var nH = hFn(neighbor.atoms, goalPlacements, atomElements);
        var nF = nG + nH;

        visited[nKey] = {
          g: nG,
          parentKey: current.key,
          move: neighbor.move
        };

        openSet.push({
          f: nF,
          g: nG,
          key: nKey,
          atoms: neighbor.atoms,
          parentKey: current.key,
          move: neighbor.move
        });
      }
    }

    // No solution found within iteration limit
    return null;
  }

  // =========================================================================
  // Public helpers
  // =========================================================================

  /**
   * Returns {move, placementIdx} for the first move of the solution,
   * or null if no solution. Tries admissible heuristic first (optimal hint),
   * falls back to fast heuristic (valid but possibly non-optimal hint).
   */
  function getNextHint(level, atoms) {
    var result = solve(level, atoms);
    if (!result || result.moves.length === 0) {
      // Fallback: fast heuristic finds solutions more reliably
      result = solve(level, atoms, 50000, heuristicFast);
    }
    if (!result || result.moves.length === 0) return null;
    return { move: result.moves[0], placementIdx: result.placementIdx };
  }

  /**
   * Returns the number of moves in the optimal solution, or -1.
   */
  function getOptimalMoveCount(level, atoms) {
    var result = solve(level, atoms);
    if (!result) return -1;
    return result.moves.length;
  }

  // =========================================================================
  // Public API
  // =========================================================================

  var Solver = {
    solve: solve,
    getNextHint: getNextHint,
    getOptimalMoveCount: getOptimalMoveCount,
    isGoalState: isGoalState,
    computeGoalPlacements: computeGoalPlacements
  };

  window.Solver = Solver;
})();

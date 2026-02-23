/**
 * Game - Core engine: grid, state, atom selection, sliding, rendering, animation
 * Atomix sliding-block mechanics: atoms slide until hitting a wall or another atom
 */
(function () {
  'use strict';

  // ---- Constants ----
  var TILE = 48;
  var ANIM_DURATION = 120;
  var PULSE_SPEED = 0.003;
  var SELECT_PULSE_SPEED = 0.006;

  // Chemistry-lab color scheme
  var C = {
    primary:   '#4af0ff',
    accent:    '#44cc66',
    shadow:    'rgba(0,0,0,0.35)',
    goalGhost: 'rgba(74,240,255,0.15)',
    goalGhostStroke: 'rgba(74,240,255,0.3)',
    bondLine:  'rgba(180,200,220,0.6)',
    bondDouble:'rgba(180,200,220,0.5)',
    hintArrow: '#ffaa44',
    onGoal:    'rgba(68,204,102,0.25)'
  };

  // Element colors (matching molecules.js)
  var ELEM_COLORS = {
    H:  { fill: '#c8c8ff', dark: '#8888bb', label: '#222' },
    C:  { fill: '#808080', dark: '#505050', label: '#fff' },
    O:  { fill: '#ff6464', dark: '#bb3333', label: '#fff' },
    N:  { fill: '#6464ff', dark: '#3333bb', label: '#fff' },
    S:  { fill: '#ffffc8', dark: '#bbbb88', label: '#222' },
    Cl: { fill: '#64ff64', dark: '#33bb33', label: '#222' }
  };

  // Direction vectors
  var DIR = {
    up:    { dx:  0, dy: -1 },
    down:  { dx:  0, dy:  1 },
    left:  { dx: -1, dy:  0 },
    right: { dx:  1, dy:  0 }
  };

  // Lab environment themes
  var THEMES = {
    1: { floor: '#101820', floorAlt: '#0e1620', wall: '#1a2838', wallTop: '#223448', wallDark: '#0c1420', void: '#060a10', dust: '#4af0ff' },
    2: { floor: '#141a10', floorAlt: '#121810', wall: '#1e2a18', wallTop: '#283820', wallDark: '#0e1608', void: '#060a04', dust: '#66cc88' },
    3: { floor: '#181018', floorAlt: '#160e16', wall: '#2a1a30', wallTop: '#3a2840', wallDark: '#140c18', void: '#080410', dust: '#aa66cc' },
    4: { floor: '#1a1410', floorAlt: '#18120e', wall: '#2a2018', wallTop: '#3a2e22', wallDark: '#120c08', void: '#0a0604', dust: '#cc8844' },
    5: { floor: '#101418', floorAlt: '#0e1216', wall: '#182028', wallTop: '#202e38', wallDark: '#0a0e14', void: '#04060a', dust: '#88aacc' }
  };

  var T = THEMES[1];

  // ---- State ----
  var _canvas, _ctx;
  var _state = null;
  var _level = null;
  var _undoStack = [];
  var _animating = false;
  var _anims = [];
  var _rafId = null;
  var _time = 0;
  var _onWin = null;
  var _onStateChange = null;

  // Goal placements cache
  var _goalPlacements = null;
  var _activeGoalPlacement = null;

  // Hint
  var _hintMove = null;
  var _hintTime = 0;

  // Touch input
  var _touchStartX = 0;
  var _touchStartY = 0;

  // Offscreen caches
  var _floorCache = null;

  // Particles
  var _particles = [];
  var _dustParticles = [];

  // Seeded RNG for consistent procedural textures
  function seededRand(x, y, seed) {
    var n = Math.sin(x * 127.1 + y * 311.7 + (seed || 0) * 43758.5453) * 43758.5453;
    return n - Math.floor(n);
  }

  // ---- Helpers ----
  function key(x, y) { return x + ',' + y; }

  function easeOutQuad(t) { return t * (2 - t); }

  function shadeColor(hex, amt) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    r = Math.max(0, Math.min(255, r + amt));
    g = Math.max(0, Math.min(255, g + amt));
    b = Math.max(0, Math.min(255, b + amt));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function copyAtoms(atoms) {
    var c = [];
    for (var i = 0; i < atoms.length; i++) {
      c.push({ id: atoms[i].id, element: atoms[i].element, x: atoms[i].x, y: atoms[i].y, bonds: atoms[i].bonds, cellStr: atoms[i].cellStr });
    }
    return c;
  }

  function snapshot() {
    return {
      atoms: copyAtoms(_state.atoms),
      selectedAtom: _state.selectedAtom,
      moves: _state.moves,
      hintsUsed: _state.hintsUsed
    };
  }

  function isWall(x, y) {
    if (x < 0 || y < 0 || x >= _level.width || y >= _level.height) return true;
    return !!_level.walls[key(x, y)];
  }

  function isAtomAt(x, y, atoms, skipIdx) {
    for (var i = 0; i < atoms.length; i++) {
      if (i === skipIdx) continue;
      if (atoms[i].x === x && atoms[i].y === y) return true;
    }
    return false;
  }

  function slideAtomCalc(atomIdx, dx, dy, atoms) {
    var atom = atoms[atomIdx];
    var nx = atom.x;
    var ny = atom.y;
    while (true) {
      var tx = nx + dx;
      var ty = ny + dy;
      if (isWall(tx, ty) || isAtomAt(tx, ty, atoms, atomIdx)) break;
      nx = tx;
      ny = ty;
    }
    return { x: nx, y: ny };
  }

  function atomAtGrid(gx, gy) {
    if (!_state) return -1;
    for (var i = 0; i < _state.atoms.length; i++) {
      if (_state.atoms[i].x === gx && _state.atoms[i].y === gy) return i;
    }
    return -1;
  }

  // ---- Floor Cache ----
  function buildFloorCache() {
    var w = _level.width;
    var h = _level.height;
    var c = document.createElement('canvas');
    c.width = w * TILE;
    c.height = h * TILE;
    var ctx = c.getContext('2d');

    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var k = key(x, y);
        var tx = x * TILE;
        var ty = y * TILE;
        if (!_level.inside || !_level.inside[k]) {
          drawVoidTile(ctx, tx, ty, x, y);
        } else if (_level.walls[k]) {
          drawWallTile(ctx, tx, ty, x, y);
        } else {
          drawFloorTile(ctx, tx, ty, x, y);
        }
      }
    }
    _floorCache = c;
  }

  function drawVoidTile(ctx, x, y, gx, gy) {
    ctx.fillStyle = T.void;
    ctx.fillRect(x, y, TILE, TILE);
    var r = seededRand(gx, gy, 99);
    if (r > 0.6) {
      ctx.save();
      ctx.globalAlpha = 0.03;
      ctx.fillStyle = T.dust;
      ctx.fillRect(x + r * 20, y + r * 16, TILE * 0.4, TILE * 0.3);
      ctx.restore();
    }
  }

  function drawFloorTile(ctx, x, y, gx, gy) {
    var baseR = seededRand(gx, gy, 0);
    var shade = Math.floor(baseR * 8) - 4;
    ctx.fillStyle = shadeColor((gx + gy) % 2 === 0 ? T.floor : T.floorAlt, shade);
    ctx.fillRect(x, y, TILE, TILE);

    // Subtle grid lines (lab tile look)
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);

    // Occasional subtle cross mark
    var r3 = seededRand(gx, gy, 3);
    if (r3 > 0.85) {
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.strokeStyle = T.dust;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + TILE * 0.3, y + TILE * 0.5);
      ctx.lineTo(x + TILE * 0.7, y + TILE * 0.5);
      ctx.moveTo(x + TILE * 0.5, y + TILE * 0.3);
      ctx.lineTo(x + TILE * 0.5, y + TILE * 0.7);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawWallTile(ctx, x, y, gx, gy) {
    ctx.fillStyle = T.wallDark;
    ctx.fillRect(x, y, TILE, TILE);

    // Metal panel look
    var brickR = seededRand(gx, gy, 7);
    var brickShade = Math.floor(brickR * 10) - 5;
    ctx.fillStyle = shadeColor(T.wall, brickShade);
    ctx.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);

    // Top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(x + 1, y + 1, TILE - 2, 2);

    // Bottom shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(x + 1, y + TILE - 3, TILE - 2, 2);

    // Rivet dots
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.arc(x + 6, y + 6, 1.5, 0, Math.PI * 2);
    ctx.arc(x + TILE - 6, y + 6, 1.5, 0, Math.PI * 2);
    ctx.arc(x + 6, y + TILE - 6, 1.5, 0, Math.PI * 2);
    ctx.arc(x + TILE - 6, y + TILE - 6, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- Particles ----
  function initDustParticles() {
    _dustParticles = [];
    if (!_level) return;
    var count = Math.min(15, Math.floor(_level.width * _level.height * 0.2));
    for (var i = 0; i < count; i++) {
      _dustParticles.push({
        x: Math.random() * _level.width * TILE,
        y: Math.random() * _level.height * TILE,
        vx: (Math.random() - 0.5) * 0.1,
        vy: -Math.random() * 0.2 - 0.05,
        size: 1 + Math.random() * 1.5,
        alpha: Math.random() * 0.2,
        alphaDir: (Math.random() > 0.5 ? 1 : -1) * (0.001 + Math.random() * 0.002),
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function updateDustParticles(t) {
    var maxX = _level.width * TILE;
    var maxY = _level.height * TILE;
    for (var i = 0; i < _dustParticles.length; i++) {
      var p = _dustParticles[i];
      p.x += p.vx + Math.sin(t * 0.0003 + p.phase) * 0.08;
      p.y += p.vy;
      p.alpha += p.alphaDir;
      if (p.alpha > 0.25) { p.alpha = 0.25; p.alphaDir = -Math.abs(p.alphaDir); }
      if (p.alpha < 0) { p.alpha = 0; p.alphaDir = Math.abs(p.alphaDir); }
      if (p.y < -5) { p.y = maxY + 5; p.x = Math.random() * maxX; }
      if (p.x < -5) p.x = maxX + 5;
      if (p.x > maxX + 5) p.x = -5;
    }
  }

  function drawDustParticles(ctx) {
    for (var i = 0; i < _dustParticles.length; i++) {
      var p = _dustParticles[i];
      if (p.alpha <= 0.01) continue;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = T.dust;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function spawnParticles(x, y, count, color, opts) {
    opts = opts || {};
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = (opts.speed || 1.5) * (0.5 + Math.random());
      _particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: (opts.size || 2) + Math.random() * (opts.sizeVar || 1),
        alpha: opts.alpha || 0.8,
        decay: (opts.decay || 0.015) + Math.random() * 0.005,
        color: color,
        gravity: opts.gravity || 0
      });
    }
  }

  function updateParticles() {
    for (var i = _particles.length - 1; i >= 0; i--) {
      var p = _particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;
      if (p.alpha <= 0) _particles.splice(i, 1);
    }
  }

  function drawParticles(ctx) {
    for (var i = 0; i < _particles.length; i++) {
      var p = _particles[i];
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.size * p.alpha), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function spawnAtomStopParticles(x, y, element) {
    var ec = ELEM_COLORS[element] || ELEM_COLORS.C;
    spawnParticles(
      x * TILE + TILE / 2, y * TILE + TILE * 0.8,
      4, ec.fill,
      { speed: 0.8, decay: 0.04, size: 1.5, sizeVar: 1 }
    );
  }

  function spawnVictoryBurst() {
    if (!_level) return;
    var cx = _level.width * TILE / 2;
    var cy = _level.height * TILE / 2;
    spawnParticles(cx, cy, 30, C.accent, {
      speed: 3.5, decay: 0.008, size: 3, sizeVar: 2, gravity: 0.05
    });
    spawnParticles(cx, cy, 15, C.primary, {
      speed: 2.5, decay: 0.01, size: 2, sizeVar: 1, gravity: 0.03
    });
  }

  function spawnBondParticles(x1, y1, x2, y2) {
    var mx = (x1 + x2) / 2 * TILE + TILE / 2;
    var my = (y1 + y2) / 2 * TILE + TILE / 2;
    spawnParticles(mx, my, 6, C.accent, {
      speed: 1.2, decay: 0.03, size: 1.5, sizeVar: 1
    });
  }

  // ---- Rendering Helpers ----
  function drawAtom(ctx, px, py, atom, isSelected, isOnGoal, t) {
    var ec = ELEM_COLORS[atom.element] || ELEM_COLORS.C;
    var cx = px + TILE / 2;
    var cy = py + TILE / 2;
    var r = TILE * 0.36;

    // 3D sphere effect
    var grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, ec.fill);
    grad.addColorStop(1, ec.dark);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Specular highlight
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.2, cy - r * 0.25, r * 0.25, r * 0.15, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Element label
    ctx.fillStyle = ec.label;
    ctx.font = 'bold ' + Math.floor(TILE * 0.32) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(atom.element, cx, cy + 1);

    // On-goal glow
    if (isOnGoal) {
      ctx.save();
      ctx.globalAlpha = 0.2 + Math.sin((t || 0) * 0.004) * 0.08;
      ctx.shadowColor = C.accent;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Selection indicator: pulsing cyan ring + directional arrows
    if (isSelected) {
      var selPulse = 0.5 + 0.3 * Math.sin((t || 0) * SELECT_PULSE_SPEED);
      ctx.save();
      ctx.globalAlpha = selPulse;
      ctx.strokeStyle = C.primary;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Direction arrows
      ctx.globalAlpha = selPulse * 0.7;
      ctx.fillStyle = C.primary;
      var arrowDist = r + 12;
      var arrowSize = 4;
      // Up
      drawArrowHead(ctx, cx, cy - arrowDist, 0, -1, arrowSize);
      // Down
      drawArrowHead(ctx, cx, cy + arrowDist, 0, 1, arrowSize);
      // Left
      drawArrowHead(ctx, cx - arrowDist, cy, -1, 0, arrowSize);
      // Right
      drawArrowHead(ctx, cx + arrowDist, cy, 1, 0, arrowSize);
      ctx.restore();
    }
  }

  function drawArrowHead(ctx, x, y, dx, dy, size) {
    ctx.beginPath();
    ctx.moveTo(x + dx * size, y + dy * size);
    ctx.lineTo(x - dy * size * 0.7 - dx * size * 0.5, y + dx * size * 0.7 - dy * size * 0.5);
    ctx.lineTo(x + dy * size * 0.7 - dx * size * 0.5, y - dx * size * 0.7 - dy * size * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  function drawShadow(ctx, px, py) {
    ctx.save();
    ctx.fillStyle = C.shadow;
    ctx.beginPath();
    ctx.ellipse(px + TILE / 2, py + TILE - 3, TILE * 0.3, TILE * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawBondLine(ctx, x1, y1, x2, y2, bondType) {
    var cx1 = x1 * TILE + TILE / 2;
    var cy1 = y1 * TILE + TILE / 2;
    var cx2 = x2 * TILE + TILE / 2;
    var cy2 = y2 * TILE + TILE / 2;

    ctx.save();
    ctx.lineWidth = 2;

    if (bondType === 'double') {
      // Two parallel lines
      var dx = cx2 - cx1;
      var dy = cy2 - cy1;
      var len = Math.sqrt(dx * dx + dy * dy);
      var nx = -dy / len * 3;
      var ny = dx / len * 3;

      ctx.strokeStyle = C.bondDouble;
      ctx.beginPath();
      ctx.moveTo(cx1 + nx, cy1 + ny);
      ctx.lineTo(cx2 + nx, cy2 + ny);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx1 - nx, cy1 - ny);
      ctx.lineTo(cx2 - nx, cy2 - ny);
      ctx.stroke();
    } else {
      ctx.strokeStyle = C.bondLine;
      ctx.beginPath();
      ctx.moveTo(cx1, cy1);
      ctx.lineTo(cx2, cy2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawGoalGhosts(ctx, t) {
    if (!_activeGoalPlacement) return;
    var pulse = 0.4 + 0.2 * Math.sin(t * PULSE_SPEED);

    for (var i = 0; i < _activeGoalPlacement.length; i++) {
      var gp = _activeGoalPlacement[i];
      var px = gp.x * TILE;
      var py = gp.y * TILE;
      var cx = px + TILE / 2;
      var cy = py + TILE / 2;
      var r = TILE * 0.3;

      ctx.save();
      ctx.globalAlpha = pulse * 0.3;
      ctx.fillStyle = C.goalGhost;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = pulse * 0.5;
      ctx.strokeStyle = C.goalGhostStroke;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Element letter ghost
      var ec = ELEM_COLORS[gp.element] || ELEM_COLORS.C;
      ctx.globalAlpha = pulse * 0.3;
      ctx.fillStyle = ec.fill;
      ctx.font = Math.floor(TILE * 0.22) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(gp.element, cx, cy + 1);
      ctx.restore();
    }
  }

  function drawHintArrow(ctx, t) {
    if (!_hintMove) return;
    var elapsed = t - _hintTime;
    var alpha = 0.4 + 0.3 * Math.sin(elapsed * 0.005);
    if (elapsed > 5000) { _hintMove = null; return; }

    var atom = _state.atoms[_hintMove.atomIdx];
    var fromPx = atom.x * TILE + TILE / 2;
    var fromPy = atom.y * TILE + TILE / 2;
    var toPx = _hintMove.toX * TILE + TILE / 2;
    var toPy = _hintMove.toY * TILE + TILE / 2;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = C.hintArrow;
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(fromPx, fromPy);
    ctx.lineTo(toPx, toPy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrowhead
    ctx.fillStyle = C.hintArrow;
    drawArrowHead(ctx, toPx, toPy, _hintMove.dx, _hintMove.dy, 6);
    ctx.restore();
  }

  // ---- Bond checking ----
  // One-directional: if atom A has a bond slot pointing toward atom B's
  // position, draw the bond. Any atom of the right element can fill any slot.
  function getActiveBonds() {
    var bonds = [];
    if (!_state || !_state.atoms) return bonds;

    var seen = {}; // deduplicate by atom pair

    for (var i = 0; i < _state.atoms.length; i++) {
      var atom = _state.atoms[i];
      if (!atom.bonds) continue;
      for (var b = 0; b < atom.bonds.length; b++) {
        var bond = atom.bonds[b];
        var nx = atom.x + bond.dx;
        var ny = atom.y + bond.dy;
        // Check if there's ANY atom at the neighbor position
        for (var j = 0; j < _state.atoms.length; j++) {
          if (j === i) continue;
          var other = _state.atoms[j];
          if (other.x === nx && other.y === ny) {
            var lo = Math.min(i, j);
            var hi = Math.max(i, j);
            var pairKey = lo + ',' + hi;
            if (!seen[pairKey]) {
              seen[pairKey] = true;
              bonds.push({
                x1: atom.x, y1: atom.y,
                x2: other.x, y2: other.y,
                type: bond.type
              });
            }
            break;
          }
        }
      }
    }
    return bonds;
  }

  // ---- Win detection ----
  function getAtomElements() {
    var elems = [];
    for (var i = 0; i < _state.atoms.length; i++) {
      elems.push(_state.atoms[i].element);
    }
    return elems;
  }

  function checkWin() {
    if (!_goalPlacements || !_state) return false;
    return Solver.isGoalState(_state.atoms, _goalPlacements, getAtomElements()) >= 0;
  }

  /**
   * Find the goal placement closest to the current atom positions.
   * Uses element-based matching (any H fills any H slot).
   */
  function updateActiveGoalPlacement() {
    if (!_goalPlacements || _goalPlacements.length === 0 || !_state) {
      _activeGoalPlacement = null;
      return;
    }
    var atomElements = getAtomElements();
    var bestPlacement = _goalPlacements[0];
    var bestDist = Infinity;

    for (var p = 0; p < _goalPlacements.length; p++) {
      var placement = _goalPlacements[p];
      var totalDist = 0;
      for (var i = 0; i < placement.length; i++) {
        var target = placement[i];
        var nearest = Infinity;
        for (var j = 0; j < _state.atoms.length; j++) {
          if (atomElements[j] === target.element) {
            var d = Math.abs(_state.atoms[j].x - target.x) + Math.abs(_state.atoms[j].y - target.y);
            if (d < nearest) nearest = d;
          }
        }
        totalDist += nearest;
      }
      if (totalDist < bestDist) {
        bestDist = totalDist;
        bestPlacement = placement;
      }
    }
    _activeGoalPlacement = bestPlacement;
  }

  /**
   * Set the active goal placement to a specific placement index.
   * Called when the solver finds a solution targeting a specific placement.
   */
  function setActiveGoalPlacement(idx) {
    if (_goalPlacements && idx >= 0 && idx < _goalPlacements.length) {
      _activeGoalPlacement = _goalPlacements[idx];
    }
  }

  function calcStars(moves, optimal) {
    if (optimal <= 0) return 1;
    if (moves <= optimal) return 3;
    if (moves <= Math.ceil(optimal * 1.5)) return 2;
    return 1;
  }

  // ---- Public API ----
  var Game = {
    init: function (canvas) {
      _canvas = canvas;
      _ctx = canvas.getContext('2d');

      // Canvas click for atom selection
      canvas.addEventListener('click', function (e) {
        if (!_state || _state.won || _animating) return;
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;
        var mx = (e.clientX - rect.left) * scaleX;
        var my = (e.clientY - rect.top) * scaleY;
        var gx = Math.floor(mx / TILE);
        var gy = Math.floor(my / TILE);
        var idx = atomAtGrid(gx, gy);
        if (idx >= 0) {
          Game.selectAtom(idx);
        }
      });

      // Touch events
      canvas.addEventListener('touchstart', function (e) {
        e.preventDefault();
        var touch = e.touches[0];
        _touchStartX = touch.clientX;
        _touchStartY = touch.clientY;
      }, { passive: false });

      canvas.addEventListener('touchmove', function (e) {
        e.preventDefault();
      }, { passive: false });

      canvas.addEventListener('touchend', function (e) {
        e.preventDefault();
        if (!_state || _state.won || _animating) return;
        if (!e.changedTouches.length) return;

        var touch = e.changedTouches[0];
        var dx = touch.clientX - _touchStartX;
        var dy = touch.clientY - _touchStartY;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 20) {
          // Tap — select atom
          var rect = canvas.getBoundingClientRect();
          var scaleX = canvas.width / rect.width;
          var scaleY = canvas.height / rect.height;
          var mx = (touch.clientX - rect.left) * scaleX;
          var my = (touch.clientY - rect.top) * scaleY;
          var gx = Math.floor(mx / TILE);
          var gy = Math.floor(my / TILE);
          var idx = atomAtGrid(gx, gy);
          if (idx >= 0) {
            Game.selectAtom(idx);
          }
          return;
        }

        // Swipe — slide selected atom
        if (_state.selectedAtom === null) return;
        var dir;
        if (Math.abs(dx) > Math.abs(dy)) {
          dir = dx > 0 ? DIR.right : DIR.left;
        } else {
          dir = dy > 0 ? DIR.down : DIR.up;
        }
        Game.slideAtom(dir);
      }, { passive: false });
    },

    loadAssets: function () {
      return Promise.resolve();
    },

    startLevel: function (levelId) {
      _level = Levels.parse(levelId);
      if (!_level) return false;

      T = THEMES[_level.location] || THEMES[1];

      _state = {
        atoms: copyAtoms(_level.atoms),
        selectedAtom: null,
        moves: 0,
        hintsUsed: 0,
        won: false
      };

      _undoStack = [];
      _animating = false;
      _anims = [];
      _particles = [];
      _hintMove = null;

      // Compute goal placements
      _goalPlacements = Solver.computeGoalPlacements(_level);
      updateActiveGoalPlacement();

      // Build offscreen caches
      buildFloorCache();
      initDustParticles();

      Game.resizeCanvas();
      Game.startRenderLoop();
      return true;
    },

    resizeCanvas: function () {
      if (!_level) return;
      var container = _canvas.parentElement;
      var maxW = container.clientWidth - 16;
      var maxH = container.clientHeight - 16;

      var levelW = _level.width * TILE;
      var levelH = _level.height * TILE;

      var scale = Math.min(maxW / levelW, maxH / levelH, 1.5);
      var minTile = ('ontouchstart' in window) ? 28 : 32;
      if (TILE * scale < minTile) scale = minTile / TILE;

      var w = Math.floor(levelW * scale);
      var h = Math.floor(levelH * scale);

      _canvas.width = levelW;
      _canvas.height = levelH;
      _canvas.style.width = w + 'px';
      _canvas.style.height = h + 'px';
      _ctx.imageSmoothingEnabled = true;
    },

    startRenderLoop: function () {
      if (_rafId) cancelAnimationFrame(_rafId);
      function loop(t) {
        _time = t;
        Game.processAnimQueue(t);
        updateParticles();
        updateDustParticles(t);
        Game.render(t);
        _rafId = requestAnimationFrame(loop);
      }
      _rafId = requestAnimationFrame(loop);
    },

    stopRenderLoop: function () {
      if (_rafId) {
        cancelAnimationFrame(_rafId);
        _rafId = null;
      }
    },

    // ---- Atom Selection ----
    selectAtom: function (idx) {
      if (!_state || _state.won) return;
      if (idx < 0 || idx >= _state.atoms.length) return;
      if (_state.selectedAtom === idx) {
        _state.selectedAtom = null;
      } else {
        _state.selectedAtom = idx;
        Audio.playAtomSelect();
      }
      _hintMove = null;
      if (_onStateChange) _onStateChange();
    },

    cycleAtomSelection: function (delta) {
      if (!_state || _state.won) return;
      if (_state.atoms.length === 0) return;
      if (_state.selectedAtom === null) {
        _state.selectedAtom = 0;
      } else {
        _state.selectedAtom = (_state.selectedAtom + delta + _state.atoms.length) % _state.atoms.length;
      }
      Audio.playAtomSelect();
      _hintMove = null;
      if (_onStateChange) _onStateChange();
    },

    // ---- Atom Sliding ----
    slideAtom: function (dir) {
      if (!_state || _state.won || _animating) return false;
      if (_state.selectedAtom === null) return false;

      var idx = _state.selectedAtom;
      var atom = _state.atoms[idx];
      var dest = slideAtomCalc(idx, dir.dx, dir.dy, _state.atoms);

      // No movement
      if (dest.x === atom.x && dest.y === atom.y) {
        Audio.playError();
        return false;
      }

      _undoStack.push(snapshot());

      var fromX = atom.x;
      var fromY = atom.y;
      atom.x = dest.x;
      atom.y = dest.y;
      _state.moves++;

      Audio.playAtomSlide();

      // Queue animation
      _anims.push({
        type: 'atom',
        idx: idx,
        fromX: fromX,
        fromY: fromY,
        toX: dest.x,
        toY: dest.y,
        startTime: _time,
        duration: ANIM_DURATION
      });
      _animating = true;

      _hintMove = null;

      // Check for bond formations and spawn particles
      var bonds = getActiveBonds();
      for (var b = 0; b < bonds.length; b++) {
        var bond = bonds[b];
        if ((bond.x1 === dest.x && bond.y1 === dest.y) || (bond.x2 === dest.x && bond.y2 === dest.y)) {
          Audio.playBondForm();
          spawnBondParticles(bond.x1, bond.y1, bond.x2, bond.y2);
        }
      }

      spawnAtomStopParticles(dest.x, dest.y, atom.element);

      // Update active goal placement to nearest match
      updateActiveGoalPlacement();

      Game.checkVictory();
      if (_onStateChange) _onStateChange();
      return true;
    },

    // ---- Input ----
    handleKeyDown: function (e) {
      if (!_state || _state.won || _animating) return;

      var k = e.key.toLowerCase();

      if (k === 'z') {
        e.preventDefault();
        Game.undo();
        return;
      }

      if (k === 'r') {
        e.preventDefault();
        Game.restart();
        return;
      }

      if (k === 'tab') {
        e.preventDefault();
        Game.cycleAtomSelection(e.shiftKey ? -1 : 1);
        return;
      }

      var dir = null;
      if (k === 'arrowup' || k === 'w') dir = DIR.up;
      else if (k === 'arrowdown' || k === 's') dir = DIR.down;
      else if (k === 'arrowleft' || k === 'a') dir = DIR.left;
      else if (k === 'arrowright' || k === 'd') dir = DIR.right;

      if (!dir) return;
      e.preventDefault();

      if (_state.selectedAtom === null) {
        // Auto-select first atom on arrow press
        Game.cycleAtomSelection(1);
        return;
      }

      Game.slideAtom(dir);
    },

    handleDpadInput: function (dirName) {
      if (!_state || _state.won || _animating) return;
      var dir = DIR[dirName];
      if (!dir) return;

      if (_state.selectedAtom === null) {
        Game.cycleAtomSelection(1);
        return;
      }
      Game.slideAtom(dir);
    },

    // ---- Undo / Restart ----
    undo: function () {
      if (_undoStack.length === 0) return;
      var snap = _undoStack.pop();
      _state.atoms = snap.atoms;
      _state.selectedAtom = snap.selectedAtom;
      _state.moves = snap.moves;
      _state.hintsUsed = snap.hintsUsed;
      _anims = [];
      _animating = false;
      _hintMove = null;
      updateActiveGoalPlacement();
      Audio.playUndo();
      if (_onStateChange) _onStateChange();
    },

    restart: function () {
      if (!_level) return;
      Game.startLevel(_level.id);
      Audio.playLevelStart();
      if (_onStateChange) _onStateChange();
    },

    // ---- Hint ----
    requestHint: function () {
      if (!_state || _state.won) return null;
      var hint = Solver.getNextHint(_level, _state.atoms);
      if (hint) {
        _hintMove = hint.move;
        _hintTime = _time;
        _state.hintsUsed++;
        Audio.playHint();
        // Auto-select the hinted atom
        _state.selectedAtom = hint.move.atomIdx;
        // Sync ghost placement with solver's target
        if (hint.placementIdx >= 0) {
          setActiveGoalPlacement(hint.placementIdx);
        }
        if (_onStateChange) _onStateChange();
      }
      return hint;
    },

    // ---- Win Detection ----
    checkVictory: function () {
      if (checkWin()) {
        _state.won = true;
        _state.selectedAtom = null;
        var optimal = _level.optimalMoves || 0;
        var stars = calcStars(_state.moves, optimal);
        Audio.playMoleculeComplete();
        spawnVictoryBurst();
        if (_onWin) _onWin(_level.id, stars, _state);
      }
    },

    // ---- Animation Queue ----
    processAnimQueue: function (t) {
      if (!_anims.length) {
        _animating = false;
        return;
      }
      _animating = true;

      for (var i = _anims.length - 1; i >= 0; i--) {
        var a = _anims[i];
        var elapsed = t - a.startTime;
        a.progress = Math.min(elapsed / a.duration, 1);
        a.progress = easeOutQuad(a.progress);
        if (a.progress >= 1) {
          _anims.splice(i, 1);
        }
      }

      if (!_anims.length) {
        _animating = false;
      }
    },

    findAnim: function (idx) {
      for (var i = 0; i < _anims.length; i++) {
        if (_anims[i].idx === idx) return _anims[i];
      }
      return null;
    },

    // ---- Rendering ----
    render: function (t) {
      if (!_state || !_level) return;
      var ctx = _ctx;

      ctx.clearRect(0, 0, _canvas.width, _canvas.height);

      // Layer 1: Floor + Walls (from cache)
      if (_floorCache) {
        ctx.drawImage(_floorCache, 0, 0);
      }

      // Layer 2: Goal ghost positions
      drawGoalGhosts(ctx, t);

      // Layer 3: Shadows
      for (var si = 0; si < _state.atoms.length; si++) {
        var sa = _state.atoms[si];
        var spx = sa.x * TILE;
        var spy = sa.y * TILE;
        var sAnim = Game.findAnim(si);
        if (sAnim) {
          spx = (sAnim.fromX + (sAnim.toX - sAnim.fromX) * sAnim.progress) * TILE;
          spy = (sAnim.fromY + (sAnim.toY - sAnim.fromY) * sAnim.progress) * TILE;
        }
        drawShadow(ctx, spx, spy);
      }

      // Layer 4: Bond lines between correctly-adjacent atoms
      var activeBonds = getActiveBonds();
      for (var bi = 0; bi < activeBonds.length; bi++) {
        var bond = activeBonds[bi];
        drawBondLine(ctx, bond.x1, bond.y1, bond.x2, bond.y2, bond.type);
      }

      // Layer 5: Atoms
      for (var ai = 0; ai < _state.atoms.length; ai++) {
        var atom = _state.atoms[ai];
        var apx = atom.x * TILE;
        var apy = atom.y * TILE;
        var aAnim = Game.findAnim(ai);
        if (aAnim) {
          apx = (aAnim.fromX + (aAnim.toX - aAnim.fromX) * aAnim.progress) * TILE;
          apy = (aAnim.fromY + (aAnim.toY - aAnim.fromY) * aAnim.progress) * TILE;
        }

        var isSelected = (_state.selectedAtom === ai);
        var isOnGoal = false;
        if (_activeGoalPlacement) {
          for (var gi = 0; gi < _activeGoalPlacement.length; gi++) {
            if (_activeGoalPlacement[gi].element === atom.element &&
                _activeGoalPlacement[gi].x === atom.x &&
                _activeGoalPlacement[gi].y === atom.y) {
              isOnGoal = true;
              break;
            }
          }
        }

        drawAtom(ctx, apx, apy, atom, isSelected, isOnGoal, t);
      }

      // Layer 6: Particles
      drawDustParticles(ctx);
      drawParticles(ctx);

      // Layer 7: Hint arrow
      drawHintArrow(ctx, t);
    },

    // ---- Molecule Preview Drawing ----
    drawMoleculePreview: function (previewCanvas, moleculeSlug) {
      if (!previewCanvas || !moleculeSlug) return;
      var molAtoms = Molecules.getMoleculeAtoms(moleculeSlug);
      var dims = Molecules.getMoleculeDimensions(moleculeSlug);
      if (!molAtoms || !dims) return;

      var pctx = previewCanvas.getContext('2d');
      var tileSize = Math.min(
        Math.floor(previewCanvas.width / (dims.width + 0.5)),
        Math.floor(previewCanvas.height / (dims.height + 0.5))
      );
      tileSize = Math.max(tileSize, 8);

      var offX = Math.floor((previewCanvas.width - dims.width * tileSize) / 2);
      var offY = Math.floor((previewCanvas.height - dims.height * tileSize) / 2);

      pctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

      // Draw bonds first
      for (var i = 0; i < molAtoms.length; i++) {
        var ma = molAtoms[i];
        if (!ma.bonds) continue;
        for (var b = 0; b < ma.bonds.length; b++) {
          var bond = ma.bonds[b];
          var nx = ma.x + bond.dx;
          var ny = ma.y + bond.dy;
          // Only draw if neighbor exists and is to the right/below (avoid double drawing)
          if (bond.dx > 0 || (bond.dx === 0 && bond.dy > 0) ||
              (bond.dx > 0 && bond.dy !== 0)) {
            var cx1 = offX + ma.x * tileSize + tileSize / 2;
            var cy1 = offY + ma.y * tileSize + tileSize / 2;
            var cx2 = offX + nx * tileSize + tileSize / 2;
            var cy2 = offY + ny * tileSize + tileSize / 2;

            pctx.save();
            pctx.lineWidth = bond.type === 'double' ? 1 : 1.5;

            if (bond.type === 'double') {
              var ddx = cx2 - cx1;
              var ddy = cy2 - cy1;
              var dlen = Math.sqrt(ddx * ddx + ddy * ddy);
              var dnx = -ddy / dlen * 2;
              var dny = ddx / dlen * 2;
              pctx.strokeStyle = 'rgba(180,200,220,0.7)';
              pctx.beginPath();
              pctx.moveTo(cx1 + dnx, cy1 + dny);
              pctx.lineTo(cx2 + dnx, cy2 + dny);
              pctx.stroke();
              pctx.beginPath();
              pctx.moveTo(cx1 - dnx, cy1 - dny);
              pctx.lineTo(cx2 - dnx, cy2 - dny);
              pctx.stroke();
            } else {
              pctx.strokeStyle = 'rgba(180,200,220,0.7)';
              pctx.beginPath();
              pctx.moveTo(cx1, cy1);
              pctx.lineTo(cx2, cy2);
              pctx.stroke();
            }
            pctx.restore();
          }
        }
      }

      // Draw atoms
      for (var j = 0; j < molAtoms.length; j++) {
        var pa = molAtoms[j];
        var pcx = offX + pa.x * tileSize + tileSize / 2;
        var pcy = offY + pa.y * tileSize + tileSize / 2;
        var pr = tileSize * 0.36;
        var pec = ELEM_COLORS[pa.element] || ELEM_COLORS.C;

        pctx.beginPath();
        pctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
        pctx.fillStyle = pec.fill;
        pctx.fill();

        if (tileSize >= 16) {
          pctx.fillStyle = pec.label;
          pctx.font = 'bold ' + Math.floor(tileSize * 0.3) + 'px sans-serif';
          pctx.textAlign = 'center';
          pctx.textBaseline = 'middle';
          pctx.fillText(pa.element, pcx, pcy + 1);
        }
      }
    },

    // ---- Accessors ----
    getState: function () { return _state; },
    getLevel: function () { return _level; },
    canUndo: function () { return _undoStack.length > 0; },
    getGoalPlacements: function () { return _goalPlacements; },
    isAnimating: function () { return _animating; },

    onWin: function (cb) { _onWin = cb; },
    onStateChange: function (cb) { _onStateChange = cb; },

    destroy: function () {
      Game.stopRenderLoop();
      _state = null;
      _level = null;
      _undoStack = [];
      _anims = [];
      _particles = [];
      _dustParticles = [];
      _floorCache = null;
      _goalPlacements = null;
      _activeGoalPlacement = null;
      _hintMove = null;
    }
  };

  window.Game = Game;
})();

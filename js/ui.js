/**
 * UI - Screen management, HUD, event binding, overlays
 * Lab map with 5 chemistry labs, per-lab level grid
 */
(function () {
  'use strict';

  var _currentScreen = 'screen-title';
  var _currentLevel = 1;
  var _currentLab = 1;
  var _toastTimer = null;

  var LAB_COLORS = {
    1: '#4af0ff',
    2: '#66cc88',
    3: '#aa66cc',
    4: '#cc8844',
    5: '#ff6666'
  };

  function $(id) { return document.getElementById(id); }

  function showScreen(id) {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) {
      screens[i].classList.remove('active');
    }
    $(id).classList.add('active');
    _currentScreen = id;
  }

  function hideOverlay(id) {
    var el = $(id);
    el.classList.remove('visible');
    el.classList.add('hidden');
  }

  function showOverlay(id) {
    var el = $(id);
    el.classList.remove('hidden');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('visible');
      });
    });
  }

  function starString(count, max) {
    var s = '';
    for (var i = 0; i < max; i++) {
      s += i < count ? '\u2605' : '\u2606';
    }
    return s;
  }

  function starHTML(count, max) {
    var s = '';
    for (var i = 0; i < max; i++) {
      if (i < count) {
        s += '<span class="star-on">\u2605</span>';
      } else {
        s += '<span class="star-off">\u2606</span>';
      }
    }
    return s;
  }

  // ---- Lab Map ----
  function buildLabMap() {
    var container = $('map-container');
    container.innerHTML = '';
    var staggerIndex = 0;

    for (var i = 1; i <= 5; i++) {
      var lab = Levels.getLabMeta(i);
      var unlocked = Storage.isLabUnlocked(i);
      var complete = Storage.isLabComplete(i);
      var stars = Storage.getLabStars(i);
      var levelCount = lab.endLevel - lab.startLevel + 1;
      var maxStars = levelCount * 3;
      var color = LAB_COLORS[i];

      if (i > 1) {
        var path = document.createElement('div');
        path.className = 'map-path';
        path.style.animationDelay = (staggerIndex * 0.06) + 's';
        container.appendChild(path);
        (function (el) {
          requestAnimationFrame(function () { el.classList.add('stagger-in'); });
        })(path);
        staggerIndex++;
      }

      var node = document.createElement('div');
      node.className = 'map-location';
      if (!unlocked) node.classList.add('locked');
      else if (complete) node.classList.add('sealed');
      else node.classList.add('active');

      node.style.setProperty('--loc-color', color);
      node.style.animationDelay = (staggerIndex * 0.08) + 's';

      var nameEl = document.createElement('div');
      nameEl.className = 'map-loc-name';
      nameEl.textContent = lab.name;

      var starsEl = document.createElement('div');
      starsEl.className = 'map-loc-stars';

      if (!unlocked) {
        starsEl.textContent = 'Complete previous lab to unlock';
        starsEl.className = 'map-loc-subtitle';
      } else {
        starsEl.innerHTML = '\u2605 ' + stars + ' / ' + maxStars;
      }

      var badge = document.createElement('div');
      badge.className = 'map-loc-badge';
      if (complete) {
        badge.textContent = '\u2713 Complete';
        badge.classList.add('badge-sealed');
      } else if (unlocked) {
        badge.textContent = 'Active';
        badge.classList.add('badge-active');
      }

      node.appendChild(nameEl);
      node.appendChild(starsEl);
      if (badge.textContent) node.appendChild(badge);

      if (unlocked) {
        (function (labId) {
          node.addEventListener('click', function () {
            Audio.playUIClick();
            _currentLab = labId;
            buildLevelGrid(labId);
            showScreen('screen-levels');
          });
        })(i);
      }

      container.appendChild(node);
      (function (el) {
        requestAnimationFrame(function () { el.classList.add('stagger-in'); });
      })(node);
      staggerIndex++;
    }
  }

  // ---- Level Grid ----
  function buildLevelGrid(labId) {
    if (!labId) labId = _currentLab;
    var grid = $('levels-grid');
    grid.innerHTML = '';

    var lab = Levels.getLabMeta(labId);
    var levelIds = Levels.getLabLevels(labId);
    var highest = Storage.getHighestUnlocked();
    var labStars = Storage.getLabStars(labId);

    $('levels-location-name').textContent = lab.name;
    $('levels-star-count').innerHTML = '\u2605 ' + labStars + ' / ' + (levelIds.length * 3);

    for (var i = 0; i < levelIds.length; i++) {
      var levelId = levelIds[i];
      var cell = document.createElement('div');
      cell.className = 'level-cell';
      var stars = Storage.getStars(levelId);
      var meta = Levels.getMeta(levelId);
      var moleculeName = meta ? meta.name : '';

      if (levelId > highest) {
        cell.classList.add('locked');
        cell.innerHTML = '<span class="level-num">' + levelId + '</span>' +
          '<span class="level-molecule-name">' + moleculeName + '</span>' +
          '<span class="level-stars">\uD83D\uDD12</span>';
      } else {
        if (stars > 0) cell.classList.add('completed');
        cell.innerHTML = '<span class="level-num">' + levelId + '</span>' +
          '<span class="level-molecule-name">' + moleculeName + '</span>' +
          '<span class="level-stars">' + starString(stars, 3) + '</span>';
        cell.dataset.level = levelId;
        cell.addEventListener('click', onLevelCellClick);
      }
      grid.appendChild(cell);
    }
  }

  function onLevelCellClick(e) {
    var cell = e.currentTarget;
    var id = parseInt(cell.dataset.level);
    if (id) {
      Audio.playUIClick();
      showMoleculeInfo(id);
    }
  }

  // ---- Molecule Info Overlay (shown before level starts) ----
  function showMoleculeInfo(levelId) {
    var meta = Levels.getMeta(levelId);
    if (!meta) return;

    var info = Molecules.getInfo(meta.molecule);
    if (!info) {
      startLevel(levelId);
      return;
    }

    $('molecule-info-name').textContent = info.name;
    $('molecule-info-formula').textContent = info.formula;
    $('molecule-info-fact').textContent = info.fact;

    // Draw molecule diagram
    var diagCanvas = $('molecule-info-canvas');
    if (diagCanvas) {
      diagCanvas.width = 200;
      diagCanvas.height = 150;
      Game.drawMoleculePreview(diagCanvas, meta.molecule);
    }

    // Store pending level
    $('btn-info-start').dataset.level = levelId;
    showOverlay('overlay-molecule-info');
  }

  // ---- Start Level ----
  function startLevel(id) {
    _currentLevel = id;
    _currentLab = Levels.getLocation(id);
    var success = Game.startLevel(id);
    if (!success) return;

    showScreen('screen-game');
    Game.resizeCanvas();
    updateHUD();

    // Draw molecule preview
    var level = Game.getLevel();
    if (level) {
      var previewCanvas = $('molecule-preview');
      if (previewCanvas) {
        previewCanvas.width = 120;
        previewCanvas.height = 100;
        Game.drawMoleculePreview(previewCanvas, level.molecule);
      }

      // Unlock glossary entries
      var molInfo = Molecules.getInfo(level.molecule);
      if (molInfo) {
        Storage.unlockGlossaryItem('molecule', level.molecule);
      }
      var molAtoms = Molecules.getMoleculeAtoms(level.molecule);
      if (molAtoms) {
        var seen = {};
        for (var i = 0; i < molAtoms.length; i++) {
          if (!seen[molAtoms[i].element]) {
            seen[molAtoms[i].element] = true;
            Storage.unlockGlossaryItem('element', molAtoms[i].element);
          }
        }
      }
    }

    Audio.playLevelStart();
  }

  // ---- HUD Updates ----
  function updateHUD() {
    var state = Game.getState();
    var level = Game.getLevel();
    if (!state || !level) return;

    $('hud-level-name').textContent = 'Level ' + level.id;
    var molInfo = Molecules.getInfo(level.molecule);
    $('hud-molecule-name').textContent = molInfo ? molInfo.name : level.molecule;
    $('hud-moves').textContent = state.moves;

    // Selected atom info
    var tooltip = $('element-tooltip');
    if (tooltip && state.selectedAtom !== null && state.atoms[state.selectedAtom]) {
      var atom = state.atoms[state.selectedAtom];
      var elemData = Molecules.getElement(atom.element);
      if (elemData) {
        tooltip.innerHTML = '<strong>' + elemData.name + '</strong> (' + atom.element + ')<br>' +
          'Atomic #' + elemData.number;
        tooltip.classList.add('visible');
      }
    } else if (tooltip) {
      tooltip.classList.remove('visible');
    }
  }

  // ---- Victory ----
  function showVictory(levelId, stars, state) {
    $('victory-stars').innerHTML = starHTML(stars, 3);

    var level = Game.getLevel();
    var optimal = level ? level.optimalMoves : 0;
    var optimalStr = optimal > 0 ? optimal : '?';

    var stats = '<strong>' + I18n.t('yourMoves') + ':</strong> ' + state.moves + '<br>' +
      '<strong>' + I18n.t('optimal') + ':</strong> ' + optimalStr + '<br>' +
      '<strong>' + I18n.t('hintsUsed') + ':</strong> ' + state.hintsUsed;
    $('victory-stats').innerHTML = stats;

    // Molecule info recap
    var molInfo = Molecules.getInfo(level ? level.molecule : '');
    if (molInfo) {
      $('victory-molecule-info').innerHTML =
        '<strong>' + molInfo.name + '</strong> (' + molInfo.formula + ')<br>' +
        '<em>' + molInfo.fact + '</em>';
      $('victory-molecule-info').style.display = 'block';
    } else {
      $('victory-molecule-info').style.display = 'none';
    }

    var nextBtn = $('btn-victory-next');
    var lab = Levels.getLabMeta(_currentLab);
    if (levelId >= Levels.getCount()) {
      nextBtn.textContent = 'Finish';
    } else if (levelId >= lab.endLevel) {
      nextBtn.textContent = 'Back to Labs';
    } else {
      nextBtn.textContent = I18n.t('next');
    }

    Storage.completeLevel(levelId, stars);

    setTimeout(function () {
      showOverlay('overlay-victory');
    }, 600);
  }

  // ---- Glossary ----
  function buildGlossary() {
    var elemContainer = $('glossary-elements');
    var molContainer = $('glossary-molecules');
    if (!elemContainer || !molContainer) return;

    elemContainer.innerHTML = '';
    molContainer.innerHTML = '';

    // Elements
    var elements = ['H', 'C', 'O', 'N', 'S', 'Cl'];
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var data = Molecules.getElement(el);
      if (!data) continue;
      var unlocked = Storage.isGlossaryUnlocked('element', el);
      var card = document.createElement('div');
      card.className = 'glossary-card' + (unlocked ? '' : ' locked');
      card.style.setProperty('--elem-color', data.color);

      if (unlocked) {
        card.innerHTML =
          '<div class="glossary-symbol" style="color:' + data.color + '">' + el + '</div>' +
          '<div class="glossary-name">' + data.name + '</div>' +
          '<div class="glossary-detail">Atomic #' + data.number + '</div>' +
          '<div class="glossary-desc">' + data.uses + '</div>';
      } else {
        card.innerHTML =
          '<div class="glossary-symbol">?</div>' +
          '<div class="glossary-name">???</div>' +
          '<div class="glossary-detail">Play more levels to discover!</div>';
      }
      elemContainer.appendChild(card);
    }

    // Molecules
    var moleculeSlugs = Molecules.getSlugList();
    for (var j = 0; j < moleculeSlugs.length; j++) {
      var slug = moleculeSlugs[j];
      var info = Molecules.getInfo(slug);
      if (!info) continue;
      var mUnlocked = Storage.isGlossaryUnlocked('molecule', slug);
      var mCard = document.createElement('div');
      mCard.className = 'glossary-card' + (mUnlocked ? '' : ' locked');

      if (mUnlocked) {
        mCard.innerHTML =
          '<div class="glossary-formula">' + info.formula + '</div>' +
          '<div class="glossary-name">' + info.name + '</div>' +
          '<div class="glossary-desc">' + info.fact + '</div>';
      } else {
        mCard.innerHTML =
          '<div class="glossary-formula">???</div>' +
          '<div class="glossary-name">???</div>' +
          '<div class="glossary-detail">Play more levels to discover!</div>';
      }
      molContainer.appendChild(mCard);
    }
  }

  // ---- Toast ----
  function showToast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.classList.add('visible');
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function () {
      el.classList.remove('visible');
    }, 1800);
  }

  // ---- Event Binding ----
  function bindEvents() {
    // Title screen
    $('btn-play').addEventListener('click', function () {
      Audio.playUIClick();
      var highest = Storage.getHighestUnlocked();
      var id = Math.min(highest, Levels.getCount());
      showMoleculeInfo(id);
    });

    $('btn-lab-map').addEventListener('click', function () {
      Audio.playUIClick();
      buildLabMap();
      showScreen('screen-map');
    });

    var glossBtn = $('btn-glossary');
    if (glossBtn) {
      glossBtn.addEventListener('click', function () {
        Audio.playUIClick();
        buildGlossary();
        showOverlay('overlay-glossary');
      });
    }

    // Lab map
    $('btn-map-back').addEventListener('click', function () {
      Audio.playUIClick();
      showScreen('screen-title');
      updateTitleStars();
    });

    // Level select
    $('btn-levels-back').addEventListener('click', function () {
      Audio.playUIClick();
      buildLabMap();
      showScreen('screen-map');
    });

    // Molecule info overlay
    $('btn-info-start').addEventListener('click', function () {
      Audio.playUIClick();
      hideOverlay('overlay-molecule-info');
      var levelId = parseInt(this.dataset.level);
      if (levelId) startLevel(levelId);
    });

    // Game controls
    $('btn-undo').addEventListener('click', function () {
      Audio.playUIClick();
      Game.undo();
    });

    $('btn-restart').addEventListener('click', function () {
      Audio.playUIClick();
      Game.restart();
    });

    $('btn-menu').addEventListener('click', function () {
      Audio.playUIClick();
      Game.stopRenderLoop();
      buildLabMap();
      showScreen('screen-map');
    });

    // Hint button
    $('btn-hint').addEventListener('click', function () {
      Audio.playUIClick();
      var hint = Game.requestHint();
      if (!hint) {
        showToast(I18n.t('noHint'));
      }
    });

    // D-pad buttons
    var dpadBtns = document.querySelectorAll('.dpad-btn[data-dir]');
    for (var i = 0; i < dpadBtns.length; i++) {
      dpadBtns[i].addEventListener('click', function (e) {
        e.preventDefault();
        var dir = this.getAttribute('data-dir');
        if (dir) Game.handleDpadInput(dir);
      });
      dpadBtns[i].addEventListener('contextmenu', function (e) {
        e.preventDefault();
      });
    }

    // Victory overlay
    $('btn-victory-restart').addEventListener('click', function () {
      Audio.playUIClick();
      hideOverlay('overlay-victory');
      Game.restart();
      updateHUD();
    });

    $('btn-victory-next').addEventListener('click', function () {
      Audio.playUIClick();
      hideOverlay('overlay-victory');

      var lab = Levels.getLabMeta(_currentLab);

      if (_currentLevel >= Levels.getCount()) {
        showCampaignComplete();
      } else if (_currentLevel >= lab.endLevel) {
        buildLabMap();
        showScreen('screen-map');
      } else {
        var nextId = _currentLevel + 1;
        showMoleculeInfo(nextId);
      }
    });

    // Glossary overlay
    var glossCloseBtn = $('btn-glossary-close');
    if (glossCloseBtn) {
      glossCloseBtn.addEventListener('click', function () {
        Audio.playUIClick();
        hideOverlay('overlay-glossary');
      });
    }

    // Glossary tab switching
    var glossTabs = document.querySelectorAll('.glossary-tab');
    for (var gt = 0; gt < glossTabs.length; gt++) {
      glossTabs[gt].addEventListener('click', function () {
        Audio.playUIClick();
        var tab = this.getAttribute('data-tab');
        var tabs = document.querySelectorAll('.glossary-tab');
        for (var ti = 0; ti < tabs.length; ti++) {
          tabs[ti].classList.remove('active');
        }
        this.classList.add('active');
        var elemGrid = $('glossary-elements');
        var molGrid = $('glossary-molecules');
        if (tab === 'elements') {
          elemGrid.style.display = '';
          molGrid.style.display = 'none';
        } else {
          elemGrid.style.display = 'none';
          molGrid.style.display = '';
        }
      });
    }

    // Campaign complete
    $('btn-campaign-levels').addEventListener('click', function () {
      Audio.playUIClick();
      hideOverlay('overlay-campaign');
      buildLabMap();
      showScreen('screen-map');
    });

    $('btn-campaign-menu').addEventListener('click', function () {
      Audio.playUIClick();
      hideOverlay('overlay-campaign');
      showScreen('screen-title');
      updateTitleStars();
    });

    // Keyboard
    document.addEventListener('keydown', function (e) {
      if (_currentScreen === 'screen-game') {
        if (e.key === 'Escape') {
          Game.stopRenderLoop();
          buildLabMap();
          showScreen('screen-map');
          return;
        }
        Game.handleKeyDown(e);
      }
    });

    // Window resize
    window.addEventListener('resize', function () {
      if (_currentScreen === 'screen-game') {
        Game.resizeCanvas();
      }
    });

    // Game callbacks
    Game.onWin(function (levelId, stars, state) {
      showVictory(levelId, stars, state);
    });

    Game.onStateChange(function () {
      updateHUD();
    });
  }

  function showCampaignComplete() {
    var total = Storage.getTotalStars();
    var max = Levels.getCount() * 3;
    $('campaign-stats').innerHTML =
      '<strong>' + I18n.t('totalStars') + ':</strong> ' + total + ' / ' + max + '<br>' +
      I18n.t('campaignCompleteMsg');
    showOverlay('overlay-campaign');
  }

  function updateTitleStars() {
    var total = Storage.getTotalStars();
    var max = Levels.getCount() * 3;
    var el = $('title-total-stars');
    if (total > 0) {
      el.textContent = '\u2605 ' + total + '/' + max;
    } else {
      el.textContent = '';
    }
  }

  // ---- Public API ----
  var UI = {
    init: function () {
      bindEvents();
      updateTitleStars();
    },

    showScreen: showScreen,
    showToast: showToast,
    updateHUD: updateHUD,
    startLevel: startLevel,
    buildLevelGrid: buildLevelGrid
  };

  window.UI = UI;
})();

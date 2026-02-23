/**
 * Main - Bootstrap, lifecycle, asset loading
 */
(function () {
  'use strict';

  function boot() {
    // Init modules
    Mesa.init();
    I18n.init('en');
    Audio.init();

    var canvas = document.getElementById('game-canvas');
    Game.init(canvas);

    // Load storage then init UI
    Promise.all([
      Game.loadAssets(),
      Storage.load()
    ]).then(function () {
      // Validate levels in dev
      var issues = Levels.validate();
      if (issues.length > 0) {
        console.warn('Level validation: ' + issues.length + ' issue(s)');
        for (var vi = 0; vi < issues.length; vi++) {
          console.warn('  ' + issues[vi]);
        }
      }

      UI.init();

      // Show title screen
      UI.showScreen('screen-title');
    }).catch(function (err) {
      console.error('Boot failed:', err);
    });
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

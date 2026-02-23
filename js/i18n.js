/**
 * i18n - Internationalization module
 * Simple key-based string lookup with fallback to English
 */
(function () {
  'use strict';

  var _lang = 'en';

  var _strings = {
    en: {
      title: 'Atomix Lab',
      subtitle: 'Build Molecules, Learn Chemistry',
      play: 'Play',
      labMap: 'Lab Map',
      back: 'Back',
      level: 'Level',
      moves: 'Moves',
      undo: 'Undo',
      restart: 'Restart',
      menu: 'Menu',
      hint: 'Hint',
      next: 'Next',
      moleculeComplete: 'Molecule Complete!',
      stars: 'Stars',
      locked: 'Locked',
      completed: 'Completed',
      totalStars: 'Total Stars',
      optimal: 'Optimal',
      yourMoves: 'Your Moves',
      bestStars: 'Best',
      campaignComplete: 'All Labs Complete!',
      campaignCompleteMsg: 'You have mastered molecular assembly. You are a true chemist!',
      parMoves: 'Par',
      glossary: 'Glossary',
      moleculeInfo: 'Molecule Info',
      formula: 'Formula',
      funFact: 'Fun Fact',
      element: 'Element',
      atomicNumber: 'Atomic Number',
      selectAtom: 'Click an atom or press Tab to select',
      slideAtom: 'Use arrow keys to slide the selected atom',
      noHint: 'No hint available for this position',
      computing: 'Computing...',
      hintsUsed: 'Hints Used'
    }
  };

  var I18n = {
    init: function (lang) {
      _lang = lang || 'en';
    },

    t: function (key) {
      var dict = _strings[_lang] || _strings.en;
      return dict[key] || _strings.en[key] || key;
    },

    setLang: function (lang) {
      _lang = lang;
    },

    getLang: function () {
      return _lang;
    }
  };

  window.I18n = I18n;
})();

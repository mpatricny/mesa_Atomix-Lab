/**
 * Storage - Persistence wrapper using Mesa SDK
 */
(function () {
  'use strict';

  var SAVE_KEY = 'progress';
  var LEVEL_VERSION = 1;

  var _defaultProgress = {
    levelStars: {},
    highestUnlocked: 50,  // All levels unlocked for testing
    totalStars: 0,
    levelVersion: LEVEL_VERSION,
    glossaryUnlocked: {}
  };

  var _progress = null;

  var Storage = {
    load: function () {
      return Mesa.data.getItem(SAVE_KEY).then(function (data) {
        if (data && data.levelVersion === LEVEL_VERSION) {
          var hu = data.highestUnlocked || 1;
          // Ensure highestUnlocked covers the full lab (not mid-lab)
          for (var labId = 1; labId <= 5; labId++) {
            var meta = Levels.getLabMeta(labId);
            if (hu >= meta.startLevel && hu <= meta.endLevel) {
              hu = meta.endLevel;
              break;
            }
          }
          _progress = {
            levelStars: data.levelStars || {},
            highestUnlocked: hu,
            totalStars: data.totalStars || 0,
            levelVersion: LEVEL_VERSION,
            glossaryUnlocked: data.glossaryUnlocked || {}
          };
        } else {
          _progress = JSON.parse(JSON.stringify(_defaultProgress));
        }
        return _progress;
      });
    },

    save: function () {
      if (!_progress) return Promise.resolve();
      return Mesa.data.setItem(SAVE_KEY, _progress);
    },

    getProgress: function () {
      return _progress || JSON.parse(JSON.stringify(_defaultProgress));
    },

    completeLevel: function (levelId, stars) {
      if (!_progress) _progress = JSON.parse(JSON.stringify(_defaultProgress));

      var prev = _progress.levelStars[levelId] || 0;
      if (stars > prev) {
        _progress.levelStars[levelId] = stars;
      }

      // Unlock all levels in the current (and any newly unlocked) lab
      var nextLevel = levelId + 1;
      if (nextLevel > _progress.highestUnlocked) {
        // Find which lab the next level belongs to and unlock the whole lab
        var totalLevels = Levels.getCount();
        for (var labId = 1; labId <= 5; labId++) {
          var meta = Levels.getLabMeta(labId);
          if (nextLevel >= meta.startLevel && nextLevel <= meta.endLevel) {
            _progress.highestUnlocked = meta.endLevel;
            break;
          }
        }
        // Past last lab
        if (nextLevel > totalLevels) {
          _progress.highestUnlocked = totalLevels;
        }
      }

      // Recalculate total stars
      var total = 0;
      for (var k in _progress.levelStars) {
        total += _progress.levelStars[k];
      }
      _progress.totalStars = total;

      return Storage.save();
    },

    getStars: function (levelId) {
      if (!_progress) return 0;
      return _progress.levelStars[levelId] || 0;
    },

    getHighestUnlocked: function () {
      if (!_progress) return 1;
      return _progress.highestUnlocked;
    },

    getTotalStars: function () {
      if (!_progress) return 0;
      return _progress.totalStars;
    },

    getLabStars: function (labId) {
      if (!_progress) return 0;
      var meta = Levels.getLabMeta(labId);
      var total = 0;
      for (var i = meta.startLevel; i <= meta.endLevel; i++) {
        total += (_progress.levelStars[i] || 0);
      }
      return total;
    },

    isLabUnlocked: function (labId) {
      if (labId <= 1) return true;
      // Lab is unlocked if highestUnlocked reaches into it, or previous lab is complete
      var meta = Levels.getLabMeta(labId);
      if (Storage.getHighestUnlocked() >= meta.startLevel) return true;
      var prevMeta = Levels.getLabMeta(labId - 1);
      return Storage.getStars(prevMeta.endLevel) > 0;
    },

    isLabComplete: function (labId) {
      var meta = Levels.getLabMeta(labId);
      return Storage.getStars(meta.endLevel) > 0;
    },

    unlockGlossaryItem: function (type, id) {
      if (!_progress) _progress = JSON.parse(JSON.stringify(_defaultProgress));
      if (!_progress.glossaryUnlocked[type]) {
        _progress.glossaryUnlocked[type] = {};
      }
      _progress.glossaryUnlocked[type][id] = true;
      return Storage.save();
    },

    isGlossaryUnlocked: function (type, id) {
      if (!_progress || !_progress.glossaryUnlocked[type]) return false;
      return !!_progress.glossaryUnlocked[type][id];
    },

    reset: function () {
      _progress = JSON.parse(JSON.stringify(_defaultProgress));
      return Storage.save();
    }
  };

  window.Storage = Storage;
})();

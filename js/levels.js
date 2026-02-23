/**
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

  var W = '\u2593';
  var O = '\u00B7';

  var LEVEL_DATA = [
    // ===== LAB 1: Basics (1-10) =====
    // 1: Water (water)
    { name: "Water", molecule: "water",
      map: [
        O+O+O+O+O+O+O+O+O+O+O+O+O,
        O+W+W+W+W+W+O+O+O+O+O+O+O,
        O+W+O+O+O+W+O+O+O+O+O+O+O,
        O+W+O+O+'0'+W+W+W+W+W+W+O+O,
        O+W+O+O+W+O+O+O+O+O+W+O+O,
        O+W+O+W+O+O+O+O+O+O+W+W+O,
        O+W+O+W+O+O+O+O+W+W+O+W+O,
        O+W+O+O+O+O+W+O+W+'0'+O+W+O,
        O+W+W+W+'0'+W+O+O+W+O+O+W+O,
        O+O+W+O+O+O+O+O+O+O+O+W+O,
        O+O+W+W+W+W+W+W+W+W+W+W+O,
        O+O+O+O+O+O+O+O+O+O+O+O+O,
        O+O+O+O+O+O+O+O+O+O+O+O+O
      ],
      atomIds: ['H\u2190', 'O\u2190\u2192', 'H\u2192'],
      optimalMoves: 12, location: 1 },

    // 2: Carbon Dioxide (carbon-dioxide)
    { name: "Carbon Dioxide", molecule: "carbon-dioxide",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+'0'+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+W+W+W+W+W+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+'0'+O+O+O+W,
        W+W+W+W+W+O+O+O+O+O+O+O+W,
        O+O+O+O+O+W+O+O+O+O+W+O+W,
        O+O+O+O+O+W+O+O+O+O+W+O+W,
        O+O+O+O+O+W+O+O+O+O+W+O+W,
        O+O+O+O+O+W+'0'+O+O+O+W+O+W,
        O+O+O+O+O+W+W+W+W+W+W+W+W
      ],
      atomIds: ['O\u21c9', 'O\u21c7', 'C\u21c7\u21c9'],
      optimalMoves: 6, location: 1 },

    // 3: Hydrogen Sulfide (hydrogen-sulfide)
    { name: "Hydrogen Sulfide", molecule: "hydrogen-sulfide",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+W+W+W+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+'0'+'0'+O+O+O+O+W+O+'0'+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+W+O+O+O+O+O+O+W,
        W+O+O+O+O+W+W+O+O+O+O+O+W,
        W+O+O+O+O+W+O+O+O+O+O+O+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['H\u2192', 'S\u2190\u2192', 'H\u2190'],
      optimalMoves: 5, location: 1 },

    // 4: Ammonia (ammonia)
    { name: "Ammonia", molecule: "ammonia",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+'0'+O+O+O+'0'+'0'+W+W+W+O+W,
        W+O+W+O+O+O+O+O+W+O+O+O+W,
        W+O+O+'0'+O+O+O+O+O+O+O+O+W,
        W+O+W+W+W+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+W+O+O+W+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+W+W+W+W+W+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['H\u2192', 'N\u2190\u2191\u2192', 'H\u2190', 'H\u2193'],
      optimalMoves: 4, location: 1 },

    // 5: Hydrogen Peroxide (hydrogen-peroxide)
    { name: "Hydrogen Peroxide", molecule: "hydrogen-peroxide",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+W+W+W+O+W,
        W+O+O+O+O+W+W+W+O+O+O+O+W,
        W+O+O+O+O+O+O+O+'0'+O+O+O+W,
        W+O+O+O+O+O+O+O+'0'+O+O+O+W,
        W+O+O+O+W+W+O+O+O+O+W+O+W,
        W+O+O+W+O+W+'0'+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+W+O+O+O+W,
        W+O+O+O+O+W+O+O+O+O+'0'+O+W,
        W+O+O+O+O+W+O+O+O+O+O+O+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['H\u2192', 'H\u2190', 'O\u2190\u2192', 'O\u2190\u2192'],
      optimalMoves: 5, location: 1 },

    // 6: Methane (methane)
    { name: "Methane", molecule: "methane",
      map: [
        O+O+O+O+O+O+O+O+O+O+O+O+O,
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+W+O+O+W+O+O+O+O+W,
        W+O+W+O+O+W+'0'+W+O+O+O+O+W,
        W+O+O+W+O+O+O+W+'0'+O+W+O+W,
        W+O+O+O+O+O+O+W+W+W+W+O+W,
        W+O+O+O+O+O+O+O+W+'0'+W+O+W,
        W+O+'0'+O+O+W+O+O+W+O+O+O+W,
        W+O+W+W+W+W+W+O+O+O+O+W+W,
        W+O+'0'+O+W+O+O+W+O+O+O+W+O,
        W+W+W+W+W+O+O+W+O+O+O+W+O,
        O+O+O+O+O+O+O+W+W+W+W+W+O,
        O+O+O+O+O+O+O+O+O+O+O+O+O
      ],
      atomIds: ['H\u2190', 'C\u2190\u2191\u2192\u2193', 'H\u2192', 'H\u2193', 'H\u2191'],
      optimalMoves: 0, location: 1 },

    // 7: Nitrous Oxide (nitrous-oxide)
    { name: "Nitrous Oxide", molecule: "nitrous-oxide",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+W+O+O+O+O+O+W,
        W+O+O+W+W+W+W+W+O+O+O+O+W,
        W+O+'0'+W+O+O+O+O+O+O+'0'+O+W,
        W+O+O+'0'+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+O+W+W+W+W,
        W+O+O+W+O+O+O+O+O+O+O+O+W,
        W+O+O+W+O+O+O+O+O+O+O+O+W,
        W+O+W+W+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['N\u21c9', 'O\u21c7', 'N\u21c7\u21c9'],
      optimalMoves: 5, location: 1 },

    // 8: Methanal (methanal)
    { name: "Methanal", molecule: "methanal",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+'0'+O+O+O+O+W+O+O+O+O+'0'+W,
        W+O+O+W+W+O+W+O+W+W+O+O+W,
        W+W+O+W+O+O+O+O+O+W+O+W+W,
        W+O+O+W+O+O+O+O+O+W+O+O+W,
        W+O+W+W+O+O+W+O+O+W+W+O+W,
        W+O+O+O+O+W+W+W+O+O+O+O+W,
        W+O+W+W+O+O+W+O+O+W+W+O+W,
        W+O+O+W+O+O+O+O+O+W+O+O+W,
        W+W+O+W+O+O+O+O+O+W+O+W+W,
        W+O+O+W+W+O+W+O+W+W+O+O+W,
        W+'0'+O+O+O+O+W+O+O+O+O+'0'+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['O\u21C7', 'C\u2191\u2193\u21C9', 'H\u2191', 'H\u2193'],
      optimalMoves: 18, location: 1 },

    // 9: Methanol (methanol)
    { name: "Methanol", molecule: "methanol",
      map: [
        O+O+O+O+O+O+O+O+O+W+W+W+W,
        W+W+W+W+O+O+O+O+O+W+O+O+W,
        W+O+O+W+O+O+O+O+O+W+O+O+W,
        W+O+O+W+W+O+O+O+W+W+O+'0'+W,
        W+O+O+'0'+W+W+W+W+W+O+O+O+W,
        W+O+W+O+W+O+'0'+W+O+O+O+O+W,
        W+O+O+O+O+O+O+W+O+'0'+O+O+W,
        W+O+O+W+O+W+O+O+O+W+O+O+W,
        W+'0'+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+W+O+W+O+O+O+W+O+W,
        W+W+W+W+W+W+'0'+O+O+O+W+O+W,
        O+O+O+O+O+W+W+W+W+W+W+W+W,
        O+O+O+O+O+O+O+O+O+O+O+O+O
      ],
      atomIds: ['O\u2190\u2192', 'H\u2191', 'C\u2190\u2191\u2192\u2193', 'H\u2190', 'H\u2193', 'H\u2192'],
      optimalMoves: 17, location: 1 },

    // 10: Phosphoric Acid (phosphoric-acid)
    { name: "Phosphoric Acid", molecule: "phosphoric-acid",
      map: [
        O+O+O+W+W+W+W+W+W+W+O+O+O,
        O+O+O+W+O+O+O+'0'+O+W+O+O+O,
        O+O+O+W+O+O+W+O+O+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        W+W+W+O+O+O+O+O+O+O+W+W+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+O+'0'+O+O+W,
        W+'0'+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+W+O+W+O+O+O+W,
        W+O+O+O+O+O+O+O+O+'0'+O+O+W,
        W+'0'+O+O+O+'0'+O+O+O+O+'0'+'0'+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['O\u21ca', 'O\u2191\u2193', 'P\u2190\u2192\u2193\u21c8', 'H\u2191', 'H\u2190', 'O\u2190\u2192', 'O\u2190\u2192', 'H\u2192'],
      optimalMoves: 12, location: 1 },

    // ===== LAB 2: Organic Chemistry (11-20) =====
    // 11: Ethylene (ethylene)
    { name: "Ethylene", molecule: "ethylene",
      map: [
        O+O+O+O+O+O+O+O+O+O+O+O+O,
        O+W+W+W+O+O+O+O+O+W+W+W+O,
        O+W+O+W+O+O+O+O+O+W+O+W+O,
        O+W+'0'+W+W+W+W+W+W+W+O+W+O,
        O+W+O+O+O+O+O+O+W+O+O+W+O,
        O+W+W+O+O+'0'+O+W+O+O+O+W+O,
        O+W+O+W+O+O+O+O+'0'+W+'0'+W+O,
        O+W+O+O+O+W+O+O+O+O+W+W+O,
        O+W+O+O+W+O+O+O+O+'0'+'0'+W+O,
        O+W+O+W+W+W+W+W+W+W+O+W+O,
        O+W+O+W+O+O+O+O+O+W+O+W+O,
        O+W+W+W+O+O+O+O+O+W+W+W+O,
        O+O+O+O+O+O+O+O+O+O+O+O+O
      ],
      atomIds: ['H\u2197', 'C\u2197\u2198\u21C7', 'H\u2199', 'C\u2196\u2199\u21C9', 'H\u2196', 'H\u2198'],
      optimalMoves: 0, location: 2 },

    // 12: Formic Acid (formic-acid)
    { name: "Formic Acid", molecule: "formic-acid",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+W+O+O+O+'0'+'0'+O+'0'+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+'0'+O+O+O+O+O+W+W+W+O+W,
        W+O+'0'+O+O+O+O+W+O+W+O+O+W,
        W+O+O+O+W+W+W+W+O+O+O+O+W,
        W+O+W+W+W+W+O+W+O+O+O+O+W,
        W+O+O+W+O+O+O+W+O+O+O+O+W,
        W+O+O+O+O+O+O+W+O+O+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['H\u2192', 'O\u2190\u2192', 'H\u2190', 'O\u21ca', 'C\u2190\u21c8\u2192'],
      optimalMoves: 11, location: 2 },

    // 13: Vinyl Chloride (vinyl-chloride)
    { name: "Vinyl Chloride", molecule: "vinyl-chloride",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+W+W+W+W+W+O+O+O+W,
        W+O+O+O+W+W+W+O+O+O+O+'0'+W,
        W+O+O+O+O+'0'+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+W+W+O+O+O+O+O+'0'+O+W+W+W,
        O+O+O+W+O+'0'+O+O+O+W+O+O+O,
        O+O+O+W+W+O+O+'0'+W+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+O+'0'+O+O+O+W+O+O+O,
        O+O+O+W+W+W+W+W+W+W+O+O+O
      ],
      atomIds: ['C\u2197\u2198\u21c7', 'H\u2198', '\u20b5\u2199', 'C\u2196\u2199\u21c9', 'H\u2196', 'H\u2197'],
      optimalMoves: 13, location: 2 },

    // 14: Ethane (ethane)
    { name: "Ethane", molecule: "ethane",
      map: [
        O+O+O+O+O+O+O+O+O+O+O+O+O,
        O+O+O+W+W+W+W+W+W+W+W+W+O,
        O+O+O+W+O+O+O+O+'0'+O+O+W+O,
        O+O+O+W+O+O+W+O+W+O+O+W+O,
        O+O+O+W+'0'+O+'0'+O+W+W+W+W+O,
        O+W+W+W+W+W+'0'+O+W+'0'+W+O+O,
        O+W+O+O+O+W+O+O+O+O+W+O+O,
        O+W+O+O+O+O+O+O+O+O+W+O+O,
        O+W+O+'0'+O+W+W+W+'0'+O+W+W+O,
        O+W+W+W+'0'+O+O+O+W+O+O+W+O,
        O+W+O+O+O+O+O+O+O+O+O+W+O,
        O+W+W+W+W+W+W+W+W+W+W+W+O,
        O+O+O+O+O+O+O+O+O+O+O+O+O
      ],
      atomIds: ['H\u2197', 'H\u2193', 'C\u2191\u2193\u2198\u2199', 'C\u2191\u2193\u2196\u2197', 'H\u2198', 'H\u2191', 'H\u2196', 'H\u2199'],
      optimalMoves: 0, location: 2 },

    // 15: Ethanol (ethanol)
    { name: "Ethanol", molecule: "ethanol",
      map: [
        O+O+O+O+O+W+W+W+W+W+O+O+O,
        O+O+O+O+O+W+'0'+'0'+O+W+O+O+O,
        O+W+W+W+W+W+O+W+O+W+O+O+O,
        O+W+O+O+O+O+O+O+'0'+W+O+O+O,
        O+W+W+W+'0'+O+O+O+W+W+O+O+O,
        O+O+O+W+O+W+'0'+W+O+W+W+W+O,
        O+O+O+W+W+'0'+O+O+O+W+O+W+O,
        W+W+W+W+O+'0'+O+O+O+O+O+W+O,
        W+O+'0'+O+O+O+O+W+O+O+O+W+O,
        W+W+W+W+W+O+W+O+O+W+O+W+O,
        O+O+O+W+O+O+O+O+W+O+'0'+W+O,
        O+O+O+W+W+W+W+W+W+W+W+W+O,
        O+O+O+O+O+O+O+O+O+O+O+O+O
      ],
      atomIds: ['H\u2191', 'C\u2190\u2191\u2192\u2193', 'H\u2191', 'H\u2193', 'H\u2192', 'H\u2193', 'C\u2190\u2191\u2192\u2193', 'O\u2190\u2192', 'H\u2190'],
      optimalMoves: 0, location: 2 },

    // 16: Dimethyl Ether (dimethyl-ether)
    { name: "Dimethyl Ether", molecule: "dimethyl-ether",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+'0'+O+W+'0'+O+O+O+'0'+W,
        W+O+W+W+W+O+W+O+W+W+W+O+W,
        W+O+W+O+O+'0'+W+O+O+O+W+O+W,
        W+O+W+O+O+O+W+O+O+O+W+O+W,
        W+O+O+O+O+O+W+O+O+O+O+O+W,
        W+W+W+W+'0'+O+O+O+O+W+W+W+W,
        W+O+O+O+O+O+W+O+O+O+O+O+W,
        W+O+W+O+O+O+W+O+O+O+W+O+W,
        W+O+W+O+O+'0'+W+O+O+'0'+W+O+W,
        W+O+W+W+W+O+W+O+O+W+W+'0'+W,
        W+O+O+O+O+'0'+W+O+O+O+O+O+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['C\u2190\u2191\u2192\u2193', 'O\u2190\u2192', 'H\u2192', 'H\u2191', 'H\u2193', 'H\u2190', 'H\u2191', 'H\u2193', 'C\u2190\u2191\u2192\u2193'],
      optimalMoves: 0, location: 2 },

    // 17: Acetic Acid (acetic-acid)
    { name: "Acetic Acid", molecule: "acetic-acid",
      map: [
        O+O+O+O+O+O+O+O+O+O+O+O+O,
        O+W+W+W+W+W+W+W+W+W+W+W+O,
        O+W+O+O+O+W+O+O+O+W+O+W+O,
        O+W+O+'0'+O+O+O+O+O+O+O+W+O,
        O+W+O+W+O+O+'0'+W+O+'0'+O+W+O,
        O+W+'0'+O+'0'+O+O+O+O+O+O+W+O,
        O+W+O+O+O+W+O+O+O+W+O+W+O,
        O+W+O+O+O+O+O+O+O+O+O+W+O,
        O+W+O+W+O+'0'+O+W+O+O+O+W+O,
        O+W+'0'+O+O+O+O+O+'0'+O+O+W+O,
        O+W+O+O+O+W+O+O+O+W+O+W+O,
        O+W+W+W+W+W+W+W+W+W+W+W+O,
        O+O+O+O+O+O+O+O+O+O+O+O+O
      ],
      atomIds: ['O\u2190\u2192', 'H\u2190', 'H\u2192', 'H\u2191', 'C\u2190\u2191\u2192\u2193', 'C\u2190\u2192\u21C8', 'O\u21CA', 'H\u2193'],
      optimalMoves: 0, location: 2 },

    // 18: Ethylene Glycol (ethylene-glycol)
    { name: "Ethylene Glycol", molecule: "ethylene-glycol",
      map: [
        O+O+O+W+W+W+W+W+W+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        W+W+W+O+'0'+O+O+W+W+W+W+W+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+'0'+O+O+O+O+O+O+'0'+O+O+W,
        W+O+O+O+O+O+'0'+O+'0'+O+O+'0'+W,
        W+O+O+'0'+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+W+W+W+W+O+'0'+'0'+W,
        W+O+O+O+O+O+O+O+O+'0'+O+O+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['H\u2192', 'H\u2193', 'H\u2193', 'O\u2190\u2192', 'C\u2190\u2191\u2192\u2193', 'H\u2190', 'H\u2191', 'H\u2191', 'C\u2190\u2191\u2192\u2193', 'O\u2190\u2192'],
      optimalMoves: 13, location: 2 },

    // 19: Propane (propane)
    { name: "Propane", molecule: "propane",
      map: [
        O+O+O+W+W+W+W+W+W+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        W+W+W+O+O+W+O+O+O+O+W+W+W,
        W+O+O+'0'+O+W+O+O+O+O+O+O+W,
        W+O+'0'+O+O+W+O+O+O+O+O+O+W,
        W+O+O+W+W+W+W+W+O+O+O+O+W,
        W+O+O+'0'+O+'0'+O+W+W+W+W+W+W,
        W+'0'+O+O+O+O+'0'+O+'0'+O+O+'0'+W,
        W+O+O+'0'+O+O+O+O+'0'+O+O+'0'+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['H\u2193', 'H\u2193', 'C\u2190\u2191\u2192\u2193', 'H\u2193', 'H\u2192', 'C\u2190\u2191\u2192\u2193', 'H\u2190', 'H\u2191', 'H\u2191', 'C\u2190\u2191\u2192\u2193', 'H\u2191'],
      optimalMoves: 13, location: 2 },

    // 20: Isopropanol (isopropanol)
    { name: "Isopropanol", molecule: "isopropanol",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+W+O+O+O+O+O+'0'+O+'0'+O+W,
        W+O+W+O+W+W+W+W+O+O+O+O+W,
        W+O+W+O+W+W+W+W+O+O+O+O+W,
        W+O+W+O+O+O+O+O+O+O+O+O+W,
        W+O+W+O+'0'+O+W+W+W+W+W+W+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+'0'+O+O+'0'+O+W,
        W+O+'0'+O+'0'+O+O+O+O+O+O+O+W,
        W+O+O+'0'+O+O+'0'+O+O+O+'0'+'0'+W,
        W+O+O+O+'0'+O+O+O+O+O+O+O+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['H\u2193', 'C\u2190\u2191\u2192\u2193', 'H\u2193', 'H\u2193', 'H\u2190', 'H\u2192', 'C\u2190\u2191\u2192\u2193', 'H\u2191', 'O\u2191\u2193', 'C\u2190\u2191\u2192\u2193', 'H\u2191', 'H\u2191'],
      optimalMoves: 13, location: 2 },

    // ===== LAB 3: Functional Groups (21-30) =====
    // 21: Methylamine (methylamine)
    { name: "Methylamine", molecule: "methylamine",
      map: [
        O+O+O+W+W+W+W+W+W+W+O+O+O,
        O+O+W+O+O+O+O+O+O+O+W+O+O,
        O+W+O+O+W+W+W+W+W+W+O+W+O,
        W+O+O+O+O+O+O+O+'0'+W+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+'0'+W,
        W+O+O+O+O+O+W+W+W+W+W+O+W,
        W+O+O+W+O+O+O+O+O+O+W+W+W,
        W+O+O+W+O+O+W+W+O+O+O+O+W,
        W+'0'+'0'+W+O+O+O+O+O+O+O+O+W,
        W+'0'+O+W+O+O+O+O+O+O+O+O+W,
        O+W+'0'+W+O+O+O+O+O+O+O+W+O,
        O+O+W+O+'0'+O+O+O+O+O+W+O+O,
        O+O+O+W+W+W+W+W+W+W+O+O+O
      ],
      atomIds: ['N\u2190\u2192\u2193', 'H\u2191', 'H\u2192', 'H\u2193', 'C\u2190\u2191\u2192\u2193', 'H\u2191', 'H\u2190'],
      optimalMoves: 8, location: 3 },

    // 22: Urea (urea)
    { name: "Urea", molecule: "urea",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+O+O+O+O+O+'0'+O+O+W,
        W+O+'0'+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+'0'+O+W+W+O+'0'+O+O+W,
        W+O+'0'+O+O+O+O+O+O+O+O+'0'+W,
        W+O+O+O+O+W+W+W+O+O+O+O+W,
        W+W+W+O+O+O+O+O+O+O+W+W+W,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+O+O+O+O+W+W+O+O+O,
        O+O+O+W+O+O+'0'+'0'+W+W+O+O+O,
        O+O+O+W+O+O+O+O+W+W+O+O+O,
        O+O+O+W+W+W+W+W+W+W+O+O+O
      ],
      atomIds: ['C\u2190\u2192\u21ca', 'H\u2193', 'H\u2193', 'N\u2190\u2191\u2192', 'H\u2192', 'H\u2190', 'O\u21c8', 'N\u2190\u2191\u2192'],
      optimalMoves: 16, location: 3 },

    // 23: Nitromethane (nitromethane)
    { name: "Nitromethane", molecule: "nitromethane",
      map: [
        O+O+O+W+W+W+W+W+W+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+O+O+'0'+W+O+W+O+O+O,
        W+W+W+O+O+O+O+'0'+W+O+W+W+W,
        W+'0'+W+O+W+W+O+O+W+O+'0'+'0'+W,
        W+'0'+O+'0'+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+W+W+W+W+W+O+W,
        W+O+O+O+O+O+O+W+O+O+O+O+W,
        W+W+W+O+O+O+W+O+O+O+W+W+W,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+W+W+W+W+W+W+O+O+O
      ],
      atomIds: ['H\u2192', 'H\u2191', 'H\u2193', 'O\u2190', 'C\u2190\u2191\u2192\u2193', 'O\u21ca', 'N\u2190\u2192\u21c8'],
      optimalMoves: 0, location: 3 },

    // 24: Ethanal (ethanal)
    { name: "Ethanal", molecule: "ethanal",
      map: [
        O+O+O+O+O+O+O+O+O+O+O+O+O,
        O+O+O+O+O+O+O+O+O+O+O+O+O,
        O+O+O+O+O+O+O+O+O+O+O+O+O,
        W+W+W+W+W+O+O+O+W+W+W+W+W,
        W+O+O+O+W+O+O+O+W+O+O+O+W,
        W+O+O+O+O+W+W+W+O+O+W+O+W,
        W+O+O+O+O+O+'0'+'0'+'0'+W+W+O+W,
        W+O+O+O+O+W+W+W+O+W+W+O+W,
        W+'0'+'0'+O+W+O+O+O+W+W+W+O+W,
        W+'0'+'0'+O+W+O+O+O+W+O+O+O+W,
        W+W+W+W+W+O+O+O+W+W+W+W+W,
        O+O+O+O+O+O+O+O+O+O+O+O+O,
        O+O+O+O+O+O+O+O+O+O+O+O+O
      ],
      atomIds: ['H\u2193', 'H\u2193', 'C\u2190\u2191\u2192\u2193', 'H\u2192', 'C\u2190\u2191\u21c9', 'H\u2191', 'O\u21c7'],
      optimalMoves: 13, location: 3 },

    // 25: Acetone (acetone)
    { name: "Acetone", molecule: "acetone",
      map: [
        O+O+O+W+W+W+W+W+W+W+W+W+W,
        O+W+W+W+O+O+W+W+O+O+O+O+W,
        W+W+O+O+O+O+O+W+O+W+O+O+W,
        W+O+O+O+O+O+'0'+W+O+W+W+W+W,
        W+O+W+'0'+W+O+'0'+O+'0'+O+O+'0'+W,
        W+O+W+'0'+W+W+W+O+O+'0'+O+O+W,
        W+W+W+O+O+'0'+O+O+O+O+W+W+W,
        W+O+O+O+O+O+W+W+W+O+W+O+W,
        W+O+O+O+O+O+'0'+O+W+O+W+O+W,
        W+W+W+W+O+W+O+O+O+O+O+'0'+W,
        W+O+O+W+O+W+O+O+O+O+O+W+W,
        W+O+O+O+O+W+W+O+O+W+W+W+O,
        W+W+W+W+W+W+W+W+W+W+O+O+O
      ],
      atomIds: ['O\u21C8', 'C\u2190\u2191\u2192\u2193', 'H\u2191', 'C\u2190\u2192\u21CA', 'H\u2193', 'H\u2191', 'H\u2192', 'H\u2193', 'C\u2190\u2191\u2192\u2193', 'H\u2190'],
      optimalMoves: 0, location: 3 },

    // 26: Glycine (glycine)
    { name: "Glycine", molecule: "glycine",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+W+W+W+W+O+O+O+W,
        W+O+O+O+O+W+O+W+W+W+O+O+W,
        W+O+O+O+O+W+O+O+O+O+O+O+W,
        W+O+'0'+O+'0'+O+O+O+O+'0'+O+O+W,
        W+O+O+O+O+'0'+O+O+O+O+O+O+W,
        W+W+W+O+O+'0'+O+O+O+'0'+W+W+W,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+O+W+O+O+O+W+O+O+O,
        O+O+O+W+O+'0'+O+O+O+W+O+O+O,
        O+O+O+W+'0'+'0'+O+'0'+O+W+O+O+O,
        O+O+O+W+W+W+W+W+W+W+O+O+O
      ],
      atomIds: ['H\u2191', 'H\u2192', 'H\u2190', 'N\u2190\u2192\u2193', 'C\u2190\u2191\u2192\u2193', 'H\u2191', 'O\u21ca', 'H\u2193', 'C\u2190\u2192\u21c8', 'O\u2190\u2192'],
      optimalMoves: 0, location: 3 },

    // 27: Dimethyl Sulfoxide (dimethyl-sulfoxide)
    { name: "Dimethyl Sulfoxide", molecule: "dimethyl-sulfoxide",
      map: [
        O+O+O+W+W+W+W+W+W+W+O+O+O,
        O+O+O+W+O+'0'+O+'0'+O+W+O+O+O,
        O+O+O+W+O+O+W+'0'+W+W+O+O+O,
        O+O+O+W+O+'0'+W+O+W+W+O+O+O,
        O+O+O+W+O+O+O+W+W+W+O+O+O,
        W+W+W+O+O+O+O+W+W+O+W+W+W,
        W+O+'0'+O+O+O+O+W+O+O+O+O+W,
        W+O+O+O+O+'0'+O+W+O+O+O+O+W,
        W+O+'0'+O+'0'+O+O+W+O+O+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+'0'+O+O+O+O+O+O+'0'+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['C\u2190\u2191\u2192\u2193', 'S\u2190\u2192\u21ca', 'H\u2193', 'H\u2193', 'H\u2192', 'H\u2190', 'C\u2190\u2191\u2192\u2193', 'H\u2191', 'H\u2191', 'O\u21c8'],
      optimalMoves: 0, location: 3 },

    // 28: Alanine (alanine)
    { name: "Alanine", molecule: "alanine",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+W+W+W+W+W+O+O+O+O+W,
        W+O+W+O+O+O+'0'+'0'+O+O+O+'0'+W,
        W+O+W+O+O+'0'+O+O+'0'+O+O+'0'+W,
        W+O+W+O+'0'+O+O+O+O+O+O+O+W,
        W+O+W+'0'+O+O+O+O+'0'+O+O+O+W,
        W+O+O+O+O+W+O+'0'+O+O+O+O+W,
        W+O+O+O+O+W+W+W+W+W+O+O+W,
        W+O+O+O+O+W+O+O+O+O+O+O+W,
        W+O+O+'0'+O+W+O+O+O+O+O+'0'+W,
        W+O+O+O+'0'+O+O+O+O+O+O+O+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['C\u2190\u2191\u2192\u2193', 'H\u2193', 'O\u21ca', 'H\u2192', 'C\u2190\u2192\u21c8', 'O\u2190\u2192', 'H\u2191', 'H\u2191', 'H\u2190', 'N\u2191\u2192\u2193', 'H\u2193', 'H\u2190', 'C\u2190\u2191\u2192\u2193'],
      optimalMoves: 14, location: 3 },

    // 29: Cysteine (cysteine)
    { name: "Cysteine", molecule: "cysteine",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+W+W+W+W+W+O+O+W,
        W+'0'+O+O+O+'0'+O+W+W+W+W+W+W,
        W+O+'0'+'0'+O+O+O+'0'+'0'+O+O+O+W,
        W+O+O+O+O+O+O+W+W+W+W+W+W,
        W+O+O+O+O+'0'+O+W+O+O+O+O+W,
        W+O+O+O+O+O+O+W+O+O+O+O+W,
        W+O+O+O+O+O+O+W+O+O+O+O+W,
        W+'0'+O+O+O+O+O+W+O+O+O+O+W,
        W+O+O+O+'0'+O+O+O+O+O+'0'+'0'+W,
        W+O+O+O+'0'+O+O+O+O+O+'0'+'0'+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['H\u2193', 'H\u2193', 'H\u2192', 'S\u2190\u2192', 'O\u2190\u2192', 'H\u2190', 'C\u2190\u2192\u21c8', 'O\u21ca', 'C\u2190\u2191\u2192\u2193', 'C\u2190\u2191\u2192\u2193', 'H\u2190', 'H\u2191', 'N\u2191\u2192\u2193', 'H\u2191'],
      optimalMoves: 15, location: 3 },

    // 30: Propylene (propylene)
    { name: "Propylene", molecule: "propylene",
      map: [
        O+O+O+W+W+W+W+W+W+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        W+W+W+O+O+O+O+O+O+'0'+W+W+W,
        W+O+O+O+'0'+O+'0'+O+O+W+W+O+W,
        W+O+'0'+O+O+O+O+O+O+O+O+'0'+W,
        W+O+O+O+O+W+O+O+O+O+O+O+W,
        W+O+W+W+W+W+O+O+O+'0'+O+O+W,
        W+O+O+O+W+W+O+O+W+W+O+'0'+W,
        W+'0'+O+O+O+W+O+O+O+O+'0'+O+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['H\u2191', 'H\u2193', 'H\u2199', 'H\u2192', 'C\u2197\u2198\u21c7', 'C\u2190\u2191\u2192\u2193', 'H\u2196', 'H\u2193', 'C\u2190\u2191\u21c9'],
      optimalMoves: 11, location: 3 },

    // ===== LAB 4: Complex Molecules (31-40) =====
    // 31: Acrolein (acrolein)
    { name: "Acrolein", molecule: "acrolein",
      map: [
        O+O+O+W+W+W+W+W+W+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+O+W+W+W+O+W+O+O+O,
        O+O+O+W+O+W+'0'+W+O+W+O+O+O,
        O+O+O+W+O+W+'0'+W+O+W+O+O+O,
        W+W+W+O+O+W+O+O+O+O+W+W+W,
        W+O+O+O+O+W+W+W+W+O+O+O+W,
        W+O+O+O+O+W+O+O+O+O+'0'+O+W,
        W+O+O+O+O+W+O+'0'+O+O+O+O+W,
        W+O+O+O+O+W+O+O+O+O+O+O+W,
        W+O+O+O+O+W+'0'+O+'0'+O+'0'+'0'+W,
        W+O+O+O+O+W+O+O+O+O+O+O+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['O\u21ca', 'H\u2191', 'C\u2190\u2193\u21c8', 'H\u2198', 'C\u2196\u2199\u21c9', 'H\u2193', 'H\u2197', 'C\u2191\u2192\u21c7'],
      optimalMoves: 0, location: 4 },

    // 32: Propanal (propanal)
    { name: "Propanal", molecule: "propanal",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+O+O+O+'0'+O+O+'0'+O+W,
        W+O+'0'+O+O+O+O+O+O+O+'0'+O+W,
        W+O+O+O+O+O+W+O+W+W+'0'+'0'+W,
        W+O+O+O+O+O+W+O+O+O+O+O+W,
        W+O+W+W+W+O+W+O+'0'+O+'0'+O+W,
        W+O+O+O+O+'0'+O+O+O+O+O+O+W,
        W+W+W+O+W+O+O+O+O+O+W+W+W,
        O+O+O+W+W+O+O+O+'0'+W+O+O+O,
        O+O+O+W+W+O+W+W+W+W+O+O+O,
        O+O+O+W+W+O+O+O+O+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+W+W+W+W+W+W+O+O+O
      ],
      atomIds: ['H\u2193', 'C\u2190\u2192\u2193\u21ca', 'H\u2191', 'C\u2190\u2191\u2192\u2193', 'O\u21c8', 'H\u2192', 'H\u2193', 'H\u2190', 'H\u2191', 'C\u2190\u2191\u2192\u2193'],
      optimalMoves: 0, location: 4 },

    // 33: Pyruvic Acid (pyruvic-acid)
    { name: "Pyruvic Acid", molecule: "pyruvic-acid",
      map: [
        O+O+O+W+W+W+W+W+W+W+O+O+O,
        O+O+O+W+O+'0'+O+O+O+W+O+O+O,
        O+O+O+W+'0'+O+W+O+O+W+O+O+O,
        W+W+W+O+O+O+W+O+O+O+W+W+W,
        W+O+O+W+O+O+W+O+O+O+O+'0'+W,
        W+O+O+'0'+O+O+O+O+O+O+O+'0'+W,
        W+O+W+O+O+O+W+W+W+W+W+O+W,
        W+'0'+'0'+O+O+O+'0'+O+'0'+O+O+O+W,
        W+O+O+O+'0'+O+O+O+O+O+O+O+W,
        W+W+W+O+O+O+W+W+W+W+W+W+W,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+W+W+W+W+W+W+O+O+O
      ],
      atomIds: ['H\u2193', 'C\u2190\u2191\u2192\u2193', 'H\u2190', 'H\u2191', 'C\u2190\u2192\u21c8', 'O\u21ca', 'O\u21ca', 'C\u2190\u2192\u21c8', 'O\u2190\u2192', 'H\u2192'],
      optimalMoves: 13, location: 4 },

    // 34: Oxetane (oxetane)
    { name: "Oxetane", molecule: "oxetane",
      map: [
        O+O+O+W+W+W+W+W+W+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+O+O+O+'0'+O+W+O+O+O,
        O+O+O+W+W+W+O+'0'+O+W+O+O+O,
        O+O+O+W+O+W+O+O+O+W+O+O+O,
        W+W+W+O+O+O+O+'0'+O+O+W+W+W,
        W+O+O+'0'+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+W+O+'0'+O+W,
        W+O+W+W+O+O+O+O+W+O+W+'0'+W,
        W+O+O+O+O+'0'+O+O+W+O+O+O+W,
        W+'0'+O+'0'+O+O+W+W+W+W+W+W+W,
        W+O+O+O+O+'0'+O+O+O+O+O+O+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['H\u2190', 'H\u2193', 'C\u2190\u2191\u2192\u2193', 'H\u2191', 'H\u2192', 'H\u2190', 'O\u2192\u2193', 'H\u2191', 'C\u2190\u2191\u2192\u2193', 'C\u2190\u2191\u2192\u2193'],
      optimalMoves: 0, location: 4 },

    // 35: Cyclobutane (cyclobutane)
    { name: "Cyclobutane", molecule: "cyclobutane",
      map: [
        O+O+O+O+O+O+O+O+O+O+O+O+O,
        O+W+W+W+W+W+W+W+W+O+O+O+O,
        O+W+O+O+O+'0'+O+O+W+W+O+O+O,
        O+W+W+'0'+O+W+W+O+'0'+W+W+W+O,
        O+O+W+W+O+'0'+O+O+O+O+O+W+O,
        O+O+O+W+O+W+O+O+O+O+O+W+O,
        O+O+W+W+'0'+W+W+O+O+W+'0'+W+O,
        O+O+W+O+O+O+'0'+W+'0'+W+W+W+O,
        O+O+W+O+O+O+O+O+O+W+O+W+O,
        O+O+W+'0'+O+O+O+'0'+O+O+'0'+W+O,
        O+O+W+'0'+O+W+O+W+W+W+O+W+O,
        O+O+W+W+W+W+W+W+O+W+W+W+O,
        O+O+O+O+O+O+O+O+O+O+O+O+O
      ],
      atomIds: ['H\u2192', 'H\u2190', 'H\u2191', 'C\u2190\u2191\u2192\u2193', 'H\u2192', 'C\u2190\u2191\u2192\u2193', 'H\u2190', 'H\u2193', 'C\u2190\u2191\u2192\u2193', 'C\u2190\u2191\u2192\u2193', 'H\u2193', 'H\u2191'],
      optimalMoves: 0, location: 4 },

    // 36: Lactic Acid (lactic-acid)
    { name: "Lactic Acid", molecule: "lactic-acid",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+'0'+O+W+O+O+O+O+O+O+O+'0'+W,
        W+O+O+W+'0'+O+O+W+O+O+O+O+W,
        W+O+O+O+O+O+W+O+O+O+W+W+W,
        W+O+O+O+O+O+W+O+O+O+'0'+O+W,
        W+O+W+O+O+'0'+W+'0'+O+O+O+O+W,
        W+O+O+W+W+W+W+W+W+W+O+O+W,
        W+O+O+O+O+'0'+W+'0'+O+O+W+O+W,
        W+O+'0'+O+O+O+W+O+O+O+O+O+W,
        W+W+W+O+O+O+W+O+O+O+O+O+W,
        W+O+O+O+O+W+O+O+'0'+W+O+O+W,
        W+'0'+O+O+O+O+O+O+O+W+O+'0'+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['H\u2198', 'C\u2196\u2197\u2198\u2199', 'O\u2196\u2198', 'C\u2196\u2197\u2198\u2199', 'C\u2192\u2199\u21C8', 'O\u21CA', 'H\u2190', 'O\u2190\u2192', 'H\u2198', 'H\u2196', 'H\u2197', 'H\u2196'],
      optimalMoves: 0, location: 4 },

    // 37: Butanol (butanol)
    { name: "Butanol", molecule: "butanol",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+O+O+O+O+'0'+O+O+O+W,
        W+O+O+O+W+'0'+O+'0'+O+'0'+O+'0'+W,
        W+O+'0'+O+O+O+O+O+'0'+O+O+O+W,
        W+O+O+O+O+O+W+W+O+O+O+O+W,
        W+O+'0'+O+O+O+O+O+W+O+'0'+'0'+W,
        W+O+O+W+W+W+W+O+W+O+'0'+O+W,
        W+O+O+O+O+O+O+O+W+O+'0'+O+W,
        W+'0'+O+W+W+W+W+O+W+W+'0'+O+W,
        W+O+O+O+O+O+O+W+W+W+W+O+W,
        W+O+W+O+O+O+O+W+O+W+W+O+W,
        W+'0'+O+O+O+O+O+W+O+O+O+O+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['C\u2190\u2191\u2192\u2193', 'H\u2192', 'C\u2190\u2191\u2192\u2193', 'C\u2190\u2191\u2192\u2193', 'H\u2190', 'H\u2191', 'H\u2191', 'H\u2193', 'H\u2193', 'H\u2191', 'C\u2190\u2191\u2192\u2193', 'O\u2191\u2193', 'H\u2193', 'H\u2191', 'H\u2193'],
      optimalMoves: 15, location: 4 },

    // 38: Serine (serine)
    { name: "Serine", molecule: "serine",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+'0'+'0'+O+'0'+O+O+O+'0'+'0'+'0'+O+W,
        W+O+O+O+O+O+O+O+'0'+O+O+O+W,
        W+O+W+O+'0'+W+W+W+W+W+O+O+W,
        W+O+W+O+O+O+O+O+O+W+W+O+W,
        W+O+W+'0'+O+O+O+'0'+'0'+W+W+O+W,
        W+O+W+W+W+O+O+O+O+W+O+'0'+W,
        W+O+W+O+O+O+O+O+O+W+O+O+W,
        W+O+W+W+W+W+O+O+O+O+O+O+W,
        W+O+O+O+O+W+O+O+O+O+O+O+W,
        W+O+O+O+'0'+O+O+O+O+O+O+'0'+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['H\u2192', 'O\u2190\u2192', 'C\u2190\u2191\u2192\u2193', 'C\u2190\u2192\u21c8', 'O\u2190\u2192', 'H\u2190', 'N\u2191\u2192\u2193', 'H\u2191', 'H\u2193', 'C\u2190\u2191\u2192\u2193', 'H\u2191', 'H\u2190', 'O\u21ca', 'H\u2193'],
      optimalMoves: 17, location: 4 },

    // 39: Trans-Butylene (trans-butylen)
    { name: "Trans-Butylene", molecule: "trans-butylen",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+W+O+O+'0'+W+O+O+O+W,
        W+'0'+O+W+O+'0'+O+O+O+W+O+O+W,
        W+O+W+O+W+W+O+W+W+O+W+O+W,
        W+O+O+'0'+O+O+O+O+O+O+O+O+W,
        W+W+W+'0'+W+W+O+W+W+O+W+W+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+W+O+W+W+'0'+W+W+O+W+O+W,
        W+O+O+W+'0'+'0'+O+O+O+W+'0'+O+W,
        W+O+O+O+W+O+O+'0'+W+O+O+O+W,
        W+'0'+O+O+'0'+O+O+O+O+O+O+O+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['C\u2197\u2198\u21C7', 'C\u2196\u2199\u21C9', 'H\u2199', 'H\u2197', 'H\u2196', 'H\u2198', 'C\u2196\u2197\u2198\u2199', 'H\u2198', 'H\u2198', 'H\u2196', 'C\u2196\u2197\u2198\u2199', 'H\u2196'],
      optimalMoves: 0, location: 4 },

    // 40: Glycerin (glycerin)
    { name: "Glycerin", molecule: "glycerin",
      map: [
        O+W+W+W+W+W+W+W+W+W+W+W+O,
        O+W+O+W+O+'0'+W+'0'+O+W+O+W+O,
        O+W+O+'0'+W+O+W+O+W+O+O+W+O,
        O+W+W+O+O+'0'+O+O+O+O+W+W+O,
        O+W+O+W+O+O+O+O+O+W+O+W+O,
        O+W+O+'0'+O+O+O+O+'0'+O+O+W+O,
        O+W+W+W+W+'0'+O+O+W+W+W+W+O,
        O+W+O+O+O+O+'0'+'0'+O+'0'+O+W+O,
        O+W+O+W+O+O+O+O+'0'+W+O+W+O,
        O+W+W+O+O+O+O+O+'0'+O+W+W+O,
        O+W+O+O+W+O+W+O+W+O+'0'+W+O,
        O+W+O+W+O+'0'+W+O+O+W+O+W+O,
        O+W+W+W+W+W+W+W+W+W+W+W+O
      ],
      atomIds: ['H\u2191', 'C\u2190\u2191\u2192\u2193', 'O\u2190\u2192', 'C\u2190\u2191\u2192\u2193', 'H\u2190', 'H\u2192', 'O\u2190\u2192', 'H\u2192', 'O\u2190\u2192', 'H\u2192', 'C\u2190\u2191\u2192\u2193', 'H\u2190', 'H\u2193', 'H\u2190'],
      optimalMoves: 0, location: 4 },

    // ===== LAB 5: Master Chemist (41-50) =====
    // 41: Pyran (pyran)
    { name: "Pyran", molecule: "pyran",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+'0'+O+O+O+'0'+O+O+'0'+O+O+W,
        W+O+O+O+O+O+O+'0'+O+O+O+O+W,
        W+O+O+O+W+'0'+O+O+O+'0'+O+O+W,
        W+O+W+O+W+O+W+O+O+O+O+O+W,
        W+O+O+W+O+O+W+O+O+'0'+O+O+W,
        W+O+O+W+O+O+W+O+O+'0'+O+O+W,
        W+O+O+O+O+O+W+W+O+W+O+O+W,
        W+O+O+O+O+O+W+O+O+W+'0'+O+W,
        W+'0'+W+O+O+O+W+O+O+W+O+O+W,
        W+O+O+O+O+O+O+O+'0'+O+O+'0'+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['C\u2191\u2199\u21c9', 'H\u2199', 'H\u2193', 'O\u2197\u2198', 'C\u2193\u2196\u21c9', 'C\u2191\u2198\u21c7', 'C\u2193\u2197\u21c7', 'H\u2191', 'C\u2196\u2197\u2198\u2199', 'H\u2193', 'H\u2191', 'H\u2196'],
      optimalMoves: 0, location: 5 },

    // 42: Taurine (taurine)
    { name: "Taurine", molecule: "taurine",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+O+O+'0'+O+'0'+O+O+O+W,
        W+'0'+'0'+O+O+O+O+O+O+'0'+'0'+O+W,
        W+O+O+'0'+O+O+O+O+'0'+O+O+O+W,
        W+O+O+O+O+O+O+W+W+W+W+O+W,
        W+O+O+W+O+O+O+W+O+O+W+O+W,
        W+O+'0'+W+O+O+W+O+O+O+O+O+W,
        W+'0'+O+W+W+W+W+W+W+O+O+O+W,
        W+'0'+O+W+O+O+O+O+O+O+O+O+W,
        W+'0'+O+W+W+W+W+W+W+O+O+O+W,
        W+'0'+O+O+O+O+O+O+O+O+O+O+W,
        W+'0'+O+O+O+O+O+O+O+O+O+O+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['C\u2190\u2191\u2192\u2193', 'O\u21ca', 'N\u2190\u2192\u2193', 'S\u2190\u2192\u2193\u21c8', 'O\u2190\u2192', 'H\u2190', 'H\u2191', 'O\u2191', 'H\u2191', 'H\u2191', 'C\u2190\u2191\u2192\u2193', 'H\u2192', 'H\u2193', 'H\u2193'],
      optimalMoves: 17, location: 5 },

    // 43: Pyrimidine (pyrimidine)
    { name: "Pyrimidine", molecule: "pyrimidine",
      map: [
        O+O+O+W+W+W+W+W+W+W+O+O+O,
        O+O+O+W+'0'+O+O+'0'+O+W+O+O+O,
        O+O+O+W+O+O+O+O+'0'+W+O+O+O,
        O+O+O+W+O+O+O+O+'0'+W+O+O+O,
        O+O+O+W+W+O+O+W+O+W+O+O+O,
        W+W+W+O+O+'0'+O+W+O+O+W+W+W,
        W+O+O+O+O+'0'+O+W+O+O+O+O+W,
        W+O+O+O+O+'0'+O+W+O+O+O+O+W,
        W+O+W+W+O+W+O+W+O+O+'0'+O+W,
        W+O+W+W+O+W+O+O+'0'+W+W+W+W,
        W+O+O+O+O+W+O+O+'0'+O+O+O+W,
        W+O+O+O+O+O+O+O+'0'+O+O+O+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['N\u2197\u2198', 'H\u2193', 'C\u2191\u2198\u21c7', 'C\u2191\u2199\u21c9', 'C\u2196\u2197\u2198\u2199', 'N\u2197\u21c7', 'H\u2191', 'H\u2193', 'H\u2199', 'C\u2193\u2196\u21c9', 'H\u2196'],
      optimalMoves: 0, location: 5 },

    // 44: Aspartic Acid (aspartic-acid)
    { name: "Aspartic Acid", molecule: "aspartic-acid",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+O+O+O+O+'0'+O+O+O+W,
        W+O+W+W+W+W+W+O+'0'+W+O+O+W,
        W+O+O+O+O+O+O+O+O+W+O+O+W,
        W+O+'0'+O+'0'+O+O+O+O+W+O+O+W,
        W+'0'+O+O+O+'0'+O+'0'+'0'+W+O+O+W,
        W+O+O+O+O+'0'+O+O+O+O+O+O+W,
        W+O+O+O+W+O+O+O+'0'+W+O+O+W,
        W+O+O+O+W+W+O+O+O+O+W+O+W,
        W+O+O+O+W+W+O+O+O+W+W+W+W,
        W+O+'0'+O+W+W+O+W+O+O+O+O+W,
        W+O+'0'+'0'+W+W+O+O+'0'+O+'0'+'0'+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['O\u21ca', 'H\u2193', 'O\u21ca', 'H\u2193', 'O\u2190\u2192\u2193', 'C\u2190\u2191\u2192\u2193', 'O\u2190\u2192', 'H\u2190', 'H\u2191', 'H\u2191', 'C\u2190\u2191\u2192\u2193', 'C\u21c8\u2192', 'H\u2191', 'N\u2191\u2192\u2193', 'C\u2190\u2192\u21c8', 'H\u2190'],
      optimalMoves: 17, location: 5 },

    // 45: Glutamine (glutamine)
    { name: "Glutamine", molecule: "glutamine",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+'0'+'0'+O+O+O+O+O+O+O+O+W,
        W+O+'0'+O+O+O+O+O+O+O+W+O+W,
        W+O+O+O+O+O+'0'+O+O+O+O+'0'+W,
        W+'0'+'0'+O+'0'+'0'+O+'0'+O+W+W+O+W,
        W+O+'0'+O+O+O+O+O+O+O+O+'0'+W,
        W+O+W+W+O+O+O+O+O+O+O+'0'+W,
        W+O+W+O+O+O+O+W+W+W+W+O+W,
        W+O+O+O+O+W+O+O+O+O+O+O+W,
        W+O+O+O+O+W+O+O+O+W+W+O+W,
        W+O+O+O+O+W+O+O+O+O+O+'0'+W,
        W+O+O+O+O+O+'0'+O+O+O+O+O+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['H\u2193', 'H\u2193', 'C\u2190\u2191\u2192\u2193', 'H\u2193', 'O\u21ca', 'H\u2192', 'C\u2190\u2191\u2192\u2193', 'C\u2190\u2191\u2192\u2193', 'C\u2190\u2192\u21c8', 'H\u2190', 'H\u2191', 'H\u2191', 'H\u2191', 'N\u2190\u2192\u2193', 'H\u2191'],
      optimalMoves: 12, location: 5 },

    // 46: Chlorine Heptoxide (chlorine-heptoxide)
    { name: "Chlorine Heptoxide", molecule: "chlorine-heptoxide",
      map: [
        O+O+O+W+W+W+W+W+W+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+'0'+O+O+'0'+'0'+W+O+O+O,
        O+O+O+W+O+O+O+'0'+O+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        W+W+W+O+O+W+W+W+W+O+W+W+W,
        W+O+O+O+O+O+'0'+O+O+O+O+O+W,
        W+O+W+O+O+O+'0'+O+W+W+W+O+W,
        W+O+W+O+'0'+O+'0'+W+W+O+O+O+W,
        W+O+W+O+O+O+W+W+W+O+O+O+W,
        W+O+W+O+O+O+W+W+O+O+W+O+W,
        W+O+W+O+O+O+O+O+O+O+W+'0'+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['O\u2193', 'O\u2192', '\u20b5\u2192\u21ca\u21c7\u21c8', 'O\u2192\u2190', 'O\u2193', '\u20b5\u2190\u21ca\u21c9\u21c8', 'O\u2191', 'O\u2191', 'O\u2190'],
      optimalMoves: 12, location: 5 },

    // 47: Acetone Challenge (acetone)
    { name: "Acetone Challenge", molecule: "acetone",
      map: [
        O+O+O+W+W+W+W+W+W+W+O+O+O,
        O+O+O+W+'0'+O+O+O+O+W+O+O+O,
        O+O+O+W+W+O+O+O+O+W+O+O+O,
        O+O+O+W+O+O+'0'+O+'0'+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        W+W+W+W+O+O+O+O+O+O+W+W+W,
        W+O+O+W+O+O+O+O+W+W+W+O+W,
        W+O+O+W+O+'0'+O+O+O+O+O+O+W,
        W+O+O+W+O+O+O+O+O+O+O+O+W,
        W+O+O+'0'+O+O+W+W+W+W+O+O+W,
        W+'0'+O+'0'+O+O+'0'+W+O+O+O+'0'+W,
        W+O+O+O+O+O+'0'+O+O+O+O+O+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['C\u2190\u2191\u2192\u2193', 'C\u2190\u2192\u21ca', 'H\u2191', 'H\u2193', 'H\u2193', 'H\u2192', 'H\u2191', 'C\u2190\u2191\u2192\u2193', 'O\u21c8', 'H\u2190'],
      optimalMoves: 15, location: 5 },

    // 48: Propanal Challenge (propanal)
    { name: "Propanal Challenge", molecule: "propanal",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+'0'+O+O+'0'+O+O+'0'+O+O+W,
        W+'0'+O+O+O+O+O+O+'0'+O+O+O+W,
        W+O+O+W+W+W+'0'+O+O+'0'+O+'0'+W,
        W+O+'0'+O+O+W+W+W+W+W+W+W+W,
        W+O+W+W+W+W+W+O+O+O+O+O+W,
        W+'0'+O+O+O+O+W+O+O+O+O+O+W,
        W+W+W+O+O+O+W+O+O+O+W+W+W,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+O+O+O+O+O+W+O+O+O,
        O+O+O+W+O+O+W+O+O+W+O+O+O,
        O+O+O+W+O+O+W+O+O+W+O+O+O,
        O+O+O+W+W+W+W+W+W+W+O+O+O
      ],
      atomIds: ['C\u2190\u2191\u2192\u2193', 'C\u2190\u2192\u2193\u21ca', 'H\u2193', 'C\u2190\u2191\u2192\u2193', 'H\u2190', 'H\u2191', 'H\u2191', 'O\u21c8', 'H\u2193', 'H\u2192'],
      optimalMoves: 13, location: 5 },

    // 49: Cyclobutane Challenge (cyclobutane)
    { name: "Cyclobutane Challenge", molecule: "cyclobutane",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+W+W+W+O+O+O+O+O+O+W,
        W+'0'+'0'+O+'0'+W+O+O+O+O+W+O+W,
        W+O+O+O+O+W+W+W+O+O+W+O+W,
        W+O+O+O+O+W+O+O+W+O+W+O+W,
        W+O+W+O+O+O+O+O+W+O+W+O+W,
        W+O+'0'+O+O+'0'+O+O+W+O+O+O+W,
        W+W+W+O+O+O+'0'+W+W+W+W+W+W,
        W+O+W+O+O+O+O+O+O+'0'+'0'+'0'+W,
        W+'0'+O+O+O+O+W+W+O+O+O+O+W,
        W+O+O+O+O+'0'+O+O+'0'+O+O+O+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['H\u2192', 'C\u2190\u2191\u2192\u2193', 'H\u2191', 'H\u2193', 'H\u2193', 'H\u2190', 'C\u2190\u2191\u2192\u2193', 'C\u2190\u2191\u2192\u2193', 'H\u2190', 'H\u2191', 'C\u2190\u2191\u2192\u2193', 'H\u2192'],
      optimalMoves: 14, location: 5 },

    // 50: Glycerin Challenge (glycerin)
    { name: "Glycerin Challenge", molecule: "glycerin",
      map: [
        W+W+W+W+W+W+W+W+W+W+W+W+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+O+O+O+O+O+O+O+O+O+W,
        W+O+O+W+W+O+O+O+O+O+W+O+W,
        W+O+W+W+O+O+O+O+O+O+O+O+W,
        W+O+W+O+O+W+W+W+W+W+O+O+W,
        W+O+W+O+O+O+O+W+W+W+W+O+W,
        W+O+W+W+W+W+'0'+O+'0'+W+W+O+W,
        W+'0'+'0'+'0'+O+O+O+O+O+O+'0'+O+W,
        W+O+W+W+W+W+W+O+O+'0'+O+'0'+W,
        W+'0'+O+O+O+O+W+'0'+O+'0'+'0'+O+W,
        W+'0'+O+O+O+O+O+O+O+'0'+O+O+W,
        W+W+W+W+W+W+W+W+W+W+W+W+W
      ],
      atomIds: ['H\u2192', 'H\u2193', 'H\u2192', 'C\u2190\u2191\u2192\u2193', 'O\u2190\u2192', 'H\u2190', 'O\u2190\u2192', 'H\u2190', 'H\u2191', 'H\u2192', 'C\u2190\u2191\u2192\u2193', 'H\u2190', 'C\u2190\u2191\u2192\u2193', 'O\u2190\u2192'],
      optimalMoves: 12, location: 5 }
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

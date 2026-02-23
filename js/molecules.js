/**
 * Molecules - atom/molecule data module for Atomix Lab
 * Molecule grid data transcribed from GNOME Atomix / PuzzleDungeon atomix.py
 */
(function () {
  'use strict';

  // ===== Element definitions =====
  var ELEMENTS = {
    'H':  { color: '#c8c8ff', name: 'Hydrogen',  atomicNumber: 1,  uses: 'The lightest element, makes up most of the universe' },
    'C':  { color: '#808080', name: 'Carbon',     atomicNumber: 6,  uses: 'The backbone of organic chemistry and life' },
    'O':  { color: '#ff6464', name: 'Oxygen',     atomicNumber: 8,  uses: 'Essential for breathing and combustion' },
    'N':  { color: '#6464ff', name: 'Nitrogen',   atomicNumber: 7,  uses: 'Makes up 78% of Earth\'s atmosphere' },
    'S':  { color: '#ffffc8', name: 'Sulfur',     atomicNumber: 16, uses: 'Known for its yellow color and pungent smell' },
    'Cl': { color: '#64ff64', name: 'Chlorine',   atomicNumber: 17, uses: 'Used in water purification and disinfection' },
    'P':  { color: '#ffff64', name: 'Phosphorus', atomicNumber: 15, uses: 'Essential for DNA, bones, and energy transfer in cells' }
  };

  // ===== Molecule grid definitions =====
  // Each molecule is a 2D array of cell strings.
  // Cell format: element symbol followed by bond direction arrows.
  // Single bonds: arrow chars. Double bonds: double-arrow chars.
  // The special char \u20b5 represents Cl (Chlorine) in original data.

  var MOLECULE_DEFS = {
    'water': [
      ['H\u2192'    , 'O\u2190\u2192'   , 'H\u2190'    ]
    ],
    'methane': [
      [''      , 'H\u2193'    , ''      ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'H\u2190'    ],
      [''      , 'H\u2191'    , ''      ]
    ],
    'methanal': [
      ['H\u2193'    , ''      ],
      ['C\u2191\u2193\u21C9'  , 'O\u21C7'    ],
      ['H\u2191'    , ''      ]
    ],
    'ethylene': [
      ['H\u2198'    , ''      , ''      , 'H\u2199'    ],
      [''      , 'C\u2196\u2199\u21C9'  , 'C\u2197\u2198\u21C7'  , ''      ],
      ['H\u2197'    , ''      , ''      , 'H\u2196'    ]
    ],
    'methanol': [
      [''      , 'H\u2193'    , ''      , ''      ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'O\u2190\u2192'   , 'H\u2190'    ],
      [''      , 'H\u2191'    , ''      , ''      ]
    ],
    'ethane': [
      ['H\u2198'    , 'H\u2193'    , 'H\u2199'    ],
      [''      , 'C\u2191\u2193\u2196\u2197' , ''      ],
      [''      , 'C\u2191\u2193\u2198\u2199' , ''      ],
      ['H\u2197'    , 'H\u2191'    , 'H\u2196'    ]
    ],
    'dimethyl-ether': [
      [''      , 'H\u2193'    , ''      , 'H\u2193'    , ''      ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'O\u2190\u2192'   , 'C\u2190\u2191\u2192\u2193' , 'H\u2190'    ],
      [''      , 'H\u2191'    , ''      , 'H\u2191'    , ''      ]
    ],
    'ethanal': [
      [''      , 'H\u2193'    , 'H\u2193'    , ''      ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u21C9'  , 'O\u21C7'    ],
      [''      , 'H\u2191'    , ''      , ''      ]
    ],
    'ethanol': [
      [''      , 'H\u2193'    , 'H\u2193'    , ''      , ''      ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u2192\u2193' , 'O\u2190\u2192'   , 'H\u2190'    ],
      [''      , 'H\u2191'    , 'H\u2191'    , ''      , ''      ]
    ],
    'acetic-acid': [
      [''      , 'H\u2193'    , 'O\u21CA'    , ''      , ''      ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2192\u21C8'  , 'O\u2190\u2192'   , 'H\u2190'    ],
      [''      , 'H\u2191'    , ''      , ''      , ''      ]
    ],
    'propylene': [
      [''      , 'H\u2193'    , 'H\u2193'    , ''      , 'H\u2199'    ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u21C9'  , 'C\u2197\u2198\u21C7'  , ''      ],
      [''      , 'H\u2191'    , ''      , ''      , 'H\u2196'    ]
    ],
    'propanal': [
      [''      , 'H\u2193'    , 'H\u2193'    , ''      , ''      ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2192\u2193\u21CA' , 'H\u2190'    ],
      [''      , 'H\u2191'    , 'H\u2191'    , 'O\u21C8'    , ''      ]
    ],
    'acetone': [
      [''      , 'H\u2193'    , ''      , 'H\u2193'    , ''      ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2192\u21CA'  , 'C\u2190\u2191\u2192\u2193' , 'H\u2190'    ],
      [''      , 'H\u2191'    , 'O\u21C8'    , 'H\u2191'    , ''      ]
    ],
    'butanol': [
      [''      , 'H\u2193'    , 'H\u2193'    , 'H\u2193'    , 'H\u2193'    , ''      ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u2192\u2193' , 'H\u2190'    ],
      [''      , 'H\u2191'    , 'H\u2191'    , 'H\u2191'    , 'O\u2191\u2193'   , ''      ],
      [''      , ''      , ''      , ''      , 'H\u2191'    , ''      ]
    ],
    'cyclobutane': [
      [''      , 'H\u2193'    , 'H\u2193'    , ''      ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u2192\u2193' , 'H\u2190'    ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u2192\u2193' , 'H\u2190'    ],
      [''      , 'H\u2191'    , 'H\u2191'    , ''      ]
    ],
    'trans-butylen': [
      [''      , ''      , ''      , 'H\u2198'    , ''      , 'H\u2199'    ],
      [''      , 'H\u2198'    , ''      , ''      , 'C\u2196\u2197\u2198\u2199' , ''      ],
      ['H\u2198'    , ''      , 'C\u2196\u2199\u21C9'  , 'C\u2197\u2198\u21C7'  , ''      , 'H\u2196'    ],
      [''      , 'C\u2196\u2197\u2198\u2199' , ''      , ''      , 'H\u2196'    , ''      ],
      ['H\u2197'    , ''      , 'H\u2196'    , ''      , ''      , ''      ]
    ],
    'pyran': [
      [''      , 'H\u2193'    , 'H\u2193'    , ''      , ''      ],
      [''      , 'C\u2191\u2199\u21C9'  , 'C\u2191\u2198\u21C7'  , ''      , 'H\u2199'    ],
      ['O\u2197\u2198'   , ''      , ''      , 'C\u2196\u2197\u2198\u2199' , ''      ],
      [''      , 'C\u2193\u2196\u21C9'  , 'C\u2193\u2197\u21C7'  , ''      , 'H\u2196'    ],
      [''      , 'H\u2191'    , 'H\u2191'    , ''      , ''      ]
    ],
    'lactic-acid': [
      ['H\u2198'    , ''      , ''      , 'O\u21CA'    , ''      , ''      ],
      [''      , 'O\u2196\u2198'   , ''      , 'C\u2192\u2199\u21C8'  , 'O\u2190\u2192'   , 'H\u2190'    ],
      ['H\u2198'    , ''      , 'C\u2196\u2197\u2198\u2199' , ''      , ''      , ''      ],
      [''      , 'C\u2196\u2197\u2198\u2199' , ''      , 'H\u2196'    , ''      , ''      ],
      ['H\u2197'    , ''      , 'H\u2196'    , ''      , ''      , ''      ]
    ],
    'glycerin': [
      [''      , 'H\u2193'    , ''      , ''      ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'O\u2190\u2192'   , 'H\u2190'    ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'O\u2190\u2192'   , 'H\u2190'    ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'O\u2190\u2192'   , 'H\u2190'    ],
      [''      , 'H\u2191'    , ''      , ''      ]
    ],
    'chlorine-heptoxide': [
      [''      , 'O\u2193'      , ''    , 'O\u2193'    , ''      ],
      ['O\u2192'    , '\u20B5\u2192\u21CA\u21C7\u21C8'   , 'O\u2192\u2190' , '\u20B5\u2190\u21CA\u21C9\u21C8' , 'O\u2190'    ],
      [''      , 'O\u2191'      , ''    , 'O\u2191'    , ''      ]
    ],
    // --- Basics Lab ---
    'carbon-dioxide': [
      ['O\u21C9'    , 'C\u21C7\u21C9'   , 'O\u21C7'    ]
    ],
    'hydrogen-sulfide': [
      ['H\u2192'    , 'S\u2190\u2192'   , 'H\u2190'    ]
    ],
    'ammonia': [
      [''      , 'H\u2193'    , ''      ],
      ['H\u2192'    , 'N\u2190\u2191\u2192'  , 'H\u2190'    ]
    ],
    'hydrogen-peroxide': [
      ['H\u2192'    , 'O\u2190\u2192'   , 'O\u2190\u2192'   , 'H\u2190'    ]
    ],
    'nitrous-oxide': [
      ['N\u21C9'    , 'N\u21C7\u21C9'   , 'O\u21C7'    ]
    ],
    'phosphoric-acid': [
      [''      , ''      , 'O\u21CA'    , ''      , ''      ],
      ['H\u2192'    , 'O\u2190\u2192'   , 'P\u2190\u2192\u2193\u21C8' , 'O\u2190\u2192'   , 'H\u2190'    ],
      [''      , ''      , 'O\u2191\u2193'   , ''      , ''      ],
      [''      , ''      , 'H\u2191'    , ''      , ''      ]
    ],
    // --- Organic Chemistry ---
    'formic-acid': [
      [''      , 'O\u21CA'    , ''      , ''      ],
      ['H\u2192'    , 'C\u2190\u21C8\u2192'  , 'O\u2190\u2192'   , 'H\u2190'    ]
    ],
    'propane': [
      [''      , 'H\u2193'    , 'H\u2193'    , 'H\u2193'    , ''      ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u2192\u2193' , 'H\u2190'    ],
      [''      , 'H\u2191'    , 'H\u2191'    , 'H\u2191'    , ''      ]
    ],
    'isopropanol': [
      [''      , 'H\u2193'    , 'H\u2193'    , 'H\u2193'    , ''      ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u2192\u2193' , 'H\u2190'    ],
      [''      , 'H\u2191'    , 'O\u2191\u2193'   , 'H\u2191'    , ''      ],
      [''      , ''      , 'H\u2191'    , ''      , ''      ]
    ],
    'ethylene-glycol': [
      [''      , ''      , 'H\u2193'    , 'H\u2193'    , ''      , ''      ],
      ['H\u2192'    , 'O\u2190\u2192'   , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u2192\u2193' , 'O\u2190\u2192'   , 'H\u2190'    ],
      [''      , ''      , 'H\u2191'    , 'H\u2191'    , ''      , ''      ]
    ],
    'vinyl-chloride': [
      ['H\u2198'    , ''      , ''      , '\u20B5\u2199'    ],
      [''      , 'C\u2196\u2199\u21C9'  , 'C\u2197\u2198\u21C7'  , ''      ],
      ['H\u2197'    , ''      , ''      , 'H\u2196'    ]
    ],
    // --- Functional Groups ---
    'methylamine': [
      [''      , 'H\u2193'    , ''      , ''      ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'N\u2190\u2192\u2193'  , 'H\u2190'    ],
      [''      , 'H\u2191'    , 'H\u2191'    , ''      ]
    ],
    'urea': [
      [''      , 'H\u2193'    , ''      , 'H\u2193'    , ''      ],
      ['H\u2192'    , 'N\u2190\u2191\u2192'  , 'C\u2190\u2192\u21CA'  , 'N\u2190\u2191\u2192'  , 'H\u2190'    ],
      [''      , ''      , 'O\u21C8'    , ''      , ''      ]
    ],
    'nitromethane': [
      [''      , 'H\u2193'    , 'O\u21CA'    , ''      ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'N\u2190\u2192\u21C8'  , 'O\u2190'    ],
      [''      , 'H\u2191'    , ''      , ''      ]
    ],
    'glycine': [
      [''      , ''      , 'H\u2193'    , 'O\u21CA'    , ''      , ''      ],
      ['H\u2192'    , 'N\u2190\u2192\u2193'  , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2192\u21C8'  , 'O\u2190\u2192'   , 'H\u2190'    ],
      [''      , 'H\u2191'    , 'H\u2191'    , ''      , ''      , ''      ]
    ],
    'alanine': [
      [''      , 'H\u2193'    , 'H\u2193'    , 'O\u21CA'    , ''      , ''      ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2192\u21C8'  , 'O\u2190\u2192'   , 'H\u2190'    ],
      [''      , 'H\u2191'    , 'N\u2191\u2192\u2193'  , 'H\u2190'    , ''      , ''      ],
      [''      , ''      , 'H\u2191'    , ''      , ''      , ''      ]
    ],
    'dimethyl-sulfoxide': [
      [''      , 'H\u2193'    , ''      , 'H\u2193'    , ''      ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'S\u2190\u2192\u21CA'  , 'C\u2190\u2191\u2192\u2193' , 'H\u2190'    ],
      [''      , 'H\u2191'    , 'O\u21C8'    , 'H\u2191'    , ''      ]
    ],
    'cysteine': [
      [''      , ''      , 'H\u2193'    , 'H\u2193'    , 'O\u21CA'    , ''      , ''      ],
      ['H\u2192'    , 'S\u2190\u2192'   , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2192\u21C8'  , 'O\u2190\u2192'   , 'H\u2190'    ],
      [''      , ''      , 'H\u2191'    , 'N\u2191\u2192\u2193'  , 'H\u2190'    , ''      , ''      ],
      [''      , ''      , ''      , 'H\u2191'    , ''      , ''      , ''      ]
    ],
    // --- Complex Molecules ---
    'acrolein': [
      ['H\u2198'    , ''      , 'H\u2193'    , 'O\u21CA'    ],
      [''      , 'C\u2196\u2199\u21C9'  , 'C\u2191\u2192\u21C7'  , 'C\u2190\u2193\u21C8'  ],
      ['H\u2197'    , ''      , ''      , 'H\u2191'    ]
    ],
    'serine': [
      [''      , ''      , 'H\u2193'    , 'H\u2193'    , 'O\u21CA'    , ''      , ''      ],
      ['H\u2192'    , 'O\u2190\u2192'   , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2192\u21C8'  , 'O\u2190\u2192'   , 'H\u2190'    ],
      [''      , ''      , 'H\u2191'    , 'N\u2191\u2192\u2193'  , 'H\u2190'    , ''      , ''      ],
      [''      , ''      , ''      , 'H\u2191'    , ''      , ''      , ''      ]
    ],
    'pyruvic-acid': [
      [''      , 'H\u2193'    , 'O\u21CA'    , 'O\u21CA'    , ''      , ''      ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2192\u21C8'  , 'C\u2190\u2192\u21C8'  , 'O\u2190\u2192'   , 'H\u2190'    ],
      [''      , 'H\u2191'    , ''      , ''      , ''      , ''      ]
    ],
    'oxetane': [
      [''      , ''      , 'H\u2193'    , ''      ],
      [''      , 'O\u2192\u2193'   , 'C\u2190\u2191\u2192\u2193' , 'H\u2190'    ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u2192\u2193' , 'H\u2190'    ],
      [''      , 'H\u2191'    , 'H\u2191'    , ''      ]
    ],
    // --- Master Chemist ---
    'taurine': [
      [''      , ''      , 'H\u2193'    , 'H\u2193'    , 'O\u21CA'    , ''      , ''      ],
      ['H\u2192'    , 'N\u2190\u2192\u2193'  , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u2192\u2193' , 'S\u2190\u2192\u2193\u21C8' , 'O\u2190\u2192'   , 'H\u2190'    ],
      [''      , 'H\u2191'    , 'H\u2191'    , 'H\u2191'    , 'O\u2191'    , ''      , ''      ]
    ],
    'pyrimidine': [
      [''      , 'H\u2193'    , 'H\u2193'    , ''      , ''      ],
      [''      , 'C\u2191\u2199\u21C9'  , 'C\u2191\u2198\u21C7'  , ''      , 'H\u2199'    ],
      ['N\u2197\u2198'   , ''      , ''      , 'C\u2196\u2197\u2198\u2199' , ''      ],
      [''      , 'C\u2193\u2196\u21C9'  , 'N\u2197\u21C7'   , ''      , 'H\u2196'    ],
      [''      , 'H\u2191'    , ''      , ''      , ''      ]
    ],
    'aspartic-acid': [
      ['O\u21CA'    , ''      , 'H\u2193'    , 'H\u2193'    , 'O\u21CA'    , ''      , ''      ],
      ['C\u21C8\u2192'   , 'O\u2190\u2192\u2193'  , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2192\u21C8'  , 'O\u2190\u2192'   , 'H\u2190'    ],
      [''      , 'H\u2191'    , 'H\u2191'    , 'N\u2191\u2192\u2193'  , 'H\u2190'    , ''      , ''      ],
      [''      , ''      , ''      , 'H\u2191'    , ''      , ''      , ''      ]
    ],
    'glutamine': [
      [''      , 'H\u2193'    , 'H\u2193'    , 'H\u2193'    , 'O\u21CA'    , ''      , ''      ],
      ['H\u2192'    , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2191\u2192\u2193' , 'C\u2190\u2192\u21C8'  , 'N\u2190\u2192\u2193'  , 'H\u2190'    ],
      [''      , 'H\u2191'    , 'H\u2191'    , 'H\u2191'    , ''      , 'H\u2191'    , ''      ]
    ]
  };

  // ===== Molecule info (display name, formula, fun fact) =====
  var MOLECULE_INFO = {
    'water': {
      name: 'Water',
      formula: 'H\u2082O',
      fact: 'Water is the only substance that naturally exists in all three states of matter on Earth.'
    },
    'methane': {
      name: 'Methane',
      formula: 'CH\u2084',
      fact: 'Methane is the simplest hydrocarbon and the main component of natural gas.'
    },
    'methanal': {
      name: 'Methanal',
      formula: 'CH\u2082O',
      fact: 'Also known as formaldehyde, it is used to preserve biological specimens.'
    },
    'ethylene': {
      name: 'Ethylene',
      formula: 'C\u2082H\u2084',
      fact: 'Ethylene is a plant hormone that triggers fruit ripening.'
    },
    'methanol': {
      name: 'Methanol',
      formula: 'CH\u2083OH',
      fact: 'Methanol is the simplest alcohol and is used as a racing fuel.'
    },
    'ethane': {
      name: 'Ethane',
      formula: 'C\u2082H\u2086',
      fact: 'Ethane is the second simplest hydrocarbon after methane.'
    },
    'dimethyl-ether': {
      name: 'Dimethyl Ether',
      formula: 'C\u2082H\u2086O',
      fact: 'Dimethyl ether is being studied as a clean alternative to diesel fuel.'
    },
    'ethanal': {
      name: 'Ethanal',
      formula: 'C\u2082H\u2084O',
      fact: 'Also called acetaldehyde, it is responsible for hangovers after drinking alcohol.'
    },
    'ethanol': {
      name: 'Ethanol',
      formula: 'C\u2082H\u2085OH',
      fact: 'Ethanol is the type of alcohol found in beverages and is also used as fuel.'
    },
    'acetic-acid': {
      name: 'Acetic Acid',
      formula: 'CH\u2083COOH',
      fact: 'Acetic acid gives vinegar its sour taste and pungent smell.'
    },
    'propylene': {
      name: 'Propylene',
      formula: 'C\u2083H\u2086',
      fact: 'Propylene is used to make polypropylene, one of the most common plastics.'
    },
    'propanal': {
      name: 'Propanal',
      formula: 'C\u2083H\u2086O',
      fact: 'Propanal is used in the synthesis of various pharmaceuticals and plastics.'
    },
    'acetone': {
      name: 'Acetone',
      formula: 'C\u2083H\u2086O',
      fact: 'Acetone is the main ingredient in nail polish remover.'
    },
    'butanol': {
      name: 'Butanol',
      formula: 'C\u2084H\u2089OH',
      fact: 'Butanol is being researched as a biofuel that could replace gasoline.'
    },
    'cyclobutane': {
      name: 'Cyclobutane',
      formula: 'C\u2084H\u2088',
      fact: 'Cyclobutane has a square shape with high ring strain making it very reactive.'
    },
    'trans-butylen': {
      name: 'Trans-Butylene',
      formula: 'C\u2084H\u2088',
      fact: 'Trans-butylene is used in the production of synthetic rubber.'
    },
    'pyran': {
      name: 'Pyran',
      formula: 'C\u2085H\u2086O',
      fact: 'Pyran rings are found in many sugars and natural pigments.'
    },
    'lactic-acid': {
      name: 'Lactic Acid',
      formula: 'C\u2083H\u2086O\u2083',
      fact: 'Lactic acid builds up in muscles during intense exercise causing the burn.'
    },
    'glycerin': {
      name: 'Glycerin',
      formula: 'C\u2083H\u2088O\u2083',
      fact: 'Glycerin is used in soaps, medicines, and as a sweetener in food.'
    },
    'chlorine-heptoxide': {
      name: 'Chlorine Heptoxide',
      formula: 'Cl\u2082O\u2087',
      fact: 'Chlorine heptoxide is the most stable oxide of chlorine and a powerful oxidizer.'
    },
    // --- Basics Lab ---
    'carbon-dioxide': {
      name: 'Carbon Dioxide',
      formula: 'CO\u2082',
      fact: 'Greenhouse gas driving climate change.'
    },
    'hydrogen-sulfide': {
      name: 'Hydrogen Sulfide',
      formula: 'H\u2082S',
      fact: 'Rotten egg smell, found in volcanic gases.'
    },
    'ammonia': {
      name: 'Ammonia',
      formula: 'NH\u2083',
      fact: 'Used in cleaning products and fertilizers.'
    },
    'hydrogen-peroxide': {
      name: 'Hydrogen Peroxide',
      formula: 'H\u2082O\u2082',
      fact: 'Common disinfectant and bleaching agent.'
    },
    'nitrous-oxide': {
      name: 'Nitrous Oxide',
      formula: 'N\u2082O',
      fact: 'Laughing gas used as anesthetic.'
    },
    'phosphoric-acid': {
      name: 'Phosphoric Acid',
      formula: 'H\u2083PO\u2084',
      fact: 'Found in cola drinks and fertilizers.'
    },
    // --- Organic Chemistry ---
    'formic-acid': {
      name: 'Formic Acid',
      formula: 'CH\u2082O\u2082',
      fact: 'Found in ant venom, simplest carboxylic acid.'
    },
    'propane': {
      name: 'Propane',
      formula: 'C\u2083H\u2088',
      fact: 'BBQ and heating gas.'
    },
    'isopropanol': {
      name: 'Isopropanol',
      formula: 'C\u2083H\u2088O',
      fact: 'Rubbing alcohol used in hand sanitizer.'
    },
    'ethylene-glycol': {
      name: 'Ethylene Glycol',
      formula: 'C\u2082H\u2086O\u2082',
      fact: 'Main component of automotive antifreeze.'
    },
    'vinyl-chloride': {
      name: 'Vinyl Chloride',
      formula: 'C\u2082H\u2083Cl',
      fact: 'Monomer used to make PVC plastic.'
    },
    // --- Functional Groups ---
    'methylamine': {
      name: 'Methylamine',
      formula: 'CH\u2085N',
      fact: 'Simplest primary amine, building block of organic chemistry.'
    },
    'urea': {
      name: 'Urea',
      formula: 'CH\u2084N\u2082O',
      fact: 'First organic compound synthesized from inorganic materials.'
    },
    'nitromethane': {
      name: 'Nitromethane',
      formula: 'CH\u2083NO\u2082',
      fact: 'Used as racing fuel additive for extra power.'
    },
    'glycine': {
      name: 'Glycine',
      formula: 'C\u2082H\u2085NO\u2082',
      fact: 'Simplest amino acid and building block of proteins.'
    },
    'alanine': {
      name: 'Alanine',
      formula: 'C\u2083H\u2087NO\u2082',
      fact: 'Amino acid that muscles use for energy.'
    },
    'dimethyl-sulfoxide': {
      name: 'Dimethyl Sulfoxide',
      formula: 'C\u2082H\u2086SO',
      fact: 'Universal solvent used in medicine (DMSO).'
    },
    'cysteine': {
      name: 'Cysteine',
      formula: 'C\u2083H\u2087NO\u2082S',
      fact: 'Amino acid with sulfur, forms bonds in hair and skin.'
    },
    // --- Complex Molecules ---
    'acrolein': {
      name: 'Acrolein',
      formula: 'C\u2083H\u2084O',
      fact: 'Toxic component found in wildfire smoke.'
    },
    'serine': {
      name: 'Serine',
      formula: 'C\u2083H\u2087NO\u2083',
      fact: 'Amino acid important in silk protein.'
    },
    'pyruvic-acid': {
      name: 'Pyruvic Acid',
      formula: 'C\u2083H\u2084O\u2083',
      fact: 'Key molecule in metabolism and energy production.'
    },
    'oxetane': {
      name: 'Oxetane',
      formula: 'C\u2083H\u2086O',
      fact: 'Four-membered ring used in modern drug design.'
    },
    // --- Master Chemist ---
    'taurine': {
      name: 'Taurine',
      formula: 'C\u2082H\u2087NO\u2083S',
      fact: 'Found in energy drinks and bile acids.'
    },
    'pyrimidine': {
      name: 'Pyrimidine',
      formula: 'C\u2084H\u2085N\u2082',
      fact: 'Ring structure found in DNA base pairs.'
    },
    'aspartic-acid': {
      name: 'Aspartic Acid',
      formula: 'C\u2084H\u2087NO\u2084',
      fact: 'Amino acid used in artificial sweetener aspartame.'
    },
    'glutamine': {
      name: 'Glutamine',
      formula: 'C\u2084H\u2089NO',
      fact: 'Most abundant amino acid in human blood.'
    }
  };

  // ===== Bond direction mappings =====
  // Single bond arrows -> {dx, dy}
  var SINGLE_BOND_MAP = {
    '\u2190': { dx: -1, dy:  0 },  // leftwards arrow
    '\u2192': { dx:  1, dy:  0 },  // rightwards arrow
    '\u2191': { dx:  0, dy: -1 },  // upwards arrow
    '\u2193': { dx:  0, dy:  1 },  // downwards arrow
    '\u2196': { dx: -1, dy: -1 },  // north-west arrow
    '\u2197': { dx:  1, dy: -1 },  // north-east arrow
    '\u2198': { dx:  1, dy:  1 },  // south-east arrow
    '\u2199': { dx: -1, dy:  1 }   // south-west arrow
  };

  // Double bond arrows -> {dx, dy}
  var DOUBLE_BOND_MAP = {
    '\u21C7': { dx: -1, dy:  0 },  // leftwards paired arrows
    '\u21C9': { dx:  1, dy:  0 },  // rightwards paired arrows
    '\u21C8': { dx:  0, dy: -1 },  // upwards paired arrows
    '\u21CA': { dx:  0, dy:  1 }   // downwards paired arrows
  };

  /**
   * Parse a cell string like 'C\u2190\u2191\u2192\u2193' or 'O\u21C7' into element and bond data.
   * Returns null for empty cells.
   * @param {string} str - The cell string to parse
   * @returns {Object|null} Parsed atom data or null
   */
  function parseAtomCell(str) {
    if (!str || str === '') {
      return null;
    }

    var element;
    var bondChars;

    // Check for the special Chlorine symbol (₵ = \u20B5)
    if (str.charAt(0) === '\u20B5') {
      element = 'Cl';
      bondChars = str.substring(1);
    } else {
      // Standard single-character element symbol
      element = str.charAt(0);
      bondChars = str.substring(1);
    }

    var bonds = [];
    for (var i = 0; i < bondChars.length; i++) {
      var ch = bondChars.charAt(i);
      if (SINGLE_BOND_MAP[ch]) {
        bonds.push({
          dx: SINGLE_BOND_MAP[ch].dx,
          dy: SINGLE_BOND_MAP[ch].dy,
          type: 'single'
        });
      } else if (DOUBLE_BOND_MAP[ch]) {
        bonds.push({
          dx: DOUBLE_BOND_MAP[ch].dx,
          dy: DOUBLE_BOND_MAP[ch].dy,
          type: 'double'
        });
      }
    }

    return {
      element: element,
      bonds: bonds
    };
  }

  /**
   * Get all atoms in a molecule with their grid positions and parsed bond data.
   * @param {string} slug - The molecule slug (e.g., 'water', 'acetic-acid')
   * @returns {Array} Array of atom objects with x, y, element, bonds, cellStr
   */
  function getMoleculeAtoms(slug) {
    var grid = MOLECULE_DEFS[slug];
    if (!grid) {
      return [];
    }

    var atoms = [];
    for (var y = 0; y < grid.length; y++) {
      var row = grid[y];
      for (var x = 0; x < row.length; x++) {
        var cellStr = row[x];
        if (cellStr === '') {
          continue;
        }
        var parsed = parseAtomCell(cellStr);
        if (parsed) {
          atoms.push({
            x: x,
            y: y,
            element: parsed.element,
            bonds: parsed.bonds,
            cellStr: cellStr
          });
        }
      }
    }

    return atoms;
  }

  /**
   * Get the dimensions of a molecule grid.
   * @param {string} slug - The molecule slug
   * @returns {Object} Object with width and height properties
   */
  function getMoleculeDimensions(slug) {
    var grid = MOLECULE_DEFS[slug];
    if (!grid) {
      return { width: 0, height: 0 };
    }

    var maxWidth = 0;
    for (var y = 0; y < grid.length; y++) {
      if (grid[y].length > maxWidth) {
        maxWidth = grid[y].length;
      }
    }

    return {
      width: maxWidth,
      height: grid.length
    };
  }

  // ===== Public API =====
  var Molecules = {
    ELEMENTS: ELEMENTS,
    MOLECULE_DEFS: MOLECULE_DEFS,
    MOLECULE_INFO: MOLECULE_INFO,
    parseAtomCell: parseAtomCell,
    getMoleculeAtoms: getMoleculeAtoms,
    getMoleculeDimensions: getMoleculeDimensions,

    getSlugList: function () {
      var slugs = [];
      for (var key in MOLECULE_DEFS) {
        if (MOLECULE_DEFS.hasOwnProperty(key)) {
          slugs.push(key);
        }
      }
      return slugs;
    },

    getElement: function (symbol) {
      return ELEMENTS[symbol] || null;
    },

    getInfo: function (slug) {
      return MOLECULE_INFO[slug] || null;
    }
  };

  window.Molecules = Molecules;
})();

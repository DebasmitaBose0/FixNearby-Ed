/**
 * Smart Material & Labor Estimator — Config & Formula Engine
 * Each profession entry defines:
 *  - fields:   input descriptors rendered by SmartEstimator.jsx
 *  - calculate: pure function (inputs, hourlyRate) → EstimateResult
 *
 * EstimateResult shape:
 * {
 *   materials:   [{ name, qty, unit, unitCost, subtotal }],
 *   laborHours:  number,
 *   laborCost:   number,
 *   materialCost:number,
 *   totalCost:   number,
 *   summary:     string,   // short human-readable line e.g. "2.1 gal Paint | 3.5 hrs Labor"
 * }
 */

export const ESTIMATOR_CONFIG = {
  // ─── PAINTER ────────────────────────────────────────────────────────────────
  Painter: {
    icon: "🎨",
    description: "Estimates paint quantity and labor for interior wall painting.",
    fields: [
      { key: "width",  label: "Wall Width",       unit: "ft",    type: "number", min: 5,  max: 100, default: 12, step: 0.5 },
      { key: "height", label: "Wall Height",      unit: "ft",    type: "number", min: 6,  max: 20,  default: 9,  step: 0.5 },
      { key: "walls",  label: "Number of Walls",  unit: "walls", type: "number", min: 1,  max: 20,  default: 4,  step: 1   },
      { key: "coats",  label: "Coats of Paint",   unit: "coats", type: "number", min: 1,  max: 4,   default: 2,  step: 1   },
    ],
    calculate({ width, height, walls, coats }, hourlyRate) {
      const totalArea   = width * height * walls;             // sq ft
      const paintGal    = parseFloat(((totalArea * coats) / 350).toFixed(2));  // ~350 sqft/gal
      const primerGal   = parseFloat((totalArea / 400).toFixed(2));            // primer ~400 sqft/gal
      const laborHours  = parseFloat(((totalArea / 100) * 1.5 * coats).toFixed(2));

      const paintCost   = parseFloat((paintGal  * 32).toFixed(2));  // $32/gal
      const primerCost  = parseFloat((primerGal * 18).toFixed(2));  // $18/gal
      const laborCost   = parseFloat((laborHours * hourlyRate).toFixed(2));
      const materialCost = parseFloat((paintCost + primerCost).toFixed(2));
      const totalCost   = parseFloat((materialCost + laborCost).toFixed(2));

      return {
        materials: [
          { name: "Paint",  qty: paintGal,  unit: "gal", unitCost: 32, subtotal: paintCost  },
          { name: "Primer", qty: primerGal, unit: "gal", unitCost: 18, subtotal: primerCost },
        ],
        laborHours,
        laborCost,
        materialCost,
        totalCost,
        summary: `${paintGal} gal Paint | ${laborHours} hrs Labor`,
      };
    },
  },

  // ─── PLUMBER ────────────────────────────────────────────────────────────────
  Plumber: {
    icon: "🔧",
    description: "Estimates pipe material and labor for plumbing work.",
    fields: [
      { key: "pipeLength", label: "Pipe Length",          unit: "ft",       type: "number", min: 0,  max: 500, default: 20, step: 1 },
      { key: "fixtures",   label: "Fixtures to Replace",  unit: "fixtures", type: "number", min: 0,  max: 20,  default: 2,  step: 1 },
      { key: "leaks",      label: "Active Leaks",         unit: "leaks",    type: "number", min: 0,  max: 10,  default: 1,  step: 1 },
      { key: "shutoffs",   label: "Shut-off Valves",      unit: "valves",   type: "number", min: 0,  max: 10,  default: 1,  step: 1 },
    ],
    calculate({ pipeLength, fixtures, leaks, shutoffs }, hourlyRate) {
      const pipeCost     = parseFloat((pipeLength * 4.5).toFixed(2));    // $4.50/ft
      const fixtureCost  = parseFloat((fixtures   * 45).toFixed(2));    // $45/fixture
      const valveCost    = parseFloat((shutoffs   * 18).toFixed(2));    // $18/valve
      const sealantCost  = leaks > 0 ? parseFloat((leaks * 8).toFixed(2)) : 0; // $8/leak

      const laborHours  = parseFloat((2 + leaks * 0.5 + fixtures * 1.2 + shutoffs * 0.5).toFixed(2));
      const laborCost   = parseFloat((laborHours * hourlyRate).toFixed(2));
      const materialCost = parseFloat((pipeCost + fixtureCost + valveCost + sealantCost).toFixed(2));
      const totalCost   = parseFloat((materialCost + laborCost).toFixed(2));

      const materials = [
        { name: "Pipe",     qty: pipeLength, unit: "ft",       unitCost: 4.5,  subtotal: pipeCost    },
        { name: "Fixtures", qty: fixtures,   unit: "pcs",      unitCost: 45,   subtotal: fixtureCost },
        { name: "Valves",   qty: shutoffs,   unit: "pcs",      unitCost: 18,   subtotal: valveCost   },
      ];
      if (leaks > 0) materials.push({ name: "Sealant", qty: leaks, unit: "kits", unitCost: 8, subtotal: sealantCost });

      return {
        materials,
        laborHours,
        laborCost,
        materialCost,
        totalCost,
        summary: `${pipeLength} ft Pipe | ${fixtures} Fixtures | ${laborHours} hrs Labor`,
      };
    },
  },

  // ─── ELECTRICIAN ────────────────────────────────────────────────────────────
  Electrician: {
    icon: "⚡",
    description: "Estimates wiring material and labor for electrical work.",
    fields: [
      { key: "points",   label: "Electrical Points",  unit: "points",  type: "number", min: 1,  max: 50,  default: 5,  step: 1 },
      { key: "switches", label: "Switches / Sockets", unit: "pcs",     type: "number", min: 0,  max: 30,  default: 3,  step: 1 },
      { key: "panels",   label: "Circuit Panels",     unit: "panels",  type: "number", min: 0,  max: 5,   default: 1,  step: 1 },
      { key: "fixtures", label: "Light Fixtures",     unit: "pcs",     type: "number", min: 0,  max: 20,  default: 4,  step: 1 },
    ],
    calculate({ points, switches, panels, fixtures }, hourlyRate) {
      const wireFt      = points * 15;
      const wireCost    = parseFloat((wireFt    * 1.2).toFixed(2));   // $1.20/ft
      const switchCost  = parseFloat((switches  * 12).toFixed(2));   // $12/switch
      const panelCost   = parseFloat((panels    * 120).toFixed(2));  // $120/panel
      const fixtureCost = parseFloat((fixtures  * 25).toFixed(2));   // $25/fixture

      const laborHours  = parseFloat((points * 1.5 + panels * 2 + fixtures * 0.5).toFixed(2));
      const laborCost   = parseFloat((laborHours * hourlyRate).toFixed(2));
      const materialCost = parseFloat((wireCost + switchCost + panelCost + fixtureCost).toFixed(2));
      const totalCost   = parseFloat((materialCost + laborCost).toFixed(2));

      return {
        materials: [
          { name: "Wiring",    qty: wireFt,   unit: "ft",   unitCost: 1.2,  subtotal: wireCost    },
          { name: "Switches",  qty: switches, unit: "pcs",  unitCost: 12,   subtotal: switchCost  },
          { name: "Panels",    qty: panels,   unit: "pcs",  unitCost: 120,  subtotal: panelCost   },
          { name: "Fixtures",  qty: fixtures, unit: "pcs",  unitCost: 25,   subtotal: fixtureCost },
        ],
        laborHours,
        laborCost,
        materialCost,
        totalCost,
        summary: `${wireFt} ft Wire | ${fixtures} Fixtures | ${laborHours} hrs Labor`,
      };
    },
  },

  // ─── CARPENTER ──────────────────────────────────────────────────────────────
  Carpenter: {
    icon: "🪚",
    description: "Estimates wood material and labor for carpentry projects.",
    fields: [
      { key: "pieces",   label: "Furniture / Pieces",  unit: "pcs",   type: "number", min: 1,  max: 20,  default: 2,  step: 1   },
      { key: "sqft",     label: "Wood Area per Piece", unit: "sqft",  type: "number", min: 4,  max: 100, default: 20, step: 1   },
      { key: "hardware", label: "Hardware Sets",       unit: "sets",  type: "number", min: 0,  max: 20,  default: 2,  step: 1   },
      { key: "finish",   label: "Finishing Coats",     unit: "coats", type: "number", min: 1,  max: 3,   default: 2,  step: 1   },
    ],
    calculate({ pieces, sqft, hardware, finish }, hourlyRate) {
      const woodCost     = parseFloat((pieces * sqft * 3.5).toFixed(2));   // $3.50/sqft
      const hardwareCost = parseFloat((hardware * 22).toFixed(2));         // $22/set
      const finishCost   = parseFloat((pieces * finish * 8).toFixed(2));   // $8/coat/piece

      const laborHours  = parseFloat((pieces * 2.5 + hardware * 0.5).toFixed(2));
      const laborCost   = parseFloat((laborHours * hourlyRate).toFixed(2));
      const materialCost = parseFloat((woodCost + hardwareCost + finishCost).toFixed(2));
      const totalCost   = parseFloat((materialCost + laborCost).toFixed(2));

      return {
        materials: [
          { name: "Wood",     qty: pieces * sqft, unit: "sqft", unitCost: 3.5, subtotal: woodCost     },
          { name: "Hardware", qty: hardware,       unit: "sets", unitCost: 22,  subtotal: hardwareCost },
          { name: "Finish",   qty: pieces * finish,unit: "coats",unitCost: 8,   subtotal: finishCost  },
        ],
        laborHours,
        laborCost,
        materialCost,
        totalCost,
        summary: `${pieces * sqft} sqft Wood | ${hardware} Hardware Sets | ${laborHours} hrs Labor`,
      };
    },
  },

  // ─── CLEANER ────────────────────────────────────────────────────────────────
  Cleaner: {
    icon: "🧹",
    description: "Estimates cleaning supplies and labor for home cleaning.",
    fields: [
      { key: "rooms",    label: "Rooms to Clean",     unit: "rooms",   type: "number", min: 1, max: 20, default: 3,  step: 1 },
      { key: "bathrooms",label: "Bathrooms",          unit: "baths",   type: "number", min: 0, max: 10, default: 1,  step: 1 },
      { key: "deepClean",label: "Deep Clean Rooms",   unit: "rooms",   type: "number", min: 0, max: 10, default: 1,  step: 1 },
      { key: "windows",  label: "Windows",            unit: "windows", type: "number", min: 0, max: 30, default: 4,  step: 1 },
    ],
    calculate({ rooms, bathrooms, deepClean, windows }, hourlyRate) {
      const suppliesCost  = parseFloat(((rooms + bathrooms) * 8).toFixed(2));  // $8/room
      const deepCleanCost = parseFloat((deepClean * 15).toFixed(2));           // $15/room
      const windowCost    = parseFloat((windows * 3).toFixed(2));              // $3/window

      const laborHours  = parseFloat((rooms * 1.5 + bathrooms * 0.75 + deepClean * 1.0 + windows * 0.25).toFixed(2));
      const laborCost   = parseFloat((laborHours * hourlyRate).toFixed(2));
      const materialCost = parseFloat((suppliesCost + deepCleanCost + windowCost).toFixed(2));
      const totalCost   = parseFloat((materialCost + laborCost).toFixed(2));

      return {
        materials: [
          { name: "Supplies",   qty: rooms + bathrooms, unit: "rooms", unitCost: 8,  subtotal: suppliesCost  },
          { name: "Deep Clean", qty: deepClean,          unit: "rooms", unitCost: 15, subtotal: deepCleanCost },
          { name: "Window Kit", qty: windows,            unit: "pcs",  unitCost: 3,  subtotal: windowCost    },
        ],
        laborHours,
        laborCost,
        materialCost,
        totalCost,
        summary: `${rooms + bathrooms} Rooms | ${windows} Windows | ${laborHours} hrs Labor`,
      };
    },
  },
};

/**
 * Returns the config for a given profession string.
 * Falls back to null if the profession is not supported.
 */
export function getEstimatorConfig(profession) {
  return ESTIMATOR_CONFIG[profession] ?? null;
}

/**
 * Parses a price string like "$45/hr" → 45
 */
export function parseHourlyRate(priceString) {
  const match = String(priceString).match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 40;
}

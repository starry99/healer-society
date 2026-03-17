import {
  GLOBAL_AUTO_MANA_REGEN_PCT_OF_MAX_PER_TICK,
  GLOBAL_AUTO_MANA_REGEN_TICK_MS,
  GLOBAL_HEALER_SCALING
} from "../../components/simulators/healerPracticeGlobalSettings";
import {
  HOLY_PALADIN_ADDED_TALENT_TOGGLES,
  HOLY_PALADIN_DIVINE_PURPOSE_CONFIG,
  HOLY_PALADIN_PRACTICE_TUNING as SHARED_HOLY_PALADIN_PRACTICE_TUNING
} from "../../components/simulators/holyPaladinPracticeSettings";

const BASE_GCD_MS = 1500;
const MAX_HOLY_POWER = 5;
const AVENGING_WRATH_DURATION_MS = 30000;
const AVENGING_WRATH_HEAL_MULTIPLIER = 1.15;
const AVENGING_WRATH_CRIT_CHANCE_BONUS = 0.15;
const AURA_MASTERY_DURATION_MS = 8000;
const AURA_MASTERY_DAMAGE_REDUCTION = 0.12;
const BEACON_OF_LIGHT_BASE_TRANSFER_RATIO = 0.15;
const BEACON_OF_FAITH_REDUCTION_WHEN_ACTIVE = 0.3;
const LIGHT_OF_DAWN_ALL_BEACON_TRANSFER_RATIO = 0.5;
const ETERNAL_FLAME_DURATION_MS = 12000;
const ETERNAL_FLAME_TICK_MS = 2000;
const DIVINE_BLESSING_DURATION_MS = 8000;
const DIVINE_BLESSING_DAMAGE_REDUCTION = 0.4;
const DIVINE_PROTECTION_DURATION_MS = 8000;
const DIVINE_PROTECTION_DAMAGE_REDUCTION = 0.2;
const DIVINE_PROTECTION_HEALING_TAKEN_MULTIPLIER = 1.15;
const DEFAULT_BEACON_OF_SAVIOR_TRANSFER_RATIO = 0.25;
const BEACON_OF_SAVIOR_DIRECT_HEAL_MULTIPLIER = 1.2;
const BEACON_OF_SAVIOR_LOW_HEALTH_THRESHOLD = 0.5;
const BEACON_OF_SAVIOR_SHIELD_INTERVAL_MS = 8000;
const DEFAULT_BEACON_OF_SAVIOR_SHIELD_AMOUNT_COEFFICIENT = 0.25;
const BEACON_OF_SAVIOR_DAMAGE_REDUCTION = 0.1;
const BEACON_OF_SAVIOR_DAMAGE_REDUCTION_DURATION_MS = 15000;
const DAMAGE_EVENT_MIN_MS = 420;
const DAMAGE_EVENT_MAX_MS = 980;
const AVERAGE_DAMAGE_EVENT_INTERVAL_MS = (DAMAGE_EVENT_MIN_MS + DAMAGE_EVENT_MAX_MS) * 0.5;
const DAMAGE_SPIKE_CHANCE = 0.14;
const DAMAGE_EVENT_BUDGET_JITTER = 0.28;
const DEFAULT_DAMAGE_BREAK_EVERY_MS = 0;
const DEFAULT_DAMAGE_BREAK_DURATION_MS = 0;
const DEFAULT_DAMAGE_BUDGET_BASE_RATE_PER_SEC = 0.7;
const HOLY_SHOCK_MAX_CHARGES = 2;
const DEFAULT_TANK_INCOMING_DAMAGE_MULTIPLIER = 1.5;
const DEFAULT_INFUSION_OF_LIGHT_PROC_CHANCE = 0.1;
const DEFAULT_INFUSION_OF_LIGHT_DURATION_MS = 15000;
const DEFAULT_INFUSION_OF_LIGHT_FLASH_OF_LIGHT_HEAL_MULTIPLIER = 2;
const DEFAULT_INFUSION_OF_LIGHT_TALENT_ENABLED = true;
const DEFAULT_DIVINE_PURPOSE_TALENT_ENABLED = HOLY_PALADIN_ADDED_TALENT_TOGGLES.divinePurpose !== false;
const DEFAULT_DIVINE_PURPOSE_PROC_CHANCE = Math.max(0, Number(HOLY_PALADIN_DIVINE_PURPOSE_CONFIG.procChance ?? 0.15));
const DEFAULT_DIVINE_PURPOSE_HEAL_BONUS_RATIO = Math.max(0, Number(HOLY_PALADIN_DIVINE_PURPOSE_CONFIG.healBonusPct ?? 0.15));
const DEFAULT_DIVINE_PURPOSE_DURATION_MS = Math.max(0, Number(HOLY_PALADIN_DIVINE_PURPOSE_CONFIG.durationMs ?? 12000));
const DEFAULT_HOLY_REVELATION_TALENT_ENABLED = true;
const DEFAULT_HOLY_REVELATION_INFUSED_FLASH_OF_LIGHT_HEAL_BONUS_RATIO = 0.2;
const DEFAULT_RADIANT_LIGHT_TALENT_ENABLED = true;
const DEFAULT_RADIANT_LIGHT_HOLY_LIGHT_SPLASH_RATIO = 0.08;
const DEFAULT_RADIANT_LIGHT_TARGET_COUNT = 5;
const DEFAULT_UNFADING_LIGHT_TALENT_ENABLED = true;
const UNFADING_LIGHT_LIGHT_OF_DAWN_MASTERY_EFFECT_MULTIPLIER = 1.2;
const DEFAULT_EXTRICATION_TALENT_ENABLED = true;
const DEFAULT_HAND_OF_FAITH_TALENT_ENABLED = true;
const HAND_OF_FAITH_CHARGES_ON_AVENGING_WRATH = 2;
const HAND_OF_FAITH_DURATION_MS = 20000;
const HAND_OF_FAITH_HOLY_LIGHT_MANA_COST_MULTIPLIER = 0.5;
const DEFAULT_DAWNLIGHT_TALENT_ENABLED = true;
const DEFAULT_DAWNLIGHT_CHARGES_FROM_DIVINE_TOLL = 2;
const DEFAULT_DAWNLIGHT_EMPOWERMENT_DURATION_MS = 30000;
const DEFAULT_DAWNLIGHT_TOTAL_HEAL_RATIO = 5.382;
const DEFAULT_DAWNLIGHT_DURATION_MS = 8000;
const DEFAULT_DAWNLIGHT_TICK_MS = 1000;
const DEFAULT_SUN_SEAR_TALENT_ENABLED = true;
const DEFAULT_RECLAMATION_TALENT_ENABLED = true;
const DEFAULT_RECLAMATION_MAX_MISSING_HEALTH_HEAL_BONUS_RATIO = 0.5;
const DEFAULT_RECLAMATION_MAX_MANA_REFUND_RATIO = 0.1;
const DEFAULT_GLORIOUS_DAWN_TALENT_ENABLED = true;
const DEFAULT_ARCHANGELS_BARRIER_TALENT_ENABLED = true;
const DEFAULT_BEACON_OF_SAVIOR_TALENT_ENABLED = true;
const DEFAULT_LIGHT_OF_MARTYR_TALENT_ENABLED = true;
const DEFAULT_LIGHT_OF_MARTYR_SELF_HP_THRESHOLD = 0.7;
const DEFAULT_LIGHT_OF_MARTYR_HOLY_SHOCK_HEAL_BONUS_RATIO = 0.35;
const DEFAULT_BENEVOLENT_HEALER_TALENT_ENABLED = true;
const DEFAULT_BENEVOLENT_HEALER_SELF_HEAL_RATIO = 0.1;
const DEFAULT_SECOND_SUNRISE_TALENT_ENABLED = true;
const DEFAULT_SECOND_SUNRISE_EFFECTIVENESS_RATIO = 0.15;
const DEFAULT_SEASON_ONE_TIER_TALENT_ENABLED = HOLY_PALADIN_ADDED_TALENT_TOGGLES.seasonOneTier !== false;
const DEFAULT_SEASON_ONE_TIER_HOLY_SHOCK_HEALING_BONUS_RATIO = Math.max(
  0,
  Number(SHARED_HOLY_PALADIN_PRACTICE_TUNING.seasonOneTier?.holyShockHealingBonusPct ?? 0.15)
);
const DEFAULT_SEASON_ONE_TIER_HOLY_SHOCK_BEACON_OF_LIGHT_ADDITIONAL_TRANSFER_RATIO = Math.max(
  0,
  Number(SHARED_HOLY_PALADIN_PRACTICE_TUNING.seasonOneTier?.holyShockAdditionalBeaconOfLightTransferPct ?? 0.2)
);
const DEFAULT_TRIAGE_HEALTH_THRESHOLD_PCT = 30;
const DEFAULT_TRIAGE_MIN_EFFECTIVE_HEAL_PCT = 10;
const DEFAULT_BASE_CRIT_CHANCE = 0.3;
const DEFAULT_HASTE_PCT = 0;
const DEFAULT_INTELLECT = 10000;
const DEFAULT_MASTERY_PCT = 0;
const DEFAULT_CRIT_HEAL_MULTIPLIER = 2;
const DEFAULT_HOLY_SHOCK_CRIT_CHANCE_BONUS = 0.08;
const DEFAULT_HOLY_SHOCK_CRIT_HEAL_MULTIPLIER = 2.2;
const DEFAULT_FLASH_OF_LIGHT_CRIT_HEAL_MULTIPLIER = 2.2;
const DEFAULT_ETERNAL_FLAME_CRIT_CHANCE_BONUS_AT_ZERO_HP = 0.3;
const DEFAULT_SUN_SEAR_ENABLED = true;
const DEFAULT_SUN_SEAR_TOTAL_HEAL_RATIO = 0.54;
const DEFAULT_SUN_SEAR_DURATION_MS = 4000;
const DEFAULT_SUN_SEAR_TICK_MS = 1000;
const INFUSION_OF_LIGHT_MAX_CHARGES = 2;
const INFUSION_OF_LIGHT_CHARGES_PER_PROC = 2;
const INFUSION_OF_LIGHT_HOLY_SHOCK_COOLDOWN_REDUCTION_MS = 1000;
const GLORIOUS_DAWN_PROC_CHANCE = 0.12;
const GLORIOUS_DAWN_HEAL_MULTIPLIER = 1.1;
const ARCHANGELS_BARRIER_SHIELD_RATIO = 0.15;
const DEFAULT_LEECH_HEALING_RATIO = 0.06;
const DEFAULT_SPELL_QUEUE_WINDOW_MS = 400;
const SELF_PLAYER_NAME = "나";

export const HOLY_PALADIN_PRACTICE_TUNING = SHARED_HOLY_PALADIN_PRACTICE_TUNING;

function getHealAmount(spellKey) {
  const coefficient = Number(HOLY_PALADIN_PRACTICE_TUNING.healAmountCoefficients?.[spellKey]);
  const baseAmount = Number.isFinite(coefficient) ? coefficient : 0;
  const scale = Math.max(0, Number(GLOBAL_HEALER_SCALING.intellectToHealingScale ?? 1) || 1);
  return baseAmount * scale;
}

function getManaCost(spellKey) {
  const fixedOverride = Number(HOLY_PALADIN_PRACTICE_TUNING.manaCostFixedOverrides?.[spellKey]);
  const ratio = Number(HOLY_PALADIN_PRACTICE_TUNING.manaCostBaseManaRatios?.[spellKey]);
  const baseMana = Math.max(1, Number(HOLY_PALADIN_PRACTICE_TUNING.baseMana ?? 100000));
  const legacyCost = Number(HOLY_PALADIN_PRACTICE_TUNING.manaCosts?.[spellKey]);
  const resolvedCost = Number.isFinite(fixedOverride)
    ? fixedOverride
    : Number.isFinite(ratio)
      ? baseMana * ratio
      : Number.isFinite(legacyCost)
        ? legacyCost
        : 0;
  const baseCost = Math.max(0, resolvedCost);
  const scale = Math.max(0, Number(GLOBAL_HEALER_SCALING.manaCostScale ?? 1) || 1);
  return baseCost * scale;
}

function getCastTimeMs(spellKey, fallbackMs = 0) {
  const configured = Number(HOLY_PALADIN_PRACTICE_TUNING.castTimesMs?.[spellKey]);
  if (Number.isFinite(configured)) {
    return Math.max(0, configured);
  }
  return Math.max(0, Number(fallbackMs) || 0);
}

export const HOLY_PALADIN_PRACTICE_SPELLS = Object.freeze({
  holyShock: {
    key: "holyShock",
    name: "신성충격",
    requiresTarget: true,
    castTimeMs: 0,
    canMoveWhileCasting: true,
    cooldownMs: 7500,
    manaCost: getManaCost("holyShock"),
    holyPowerCost: 0,
    active: true,
    clickCastable: true
  },
  flashOfLight: {
    key: "flashOfLight",
    name: "빛의 섬광",
    requiresTarget: true,
    castTimeMs: getCastTimeMs("flashOfLight", 1500),
    canMoveWhileCasting: false,
    cooldownMs: 0,
    manaCost: getManaCost("flashOfLight"),
    holyPowerCost: 0,
    active: true,
    clickCastable: true
  },
  judgment: {
    key: "judgment",
    name: "심판",
    requiresTarget: false,
    castTimeMs: 0,
    canMoveWhileCasting: true,
    cooldownMs: 12000,
    manaCost: getManaCost("judgment"),
    holyPowerCost: 0,
    active: true,
    clickCastable: false
  },
  holyLight: {
    key: "holyLight",
    name: "성스러운 빛",
    requiresTarget: true,
    castTimeMs: getCastTimeMs("holyLight", 2500),
    canMoveWhileCasting: false,
    cooldownMs: 0,
    manaCost: getManaCost("holyLight"),
    holyPowerCost: 0,
    active: true,
    clickCastable: true
  },
  lightOfDawn: {
    key: "lightOfDawn",
    name: "여명의 빛",
    requiresTarget: false,
    castTimeMs: 0,
    canMoveWhileCasting: true,
    cooldownMs: 0,
    manaCost: getManaCost("lightOfDawn"),
    holyPowerCost: 3,
    active: true,
    clickCastable: false
  },
  eternalFlame: {
    key: "eternalFlame",
    name: "영원의 불꽃",
    requiresTarget: true,
    castTimeMs: 0,
    canMoveWhileCasting: true,
    cooldownMs: 0,
    manaCost: getManaCost("eternalFlame"),
    holyPowerCost: 3,
    active: true,
    clickCastable: true
  },
  divineBlessing: {
    key: "divineBlessing",
    name: "신의 축복",
    requiresTarget: true,
    castTimeMs: 0,
    canMoveWhileCasting: true,
    cooldownMs: 0,
    manaCost: getManaCost("divineBlessing"),
    holyPowerCost: 0,
    active: true,
    clickCastable: true
  },
  beaconOfLight: {
    key: "beaconOfLight",
    name: "빛의 봉화",
    requiresTarget: true,
    castTimeMs: 0,
    canMoveWhileCasting: true,
    cooldownMs: 0,
    manaCost: 0,
    holyPowerCost: 0,
    active: false,
    clickCastable: false,
    preCombatOnly: true
  },
  beaconOfFaith: {
    key: "beaconOfFaith",
    name: "신념의 봉화",
    requiresTarget: true,
    castTimeMs: 0,
    canMoveWhileCasting: true,
    cooldownMs: 0,
    manaCost: 0,
    holyPowerCost: 0,
    active: false,
    clickCastable: false,
    preCombatOnly: true
  },
  divineToll: {
    key: "divineToll",
    name: "천상의 종",
    requiresTarget: false,
    castTimeMs: 0,
    canMoveWhileCasting: true,
    cooldownMs: 30000,
    manaCost: getManaCost("divineToll"),
    holyPowerCost: 0,
    active: true,
    clickCastable: false
  },
  avengingWrath: {
    key: "avengingWrath",
    name: "응징의 격노",
    requiresTarget: false,
    castTimeMs: 0,
    canMoveWhileCasting: true,
    cooldownMs: 120000,
    manaCost: getManaCost("avengingWrath"),
    holyPowerCost: 0,
    active: true,
    clickCastable: false,
    triggersGlobalCooldown: false
  },
  auraMastery: {
    key: "auraMastery",
    name: "오라숙련",
    requiresTarget: false,
    castTimeMs: 0,
    canMoveWhileCasting: true,
    cooldownMs: 180000,
    manaCost: getManaCost("auraMastery"),
    holyPowerCost: 0,
    active: true,
    clickCastable: false
  },
  divineProtection: {
    key: "divineProtection",
    name: "신의 가호",
    requiresTarget: false,
    castTimeMs: 0,
    canMoveWhileCasting: true,
    cooldownMs: 60000,
    manaCost: getManaCost("divineProtection"),
    holyPowerCost: 0,
    active: true,
    clickCastable: false,
    triggersGlobalCooldown: false
  }
});

export const HOLY_PALADIN_ACTIVE_SPELL_KEYS = Object.freeze(
  Object.values(HOLY_PALADIN_PRACTICE_SPELLS)
    .filter((spell) => spell.active)
    .map((spell) => spell.key)
);

export const HOLY_PALADIN_CLICK_CASTABLE_KEYS = Object.freeze(
  Object.values(HOLY_PALADIN_PRACTICE_SPELLS)
    .filter((spell) => spell.active && spell.clickCastable)
    .map((spell) => spell.key)
);

const HEALING_METRIC_SPELL_KEYS = Object.freeze([
  ...HOLY_PALADIN_ACTIVE_SPELL_KEYS,
  "eternalFlameTick",
  "dawnlight",
  "sunSear",
  "benevolentHealer",
  "beaconTransfer",
  "beaconOfSaviorTransfer",
  "beaconOfSaviorShield",
  "leech"
]);

export const HOLY_PALADIN_DEFAULT_KEYBINDS = Object.freeze({
  holyShock: "1",
  eternalFlame: "2",
  judgment: "F",
  flashOfLight: "R",
  holyLight: "3",
  lightOfDawn: "T",
  divineBlessing: "X",
  divineToll: "G",
  avengingWrath: "C",
  auraMastery: "V",
  divineProtection: "Z"
});

export const MIN_RAID_SIZE = 20;

const FALLBACK_NAMES = [
  "연습대상-01",
  "연습대상-02",
  "연습대상-03",
  "연습대상-04",
  "연습대상-05",
  "연습대상-06",
  "연습대상-07",
  "연습대상-08",
  "연습대상-09",
  "연습대상-10",
  "연습대상-11",
  "연습대상-12",
  "연습대상-13",
  "연습대상-14",
  "연습대상-15",
  "연습대상-16",
  "연습대상-17",
  "연습대상-18",
  "연습대상-19",
  "연습대상-20",
  "연습대상-21",
  "연습대상-22",
  "연습대상-23",
  "연습대상-24",
  "연습대상-25",
  "연습대상-26",
  "연습대상-27",
  "연습대상-28",
  "연습대상-29",
  "연습대상-30"
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function createRng(seed) {
  let state = Math.floor(seed) >>> 0;
  if (!state) {
    state = 0x6d2b79f5;
  }
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomRange(rng, min, max) {
  return min + (max - min) * rng();
}

function randomInt(rng, min, max) {
  return Math.floor(randomRange(rng, min, max + 1));
}

function uniqueNamesFromInput(namePool) {
  if (!Array.isArray(namePool)) {
    return [];
  }
  const seen = new Set();
  const output = [];
  for (const rawName of namePool) {
    const value = String(rawName ?? "").trim();
    if (!value || seen.has(value)) {
      continue;
    }
    seen.add(value);
    output.push(value);
  }
  return output;
}

function pickDistinctRandom(values, count, rng) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(rng, 0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

function sampleWithoutReplacement(items, count, rng) {
  if (count <= 0) {
    return [];
  }
  if (count >= items.length) {
    return [...items];
  }
  return pickDistinctRandom(items, count, rng);
}

function fmtSigned(value) {
  const rounded = Math.abs(value) >= 10 ? Math.round(value) : round(value, 1);
  return rounded >= 0 ? `+${rounded}` : `${rounded}`;
}

function parseSeed(value) {
  if (Number.isFinite(value)) {
    return Math.floor(value);
  }
  return Math.floor(Math.random() * 2147483647);
}

function normalizeScheduledRaidBursts(patterns, durationMs = 0) {
  if (!Array.isArray(patterns) || !patterns.length) {
    return [];
  }
  const durationLimitMs = Math.max(0, Number(durationMs) || 0);
  const normalized = [];
  for (let index = 0; index < patterns.length; index += 1) {
    const pattern = patterns[index];
    if (!pattern || pattern.enabled === false) {
      continue;
    }

    const startAtMsRaw = Number(pattern.startAtMs);
    const startAtSecRaw = Number(pattern.startAtSec);
    const tickIntervalMsRaw = Number(pattern.tickIntervalMs);
    const tickIntervalSecRaw = Number(pattern.tickIntervalSec);
    const tickCountRaw = Number(pattern.tickCount ?? pattern.ticks ?? 1);
    const damagePerTickRaw = Number(pattern.damagePerTick ?? pattern.damage ?? 0);

    const startAtMs = Number.isFinite(startAtMsRaw)
      ? startAtMsRaw
      : Number.isFinite(startAtSecRaw)
        ? startAtSecRaw * 1000
        : 0;
    const tickIntervalMs = Number.isFinite(tickIntervalMsRaw)
      ? tickIntervalMsRaw
      : Number.isFinite(tickIntervalSecRaw)
        ? tickIntervalSecRaw * 1000
        : 1000;
    const tickCount = Math.max(1, Math.floor(tickCountRaw));
    const damagePerTick = Math.max(0, damagePerTickRaw);
    if (damagePerTick <= 0) {
      continue;
    }

    const safeStartAtMs = Math.max(0, Math.floor(startAtMs));
    const safeTickIntervalMs = Math.max(1, Math.floor(tickIntervalMs));
    if (durationLimitMs > 0 && safeStartAtMs >= durationLimitMs) {
      continue;
    }

    normalized.push(
      Object.freeze({
        id: String(pattern.id ?? `burst-${index + 1}`),
        startAtMs: safeStartAtMs,
        tickIntervalMs: safeTickIntervalMs,
        tickCount,
        damagePerTick
      })
    );
  }
  return normalized;
}

function createHealingBySpellMetrics() {
  const metrics = {};
  for (const spellKey of HEALING_METRIC_SPELL_KEYS) {
    metrics[spellKey] = 0;
  }
  return metrics;
}

export function parseCandidateNamePool(rawText) {
  return uniqueNamesFromInput(String(rawText ?? "").split(/[\n,]+/));
}

export function buildRandomRaidRoster(namePool, raidSize = MIN_RAID_SIZE, seed = Date.now()) {
  const rng = createRng(parseSeed(seed));
  const uniqueNames = uniqueNamesFromInput(namePool);
  const normalizedPool = [...uniqueNames];

  for (const fallback of FALLBACK_NAMES) {
    if (normalizedPool.length >= raidSize) {
      break;
    }
    if (!normalizedPool.includes(fallback)) {
      normalizedPool.push(fallback);
    }
  }

  let suffix = 1;
  while (normalizedPool.length < raidSize) {
    const generated = `연습대상-${String(suffix).padStart(2, "0")}`;
    if (!normalizedPool.includes(generated)) {
      normalizedPool.push(generated);
    }
    suffix += 1;
  }

  const picked = pickDistinctRandom(normalizedPool, raidSize, rng);
  return picked.map((name, index) => ({
    id: `raid-${index + 1}`,
    name
  }));
}

export class HolyPaladinPracticeEngine {
  constructor(config = {}) {
    const seed = parseSeed(config.seed);
    this.seed = seed;
    this.rng = createRng(seed);

    this.baseHealth = Math.max(1, Number(config.dummyBaseHealth ?? HOLY_PALADIN_PRACTICE_TUNING.dummyBaseHealth));
    this.maxMana = Math.max(0, Number(config.baseMana ?? HOLY_PALADIN_PRACTICE_TUNING.baseMana));
    this.mana = this.maxMana;
    this.incomingDamageMultiplier = Math.max(0.1, Number(config.incomingDamageMultiplier ?? 1));
    this.damageBreakEveryMs = Math.max(0, Number(config.damageBreakEveryMs ?? DEFAULT_DAMAGE_BREAK_EVERY_MS));
    this.damageBreakDurationMs = Math.max(0, Number(config.damageBreakDurationMs ?? DEFAULT_DAMAGE_BREAK_DURATION_MS));
    if (this.damageBreakEveryMs > 0 && this.damageBreakDurationMs >= this.damageBreakEveryMs) {
      this.damageBreakDurationMs = Math.max(0, this.damageBreakEveryMs - 1);
    }
    this.damageBudgetBaseRatePerSec = Math.max(
      0,
      Number(config.damageBudgetBaseRatePerSec ?? DEFAULT_DAMAGE_BUDGET_BASE_RATE_PER_SEC)
    );
    this.tankIncomingDamageMultiplier = Math.max(
      0,
      Number(config.tankIncomingDamageMultiplier ?? DEFAULT_TANK_INCOMING_DAMAGE_MULTIPLIER)
    );
    this.infusionOfLightProcChance = clamp(
      Number(config.infusionOfLightProcChance ?? DEFAULT_INFUSION_OF_LIGHT_PROC_CHANCE),
      0,
      1
    );
    this.infusionOfLightTalentEnabled =
      config.infusionOfLightTalentEnabled !== false &&
      Boolean(config.infusionOfLightTalentEnabled ?? DEFAULT_INFUSION_OF_LIGHT_TALENT_ENABLED);
    this.divinePurposeTalentEnabled =
      config.divinePurposeTalentEnabled !== false &&
      Boolean(config.divinePurposeTalentEnabled ?? DEFAULT_DIVINE_PURPOSE_TALENT_ENABLED);
    this.divinePurposeProcChance = clamp(
      Number(config.divinePurposeProcChance ?? DEFAULT_DIVINE_PURPOSE_PROC_CHANCE),
      0,
      1
    );
    this.divinePurposeHealBonusRatio = Math.max(
      0,
      Number(config.divinePurposeHealBonusRatio ?? DEFAULT_DIVINE_PURPOSE_HEAL_BONUS_RATIO)
    );
    this.divinePurposeDurationMs = Math.max(
      0,
      Number(config.divinePurposeDurationMs ?? DEFAULT_DIVINE_PURPOSE_DURATION_MS)
    );
    this.handOfFaithTalentEnabled =
      config.handOfFaithTalentEnabled !== false &&
      Boolean(config.handOfFaithTalentEnabled ?? DEFAULT_HAND_OF_FAITH_TALENT_ENABLED);
    this.holyRevelationTalentEnabled =
      config.holyRevelationTalentEnabled !== false &&
      Boolean(config.holyRevelationTalentEnabled ?? DEFAULT_HOLY_REVELATION_TALENT_ENABLED);
    this.holyRevelationInfusedFlashOfLightHealBonusRatio = Math.max(
      0,
      Number(
        config.holyRevelationInfusedFlashOfLightHealBonusRatio ??
          DEFAULT_HOLY_REVELATION_INFUSED_FLASH_OF_LIGHT_HEAL_BONUS_RATIO
      )
    );
    this.radiantLightTalentEnabled =
      config.radiantLightTalentEnabled !== false &&
      Boolean(config.radiantLightTalentEnabled ?? DEFAULT_RADIANT_LIGHT_TALENT_ENABLED);
    this.unfadingLightTalentEnabled =
      config.unfadingLightTalentEnabled !== false &&
      Boolean(config.unfadingLightTalentEnabled ?? DEFAULT_UNFADING_LIGHT_TALENT_ENABLED);
    this.extricationTalentEnabled =
      config.extricationTalentEnabled !== false &&
      Boolean(config.extricationTalentEnabled ?? DEFAULT_EXTRICATION_TALENT_ENABLED);
    this.radiantLightHolyLightSplashRatio = Math.max(
      0,
      Number(config.radiantLightHolyLightSplashRatio ?? DEFAULT_RADIANT_LIGHT_HOLY_LIGHT_SPLASH_RATIO)
    );
    this.radiantLightTargetCount = Math.max(
      1,
      Math.floor(Number(config.radiantLightTargetCount ?? DEFAULT_RADIANT_LIGHT_TARGET_COUNT))
    );
    this.dawnlightTalentEnabled =
      config.dawnlightTalentEnabled !== false &&
      Boolean(config.dawnlightTalentEnabled ?? DEFAULT_DAWNLIGHT_TALENT_ENABLED);
    this.dawnlightChargesFromDivineToll = Math.max(
      1,
      Math.floor(Number(config.dawnlightChargesFromDivineToll ?? DEFAULT_DAWNLIGHT_CHARGES_FROM_DIVINE_TOLL))
    );
    this.dawnlightEmpowermentDurationMs = Math.max(
      0,
      Number(config.dawnlightEmpowermentDurationMs ?? DEFAULT_DAWNLIGHT_EMPOWERMENT_DURATION_MS)
    );
    this.dawnlightTotalHealRatio = Math.max(
      0,
      Number(config.dawnlightTotalHealRatio ?? DEFAULT_DAWNLIGHT_TOTAL_HEAL_RATIO)
    );
    this.dawnlightDurationMs = Math.max(0, Number(config.dawnlightDurationMs ?? DEFAULT_DAWNLIGHT_DURATION_MS));
    this.dawnlightTickMs = Math.max(100, Number(config.dawnlightTickMs ?? DEFAULT_DAWNLIGHT_TICK_MS));
    this.dawnlightTickCount = Math.max(1, Math.round(this.dawnlightDurationMs / this.dawnlightTickMs));
    this.infusionOfLightDurationMs = Math.max(
      0,
      Number(config.infusionOfLightDurationMs ?? DEFAULT_INFUSION_OF_LIGHT_DURATION_MS)
    );
    this.infusionOfLightFlashOfLightHealMultiplier = Math.max(
      1,
      Number(
        config.infusionOfLightFlashOfLightHealMultiplier ?? DEFAULT_INFUSION_OF_LIGHT_FLASH_OF_LIGHT_HEAL_MULTIPLIER
      )
    );
    this.baseCritChance = clamp(
      Number(config.baseCritChance ?? DEFAULT_BASE_CRIT_CHANCE),
      0,
      1
    );
    this.defaultCritHealMultiplier = Math.max(
      1,
      Number(config.defaultCritHealMultiplier ?? DEFAULT_CRIT_HEAL_MULTIPLIER)
    );
    this.holyShockCritChanceBonus = Math.max(
      0,
      Number(config.holyShockCritChanceBonus ?? DEFAULT_HOLY_SHOCK_CRIT_CHANCE_BONUS)
    );
    this.holyShockCritHealMultiplier = Math.max(
      1,
      Number(config.holyShockCritHealMultiplier ?? DEFAULT_HOLY_SHOCK_CRIT_HEAL_MULTIPLIER)
    );
    this.flashOfLightCritHealMultiplier = Math.max(
      1,
      Number(config.flashOfLightCritHealMultiplier ?? DEFAULT_FLASH_OF_LIGHT_CRIT_HEAL_MULTIPLIER)
    );
    this.eternalFlameCritChanceBonusAtZeroHp = Math.max(
      0,
      Number(config.eternalFlameCritChanceBonusAtZeroHp ?? DEFAULT_ETERNAL_FLAME_CRIT_CHANCE_BONUS_AT_ZERO_HP)
    );
    this.sunSearTalentEnabled =
      config.sunSearTalentEnabled !== false &&
      Boolean(config.sunSearTalentEnabled ?? DEFAULT_SUN_SEAR_TALENT_ENABLED);
    this.reclamationTalentEnabled =
      config.reclamationTalentEnabled !== false &&
      Boolean(config.reclamationTalentEnabled ?? DEFAULT_RECLAMATION_TALENT_ENABLED);
    this.reclamationMaxMissingHealthHealBonusRatio = Math.max(
      0,
      Number(
        config.reclamationMaxMissingHealthHealBonusRatio ??
          DEFAULT_RECLAMATION_MAX_MISSING_HEALTH_HEAL_BONUS_RATIO
      )
    );
    this.reclamationMaxManaRefundRatio = Math.max(
      0,
      Number(config.reclamationMaxManaRefundRatio ?? DEFAULT_RECLAMATION_MAX_MANA_REFUND_RATIO)
    );
    this.sunSearEnabled =
      this.sunSearTalentEnabled &&
      config.sunSearEnabled !== false &&
      Boolean(config.sunSearEnabled ?? DEFAULT_SUN_SEAR_ENABLED);
    this.sunSearTotalHealRatio = Math.max(
      0,
      Number(config.sunSearTotalHealRatio ?? DEFAULT_SUN_SEAR_TOTAL_HEAL_RATIO)
    );
    this.gloriousDawnTalentEnabled =
      config.gloriousDawnTalentEnabled !== false &&
      Boolean(config.gloriousDawnTalentEnabled ?? DEFAULT_GLORIOUS_DAWN_TALENT_ENABLED);
    this.archangelsBarrierTalentEnabled =
      config.archangelsBarrierTalentEnabled !== false &&
      Boolean(config.archangelsBarrierTalentEnabled ?? DEFAULT_ARCHANGELS_BARRIER_TALENT_ENABLED);
    this.beaconOfSaviorTalentEnabled =
      config.beaconOfSaviorTalentEnabled !== false &&
      Boolean(config.beaconOfSaviorTalentEnabled ?? DEFAULT_BEACON_OF_SAVIOR_TALENT_ENABLED);
    this.beaconOfSaviorTransferRatio = Math.max(
      0,
      Number(
        config.beaconOfSaviorTransferRatio ??
          HOLY_PALADIN_PRACTICE_TUNING.beaconOfSavior?.transferRatio ??
          DEFAULT_BEACON_OF_SAVIOR_TRANSFER_RATIO
      )
    );
    const configuredIntellectForLegacyShieldAmount = Math.max(
      1,
      Number(config.intellect ?? DEFAULT_INTELLECT)
    );
    const configuredBeaconOfSaviorShieldAmountCoefficient = Number(
      config.beaconOfSaviorShieldAmountCoefficient ??
        HOLY_PALADIN_PRACTICE_TUNING.beaconOfSavior?.shieldAmountCoefficient
    );
    const legacyBeaconOfSaviorShieldAmount = Number(
      config.beaconOfSaviorShieldAmount ??
        HOLY_PALADIN_PRACTICE_TUNING.beaconOfSavior?.shieldAmount
    );
    this.beaconOfSaviorShieldAmountCoefficient = Number.isFinite(configuredBeaconOfSaviorShieldAmountCoefficient)
      ? Math.max(0, configuredBeaconOfSaviorShieldAmountCoefficient)
      : Number.isFinite(legacyBeaconOfSaviorShieldAmount)
        ? Math.max(0, legacyBeaconOfSaviorShieldAmount / configuredIntellectForLegacyShieldAmount)
        : DEFAULT_BEACON_OF_SAVIOR_SHIELD_AMOUNT_COEFFICIENT;
    this.lightOfMartyrTalentEnabled =
      config.lightOfMartyrTalentEnabled !== false &&
      Boolean(config.lightOfMartyrTalentEnabled ?? DEFAULT_LIGHT_OF_MARTYR_TALENT_ENABLED);
    this.lightOfMartyrSelfHpThreshold = clamp(
      Number(config.lightOfMartyrSelfHpThreshold ?? DEFAULT_LIGHT_OF_MARTYR_SELF_HP_THRESHOLD),
      0,
      1
    );
    this.lightOfMartyrHolyShockHealBonusRatio = Math.max(
      0,
      Number(config.lightOfMartyrHolyShockHealBonusRatio ?? DEFAULT_LIGHT_OF_MARTYR_HOLY_SHOCK_HEAL_BONUS_RATIO)
    );
    this.benevolentHealerTalentEnabled =
      config.benevolentHealerTalentEnabled !== false &&
      Boolean(config.benevolentHealerTalentEnabled ?? DEFAULT_BENEVOLENT_HEALER_TALENT_ENABLED);
    this.benevolentHealerSelfHealRatio = Math.max(
      0,
      Number(config.benevolentHealerSelfHealRatio ?? DEFAULT_BENEVOLENT_HEALER_SELF_HEAL_RATIO)
    );
    this.secondSunriseTalentEnabled =
      config.secondSunriseTalentEnabled !== false &&
      Boolean(config.secondSunriseTalentEnabled ?? DEFAULT_SECOND_SUNRISE_TALENT_ENABLED);
    this.secondSunriseEffectivenessRatio = Math.max(
      0,
      Number(config.secondSunriseEffectivenessRatio ?? DEFAULT_SECOND_SUNRISE_EFFECTIVENESS_RATIO)
    );
    this.seasonOneTierTalentEnabled =
      config.seasonOneTierTalentEnabled !== false &&
      Boolean(config.seasonOneTierTalentEnabled ?? DEFAULT_SEASON_ONE_TIER_TALENT_ENABLED);
    this.seasonOneTierHolyShockHealingBonusRatio = Math.max(
      0,
      Number(
        config.seasonOneTierHolyShockHealingBonusRatio ??
          DEFAULT_SEASON_ONE_TIER_HOLY_SHOCK_HEALING_BONUS_RATIO
      )
    );
    this.seasonOneTierHolyShockBeaconOfLightAdditionalTransferRatio = Math.max(
      0,
      Number(
        config.seasonOneTierHolyShockBeaconOfLightAdditionalTransferRatio ??
          DEFAULT_SEASON_ONE_TIER_HOLY_SHOCK_BEACON_OF_LIGHT_ADDITIONAL_TRANSFER_RATIO
      )
    );
    this.sunSearDurationMs = Math.max(0, Number(config.sunSearDurationMs ?? DEFAULT_SUN_SEAR_DURATION_MS));
    this.sunSearTickMs = Math.max(100, Number(config.sunSearTickMs ?? DEFAULT_SUN_SEAR_TICK_MS));
    this.sunSearTickCount = Math.max(1, Math.round(this.sunSearDurationMs / this.sunSearTickMs));
    this.autoManaRegenTickMs = GLOBAL_AUTO_MANA_REGEN_TICK_MS;
    this.autoManaRegenPctOfMaxPerTick = GLOBAL_AUTO_MANA_REGEN_PCT_OF_MAX_PER_TICK;
    this.manaTuningScale = Math.max(
      0,
      Number(config.manaTuningScale ?? GLOBAL_HEALER_SCALING.globalManaTuningScale ?? 1) || 1
    );
    this.leechHealingRatio = Math.max(0, Number(config.leechHealingRatio ?? DEFAULT_LEECH_HEALING_RATIO));
    this.spellQueueWindowMs = clamp(Number(config.queueWindowMs ?? DEFAULT_SPELL_QUEUE_WINDOW_MS), 0, 2000);
    this.hastePct = Math.max(0, Number(config.hastePct ?? DEFAULT_HASTE_PCT));
    this.intellect = Math.max(0, Number(config.intellect ?? DEFAULT_INTELLECT));
    this.masteryPct = Math.max(0, Number(config.masteryPct ?? DEFAULT_MASTERY_PCT));
    this.triageHealthThresholdRatio = clamp(
      Number(config.triageHealthThresholdPct ?? DEFAULT_TRIAGE_HEALTH_THRESHOLD_PCT) / 100,
      0,
      1
    );
    this.triageMinEffectiveHealRatio = clamp(
      Number(config.triageMinEffectiveHealPct ?? DEFAULT_TRIAGE_MIN_EFFECTIVE_HEAL_PCT) / 100,
      0,
      1
    );
    this.autoManaRegenElapsedMs = 0;

    const players = Array.isArray(config.players) ? config.players : [];
    this.players = players.map((player, index) => {
      const roleKey = String(player.roleKey ?? "").trim().toLowerCase();
      const configuredIncomingDamageTakenMultiplier = Number(player.incomingDamageTakenMultiplier);
      const baseIncomingDamageTakenMultiplier = Number.isFinite(configuredIncomingDamageTakenMultiplier)
        ? configuredIncomingDamageTakenMultiplier
        : 1;
      const configuredMaxHp = Number(player.maxHp);
      const maxHp = Number.isFinite(configuredMaxHp) && configuredMaxHp > 0 ? configuredMaxHp : this.baseHealth;
      const configuredHp = Number(player.hp);
      const hp = Number.isFinite(configuredHp) ? clamp(configuredHp, 0, maxHp) : maxHp;
      const incomingDamageTakenMultiplier = Math.max(
        0,
        roleKey === "tank" ? this.tankIncomingDamageMultiplier : baseIncomingDamageTakenMultiplier
      );

      return {
        id: player.id ?? `raid-${index + 1}`,
        name: String(player.name ?? `대상-${index + 1}`),
        classKey: String(player.classKey ?? ""),
        className: String(player.className ?? ""),
        classColor: String(player.classColor ?? "#64748B"),
        roleKey: String(player.roleKey ?? ""),
        roleName: String(player.roleName ?? ""),
        roleIconUrl: String(player.roleIconUrl ?? ""),
        incomingDamageTakenMultiplier,
        hp: round(hp, 2),
        maxHp: round(maxHp, 2),
        alive: true,
        eternalFlameRemainingMs: 0,
        eternalFlameTickTimerMs: 0,
        divineBlessingRemainingMs: 0,
        beaconOfSaviorDamageReductionRemainingMs: 0,
        absorbShield: 0
      };
    });

    this.durationMs = Math.max(30000, Math.floor(Number(config.durationMs) || 180000));
    this.scheduledRaidBursts = normalizeScheduledRaidBursts(config.scheduledRaidBursts, this.durationMs);
    this.damageBreakTotalMs = 0;
    this.damageActiveDurationMs = this.durationMs;
    this.totalIncomingDamageBudget = 0;
    this.appliedIncomingDamageBudget = 0;
    this.nowMs = 0;
    this.finished = false;
    this.success = false;

    this.holyPower = 0;
    this.cooldowns = HOLY_PALADIN_ACTIVE_SPELL_KEYS.reduce((acc, spellKey) => {
      acc[spellKey] = 0;
      return acc;
    }, {});
    this.holyShockCharges = HOLY_SHOCK_MAX_CHARGES;
    this.holyShockRechargeRemainingMs = 0;
    this.gcdRemainingMs = 0;
    this.currentCast = null;
    this.castSequence = 0;

    this.buffs = {
      avengingWrathMs: 0,
      auraMasteryMs: 0,
      divineProtectionMs: 0,
      infusionOfLightMs: 0,
      infusionOfLightCharges: 0,
      divinePurposeMs: 0,
      handOfFaithMs: 0,
      handOfFaithCharges: 0,
      dawnlightEmpowermentMs: 0,
      dawnlightEmpowermentCharges: 0
    };

    this.actionQueue = [];
    this.offGcdActionQueue = [];
    this.sunSearEffects = [];
    this.dawnlightEffects = [];
    this.divineBlessingUsedInCombat = false;

    this.metrics = {
      healingDone: 0,
      overhealing: 0,
      healingBySpell: createHealingBySpellMetrics(),
      healingByTarget: {},
      damageTaken: 0,
      manaSpent: 0,
      deaths: 0,
      triageHealing: 0,
      wastedHolyPower: 0,
      casts: HOLY_PALADIN_ACTIVE_SPELL_KEYS.reduce((acc, spellKey) => {
        acc[spellKey] = 0;
        return acc;
      }, {})
    };

    this.logIndex = 0;
    this.logs = [];

    this.beacons = {
      light: this.pickRandomAliveNonTankPlayerId(),
      faith: null,
      savior: null
    };
    this.beacons.faith = this.pickRandomAliveNonTankPlayerId(this.beacons.light ? [this.beacons.light] : []);
    this.beaconOfSaviorShieldTimerMs = this.beaconOfSaviorTalentEnabled ? BEACON_OF_SAVIOR_SHIELD_INTERVAL_MS : 0;

    this.damageEvents = [];
    this.nextDamageEventIndex = 0;
    this.nextDamageEventMs = Number.POSITIVE_INFINITY;
    this.initializeDamageEventTimeline();
    this.raidHealthRatioTimeWeightedSum = 0;
    this.raidHealthRatioSampledMs = 0;
    this.selfPlayerId =
      this.players.find((player) => String(player?.name ?? "").trim() === SELF_PLAYER_NAME)?.id ?? null;

    this.pushLog(`연습 시작: ${Math.round(this.durationMs / 1000)}초`, "info");
    if (this.beacons.light) {
      this.pushLog(`빛의 봉화: ${this.findPlayer(this.beacons.light)?.name ?? this.beacons.light}`, "info");
    }
    if (this.beacons.faith) {
      this.pushLog(`신념의 봉화: ${this.findPlayer(this.beacons.faith)?.name ?? this.beacons.faith}`, "info");
    }
  }

  pickRandomAlivePlayerId(excludedIds = []) {
    const excluded = new Set(Array.isArray(excludedIds) ? excludedIds.filter(Boolean) : []);
    const candidates = this.players.filter((player) => player.alive && !excluded.has(player.id));
    if (!candidates.length) {
      return null;
    }
    const pickIndex = randomInt(this.rng, 0, candidates.length - 1);
    return candidates[pickIndex]?.id ?? null;
  }

  isTankPlayer(player) {
    return String(player?.roleKey ?? "").trim().toLowerCase() === "tank";
  }

  pickRandomAliveNonTankPlayerId(excludedIds = []) {
    const excluded = new Set(Array.isArray(excludedIds) ? excludedIds.filter(Boolean) : []);
    const candidates = this.players.filter(
      (player) => player.alive && !excluded.has(player.id) && !this.isTankPlayer(player)
    );
    if (!candidates.length) {
      return null;
    }
    const pickIndex = randomInt(this.rng, 0, candidates.length - 1);
    return candidates[pickIndex]?.id ?? null;
  }

  ensureBeaconTarget(slot) {
    const currentId = this.beacons[slot];
    const currentPlayer = this.findPlayer(currentId);
    if (currentPlayer?.alive && !this.isTankPlayer(currentPlayer)) {
      return;
    }

    const otherSlot = slot === "light" ? "faith" : "light";
    const otherBeaconId = this.beacons[otherSlot];
    const nextId = this.pickRandomAliveNonTankPlayerId(otherBeaconId ? [otherBeaconId] : []);
    this.beacons[slot] = nextId;

    if (nextId) {
      const beaconName = slot === "light" ? "빛의 봉화" : "신념의 봉화";
      const targetName = this.findPlayer(nextId)?.name ?? nextId;
      this.pushLog(`${beaconName} 이동: ${targetName}`, "info");
    }
  }

  ensureBeaconTargetsAfterDeaths() {
    this.ensureBeaconTarget("light");
    this.ensureBeaconTarget("faith");
    this.ensureBeaconOfSaviorAfterDeaths();
  }

  ensureBeaconOfSaviorAfterDeaths() {
    if (!this.beaconOfSaviorTalentEnabled) {
      return;
    }
    const currentTarget = this.findPlayer(this.beacons.savior);
    if (currentTarget?.alive) {
      return;
    }
    this.beacons.savior = null;
    this.tryTransferBeaconOfSavior("대상 사망", { injuredOnly: true });
  }

  findPlayer(playerId) {
    if (!playerId) {
      return null;
    }
    return this.players.find((player) => player.id === playerId) ?? null;
  }

  setExternalPlayerHpRatio(playerId, hpRatio) {
    const player = this.findPlayer(playerId);
    if (!player || !player.alive || player.maxHp <= 0) {
      return false;
    }

    const ratio = clamp(Number(hpRatio) || 0, 0, 1);
    player.hp = round(clamp(player.maxHp * ratio, 0, player.maxHp), 2);
    if (player.hp <= 0 && player.alive) {
      player.alive = false;
      this.metrics.deaths += 1;
      this.pushLog(`${player.name} 사망`, "error");
    }
    return true;
  }

  getAlivePlayers() {
    return this.players.filter((player) => player.alive);
  }

  getRaidAverageHealthRatio() {
    if (!this.players.length) {
      return 0;
    }
    let ratioSum = 0;
    for (const player of this.players) {
      const ratio = player.maxHp > 0 ? player.hp / player.maxHp : 0;
      ratioSum += clamp(ratio, 0, 1);
    }
    return clamp(ratioSum / this.players.length, 0, 1);
  }

  accumulateRaidHealthSample(durationMs) {
    const dt = Math.max(0, Number(durationMs) || 0);
    if (dt <= 0) {
      return;
    }
    this.raidHealthRatioTimeWeightedSum += this.getRaidAverageHealthRatio() * dt;
    this.raidHealthRatioSampledMs += dt;
  }

  getMostInjuredAlivePlayers(count) {
    return this.players
      .filter((player) => player.alive && player.hp < player.maxHp)
      .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)
      .slice(0, count);
  }

  getLowestHealthAlivePlayer(options = {}) {
    const excluded = new Set(Array.isArray(options.excludedIds) ? options.excludedIds.filter(Boolean) : []);
    const injuredOnly = Boolean(options.injuredOnly);
    const candidates = this.players.filter((player) => {
      if (!player.alive || excluded.has(player.id)) {
        return false;
      }
      if (!injuredOnly) {
        return true;
      }
      return player.hp < player.maxHp;
    });
    if (!candidates.length) {
      return null;
    }

    candidates.sort((a, b) => {
      const aRatio = a.maxHp > 0 ? a.hp / a.maxHp : 1;
      const bRatio = b.maxHp > 0 ? b.hp / b.maxHp : 1;
      if (aRatio !== bRatio) {
        return aRatio - bRatio;
      }
      return a.hp - b.hp;
    });
    return candidates[0] ?? null;
  }

  grantBeaconOfSaviorDefensive(playerId, reason = "") {
    if (!this.beaconOfSaviorTalentEnabled) {
      return false;
    }
    const player = this.findPlayer(playerId);
    if (!player || !player.alive) {
      return false;
    }

    const shieldAmount = Math.max(0, this.beaconOfSaviorShieldAmountCoefficient * this.intellect);
    player.absorbShield = round(Math.max(0, Number(player.absorbShield) || 0) + shieldAmount, 2);
    player.beaconOfSaviorDamageReductionRemainingMs = BEACON_OF_SAVIOR_DAMAGE_REDUCTION_DURATION_MS;
    if (shieldAmount > 0) {
      if (!Object.prototype.hasOwnProperty.call(this.metrics.healingBySpell, "beaconOfSaviorShield")) {
        this.metrics.healingBySpell.beaconOfSaviorShield = 0;
      }
      this.metrics.healingBySpell.beaconOfSaviorShield = round(
        Number(this.metrics.healingBySpell.beaconOfSaviorShield || 0) + shieldAmount,
        2
      );
    }

    const reasonSuffix = reason ? ` (${reason})` : "";
    this.pushLog(
      `구세주의 봉화 보호 ${player.name}${reasonSuffix}: 보호막 ${fmtSigned(shieldAmount)}, 피해감소 10%`,
      "buff"
    );
    return true;
  }

  setBeaconOfSaviorTarget(playerId, reason = "") {
    if (!this.beaconOfSaviorTalentEnabled) {
      return false;
    }
    const nextTarget = this.findPlayer(playerId);
    if (!nextTarget || !nextTarget.alive) {
      return false;
    }

    const previousTargetId = this.beacons.savior;
    if (previousTargetId === nextTarget.id) {
      return false;
    }

    this.beacons.savior = nextTarget.id;
    this.beaconOfSaviorShieldTimerMs = BEACON_OF_SAVIOR_SHIELD_INTERVAL_MS;
    this.grantBeaconOfSaviorDefensive(nextTarget.id, "대상 변경");
    this.pushLog(`구세주의 봉화 이동: ${nextTarget.name}${reason ? ` (${reason})` : ""}`, "buff");
    return true;
  }

  tryTransferBeaconOfSavior(reason = "", options = {}) {
    if (!this.beaconOfSaviorTalentEnabled) {
      return false;
    }
    const injuredOnly = Boolean(options.injuredOnly);
    const requireBelowThreshold = Boolean(options.requireBelowThreshold);

    if (requireBelowThreshold) {
      const hasBelowThreshold = this.players.some((player) => {
        if (!player.alive || player.maxHp <= 0) {
          return false;
        }
        return player.hp / player.maxHp < BEACON_OF_SAVIOR_LOW_HEALTH_THRESHOLD;
      });
      if (!hasBelowThreshold) {
        return false;
      }
    }

    const nextTarget = this.getLowestHealthAlivePlayer({ injuredOnly });
    if (!nextTarget) {
      return false;
    }

    if (!this.beacons.savior) {
      this.beacons.savior = nextTarget.id;
      this.beaconOfSaviorShieldTimerMs = BEACON_OF_SAVIOR_SHIELD_INTERVAL_MS;
      this.grantBeaconOfSaviorDefensive(nextTarget.id, "초기 부여");
      this.pushLog(`구세주의 봉화 부여: ${nextTarget.name}${reason ? ` (${reason})` : ""}`, "buff");
      return true;
    }

    return this.setBeaconOfSaviorTarget(nextTarget.id, reason);
  }

  processBeaconOfSaviorEffects(dt) {
    if (!this.beaconOfSaviorTalentEnabled) {
      return;
    }
    const duration = Math.max(0, Number(dt) || 0);
    if (duration <= 0) {
      return;
    }

    for (const player of this.players) {
      player.beaconOfSaviorDamageReductionRemainingMs = Math.max(
        0,
        Number(player.beaconOfSaviorDamageReductionRemainingMs || 0) - duration
      );
    }

    if (!this.beacons.savior) {
      this.tryTransferBeaconOfSavior("전투 시작", { injuredOnly: true });
      return;
    }

    const currentTarget = this.findPlayer(this.beacons.savior);
    if (!currentTarget?.alive) {
      this.ensureBeaconOfSaviorAfterDeaths();
      return;
    }

    this.beaconOfSaviorShieldTimerMs = Math.max(0, this.beaconOfSaviorShieldTimerMs - duration);
    while (this.beaconOfSaviorShieldTimerMs <= 0) {
      this.grantBeaconOfSaviorDefensive(currentTarget.id, "주기 8초");
      this.beaconOfSaviorShieldTimerMs += BEACON_OF_SAVIOR_SHIELD_INTERVAL_MS;
    }

    this.tryTransferBeaconOfSavior("체력 50% 미만", { requireBelowThreshold: true });
  }

  getSelfPlayer() {
    if (!this.selfPlayerId) {
      return null;
    }
    return this.findPlayer(this.selfPlayerId);
  }

  getLightOfMartyrHolyShockMultiplier() {
    if (!this.lightOfMartyrTalentEnabled || this.lightOfMartyrHolyShockHealBonusRatio <= 0) {
      return 1;
    }

    const selfPlayer = this.getSelfPlayer();
    if (!selfPlayer || !selfPlayer.alive || selfPlayer.maxHp <= 0) {
      return 1;
    }

    const selfHpRatio = clamp(selfPlayer.hp / selfPlayer.maxHp, 0, 1);
    if (selfHpRatio < this.lightOfMartyrSelfHpThreshold) {
      return 1;
    }
    return 1 + this.lightOfMartyrHolyShockHealBonusRatio;
  }

  recordTriageHealing(target, effectiveHealAmount, hpRatioBeforeHeal) {
    if (!target || !target.alive) {
      return;
    }
    const effective = Math.max(0, Number(effectiveHealAmount) || 0);
    if (effective <= 0 || target.maxHp <= 0) {
      return;
    }
    const beforeRatio = clamp(Number(hpRatioBeforeHeal ?? 1), 0, 1);
    if (beforeRatio > this.triageHealthThresholdRatio) {
      return;
    }
    const minEffectiveRequired = target.maxHp * this.triageMinEffectiveHealRatio;
    if (effective < minEffectiveRequired) {
      return;
    }
    this.metrics.triageHealing = round(this.metrics.triageHealing + effective, 2);
  }

  applyBenevolentHealerSelfHeal(sourceEffectiveHeal) {
    if (!this.benevolentHealerTalentEnabled || this.benevolentHealerSelfHealRatio <= 0) {
      return 0;
    }

    const selfPlayer = this.getSelfPlayer();
    if (!selfPlayer || !selfPlayer.alive) {
      return 0;
    }

    const sourceAmount = Math.max(0, Number(sourceEffectiveHeal) || 0);
    if (sourceAmount <= 0) {
      return 0;
    }

    const amount = sourceAmount * this.benevolentHealerSelfHealRatio;
    if (amount <= 0) {
      return 0;
    }

    const hpRatioBeforeHeal = selfPlayer.maxHp > 0 ? selfPlayer.hp / selfPlayer.maxHp : 1;
    const missing = selfPlayer.maxHp - selfPlayer.hp;
    const effective = Math.min(amount, Math.max(0, missing));
    const overheal = Math.max(0, amount - effective);
    selfPlayer.hp = round(clamp(selfPlayer.hp + effective, 0, selfPlayer.maxHp), 2);

    this.metrics.healingDone = round(this.metrics.healingDone + effective, 2);
    this.metrics.overhealing = round(this.metrics.overhealing + overheal, 2);
    if (!Object.prototype.hasOwnProperty.call(this.metrics.healingBySpell, "benevolentHealer")) {
      this.metrics.healingBySpell.benevolentHealer = 0;
    }
    this.metrics.healingBySpell.benevolentHealer = round(
      this.metrics.healingBySpell.benevolentHealer + effective,
      2
    );

    if (effective > 0) {
      const targetMetricKey = String(selfPlayer.id || "").trim();
      if (targetMetricKey) {
        const previousAmount = Number(this.metrics.healingByTarget[targetMetricKey] || 0);
        this.metrics.healingByTarget[targetMetricKey] = round(previousAmount + effective, 2);
      }
    }
    this.recordTriageHealing(selfPlayer, effective, hpRatioBeforeHeal);

    return round(effective, 2);
  }

  isSecondSunriseEnabled() {
    return this.secondSunriseTalentEnabled && this.secondSunriseEffectivenessRatio > 0;
  }

  applyGuaranteedFullHeal(targetId, spellKey = "divineBlessing") {
    const target = this.findPlayer(targetId);
    if (!target || !target.alive) {
      return { effective: 0, overheal: 0, isCritical: false, critChance: 0 };
    }

    const hpRatioBeforeHeal = target.maxHp > 0 ? target.hp / target.maxHp : 1;
    const missing = Math.max(0, target.maxHp - target.hp);
    target.hp = round(target.maxHp, 2);

    this.metrics.healingDone = round(this.metrics.healingDone + missing, 2);
    if (!Object.prototype.hasOwnProperty.call(this.metrics.healingBySpell, spellKey)) {
      this.metrics.healingBySpell[spellKey] = 0;
    }
    this.metrics.healingBySpell[spellKey] = round(this.metrics.healingBySpell[spellKey] + missing, 2);

    const targetMetricKey = String(target.id || targetId || "").trim();
    if (targetMetricKey) {
      const previousAmount = Number(this.metrics.healingByTarget[targetMetricKey] || 0);
      this.metrics.healingByTarget[targetMetricKey] = round(previousAmount + missing, 2);
    }
    this.recordTriageHealing(target, missing, hpRatioBeforeHeal);

    const shouldApplyLeech = this.leechHealingRatio > 0 && missing > 0 && this.selfPlayerId;
    if (shouldApplyLeech) {
      this.applyHeal(this.selfPlayerId, missing * this.leechHealingRatio, false, {
        spellKey: "leech",
        canCrit: false,
        suppressLeech: true,
        amountIsFinal: true
      });
    }

    return { effective: round(missing, 2), overheal: 0, isCritical: false, critChance: 0 };
  }

  castHolyShockLike(targetId, options = {}) {
    const target = this.findPlayer(targetId);
    if (!target || !target.alive) {
      return {
        success: false,
        effective: 0,
        secondSunriseEffective: 0,
        totalEffective: 0
      };
    }

    const efficiency = Math.max(0, Number(options.efficiency ?? 1));
    if (efficiency <= 0) {
      return {
        success: false,
        effective: 0,
        secondSunriseEffective: 0,
        totalEffective: 0
      };
    }

    const spellName = String(options.spellName ?? HOLY_PALADIN_PRACTICE_SPELLS.holyShock?.name ?? "신성충격");
    const suppressMainLog = Boolean(options.suppressMainLog);
    const grantHolyPower = options.grantHolyPower !== false;
    const reclamationManaCostRaw = Number(options.reclamationManaCost);
    const reclamationManaCost = Number.isFinite(reclamationManaCostRaw)
      ? Math.max(0, reclamationManaCostRaw)
      : Math.max(0, Number(HOLY_PALADIN_PRACTICE_SPELLS.holyShock?.manaCost ?? 0));

    const targetHpRatio = target.maxHp > 0 ? target.hp / target.maxHp : 1;
    const missingHealthRatio = 1 - clamp(targetHpRatio, 0, 1);
    const missingHealthBonusMultiplier = this.reclamationTalentEnabled
      ? 1 + missingHealthRatio * this.reclamationMaxMissingHealthHealBonusRatio
      : 1;
    const lightOfMartyrMultiplier = this.getLightOfMartyrHolyShockMultiplier();
    const lightOfMartyrActive = lightOfMartyrMultiplier > 1;
    const gloriousDawnProc = this.gloriousDawnTalentEnabled && this.rng() < GLORIOUS_DAWN_PROC_CHANCE;
    const gloriousDawnMultiplier = gloriousDawnProc ? GLORIOUS_DAWN_HEAL_MULTIPLIER : 1;
    const seasonOneTierHolyShockMultiplier =
      this.seasonOneTierTalentEnabled && this.seasonOneTierHolyShockHealingBonusRatio > 0
        ? 1 + this.seasonOneTierHolyShockHealingBonusRatio
        : 1;
    if (gloriousDawnProc) {
      this.addHolyShockCharge(1);
    }

    const holyShockBaseAmount =
      getHealAmount("holyShock") *
      efficiency *
      missingHealthBonusMultiplier *
      gloriousDawnMultiplier *
      lightOfMartyrMultiplier *
      seasonOneTierHolyShockMultiplier;

    const result = this.applyHeal(
      target.id,
      holyShockBaseAmount,
      true,
      { spellKey: "holyShock", isDirectHeal: true }
    );
    let secondSunriseEffective = 0;
    if (this.isSecondSunriseEnabled()) {
      const secondSunriseResult = this.applyHeal(
        target.id,
        holyShockBaseAmount * this.secondSunriseEffectivenessRatio,
        true,
        { spellKey: "holyShock", isDirectHeal: true }
      );
      secondSunriseEffective = Math.max(0, Number(secondSunriseResult.effective) || 0);
      if (secondSunriseResult.isCritical) {
        this.applySunSearFromCrit(target.id, "holyShock");
      }
      // 추가 holyShock도 빛 주입을 발동시킬 수 있습니다.
      this.tryProcInfusionOfLight();
    }
    if (result.isCritical) {
      this.applySunSearFromCrit(target.id, "holyShock");
    }
    if (grantHolyPower) {
      this.modifyHolyPower(1);
    }
    this.tryProcInfusionOfLight();

    let reclamationRefund = 0;
    if (this.reclamationTalentEnabled && reclamationManaCost > 0 && this.reclamationMaxManaRefundRatio > 0) {
      const refundAmount = reclamationManaCost * missingHealthRatio * this.reclamationMaxManaRefundRatio;
      const availableSpace = Math.max(0, this.maxMana - this.mana);
      reclamationRefund = Math.min(refundAmount, availableSpace);
      if (reclamationRefund > 0) {
        this.mana = round(Math.min(this.maxMana, this.mana + reclamationRefund), 2);
        this.metrics.manaSpent = round(Math.max(0, this.metrics.manaSpent - reclamationRefund), 2);
      }
    }

    if (!suppressMainLog) {
      const efficiencyLabel = Math.round(efficiency * 100);
      const efficiencySuffix = efficiencyLabel !== 100 ? ` (${efficiencyLabel}%)` : "";
      this.pushLog(
        `${spellName}${efficiencySuffix} ${target.name} ${fmtSigned(result.effective + secondSunriseEffective)}${secondSunriseEffective > 0 ? ` (두번째 일출 ${fmtSigned(secondSunriseEffective)})` : ""}${lightOfMartyrActive ? " (순교자의 빛)" : ""}${gloriousDawnProc ? " (영광스러운 여명)" : ""}${reclamationRefund > 0 ? ` (Reclamation 마나 +${round(reclamationRefund, 2)})` : ""}${result.isCritical ? " (치명타)" : ""}`,
        "heal"
      );
    }

    return {
      success: true,
      effective: Math.max(0, Number(result.effective) || 0),
      secondSunriseEffective: Math.max(0, Number(secondSunriseEffective) || 0),
      totalEffective: round(Math.max(0, Number(result.effective) || 0) + Math.max(0, Number(secondSunriseEffective) || 0), 2)
    };
  }

  getHealingMultiplier() {
    return this.buffs.avengingWrathMs > 0 ? AVENGING_WRATH_HEAL_MULTIPLIER : 1;
  }

  resolveSpellCritChance(spellKey, target = null, bonusChance = 0) {
    let critChance = this.baseCritChance + Math.max(0, Number(bonusChance) || 0);
    if (this.buffs.avengingWrathMs > 0) {
      critChance += AVENGING_WRATH_CRIT_CHANCE_BONUS;
    }

    if (spellKey === "holyShock") {
      critChance += this.holyShockCritChanceBonus;
    }

    if (this.extricationTalentEnabled && (spellKey === "eternalFlame" || spellKey === "lightOfDawn") && target) {
      const hpRatio = target.maxHp > 0 ? target.hp / target.maxHp : 1;
      const missingHealthRatio = 1 - clamp(hpRatio, 0, 1);
      critChance += missingHealthRatio * this.eternalFlameCritChanceBonusAtZeroHp;
    }

    return clamp(critChance, 0, 1);
  }

  resolveSpellCritMultiplier(spellKey, overrideMultiplier = null) {
    if (Number.isFinite(overrideMultiplier) && overrideMultiplier > 0) {
      return Math.max(1, Number(overrideMultiplier));
    }

    if (spellKey === "holyShock") {
      return this.holyShockCritHealMultiplier;
    }
    if (spellKey === "flashOfLight" || spellKey === "holyLight") {
      return this.flashOfLightCritHealMultiplier;
    }

    return this.defaultCritHealMultiplier;
  }

  addHolyShockCharge(chargeCount = 1) {
    const amount = Math.max(0, Math.floor(Number(chargeCount) || 0));
    if (amount <= 0) {
      return 0;
    }

    const before = this.holyShockCharges;
    this.holyShockCharges = Math.min(HOLY_SHOCK_MAX_CHARGES, this.holyShockCharges + amount);
    if (this.holyShockCharges >= HOLY_SHOCK_MAX_CHARGES) {
      this.holyShockRechargeRemainingMs = 0;
    } else if (this.holyShockRechargeRemainingMs <= 0) {
      this.holyShockRechargeRemainingMs = Math.max(1, Number(HOLY_PALADIN_PRACTICE_SPELLS.holyShock?.cooldownMs ?? 0));
    }
    this.cooldowns.holyShock = this.holyShockCharges >= HOLY_SHOCK_MAX_CHARGES ? 0 : this.holyShockRechargeRemainingMs;
    return this.holyShockCharges - before;
  }

  modifyHolyPower(delta) {
    const before = this.holyPower;
    this.holyPower = clamp(before + delta, 0, MAX_HOLY_POWER);
    if (delta > 0) {
      const gained = this.holyPower - before;
      const wasted = Math.max(0, delta - gained);
      if (wasted > 0) {
        this.metrics.wastedHolyPower += wasted;
      }
    }
  }

  isHolyPowerSpenderSpell(spell) {
    return Boolean(spell) && Math.max(0, Number(spell?.holyPowerCost ?? 0)) > 0;
  }

  hasDivinePurposeBuff() {
    return this.divinePurposeTalentEnabled && this.buffs.divinePurposeMs > 0;
  }

  shouldApplyDivinePurposeToSpell(spell) {
    return this.isHolyPowerSpenderSpell(spell) && this.hasDivinePurposeBuff();
  }

  consumeDivinePurposeBuff() {
    if (!this.hasDivinePurposeBuff()) {
      return false;
    }
    this.buffs.divinePurposeMs = 0;
    return true;
  }

  tryProcDivinePurposeFromHolyPowerSpender() {
    if (!this.divinePurposeTalentEnabled || this.divinePurposeDurationMs <= 0) {
      return false;
    }
    if (this.divinePurposeProcChance <= 0 || this.rng() > this.divinePurposeProcChance) {
      return false;
    }
    const wasActive = this.buffs.divinePurposeMs > 0;
    this.buffs.divinePurposeMs = this.divinePurposeDurationMs;
    this.pushLog(wasActive ? "신성한 목적 갱신" : "신성한 목적 발동", "buff");
    return true;
  }

  tryProcInfusionOfLight() {
    if (!this.infusionOfLightTalentEnabled) {
      return false;
    }
    if (this.infusionOfLightProcChance <= 0 || this.infusionOfLightDurationMs <= 0) {
      return false;
    }
    if (this.rng() > this.infusionOfLightProcChance) {
      return false;
    }

    const wasActive = this.buffs.infusionOfLightMs > 0 && this.buffs.infusionOfLightCharges > 0;
    this.buffs.infusionOfLightCharges = Math.min(
      INFUSION_OF_LIGHT_MAX_CHARGES,
      this.buffs.infusionOfLightCharges + INFUSION_OF_LIGHT_CHARGES_PER_PROC
    );
    this.buffs.infusionOfLightMs = this.infusionOfLightDurationMs;
    this.pushLog(wasActive ? "빛 주입 갱신" : "빛 주입 발동", "buff");
    return true;
  }

  reduceHolyShockRechargeByMs(reductionMs) {
    const reduction = Math.max(0, Number(reductionMs) || 0);
    if (reduction <= 0 || this.holyShockCharges >= HOLY_SHOCK_MAX_CHARGES) {
      return;
    }

    this.holyShockRechargeRemainingMs = Math.max(0, this.holyShockRechargeRemainingMs - reduction);
    const rechargeMs = Math.max(1, Number(HOLY_PALADIN_PRACTICE_SPELLS.holyShock?.cooldownMs ?? 0));
    while (this.holyShockCharges < HOLY_SHOCK_MAX_CHARGES && this.holyShockRechargeRemainingMs <= 0) {
      this.holyShockCharges += 1;
      if (this.holyShockCharges < HOLY_SHOCK_MAX_CHARGES) {
        this.holyShockRechargeRemainingMs += rechargeMs;
      } else {
        this.holyShockRechargeRemainingMs = 0;
      }
    }
    this.cooldowns.holyShock = this.holyShockCharges >= HOLY_SHOCK_MAX_CHARGES ? 0 : this.holyShockRechargeRemainingMs;
  }

  consumeInfusionOfLightCharge() {
    if (this.buffs.infusionOfLightMs <= 0 || this.buffs.infusionOfLightCharges <= 0) {
      return false;
    }

    this.buffs.infusionOfLightCharges = Math.max(0, this.buffs.infusionOfLightCharges - 1);
    if (this.buffs.infusionOfLightCharges <= 0) {
      this.buffs.infusionOfLightMs = 0;
    }

    this.reduceHolyShockRechargeByMs(INFUSION_OF_LIGHT_HOLY_SHOCK_COOLDOWN_REDUCTION_MS);
    return true;
  }

  hasHandOfFaithHolyLightBuff() {
    return this.handOfFaithTalentEnabled && this.buffs.handOfFaithMs > 0 && this.buffs.handOfFaithCharges > 0;
  }

  consumeHandOfFaithHolyLightCharge() {
    if (!this.hasHandOfFaithHolyLightBuff()) {
      return false;
    }

    this.buffs.handOfFaithCharges = Math.max(0, this.buffs.handOfFaithCharges - 1);
    if (this.buffs.handOfFaithCharges <= 0) {
      this.buffs.handOfFaithMs = 0;
    }
    return true;
  }

  resolveSpellManaCost(spell, options = {}) {
    if (!spell) {
      return 0;
    }
    const divinePurposeEmpowered = Boolean(options.divinePurposeEmpowered);
    if (divinePurposeEmpowered && this.isHolyPowerSpenderSpell(spell)) {
      return 0;
    }
    const baseCost = Math.max(0, Number(spell.manaCost) || 0);
    const tunedBaseCost = baseCost * this.manaTuningScale;
    if (spell.key === "holyLight" && this.hasHandOfFaithHolyLightBuff()) {
      return round(tunedBaseCost * HAND_OF_FAITH_HOLY_LIGHT_MANA_COST_MULTIPLIER, 2);
    }
    return round(tunedBaseCost, 2);
  }

  grantDawnlightEmpowermentFromDivineToll() {
    if (!this.dawnlightTalentEnabled) {
      return false;
    }
    if (this.dawnlightChargesFromDivineToll <= 0 || this.dawnlightEmpowermentDurationMs <= 0) {
      return false;
    }

    const wasActive =
      this.buffs.dawnlightEmpowermentMs > 0 && this.buffs.dawnlightEmpowermentCharges > 0;
    this.buffs.dawnlightEmpowermentMs = this.dawnlightEmpowermentDurationMs;
    this.buffs.dawnlightEmpowermentCharges = this.dawnlightChargesFromDivineToll;
    this.pushLog(
      wasActive
        ? `새벽빛 갱신 (${this.buffs.dawnlightEmpowermentCharges}회)`
        : `새벽빛 준비 (${this.buffs.dawnlightEmpowermentCharges}회)`,
      "buff"
    );
    return true;
  }

  consumeDawnlightEmpowermentCharge() {
    if (this.buffs.dawnlightEmpowermentMs <= 0 || this.buffs.dawnlightEmpowermentCharges <= 0) {
      return false;
    }

    this.buffs.dawnlightEmpowermentCharges = Math.max(0, this.buffs.dawnlightEmpowermentCharges - 1);
    if (this.buffs.dawnlightEmpowermentCharges <= 0) {
      this.buffs.dawnlightEmpowermentMs = 0;
    }
    return true;
  }

  applyDawnlightFromHolyPowerSpender(targetId, sourceSpellName = "") {
    if (!this.dawnlightTalentEnabled) {
      return false;
    }
    if (
      this.dawnlightTotalHealRatio <= 0 ||
      this.dawnlightDurationMs <= 0 ||
      this.dawnlightTickMs <= 0 ||
      this.dawnlightTickCount <= 0
    ) {
      return false;
    }
    if (this.buffs.dawnlightEmpowermentMs <= 0 || this.buffs.dawnlightEmpowermentCharges <= 0) {
      return false;
    }

    const target = this.findPlayer(targetId);
    if (!target?.alive) {
      return false;
    }

    const tickCount = Math.max(1, this.dawnlightTickCount);
    const tickAmount = this.dawnlightTotalHealRatio / tickCount;
    if (tickAmount <= 0) {
      return false;
    }
    if (!this.consumeDawnlightEmpowermentCharge()) {
      return false;
    }

    this.dawnlightEffects.push({
      targetId: target.id,
      tickAmount,
      remainingTicks: tickCount,
      nextTickAtMs: this.nowMs + this.dawnlightTickMs
    });

    const sourceSuffix = sourceSpellName ? ` (${sourceSpellName})` : "";
    const chargeSuffix =
      this.buffs.dawnlightEmpowermentCharges > 0 ? `, ${this.buffs.dawnlightEmpowermentCharges}회 남음` : ", 소진";
    this.pushLog(`새벽빛 부여: ${target.name}${sourceSuffix}${chargeSuffix}`, "buff");
    return true;
  }

  applySunSearFromCrit(targetId, triggerSpellKey) {
    if (!this.sunSearEnabled || this.sunSearDurationMs <= 0 || this.sunSearTickMs <= 0) {
      return false;
    }

    const target = this.findPlayer(targetId);
    if (!target?.alive) {
      return false;
    }

    const sunSearTotalAmount = Math.max(0, getHealAmount("sunSear"));
    if (sunSearTotalAmount <= 0) {
      return false;
    }

    const tickCount = Math.max(1, this.sunSearTickCount);
    const tickAmount = sunSearTotalAmount / tickCount;
    if (tickAmount <= 0) {
      return false;
    }

    this.sunSearEffects.push({
      targetId: target.id,
      tickAmount,
      remainingTicks: tickCount,
      nextTickAtMs: this.nowMs + this.sunSearTickMs
    });
    return true;
  }

  applyArchangelsBarrier(targetId, effectiveHealAmount) {
    if (!this.archangelsBarrierTalentEnabled) {
      return 0;
    }
    const shieldAmount = Math.max(0, Number(effectiveHealAmount) || 0) * ARCHANGELS_BARRIER_SHIELD_RATIO;
    if (shieldAmount <= 0) {
      return 0;
    }

    const target = this.findPlayer(targetId);
    if (!target || !target.alive) {
      return 0;
    }

    target.absorbShield = round(Math.max(0, Number(target.absorbShield) || 0) + shieldAmount, 2);
    return round(shieldAmount, 2);
  }

  queueAction(action) {
    if (this.finished) {
      return false;
    }
    if (!action || action.type !== "cast") {
      return false;
    }

    const spell = HOLY_PALADIN_PRACTICE_SPELLS[action.spellKey];
    if (!spell || !spell.active) {
      return false;
    }

    const isOffGcdSpell = spell.triggersGlobalCooldown === false;
    if (isOffGcdSpell) {
      this.offGcdActionQueue = [{
        type: "cast",
        spellKey: spell.key,
        targetId: action.targetId ?? null,
        queuedAtMs: this.nowMs
      }];
      return true;
    }

    const lockoutRemainingMs = this.getLockoutRemainingMs();
    if (lockoutRemainingMs > this.spellQueueWindowMs) {
      return false;
    }

    // 글쿨 사이 연타 입력은 항상 마지막 1개만 보존합니다.
    this.actionQueue = [{
      type: "cast",
      spellKey: spell.key,
      targetId: action.targetId ?? null,
      queuedAtMs: this.nowMs
    }];

    return true;
  }

  getLockoutRemainingMs() {
    const gcdRemainingMs = Math.max(0, Number(this.gcdRemainingMs) || 0);
    const castRemainingMs = this.currentCast ? Math.max(0, Number(this.currentCast.remainingMs) || 0) : 0;
    const readyAt = this.nowMs + Math.max(gcdRemainingMs, castRemainingMs);
    return Math.max(0, readyAt - this.nowMs);
  }

  getGlobalCooldownMs() {
    const hasteFactor = 1 + this.hastePct / 100;
    const gcdMs = BASE_GCD_MS / Math.max(0.01, hasteFactor);
    return Math.max(1000, gcdMs);
  }

  step(dtMs, runtimeState = {}) {
    if (this.finished) {
      return;
    }

    const dt = clamp(Number(dtMs) || 0, 0, 250);
    if (!dt) {
      return;
    }

    this.nowMs += dt;

    this.gcdRemainingMs = Math.max(0, this.gcdRemainingMs - dt);
    for (const spellKey of HOLY_PALADIN_ACTIVE_SPELL_KEYS) {
      if (spellKey === "holyShock") {
        continue;
      }
      this.cooldowns[spellKey] = Math.max(0, this.cooldowns[spellKey] - dt);
    }
    this.tickHolyShockRecharge(dt);
    this.cooldowns.holyShock = this.holyShockCharges >= HOLY_SHOCK_MAX_CHARGES ? 0 : this.holyShockRechargeRemainingMs;

    this.buffs.avengingWrathMs = Math.max(0, this.buffs.avengingWrathMs - dt);
    this.buffs.auraMasteryMs = Math.max(0, this.buffs.auraMasteryMs - dt);
    this.buffs.divineProtectionMs = Math.max(0, this.buffs.divineProtectionMs - dt);
    this.buffs.infusionOfLightMs = Math.max(0, this.buffs.infusionOfLightMs - dt);
    if (this.buffs.infusionOfLightMs <= 0) {
      this.buffs.infusionOfLightCharges = 0;
    }
    this.buffs.divinePurposeMs = Math.max(0, this.buffs.divinePurposeMs - dt);
    this.buffs.handOfFaithMs = Math.max(0, this.buffs.handOfFaithMs - dt);
    if (this.buffs.handOfFaithMs <= 0) {
      this.buffs.handOfFaithCharges = 0;
    }
    this.buffs.dawnlightEmpowermentMs = Math.max(0, this.buffs.dawnlightEmpowermentMs - dt);
    if (this.buffs.dawnlightEmpowermentMs <= 0) {
      this.buffs.dawnlightEmpowermentCharges = 0;
    }
    this.tickAutoManaRegen(dt);

    this.tickEternalFlameEffects(dt);
    this.tickSunSearEffects();
    this.tickDawnlightEffects();
    if (runtimeState.isPlayerMoving) {
      this.interruptCurrentCastByMovement();
    }
    this.processOffGcdActionQueue();
    this.advanceCurrentCast(dt);
    this.processActionQueue();
    this.processDamageEvents();
    this.processBeaconOfSaviorEffects(dt);
    this.ensureBeaconTargetsAfterDeaths();
    this.accumulateRaidHealthSample(dt);

    if (!this.getAlivePlayers().length) {
      this.finish("all-dead");
      return;
    }

    if (this.nowMs >= this.durationMs) {
      this.finish();
    }
  }

  tickHolyShockRecharge(dt) {
    if (this.holyShockCharges >= HOLY_SHOCK_MAX_CHARGES) {
      this.holyShockRechargeRemainingMs = 0;
      return;
    }

    this.holyShockRechargeRemainingMs = Math.max(0, this.holyShockRechargeRemainingMs - dt);

    const rechargeMs = Math.max(1, Number(HOLY_PALADIN_PRACTICE_SPELLS.holyShock?.cooldownMs ?? 0));
    while (this.holyShockCharges < HOLY_SHOCK_MAX_CHARGES && this.holyShockRechargeRemainingMs <= 0) {
      this.holyShockCharges += 1;
      if (this.holyShockCharges < HOLY_SHOCK_MAX_CHARGES) {
        this.holyShockRechargeRemainingMs += rechargeMs;
      } else {
        this.holyShockRechargeRemainingMs = 0;
      }
    }
  }

  tickEternalFlameEffects(dt) {
    for (const player of this.players) {
      player.divineBlessingRemainingMs = Math.max(0, player.divineBlessingRemainingMs - dt);
      if (!player.alive || player.eternalFlameRemainingMs <= 0) {
        if (player.eternalFlameRemainingMs <= 0) {
          player.eternalFlameTickTimerMs = 0;
        }
        continue;
      }

      player.eternalFlameRemainingMs = Math.max(0, player.eternalFlameRemainingMs - dt);
      player.eternalFlameTickTimerMs -= dt;

      while (player.eternalFlameRemainingMs > 0 && player.eternalFlameTickTimerMs <= 0) {
        this.applyHeal(player.id, getHealAmount("eternalFlameTick"), false, { spellKey: "eternalFlameTick" });
        player.eternalFlameTickTimerMs += ETERNAL_FLAME_TICK_MS;
      }

      if (player.eternalFlameRemainingMs <= 0) {
        player.eternalFlameTickTimerMs = 0;
      }
    }
  }

  tickSunSearEffects() {
    if (!this.sunSearEnabled || this.sunSearDurationMs <= 0 || this.sunSearTickMs <= 0 || !this.sunSearEffects.length) {
      return;
    }

    const nextEffects = [];
    for (const effect of this.sunSearEffects) {
      const target = this.findPlayer(effect.targetId);
      if (!target?.alive) {
        continue;
      }

      let remainingTicks = Math.max(0, Number(effect.remainingTicks) || 0);
      let nextTickAtMs = Math.max(0, Number(effect.nextTickAtMs) || this.nowMs + this.sunSearTickMs);
      const tickAmount = Math.max(0, Number(effect.tickAmount) || 0);
      if (!remainingTicks || tickAmount <= 0) {
        continue;
      }

      while (remainingTicks > 0 && this.nowMs >= nextTickAtMs) {
        this.applyHeal(target.id, tickAmount, false, {
          spellKey: "sunSear",
          canCrit: false,
          suppressBeaconOfSaviorTransfer: true
        });
        remainingTicks -= 1;
        nextTickAtMs += this.sunSearTickMs;
      }

      if (remainingTicks > 0) {
        nextEffects.push({
          targetId: target.id,
          tickAmount,
          remainingTicks,
          nextTickAtMs
        });
      }
    }

    this.sunSearEffects = nextEffects;
  }

  tickDawnlightEffects() {
    if (
      !this.dawnlightTalentEnabled ||
      this.dawnlightDurationMs <= 0 ||
      this.dawnlightTickMs <= 0 ||
      !this.dawnlightEffects.length
    ) {
      return;
    }

    const nextEffects = [];
    for (const effect of this.dawnlightEffects) {
      const target = this.findPlayer(effect.targetId);
      if (!target?.alive) {
        continue;
      }

      let remainingTicks = Math.max(0, Number(effect.remainingTicks) || 0);
      let nextTickAtMs = Math.max(0, Number(effect.nextTickAtMs) || this.nowMs + this.dawnlightTickMs);
      const tickAmount = Math.max(0, Number(effect.tickAmount) || 0);
      if (!remainingTicks || tickAmount <= 0) {
        continue;
      }

      while (remainingTicks > 0 && this.nowMs >= nextTickAtMs) {
        this.applyHeal(target.id, tickAmount, false, {
          spellKey: "dawnlight",
          isDirectHeal: false,
          suppressBeaconTransfer: true,
          suppressBeaconOfSaviorTransfer: true
        });
        remainingTicks -= 1;
        nextTickAtMs += this.dawnlightTickMs;
      }

      if (remainingTicks > 0) {
        nextEffects.push({
          targetId: target.id,
          tickAmount,
          remainingTicks,
          nextTickAtMs
        });
      }
    }

    this.dawnlightEffects = nextEffects;
  }

  tickAutoManaRegen(dt) {
    if (this.maxMana <= 0 || this.autoManaRegenPctOfMaxPerTick <= 0 || this.autoManaRegenTickMs <= 0) {
      return;
    }

    this.autoManaRegenElapsedMs += dt;
    const manaPerTick = this.maxMana * this.autoManaRegenPctOfMaxPerTick;
    if (manaPerTick <= 0) {
      return;
    }

    while (this.autoManaRegenElapsedMs >= this.autoManaRegenTickMs) {
      this.autoManaRegenElapsedMs -= this.autoManaRegenTickMs;
      if (this.mana < this.maxMana - 1e-6) {
        this.mana = round(Math.min(this.maxMana, this.mana + manaPerTick), 2);
      } else {
        this.mana = this.maxMana;
      }
    }
  }

  advanceCurrentCast(dt) {
    if (!this.currentCast) {
      return;
    }

    this.currentCast.remainingMs -= dt;
    if (this.currentCast.remainingMs > 0) {
      return;
    }

    const completedCast = this.currentCast;
    this.currentCast = null;
    this.resolveSpellCast(completedCast.spellKey, completedCast.targetId, {
      divinePurposeEmpowered: Boolean(completedCast.divinePurposeEmpowered)
    });
  }

  processOffGcdActionQueue() {
    if (!this.offGcdActionQueue.length) {
      return;
    }

    let loopCount = 0;
    while (this.offGcdActionQueue.length && loopCount < 20) {
      loopCount += 1;

      const action = this.offGcdActionQueue[0];
      const spell = HOLY_PALADIN_PRACTICE_SPELLS[action.spellKey];
      if (!spell || !spell.active || spell.triggersGlobalCooldown !== false) {
        this.offGcdActionQueue.shift();
        continue;
      }
      if (spell.key === "divineBlessing" && this.divineBlessingUsedInCombat) {
        this.offGcdActionQueue.shift();
        this.pushLog(`${spell.name} 실패: 전투 중 1회만 사용 가능`, "warn");
        continue;
      }

      if (spell.requiresTarget) {
        const target = this.findPlayer(action.targetId);
        if (!target || !target.alive) {
          this.offGcdActionQueue.shift();
          this.pushLog(`${spell.name} 실패: 유효한 대상이 없음`, "warn");
          continue;
        }
      }

      const divinePurposeEmpowered = this.shouldApplyDivinePurposeToSpell(spell);
      if (!divinePurposeEmpowered && spell.holyPowerCost > 0 && this.holyPower < spell.holyPowerCost) {
        this.offGcdActionQueue.shift();
        this.pushLog(`${spell.name} 실패: 신성한 힘 부족`, "warn");
        continue;
      }

      const spellManaCost = this.resolveSpellManaCost(spell, { divinePurposeEmpowered });
      if (spellManaCost > this.mana + 1e-6) {
        this.offGcdActionQueue.shift();
        this.pushLog(`${spell.name} 실패: 마나 부족`, "warn");
        continue;
      }

      if (spell.key === "holyShock") {
        if (this.holyShockCharges <= 0) {
          this.offGcdActionQueue.shift();
          const cooldownSec = round(this.holyShockRechargeRemainingMs / 1000, 1);
          this.pushLog(`${spell.name} 실패: 재사용 대기 ${cooldownSec}s`, "warn");
          continue;
        }
      } else if ((this.cooldowns[spell.key] ?? 0) > 0) {
        this.offGcdActionQueue.shift();
        const cooldownSec = round((this.cooldowns[spell.key] ?? 0) / 1000, 1);
        this.pushLog(`${spell.name} 실패: 재사용 대기 ${cooldownSec}s`, "warn");
        continue;
      }

      this.offGcdActionQueue.shift();
      this.startCast(spell, action.targetId ?? null);
    }
  }

  processActionQueue() {
    if (!this.actionQueue.length) {
      return;
    }

    let loopCount = 0;
    while (this.actionQueue.length && loopCount < 20) {
      loopCount += 1;

      if (this.currentCast) {
        return;
      }

      const action = this.actionQueue[0];
      const spell = HOLY_PALADIN_PRACTICE_SPELLS[action.spellKey];
      if (!spell || !spell.active) {
        this.actionQueue.shift();
        continue;
      }
      if (spell.key === "divineBlessing" && this.divineBlessingUsedInCombat) {
        this.actionQueue.shift();
        this.pushLog(`${spell.name} 실패: 전투 중 1회만 사용 가능`, "warn");
        continue;
      }

      if (spell.requiresTarget) {
        const target = this.findPlayer(action.targetId);
        if (!target || !target.alive) {
          this.actionQueue.shift();
          this.pushLog(`${spell.name} 실패: 유효한 대상이 없음`, "warn");
          continue;
        }
      }

      const divinePurposeEmpowered = this.shouldApplyDivinePurposeToSpell(spell);
      if (!divinePurposeEmpowered && spell.holyPowerCost > 0 && this.holyPower < spell.holyPowerCost) {
        this.actionQueue.shift();
        this.pushLog(`${spell.name} 실패: 신성한 힘 부족`, "warn");
        continue;
      }

      const spellManaCost = this.resolveSpellManaCost(spell, { divinePurposeEmpowered });
      if (spellManaCost > this.mana + 1e-6) {
        this.actionQueue.shift();
        this.pushLog(`${spell.name} 실패: 마나 부족`, "warn");
        continue;
      }

      if (this.gcdRemainingMs > 0) {
        return;
      }

      if (spell.key === "holyShock") {
        if (this.holyShockCharges <= 0) {
          this.actionQueue.shift();
          const cooldownSec = round(this.holyShockRechargeRemainingMs / 1000, 1);
          this.pushLog(`${spell.name} 실패: 재사용 대기 ${cooldownSec}s`, "warn");
          continue;
        }
      } else if ((this.cooldowns[spell.key] ?? 0) > 0) {
        this.actionQueue.shift();
        const cooldownSec = round((this.cooldowns[spell.key] ?? 0) / 1000, 1);
        this.pushLog(`${spell.name} 실패: 재사용 대기 ${cooldownSec}s`, "warn");
        continue;
      }

      this.actionQueue.shift();
      this.startCast(spell, action.targetId ?? null);

      return;
    }
  }

  startCast(spell, targetId) {
    const divinePurposeEmpowered = this.shouldApplyDivinePurposeToSpell(spell);
    if (spell.key === "holyShock") {
      this.holyShockCharges = Math.max(0, this.holyShockCharges - 1);
      if (this.holyShockCharges < HOLY_SHOCK_MAX_CHARGES && this.holyShockRechargeRemainingMs <= 0) {
        this.holyShockRechargeRemainingMs = Math.max(1, Number(spell.cooldownMs ?? 0));
      }
      this.cooldowns.holyShock = this.holyShockCharges >= HOLY_SHOCK_MAX_CHARGES ? 0 : this.holyShockRechargeRemainingMs;
    } else if (spell.cooldownMs > 0) {
      this.cooldowns[spell.key] = spell.cooldownMs;
    }

    const spellManaCost = this.resolveSpellManaCost(spell, { divinePurposeEmpowered });
    if (spellManaCost > 0) {
      this.mana = round(Math.max(0, this.mana - spellManaCost), 2);
      this.metrics.manaSpent = round(this.metrics.manaSpent + spellManaCost, 2);
    }

    if (spell.triggersGlobalCooldown !== false) {
      this.gcdRemainingMs = this.getGlobalCooldownMs();
    }

    const isInfusedFlashOfLight =
      spell.key === "flashOfLight" && this.buffs.infusionOfLightMs > 0 && this.buffs.infusionOfLightCharges > 0;
    const isHandOfFaithHolyLight = spell.key === "holyLight" && this.hasHandOfFaithHolyLightBuff();
    const baseCastTimeMs = isInfusedFlashOfLight || isHandOfFaithHolyLight ? 0 : spell.castTimeMs;
    if (isHandOfFaithHolyLight) {
      this.consumeHandOfFaithHolyLightCharge();
    }
    const castTimeMs =
      baseCastTimeMs > 0
        ? Math.max(0, Math.round(baseCastTimeMs / Math.max(0.01, 1 + this.hastePct / 100)))
        : 0;

    if (castTimeMs > 0) {
      this.currentCast = {
        castId: ++this.castSequence,
        spellKey: spell.key,
        spellName: spell.name,
        targetId,
        remainingMs: castTimeMs,
        castTimeMs,
        startedAtMs: this.nowMs,
        spentManaCost: spellManaCost,
        divinePurposeEmpowered
      };
      this.pushLog(`${spell.name} 시전 시작`, "info");
      return;
    }

    this.resolveSpellCast(spell.key, targetId, { divinePurposeEmpowered });
  }

  interruptCurrentCastByMovement() {
    if (!this.currentCast) {
      return false;
    }

    const spell = HOLY_PALADIN_PRACTICE_SPELLS[this.currentCast.spellKey];
    if (spell?.canMoveWhileCasting) {
      return false;
    }

    const spellName = this.currentCast.spellName || spell?.name || "시전";
    const refundedManaCost = Math.max(0, Number(this.currentCast.spentManaCost) || 0);
    if (refundedManaCost > 0) {
      this.mana = round(Math.min(this.maxMana, this.mana + refundedManaCost), 2);
      this.metrics.manaSpent = round(Math.max(0, this.metrics.manaSpent - refundedManaCost), 2);
    }
    // If a cast is canceled by movement, allow immediate follow-up GCD action.
    this.gcdRemainingMs = 0;
    this.currentCast = null;
    this.pushLog(`${spellName} 시전 취소: 이동`, "warn");
    return true;
  }

  resolveSpellCast(spellKey, targetId, castContext = {}) {
    const spell = HOLY_PALADIN_PRACTICE_SPELLS[spellKey];
    if (!spell) {
      return;
    }

    const divinePurposeEmpowered =
      Boolean(castContext?.divinePurposeEmpowered) &&
      this.divinePurposeTalentEnabled &&
      this.isHolyPowerSpenderSpell(spell);
    if (divinePurposeEmpowered) {
      this.consumeDivinePurposeBuff();
      this.pushLog("신성한 목적 소모", "buff");
    }

    this.metrics.casts[spellKey] += 1;

    switch (spellKey) {
      case "holyShock": {
        const holyShockResult = this.castHolyShockLike(targetId, {
          spellName: spell.name,
          reclamationManaCost: this.resolveSpellManaCost(spell)
        });
        if (!holyShockResult.success) {
          this.pushLog(`${spell.name} 실패: 대상 사망`, "warn");
        }
        return;
      }
      case "judgment": {
        this.modifyHolyPower(1);
        this.pushLog(`${spell.name} 사용 (신성한 힘 +1)`, "info");
        return;
      }
      case "flashOfLight": {
        const target = this.findPlayer(targetId);
        if (!target || !target.alive) {
          this.pushLog(`${spell.name} 실패: 대상 사망`, "warn");
          return;
        }

        const infusionActive = this.buffs.infusionOfLightMs > 0 && this.buffs.infusionOfLightCharges > 0;
        const holyRevelationMultiplier =
          infusionActive && this.holyRevelationTalentEnabled
            ? 1 + this.holyRevelationInfusedFlashOfLightHealBonusRatio
            : 1;
        const infusedAmount = infusionActive
          ? getHealAmount("flashOfLight") * this.infusionOfLightFlashOfLightHealMultiplier * holyRevelationMultiplier
          : getHealAmount("flashOfLight");
        const result = this.applyHeal(target.id, infusedAmount, true, { spellKey: "flashOfLight", isDirectHeal: true });
        const benevolentHealerHeal = this.applyBenevolentHealerSelfHeal(result.effective);
        this.modifyHolyPower(1);
        if (infusionActive && this.consumeInfusionOfLightCharge()) {
          this.pushLog(`빛 주입 소모 (${this.buffs.infusionOfLightCharges}/${INFUSION_OF_LIGHT_MAX_CHARGES})`, "buff");
        }
        this.pushLog(
          `${spell.name} ${target.name} ${fmtSigned(result.effective)}${infusionActive ? " (빛 주입)" : ""}${holyRevelationMultiplier > 1 ? " (성스러운 계시)" : ""}${benevolentHealerHeal > 0 ? ` (관대한 치유사 ${fmtSigned(benevolentHealerHeal)})` : ""}${result.isCritical ? " (치명타)" : ""}`,
          "heal"
        );
        return;
      }
      case "holyLight": {
        const target = this.findPlayer(targetId);
        if (!target || !target.alive) {
          this.pushLog(`${spell.name} 실패: 대상 사망`, "warn");
          return;
        }

        const primaryResult = this.applyHeal(target.id, getHealAmount("holyLight"), true, {
          spellKey: "holyLight",
          isDirectHeal: true
        });
        let splashTotal = 0;
        if (
          this.radiantLightTalentEnabled &&
          this.radiantLightHolyLightSplashRatio > 0 &&
          this.radiantLightTargetCount > 0
        ) {
          const splashSourceAmount = Math.max(0, primaryResult.effective + primaryResult.overheal);
          const splashAmountPerTarget = splashSourceAmount * this.radiantLightHolyLightSplashRatio;
          if (splashAmountPerTarget > 0) {
            const additionalTargets = sampleWithoutReplacement(
              this.getAlivePlayers().filter((player) => player.id !== target.id),
              this.radiantLightTargetCount,
              this.rng
            );
            for (const splashTarget of additionalTargets) {
              const splashResult = this.applyHeal(splashTarget.id, splashAmountPerTarget, false, {
                spellKey: "holyLight",
                canCrit: false,
                isDirectHeal: false,
                suppressBeaconOfSaviorTransfer: true,
                amountIsFinal: true
              });
              splashTotal += splashResult.effective;
            }
          }
        }
        const benevolentHealerHeal = this.applyBenevolentHealerSelfHeal(primaryResult.effective + splashTotal);
        this.modifyHolyPower(1);

        this.pushLog(
          `${spell.name} ${target.name} ${fmtSigned(primaryResult.effective + splashTotal)}${benevolentHealerHeal > 0 ? ` (관대한 치유사 ${fmtSigned(benevolentHealerHeal)})` : ""}${primaryResult.isCritical ? " (치명타)" : ""}`,
          "heal"
        );
        return;
      }
      case "lightOfDawn": {
        if (!divinePurposeEmpowered) {
          this.modifyHolyPower(-spell.holyPowerCost);
        }
        const targets = this.getMostInjuredAlivePlayers(5);
        const divinePurposeHealMultiplier = divinePurposeEmpowered ? 1 + this.divinePurposeHealBonusRatio : 1;
        if (!targets.length) {
          const fallbackTargetId =
            targetId ?? this.getLowestHealthAlivePlayer({ injuredOnly: false })?.id ?? this.getAlivePlayers()[0]?.id ?? null;
          const dawnlightApplied = this.applyDawnlightFromHolyPowerSpender(fallbackTargetId, spell.name);
          this.tryProcDivinePurposeFromHolyPowerSpender();
          this.pushLog(
            `${spell.name} 사용 (유효 대상 없음)${divinePurposeEmpowered ? " (신성한 목적)" : ""}${dawnlightApplied ? " (새벽빛 부여)" : ""}`,
            "info"
          );
          return;
        }

        let totalEffective = 0;
        let totalBarrier = 0;
        const lightOfDawnBaseAmount = getHealAmount("lightOfDawn") * divinePurposeHealMultiplier;
        const lightOfDawnMasteryEffectMultiplier = this.unfadingLightTalentEnabled
          ? UNFADING_LIGHT_LIGHT_OF_DAWN_MASTERY_EFFECT_MULTIPLIER
          : 1;
        for (const target of targets) {
          const result = this.applyHeal(target.id, lightOfDawnBaseAmount, false, {
            spellKey: "lightOfDawn",
            isDirectHeal: true,
            masteryEffectMultiplier: lightOfDawnMasteryEffectMultiplier,
            suppressBeaconTransfer: true,
            suppressBeaconOfSaviorTransfer: true
          });
          totalEffective += result.effective;
          if (result.effective > 0) {
            this.transferLightOfDawnToAllBeacons(result.effective);
          }
          if (result.isCritical) {
            this.applySunSearFromCrit(target.id, "lightOfDawn");
          }
          totalBarrier += this.applyArchangelsBarrier(target.id, result.effective);
        }
        let secondSunriseEffective = 0;
        if (this.isSecondSunriseEnabled()) {
          const secondTargets = this.getMostInjuredAlivePlayers(5);
          for (const target of secondTargets) {
            const secondSunriseResult = this.applyHeal(
              target.id,
              lightOfDawnBaseAmount * this.secondSunriseEffectivenessRatio,
              false,
              {
                spellKey: "lightOfDawn",
                isDirectHeal: true,
                masteryEffectMultiplier: lightOfDawnMasteryEffectMultiplier,
                suppressBeaconTransfer: true,
                suppressBeaconOfSaviorTransfer: true
              }
            );
            secondSunriseEffective += secondSunriseResult.effective;
            if (secondSunriseResult.effective > 0) {
              this.transferLightOfDawnToAllBeacons(secondSunriseResult.effective);
            }
            // 추가 lightOfDawn도 Sun Sear를 발동시킬 수 있습니다.
            if (secondSunriseResult.isCritical) {
              this.applySunSearFromCrit(target.id, "lightOfDawn");
            }
            totalBarrier += this.applyArchangelsBarrier(target.id, secondSunriseResult.effective);
          }
        }
        const dawnlightTargetId =
          targetId ?? targets[0]?.id ?? this.getLowestHealthAlivePlayer({ injuredOnly: false })?.id ?? null;
        const dawnlightApplied = this.applyDawnlightFromHolyPowerSpender(dawnlightTargetId, spell.name);
        this.tryProcDivinePurposeFromHolyPowerSpender();

        this.pushLog(
          `${spell.name} 광역 치유 ${fmtSigned(totalEffective + secondSunriseEffective)}${divinePurposeEmpowered ? " (신성한 목적)" : ""}${secondSunriseEffective > 0 ? ` (두번째 일출 ${fmtSigned(secondSunriseEffective)})` : ""}${dawnlightApplied ? " (새벽빛 부여)" : ""}`,
          "heal"
        );
        if (totalBarrier > 0) {
          this.pushLog(`대천사의 방벽 ${fmtSigned(totalBarrier)} 보호막`, "buff");
        }
        return;
      }
      case "eternalFlame": {
        const target = this.findPlayer(targetId);
        if (!target || !target.alive) {
          this.pushLog(`${spell.name} 실패: 대상 사망`, "warn");
          return;
        }

        if (!divinePurposeEmpowered) {
          this.modifyHolyPower(-spell.holyPowerCost);
        }
        const divinePurposeHealMultiplier = divinePurposeEmpowered ? 1 + this.divinePurposeHealBonusRatio : 1;
        const result = this.applyHeal(target.id, getHealAmount("eternalFlame") * divinePurposeHealMultiplier, true, {
          spellKey: "eternalFlame",
          isDirectHeal: true
        });
        target.eternalFlameRemainingMs = ETERNAL_FLAME_DURATION_MS;
        target.eternalFlameTickTimerMs = ETERNAL_FLAME_TICK_MS;
        const barrierShield = this.applyArchangelsBarrier(target.id, result.effective);
        const dawnlightApplied = this.applyDawnlightFromHolyPowerSpender(target.id, spell.name);
        this.tryProcDivinePurposeFromHolyPowerSpender();

        this.pushLog(
          `${spell.name} ${target.name} ${fmtSigned(result.effective)}${divinePurposeEmpowered ? " (신성한 목적)" : ""}${result.isCritical ? " (치명타)" : ""} (지속 치유 적용)${dawnlightApplied ? " (새벽빛 부여)" : ""}`,
          "heal"
        );
        if (barrierShield > 0) {
          this.pushLog(`대천사의 방벽 ${target.name} ${fmtSigned(barrierShield)} 보호막`, "buff");
        }
        return;
      }
      case "divineBlessing": {
        const target = this.findPlayer(targetId);
        if (!target || !target.alive) {
          this.pushLog(`${spell.name} 실패: 대상 사망`, "warn");
          return;
        }

        const result = this.applyGuaranteedFullHeal(target.id, "divineBlessing");
        this.divineBlessingUsedInCombat = true;
        target.divineBlessingRemainingMs = DIVINE_BLESSING_DURATION_MS;

        this.pushLog(
          `${spell.name} ${target.name} ${fmtSigned(result.effective)} (완전 치유) (피해 감소 부여)`,
          "buff"
        );
        return;
      }
      case "divineToll": {
        const targets = this.getAlivePlayers()
          .sort((a, b) => {
            const aRatio = a.maxHp > 0 ? a.hp / a.maxHp : 1;
            const bRatio = b.maxHp > 0 ? b.hp / b.maxHp : 1;
            if (aRatio !== bRatio) {
              return aRatio - bRatio;
            }
            return a.hp - b.hp;
          })
          .slice(0, 5);
        this.grantDawnlightEmpowermentFromDivineToll();
        if (!targets.length) {
          this.pushLog(`${spell.name} 사용 (유효 대상 없음)`, "info");
          this.modifyHolyPower(5);
          return;
        }

        let totalEffective = 0;
        for (const target of targets) {
          const divineTollHolyShockResult = this.castHolyShockLike(target.id, {
            spellName: spell.name,
            efficiency: 0.6,
            suppressMainLog: true,
            grantHolyPower: false,
            reclamationManaCost: this.resolveSpellManaCost(HOLY_PALADIN_PRACTICE_SPELLS.holyShock)
          });
          totalEffective += divineTollHolyShockResult.totalEffective;
        }

        this.modifyHolyPower(5);
        this.pushLog(`${spell.name} (신성충격 x${targets.length}, 60%) 광역 치유 ${fmtSigned(totalEffective)}`, "heal");
        return;
      }
      case "avengingWrath": {
        this.buffs.avengingWrathMs = AVENGING_WRATH_DURATION_MS;
        if (this.handOfFaithTalentEnabled) {
          this.buffs.handOfFaithMs = HAND_OF_FAITH_DURATION_MS;
          this.buffs.handOfFaithCharges = HAND_OF_FAITH_CHARGES_ON_AVENGING_WRATH;
          this.pushLog(`신앙의 손 활성 (${this.buffs.handOfFaithCharges}회)`, "buff");
        }
        this.pushLog(`${spell.name} 발동 (치유 +15%, 치명타 +15%)`, "buff");
        return;
      }
      case "auraMastery": {
        this.buffs.auraMasteryMs = AURA_MASTERY_DURATION_MS;
        this.pushLog(`${spell.name} 발동 (공대 받는 피해 12% 감소)`, "buff");
        return;
      }
      case "divineProtection": {
        this.buffs.divineProtectionMs = DIVINE_PROTECTION_DURATION_MS;
        this.pushLog(`${spell.name} 발동 (받는 피해 20% 감소, 받는 치유 15% 증가)`, "buff");
        return;
      }
      default:
        return;
    }
  }

  applyHeal(targetId, baseAmount, allowBeaconTransfer, options = {}) {
    const target = this.findPlayer(targetId);
    if (!target || !target.alive || baseAmount <= 0) {
      return { effective: 0, overheal: 0, isCritical: false, critChance: 0 };
    }

    const spellKey = String(options.spellKey ?? "").trim();
    const canCrit = options.canCrit !== false;
    const critChanceBonus = Math.max(0, Number(options.critChanceBonus ?? 0));
    const critChance = canCrit ? this.resolveSpellCritChance(spellKey, target, critChanceBonus) : 0;
    const critMultiplier = canCrit
      ? this.resolveSpellCritMultiplier(spellKey, options.critHealMultiplier)
      : 1;
    const isCritical = canCrit && critChance > 0 && this.rng() < critChance;
    const isDirectHeal = options.isDirectHeal === true;
    const beaconOfSaviorTargetId = this.beaconOfSaviorTalentEnabled ? this.beacons.savior : null;
    const masteryEffectMultiplier = Math.max(0, Number(options.masteryEffectMultiplier ?? 1));
    const masteryMultiplier = 1 + (this.masteryPct / 100) * masteryEffectMultiplier;

    const amountIsFinal = Boolean(options.amountIsFinal);
    const baseHealAmount = amountIsFinal ? Math.max(0, Number(baseAmount) || 0) : baseAmount * this.intellect;
    // amountIsFinal=true is used by transfer/derived heals that are already computed from a final amount.
    // Do not apply global healing/mastery again, otherwise transfer heals are double-scaled.
    let amount = amountIsFinal
      ? baseHealAmount * (isCritical ? critMultiplier : 1)
      : baseHealAmount * this.getHealingMultiplier() * masteryMultiplier * (isCritical ? critMultiplier : 1);
    const isSelfTarget = this.selfPlayerId && target.id === this.selfPlayerId;
    if (isSelfTarget && (spellKey === "eternalFlame" || spellKey === "eternalFlameTick")) {
      amount *= 1.25;
    }
    if (isSelfTarget && this.buffs.divineProtectionMs > 0) {
      amount *= DIVINE_PROTECTION_HEALING_TAKEN_MULTIPLIER;
    }
    if (isDirectHeal && beaconOfSaviorTargetId && target.id === beaconOfSaviorTargetId) {
      amount *= BEACON_OF_SAVIOR_DIRECT_HEAL_MULTIPLIER;
    }
    const hpRatioBeforeHeal = target.maxHp > 0 ? target.hp / target.maxHp : 1;
    const missing = target.maxHp - target.hp;
    const effective = Math.min(amount, Math.max(0, missing));
    const overheal = Math.max(0, amount - effective);

    target.hp = round(clamp(target.hp + effective, 0, target.maxHp), 2);

    this.metrics.healingDone = round(this.metrics.healingDone + effective, 2);
    this.metrics.overhealing = round(this.metrics.overhealing + overheal, 2);
    if (spellKey) {
      if (!Object.prototype.hasOwnProperty.call(this.metrics.healingBySpell, spellKey)) {
        this.metrics.healingBySpell[spellKey] = 0;
      }
      this.metrics.healingBySpell[spellKey] = round(this.metrics.healingBySpell[spellKey] + effective, 2);
    }
    if (effective > 0) {
      const targetMetricKey = String(target.id || targetId || "").trim();
      if (targetMetricKey) {
        const previousAmount = Number(this.metrics.healingByTarget[targetMetricKey] || 0);
        this.metrics.healingByTarget[targetMetricKey] = round(previousAmount + effective, 2);
      }
    }
    this.recordTriageHealing(target, effective, hpRatioBeforeHeal);

    const suppressBeaconTransfer = Boolean(options.suppressBeaconTransfer);
    if (allowBeaconTransfer && !suppressBeaconTransfer && effective > 0) {
      this.transferBeaconHeal(targetId, effective, { sourceSpellKey: spellKey });
    }

    const shouldTransferToBeaconOfSavior =
      this.beaconOfSaviorTalentEnabled &&
      !suppressBeaconTransfer &&
      !options.suppressBeaconOfSaviorTransfer &&
      isDirectHeal &&
      effective > 0 &&
      beaconOfSaviorTargetId &&
      target.id !== beaconOfSaviorTargetId;
    if (shouldTransferToBeaconOfSavior) {
      this.applyHeal(beaconOfSaviorTargetId, effective * this.beaconOfSaviorTransferRatio, false, {
        spellKey: "beaconOfSaviorTransfer",
        canCrit: false,
        suppressBeaconOfSaviorTransfer: true,
        amountIsFinal: true
      });
    }

    if (this.beaconOfSaviorTalentEnabled && target.id === this.beacons.savior && overheal > 0) {
      this.tryTransferBeaconOfSavior("과치유 발생");
    }

    const shouldApplyLeech = !options.suppressLeech && this.leechHealingRatio > 0 && effective > 0 && this.selfPlayerId;
    if (shouldApplyLeech) {
      this.applyHeal(this.selfPlayerId, effective * this.leechHealingRatio, false, {
        spellKey: "leech",
        canCrit: false,
        suppressLeech: true,
        amountIsFinal: true
      });
    }

    return {
      effective: round(effective, 2),
      overheal: round(overheal, 2),
      isCritical,
      critChance: round(critChance * 100, 2)
    };
  }

  transferBeaconHeal(primaryTargetId, effectiveAmount, options = {}) {
    const amount = Math.max(0, Number(effectiveAmount) || 0);
    if (amount <= 0) {
      return;
    }

    const sourceSpellKey = String(options.sourceSpellKey ?? "").trim();
    const beaconLightId = this.beacons.light;
    const beaconFaithId = this.beacons.faith;
    const hasBeaconOfFaith = Boolean(beaconFaithId);
    const lightAndFaithRatio = hasBeaconOfFaith
      ? BEACON_OF_LIGHT_BASE_TRANSFER_RATIO * (1 - BEACON_OF_FAITH_REDUCTION_WHEN_ACTIVE)
      : BEACON_OF_LIGHT_BASE_TRANSFER_RATIO;

    const transfers = [
      { targetId: beaconLightId, ratio: lightAndFaithRatio },
      { targetId: beaconFaithId, ratio: hasBeaconOfFaith ? lightAndFaithRatio : 0 }
    ];

    for (const transfer of transfers) {
      const beaconId = transfer.targetId;
      const ratio = Math.max(0, Number(transfer.ratio) || 0);
      if (!beaconId || ratio <= 0 || beaconId === primaryTargetId) {
        continue;
      }
      this.applyHeal(beaconId, amount * ratio, false, {
        spellKey: "beaconTransfer",
        canCrit: false,
        suppressBeaconTransfer: true,
        suppressBeaconOfSaviorTransfer: true,
        amountIsFinal: true
      });
    }

    const seasonOneTierAdditionalBeaconLightRatio =
      this.seasonOneTierTalentEnabled &&
      sourceSpellKey === "holyShock" &&
      this.seasonOneTierHolyShockBeaconOfLightAdditionalTransferRatio > 0
        ? this.seasonOneTierHolyShockBeaconOfLightAdditionalTransferRatio
        : 0;
    if (
      beaconLightId &&
      beaconLightId !== primaryTargetId &&
      seasonOneTierAdditionalBeaconLightRatio > 0
    ) {
      this.applyHeal(beaconLightId, amount * seasonOneTierAdditionalBeaconLightRatio, false, {
        spellKey: "beaconTransfer",
        canCrit: false,
        suppressBeaconTransfer: true,
        suppressBeaconOfSaviorTransfer: true,
        amountIsFinal: true
      });
    }
  }

  transferLightOfDawnToAllBeacons(effectiveAmount) {
    const amount = Math.max(0, Number(effectiveAmount) || 0);
    if (amount <= 0) {
      return;
    }

    const transfers = [
      { targetId: this.beacons.light, spellKey: "beaconTransfer" },
      { targetId: this.beacons.faith, spellKey: "beaconTransfer" },
      { targetId: this.beacons.savior, spellKey: "beaconOfSaviorTransfer" }
    ];

    for (const transfer of transfers) {
      if (!transfer.targetId) {
        continue;
      }
      this.applyHeal(transfer.targetId, amount * LIGHT_OF_DAWN_ALL_BEACON_TRANSFER_RATIO, false, {
        spellKey: transfer.spellKey,
        canCrit: false,
        suppressBeaconTransfer: true,
        suppressBeaconOfSaviorTransfer: true,
        amountIsFinal: true
      });
    }
  }

  hasDamageBreakWindow() {
    return this.damageBreakEveryMs > 0 && this.damageBreakDurationMs > 0;
  }

  isDamageBreakActiveAt(timeMs) {
    if (!this.hasDamageBreakWindow()) {
      return false;
    }

    const time = Math.max(0, Number(timeMs) || 0);
    if (time < this.damageBreakEveryMs) {
      return false;
    }

    const cycleIndex = Math.floor(time / this.damageBreakEveryMs);
    const breakStartMs = cycleIndex * this.damageBreakEveryMs;
    const breakEndMs = breakStartMs + this.damageBreakDurationMs;
    return time >= breakStartMs && time < breakEndMs;
  }

  getDamageBreakEndMs(timeMs) {
    if (!this.hasDamageBreakWindow()) {
      return Math.max(0, Number(timeMs) || 0);
    }

    const time = Math.max(0, Number(timeMs) || 0);
    if (time < this.damageBreakEveryMs) {
      return time;
    }

    const cycleIndex = Math.floor(time / this.damageBreakEveryMs);
    const breakStartMs = cycleIndex * this.damageBreakEveryMs;
    const breakEndMs = breakStartMs + this.damageBreakDurationMs;
    if (time < breakStartMs || time >= breakEndMs) {
      return time;
    }

    return breakEndMs;
  }

  calculateDamageBreakDurationWithin(durationMs) {
    const duration = Math.max(0, Number(durationMs) || 0);
    if (!this.hasDamageBreakWindow() || duration <= this.damageBreakEveryMs) {
      return 0;
    }

    let totalBreakMs = 0;
    for (
      let breakStartMs = this.damageBreakEveryMs;
      breakStartMs < duration;
      breakStartMs += this.damageBreakEveryMs
    ) {
      const breakEndMs = Math.min(duration, breakStartMs + this.damageBreakDurationMs);
      if (breakEndMs > breakStartMs) {
        totalBreakMs += breakEndMs - breakStartMs;
      }
    }
    return totalBreakMs;
  }

  initializeDamageEventTimeline() {
    const totalBreakMs = this.calculateDamageBreakDurationWithin(this.durationMs);
    const activeDurationMs = Math.max(0, this.durationMs - totalBreakMs);
    this.damageBreakTotalMs = totalBreakMs;
    this.damageActiveDurationMs = activeDurationMs;
    this.totalIncomingDamageBudget =
      this.baseHealth *
      this.incomingDamageMultiplier *
      this.damageBudgetBaseRatePerSec *
      (activeDurationMs / 1000);
    this.appliedIncomingDamageBudget = 0;

    let baseDamageEvents = [];
    if (this.totalIncomingDamageBudget > 0 && activeDurationMs > 0) {
      const timeline = [];
      let nextEventTimeMs = randomRange(this.rng, 450, 900);
      let guard = 0;
      while (nextEventTimeMs < this.durationMs && guard < 100000) {
        guard += 1;
        if (this.isDamageBreakActiveAt(nextEventTimeMs)) {
          const breakEndMs = this.getDamageBreakEndMs(nextEventTimeMs);
          nextEventTimeMs = breakEndMs > nextEventTimeMs ? breakEndMs : nextEventTimeMs + DAMAGE_EVENT_MIN_MS;
          continue;
        }
        timeline.push({ timeMs: nextEventTimeMs });
        nextEventTimeMs += randomRange(this.rng, DAMAGE_EVENT_MIN_MS, DAMAGE_EVENT_MAX_MS);
      }

      if (timeline.length) {
        const budgetWeights = timeline.map(() => {
          const jitter = randomRange(this.rng, 1 - DAMAGE_EVENT_BUDGET_JITTER, 1 + DAMAGE_EVENT_BUDGET_JITTER);
          return Math.max(0.05, jitter);
        });
        const totalWeight = budgetWeights.reduce((sum, value) => sum + value, 0);
        if (totalWeight <= 0) {
          const perEventBudget = this.totalIncomingDamageBudget / timeline.length;
          baseDamageEvents = timeline.map((event) => ({
            timeMs: event.timeMs,
            budget: perEventBudget
          }));
        } else {
          let assignedBudget = 0;
          baseDamageEvents = timeline.map((event, index) => {
            const isLast = index === timeline.length - 1;
            const budget = isLast
              ? Math.max(0, this.totalIncomingDamageBudget - assignedBudget)
              : Math.max(0, (this.totalIncomingDamageBudget * budgetWeights[index]) / totalWeight);
            assignedBudget += budget;
            return {
              timeMs: event.timeMs,
              budget
            };
          });
        }
      }
    }

    const burstDamageEvents = this.buildScheduledRaidBurstEvents();
    const burstTotalBudget = burstDamageEvents.reduce(
      (sum, event) => sum + Math.max(0, Number(event?.budget) || 0),
      0
    );
    this.totalIncomingDamageBudget = Math.max(0, this.totalIncomingDamageBudget) + burstTotalBudget;
    this.damageEvents = [...baseDamageEvents, ...burstDamageEvents].sort(
      (left, right) => Math.max(0, Number(left?.timeMs) || 0) - Math.max(0, Number(right?.timeMs) || 0)
    );
    this.nextDamageEventIndex = 0;
    this.nextDamageEventMs = this.damageEvents[0]?.timeMs ?? Number.POSITIVE_INFINITY;
  }

  buildScheduledRaidBurstEvents() {
    if (!Array.isArray(this.scheduledRaidBursts) || !this.scheduledRaidBursts.length) {
      return [];
    }
    const totalIncomingDamageTakenMultiplier = this.players.reduce(
      (sum, player) => sum + Math.max(0, Number(player?.incomingDamageTakenMultiplier ?? 1)),
      0
    );
    const events = [];
    for (const pattern of this.scheduledRaidBursts) {
      const startAtMs = Math.max(0, Math.floor(Number(pattern?.startAtMs) || 0));
      const tickIntervalMs = Math.max(1, Math.floor(Number(pattern?.tickIntervalMs) || 1));
      const tickCount = Math.max(1, Math.floor(Number(pattern?.tickCount) || 1));
      const damagePerTick = Math.max(0, Number(pattern?.damagePerTick) || 0);
      if (damagePerTick <= 0) {
        continue;
      }
      for (let tickIndex = 0; tickIndex < tickCount; tickIndex += 1) {
        const timeMs = startAtMs + tickIntervalMs * tickIndex;
        if (timeMs >= this.durationMs) {
          break;
        }
        events.push({
          timeMs,
          budget: damagePerTick * totalIncomingDamageTakenMultiplier,
          forcedRaidPulseBaseDamage: damagePerTick
        });
      }
    }
    return events;
  }

  getIncomingDamageTimelineSeries(bucketMs = 1000) {
    const stepMs = Math.max(100, Math.floor(Number(bucketMs) || 1000));
    const bucketCount = Math.max(1, Math.ceil(this.durationMs / stepMs));
    const buckets = Array.from({ length: bucketCount }, (_, index) => ({
      timeMs: index * stepMs,
      damage: 0
    }));

    for (const event of this.damageEvents) {
      const timeMs = Math.max(0, Number(event?.timeMs) || 0);
      const budget = Math.max(0, Number(event?.budget) || 0);
      if (budget <= 0) {
        continue;
      }
      const bucketIndex = Math.max(0, Math.min(bucketCount - 1, Math.floor(timeMs / stepMs)));
      buckets[bucketIndex].damage += budget;
    }

    return buckets.map((bucket) => ({
      timeMs: Math.max(0, Math.min(this.durationMs, Math.round(bucket.timeMs))),
      damage: round(Math.max(0, Number(bucket.damage) || 0), 2)
    }));
  }

  processDamageEvents() {
    while (!this.finished && this.nextDamageEventIndex < this.damageEvents.length) {
      const currentEvent = this.damageEvents[this.nextDamageEventIndex];
      if (!currentEvent || this.nowMs < currentEvent.timeMs) {
        break;
      }

      const forcedRaidPulseBaseDamage = Math.max(0, Number(currentEvent.forcedRaidPulseBaseDamage) || 0);
      if (forcedRaidPulseBaseDamage > 0) {
        this.appliedIncomingDamageBudget += this.applyForcedRaidPulseDamage(forcedRaidPulseBaseDamage);
      } else {
        const eventBudget = Math.max(0, Number(currentEvent.budget) || 0);
        if (eventBudget > 0) {
          this.appliedIncomingDamageBudget += this.applyRandomDamageEvent(eventBudget);
        }
      }
      this.nextDamageEventIndex += 1;
    }
    this.nextDamageEventMs = this.damageEvents[this.nextDamageEventIndex]?.timeMs ?? Number.POSITIVE_INFINITY;
  }

  applyForcedRaidPulseDamage(baseDamagePerTarget = 0) {
    const alivePlayers = this.getAlivePlayers();
    if (!alivePlayers.length) {
      return 0;
    }
    const baseDamage = Math.max(0, Number(baseDamagePerTarget) || 0);
    if (baseDamage <= 0) {
      return 0;
    }

    let totalDamage = 0;
    for (const target of alivePlayers) {
      totalDamage += this.applyDamage(target.id, baseDamage);
    }
    return totalDamage;
  }

  applyRandomDamageEvent(eventBudget = 0) {
    const alivePlayers = this.getAlivePlayers();
    if (!alivePlayers.length) {
      return 0;
    }

    const budget = Math.max(0, Number(eventBudget) || 0);
    if (budget <= 0) {
      return 0;
    }

    const damageRatios = HOLY_PALADIN_PRACTICE_TUNING.damageRatios;
    const maxTargets = Math.min(4, alivePlayers.length);
    const hitCount = randomInt(this.rng, 1, maxTargets);
    const targets = sampleWithoutReplacement(alivePlayers, hitCount, this.rng);
    const weightedHits = [];
    for (const target of targets) {
      const incomingDamageTakenMultiplier = Math.max(0.01, Number(target.incomingDamageTakenMultiplier ?? 1));
      let weight = Math.max(0.01, randomRange(this.rng, damageRatios.singleHitMin, damageRatios.singleHitMax));
      if (this.rng() <= DAMAGE_SPIKE_CHANCE) {
        weight += Math.max(0, randomRange(this.rng, damageRatios.spikeBonusMin, damageRatios.spikeBonusMax));
      }
      weightedHits.push({
        targetId: target.id,
        weight: weight * incomingDamageTakenMultiplier,
        incomingDamageTakenMultiplier
      });
    }

    if (this.rng() < 0.1) {
      const raidPulseWeight = Math.max(0.01, randomRange(this.rng, damageRatios.raidPulseMin, damageRatios.raidPulseMax));
      for (const target of this.getAlivePlayers()) {
        const incomingDamageTakenMultiplier = Math.max(0.01, Number(target.incomingDamageTakenMultiplier ?? 1));
        weightedHits.push({
          targetId: target.id,
          weight: raidPulseWeight * incomingDamageTakenMultiplier,
          incomingDamageTakenMultiplier
        });
      }
    }

    const totalWeight = weightedHits.reduce((sum, hit) => sum + Math.max(0, Number(hit.weight) || 0), 0);
    if (totalWeight <= 0) {
      return 0;
    }

    let assignedBudget = 0;
    for (let index = 0; index < weightedHits.length; index += 1) {
      const hit = weightedHits[index];
      const isLast = index === weightedHits.length - 1;
      const plannedDamageShare = isLast
        ? Math.max(0, budget - assignedBudget)
        : Math.max(0, (budget * Math.max(0, Number(hit.weight) || 0)) / totalWeight);
      const incomingDamageTakenMultiplier = Math.max(0.01, Number(hit.incomingDamageTakenMultiplier ?? 1));
      const baseDamage = plannedDamageShare / incomingDamageTakenMultiplier;
      assignedBudget += plannedDamageShare;
      this.applyDamage(hit.targetId, baseDamage);
    }

    return assignedBudget;
  }

  applyDamage(targetId, baseDamage) {
    const target = this.findPlayer(targetId);
    if (!target || !target.alive || baseDamage <= 0) {
      return 0;
    }

    let damage = baseDamage * Math.max(0, Number(target.incomingDamageTakenMultiplier ?? 1));
    if (this.buffs.auraMasteryMs > 0) {
      damage *= 1 - AURA_MASTERY_DAMAGE_REDUCTION;
    }
    if (target.divineBlessingRemainingMs > 0) {
      damage *= 1 - DIVINE_BLESSING_DAMAGE_REDUCTION;
    }
    if (this.beaconOfSaviorTalentEnabled && target.beaconOfSaviorDamageReductionRemainingMs > 0) {
      damage *= 1 - BEACON_OF_SAVIOR_DAMAGE_REDUCTION;
    }
    if (this.selfPlayerId && target.id === this.selfPlayerId && this.buffs.divineProtectionMs > 0) {
      damage *= 1 - DIVINE_PROTECTION_DAMAGE_REDUCTION;
    }
    damage = Math.max(0, damage);

    if (damage > 0 && target.absorbShield > 0) {
      const absorbed = Math.min(damage, target.absorbShield);
      target.absorbShield = round(Math.max(0, target.absorbShield - absorbed), 2);
      damage -= absorbed;
    }

    target.hp = round(Math.max(0, target.hp - damage), 2);
    this.metrics.damageTaken = round(this.metrics.damageTaken + damage, 2);

    if (target.hp <= 0 && target.alive) {
      target.alive = false;
      this.metrics.deaths += 1;
      this.pushLog(`${target.name} 사망`, "error");
    }

    return damage;
  }

  finish(reason = "time") {
    if (this.finished) {
      return;
    }

    this.finished = true;
    this.nowMs = Math.min(this.nowMs, this.durationMs);
    this.success = reason === "time" && this.metrics.deaths === 0;

    if (reason === "all-dead") {
      this.pushLog("연습 종료: 전원 사망", "error");
      return;
    }

    if (reason === "player-dead") {
      this.pushLog("연습 종료: 캐릭터 사망", "error");
      return;
    }

    if (reason === "game-over") {
      this.pushLog("연습 종료: 게임 오버", "error");
      return;
    }

    if (reason === "manual") {
      this.pushLog(`연습 수동 종료: 사망 ${this.metrics.deaths}명`, "warn");
      return;
    }

    if (this.success) {
      this.pushLog("연습 성공: 전원 생존", "success");
    } else {
      this.pushLog(`연습 종료: 사망 ${this.metrics.deaths}명`, "error");
    }
  }

  pushLog(text, type = "info") {
    this.logs.push({
      id: ++this.logIndex,
      timeMs: this.nowMs,
      type,
      text
    });
  }

  getSnapshot() {
    const totalHealingAttempted = this.metrics.healingDone + this.metrics.overhealing;
    const overhealingPct =
      totalHealingAttempted > 0 ? (this.metrics.overhealing / totalHealingAttempted) * 100 : 0;
    const averageRaidHealthPct =
      this.raidHealthRatioSampledMs > 0
        ? (this.raidHealthRatioTimeWeightedSum / this.raidHealthRatioSampledMs) * 100
        : this.getRaidAverageHealthRatio() * 100;
    const totalCastCount = Object.values(this.metrics.casts).reduce(
      (sum, value) => sum + Math.max(0, Number(value ?? 0)),
      0
    );
    const elapsedMinutes = Math.max(1e-6, Math.min(this.nowMs, this.durationMs) / 60000);
    const cpm = totalCastCount / elapsedMinutes;

    const playerSnapshots = this.players.map((player) => ({
      id: player.id,
      name: player.name,
      classKey: player.classKey,
      className: player.className,
      classColor: player.classColor,
      roleKey: player.roleKey,
      roleName: player.roleName,
      roleIconUrl: player.roleIconUrl,
      incomingDamageTakenMultiplier: round(player.incomingDamageTakenMultiplier, 2),
      hp: round(player.hp, 2),
      maxHp: player.maxHp,
      hpRatio: round(player.maxHp > 0 ? player.hp / player.maxHp : 0, 4),
      alive: player.alive,
      eternalFlameRemainingMs: Math.max(0, Math.round(player.eternalFlameRemainingMs)),
      divineBlessingRemainingMs: Math.max(0, Math.round(player.divineBlessingRemainingMs)),
      beaconOfSaviorDamageReductionRemainingMs: Math.max(
        0,
        Math.round(player.beaconOfSaviorDamageReductionRemainingMs ?? 0)
      ),
      absorbShield: round(Math.max(0, Number(player.absorbShield) || 0), 2)
    }));

    return {
      seed: this.seed,
      nowMs: Math.min(this.nowMs, this.durationMs),
      durationMs: this.durationMs,
      progress: clamp(this.nowMs / this.durationMs, 0, 1),
      holyPower: this.holyPower,
      mana: round(this.mana, 1),
      maxMana: round(this.maxMana, 1),
      manaPct: this.maxMana > 0 ? round((this.mana / this.maxMana) * 100, 2) : 0,
      actionQueueLength: this.actionQueue.length,
      queuedAction: this.actionQueue[0]
        ? {
          spellKey: this.actionQueue[0].spellKey,
          spellName: HOLY_PALADIN_PRACTICE_SPELLS[this.actionQueue[0].spellKey]?.name ?? this.actionQueue[0].spellKey,
          targetId: this.actionQueue[0].targetId ?? null,
          queuedAtMs: Math.max(0, Number(this.actionQueue[0].queuedAtMs ?? this.nowMs))
        }
        : null,
      queueLockoutRemainingMs: Math.max(0, this.getLockoutRemainingMs()),
      spellQueueWindowMs: this.spellQueueWindowMs,
      holyShockCharges: this.holyShockCharges,
      holyShockMaxCharges: HOLY_SHOCK_MAX_CHARGES,
      holyShockRechargeRemainingMs: Math.max(0, this.holyShockRechargeRemainingMs),
      cooldowns: { ...this.cooldowns },
      buffs: { ...this.buffs },
      currentCast: this.currentCast
        ? {
          castId: this.currentCast.castId,
          spellKey: this.currentCast.spellKey,
          spellName: this.currentCast.spellName,
          targetId: this.currentCast.targetId,
          remainingMs: Math.max(0, this.currentCast.remainingMs),
          castTimeMs: this.currentCast.castTimeMs,
          startedAtMs: Math.max(0, Number(this.currentCast.startedAtMs ?? this.nowMs))
        }
        : null,
      divineBlessingUsedInCombat: Boolean(this.divineBlessingUsedInCombat),
      gcdRemainingMs: this.gcdRemainingMs,
      beacons: { ...this.beacons },
      players: playerSnapshots,
      aliveCount: playerSnapshots.filter((player) => player.alive).length,
      metrics: {
        healingDone: round(this.metrics.healingDone, 1),
        overhealing: round(this.metrics.overhealing, 1),
        healingBySpell: Object.fromEntries(
          Object.entries(this.metrics.healingBySpell).map(([spellKey, value]) => [
            spellKey,
            round(Math.max(0, Number(value) || 0), 2)
          ])
        ),
        healingByTarget: Object.fromEntries(
          Object.entries(this.metrics.healingByTarget).map(([targetId, value]) => [
            targetId,
            round(Math.max(0, Number(value) || 0), 2)
          ])
        ),
        overhealingPct: round(overhealingPct, 2),
        averageRaidHealthPct: round(averageRaidHealthPct, 2),
        damageTaken: round(this.metrics.damageTaken, 1),
        manaSpent: round(this.metrics.manaSpent, 1),
        deaths: this.metrics.deaths,
        triageHealing: round(this.metrics.triageHealing, 1),
        wastedHolyPower: Math.max(0, Math.round(this.metrics.wastedHolyPower)),
        cpm: round(cpm, 2),
        casts: { ...this.metrics.casts }
      },
      finished: this.finished,
      success: this.success,
      logs: [...this.logs]
    };
  }
}

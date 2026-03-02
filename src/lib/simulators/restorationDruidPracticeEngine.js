import {
  GLOBAL_AUTO_MANA_REGEN_PCT_OF_MAX_PER_TICK,
  GLOBAL_AUTO_MANA_REGEN_TICK_MS,
  GLOBAL_HEALER_SCALING
} from "../../components/simulators/healerPracticeGlobalSettings";
import {
  RESTORATION_DRUID_PRACTICE_TUNING
} from "../../components/simulators/restorationDruidPracticeSettings";

const BASE_GCD_MS = 1500;
const DAMAGE_EVENT_MIN_MS = 420;
const DAMAGE_EVENT_MAX_MS = 980;
const DAMAGE_SPIKE_CHANCE = 0.14;
const DAMAGE_EVENT_BUDGET_JITTER = 0.28;
const DEFAULT_DAMAGE_BREAK_EVERY_MS = 0;
const DEFAULT_DAMAGE_BREAK_DURATION_MS = 0;
const DEFAULT_DAMAGE_BUDGET_BASE_RATE_PER_SEC = 0.7;
const DEFAULT_TANK_INCOMING_DAMAGE_MULTIPLIER = 1.5;
const DEFAULT_BASE_CRIT_CHANCE = 0.25;
const DEFAULT_HASTE_PCT = 0;
const DEFAULT_INTELLECT = 10000;
const DEFAULT_MASTERY_PCT = 40;
const DEFAULT_CRIT_HEAL_MULTIPLIER = 2;
const DEFAULT_LEECH_HEALING_RATIO = 0.06;
const DEFAULT_SPELL_QUEUE_WINDOW_MS = 400;
const DEFAULT_TRIAGE_HEALTH_THRESHOLD_PCT = 30;
const DEFAULT_TRIAGE_MIN_EFFECTIVE_HEAL_PCT = 10;
const SELF_PLAYER_NAME = "나";
const DEFAULT_PANDEMIC_ENABLED = true;
const DEFAULT_ABUNDANCE_ENABLED = true;
const DEFAULT_FOREST_RENEWAL_ENABLED = true;
const DEFAULT_SOUL_OF_FOREST_ENABLED = true;
const DEFAULT_ABUNDANCE_COUNT_GERMINATION = true;
const DEFAULT_SOUL_OF_FOREST_HEAL_BONUS_RATIO = 0.6;
const DEFAULT_SOUL_OF_FOREST_ADDITIONAL_TARGET_COUNT = 2;
const PANDEMIC_MAX_CARRYOVER_RATIO = 0.3;
const ABUNDANCE_PER_REJUVENATION_RATIO = 0.08;
const ABUNDANCE_MAX_BONUS_RATIO = 0.96;
const DEFAULT_PANDEMIC_HOT_KEYS = Object.freeze(["regrowthHot", "lifebloom"]);
const ABUNDANCE_PROC_ACTIVE_MS = 1000;
const DEFAULT_CAST_TIME_HASTE_AFFECTED_BY_SPELL = Object.freeze({
  tranquility: true
});

const REJUVENATION_DURATION_MS = Math.max(1000, Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.rejuvenationMs ?? 12000));
const REJUVENATION_TICK_MS = Math.max(250, Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.rejuvenationTickMs ?? 2000));
const GERMINATION_EXTRA_DURATION_MS = 2000;
const REGROWTH_HOT_DURATION_MS = Math.max(1000, Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.regrowthHotMs ?? 6000));
const REGROWTH_HOT_TICK_MS = Math.max(250, Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.regrowthHotTickMs ?? 2000));
const WILD_GROWTH_HOT_DURATION_MS = Math.max(1000, Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.wildGrowthHotMs ?? 7000));
const WILD_GROWTH_HOT_TICK_MS = Math.max(250, Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.wildGrowthHotTickMs ?? 1000));
const LIFEBLOOM_DURATION_MS = Math.max(1000, Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.lifebloomMs ?? 15000));
const LIFEBLOOM_TICK_MS = Math.max(250, Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.lifebloomTickMs ?? 1000));
const LIFEBLOOM_STACK_STEP_MS = Math.max(
  100,
  Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.lifebloomStackStepMs ?? 5000)
);
const LIFEBLOOM_MAX_STACKS = Math.max(
  1,
  Math.floor(Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.lifebloomMaxStacks ?? 3))
);
const LIFEBLOOM_TICK_STACK_2_MULTIPLIER = Math.max(
  0,
  Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.lifebloomTickStack2Multiplier ?? 1.5)
);
const LIFEBLOOM_TICK_STACK_3_MULTIPLIER = Math.max(
  0,
  Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.lifebloomTickStack3Multiplier ?? 2)
);
const LIFEBLOOM_TRANSFER_BLOOM_WINDOW_MS = Math.max(
  0,
  Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.lifebloomTransferBloomWindowMs ?? 4000)
);
const LIFEBLOOM_EVERBLOOM_TRANSFER_RATIO = Math.max(
  0,
  Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.lifebloomEverbloomTransferRatio ?? 0.15)
);
const LIFEBLOOM_EVERBLOOM_TRANSFER_TARGET_COUNT = Math.max(
  0,
  Math.floor(Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.lifebloomEverbloomTransferTargetCount ?? 2))
);
const SOUL_OF_FOREST_LIFEBLOOM_RAPID_BLOOM_COUNT = Math.max(
  0,
  Math.floor(Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.soulOfForestLifebloomRapidBloomCount ?? 5))
);
const SOUL_OF_FOREST_LIFEBLOOM_RAPID_BLOOM_COEFFICIENT = Math.max(
  0,
  Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.soulOfForestLifebloomRapidBloomCoefficient ?? 0.5)
);
const CONVOKE_PULSE_COUNT = Math.max(1, Math.floor(Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.convokePulseCount ?? 8)));
const CONVOKE_PULSE_INTERVAL_MS = Math.max(100, Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.convokePulseIntervalMs ?? 500));
const CONVOKE_CHANNEL_DURATION_MS = Math.max(500, Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.convokeChannelMs ?? 4000));
const TRANQUILITY_CHANNEL_DURATION_MS = Math.max(1000, Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.tranquilityMs ?? 6000));
const TRANQUILITY_TICK_MS = Math.max(250, Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.tranquilityTickMs ?? 1000));
const TRANQUILITY_HOT_EXTENSION_PER_TICK_MS = Math.max(
  0,
  Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.tranquilityHotExtensionPerTickMs ?? 2000)
);
const TRANQUILITY_20P_TARGET_SCALAR = Math.sqrt(5 / 20);
const DEFAULT_TRANQUILITY_TOTAL_HEAL_COEFFICIENT = 14;
const BARKSKIN_DURATION_MS = Math.max(1000, Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.barkskinMs ?? 12000));
const BARKSKIN_DAMAGE_REDUCTION = Math.max(
  0,
  Math.min(0.95, Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.barkskinDamageReduction ?? 0.2))
);
const BASE_WILD_GROWTH_TARGET_COUNT = 5;
const SWIFTMEND_COOLDOWN_MS = Math.max(
  0,
  Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.swiftmendCooldownMs ?? 14000)
);
const SWIFTMEND_REQUIRED_HOT_COUNT = Math.max(
  1,
  Math.floor(Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.swiftmendRequiredHotCount ?? 1))
);
const SWIFTMEND_HOT_EXTENSION_MS = Math.max(
  0,
  Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.swiftmendHotExtensionMs ?? 8000)
);
const TREE_OF_LIFE_DURATION_MS = Math.max(
  0,
  Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.treeOfLifeDurationMs ?? 10000)
);
const TREE_OF_LIFE_SWIFTMEND_COUNT_REQUIRED = Math.max(
  1,
  Math.floor(Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.treeOfLifeSwiftmendCountRequired ?? 4))
);
const TREE_OF_LIFE_WILD_GROWTH_TARGET_COUNT = Math.max(
  BASE_WILD_GROWTH_TARGET_COUNT,
  Math.floor(Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.treeOfLifeWildGrowthTargetCount ?? 7))
);
const TREE_OF_LIFE_REGROWTH_INSTANT_CONFIG = RESTORATION_DRUID_PRACTICE_TUNING.durations.treeOfLifeRegrowthInstant;
const TREE_OF_LIFE_REGROWTH_INSTANT =
  typeof TREE_OF_LIFE_REGROWTH_INSTANT_CONFIG === "boolean"
    ? TREE_OF_LIFE_REGROWTH_INSTANT_CONFIG
    : true;
const TREEANT_DURATION_MS = Math.max(1000, Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.treeantDurationMs ?? 8000));
const TREEANT_NURTURE_TICK_MS = Math.max(250, Number(RESTORATION_DRUID_PRACTICE_TUNING.durations.treeantNurtureTickMs ?? 1000));
const DRUID_MASTERY_HOT_WEIGHTS = Object.freeze([1, 0.7, 0.6, 0.5, 0.4]);

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

function sampleWithoutReplacement(items, count, rng) {
  if (!Array.isArray(items) || count <= 0) {
    return [];
  }
  if (count >= items.length) {
    return [...items];
  }

  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const nextIndex = randomInt(rng, 0, index);
    [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
  }
  return copy.slice(0, count);
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

function toBooleanWithFallback(value, fallback) {
  if (typeof value === "boolean") {
    return value;
  }
  return fallback;
}

function normalizePandemicHotKeySet(value) {
  const source = Array.isArray(value) ? value : DEFAULT_PANDEMIC_HOT_KEYS;
  const validHotKeys = new Set(["regrowthHot", "lifebloom"]);
  const normalized = source
    .map((item) => String(item ?? "").trim())
    .filter((item) => validHotKeys.has(item));
  return new Set(normalized.length ? normalized : DEFAULT_PANDEMIC_HOT_KEYS);
}

function getHealAmount(spellKey) {
  const coefficient = Number(RESTORATION_DRUID_PRACTICE_TUNING.healAmountCoefficients?.[spellKey]);
  const baseAmount = Number.isFinite(coefficient) ? coefficient : 0;
  const scale = Math.max(0, Number(GLOBAL_HEALER_SCALING.intellectToHealingScale ?? 1) || 1);
  return baseAmount * scale;
}

function getAmountFromIntellectCoefficient(coefficientValue) {
  const coefficient = Math.max(0, Number(coefficientValue) || 0);
  if (coefficient <= 0) {
    return 0;
  }
  const scale = Math.max(0, Number(GLOBAL_HEALER_SCALING.intellectToHealingScale ?? 1) || 1);
  return coefficient * scale;
}

function getManaCost(spellKey) {
  const fixedOverride = Number(RESTORATION_DRUID_PRACTICE_TUNING.manaCostFixedOverrides?.[spellKey]);
  const ratio = Number(RESTORATION_DRUID_PRACTICE_TUNING.manaCostBaseManaRatios?.[spellKey]);
  const baseMana = Math.max(1, Number(RESTORATION_DRUID_PRACTICE_TUNING.baseMana ?? 100000));
  const legacyCost = Number(RESTORATION_DRUID_PRACTICE_TUNING.manaCosts?.[spellKey]);
  const resolvedCost = Number.isFinite(fixedOverride)
    ? fixedOverride
    : Number.isFinite(ratio)
      ? baseMana * ratio
      : Number.isFinite(legacyCost)
        ? legacyCost
        : 0;
  const baseCost = Math.max(0, resolvedCost);
  const scale = Math.max(0, Number(GLOBAL_HEALER_SCALING.manaCostScale ?? 1) || 1);
  const tuningScale = Math.max(0, Number(GLOBAL_HEALER_SCALING.globalManaTuningScale ?? 1) || 1);
  return baseCost * scale * tuningScale;
}

function getCastTimeMs(spellKey, fallbackMs = 0) {
  const configured = Number(RESTORATION_DRUID_PRACTICE_TUNING.castTimesMs?.[spellKey]);
  if (Number.isFinite(configured)) {
    return Math.max(0, configured);
  }
  return Math.max(0, Number(fallbackMs) || 0);
}

function isCastTimeAffectedByHaste(spellKey) {
  const key = String(spellKey ?? "").trim();
  if (!key) {
    return false;
  }
  const configuredValue = RESTORATION_DRUID_PRACTICE_TUNING.castTimeHasteAffectedBySpell?.[key];
  if (typeof configuredValue === "boolean") {
    return configuredValue;
  }
  return Boolean(DEFAULT_CAST_TIME_HASTE_AFFECTED_BY_SPELL[key]);
}

function getTranquilityTotalPerTargetBaseAmount() {
  const configuredCoefficient = Number(RESTORATION_DRUID_PRACTICE_TUNING.healAmountCoefficients?.tranquilityTotal);
  const coefficient = Number.isFinite(configuredCoefficient)
    ? configuredCoefficient
    : DEFAULT_TRANQUILITY_TOTAL_HEAL_COEFFICIENT;
  const baseAmount = Math.max(0, coefficient);
  const scale = Math.max(0, Number(GLOBAL_HEALER_SCALING.intellectToHealingScale ?? 1) || 1);
  return baseAmount * scale * TRANQUILITY_20P_TARGET_SCALAR;
}

const DEFAULT_CONVOKE_RANDOM_SPELL_POOL = Object.freeze([
  Object.freeze({ spellKey: "rejuvenation", weight: 2, healMultiplier: 1 }),
  Object.freeze({ spellKey: "regrowth", weight: 2, healMultiplier: 1 }),
  Object.freeze({ spellKey: "wildGrowth", weight: 1, healMultiplier: 1 }),
  Object.freeze({ spellKey: "lifebloom", weight: 1, healMultiplier: 1 }),
  Object.freeze({ spellKey: "swiftmend", weight: 1, healMultiplier: 1 }),
  Object.freeze({ spellKey: "nurture", weight: 1, healMultiplier: 1 })
]);

function buildConvokeRandomSpellPool() {
  const configuredPool = Array.isArray(RESTORATION_DRUID_PRACTICE_TUNING.convokeRandomSpellPool)
    ? RESTORATION_DRUID_PRACTICE_TUNING.convokeRandomSpellPool
    : [];
  const sourcePool = configuredPool.length ? configuredPool : DEFAULT_CONVOKE_RANDOM_SPELL_POOL;
  const validSpellKeySet = new Set([
    "rejuvenation",
    "regrowth",
    "wildGrowth",
    "lifebloom",
    "swiftmend",
    "nurture",
    "convokeSpirits"
  ]);

  const normalizedPool = sourcePool
    .map((entry) => {
      const spellKey = String(entry?.spellKey ?? "").trim();
      if (!validSpellKeySet.has(spellKey)) {
        return null;
      }
      const weight = Math.max(0, Number(entry?.weight ?? 1));
      const healMultiplier = Math.max(0, Number(entry?.healMultiplier ?? 1));
      if (weight <= 0 || healMultiplier <= 0) {
        return null;
      }
      return Object.freeze({
        spellKey,
        weight,
        healMultiplier
      });
    })
    .filter(Boolean);

  if (!normalizedPool.length) {
    return DEFAULT_CONVOKE_RANDOM_SPELL_POOL;
  }
  return Object.freeze(normalizedPool);
}

const CONVOKE_RANDOM_SPELL_POOL = buildConvokeRandomSpellPool();

export const RESTORATION_DRUID_PRACTICE_SPELLS = Object.freeze({
  rejuvenation: {
    key: "rejuvenation",
    name: "회복",
    requiresTarget: true,
    castTimeMs: 0,
    canMoveWhileCasting: true,
    cooldownMs: 0,
    manaCost: getManaCost("rejuvenation"),
    active: true,
    clickCastable: true
  },
  regrowth: {
    key: "regrowth",
    name: "재생",
    requiresTarget: true,
    castTimeMs: getCastTimeMs("regrowth", 1500),
    castTimeAffectedByHaste: isCastTimeAffectedByHaste("regrowth"),
    canMoveWhileCasting: false,
    cooldownMs: 0,
    manaCost: getManaCost("regrowth"),
    active: true,
    clickCastable: true
  },
  wildGrowth: {
    key: "wildGrowth",
    name: "급속 성장",
    requiresTarget: false,
    castTimeMs: getCastTimeMs("wildGrowth", 0),
    castTimeAffectedByHaste: isCastTimeAffectedByHaste("wildGrowth"),
    canMoveWhileCasting: true,
    cooldownMs: 10000,
    manaCost: getManaCost("wildGrowth"),
    active: true,
    clickCastable: false
  },
  lifebloom: {
    key: "lifebloom",
    name: "피어나는 생명",
    requiresTarget: true,
    castTimeMs: 0,
    canMoveWhileCasting: true,
    cooldownMs: 0,
    manaCost: getManaCost("lifebloom"),
    active: true,
    clickCastable: true
  },
  swiftmend: {
    key: "swiftmend",
    name: "신속한 치유",
    requiresTarget: true,
    castTimeMs: 0,
    canMoveWhileCasting: true,
    cooldownMs: SWIFTMEND_COOLDOWN_MS,
    manaCost: getManaCost("swiftmend"),
    active: true,
    clickCastable: true
  },
  convokeSpirits: {
    key: "convokeSpirits",
    name: "영혼 소집",
    requiresTarget: false,
    castTimeMs: getCastTimeMs("convokeSpirits", CONVOKE_CHANNEL_DURATION_MS),
    castTimeAffectedByHaste: isCastTimeAffectedByHaste("convokeSpirits"),
    canMoveWhileCasting: true,
    cooldownMs: 60000,
    manaCost: getManaCost("convokeSpirits"),
    active: true,
    clickCastable: false
  },
  tranquility: {
    key: "tranquility",
    name: "평온",
    requiresTarget: false,
    castTimeMs: getCastTimeMs("tranquility", TRANQUILITY_CHANNEL_DURATION_MS),
    castTimeAffectedByHaste: isCastTimeAffectedByHaste("tranquility"),
    canMoveWhileCasting: false,
    cooldownMs: 180000,
    manaCost: getManaCost("tranquility"),
    active: true,
    clickCastable: false
  },
  barkskin: {
    key: "barkskin",
    name: "나무껍질",
    requiresTarget: false,
    castTimeMs: 0,
    canMoveWhileCasting: true,
    cooldownMs: 60000,
    manaCost: getManaCost("barkskin"),
    active: true,
    clickCastable: false,
    triggersGlobalCooldown: false
  }
});

export const RESTORATION_DRUID_ACTIVE_SPELL_KEYS = Object.freeze(
  Object.values(RESTORATION_DRUID_PRACTICE_SPELLS)
    .filter((spell) => spell.active)
    .map((spell) => spell.key)
);

export const RESTORATION_DRUID_CLICK_CASTABLE_KEYS = Object.freeze(
  Object.values(RESTORATION_DRUID_PRACTICE_SPELLS)
    .filter((spell) => spell.active && spell.clickCastable)
    .map((spell) => spell.key)
);

export const RESTORATION_DRUID_DEFAULT_KEYBINDS = Object.freeze({
  rejuvenation: "1",
  regrowth: "2",
  wildGrowth: "3",
  lifebloom: "4",
  swiftmend: "R",
  convokeSpirits: "G",
  tranquility: "T",
  barkskin: "V"
});

const HEALING_METRIC_SPELL_KEYS = Object.freeze([
  ...RESTORATION_DRUID_ACTIVE_SPELL_KEYS,
  "nurture",
  "everbloom",
  "leech"
]);

function createHealingBySpellMetrics() {
  const metrics = {};
  for (const spellKey of HEALING_METRIC_SPELL_KEYS) {
    metrics[spellKey] = 0;
  }
  return metrics;
}

export class RestorationDruidPracticeEngine {
  constructor(config = {}) {
    const seed = parseSeed(config.seed);
    this.seed = seed;
    this.rng = createRng(seed);

    this.baseHealth = Math.max(1, Number(config.dummyBaseHealth ?? RESTORATION_DRUID_PRACTICE_TUNING.dummyBaseHealth));
    this.maxMana = Math.max(0, Number(config.baseMana ?? RESTORATION_DRUID_PRACTICE_TUNING.baseMana));
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
    this.baseCritChance = clamp(Number(config.baseCritChance ?? DEFAULT_BASE_CRIT_CHANCE), 0, 1);
    this.defaultCritHealMultiplier = Math.max(1, Number(config.defaultCritHealMultiplier ?? DEFAULT_CRIT_HEAL_MULTIPLIER));
    this.autoManaRegenTickMs = GLOBAL_AUTO_MANA_REGEN_TICK_MS;
    this.autoManaRegenPctOfMaxPerTick = GLOBAL_AUTO_MANA_REGEN_PCT_OF_MAX_PER_TICK;
    this.leechHealingRatio = Math.max(0, Number(config.leechHealingRatio ?? DEFAULT_LEECH_HEALING_RATIO));
    this.spellQueueWindowMs = clamp(Number(config.queueWindowMs ?? DEFAULT_SPELL_QUEUE_WINDOW_MS), 0, 2000);
    this.hastePct = Math.max(0, Number(config.hastePct ?? DEFAULT_HASTE_PCT));
    this.intellect = Math.max(0, Number(config.intellect ?? DEFAULT_INTELLECT));
    this.masteryPct = Math.max(0, Number(config.masteryPct ?? DEFAULT_MASTERY_PCT));
    const talentConfig =
      RESTORATION_DRUID_PRACTICE_TUNING?.talents && typeof RESTORATION_DRUID_PRACTICE_TUNING.talents === "object"
        ? RESTORATION_DRUID_PRACTICE_TUNING.talents
        : {};
    this.pandemicEnabled = toBooleanWithFallback(
      config.pandemicEnabled,
      toBooleanWithFallback(talentConfig.pandemicEnabled, DEFAULT_PANDEMIC_ENABLED)
    );
    this.abundanceEnabled = toBooleanWithFallback(
      config.abundanceEnabled,
      toBooleanWithFallback(talentConfig.abundanceEnabled, DEFAULT_ABUNDANCE_ENABLED)
    );
    this.forestRenewalEnabled = toBooleanWithFallback(
      config.forestRenewalEnabled,
      toBooleanWithFallback(talentConfig.forestRenewalEnabled, DEFAULT_FOREST_RENEWAL_ENABLED)
    );
    this.soulOfForestEnabled = toBooleanWithFallback(
      config.soulOfForestEnabled,
      toBooleanWithFallback(talentConfig.soulOfForestEnabled, DEFAULT_SOUL_OF_FOREST_ENABLED)
    );
    this.soulOfForestHealBonusRatio = Math.max(
      0,
      Number(
        config.soulOfForestHealBonusRatio ??
          talentConfig.soulOfForestHealBonusRatio ??
          DEFAULT_SOUL_OF_FOREST_HEAL_BONUS_RATIO
      )
    );
    this.soulOfForestAdditionalTargetCount = Math.max(
      0,
      Math.floor(
        Number(
          config.soulOfForestAdditionalTargetCount ??
            talentConfig.soulOfForestAdditionalTargetCount ??
            DEFAULT_SOUL_OF_FOREST_ADDITIONAL_TARGET_COUNT
        )
      )
    );
    this.abundanceCountGerminationAsRejuvenation = toBooleanWithFallback(
      config.abundanceCountGerminationAsRejuvenation,
      toBooleanWithFallback(
        talentConfig.abundanceCountGerminationAsRejuvenation,
        DEFAULT_ABUNDANCE_COUNT_GERMINATION
      )
    );
    this.pandemicHotKeySet = normalizePandemicHotKeySet(
      Array.isArray(config.pandemicHotKeys) ? config.pandemicHotKeys : talentConfig.pandemicHotKeys
    );
    this.treeantDurationMs = Math.max(1000, Number(config.treeantDurationMs ?? TREEANT_DURATION_MS));
    this.treeantNurtureTickMs = Math.max(250, Number(config.treeantNurtureTickMs ?? TREEANT_NURTURE_TICK_MS));
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
        rejuvenationRemainingMs: 0,
        rejuvenationTickTimerMs: 0,
        rejuvenationTickHealMultiplier: 1,
        germinationRemainingMs: 0,
        germinationTickTimerMs: 0,
        germinationTickHealMultiplier: 1,
        regrowthHotRemainingMs: 0,
        regrowthHotTickTimerMs: 0,
        regrowthHotTickHealMultiplier: 1,
        wildGrowthHotRemainingMs: 0,
        wildGrowthHotTickTimerMs: 0,
        lifebloomRemainingMs: 0,
        lifebloomTickTimerMs: 0,
        lifebloomElapsedMs: 0,
        lifebloomStack: 0
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

    this.cooldowns = RESTORATION_DRUID_ACTIVE_SPELL_KEYS.reduce((acc, spellKey) => {
      acc[spellKey] = 0;
      return acc;
    }, {});
    this.gcdRemainingMs = 0;
    this.currentCast = null;
    this.castSequence = 0;

    this.buffs = {
      barkskinMs: 0,
      tranquilityMs: 0,
      convokeMs: 0,
      treeOfLifeMs: 0
    };
    this.tranquilityTickTimerMs = 0;
    this.tranquilityTickIntervalMs = TRANQUILITY_TICK_MS;
    this.tranquilityTickHealAmount = 0;
    this.tranquilityHotExtensionPerTickMs = TRANQUILITY_HOT_EXTENSION_PER_TICK_MS;
    this.convokeTickTimerMs = 0;

    this.actionQueue = [];
    this.offGcdActionQueue = [];

    this.treeants = [];
    this.nextTreeantId = 1;
    this.swiftmendCastCountTowardsTreeOfLife = 0;
    this.soulOfForestPending = false;
    this.lifebloomTargetId = null;

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
      casts: RESTORATION_DRUID_ACTIVE_SPELL_KEYS.reduce((acc, spellKey) => {
        acc[spellKey] = 0;
        return acc;
      }, {})
    };

    this.logIndex = 0;
    this.logs = [];

    this.damageEvents = [];
    this.nextDamageEventIndex = 0;
    this.nextDamageEventMs = Number.POSITIVE_INFINITY;
    this.initializeDamageEventTimeline();
    this.raidHealthRatioTimeWeightedSum = 0;
    this.raidHealthRatioSampledMs = 0;
    this.lifebloomHotActiveSampledMs = 0;
    this.lifebloomHotSampledMs = 0;
    this.selfPlayerId =
      this.players.find((player) => String(player?.name ?? "").trim() === SELF_PLAYER_NAME)?.id ?? null;

    this.pushLog(`연습 시작: ${Math.round(this.durationMs / 1000)}초`, "info");
  }

  findPlayer(playerId) {
    if (!playerId) {
      return null;
    }
    return this.players.find((player) => player.id === playerId) ?? null;
  }

  getAlivePlayers() {
    return this.players.filter((player) => player.alive);
  }

  hasAnyAliveLifebloomHot() {
    return this.players.some((player) => player.alive && player.lifebloomRemainingMs > 0);
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

  accumulateLifebloomUptimeSample(durationMs, activeAtStart = false) {
    const dt = Math.max(0, Number(durationMs) || 0);
    if (dt <= 0) {
      return;
    }
    const hasActiveLifebloom = Boolean(activeAtStart) || this.hasAnyAliveLifebloomHot();
    if (hasActiveLifebloom) {
      this.lifebloomHotActiveSampledMs += dt;
    }
    this.lifebloomHotSampledMs += dt;
  }

  getMostInjuredAlivePlayers(count) {
    return this.players
      .filter((player) => player.alive && player.hp < player.maxHp)
      .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)
      .slice(0, count);
  }

  getAdditionalSoulOfForestTargets(primaryTargetId, additionalCount) {
    const count = Math.max(0, Math.floor(Number(additionalCount) || 0));
    if (!count) {
      return [];
    }
    const excludedId = String(primaryTargetId ?? "").trim();
    return this.players
      .filter((player) => player.alive && player.id !== excludedId)
      .sort((a, b) => (a.maxHp > 0 ? a.hp / a.maxHp : 1) - (b.maxHp > 0 ? b.hp / b.maxHp : 1))
      .slice(0, count);
  }

  getLowestHealthAlivePlayer() {
    const targets = this.players
      .filter((player) => player.alive)
      .sort((a, b) => (a.maxHp > 0 ? a.hp / a.maxHp : 1) - (b.maxHp > 0 ? b.hp / b.maxHp : 1));
    return targets[0] ?? null;
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
      if (this.lifebloomTargetId === player.id) {
        this.lifebloomTargetId = null;
      }
      this.pushLog(`${player.name} 사망`, "error");
    }
    return true;
  }

  queueAction(action) {
    if (this.finished) {
      return false;
    }
    if (!action || action.type !== "cast") {
      return false;
    }

    const spell = RESTORATION_DRUID_PRACTICE_SPELLS[action.spellKey];
    if (!spell || !spell.active) {
      return false;
    }

    if (spell.triggersGlobalCooldown === false) {
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

  getHasteAdjustedDurationMs(baseMs, minMs = 100) {
    const base = Math.max(0, Number(baseMs) || 0);
    if (base <= 0) {
      return 0;
    }
    const hasteFactor = 1 + this.hastePct / 100;
    const adjusted = base / Math.max(0.01, hasteFactor);
    return Math.max(Math.max(1, Number(minMs) || 1), adjusted);
  }

  getTargetActiveDruidHotCount(target) {
    if (!target || !target.alive) {
      return 0;
    }

    return [
      target.rejuvenationRemainingMs,
      target.germinationRemainingMs,
      target.regrowthHotRemainingMs,
      target.wildGrowthHotRemainingMs,
      target.lifebloomRemainingMs
    ].reduce((count, remainingMs) => count + (remainingMs > 0 ? 1 : 0), 0);
  }

  canCastSwiftmendOnTarget(target) {
    return this.getTargetActiveDruidHotCount(target) >= SWIFTMEND_REQUIRED_HOT_COUNT;
  }

  extendTargetDruidHotsBy(target, durationMs) {
    if (!target || !target.alive) {
      return;
    }
    const extensionMs = Math.max(0, Number(durationMs) || 0);
    if (extensionMs <= 0) {
      return;
    }

    if (target.rejuvenationRemainingMs > 0) {
      target.rejuvenationRemainingMs += extensionMs;
    }
    if (target.germinationRemainingMs > 0) {
      target.germinationRemainingMs += extensionMs;
    }
    if (target.regrowthHotRemainingMs > 0) {
      target.regrowthHotRemainingMs += extensionMs;
    }
    if (target.wildGrowthHotRemainingMs > 0) {
      target.wildGrowthHotRemainingMs += extensionMs;
    }
    if (target.lifebloomRemainingMs > 0) {
      target.lifebloomRemainingMs += extensionMs;
    }
  }

  applyRejuvenationHotToTarget(target, healMultiplier = 1) {
    if (!target || !target.alive) {
      return "none";
    }
    const multiplier = Math.max(0, Number(healMultiplier) || 0);
    if (target.rejuvenationRemainingMs > 0) {
      target.germinationRemainingMs = REJUVENATION_DURATION_MS + GERMINATION_EXTRA_DURATION_MS;
      target.germinationTickTimerMs = REJUVENATION_TICK_MS;
      target.germinationTickHealMultiplier = multiplier;
      return "germination";
    }
    target.rejuvenationRemainingMs = REJUVENATION_DURATION_MS;
    target.rejuvenationTickTimerMs = REJUVENATION_TICK_MS;
    target.rejuvenationTickHealMultiplier = multiplier;
    return "rejuvenation";
  }

  applyRegrowthSpellToTarget(target, healMultiplier = 1) {
    if (!target || !target.alive) {
      return { effective: 0, overheal: 0, isCritical: false, critChance: 0 };
    }
    const multiplier = Math.max(0, Number(healMultiplier) || 0);
    const result = this.applyHeal(target.id, getHealAmount("regrowth") * multiplier, true, {
      spellKey: "regrowth",
      isDirectHeal: true,
      canCrit: true
    });
    target.regrowthHotRemainingMs = this.getPandemicRefreshedDurationMs(
      "regrowthHot",
      REGROWTH_HOT_DURATION_MS,
      target.regrowthHotRemainingMs
    );
    target.regrowthHotTickTimerMs = REGROWTH_HOT_TICK_MS;
    target.regrowthHotTickHealMultiplier = multiplier;
    return result;
  }

  getLifebloomStackByElapsedMs(elapsedMs = 0) {
    if (LIFEBLOOM_MAX_STACKS <= 1) {
      return 1;
    }
    const elapsed = Math.max(0, Number(elapsedMs) || 0);
    const stack = 1 + Math.floor(elapsed / Math.max(1, LIFEBLOOM_STACK_STEP_MS));
    return Math.max(1, Math.min(LIFEBLOOM_MAX_STACKS, stack));
  }

  getLifebloomTickHealMultiplierByStack(stack = 1) {
    const normalizedStack = Math.max(1, Math.floor(Number(stack) || 1));
    if (normalizedStack >= 3) {
      return LIFEBLOOM_TICK_STACK_3_MULTIPLIER;
    }
    if (normalizedStack >= 2) {
      return LIFEBLOOM_TICK_STACK_2_MULTIPLIER;
    }
    return 1;
  }

  getCurrentLifebloomTarget() {
    const configuredTargetId = String(this.lifebloomTargetId ?? "").trim();
    if (configuredTargetId) {
      const configuredTarget = this.findPlayer(configuredTargetId);
      if (configuredTarget?.alive && configuredTarget.lifebloomRemainingMs > 0) {
        return configuredTarget;
      }
    }
    const fallbackTarget =
      this.players.find((player) => player.alive && Number(player.lifebloomRemainingMs) > 0) ?? null;
    if (fallbackTarget?.id) {
      this.lifebloomTargetId = fallbackTarget.id;
    } else {
      this.lifebloomTargetId = null;
    }
    return fallbackTarget;
  }

  clearLifebloomFromTarget(target) {
    if (!target) {
      return;
    }
    target.lifebloomRemainingMs = 0;
    target.lifebloomTickTimerMs = 0;
    target.lifebloomElapsedMs = 0;
    target.lifebloomStack = 0;
  }

  applyEverbloomTransferFromLifebloom(sourceTargetId, sourceEffectiveHealAmount) {
    const sourceAmount = Math.max(0, Number(sourceEffectiveHealAmount) || 0);
    if (
      sourceAmount <= 0 ||
      LIFEBLOOM_EVERBLOOM_TRANSFER_RATIO <= 0 ||
      LIFEBLOOM_EVERBLOOM_TRANSFER_TARGET_COUNT <= 0
    ) {
      return 0;
    }
    const excludedId = String(sourceTargetId ?? "").trim();
    const targets = this.players
      .filter((player) => player.alive && player.id !== excludedId)
      .sort((a, b) => (a.maxHp > 0 ? a.hp / a.maxHp : 1) - (b.maxHp > 0 ? b.hp / b.maxHp : 1))
      .slice(0, LIFEBLOOM_EVERBLOOM_TRANSFER_TARGET_COUNT);
    let totalEffective = 0;
    for (const target of targets) {
      const result = this.applyHeal(target.id, sourceAmount * LIFEBLOOM_EVERBLOOM_TRANSFER_RATIO, false, {
        spellKey: "everbloom",
        canCrit: false,
        suppressLeech: true
      });
      totalEffective += Math.max(0, Number(result?.effective ?? 0));
    }
    return totalEffective;
  }

  applyLifebloomBloomToTarget(target, bloomCoefficientSpellKey) {
    if (!target || !target.alive) {
      return { effective: 0, overheal: 0, isCritical: false, critChance: 0 };
    }
    const coefficientKey = String(bloomCoefficientSpellKey ?? "").trim();
    const coefficientSpellKey = coefficientKey || "lifebloomBloomExpire";
    const configuredAmount = getHealAmount(coefficientSpellKey);
    const fallbackAmount = getHealAmount("lifebloomBloom");
    const bloomHealAmount = configuredAmount > 0 ? configuredAmount : fallbackAmount;
    const result = this.applyHeal(target.id, bloomHealAmount, false, {
      spellKey: "lifebloom",
      isDirectHeal: true
    });
    if (result.effective > 0) {
      this.applyEverbloomTransferFromLifebloom(target.id, result.effective);
    }
    return result;
  }

  triggerSoulOfForestRapidLifebloomBlooms() {
    if (
      SOUL_OF_FOREST_LIFEBLOOM_RAPID_BLOOM_COUNT <= 0 ||
      SOUL_OF_FOREST_LIFEBLOOM_RAPID_BLOOM_COEFFICIENT <= 0
    ) {
      return;
    }
    const lifebloomTarget = this.getCurrentLifebloomTarget();
    if (!lifebloomTarget) {
      return;
    }

    const rapidBloomAmount = getAmountFromIntellectCoefficient(SOUL_OF_FOREST_LIFEBLOOM_RAPID_BLOOM_COEFFICIENT);
    if (rapidBloomAmount <= 0) {
      return;
    }

    let totalEffective = 0;
    for (let index = 0; index < SOUL_OF_FOREST_LIFEBLOOM_RAPID_BLOOM_COUNT; index += 1) {
      const result = this.applyHeal(lifebloomTarget.id, rapidBloomAmount, false, {
        spellKey: "lifebloom",
        isDirectHeal: true
      });
      totalEffective += Math.max(0, Number(result?.effective ?? 0));
      if (result.effective > 0) {
        this.applyEverbloomTransferFromLifebloom(lifebloomTarget.id, result.effective);
      }
    }
    if (totalEffective > 0) {
      this.pushLog(`숲의 영혼: 피생 급속 개화 ${fmtSigned(totalEffective)} (${SOUL_OF_FOREST_LIFEBLOOM_RAPID_BLOOM_COUNT}회)`, "heal");
    }
  }

  extendAllDruidHotsBy(durationMs) {
    const extensionMs = Math.max(0, Number(durationMs) || 0);
    if (extensionMs <= 0) {
      return;
    }

    for (const player of this.players) {
      if (!player.alive) {
        continue;
      }
      if (player.rejuvenationRemainingMs > 0) {
        player.rejuvenationRemainingMs += extensionMs;
      }
      if (player.germinationRemainingMs > 0) {
        player.germinationRemainingMs += extensionMs;
      }
      if (player.regrowthHotRemainingMs > 0) {
        player.regrowthHotRemainingMs += extensionMs;
      }
      if (player.wildGrowthHotRemainingMs > 0) {
        player.wildGrowthHotRemainingMs += extensionMs;
      }
      if (player.lifebloomRemainingMs > 0) {
        player.lifebloomRemainingMs += extensionMs;
      }
    }
  }

  countActiveRejuvenationEffects() {
    let activeCount = 0;
    for (const player of this.players) {
      if (!player.alive) {
        continue;
      }
      if (player.rejuvenationRemainingMs > 0) {
        activeCount += 1;
      }
      if (this.abundanceCountGerminationAsRejuvenation && player.germinationRemainingMs > 0) {
        activeCount += 1;
      }
    }
    return activeCount;
  }

  getAbundanceBonusRatio() {
    if (!this.abundanceEnabled) {
      return 0;
    }
    const activeRejuvenationCount = this.countActiveRejuvenationEffects();
    return clamp(activeRejuvenationCount * ABUNDANCE_PER_REJUVENATION_RATIO, 0, ABUNDANCE_MAX_BONUS_RATIO);
  }

  getResolvedSpellManaCost(spell) {
    const baseManaCost = Math.max(0, Number(spell?.manaCost) || 0);
    if (!spell || !this.abundanceEnabled || spell.key !== "regrowth") {
      return baseManaCost;
    }
    const reductionRatio = this.getAbundanceBonusRatio();
    return baseManaCost * Math.max(0, 1 - reductionRatio);
  }

  getAdditionalCritChanceForSpell(spellKey, options = {}) {
    if (!this.abundanceEnabled || spellKey !== "regrowth" || options.isDirectHeal === false) {
      return 0;
    }
    return this.getAbundanceBonusRatio();
  }

  getPandemicRefreshedDurationMs(hotKey, baseDurationMs, remainingMs) {
    const baseDuration = Math.max(0, Number(baseDurationMs) || 0);
    if (
      !this.pandemicEnabled ||
      !this.pandemicHotKeySet.has(String(hotKey ?? "")) ||
      baseDuration <= 0
    ) {
      return baseDuration;
    }
    const carryCapMs = baseDuration * PANDEMIC_MAX_CARRYOVER_RATIO;
    const carryoverMs = Math.min(carryCapMs, Math.max(0, Number(remainingMs) || 0));
    return baseDuration + carryoverMs;
  }

  getDruidMasteryHealingMultiplier(target) {
    if (!target || this.masteryPct <= 0) {
      return 1;
    }

    const activeHotCount = [
      target.rejuvenationRemainingMs,
      target.germinationRemainingMs,
      target.regrowthHotRemainingMs,
      target.wildGrowthHotRemainingMs,
      target.lifebloomRemainingMs
    ].reduce((count, remainingMs) => count + (remainingMs > 0 ? 1 : 0), 0);
    if (activeHotCount <= 0) {
      return 1;
    }

    const masteryPerHot = this.masteryPct / 100;
    const cappedHotCount = Math.max(0, Math.min(DRUID_MASTERY_HOT_WEIGHTS.length, activeHotCount));
    let effectiveHotWeight = 0;
    for (let index = 0; index < cappedHotCount; index += 1) {
      effectiveHotWeight += Math.max(0, Number(DRUID_MASTERY_HOT_WEIGHTS[index] ?? 0));
    }

    return 1 + masteryPerHot * effectiveHotWeight;
  }

  step(dtMs, runtimeState = {}) {
    if (this.finished) {
      return;
    }

    const dt = clamp(Number(dtMs) || 0, 0, 250);
    if (!dt) {
      return;
    }
    const lifebloomActiveAtStepStart = this.hasAnyAliveLifebloomHot();

    this.nowMs += dt;

    this.gcdRemainingMs = Math.max(0, this.gcdRemainingMs - dt);
    for (const spellKey of RESTORATION_DRUID_ACTIVE_SPELL_KEYS) {
      this.cooldowns[spellKey] = Math.max(0, this.cooldowns[spellKey] - dt);
    }

    this.buffs.barkskinMs = Math.max(0, this.buffs.barkskinMs - dt);
    this.buffs.tranquilityMs = Math.max(0, this.buffs.tranquilityMs - dt);
    this.buffs.convokeMs = Math.max(0, this.buffs.convokeMs - dt);
    this.buffs.treeOfLifeMs = Math.max(0, this.buffs.treeOfLifeMs - dt);

    this.tickAutoManaRegen(dt);
    this.tickHealOverTimeEffects(dt);
    this.tickTranquility(dt);
    this.tickConvoke(dt);
    this.tickTreeants(dt);

    if (runtimeState.isPlayerMoving) {
      this.interruptCurrentCastByMovement();
    }

    this.processOffGcdActionQueue();
    this.advanceCurrentCast(dt);
    this.processActionQueue();
    this.processDamageEvents();
    this.accumulateRaidHealthSample(dt);
    this.accumulateLifebloomUptimeSample(dt, lifebloomActiveAtStepStart);

    if (!this.getAlivePlayers().length) {
      this.finish("all-dead");
      return;
    }

    if (this.nowMs >= this.durationMs) {
      this.finish();
    }
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

  tickHealOverTimeEffects(dt) {
    for (const player of this.players) {
      if (!player.alive) {
        continue;
      }

      player.rejuvenationRemainingMs = Math.max(0, player.rejuvenationRemainingMs - dt);
      player.germinationRemainingMs = Math.max(0, player.germinationRemainingMs - dt);
      player.regrowthHotRemainingMs = Math.max(0, player.regrowthHotRemainingMs - dt);
      player.wildGrowthHotRemainingMs = Math.max(0, player.wildGrowthHotRemainingMs - dt);
      const lifebloomBefore = player.lifebloomRemainingMs;
      player.lifebloomRemainingMs = Math.max(0, player.lifebloomRemainingMs - dt);
      if (player.lifebloomRemainingMs > 0) {
        player.lifebloomElapsedMs = Math.max(0, Number(player.lifebloomElapsedMs ?? 0) + dt);
        player.lifebloomStack = this.getLifebloomStackByElapsedMs(player.lifebloomElapsedMs);
      } else {
        player.lifebloomElapsedMs = 0;
        player.lifebloomStack = 0;
      }
      if (player.rejuvenationRemainingMs <= 0) {
        player.rejuvenationTickHealMultiplier = 1;
      }
      if (player.germinationRemainingMs <= 0) {
        player.germinationTickHealMultiplier = 1;
      }
      if (player.regrowthHotRemainingMs <= 0) {
        player.regrowthHotTickHealMultiplier = 1;
      }

      player.rejuvenationTickTimerMs -= dt;
      player.germinationTickTimerMs -= dt;
      player.regrowthHotTickTimerMs -= dt;
      player.wildGrowthHotTickTimerMs -= dt;
      player.lifebloomTickTimerMs -= dt;

      while (player.rejuvenationRemainingMs > 0 && player.rejuvenationTickTimerMs <= 0) {
        this.applyHeal(
          player.id,
          getHealAmount("rejuvenationTick") * Math.max(0, Number(player.rejuvenationTickHealMultiplier ?? 1)),
          false,
          {
            spellKey: "rejuvenation",
            canCrit: false,
            suppressLeech: true
          }
        );
        player.rejuvenationTickTimerMs += REJUVENATION_TICK_MS;
      }

      while (player.germinationRemainingMs > 0 && player.germinationTickTimerMs <= 0) {
        this.applyHeal(
          player.id,
          getHealAmount("rejuvenationTick") * Math.max(0, Number(player.germinationTickHealMultiplier ?? 1)),
          false,
          {
            spellKey: "rejuvenation",
            canCrit: false,
            suppressLeech: true
          }
        );
        player.germinationTickTimerMs += REJUVENATION_TICK_MS;
      }

      while (player.regrowthHotRemainingMs > 0 && player.regrowthHotTickTimerMs <= 0) {
        this.applyHeal(
          player.id,
          getHealAmount("regrowthHotTick") * Math.max(0, Number(player.regrowthHotTickHealMultiplier ?? 1)),
          false,
          {
            spellKey: "regrowth",
            canCrit: false,
            suppressLeech: true
          }
        );
        player.regrowthHotTickTimerMs += REGROWTH_HOT_TICK_MS;
      }

      while (player.wildGrowthHotRemainingMs > 0 && player.wildGrowthHotTickTimerMs <= 0) {
        this.applyHeal(player.id, getHealAmount("wildGrowthHotTick"), false, {
          spellKey: "wildGrowth",
          canCrit: false,
          suppressLeech: true
        });
        player.wildGrowthHotTickTimerMs += WILD_GROWTH_HOT_TICK_MS;
      }

      while (player.lifebloomRemainingMs > 0 && player.lifebloomTickTimerMs <= 0) {
        const tickHealMultiplier = this.getLifebloomTickHealMultiplierByStack(player.lifebloomStack);
        const result = this.applyHeal(player.id, getHealAmount("lifebloomTick") * tickHealMultiplier, false, {
          spellKey: "lifebloom",
          canCrit: false,
          suppressLeech: true
        });
        if (result.effective > 0) {
          this.applyEverbloomTransferFromLifebloom(player.id, result.effective);
        }
        player.lifebloomTickTimerMs += LIFEBLOOM_TICK_MS;
      }

      if (lifebloomBefore > 0 && player.lifebloomRemainingMs <= 0) {
        this.applyLifebloomBloomToTarget(player, "lifebloomBloomExpire");
        if (this.lifebloomTargetId === player.id) {
          this.lifebloomTargetId = null;
        }
      }
    }
  }

  tickTranquility(dt) {
    if (this.buffs.tranquilityMs <= 0) {
      this.tranquilityTickTimerMs = 0;
      this.tranquilityTickHealAmount = 0;
      return;
    }

    const tickIntervalMs = Math.max(100, Number(this.tranquilityTickIntervalMs || TRANQUILITY_TICK_MS));
    const tickHealAmount = Math.max(0, Number(this.tranquilityTickHealAmount) || 0);
    this.tranquilityTickTimerMs -= dt;
    while (this.buffs.tranquilityMs > 0 && this.tranquilityTickTimerMs <= 0) {
      for (const player of this.getAlivePlayers()) {
        this.applyHeal(player.id, tickHealAmount, false, {
          spellKey: "tranquility",
          canCrit: false,
          suppressLeech: true
        });
      }
      this.extendAllDruidHotsBy(this.tranquilityHotExtensionPerTickMs);
      this.tranquilityTickTimerMs += tickIntervalMs;
    }
  }

  startTranquilityChannel(durationMs = TRANQUILITY_CHANNEL_DURATION_MS) {
    const channelMs = Math.max(0, Number(durationMs) || 0);
    if (channelMs <= 0) {
      this.buffs.tranquilityMs = 0;
      this.tranquilityTickTimerMs = 0;
      this.tranquilityTickHealAmount = 0;
      return;
    }

    const tickIntervalMs = this.getHasteAdjustedDurationMs(TRANQUILITY_TICK_MS, 100);
    const estimatedTickCount = Math.max(1, Math.ceil(channelMs / Math.max(1, tickIntervalMs)));
    const totalPerTargetAmount = getTranquilityTotalPerTargetBaseAmount();

    this.buffs.tranquilityMs = channelMs;
    this.tranquilityTickIntervalMs = tickIntervalMs;
    this.tranquilityTickTimerMs = tickIntervalMs;
    this.tranquilityTickHealAmount = totalPerTargetAmount / estimatedTickCount;
    this.pushLog("평온 채널 시작", "buff");
  }

  startConvokeChannel(durationMs = CONVOKE_CHANNEL_DURATION_MS) {
    const channelMs = Math.max(0, Number(durationMs) || 0);
    if (channelMs <= 0) {
      this.buffs.convokeMs = 0;
      this.convokeTickTimerMs = 0;
      return;
    }
    this.buffs.convokeMs = channelMs;
    this.convokeTickTimerMs = 1;
    this.pushLog("영혼 소집 채널 시작", "buff");
  }

  selectConvokeRandomSpellEntry() {
    if (!CONVOKE_RANDOM_SPELL_POOL.length) {
      return null;
    }

    const totalWeight = CONVOKE_RANDOM_SPELL_POOL.reduce(
      (sum, entry) => sum + Math.max(0, Number(entry.weight) || 0),
      0
    );
    if (totalWeight <= 0) {
      return CONVOKE_RANDOM_SPELL_POOL[0];
    }

    let roll = this.rng() * totalWeight;
    for (const entry of CONVOKE_RANDOM_SPELL_POOL) {
      roll -= Math.max(0, Number(entry.weight) || 0);
      if (roll <= 0) {
        return entry;
      }
    }
    return CONVOKE_RANDOM_SPELL_POOL[CONVOKE_RANDOM_SPELL_POOL.length - 1];
  }

  executeConvokePulse() {
    const entry = this.selectConvokeRandomSpellEntry();
    if (!entry) {
      return;
    }
    const healMultiplier = Math.max(0, Number(entry.healMultiplier ?? 1) || 1);

    switch (entry.spellKey) {
      case "rejuvenation": {
        const target = this.getLowestHealthAlivePlayer();
        if (!target) {
          return;
        }
        this.applyHeal(target.id, getHealAmount("rejuvenationTick") * 1.25 * healMultiplier, false, {
          spellKey: "convokeSpirits",
          isDirectHeal: true,
          canCrit: false
        });
        return;
      }
      case "regrowth": {
        const target = this.getLowestHealthAlivePlayer();
        if (!target) {
          return;
        }
        this.applyHeal(target.id, getHealAmount("regrowth") * 0.55 * healMultiplier, false, {
          spellKey: "convokeSpirits",
          isDirectHeal: true,
          canCrit: true
        });
        return;
      }
      case "wildGrowth": {
        const targets = this.getMostInjuredAlivePlayers(5);
        for (const target of targets) {
          this.applyHeal(target.id, getHealAmount("wildGrowth") * 0.38 * healMultiplier, false, {
            spellKey: "convokeSpirits",
            isDirectHeal: true,
            canCrit: false
          });
        }
        return;
      }
      case "lifebloom": {
        const target = this.getLowestHealthAlivePlayer();
        if (!target) {
          return;
        }
        this.applyHeal(target.id, getHealAmount("lifebloomTick") * 1.6 * healMultiplier, false, {
          spellKey: "convokeSpirits",
          isDirectHeal: true,
          canCrit: false
        });
        return;
      }
      case "swiftmend": {
        const target = this.getLowestHealthAlivePlayer();
        if (!target) {
          return;
        }
        this.applyHeal(target.id, getHealAmount("swiftmend") * 0.52 * healMultiplier, false, {
          spellKey: "convokeSpirits",
          isDirectHeal: true,
          canCrit: true
        });
        return;
      }
      case "nurture": {
        const target = this.getLowestHealthAlivePlayer();
        if (!target) {
          return;
        }
        this.applyHeal(target.id, getHealAmount("nurture") * healMultiplier, false, {
          spellKey: "convokeSpirits",
          isDirectHeal: true,
          canCrit: false
        });
        return;
      }
      default: {
        const target = this.getLowestHealthAlivePlayer();
        if (!target) {
          return;
        }
        this.applyHeal(target.id, getHealAmount("convokeSpirits") * healMultiplier, false, {
          spellKey: "convokeSpirits",
          isDirectHeal: true
        });
      }
    }
  }

  tickConvoke(dt) {
    if (this.buffs.convokeMs <= 0) {
      this.convokeTickTimerMs = 0;
      return;
    }

    this.convokeTickTimerMs -= dt;
    while (this.buffs.convokeMs > 0 && this.convokeTickTimerMs <= 0) {
      this.executeConvokePulse();
      this.convokeTickTimerMs += CONVOKE_PULSE_INTERVAL_MS;
    }
  }

  tickTreeants(dt) {
    if (!this.treeants.length) {
      return;
    }

    const nextTreeants = [];
    for (const treeant of this.treeants) {
      let remainingMs = Math.max(0, Number(treeant.remainingMs) || 0) - dt;
      let nextNurtureAtMs = Math.max(0, Number(treeant.nextNurtureAtMs) || this.nowMs + this.treeantNurtureTickMs);

      while (remainingMs > 0 && this.nowMs >= nextNurtureAtMs) {
        const target = this.getLowestHealthAlivePlayer();
        if (target) {
          this.applyHeal(target.id, getHealAmount("nurture"), false, {
            spellKey: "nurture",
            canCrit: false,
            suppressLeech: true
          });
        }
        nextNurtureAtMs += this.treeantNurtureTickMs;
      }

      if (remainingMs > 0) {
        nextTreeants.push({
          id: treeant.id,
          remainingMs,
          nextNurtureAtMs
        });
      }
    }

    this.treeants = nextTreeants;
  }

  summonTreeant() {
    this.treeants.push({
      id: `treeant-${this.nextTreeantId}`,
      remainingMs: this.treeantDurationMs,
      nextNurtureAtMs: this.nowMs + this.treeantNurtureTickMs
    });
    this.nextTreeantId += 1;
    this.pushLog("나무 정령 소환", "buff");
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
    this.resolveSpellCast(completedCast.spellKey, completedCast.targetId);
  }

  processOffGcdActionQueue() {
    if (!this.offGcdActionQueue.length) {
      return;
    }

    let loopCount = 0;
    while (this.offGcdActionQueue.length && loopCount < 20) {
      loopCount += 1;

      const action = this.offGcdActionQueue[0];
      const spell = RESTORATION_DRUID_PRACTICE_SPELLS[action.spellKey];
      if (!spell || !spell.active || spell.triggersGlobalCooldown !== false) {
        this.offGcdActionQueue.shift();
        continue;
      }

      let target = null;
      if (spell.requiresTarget) {
        target = this.findPlayer(action.targetId);
        if (!target || !target.alive) {
          this.offGcdActionQueue.shift();
          this.pushLog(`${spell.name} 실패: 유효한 대상이 없음`, "warn");
          continue;
        }
      }

      if (spell.key === "swiftmend" && !this.canCastSwiftmendOnTarget(target)) {
        this.offGcdActionQueue.shift();
        this.pushLog(`${spell.name} 실패: 대상에게 활성 HoT가 필요`, "warn");
        continue;
      }

      if ((this.cooldowns[spell.key] ?? 0) > 0) {
        this.offGcdActionQueue.shift();
        const cooldownSec = round((this.cooldowns[spell.key] ?? 0) / 1000, 1);
        this.pushLog(`${spell.name} 실패: 재사용 대기 ${cooldownSec}s`, "warn");
        continue;
      }

      const manaCost = this.getResolvedSpellManaCost(spell);
      if (manaCost > this.mana + 1e-6) {
        this.offGcdActionQueue.shift();
        this.pushLog(`${spell.name} 실패: 마나 부족`, "warn");
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
      const spell = RESTORATION_DRUID_PRACTICE_SPELLS[action.spellKey];
      if (!spell || !spell.active) {
        this.actionQueue.shift();
        continue;
      }

      let target = null;
      if (spell.requiresTarget) {
        target = this.findPlayer(action.targetId);
        if (!target || !target.alive) {
          this.actionQueue.shift();
          this.pushLog(`${spell.name} 실패: 유효한 대상이 없음`, "warn");
          continue;
        }
      }

      if (spell.key === "swiftmend" && !this.canCastSwiftmendOnTarget(target)) {
        this.actionQueue.shift();
        this.pushLog(`${spell.name} 실패: 대상에게 활성 HoT가 필요`, "warn");
        continue;
      }

      const manaCost = this.getResolvedSpellManaCost(spell);
      if (manaCost > this.mana + 1e-6) {
        this.actionQueue.shift();
        this.pushLog(`${spell.name} 실패: 마나 부족`, "warn");
        continue;
      }

      if ((this.cooldowns[spell.key] ?? 0) > 0) {
        this.actionQueue.shift();
        const cooldownSec = round((this.cooldowns[spell.key] ?? 0) / 1000, 1);
        this.pushLog(`${spell.name} 실패: 재사용 대기 ${cooldownSec}s`, "warn");
        continue;
      }

      if (this.gcdRemainingMs > 0) {
        return;
      }

      this.actionQueue.shift();
      this.startCast(spell, action.targetId ?? null);
      return;
    }
  }

  startCast(spell, targetId) {
    if (spell.cooldownMs > 0) {
      this.cooldowns[spell.key] = spell.cooldownMs;
    }

    const manaCost = this.getResolvedSpellManaCost(spell);
    if (manaCost > 0) {
      this.mana = round(Math.max(0, this.mana - manaCost), 2);
      this.metrics.manaSpent = round(this.metrics.manaSpent + manaCost, 2);
    }

    if (spell.triggersGlobalCooldown !== false) {
      this.gcdRemainingMs = this.getGlobalCooldownMs();
    }

    let castTimeMs = spell.castTimeMs;
    if (spell.key === "regrowth" && TREE_OF_LIFE_REGROWTH_INSTANT && this.buffs.treeOfLifeMs > 0) {
      castTimeMs = 0;
    }
    if (castTimeMs > 0 && spell.castTimeAffectedByHaste) {
      castTimeMs = this.getHasteAdjustedDurationMs(castTimeMs, 250);
    }
    if (castTimeMs > 0 && spell.key === "convokeSpirits") {
      this.startConvokeChannel(castTimeMs);
    } else if (castTimeMs > 0 && spell.key === "tranquility") {
      this.startTranquilityChannel(castTimeMs);
    }
    if (castTimeMs > 0) {
      this.currentCast = {
        castId: ++this.castSequence,
        spellKey: spell.key,
        spellName: spell.name,
        targetId,
        remainingMs: castTimeMs,
        castTimeMs,
        startedAtMs: this.nowMs,
        spentManaCost: manaCost
      };
      this.pushLog(`${spell.name} 시전 시작`, "info");
      return;
    }

    this.resolveSpellCast(spell.key, targetId);
  }

  interruptCurrentCastByMovement() {
    if (!this.currentCast) {
      return false;
    }

    const spell = RESTORATION_DRUID_PRACTICE_SPELLS[this.currentCast.spellKey];
    if (spell?.canMoveWhileCasting) {
      return false;
    }

    const spellName = this.currentCast.spellName || spell?.name || "시전";
    const refundedManaCost = Math.max(0, Number(this.currentCast.spentManaCost) || 0);
    if (refundedManaCost > 0) {
      this.mana = round(Math.min(this.maxMana, this.mana + refundedManaCost), 2);
      this.metrics.manaSpent = round(Math.max(0, this.metrics.manaSpent - refundedManaCost), 2);
    }
    if (this.currentCast.spellKey === "tranquility") {
      this.buffs.tranquilityMs = 0;
      this.tranquilityTickTimerMs = 0;
      this.tranquilityTickHealAmount = 0;
    }
    this.currentCast = null;
    this.pushLog(`${spellName} 시전 취소: 이동`, "warn");
    return true;
  }

  resolveSpellCast(spellKey, targetId) {
    const spell = RESTORATION_DRUID_PRACTICE_SPELLS[spellKey];
    if (!spell) {
      return;
    }

    this.metrics.casts[spellKey] += 1;

    switch (spellKey) {
      case "rejuvenation": {
        const target = this.findPlayer(targetId);
        if (!target || !target.alive) {
          this.pushLog(`${spell.name} 실패: 대상 사망`, "warn");
          return;
        }
        const useSoulOfForest = this.soulOfForestEnabled && this.soulOfForestPending;
        const soulOfForestHealMultiplier = useSoulOfForest ? 1 + this.soulOfForestHealBonusRatio : 1;
        const extraTargets = useSoulOfForest
          ? this.getAdditionalSoulOfForestTargets(target.id, this.soulOfForestAdditionalTargetCount)
          : [];
        const targets = [target, ...extraTargets];
        const primaryResult = this.applyRejuvenationHotToTarget(target, soulOfForestHealMultiplier);
        for (const extraTarget of extraTargets) {
          this.applyRejuvenationHotToTarget(extraTarget, soulOfForestHealMultiplier);
        }
        if (useSoulOfForest) {
          this.soulOfForestPending = false;
          this.triggerSoulOfForestRapidLifebloomBlooms();
        }
        if (targets.length > 1) {
          this.pushLog(
            `${spell.name}${useSoulOfForest ? " (숲의 영혼)" : ""} ${targets.length}명 지속 치유 부여`,
            "heal"
          );
          return;
        }
        if (primaryResult === "germination") {
          this.pushLog(`${spell.name}(싹틔우기) ${target.name} 지속 치유 부여`, "heal");
          return;
        }
        this.pushLog(`${spell.name} ${target.name} 지속 치유 부여`, "heal");
        return;
      }
      case "regrowth": {
        const target = this.findPlayer(targetId);
        if (!target || !target.alive) {
          this.pushLog(`${spell.name} 실패: 대상 사망`, "warn");
          return;
        }
        const useSoulOfForest = this.soulOfForestEnabled && this.soulOfForestPending;
        const soulOfForestHealMultiplier = useSoulOfForest ? 1 + this.soulOfForestHealBonusRatio : 1;
        const extraTargets = useSoulOfForest
          ? this.getAdditionalSoulOfForestTargets(target.id, this.soulOfForestAdditionalTargetCount)
          : [];
        const targets = [target, ...extraTargets];
        let totalEffective = 0;
        let criticalCount = 0;
        let primaryResult = null;
        for (let index = 0; index < targets.length; index += 1) {
          const result = this.applyRegrowthSpellToTarget(targets[index], soulOfForestHealMultiplier);
          if (index === 0) {
            primaryResult = result;
          }
          totalEffective += Math.max(0, Number(result?.effective ?? 0));
          if (result?.isCritical) {
            criticalCount += 1;
          }
        }
        if (useSoulOfForest) {
          this.soulOfForestPending = false;
          this.triggerSoulOfForestRapidLifebloomBlooms();
        }
        if (targets.length > 1) {
          this.pushLog(
            `${spell.name}${useSoulOfForest ? " (숲의 영혼)" : ""} ${targets.length}명 ${fmtSigned(totalEffective)}${criticalCount > 0 ? ` (치명 ${criticalCount})` : ""}`,
            "heal"
          );
          return;
        }
        this.pushLog(
          `${spell.name} ${target.name} ${fmtSigned(primaryResult?.effective ?? 0)}${primaryResult?.isCritical ? " (치명타)" : ""}`,
          "heal"
        );
        return;
      }
      case "wildGrowth": {
        const wildGrowthTargetCount =
          this.buffs.treeOfLifeMs > 0 ? TREE_OF_LIFE_WILD_GROWTH_TARGET_COUNT : BASE_WILD_GROWTH_TARGET_COUNT;
        const targets = this.getMostInjuredAlivePlayers(wildGrowthTargetCount);
        if (!targets.length) {
          this.pushLog(`${spell.name} 사용 (유효 대상 없음)`, "info");
          return;
        }

        let total = 0;
        for (const target of targets) {
          const result = this.applyHeal(target.id, getHealAmount("wildGrowth"), false, {
            spellKey: "wildGrowth",
            isDirectHeal: true
          });
          total += result.effective;
          target.wildGrowthHotRemainingMs = WILD_GROWTH_HOT_DURATION_MS;
          target.wildGrowthHotTickTimerMs = WILD_GROWTH_HOT_TICK_MS;
        }

        this.summonTreeant();
        this.pushLog(`${spell.name} 광역 치유 ${fmtSigned(total)}`, "heal");
        return;
      }
      case "lifebloom": {
        const target = this.findPlayer(targetId);
        if (!target || !target.alive) {
          this.pushLog(`${spell.name} 실패: 대상 사망`, "warn");
          return;
        }

        const previousTarget = this.getCurrentLifebloomTarget();
        const hasPreviousOnDifferentTarget = previousTarget && previousTarget.id !== target.id;
        if (hasPreviousOnDifferentTarget && previousTarget.lifebloomRemainingMs > 0) {
          const shouldBloomOnTransfer = previousTarget.lifebloomRemainingMs <= LIFEBLOOM_TRANSFER_BLOOM_WINDOW_MS;
          if (shouldBloomOnTransfer) {
            const transferBloomResult = this.applyLifebloomBloomToTarget(previousTarget, "lifebloomBloomTransfer");
            if (transferBloomResult.effective > 0) {
              this.pushLog(`${spell.name} 이동 개화 ${previousTarget.name} ${fmtSigned(transferBloomResult.effective)}`, "heal");
            }
          }
          this.clearLifebloomFromTarget(previousTarget);
        }
        for (const player of this.players) {
          if (player.id !== target.id && player.lifebloomRemainingMs > 0) {
            this.clearLifebloomFromTarget(player);
          }
        }

        target.lifebloomRemainingMs =
          previousTarget?.id === target.id
            ? this.getPandemicRefreshedDurationMs("lifebloom", LIFEBLOOM_DURATION_MS, target.lifebloomRemainingMs)
            : LIFEBLOOM_DURATION_MS;
        target.lifebloomTickTimerMs = LIFEBLOOM_TICK_MS;
        target.lifebloomElapsedMs = 0;
        target.lifebloomStack = 1;
        this.lifebloomTargetId = target.id;
        this.pushLog(`${spell.name} ${target.name} 적용 (1중첩)`, "heal");
        return;
      }
      case "swiftmend": {
        const target = this.findPlayer(targetId);
        if (!target || !target.alive) {
          this.pushLog(`${spell.name} 실패: 대상 사망`, "warn");
          return;
        }
        if (!this.canCastSwiftmendOnTarget(target)) {
          this.pushLog(`${spell.name} 실패: 대상에게 활성 HoT가 필요`, "warn");
          return;
        }

        const result = this.applyHeal(target.id, getHealAmount("swiftmend"), false, {
          spellKey: "swiftmend",
          isDirectHeal: true
        });
        this.extendTargetDruidHotsBy(target, SWIFTMEND_HOT_EXTENSION_MS);
        this.summonTreeant();
        if (this.forestRenewalEnabled) {
          this.swiftmendCastCountTowardsTreeOfLife += 1;
          if (
            TREE_OF_LIFE_DURATION_MS > 0 &&
            this.swiftmendCastCountTowardsTreeOfLife >= TREE_OF_LIFE_SWIFTMEND_COUNT_REQUIRED
          ) {
            this.swiftmendCastCountTowardsTreeOfLife = 0;
            this.buffs.treeOfLifeMs = TREE_OF_LIFE_DURATION_MS;
            this.pushLog(`나무 변신 발동 (${round(TREE_OF_LIFE_DURATION_MS / 1000, 1)}s)`, "buff");
          }
        }
        if (this.soulOfForestEnabled) {
          this.soulOfForestPending = true;
          this.pushLog("숲의 영혼 발동", "buff");
        }
        const hotExtensionSuffix =
          SWIFTMEND_HOT_EXTENSION_MS > 0 ? `, HoT +${round(SWIFTMEND_HOT_EXTENSION_MS / 1000, 1)}s` : "";
        this.pushLog(
          `${spell.name} ${target.name} ${fmtSigned(result.effective)}${result.isCritical ? " (치명타)" : ""}${hotExtensionSuffix}`,
          "heal"
        );
        return;
      }
      case "convokeSpirits": {
        if (spell.castTimeMs > 0) {
          this.pushLog(`${spell.name} 채널 종료`, "info");
          return;
        }

        const injuredTargets = this.getAlivePlayers();
        if (!injuredTargets.length) {
          this.pushLog(`${spell.name} 사용 (유효 대상 없음)`, "info");
          return;
        }
        let total = 0;
        for (let pulse = 0; pulse < CONVOKE_PULSE_COUNT; pulse += 1) {
          const before = this.metrics.healingDone;
          this.executeConvokePulse();
          total += Math.max(0, this.metrics.healingDone - before);
        }
        this.pushLog(`${spell.name} ${fmtSigned(total)} 치유`, "heal");
        return;
      }
      case "tranquility": {
        if (spell.castTimeMs > 0) {
          this.pushLog(`${spell.name} 채널 종료`, "info");
          return;
        }
        this.startTranquilityChannel(TRANQUILITY_CHANNEL_DURATION_MS);
        return;
      }
      case "barkskin": {
        this.buffs.barkskinMs = BARKSKIN_DURATION_MS;
        this.pushLog(`${spell.name} 발동 (피해 감소)`, "buff");
        return;
      }
      default:
        return;
    }
  }

  applyHeal(targetId, baseAmount, _allowTransfer = false, options = {}) {
    const target = this.findPlayer(targetId);
    if (!target || !target.alive || baseAmount <= 0) {
      return { effective: 0, overheal: 0, isCritical: false, critChance: 0 };
    }

    const spellKey = String(options.spellKey ?? "").trim();
    const canCrit = options.canCrit !== false;
    const additionalCritChance = canCrit ? this.getAdditionalCritChanceForSpell(spellKey, options) : 0;
    const critChance = canCrit ? clamp(this.baseCritChance + additionalCritChance, 0, 1) : 0;
    const critMultiplier = canCrit ? this.defaultCritHealMultiplier : 1;
    const isCritical = canCrit && critChance > 0 && this.rng() < critChance;

    const masteryMultiplier = this.getDruidMasteryHealingMultiplier(target);
    const hpRatioBeforeHeal = target.maxHp > 0 ? target.hp / target.maxHp : 1;
    const amount = baseAmount * this.intellect * masteryMultiplier * (isCritical ? critMultiplier : 1);
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

    const shouldApplyLeech = !options.suppressLeech && this.leechHealingRatio > 0 && effective > 0 && this.selfPlayerId;
    if (shouldApplyLeech) {
      this.applyHeal(this.selfPlayerId, effective * this.leechHealingRatio, false, {
        spellKey: "leech",
        canCrit: false,
        suppressLeech: true
      });
    }

    return {
      effective: round(effective, 2),
      overheal: round(overheal, 2),
      isCritical,
      critChance: round(critChance * 100, 2)
    };
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

    const damageRatios = RESTORATION_DRUID_PRACTICE_TUNING.damageRatios;
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
    if (this.selfPlayerId && target.id === this.selfPlayerId && this.buffs.barkskinMs > 0) {
      damage *= 1 - BARKSKIN_DAMAGE_REDUCTION;
    }
    damage = Math.max(0, damage);

    target.hp = round(Math.max(0, target.hp - damage), 2);
    this.metrics.damageTaken = round(this.metrics.damageTaken + damage, 2);

    if (target.hp <= 0 && target.alive) {
      target.alive = false;
      this.metrics.deaths += 1;
      if (this.lifebloomTargetId === target.id) {
        this.lifebloomTargetId = null;
      }
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
    const lifebloomHotUptimePct =
      this.lifebloomHotSampledMs > 0
        ? (this.lifebloomHotActiveSampledMs / this.lifebloomHotSampledMs) * 100
        : 0;
    const totalCastCount = Object.values(this.metrics.casts).reduce(
      (sum, value) => sum + Math.max(0, Number(value ?? 0)),
      0
    );
    const elapsedMinutes = Math.max(1e-6, Math.min(this.nowMs, this.durationMs) / 60000);
    const cpm = totalCastCount / elapsedMinutes;

    const abundanceRejuvenationCount = this.abundanceEnabled ? this.countActiveRejuvenationEffects() : 0;
    const abundanceActiveMs = abundanceRejuvenationCount > 0 ? ABUNDANCE_PROC_ACTIVE_MS : 0;
    const forestRenewalSwiftmendCount = this.forestRenewalEnabled
      ? clamp(Math.floor(this.swiftmendCastCountTowardsTreeOfLife), 0, TREE_OF_LIFE_SWIFTMEND_COUNT_REQUIRED - 1)
      : 0;
    const forestRenewalCounterActiveMs = forestRenewalSwiftmendCount > 0 ? ABUNDANCE_PROC_ACTIVE_MS : 0;
    const snapshotBuffs = {
      ...this.buffs,
      abundanceActiveMs,
      abundanceRejuvenationCount,
      forestRenewalCounterActiveMs,
      forestRenewalSwiftmendCount
    };

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
      eternalFlameRemainingMs: 0,
      divineBlessingRemainingMs: 0,
      beaconOfSaviorDamageReductionRemainingMs: 0,
      absorbShield: 0,
      rejuvenationRemainingMs: Math.max(0, Math.round(player.rejuvenationRemainingMs ?? 0)),
      germinationRemainingMs: Math.max(0, Math.round(player.germinationRemainingMs ?? 0)),
      regrowthHotRemainingMs: Math.max(0, Math.round(player.regrowthHotRemainingMs ?? 0)),
      wildGrowthHotRemainingMs: Math.max(0, Math.round(player.wildGrowthHotRemainingMs ?? 0)),
      lifebloomRemainingMs: Math.max(0, Math.round(player.lifebloomRemainingMs ?? 0)),
      lifebloomStack: Math.max(0, Math.floor(Number(player.lifebloomStack ?? 0)))
    }));

    return {
      seed: this.seed,
      nowMs: Math.min(this.nowMs, this.durationMs),
      durationMs: this.durationMs,
      progress: clamp(this.nowMs / this.durationMs, 0, 1),
      holyPower: 0,
      mana: round(this.mana, 1),
      maxMana: round(this.maxMana, 1),
      manaPct: this.maxMana > 0 ? round((this.mana / this.maxMana) * 100, 2) : 0,
      actionQueueLength: this.actionQueue.length,
      queuedAction: this.actionQueue[0]
        ? {
            spellKey: this.actionQueue[0].spellKey,
            spellName: RESTORATION_DRUID_PRACTICE_SPELLS[this.actionQueue[0].spellKey]?.name ?? this.actionQueue[0].spellKey,
            targetId: this.actionQueue[0].targetId ?? null,
            queuedAtMs: Math.max(0, Number(this.actionQueue[0].queuedAtMs ?? this.nowMs))
          }
        : null,
      queueLockoutRemainingMs: Math.max(0, this.getLockoutRemainingMs()),
      spellQueueWindowMs: this.spellQueueWindowMs,
      holyShockCharges: 0,
      holyShockMaxCharges: 0,
      holyShockRechargeRemainingMs: 0,
      cooldowns: { ...this.cooldowns },
      buffs: snapshotBuffs,
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
      gcdRemainingMs: this.gcdRemainingMs,
      beacons: {
        light: null,
        faith: null,
        savior: null
      },
      treeants: this.treeants.map((treeant) => ({
        id: treeant.id,
        remainingMs: Math.max(0, Math.round(treeant.remainingMs))
      })),
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
        wastedHolyPower: 0,
        lifebloomHotUptimePct: round(lifebloomHotUptimePct, 2),
        cpm: round(cpm, 2),
        casts: { ...this.metrics.casts }
      },
      finished: this.finished,
      success: this.success,
      logs: [...this.logs]
    };
  }
}

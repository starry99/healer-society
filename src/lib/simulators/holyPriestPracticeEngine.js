import {
  GLOBAL_AUTO_MANA_REGEN_PCT_OF_MAX_PER_TICK,
  GLOBAL_AUTO_MANA_REGEN_TICK_MS,
  GLOBAL_HEALER_SCALING
} from "../../components/simulators/healerPracticeGlobalSettings";
import {
  HOLY_PRIEST_ADDED_TALENT_TOGGLES,
  HOLY_PRIEST_AUTO_MANA_REGEN_MULTIPLIER,
  HOLY_PRIEST_CRIT_CONFIG,
  HOLY_PRIEST_PRACTICE_TUNING
} from "../../components/simulators/holyPriestPracticeSettings";

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
const DEFAULT_CRIT_HEAL_MULTIPLIER = 2;
const DEFAULT_LEECH_HEALING_RATIO = 0.06;
const DEFAULT_AUTO_MANA_REGEN_MULTIPLIER = Math.max(
  0,
  Number(HOLY_PRIEST_AUTO_MANA_REGEN_MULTIPLIER ?? 1)
);
const DEFAULT_SPELL_QUEUE_WINDOW_MS = 400;
const DEFAULT_TRIAGE_HEALTH_THRESHOLD_PCT = 30;
const DEFAULT_TRIAGE_MIN_EFFECTIVE_HEAL_PCT = 10;
const SELF_PLAYER_NAME = "나";
const ECHO_OF_LIGHT_BASE_DURATION_MS = 4000;
const ECHO_OF_LIGHT_REFRESH_DURATION_MS = 6000;
const ECHO_OF_LIGHT_TICK_MS = 2000;
const DEFAULT_CAST_TIME_HASTE_AFFECTED_BY_SPELL = Object.freeze({
  flashHeal: false,
  prayerOfHealing: false,
  divineHymn: true
});
const HALO_TALENT_ENABLED = HOLY_PRIEST_ADDED_TALENT_TOGGLES.halo !== false;
const PRAYERS_OF_THE_VIRTUOUS_TALENT_ENABLED =
  HOLY_PRIEST_ADDED_TALENT_TOGGLES.prayersOfTheVirtuous !== false;
const LIGHTWEAVER_TALENT_ENABLED = HOLY_PRIEST_ADDED_TALENT_TOGGLES.lightweaver !== false;
const ULTIMATE_SERENITY_TALENT_ENABLED = HOLY_PRIEST_ADDED_TALENT_TOGGLES.ultimateSerenity !== false;
const DIVINE_IMAGE_TALENT_ENABLED = HOLY_PRIEST_ADDED_TALENT_TOGGLES.divineImage !== false;
const SEASON_ONE_TIER_TALENT_ENABLED = HOLY_PRIEST_ADDED_TALENT_TOGGLES.seasonOneTier !== false;
const UPLIFTING_WORDS_TALENT_ENABLED = HOLY_PRIEST_ADDED_TALENT_TOGGLES.upliftingWords !== false;
const CRISIS_MANAGEMENT_TALENT_ENABLED = HOLY_PRIEST_ADDED_TALENT_TOGGLES.crisisManagement !== false;
const TRAIL_OF_LIGHT_TALENT_ENABLED = HOLY_PRIEST_ADDED_TALENT_TOGGLES.trailOfLight !== false;
const DISPERSING_LIGHT_TALENT_ENABLED = HOLY_PRIEST_ADDED_TALENT_TOGGLES.dispersingLight !== false;
const LIGHTS_RESURGENCE_TALENT_ENABLED = HOLY_PRIEST_ADDED_TALENT_TOGGLES.lightsResurgence !== false;
const RESONANT_ENERGY_TALENT_ENABLED = HOLY_PRIEST_ADDED_TALENT_TOGGLES.resonantEnergy !== false;
const UPLIFTING_WORDS_SERENITY_CRIT_CHANCE_BONUS = clamp(
  Number(HOLY_PRIEST_CRIT_CONFIG?.upliftingWordsSerenityCritChanceBonus ?? 0.1),
  0,
  1
);
const CRISIS_MANAGEMENT_FLASH_HEAL_CRIT_CHANCE_BONUS = clamp(
  Number(HOLY_PRIEST_CRIT_CONFIG?.crisisManagementFlashHealCritChanceBonus ?? 0.15),
  0,
  1
);
const CRISIS_MANAGEMENT_PRAYER_OF_HEALING_CRIT_CHANCE_BONUS = clamp(
  Number(HOLY_PRIEST_CRIT_CONFIG?.crisisManagementPrayerOfHealingCritChanceBonus ?? 0.15),
  0,
  1
);

const SERENITY_MAX_CHARGES = Math.max(
  1,
  Math.floor(Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.serenityMaxCharges ?? 2))
);
const SERENITY_RECHARGE_MS = Math.max(
  1000,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.serenityChargeRecoveryMs ?? 45000)
);
const PRAYER_OF_HEALING_TARGET_COUNT = Math.max(
  1,
  Math.floor(Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.prayerOfHealingTargetCount ?? 5))
);
const PRAYER_OF_HEALING_PRIMARY_TARGET_HEAL_MULTIPLIER = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.prayerOfHealingPrimaryTargetHealMultiplier ?? 1.25)
);
const PRAYER_OF_MENDING_COOLDOWN_MS = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.prayerOfMendingCooldownMs ?? 12000)
);
const PRAYER_OF_MENDING_DURATION_MS = Math.max(
  1000,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.prayerOfMendingDurationMs ?? 30000)
);
const PRAYER_OF_MENDING_MAX_JUMPS = Math.max(
  0,
  Math.floor(Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.prayerOfMendingMaxJumps ?? 4))
);
const PRAYERS_OF_THE_VIRTUOUS_BONUS_JUMPS = Math.max(
  0,
  Math.floor(Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.prayersOfTheVirtuousBonusJumps ?? 2))
);
const DIVINE_IMAGE_STACK_DURATION_MS = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.divineImageStackDurationMs ?? 9000)
);
const DIVINE_IMAGE_DAZZLING_LIGHTS_TARGET_COUNT = Math.max(
  1,
  Math.floor(Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.divineImageDazzlingLightsTargetCount ?? 5))
);
const DIVINE_IMAGE_BLESSED_LIGHT_TARGET_COUNT = Math.max(
  1,
  Math.floor(Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.divineImageBlessedLightTargetCount ?? 5))
);
const HALO_COOLDOWN_MS = Math.max(0, Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.haloCooldownMs ?? 60000));
const HALO_REPEAT_INTERVAL_MS = Math.max(
  100,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.haloRepeatIntervalMs ?? 5000)
);
const HALO_TOTAL_PULSE_COUNT = Math.max(
  1,
  Math.floor(Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.haloTotalPulseCount ?? 4))
);
const HALO_TICKS_PER_PULSE = Math.max(
  1,
  Math.floor(Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.haloTicksPerPulse ?? 2))
);
const HALO_FULL_EFFECT_TARGET_COUNT = Math.max(
  1,
  Math.floor(Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.haloFullEffectTargetCount ?? 6))
);
const COSMIC_RIPPLE_TARGET_COUNT = Math.max(
  1,
  Math.floor(Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.cosmicRippleTargetCount ?? 5))
);
const COSMIC_RIPPLE_FROM_DIVINE_HYMN_TICK_HEAL_MULTIPLIER = clamp(
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.cosmicRippleFromDivineHymnTickHealMultiplier ?? 0.75),
  0,
  5
);
const BENEDICTION_PROC_CHANCE = clamp(
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.benedictionProcChance ?? 0.3),
  0,
  1
);
const BENEDICTION_DURATION_MS = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.benedictionDurationMs ?? 30000)
);
const BENEDICTION_FLASH_HEAL_HEAL_BONUS_RATIO = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.benedictionFlashHealHealBonusPct ?? 0.3)
);
const SEASON_ONE_TIER_BENEDICTION_DIVINE_IMAGE_PROC_CHANCE = clamp(
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.seasonOneTierBenedictionDivineImageProcChance ?? 0.6),
  0,
  1
);
const SEASON_ONE_TIER_DIVINE_IMAGE_HEALING_BONUS_RATIO = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.seasonOneTierDivineImageHealingBonusPct ?? 0.3)
);
const SEASON_ONE_TIER_DIVINE_IMAGE_DURATION_BONUS_MS = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.seasonOneTierDivineImageDurationBonusMs ?? 3000)
);
const UNWAVERING_WILL_HEALTH_THRESHOLD_RATIO = clamp(
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.unwaveringWillHealthThresholdRatio ?? 0.75),
  0,
  1
);
const UNWAVERING_WILL_CAST_TIME_REDUCTION_RATIO = clamp(
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.unwaveringWillCastTimeReductionPct ?? 0.1),
  0,
  0.95
);
const DIVINE_IMAGE_HEALING_SPELL_KEY_SET = new Set([
  "divineImageHealingLight",
  "divineImageDazzlingLights",
  "divineImageBlessedLight"
]);
const UNWAVERING_WILL_AFFECTED_SPELL_KEY_SET = new Set(["flashHeal", "prayerOfHealing"]);
const DEFAULT_SURGE_OF_LIGHT_PROC_SPELL_KEYS = Object.freeze([
  "flashHeal",
  "prayerOfHealing",
  "serenity",
  "prayerOfMending",
  "halo",
  "desperatePrayer",
  "divineHymn"
]);
const SURGE_OF_LIGHT_BASE_PROC_CHANCE_AT_FULL_MANA = clamp(
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.surgeOfLightBaseProcChanceAtFullMana ?? 0.08),
  0,
  1
);
const SURGE_OF_LIGHT_PROC_CHANCE_AT_ZERO_MANA = clamp(
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.surgeOfLightProcChanceAtZeroMana ?? 0.5),
  0,
  1
);
const SURGE_OF_LIGHT_DURATION_MS = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.surgeOfLightDurationMs ?? 20000)
);
const SURGE_OF_LIGHT_MAX_STACKS = Math.max(
  1,
  Math.floor(Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.surgeOfLightMaxStacks ?? 2))
);
const SURGE_OF_LIGHT_MANA_COST_MULTIPLIER = clamp(
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.surgeOfLightManaCostMultiplier ?? 0.5),
  0,
  1
);
const SURGE_OF_LIGHT_PROC_SPELL_KEYS = Object.freeze(
  Array.isArray(HOLY_PRIEST_PRACTICE_TUNING.durations?.surgeOfLightProcSpellKeys)
    ? HOLY_PRIEST_PRACTICE_TUNING.durations.surgeOfLightProcSpellKeys
      .map((spellKey) => String(spellKey ?? "").trim())
      .filter(Boolean)
    : [...DEFAULT_SURGE_OF_LIGHT_PROC_SPELL_KEYS]
);
const SURGE_OF_LIGHT_EMPOWERED_SPELL_KEY_SET = new Set(["flashHeal", "prayerOfHealing"]);
const FADE_COOLDOWN_MS = Math.max(0, Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.fadeCooldownMs ?? 20000));
const FADE_DURATION_MS = Math.max(0, Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.fadeDurationMs ?? 10000));
const FADE_DAMAGE_REDUCTION = clamp(Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.fadeDamageReduction ?? 0.1), 0, 0.95);
const DESPERATE_PRAYER_COOLDOWN_MS = Math.max(0, Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.desperatePrayerCooldownMs ?? 90000));
const DESPERATE_PRAYER_INSTANT_HEAL_RATIO_OF_MAX_HP = clamp(
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.desperatePrayerInstantHealRatioOfMaxHp ?? 0.25),
  0,
  1
);
const DESPERATE_PRAYER_SELF_MAX_HP_BONUS_RATIO = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.desperatePrayerSelfMaxHpBonusRatio ?? 0.25)
);
const DESPERATE_PRAYER_SELF_MAX_HP_BONUS_DURATION_MS = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.desperatePrayerSelfMaxHpBonusDurationMs ?? 10000)
);
const DIVINE_HYMN_COOLDOWN_MS = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.divineHymnCooldownMs ?? 120000)
);
const DIVINE_HYMN_TICK_COUNT = Math.max(
  1,
  Math.floor(Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.divineHymnTickCount ?? 5))
);
const DIVINE_HYMN_FULL_EFFECT_TARGET_COUNT = Math.max(
  1,
  Math.floor(Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.divineHymnFullEffectTargetCount ?? 6))
);
const DIVINE_HYMN_HEALING_TAKEN_STACK_RATIO = clamp(
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.divineHymnHealingTakenStackPct ?? 0.04),
  0,
  1
);
const DIVINE_HYMN_HEALING_TAKEN_BUFF_DURATION_MS = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.divineHymnHealingTakenBuffDurationMs ?? 15000)
);
const DIVINE_HYMN_HEALING_TAKEN_MAX_STACKS = Math.max(
  1,
  Math.floor(Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.divineHymnHealingTakenMaxStacks ?? 5))
);
const APOTHEOSIS_COOLDOWN_MS = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.apotheosisCooldownMs ?? 120000)
);
const APOTHEOSIS_DURATION_MS = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.apotheosisDurationMs ?? 20000)
);
const APOTHEOSIS_SERENITY_CDR_MULTIPLIER = Math.max(
  1,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.apotheosisSerenityCdrMultiplier ?? 2)
);
const APOTHEOSIS_SERENITY_MANA_COST_MULTIPLIER = clamp(
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.apotheosisSerenityManaCostMultiplier ?? 0.5),
  0,
  1
);
const APOTHEOSIS_HEALING_DONE_BONUS_RATIO = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.apotheosisHealingDoneBonusPct ?? 0.2)
);
const FAITH_BUFF_DURATION_MS = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.faithBuffDurationMs ?? 30000)
);
const FAITH_MAX_STACKS = Math.max(
  0,
  Math.floor(Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.faithMaxStacks ?? 3))
);
const FAITH_PRAYER_OF_HEALING_BONUS_RATIO = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.faithPrayerOfHealingBonusPct ?? 0.25)
);
const BINDING_HEAL_FLASH_HEAL_SELF_HEAL_RATIO = clamp(
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.bindingHealFlashHealSelfHealRatio ?? 0.2),
  0,
  1
);
const TRAIL_OF_LIGHT_HEAL_RATIO = clamp(
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.trailOfLightHealRatio ?? 0.25),
  0,
  1
);
const DISPERSING_LIGHT_REPLICATE_RATIO = clamp(
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.dispersingLightReplicateRatio ?? 0.05),
  0,
  1
);
const DISPERSING_LIGHT_TARGET_COUNT = Math.max(
  0,
  Math.floor(Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.dispersingLightTargetCount ?? 4))
);
const LIGHTS_RESURGENCE_RENEW_PROC_CHANCE = clamp(
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.lightsResurgenceRenewProcChance ?? 0.12),
  0,
  1
);
const RENEW_DURATION_MS = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.renewDurationMs ?? 15000)
);
const RENEW_TICK_MS = Math.max(
  100,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.renewTickMs ?? 3000)
);
const RESONANT_ENERGY_HEALING_TAKEN_PER_STACK_RATIO = clamp(
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.resonantEnergyHealingTakenPctPerStack ?? 0.02),
  0,
  1
);
const RESONANT_ENERGY_DURATION_MS = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.resonantEnergyDurationMs ?? 8000)
);
const RESONANT_ENERGY_MAX_STACKS = Math.max(
  1,
  Math.floor(Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.resonantEnergyMaxStacks ?? 5))
);
const PROTECTIVE_LIGHT_DURATION_MS = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.protectiveLightDurationMs ?? 10000)
);
const PROTECTIVE_LIGHT_DAMAGE_REDUCTION = clamp(
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.protectiveLightDamageReduction ?? 0.1),
  0,
  0.95
);
const LIGHTWEAVER_DURATION_MS = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.lightweaverDurationMs ?? 20000)
);
const LIGHTWEAVER_MAX_STACKS = Math.max(
  1,
  Math.floor(Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.lightweaverMaxStacks ?? 4))
);
const LIGHTWEAVER_PRAYER_OF_HEALING_CAST_TIME_REDUCTION_RATIO = clamp(
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.lightweaverPrayerOfHealingCastTimeReductionPct ?? 0.3),
  0,
  0.95
);
const LIGHTWEAVER_PRAYER_OF_HEALING_HEAL_BONUS_RATIO = Math.max(
  0,
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.lightweaverPrayerOfHealingHealBonusPct ?? 0.18)
);
const ULTIMATE_SERENITY_ADDITIONAL_TARGET_COUNT = Math.max(
  0,
  Math.floor(Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.ultimateSerenityAdditionalTargetCount ?? 4))
);
const ULTIMATE_SERENITY_HEAL_RATIO = clamp(
  Number(HOLY_PRIEST_PRACTICE_TUNING.durations?.ultimateSerenityHealRatio ?? 0.15),
  0,
  1
);
const SERENITY_CDR_MS_BY_SPELL_KEY = Object.freeze({
  flashHeal: 6000,
  prayerOfHealing: 4000,
  prayerOfMending: 4000,
  haloPulse: 4000
});
const SERENITY_CDR_SURGE_BONUS_MS = 4000;

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

function normalizeSpellKeyList(spellKeys, fallbackSpellKeys = []) {
  const source = Array.isArray(spellKeys) ? spellKeys : fallbackSpellKeys;
  const normalized = [];
  for (const rawSpellKey of source) {
    const spellKey = String(rawSpellKey ?? "").trim();
    if (!spellKey || normalized.includes(spellKey)) {
      continue;
    }
    normalized.push(spellKey);
  }
  return normalized;
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

function getHealAmount(spellKey) {
  const coefficient = Number(HOLY_PRIEST_PRACTICE_TUNING.healAmountCoefficients?.[spellKey]);
  const baseAmount = Number.isFinite(coefficient) ? coefficient : 0;
  const scale = Math.max(0, Number(GLOBAL_HEALER_SCALING.intellectToHealingScale ?? 1) || 1);
  return baseAmount * scale;
}

function getManaCost(spellKey) {
  const fixedOverride = Number(HOLY_PRIEST_PRACTICE_TUNING.manaCostFixedOverrides?.[spellKey]);
  const ratio = Number(HOLY_PRIEST_PRACTICE_TUNING.manaCostBaseManaRatios?.[spellKey]);
  const baseMana = Math.max(1, Number(HOLY_PRIEST_PRACTICE_TUNING.baseMana ?? 100000));
  const legacyCost = Number(HOLY_PRIEST_PRACTICE_TUNING.manaCosts?.[spellKey]);
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
  const configured = Number(HOLY_PRIEST_PRACTICE_TUNING.castTimesMs?.[spellKey]);
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
  const configuredValue = HOLY_PRIEST_PRACTICE_TUNING.castTimeHasteAffectedBySpell?.[key];
  if (typeof configuredValue === "boolean") {
    return configuredValue;
  }
  return Boolean(DEFAULT_CAST_TIME_HASTE_AFFECTED_BY_SPELL[key]);
}

export const HOLY_PRIEST_PRACTICE_SPELLS = Object.freeze({
  prayerOfMending: {
    key: "prayerOfMending",
    name: "회복의 기원",
    requiresTarget: true,
    castTimeMs: getCastTimeMs("prayerOfMending", 0),
    castTimeAffectedByHaste: isCastTimeAffectedByHaste("prayerOfMending"),
    canMoveWhileCasting: true,
    cooldownMs: PRAYER_OF_MENDING_COOLDOWN_MS,
    manaCost: getManaCost("prayerOfMending"),
    active: true,
    clickCastable: true
  },
  flashHeal: {
    key: "flashHeal",
    name: "순간치유",
    requiresTarget: true,
    castTimeMs: getCastTimeMs("flashHeal", 1500),
    castTimeAffectedByHaste: isCastTimeAffectedByHaste("flashHeal"),
    canMoveWhileCasting: false,
    cooldownMs: 0,
    manaCost: getManaCost("flashHeal"),
    active: true,
    clickCastable: true
  },
  prayerOfHealing: {
    key: "prayerOfHealing",
    name: "치유의 기원",
    requiresTarget: true,
    castTimeMs: getCastTimeMs("prayerOfHealing", 2000),
    castTimeAffectedByHaste: isCastTimeAffectedByHaste("prayerOfHealing"),
    canMoveWhileCasting: false,
    cooldownMs: 0,
    manaCost: getManaCost("prayerOfHealing"),
    active: true,
    clickCastable: true
  },
  serenity: {
    key: "serenity",
    name: "평온",
    requiresTarget: true,
    castTimeMs: getCastTimeMs("serenity", 0),
    castTimeAffectedByHaste: isCastTimeAffectedByHaste("serenity"),
    canMoveWhileCasting: true,
    cooldownMs: 0,
    manaCost: getManaCost("serenity"),
    active: true,
    clickCastable: true
  },
  halo: {
    key: "halo",
    name: "후광",
    requiresTarget: false,
    castTimeMs: getCastTimeMs("halo", 1500),
    castTimeAffectedByHaste: isCastTimeAffectedByHaste("halo"),
    canMoveWhileCasting: false,
    cooldownMs: HALO_COOLDOWN_MS,
    manaCost: getManaCost("halo"),
    active: HALO_TALENT_ENABLED,
    clickCastable: false
  },
  fade: {
    key: "fade",
    name: "소실",
    requiresTarget: false,
    castTimeMs: getCastTimeMs("fade", 0),
    castTimeAffectedByHaste: isCastTimeAffectedByHaste("fade"),
    canMoveWhileCasting: true,
    cooldownMs: FADE_COOLDOWN_MS,
    manaCost: getManaCost("fade"),
    active: true,
    clickCastable: false,
    triggersGlobalCooldown: false
  },
  apotheosis: {
    key: "apotheosis",
    name: "절정",
    requiresTarget: false,
    castTimeMs: getCastTimeMs("apotheosis", 0),
    castTimeAffectedByHaste: isCastTimeAffectedByHaste("apotheosis"),
    canMoveWhileCasting: true,
    cooldownMs: APOTHEOSIS_COOLDOWN_MS,
    manaCost: getManaCost("apotheosis"),
    active: true,
    clickCastable: false
  },
  desperatePrayer: {
    key: "desperatePrayer",
    name: "구원의 기도",
    requiresTarget: false,
    castTimeMs: getCastTimeMs("desperatePrayer", 0),
    castTimeAffectedByHaste: isCastTimeAffectedByHaste("desperatePrayer"),
    canMoveWhileCasting: true,
    cooldownMs: DESPERATE_PRAYER_COOLDOWN_MS,
    manaCost: getManaCost("desperatePrayer"),
    active: true,
    clickCastable: false
  },
  divineHymn: {
    key: "divineHymn",
    name: "천상의 찬가",
    requiresTarget: false,
    castTimeMs: getCastTimeMs("divineHymn", 5000),
    castTimeAffectedByHaste: isCastTimeAffectedByHaste("divineHymn"),
    canMoveWhileCasting: false,
    cooldownMs: DIVINE_HYMN_COOLDOWN_MS,
    manaCost: getManaCost("divineHymn"),
    active: true,
    clickCastable: false
  }
});

export const HOLY_PRIEST_ACTIVE_SPELL_KEYS = Object.freeze(
  Object.values(HOLY_PRIEST_PRACTICE_SPELLS)
    .filter((spell) => spell.active)
    .map((spell) => spell.key)
);

export const HOLY_PRIEST_CLICK_CASTABLE_KEYS = Object.freeze(
  Object.values(HOLY_PRIEST_PRACTICE_SPELLS)
    .filter((spell) => spell.active && spell.clickCastable)
    .map((spell) => spell.key)
);

export const HOLY_PRIEST_DEFAULT_KEYBINDS = Object.freeze({
  flashHeal: "R",
  prayerOfHealing: "2",
  serenity: "3",
  prayerOfMending: "1",
  halo: "4",
  apotheosis: "V",
  fade: "Z",
  desperatePrayer: "CAPSLOCK",
  divineHymn: "C"
});

const HEALING_METRIC_SPELL_KEYS = Object.freeze([
  ...HOLY_PRIEST_ACTIVE_SPELL_KEYS,
  "ultimateSerenity",
  "benediction",
  "trailOfLight",
  "dispersingLight",
  "renew",
  "bindingHeal",
  "cosmicRipple",
  "divineImageHealingLight",
  "divineImageDazzlingLights",
  "divineImageBlessedLight",
  "echoOfLight",
  "leech"
]);

function createHealingBySpellMetrics() {
  const metrics = {};
  for (const spellKey of HEALING_METRIC_SPELL_KEYS) {
    metrics[spellKey] = 0;
  }
  return metrics;
}

export class HolyPriestPracticeEngine {
  constructor(config = {}) {
    const seed = parseSeed(config.seed);
    this.seed = seed;
    this.rng = createRng(seed);

    this.baseHealth = Math.max(1, Number(config.dummyBaseHealth ?? HOLY_PRIEST_PRACTICE_TUNING.dummyBaseHealth));
    this.maxMana = Math.max(0, Number(config.baseMana ?? HOLY_PRIEST_PRACTICE_TUNING.baseMana));
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
    this.autoManaRegenMultiplier = Math.max(
      0,
      Number(config.autoManaRegenMultiplier ?? DEFAULT_AUTO_MANA_REGEN_MULTIPLIER)
    );
    this.autoManaRegenTickMs = GLOBAL_AUTO_MANA_REGEN_TICK_MS;
    this.autoManaRegenPctOfMaxPerTick = GLOBAL_AUTO_MANA_REGEN_PCT_OF_MAX_PER_TICK * this.autoManaRegenMultiplier;
    this.manaTuningScale = Math.max(
      0,
      Number(config.manaTuningScale ?? GLOBAL_HEALER_SCALING.globalManaTuningScale ?? 1) || 1
    );
    this.leechHealingRatio = Math.max(0, Number(config.leechHealingRatio ?? DEFAULT_LEECH_HEALING_RATIO));
    this.spellQueueWindowMs = clamp(Number(config.queueWindowMs ?? DEFAULT_SPELL_QUEUE_WINDOW_MS), 0, 2000);
    this.hastePct = Math.max(0, Number(config.hastePct ?? DEFAULT_HASTE_PCT));
    this.intellect = Math.max(0, Number(config.intellect ?? DEFAULT_INTELLECT));
    this.masteryPct = Math.max(0, Number(config.masteryPct ?? 0));
    this.haloTalentEnabled =
      config.haloTalentEnabled !== false &&
      Boolean(config.haloTalentEnabled ?? HALO_TALENT_ENABLED);
    this.prayersOfTheVirtuousTalentEnabled =
      config.prayersOfTheVirtuousTalentEnabled !== false &&
      Boolean(config.prayersOfTheVirtuousTalentEnabled ?? PRAYERS_OF_THE_VIRTUOUS_TALENT_ENABLED);
    this.lightweaverTalentEnabled =
      config.lightweaverTalentEnabled !== false &&
      Boolean(config.lightweaverTalentEnabled ?? LIGHTWEAVER_TALENT_ENABLED);
    this.ultimateSerenityTalentEnabled =
      config.ultimateSerenityTalentEnabled !== false &&
      Boolean(config.ultimateSerenityTalentEnabled ?? ULTIMATE_SERENITY_TALENT_ENABLED);
    this.divineImageTalentEnabled =
      config.divineImageTalentEnabled !== false &&
      Boolean(config.divineImageTalentEnabled ?? DIVINE_IMAGE_TALENT_ENABLED);
    this.seasonOneTierTalentEnabled =
      config.seasonOneTierTalentEnabled !== false &&
      Boolean(config.seasonOneTierTalentEnabled ?? SEASON_ONE_TIER_TALENT_ENABLED);
    this.upliftingWordsTalentEnabled =
      config.upliftingWordsTalentEnabled !== false &&
      Boolean(config.upliftingWordsTalentEnabled ?? UPLIFTING_WORDS_TALENT_ENABLED);
    this.crisisManagementTalentEnabled =
      config.crisisManagementTalentEnabled !== false &&
      Boolean(config.crisisManagementTalentEnabled ?? CRISIS_MANAGEMENT_TALENT_ENABLED);
    this.trailOfLightTalentEnabled =
      config.trailOfLightTalentEnabled !== false &&
      Boolean(config.trailOfLightTalentEnabled ?? TRAIL_OF_LIGHT_TALENT_ENABLED);
    this.dispersingLightTalentEnabled =
      config.dispersingLightTalentEnabled !== false &&
      Boolean(config.dispersingLightTalentEnabled ?? DISPERSING_LIGHT_TALENT_ENABLED);
    this.lightsResurgenceTalentEnabled =
      config.lightsResurgenceTalentEnabled !== false &&
      Boolean(config.lightsResurgenceTalentEnabled ?? LIGHTS_RESURGENCE_TALENT_ENABLED);
    this.resonantEnergyTalentEnabled =
      config.resonantEnergyTalentEnabled !== false &&
      Boolean(config.resonantEnergyTalentEnabled ?? RESONANT_ENERGY_TALENT_ENABLED);
    this.upliftingWordsSerenityCritChanceBonus = clamp(
      Number(config.upliftingWordsSerenityCritChanceBonus ?? UPLIFTING_WORDS_SERENITY_CRIT_CHANCE_BONUS),
      0,
      1
    );
    this.crisisManagementFlashHealCritChanceBonus = clamp(
      Number(
        config.crisisManagementFlashHealCritChanceBonus ?? CRISIS_MANAGEMENT_FLASH_HEAL_CRIT_CHANCE_BONUS
      ),
      0,
      1
    );
    this.crisisManagementPrayerOfHealingCritChanceBonus = clamp(
      Number(
        config.crisisManagementPrayerOfHealingCritChanceBonus ??
        CRISIS_MANAGEMENT_PRAYER_OF_HEALING_CRIT_CHANCE_BONUS
      ),
      0,
      1
    );
    this.echoOfLightMasteryRatio = Math.max(0, this.masteryPct / 100);
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

    this.serenityMaxCharges = Math.max(
      1,
      Math.floor(Number(config.serenityMaxCharges ?? SERENITY_MAX_CHARGES))
    );
    this.serenityRechargeMs = Math.max(
      1000,
      Number(config.serenityChargeRecoveryMs ?? SERENITY_RECHARGE_MS)
    );
    this.prayerOfHealingTargetCount = Math.max(
      1,
      Math.floor(Number(config.prayerOfHealingTargetCount ?? PRAYER_OF_HEALING_TARGET_COUNT))
    );
    this.prayerOfHealingPrimaryTargetHealMultiplier = Math.max(
      0,
      Number(
        config.prayerOfHealingPrimaryTargetHealMultiplier ?? PRAYER_OF_HEALING_PRIMARY_TARGET_HEAL_MULTIPLIER
      )
    );
    this.prayerOfMendingDurationMs = Math.max(
      1000,
      Number(config.prayerOfMendingDurationMs ?? PRAYER_OF_MENDING_DURATION_MS)
    );
    const basePrayerOfMendingMaxJumps = Math.max(
      0,
      Math.floor(Number(config.prayerOfMendingMaxJumps ?? PRAYER_OF_MENDING_MAX_JUMPS))
    );
    const prayersOfTheVirtuousBonusJumps = Math.max(
      0,
      Math.floor(
        Number(config.prayersOfTheVirtuousBonusJumps ?? PRAYERS_OF_THE_VIRTUOUS_BONUS_JUMPS)
      )
    );
    this.prayerOfMendingMaxJumps = Math.max(
      0,
      basePrayerOfMendingMaxJumps +
      (this.prayersOfTheVirtuousTalentEnabled ? prayersOfTheVirtuousBonusJumps : 0)
    );
    this.seasonOneTierBenedictionDivineImageProcChance = clamp(
      Number(
        config.seasonOneTierBenedictionDivineImageProcChance ??
        SEASON_ONE_TIER_BENEDICTION_DIVINE_IMAGE_PROC_CHANCE
      ),
      0,
      1
    );
    this.seasonOneTierDivineImageHealingBonusRatio = Math.max(
      0,
      Number(
        config.seasonOneTierDivineImageHealingBonusRatio ??
        SEASON_ONE_TIER_DIVINE_IMAGE_HEALING_BONUS_RATIO
      )
    );
    this.seasonOneTierDivineImageDurationBonusMs = Math.max(
      0,
      Number(
        config.seasonOneTierDivineImageDurationBonusMs ??
        SEASON_ONE_TIER_DIVINE_IMAGE_DURATION_BONUS_MS
      )
    );
    this.unwaveringWillHealthThresholdRatio = clamp(
      Number(config.unwaveringWillHealthThresholdRatio ?? UNWAVERING_WILL_HEALTH_THRESHOLD_RATIO),
      0,
      1
    );
    this.unwaveringWillCastTimeReductionRatio = clamp(
      Number(config.unwaveringWillCastTimeReductionRatio ?? UNWAVERING_WILL_CAST_TIME_REDUCTION_RATIO),
      0,
      0.95
    );
    const divineImageStackDurationBaseMs = Math.max(
      0,
      Number(config.divineImageStackDurationMs ?? DIVINE_IMAGE_STACK_DURATION_MS)
    );
    this.divineImageStackDurationMs = divineImageStackDurationBaseMs + (
      this.seasonOneTierTalentEnabled ? this.seasonOneTierDivineImageDurationBonusMs : 0
    );
    this.divineImageDazzlingLightsTargetCount = Math.max(
      1,
      Math.floor(Number(config.divineImageDazzlingLightsTargetCount ?? DIVINE_IMAGE_DAZZLING_LIGHTS_TARGET_COUNT))
    );
    this.divineImageBlessedLightTargetCount = Math.max(
      1,
      Math.floor(Number(config.divineImageBlessedLightTargetCount ?? DIVINE_IMAGE_BLESSED_LIGHT_TARGET_COUNT))
    );
    this.haloCooldownMs = Math.max(0, Number(config.haloCooldownMs ?? HALO_COOLDOWN_MS));
    this.haloRepeatIntervalMs = Math.max(
      100,
      Number(config.haloRepeatIntervalMs ?? HALO_REPEAT_INTERVAL_MS)
    );
    this.haloTotalPulseCount = Math.max(
      1,
      Math.floor(Number(config.haloTotalPulseCount ?? HALO_TOTAL_PULSE_COUNT))
    );
    this.haloTicksPerPulse = Math.max(
      1,
      Math.floor(Number(config.haloTicksPerPulse ?? HALO_TICKS_PER_PULSE))
    );
    this.haloFullEffectTargetCount = Math.max(
      1,
      Math.floor(Number(config.haloFullEffectTargetCount ?? HALO_FULL_EFFECT_TARGET_COUNT))
    );
    this.cosmicRippleTargetCount = Math.max(
      1,
      Math.floor(Number(config.cosmicRippleTargetCount ?? COSMIC_RIPPLE_TARGET_COUNT))
    );
    this.cosmicRippleFromDivineHymnTickHealMultiplier = clamp(
      Number(config.cosmicRippleFromDivineHymnTickHealMultiplier ?? COSMIC_RIPPLE_FROM_DIVINE_HYMN_TICK_HEAL_MULTIPLIER),
      0,
      5
    );
    this.benedictionProcChance = clamp(
      Number(config.benedictionProcChance ?? BENEDICTION_PROC_CHANCE),
      0,
      1
    );
    this.benedictionDurationMs = Math.max(
      0,
      Number(config.benedictionDurationMs ?? BENEDICTION_DURATION_MS)
    );
    this.benedictionFlashHealHealBonusRatio = Math.max(
      0,
      Number(config.benedictionFlashHealHealBonusRatio ?? BENEDICTION_FLASH_HEAL_HEAL_BONUS_RATIO)
    );
    this.surgeOfLightBaseProcChanceAtFullMana = clamp(
      Number(config.surgeOfLightBaseProcChanceAtFullMana ?? SURGE_OF_LIGHT_BASE_PROC_CHANCE_AT_FULL_MANA),
      0,
      1
    );
    this.surgeOfLightProcChanceAtZeroMana = clamp(
      Number(config.surgeOfLightProcChanceAtZeroMana ?? SURGE_OF_LIGHT_PROC_CHANCE_AT_ZERO_MANA),
      0,
      1
    );
    this.surgeOfLightDurationMs = Math.max(
      0,
      Number(config.surgeOfLightDurationMs ?? SURGE_OF_LIGHT_DURATION_MS)
    );
    this.surgeOfLightMaxStacks = Math.max(
      1,
      Math.floor(Number(config.surgeOfLightMaxStacks ?? SURGE_OF_LIGHT_MAX_STACKS))
    );
    this.surgeOfLightManaCostMultiplier = clamp(
      Number(config.surgeOfLightManaCostMultiplier ?? SURGE_OF_LIGHT_MANA_COST_MULTIPLIER),
      0,
      1
    );
    this.surgeOfLightProcSpellKeySet = new Set(
      normalizeSpellKeyList(config.surgeOfLightProcSpellKeys, SURGE_OF_LIGHT_PROC_SPELL_KEYS)
    );
    this.fadeDamageReduction = clamp(
      Number(config.fadeDamageReduction ?? FADE_DAMAGE_REDUCTION),
      0,
      0.95
    );
    this.protectiveLightDurationMs = Math.max(
      0,
      Number(config.protectiveLightDurationMs ?? PROTECTIVE_LIGHT_DURATION_MS)
    );
    this.protectiveLightDamageReduction = clamp(
      Number(config.protectiveLightDamageReduction ?? PROTECTIVE_LIGHT_DAMAGE_REDUCTION),
      0,
      0.95
    );
    this.desperatePrayerInstantHealRatioOfMaxHp = clamp(
      Number(config.desperatePrayerInstantHealRatioOfMaxHp ?? DESPERATE_PRAYER_INSTANT_HEAL_RATIO_OF_MAX_HP),
      0,
      1
    );
    this.desperatePrayerSelfMaxHpBonusRatio = Math.max(
      0,
      Number(config.desperatePrayerSelfMaxHpBonusRatio ?? DESPERATE_PRAYER_SELF_MAX_HP_BONUS_RATIO)
    );
    this.desperatePrayerSelfMaxHpBonusDurationMs = Math.max(
      0,
      Number(config.desperatePrayerSelfMaxHpBonusDurationMs ?? DESPERATE_PRAYER_SELF_MAX_HP_BONUS_DURATION_MS)
    );
    this.divineHymnTickCount = Math.max(
      1,
      Math.floor(Number(config.divineHymnTickCount ?? DIVINE_HYMN_TICK_COUNT))
    );
    this.divineHymnFullEffectTargetCount = Math.max(
      1,
      Math.floor(Number(config.divineHymnFullEffectTargetCount ?? DIVINE_HYMN_FULL_EFFECT_TARGET_COUNT))
    );
    this.divineHymnHealingTakenStackRatio = clamp(
      Number(config.divineHymnHealingTakenStackRatio ?? DIVINE_HYMN_HEALING_TAKEN_STACK_RATIO),
      0,
      1
    );
    this.divineHymnHealingTakenBuffDurationMs = Math.max(
      0,
      Number(config.divineHymnHealingTakenBuffDurationMs ?? DIVINE_HYMN_HEALING_TAKEN_BUFF_DURATION_MS)
    );
    this.divineHymnHealingTakenMaxStacks = Math.max(
      1,
      Math.floor(Number(config.divineHymnHealingTakenMaxStacks ?? DIVINE_HYMN_HEALING_TAKEN_MAX_STACKS))
    );
    this.apotheosisDurationMs = Math.max(
      0,
      Number(config.apotheosisDurationMs ?? APOTHEOSIS_DURATION_MS)
    );
    this.apotheosisSerenityCdrMultiplier = Math.max(
      1,
      Number(config.apotheosisSerenityCdrMultiplier ?? APOTHEOSIS_SERENITY_CDR_MULTIPLIER)
    );
    this.apotheosisSerenityManaCostMultiplier = clamp(
      Number(config.apotheosisSerenityManaCostMultiplier ?? APOTHEOSIS_SERENITY_MANA_COST_MULTIPLIER),
      0,
      1
    );
    this.apotheosisHealingDoneBonusRatio = Math.max(
      0,
      Number(config.apotheosisHealingDoneBonusRatio ?? APOTHEOSIS_HEALING_DONE_BONUS_RATIO)
    );
    this.faithBuffDurationMs = Math.max(
      0,
      Number(config.faithBuffDurationMs ?? FAITH_BUFF_DURATION_MS)
    );
    this.faithMaxStacks = Math.max(
      0,
      Math.floor(Number(config.faithMaxStacks ?? FAITH_MAX_STACKS))
    );
    this.faithPrayerOfHealingBonusRatio = Math.max(
      0,
      Number(config.faithPrayerOfHealingBonusRatio ?? FAITH_PRAYER_OF_HEALING_BONUS_RATIO)
    );
    this.bindingHealFlashHealSelfHealRatio = clamp(
      Number(config.bindingHealFlashHealSelfHealRatio ?? BINDING_HEAL_FLASH_HEAL_SELF_HEAL_RATIO),
      0,
      1
    );
    this.trailOfLightHealRatio = clamp(
      Number(config.trailOfLightHealRatio ?? TRAIL_OF_LIGHT_HEAL_RATIO),
      0,
      1
    );
    this.dispersingLightReplicateRatio = clamp(
      Number(config.dispersingLightReplicateRatio ?? DISPERSING_LIGHT_REPLICATE_RATIO),
      0,
      1
    );
    this.dispersingLightTargetCount = Math.max(
      0,
      Math.floor(Number(config.dispersingLightTargetCount ?? DISPERSING_LIGHT_TARGET_COUNT))
    );
    this.lightsResurgenceRenewProcChance = clamp(
      Number(config.lightsResurgenceRenewProcChance ?? LIGHTS_RESURGENCE_RENEW_PROC_CHANCE),
      0,
      1
    );
    this.renewDurationMs = Math.max(
      0,
      Number(config.renewDurationMs ?? RENEW_DURATION_MS)
    );
    this.renewTickMs = Math.max(
      100,
      Number(config.renewTickMs ?? RENEW_TICK_MS)
    );
    this.resonantEnergyHealingTakenPerStackRatio = clamp(
      Number(
        config.resonantEnergyHealingTakenPerStackRatio ?? RESONANT_ENERGY_HEALING_TAKEN_PER_STACK_RATIO
      ),
      0,
      1
    );
    this.resonantEnergyDurationMs = Math.max(
      0,
      Number(config.resonantEnergyDurationMs ?? RESONANT_ENERGY_DURATION_MS)
    );
    this.resonantEnergyMaxStacks = Math.max(
      1,
      Math.floor(Number(config.resonantEnergyMaxStacks ?? RESONANT_ENERGY_MAX_STACKS))
    );
    this.lightweaverDurationMs = Math.max(
      0,
      Number(config.lightweaverDurationMs ?? LIGHTWEAVER_DURATION_MS)
    );
    this.lightweaverMaxStacks = Math.max(
      1,
      Math.floor(Number(config.lightweaverMaxStacks ?? LIGHTWEAVER_MAX_STACKS))
    );
    this.lightweaverPrayerOfHealingCastTimeReductionRatio = clamp(
      Number(
        config.lightweaverPrayerOfHealingCastTimeReductionRatio ??
        LIGHTWEAVER_PRAYER_OF_HEALING_CAST_TIME_REDUCTION_RATIO
      ),
      0,
      0.95
    );
    this.lightweaverPrayerOfHealingHealBonusRatio = Math.max(
      0,
      Number(config.lightweaverPrayerOfHealingHealBonusRatio ?? LIGHTWEAVER_PRAYER_OF_HEALING_HEAL_BONUS_RATIO)
    );
    this.ultimateSerenityAdditionalTargetCount = Math.max(
      0,
      Math.floor(Number(config.ultimateSerenityAdditionalTargetCount ?? ULTIMATE_SERENITY_ADDITIONAL_TARGET_COUNT))
    );
    this.ultimateSerenityHealRatio = clamp(
      Number(config.ultimateSerenityHealRatio ?? ULTIMATE_SERENITY_HEAL_RATIO),
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
      const baseMaxHp = Number.isFinite(configuredMaxHp) && configuredMaxHp > 0 ? configuredMaxHp : this.baseHealth;
      const configuredHp = Number(player.hp);
      const hp = Number.isFinite(configuredHp) ? clamp(configuredHp, 0, baseMaxHp) : baseMaxHp;
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
        baseMaxHp: round(baseMaxHp, 2),
        hp: round(hp, 2),
        maxHp: round(baseMaxHp, 2),
        alive: true,
        prayerOfMendingRemainingMs: 0,
        prayerOfMendingJumpsRemaining: 0,
        renewRemainingMs: 0,
        renewTickTimerMs: 0,
        resonantEnergyRemainingMs: 0,
        resonantEnergyStacks: 0,
        echoOfLightRemainingMs: 0,
        echoOfLightTickTimerMs: 0,
        echoOfLightPoolRemaining: 0,
        echoOfLightTickAmount: 0
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

    this.cooldowns = HOLY_PRIEST_ACTIVE_SPELL_KEYS.reduce((acc, spellKey) => {
      acc[spellKey] = 0;
      return acc;
    }, {});
    this.gcdRemainingMs = 0;
    this.currentCast = null;
    this.castSequence = 0;
    this.serenityRechargeTimersMs = [];
    this.lastFlashHealTargetId = "";
    this.previousFlashHealTargetId = "";

    this.buffs = {
      fadeMs: 0,
      protectiveLightMs: 0,
      apotheosisMs: 0,
      faithMs: 0,
      faithStacks: 0,
      benedictionMs: 0,
      divineImageMs: 0,
      divineImageStacks: 0,
      lightweaverMs: 0,
      lightweaverStacks: 0,
      desperatePrayerSelfMaxHpMs: 0,
      divineHymnHealingTakenMs: 0,
      divineHymnHealingTakenStacks: 0,
      surgeOfLightMs: 0,
      surgeOfLightStacks: 0
    };
    this.divineImageStackRemainingMsList = [];

    this.actionQueue = [];
    this.offGcdActionQueue = [];
    this.haloScheduledPulseEvents = [];
    this.resonantEnergyScheduledEvents = [];
    this.divineHymnChannelMs = 0;
    this.divineHymnTickTimerMs = 0;
    this.divineHymnTickIntervalMs = 0;
    this.divineHymnTicksRemaining = 0;
    this.divineHymnTotalTicks = Math.max(1, this.divineHymnTickCount);
    this.divineHymnTicksProcessed = 0;

    this.metrics = {
      healingDone: 0,
      overhealing: 0,
      healingBySpell: createHealingBySpellMetrics(),
      healingByTarget: {},
      damageTaken: 0,
      manaSpent: 0,
      deaths: 0,
      triageHealing: 0,
      rawPrayerOfHealingCasts: 0,
      wastedLightweaverStacks: 0,
      wastedSurgeOfLightStacks: 0,
      surgeOfLightConsumedTotal: 0,
      surgeOfLightConsumedFlashHealCasts: 0,
      surgeOfLightConsumedPrayerOfHealingCasts: 0,
      effectiveSerenityCooldownReductionMs: 0,
      wastedHolyPower: 0,
      casts: HOLY_PRIEST_ACTIVE_SPELL_KEYS.reduce((acc, spellKey) => {
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

  getMostInjuredAlivePlayers(count, includeHealthyFallback = false) {
    const targetCount = Math.max(0, Math.floor(Number(count) || 0));
    if (!targetCount) {
      return [];
    }
    const injured = this.players
      .filter((player) => player.alive && player.hp < player.maxHp)
      .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
    if (!includeHealthyFallback || injured.length >= targetCount) {
      return injured.slice(0, targetCount);
    }
    const injuredIdSet = new Set(injured.map((player) => player.id));
    const healthy = this.players
      .filter((player) => player.alive && !injuredIdSet.has(player.id))
      .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
    return [...injured, ...healthy].slice(0, targetCount);
  }

  getLowestHealthAlivePlayer() {
    const targets = this.players
      .filter((player) => player.alive)
      .sort((a, b) => (a.maxHp > 0 ? a.hp / a.maxHp : 1) - (b.maxHp > 0 ? b.hp / b.maxHp : 1));
    return targets[0] ?? null;
  }

  resolveTrailOfLightTargetId(currentTargetId) {
    const currentId = String(currentTargetId ?? "").trim();
    if (!currentId) {
      return "";
    }

    const lastTargetId = String(this.lastFlashHealTargetId ?? "").trim();
    if (lastTargetId && lastTargetId !== currentId) {
      return lastTargetId;
    }

    const previousTargetId = String(this.previousFlashHealTargetId ?? "").trim();
    if (previousTargetId && previousTargetId !== currentId) {
      return previousTargetId;
    }

    return "";
  }

  updateTrailOfLightTargetHistory(currentTargetId) {
    const currentId = String(currentTargetId ?? "").trim();
    if (!currentId) {
      return;
    }
    const lastTargetId = String(this.lastFlashHealTargetId ?? "").trim();
    if (lastTargetId) {
      this.previousFlashHealTargetId = lastTargetId;
    }
    this.lastFlashHealTargetId = currentId;
  }

  triggerTrailOfLightAfterFlashHeal(currentTarget, flashHealResult, sourceLabel = "순간치유") {
    const currentTargetId = String(currentTarget?.id ?? "").trim();
    if (!currentTargetId) {
      return;
    }

    const trailTargetId = this.resolveTrailOfLightTargetId(currentTargetId);
    const sourceHealAmount = Math.max(
      0,
      Number(flashHealResult?.effective ?? 0) + Number(flashHealResult?.overheal ?? 0)
    );

    if (
      this.trailOfLightTalentEnabled &&
      this.trailOfLightHealRatio > 0 &&
      trailTargetId &&
      sourceHealAmount > 0
    ) {
      const trailResult = this.applyHeal(
        trailTargetId,
        sourceHealAmount * this.trailOfLightHealRatio,
        false,
        {
          spellKey: "trailOfLight",
          canCrit: false,
          rawAmount: true,
          isDirectHeal: true,
          ignoreHealingDoneModifiers: true,
          ignoreHealingTakenModifiers: true
        }
      );
      if (Math.max(0, Number(trailResult?.effective ?? 0)) > 0) {
        const trailTarget = this.findPlayer(trailTargetId);
        this.pushLog(
          `빛의 흔적 ${trailTarget?.name ?? "대상"} ${fmtSigned(trailResult.effective)} (${sourceLabel})`,
          "heal"
        );
      }
    }

    this.updateTrailOfLightTargetHistory(currentTargetId);
  }

  triggerDispersingLightAfterFlashHeal(currentTarget, flashHealResult, sourceLabel = "순간치유") {
    if (
      !this.dispersingLightTalentEnabled ||
      this.dispersingLightReplicateRatio <= 0 ||
      this.dispersingLightTargetCount <= 0
    ) {
      return;
    }

    const currentTargetId = String(currentTarget?.id ?? "").trim();
    const sourceHealAmount = Math.max(0, Number(flashHealResult?.effective ?? 0));
    if (!currentTargetId || sourceHealAmount <= 0) {
      return;
    }

    const replicatedHealPerTarget = sourceHealAmount * this.dispersingLightReplicateRatio;
    if (replicatedHealPerTarget <= 0) {
      return;
    }

    const targets = this.getMostInjuredAlivePlayers(this.dispersingLightTargetCount + 1, false)
      .filter((candidate) => candidate.id !== currentTargetId)
      .slice(0, this.dispersingLightTargetCount);
    if (!targets.length) {
      return;
    }

    let totalEffective = 0;
    for (const target of targets) {
      const result = this.applyHeal(target.id, replicatedHealPerTarget, false, {
        spellKey: "dispersingLight",
        canCrit: false,
        rawAmount: true,
        isDirectHeal: true,
        ignoreHealingDoneModifiers: true,
        ignoreHealingTakenModifiers: true
      });
      totalEffective += Math.max(0, Number(result?.effective ?? 0));
    }

    if (totalEffective > 0) {
      this.pushLog(
        `흩어지는 빛 ${targets.length}명 ${fmtSigned(totalEffective)} (${sourceLabel})`,
        "heal"
      );
    }
  }

  getSerenityCharges() {
    return Math.max(0, this.serenityMaxCharges - this.serenityRechargeTimersMs.length);
  }

  getSerenityNextRechargeRemainingMs() {
    if (!this.serenityRechargeTimersMs.length) {
      return 0;
    }
    return Math.max(0, Math.min(...this.serenityRechargeTimersMs));
  }

  consumeSerenityCharge() {
    if (this.getSerenityCharges() <= 0) {
      return false;
    }
    this.serenityRechargeTimersMs.push(this.serenityRechargeMs);
    return true;
  }

  tickSerenityRecharge(dt) {
    this.advanceSerenityRechargeTimersBy(dt);
  }

  // Future talent hooks can call this to apply additional Serenity recharge progress.
  advanceSerenityRechargeTimersBy(progressMs = 0) {
    const dt = Math.max(0, Number(progressMs) || 0);
    if (dt <= 0) {
      return;
    }
    if (!this.serenityRechargeTimersMs.length) {
      return;
    }
    let completedCount = 0;
    const nextTimers = [];
    for (const remainingMs of this.serenityRechargeTimersMs) {
      const nextRemainingMs = Math.max(0, Number(remainingMs || 0) - dt);
      if (nextRemainingMs <= 0) {
        completedCount += 1;
      } else {
        nextTimers.push(nextRemainingMs);
      }
    }
    this.serenityRechargeTimersMs = nextTimers;

    if (completedCount > 0) {
      for (let index = 0; index < completedCount; index += 1) {
        this.triggerCosmicRipple();
      }
    }
    this.updateSerenityCooldownSnapshot();
  }

  grantSerenityCharge(chargeCount = 1, options = {}) {
    const requestedCount = Math.max(0, Math.floor(Number(chargeCount) || 0));
    if (!requestedCount || !this.serenityRechargeTimersMs.length) {
      return 0;
    }

    const triggerCosmicRippleOnGain = options.triggerCosmicRippleOnGain !== false;
    let gainedCount = 0;
    while (gainedCount < requestedCount && this.serenityRechargeTimersMs.length) {
      let smallestTimerIndex = 0;
      let smallestTimerValue = Number(this.serenityRechargeTimersMs[0] ?? Number.POSITIVE_INFINITY);
      for (let index = 1; index < this.serenityRechargeTimersMs.length; index += 1) {
        const timerValue = Number(this.serenityRechargeTimersMs[index] ?? Number.POSITIVE_INFINITY);
        if (timerValue < smallestTimerValue) {
          smallestTimerValue = timerValue;
          smallestTimerIndex = index;
        }
      }
      this.serenityRechargeTimersMs.splice(smallestTimerIndex, 1);
      gainedCount += 1;
    }

    if (gainedCount > 0 && triggerCosmicRippleOnGain) {
      for (let index = 0; index < gainedCount; index += 1) {
        this.triggerCosmicRipple();
      }
    }
    this.updateSerenityCooldownSnapshot();
    return gainedCount;
  }

  hasApotheosisBuff() {
    return Math.max(0, Number(this.buffs.apotheosisMs ?? 0)) > 0;
  }

  hasFaithBuff() {
    return Math.max(0, Number(this.buffs.faithMs ?? 0)) > 0 && Math.max(0, Number(this.buffs.faithStacks ?? 0)) > 0;
  }

  getSerenityCooldownReductionMultiplier() {
    return this.hasApotheosisBuff() ? this.apotheosisSerenityCdrMultiplier : 1;
  }

  getSerenityCooldownReductionMsFromSpell(spellKey, options = {}) {
    const normalizedSpellKey = String(spellKey ?? "").trim();
    const baseReductionMs = Math.max(0, Number(SERENITY_CDR_MS_BY_SPELL_KEY[normalizedSpellKey] ?? 0));
    const surgeBonusMs = options.surgeOfLightConsumed ? SERENITY_CDR_SURGE_BONUS_MS : 0;
    const totalBeforeMultiplier = baseReductionMs + surgeBonusMs;
    if (totalBeforeMultiplier <= 0) {
      return 0;
    }
    return totalBeforeMultiplier * this.getSerenityCooldownReductionMultiplier();
  }

  getSerenityTotalRechargeRemainingMs() {
    if (!Array.isArray(this.serenityRechargeTimersMs) || !this.serenityRechargeTimersMs.length) {
      return 0;
    }
    return this.serenityRechargeTimersMs.reduce(
      (sum, remainingMs) => sum + Math.max(0, Number(remainingMs) || 0),
      0
    );
  }

  applySerenityCooldownReductionToRechargeTimers(progressMs = 0) {
    let remainingProgressMs = Math.max(0, Number(progressMs) || 0);
    if (remainingProgressMs <= 0 || !this.serenityRechargeTimersMs.length) {
      return 0;
    }

    let appliedReductionMs = 0;
    let completedCount = 0;

    while (remainingProgressMs > 0 && this.serenityRechargeTimersMs.length) {
      let smallestTimerIndex = 0;
      let smallestTimerValue = Math.max(
        0,
        Number(this.serenityRechargeTimersMs[0] ?? Number.POSITIVE_INFINITY) || 0
      );
      for (let index = 1; index < this.serenityRechargeTimersMs.length; index += 1) {
        const timerValue = Math.max(
          0,
          Number(this.serenityRechargeTimersMs[index] ?? Number.POSITIVE_INFINITY) || 0
        );
        if (timerValue < smallestTimerValue) {
          smallestTimerValue = timerValue;
          smallestTimerIndex = index;
        }
      }

      if (!Number.isFinite(smallestTimerValue) || smallestTimerValue <= 0) {
        this.serenityRechargeTimersMs.splice(smallestTimerIndex, 1);
        completedCount += 1;
        continue;
      }

      const reductionAppliedToTimerMs = Math.min(smallestTimerValue, remainingProgressMs);
      const nextRemainingMs = Math.max(0, smallestTimerValue - reductionAppliedToTimerMs);

      appliedReductionMs += reductionAppliedToTimerMs;
      remainingProgressMs -= reductionAppliedToTimerMs;

      if (nextRemainingMs <= 0) {
        this.serenityRechargeTimersMs.splice(smallestTimerIndex, 1);
        completedCount += 1;
      } else {
        this.serenityRechargeTimersMs[smallestTimerIndex] = nextRemainingMs;
      }
    }

    if (completedCount > 0) {
      for (let index = 0; index < completedCount; index += 1) {
        this.triggerCosmicRipple();
      }
    }

    this.updateSerenityCooldownSnapshot();
    return appliedReductionMs;
  }

  applySerenityCooldownReductionFromSpell(spellKey, options = {}) {
    const reductionMs = this.getSerenityCooldownReductionMsFromSpell(spellKey, options);
    if (reductionMs <= 0) {
      return 0;
    }

    const beforeReductionTotalMs = this.getSerenityTotalRechargeRemainingMs();
    this.applySerenityCooldownReductionToRechargeTimers(reductionMs);
    const afterReductionTotalMs = this.getSerenityTotalRechargeRemainingMs();
    const effectiveReductionMs = Math.max(0, beforeReductionTotalMs - afterReductionTotalMs);
    if (effectiveReductionMs > 0) {
      this.metrics.effectiveSerenityCooldownReductionMs = round(
        Math.max(0, Number(this.metrics.effectiveSerenityCooldownReductionMs ?? 0)) + effectiveReductionMs,
        2
      );
    }
    return effectiveReductionMs;
  }

  consumeFaithPrayerOfHealingStack() {
    if (!this.hasFaithBuff()) {
      return false;
    }

    this.buffs.faithStacks = Math.max(0, Number(this.buffs.faithStacks ?? 0) - 1);
    if (this.buffs.faithStacks <= 0) {
      this.buffs.faithMs = 0;
    }
    return true;
  }

  hasBenedictionBuff() {
    return Math.max(0, Number(this.buffs.benedictionMs ?? 0)) > 0;
  }

  hasProtectiveLightBuff() {
    return Math.max(0, Number(this.buffs.protectiveLightMs ?? 0)) > 0;
  }

  grantProtectiveLight(sourceLabel = "") {
    if (this.protectiveLightDurationMs <= 0 || this.protectiveLightDamageReduction <= 0) {
      return false;
    }

    const wasActive = this.hasProtectiveLightBuff();
    this.buffs.protectiveLightMs = this.protectiveLightDurationMs;
    const sourcePrefix = sourceLabel ? `${sourceLabel}: ` : "";
    this.pushLog(`${sourcePrefix}보호의 빛 ${wasActive ? "갱신" : "발동"}`, "buff");
    return true;
  }

  tickProtectiveLightBuff(dt) {
    this.buffs.protectiveLightMs = Math.max(0, Number(this.buffs.protectiveLightMs ?? 0) - dt);
  }

  syncDivineImageBuffState() {
    if (!this.divineImageTalentEnabled || !Array.isArray(this.divineImageStackRemainingMsList)) {
      this.divineImageStackRemainingMsList = [];
      this.buffs.divineImageMs = 0;
      this.buffs.divineImageStacks = 0;
      return;
    }

    this.divineImageStackRemainingMsList = this.divineImageStackRemainingMsList
      .map((remainingMs) => Math.max(0, Number(remainingMs) || 0))
      .filter((remainingMs) => remainingMs > 0);

    this.buffs.divineImageStacks = this.divineImageStackRemainingMsList.length;
    this.buffs.divineImageMs = this.divineImageStackRemainingMsList.length
      ? Math.max(...this.divineImageStackRemainingMsList)
      : 0;
  }

  getDivineImageStacks() {
    this.syncDivineImageBuffState();
    return Math.max(0, Math.floor(Number(this.buffs.divineImageStacks ?? 0)));
  }

  gainDivineImageStack(sourceLabel = "") {
    if (!this.divineImageTalentEnabled || this.divineImageStackDurationMs <= 0) {
      return 0;
    }

    this.divineImageStackRemainingMsList.push(this.divineImageStackDurationMs);
    this.syncDivineImageBuffState();
    const sourcePrefix = sourceLabel ? `${sourceLabel}: ` : "";
    this.pushLog(
      `${sourcePrefix}신성한 환영 (${this.buffs.divineImageStacks})`,
      "buff"
    );
    return Math.max(0, Math.floor(Number(this.buffs.divineImageStacks ?? 0)));
  }

  tickDivineImageBuff(dt) {
    if (!this.divineImageTalentEnabled) {
      this.divineImageStackRemainingMsList = [];
      this.buffs.divineImageMs = 0;
      this.buffs.divineImageStacks = 0;
      return;
    }

    if (!Array.isArray(this.divineImageStackRemainingMsList) || !this.divineImageStackRemainingMsList.length) {
      this.syncDivineImageBuffState();
      return;
    }

    this.divineImageStackRemainingMsList = this.divineImageStackRemainingMsList
      .map((remainingMs) => Math.max(0, Number(remainingMs) - dt))
      .filter((remainingMs) => remainingMs > 0);
    this.syncDivineImageBuffState();
  }

  triggerDivineImageHealingLight(sourceLabel = "") {
    const stacks = this.getDivineImageStacks();
    if (stacks <= 0) {
      return { targetCount: 0, total: 0, criticalCount: 0 };
    }

    const target = this.getMostInjuredAlivePlayers(1, true)[0] ?? null;
    if (!target) {
      return { targetCount: 0, total: 0, criticalCount: 0 };
    }

    const result = this.applyHeal(target.id, getHealAmount("divineImageHealingLight") * stacks, false, {
      spellKey: "divineImageHealingLight",
      procEcho: false
    });
    const total = Math.max(0, Number(result?.effective ?? 0));
    const criticalCount = result?.isCritical ? 1 : 0;
    const sourcePrefix = sourceLabel ? `${sourceLabel}: ` : "";
    this.pushLog(
      `${sourcePrefix}신성한 환영 - 치유의 빛 ${target.name} ${fmtSigned(total)} (${stacks})${criticalCount > 0 ? " (치명)" : ""}`,
      "heal"
    );
    return {
      targetCount: 1,
      total: round(total, 2),
      criticalCount
    };
  }

  triggerDivineImageDazzlingLights(sourceLabel = "") {
    const stacks = this.getDivineImageStacks();
    if (stacks <= 0) {
      return { targetCount: 0, total: 0, criticalCount: 0 };
    }

    const targets = this.getMostInjuredAlivePlayers(this.divineImageDazzlingLightsTargetCount, true);
    if (!targets.length) {
      return { targetCount: 0, total: 0, criticalCount: 0 };
    }

    let total = 0;
    let criticalCount = 0;
    for (const target of targets) {
      const result = this.applyHeal(target.id, getHealAmount("divineImageDazzlingLights") * stacks, false, {
        spellKey: "divineImageDazzlingLights",
        procEcho: false
      });
      total += Math.max(0, Number(result?.effective ?? 0));
      if (result?.isCritical) {
        criticalCount += 1;
      }
    }

    const sourcePrefix = sourceLabel ? `${sourceLabel}: ` : "";
    this.pushLog(
      `${sourcePrefix}신성한 환영 - 눈부신 빛 ${targets.length}명 ${fmtSigned(total)} (${stacks})${criticalCount > 0 ? ` (치명 ${criticalCount})` : ""}`,
      "heal"
    );
    return {
      targetCount: targets.length,
      total: round(total, 2),
      criticalCount
    };
  }

  triggerDivineImageBlessedLight(sourceLabel = "") {
    const stacks = this.getDivineImageStacks();
    if (stacks <= 0) {
      return { targetCount: 0, total: 0, criticalCount: 0 };
    }

    const targets = this.getMostInjuredAlivePlayers(this.divineImageBlessedLightTargetCount, true);
    if (!targets.length) {
      return { targetCount: 0, total: 0, criticalCount: 0 };
    }

    let total = 0;
    let criticalCount = 0;
    for (const target of targets) {
      const result = this.applyHeal(target.id, getHealAmount("divineImageBlessedLight") * stacks, false, {
        spellKey: "divineImageBlessedLight",
        procEcho: false
      });
      total += Math.max(0, Number(result?.effective ?? 0));
      if (result?.isCritical) {
        criticalCount += 1;
      }
    }

    const sourcePrefix = sourceLabel ? `${sourceLabel}: ` : "";
    this.pushLog(
      `${sourcePrefix}신성한 환영 - 축복받은 빛 ${targets.length}명 ${fmtSigned(total)} (${stacks})${criticalCount > 0 ? ` (치명 ${criticalCount})` : ""}`,
      "heal"
    );
    return {
      targetCount: targets.length,
      total: round(total, 2),
      criticalCount
    };
  }

  isBenedictionEmpoweredFlashHeal() {
    return this.hasApotheosisBuff() || this.hasBenedictionBuff();
  }

  grantBenedictionBuff(sourceLabel = "") {
    if (this.benedictionDurationMs <= 0) {
      return false;
    }

    const wasActive = this.hasBenedictionBuff();
    this.buffs.benedictionMs = this.benedictionDurationMs;
    const sourcePrefix = sourceLabel ? `${sourceLabel}: ` : "";
    if (wasActive) {
      this.pushLog(`${sourcePrefix}축도 갱신`, "buff");
    } else {
      this.pushLog(`${sourcePrefix}축도 발동`, "buff");
    }
    return true;
  }

  tryProcBenedictionFromPrayerOfMending() {
    if (this.benedictionDurationMs <= 0 || this.benedictionProcChance <= 0) {
      return false;
    }
    if (this.rng() > this.benedictionProcChance) {
      return false;
    }
    return this.grantBenedictionBuff("회복의 기원");
  }

  tryProcDivineImageFromSeasonOneTierBenediction() {
    if (!this.seasonOneTierTalentEnabled || this.seasonOneTierBenedictionDivineImageProcChance <= 0) {
      return false;
    }
    if (this.rng() > this.seasonOneTierBenedictionDivineImageProcChance) {
      return false;
    }
    return this.gainDivineImageStack("시즌1 티어 (축도)") > 0;
  }

  consumeBenedictionBuff() {
    if (!this.hasBenedictionBuff()) {
      return false;
    }
    this.buffs.benedictionMs = 0;
    return true;
  }

  tickBenedictionBuff(dt) {
    this.buffs.benedictionMs = Math.max(0, Number(this.buffs.benedictionMs ?? 0) - dt);
  }

  hasLightweaverBuff() {
    if (!this.lightweaverTalentEnabled) {
      return false;
    }
    return Math.max(0, Number(this.buffs.lightweaverMs ?? 0)) > 0 &&
      Math.max(0, Number(this.buffs.lightweaverStacks ?? 0)) > 0;
  }

  grantLightweaverStack(sourceLabel = "") {
    if (!this.lightweaverTalentEnabled || this.lightweaverDurationMs <= 0 || this.lightweaverMaxStacks <= 0) {
      return false;
    }

    const previousStacks = Math.max(0, Math.floor(Number(this.buffs.lightweaverStacks ?? 0)));
    if (previousStacks >= this.lightweaverMaxStacks) {
      this.metrics.wastedLightweaverStacks = Math.max(
        0,
        Math.round(Number(this.metrics.wastedLightweaverStacks ?? 0)) + 1
      );
    }
    this.buffs.lightweaverStacks = Math.min(this.lightweaverMaxStacks, previousStacks + 1);
    this.buffs.lightweaverMs = this.lightweaverDurationMs;

    const sourcePrefix = sourceLabel ? `${sourceLabel}: ` : "";
    const nextStacks = this.buffs.lightweaverStacks;
    if (previousStacks <= 0) {
      this.pushLog(`${sourcePrefix}빛술사 발동 (${nextStacks}/${this.lightweaverMaxStacks})`, "buff");
    } else if (nextStacks > previousStacks) {
      this.pushLog(`${sourcePrefix}빛술사 중첩 (${nextStacks}/${this.lightweaverMaxStacks})`, "buff");
    } else {
      this.pushLog(`${sourcePrefix}빛술사 갱신 (${nextStacks}/${this.lightweaverMaxStacks})`, "buff");
    }
    return true;
  }

  consumeLightweaverStack() {
    if (!this.hasLightweaverBuff()) {
      return false;
    }

    this.buffs.lightweaverStacks = Math.max(0, Math.floor(Number(this.buffs.lightweaverStacks ?? 0)) - 1);
    if (this.buffs.lightweaverStacks <= 0) {
      this.buffs.lightweaverMs = 0;
    }
    return true;
  }

  tickLightweaverBuff(dt) {
    if (!this.lightweaverTalentEnabled) {
      this.buffs.lightweaverMs = 0;
      this.buffs.lightweaverStacks = 0;
      return;
    }

    this.buffs.lightweaverMs = Math.max(0, Number(this.buffs.lightweaverMs ?? 0) - dt);
    if (this.buffs.lightweaverMs <= 0) {
      this.buffs.lightweaverStacks = 0;
    }
  }

  activateApotheosis() {
    if (this.apotheosisDurationMs > 0) {
      this.buffs.apotheosisMs = this.apotheosisDurationMs;
    }
    if (this.faithBuffDurationMs > 0 && this.faithMaxStacks > 0) {
      this.buffs.faithMs = this.faithBuffDurationMs;
      this.buffs.faithStacks = this.faithMaxStacks;
    } else {
      this.buffs.faithMs = 0;
      this.buffs.faithStacks = 0;
    }

    const gainedCount = this.grantSerenityCharge(1, { triggerCosmicRippleOnGain: true });
    this.pushLog(
      `절정 발동${gainedCount > 0 ? " (평온 +1충전)" : " (평온 충전 없음)"}${this.faithMaxStacks > 0 ? `, 신앙 ${this.faithMaxStacks}중첩` : ""}`,
      "buff"
    );
  }

  updateSerenityCooldownSnapshot() {
    this.cooldowns.serenity = this.getSerenityCharges() > 0 ? 0 : this.getSerenityNextRechargeRemainingMs();
  }

  hasSurgeOfLightBuff() {
    return this.buffs.surgeOfLightMs > 0 && this.buffs.surgeOfLightStacks > 0;
  }

  isSurgeOfLightEmpoweredSpell(spellKey) {
    return SURGE_OF_LIGHT_EMPOWERED_SPELL_KEY_SET.has(String(spellKey ?? "").trim());
  }

  isSurgeOfLightEmpoweredCast(spellKey) {
    return this.isSurgeOfLightEmpoweredSpell(spellKey) && this.hasSurgeOfLightBuff();
  }

  getCurrentManaRatio() {
    if (this.maxMana <= 0) {
      return 0;
    }
    return clamp(this.mana / this.maxMana, 0, 1);
  }

  getSurgeOfLightProcChance() {
    const fullManaChance = clamp(this.surgeOfLightBaseProcChanceAtFullMana, 0, 1);
    const zeroManaChance = clamp(this.surgeOfLightProcChanceAtZeroMana, 0, 1);
    const manaRatio = this.getCurrentManaRatio();
    return clamp(fullManaChance + (1 - manaRatio) * (zeroManaChance - fullManaChance), 0, 1);
  }

  grantSurgeOfLightStack(sourceLabel = "") {
    if (this.surgeOfLightDurationMs <= 0 || this.surgeOfLightMaxStacks <= 0) {
      return false;
    }

    const previousStacks = Math.max(0, Math.floor(Number(this.buffs.surgeOfLightStacks ?? 0)));
    if (previousStacks >= this.surgeOfLightMaxStacks) {
      this.metrics.wastedSurgeOfLightStacks = Math.max(
        0,
        Math.round(Number(this.metrics.wastedSurgeOfLightStacks ?? 0)) + 1
      );
    }
    this.buffs.surgeOfLightStacks = Math.min(this.surgeOfLightMaxStacks, previousStacks + 1);
    this.buffs.surgeOfLightMs = this.surgeOfLightDurationMs;

    const nextStacks = this.buffs.surgeOfLightStacks;
    const sourcePrefix = sourceLabel ? `${sourceLabel}: ` : "";
    if (previousStacks <= 0) {
      this.pushLog(`${sourcePrefix}빛의 쇄도 발동 (${nextStacks}/${this.surgeOfLightMaxStacks})`, "buff");
    } else if (nextStacks > previousStacks) {
      this.pushLog(`${sourcePrefix}빛의 쇄도 중첩 (${nextStacks}/${this.surgeOfLightMaxStacks})`, "buff");
    } else {
      this.pushLog(`${sourcePrefix}빛의 쇄도 갱신 (${nextStacks}/${this.surgeOfLightMaxStacks})`, "buff");
    }
    return true;
  }

  tryProcSurgeOfLight(spellKey) {
    const normalizedSpellKey = String(spellKey ?? "").trim();
    if (!normalizedSpellKey || !this.surgeOfLightProcSpellKeySet.has(normalizedSpellKey)) {
      return false;
    }

    const procChance = this.getSurgeOfLightProcChance();
    if (procChance <= 0 || this.rng() > procChance) {
      return false;
    }
    return this.grantSurgeOfLightStack();
  }

  consumeSurgeOfLightStack() {
    if (!this.hasSurgeOfLightBuff()) {
      return false;
    }

    this.buffs.surgeOfLightStacks = Math.max(0, this.buffs.surgeOfLightStacks - 1);
    if (this.buffs.surgeOfLightStacks <= 0) {
      this.buffs.surgeOfLightMs = 0;
    }
    return true;
  }

  tickSurgeOfLightBuff(dt) {
    this.buffs.surgeOfLightMs = Math.max(0, this.buffs.surgeOfLightMs - dt);
    if (this.buffs.surgeOfLightMs <= 0) {
      this.buffs.surgeOfLightStacks = 0;
    }
  }

  clearPrayerOfMendingFromTarget(target) {
    if (!target) {
      return;
    }
    target.prayerOfMendingRemainingMs = 0;
    target.prayerOfMendingJumpsRemaining = 0;
  }

  clearRenewFromTarget(target) {
    if (!target) {
      return;
    }
    target.renewRemainingMs = 0;
    target.renewTickTimerMs = 0;
  }

  clearResonantEnergyFromTarget(target) {
    if (!target) {
      return;
    }
    target.resonantEnergyRemainingMs = 0;
    target.resonantEnergyStacks = 0;
  }

  clearEchoOfLightFromTarget(target) {
    if (!target) {
      return;
    }
    target.echoOfLightRemainingMs = 0;
    target.echoOfLightTickTimerMs = 0;
    target.echoOfLightPoolRemaining = 0;
    target.echoOfLightTickAmount = 0;
  }

  clearAllPrayerOfMendingBuffs() {
    for (const player of this.players) {
      this.clearPrayerOfMendingFromTarget(player);
    }
  }

  applyPrayerOfMendingToTarget(target, jumpsRemaining = this.prayerOfMendingMaxJumps) {
    if (!target || !target.alive) {
      return false;
    }
    target.prayerOfMendingRemainingMs = this.prayerOfMendingDurationMs;
    target.prayerOfMendingJumpsRemaining = Math.max(0, Math.floor(Number(jumpsRemaining) || 0));
    return true;
  }

  applyRenewToTarget(target) {
    if (!target || !target.alive || this.renewDurationMs <= 0 || this.renewTickMs <= 0) {
      return false;
    }
    target.renewRemainingMs = this.renewDurationMs;
    target.renewTickTimerMs = this.renewTickMs;
    return true;
  }

  tryProcLightsResurgenceRenewFromPrayerOfMending(target) {
    if (!this.lightsResurgenceTalentEnabled) {
      return false;
    }
    if (this.lightsResurgenceRenewProcChance <= 0 || this.renewDurationMs <= 0 || this.renewTickMs <= 0) {
      return false;
    }
    if (!target || !target.alive || this.rng() > this.lightsResurgenceRenewProcChance) {
      return false;
    }
    return this.applyRenewToTarget(target);
  }

  selectPrayerOfMendingJumpTarget(excludedTargetId = "") {
    const excludedId = String(excludedTargetId ?? "").trim();
    const aliveTargets = this.players.filter((player) => player.alive && player.id !== excludedId);
    if (!aliveTargets.length) {
      return null;
    }

    const withoutPrayerOfMending = aliveTargets
      .filter((player) => player.prayerOfMendingRemainingMs <= 0)
      .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
    if (withoutPrayerOfMending.length) {
      return withoutPrayerOfMending[0];
    }

    const fallback = aliveTargets.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
    return fallback[0] ?? null;
  }

  triggerPrayerOfMendingOnDamage(target) {
    if (!target || !target.alive || target.prayerOfMendingRemainingMs <= 0) {
      return;
    }

    const jumpsRemainingBeforeProc = Math.max(0, Math.floor(Number(target.prayerOfMendingJumpsRemaining) || 0));
    this.clearPrayerOfMendingFromTarget(target);

    const healResult = this.applyHeal(target.id, getHealAmount("prayerOfMending"), false, {
      spellKey: "prayerOfMending",
      isDirectHeal: true,
      canCrit: false,
      suppressLeech: true
    });
    this.tryProcBenedictionFromPrayerOfMending();
    const appliedRenew = this.tryProcLightsResurgenceRenewFromPrayerOfMending(target);

    let jumpedToTargetName = "";
    if (jumpsRemainingBeforeProc > 0) {
      const nextTarget = this.selectPrayerOfMendingJumpTarget(target.id);
      if (nextTarget && this.applyPrayerOfMendingToTarget(nextTarget, jumpsRemainingBeforeProc - 1)) {
        jumpedToTargetName = nextTarget.name;
      }
    }

    if (jumpedToTargetName) {
      this.pushLog(
        `회복의 기원 발동 ${target.name} ${fmtSigned(healResult.effective)}${appliedRenew ? " +소생" : ""} -> ${jumpedToTargetName} 점프`,
        "heal"
      );
      return;
    }

    this.pushLog(
      `회복의 기원 발동 ${target.name} ${fmtSigned(healResult.effective)}${appliedRenew ? " +소생" : ""}`,
      "heal"
    );
  }

  tickPrayerOfMendingAuras(dt) {
    for (const player of this.players) {
      if (player.prayerOfMendingRemainingMs <= 0) {
        continue;
      }
      player.prayerOfMendingRemainingMs = Math.max(0, player.prayerOfMendingRemainingMs - dt);
      if (player.prayerOfMendingRemainingMs <= 0) {
        this.clearPrayerOfMendingFromTarget(player);
      }
    }
  }

  tickRenewAuras(dt) {
    if (this.renewDurationMs <= 0 || this.renewTickMs <= 0) {
      for (const player of this.players) {
        this.clearRenewFromTarget(player);
      }
      return;
    }

    for (const player of this.players) {
      if (!player.alive || player.renewRemainingMs <= 0) {
        continue;
      }

      player.renewRemainingMs = Math.max(0, player.renewRemainingMs - dt);
      player.renewTickTimerMs -= dt;

      while (player.renewRemainingMs >= 0 && player.renewTickTimerMs <= 0) {
        const tickResult = this.applyHeal(player.id, getHealAmount("renew"), false, {
          spellKey: "renew",
          isDirectHeal: false,
          canCrit: false
        });
        if (Math.max(0, Number(tickResult?.effective ?? 0)) > 0) {
          this.pushLog(`소생 ${player.name} ${fmtSigned(tickResult.effective)}`, "heal");
        }
        player.renewTickTimerMs += this.renewTickMs;
      }

      if (player.renewRemainingMs <= 0) {
        this.clearRenewFromTarget(player);
      }
    }
  }

  applyResonantEnergyStackToTarget(target) {
    if (!target?.alive || !this.resonantEnergyTalentEnabled) {
      return false;
    }
    if (
      this.resonantEnergyHealingTakenPerStackRatio <= 0 ||
      this.resonantEnergyDurationMs <= 0 ||
      this.resonantEnergyMaxStacks <= 0
    ) {
      return false;
    }

    const previousStacks = Math.max(0, Math.floor(Number(target.resonantEnergyStacks ?? 0)));
    target.resonantEnergyStacks = Math.min(this.resonantEnergyMaxStacks, previousStacks + 1);
    target.resonantEnergyRemainingMs = this.resonantEnergyDurationMs;
    return true;
  }

  applyResonantEnergyStacksToTargets(targets = []) {
    if (!Array.isArray(targets) || !targets.length) {
      return 0;
    }

    let appliedCount = 0;
    for (const target of targets) {
      if (this.applyResonantEnergyStackToTarget(target)) {
        appliedCount += 1;
      }
    }
    return appliedCount;
  }

  scheduleResonantEnergyReturnEvent(targets = [], triggerAtMs = 0) {
    if (!this.resonantEnergyTalentEnabled || !Array.isArray(targets) || !targets.length) {
      return;
    }

    const uniqueTargetIds = Array.from(
      new Set(
        targets
          .map((target) => String(target?.id ?? "").trim())
          .filter(Boolean)
      )
    );
    if (!uniqueTargetIds.length) {
      return;
    }

    this.resonantEnergyScheduledEvents.push({
      triggerAtMs: Math.max(this.nowMs, Number(triggerAtMs) || 0),
      targetIds: uniqueTargetIds
    });
    this.resonantEnergyScheduledEvents.sort(
      (left, right) => Math.max(0, Number(left?.triggerAtMs) || 0) - Math.max(0, Number(right?.triggerAtMs) || 0)
    );
  }

  processResonantEnergyScheduledEvents() {
    if (!this.resonantEnergyTalentEnabled || !this.resonantEnergyScheduledEvents.length) {
      return;
    }

    let processedCount = 0;
    while (this.resonantEnergyScheduledEvents.length && processedCount < 40) {
      const nextEvent = this.resonantEnergyScheduledEvents[0];
      const triggerAtMs = Math.max(0, Number(nextEvent?.triggerAtMs) || 0);
      if (this.nowMs + 1e-6 < triggerAtMs) {
        break;
      }
      this.resonantEnergyScheduledEvents.shift();

      const targetIds = Array.isArray(nextEvent?.targetIds) ? nextEvent.targetIds : [];
      for (const targetId of targetIds) {
        const target = this.findPlayer(targetId);
        if (!target?.alive) {
          continue;
        }
        this.applyResonantEnergyStackToTarget(target);
      }
      processedCount += 1;
    }
  }

  tickResonantEnergyBuffs(dt) {
    if (!this.resonantEnergyTalentEnabled) {
      this.resonantEnergyScheduledEvents = [];
      for (const player of this.players) {
        this.clearResonantEnergyFromTarget(player);
      }
      return;
    }

    for (const player of this.players) {
      const remainingMs = Math.max(0, Number(player?.resonantEnergyRemainingMs ?? 0));
      const stacks = Math.max(0, Math.floor(Number(player?.resonantEnergyStacks ?? 0)));
      if (remainingMs <= 0 || stacks <= 0) {
        this.clearResonantEnergyFromTarget(player);
        continue;
      }

      player.resonantEnergyRemainingMs = Math.max(0, remainingMs - dt);
      if (player.resonantEnergyRemainingMs <= 0) {
        this.clearResonantEnergyFromTarget(player);
      }
    }
  }

  getHaloTargetScalingMultiplier(targetIndex) {
    const index = Math.max(0, Math.floor(Number(targetIndex) || 0));
    const fullEffectTargetCount = Math.max(1, this.haloFullEffectTargetCount);
    if (index < fullEffectTargetCount) {
      return 1;
    }
    return Math.sqrt(fullEffectTargetCount / Math.max(1, index + 1));
  }

  triggerHaloPulse(pulseNumber = 1, totalPulseCount = this.haloTotalPulseCount) {
    const pulseLabel = `후광 파동 ${pulseNumber}/${Math.max(1, totalPulseCount)}`;
    this.grantSurgeOfLightStack(pulseLabel);
    this.applySerenityCooldownReductionFromSpell("haloPulse");

    const orderedTargets = this.getAlivePlayers().sort(
      (left, right) => (left.maxHp > 0 ? left.hp / left.maxHp : 1) - (right.maxHp > 0 ? right.hp / right.maxHp : 1)
    );
    if (!orderedTargets.length) {
      this.pushLog(`${pulseLabel} (유효 대상 없음)`, "info");
      return;
    }

    let total = 0;
    let criticalCount = 0;
    for (let tickIndex = 0; tickIndex < this.haloTicksPerPulse; tickIndex += 1) {
      for (let targetIndex = 0; targetIndex < orderedTargets.length; targetIndex += 1) {
        const target = orderedTargets[targetIndex];
        if (!target?.alive) {
          continue;
        }
        const scaling = this.getHaloTargetScalingMultiplier(targetIndex);
        const result = this.applyHeal(target.id, getHealAmount("halo") * scaling, false, {
          spellKey: "halo",
          isDirectHeal: true
        });
        total += Math.max(0, Number(result?.effective ?? 0));
        if (result?.isCritical) {
          criticalCount += 1;
        }
      }
    }

    this.applyResonantEnergyStacksToTargets(orderedTargets);
    this.scheduleResonantEnergyReturnEvent(orderedTargets, this.nowMs + this.haloRepeatIntervalMs);

    this.pushLog(
      `${pulseLabel} ${orderedTargets.length}명 ${fmtSigned(total)}${criticalCount > 0 ? ` (치명 ${criticalCount})` : ""}`,
      "heal"
    );
    this.triggerDivineImageDazzlingLights(pulseLabel);
  }

  scheduleHaloFollowupPulses() {
    this.haloScheduledPulseEvents = [];
    const totalPulseCount = Math.max(1, this.haloTotalPulseCount);
    for (let pulseIndex = 1; pulseIndex < totalPulseCount; pulseIndex += 1) {
      this.haloScheduledPulseEvents.push({
        triggerAtMs: this.nowMs + this.haloRepeatIntervalMs * pulseIndex,
        pulseNumber: pulseIndex + 1
      });
    }
  }

  tickHaloScheduledPulses() {
    if (!this.haloScheduledPulseEvents.length) {
      return;
    }

    let processedCount = 0;
    while (this.haloScheduledPulseEvents.length && processedCount < 20) {
      const nextPulse = this.haloScheduledPulseEvents[0];
      const triggerAtMs = Math.max(0, Number(nextPulse?.triggerAtMs) || 0);
      if (this.nowMs + 1e-6 < triggerAtMs) {
        break;
      }
      this.haloScheduledPulseEvents.shift();
      this.triggerHaloPulse(
        Math.max(1, Math.floor(Number(nextPulse?.pulseNumber) || 1)),
        this.haloTotalPulseCount
      );
      processedCount += 1;
    }
  }

  getDivineHymnTargetScalingMultiplier(targetIndex) {
    const index = Math.max(0, Math.floor(Number(targetIndex) || 0));
    const fullEffectTargetCount = Math.max(1, this.divineHymnFullEffectTargetCount);
    if (index < fullEffectTargetCount) {
      return 1;
    }
    return Math.sqrt(fullEffectTargetCount / Math.max(1, index + 1));
  }

  getHealingTakenMultiplierForTarget(target) {
    if (!target?.alive) {
      return 1;
    }
    const divineHymnStacks = Math.max(0, Math.floor(Number(this.buffs.divineHymnHealingTakenStacks ?? 0)));
    const divineHymnRemainingMs = Math.max(0, Number(this.buffs.divineHymnHealingTakenMs ?? 0));
    const divineHymnBonusRatio =
      divineHymnStacks > 0 && divineHymnRemainingMs > 0
        ? divineHymnStacks * this.divineHymnHealingTakenStackRatio
        : 0;

    const resonantEnergyStacks = Math.max(0, Math.floor(Number(target.resonantEnergyStacks ?? 0)));
    const resonantEnergyRemainingMs = Math.max(0, Number(target.resonantEnergyRemainingMs ?? 0));
    const resonantEnergyBonusRatio =
      this.resonantEnergyTalentEnabled &&
        resonantEnergyStacks > 0 &&
        resonantEnergyRemainingMs > 0 &&
        this.resonantEnergyHealingTakenPerStackRatio > 0
        ? resonantEnergyStacks * this.resonantEnergyHealingTakenPerStackRatio
        : 0;

    if (divineHymnBonusRatio <= 0 && resonantEnergyBonusRatio <= 0) {
      return 1;
    }
    return 1 + divineHymnBonusRatio + resonantEnergyBonusRatio;
  }

  getHealingDoneMultiplierForSpell(spellKey = "") {
    const normalizedSpellKey = String(spellKey ?? "").trim();
    let multiplier = 1;

    if (this.hasApotheosisBuff() && normalizedSpellKey !== "echoOfLight") {
      multiplier *= 1 + this.apotheosisHealingDoneBonusRatio;
    }

    if (
      this.seasonOneTierTalentEnabled &&
      this.seasonOneTierDivineImageHealingBonusRatio > 0 &&
      DIVINE_IMAGE_HEALING_SPELL_KEY_SET.has(normalizedSpellKey)
    ) {
      multiplier *= 1 + this.seasonOneTierDivineImageHealingBonusRatio;
    }

    return multiplier;
  }

  getSpellCritChance(spellKey = "") {
    const normalizedSpellKey = String(spellKey ?? "").trim();
    let bonus = 0;

    if (this.upliftingWordsTalentEnabled && normalizedSpellKey === "serenity") {
      bonus += this.upliftingWordsSerenityCritChanceBonus;
    }

    if (this.crisisManagementTalentEnabled) {
      if (normalizedSpellKey === "flashHeal" || normalizedSpellKey === "benediction") {
        bonus += this.crisisManagementFlashHealCritChanceBonus;
      }
      if (normalizedSpellKey === "prayerOfHealing") {
        bonus += this.crisisManagementPrayerOfHealingCritChanceBonus;
      }
    }

    return clamp(this.baseCritChance + bonus, 0, 1);
  }

  gainDivineHymnHealingTakenStack() {
    if (this.divineHymnHealingTakenBuffDurationMs <= 0 || this.divineHymnHealingTakenStackRatio <= 0) {
      return;
    }
    const previousStacks = Math.max(0, Math.floor(Number(this.buffs.divineHymnHealingTakenStacks ?? 0)));
    this.buffs.divineHymnHealingTakenStacks = Math.min(this.divineHymnHealingTakenMaxStacks, previousStacks + 1);
    this.buffs.divineHymnHealingTakenMs = this.divineHymnHealingTakenBuffDurationMs;
  }

  tickDivineHymnHealingTakenBuff(dt) {
    const remainingMs = Math.max(0, Number(this.buffs.divineHymnHealingTakenMs ?? 0));
    if (remainingMs <= 0) {
      this.buffs.divineHymnHealingTakenMs = 0;
      this.buffs.divineHymnHealingTakenStacks = 0;
      return;
    }

    this.buffs.divineHymnHealingTakenMs = Math.max(0, remainingMs - dt);
    if (this.buffs.divineHymnHealingTakenMs <= 0) {
      this.buffs.divineHymnHealingTakenMs = 0;
      this.buffs.divineHymnHealingTakenStacks = 0;
    }
  }

  tickApotheosisBuff(dt) {
    this.buffs.apotheosisMs = Math.max(0, Number(this.buffs.apotheosisMs ?? 0) - dt);
  }

  tickFaithBuff(dt) {
    const remainingMs = Math.max(0, Number(this.buffs.faithMs ?? 0));
    if (remainingMs <= 0) {
      this.buffs.faithMs = 0;
      this.buffs.faithStacks = 0;
      return;
    }

    this.buffs.faithMs = Math.max(0, remainingMs - dt);
    if (this.buffs.faithMs <= 0) {
      this.buffs.faithMs = 0;
      this.buffs.faithStacks = 0;
    }
  }

  stopDivineHymnChannel() {
    this.divineHymnChannelMs = 0;
    this.divineHymnTickTimerMs = 0;
    this.divineHymnTickIntervalMs = 0;
    this.divineHymnTicksRemaining = 0;
    this.divineHymnTotalTicks = Math.max(1, this.divineHymnTickCount);
    this.divineHymnTicksProcessed = 0;
  }

  triggerDivineHymnTick(tickNumber = 1, totalTickCount = this.divineHymnTotalTicks) {
    const orderedTargets = this.getAlivePlayers().sort(
      (left, right) => (left.maxHp > 0 ? left.hp / left.maxHp : 1) - (right.maxHp > 0 ? right.hp / right.maxHp : 1)
    );
    if (!orderedTargets.length) {
      this.pushLog(`천상의 찬가 틱 ${tickNumber}/${Math.max(1, totalTickCount)} (유효 대상 없음)`, "info");
      return;
    }

    let total = 0;
    let criticalCount = 0;
    for (let targetIndex = 0; targetIndex < orderedTargets.length; targetIndex += 1) {
      const target = orderedTargets[targetIndex];
      if (!target?.alive) {
        continue;
      }

      const scaling = this.getDivineHymnTargetScalingMultiplier(targetIndex);
      const result = this.applyHeal(target.id, getHealAmount("divineHymn") * scaling, false, {
        spellKey: "divineHymn",
        isDirectHeal: true
      });
      total += Math.max(0, Number(result?.effective ?? 0));
      if (result?.isCritical) {
        criticalCount += 1;
      }
    }

    this.gainDivineHymnHealingTakenStack();
    this.triggerCosmicRipple(this.cosmicRippleFromDivineHymnTickHealMultiplier, {
      sourceLabel: "천상의 찬가"
    });
    const activeStacks = Math.max(0, Math.floor(Number(this.buffs.divineHymnHealingTakenStacks ?? 0)));
    const healingTakenPct = Math.round(activeStacks * this.divineHymnHealingTakenStackRatio * 100);
    this.pushLog(
      `천상의 찬가 틱 ${tickNumber}/${Math.max(1, totalTickCount)} ${orderedTargets.length}명 ${fmtSigned(total)}${criticalCount > 0 ? ` (치명 ${criticalCount})` : ""}, 치유증가 ${healingTakenPct}%`,
      "heal"
    );
    this.triggerDivineImageDazzlingLights(`천상의 찬가 틱 ${tickNumber}/${Math.max(1, totalTickCount)}`);
  }

  startDivineHymnChannel(durationMs = 0) {
    const channelMs = Math.max(0, Number(durationMs) || 0);
    if (channelMs <= 0) {
      this.stopDivineHymnChannel();
      return;
    }

    const totalTickCount = Math.max(1, this.divineHymnTickCount);
    const tickIntervalMs = totalTickCount > 1 ? channelMs / (totalTickCount - 1) : channelMs;

    this.divineHymnChannelMs = channelMs;
    this.divineHymnTickIntervalMs = Math.max(1, tickIntervalMs);
    this.divineHymnTicksRemaining = Math.max(0, totalTickCount - 1);
    this.divineHymnTickTimerMs = this.divineHymnTickIntervalMs;
    this.divineHymnTotalTicks = totalTickCount;
    this.divineHymnTicksProcessed = 1;

    this.pushLog("천상의 찬가 채널 시작", "buff");
    this.triggerDivineHymnTick(1, totalTickCount);
  }

  tickDivineHymnChannel(dt) {
    const hasRemainingChannelMs = this.divineHymnChannelMs > 0;
    const hasRemainingTicks = this.divineHymnTicksRemaining > 0;
    if (!hasRemainingChannelMs && !hasRemainingTicks) {
      this.stopDivineHymnChannel();
      return;
    }

    this.divineHymnChannelMs = Math.max(0, this.divineHymnChannelMs - dt);
    if (!hasRemainingTicks) {
      return;
    }

    this.divineHymnTickTimerMs -= dt;
    while (this.divineHymnTicksRemaining > 0 && this.divineHymnTickTimerMs <= 1e-6) {
      this.divineHymnTicksProcessed += 1;
      this.triggerDivineHymnTick(this.divineHymnTicksProcessed, this.divineHymnTotalTicks);
      this.divineHymnTicksRemaining -= 1;
      this.divineHymnTickTimerMs += this.divineHymnTickIntervalMs;
    }

    if (this.divineHymnTicksRemaining <= 0) {
      this.divineHymnTickTimerMs = 0;
    }
  }

  applyEchoOfLightProc(target, sourceEffectiveHealAmount) {
    if (!target || !target.alive) {
      return;
    }
    const sourceEffective = Math.max(0, Number(sourceEffectiveHealAmount) || 0);
    if (sourceEffective <= 0 || this.echoOfLightMasteryRatio <= 0) {
      return;
    }

    const addedPool = sourceEffective * this.echoOfLightMasteryRatio;
    if (addedPool <= 0) {
      return;
    }

    const wasActive = target.echoOfLightRemainingMs > 0 && target.echoOfLightPoolRemaining > 0;
    target.echoOfLightPoolRemaining = Math.max(0, Number(target.echoOfLightPoolRemaining || 0)) + addedPool;
    const ticksFromNow = wasActive ? 3 : 2;
    const nextDurationMs = wasActive ? ECHO_OF_LIGHT_REFRESH_DURATION_MS : ECHO_OF_LIGHT_BASE_DURATION_MS;
    target.echoOfLightRemainingMs = nextDurationMs;
    target.echoOfLightTickTimerMs = ECHO_OF_LIGHT_TICK_MS;
    target.echoOfLightTickAmount = target.echoOfLightPoolRemaining / Math.max(1, ticksFromNow);
  }

  tickEchoOfLight(dt) {
    for (const player of this.players) {
      if (!player.alive || player.echoOfLightRemainingMs <= 0 || player.echoOfLightPoolRemaining <= 0) {
        this.clearEchoOfLightFromTarget(player);
        continue;
      }

      player.echoOfLightRemainingMs = Math.max(0, player.echoOfLightRemainingMs - dt);
      player.echoOfLightTickTimerMs -= dt;

      while (player.echoOfLightPoolRemaining > 0 && player.echoOfLightTickTimerMs <= 0 && player.echoOfLightRemainingMs >= 0) {
        const tickHealAmount = Math.max(
          0,
          Math.min(player.echoOfLightPoolRemaining, Number(player.echoOfLightTickAmount || 0))
        );
        if (tickHealAmount <= 0) {
          break;
        }

        const result = this.applyHeal(player.id, tickHealAmount, false, {
          spellKey: "echoOfLight",
          canCrit: false,
          suppressLeech: true,
          rawAmount: true,
          procEcho: false,
          ignoreHealingDoneModifiers: true,
          ignoreHealingTakenModifiers: true
        });
        const consumedAmount = Math.max(
          0,
          Number(result?.effective ?? 0) + Number(result?.overheal ?? 0)
        );
        player.echoOfLightPoolRemaining = Math.max(0, player.echoOfLightPoolRemaining - consumedAmount);
        player.echoOfLightTickTimerMs += ECHO_OF_LIGHT_TICK_MS;
      }

      if (player.echoOfLightPoolRemaining <= 0 || player.echoOfLightRemainingMs <= 0) {
        this.clearEchoOfLightFromTarget(player);
      }
    }
  }

  triggerCosmicRipple(healMultiplier = 1, options = {}) {
    const multiplier = Math.max(0, Number(healMultiplier) || 0);
    if (multiplier <= 0) {
      return { targetCount: 0, total: 0, criticalCount: 0 };
    }

    const targets = this.getMostInjuredAlivePlayers(this.cosmicRippleTargetCount, false);
    const sourceLabel = String(options.sourceLabel ?? "").trim();
    const sourcePrefix = sourceLabel ? `${sourceLabel}: ` : "";
    if (!targets.length) {
      this.pushLog(`${sourcePrefix}우주의 파장 발동 (유효 대상 없음)`, "info");
      return { targetCount: 0, total: 0, criticalCount: 0 };
    }

    let total = 0;
    let criticalCount = 0;
    const healAmount = getHealAmount("cosmicRipple") * multiplier;
    for (const target of targets) {
      const result = this.applyHeal(target.id, healAmount, false, {
        spellKey: "cosmicRipple",
        isDirectHeal: true
      });
      total += Math.max(0, Number(result?.effective ?? 0));
      if (result?.isCritical) {
        criticalCount += 1;
      }
    }
    this.pushLog(
      `${sourcePrefix}우주의 파장 발동 ${targets.length}명 ${fmtSigned(total)}${criticalCount > 0 ? ` (치명 ${criticalCount})` : ""}`,
      "heal"
    );
    return {
      targetCount: targets.length,
      total: round(total, 2),
      criticalCount
    };
  }

  triggerUltimateSerenity(primaryTargetId) {
    if (!this.ultimateSerenityTalentEnabled) {
      return { targetCount: 0, total: 0, criticalCount: 0 };
    }
    if (this.ultimateSerenityAdditionalTargetCount <= 0 || this.ultimateSerenityHealRatio <= 0) {
      return { targetCount: 0, total: 0, criticalCount: 0 };
    }

    const requestedTargetCount = this.ultimateSerenityAdditionalTargetCount + 1;
    const additionalTargets = this.getMostInjuredAlivePlayers(requestedTargetCount, true)
      .filter((candidate) => candidate.id !== primaryTargetId)
      .slice(0, this.ultimateSerenityAdditionalTargetCount);
    if (!additionalTargets.length) {
      return { targetCount: 0, total: 0, criticalCount: 0 };
    }

    const perTargetHealAmount = getHealAmount("serenity") * this.ultimateSerenityHealRatio;
    let total = 0;
    let criticalCount = 0;
    for (const target of additionalTargets) {
      const result = this.applyHeal(target.id, perTargetHealAmount, false, {
        spellKey: "ultimateSerenity",
        isDirectHeal: true
      });
      total += Math.max(0, Number(result?.effective ?? 0));
      if (result?.isCritical) {
        criticalCount += 1;
      }
    }

    return {
      targetCount: additionalTargets.length,
      total: round(total, 2),
      criticalCount
    };
  }

  setSelfMaxHpBonusState(active) {
    const selfPlayer = this.findPlayer(this.selfPlayerId);
    if (!selfPlayer) {
      return;
    }

    const bonusRatio = Math.max(0, this.desperatePrayerSelfMaxHpBonusRatio);
    const oldMaxHp = Math.max(1, Number(selfPlayer.maxHp) || Number(selfPlayer.baseMaxHp) || 1);
    const newMaxHp = Math.max(
      1,
      (Number(selfPlayer.baseMaxHp) || this.baseHealth) * (active ? 1 + bonusRatio : 1)
    );
    const hpRatio = clamp((Number(selfPlayer.hp) || 0) / oldMaxHp, 0, 1);

    selfPlayer.maxHp = round(newMaxHp, 2);
    selfPlayer.hp = round(clamp(newMaxHp * hpRatio, 0, newMaxHp), 2);
  }

  activateDesperatePrayerSelfMaxHpBonus() {
    if (this.desperatePrayerSelfMaxHpBonusDurationMs <= 0 || this.desperatePrayerSelfMaxHpBonusRatio <= 0) {
      return;
    }
    const wasActive = this.buffs.desperatePrayerSelfMaxHpMs > 0;
    this.buffs.desperatePrayerSelfMaxHpMs = this.desperatePrayerSelfMaxHpBonusDurationMs;
    if (!wasActive) {
      this.setSelfMaxHpBonusState(true);
    }
  }

  tickDesperatePrayerSelfMaxHpBonus(dt) {
    const wasActive = this.buffs.desperatePrayerSelfMaxHpMs > 0;
    this.buffs.desperatePrayerSelfMaxHpMs = Math.max(0, this.buffs.desperatePrayerSelfMaxHpMs - dt);
    if (wasActive && this.buffs.desperatePrayerSelfMaxHpMs <= 0) {
      this.setSelfMaxHpBonusState(false);
    }
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
      this.clearPrayerOfMendingFromTarget(player);
      this.clearEchoOfLightFromTarget(player);
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

    const spell = HOLY_PRIEST_PRACTICE_SPELLS[action.spellKey];
    if (!spell || !spell.active) {
      return false;
    }
    if (spell.key === "halo" && !this.haloTalentEnabled) {
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

  isUnwaveringWillCastTimeReductionActive() {
    if (this.unwaveringWillCastTimeReductionRatio <= 0) {
      return false;
    }
    const selfPlayer = this.findPlayer(this.selfPlayerId);
    if (!selfPlayer?.alive || selfPlayer.maxHp <= 0) {
      return false;
    }
    const hpRatio = clamp(selfPlayer.hp / selfPlayer.maxHp, 0, 1);
    return hpRatio > this.unwaveringWillHealthThresholdRatio;
  }

  getResolvedSpellManaCost(spell) {
    const baseCost = Math.max(0, Number(spell?.manaCost) || 0);
    const serenityCostAdjusted = spell?.key === "serenity" && this.hasApotheosisBuff()
      ? baseCost * this.apotheosisSerenityManaCostMultiplier
      : baseCost;
    const resolvedBaseCost = Math.max(0, serenityCostAdjusted) * this.manaTuningScale;
    if (this.isSurgeOfLightEmpoweredCast(spell?.key)) {
      return round(resolvedBaseCost * this.surgeOfLightManaCostMultiplier, 2);
    }
    return round(resolvedBaseCost, 2);
  }

  resolveCastValidation(spell, targetId) {
    if (!spell || !spell.active) {
      return { ok: false, reason: "invalid-spell", target: null, manaCost: 0 };
    }
    if (spell.key === "halo" && !this.haloTalentEnabled) {
      return { ok: false, reason: "invalid-spell", target: null, manaCost: 0 };
    }

    let target = null;
    if (spell.requiresTarget) {
      target = this.findPlayer(targetId);
      if (!target || !target.alive) {
        return { ok: false, reason: "invalid-target", target: null, manaCost: 0 };
      }
    }

    const manaCost = this.getResolvedSpellManaCost(spell);
    if (manaCost > this.mana + 1e-6) {
      return { ok: false, reason: "no-mana", target, manaCost };
    }

    if (spell.key === "serenity") {
      if (this.getSerenityCharges() <= 0) {
        return { ok: false, reason: "cooldown", target, manaCost };
      }
      return { ok: true, reason: "", target, manaCost };
    }

    if ((this.cooldowns[spell.key] ?? 0) > 0) {
      return { ok: false, reason: "cooldown", target, manaCost };
    }

    return { ok: true, reason: "", target, manaCost };
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
    for (const spellKey of HOLY_PRIEST_ACTIVE_SPELL_KEYS) {
      if (spellKey === "serenity") {
        continue;
      }
      this.cooldowns[spellKey] = Math.max(0, this.cooldowns[spellKey] - dt);
    }
    this.tickSerenityRecharge(dt);
    this.updateSerenityCooldownSnapshot();

    this.buffs.fadeMs = Math.max(0, this.buffs.fadeMs - dt);
    this.tickProtectiveLightBuff(dt);
    this.tickDivineImageBuff(dt);
    this.tickApotheosisBuff(dt);
    this.tickFaithBuff(dt);
    this.tickBenedictionBuff(dt);
    this.tickLightweaverBuff(dt);
    this.tickDesperatePrayerSelfMaxHpBonus(dt);
    this.tickDivineHymnHealingTakenBuff(dt);
    this.tickSurgeOfLightBuff(dt);
    this.tickResonantEnergyBuffs(dt);

    this.tickAutoManaRegen(dt);
    this.tickEchoOfLight(dt);
    this.tickPrayerOfMendingAuras(dt);
    this.tickRenewAuras(dt);
    this.processResonantEnergyScheduledEvents();
    this.tickHaloScheduledPulses();
    this.processDamageEvents();

    if (runtimeState.isPlayerMoving) {
      this.interruptCurrentCastByMovement();
    }

    this.tickDivineHymnChannel(dt);
    this.processOffGcdActionQueue();
    this.advanceCurrentCast(dt);
    this.processActionQueue();
    this.accumulateRaidHealthSample(dt);

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
      surgeOfLightConsumed: Boolean(completedCast.surgeOfLightConsumed),
      faithEmpoweredPrayerOfHealing: Boolean(completedCast.faithEmpoweredPrayerOfHealing),
      lightweaverEmpoweredPrayerOfHealing: Boolean(completedCast.lightweaverEmpoweredPrayerOfHealing),
      benedictionEmpoweredFlashHeal: Boolean(completedCast.benedictionEmpoweredFlashHeal),
      benedictionBuffedFlashHeal: Boolean(completedCast.benedictionBuffedFlashHeal)
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
      const spell = HOLY_PRIEST_PRACTICE_SPELLS[action.spellKey];
      if (!spell || !spell.active || spell.triggersGlobalCooldown !== false) {
        this.offGcdActionQueue.shift();
        continue;
      }

      const validation = this.resolveCastValidation(spell, action.targetId);
      if (!validation.ok) {
        this.offGcdActionQueue.shift();
        if (validation.reason === "invalid-target") {
          this.pushLog(`${spell.name} 실패: 유효한 대상이 없음`, "warn");
        } else if (validation.reason === "no-mana") {
          this.pushLog(`${spell.name} 실패: 마나 부족`, "warn");
        } else if (validation.reason === "cooldown") {
          const cooldownMs = spell.key === "serenity"
            ? this.getSerenityNextRechargeRemainingMs()
            : this.cooldowns[spell.key] ?? 0;
          const cooldownSec = round(cooldownMs / 1000, 1);
          this.pushLog(`${spell.name} 실패: 재사용 대기 ${cooldownSec}s`, "warn");
        }
        continue;
      }

      this.offGcdActionQueue.shift();
      this.startCast(spell, action.targetId ?? null, { manaCost: validation.manaCost });
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
      const spell = HOLY_PRIEST_PRACTICE_SPELLS[action.spellKey];
      if (!spell || !spell.active) {
        this.actionQueue.shift();
        continue;
      }

      const validation = this.resolveCastValidation(spell, action.targetId);
      if (!validation.ok) {
        this.actionQueue.shift();
        if (validation.reason === "invalid-target") {
          this.pushLog(`${spell.name} 실패: 유효한 대상이 없음`, "warn");
        } else if (validation.reason === "no-mana") {
          this.pushLog(`${spell.name} 실패: 마나 부족`, "warn");
        } else if (validation.reason === "cooldown") {
          const cooldownMs = spell.key === "serenity"
            ? this.getSerenityNextRechargeRemainingMs()
            : this.cooldowns[spell.key] ?? 0;
          const cooldownSec = round(cooldownMs / 1000, 1);
          this.pushLog(`${spell.name} 실패: 재사용 대기 ${cooldownSec}s`, "warn");
        }
        continue;
      }

      if (this.gcdRemainingMs > 0) {
        return;
      }

      this.actionQueue.shift();
      this.startCast(spell, action.targetId ?? null, { manaCost: validation.manaCost });
      return;
    }
  }

  startCast(spell, targetId, options = {}) {
    if (spell.key === "serenity") {
      if (!this.consumeSerenityCharge()) {
        this.pushLog(`${spell.name} 실패: 충전 없음`, "warn");
        return;
      }
      this.updateSerenityCooldownSnapshot();
    } else if (spell.cooldownMs > 0) {
      this.cooldowns[spell.key] = spell.cooldownMs;
    }

    const manaCost = Math.max(0, Number(options.manaCost ?? this.getResolvedSpellManaCost(spell)) || 0);
    if (manaCost > 0) {
      this.mana = round(Math.max(0, this.mana - manaCost), 2);
      this.metrics.manaSpent = round(this.metrics.manaSpent + manaCost, 2);
    }

    if (spell.triggersGlobalCooldown !== false) {
      this.gcdRemainingMs = this.getGlobalCooldownMs();
    }

    const faithEmpoweredPrayerOfHealing =
      spell.key === "prayerOfHealing" && this.consumeFaithPrayerOfHealingStack();
    if (faithEmpoweredPrayerOfHealing) {
      this.pushLog(`신앙 소모 (${this.buffs.faithStacks}/${this.faithMaxStacks})`, "buff");
    }

    const surgeOfLightEmpoweredCast = this.isSurgeOfLightEmpoweredCast(spell.key);
    const surgeOfLightConsumed = surgeOfLightEmpoweredCast && this.consumeSurgeOfLightStack();
    const lightweaverEmpoweredPrayerOfHealing =
      spell.key === "prayerOfHealing" && this.hasLightweaverBuff();
    const benedictionBuffedFlashHeal = spell.key === "flashHeal" && this.hasBenedictionBuff();
    const benedictionEmpoweredFlashHeal = spell.key === "flashHeal" && this.isBenedictionEmpoweredFlashHeal();

    let castTimeMs = surgeOfLightEmpoweredCast ? 0 : spell.castTimeMs;
    if (faithEmpoweredPrayerOfHealing) {
      castTimeMs = 0;
    } else if (lightweaverEmpoweredPrayerOfHealing && castTimeMs > 0) {
      castTimeMs *= 1 - this.lightweaverPrayerOfHealingCastTimeReductionRatio;
    }
    if (castTimeMs > 0 && spell.castTimeAffectedByHaste) {
      castTimeMs = this.getHasteAdjustedDurationMs(castTimeMs, 250);
    }
    if (
      castTimeMs > 0 &&
      UNWAVERING_WILL_AFFECTED_SPELL_KEY_SET.has(spell.key) &&
      this.isUnwaveringWillCastTimeReductionActive()
    ) {
      castTimeMs = Math.max(1, castTimeMs * (1 - this.unwaveringWillCastTimeReductionRatio));
    }

    if (surgeOfLightConsumed) {
      this.pushLog(
        `빛의 쇄도 소모 (${this.buffs.surgeOfLightStacks}/${this.surgeOfLightMaxStacks})`,
        "buff"
      );
    }

    if (castTimeMs > 0 && spell.key === "divineHymn") {
      this.startDivineHymnChannel(castTimeMs);
    }

    if (castTimeMs > 0) {
      const castSpellName = benedictionEmpoweredFlashHeal ? "축도" : spell.name;
      this.currentCast = {
        castId: ++this.castSequence,
        spellKey: spell.key,
        spellName: castSpellName,
        spellIconKey: benedictionEmpoweredFlashHeal ? "benediction" : spell.key,
        targetId,
        remainingMs: castTimeMs,
        castTimeMs,
        startedAtMs: this.nowMs,
        spentManaCost: manaCost,
        surgeOfLightConsumed,
        faithEmpoweredPrayerOfHealing,
        lightweaverEmpoweredPrayerOfHealing,
        benedictionEmpoweredFlashHeal,
        benedictionBuffedFlashHeal
      };
      this.pushLog(`${castSpellName} 시전 시작`, "info");
      return;
    }

    this.resolveSpellCast(spell.key, targetId, {
      surgeOfLightConsumed,
      faithEmpoweredPrayerOfHealing,
      lightweaverEmpoweredPrayerOfHealing,
      benedictionEmpoweredFlashHeal,
      benedictionBuffedFlashHeal
    });
  }

  interruptCurrentCastByMovement() {
    if (!this.currentCast) {
      return false;
    }

    const spell = HOLY_PRIEST_PRACTICE_SPELLS[this.currentCast.spellKey];
    if (spell?.canMoveWhileCasting) {
      return false;
    }

    const spellName = this.currentCast.spellName || spell?.name || "시전";
    const refundedManaCost = Math.max(0, Number(this.currentCast.spentManaCost) || 0);
    if (refundedManaCost > 0) {
      this.mana = round(Math.min(this.maxMana, this.mana + refundedManaCost), 2);
      this.metrics.manaSpent = round(Math.max(0, this.metrics.manaSpent - refundedManaCost), 2);
    }

    if (this.currentCast.spellKey === "serenity") {
      this.serenityRechargeTimersMs = this.serenityRechargeTimersMs.slice(0, -1);
      this.updateSerenityCooldownSnapshot();
    } else if (this.currentCast.spellKey === "divineHymn") {
      this.stopDivineHymnChannel();
    } else if (spell?.cooldownMs > 0) {
      this.cooldowns[this.currentCast.spellKey] = 0;
    }

    // Casting was canceled, so reset the GCD lockout immediately.
    this.gcdRemainingMs = 0;
    this.currentCast = null;
    this.pushLog(`${spellName} 시전 취소: 이동`, "warn");
    return true;
  }

  resolveSpellCast(spellKey, targetId, options = {}) {
    const spell = HOLY_PRIEST_PRACTICE_SPELLS[spellKey];
    if (!spell) {
      return;
    }

    const surgeOfLightConsumed = options.surgeOfLightConsumed === true;
    const faithEmpoweredPrayerOfHealing = options.faithEmpoweredPrayerOfHealing === true;
    const lightweaverEmpoweredPrayerOfHealing = options.lightweaverEmpoweredPrayerOfHealing === true;
    const benedictionEmpoweredFlashHeal = options.benedictionEmpoweredFlashHeal === true;
    const benedictionBuffedFlashHeal = options.benedictionBuffedFlashHeal === true;

    const castMetricKey =
      spellKey === "flashHeal" && benedictionEmpoweredFlashHeal
        ? "benediction"
        : spellKey;
    this.metrics.casts[castMetricKey] =
      Math.max(0, Number(this.metrics.casts[castMetricKey] ?? 0)) + 1;
    if (surgeOfLightConsumed && SURGE_OF_LIGHT_EMPOWERED_SPELL_KEY_SET.has(spellKey)) {
      this.metrics.surgeOfLightConsumedTotal =
        Math.max(0, Number(this.metrics.surgeOfLightConsumedTotal ?? 0)) + 1;
      if (spellKey === "flashHeal") {
        this.metrics.surgeOfLightConsumedFlashHealCasts =
          Math.max(0, Number(this.metrics.surgeOfLightConsumedFlashHealCasts ?? 0)) + 1;
      } else if (spellKey === "prayerOfHealing") {
        this.metrics.surgeOfLightConsumedPrayerOfHealingCasts =
          Math.max(0, Number(this.metrics.surgeOfLightConsumedPrayerOfHealingCasts ?? 0)) + 1;
      }
    }
    this.tryProcSurgeOfLight(spellKey);

    switch (spellKey) {
      case "flashHeal": {
        const target = this.findPlayer(targetId);
        if (!target || !target.alive) {
          this.pushLog(`${spell.name} 실패: 대상 사망`, "warn");
          return;
        }
        if (benedictionEmpoweredFlashHeal) {
          this.tryProcDivineImageFromSeasonOneTierBenediction();
        }
        const flashHealMultiplier = benedictionEmpoweredFlashHeal
          ? 1 + this.benedictionFlashHealHealBonusRatio
          : 1;
        const result = this.applyHeal(target.id, getHealAmount("flashHeal") * flashHealMultiplier, false, {
          spellKey: benedictionEmpoweredFlashHeal ? "benediction" : "flashHeal",
          isDirectHeal: true
        });
        if (benedictionBuffedFlashHeal && this.consumeBenedictionBuff()) {
          this.pushLog("축도 소모", "buff");
        }
        const castLabel = benedictionEmpoweredFlashHeal ? "축도" : spell.name;
        this.pushLog(
          `${castLabel} ${target.name} ${fmtSigned(result.effective)}${result.isCritical ? " (치명타)" : ""}`,
          "heal"
        );
        this.triggerTrailOfLightAfterFlashHeal(target, result, castLabel);
        this.triggerDispersingLightAfterFlashHeal(target, result, castLabel);
        const selfPlayerId = String(this.selfPlayerId ?? "").trim();
        if (selfPlayerId && target.id === selfPlayerId) {
          this.grantProtectiveLight(castLabel);
        }
        this.triggerDivineImageHealingLight(castLabel);
        if (
          selfPlayerId &&
          target.id !== selfPlayerId &&
          this.bindingHealFlashHealSelfHealRatio > 0 &&
          Number(result?.effective ?? 0) > 0
        ) {
          const bindingHealResult = this.applyHeal(
            selfPlayerId,
            Math.max(0, Number(result.effective ?? 0)) * this.bindingHealFlashHealSelfHealRatio,
            false,
            {
              spellKey: "bindingHeal",
              canCrit: false,
              rawAmount: true,
              isDirectHeal: true
            }
          );
          if (Math.max(0, Number(bindingHealResult?.effective ?? 0)) > 0) {
            this.pushLog(`결속의 치유 ${fmtSigned(bindingHealResult.effective)}`, "heal");
          }
        }
        if (benedictionEmpoweredFlashHeal) {
          this.triggerCosmicRipple(1, { sourceLabel: "축도" });
        }
        this.grantLightweaverStack(spell.name);
        this.applySerenityCooldownReductionFromSpell("flashHeal", { surgeOfLightConsumed });
        return;
      }
      case "prayerOfHealing": {
        const primaryTarget = this.findPlayer(targetId);
        if (!primaryTarget || !primaryTarget.alive) {
          this.pushLog(`${spell.name} 실패: 대상 사망`, "warn");
          return;
        }
        const secondaryTargetCount = Math.max(0, this.prayerOfHealingTargetCount - 1);
        const secondaryTargets = this.getMostInjuredAlivePlayers(this.prayerOfHealingTargetCount, true)
          .filter((candidate) => candidate.id !== primaryTarget.id)
          .slice(0, secondaryTargetCount);
        const targets = [primaryTarget, ...secondaryTargets];
        if (!targets.length) {
          this.pushLog(`${spell.name} 사용 (유효 대상 없음)`, "info");
          return;
        }
        if (!surgeOfLightConsumed && !lightweaverEmpoweredPrayerOfHealing) {
          this.metrics.rawPrayerOfHealingCasts = Math.max(
            0,
            Math.round(Number(this.metrics.rawPrayerOfHealingCasts ?? 0)) + 1
          );
        }
        let total = 0;
        let criticalCount = 0;
        const faithHealMultiplier = faithEmpoweredPrayerOfHealing
          ? 1 + this.faithPrayerOfHealingBonusRatio
          : 1;
        const lightweaverHealMultiplier = lightweaverEmpoweredPrayerOfHealing
          ? 1 + this.lightweaverPrayerOfHealingHealBonusRatio
          : 1;
        const finalHealMultiplier = faithHealMultiplier * lightweaverHealMultiplier;
        for (const target of targets) {
          const primaryTargetMultiplier = target.id === primaryTarget.id
            ? this.prayerOfHealingPrimaryTargetHealMultiplier
            : 1;
          const result = this.applyHeal(
            target.id,
            getHealAmount("prayerOfHealing") * finalHealMultiplier * primaryTargetMultiplier,
            false,
            {
              spellKey: "prayerOfHealing",
              isDirectHeal: true
            }
          );
          total += Math.max(0, Number(result?.effective ?? 0));
          if (result?.isCritical) {
            criticalCount += 1;
          }
        }
        if (lightweaverEmpoweredPrayerOfHealing && this.consumeLightweaverStack()) {
          this.pushLog(`빛술사 소모 (${this.buffs.lightweaverStacks}/${this.lightweaverMaxStacks})`, "buff");
        }
        this.pushLog(
          `${spell.name}${faithEmpoweredPrayerOfHealing ? " (신앙)" : ""}${lightweaverEmpoweredPrayerOfHealing ? " (빛술사)" : ""} ${targets.length}명 ${fmtSigned(total)}${criticalCount > 0 ? ` (치명 ${criticalCount})` : ""}`,
          "heal"
        );
        this.triggerDivineImageDazzlingLights(spell.name);
        this.applySerenityCooldownReductionFromSpell("prayerOfHealing", { surgeOfLightConsumed });
        return;
      }
      case "serenity": {
        const target = this.findPlayer(targetId);
        if (!target || !target.alive) {
          this.pushLog(`${spell.name} 실패: 대상 사망`, "warn");
          return;
        }
        const result = this.applyHeal(target.id, getHealAmount("serenity"), false, {
          spellKey: "serenity",
          isDirectHeal: true
        });
        this.pushLog(
          `${spell.name} ${target.name} ${fmtSigned(result.effective)}${result.isCritical ? " (치명타)" : ""}`,
          "heal"
        );
        this.gainDivineImageStack(spell.name);
        this.triggerDivineImageHealingLight(spell.name);
        const ultimateSerenityResult = this.triggerUltimateSerenity(target.id);
        if (ultimateSerenityResult.targetCount > 0) {
          this.pushLog(
            `궁극의 평온 ${ultimateSerenityResult.targetCount}명 ${fmtSigned(ultimateSerenityResult.total)}${ultimateSerenityResult.criticalCount > 0 ? ` (치명 ${ultimateSerenityResult.criticalCount})` : ""}`,
            "heal"
          );
          this.triggerDivineImageHealingLight("궁극의 평온");
        }
        return;
      }
      case "prayerOfMending": {
        const target = this.findPlayer(targetId);
        if (!target || !target.alive) {
          this.pushLog(`${spell.name} 실패: 대상 사망`, "warn");
          return;
        }
        this.clearAllPrayerOfMendingBuffs();
        this.applyPrayerOfMendingToTarget(target, this.prayerOfMendingMaxJumps);
        this.pushLog(`${spell.name} ${target.name} 적용`, "buff");
        this.applySerenityCooldownReductionFromSpell("prayerOfMending");
        this.triggerDivineImageBlessedLight(spell.name);
        return;
      }
      case "halo": {
        this.triggerHaloPulse(1, this.haloTotalPulseCount);
        this.scheduleHaloFollowupPulses();
        return;
      }
      case "fade": {
        this.buffs.fadeMs = FADE_DURATION_MS;
        this.pushLog(`${spell.name} 발동 (받는 피해 감소)`, "buff");
        return;
      }
      case "apotheosis": {
        this.activateApotheosis();
        return;
      }
      case "desperatePrayer": {
        const selfPlayer = this.findPlayer(this.selfPlayerId);
        if (!selfPlayer || !selfPlayer.alive) {
          this.pushLog(`${spell.name} 실패: 본인 상태 확인 필요`, "warn");
          return;
        }

        const healAmount = Math.max(0, selfPlayer.maxHp * this.desperatePrayerInstantHealRatioOfMaxHp);
        const result = this.applyHeal(selfPlayer.id, healAmount, false, {
          spellKey: "desperatePrayer",
          isDirectHeal: true,
          canCrit: false,
          rawAmount: true,
          ignoreHealingDoneModifiers: true,
          ignoreHealingTakenModifiers: true
        });
        this.activateDesperatePrayerSelfMaxHpBonus();
        this.pushLog(
          `${spell.name} ${selfPlayer.name} ${Math.round(this.desperatePrayerInstantHealRatioOfMaxHp * 100)}% 치유 ${fmtSigned(result.effective)}, 본인 최대체력 +${Math.round(this.desperatePrayerSelfMaxHpBonusRatio * 100)}%`,
          "heal"
        );
        this.triggerDivineImageHealingLight(spell.name);
        return;
      }
      case "divineHymn": {
        this.stopDivineHymnChannel();
        this.pushLog(`${spell.name} 채널 종료`, "buff");
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
    const critChance = canCrit ? this.getSpellCritChance(spellKey) : 0;
    const critMultiplier = canCrit ? this.defaultCritHealMultiplier : 1;
    const isCritical = canCrit && critChance > 0 && this.rng() < critChance;
    const isRawAmount = options.rawAmount === true;
    const healingDoneMultiplier = options.ignoreHealingDoneModifiers === true
      ? 1
      : this.getHealingDoneMultiplierForSpell(spellKey);
    const healingTakenMultiplier = options.ignoreHealingTakenModifiers === true
      ? 1
      : this.getHealingTakenMultiplierForTarget(target);

    const baseHealAmount = isRawAmount ? baseAmount : baseAmount * this.intellect;
    const amount = baseHealAmount * (isCritical ? critMultiplier : 1) * healingDoneMultiplier * healingTakenMultiplier;
    const missing = target.maxHp - target.hp;
    const effective = Math.min(amount, Math.max(0, missing));
    const overheal = Math.max(0, amount - effective);
    const hpRatioBeforeHeal = target.maxHp > 0 ? target.hp / target.maxHp : 1;

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

    const isDirectHeal = options.isDirectHeal === true;
    const canProcEcho =
      options.procEcho !== false &&
      isDirectHeal &&
      effective > 0 &&
      spellKey !== "echoOfLight" &&
      spellKey !== "leech";
    if (canProcEcho) {
      this.applyEchoOfLightProc(target, effective);
    }

    const shouldApplyLeech = !options.suppressLeech && this.leechHealingRatio > 0 && effective > 0 && this.selfPlayerId;
    if (shouldApplyLeech) {
      this.applyHeal(this.selfPlayerId, effective * this.leechHealingRatio, false, {
        spellKey: "leech",
        canCrit: false,
        suppressLeech: true,
        rawAmount: true,
        ignoreHealingDoneModifiers: true
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

    const damageRatios = HOLY_PRIEST_PRACTICE_TUNING.damageRatios ?? {};
    const singleHitMin = Math.max(0, Number(damageRatios.singleHitMin ?? 0.06));
    const singleHitMax = Math.max(singleHitMin, Number(damageRatios.singleHitMax ?? 0.16));
    const spikeBonusMin = Math.max(0, Number(damageRatios.spikeBonusMin ?? 0.06));
    const spikeBonusMax = Math.max(spikeBonusMin, Number(damageRatios.spikeBonusMax ?? 0.16));
    const raidPulseMin = Math.max(0, Number(damageRatios.raidPulseMin ?? 0.03));
    const raidPulseMax = Math.max(raidPulseMin, Number(damageRatios.raidPulseMax ?? 0.07));

    const maxTargets = Math.min(4, alivePlayers.length);
    const hitCount = randomInt(this.rng, 1, maxTargets);
    const targets = sampleWithoutReplacement(alivePlayers, hitCount, this.rng);
    const weightedHits = [];
    for (const target of targets) {
      const incomingDamageTakenMultiplier = Math.max(0.01, Number(target.incomingDamageTakenMultiplier ?? 1));
      let weight = Math.max(0.01, randomRange(this.rng, singleHitMin, singleHitMax));
      if (this.rng() <= DAMAGE_SPIKE_CHANCE) {
        weight += Math.max(0, randomRange(this.rng, spikeBonusMin, spikeBonusMax));
      }
      weightedHits.push({
        targetId: target.id,
        weight: weight * incomingDamageTakenMultiplier,
        incomingDamageTakenMultiplier
      });
    }

    if (this.rng() < 0.1) {
      const raidPulseWeight = Math.max(0.01, randomRange(this.rng, raidPulseMin, raidPulseMax));
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
    if (this.selfPlayerId && target.id === this.selfPlayerId) {
      if (this.buffs.fadeMs > 0) {
        damage *= 1 - this.fadeDamageReduction;
      }
      if (this.hasProtectiveLightBuff()) {
        damage *= 1 - this.protectiveLightDamageReduction;
      }
    }
    damage = Math.max(0, damage);

    target.hp = round(Math.max(0, target.hp - damage), 2);
    this.metrics.damageTaken = round(this.metrics.damageTaken + damage, 2);

    if (damage > 0 && target.prayerOfMendingRemainingMs > 0) {
      this.triggerPrayerOfMendingOnDamage(target);
    }

    if (target.hp <= 0 && target.alive) {
      target.alive = false;
      this.metrics.deaths += 1;
      this.clearPrayerOfMendingFromTarget(target);
      this.clearRenewFromTarget(target);
      this.clearResonantEnergyFromTarget(target);
      this.clearEchoOfLightFromTarget(target);
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
    this.updateSerenityCooldownSnapshot();

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
    const serenityCharges = this.getSerenityCharges();
    const serenityRechargeRemainingMs = this.getSerenityNextRechargeRemainingMs();

    const snapshotBuffs = {
      ...this.buffs,
      serenityCharges,
      serenityMaxCharges: this.serenityMaxCharges,
      serenityRechargeRemainingMs
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
      prayerOfMendingRemainingMs: Math.max(0, Math.round(player.prayerOfMendingRemainingMs ?? 0)),
      prayerOfMendingJumpsRemaining: Math.max(0, Math.floor(Number(player.prayerOfMendingJumpsRemaining ?? 0))),
      renewRemainingMs: Math.max(0, Math.round(player.renewRemainingMs ?? 0)),
      echoOfLightRemainingMs: Math.max(0, Math.round(player.echoOfLightRemainingMs ?? 0)),
      echoOfLightPoolRemaining: round(Math.max(0, Number(player.echoOfLightPoolRemaining ?? 0)), 2),
      echoOfLightTickAmount: round(Math.max(0, Number(player.echoOfLightTickAmount ?? 0)), 2)
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
          spellName: HOLY_PRIEST_PRACTICE_SPELLS[this.actionQueue[0].spellKey]?.name ?? this.actionQueue[0].spellKey,
          targetId: this.actionQueue[0].targetId ?? null,
          queuedAtMs: Math.max(0, Number(this.actionQueue[0].queuedAtMs ?? this.nowMs))
        }
        : null,
      queueLockoutRemainingMs: Math.max(0, this.getLockoutRemainingMs()),
      spellQueueWindowMs: this.spellQueueWindowMs,
      holyShockCharges: 0,
      holyShockMaxCharges: 0,
      holyShockRechargeRemainingMs: 0,
      serenityCharges,
      serenityMaxCharges: this.serenityMaxCharges,
      serenityRechargeRemainingMs,
      cooldowns: { ...this.cooldowns },
      buffs: snapshotBuffs,
      currentCast: this.currentCast
        ? {
          castId: this.currentCast.castId,
          spellKey: this.currentCast.spellKey,
          spellName: this.currentCast.spellName,
          spellIconKey: this.currentCast.spellIconKey,
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
      treeants: [],
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
        rawPrayerOfHealingCasts: Math.max(0, Math.round(Number(this.metrics.rawPrayerOfHealingCasts ?? 0))),
        wastedLightweaverStacks: Math.max(0, Math.round(Number(this.metrics.wastedLightweaverStacks ?? 0))),
        wastedSurgeOfLightStacks: Math.max(0, Math.round(Number(this.metrics.wastedSurgeOfLightStacks ?? 0))),
        surgeOfLightConsumedTotal: Math.max(
          0,
          Math.round(Number(this.metrics.surgeOfLightConsumedTotal ?? 0))
        ),
        surgeOfLightConsumedFlashHealCasts: Math.max(
          0,
          Math.round(Number(this.metrics.surgeOfLightConsumedFlashHealCasts ?? 0))
        ),
        surgeOfLightConsumedPrayerOfHealingCasts: Math.max(
          0,
          Math.round(Number(this.metrics.surgeOfLightConsumedPrayerOfHealingCasts ?? 0))
        ),
        effectiveSerenityCooldownReductionMs: round(
          Math.max(0, Number(this.metrics.effectiveSerenityCooldownReductionMs ?? 0)),
          1
        ),
        wastedHolyPower: 0,
        cpm: round(cpm, 2),
        casts: { ...this.metrics.casts }
      },
      finished: this.finished,
      success: this.success,
      logs: [...this.logs]
    };
  }
}

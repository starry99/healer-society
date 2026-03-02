import { useEffect, useMemo, useRef, useState } from "react";
import DISCIPLINE_SIM_REFERENCE from "../../data/simulators/disciplineSimulatorReference";

const REF = DISCIPLINE_SIM_REFERENCE ?? {};
const REF_CORE = REF.core ?? {};
const REF_COOLDOWNS = REF_CORE.cooldowns ?? {};
const REF_CHARGES = REF_CORE.charges ?? {};
const REF_PENANCE_CHARGES = REF_CHARGES.penance ?? {};
const REF_RADIANCE_CHARGES = REF_CHARGES.radiance ?? {};
const REF_SOLVER = REF.solverTuning ?? {};
const REF_SOLVER_STATE_KEY = REF_SOLVER.stateKey ?? {};
const REF_SOLVER_PRUNING = REF_SOLVER.pruning ?? {};
const REF_SOLVER_TIMELINE = REF_SOLVER.timeline ?? {};
const REF_SOLVER_INITIAL_MARKERS = REF_SOLVER.initialMajorMarkers ?? {};
const REF_UI = REF.ui ?? {};
const REF_UI_GRAPH = REF_UI.graph ?? {};
const REF_MANA_MODEL = REF.manaModel ?? {};
const REF_MANA_COSTS = REF_MANA_MODEL.costsPct ?? {};
const REF_SPELLS = REF.spells ?? {};
const REF_SEQUENCES = REF.sequences ?? {};
const REF_HERO_TALENT_MODIFIERS = REF.heroTalentModifiers ?? {};
const REF_COEFFICIENTS = REF.coefficients ?? {};
const REF_BASE_DIRECT_HEAL_COEF = REF_COEFFICIENTS.baseDirectHealCoef ?? {};
const REF_BASE_DAMAGE_COEF = REF_COEFFICIENTS.baseDamageCoef ?? {};
const REF_RUNTIME = REF.defaultRuntimeTalentsAndMultipliers ?? {};
const REF_RUNTIME_VOID_SHIELD = REF_RUNTIME.voidShield ?? {};
const REF_CALIBRATION = REF.calibrationAgainstWcl ?? {};
const REF_ATONEMENT_TRANSFER = REF.atonementTransferModel ?? {};
const REF_ATONEMENT_APPLICATION = REF.atonementApplicationModel ?? {};
const REF_MEASURED_AT_INT = REF.measuredAtIntellect759 ?? {};

function numberOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function resolveSpellManaPct(refSpell, fallback, key) {
  if (Number.isFinite(refSpell?.manaPctBacksolved)) {
    return refSpell.manaPctBacksolved;
  }
  if (Number.isFinite(refSpell?.manaPct)) {
    return refSpell.manaPct;
  }
  if (Number.isFinite(REF_MANA_COSTS[key])) {
    return REF_MANA_COSTS[key];
  }
  if (Number.isFinite(fallback?.manaPctBacksolved)) {
    return fallback.manaPctBacksolved;
  }
  if (Number.isFinite(fallback?.manaPct)) {
    return fallback.manaPct;
  }
  return 0;
}

function buildSpellDefinition(key, fallback) {
  const refSpell = REF_SPELLS[key] ?? {};
  return {
    key,
    name: refSpell.name ?? fallback.name,
    wowheadId: numberOr(refSpell.wowheadId, fallback.wowheadId),
    manaPct: numberOr(refSpell.manaPct, fallback.manaPct),
    manaPctBacksolved: Number.isFinite(refSpell.manaPctBacksolved)
      ? refSpell.manaPctBacksolved
      : Number.isFinite(REF_MANA_COSTS[key])
        ? REF_MANA_COSTS[key]
        : fallback.manaPctBacksolved,
    manaPctEffective: resolveSpellManaPct(refSpell, fallback, key),
    castTimeSec: numberOr(refSpell.castTimeSec, fallback.castTimeSec),
    usesGcd: typeof refSpell.usesGcd === "boolean" ? refSpell.usesGcd : fallback.usesGcd
  };
}

function buildSequence(keysFromReference, fallbackKeys) {
  const keys = Array.isArray(keysFromReference) && keysFromReference.length ? keysFromReference : fallbackKeys;
  const resolved = keys.map((key) => SPELLS[key]).filter(Boolean);
  if (resolved.length === keys.length) {
    return resolved;
  }
  return fallbackKeys.map((key) => SPELLS[key]).filter(Boolean);
}

const GCD_BASE_SECONDS = numberOr(REF_CORE.gcdBaseSeconds, 1.5);
const GCD_MIN_SECONDS = numberOr(REF_CORE.gcdMinSeconds, 0.75);
const APOSTLE_COOLDOWN_SECONDS = numberOr(REF_COOLDOWNS.apostleSeconds, 90);
const ULTIMATE_COOLDOWN_SECONDS = numberOr(REF_COOLDOWNS.ultimateSeconds, 240);
const PENANCE_RECHARGE_BASE_SECONDS = numberOr(REF_PENANCE_CHARGES.rechargeBaseSeconds, 9.063);
const PENANCE_MAX_CHARGES = numberOr(REF_PENANCE_CHARGES.max, 2);
const MIND_BLAST_COOLDOWN_SECONDS = numberOr(REF_COOLDOWNS.mindBlastSeconds, 20);
const RADIANCE_RECHARGE_SECONDS = numberOr(REF_RADIANCE_CHARGES.rechargeSeconds, 18);
const RADIANCE_MAX_CHARGES = numberOr(REF_RADIANCE_CHARGES.max, 2);
const MIN_END_MANA = numberOr(REF_CORE.minEndMana, 1);
const CROSS_MAJOR_MIN_GAP_SECONDS = numberOr(REF_CORE.crossMajorMinGapSeconds, 20);
const CROSS_MAJOR_RESOURCE_MIN_GAP_SECONDS = numberOr(
  REF_SOLVER.crossMajorResourceMinGapSeconds,
  RADIANCE_RECHARGE_SECONDS * numberOr(REF_SOLVER.crossMajorResourceGapRadianceCharges, 2)
);
const EFFECTIVE_CROSS_MAJOR_MIN_GAP_SECONDS = Math.max(
  CROSS_MAJOR_MIN_GAP_SECONDS,
  CROSS_MAJOR_RESOURCE_MIN_GAP_SECONDS
);
const STATE_EPSILON = numberOr(REF_CORE.epsilon, 1e-6);
const HEALING_CLOSE_RATIO_FOR_MANA_PREF = numberOr(REF_SOLVER.healingCloseRatioForManaPref, 0.05);
const FILLER_BEAM_WIDTH = numberOr(REF_SOLVER.fillerBeamWidth, 640);
const MAJOR_BEAM_WIDTH = numberOr(REF_SOLVER.majorBeamWidth, 420);
const PER_MANA_BUCKET_LIMIT = numberOr(REF_SOLVER.perManaBucketLimit, 12);
const HEALING_GRAPH_SMOOTHING_SECONDS = numberOr(REF_SOLVER.healingGraphSmoothingSeconds, 1.0);
const MAJOR_MANA_RESERVE_SAFETY_MULTIPLIER = numberOr(REF_SOLVER.majorManaReserveSafetyMultiplier, 0.94);
const DEFAULT_DURATION_MINUTES = numberOr(REF_SOLVER.defaultDurationMinutes, 5);
const DEFAULT_HASTE_PCT = numberOr(REF_SOLVER.defaultHastePct, 20);
const DEFAULT_INITIAL_DURATION_SECONDS = numberOr(REF_SOLVER_INITIAL_MARKERS.durationSeconds, 300);
const DEFAULT_INITIAL_HASTE_PCT = numberOr(REF_SOLVER_INITIAL_MARKERS.hastePct, 20);
const DEFAULT_MANA_POOL = numberOr(REF_CORE.defaultManaPool, 200000);
const OBSERVED_MANA_POOL_FOR_BACKSOLVE = numberOr(REF_CORE.observedManaPoolForBacksolve, 55125);
const DEFAULT_INTELLECT = numberOr(REF_CORE.defaultIntellect, 2000);
const DEFAULT_MANA_REGEN_PCT_PER_5S = numberOr(REF_CORE.defaultManaRegenPctPer5Sec, 4);
const DEFAULT_VOID_SHIELD_PROC_CHANCE_PCT = numberOr(REF_RUNTIME_VOID_SHIELD.procChancePct, 66);
const DEFAULT_CRIT_CHANCE_PCT = numberOr(REF_CORE.defaultCritChancePct, 20);
const DEFAULT_CRIT_MULTIPLIER = numberOr(REF_CORE.defaultCritMultiplier, 2);
const DEFAULT_PROBABILITY_MODE = REF_CORE.probabilityMode === "expected" ? "expected" : "random";
const DEFAULT_MASTERY_ATONEMENT_TARGET_BONUS_PCT = numberOr(
  REF_CORE.defaultMasteryAtonementTargetBonusPct,
  numberOr(REF_RUNTIME.masteryAtonementTargetBonusPct, 45)
);
const LOG_CALIBRATION_ENABLED = REF_CALIBRATION.enabled ?? true;
const LOG_CALIBRATION_REFERENCE =
  REF_CALIBRATION.reference ?? "WCL cFydmGJpW1a8KtDA fight=33 source=1 (Elfypriest)";
const LOG_CALIBRATION_MULTIPLIER = {
  direct: {
    powerWordShield: numberOr(REF_CALIBRATION.directMultipliers?.powerWordShield, 1),
    flashHeal: numberOr(REF_CALIBRATION.directMultipliers?.flashHeal, 1),
    powerWordRadiance: numberOr(REF_CALIBRATION.directMultipliers?.powerWordRadiance, 1),
    penance: numberOr(REF_CALIBRATION.directMultipliers?.penance, 1)
  },
  damage: {
    penance: numberOr(REF_CALIBRATION.damageMultipliers?.penance, 1),
    mindBlast: numberOr(REF_CALIBRATION.damageMultipliers?.mindBlast, 1),
    smite: numberOr(REF_CALIBRATION.damageMultipliers?.smite, 1),
    ultimatePenitence: numberOr(REF_CALIBRATION.damageMultipliers?.ultimatePenitence, 1)
  }
};
const ULTIMATE_PENITENCE_BASE_DURATION_SECONDS = numberOr(REF_CORE.ultimatePenitenceBaseDurationSeconds, 6.1);
const ATONEMENT_TRANSFER_BASE_RATE_PCT = numberOr(
  REF_CORE.atonementTransferBaseRatePct,
  numberOr(REF_ATONEMENT_TRANSFER.baseRatePctAt0to5, 45)
);
const ATONEMENT_TRANSFER_BASE_TARGETS = numberOr(REF_CORE.atonementTransferBaseTargets, 5);
const ATONEMENT_TRANSFER_MIN_RATE_AT_MAX_TARGETS_PCT = numberOr(
  REF_CORE.atonementTransferMinRateAtMaxTargetsPct,
  numberOr(REF_ATONEMENT_TRANSFER.minRatePctAt20, 25)
);
const ATONEMENT_TRANSFER_MAX_TARGETS = numberOr(
  REF_CORE.atonementTransferMaxTargets,
  numberOr(REF_ATONEMENT_TRANSFER.maxTargets, 20)
);
const BASE_ATONEMENT_DURATION_SECONDS = numberOr(REF_CORE.baseAtonementDurationSeconds, 19);
const INSTANT_PROGNOSIS_PENANCE_DAMAGE_MULTIPLIER = numberOr(
  REF_CORE.instantPrognosisPenanceDamageMultiplier,
  1
);
const APEX_PENANCE_DAMAGE_MULTIPLIER = numberOr(REF_CORE.apexPenanceDamageMultiplier, 1.06);
const APEX_ATONEMENT_HEALING_MULTIPLIER = numberOr(REF_CORE.apexAtonementHealingMultiplier, 1);
const PROPHETS_INSIGHT_HOLY_ATONEMENT_MULTIPLIER = numberOr(REF_CORE.prophetsInsightHolyAtonementMultiplier, 1);
const VOID_SHIELD_DEFAULT_TARGET_COUNT = numberOr(REF_CORE.voidShieldDefaultTargetCount, 3);
const VOID_SHIELD_DEFAULT_SHIELD_MULTIPLIER = numberOr(REF_CORE.voidShieldDefaultShieldMultiplier, 1.5);
const DARK_INDULGENCE_MIND_BLAST_MULTIPLIER = numberOr(REF_CORE.darkIndulgenceMindBlastMultiplier, 1);
const DARK_EXTRACTION_MIND_BLAST_MULTIPLIER = numberOr(REF_CORE.darkExtractionMindBlastMultiplier, 1);
const SMITE_PENANCE_DAMAGE_BONUS_MULTIPLIER = numberOr(REF_CORE.smitePenanceDamageBonusMultiplier, 1);
const HOLY_SPELL_DAMAGE_BONUS_MULTIPLIER = numberOr(REF_CORE.holySpellDamageBonusMultiplier, 1);
const BURNING_LIGHT_PENANCE_EXTRA_DAMAGE_MULTIPLIER = numberOr(REF_CORE.burningLightPenanceExtraDamageMultiplier, 1);
const HOLY_RADIANCE_PENANCE_ENEMY_BOLT_AVG_MULTIPLIER = numberOr(REF_CORE.holyRadiancePenanceEnemyBoltAvgMultiplier, 1);
const FOLLOWUP_PENANCE_DAMAGE_MULTIPLIER_AFTER_MIND_BLAST = numberOr(
  REF_CORE.followupPenanceDamageMultiplierAfterMindBlast,
  1
);
const PROSPERITY_ADVERSITY_NEXT_SHIELD_MULTIPLIER = numberOr(REF_CORE.prosperityAdversityNextShieldMultiplier, 1.21);
const ETERNAL_BARRIER_SHIELD_MULTIPLIER = numberOr(REF_CORE.eternalBarrierShieldMultiplier, 1);
const SHIELD_MANA_REFUND_PCT = numberOr(REF_CORE.shieldManaRefundPct, 0.5);
const SHIELD_MANA_REFUND_DELAY_SECONDS = numberOr(REF_CORE.shieldManaRefundDelaySeconds, 20);
const ARCHANGEL_BUFF_SECONDS = numberOr(REF_CORE.archangelBuffSeconds, 18);
const ARCHANGEL_HEALING_SHIELD_MULTIPLIER = numberOr(REF_CORE.archangelHealingShieldMultiplier, 1);
const RADIANCE_ATONEMENT_DURATION_MULTIPLIER = numberOr(REF_CORE.radianceAtonementDurationMultiplier, 0.77);
const AEGIS_FROM_CRIT_DIRECT_HEAL_MULTIPLIER = numberOr(REF_CORE.aegisFromCritDirectHealMultiplier, 0.3);
const REFERENCE_INTELLECT = numberOr(
  REF_CORE.referenceIntellect,
  numberOr(REF.scaling?.referenceIntellect, 759)
);
// 회개(공격) 캐스트 총합 피해 모델:
// 1) 기본 계수(지능 배율) * 2) 특성 묶음 배율 * 3) 두번째 화살 보정(5/4)
const PENANCE_DAMAGE_BASE_COEF_PER_INTELLECT = numberOr(REF_CORE.penanceDamageBaseCoefPerIntellect, 2.48);
const PENANCE_DAMAGE_TALENT_MULTIPLIER = numberOr(REF_CORE.penanceDamageTalentMultiplier, 2.374);
const PENANCE_DAMAGE_SECOND_BOLT_ADJUSTMENT_MULTIPLIER = numberOr(
  REF_CORE.penanceSecondBoltAdjustmentMultiplier,
  1.25
);
const INNER_FOCUS_CRIT_BONUS_PCT = numberOr(REF_CORE.innerFocusCritBonusPct, 20);
const STATE_KEY_MANA_BUCKET_FLOOR = numberOr(REF_SOLVER_STATE_KEY.manaBucketFloor, 1500);
const STATE_KEY_MANA_BUCKET_DIVISOR = numberOr(REF_SOLVER_STATE_KEY.manaBucketDivisor, 45);
const STATE_KEY_TIME_BUCKETS_PER_SECOND = numberOr(REF_SOLVER_STATE_KEY.timeBucketsPerSecond, 5);
const STATE_KEY_CHARGE_PRECISION = numberOr(REF_SOLVER_STATE_KEY.chargePrecision, 10);
const STATE_KEY_REMAIN_ROUND_PER_SECOND = numberOr(REF_SOLVER_STATE_KEY.remainRoundPerSecond, 2);
const STATE_KEY_PENDING_REFUND_LOOKAHEAD_SECONDS = numberOr(REF_SOLVER_STATE_KEY.pendingRefundLookaheadSeconds, 30);
const STATE_KEY_CAST_BUCKET_DIVISOR = numberOr(REF_SOLVER_STATE_KEY.castBucketDivisor, 2);
const PRUNING_MANA_BUCKET_FLOOR = numberOr(REF_SOLVER_PRUNING.manaBucketFloor, 3500);
const PRUNING_MANA_BUCKET_DIVISOR = numberOr(REF_SOLVER_PRUNING.manaBucketDivisor, 30);
const PRUNING_MINIMUM_KEEP_RATIO = numberOr(REF_SOLVER_PRUNING.minimumKeepRatio, 0.4);
const TIMELINE_RATE_SAMPLE_STEP_SECONDS = numberOr(REF_SOLVER_TIMELINE.rateSampleStepSeconds, 0.1);
const TIMELINE_HPS_ROLLING_WINDOW_SECONDS = numberOr(REF_SOLVER_TIMELINE.healingRateRollingWindowSeconds, 6);
const MONTE_CARLO_DEFAULT_RUNS = Math.max(1, Math.round(numberOr(REF_SOLVER.monteCarloRuns, 12)));
const SOLVER_PROBABILITY_MODE = REF_SOLVER.probabilityModeDuringSearch === "random" ? "random" : "expected";
const FILLER_UNIQUE_ATONEMENT_TARGET_MODEL_ENABLED = REF_CORE.fillerUniqueAtonementTargetModelEnabled !== false;
const CHART_WIDTH = numberOr(REF_UI_GRAPH.width, 720);
const CHART_HEIGHT = numberOr(REF_UI_GRAPH.height, 220);
const CHART_X_TICK_STEP_SECONDS = numberOr(REF_UI_GRAPH.xTickStepSeconds, 30);

const MEASURED_AT_REFERENCE_INTELLECT = {
  shadowWordPainInstantDamage: numberOr(REF_MEASURED_AT_INT.shadowWordPainInstantDamage, 557),
  shadowWordPainDotTotal16Sec: numberOr(REF_MEASURED_AT_INT.shadowWordPainDotTotal16Sec, 4481),
  powerWordShieldAbsorb: numberOr(REF_MEASURED_AT_INT.powerWordShieldAbsorb, 11868),
  voidShieldAbsorb: numberOr(REF_MEASURED_AT_INT.voidShieldAbsorb, 17912),
  mindBlastDamage: numberOr(REF_MEASURED_AT_INT.mindBlastDamage, 4009),
  flashHealHealing: numberOr(REF_MEASURED_AT_INT.flashHealHealing, 10518),
  flashHealSelfHealPctOfPrimary: numberOr(REF_MEASURED_AT_INT.flashHealSelfHealPctOfPrimary, 20),
  pleaHealing: numberOr(REF_MEASURED_AT_INT.pleaHealing, 2136),
  powerWordRadianceHealPerTarget: numberOr(REF_MEASURED_AT_INT.powerWordRadianceHealPerTarget, 5016),
  powerWordRadianceTargetCount: numberOr(REF_MEASURED_AT_INT.powerWordRadianceTargetCount, 5),
  evangelismRadianceMultiplier: numberOr(REF_MEASURED_AT_INT.evangelismRadianceMultiplier, 1.5),
  ultimatePenitenceBaseDamage: numberOr(REF_MEASURED_AT_INT.ultimatePenitenceBaseDamage, 75626),
  smiteDamage: numberOr(REF_MEASURED_AT_INT.smiteDamage, 1878),
  // 회개는 "볼트 단위"가 아니라 "캐스트 단위 총합"으로 입력/스케일링한다.
  penanceCastTotalDamage: numberOr(
    REF_MEASURED_AT_INT.penanceCastTotalDamage,
    numberOr(REF_MEASURED_AT_INT.penanceEnemyDamage, 4472)
  ),
  penanceCastTotalDirectHealing: numberOr(
    REF_MEASURED_AT_INT.penanceCastTotalDirectHealing,
    numberOr(REF_MEASURED_AT_INT.penanceAllyHealTotal, 10000)
  ),
  penanceCastFlatAtonementPerTarget: numberOr(
    REF_MEASURED_AT_INT.penanceCastFlatAtonementPerTarget,
    numberOr(REF_MEASURED_AT_INT.penanceAtonementPerTarget, 144)
  )
};

const HERO_TALENT_MODIFIERS = {
  sagesWordsHealMultiplier: {
    flashHeal: numberOr(REF_HERO_TALENT_MODIFIERS.sagesWordsHealMultiplier?.flashHeal, 1),
    plea: numberOr(REF_HERO_TALENT_MODIFIERS.sagesWordsHealMultiplier?.plea, 1),
    powerWordRadiance: numberOr(REF_HERO_TALENT_MODIFIERS.sagesWordsHealMultiplier?.powerWordRadiance, 1)
  },
  preventativeMeasuresShieldMultiplier: numberOr(
    REF_HERO_TALENT_MODIFIERS.preventativeMeasuresShieldMultiplier,
    1
  ),
  preventativeMeasuresDamageMultiplier: {
    penance: numberOr(REF_HERO_TALENT_MODIFIERS.preventativeMeasuresDamageMultiplier?.penance, 1),
    smite: numberOr(REF_HERO_TALENT_MODIFIERS.preventativeMeasuresDamageMultiplier?.smite, 1)
  }
};

const MANA_PCT_BACKSOLVED_55125 = {
  shadowWordPain: numberOr(REF_MANA_COSTS.shadowWordPain, 1.5),
  penance: numberOr(REF_MANA_COSTS.penance, 1.5),
  powerWordShield: numberOr(REF_MANA_COSTS.powerWordShield, 2.3),
  flashHeal: numberOr(REF_MANA_COSTS.flashHeal, 3),
  plea: numberOr(REF_MANA_COSTS.plea, 2),
  evangelism: numberOr(REF_MANA_COSTS.evangelism, 0),
  powerWordRadiance: numberOr(REF_MANA_COSTS.powerWordRadiance, 5),
  mindBlast: numberOr(REF_MANA_COSTS.mindBlast, 2),
  smite: numberOr(REF_MANA_COSTS.smite, 0.36),
  ultimatePenitence: numberOr(REF_MANA_COSTS.ultimatePenitence, 0)
};

const SPELLS = {
  shadowWordPain: buildSpellDefinition("shadowWordPain", {
    name: "어둠의 권능: 고통",
    wowheadId: 589,
    manaPct: 2,
    manaPctBacksolved: MANA_PCT_BACKSOLVED_55125.shadowWordPain,
    castTimeSec: 0,
    usesGcd: true
  }),
  penance: buildSpellDefinition("penance", {
    name: "회개",
    wowheadId: 47540,
    manaPct: 1.6,
    manaPctBacksolved: MANA_PCT_BACKSOLVED_55125.penance,
    castTimeSec: 2,
    usesGcd: true
  }),
  powerWordShield: buildSpellDefinition("powerWordShield", {
    name: "신의 권능: 보호막",
    wowheadId: 17,
    manaPct: 10,
    manaPctBacksolved: MANA_PCT_BACKSOLVED_55125.powerWordShield,
    castTimeSec: 0,
    usesGcd: true
  }),
  flashHeal: buildSpellDefinition("flashHeal", {
    name: "순간 치유",
    wowheadId: 2061,
    manaPct: 10,
    manaPctBacksolved: MANA_PCT_BACKSOLVED_55125.flashHeal,
    castTimeSec: 1.5,
    usesGcd: true
  }),
  plea: buildSpellDefinition("plea", {
    name: "간청",
    wowheadId: 200829,
    manaPct: 2.2,
    manaPctBacksolved: MANA_PCT_BACKSOLVED_55125.plea,
    castTimeSec: 0,
    usesGcd: true
  }),
  evangelism: buildSpellDefinition("evangelism", {
    name: "전도",
    wowheadId: 472433,
    manaPct: 0,
    manaPctBacksolved: MANA_PCT_BACKSOLVED_55125.evangelism,
    castTimeSec: 0,
    usesGcd: true
  }),
  powerWordRadiance: buildSpellDefinition("powerWordRadiance", {
    name: "신의 권능: 광휘",
    wowheadId: 194509,
    manaPct: 5.4,
    manaPctBacksolved: MANA_PCT_BACKSOLVED_55125.powerWordRadiance,
    castTimeSec: 1,
    usesGcd: true
  }),
  mindBlast: buildSpellDefinition("mindBlast", {
    name: "정신 분열",
    wowheadId: 8092,
    manaPct: 4,
    manaPctBacksolved: MANA_PCT_BACKSOLVED_55125.mindBlast,
    castTimeSec: 1.5,
    usesGcd: true
  }),
  smite: buildSpellDefinition("smite", {
    name: "성스러운 일격",
    wowheadId: 585,
    manaPct: 3,
    manaPctBacksolved: MANA_PCT_BACKSOLVED_55125.smite,
    castTimeSec: 1.5,
    usesGcd: true
  }),
  ultimatePenitence: buildSpellDefinition("ultimatePenitence", {
    name: "궁극의 참회",
    wowheadId: 421453,
    manaPct: 0,
    manaPctBacksolved: MANA_PCT_BACKSOLVED_55125.ultimatePenitence,
    castTimeSec: ULTIMATE_PENITENCE_BASE_DURATION_SECONDS,
    usesGcd: true
  })
};

const SPELL_NAME_BY_KEY = Object.values(SPELLS).reduce((acc, spell) => {
  acc[spell.key] = spell.name;
  return acc;
}, {});

const REF_SPELL_BAR_COLOR_BY_KEY = REF_UI.spellBarColorByKey ?? {};
const SPELL_BAR_COLOR_BY_KEY = {
  [SPELLS.shadowWordPain.key]: REF_SPELL_BAR_COLOR_BY_KEY.shadowWordPain ?? "#60a5fa",
  [SPELLS.penance.key]: REF_SPELL_BAR_COLOR_BY_KEY.penance ?? "#38bdf8",
  [SPELLS.powerWordShield.key]: REF_SPELL_BAR_COLOR_BY_KEY.powerWordShield ?? "#f59e0b",
  [SPELLS.flashHeal.key]: REF_SPELL_BAR_COLOR_BY_KEY.flashHeal ?? "#4ade80",
  [SPELLS.plea.key]: REF_SPELL_BAR_COLOR_BY_KEY.plea ?? "#34d399",
  [SPELLS.evangelism.key]: REF_SPELL_BAR_COLOR_BY_KEY.evangelism ?? "#f97316",
  [SPELLS.powerWordRadiance.key]: REF_SPELL_BAR_COLOR_BY_KEY.powerWordRadiance ?? "#a78bfa",
  [SPELLS.mindBlast.key]: REF_SPELL_BAR_COLOR_BY_KEY.mindBlast ?? "#fbbf24",
  [SPELLS.smite.key]: REF_SPELL_BAR_COLOR_BY_KEY.smite ?? "#a78bfa",
  [SPELLS.ultimatePenitence.key]: REF_SPELL_BAR_COLOR_BY_KEY.ultimatePenitence ?? "#c084fc"
};

const REF_HEALING_ROW_NAME_BY_KEY = REF_UI.healingRowNameByKey ?? {};
const HEALING_ROW_NAME_BY_KEY = {
  atonement: REF_HEALING_ROW_NAME_BY_KEY.atonement ?? "속죄",
  voidShield: REF_HEALING_ROW_NAME_BY_KEY.voidShield ?? "공허 보호막",
  aegis: REF_HEALING_ROW_NAME_BY_KEY.aegis ?? "아이기스"
};

const REF_HEALING_ROW_COLOR_BY_KEY = REF_UI.healingRowColorByKey ?? {};
const HEALING_ROW_COLOR_BY_KEY = {
  ...SPELL_BAR_COLOR_BY_KEY,
  atonement: REF_HEALING_ROW_COLOR_BY_KEY.atonement ?? "#d9da6f",
  voidShield: REF_HEALING_ROW_COLOR_BY_KEY.voidShield ?? "#a78bfa",
  aegis: REF_HEALING_ROW_COLOR_BY_KEY.aegis ?? "#fef08a"
};

const IDLE_REASON_LABELS = {
  majorScheduledStart: REF_UI.idleReasonLabels?.majorScheduledStart ?? "메이저 시작 시점 대기",
  majorPenanceCharge: REF_UI.idleReasonLabels?.majorPenanceCharge ?? "메이저 중 회개 충전 대기",
  majorRadianceCharge: REF_UI.idleReasonLabels?.majorRadianceCharge ?? "메이저 중 광휘 충전 대기",
  fillerSegmentTailNoRoomForMandatory:
    REF_UI.idleReasonLabels?.fillerSegmentTailNoRoomForMandatory ?? "필러 구간 끝: 회개+보막 시간 부족",
  fillerMandatoryBranchFailed:
    REF_UI.idleReasonLabels?.fillerMandatoryBranchFailed ?? "필러 고정 분기 실패(마나/제약)",
  fillerWaitForMandatoryPenance:
    REF_UI.idleReasonLabels?.fillerWaitForMandatoryPenance ?? "필러: 다음 회개 충전까지 대기",
  fillerWaitForRadianceCharge:
    REF_UI.idleReasonLabels?.fillerWaitForRadianceCharge ?? "필러: 다음 광휘 충전까지 대기",
  fillerBranchFilteredByMajorChargeRule:
    REF_UI.idleReasonLabels?.fillerBranchFilteredByMajorChargeRule ?? "필러: 메이저 충전 규칙으로 우선 분기 제외",
  fillerWaitToSegmentEndNoAction:
    REF_UI.idleReasonLabels?.fillerWaitToSegmentEndNoAction ?? "필러: 창 종료까지 시전 불가",
  fillerFinalizeToSegmentEnd: REF_UI.idleReasonLabels?.fillerFinalizeToSegmentEnd ?? "필러 정리 대기",
  idleOther: REF_UI.idleReasonLabels?.idleOther ?? "기타 대기"
};

const DEFAULT_SPELL_MANA_PCT = Object.values(SPELLS).reduce((acc, spell) => {
  acc[spell.key] = spell.manaPctEffective;
  return acc;
}, {});

const BASE_DIRECT_HEAL_COEF = {
  powerWordShield: numberOr(REF_BASE_DIRECT_HEAL_COEF.powerWordShield, 320),
  flashHeal: numberOr(REF_BASE_DIRECT_HEAL_COEF.flashHeal, 682),
  plea: numberOr(REF_BASE_DIRECT_HEAL_COEF.plea, 160),
  powerWordRadiance: numberOr(REF_BASE_DIRECT_HEAL_COEF.powerWordRadiance, 460 * 5),
  evangelism: numberOr(REF_BASE_DIRECT_HEAL_COEF.evangelism, 0)
};

const BASE_DAMAGE_COEF = {
  shadowWordPain: numberOr(REF_BASE_DAMAGE_COEF.shadowWordPain, 90),
  penance: numberOr(REF_BASE_DAMAGE_COEF.penance, 67.575 * 3),
  mindBlast: numberOr(REF_BASE_DAMAGE_COEF.mindBlast, 210),
  smite: numberOr(REF_BASE_DAMAGE_COEF.smite, 95),
  ultimatePenitence: numberOr(REF_BASE_DAMAGE_COEF.ultimatePenitence, 620)
};

const DIRECT_HEAL_COEF = {
  ...BASE_DIRECT_HEAL_COEF,
  powerWordShield:
    BASE_DIRECT_HEAL_COEF.powerWordShield *
    HERO_TALENT_MODIFIERS.preventativeMeasuresShieldMultiplier *
    ETERNAL_BARRIER_SHIELD_MULTIPLIER,
  flashHeal: BASE_DIRECT_HEAL_COEF.flashHeal * HERO_TALENT_MODIFIERS.sagesWordsHealMultiplier.flashHeal,
  plea: BASE_DIRECT_HEAL_COEF.plea * HERO_TALENT_MODIFIERS.sagesWordsHealMultiplier.plea,
  powerWordRadiance:
    BASE_DIRECT_HEAL_COEF.powerWordRadiance * HERO_TALENT_MODIFIERS.sagesWordsHealMultiplier.powerWordRadiance
};

const DAMAGE_COEF = {
  ...BASE_DAMAGE_COEF,
  penance:
    BASE_DAMAGE_COEF.penance *
    HERO_TALENT_MODIFIERS.preventativeMeasuresDamageMultiplier.penance *
    SMITE_PENANCE_DAMAGE_BONUS_MULTIPLIER *
    INSTANT_PROGNOSIS_PENANCE_DAMAGE_MULTIPLIER *
    HOLY_RADIANCE_PENANCE_ENEMY_BOLT_AVG_MULTIPLIER *
    BURNING_LIGHT_PENANCE_EXTRA_DAMAGE_MULTIPLIER *
    APEX_PENANCE_DAMAGE_MULTIPLIER,
  mindBlast: BASE_DAMAGE_COEF.mindBlast * DARK_INDULGENCE_MIND_BLAST_MULTIPLIER * DARK_EXTRACTION_MIND_BLAST_MULTIPLIER,
  smite:
    BASE_DAMAGE_COEF.smite *
    HERO_TALENT_MODIFIERS.preventativeMeasuresDamageMultiplier.smite *
    SMITE_PENANCE_DAMAGE_BONUS_MULTIPLIER *
    HOLY_SPELL_DAMAGE_BONUS_MULTIPLIER,
  ultimatePenitence: BASE_DAMAGE_COEF.ultimatePenitence * HOLY_SPELL_DAMAGE_BONUS_MULTIPLIER
};

const DEFAULT_TALENT_RUNTIME = {
  prophetsInsightHolyAtonementMultiplier: numberOr(
    REF_RUNTIME.prophetsInsightHolyAtonementMultiplier,
    PROPHETS_INSIGHT_HOLY_ATONEMENT_MULTIPLIER
  ),
  apexAtonementHealingMultiplier: numberOr(REF_RUNTIME.apexAtonementHealingMultiplier, APEX_ATONEMENT_HEALING_MULTIPLIER),
  voidShieldProcChancePct: numberOr(REF_RUNTIME_VOID_SHIELD.procChancePct, DEFAULT_VOID_SHIELD_PROC_CHANCE_PCT),
  voidShieldProcChance: numberOr(REF_RUNTIME_VOID_SHIELD.procChancePct, DEFAULT_VOID_SHIELD_PROC_CHANCE_PCT) / 100,
  critChancePct: DEFAULT_CRIT_CHANCE_PCT,
  critMultiplier: DEFAULT_CRIT_MULTIPLIER,
  expectedCritMultiplier: getExpectedCritMultiplier(DEFAULT_CRIT_CHANCE_PCT, DEFAULT_CRIT_MULTIPLIER),
  innerFocusCritBonusPct: numberOr(REF_RUNTIME.innerFocusCritBonusPct, INNER_FOCUS_CRIT_BONUS_PCT),
  masteryAtonementTargetBonusPct: DEFAULT_MASTERY_ATONEMENT_TARGET_BONUS_PCT,
  voidShieldTargetCount: numberOr(REF_RUNTIME_VOID_SHIELD.targetCount, VOID_SHIELD_DEFAULT_TARGET_COUNT),
  voidShieldShieldMultiplier: numberOr(REF_RUNTIME_VOID_SHIELD.shieldMultiplier, VOID_SHIELD_DEFAULT_SHIELD_MULTIPLIER),
  followupPenanceDamageMultiplierAfterMindBlast: numberOr(
    REF_RUNTIME.followupPenanceDamageMultiplierAfterMindBlast,
    FOLLOWUP_PENANCE_DAMAGE_MULTIPLIER_AFTER_MIND_BLAST
  ),
  nextShieldMultiplierAfterPenance: numberOr(
    REF_RUNTIME.nextShieldMultiplierAfterPenance,
    PROSPERITY_ADVERSITY_NEXT_SHIELD_MULTIPLIER
  ),
  shieldManaRefundPct: numberOr(REF_RUNTIME.shieldManaRefund?.pct, SHIELD_MANA_REFUND_PCT),
  shieldManaRefundDelaySec: numberOr(REF_RUNTIME.shieldManaRefund?.delaySec, SHIELD_MANA_REFUND_DELAY_SECONDS),
  archangelHealingShieldMultiplier: numberOr(
    REF_RUNTIME.archangelHealingShieldMultiplier,
    ARCHANGEL_HEALING_SHIELD_MULTIPLIER
  ),
  archangelBuffDurationSec: numberOr(REF_RUNTIME.archangelBuffDurationSec, ARCHANGEL_BUFF_SECONDS)
};

const APOSTLE_SEQUENCE = buildSequence(REF_SEQUENCES.apostle, [
  "penance",
  "powerWordShield",
  "flashHeal",
  "plea",
  "evangelism",
  "powerWordRadiance",
  "powerWordRadiance",
  "penance",
  "mindBlast",
  "penance",
  "powerWordShield",
  "smite"
]);

const ULTIMATE_SEQUENCE = buildSequence(REF_SEQUENCES.ultimate, [
  "penance",
  "powerWordShield",
  "flashHeal",
  "plea",
  "powerWordRadiance",
  "powerWordRadiance",
  "ultimatePenitence",
  "mindBlast",
  "penance",
  "powerWordShield",
  "penance",
  "smite"
]);

const APOSTLE_PREP_SEQUENCE = buildSequence(REF_SEQUENCES.apostlePrep, [
  "penance",
  "powerWordShield",
  "flashHeal",
  "plea"
]);

const ULTIMATE_PREP_SEQUENCE = buildSequence(REF_SEQUENCES.ultimatePrep, [
  "penance",
  "powerWordShield",
  "flashHeal",
  "plea",
  "powerWordRadiance",
  "powerWordRadiance"
]);

const MAJOR_ATONEMENT_MODEL = {
  baseDurationSec: numberOr(
    REF_ATONEMENT_APPLICATION.baseDurationSec,
    BASE_ATONEMENT_DURATION_SECONDS
  ),
  evangelismExtendSec: numberOr(REF_ATONEMENT_APPLICATION.evangelismExtendSec, 0),
  maxTargets: numberOr(REF_ATONEMENT_APPLICATION.maxTargets, ATONEMENT_TRANSFER_MAX_TARGETS),
  applyCountBySpellKey: {
    [SPELLS.powerWordShield.key]: numberOr(REF_ATONEMENT_APPLICATION.perSpellApplyCount?.powerWordShield, 1),
    [SPELLS.flashHeal.key]: numberOr(REF_ATONEMENT_APPLICATION.perSpellApplyCount?.flashHeal, 2),
    [SPELLS.plea.key]: numberOr(REF_ATONEMENT_APPLICATION.perSpellApplyCount?.plea, 1),
    [SPELLS.evangelism.key]: numberOr(REF_ATONEMENT_APPLICATION.perSpellApplyCount?.evangelism, 5),
    [SPELLS.powerWordRadiance.key]: numberOr(REF_ATONEMENT_APPLICATION.perSpellApplyCount?.powerWordRadiance, 5),
    [SPELLS.penance.key]: numberOr(REF_ATONEMENT_APPLICATION.perSpellApplyCount?.penance, 0)
  },
  applyDurationMultiplierBySpellKey: {
    [SPELLS.evangelism.key]: numberOr(
      REF_ATONEMENT_APPLICATION.durationModifiers?.evangelismDurationMultiplier,
      RADIANCE_ATONEMENT_DURATION_MULTIPLIER
    ),
    [SPELLS.powerWordRadiance.key]: numberOr(
      REF_ATONEMENT_APPLICATION.durationModifiers?.powerWordRadianceDurationMultiplier,
      RADIANCE_ATONEMENT_DURATION_MULTIPLIER
    )
  },
  applyDurationBonusBySpellKey: {
    [SPELLS.powerWordShield.key]: numberOr(REF_ATONEMENT_APPLICATION.durationModifiers?.powerWordShieldDurationBonusSec, 4)
  }
};

const WOWHEAD_FACTS =
  Array.isArray(REF.wowheadFacts) && REF.wowheadFacts.length
    ? REF.wowheadFacts
    : [
      "어둠의 권능: 고통(589): 2% base mana, Instant",
      "회개(47540): 1.6% base mana, Channeled",
      "신의 권능: 보호막(17): 10% base mana, Instant",
      "순간 치유(2061): 10% base mana, 1.5초 시전",
      "간청(200829): 2.2% base mana, Instant",
      "전도(472433): Instant",
      "신의 권능: 광휘(194509): 5.4% base mana, 2초 시전",
      "정신 분열(8092): 4% base mana, 1.5초 시전",
      "성스러운 일격(585): 3% base mana, 1.5초 시전",
      "궁극의 참회(421453): 약 6.1초 채널(가속 적용)"
    ];

function buildInitialMajorCastTimes(
  durationSeconds = DEFAULT_INITIAL_DURATION_SECONDS,
  hastePct = DEFAULT_INITIAL_HASTE_PCT
) {
  const apostleMinStart = getMajorMarkerMinimum("apostle", hastePct);
  const ultimateMinStart = getMajorMarkerMinimum("ultimate", hastePct);
  const defaultApostle = buildDefaultCastTimes(durationSeconds, APOSTLE_COOLDOWN_SECONDS, apostleMinStart);
  const defaultUltimate = buildDefaultCastTimes(durationSeconds, ULTIMATE_COOLDOWN_SECONDS, ultimateMinStart);
  const sanitized = enforceCrossMajorGap({
    apostleTimes: defaultApostle,
    ultimateTimes: defaultUltimate,
    durationSeconds,
    apostleMinStart,
    ultimateMinStart,
    minGapSeconds: EFFECTIVE_CROSS_MAJOR_MIN_GAP_SECONDS
  });
  const culled = cullUltimateTimesByApostlePriority(
    sanitized.apostleTimes,
    sanitized.ultimateTimes,
    EFFECTIVE_CROSS_MAJOR_MIN_GAP_SECONDS
  );
  return {
    apostleTimes: sanitized.apostleTimes,
    ultimateTimes: culled.ultimateTimes
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function parseNumber(value, fallback) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function averageNumericValues(values) {
  const finite = values.filter((value) => Number.isFinite(value));
  if (!finite.length) {
    return 0;
  }
  return finite.reduce((sum, value) => sum + value, 0) / finite.length;
}

function standardDeviation(values, mean = null) {
  const finite = values.filter((value) => Number.isFinite(value));
  if (!finite.length) {
    return 0;
  }
  const avg = mean ?? averageNumericValues(finite);
  const variance = finite.reduce((sum, value) => sum + (value - avg) ** 2, 0) / finite.length;
  return Math.sqrt(Math.max(0, variance));
}

function averageNumericObject(objects) {
  const sums = {};
  const counts = {};
  for (const obj of objects) {
    if (!obj || typeof obj !== "object") {
      continue;
    }
    for (const [key, value] of Object.entries(obj)) {
      if (!Number.isFinite(value)) {
        continue;
      }
      sums[key] = (sums[key] ?? 0) + value;
      counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  const averaged = {};
  for (const key of Object.keys(sums)) {
    averaged[key] = sums[key] / Math.max(1, counts[key] ?? 1);
  }
  return averaged;
}

function sampleTimeSeriesAt(series, time, mode = "linear") {
  if (!Array.isArray(series) || !series.length) {
    return 0;
  }
  const first = series[0];
  const last = series[series.length - 1];
  if (time <= first.time + STATE_EPSILON) {
    return Number.isFinite(first.value) ? first.value : 0;
  }
  if (time >= last.time - STATE_EPSILON) {
    return Number.isFinite(last.value) ? last.value : 0;
  }
  for (let index = 1; index < series.length; index += 1) {
    const left = series[index - 1];
    const right = series[index];
    if (time > right.time + STATE_EPSILON) {
      continue;
    }
    const leftValue = Number.isFinite(left.value) ? left.value : 0;
    const rightValue = Number.isFinite(right.value) ? right.value : leftValue;
    if (mode === "step") {
      return time < right.time - STATE_EPSILON ? leftValue : rightValue;
    }
    const span = Math.max(STATE_EPSILON, right.time - left.time);
    const ratio = clamp((time - left.time) / span, 0, 1);
    return leftValue + (rightValue - leftValue) * ratio;
  }
  return Number.isFinite(last.value) ? last.value : 0;
}

function buildAverageTimeSeries(seriesList, durationSeconds, stepSeconds, mode = "linear") {
  const usable = (seriesList ?? []).filter((series) => Array.isArray(series) && series.length);
  if (!usable.length) {
    return [
      { time: 0, value: 0 },
      { time: roundToOneDecimal(durationSeconds), value: 0 }
    ];
  }
  const sampleStep = Math.max(STATE_EPSILON, stepSeconds);
  const sampleCount = Math.max(1, Math.ceil(durationSeconds / sampleStep));
  const points = [];
  for (let index = 0; index <= sampleCount; index += 1) {
    const time = Math.min(durationSeconds, index * sampleStep);
    let sum = 0;
    for (const series of usable) {
      sum += sampleTimeSeriesAt(series, time, mode);
    }
    points.push({
      time: roundToOneDecimal(time),
      value: sum / usable.length
    });
  }
  return points;
}

function compressStepSeries(points) {
  const merged = [];
  for (const point of points ?? []) {
    const time = roundToOneDecimal(clamp(point.time ?? 0, 0, Number.POSITIVE_INFINITY));
    const value = Number.isFinite(point.value) ? point.value : 0;
    const prev = merged[merged.length - 1];
    if (prev && Math.abs(prev.time - time) <= STATE_EPSILON) {
      prev.value = value;
      continue;
    }
    if (prev && Math.abs(prev.value - value) <= STATE_EPSILON) {
      continue;
    }
    merged.push({ time, value });
  }
  return merged;
}

function mergeWarningsFromRuns(results) {
  const seen = new Set();
  const merged = [];
  for (const entry of results ?? []) {
    for (const warning of entry?.warnings ?? []) {
      if (!warning || seen.has(warning)) {
        continue;
      }
      seen.add(warning);
      merged.push(warning);
    }
  }
  return merged;
}

function pickRepresentativeRun(results, meanHps) {
  if (!results?.length) {
    return null;
  }
  return results.reduce((best, current) => {
    if (!best) {
      return current;
    }
    const currentDelta = Math.abs((current?.totals?.totalHps ?? 0) - meanHps);
    const bestDelta = Math.abs((best?.totals?.totalHps ?? 0) - meanHps);
    return currentDelta < bestDelta ? current : best;
  }, null);
}

function ensureRngSeed(state) {
  if (!state) {
    return (Math.random() * 0x100000000) >>> 0;
  }
  if (!Number.isInteger(state.rngState)) {
    state.rngState = (Math.random() * 0x100000000) >>> 0;
  } else {
    state.rngState = state.rngState >>> 0;
  }
  return state.rngState;
}

function nextRandomUnit(state) {
  const current = ensureRngSeed(state);
  const next = (1664525 * current + 1013904223) >>> 0;
  if (state) {
    state.rngState = next;
  }
  return next / 0x100000000;
}

function rollChance(state, chance01, probabilityMode = DEFAULT_PROBABILITY_MODE) {
  const clamped = clamp(parseNumber(chance01, 0), 0, 1);
  if (probabilityMode !== "random") {
    return clamped;
  }
  return nextRandomUnit(state) < clamped ? 1 : 0;
}

function getLogCalibrationMultiplier(kind, spellKey) {
  if (!LOG_CALIBRATION_ENABLED) {
    return 1;
  }
  const table = LOG_CALIBRATION_MULTIPLIER[kind];
  if (!table) {
    return 1;
  }
  const raw = table[spellKey];
  if (!Number.isFinite(raw) || raw <= 0) {
    return 1;
  }
  return raw;
}

function scaleFromReferenceIntellect(value, intellect) {
  return value * (Math.max(0, intellect) / Math.max(1, REFERENCE_INTELLECT));
}

function getPenanceDamageBeforeConditionalBuffs(intellect) {
  return (
    Math.max(0, intellect) *
    PENANCE_DAMAGE_BASE_COEF_PER_INTELLECT *
    PENANCE_DAMAGE_TALENT_MULTIPLIER *
    PENANCE_DAMAGE_SECOND_BOLT_ADJUSTMENT_MULTIPLIER
  );
}

function getUltimatePenitenceDamageBeforeCalibration(intellect) {
  return (Math.max(0, intellect) * (DAMAGE_COEF.ultimatePenitence ?? 0)) / 100;
}

function getExpectedCritMultiplier(critChancePct, critMultiplier = DEFAULT_CRIT_MULTIPLIER) {
  const chance = clamp(parseNumber(critChancePct, DEFAULT_CRIT_CHANCE_PCT), 0, 100) / 100;
  return 1 + chance * (Math.max(1, critMultiplier) - 1);
}

function getSpellCritChancePct(spellKey, talentRuntime = DEFAULT_TALENT_RUNTIME) {
  const baseCritChancePct = clamp(
    parseNumber(talentRuntime?.critChancePct, DEFAULT_CRIT_CHANCE_PCT),
    0,
    100
  );
  const innerFocusBonusPct = clamp(
    parseNumber(talentRuntime?.innerFocusCritBonusPct, INNER_FOCUS_CRIT_BONUS_PCT),
    0,
    100
  );
  if (
    spellKey === SPELLS.flashHeal.key ||
    spellKey === SPELLS.powerWordShield.key ||
    spellKey === SPELLS.penance.key ||
    spellKey === SPELLS.powerWordRadiance.key
  ) {
    return clamp(baseCritChancePct + innerFocusBonusPct, 0, 100);
  }
  return baseCritChancePct;
}

function normalizeTalentRuntime(input = {}) {
  const chancePct = clamp(
    parseNumber(input.voidShieldProcChancePct, DEFAULT_TALENT_RUNTIME.voidShieldProcChancePct),
    0,
    100
  );
  const critChancePct = clamp(parseNumber(input.critChancePct, DEFAULT_CRIT_CHANCE_PCT), 0, 100);
  const innerFocusCritBonusPct = clamp(
    parseNumber(input.innerFocusCritBonusPct, DEFAULT_TALENT_RUNTIME.innerFocusCritBonusPct),
    0,
    100
  );
  const masteryAtonementTargetBonusPct = clamp(
    parseNumber(
      input.masteryAtonementTargetBonusPct,
      DEFAULT_TALENT_RUNTIME.masteryAtonementTargetBonusPct
    ),
    0,
    500
  );

  return {
    ...DEFAULT_TALENT_RUNTIME,
    ...input,
    voidShieldProcChancePct: chancePct,
    voidShieldProcChance: chancePct / 100,
    critChancePct,
    critMultiplier: parseNumber(input.critMultiplier, DEFAULT_CRIT_MULTIPLIER),
    expectedCritMultiplier: getExpectedCritMultiplier(critChancePct, parseNumber(input.critMultiplier, DEFAULT_CRIT_MULTIPLIER)),
    innerFocusCritBonusPct,
    masteryAtonementTargetBonusPct
  };
}

function roundToTwoDecimals(value) {
  return Math.round(value * 100) / 100;
}

function smoothTimeSeries(points, windowSeconds = 0) {
  if (!Array.isArray(points) || points.length < 3 || windowSeconds <= STATE_EPSILON) {
    return points ?? [];
  }

  const halfWindow = windowSeconds / 2;
  const smoothed = [];
  let left = 0;
  let right = 0;
  let sum = 0;

  for (let index = 0; index < points.length; index += 1) {
    const center = points[index].time;
    const minTime = center - halfWindow;
    const maxTime = center + halfWindow;

    while (left < points.length && points[left].time < minTime - STATE_EPSILON) {
      sum -= points[left].value;
      left += 1;
    }
    while (right < points.length && points[right].time <= maxTime + STATE_EPSILON) {
      sum += points[right].value;
      right += 1;
    }

    const count = Math.max(1, right - left);
    smoothed.push({
      ...points[index],
      value: sum / count
    });
  }

  return smoothed;
}

function resolveSpellManaCost({ spell, manaPool, manaCosts = null, manaPct = null, manaMultiplier = 1 }) {
  const mapPct = Number.isFinite(manaCosts?.[spell.key]) ? manaCosts[spell.key] : null;
  const pct = manaPct ?? mapPct ?? spell.manaPctEffective ?? spell.manaPctBacksolved ?? spell.manaPct ?? 0;
  const baseCost = manaPool * (pct / 100);
  return Math.max(0, baseCost * manaMultiplier);
}

function buildSpellSnapshot({
  manaPool,
  manaCosts,
  intellect,
  hastePct,
  transferTable
}) {
  const entries = Object.values(SPELLS).map((spell) => {
    const mana = resolveSpellManaCost({
      spell,
      manaPool,
      manaCosts
    });
    const castTime = resolveDuration(spell, hastePct, {
      evangelismRadianceCharges: 0
    });
    const directCoefPct = DIRECT_HEAL_COEF[spell.key] || 0;
    const damageCoefPct = DAMAGE_COEF[spell.key] || 0;
    const directHeal = (directCoefPct * intellect) / 100;
    const damage = (damageCoefPct * intellect) / 100;
    const transferAt5 = getTransferRate(transferTable, 5) / 100;
    const transferAt20 = getTransferRate(transferTable, 20) / 100;

    return {
      key: spell.key,
      name: spell.name,
      wowheadId: spell.wowheadId,
      manaFixed: Math.round(mana),
      manaPctOfCurrentPool: roundToTwoDecimals((mana / Math.max(1, manaPool)) * 100),
      manaPctBacksolvedFrom55125: roundToTwoDecimals((mana / OBSERVED_MANA_POOL_FOR_BACKSOLVE) * 100),
      wowheadPct: spell.manaPct,
      inferredBaseManaFromWowheadPct: spell.manaPct > 0 ? roundToTwoDecimals(mana / (spell.manaPct / 100)) : null,
      castTimeAtCurrentHasteSec: roundToTwoDecimals(castTime),
      directHealCoefPct: directCoefPct,
      damageCoefPct,
      directHealAtCurrentIntellect: roundToTwoDecimals(directHeal),
      damageAtCurrentIntellect: roundToTwoDecimals(damage),
      atonementHealPerTargetAt5: roundToTwoDecimals(damage * transferAt5),
      atonementTotalAt20Targets: roundToTwoDecimals(damage * 20 * transferAt20)
    };
  });

  const inferredBaseManaValues = entries
    .map((entry) => entry.inferredBaseManaFromWowheadPct)
    .filter((value) => typeof value === "number");
  const avgInferredBaseMana = inferredBaseManaValues.length
    ? roundToTwoDecimals(inferredBaseManaValues.reduce((sum, value) => sum + value, 0) / inferredBaseManaValues.length)
    : null;

  return {
    meta: {
      manaPool,
      observedPoolForBacksolve: OBSERVED_MANA_POOL_FOR_BACKSOLVE,
      intellect,
      hastePct,
      avgInferredBaseManaFromWowheadPct: avgInferredBaseMana,
      note: "현재 시뮬레이션은 사용자가 지정한 간편 마나 퍼센트 모델을 사용합니다."
    },
    spells: entries
  };
}

function getSpellDamagePerCastEstimate(
  spell,
  intellect,
  talentRuntime = DEFAULT_TALENT_RUNTIME,
  runtimeState = null
) {
  const critMultiplier = Math.max(1, parseNumber(talentRuntime.critMultiplier, DEFAULT_CRIT_MULTIPLIER));
  const spellCritChancePct = getSpellCritChancePct(spell.key, talentRuntime);
  const critMul = getExpectedCritMultiplier(spellCritChancePct, critMultiplier);
  const damageCalibration = getLogCalibrationMultiplier("damage", spell.key);
  const nextPenanceDamageMultiplier = runtimeState?.nextPenanceDamageMultiplier ?? 1;

  switch (spell.key) {
    case SPELLS.smite.key:
      return scaleFromReferenceIntellect(MEASURED_AT_REFERENCE_INTELLECT.smiteDamage, intellect) * damageCalibration * critMul;
    case SPELLS.penance.key:
      return (
        getPenanceDamageBeforeConditionalBuffs(intellect) *
        nextPenanceDamageMultiplier *
        damageCalibration *
        critMul
      );
    case SPELLS.ultimatePenitence.key:
      return (
        getUltimatePenitenceDamageBeforeCalibration(intellect) *
        damageCalibration *
        critMul
      );
    case SPELLS.mindBlast.key:
      return (
        scaleFromReferenceIntellect(MEASURED_AT_REFERENCE_INTELLECT.mindBlastDamage, intellect) *
        damageCalibration *
        critMul
      );
    default:
      return 0;
  }
}

function buildSpellFinalDebugRows({
  intellect,
  transferTable,
  talentRuntime = DEFAULT_TALENT_RUNTIME
}) {
  const noCritRuntime = normalizeTalentRuntime({
    ...talentRuntime,
    critChancePct: 0,
    innerFocusCritBonusPct: 0
  });
  const critMultiplier = Math.max(1, parseNumber(talentRuntime.critMultiplier, DEFAULT_CRIT_MULTIPLIER));

  const measuredDamageByKey = {
    [SPELLS.smite.key]: MEASURED_AT_REFERENCE_INTELLECT.smiteDamage,
    [SPELLS.penance.key]: MEASURED_AT_REFERENCE_INTELLECT.penanceCastTotalDamage,
    [SPELLS.ultimatePenitence.key]: MEASURED_AT_REFERENCE_INTELLECT.ultimatePenitenceBaseDamage,
    [SPELLS.mindBlast.key]: MEASURED_AT_REFERENCE_INTELLECT.mindBlastDamage
  };

  const measuredDirectByKey = {
    [SPELLS.powerWordShield.key]: MEASURED_AT_REFERENCE_INTELLECT.powerWordShieldAbsorb,
    [SPELLS.flashHeal.key]:
      MEASURED_AT_REFERENCE_INTELLECT.flashHealHealing *
      (1 + MEASURED_AT_REFERENCE_INTELLECT.flashHealSelfHealPctOfPrimary / 100),
    [SPELLS.powerWordRadiance.key]:
      MEASURED_AT_REFERENCE_INTELLECT.powerWordRadianceHealPerTarget *
      MEASURED_AT_REFERENCE_INTELLECT.powerWordRadianceTargetCount,
    [SPELLS.penance.key]: MEASURED_AT_REFERENCE_INTELLECT.penanceCastTotalDirectHealing
  };

  const targetSpells = [
    SPELLS.powerWordShield,
    SPELLS.flashHeal,
    SPELLS.powerWordRadiance,
    SPELLS.smite,
    SPELLS.penance,
    SPELLS.ultimatePenitence,
    SPELLS.mindBlast
  ];

  return targetSpells.map((spell) => {
    const neutralState = {
      nextPenanceDamageMultiplier: 1,
      nextShieldMultiplier: 1,
      nextShieldVoidProcChance: 0,
      nextShieldVoidProcTriggered: false,
      voidShieldExpectedCarry: 0,
      archangelBuffExpiresAt: Number.NEGATIVE_INFINITY
    };

    const measuredDamageBase = measuredDamageByKey[spell.key] ?? null;
    const measuredDirectBase = measuredDirectByKey[spell.key] ?? null;
    let damageBaseValue =
      measuredDamageBase == null ? null : scaleFromReferenceIntellect(measuredDamageBase, intellect);
    let directBaseValue =
      measuredDirectBase == null ? null : scaleFromReferenceIntellect(measuredDirectBase, intellect);
    let damageBaseCoefPct = measuredDamageBase == null ? null : (measuredDamageBase / Math.max(1, REFERENCE_INTELLECT)) * 100;
    let directBaseCoefPct = measuredDirectBase == null ? null : (measuredDirectBase / Math.max(1, REFERENCE_INTELLECT)) * 100;

    let damageTalentWeight = BASE_DAMAGE_COEF[spell.key]
      ? DAMAGE_COEF[spell.key] / Math.max(STATE_EPSILON, BASE_DAMAGE_COEF[spell.key])
      : null;
    const directTalentWeight = BASE_DIRECT_HEAL_COEF[spell.key]
      ? DIRECT_HEAL_COEF[spell.key] / Math.max(STATE_EPSILON, BASE_DIRECT_HEAL_COEF[spell.key])
      : null;
    // 현재 디버그 표의 최종값은 "실측값 기반 모델"이므로, 대부분의 특성 가중치는 이미 base에 내장되어 있다.
    // applied*는 최종값 계산 시 추가로 곱해지는 가중치(조건부 버프 등)를 뜻한다.
    let damageAppliedTalentWeight = 1;
    const directAppliedTalentWeight = spell.key === SPELLS.powerWordShield.key ? 1 : 1;

    if (spell.key === SPELLS.penance.key) {
      damageBaseValue = Math.max(0, intellect) * PENANCE_DAMAGE_BASE_COEF_PER_INTELLECT;
      damageBaseCoefPct = PENANCE_DAMAGE_BASE_COEF_PER_INTELLECT * 100;
      damageAppliedTalentWeight =
        PENANCE_DAMAGE_TALENT_MULTIPLIER * PENANCE_DAMAGE_SECOND_BOLT_ADJUSTMENT_MULTIPLIER;
      // 회개는 계수 기반 커스텀 모델을 사용하므로, embedded 값은 참고에서 제외한다.
      damageTalentWeight = null;
    }
    if (spell.key === SPELLS.ultimatePenitence.key) {
      const ultimateBaseCoefPct = BASE_DAMAGE_COEF.ultimatePenitence ?? 0;
      damageBaseCoefPct = ultimateBaseCoefPct;
      damageBaseValue = (Math.max(0, intellect) * ultimateBaseCoefPct) / 100;
      damageAppliedTalentWeight =
        ultimateBaseCoefPct > STATE_EPSILON
          ? (DAMAGE_COEF.ultimatePenitence ?? 0) / ultimateBaseCoefPct
          : 1;
      // 궁참도 계수 기반으로 표기하므로 embedded 분해는 사용하지 않는다.
      damageTalentWeight = null;
    }

    const damageCalibration = getLogCalibrationMultiplier("damage", spell.key);
    const directCalibration = getLogCalibrationMultiplier("direct", spell.key);
    const spellCritChancePct = getSpellCritChancePct(spell.key, talentRuntime);
    const directOnlyExpected = getSpellContributionComponents(
      spell,
      0,
      transferTable,
      intellect,
      talentRuntime,
      { ...neutralState },
      0,
      "expected"
    );
    const directOnlyNoCrit = getSpellContributionComponents(
      spell,
      0,
      transferTable,
      intellect,
      noCritRuntime,
      { ...neutralState },
      0,
      "expected"
    );
    const damagePerCastExpected = getSpellDamagePerCastEstimate(spell, intellect, talentRuntime, { ...neutralState });
    const damagePerCastNoCrit = getSpellDamagePerCastEstimate(spell, intellect, noCritRuntime, { ...neutralState });
    const damageCritWeight =
      damagePerCastNoCrit > STATE_EPSILON ? damagePerCastExpected / damagePerCastNoCrit : 1;
    const directCritWeight =
      directOnlyNoCrit.direct > STATE_EPSILON ? directOnlyExpected.direct / directOnlyNoCrit.direct : 1;

    const row = {
      key: spell.key,
      name: spell.name,
      damageBaseCoefPct,
      damageBaseValue,
      damageReferenceValue: measuredDamageBase,
      damageTalentWeightEmbedded: damageTalentWeight,
      damageAppliedTalentWeight,
      damageCalibration,
      damageCritWeight,
      damagePerCast: damagePerCastNoCrit,
      damagePerCastExpected,
      directBaseCoefPct,
      directBaseValue,
      directReferenceValue: measuredDirectBase,
      directTalentWeightEmbedded: directTalentWeight,
      directAppliedTalentWeight,
      directCalibration,
      directCritWeight,
      directPerCast: directOnlyNoCrit.direct,
      directPerCastExpected: directOnlyExpected.direct,
      note: null
    };

    if (spell.key === SPELLS.penance.key) {
      const penanceCritChancePct = getSpellCritChancePct(SPELLS.penance.key, talentRuntime);
      const penanceCritMul = getExpectedCritMultiplier(penanceCritChancePct, critMultiplier);
      const damageCalibration = getLogCalibrationMultiplier("damage", SPELLS.penance.key);
      const directCalibration = getLogCalibrationMultiplier("direct", SPELLS.penance.key);
      const baseDamage = Math.max(0, intellect) * PENANCE_DAMAGE_BASE_COEF_PER_INTELLECT;
      const talentAppliedDamage =
        baseDamage *
        PENANCE_DAMAGE_TALENT_MULTIPLIER *
        PENANCE_DAMAGE_SECOND_BOLT_ADJUSTMENT_MULTIPLIER;
      const finalDamage = talentAppliedDamage * damageCalibration * penanceCritMul;
      const baseHealing = scaleFromReferenceIntellect(MEASURED_AT_REFERENCE_INTELLECT.penanceCastTotalDirectHealing, intellect);
      const finalHealing = baseHealing * directCalibration * penanceCritMul;
      const damageMultiplier = baseDamage > STATE_EPSILON ? finalDamage / baseDamage : 0;
      const healingMultiplier = baseHealing > STATE_EPSILON ? finalHealing / baseHealing : 0;

      row.note = {
        baseDamage,
        talentAppliedDamage,
        modelBaseCoefPerIntellect: PENANCE_DAMAGE_BASE_COEF_PER_INTELLECT,
        modelTalentMultiplier: PENANCE_DAMAGE_TALENT_MULTIPLIER,
        modelSecondBoltAdjustmentMultiplier: PENANCE_DAMAGE_SECOND_BOLT_ADJUSTMENT_MULTIPLIER,
        finalDamage,
        damageMultiplier,
        baseHealing,
        finalHealing,
        healingMultiplier
      };
    }

    return row;
  });
}

function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

function formatSeconds(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatCompactAmount(value) {
  const safe = Math.max(0, Number.isFinite(value) ? value : 0);
  if (safe >= 1_000_000) {
    return `${(safe / 1_000_000).toFixed(2)}m`;
  }
  if (safe >= 1_000) {
    return `${(safe / 1_000).toFixed(1)}k`;
  }
  return `${Math.round(safe)}`;
}

function resolveAtonementSourceMultiplier(spellKey, talentRuntime = DEFAULT_TALENT_RUNTIME) {
  let multiplier = talentRuntime.apexAtonementHealingMultiplier ?? DEFAULT_TALENT_RUNTIME.apexAtonementHealingMultiplier;
  // 단순화: 고통을 제외한 나머지 피해 스킬은 동일하게 Prophet's Insight 배율을 받는다.
  if (spellKey !== SPELLS.shadowWordPain.key) {
    multiplier *=
      talentRuntime.prophetsInsightHolyAtonementMultiplier ??
      DEFAULT_TALENT_RUNTIME.prophetsInsightHolyAtonementMultiplier;
  }
  return Math.max(0, multiplier);
}

function resolveMasteryAtonementTargetMultiplier(talentRuntime = DEFAULT_TALENT_RUNTIME) {
  const masteryBonusPct = clamp(
    parseNumber(
      talentRuntime?.masteryAtonementTargetBonusPct,
      DEFAULT_TALENT_RUNTIME.masteryAtonementTargetBonusPct
    ),
    0,
    500
  );
  return Math.max(
    0,
    1 + masteryBonusPct / 100
  );
}

function buildTransferTable(maxTargets = ATONEMENT_TRANSFER_MAX_TARGETS) {
  const table = [];

  for (let count = 0; count <= maxTargets; count += 1) {
    let rate = ATONEMENT_TRANSFER_BASE_RATE_PCT;
    if (count > ATONEMENT_TRANSFER_BASE_TARGETS) {
      const ratio =
        (count - ATONEMENT_TRANSFER_BASE_TARGETS) /
        Math.max(1, ATONEMENT_TRANSFER_MAX_TARGETS - ATONEMENT_TRANSFER_BASE_TARGETS);
      rate =
        ATONEMENT_TRANSFER_BASE_RATE_PCT +
        (ATONEMENT_TRANSFER_MIN_RATE_AT_MAX_TARGETS_PCT - ATONEMENT_TRANSFER_BASE_RATE_PCT) * clamp(ratio, 0, 1);
    }
    table.push({
      count,
      rate
    });
  }

  return table.map((entry) => ({
    ...entry,
    rate: Math.round(entry.rate * 100) / 100
  }));
}

function getTransferRate(table, count) {
  return table[clamp(Math.round(count), 0, table.length - 1)]?.rate ?? 50;
}

function expireAtonements(expiries, currentTime) {
  return expiries.filter((expiresAt) => expiresAt > currentTime + 1e-6);
}

function extendAtonements(expiries, extensionSec) {
  if (extensionSec <= 0) {
    return expiries;
  }
  return expiries.map((expiresAt) => expiresAt + extensionSec);
}

function addAtonements(expiries, count, expiresAt, maxTargets) {
  if (count <= 0) {
    return expiries;
  }
  const safeMaxTargets = Math.max(1, Math.floor(maxTargets ?? 1));
  const next = [...expiries].sort((a, b) => a - b);

  // When capped, treat new applications as replacing the earliest-to-expire slots.
  // This avoids biasing the pool toward only long-duration entries.
  for (let index = 0; index < Math.floor(count); index += 1) {
    if (next.length >= safeMaxTargets) {
      next.shift();
    }
    next.push(expiresAt);
    next.sort((a, b) => a - b);
  }

  return next;
}

const SELF_TARGET_INDEX = 0;

function createAtonementSlots(maxTargets = MAJOR_ATONEMENT_MODEL.maxTargets ?? 20) {
  const safeMax = Math.max(1, Math.round(parseNumber(maxTargets, 20)));
  return Array.from({ length: safeMax }, () => 0);
}

function ensureAtonementSlots(state) {
  const maxTargets = Math.max(1, Math.round(parseNumber(MAJOR_ATONEMENT_MODEL.maxTargets, 20)));
  if (Array.isArray(state?.atonementSlots) && state.atonementSlots.length === maxTargets) {
    return state.atonementSlots;
  }
  const slots = createAtonementSlots(maxTargets);
  const expiries = [...(state?.atonementExpiries ?? [])].sort((a, b) => a - b);
  for (let index = 0; index < Math.min(expiries.length, slots.length); index += 1) {
    slots[index] = expiries[index];
  }
  if (state) {
    state.atonementSlots = slots;
  }
  return slots;
}

function expireAtonementSlots(slots, currentTime) {
  if (!Array.isArray(slots) || !slots.length) {
    return [];
  }
  const next = [...slots];
  for (let index = 0; index < next.length; index += 1) {
    if (next[index] <= currentTime + STATE_EPSILON) {
      next[index] = 0;
    }
  }
  return next;
}

function extendAtonementSlots(slots, extensionSec, currentTime) {
  if (!Array.isArray(slots) || !slots.length || extensionSec <= 0) {
    return Array.isArray(slots) ? [...slots] : [];
  }
  const next = [...slots];
  for (let index = 0; index < next.length; index += 1) {
    if (next[index] > currentTime + STATE_EPSILON) {
      next[index] += extensionSec;
    }
  }
  return next;
}

function buildAtonementExpiriesFromSlots(slots, currentTime = 0) {
  if (!Array.isArray(slots) || !slots.length) {
    return [];
  }
  return slots
    .filter((expiresAt) => expiresAt > currentTime + STATE_EPSILON)
    .sort((a, b) => a - b);
}

function syncAtonementCollections(state, currentTime = state?.time ?? 0) {
  const slots = ensureAtonementSlots(state);
  const expired = expireAtonementSlots(slots, currentTime);
  state.atonementSlots = expired;
  state.atonementExpiries = buildAtonementExpiriesFromSlots(expired, currentTime);
}

function pickAtonementTargets({
  slots,
  now,
  spellKey,
  applyCount,
  preference = "maximize_new",
  avoidSelfIfPossible = false
}) {
  const safeSlots = Array.isArray(slots) ? [...slots] : [];
  const targetCount = Math.min(Math.max(0, Math.floor(applyCount)), safeSlots.length);
  if (targetCount <= 0) {
    return [];
  }

  const selected = [];
  const selectedSet = new Set();
  const addTarget = (index) => {
    if (index < 0 || index >= safeSlots.length || selectedSet.has(index)) {
      return false;
    }
    selected.push(index);
    selectedSet.add(index);
    return true;
  };

  const requiresSelf = spellKey === SPELLS.flashHeal.key;
  if (requiresSelf && safeSlots.length > 0) {
    addTarget(SELF_TARGET_INDEX);
  }

  const candidates = [];
  for (let index = 0; index < safeSlots.length; index += 1) {
    if (selectedSet.has(index)) {
      continue;
    }
    if (requiresSelf && index === SELF_TARGET_INDEX && safeSlots.length > 1) {
      continue;
    }
    const wasActive = safeSlots[index] > now + STATE_EPSILON;
    candidates.push({
      index,
      wasActive,
      expiresAt: safeSlots[index]
    });
  }

  candidates.sort((left, right) => {
    const leftPrimary = preference === "maximize_refresh" ? (left.wasActive ? 0 : 1) : left.wasActive ? 1 : 0;
    const rightPrimary = preference === "maximize_refresh" ? (right.wasActive ? 0 : 1) : right.wasActive ? 1 : 0;
    if (leftPrimary !== rightPrimary) {
      return leftPrimary - rightPrimary;
    }
    if (avoidSelfIfPossible && left.index !== right.index) {
      if (left.index === SELF_TARGET_INDEX) {
        return 1;
      }
      if (right.index === SELF_TARGET_INDEX) {
        return -1;
      }
    }
    if (left.wasActive && right.wasActive && Math.abs(left.expiresAt - right.expiresAt) > STATE_EPSILON) {
      return left.expiresAt - right.expiresAt;
    }
    return left.index - right.index;
  });

  for (const candidate of candidates) {
    if (selected.length >= targetCount) {
      break;
    }
    addTarget(candidate.index);
  }

  return selected.slice(0, targetCount);
}

function calculateDirectMasteryCoverageByTargets({
  spellKey,
  slotsBefore,
  targetIndices,
  now
}) {
  if (!Array.isArray(targetIndices) || !targetIndices.length) {
    return null;
  }
  const wasAtoned = (index) => (slotsBefore?.[index] ?? 0) > now + STATE_EPSILON;

  if (spellKey === SPELLS.flashHeal.key) {
    const selfWeight = Math.max(0, (MEASURED_AT_REFERENCE_INTELLECT.flashHealSelfHealPctOfPrimary ?? 0) / 100);
    const primaryWeight = 1;
    const primaryIndex = targetIndices.find((index) => index !== SELF_TARGET_INDEX) ?? targetIndices[0];
    const selfIndex = targetIndices.includes(SELF_TARGET_INDEX) ? SELF_TARGET_INDEX : targetIndices[0];
    const weighted =
      (wasAtoned(primaryIndex) ? primaryWeight : 0) +
      (wasAtoned(selfIndex) ? selfWeight : 0);
    return weighted / Math.max(STATE_EPSILON, primaryWeight + selfWeight);
  }

  const covered = targetIndices.reduce((count, index) => count + (wasAtoned(index) ? 1 : 0), 0);
  return covered / Math.max(1, targetIndices.length);
}

function resolveAtonementApplyDuration(atonementModel, spellKey) {
  const baseDuration = atonementModel?.baseDurationSec ?? BASE_ATONEMENT_DURATION_SECONDS;
  const durationMultiplier = atonementModel?.applyDurationMultiplierBySpellKey?.[spellKey] ?? 1;
  const durationBonus = atonementModel?.applyDurationBonusBySpellKey?.[spellKey] ?? 0;
  return baseDuration * durationMultiplier + durationBonus;
}

function resolveAtonementApplyCount(
  atonementModel,
  spellKey,
  talentRuntime = DEFAULT_TALENT_RUNTIME,
  runtimeState = null
) {
  const baseCount = atonementModel?.applyCountBySpellKey?.[spellKey] ?? 0;
  let effectiveCount = baseCount;
  if (spellKey === SPELLS.powerWordShield.key) {
    const voidShieldTargetCount = Math.max(
      1,
      Math.round(
        parseNumber(
          talentRuntime?.voidShieldTargetCount,
          DEFAULT_TALENT_RUNTIME.voidShieldTargetCount
        )
      )
    );
    const voidShieldTriggered = Boolean(runtimeState?.nextShieldVoidProcTriggered);
    const extraTargetsIfTriggered = Math.max(0, voidShieldTargetCount - 1);
    effectiveCount = baseCount + (voidShieldTriggered ? extraTargetsIfTriggered : 0);
  }
  return Math.max(0, effectiveCount);
}

function resolveAtonementApplyPlan({
  slots,
  now,
  spellKey,
  applyCount,
  source = "major",
  preference = "maximize_new",
  expiresAt
}) {
  const safeSlots = Array.isArray(slots) ? [...slots] : [];
  const requestedCount = Math.max(0, Math.floor(applyCount));
  if (!requestedCount || !safeSlots.length) {
    return {
      slots: safeSlots,
      totalCount: 0,
      newCount: 0,
      refreshCount: 0,
      directMasteryCoverage: null,
      targetIndices: []
    };
  }

  const useRefreshPriority =
    source === "filler" &&
    FILLER_UNIQUE_ATONEMENT_TARGET_MODEL_ENABLED &&
    preference === "maximize_refresh";
  const targetPreference = useRefreshPriority ? "maximize_refresh" : "maximize_new";
  const selfCurrentlyAtoned = (safeSlots[SELF_TARGET_INDEX] ?? 0) > now + STATE_EPSILON;
  const avoidSelfIfPossible =
    source === "major" &&
    spellKey === SPELLS.powerWordShield.key &&
    !selfCurrentlyAtoned;
  const targetIndices = pickAtonementTargets({
    slots: safeSlots,
    now,
    spellKey,
    applyCount: requestedCount,
    preference: targetPreference,
    avoidSelfIfPossible
  });
  const slotsBefore = [...safeSlots];
  let newCount = 0;
  let refreshCount = 0;

  for (const index of targetIndices) {
    const wasActive = safeSlots[index] > now + STATE_EPSILON;
    if (wasActive) {
      refreshCount += 1;
    } else {
      newCount += 1;
    }
    safeSlots[index] = expiresAt;
  }

  const directMasteryCoverage = calculateDirectMasteryCoverageByTargets({
    spellKey,
    slotsBefore,
    targetIndices,
    now
  });

  return {
    slots: safeSlots,
    totalCount: targetIndices.length,
    newCount,
    refreshCount,
    directMasteryCoverage,
    targetIndices
  };
}

function resolveVoidShieldProcForShieldCast(
  runtimeState,
  talentRuntime = DEFAULT_TALENT_RUNTIME,
  probabilityMode = DEFAULT_PROBABILITY_MODE
) {
  if (!runtimeState) {
    return false;
  }
  const chance = clamp(parseNumber(runtimeState.nextShieldVoidProcChance, 0), 0, 1);
  if (probabilityMode === "random") {
    const triggered = nextRandomUnit(runtimeState) < chance;
    runtimeState.nextShieldVoidProcTriggered = triggered;
    return triggered;
  }
  const prevCarry = clamp(parseNumber(runtimeState.voidShieldExpectedCarry, 0), 0, 0.999999);
  const sum = prevCarry + chance;
  const triggered = sum >= 1 - STATE_EPSILON;
  runtimeState.voidShieldExpectedCarry = clamp(sum - (triggered ? 1 : 0), 0, 0.999999);
  runtimeState.nextShieldVoidProcTriggered = triggered;
  return triggered;
}

function resolveDuration(spell, hastePct, state) {
  const hasteMultiplier = Math.max(0.1, 1 + hastePct / 100);
  const gcdDuration = spell.usesGcd ? Math.max(GCD_MIN_SECONDS, GCD_BASE_SECONDS / hasteMultiplier) : 0;

  if (spell.castTimeSec > 0) {
    return Math.max(spell.castTimeSec / hasteMultiplier, gcdDuration);
  }

  if (spell.usesGcd) {
    return gcdDuration;
  }

  return 0;
}

function getPenanceRechargeSeconds(hastePct) {
  return PENANCE_RECHARGE_BASE_SECONDS / Math.max(0.1, 1 + hastePct / 100);
}

function getDueManaRefundByTime(refundEvents = [], time) {
  return refundEvents.reduce((sum, event) => (event.at <= time + STATE_EPSILON ? sum + event.amount : sum), 0);
}

function applyDueManaRefunds(state, now) {
  const events = state.manaRefundEvents ?? [];
  if (!events.length) {
    return;
  }

  let refunded = 0;
  const pending = [];
  for (const event of events) {
    if (event.at <= now + STATE_EPSILON) {
      refunded += event.amount;
    } else {
      pending.push(event);
    }
  }

  if (refunded > 0) {
    state.manaSpent = Math.max(0, state.manaSpent - refunded);
    state.manaRefunded = (state.manaRefunded ?? 0) + refunded;
  }
  state.manaRefundEvents = pending;
}

function getPainDotDamagePerSecond(intellect) {
  const perSecond = MEASURED_AT_REFERENCE_INTELLECT.shadowWordPainDotTotal16Sec / 16;
  return scaleFromReferenceIntellect(perSecond, intellect);
}

function applyPainDotContribution({
  state,
  fromTime,
  toTime,
  transferTable,
  intellect,
  talentRuntime = DEFAULT_TALENT_RUNTIME,
  probabilityMode = DEFAULT_PROBABILITY_MODE
}) {
  if (!state.painDotActive) {
    return;
  }
  if (toTime <= fromTime + STATE_EPSILON) {
    return;
  }

  syncAtonementCollections(state, fromTime);

  const painDps = getPainDotDamagePerSecond(intellect);
  const painCritChance =
    clamp(parseNumber(getSpellCritChancePct(SPELLS.shadowWordPain.key, talentRuntime), 0), 0, 100) / 100;
  const critMultiplier = Math.max(1, parseNumber(talentRuntime?.critMultiplier, DEFAULT_CRIT_MULTIPLIER));
  const expectedCritMul = getExpectedCritMultiplier(
    getSpellCritChancePct(SPELLS.shadowWordPain.key, talentRuntime),
    critMultiplier
  );
  const atonementSourceMultiplier = resolveAtonementSourceMultiplier(SPELLS.shadowWordPain.key, talentRuntime);
  const masteryMultiplier = resolveMasteryAtonementTargetMultiplier(talentRuntime);
  let cursor = fromTime;

  while (cursor < toTime - STATE_EPSILON) {
    const nextExpiry = (state.atonementExpiries ?? []).find((expiresAt) => expiresAt > cursor + STATE_EPSILON) ?? Number.POSITIVE_INFINITY;
    const nextArchangelBoundary = state.archangelBuffExpiresAt > cursor + STATE_EPSILON
      ? state.archangelBuffExpiresAt
      : Number.POSITIVE_INFINITY;
    const segmentEnd = Math.min(toTime, nextExpiry, nextArchangelBoundary);
    const segmentDuration = Math.max(0, segmentEnd - cursor);
    if (segmentDuration <= STATE_EPSILON) {
      cursor = segmentEnd;
      syncAtonementCollections(state, cursor);
      continue;
    }

    const activeAtonements = clamp((state.atonementExpiries ?? []).length, 0, MAJOR_ATONEMENT_MODEL.maxTargets ?? 20);
    const transferRate = getTransferRate(transferTable, activeAtonements) / 100;
    const archangelMultiplier = state.archangelBuffExpiresAt > cursor + STATE_EPSILON
      ? talentRuntime.archangelHealingShieldMultiplier ?? DEFAULT_TALENT_RUNTIME.archangelHealingShieldMultiplier
      : 1;
    let segmentHealing = 0;
    if (probabilityMode === "random") {
      let tickCursor = cursor;
      while (tickCursor < segmentEnd - STATE_EPSILON) {
        const tickEnd = Math.min(segmentEnd, tickCursor + 1);
        const tickDuration = Math.max(STATE_EPSILON, tickEnd - tickCursor);
        const critRolled = rollChance(state, painCritChance, "random");
        const critMul = critRolled > 0 ? critMultiplier : 1;
        const tickDamage = painDps * tickDuration * critMul;
        segmentHealing +=
          tickDamage *
          activeAtonements *
          transferRate *
          atonementSourceMultiplier *
          archangelMultiplier *
          masteryMultiplier;
        tickCursor = tickEnd;
      }
    } else {
      const segmentDamage = painDps * segmentDuration * expectedCritMul;
      segmentHealing =
        segmentDamage *
        activeAtonements *
        transferRate *
        atonementSourceMultiplier *
        archangelMultiplier *
        masteryMultiplier;
    }
    state.healingCoef += segmentHealing;

    cursor = segmentEnd;
    syncAtonementCollections(state, cursor);
  }
}

function syncChargeBank({
  state,
  now,
  chargeKey,
  rechargeAtKey,
  maxCharges,
  rechargeSeconds
}) {
  let charges = state[chargeKey] ?? maxCharges;
  let rechargeAt = state[rechargeAtKey] ?? null;

  if (charges >= maxCharges) {
    state[chargeKey] = maxCharges;
    state[rechargeAtKey] = null;
    return;
  }

  if (rechargeAt == null) {
    rechargeAt = now + rechargeSeconds;
  }

  while (rechargeAt != null && rechargeAt <= now + STATE_EPSILON && charges < maxCharges) {
    charges += 1;
    if (charges >= maxCharges) {
      rechargeAt = null;
      break;
    }
    rechargeAt += rechargeSeconds;
  }

  state[chargeKey] = Math.min(maxCharges, charges);
  state[rechargeAtKey] = rechargeAt;
}

function syncCooldownResources(state, now, hastePct) {
  syncChargeBank({
    state,
    now,
    chargeKey: "penanceCharges",
    rechargeAtKey: "penanceRechargeAt",
    maxCharges: PENANCE_MAX_CHARGES,
    rechargeSeconds: getPenanceRechargeSeconds(hastePct)
  });
  syncChargeBank({
    state,
    now,
    chargeKey: "radianceCharges",
    rechargeAtKey: "radianceRechargeAt",
    maxCharges: RADIANCE_MAX_CHARGES,
    rechargeSeconds: RADIANCE_RECHARGE_SECONDS
  });
}

function consumeCharge({
  state,
  now,
  chargeKey,
  rechargeAtKey,
  maxCharges,
  rechargeSeconds
}) {
  const current = state[chargeKey] ?? maxCharges;
  if (current < 1 - STATE_EPSILON) {
    return false;
  }

  const next = Math.max(0, current - 1);
  state[chargeKey] = next;
  if (next < maxCharges && state[rechargeAtKey] == null) {
    state[rechargeAtKey] = now + rechargeSeconds;
  }
  return true;
}

function getNextReadyTimeByCharge(state, chargeKey, rechargeAtKey, now) {
  const charges = state[chargeKey] ?? 0;
  if (charges >= 1 - STATE_EPSILON) {
    return now;
  }
  return state[rechargeAtKey] ?? Number.POSITIVE_INFINITY;
}

function canSpendRadianceAndKeepReserve({
  state,
  castEndTime,
  segmentEnd,
  reserveChargesBySegmentEnd = 0
}) {
  if (reserveChargesBySegmentEnd <= 0) {
    return true;
  }
  if (segmentEnd <= castEndTime + STATE_EPSILON) {
    return false;
  }

  const projected = {
    radianceCharges: state.radianceCharges ?? 0,
    radianceRechargeAt: state.radianceRechargeAt ?? null
  };

  syncChargeBank({
    state: projected,
    now: state.time,
    chargeKey: "radianceCharges",
    rechargeAtKey: "radianceRechargeAt",
    maxCharges: RADIANCE_MAX_CHARGES,
    rechargeSeconds: RADIANCE_RECHARGE_SECONDS
  });
  syncChargeBank({
    state: projected,
    now: castEndTime,
    chargeKey: "radianceCharges",
    rechargeAtKey: "radianceRechargeAt",
    maxCharges: RADIANCE_MAX_CHARGES,
    rechargeSeconds: RADIANCE_RECHARGE_SECONDS
  });

  const spent = consumeCharge({
    state: projected,
    now: castEndTime,
    chargeKey: "radianceCharges",
    rechargeAtKey: "radianceRechargeAt",
    maxCharges: RADIANCE_MAX_CHARGES,
    rechargeSeconds: RADIANCE_RECHARGE_SECONDS
  });
  if (!spent) {
    return false;
  }

  syncChargeBank({
    state: projected,
    now: segmentEnd,
    chargeKey: "radianceCharges",
    rechargeAtKey: "radianceRechargeAt",
    maxCharges: RADIANCE_MAX_CHARGES,
    rechargeSeconds: RADIANCE_RECHARGE_SECONDS
  });

  return (projected.radianceCharges ?? 0) + STATE_EPSILON >= reserveChargesBySegmentEnd;
}

function buildMajorChargeOffsets(type, hastePct) {
  const sequence = type === "apostle" ? APOSTLE_SEQUENCE : ULTIMATE_SEQUENCE;
  const penanceOffsets = [];
  const radianceOffsets = [];
  let elapsed = 0;

  for (const spell of sequence) {
    if (spell.key === SPELLS.penance.key) {
      penanceOffsets.push(elapsed);
    } else if (spell.key === SPELLS.powerWordRadiance.key) {
      radianceOffsets.push(elapsed);
    }

    elapsed += resolveDuration(spell, hastePct, {
      evangelismRadianceCharges: 0
    });
  }

  return {
    penanceOffsets,
    radianceOffsets
  };
}

function canConsumeChargeAtOffsets({
  state,
  segmentEnd,
  chargeKey,
  rechargeAtKey,
  maxCharges,
  rechargeSeconds,
  offsets = []
}) {
  if (!offsets.length) {
    return true;
  }

  const projected = {
    [chargeKey]: state[chargeKey] ?? maxCharges,
    [rechargeAtKey]: state[rechargeAtKey] ?? null
  };

  syncChargeBank({
    state: projected,
    now: state.time,
    chargeKey,
    rechargeAtKey,
    maxCharges,
    rechargeSeconds
  });
  syncChargeBank({
    state: projected,
    now: segmentEnd,
    chargeKey,
    rechargeAtKey,
    maxCharges,
    rechargeSeconds
  });

  for (const offset of offsets) {
    const castAt = segmentEnd + offset;
    syncChargeBank({
      state: projected,
      now: castAt,
      chargeKey,
      rechargeAtKey,
      maxCharges,
      rechargeSeconds
    });
    const ok = consumeCharge({
      state: projected,
      now: castAt,
      chargeKey,
      rechargeAtKey,
      maxCharges,
      rechargeSeconds
    });
    if (!ok) {
      return false;
    }
  }

  return true;
}

function canEnterUpcomingMajorWithoutChargeWait({
  state,
  segmentEnd,
  upcomingMajorType,
  hastePct
}) {
  if (!upcomingMajorType) {
    return true;
  }

  const offsets = buildMajorChargeOffsets(upcomingMajorType, hastePct);
  const penanceReady = canConsumeChargeAtOffsets({
    state,
    segmentEnd,
    chargeKey: "penanceCharges",
    rechargeAtKey: "penanceRechargeAt",
    maxCharges: PENANCE_MAX_CHARGES,
    rechargeSeconds: getPenanceRechargeSeconds(hastePct),
    offsets: offsets.penanceOffsets
  });
  if (!penanceReady) {
    return false;
  }

  return canConsumeChargeAtOffsets({
    state,
    segmentEnd,
    chargeKey: "radianceCharges",
    rechargeAtKey: "radianceRechargeAt",
    maxCharges: RADIANCE_MAX_CHARGES,
    rechargeSeconds: RADIANCE_RECHARGE_SECONDS,
    offsets: offsets.radianceOffsets
  });
}

function evaluateSequence({
  sequence,
  manaPool,
  manaCosts,
  intellect,
  hastePct,
  atonementCount = 0,
  transferTable,
  maxDuration = Number.POSITIVE_INFINITY,
  maxManaSpend = Number.POSITIVE_INFINITY,
  atonementModel = null,
  talentRuntime = DEFAULT_TALENT_RUNTIME,
  probabilityMode = "expected"
}) {
  const state = {
    evangelismRadianceCharges: 0,
    nextPenanceDamageMultiplier: 1,
    nextShieldMultiplier: 1,
    nextShieldVoidProcChance: 0,
    nextShieldVoidProcTriggered: false,
    voidShieldExpectedCarry: 0,
    archangelBuffExpiresAt: Number.NEGATIVE_INFINITY
  };
  let atonementExpiries = [];

  let elapsed = 0;
  let manaCost = 0;
  let manaCostPct = 0;
  let healingCoef = 0;
  let spellsCast = 0;
  const spellCounts = {};

  for (const spell of sequence) {
    const duration = resolveDuration(spell, hastePct, state);
    if (elapsed + duration > maxDuration + 1e-6) {
      break;
    }

    let manaMultiplier = 1;
    if (spell.key === SPELLS.powerWordRadiance.key && state.evangelismRadianceCharges > 0) {
      manaMultiplier = 0.6;
      state.evangelismRadianceCharges -= 1;
    }

    const spellManaCost = resolveSpellManaCost({
      spell,
      manaPool,
      manaCosts,
      manaMultiplier
    });
    if (manaCost + spellManaCost > maxManaSpend + 1e-6) {
      break;
    }

    elapsed += duration;
    manaCost += spellManaCost;
    manaCostPct += (spellManaCost / Math.max(1, manaPool)) * 100;

    if (spell.key === SPELLS.powerWordShield.key) {
      resolveVoidShieldProcForShieldCast(state, talentRuntime, probabilityMode);
    } else {
      state.nextShieldVoidProcTriggered = false;
    }

    if (atonementModel) {
      atonementExpiries = expireAtonements(atonementExpiries, elapsed);

      if (spell.key === SPELLS.evangelism.key) {
        atonementExpiries = extendAtonements(atonementExpiries, atonementModel.evangelismExtendSec ?? 0);
      }

      const applyCount = resolveAtonementApplyCount(
        atonementModel,
        spell.key,
        talentRuntime,
        state
      );
      if (applyCount > 0) {
        const spellAtonementDuration = resolveAtonementApplyDuration(atonementModel, spell.key);
        atonementExpiries = addAtonements(
          atonementExpiries,
          applyCount,
          elapsed + spellAtonementDuration,
          atonementModel.maxTargets ?? 20
        );
      }
    }

    const activeAtonementCount = atonementModel ? atonementExpiries.length : atonementCount;
    healingCoef += getSpellContribution(
      spell,
      activeAtonementCount,
      transferTable,
      intellect,
      talentRuntime,
      state,
      elapsed,
      probabilityMode
    );
    spellCounts[spell.key] = (spellCounts[spell.key] ?? 0) + 1;

    if (spell.key === SPELLS.evangelism.key) {
      state.evangelismRadianceCharges = 2;
      state.archangelBuffExpiresAt = Math.max(
        state.archangelBuffExpiresAt,
        elapsed + (talentRuntime.archangelBuffDurationSec ?? DEFAULT_TALENT_RUNTIME.archangelBuffDurationSec)
      );
    }
    if (spell.key === SPELLS.mindBlast.key) {
      state.nextPenanceDamageMultiplier =
        talentRuntime.followupPenanceDamageMultiplierAfterMindBlast ?? DEFAULT_TALENT_RUNTIME.followupPenanceDamageMultiplierAfterMindBlast;
    }
    if (spell.key === SPELLS.penance.key) {
      state.nextPenanceDamageMultiplier = 1;
      state.nextShieldMultiplier =
        talentRuntime.nextShieldMultiplierAfterPenance ?? DEFAULT_TALENT_RUNTIME.nextShieldMultiplierAfterPenance;
      state.nextShieldVoidProcChance = talentRuntime.voidShieldProcChance ?? DEFAULT_TALENT_RUNTIME.voidShieldProcChance;
      state.nextShieldVoidProcTriggered = false;
    }
    if (spell.key === SPELLS.powerWordShield.key) {
      state.nextShieldMultiplier = 1;
      state.nextShieldVoidProcChance = 0;
      state.nextShieldVoidProcTriggered = false;
    }

    spellsCast += 1;
  }

  return {
    duration: elapsed,
    manaCost,
    manaCostPct,
    healingCoef,
    spellsCast,
    spellCounts
  };
}

function calculateSequenceDuration(sequence, hastePct) {
  const state = {
    evangelismRadianceCharges: 0
  };

  let elapsed = 0;
  for (const spell of sequence) {
    elapsed += resolveDuration(spell, hastePct, state);
    if (spell.key === SPELLS.evangelism.key) {
      state.evangelismRadianceCharges = 2;
    } else if (spell.key === SPELLS.powerWordRadiance.key && state.evangelismRadianceCharges > 0) {
      state.evangelismRadianceCharges -= 1;
    }
  }

  return elapsed;
}

function getMajorPrepDuration(type, hastePct) {
  if (type === "apostle") {
    return calculateSequenceDuration(APOSTLE_PREP_SEQUENCE, hastePct);
  }
  return calculateSequenceDuration(ULTIMATE_PREP_SEQUENCE, hastePct);
}

function getOpeningPainDuration(hastePct) {
  return resolveDuration(SPELLS.shadowWordPain, hastePct, {
    evangelismRadianceCharges: 0
  });
}

function getMajorMarkerMinimum(type, hastePct) {
  return getOpeningPainDuration(hastePct) + getMajorPrepDuration(type, hastePct);
}

function buildDefaultCastTimes(durationSeconds, cooldownSeconds, minStart = 0) {
  const available = Math.max(0, durationSeconds - minStart);
  const count = Math.floor(available / cooldownSeconds) + 1;
  const times = Array.from({ length: count }, (_, index) => minStart + index * cooldownSeconds);
  return normalizeCastTimes(times, durationSeconds, cooldownSeconds, minStart);
}

function normalizeCastTimes(times, durationSeconds, cooldownSeconds, minStart = 0) {
  const sorted = [...times].sort((a, b) => a - b);

  for (let index = 0; index < sorted.length; index += 1) {
    const min = index === 0 ? minStart : sorted[index - 1] + cooldownSeconds;
    const max = durationSeconds - cooldownSeconds * (sorted.length - 1 - index);
    sorted[index] = clamp(sorted[index], min, max);
  }

  return sorted.map((value) => roundToOneDecimal(value));
}

function reconcileCastTimes(previous, durationSeconds, cooldownSeconds, minStart = 0) {
  const defaults = buildDefaultCastTimes(durationSeconds, cooldownSeconds, minStart);
  const merged = defaults.map((defaultValue, index) => {
    if (previous[index] == null) {
      return defaultValue;
    }
    return previous[index];
  });
  return normalizeCastTimes(merged, durationSeconds, cooldownSeconds, minStart);
}

function findCrossConflict(apostleTimes, ultimateTimes, minGapSeconds) {
  let best = null;

  for (let aIndex = 0; aIndex < apostleTimes.length; aIndex += 1) {
    for (let uIndex = 0; uIndex < ultimateTimes.length; uIndex += 1) {
      const delta = apostleTimes[aIndex] - ultimateTimes[uIndex];
      const distance = Math.abs(delta);
      if (distance >= minGapSeconds - 1e-6) {
        continue;
      }

      const violation = minGapSeconds - distance;
      if (!best || violation > best.violation) {
        best = {
          aIndex,
          uIndex,
          violation,
          apostleTime: apostleTimes[aIndex],
          ultimateTime: ultimateTimes[uIndex]
        };
      }
    }
  }

  return best;
}

function getTypeBounds(times, index, cooldownSeconds, durationSeconds, minStart = 0) {
  const lower = index === 0 ? minStart : times[index - 1] + cooldownSeconds;
  const upper = durationSeconds - cooldownSeconds * (times.length - 1 - index);
  return { lower, upper };
}

function buildConflictCandidates(currentValue, otherValue, minGapSeconds, bounds) {
  const leftTarget = roundToOneDecimal(otherValue - minGapSeconds);
  const rightTarget = roundToOneDecimal(otherValue + minGapSeconds);
  const candidates = [];

  if (leftTarget >= bounds.lower - 1e-6 && leftTarget <= bounds.upper + 1e-6) {
    candidates.push(leftTarget);
  }
  if (rightTarget >= bounds.lower - 1e-6 && rightTarget <= bounds.upper + 1e-6) {
    candidates.push(rightTarget);
  }

  if (!candidates.length) {
    candidates.push(bounds.lower);
    if (Math.abs(bounds.upper - bounds.lower) > STATE_EPSILON) {
      candidates.push(bounds.upper);
    }
  }

  return candidates.sort((a, b) => Math.abs(a - currentValue) - Math.abs(b - currentValue));
}

function pickConflictCandidate(candidates, currentValue, otherValue, minGapSeconds) {
  if (!candidates.length) {
    return {
      value: currentValue,
      move: 0,
      canResolve: false
    };
  }

  const resolving = candidates.filter((candidate) => Math.abs(candidate - otherValue) >= minGapSeconds - STATE_EPSILON);
  const pool = resolving.length ? resolving : candidates;
  const ordered = [...pool].sort((a, b) => Math.abs(a - currentValue) - Math.abs(b - currentValue));
  const selected = ordered[0];

  return {
    value: selected,
    move: Math.abs(selected - currentValue),
    canResolve: resolving.length > 0
  };
}

function enforceCrossMajorGap({
  apostleTimes,
  ultimateTimes,
  durationSeconds,
  apostleMinStart,
  ultimateMinStart,
  minGapSeconds
}) {
  let nextApostle = normalizeCastTimes(apostleTimes, durationSeconds, APOSTLE_COOLDOWN_SECONDS, apostleMinStart);
  let nextUltimate = normalizeCastTimes(ultimateTimes, durationSeconds, ULTIMATE_COOLDOWN_SECONDS, ultimateMinStart);

  for (let iteration = 0; iteration < 80; iteration += 1) {
    const conflict = findCrossConflict(nextApostle, nextUltimate, minGapSeconds);
    if (!conflict) {
      break;
    }

    const apostleBounds = getTypeBounds(nextApostle, conflict.aIndex, APOSTLE_COOLDOWN_SECONDS, durationSeconds, apostleMinStart);
    const ultimateBounds = getTypeBounds(nextUltimate, conflict.uIndex, ULTIMATE_COOLDOWN_SECONDS, durationSeconds, ultimateMinStart);

    const apostleCandidates = buildConflictCandidates(
      nextApostle[conflict.aIndex],
      nextUltimate[conflict.uIndex],
      minGapSeconds,
      apostleBounds
    );
    const ultimateCandidates = buildConflictCandidates(
      nextUltimate[conflict.uIndex],
      nextApostle[conflict.aIndex],
      minGapSeconds,
      ultimateBounds
    );

    const apostleChoice = pickConflictCandidate(
      apostleCandidates,
      nextApostle[conflict.aIndex],
      nextUltimate[conflict.uIndex],
      minGapSeconds
    );
    const ultimateChoice = pickConflictCandidate(
      ultimateCandidates,
      nextUltimate[conflict.uIndex],
      nextApostle[conflict.aIndex],
      minGapSeconds
    );

    const prevA = nextApostle[conflict.aIndex];
    const prevU = nextUltimate[conflict.uIndex];

    const shouldMoveApostle =
      apostleChoice.canResolve && !ultimateChoice.canResolve
        ? true
        : !apostleChoice.canResolve && ultimateChoice.canResolve
          ? false
          : apostleChoice.move <= ultimateChoice.move;

    if (shouldMoveApostle) {
      nextApostle[conflict.aIndex] = apostleChoice.value;
      nextApostle = normalizeCastTimes(nextApostle, durationSeconds, APOSTLE_COOLDOWN_SECONDS, apostleMinStart);
      if (Math.abs(nextApostle[conflict.aIndex] - prevA) <= STATE_EPSILON) {
        nextUltimate[conflict.uIndex] = ultimateChoice.value;
        nextUltimate = normalizeCastTimes(nextUltimate, durationSeconds, ULTIMATE_COOLDOWN_SECONDS, ultimateMinStart);
      }
    } else {
      nextUltimate[conflict.uIndex] = ultimateChoice.value;
      nextUltimate = normalizeCastTimes(nextUltimate, durationSeconds, ULTIMATE_COOLDOWN_SECONDS, ultimateMinStart);
      if (Math.abs(nextUltimate[conflict.uIndex] - prevU) <= STATE_EPSILON) {
        nextApostle[conflict.aIndex] = apostleChoice.value;
        nextApostle = normalizeCastTimes(nextApostle, durationSeconds, APOSTLE_COOLDOWN_SECONDS, apostleMinStart);
      }
    }

    if (
      Math.abs(nextApostle[conflict.aIndex] - prevA) <= STATE_EPSILON &&
      Math.abs(nextUltimate[conflict.uIndex] - prevU) <= STATE_EPSILON
    ) {
      break;
    }
  }

  return {
    apostleTimes: nextApostle,
    ultimateTimes: nextUltimate
  };
}

function cullUltimateTimesByApostlePriority(apostleTimes, ultimateTimes, minGapSeconds) {
  const nextUltimate = [];
  const dropped = [];

  for (let index = 0; index < ultimateTimes.length; index += 1) {
    const ultimateTime = ultimateTimes[index];
    const conflictIndex = apostleTimes.findIndex(
      (apostleTime) => Math.abs(apostleTime - ultimateTime) < minGapSeconds - STATE_EPSILON
    );
    if (conflictIndex >= 0) {
      dropped.push({
        index,
        time: ultimateTime,
        apostleIndex: conflictIndex,
        apostleTime: apostleTimes[conflictIndex]
      });
      continue;
    }
    nextUltimate.push(ultimateTime);
  }

  return {
    ultimateTimes: nextUltimate,
    dropped
  };
}

function sumSegmentsDuration(segments = []) {
  return segments.reduce((acc, segment) => acc + Math.max(0, segment.end - segment.start), 0);
}

function createEmptyFillerWindow(index, start, end) {
  return {
    id: `filler-window-${index + 1}`,
    start,
    end,
    radianceCount: 0,
    shieldCount: 0,
    flashHealCount: 0,
    pleaCount: 0,
    smiteCount: 0,
    mandatoryPenanceCount: 0,
    mandatoryShieldCount: 0,
    mindBlastCount: 0,
    manaUsed: 0,
    healingCoef: 0,
    mandatoryManaUsed: 0,
    optionalManaUsed: 0,
    mandatoryHealingCoef: 0,
    optionalHealingCoef: 0
  };
}

function buildInitialSimulationState() {
  return {
    time: 0,
    manaSpent: 0,
    manaRefunded: 0,
    manaRefundEvents: [],
    healingCoef: 0,
    castCount: 0,
    painDotActive: false,
    atonementSlots: createAtonementSlots(),
    atonementExpiries: [],
    penanceCharges: PENANCE_MAX_CHARGES,
    penanceRechargeAt: null,
    nextMindBlastReadyAt: 0,
    radianceCharges: RADIANCE_MAX_CHARGES,
    radianceRechargeAt: null,
    nextPenanceDamageMultiplier: 1,
    nextShieldMultiplier: 1,
    nextShieldVoidProcChance: 0,
    nextShieldVoidProcTriggered: false,
    voidShieldExpectedCarry: 0,
    archangelBuffExpiresAt: Number.NEGATIVE_INFINITY,
    majorCoreMisses: 0,
    majorChargeWaitSec: 0,
    fillerWindows: [],
    majorEvents: [],
    warnings: [],
    trace: {
      prev: null,
      time: 0,
      manaSpent: 0,
      healingCoef: 0,
      atonementCount: 0,
      atonementSlots: createAtonementSlots(),
      atonementExpiries: [],
      healingDelta: 0,
      directDelta: 0,
      atonementDelta: 0,
      directBreakdown: null,
      kind: "start",
      source: "system",
      spellKey: null,
      tag: null
    }
  };
}

function cloneState(state) {
  return {
    ...state,
    atonementSlots: [...ensureAtonementSlots(state)],
    atonementExpiries: [...state.atonementExpiries],
    manaRefundEvents: (state.manaRefundEvents ?? []).map((event) => ({ ...event })),
    fillerWindows: state.fillerWindows.map((window) => ({ ...window })),
    majorEvents: state.majorEvents.map((event) => ({ ...event })),
    warnings: [...state.warnings],
    trace: state.trace
  };
}

function appendTracePoint(state, kind, details = {}) {
  state.trace = {
    prev: state.trace,
    time: state.time,
    manaSpent: state.manaSpent,
    healingCoef: state.healingCoef,
    atonementCount: details.atonementCount ?? state.atonementExpiries?.length ?? 0,
    atonementSlots: [...(details.atonementSlots ?? state.atonementSlots ?? [])],
    atonementExpiries: [...(details.atonementExpiries ?? state.atonementExpiries ?? [])],
    healingDelta: details.healingDelta ?? 0,
    directDelta: details.directDelta ?? 0,
    atonementDelta: details.atonementDelta ?? 0,
    directBreakdown: details.directBreakdown ?? null,
    kind,
    source: details.source ?? null,
    spellKey: details.spellKey ?? null,
    tag: details.tag ?? null
  };
}

function appendWarning(state, text) {
  if (!state.warnings.includes(text)) {
    state.warnings.push(text);
  }
}

function normalizeStateAtonement(state, hastePct = 0) {
  applyDueManaRefunds(state, state.time);
  syncAtonementCollections(state, state.time);
  syncCooldownResources(state, state.time, hastePct);
  return state;
}

function touchFillerWindow(state, windowIndex, start, end) {
  if (windowIndex == null) {
    return null;
  }
  if (!state.fillerWindows[windowIndex]) {
    state.fillerWindows[windowIndex] = createEmptyFillerWindow(windowIndex, start, end);
  } else {
    state.fillerWindows[windowIndex].start = Math.min(state.fillerWindows[windowIndex].start, start);
    state.fillerWindows[windowIndex].end = Math.max(state.fillerWindows[windowIndex].end, end);
  }
  return state.fillerWindows[windowIndex];
}

function compareSimulationState(candidate, current) {
  if (!current) {
    return true;
  }
  if ((candidate.majorCoreMisses ?? 0) < (current.majorCoreMisses ?? 0)) {
    return true;
  }
  if ((candidate.majorCoreMisses ?? 0) > (current.majorCoreMisses ?? 0)) {
    return false;
  }
  if ((candidate.majorChargeWaitSec ?? 0) < (current.majorChargeWaitSec ?? 0) - STATE_EPSILON) {
    return true;
  }
  if ((candidate.majorChargeWaitSec ?? 0) > (current.majorChargeWaitSec ?? 0) + STATE_EPSILON) {
    return false;
  }
  const baseHealing = Math.max(1, candidate.healingCoef, current.healingCoef);
  const healingCloseAbs = Math.max(STATE_EPSILON, baseHealing * HEALING_CLOSE_RATIO_FOR_MANA_PREF);
  const healingDiff = candidate.healingCoef - current.healingCoef;

  if (healingDiff > healingCloseAbs) {
    return true;
  }
  if (Math.abs(healingDiff) <= healingCloseAbs) {
    if ((candidate.castCount ?? 0) > (current.castCount ?? 0)) {
      return true;
    }
    if ((candidate.castCount ?? 0) < (current.castCount ?? 0)) {
      return false;
    }
    if (candidate.manaSpent > current.manaSpent + STATE_EPSILON) {
      return true;
    }
    if (Math.abs(candidate.manaSpent - current.manaSpent) <= STATE_EPSILON && candidate.time < current.time - STATE_EPSILON) {
      return true;
    }
  } else if (healingDiff > STATE_EPSILON) {
    return true;
  }
  return false;
}

function buildSimulationStateKey(state, manaBudget) {
  const manaBucketSize = Math.max(STATE_KEY_MANA_BUCKET_FLOOR, manaBudget / STATE_KEY_MANA_BUCKET_DIVISOR);
  const manaBucket = Math.round(state.manaSpent / manaBucketSize);
  const timeBucket = Math.round(state.time * STATE_KEY_TIME_BUCKETS_PER_SECOND) / STATE_KEY_TIME_BUCKETS_PER_SECOND;
  const penanceCharges = Math.round((state.penanceCharges ?? 0) * STATE_KEY_CHARGE_PRECISION) / STATE_KEY_CHARGE_PRECISION;
  const penanceRemain = (state.penanceRechargeAt == null || (state.penanceCharges ?? 0) >= PENANCE_MAX_CHARGES)
    ? 0
    : Math.round(Math.max(0, state.penanceRechargeAt - state.time) * STATE_KEY_REMAIN_ROUND_PER_SECOND) /
    STATE_KEY_REMAIN_ROUND_PER_SECOND;
  const mindBlastRemain =
    Math.round(Math.max(0, state.nextMindBlastReadyAt - state.time) * STATE_KEY_REMAIN_ROUND_PER_SECOND) /
    STATE_KEY_REMAIN_ROUND_PER_SECOND;
  const radianceCharges =
    Math.round((state.radianceCharges ?? 0) * STATE_KEY_CHARGE_PRECISION) / STATE_KEY_CHARGE_PRECISION;
  const radianceRemain = (state.radianceRechargeAt == null || (state.radianceCharges ?? 0) >= RADIANCE_MAX_CHARGES)
    ? 0
    : Math.round(Math.max(0, state.radianceRechargeAt - state.time) * STATE_KEY_REMAIN_ROUND_PER_SECOND) /
    STATE_KEY_REMAIN_ROUND_PER_SECOND;
  const atonementCount = state.atonementExpiries.length;
  const nextPenanceBuff = Math.round((state.nextPenanceDamageMultiplier ?? 1) * 100) / 100;
  const nextShieldBuff = Math.round((state.nextShieldMultiplier ?? 1) * 100) / 100;
  const nextShieldVoidChance = Math.round((state.nextShieldVoidProcChance ?? 0) * 100) / 100;
  const voidShieldCarry = Math.round((state.voidShieldExpectedCarry ?? 0) * 100) / 100;
  const archangelRemain = state.archangelBuffExpiresAt > state.time
    ? Math.round(Math.max(0, state.archangelBuffExpiresAt - state.time) * STATE_KEY_REMAIN_ROUND_PER_SECOND) /
    STATE_KEY_REMAIN_ROUND_PER_SECOND
    : 0;
  const pendingRefundNear = Math.round(
    getDueManaRefundByTime(state.manaRefundEvents ?? [], state.time + STATE_KEY_PENDING_REFUND_LOOKAHEAD_SECONDS) -
    getDueManaRefundByTime(state.manaRefundEvents ?? [], state.time)
  );
  const castBucket = Math.round((state.castCount ?? 0) / STATE_KEY_CAST_BUCKET_DIVISOR);
  const majorChargeWaitBucket =
    Math.round((state.majorChargeWaitSec ?? 0) * STATE_KEY_REMAIN_ROUND_PER_SECOND) / STATE_KEY_REMAIN_ROUND_PER_SECOND;
  const firstExpires = state.atonementExpiries
    .slice(0, 4)
    .map(
      (expiresAt) =>
        Math.round((expiresAt - state.time) * STATE_KEY_REMAIN_ROUND_PER_SECOND) /
        STATE_KEY_REMAIN_ROUND_PER_SECOND
    )
    .join(",");
  const majorCoreMisses = state.majorCoreMisses ?? 0;
  return [
    majorCoreMisses,
    majorChargeWaitBucket,
    timeBucket,
    manaBucket,
    penanceCharges,
    penanceRemain,
    mindBlastRemain,
    radianceCharges,
    radianceRemain,
    atonementCount,
    nextPenanceBuff,
    nextShieldBuff,
    nextShieldVoidChance,
    voidShieldCarry,
    archangelRemain,
    pendingRefundNear,
    castBucket,
    firstExpires
  ].join("|");
}

function pruneSimulationStates(states, manaBudget, beamWidth, hastePct = 0) {
  const bestByKey = new Map();

  for (const original of states) {
    const state = normalizeStateAtonement(original, hastePct);
    const key = buildSimulationStateKey(state, manaBudget);
    const existing = bestByKey.get(key);
    if (compareSimulationState(state, existing)) {
      bestByKey.set(key, state);
    }
  }

  const deduped = [...bestByKey.values()].sort((a, b) => {
    if ((a.majorCoreMisses ?? 0) !== (b.majorCoreMisses ?? 0)) {
      return (a.majorCoreMisses ?? 0) - (b.majorCoreMisses ?? 0);
    }
    if ((a.majorChargeWaitSec ?? 0) !== (b.majorChargeWaitSec ?? 0)) {
      return (a.majorChargeWaitSec ?? 0) - (b.majorChargeWaitSec ?? 0);
    }
    if (a.healingCoef !== b.healingCoef) {
      return b.healingCoef - a.healingCoef;
    }
    if ((a.castCount ?? 0) !== (b.castCount ?? 0)) {
      return (b.castCount ?? 0) - (a.castCount ?? 0);
    }
    if (a.manaSpent !== b.manaSpent) {
      return b.manaSpent - a.manaSpent;
    }
    return a.time - b.time;
  });

  if (deduped.length <= beamWidth) {
    return deduped;
  }

  const manaBucketSize = Math.max(PRUNING_MANA_BUCKET_FLOOR, manaBudget / PRUNING_MANA_BUCKET_DIVISOR);
  const bucketCounts = new Map();
  const selected = [];
  for (const state of deduped) {
    const bucket = Math.floor(state.manaSpent / manaBucketSize);
    const count = bucketCounts.get(bucket) ?? 0;
    if (count < PER_MANA_BUCKET_LIMIT || selected.length < Math.floor(beamWidth * PRUNING_MINIMUM_KEEP_RATIO)) {
      selected.push(state);
      bucketCounts.set(bucket, count + 1);
    }
    if (selected.length >= beamWidth) {
      break;
    }
  }

  if (selected.length < beamWidth) {
    const selectedSet = new Set(selected);
    for (const state of deduped) {
      if (selectedSet.has(state)) {
        continue;
      }
      selected.push(state);
      if (selected.length >= beamWidth) {
        break;
      }
    }
  }

  return selected.slice(0, beamWidth);
}

function getSpellContributionComponents(
  spell,
  activeAtonementCount,
  transferTable,
  intellect,
  talentRuntime = DEFAULT_TALENT_RUNTIME,
  runtimeState = null,
  castEndTime = 0,
  probabilityMode = DEFAULT_PROBABILITY_MODE,
  options = null
) {
  const cappedAtonementCount = clamp(activeAtonementCount, 0, MAJOR_ATONEMENT_MODEL.maxTargets ?? 20);
  const transferRate = getTransferRate(transferTable, cappedAtonementCount) / 100;
  const critMultiplier = Math.max(1, parseNumber(talentRuntime.critMultiplier, DEFAULT_CRIT_MULTIPLIER));
  const spellCritChancePct = getSpellCritChancePct(spell.key, talentRuntime);
  const spellCritChance = spellCritChancePct / 100;
  const expectedCritMul = getExpectedCritMultiplier(spellCritChancePct, critMultiplier);
  const critRolled = rollChance(runtimeState, spellCritChance, probabilityMode);
  const spellCritMul = probabilityMode === "random" ? (critRolled > 0 ? critMultiplier : 1) : expectedCritMul;
  const directCalibration = getLogCalibrationMultiplier("direct", spell.key);
  const damageCalibration = getLogCalibrationMultiplier("damage", spell.key);
  const nextPenanceDamageMultiplier = runtimeState?.nextPenanceDamageMultiplier ?? 1;
  const nextShieldMultiplier = runtimeState?.nextShieldMultiplier ?? 1;

  let direct = 0;
  let atonementHealing = 0;
  const directBreakdown = {};
  const addDirect = (key, amount) => {
    if (amount <= STATE_EPSILON) {
      return;
    }
    directBreakdown[key] = (directBreakdown[key] ?? 0) + amount;
  };

  switch (spell.key) {
    case SPELLS.shadowWordPain.key: {
      const instantDamage =
        scaleFromReferenceIntellect(MEASURED_AT_REFERENCE_INTELLECT.shadowWordPainInstantDamage, intellect) *
        damageCalibration;
      atonementHealing += instantDamage * spellCritMul * cappedAtonementCount * transferRate;
      break;
    }
    case SPELLS.powerWordShield.key: {
      const shieldValue = scaleFromReferenceIntellect(MEASURED_AT_REFERENCE_INTELLECT.powerWordShieldAbsorb, intellect);
      const voidShieldTriggered = Boolean(runtimeState?.nextShieldVoidProcTriggered);
      const voidShieldTargetCount = Math.max(
        1,
        parseNumber(
          talentRuntime.voidShieldTargetCount,
          DEFAULT_TALENT_RUNTIME.voidShieldTargetCount
        )
      );
      const voidShieldShieldMultiplier = Math.max(
        1,
        parseNumber(
          talentRuntime.voidShieldShieldMultiplier,
          DEFAULT_TALENT_RUNTIME.voidShieldShieldMultiplier
        )
      );
      const baseShieldDirect = shieldValue * nextShieldMultiplier * directCalibration * spellCritMul;
      if (voidShieldTriggered) {
        // Proc case: keep base shield in "보호막", and attribute only additional gain to "공허 보호막".
        const totalShieldFactor = Math.max(1, voidShieldTargetCount * voidShieldShieldMultiplier);
        const extraFactor = Math.max(0, totalShieldFactor - 1);
        const voidShieldBonus = baseShieldDirect * extraFactor;
        direct += baseShieldDirect;
        addDirect(SPELLS.powerWordShield.key, baseShieldDirect);
        if (voidShieldBonus > STATE_EPSILON) {
          direct += voidShieldBonus;
          addDirect("voidShield", voidShieldBonus);
        }
      } else {
        direct += baseShieldDirect;
        addDirect(SPELLS.powerWordShield.key, baseShieldDirect);
      }
      break;
    }
    case SPELLS.flashHeal.key: {
      const baseFlashHeal = scaleFromReferenceIntellect(MEASURED_AT_REFERENCE_INTELLECT.flashHealHealing, intellect);
      const selfHealPct = Math.max(0, MEASURED_AT_REFERENCE_INTELLECT.flashHealSelfHealPctOfPrimary ?? 0) / 100;
      const totalFlashDirectBase = baseFlashHeal * (1 + selfHealPct);
      const flashDirect = totalFlashDirectBase * spellCritMul * directCalibration;
      direct += flashDirect;
      addDirect(SPELLS.flashHeal.key, flashDirect);
      // 아이기스: 직접 치유 치명 시 치유량의 30%를 보호막으로 추가
      const aegisFromFlash =
        probabilityMode === "random"
          ? critRolled > 0
            ? totalFlashDirectBase * directCalibration * critMultiplier * AEGIS_FROM_CRIT_DIRECT_HEAL_MULTIPLIER
            : 0
          : totalFlashDirectBase *
          directCalibration *
          spellCritChance *
          critMultiplier *
          AEGIS_FROM_CRIT_DIRECT_HEAL_MULTIPLIER;
      direct += aegisFromFlash;
      addDirect("aegis", aegisFromFlash);
      break;
    }
    case SPELLS.plea.key: {
      const pleaDirect =
        scaleFromReferenceIntellect(MEASURED_AT_REFERENCE_INTELLECT.pleaHealing, intellect) * spellCritMul * directCalibration;
      direct += pleaDirect;
      addDirect(SPELLS.plea.key, pleaDirect);
      break;
    }
    case SPELLS.powerWordRadiance.key: {
      const totalRadiance =
        MEASURED_AT_REFERENCE_INTELLECT.powerWordRadianceHealPerTarget * MEASURED_AT_REFERENCE_INTELLECT.powerWordRadianceTargetCount;
      const radianceDirect = scaleFromReferenceIntellect(totalRadiance, intellect) * spellCritMul * directCalibration;
      direct += radianceDirect;
      addDirect(SPELLS.powerWordRadiance.key, radianceDirect);
      break;
    }
    case SPELLS.evangelism.key: {
      // 전도(사도)는 직접 치유를 발생시키지 않고, 속죄 지속 연장/버프 효과로만 반영한다.
      break;
    }
    case SPELLS.mindBlast.key: {
      const damage = scaleFromReferenceIntellect(MEASURED_AT_REFERENCE_INTELLECT.mindBlastDamage, intellect) * damageCalibration;
      atonementHealing += damage * spellCritMul * cappedAtonementCount * transferRate;
      break;
    }
    case SPELLS.smite.key: {
      const damage = scaleFromReferenceIntellect(MEASURED_AT_REFERENCE_INTELLECT.smiteDamage, intellect) * damageCalibration;
      atonementHealing += damage * spellCritMul * cappedAtonementCount * transferRate;
      break;
    }
    case SPELLS.ultimatePenitence.key: {
      // 궁참은 계수 기반 모델(지능*최종 계수)로 계산하고, WCL 보정/치명 기대를 후단에서 적용한다.
      const baseDamage = getUltimatePenitenceDamageBeforeCalibration(intellect) * damageCalibration;
      atonementHealing +=
        baseDamage *
        spellCritMul *
        cappedAtonementCount *
        transferRate;
      break;
    }
    case SPELLS.penance.key: {
      const allyHeal =
        scaleFromReferenceIntellect(MEASURED_AT_REFERENCE_INTELLECT.penanceCastTotalDirectHealing, intellect) * spellCritMul;
      const enemyDamage =
        getPenanceDamageBeforeConditionalBuffs(intellect) *
        nextPenanceDamageMultiplier *
        damageCalibration;
      const penanceAtonementPerTarget =
        scaleFromReferenceIntellect(MEASURED_AT_REFERENCE_INTELLECT.penanceCastFlatAtonementPerTarget, intellect) *
        nextPenanceDamageMultiplier;

      direct += allyHeal * directCalibration;
      addDirect(SPELLS.penance.key, allyHeal * directCalibration);
      atonementHealing += enemyDamage * spellCritMul * cappedAtonementCount * transferRate;
      atonementHealing += penanceAtonementPerTarget * cappedAtonementCount;
      // 회개의 캐스트 직접 치유 총합 치명에도 아이기스 적용
      const basePenanceAllyHeal = scaleFromReferenceIntellect(
        MEASURED_AT_REFERENCE_INTELLECT.penanceCastTotalDirectHealing,
        intellect
      );
      const aegisFromPenance =
        probabilityMode === "random"
          ? critRolled > 0
            ? basePenanceAllyHeal * directCalibration * critMultiplier * AEGIS_FROM_CRIT_DIRECT_HEAL_MULTIPLIER
            : 0
          : basePenanceAllyHeal *
          directCalibration *
          spellCritChance *
          critMultiplier *
          AEGIS_FROM_CRIT_DIRECT_HEAL_MULTIPLIER;
      direct += aegisFromPenance;
      addDirect("aegis", aegisFromPenance);
      break;
    }
    default: {
      break;
    }
  }

  const archangelMultiplier = runtimeState && runtimeState.archangelBuffExpiresAt > castEndTime + STATE_EPSILON
    ? talentRuntime.archangelHealingShieldMultiplier ?? DEFAULT_TALENT_RUNTIME.archangelHealingShieldMultiplier
    : 1;
  const atonementSourceMultiplier = resolveAtonementSourceMultiplier(spell.key, talentRuntime);
  const masteryMultiplier = resolveMasteryAtonementTargetMultiplier(talentRuntime);
  const directMasteryCoverage = clamp(
    parseNumber(options?.directMasteryCoverage, cappedAtonementCount > 0 ? 1 : 0),
    0,
    1
  );
  const directMasteryMultiplier = 1 + (masteryMultiplier - 1) * directMasteryCoverage;

  // 직접치유/흡수는 실제 "속죄가 걸린 대상" 커버리지 비율(directMasteryCoverage)로 특화를 가중 적용.
  const directFinal = direct * archangelMultiplier * directMasteryMultiplier;
  const atonementFinal =
    atonementHealing *
    atonementSourceMultiplier *
    archangelMultiplier *
    masteryMultiplier;
  const directBreakdownFinal = Object.entries(directBreakdown).reduce((acc, [key, value]) => {
    const scaled = value * archangelMultiplier * directMasteryMultiplier;
    if (scaled > STATE_EPSILON) {
      acc[key] = scaled;
    }
    return acc;
  }, {});
  return {
    direct: directFinal,
    atonement: atonementFinal,
    total: directFinal + atonementFinal,
    directBreakdown: directBreakdownFinal
  };
}

function getSpellContribution(
  spell,
  activeAtonementCount,
  transferTable,
  intellect,
  talentRuntime = DEFAULT_TALENT_RUNTIME,
  runtimeState = null,
  castEndTime = 0,
  probabilityMode = DEFAULT_PROBABILITY_MODE
) {
  return getSpellContributionComponents(
    spell,
    activeAtonementCount,
    transferTable,
    intellect,
    talentRuntime,
    runtimeState,
    castEndTime,
    probabilityMode
  ).total;
}

function waitUntil(
  state,
  nextTime,
  windowIndex,
  windowStart,
  windowEnd,
  hastePct = 0,
  transferTable = null,
  intellect = 0,
  talentRuntime = DEFAULT_TALENT_RUNTIME,
  waitMeta = null,
  probabilityMode = DEFAULT_PROBABILITY_MODE
) {
  if (nextTime <= state.time + STATE_EPSILON) {
    return false;
  }
  const beforeHealing = state.healingCoef;
  if (transferTable) {
    applyPainDotContribution({
      state,
      fromTime: state.time,
      toTime: nextTime,
      transferTable,
      intellect,
      talentRuntime,
      probabilityMode
    });
  }
  state.time = nextTime;
  normalizeStateAtonement(state, hastePct);
  const waitHealingDelta = Math.max(0, state.healingCoef - beforeHealing);
  touchFillerWindow(state, windowIndex, windowStart, windowEnd);
  appendTracePoint(state, "wait", {
    source: waitMeta?.source ?? (waitHealingDelta > STATE_EPSILON ? "dot" : "wait"),
    tag: waitMeta?.reason ?? "idleOther",
    spellKey: waitHealingDelta > STATE_EPSILON ? SPELLS.shadowWordPain.key : null,
    healingDelta: waitHealingDelta,
    directDelta: 0,
    atonementDelta: waitHealingDelta,
    atonementCount: state.atonementExpiries?.length ?? 0,
    atonementSlots: state.atonementSlots,
    atonementExpiries: state.atonementExpiries
  });
  return true;
}

function applySpellToState({
  state,
  spell,
  duration,
  manaPct,
  manaMultiplier = 1,
  castEndLimit,
  maxManaAtCastEnd = null,
  manaPool,
  manaCosts,
  intellect,
  hastePct,
  manaRegenPerSecond = 0,
  maxSpendBySegmentEnd = null,
  maxSpendByFightEnd = null,
  manaBudget,
  transferTable,
  atonementModel,
  talentRuntime = DEFAULT_TALENT_RUNTIME,
  probabilityMode = DEFAULT_PROBABILITY_MODE,
  atonementApplyPreference = "maximize_new",
  windowIndex = null,
  windowStart = 0,
  windowEnd = 0,
  source = "filler",
  tag = "optional"
}) {
  applyDueManaRefunds(state, state.time);
  syncAtonementCollections(state, state.time);
  syncCooldownResources(state, state.time, hastePct);

  // Hard rule: after Penance, the very next cast must be Shield.
  const requiresShieldFollowup = (state.nextShieldMultiplier ?? 1) > 1 + STATE_EPSILON;
  if (requiresShieldFollowup && spell.key !== SPELLS.powerWordShield.key) {
    return false;
  }

  // Shadow Word: Pain is fixed as opener-only in this simulator.
  if (spell.key === SPELLS.shadowWordPain.key && source !== "setup") {
    return false;
  }

  if (spell.key === SPELLS.penance.key && (state.penanceCharges ?? 0) < 1 - STATE_EPSILON) {
    return false;
  }
  if (spell.key === SPELLS.powerWordRadiance.key && (state.radianceCharges ?? 0) < 1 - STATE_EPSILON) {
    return false;
  }

  const nextTime = state.time + duration;
  if (nextTime > castEndLimit + STATE_EPSILON) {
    return false;
  }

  if (spell.key === SPELLS.penance.key) {
    // If Penance is cast, ensure there is still enough room for mandatory Shield follow-up.
    const nextShieldMultiplierAfterPenance =
      talentRuntime.nextShieldMultiplierAfterPenance ?? DEFAULT_TALENT_RUNTIME.nextShieldMultiplierAfterPenance;
    if (nextShieldMultiplierAfterPenance > 1 + STATE_EPSILON) {
      const shieldDurationAfterPenance = resolveDuration(SPELLS.powerWordShield, hastePct, {
        evangelismRadianceCharges: 0
      });
      if (nextTime + shieldDurationAfterPenance > castEndLimit + STATE_EPSILON) {
        return false;
      }
    }
  }

  const manaCost = resolveSpellManaCost({
    spell,
    manaPool,
    manaCosts,
    manaPct,
    manaMultiplier
  });
  const dueNow = getDueManaRefundByTime(state.manaRefundEvents, state.time);
  const dueByCastEnd = getDueManaRefundByTime(state.manaRefundEvents, nextTime);
  const refundDuringCast = dueByCastEnd - dueNow;
  const spendAfterCast = state.manaSpent - refundDuringCast + manaCost;
  const dynamicSpendCapAtCastEnd = manaPool + manaRegenPerSecond * nextTime;
  if (spendAfterCast > dynamicSpendCapAtCastEnd + STATE_EPSILON) {
    return false;
  }
  if (maxManaAtCastEnd != null && spendAfterCast > maxManaAtCastEnd + STATE_EPSILON) {
    return false;
  }
  if (maxSpendBySegmentEnd != null && spendAfterCast > maxSpendBySegmentEnd + STATE_EPSILON) {
    return false;
  }
  if (maxSpendByFightEnd != null && spendAfterCast > maxSpendByFightEnd + STATE_EPSILON) {
    return false;
  }
  if (spendAfterCast > manaBudget + STATE_EPSILON) {
    return false;
  }

  if (spell.key === SPELLS.shadowWordPain.key && !state.painDotActive) {
    state.painDotActive = true;
  }

  if (spell.key === SPELLS.powerWordShield.key) {
    resolveVoidShieldProcForShieldCast(state, talentRuntime, probabilityMode);
  } else {
    state.nextShieldVoidProcTriggered = false;
  }

  applyPainDotContribution({
    state,
    fromTime: state.time,
    toTime: nextTime,
    transferTable,
    intellect,
    talentRuntime,
    probabilityMode
  });
  let slotsAtCastEnd = expireAtonementSlots([...ensureAtonementSlots(state)], nextTime);
  if (spell.key === SPELLS.evangelism.key && atonementModel) {
    slotsAtCastEnd = extendAtonementSlots(slotsAtCastEnd, atonementModel.evangelismExtendSec ?? 0, nextTime);
  }
  const expiriesAtCastEnd = buildAtonementExpiriesFromSlots(slotsAtCastEnd, nextTime);
  const activeAtonementCount = expiriesAtCastEnd.length;
  const applyCount = resolveAtonementApplyCount(
    atonementModel,
    spell.key,
    talentRuntime,
    state
  );
  const spellAtonementDuration =
    applyCount > 0 ? resolveAtonementApplyDuration(atonementModel, spell.key) : 0;
  const applyPlan = resolveAtonementApplyPlan({
    slots: slotsAtCastEnd,
    now: nextTime,
    spellKey: spell.key,
    applyCount,
    source,
    preference: atonementApplyPreference,
    expiresAt: nextTime + spellAtonementDuration
  });
  const directMasteryCoverage =
    applyPlan.totalCount > 0
      ? applyPlan.directMasteryCoverage
      : activeAtonementCount > 0
        ? 1
        : 0;
  const contribution = getSpellContributionComponents(
    spell,
    activeAtonementCount,
    transferTable,
    intellect,
    talentRuntime,
    state,
    nextTime,
    probabilityMode,
    {
      directMasteryCoverage
    }
  );
  const healingCoef = contribution.total;

  state.time = nextTime;
  applyDueManaRefunds(state, state.time);
  state.manaSpent += manaCost;
  state.healingCoef += healingCoef;
  state.castCount = (state.castCount ?? 0) + 1;
  state.atonementSlots = applyPlan.slots ?? slotsAtCastEnd;
  state.atonementExpiries = buildAtonementExpiriesFromSlots(state.atonementSlots, state.time);

  syncCooldownResources(state, nextTime, hastePct);
  if (spell.key === SPELLS.penance.key) {
    consumeCharge({
      state,
      now: nextTime,
      chargeKey: "penanceCharges",
      rechargeAtKey: "penanceRechargeAt",
      maxCharges: PENANCE_MAX_CHARGES,
      rechargeSeconds: getPenanceRechargeSeconds(hastePct)
    });
  }
  if (spell.key === SPELLS.powerWordRadiance.key) {
    consumeCharge({
      state,
      now: nextTime,
      chargeKey: "radianceCharges",
      rechargeAtKey: "radianceRechargeAt",
      maxCharges: RADIANCE_MAX_CHARGES,
      rechargeSeconds: RADIANCE_RECHARGE_SECONDS
    });
  }

  appendTracePoint(state, spell.key, {
    source,
    spellKey: spell.key,
    tag,
    healingDelta: healingCoef,
    directDelta: contribution.direct,
    atonementDelta: contribution.atonement,
    directBreakdown: contribution.directBreakdown,
    atonementCount: state.atonementExpiries?.length ?? 0,
    atonementSlots: state.atonementSlots,
    atonementExpiries: state.atonementExpiries
  });

  if (spell.key === SPELLS.mindBlast.key) {
    state.nextMindBlastReadyAt = nextTime + MIND_BLAST_COOLDOWN_SECONDS;
    state.nextPenanceDamageMultiplier =
      talentRuntime.followupPenanceDamageMultiplierAfterMindBlast ?? DEFAULT_TALENT_RUNTIME.followupPenanceDamageMultiplierAfterMindBlast;
  }
  if (spell.key === SPELLS.penance.key) {
    state.nextPenanceDamageMultiplier = 1;
    state.nextShieldMultiplier =
      talentRuntime.nextShieldMultiplierAfterPenance ?? DEFAULT_TALENT_RUNTIME.nextShieldMultiplierAfterPenance;
    state.nextShieldVoidProcChance = talentRuntime.voidShieldProcChance ?? DEFAULT_TALENT_RUNTIME.voidShieldProcChance;
    state.nextShieldVoidProcTriggered = false;
  }
  if (spell.key === SPELLS.powerWordShield.key) {
    state.nextShieldMultiplier = 1;
    state.nextShieldVoidProcChance = 0;
    state.nextShieldVoidProcTriggered = false;
    state.manaRefundEvents.push({
      at: nextTime + (talentRuntime.shieldManaRefundDelaySec ?? DEFAULT_TALENT_RUNTIME.shieldManaRefundDelaySec),
      amount: manaPool * ((talentRuntime.shieldManaRefundPct ?? DEFAULT_TALENT_RUNTIME.shieldManaRefundPct) / 100)
    });
  }
  if (spell.key === SPELLS.evangelism.key) {
    state.archangelBuffExpiresAt = Math.max(
      state.archangelBuffExpiresAt,
      nextTime + (talentRuntime.archangelBuffDurationSec ?? DEFAULT_TALENT_RUNTIME.archangelBuffDurationSec)
    );
  }

  const window = touchFillerWindow(state, windowIndex, windowStart, windowEnd);
  if (window) {
    window.manaUsed += manaCost;
    window.healingCoef += healingCoef;

    if (tag === "mandatoryPenance" || tag === "penance") {
      window.mandatoryPenanceCount += 1;
      window.mandatoryManaUsed += manaCost;
      window.mandatoryHealingCoef += healingCoef;
    } else if (tag === "mandatoryShield" || tag === "shieldAfterPenance") {
      window.mandatoryShieldCount += 1;
      window.mandatoryManaUsed += manaCost;
      window.mandatoryHealingCoef += healingCoef;
    } else if (tag === "mindBlast") {
      window.mindBlastCount += 1;
      window.optionalManaUsed += manaCost;
      window.optionalHealingCoef += healingCoef;
    } else if (tag === "radiance") {
      window.radianceCount += 1;
      window.optionalManaUsed += manaCost;
      window.optionalHealingCoef += healingCoef;
    } else if (tag === "shield") {
      window.shieldCount += 1;
      window.optionalManaUsed += manaCost;
      window.optionalHealingCoef += healingCoef;
    } else if (tag === "flashHeal") {
      window.flashHealCount += 1;
      window.optionalManaUsed += manaCost;
      window.optionalHealingCoef += healingCoef;
    } else if (tag === "plea") {
      window.pleaCount += 1;
      window.optionalManaUsed += manaCost;
      window.optionalHealingCoef += healingCoef;
    } else if (tag === "smite") {
      window.smiteCount += 1;
      window.optionalManaUsed += manaCost;
      window.optionalHealingCoef += healingCoef;
    }
  }

  return true;
}

function buildTimelineFromTrace(trace, durationSeconds, manaPool, manaRegenPerSecond = 0) {
  const interpolateCumulativeHealing = (timeline, time) => {
    if (!timeline.length) {
      return 0;
    }
    const clampedTime = clamp(time, 0, durationSeconds);
    if (clampedTime <= timeline[0].time + STATE_EPSILON) {
      return timeline[0].healingCoef;
    }
    const last = timeline[timeline.length - 1];
    if (clampedTime >= last.time - STATE_EPSILON) {
      return last.healingCoef;
    }

    for (let index = 1; index < timeline.length; index += 1) {
      const left = timeline[index - 1];
      const right = timeline[index];
      if (clampedTime > right.time + STATE_EPSILON) {
        continue;
      }
      const span = Math.max(STATE_EPSILON, right.time - left.time);
      const ratio = clamp((clampedTime - left.time) / span, 0, 1);
      return left.healingCoef + (right.healingCoef - left.healingCoef) * ratio;
    }
    return last.healingCoef;
  };

  const nodes = [];
  let cursor = trace;
  while (cursor) {
    nodes.push(cursor);
    cursor = cursor.prev;
  }

  const chronological = nodes.reverse();
  const fillerRadianceTimes = [];
  const mindBlastTimes = [];
  const spellEvents = [];
  const atonementCountTimeline = [];

  for (let index = 0; index < chronological.length; index += 1) {
    const point = chronological[index];
    atonementCountTimeline.push({
      time: roundToOneDecimal(clamp(point.time, 0, durationSeconds)),
      value: Math.max(0, Number.isFinite(point.atonementCount) ? point.atonementCount : 0)
    });

    if (point.spellKey === SPELLS.powerWordRadiance.key && point.source === "filler") {
      fillerRadianceTimes.push(roundToOneDecimal(point.time));
    }
    if (point.spellKey === SPELLS.mindBlast.key) {
      mindBlastTimes.push(roundToOneDecimal(point.time));
    }

    if (index > 0 && point.spellKey) {
      const prevPoint = chronological[index - 1];
      const dt = Math.max(STATE_EPSILON, point.time - prevPoint.time);
      const deltaHealing = Math.max(
        0,
        Number.isFinite(point.healingDelta) ? point.healingDelta : point.healingCoef - prevPoint.healingCoef
      );
      if (deltaHealing <= STATE_EPSILON) {
        continue;
      }
      spellEvents.push({
        time: roundToOneDecimal(point.time),
        spellKey: point.spellKey,
        source: point.source ?? null,
        deltaHealing,
        directDelta: Math.max(0, Number.isFinite(point.directDelta) ? point.directDelta : deltaHealing),
        atonementDelta: Math.max(0, Number.isFinite(point.atonementDelta) ? point.atonementDelta : 0),
        directBreakdown: point.directBreakdown ?? null,
        castDuration: dt,
        castRate: deltaHealing / dt
      });
    }
  }

  const merged = [];
  for (const point of chronological) {
    const clampedTime = clamp(point.time, 0, durationSeconds);
    const existing = merged[merged.length - 1];
    if (existing && Math.abs(existing.time - clampedTime) <= STATE_EPSILON) {
      existing.manaSpent = point.manaSpent;
      existing.healingCoef = point.healingCoef;
      continue;
    }
    merged.push({
      time: clampedTime,
      manaSpent: point.manaSpent,
      healingCoef: point.healingCoef
    });
  }

  if (!merged.length || merged[0].time > 0) {
    merged.unshift({
      time: 0,
      manaSpent: 0,
      healingCoef: 0
    });
  }

  const lastPoint = merged[merged.length - 1];
  if (lastPoint.time < durationSeconds - STATE_EPSILON) {
    merged.push({
      time: durationSeconds,
      manaSpent: lastPoint.manaSpent,
      healingCoef: lastPoint.healingCoef
    });
  }

  const atonementMerged = [];
  for (const point of atonementCountTimeline) {
    const existing = atonementMerged[atonementMerged.length - 1];
    if (existing && Math.abs(existing.time - point.time) <= STATE_EPSILON) {
      existing.value = point.value;
      continue;
    }
    atonementMerged.push(point);
  }
  if (!atonementMerged.length || atonementMerged[0].time > 0) {
    atonementMerged.unshift({ time: 0, value: 0 });
  }
  const atonementLast = atonementMerged[atonementMerged.length - 1];
  if (atonementLast.time < durationSeconds - STATE_EPSILON) {
    atonementMerged.push({ time: durationSeconds, value: atonementLast.value });
  }

  const rateSampleStep = TIMELINE_RATE_SAMPLE_STEP_SECONDS;
  const rollingWindow = Math.max(rateSampleStep, TIMELINE_HPS_ROLLING_WINDOW_SECONDS);
  const rateSamples = [];
  const sampleCount = Math.max(1, Math.ceil(durationSeconds / rateSampleStep));
  for (let sampleIndex = 0; sampleIndex <= sampleCount; sampleIndex += 1) {
    const sampleTime = Math.min(durationSeconds, sampleIndex * rateSampleStep);
    const windowStart = Math.max(0, sampleTime - rollingWindow);
    const windowSpan = Math.max(STATE_EPSILON, sampleTime - windowStart);
    const currentHealing = interpolateCumulativeHealing(merged, sampleTime);
    const pastHealing = interpolateCumulativeHealing(merged, windowStart);
    const sampleRate = Math.max(0, (currentHealing - pastHealing) / windowSpan);

    const roundedTime = roundToOneDecimal(sampleTime);
    const last = rateSamples[rateSamples.length - 1];
    if (last && Math.abs(last.time - roundedTime) <= STATE_EPSILON) {
      last.value = sampleRate;
    } else {
      rateSamples.push({
        time: roundedTime,
        value: sampleRate
      });
    }
  }
  const smoothedRateSamples = smoothTimeSeries(rateSamples, HEALING_GRAPH_SMOOTHING_SECONDS);

  return {
    mana: merged.map((point) => ({
      time: roundToOneDecimal(point.time),
      value: manaPool + manaRegenPerSecond * point.time - point.manaSpent
    })),
    healingRate: smoothedRateSamples,
    healingRateRaw: rateSamples,
    atonementCount: atonementMerged,
    casts: {
      fillerRadianceTimes,
      mindBlastTimes
    },
    debug: {
      spellEvents
    }
  };
}

function summarizeCastsFromTrace(trace, durationSeconds) {
  const nodes = [];
  let cursor = trace;
  while (cursor) {
    nodes.push(cursor);
    cursor = cursor.prev;
  }
  const chronological = nodes.reverse();

  let totalCasts = 0;
  let activeCastTimeSec = 0;
  const castsBySpell = {};

  for (let index = 1; index < chronological.length; index += 1) {
    const prev = chronological[index - 1];
    const point = chronological[index];
    const isCastPoint = point.spellKey && point.kind !== "wait" && point.source !== "dot";
    if (!isCastPoint) {
      continue;
    }

    totalCasts += 1;
    castsBySpell[point.spellKey] = (castsBySpell[point.spellKey] ?? 0) + 1;
    activeCastTimeSec += Math.max(0, point.time - prev.time);
  }

  const fightSeconds = Math.max(0, durationSeconds);
  const idleTimeSec = Math.max(0, fightSeconds - activeCastTimeSec);
  const fightMinutes = Math.max(fightSeconds / 60, STATE_EPSILON);
  return {
    totalCasts,
    castsPerMinute: totalCasts / fightMinutes,
    castsBySpell,
    activeCastTimeSec,
    idleTimeSec,
    idlePct: fightSeconds > STATE_EPSILON ? (idleTimeSec / fightSeconds) * 100 : 0
  };
}

function summarizeIdleReasonsFromTrace(trace, durationSeconds, expectedIdleSec = null) {
  const nodes = [];
  let cursor = trace;
  while (cursor) {
    nodes.push(cursor);
    cursor = cursor.prev;
  }
  const chronological = nodes.reverse();

  const byReason = new Map();
  let idleByWaitPoints = 0;

  for (let index = 1; index < chronological.length; index += 1) {
    const prev = chronological[index - 1];
    const point = chronological[index];
    if (point.kind !== "wait") {
      continue;
    }

    const duration = Math.max(0, point.time - prev.time);
    if (duration <= STATE_EPSILON) {
      continue;
    }
    idleByWaitPoints += duration;
    const reasonKey = point.tag ?? "idleOther";
    const current = byReason.get(reasonKey) ?? { key: reasonKey, seconds: 0, count: 0 };
    current.seconds += duration;
    current.count += 1;
    byReason.set(reasonKey, current);
  }

  const totalIdleSec = Math.max(
    0,
    Number.isFinite(expectedIdleSec) ? expectedIdleSec : idleByWaitPoints
  );
  const remainder = Math.max(0, totalIdleSec - idleByWaitPoints);
  if (remainder > STATE_EPSILON) {
    const current = byReason.get("idleOther") ?? { key: "idleOther", seconds: 0, count: 0 };
    current.seconds += remainder;
    byReason.set("idleOther", current);
  }

  const reasons = [...byReason.values()]
    .map((entry) => ({
      ...entry,
      label: IDLE_REASON_LABELS[entry.key] ?? IDLE_REASON_LABELS.idleOther,
      pctOfIdle: totalIdleSec > STATE_EPSILON ? (entry.seconds / totalIdleSec) * 100 : 0,
      pctOfFight: durationSeconds > STATE_EPSILON ? (entry.seconds / durationSeconds) * 100 : 0
    }))
    .sort((a, b) => b.seconds - a.seconds);

  return {
    totalIdleSec,
    reasons
  };
}

function buildActionTimelineFromTrace(
  trace,
  durationSeconds,
  manaPool = 0,
  manaRegenPerSecond = 0,
  intellect = DEFAULT_INTELLECT
) {
  const nodes = [];
  let cursor = trace;
  while (cursor) {
    nodes.push(cursor);
    cursor = cursor.prev;
  }
  const chronological = nodes.reverse();
  const rows = [];
  const apostleDisplayHeal = scaleFromReferenceIntellect(
    (MEASURED_AT_REFERENCE_INTELLECT.powerWordRadianceHealPerTarget ?? 0) *
    (MEASURED_AT_REFERENCE_INTELLECT.powerWordRadianceTargetCount ?? 0) *
    (MEASURED_AT_REFERENCE_INTELLECT.evangelismRadianceMultiplier ?? 1),
    intellect
  );

  for (let index = 1; index < chronological.length; index += 1) {
    const prev = chronological[index - 1];
    const point = chronological[index];
    const duration = Math.max(0, point.time - prev.time);
    const totalHealing = Math.max(
      0,
      Number.isFinite(point.healingDelta) ? point.healingDelta : point.healingCoef - prev.healingCoef
    );
    const directHealing = Math.max(0, Number.isFinite(point.directDelta) ? point.directDelta : 0);
    const atonementHealing = Math.max(
      0,
      Number.isFinite(point.atonementDelta) ? point.atonementDelta : Math.max(0, totalHealing - directHealing)
    );
    const manaSpent = Math.max(0, (point.manaSpent ?? 0) - (prev.manaSpent ?? 0));
    const isWait = point.kind === "wait";
    const isMajorStartWait = isWait && point.tag === "majorScheduledStart";
    if (isWait && !isMajorStartWait) {
      continue;
    }
    const isApostleCast = point.spellKey === SPELLS.evangelism.key;

    let mode = "유틸/무힐";
    if (isMajorStartWait) {
      mode = "고정 램프 시작";
    } else if (directHealing > STATE_EPSILON && atonementHealing > STATE_EPSILON) {
      mode = "혼합";
    } else if (directHealing > STATE_EPSILON) {
      mode = "직접 힐/흡수";
    } else if (atonementHealing > STATE_EPSILON) {
      mode = "딜 기반 속죄";
    }
    const remainingMana = Math.max(
      0,
      manaPool + manaRegenPerSecond * Math.max(0, point.time ?? 0) - Math.max(0, point.manaSpent ?? 0)
    );
    const remainingManaPct = manaPool > STATE_EPSILON ? (remainingMana / manaPool) * 100 : 0;
    const displayTotalHealing = isApostleCast && totalHealing <= STATE_EPSILON ? apostleDisplayHeal : totalHealing;
    const displayDirectHealing =
      isApostleCast && directHealing <= STATE_EPSILON ? apostleDisplayHeal : directHealing;
    const displayAtonementHealing = isApostleCast ? 0 : atonementHealing;

    rows.push({
      id: `action-${index}`,
      startTime: roundToOneDecimal(clamp(prev.time, 0, durationSeconds)),
      time: roundToOneDecimal(clamp(point.time, 0, durationSeconds)),
      duration: roundToTwoDecimals(duration),
      spellKey: point.spellKey ?? null,
      name: isMajorStartWait ? "고정 램프 시작" : point.spellKey ? SPELL_NAME_BY_KEY[point.spellKey] ?? point.spellKey : "대기",
      source: point.source ?? "unknown",
      tag: point.tag ?? null,
      mode,
      atonementCount: Math.max(0, Number.isFinite(point.atonementCount) ? point.atonementCount : 0),
      totalHealing,
      directHealing,
      atonementHealing,
      displayTotalHealing,
      displayDirectHealing,
      displayAtonementHealing,
      manaSpent,
      manaRemaining: remainingMana,
      manaRemainingPct: remainingManaPct,
      hps: duration > STATE_EPSILON ? totalHealing / duration : 0,
      displayHps: duration > STATE_EPSILON ? displayTotalHealing / duration : 0
    });
  }

  const timelineEndPoint = chronological[chronological.length - 1];
  const lastRow = rows[rows.length - 1] ?? null;
  const lastTime = lastRow?.time ?? 0;
  if (timelineEndPoint && durationSeconds > lastTime + STATE_EPSILON) {
    const remainingManaAtEnd = Math.max(
      0,
      manaPool +
      manaRegenPerSecond * Math.max(0, durationSeconds) -
      Math.max(0, timelineEndPoint.manaSpent ?? 0)
    );
    const remainingManaPctAtEnd = manaPool > STATE_EPSILON ? (remainingManaAtEnd / manaPool) * 100 : 0;
    rows.push({
      id: "action-fight-end",
      startTime: roundToOneDecimal(clamp(lastTime, 0, durationSeconds)),
      time: roundToOneDecimal(durationSeconds),
      duration: roundToTwoDecimals(Math.max(0, durationSeconds - lastTime)),
      spellKey: null,
      name: "전투 종료",
      source: "system",
      tag: "fightEnd",
      mode: "요약",
      atonementCount: Math.max(
        0,
        Number.isFinite(timelineEndPoint.atonementCount) ? timelineEndPoint.atonementCount : 0
      ),
      totalHealing: 0,
      directHealing: 0,
      atonementHealing: 0,
      displayTotalHealing: 0,
      displayDirectHealing: 0,
      displayAtonementHealing: 0,
      manaSpent: 0,
      manaRemaining: remainingManaAtEnd,
      manaRemainingPct: remainingManaPctAtEnd,
      hps: 0,
      displayHps: 0
    });
  }

  return rows;
}

function alignActionTimelineManaWithSeries(actionTimeline = [], manaSeries = [], manaPool = 0) {
  if (!Array.isArray(actionTimeline) || !actionTimeline.length || !Array.isArray(manaSeries) || !manaSeries.length) {
    return actionTimeline;
  }
  return actionTimeline.map((row) => {
    const sampled = Math.max(0, sampleTimeSeriesAt(manaSeries, row.time ?? 0, "linear"));
    const pct = manaPool > STATE_EPSILON ? (sampled / manaPool) * 100 : 0;
    return {
      ...row,
      manaRemaining: sampled,
      manaRemainingPct: pct
    };
  });
}

function buildSpellContributionSummaryFromEvents(events = []) {
  const EPS = STATE_EPSILON;
  const directTotalsByKey = new Map();
  const castCountBySpell = new Map();
  let atonementTotal = 0;
  let shieldCastCount = 0;
  let voidShieldProcCount = 0;

  for (const event of events) {
    if (!event?.spellKey || (event.deltaHealing ?? 0) <= EPS) {
      continue;
    }

    const atonementDelta = Math.max(0, event.atonementDelta ?? 0);
    const directDelta = Math.max(0, event.directDelta ?? 0);
    atonementTotal += atonementDelta;

    if (event.spellKey === SPELLS.powerWordShield.key && event.source !== "dot") {
      shieldCastCount += 1;
    }

    if (directDelta > EPS) {
      const breakdown =
        event.directBreakdown && typeof event.directBreakdown === "object"
          ? event.directBreakdown
          : null;
      if (breakdown && Object.keys(breakdown).length) {
        const voidPart = Math.max(0, breakdown.voidShield ?? 0);
        if (event.spellKey === SPELLS.powerWordShield.key && voidPart > EPS) {
          voidShieldProcCount += 1;
        }
        for (const [key, value] of Object.entries(breakdown)) {
          const amount = Math.max(0, value ?? 0);
          if (amount <= EPS) {
            continue;
          }
          directTotalsByKey.set(key, (directTotalsByKey.get(key) ?? 0) + amount);
        }
      } else {
        directTotalsByKey.set(event.spellKey, (directTotalsByKey.get(event.spellKey) ?? 0) + directDelta);
      }
    }

    if (event.source !== "dot") {
      castCountBySpell.set(event.spellKey, (castCountBySpell.get(event.spellKey) ?? 0) + 1);
    }
  }

  const directTotal = [...directTotalsByKey.values()].reduce((sum, value) => sum + value, 0);
  const totalHealing = atonementTotal + directTotal;
  if (totalHealing <= EPS) {
    return {
      rows: [],
      totalHealing: 0,
      atonementTotal: 0,
      directTotal: 0,
      shieldCastCount,
      voidShieldProcCount,
      voidShieldProcRatePct: 0
    };
  }

  const rows = [];
  if (atonementTotal > EPS) {
    rows.push({
      key: "atonement",
      name: "속죄",
      total: atonementTotal,
      pct: (atonementTotal / totalHealing) * 100,
      color: HEALING_ROW_COLOR_BY_KEY.atonement ?? "#d9da6f",
      casts: "-"
    });
  }

  const directRows = [...directTotalsByKey.entries()]
    .map(([key, total]) => ({
      key,
      name: HEALING_ROW_NAME_BY_KEY[key] ?? SPELL_NAME_BY_KEY[key] ?? key,
      total,
      pct: (total / totalHealing) * 100,
      color: HEALING_ROW_COLOR_BY_KEY[key] ?? "#67e8f9",
      casts:
        key === "voidShield"
          ? voidShieldProcCount
          : key === SPELLS.powerWordShield.key
            ? Math.max(0, (castCountBySpell.get(SPELLS.powerWordShield.key) ?? 0) - voidShieldProcCount)
            : key === "aegis"
              ? "-"
              : castCountBySpell.get(key) ?? 0
    }))
    .sort((a, b) => b.total - a.total);
  rows.push(...directRows);

  return {
    rows: rows
      .filter((row) => row.total > EPS)
      .sort((a, b) => b.total - a.total),
    totalHealing,
    atonementTotal,
    directTotal,
    shieldCastCount,
    voidShieldProcCount,
    voidShieldProcRatePct: shieldCastCount > EPS ? (voidShieldProcCount / shieldCastCount) * 100 : 0
  };
}

function buildAveragedSpellContributionFromRuns(results = []) {
  if (!results.length) {
    return buildSpellContributionSummaryFromEvents([]);
  }

  const runCount = Math.max(1, results.length);
  const keys = new Set();
  const summaries = results.map((entry) => {
    const summary =
      entry?.spellContribution ??
      buildSpellContributionSummaryFromEvents(entry?.timeline?.debug?.spellEvents ?? []);
    for (const row of summary.rows ?? []) {
      keys.add(row.key);
    }
    if ((summary.atonementTotal ?? 0) > STATE_EPSILON) {
      keys.add("atonement");
    }
    return summary;
  });

  const totalByKey = new Map();
  const castByKey = new Map();
  let shieldCastSum = 0;
  let voidShieldProcSum = 0;

  for (const summary of summaries) {
    const rowMap = new Map((summary.rows ?? []).map((row) => [row.key, row]));
    for (const key of keys) {
      const total = Math.max(0, rowMap.get(key)?.total ?? 0);
      totalByKey.set(key, (totalByKey.get(key) ?? 0) + total);

      if (key !== "atonement" && key !== "voidShield" && key !== "aegis") {
        const castsValue = rowMap.get(key)?.casts;
        const casts = Number.isFinite(castsValue) ? castsValue : 0;
        castByKey.set(key, (castByKey.get(key) ?? 0) + casts);
      }
    }
    shieldCastSum += Math.max(0, summary.shieldCastCount ?? 0);
    voidShieldProcSum += Math.max(0, summary.voidShieldProcCount ?? 0);
  }

  const rows = [];
  let totalHealing = 0;
  for (const key of keys) {
    const avgTotal = (totalByKey.get(key) ?? 0) / runCount;
    if (avgTotal <= STATE_EPSILON) {
      continue;
    }
    totalHealing += avgTotal;
    rows.push({
      key,
      name: key === "atonement" ? "속죄" : HEALING_ROW_NAME_BY_KEY[key] ?? SPELL_NAME_BY_KEY[key] ?? key,
      total: avgTotal,
      color: HEALING_ROW_COLOR_BY_KEY[key] ?? "#67e8f9",
      casts:
        key === "atonement"
          ? "-"
          : key === "voidShield"
            ? 0
            : key === SPELLS.powerWordShield.key
              ? 0
              : key === "aegis"
                ? "-"
                : Math.round(((castByKey.get(key) ?? 0) / runCount) * 10) / 10
    });
  }

  if (totalHealing <= STATE_EPSILON) {
    return buildSpellContributionSummaryFromEvents([]);
  }

  for (const row of rows) {
    row.pct = (row.total / totalHealing) * 100;
  }
  rows.sort((a, b) => b.total - a.total);

  const avgShieldCasts = shieldCastSum / runCount;
  const avgVoidProcs = voidShieldProcSum / runCount;
  for (const row of rows) {
    if (row.key === "voidShield") {
      row.casts = Math.round(avgVoidProcs * 10) / 10;
    } else if (row.key === SPELLS.powerWordShield.key) {
      row.casts = Math.round(Math.max(0, avgShieldCasts - avgVoidProcs) * 10) / 10;
    }
  }

  return {
    rows,
    totalHealing,
    atonementTotal: (totalByKey.get("atonement") ?? 0) / runCount,
    directTotal: Math.max(0, totalHealing - (totalByKey.get("atonement") ?? 0) / runCount),
    shieldCastCount: avgShieldCasts,
    voidShieldProcCount: avgVoidProcs,
    voidShieldProcRatePct: avgShieldCasts > STATE_EPSILON ? (avgVoidProcs / avgShieldCasts) * 100 : 0
  };
}

function runFillerSegmentSearch({
  inputStates,
  segmentEnd,
  windowIndex,
  upcomingMajorType = null,
  manaPool,
  manaCosts,
  intellect,
  manaRegenPerSecond,
  reserveBySegmentEnd = 0,
  reserveRadianceChargesBySegmentEnd = 0,
  manaBudget,
  hastePct,
  transferTable,
  talentRuntime = DEFAULT_TALENT_RUNTIME,
  probabilityMode = SOLVER_PROBABILITY_MODE
}) {
  if (!inputStates.length) {
    return [];
  }

  const penanceDuration = resolveDuration(SPELLS.penance, hastePct, { evangelismRadianceCharges: 0 });
  const shieldDuration = resolveDuration(SPELLS.powerWordShield, hastePct, { evangelismRadianceCharges: 0 });
  const mindBlastDuration = resolveDuration(SPELLS.mindBlast, hastePct, { evangelismRadianceCharges: 0 });
  const radianceDuration = resolveDuration(SPELLS.powerWordRadiance, hastePct, { evangelismRadianceCharges: 0 });
  const flashHealDuration = resolveDuration(SPELLS.flashHeal, hastePct, { evangelismRadianceCharges: 0 });
  const pleaDuration = resolveDuration(SPELLS.plea, hastePct, { evangelismRadianceCharges: 0 });
  const smiteDuration = resolveDuration(SPELLS.smite, hastePct, { evangelismRadianceCharges: 0 });
  const segmentSpendCap = manaPool + manaRegenPerSecond * segmentEnd - Math.max(0, reserveBySegmentEnd);
  // 글로벌 reserve는 과도하게 보수적이라 필러 GCD를 죽이는 경우가 많다.
  // 구간 끝(segmentEnd) 기준 reserve만 강제하고, 전투 전체 예산은 manaBudget으로만 제한한다.
  const fightSpendCap = null;

  const seeded = inputStates.map((baseState) => {
    const state = cloneState(baseState);
    normalizeStateAtonement(state, hastePct);
    if (state.time < segmentEnd - STATE_EPSILON) {
      touchFillerWindow(state, windowIndex, state.time, segmentEnd);
    }
    return state;
  });

  let active = pruneSimulationStates(seeded, manaBudget, FILLER_BEAM_WIDTH, hastePct);
  const completed = [];

  for (let depth = 0; depth < 900 && active.length; depth += 1) {
    const next = [];

    for (const state of active) {
      normalizeStateAtonement(state, hastePct);

      if (state.time >= segmentEnd - STATE_EPSILON) {
        completed.push(state);
        continue;
      }

      const windowStart = state.fillerWindows[windowIndex]?.start ?? state.time;
      const windowEnd = segmentEnd;
      const nextPenanceReadyAt = getNextReadyTimeByCharge(state, "penanceCharges", "penanceRechargeAt", state.time);
      const nextRadianceReadyAt = getNextReadyTimeByCharge(state, "radianceCharges", "radianceRechargeAt", state.time);
      const nextMindBlastReadyAt = state.nextMindBlastReadyAt ?? Number.POSITIVE_INFINITY;
      const optionalCastEndLimit = segmentEnd;
      const branches = [];
      const pushBranch = (candidate, { enforceMajorChargeRule = true } = {}) => {
        if (!enforceMajorChargeRule) {
          branches.push(candidate);
          return;
        }
        if (
          canEnterUpcomingMajorWithoutChargeWait({
            state: candidate,
            segmentEnd,
            upcomingMajorType,
            hastePct
          })
        ) {
          branches.push(candidate);
        }
      };
      const tryFillerSpellBranches = ({
        spell,
        duration,
        tag,
        branchByAtonementTargets = false,
        enforceMajorChargeRule = true
      }) => {
        const baseApplyCount = Math.max(
          0,
          Math.floor(
            MAJOR_ATONEMENT_MODEL?.applyCountBySpellKey?.[spell.key] ?? 0
          )
        );
        const canBranchByTargets =
          branchByAtonementTargets &&
          FILLER_UNIQUE_ATONEMENT_TARGET_MODEL_ENABLED &&
          baseApplyCount > 0 &&
          (state.atonementExpiries?.length ?? 0) > 0;
        const preferences = canBranchByTargets
          ? ["maximize_new", "maximize_refresh"]
          : ["maximize_new"];
        const localDedup = new Set();
        let createdCount = 0;

        for (const preference of preferences) {
          const candidate = cloneState(state);
          const casted = applySpellToState({
            state: candidate,
            spell,
            duration,
            castEndLimit: optionalCastEndLimit,
            manaPool,
            manaCosts,
            intellect,
            hastePct,
            manaRegenPerSecond,
            maxSpendBySegmentEnd: segmentSpendCap,
            maxSpendByFightEnd: fightSpendCap,
            manaBudget,
            transferTable,
            atonementModel: MAJOR_ATONEMENT_MODEL,
            talentRuntime,
            atonementApplyPreference: preference,
            windowIndex,
            windowStart,
            windowEnd,
            source: "filler",
            tag,
            probabilityMode
          });
          if (!casted) {
            continue;
          }
          const dedupeKey = buildSimulationStateKey(candidate, manaBudget);
          if (localDedup.has(dedupeKey)) {
            continue;
          }
          localDedup.add(dedupeKey);
          pushBranch(candidate, { enforceMajorChargeRule });
          createdCount += 1;
        }

        return createdCount;
      };

      // Hard rule: after Penance, Shield must be cast immediately in filler windows too.
      const shieldFollowupPending = (state.nextShieldMultiplier ?? 1) > 1 + STATE_EPSILON;
      if (shieldFollowupPending) {
        if (state.time + shieldDuration <= optionalCastEndLimit + STATE_EPSILON) {
          tryFillerSpellBranches({
            spell: SPELLS.powerWordShield,
            duration: shieldDuration,
            tag: "shieldAfterPenance",
            branchByAtonementTargets: true,
            enforceMajorChargeRule: false
          });
        }
        if (!branches.length) {
          const waited = cloneState(state);
          waitUntil(
            waited,
            segmentEnd,
            windowIndex,
            windowStart,
            windowEnd,
            hastePct,
            transferTable,
            intellect,
            talentRuntime,
            {
              source: "wait",
              reason: "fillerWaitToSegmentEndNoAction"
            },
            probabilityMode
          );
          completed.push(waited);
        } else {
          next.push(...branches);
        }
        continue;
      }

      const penanceReady = (state.penanceCharges ?? 0) >= 1 - STATE_EPSILON;
      if (penanceReady && state.time + penanceDuration <= optionalCastEndLimit + STATE_EPSILON) {
        tryFillerSpellBranches({
          spell: SPELLS.penance,
          duration: penanceDuration,
          tag: "penance",
          enforceMajorChargeRule: true
        });
      }

      const radianceReady = (state.radianceCharges ?? 0) >= 1 - STATE_EPSILON;
      if (radianceReady && state.time + radianceDuration <= optionalCastEndLimit + STATE_EPSILON) {
        const radianceCastEnd = state.time + radianceDuration;
        const canSpendRadiance =
          canSpendRadianceAndKeepReserve({
            state,
            castEndTime: radianceCastEnd,
            segmentEnd,
            reserveChargesBySegmentEnd: reserveRadianceChargesBySegmentEnd
          });
        if (canSpendRadiance) {
          tryFillerSpellBranches({
            spell: SPELLS.powerWordRadiance,
            duration: radianceDuration,
            tag: "radiance",
            branchByAtonementTargets: true,
            enforceMajorChargeRule: true
          });
        }
      }

      if (state.time + pleaDuration <= optionalCastEndLimit + STATE_EPSILON) {
        tryFillerSpellBranches({
          spell: SPELLS.plea,
          duration: pleaDuration,
          tag: "plea",
          branchByAtonementTargets: true,
          enforceMajorChargeRule: false
        });
      }

      if (state.time + flashHealDuration <= optionalCastEndLimit + STATE_EPSILON) {
        tryFillerSpellBranches({
          spell: SPELLS.flashHeal,
          duration: flashHealDuration,
          tag: "flashHeal",
          branchByAtonementTargets: true,
          enforceMajorChargeRule: false
        });
      }

      const shieldAllowed = (state.nextShieldMultiplier ?? 1) > 1 + STATE_EPSILON;
      if (shieldAllowed && state.time + shieldDuration <= optionalCastEndLimit + STATE_EPSILON) {
        tryFillerSpellBranches({
          spell: SPELLS.powerWordShield,
          duration: shieldDuration,
          tag: "shieldAfterPenance",
          branchByAtonementTargets: true,
          enforceMajorChargeRule: false
        });
      }

      if (state.time + smiteDuration <= optionalCastEndLimit + STATE_EPSILON) {
        const smiteState = cloneState(state);
        const smiteOk = applySpellToState({
          state: smiteState,
          spell: SPELLS.smite,
          duration: smiteDuration,
          castEndLimit: optionalCastEndLimit,
          manaPool,
          manaCosts,
          intellect,
          hastePct,
          manaRegenPerSecond,
          maxSpendBySegmentEnd: segmentSpendCap,
          maxSpendByFightEnd: fightSpendCap,
          manaBudget,
          transferTable,
          atonementModel: MAJOR_ATONEMENT_MODEL,
          talentRuntime,
          windowIndex,
          windowStart,
          windowEnd,
          source: "filler",
          tag: "smite",
          probabilityMode
        });
        if (smiteOk) {
          pushBranch(smiteState, { enforceMajorChargeRule: false });
        }
      }

      const mindBlastReady = state.nextMindBlastReadyAt <= state.time + STATE_EPSILON;
      if (mindBlastReady && state.time + mindBlastDuration <= optionalCastEndLimit + STATE_EPSILON) {
        const mindBlastState = cloneState(state);
        const mindBlastOk = applySpellToState({
          state: mindBlastState,
          spell: SPELLS.mindBlast,
          duration: mindBlastDuration,
          castEndLimit: optionalCastEndLimit,
          manaPool,
          manaCosts,
          intellect,
          hastePct,
          manaRegenPerSecond,
          maxSpendBySegmentEnd: segmentSpendCap,
          maxSpendByFightEnd: fightSpendCap,
          manaBudget,
          transferTable,
          atonementModel: MAJOR_ATONEMENT_MODEL,
          talentRuntime,
          windowIndex,
          windowStart,
          windowEnd,
          source: "filler",
          tag: "mindBlast",
          probabilityMode
        });
        if (mindBlastOk) {
          pushBranch(mindBlastState, { enforceMajorChargeRule: false });
        }
      }

      const nextPenanceFutureAt = penanceReady ? Number.POSITIVE_INFINITY : nextPenanceReadyAt;
      const nextRadianceFutureAt = radianceReady ? Number.POSITIVE_INFINITY : nextRadianceReadyAt;
      const nextMindBlastFutureAt = mindBlastReady ? Number.POSITIVE_INFINITY : nextMindBlastReadyAt;
      const waitTarget = Math.min(segmentEnd, nextPenanceFutureAt, nextRadianceFutureAt, nextMindBlastFutureAt);
      // 핵심 변경: 시전 가능한 스킬이 하나라도 있으면 대기 분기를 만들지 않는다.
      // 남은 시간/GCD를 최대 활용해 CPM을 끌어올리고, 마나 한계는 리소스 제약 체크에서 자연스럽게 조정한다.
      if (!branches.length && waitTarget > state.time + STATE_EPSILON) {
        let waitReason = "fillerWaitToSegmentEndNoAction";
        if (
          Number.isFinite(nextPenanceFutureAt) &&
          nextPenanceFutureAt < segmentEnd - STATE_EPSILON &&
          Math.abs(waitTarget - nextPenanceFutureAt) <= STATE_EPSILON
        ) {
          waitReason = "fillerWaitForMandatoryPenance";
        } else if (
          Number.isFinite(nextRadianceFutureAt) &&
          nextRadianceFutureAt < segmentEnd - STATE_EPSILON &&
          Math.abs(waitTarget - nextRadianceFutureAt) <= STATE_EPSILON
        ) {
          waitReason = "fillerWaitForRadianceCharge";
        }
        const waited = cloneState(state);
        waitUntil(waited, waitTarget, windowIndex, windowStart, windowEnd, hastePct, transferTable, intellect, talentRuntime, {
          source: "wait",
          reason: waitReason
        }, probabilityMode);
        branches.push(waited);
      }

      if (!branches.length) {
        const stalled = cloneState(state);
        waitUntil(stalled, segmentEnd, windowIndex, windowStart, windowEnd, hastePct, transferTable, intellect, talentRuntime, {
          source: "wait",
          reason: "fillerWaitToSegmentEndNoAction"
        }, probabilityMode);
        completed.push(stalled);
      } else {
        next.push(...branches);
      }
    }

    if (!next.length) {
      break;
    }
    active = pruneSimulationStates(next, manaBudget, FILLER_BEAM_WIDTH, hastePct);
  }

  for (const state of active) {
    if (state.time < segmentEnd - STATE_EPSILON) {
      const windowStart = state.fillerWindows[windowIndex]?.start ?? state.time;
      waitUntil(
        state,
        segmentEnd,
        windowIndex,
        windowStart,
        segmentEnd,
        hastePct,
        transferTable,
        intellect,
        talentRuntime,
        {
          source: "wait",
          reason: "fillerFinalizeToSegmentEnd"
        },
        probabilityMode
      );
    }
    completed.push(state);
  }

  return pruneSimulationStates(completed, manaBudget, FILLER_BEAM_WIDTH, hastePct);
}

function applyMajorSequenceForState({
  inputState,
  event,
  durationSeconds,
  manaPool,
  manaCosts,
  intellect,
  manaRegenPerSecond,
  manaBudget,
  hastePct,
  transferTable,
  talentRuntime = DEFAULT_TALENT_RUNTIME,
  probabilityMode = SOLVER_PROBABILITY_MODE
}) {
  const state = cloneState(inputState);
  normalizeStateAtonement(state, hastePct);

  const actualStart = Math.max(event.scheduledStart, state.time);
  if (actualStart > event.scheduledStart + STATE_EPSILON) {
    const delayedMarker = actualStart + event.prepDuration;
    appendWarning(state, `${event.label} 지연: ${formatSeconds(event.scheduledMarker)} -> ${formatSeconds(delayedMarker)}`);
  }

  if (actualStart > state.time + STATE_EPSILON) {
    waitUntil(
      state,
      actualStart,
      null,
      0,
      0,
      hastePct,
      transferTable,
      intellect,
      talentRuntime,
      {
        source: "wait",
        reason: "majorScheduledStart"
      },
      probabilityMode
    );
  }

  if (state.time >= durationSeconds - STATE_EPSILON) {
    appendWarning(state, `${event.label}은(는) 전투 종료 시점에 도달해 실행되지 않았습니다.`);
    return state;
  }

  const sequence = event.type === "apostle" ? APOSTLE_SEQUENCE : ULTIMATE_SEQUENCE;
  let evangelismRadianceCharges = 0;
  const beforeTime = state.time;
  const beforeMana = state.manaSpent;
  const beforeHealing = state.healingCoef;
  const availableManaAtStart = manaPool + manaRegenPerSecond * beforeTime - beforeMana;
  const spellCounts = {};
  let ultimateAtonementAtCast = null;
  const mindBlastAtonementsAtCast = [];
  const mindBlastHealingDeltas = [];
  const ultimateHealingDeltas = [];
  const ultimateComputations = [];
  let majorMarkerAt = null;

  for (const spell of sequence) {
    syncCooldownResources(state, state.time, hastePct);

    // Hard rule: if a Penance was cast, force a Shield before any other spell in major windows.
    const shieldFollowupPending = (state.nextShieldMultiplier ?? 1) > 1 + STATE_EPSILON;
    if (shieldFollowupPending && spell.key !== SPELLS.powerWordShield.key) {
      const forcedShieldDuration = resolveDuration(SPELLS.powerWordShield, hastePct, { evangelismRadianceCharges });
      const forcedShieldCasted = applySpellToState({
        state,
        spell: SPELLS.powerWordShield,
        duration: forcedShieldDuration,
        castEndLimit: durationSeconds,
        manaPool,
        manaCosts,
        intellect,
        hastePct,
        manaRegenPerSecond,
        manaBudget,
        transferTable,
        atonementModel: MAJOR_ATONEMENT_MODEL,
        talentRuntime,
        source: "major",
        tag: "majorForcedShieldAfterPenance",
        probabilityMode
      });
      if (!forcedShieldCasted) {
        break;
      }
      spellCounts[SPELLS.powerWordShield.key] = (spellCounts[SPELLS.powerWordShield.key] ?? 0) + 1;
      syncCooldownResources(state, state.time, hastePct);
    }

    if (spell.key === SPELLS.penance.key && (state.penanceCharges ?? 0) < 1 - STATE_EPSILON) {
      const readyAt = getNextReadyTimeByCharge(state, "penanceCharges", "penanceRechargeAt", state.time);
      if (Number.isFinite(readyAt) && readyAt > state.time + STATE_EPSILON) {
        const waitSec = Math.max(0, readyAt - state.time);
        state.majorChargeWaitSec = (state.majorChargeWaitSec ?? 0) + waitSec;
        waitUntil(
          state,
          readyAt,
          null,
          0,
          0,
          hastePct,
          transferTable,
          intellect,
          talentRuntime,
          {
            source: "wait",
            reason: "majorPenanceCharge"
          },
          probabilityMode
        );
      }
    }
    if (spell.key === SPELLS.powerWordRadiance.key && (state.radianceCharges ?? 0) < 1 - STATE_EPSILON) {
      const readyAt = getNextReadyTimeByCharge(state, "radianceCharges", "radianceRechargeAt", state.time);
      if (Number.isFinite(readyAt) && readyAt > state.time + STATE_EPSILON) {
        const waitSec = Math.max(0, readyAt - state.time);
        state.majorChargeWaitSec = (state.majorChargeWaitSec ?? 0) + waitSec;
        waitUntil(
          state,
          readyAt,
          null,
          0,
          0,
          hastePct,
          transferTable,
          intellect,
          talentRuntime,
          {
            source: "wait",
            reason: "majorRadianceCharge"
          },
          probabilityMode
        );
      }
    }

    const duration = resolveDuration(spell, hastePct, { evangelismRadianceCharges });
    const atonementsAtThisCast = expireAtonements(state.atonementExpiries, state.time + duration).length;
    if (spell.key === SPELLS.ultimatePenitence.key) {
      ultimateAtonementAtCast = atonementsAtThisCast;
      const cappedAtonements = clamp(atonementsAtThisCast, 0, MAJOR_ATONEMENT_MODEL.maxTargets ?? 20);
      const transferRate = getTransferRate(transferTable, cappedAtonements) / 100;
      const critMul = talentRuntime.expectedCritMultiplier ?? 1;
      const castEndTime = state.time + duration;
      const archangelMultiplier = state.archangelBuffExpiresAt > castEndTime + STATE_EPSILON
        ? talentRuntime.archangelHealingShieldMultiplier ?? DEFAULT_TALENT_RUNTIME.archangelHealingShieldMultiplier
        : 1;
      const atonementSourceMultiplier = resolveAtonementSourceMultiplier(SPELLS.ultimatePenitence.key, talentRuntime);
      const masteryMultiplier = resolveMasteryAtonementTargetMultiplier(talentRuntime);
      const scaledDamage = scaleFromReferenceIntellect(MEASURED_AT_REFERENCE_INTELLECT.ultimatePenitenceBaseDamage, intellect);
      const expectedAtonementHealing =
        scaledDamage *
        critMul *
        cappedAtonements *
        transferRate *
        atonementSourceMultiplier *
        archangelMultiplier *
        masteryMultiplier;
      ultimateComputations.push({
        time: roundToOneDecimal(castEndTime),
        castDurationSec: roundToTwoDecimals(duration),
        scaledDamage,
        atonementCount: cappedAtonements,
        transferRatePct: roundToTwoDecimals(transferRate * 100),
        critMul: roundToTwoDecimals(critMul),
        masteryMultiplier: roundToTwoDecimals(masteryMultiplier),
        atonementSourceMultiplier: roundToTwoDecimals(atonementSourceMultiplier),
        archangelMultiplier: roundToTwoDecimals(archangelMultiplier),
        expectedAtonementHealing
      });
    }
    if (spell.key === SPELLS.mindBlast.key) {
      mindBlastAtonementsAtCast.push(atonementsAtThisCast);
    }
    let manaMultiplier = 1;

    if (spell.key === SPELLS.powerWordRadiance.key && evangelismRadianceCharges > 0) {
      manaMultiplier = 0.6;
      evangelismRadianceCharges -= 1;
    }

    const beforeSpellTime = state.time;
    const beforeSpellHealing = state.healingCoef;
    const casted = applySpellToState({
      state,
      spell,
      duration,
      manaMultiplier,
      castEndLimit: durationSeconds,
      manaPool,
      manaCosts,
      intellect,
      hastePct,
      manaRegenPerSecond,
      manaBudget,
      transferTable,
      atonementModel: MAJOR_ATONEMENT_MODEL,
      talentRuntime,
      source: "major",
      tag: "major",
      probabilityMode
    });
    if (!casted) {
      break;
    }

    const spellDeltaHealing = Math.max(0, state.healingCoef - beforeSpellHealing);
    const spellDuration = Math.max(STATE_EPSILON, state.time - beforeSpellTime);
    if (spell.key === SPELLS.mindBlast.key) {
      mindBlastHealingDeltas.push({
        time: roundToOneDecimal(state.time),
        deltaHealing: spellDeltaHealing,
        castRate: spellDeltaHealing / spellDuration
      });
    } else if (spell.key === SPELLS.ultimatePenitence.key) {
      majorMarkerAt = state.time;
      ultimateHealingDeltas.push({
        time: roundToOneDecimal(state.time),
        deltaHealing: spellDeltaHealing,
        castRate: spellDeltaHealing / spellDuration
      });
    } else if (spell.key === SPELLS.evangelism.key && event.type === "apostle") {
      majorMarkerAt = state.time;
    }

    spellCounts[spell.key] = (spellCounts[spell.key] ?? 0) + 1;
    if (spell.key === SPELLS.evangelism.key) {
      evangelismRadianceCharges = 2;
    }
  }

  const realizedDuration = state.time - beforeTime;
  const manaCost = state.manaSpent - beforeMana;
  const healingCoef = state.healingCoef - beforeHealing;
  const coreMissing =
    (event.type === "ultimate" && ultimateAtonementAtCast == null) ||
    (event.type === "apostle" && (spellCounts[SPELLS.evangelism.key] ?? 0) < 1);

  if (coreMissing) {
    state.majorCoreMisses = (state.majorCoreMisses ?? 0) + 1;
    appendWarning(
      state,
      event.type === "ultimate"
        ? `${event.label}: 궁참 본체가 시전되지 않았습니다. (마나/충전/시간 제약)`
        : `${event.label}: 사도 본체가 시전되지 않았습니다. (마나/충전/시간 제약)`
    );
  }

  if (realizedDuration <= STATE_EPSILON) {
    appendWarning(state, `${event.label}은(는) 마나/시간 제약으로 실행되지 않았습니다.`);
    return state;
  }

  state.majorEvents.push({
    id: event.id,
    type: event.type,
    label: event.label,
    scheduledMarker: event.scheduledMarker,
    prepDuration: event.prepDuration,
    scheduledStart: event.scheduledStart,
    actualStart: beforeTime,
    actualMarker: beforeTime + event.prepDuration,
    markerCastEnd: majorMarkerAt,
    end: state.time,
    duration: realizedDuration,
    manaCost,
    manaCostPct: (manaCost / Math.max(1, manaPool)) * 100,
    healingCoef,
    expectedDuration: event.expectedDuration,
    expectedManaCost: event.expectedManaCost,
    availableManaAtStart,
    radianceCount: spellCounts[SPELLS.powerWordRadiance.key] ?? 0,
    ultimateAtonementAtCast,
    mindBlastAtonementsAtCast,
    mindBlastHealingDeltas,
    ultimateHealingDeltas,
    ultimateComputations,
    coreMissing
  });

  if (realizedDuration + STATE_EPSILON < event.expectedDuration) {
    appendWarning(
      state,
      `${event.label} 축약: 필요 마나 ${Math.round(event.expectedManaCost).toLocaleString()}, 시작 가용 ${Math.round(availableManaAtStart).toLocaleString()}, 실제 사용 ${Math.round(manaCost).toLocaleString()}`
    );
  }

  return state;
}

function simulateRampPlan({
  manaPool,
  manaCosts,
  intellect,
  manaRegenPer5Sec,
  durationSeconds,
  hastePct,
  apostleTimes,
  ultimateTimes,
  transferTable,
  talentRuntime = DEFAULT_TALENT_RUNTIME
}) {
  const solverProbabilityMode = SOLVER_PROBABILITY_MODE;
  const manaRegenPerSecond = Math.max(0, manaRegenPer5Sec) / 5;
  const manaBudget = Math.max(0, manaPool + manaRegenPerSecond * durationSeconds - MIN_END_MANA);
  const majorProfiles = {
    apostle: evaluateSequence({
      sequence: APOSTLE_SEQUENCE,
      manaPool,
      manaCosts,
      intellect,
      hastePct,
      atonementCount: 0,
      transferTable,
      atonementModel: MAJOR_ATONEMENT_MODEL,
      talentRuntime
    }),
    ultimate: evaluateSequence({
      sequence: ULTIMATE_SEQUENCE,
      manaPool,
      manaCosts,
      intellect,
      hastePct,
      atonementCount: 0,
      transferTable,
      atonementModel: MAJOR_ATONEMENT_MODEL,
      talentRuntime
    })
  };
  const majorPrepDurations = {
    apostle: getMajorPrepDuration("apostle", hastePct),
    ultimate: getMajorPrepDuration("ultimate", hastePct)
  };

  const scheduledEvents = [
    ...apostleTimes.map((time, index) => ({
      id: `apostle-${index + 1}`,
      type: "apostle",
      label: `사도 ${index + 1}`,
      scheduledMarker: time
    })),
    ...ultimateTimes.map((time, index) => ({
      id: `ultimate-${index + 1}`,
      type: "ultimate",
      label: `궁참 ${index + 1}`,
      scheduledMarker: time
    }))
  ]
    .sort((a, b) => a.scheduledMarker - b.scheduledMarker)
    .map((event) => {
      const prepDuration = majorPrepDurations[event.type];
      const expectedDuration = majorProfiles[event.type].duration;
      const markerTailDuration = Math.max(0, expectedDuration - prepDuration);
      const latestMarker = Math.max(0, durationSeconds - markerTailDuration);
      const clampedMarker = clamp(event.scheduledMarker, 0, latestMarker);
      return {
        ...event,
        prepDuration,
        scheduledMarker: clampedMarker,
        scheduledStart: Math.max(0, clampedMarker - prepDuration),
        expectedDuration,
        expectedManaCost: majorProfiles[event.type].manaCost
      };
    });

  let states = [buildInitialSimulationState()];
  const openingPainDuration = getOpeningPainDuration(hastePct);
  states = states.map((baseState) => {
    const state = cloneState(baseState);
    const opened = applySpellToState({
      state,
      spell: SPELLS.shadowWordPain,
      duration: openingPainDuration,
      castEndLimit: durationSeconds,
      manaPool,
      manaCosts,
      intellect,
      hastePct,
      manaRegenPerSecond,
      manaBudget,
      transferTable,
      atonementModel: MAJOR_ATONEMENT_MODEL,
      talentRuntime,
      probabilityMode: solverProbabilityMode,
      source: "setup",
      tag: "setupPain"
    });
    if (!opened) {
      appendWarning(state, "오프너 고통(1회)을 실행하지 못했습니다.");
    }
    return state;
  });
  states = pruneSimulationStates(states, manaBudget, MAJOR_BEAM_WIDTH, hastePct);

  scheduledEvents.forEach((event, eventIndex) => {
    const majorFullManaCost = majorProfiles[event.type]?.manaCost ?? 0;
    const reserveBySegmentEnd = majorFullManaCost * Math.max(1, MAJOR_MANA_RESERVE_SAFETY_MULTIPLIER);
    const reserveRadianceChargesBySegmentEnd =
      majorProfiles[event.type]?.spellCounts?.[SPELLS.powerWordRadiance.key] ?? 0;
    states = runFillerSegmentSearch({
      inputStates: states,
      segmentEnd: event.scheduledStart,
      windowIndex: eventIndex,
      upcomingMajorType: event.type,
      manaPool,
      manaCosts,
      intellect,
      manaRegenPerSecond,
      reserveBySegmentEnd,
      reserveRadianceChargesBySegmentEnd,
      manaBudget,
      hastePct,
      transferTable,
      talentRuntime,
      probabilityMode: solverProbabilityMode
    });

    const next = states.map((state) =>
      applyMajorSequenceForState({
        inputState: state,
        event,
        durationSeconds,
        manaPool,
        manaCosts,
        intellect,
        manaRegenPerSecond,
        manaBudget,
        hastePct,
        transferTable,
        talentRuntime,
        probabilityMode: solverProbabilityMode
      })
    );
    states = pruneSimulationStates(next, manaBudget, MAJOR_BEAM_WIDTH, hastePct);
  });

  states = runFillerSegmentSearch({
    inputStates: states,
    segmentEnd: durationSeconds,
    windowIndex: scheduledEvents.length,
    upcomingMajorType: null,
    manaPool,
    manaCosts,
    intellect,
    manaRegenPerSecond,
    reserveBySegmentEnd: 0,
    reserveRadianceChargesBySegmentEnd: 0,
    manaBudget,
    hastePct,
    transferTable,
    talentRuntime,
    probabilityMode: solverProbabilityMode
  });

  const bestState = states.reduce((best, state) => (compareSimulationState(state, best) ? state : best), null) ?? buildInitialSimulationState();

  const majorEvents = [...bestState.majorEvents].sort((a, b) => a.actualStart - b.actualStart);
  const fillerPlans = bestState.fillerWindows
    .filter(Boolean)
    .filter((window) => window.end > window.start + STATE_EPSILON)
    .sort((a, b) => a.start - b.start);

  const majorManaCost = majorEvents.reduce((acc, event) => acc + event.manaCost, 0);
  const majorHealingCoef = majorEvents.reduce((acc, event) => acc + event.healingCoef, 0);
  const majorManaCostPct = (majorManaCost / Math.max(1, manaPool)) * 100;
  const totalRadianceInMajor = majorEvents.reduce((acc, event) => acc + event.radianceCount, 0);

  const fillerTotals = fillerPlans.reduce(
    (acc, window) => {
      acc.radianceCount += window.radianceCount;
      acc.shieldCount += window.shieldCount;
      acc.flashHealCount += window.flashHealCount;
      acc.pleaCount += window.pleaCount;
      acc.smiteCount += window.smiteCount;
      acc.mandatoryPenanceCount += window.mandatoryPenanceCount;
      acc.mandatoryShieldCount += window.mandatoryShieldCount;
      acc.mindBlastCount += window.mindBlastCount;
      acc.mandatoryManaUsed += window.mandatoryManaUsed;
      acc.optionalManaUsed += window.optionalManaUsed;
      acc.mandatoryHealingCoef += window.mandatoryHealingCoef;
      acc.optionalHealingCoef += window.optionalHealingCoef;
      return acc;
    },
    {
      radianceCount: 0,
      shieldCount: 0,
      flashHealCount: 0,
      pleaCount: 0,
      smiteCount: 0,
      mandatoryPenanceCount: 0,
      mandatoryShieldCount: 0,
      mindBlastCount: 0,
      mandatoryManaUsed: 0,
      optionalManaUsed: 0,
      mandatoryHealingCoef: 0,
      optionalHealingCoef: 0
    }
  );

  const fillerManaCost = fillerTotals.mandatoryManaUsed + fillerTotals.optionalManaUsed;
  const fillerManaCostPct = (fillerManaCost / Math.max(1, manaPool)) * 100;
  const fillerHealingCoef = fillerTotals.mandatoryHealingCoef + fillerTotals.optionalHealingCoef;

  const totalManaSpent = bestState.manaSpent;
  const regenRecovered = manaRegenPerSecond * durationSeconds;
  const shieldRefunded = bestState.manaRefunded ?? 0;
  const manaRecovered = regenRecovered + shieldRefunded;
  const manaRemaining = manaPool + manaRecovered - totalManaSpent;
  const totalHealingCoef = bestState.healingCoef;
  const totalHps = totalHealingCoef / Math.max(1, durationSeconds);
  const castSummary = summarizeCastsFromTrace(bestState.trace, durationSeconds);
  const idleBreakdown = summarizeIdleReasonsFromTrace(bestState.trace, durationSeconds, castSummary.idleTimeSec);
  const totalCpm = castSummary.castsPerMinute;
  const gcdSeconds = Math.max(GCD_MIN_SECONDS, GCD_BASE_SECONDS / Math.max(0.1, 1 + hastePct / 100));
  const idleGcdEquivalent = castSummary.idleTimeSec / Math.max(STATE_EPSILON, gcdSeconds);

  if (manaRemaining < -STATE_EPSILON) {
    appendWarning(bestState, "마나 제한을 초과했습니다. 설정값 또는 타임라인을 조정하세요.");
  }
  if (totalManaSpent > manaBudget + STATE_EPSILON) {
    appendWarning(bestState, `종료 마나 ${MIN_END_MANA} 보존 조건을 만족하지 못했습니다.`);
  }
  if (totalCpm < 40) {
    appendWarning(bestState, `CPM이 낮습니다 (${totalCpm.toFixed(1)}). 타임라인/마나/가속 설정을 점검하세요.`);
  }

  const timeline = buildTimelineFromTrace(bestState.trace, durationSeconds, manaPool, manaRegenPerSecond);
  const spellContribution = buildSpellContributionSummaryFromEvents(timeline.debug?.spellEvents ?? []);
  const actionTimeline = buildActionTimelineFromTrace(
    bestState.trace,
    durationSeconds,
    manaPool,
    manaRegenPerSecond,
    intellect
  );
  const timelineMarkers = {
    apostle: majorEvents
      .filter((event) => event.type === "apostle" && event.markerCastEnd != null)
      .map((event) => roundToOneDecimal(event.markerCastEnd)),
    ultimate: majorEvents
      .filter((event) => event.type === "ultimate" && event.markerCastEnd != null)
      .map((event) => roundToOneDecimal(event.markerCastEnd)),
    fillerRadiance: timeline.casts?.fillerRadianceTimes ?? [],
    mindBlast: timeline.casts?.mindBlastTimes ?? []
  };

  return {
    majorEvents,
    fillerPlans,
    warnings: bestState.warnings,
    timeline,
    spellContribution,
    actionTimeline,
    idleBreakdown,
    timelineMarkers,
    totals: {
      majorManaCost,
      majorManaCostPct,
      fillerManaCost,
      fillerManaCostPct,
      mandatoryManaCost: fillerTotals.mandatoryManaUsed,
      optionalManaCost: fillerTotals.optionalManaUsed,
      totalManaSpent,
      shieldRefunded,
      manaRecovered,
      manaRemaining,
      totalHealingCoef,
      totalHps,
      totalCasts: castSummary.totalCasts,
      castsPerMinute: castSummary.castsPerMinute,
      activeCastTimeSec: castSummary.activeCastTimeSec,
      idleTimeSec: castSummary.idleTimeSec,
      idlePct: castSummary.idlePct,
      idleGcdEquivalent,
      totalRadianceInMajor,
      totalRadianceInFiller: fillerTotals.radianceCount,
      totalRadianceAll: totalRadianceInMajor + fillerTotals.radianceCount
    },
    fillerTotals,
    castsBySpell: castSummary.castsBySpell
  };
}

function buildAveragedIdleBreakdown(results, durationSeconds, averageIdleSec) {
  const reasonsByKey = new Map();
  for (const entry of results) {
    const reasonList = entry?.idleBreakdown?.reasons ?? [];
    for (const reason of reasonList) {
      const current = reasonsByKey.get(reason.key) ?? {
        key: reason.key,
        label: reason.label ?? IDLE_REASON_LABELS[reason.key] ?? IDLE_REASON_LABELS.idleOther,
        seconds: 0
      };
      current.seconds += Number.isFinite(reason.seconds) ? reason.seconds : 0;
      reasonsByKey.set(reason.key, current);
    }
  }
  const runCount = Math.max(1, results.length);
  const normalized = [...reasonsByKey.values()]
    .map((entry) => ({
      key: entry.key,
      label: entry.label,
      seconds: entry.seconds / runCount
    }))
    .filter((entry) => entry.seconds > STATE_EPSILON)
    .sort((a, b) => b.seconds - a.seconds)
    .map((entry) => ({
      ...entry,
      count: 0,
      pctOfIdle: averageIdleSec > STATE_EPSILON ? (entry.seconds / averageIdleSec) * 100 : 0,
      pctOfFight: durationSeconds > STATE_EPSILON ? (entry.seconds / durationSeconds) * 100 : 0
    }));

  return {
    totalIdleSec: averageIdleSec,
    reasons: normalized
  };
}

function simulateRampPlanMonteCarlo(params, requestedRuns = MONTE_CARLO_DEFAULT_RUNS) {
  const runCount = Math.max(1, Math.round(parseNumber(requestedRuns, MONTE_CARLO_DEFAULT_RUNS)));
  const results = [];
  for (let runIndex = 0; runIndex < runCount; runIndex += 1) {
    results.push(simulateRampPlan(params));
  }
  if (!results.length) {
    return simulateRampPlan(params);
  }

  const avgHps = averageNumericValues(results.map((entry) => entry?.totals?.totalHps ?? 0));
  const avgManaRemaining = averageNumericValues(results.map((entry) => entry?.totals?.manaRemaining ?? 0));
  const avgCpm = averageNumericValues(results.map((entry) => entry?.totals?.castsPerMinute ?? 0));
  const representative = pickRepresentativeRun(results, avgHps) ?? results[0];
  const averagedTotals = averageNumericObject(results.map((entry) => entry?.totals ?? {}));
  const averagedFillerTotals = averageNumericObject(results.map((entry) => entry?.fillerTotals ?? {}));
  const averagedIdleBreakdown = buildAveragedIdleBreakdown(
    results,
    params.durationSeconds,
    Number.isFinite(averagedTotals.idleTimeSec) ? averagedTotals.idleTimeSec : representative?.totals?.idleTimeSec ?? 0
  );

  const averagedManaTimeline = buildAverageTimeSeries(
    results.map((entry) => entry?.timeline?.mana ?? []),
    params.durationSeconds,
    TIMELINE_RATE_SAMPLE_STEP_SECONDS,
    "linear"
  );
  const averagedManaTail = averagedManaTimeline[averagedManaTimeline.length - 1];
  const averagedManaRemainingFromTimeline = Math.max(0, averagedManaTail?.value ?? 0);
  if (Number.isFinite(averagedManaRemainingFromTimeline)) {
    averagedTotals.manaRemaining = averagedManaRemainingFromTimeline;
    if (Number.isFinite(averagedTotals.manaRecovered)) {
      averagedTotals.totalManaSpent = Math.max(
        0,
        params.manaPool + averagedTotals.manaRecovered - averagedTotals.manaRemaining
      );
    }
  }
  const averagedHealingRateRaw = buildAverageTimeSeries(
    results.map((entry) => entry?.timeline?.healingRateRaw ?? entry?.timeline?.healingRate ?? []),
    params.durationSeconds,
    TIMELINE_RATE_SAMPLE_STEP_SECONDS,
    "linear"
  );
  const averagedHealingRate = smoothTimeSeries(averagedHealingRateRaw, HEALING_GRAPH_SMOOTHING_SECONDS);
  const averagedAtonementCount = compressStepSeries(
    buildAverageTimeSeries(
      results.map((entry) => entry?.timeline?.atonementCount ?? []),
      params.durationSeconds,
      TIMELINE_RATE_SAMPLE_STEP_SECONDS,
      "step"
    )
  );
  if (!averagedAtonementCount.length || averagedAtonementCount[0].time > 0) {
    averagedAtonementCount.unshift({ time: 0, value: averagedAtonementCount[0]?.value ?? 0 });
  }
  const averagedAtonementTail = averagedAtonementCount[averagedAtonementCount.length - 1];
  if (!averagedAtonementTail || averagedAtonementTail.time < params.durationSeconds - STATE_EPSILON) {
    averagedAtonementCount.push({
      time: roundToOneDecimal(params.durationSeconds),
      value: averagedAtonementTail?.value ?? 0
    });
  }

  const mergedWarnings = mergeWarningsFromRuns(results);
  const castsBySpell = averageNumericObject(results.map((entry) => entry?.castsBySpell ?? {}));
  const averagedSpellContribution = buildAveragedSpellContributionFromRuns(results);
  const alignedActionTimeline = alignActionTimelineManaWithSeries(
    representative?.actionTimeline ?? [],
    averagedManaTimeline,
    params.manaPool
  );

  return {
    ...representative,
    warnings: mergedWarnings,
    idleBreakdown: averagedIdleBreakdown,
    castsBySpell,
    totals: {
      ...representative.totals,
      ...averagedTotals
    },
    fillerTotals: {
      ...representative.fillerTotals,
      ...averagedFillerTotals
    },
    spellContribution:
      averagedSpellContribution?.rows?.length
        ? averagedSpellContribution
        : representative?.spellContribution ??
        buildSpellContributionSummaryFromEvents(representative?.timeline?.debug?.spellEvents ?? []),
    actionTimeline: alignedActionTimeline,
    timeline: {
      ...representative.timeline,
      mana: averagedManaTimeline,
      healingRate: averagedHealingRate,
      healingRateRaw: averagedHealingRateRaw,
      atonementCount: averagedAtonementCount,
      // Keep representative run spell-events for per-spell breakdown sections.
      debug: representative.timeline?.debug ?? { spellEvents: [] }
    },
    monteCarlo: {
      runCount,
      probabilityMode: SOLVER_PROBABILITY_MODE,
      totalHpsStdDev: standardDeviation(
        results.map((entry) => entry?.totals?.totalHps ?? 0),
        avgHps
      ),
      manaRemainingStdDev: standardDeviation(
        results.map((entry) => entry?.totals?.manaRemaining ?? 0),
        avgManaRemaining
      ),
      castsPerMinuteStdDev: standardDeviation(
        results.map((entry) => entry?.totals?.castsPerMinute ?? 0),
        avgCpm
      )
    }
  };
}

async function simulateRampPlanMonteCarloAsync(
  params,
  requestedRuns = MONTE_CARLO_DEFAULT_RUNS,
  onProgress = null
) {
  const runCount = Math.max(1, Math.round(parseNumber(requestedRuns, MONTE_CARLO_DEFAULT_RUNS)));
  const progressTotalSteps = runCount + 1;
  const yieldToUi = () =>
    new Promise((resolve) => {
      if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(() => resolve());
      } else {
        setTimeout(resolve, 0);
      }
    });
  const results = [];
  for (let runIndex = 0; runIndex < runCount; runIndex += 1) {
    results.push(simulateRampPlan(params));
    if (typeof onProgress === "function") {
      onProgress(runIndex + 1, progressTotalSteps);
    }
    // Yield to UI every iteration so progress updates paint smoothly.
    // eslint-disable-next-line no-await-in-loop
    await yieldToUi();
  }
  if (!results.length) {
    return simulateRampPlan(params);
  }

  const avgHps = averageNumericValues(results.map((entry) => entry?.totals?.totalHps ?? 0));
  const avgManaRemaining = averageNumericValues(results.map((entry) => entry?.totals?.manaRemaining ?? 0));
  const avgCpm = averageNumericValues(results.map((entry) => entry?.totals?.castsPerMinute ?? 0));
  const representative = pickRepresentativeRun(results, avgHps) ?? results[0];
  const averagedTotals = averageNumericObject(results.map((entry) => entry?.totals ?? {}));
  const averagedFillerTotals = averageNumericObject(results.map((entry) => entry?.fillerTotals ?? {}));
  const averagedIdleBreakdown = buildAveragedIdleBreakdown(
    results,
    params.durationSeconds,
    Number.isFinite(averagedTotals.idleTimeSec) ? averagedTotals.idleTimeSec : representative?.totals?.idleTimeSec ?? 0
  );

  const averagedManaTimeline = buildAverageTimeSeries(
    results.map((entry) => entry?.timeline?.mana ?? []),
    params.durationSeconds,
    TIMELINE_RATE_SAMPLE_STEP_SECONDS,
    "linear"
  );
  const averagedManaTail = averagedManaTimeline[averagedManaTimeline.length - 1];
  const averagedManaRemainingFromTimeline = Math.max(0, averagedManaTail?.value ?? 0);
  if (Number.isFinite(averagedManaRemainingFromTimeline)) {
    averagedTotals.manaRemaining = averagedManaRemainingFromTimeline;
    if (Number.isFinite(averagedTotals.manaRecovered)) {
      averagedTotals.totalManaSpent = Math.max(
        0,
        params.manaPool + averagedTotals.manaRecovered - averagedTotals.manaRemaining
      );
    }
  }
  const averagedHealingRateRaw = buildAverageTimeSeries(
    results.map((entry) => entry?.timeline?.healingRateRaw ?? entry?.timeline?.healingRate ?? []),
    params.durationSeconds,
    TIMELINE_RATE_SAMPLE_STEP_SECONDS,
    "linear"
  );
  const averagedHealingRate = smoothTimeSeries(averagedHealingRateRaw, HEALING_GRAPH_SMOOTHING_SECONDS);
  const averagedAtonementCount = compressStepSeries(
    buildAverageTimeSeries(
      results.map((entry) => entry?.timeline?.atonementCount ?? []),
      params.durationSeconds,
      TIMELINE_RATE_SAMPLE_STEP_SECONDS,
      "step"
    )
  );
  if (!averagedAtonementCount.length || averagedAtonementCount[0].time > 0) {
    averagedAtonementCount.unshift({ time: 0, value: averagedAtonementCount[0]?.value ?? 0 });
  }
  const averagedAtonementTail = averagedAtonementCount[averagedAtonementCount.length - 1];
  if (!averagedAtonementTail || averagedAtonementTail.time < params.durationSeconds - STATE_EPSILON) {
    averagedAtonementCount.push({
      time: roundToOneDecimal(params.durationSeconds),
      value: averagedAtonementTail?.value ?? 0
    });
  }

  const mergedWarnings = mergeWarningsFromRuns(results);
  const castsBySpell = averageNumericObject(results.map((entry) => entry?.castsBySpell ?? {}));
  const averagedSpellContribution = buildAveragedSpellContributionFromRuns(results);
  const alignedActionTimeline = alignActionTimelineManaWithSeries(
    representative?.actionTimeline ?? [],
    averagedManaTimeline,
    params.manaPool
  );
  if (typeof onProgress === "function") {
    onProgress(progressTotalSteps, progressTotalSteps);
  }

  return {
    ...representative,
    warnings: mergedWarnings,
    idleBreakdown: averagedIdleBreakdown,
    castsBySpell,
    totals: {
      ...representative.totals,
      ...averagedTotals
    },
    fillerTotals: {
      ...representative.fillerTotals,
      ...averagedFillerTotals
    },
    spellContribution:
      averagedSpellContribution?.rows?.length
        ? averagedSpellContribution
        : representative?.spellContribution ??
        buildSpellContributionSummaryFromEvents(representative?.timeline?.debug?.spellEvents ?? []),
    actionTimeline: alignedActionTimeline,
    timeline: {
      ...representative.timeline,
      mana: averagedManaTimeline,
      healingRate: averagedHealingRate,
      healingRateRaw: averagedHealingRateRaw,
      atonementCount: averagedAtonementCount,
      debug: representative.timeline?.debug ?? { spellEvents: [] }
    },
    monteCarlo: {
      runCount,
      probabilityMode: SOLVER_PROBABILITY_MODE,
      totalHpsStdDev: standardDeviation(
        results.map((entry) => entry?.totals?.totalHps ?? 0),
        avgHps
      ),
      manaRemainingStdDev: standardDeviation(
        results.map((entry) => entry?.totals?.manaRemaining ?? 0),
        avgManaRemaining
      ),
      castsPerMinuteStdDev: standardDeviation(
        results.map((entry) => entry?.totals?.castsPerMinute ?? 0),
        avgCpm
      )
    }
  };
}

function TimeSeriesChart({
  title,
  points,
  durationSeconds,
  strokeClassName,
  fillClassName,
  valueFormatter,
  minFromZero = false,
  strokeOpacity = 1,
  fillOpacity = 1,
  secondaryPoints = null,
  secondaryColor = "#facc15",
  secondaryLabel = "",
  secondaryValueFormatter = (value) => `${Math.round(value)}`,
  secondaryMin = null,
  secondaryMax = null,
  secondaryStrokeOpacity = 0.85,
  secondaryStrokeDasharray = "6 4",
  secondaryStrokeWidth = 1.8,
  markerGroups = []
}) {
  const width = CHART_WIDTH;
  const height = CHART_HEIGHT;
  const padX = 44;
  const padTop = 16;
  const padBottom = 34;
  const chartHeight = height - padTop - padBottom;
  const chartWidth = width - padX * 2;

  const safePoints = points?.length
    ? points
    : [{ time: 0, value: 0 }, { time: Math.max(1, durationSeconds), value: 0 }];
  const values = safePoints.map((point) => point.value);
  let minY = Math.min(...values);
  let maxY = Math.max(...values);

  if (minFromZero) {
    minY = Math.min(0, minY);
  }

  if (Math.abs(maxY - minY) < STATE_EPSILON) {
    minY -= 1;
    maxY += 1;
  }

  const toX = (time) => padX + (clamp(time, 0, durationSeconds) / Math.max(1, durationSeconds)) * chartWidth;
  const toY = (value) => padTop + ((maxY - value) / (maxY - minY)) * chartHeight;
  const linePath = safePoints
    .map((point, index) => `${index === 0 ? "M" : "L"}${toX(point.time).toFixed(2)} ${toY(point.value).toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L${toX(safePoints[safePoints.length - 1].time).toFixed(2)} ${(padTop + chartHeight).toFixed(2)} L${toX(
    safePoints[0].time
  ).toFixed(2)} ${(padTop + chartHeight).toFixed(2)} Z`;
  const yTicks = 5;
  const xTickStepSeconds = CHART_X_TICK_STEP_SECONDS;
  const xTicks = [];
  for (let second = 0; second <= durationSeconds + STATE_EPSILON; second += xTickStepSeconds) {
    xTicks.push(second);
  }
  if (xTicks.length === 0 || Math.abs(xTicks[xTicks.length - 1] - durationSeconds) > STATE_EPSILON) {
    xTicks.push(durationSeconds);
  }
  const activeMarkerGroups = markerGroups.filter((group) => (group.times?.length ?? 0) > 0);
  const hasSecondary = Array.isArray(secondaryPoints) && secondaryPoints.length > 0;
  const secondaryValues = hasSecondary ? secondaryPoints.map((point) => point.value) : [];
  const rawSecondaryMin = hasSecondary ? Math.min(...secondaryValues) : 0;
  const rawSecondaryMax = hasSecondary ? Math.max(...secondaryValues) : 1;
  let secMin = hasSecondary ? (secondaryMin ?? rawSecondaryMin) : 0;
  let secMax = hasSecondary ? (secondaryMax ?? rawSecondaryMax) : 1;
  if (hasSecondary && Math.abs(secMax - secMin) < STATE_EPSILON) {
    secMin -= 1;
    secMax += 1;
  }
  const toSecondaryY = (value) => padTop + ((secMax - value) / Math.max(STATE_EPSILON, secMax - secMin)) * chartHeight;
  const secondaryPath = hasSecondary
    ? secondaryPoints
      .map((point, index) => `${index === 0 ? "M" : "L"}${toX(point.time).toFixed(2)} ${toSecondaryY(point.value).toFixed(2)}`)
      .join(" ")
    : "";

  return (
    <div className="rounded-lg border border-slate-700/80 bg-slate-900/60 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <p className="text-xs font-semibold text-slate-200">{title}</p>
        {hasSecondary ? (
          <span
            className="rounded px-1.5 py-0.5 text-[10px]"
            style={{
              border: `1px solid ${secondaryColor}`,
              color: secondaryColor,
              background: "rgba(2, 6, 23, 0.65)"
            }}
          >
            {secondaryLabel}
          </span>
        ) : null}
        {activeMarkerGroups.map((group) => (
          <span
            className="rounded px-1.5 py-0.5 text-[10px]"
            key={`legend-${group.id}`}
            style={{
              border: `1px solid ${group.color}`,
              color: group.color,
              background: "rgba(2, 6, 23, 0.65)"
            }}
          >
            {group.label} ({group.times.length})
          </span>
        ))}
      </div>
      <div className="h-[220px] w-full">
        <svg className="h-full w-full" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
          {Array.from({ length: yTicks }, (_, index) => {
            const ratio = index / (yTicks - 1);
            const y = padTop + chartHeight * ratio;
            const value = maxY - (maxY - minY) * ratio;
            return (
              <g key={`y-grid-${index}`}>
                <line stroke="rgb(51 65 85 / 0.6)" strokeDasharray="3 4" strokeWidth="1" x1={padX} x2={padX + chartWidth} y1={y} y2={y} />
                <text fill="rgb(148 163 184)" fontSize="10" textAnchor="end" x={padX - 6} y={y + 3}>
                  {valueFormatter(value)}
                </text>
              </g>
            );
          })}

          {hasSecondary
            ? Array.from({ length: yTicks }, (_, index) => {
              const ratio = index / (yTicks - 1);
              const y = padTop + chartHeight * ratio;
              const value = secMax - (secMax - secMin) * ratio;
              return (
                <text
                  fill={secondaryColor}
                  fontSize="10"
                  key={`y2-grid-${index}`}
                  textAnchor="start"
                  x={padX + chartWidth + 6}
                  y={y + 3}
                >
                  {secondaryValueFormatter(value)}
                </text>
              );
            })
            : null}

          {xTicks.map((second, index) => {
            const ratio = durationSeconds <= 0 ? 0 : second / durationSeconds;
            const x = padX + chartWidth * ratio;
            return (
              <g key={`x-grid-${index}`}>
                <line stroke="rgb(30 41 59 / 0.8)" strokeWidth="1" x1={x} x2={x} y1={padTop} y2={padTop + chartHeight} />
                <text fill="rgb(148 163 184)" fontSize="10" textAnchor="middle" x={x} y={height - 10}>
                  {formatSeconds(second)}
                </text>
              </g>
            );
          })}

          <path className={fillClassName} d={areaPath} fillOpacity={fillOpacity} />
          <path
            className={strokeClassName}
            d={linePath}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={strokeOpacity}
            strokeWidth="2"
          />
          {hasSecondary ? (
            <path
              d={secondaryPath}
              fill="none"
              stroke={secondaryColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={secondaryStrokeOpacity}
              strokeWidth={secondaryStrokeWidth}
              strokeDasharray={secondaryStrokeDasharray}
            />
          ) : null}

          {activeMarkerGroups.flatMap((group) =>
            group.times.map((time, index) => {
              const x = toX(time);
              return (
                <g key={`marker-${group.id}-${index}`}>
                  <line
                    stroke={group.color}
                    strokeDasharray="4 3"
                    strokeOpacity="0.95"
                    strokeWidth="1.4"
                    x1={x}
                    x2={x}
                    y1={padTop}
                    y2={padTop + chartHeight}
                  />
                  <circle cx={x} cy={padTop + 3} fill={group.color} r="2.4" />
                </g>
              );
            })
          )}
        </svg>
      </div>
      {activeMarkerGroups.length ? (
        <div className="mt-2 space-y-1">
          {activeMarkerGroups.map((group) => (
            <p className="text-[10px] text-slate-300" key={`times-${group.id}`}>
              <span style={{ color: group.color }}>{group.label}</span>: {group.times.map((time) => formatSeconds(time)).join(", ")}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SpellContributionTable({ items }) {
  if (!items?.length) {
    return (
      <p className="rounded-md border border-dashed border-slate-600 bg-gray-950/55 px-3 py-2 text-xs text-slate-400">
        스킬별 누적 힐 데이터가 없습니다.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-700/80 bg-gray-950/60">
      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,2.4fr)_72px] border-b border-slate-700/80 bg-slate-900/80 px-2 py-1.5 text-[11px] font-semibold text-slate-300">
        <p>이름</p>
        <p>퍼센트 / 총량</p>
        <p className="text-right">시전수</p>
      </div>
      <div className="divide-y divide-slate-800/80">
        {items.map((item) => (
          <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,2.4fr)_72px] items-center gap-2 px-2 py-1.5 text-[11px]" key={`spell-contrib-${item.key}`}>
            <div className="flex items-center gap-2 text-slate-100">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="truncate font-medium">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-right text-slate-300">{item.pct.toFixed(2)}%</span>
              <div className="h-2 flex-1 overflow-hidden rounded bg-slate-800/80">
                <div
                  className="h-full rounded"
                  style={{
                    width: `${Math.max(0.3, item.pct)}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
              <span className="w-14 shrink-0 text-right text-slate-300">{formatCompactAmount(item.total)}</span>
            </div>
            <p className="text-right text-slate-200">{item.casts}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CombinedTimeline({
  durationSeconds,
  trackRef,
  apostleTimes,
  ultimateTimes,
  onStartDrag,
  apostleMarkerMin,
  ultimateMarkerMin
}) {
  const minuteCount = Math.floor(durationSeconds / 60);

  return (
    <div className="rounded-lg border border-slate-700/80 bg-slate-900/60 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-100">사도/궁참 통합 타임라인</p>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span className="rounded border border-violet-400/40 bg-violet-500/10 px-2 py-0.5 text-violet-200">사도 CD 1분 30초</span>
          <span className="rounded border border-violet-400/40 bg-violet-500/10 px-2 py-0.5 text-violet-200">궁참 CD 4분</span>
        </div>
      </div>
      <p className="mb-3 text-xs text-slate-400">
        한 트랙에서 두 마커를 모두 드래그해 시점을 배치합니다. 사도/궁참은 서로 최소 {EFFECTIVE_CROSS_MAJOR_MIN_GAP_SECONDS}초 이상 떨어져야 하며,
        첫 사용 가능 시점은 사도 {apostleMarkerMin.toFixed(1)}초, 궁참 {ultimateMarkerMin.toFixed(1)}초입니다.
        전투시간 제약으로 간격 충돌이 해소되지 않으면 사도 우선으로 궁참이 자동 제외됩니다.
      </p>

      <div className="relative rounded-md border border-slate-700 bg-gray-950/80 px-2 py-4">
        <div className="pointer-events-none absolute inset-x-2 top-0 h-full">
          {Array.from({ length: minuteCount + 1 }, (_, index) => {
            const ratio = (index * 60) / durationSeconds;
            return (
              <div className="absolute bottom-0 top-0" key={`tick-${index}`} style={{ left: `${ratio * 100}%` }}>
                <div className="h-full w-px bg-slate-800" />
                <span className="absolute -top-4 -translate-x-1/2 text-[10px] text-slate-500">{index}m</span>
              </div>
            );
          })}
        </div>

        <div className="relative h-12" ref={trackRef}>
          {apostleTimes.map((time, index) => {
            const ratio = durationSeconds <= 0 ? 0 : time / durationSeconds;
            return (
              <button
                className="absolute top-[32%] h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300 bg-violet-300 text-[11px] font-bold text-slate-950 shadow"
                key={`apostle-marker-${index}`}
                onMouseDown={(event) => onStartDrag("apostle", index, event)}
                onTouchStart={(event) => onStartDrag("apostle", index, event)}
                style={{ left: `${ratio * 100}%` }}
                type="button"
              >
                A{index + 1}
              </button>
            );
          })}

          {ultimateTimes.map((time, index) => {
            const ratio = durationSeconds <= 0 ? 0 : time / durationSeconds;
            return (
              <button
                className="absolute top-[72%] h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300 bg-violet-300 text-[11px] font-bold text-slate-950 shadow"
                key={`ultimate-marker-${index}`}
                onMouseDown={(event) => onStartDrag("ultimate", index, event)}
                onTouchStart={(event) => onStartDrag("ultimate", index, event)}
                style={{ left: `${ratio * 100}%` }}
                type="button"
              >
                U{index + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <div>
          <p className="mb-1 text-[11px] font-semibold text-violet-200">사도 시점</p>
          <div className="flex flex-wrap gap-1.5">
            {apostleTimes.map((time, index) => (
              <span className="rounded border border-violet-700/60 bg-violet-950/35 px-2 py-0.5 text-[11px] text-violet-100" key={`apostle-time-${index}`}>
                A{index + 1}: {formatSeconds(time)}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1 text-[11px] font-semibold text-violet-200">궁참 시점</p>
          <div className="flex flex-wrap gap-1.5">
            {ultimateTimes.map((time, index) => (
              <span className="rounded border border-violet-700/60 bg-violet-950/35 px-2 py-0.5 text-[11px] text-violet-100" key={`ultimate-time-${index}`}>
                U{index + 1}: {formatSeconds(time)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DisciplineRampSimulator() {
  const [manaPoolInput, setManaPoolInput] = useState(String(DEFAULT_MANA_POOL));
  const [critChanceInput, setCritChanceInput] = useState(String(DEFAULT_CRIT_CHANCE_PCT));
  const [durationMinutesInput, setDurationMinutesInput] = useState(String(DEFAULT_DURATION_MINUTES));
  const [hasteInput, setHasteInput] = useState(String(DEFAULT_HASTE_PCT));
  const [masteryInput, setMasteryInput] = useState(String(DEFAULT_MASTERY_ATONEMENT_TARGET_BONUS_PCT));
  const [intellectInput, setIntellectInput] = useState(String(DEFAULT_INTELLECT));
  const [result, setResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runProgress, setRunProgress] = useState(0);
  const progressPct = clamp(runProgress, 0, 1) * 100;

  const durationMinutes = clamp(parseNumber(durationMinutesInput, DEFAULT_DURATION_MINUTES), 2, 9);
  const durationSeconds = durationMinutes * 60;
  const manaPool = clamp(parseNumber(manaPoolInput, DEFAULT_MANA_POOL), 1, 5_000_000);
  const manaRegenPer5Sec = (manaPool * DEFAULT_MANA_REGEN_PCT_PER_5S) / 100;
  const critChancePct = clamp(parseNumber(critChanceInput, DEFAULT_CRIT_CHANCE_PCT), 0, 100);
  const hastePct = clamp(parseNumber(hasteInput, DEFAULT_HASTE_PCT), 0, 100);
  const masteryPct = clamp(parseNumber(masteryInput, DEFAULT_MASTERY_ATONEMENT_TARGET_BONUS_PCT), 0, 500);
  const intellect = clamp(parseNumber(intellectInput, DEFAULT_INTELLECT), 0, 100000);
  const spellManaCosts = DEFAULT_SPELL_MANA_PCT;
  const talentRuntime = useMemo(
    () =>
      normalizeTalentRuntime({
        voidShieldProcChancePct: DEFAULT_VOID_SHIELD_PROC_CHANCE_PCT,
        critChancePct,
        masteryAtonementTargetBonusPct: masteryPct
      }),
    [critChancePct, masteryPct]
  );
  const apostleMarkerMin = useMemo(() => roundToOneDecimal(getMajorMarkerMinimum("apostle", hastePct)), [hastePct]);
  const ultimateMarkerMin = useMemo(() => roundToOneDecimal(getMajorMarkerMinimum("ultimate", hastePct)), [hastePct]);

  const [apostleTimes, setApostleTimes] = useState(() =>
    buildInitialMajorCastTimes(DEFAULT_INITIAL_DURATION_SECONDS, DEFAULT_INITIAL_HASTE_PCT).apostleTimes
  );
  const [ultimateTimes, setUltimateTimes] = useState(() =>
    buildInitialMajorCastTimes(DEFAULT_INITIAL_DURATION_SECONDS, DEFAULT_INITIAL_HASTE_PCT).ultimateTimes
  );
  const [dragState, setDragState] = useState(null);

  const unifiedTrackRef = useRef(null);
  const apostleTimesRef = useRef(apostleTimes);
  const ultimateTimesRef = useRef(ultimateTimes);

  const transferTable = useMemo(() => buildTransferTable(ATONEMENT_TRANSFER_MAX_TARGETS), []);
  const spellFinalDebugRows = useMemo(
    () =>
      buildSpellFinalDebugRows({
        intellect,
        transferTable,
        talentRuntime
      }),
    [intellect, transferTable, talentRuntime]
  );
  const penanceDebug = useMemo(
    () => spellFinalDebugRows.find((row) => row.key === SPELLS.penance.key)?.note ?? null,
    [spellFinalDebugRows]
  );
  const spellContributionBars = useMemo(() => {
    const fromResult = result?.spellContribution?.rows;
    if (Array.isArray(fromResult) && fromResult.length) {
      return fromResult;
    }
    const fallback = buildSpellContributionSummaryFromEvents(result?.timeline?.debug?.spellEvents ?? []);
    return fallback.rows ?? [];
  }, [result]);
  const apostleBuffWindows = useMemo(() => {
    const spellEvents = result?.timeline?.debug?.spellEvents ?? [];
    const majors = result?.majorEvents ?? [];
    if (!spellEvents.length || !majors.length) {
      return [];
    }

    const buffDurationSec =
      parseNumber(talentRuntime?.archangelBuffDurationSec, DEFAULT_TALENT_RUNTIME.archangelBuffDurationSec) || 18;
    const EPS = STATE_EPSILON;

    return majors
      .filter((event) => event.type === "apostle" && event.markerCastEnd != null)
      .map((event) => {
        const start = event.markerCastEnd;
        const buffEnd = Math.min(durationSeconds, event.markerCastEnd + buffDurationSec);
        const end = buffEnd;
        const rowsBySpell = new Map();
        const castEntries = [];
        let total = 0;
        let direct = 0;
        let atonement = 0;

        for (const spellEvent of spellEvents) {
          if (spellEvent.time < start - EPS || spellEvent.time > end + EPS) {
            continue;
          }
          const delta = Math.max(0, spellEvent.deltaHealing ?? 0);
          if (delta <= EPS) {
            continue;
          }
          const directDelta = Math.max(0, spellEvent.directDelta ?? 0);
          const atonementDelta = Math.max(0, spellEvent.atonementDelta ?? 0);
          total += delta;
          direct += directDelta;
          atonement += atonementDelta;

          if (spellEvent.source !== "dot") {
            castEntries.push({
              time: spellEvent.time,
              spellKey: spellEvent.spellKey || "unknown",
              total: delta,
              direct: directDelta,
              atonement: atonementDelta
            });
          }

          const key = spellEvent.spellKey || "unknown";
          const current = rowsBySpell.get(key) ?? {
            key,
            name: SPELL_NAME_BY_KEY[key] ?? key,
            total: 0,
            direct: 0,
            atonement: 0,
            casts: 0
          };
          current.total += delta;
          current.direct += directDelta;
          current.atonement += atonementDelta;
          if (spellEvent.source !== "dot") {
            current.casts += 1;
          }
          rowsBySpell.set(key, current);
        }

        const rows = [...rowsBySpell.values()]
          .map((row) => ({
            ...row,
            pct: total > EPS ? (row.total / total) * 100 : 0
          }))
          .sort((a, b) => b.total - a.total);
        castEntries.sort((a, b) => a.time - b.time);

        return {
          id: event.id,
          label: event.label,
          start,
          end,
          duration: Math.max(0, end - start),
          total,
          direct,
          atonement,
          atonementPct: total > EPS ? (atonement / total) * 100 : 0,
          rows,
          castEntries
        };
      })
      .filter((entry) => entry.end > entry.start + EPS);
  }, [durationSeconds, result, talentRuntime]);

  useEffect(() => {
    apostleTimesRef.current = apostleTimes;
  }, [apostleTimes]);

  useEffect(() => {
    ultimateTimesRef.current = ultimateTimes;
  }, [ultimateTimes]);

  useEffect(() => {
    const nextApostle = reconcileCastTimes(apostleTimesRef.current, durationSeconds, APOSTLE_COOLDOWN_SECONDS, apostleMarkerMin);
    const nextUltimate = reconcileCastTimes(ultimateTimesRef.current, durationSeconds, ULTIMATE_COOLDOWN_SECONDS, ultimateMarkerMin);
    const sanitized = enforceCrossMajorGap({
      apostleTimes: nextApostle,
      ultimateTimes: nextUltimate,
      durationSeconds,
      apostleMinStart: apostleMarkerMin,
      ultimateMinStart: ultimateMarkerMin,
      minGapSeconds: EFFECTIVE_CROSS_MAJOR_MIN_GAP_SECONDS
    });
    const culled = cullUltimateTimesByApostlePriority(
      sanitized.apostleTimes,
      sanitized.ultimateTimes,
      EFFECTIVE_CROSS_MAJOR_MIN_GAP_SECONDS
    );

    setApostleTimes(sanitized.apostleTimes);
    setUltimateTimes(culled.ultimateTimes);
    setResult(null);
  }, [durationSeconds, apostleMarkerMin, ultimateMarkerMin]);

  useEffect(() => {
    if (!dragState) {
      return undefined;
    }

    const updateFromClientX = (clientX) => {
      const ref = unifiedTrackRef.current;
      const cooldown = dragState.type === "apostle" ? APOSTLE_COOLDOWN_SECONDS : ULTIMATE_COOLDOWN_SECONDS;
      const minStart = dragState.type === "apostle" ? apostleMarkerMin : ultimateMarkerMin;

      if (!ref) {
        return;
      }

      const rect = ref.getBoundingClientRect();
      const ratio = clamp((clientX - rect.left) / Math.max(1, rect.width), 0, 1);
      const nextValue = roundToOneDecimal(ratio * durationSeconds);
      const nextApostle = [...apostleTimesRef.current];
      const nextUltimate = [...ultimateTimesRef.current];

      if (dragState.type === "apostle") {
        nextApostle[dragState.index] = nextValue;
      } else {
        nextUltimate[dragState.index] = nextValue;
      }

      const normalized = dragState.type === "apostle"
        ? {
          apostleTimes: normalizeCastTimes(nextApostle, durationSeconds, cooldown, minStart),
          ultimateTimes: nextUltimate
        }
        : {
          apostleTimes: nextApostle,
          ultimateTimes: normalizeCastTimes(nextUltimate, durationSeconds, cooldown, minStart)
        };

      const sanitized = enforceCrossMajorGap({
        apostleTimes: normalized.apostleTimes,
        ultimateTimes: normalized.ultimateTimes,
        durationSeconds,
        apostleMinStart: apostleMarkerMin,
        ultimateMinStart: ultimateMarkerMin,
        minGapSeconds: EFFECTIVE_CROSS_MAJOR_MIN_GAP_SECONDS
      });

      setApostleTimes(sanitized.apostleTimes);
      setUltimateTimes(sanitized.ultimateTimes);
      setResult(null);
    };

    const handleMouseMove = (event) => {
      updateFromClientX(event.clientX);
    };

    const handleTouchMove = (event) => {
      if (!event.touches[0]) {
        return;
      }
      event.preventDefault();
      updateFromClientX(event.touches[0].clientX);
    };

    const stopDrag = () => {
      setDragState(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", stopDrag);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", stopDrag);
    };
  }, [dragState, durationSeconds, apostleMarkerMin, ultimateMarkerMin]);

  const startDrag = (type, index, event) => {
    event.preventDefault();
    setDragState({ type, index });
  };

  const runSimulation = async () => {
    if (isRunning) {
      return;
    }
    const sanitized = enforceCrossMajorGap({
      apostleTimes,
      ultimateTimes,
      durationSeconds,
      apostleMinStart: apostleMarkerMin,
      ultimateMinStart: ultimateMarkerMin,
      minGapSeconds: EFFECTIVE_CROSS_MAJOR_MIN_GAP_SECONDS
    });
    const culled = cullUltimateTimesByApostlePriority(
      sanitized.apostleTimes,
      sanitized.ultimateTimes,
      EFFECTIVE_CROSS_MAJOR_MIN_GAP_SECONDS
    );
    setApostleTimes(sanitized.apostleTimes);
    setUltimateTimes(culled.ultimateTimes);
    setResult(null);
    setIsRunning(true);
    setRunProgress(0.001);

    try {
      // Let UI paint "running" state before heavy work starts.
      await new Promise((resolve) => setTimeout(resolve, 0));
      const nextResult = await simulateRampPlanMonteCarloAsync(
        {
          manaPool,
          manaCosts: spellManaCosts,
          intellect,
          manaRegenPer5Sec,
          durationSeconds,
          hastePct,
          apostleTimes: sanitized.apostleTimes,
          ultimateTimes: culled.ultimateTimes,
          transferTable,
          talentRuntime
        },
        MONTE_CARLO_DEFAULT_RUNS,
        (done, total) => {
          const ratio = done / Math.max(1, total);
          setRunProgress((prev) => Math.max(prev, ratio));
        }
      );
      if (culled.dropped.length) {
        nextResult.warnings = [
          ...culled.dropped.map(
            (entry) =>
              `궁참 ${entry.index + 1} 제외: 사도 ${entry.apostleIndex + 1}과 ${EFFECTIVE_CROSS_MAJOR_MIN_GAP_SECONDS}초 미만 충돌 (${formatSeconds(entry.time)} vs ${formatSeconds(entry.apostleTime)}), 사도 우선`
          ),
          ...(nextResult.warnings ?? [])
        ];
      }
      setResult(nextResult);
    } finally {
      setRunProgress(1);
      await new Promise((resolve) => setTimeout(resolve, 0));
      setIsRunning(false);
    }
  };

  return (
    <section className="mt-6 space-y-6 rounded-2xl border border-violet-400/20 bg-gray-950/55 p-5 md:p-6">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-violet-200">Simulation Lab</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-100">수사 속죄 시뮬레이터</h2>
        <p className="mt-2 text-sm text-slate-300">
          전투시간 안에서 사도/궁참 시점을 직접 배치하고, 사도/궁참 램프는 고정 시퀀스로 수행합니다.
          나머지 필러 구간은 회개→보막 강제 세트를 기반으로 광휘/간청/성격/정분 조합을 함께 최적화합니다.
          남는 글로벌을 자동 계산해 최대 유효힐 구성을 산출합니다. 메이저 램프는 20인 속죄 적용/만료 순서를 시간축으로 추적하며, 딜/힐 값은 지능 입력값을 반영합니다.
        </p>
      </header>

      <section className="rounded-lg border border-amber-400/35 bg-amber-950/20 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-200">Disclaimer</p>
        <div className="mt-2 space-y-1 text-xs text-amber-100/90">
          <p>이 시뮬레이터는 모든 스킬이 유효힐로 들어가는 이상적인 환경(오버힐/무빙 손실 최소)을 가정합니다.</p>
          <p>실전 변수(타겟 사망, 산개/거리, 외부 쿨기, 특정 네임드 기믹, 지연/입력 실수)는 반영하지 않습니다.</p>
          <p>일부 복잡한 특성 상호작용은 단순화 또는 미구현이며, 결과는 절대값보다 빌드/타임라인 비교 지표로 사용하는 것을 권장합니다.</p>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-6">
        <label className="rounded-lg border border-slate-700/80 bg-slate-900/70 p-3">
          <p className="text-xs text-slate-400">전투시간 (분, 2~9)</p>
          <input
            className="mt-1 w-full rounded-md border border-slate-600 bg-gray-950 px-2.5 py-2 text-sm text-slate-100 outline-none focus:border-violet-400"
            max={9}
            min={2}
            onChange={(event) => {
              setDurationMinutesInput(event.target.value);
              setResult(null);
            }}
            step={0.5}
            type="number"
            value={durationMinutesInput}
          />
        </label>

        <label className="rounded-lg border border-slate-700/80 bg-slate-900/70 p-3">
          <p className="text-xs text-slate-400">기본 마나</p>
          <input
            className="mt-1 w-full rounded-md border border-slate-600 bg-gray-950 px-2.5 py-2 text-sm text-slate-100 outline-none focus:border-violet-400"
            min={1}
            onChange={(event) => {
              setManaPoolInput(event.target.value);
              setResult(null);
            }}
            type="number"
            value={manaPoolInput}
          />
        </label>

        <label className="rounded-lg border border-slate-700/80 bg-slate-900/70 p-3">
          <p className="text-xs text-slate-400">지능</p>
          <input
            className="mt-1 w-full rounded-md border border-slate-600 bg-gray-950 px-2.5 py-2 text-sm text-slate-100 outline-none focus:border-violet-400"
            max={100000}
            min={0}
            onChange={(event) => {
              setIntellectInput(event.target.value);
              setResult(null);
            }}
            step={1}
            type="number"
            value={intellectInput}
          />
        </label>

        <label className="rounded-lg border border-slate-700/80 bg-slate-900/70 p-3">
          <p className="text-xs text-slate-400">가속 %</p>
          <input
            className="mt-1 w-full rounded-md border border-slate-600 bg-gray-950 px-2.5 py-2 text-sm text-slate-100 outline-none focus:border-violet-400"
            max={100}
            min={0}
            onChange={(event) => {
              setHasteInput(event.target.value);
              setResult(null);
            }}
            step={0.1}
            type="number"
            value={hasteInput}
          />
        </label>

        <label className="rounded-lg border border-slate-700/80 bg-slate-900/70 p-3">
          <p className="text-xs text-slate-400">특화 %</p>
          <input
            className="mt-1 w-full rounded-md border border-slate-600 bg-gray-950 px-2.5 py-2 text-sm text-slate-100 outline-none focus:border-violet-400"
            max={500}
            min={0}
            onChange={(event) => {
              setMasteryInput(event.target.value);
              setResult(null);
            }}
            step={0.1}
            type="number"
            value={masteryInput}
          />
        </label>

        <label className="rounded-lg border border-slate-700/80 bg-slate-900/70 p-3">
          <p className="text-xs text-slate-400">치명타 확률 %</p>
          <input
            className="mt-1 w-full rounded-md border border-slate-600 bg-gray-950 px-2.5 py-2 text-sm text-slate-100 outline-none focus:border-violet-400"
            max={100}
            min={0}
            onChange={(event) => {
              setCritChanceInput(event.target.value);
              setResult(null);
            }}
            step={0.1}
            type="number"
            value={critChanceInput}
          />
        </label>
      </div>
      <p className="text-[11px] text-slate-400">
        기본 마나 회복은 자동으로 5초마다 최대 마나의 {DEFAULT_MANA_REGEN_PCT_PER_5S}%가 적용됩니다. (현재{" "}
        {Math.round(manaRegenPer5Sec).toLocaleString()}/5초)
      </p>

      <p className="text-xs text-slate-400">
        확률 효과(치명타/공허 보호막)는 랜덤 롤로 처리되고, 결과는 매 실행 시 {MONTE_CARLO_DEFAULT_RUNS}회 평균으로 집계됩니다.
        적용: 고통(즉시/도트), 순치, 간청, 광휘, 보호막/공허보호막, 정분, 성격, 궁참, 회개(아군치유).
        회개 속죄 1인당 고정치에는 치명타를 적용하지 않습니다. 순치/회개 아군치유 치명타 시 아이기스(치유량의 30% 보호막)가 랜덤으로 발생합니다.
      </p>
      <p className="text-xs text-slate-400">
        특화(근사): 속죄가 걸린 대상의 치유/흡수에 +{talentRuntime.masteryAtonementTargetBonusPct?.toFixed?.(1) ?? "45.0"}%를 반영합니다.
        값은 `/Users/starry99/Dev/healer/src/data/simulators/disciplineSimulatorReference.js`에서 조절할 수 있습니다.
      </p>
      {LOG_CALIBRATION_ENABLED ? (
        <p className="text-xs text-amber-200/90">
          로그 보정 활성화: {LOG_CALIBRATION_REFERENCE} 기준으로 회개/정분/성격/궁참/보막/순치/광휘의 per-cast 계수를 스케일합니다.
        </p>
      ) : null}

      <CombinedTimeline
        apostleTimes={apostleTimes}
        apostleMarkerMin={apostleMarkerMin}
        durationSeconds={durationSeconds}
        onStartDrag={startDrag}
        trackRef={unifiedTrackRef}
        ultimateMarkerMin={ultimateMarkerMin}
        ultimateTimes={ultimateTimes}
      />

      <div className="flex items-center justify-end">
        <button
          className="rounded-lg border border-violet-300/70 bg-violet-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:border-violet-400/30 disabled:bg-violet-300/40 disabled:text-slate-300"
          disabled={isRunning}
          onClick={runSimulation}
          type="button"
        >
          {isRunning ? `시뮬레이션 실행 중... ${Math.round(progressPct)}%` : "시뮬레이션 시작"}
        </button>
      </div>
      {isRunning ? (
        <div className="space-y-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80">
            <div
              className="h-full rounded-full bg-violet-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      ) : null}

      {result ? (
        <section className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-slate-700/80 bg-slate-900/70 p-3">
              <p className="text-xs text-slate-400">전투 종료 남은 마나</p>
              <p className="text-[11px] text-slate-500">
                {((result.totals.manaRemaining / Math.max(1, manaPool)) * 100).toFixed(1)}% ({Math.round(result.totals.manaRemaining).toLocaleString()})
              </p>
              <p className={`mt-1 text-lg font-semibold ${result.totals.manaRemaining >= 0 ? "text-emerald-200" : "text-rose-300"}`}>
                {((result.totals.manaRemaining / Math.max(1, manaPool)) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500">
                총 소모 {((result.totals.totalManaSpent / Math.max(1, manaPool)) * 100).toFixed(1)}% ({Math.round(result.totals.totalManaSpent).toLocaleString()})
              </p>
              <p className="text-xs text-slate-500">
                회복 {Math.round(result.totals.manaRecovered).toLocaleString()} (기본 {DEFAULT_MANA_REGEN_PCT_PER_5S}%/5초 ={" "}
                {Math.round(manaRegenPer5Sec).toLocaleString()}/5초, 보호막 환급 {Math.round(result.totals.shieldRefunded).toLocaleString()})
              </p>
            </div>

            <div className="rounded-lg border border-slate-700/80 bg-slate-900/70 p-3">
              <p className="text-xs text-slate-400">총 HPS (지능 반영 추정치)</p>
              <p className="mt-1 text-lg font-semibold text-violet-100">{result.totals.totalHps.toFixed(2)}</p>
              <p className="text-xs text-slate-500">단위: 임의 단위 / sec</p>
            </div>

            <div className="rounded-lg border border-slate-700/80 bg-slate-900/70 p-3">
              <p className="text-xs text-slate-400">최종 CPM</p>
              <p
                className={`mt-1 text-lg font-semibold ${result.totals.castsPerMinute >= 45 && result.totals.castsPerMinute <= 50 ? "text-emerald-200" : "text-amber-200"
                  }`}
              >
                {result.totals.castsPerMinute.toFixed(1)}
              </p>
              <p className="text-xs text-slate-500">
                총 시전 {result.monteCarlo ? result.totals.totalCasts.toFixed(1) : result.totals.totalCasts}회 / {durationMinutes.toFixed(1)}분 (일반 목표 45~50)
              </p>
              <p className="text-xs text-slate-500">
                글쿨 idle {result.totals.idleTimeSec.toFixed(1)}초 ({result.totals.idlePct.toFixed(1)}%, 약 {result.totals.idleGcdEquivalent.toFixed(1)} GCD)
              </p>
              {result.idleBreakdown?.reasons?.length ? (
                <div className="mt-2 space-y-0.5 text-[11px] text-slate-500">
                  {result.idleBreakdown.reasons.slice(0, 5).map((reason) => (
                    <p key={`idle-reason-${reason.key}`}>
                      {reason.label}: {reason.seconds.toFixed(1)}초 ({reason.pctOfIdle.toFixed(1)}%)
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          {result.monteCarlo ? (
            <p className="text-[11px] text-slate-400">
              시뮬레이션 {result.monteCarlo.runCount}회 평균 결과입니다. (탐색 확률 모드: {result.monteCarlo.probabilityMode}, HPS 표준편차 {result.monteCarlo.totalHpsStdDev.toFixed(1)}, CPM 표준편차{" "}
              {result.monteCarlo.castsPerMinuteStdDev.toFixed(2)}, 남은 마나 표준편차 {result.monteCarlo.manaRemainingStdDev.toFixed(0)}). 상세 스킬 타임라인/스킬별 표는
              평균 HPS에 가장 가까운 대표 1회를 표시합니다.
            </p>
          ) : null}

          <div className="rounded-lg border border-slate-700/80 bg-slate-900/60 p-3">
            <h3 className="text-sm font-semibold text-slate-100">스킬 최종 계산 (디버그)</h3>
            <p className="mt-1 text-[11px] text-slate-400">
              표의 `기준759` 값은 실측 원본(지능 759)입니다. `현재 지능 환산`은 입력 지능으로 선형 환산한 값입니다.
              `최종 적용값`은 기본적으로 비치명 기준이며, 괄호 안에 치명 기대값을 함께 표시합니다.
              표는 속죄 치유를 제외한 직접치유 기준이며,
              회개는 아래에 기본값 대비 최종 증폭 배율을 별도로 표시합니다. `특성 가중치`는 `적용(최종식)`과 `내장(base에 이미 포함)`을 구분해 표시합니다.
              회개 딜 계수는 `/Users/starry99/Dev/healer/src/data/simulators/disciplineSimulatorReference.js`의
              `penanceDamageBaseCoefPerIntellect`, `penanceDamageTalentMultiplier`, `penanceSecondBoltAdjustmentMultiplier`로 직접 조절됩니다.
            </p>
            <div className="mt-2 overflow-hidden rounded border border-slate-700/70">
              <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1.2fr)] border-b border-slate-700/80 bg-slate-900/80 px-2 py-1 text-[10px] font-semibold text-slate-300">
                <p>스킬</p>
                <p className="text-right">기본값(지능*계수)</p>
                <p className="text-right">특성 가중치</p>
                <p className="text-right">WCL 보정</p>
                <p className="text-right">치명 기대</p>
                <p className="text-right">최종 적용값</p>
              </div>
              <div className="divide-y divide-slate-800/70 bg-gray-950/40">
                {spellFinalDebugRows.map((row) => (
                  <div
                    className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1.2fr)] items-center gap-2 px-2 py-1 text-[10px]"
                    key={`spell-final-debug-${row.key}`}
                  >
                    <p className="truncate text-slate-100">{row.name}</p>
                    <div className="text-right text-slate-300">
                      <p>
                        피(기준759): {row.damageReferenceValue != null ? formatCompactAmount(row.damageReferenceValue) : "-"}
                      </p>
                      <p>
                        치(기준759): {row.directReferenceValue != null ? formatCompactAmount(row.directReferenceValue) : "-"}
                      </p>
                      <p className="text-[9px] text-slate-500">
                        현재 지능 환산: 피 {row.damageBaseValue != null ? formatCompactAmount(row.damageBaseValue) : "-"} / 치{" "}
                        {row.directBaseValue != null ? formatCompactAmount(row.directBaseValue) : "-"}
                      </p>
                    </div>
                    <div className="text-right text-slate-300">
                      <p>
                        피:{" "}
                        {row.damageBaseValue != null
                          ? `적용 ${row.damageAppliedTalentWeight.toFixed(3)}x / 내장 ${row.damageTalentWeightEmbedded != null ? `${row.damageTalentWeightEmbedded.toFixed(3)}x` : "-"
                          }`
                          : "-"}
                      </p>
                      <p>
                        치:{" "}
                        {row.directBaseValue != null
                          ? `적용 ${row.directAppliedTalentWeight.toFixed(3)}x / 내장 ${row.directTalentWeightEmbedded != null ? `${row.directTalentWeightEmbedded.toFixed(3)}x` : "-"
                          }`
                          : "-"}
                      </p>
                    </div>
                    <div className="text-right text-slate-300">
                      <p>피: {row.damageBaseValue != null ? `${row.damageCalibration.toFixed(3)}x` : "-"}</p>
                      <p>치: {row.directBaseValue != null ? `${row.directCalibration.toFixed(3)}x` : "-"}</p>
                    </div>
                    <div className="text-right text-slate-300">
                      <p>피: {row.damageBaseValue != null ? `${row.damageCritWeight.toFixed(3)}x` : "-"}</p>
                      <p>치: {row.directBaseValue != null ? `${row.directCritWeight.toFixed(3)}x` : "-"}</p>
                    </div>
                    <div className="text-right text-slate-200">
                      <p>
                        피: {row.damageBaseValue != null ? formatCompactAmount(row.damagePerCast) : "-"}
                        <span className="text-[9px] text-slate-500">
                          {" "}
                          (치명 기대 {row.damageBaseValue != null ? formatCompactAmount(row.damagePerCastExpected) : "-"})
                        </span>
                      </p>
                      <p>
                        치: {row.directBaseValue != null ? formatCompactAmount(row.directPerCast) : "-"}
                        <span className="text-[9px] text-slate-500">
                          {" "}
                          (치명+아이기스 기대 {row.directBaseValue != null ? formatCompactAmount(row.directPerCastExpected) : "-"})
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {penanceDebug ? (
              <div className="mt-2 rounded border border-slate-700/70 bg-gray-950/45 px-2.5 py-2 text-[11px] text-slate-300">
                <p className="font-semibold text-violet-100">회개 1캐스트 디버그</p>
                <p className="mt-1">
                  모델: 지능 * {penanceDebug.modelBaseCoefPerIntellect.toFixed(3)} *{" "}
                  {penanceDebug.modelTalentMultiplier.toFixed(3)} * {penanceDebug.modelSecondBoltAdjustmentMultiplier.toFixed(3)}(2번째 화살 보정)
                </p>
                <p>
                  피해(보정 전): 기본 {formatCompactAmount(penanceDebug.baseDamage)} → 특성 적용 {formatCompactAmount(penanceDebug.talentAppliedDamage)}
                </p>
                <p>
                  피해: 기본 {formatCompactAmount(penanceDebug.baseDamage)} → 최종 {formatCompactAmount(penanceDebug.finalDamage)} (
                  {penanceDebug.damageMultiplier.toFixed(3)}x)
                </p>
                <p>
                  직접치유: 기본 {formatCompactAmount(penanceDebug.baseHealing)} → 최종 {formatCompactAmount(penanceDebug.finalHealing)} (
                  {penanceDebug.healingMultiplier.toFixed(3)}x)
                </p>
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            <TimeSeriesChart
              durationSeconds={durationSeconds}
              fillClassName="fill-emerald-400/5"
              minFromZero
              points={result.timeline?.mana}
              strokeClassName="stroke-emerald-300"
              title="마나 그래프 (남은 마나)"
              valueFormatter={(value) => `${Math.round(value / 1000)}k`}
            />
            <TimeSeriesChart
              durationSeconds={durationSeconds}
              fillClassName="fill-violet-400/5"
              fillOpacity={0.55}
              points={result.timeline?.healingRate}
              secondaryColor="#fb7185"
              secondaryLabel="속죄 인원"
              secondaryMax={MAJOR_ATONEMENT_MODEL.maxTargets ?? ATONEMENT_TRANSFER_MAX_TARGETS}
              secondaryMin={0}
              secondaryPoints={result.timeline?.atonementCount}
              secondaryStrokeDasharray="3 4"
              secondaryStrokeOpacity={0.55}
              secondaryStrokeWidth={1.6}
              secondaryValueFormatter={(value) => `${Math.round(value)}`}
              strokeOpacity={0.6}
              strokeClassName="stroke-violet-300"
              title="힐량 그래프 (초당 HPS)"
              valueFormatter={(value) => `${Math.round(value)}`}
              markerGroups={[
                {
                  id: "apostle",
                  label: "사도",
                  color: "#fbbf24",
                  times: result.timelineMarkers?.apostle ?? []
                },
                {
                  id: "ultimate",
                  label: "궁참",
                  color: "#c084fc",
                  times: result.timelineMarkers?.ultimate ?? []
                },
                {
                  id: "filler-radiance",
                  label: "추가 광휘",
                  color: "#34d399",
                  times: result.timelineMarkers?.fillerRadiance ?? []
                }
              ]}
            />
          </div>

          <div className="rounded-lg border border-slate-700/80 bg-slate-900/60 p-3">
            <h3 className="text-sm font-semibold text-slate-100">스킬별 누적 힐 비중</h3>
            <p className="mt-1 text-[11px] text-slate-400">WCL처럼 전투 전체 힐량을 스킬 단위로 합산한 막대 그래프입니다.</p>
            <div className="mt-2">
              <SpellContributionTable items={spellContributionBars} />
            </div>
          </div>

          <div className="rounded-lg border border-slate-700/80 bg-slate-900/60 p-3">
            <h3 className="text-sm font-semibold text-slate-100">사도 후속 버프 구간 분석</h3>
            <p className="mt-1 text-[11px] text-slate-400">사도 시전(전도) 직후 18초 구간에서 어떤 스킬을 써서 얼마나 힐했는지 표시합니다.</p>
            {apostleBuffWindows.length ? (
              <div className="mt-2 space-y-3">
                {apostleBuffWindows.map((window) => (
                  <div className="rounded-md border border-slate-700/70 bg-gray-950/60 p-2.5" key={`apostle-window-${window.id}`}>
                    <p className="text-[11px] font-semibold text-violet-100">
                      {window.label}: {formatSeconds(window.start)} ~ {formatSeconds(window.end)} ({window.duration.toFixed(1)}초)
                    </p>
                    <p className="mt-1 text-[11px] text-slate-300">
                      총 {formatCompactAmount(window.total)} / 속죄 {formatCompactAmount(window.atonement)} ({window.atonementPct.toFixed(1)}%) / 직접{" "}
                      {formatCompactAmount(window.direct)}
                    </p>
                    <div className="mt-2 overflow-hidden rounded border border-slate-700/70">
                      <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,2.5fr)_68px] border-b border-slate-700/80 bg-slate-900/80 px-2 py-1 text-[10px] font-semibold text-slate-300">
                        <p>이름</p>
                        <p>퍼센트 / 총량</p>
                        <p className="text-right">시전수</p>
                      </div>
                      <div className="divide-y divide-slate-800/70">
                        {window.rows.map((row) => (
                          <div
                            className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,2.5fr)_68px] items-center gap-2 px-2 py-1 text-[10px]"
                            key={`apostle-window-row-${window.id}-${row.key}`}
                          >
                            <p className="truncate text-slate-100">{row.name}</p>
                            <div className="flex items-center gap-2">
                              <span className="w-12 shrink-0 text-right text-slate-300">{row.pct.toFixed(1)}%</span>
                              <div className="h-1.5 flex-1 overflow-hidden rounded bg-slate-800/80">
                                <div
                                  className="h-full rounded"
                                  style={{
                                    width: `${Math.max(0.3, row.pct)}%`,
                                    backgroundColor: SPELL_BAR_COLOR_BY_KEY[row.key] ?? "#67e8f9"
                                  }}
                                />
                              </div>
                              <span className="w-12 shrink-0 text-right text-slate-300">{formatCompactAmount(row.total)}</span>
                            </div>
                            <p className="text-right text-slate-200">{row.casts || "-"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-2 overflow-hidden rounded border border-slate-700/60">
                      <div className="grid grid-cols-[72px_minmax(0,1.5fr)_minmax(0,2.2fr)] border-b border-slate-700/80 bg-slate-900/80 px-2 py-1 text-[10px] font-semibold text-slate-300">
                        <p>시간</p>
                        <p>스킬</p>
                        <p>힐량 (총/속죄/직접)</p>
                      </div>
                      <div className="max-h-44 divide-y divide-slate-800/70 overflow-y-auto">
                        {window.castEntries.length ? (
                          window.castEntries.map((entry, idx) => (
                            <div
                              className="grid grid-cols-[72px_minmax(0,1.5fr)_minmax(0,2.2fr)] items-center gap-2 px-2 py-1 text-[10px]"
                              key={`apostle-cast-${window.id}-${idx}`}
                            >
                              <p className="text-slate-300">{formatSeconds(entry.time)}</p>
                              <p className="truncate text-slate-100">{SPELL_NAME_BY_KEY[entry.spellKey] ?? entry.spellKey}</p>
                              <p className="truncate text-slate-300">
                                {formatCompactAmount(entry.total)} / {formatCompactAmount(entry.atonement)} / {formatCompactAmount(entry.direct)}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="px-2 py-2 text-[10px] text-slate-400">해당 구간에 기록된 캐스팅 이벤트가 없습니다.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 rounded-md border border-dashed border-slate-600 bg-gray-950/55 px-3 py-2 text-xs text-slate-400">
                사도 버프 구간 데이터가 없습니다.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-slate-700/80 bg-slate-900/60 p-3">
            <h3 className="text-sm font-semibold text-slate-100">광휘 사용량 (요청 핵심)</h3>
            <div className="mt-2 space-y-1 text-[11px] text-slate-300">
              {result.majorEvents.map((event) => (
                <p key={`major-debug-${event.id}`}>
                  {event.label}: 정분 시 속죄[{(event.mindBlastAtonementsAtCast ?? []).join(", ") || "-"}], 궁참 시 속죄[
                  {event.ultimateAtonementAtCast ?? "-"}], 정분 힐[
                  {(event.mindBlastHealingDeltas ?? [])
                    .map((entry) => `${Math.round(entry.deltaHealing).toLocaleString()}@${formatSeconds(entry.time)}`)
                    .join(", ") || "-"}
                  ], 궁참 힐[
                  {(event.ultimateHealingDeltas ?? [])
                    .map((entry) => `${Math.round(entry.deltaHealing).toLocaleString()}@${formatSeconds(entry.time)}`)
                    .join(", ") || "-"}
                  ], 궁참 계산[
                  {(event.ultimateComputations ?? [])
                    .map(
                      (entry) =>
                        `피해 ${Math.round(entry.scaledDamage).toLocaleString()} / ${entry.castDurationSec}s / 속죄 ${entry.atonementCount} / 전환 ${entry.transferRatePct}% / 특화 ${entry.masteryMultiplier ?? "-"}x / 속죄배율 ${entry.atonementSourceMultiplier ?? "-"} / 예상치유 ${Math.round(entry.expectedAtonementHealing).toLocaleString()}`
                    )
                    .join(", ") || "-"}
                  ]
                </p>
              ))}
            </div>
            <div className="mt-2 grid gap-2 md:grid-cols-3">
              <div className="rounded-md border border-slate-700 bg-gray-950/70 px-3 py-2">
                <p className="text-[11px] text-slate-400">메이저 램프 내부</p>
                <p className="text-base font-semibold text-violet-100">{Math.round(result.totals.totalRadianceInMajor)}회</p>
              </div>
              <div className="rounded-md border border-slate-700 bg-gray-950/70 px-3 py-2">
                <p className="text-[11px] text-slate-400">사이 구간 자동 계산</p>
                <p className="text-base font-semibold text-emerald-100">{Math.round(result.totals.totalRadianceInFiller)}회</p>
              </div>
              <div className="rounded-md border border-slate-700 bg-gray-950/70 px-3 py-2">
                <p className="text-[11px] text-slate-400">총 광휘</p>
                <p className="text-base font-semibold text-violet-100">{Math.round(result.totals.totalRadianceAll)}회</p>
              </div>
            </div>

            {result.fillerPlans.length ? (
              <div className="mt-3 max-h-[260px] overflow-y-auto rounded-md border border-slate-700/70">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-gray-950/95 text-slate-300">
                    <tr>
                      <th className="px-3 py-2 font-medium">구간</th>
                      <th className="px-3 py-2 font-medium">광휘</th>
                      <th className="px-3 py-2 font-medium">추가 보막</th>
                      <th className="px-3 py-2 font-medium">순치</th>
                      <th className="px-3 py-2 font-medium">간청</th>
                      <th className="px-3 py-2 font-medium">성격</th>
                      <th className="px-3 py-2 font-medium">회개/보막</th>
                      <th className="px-3 py-2 font-medium">정분</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/35 text-slate-100">
                    {result.fillerPlans.map((plan) => (
                      <tr key={plan.id}>
                        <td className="px-3 py-2 text-slate-300">
                          {formatSeconds(plan.start)} ~ {formatSeconds(plan.end)}
                        </td>
                        <td className="px-3 py-2">{plan.radianceCount}회</td>
                        <td className="px-3 py-2">{plan.shieldCount}회</td>
                        <td className="px-3 py-2">{plan.flashHealCount}회</td>
                        <td className="px-3 py-2">{plan.pleaCount}회</td>
                        <td className="px-3 py-2">{plan.smiteCount}회</td>
                        <td className="px-3 py-2">
                          {plan.mandatoryPenanceCount} / {plan.mandatoryShieldCount}
                        </td>
                        <td className="px-3 py-2">{plan.mindBlastCount}회</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-3 rounded-md border border-dashed border-slate-600 bg-gray-950/55 px-3 py-2 text-xs text-slate-400">
                남는 구간이 없거나 사용 가능한 마나가 없습니다.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-slate-700/80 bg-slate-900/60 p-3">
            <h3 className="text-sm font-semibold text-slate-100">최적화 스킬 타임라인</h3>
            <p className="mt-1 text-[11px] text-slate-400">
              시뮬레이터가 최종 선택한 행동 순서입니다. 각 행동의 힐 기여(총/직접/속죄), 마나 소모, 속죄 인원을 시간순으로 확인할 수 있습니다.
            </p>
            {result.actionTimeline?.length ? (
              <div className="mt-2 max-h-[320px] overflow-y-auto rounded-md border border-slate-700/70">
                <table className="w-full text-left text-[11px]">
                  <thead className="sticky top-0 bg-gray-950/95 text-slate-300">
                    <tr>
                      <th className="px-2 py-2 font-medium">시간</th>
                      <th className="px-2 py-2 font-medium">행동</th>
                      <th className="px-2 py-2 font-medium">타입</th>
                      <th className="px-2 py-2 font-medium">속죄수</th>
                      <th className="px-2 py-2 font-medium">힐(총/직접/속죄)</th>
                      <th className="px-2 py-2 font-medium">마나</th>
                      <th className="px-2 py-2 font-medium">남은 마나</th>
                      <th className="px-2 py-2 font-medium">HPS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/35 text-slate-100">
                    {result.actionTimeline.map((row) => (
                      <tr key={row.id} className={row.spellKey == null ? "text-slate-400" : ""}>
                        <td className="px-2 py-1.5">
                          {formatSeconds(row.startTime)} → {formatSeconds(row.time)}
                        </td>
                        <td className="px-2 py-1.5">{row.name}</td>
                        <td className="px-2 py-1.5">{row.mode}</td>
                        <td className="px-2 py-1.5">{row.atonementCount}</td>
                        <td className="px-2 py-1.5">
                          {formatCompactAmount(row.displayTotalHealing ?? row.totalHealing)} /{" "}
                          {formatCompactAmount(row.displayDirectHealing ?? row.directHealing)} /{" "}
                          {formatCompactAmount(row.displayAtonementHealing ?? row.atonementHealing)}
                        </td>
                        <td className="px-2 py-1.5">{Math.round(row.manaSpent).toLocaleString()}</td>
                        <td className="px-2 py-1.5">{row.manaRemainingPct.toFixed(1)}%</td>
                        <td className="px-2 py-1.5">{Math.round(row.displayHps ?? row.hps).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-2 rounded-md border border-dashed border-slate-600 bg-gray-950/55 px-3 py-2 text-xs text-slate-400">
                타임라인 데이터가 없습니다.
              </p>
            )}
          </div>

          {result.warnings.length ? (
            <div className="rounded-lg border border-amber-300/35 bg-amber-300/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-200">주의</p>
              <ul className="mt-2 space-y-1 text-xs text-amber-100">
                {result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-600 bg-gray-950/55 px-3 py-2 text-xs text-slate-400">
          타임라인을 드래그로 배치한 뒤 `시뮬레이션 시작`을 누르면 결과가 생성됩니다.
        </p>
      )}

      <details className="rounded-lg border border-slate-700/80 bg-gray-950/40">
        <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-slate-200">Wowhead 참조 주문값</summary>
        <div className="border-t border-slate-700/80 px-3 py-3">
          <p className="mb-2 text-[11px] text-slate-400">
            참고값은 Wowhead의 `base mana %` 표기입니다. 실제 시뮬레이션 계산은 현재 네가 지정한 간편 퍼센트 마나 모델을 사용합니다.
          </p>
          <ul className="space-y-1 text-xs text-slate-300">
            {WOWHEAD_FACTS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </details>
    </section>
  );
}

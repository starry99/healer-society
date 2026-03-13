export const RESTORATION_DRUID_HEALER_SLUG = "restoration-druid";

// Per-healer default stats.
// hastePct/critPct/masteryPct are percentage values (e.g. 30 means 30%).
export const RESTORATION_DRUID_DEFAULT_STATS = Object.freeze({
  intellect: 10000,
  hastePct: 0,
  critPct: 25,
  masteryPct: 40
});

// 힐러별 마나 튜닝 배율 (최종 마나 소모에 곱해짐)
// 기존 globalManaTuningScale 기본값(1.2)과 동일하게 시작.
export const RESTORATION_DRUID_MANA_TUNING_SCALE = 1.2;

// 난이도별 피해 배율/전투 시간/레이드 버스트 패턴 (회복 드루이드 전용)
// scheduledRaidBursts:
// - startAtSec: 시작 시점(초)
// - tickIntervalSec: 틱 간격(초)
// - tickCount: 틱 횟수
// - damagePerTick: 각 틱마다 모든 공대원에게 들어갈 기본 피해량(절대값)
export const RESTORATION_DRUID_PRACTICE_DIFFICULTY_TUNING = Object.freeze({
  normal: Object.freeze({
    label: "일반",
    fixedCombatDurationMinutes: 2,
    incomingDamageMultiplier: 0.45,
    damageBreakEveryMs: 30000,
    damageBreakDurationMs: 5000,
    scheduledRaidBursts: Object.freeze([
      { id: "raid-pulse-1", startAtSec: 25, tickIntervalSec: 1, tickCount: 5, damagePerTick: 6200 },
      { id: "raid-pulse-2", startAtSec: 85, tickIntervalSec: 1, tickCount: 5, damagePerTick: 6200 }
    ])
  }),
  heroic: Object.freeze({
    label: "영웅",
    fixedCombatDurationMinutes: 2,
    incomingDamageMultiplier: 0.54,
    damageBreakEveryMs: 30000,
    damageBreakDurationMs: 5000,
    scheduledRaidBursts: Object.freeze([
      { id: "raid-pulse-3", startAtSec: 20, tickIntervalSec: 1, tickCount: 8, damagePerTick: 6500 },
      { id: "raid-pulse-4", startAtSec: 80, tickIntervalSec: 1, tickCount: 8, damagePerTick: 6500 }
    ])
  }),
  mythic: Object.freeze({
    label: "신화",
    fixedCombatDurationMinutes: 2.5,
    incomingDamageMultiplier: 0.6,
    damageBreakEveryMs: 30000,
    damageBreakDurationMs: 4000,
    scheduledRaidBursts: Object.freeze([
      { id: "raid-pulse-5", startAtSec: 10, tickIntervalSec: 1, tickCount: 8, damagePerTick: 6800 },
      { id: "raid-pulse-6", startAtSec: 80, tickIntervalSec: 1, tickCount: 8, damagePerTick: 6800 },
      { id: "raid-pulse-7", startAtSec: 140, tickIntervalSec: 1, tickCount: 8, damagePerTick: 6800 }
    ])
  }),
  worldFirstKill: Object.freeze({
    label: "월퍼킬",
    fixedCombatDurationMinutes: 2.5,
    incomingDamageMultiplier: 0.7,
    damageBreakEveryMs: 30000,
    damageBreakDurationMs: 3000,
    scheduledRaidBursts: Object.freeze([
      { id: "raid-pulse-8", startAtSec: 10, tickIntervalSec: 1, tickCount: 8, damagePerTick: 7100 },
      { id: "raid-pulse-9", startAtSec: 80, tickIntervalSec: 1, tickCount: 8, damagePerTick: 7100 },
      { id: "raid-pulse-10", startAtSec: 140, tickIntervalSec: 1, tickCount: 8, damagePerTick: 7100 }
    ])
  })
});

export const RESTORATION_DRUID_PRACTICE_TUNING = Object.freeze({
  baseMana: 100000,
  dummyBaseHealth: 375000,
  talents: Object.freeze({
    // Pandemic refresh system on/off.
    pandemicEnabled: true,
    // Only these HoTs use Pandemic refresh in this simulator.
    pandemicHotKeys: Object.freeze(["regrowthHot", "lifebloom"]),
    // Abundance talent on/off.
    abundanceEnabled: true,
    // Forest Renewal (삼림 재생): Swiftmend 카운트 기반 나무 변신 on/off.
    forestRenewalEnabled: true,
    // Soul of the Forest (숲의 영혼): Swiftmend 후 다음 Rejuvenation/Regrowth 강화 on/off.
    soulOfForestEnabled: true,
    // 강화량: 다음 Rejuvenation/Regrowth 치유량 +60%.
    soulOfForestHealBonusRatio: 0.6,
    // 강화 주문이 추가로 적용될 대상 수.
    soulOfForestAdditionalTargetCount: 2,
    // If true, Germination is counted as an additional Rejuvenation for Abundance.
    abundanceCountGerminationAsRejuvenation: true
  }),
  // Final heal = intellect * healAmountCoefficients[spellKey]
  healAmountCoefficients: Object.freeze({
    rejuvenationTick: 0.52,
    regrowth: 3.4,
    regrowthHotTick: 0.36,
    wildGrowth: 1.3,
    wildGrowthHotTick: 0.26,
    lifebloomTick: 0.33,
    // Lifebloom bloom (natural expiry)
    lifebloomBloomExpire: 1.8,
    // Lifebloom bloom (transfer when near expiry)
    lifebloomBloomTransfer: 1.2,
    swiftmend: 17,
    convokeSpirits: 1.9,
    tranquilityTick: 0.88,
    // Total per-target healing coefficient for Tranquility channel.
    // Final per-target total healing uses sqrt(5/20) raid scaler in engine.
    tranquilityTotal: 14,
    nurture: 0.92
  }),
  // Default mana model: baseMana * ratio
  manaCostBaseManaRatios: Object.freeze({
    rejuvenation: 0.032,
    regrowth: 0.076,
    wildGrowth: 0.062,
    lifebloom: 0.028,
    swiftmend: 0.042,
    convokeSpirits: 0.09,
    tranquility: 0.098,
    barkskin: 0
  }),
  // Optional fixed mana cost override per spell. If set, this value is used directly.
  manaCostFixedOverrides: Object.freeze({
  }),
  castTimesMs: Object.freeze({
    // Casted spells that resolve at cast end.
    regrowth: 1500,
    wildGrowth: 0,
    // Channeled spells. Heals tick while casting.
    convokeSpirits: 4000,
    tranquility: 6000
  }),
  // Whether each cast-time spell is affected by haste for cast/channel duration.
  // true: duration = base / (1 + haste%)
  // false: fixed duration regardless of haste
  castTimeHasteAffectedBySpell: Object.freeze({
    regrowth: false,
    wildGrowth: false,
    convokeSpirits: false,
    tranquility: true
  }),
  durations: Object.freeze({
    rejuvenationMs: 12000,
    rejuvenationTickMs: 2000,
    regrowthHotMs: 6000,
    regrowthHotTickMs: 2000,
    wildGrowthHotMs: 7000,
    wildGrowthHotTickMs: 1000,
    lifebloomMs: 15000,
    lifebloomTickMs: 1000,
    lifebloomStackStepMs: 5000,
    lifebloomMaxStacks: 3,
    lifebloomTickStack2Multiplier: 1.5,
    lifebloomTickStack3Multiplier: 2,
    lifebloomTransferBloomWindowMs: 4000,
    // Everbloom transfer from Lifebloom healing: each ally receives this ratio.
    lifebloomEverbloomTransferRatio: 0.15,
    lifebloomEverbloomTransferTargetCount: 2,
    // When Soul of the Forest is consumed, trigger rapid Lifebloom blooms.
    soulOfForestLifebloomRapidBloomCount: 5,
    soulOfForestLifebloomRapidBloomCoefficient: 0.5,
    convokePulseCount: 8,
    convokePulseIntervalMs: 500,
    tranquilityMs: 6000,
    tranquilityTickMs: 1000,
    tranquilityHotExtensionPerTickMs: 2000,
    barkskinMs: 12000,
    barkskinDamageReduction: 0.2,
    swiftmendCooldownMs: 14000,
    swiftmendRequiredHotCount: 1,
    swiftmendHotExtensionMs: 8000,
    treeOfLifeDurationMs: 10000,
    treeOfLifeSwiftmendCountRequired: 4,
    treeOfLifeWildGrowthTargetCount: 7,
    treeOfLifeRegrowthInstant: true,
    treeantDurationMs: 8000,
    treeantNurtureTickMs: 1000
  }),
  // Convoke random spell table.
  // - spellKey: which internal spell behavior is used
  // - weight: weighted random chance
  // - healMultiplier: extra multiplier per pulse (optional, default 1)
  convokeRandomSpellPool: Object.freeze([
    Object.freeze({ spellKey: "rejuvenation", weight: 2, healMultiplier: 1 }),
    Object.freeze({ spellKey: "regrowth", weight: 2, healMultiplier: 1 }),
    Object.freeze({ spellKey: "wildGrowth", weight: 1, healMultiplier: 1 }),
    Object.freeze({ spellKey: "lifebloom", weight: 1, healMultiplier: 1 }),
    Object.freeze({ spellKey: "swiftmend", weight: 1, healMultiplier: 1 }),
    Object.freeze({ spellKey: "nurture", weight: 1, healMultiplier: 1 })
  ]),
  // Incoming damage pattern used by encounter simulator:
  // - singleHit*: baseline single-target hit range (ratio of dummyBaseHealth)
  // - spikeBonus*: extra burst added on spike events
  // - raidPulse*: raid-wide pulse hit range
  damageRatios: Object.freeze({
    singleHitMin: 0.06,
    singleHitMax: 0.16,
    spikeBonusMin: 0.06,
    spikeBonusMax: 0.16,
    raidPulseMin: 0.03,
    raidPulseMax: 0.07
  })
});

export const RESTORATION_DRUID_CRIT_CONFIG = Object.freeze({
  defaultCritHealMultiplier: 2
});

export const RESTORATION_DRUID_TREEANT_CONFIG = Object.freeze({
  durationMs: 8000,
  nurtureTickMs: 1000
});

export const RESTORATION_DRUID_DEFAULT_CLICK_CAST_PREFERRED = Object.freeze({
  rejuvenation: "LMB",
  regrowth: "",
  wildGrowth: "SHIFT+LMB",
  lifebloom: "RMB",
  swiftmend: "",
  convokeSpirits: "",
  tranquility: "",
  barkskin: ""
});

export const RESTORATION_DRUID_COOLDOWN_MANAGER_SPELL_KEYS = Object.freeze([
  "wildGrowth",
  "lifebloom",
  "swiftmend",
  "convokeSpirits",
  "tranquility",
  "barkskin"
]);

// 쿨다운 매니저에는 표시하지 않지만, 세팅 UI 하단 보조줄에 표시할 스킬
export const RESTORATION_DRUID_COOLDOWN_MANAGER_NON_DISPLAY_SPELL_KEYS = Object.freeze([
  "rejuvenation",
  "regrowth"
]);

export const RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY = Object.freeze({
  rejuvenation: "https://wow.zamimg.com/images/wow/icons/large/spell_nature_rejuvenation.jpg",
  germination: "https://wow.zamimg.com/images/wow/icons/large/spell_druid_germination.jpg",
  abundance: "https://wow.zamimg.com/images/wow/icons/large/ability_druid_empoweredrejuvination.jpg",
  forestRenewal: "https://wow.zamimg.com/images/wow/icons/large/inv_herbalism_70_yserallineseed.jpg",
  regrowth: "https://wow.zamimg.com/images/wow/icons/large/spell_nature_resistnature.jpg",
  wildGrowth: "https://wow.zamimg.com/images/wow/icons/large/ability_druid_flourish.jpg",
  lifebloom: "https://wow.zamimg.com/images/wow/icons/large/inv_misc_herb_felblossom.jpg",
  swiftmend: "https://wow.zamimg.com/images/wow/icons/large/inv_relics_idolofrejuvenation.jpg",
  convokeSpirits: "https://wow.zamimg.com/images/wow/icons/large/ability_ardenweald_druid.jpg",
  tranquility: "https://wow.zamimg.com/images/wow/icons/large/spell_nature_tranquility.jpg",
  barkskin: "https://wow.zamimg.com/images/wow/icons/large/spell_nature_stoneclawtotem.jpg",
  nurture: "https://wow.zamimg.com/images/wow/icons/large/inv_enchant_essencemagiclarge.jpg",
  everbloom: "https://wow.zamimg.com/images/wow/icons/large/inv12_apextalent_druid_everbloom.jpg",
  treeOfLife: "https://wow.zamimg.com/images/wow/icons/large/ability_druid_treeoflife.jpg"
});

export const RESTORATION_DRUID_COOLDOWN_MANAGER_SPELL_META = Object.freeze({
  rejuvenation: {
    spellId: 774,
    iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.rejuvenation
  },
  regrowth: {
    spellId: 8936,
    iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.regrowth
  },
  wildGrowth: {
    spellId: 48438,
    iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.wildGrowth
  },
  lifebloom: {
    spellId: 33763,
    iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.lifebloom
  },
  swiftmend: {
    spellId: 18562,
    iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.swiftmend
  },
  convokeSpirits: {
    spellId: 391528,
    iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.convokeSpirits
  },
  tranquility: {
    spellId: 740,
    iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.tranquility
  },
  barkskin: {
    spellId: 22812,
    iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.barkskin
  },
  nurture: {
    spellId: 422090,
    iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.nurture
  },
  everbloom: {
    spellId: 1244331,
    iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.everbloom
  },
  abundance: {
    spellId: 207383,
    iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.abundance
  }
});

// 힐러별 전용 버프/프록 아이콘 표시 설정
export const RESTORATION_DRUID_SPECIAL_PROC_DISPLAY_CONFIG = Object.freeze([
  Object.freeze({
    key: "forestRenewal",
    label: "삼림 재생",
    iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.forestRenewal,
    buffRemainingMsKey: "forestRenewalCounterActiveMs",
    stackCountBuffKey: "forestRenewalSwiftmendCount",
    showAboveCooldownManager: true,
    showOnMyRaidFrame: false,
    showCountdownOnOverlay: false,
    showCountdownOnRaidFrame: false,
    showStackCountOnOverlay: true
  }),
  Object.freeze({
    key: "treeOfLife",
    label: "나무 변신",
    iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.treeOfLife,
    buffRemainingMsKey: "treeOfLifeMs",
    showAboveCooldownManager: true,
    showOnMyRaidFrame: false,
    showCountdownOnOverlay: true,
    showCountdownOnRaidFrame: false,
    showStackCountOnOverlay: false
  }),
  Object.freeze({
    key: "abundance",
    label: "풍요",
    iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.abundance,
    buffRemainingMsKey: "abundanceActiveMs",
    stackCountBuffKey: "abundanceRejuvenationCount",
    showAboveCooldownManager: true,
    showOnMyRaidFrame: false,
    showCountdownOnOverlay: false,
    showCountdownOnRaidFrame: false,
    showStackCountOnOverlay: true
  })
]);

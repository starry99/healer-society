export const CURRENT_IMPLEMENTED_HEALER_SLUG = "holy-paladin";

// Per-healer default stats.
// hastePct/critPct/masteryPct are percentage values (e.g. 30 means 30%).
export const HOLY_PALADIN_DEFAULT_STATS = Object.freeze({
  intellect: 2100,
  hastePct: 30,
  critPct: 30,
  masteryPct: 40
});

// 힐러별 마나 튜닝 배율 (최종 마나 소모에 곱해짐)
// 기존 globalManaTuningScale 기본값(1.2)과 동일하게 시작.
export const HOLY_PALADIN_MANA_TUNING_SCALE = 1.2;

// 빛의 섬광/성스러운 빛 시전 사운드 설정 (public 경로 기준)
export const HOLY_PALADIN_SOUND_CONFIG = Object.freeze({
  flashOfLightAndHolyLightCastSfxEnabled: true,
  flashOfLightAndHolyLightCastSfxSrc: "/sounds/FX_Holy_Magic_Cast_Small_05.ogg",
  flashOfLightAndHolyLightCastSfxVolume: 0.03,
  holyShockCastSfxEnabled: true,
  holyShockCastSfxSrc: "/sounds/FX_Holy_Magic_Cast_Small_05.ogg",
  holyShockCastSfxVolume: 0.03,
  divineTollCastSfxEnabled: true,
  divineTollCastSfxSrc: "/sounds/toll.ogg",
  divineTollCastSfxVolume: 0.03,
  lightOfDawnCastSfxEnabled: true,
  lightOfDawnCastSfxSrc: "/sounds/SPELL_PR_Revamp_Holy_Precast_Start_Large_01.ogg",
  lightOfDawnCastSfxVolume: 0.03
});

// 난이도별 피해 배율/전투 시간/레이드 버스트 패턴 (신성 성기사 전용)
// scheduledRaidBursts:
// - startAtSec: 시작 시점(초)
// - tickIntervalSec: 틱 간격(초)
// - tickCount: 틱 횟수
// - damagePerTick: 각 틱마다 모든 공대원에게 들어갈 기본 피해량(절대값)
export const HOLY_PALADIN_PRACTICE_DIFFICULTY_TUNING = Object.freeze({
  normal: Object.freeze({
    label: "일반",
    fixedCombatDurationMinutes: 2,
    incomingDamageMultiplier: 0.46,
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
    incomingDamageMultiplier: 0.55,
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

// 커스텀으로 추가한 특성성 효과 토글.
// true: 활성화, false: 비활성화
export const HOLY_PALADIN_ADDED_TALENT_TOGGLES = Object.freeze({
  infusionOfLight: true,
  divinePurpose: true,
  handOfFaith: true,
  holyRevelation: true,
  radiantLight: true,
  unfadingLight: true,
  extrication: true,
  dawnlight: true,
  sunSear: true,
  reclamation: true,
  gloriousDawn: true,
  archangelsBarrier: false,
  beaconOfSavior: true,
  lightOfMartyr: true,
  benevolentHealer: true,
  secondSunrise: true,
  seasonOneTier: true
});

export const HOLY_PALADIN_PRACTICE_TUNING = Object.freeze({
  baseMana: 275000,
  dummyBaseHealth: 375000,
  // Final heal = intellect * healAmountCoefficients[spellKey]
  healAmountCoefficients: Object.freeze({
    holyShock: 8,
    flashOfLight: 4.9,
    holyLight: 43.4, // 44.9
    lightOfDawn: 3.6,
    eternalFlame: 13.6,
    eternalFlameTick: 0.38,
    sunSear: 0.76
  }),
  // Default mana model: baseMana * ratio
  manaCostBaseManaRatios: Object.freeze({
    holyShock: 0.0224,
    flashOfLight: 0.006,
    judgment: 0.0114,
    holyLight: 0.0756,
    lightOfDawn: 0.006,
    eternalFlame: 0.006,
    divineBlessing: 0,
    divineToll: 0.0285,
    avengingWrath: 0,
    auraMastery: 0,
    divineProtection: 0.006
  }),
  // Optional fixed mana cost override per spell. If set, this value is used directly.
  manaCostFixedOverrides: Object.freeze({
  }),
  castTimesMs: Object.freeze({
    // Casted spells that resolve at cast end.
    flashOfLight: 1400,
    holyLight: 1700
  }),
  beaconOfSavior: Object.freeze({
    // Direct heal transfer ratio applied to Beacon of Savior target.
    transferRatio: 0.25,
    // Periodic defensive shield amount coefficient.
    // Final shield amount = intellect * shieldAmountCoefficient
    shieldAmountCoefficient: 3
  }),
  seasonOneTier: Object.freeze({
    holyShockHealingBonusPct: 0.15,
    holyShockAdditionalBeaconOfLightTransferPct: 0.2
  }),
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

export const HOLY_PALADIN_INFUSION_OF_LIGHT_CONFIG = Object.freeze({
  procChance: 0.1,
  durationMs: 15000,
  flashOfLightHealMultiplier: 2
});

export const HOLY_PALADIN_DIVINE_PURPOSE_CONFIG = Object.freeze({
  procChance: 0.15,
  healBonusPct: 0.15,
  durationMs: 12000
});

export const HOLY_PALADIN_CRIT_CONFIG = Object.freeze({
  defaultCritHealMultiplier: 2,
  holyShockCritChanceBonus: 0.08,
  holyShockCritHealMultiplier: 2.2,
  flashOfLightCritHealMultiplier: 2.2,
  eternalFlameCritChanceBonusAtZeroHp: 0.3
});

export const HOLY_PALADIN_SUN_SEAR_CONFIG = Object.freeze({
  enabled: true,
  totalHealRatio: 0.54,
  durationMs: 4000,
  tickMs: 1000
});

export const HOLY_PALADIN_DAWNLIGHT_CONFIG = Object.freeze({
  chargesFromDivineToll: 2,
  empowermentDurationMs: 30000,
  totalHealRatio: 13.33,
  durationMs: 8000,
  tickMs: 1000
});

export const DEFAULT_CLICK_CAST_PREFERRED = Object.freeze({
  holyShock: "LMB",
  flashOfLight: "",
  holyLight: "",
  eternalFlame: "RMB",
  divineBlessing: ""
});

export const COOLDOWN_MANAGER_SPELL_KEYS = Object.freeze([
  "holyShock",
  "divineToll",
  "avengingWrath",
  "auraMastery",
  // "divineProtection",
  // "divineBlessing"
]);

// 쿨다운 매니저 2번째 줄 기본 스킬
export const COOLDOWN_MANAGER_SECONDARY_SPELL_KEYS = Object.freeze([
  "divineProtection",
  "divineBlessing"
]);

// 쿨다운 매니저에는 표시하지 않지만, 세팅 UI 하단 보조줄에 표시할 스킬
export const COOLDOWN_MANAGER_NON_DISPLAY_SPELL_KEYS = Object.freeze([
  "eternalFlame",
  "judgment",
  "flashOfLight",
  "holyLight",
  "lightOfDawn"
]);

export const SPELL_ICON_URL_BY_KEY = Object.freeze({
  holyShock: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_searinglight.jpg",
  judgment: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_righteousfury.jpg",
  flashOfLight: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_flashheal.jpg",
  holyLight: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_surgeoflight.jpg",
  infusionOfLight: "https://wow.zamimg.com/images/wow/icons/large/ability_paladin_infusionoflight.jpg",
  divinePurpose: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_divinepurpose.jpg",
  lightOfDawn: "https://wow.zamimg.com/images/wow/icons/large/spell_paladin_lightofdawn.jpg",
  eternalFlame: "https://wow.zamimg.com/images/wow/icons/large/inv_torch_thrown.jpg",
  divineBlessing: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_layonhands.jpg",
  beaconOfLight: "https://wow.zamimg.com/images/wow/icons/large/ability_paladin_beaconoflight.jpg",
  beaconOfFaith: "https://wow.zamimg.com/images/wow/icons/large/ability_paladin_beaconoflight.jpg",
  beaconOfSavior: "https://wow.zamimg.com/images/wow/icons/large/inv12_apextalent_paladin_beaconofthesavior.jpg",
  divineToll: "https://wow.zamimg.com/images/wow/icons/large/inv_ability_paladin_divinetoll.jpg",
  dawnlight: "https://wow.zamimg.com/images/wow/icons/large/inv_ability_heraldofthesunpaladin_dawnlight.jpg",
  handOfFaith: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_vindication.jpg",
  avengingWrath: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_avenginewrath.jpg",
  auraMastery: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_auramastery.jpg",
  divineProtection: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_divineprotection.jpg",
  sunSear: "https://wow.zamimg.com/images/wow/icons/large/ability_paladin_lightshammer.jpg"
});

export const COOLDOWN_MANAGER_SPELL_META = Object.freeze({
  holyShock: {
    spellId: 20473,
    iconUrl: SPELL_ICON_URL_BY_KEY.holyShock
  },
  flashOfLight: {
    spellId: 19750,
    iconUrl: SPELL_ICON_URL_BY_KEY.flashOfLight
  },
  judgment: {
    spellId: 20271,
    iconUrl: SPELL_ICON_URL_BY_KEY.judgment
  },
  holyLight: {
    spellId: 82326,
    iconUrl: SPELL_ICON_URL_BY_KEY.holyLight
  },
  lightOfDawn: {
    spellId: 85222,
    iconUrl: SPELL_ICON_URL_BY_KEY.lightOfDawn
  },
  eternalFlame: {
    spellId: 156322,
    iconUrl: SPELL_ICON_URL_BY_KEY.eternalFlame
  },
  divineToll: {
    spellId: 375576,
    iconUrl: SPELL_ICON_URL_BY_KEY.divineToll
  },
  avengingWrath: {
    spellId: 31884,
    iconUrl: SPELL_ICON_URL_BY_KEY.avengingWrath
  },
  auraMastery: {
    spellId: 31821,
    iconUrl: SPELL_ICON_URL_BY_KEY.auraMastery
  },
  divineProtection: {
    spellId: 498,
    iconUrl: SPELL_ICON_URL_BY_KEY.divineProtection
  },
  divineBlessing: {
    spellId: 633,
    iconUrl: SPELL_ICON_URL_BY_KEY.divineBlessing
  }
});

// 힐러별 전용 버프/프록 아이콘 표시 설정
// - buffRemainingMsKey: snapshot.buffs[해당 key]의 남은 시간(ms) 사용
// - showAboveCooldownManager/showOnMyRaidFrame: 표시 위치
// - 아이콘 크기/상단 Y 오프셋은 healerPracticeGlobalSettings.js 공통 상수 사용
export const HOLY_PALADIN_SPECIAL_PROC_DISPLAY_CONFIG = Object.freeze([
  Object.freeze({
    key: "infusionOfLight",
    label: "빛 주입",
    spellId: 54149,
    iconUrl: SPELL_ICON_URL_BY_KEY.infusionOfLight,
    buffRemainingMsKey: "infusionOfLightMs",
    stackCountBuffKey: "infusionOfLightCharges",
    showAboveCooldownManager: true,
    showOnMyRaidFrame: false,
    showCountdownOnOverlay: true,
    showCountdownOnRaidFrame: false,
    showStackCountOnOverlay: true
  }),
  Object.freeze({
    key: "avengingWrath",
    label: "응징의 격노",
    spellId: 31884,
    iconUrl: SPELL_ICON_URL_BY_KEY.avengingWrath,
    buffRemainingMsKey: "avengingWrathMs",
    showAboveCooldownManager: true,
    showOnMyRaidFrame: false,
    showCountdownOnOverlay: true,
    showCountdownOnRaidFrame: false
  }),
  Object.freeze({
    key: "auraMastery",
    label: "오라 숙련",
    spellId: 31821,
    iconUrl: SPELL_ICON_URL_BY_KEY.auraMastery,
    buffRemainingMsKey: "auraMasteryMs",
    defaultEnabledInSetup: false,
    showAboveCooldownManager: true,
    showOnMyRaidFrame: false,
    showCountdownOnOverlay: true,
    showCountdownOnRaidFrame: false
  }),
  Object.freeze({
    key: "divinePurpose",
    label: "신성한 목적",
    spellId: 223819,
    iconUrl: SPELL_ICON_URL_BY_KEY.divinePurpose,
    buffRemainingMsKey: "divinePurposeMs",
    showAboveCooldownManager: true,
    showOnMyRaidFrame: false,
    showCountdownOnOverlay: true,
    showCountdownOnRaidFrame: false
  }),
  Object.freeze({
    key: "handOfFaith",
    label: "신앙의 손",
    spellId: 1242008,
    iconUrl: SPELL_ICON_URL_BY_KEY.handOfFaith,
    buffRemainingMsKey: "handOfFaithMs",
    stackCountBuffKey: "handOfFaithCharges",
    showAboveCooldownManager: true,
    showOnMyRaidFrame: false,
    showCountdownOnOverlay: true,
    showCountdownOnRaidFrame: false,
    showStackCountOnOverlay: true
  }),
  Object.freeze({
    key: "dawnlight",
    label: "새벽빛",
    spellId: 431377,
    iconUrl: SPELL_ICON_URL_BY_KEY.dawnlight,
    buffRemainingMsKey: "dawnlightEmpowermentMs",
    stackCountBuffKey: "dawnlightEmpowermentCharges",
    showAboveCooldownManager: true,
    showOnMyRaidFrame: false,
    showCountdownOnOverlay: true,
    showCountdownOnRaidFrame: false,
    showStackCountOnOverlay: true
  }),
  Object.freeze({
    key: "divineProtection",
    label: "신의 가호",
    spellId: 498,
    iconUrl: SPELL_ICON_URL_BY_KEY.divineProtection,
    buffRemainingMsKey: "divineProtectionMs",
    defaultEnabledInSetup: false,
    showAboveCooldownManager: true,
    showOnMyRaidFrame: true,
    showCountdownOnOverlay: true,
    showCountdownOnRaidFrame: false
  })
]);

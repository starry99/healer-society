export const CURRENT_IMPLEMENTED_HEALER_SLUG = "holy-paladin";

// Per-healer default stats.
// hastePct/critPct/masteryPct are percentage values (e.g. 30 means 30%).
export const HOLY_PALADIN_DEFAULT_STATS = Object.freeze({
  intellect: 2100,
  hastePct: 30,
  critPct: 30,
  masteryPct: 40
});

// 커스텀으로 추가한 특성성 효과 토글.
// true: 활성화, false: 비활성화
export const HOLY_PALADIN_ADDED_TALENT_TOGGLES = Object.freeze({
  infusionOfLight: true,
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
  secondSunrise: true
});

export const HOLY_PALADIN_PRACTICE_TUNING = Object.freeze({
  baseMana: 275000,
  dummyBaseHealth: 375000,
  // Final heal = intellect * healAmountCoefficients[spellKey]
  healAmountCoefficients: Object.freeze({
    holyShock: 7.27,
    flashOfLight: 5.5,
    holyLight: 40, // 44.9
    lightOfDawn: 3.67,
    eternalFlame: 12.86,
    eternalFlameTick: 0.26,
    sunSear: 1.17
  }),
  // Default mana model: baseMana * ratio
  manaCostBaseManaRatios: Object.freeze({
    holyShock: 0.0224,
    flashOfLight: 0.006,
    judgment: 0.0114,
    holyLight: 0.076,
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
  totalHealRatio: 5.382,
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
  holyLight: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_holybolt.jpg",
  lightOfDawn: "https://wow.zamimg.com/images/wow/icons/large/spell_paladin_lightofdawn.jpg",
  eternalFlame: "https://wow.zamimg.com/images/wow/icons/large/inv_torch_thrown.jpg",
  divineBlessing: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_layonhands.jpg",
  beaconOfLight: "https://wow.zamimg.com/images/wow/icons/large/ability_paladin_beaconoflight.jpg",
  beaconOfFaith: "https://wow.zamimg.com/images/wow/icons/large/ability_paladin_beaconoflight.jpg",
  beaconOfSavior: "https://wow.zamimg.com/images/wow/icons/large/inv12_apextalent_paladin_beaconofthesavior.jpg",
  divineToll: "https://wow.zamimg.com/images/wow/icons/large/inv_ability_paladin_divinetoll.jpg",
  dawnlight: "https://wow.zamimg.com/images/wow/icons/large/spell_paladin_lightofdawn.jpg",
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
    key: "avengingWrath",
    label: "응징의 격노",
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
    iconUrl: SPELL_ICON_URL_BY_KEY.auraMastery,
    buffRemainingMsKey: "auraMasteryMs",
    showAboveCooldownManager: true,
    showOnMyRaidFrame: false,
    showCountdownOnOverlay: true,
    showCountdownOnRaidFrame: false
  }),
  Object.freeze({
    key: "handOfFaith",
    label: "신앙의 손",
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
    iconUrl: SPELL_ICON_URL_BY_KEY.divineProtection,
    buffRemainingMsKey: "divineProtectionMs",
    showAboveCooldownManager: true,
    showOnMyRaidFrame: true,
    showCountdownOnOverlay: true,
    showCountdownOnRaidFrame: false
  })
]);

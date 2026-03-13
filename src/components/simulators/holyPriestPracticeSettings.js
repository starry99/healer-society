export const HOLY_PRIEST_HEALER_SLUG = "holy-priest";

export const HOLY_PRIEST_ADDED_TALENT_TOGGLES = Object.freeze({
  halo: true,
  prayersOfTheVirtuous: true,
  lightweaver: true,
  ultimateSerenity: true,
  divineImage: true,
  seasonOneTier: true,
  upliftingWords: true,
  crisisManagement: true,
  trailOfLight: true,
  lightsResurgence: true,
  resonantEnergy: true
});

// Per-healer default stats.
export const HOLY_PRIEST_DEFAULT_STATS = Object.freeze({
  intellect: 2000,
  hastePct: 15,
  critPct: 30,
  masteryPct: 30
});

// 힐러별 마나 튜닝 배율 (최종 마나 소모에 곱해짐)
export const HOLY_PRIEST_MANA_TUNING_SCALE = 1.05;

// 신성 사제 기본 마나 재생 배율 (글로벌 기본 재생량에 곱해짐)
export const HOLY_PRIEST_AUTO_MANA_REGEN_MULTIPLIER = 1.1;

// 난이도별 피해 배율/전투 시간/레이드 버스트 패턴 (신성 사제 전용)
// scheduledRaidBursts:
// - startAtSec: 시작 시점(초)
// - tickIntervalSec: 틱 간격(초)
// - tickCount: 틱 횟수
// - damagePerTick: 각 틱마다 모든 공대원에게 들어갈 기본 피해량(절대값)
export const HOLY_PRIEST_PRACTICE_DIFFICULTY_TUNING = Object.freeze({
  normal: Object.freeze({
    label: "일반",
    fixedCombatDurationMinutes: 2,
    incomingDamageMultiplier: 0.5,
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
    incomingDamageMultiplier: 0.58,
    damageBreakEveryMs: 30000,
    damageBreakDurationMs: 5000,
    scheduledRaidBursts: Object.freeze([
      { id: "raid-pulse-3", startAtSec: 20, tickIntervalSec: 1, tickCount: 8, damagePerTick: 7100 },
      { id: "raid-pulse-4", startAtSec: 80, tickIntervalSec: 1, tickCount: 8, damagePerTick: 7100 }
    ])
  }),
  mythic: Object.freeze({
    label: "신화",
    fixedCombatDurationMinutes: 2.5,
    incomingDamageMultiplier: 0.66,
    damageBreakEveryMs: 30000,
    damageBreakDurationMs: 4000,
    scheduledRaidBursts: Object.freeze([
      { id: "raid-pulse-5", startAtSec: 10, tickIntervalSec: 1, tickCount: 8, damagePerTick: 7500 },
      { id: "raid-pulse-6", startAtSec: 80, tickIntervalSec: 1, tickCount: 8, damagePerTick: 7500 },
      { id: "raid-pulse-7", startAtSec: 140, tickIntervalSec: 1, tickCount: 8, damagePerTick: 7500 }
    ])
  }),
  worldFirstKill: Object.freeze({
    label: "월퍼킬",
    fixedCombatDurationMinutes: 2.5,
    incomingDamageMultiplier: 0.7,
    damageBreakEveryMs: 30000,
    damageBreakDurationMs: 3000,
    scheduledRaidBursts: Object.freeze([
      { id: "raid-pulse-8", startAtSec: 10, tickIntervalSec: 1, tickCount: 8, damagePerTick: 8000 },
      { id: "raid-pulse-9", startAtSec: 80, tickIntervalSec: 1, tickCount: 8, damagePerTick: 8000 },
      { id: "raid-pulse-10", startAtSec: 140, tickIntervalSec: 1, tickCount: 8, damagePerTick: 8000 }
    ])
  })
});

export const HOLY_PRIEST_PRACTICE_TUNING = Object.freeze({
  baseMana: 275000,
  dummyBaseHealth: 375000,
  // Final heal = intellect * healAmountCoefficients[spellKey]
  healAmountCoefficients: Object.freeze({
    flashHeal: 15.75,
    prayerOfHealing: 7.75,
    serenity: 33,
    prayerOfMending: 0.97,
    renew: 1.34,
    halo: 3.35,
    cosmicRipple: 2.16,
    divineHymn: 7.5,
    divineImageHealingLight: 2,
    divineImageDazzlingLights: 0.25,
    divineImageBlessedLight: 1.65
  }),
  // Default mana model: baseMana * ratio
  manaCostBaseManaRatios: Object.freeze({
    flashHeal: 0.025,
    prayerOfHealing: 0.038,
    serenity: 0.027,
    prayerOfMending: 0.018,
    halo: 0.025,
    fade: 0,
    apotheosis: 0,
    desperatePrayer: 0,
    divineHymn: 0.042
  }),
  // Optional fixed mana cost override per spell. If set, this value is used directly.
  manaCostFixedOverrides: Object.freeze({
  }),
  castTimesMs: Object.freeze({
    flashHeal: 1500,
    prayerOfHealing: 2000,
    serenity: 0,
    prayerOfMending: 0,
    halo: 1500,
    fade: 0,
    apotheosis: 0,
    desperatePrayer: 0,
    divineHymn: 5000
  }),
  // Whether each cast-time spell is affected by haste for cast/channel duration.
  // true: duration = base / (1 + haste%)
  // false: fixed duration regardless of haste
  castTimeHasteAffectedBySpell: Object.freeze({
    flashHeal: true,
    prayerOfHealing: true,
    divineHymn: true
  }),
  durations: Object.freeze({
    serenityMaxCharges: 2,
    serenityChargeRecoveryMs: 45000,
    prayerOfHealingTargetCount: 5,
    prayerOfHealingPrimaryTargetHealMultiplier: 1.25,
    prayerOfMendingCooldownMs: 12000,
    prayerOfMendingDurationMs: 30000,
    // 회복의 기원 기본 전달 횟수 (Prayers of the Virtuous 비활성 기준)
    prayerOfMendingMaxJumps: 4,
    // Prayers of the Virtuous 활성 시 추가 전달 횟수 (기본 2 -> 총 6회 전달)
    prayersOfTheVirtuousBonusJumps: 2,
    divineImageStackDurationMs: 9000,
    divineImageDazzlingLightsTargetCount: 5,
    divineImageBlessedLightTargetCount: 5,
    protectiveLightDurationMs: 10000,
    protectiveLightDamageReduction: 0.1,
    haloCooldownMs: 60000,
    haloRepeatIntervalMs: 5000,
    haloTotalPulseCount: 4,
    haloTicksPerPulse: 2,
    haloFullEffectTargetCount: 6,
    cosmicRippleTargetCount: 5,
    cosmicRippleFromDivineHymnTickHealMultiplier: 0.75,
    benedictionProcChance: 0.2,
    benedictionDurationMs: 30000,
    benedictionFlashHealHealBonusPct: 0.3,
    seasonOneTierBenedictionDivineImageProcChance: 0.5,
    seasonOneTierDivineImageHealingBonusPct: 0.3,
    seasonOneTierDivineImageDurationBonusMs: 3000,
    unwaveringWillHealthThresholdRatio: 0.75,
    unwaveringWillCastTimeReductionPct: 0.1,
    surgeOfLightBaseProcChanceAtFullMana: 0.08,
    surgeOfLightProcChanceAtZeroMana: 0.5,
    surgeOfLightDurationMs: 20000,
    surgeOfLightMaxStacks: 2,
    surgeOfLightManaCostMultiplier: 0.5,
    surgeOfLightProcSpellKeys: Object.freeze([
      "flashHeal",
      "prayerOfHealing",
      "serenity",
      "prayerOfMending",
      "halo",
      "desperatePrayer",
      "divineHymn"
    ]),
    fadeCooldownMs: 20000,
    fadeDurationMs: 10000,
    fadeDamageReduction: 0.1,
    desperatePrayerCooldownMs: 90000,
    desperatePrayerInstantHealRatioOfMaxHp: 0.25,
    desperatePrayerSelfMaxHpBonusRatio: 0.25,
    desperatePrayerSelfMaxHpBonusDurationMs: 10000,
    divineHymnCooldownMs: 120000,
    divineHymnTickCount: 5,
    divineHymnFullEffectTargetCount: 6,
    divineHymnHealingTakenStackPct: 0.04,
    divineHymnHealingTakenBuffDurationMs: 15000,
    divineHymnHealingTakenMaxStacks: 5,
    apotheosisCooldownMs: 120000,
    apotheosisDurationMs: 20000,
    apotheosisSerenityCdrMultiplier: 2,
    apotheosisSerenityManaCostMultiplier: 0.5,
    apotheosisHealingDoneBonusPct: 0.2,
    faithBuffDurationMs: 30000,
    faithMaxStacks: 3,
    faithPrayerOfHealingBonusPct: 0.25,
    bindingHealFlashHealSelfHealRatio: 0.2,
    trailOfLightHealRatio: 0.25,
    lightsResurgenceRenewProcChance: 0.12,
    renewDurationMs: 15000,
    renewTickMs: 3000,
    resonantEnergyHealingTakenPctPerStack: 0.02,
    resonantEnergyDurationMs: 8000,
    resonantEnergyMaxStacks: 5,
    lightweaverDurationMs: 20000,
    lightweaverMaxStacks: 4,
    lightweaverPrayerOfHealingCastTimeReductionPct: 0.3,
    lightweaverPrayerOfHealingHealBonusPct: 0.18,
    ultimateSerenityAdditionalTargetCount: 4,
    ultimateSerenityHealRatio: 0.15
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

export const HOLY_PRIEST_CRIT_CONFIG = Object.freeze({
  defaultCritHealMultiplier: 2,
  upliftingWordsSerenityCritChanceBonus: 0.1,
  crisisManagementFlashHealCritChanceBonus: 0.15,
  crisisManagementPrayerOfHealingCritChanceBonus: 0.15
});

export const HOLY_PRIEST_DEFAULT_CLICK_CAST_PREFERRED = Object.freeze({
  prayerOfMending: "LMB"
});

export const HOLY_PRIEST_COOLDOWN_MANAGER_SPELL_KEYS = Object.freeze([
  "serenity",
  "prayerOfMending",
  "halo",
  "fade",
  "apotheosis",
  "divineHymn",
  "desperatePrayer"
]);

// 쿨다운 매니저에는 표시하지 않지만, 세팅 UI 하단 보조줄에 표시할 스킬
export const HOLY_PRIEST_COOLDOWN_MANAGER_NON_DISPLAY_SPELL_KEYS = Object.freeze([
  "flashHeal",
  "prayerOfHealing"
]);

export const HOLY_PRIEST_SPELL_ICON_URL_BY_KEY = Object.freeze({
  flashHeal: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_flashheal.jpg",
  prayerOfHealing: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_prayerofhealing02.jpg",
  serenity: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_persuitofjustice.jpg",
  prayerOfMending: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_prayerofmendingtga.jpg",
  renew: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_renew.jpg",
  halo: "https://wow.zamimg.com/images/wow/icons/large/ability_priest_halo.jpg",
  cosmicRipple: "https://wow.zamimg.com/images/wow/icons/large/spell_priest_cosmicripple.jpg",
  divineImage: "https://wow.zamimg.com/images/wow/icons/large/inv_staff_2h_artifactheartofkure_d_04.jpg",
  benediction: "https://wow.zamimg.com/images/wow/icons/large/inv12_apextalent_priest_benediction.jpg",
  trailOfLight: "https://wow.zamimg.com/images/wow/icons/large/ability_priest_wordsofmeaning.jpg",
  bindingHeal: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_blindingheal.jpg",
  surgeOfLight: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_surgeoflight.jpg",
  fade: "https://wow.zamimg.com/images/wow/icons/large/spell_magic_lesserinvisibilty.jpg",
  apotheosis: "https://wow.zamimg.com/images/wow/icons/large/ability_priest_ascension.jpg",
  faith: "https://wow.zamimg.com/images/wow/icons/large/ability_priest_archangel.jpg",
  lightweaver: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_greaterheal.jpg",
  ultimateSerenity: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_persuitofjustice.jpg",
  divineHymn: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_divinehymn.jpg",
  desperatePrayer: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_testoffaith.jpg",
  echoOfLight: "https://wow.zamimg.com/images/wow/icons/large/spell_holy_aspiration.jpg"
});

export const HOLY_PRIEST_COOLDOWN_MANAGER_SPELL_META = Object.freeze({
  flashHeal: {
    spellId: 2061,
    iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.flashHeal
  },
  prayerOfHealing: {
    spellId: 596,
    iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.prayerOfHealing
  },
  serenity: {
    spellId: 2050,
    iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.serenity
  },
  prayerOfMending: {
    spellId: 33076,
    iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.prayerOfMending
  },
  halo: {
    spellId: 120517,
    iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.halo
  },
  fade: {
    spellId: 586,
    iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.fade
  },
  apotheosis: {
    spellId: 200183,
    iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.apotheosis
  },
  divineHymn: {
    spellId: 64843,
    iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.divineHymn
  },
  desperatePrayer: {
    spellId: 19236,
    iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.desperatePrayer
  }
});

// 힐러별 전용 버프/프록 아이콘 표시 설정
export const HOLY_PRIEST_SPECIAL_PROC_DISPLAY_CONFIG = Object.freeze([
  Object.freeze({
    key: "fade",
    label: "소실",
    iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.fade,
    buffRemainingMsKey: "fadeMs",
    showAboveCooldownManager: true,
    showOnMyRaidFrame: false,
    showCountdownOnOverlay: true,
    showCountdownOnRaidFrame: false
  }),
  Object.freeze({
    key: "surgeOfLight",
    label: "빛의 쇄도",
    iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.surgeOfLight,
    buffRemainingMsKey: "surgeOfLightMs",
    stackCountBuffKey: "surgeOfLightStacks",
    showAboveCooldownManager: true,
    showOnMyRaidFrame: false,
    showCountdownOnOverlay: true,
    showCountdownOnRaidFrame: false,
    showStackCountOnOverlay: true
  }),
  Object.freeze({
    key: "lightweaver",
    label: "빛술사",
    iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.lightweaver,
    buffRemainingMsKey: "lightweaverMs",
    stackCountBuffKey: "lightweaverStacks",
    showAboveCooldownManager: true,
    showOnMyRaidFrame: false,
    showCountdownOnOverlay: true,
    showCountdownOnRaidFrame: false,
    showStackCountOnOverlay: true
  }),
  Object.freeze({
    key: "benediction",
    label: "축도",
    iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.benediction,
    buffRemainingMsKey: "benedictionMs",
    showAboveCooldownManager: true,
    showOnMyRaidFrame: false,
    showCountdownOnOverlay: true,
    showCountdownOnRaidFrame: false
  }),
  Object.freeze({
    key: "divineImage",
    label: "신성한 환영",
    iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.divineImage,
    buffRemainingMsKey: "divineImageMs",
    stackCountBuffKey: "divineImageStacks",
    showAboveCooldownManager: true,
    showOnMyRaidFrame: false,
    showCountdownOnOverlay: true,
    showCountdownOnRaidFrame: false,
    showStackCountOnOverlay: true
  }),
  Object.freeze({
    key: "apotheosis",
    label: "절정",
    iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.apotheosis,
    buffRemainingMsKey: "apotheosisMs",
    showAboveCooldownManager: true,
    showOnMyRaidFrame: false,
    showCountdownOnOverlay: true,
    showCountdownOnRaidFrame: false
  }),
  Object.freeze({
    key: "faith",
    label: "신앙",
    iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.faith,
    buffRemainingMsKey: "faithMs",
    stackCountBuffKey: "faithStacks",
    showAboveCooldownManager: true,
    showOnMyRaidFrame: false,
    showCountdownOnOverlay: true,
    showCountdownOnRaidFrame: false,
    showStackCountOnOverlay: true
  }),
  Object.freeze({
    key: "divineHymnHealingTaken",
    label: "천상의 찬가 치유 증가",
    iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.divineHymn,
    buffRemainingMsKey: "divineHymnHealingTakenMs",
    stackCountBuffKey: "divineHymnHealingTakenStacks",
    showAboveCooldownManager: true,
    showOnMyRaidFrame: false,
    showCountdownOnOverlay: true,
    showCountdownOnRaidFrame: false,
    showStackCountOnOverlay: true
  }),
  Object.freeze({
    key: "desperatePrayerSelfMaxHp",
    label: "구원의 기도 체력 증가",
    iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.desperatePrayer,
    buffRemainingMsKey: "desperatePrayerSelfMaxHpMs",
    showAboveCooldownManager: true,
    showOnMyRaidFrame: true,
    showCountdownOnOverlay: true,
    showCountdownOnRaidFrame: true
  })
]);

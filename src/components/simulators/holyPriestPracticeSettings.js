export const HOLY_PRIEST_HEALER_SLUG = "holy-priest";

// 커스텀으로 추가한 특성 효과 토글.
// true: 활성화, false: 비활성화
export const HOLY_PRIEST_ADDED_TALENT_TOGGLES = Object.freeze({
  halo: true,
  lightweaver: true,
  ultimateSerenity: true,
  divineImage: true,
  upliftingWords: true,
  crisisManagement: true,
  trailOfLight: true,
  lightsResurgence: true
});

// Per-healer default stats.
// hastePct/critPct/masteryPct are percentage values (e.g. 30 means 30%).
export const HOLY_PRIEST_DEFAULT_STATS = Object.freeze({
  intellect: 2000,
  hastePct: 15,
  critPct: 30,
  masteryPct: 30
});

export const HOLY_PRIEST_PRACTICE_TUNING = Object.freeze({
  baseMana: 275000,
  dummyBaseHealth: 375000,
  // Final heal = intellect * healAmountCoefficients[spellKey]
  healAmountCoefficients: Object.freeze({
    flashHeal: 5.6,
    prayerOfHealing: 2.35,
    serenity: 13.5,
    prayerOfMending: 0.61,
    renew: 0.61,
    halo: 0.9,
    cosmicRipple: 0.9,
    divineHymn: 0.9,
    divineImageHealingLight: 5.2,
    divineImageDazzlingLights: 2.1,
    divineImageBlessedLight: 2.1
  }),
  // Default mana model: baseMana * ratio
  manaCostBaseManaRatios: Object.freeze({
    flashHeal: 0.027,
    prayerOfHealing: 0.07,
    serenity: 0,
    prayerOfMending: 0.022,
    halo: 0.025,
    fade: 0,
    apotheosis: 0,
    desperatePrayer: 0.08,
    divineHymn: 0.08
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
    flashHeal: false,
    prayerOfHealing: false,
    divineHymn: true
  }),
  durations: Object.freeze({
    serenityMaxCharges: 2,
    serenityChargeRecoveryMs: 45000,
    prayerOfHealingTargetCount: 5,
    prayerOfHealingPrimaryTargetHealMultiplier: 1.25,
    prayerOfMendingCooldownMs: 12000,
    prayerOfMendingDurationMs: 30000,
    // 회복의 기원이 피해를 받을 때 전달되는 최대 횟수 (코드로 조절 가능)
    prayerOfMendingMaxJumps: 4,
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
    benedictionProcChance: 0.3,
    benedictionDurationMs: 30000,
    benedictionFlashHealHealBonusPct: 0.3,
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

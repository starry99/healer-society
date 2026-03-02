// Discipline simulator single source of truth.
// Tune numbers in this file first; the simulator reads most runtime constants directly from here.

export const DISCIPLINE_SIM_REFERENCE = {
  // Reference schema version (manual tracking).
  modelVersion: "2026-02-17",

  // Core combat/system constants used by simulator runtime.
  core: {
    // Base global cooldown before haste.
    gcdBaseSeconds: 1.5,
    // Minimum GCD cap after haste (WoW hard floor).
    gcdMinSeconds: 0.75,

    // Major/minor cooldowns in seconds.
    cooldowns: {
      apostleSeconds: 90,
      ultimateSeconds: 240,
      mindBlastSeconds: 20
    },

    // Charge systems for spells that store charges.
    charges: {
      penance: {
        // Max stored charges.
        max: 2,
        // Base recharge time before haste.
        rechargeBaseSeconds: 9
      },
      radiance: {
        max: 2,
        rechargeSeconds: 18
      }
    },

    // Keep >= this mana at fight end (safety floor).
    minEndMana: 1,
    // Minimum time gap between Apostle and Ultimate windows.
    crossMajorMinGapSeconds: 36,
    // Float comparison tolerance for time/mana comparisons.
    epsilon: 1e-6,

    // Default input values in UI.
    defaultManaPool: 200000,
    // Observed mana pool used only to back-solve percentage costs from measured flat values.
    observedManaPoolForBacksolve: 55125,
    defaultIntellect: 2000,
    defaultManaRegenPctPer5Sec: 4,
    defaultCritChancePct: 20,
    defaultCritMultiplier: 2,
    // Probability handling mode:
    // - "random": use stochastic rolls for crit/proc
    // - "expected": use deterministic expected values
    probabilityMode: "random",
    // In filler windows, model that Atonement-applying casts may hit already-atoned targets
    // (not perfect target assignment like scripted ramp windows).
    fillerUniqueAtonementTargetModelEnabled: true,
    defaultMasteryAtonementTargetBonusPct: 45,

    // Base channel duration for Ultimate Penitence (haste applies).
    ultimatePenitenceBaseDurationSeconds: 6,
    // Atonement transfer curve settings.
    atonementTransferBaseRatePct: 45,
    atonementTransferBaseTargets: 5,
    atonementTransferMinRateAtMaxTargetsPct: 25,
    atonementTransferMaxTargets: 20,

    // Base atonement duration (seconds).
    baseAtonementDurationSeconds: 19,
    // Penance cast-level multiplier (simplified model: disabled).
    instantPrognosisPenanceDamageMultiplier: 1,
    // Penance custom damage model (user-tunable):
    // final base damage(before calibration/crit/conditional buffs)
    // = intellect * penanceDamageBaseCoefPerIntellect * penanceDamageTalentMultiplier * penanceSecondBoltAdjustmentMultiplier
    penanceDamageBaseCoefPerIntellect: 2.48,
    penanceDamageTalentMultiplier: 2.374,
    // "2번째 화살이 유독 큰 현상" 보정(기본 5/4).
    penanceSecondBoltAdjustmentMultiplier: 1.25,

    // Talent/conditional multipliers.
    // Requested simplification: remove generic "% healing/damage increase" talent scaling from runtime.
    apexPenanceDamageMultiplier: 1,
    apexAtonementHealingMultiplier: 1,
    prophetsInsightHolyAtonementMultiplier: 1,
    voidShieldDefaultTargetCount: 3,
    voidShieldDefaultShieldMultiplier: 1.5,
    darkIndulgenceMindBlastMultiplier: 1,
    darkExtractionMindBlastMultiplier: 1,
    smitePenanceDamageBonusMultiplier: 1,
    holySpellDamageBonusMultiplier: 1,
    // Inner Focus: +20% crit chance on Flash Heal / Power Word: Shield / Penance / Power Word: Radiance.
    innerFocusCritBonusPct: 20,
    burningLightPenanceExtraDamageMultiplier: 1,
    holyRadiancePenanceEnemyBoltAvgMultiplier: 1,
    followupPenanceDamageMultiplierAfterMindBlast: 1,
    // Prosperity and Adversity: next shield after penance is increased by 21%.
    prosperityAdversityNextShieldMultiplier: 1.21,
    eternalBarrierShieldMultiplier: 1,
    shieldManaRefundPct: 0.5,
    shieldManaRefundDelaySeconds: 20,
    archangelBuffSeconds: 18,
    archangelHealingShieldMultiplier: 1,
    radianceAtonementDurationMultiplier: 0.77,
    aegisFromCritDirectHealMultiplier: 0.3,

    // Measured profile baseline for linear scaling.
    referenceIntellect: 759
  },

  // Search/solver quality and pruning controls.
  solverTuning: {
    // Search-time probability handling.
    // "expected": deterministic expected-value branching (recommended to avoid proc-cherry-pick bias)
    // "random": stochastic branching (can overfit lucky proc paths during beam search)
    probabilityModeDuringSearch: "expected",

    // If healing difference is within this ratio, prefer higher mana usage / cast count.
    healingCloseRatioForManaPref: 0.05,
    // Beam width for filler window exploration.
    fillerBeamWidth: 640,
    // Beam width for major/ramp sequence simulation.
    majorBeamWidth: 420,
    // How many states per mana bucket to keep before hard trim.
    perManaBucketLimit: 12,
    // Moving-average window for displayed HPS graph smoothing.
    healingGraphSmoothingSeconds: 1.0,
    // Reserve multiplier to protect mana required for upcoming major prep.
    majorManaReserveSafetyMultiplier: 0.94,
    // Default UI inputs.
    defaultDurationMinutes: 5,
    defaultHastePct: 20,
    // Random mode aggregate runs count (editable).
    monteCarloRuns: 5,

    // Cross-major extra spacing based on radiance recharge pressure.
    crossMajorResourceGapRadianceCharges: 2,

    // Initial drag marker generation defaults.
    initialMajorMarkers: {
      durationSeconds: 300,
      hastePct: 20
    },

    // State-key quantization (dedupe key generation).
    stateKey: {
      manaBucketFloor: 1500,
      manaBucketDivisor: 45,
      timeBucketsPerSecond: 5,
      chargePrecision: 10,
      remainRoundPerSecond: 2,
      pendingRefundLookaheadSeconds: 30,
      castBucketDivisor: 2
    },

    // Final prune strategy.
    pruning: {
      manaBucketFloor: 3500,
      manaBucketDivisor: 30,
      minimumKeepRatio: 0.4
    },

    // Timeline post-processing options.
    timeline: {
      rateSampleStepSeconds: 0.1,
      // WCL-like rolling HPS window size.
      healingRateRollingWindowSeconds: 6
    }
  },

  // Canonical spell definitions used by simulator.
  spells: {
    // spell entry fields:
    // name: display label
    // wowheadId: tooltip/link id
    // manaPct: wowhead base mana %
    // manaPctBacksolved: in-game back-solved percentage model used by this simulator
    // mana cost priority in runtime: manaPctBacksolved -> manaPct
    // castTimeSec: base cast/channel time before haste (0 for instant)
    // usesGcd: whether this spell triggers global cooldown
    shadowWordPain: {
      name: "어둠의 권능: 고통",
      wowheadId: 589,
      manaPct: 2,
      manaPctBacksolved: 1.5,
      castTimeSec: 0,
      usesGcd: true
    },
    penance: {
      name: "회개",
      wowheadId: 47540,
      manaPct: 1.6,
      castTimeSec: 2,
      usesGcd: true
    },
    powerWordShield: {
      name: "신의 권능: 보호막",
      wowheadId: 17,
      manaPct: 10,
      manaPctBacksolved: 2.3,
      castTimeSec: 0,
      usesGcd: true
    },
    flashHeal: {
      name: "순간 치유",
      wowheadId: 2061,
      manaPct: 10,
      manaPctBacksolved: 3,
      castTimeSec: 1.5,
      usesGcd: true
    },
    plea: {
      name: "간청",
      wowheadId: 200829,
      manaPct: 2.2,
      manaPctBacksolved: 2,
      castTimeSec: 0,
      usesGcd: true
    },
    evangelism: {
      name: "사도",
      wowheadId: 472433,
      manaPct: 0,
      manaPctBacksolved: 0,
      castTimeSec: 0,
      usesGcd: true
    },
    powerWordRadiance: {
      name: "신의 권능: 광휘",
      wowheadId: 194509,
      manaPct: 5.4,
      manaPctBacksolved: 5,
      castTimeSec: 1,
      usesGcd: true
    },
    mindBlast: {
      name: "정신 분열",
      wowheadId: 8092,
      manaPct: 4,
      manaPctBacksolved: 2,
      castTimeSec: 1.5,
      usesGcd: true
    },
    smite: {
      name: "성스러운 일격",
      wowheadId: 585,
      manaPct: 3,
      manaPctBacksolved: 0.36,
      castTimeSec: 1.5,
      usesGcd: true
    },
    ultimatePenitence: {
      name: "궁극의 참회",
      wowheadId: 421453,
      manaPct: 0,
      manaPctBacksolved: 0,
      castTimeSec: 6,
      usesGcd: true
    }
  },

  // Ordered spell keys for each ramp template.
  sequences: {
    apostle: [
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
    ],
    ultimate: [
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
    ],
    apostlePrep: ["penance", "powerWordShield", "flashHeal", "plea"],
    ultimatePrep: ["penance", "powerWordShield", "flashHeal", "plea", "powerWordRadiance", "powerWordRadiance"]
  },

  // Hero talent overrides currently modeled.
  heroTalentModifiers: {
    sagesWordsHealMultiplier: {
      flashHeal: 1,
      plea: 1,
      powerWordRadiance: 1
    },
    preventativeMeasuresShieldMultiplier: 1,
    preventativeMeasuresDamageMultiplier: {
      penance: 1,
      smite: 1
    }
  },

  // Base coefficients (% spell power) before runtime multipliers.
  coefficients: {
    baseDirectHealCoef: {
      powerWordShield: 320,
      flashHeal: 682,
      plea: 160,
      powerWordRadiance: 2300,
      evangelism: 0
    },
    baseDamageCoef: {
      shadowWordPain: 90,
      penance: 202.725,
      mindBlast: 210,
      smite: 95,
      ultimatePenitence: 890
    }
  },

  // Pure UI metadata (colors/labels/chart frame).
  ui: {
    spellBarColorByKey: {
      shadowWordPain: "#60a5fa",
      penance: "#38bdf8",
      powerWordShield: "#f59e0b",
      flashHeal: "#4ade80",
      plea: "#34d399",
      evangelism: "#f97316",
      powerWordRadiance: "#22d3ee",
      mindBlast: "#fbbf24",
      smite: "#a78bfa",
      ultimatePenitence: "#c084fc"
    },
    healingRowNameByKey: {
      atonement: "속죄",
      voidShield: "공허 보호막",
      aegis: "아이기스"
    },
    healingRowColorByKey: {
      atonement: "#d9da6f",
      voidShield: "#a78bfa",
      aegis: "#fef08a"
    },
    idleReasonLabels: {
      majorScheduledStart: "메이저 시작 시점 대기",
      majorPenanceCharge: "메이저 중 회개 충전 대기",
      majorRadianceCharge: "메이저 중 광휘 충전 대기",
      fillerSegmentTailNoRoomForMandatory: "필러 구간 끝: 회개+보막 시간 부족",
      fillerMandatoryBranchFailed: "필러 고정 분기 실패(마나/제약)",
      fillerWaitForMandatoryPenance: "필러: 다음 회개 충전까지 대기",
      fillerWaitForRadianceCharge: "필러: 다음 광휘 충전까지 대기",
      fillerBranchFilteredByMajorChargeRule: "필러: 메이저 충전 규칙으로 우선 분기 제외",
      fillerWaitToSegmentEndNoAction: "필러: 창 종료까지 시전 불가",
      fillerFinalizeToSegmentEnd: "필러 정리 대기",
      idleOther: "기타 대기"
    },
    graph: {
      // SVG view size for timeline graphs.
      width: 720,
      height: 220,
      // X-axis label/grid spacing.
      xTickStepSeconds: 30
    }
  },

  // Human-readable spell facts source notes.
  wowheadFacts: [
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
  ],

  // Scaling rule used for measured flat values.
  scaling: {
    referenceIntellect: 759,
    rule: "scaledValue = measuredAt759 * (intellect / 759)"
  },

  // Effective mana model used by simulator.
  manaModel: {
    poolDefault: 200000,
    regenDefaultPctPer5Sec: 4,
    costsPct: {
      shadowWordPain: 1.5,
      penance: 1.5,
      powerWordShield: 2.3,
      flashHeal: 3,
      plea: 2,
      evangelism: 0,
      powerWordRadiance: 5,
      mindBlast: 2,
      smite: 0.36,
      ultimatePenitence: 0
    }
  },

  // Measured values at reference intellect (759) used for linear scaling.
  measuredAtIntellect759: {
    shadowWordPainInstantDamage: 557,
    shadowWordPainDotTotal16Sec: 4481,
    powerWordShieldAbsorb: 11868,
    voidShieldAbsorb: 17912,
    mindBlastDamage: 4009,
    flashHealHealing: 8518,
    // Flash Heal self-heal ratio (caster receives this % of primary heal).
    flashHealSelfHealPctOfPrimary: 20,
    pleaHealing: 2136,
    powerWordRadianceHealPerTarget: 5016,
    powerWordRadianceTargetCount: 5,
    evangelismRadianceMultiplier: 1.5,
    ultimatePenitenceBaseDamage: 75626,
    smiteDamage: 1878,
    // 회개는 캐스트 단위 총합으로 관리:
    // - castTotalDamage: 캐스트 전체 적 피해 총합
    // - castTotalDirectHealing: 캐스트 전체 아군 직접치유 총합
    // - castFlatAtonementPerTarget: 캐스트로 발생하는 속죄 1인당 고정 추가치유
    // NOTE: castTotalDamage는 현재 주 계산식에서 직접 사용하지 않고(커스텀 계수식 사용),
    // 회개 디버그/교차검증 참고값으로 유지됩니다.
    penanceCastTotalDamage: 4472,
    penanceCastTotalDirectHealing: 10000,
    penanceCastFlatAtonementPerTarget: 144
  },

  // Documentation-only coefficient table for verification.
  coefficientsPctOfSpellPower: {
    directHeal: {
      base: {
        powerWordShield: 320,
        flashHeal: 682,
        plea: 160,
        powerWordRadiance: 2300
      },
      finalApplied: {
        powerWordShield: 320,
        flashHeal: 682,
        plea: 160,
        powerWordRadiance: 2300
      }
    },
    damage: {
      base: {
        shadowWordPain: 90,
        penance: 202.725,
        mindBlast: 210,
        smite: 95,
        ultimatePenitence: 890
      },
      finalApplied: {
        shadowWordPain: 90,
        penance: 202.725,
        mindBlast: 210,
        smite: 95,
        ultimatePenitence: 890
      }
    }
  },

  // Atonement transfer curve/tuning controls.
  atonementTransferModel: {
    baseRatePctAt0to5: 45,
    minRatePctAt20: 25,
    maxTargets: 20
  },

  // Atonement application behavior by spell.
  atonementApplicationModel: {
    baseDurationSec: 19,
    evangelismExtendSec: 0,
    perSpellApplyCount: {
      powerWordShield: 1,
      flashHeal: 2,
      plea: 1,
      evangelism: 5,
      powerWordRadiance: 5,
      penance: 0
    },
    notes: [
      "Two Views(회개 아군 미사일)는 속죄를 직접 부여하지 않음",
      "공허 보호막은 캐스트 단위 proc/미proc으로 계산되며, proc 시 나 포함 3인에게 적용"
    ],
    durationModifiers: {
      evangelismDurationMultiplier: 0.77,
      powerWordRadianceDurationMultiplier: 0.77,
      powerWordShieldDurationBonusSec: 4
    }
  },

  // Runtime defaults injected into simulation execution.
  defaultRuntimeTalentsAndMultipliers: {
    // Base multiplier applied to all atonement sources (Apex).
    apexAtonementHealingMultiplier: 1,
    // Additional multiplier for non-Pain damage-source atonement.
    prophetsInsightHolyAtonementMultiplier: 1,
    // Follow-up penance damage multiplier after Mind Blast.
    followupPenanceDamageMultiplierAfterMindBlast: 1,
    // Next shield multiplier after casting Penance.
    nextShieldMultiplierAfterPenance: 1.21,
    // Inner Focus: extra crit chance applied to selected spells.
    innerFocusCritBonusPct: 20,

    // Default mastery input percentage shown in UI.
    masteryAtonementTargetBonusPct: 45,
    // NOTE: mastery multiplier는 저장하지 않고, 런타임에서 masteryAtonementTargetBonusPct로 매번 계산한다.

    // Archangel multipliers/duration.
    archangelHealingShieldMultiplier: 1,
    archangelBuffDurationSec: 18,

    // Void Shield expectation settings.
    voidShield: {
      procChancePct: 37.5,
      targetCount: 3,
      shieldMultiplier: 1.5
    },

    // Aegis shield from critical direct heals.
    aegisFromCritDirectHealMultiplier: 0.3,

    // Mana refund model for shield expiry.
    shieldManaRefund: {
      pct: 0.5,
      delaySec: 20
    }
  },

  // 설명용: 현재 반영된 특성 리스트.
  heroTalentModifiersApplied: [
    {
      key: "prosperityAndAdversity",
      effect: "Next shield after Penance *1.21"
    },
    {
      key: "innerFocus",
      effect: "Flash Heal / Shield / Penance / Radiance crit chance +20%"
    },
    {
      key: "voidShield",
      effect: "Shield proc chance 37.5%, expected 3-target 1.5x shield"
    },
    {
      key: "extendedAtonementDuration",
      effect: "Base Atonement 19s, Shield-applied +4s, Radiance duration multiplier 0.77"
    },
    {
      key: "aegis",
      effect: "Critical direct heals grant additional absorb (30% of crit direct heal)"
    }
  ],

  // Optional calibration against specific WCL reference log.
  calibrationAgainstWcl: {
    enabled: false,
    reference: "cFydmGJpW1a8KtDA / fight=33 / source=1 (Elfypriest)",
    directMultipliers: {
      powerWordShield: 1,
      flashHeal: 1,
      powerWordRadiance: 1,
      penance: 1
    },
    damageMultipliers: {
      penance: 1,
      mindBlast: 1,
      smite: 1,
      ultimatePenitence: 1
    }
  },

  // Documentation-only formula summary.
  formulas: {
    atonementSourceMultiplier:
      "1.0 (no generic % talent damage/healing scaling)",
    finalAtonement:
      "rawAtonement * atonementSourceMultiplier * archangelMultiplier * masteryMultiplier",
    finalDirect:
      "rawDirect * archangelMultiplier * masteryMultiplier"
  }
};

export default DISCIPLINE_SIM_REFERENCE;

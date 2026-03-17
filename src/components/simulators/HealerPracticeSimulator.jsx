import Phaser from "phaser";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { healers } from "../healers";
import { useAuthSession } from "../../hooks/useAuthSession";
import { db, serverTimestamp } from "../../lib/firebase";
import {
  HOLY_PALADIN_ACTIVE_SPELL_KEYS,
  HOLY_PALADIN_CLICK_CASTABLE_KEYS,
  HOLY_PALADIN_DEFAULT_KEYBINDS,
  HOLY_PALADIN_PRACTICE_SPELLS,
  MIN_RAID_SIZE,
  HolyPaladinPracticeEngine,
  buildRandomRaidRoster
} from "../../lib/simulators/holyPaladinPracticeEngine";
import {
  HOLY_PRIEST_ACTIVE_SPELL_KEYS,
  HOLY_PRIEST_CLICK_CASTABLE_KEYS,
  HOLY_PRIEST_DEFAULT_KEYBINDS,
  HOLY_PRIEST_PRACTICE_SPELLS,
  HolyPriestPracticeEngine
} from "../../lib/simulators/holyPriestPracticeEngine";
import {
  RESTORATION_DRUID_ACTIVE_SPELL_KEYS,
  RESTORATION_DRUID_CLICK_CASTABLE_KEYS,
  RESTORATION_DRUID_DEFAULT_KEYBINDS,
  RESTORATION_DRUID_PRACTICE_SPELLS,
  RestorationDruidPracticeEngine
} from "../../lib/simulators/restorationDruidPracticeEngine";
import {
  BLOCKED_KEYBOARD_BINDING_TOKENS,
  CANDIDATE_NAME_POOL,
  COOLDOWN_MANAGER_LAYOUT_CONFIG,
  DEFAULT_PRACTICE_MAP_KEY,
  DEFAULT_SPELL_ICON_URL,
  DEFAULT_TANK_DAMAGE_TAKEN_MULTIPLIER,
  GLOBAL_GAMEOVER_DEATH_THRESHOLD,
  GLOBAL_GAMEOVER_ON_SELF_DEATH,
  GLOBAL_LEECH_HEALING_RATIO,
  GLOBAL_SHOW_CANVAS_COMBAT_TIME,
  GLOBAL_SUCCESS_MESSAGE_TEXT,
  GLOBAL_SUCCESS_ON_TIMEOUT_WITHOUT_GAMEOVER,
  HEALER_PRACTICE_SCORE_COMMON_CONFIG,
  HEALER_PRACTICE_SCORE_CPM_CONFIG_BY_SLUG,
  HEALER_PRACTICE_SCORE_HEALER_CONFIG_BY_SLUG,
  HEALER_PRACTICE_DESKTOP_ONLY_CONFIG,
  HEALER_PRACTICE_DISCLAIMER_BY_HEALER,
  HEALER_PRACTICE_PATCH_META_BY_HEALER,
  HEALER_PRACTICE_RANKING_PATCH_CONFIG,
  HEALER_PRACTICE_MAP_OPTIONS,
  ENGINE_STEP_MS,
  FIXED_TANK_ANCHORS,
  HANGUL_TO_QWERTY_KEY_ALIAS,
  MODIFIER_ONLY_KEYS,
  MODIFIER_OPTIONS,
  MOUSE_BINDING_OPTIONS,
  MOVEMENT_KEY_OPTIONS,
  MOVEMENT_PRESET_KEYS,
  MOVEMENT_RESTRICTED_KEY_LIST_BY_PRESET,
  PHASER_ARENA_VISUAL_CONFIG,
  PHASER_DIFFICULTY_MECHANIC_TUNING,
  RAID_CLASS_POOL,
  RAID_FRAME_VISUAL_CONFIG,
  RAID_LAYOUT_OPTIONS,
  SPELL_QUEUE_WINDOW_MS,
  SPECIAL_PROC_OVERLAY_ICON_SIZE_PX,
  SPECIAL_PROC_OVERLAY_TOP_OFFSET_PX,
  TANK_CLASS_POOL,
  TANK_ROLE_META,
  UI_STEP_MS,
  VALID_MODIFIERS,
  HEALER_PRACTICE_PATCH_NOTES_BY_HEALER
} from "./healerPracticeGlobalSettings";
import {
  COOLDOWN_MANAGER_NON_DISPLAY_SPELL_KEYS,
  COOLDOWN_MANAGER_SECONDARY_SPELL_KEYS,
  COOLDOWN_MANAGER_SPELL_KEYS,
  COOLDOWN_MANAGER_SPELL_META,
  HOLY_PALADIN_ADDED_TALENT_TOGGLES,
  HOLY_PALADIN_CRIT_CONFIG,
  HOLY_PALADIN_DAWNLIGHT_CONFIG,
  HOLY_PALADIN_DEFAULT_STATS,
  HOLY_PALADIN_DIVINE_PURPOSE_CONFIG,
  HOLY_PALADIN_MANA_TUNING_SCALE,
  HOLY_PALADIN_PRACTICE_DIFFICULTY_TUNING,
  HOLY_PALADIN_SOUND_CONFIG,
  HOLY_PALADIN_SUN_SEAR_CONFIG,
  DEFAULT_CLICK_CAST_PREFERRED,
  HOLY_PALADIN_INFUSION_OF_LIGHT_CONFIG,
  HOLY_PALADIN_SPECIAL_PROC_DISPLAY_CONFIG,
  SPELL_ICON_URL_BY_KEY
} from "./holyPaladinPracticeSettings";
import {
  HOLY_PRIEST_COOLDOWN_MANAGER_SECONDARY_SPELL_KEYS,
  HOLY_PRIEST_COOLDOWN_MANAGER_NON_DISPLAY_SPELL_KEYS,
  HOLY_PRIEST_COOLDOWN_MANAGER_SPELL_KEYS,
  HOLY_PRIEST_COOLDOWN_MANAGER_SPELL_META,
  HOLY_PRIEST_ADDED_TALENT_TOGGLES,
  HOLY_PRIEST_CRIT_CONFIG,
  HOLY_PRIEST_DEFAULT_CLICK_CAST_PREFERRED,
  HOLY_PRIEST_DEFAULT_STATS,
  HOLY_PRIEST_HEALER_SLUG,
  HOLY_PRIEST_MANA_TUNING_SCALE,
  HOLY_PRIEST_PRACTICE_DIFFICULTY_TUNING,
  HOLY_PRIEST_SOUND_CONFIG,
  HOLY_PRIEST_SPECIAL_PROC_DISPLAY_CONFIG,
  HOLY_PRIEST_SPELL_ICON_URL_BY_KEY
} from "./holyPriestPracticeSettings";
import {
  RESTORATION_DRUID_COOLDOWN_MANAGER_SECONDARY_SPELL_KEYS,
  RESTORATION_DRUID_COOLDOWN_MANAGER_NON_DISPLAY_SPELL_KEYS,
  RESTORATION_DRUID_COOLDOWN_MANAGER_SPELL_KEYS,
  RESTORATION_DRUID_COOLDOWN_MANAGER_SPELL_META,
  RESTORATION_DRUID_CRIT_CONFIG,
  RESTORATION_DRUID_DEFAULT_CLICK_CAST_PREFERRED,
  RESTORATION_DRUID_DEFAULT_STATS,
  RESTORATION_DRUID_HEALER_SLUG,
  RESTORATION_DRUID_MANA_TUNING_SCALE,
  RESTORATION_DRUID_PRACTICE_DIFFICULTY_TUNING,
  RESTORATION_DRUID_SPECIAL_PROC_DISPLAY_CONFIG,
  RESTORATION_DRUID_TREEANT_CONFIG,
  RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY
} from "./restorationDruidPracticeSettings";

const FIXED_TANK_NAME_SET = new Set(FIXED_TANK_ANCHORS.map((anchor) => anchor.name));
const MY_PLAYER_NAME = "나";
const HOLY_PALADIN_HEALER_SLUG = "holy-paladin";
const HOLY_PRIEST_NAARU_TEXTURE_KEY = "holy-priest-naaru-avatar";
const HOLY_PALADIN_FEEDBACK_CPM_MIN = 40;
const HOLY_PALADIN_FEEDBACK_SKILL_HIT_DAMAGE_MAX = 100;
const HOLY_PALADIN_FEEDBACK_SELF_HEAL_RATIO_MAX_PCT = 10;
const HOLY_PALADIN_FEEDBACK_WASTED_HOLY_POWER_MAX = 5;
const HOLY_PALADIN_FEEDBACK_OVERHEAL_MAX_PCT = 20;
const DEFAULT_SPECIAL_PROC_ICON_SIZE_PX = Math.max(12, Number(SPECIAL_PROC_OVERLAY_ICON_SIZE_PX ?? 19));
const MAX_SPECIAL_PROC_ICON_SIZE_BONUS_PX = 10;
const DEFAULT_COOLDOWN_MANAGER_PRIMARY_ICON_SIZE_PX = Math.max(
  1,
  Number(COOLDOWN_MANAGER_LAYOUT_CONFIG.overlayIconSizePx ?? COOLDOWN_MANAGER_LAYOUT_CONFIG.iconSizePx ?? 34)
);
const MIN_COOLDOWN_MANAGER_PRIMARY_ICON_SIZE_PX = Math.max(
  1,
  DEFAULT_COOLDOWN_MANAGER_PRIMARY_ICON_SIZE_PX - 4
);
const MAX_COOLDOWN_MANAGER_PRIMARY_ICON_SIZE_PX = DEFAULT_COOLDOWN_MANAGER_PRIMARY_ICON_SIZE_PX + 12;
const MIN_COOLDOWN_MANAGER_SECONDARY_ICON_SIZE_PX = 12;
const MAX_COOLDOWN_MANAGER_SECONDARY_ICON_SIZE_PX = 32;
const DEFAULT_COOLDOWN_MANAGER_SECONDARY_ICON_SIZE_PX = Math.max(
  MIN_COOLDOWN_MANAGER_SECONDARY_ICON_SIZE_PX,
  Math.min(
    MAX_COOLDOWN_MANAGER_SECONDARY_ICON_SIZE_PX,
    Math.round(DEFAULT_COOLDOWN_MANAGER_PRIMARY_ICON_SIZE_PX * 0.75)
  )
);
const COOLDOWN_MANAGER_ICON_SIZE_STEP_PX = 2;
const COOLDOWN_RESOURCE_BAR_WIDTH_BONUS_MIN_PX = 0;
const COOLDOWN_RESOURCE_BAR_WIDTH_BONUS_MAX_PX = 24;
const COOLDOWN_RESOURCE_BAR_WIDTH_BONUS_STEP_PX = 1;
const COOLDOWN_MANAGER_SPELL_SECTION_INNER_GAP_PX = 1;
const COOLDOWN_MANAGER_RESOURCE_SECTION_GAP_PX = 1;
const COOLDOWN_MANAGER_CAST_BAR_TOP_MARGIN_PX = 0;
const COOLDOWN_MANAGER_CAST_BAR_BOTTOM_MARGIN_PX = 0;
const DEFAULT_COOLDOWN_RESOURCE_BAR_LAYOUT = Object.freeze({
  sectionOrder: Object.freeze(["spells", "holyPower", "mana", "castBar"]),
  holyPowerWidthBonusPx: 0,
  manaWidthBonusPx: 0
});
const COOLDOWN_RESOURCE_SECTION_LABEL_BY_KEY = Object.freeze({
  spells: "스킬",
  holyPower: "자원바",
  mana: "마나바",
  castBar: "시전바"
});
const DEFAULT_IMPLEMENTED_HEALER_SLUG = HOLY_PALADIN_HEALER_SLUG;
const IMPLEMENTED_HEALER_SLUGS = new Set([HOLY_PALADIN_HEALER_SLUG, HOLY_PRIEST_HEALER_SLUG]); // 여기서 추가하면 카드 열림
const MY_RAID_FRAME_POSITION_OPTIONS = Object.freeze([
  Object.freeze({ value: "random", label: "랜덤 위치 (기본)" }),
  Object.freeze({ value: "firstSlotFixed", label: "첫자리 고정 (1,1)" })
]);
const CUSTOM_MOVEMENT_DIRECTION_OPTIONS = Object.freeze([
  Object.freeze({ value: "up", label: "전진" }),
  Object.freeze({ value: "down", label: "후진" }),
  Object.freeze({ value: "left", label: "좌이동" }),
  Object.freeze({ value: "right", label: "우이동" })
]);

const MOUSE_UI_LABEL_BY_TOKEN = MOUSE_BINDING_OPTIONS.reduce((acc, option) => {
  acc[option.token] = option.label;
  return acc;
}, {});

const MOUSE_CDM_LABEL_BY_TOKEN = MOUSE_BINDING_OPTIONS.reduce((acc, option) => {
  acc[option.token] = String(option.label_cdm ?? option.label ?? option.token ?? "");
  return acc;
}, {});
const VALID_MOUSE_BINDING_TOKEN_SET = new Set(MOUSE_BINDING_OPTIONS.map((option) => option.token));
const HEALER_PRACTICE_KEYBIND_PROFILE_SUBCOLLECTION = "healerPracticeKeybinds";
const HEALER_PRACTICE_RANKING_COLLECTION = "healerPracticeRankings";
const RANKING_ENABLED_DIFFICULTY_KEYS = new Set(["heroic", "mythic", "worldFirstKill"]);
const RANKING_DIFFICULTY_TAB_KEYS = Object.freeze(["heroic", "mythic", "worldFirstKill"]);
const RANKING_FETCH_LIMIT = 200;
const HEALER_PRACTICE_OPEN_RANKING_EVENT = "healer-practice-open-ranking";

function normalizeRankingPatchVersion(value, fallback = "12.0.1") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function clampCooldownResourceBarWidthBonusValue(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.max(
    COOLDOWN_RESOURCE_BAR_WIDTH_BONUS_MIN_PX,
    Math.min(COOLDOWN_RESOURCE_BAR_WIDTH_BONUS_MAX_PX, Math.round(numeric))
  );
}

function normalizeCooldownResourceSectionOrder(value) {
  const source = Array.isArray(value) ? value : [];
  const allowedKeys = ["spells", "holyPower", "mana", "castBar"];
  const allowedKeySet = new Set(allowedKeys);
  const used = new Set();
  const normalized = [];
  for (const item of source) {
    const key = String(item ?? "").trim();
    if (!allowedKeySet.has(key) || used.has(key)) {
      continue;
    }
    used.add(key);
    normalized.push(key);
  }
  for (const key of allowedKeys) {
    if (used.has(key)) {
      continue;
    }
    normalized.push(key);
  }
  return normalized;
}

function normalizeCooldownResourceBarLayout(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    sectionOrder: normalizeCooldownResourceSectionOrder(source.sectionOrder),
    holyPowerWidthBonusPx: clampCooldownResourceBarWidthBonusValue(source.holyPowerWidthBonusPx),
    manaWidthBonusPx: clampCooldownResourceBarWidthBonusValue(source.manaWidthBonusPx)
  };
}

function resolveVisibleCooldownResourceSectionOrder(sectionOrder, visibleKeys = []) {
  const normalizedOrder = normalizeCooldownResourceSectionOrder(sectionOrder);
  const rawVisibleKeys = Array.isArray(visibleKeys) ? visibleKeys : [];
  const visibleSet = new Set(
    rawVisibleKeys
      .map((value) => String(value ?? "").trim())
      .filter((value) => normalizedOrder.includes(value))
  );
  if (!visibleSet.size) {
    return normalizedOrder;
  }
  return normalizedOrder.filter((key) => visibleSet.has(key));
}

function pctToChance(value) {
  const pct = Number(value);
  if (!Number.isFinite(pct)) {
    return 0;
  }
  return Math.max(0, Math.min(1, pct / 100));
}

const HEAL_METER_SPELL_META_BY_HEALER = Object.freeze({
  [HOLY_PALADIN_HEALER_SLUG]: Object.freeze({
    holyShock: Object.freeze({
      name: HOLY_PALADIN_PRACTICE_SPELLS.holyShock.name,
      iconUrl: SPELL_ICON_URL_BY_KEY.holyShock,
      spellId: 20473
    }),
    flashOfLight: Object.freeze({
      name: HOLY_PALADIN_PRACTICE_SPELLS.flashOfLight.name,
      iconUrl: SPELL_ICON_URL_BY_KEY.flashOfLight,
      spellId: 19750
    }),
    holyLight: Object.freeze({
      name: HOLY_PALADIN_PRACTICE_SPELLS.holyLight.name,
      iconUrl: SPELL_ICON_URL_BY_KEY.holyLight,
      spellId: 82326
    }),
    lightOfDawn: Object.freeze({
      name: HOLY_PALADIN_PRACTICE_SPELLS.lightOfDawn.name,
      iconUrl: SPELL_ICON_URL_BY_KEY.lightOfDawn,
      spellId: 85222
    }),
    eternalFlame: Object.freeze({
      name: HOLY_PALADIN_PRACTICE_SPELLS.eternalFlame.name,
      iconUrl: SPELL_ICON_URL_BY_KEY.eternalFlame,
      spellId: 156322
    }),
    divineBlessing: Object.freeze({
      name: HOLY_PALADIN_PRACTICE_SPELLS.divineBlessing.name,
      iconUrl: SPELL_ICON_URL_BY_KEY.divineBlessing,
      spellId: 633
    }),
    divineToll: Object.freeze({
      name: HOLY_PALADIN_PRACTICE_SPELLS.divineToll.name,
      iconUrl: SPELL_ICON_URL_BY_KEY.divineToll,
      spellId: 375576
    }),
    dawnlight: Object.freeze({
      name: "새벽빛",
      iconUrl: SPELL_ICON_URL_BY_KEY.dawnlight || SPELL_ICON_URL_BY_KEY.lightOfDawn,
      spellId: 431377
    }),
    beaconTransfer: Object.freeze({
      name: "빛의 봉화",
      iconUrl: SPELL_ICON_URL_BY_KEY.beaconOfLight,
      spellId: 53563
    }),
    beaconOfSaviorTransfer: Object.freeze({
      name: "구세주의 봉화",
      iconUrl: SPELL_ICON_URL_BY_KEY.beaconOfSavior,
      spellId: 1244878
    }),
    beaconOfSaviorShield: Object.freeze({
      name: "구세주의 봉화 보호막",
      iconUrl: SPELL_ICON_URL_BY_KEY.beaconOfSavior,
      spellId: 1245368
    }),
    sunSear: Object.freeze({
      name: "불사르는 태양",
      iconUrl: SPELL_ICON_URL_BY_KEY.sunSear || SPELL_ICON_URL_BY_KEY.holyShock,
      spellId: 431413
    }),
    benevolentHealer: Object.freeze({
      name: "관대한 치유사",
      iconUrl: SPELL_ICON_URL_BY_KEY.flashOfLight,
      spellId: 469435
    }),
    leech: Object.freeze({
      name: "생기흡수",
      iconUrl: DEFAULT_SPELL_ICON_URL,
      spellId: 143924
    })
  }),
  [HOLY_PRIEST_HEALER_SLUG]: Object.freeze({
    flashHeal: Object.freeze({
      name: HOLY_PRIEST_PRACTICE_SPELLS.flashHeal.name,
      iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.flashHeal,
      spellId: 2061
    }),
    prayerOfHealing: Object.freeze({
      name: HOLY_PRIEST_PRACTICE_SPELLS.prayerOfHealing.name,
      iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.prayerOfHealing,
      spellId: 596
    }),
    serenity: Object.freeze({
      name: HOLY_PRIEST_PRACTICE_SPELLS.serenity.name,
      iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.serenity,
      spellId: 2050
    }),
    ultimateSerenity: Object.freeze({
      name: "궁극의 평온",
      iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.ultimateSerenity || HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.serenity,
      spellId: 1246517
    }),
    prayerOfMending: Object.freeze({
      name: HOLY_PRIEST_PRACTICE_SPELLS.prayerOfMending.name,
      iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.prayerOfMending,
      spellId: 33076
    }),
    renew: Object.freeze({
      name: "소생",
      iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.renew || DEFAULT_SPELL_ICON_URL,
      spellId: 139
    }),
    halo: Object.freeze({
      name: HOLY_PRIEST_PRACTICE_SPELLS.halo.name,
      iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.halo,
      spellId: 120517
    }),
    cosmicRipple: Object.freeze({
      name: "우주의 파장",
      iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.cosmicRipple || DEFAULT_SPELL_ICON_URL,
      spellId: 238136
    }),
    divineImage: Object.freeze({
      name: "신성한 환영",
      iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.divineImage || HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.serenity,
      spellId: 392990
    }),
    divineImageHealingLight: Object.freeze({
      name: "신성한 환영 - 치유의 빛",
      iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.divineImage || HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.serenity,
      spellId: 392990
    }),
    divineImageDazzlingLights: Object.freeze({
      name: "신성한 환영 - 눈부신 빛",
      iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.divineImage || HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.serenity,
      spellId: 392990
    }),
    divineImageBlessedLight: Object.freeze({
      name: "신성한 환영 - 축복받은 빛",
      iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.divineImage || HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.serenity,
      spellId: 392990
    }),
    benediction: Object.freeze({
      name: "축도",
      iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.benediction || HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.flashHeal,
      spellId: 1262763
    }),
    trailOfLight: Object.freeze({
      name: "빛의 흔적",
      iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.trailOfLight || HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.flashHeal,
      spellId: 234946
    }),
    dispersingLight: Object.freeze({
      name: "흩어지는 빛",
      iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.dispersingLight || HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.flashHeal,
      spellId: 1215265
    }),
    bindingHeal: Object.freeze({
      name: "결속의 치유",
      iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.bindingHeal || HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.flashHeal,
      spellId: 368276
    }),
    fade: Object.freeze({
      name: HOLY_PRIEST_PRACTICE_SPELLS.fade.name,
      iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.fade,
      spellId: 586
    }),
    apotheosis: Object.freeze({
      name: HOLY_PRIEST_PRACTICE_SPELLS.apotheosis.name,
      iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.apotheosis,
      spellId: 200183
    }),
    desperatePrayer: Object.freeze({
      name: HOLY_PRIEST_PRACTICE_SPELLS.desperatePrayer.name,
      iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.desperatePrayer,
      spellId: 19236
    }),
    divineHymn: Object.freeze({
      name: HOLY_PRIEST_PRACTICE_SPELLS.divineHymn.name,
      iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.divineHymn,
      spellId: 64843
    }),
    echoOfLight: Object.freeze({
      name: "빛의 반향",
      iconUrl: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.echoOfLight || DEFAULT_SPELL_ICON_URL,
      spellId: 77485
    }),
    leech: Object.freeze({
      name: "생기흡수",
      iconUrl: DEFAULT_SPELL_ICON_URL,
      spellId: 143924
    })
  }),
  [RESTORATION_DRUID_HEALER_SLUG]: Object.freeze({
    rejuvenation: Object.freeze({
      name: RESTORATION_DRUID_PRACTICE_SPELLS.rejuvenation.name,
      iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.rejuvenation,
      spellId: 774
    }),
    regrowth: Object.freeze({
      name: RESTORATION_DRUID_PRACTICE_SPELLS.regrowth.name,
      iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.regrowth,
      spellId: 8936
    }),
    wildGrowth: Object.freeze({
      name: RESTORATION_DRUID_PRACTICE_SPELLS.wildGrowth.name,
      iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.wildGrowth,
      spellId: 48438
    }),
    lifebloom: Object.freeze({
      name: RESTORATION_DRUID_PRACTICE_SPELLS.lifebloom.name,
      iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.lifebloom,
      spellId: 33763
    }),
    swiftmend: Object.freeze({
      name: RESTORATION_DRUID_PRACTICE_SPELLS.swiftmend.name,
      iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.swiftmend,
      spellId: 18562
    }),
    convokeSpirits: Object.freeze({
      name: RESTORATION_DRUID_PRACTICE_SPELLS.convokeSpirits.name,
      iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.convokeSpirits,
      spellId: 391528
    }),
    tranquility: Object.freeze({
      name: RESTORATION_DRUID_PRACTICE_SPELLS.tranquility.name,
      iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.tranquility,
      spellId: 740
    }),
    barkskin: Object.freeze({
      name: RESTORATION_DRUID_PRACTICE_SPELLS.barkskin.name,
      iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.barkskin,
      spellId: 22812
    }),
    nurture: Object.freeze({
      name: "육성",
      iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.nurture,
      spellId: 422090
    }),
    everbloom: Object.freeze({
      name: "상록숲",
      iconUrl: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.everbloom,
      spellId: 1244331
    }),
    leech: Object.freeze({
      name: "생기흡수",
      iconUrl: DEFAULT_SPELL_ICON_URL,
      spellId: 143924
    })
  })
});

const HEAL_METER_GROUPS_BY_HEALER = Object.freeze({
  [HOLY_PRIEST_HEALER_SLUG]: Object.freeze([
    Object.freeze({
      parentSpellKey: "divineImage",
      childSpellKeys: Object.freeze([
        "divineImageHealingLight",
        "divineImageDazzlingLights",
        "divineImageBlessedLight"
      ])
    })
  ])
});

function buildHealMeterGrouping(groupDefinitions = []) {
  const childToParentSpellKey = {};
  const childSpellKeysByParent = {};
  for (const definition of groupDefinitions) {
    const parentSpellKey = String(definition?.parentSpellKey ?? "").trim();
    if (!parentSpellKey) {
      continue;
    }
    const childSpellKeys = Array.isArray(definition?.childSpellKeys)
      ? definition.childSpellKeys.map((value) => String(value ?? "").trim()).filter(Boolean)
      : [];
    if (!childSpellKeys.length) {
      continue;
    }
    childSpellKeysByParent[parentSpellKey] = childSpellKeys;
    for (const childSpellKey of childSpellKeys) {
      childToParentSpellKey[childSpellKey] = parentSpellKey;
    }
  }
  return {
    childToParentSpellKey: Object.freeze(childToParentSpellKey),
    childSpellKeysByParent: Object.freeze(childSpellKeysByParent)
  };
}

const HEALER_PRACTICE_RUNTIME_BY_SLUG = Object.freeze({
  [HOLY_PALADIN_HEALER_SLUG]: Object.freeze({
    engineClass: HolyPaladinPracticeEngine,
    activeSpellKeys: HOLY_PALADIN_ACTIVE_SPELL_KEYS,
    clickCastableKeys: HOLY_PALADIN_CLICK_CASTABLE_KEYS,
    defaultKeybinds: HOLY_PALADIN_DEFAULT_KEYBINDS,
    defaultClickCastPreferred: DEFAULT_CLICK_CAST_PREFERRED,
    cooldownManagerSpellKeys: COOLDOWN_MANAGER_SPELL_KEYS,
    cooldownManagerSecondarySpellKeys: COOLDOWN_MANAGER_SECONDARY_SPELL_KEYS,
    cooldownManagerNonDisplaySpellKeys: COOLDOWN_MANAGER_NON_DISPLAY_SPELL_KEYS,
    cooldownManagerSpellMeta: COOLDOWN_MANAGER_SPELL_META,
    spellIconUrlByKey: SPELL_ICON_URL_BY_KEY,
    practiceSpells: HOLY_PALADIN_PRACTICE_SPELLS,
    specialProcDisplayConfig: HOLY_PALADIN_SPECIAL_PROC_DISPLAY_CONFIG,
    healMeterSpellMeta: HEAL_METER_SPELL_META_BY_HEALER[HOLY_PALADIN_HEALER_SLUG],
    difficultyTuning: HOLY_PALADIN_PRACTICE_DIFFICULTY_TUNING,
    buildEngineConfig: () => ({
      infusionOfLightProcChance: HOLY_PALADIN_INFUSION_OF_LIGHT_CONFIG.procChance,
      infusionOfLightDurationMs: HOLY_PALADIN_INFUSION_OF_LIGHT_CONFIG.durationMs,
      infusionOfLightFlashOfLightHealMultiplier: HOLY_PALADIN_INFUSION_OF_LIGHT_CONFIG.flashOfLightHealMultiplier,
      infusionOfLightTalentEnabled: HOLY_PALADIN_ADDED_TALENT_TOGGLES.infusionOfLight,
      divinePurposeTalentEnabled: HOLY_PALADIN_ADDED_TALENT_TOGGLES.divinePurpose,
      divinePurposeProcChance: HOLY_PALADIN_DIVINE_PURPOSE_CONFIG.procChance,
      divinePurposeHealBonusRatio: HOLY_PALADIN_DIVINE_PURPOSE_CONFIG.healBonusPct,
      divinePurposeDurationMs: HOLY_PALADIN_DIVINE_PURPOSE_CONFIG.durationMs,
      handOfFaithTalentEnabled: HOLY_PALADIN_ADDED_TALENT_TOGGLES.handOfFaith,
      holyRevelationTalentEnabled: HOLY_PALADIN_ADDED_TALENT_TOGGLES.holyRevelation,
      radiantLightTalentEnabled: HOLY_PALADIN_ADDED_TALENT_TOGGLES.radiantLight,
      unfadingLightTalentEnabled: HOLY_PALADIN_ADDED_TALENT_TOGGLES.unfadingLight,
      extricationTalentEnabled: HOLY_PALADIN_ADDED_TALENT_TOGGLES.extrication,
      dawnlightTalentEnabled: HOLY_PALADIN_ADDED_TALENT_TOGGLES.dawnlight,
      sunSearTalentEnabled: HOLY_PALADIN_ADDED_TALENT_TOGGLES.sunSear,
      reclamationTalentEnabled: HOLY_PALADIN_ADDED_TALENT_TOGGLES.reclamation,
      gloriousDawnTalentEnabled: HOLY_PALADIN_ADDED_TALENT_TOGGLES.gloriousDawn,
      archangelsBarrierTalentEnabled: HOLY_PALADIN_ADDED_TALENT_TOGGLES.archangelsBarrier,
      beaconOfSaviorTalentEnabled: HOLY_PALADIN_ADDED_TALENT_TOGGLES.beaconOfSavior,
      lightOfMartyrTalentEnabled: HOLY_PALADIN_ADDED_TALENT_TOGGLES.lightOfMartyr,
      benevolentHealerTalentEnabled: HOLY_PALADIN_ADDED_TALENT_TOGGLES.benevolentHealer,
      secondSunriseTalentEnabled: HOLY_PALADIN_ADDED_TALENT_TOGGLES.secondSunrise,
      seasonOneTierTalentEnabled: HOLY_PALADIN_ADDED_TALENT_TOGGLES.seasonOneTier,
      manaTuningScale: HOLY_PALADIN_MANA_TUNING_SCALE,
      intellect: HOLY_PALADIN_DEFAULT_STATS.intellect,
      hastePct: HOLY_PALADIN_DEFAULT_STATS.hastePct,
      masteryPct: HOLY_PALADIN_DEFAULT_STATS.masteryPct,
      baseCritChance: pctToChance(HOLY_PALADIN_DEFAULT_STATS.critPct),
      defaultCritHealMultiplier: HOLY_PALADIN_CRIT_CONFIG.defaultCritHealMultiplier,
      holyShockCritChanceBonus: HOLY_PALADIN_CRIT_CONFIG.holyShockCritChanceBonus,
      holyShockCritHealMultiplier: HOLY_PALADIN_CRIT_CONFIG.holyShockCritHealMultiplier,
      flashOfLightCritHealMultiplier: HOLY_PALADIN_CRIT_CONFIG.flashOfLightCritHealMultiplier,
      eternalFlameCritChanceBonusAtZeroHp: HOLY_PALADIN_CRIT_CONFIG.eternalFlameCritChanceBonusAtZeroHp,
      sunSearEnabled: HOLY_PALADIN_SUN_SEAR_CONFIG.enabled,
      sunSearTotalHealRatio: HOLY_PALADIN_SUN_SEAR_CONFIG.totalHealRatio,
      sunSearDurationMs: HOLY_PALADIN_SUN_SEAR_CONFIG.durationMs,
      sunSearTickMs: HOLY_PALADIN_SUN_SEAR_CONFIG.tickMs,
      dawnlightChargesFromDivineToll: HOLY_PALADIN_DAWNLIGHT_CONFIG.chargesFromDivineToll,
      dawnlightEmpowermentDurationMs: HOLY_PALADIN_DAWNLIGHT_CONFIG.empowermentDurationMs,
      dawnlightTotalHealRatio: HOLY_PALADIN_DAWNLIGHT_CONFIG.totalHealRatio,
      dawnlightDurationMs: HOLY_PALADIN_DAWNLIGHT_CONFIG.durationMs,
      dawnlightTickMs: HOLY_PALADIN_DAWNLIGHT_CONFIG.tickMs
    })
  }),
  [HOLY_PRIEST_HEALER_SLUG]: Object.freeze({
    engineClass: HolyPriestPracticeEngine,
    activeSpellKeys: HOLY_PRIEST_ACTIVE_SPELL_KEYS,
    clickCastableKeys: HOLY_PRIEST_CLICK_CASTABLE_KEYS,
    defaultKeybinds: HOLY_PRIEST_DEFAULT_KEYBINDS,
    defaultClickCastPreferred: HOLY_PRIEST_DEFAULT_CLICK_CAST_PREFERRED,
    cooldownManagerSpellKeys: HOLY_PRIEST_COOLDOWN_MANAGER_SPELL_KEYS,
    cooldownManagerSecondarySpellKeys: HOLY_PRIEST_COOLDOWN_MANAGER_SECONDARY_SPELL_KEYS,
    cooldownManagerNonDisplaySpellKeys: HOLY_PRIEST_COOLDOWN_MANAGER_NON_DISPLAY_SPELL_KEYS,
    cooldownManagerSpellMeta: HOLY_PRIEST_COOLDOWN_MANAGER_SPELL_META,
    spellIconUrlByKey: HOLY_PRIEST_SPELL_ICON_URL_BY_KEY,
    practiceSpells: HOLY_PRIEST_PRACTICE_SPELLS,
    specialProcDisplayConfig: HOLY_PRIEST_SPECIAL_PROC_DISPLAY_CONFIG,
    healMeterSpellMeta: HEAL_METER_SPELL_META_BY_HEALER[HOLY_PRIEST_HEALER_SLUG],
    difficultyTuning: HOLY_PRIEST_PRACTICE_DIFFICULTY_TUNING,
    buildEngineConfig: () => ({
      haloTalentEnabled: HOLY_PRIEST_ADDED_TALENT_TOGGLES.halo,
      prayersOfTheVirtuousTalentEnabled: HOLY_PRIEST_ADDED_TALENT_TOGGLES.prayersOfTheVirtuous,
      lightweaverTalentEnabled: HOLY_PRIEST_ADDED_TALENT_TOGGLES.lightweaver,
      ultimateSerenityTalentEnabled: HOLY_PRIEST_ADDED_TALENT_TOGGLES.ultimateSerenity,
      divineImageTalentEnabled: HOLY_PRIEST_ADDED_TALENT_TOGGLES.divineImage,
      seasonOneTierTalentEnabled: HOLY_PRIEST_ADDED_TALENT_TOGGLES.seasonOneTier,
      upliftingWordsTalentEnabled: HOLY_PRIEST_ADDED_TALENT_TOGGLES.upliftingWords,
      crisisManagementTalentEnabled: HOLY_PRIEST_ADDED_TALENT_TOGGLES.crisisManagement,
      trailOfLightTalentEnabled: HOLY_PRIEST_ADDED_TALENT_TOGGLES.trailOfLight,
      dispersingLightTalentEnabled: HOLY_PRIEST_ADDED_TALENT_TOGGLES.dispersingLight,
      lightsResurgenceTalentEnabled: HOLY_PRIEST_ADDED_TALENT_TOGGLES.lightsResurgence,
      resonantEnergyTalentEnabled: HOLY_PRIEST_ADDED_TALENT_TOGGLES.resonantEnergy,
      manaTuningScale: HOLY_PRIEST_MANA_TUNING_SCALE,
      intellect: HOLY_PRIEST_DEFAULT_STATS.intellect,
      hastePct: HOLY_PRIEST_DEFAULT_STATS.hastePct,
      masteryPct: HOLY_PRIEST_DEFAULT_STATS.masteryPct,
      baseCritChance: pctToChance(HOLY_PRIEST_DEFAULT_STATS.critPct),
      defaultCritHealMultiplier: HOLY_PRIEST_CRIT_CONFIG.defaultCritHealMultiplier,
      upliftingWordsSerenityCritChanceBonus: HOLY_PRIEST_CRIT_CONFIG.upliftingWordsSerenityCritChanceBonus,
      crisisManagementFlashHealCritChanceBonus: HOLY_PRIEST_CRIT_CONFIG.crisisManagementFlashHealCritChanceBonus,
      crisisManagementPrayerOfHealingCritChanceBonus:
        HOLY_PRIEST_CRIT_CONFIG.crisisManagementPrayerOfHealingCritChanceBonus
    })
  }),
  [RESTORATION_DRUID_HEALER_SLUG]: Object.freeze({
    engineClass: RestorationDruidPracticeEngine,
    activeSpellKeys: RESTORATION_DRUID_ACTIVE_SPELL_KEYS,
    clickCastableKeys: RESTORATION_DRUID_CLICK_CASTABLE_KEYS,
    defaultKeybinds: RESTORATION_DRUID_DEFAULT_KEYBINDS,
    defaultClickCastPreferred: RESTORATION_DRUID_DEFAULT_CLICK_CAST_PREFERRED,
    cooldownManagerSpellKeys: RESTORATION_DRUID_COOLDOWN_MANAGER_SPELL_KEYS,
    cooldownManagerSecondarySpellKeys: RESTORATION_DRUID_COOLDOWN_MANAGER_SECONDARY_SPELL_KEYS,
    cooldownManagerNonDisplaySpellKeys: RESTORATION_DRUID_COOLDOWN_MANAGER_NON_DISPLAY_SPELL_KEYS,
    cooldownManagerSpellMeta: RESTORATION_DRUID_COOLDOWN_MANAGER_SPELL_META,
    spellIconUrlByKey: RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY,
    practiceSpells: RESTORATION_DRUID_PRACTICE_SPELLS,
    specialProcDisplayConfig: RESTORATION_DRUID_SPECIAL_PROC_DISPLAY_CONFIG,
    healMeterSpellMeta: HEAL_METER_SPELL_META_BY_HEALER[RESTORATION_DRUID_HEALER_SLUG],
    difficultyTuning: RESTORATION_DRUID_PRACTICE_DIFFICULTY_TUNING,
    buildEngineConfig: () => ({
      manaTuningScale: RESTORATION_DRUID_MANA_TUNING_SCALE,
      intellect: RESTORATION_DRUID_DEFAULT_STATS.intellect,
      hastePct: RESTORATION_DRUID_DEFAULT_STATS.hastePct,
      baseCritChance: pctToChance(RESTORATION_DRUID_DEFAULT_STATS.critPct),
      masteryPct: RESTORATION_DRUID_DEFAULT_STATS.masteryPct,
      defaultCritHealMultiplier: RESTORATION_DRUID_CRIT_CONFIG.defaultCritHealMultiplier,
      treeantDurationMs: RESTORATION_DRUID_TREEANT_CONFIG.durationMs,
      treeantNurtureTickMs: RESTORATION_DRUID_TREEANT_CONFIG.nurtureTickMs
    })
  })
});

function resolveHealerPracticeRuntime(slug) {
  const key = String(slug ?? "").trim();
  return HEALER_PRACTICE_RUNTIME_BY_SLUG[key] ?? HEALER_PRACTICE_RUNTIME_BY_SLUG[DEFAULT_IMPLEMENTED_HEALER_SLUG];
}

function createSeededRng(seed) {
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

function assignRandomClassesToRoster(roster, seed = Date.now()) {
  const rng = createSeededRng(seed);
  const classMetaByKey = RAID_CLASS_POOL.reduce((acc, classMeta) => {
    acc[classMeta.key] = classMeta;
    return acc;
  }, {});
  const classCapsByKey = RAID_CLASS_POOL.reduce((acc, classMeta) => {
    acc[classMeta.key] = 2;
    return acc;
  }, {});

  classCapsByKey.paladin = 0;
  classCapsByKey.priest = 1;
  classCapsByKey.deathKnight = 1;
  classCapsByKey.rogue = Math.min(2, Number(classCapsByKey.rogue ?? 2));
  classCapsByKey.monk = Math.min(2, Number(classCapsByKey.monk ?? 2));

  const classCountsByKey = {};
  const assignedClassKeyByIndex = new Map();
  const assignableIndexes = [];

  const markAssignedClass = (index, classKey) => {
    const normalizedKey = String(classKey ?? "");
    if (!normalizedKey) {
      return;
    }
    assignedClassKeyByIndex.set(index, normalizedKey);
    classCountsByKey[normalizedKey] = (classCountsByKey[normalizedKey] ?? 0) + 1;
  };

  for (let index = 0; index < roster.length; index += 1) {
    const player = roster[index];
    const name = String(player?.name ?? "").trim();
    if (name === MY_PLAYER_NAME || FIXED_TANK_NAME_SET.has(name)) {
      continue;
    }
    assignableIndexes.push(index);
  }

  for (let index = assignableIndexes.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(rng() * (index + 1));
    [assignableIndexes[index], assignableIndexes[nextIndex]] = [assignableIndexes[nextIndex], assignableIndexes[index]];
  }

  const forcedClassKeys = ["priest", "deathKnight"];
  for (const forcedClassKey of forcedClassKeys) {
    const classMeta = classMetaByKey[forcedClassKey];
    if (!classMeta || assignableIndexes.length === 0) {
      continue;
    }
    const targetIndex = assignableIndexes.pop();
    markAssignedClass(targetIndex, forcedClassKey);
  }

  for (const targetIndex of assignableIndexes) {
    const availableClassPool = RAID_CLASS_POOL.filter((classMeta) => {
      const cap = Number(classCapsByKey[classMeta.key]);
      if (!Number.isFinite(cap) || cap <= 0) {
        return false;
      }
      return (classCountsByKey[classMeta.key] ?? 0) < cap;
    });
    const pickedClass =
      availableClassPool[Math.floor(rng() * availableClassPool.length)] ??
      classMetaByKey.warrior ??
      RAID_CLASS_POOL[0];
    markAssignedClass(targetIndex, pickedClass?.key);
  }

  return roster.map((player, index) => {
    const classKey = assignedClassKeyByIndex.get(index);
    if (!classKey) {
      return player;
    }

    const picked = classMetaByKey[classKey] ?? classMetaByKey.warrior ?? RAID_CLASS_POOL[0];
    const nextPlayer = {
      ...player,
      classKey: picked.key,
      className: picked.name,
      classColor: picked.color,
      incomingDamageTakenMultiplier: undefined,
      maxHp: undefined
    };

    if (picked.key === "priest") {
      nextPlayer.incomingDamageTakenMultiplier = 1.1;
    } else if (picked.key === "deathKnight") {
      nextPlayer.maxHp = 400000;
      nextPlayer.incomingDamageTakenMultiplier = 0.9;
    } else if (picked.key === "warlock") {
      nextPlayer.maxHp = 400000;
    }

    return nextPlayer;
  });
}

function normalizeSingleKeyboardCharacter(source) {
  const alias = HANGUL_TO_QWERTY_KEY_ALIAS[source];
  if (alias) {
    return alias;
  }
  return source.toUpperCase();
}

function normalizeKey(value) {
  if (value === " ") {
    return "SPACE";
  }

  const source = String(value ?? "").trim();
  if (!source) {
    return "";
  }

  const aliases = {
    esc: "ESC",
    escape: "ESC",
    enter: "ENTER",
    tab: "TAB",
    shift: "SHIFT",
    control: "CTRL",
    ctrl: "CTRL",
    alt: "ALT",
    cmd: "CMD",
    command: "COMMAND",
    arrowup: "ARROWUP",
    arrowdown: "ARROWDOWN",
    arrowleft: "ARROWLEFT",
    arrowright: "ARROWRIGHT",
    space: "SPACE"
  };

  const alias = aliases[source.toLowerCase()];
  if (alias) {
    return alias;
  }

  if (source.length === 1) {
    return normalizeSingleKeyboardCharacter(source);
  }

  return source.toUpperCase().replace(/\s+/g, "");
}

function normalizeModifier(value) {
  const normalized = String(value ?? "").trim().toUpperCase();
  return VALID_MODIFIERS.has(normalized) ? normalized : "";
}

function formatTime(ms) {
  const safeMs = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.floor(safeMs / 1000);
  const minute = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const second = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minute}:${second}`;
}

function isTimeoutFinishedSnapshot(snapshot) {
  const nowMs = Number(snapshot?.nowMs ?? 0);
  const durationMs = Number(snapshot?.durationMs ?? 0);
  if (!Number.isFinite(nowMs) || !Number.isFinite(durationMs) || durationMs <= 0) {
    return false;
  }
  return nowMs >= durationMs - ENGINE_STEP_MS;
}

function resolveDifficultyValue(configByDifficulty, difficultyKey) {
  if (!configByDifficulty || typeof configByDifficulty !== "object") {
    return null;
  }
  const requestedKey = String(difficultyKey ?? "").trim();
  if (requestedKey && Object.prototype.hasOwnProperty.call(configByDifficulty, requestedKey)) {
    return configByDifficulty[requestedKey];
  }
  if (Object.prototype.hasOwnProperty.call(configByDifficulty, "normal")) {
    return configByDifficulty.normal;
  }
  const firstKey = Object.keys(configByDifficulty)[0];
  return firstKey ? configByDifficulty[firstKey] : null;
}

function clampScore(score, maxPoints) {
  const safeMaxPoints = Math.max(0, Number(maxPoints) || 0);
  const safeScore = Number(score);
  if (!Number.isFinite(safeScore)) {
    return 0;
  }
  return Math.max(0, Math.min(safeMaxPoints, safeScore));
}

function roundToOneDecimal(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.round(numeric * 10) / 10;
}

function toMillisFromUnknownTimestamp(value) {
  if (!value) {
    return 0;
  }
  if (typeof value?.toMillis === "function") {
    const millis = Number(value.toMillis());
    return Number.isFinite(millis) ? millis : 0;
  }
  const asNumber = Number(value);
  if (Number.isFinite(asNumber)) {
    return asNumber;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function computeCountPenaltyScore(value, config, defaultMaxPoints = 20) {
  const maxPoints = Math.max(0, Number(config?.maxPoints ?? defaultMaxPoints) || defaultMaxPoints);
  const count = Math.max(0, Number(value) || 0);
  const pointsLostPerUnit = Math.max(0, Number(config?.pointsLostPerUnit ?? 1) || 1);
  const deductedPoints = Math.floor(count * pointsLostPerUnit + 1e-9);
  return clampScore(maxPoints - deductedPoints, maxPoints);
}

function computeLowerIsBetterStepScore(valuePct, config, defaults) {
  const maxPoints = Math.max(0, Number(config?.maxPoints ?? defaults?.maxPoints ?? 20) || 20);
  const fullScoreThreshold = Number(config?.fullScoreAtOrBelowPct ?? defaults?.fullScoreAtOrBelowPct ?? 0);
  const pctPerStep = Math.max(
    1e-6,
    Number(config?.pctPerStep ?? config?.pctPerPointLost ?? defaults?.pctPerStep ?? defaults?.pctPerPointLost ?? 1) || 1
  );
  const pointsLostPerStep = Math.max(
    0,
    Number(config?.pointsLostPerStep ?? defaults?.pointsLostPerStep ?? 1) || 1
  );
  const value = Math.max(0, Number(valuePct) || 0);
  if (value <= fullScoreThreshold) {
    return maxPoints;
  }
  const stepCount = Math.floor((value - fullScoreThreshold + 1e-9) / pctPerStep);
  const deductedPoints = stepCount * pointsLostPerStep;
  return clampScore(maxPoints - deductedPoints, maxPoints);
}

function computeHigherIsBetterStepScore(valuePct, config, defaults) {
  const maxPoints = Math.max(0, Number(config?.maxPoints ?? defaults?.maxPoints ?? 20) || 20);
  const fullScoreThreshold = Number(config?.fullScoreAtOrAbovePct ?? defaults?.fullScoreAtOrAbovePct ?? 100);
  const pctPerStep = Math.max(
    1e-6,
    Number(config?.pctPerStep ?? config?.pctPerPointLost ?? defaults?.pctPerStep ?? defaults?.pctPerPointLost ?? 1) || 1
  );
  const pointsLostPerStep = Math.max(
    0,
    Number(config?.pointsLostPerStep ?? defaults?.pointsLostPerStep ?? 1) || 1
  );
  const value = Math.max(0, Number(valuePct) || 0);
  if (value >= fullScoreThreshold) {
    return maxPoints;
  }
  const stepCount = Math.floor((fullScoreThreshold - value + 1e-9) / pctPerStep);
  const deductedPoints = stepCount * pointsLostPerStep;
  return clampScore(maxPoints - deductedPoints, maxPoints);
}

function computeHigherIsBetterLinearScore(value, config, defaults) {
  const maxPoints = Math.max(0, Number(config?.maxPoints ?? defaults?.maxPoints ?? 10) || 10);
  const fullScoreAtOrAbove = Number(
    config?.fullScoreAtOrAboveValue ?? config?.fullScoreAtOrAboveCpm ?? defaults?.fullScoreAtOrAboveValue ?? 1
  );
  const zeroScoreAtOrBelow = Number(
    config?.zeroScoreAtOrBelowValue ?? config?.zeroScoreAtOrBelowCpm ?? defaults?.zeroScoreAtOrBelowValue ?? 0
  );
  const input = Math.max(0, Number(value) || 0);
  if (fullScoreAtOrAbove <= zeroScoreAtOrBelow + 1e-9) {
    return input >= fullScoreAtOrAbove ? maxPoints : 0;
  }
  if (input >= fullScoreAtOrAbove) {
    return maxPoints;
  }
  if (input <= zeroScoreAtOrBelow) {
    return 0;
  }
  const ratio = (input - zeroScoreAtOrBelow) / (fullScoreAtOrAbove - zeroScoreAtOrBelow);
  return clampScore(maxPoints * ratio, maxPoints);
}

function createInitialCanvasHitCounts() {
  return {
    missile: 0,
    hazardBar: 0,
    zoneFloor: 0
  };
}

function raidFrameClassColor(player) {
  const color = String(player?.classColor ?? "").trim();
  if (color) {
    return color;
  }
  if (String(player?.roleKey ?? "").trim().toLowerCase() === TANK_ROLE_META.key) {
    return TANK_CLASS_POOL[0]?.color ?? "#64748B";
  }
  return "#64748B";
}

function raidFrameFillPercent(player) {
  const ratio = Number(player?.hpRatio ?? 0);
  if (!Number.isFinite(ratio)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(ratio * 100)));
}

function getPlayerHpRatio(player) {
  if (!player) {
    return 0;
  }

  const snapshotRatio = Number(player.hpRatio);
  if (Number.isFinite(snapshotRatio)) {
    return Math.max(0, Math.min(1, snapshotRatio));
  }

  const hp = Number(player.hp ?? 0);
  const maxHp = Number(player.maxHp ?? 0);
  if (!Number.isFinite(hp) || !Number.isFinite(maxHp) || maxHp <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(1, hp / maxHp));
}

function findMyPlayerInSnapshot(snapshot, preferredPlayerId = "") {
  const players = Array.isArray(snapshot?.players) ? snapshot.players : [];
  if (!players.length) {
    return null;
  }

  if (preferredPlayerId) {
    const preferredPlayer = players.find((player) => player.id === preferredPlayerId);
    if (preferredPlayer) {
      return preferredPlayer;
    }
  }

  return players.find((player) => String(player?.name ?? "").trim() === MY_PLAYER_NAME) ?? null;
}

function formatSeconds(ms, decimals = 1) {
  if (!ms || ms <= 0) {
    return "0.0";
  }
  return (ms / 1000).toFixed(decimals);
}

function formatHealingAmount(value) {
  const amount = Math.max(0, Number(value) || 0);
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}m`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}k`;
  }
  return `${Math.round(amount)}`;
}

function resolveResponsiveYAxisMax(value) {
  const safeValue = Math.max(0, Number(value) || 0);
  if (safeValue <= 0) {
    return 1;
  }
  // Keep a small headroom above peak damage so the line does not stick to the ceiling.
  const paddedValue = safeValue * 1.08;
  if (paddedValue < 1_000) {
    return Math.max(1, Math.ceil(paddedValue));
  }
  if (paddedValue < 10_000) {
    return Math.ceil(paddedValue / 10) * 10;
  }
  if (paddedValue < 100_000) {
    return Math.ceil(paddedValue / 100) * 100;
  }
  return Math.ceil(paddedValue / 1_000) * 1_000;
}

function buildGraphTimeTicks(durationMs, desiredTickCount = 6) {
  const duration = Math.max(0, Number(durationMs) || 0);
  if (duration <= 0) {
    return [0];
  }
  const roughStepSec = Math.max(1, duration / 1000 / Math.max(1, desiredTickCount));
  const stepSec = Math.max(5, Math.round(roughStepSec / 5) * 5);
  const stepMs = stepSec * 1000;
  const ticks = [];
  for (let timeMs = 0; timeMs <= duration; timeMs += stepMs) {
    ticks.push(Math.max(0, Math.min(duration, timeMs)));
  }
  if (!ticks.length || ticks[ticks.length - 1] !== duration) {
    ticks.push(duration);
  }
  return ticks;
}

function colorStringToHexInt(value, fallback = 0xf58cba) {
  const source = String(value ?? "").trim();
  if (!source) {
    return fallback;
  }

  const normalized = source.startsWith("#") ? source.slice(1) : source;
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return fallback;
  }

  return Number.parseInt(normalized, 16);
}

function scrollElementIntoViewWithStickyTopOffset(element, behavior = "smooth") {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  const stickyHeader = document.querySelector("header.sticky.top-0");
  const stickyOffsetPx =
    stickyHeader instanceof HTMLElement ? Math.max(0, Math.ceil(stickyHeader.getBoundingClientRect().height + 8)) : 0;
  const top = Math.max(0, Math.round(window.scrollY + element.getBoundingClientRect().top - stickyOffsetPx));
  window.scrollTo({ top, behavior });
}

function refreshWowheadTooltips() {
  if (typeof window === "undefined") {
    return;
  }

  const stripInjectedTooltipIcons = () => {
    if (typeof document === "undefined") {
      return;
    }
    const links = document.querySelectorAll("a.wh-tooltip-only-link");
    links.forEach((node) => {
      if (!(node instanceof HTMLAnchorElement)) {
        return;
      }
      node.style.backgroundImage = "none";
      node.style.paddingLeft = "0px";
      node.classList.remove("iconsmall", "iconmedium", "icontiny");
      const injectedChildren = node.querySelectorAll(
        ":scope > .iconsmall, :scope > .iconmedium, :scope > .icontiny, :scope > span[class*='icon'], :scope > ins"
      );
      injectedChildren.forEach((child) => child.remove());
    });
  };

  if (window?.WH?.Tooltips?.refreshLinks) {
    window.WH.Tooltips.refreshLinks();
    stripInjectedTooltipIcons();
    window.requestAnimationFrame(stripInjectedTooltipIcons);
    window.setTimeout(stripInjectedTooltipIcons, 0);
    window.setTimeout(stripInjectedTooltipIcons, 50);
    return;
  }
  if (window?.$WowheadPower?.refreshLinks) {
    window.$WowheadPower.refreshLinks();
    stripInjectedTooltipIcons();
    window.requestAnimationFrame(stripInjectedTooltipIcons);
    window.setTimeout(stripInjectedTooltipIcons, 0);
    window.setTimeout(stripInjectedTooltipIcons, 50);
  }
}

function renderWowheadInlineTokenText(text, keyPrefix = "wowhead-inline") {
  const value = String(text ?? "");
  const tokenPattern = /\[\[([^[\]]+)\]\]/g;
  const chunks = [];
  let lastIndex = 0;
  let matchIndex = 0;
  let match = tokenPattern.exec(value);

  while (match) {
    const [rawTokenText, rawTokenBody] = match;
    const tokenStart = match.index ?? 0;
    if (tokenStart > lastIndex) {
      chunks.push(value.slice(lastIndex, tokenStart));
    }

    const tokenBody = String(rawTokenBody ?? "").trim();
    const tokenMatched = tokenBody.match(/^(.*)#(\d+)$/);
    const tokenLabel = String(tokenMatched?.[1] ?? tokenBody).trim();
    const spellId = String(tokenMatched?.[2] ?? "").trim();

    if (spellId) {
      chunks.push(
        <a
          className="rounded px-0.5 text-violet-200 underline decoration-violet-300/70 underline-offset-2 transition hover:text-violet-100"
          data-wh-icon-size="small"
          data-wh-rename-link="false"
          href={`https://www.wowhead.com/ko/spell=${spellId}`}
          key={`${keyPrefix}-${spellId}-${tokenStart}-${matchIndex}`}
          rel="noreferrer"
          target="_blank"
        >
          {tokenLabel}
        </a>
      );
    } else {
      chunks.push(tokenLabel);
    }

    lastIndex = tokenStart + rawTokenText.length;
    matchIndex += 1;
    match = tokenPattern.exec(value);
  }

  if (lastIndex < value.length) {
    chunks.push(value.slice(lastIndex));
  }

  return chunks.length ? chunks : value;
}

function getSelfBuffRemainingMs(snapshot, spellKey) {
  if (!snapshot?.buffs) {
    if (spellKey === "lifebloom") {
      const players = Array.isArray(snapshot?.players) ? snapshot.players : [];
      return players.reduce(
        (max, player) => Math.max(max, Math.max(0, Number(player?.lifebloomRemainingMs ?? 0))),
        0
      );
    }
    return 0;
  }
  if (spellKey === "avengingWrath") {
    return Math.max(0, Number(snapshot.buffs.avengingWrathMs ?? 0));
  }
  if (spellKey === "auraMastery") {
    return Math.max(0, Number(snapshot.buffs.auraMasteryMs ?? 0));
  }
  if (spellKey === "divineProtection") {
    return Math.max(0, Number(snapshot.buffs.divineProtectionMs ?? 0));
  }
  if (spellKey === "lifebloom") {
    const players = Array.isArray(snapshot?.players) ? snapshot.players : [];
    return players.reduce(
      (max, player) => Math.max(max, Math.max(0, Number(player?.lifebloomRemainingMs ?? 0))),
      0
    );
  }
  return 0;
}

function logColorClass(type) {
  switch (type) {
    case "heal":
      return "text-emerald-200";
    case "buff":
      return "text-violet-200";
    case "warn":
      return "text-amber-200";
    case "error":
      return "text-rose-200";
    case "success":
      return "text-emerald-300";
    default:
      return "text-slate-200";
  }
}

function keyboardBindingToRawToken(binding) {
  const modifier = normalizeModifier(binding?.modifier);
  const key = normalizeKey(binding?.key);
  if (!key || MODIFIER_ONLY_KEYS.has(key)) {
    return "";
  }
  return modifier ? `${modifier}+${key}` : key;
}

function keyboardBindingToToken(binding) {
  const token = keyboardBindingToRawToken(binding);
  if (!token || BLOCKED_KEYBOARD_BINDING_TOKENS.has(token)) {
    return "";
  }
  return token;
}

function buildDefaultKeyboardBindings(activeSpellKeys, defaultKeybinds) {
  const defaults = {};
  const keys = Array.isArray(activeSpellKeys) ? activeSpellKeys : [];
  for (const spellKey of keys) {
    defaults[spellKey] = {
      modifier: "",
      key: normalizeKey(defaultKeybinds?.[spellKey] ?? "")
    };
  }
  return defaults;
}

function buildDefaultClickCastBindings(clickCastableKeys, defaultClickCastPreferred) {
  const result = {};
  const usedTokens = new Set();
  const fallbackTokens = MOUSE_BINDING_OPTIONS.map((option) => option.token).filter(Boolean);

  const keys = Array.isArray(clickCastableKeys) ? clickCastableKeys : [];
  for (const spellKey of keys) {
    const hasPreferredToken = Object.prototype.hasOwnProperty.call(defaultClickCastPreferred ?? {}, spellKey);
    let token = hasPreferredToken ? String(defaultClickCastPreferred?.[spellKey] ?? "") : "";
    if (token && usedTokens.has(token)) {
      token = fallbackTokens.find((candidate) => !usedTokens.has(candidate)) ?? "";
    } else if (!hasPreferredToken) {
      token = fallbackTokens.find((candidate) => !usedTokens.has(candidate)) ?? "";
    }
    result[spellKey] = token;
    if (token) {
      usedTokens.add(token);
    }
  }

  return result;
}

function buildPersistableKeyboardBindings(keyboardBindings, activeSpellKeys) {
  const result = {};
  const keys = Array.isArray(activeSpellKeys) ? activeSpellKeys : [];
  for (const spellKey of keys) {
    result[spellKey] = {
      modifier: normalizeModifier(keyboardBindings?.[spellKey]?.modifier),
      key: normalizeKey(keyboardBindings?.[spellKey]?.key)
    };
  }
  return result;
}

function buildPersistableClickCastBindings(clickCastBindings, clickCastableKeys) {
  const result = {};
  const keys = Array.isArray(clickCastableKeys) ? clickCastableKeys : [];
  for (const spellKey of keys) {
    const rawToken = String(clickCastBindings?.[spellKey] ?? "");
    result[spellKey] = VALID_MOUSE_BINDING_TOKEN_SET.has(rawToken) ? rawToken : "";
  }
  return result;
}

function resolveStoredKeyboardBindings(rawBindings, activeSpellKeys, defaultKeybinds) {
  const resolved = buildDefaultKeyboardBindings(activeSpellKeys, defaultKeybinds);
  if (!rawBindings || typeof rawBindings !== "object") {
    return resolved;
  }

  const keys = Array.isArray(activeSpellKeys) ? activeSpellKeys : [];
  for (const spellKey of keys) {
    const rawBinding = rawBindings[spellKey];
    if (!rawBinding || typeof rawBinding !== "object") {
      continue;
    }
    resolved[spellKey] = {
      modifier: normalizeModifier(rawBinding.modifier),
      key: normalizeKey(rawBinding.key)
    };
  }
  return resolved;
}

function resolveStoredClickCastBindings(rawBindings, clickCastableKeys, defaultClickCastPreferred) {
  const resolved = buildDefaultClickCastBindings(clickCastableKeys, defaultClickCastPreferred);
  if (!rawBindings || typeof rawBindings !== "object") {
    return resolved;
  }

  const keys = Array.isArray(clickCastableKeys) ? clickCastableKeys : [];
  for (const spellKey of keys) {
    const rawToken = String(rawBindings[spellKey] ?? "");
    resolved[spellKey] = VALID_MOUSE_BINDING_TOKEN_SET.has(rawToken) ? rawToken : "";
  }
  return resolved;
}

function buildCooldownManagerSpellOrderBuckets(
  activeSpellKeys,
  preferredManagerSpellKeys = [],
  preferredSecondarySpellKeys = [],
  preferredReserveSpellKeys = []
) {
  const activeKeys = Array.isArray(activeSpellKeys) ? activeSpellKeys.filter(Boolean) : [];
  const activeSet = new Set(activeKeys);
  const used = new Set();
  const manager = [];
  const secondary = [];
  const reserve = [];

  const pushUnique = (target, spellKey) => {
    if (!spellKey || !activeSet.has(spellKey) || used.has(spellKey)) {
      return;
    }
    target.push(spellKey);
    used.add(spellKey);
  };

  for (const spellKey of Array.isArray(preferredManagerSpellKeys) ? preferredManagerSpellKeys : []) {
    pushUnique(manager, spellKey);
  }
  for (const spellKey of Array.isArray(preferredSecondarySpellKeys) ? preferredSecondarySpellKeys : []) {
    pushUnique(secondary, spellKey);
  }
  for (const spellKey of Array.isArray(preferredReserveSpellKeys) ? preferredReserveSpellKeys : []) {
    pushUnique(reserve, spellKey);
  }
  for (const spellKey of activeKeys) {
    pushUnique(reserve, spellKey);
  }

  return { manager, secondary, reserve };
}

function buildSpecialProcDisplayOrder(specialProcDisplayConfig = [], preferredOrderKeys = []) {
  const entries = Array.isArray(specialProcDisplayConfig) ? specialProcDisplayConfig : [];
  const availableKeys = entries.map((entry) => String(entry?.key ?? "").trim()).filter(Boolean);
  const availableSet = new Set(availableKeys);
  const used = new Set();
  const order = [];

  const pushUnique = (key) => {
    const normalizedKey = String(key ?? "").trim();
    if (!normalizedKey || !availableSet.has(normalizedKey) || used.has(normalizedKey)) {
      return;
    }
    used.add(normalizedKey);
    order.push(normalizedKey);
  };

  for (const key of Array.isArray(preferredOrderKeys) ? preferredOrderKeys : []) {
    pushUnique(key);
  }
  for (const key of availableKeys) {
    pushUnique(key);
  }

  return order;
}

function buildSpecialProcEnabledKeys(specialProcDisplayConfig = [], preferredEnabledKeys) {
  const entries = Array.isArray(specialProcDisplayConfig) ? specialProcDisplayConfig : [];
  const availableKeys = entries.map((entry) => String(entry?.key ?? "").trim()).filter(Boolean);
  const availableSet = new Set(availableKeys);
  const defaultEnabledKeys = entries
    .filter((entry) => entry?.defaultEnabledInSetup !== false)
    .map((entry) => String(entry?.key ?? "").trim())
    .filter(Boolean);

  const used = new Set();
  const enabled = [];
  const pushUnique = (key) => {
    const normalizedKey = String(key ?? "").trim();
    if (!normalizedKey || !availableSet.has(normalizedKey) || used.has(normalizedKey)) {
      return;
    }
    used.add(normalizedKey);
    enabled.push(normalizedKey);
  };

  const hasExplicitEnabledList = Array.isArray(preferredEnabledKeys);
  if (hasExplicitEnabledList) {
    for (const key of preferredEnabledKeys) {
      pushUnique(key);
    }
  } else {
    for (const key of defaultEnabledKeys) {
      pushUnique(key);
    }
  }

  return enabled;
}

function buildKeyboardTokenToSpellMap(
  keyboardBindings,
  disabledSpellSet,
  movementPreset,
  movementCustomKeys,
  activeSpellKeys
) {
  const map = {};
  const keys = Array.isArray(activeSpellKeys) ? activeSpellKeys : [];
  for (const spellKey of keys) {
    if (disabledSpellSet.has(spellKey)) {
      continue;
    }
    const binding = keyboardBindings[spellKey];
    if (isMovementRestrictedBinding(binding, movementPreset, movementCustomKeys)) {
      continue;
    }
    const token = keyboardBindingToToken(binding);
    if (!token || map[token]) {
      continue;
    }
    map[token] = spellKey;
  }
  return map;
}

function findDuplicateKeyboardBindings(keyboardBindings, disabledSpellSet, activeSpellKeys) {
  const countByToken = new Map();

  const keys = Array.isArray(activeSpellKeys) ? activeSpellKeys : [];
  for (const spellKey of keys) {
    if (disabledSpellSet.has(spellKey)) {
      continue;
    }
    const token = keyboardBindingToToken(keyboardBindings[spellKey]);
    if (!token) {
      continue;
    }
    countByToken.set(token, (countByToken.get(token) ?? 0) + 1);
  }

  return Array.from(countByToken.entries())
    .filter(([, count]) => count > 1)
    .map(([token]) => token);
}

function findBlockedKeyboardBindings(
  keyboardBindings,
  disabledSpellSet,
  movementPreset,
  movementCustomKeys,
  activeSpellKeys
) {
  const blocked = new Set();

  const keys = Array.isArray(activeSpellKeys) ? activeSpellKeys : [];
  for (const spellKey of keys) {
    if (disabledSpellSet.has(spellKey)) {
      continue;
    }

    const binding = keyboardBindings[spellKey];
    const key = normalizeKey(binding?.key);
    const token = keyboardBindingToRawToken(binding);
    if (token && BLOCKED_KEYBOARD_BINDING_TOKENS.has(token)) {
      blocked.add(token);
    }
    if (key && isMovementRestrictedBinding(binding, movementPreset, movementCustomKeys)) {
      blocked.add(token || key);
    }
  }

  return Array.from(blocked);
}

function findDuplicateMouseBindings(clickCastBindings, clickCastableKeys) {
  const countByToken = new Map();

  const keys = Array.isArray(clickCastableKeys) ? clickCastableKeys : [];
  for (const spellKey of keys) {
    const token = clickCastBindings[spellKey];
    if (!token) {
      continue;
    }
    countByToken.set(token, (countByToken.get(token) ?? 0) + 1);
  }

  return Array.from(countByToken.entries())
    .filter(([, count]) => count > 1)
    .map(([token]) => token);
}

function buildMouseTokenToSpellMap(clickCastBindings, clickCastableKeys) {
  const map = {};
  const keys = Array.isArray(clickCastableKeys) ? clickCastableKeys : [];
  for (const spellKey of keys) {
    const token = clickCastBindings[spellKey];
    if (!token || map[token]) {
      continue;
    }
    map[token] = spellKey;
  }
  return map;
}

function abbreviateModifierForCooldownLabel(value) {
  const normalized = String(value ?? "").trim().toUpperCase();
  if (normalized === "CTRL") {
    return "Ctl";
  }
  if (normalized === "ALT") {
    return "Alt";
  }
  if (normalized === "CMD" || normalized === "COMMAND") {
    return "Cmd";
  }
  if (normalized === "SHIFT") {
    return "Sh";
  }
  return value;
}

function formatCooldownBindingLabel(rawLabel) {
  const source = String(rawLabel ?? "").trim();
  if (!source || source === "-") {
    return source || "-";
  }

  const compact = source.replace(/\s*\+\s*/g, "+");
  const parts = compact.split("+").map((part) => part.trim()).filter(Boolean);
  if (!parts.length) {
    return source;
  }

  return parts
    .map((part) => abbreviateModifierForCooldownLabel(part))
    .join("+");
}

function buildEffectiveBindingLabels({
  useClickCasting,
  keyboardBindings,
  clickCastBindings,
  activeSpellKeys,
  clickCastableSet
}) {
  const labels = {};

  const keys = Array.isArray(activeSpellKeys) ? activeSpellKeys : [];
  for (const spellKey of keys) {
    const mouseToken = useClickCasting ? clickCastBindings[spellKey] : "";
    if (mouseToken && clickCastableSet?.has(spellKey)) {
      labels[spellKey] = formatCooldownBindingLabel(MOUSE_CDM_LABEL_BY_TOKEN[mouseToken] ?? mouseToken);
      continue;
    }
    labels[spellKey] = formatCooldownBindingLabel(keyboardBindingToToken(keyboardBindings[spellKey]) || "-");
  }

  return labels;
}

function getEventModifierList(event) {
  const modifiers = [];
  if (event.ctrlKey) {
    modifiers.push("CTRL");
  }
  if (event.altKey) {
    modifiers.push("ALT");
  }
  if (event.shiftKey) {
    modifiers.push("SHIFT");
  }
  if (event.metaKey) {
    modifiers.push("CMD");
  }
  return modifiers;
}

function codeToFallbackKey(code) {
  const normalized = String(code ?? "");
  if (!normalized) {
    return "";
  }

  if (/^Key[A-Z]$/.test(normalized)) {
    return normalized.slice(3);
  }
  if (/^Digit[0-9]$/.test(normalized)) {
    return normalized.slice(5);
  }
  if (/^Numpad[0-9]$/.test(normalized)) {
    return normalized.slice(6);
  }
  if (/^F\\d{1,2}$/.test(normalized)) {
    return normalized;
  }

  const codeAliases = {
    Space: "SPACE",
    Tab: "TAB",
    Enter: "ENTER",
    Escape: "ESC",
    ArrowUp: "ARROWUP",
    ArrowDown: "ARROWDOWN",
    ArrowLeft: "ARROWLEFT",
    ArrowRight: "ARROWRIGHT",
    Minus: "-",
    Equal: "=",
    BracketLeft: "[",
    BracketRight: "]",
    Semicolon: ";",
    Quote: "'",
    Backslash: "\\\\",
    Comma: ",",
    Period: ".",
    Slash: "/",
    Backquote: "`"
  };

  return codeAliases[normalized] ?? "";
}

function keyboardEventToResolvedKeys(event) {
  const keys = [];

  const keyFromCode = codeToFallbackKey(event.code);
  if (keyFromCode) {
    keys.push(keyFromCode);
  }

  const normalizedEventKey = normalizeKey(event.key);
  if (normalizedEventKey && normalizedEventKey !== "PROCESS" && normalizedEventKey !== "UNIDENTIFIED") {
    keys.push(normalizedEventKey);
  }

  return Array.from(new Set(keys.filter((key) => key && !MODIFIER_ONLY_KEYS.has(key))));
}

function keyboardEventToBindingTokens(event) {
  const modifiers = getEventModifierList(event);
  if (modifiers.length > 1) {
    return [];
  }

  const keys = keyboardEventToResolvedKeys(event);
  if (!keys.length) {
    return [];
  }

  const tokens = [];
  for (const key of keys) {
    const token = modifiers.length ? `${modifiers[0]}+${key}` : key;
    if (!BLOCKED_KEYBOARD_BINDING_TOKENS.has(token)) {
      tokens.push(token);
    }
  }
  return Array.from(new Set(tokens));
}

function mouseEventToBindingToken(event) {
  if (event.metaKey) {
    return "";
  }

  const modifiers = getEventModifierList(event);
  if (modifiers.length > 1) {
    return "";
  }

  let base = "";
  const isWheelEvent = event?.type === "wheel" || typeof event?.deltaY === "number";
  if (isWheelEvent) {
    if (event.deltaY < 0) {
      base = "WHEELUP";
    } else if (event.deltaY > 0) {
      base = "WHEELDOWN";
    }
  } else if (event.button === 0) {
    base = "LMB";
  } else if (event.button === 1) {
    base = "MMB";
  } else if (event.button === 2) {
    base = "RMB";
  } else if (event.button === 3) {
    base = "MB4";
  } else if (event.button === 4) {
    base = "MB5";
  }

  if (!base) {
    return "";
  }

  if (base === "MMB") {
    return modifiers.length ? "" : "MMB";
  }

  return modifiers.length ? `${modifiers[0]}+${base}` : base;
}

const DIFFICULTY_KEY_DISPLAY_ORDER = Object.freeze(["normal", "heroic", "mythic", "worldFirstKill"]);
const FALLBACK_PRACTICE_DIFFICULTY_CONFIG = Object.freeze({
  label: "일반",
  fixedCombatDurationMinutes: 2,
  incomingDamageMultiplier: 1,
  damageBreakEveryMs: 0,
  damageBreakDurationMs: 0,
  scheduledRaidBursts: Object.freeze([])
});
const DEFAULT_PRACTICE_DIFFICULTY_TUNING = Object.freeze({
  normal: FALLBACK_PRACTICE_DIFFICULTY_CONFIG
});

function normalizePracticeDifficultyTuning(difficultyTuning) {
  if (!difficultyTuning || typeof difficultyTuning !== "object") {
    return DEFAULT_PRACTICE_DIFFICULTY_TUNING;
  }
  const keys = Object.keys(difficultyTuning);
  if (!keys.length) {
    return DEFAULT_PRACTICE_DIFFICULTY_TUNING;
  }
  return difficultyTuning;
}

function resolveDifficultyConfigByKey(difficultyTuning, difficultyKey) {
  const tuning = normalizePracticeDifficultyTuning(difficultyTuning);
  const requestedKey = String(difficultyKey ?? "").trim();
  const requested = tuning[requestedKey];
  const fallback = tuning.normal ?? tuning[Object.keys(tuning)[0]] ?? FALLBACK_PRACTICE_DIFFICULTY_CONFIG;
  return requested ?? fallback;
}

function resolveCombatDurationMinutesByDifficulty(difficultyKey, difficultyTuning) {
  const difficultyConfig = resolveDifficultyConfigByKey(difficultyTuning, difficultyKey);
  const configuredMinutes = Number(difficultyConfig?.fixedCombatDurationMinutes ?? 2);
  if (!Number.isFinite(configuredMinutes)) {
    return 2;
  }
  return Math.max(0.5, configuredMinutes);
}

function buildDifficultyOptionsFromTuning(difficultyTuning) {
  const tuning = normalizePracticeDifficultyTuning(difficultyTuning);
  const keySet = new Set(Object.keys(tuning));
  const orderedKeys = [];
  for (const key of DIFFICULTY_KEY_DISPLAY_ORDER) {
    if (keySet.has(key)) {
      orderedKeys.push(key);
      keySet.delete(key);
    }
  }
  for (const key of keySet) {
    orderedKeys.push(key);
  }
  return orderedKeys.map((key) => {
    const config = resolveDifficultyConfigByKey(tuning, key);
    const rawLabel = String(config?.label ?? key).trim();
    const label = rawLabel || key;
    const durationMinutes = resolveCombatDurationMinutesByDifficulty(key, tuning);
    return {
      value: key,
      label: `${label} (${durationMinutes}분)`
    };
  });
}

function toPercentNumber(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return Math.max(0, Math.min(100, Number(fallback) || 0));
  }
  return Math.max(0, Math.min(100, parsed));
}

function normalizeMovementPreset(value) {
  const key = String(value || "").toUpperCase();
  return MOVEMENT_PRESET_KEYS[key] ? key : "WASD";
}

function buildDefaultCustomMovementKeys() {
  const fallback = MOVEMENT_PRESET_KEYS.WASD ?? { up: "W", down: "S", left: "A", right: "D" };
  return {
    up: normalizeKey(fallback.up ?? "W") || "W",
    down: normalizeKey(fallback.down ?? "S") || "S",
    left: normalizeKey(fallback.left ?? "A") || "A",
    right: normalizeKey(fallback.right ?? "D") || "D"
  };
}

function normalizeMovementCustomKeys(value) {
  const fallback = buildDefaultCustomMovementKeys();
  if (!value || typeof value !== "object") {
    return fallback;
  }

  return {
    up: normalizeKey(value.up) || fallback.up,
    down: normalizeKey(value.down) || fallback.down,
    left: normalizeKey(value.left) || fallback.left,
    right: normalizeKey(value.right) || fallback.right
  };
}

function resolveMovementKeys(movementPreset, movementCustomKeys) {
  const preset = normalizeMovementPreset(movementPreset);
  if (preset === "CUSTOM") {
    return normalizeMovementCustomKeys(movementCustomKeys);
  }
  const fallback = buildDefaultCustomMovementKeys();
  const resolved = MOVEMENT_PRESET_KEYS[preset] ?? MOVEMENT_PRESET_KEYS.WASD ?? fallback;
  return {
    up: normalizeKey(resolved.up) || fallback.up,
    down: normalizeKey(resolved.down) || fallback.down,
    left: normalizeKey(resolved.left) || fallback.left,
    right: normalizeKey(resolved.right) || fallback.right
  };
}

function resolveMovementRestrictedKeys(movementPreset, movementCustomKeys) {
  const preset = normalizeMovementPreset(movementPreset);
  if (preset === "CUSTOM") {
    const keys = resolveMovementKeys("CUSTOM", movementCustomKeys);
    return Array.from(new Set([keys.up, keys.down, keys.left, keys.right].filter(Boolean)));
  }
  const restricted = MOVEMENT_RESTRICTED_KEY_LIST_BY_PRESET[preset];
  if (Array.isArray(restricted)) {
    return restricted;
  }
  return [];
}

function normalizeMyRaidFramePositionMode(value) {
  const source = String(value ?? "").trim();
  return source === "firstSlotFixed" ? "firstSlotFixed" : "random";
}

function isMovementRestrictedKey(key, movementPreset, movementCustomKeys) {
  const normalizedKey = normalizeKey(key);
  if (!normalizedKey) {
    return false;
  }
  const restricted = resolveMovementRestrictedKeys(movementPreset, movementCustomKeys);
  return restricted.includes(normalizedKey);
}

function isMovementRestrictedBinding(binding, movementPreset, movementCustomKeys) {
  if (!binding || typeof binding !== "object") {
    return false;
  }
  const modifier = normalizeModifier(binding.modifier);
  if (modifier) {
    return false;
  }
  return isMovementRestrictedKey(binding.key, movementPreset, movementCustomKeys);
}

function raidLayoutColumnCount(layout) {
  return layout === "4x5" ? 5 : 4;
}

function raidFrameIndexFromPosition(layout, row, column) {
  const safeRow = Math.max(1, Math.floor(Number(row) || 1));
  const safeColumn = Math.max(1, Math.floor(Number(column) || 1));
  return (safeRow - 1) * raidLayoutColumnCount(layout) + (safeColumn - 1);
}

function ensureRosterIncludesNames(roster, requiredNames, seed = Date.now()) {
  const names = Array.isArray(requiredNames) ? requiredNames.filter(Boolean) : [];
  if (!names.length) {
    return Array.isArray(roster) ? roster.map((player) => ({ ...player })) : [];
  }

  const result = Array.isArray(roster) ? roster.map((player) => ({ ...player })) : [];
  const requiredSet = new Set(names);
  const rng = createSeededRng((Number(seed) || Date.now()) ^ 0x27d4eb2d);
  const presentNames = new Set(
    result
      .map((player) => String(player?.name ?? "").trim())
      .filter(Boolean)
  );
  const replaceableIndexes = result
    .map((player, index) => ({
      index,
      name: String(player?.name ?? "").trim()
    }))
    .filter(({ name }) => name && !requiredSet.has(name))
    .map(({ index }) => index);

  for (let index = replaceableIndexes.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(rng() * (index + 1));
    [replaceableIndexes[index], replaceableIndexes[nextIndex]] = [replaceableIndexes[nextIndex], replaceableIndexes[index]];
  }

  let replaceCursor = 0;
  for (const requiredName of names) {
    if (presentNames.has(requiredName)) {
      continue;
    }
    const replaceIndex = replaceableIndexes[replaceCursor];
    if (replaceIndex == null) {
      break;
    }
    replaceCursor += 1;

    const previousName = String(result[replaceIndex]?.name ?? "").trim();
    if (previousName) {
      presentNames.delete(previousName);
    }

    result[replaceIndex] = {
      ...result[replaceIndex],
      name: requiredName
    };
    presentNames.add(requiredName);
  }

  return result;
}

function applyFixedTankRoleMetaToRoster(roster, seed = Date.now()) {
  const rng = createSeededRng(seed ^ 0x85ebca6b);
  const pickTankClass = () => {
    if (!TANK_CLASS_POOL.length) {
      return { key: "tank", name: "탱커", color: "#64748B" };
    }
    const index = Math.floor(rng() * TANK_CLASS_POOL.length);
    return TANK_CLASS_POOL[index] ?? TANK_CLASS_POOL[0];
  };

  return roster.map((player) => {
    const name = String(player?.name ?? "").trim();
    if (!FIXED_TANK_NAME_SET.has(name)) {
      return player;
    }
    const pickedTankClass = pickTankClass();
    return {
      ...player,
      classKey: pickedTankClass.key,
      className: pickedTankClass.name,
      classColor: pickedTankClass.color,
      roleKey: TANK_ROLE_META.key,
      roleName: TANK_ROLE_META.name,
      roleIconUrl: TANK_ROLE_META.iconUrl
    };
  });
}

function applyMyPlayerMetaToRoster(roster, healerMeta = null) {
  const healerColor = String(healerMeta?.color ?? "#F58CBA");
  const healerName = String(healerMeta?.name ?? healerMeta?.shortName ?? "힐러");
  const healerKey = String(healerMeta?.slug ?? "healer");

  return roster.map((player) => {
    const name = String(player?.name ?? "").trim();
    if (name !== MY_PLAYER_NAME) {
      return player;
    }

    return {
      ...player,
      classKey: healerKey,
      className: healerName,
      classColor: healerColor,
      roleKey: "healer",
      roleName: "힐러",
      roleIconUrl: ""
    };
  });
}

function moveNamedPlayerToRaidFramePosition(ordered, layout, name, row, column) {
  const sourceIndex = ordered.findIndex((player) => String(player?.name ?? "").trim() === name);
  if (sourceIndex < 0) {
    return;
  }

  const targetIndex = raidFrameIndexFromPosition(layout, row, column);
  if (targetIndex < 0 || targetIndex >= ordered.length || targetIndex === sourceIndex) {
    return;
  }

  [ordered[targetIndex], ordered[sourceIndex]] = [ordered[sourceIndex], ordered[targetIndex]];
}

function buildRaidFrameOrderedPlayers(players, layout, myRaidFramePositionMode = "random") {
  const ordered = Array.isArray(players) ? [...players] : [];
  const mode = normalizeMyRaidFramePositionMode(myRaidFramePositionMode);

  if (mode === "firstSlotFixed") {
    moveNamedPlayerToRaidFramePosition(ordered, layout, MY_PLAYER_NAME, 1, 1);

    const primaryTankAnchor =
      FIXED_TANK_ANCHORS.find((anchor) => Number(anchor?.row) === 1 && Number(anchor?.column) === 1) ??
      FIXED_TANK_ANCHORS[0];
    if (primaryTankAnchor?.name) {
      moveNamedPlayerToRaidFramePosition(ordered, layout, primaryTankAnchor.name, 2, 1);
    }

    for (const anchor of FIXED_TANK_ANCHORS) {
      if (!anchor?.name || anchor.name === primaryTankAnchor?.name) {
        continue;
      }
      moveNamedPlayerToRaidFramePosition(ordered, layout, anchor.name, anchor.row, anchor.column);
    }
    return ordered;
  }

  for (const anchor of FIXED_TANK_ANCHORS) {
    moveNamedPlayerToRaidFramePosition(ordered, layout, anchor.name, anchor.row, anchor.column);
  }

  return ordered;
}

function areAllFixedTanksDead(players) {
  const tankPlayers = Array.isArray(players)
    ? players.filter((player) => String(player?.roleKey ?? "").trim().toLowerCase() === TANK_ROLE_META.key)
    : [];
  return tankPlayers.length >= 2 && tankPlayers.every((player) => !player.alive);
}

function mapGameOverFeedbackReason(reason, deathThreshold = 10) {
  const text = String(reason ?? "").trim();
  if (!text) {
    return "";
  }
  if (text.includes("탱커")) {
    return "탱 사망";
  }
  if (text.includes("나 사망") || text.includes("캐릭터 사망")) {
    return "본인 사망";
  }
  if (text.includes("사망자") || text.includes("전원 사망")) {
    return `공대 ${Math.max(1, Number(deathThreshold) || 10)}인 사망`;
  }
  return text;
}

function isDesktopEnvironmentSupported() {
  if (typeof window === "undefined") {
    return true;
  }

  const minViewportWidthPx = Math.max(
    0,
    Number(HEALER_PRACTICE_DESKTOP_ONLY_CONFIG?.minViewportWidthPx ?? 0)
  );
  const requireFinePointer = Boolean(HEALER_PRACTICE_DESKTOP_ONLY_CONFIG?.requireFinePointer);
  const viewportWidth = Math.max(
    0,
    Number(window.innerWidth ?? document?.documentElement?.clientWidth ?? 0)
  );
  const widthOk = viewportWidth >= minViewportWidthPx;
  const pointerOk = !requireFinePointer || window.matchMedia("(pointer: fine)").matches;
  return widthOk && pointerOk;
}

function buildConfiguredRoster(seed = Date.now(), healerMeta = null) {
  const roster = buildRandomRaidRoster(CANDIDATE_NAME_POOL, MIN_RAID_SIZE, seed);
  const rosterWithFixedNames = ensureRosterIncludesNames(
    roster,
    [...FIXED_TANK_ANCHORS.map((anchor) => anchor.name), MY_PLAYER_NAME],
    seed
  );
  const classAssignedRoster = assignRandomClassesToRoster(rosterWithFixedNames, seed ^ 0x9e3779b9);
  const tankAssignedRoster = applyFixedTankRoleMetaToRoster(classAssignedRoster, seed);
  return applyMyPlayerMetaToRoster(tankAssignedRoster, healerMeta);
}

function buildInitialRoster() {
  return [];
}

const DEATH_GAMEOVER_THRESHOLD = Math.max(1, Number(GLOBAL_GAMEOVER_DEATH_THRESHOLD ?? 10));
const BOSS_DAMAGE_GRAPH_BUCKET_MS = 1000;
const BOSS_DAMAGE_GRAPH_VIEWBOX_WIDTH = 760;
const BOSS_DAMAGE_GRAPH_VIEWBOX_HEIGHT = 200;
const BOSS_DAMAGE_GRAPH_PADDING = Object.freeze({
  left: 46,
  right: 12,
  top: 10,
  bottom: 28
});
// Triage thresholds are intentionally code-driven (not user-configurable in UI).
const FIXED_TRIAGE_HEALTH_THRESHOLD_PCT = 30;
const FIXED_TRIAGE_MIN_EFFECTIVE_HEAL_PCT = 10;
const DEFAULT_PRACTICE_RUNTIME = resolveHealerPracticeRuntime(DEFAULT_IMPLEMENTED_HEALER_SLUG);
const DEFAULT_COOLDOWN_SPELL_ORDER_BUCKETS = buildCooldownManagerSpellOrderBuckets(
  DEFAULT_PRACTICE_RUNTIME.activeSpellKeys,
  DEFAULT_PRACTICE_RUNTIME.cooldownManagerSpellKeys,
  DEFAULT_PRACTICE_RUNTIME.cooldownManagerSecondarySpellKeys,
  DEFAULT_PRACTICE_RUNTIME.cooldownManagerNonDisplaySpellKeys
);
const DEFAULT_SPECIAL_PROC_ORDER_KEYS = buildSpecialProcDisplayOrder(
  DEFAULT_PRACTICE_RUNTIME.specialProcDisplayConfig,
  []
);
const DEFAULT_SPECIAL_PROC_ENABLED_KEYS = buildSpecialProcEnabledKeys(
  DEFAULT_PRACTICE_RUNTIME.specialProcDisplayConfig
);

export function HealerPracticeSimulator({ onCombatRunningChange } = {}) {
  const { user, userLabel, internalUserId, isLoggedIn, firebaseEnabled: authFirebaseEnabled } = useAuthSession();
  const [selectedHealerSlug, setSelectedHealerSlug] = useState(DEFAULT_IMPLEMENTED_HEALER_SLUG);
  const [hasExplicitHealerSelection, setHasExplicitHealerSelection] = useState(false);
  const [difficultyKey, setDifficultyKey] = useState("normal");
  const [selectedMapKey, setSelectedMapKey] = useState(DEFAULT_PRACTICE_MAP_KEY);
  const [movementKeyPreset, setMovementKeyPreset] = useState("WASD");
  const [customMovementKeys, setCustomMovementKeys] = useState(() => buildDefaultCustomMovementKeys());
  const [useMouseover, setUseMouseover] = useState(true);
  const [useClickCasting, setUseClickCasting] = useState(false);
  const [showHolyPriestEchoOnRaidFrames, setShowHolyPriestEchoOnRaidFrames] = useState(false);
  const [raidFrameLayout, setRaidFrameLayout] = useState("4x5");
  const [myRaidFramePositionMode, setMyRaidFramePositionMode] = useState("random");
  const [keyboardBindings, setKeyboardBindings] = useState(() =>
    buildDefaultKeyboardBindings(DEFAULT_PRACTICE_RUNTIME.activeSpellKeys, DEFAULT_PRACTICE_RUNTIME.defaultKeybinds)
  );
  const [clickCastBindings, setClickCastBindings] = useState(() =>
    buildDefaultClickCastBindings(
      DEFAULT_PRACTICE_RUNTIME.clickCastableKeys,
      DEFAULT_PRACTICE_RUNTIME.defaultClickCastPreferred
    )
  );

  const [draftRoster, setDraftRoster] = useState(() => buildInitialRoster());
  const [setupSeed, setSetupSeed] = useState(null);
  const [setupConfirmed, setSetupConfirmed] = useState(false);
  const [cooldownSpellOrder, setCooldownSpellOrder] = useState(() => [
    ...DEFAULT_COOLDOWN_SPELL_ORDER_BUCKETS.manager
  ]);
  const [cooldownSecondarySpellOrder, setCooldownSecondarySpellOrder] = useState(() => [
    ...DEFAULT_COOLDOWN_SPELL_ORDER_BUCKETS.secondary
  ]);
  const [cooldownReserveSpellOrder, setCooldownReserveSpellOrder] = useState(() => [
    ...DEFAULT_COOLDOWN_SPELL_ORDER_BUCKETS.reserve
  ]);
  const [specialProcOrderKeys, setSpecialProcOrderKeys] = useState(() => [...DEFAULT_SPECIAL_PROC_ORDER_KEYS]);
  const [specialProcEnabledKeys, setSpecialProcEnabledKeys] = useState(() => [...DEFAULT_SPECIAL_PROC_ENABLED_KEYS]);

  const [running, setRunning] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [hoveredTargetId, setHoveredTargetId] = useState("");
  const [statusText, setStatusText] = useState("");
  const [inCombatView, setInCombatView] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const [keybindProfileSyncBusy, setKeybindProfileSyncBusy] = useState(false);
  const [cloudProfileStatusText, setCloudProfileStatusText] = useState("");
  const [cloudProfileStatusTone, setCloudProfileStatusTone] = useState("info");
  const [rankingModalOpen, setRankingModalOpen] = useState(false);
  const [patchNotesModalOpen, setPatchNotesModalOpen] = useState(false);
  const [rankingViewMapKey, setRankingViewMapKey] = useState(DEFAULT_PRACTICE_MAP_KEY);
  const [rankingViewDifficultyKey, setRankingViewDifficultyKey] = useState("heroic");
  const [rankingViewPatchVersion, setRankingViewPatchVersion] = useState(() =>
    normalizeRankingPatchVersion(HEALER_PRACTICE_RANKING_PATCH_CONFIG?.currentPatchVersion, "12.0.1")
  );
  const [rankingViewHealerSlug, setRankingViewHealerSlug] = useState(HOLY_PALADIN_HEALER_SLUG);
  const [rankingRows, setRankingRows] = useState([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [rankingErrorText, setRankingErrorText] = useState("");
  const [rankingSaveStatus, setRankingSaveStatus] = useState("idle");
  const [isDesktopEnvironment, setIsDesktopEnvironment] = useState(() => isDesktopEnvironmentSupported());
  const [canvasRawDamageTaken, setCanvasRawDamageTaken] = useState(0);
  const [canvasHitCounts, setCanvasHitCounts] = useState(() => createInitialCanvasHitCounts());
  const [expandedHealMeterSpellKeys, setExpandedHealMeterSpellKeys] = useState(() => new Set());
  const [cooldownManagerPrimaryIconSizeSettingPx, setCooldownManagerPrimaryIconSizeSettingPx] = useState(
    DEFAULT_COOLDOWN_MANAGER_PRIMARY_ICON_SIZE_PX
  );
  const [cooldownManagerSecondaryIconSizeSettingPx, setCooldownManagerSecondaryIconSizeSettingPx] = useState(
    DEFAULT_COOLDOWN_MANAGER_SECONDARY_ICON_SIZE_PX
  );
  const [specialProcOverlayIconSizePx, setSpecialProcOverlayIconSizePx] = useState(
    DEFAULT_SPECIAL_PROC_ICON_SIZE_PX
  );
  const [cooldownResourceBarLayout, setCooldownResourceBarLayout] = useState(() =>
    normalizeCooldownResourceBarLayout(DEFAULT_COOLDOWN_RESOURCE_BAR_LAYOUT)
  );
  const [combatCooldownManagerReservedHeightPx, setCombatCooldownManagerReservedHeightPx] = useState(() =>
    Math.max(0, Number(RAID_FRAME_VISUAL_CONFIG.topOverlayReservedHeightPx ?? 114))
  );

  const [sessionConfig, setSessionConfig] = useState(null);

  useEffect(() => {
    if (typeof onCombatRunningChange !== "function") {
      return undefined;
    }
    onCombatRunningChange(Boolean(running));
    return () => {
      onCombatRunningChange(false);
    };
  }, [onCombatRunningChange, running]);

  const engineRef = useRef(null);
  const rafRef = useRef(0);
  const lastFrameRef = useRef(0);
  const simAccumulatorRef = useRef(0);
  const uiAccumulatorRef = useRef(0);

  const selectedTargetRef = useRef("");
  const hoveredTargetRef = useRef("");
  const latestSnapshotRef = useRef(null);
  const sessionConfigRef = useRef(null);
  const pointerInRaidFramesRef = useRef(false);
  const pointerInPhaserCanvasRef = useRef(false);
  const runningRef = useRef(false);
  const gameOverReasonRef = useRef("");
  const draggedCooldownSpellRef = useRef({ spellKey: "", groupKey: "manager" });
  const combatViewRef = useRef(null);
  const combatCooldownManagerRef = useRef(null);
  const phaserHostRef = useRef(null);
  const phaserGameRef = useRef(null);
  const selfPlayerIdRef = useRef("");
  const phaserSelfHpRatioRef = useRef(1);
  const canvasRawDamageTakenRef = useRef(0);
  const canvasHitCountsRef = useRef(createInitialCanvasHitCounts());
  const cooldownSpellOrderRef = useRef([...DEFAULT_COOLDOWN_SPELL_ORDER_BUCKETS.manager]);
  const cooldownSecondarySpellOrderRef = useRef([...DEFAULT_COOLDOWN_SPELL_ORDER_BUCKETS.secondary]);
  const cooldownReserveSpellOrderRef = useRef([...DEFAULT_COOLDOWN_SPELL_ORDER_BUCKETS.reserve]);
  const specialProcOrderKeysRef = useRef([...DEFAULT_SPECIAL_PROC_ORDER_KEYS]);
  const specialProcEnabledKeysRef = useRef([...DEFAULT_SPECIAL_PROC_ENABLED_KEYS]);
  const cooldownResourceBarLayoutRef = useRef(
    normalizeCooldownResourceBarLayout(DEFAULT_COOLDOWN_RESOURCE_BAR_LAYOUT)
  );
  const movementStateRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false
  });
  const keybindProfileRequestSeqRef = useRef(0);
  const rankingSavedRunKeyRef = useRef("");
  const rankingSaveAttemptedRunKeyRef = useRef("");

  const selectedPracticeRuntime = useMemo(
    () => resolveHealerPracticeRuntime(selectedHealerSlug),
    [selectedHealerSlug]
  );
  const selectedDifficultyTuning = selectedPracticeRuntime.difficultyTuning ?? DEFAULT_PRACTICE_DIFFICULTY_TUNING;
  const selectedDifficultyOptions = useMemo(
    () => buildDifficultyOptionsFromTuning(selectedDifficultyTuning),
    [selectedDifficultyTuning]
  );
  useEffect(() => {
    if (!selectedDifficultyOptions.length) {
      return;
    }
    if (selectedDifficultyOptions.some((option) => option.value === difficultyKey)) {
      return;
    }
    setDifficultyKey(selectedDifficultyOptions[0].value);
  }, [difficultyKey, selectedDifficultyOptions]);
  const activeSpellKeys = selectedPracticeRuntime.activeSpellKeys;
  const clickCastableKeys = selectedPracticeRuntime.clickCastableKeys;
  const clickCastableSet = useMemo(() => new Set(clickCastableKeys), [clickCastableKeys]);
  const practiceSpellsByKey = selectedPracticeRuntime.practiceSpells;
  const practiceSpellIconsByKey = selectedPracticeRuntime.spellIconUrlByKey;
  const practiceCooldownSpellMetaByKey = selectedPracticeRuntime.cooldownManagerSpellMeta;
  const healMeterSpellMetaByKey = selectedPracticeRuntime.healMeterSpellMeta;
  const normalizedCooldownOrders = useMemo(
    () =>
      buildCooldownManagerSpellOrderBuckets(
        activeSpellKeys,
        cooldownSpellOrder,
        cooldownSecondarySpellOrder,
        cooldownReserveSpellOrder
      ),
    [activeSpellKeys, cooldownSpellOrder, cooldownSecondarySpellOrder, cooldownReserveSpellOrder]
  );
  const managerCooldownSpellOrder = normalizedCooldownOrders.manager;
  const secondaryCooldownSpellOrder = normalizedCooldownOrders.secondary;
  const reserveCooldownSpellOrder = normalizedCooldownOrders.reserve;
  const cooldownManagerPrimaryIconSizePx = Math.max(
    MIN_COOLDOWN_MANAGER_PRIMARY_ICON_SIZE_PX,
    Math.min(
      MAX_COOLDOWN_MANAGER_PRIMARY_ICON_SIZE_PX,
      Math.round(
        Number(
          cooldownManagerPrimaryIconSizeSettingPx ??
          DEFAULT_COOLDOWN_MANAGER_PRIMARY_ICON_SIZE_PX
        )
      )
    )
  );
  const cooldownManagerSecondaryIconSizePx = Math.max(
    MIN_COOLDOWN_MANAGER_SECONDARY_ICON_SIZE_PX,
    Math.min(
      MAX_COOLDOWN_MANAGER_SECONDARY_ICON_SIZE_PX,
      Math.round(
        Number(
          cooldownManagerSecondaryIconSizeSettingPx ??
          DEFAULT_COOLDOWN_MANAGER_SECONDARY_ICON_SIZE_PX
        )
      )
    )
  );
  const maxSpecialProcOverlayIconSizePx = DEFAULT_SPECIAL_PROC_ICON_SIZE_PX + MAX_SPECIAL_PROC_ICON_SIZE_BONUS_PX;
  const configuredSpecialProcOverlayIconSizePx = Math.max(
    DEFAULT_SPECIAL_PROC_ICON_SIZE_PX,
    Math.min(maxSpecialProcOverlayIconSizePx, Number(specialProcOverlayIconSizePx ?? DEFAULT_SPECIAL_PROC_ICON_SIZE_PX))
  );
  const normalizedCooldownResourceBarLayout = useMemo(
    () => normalizeCooldownResourceBarLayout(cooldownResourceBarLayout),
    [cooldownResourceBarLayout]
  );

  const activeSpells = useMemo(
    () => activeSpellKeys.map((spellKey) => practiceSpellsByKey[spellKey]).filter(Boolean),
    [activeSpellKeys, practiceSpellsByKey]
  );
  const setupSpecialProcDisplayConfig = useMemo(() => {
    const source = Array.isArray(selectedPracticeRuntime.specialProcDisplayConfig)
      ? selectedPracticeRuntime.specialProcDisplayConfig
      : [];
    const order = buildSpecialProcDisplayOrder(source, specialProcOrderKeys);
    const entryByKey = new Map();
    source.forEach((entry) => {
      const key = String(entry?.key ?? "").trim();
      if (!key || entryByKey.has(key)) {
        return;
      }
      entryByKey.set(key, entry);
    });
    return order.map((key) => entryByKey.get(key)).filter(Boolean);
  }, [selectedPracticeRuntime.specialProcDisplayConfig, specialProcOrderKeys]);
  const normalizedSetupSpecialProcEnabledKeys = useMemo(
    () => buildSpecialProcEnabledKeys(selectedPracticeRuntime.specialProcDisplayConfig, specialProcEnabledKeys),
    [selectedPracticeRuntime.specialProcDisplayConfig, specialProcEnabledKeys]
  );
  const setupSpecialProcEnabledKeySet = useMemo(
    () => new Set(normalizedSetupSpecialProcEnabledKeys),
    [normalizedSetupSpecialProcEnabledKeys]
  );
  const setupSpecialProcDisplayEntries = useMemo(() => {
    return setupSpecialProcDisplayConfig
      .map((entry, index) => {
        const procKey = String(entry?.key ?? "").trim();
        const label = String(entry?.label ?? "").trim() || procKey || "버프";
        const configuredSpellIdRaw = Number(entry?.spellId);
        const fallbackSpellIdRaw = Number(practiceCooldownSpellMetaByKey?.[procKey]?.spellId);
        const spellId = Number.isFinite(configuredSpellIdRaw) && configuredSpellIdRaw > 0
          ? Math.floor(configuredSpellIdRaw)
          : Number.isFinite(fallbackSpellIdRaw) && fallbackSpellIdRaw > 0
            ? Math.floor(fallbackSpellIdRaw)
            : null;

        return {
          id: `${procKey || "proc"}-${index}`,
          key: procKey || `proc-${index}`,
          label,
          iconUrl:
            String(entry?.iconUrl ?? "").trim() ||
            (procKey ? practiceSpellIconsByKey[procKey] : "") ||
            DEFAULT_SPELL_ICON_URL,
          spellId
        };
      })
      .filter(Boolean);
  }, [practiceCooldownSpellMetaByKey, practiceSpellIconsByKey, setupSpecialProcDisplayConfig]);
  const setupSpecialProcEnabledEntries = useMemo(
    () => setupSpecialProcDisplayEntries.filter((entry) => setupSpecialProcEnabledKeySet.has(entry.key)),
    [setupSpecialProcDisplayEntries, setupSpecialProcEnabledKeySet]
  );
  const setupSpecialProcDisabledEntries = useMemo(
    () => setupSpecialProcDisplayEntries.filter((entry) => !setupSpecialProcEnabledKeySet.has(entry.key)),
    [setupSpecialProcDisplayEntries, setupSpecialProcEnabledKeySet]
  );
  const setupSpecialProcEnabledPaneWidthPx = useMemo(() => {
    const iconCount = Math.max(1, setupSpecialProcEnabledEntries.length);
    const iconGapPx = 6;
    const paneHorizontalPaddingPx = 16;
    const paneBorderAllowancePx = 4;
    return Math.round(
      iconCount * configuredSpecialProcOverlayIconSizePx +
      Math.max(0, iconCount - 1) * iconGapPx +
      paneHorizontalPaddingPx +
      paneBorderAllowancePx
    );
  }, [configuredSpecialProcOverlayIconSizePx, setupSpecialProcEnabledEntries.length]);
  const setupSpecialProcDisabledPaneWidthPx = useMemo(() => {
    if (setupSpecialProcDisabledEntries.length <= 0) {
      return 112;
    }
    const iconCount = Math.max(1, setupSpecialProcDisabledEntries.length);
    const iconGapPx = 6;
    const paneHorizontalPaddingPx = 16;
    const paneBorderAllowancePx = 4;
    return Math.round(
      iconCount * configuredSpecialProcOverlayIconSizePx +
      Math.max(0, iconCount - 1) * iconGapPx +
      paneHorizontalPaddingPx +
      paneBorderAllowancePx
    );
  }, [configuredSpecialProcOverlayIconSizePx, setupSpecialProcDisabledEntries.length]);
  const setupSpecialProcSectionWidthPx = useMemo(() => {
    const paneGapPx = 8;
    const sectionHorizontalPaddingPx = 24;
    const sectionBorderAllowancePx = 4;
    return Math.round(
      Math.max(
        300,
        setupSpecialProcEnabledPaneWidthPx +
        setupSpecialProcDisabledPaneWidthPx +
        paneGapPx +
        sectionHorizontalPaddingPx +
        sectionBorderAllowancePx
      )
    );
  }, [setupSpecialProcDisabledPaneWidthPx, setupSpecialProcEnabledPaneWidthPx]);

  const disabledKeyboardSpellSet = useMemo(() => {
    const result = new Set();
    if (!useClickCasting) {
      return result;
    }
    for (const spellKey of clickCastableKeys) {
      if (clickCastBindings[spellKey]) {
        result.add(spellKey);
      }
    }
    return result;
  }, [useClickCasting, clickCastBindings, clickCastableKeys]);

  const duplicateKeyboardBindings = useMemo(
    () => findDuplicateKeyboardBindings(keyboardBindings, disabledKeyboardSpellSet, activeSpellKeys),
    [keyboardBindings, disabledKeyboardSpellSet, activeSpellKeys]
  );

  const blockedKeyboardBindings = useMemo(
    () =>
      findBlockedKeyboardBindings(
        keyboardBindings,
        disabledKeyboardSpellSet,
        movementKeyPreset,
        customMovementKeys,
        activeSpellKeys
      ),
    [keyboardBindings, disabledKeyboardSpellSet, movementKeyPreset, customMovementKeys, activeSpellKeys]
  );

  const duplicateMouseBindings = useMemo(
    () => (useClickCasting ? findDuplicateMouseBindings(clickCastBindings, clickCastableKeys) : []),
    [useClickCasting, clickCastBindings, clickCastableKeys]
  );

  const effectiveBindingLabels = useMemo(
    () =>
      buildEffectiveBindingLabels({
        useClickCasting,
        keyboardBindings,
        clickCastBindings,
        activeSpellKeys,
        clickCastableSet
      }),
    [useClickCasting, keyboardBindings, clickCastBindings, activeSpellKeys, clickCastableSet]
  );

  const selectedHealerIsImplemented = IMPLEMENTED_HEALER_SLUGS.has(selectedHealerSlug);
  const selectedHealerIsHolyPaladin = selectedHealerSlug === HOLY_PALADIN_HEALER_SLUG;
  const selectedHealerIsHolyPriest = selectedHealerSlug === HOLY_PRIEST_HEALER_SLUG;
  const selectedHealerSupportsCooldownResourceOrder = selectedHealerIsHolyPaladin || selectedHealerIsHolyPriest;
  const setupVisibleCooldownResourceSectionKeys = useMemo(() => {
    if (selectedHealerIsHolyPaladin) {
      return ["spells", "holyPower", "mana", "castBar"];
    }
    if (selectedHealerIsHolyPriest) {
      return ["spells", "mana", "castBar"];
    }
    return [];
  }, [selectedHealerIsHolyPaladin, selectedHealerIsHolyPriest]);
  const setupVisibleCooldownResourceSectionOrder = useMemo(
    () => resolveVisibleCooldownResourceSectionOrder(normalizedCooldownResourceBarLayout.sectionOrder, setupVisibleCooldownResourceSectionKeys),
    [normalizedCooldownResourceBarLayout.sectionOrder, setupVisibleCooldownResourceSectionKeys]
  );
  const selectedHealerMeta = useMemo(
    () => healers.find((healer) => healer.slug === selectedHealerSlug) ?? null,
    [selectedHealerSlug]
  );
  const selectedHealerDisclaimers = useMemo(() => {
    if (!hasExplicitHealerSelection || !selectedHealerMeta) {
      return [];
    }

    const source =
      HEALER_PRACTICE_DISCLAIMER_BY_HEALER[selectedHealerSlug] ??
      HEALER_PRACTICE_DISCLAIMER_BY_HEALER.default ??
      [];
    if (!Array.isArray(source)) {
      return [];
    }

    return source
      .map((line) => String(line ?? "").trim())
      .filter(Boolean);
  }, [hasExplicitHealerSelection, selectedHealerMeta, selectedHealerSlug]);
  const selectedHealerPatchMeta = useMemo(() => {
    if (!hasExplicitHealerSelection || !selectedHealerMeta) {
      return null;
    }

    const source =
      HEALER_PRACTICE_PATCH_META_BY_HEALER[selectedHealerSlug] ??
      HEALER_PRACTICE_PATCH_META_BY_HEALER.default ??
      null;
    if (!source || typeof source !== "object") {
      return null;
    }

    const lastUpdatedAt = String(source.lastUpdatedAt ?? "").trim();
    const patchVersion = String(source.patchVersion ?? "").trim();
    if (!lastUpdatedAt && !patchVersion) {
      return null;
    }

    return {
      lastUpdatedAt,
      patchVersion
    };
  }, [hasExplicitHealerSelection, selectedHealerMeta, selectedHealerSlug]);
  const selectedHealerColorHex = useMemo(
    () => colorStringToHexInt(selectedHealerMeta?.color, 0xf58cba),
    [selectedHealerMeta]
  );
  const showPreCombatSetupSections = hasExplicitHealerSelection;
  const canUseCloudKeybindProfile =
    Boolean(authFirebaseEnabled) &&
    Boolean(db) &&
    Boolean(user?.uid) &&
    selectedHealerIsImplemented &&
    showPreCombatSetupSections;
  const canStartSimulation =
    selectedHealerIsImplemented &&
    setupConfirmed &&
    draftRoster.length === MIN_RAID_SIZE &&
    duplicateKeyboardBindings.length === 0 &&
    blockedKeyboardBindings.length === 0 &&
    duplicateMouseBindings.length === 0;
  const canSaveRankingForCurrentDifficulty = RANKING_ENABLED_DIFFICULTY_KEYS.has(
    String(sessionConfig?.difficultyKey ?? difficultyKey)
  );

  function resolveMapLabel(mapKey) {
    const normalizedKey = String(mapKey ?? "").trim();
    const option = HEALER_PRACTICE_MAP_OPTIONS.find((entry) => entry.value === normalizedKey);
    return option?.label ?? (normalizedKey || DEFAULT_PRACTICE_MAP_KEY);
  }

  function resolveRankingEntriesCollection(
    mapKey,
    difficulty,
    patchVersion = rankingCurrentPatchVersion,
    healerSlug = HOLY_PALADIN_HEALER_SLUG
  ) {
    if (!db) {
      return null;
    }
    const normalizedMapKey = String(mapKey ?? "").trim() || DEFAULT_PRACTICE_MAP_KEY;
    const normalizedDifficulty = String(difficulty ?? "").trim() || "normal";
    const normalizedPatchVersion = normalizeRankingPatchVersion(patchVersion, rankingCurrentPatchVersion);
    const normalizedHealerSlug = String(healerSlug ?? "").trim() || HOLY_PALADIN_HEALER_SLUG;
    return db
      .collection(HEALER_PRACTICE_RANKING_COLLECTION)
      .doc(normalizedMapKey)
      .collection("difficulties")
      .doc(normalizedDifficulty)
      .collection("patches")
      .doc(normalizedPatchVersion)
      .collection("healers")
      .doc(normalizedHealerSlug)
      .collection("entries");
  }

  function handleOpenRankingModal() {
    const normalizedActiveDifficulty = String(activeDifficultyKey ?? "normal");
    const initialRankingDifficulty = RANKING_ENABLED_DIFFICULTY_KEYS.has(normalizedActiveDifficulty)
      ? normalizedActiveDifficulty
      : "heroic";
    const initialRankingHealerSlug = String(activeCombatHealerSlug ?? selectedHealerSlug ?? HOLY_PALADIN_HEALER_SLUG).trim();
    const initialRankingHealerEnabled = healers.some(
      (healer) => healer.slug === initialRankingHealerSlug && healer.enabled !== false
    );
    const firstEnabledHealerSlug =
      healers.find((healer) => healer.enabled !== false)?.slug ?? HOLY_PALADIN_HEALER_SLUG;
    setRankingViewMapKey(String(activeMapKey ?? DEFAULT_PRACTICE_MAP_KEY));
    setRankingViewDifficultyKey(initialRankingDifficulty);
    setRankingViewPatchVersion(rankingCurrentPatchVersion);
    setRankingViewHealerSlug(
      initialRankingHealerEnabled ? initialRankingHealerSlug || HOLY_PALADIN_HEALER_SLUG : firstEnabledHealerSlug
    );
    setRankingModalOpen(true);
  }

  useEffect(() => {
    selectedTargetRef.current = selectedTargetId;
  }, [selectedTargetId]);

  useEffect(() => {
    hoveredTargetRef.current = hoveredTargetId;
  }, [hoveredTargetId]);

  useEffect(() => {
    latestSnapshotRef.current = snapshot;
  }, [snapshot]);

  useEffect(() => {
    sessionConfigRef.current = sessionConfig;
  }, [sessionConfig]);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    cooldownSpellOrderRef.current = managerCooldownSpellOrder;
  }, [managerCooldownSpellOrder]);

  useEffect(() => {
    cooldownSecondarySpellOrderRef.current = secondaryCooldownSpellOrder;
  }, [secondaryCooldownSpellOrder]);

  useEffect(() => {
    cooldownReserveSpellOrderRef.current = reserveCooldownSpellOrder;
  }, [reserveCooldownSpellOrder]);

  useEffect(() => {
    specialProcOrderKeysRef.current = specialProcOrderKeys;
  }, [specialProcOrderKeys]);

  useEffect(() => {
    specialProcEnabledKeysRef.current = specialProcEnabledKeys;
  }, [specialProcEnabledKeys]);

  useEffect(() => {
    cooldownResourceBarLayoutRef.current = normalizedCooldownResourceBarLayout;
  }, [normalizedCooldownResourceBarLayout]);

  useEffect(() => {
    const defaultReservedHeightPx = Math.max(0, Number(RAID_FRAME_VISUAL_CONFIG.topOverlayReservedHeightPx ?? 114));
    if (!inCombatView) {
      setCombatCooldownManagerReservedHeightPx(defaultReservedHeightPx);
      return undefined;
    }
    const node = combatCooldownManagerRef.current;
    if (!(node instanceof HTMLElement)) {
      return undefined;
    }
    if (typeof window === "undefined") {
      return undefined;
    }

    const measure = () => {
      const measuredHeightPx = Math.max(0, Math.ceil(node.getBoundingClientRect().height));
      const nextHeightPx = measuredHeightPx > 0 ? measuredHeightPx : defaultReservedHeightPx;
      setCombatCooldownManagerReservedHeightPx(nextHeightPx);
    };

    measure();
    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        measure();
      });
      resizeObserver.observe(node);
    }
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [
    inCombatView,
    managerCooldownSpellOrder.length,
    secondaryCooldownSpellOrder.length,
    configuredSpecialProcOverlayIconSizePx,
    cooldownManagerPrimaryIconSizePx,
    cooldownManagerSecondaryIconSizePx
  ]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleEnvironmentChange = () => {
      setIsDesktopEnvironment(isDesktopEnvironmentSupported());
    };

    const pointerFineMediaQuery = window.matchMedia("(pointer: fine)");
    handleEnvironmentChange();
    window.addEventListener("resize", handleEnvironmentChange);
    if (pointerFineMediaQuery?.addEventListener) {
      pointerFineMediaQuery.addEventListener("change", handleEnvironmentChange);
    } else if (pointerFineMediaQuery?.addListener) {
      pointerFineMediaQuery.addListener(handleEnvironmentChange);
    }

    return () => {
      window.removeEventListener("resize", handleEnvironmentChange);
      if (pointerFineMediaQuery?.removeEventListener) {
        pointerFineMediaQuery.removeEventListener("change", handleEnvironmentChange);
      } else if (pointerFineMediaQuery?.removeListener) {
        pointerFineMediaQuery.removeListener(handleEnvironmentChange);
      }
    };
  }, []);

  useEffect(() => {
    if (!setupConfirmed) {
      return;
    }
    refreshWowheadTooltips();
  }, [
    setupConfirmed,
    managerCooldownSpellOrder,
    secondaryCooldownSpellOrder,
    reserveCooldownSpellOrder,
    setupSpecialProcDisplayEntries.length,
    specialProcOrderKeys,
    specialProcEnabledKeys
  ]);

  useEffect(() => {
    if (inCombatView) {
      return;
    }
    refreshWowheadTooltips();
  }, [
    inCombatView,
    useClickCasting,
    showPreCombatSetupSections,
    selectedHealerSlug,
    selectedHealerDisclaimers.length,
    activeSpells.length,
    setupSpecialProcDisplayEntries.length,
    specialProcOrderKeys,
    specialProcEnabledKeys
  ]);

  useEffect(
    () => () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    },
    []
  );

  function stopLoopOnly() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    lastFrameRef.current = 0;
    simAccumulatorRef.current = 0;
    uiAccumulatorRef.current = 0;
  }

  function clearGameOverState() {
    gameOverReasonRef.current = "";
    setGameOverReason("");
  }

  function triggerGameOver(reason, snapshotOverride = null) {
    if (gameOverReasonRef.current) {
      return;
    }

    const finalReason = String(reason || "전투 실패");
    gameOverReasonRef.current = finalReason;
    setGameOverReason(finalReason);
    setStatusText(`GAME OVER: ${finalReason}`);

    const engine = engineRef.current;
    let finalSnapshot = snapshotOverride;
    if (engine) {
      if (!engine.finished) {
        engine.finish("game-over");
      }
      finalSnapshot = engine.getSnapshot();
    }

    stopLoopOnly();
    setRunning(false);
    runningRef.current = false;
    if (finalSnapshot) {
      setSnapshot(finalSnapshot);
      latestSnapshotRef.current = finalSnapshot;
    }
  }

  function handleRestartPractice() {
    stopLoopOnly();
    engineRef.current = null;
    setRunning(false);
    runningRef.current = false;
    setSnapshot(null);
    latestSnapshotRef.current = null;
    setSessionConfig(null);
    sessionConfigRef.current = null;
    setSelectedTargetId("");
    selectedTargetRef.current = "";
    setHoveredTargetId("");
    hoveredTargetRef.current = "";
    pointerInRaidFramesRef.current = false;
    pointerInPhaserCanvasRef.current = false;
    selfPlayerIdRef.current = "";
    phaserSelfHpRatioRef.current = 1;
    canvasRawDamageTakenRef.current = 0;
    setCanvasRawDamageTaken(0);
    canvasHitCountsRef.current = createInitialCanvasHitCounts();
    setCanvasHitCounts(createInitialCanvasHitCounts());
    setDraftRoster(buildInitialRoster());
    setSetupSeed(null);
    setSetupConfirmed(false);
    setInCombatView(false);
    setRankingModalOpen(false);
    setRankingSaveStatus("idle");
    rankingSavedRunKeyRef.current = "";
    rankingSaveAttemptedRunKeyRef.current = "";
    clearGameOverState();
    setStatusText("");
  }

  function markSetupDirty() {
    if (!running) {
      setSetupSeed(null);
      setSetupConfirmed(false);
    }
  }

  function resolveKeyboardTarget(config) {
    const currentSnapshot = latestSnapshotRef.current;
    if (!currentSnapshot) {
      return null;
    }

    const findAlive = (targetId) => currentSnapshot.players.find((player) => player.id === targetId && player.alive);

    if (config.useMouseover) {
      const hovered = hoveredTargetRef.current;
      if (hovered && findAlive(hovered)) {
        return hovered;
      }
    }

    const selected = selectedTargetRef.current;
    if (selected && findAlive(selected)) {
      return selected;
    }

    return currentSnapshot.players.find((player) => player.alive)?.id ?? null;
  }

  function queueSpell(spellKey, targetId = null) {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }
    engine.queueAction({
      type: "cast",
      spellKey,
      targetId
    });
  }

  function forceCanvasSelfDeathFromRaidFrame() {
    phaserSelfHpRatioRef.current = 0;

    const phaserGame = phaserGameRef.current;
    if (!phaserGame?.scene?.getScenes) {
      return;
    }
    const activeScene = phaserGame.scene.getScenes(true)?.[0];
    if (activeScene?.events?.emit) {
      activeScene.events.emit("force-self-death");
    }
  }

  function startSimulationLoop() {
    const loop = (timestamp) => {
      const engine = engineRef.current;
      if (!engine) {
        return;
      }

      if (!lastFrameRef.current) {
        lastFrameRef.current = timestamp;
      }

      let delta = timestamp - lastFrameRef.current;
      if (delta > 120) {
        delta = 120;
      }
      lastFrameRef.current = timestamp;

      simAccumulatorRef.current += delta;
      uiAccumulatorRef.current += delta;

      while (simAccumulatorRef.current >= ENGINE_STEP_MS) {
        const movementState = movementStateRef.current;
        const isPlayerMoving = Boolean(
          movementState.up || movementState.down || movementState.left || movementState.right
        );
        if (selfPlayerIdRef.current) {
          engine.setExternalPlayerHpRatio(selfPlayerIdRef.current, phaserSelfHpRatioRef.current);
        }
        engine.step(ENGINE_STEP_MS, { isPlayerMoving });
        simAccumulatorRef.current -= ENGINE_STEP_MS;
      }

      const latest = engine.getSnapshot();
      latestSnapshotRef.current = latest;
      const myPlayerInSnapshot = findMyPlayerInSnapshot(latest, selfPlayerIdRef.current);
      if (myPlayerInSnapshot?.id) {
        selfPlayerIdRef.current = myPlayerInSnapshot.id;
      }
      if (myPlayerInSnapshot) {
        phaserSelfHpRatioRef.current = getPlayerHpRatio(myPlayerInSnapshot);
        if (!myPlayerInSnapshot.alive) {
          // 안전 동기화: 레이드 프레임에서 죽으면 캔버스 캐릭터도 즉시 0%로 맞춥니다.
          forceCanvasSelfDeathFromRaidFrame();
        }
      }

      if (GLOBAL_GAMEOVER_ON_SELF_DEATH && myPlayerInSnapshot && !myPlayerInSnapshot.alive) {
        triggerGameOver("나 사망", latest);
        return;
      }

      if (areAllFixedTanksDead(latest.players)) {
        triggerGameOver("탱커 전멸", latest);
        return;
      }

      if (Number(latest.metrics?.deaths ?? 0) >= DEATH_GAMEOVER_THRESHOLD) {
        triggerGameOver(`사망자 ${DEATH_GAMEOVER_THRESHOLD}명`, latest);
        return;
      }

      if (uiAccumulatorRef.current >= UI_STEP_MS || latest.finished) {
        setSnapshot(latest);
        uiAccumulatorRef.current = 0;
      }

      if (latest.finished) {
        const allRaidDead = latest.players.every((player) => !player.alive);
        if (allRaidDead) {
          triggerGameOver("전원 사망", latest);
          return;
        }
        stopLoopOnly();
        setRunning(false);
        const successByNoGameOver =
          GLOBAL_SUCCESS_ON_TIMEOUT_WITHOUT_GAMEOVER && isTimeoutFinishedSnapshot(latest) && !gameOverReasonRef.current;
        setStatusText(successByNoGameOver ? GLOBAL_SUCCESS_MESSAGE_TEXT : `연습 종료: 사망 ${latest.metrics.deaths}명`);
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  }

  function handleConfirmSetup() {
    if (running) {
      return;
    }
    if (!selectedHealerIsImplemented) {
      setStatusText("선택한 힐러 연습기는 아직 준비중입니다.");
      return;
    }
    if (duplicateKeyboardBindings.length || blockedKeyboardBindings.length || duplicateMouseBindings.length) {
      setStatusText("설정 완료 전에 단축키/클릭캐스팅 중복 또는 금지 조합을 해결하세요.");
      return;
    }

    const seed = Date.now();
    const roster = buildConfiguredRoster(seed, selectedHealerMeta);

    stopLoopOnly();
    engineRef.current = null;
    setRunning(false);
    runningRef.current = false;
    setSnapshot(null);
    latestSnapshotRef.current = null;
    setSessionConfig(null);
    sessionConfigRef.current = null;
    setSelectedTargetId("");
    selectedTargetRef.current = "";
    setHoveredTargetId("");
    hoveredTargetRef.current = "";
    setInCombatView(false);
    clearGameOverState();
    selfPlayerIdRef.current = "";
    phaserSelfHpRatioRef.current = 1;

    setDraftRoster(roster);
    setSetupSeed(seed);
    setSetupConfirmed(true);
    setStatusText(`${CANDIDATE_NAME_POOL.length}명 후보 중 랜덤 20인 로스터 생성 완료`);
  }

  function handleCooldownSpellDragStart(event, spellKey, groupKey = "manager") {
    const normalizedGroupKey =
      groupKey === "reserve" ? "reserve" : groupKey === "secondary" ? "secondary" : "manager";
    draggedCooldownSpellRef.current = {
      spellKey,
      groupKey: normalizedGroupKey
    };
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", spellKey);
      event.dataTransfer.setData(
        "application/x-healer-cooldown-spell",
        JSON.stringify(draggedCooldownSpellRef.current)
      );
    }
  }

  function handleCooldownSpellDragOver(event) {
    event.preventDefault();
  }

  function resolveDraggedCooldownSpellPayload(event) {
    const refPayload = draggedCooldownSpellRef.current;
    if (refPayload?.spellKey) {
      return refPayload;
    }

    const serialized = event.dataTransfer?.getData("application/x-healer-cooldown-spell") || "";
    if (serialized) {
      try {
        const parsed = JSON.parse(serialized);
        if (parsed?.spellKey) {
          return {
            spellKey: String(parsed.spellKey),
            groupKey:
              String(parsed.groupKey) === "reserve"
                ? "reserve"
                : String(parsed.groupKey) === "secondary"
                  ? "secondary"
                  : "manager"
          };
        }
      } catch {
        // noop
      }
    }

    const fallbackSpellKey = event.dataTransfer?.getData("text/plain") || "";
    if (!fallbackSpellKey) {
      return { spellKey: "", groupKey: "manager" };
    }
    return { spellKey: String(fallbackSpellKey), groupKey: "manager" };
  }

  function applyCooldownSpellOrders(nextManagerOrder, nextSecondaryOrder, nextReserveOrder) {
    const normalized = buildCooldownManagerSpellOrderBuckets(
      activeSpellKeys,
      nextManagerOrder,
      nextSecondaryOrder,
      nextReserveOrder
    );
    cooldownSpellOrderRef.current = normalized.manager;
    cooldownSecondarySpellOrderRef.current = normalized.secondary;
    cooldownReserveSpellOrderRef.current = normalized.reserve;
    setCooldownSpellOrder(normalized.manager);
    setCooldownSecondarySpellOrder(normalized.secondary);
    setCooldownReserveSpellOrder(normalized.reserve);
  }

  function handleCooldownSpellDrop(event, targetGroupKey = "manager", targetSpellKey = "") {
    event.preventDefault();
    event.stopPropagation();

    const payload = resolveDraggedCooldownSpellPayload(event);
    const sourceSpellKey = String(payload.spellKey ?? "");
    const targetGroup =
      targetGroupKey === "reserve" ? "reserve" : targetGroupKey === "secondary" ? "secondary" : "manager";
    if (!sourceSpellKey) {
      return;
    }

    const managerOrder = [...(cooldownSpellOrderRef.current ?? [])];
    const secondaryOrder = [...(cooldownSecondarySpellOrderRef.current ?? [])];
    const reserveOrder = [...(cooldownReserveSpellOrderRef.current ?? [])];
    const removeFrom = (list) => list.filter((key) => key !== sourceSpellKey);
    const nextManagerOrder = removeFrom(managerOrder);
    const nextSecondaryOrder = removeFrom(secondaryOrder);
    const nextReserveOrder = removeFrom(reserveOrder);
    const targetList =
      targetGroup === "reserve"
        ? nextReserveOrder
        : targetGroup === "secondary"
          ? nextSecondaryOrder
          : nextManagerOrder;
    if (targetSpellKey && sourceSpellKey === targetSpellKey) {
      return;
    }

    if (!targetSpellKey || !targetList.includes(targetSpellKey)) {
      targetList.push(sourceSpellKey);
      applyCooldownSpellOrders(nextManagerOrder, nextSecondaryOrder, nextReserveOrder);
      return;
    }

    const targetIndex = targetList.indexOf(targetSpellKey);
    targetList.splice(targetIndex, 0, sourceSpellKey);
    applyCooldownSpellOrders(nextManagerOrder, nextSecondaryOrder, nextReserveOrder);
  }

  function handleCooldownSpellDragEnd() {
    draggedCooldownSpellRef.current = { spellKey: "", groupKey: "manager" };
  }

  function applySpecialProcOrder(nextOrderKeys) {
    const normalized = buildSpecialProcDisplayOrder(
      selectedPracticeRuntime.specialProcDisplayConfig,
      Array.isArray(nextOrderKeys) ? nextOrderKeys : []
    );
    specialProcOrderKeysRef.current = normalized;
    setSpecialProcOrderKeys(normalized);
  }

  function applySpecialProcEnabled(nextEnabledKeys) {
    const preferredEnabledKeys = Array.isArray(nextEnabledKeys)
      ? nextEnabledKeys
      : specialProcEnabledKeysRef.current;
    const normalized = buildSpecialProcEnabledKeys(
      selectedPracticeRuntime.specialProcDisplayConfig,
      preferredEnabledKeys
    );
    specialProcEnabledKeysRef.current = normalized;
    setSpecialProcEnabledKeys(normalized);
  }

  function shiftSpecialProcOrder(procKey, direction = 0) {
    const key = String(procKey ?? "").trim();
    if (!key) {
      return;
    }
    const move = Number(direction);
    if (!Number.isFinite(move) || move === 0) {
      return;
    }

    const allOrderedKeys = buildSpecialProcDisplayOrder(
      selectedPracticeRuntime.specialProcDisplayConfig,
      specialProcOrderKeysRef.current
    );
    const enabledKeySet = new Set(
      buildSpecialProcEnabledKeys(
        selectedPracticeRuntime.specialProcDisplayConfig,
        specialProcEnabledKeysRef.current
      )
    );
    const enabledOrderedKeys = allOrderedKeys.filter((entryKey) => enabledKeySet.has(entryKey));
    const index = enabledOrderedKeys.indexOf(key);
    if (index < 0) {
      return;
    }
    const targetIndex = index + (move > 0 ? 1 : -1);
    if (targetIndex < 0 || targetIndex >= enabledOrderedKeys.length) {
      return;
    }

    [enabledOrderedKeys[index], enabledOrderedKeys[targetIndex]] = [
      enabledOrderedKeys[targetIndex],
      enabledOrderedKeys[index]
    ];
    let enabledCursor = 0;
    const nextAllOrderedKeys = allOrderedKeys.map((entryKey) => {
      if (!enabledKeySet.has(entryKey)) {
        return entryKey;
      }
      const nextKey = enabledOrderedKeys[enabledCursor];
      enabledCursor += 1;
      return nextKey;
    });
    applySpecialProcOrder(nextAllOrderedKeys);
  }

  function setSpecialProcEnabledState(procKey, nextEnabled) {
    const key = String(procKey ?? "").trim();
    if (!key) {
      return;
    }
    const allOrderedKeys = buildSpecialProcDisplayOrder(
      selectedPracticeRuntime.specialProcDisplayConfig,
      specialProcOrderKeysRef.current
    );
    if (!allOrderedKeys.includes(key)) {
      return;
    }
    const enabledSet = new Set(
      buildSpecialProcEnabledKeys(
        selectedPracticeRuntime.specialProcDisplayConfig,
        specialProcEnabledKeysRef.current
      )
    );
    const currentlyEnabledOrderedKeys = allOrderedKeys.filter((entryKey) => enabledSet.has(entryKey));
    const currentlyDisabledOrderedKeys = allOrderedKeys.filter((entryKey) => !enabledSet.has(entryKey));

    let nextEnabledOrderedKeys = currentlyEnabledOrderedKeys;
    let nextDisabledOrderedKeys = currentlyDisabledOrderedKeys;
    if (nextEnabled) {
      if (enabledSet.has(key)) {
        return;
      }
      nextEnabledOrderedKeys = [...currentlyEnabledOrderedKeys, key];
      nextDisabledOrderedKeys = currentlyDisabledOrderedKeys.filter((entryKey) => entryKey !== key);
    } else {
      if (!enabledSet.has(key)) {
        return;
      }
      nextEnabledOrderedKeys = currentlyEnabledOrderedKeys.filter((entryKey) => entryKey !== key);
      nextDisabledOrderedKeys = [...currentlyDisabledOrderedKeys, key];
    }

    applySpecialProcOrder([...nextEnabledOrderedKeys, ...nextDisabledOrderedKeys]);
    applySpecialProcEnabled(nextEnabledOrderedKeys);
  }

  function moveCooldownResourceSection(sectionKey, direction, visibleSectionKeys = null) {
    const key = String(sectionKey ?? "").trim();
    if (!key) {
      return;
    }
    const delta = Number(direction);
    if (!Number.isFinite(delta) || delta === 0) {
      return;
    }
    setCooldownResourceBarLayout((prev) => {
      const normalized = normalizeCooldownResourceBarLayout(prev);
      const allOrder = normalizeCooldownResourceSectionOrder(normalized.sectionOrder);
      const hasVisibleFilter = Array.isArray(visibleSectionKeys) && visibleSectionKeys.length > 0;
      const visibleOrder = hasVisibleFilter
        ? resolveVisibleCooldownResourceSectionOrder(allOrder, visibleSectionKeys)
        : [...allOrder];
      const visibleKeySet = new Set(visibleOrder);
      const index = visibleOrder.indexOf(key);
      if (index < 0) {
        return normalized;
      }
      const targetIndex = index + (delta > 0 ? 1 : -1);
      if (targetIndex < 0 || targetIndex >= visibleOrder.length) {
        return normalized;
      }
      [visibleOrder[index], visibleOrder[targetIndex]] = [visibleOrder[targetIndex], visibleOrder[index]];
      const hiddenOrder = allOrder.filter((entryKey) => !visibleKeySet.has(entryKey));
      return {
        ...normalized,
        sectionOrder: [...visibleOrder, ...hiddenOrder]
      };
    });
  }

  function adjustCooldownResourceBarWidth(barKey, delta) {
    const key = barKey === "mana" ? "mana" : "holyPower";
    const widthDelta = Math.round(Number(delta) || 0);
    if (!widthDelta) {
      return;
    }
    setCooldownResourceBarLayout((prev) => {
      const normalized = normalizeCooldownResourceBarLayout(prev);
      if (key === "mana") {
        return {
          ...normalized,
          manaWidthBonusPx: clampCooldownResourceBarWidthBonusValue(
            Number(normalized.manaWidthBonusPx ?? 0) + widthDelta
          )
        };
      }
      return {
        ...normalized,
        holyPowerWidthBonusPx: clampCooldownResourceBarWidthBonusValue(
          Number(normalized.holyPowerWidthBonusPx ?? 0) + widthDelta
        )
      };
    });
  }

  function resolveKeybindProfileDocRef() {
    const uid = String(user?.uid ?? "").trim();
    if (!uid || !db) {
      return null;
    }
    return db
      .collection("users")
      .doc(uid)
      .collection(HEALER_PRACTICE_KEYBIND_PROFILE_SUBCOLLECTION)
      .doc(selectedHealerSlug);
  }

  async function loadCloudKeybindProfile(options = {}) {
    const silent = Boolean(options?.silent);
    if (!canUseCloudKeybindProfile) {
      if (!silent) {
        setStatusText("로그인 후에 직업별 세팅 불러오기를 사용할 수 있습니다.");
        setCloudProfileStatusTone("error");
        setCloudProfileStatusText("로그인 후에 내 세팅 불러오기를 사용할 수 있습니다.");
      }
      return false;
    }
    const docRef = resolveKeybindProfileDocRef();
    if (!docRef) {
      if (!silent) {
        setStatusText("세팅 저장소에 접근할 수 없습니다.");
        setCloudProfileStatusTone("error");
        setCloudProfileStatusText("세팅 저장소에 접근할 수 없습니다.");
      }
      return false;
    }

    const requestSeq = keybindProfileRequestSeqRef.current + 1;
    keybindProfileRequestSeqRef.current = requestSeq;
    setKeybindProfileSyncBusy(true);

    try {
      const snapshot = await docRef.get();
      if (requestSeq !== keybindProfileRequestSeqRef.current) {
        return false;
      }
      if (!snapshot.exists) {
        if (!silent) {
          setStatusText("저장된 세팅이 없습니다.");
          setCloudProfileStatusTone("info");
          setCloudProfileStatusText("저장된 내 세팅이 없습니다.");
        }
        return false;
      }

      const data = snapshot.data() ?? {};
      setKeyboardBindings(
        resolveStoredKeyboardBindings(
          data.keyboardBindings,
          activeSpellKeys,
          selectedPracticeRuntime.defaultKeybinds
        )
      );
      setClickCastBindings(
        resolveStoredClickCastBindings(
          data.clickCastBindings,
          clickCastableKeys,
          selectedPracticeRuntime.defaultClickCastPreferred
        )
      );
      if (typeof data.useClickCasting === "boolean") {
        setUseClickCasting(Boolean(data.useClickCasting));
      }
      if (typeof data.showHolyPriestEchoOnRaidFrames === "boolean") {
        setShowHolyPriestEchoOnRaidFrames(Boolean(data.showHolyPriestEchoOnRaidFrames));
      }
      if (typeof data.movementKeyPreset === "string") {
        setMovementKeyPreset(normalizeMovementPreset(data.movementKeyPreset));
      }
      if (data.movementCustomKeys && typeof data.movementCustomKeys === "object") {
        setCustomMovementKeys(normalizeMovementCustomKeys(data.movementCustomKeys));
      }
      const hasSavedCooldownManagerLayout =
        Array.isArray(data.cooldownSpellOrder) ||
        Array.isArray(data.cooldownSecondarySpellOrder) ||
        Array.isArray(data.cooldownReserveSpellOrder);
      if (hasSavedCooldownManagerLayout) {
        const normalizedCooldownOrders = buildCooldownManagerSpellOrderBuckets(
          activeSpellKeys,
          data.cooldownSpellOrder ?? cooldownSpellOrderRef.current,
          data.cooldownSecondarySpellOrder ?? cooldownSecondarySpellOrderRef.current,
          data.cooldownReserveSpellOrder ?? cooldownReserveSpellOrderRef.current
        );
        cooldownSpellOrderRef.current = normalizedCooldownOrders.manager;
        cooldownSecondarySpellOrderRef.current = normalizedCooldownOrders.secondary;
        cooldownReserveSpellOrderRef.current = normalizedCooldownOrders.reserve;
        setCooldownSpellOrder(normalizedCooldownOrders.manager);
        setCooldownSecondarySpellOrder(normalizedCooldownOrders.secondary);
        setCooldownReserveSpellOrder(normalizedCooldownOrders.reserve);
      }
      const hasSavedSpecialProcLayout =
        Array.isArray(data.specialProcOrderKeys) ||
        Array.isArray(data.specialProcOrder) ||
        Array.isArray(data.specialProcEnabledKeys);
      if (hasSavedSpecialProcLayout) {
        const savedSpecialProcOrder = Array.isArray(data.specialProcOrderKeys)
          ? data.specialProcOrderKeys
          : data.specialProcOrder;
        const normalizedSpecialProcOrder = buildSpecialProcDisplayOrder(
          selectedPracticeRuntime.specialProcDisplayConfig,
          savedSpecialProcOrder ?? specialProcOrderKeysRef.current
        );
        specialProcOrderKeysRef.current = normalizedSpecialProcOrder;
        setSpecialProcOrderKeys(normalizedSpecialProcOrder);
        const normalizedSpecialProcEnabled = buildSpecialProcEnabledKeys(
          selectedPracticeRuntime.specialProcDisplayConfig,
          data.specialProcEnabledKeys ?? specialProcEnabledKeysRef.current
        );
        specialProcEnabledKeysRef.current = normalizedSpecialProcEnabled;
        setSpecialProcEnabledKeys(normalizedSpecialProcEnabled);
      }
      const savedSpecialProcIconSizePx = Number(data.specialProcOverlayIconSizePx);
      if (Number.isFinite(savedSpecialProcIconSizePx)) {
        setSpecialProcOverlayIconSizePx(
          Math.max(
            DEFAULT_SPECIAL_PROC_ICON_SIZE_PX,
            Math.min(maxSpecialProcOverlayIconSizePx, Math.round(savedSpecialProcIconSizePx))
          )
        );
      }
      const savedSecondaryIconSizePx = Number(
        data.cooldownManagerSecondaryIconSizeSettingPx ?? data.cooldownManagerSecondaryIconSizePx
      );
      if (Number.isFinite(savedSecondaryIconSizePx)) {
        setCooldownManagerSecondaryIconSizeSettingPx(
          Math.max(
            MIN_COOLDOWN_MANAGER_SECONDARY_ICON_SIZE_PX,
            Math.min(MAX_COOLDOWN_MANAGER_SECONDARY_ICON_SIZE_PX, Math.round(savedSecondaryIconSizePx))
          )
        );
      }
      const savedPrimaryIconSizePx = Number(
        data.cooldownManagerPrimaryIconSizeSettingPx ?? data.cooldownManagerPrimaryIconSizePx
      );
      if (Number.isFinite(savedPrimaryIconSizePx)) {
        setCooldownManagerPrimaryIconSizeSettingPx(
          Math.max(
            MIN_COOLDOWN_MANAGER_PRIMARY_ICON_SIZE_PX,
            Math.min(MAX_COOLDOWN_MANAGER_PRIMARY_ICON_SIZE_PX, Math.round(savedPrimaryIconSizePx))
          )
        );
      }
      const savedResourceBarLayout =
        data.cooldownResourceBarLayout && typeof data.cooldownResourceBarLayout === "object"
          ? data.cooldownResourceBarLayout
          : data.cooldownResourceBarOffsets && typeof data.cooldownResourceBarOffsets === "object"
            ? data.cooldownResourceBarOffsets
            : null;
      if (savedResourceBarLayout) {
        setCooldownResourceBarLayout(
          normalizeCooldownResourceBarLayout(savedResourceBarLayout)
        );
      }
      if (!silent) {
        setStatusText("저장된 개인 세팅을 불러왔습니다.");
        setCloudProfileStatusTone("success");
        setCloudProfileStatusText("내 세팅 불러오기 완료");
      }
      return true;
    } catch (error) {
      if (!silent) {
        if (error?.code === "permission-denied") {
          setStatusText("권한 오류로 개인 세팅 불러오기에 실패했습니다.");
          setCloudProfileStatusTone("error");
          setCloudProfileStatusText("권한 오류로 내 세팅 불러오기에 실패했습니다.");
        } else {
          setStatusText("개인 세팅 불러오기에 실패했습니다.");
          setCloudProfileStatusTone("error");
          setCloudProfileStatusText("내 세팅 불러오기에 실패했습니다.");
        }
      }
      return false;
    } finally {
      if (requestSeq === keybindProfileRequestSeqRef.current) {
        setKeybindProfileSyncBusy(false);
      }
    }
  }

  async function handleSaveCloudKeybindProfile() {
    if (!canUseCloudKeybindProfile) {
      setStatusText("로그인 후에 직업별 세팅 저장을 사용할 수 있습니다.");
      setCloudProfileStatusTone("error");
      setCloudProfileStatusText("로그인 후에 내 세팅 저장을 사용할 수 있습니다.");
      return;
    }
    const docRef = resolveKeybindProfileDocRef();
    if (!docRef) {
      setStatusText("세팅 저장소에 접근할 수 없습니다.");
      setCloudProfileStatusTone("error");
      setCloudProfileStatusText("세팅 저장소에 접근할 수 없습니다.");
      return;
    }

    setKeybindProfileSyncBusy(true);
    setCloudProfileStatusTone("info");
    setCloudProfileStatusText("내 세팅 저장 중...");
    try {
      const basePayload = {
        healerSlug: selectedHealerSlug,
        useClickCasting: Boolean(useClickCasting),
        movementKeyPreset: normalizeMovementPreset(movementKeyPreset),
        movementCustomKeys: normalizeMovementCustomKeys(customMovementKeys),
        keyboardBindings: buildPersistableKeyboardBindings(keyboardBindings, activeSpellKeys),
        clickCastBindings: buildPersistableClickCastBindings(clickCastBindings, clickCastableKeys),
        cooldownSpellOrder: [...cooldownSpellOrderRef.current],
        cooldownSecondarySpellOrder: [...cooldownSecondarySpellOrderRef.current],
        cooldownReserveSpellOrder: [...cooldownReserveSpellOrderRef.current],
        specialProcOrderKeys: [...specialProcOrderKeysRef.current],
        specialProcEnabledKeys: [...specialProcEnabledKeysRef.current],
        specialProcOverlayIconSizePx: configuredSpecialProcOverlayIconSizePx,
        cooldownManagerPrimaryIconSizeSettingPx: cooldownManagerPrimaryIconSizePx,
        cooldownManagerSecondaryIconSizeSettingPx: cooldownManagerSecondaryIconSizePx,
        cooldownResourceBarOffsets: normalizeCooldownResourceBarLayout(cooldownResourceBarLayoutRef.current),
        updatedAt: serverTimestamp()
      };
      const payload =
        selectedHealerSlug === HOLY_PRIEST_HEALER_SLUG
          ? {
            ...basePayload,
            showHolyPriestEchoOnRaidFrames: Boolean(showHolyPriestEchoOnRaidFrames)
          }
          : basePayload;
      try {
        await docRef.set(payload, { merge: true });
      } catch (error) {
        const shouldRetryWithoutEchoFlag =
          selectedHealerSlug === HOLY_PRIEST_HEALER_SLUG &&
          error?.code === "permission-denied" &&
          Object.prototype.hasOwnProperty.call(payload, "showHolyPriestEchoOnRaidFrames");
        if (!shouldRetryWithoutEchoFlag) {
          throw error;
        }
        await docRef.set(basePayload, { merge: true });
      }
      setStatusText("개인 세팅을 저장했습니다.");
      setCloudProfileStatusTone("success");
      setCloudProfileStatusText("내 세팅 저장 완료");
    } catch (error) {
      console.error("Failed to save healer keybind profile", error);
      if (error?.code === "permission-denied") {
        setStatusText("권한 오류로 개인 세팅 저장에 실패했습니다. Firestore rules 배포 상태를 확인해 주세요.");
        setCloudProfileStatusTone("error");
        setCloudProfileStatusText("권한 오류로 내 세팅 저장에 실패했습니다.");
      } else {
        const errorCode = String(error?.code ?? "").trim();
        setStatusText(errorCode ? `개인 세팅 저장에 실패했습니다. (${errorCode})` : "개인 세팅 저장에 실패했습니다.");
        setCloudProfileStatusTone("error");
        setCloudProfileStatusText(
          errorCode ? `내 세팅 저장 실패 (${errorCode})` : "내 세팅 저장에 실패했습니다."
        );
      }
    } finally {
      setKeybindProfileSyncBusy(false);
    }
  }

  useEffect(() => {
    if (!canUseCloudKeybindProfile || running) {
      return;
    }
    void loadCloudKeybindProfile({ silent: true });
  }, [canUseCloudKeybindProfile, running, selectedHealerSlug, user?.uid]);

  function handleStartSimulation() {
    if (!selectedHealerIsImplemented) {
      setStatusText("선택한 힐러 연습기는 아직 준비중입니다.");
      return;
    }
    if (!canStartSimulation) {
      if (!setupConfirmed) {
        setStatusText("먼저 설정 완료를 눌러 랜덤 20인을 확정하세요.");
      } else {
        setStatusText("시작 전에 단축키/클릭캐스팅 중복 또는 금지 조합을 확인하세요.");
      }
      return;
    }

    stopLoopOnly();
    clearGameOverState();

    const durationMinutes = resolveCombatDurationMinutesByDifficulty(difficultyKey, selectedDifficultyTuning);
    const durationMs = durationMinutes * 60 * 1000;
    const configuredSetupSeed = Number(setupSeed);
    const seed = Number.isFinite(configuredSetupSeed)
      ? Math.floor(configuredSetupSeed)
      : Math.floor(Math.random() * 2147483647);
    const difficultyConfig = resolveDifficultyConfigByKey(selectedDifficultyTuning, difficultyKey);
    const resolvedTankDamageTakenMultiplier = DEFAULT_TANK_DAMAGE_TAKEN_MULTIPLIER;
    const normalizedTriageHealthThresholdPct = toPercentNumber(
      FIXED_TRIAGE_HEALTH_THRESHOLD_PCT,
      FIXED_TRIAGE_HEALTH_THRESHOLD_PCT
    );
    const normalizedTriageMinEffectiveHealPct = toPercentNumber(
      FIXED_TRIAGE_MIN_EFFECTIVE_HEAL_PCT,
      FIXED_TRIAGE_MIN_EFFECTIVE_HEAL_PCT
    );

    const normalizedMovementPreset = normalizeMovementPreset(movementKeyPreset);
    const normalizedMovementCustomKeys = normalizeMovementCustomKeys(customMovementKeys);

    const keyboardTokenToSpell = buildKeyboardTokenToSpellMap(
      keyboardBindings,
      disabledKeyboardSpellSet,
      normalizedMovementPreset,
      normalizedMovementCustomKeys,
      activeSpellKeys
    );
    const mouseTokenToSpell = useClickCasting
      ? buildMouseTokenToSpellMap(clickCastBindings, clickCastableKeys)
      : {};
    const EngineClass = selectedPracticeRuntime.engineClass;

    const engine = new EngineClass({
      durationMs,
      seed,
      players: draftRoster,
      incomingDamageMultiplier: difficultyConfig.incomingDamageMultiplier,
      damageBreakEveryMs: difficultyConfig.damageBreakEveryMs,
      damageBreakDurationMs: difficultyConfig.damageBreakDurationMs,
      scheduledRaidBursts: difficultyConfig.scheduledRaidBursts,
      tankIncomingDamageMultiplier: resolvedTankDamageTakenMultiplier,
      triageHealthThresholdPct: normalizedTriageHealthThresholdPct,
      triageMinEffectiveHealPct: normalizedTriageMinEffectiveHealPct,
      ...selectedPracticeRuntime.buildEngineConfig(),
      leechHealingRatio: GLOBAL_LEECH_HEALING_RATIO,
      queueWindowMs: SPELL_QUEUE_WINDOW_MS
    });

    const frozenConfig = {
      seed,
      healerSlug: selectedHealerSlug,
      difficultyKey,
      mapKey: selectedMapKey,
      movementKeyPreset: normalizedMovementPreset,
      movementCustomKeys: normalizedMovementCustomKeys,
      useMouseover,
      useClickCasting,
      showHolyPriestEchoOnRaidFrames,
      raidFrameLayout,
      myRaidFramePositionMode: normalizeMyRaidFramePositionMode(myRaidFramePositionMode),
      tankDamageTakenMultiplier: resolvedTankDamageTakenMultiplier,
      triageHealthThresholdPct: normalizedTriageHealthThresholdPct,
      triageMinEffectiveHealPct: normalizedTriageMinEffectiveHealPct,
      keybinds: { ...effectiveBindingLabels },
      keyboardTokenToSpell,
      mouseTokenToSpell,
      cooldownManagerPrimaryIconSizePx,
      cooldownManagerSecondaryIconSizePx,
      cooldownResourceBarOffsets: normalizeCooldownResourceBarLayout(cooldownResourceBarLayoutRef.current),
      specialProcOrder: [...specialProcOrderKeysRef.current],
      specialProcEnabledKeys: [...specialProcEnabledKeysRef.current]
    };

    const firstSnapshot = engine.getSnapshot();
    const myPlayerInFirstSnapshot = findMyPlayerInSnapshot(firstSnapshot);

    engineRef.current = engine;
    setSessionConfig(frozenConfig);
    sessionConfigRef.current = frozenConfig;

    setSnapshot(firstSnapshot);
    latestSnapshotRef.current = firstSnapshot;

    const defaultTarget = firstSnapshot.players.find((player) => player.alive)?.id ?? "";
    setSelectedTargetId(defaultTarget);
    selectedTargetRef.current = defaultTarget;

    setHoveredTargetId("");
    hoveredTargetRef.current = "";
    selfPlayerIdRef.current = myPlayerInFirstSnapshot?.id ?? "";
    phaserSelfHpRatioRef.current = myPlayerInFirstSnapshot ? getPlayerHpRatio(myPlayerInFirstSnapshot) : 1;
    canvasRawDamageTakenRef.current = 0;
    setCanvasRawDamageTaken(0);
    canvasHitCountsRef.current = createInitialCanvasHitCounts();
    setCanvasHitCounts(createInitialCanvasHitCounts());

    setRunning(true);
    runningRef.current = true;
    setInCombatView(true);
    setRankingSaveStatus("idle");
    rankingSavedRunKeyRef.current = "";
    rankingSaveAttemptedRunKeyRef.current = "";
    setStatusText("연습 진행 중");
    startSimulationLoop();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollElementIntoViewWithStickyTopOffset(combatViewRef.current, "smooth");
      });
    });
  }

  function handleStopSimulation() {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }

    engine.finish("manual");
    const finalSnapshot = engine.getSnapshot();

    stopLoopOnly();
    setRunning(false);
    runningRef.current = false;
    setSnapshot(finalSnapshot);
    latestSnapshotRef.current = finalSnapshot;
    const myPlayerInFinalSnapshot = findMyPlayerInSnapshot(finalSnapshot, selfPlayerIdRef.current);
    if (myPlayerInFinalSnapshot?.id) {
      selfPlayerIdRef.current = myPlayerInFinalSnapshot.id;
      phaserSelfHpRatioRef.current = getPlayerHpRatio(myPlayerInFinalSnapshot);
    }

    setStatusText("연습을 수동 종료했습니다.");
  }

  function handleKeyInputChange(spellKey, rawValue) {
    markSetupDirty();
    const value = normalizeKey(rawValue);
    const currentModifier = normalizeModifier(keyboardBindings?.[spellKey]?.modifier);
    const movementConflict = !currentModifier && isMovementRestrictedKey(value, movementKeyPreset, customMovementKeys);
    const safeKey = movementConflict ? "" : value;
    setKeyboardBindings((prev) => ({
      ...prev,
      [spellKey]: {
        modifier: normalizeModifier(prev[spellKey]?.modifier),
        key: safeKey
      }
    }));
    if (safeKey !== value && value) {
      const preset = normalizeMovementPreset(movementKeyPreset);
      const restrictedKeys = resolveMovementRestrictedKeys(preset, customMovementKeys);
      const restrictedLabel = restrictedKeys.length ? restrictedKeys.join(", ") : "-";
      setStatusText(`${value} 키는 이동키(${preset === "CUSTOM" ? `커스텀: ${restrictedLabel}` : preset})와 겹쳐서 사용할 수 없습니다.`);
    }
  }

  function handleCustomMovementKeyChange(direction, rawValue) {
    if (!["up", "down", "left", "right"].includes(direction)) {
      return;
    }
    markSetupDirty();
    const value = normalizeKey(rawValue);
    if (!value) {
      return;
    }
    if (MODIFIER_ONLY_KEYS.has(value)) {
      setStatusText("Shift/Ctrl/Alt/Cmd 단독 입력은 이동키로 사용할 수 없습니다.");
      return;
    }

    const current = normalizeMovementCustomKeys(customMovementKeys);
    const duplicateDirection = CUSTOM_MOVEMENT_DIRECTION_OPTIONS.find(
      (option) => option.value !== direction && current[option.value] === value
    );
    if (duplicateDirection) {
      setStatusText(`${value} 키는 이미 ${duplicateDirection.label}에 사용 중입니다.`);
      return;
    }

    setCustomMovementKeys({
      ...current,
      [direction]: value
    });
  }

  function handleModifierChange(spellKey, modifierValue) {
    markSetupDirty();
    const modifier = normalizeModifier(modifierValue);
    const currentKey = normalizeKey(keyboardBindings?.[spellKey]?.key);
    const shouldClearMovementConflict = !modifier && isMovementRestrictedKey(currentKey, movementKeyPreset, customMovementKeys);
    if (shouldClearMovementConflict && currentKey) {
      const preset = normalizeMovementPreset(movementKeyPreset);
      const restrictedKeys = resolveMovementRestrictedKeys(preset, customMovementKeys);
      const restrictedLabel = restrictedKeys.length ? restrictedKeys.join(", ") : "-";
      setStatusText(`${currentKey} 키는 이동키(${preset === "CUSTOM" ? `커스텀: ${restrictedLabel}` : preset})와 겹쳐서 사용할 수 없습니다.`);
    }
    setKeyboardBindings((prev) => ({
      ...prev,
      [spellKey]: {
        modifier,
        key: shouldClearMovementConflict ? "" : normalizeKey(prev[spellKey]?.key)
      }
    }));
  }

  function handleClickCastBindingChange(spellKey, token) {
    markSetupDirty();
    setClickCastBindings((prev) => ({
      ...prev,
      [spellKey]: token
    }));
  }

  function selectTarget(playerId) {
    setSelectedTargetId(playerId);
    selectedTargetRef.current = playerId;
  }

  function handleFrameMouseDown(event, playerId) {
    const currentSnapshot = latestSnapshotRef.current;
    const player = currentSnapshot?.players.find((item) => item.id === playerId);
    if (!player || !player.alive) {
      return;
    }

    const config = sessionConfigRef.current;
    if (running && config?.useClickCasting) {
      const token = mouseEventToBindingToken(event);
      const spellKey = config.mouseTokenToSpell[token];
      if (spellKey) {
        event.preventDefault();
        queueSpell(spellKey, playerId);
        return;
      }
    }

    if (event.button === 0) {
      selectTarget(playerId);
    }
  }

  function handleFrameWheel(event, playerId) {
    event.preventDefault();
    event.stopPropagation();

    const currentSnapshot = latestSnapshotRef.current;
    const player = currentSnapshot?.players.find((item) => item.id === playerId);
    if (!player || !player.alive) {
      return;
    }

    const config = sessionConfigRef.current;
    if (!running || !config?.useClickCasting) {
      return;
    }

    const token = mouseEventToBindingToken(event);
    const spellKey = config.mouseTokenToSpell[token];
    if (!spellKey) {
      return;
    }

    queueSpell(spellKey, playerId);
  }

  useEffect(() => {
    if (!running) {
      return;
    }

    const clearMovementState = () => {
      movementStateRef.current = {
        up: false,
        down: false,
        left: false,
        right: false
      };
    };

    const applyMovementStateFromEvent = (event, isPressed) => {
      const config = sessionConfigRef.current;
      if (!config) {
        return false;
      }
      if (isPressed && getEventModifierList(event).length > 0) {
        return false;
      }

      const resolvedKeys = keyboardEventToResolvedKeys(event);
      if (!resolvedKeys.length) {
        return false;
      }

      const movementPreset = normalizeMovementPreset(config.movementKeyPreset);
      const movementKeys = resolveMovementKeys(movementPreset, config.movementCustomKeys);
      const nextState = { ...movementStateRef.current };
      let hasMovementKey = false;
      const leftMovementAliases = movementPreset === "WSQE" ? new Set([movementKeys.left, "A"]) : new Set([movementKeys.left]);
      const rightMovementAliases = movementPreset === "WSQE" ? new Set([movementKeys.right, "D"]) : new Set([movementKeys.right]);

      for (const key of resolvedKeys) {
        if (key === movementKeys.up) {
          nextState.up = isPressed;
          hasMovementKey = true;
        } else if (key === movementKeys.down) {
          nextState.down = isPressed;
          hasMovementKey = true;
        } else if (leftMovementAliases.has(key)) {
          nextState.left = isPressed;
          hasMovementKey = true;
        } else if (rightMovementAliases.has(key)) {
          nextState.right = isPressed;
          hasMovementKey = true;
        }
      }

      if (hasMovementKey) {
        movementStateRef.current = nextState;
      }

      return hasMovementKey;
    };

    const onKeyDown = (event) => {
      const pointerInRaidFrames = pointerInRaidFramesRef.current;
      const pointerInPhaserCanvas = pointerInPhaserCanvasRef.current;
      const targetTag = event.target?.tagName;
      if (
        !pointerInRaidFrames &&
        !pointerInPhaserCanvas &&
        (targetTag === "INPUT" ||
          targetTag === "TEXTAREA" ||
          targetTag === "SELECT" ||
          event.target?.isContentEditable)
      ) {
        return;
      }

      const isMovementKey = applyMovementStateFromEvent(event, true);
      if (isMovementKey) {
        return;
      }

      if (event.repeat) {
        return;
      }

      const config = sessionConfigRef.current;
      if (!config) {
        return;
      }

      const tokens = keyboardEventToBindingTokens(event);
      if (!tokens.length) {
        return;
      }

      const spellKey = tokens.map((token) => config.keyboardTokenToSpell[token]).find(Boolean);
      if (!spellKey) {
        return;
      }

      const runtime = resolveHealerPracticeRuntime(config.healerSlug);
      const spell = runtime.practiceSpells[spellKey];
      if (!spell) {
        return;
      }

      event.preventDefault();
      if (pointerInRaidFrames) {
        event.stopPropagation();
      }

      if (!spell.requiresTarget) {
        queueSpell(spell.key, null);
        return;
      }

      const targetId = resolveKeyboardTarget(config);
      if (!targetId) {
        setStatusText(`${spell.name}: 대상 지정 필요`);
        return;
      }

      queueSpell(spell.key, targetId);
    };

    const onKeyUp = (event) => {
      applyMovementStateFromEvent(event, false);
    };

    const onWindowBlur = () => {
      clearMovementState();
    };

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("blur", onWindowBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("blur", onWindowBlur);
      clearMovementState();
    };
  }, [running]);

  const currentSnapshot = snapshot;
  const showPostCombatSummaryPanels = Boolean(currentSnapshot) && !running;
  const bindingLabelsForDisplay = sessionConfig?.keybinds ?? effectiveBindingLabels;
  const activeRaidFrameLayout = sessionConfig?.raidFrameLayout ?? raidFrameLayout;
  const activeMyRaidFramePositionMode = normalizeMyRaidFramePositionMode(
    sessionConfig?.myRaidFramePositionMode ?? myRaidFramePositionMode
  );
  const activeDifficultyKey = sessionConfig?.difficultyKey ?? difficultyKey;
  const activeMapKey = sessionConfig?.mapKey ?? selectedMapKey;
  const activeShowHolyPriestEchoOnRaidFrames = Boolean(
    sessionConfig?.showHolyPriestEchoOnRaidFrames ?? showHolyPriestEchoOnRaidFrames
  );
  const activeCooldownManagerPrimaryIconSizePx = Math.max(
    MIN_COOLDOWN_MANAGER_PRIMARY_ICON_SIZE_PX,
    Math.min(
      MAX_COOLDOWN_MANAGER_PRIMARY_ICON_SIZE_PX,
      Math.round(
        Number(
          sessionConfig?.cooldownManagerPrimaryIconSizePx ??
          cooldownManagerPrimaryIconSizePx
        )
      )
    )
  );
  const activeCooldownManagerSecondaryIconSizePx = Math.max(
    MIN_COOLDOWN_MANAGER_SECONDARY_ICON_SIZE_PX,
    Math.min(
      MAX_COOLDOWN_MANAGER_SECONDARY_ICON_SIZE_PX,
      Math.round(
        Number(
          sessionConfig?.cooldownManagerSecondaryIconSizePx ??
          cooldownManagerSecondaryIconSizePx
        )
      )
    )
  );
  const activeCooldownResourceBarLayout = useMemo(
    () =>
      normalizeCooldownResourceBarLayout(
        sessionConfig?.cooldownResourceBarOffsets ??
        sessionConfig?.cooldownResourceBarLayout ??
        normalizedCooldownResourceBarLayout
      ),
    [sessionConfig?.cooldownResourceBarLayout, sessionConfig?.cooldownResourceBarOffsets, normalizedCooldownResourceBarLayout]
  );
  const activeMovementKeyPreset = normalizeMovementPreset(sessionConfig?.movementKeyPreset ?? movementKeyPreset);
  const activeMovementCustomKeys = useMemo(
    () => normalizeMovementCustomKeys(sessionConfig?.movementCustomKeys ?? customMovementKeys),
    [sessionConfig?.movementCustomKeys, customMovementKeys]
  );
  const activeMovementKeys = useMemo(
    () => resolveMovementKeys(activeMovementKeyPreset, activeMovementCustomKeys),
    [activeMovementKeyPreset, activeMovementCustomKeys]
  );
  const activeCombatHealerSlug = String(sessionConfig?.healerSlug ?? selectedHealerSlug).trim();
  const activeCombatPracticeRuntime = useMemo(
    () => resolveHealerPracticeRuntime(activeCombatHealerSlug),
    [activeCombatHealerSlug]
  );
  const activeCombatDifficultyTuning =
    activeCombatPracticeRuntime.difficultyTuning ?? selectedDifficultyTuning;
  const activeCombatSpellIconsByKey = activeCombatPracticeRuntime.spellIconUrlByKey ?? practiceSpellIconsByKey;
  const healMeterGrouping = useMemo(
    () => buildHealMeterGrouping(HEAL_METER_GROUPS_BY_HEALER[activeCombatHealerSlug] ?? []),
    [activeCombatHealerSlug]
  );
  const rankingViewPracticeRuntime = useMemo(
    () => resolveHealerPracticeRuntime(rankingViewHealerSlug),
    [rankingViewHealerSlug]
  );
  const rankingViewDifficultyTuning =
    rankingViewPracticeRuntime.difficultyTuning ?? DEFAULT_PRACTICE_DIFFICULTY_TUNING;
  const rankingDifficultyTabKeys = useMemo(() => {
    const filteredKeys = buildDifficultyOptionsFromTuning(rankingViewDifficultyTuning)
      .map((option) => option.value)
      .filter((difficultyKeyValue) => RANKING_ENABLED_DIFFICULTY_KEYS.has(difficultyKeyValue));
    return filteredKeys.length ? filteredKeys : RANKING_DIFFICULTY_TAB_KEYS;
  }, [rankingViewDifficultyTuning]);
  const rankingHealerTabOptions = useMemo(
    () =>
      healers.map((healer) => ({
        slug: String(healer.slug ?? "").trim(),
        shortName: String(healer.shortName ?? healer.name ?? healer.slug ?? "").trim() || "힐러",
        iconUrl: String(healer.classIcon ?? "").trim() || DEFAULT_SPELL_ICON_URL,
        enabled: IMPLEMENTED_HEALER_SLUGS.has(String(healer.slug ?? "").trim())
      })),
    []
  );
  const rankingCurrentPatchVersion = useMemo(
    () => normalizeRankingPatchVersion(HEALER_PRACTICE_RANKING_PATCH_CONFIG?.currentPatchVersion, "12.0.1"),
    []
  );
  const rankingPatchVersionOptions = useMemo(() => {
    const configured = Array.isArray(HEALER_PRACTICE_RANKING_PATCH_CONFIG?.availablePatchVersions)
      ? HEALER_PRACTICE_RANKING_PATCH_CONFIG.availablePatchVersions
      : [];
    const unique = new Set(
      configured
        .map((entry) => normalizeRankingPatchVersion(entry, ""))
        .filter(Boolean)
    );
    unique.add(rankingCurrentPatchVersion);
    return Array.from(unique);
  }, [rankingCurrentPatchVersion]);
  useEffect(() => {
    setExpandedHealMeterSpellKeys(new Set());
  }, [activeCombatHealerSlug]);
  const activePhaserDifficultyConfig =
    PHASER_DIFFICULTY_MECHANIC_TUNING[activeDifficultyKey] ?? PHASER_DIFFICULTY_MECHANIC_TUNING.normal;
  const activeDifficultyLabel =
    String(resolveDifficultyConfigByKey(activeCombatDifficultyTuning, activeDifficultyKey)?.label ?? activeDifficultyKey)
      .trim() || "일반";
  const hasCombatSnapshot = Boolean(currentSnapshot);
  const raidColumnCount = raidLayoutColumnCount(activeRaidFrameLayout);
  const raidRowCount = activeRaidFrameLayout === "4x5" ? 4 : 5;
  const frameSizeByLayout = RAID_FRAME_VISUAL_CONFIG.frameSizeByLayout ?? {};
  const activeFrameSize =
    frameSizeByLayout[activeRaidFrameLayout] ??
    frameSizeByLayout["4x5"] ??
    {};
  const raidFrameWidthPx = Math.max(
    1,
    Number(activeFrameSize.widthPx ?? RAID_FRAME_VISUAL_CONFIG.frameWidthPx ?? 112)
  );
  const raidFrameHeightPx = Math.max(
    1,
    Number(activeFrameSize.heightPx ?? RAID_FRAME_VISUAL_CONFIG.frameHeightPx ?? 58)
  );
  const raidGridWidthPx =
    RAID_FRAME_VISUAL_CONFIG.gridWidthOverridePx ?? raidFrameWidthPx * raidColumnCount;
  const raidGridHeightPx = raidFrameHeightPx * raidRowCount;
  const raidGridStyle = {
    width: `${raidGridWidthPx}px`,
    gridTemplateColumns: `repeat(${raidColumnCount}, ${raidFrameWidthPx}px)`
  };

  const cooldownBarSnapshot = currentSnapshot ?? {
    holyPower: 0,
    cooldowns: {},
    buffs: {},
    manaPct: 100,
    currentCast: null,
    queuedAction: null,
    queueLockoutRemainingMs: 0,
    spellQueueWindowMs: SPELL_QUEUE_WINDOW_MS
  };
  const activeSpecialProcDisplayConfig = useMemo(() => {
    const source = Array.isArray(activeCombatPracticeRuntime.specialProcDisplayConfig)
      ? activeCombatPracticeRuntime.specialProcDisplayConfig
      : [];
    const preferredOrder = Array.isArray(sessionConfig?.specialProcOrder)
      ? sessionConfig.specialProcOrder
      : specialProcOrderKeys;
    const preferredEnabledKeys = Array.isArray(sessionConfig?.specialProcEnabledKeys)
      ? sessionConfig.specialProcEnabledKeys
      : specialProcEnabledKeys;
    const orderedKeys = buildSpecialProcDisplayOrder(source, preferredOrder);
    const enabledKeySet = new Set(buildSpecialProcEnabledKeys(source, preferredEnabledKeys));
    const entryByKey = new Map();
    source.forEach((entry) => {
      const key = String(entry?.key ?? "").trim();
      if (!key || entryByKey.has(key)) {
        return;
      }
      entryByKey.set(key, entry);
    });
    return orderedKeys
      .filter((key) => enabledKeySet.has(key))
      .map((key) => entryByKey.get(key))
      .filter(Boolean);
  }, [
    activeCombatPracticeRuntime.specialProcDisplayConfig,
    sessionConfig?.specialProcOrder,
    sessionConfig?.specialProcEnabledKeys,
    specialProcOrderKeys,
    specialProcEnabledKeys
  ]);
  const activeSpecialProcIndicators = useMemo(() => {
    if (!currentSnapshot) {
      return [];
    }

    const buffState = currentSnapshot.buffs ?? {};
    return activeSpecialProcDisplayConfig
      .map((entry, index) => {
        const procKey = String(entry?.key ?? "").trim();
        const buffRemainingMsKey = String(entry?.buffRemainingMsKey ?? "").trim();
        const alternateBuffRemainingMsKeys = Array.isArray(entry?.alternateBuffRemainingMsKeys)
          ? entry.alternateBuffRemainingMsKeys
            .map((value) => String(value ?? "").trim())
            .filter(Boolean)
          : [];
        if (!buffRemainingMsKey && !alternateBuffRemainingMsKeys.length) {
          return null;
        }

        const candidateRemainingMsValues = [];
        if (buffRemainingMsKey) {
          candidateRemainingMsValues.push(Math.max(0, Number(buffState[buffRemainingMsKey] ?? 0)));
        }
        for (const alternateKey of alternateBuffRemainingMsKeys) {
          candidateRemainingMsValues.push(Math.max(0, Number(buffState[alternateKey] ?? 0)));
        }
        const remainingMs = candidateRemainingMsValues.length
          ? Math.max(...candidateRemainingMsValues)
          : 0;
        if (remainingMs <= 0) {
          return null;
        }
        const stackCountBuffKey = String(entry?.stackCountBuffKey ?? "").trim();
        const stackCountValueRaw = stackCountBuffKey ? Number(buffState[stackCountBuffKey] ?? 0) : Number.NaN;
        const stackCount = Number.isFinite(stackCountValueRaw) ? Math.max(0, Math.floor(stackCountValueRaw)) : null;

        const defaultTopOffsetPx = Number.isFinite(Number(SPECIAL_PROC_OVERLAY_TOP_OFFSET_PX))
          ? Number(SPECIAL_PROC_OVERLAY_TOP_OFFSET_PX)
          : -22;
        const showAboveCooldownManager = Boolean(entry?.showAboveCooldownManager);
        const iconSizePx = showAboveCooldownManager
          ? configuredSpecialProcOverlayIconSizePx
          : DEFAULT_SPECIAL_PROC_ICON_SIZE_PX;
        const topOffsetPx = showAboveCooldownManager
          ? defaultTopOffsetPx - Math.max(0, iconSizePx - DEFAULT_SPECIAL_PROC_ICON_SIZE_PX)
          : defaultTopOffsetPx;
        const label = String(entry?.label ?? "").trim() || procKey || "버프";

        return {
          id: `${procKey || buffRemainingMsKey || "proc"}-${index}`,
          key: procKey,
          label,
          iconUrl:
            String(entry?.iconUrl ?? "").trim() ||
            activeCombatSpellIconsByKey[procKey] ||
            DEFAULT_SPELL_ICON_URL,
          remainingMs,
          iconSizePx,
          topOffsetPx,
          showAboveCooldownManager,
          showOnMyRaidFrame: Boolean(entry?.showOnMyRaidFrame),
          showCountdownOnOverlay: entry?.showCountdownOnOverlay !== false,
          showCountdownOnRaidFrame: Boolean(entry?.showCountdownOnRaidFrame),
          showStackCountOnOverlay: Boolean(entry?.showStackCountOnOverlay),
          stackCount
        };
      })
      .filter(Boolean);
  }, [
    activeCombatSpellIconsByKey,
    activeSpecialProcDisplayConfig,
    configuredSpecialProcOverlayIconSizePx,
    currentSnapshot
  ]);
  const overlayTopProcIndicators = useMemo(
    () => activeSpecialProcIndicators.filter((entry) => entry.showAboveCooldownManager),
    [activeSpecialProcIndicators]
  );
  const overlayMyFrameProcIndicators = useMemo(
    () => activeSpecialProcIndicators.filter((entry) => entry.showOnMyRaidFrame),
    [activeSpecialProcIndicators]
  );
  const orderedRaidFramePlayers = useMemo(
    () =>
      buildRaidFrameOrderedPlayers(
        currentSnapshot?.players ?? [],
        activeRaidFrameLayout,
        activeMyRaidFramePositionMode
      ),
    [currentSnapshot, activeRaidFrameLayout, activeMyRaidFramePositionMode]
  );
  const finalOverhealingPct = useMemo(() => {
    const metrics = currentSnapshot?.metrics;
    if (!metrics) {
      return 0;
    }
    const direct = Number(metrics.overhealingPct);
    if (Number.isFinite(direct)) {
      return Math.max(0, Math.min(100, direct));
    }
    const healingDone = Math.max(0, Number(metrics.healingDone ?? 0));
    const overhealing = Math.max(0, Number(metrics.overhealing ?? 0));
    const total = healingDone + overhealing;
    if (total <= 0) {
      return 0;
    }
    return Math.max(0, Math.min(100, (overhealing / total) * 100));
  }, [currentSnapshot]);
  const finalAverageRaidHealthPct = useMemo(() => {
    const value = Number(currentSnapshot?.metrics?.averageRaidHealthPct ?? 0);
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.max(0, Math.min(100, value));
  }, [currentSnapshot]);
  const finalScoreBreakdown = useMemo(() => {
    if (!currentSnapshot?.finished) {
      return null;
    }

    const metrics = currentSnapshot?.metrics ?? {};
    const deaths = Math.max(0, Math.round(Number(metrics.deaths ?? 0)));
    const manaPct = Math.max(0, Math.min(100, Number(currentSnapshot?.manaPct ?? 0)));
    const wastedHolyPower = Math.max(0, Math.round(Number(metrics.wastedHolyPower ?? 0)));

    const deathsConfig = HEALER_PRACTICE_SCORE_COMMON_CONFIG?.deaths ?? {};
    const deathsScore = computeCountPenaltyScore(deaths, {
      maxPoints: deathsConfig.maxPoints,
      pointsLostPerUnit: deathsConfig.pointsLostPerDeath
    });

    const overhealConfig = resolveDifficultyValue(
      HEALER_PRACTICE_SCORE_COMMON_CONFIG?.overhealingByDifficulty,
      activeDifficultyKey
    );
    const overhealingScore = computeLowerIsBetterStepScore(
      finalOverhealingPct,
      overhealConfig,
      { maxPoints: 15, fullScoreAtOrBelowPct: 10, pctPerPointLost: 2, pointsLostPerStep: 0.5 }
    );

    const healerScoreConfig = resolveDifficultyValue(
      HEALER_PRACTICE_SCORE_HEALER_CONFIG_BY_SLUG?.[activeCombatHealerSlug],
      activeDifficultyKey
    );
    const averageRaidHealthScore = computeHigherIsBetterStepScore(
      finalAverageRaidHealthPct,
      healerScoreConfig?.averageRaidHealth,
      { maxPoints: 20, fullScoreAtOrAbovePct: 75, pctPerPointLost: 1 }
    );
    const remainingManaConfig = healerScoreConfig?.remainingMana;
    const includeRemainingManaScore = remainingManaConfig?.enabled !== false;
    const remainingManaScore = includeRemainingManaScore
      ? computeLowerIsBetterStepScore(
        manaPct,
        remainingManaConfig,
        { maxPoints: 10, fullScoreAtOrBelowPct: 30, pctPerPointLost: 2, pointsLostPerStep: 0.5 }
      )
      : 0;

    const directCpm = Number(metrics.cpm);
    const cpm = Number.isFinite(directCpm)
      ? Math.max(0, directCpm)
      : Math.max(
        0,
        (() => {
          const casts = metrics.casts;
          if (!casts || typeof casts !== "object") {
            return 0;
          }
          const totalCasts = Object.values(casts).reduce(
            (sum, value) => sum + Math.max(0, Number(value ?? 0)),
            0
          );
          const elapsedMinutes = Math.max(1e-6, Number(currentSnapshot?.nowMs ?? 0) / 60000);
          return totalCasts / elapsedMinutes;
        })()
      );
    const cpmConfig = HEALER_PRACTICE_SCORE_CPM_CONFIG_BY_SLUG?.[activeCombatHealerSlug] ?? null;
    const cpmScore = roundToOneDecimal(
      computeHigherIsBetterLinearScore(cpm, cpmConfig, {
        maxPoints: 10,
        fullScoreAtOrAboveValue: 42,
        zeroScoreAtOrBelowValue: 30
      })
    );

    const totalHealingDone = Math.max(0, Number(metrics.healingDone ?? 0));
    const myPlayer = findMyPlayerInSnapshot(currentSnapshot, selfPlayerIdRef.current);
    const healingByTarget = metrics.healingByTarget;
    const selfHealingDone =
      totalHealingDone > 0 && myPlayer?.id && healingByTarget && typeof healingByTarget === "object"
        ? Math.max(0, Number(healingByTarget[myPlayer.id] ?? 0))
        : 0;
    const selfHealRatioPctForScore =
      totalHealingDone > 0 ? Math.max(0, Math.min(100, (selfHealingDone / totalHealingDone) * 100)) : 0;
    const selfHealConfig = healerScoreConfig?.selfHealRatio ?? HEALER_PRACTICE_SCORE_COMMON_CONFIG?.selfHealRatio ?? {};
    const selfHealScore = roundToOneDecimal(
      computeLowerIsBetterStepScore(selfHealRatioPctForScore, selfHealConfig, {
        maxPoints: 5,
        fullScoreAtOrBelowPct: 6,
        pctPerPointLost: 3,
        pointsLostPerStep: 1
      })
    );

    const healerSpecificConfig = healerScoreConfig?.healerSpecific ?? {};
    const healerSpecificType = String(healerSpecificConfig.type ?? "").trim();
    const healerSpecificMaxPoints = Math.max(0, Number(healerSpecificConfig.maxPoints ?? 20) || 20);
    let healerSpecificScore = healerSpecificMaxPoints;
    if (healerSpecificType === "wastedHolyPower") {
      healerSpecificScore = computeCountPenaltyScore(wastedHolyPower, {
        maxPoints: healerSpecificMaxPoints,
        pointsLostPerUnit: Number(healerSpecificConfig.pointsLostPerWastedHolyPower ?? 1)
      });
    } else if (healerSpecificType === "holyPriestCustom") {
      const wastedLightweaverStacks = Math.max(0, Math.round(Number(metrics.wastedLightweaverStacks ?? 0)));
      const wastedSurgeOfLightStacks = Math.max(0, Math.round(Number(metrics.wastedSurgeOfLightStacks ?? 0)));
      const rawPrayerOfHealingCasts = Math.max(0, Math.round(Number(metrics.rawPrayerOfHealingCasts ?? 0)));
      const effectiveSerenityReductionSec = Math.max(
        0,
        Number(metrics.effectiveSerenityCooldownReductionMs ?? 0) / 1000
      );
      const wastedProcConfig = healerSpecificConfig?.wastedProcStacks ?? {};
      const rawPohConfig = healerSpecificConfig?.rawPrayerOfHealingCasts ?? {};
      const serenityCdrConfig = healerSpecificConfig?.serenityCooldownReduction ?? {};
      const wastedProcScore = computeCountPenaltyScore(
        wastedLightweaverStacks + wastedSurgeOfLightStacks,
        {
          maxPoints: Number(wastedProcConfig.maxPoints ?? 10),
          pointsLostPerUnit: Number(wastedProcConfig.pointsLostPerUnit ?? 1)
        },
        10
      );
      const rawPohScore = computeCountPenaltyScore(
        rawPrayerOfHealingCasts,
        {
          maxPoints: Number(rawPohConfig.maxPoints ?? 5),
          pointsLostPerUnit: Number(rawPohConfig.pointsLostPerCast ?? 1)
        },
        5
      );
      const serenityCdrScore = computeHigherIsBetterStepScore(
        effectiveSerenityReductionSec,
        {
          maxPoints: Number(serenityCdrConfig.maxPoints ?? 10),
          fullScoreAtOrAbovePct: Number(serenityCdrConfig.fullScoreAtOrAboveSec ?? 350),
          pctPerStep: Number(serenityCdrConfig.secPerStep ?? 10),
          pointsLostPerStep: Number(serenityCdrConfig.pointsLostPerStep ?? 0.5)
        },
        {
          maxPoints: 10,
          fullScoreAtOrAbovePct: 350,
          pctPerStep: 10,
          pointsLostPerStep: 0.5
        }
      );
      healerSpecificScore = wastedProcScore + rawPohScore + serenityCdrScore;
    }
    healerSpecificScore = roundToOneDecimal(clampScore(healerSpecificScore, healerSpecificMaxPoints));
    const deathsScoreRounded = roundToOneDecimal(deathsScore);
    const overhealingScoreRounded = roundToOneDecimal(overhealingScore);
    const averageRaidHealthScoreRounded = roundToOneDecimal(averageRaidHealthScore);
    const remainingManaScoreRounded = roundToOneDecimal(remainingManaScore);

    const totalRaw =
      deathsScoreRounded +
      overhealingScoreRounded +
      averageRaidHealthScoreRounded +
      remainingManaScoreRounded +
      cpmScore +
      selfHealScore +
      healerSpecificScore;
    const totalScore = roundToOneDecimal(clampScore(totalRaw, 100));

    return {
      totalScore,
      deathsScore: deathsScoreRounded,
      overhealingScore: overhealingScoreRounded,
      averageRaidHealthScore: averageRaidHealthScoreRounded,
      remainingManaScore: remainingManaScoreRounded,
      cpmScore,
      selfHealScore,
      healerSpecificScore
    };
  }, [
    activeCombatHealerSlug,
    activeDifficultyKey,
    currentSnapshot,
    finalAverageRaidHealthPct,
    finalOverhealingPct
  ]);
  const bossDamageGraphPreview = useMemo(() => {
    if (!setupConfirmed || !selectedHealerIsImplemented || draftRoster.length !== MIN_RAID_SIZE) {
      return null;
    }
    const configuredSeed = Number(setupSeed);
    if (!Number.isFinite(configuredSeed)) {
      return null;
    }

    const durationMinutes = resolveCombatDurationMinutesByDifficulty(difficultyKey, selectedDifficultyTuning);
    const durationMs = durationMinutes * 60 * 1000;
    const seed = Math.floor(configuredSeed);
    const difficultyConfig = resolveDifficultyConfigByKey(selectedDifficultyTuning, difficultyKey);
    const normalizedTriageHealthThresholdPct = toPercentNumber(
      FIXED_TRIAGE_HEALTH_THRESHOLD_PCT,
      FIXED_TRIAGE_HEALTH_THRESHOLD_PCT
    );
    const normalizedTriageMinEffectiveHealPct = toPercentNumber(
      FIXED_TRIAGE_MIN_EFFECTIVE_HEAL_PCT,
      FIXED_TRIAGE_MIN_EFFECTIVE_HEAL_PCT
    );
    const EngineClass = selectedPracticeRuntime.engineClass;
    const graphWidth = BOSS_DAMAGE_GRAPH_VIEWBOX_WIDTH - BOSS_DAMAGE_GRAPH_PADDING.left - BOSS_DAMAGE_GRAPH_PADDING.right;
    const graphHeight = BOSS_DAMAGE_GRAPH_VIEWBOX_HEIGHT - BOSS_DAMAGE_GRAPH_PADDING.top - BOSS_DAMAGE_GRAPH_PADDING.bottom;

    try {
      const previewEngine = new EngineClass({
        durationMs,
        seed,
        players: draftRoster,
        incomingDamageMultiplier: difficultyConfig.incomingDamageMultiplier,
        damageBreakEveryMs: difficultyConfig.damageBreakEveryMs,
        damageBreakDurationMs: difficultyConfig.damageBreakDurationMs,
        scheduledRaidBursts: difficultyConfig.scheduledRaidBursts,
        tankIncomingDamageMultiplier: DEFAULT_TANK_DAMAGE_TAKEN_MULTIPLIER,
        triageHealthThresholdPct: normalizedTriageHealthThresholdPct,
        triageMinEffectiveHealPct: normalizedTriageMinEffectiveHealPct,
        ...selectedPracticeRuntime.buildEngineConfig(),
        leechHealingRatio: GLOBAL_LEECH_HEALING_RATIO,
        queueWindowMs: SPELL_QUEUE_WINDOW_MS
      });

      const rawSeries = Array.isArray(previewEngine.getIncomingDamageTimelineSeries?.(BOSS_DAMAGE_GRAPH_BUCKET_MS))
        ? previewEngine.getIncomingDamageTimelineSeries(BOSS_DAMAGE_GRAPH_BUCKET_MS)
        : [];
      const points = rawSeries
        .map((point) => ({
          timeMs: Math.max(0, Math.min(durationMs, Number(point?.timeMs) || 0)),
          damage: Math.max(0, Number(point?.damage) || 0)
        }))
        .sort((a, b) => a.timeMs - b.timeMs);
      const totalDamage = points.reduce((sum, point) => sum + point.damage, 0);
      const maxDamage = points.reduce((max, point) => Math.max(max, point.damage), 0);
      const yAxisMax = resolveResponsiveYAxisMax(Math.max(1, maxDamage));
      const xFromTimeMs = (timeMs) =>
        BOSS_DAMAGE_GRAPH_PADDING.left + (durationMs > 0 ? (Math.max(0, Math.min(durationMs, timeMs)) / durationMs) * graphWidth : 0);
      const yFromDamage = (damage) =>
        BOSS_DAMAGE_GRAPH_PADDING.top + graphHeight * (1 - Math.max(0, Math.min(yAxisMax, damage)) / yAxisMax);
      const linePath = points
        .map((point, index) => `${index === 0 ? "M" : "L"} ${xFromTimeMs(point.timeMs).toFixed(2)} ${yFromDamage(point.damage).toFixed(2)}`)
        .join(" ");
      const xStart = points.length ? xFromTimeMs(points[0].timeMs) : BOSS_DAMAGE_GRAPH_PADDING.left;
      const xEnd = points.length ? xFromTimeMs(durationMs) : BOSS_DAMAGE_GRAPH_PADDING.left;
      const yBase = yFromDamage(0);
      const areaPath = linePath ? `${linePath} L ${xEnd.toFixed(2)} ${yBase.toFixed(2)} L ${xStart.toFixed(2)} ${yBase.toFixed(2)} Z` : "";
      const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const value = yAxisMax * ratio;
        return {
          value,
          y: yFromDamage(value)
        };
      });
      const timeTicks = buildGraphTimeTicks(durationMs, 6).map((timeMs) => ({
        timeMs,
        x: xFromTimeMs(timeMs)
      }));

      return {
        seed,
        durationMs,
        totalDamage,
        maxDamage,
        yAxisMax,
        linePath,
        areaPath,
        yTicks,
        timeTicks
      };
    } catch (error) {
      return null;
    }
  }, [
    difficultyKey,
    draftRoster,
    selectedHealerIsImplemented,
    selectedPracticeRuntime,
    setupConfirmed,
    setupSeed
  ]);
  const combatRecordCommonCards = useMemo(() => {
    if (!showPostCombatSummaryPanels) {
      return [];
    }
    const deaths = Math.max(0, Math.round(Number(currentSnapshot?.metrics?.deaths ?? 0)));
    const mana = Math.max(0, Number(currentSnapshot?.mana ?? 0));
    const manaPct = Math.max(0, Math.min(100, Number(currentSnapshot?.manaPct ?? 0)));
    const triageHealing = Math.max(0, Number(currentSnapshot?.metrics?.triageHealing ?? 0));
    const healingDone = Math.max(0, Number(currentSnapshot?.metrics?.healingDone ?? 0));
    const triageRatioPct = healingDone > 0 ? (triageHealing / healingDone) * 100 : 0;
    return [
      {
        key: "avg-raid-health",
        title: "평균 공대 체력",
        value: `${finalAverageRaidHealthPct.toFixed(1)}%`,
        valueClassName: "text-emerald-200"
      },
      {
        key: "overhealing",
        title: "최종 오버힐 비율",
        value: `${finalOverhealingPct.toFixed(1)}%`,
        valueClassName: "text-amber-200"
      },
      {
        key: "deaths",
        title: "최종 사망자 수",
        value: `${deaths}`,
        valueClassName: "text-rose-200"
      },
      {
        key: "mana",
        title: "남은 마나",
        value: `${Math.round(mana)} (${Math.round(manaPct)}%)`,
        valueClassName: "text-violet-200"
      },
      {
        key: "triage-healing",
        title: "트리아지 힐 총량",
        value: `${Math.round(triageHealing)} (${triageRatioPct.toFixed(1)}%)`,
        valueClassName: "text-sky-200"
      }
    ];
  }, [currentSnapshot, finalAverageRaidHealthPct, finalOverhealingPct, showPostCombatSummaryPanels]);
  const combatRecordHealerSpecificCards = useMemo(() => {
    if (!showPostCombatSummaryPanels || !currentSnapshot) {
      return [];
    }
    if (activeCombatHealerSlug === HOLY_PALADIN_HEALER_SLUG) {
      return [
        {
          key: "wasted-holy-power",
          title: "낭비한 신성한 힘",
          value: `${Math.max(0, Math.round(Number(currentSnapshot.metrics?.wastedHolyPower ?? 0)))}`,
          valueClassName: "text-yellow-200"
        }
      ];
    }
    if (activeCombatHealerSlug === HOLY_PRIEST_HEALER_SLUG) {
      const effectiveSerenityReductionMs = Math.max(
        0,
        Number(currentSnapshot.metrics?.effectiveSerenityCooldownReductionMs ?? 0)
      );
      const rawPrayerOfHealingCasts = Math.max(
        0,
        Math.round(Number(currentSnapshot.metrics?.rawPrayerOfHealingCasts ?? 0))
      );
      const wastedLightweaverStacks = Math.max(
        0,
        Math.round(Number(currentSnapshot.metrics?.wastedLightweaverStacks ?? 0))
      );
      const wastedSurgeOfLightStacks = Math.max(
        0,
        Math.round(Number(currentSnapshot.metrics?.wastedSurgeOfLightStacks ?? 0))
      );
      const surgeOfLightConsumedTotal = Math.max(
        0,
        Math.round(Number(currentSnapshot.metrics?.surgeOfLightConsumedTotal ?? 0))
      );
      const surgeOfLightConsumedFlashHealCasts = Math.max(
        0,
        Math.round(Number(currentSnapshot.metrics?.surgeOfLightConsumedFlashHealCasts ?? 0))
      );
      const surgeOfLightConsumedPrayerOfHealingCasts = Math.max(
        0,
        Math.round(Number(currentSnapshot.metrics?.surgeOfLightConsumedPrayerOfHealingCasts ?? 0))
      );
      const surgePrayerOfHealingUsagePct =
        surgeOfLightConsumedTotal > 0
          ? (surgeOfLightConsumedPrayerOfHealingCasts / surgeOfLightConsumedTotal) * 100
          : 0;
      const surgeFlashHealUsagePct =
        surgeOfLightConsumedTotal > 0
          ? (surgeOfLightConsumedFlashHealCasts / surgeOfLightConsumedTotal) * 100
          : 0;
      const fadeCasts = Math.max(
        0,
        Math.round(Number(currentSnapshot.metrics?.casts?.fade ?? 0))
      );
      const desperatePrayerCasts = Math.max(
        0,
        Math.round(Number(currentSnapshot.metrics?.casts?.desperatePrayer ?? 0))
      );
      return [
        {
          key: "effective-serenity-cdr",
          title: "평온 유효 쿨감",
          value: `${(effectiveSerenityReductionMs / 1000).toFixed(1)}초`,
          valueClassName: "text-cyan-200"
        },
        {
          key: "raw-prayer-of-healing-casts",
          title: "깡 치기 시전 수",
          value: `${rawPrayerOfHealingCasts}`,
          valueClassName: "text-violet-200"
        },
        {
          key: "wasted-lightweaver-stacks",
          title: "낭비된 빛술사 스택",
          value: `${wastedLightweaverStacks}`,
          valueClassName: "text-amber-200"
        },
        {
          key: "wasted-surge-of-light-stacks",
          title: "낭비된 빛의 쇄도",
          value: `${wastedSurgeOfLightStacks}`,
          valueClassName: "text-rose-200"
        },
        {
          key: "surge-of-light-usage",
          title: "빛의 쇄도 통계",
          value: `치유의 기원: ${surgePrayerOfHealingUsagePct.toFixed(1)}%\n순간 치유: ${surgeFlashHealUsagePct.toFixed(1)}%`,
          valueClassName: "text-purple-100",
          valueTextClassName: "text-[11px]"
        },
        {
          key: "holy-priest-defensive-usage",
          title: "생존기 사용 수",
          value: `소실: ${fadeCasts}회\n구원의 기도: ${desperatePrayerCasts}회`,
          valueClassName: "text-emerald-100",
          valueTextClassName: "text-[11px]"
        }
      ];
    }
    if (activeCombatHealerSlug === RESTORATION_DRUID_HEALER_SLUG) {
      const uptime = Math.max(0, Math.min(100, Number(currentSnapshot.metrics?.lifebloomHotUptimePct ?? 0)));
      return [
        {
          key: "lifebloom-uptime",
          title: "피생 도트 업타임",
          value: `${uptime.toFixed(1)}%`,
          valueClassName: "text-lime-200"
        }
      ];
    }
    return [];
  }, [activeCombatHealerSlug, currentSnapshot, showPostCombatSummaryPanels]);
  const combatRecordCards = useMemo(
    () => [...combatRecordCommonCards, ...combatRecordHealerSpecificCards],
    [combatRecordCommonCards, combatRecordHealerSpecificCards]
  );
  const finalCpm = useMemo(() => {
    if (!showPostCombatSummaryPanels) {
      return 0;
    }
    const direct = Number(currentSnapshot?.metrics?.cpm);
    if (Number.isFinite(direct)) {
      return Math.max(0, direct);
    }

    const casts = currentSnapshot?.metrics?.casts;
    if (!casts || typeof casts !== "object") {
      return 0;
    }

    const totalCasts = Object.values(casts).reduce(
      (sum, value) => sum + Math.max(0, Number(value ?? 0)),
      0
    );
    const elapsedMinutes = Math.max(1e-6, Number(currentSnapshot?.nowMs ?? 0) / 60000);
    return Math.max(0, totalCasts / elapsedMinutes);
  }, [currentSnapshot, showPostCombatSummaryPanels]);
  const showZoneFloorHitCount = Boolean(activePhaserDifficultyConfig?.worldFirstKillZonePatternEnabled);
  const feedbackGameOverReason = useMemo(
    () => mapGameOverFeedbackReason(gameOverReason, DEATH_GAMEOVER_THRESHOLD),
    [gameOverReason]
  );
  const isSuccessfulPracticeResult = Boolean(
    GLOBAL_SUCCESS_ON_TIMEOUT_WITHOUT_GAMEOVER &&
    currentSnapshot?.finished &&
    !gameOverReason &&
    isTimeoutFinishedSnapshot(currentSnapshot)
  );
  const rankingRunKey = useMemo(() => {
    if (!currentSnapshot?.finished || !sessionConfig) {
      return "";
    }
    const seed = Number(sessionConfig.seed);
    const safeSeed = Number.isFinite(seed) ? Math.floor(seed) : "seedless";
    const finishedMs = Math.max(0, Number(currentSnapshot.nowMs ?? 0));
    const healerSlug = String(sessionConfig.healerSlug ?? activeCombatHealerSlug).trim();
    const difficulty = String(sessionConfig.difficultyKey ?? activeDifficultyKey).trim();
    const mapKey = String(sessionConfig.mapKey ?? activeMapKey).trim();
    return `${healerSlug}|${difficulty}|${mapKey}|${rankingCurrentPatchVersion}|${safeSeed}|${finishedMs}`;
  }, [
    activeCombatDifficultyTuning,
    activeCombatHealerSlug,
    activeDifficultyKey,
    activeMapKey,
    currentSnapshot?.finished,
    currentSnapshot?.nowMs,
    rankingCurrentPatchVersion,
    sessionConfig
  ]);
  const canvasDamageHealingEquivalentAmount = useMemo(() => {
    if (!showPostCombatSummaryPanels) {
      return 0;
    }
    const myPlayer = findMyPlayerInSnapshot(currentSnapshot, selfPlayerIdRef.current);
    if (!myPlayer?.maxHp) {
      return 0;
    }
    const canvasMaxHealth = Math.max(1, Number(activePhaserDifficultyConfig.playerMaxHealth ?? 100));
    const hpScale = Math.max(0, Number(myPlayer.maxHp ?? 0)) / canvasMaxHealth;
    return Math.max(0, canvasRawDamageTaken * hpScale);
  }, [activePhaserDifficultyConfig, canvasRawDamageTaken, currentSnapshot, showPostCombatSummaryPanels]);
  const canvasDamageHealingSharePct = useMemo(() => {
    if (!showPostCombatSummaryPanels) {
      return 0;
    }
    const totalHealingDone = Math.max(0, Number(currentSnapshot?.metrics?.healingDone ?? 0));
    if (totalHealingDone <= 0) {
      return 0;
    }
    return Math.max(0, Math.min(100, (canvasDamageHealingEquivalentAmount / totalHealingDone) * 100));
  }, [canvasDamageHealingEquivalentAmount, currentSnapshot, showPostCombatSummaryPanels]);
  const healMeterRows = useMemo(() => {
    if (!showPostCombatSummaryPanels) {
      return [];
    }
    const healingBySpell = currentSnapshot?.metrics?.healingBySpell;
    if (!healingBySpell || typeof healingBySpell !== "object") {
      return [];
    }

    const childToParentSpellKey = healMeterGrouping.childToParentSpellKey ?? {};
    const childSpellKeysByParent = healMeterGrouping.childSpellKeysByParent ?? {};
    const groupedChildAmountByParent = {};
    const mergedAmountBySpell = Object.entries(healingBySpell).reduce((acc, [spellKey, rawAmount]) => {
      const amount = Math.max(0, Number(rawAmount) || 0);
      if (amount <= 0) {
        return acc;
      }
      const normalizedSpellKey = spellKey === "eternalFlameTick" ? "eternalFlame" : spellKey;
      const parentSpellKey = childToParentSpellKey[normalizedSpellKey] ?? "";
      const mergedSpellKey = parentSpellKey || normalizedSpellKey;
      if (parentSpellKey) {
        if (!groupedChildAmountByParent[parentSpellKey]) {
          groupedChildAmountByParent[parentSpellKey] = {};
        }
        groupedChildAmountByParent[parentSpellKey][normalizedSpellKey] =
          Math.max(0, Number(groupedChildAmountByParent[parentSpellKey][normalizedSpellKey] ?? 0)) + amount;
      }
      acc[mergedSpellKey] = Math.max(0, Number(acc[mergedSpellKey] ?? 0)) + amount;
      return acc;
    }, {});
    const groupedChildCastsByParent = {};
    const mergedCastsBySpell = {};
    const castMetrics = currentSnapshot?.metrics?.casts;
    if (castMetrics && typeof castMetrics === "object") {
      for (const [spellKey, rawCasts] of Object.entries(castMetrics)) {
        const casts = Math.max(0, Number(rawCasts) || 0);
        if (casts <= 0) {
          continue;
        }
        const normalizedSpellKey = spellKey === "eternalFlameTick" ? "eternalFlame" : spellKey;
        const parentSpellKey = childToParentSpellKey[normalizedSpellKey] ?? "";
        const mergedSpellKey = parentSpellKey || normalizedSpellKey;
        mergedCastsBySpell[mergedSpellKey] = Math.max(0, Number(mergedCastsBySpell[mergedSpellKey] ?? 0)) + casts;
        if (parentSpellKey) {
          if (!groupedChildCastsByParent[parentSpellKey]) {
            groupedChildCastsByParent[parentSpellKey] = {};
          }
          groupedChildCastsByParent[parentSpellKey][normalizedSpellKey] =
            Math.max(0, Number(groupedChildCastsByParent[parentSpellKey][normalizedSpellKey] ?? 0)) + casts;
        }
      }
    }

    const entries = Object.entries(mergedAmountBySpell).map(([spellKey, amount]) => ({
      spellKey,
      amount: Math.max(0, Number(amount) || 0)
    }));

    if (!entries.length) {
      return [];
    }

    const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);
    if (totalAmount <= 0) {
      return [];
    }

    return entries
      .sort((a, b) => b.amount - a.amount)
      .map((entry) => {
        const meta = healMeterSpellMetaByKey[entry.spellKey] ?? {};
        const fallbackName = practiceSpellsByKey[entry.spellKey]?.name ?? entry.spellKey;
        const castsRaw = Number(mergedCastsBySpell[entry.spellKey]);
        const childSpellKeys = childSpellKeysByParent[entry.spellKey] ?? [];
        const children = childSpellKeys
          .map((childSpellKey) => {
            const amount = Math.max(0, Number(groupedChildAmountByParent?.[entry.spellKey]?.[childSpellKey] ?? 0));
            if (amount <= 0) {
              return null;
            }
            const childMeta = healMeterSpellMetaByKey[childSpellKey] ?? {};
            const childFallbackName = practiceSpellsByKey[childSpellKey]?.name ?? childSpellKey;
            const childCastsRaw = Number(groupedChildCastsByParent?.[entry.spellKey]?.[childSpellKey]);
            return {
              spellKey: childSpellKey,
              spellName: childMeta.name ?? childFallbackName,
              iconUrl: childMeta.iconUrl ?? practiceSpellIconsByKey[childSpellKey] ?? DEFAULT_SPELL_ICON_URL,
              spellId: Number.isFinite(childMeta.spellId) ? Number(childMeta.spellId) : null,
              amount,
              ratioPct: (amount / totalAmount) * 100,
              casts: Number.isFinite(childCastsRaw) ? Math.max(0, Math.round(childCastsRaw)) : null
            };
          })
          .filter(Boolean)
          .sort((left, right) => right.amount - left.amount);
        return {
          spellKey: entry.spellKey,
          spellName: meta.name ?? fallbackName,
          iconUrl: meta.iconUrl ?? practiceSpellIconsByKey[entry.spellKey] ?? DEFAULT_SPELL_ICON_URL,
          spellId: Number.isFinite(meta.spellId) ? Number(meta.spellId) : null,
          amount: entry.amount,
          ratioPct: (entry.amount / totalAmount) * 100,
          casts: Number.isFinite(castsRaw) ? Math.max(0, Math.round(castsRaw)) : null,
          children
        };
      });
  }, [
    currentSnapshot,
    healMeterGrouping,
    healMeterSpellMetaByKey,
    practiceSpellsByKey,
    practiceSpellIconsByKey,
    showPostCombatSummaryPanels
  ]);
  const displayedHealMeterRows = useMemo(() => {
    const rows = [];
    for (const row of healMeterRows) {
      rows.push({
        ...row,
        depth: 0,
        parentSpellKey: ""
      });
      const children = Array.isArray(row.children) ? row.children : [];
      if (!children.length || !expandedHealMeterSpellKeys.has(row.spellKey)) {
        continue;
      }
      for (const child of children) {
        rows.push({
          ...child,
          depth: 1,
          parentSpellKey: row.spellKey
        });
      }
    }
    return rows;
  }, [expandedHealMeterSpellKeys, healMeterRows]);
  const healMeterMaxAmount = useMemo(
    () => displayedHealMeterRows.reduce((max, row) => Math.max(max, Math.max(0, Number(row?.amount ?? 0))), 0),
    [displayedHealMeterRows]
  );
  const handleToggleHealMeterRowExpand = useCallback((spellKey) => {
    const normalizedSpellKey = String(spellKey ?? "").trim();
    if (!normalizedSpellKey) {
      return;
    }
    setExpandedHealMeterSpellKeys((prev) => {
      const next = new Set(prev instanceof Set ? Array.from(prev) : []);
      if (next.has(normalizedSpellKey)) {
        next.delete(normalizedSpellKey);
      } else {
        next.add(normalizedSpellKey);
      }
      return next;
    });
  }, []);
  useEffect(() => {
    const expandableSpellKeySet = new Set(
      healMeterRows
        .filter((row) => Array.isArray(row.children) && row.children.length > 0)
        .map((row) => String(row.spellKey ?? "").trim())
        .filter(Boolean)
    );
    setExpandedHealMeterSpellKeys((prev) => {
      if (!(prev instanceof Set) || prev.size <= 0) {
        return prev instanceof Set ? prev : new Set();
      }
      let hasChange = false;
      const next = new Set();
      for (const spellKey of prev) {
        if (expandableSpellKeySet.has(spellKey)) {
          next.add(spellKey);
        } else {
          hasChange = true;
        }
      }
      if (!hasChange && next.size === prev.size) {
        return prev;
      }
      return next;
    });
  }, [healMeterRows]);
  const sortedEventLogs = useMemo(() => {
    if (!showPostCombatSummaryPanels) {
      return [];
    }
    const logs = Array.isArray(currentSnapshot?.logs) ? [...currentSnapshot.logs] : [];
    return logs.sort((left, right) => {
      const byTime = Number(right?.timeMs ?? 0) - Number(left?.timeMs ?? 0);
      if (byTime !== 0) {
        return byTime;
      }
      return Number(right?.id ?? 0) - Number(left?.id ?? 0);
    });
  }, [currentSnapshot, showPostCombatSummaryPanels]);
  const selfHealRatioPct = useMemo(() => {
    if (!showPostCombatSummaryPanels) {
      return 0;
    }
    const metrics = currentSnapshot?.metrics;
    if (!metrics) {
      return 0;
    }
    const totalHealingDone = Math.max(0, Number(metrics.healingDone ?? 0));
    if (totalHealingDone <= 0) {
      return 0;
    }
    const myPlayer = findMyPlayerInSnapshot(currentSnapshot, selfPlayerIdRef.current);
    if (!myPlayer?.id) {
      return 0;
    }
    const healingByTarget = metrics.healingByTarget;
    if (!healingByTarget || typeof healingByTarget !== "object") {
      return 0;
    }
    const selfHealingDone = Math.max(0, Number(healingByTarget[myPlayer.id] ?? 0));
    return Math.max(0, Math.min(100, (selfHealingDone / totalHealingDone) * 100));
  }, [currentSnapshot, showPostCombatSummaryPanels]);
  const holyPaladinFeedbackLines = useMemo(() => {
    if (!isSuccessfulPracticeResult || activeCombatHealerSlug !== HOLY_PALADIN_HEALER_SLUG) {
      return [];
    }

    const lines = [];
    if (finalCpm < HOLY_PALADIN_FEEDBACK_CPM_MIN) {
      lines.push(`CPM이 낮습니다. (현재 ${finalCpm.toFixed(1)})`);
    }
    if (canvasRawDamageTaken > HOLY_PALADIN_FEEDBACK_SKILL_HIT_DAMAGE_MAX) {
      lines.push(`스킬을 너무 많이 맞았습니다. (스킬 맞은 피해 ${canvasRawDamageTaken.toFixed(1)})`);
    }
    if (selfHealRatioPct > HOLY_PALADIN_FEEDBACK_SELF_HEAL_RATIO_MAX_PCT) {
      lines.push(`자힐 비중이 너무 높습니다. (현재 ${selfHealRatioPct.toFixed(1)}%)`);
    }
    const wastedHolyPower = Math.max(0, Math.round(Number(currentSnapshot?.metrics?.wastedHolyPower ?? 0)));
    if (wastedHolyPower > HOLY_PALADIN_FEEDBACK_WASTED_HOLY_POWER_MAX) {
      lines.push(`신성의 힘이 ${wastedHolyPower}개 낭비되었습니다.`);
    }
    if (finalOverhealingPct > HOLY_PALADIN_FEEDBACK_OVERHEAL_MAX_PCT) {
      lines.push(`오버힐이 너무 많습니다. (현재 ${finalOverhealingPct.toFixed(1)}%)`);
    }
    return lines;
  }, [
    activeCombatHealerSlug,
    canvasRawDamageTaken,
    currentSnapshot,
    finalCpm,
    finalOverhealingPct,
    isSuccessfulPracticeResult,
    selfHealRatioPct
  ]);
  const holyPriestFeedbackLines = useMemo(() => {
    if (!isSuccessfulPracticeResult || activeCombatHealerSlug !== HOLY_PRIEST_HEALER_SLUG) {
      return [];
    }

    const lines = [];
    const metrics = currentSnapshot?.metrics ?? {};
    const rawPrayerOfHealingCasts = Math.max(0, Math.round(Number(metrics.rawPrayerOfHealingCasts ?? 0)));
    const wastedLightweaverStacks = Math.max(0, Math.round(Number(metrics.wastedLightweaverStacks ?? 0)));
    const wastedSurgeOfLightStacks = Math.max(0, Math.round(Number(metrics.wastedSurgeOfLightStacks ?? 0)));
    const effectiveSerenityReductionSec = Math.max(
      0,
      Number(metrics.effectiveSerenityCooldownReductionMs ?? 0) / 1000
    );
    const holyPriestScoreConfig = resolveDifficultyValue(
      HEALER_PRACTICE_SCORE_HEALER_CONFIG_BY_SLUG?.[HOLY_PRIEST_HEALER_SLUG],
      activeDifficultyKey
    );
    const serenityThresholdSec = Math.max(
      0,
      Number(holyPriestScoreConfig?.healerSpecific?.serenityCooldownReduction?.fullScoreAtOrAboveSec ?? 0)
    );
    const serenityThresholdLabel = Number.isInteger(serenityThresholdSec)
      ? `${serenityThresholdSec}`
      : serenityThresholdSec.toFixed(1);

    if (rawPrayerOfHealingCasts > 0) {
      lines.push(`깡 치기 시전수가 높습니다. (권장: 0회, 현재: ${rawPrayerOfHealingCasts}회)`);
    }
    const fadeCasts = Math.max(0, Math.round(Number(metrics.casts?.fade ?? 0)));
    if (fadeCasts <= 3) {
      lines.push("소실 시전 수가 낮습니다.");
    }
    if (wastedLightweaverStacks > 0) {
      lines.push(`빛술사 스택이 ${wastedLightweaverStacks}회 낭비되었습니다.`);
    }
    if (wastedSurgeOfLightStacks > 0) {
      lines.push(`빛의 쇄도 스택이 ${wastedSurgeOfLightStacks}회 낭비되었습니다.`);
    }
    if (finalCpm < 38) {
      lines.push("CPM이 낮습니다. (권장사항: 최소 39)");
    }
    if (serenityThresholdSec > 0 && effectiveSerenityReductionSec <= serenityThresholdSec - 100) {
      lines.push("평온 쿨감 시간이 낮습니다.");
    }
    return lines;
  }, [
    activeCombatHealerSlug,
    activeDifficultyKey,
    activeDifficultyLabel,
    currentSnapshot,
    finalCpm,
    isSuccessfulPracticeResult
  ]);
  const showSuccessBanner =
    Boolean(
      GLOBAL_SUCCESS_ON_TIMEOUT_WITHOUT_GAMEOVER &&
      currentSnapshot?.finished &&
      !running &&
      !gameOverReason &&
      isTimeoutFinishedSnapshot(currentSnapshot)
    );

  const saveCurrentRunRanking = useCallback(async (options = {}) => {
    const force = Boolean(options?.force);
    if (!db || !isLoggedIn || !user?.uid) {
      return false;
    }
    if (!canSaveRankingForCurrentDifficulty || !isSuccessfulPracticeResult) {
      return false;
    }
    if (!currentSnapshot?.finished || !finalScoreBreakdown || !rankingRunKey) {
      return false;
    }
    if (
      !force &&
      (rankingSavedRunKeyRef.current === rankingRunKey || rankingSaveAttemptedRunKeyRef.current === rankingRunKey)
    ) {
      return false;
    }

    const rankingCollection = resolveRankingEntriesCollection(
      activeMapKey,
      activeDifficultyKey,
      rankingCurrentPatchVersion,
      activeCombatHealerSlug
    );
    if (!rankingCollection) {
      return false;
    }
    rankingSaveAttemptedRunKeyRef.current = rankingRunKey;
    setRankingSaveStatus("saving");

    const commonCardsPayload = combatRecordCommonCards.map((card) => ({
      key: String(card.key ?? ""),
      title: String(card.title ?? ""),
      value: String(card.value ?? "")
    }));
    const healerCardsPayload = combatRecordHealerSpecificCards.map((card) => ({
      key: String(card.key ?? ""),
      title: String(card.title ?? ""),
      value: String(card.value ?? "")
    }));
    const meterRowsPayload = healMeterRows.map((row, index) => ({
      order: index + 1,
      spellKey: String(row.spellKey ?? ""),
      spellName: String(row.spellName ?? ""),
      spellId: Number.isFinite(Number(row.spellId)) ? Number(row.spellId) : null,
      amount: Math.max(0, Number(row.amount ?? 0)),
      ratioPct: Math.max(0, Number(row.ratioPct ?? 0)),
      casts: Number.isFinite(Number(row.casts)) ? Math.max(0, Number(row.casts)) : null
    }));
    const createdAtClientMs = Date.now();
    const mapLabel = resolveMapLabel(activeMapKey);
    const difficultyLabel = String(
      resolveDifficultyConfigByKey(activeCombatDifficultyTuning, activeDifficultyKey)?.label ?? activeDifficultyKey
    ).trim();
    const fallbackPlayerLabel = user?.uid ? `유저-${String(user.uid).slice(0, 6)}` : "게스트";
    const playerLabel = String(userLabel ?? "").trim() || fallbackPlayerLabel;
    const totalScore = roundToOneDecimal(Number(finalScoreBreakdown.totalScore ?? 0));

    try {
      await rankingCollection.add({
        authUid: user.uid,
        internalUserId: internalUserId ?? null,
        playerLabel,
        healerSlug: activeCombatHealerSlug,
        difficultyKey: activeDifficultyKey,
        difficultyLabel,
        patchVersion: rankingCurrentPatchVersion,
        mapKey: activeMapKey,
        mapLabel,
        score: totalScore,
        scoreBreakdown: {
          totalScore,
          deathsScore: roundToOneDecimal(Number(finalScoreBreakdown.deathsScore ?? 0)),
          overhealingScore: roundToOneDecimal(Number(finalScoreBreakdown.overhealingScore ?? 0)),
          averageRaidHealthScore: roundToOneDecimal(Number(finalScoreBreakdown.averageRaidHealthScore ?? 0)),
          remainingManaScore: roundToOneDecimal(Number(finalScoreBreakdown.remainingManaScore ?? 0)),
          cpmScore: roundToOneDecimal(Number(finalScoreBreakdown.cpmScore ?? 0)),
          selfHealScore: roundToOneDecimal(Number(finalScoreBreakdown.selfHealScore ?? 0)),
          healerSpecificScore: roundToOneDecimal(Number(finalScoreBreakdown.healerSpecificScore ?? 0))
        },
        combatRecordSection: {
          commonCards: commonCardsPayload,
          healerSpecificCards: healerCardsPayload
        },
        meterSection: {
          rows: meterRowsPayload,
          summary: {
            cpm: roundToOneDecimal(finalCpm),
            selfHealRatioPct: roundToOneDecimal(selfHealRatioPct),
            skillHitDamage: roundToOneDecimal(canvasRawDamageTaken),
            damageRecoverySharePct: roundToOneDecimal(canvasDamageHealingSharePct)
          }
        },
        runMeta: {
          runKey: rankingRunKey,
          patchVersion: rankingCurrentPatchVersion,
          setupSeed: Number.isFinite(Number(sessionConfig?.seed)) ? Math.floor(Number(sessionConfig.seed)) : null,
          durationMs: Math.max(0, Number(currentSnapshot?.durationMs ?? 0)),
          finishedMs: Math.max(0, Number(currentSnapshot?.nowMs ?? 0))
        },
        createdAtClientMs,
        createdAt: serverTimestamp()
      });
      rankingSavedRunKeyRef.current = rankingRunKey;
      setRankingSaveStatus("saved");
      return true;
    } catch {
      // 동일 전투에서 자동 저장 무한 루프를 피하기 위해 attempted 키는 유지합니다.
      setRankingSaveStatus("error");
      return false;
    }
  }, [
    activeCombatHealerSlug,
    activeDifficultyKey,
    activeMapKey,
    canSaveRankingForCurrentDifficulty,
    canvasDamageHealingSharePct,
    canvasRawDamageTaken,
    combatRecordCommonCards,
    combatRecordHealerSpecificCards,
    currentSnapshot,
    finalCpm,
    finalScoreBreakdown,
    healMeterRows,
    internalUserId,
    isLoggedIn,
    isSuccessfulPracticeResult,
    rankingRunKey,
    rankingCurrentPatchVersion,
    selfHealRatioPct,
    sessionConfig,
    user,
    userLabel
  ]);

  const showRankingRegisterControl = isSuccessfulPracticeResult && canSaveRankingForCurrentDifficulty;
  const rankingSaveButtonLabel =
    rankingSaveStatus === "saved"
      ? "랭킹 등록 완료"
      : rankingSaveStatus === "saving"
        ? "랭킹 등록 중..."
        : rankingSaveStatus === "error"
          ? "랭킹 재등록"
          : "랭킹 등록";
  const rankingSelectedHealerOption = rankingHealerTabOptions.find(
    (entry) => entry.slug === rankingViewHealerSlug
  );
  const rankingSelectedHealerLabel = rankingSelectedHealerOption?.shortName ?? rankingViewHealerSlug;

  useEffect(() => {
    if (!rankingHealerTabOptions.length) {
      return;
    }
    if (rankingHealerTabOptions.some((entry) => entry.slug === rankingViewHealerSlug && entry.enabled)) {
      return;
    }
    const firstEnabledHealer = rankingHealerTabOptions.find((entry) => entry.enabled);
    if (firstEnabledHealer) {
      setRankingViewHealerSlug(firstEnabledHealer.slug);
      return;
    }
    setRankingViewHealerSlug(rankingHealerTabOptions[0].slug);
  }, [rankingHealerTabOptions, rankingViewHealerSlug]);

  useEffect(() => {
    if (!rankingDifficultyTabKeys.length) {
      return;
    }
    if (rankingDifficultyTabKeys.includes(rankingViewDifficultyKey)) {
      return;
    }
    setRankingViewDifficultyKey(rankingDifficultyTabKeys[0]);
  }, [rankingDifficultyTabKeys, rankingViewDifficultyKey]);

  useEffect(() => {
    if (!rankingPatchVersionOptions.length) {
      return;
    }
    if (rankingPatchVersionOptions.includes(rankingViewPatchVersion)) {
      return;
    }
    setRankingViewPatchVersion(rankingCurrentPatchVersion);
  }, [rankingCurrentPatchVersion, rankingPatchVersionOptions, rankingViewPatchVersion]);

  useEffect(() => {
    if (!rankingModalOpen) {
      return;
    }

    const rankingCollection = resolveRankingEntriesCollection(
      rankingViewMapKey,
      rankingViewDifficultyKey,
      rankingViewPatchVersion,
      rankingViewHealerSlug
    );
    if (!rankingCollection) {
      setRankingRows([]);
      setRankingErrorText("랭킹 저장소에 접근할 수 없습니다.");
      setRankingLoading(false);
      return;
    }

    let cancelled = false;
    setRankingLoading(true);
    setRankingErrorText("");

    rankingCollection
      .orderBy("score", "desc")
      .limit(RANKING_FETCH_LIMIT)
      .get()
      .then((querySnapshot) => {
        if (cancelled) {
          return;
        }
        const normalizedRows = querySnapshot.docs
          .map((docSnapshot) => {
            const data = docSnapshot.data() ?? {};
            const scoreValue = Number(data.score ?? data.totalScore ?? 0);
            const score = Number.isFinite(scoreValue) ? scoreValue : 0;
            const nickname = String(
              data.playerLabel ??
              data.nickname ??
              data.userLabel ??
              data.displayName ??
              "익명"
            ).trim();
            const createdAtMs = toMillisFromUnknownTimestamp(
              data.createdAt ?? data.createdAtClientMs ?? data.createdAtMs
            );
            const internalUserIdValue = String(data.internalUserId ?? "").trim();
            const authUidValue = String(data.authUid ?? "").trim();
            const identityKey = internalUserIdValue || authUidValue || `nickname:${nickname || "익명"}`;
            return {
              id: docSnapshot.id,
              identityKey,
              nickname: nickname || "익명",
              score,
              createdAtMs
            };
          })
          .sort((left, right) => {
            const byScore = right.score - left.score;
            if (byScore !== 0) {
              return byScore;
            }
            const leftTime = Number(left.createdAtMs || 0);
            const rightTime = Number(right.createdAtMs || 0);
            if (leftTime !== rightTime) {
              return leftTime - rightTime;
            }
            return left.nickname.localeCompare(right.nickname, "ko");
          });

        const identitySet = new Set();
        const deduplicatedRows = normalizedRows.filter((row) => {
          if (identitySet.has(row.identityKey)) {
            return false;
          }
          identitySet.add(row.identityKey);
          return true;
        });

        setRankingRows(deduplicatedRows);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setRankingRows([]);
        setRankingErrorText("랭킹을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (cancelled) {
          return;
        }
        setRankingLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [rankingModalOpen, rankingViewDifficultyKey, rankingViewHealerSlug, rankingViewMapKey, rankingViewPatchVersion]);

  useEffect(() => {
    if (!rankingModalOpen || typeof window === "undefined") {
      return undefined;
    }
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setRankingModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [rankingModalOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const handleOpenRankingEvent = () => {
      handleOpenRankingModal();
    };
    window.addEventListener(HEALER_PRACTICE_OPEN_RANKING_EVENT, handleOpenRankingEvent);
    return () => {
      window.removeEventListener(HEALER_PRACTICE_OPEN_RANKING_EVENT, handleOpenRankingEvent);
    };
  }, [activeCombatHealerSlug, activeDifficultyKey, activeMapKey, rankingCurrentPatchVersion, selectedHealerSlug]);

  useEffect(() => {
    if (!hasCombatSnapshot || !displayedHealMeterRows.length) {
      return;
    }
    refreshWowheadTooltips();
  }, [displayedHealMeterRows.length, hasCombatSnapshot]);

  useEffect(() => {
    if (!hasCombatSnapshot) {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
      if (phaserHostRef.current) {
        phaserHostRef.current.innerHTML = "";
      }
      pointerInPhaserCanvasRef.current = false;
      return;
    }

    const host = phaserHostRef.current;
    if (!host) {
      return;
    }

    if (phaserGameRef.current) {
      phaserGameRef.current.destroy(true);
      phaserGameRef.current = null;
    }
    host.innerHTML = "";

    const phaserDifficultyConfig = activePhaserDifficultyConfig;
    const showPlayerHealthBar = Boolean(phaserDifficultyConfig.showPlayerHealthBar);
    const hazardEnabled = Boolean(phaserDifficultyConfig.hazardEnabled);
    const missileEnabled = Boolean(phaserDifficultyConfig.missileEnabled);
    const playerMaxHealth = Math.max(1, Number(phaserDifficultyConfig.playerMaxHealth ?? 100));
    const hazardDamage = Math.max(0, Number(phaserDifficultyConfig.hazardDamage ?? 0));
    const hazardBarWidthPx = Math.max(8, Number(phaserDifficultyConfig.hazardBarWidthPx ?? 20));
    const hazardBarLengthPx = Math.max(
      Math.max(raidGridWidthPx, raidGridHeightPx) + 60,
      Number(phaserDifficultyConfig.hazardBarLengthPx ?? Math.max(raidGridWidthPx, raidGridHeightPx) * 1.2)
    );
    const mechanicsStartDelayMs = Math.max(0, Number(PHASER_ARENA_VISUAL_CONFIG.mechanicsStartDelayMs ?? 5000));
    const hazardCountdownMs = Math.max(500, Number(PHASER_ARENA_VISUAL_CONFIG.hazardCountdownMs));
    const hazardSpawnMinMs = Math.max(350, Number(phaserDifficultyConfig.hazardSpawnIntervalMinMs ?? 3000));
    const hazardSpawnMaxMs = Math.max(hazardSpawnMinMs, Number(phaserDifficultyConfig.hazardSpawnIntervalMaxMs ?? hazardSpawnMinMs));
    const missileDamage = Math.max(0, Number(phaserDifficultyConfig.missileDamage ?? 0));
    const missileSpawnMinMs = Math.max(300, Number(phaserDifficultyConfig.missileSpawnIntervalMinMs ?? 1000));
    const missileSpawnMaxMs = Math.max(missileSpawnMinMs, Number(phaserDifficultyConfig.missileSpawnIntervalMaxMs ?? missileSpawnMinMs));
    const missileSpeedPerSec = Math.max(80, Number(phaserDifficultyConfig.missileSpeedPerSec ?? 280));
    const missileWidthPx = Math.max(8, Number(PHASER_ARENA_VISUAL_CONFIG.missileWidthPx ?? 28));
    const missileHeightPx = Math.max(6, Number(PHASER_ARENA_VISUAL_CONFIG.missileHeightPx ?? 12));
    const missileCollisionRadiusPx = Math.max(6, Number(PHASER_ARENA_VISUAL_CONFIG.missileCollisionRadiusPx ?? 10));
    const hazardTargetJitterPx = Math.max(0, Number(PHASER_ARENA_VISUAL_CONFIG.hazardTargetJitterPx ?? 12));
    const missileTargetJitterPx = Math.max(0, Number(PHASER_ARENA_VISUAL_CONFIG.missileTargetJitterPx ?? 10));
    const arenaGridCellSizePx = 28;
    const greenGridZonePatternEnabled = Boolean(phaserDifficultyConfig.greenGridZonePatternEnabled);
    const greenGridZonePatternSpawnMinMs = Math.max(
      1500,
      Number(phaserDifficultyConfig.greenGridZonePatternSpawnIntervalMinMs ?? 18000)
    );
    const greenGridZonePatternSpawnMaxMs = Math.max(
      greenGridZonePatternSpawnMinMs,
      Number(phaserDifficultyConfig.greenGridZonePatternSpawnIntervalMaxMs ?? greenGridZonePatternSpawnMinMs)
    );
    const greenGridZonePatternSizeCells = Math.max(
      2,
      Math.floor(Number(phaserDifficultyConfig.greenGridZonePatternSizeCells ?? 4))
    );
    const greenGridZonePatternSizePx = greenGridZonePatternSizeCells * arenaGridCellSizePx;
    const greenGridZonePatternCountdownSec = Math.max(
      1,
      Number(phaserDifficultyConfig.greenGridZonePatternCountdownSec ?? 10)
    );
    const greenGridZonePatternDurationMs = greenGridZonePatternCountdownSec * 1000;
    const greenGridZonePatternMissDamage = Math.max(
      0,
      Number(phaserDifficultyConfig.greenGridZonePatternMissDamage ?? 60)
    );
    const greenGridZonePatternInstructionText =
      String(phaserDifficultyConfig.greenGridZonePatternInstructionText ?? "초록 구역으로 이동").trim() ||
      "초록 구역으로 이동";
    const movementKeyLetters = activeMovementKeys;
    const restorationDruidTreeantVisualEnabled = activeCombatHealerSlug === RESTORATION_DRUID_HEALER_SLUG;
    const worldFirstZonePatternEnabled = Boolean(phaserDifficultyConfig.worldFirstKillZonePatternEnabled);
    const worldFirstZonePatternStartTimesMs = Array.from(
      new Set(
        (Array.isArray(phaserDifficultyConfig.worldFirstKillZonePatternStartTimesSec)
          ? phaserDifficultyConfig.worldFirstKillZonePatternStartTimesSec
          : []
        )
          .map((startAtSec) => Math.floor(Number(startAtSec) * 1000))
          .filter((startAtMs) => Number.isFinite(startAtMs) && startAtMs >= 0)
      )
    ).sort((left, right) => left - right);
    const worldFirstZonePatternActiveMs = Math.max(
      3000,
      Number(phaserDifficultyConfig.worldFirstKillZonePatternActiveMs ?? 9000)
    );
    const worldFirstZonePatternStepDurationMs = Math.max(
      500,
      Number(phaserDifficultyConfig.worldFirstKillZonePatternStepDurationMs ?? 3000)
    );
    const worldFirstZonePatternResolvedActiveMs = Math.max(
      worldFirstZonePatternStepDurationMs,
      Math.round(worldFirstZonePatternActiveMs / worldFirstZonePatternStepDurationMs) * worldFirstZonePatternStepDurationMs
    );
    const worldFirstZoneGreenGridBlockWindowMs = 10000;
    const worldFirstZonePatternStripeCount = Math.max(
      2,
      Math.floor(Number(phaserDifficultyConfig.worldFirstKillZonePatternStripeCount ?? 20))
    );
    const worldFirstZonePatternDangerColorHex = Number(
      phaserDifficultyConfig.worldFirstKillZonePatternDangerColorHex ?? 0xdc2626
    );
    const worldFirstZonePatternDangerAlpha = Math.max(
      0.08,
      Math.min(0.95, Number(phaserDifficultyConfig.worldFirstKillZonePatternDangerAlpha ?? 0.4))
    );
    const worldFirstZonePatternStepDamage = Math.max(
      0,
      Number(phaserDifficultyConfig.worldFirstKillZonePatternStepDamage ?? 0)
    );
    const worldFirstZonePatternStepInstantKill = Boolean(phaserDifficultyConfig.worldFirstKillZonePatternStepInstantKill);
    const worldFirstZonePatternLabel = worldFirstZonePatternStepInstantKill ? "즉사 바닥" : "위험 바닥";
    const worldFirstZoneHazardSpawnMinMs = Math.max(
      120,
      Number(phaserDifficultyConfig.worldFirstKillZoneHazardSpawnIntervalMinMs ?? hazardSpawnMinMs)
    );
    const worldFirstZoneHazardSpawnMaxMs = Math.max(
      worldFirstZoneHazardSpawnMinMs,
      Number(phaserDifficultyConfig.worldFirstKillZoneHazardSpawnIntervalMaxMs ?? worldFirstZoneHazardSpawnMinMs)
    );
    const worldFirstZoneHazardTargetedChance = Math.max(
      0,
      Math.min(1, Number(phaserDifficultyConfig.worldFirstKillZoneHazardTargetedChance ?? 0.6))
    );
    const worldFirstZoneHazardRandomCountWhenUntargeted = Math.max(
      0,
      Math.floor(Number(phaserDifficultyConfig.worldFirstKillZoneHazardRandomCountWhenUntargeted ?? 3))
    );
    const activeCombatDifficultyConfig = resolveDifficultyConfigByKey(activeCombatDifficultyTuning, activeDifficultyKey);
    const scheduledRaidBurstStartTimesMs = Array.from(
      new Set(
        (Array.isArray(activeCombatDifficultyConfig?.scheduledRaidBursts)
          ? activeCombatDifficultyConfig.scheduledRaidBursts
          : []
        )
          .filter((pattern) => pattern && pattern.enabled !== false)
          .map((pattern) => {
            const startAtMsRaw = Number(pattern.startAtMs);
            const startAtSecRaw = Number(pattern.startAtSec);
            const resolvedStartAtMs = Number.isFinite(startAtMsRaw)
              ? startAtMsRaw
              : Number.isFinite(startAtSecRaw)
                ? startAtSecRaw * 1000
                : 0;
            return Math.max(0, Math.floor(resolvedStartAtMs));
          })
      )
    ).sort((left, right) => left - right);
    const raidBurstCountdownWindowMs = 10000;
    const playerHitCryFaceDurationMs = 1500;
    const holyPriestPrayerOfHealingPulseDurationMs = Math.max(
      1000,
      1500 /
      Math.max(
        0.01,
        1 + Math.max(0, Number(HOLY_PRIEST_DEFAULT_STATS.hastePct ?? 0)) / 100
      )
    );
    const holyPaladinLightOfDawnGlowDurationMs = 400;
    const holyPaladinLightOfDawnFollowupDelayMs = 200;

    const initialPlayerHpRatio = Math.max(0, Math.min(1, Number(phaserSelfHpRatioRef.current ?? 1)));
    let player = null;
    let playerHealth = playerMaxHealth * initialPlayerHpRatio;
    let healthBarBg = null;
    let healthBarFill = null;
    let healthBarText = null;
    let combatTimeText = null;
    let raidBurstCountdownText = null;
    let playerStatusText = null;
    let playerLeftEye = null;
    let playerRightEye = null;
    let playerLeftTear = null;
    let playerRightTear = null;
    let playerMouth = null;
    let infusionLeftArc = null;
    let infusionRightArc = null;
    let divinePurposeArc = null;
    let divineImageAvatarVisual = null;
    let haloPulseVisuals = [];
    let lastProcessedHaloPulseLogId = 0;
    let lightOfDawnGlowVisuals = [];
    let lastLightOfDawnCastCount = 0;
    let prayerOfHealingGcdPulseVisuals = [];
    let lastPrayerOfHealingCastCount = 0;
    let lastHolyPaladinFlashOfLightCastCount = 0;
    let lastHolyPaladinHolyLightCastCount = 0;
    let lastHolyPaladinHolyShockCastCount = 0;
    let lastHolyPaladinDivineTollCastCount = 0;
    let lastHolyPaladinLightOfDawnCastCount = 0;
    let holyPriestPrayerOfHealingCastAudio = null;
    let holyPaladinSpellCastAudioByKey = {
      flashOfLightAndHolyLight: null,
      holyShock: null,
      divineToll: null,
      lightOfDawn: null
    };
    let treeOfLifeAvatarVisual = null;
    let treeantVisuals = [];
    let recentHitUntilMs = 0;
    let nextHazardSpawnAtMs = Number.POSITIVE_INFINITY;
    let nextMissileSpawnAtMs = Number.POSITIVE_INFINITY;
    let nextGreenGridZoneSpawnAtMs = Number.POSITIVE_INFINITY;
    let worldFirstZoneOverlays = [];
    let worldFirstZoneStatusText = null;
    let greenGridZoneInstructionText = null;
    let greenGridZoneCountdownText = null;
    let greenGridZonePattern = null;
    let worldFirstZoneCurrentMask = [];
    let worldFirstZoneOrder = [];
    let worldFirstZoneVariants = [];
    let worldFirstZoneActive = false;
    let worldFirstZoneNextScheduledStartIndex = 0;
    let worldFirstZoneCurrentStepIndex = -1;
    let worldFirstZoneCurrentStepStartAtMs = Number.POSITIVE_INFINITY;
    let worldFirstZoneCurrentStepEndAtMs = Number.POSITIVE_INFINITY;
    let hazards = [];
    let missiles = [];
    let playerDeathNotified = false;
    let mechanicsScheduleInitialized = false;
    let sceneStartAtMs = 0;

    const randomBetween = (min, max) => min + Math.random() * (max - min);
    const clampPlayerHpRatio = (value) => Math.max(0, Math.min(1, Number(value) || 0));
    const syncSharedPlayerHpRatio = () => {
      phaserSelfHpRatioRef.current = clampPlayerHpRatio(playerHealth / playerMaxHealth);
    };
    const syncPlayerHealthFromSharedRatio = () => {
      const nextHealth = playerMaxHealth * clampPlayerHpRatio(phaserSelfHpRatioRef.current);
      if (Math.abs(nextHealth - playerHealth) < 0.05) {
        return;
      }
      playerHealth = nextHealth;
    };
    const addCanvasRawDamage = (amount) => {
      const safeAmount = Math.max(0, Number(amount) || 0);
      if (safeAmount <= 0) {
        return;
      }
      const nextAmount = Math.round((canvasRawDamageTakenRef.current + safeAmount) * 10) / 10;
      canvasRawDamageTakenRef.current = nextAmount;
      setCanvasRawDamageTaken(nextAmount);
    };
    const addCanvasHitCount = (patternKey) => {
      const key = String(patternKey ?? "").trim();
      if (!key || !Object.prototype.hasOwnProperty.call(canvasHitCountsRef.current, key)) {
        return;
      }
      const nextHitCounts = {
        ...canvasHitCountsRef.current,
        [key]: Math.max(0, Number(canvasHitCountsRef.current[key] ?? 0) + 1)
      };
      canvasHitCountsRef.current = nextHitCounts;
      setCanvasHitCounts(nextHitCounts);
    };
    const forceRaidFrameSelfDeathFromCanvas = () => {
      const engine = engineRef.current;
      if (!engine || engine.finished) {
        return;
      }
      let selfPlayerId = String(selfPlayerIdRef.current ?? "").trim();
      if (!selfPlayerId) {
        const snapshotMyPlayer = findMyPlayerInSnapshot(latestSnapshotRef.current);
        if (snapshotMyPlayer?.id) {
          selfPlayerId = snapshotMyPlayer.id;
          selfPlayerIdRef.current = selfPlayerId;
        }
      }
      if (!selfPlayerId) {
        return;
      }
      engine.setExternalPlayerHpRatio(selfPlayerId, 0);
      const syncedSnapshot = engine.getSnapshot();
      latestSnapshotRef.current = syncedSnapshot;
      setSnapshot(syncedSnapshot);
    };
    const blendColorHex = (fromColorHex, toColorHex, ratio) => {
      const clamped = Math.max(0, Math.min(1, ratio));
      const fromR = (fromColorHex >> 16) & 0xff;
      const fromG = (fromColorHex >> 8) & 0xff;
      const fromB = fromColorHex & 0xff;
      const toR = (toColorHex >> 16) & 0xff;
      const toG = (toColorHex >> 8) & 0xff;
      const toB = toColorHex & 0xff;
      const r = Math.round(fromR + (toR - fromR) * clamped);
      const g = Math.round(fromG + (toG - fromG) * clamped);
      const b = Math.round(fromB + (toB - fromB) * clamped);
      return (r << 16) | (g << 8) | b;
    };
    const formatHazardCountdownLabel = (remainingMs) => {
      const steppedSeconds = Math.max(0.5, Math.ceil(Math.max(0, remainingMs) / 500) * 0.5);
      return steppedSeconds.toFixed(1);
    };
    const formatGreenGridZoneFloorCountdownLabel = (remainingMs) =>
      `${Math.max(0, Math.ceil(Math.max(0, remainingMs) / 1000))}초`;
    const resolveWorldFirstZoneLabelCenter = (mask) => {
      const stripeWidthPx = raidGridWidthPx / worldFirstZonePatternStripeCount;
      let bestStart = -1;
      let bestLen = 0;
      let index = 0;

      while (index < mask.length) {
        if (!mask[index]) {
          index += 1;
          continue;
        }
        const start = index;
        while (index < mask.length && mask[index]) {
          index += 1;
        }
        const runLen = index - start;
        if (runLen > bestLen) {
          bestLen = runLen;
          bestStart = start;
        }
      }

      if (bestStart < 0 || bestLen <= 0) {
        return { x: raidGridWidthPx / 2, y: raidGridHeightPx / 2 };
      }

      const firstCenterX = stripeWidthPx * bestStart + stripeWidthPx / 2;
      const lastCenterX = stripeWidthPx * (bestStart + bestLen - 1) + stripeWidthPx / 2;
      return {
        x: (firstCenterX + lastCenterX) / 2,
        y: raidGridHeightPx / 2
      };
    };
    const getInfusionOfLightRemainingMs = () =>
      Math.max(0, Number(latestSnapshotRef.current?.buffs?.infusionOfLightMs ?? 0));
    const getInfusionOfLightCharges = () =>
      Math.max(0, Math.floor(Number(latestSnapshotRef.current?.buffs?.infusionOfLightCharges ?? 0)));
    const getHolyPaladinDivinePurposeRemainingMs = () =>
      Math.max(0, Number(latestSnapshotRef.current?.buffs?.divinePurposeMs ?? 0));
    const getHolyPriestSurgeOfLightRemainingMs = () =>
      Math.max(0, Number(latestSnapshotRef.current?.buffs?.surgeOfLightMs ?? 0));
    const getHolyPriestSurgeOfLightStacks = () =>
      Math.max(0, Math.floor(Number(latestSnapshotRef.current?.buffs?.surgeOfLightStacks ?? 0)));
    const getHolyPriestDivineImageRemainingMs = () =>
      Math.max(0, Number(latestSnapshotRef.current?.buffs?.divineImageMs ?? 0));
    const getHolyPriestDivineImageStacks = () =>
      Math.max(0, Math.floor(Number(latestSnapshotRef.current?.buffs?.divineImageStacks ?? 0)));
    const getDivineProtectionRemainingMs = () =>
      Math.max(0, Number(latestSnapshotRef.current?.buffs?.divineProtectionMs ?? 0));
    const getTreeOfLifeRemainingMs = () =>
      Math.max(0, Number(latestSnapshotRef.current?.buffs?.treeOfLifeMs ?? 0));
    const getHolyPaladinSpellCastSfxConfig = (spellSoundKey) => {
      switch (spellSoundKey) {
        case "flashOfLightAndHolyLight":
          return {
            enabled: HOLY_PALADIN_SOUND_CONFIG.flashOfLightAndHolyLightCastSfxEnabled !== false,
            src: String(HOLY_PALADIN_SOUND_CONFIG.flashOfLightAndHolyLightCastSfxSrc ?? "").trim(),
            volume: Math.max(0, Math.min(1, Number(HOLY_PALADIN_SOUND_CONFIG.flashOfLightAndHolyLightCastSfxVolume ?? 0.03)))
          };
        case "holyShock":
          return {
            enabled: HOLY_PALADIN_SOUND_CONFIG.holyShockCastSfxEnabled !== false,
            src: String(HOLY_PALADIN_SOUND_CONFIG.holyShockCastSfxSrc ?? "").trim(),
            volume: Math.max(0, Math.min(1, Number(HOLY_PALADIN_SOUND_CONFIG.holyShockCastSfxVolume ?? 0.03)))
          };
        case "divineToll":
          return {
            enabled: HOLY_PALADIN_SOUND_CONFIG.divineTollCastSfxEnabled !== false,
            src: String(HOLY_PALADIN_SOUND_CONFIG.divineTollCastSfxSrc ?? "").trim(),
            volume: Math.max(0, Math.min(1, Number(HOLY_PALADIN_SOUND_CONFIG.divineTollCastSfxVolume ?? 0.03)))
          };
        case "lightOfDawn":
          return {
            enabled: HOLY_PALADIN_SOUND_CONFIG.lightOfDawnCastSfxEnabled !== false,
            src: String(HOLY_PALADIN_SOUND_CONFIG.lightOfDawnCastSfxSrc ?? "").trim(),
            volume: Math.max(0, Math.min(1, Number(HOLY_PALADIN_SOUND_CONFIG.lightOfDawnCastSfxVolume ?? 0.03)))
          };
        default:
          return {
            enabled: false,
            src: "",
            volume: 0
          };
      }
    };
    const ensureHolyPaladinSpellCastAudio = (spellSoundKey) => {
      if (holyPaladinSpellCastAudioByKey[spellSoundKey]) {
        return holyPaladinSpellCastAudioByKey[spellSoundKey];
      }
      const sfxConfig = getHolyPaladinSpellCastSfxConfig(spellSoundKey);
      if (!sfxConfig.enabled || !sfxConfig.src || typeof Audio === "undefined") {
        return null;
      }
      try {
        const audio = new Audio(sfxConfig.src);
        audio.preload = "auto";
        audio.volume = sfxConfig.volume;
        audio.load();
        holyPaladinSpellCastAudioByKey[spellSoundKey] = audio;
        return audio;
      } catch (_error) {
        // Ignore audio creation failures and keep simulator running silently.
        return null;
      }
    };
    const playHolyPaladinSpellCastSfx = (spellSoundKey) => {
      if (activeCombatHealerSlug !== HOLY_PALADIN_HEALER_SLUG) {
        return;
      }
      const sfxConfig = getHolyPaladinSpellCastSfxConfig(spellSoundKey);
      if (!sfxConfig.enabled) {
        return;
      }
      const audio = ensureHolyPaladinSpellCastAudio(spellSoundKey);
      if (!audio) {
        return;
      }
      try {
        audio.volume = sfxConfig.volume;
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => { });
        }
      } catch (_error) {
        // Ignore play interruption errors (autoplay policy, tab focus changes, etc).
      }
    };
    const syncHolyPaladinCastSfxEvents = () => {
      const snapshot = latestSnapshotRef.current;
      if (activeCombatHealerSlug !== HOLY_PALADIN_HEALER_SLUG || !snapshot) {
        lastHolyPaladinFlashOfLightCastCount = 0;
        lastHolyPaladinHolyLightCastCount = 0;
        lastHolyPaladinHolyShockCastCount = 0;
        lastHolyPaladinDivineTollCastCount = 0;
        lastHolyPaladinLightOfDawnCastCount = 0;
        return;
      }

      const totalFlashOfLightCasts = Math.max(0, Math.round(Number(snapshot?.metrics?.casts?.flashOfLight ?? 0)));
      const totalHolyLightCasts = Math.max(0, Math.round(Number(snapshot?.metrics?.casts?.holyLight ?? 0)));
      const totalHolyShockCasts = Math.max(0, Math.round(Number(snapshot?.metrics?.casts?.holyShock ?? 0)));
      const totalDivineTollCasts = Math.max(0, Math.round(Number(snapshot?.metrics?.casts?.divineToll ?? 0)));
      const totalLightOfDawnCasts = Math.max(0, Math.round(Number(snapshot?.metrics?.casts?.lightOfDawn ?? 0)));

      for (let castIndex = lastHolyPaladinFlashOfLightCastCount; castIndex < totalFlashOfLightCasts; castIndex += 1) {
        playHolyPaladinSpellCastSfx("flashOfLightAndHolyLight");
      }
      for (let castIndex = lastHolyPaladinHolyLightCastCount; castIndex < totalHolyLightCasts; castIndex += 1) {
        playHolyPaladinSpellCastSfx("flashOfLightAndHolyLight");
      }
      for (let castIndex = lastHolyPaladinHolyShockCastCount; castIndex < totalHolyShockCasts; castIndex += 1) {
        playHolyPaladinSpellCastSfx("holyShock");
      }
      for (let castIndex = lastHolyPaladinDivineTollCastCount; castIndex < totalDivineTollCasts; castIndex += 1) {
        playHolyPaladinSpellCastSfx("divineToll");
      }
      for (let castIndex = lastHolyPaladinLightOfDawnCastCount; castIndex < totalLightOfDawnCasts; castIndex += 1) {
        playHolyPaladinSpellCastSfx("lightOfDawn");
      }

      lastHolyPaladinFlashOfLightCastCount = totalFlashOfLightCasts;
      lastHolyPaladinHolyLightCastCount = totalHolyLightCasts;
      lastHolyPaladinHolyShockCastCount = totalHolyShockCasts;
      lastHolyPaladinDivineTollCastCount = totalDivineTollCasts;
      lastHolyPaladinLightOfDawnCastCount = totalLightOfDawnCasts;
    };
    const getHolyPriestPrayerOfHealingCastSfxVolume = () =>
      Math.max(0, Math.min(1, Number(HOLY_PRIEST_SOUND_CONFIG.prayerOfHealingCastSfxVolume ?? 0.45)));
    const ensureHolyPriestPrayerOfHealingCastAudio = () => {
      if (holyPriestPrayerOfHealingCastAudio) {
        return holyPriestPrayerOfHealingCastAudio;
      }
      const sfxEnabled = HOLY_PRIEST_SOUND_CONFIG.prayerOfHealingCastSfxEnabled !== false;
      const sfxSrc = String(HOLY_PRIEST_SOUND_CONFIG.prayerOfHealingCastSfxSrc ?? "").trim();
      if (!sfxEnabled || !sfxSrc || typeof Audio === "undefined") {
        return null;
      }
      try {
        const audio = new Audio(sfxSrc);
        audio.preload = "auto";
        audio.volume = getHolyPriestPrayerOfHealingCastSfxVolume();
        audio.load();
        holyPriestPrayerOfHealingCastAudio = audio;
        return audio;
      } catch (_error) {
        // Ignore audio creation failures and keep simulator running silently.
        return null;
      }
    };
    const playHolyPriestPrayerOfHealingCastSfx = () => {
      if (activeCombatHealerSlug !== HOLY_PRIEST_HEALER_SLUG) {
        return;
      }
      if (HOLY_PRIEST_SOUND_CONFIG.prayerOfHealingCastSfxEnabled === false) {
        return;
      }
      const audio = ensureHolyPriestPrayerOfHealingCastAudio();
      if (!audio) {
        return;
      }
      try {
        audio.volume = getHolyPriestPrayerOfHealingCastSfxVolume();
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => { });
        }
      } catch (_error) {
        // Ignore play interruption errors (autoplay policy, tab focus changes, etc).
      }
    };
    const destroyHaloPulseVisual = (haloVisual) => {
      haloVisual?.graphics?.destroy();
    };
    const clearHaloPulseVisuals = () => {
      haloPulseVisuals.forEach(destroyHaloPulseVisual);
      haloPulseVisuals = [];
    };
    const destroyLightOfDawnGlowVisual = (visual) => {
      visual?.graphics?.destroy();
    };
    const clearLightOfDawnGlowVisuals = () => {
      lightOfDawnGlowVisuals.forEach(destroyLightOfDawnGlowVisual);
      lightOfDawnGlowVisuals = [];
    };
    const destroyPrayerOfHealingGcdPulseVisual = (visual) => {
      visual?.graphics?.destroy();
    };
    const clearPrayerOfHealingGcdPulseVisuals = () => {
      prayerOfHealingGcdPulseVisuals.forEach(destroyPrayerOfHealingGcdPulseVisual);
      prayerOfHealingGcdPulseVisuals = [];
    };
    const destroyTreeantVisual = (treeantVisual) => {
      treeantVisual?.container?.destroy(true);
    };
    const destroyTreeOfLifeAvatarVisual = (visual) => {
      visual?.container?.destroy(true);
    };
    const createTreeOfLifeAvatarVisual = (sceneRef) => {
      const trunkWidth = Math.max(6, Math.round(PHASER_ARENA_VISUAL_CONFIG.playerSizePx * 0.36));
      const trunkHeight = Math.max(4, Math.round(PHASER_ARENA_VISUAL_CONFIG.playerSizePx * 0.24));
      const trunk = sceneRef.add.rectangle(0, 0, trunkWidth, trunkHeight, 0x8b5a2b, 0.98);
      trunk.setStrokeStyle(1, 0x5b3419, 0.9);

      const container = sceneRef.add.container(0, 0, [trunk]);
      container.setDepth(4.05);
      container.setVisible(false);
      return { container };
    };
    const updateTreeOfLifeAvatarVisual = (nowMs = 0) => {
      if (!player || !treeOfLifeAvatarVisual?.container) {
        return;
      }

      const treeOfLifeActive =
        restorationDruidTreeantVisualEnabled && playerHealth > 0 && getTreeOfLifeRemainingMs() > 0;
      treeOfLifeAvatarVisual.container.setVisible(treeOfLifeActive);
      if (!treeOfLifeActive) {
        if (!playerDeathNotified && playerHealth > 0) {
          player.setFillStyle(selectedHealerColorHex, 1);
          player.setStrokeStyle(2, 0x831843, 0.95);
        }
        player.setVisible(true);
        return;
      }

      const pulse = 1 + Math.sin(nowMs / 220) * 0.02;
      const trunkOffsetY = Math.max(7, Math.round(PHASER_ARENA_VISUAL_CONFIG.playerSizePx * 0.58));
      treeOfLifeAvatarVisual.container.setPosition(player.x, player.y + trunkOffsetY);
      treeOfLifeAvatarVisual.container.setScale(pulse);
      player.setFillStyle(0x22c55e, 1);
      player.setStrokeStyle(2, 0x166534, 0.95);
      player.setVisible(true);
    };
    const destroyDivineImageAvatarVisual = (visual) => {
      visual?.container?.destroy(true);
    };
    const createDivineImageAvatarVisual = (sceneRef) => {
      const aura = sceneRef.add.circle(0, 0, 16, 0xf8fcff, 0.24);
      const ring = sceneRef.add.ellipse(0, -17, 18, 8, 0xffffff, 0.16);
      ring.setStrokeStyle(1.2, 0xffffff, 0.9);
      const sprite = sceneRef.textures.exists(HOLY_PRIEST_NAARU_TEXTURE_KEY)
        ? sceneRef.add.image(0, 0, HOLY_PRIEST_NAARU_TEXTURE_KEY)
        : null;
      if (sprite) {
        sprite.setAlpha(0.96);
        sprite.setTint(0xffffff);
      }

      const containerChildren = [aura, ring];
      if (sprite) {
        containerChildren.push(sprite);
      } else {
        const fallbackCore = sceneRef.add.triangle(0, 4, 0, -14, -6, 7, 6, 7, 0xffffff, 0.95);
        const fallbackShardLeft = sceneRef.add.triangle(-12, 8, -2, -2, -14, 4, -6, 13, 0xffffff, 0.9);
        const fallbackShardRight = sceneRef.add.triangle(12, 8, 2, -2, 14, 4, 6, 13, 0xffffff, 0.9);
        containerChildren.push(fallbackCore, fallbackShardLeft, fallbackShardRight);
      }

      const container = sceneRef.add.container(0, 0, containerChildren);
      container.setDepth(4.25);
      container.setVisible(false);

      const spriteHeight = Math.max(1, Number(sprite?.height ?? 0) || 1);
      const targetDisplayHeightPx = Math.max(24, Math.round(PHASER_ARENA_VISUAL_CONFIG.playerSizePx * 1.9));
      const baseScale = sprite ? targetDisplayHeightPx / spriteHeight : 0.58;

      return {
        container,
        aura,
        ring,
        baseScale
      };
    };
    const updateDivineImageAvatarVisual = (nowMs = 0) => {
      if (!player || !divineImageAvatarVisual?.container) {
        return;
      }

      const stacks = getHolyPriestDivineImageStacks();
      const remainingMs = getHolyPriestDivineImageRemainingMs();
      const active =
        activeCombatHealerSlug === HOLY_PRIEST_HEALER_SLUG &&
        playerHealth > 0 &&
        stacks > 0 &&
        remainingMs > 0;
      divineImageAvatarVisual.container.setVisible(active);
      if (!active) {
        return;
      }

      const pulse = 0.88 + Math.sin(nowMs / 210) * 0.12;
      const stackScaleBonus = Math.min(0.32, stacks * 0.06);
      const stackAlphaBonus = Math.min(0.24, stacks * 0.05);
      const baseScale = Math.max(0.01, Number(divineImageAvatarVisual.baseScale ?? 0.58));
      const playerRadius = Math.max(6, PHASER_ARENA_VISUAL_CONFIG.playerRadiusPx);
      const sideOffset = playerRadius + 30;
      const x = Phaser.Math.Clamp(player.x + sideOffset, 16, raidGridWidthPx - 16);
      const y = Phaser.Math.Clamp(player.y - 8 + Math.sin(nowMs / 450) * 2.5, 16, raidGridHeightPx - 16);

      divineImageAvatarVisual.container.setPosition(x, y);
      divineImageAvatarVisual.container.setScale(baseScale * (1 + stackScaleBonus + (pulse - 0.88) * 0.2));
      divineImageAvatarVisual.container.setAlpha(Math.max(0.56, Math.min(0.98, 0.74 + stackAlphaBonus + (pulse - 0.88))));
      divineImageAvatarVisual.ring.setRotation(nowMs / 1400);
      divineImageAvatarVisual.aura.setScale(0.92 + pulse * 0.18);
    };
    const createTreeantVisual = (sceneRef) => {
      // Draw as a single graphics object so crown/trunk cannot drift apart.
      const treeGraphic = sceneRef.add.graphics();
      treeGraphic.fillStyle(0x16a34a, 0.96);
      treeGraphic.fillTriangle(0, -8.2, -6.4, 2.5, 6.4, 2.5);
      treeGraphic.fillStyle(0x22c55e, 0.98);
      treeGraphic.fillTriangle(0, -6.4, -5.2, 2, 5.2, 2);
      treeGraphic.fillStyle(0x8b5a2b, 0.98);
      treeGraphic.fillRect(-1.9, 2.1, 3.8, 4.7);
      treeGraphic.fillStyle(0xf8fafc, 0.95);
      treeGraphic.fillCircle(-1.35, 0.35, 0.55);
      treeGraphic.fillCircle(1.35, 0.35, 0.55);
      treeGraphic.fillStyle(0xbbf7d0, 0.9);
      treeGraphic.fillCircle(0, -7.8, 1.05);

      const container = sceneRef.add.container(0, 0, [treeGraphic]);
      container.setDepth(4.1);
      return { container };
    };
    const updateTreeantVisuals = (sceneRef, nowMs = 0) => {
      if (!player) {
        return;
      }
      const treeantSnapshots = restorationDruidTreeantVisualEnabled && Array.isArray(latestSnapshotRef.current?.treeants)
        ? latestSnapshotRef.current.treeants
        : [];
      const desiredCount = treeantSnapshots.length;

      while (treeantVisuals.length < desiredCount) {
        treeantVisuals.push(createTreeantVisual(sceneRef));
      }
      while (treeantVisuals.length > desiredCount) {
        const removed = treeantVisuals.pop();
        destroyTreeantVisual(removed);
      }
      if (!desiredCount) {
        return;
      }

      const playerRadius = Math.max(6, PHASER_ARENA_VISUAL_CONFIG.playerRadiusPx);
      const sideBaseOffsetPx = playerRadius + 11;
      const stackSpacingPx = 10;
      const maxDurationMs = Math.max(1, Number(RESTORATION_DRUID_TREEANT_CONFIG.durationMs ?? 8000));

      for (let index = 0; index < desiredCount; index += 1) {
        const treeantVisual = treeantVisuals[index];
        const treeantSnapshot = treeantSnapshots[index];
        const remainingRatio = Math.max(
          0,
          Math.min(1, Number(treeantSnapshot?.remainingMs ?? maxDurationMs) / maxDurationMs)
        );
        const bobOffset = Math.sin(nowMs / 180 + index * 0.9) * 1.2;
        const isLeftSide = index % 2 === 0;
        const stackRank = Math.floor(index / 2);
        const sideDirection = isLeftSide ? -1 : 1;
        const x = Phaser.Math.Clamp(
          player.x + sideDirection * (sideBaseOffsetPx + stackRank * stackSpacingPx),
          playerRadius + 7,
          raidGridWidthPx - playerRadius - 7
        );
        const y = Phaser.Math.Clamp(
          player.y + (stackRank % 2 === 0 ? -2.2 : 2.2) + bobOffset,
          playerRadius + 7,
          raidGridHeightPx - playerRadius - 7
        );
        treeantVisual.container.setPosition(x, y);
        treeantVisual.container.setScale(1 + remainingRatio * 0.18);
        treeantVisual.container.setAlpha(0.84 + remainingRatio * 0.16);
      }
    };

    const scheduleNextHazardSpawn = (nowMs) => {
      if (!hazardEnabled) {
        nextHazardSpawnAtMs = Number.POSITIVE_INFINITY;
        return;
      }
      const spawnMinMs = worldFirstZoneActive ? worldFirstZoneHazardSpawnMinMs : hazardSpawnMinMs;
      const spawnMaxMs = worldFirstZoneActive ? worldFirstZoneHazardSpawnMaxMs : hazardSpawnMaxMs;
      nextHazardSpawnAtMs = nowMs + randomBetween(spawnMinMs, spawnMaxMs);
    };

    const scheduleNextMissileSpawn = (nowMs) => {
      if (!missileEnabled) {
        nextMissileSpawnAtMs = Number.POSITIVE_INFINITY;
        return;
      }
      nextMissileSpawnAtMs = nowMs + randomBetween(missileSpawnMinMs, missileSpawnMaxMs);
    };

    const scheduleNextGreenGridZoneSpawn = (nowMs) => {
      if (!greenGridZonePatternEnabled) {
        nextGreenGridZoneSpawnAtMs = Number.POSITIVE_INFINITY;
        return;
      }
      nextGreenGridZoneSpawnAtMs = nowMs + randomBetween(greenGridZonePatternSpawnMinMs, greenGridZonePatternSpawnMaxMs);
    };

    const buildWorldFirstZoneMask = (patternType, variant) => {
      const stripeCount = worldFirstZonePatternStripeCount;
      const mask = Array.from({ length: stripeCount }, () => false);

      if (patternType === "half") {
        const split = Math.floor(stripeCount / 2);
        const leftDanger = variant === 0;
        for (let stripeIndex = 0; stripeIndex < stripeCount; stripeIndex += 1) {
          const isLeft = stripeIndex < split;
          mask[stripeIndex] = leftDanger ? isLeft : !isLeft;
        }
        return mask;
      }

      if (patternType === "twoTwo") {
        const startsWithDanger = variant === 0;
        for (let stripeIndex = 0; stripeIndex < stripeCount; stripeIndex += 1) {
          const blockIndex = Math.floor(stripeIndex / 2) % 2;
          mask[stripeIndex] = startsWithDanger ? blockIndex === 0 : blockIndex === 1;
        }
        return mask;
      }

      const startsWithDanger = variant === 0;
      for (let stripeIndex = 0; stripeIndex < stripeCount; stripeIndex += 1) {
        const blockIndex = Math.floor(stripeIndex / 5) % 2;
        mask[stripeIndex] = startsWithDanger ? blockIndex === 0 : blockIndex === 1;
      }
      return mask;
    };

    const applyWorldFirstZoneMaskVisual = (mask) => {
      for (let stripeIndex = 0; stripeIndex < worldFirstZoneOverlays.length; stripeIndex += 1) {
        const overlay = worldFirstZoneOverlays[stripeIndex];
        if (!overlay) {
          continue;
        }
        if (mask[stripeIndex]) {
          overlay.setVisible(true);
          overlay.setAlpha(worldFirstZonePatternDangerAlpha);
        } else {
          overlay.setVisible(false);
          overlay.setAlpha(0);
        }
      }
    };

    const clearWorldFirstZonePattern = () => {
      worldFirstZoneCurrentMask = Array.from({ length: worldFirstZonePatternStripeCount }, () => false);
      applyWorldFirstZoneMaskVisual(worldFirstZoneCurrentMask);
      if (worldFirstZoneStatusText) {
        worldFirstZoneStatusText.setText("");
      }
    };

    const applyWorldFirstZoneStep = (stepIndex, stepStartAtMs) => {
      const patternType = worldFirstZoneOrder[stepIndex];
      if (!patternType) {
        return;
      }
      const variant = worldFirstZoneVariants[stepIndex] ?? 0;
      worldFirstZoneCurrentMask = buildWorldFirstZoneMask(patternType, variant);
      worldFirstZoneCurrentStepIndex = stepIndex;
      worldFirstZoneCurrentStepStartAtMs = stepStartAtMs;
      worldFirstZoneCurrentStepEndAtMs = stepStartAtMs + worldFirstZonePatternStepDurationMs;
      applyWorldFirstZoneMaskVisual(worldFirstZoneCurrentMask);

      if (worldFirstZoneStatusText) {
        const center = resolveWorldFirstZoneLabelCenter(worldFirstZoneCurrentMask);
        worldFirstZoneStatusText.setPosition(center.x, center.y);
        worldFirstZoneStatusText.setText(`${worldFirstZonePatternLabel} ${stepIndex + 1}/${worldFirstZoneOrder.length}`);
      }
    };

    const isPlayerInsideWorldFirstDangerMask = (mask) => {
      if (!player || !mask?.length) {
        return false;
      }
      const normalizedX = Phaser.Math.Clamp(player.x / Math.max(1, raidGridWidthPx), 0, 0.999999);
      const stripeIndex = Math.max(
        0,
        Math.min(worldFirstZonePatternStripeCount - 1, Math.floor(normalizedX * worldFirstZonePatternStripeCount))
      );
      return Boolean(mask[stripeIndex]);
    };

    const resolveWorldFirstZoneStepImpact = (sceneRef) => {
      if (!worldFirstZonePatternEnabled || !worldFirstZoneActive || worldFirstZoneCurrentStepIndex < 0) {
        return;
      }

      if (!isPlayerInsideWorldFirstDangerMask(worldFirstZoneCurrentMask)) {
        return;
      }

      addCanvasHitCount("zoneFloor");

      if (worldFirstZonePatternStepInstantKill) {
        applyInstantKillByWorldFirstZone(sceneRef);
        return;
      }

      if (worldFirstZonePatternStepDamage > 0) {
        applyPlayerDamage(sceneRef, worldFirstZonePatternStepDamage);
      }
    };

    const startWorldFirstZoneCycle = (nowMs) => {
      worldFirstZoneActive = true;
      const totalStepCount = Math.max(1, Math.round(worldFirstZonePatternActiveMs / worldFirstZonePatternStepDurationMs));
      worldFirstZoneOrder = Array.from({ length: totalStepCount }, () => "half");
      const firstVariant = Math.random() < 0.5 ? 0 : 1;
      worldFirstZoneVariants = worldFirstZoneOrder.map((_, stepIndex) =>
        stepIndex % 2 === 0 ? firstVariant : firstVariant === 0 ? 1 : 0
      );
      missiles.forEach((missile) => missile?.sprite?.destroy());
      missiles = [];
      nextMissileSpawnAtMs = Number.POSITIVE_INFINITY;
      scheduleNextHazardSpawn(nowMs);
      applyWorldFirstZoneStep(0, nowMs);
    };

    const advanceWorldFirstZoneStep = (nextStepStartAtMs) => {
      const nextStepIndex = worldFirstZoneCurrentStepIndex + 1;
      if (nextStepIndex >= worldFirstZoneOrder.length) {
        stopWorldFirstZoneCycle(nextStepStartAtMs);
        return;
      }
      applyWorldFirstZoneStep(nextStepIndex, nextStepStartAtMs);
    };

    const stopWorldFirstZoneCycle = (nowMs = Number.NaN) => {
      worldFirstZoneActive = false;
      worldFirstZoneCurrentStepIndex = -1;
      worldFirstZoneCurrentStepStartAtMs = Number.POSITIVE_INFINITY;
      worldFirstZoneCurrentStepEndAtMs = Number.POSITIVE_INFINITY;
      worldFirstZoneOrder = [];
      worldFirstZoneVariants = [];
      if (Number.isFinite(nowMs) && missileEnabled) {
        scheduleNextMissileSpawn(nowMs);
      }
      if (Number.isFinite(nowMs) && hazardEnabled) {
        scheduleNextHazardSpawn(nowMs);
      }
      clearWorldFirstZonePattern();
    };

    const updateWorldFirstZoneCycle = (sceneRef, nowMs) => {
      if (!worldFirstZonePatternEnabled) {
        return;
      }

      const startScheduledWorldFirstZoneCycleIfNeeded = () => {
        const combatElapsedMs = resolveCombatElapsedMs(nowMs);
        while (
          !worldFirstZoneActive &&
          worldFirstZoneNextScheduledStartIndex < worldFirstZonePatternStartTimesMs.length
        ) {
          const startOffsetMs = worldFirstZonePatternStartTimesMs[worldFirstZoneNextScheduledStartIndex];
          if (combatElapsedMs < startOffsetMs) {
            return;
          }
          worldFirstZoneNextScheduledStartIndex += 1;
          startWorldFirstZoneCycle(nowMs);
        }
      };
      startScheduledWorldFirstZoneCycleIfNeeded();

      if (!worldFirstZoneActive) {
        return;
      }

      while (worldFirstZoneActive && nowMs >= worldFirstZoneCurrentStepEndAtMs) {
        resolveWorldFirstZoneStepImpact(sceneRef);
        if (playerHealth <= 0) {
          return;
        }
        advanceWorldFirstZoneStep(worldFirstZoneCurrentStepEndAtMs);
        if (!worldFirstZoneActive) {
          startScheduledWorldFirstZoneCycleIfNeeded();
        }
      }

      if (worldFirstZoneActive && worldFirstZoneStatusText) {
        const remainingMs = Math.max(0, worldFirstZoneCurrentStepEndAtMs - nowMs);
        const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
        worldFirstZoneStatusText.setText(
          `${worldFirstZonePatternLabel} ${worldFirstZoneCurrentStepIndex + 1}/${worldFirstZoneOrder.length} ${remainingSeconds}s`
        );
      }
    };

    const updatePlayerHealthUi = () => {
      if (!showPlayerHealthBar || !player || !healthBarBg || !healthBarFill || !healthBarText) {
        return;
      }

      const hpRatio = Math.max(0, Math.min(1, playerHealth / playerMaxHealth));
      const healthBarWidth = PHASER_ARENA_VISUAL_CONFIG.healthBarWidthPx;
      const healthBarOffsetY = PHASER_ARENA_VISUAL_CONFIG.healthBarOffsetYPx;

      healthBarBg.setPosition(player.x, player.y + healthBarOffsetY);
      healthBarFill.setPosition(player.x - healthBarWidth / 2, player.y + healthBarOffsetY);
      healthBarFill.setScale(hpRatio, 1);
      healthBarFill.setFillStyle(hpRatio <= 0.25 ? 0xdc2626 : 0x22c55e, 0.95);
      healthBarText.setText(`${Math.round(hpRatio * 100)}%`);
      healthBarText.setPosition(player.x, player.y + healthBarOffsetY - 8);
    };

    const updatePlayerFaceUi = (nowMs = 0) => {
      if (!player || !playerLeftEye || !playerRightEye || !playerLeftTear || !playerRightTear || !playerMouth) {
        return;
      }

      const isDead = playerDeathNotified || playerHealth <= 0;
      const isCrying = !isDead && nowMs < recentHitUntilMs;
      playerLeftEye.setVisible(true);
      playerRightEye.setVisible(true);
      playerMouth.setVisible(true);

      const eyeOffsetX = Math.max(2.2, PHASER_ARENA_VISUAL_CONFIG.playerRadiusPx * 0.28);
      const eyeOffsetY = Math.max(1.4, PHASER_ARENA_VISUAL_CONFIG.playerRadiusPx * 0.2);
      const mouthRadius = Math.max(1.8, PHASER_ARENA_VISUAL_CONFIG.playerRadiusPx * 0.24);
      const mouthCenterY = player.y + Math.max(1.8, PHASER_ARENA_VISUAL_CONFIG.playerRadiusPx * 0.18);
      const eyeColorHex = isDead ? 0x7f1d1d : 0x3f1d2e;
      const mouthColorHex = isDead ? 0x7f1d1d : isCrying ? 0x1d4ed8 : 0x831843;

      playerLeftEye.setPosition(player.x - eyeOffsetX, player.y - eyeOffsetY);
      playerRightEye.setPosition(player.x + eyeOffsetX, player.y - eyeOffsetY);
      playerLeftEye.setFillStyle(eyeColorHex, 1);
      playerRightEye.setFillStyle(eyeColorHex, 1);
      playerLeftTear.setPosition(player.x - eyeOffsetX, player.y - eyeOffsetY + 3.1);
      playerRightTear.setPosition(player.x + eyeOffsetX, player.y - eyeOffsetY + 3.1);
      playerLeftTear.setVisible(isCrying);
      playerRightTear.setVisible(isCrying);

      playerMouth.clear();
      playerMouth.lineStyle(1.6, mouthColorHex, 1);
      playerMouth.beginPath();
      if (isDead || isCrying) {
        playerMouth.arc(
          player.x,
          mouthCenterY + 1.9,
          mouthRadius,
          Phaser.Math.DegToRad(200),
          Phaser.Math.DegToRad(340),
          false
        );
      } else {
        playerMouth.arc(
          player.x,
          mouthCenterY,
          mouthRadius,
          Phaser.Math.DegToRad(18),
          Phaser.Math.DegToRad(162),
          false
        );
      }
      playerMouth.strokePath();
    };
    const updateInfusionOfLightVisual = (nowMs = 0) => {
      if (!player || !infusionLeftArc || !infusionRightArc) {
        return;
      }

      let remainingMs = 0;
      let chargeCount = 0;
      let leftArcMinChargeCount = 2;
      let rightArcMinChargeCount = 1;
      if (activeCombatHealerSlug === HOLY_PALADIN_HEALER_SLUG) {
        remainingMs = getInfusionOfLightRemainingMs();
        chargeCount = Math.max(0, Math.min(2, getInfusionOfLightCharges()));
        leftArcMinChargeCount = 2;
        rightArcMinChargeCount = 1;
      } else if (activeCombatHealerSlug === HOLY_PRIEST_HEALER_SLUG) {
        remainingMs = getHolyPriestSurgeOfLightRemainingMs();
        chargeCount = Math.max(0, Math.min(2, getHolyPriestSurgeOfLightStacks()));
        leftArcMinChargeCount = 1;
        rightArcMinChargeCount = 2;
      }
      const active = playerHealth > 0 && remainingMs > 0 && chargeCount > 0;
      if (!active) {
        infusionLeftArc.clear();
        infusionRightArc.clear();
        infusionLeftArc.setVisible(false);
        infusionRightArc.setVisible(false);
        return;
      }

      const playerRadius = Math.max(6, PHASER_ARENA_VISUAL_CONFIG.playerRadiusPx);
      const arcRadius = 30;
      const arcCenterY = player.y;
      const pulse = 0.72 + Math.sin(nowMs / 120) * 0.16;
      const arcThickness = 3.2;
      const shouldShowLeftArc = chargeCount >= leftArcMinChargeCount;
      const shouldShowRightArc = chargeCount >= rightArcMinChargeCount;

      if (shouldShowLeftArc) {
        infusionLeftArc.setVisible(true);
        infusionLeftArc.clear();
        infusionLeftArc.lineStyle(arcThickness, 0xfacc15, pulse);
        infusionLeftArc.beginPath();
        infusionLeftArc.arc(
          player.x,
          arcCenterY,
          arcRadius,
          Phaser.Math.DegToRad(140),
          Phaser.Math.DegToRad(220),
          false
        );
        infusionLeftArc.strokePath();
      } else {
        infusionLeftArc.clear();
        infusionLeftArc.setVisible(false);
      }

      if (shouldShowRightArc) {
        infusionRightArc.setVisible(true);
        infusionRightArc.clear();
        infusionRightArc.lineStyle(arcThickness, 0xfacc15, pulse);
        infusionRightArc.beginPath();
        infusionRightArc.arc(
          player.x,
          arcCenterY,
          arcRadius,
          Phaser.Math.DegToRad(320),
          Phaser.Math.DegToRad(40),
          false
        );
        infusionRightArc.strokePath();
      } else {
        infusionRightArc.clear();
        infusionRightArc.setVisible(false);
      }
    };
    const updateDivinePurposeVisual = (nowMs = 0) => {
      if (!player || !divinePurposeArc) {
        return;
      }

      const remainingMs = getHolyPaladinDivinePurposeRemainingMs();
      const active =
        activeCombatHealerSlug === HOLY_PALADIN_HEALER_SLUG &&
        playerHealth > 0 &&
        remainingMs > 0;
      if (!active) {
        divinePurposeArc.clear();
        divinePurposeArc.setVisible(false);
        return;
      }

      const playerRadius = Math.max(6, PHASER_ARENA_VISUAL_CONFIG.playerRadiusPx);
      const arcRadius = 20;
      const arcCenterY = player.y - (playerRadius);
      const pulse = 0.76 + Math.sin(nowMs / 120) * 0.16;
      const sparkAlpha = Math.max(0.45, Math.min(0.98, pulse + 0.12));
      const arcThickness = 3.2;
      divinePurposeArc.setVisible(true);
      divinePurposeArc.clear();
      divinePurposeArc.lineStyle(arcThickness, 0xfacc15, pulse);
      divinePurposeArc.beginPath();
      divinePurposeArc.arc(
        player.x,
        arcCenterY,
        arcRadius,
        Phaser.Math.DegToRad(230),
        Phaser.Math.DegToRad(310),
        false
      );
      divinePurposeArc.strokePath();
      divinePurposeArc.fillStyle(0xfef08a, sparkAlpha);
    };
    const syncHaloPulseVisualEvents = (sceneRef) => {
      if (activeCombatHealerSlug !== HOLY_PRIEST_HEALER_SLUG) {
        if (haloPulseVisuals.length) {
          clearHaloPulseVisuals();
        }
        return;
      }

      const logs = Array.isArray(latestSnapshotRef.current?.logs) ? latestSnapshotRef.current.logs : [];
      if (!logs.length) {
        return;
      }

      let maxProcessedLogId = lastProcessedHaloPulseLogId;
      for (const logEntry of logs) {
        const logId = Math.max(0, Number(logEntry?.id) || 0);
        maxProcessedLogId = Math.max(maxProcessedLogId, logId);
        if (logId <= lastProcessedHaloPulseLogId) {
          continue;
        }

        const logType = String(logEntry?.type ?? "").trim();
        const text = String(logEntry?.text ?? "");
        if (logType !== "heal" || !text.startsWith("후광 파동 ")) {
          continue;
        }

        const startCombatMs = Math.max(0, Number(logEntry?.timeMs ?? latestSnapshotRef.current?.nowMs ?? 0));
        const graphics = sceneRef.add.graphics();
        graphics.setDepth(2.6);
        haloPulseVisuals.push({
          graphics,
          startCombatMs
        });
      }
      lastProcessedHaloPulseLogId = maxProcessedLogId;
    };
    const updateHaloPulseVisuals = (sceneRef, nowMs = 0) => {
      if (!player) {
        return;
      }

      syncHaloPulseVisualEvents(sceneRef);
      if (!haloPulseVisuals.length) {
        return;
      }

      const combatElapsedMs = resolveCombatElapsedMs(nowMs);
      const playerRadius = Math.max(6, PHASER_ARENA_VISUAL_CONFIG.playerRadiusPx);
      const minRadius = playerRadius + 2;
      const maxRadius = Math.max(minRadius + 24, Math.min(raidGridWidthPx, raidGridHeightPx) * 0.46 * 1.5);
      const pulseDurationMs = 5000;

      haloPulseVisuals = haloPulseVisuals.filter((haloVisual) => {
        const elapsedMs = combatElapsedMs - Math.max(0, Number(haloVisual?.startCombatMs) || 0);
        const graphics = haloVisual?.graphics;
        if (!graphics) {
          return false;
        }
        if (elapsedMs < 0) {
          return true;
        }
        if (elapsedMs >= pulseDurationMs) {
          graphics.clear();
          graphics.setVisible(false);
          destroyHaloPulseVisual(haloVisual);
          return false;
        }

        const progress = Math.max(0, Math.min(1, elapsedMs / pulseDurationMs));
        const wave = progress <= 0.5 ? progress * 2 : (1 - progress) * 2;
        const radius = minRadius + (maxRadius - minRadius) * wave;
        const lineAlpha = 0.04 + wave * 0.2;
        const innerAlpha = Math.min(0.28, lineAlpha + 0.08);
        const thickness = 1.4 + wave * 2.2;

        graphics.setVisible(true);
        graphics.clear();
        graphics.lineStyle(thickness, 0xfacc15, lineAlpha);
        graphics.strokeCircle(player.x, player.y, radius);
        graphics.lineStyle(Math.max(1, thickness - 0.8), 0xfef08a, innerAlpha);
        graphics.strokeCircle(player.x, player.y, Math.max(minRadius * 0.7, radius - 4));
        return true;
      });
    };

    const resolveCombatElapsedMs = (sceneNowMs = 0) => {
      const snapshotNowMs = Number(latestSnapshotRef.current?.nowMs);
      if (Number.isFinite(snapshotNowMs)) {
        return Math.max(0, snapshotNowMs);
      }
      return Math.max(0, sceneNowMs - sceneStartAtMs);
    };
    const syncLightOfDawnGlowVisualEvents = (sceneRef) => {
      if (activeCombatHealerSlug !== HOLY_PALADIN_HEALER_SLUG) {
        if (lightOfDawnGlowVisuals.length) {
          clearLightOfDawnGlowVisuals();
        }
        lastLightOfDawnCastCount = 0;
        return;
      }

      const snapshot = latestSnapshotRef.current;
      const totalLightOfDawnCasts = Math.max(0, Math.round(Number(snapshot?.metrics?.casts?.lightOfDawn ?? 0)));
      if (totalLightOfDawnCasts <= lastLightOfDawnCastCount) {
        return;
      }

      const triggerAtMs = Math.max(0, Number(snapshot?.nowMs ?? 0));
      const pulseCountPerCast = HOLY_PALADIN_ADDED_TALENT_TOGGLES.secondSunrise ? 2 : 1;
      const pulseDurationMs = Math.max(120, Math.round(holyPaladinLightOfDawnGlowDurationMs));
      for (let castIndex = lastLightOfDawnCastCount; castIndex < totalLightOfDawnCasts; castIndex += 1) {
        for (let pulseIndex = 0; pulseIndex < pulseCountPerCast; pulseIndex += 1) {
          const graphics = sceneRef.add.graphics();
          graphics.setDepth(3.05);
          lightOfDawnGlowVisuals.push({
            graphics,
            startCombatMs: triggerAtMs + pulseIndex * holyPaladinLightOfDawnFollowupDelayMs,
            durationMs: pulseDurationMs
          });
        }
      }
      lastLightOfDawnCastCount = totalLightOfDawnCasts;
    };
    const updateLightOfDawnGlowVisuals = (sceneRef, nowMs = 0) => {
      if (!player) {
        return;
      }

      syncLightOfDawnGlowVisualEvents(sceneRef);
      if (!lightOfDawnGlowVisuals.length) {
        return;
      }

      const combatElapsedMs = resolveCombatElapsedMs(nowMs);
      const playerRadius = Math.max(6, PHASER_ARENA_VISUAL_CONFIG.playerRadiusPx);
      const minRadius = playerRadius + 5;
      const maxRadius = playerRadius + 46;

      lightOfDawnGlowVisuals = lightOfDawnGlowVisuals.filter((pulseVisual) => {
        const graphics = pulseVisual?.graphics;
        if (!graphics) {
          return false;
        }

        const elapsedMs = combatElapsedMs - Math.max(0, Number(pulseVisual?.startCombatMs ?? 0));
        const durationMs = Math.max(1, Number(pulseVisual?.durationMs ?? 1));
        if (elapsedMs < 0) {
          return true;
        }
        if (elapsedMs >= durationMs) {
          graphics.clear();
          graphics.setVisible(false);
          destroyLightOfDawnGlowVisual(pulseVisual);
          return false;
        }

        const progress = Math.max(0, Math.min(1, elapsedMs / durationMs));
        const easedProgress = 1 - Math.pow(1 - progress, 2.3);
        const radius = minRadius + (maxRadius - minRadius) * easedProgress;
        const ringAlpha = Math.max(0.03, (1 - progress) * 0.55);
        const coreAlpha = Math.max(0.02, (1 - progress) * 0.2);
        const outerThickness = 2.1 + (1 - progress) * 2.6;

        graphics.setVisible(true);
        graphics.clear();
        graphics.fillStyle(0xfef08a, coreAlpha);
        graphics.fillCircle(player.x, player.y, radius * 0.86);
        graphics.lineStyle(outerThickness, 0xfacc15, ringAlpha);
        graphics.strokeCircle(player.x, player.y, radius);
        graphics.lineStyle(Math.max(1, outerThickness - 0.9), 0xf59e0b, Math.max(0.02, ringAlpha * 0.66));
        graphics.strokeCircle(player.x, player.y, Math.max(minRadius * 0.75, radius - 4));
        return true;
      });
    };
    const syncPrayerOfHealingGcdPulseVisualEvents = (sceneRef) => {
      if (activeCombatHealerSlug !== HOLY_PRIEST_HEALER_SLUG) {
        if (prayerOfHealingGcdPulseVisuals.length) {
          clearPrayerOfHealingGcdPulseVisuals();
        }
        lastPrayerOfHealingCastCount = 0;
        return;
      }

      const snapshot = latestSnapshotRef.current;
      const totalPrayerOfHealingCasts = Math.max(
        0,
        Math.round(Number(snapshot?.metrics?.casts?.prayerOfHealing ?? 0))
      );
      if (totalPrayerOfHealingCasts <= lastPrayerOfHealingCastCount) {
        return;
      }

      const triggerAtMs = Math.max(0, Number(snapshot?.nowMs ?? 0));
      const durationMs = Math.max(0, Math.round(holyPriestPrayerOfHealingPulseDurationMs));
      for (let castIndex = lastPrayerOfHealingCastCount; castIndex < totalPrayerOfHealingCasts; castIndex += 1) {
        playHolyPriestPrayerOfHealingCastSfx();
        if (durationMs <= 0) {
          continue;
        }
        const graphics = sceneRef.add.graphics();
        graphics.setDepth(3.15);
        prayerOfHealingGcdPulseVisuals.push({
          graphics,
          startCombatMs: triggerAtMs,
          durationMs: Math.max(120, durationMs)
        });
      }
      lastPrayerOfHealingCastCount = totalPrayerOfHealingCasts;
    };
    const updatePrayerOfHealingGcdPulseVisuals = (sceneRef, nowMs = 0) => {
      if (!player) {
        return;
      }

      syncPrayerOfHealingGcdPulseVisualEvents(sceneRef);
      if (!prayerOfHealingGcdPulseVisuals.length) {
        return;
      }

      const combatElapsedMs = resolveCombatElapsedMs(nowMs);
      const playerRadius = Math.max(6, PHASER_ARENA_VISUAL_CONFIG.playerRadiusPx);
      const minRadius = playerRadius + 7;
      const maxRadius = playerRadius + 52;
      const ringCount = 3;
      const dotCountPerRing = 54;

      prayerOfHealingGcdPulseVisuals = prayerOfHealingGcdPulseVisuals.filter((pulseVisual) => {
        const graphics = pulseVisual?.graphics;
        if (!graphics) {
          return false;
        }

        const elapsedMs = combatElapsedMs - Math.max(0, Number(pulseVisual?.startCombatMs ?? 0));
        const durationMs = Math.max(1, Number(pulseVisual?.durationMs ?? 1));
        if (elapsedMs < 0) {
          return true;
        }
        if (elapsedMs >= durationMs) {
          graphics.clear();
          graphics.setVisible(false);
          destroyPrayerOfHealingGcdPulseVisual(pulseVisual);
          return false;
        }

        const progress = Math.max(0, Math.min(1, elapsedMs / durationMs));
        const easedProgress = 1 - Math.pow(1 - progress, 2);
        const baseRadius = minRadius + (maxRadius - minRadius) * easedProgress;
        const baseAlpha = Math.max(0.08, (1 - progress) * 0.78);
        const rotation = progress * 9.2;

        graphics.setVisible(true);
        graphics.clear();
        for (let ringIndex = 0; ringIndex < ringCount; ringIndex += 1) {
          const ringOffset = (ringIndex - (ringCount - 1) / 2) * 2.8;
          const ringRadius = Math.max(minRadius * 0.72, baseRadius + ringOffset);
          const ringAlpha = Math.max(0.06, baseAlpha * (1 - ringIndex * 0.12));
          const dotRadius = Math.max(0.85, 1.45 - progress * 0.45 + ringIndex * 0.08);
          graphics.fillStyle(0xf8fafc, ringAlpha);
          for (let dotIndex = 0; dotIndex < dotCountPerRing; dotIndex += 1) {
            const angle =
              rotation +
              ringIndex * 0.22 +
              (dotIndex / dotCountPerRing) * Math.PI * 2;
            const jitter = Math.sin(dotIndex * 1.6 + progress * 18 + ringIndex * 0.9) * 0.62;
            const radius = ringRadius + jitter;
            const x = player.x + Math.cos(angle) * radius;
            const y = player.y + Math.sin(angle) * radius;
            graphics.fillCircle(x, y, dotRadius);
          }
        }
        return true;
      });
    };
    const resolveWorldFirstZoneGreenGridBlockedRemainingMs = (sceneNowMs = 0) => {
      if (!worldFirstZonePatternEnabled || !worldFirstZonePatternStartTimesMs.length) {
        return 0;
      }
      const combatElapsedMs = resolveCombatElapsedMs(sceneNowMs);
      let maxBlockedRemainingMs = 0;
      for (const startOffsetMs of worldFirstZonePatternStartTimesMs) {
        const blockedStartMs = Math.max(0, startOffsetMs - worldFirstZoneGreenGridBlockWindowMs);
        const blockedEndMs =
          startOffsetMs + worldFirstZonePatternResolvedActiveMs + worldFirstZoneGreenGridBlockWindowMs;
        if (combatElapsedMs < blockedStartMs || combatElapsedMs > blockedEndMs) {
          continue;
        }
        maxBlockedRemainingMs = Math.max(maxBlockedRemainingMs, blockedEndMs - combatElapsedMs);
      }
      return Math.max(0, maxBlockedRemainingMs);
    };

    const updateCombatTimeText = (sceneNowMs = 0) => {
      if (!GLOBAL_SHOW_CANVAS_COMBAT_TIME || !combatTimeText) {
        return;
      }
      combatTimeText.setText(`전투 시간 ${formatTime(resolveCombatElapsedMs(sceneNowMs))}`);
    };
    const updateRaidBurstCountdownText = (sceneNowMs = 0) => {
      if (!raidBurstCountdownText) {
        return;
      }
      if (!runningRef.current || gameOverReasonRef.current || !scheduledRaidBurstStartTimesMs.length) {
        raidBurstCountdownText.setText("");
        return;
      }

      const combatElapsedMs = resolveCombatElapsedMs(sceneNowMs);
      const upcomingStartMs = scheduledRaidBurstStartTimesMs.find((startMs) => {
        const remainingMs = startMs - combatElapsedMs;
        return remainingMs > 0 && remainingMs <= raidBurstCountdownWindowMs;
      });
      if (!Number.isFinite(upcomingStartMs)) {
        raidBurstCountdownText.setText("");
        return;
      }

      const remainingSeconds = Math.ceil((upcomingStartMs - combatElapsedMs) / 1000);
      if (remainingSeconds <= 0) {
        raidBurstCountdownText.setText("");
        return;
      }
      raidBurstCountdownText.setText(`${remainingSeconds}초 후 광뎀 시작`);
    };

    const applyPlayerDamage = (sceneRef, amount) => {
      const rawDamage = Math.max(0, Number(amount) || 0);
      if (rawDamage <= 0 || playerHealth <= 0) {
        return;
      }
      addCanvasRawDamage(rawDamage);
      const damageTakenMultiplier = getDivineProtectionRemainingMs() > 0 ? 0.8 : 1;
      const adjustedDamage = rawDamage * damageTakenMultiplier;
      playerHealth = Math.max(0, playerHealth - adjustedDamage);
      syncSharedPlayerHpRatio();
      recentHitUntilMs = Math.max(recentHitUntilMs, sceneRef.time.now + playerHitCryFaceDurationMs);
      updatePlayerHealthUi();
      updatePlayerFaceUi(sceneRef.time.now);
      updateTreeOfLifeAvatarVisual(sceneRef.time.now);
      updateInfusionOfLightVisual(sceneRef.time.now);
      updateDivinePurposeVisual(sceneRef.time.now);
      updateDivineImageAvatarVisual(sceneRef.time.now);
      updateHaloPulseVisuals(sceneRef, sceneRef.time.now);
      updatePrayerOfHealingGcdPulseVisuals(sceneRef, sceneRef.time.now);
      sceneRef.cameras.main.flash(90, 255, 80, 80, false);

      if (playerHealth <= 0 && !playerDeathNotified) {
        playerDeathNotified = true;
        player.setFillStyle(0x991b1b, 1);
        playerStatusText?.setText("캐릭터 사망");
        updatePlayerFaceUi(sceneRef.time.now);
        forceRaidFrameSelfDeathFromCanvas();
        triggerGameOver("캐릭터 사망");
      }
    };

    const applyInstantKillByWorldFirstZone = (sceneRef) => {
      if (playerHealth <= 0) {
        return;
      }
      addCanvasRawDamage(playerMaxHealth);
      playerHealth = 0;
      syncSharedPlayerHpRatio();
      recentHitUntilMs = 0;
      updatePlayerHealthUi();
      updateTreeOfLifeAvatarVisual(sceneRef.time.now);
      updateInfusionOfLightVisual(sceneRef.time.now);
      updateDivinePurposeVisual(sceneRef.time.now);
      updateDivineImageAvatarVisual(sceneRef.time.now);
      updateHaloPulseVisuals(sceneRef, sceneRef.time.now);
      updatePrayerOfHealingGcdPulseVisuals(sceneRef, sceneRef.time.now);
      sceneRef.cameras.main.flash(120, 255, 40, 40, false);

      if (!playerDeathNotified) {
        playerDeathNotified = true;
        player.setFillStyle(0x991b1b, 1);
        playerStatusText?.setText("즉사 바닥 피격");
        updatePlayerFaceUi(sceneRef.time.now);
        forceRaidFrameSelfDeathFromCanvas();
        triggerGameOver("즉사 바닥 피격");
      }
    };

    const spawnHazard = (sceneRef, nowMs, options = {}) => {
      if (!hazardEnabled) {
        return;
      }
      const targeting = String(options.targeting ?? "player");
      const padding = Math.max(PHASER_ARENA_VISUAL_CONFIG.hazardSafePaddingPx, hazardBarWidthPx * 0.6 + 6);
      const isTargeted = targeting === "player";
      let baseX = isTargeted && player ? player.x : randomBetween(padding, raidGridWidthPx - padding);
      let baseY = isTargeted && player ? player.y : randomBetween(padding, raidGridHeightPx - padding);
      const x = Phaser.Math.Clamp(baseX + randomBetween(-hazardTargetJitterPx, hazardTargetJitterPx), padding, raidGridWidthPx - padding);
      const y = Phaser.Math.Clamp(baseY + randomBetween(-hazardTargetJitterPx, hazardTargetJitterPx), padding, raidGridHeightPx - padding);
      const angleRad = worldFirstZoneActive
        ? Phaser.Math.DegToRad(randomBetween(-30, 30))
        : Phaser.Math.DegToRad(randomBetween(0, 360));

      const barOuter = sceneRef.add.rectangle(
        x,
        y,
        hazardBarLengthPx,
        hazardBarWidthPx,
        PHASER_ARENA_VISUAL_CONFIG.hazardBarOuterColorHex,
        PHASER_ARENA_VISUAL_CONFIG.hazardBarOuterAlpha
      );
      barOuter.setRotation(angleRad);
      barOuter.setStrokeStyle(1, 0x93c5fd, 0.95);

      const barInner = sceneRef.add.rectangle(
        x,
        y,
        hazardBarLengthPx,
        Math.max(2, hazardBarWidthPx * 0.34),
        PHASER_ARENA_VISUAL_CONFIG.hazardBarInnerColorHex,
        PHASER_ARENA_VISUAL_CONFIG.hazardBarInnerAlpha
      );
      barInner.setRotation(angleRad);

      const label = sceneRef.add
        .text(x, y, formatHazardCountdownLabel(hazardCountdownMs), {
          color: "#ffffff",
          fontFamily: "Pretendard, Noto Sans KR, sans-serif",
          fontSize: "16px",
          fontStyle: "700"
        })
        .setOrigin(0.5);

      hazards.push({
        x,
        y,
        width: hazardBarWidthPx,
        length: hazardBarLengthPx,
        angleRad,
        explodeAtMs: nowMs + hazardCountdownMs,
        barOuter,
        barInner,
        label
      });
    };

    const spawnMissile = (sceneRef, nowMs) => {
      if (!missileEnabled || !player) {
        return;
      }

      const targetX = Phaser.Math.Clamp(
        player.x + randomBetween(-missileTargetJitterPx, missileTargetJitterPx),
        missileWidthPx * 0.5,
        raidGridWidthPx - missileWidthPx * 0.5
      );
      const spawnX = Phaser.Math.Clamp(
        targetX + randomBetween(-missileWidthPx, missileWidthPx),
        missileWidthPx * 0.5,
        raidGridWidthPx - missileWidthPx * 0.5
      );
      const spawnY = -missileHeightPx;
      const dx = targetX - spawnX;
      const dy = Math.max(1, player.y - spawnY);
      const dist = Math.max(1, Math.hypot(dx, dy));
      const vx = (dx / dist) * missileSpeedPerSec;
      const vy = (dy / dist) * missileSpeedPerSec;
      const angleRad = Math.atan2(vy, vx);
      const radius = missileCollisionRadiusPx;
      const tailLength = Math.max(missileWidthPx * 1.9, radius * 3.2);
      const tailThickness = Math.max(missileHeightPx * 0.9, radius * 1.35);

      const tailBack = sceneRef.add.ellipse(
        -tailLength * 0.54,
        0,
        tailLength * 1.02,
        tailThickness * 1.12,
        0x0b1f58,
        0.24
      );
      const tailMid = sceneRef.add.ellipse(
        -tailLength * 0.36,
        0,
        tailLength * 0.78,
        tailThickness * 0.8,
        0x1e40af,
        0.34
      );

      const headGlow = sceneRef.add.circle(0, 0, radius * 1.26, 0x3b82f6, 0.34);
      const headOuter = sceneRef.add.circle(0, 0, radius * 0.96, 0x0f172a, 0.96);
      const headInner = sceneRef.add.circle(0, 0, radius * 0.72, 0x172554, 0.92);
      const headCore = sceneRef.add.circle(0, 0, radius * 0.45, 0x060b1f, 0.98);
      const highlight = sceneRef.add.circle(radius * 0.28, -radius * 0.26, Math.max(1.2, radius * 0.2), 0x93c5fd, 0.82);

      const missile = sceneRef.add.container(spawnX, spawnY, [
        tailBack,
        tailMid,
        headGlow,
        headOuter,
        headInner,
        headCore,
        highlight
      ]);
      missile.setDepth(2.2);
      missile.setRotation(angleRad);

      missiles.push({
        sprite: missile,
        headGlow,
        tailMid,
        vx,
        vy,
        radius,
        spawnedAtMs: nowMs
      });
    };

    const clearHazard = (hazard) => {
      hazard.barOuter?.destroy();
      hazard.barInner?.destroy();
      hazard.label?.destroy();
    };

    const clearMissile = (missile) => {
      missile.sprite?.destroy();
    };

    const clearGreenGridZonePattern = () => {
      greenGridZonePattern?.overlay?.destroy();
      greenGridZonePattern?.countdownText?.destroy();
      greenGridZonePattern = null;
      if (greenGridZoneInstructionText) {
        greenGridZoneInstructionText.setText("");
      }
      if (greenGridZoneCountdownText) {
        greenGridZoneCountdownText.setText("");
      }
    };

    const isPlayerInsideGreenGridZonePattern = () => {
      if (!player || !greenGridZonePattern) {
        return false;
      }
      const playerRadius = Math.max(0, Number(PHASER_ARENA_VISUAL_CONFIG.playerRadiusPx ?? 0));
      const playerLeft = player.x - playerRadius;
      const playerRight = player.x + playerRadius;
      const playerTop = player.y - playerRadius;
      const playerBottom = player.y + playerRadius;
      return (
        playerRight >= greenGridZonePattern.left &&
        playerLeft <= greenGridZonePattern.right &&
        playerBottom >= greenGridZonePattern.top &&
        playerTop <= greenGridZonePattern.bottom
      );
    };

    const spawnGreenGridZonePattern = (sceneRef, nowMs) => {
      if (!greenGridZonePatternEnabled) {
        return;
      }
      clearGreenGridZonePattern();

      const maxStartCellX = Math.max(0, Math.floor((raidGridWidthPx - greenGridZonePatternSizePx) / arenaGridCellSizePx));
      const maxStartCellY = Math.max(0, Math.floor((raidGridHeightPx - greenGridZonePatternSizePx) / arenaGridCellSizePx));
      const minStartCellY = Math.min(
        maxStartCellY,
        Math.max(0, Math.ceil((raidGridHeightPx * 0.5) / arenaGridCellSizePx))
      );
      const startCellX = Phaser.Math.Between(0, maxStartCellX);
      const startCellY = Phaser.Math.Between(minStartCellY, maxStartCellY);
      const left = startCellX * arenaGridCellSizePx;
      const top = startCellY * arenaGridCellSizePx;

      const overlay = sceneRef.add.graphics();
      overlay.fillStyle(0x22c55e, 0.24);
      overlay.fillRect(left, top, greenGridZonePatternSizePx, greenGridZonePatternSizePx);
      overlay.lineStyle(2, 0x4ade80, 0.96);
      overlay.strokeRect(left, top, greenGridZonePatternSizePx, greenGridZonePatternSizePx);
      overlay.lineStyle(1, 0x86efac, 0.7);
      for (let cellIndex = 1; cellIndex < greenGridZonePatternSizeCells; cellIndex += 1) {
        const offset = cellIndex * arenaGridCellSizePx;
        overlay.lineBetween(left + offset, top, left + offset, top + greenGridZonePatternSizePx);
        overlay.lineBetween(left, top + offset, left + greenGridZonePatternSizePx, top + offset);
      }
      overlay.setDepth(1.6);
      const countdownText = sceneRef.add
        .text(
          left + greenGridZonePatternSizePx * 0.5,
          top + greenGridZonePatternSizePx * 0.5,
          formatGreenGridZoneFloorCountdownLabel(greenGridZonePatternDurationMs),
          {
            color: "#f0fdf4",
            fontFamily: "Pretendard, Noto Sans KR, sans-serif",
            fontSize: "18px",
            fontStyle: "700"
          }
        )
        .setOrigin(0.5)
        .setDepth(1.9)
        .setStroke("#14532d", 4);

      greenGridZonePattern = {
        left,
        right: left + greenGridZonePatternSizePx,
        top,
        bottom: top + greenGridZonePatternSizePx,
        expiresAtMs: nowMs + greenGridZonePatternDurationMs,
        overlay,
        countdownText
      };
      greenGridZoneInstructionText?.setText(greenGridZonePatternInstructionText);
      greenGridZoneCountdownText?.setText("");
    };

    const updateGreenGridZonePattern = (sceneRef, nowMs) => {
      if (!greenGridZonePatternEnabled) {
        return;
      }
      const worldFirstZoneBlockedRemainingMs = resolveWorldFirstZoneGreenGridBlockedRemainingMs(nowMs);
      if (!greenGridZonePattern) {
        if (worldFirstZoneBlockedRemainingMs > 0) {
          const worldFirstZoneBlockedUntilMs = nowMs + worldFirstZoneBlockedRemainingMs;
          if (nextGreenGridZoneSpawnAtMs < worldFirstZoneBlockedUntilMs) {
            nextGreenGridZoneSpawnAtMs = worldFirstZoneBlockedUntilMs;
          }
          return;
        }
        if (nowMs >= nextGreenGridZoneSpawnAtMs) {
          spawnGreenGridZonePattern(sceneRef, nowMs);
        }
        return;
      }

      const remainingMs = Math.max(0, greenGridZonePattern.expiresAtMs - nowMs);
      greenGridZoneInstructionText?.setText(greenGridZonePatternInstructionText);
      greenGridZoneCountdownText?.setText("");
      greenGridZonePattern.countdownText?.setText(formatGreenGridZoneFloorCountdownLabel(remainingMs));
      greenGridZonePattern.overlay?.setAlpha(0.24 + Math.sin(nowMs / 160) * 0.05);

      if (remainingMs <= 0) {
        const playerInsideAtTimeout = isPlayerInsideGreenGridZonePattern();
        if (!playerInsideAtTimeout && playerHealth > 0 && greenGridZonePatternMissDamage > 0) {
          applyPlayerDamage(sceneRef, greenGridZonePatternMissDamage);
        }
        clearGreenGridZonePattern();
        scheduleNextGreenGridZoneSpawn(nowMs);
      }
    };

    const scene = {
      preload() {
        if (!this.textures.exists(HOLY_PRIEST_NAARU_TEXTURE_KEY)) {
          this.load.image(HOLY_PRIEST_NAARU_TEXTURE_KEY, "/images/naaru.png");
        }
      },
      create() {
        sceneStartAtMs = this.time.now;
        const initialLogs = Array.isArray(latestSnapshotRef.current?.logs) ? latestSnapshotRef.current.logs : [];
        lastProcessedHaloPulseLogId = initialLogs.reduce(
          (maxId, logEntry) => Math.max(maxId, Math.max(0, Number(logEntry?.id) || 0)),
          0
        );
        lastPrayerOfHealingCastCount = Math.max(
          0,
          Math.round(Number(latestSnapshotRef.current?.metrics?.casts?.prayerOfHealing ?? 0))
        );
        lastHolyPaladinFlashOfLightCastCount = Math.max(
          0,
          Math.round(Number(latestSnapshotRef.current?.metrics?.casts?.flashOfLight ?? 0))
        );
        lastHolyPaladinHolyLightCastCount = Math.max(
          0,
          Math.round(Number(latestSnapshotRef.current?.metrics?.casts?.holyLight ?? 0))
        );
        lastHolyPaladinHolyShockCastCount = Math.max(
          0,
          Math.round(Number(latestSnapshotRef.current?.metrics?.casts?.holyShock ?? 0))
        );
        lastHolyPaladinDivineTollCastCount = Math.max(
          0,
          Math.round(Number(latestSnapshotRef.current?.metrics?.casts?.divineToll ?? 0))
        );
        lastHolyPaladinLightOfDawnCastCount = Math.max(
          0,
          Math.round(Number(latestSnapshotRef.current?.metrics?.casts?.lightOfDawn ?? 0))
        );
        this.cameras.main.setBackgroundColor("#1e293b");
        this.add
          .grid(
            0,
            0,
            raidGridWidthPx * 2,
            raidGridHeightPx * 2,
            arenaGridCellSizePx,
            arenaGridCellSizePx,
            0x0f172a,
            0.35,
            0x334155,
            0.2
          )
          .setOrigin(0);
        this.add.text(8, 6, `${movementKeyLetters.up}${movementKeyLetters.down}${movementKeyLetters.left}${movementKeyLetters.right} 이동`, {
          color: "#cbd5e1",
          fontFamily: "Pretendard, Noto Sans KR, sans-serif",
          fontSize: "12px"
        });
        if (GLOBAL_SHOW_CANVAS_COMBAT_TIME) {
          combatTimeText = this.add
            .text(raidGridWidthPx - 8, 6, "전투 시간 00:00", {
              color: "#cbd5e1",
              fontFamily: "Pretendard,Noto Sans KR, sans-serif",
              fontSize: "12px",
              fontStyle: "700"
            })
            .setOrigin(1, 0);
          updateCombatTimeText(this.time.now);
        }
        raidBurstCountdownText = this.add
          .text(raidGridWidthPx / 2, 10, "", {
            color: "#fde68a",
            fontFamily: "Pretendard, Noto Sans KR, sans-serif",
            fontSize: "13px",
            fontStyle: "700"
          })
          .setOrigin(0.5, 0)
          .setDepth(5)
          .setStroke("#1e293b", 3);
        updateRaidBurstCountdownText(this.time.now);
        if (greenGridZonePatternEnabled) {
          const infoStartY = GLOBAL_SHOW_CANVAS_COMBAT_TIME ? 24 : 20;
          greenGridZoneInstructionText = this.add
            .text(raidGridWidthPx / 2, infoStartY, "", {
              color: "#86efac",
              fontFamily: "Pretendard, Noto Sans KR, sans-serif",
              fontSize: "13px",
              fontStyle: "700"
            })
            .setOrigin(0.5, 0)
            .setDepth(5)
            .setStroke("#14532d", 3);
          clearGreenGridZonePattern();
        }
        if (worldFirstZonePatternEnabled) {
          const stripeWidthPx = raidGridWidthPx / worldFirstZonePatternStripeCount;
          const zoneTopColorHex = blendColorHex(worldFirstZonePatternDangerColorHex, 0x0f172a, 0.35);
          const zoneBottomColorHex = blendColorHex(worldFirstZonePatternDangerColorHex, 0xffffff, 0.16);
          worldFirstZoneOverlays = Array.from({ length: worldFirstZonePatternStripeCount }, (_, stripeIndex) => {
            const overlay = this.add.graphics();
            overlay.fillGradientStyle(
              zoneTopColorHex,
              zoneTopColorHex,
              zoneBottomColorHex,
              zoneBottomColorHex,
              0.25,
              0.25,
              0.9,
              0.9
            );
            overlay.fillRect(stripeWidthPx * stripeIndex, 0, stripeWidthPx + 0.5, raidGridHeightPx);
            overlay.setDepth(1);
            overlay.setVisible(false);
            overlay.setAlpha(0);
            return overlay;
          });
          worldFirstZoneStatusText = this.add
            .text(raidGridWidthPx / 2, raidGridHeightPx / 2, "", {
              color: "#f8fafc",
              fontFamily: "Pretendard, Noto Sans KR, sans-serif",
              fontSize: "12px",
              fontStyle: "700"
            })
            .setOrigin(0.5)
            .setDepth(5)
            .setStroke("#1e293b", 3);
          clearWorldFirstZonePattern();
        }

        const playerStartX = raidGridWidthPx / 2;
        const playerStartY = Phaser.Math.Clamp(
          raidGridHeightPx * 0.76,
          PHASER_ARENA_VISUAL_CONFIG.playerRadiusPx + 4,
          raidGridHeightPx - PHASER_ARENA_VISUAL_CONFIG.playerRadiusPx - 8
        );

        player = this.add.rectangle(
          playerStartX,
          playerStartY,
          PHASER_ARENA_VISUAL_CONFIG.playerSizePx,
          PHASER_ARENA_VISUAL_CONFIG.playerSizePx,
          selectedHealerColorHex,
          1
        );
        player.setStrokeStyle(2, 0x831843, 0.95);

        playerLeftEye = this.add.circle(player.x - 3, player.y - 2, 1.45, 0x3f1d2e, 1);
        playerRightEye = this.add.circle(player.x + 3, player.y - 2, 1.45, 0x3f1d2e, 1);
        playerLeftTear = this.add.circle(player.x - 3, player.y + 1, 1.15, 0x7dd3fc, 0.95);
        playerRightTear = this.add.circle(player.x + 3, player.y + 1, 1.15, 0x7dd3fc, 0.95);
        playerMouth = this.add.graphics();
        playerLeftEye.setDepth(4);
        playerRightEye.setDepth(4);
        playerLeftTear.setDepth(4);
        playerRightTear.setDepth(4);
        playerMouth.setDepth(4);
        infusionLeftArc = this.add.graphics();
        infusionRightArc = this.add.graphics();
        divinePurposeArc = this.add.graphics();
        infusionLeftArc.setDepth(3);
        infusionRightArc.setDepth(3);
        divinePurposeArc.setDepth(3);
        treeOfLifeAvatarVisual = createTreeOfLifeAvatarVisual(this);
        divineImageAvatarVisual = createDivineImageAvatarVisual(this);
        updatePlayerFaceUi(this.time.now);
        updateInfusionOfLightVisual(this.time.now);
        updateDivinePurposeVisual(this.time.now);
        updateDivineImageAvatarVisual(this.time.now);
        if (activeCombatHealerSlug === HOLY_PALADIN_HEALER_SLUG) {
          ensureHolyPaladinSpellCastAudio("flashOfLightAndHolyLight");
          ensureHolyPaladinSpellCastAudio("holyShock");
          ensureHolyPaladinSpellCastAudio("divineToll");
          ensureHolyPaladinSpellCastAudio("lightOfDawn");
        }
        if (activeCombatHealerSlug === HOLY_PRIEST_HEALER_SLUG) {
          ensureHolyPriestPrayerOfHealingCastAudio();
        }
        updateHaloPulseVisuals(this, this.time.now);
        updateLightOfDawnGlowVisuals(this, this.time.now);
        updatePrayerOfHealingGcdPulseVisuals(this, this.time.now);
        updateTreeantVisuals(this, this.time.now);
        updateTreeOfLifeAvatarVisual(this.time.now);

        playerStatusText = this.add
          .text(raidGridWidthPx - 8, GLOBAL_SHOW_CANVAS_COMBAT_TIME ? 21 : 6, "", {
            color: "#fca5a5",
            fontFamily: "Pretendard, Noto Sans KR, sans-serif",
            fontSize: "11px",
            fontStyle: "700"
          })
          .setOrigin(1, 0);

        if (showPlayerHealthBar) {
          healthBarBg = this.add.rectangle(
            player.x,
            player.y + PHASER_ARENA_VISUAL_CONFIG.healthBarOffsetYPx,
            PHASER_ARENA_VISUAL_CONFIG.healthBarWidthPx,
            PHASER_ARENA_VISUAL_CONFIG.healthBarHeightPx,
            0x020617,
            0.95
          );
          healthBarBg.setStrokeStyle(1, 0x0f172a, 1);

          healthBarFill = this.add.rectangle(
            player.x - PHASER_ARENA_VISUAL_CONFIG.healthBarWidthPx / 2,
            player.y + PHASER_ARENA_VISUAL_CONFIG.healthBarOffsetYPx,
            PHASER_ARENA_VISUAL_CONFIG.healthBarWidthPx,
            PHASER_ARENA_VISUAL_CONFIG.healthBarHeightPx,
            0x22c55e,
            0.95
          );
          healthBarFill.setOrigin(0, 0.5);

          healthBarText = this.add
            .text(player.x, player.y + PHASER_ARENA_VISUAL_CONFIG.healthBarOffsetYPx - 8, "100%", {
              color: "#dcfce7",
              fontFamily: "Pretendard,Noto Sans KR, sans-serif",
              fontSize: "10px",
              fontStyle: "700"
            })
            .setOrigin(0.5);
          updatePlayerHealthUi();
        }
        syncSharedPlayerHpRatio();

        const forceSelfDeathOnCanvas = () => {
          if (!player) {
            return;
          }
          if (playerHealth > 0) {
            playerHealth = 0;
          }
          playerDeathNotified = true;
          phaserSelfHpRatioRef.current = 0;
          player.setFillStyle(0x991b1b, 1);
          playerStatusText?.setText("캐릭터 사망");
          updatePlayerHealthUi();
          updatePlayerFaceUi(this.time.now);
          updateTreeOfLifeAvatarVisual(this.time.now);
          updateInfusionOfLightVisual(this.time.now);
          updateDivinePurposeVisual(this.time.now);
          updateDivineImageAvatarVisual(this.time.now);
          updateHaloPulseVisuals(this, this.time.now);
          updateLightOfDawnGlowVisuals(this, this.time.now);
          updatePrayerOfHealingGcdPulseVisuals(this, this.time.now);
          updateTreeantVisuals(this, this.time.now);
          syncSharedPlayerHpRatio();
        };
        this.events.on("force-self-death", forceSelfDeathOnCanvas);
        this.events.once("shutdown", () => {
          this.events.off("force-self-death", forceSelfDeathOnCanvas);
        });

        nextHazardSpawnAtMs = Number.POSITIVE_INFINITY;
        nextMissileSpawnAtMs = Number.POSITIVE_INFINITY;
        nextGreenGridZoneSpawnAtMs = Number.POSITIVE_INFINITY;
      },
      update(time, delta) {
        if (!player) {
          return;
        }

        updateCombatTimeText(time);
        updateRaidBurstCountdownText(time);

        if (!runningRef.current || gameOverReasonRef.current) {
          return;
        }

        syncPlayerHealthFromSharedRatio();
        if (playerHealth <= 0 && !playerDeathNotified) {
          playerDeathNotified = true;
          player.setFillStyle(0x991b1b, 1);
          playerStatusText?.setText("캐릭터 사망");
        }

        if (!mechanicsScheduleInitialized) {
          mechanicsScheduleInitialized = true;
          const firstMechanicAtMs = time + mechanicsStartDelayMs;
          nextHazardSpawnAtMs = hazardEnabled ? firstMechanicAtMs : Number.POSITIVE_INFINITY;
          nextMissileSpawnAtMs = missileEnabled ? firstMechanicAtMs : Number.POSITIVE_INFINITY;
          nextGreenGridZoneSpawnAtMs = greenGridZonePatternEnabled ? firstMechanicAtMs : Number.POSITIVE_INFINITY;
          worldFirstZoneNextScheduledStartIndex = 0;
        }
        updateWorldFirstZoneCycle(this, time);
        syncHolyPaladinCastSfxEvents();
        if (playerHealth <= 0) {
          updatePlayerHealthUi();
          updatePlayerFaceUi(time);
          updateTreeOfLifeAvatarVisual(time);
          updateInfusionOfLightVisual(time);
          updateDivinePurposeVisual(time);
          updateDivineImageAvatarVisual(time);
          updateHaloPulseVisuals(this, time);
          updateLightOfDawnGlowVisuals(this, time);
          updatePrayerOfHealingGcdPulseVisuals(this, time);
          updateTreeantVisuals(this, time);
          return;
        }

        const speedPerSec = PHASER_ARENA_VISUAL_CONFIG.playerSpeedPerSec;
        const step = (speedPerSec * delta) / 1000;

        let dx = 0;
        let dy = 0;
        const movementState = movementStateRef.current;
        if (playerHealth > 0) {
          if (movementState.left) {
            dx -= 1;
          }
          if (movementState.right) {
            dx += 1;
          }
          if (movementState.up) {
            dy -= 1;
          }
          if (movementState.down) {
            dy += 1;
          }
        }

        if (dx !== 0 && dy !== 0) {
          const normalize = Math.SQRT1_2;
          dx *= normalize;
          dy *= normalize;
        }

        const playerRadius = Math.max(6, PHASER_ARENA_VISUAL_CONFIG.playerRadiusPx);
        player.x = Phaser.Math.Clamp(player.x + dx * step, playerRadius, raidGridWidthPx - playerRadius);
        player.y = Phaser.Math.Clamp(player.y + dy * step, playerRadius, raidGridHeightPx - playerRadius);
        updatePlayerFaceUi(time);
        updateTreeOfLifeAvatarVisual(time);
        updateInfusionOfLightVisual(time);
        updateDivinePurposeVisual(time);
        updateDivineImageAvatarVisual(time);
        updateHaloPulseVisuals(this, time);
        updateLightOfDawnGlowVisuals(this, time);
        updatePrayerOfHealingGcdPulseVisuals(this, time);
        updateTreeantVisuals(this, time);

        if (showPlayerHealthBar) {
          updatePlayerHealthUi();
        }
        updateGreenGridZonePattern(this, time);
        if (playerHealth <= 0) {
          return;
        }

        if (hazardEnabled && time >= nextHazardSpawnAtMs) {
          if (!worldFirstZoneActive) {
            spawnHazard(this, time, { targeting: "player" });
          } else {
            const spawnTargetedHazard = Math.random() < worldFirstZoneHazardTargetedChance;
            if (spawnTargetedHazard) {
              spawnHazard(this, time, { targeting: "player" });
            } else {
              for (let index = 0; index < worldFirstZoneHazardRandomCountWhenUntargeted; index += 1) {
                spawnHazard(this, time, { targeting: "random" });
              }
            }
          }
          scheduleNextHazardSpawn(time);
        }

        if (missileEnabled && !worldFirstZoneActive && time >= nextMissileSpawnAtMs) {
          spawnMissile(this, time);
          scheduleNextMissileSpawn(time);
        }

        if (hazardEnabled) {
          hazards = hazards.filter((hazard) => {
            const remainingMs = hazard.explodeAtMs - time;
            if (remainingMs > 0) {
              hazard.label.setText(formatHazardCountdownLabel(remainingMs));
              return true;
            }

            const dxHit = player.x - hazard.x;
            const dyHit = player.y - hazard.y;
            const cos = Math.cos(hazard.angleRad);
            const sin = Math.sin(hazard.angleRad);
            const localAlong = dxHit * cos + dyHit * sin;
            const localAcross = -dxHit * sin + dyHit * cos;
            const halfLength = hazard.length * 0.5 + playerRadius;
            const halfWidth = hazard.width * 0.5 + playerRadius;
            const hit = playerHealth > 0 && Math.abs(localAlong) <= halfLength && Math.abs(localAcross) <= halfWidth;

            if (hit && hazardDamage > 0) {
              addCanvasHitCount("hazardBar");
              applyPlayerDamage(this, hazardDamage);
            }

            const explosion = this.add.rectangle(
              hazard.x,
              hazard.y,
              hazard.length,
              hazard.width + 4,
              0xe2e8f0,
              0.45
            );
            explosion.setRotation(hazard.angleRad);
            this.tweens.add({
              targets: explosion,
              alpha: 0,
              scaleX: 1.06,
              scaleY: 1.18,
              duration: 170,
              onComplete: () => {
                explosion.destroy();
              }
            });

            clearHazard(hazard);
            return false;
          });
        }

        if (missileEnabled) {
          missiles = missiles.filter((missile) => {
            const ageMs = Math.max(0, time - Number(missile.spawnedAtMs ?? 0));
            const pulse = 0.72 + Math.sin(ageMs / 72) * 0.2;
            missile.headGlow?.setAlpha(Math.max(0.2, Math.min(0.52, 0.26 + pulse * 0.34)));
            missile.tailMid?.setScale(1 + (1 - pulse) * 0.08, 1);

            missile.sprite.x += (missile.vx * delta) / 1000;
            missile.sprite.y += (missile.vy * delta) / 1000;

            const outOfBounds =
              missile.sprite.y > raidGridHeightPx + missileHeightPx * 2 ||
              missile.sprite.x < -missileWidthPx * 2 ||
              missile.sprite.x > raidGridWidthPx + missileWidthPx * 2;
            if (outOfBounds) {
              clearMissile(missile);
              return false;
            }

            const dxHit = player.x - missile.sprite.x;
            const dyHit = player.y - missile.sprite.y;
            const hitRadius = playerRadius + missile.radius;
            const hit = playerHealth > 0 && dxHit * dxHit + dyHit * dyHit <= hitRadius * hitRadius;
            if (!hit) {
              return true;
            }

            if (missileDamage > 0) {
              addCanvasHitCount("missile");
              applyPlayerDamage(this, missileDamage);
            }

            const impact = this.add.circle(missile.sprite.x, missile.sprite.y, missile.radius + 5, 0x60a5fa, 0.45);
            const impactCore = this.add.circle(missile.sprite.x, missile.sprite.y, missile.radius + 2, 0x1d4ed8, 0.35);
            this.tweens.add({
              targets: [impact, impactCore],
              alpha: 0,
              scale: 1.34,
              duration: 170,
              onComplete: () => {
                impact.destroy();
                impactCore.destroy();
              }
            });

            clearMissile(missile);
            return false;
          });
        }
      }
    };

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host,
      width: raidGridWidthPx,
      height: raidGridHeightPx,
      transparent: false,
      scene,
      fps: {
        target: 60,
        forceSetTimeOut: false
      },
      audio: {
        noAudio: true
      }
    });

    phaserGameRef.current = game;

    return () => {
      stopWorldFirstZoneCycle();
      clearGreenGridZonePattern();
      worldFirstZoneOverlays.forEach((overlay) => overlay?.destroy());
      worldFirstZoneOverlays = [];
      worldFirstZoneStatusText?.destroy();
      worldFirstZoneStatusText = null;
      greenGridZoneInstructionText?.destroy();
      greenGridZoneInstructionText = null;
      greenGridZoneCountdownText?.destroy();
      greenGridZoneCountdownText = null;
      hazards.forEach(clearHazard);
      hazards = [];
      missiles.forEach(clearMissile);
      missiles = [];
      combatTimeText?.destroy();
      raidBurstCountdownText?.destroy();
      playerLeftEye?.destroy();
      playerRightEye?.destroy();
      playerLeftTear?.destroy();
      playerRightTear?.destroy();
      playerMouth?.destroy();
      infusionLeftArc?.destroy();
      infusionRightArc?.destroy();
      divinePurposeArc?.destroy();
      clearHaloPulseVisuals();
      clearLightOfDawnGlowVisuals();
      clearPrayerOfHealingGcdPulseVisuals();
      Object.values(holyPaladinSpellCastAudioByKey).forEach((audio) => {
        if (!audio) {
          return;
        }
        audio.pause();
        audio.currentTime = 0;
      });
      holyPaladinSpellCastAudioByKey = {
        flashOfLightAndHolyLight: null,
        holyShock: null,
        divineToll: null,
        lightOfDawn: null
      };
      if (holyPriestPrayerOfHealingCastAudio) {
        holyPriestPrayerOfHealingCastAudio.pause();
        holyPriestPrayerOfHealingCastAudio.currentTime = 0;
      }
      holyPriestPrayerOfHealingCastAudio = null;
      destroyDivineImageAvatarVisual(divineImageAvatarVisual);
      divineImageAvatarVisual = null;
      destroyTreeOfLifeAvatarVisual(treeOfLifeAvatarVisual);
      treeOfLifeAvatarVisual = null;
      treeantVisuals.forEach(destroyTreeantVisual);
      treeantVisuals = [];
      pointerInPhaserCanvasRef.current = false;
      if (phaserGameRef.current === game) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      } else {
        game.destroy(true);
      }
    };
  }, [
    hasCombatSnapshot,
    raidGridWidthPx,
    raidGridHeightPx,
    activeDifficultyKey,
    activeCombatDifficultyTuning,
    activeCombatHealerSlug,
    activeMovementKeys,
    activePhaserDifficultyConfig,
    selectedHealerColorHex
  ]);

  function renderCooldownManagerBar({
    iconSizePx,
    holyPowerCellWidthPx,
    holyPowerCellHeightPx,
    spellOrder = managerCooldownSpellOrder,
    groupKey = "manager",
    interactive = false,
    enableWowheadTooltip = interactive,
    showHolyPower = true,
    showManaBar = false,
    showCastBar = false,
    resourceSectionOrder = DEFAULT_COOLDOWN_RESOURCE_BAR_LAYOUT.sectionOrder,
    holyPowerWidthBonusPx = 0,
    manaBarWidthBonusPx = 0,
    showBindings = true,
    enableDragReorder = false,
    showFrame = true
  }) {
    const bindingFontPx = Math.max(8, Math.round(iconSizePx * 0.22));
    const bindingPaddingXPx = Math.max(1, Math.round(iconSizePx * 0.04));
    const bindingPaddingYPx = Math.max(1, Math.round(iconSizePx * 0.03));
    const holyPowerValue = Math.max(0, Math.min(5, Number(cooldownBarSnapshot.holyPower ?? 0)));
    const baseResourceBarWidthPx = Math.max(1, holyPowerCellWidthPx * 5);
    const normalizedHolyPowerWidthBonusPx = clampCooldownResourceBarWidthBonusValue(holyPowerWidthBonusPx);
    const normalizedManaBarWidthBonusPx = clampCooldownResourceBarWidthBonusValue(manaBarWidthBonusPx);
    const holyPowerBarWidthPx = Math.max(1, baseResourceBarWidthPx + normalizedHolyPowerWidthBonusPx);
    const holyPowerSegmentWidthPx = holyPowerBarWidthPx / 5;
    const manaBarWidthPx = Math.max(1, baseResourceBarWidthPx + normalizedManaBarWidthBonusPx);
    const castBarWidthPx = Math.max(
      baseResourceBarWidthPx,
      showHolyPower ? holyPowerBarWidthPx : 0,
      showManaBar ? manaBarWidthPx : 0
    );
    const manaPct = Math.max(0, Math.min(100, Number(cooldownBarSnapshot.manaPct ?? 0)));
    const serenityCharges = Math.max(
      0,
      Math.floor(Number(cooldownBarSnapshot.serenityCharges ?? cooldownBarSnapshot.buffs?.serenityCharges ?? 0))
    );
    const currentCastInfo = cooldownBarSnapshot.currentCast;
    const castSpell = currentCastInfo?.spellKey ? practiceSpellsByKey[currentCastInfo.spellKey] : null;
    const castDisplayName = String(currentCastInfo?.spellName ?? castSpell?.name ?? "시전");
    const castIconKeyFromInfo = String(currentCastInfo?.spellIconKey ?? "").trim();
    const castIconKey = castIconKeyFromInfo || (castDisplayName === "축도" ? "benediction" : castSpell?.key ?? "");
    const castIconUrl =
      (castIconKey ? practiceSpellIconsByKey[castIconKey] : null) ||
      (castSpell?.key ? practiceSpellIconsByKey[castSpell.key] : null) ||
      DEFAULT_SPELL_ICON_URL;
    const castRemainingMs = Math.max(0, Number(currentCastInfo?.remainingMs ?? 0));
    const castTimeMs = Math.max(1, Number(currentCastInfo?.castTimeMs ?? 1));
    const castProgress = currentCastInfo && castTimeMs > 0
      ? Math.max(0, Math.min(1, 1 - castRemainingMs / castTimeMs))
      : 0;
    const normalizedGroupKey =
      groupKey === "reserve" ? "reserve" : groupKey === "secondary" ? "secondary" : "manager";
    const renderedSpellOrder = Array.isArray(spellOrder) ? spellOrder : managerCooldownSpellOrder;
    const showEmptyDropZone = enableDragReorder && renderedSpellOrder.length === 0;
    const normalizedResourceSectionOrder = normalizeCooldownResourceSectionOrder(resourceSectionOrder);

    const containerClassName = showFrame
      ? "select-none rounded border border-slate-700 bg-black/70 p-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.45)]"
      : "select-none";

    const spellRowNode = (
      <div
        className="flex items-center justify-center"
        style={{
          gap: `${COOLDOWN_MANAGER_LAYOUT_CONFIG.iconGapPx}px`,
          minHeight: showEmptyDropZone ? `${iconSizePx}px` : undefined
        }}
      >
        {renderedSpellOrder.map((spellKey) => {
          const spell = practiceSpellsByKey[spellKey];
          if (!spell) {
            return null;
          }

          const meta = practiceCooldownSpellMetaByKey[spellKey] ?? {};
          const isBenedictionDisplayFlashHeal =
            spellKey === "flashHeal" &&
            (Math.max(0, Number(cooldownBarSnapshot?.buffs?.benedictionMs ?? 0)) > 0 ||
              Math.max(0, Number(cooldownBarSnapshot?.buffs?.apotheosisMs ?? 0)) > 0);
          const displaySpellKey = isBenedictionDisplayFlashHeal ? "benediction" : spellKey;
          const displaySpell = practiceSpellsByKey[displaySpellKey] ?? spell;
          const displayMeta = practiceCooldownSpellMetaByKey[displaySpellKey] ?? meta;
          const displayIconUrl =
            practiceSpellIconsByKey[displaySpellKey] ||
            displayMeta.iconUrl ||
            practiceSpellIconsByKey[spellKey] ||
            meta.iconUrl ||
            DEFAULT_SPELL_ICON_URL;
          const cooldownMs = Math.max(0, Number(cooldownBarSnapshot.cooldowns?.[spellKey] ?? 0));
          const buffRemainingMs = getSelfBuffRemainingMs(cooldownBarSnapshot, spellKey);
          const buffActive = buffRemainingMs > 0;
          const isOneUseSpent =
            spellKey === "divineBlessing" && Boolean(cooldownBarSnapshot.divineBlessingUsedInCombat);
          const holyShockCharges = Math.max(0, Number(cooldownBarSnapshot.holyShockCharges ?? 0));
          const holyShockHasCharge = spellKey === "holyShock" ? holyShockCharges > 0 : false;
          const coolingDown = isOneUseSpent
            ? true
            : spellKey === "holyShock"
              ? !buffActive && !holyShockHasCharge && cooldownMs > 0
              : !buffActive && cooldownMs > 0;
          const overlayLabel = buffActive
            ? `${formatSeconds(buffRemainingMs)}s`
            : isOneUseSpent
              ? "소진"
              : coolingDown
                ? `${Math.ceil(cooldownMs / 1000)}s`
                : "";
          const chargeLabel = spellKey === "holyShock" ? `${holyShockCharges}` : "";
          const bottomRightChargeLabel = spellKey === "serenity" && serenityCharges > 0
            ? `${serenityCharges}`
            : "";

          const iconNode = (
            <div
              className={`relative overflow-hidden rounded border ${coolingDown ? "border-slate-700" : "border-slate-500/80"} ${enableDragReorder ? "cursor-grab active:cursor-grabbing" : ""}`}
              style={{
                width: `${iconSizePx}px`,
                height: `${iconSizePx}px`
              }}
            >
              <img
                alt={displaySpell.name}
                className={`h-full w-full object-cover ${coolingDown ? "grayscale" : ""}`}
                onError={(event) => {
                  if (event.currentTarget.src === DEFAULT_SPELL_ICON_URL) {
                    return;
                  }
                  event.currentTarget.src = DEFAULT_SPELL_ICON_URL;
                }}
                src={displayIconUrl}
              />
              {buffActive ? <div className="absolute inset-0 bg-amber-300/10" /> : null}
              {overlayLabel ? (
                <div className={`absolute inset-0 flex items-center justify-center text-xs font-semibold ${buffActive ? "text-amber-100" : "bg-black/55 text-slate-100"}`}>
                  {overlayLabel}
                </div>
              ) : null}
              {chargeLabel ? (
                <div className="absolute left-0.5 top-0.5 rounded bg-black/70 px-1 text-[10px] font-semibold leading-none text-violet-100">
                  {chargeLabel}
                </div>
              ) : null}
              {showBindings ? (
                <div
                  className="absolute bottom-0 left-0 right-0 leading-none text-slate-100 bg-black/50"
                  style={{
                    fontSize: `${bindingFontPx}px`,
                    paddingLeft: `${bindingPaddingXPx}px`,
                    paddingRight: `${bindingPaddingXPx}px`,
                    paddingTop: `${bindingPaddingYPx}px`,
                    paddingBottom: `${bindingPaddingYPx}px`
                  }}
                >
                  {bindingLabelsForDisplay[spellKey] ?? "-"}
                </div>
              ) : null}
              {bottomRightChargeLabel ? (
                <div className="absolute bottom-0.5 right-0.5 z-20 rounded bg-black/75 px-1 text-[10px] font-semibold leading-none text-cyan-100">
                  {bottomRightChargeLabel}
                </div>
              ) : null}
            </div>
          );

          const wrapperProps = enableDragReorder
            ? {
              draggable: true,
              onDragStart: (event) => handleCooldownSpellDragStart(event, spellKey, normalizedGroupKey),
              onDragOver: handleCooldownSpellDragOver,
              onDrop: (event) => handleCooldownSpellDrop(event, normalizedGroupKey, spellKey),
              onDragEnd: handleCooldownSpellDragEnd
            }
            : {};

          if (enableWowheadTooltip && displayMeta.spellId) {
            return (
              <div key={spellKey} {...wrapperProps}>
                <a
                  className="block wh-tooltip-only-link"
                  data-wh-rename-link="false"
                  href={`https://www.wowhead.com/ko/spell=${displayMeta.spellId}`}
                  onClick={interactive ? undefined : (event) => event.preventDefault()}
                  rel="noreferrer"
                  target={interactive ? "_blank" : undefined}
                  title={displaySpell.name}
                >
                  {iconNode}
                </a>
              </div>
            );
          }

          return (
            <div key={spellKey} title={displaySpell.name} {...wrapperProps}>
              {iconNode}
            </div>
          );
        })}
        {showEmptyDropZone ? (
          <div
            className="rounded border border-dashed border-slate-600/80 bg-slate-900/60"
            style={{ width: `${iconSizePx}px`, height: `${iconSizePx}px` }}
          />
        ) : null}
      </div>
    );

    const holyPowerNode = showHolyPower ? (
      <div className="relative">
        <div className="flex justify-center">
          <div
            className="flex overflow-hidden rounded-[2px] border border-slate-700"
            style={{ width: `${holyPowerBarWidthPx}px` }}
          >
            {Array.from({ length: 5 }, (_, index) => {
              const active = index < holyPowerValue;
              return (
                <div
                  className={`border-r border-slate-800 last:border-r-0 ${active ? "bg-yellow-300/95" : "bg-slate-900/90"}`}
                  key={`holy-power-${index + 1}`}
                  style={{
                    width: `${holyPowerSegmentWidthPx}px`,
                    height: `${holyPowerCellHeightPx}px`
                  }}
                />
              );
            })}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-semibold leading-none text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.85)]">
          {holyPowerValue}
        </div>
      </div>
    ) : null;

    const manaNode = showManaBar ? (
      <div
        className="relative mx-auto h-[10px] overflow-hidden rounded-[2px] border border-slate-700 bg-gray-950/90"
        style={{ width: `${manaBarWidthPx}px` }}
      >
        <div className="h-full bg-blue-500 transition-[width] duration-100 ease-linear" style={{ width: `${manaPct}%` }} />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[9px] font-semibold leading-none text-blue-100">
          {Math.round(manaPct)}%
        </div>
      </div>
    ) : null;

    const sectionNodeByKey = {
      spells: spellRowNode,
      holyPower: holyPowerNode,
      mana: manaNode
    };

    return (
      <div
        className={containerClassName}
        onDragOver={enableDragReorder ? handleCooldownSpellDragOver : undefined}
        onDrop={enableDragReorder ? (event) => handleCooldownSpellDrop(event, normalizedGroupKey) : undefined}
      >
        {normalizedResourceSectionOrder.map((sectionKey, sectionIndex) => {
          const node = sectionNodeByKey[sectionKey];
          if (!node) {
            return null;
          }
          return (
            <div className={sectionIndex > 0 ? "mt-1.5" : undefined} key={`cooldown-section-${sectionKey}`}>
              {node}
            </div>
          );
        })}

        {showCastBar ? (
          <div
            className="mx-auto mt-1.5 overflow-hidden rounded-[2px] border border-slate-700 bg-slate-900/95"
            style={{ width: `${castBarWidthPx}px` }}
          >
            {currentCastInfo ? (
              <div
                className="relative h-5"
                key={`cast-${String(currentCastInfo.castId ?? "") || String(currentCastInfo.spellKey ?? "unknown")}`}
              >
                <div className="absolute inset-y-0 left-0 bg-violet-500/60 transition-[width] duration-100 ease-linear" style={{ width: `${castProgress * 100}%` }} />
                <div className="absolute inset-0 flex items-center justify-between gap-2 px-1.5 text-[10px] leading-none">
                  <div className="flex min-w-0 items-center gap-1 text-slate-100">
                    <img
                      alt={castDisplayName}
                      className="h-3.5 w-3.5 rounded-[2px] border border-black/40 object-cover"
                      onError={(event) => {
                        if (event.currentTarget.src === DEFAULT_SPELL_ICON_URL) {
                          return;
                        }
                        event.currentTarget.src = DEFAULT_SPELL_ICON_URL;
                      }}
                      src={castIconUrl}
                    />
                    <span className="truncate font-semibold">{castDisplayName}</span>
                  </div>
                  <span className="shrink-0 font-semibold text-slate-100">{formatSeconds(castRemainingMs)}s</span>
                </div>
              </div>
            ) : (
              <div className="flex h-5 items-center justify-center text-[10px] text-slate-400">시전 없음</div>
            )}
          </div>
        ) : null}
      </div>
    );
  }

  function renderCooldownManagerSpellResourceLayout({
    primaryIconSizePx,
    secondaryIconSizePx,
    primarySpellOrder = managerCooldownSpellOrder,
    secondarySpellOrder = secondaryCooldownSpellOrder,
    showHolyPower = false,
    showManaBar = false,
    showCastBar = false,
    resourceSectionOrder = DEFAULT_COOLDOWN_RESOURCE_BAR_LAYOUT.sectionOrder,
    holyPowerWidthBonusPx = 0,
    manaBarWidthBonusPx = 0,
    showBindings = true,
    enableWowheadTooltip = false,
    enableDragReorder = false,
    interactive = false
  }) {
    const visibleSectionKeys = ["spells"];
    if (showHolyPower) {
      visibleSectionKeys.push("holyPower");
    }
    if (showManaBar) {
      visibleSectionKeys.push("mana");
    }
    if (showCastBar) {
      visibleSectionKeys.push("castBar");
    }
    const normalizedSectionOrder = resolveVisibleCooldownResourceSectionOrder(
      resourceSectionOrder,
      visibleSectionKeys
    );
    const normalizedSecondarySpellOrder = Array.isArray(secondarySpellOrder) ? secondarySpellOrder : [];

    // spells section is a single bundle: primary row + secondary row.
    const spellSectionNode = (
      <div>
        {renderCooldownManagerBar({
          iconSizePx: primaryIconSizePx,
          holyPowerCellWidthPx: COOLDOWN_MANAGER_LAYOUT_CONFIG.overlayHolyPowerCellWidthPx,
          holyPowerCellHeightPx: COOLDOWN_MANAGER_LAYOUT_CONFIG.overlayHolyPowerCellHeightPx,
          spellOrder: primarySpellOrder,
          groupKey: "manager",
          interactive,
          enableWowheadTooltip,
          showHolyPower: false,
          showManaBar: false,
          showCastBar: false,
          showBindings,
          enableDragReorder,
          showFrame: false
        })}
        {normalizedSecondarySpellOrder.length > 0 ? (
          <div style={{ marginTop: `${COOLDOWN_MANAGER_SPELL_SECTION_INNER_GAP_PX}px` }}>
            {renderCooldownManagerBar({
              iconSizePx: secondaryIconSizePx,
              holyPowerCellWidthPx: COOLDOWN_MANAGER_LAYOUT_CONFIG.overlayHolyPowerCellWidthPx,
              holyPowerCellHeightPx: COOLDOWN_MANAGER_LAYOUT_CONFIG.overlayHolyPowerCellHeightPx,
              spellOrder: normalizedSecondarySpellOrder,
              groupKey: "secondary",
              interactive,
              enableWowheadTooltip,
              showHolyPower: false,
              showManaBar: false,
              showCastBar: false,
              showBindings,
              enableDragReorder,
              showFrame: false
            })}
          </div>
        ) : null}
      </div>
    );

    const holyPowerSectionNode = showHolyPower
      ? renderCooldownManagerBar({
        iconSizePx: secondaryIconSizePx,
        holyPowerCellWidthPx: COOLDOWN_MANAGER_LAYOUT_CONFIG.overlayHolyPowerCellWidthPx,
        holyPowerCellHeightPx: COOLDOWN_MANAGER_LAYOUT_CONFIG.overlayHolyPowerCellHeightPx,
        spellOrder: [],
        groupKey: "secondary",
        interactive,
        enableWowheadTooltip: false,
        showHolyPower: true,
        showManaBar: false,
        showCastBar: false,
        holyPowerWidthBonusPx,
        showBindings: false,
        enableDragReorder: false,
        showFrame: false
      })
      : null;

    const manaSectionNode = showManaBar
      ? renderCooldownManagerBar({
        iconSizePx: secondaryIconSizePx,
        holyPowerCellWidthPx: COOLDOWN_MANAGER_LAYOUT_CONFIG.overlayHolyPowerCellWidthPx,
        holyPowerCellHeightPx: COOLDOWN_MANAGER_LAYOUT_CONFIG.overlayHolyPowerCellHeightPx,
        spellOrder: [],
        groupKey: "secondary",
        interactive,
        enableWowheadTooltip: false,
        showHolyPower: false,
        showManaBar: true,
        showCastBar: false,
        manaBarWidthBonusPx,
        showBindings: false,
        enableDragReorder: false,
        showFrame: false
      })
      : null;

    const castBarTopMarginPx = Math.max(0, Number(COOLDOWN_MANAGER_CAST_BAR_TOP_MARGIN_PX) || 0);
    const castBarBottomMarginPx = Math.max(0, Number(COOLDOWN_MANAGER_CAST_BAR_BOTTOM_MARGIN_PX) || 0);
    const castBarSectionNode = showCastBar
      ? (
        <div
          style={
            castBarTopMarginPx > 0 || castBarBottomMarginPx > 0
              ? {
                marginTop: castBarTopMarginPx > 0 ? `${castBarTopMarginPx}px` : undefined,
                marginBottom: castBarBottomMarginPx > 0 ? `${castBarBottomMarginPx}px` : undefined
              }
              : undefined
          }
        >
          {renderCooldownManagerBar({
            iconSizePx: secondaryIconSizePx,
            holyPowerCellWidthPx: COOLDOWN_MANAGER_LAYOUT_CONFIG.overlayHolyPowerCellWidthPx,
            holyPowerCellHeightPx: COOLDOWN_MANAGER_LAYOUT_CONFIG.overlayHolyPowerCellHeightPx,
            spellOrder: [],
            groupKey: "secondary",
            interactive,
            enableWowheadTooltip: false,
            showHolyPower: false,
            showManaBar: false,
            showCastBar: true,
            showBindings: false,
            enableDragReorder: false,
            showFrame: false
          })}
        </div>
      )
      : null;

    const sectionNodeByKey = {
      spells: spellSectionNode,
      holyPower: holyPowerSectionNode,
      mana: manaSectionNode,
      castBar: castBarSectionNode
    };

    return (
      <div>
        {normalizedSectionOrder.map((sectionKey, sectionIndex) => {
          const node = sectionNodeByKey[sectionKey];
          if (!node) {
            return null;
          }
          return (
            <div
              key={`spell-resource-layout-${sectionKey}`}
              style={
                sectionIndex > 0
                  ? { marginTop: `${COOLDOWN_MANAGER_RESOURCE_SECTION_GAP_PX}px` }
                  : undefined
              }
            >
              {node}
            </div>
          );
        })}
      </div>
    );
  }

  if (HEALER_PRACTICE_DESKTOP_ONLY_CONFIG?.enabled !== false && !isDesktopEnvironment) {
    return (
      <div className="mt-8">
        <section className="rounded-2xl border border-rose-400/40 bg-rose-950/30 p-6 text-center">
          <p className="text-lg font-semibold text-rose-100">
            {String(HEALER_PRACTICE_DESKTOP_ONLY_CONFIG?.unsupportedMessage ?? "데스크탑 환경만 지원됩니다 ㅠㅠ")}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-5">
      {!inCombatView ? (
        <>
          <section className="rounded-2xl border border-slate-700 bg-gray-950/55 p-4">
            <div className="flex flex-wrap gap-2">
              {healers.map((healer) => {
                const isSelected = hasExplicitHealerSelection && healer.slug === selectedHealerSlug;
                const isCurrent = IMPLEMENTED_HEALER_SLUGS.has(healer.slug);
                const isCardDisabled = running || !isCurrent;
                return (
                  <button
                    className={`w-[108px] rounded-xl border p-2 text-center transition ${isSelected
                      ? "border-violet-300/70 bg-slate-900"
                      : "border-slate-700 bg-slate-900/50"
                      } ${isCurrent ? "" : "opacity-70 grayscale"} disabled:cursor-not-allowed`}
                    disabled={isCardDisabled}
                    key={healer.slug}
                    onClick={() => {
                      if (isCardDisabled) {
                        return;
                      }
                      markSetupDirty();
                      setHasExplicitHealerSelection(true);
                      const nextRuntime = resolveHealerPracticeRuntime(healer.slug);
                      setSelectedHealerSlug(healer.slug);
                      setKeyboardBindings(
                        buildDefaultKeyboardBindings(nextRuntime.activeSpellKeys, nextRuntime.defaultKeybinds)
                      );
                      setClickCastBindings(
                        buildDefaultClickCastBindings(
                          nextRuntime.clickCastableKeys,
                          nextRuntime.defaultClickCastPreferred
                        )
                      );
                      const nextCooldownOrderBuckets = buildCooldownManagerSpellOrderBuckets(
                        nextRuntime.activeSpellKeys,
                        nextRuntime.cooldownManagerSpellKeys,
                        nextRuntime.cooldownManagerSecondarySpellKeys,
                        nextRuntime.cooldownManagerNonDisplaySpellKeys
                      );
                      cooldownSpellOrderRef.current = nextCooldownOrderBuckets.manager;
                      cooldownSecondarySpellOrderRef.current = nextCooldownOrderBuckets.secondary;
                      cooldownReserveSpellOrderRef.current = nextCooldownOrderBuckets.reserve;
                      setCooldownSpellOrder(nextCooldownOrderBuckets.manager);
                      setCooldownSecondarySpellOrder(nextCooldownOrderBuckets.secondary);
                      setCooldownReserveSpellOrder(nextCooldownOrderBuckets.reserve);
                      const nextSpecialProcOrder = buildSpecialProcDisplayOrder(
                        nextRuntime.specialProcDisplayConfig,
                        []
                      );
                      specialProcOrderKeysRef.current = nextSpecialProcOrder;
                      setSpecialProcOrderKeys(nextSpecialProcOrder);
                      const nextSpecialProcEnabledKeys = buildSpecialProcEnabledKeys(
                        nextRuntime.specialProcDisplayConfig
                      );
                      specialProcEnabledKeysRef.current = nextSpecialProcEnabledKeys;
                      setSpecialProcEnabledKeys(nextSpecialProcEnabledKeys);
                    }}
                    type="button"
                  >
                    <img
                      alt={`${healer.shortName} icon`}
                      className="mx-auto h-10 w-10 rounded-lg border border-slate-700 object-cover"
                      src={healer.classIcon}
                    />
                    <p className="mt-1 text-xs font-semibold text-slate-100">{healer.shortName}</p>
                    <p className={`text-[10px] ${isCurrent ? "text-violet-200" : "text-slate-400"}`}>{isCurrent ? "사용 가능" : "준비중"}</p>
                  </button>
                );
              })}
            </div>
            {!hasExplicitHealerSelection ? (
              <p className="mt-3 text-xs text-slate-300">아래 세팅을 열려면 힐러 아이콘을 선택하세요.</p>
            ) : null}
            {hasExplicitHealerSelection && selectedHealerMeta && (selectedHealerDisclaimers.length || selectedHealerPatchMeta) ? (
              <div className="mt-3 relative rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-2 text-xs text-violet-100">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{selectedHealerMeta.shortName} 안내</p>
                  <button
                    className="rounded-md bg-violet-600 px-3 py-1.5 text-[15px] font-medium tracking-wide text-white hover:bg-violet-500"
                    onClick={() => setPatchNotesModalOpen(true)}
                    type="button"
                  >
                    패치 노트
                  </button>
                </div>
                {selectedHealerPatchMeta ? (
                  <p className="mt-1 text-[11px] leading-tight text-amber-200">
                    {selectedHealerPatchMeta.lastUpdatedAt ? `최종 수정: ${selectedHealerPatchMeta.lastUpdatedAt}` : ""}
                    {selectedHealerPatchMeta.lastUpdatedAt && selectedHealerPatchMeta.patchVersion ? " | " : ""}
                    {selectedHealerPatchMeta.patchVersion ? `패치 버전: ${selectedHealerPatchMeta.patchVersion}` : ""}
                  </p>
                ) : null}
                {selectedHealerDisclaimers.length ? (
                  <ul className="mt-1 list-disc space-y-1 pl-4">
                    {selectedHealerDisclaimers.map((line, index) => (
                      <li key={`${selectedHealerSlug}-disclaimer-${index}`}>
                        {renderWowheadInlineTokenText(line, `${selectedHealerSlug}-disclaimer-${index}`)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </section>

          {showPreCombatSetupSections ? (
            <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-slate-700 bg-gray-950/50 p-4">
                <h2 className="text-base font-semibold text-violet-100">연습 시작 전 설정</h2>
                <p className="mt-1 text-xs text-slate-400">마우스오버/클릭캐스팅/단축키를 먼저 확정한 뒤 시작하세요.</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="text-sm text-slate-200">
                    난이도
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                      disabled={running}
                      onChange={(event) => {
                        markSetupDirty();
                        setDifficultyKey(event.target.value);
                      }}
                      value={difficultyKey}
                    >
                      {selectedDifficultyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm text-slate-200">
                    이동키
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                      disabled={running}
                      onChange={(event) => {
                        markSetupDirty();
                        setMovementKeyPreset(normalizeMovementPreset(event.target.value));
                      }}
                      value={movementKeyPreset}
                    >
                      {MOVEMENT_KEY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm text-slate-200">
                    맵
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                      disabled={running}
                      onChange={(event) => {
                        markSetupDirty();
                        setSelectedMapKey(event.target.value);
                      }}
                      value={selectedMapKey}
                    >
                      {HEALER_PRACTICE_MAP_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm text-slate-200">
                    레이드 프레임 (Row x Col)
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                      disabled={running}
                      onChange={(event) => {
                        markSetupDirty();
                        setRaidFrameLayout(event.target.value);
                      }}
                      value={raidFrameLayout}
                    >
                      {RAID_LAYOUT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm text-slate-200">
                    내 위치
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                      disabled={running}
                      onChange={(event) => {
                        markSetupDirty();
                        setMyRaidFramePositionMode(normalizeMyRaidFramePositionMode(event.target.value));
                      }}
                      value={myRaidFramePositionMode}
                    >
                      {MY_RAID_FRAME_POSITION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {normalizeMovementPreset(movementKeyPreset) === "CUSTOM" ? (
                  <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                    <p className="text-xs font-semibold text-slate-100">커스텀 이동키</p>
                    <p className="mt-1 text-[11px] leading-tight text-slate-400">
                      전투 이동 입력에 직접 사용됩니다. 여기에 넣은 키는 스킬 단축키로 배정할 수 없습니다.
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {CUSTOM_MOVEMENT_DIRECTION_OPTIONS.map((option) => (
                        <label className="text-xs text-slate-300" key={option.value}>
                          {option.label}
                          <input
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-center text-xs leading-tight text-slate-100"
                            disabled={running}
                            maxLength={12}
                            onChange={(event) => handleCustomMovementKeyChange(option.value, event.target.value)}
                            value={customMovementKeys[option.value] ?? ""}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-3 space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-200">
                    <input
                      checked={useMouseover}
                      disabled={running}
                      onChange={(event) => {
                        markSetupDirty();
                        setUseMouseover(event.target.checked);
                      }}
                      type="checkbox"
                    />
                    마우스오버 타겟 사용
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-200">
                    <input
                      checked={useClickCasting}
                      disabled={running}
                      onChange={(event) => {
                        markSetupDirty();
                        setUseClickCasting(event.target.checked);
                      }}
                      type="checkbox"
                    />
                    클릭캐스팅 사용
                  </label>
                  {selectedHealerSlug === HOLY_PRIEST_HEALER_SLUG ? (
                    <label className="flex items-center gap-2 text-sm text-slate-200">
                      <input
                        checked={showHolyPriestEchoOnRaidFrames}
                        disabled={running}
                        onChange={(event) => {
                          markSetupDirty();
                          setShowHolyPriestEchoOnRaidFrames(event.target.checked);
                        }}
                        type="checkbox"
                      />
                      빛의 반향 레이드 프레임 표시
                    </label>
                  ) : null}
                </div>

                {useClickCasting ? (
                  <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                    <p className="text-xs font-semibold text-slate-100">클릭캐스팅 설정</p>
                    <div className="mt-1.5 space-y-1.5">
                      {clickCastableKeys.map((spellKey) => {
                        const spell = practiceSpellsByKey[spellKey];
                        if (!spell) {
                          return null;
                        }
                        const clickCastSpellMeta = practiceCooldownSpellMetaByKey[spell.key] ?? {};
                        const clickCastSpellId = Number.isFinite(clickCastSpellMeta.spellId)
                          ? Number(clickCastSpellMeta.spellId)
                          : null;
                        return (
                          <label className="grid grid-cols-[1fr_168px] items-center gap-1.5" key={spell.key}>
                            <div className="min-w-0">
                              {clickCastSpellId ? (
                                <a
                                  className="block min-w-0 truncate text-xs font-semibold leading-tight text-slate-200"
                                  data-wh-icon-size="small"
                                  data-wh-rename-link="false"
                                  href={`https://www.wowhead.com/ko/spell=${clickCastSpellId}`}
                                  rel="noreferrer"
                                  target="_blank"
                                  title={spell.name}
                                >
                                  {spell.name}
                                </a>
                              ) : (
                                <span className="block truncate text-xs font-semibold leading-tight text-slate-200">{spell.name}</span>
                              )}
                            </div>
                            <select
                              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs leading-tight text-slate-100"
                              disabled={running}
                              onChange={(event) => handleClickCastBindingChange(spell.key, event.target.value)}
                              value={clickCastBindings[spell.key] ?? ""}
                            >
                              {MOUSE_BINDING_OPTIONS.map((option) => (
                                <option key={option.token || "none"} value={option.token}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

              </div>

              <div className="rounded-2xl border border-slate-700 bg-gray-950/50 p-4">
                <h2 className="text-sm font-semibold text-violet-100">단축키 맵</h2>
                <p className="mt-1 text-[11px] leading-tight text-slate-400">
                  조합키 + 키를 설정합니다. 클릭캐스팅에 배정된 스킬은 자동으로 마우스 조합이 표시됩니다.
                </p>
                <div className="mt-3 space-y-1.5">
                  {activeSpells.map((spell) => {
                    const assignedMouseToken = useClickCasting ? clickCastBindings[spell.key] : "";
                    const mouseBound = Boolean(assignedMouseToken && clickCastableSet.has(spell.key));
                    const keybindSpellMeta = practiceCooldownSpellMetaByKey[spell.key] ?? {};
                    return (
                      <div className="grid grid-cols-[1fr_95px_90px] items-center gap-1.5" key={spell.key}>
                        <div className="min-w-0">
                          {Number.isFinite(keybindSpellMeta.spellId) ? (
                            <a
                              className="block min-w-0 truncate text-xs font-semibold leading-tight text-slate-200"
                              data-wh-icon-size="small"
                              data-wh-rename-link="false"
                              href={`https://www.wowhead.com/ko/spell=${keybindSpellMeta.spellId}`}
                              rel="noreferrer"
                              target="_blank"
                              title={spell.name}
                            >
                              {spell.name}
                            </a>
                          ) : (
                            <span className="block truncate text-xs font-semibold leading-tight text-slate-200">{spell.name}</span>
                          )}
                        </div>
                        {mouseBound ? (
                          <div className="col-span-2 rounded-lg border border-violet-600/50 bg-violet-900/20 px-2 py-1 text-center text-xs leading-tight text-violet-100">
                            {MOUSE_UI_LABEL_BY_TOKEN[assignedMouseToken] ?? assignedMouseToken}
                          </div>
                        ) : (
                          <>
                            <select
                              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs leading-tight text-slate-100"
                              disabled={running}
                              onChange={(event) => handleModifierChange(spell.key, event.target.value)}
                              value={keyboardBindings[spell.key]?.modifier ?? ""}
                            >
                              {MODIFIER_OPTIONS.map((option) => (
                                <option key={option.value || "none"} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <input
                              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-center text-xs leading-tight text-slate-100"
                              disabled={running}
                              maxLength={12}
                              onChange={(event) => handleKeyInputChange(spell.key, event.target.value)}
                              value={keyboardBindings[spell.key]?.key ?? ""}
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : null}

          {showPreCombatSetupSections ? (
            <section className="rounded-xl border border-slate-700 bg-gray-950/40 px-4 py-3">
              <p className={`text-sm ${setupConfirmed ? "text-emerald-300" : "text-amber-300"}`}>
                설정 상태: {setupConfirmed ? "완료" : "미완료 (아래의 설정 완료 버튼을 누르세요)"}
                {setupConfirmed
                  ? ` | 난이도: ${resolveDifficultyConfigByKey(selectedDifficultyTuning, difficultyKey)?.label ?? difficultyKey
                  } (${resolveCombatDurationMinutesByDifficulty(difficultyKey, selectedDifficultyTuning)}분)`
                  : ""}
              </p>
              {setupConfirmed && Number.isFinite(Number(setupSeed)) ? (
                <p className="mt-1 text-[11px] text-slate-400">Seed: {Math.floor(Number(setupSeed))}</p>
              ) : null}
              {statusText ? <p className="mt-2 text-xs text-slate-300">{statusText}</p> : null}
              {duplicateKeyboardBindings.length ? (
                <p className="mt-1 text-xs text-amber-300">중복 키보드 단축키: {duplicateKeyboardBindings.join(", ")}</p>
              ) : null}
              {blockedKeyboardBindings.length ? (
                <p className="mt-1 text-xs text-amber-300">사용 불가 조합: {blockedKeyboardBindings.join(", ")}</p>
              ) : null}
              {useClickCasting && duplicateMouseBindings.length ? (
                <p className="mt-1 text-xs text-amber-300">
                  중복 클릭캐스팅 조합: {duplicateMouseBindings.map((token) => MOUSE_UI_LABEL_BY_TOKEN[token] ?? token).join(", ")}
                </p>
              ) : null}
              <div className="flex justify-center">
                <button
                  className="rounded-lg border border-violet-400/60 bg-violet-500/15 px-3 py-2 text-sm text-violet-100 transition hover:bg-violet-500/25"
                  disabled={running}
                  onClick={handleConfirmSetup}
                  type="button"
                >
                  설정 완료!
                </button>
              </div>

              {!isLoggedIn ? (
                <p className="mt-1 text-center text-[11px] text-slate-400">
                  로그인하면 힐러별 세팅을 DB에 저장하고 자동으로 불러옵니다.
                </p>
              ) : null}
              <p className="mt-2 text-center text-[11px] leading-tight text-slate-400">
                "설정 완료"를 한 번 더 누르면, seed가 바뀌어서 데미지 그래프가 달라지지만 전체 데미지 총합은 유지됩니다.
              </p>
              {isLoggedIn ? (
                <p className="mt-1 text-center text-[11px] leading-tight text-slate-400">
                  영웅/신화/월퍼킬 난이도에서 전투 성공 후 랭킹 저장이 가능합니다.
                </p>
              ) : null}

            </section>
          ) : null}
          {showPreCombatSetupSections && setupConfirmed ? (
            <section className="rounded-2xl border border-slate-700 bg-gray-950/55 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-violet-100">보스 데미지 그래프</h2>
                <p className="text-[11px] text-slate-400">
                  Seed {bossDamageGraphPreview ? bossDamageGraphPreview.seed : "-"} · {BOSS_DAMAGE_GRAPH_BUCKET_MS / 1000}s 버킷
                </p>
              </div>
              <p className="mt-1 text-[11px] leading-tight text-slate-400">
                WCL 시간축 느낌으로, 전투 중 공대가 받는 기본 피해량을 초 단위로 미리 보여줍니다.
              </p>
              {bossDamageGraphPreview ? (
                <div className="mt-2 overflow-x-auto">
                  <svg
                    className="h-48 min-w-[680px] w-full"
                    preserveAspectRatio="none"
                    viewBox={`0 0 ${BOSS_DAMAGE_GRAPH_VIEWBOX_WIDTH} ${BOSS_DAMAGE_GRAPH_VIEWBOX_HEIGHT}`}
                  >
                    <defs>
                      <linearGradient id="boss-damage-area-gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0.06" />
                      </linearGradient>
                    </defs>
                    {bossDamageGraphPreview.yTicks.map((tick, index) => (
                      <g key={`boss-dmg-y-tick-${index}`}>
                        <line
                          stroke="#334155"
                          strokeDasharray="3 3"
                          strokeWidth="1"
                          x1={BOSS_DAMAGE_GRAPH_PADDING.left}
                          x2={BOSS_DAMAGE_GRAPH_VIEWBOX_WIDTH - BOSS_DAMAGE_GRAPH_PADDING.right}
                          y1={tick.y}
                          y2={tick.y}
                        />
                        <text
                          fill="#94a3b8"
                          fontSize="10"
                          textAnchor="end"
                          x={BOSS_DAMAGE_GRAPH_PADDING.left - 6}
                          y={tick.y + 3}
                        >
                          {formatHealingAmount(tick.value)}
                        </text>
                      </g>
                    ))}
                    {bossDamageGraphPreview.timeTicks.map((tick, index) => (
                      <g key={`boss-dmg-x-tick-${index}`}>
                        <line
                          stroke="#1e293b"
                          strokeWidth="1"
                          x1={tick.x}
                          x2={tick.x}
                          y1={BOSS_DAMAGE_GRAPH_PADDING.top}
                          y2={BOSS_DAMAGE_GRAPH_VIEWBOX_HEIGHT - BOSS_DAMAGE_GRAPH_PADDING.bottom}
                        />
                        <text
                          fill="#94a3b8"
                          fontSize="10"
                          textAnchor="middle"
                          x={tick.x}
                          y={BOSS_DAMAGE_GRAPH_VIEWBOX_HEIGHT - 8}
                        >
                          {formatTime(tick.timeMs)}
                        </text>
                      </g>
                    ))}
                    {bossDamageGraphPreview.areaPath ? (
                      <path d={bossDamageGraphPreview.areaPath} fill="url(#boss-damage-area-gradient)" />
                    ) : null}
                    {bossDamageGraphPreview.linePath ? (
                      <path
                        d={bossDamageGraphPreview.linePath}
                        fill="none"
                        stroke="#fb923c"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    ) : null}
                  </svg>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
                    <p>총 기본 피해: {formatHealingAmount(bossDamageGraphPreview.totalDamage)}</p>
                    <p>최대 초당 피해: {formatHealingAmount(bossDamageGraphPreview.maxDamage)}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-[11px] text-slate-500">설정 완료 후 그래프가 생성됩니다.</p>
              )}
            </section>
          ) : null}
          {showPreCombatSetupSections && setupConfirmed ? (
            <section className="rounded-2xl border border-slate-700 bg-gray-950/55 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-violet-100">쿨다운 매니저</h2>
                {/* <p className="text-xs text-slate-400">하단 오버레이로 현재 키바인딩이 함께 표시됩니다.</p> */}
              </div>
              {/* <p className="mt-1 text-sm text-slate-400">
                각 아이콘을 드래그해서 스킬 순서를 바꾸면, 실제 레이드 프레임 위 쿨다운 매니저에도 같은 순서로 반영됩니다.
              </p> */}

              {setupSpecialProcDisplayEntries.length ? (
                <div className="mt-3 flex justify-center">
                  <div
                    className="rounded-lg border border-slate-800 bg-slate-900/35 p-3"
                    style={{ width: `min(100%, ${setupSpecialProcSectionWidthPx}px)` }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-slate-300">버프 프록 리스트</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                        <span>{`크기 ${configuredSpecialProcOverlayIconSizePx}px`}</span>
                        <button
                          className="h-5 w-5 rounded border border-slate-600/80 bg-black/70 text-[11px] leading-none text-slate-100 disabled:opacity-35"
                          disabled={configuredSpecialProcOverlayIconSizePx <= DEFAULT_SPECIAL_PROC_ICON_SIZE_PX}
                          onClick={() =>
                            setSpecialProcOverlayIconSizePx((prev) =>
                              Math.max(DEFAULT_SPECIAL_PROC_ICON_SIZE_PX, Number(prev ?? DEFAULT_SPECIAL_PROC_ICON_SIZE_PX) - 1)
                            )
                          }
                          type="button"
                        >
                          -
                        </button>
                        <button
                          className="h-5 w-5 rounded border border-slate-600/80 bg-black/70 text-[11px] leading-none text-slate-100 disabled:opacity-35"
                          disabled={configuredSpecialProcOverlayIconSizePx >= maxSpecialProcOverlayIconSizePx}
                          onClick={() =>
                            setSpecialProcOverlayIconSizePx((prev) =>
                              Math.min(maxSpecialProcOverlayIconSizePx, Number(prev ?? DEFAULT_SPECIAL_PROC_ICON_SIZE_PX) + 1)
                            )
                          }
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-start justify-center gap-2">
                      <div
                        className="shrink-0 rounded-md border border-emerald-400/25 bg-black/65 p-2"
                        style={{ width: `${setupSpecialProcEnabledPaneWidthPx}px` }}
                      >
                        <p className="text-[10px] font-semibold text-emerald-200">ON 리스트</p>
                        <div className="mt-1 flex flex-nowrap items-center gap-1.5 overflow-visible pr-0.5">
                          {setupSpecialProcEnabledEntries.length ? (
                            setupSpecialProcEnabledEntries.map((proc, index) => {
                              const canMoveLeft = index > 0;
                              const canMoveRight = index < setupSpecialProcEnabledEntries.length - 1;
                              const icon = (
                                <div
                                  className="relative overflow-hidden rounded border border-slate-600/80 bg-black/70"
                                  style={{
                                    width: `${configuredSpecialProcOverlayIconSizePx}px`,
                                    height: `${configuredSpecialProcOverlayIconSizePx}px`
                                  }}
                                  title={proc.label}
                                >
                                  <img
                                    alt={proc.label}
                                    className="h-full w-full object-cover"
                                    onError={(event) => {
                                      if (event.currentTarget.src === DEFAULT_SPELL_ICON_URL) {
                                        return;
                                      }
                                      event.currentTarget.src = DEFAULT_SPELL_ICON_URL;
                                    }}
                                    src={proc.iconUrl}
                                  />
                                </div>
                              );
                              const iconNode = proc.spellId
                                ? (
                                  <a
                                    className="block wh-tooltip-only-link"
                                    data-wh-rename-link="false"
                                    href={`https://www.wowhead.com/ko/spell=${proc.spellId}`}
                                    onClick={(event) => event.preventDefault()}
                                    rel="noreferrer"
                                    title={proc.label}
                                  >
                                    {icon}
                                  </a>
                                )
                                : icon;
                              return (
                                <div className="relative shrink-0 pt-3" key={`setup-proc-on-${proc.id}`}>
                                  <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-[1px]">
                                    <button
                                      className="pointer-events-auto h-3.5 w-3.5 rounded border border-slate-600/70 bg-black/80 text-[8px] leading-none text-slate-200 disabled:opacity-35"
                                      disabled={!canMoveLeft}
                                      onClick={() => shiftSpecialProcOrder(proc.key, -1)}
                                      type="button"
                                    >
                                      ◀
                                    </button>
                                    <button
                                      className="pointer-events-auto h-3.5 w-3.5 rounded border border-slate-600/70 bg-black/80 text-[8px] leading-none text-slate-200 disabled:opacity-35"
                                      disabled={!canMoveRight}
                                      onClick={() => shiftSpecialProcOrder(proc.key, 1)}
                                      type="button"
                                    >
                                      ▶
                                    </button>
                                  </div>
                                  {iconNode}
                                  <button
                                    className="mt-1 h-3.5 w-full rounded border border-rose-400/55 bg-rose-500/15 text-[8px] font-semibold leading-none text-rose-100"
                                    onClick={() => setSpecialProcEnabledState(proc.key, false)}
                                    type="button"
                                  >
                                    X
                                  </button>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-[10px] text-slate-500">표시 중인 버프 없음</p>
                          )}
                        </div>
                      </div>
                      <div
                        className="shrink-0 rounded-md border border-slate-700/80 bg-slate-800/45 p-2"
                        style={{ width: `${setupSpecialProcDisabledPaneWidthPx}px` }}
                      >
                        <p className="text-[10px] font-semibold text-slate-300">OFF 리스트</p>
                        <div className="mt-1 flex flex-nowrap items-center gap-1.5 overflow-visible pr-0.5">
                          {setupSpecialProcDisabledEntries.length ? (
                            setupSpecialProcDisabledEntries.map((proc) => {
                              const icon = (
                                <div
                                  className="relative overflow-hidden rounded border border-slate-700/85 bg-slate-800/70"
                                  style={{
                                    width: `${configuredSpecialProcOverlayIconSizePx}px`,
                                    height: `${configuredSpecialProcOverlayIconSizePx}px`
                                  }}
                                  title={proc.label}
                                >
                                  <img
                                    alt={proc.label}
                                    className="h-full w-full object-cover grayscale opacity-55"
                                    onError={(event) => {
                                      if (event.currentTarget.src === DEFAULT_SPELL_ICON_URL) {
                                        return;
                                      }
                                      event.currentTarget.src = DEFAULT_SPELL_ICON_URL;
                                    }}
                                    src={proc.iconUrl}
                                  />
                                </div>
                              );
                              const iconNode = proc.spellId
                                ? (
                                  <a
                                    className="block wh-tooltip-only-link"
                                    data-wh-rename-link="false"
                                    href={`https://www.wowhead.com/ko/spell=${proc.spellId}`}
                                    onClick={(event) => event.preventDefault()}
                                    rel="noreferrer"
                                    title={proc.label}
                                  >
                                    {icon}
                                  </a>
                                )
                                : icon;
                              return (
                                <div className="relative shrink-0" key={`setup-proc-off-${proc.id}`}>
                                  {iconNode}
                                  <button
                                    className="mt-1 h-3.5 w-full rounded border border-emerald-400/55 bg-emerald-500/15 text-[8px] font-semibold leading-none text-emerald-100"
                                    onClick={() => setSpecialProcEnabledState(proc.key, true)}
                                    type="button"
                                  >
                                    ON
                                  </button>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-[10px] text-slate-500">비활성 버프 없음</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-3 flex justify-center">
                <div className="relative">
                  <div className="absolute right-full top-0 mr-3 w-max max-w-[240px] rounded-lg border border-slate-700/80 bg-slate-900/55 p-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
                    <p className="text-[11px] font-semibold text-slate-200">스킬 아이콘 크기</p>
                    <div className="mt-1 space-y-1">
                      <div className="rounded border border-slate-700/70 bg-black/35 px-1.5 py-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold text-slate-200">
                            {`첫째줄 ${cooldownManagerPrimaryIconSizePx}px (기본 ${DEFAULT_COOLDOWN_MANAGER_PRIMARY_ICON_SIZE_PX}px)`}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              className="h-4 w-4 rounded border border-slate-600/80 bg-black/70 text-[9px] leading-none text-slate-100 disabled:opacity-35"
                              disabled={cooldownManagerPrimaryIconSizePx <= MIN_COOLDOWN_MANAGER_PRIMARY_ICON_SIZE_PX}
                              onClick={() =>
                                setCooldownManagerPrimaryIconSizeSettingPx((prev) =>
                                  Math.max(
                                    MIN_COOLDOWN_MANAGER_PRIMARY_ICON_SIZE_PX,
                                    Math.round(Number(prev ?? DEFAULT_COOLDOWN_MANAGER_PRIMARY_ICON_SIZE_PX)) - COOLDOWN_MANAGER_ICON_SIZE_STEP_PX
                                  )
                                )
                              }
                              type="button"
                            >
                              ◀
                            </button>
                            <button
                              className="h-4 w-4 rounded border border-slate-600/80 bg-black/70 text-[9px] leading-none text-slate-100 disabled:opacity-35"
                              disabled={cooldownManagerPrimaryIconSizePx >= MAX_COOLDOWN_MANAGER_PRIMARY_ICON_SIZE_PX}
                              onClick={() =>
                                setCooldownManagerPrimaryIconSizeSettingPx((prev) =>
                                  Math.min(
                                    MAX_COOLDOWN_MANAGER_PRIMARY_ICON_SIZE_PX,
                                    Math.round(Number(prev ?? DEFAULT_COOLDOWN_MANAGER_PRIMARY_ICON_SIZE_PX)) + COOLDOWN_MANAGER_ICON_SIZE_STEP_PX
                                  )
                                )
                              }
                              type="button"
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="rounded border border-slate-700/70 bg-black/35 px-1.5 py-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold text-slate-200">
                            {`둘째줄 ${cooldownManagerSecondaryIconSizePx}px (기본 ${DEFAULT_COOLDOWN_MANAGER_SECONDARY_ICON_SIZE_PX}px)`}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              className="h-4 w-4 rounded border border-slate-600/80 bg-black/70 text-[9px] leading-none text-slate-100 disabled:opacity-35"
                              disabled={cooldownManagerSecondaryIconSizePx <= MIN_COOLDOWN_MANAGER_SECONDARY_ICON_SIZE_PX}
                              onClick={() =>
                                setCooldownManagerSecondaryIconSizeSettingPx((prev) =>
                                  Math.max(
                                    MIN_COOLDOWN_MANAGER_SECONDARY_ICON_SIZE_PX,
                                    Math.round(Number(prev ?? DEFAULT_COOLDOWN_MANAGER_SECONDARY_ICON_SIZE_PX)) - COOLDOWN_MANAGER_ICON_SIZE_STEP_PX
                                  )
                                )
                              }
                              type="button"
                            >
                              ◀
                            </button>
                            <button
                              className="h-4 w-4 rounded border border-slate-600/80 bg-black/70 text-[9px] leading-none text-slate-100 disabled:opacity-35"
                              disabled={cooldownManagerSecondaryIconSizePx >= MAX_COOLDOWN_MANAGER_SECONDARY_ICON_SIZE_PX}
                              onClick={() =>
                                setCooldownManagerSecondaryIconSizeSettingPx((prev) =>
                                  Math.min(
                                    MAX_COOLDOWN_MANAGER_SECONDARY_ICON_SIZE_PX,
                                    Math.round(Number(prev ?? DEFAULT_COOLDOWN_MANAGER_SECONDARY_ICON_SIZE_PX)) + COOLDOWN_MANAGER_ICON_SIZE_STEP_PX
                                  )
                                )
                              }
                              type="button"
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-black/70 p-3 shadow-[0_8px_28px_rgba(0,0,0,0.45)]">
                    <p className="mb-2 rounded-md border border-cyan-300/60 bg-cyan-400/15 px-2 py-1 text-center text-xs font-semibold text-cyan-100">
                      아이콘을 드래그해서 위치를 이동할 수 있습니다.<br />
                      (위아래 줄 이동도 가능)
                    </p>
                    {renderCooldownManagerSpellResourceLayout({
                      primaryIconSizePx: cooldownManagerPrimaryIconSizePx,
                      secondaryIconSizePx: cooldownManagerSecondaryIconSizePx,
                      primarySpellOrder: managerCooldownSpellOrder,
                      secondarySpellOrder: secondaryCooldownSpellOrder,
                      showHolyPower: selectedHealerIsHolyPaladin,
                      showManaBar: selectedHealerSupportsCooldownResourceOrder,
                      showCastBar: selectedHealerSupportsCooldownResourceOrder,
                      resourceSectionOrder: setupVisibleCooldownResourceSectionOrder,
                      holyPowerWidthBonusPx: selectedHealerIsHolyPaladin
                        ? normalizedCooldownResourceBarLayout.holyPowerWidthBonusPx
                        : 0,
                      manaBarWidthBonusPx: selectedHealerIsHolyPaladin
                        ? normalizedCooldownResourceBarLayout.manaWidthBonusPx
                        : 0,
                      showBindings: true,
                      enableWowheadTooltip: true,
                      enableDragReorder: true,
                      interactive: false
                    })}
                    <div className="h-px bg-slate-600/50 mt-4" />
                    <div className="mt-4">
                      {renderCooldownManagerBar({
                        iconSizePx: cooldownManagerPrimaryIconSizePx,
                        holyPowerCellWidthPx: COOLDOWN_MANAGER_LAYOUT_CONFIG.overlayHolyPowerCellWidthPx,
                        holyPowerCellHeightPx: COOLDOWN_MANAGER_LAYOUT_CONFIG.overlayHolyPowerCellHeightPx,
                        spellOrder: reserveCooldownSpellOrder,
                        groupKey: "reserve",
                        interactive: false,
                        enableWowheadTooltip: true,
                        showHolyPower: false,
                        showManaBar: false,
                        showCastBar: false,
                        showBindings: true,
                        enableDragReorder: true,
                        showFrame: false
                      })}
                    </div>
                    <p className="mt-2 text-center text-xs text-slate-400">
                      스킬은 있지만 쿨다운 매니저에는 표시되지 않는 애들
                    </p>
                  </div>
                  {selectedHealerSupportsCooldownResourceOrder ? (
                    <div className="absolute left-full top-0 ml-3 w-max max-w-[240px] rounded-lg border border-slate-700/80 bg-slate-900/55 p-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
                      <p className="text-[11px] font-semibold text-slate-200">
                        {selectedHealerIsHolyPaladin ? "바 순서 및 너비" : "순서"}
                      </p>
                      <div className="mt-1 space-y-1">
                        {setupVisibleCooldownResourceSectionOrder.map((sectionKey, index) => (
                          <div
                            className="flex items-center justify-between rounded border border-slate-700/70 bg-black/35 px-1.5 py-1"
                            key={`resource-layout-order-${sectionKey}`}
                          >
                            <span className="text-[10px] font-semibold text-slate-200">
                              {COOLDOWN_RESOURCE_SECTION_LABEL_BY_KEY[sectionKey] ?? sectionKey}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                className="h-4 w-4 rounded border border-slate-600/80 bg-black/70 text-[9px] leading-none text-slate-100 disabled:opacity-35"
                                disabled={index <= 0}
                                onClick={() => moveCooldownResourceSection(sectionKey, -1, setupVisibleCooldownResourceSectionKeys)}
                                type="button"
                              >
                                ▲
                              </button>
                              <button
                                className="h-4 w-4 rounded border border-slate-600/80 bg-black/70 text-[9px] leading-none text-slate-100 disabled:opacity-35"
                                disabled={index >= setupVisibleCooldownResourceSectionOrder.length - 1}
                                onClick={() => moveCooldownResourceSection(sectionKey, 1, setupVisibleCooldownResourceSectionKeys)}
                                type="button"
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {selectedHealerIsHolyPaladin ? (
                        <div className="mt-1 space-y-1">
                          <div className="rounded border border-yellow-300/35 bg-black/40 px-1.5 py-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-semibold text-yellow-200">
                                {`자원바 너비 +${normalizedCooldownResourceBarLayout.holyPowerWidthBonusPx}px`}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  className="h-4 w-4 rounded border border-slate-600/80 bg-black/70 text-[9px] leading-none text-slate-100 disabled:opacity-35"
                                  disabled={normalizedCooldownResourceBarLayout.holyPowerWidthBonusPx <= COOLDOWN_RESOURCE_BAR_WIDTH_BONUS_MIN_PX}
                                  onClick={() => adjustCooldownResourceBarWidth("holyPower", -COOLDOWN_RESOURCE_BAR_WIDTH_BONUS_STEP_PX)}
                                  type="button"
                                >
                                  -
                                </button>
                                <button
                                  className="h-4 w-4 rounded border border-slate-600/80 bg-black/70 text-[9px] leading-none text-slate-100 disabled:opacity-35"
                                  disabled={normalizedCooldownResourceBarLayout.holyPowerWidthBonusPx >= COOLDOWN_RESOURCE_BAR_WIDTH_BONUS_MAX_PX}
                                  onClick={() => adjustCooldownResourceBarWidth("holyPower", COOLDOWN_RESOURCE_BAR_WIDTH_BONUS_STEP_PX)}
                                  type="button"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="rounded border border-blue-300/35 bg-black/40 px-1.5 py-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-semibold text-blue-200">
                                {`마나바 너비 +${normalizedCooldownResourceBarLayout.manaWidthBonusPx}px`}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  className="h-4 w-4 rounded border border-slate-600/80 bg-black/70 text-[9px] leading-none text-slate-100 disabled:opacity-35"
                                  disabled={normalizedCooldownResourceBarLayout.manaWidthBonusPx <= COOLDOWN_RESOURCE_BAR_WIDTH_BONUS_MIN_PX}
                                  onClick={() => adjustCooldownResourceBarWidth("mana", -COOLDOWN_RESOURCE_BAR_WIDTH_BONUS_STEP_PX)}
                                  type="button"
                                >
                                  -
                                </button>
                                <button
                                  className="h-4 w-4 rounded border border-slate-600/80 bg-black/70 text-[9px] leading-none text-slate-100 disabled:opacity-35"
                                  disabled={normalizedCooldownResourceBarLayout.manaWidthBonusPx >= COOLDOWN_RESOURCE_BAR_WIDTH_BONUS_MAX_PX}
                                  onClick={() => adjustCooldownResourceBarWidth("mana", COOLDOWN_RESOURCE_BAR_WIDTH_BONUS_STEP_PX)}
                                  type="button"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <button
                  className="rounded-lg border border-sky-400/60 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-100 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!canUseCloudKeybindProfile || running || keybindProfileSyncBusy}
                  onClick={handleSaveCloudKeybindProfile}
                  type="button"
                >
                  내 세팅 저장
                </button>
                <button
                  className="rounded-lg border border-slate-500/70 bg-slate-700/25 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-slate-700/40 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!canUseCloudKeybindProfile || running || keybindProfileSyncBusy}
                  onClick={() => {
                    void loadCloudKeybindProfile({ silent: false });
                  }}
                  type="button"
                >
                  내 세팅 불러오기
                </button>
              </div>
              {keybindProfileSyncBusy ? (
                <p className="mt-1 text-center text-[11px] text-sky-200">개인 세팅 동기화 중...</p>
              ) : null}
              {cloudProfileStatusText ? (
                <p
                  className={`mt-1 text-center text-[11px] ${cloudProfileStatusTone === "success"
                    ? "text-emerald-200"
                    : cloudProfileStatusTone === "error"
                      ? "text-rose-200"
                      : "text-slate-300"
                    }`}
                >
                  {cloudProfileStatusText}
                </p>
              ) : null}

              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  className="rounded-lg border border-emerald-400/60 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={!canStartSimulation || running}
                  onClick={handleStartSimulation}
                  type="button"
                >
                  연습 시작!
                </button>
              </div>
            </section>
          ) : null}
        </>
      ) : currentSnapshot ? (
        <div className="space-y-4" ref={combatViewRef}>
          <section
            className="rounded-2xl border border-slate-700 bg-gray-950/55 p-4"
            onMouseEnter={() => {
              pointerInRaidFramesRef.current = true;
            }}
            onMouseLeave={() => {
              pointerInRaidFramesRef.current = false;
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-violet-100">{`연습 시작 - ${activeDifficultyLabel}`}</h2>
              <p className="text-xs text-slate-400">
                대상 규칙: {sessionConfig?.useMouseover ? "마우스오버 우선" : "선택 대상 우선"} | 레이아웃 {activeRaidFrameLayout}
              </p>
            </div>

            {gameOverReason ? (
              <div className="mt-3 rounded-lg border border-rose-400/40 bg-rose-950/35 px-4 py-3 text-center">
                <p className="text-2xl font-extrabold tracking-[0.08em] text-rose-200">GAME OVER</p>
                <p className="mt-1 text-sm text-rose-100">{gameOverReason}</p>
              </div>
            ) : null}
            {showSuccessBanner ? (
              <div className="mt-3 rounded-lg border border-emerald-300/55 bg-emerald-900/35 px-4 py-3 text-center">
                <p className="text-3xl font-extrabold tracking-[0.08em] text-emerald-100">{GLOBAL_SUCCESS_MESSAGE_TEXT}</p>
              </div>
            ) : null}

            <div className="mt-3 overflow-x-auto">
              <div className="flex justify-center">
                <div
                  className="mb-2 overflow-hidden rounded-md border border-slate-800"
                  onMouseEnter={() => {
                    pointerInPhaserCanvasRef.current = true;
                  }}
                  onMouseLeave={() => {
                    pointerInPhaserCanvasRef.current = false;
                  }}
                  style={{ width: `${raidGridWidthPx}px`, height: `${raidGridHeightPx}px` }}
                >
                  <div className="h-full w-full" ref={phaserHostRef} />
                </div>
              </div>
              <div className="flex justify-center">
                <div
                  className="relative"
                  style={{
                    width: `${raidGridWidthPx}px`,
                    paddingTop: `${combatCooldownManagerReservedHeightPx}px`
                  }}
                >
                  <div
                    className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2"
                    ref={combatCooldownManagerRef}
                    style={{
                      top: `${RAID_FRAME_VISUAL_CONFIG.topOverlayBaseOffsetYPx}px`
                    }}
                  >
                    {overlayTopProcIndicators.map((proc, index) => {
                      const horizontalOffsetPx =
                        (index - (overlayTopProcIndicators.length - 1) / 2) * (proc.iconSizePx + 4);
                      return (
                        <div
                          className="absolute z-20"
                          key={`top-proc-${proc.id}`}
                          style={{
                            top: `${proc.topOffsetPx}px`,
                            left: `calc(50% + ${horizontalOffsetPx}px)`,
                            transform: "translateX(-50%)"
                          }}
                        >
                          <div
                            className="relative overflow-hidden rounded border border-amber-300/70 bg-black/70 shadow-[0_4px_14px_rgba(0,0,0,0.45)]"
                            style={{ width: `${proc.iconSizePx}px`, height: `${proc.iconSizePx}px` }}
                          >
                            <img
                              alt={proc.label}
                              className="h-full w-full object-cover"
                              onError={(event) => {
                                if (event.currentTarget.src === DEFAULT_SPELL_ICON_URL) {
                                  return;
                                }
                                event.currentTarget.src = DEFAULT_SPELL_ICON_URL;
                              }}
                              src={proc.iconUrl}
                            />
                            {proc.showStackCountOnOverlay ? (
                              <div className="absolute right-0 top-0 min-w-[10px] rounded-bl bg-black/80 px-[2px] text-center text-[8px] font-semibold leading-none text-amber-100">
                                {Math.max(0, Number(proc.stackCount ?? 0))}
                              </div>
                            ) : null}
                            {proc.showCountdownOnOverlay ? (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-center text-[7px] font-semibold leading-none text-amber-100">
                                {Math.ceil(proc.remainingMs / 1000)}s
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                    <div className="rounded-lg border border-slate-700 bg-black/70 p-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.45)]">
                      {renderCooldownManagerSpellResourceLayout({
                        primaryIconSizePx: activeCooldownManagerPrimaryIconSizePx,
                        secondaryIconSizePx: activeCooldownManagerSecondaryIconSizePx,
                        primarySpellOrder: managerCooldownSpellOrder,
                        secondarySpellOrder: secondaryCooldownSpellOrder,
                        showHolyPower: activeCombatHealerSlug === HOLY_PALADIN_HEALER_SLUG,
                        showManaBar: true,
                        showCastBar: true,
                        resourceSectionOrder:
                          activeCombatHealerSlug === HOLY_PALADIN_HEALER_SLUG ||
                            activeCombatHealerSlug === HOLY_PRIEST_HEALER_SLUG
                            ? activeCooldownResourceBarLayout.sectionOrder
                            : DEFAULT_COOLDOWN_RESOURCE_BAR_LAYOUT.sectionOrder,
                        holyPowerWidthBonusPx: activeCombatHealerSlug === HOLY_PALADIN_HEALER_SLUG
                          ? activeCooldownResourceBarLayout.holyPowerWidthBonusPx
                          : 0,
                        manaBarWidthBonusPx: activeCombatHealerSlug === HOLY_PALADIN_HEALER_SLUG
                          ? activeCooldownResourceBarLayout.manaWidthBonusPx
                          : 0,
                        showBindings: true,
                        enableWowheadTooltip: false,
                        enableDragReorder: false,
                        interactive: false
                      })}
                    </div>
                  </div>

                  <div className="grid gap-0 overflow-hidden rounded-md border border-slate-900" style={raidGridStyle}>
                    {orderedRaidFramePlayers.map((player) => {
                      const isSelected = selectedTargetId === player.id;
                      const isHovered = hoveredTargetId === player.id;
                      const isHolyPaladinCombat = activeCombatHealerSlug === HOLY_PALADIN_HEALER_SLUG;
                      const isHolyPriestCombat = activeCombatHealerSlug === HOLY_PRIEST_HEALER_SLUG;
                      const isRestorationDruidCombat = activeCombatHealerSlug === RESTORATION_DRUID_HEALER_SLUG;
                      const isBeaconLight = currentSnapshot.beacons.light === player.id;
                      const isBeaconFaith = currentSnapshot.beacons.faith === player.id;
                      const isBeaconSavior = currentSnapshot.beacons.savior === player.id;
                      const eternalFlameRemainingMs = Math.max(0, Number(player.eternalFlameRemainingMs ?? 0));
                      const rejuvenationRemainingMs = Math.max(0, Number(player.rejuvenationRemainingMs ?? 0));
                      const germinationRemainingMs = Math.max(0, Number(player.germinationRemainingMs ?? 0));
                      const regrowthHotRemainingMs = Math.max(0, Number(player.regrowthHotRemainingMs ?? 0));
                      const wildGrowthHotRemainingMs = Math.max(0, Number(player.wildGrowthHotRemainingMs ?? 0));
                      const lifebloomRemainingMs = Math.max(0, Number(player.lifebloomRemainingMs ?? 0));
                      const lifebloomStack = Math.max(0, Math.floor(Number(player.lifebloomStack ?? 0)));
                      const prayerOfMendingRemainingMs = Math.max(0, Number(player.prayerOfMendingRemainingMs ?? 0));
                      const renewRemainingMs = Math.max(0, Number(player.renewRemainingMs ?? 0));
                      const echoOfLightRemainingMs = Math.max(0, Number(player.echoOfLightRemainingMs ?? 0));
                      const fillPercent = player.alive ? raidFrameFillPercent(player) : 0;
                      const classColor = raidFrameClassColor(player);
                      const roleIconUrl = String(player.roleIconUrl ?? "").trim();
                      const roleName = String(player.roleName ?? "").trim();
                      const isMyFrame =
                        player.id === selfPlayerIdRef.current || String(player.name ?? "").trim() === MY_PLAYER_NAME;
                      const topLeftFrameAuraIcons = [];

                      if (isHolyPaladinCombat) {
                        if (isBeaconLight || isBeaconFaith) {
                          topLeftFrameAuraIcons.push({
                            key: isBeaconFaith ? "beaconOfFaith" : "beaconOfLight",
                            iconUrl: SPELL_ICON_URL_BY_KEY[isBeaconFaith ? "beaconOfFaith" : "beaconOfLight"] || DEFAULT_SPELL_ICON_URL,
                            label: isBeaconFaith ? "신념의 봉화" : "빛의 봉화",
                            stackText: ""
                          });
                        }

                        if (isBeaconSavior) {
                          topLeftFrameAuraIcons.push({
                            key: "beaconOfSavior",
                            iconUrl: SPELL_ICON_URL_BY_KEY.beaconOfSavior || DEFAULT_SPELL_ICON_URL,
                            label: "구세주의 봉화",
                            stackText: ""
                          });
                        }

                        if (eternalFlameRemainingMs > 0) {
                          topLeftFrameAuraIcons.push({
                            key: "eternalFlame",
                            iconUrl: SPELL_ICON_URL_BY_KEY.eternalFlame || DEFAULT_SPELL_ICON_URL,
                            label: "영원의 불꽃",
                            stackText: `${Math.ceil(eternalFlameRemainingMs / 1000)}`
                          });
                        }
                      }

                      if (isRestorationDruidCombat) {
                        if (rejuvenationRemainingMs > 0) {
                          topLeftFrameAuraIcons.push({
                            key: "rejuvenation",
                            iconUrl:
                              activeCombatSpellIconsByKey.rejuvenation ||
                              RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.rejuvenation ||
                              DEFAULT_SPELL_ICON_URL,
                            label: "회복",
                            stackText: `${Math.ceil(rejuvenationRemainingMs / 1000)}`
                          });
                        }

                        if (germinationRemainingMs > 0) {
                          topLeftFrameAuraIcons.push({
                            key: "germination",
                            iconUrl:
                              activeCombatSpellIconsByKey.germination ||
                              RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.germination ||
                              DEFAULT_SPELL_ICON_URL,
                            label: "싹틔우기",
                            stackText: `${Math.ceil(germinationRemainingMs / 1000)}`
                          });
                        }
                      }

                      if (isHolyPriestCombat && prayerOfMendingRemainingMs > 0) {
                        topLeftFrameAuraIcons.push({
                          key: "prayerOfMending",
                          iconUrl:
                            activeCombatSpellIconsByKey.prayerOfMending ||
                            HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.prayerOfMending ||
                            DEFAULT_SPELL_ICON_URL,
                          label: "회복의 기원",
                          stackText: `${Math.ceil(prayerOfMendingRemainingMs / 1000)}`
                        });
                      }

                      if (isHolyPriestCombat && renewRemainingMs > 0) {
                        topLeftFrameAuraIcons.push({
                          key: "renew",
                          iconUrl:
                            activeCombatSpellIconsByKey.renew ||
                            HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.renew ||
                            DEFAULT_SPELL_ICON_URL,
                          label: "소생",
                          stackText: `${Math.ceil(renewRemainingMs / 1000)}`
                        });
                      }

                      if (isHolyPriestCombat && activeShowHolyPriestEchoOnRaidFrames && echoOfLightRemainingMs > 0) {
                        topLeftFrameAuraIcons.push({
                          key: "echoOfLight",
                          iconUrl:
                            activeCombatSpellIconsByKey.echoOfLight ||
                            HOLY_PRIEST_SPELL_ICON_URL_BY_KEY.echoOfLight ||
                            DEFAULT_SPELL_ICON_URL,
                          label: "빛의 반향",
                          stackText: `${Math.ceil(echoOfLightRemainingMs / 1000)}`
                        });
                      }

                      const topRightFrameAura =
                        isRestorationDruidCombat && regrowthHotRemainingMs > 0
                          ? {
                            key: "regrowth",
                            iconUrl:
                              activeCombatSpellIconsByKey.regrowth ||
                              RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.regrowth ||
                              DEFAULT_SPELL_ICON_URL,
                            label: "재생",
                            stackText: `${Math.ceil(regrowthHotRemainingMs / 1000)}`
                          }
                          : null;
                      const bottomRightFrameAura =
                        isRestorationDruidCombat && wildGrowthHotRemainingMs > 0
                          ? {
                            key: "wildGrowth",
                            iconUrl:
                              activeCombatSpellIconsByKey.wildGrowth ||
                              RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.wildGrowth ||
                              DEFAULT_SPELL_ICON_URL,
                            label: "급속 성장",
                            stackText: `${Math.ceil(wildGrowthHotRemainingMs / 1000)}`
                          }
                          : null;
                      const centerFrameAura =
                        isRestorationDruidCombat && lifebloomRemainingMs > 0
                          ? {
                            key: "lifebloom",
                            iconUrl:
                              activeCombatSpellIconsByKey.lifebloom ||
                              RESTORATION_DRUID_SPELL_ICON_URL_BY_KEY.lifebloom ||
                              DEFAULT_SPELL_ICON_URL,
                            label: "피어나는 생명",
                            stackText: `${Math.ceil(lifebloomRemainingMs / 1000)}`,
                            topRightText: `${Math.max(1, lifebloomStack)}`
                          }
                          : null;

                      return (
                        <button
                          className={`relative overflow-hidden border border-slate-900 text-left ${isSelected ? "z-10 ring-1 ring-violet-300" : ""} ${isHovered ? "z-10 ring-1 ring-violet-200/80" : ""}`}
                          key={player.id}
                          onContextMenu={(event) => event.preventDefault()}
                          onMouseDown={(event) => handleFrameMouseDown(event, player.id)}
                          onWheel={(event) => handleFrameWheel(event, player.id)}
                          onMouseEnter={() => {
                            setHoveredTargetId(player.id);
                            hoveredTargetRef.current = player.id;
                          }}
                          onMouseLeave={() => {
                            if (hoveredTargetRef.current === player.id) {
                              setHoveredTargetId("");
                              hoveredTargetRef.current = "";
                            }
                          }}
                          style={{ height: `${raidFrameHeightPx}px` }}
                          type="button"
                        >
                          <div className="absolute inset-0 bg-slate-900/95" />
                          <div
                            className="absolute inset-y-0 left-0 transition-[width] duration-100 ease-linear"
                            style={{
                              width: `${fillPercent}%`,
                              backgroundColor: classColor
                            }}
                          />
                          {!player.alive ? (
                            <div className="pointer-events-none absolute inset-x-0 top-1 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-100">
                              Dead
                            </div>
                          ) : null}
                          {player.alive && topLeftFrameAuraIcons.length ? (
                            <div className="pointer-events-none absolute left-1 top-1 flex items-start gap-0.5">
                              {topLeftFrameAuraIcons.map((aura) => (
                                <div
                                  className="relative h-5 w-5 overflow-hidden rounded-[2px] border border-black/60 bg-slate-900/90"
                                  key={`${player.id}-${aura.key}`}
                                  title={aura.label}
                                >
                                  <img
                                    alt={aura.label}
                                    className="h-full w-full object-cover"
                                    onError={(event) => {
                                      if (event.currentTarget.src === DEFAULT_SPELL_ICON_URL) {
                                        return;
                                      }
                                      event.currentTarget.src = DEFAULT_SPELL_ICON_URL;
                                    }}
                                    src={aura.iconUrl}
                                  />
                                  {aura.stackText ? (
                                    <span className="absolute bottom-0 right-0 bg-black/70 px-[1px] text-[8px] font-semibold leading-none text-white">
                                      {aura.stackText}
                                    </span>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          ) : null}
                          {player.alive && topRightFrameAura ? (
                            <div
                              className="pointer-events-none absolute right-1 top-1 z-20 h-5 w-5 overflow-hidden rounded-[2px] border border-black/60 bg-slate-900/90"
                              title={topRightFrameAura.label}
                            >
                              <img
                                alt={topRightFrameAura.label}
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                  if (event.currentTarget.src === DEFAULT_SPELL_ICON_URL) {
                                    return;
                                  }
                                  event.currentTarget.src = DEFAULT_SPELL_ICON_URL;
                                }}
                                src={topRightFrameAura.iconUrl}
                              />
                              <span className="absolute bottom-0 right-0 bg-black/70 px-[1px] text-[8px] font-semibold leading-none text-white">
                                {topRightFrameAura.stackText}
                              </span>
                            </div>
                          ) : null}
                          {player.alive && bottomRightFrameAura ? (
                            <div
                              className="pointer-events-none absolute right-1 bottom-1 h-5 w-5 overflow-hidden rounded-[2px] border border-black/60 bg-slate-900/90"
                              title={bottomRightFrameAura.label}
                            >
                              <img
                                alt={bottomRightFrameAura.label}
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                  if (event.currentTarget.src === DEFAULT_SPELL_ICON_URL) {
                                    return;
                                  }
                                  event.currentTarget.src = DEFAULT_SPELL_ICON_URL;
                                }}
                                src={bottomRightFrameAura.iconUrl}
                              />
                              <span className="absolute bottom-0 right-0 bg-black/70 px-[1px] text-[8px] font-semibold leading-none text-white">
                                {bottomRightFrameAura.stackText}
                              </span>
                            </div>
                          ) : null}
                          {player.alive && centerFrameAura ? (
                            <div
                              className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2px] border border-black/60 bg-slate-900/90"
                              title={centerFrameAura.label}
                            >
                              <img
                                alt={centerFrameAura.label}
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                  if (event.currentTarget.src === DEFAULT_SPELL_ICON_URL) {
                                    return;
                                  }
                                  event.currentTarget.src = DEFAULT_SPELL_ICON_URL;
                                }}
                                src={centerFrameAura.iconUrl}
                              />
                              {centerFrameAura.topRightText ? (
                                <span className="absolute right-0 top-0 bg-black/70 px-[1px] text-[8px] font-semibold leading-none text-yellow-300">
                                  {centerFrameAura.topRightText}
                                </span>
                              ) : null}
                              <span className="absolute bottom-0 right-0 bg-black/70 px-[1px] text-[8px] font-semibold leading-none text-white">
                                {centerFrameAura.stackText}
                              </span>
                            </div>
                          ) : null}
                          {roleIconUrl ? (
                            <div className="pointer-events-none absolute right-1 top-1 h-5 w-5 overflow-hidden rounded-[2px]">
                              <img
                                alt={roleName ? `${roleName} 아이콘` : "역할 아이콘"}
                                className="h-full w-full object-contain"
                                onLoad={(event) => {
                                  delete event.currentTarget.dataset.fallbackStep;
                                }}
                                onError={(event) => {
                                  const imageElement = event.currentTarget;
                                  const fallbackStep = Number(imageElement.dataset.fallbackStep ?? "0");
                                  if (fallbackStep === 0) {
                                    imageElement.dataset.fallbackStep = "1";
                                    imageElement.src = TANK_ROLE_META.iconUrl;
                                    return;
                                  }
                                  if (imageElement.src === DEFAULT_SPELL_ICON_URL) {
                                    return;
                                  }
                                  imageElement.dataset.fallbackStep = "2";
                                  imageElement.src = DEFAULT_SPELL_ICON_URL;
                                }}
                                src={roleIconUrl}
                              />
                            </div>
                          ) : null}
                          {overlayMyFrameProcIndicators.length && isMyFrame ? (
                            <div className="pointer-events-none absolute left-1/2 top-0 z-20 flex -translate-x-1/2 -translate-y-[35%] items-center gap-1">
                              {overlayMyFrameProcIndicators.map((proc) => (
                                <div
                                  className="relative overflow-hidden rounded border border-amber-300/70 bg-black/70 shadow-[0_3px_10px_rgba(0,0,0,0.45)]"
                                  key={`frame-proc-${player.id}-${proc.id}`}
                                  style={{ width: `${proc.iconSizePx}px`, height: `${proc.iconSizePx}px` }}
                                >
                                  <img
                                    alt={proc.label}
                                    className="h-full w-full object-cover"
                                    onError={(event) => {
                                      if (event.currentTarget.src === DEFAULT_SPELL_ICON_URL) {
                                        return;
                                      }
                                      event.currentTarget.src = DEFAULT_SPELL_ICON_URL;
                                    }}
                                    src={proc.iconUrl}
                                  />
                                  {proc.showCountdownOnRaidFrame ? (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-center text-[7px] font-semibold leading-none text-amber-100">
                                      {Math.ceil(proc.remainingMs / 1000)}s
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          ) : null}
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-1">
                            <span
                              className="truncate text-center font-semibold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]"
                              style={{ fontSize: `${RAID_FRAME_VISUAL_CONFIG.frameNameFontPx}px` }}
                            >
                              {player.name}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <button
                className="rounded-lg border border-rose-400/60 bg-rose-500/15 px-3 py-2 text-sm text-rose-100 transition hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-45"
                disabled={!running}
                onClick={handleStopSimulation}
                type="button"
              >
                연습 중지
              </button>
            </div>
          </section>

          {showPostCombatSummaryPanels ? (
            <>
              <section className="grid gap-4 lg:grid-cols-[1fr_2fr]">
                <div className="rounded-2xl border border-slate-700 bg-gray-950/55 p-4">
                  <h2 className="text-base font-semibold text-violet-100">전투 기록</h2>
                  {currentSnapshot.finished ? (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {combatRecordCards.map((card) => (
                        <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-xs text-slate-300" key={card.key}>
                          {card.title}
                          <p
                            className={`mt-1 whitespace-pre-line font-semibold ${card.valueTextClassName ?? "text-sm"} ${card.valueClassName}`}
                          >
                            {card.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-slate-400">
                      전투 종료 후 공통 기록(평균 공대 체력/오버힐 비율/사망자 수/남은 마나/트리아지 힐 총량 및 비중)과 직업별 기록을 표시합니다.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-700 bg-gray-950/55 p-4">
                  <h2 className="text-base font-semibold text-violet-100">힐 미터기</h2>
                  {healMeterRows.length ? (
                    <div className="mt-3 overflow-hidden rounded-lg border border-slate-700 bg-slate-900/60">
                      <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,2.2fr)_72px] border-b border-slate-700 bg-slate-900/90 px-2 pt-1.5 pb-1 text-[11px] font-semibold text-slate-400">
                        <span>스킬</span>
                        <span className="ml-4">치유량</span>
                        <span className="text-right">시전 수</span>
                      </div>
                      <div className="divide-y divide-slate-800/80">
                        {displayedHealMeterRows.map((row) => {
                          const isChildRow = Number(row.depth) > 0;
                          const hasChildRows = !isChildRow && Array.isArray(row.children) && row.children.length > 0;
                          const isExpanded = hasChildRows && expandedHealMeterSpellKeys.has(row.spellKey);
                          return (
                            <div
                              className={`grid grid-cols-[minmax(0,1.2fr)_minmax(0,2.2fr)_72px] items-center px-2 py-1.5 ${isChildRow ? "bg-slate-900/35" : ""}`}
                              key={`heal-meter-${row.parentSpellKey || "root"}-${row.spellKey}-${row.depth || 0}`}
                            >
                              <div className={`min-w-0 ${isChildRow ? "pl-3" : ""}`}>
                                <div className="flex min-w-0 items-center gap-1.5">
                                  {hasChildRows ? (
                                    <button
                                      aria-expanded={isExpanded}
                                      aria-label={isExpanded ? "하위 힐량 숨기기" : "하위 힐량 보기"}
                                      className="h-4 w-4 shrink-0 rounded border border-slate-600/80 text-[10px] font-semibold leading-none text-slate-300 hover:border-violet-300/80 hover:text-violet-100"
                                      onClick={() => handleToggleHealMeterRowExpand(row.spellKey)}
                                      type="button"
                                    >
                                      {isExpanded ? "▾" : "▸"}
                                    </button>
                                  ) : isChildRow ? (
                                    <span className="w-4 shrink-0 text-center text-[10px] font-semibold text-slate-500">└</span>
                                  ) : (
                                    <span className="w-4 shrink-0" />
                                  )}
                                  {row.spellId ? (
                                    <a
                                      className={`block min-w-0 truncate text-xs font-semibold ${isChildRow ? "text-slate-300" : "text-slate-100"}`}
                                      data-wh-icon-size="small"
                                      data-wh-rename-link="false"
                                      href={`https://www.wowhead.com/ko/spell=${row.spellId}`}
                                      rel="noreferrer"
                                      target="_blank"
                                      title={row.spellName}
                                    >
                                      {row.spellName}
                                    </a>
                                  ) : (
                                    <div className="flex min-w-0 items-center gap-2" title={row.spellName}>
                                      <img
                                        alt={row.spellName}
                                        className="h-4 w-4 shrink-0 rounded-[2px] border border-black/50 object-cover"
                                        onError={(event) => {
                                          if (event.currentTarget.src === DEFAULT_SPELL_ICON_URL) {
                                            return;
                                          }
                                          event.currentTarget.src = DEFAULT_SPELL_ICON_URL;
                                        }}
                                        src={row.iconUrl}
                                      />
                                      <span className={`truncate text-xs font-semibold ${isChildRow ? "text-slate-300" : "text-slate-100"}`}>
                                        {row.spellName}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-14 shrink-0 text-right text-[11px] font-semibold text-slate-200">
                                  {row.ratioPct.toFixed(2)}%
                                </span>
                                <div className="h-4 min-w-0 flex-1 overflow-hidden rounded-[2px] border border-slate-700 bg-gray-950/90">
                                  <div
                                    className={`h-full ${isChildRow ? "bg-violet-300/70" : "bg-violet-400/80"}`}
                                    style={{
                                      width: `${Math.max(
                                        2,
                                        Math.min(
                                          100,
                                          healMeterMaxAmount > 0
                                            ? (Math.max(0, Number(row.amount ?? 0)) / healMeterMaxAmount) * 100
                                            : 0
                                        )
                                      )}%`
                                    }}
                                  />
                                </div>
                                <span className={`w-16 shrink-0 text-right text-xs font-semibold ${isChildRow ? "text-violet-200/80" : "text-violet-100"}`}>
                                  {formatHealingAmount(row.amount)}
                                </span>
                              </div>
                              <div className={`text-right text-xs font-semibold ${isChildRow ? "text-slate-300" : "text-slate-200"}`}>
                                {row.casts === null ? "-" : row.casts}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-slate-400">치유량 집계가 아직 없습니다.</p>
                  )}
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
                      CPM
                      <p className="mt-1 text-sm font-semibold text-violet-200">{finalCpm.toFixed(1)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
                      자힐 비중
                      <p className="mt-1 text-sm font-semibold text-emerald-200">{selfHealRatioPct.toFixed(1)}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
                      <p className="font-semibold text-slate-200">스킬 맞은 피해</p>
                      <p className="mt-0.5 text-[11px] leading-tight text-slate-400">100이면 1회 사망</p>
                      <p className="mt-1 text-sm font-semibold text-rose-200">{canvasRawDamageTaken.toFixed(1)}</p>
                      <p className="mt-1 text-[11px] leading-tight text-slate-400">미사일: {canvasHitCounts.missile}회</p>
                      <p className="text-[11px] leading-tight text-slate-400">막대 바닥: {canvasHitCounts.hazardBar}회</p>
                      {showZoneFloorHitCount ? (
                        <p className="text-[11px] leading-tight text-slate-400">
                          장판 바닥: {canvasHitCounts.zoneFloor}회
                        </p>
                      ) : null}
                    </div>
                    <div className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
                      <p className="font-semibold text-slate-200">피격 복구 힐 비중</p>
                      <p className="mt-0.5 text-[11px] leading-tight text-slate-400">
                        전체 힐 대비 비율
                      </p>
                      <p className="mt-1 text-sm font-semibold text-violet-200">{canvasDamageHealingSharePct.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-700 bg-gray-950/55 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-violet-100">피드백</h2>
                      <p className="mt-1 text-xs text-slate-400">전투 종료 후 기준치 기반으로 결과가 표시됩니다.</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="rounded-xl border border-violet-400/45 bg-violet-500/10 px-3 py-2 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-violet-200">Score</p>
                        <p className="mt-0.5 text-2xl font-extrabold leading-none text-violet-100">
                          {isSuccessfulPracticeResult && finalScoreBreakdown ? `${finalScoreBreakdown.totalScore.toFixed(1)}점` : "-"}
                        </p>
                      </div>
                      {showRankingRegisterControl ? (
                        isLoggedIn ? (
                          <button
                            className="rounded-lg border border-violet-400/70 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-100 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={rankingSaveStatus === "saving" || rankingSaveStatus === "saved"}
                            onClick={() => {
                              void saveCurrentRunRanking({ force: rankingSaveStatus === "error" });
                            }}
                            type="button"
                          >
                            {rankingSaveButtonLabel}
                          </button>
                        ) : (
                          <p className="text-[11px] text-slate-400">로그인 시 랭킹 등록 가능</p>
                        )
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3">
                    <article className="rounded-lg border border-slate-700 bg-slate-900/65 p-3">
                      {feedbackGameOverReason ? (
                        <p className="text-[12px] font-semibold leading-tight text-rose-200">
                          전투 결과: 실패 ({feedbackGameOverReason})
                        </p>
                      ) : isSuccessfulPracticeResult ? (
                        <p className="text-[12px] font-semibold leading-tight text-rose-200">
                          {`전투 결과: 성공 (${Math.max(0, Math.round(Number(currentSnapshot?.metrics?.deaths ?? 0))) > 0
                            ? `사망자 ${Math.max(0, Math.round(Number(currentSnapshot?.metrics?.deaths ?? 0)))}명`
                            : "전원 생존"
                            })`}
                        </p>
                      ) : (
                        <p className="text-[11px] font-semibold leading-tight text-slate-300">
                          전투 결과: 전투 종료 후 표시됩니다.
                        </p>
                      )}
                      {/* {finalScoreBreakdown ? (
                        <p className="mt-2 text-[11px] leading-tight text-slate-300">
                          점수 상세: 사망 {finalScoreBreakdown.deathsScore.toFixed(1)}/20, 오버힐 {finalScoreBreakdown.overhealingScore.toFixed(1)}/15,
                          평균 공대 체력 {finalScoreBreakdown.averageRaidHealthScore.toFixed(1)}/20, 남은 마나 {finalScoreBreakdown.remainingManaScore.toFixed(1)}/10,
                          CPM {finalScoreBreakdown.cpmScore.toFixed(1)}/10, 자힐 비중 {finalScoreBreakdown.selfHealScore.toFixed(1)}/5,
                          힐러 전용 {finalScoreBreakdown.healerSpecificScore.toFixed(1)}/20
                        </p>
                      ) : null} */}
                      {activeCombatHealerSlug === HOLY_PALADIN_HEALER_SLUG ? (
                        isSuccessfulPracticeResult ? (
                          holyPaladinFeedbackLines.length ? (
                            <div className="mt-2 space-y-1">
                              {holyPaladinFeedbackLines.map((line, index) => (
                                <p className="text-[11px] leading-tight text-amber-200" key={`holy-paladin-feedback-${index}`}>
                                  - {line}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-2 text-[11px] leading-tight text-emerald-200">기준치를 모두 만족했습니다.</p>
                          )
                        ) : (
                          <p className="mt-2 text-[11px] leading-tight text-slate-400">
                            신기 피드백은 전투 성공 후 표시됩니다.
                          </p>
                        )
                      ) : activeCombatHealerSlug === HOLY_PRIEST_HEALER_SLUG ? (
                        isSuccessfulPracticeResult ? (
                          holyPriestFeedbackLines.length ? (
                            <div className="mt-2 space-y-1">
                              {holyPriestFeedbackLines.map((line, index) => (
                                <p className="text-[11px] leading-tight text-amber-200" key={`holy-priest-feedback-${index}`}>
                                  - {line}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-2 text-[11px] leading-tight text-emerald-200">기준치를 모두 만족했습니다.</p>
                          )
                        ) : (
                          <p className="mt-2 text-[11px] leading-tight text-slate-400">
                            신사 피드백은 전투 성공 후 표시됩니다.
                          </p>
                        )
                      ) : (
                        <p className="mt-2 text-[11px] leading-tight text-slate-400">
                          선택한 힐러 전용 평가 항목이 표시됩니다.
                        </p>
                      )}
                    </article>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-gray-950/55 p-4">
                  <h2 className="text-base font-semibold text-violet-100">이벤트 로그</h2>
                  <div className="mt-3 max-h-64 space-y-1 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900/60 p-2">
                    {sortedEventLogs.map((log) => (
                      <p className={`text-xs ${logColorClass(log.type)}`} key={log.id}>
                        [{formatTime(log.timeMs)}] {log.text}
                      </p>
                    ))}
                  </div>
                </div>
              </section>

              <div className="flex justify-center">
                <button
                  className="rounded-lg border border-violet-300/70 bg-violet-500/20 px-5 py-2 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/30"
                  onClick={handleRestartPractice}
                  type="button"
                >
                  다시 시작하기
                </button>
              </div>
            </>
          ) : (
            <section className="rounded-2xl border border-slate-700 bg-gray-950/45 p-4 text-sm text-slate-300">
              <h2 className="text-base font-semibold text-violet-100">전투 데이터 집계 중</h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                전투 중에는 성능 최적화를 위해 힐 미터기/CPM/전투 기록/이벤트 로그를 숨기고, 전투 종료 후 한 번에 표시합니다.
              </p>
            </section>
          )}
        </div>
      ) : (
        <section className="rounded-2xl border border-slate-700 bg-gray-950/45 p-4 text-sm text-slate-400">
          전투 화면을 준비 중입니다.
        </section>
      )}
      {rankingModalOpen ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4"
          onClick={() => {
            setRankingModalOpen(false);
          }}
          role="presentation"
        >
          <section
            className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-950/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-violet-300">힐러 연습 랭킹</h2>
              </div>
              <button
                className="rounded-lg border border-slate-600 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                onClick={() => {
                  setRankingModalOpen(false);
                }}
                type="button"
              >
                닫기
              </button>
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-[2.5fr_1fr]">
              <div className="text-xs text-slate-300">
                힐러
                <div className="mt-1 grid grid-cols-7 gap-0.5 sm:grid-cols-7">
                  {rankingHealerTabOptions.map((healerOption) => {
                    const isActive = rankingViewHealerSlug === healerOption.slug;
                    const isDisabled = !healerOption.enabled;
                    return (
                      <button
                        className={`flex items-center justify-center gap-1 rounded-lg border py-1.5 text-[13px] font-semibold transition ${isDisabled
                          ? "cursor-not-allowed border-slate-700 bg-slate-900/60 text-slate-500 grayscale opacity-60"
                          : isActive
                            ? "border-violet-400/70 bg-violet-500/20 text-violet-100"
                            : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                          }`}
                        disabled={isDisabled}
                        key={`ranking-healer-tab-${healerOption.slug}`}
                        onClick={() => {
                          if (isDisabled) {
                            return;
                          }
                          setRankingViewHealerSlug(healerOption.slug);
                        }}
                        type="button"
                      >
                        <img
                          alt={`${healerOption.shortName} icon`}
                          className="h-4 w-4 rounded-[2px] border border-black/40 object-cover"
                          onError={(event) => {
                            if (event.currentTarget.src === DEFAULT_SPELL_ICON_URL) {
                              return;
                            }
                            event.currentTarget.src = DEFAULT_SPELL_ICON_URL;
                          }}
                          src={healerOption.iconUrl}
                        />
                        <span className="truncate">{healerOption.shortName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <label className="text-xs text-slate-300">
                맵
                <select
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100"
                  onChange={(event) => {
                    setRankingViewMapKey(event.target.value);
                  }}
                  value={rankingViewMapKey}
                >
                  {HEALER_PRACTICE_MAP_OPTIONS.map((option) => (
                    <option key={`ranking-map-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-2 text-xs text-slate-300">
              난이도
              <div className="mt-1 grid grid-cols-3 overflow-hidden rounded-lg border border-slate-700">
                {rankingDifficultyTabKeys.map((difficultyTabKey) => {
                  const isActive = rankingViewDifficultyKey === difficultyTabKey;
                  const tabLabel =
                    resolveDifficultyConfigByKey(rankingViewDifficultyTuning, difficultyTabKey)?.label ?? difficultyTabKey;
                  return (
                    <button
                      className={`px-2.5 py-1.5 text-xs font-semibold transition ${isActive
                        ? "bg-violet-500/20 text-violet-200"
                        : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                        }`}
                      key={`ranking-tab-${difficultyTabKey}`}
                      onClick={() => {
                        setRankingViewDifficultyKey(difficultyTabKey);
                      }}
                      type="button"
                    >
                      {tabLabel}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-300">
              패치
              <div className="mt-1 flex flex-wrap gap-1">
                {rankingPatchVersionOptions.map((patchVersion) => {
                  const isActive = rankingViewPatchVersion === patchVersion;
                  return (
                    <button
                      className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${isActive
                        ? "border-violet-400/70 bg-violet-500/20 text-violet-100"
                        : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                        }`}
                      key={`ranking-patch-tab-${patchVersion}`}
                      onClick={() => {
                        setRankingViewPatchVersion(patchVersion);
                      }}
                      type="button"
                    >
                      {patchVersion}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900/55 p-3">
              <p className="text-[11px] text-slate-400">
                {rankingSelectedHealerLabel} · {resolveMapLabel(rankingViewMapKey)} ·{" "}
                {resolveDifficultyConfigByKey(rankingViewDifficultyTuning, rankingViewDifficultyKey)?.label ?? rankingViewDifficultyKey} · 패치 {rankingViewPatchVersion}
              </p>
              {rankingLoading ? (
                <p className="mt-2 text-xs text-slate-300">랭킹을 불러오는 중입니다...</p>
              ) : rankingErrorText ? (
                <p className="mt-2 text-xs text-rose-200">{rankingErrorText}</p>
              ) : !rankingRows.length ? (
                <p className="mt-2 text-xs text-slate-300">저장된 랭킹이 없습니다.</p>
              ) : (
                <div className="mt-2 max-h-[52vh] overflow-y-auto rounded-md border border-slate-700 bg-slate-950/65">
                  <div className="grid grid-cols-[56px_1fr_90px] border-b border-slate-700 bg-slate-900/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                    <span>Rank</span>
                    <span>닉네임</span>
                    <span className="text-right">Score</span>
                  </div>
                  <div className="divide-y divide-slate-800/80">
                    {rankingRows.map((row, index) => {
                      const isMine = isLoggedIn && String(row.nickname) === String(userLabel ?? "");
                      return (
                        <div
                          className={`grid grid-cols-[56px_1fr_90px] items-center px-3 py-1.5 text-xs ${isMine ? "bg-violet-500/10" : ""
                            }`}
                          key={row.id}
                        >
                          <span className="font-semibold text-slate-300">#{index + 1}</span>
                          <span className={`truncate ${isMine ? "text-amber-100" : "text-slate-100"}`}>{row.nickname}</span>
                          <span className={`text-right font-semibold ${isMine ? "text-amber-100" : "text-violet-100"}`}>
                            {roundToOneDecimal(row.score).toFixed(1)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {patchNotesModalOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setPatchNotesModalOpen(false)}
            role="presentation"
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 p-4">
              <h2 className="text-xl font-bold text-white">
                {selectedHealerMeta?.shortName} 패치 노트
              </h2>
              <button
                className="rounded-lg p-2 hover:bg-slate-800"
                onClick={() => setPatchNotesModalOpen(false)}
                type="button"
              >
                <span className="sr-only">닫기</span>
                <span className="text-slate-400">✕</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {HEALER_PRACTICE_PATCH_NOTES_BY_HEALER[selectedHealerSlug]?.length ? (
                HEALER_PRACTICE_PATCH_NOTES_BY_HEALER[selectedHealerSlug].map((note, index) => (
                  <div key={index} className="rounded-lg bg-slate-800/50 p-3">
                    <p className="font-semibold text-violet-300 mb-1">{note.date}</p>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{note.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">아직 등록된 패치 노트가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

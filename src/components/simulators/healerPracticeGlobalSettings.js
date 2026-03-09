import Phaser from "phaser";

const PUBLIC_BASE_URL = (() => {
  const base = String(import.meta.env.BASE_URL ?? "/");
  return base.endsWith("/") ? base : `${base}/`;
})();

function buildPublicAssetUrl(path) {
  const safePath = String(path ?? "").replace(/^\/+/, "");
  return `${PUBLIC_BASE_URL}${safePath}`;
}

export const ENGINE_FPS = 60;
export const UI_FPS = 30;
export const ENGINE_STEP_MS = 1000 / ENGINE_FPS;
export const UI_STEP_MS = 1000 / UI_FPS;

export const VALID_MODIFIERS = new Set(["", "CTRL", "ALT", "SHIFT", "CMD"]);
export const MODIFIER_ONLY_KEYS = new Set(["CTRL", "ALT", "SHIFT", "CMD", "COMMAND"]);
export const BLOCKED_KEYBOARD_BINDING_TOKENS = new Set(["CTRL+Q", "ALT+TAB"]);
export const DEFAULT_TANK_DAMAGE_TAKEN_MULTIPLIER = 1;
export const GLOBAL_GAMEOVER_DEATH_THRESHOLD = 15;
export const GLOBAL_AUTO_MANA_REGEN_TICK_MS = 5000;
export const GLOBAL_AUTO_MANA_REGEN_PCT_OF_MAX_PER_TICK = 0.04;
export const GLOBAL_LEECH_HEALING_RATIO = 0.06;
export const GLOBAL_HEALER_SCALING = Object.freeze({
  // Global multiplier applied to every spell heal amount.
  intellectToHealingScale: 1,
  // Global multiplier applied to every mana cost.
  manaCostScale: 1,
  // Additional one-shot global mana tuning multiplier (stacked with manaCostScale).
  globalManaTuningScale: 1.2
});
export const SPELL_QUEUE_WINDOW_MS = 400;
export const GLOBAL_CAST_BAR_START_HOLD_MS = 90;
export const GLOBAL_SHOW_CANVAS_COMBAT_TIME = true;
export const GLOBAL_GAMEOVER_ON_SELF_DEATH = true;
export const GLOBAL_SUCCESS_ON_TIMEOUT_WITHOUT_GAMEOVER = true;
export const GLOBAL_SUCCESS_MESSAGE_TEXT = "연습 성공!! 축하합니다!!";
// 쿨다운 매니저 상단 버프/프록 아이콘 공통 크기/위치 (모든 힐러 공통)
export const SPECIAL_PROC_OVERLAY_ICON_SIZE_PX = 22;
export const SPECIAL_PROC_OVERLAY_TOP_OFFSET_PX = -18;
export const HEALER_PRACTICE_DESKTOP_ONLY_CONFIG = Object.freeze({
  enabled: true,
  minViewportWidthPx: 1024,
  requireFinePointer: true,
  unsupportedMessage: "데스크탑 환경만 지원됩니다 ㅠㅠ"
});

// 힐러 아이콘 선택 시 안내문을 리스트 형태로 표시합니다.
// 필요 시 힐러별 키(예: "holy-paladin")를 추가해 별도 문구를 넣을 수 있습니다.
export const HEALER_PRACTICE_DISCLAIMER_BY_HEALER = Object.freeze({
  default: Object.freeze([
    "실제 게임 튜닝 수치와 다를 수 있습니다.",
    "새벽빛 빨대 등 몇몇 사항은 구현되지 않았습니다."
  ]),
  "holy-paladin": Object.freeze([
    "기준치 - 지능:2000, 가속:30%, 특화:40%, 치명타:30%, 유연: 0%, 마나: 275,000",
    "실제 게임 튜닝 수치와 다를 수 있습니다. 특히 특화는 모두 최대 효율로 계산됩니다.",
    "가이드의 레이드 특성을 기반으로 하며 신성한 목적, 빛의 교부, 새벽빛 연결힐 등 몇몇 특성은 구현되지 않았습니다.",
    "전투시간이 짧으므로 마나 소모가 원래보다 조금 더 많게 변경됩니다."
  ]),
  "restoration-druid": Object.freeze([
    "실제 게임 튜닝 수치와 다를 수 있습니다.",
    "새벽빛 빨대 등 몇몇 사항은 구현되지 않았습니다."
  ]),
  "holy-priest": Object.freeze([
    "기준치 - 지능:2000, 가속:15%, 특화:30%, 치명타:30%, 유연: 0%, 마나: 275,000",
    "실제 게임 튜닝 수치와 다를 수 있습니다.",
    "전투시간이 짧으므로 마나 소모가 원래보다 조금 더 많게 변경됩니다."
  ])
});

// 힐러별 안내 섹션에 표시할 패치 메타 정보입니다.
// - lastUpdatedAt: 최종 수정 날짜 문자열
// - patchVersion: 패치 버전 문자열
export const HEALER_PRACTICE_PATCH_META_BY_HEALER = Object.freeze({
  default: Object.freeze({
    lastUpdatedAt: "",
    patchVersion: ""
  }),
  "holy-paladin": Object.freeze({
    lastUpdatedAt: "2026-03-02",
    patchVersion: "12.0.1"
  }),
  "restoration-druid": Object.freeze({
    lastUpdatedAt: "",
    patchVersion: ""
  }),
  "holy-priest": Object.freeze({
    lastUpdatedAt: "2026-03-08",
    patchVersion: "12.0.1"
  })
});

// 랭킹은 패치 단위로 분리 저장/조회됩니다.
// - currentPatchVersion: 현재 저장 기준 패치
// - availablePatchVersions: 랭킹 조회 탭에 표시할 패치 목록
//   (새 패치가 시작되면 currentPatchVersion 변경 + 목록에 추가)
export const HEALER_PRACTICE_RANKING_PATCH_CONFIG = Object.freeze({
  currentPatchVersion: "12.0.1",
  availablePatchVersions: Object.freeze(["12.0.1"])
});

export const HEALER_PRACTICE_MAP_OPTIONS = Object.freeze([
  Object.freeze({ value: "void-default", label: "공허(default)" })
]);
export const DEFAULT_PRACTICE_MAP_KEY = HEALER_PRACTICE_MAP_OPTIONS[0]?.value ?? "void-default";

export const TANK_ROLE_META = Object.freeze({
  key: "tank",
  name: "탱커",
  iconUrl: buildPublicAssetUrl("images/DF_Tank_v2.png")
});

// 후보 이름은 UI가 아닌 코드에서 직접 수정합니다.
export const CANDIDATE_NAME_POOL = [
  "벤제마",
  "음바페",
  "비니시우스",
  "모드리치",
  "페드리",
  "이니에스타",
  "앙리",
  "제라드",
  "스콜스",
  "램파드",
  "퍼디난드",
  "말디니",
  "로드리",
  "홀란",
  "야말",
  "레반도프스키",
  "칸나바로",
  "카카",
  "호나우두",
  "호나우지뉴",
  "지단",
  "피구",
  "베컴",
  "비티냐",
  "살라",
  "케인",
  "하키미",
  "뎀벨레",
  "사비",
  "토레스",
  "사카",
  "라이스",
  "수비멘디",
  "살리바",
  "요케레스",
  "리베리",
  "로벤",
  "드록바",
  "반다이크",
  "네이마르",
  "벨링엄",
  "그리즈만",
  "루니",
  "부폰",
  "카푸",
  "베르캄프",
  "KDB",
  "수아레스",
  "노이어",
  "비르츠",
  "하피냐",
  "발베르데",
  "콜파머",
  "올리세",
  "외데고르",
  "누노멘데스",
  "카세미루",
  "쿠르투아",
  "키미히",
  "아놀드",
  "아르테타",
  "사비알론소",
  "루카쿠",
  "돈나룸마",
  "외질",
  "피를로",
  "라모스",
  "푸욜",
  "즐라탄",
  "델피에로",
  "네드베드",
  "긱스",
  "베일",
  "아자르",
  "산체스",
  "흐비차",
  "리스제임스",
  "누누멘데스",
  "카르바할",
  "존테리",
  "토니크로스",
  "피케",
  "마케렐레",
  "에시앙",
  "잠브로타",
  "자네티",
  "마르셀루",
  "람",
  "티아고실바",
  "포그바",
  "보누치",
  "캉테",
  "프랭키더용",
  "조르지뉴",
  "알라바",
  "베실바",
  "브페",
  "팀버",
  "트로사르",
  "디마리아"
];

export const FIXED_TANK_ANCHORS = Object.freeze([
  Object.freeze({ name: "호날두", row: 1, column: 1 }),
  Object.freeze({ name: "메시", row: 3, column: 1 })
]);

export const HANGUL_TO_QWERTY_KEY_ALIAS = Object.freeze({
  "ㅂ": "Q",
  "ㅃ": "Q",
  "ㅈ": "W",
  "ㅉ": "W",
  "ㄷ": "E",
  "ㄸ": "E",
  "ㄱ": "R",
  "ㄲ": "R",
  "ㅅ": "T",
  "ㅆ": "T",
  "ㅛ": "Y",
  "ㅕ": "U",
  "ㅑ": "I",
  "ㅐ": "O",
  "ㅒ": "O",
  "ㅔ": "P",
  "ㅖ": "P",
  "ㅁ": "A",
  "ㄴ": "S",
  "ㅇ": "D",
  "ㄹ": "F",
  "ㅎ": "G",
  "ㅗ": "H",
  "ㅓ": "J",
  "ㅏ": "K",
  "ㅣ": "L",
  "ㅋ": "Z",
  "ㅌ": "X",
  "ㅊ": "C",
  "ㅍ": "V",
  "ㅠ": "B",
  "ㅜ": "N",
  "ㅡ": "M"
});

export const MODIFIER_OPTIONS = [
  { value: "", label: "없음" },
  { value: "CTRL", label: "Ctrl" },
  { value: "ALT", label: "Alt" },
  { value: "SHIFT", label: "Shift" },
  { value: "CMD", label: "Cmd" }
];

export const MOUSE_BINDING_OPTIONS = [
  { token: "", label: "없음", label_cdm: "없음" },
  { token: "LMB", label: "좌클릭", label_cdm: "좌클" },
  { token: "RMB", label: "우클릭", label_cdm: "우클" },
  { token: "SHIFT+LMB", label: "Shift + 좌클릭", label_cdm: "Sh+좌" },
  { token: "SHIFT+RMB", label: "Shift + 우클릭", label_cdm: "Sh+우" },
  { token: "CTRL+LMB", label: "Ctrl + 좌클릭", label_cdm: "Ctl+좌" },
  { token: "CTRL+RMB", label: "Ctrl + 우클릭", label_cdm: "Ctl+우" },
  { token: "ALT+LMB", label: "Alt + 좌클릭", label_cdm: "Alt+좌" },
  { token: "ALT+RMB", label: "Alt + 우클릭", label_cdm: "Alt+우" },
  { token: "MMB", label: "마우스휠클릭", label_cdm: "휠클" },
  { token: "WHEELUP", label: "휠 업", label_cdm: "휠↑" },
  { token: "WHEELDOWN", label: "휠 다운", label_cdm: "휠↓" },
  { token: "SHIFT+WHEELUP", label: "Shift + 휠 업", label_cdm: "Sh+휠↑" },
  { token: "SHIFT+WHEELDOWN", label: "Shift + 휠 다운", label_cdm: "Sh+휠↓" },
  { token: "CTRL+WHEELUP", label: "Ctrl + 휠 업", label_cdm: "Ctl+휠↑" },
  { token: "CTRL+WHEELDOWN", label: "Ctrl + 휠 다운", label_cdm: "Ctl+휠↓" },
  { token: "ALT+WHEELUP", label: "Alt + 휠 업", label_cdm: "Alt+휠↑" },
  { token: "ALT+WHEELDOWN", label: "Alt + 휠 다운", label_cdm: "Alt+휠↓" }
];

export const RAID_LAYOUT_OPTIONS = [
  { value: "4x5", label: "4 x 5 (기본)" },
  { value: "5x4", label: "5 x 4" }
];

export const MOVEMENT_KEY_OPTIONS = Object.freeze([
  { value: "WASD", label: "WASD (기본)" },
  { value: "WSQE", label: "WSQE (Q/E 좌우)" },
  { value: "CUSTOM", label: "커스텀" }
]);

export const MOVEMENT_PRESET_KEYS = Object.freeze({
  WASD: Object.freeze({
    up: "W",
    down: "S",
    left: "A",
    right: "D"
  }),
  WSQE: Object.freeze({
    up: "W",
    down: "S",
    left: "Q",
    right: "E"
  }),
  CUSTOM: Object.freeze({
    up: "W",
    down: "S",
    left: "A",
    right: "D"
  })
});

export const MOVEMENT_PRESET_KEYCODES = Object.freeze({
  WASD: Object.freeze({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  }),
  WSQE: Object.freeze({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.Q,
    right: Phaser.Input.Keyboard.KeyCodes.E
  }),
  CUSTOM: Object.freeze({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  })
});

export const MOVEMENT_RESTRICTED_KEY_LIST_BY_PRESET = Object.freeze({
  WASD: Object.freeze([]),
  WSQE: Object.freeze(["Q", "E", "A", "D"]),
  CUSTOM: Object.freeze([])
});

// 난이도별 피해 배율은 여기 숫자만 수정하면 됩니다.
// scheduledRaidBursts:
// - startAtSec: 시작 시점(초)
// - tickIntervalSec: 틱 간격(초)
// - tickCount: 틱 횟수
// - damagePerTick: 각 틱마다 모든 공대원에게 들어갈 기본 피해량(절대값)
// 여러 개를 배열에 넣으면 패턴이 누적 적용됩니다.
export const PRACTICE_DIFFICULTY_TUNING = Object.freeze({
  normal: Object.freeze({
    label: "일반",
    fixedCombatDurationMinutes: 2,
    incomingDamageMultiplier: 0.48,
    damageBreakEveryMs: 30000,
    damageBreakDurationMs: 5000,
    scheduledRaidBursts: Object.freeze([
      { id: "raid-pulse-1", startAtSec: 25, tickIntervalSec: 1, tickCount: 5, damagePerTick: 6200 },
      { id: "raid-pulse-2", startAtSec: 85, tickIntervalSec: 1, tickCount: 5, damagePerTick: 6200 },
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
      { id: "raid-pulse-4", startAtSec: 80, tickIntervalSec: 1, tickCount: 8, damagePerTick: 6500 },
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
      { id: "raid-pulse-7", startAtSec: 140, tickIntervalSec: 1, tickCount: 8, damagePerTick: 6800 },
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
      { id: "raid-pulse-10", startAtSec: 140, tickIntervalSec: 1, tickCount: 8, damagePerTick: 7100 },
    ])
  })
});

export const DIFFICULTY_OPTIONS = Object.freeze([
  { value: "normal", label: "일반 (2분)" },
  { value: "heroic", label: "영웅 (2분)" },
  { value: "mythic", label: "신화 (2.5분)" },
  { value: "worldFirstKill", label: "월퍼킬 (2.5분)" }
]);

// 전투 종료 스코어(100점 만점) 기준 설정
// - 공통 40점: 사망자(20) + 오버힐(15) + 자힐 비중(5)
// - 힐러+난이도 30점: 평균 공대 체력(20) + 남은 마나(10)
// - 힐러 공통 10점: CPM(힐러별 커스텀)
// - 힐러 전용 20점: 힐러별 별도 규칙
// threshold는 코드에서 직접 조절하세요.
const DEFAULT_SCORE_AVERAGE_RAID_HEALTH_CONFIG = Object.freeze({
  maxPoints: 20,
  fullScoreAtOrAbovePct: 75,
  pctPerPointLost: 1
});

const DEFAULT_SCORE_REMAINING_MANA_CONFIG = Object.freeze({
  maxPoints: 10,
  fullScoreAtOrBelowPct: 20,
  pctPerPointLost: 2,
  pointsLostPerStep: 0.5
});

const DEFAULT_SCORE_HOLY_PALADIN_SPECIFIC_CONFIG = Object.freeze({
  maxPoints: 20,
  type: "wastedHolyPower",
  pointsLostPerWastedHolyPower: 0.5
});

const DEFAULT_SCORE_FIXED_HEALER_SPECIFIC_CONFIG = Object.freeze({
  maxPoints: 20,
  type: "fixed"
});

const DEFAULT_SCORE_CPM_CONFIG = Object.freeze({
  maxPoints: 10,
  fullScoreAtOrAboveCpm: 42,
  zeroScoreAtOrBelowCpm: 30
});

export const HEALER_PRACTICE_SCORE_COMMON_CONFIG = Object.freeze({
  deaths: Object.freeze({
    maxPoints: 20,
    pointsLostPerDeath: 1
  }),
  overhealingByDifficulty: Object.freeze({
    normal: Object.freeze({
      maxPoints: 15,
      fullScoreAtOrBelowPct: 20,
      pctPerPointLost: 2,
      pointsLostPerStep: 0.5
    }),
    heroic: Object.freeze({
      maxPoints: 15,
      fullScoreAtOrBelowPct: 10,
      pctPerPointLost: 2,
      pointsLostPerStep: 0.5
    }),
    mythic: Object.freeze({
      maxPoints: 15,
      fullScoreAtOrBelowPct: 10,
      pctPerPointLost: 2,
      pointsLostPerStep: 0.5
    }),
    worldFirstKill: Object.freeze({
      maxPoints: 15,
      fullScoreAtOrBelowPct: 10,
      pctPerPointLost: 2,
      pointsLostPerStep: 0.5
    })
  }),
  selfHealRatio: Object.freeze({
    maxPoints: 5,
    fullScoreAtOrBelowPct: 6,
    pctPerPointLost: 3,
    pointsLostPerStep: 1
  })
});

// 평균 공대 체력/남은 마나/힐러 전용 배점은 힐러+난이도별로 설정합니다.
// holy-paladin healerSpecific:
// - type: "wastedHolyPower" -> 낭비한 신성한 힘 0개면 만점, 1개당 1점 차감
export const HEALER_PRACTICE_SCORE_HEALER_CONFIG_BY_SLUG = Object.freeze({
  "holy-paladin": Object.freeze({
    normal: Object.freeze({
      averageRaidHealth: DEFAULT_SCORE_AVERAGE_RAID_HEALTH_CONFIG,
      remainingMana: DEFAULT_SCORE_REMAINING_MANA_CONFIG,
      healerSpecific: DEFAULT_SCORE_HOLY_PALADIN_SPECIFIC_CONFIG
    }),
    heroic: Object.freeze({
      averageRaidHealth: DEFAULT_SCORE_AVERAGE_RAID_HEALTH_CONFIG,
      remainingMana: DEFAULT_SCORE_REMAINING_MANA_CONFIG,
      healerSpecific: DEFAULT_SCORE_HOLY_PALADIN_SPECIFIC_CONFIG
    }),
    mythic: Object.freeze({
      averageRaidHealth: DEFAULT_SCORE_AVERAGE_RAID_HEALTH_CONFIG,
      remainingMana: DEFAULT_SCORE_REMAINING_MANA_CONFIG,
      healerSpecific: DEFAULT_SCORE_HOLY_PALADIN_SPECIFIC_CONFIG
    }),
    worldFirstKill: Object.freeze({
      averageRaidHealth: DEFAULT_SCORE_AVERAGE_RAID_HEALTH_CONFIG,
      remainingMana: DEFAULT_SCORE_REMAINING_MANA_CONFIG,
      healerSpecific: DEFAULT_SCORE_HOLY_PALADIN_SPECIFIC_CONFIG
    })
  }),
  "restoration-druid": Object.freeze({
    normal: Object.freeze({
      averageRaidHealth: DEFAULT_SCORE_AVERAGE_RAID_HEALTH_CONFIG,
      remainingMana: DEFAULT_SCORE_REMAINING_MANA_CONFIG,
      healerSpecific: DEFAULT_SCORE_FIXED_HEALER_SPECIFIC_CONFIG
    }),
    heroic: Object.freeze({
      averageRaidHealth: DEFAULT_SCORE_AVERAGE_RAID_HEALTH_CONFIG,
      remainingMana: DEFAULT_SCORE_REMAINING_MANA_CONFIG,
      healerSpecific: DEFAULT_SCORE_FIXED_HEALER_SPECIFIC_CONFIG
    }),
    mythic: Object.freeze({
      averageRaidHealth: DEFAULT_SCORE_AVERAGE_RAID_HEALTH_CONFIG,
      remainingMana: DEFAULT_SCORE_REMAINING_MANA_CONFIG,
      healerSpecific: DEFAULT_SCORE_FIXED_HEALER_SPECIFIC_CONFIG
    }),
    worldFirstKill: Object.freeze({
      averageRaidHealth: DEFAULT_SCORE_AVERAGE_RAID_HEALTH_CONFIG,
      remainingMana: DEFAULT_SCORE_REMAINING_MANA_CONFIG,
      healerSpecific: DEFAULT_SCORE_FIXED_HEALER_SPECIFIC_CONFIG
    })
  }),
  "holy-priest": Object.freeze({
    normal: Object.freeze({
      averageRaidHealth: DEFAULT_SCORE_AVERAGE_RAID_HEALTH_CONFIG,
      remainingMana: DEFAULT_SCORE_REMAINING_MANA_CONFIG,
      healerSpecific: DEFAULT_SCORE_FIXED_HEALER_SPECIFIC_CONFIG
    }),
    heroic: Object.freeze({
      averageRaidHealth: DEFAULT_SCORE_AVERAGE_RAID_HEALTH_CONFIG,
      remainingMana: DEFAULT_SCORE_REMAINING_MANA_CONFIG,
      healerSpecific: DEFAULT_SCORE_FIXED_HEALER_SPECIFIC_CONFIG
    }),
    mythic: Object.freeze({
      averageRaidHealth: DEFAULT_SCORE_AVERAGE_RAID_HEALTH_CONFIG,
      remainingMana: DEFAULT_SCORE_REMAINING_MANA_CONFIG,
      healerSpecific: DEFAULT_SCORE_FIXED_HEALER_SPECIFIC_CONFIG
    }),
    worldFirstKill: Object.freeze({
      averageRaidHealth: DEFAULT_SCORE_AVERAGE_RAID_HEALTH_CONFIG,
      remainingMana: DEFAULT_SCORE_REMAINING_MANA_CONFIG,
      healerSpecific: DEFAULT_SCORE_FIXED_HEALER_SPECIFIC_CONFIG
    })
  })
});

// CPM은 난이도와 무관하게 힐러별 기준만 사용합니다.
export const HEALER_PRACTICE_SCORE_CPM_CONFIG_BY_SLUG = Object.freeze({
  "holy-paladin": DEFAULT_SCORE_CPM_CONFIG,
  "restoration-druid": DEFAULT_SCORE_CPM_CONFIG,
  "holy-priest": DEFAULT_SCORE_CPM_CONFIG
});

export const PLAYER_MOVE_SPEED_PER_SEC = 220;

// Phaser 개인 생존 미니게임 공통 튜닝은 이 상수만 수정하면 됩니다.
export const PHASER_ARENA_VISUAL_CONFIG = Object.freeze({
  playerSpeedPerSec: PLAYER_MOVE_SPEED_PER_SEC,
  playerSizePx: 20,
  playerRadiusPx: 10,
  healthBarWidthPx: 38,
  healthBarHeightPx: 5,
  healthBarOffsetYPx: 17,
  mechanicsStartDelayMs: 7000,
  hazardCountdownMs: 2500,
  hazardTargetJitterPx: 12,
  hazardBarOuterColorHex: 0x1d4ed8,
  hazardBarInnerColorHex: 0x60a5fa,
  hazardBarOuterAlpha: 0.32,
  hazardBarInnerAlpha: 0.72,
  hazardSafePaddingPx: 18,
  missileWidthPx: 28,
  missileHeightPx: 12,
  missileTargetJitterPx: 10,
  missileColorHex: 0xf97316,
  missileAlpha: 0.9,
  missileCollisionRadiusPx: 10
});

// 난이도별 체력/바닥/미사일 빈도/피해량을 코드에서 직접 조절합니다.
export const PHASER_DIFFICULTY_MECHANIC_TUNING = Object.freeze({
  normal: Object.freeze({
    showPlayerHealthBar: true,
    playerMaxHealth: 100,
    hazardEnabled: true,
    hazardSpawnIntervalMinMs: 5300,
    hazardSpawnIntervalMaxMs: 6400,
    hazardBarWidthPx: 20,
    hazardBarLengthPx: 520,
    hazardDamage: 20,
    missileEnabled: true,
    missileSpawnIntervalMinMs: 3800,
    missileSpawnIntervalMaxMs: 4500,
    missileSpeedPerSec: 210,
    missileDamage: 15,
    greenGridZonePatternEnabled: true,
    greenGridZonePatternSpawnIntervalMinMs: 20000,
    greenGridZonePatternSpawnIntervalMaxMs: 30000,
    greenGridZonePatternSizeCells: 4,
    greenGridZonePatternCountdownSec: 10,
    greenGridZonePatternMissDamage: 50,
    greenGridZonePatternInstructionText: "초록 구역으로 이동",
    greenGridZonePatternCountdownPrefixText: "남은 카운트"
  }),
  heroic: Object.freeze({
    showPlayerHealthBar: true,
    playerMaxHealth: 100,
    hazardEnabled: true,
    hazardSpawnIntervalMinMs: 3800,
    hazardSpawnIntervalMaxMs: 5900,
    hazardBarWidthPx: 20,
    hazardBarLengthPx: 520,
    hazardDamage: 30,
    missileEnabled: true,
    missileSpawnIntervalMinMs: 3000,
    missileSpawnIntervalMaxMs: 4500,
    missileSpeedPerSec: 230,
    missileDamage: 25,
    greenGridZonePatternEnabled: true,
    greenGridZonePatternSpawnIntervalMinMs: 20000,
    greenGridZonePatternSpawnIntervalMaxMs: 25000,
    greenGridZonePatternSizeCells: 3,
    greenGridZonePatternCountdownSec: 8,
    greenGridZonePatternMissDamage: 60,
    greenGridZonePatternInstructionText: "초록 구역으로 이동",
    greenGridZonePatternCountdownPrefixText: "남은 카운트"
  }),
  mythic: Object.freeze({
    showPlayerHealthBar: true,
    playerMaxHealth: 100,
    hazardEnabled: true,
    hazardSpawnIntervalMinMs: 3500,
    hazardSpawnIntervalMaxMs: 5500,
    hazardBarWidthPx: 24,
    hazardBarLengthPx: 600,
    hazardDamage: 40,
    missileEnabled: true,
    missileSpawnIntervalMinMs: 3000,
    missileSpawnIntervalMaxMs: 4000,
    missileSpeedPerSec: 240,
    missileDamage: 40,
    greenGridZonePatternEnabled: true,
    greenGridZonePatternSpawnIntervalMinMs: 20000,
    greenGridZonePatternSpawnIntervalMaxMs: 25000,
    greenGridZonePatternSizeCells: 3,
    greenGridZonePatternCountdownSec: 8,
    greenGridZonePatternMissDamage: 80,
    greenGridZonePatternInstructionText: "초록 구역으로 이동",
    greenGridZonePatternCountdownPrefixText: "남은 카운트",
    worldFirstKillZonePatternEnabled: true,
    worldFirstKillZonePatternStartTimesSec: Object.freeze([48, 108]),
    worldFirstKillZonePatternActiveMs: 12000,
    worldFirstKillZonePatternStepDurationMs: 3000,
    worldFirstKillZonePatternStripeCount: 20,
    worldFirstKillZonePatternStepDamage: 50,
    worldFirstKillZonePatternStepInstantKill: false,
    worldFirstKillZoneHazardSpawnIntervalMinMs: 1520,
    worldFirstKillZoneHazardSpawnIntervalMaxMs: 1860,
    worldFirstKillZoneHazardTargetedChance: 0.5,
    worldFirstKillZoneHazardRandomCountWhenUntargeted: 2,
    worldFirstKillZonePatternDangerColorHex: 0x8b5cf6,
    worldFirstKillZonePatternDangerAlpha: 0.34
  }),
  worldFirstKill: Object.freeze({
    showPlayerHealthBar: true,
    playerMaxHealth: 100,
    hazardEnabled: true,
    hazardSpawnIntervalMinMs: 3000,
    hazardSpawnIntervalMaxMs: 4500,
    hazardBarWidthPx: 25,
    hazardBarLengthPx: 640,
    hazardDamage: 50,
    missileEnabled: true,
    missileSpawnIntervalMinMs: 2000,
    missileSpawnIntervalMaxMs: 3000,
    missileSpeedPerSec: 250,
    missileDamage: 50,
    greenGridZonePatternEnabled: true,
    greenGridZonePatternSpawnIntervalMinMs: 20000,
    greenGridZonePatternSpawnIntervalMaxMs: 25000,
    greenGridZonePatternSizeCells: 3,
    greenGridZonePatternCountdownSec: 8,
    greenGridZonePatternMissDamage: 90,
    greenGridZonePatternInstructionText: "초록 구역으로 이동",
    greenGridZonePatternCountdownPrefixText: "남은 카운트",
    worldFirstKillZonePatternEnabled: true,
    worldFirstKillZonePatternStartTimesSec: Object.freeze([21, 51, 111, 141]),
    worldFirstKillZonePatternActiveMs: 9000,
    worldFirstKillZonePatternStepDurationMs: 3000,
    worldFirstKillZonePatternStripeCount: 20,
    worldFirstKillZonePatternStepDamage: 0,
    worldFirstKillZonePatternStepInstantKill: true,
    worldFirstKillZoneHazardSpawnIntervalMinMs: 1350,
    worldFirstKillZoneHazardSpawnIntervalMaxMs: 1620,
    worldFirstKillZoneHazardTargetedChance: 0.6,
    worldFirstKillZoneHazardRandomCountWhenUntargeted: 3,
    worldFirstKillZonePatternDangerColorHex: 0x8b5cf6,
    worldFirstKillZonePatternDangerAlpha: 0.4
  })
});

export const RAID_CLASS_POOL = [
  { key: "warrior", name: "전사", color: "#C79C6E" },
  { key: "paladin", name: "성기사", color: "#F58CBA" },
  { key: "hunter", name: "사냥꾼", color: "#ABD473" },
  { key: "rogue", name: "도적", color: "#FFF569" },
  { key: "priest", name: "사제", color: "#FFFFFF" },
  { key: "deathKnight", name: "죽기", color: "#C41F3B" },
  { key: "shaman", name: "주술사", color: "#0070DE" },
  { key: "mage", name: "마법사", color: "#40C7EB" },
  { key: "warlock", name: "흑마", color: "#8787ED" },
  { key: "monk", name: "수도사", color: "#00FF98" },
  { key: "druid", name: "드루이드", color: "#FF7D0A" },
  { key: "demonHunter", name: "악사", color: "#A330C9" },
  { key: "evoker", name: "기원사", color: "#33937F" }
];

export const TANK_CLASS_KEYS = Object.freeze(["deathKnight", "demonHunter", "druid", "paladin", "warrior", "monk"]);
export const TANK_CLASS_POOL = Object.freeze(RAID_CLASS_POOL.filter((entry) => TANK_CLASS_KEYS.includes(entry.key)));

// 레이드 프레임 크기/간격은 여기 숫자로 코드에서 직접 조절합니다.
export const RAID_FRAME_VISUAL_CONFIG = Object.freeze({
  gridWidthOverridePx: null,
  frameSizeByLayout: Object.freeze({
    "4x5": Object.freeze({
      widthPx: 112,
      heightPx: 58
    }),
    "5x4": Object.freeze({
      widthPx: 112,
      heightPx: 58
    })
  }),
  // 하위 호환용 기본값 (frameSizeByLayout 미설정 시 사용)
  frameWidthPx: 112,
  frameHeightPx: 58,
  frameNameFontPx: 12,
  topOverlayBaseOffsetYPx: 0,
  topOverlayReservedHeightPx: 114
});

// 쿨다운 매니저 크기/배치도 코드에서 직접 조절합니다.
export const COOLDOWN_MANAGER_LAYOUT_CONFIG = Object.freeze({
  iconSizePx: 50,
  overlayIconSizePx: 34,
  iconGapPx: 4,
  holyPowerCellWidthPx: 50,
  holyPowerCellHeightPx: 12,
  overlayHolyPowerCellWidthPx: 34,
  overlayHolyPowerCellHeightPx: 9,
  previewHeightPx: 210
});

export const DEFAULT_SPELL_ICON_URL = "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg";

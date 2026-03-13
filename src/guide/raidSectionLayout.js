export const raidSectionLayout = [
  { id: "overview", title: "개요", type: "text" },
  { id: "basic-operation", title: "주요 스킬", type: "text" },
  { id: "advanced-usage", title: "잡기술", type: "text" },
  { id: "changelog", title: "업데이트 내역", type: "changelog" },
];

function normalizeSingleModeText(value) {
  if (typeof value === "string") {
    return { raid: value, mythic: value };
  }
  return {
    raid: value?.raid || "",
    mythic: value?.mythic || "",
  };
}

function normalizeRotationItem(item, index) {
  if (typeof item === "string") {
    return { id: `rotation-${index + 1}`, label: `로테이션 ${index + 1}`, content: item };
  }
  return {
    id: item?.id || `rotation-${index + 1}`,
    label: item?.label || item?.title || `로테이션 ${index + 1}`,
    content: item?.content || item?.body || "",
  };
}

function normalizeRotationMode(value) {
  if (Array.isArray(value)) {
    return { intro: "", items: value.map(normalizeRotationItem) };
  }
  return {
    intro: value?.intro || "",
    items: Array.isArray(value?.items) ? value.items.map(normalizeRotationItem) : [],
  };
}

function normalizeRotationByMode(value) {
  if (!value) {
    return { raid: normalizeRotationMode(), mythic: normalizeRotationMode() };
  }
  const hasModeShape =
    typeof value === "object" &&
    (Object.prototype.hasOwnProperty.call(value, "raid") ||
      Object.prototype.hasOwnProperty.call(value, "mythic"));
  if (hasModeShape) {
    return {
      raid: normalizeRotationMode(value?.raid),
      mythic: normalizeRotationMode(value?.mythic),
    };
  }
  const normalized = normalizeRotationMode(value);
  return { raid: normalized, mythic: normalized };
}

export function buildRaidGuideSections(contentById = {}) {
  return raidSectionLayout.map((section) => {
    const source = contentById[section.id] || {};
    const contentByMode = normalizeSingleModeText(source.contentByMode);
    const modeAvailability = {
      raid: { enabled: true, statusLabel: "" },
      mythic: { enabled: false, statusLabel: "준비중" },
    };

    const base = {
      ...section,
      hasModeTabs: false,
      modeAvailability,
      contentByMode,
    };

    if (section.id === "overview") {
      base.raidPlanUrl = typeof source.raidPlanUrl === "string" ? source.raidPlanUrl.trim() : "";
    }

    // 주요 스킬 섹션: 로테이션 데이터
    if (section.id === "basic-operation") {
      base.rotationByMode = normalizeRotationByMode(source.rotationByMode);
    }

    // 업데이트 내역
    if (section.type === "changelog") {
      base.entries = Array.isArray(source.entries) ? source.entries : [];
    }

    return base;
  });
}

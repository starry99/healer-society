export const GUIDE_MODES = [
  { id: "raid", label: "레이드" },
  { id: "mythic", label: "쐐기" }
];

export const guideSectionLayout = [
  { id: "overview", title: "개요", type: "text", hasModeTabs: true },
  { id: "talents", title: "특성", type: "talents", hasModeTabs: true },
  { id: "basic-operation", title: "주요 스킬", type: "text", hasModeTabs: true },
  { id: "advanced-usage", title: "추가 활용법", type: "text", hasModeTabs: true },
  { id: "stats", title: "스탯", type: "stats", hasModeTabs: false },
  { id: "recommended-sites", title: "추천사이트", type: "links", hasModeTabs: false }
];

function normalizeModeText(value) {
  if (typeof value === "string") {
    return {
      raid: value,
      mythic: value
    };
  }

  return {
    raid: value?.raid || "",
    mythic: value?.mythic || ""
  };
}

function normalizeModeAvailabilityEntry(value, fallbackEnabled = true) {
  if (typeof value === "boolean") {
    return {
      enabled: value,
      statusLabel: value ? "" : "준비중"
    };
  }

  if (value && typeof value === "object") {
    const enabled = typeof value.enabled === "boolean" ? value.enabled : fallbackEnabled;
    const statusLabel =
      enabled ? "" : typeof value.statusLabel === "string" && value.statusLabel.trim() ? value.statusLabel.trim() : "준비중";
    return { enabled, statusLabel };
  }

  return {
    enabled: fallbackEnabled,
    statusLabel: fallbackEnabled ? "" : "준비중"
  };
}

function normalizeModeAvailability(source = {}, hasModeTabs = false) {
  const defaults = {
    raid: { enabled: true, statusLabel: "" },
    mythic: { enabled: true, statusLabel: "" }
  };

  if (!hasModeTabs) {
    return defaults;
  }

  const modeEnabled = source?.modeEnabled;
  if (modeEnabled && typeof modeEnabled === "object") {
    if (typeof modeEnabled.raid === "boolean") {
      defaults.raid.enabled = modeEnabled.raid;
      defaults.raid.statusLabel = modeEnabled.raid ? "" : "준비중";
    }
    if (typeof modeEnabled.mythic === "boolean") {
      defaults.mythic.enabled = modeEnabled.mythic;
      defaults.mythic.statusLabel = modeEnabled.mythic ? "" : "준비중";
    }
  }

  const disabledModes = Array.isArray(source?.disabledModes) ? source.disabledModes : [];
  disabledModes.forEach((modeId) => {
    if (modeId === "raid" || modeId === "mythic") {
      defaults[modeId] = { enabled: false, statusLabel: "준비중" };
    }
  });

  const modeAvailability = source?.modeAvailability;
  if (modeAvailability && typeof modeAvailability === "object") {
    if (Object.prototype.hasOwnProperty.call(modeAvailability, "raid")) {
      defaults.raid = normalizeModeAvailabilityEntry(modeAvailability.raid, defaults.raid.enabled);
    }
    if (Object.prototype.hasOwnProperty.call(modeAvailability, "mythic")) {
      defaults.mythic = normalizeModeAvailabilityEntry(modeAvailability.mythic, defaults.mythic.enabled);
    }
  }

  return defaults;
}

function normalizeStats(value) {
  const normalizedExtraByMode = normalizeModeText(value?.extraByMode);

  const normalizePriority = (item, index) => {
    if (typeof item === "string") {
      return {
        label: item,
        note: "",
        tier: index + 1
      };
    }

    const tier = Number.isFinite(item?.tier) ? Math.max(1, Math.floor(item.tier)) : null;
    return {
      label: item?.label || item?.name || `Priority ${index + 1}`,
      note: item?.note || item?.value || item?.description || "",
      tier
    };
  };

  const normalizeCard = (card, index) => ({
    id: card?.id || `card-${index}`,
    title: card?.title || `Stat Priority ${index + 1}`,
    icon: card?.icon || "",
    accent: card?.accent || card?.accentColor || "",
    priorities: Array.isArray(card?.priorities) ? card.priorities.map(normalizePriority) : []
  });

  const normalizeModeStats = (modeValue = {}, modeId = "raid") => {
    const summary = modeValue?.summary || "";
    const extra = typeof modeValue?.extra === "string" ? modeValue.extra : normalizedExtraByMode?.[modeId] || "";

    if (Array.isArray(modeValue?.cards) && modeValue.cards.length) {
      return {
        summary,
        cards: modeValue.cards.map(normalizeCard),
        extra
      };
    }

    if (Array.isArray(modeValue?.rows) && modeValue.rows.length) {
      const priorities = modeValue.rows
        .map((row, index) => ({
          rank: Number.isFinite(row?.rank) ? Math.max(1, Math.floor(row.rank)) : index + 1,
          label: row?.name || row?.label || "",
          note: row?.note || row?.value || row?.description || ""
        }))
        .filter((row) => row.label)
        .sort((a, b) => a.rank - b.rank)
        .map((row) => ({
          label: row.label,
          note: row.note
        }));

      return {
        summary,
        extra,
        cards: [
          {
            id: "default",
            title: modeValue?.title || "Stat Priority",
            icon: modeValue?.icon || "",
            accent: modeValue?.accent || "",
            priorities
          }
        ]
      };
    }

    return {
      summary,
      cards: [],
      extra
    };
  };

  return {
    raid: normalizeModeStats(value?.raid, "raid"),
    mythic: normalizeModeStats(value?.mythic, "mythic")
  };
}

function normalizeLinks(value) {
  return {
    intro: value?.intro || "",
    items: Array.isArray(value?.items) ? value.items : []
  };
}

function normalizeRotationItem(item, index) {
  if (typeof item === "string") {
    return {
      id: `rotation-${index + 1}`,
      label: `로테이션 ${index + 1}`,
      content: item
    };
  }

  return {
    id: item?.id || `rotation-${index + 1}`,
    label: item?.label || item?.title || `로테이션 ${index + 1}`,
    content: item?.content || item?.body || ""
  };
}

function normalizeRotationMode(value) {
  if (Array.isArray(value)) {
    return {
      intro: "",
      items: value.map(normalizeRotationItem)
    };
  }

  return {
    intro: value?.intro || "",
    items: Array.isArray(value?.items) ? value.items.map(normalizeRotationItem) : []
  };
}

function normalizeRotationByMode(value) {
  if (!value) {
    return {
      raid: normalizeRotationMode(),
      mythic: normalizeRotationMode()
    };
  }

  const hasModeShape = typeof value === "object" && (Object.prototype.hasOwnProperty.call(value, "raid") || Object.prototype.hasOwnProperty.call(value, "mythic"));
  if (hasModeShape) {
    return {
      raid: normalizeRotationMode(value?.raid),
      mythic: normalizeRotationMode(value?.mythic)
    };
  }

  const normalized = normalizeRotationMode(value);
  return {
    raid: normalized,
    mythic: normalized
  };
}

export function buildGuideSections(contentById = {}) {
  return guideSectionLayout.map((section) => {
    const source = contentById[section.id] || {};
    const resolvedHasModeTabs = typeof source?.hasModeTabs === "boolean" ? source.hasModeTabs : section.hasModeTabs;
    const modeAvailability = normalizeModeAvailability(source, resolvedHasModeTabs);

    if (section.type === "stats") {
      return {
        ...section,
        hasModeTabs: resolvedHasModeTabs,
        modeAvailability,
        statsByMode: normalizeStats(source)
      };
    }

    if (section.type === "links") {
      return {
        ...section,
        hasModeTabs: resolvedHasModeTabs,
        modeAvailability,
        links: normalizeLinks(source)
      };
    }

    if (section.type === "talents") {
      return {
        ...section,
        hasModeTabs: resolvedHasModeTabs,
        modeAvailability,
        contentByMode: normalizeModeText(source.contentByMode),
        extraByMode: normalizeModeText(source.extraByMode)
      };
    }

    if (section.id === "basic-operation") {
      return {
        ...section,
        hasModeTabs: resolvedHasModeTabs,
        modeAvailability,
        contentByMode: normalizeModeText(source.contentByMode),
        rotationByMode: normalizeRotationByMode(source.rotationByMode)
      };
    }

    return {
      ...section,
      hasModeTabs: resolvedHasModeTabs,
      modeAvailability,
      contentByMode: normalizeModeText(source.contentByMode)
    };
  });
}

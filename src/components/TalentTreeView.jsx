import { useEffect, useMemo, useState } from "react";
import { talentChoiceOverrides } from "../data/talentChoiceOverrides";
import { talentBuildVariants } from "../data/talentBuildVariants";
import { talentConnections } from "../data/talentConnections";
import { talentNodeTooltips } from "../data/talentNodeTooltips";

const MAIN_NODE_SIZE = 48;
const HERO_NODE_SIZE = 86;
const POINT_BADGE_SIZE = 24;
const HERO_EMBLEM_ICON_OVERRIDES = {
  "discipline-priest": "https://wow.zamimg.com/images/wow/TextureAtlas/live/talents-heroclass-priest-oracle.webp",
  "holy-paladin": "https://wow.zamimg.com/images/wow/TextureAtlas/live/talents-heroclass-paladin-heraldofthesun.webp",
  "restoration-druid": "https://wow.zamimg.com/images/wow/TextureAtlas/live/talents-heroclass-druid-keeperofthegrove.webp",
};
const MOBILE_GROUP_TEMPLATES = [
  { id: "hero", label: "영웅 특성", padX: 20, padY: 16, nodeSize: 28, heroSize: 58, minWidth: 200, minHeight: 264 },
  { id: "class", label: "공용 특성", padX: 14, padY: 12, nodeSize: 32, heroSize: 58, minWidth: 356, minHeight: 484 },
  { id: "spec", label: "전문화 특성", padX: 14, padY: 12, nodeSize: 32, heroSize: 58, minWidth: 396, minHeight: 484 }
];

function refreshWowheadTooltips() {
  if (window?.WH?.Tooltips?.refreshLinks) {
    window.WH.Tooltips.refreshLinks();
    return;
  }
  if (window?.$WowheadPower?.refreshLinks) {
    window.$WowheadPower.refreshLinks();
  }
}

function toPercent(value, ref) {
  return `${(value / ref) * 100}%`;
}

function headerTextColor(color, fallback) {
  if (typeof color === "string" && color.trim()) {
    return color;
  }
  return fallback;
}

function outerShapeClass(shape) {
  if (shape === "square") {
    return "rounded-[10px]";
  }
  if (shape === "choice") {
    return "rounded-[6px]";
  }
  return "rounded-full";
}

function innerShapeClass(shape) {
  if (shape === "square") {
    return "rounded-[8px]";
  }
  if (shape === "choice") {
    return "rounded-[5px]";
  }
  return "rounded-full";
}

function shapeStyle(shape) {
  if (shape !== "choice") {
    return undefined;
  }
  return {
    clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
  };
}

function nodeToneClass() {
  return "border-[#d9be4b] bg-[#151f2d]/96 shadow-[0_0_14px_rgba(208,175,68,0.28)]";
}

function toNodeMap(tree) {
  const map = new Map();
  if (!tree?.nodes?.length) {
    return map;
  }
  tree.nodes.forEach((node) => {
    map.set(`${node.row},${node.col}`, node);
  });
  return map;
}

function parseRowColKey(value) {
  if (typeof value !== "string") {
    return null;
  }
  const matched = value.match(/^(\d+)\s*,\s*(\d+)$/);
  if (!matched) {
    return null;
  }
  return {
    row: Number(matched[1]),
    col: Number(matched[2])
  };
}

function findTreeNodeByRowCol(tree, rowColKey) {
  const parsed = parseRowColKey(rowColKey);
  if (!tree?.nodes?.length || !parsed) {
    return null;
  }
  return tree.nodes.find((node) => node.row === parsed.row && node.col === parsed.col) || null;
}

function buildLayoutNodeByMetaId(nodes, metaByNodeId) {
  const map = new Map();
  nodes.forEach((node) => {
    const meta = metaByNodeId[node.id];
    if (meta?.id && !map.has(meta.id)) {
      map.set(meta.id, node);
    }
  });
  return map;
}

function buildArrowBetween(fromNode, toNode) {
  const dx = toNode.x - fromNode.x;
  const dy = toNode.y - fromNode.y;
  return {
    x: fromNode.x,
    y: fromNode.y,
    w: Math.hypot(dx, dy),
    r: Math.atan2(dy, dx)
  };
}

function arrowKey(arrow) {
  const x = Math.round(arrow.x * 100) / 100;
  const y = Math.round(arrow.y * 100) / 100;
  const w = Math.round(arrow.w * 100) / 100;
  const r = Math.round(arrow.r * 1000) / 1000;
  return `${x}|${y}|${w}|${r}`;
}

function mergeArrows(baseArrows, extraArrows) {
  const merged = new Map();
  [...(baseArrows || []), ...(extraArrows || [])].forEach((arrow) => {
    merged.set(arrowKey(arrow), arrow);
  });
  return [...merged.values()];
}

function buildManualArrowsByTreeConnections(healerSlug, trees, nodes, metaByNodeId) {
  const config = talentConnections[healerSlug];
  if (!config) {
    return [];
  }

  const treeById = new Map();
  trees.forEach((tree) => {
    treeById.set(tree.id, tree);
  });

  const layoutNodeByMetaId = buildLayoutNodeByMetaId(nodes, metaByNodeId);
  const dedupe = new Set();
  const arrows = [];

  ["class", "spec", "hero"].forEach((treeId) => {
    const tree = treeById.get(treeId);
    const edges = config?.[treeId];
    if (!tree || !edges || typeof edges !== "object") {
      return;
    }

    Object.entries(edges).forEach(([fromKey, toKeys]) => {
      if (!Array.isArray(toKeys) || !toKeys.length) {
        return;
      }

      const fromMeta = findTreeNodeByRowCol(tree, fromKey);
      if (!fromMeta) {
        return;
      }

      const fromLayoutNode = layoutNodeByMetaId.get(fromMeta.id);
      if (!fromLayoutNode) {
        return;
      }

      toKeys.forEach((toKey) => {
        const toMeta = findTreeNodeByRowCol(tree, toKey);
        if (!toMeta) {
          return;
        }
        const toLayoutNode = layoutNodeByMetaId.get(toMeta.id);
        if (!toLayoutNode) {
          return;
        }

        const edgeKey = `${fromMeta.id}->${toMeta.id}`;
        if (dedupe.has(edgeKey)) {
          return;
        }
        dedupe.add(edgeKey);
        arrows.push(buildArrowBetween(fromLayoutNode, toLayoutNode));
      });
    });
  });

  return arrows;
}

function sortedUnique(values) {
  return [...new Set(values)].sort((a, b) => a - b);
}

function clusterNumbers(values, tolerance = 4) {
  const sorted = sortedUnique(values);
  if (!sorted.length) {
    return [];
  }

  const clusters = [[sorted[0]]];
  for (let index = 1; index < sorted.length; index += 1) {
    const value = sorted[index];
    const lastCluster = clusters[clusters.length - 1];
    const lastValue = lastCluster[lastCluster.length - 1];
    if (value - lastValue <= tolerance) {
      lastCluster.push(value);
    } else {
      clusters.push([value]);
    }
  }

  return clusters.map((cluster) => cluster.reduce((sum, value) => sum + value, 0) / cluster.length);
}

function nearestIndex(values, target) {
  if (!values.length) {
    return -1;
  }

  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  values.forEach((value, index) => {
    const distance = Math.abs(value - target);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function quantile(sortedValues, q) {
  if (!sortedValues.length) {
    return 0;
  }
  if (sortedValues.length === 1) {
    return sortedValues[0];
  }
  const pos = (sortedValues.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sortedValues[Math.min(base + 1, sortedValues.length - 1)];
  return sortedValues[base] + rest * (next - sortedValues[base]);
}

function buildLaneBoundaries(nodes) {
  const xs = sortedUnique(nodes.map((node) => node.x));
  if (xs.length < 4) {
    const center = xs[Math.floor(xs.length / 2)] ?? 0;
    return {
      leftSplit: center - 100,
      rightSplit: center + 100
    };
  }

  let laneXs = xs;
  if (xs.length >= 8) {
    const low = quantile(xs, 0.05);
    const high = quantile(xs, 0.95);
    const trimmed = xs.filter((value) => value >= low && value <= high);
    if (trimmed.length >= 4) {
      laneXs = trimmed;
    }
  }

  const gaps = [];
  for (let index = 0; index < laneXs.length - 1; index += 1) {
    gaps.push({ index, gap: laneXs[index + 1] - laneXs[index] });
  }

  const sortedByGap = [...gaps].sort((a, b) => b.gap - a.gap);
  const firstGap = sortedByGap[0];
  let secondGap = sortedByGap.find((item) => item.index !== firstGap.index && Math.abs(item.index - firstGap.index) > 1);
  if (!secondGap) {
    secondGap = sortedByGap[1];
  }
  if (!firstGap || !secondGap) {
    const center = xs[Math.floor(xs.length / 2)] ?? 0;
    return {
      leftSplit: center - 100,
      rightSplit: center + 100
    };
  }

  const [leftGap, rightGap] = [firstGap, secondGap].sort((a, b) => a.index - b.index);
  return {
    leftSplit: (laneXs[leftGap.index] + laneXs[leftGap.index + 1]) / 2,
    rightSplit: (laneXs[rightGap.index] + laneXs[rightGap.index + 1]) / 2
  };
}

function getLaneForX(x, laneBoundaries) {
  if (x <= laneBoundaries.leftSplit) {
    return "class";
  }
  if (x >= laneBoundaries.rightSplit) {
    return "spec";
  }
  return "hero";
}

function groupNodesByLane(nodes, laneBoundaries) {
  return nodes.reduce(
    (acc, node) => {
      const lane = getLaneForX(node.x, laneBoundaries);
      acc[lane].push(node);
      return acc;
    },
    { class: [], spec: [], hero: [] }
  );
}

function mapGridLaneToTree(nodes, tree) {
  const byNodeId = {};
  const usedMetaIds = new Set();
  if (!nodes.length || !tree?.nodes?.length) {
    return { byNodeId, usedMetaIds };
  }

  const treeByRowCol = toNodeMap(tree);
  const xValues = sortedUnique(nodes.map((node) => node.x));
  const yValues = sortedUnique(nodes.map((node) => node.y));

  nodes.forEach((node) => {
    const row = nearestIndex(yValues, node.y);
    const col = nearestIndex(xValues, node.x);
    const meta = treeByRowCol.get(`${row},${col}`);
    if (meta) {
      byNodeId[node.id] = meta;
      usedMetaIds.add(meta.id);
    }
  });

  return { byNodeId, usedMetaIds };
}

function mapHeroLaneToTree(nodes, tree) {
  const byNodeId = {};
  const usedNodeIds = new Set();
  if (!nodes.length || !tree?.nodes?.length) {
    return { byNodeId, usedNodeIds };
  }

  const yClusters = clusterNumbers(nodes.map((node) => node.y), 5);
  if (yClusters.length < 5) {
    return { byNodeId, usedNodeIds };
  }
  const heroRowsY = yClusters.slice(0, 5);
  const rowTolerance = 24;
  const layoutRowMap = new Map();
  nodes.forEach((node) => {
    const row = nearestIndex(heroRowsY, node.y);
    if (row < 0 || row > 4) {
      return;
    }
    if (Math.abs(heroRowsY[row] - node.y) > rowTolerance) {
      return;
    }
    if (!layoutRowMap.has(row)) {
      layoutRowMap.set(row, []);
    }
    layoutRowMap.get(row).push(node);
  });

  const treeRowMap = new Map();
  tree.nodes.forEach((node) => {
    if (!treeRowMap.has(node.row)) {
      treeRowMap.set(node.row, []);
    }
    treeRowMap.get(node.row).push(node);
  });

  [...treeRowMap.entries()].forEach(([row, treeRowNodes]) => {
    const layoutRowNodes = [...(layoutRowMap.get(row) || [])].sort((a, b) => a.x - b.x);
    if (!layoutRowNodes.length) {
      return;
    }

    const sortedTreeRowNodes = [...treeRowNodes].sort((a, b) => a.col - b.col);
    const count = Math.min(layoutRowNodes.length, sortedTreeRowNodes.length);
    for (let index = 0; index < count; index += 1) {
      const layoutNode = layoutRowNodes[index];
      const treeNode = sortedTreeRowNodes[index];
      byNodeId[layoutNode.id] = treeNode;
      usedNodeIds.add(layoutNode.id);
    }
  });

  return { byNodeId, usedNodeIds };
}

function sortLayoutNodesForFallback(nodes) {
  return [...nodes].sort((a, b) => a.y - b.y || a.x - b.x);
}

function sortTreeNodesForFallback(nodes) {
  return [...nodes].sort((a, b) => a.row - b.row || a.col - b.col);
}

function fillUnmappedLaneNodes(result, laneNodes, treeNodes) {
  if (!laneNodes?.length || !treeNodes?.length) {
    return;
  }

  const unmappedLayoutNodes = sortLayoutNodesForFallback(laneNodes.filter((node) => !result[node.id]));
  if (!unmappedLayoutNodes.length) {
    return;
  }

  const usedMetaIds = new Set(
    laneNodes.map((node) => result[node.id]?.id).filter((value) => typeof value === "string" && value.length)
  );
  const remainingTreeNodes = sortTreeNodesForFallback(treeNodes.filter((node) => !usedMetaIds.has(node.id)));
  const count = Math.min(unmappedLayoutNodes.length, remainingTreeNodes.length);
  for (let index = 0; index < count; index += 1) {
    result[unmappedLayoutNodes[index].id] = remainingTreeNodes[index];
  }
}

function filterOutlierNodes(nodes) {
  if (!nodes?.length || nodes.length < 12) {
    return nodes;
  }

  const xs = [...nodes.map((node) => node.x)].sort((a, b) => a - b);
  const ys = [...nodes.map((node) => node.y)].sort((a, b) => a - b);
  const lowX = quantile(xs, 0.05) - 24;
  const highX = quantile(xs, 0.95) + 24;
  const lowY = quantile(ys, 0.05) - 24;
  const highY = quantile(ys, 0.95) + 24;

  const filtered = nodes.filter((node) => node.x >= lowX && node.x <= highX && node.y >= lowY && node.y <= highY);
  if (filtered.length < nodes.length - 3) {
    return nodes;
  }
  return filtered;
}

function buildMetaByNodeId(nodes, trees) {
  const result = {};
  if (!nodes?.length) {
    return result;
  }

  const laneNodes = filterOutlierNodes(nodes);
  const classTree = trees?.find((tree) => tree.id === "class");
  const specTree = trees?.find((tree) => tree.id === "spec");
  const heroTree = trees?.find((tree) => tree.id === "hero");
  const laneBoundaries = buildLaneBoundaries(laneNodes);
  const lanes = groupNodesByLane(laneNodes, laneBoundaries);

  const classMapped = mapGridLaneToTree(lanes.class, classTree);
  Object.assign(result, classMapped.byNodeId);

  const specMapped = mapGridLaneToTree(lanes.spec, specTree);
  Object.assign(result, specMapped.byNodeId);

  const heroMapped = mapHeroLaneToTree(lanes.hero, heroTree);
  Object.assign(result, heroMapped.byNodeId);

  fillUnmappedLaneNodes(result, lanes.class, classTree?.nodes || []);
  fillUnmappedLaneNodes(result, lanes.spec, specTree?.nodes || []);
  fillUnmappedLaneNodes(result, lanes.hero, heroTree?.nodes || []);

  const remainingHeroNodes = lanes.hero.filter((node) => !heroMapped.usedNodeIds.has(node.id));
  if (remainingHeroNodes.length && specTree?.nodes?.length) {
    const specNodeIdSet = new Set(specTree.nodes.map((node) => node.id));
    const usedSpecIds = new Set(
      Object.values(result)
        .filter((node) => node && specNodeIdSet.has(node.id))
        .map((node) => node.id)
    );
    const unmatchedSpecNodes = specTree.nodes.filter((node) => !usedSpecIds.has(node.id)).sort((a, b) => a.row - b.row || a.col - b.col);

    const sortedRemainingNodes = [...remainingHeroNodes].sort((a, b) => a.y - b.y || a.x - b.x);
    const count = Math.min(sortedRemainingNodes.length, unmatchedSpecNodes.length);
    for (let index = 0; index < count; index += 1) {
      result[sortedRemainingNodes[index].id] = unmatchedSpecNodes[index];
    }
  }

  return result;
}

function parseRank(rank) {
  if (typeof rank !== "string") {
    return null;
  }
  const matched = rank.match(/(\d+)\s*\/\s*(\d+)/);
  if (!matched) {
    return null;
  }
  return {
    current: Number(matched[1]),
    max: Number(matched[2])
  };
}

function resolveOverride(overrideMap, nodeId, metaId) {
  if (!overrideMap) {
    return null;
  }
  if (overrideMap[nodeId]) {
    return overrideMap[nodeId];
  }
  if (metaId && overrideMap[metaId]) {
    return overrideMap[metaId];
  }
  return null;
}

function buildNodeStateByNodeId(nodes, metaByNodeId, nodeOverrides) {
  const map = {};

  nodes.forEach((node) => {
    const meta = metaByNodeId[node.id];
    const override = resolveOverride(nodeOverrides, node.id, meta?.id);

    const rankParsed = parseRank(meta?.rank);
    let current = rankParsed ? rankParsed.current : node.points ? Number(node.points) || 0 : 0;
    let max = rankParsed ? rankParsed.max : current > 1 ? current : 1;
    let selected = rankParsed ? rankParsed.current > 0 : Boolean(meta?.selected ?? node.selected);

    if (override) {
      if (typeof override.rank === "string") {
        const customRank = parseRank(override.rank);
        if (customRank) {
          current = customRank.current;
          max = customRank.max;
          selected = customRank.current > 0;
        }
      } else if (typeof override.rank === "number" && Number.isFinite(override.rank)) {
        current = Math.max(0, Math.floor(override.rank));
        max = Math.max(max, current, 1);
        selected = current > 0;
      }

      if (typeof override.selected === "boolean") {
        selected = override.selected;
        if (!selected && !("rank" in override)) {
          current = 0;
        }
        if (selected && !("rank" in override) && current === 0) {
          current = 1;
          max = Math.max(max, 1);
        }
      }
    }

    if (current <= 0) {
      selected = false;
    }

    map[node.id] = {
      selected,
      rank: `${Math.max(0, current)}/${Math.max(1, max)}`
    };
  });

  return map;
}

function pointBadgeValue(rankText) {
  const parsedRank = parseRank(rankText);
  if (parsedRank) {
    if (parsedRank.current <= 0) {
      return "";
    }
    if (parsedRank.max === 1 && parsedRank.current === 1) {
      return "";
    }
    return String(parsedRank.current);
  }
  return "";
}

function buildChoiceDataByNodeId(nodes, metaByNodeId, variantChoiceOverrides, choiceOverlay) {
  const byNodeId = {};
  const choiceByMetaId = choiceOverlay?.mwChoiceByMwId || choiceOverlay?.choiceByMetaId || {};
  const mergedChoiceOverrides = {
    ...talentChoiceOverrides,
    ...(variantChoiceOverrides || {})
  };

  nodes.forEach((node) => {
    if (node.shape !== "choice") {
      return;
    }

    const meta = metaByNodeId[node.id];
    const metaChoice = meta?.id ? choiceByMetaId[meta.id] : null;
    if (!metaChoice) {
      return;
    }

    const selectedFromMeta = metaChoice?.selectedIndex;
    const options = [0, 1].map((index) => {
      const metaOption = metaChoice?.options?.[index];
      const href = metaOption?.href && metaOption.href !== "javascript:" ? metaOption.href : "";
      return {
        href,
        name: metaOption?.name || `선택 ${index + 1}`,
        icon: metaOption?.icon || meta?.icon || "",
        selected:
          selectedFromMeta === 0 || selectedFromMeta === 1
            ? selectedFromMeta === index
            : index === 0
      };
    });

    const built = {
      options,
      hasSelectableOptions: options.some((option) => option.href)
    };

    const metaKey = meta?.id;
    const override = resolveOverride(mergedChoiceOverrides, node.id, metaKey);
    if (override?.spellIds?.length === 2) {
      const overrideSelected = Number.isInteger(override.selectedIndex) ? override.selectedIndex : built.options.findIndex((item) => item.selected);
      built.options = built.options.map((item, index) => {
        const spellId = override.spellIds[index];
        const customName = override.names?.[index];
        const customIcon = override.icons?.[index];
        return {
          href: `https://www.wowhead.com/ko/spell=${spellId}`,
          name: customName || `spell ${spellId}`,
          icon: customIcon || item.icon,
          selected: overrideSelected === index
        };
      });
      built.hasSelectableOptions = true;
    } else if (Number.isInteger(override?.selectedIndex)) {
      built.options = built.options.map((item, index) => ({
        ...item,
        selected: index === override.selectedIndex
      }));
    }

    byNodeId[node.id] = built;
  });
  return byNodeId;
}

function buildMobileGroups(layout, heroNode, arrowsSource) {
  const baseNodes = layout.nodes || [];
  if (!baseNodes.length) {
    return [];
  }
  const sourceArrows = arrowsSource || layout.arrows || [];

  const laneBoundaries = buildLaneBoundaries(baseNodes);
  const nodesByLane = groupNodesByLane(baseNodes, laneBoundaries);

  return MOBILE_GROUP_TEMPLATES.map((template) => {
    const laneNodes = nodesByLane[template.id] || [];
    const areaNodes = template.id === "hero" && heroNode ? [heroNode, ...laneNodes] : laneNodes;
    const xValues = areaNodes.map((node) => node.x);
    const yValues = areaNodes.map((node) => node.y);

    const rawMinX = xValues.length ? Math.min(...xValues) : 0;
    const rawMaxX = xValues.length ? Math.max(...xValues) : 1;
    const rawMinY = yValues.length ? Math.min(...yValues) : 0;
    const rawMaxY = yValues.length ? Math.max(...yValues) : 1;

    const xMin = rawMinX - template.padX;
    const xMax = rawMaxX + template.padX;
    const yMin = rawMinY - template.padY;
    const yMax = rawMaxY + template.padY;

    const refWidth = Math.max(template.minWidth, xMax - xMin);
    const refHeight = Math.max(template.minHeight, yMax - yMin);

    const nodes = laneNodes.map((node) => ({
      ...node,
      x: node.x - xMin,
      y: node.y - yMin
    }));

    const arrows = sourceArrows
      .filter((arrow) => {
        const endX = arrow.x + Math.cos(arrow.r) * arrow.w;
        const endY = arrow.y + Math.sin(arrow.r) * arrow.w;
        return getLaneForX(arrow.x, laneBoundaries) === template.id && getLaneForX(endX, laneBoundaries) === template.id;
      })
      .map((arrow) => ({
        ...arrow,
        x: arrow.x - xMin,
        y: arrow.y - yMin
      }));

    const heroNodeLocal =
      template.id === "hero" && heroNode
        ? {
          ...heroNode,
          x: heroNode.x - xMin,
          y: heroNode.y - yMin
        }
        : null;

    return {
      ...template,
      refWidth,
      refHeight,
      nodes,
      arrows,
      heroNode: heroNodeLocal
    };
  });
}

function NodeIcons({ primaryIcon, secondaryIcon, shape, isSelected }) {
  const clip = shapeStyle(shape);
  const containerClass = `mxt-node-icon-wrap absolute inset-[1px] block overflow-hidden ${innerShapeClass(shape)}`;
  const iconToneClass = isSelected ? "" : "grayscale saturate-0 brightness-[0.72]";

  if (primaryIcon && secondaryIcon) {
    return (
      <span className={containerClass} style={clip}>
        <img
          alt=""
          className={`absolute inset-y-0 left-0 block h-full w-1/2 object-cover ${iconToneClass}`}
          draggable={false}
          src={primaryIcon}
        />
        <img
          alt=""
          className={`absolute inset-y-0 right-0 block h-full w-1/2 object-cover ${iconToneClass}`}
          draggable={false}
          src={secondaryIcon}
        />
        <span className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-black/70" />
      </span>
    );
  }

  if (!primaryIcon) {
    return <span className={containerClass} style={clip} />;
  }

  return (
    <span className={containerClass} style={clip}>
      <img
        alt=""
        className={`block h-full w-full object-cover ${innerShapeClass(shape)} ${iconToneClass}`}
        draggable={false}
        src={primaryIcon}
      />
    </span>
  );
}

function NodeTooltipOverlay({ tooltip }) {
  if (!tooltip?.title && !tooltip?.body && !tooltip?.subtitle) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-[65] hidden w-[240px] -translate-y-1/2 rounded-xl border border-[#52617a] bg-[#070f1f]/96 p-2.5 text-left text-[11px] text-slate-200 shadow-[0_14px_30px_rgba(0,0,0,0.56)] opacity-0 transition-opacity duration-150 group-hover:block group-hover:opacity-100 group-focus-within:block group-focus-within:opacity-100 xl:block">
      {tooltip.title ? <p className="text-[12px] font-semibold text-[#9fffd9]">{tooltip.title}</p> : null}
      {tooltip.subtitle ? <p className="mt-0.5 text-[10px] text-slate-300/90">{tooltip.subtitle}</p> : null}
      {tooltip.body ? <p className="mt-1 whitespace-pre-line leading-relaxed text-slate-200/95">{tooltip.body}</p> : null}
    </div>
  );
}

function ChoicePopout({ choiceData, isNodeSelected, popAbove }) {
  if (!choiceData?.hasSelectableOptions) {
    return null;
  }

  const posClass = popAbove
    ? "bottom-[112%]"
    : "top-[112%]";

  return (
    <div className={`mxt-choice-popout pointer-events-none absolute left-1/2 ${posClass} z-50 flex min-w-[96px] -translate-x-1/2 gap-1 rounded-xl border border-[#5e6b81] bg-[#081327]/95 p-1.5 opacity-0 shadow-[0_10px_26px_rgba(0,0,0,0.55)] transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100`}>
      {choiceData.options.map((option, index) => {
        const Tag = option.href ? "a" : "div";
        return (
          <Tag
            className={`mxt-choice-option relative block h-9 w-9 overflow-hidden rounded-md border ${option.selected
              ? "border-[#d3b345] shadow-[0_0_12px_rgba(209,177,67,0.34)]"
              : "border-[#5f6a7d] opacity-75 grayscale"
              }`}
            href={option.href || undefined}
            key={`${option.name}-${index}`}
            rel={option.href ? "noreferrer" : undefined}
            target={option.href ? "_blank" : undefined}
            tabIndex={option.href ? 0 : -1}
            title={option.name}
          >
            <img
              alt=""
              className={`h-full w-full object-cover ${isNodeSelected ? "" : "grayscale saturate-0 brightness-[0.72]"}`}
              draggable={false}
              src={option.icon}
            />
          </Tag>
        );
      })}
    </div>
  );
}

function nodeClassBySelected(selected) {
  if (!selected) {
    return "border-[#5c6476] bg-[#121925]/95";
  }
  return nodeToneClass();
}

function Node({ node, layout, meta, nodeSize, choiceData, state, customTooltip }) {
  const rawHref = meta?.href || (meta?.spellId ? `https://www.wowhead.com/ko/spell=${meta.spellId}` : "");
  const href = customTooltip?.href || rawHref;
  const tooltipText = customTooltip ? "" : meta?.name ?? `Talent ${node.id}`;
  const disableWowhead = Boolean(customTooltip?.disableWowhead);
  const Wrapper = href && !disableWowhead ? "a" : href ? "button" : "div";
  const badge = pointBadgeValue(state?.rank);
  const selectedChoice = choiceData?.options?.find((option) => option.selected);
  const hasChoiceSelection = Boolean(selectedChoice);
  const isSelected = node.shape === "choice"
    ? Boolean(state?.selected && hasChoiceSelection)
    : Boolean(state?.selected);
  const fallbackPrimaryChoice = choiceData?.options?.[0];
  const primaryIcon = selectedChoice?.icon || fallbackPrimaryChoice?.icon || meta?.icon || "";
  const secondaryIcon =
    node.multiple && choiceData?.options?.length >= 2 && !hasChoiceSelection
      ? choiceData.options[1]?.icon || ""
      : "";
  const wrapperProps =
    Wrapper === "a"
      ? {
        href,
        rel: "noreferrer",
        target: "_blank"
      }
      : Wrapper === "button"
        ? {
          type: "button",
          onClick: () => window.open(href, "_blank", "noopener,noreferrer")
        }
        : {};

  return (
    <Wrapper
      className={`mxt-node-link group absolute z-[2] -translate-x-1/2 -translate-y-1/2 overflow-visible border p-0 transition-transform duration-150 hover:z-40 hover:scale-[1.04] ${outerShapeClass(node.shape)} ${nodeClassBySelected(isSelected)}`}
      style={{
        left: toPercent(node.x, layout.refWidth - 48),
        top: toPercent(node.y, layout.refHeight),
        width: toPercent(nodeSize, layout.refWidth),
        height: toPercent(nodeSize, layout.refHeight)
      }}
      title={tooltipText}
      {...wrapperProps}
    >
      <NodeIcons isSelected={isSelected} primaryIcon={primaryIcon} secondaryIcon={secondaryIcon} shape={node.shape} />
      {badge ? (
        <span
          className="mxt-node-points absolute -bottom-[17%] -right-[17%] flex items-center justify-center rounded-full border border-[#f8f0c9]/70 bg-black/88 text-[10px] font-bold leading-none text-[#f4efdd]"
          style={{
            width: `${(POINT_BADGE_SIZE / nodeSize) * 100}%`,
            height: `${(POINT_BADGE_SIZE / nodeSize) * 100}%`
          }}
        >
          {badge}
        </span>
      ) : null}
      {node.shape === "choice" ? <ChoicePopout choiceData={choiceData} isNodeSelected={isSelected} popAbove={node.y > layout.refHeight * 0.6} /> : null}
      {customTooltip ? <NodeTooltipOverlay tooltip={customTooltip} /> : null}
    </Wrapper>
  );
}

function HeroEmblem({ heroNode, heroIcon, layout, heroName, heroSize = HERO_NODE_SIZE }) {
  if (!heroNode || !heroIcon) {
    return null;
  }

  return (
    <>
      <p
        className="pointer-events-none absolute text-center text-[12px] font-semibold text-slate-200/95"
        style={{
          left: toPercent(heroNode.x, layout.refWidth - 48),
          top: toPercent(heroNode.y - Math.max(34, heroSize * 0.96), layout.refHeight),
          transform: "translateX(-50%)"
        }}
      >
        {heroName}
      </p>
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d9be4b] bg-[#112033]/90 p-[3px] shadow-[0_0_22px_rgba(216,185,74,0.34)]"
        style={{
          left: toPercent(heroNode.x, layout.refWidth - 48),
          top: toPercent(heroNode.y, layout.refHeight),
          width: toPercent(heroSize, layout.refWidth),
          height: toPercent(heroSize, layout.refHeight)
        }}
      >
        <img alt="" className="h-full w-full rounded-full object-cover" draggable={false} src={heroIcon} />
      </div>
    </>
  );
}

function isNodeSelectedForArrow(node, nodeStateById, choiceDataByNodeId) {
  const state = nodeStateById[node.id];
  if (node.shape === "choice") {
    const choiceData = choiceDataByNodeId[node.id];
    const hasChoiceSelection = Boolean(choiceData?.options?.some((o) => o.selected));
    return Boolean(state?.selected && hasChoiceSelection);
  }
  return Boolean(state?.selected);
}

function isArrowConnectedToSelected(arrow, nodes, nodeStateById, choiceDataByNodeId) {
  const TOLERANCE = 26;
  const endX = arrow.x + Math.cos(arrow.r) * arrow.w;
  const endY = arrow.y + Math.sin(arrow.r) * arrow.w;

  let startSelected = false;
  let endSelected = false;

  for (const node of nodes) {
    const dx1 = Math.abs(node.x - arrow.x);
    const dy1 = Math.abs(node.y - arrow.y);
    if (dx1 <= TOLERANCE && dy1 <= TOLERANCE) {
      if (isNodeSelectedForArrow(node, nodeStateById, choiceDataByNodeId)) {
        startSelected = true;
      }
    }

    const dx2 = Math.abs(node.x - endX);
    const dy2 = Math.abs(node.y - endY);
    if (dx2 <= TOLERANCE && dy2 <= TOLERANCE) {
      if (isNodeSelectedForArrow(node, nodeStateById, choiceDataByNodeId)) {
        endSelected = true;
      }
    }

    if (startSelected && endSelected) return true;
  }

  return startSelected && endSelected;
}

function Arrow({ arrow, layout, active = true }) {
  const tailTrim = Math.min(4, arrow.w * 0.12);
  const width = Math.max(2, arrow.w - tailTrim);
  const shift = tailTrim * 0.5;
  const shiftedX = arrow.x + Math.cos(arrow.r) * shift;
  const shiftedY = arrow.y + Math.sin(arrow.r) * shift;

  return (
    <span
      className="absolute z-[1] h-[2px] origin-left rounded-full"
      style={{
        left: toPercent(shiftedX, layout.refWidth - 48),
        top: toPercent(shiftedY, layout.refHeight),
        width: toPercent(width, layout.refWidth),
        transform: `translateY(-50%) rotate(${arrow.r}rad)`,
        backgroundColor: active ? "rgba(217, 190, 75, 0.9)" : "rgba(92, 100, 118, 0.5)",
        boxShadow: active ? "0 0 6px rgba(217, 190, 75, 0.35)" : "none"
      }}
    />
  );
}

export function TalentTreeView({ healerSlug, layout, trees, choiceOverlay }) {
  const variantConfig = talentBuildVariants[healerSlug];
  const tooltipOverrideMap = talentNodeTooltips[healerSlug] || {};
  const variants = useMemo(
    () =>
      variantConfig?.variants?.length
        ? variantConfig.variants
        : [{ id: "default", label: "기본", nodeOverrides: {}, choiceOverrides: {} }],
    [variantConfig]
  );
  const defaultVariantId = variantConfig?.defaultVariantId || variants[0].id;
  const heroNode = layout.nodes.find((node) => node.isHeroNode);
  const [activeVariantId, setActiveVariantId] = useState(defaultVariantId);
  const nodes = useMemo(
    () => (heroNode ? layout.nodes.filter((node) => node.id !== heroNode.id) : layout.nodes),
    [heroNode, layout.nodes]
  );
  const activeVariant = useMemo(
    () => variants.find((item) => item.id === activeVariantId) || variants[0],
    [activeVariantId, variants]
  );
  const metaByNodeId = useMemo(() => buildMetaByNodeId(nodes, trees), [nodes, trees]);
  const visibleNodes = useMemo(() => nodes.filter((node) => Boolean(metaByNodeId[node.id])), [metaByNodeId, nodes]);
  const nodeStateById = useMemo(
    () => buildNodeStateByNodeId(visibleNodes, metaByNodeId, activeVariant?.nodeOverrides),
    [activeVariant?.nodeOverrides, metaByNodeId, visibleNodes]
  );
  const choiceDataByNodeId = useMemo(
    () => buildChoiceDataByNodeId(visibleNodes, metaByNodeId, activeVariant?.choiceOverrides, choiceOverlay),
    [activeVariant?.choiceOverrides, choiceOverlay, metaByNodeId, visibleNodes]
  );
  const customTooltipByNodeId = useMemo(() => {
    const byNodeId = {};
    visibleNodes.forEach((node) => {
      const meta = metaByNodeId[node.id];
      const tooltip = resolveOverride(tooltipOverrideMap, node.id, meta?.id);
      if (tooltip?.enabled) {
        byNodeId[node.id] = tooltip;
      }
    });
    return byNodeId;
  }, [metaByNodeId, tooltipOverrideMap, visibleNodes]);
  const heroIcon = useMemo(() => {
    const overrideHeroIcon = HERO_EMBLEM_ICON_OVERRIDES[healerSlug];
    if (overrideHeroIcon) {
      return overrideHeroIcon;
    }
    const heroTree = trees?.find((tree) => tree.id === "hero");
    if (!heroTree?.nodes?.length) {
      return "";
    }
    const topRow = Math.min(...heroTree.nodes.map((node) => node.row));
    const topRowNodes = heroTree.nodes.filter((node) => node.row === topRow);
    const selectedTop = topRowNodes.find((node) => node.selected) || topRowNodes[0];
    return selectedTop?.icon || heroTree.nodes.find((node) => node.selected)?.icon || heroTree.nodes[0]?.icon || "";
  }, [healerSlug, trees]);
  const layoutForMobile = useMemo(() => ({ ...layout, nodes: visibleNodes }), [layout, visibleNodes]);
  const manualArrows = useMemo(
    () => buildManualArrowsByTreeConnections(healerSlug, trees, visibleNodes, metaByNodeId),
    [healerSlug, metaByNodeId, trees, visibleNodes]
  );
  const renderArrows = useMemo(() => mergeArrows(layout.arrows, manualArrows), [layout.arrows, manualArrows]);
  const mobileGroups = useMemo(() => buildMobileGroups(layoutForMobile, heroNode, renderArrows), [heroNode, layoutForMobile, renderArrows]);

  useEffect(() => {
    refreshWowheadTooltips();
  }, [activeVariantId, metaByNodeId]);

  useEffect(() => {
    setActiveVariantId(defaultVariantId);
  }, [defaultVariantId, healerSlug]);

  return (
    <section className="mt-7 overflow-hidden rounded-[18px] border border-[#2d374a] bg-[#050b17]">
      <div className="relative border-b border-[#3f485a] px-3 py-2.5 md:px-4">
        <div
          className="pointer-events-none absolute inset-0"
        />
        <div className="relative py-0.5">
          <p
            className="text-[16px]"
            style={{ color: headerTextColor(layout.leftHeader.titleColor, "#00ff98") }}
          >
            {layout.leftHeader.title}
          </p>
        </div>

        {variants.length > 1 ? (
          <div className="relative mt-2 flex flex-wrap gap-1.5">
            {variants.map((variant) => (
              <button
                className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold transition ${activeVariant.id === variant.id
                  ? "border-violet-300/70 bg-violet-300/16 text-violet-100"
                  : "border-slate-600 bg-slate-900/65 text-slate-300 hover:border-slate-500 hover:text-slate-100"
                  }`}
                key={variant.id}
                onClick={() => setActiveVariantId(variant.id)}
                type="button"
              >
                {variant.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="px-1 pb-2 pt-2 md:px-1 md:pb-2">
        <div className="hidden md:block">
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: `${layout.refWidth} / ${layout.refHeight}` }}
          >
            <HeroEmblem heroIcon={heroIcon} heroName={layout.heroName} heroNode={heroNode} layout={layout} />

            <div className="absolute inset-0">
              {renderArrows.map((arrow, index) => {
                const isArrowActive = isArrowConnectedToSelected(arrow, visibleNodes, nodeStateById, choiceDataByNodeId);
                return <Arrow active={isArrowActive} arrow={arrow} key={`arrow-${index}`} layout={{ ...layout, nodeSize: MAIN_NODE_SIZE }} />;
              })}
              {visibleNodes.map((node) => (
                <Node
                  choiceData={choiceDataByNodeId[node.id]}
                  key={node.id}
                  layout={layout}
                  meta={metaByNodeId[node.id]}
                  node={node}
                  state={nodeStateById[node.id]}
                  nodeSize={MAIN_NODE_SIZE}
                  customTooltip={customTooltipByNodeId[node.id]}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 md:hidden">
          {mobileGroups.map((group) => {
            const groupLayout = { refWidth: group.refWidth, refHeight: group.refHeight, nodeSize: group.nodeSize };

            return (
              <div className="overflow-hidden rounded-[12px] border border-[#394556] bg-[#071022]" key={group.id}>
                <div className="border-b border-[#334155] bg-[#0b162b]/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-100/90">
                  {group.label}
                </div>
                <div
                  className="relative w-full overflow-hidden"
                  style={{ aspectRatio: `${group.refWidth} / ${group.refHeight}` }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(5,10,22,0.64), rgba(4,9,18,0.74)), url(${layout.background})`
                    }}
                  />
                  <div className="absolute inset-0">
                    {group.arrows.map((arrow, index) => {
                      const isArrowActive = isArrowConnectedToSelected(arrow, group.nodes, nodeStateById, choiceDataByNodeId);
                      return <Arrow active={isArrowActive} arrow={arrow} key={`${group.id}-arrow-${index}`} layout={groupLayout} />;
                    })}
                    {group.nodes.map((node) => (
                      <Node
                        choiceData={choiceDataByNodeId[node.id]}
                        key={node.id}
                        layout={groupLayout}
                        meta={metaByNodeId[node.id]}
                        node={node}
                        state={nodeStateById[node.id]}
                        nodeSize={group.nodeSize}
                        customTooltip={customTooltipByNodeId[node.id]}
                      />
                    ))}
                  </div>
                  {group.id === "hero" ? (
                    <HeroEmblem
                      heroIcon={heroIcon}
                      heroName={layout.heroName}
                      heroNode={group.heroNode}
                      heroSize={group.heroSize}
                      layout={groupLayout}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* {layout.exportText ? (
          <div className="mt-2 flex justify-center">
            <button
              className="rounded-md border border-[#657085] bg-[#141d2d]/95 px-3 py-1.5 text-[12px] font-medium text-slate-100 transition hover:border-[#8da3c8] hover:bg-[#1a2539]"
              type="button"
            >
              {layout.exportText}
            </button>
          </div>
        ) : null} */}
      </div>
    </section>
  );
}

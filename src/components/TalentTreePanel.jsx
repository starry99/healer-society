import { useEffect, useMemo, useState } from "react";
import { TalentTreeView } from "./TalentTreeView";

function refreshWowheadTooltips() {
  if (window?.WH?.Tooltips?.refreshLinks) {
    window.WH.Tooltips.refreshLinks();
    return;
  }
  if (window?.$WowheadPower?.refreshLinks) {
    window.$WowheadPower.refreshLinks();
  }
}

function getNodePosition(node, columns, rows) {
  return {
    x: ((node.col + 0.5) / columns) * 100,
    y: ((node.row + 0.5) / rows) * 100
  };
}

function getLineStyle(fromNode, toNode, columns, rows) {
  const from = getNodePosition(fromNode, columns, rows);
  const to = getNodePosition(toNode, columns, rows);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return {
    left: `${from.x}%`,
    top: `${from.y}%`,
    width: `${length}%`,
    transform: `translateY(-50%) rotate(${angle}deg)`
  };
}

function resolveModeTalentData(healer, mode = "raid") {
  const modeKey = mode === "mythic" ? "mythic" : "raid";
  const modeData = healer?.talentByMode?.[modeKey] || null;

  return {
    layout: modeData?.talentLayout ?? modeData?.layout ?? healer?.talentLayout ?? null,
    trees: modeData?.talentTrees ?? modeData?.trees ?? healer?.talentTrees ?? [],
    choiceOverlay: modeData?.talentChoiceOverlay ?? modeData?.choiceOverlay ?? healer?.talentChoiceOverlay ?? null
  };
}

function TreeNode({ node, position, size }) {
  const className = `talent-node group absolute block -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full border transition ${node.selected
    ? "border-violet-300/80 bg-violet-300/15 text-violet-100 shadow-[0_0_24px_rgba(167,139,250,0.24)]"
    : "border-slate-600 bg-slate-900/90 text-slate-300"
    }`;

  const tooltipText = node.note ? `${node.name}: ${node.note}` : node.name;

  const nodeLink = node.href || (node.spellId ? `https://www.wowhead.com/spell=${node.spellId}` : "");
  const nodeStyle = {
    left: `${position.x}%`,
    top: `${position.y}%`,
    width: `${size}px`,
    height: `${size}px`
  };

  if (nodeLink) {
    return (
      <a
        className={className}
        data-wh-icon-size="small"
        data-wh-rename-link="false"
        href={nodeLink}
        rel="noreferrer"
        style={nodeStyle}
        target="_blank"
        title={tooltipText}
      >
        <span className="block h-full w-full rounded-full p-[3px]">
          {node.icon ? (
            <img alt="" className="h-full w-full rounded-full object-cover" src={node.icon} />
          ) : (
            <span className="flex h-full w-full items-center justify-center rounded-full bg-slate-800 text-[9px] font-semibold">
              {node.name.slice(0, 2)}
            </span>
          )}
        </span>
        <span className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border border-slate-700 bg-gray-950/95 px-1.5 py-0.5 text-[10px] font-semibold text-slate-200">
          {node.rank ?? "1/1"}
        </span>
      </a>
    );
  }

  return (
    <div className={className} style={nodeStyle} title={tooltipText}>
      <span className="block h-full w-full rounded-full p-[3px]">
        {node.icon ? (
          <img alt="" className="h-full w-full rounded-full object-cover" src={node.icon} />
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-slate-800 text-[9px] font-semibold">
            {node.name.slice(0, 2)}
          </span>
        )}
      </span>
      <span className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border border-slate-700 bg-gray-950/95 px-1.5 py-0.5 text-[10px] font-semibold text-slate-200">
        {node.rank ?? "1/1"}
      </span>
    </div>
  );
}

export function TalentTreePanel({ healer, mode = "raid" }) {
  const resolvedModeTalentData = useMemo(() => resolveModeTalentData(healer, mode), [healer, mode]);

  if (resolvedModeTalentData.layout) {
    return (
      <TalentTreeView
        choiceOverlay={resolvedModeTalentData.choiceOverlay}
        healerSlug={healer.slug}
        key={`${healer.slug}-${mode}`}
        layout={resolvedModeTalentData.layout}
        mode={mode}
        trees={resolvedModeTalentData.trees}
      />
    );
  }

  const trees = resolvedModeTalentData.trees ?? [];
  const [activeTreeId, setActiveTreeId] = useState(trees[0]?.id ?? "");

  useEffect(() => {
    setActiveTreeId(trees[0]?.id ?? "");
  }, [healer.slug, mode, trees]);

  const tree = trees.find((item) => item.id === activeTreeId) ?? trees[0];

  useEffect(() => {
    if (!tree) {
      return;
    }
    refreshWowheadTooltips();
  }, [tree]);

  const nodeMap = useMemo(() => {
    const map = new Map();
    if (!tree) {
      return map;
    }
    tree.nodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [tree]);

  if (!tree) {
    return null;
  }

  const panelHeight = Math.max(460, tree.rows * 70 + 80);
  const nodeSize =
    tree.columns >= 8 ? 22 : tree.columns >= 7 ? 24 : tree.columns >= 6 ? 26 : tree.columns >= 5 ? 28 : 30;

  return (
    <section className="mt-7 rounded-2xl border border-slate-700/80 bg-gray-950/35 p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-[0.06em] text-violet-100">RECOMMENDED TALENTS</h2>
          <p className="mt-1 text-xs text-slate-400">{tree.summary}</p>
        </div>
        <div className="flex items-center gap-2">
          {tree.sourceUrl ? (
            <a
              className="rounded-md border border-slate-600 px-2.5 py-1 text-[11px] text-slate-300 transition hover:border-violet-300/60 hover:text-violet-100"
              href={tree.sourceUrl}
              rel="noreferrer"
              target="_blank"
            >
              계산기 링크
            </a>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {trees.map((item) => (
          <button
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold tracking-wide transition ${item.id === tree.id
              ? "border-violet-300/70 bg-violet-300/15 text-violet-100"
              : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-slate-100"
              }`}
            key={item.id}
            onClick={() => setActiveTreeId(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <div
          className="relative mx-auto w-full overflow-hidden rounded-2xl border border-slate-700/70 bg-gray-950/65 p-6"
          style={{
            height: `${panelHeight}px`,
            backgroundImage:
              "radial-gradient(circle at 15% 0%, rgba(167,139,250,0.13), transparent 38%), linear-gradient(rgba(71,85,105,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(71,85,105,0.16) 1px, transparent 1px)",
            backgroundSize: `100% 100%, ${100 / Math.max(tree.rows, 1)}% ${100 / Math.max(tree.rows, 1)}%, ${100 / Math.max(tree.columns, 1)}% ${100 / Math.max(tree.columns, 1)}%`
          }}
        >
          {tree.edges.map((edge) => {
            const fromNode = nodeMap.get(edge.from);
            const toNode = nodeMap.get(edge.to);
            if (!fromNode || !toNode) {
              return null;
            }

            return (
              <span
                className={`absolute h-[2px] origin-left rounded-full ${toNode.selected ? "bg-violet-300/55" : "bg-slate-600/70"
                  }`}
                key={`${edge.from}-${edge.to}`}
                style={getLineStyle(fromNode, toNode, tree.columns, tree.rows)}
              />
            );
          })}

          {tree.nodes.map((node) => {
            const position = getNodePosition(node, tree.columns, tree.rows);
            return <TreeNode key={node.id} node={node} position={position} size={nodeSize} />;
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-violet-300/80" />
          추천 선택
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-slate-500/90" />
          대안/비선택
        </span>
      </div>
    </section>
  );
}

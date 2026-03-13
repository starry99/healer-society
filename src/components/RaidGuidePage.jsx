import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { CommentsPanel } from "./CommentsPanel";
import { GuideRichText } from "./GuideRichText";
import { NavBar } from "./NavBar";
import { SiteFooter } from "./SiteFooter";
import { TalentTreePanel } from "./TalentTreePanel";
import Dither from "./Dither";
import { GUIDE_MODES } from "../guide/sectionLayout";
import { useAuthSession } from "../hooks/useAuthSession";
import { useSectionDiscussion } from "../hooks/useSectionDiscussion";
import { formatChangelogDate, parseKSTDateString } from "../utils/dateUtils";

function scrollToSection(sectionId) {
  const target = document.getElementById(sectionId);
  if (!target) {
    return;
  }
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

const DEFAULT_SITE_ACCENT_HEX = "#aa97ff";

function getSiteAccentFallbackHex() {
  if (typeof window === "undefined") {
    return DEFAULT_SITE_ACCENT_HEX;
  }
  const cssValue = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue("--accent-fallback")
    .trim();
  return normalizeHexColor(cssValue, DEFAULT_SITE_ACCENT_HEX);
}

function normalizeHexColor(value, fallback = "#f3d25b") {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  const shortMatched = trimmed.match(/^#([0-9a-fA-F]{3})$/);
  if (shortMatched) {
    const [r, g, b] = shortMatched[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  const longMatched = trimmed.match(/^#([0-9a-fA-F]{6})$/);
  if (longMatched) {
    return `#${longMatched[1].toLowerCase()}`;
  }
  return fallback;
}

function hexToRgb(hexColor) {
  const hex = normalizeHexColor(hexColor);
  const normalized = hex.slice(1);
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return { red, green, blue };
}

function toRgba(hexColor, alpha = 1) {
  const { red, green, blue } = hexToRgb(hexColor);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function resolveStatAccent(value, fallback = "#f3d25b") {
  return normalizeHexColor(value, fallback);
}

function normalizePriorityItems(items = []) {
  return items
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          label: item,
          note: "",
          tier: index + 1
        };
      }
      const tier = Number.isFinite(item?.tier) ? Math.max(1, Math.floor(item.tier)) : index + 1;
      return {
        label: item?.label || item?.name || `Priority ${index + 1}`,
        note: item?.note || "",
        tier
      };
    })
    .filter((item) => item.label);
}

function groupPrioritiesByTier(items = []) {
  const bucket = new Map();
  items.forEach((item) => {
    if (!bucket.has(item.tier)) {
      bucket.set(item.tier, []);
    }
    bucket.get(item.tier).push(item);
  });
  return [...bucket.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([tier, entries]) => ({
      tier,
      entries
    }));
}

function buildPriorityFlow(groups = []) {
  const flow = [];
  groups.forEach((tierGroup, tierIndex) => {
    tierGroup.entries.forEach((entry, entryIndex) => {
      flow.push({
        type: "stat",
        entry
      });
      if (entryIndex < tierGroup.entries.length - 1) {
        flow.push({
          type: "op",
          value: "="
        });
      }
    });
    if (tierIndex < groups.length - 1) {
      flow.push({
        type: "op",
        value: ">"
      });
    }
  });
  return flow;
}

async function copyTextToClipboard(value) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  if (typeof document === "undefined") {
    throw new Error("Clipboard API unavailable");
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!copied) {
    throw new Error("Legacy clipboard copy failed");
  }
}

export function RaidGuidePage({ raidMemberMap }) {
  const { slug } = useParams();
  const member = raidMemberMap[slug];
  const [activeSectionId, setActiveSectionId] = useState("");
  const [sectionModeById, setSectionModeById] = useState({});
  const [activeRotationByModeKey, setActiveRotationByModeKey] = useState({});
  const [talentsExtraOpenByKey, setTalentsExtraOpenByKey] = useState({});
  const [talentCopyFeedbackByKey, setTalentCopyFeedbackByKey] = useState({});
  const [mobileCommentsOpen, setMobileCommentsOpen] = useState(false);
  const {
    user,
    userLabel,
    internalUserId,
    profileLoading,
    isAdmin,
    loading: authLoading,
    errorMessage: authError,
    firebaseEnabled,
    appCheckConfigured,
    appCheckEnabled
  } = useAuthSession();

  const defaultSectionId = member?.sections?.[0]?.id ?? "";
  const resolvedSectionId = activeSectionId || defaultSectionId;
  const activeSection = useMemo(() => {
    if (!member) {
      return null;
    }
    return member.sections.find((section) => section.id === resolvedSectionId) ?? member.sections[0];
  }, [member, resolvedSectionId]);

  const {
    comments,
    loading: commentsLoading,
    errorMessage: discussionError,
    addComment,
    toggleVote,
    deleteComment
  } = useSectionDiscussion({
    guideSlug: member?.slug ? `raid-${member.slug}` : "",
    sectionId: activeSection?.id ?? "",
    user,
    isAdmin,
    commentAuthorName: userLabel,
    commentAuthorUserId: internalUserId
  });

  const commentReady = Boolean(user && internalUserId && !profileLoading);
  const siteAccentFallback = useMemo(() => getSiteAccentFallbackHex(), []);
  const isModeEnabledForSection = (section, modeId) => section?.modeAvailability?.[modeId]?.enabled !== false;
  const getDefaultModeForSection = (section) =>
    GUIDE_MODES.find((mode) => isModeEnabledForSection(section, mode.id))?.id || GUIDE_MODES[0]?.id || "raid";

  useEffect(() => {
    if (!member) {
      return;
    }
    setActiveSectionId(member.sections[0]?.id ?? "");
    const nextModes = {};
    member.sections.forEach((section) => {
      if (section.hasModeTabs) {
        nextModes[section.id] = getDefaultModeForSection(section);
      }
    });
    setSectionModeById(nextModes);
    setActiveRotationByModeKey({});
    setTalentsExtraOpenByKey({});
    setTalentCopyFeedbackByKey({});
  }, [member]);

  useEffect(() => {
    if (!member) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveSectionId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.2, 0.45, 0.7]
      }
    );
    member.sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });
    return () => observer.disconnect();
  }, [member]);

  useEffect(() => {
    setMobileCommentsOpen(false);
  }, [slug, resolvedSectionId]);

  if (!member || !member.enabled) {
    return <Navigate replace to="/" />;
  }

  const commentsPanelProps = {
    comments,
    currentUser: user,
    commentReady,
    errorMessage: authError || discussionError,
    firebaseEnabled,
    appCheckConfigured,
    appCheckEnabled,
    isAdmin,
    loading: authLoading || commentsLoading,
    onDeleteComment: deleteComment,
    onSubmitComment: (text) => addComment(text, null),
    onSubmitReply: (parentId, text) => addComment(text, parentId),
    onToggleVote: toggleVote,
    sectionTitle: activeSection?.title ?? "섹션",
    userLabel
  };

  const sectionMode = (section) => {
    const requestedMode = sectionModeById[section.id] || "raid";
    if (isModeEnabledForSection(section, requestedMode)) {
      return requestedMode;
    }
    return getDefaultModeForSection(section);
  };

  const setModeForSection = (sectionId, modeId) => {
    setSectionModeById((prev) => ({
      ...prev,
      [sectionId]: modeId
    }));
  };

  const handleTalentCopyClick = async (event, feedbackKey, copyString) => {
    event.stopPropagation();
    if (!copyString) {
      setTalentCopyFeedbackByKey((prev) => ({
        ...prev,
        [feedbackKey]: "empty"
      }));
      window.setTimeout(() => {
        setTalentCopyFeedbackByKey((prev) => {
          const next = { ...prev };
          delete next[feedbackKey];
          return next;
        });
      }, 1800);
      return;
    }
    try {
      await copyTextToClipboard(copyString);
      setTalentCopyFeedbackByKey((prev) => ({
        ...prev,
        [feedbackKey]: "copied"
      }));
    } catch (error) {
      setTalentCopyFeedbackByKey((prev) => ({
        ...prev,
        [feedbackKey]: "failed"
      }));
    }
    window.setTimeout(() => {
      setTalentCopyFeedbackByKey((prev) => {
        const next = { ...prev };
        delete next[feedbackKey];
        return next;
      });
    }, 1800);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-gray-950 text-slate-100">
      <div className="fixed inset-0 z-0">
        <Dither
          waveColor={[0.25, 0.15, 0.8]}
          disableAnimation={false}
          enableMouseInteraction={false}
          mouseRadius={0.35}
          colorNum={4}
          pixelSize={2}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.025}
          targetFps={24}
          dpr={0.75}
          antialias={false}
          preserveDrawingBuffer={false}
          powerPreference="low-power"
        />
      </div>
      <div className="sticky top-0 z-40 w-full flex-none pointer-events-auto">
        <NavBar />
      </div>
      <main className="relative z-10 mx-auto flex-grow w-full max-w-[1280px] px-3 py-8 md:px-5 pointer-events-none">
        <div className="grid gap-4 lg:grid-cols-[170px_minmax(0,800px)_360px] lg:items-start lg:justify-center">
          <aside className="pointer-events-auto hidden lg:sticky lg:top-20 lg:block lg:h-fit lg:rounded-2xl lg:border lg:border-slate-700/80 lg:bg-slate-900/70 lg:p-4 lg:shadow-panel">
            <h2 className="site-accent-text text-sm font-semibold uppercase">목차</h2>
            <nav className="mt-4 space-y-2">
              {member.sections.map((section, index) => (
                <button
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${activeSection?.id === section.id
                    ? "site-accent-border site-accent-bg-subtle site-accent-text"
                    : "border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500 hover:text-slate-100"
                    }`}
                  key={section.id}
                  onClick={() => {
                    setActiveSectionId(section.id);
                    scrollToSection(section.id);
                  }}
                  type="button"
                >
                  {index + 1}. {section.title}
                </button>
              ))}
            </nav>
          </aside>

          <article className="pointer-events-auto rounded-2xl border border-slate-700/80 bg-slate-900/75 p-6 shadow-panel md:p-8">
            <header className="overflow-hidden rounded-2xl border border-slate-700/80 bg-gray-950/45 p-5 md:p-6">
              <div className="flex items-center gap-4">
                {member.icon ? (
                  <img alt={`${member.name} icon`} className="h-14 w-14 rounded-xl border border-slate-700 object-cover" src={member.icon} />
                ) : null}
                <div>
                  <p className="text-xs uppercase text-slate-400">한밤 1시즌 레이드 공략</p>
                  <h1 className="mt-1 text-3xl font-bold tracking-tight" style={{ color: member.color }}>
                    {member.fullName}
                  </h1>
                </div>
              </div>
              {(() => {
                const changelogSection = member.sections.find((s) => s.type === "changelog");
                if (!changelogSection?.entries?.length) return null;
                const dates = changelogSection.entries.map((e) => parseKSTDateString(e.date).getTime()).filter((t) => !isNaN(t));
                if (!dates.length) return null;
                const latestDate = new Date(Math.max(...dates)).toISOString();
                return (
                  <p className="mt-4 text-sm text-slate-300">
                    최종 편집 날짜:{" "}
                    <button
                      type="button"
                      className="font-medium text-slate-100 hover:text-slate-300 transition"
                      onClick={() => {
                        setActiveSectionId("changelog");
                        scrollToSection("changelog");
                      }}
                    >
                      {formatChangelogDate(latestDate)}
                    </button>
                  </p>
                );
              })()}
            </header>

            <div className="mt-8 space-y-10">
              {member.sections.map((section) => {
                const currentMode = sectionMode(section);
                const rotationData = section.id === "basic-operation" ? section.rotationByMode?.[currentMode] : null;
                const rotationItems = rotationData?.items || [];
                const rotationStateKey = `${section.id}:${currentMode}`;
                const activeRotationId = activeRotationByModeKey[rotationStateKey] || "";
                const activeRotation = rotationItems.find((item) => item.id === activeRotationId) || null;
                const rotationAccent = resolveStatAccent(member.color, siteAccentFallback);
                const talentsExtraStateKey = `${member.slug}:${section.id}:${currentMode}`;
                const talentCopyStateKey = `${talentsExtraStateKey}:copy`;
                const talentsExtraOpen = Object.prototype.hasOwnProperty.call(
                  talentsExtraOpenByKey,
                  talentsExtraStateKey
                )
                  ? Boolean(talentsExtraOpenByKey[talentsExtraStateKey])
                  : false;
                const talentCopyString = (section.copyTalentStringByMode?.[currentMode] || "").trim();
                const talentCopyFeedback = talentCopyFeedbackByKey[talentCopyStateKey] || "";

                return (
                  <section
                    className={`scroll-mt-24 overflow-hidden rounded-xl border p-5 transition md:p-6 ${activeSection?.id === section.id
                      ? "site-accent-border-soft site-accent-bg-subtle"
                      : "border-slate-700/80 bg-gray-950/35 hover:border-slate-500"
                      }`}
                    id={section.id}
                    key={section.id}
                    onClick={() => setActiveSectionId(section.id)}
                  >
                    {section.hasModeTabs ? (
                      <div className="mb-4 flex items-center">
                        <div
                          className="inline-flex rounded-full bg-gray-950/78 p-1 backdrop-blur-sm"
                          style={{
                            boxShadow: `0 0 0 1px ${toRgba(resolveStatAccent(member.color, siteAccentFallback), 0.33)} inset, 0 10px 22px rgba(2, 6, 23, 0.45)`
                          }}
                        >
                          {GUIDE_MODES.map((mode) => {
                            const modeAvailability = section?.modeAvailability?.[mode.id];
                            const modeEnabled = modeAvailability?.enabled !== false;
                            const isActive = currentMode === mode.id;
                            const modeLabel = modeEnabled
                              ? mode.label
                              : `${mode.label} (${modeAvailability?.statusLabel || "준비중"})`;

                            return (
                              <button
                                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${isActive
                                  ? "text-slate-50"
                                  : modeEnabled
                                    ? "text-slate-300 hover:text-slate-100"
                                    : "cursor-not-allowed text-slate-500"
                                  }`}
                                disabled={!modeEnabled}
                                key={`${section.id}-${mode.id}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  if (!modeEnabled) {
                                    return;
                                  }
                                  setModeForSection(section.id, mode.id);
                                }}
                                style={
                                  isActive
                                    ? {
                                      backgroundColor: toRgba(resolveStatAccent(member.color, siteAccentFallback), 0.4),
                                      boxShadow: `0 0 0 1px ${toRgba(resolveStatAccent(member.color, siteAccentFallback), 0.72)} inset, 0 6px 16px ${toRgba(
                                        resolveStatAccent(member.color, siteAccentFallback),
                                        0.25
                                      )}`
                                    }
                                    : undefined
                                }
                                type="button"
                              >
                                {modeLabel}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    <h2 className="mb-4 text-xl font-semibold tracking-tight" style={{ color: member.color }}>
                      {section.title}
                    </h2>

                    {section.type === "stats" ? (
                      <div className="space-y-4">
                        <GuideRichText content={section.statsByMode?.[currentMode]?.summary || ""} />
                        {section.statsByMode?.[currentMode]?.cards?.length ? (
                          <div className="space-y-3">
                            {section.statsByMode[currentMode].cards.map((card, cardIndex) => {
                              const fallbackAccent = cardIndex % 2 === 0 ? "#f3d25b" : siteAccentFallback;
                              const accent = resolveStatAccent(card?.accent, fallbackAccent);
                              const groupedTiers = groupPrioritiesByTier(normalizePriorityItems(card?.priorities || []));
                              const flow = buildPriorityFlow(groupedTiers);
                              const gridTemplateColumns = flow.map(() => "max-content").join(" ");
                              const hasAnyNote = flow.some((item) => item.type === "stat" && item.entry.note);

                              return (
                                <div
                                  className={`${cardIndex > 0 ? "border-t border-slate-700/70 pt-3" : ""}`}
                                  key={`stats-card-${section.id}-${card.id || cardIndex}`}
                                >
                                  <div className="mb-1.5 flex items-center gap-2">
                                    {card?.icon ? <img alt="" className="h-5 w-5 rounded-full border border-slate-400/20 object-cover" src={card.icon} /> : null}
                                    <h3 className="text-[15px] font-semibold leading-tight md:text-[16px]" style={{ color: accent }}>
                                      {card?.title || "Stat Priority"}
                                    </h3>
                                  </div>
                                  {flow.length ? (
                                    <div className="w-full">
                                      <div
                                        className="grid w-full justify-center gap-x-1.5 text-center"
                                        style={{ gridTemplateColumns: gridTemplateColumns || "max-content" }}
                                      >
                                        {flow.map((item, itemIndex) =>
                                          item.type === "op" ? (
                                            <span
                                              className="px-0.5 pt-0.5 text-[13px] font-bold leading-none md:text-[14px]"
                                              key={`op-top-${section.id}-${card.id || cardIndex}-${itemIndex}`}
                                              style={{ color: toRgba(accent, 0.95) }}
                                            >
                                              {item.value}
                                            </span>
                                          ) : (
                                            <p
                                              className="px-0.5 text-[14px] font-semibold leading-none text-slate-100 md:text-[15px]"
                                              key={`stat-top-${section.id}-${card.id || cardIndex}-${itemIndex}`}
                                            >
                                              {item.entry.label}
                                            </p>
                                          )
                                        )}
                                        {hasAnyNote
                                          ? flow.map((item, itemIndex) =>
                                            item.type === "op" ? (
                                              <span key={`op-note-${section.id}-${card.id || cardIndex}-${itemIndex}`} />
                                            ) : (
                                              <p
                                                className="mx-auto mt-0.5 max-w-[112px] px-0.5 text-[10px] leading-tight text-slate-400 md:text-[11px]"
                                                key={`stat-note-${section.id}-${card.id || cardIndex}-${itemIndex}`}
                                              >
                                                {item.entry.note || ""}
                                              </p>
                                            )
                                          )
                                          : null}
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="rounded-md border border-dashed border-slate-600/80 bg-gray-950/60 px-3 py-2 text-xs text-slate-400">
                                      priorities를 추가하면 자동으로 순번이 렌더됩니다.
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="rounded-lg border border-dashed border-slate-600 bg-slate-900/55 px-3 py-2 text-xs text-slate-400">
                            각 가이드 파일의 stats 카드를 작성하면 됩니다.
                          </p>
                        )}
                        <details className="rounded-lg border border-slate-700/80 bg-gray-950/40">
                          <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-slate-200">추가 설명</summary>
                          <div className="border-t border-slate-700/80 px-3 py-3">
                            {section.statsByMode?.[currentMode]?.extra ? (
                              <GuideRichText content={section.statsByMode?.[currentMode]?.extra || ""} />
                            ) : (
                              <p className="text-xs text-slate-400">스탯 추가 설명이 없습니다.</p>
                            )}
                          </div>
                        </details>
                      </div>
                    ) : null}

                    {section.type === "links" ? (
                      <div className="space-y-3">
                        <GuideRichText content={section.links?.intro || ""} />
                        {section.links?.items?.length ? (
                          <div className="space-y-2">
                            {section.links.items.map((item, index) => (
                              <a
                                className="site-accent-hover-border block rounded-lg border border-slate-700/80 bg-slate-900/70 p-3 transition hover:bg-slate-900"
                                href={item?.url || "#"}
                                key={`link-${section.id}-${index}`}
                                rel="noreferrer"
                                target="_blank"
                              >
                                <p className="site-accent-text text-sm font-semibold">{item?.title || `추천 링크 ${index + 1}`}</p>
                                <p className="mt-1 truncate text-xs text-slate-400">{item?.url || ""}</p>
                                {item?.description ? <p className="mt-2 text-xs text-slate-300">{item.description}</p> : null}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="rounded-lg border border-dashed border-slate-600 bg-slate-900/55 px-3 py-2 text-xs text-slate-400">
                            추천사이트 링크를 추가하면 됩니다.
                          </p>
                        )}
                      </div>
                    ) : null}

                    {section.type === "text" ? (
                      <>
                        <GuideRichText content={section.contentByMode?.[currentMode] || ""} />

                        {/* 개요 섹션: 레이드플랜 링크 */}
                        {section.id === "overview" && section.raidPlanUrl ? (
                          <div className="mt-4">
                            <a
                              className="site-accent-hover-border inline-flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-900"
                              href={section.raidPlanUrl}
                              rel="noreferrer"
                              target="_blank"
                            >
                              <span className="site-accent-text">레이드플랜</span>
                              <span className="text-xs text-slate-400">↗</span>
                            </a>
                          </div>
                        ) : null}

                        {section.id === "basic-operation" ? (
                          <div className="mt-4 space-y-3">
                            {rotationData?.intro ? <GuideRichText compact content={rotationData.intro} /> : null}
                            {rotationItems.length ? (
                              <>
                                <div className="flex flex-wrap gap-2">
                                  {rotationItems.map((item) => {
                                    const isActive = (activeRotation?.id || "") === item.id;
                                    return (
                                      <button
                                        className={`inline-flex items-center gap-2 rounded-md border px-3.5 py-2 text-[13px] font-semibold tracking-tight transition md:text-sm ${isActive
                                          ? "text-slate-50"
                                          : "border-slate-700 bg-slate-900/85 text-slate-300 hover:border-slate-500 hover:text-slate-100"
                                          }`}
                                        key={`rotation-button-${section.id}-${currentMode}-${item.id}`}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          setActiveRotationByModeKey((prev) => ({
                                            ...prev,
                                            [rotationStateKey]: isActive ? "" : item.id
                                          }));
                                        }}
                                        style={
                                          isActive
                                            ? {
                                              borderColor: toRgba(rotationAccent, 0.58),
                                              backgroundColor: toRgba(rotationAccent, 0.16),
                                              boxShadow: `inset 3px 0 0 ${toRgba(rotationAccent, 0.9)}`
                                            }
                                            : undefined
                                        }
                                        type="button"
                                      >
                                        <span>{item.label}</span>
                                        <span
                                          aria-hidden="true"
                                          className={`text-[12px] leading-none text-slate-300 transition-transform ${isActive ? "rotate-90" : "rotate-0"}`}
                                        >
                                          ▸
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                                {activeRotation ? (
                                  <div className="rounded-lg border border-slate-700/80 bg-gray-950/55 p-3">
                                    <GuideRichText compact content={activeRotation?.content || ""} />
                                  </div>
                                ) : null}
                              </>
                            ) : null}
                          </div>
                        ) : null}
                      </>
                    ) : null}

                    {section.type === "talents" ? (
                      <>
                        <GuideRichText content={section.contentByMode?.[currentMode] || ""} />
                        {member.talentLayout && member.talentTrees ? (
                          <TalentTreePanel healer={member} mode={currentMode} />
                        ) : null}
                        <div className="mt-4 flex flex-col items-center gap-1">
                          <button
                            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${talentCopyString
                              ? "site-accent-border site-accent-bg-subtle site-accent-text hover:brightness-110"
                              : "cursor-not-allowed border-slate-700 bg-slate-900/70 text-slate-500"
                              }`}
                            onClick={(event) => handleTalentCopyClick(event, talentCopyStateKey, talentCopyString)}
                            type="button"
                          >
                            특성 복사
                          </button>
                          {talentCopyFeedback === "copied" ? (
                            <p className="text-xs text-emerald-300">클립보드에 복사됨</p>
                          ) : null}
                          {talentCopyFeedback === "failed" ? (
                            <p className="text-xs text-rose-300">복사 실패</p>
                          ) : null}
                          {talentCopyFeedback === "empty" ? (
                            <p className="text-xs text-amber-300">이 모드의 특성 문자열이 비어 있음</p>
                          ) : null}
                        </div>
                        <details
                          className="mt-4 rounded-lg border border-slate-700/80 bg-gray-950/40"
                          onToggle={(event) => {
                            const nextOpen = Boolean(event.currentTarget.open);
                            setTalentsExtraOpenByKey((prev) => ({
                              ...prev,
                              [talentsExtraStateKey]: nextOpen
                            }));
                          }}
                          open={talentsExtraOpen}
                        >
                          <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-slate-200">항목별 추가 설명</summary>
                          <div className="border-t border-slate-700/80 px-2 py-3">
                            <GuideRichText content={section.extraByMode?.[currentMode] || ""} />
                          </div>
                        </details>
                      </>
                    ) : null}
                    {section.type === "changelog" ? (
                      <div className="space-y-4">
                        {section.entries && section.entries.length > 0 ? (
                          <div className="flex flex-col gap-4">
                            {section.entries.map((entry, index) => (
                              <div key={index} className="flex items-start border-b border-slate-700/50 pb-3 last:border-0 last:pb-0">
                                <div className="shrink-0 text-sm font-semibold text-slate-300 mr-2 mt-[2px]">
                                  {formatChangelogDate(entry.date)}:
                                </div>
                                <div className="text-sm text-slate-200">
                                  <GuideRichText content={entry.text} compact />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400">업데이트 내역이 없습니다.</p>
                        )}
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </div>
          </article>

          <div className="pointer-events-auto hidden lg:sticky lg:top-20 lg:block">
            <CommentsPanel {...commentsPanelProps} />
          </div>
        </div>
      </main>

      <div className="relative z-10 pointer-events-auto w-full flex-none">
        <SiteFooter />
      </div>

      <button
        className="pointer-events-auto site-accent-border site-accent-button site-accent-shadow fixed bottom-5 right-4 z-40 rounded-full border px-4 py-2 text-xs font-semibold transition lg:hidden"
        onClick={() => setMobileCommentsOpen(true)}
        type="button"
      >
        댓글
      </button>

      {mobileCommentsOpen ? (
        <div className="pointer-events-auto fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="댓글 패널 닫기"
            className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
            onClick={() => setMobileCommentsOpen(false)}
            type="button"
          />
          <aside className="absolute bottom-0 right-0 top-0 w-[min(92vw,380px)] border-l border-slate-700/80 bg-gray-950/98 p-3 shadow-[0_0_45px_rgba(2,8,23,0.92)]">
            <div className="mb-2 flex items-center justify-between">
              <p className="site-accent-text text-xs font-semibold uppercase tracking-[0.16em]">섹션 댓글</p>
              <button
                className="rounded-md border border-slate-600 px-2 py-1 text-[11px] font-semibold text-slate-200"
                onClick={() => setMobileCommentsOpen(false)}
                type="button"
              >
                닫기
              </button>
            </div>
            <div className="h-[calc(100%-2rem)] overflow-y-auto pr-1">
              <CommentsPanel {...commentsPanelProps} />
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

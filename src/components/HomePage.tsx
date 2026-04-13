import { useEffect, useRef, useState, useCallback, Fragment } from "react";
import { Link } from "react-router-dom";
import { SiteFooter } from "./SiteFooter";
import { AuthActionButton } from "./AuthActionButton";
import Dither from "./Dither";
import { AuroraText } from "./AuroraText"

type HealerSummary = {
  slug: string;
  shortName: string;
  name: string;
  classIcon: string;
  enabled: boolean;
};

type SimulatorSummary = {
  slug: string;
  name: string;
  description: string;
  enabled: boolean;
};

type HomePageProps = {
  healers: HealerSummary[];
  simulators: SimulatorSummary[];
};

type ExternalRaidGuideLink = {
  slug: string;
  name: string;
  loc: string;
  icon: string;
  url: string;
};

const EXTERNAL_RAID_LINKS: ExternalRaidGuideLink[] = [
  {
    slug: "raid-boss-1",
    name: "아베르지안",
    loc: "공허첨탑",
    icon: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-host-general.png",
    url: "https://raidstrats.gg/planner?view=6263f14a-3e13-4d23-aa5b-4890ba09f6f9"
  },
  {
    slug: "raid-boss-2",
    name: "보라시우스",
    loc: "공허첨탑",
    icon: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-kaiju.png",
    url: "https://raidstrats.gg/planner?view=89666162-b1af-4b66-89b0-8ee6a0314502"
  },
  {
    slug: "raid-boss-3",
    name: "살라다르",
    loc: "공허첨탑",
    icon: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-salhadaar.png",
    url: "https://raidstrats.gg/planner?view=d0169317-63a5-4468-b25b-2fcb69d1bc8d"
  },
  {
    slug: "raid-boss-4",
    name: "바 & 에",
    loc: "공허첨탑",
    icon: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-dragon-duo.png",
    url: "https://raidstrats.gg/planner?view=93bad360-4312-4e63-aa2f-3aa67634592d"
  },
  {
    slug: "raid-boss-5",
    name: "선봉대",
    loc: "공허첨탑",
    icon: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-paladin-trio.png",
    url: "https://raidstrats.gg/planner?view=1c6af99e-dc3d-48f5-b44d-b3987ca26d53"
  },
  {
    slug: "raid-boss-6",
    name: "우주의 왕관",
    loc: "공허첨탑",
    icon: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-alleria.png",
    url: ""
  },
  {
    slug: "raid-boss-7",
    name: "카이메루스",
    loc: "꿈의 균열",
    icon: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-malformed-manifestation.png",
    url: ""
  },
  {
    slug: "raid-boss-8",
    name: "벨로렌",
    loc: "진격로",
    icon: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-light-void-phoenix.png",
    url: ""
  },
  {
    slug: "raid-boss-9",
    name: "르우라",
    loc: "진격로",
    icon: "https://wow.zamimg.com/images/wow/journal/ui-ej-boss-lura-midnight.png",
    url: ""
  }
];

function GuideChip({ healer }: { healer: HealerSummary }) {
  const classes = healer.enabled
    ? "border-slate-700/80 bg-slate-900/65 hover:border-violet-300/70 hover:bg-slate-900/90"
    : "pointer-events-none border-slate-800 bg-slate-900/30 opacity-50 grayscale";

  if (!healer.enabled) {
    return (
      <div className={`group w-[118px] shrink-0 rounded-2xl border p-3 text-center transition ${classes}`}>
        <img
          alt={`${healer.shortName} class icon`}
          className="mx-auto h-10 w-10 rounded-xl border border-slate-700 object-cover"
          src={healer.classIcon}
        />
        <p className="mt-2 text-sm font-semibold text-slate-200">{healer.shortName}</p>
        <p className="text-[11px] text-slate-400">준비 중</p>
      </div>
    );
  }

  return (
    <Link className={`group w-[118px] shrink-0 rounded-2xl border p-3 text-center transition ${classes}`} to={`/guide/${healer.slug}`}>
      <img
        alt={`${healer.shortName} class icon`}
        className="mx-auto h-10 w-10 rounded-xl border border-slate-700 object-cover shadow-lg shadow-black/40"
        src={healer.classIcon}
      />
      <p className="mt-2 text-sm font-semibold text-slate-200">{healer.shortName}</p>
      <p className="truncate text-[11px] text-slate-300">{healer.name}</p>
    </Link>
  );
}

function SimulatorCard({ simulator }: { simulator: SimulatorSummary }) {
  const classes = simulator.enabled
    ? "border-slate-700/80 bg-slate-900/80 hover:border-violet-300/60 hover:bg-slate-900"
    : "pointer-events-none border-slate-800 bg-slate-900/35 grayscale opacity-60";
  const content = (
    <>
      <h3 className="text-base font-semibold text-slate-200">{simulator.name}</h3>
      <p className="mt-1 text-sm text-slate-300">{simulator.description}</p>
      {!simulator.enabled ? <p className="mt-2 text-xs uppercase tracking-wider text-slate-500">준비 중</p> : null}
    </>
  );

  if (simulator.enabled) {
    return (
      <Link className={`rounded-2xl border p-4 transition ${classes}`} to={`/sim/${simulator.slug}`}>
        {content}
      </Link>
    );
  }

  return <div className={`rounded-2xl border p-4 transition ${classes}`}>{content}</div>;
}

function ExternalRaidChip({ link }: { link: ExternalRaidGuideLink }) {
  const hasUrl = Boolean(String(link.url ?? "").trim());
  const classes = hasUrl
    ? "border-slate-700/80 bg-slate-900/65 hover:border-violet-300/70 hover:bg-slate-900/90"
    : "pointer-events-none border-slate-800 bg-slate-900/30 opacity-50 grayscale";

  const content = (
    <>
      <img
        alt={`${link.name} icon`}
        className={`mx-auto h-10 w-10 rounded-xl border border-slate-700 object-cover ${hasUrl ? "shadow-lg shadow-black/40" : ""}`}
        src={link.icon}
      />
      <p className="mt-1 text-sm font-semibold text-slate-200">{link.name}</p>
      <p className={`truncate text-[11px] ${hasUrl ? "text-slate-300" : "text-slate-400"}`}>{link.loc}</p>
    </>
  );

  if (!hasUrl) {
    return <div className={`group w-[90px] shrink-0 rounded-2xl border p-2 text-center transition ${classes}`}>{content}</div>;
  }

  return (
    <a
      className={`group w-[90px] shrink-0 rounded-2xl border p-2 text-center transition ${classes}`}
      href={link.url}
      rel="noopener noreferrer"
      target="_blank"
    >
      {content}
    </a>
  );
}

export function HomePage({ healers, simulators }: HomePageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const recalcScale = useCallback(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    // scale을 1로 리셋하여 자연 높이 측정
    content.style.transform = "scale(1)";
    const natural = content.scrollHeight;
    const available = wrapper.clientHeight;

    const newScale = natural > available ? available / natural : 1;
    setScale(newScale);
    content.style.transform = `scale(${newScale})`;
  }, []);

  useEffect(() => {
    const previousOverflowY = document.body.style.overflowY;
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = previousOverflowY;
    };
  }, []);

  useEffect(() => {
    recalcScale();

    const images = contentRef.current?.querySelectorAll("img") ?? [];
    const onLoad = () => recalcScale();
    images.forEach((img) => img.addEventListener("load", onLoad));

    window.addEventListener("resize", recalcScale);
    return () => {
      window.removeEventListener("resize", recalcScale);
      images.forEach((img) => img.removeEventListener("load", onLoad));
    };
  }, [recalcScale]);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden text-slate-100">
      <div className="fixed inset-0 z-0">
        <Dither
          waveColor={[0.25, 0.15, 0.8]}
          disableAnimation={false}
          enableMouseInteraction
          mouseRadius={0.35}
          colorNum={4}
          pixelSize={2}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.025}
        />
      </div>
      <div className="absolute right-4 top-4 z-20 pointer-events-auto">
        <AuthActionButton showUserLabel={false} />
      </div>

      <div ref={wrapperRef} className="relative z-10 flex-1 min-h-0 overflow-hidden">
        <div
          ref={contentRef}
          className="mx-auto flex w-full max-w-5xl flex-col px-4 md:px-6 pointer-events-none"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          {/* 타이틀 */}
          <section className="px-2 pt-[calc(3vh+16px)] pb-[52px] text-center pointer-events-auto">
            <p className="text-xs uppercase tracking-[0.36em] text-slate-400">The Healer Society</p>
            <AuroraText className="site-accent-text block text-7xl font-bold" speed={2} colors={["#fe2ec3ff", "#9050ffff", "#536affff", "#e9baffff"]}>힐러애호가협회</AuroraText>
          </section>

          <div className="flex flex-col gap-[6px]">
            <section className="hidden lg:block rounded-3xl border border-slate-700/80 bg-slate-900/55 p-4 shadow-panel pointer-events-auto">
              <div className="mb-2 flex items-end justify-between">
                <p className="text-lg font-bold md:text-xl text-slate-200">시뮬레이션 연구실</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {simulators.map((simulator) => <SimulatorCard key={simulator.slug} simulator={simulator} />)}
              </div>
            </section>
            <section className="rounded-3xl border border-slate-700/80 bg-slate-900/55 p-4 shadow-panel pointer-events-auto">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold md:text-xl text-slate-200">한밤 힐러 가이드</p>
                <span className="text-xs text-slate-400">12.0.1</span>
              </div>
              <div className="mt-2 overflow-x-auto">
                <div className="flex min-w-max items-start gap-3">
                  {healers.map((healer) => (
                    <GuideChip healer={healer} key={healer.slug} />
                  ))}
                </div>
              </div>
            </section>
            <section className="rounded-3xl border border-slate-700/80 bg-slate-900/55 p-4 shadow-panel pointer-events-auto">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold md:text-xl text-slate-200">한밤 1시즌 레이드 공략 (레이드플랜)</p>
              </div>
              <div className="mt-2 overflow-x-auto">
                <div className="flex min-w-max items-start gap-3">
                  {EXTERNAL_RAID_LINKS.map((link, idx) => (
                    <Fragment key={link.slug}>
                      {(idx === 6 || idx === 7) && <div className="self-stretch w-[3px] bg-violet-500/40" />}
                      <ExternalRaidChip link={link} />
                    </Fragment>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-none">
        <SiteFooter />
      </div>
    </div>
  );
}

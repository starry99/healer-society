import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteFooter } from "./SiteFooter";
import { AuthActionButton } from "./AuthActionButton";
import Dither from "./Dither";
import FuzzyText from './FuzzyText';
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

function GuideChip({ healer }: { healer: HealerSummary }) {
  const classes = healer.enabled
    ? "border-slate-700/80 bg-slate-900/65 hover:border-violet-300/70 hover:bg-slate-900/90"
    : "pointer-events-none border-slate-800 bg-slate-900/30 opacity-50 grayscale";

  if (!healer.enabled) {
    return (
      <div className={`group w-[118px] shrink-0 rounded-2xl border p-3 text-center transition ${classes}`}>
        <img
          alt={`${healer.shortName} class icon`}
          className="mx-auto h-12 w-12 rounded-xl border border-slate-700 object-cover"
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
        className="mx-auto h-12 w-12 rounded-xl border border-slate-700 object-cover shadow-lg shadow-black/40"
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
      <p className="mt-2 text-sm text-slate-300">{simulator.description}</p>
      {!simulator.enabled ? <p className="mt-4 text-xs uppercase tracking-wider text-slate-500">준비 중</p> : null}
    </>
  );

  if (simulator.enabled) {
    return (
      <Link className={`rounded-2xl border p-5 transition ${classes}`} to={`/sim/${simulator.slug}`}>
        {content}
      </Link>
    );
  }

  return <div className={`rounded-2xl border p-5 transition ${classes}`}>{content}</div>;
}

export function HomePage({ healers, simulators }: HomePageProps) {
  useEffect(() => {
    const previousOverflowY = document.body.style.overflowY;
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = previousOverflowY;
    };
  }, []);

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
      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-grow flex-col overflow-hidden px-4 py-4 md:px-6 md:py-5 pointer-events-none">
        <section className="px-2 py-2 text-center md:py-1 pointer-events-auto mb-12 mt-12">
          <p className="text-xs uppercase tracking-[0.36em] text-slate-400">The Healer Society</p>
          {/* <FuzzyText
            baseIntensity={0.05}
            hoverIntensity={0.2}
            enableHover
            fps={30}
            glitchMode
            glitchInterval={5000}
            className="mx-auto mt-3 mb-3 block tracking-[0.08em]"
            fontSize={108}
          >
            힐러애호가협회
          </FuzzyText> */}
          <AuroraText className="site-accent-text block text-7xl font-bold" speed={2} colors={["#fe2ec3ff", "#9050ffff", "#536affff", "#e9baffff"]}>힐러애호가협회</AuroraText>
          {/* <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
            Midnight 시즌 힐러 레퍼런스를 빠르게 확인할 수 있는 가이드 허브입니다.
          </p> */}
        </section>
        <section className="mt-2 rounded-3xl border border-slate-700/80 bg-slate-900/55 p-4 shadow-panel md:p-6 pointer-events-auto">
          <div className="mb-4 flex items-end justify-between">
            <p className="text-lg font-bold md:text-xl text-slate-200">시뮬레이션 연구실</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {simulators.map((simulator) => <SimulatorCard key={simulator.slug} simulator={simulator} />)}
          </div>
        </section>
        <section className="mt-2 rounded-3xl border border-slate-700/80 bg-slate-900/55 p-4 shadow-panel md:p-6 pointer-events-auto">
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold md:text-xl text-slate-200">한밤 힐러 가이드</p>
            <span className="text-xs text-slate-400">12.0.1</span>
          </div>
          <div className="mt-4 overflow-x-auto pb-2">
            <div className="flex min-w-max items-start gap-3">
              {healers.map((healer) => (
                <GuideChip healer={healer} key={healer.slug} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}

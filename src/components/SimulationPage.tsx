import { useCallback, useState, type ComponentType } from "react";
import { Navigate, useParams } from "react-router-dom";
import { simulatorMap } from "./simulators.js";
import { NavBar } from "./NavBar";
import { SiteFooter } from "./SiteFooter";
import Dither from "./Dither";
import { DisciplineRampSimulator } from "./simulators/DisciplineRampSimulator";
import { HealerPracticeSimulator } from "./simulators/HealerPracticeSimulator";

const simulatorViews: Record<string, ComponentType> = {
  "disc-ramp-planner": DisciplineRampSimulator,
  "hpal-healer-practice": HealerPracticeSimulator,
};
const HEALER_PRACTICE_OPEN_RANKING_EVENT = "healer-practice-open-ranking";
type HealerPracticeSimulatorProps = {
  onCombatRunningChange?: (nextRunning: boolean) => void;
};
const TypedHealerPracticeSimulator =
  HealerPracticeSimulator as unknown as ComponentType<HealerPracticeSimulatorProps>;

export function SimulationPage() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) {
    return <Navigate to="/" replace />;
  }
  const simulator = simulatorMap[slug];
  const SimulatorView = simulatorViews[slug];

  if (!simulator) {
    return <Navigate to="/" replace />;
  }

  const isHealerPracticePage = slug === "hpal-healer-practice";
  const [isHealerPracticeCombatRunning, setIsHealerPracticeCombatRunning] = useState(false);
  const handleHealerPracticeCombatRunningChange = useCallback((nextRunning: boolean) => {
    setIsHealerPracticeCombatRunning(Boolean(nextRunning));
  }, []);
  const handleOpenHealerPracticeRanking = () => {
    if (typeof window === "undefined") {
      return;
    }
    window.dispatchEvent(new Event(HEALER_PRACTICE_OPEN_RANKING_EVENT));
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-gray-950 text-slate-100">
      <div className="fixed inset-0 z-0">
        <Dither
          waveColor={[0.25, 0.15, 0.8]}
          disableAnimation={isHealerPracticePage && isHealerPracticeCombatRunning}
          enableMouseInteraction={false}
          mouseRadius={0.35}
          colorNum={4}
          pixelSize={isHealerPracticePage ? 3 : 2}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.025}
          targetFps={isHealerPracticePage ? 12 : 24}
          dpr={isHealerPracticePage ? 0.6 : 0.75}
          antialias={false}
          preserveDrawingBuffer={false}
          powerPreference="low-power"
        />
      </div>
      <NavBar />
      <main className="relative z-10 mx-auto flex-grow w-full max-w-5xl px-4 py-16">
        <section className="rounded-3xl border border-slate-700/80 bg-slate-900/70 p-8 shadow-panel">
          <p className="site-accent-text-muted text-xs uppercase tracking-[0.22em]">Simulation Lab</p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{simulator.name}</h1>
            {isHealerPracticePage ? (
              <button
                className="rounded-lg border border-violet-400/70 bg-violet-500/10 px-3 py-1.5 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/20"
                onClick={handleOpenHealerPracticeRanking}
                type="button"
              >
                랭킹 보기
              </button>
            ) : null}
          </div>
          <p className="mt-2 text-slate-300">{simulator.description}</p>

          {simulator.enabled && SimulatorView ? (
            isHealerPracticePage ? (
              <TypedHealerPracticeSimulator onCombatRunningChange={handleHealerPracticeCombatRunningChange} />
            ) : (
              <SimulatorView />
            )
          ) : (
            <p className="mt-6 rounded-xl border border-slate-700 bg-gray-950/45 p-3 text-sm text-slate-400">
              {simulator.enabled
                ? "시뮬레이터 메인 컴포넌트가 아직 연결되지 않았습니다."
                : "현재는 준비 중이라 메뉴와 메인 카드에서 비활성 처리됩니다."}
            </p>
          )}
        </section>
      </main>
      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}

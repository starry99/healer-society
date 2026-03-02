import type { ComponentType } from "react";
import FuzzyText from "./components/FuzzyText";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { healers, healerMap } from "./components/healers";
import { simulatorMap, simulators } from "./components/simulators.js";
import { GuidePage } from "./components/GuidePage";
import { HomePage } from "./components/HomePage";
import { MyPage } from "./components/MyPage";
import { NavBar } from "./components/NavBar";
import { SiteFooter } from "./components/SiteFooter";
import Dither from "./components/Dither";
import { DisciplineRampSimulator } from "./components/simulators/DisciplineRampSimulator";
import { HealerPracticeSimulator } from "./components/simulators/HealerPracticeSimulator";

const simulatorViews: Record<string, ComponentType> = {
  "disc-ramp-planner": DisciplineRampSimulator,
  "hpal-healer-practice": HealerPracticeSimulator
};
const HEALER_PRACTICE_OPEN_RANKING_EVENT = "healer-practice-open-ranking";

function SimulationPage() {
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
            <SimulatorView />
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

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-6 text-slate-100">
      <FuzzyText
        baseIntensity={0.2}
        hoverIntensity={0.5}
        enableHover
      >
        404
      </FuzzyText>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage healers={healers} simulators={simulators} />} />
      <Route path="/my" element={<MyPage />} />
      <Route path="/guide/:slug" element={<GuidePage healerMap={healerMap} />} />
      <Route path="/sim/:slug" element={<SimulationPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

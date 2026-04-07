import { Route, Routes } from "react-router-dom";
import { healers, healerMap } from "./components/healers";
import { simulators } from "./components/simulators.js";
import { GuidePage } from "./components/GuidePage";
import { HomePage } from "./components/HomePage";
import { MyPage } from "./components/MyPage";
import { SimulationPage } from "./components/SimulationPage";

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-6 text-slate-100">
      <p className="text-8xl font-black text-slate-200">404</p>
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

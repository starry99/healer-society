import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { healers } from "./healers";
import { simulators } from "./simulators.js";
import { AuthActionButton } from "./AuthActionButton";
import { AuroraText } from "./AuroraText"

function Dropdown({ title, items, toPath, open, onToggle }) {
  return (
    <div className="relative">
      <button
        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition sm:text-sm ${open ? "site-accent-text bg-slate-900/55" : "text-slate-300 hover:bg-slate-800/40 hover:text-slate-100"
          }`}
        onClick={onToggle}
        type="button"
      >
        {title}
        <span className={`site-accent-text-muted text-[10px] transition ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-64 rounded-2xl border border-slate-700/90 bg-slate-900/95 p-2 shadow-panel backdrop-blur">
          {items.map((item) =>
            item.enabled ? (
              <Link
                key={item.slug}
                className="site-accent-hover-text flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-800/90"
                to={toPath(item.slug)}
              >
                {item.classIcon ? (
                  <img alt={`${item.name} class icon`} className="h-6 w-6 rounded-lg border border-slate-700 object-cover" src={item.classIcon} />
                ) : null}
                <span>{item.shortName ? `${item.shortName} - ${item.name}` : item.name}</span>
              </Link>
            ) : (
              <span
                key={item.slug}
                aria-disabled="true"
                className="flex cursor-not-allowed items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-500 grayscale"
              >
                {item.classIcon ? (
                  <img alt={`${item.name} class icon`} className="h-6 w-6 rounded-lg border border-slate-700 object-cover" src={item.classIcon} />
                ) : null}
                <span>{item.shortName ? `${item.shortName} - ${item.name}` : item.name}</span>
              </span>
            )
          )}
        </div>
      ) : null}
    </div>
  );
}

export function NavBar() {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState("");

  useEffect(() => {
    setOpenMenu("");
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-700/70 bg-gray-950/80 backdrop-blur-xl">
      <nav className="relative mx-auto flex h-16 w-full max-w-[1400px] items-center justify-end pl-4 pr-2 md:pl-6 md:pr-3">
        <div className="pointer-events-none absolute left-20">
          <Link className="pointer-events-auto site-accent-hover-text" to="/">
            <AuroraText className="block text-2xl font-bold">힐러애호가협회</AuroraText>
          </Link>
        </div>
        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          <AuthActionButton showUserLabel={false} />
          <Link className="rounded-md px-2 py-1.5 text-[13px] font-medium text-slate-300 transition hover:bg-slate-800/40 hover:text-slate-100 sm:text-sm" to="/my">
            마이페이지
          </Link>
          <Dropdown
            items={healers}
            onToggle={() => setOpenMenu((prev) => (prev === "guide" ? "" : "guide"))}
            open={openMenu === "guide"}
            title="직업 가이드"
            toPath={(slug) => `/guide/${slug}`}
          />
          <Dropdown
            items={simulators}
            onToggle={() => setOpenMenu((prev) => (prev === "sim" ? "" : "sim"))}
            open={openMenu === "sim"}
            title="시뮬레이션"
            toPath={(slug) => `/sim/${slug}`}
          />
        </div>
      </nav>
    </header>
  );
}

import { NavLink, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Candidates from "./pages/Candidates.jsx";
import Pipeline from "./pages/Pipeline.jsx";
import Jobs from "./pages/Jobs.jsx";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/candidates", label: "Candidates" },
  { to: "/pipeline", label: "Pipeline" },
  { to: "/jobs", label: "Jobs" },
];

export default function App() {
  return (
    <div className="relative mx-auto max-w-[1240px] overflow-clip px-5 pt-6 pb-14 max-sm:px-3 max-sm:pt-4 max-sm:pb-10">
      <div
        className="pointer-events-none fixed top-[8%] left-[-60px] z-0 h-[280px] w-[280px] animate-float rounded-full bg-brand/18 opacity-55 blur-[40px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed top-[34%] right-[-80px] z-0 h-[320px] w-[320px] animate-float rounded-full bg-accent/12 opacity-55 blur-[40px] [animation-delay:-4s]"
        aria-hidden="true"
      />

      <header className="relative z-[1] mb-7 flex animate-rise-slow items-center justify-between gap-4 max-[960px]:flex-col max-[960px]:items-stretch">
        <div className="flex items-center gap-3">
          <span className="grid size-[46px] place-items-center rounded-[14px] bg-linear-to-br from-brand to-brand-deep font-display font-bold text-white shadow-[0_10px_24px_rgba(15,122,95,0.28)]">
            EJ
          </span>
          <div>
            <p className="m-0 font-display text-[1.35rem] font-bold tracking-[-0.03em]">
              EarlyJobs
            </p>
            <p className="m-0 text-[0.85rem] text-muted">
              Mini Applicant Tracking System
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2 rounded-full border border-line bg-white/55 p-1.5 backdrop-blur-[10px] max-[960px]:justify-center">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-full px-[14px] py-2 font-semibold text-muted transition-[background,color,transform] duration-200 hover:translate-y-[-1px] hover:bg-white hover:text-ink ${
                  isActive ? "translate-y-[-1px] bg-white text-ink" : ""
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="relative z-[1]">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/jobs" element={<Jobs />} />
        </Routes>
      </main>
    </div>
  );
}

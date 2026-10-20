import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import StageBadge from "../components/StageBadge";

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getMetrics()
      .then(setMetrics)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return   <p className="m-0 mt-1 text-muted">Loading dashboard...</p>;
  if (error) return <p className="m-0 text-danger">{error}</p>;
  if (!metrics) return null;

  const maxStage = Math.max(...metrics.byStage.map((s) => s.count), 1);

  return (
    <div className="grid gap-[18px]">
      <section className="grid grid-cols-[1.4fr_0.8fr] items-start gap-6 overflow-hidden rounded-3xl border border-line bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(232,245,238,0.9))] p-7 shadow-panel animate-rise max-[960px]:grid-cols-1">
        <div>
          <p className="m-0 mb-2 text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase">
            Hiring overview
          </p>
          <h1>Keep every candidate moving</h1>
          <p className="m-0 max-w-[48ch] leading-[1.55] text-muted">
            Track applications, advance hiring stages, and watch pipeline health
            in one place.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 max-[960px]:flex-col max-[960px]:items-stretch">
            <Link
              className="cursor-pointer rounded-xl bg-linear-to-br from-brand to-brand-deep px-4 py-2.5 font-bold text-white shadow-[0_10px_22px_rgba(15,122,95,0.22)] transition duration-150 hover:-translate-y-px"
              to="/candidates"
            >
              Manage candidates
            </Link>
            <Link
              className="cursor-pointer rounded-xl border border-line bg-white px-4 py-2.5 font-bold text-ink transition duration-150 hover:-translate-y-px"
              to="/pipeline"
            >
              Open pipeline
            </Link>
          </div>
        </div>

<div className="relative flex min-h-[250px] items-center justify-center overflow-hidden sm:min-h-[280px]" aria-label="Illustration of a candidate hiring pipeline">
  {/* Soft background glow */}
  <div className="absolute h-52 w-52 rounded-full bg-emerald-200/40 blur-3xl" />

  {/* Decorative orbit rings */}
  <div className="absolute h-48 w-64 rotate-[-18deg] rounded-[50%] border border-dashed border-brand/25" />
  <div className="absolute h-36 w-52 rotate-[24deg] rounded-[50%] border border-brand/15" />

  {/* Orbiting status dots */}
  <span className="absolute right-[15%] top-[18%] size-3 rounded-full bg-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.35)]" />
  <span className="absolute bottom-[17%] left-[15%] size-2.5 rounded-full bg-brand" />

  {/* Main candidate card */}
  <div className="absolute left-[8%] top-[13%] z-10 w-[205px] -rotate-6 rounded-2xl border border-white/80 bg-white/95 p-3.5 shadow-[0_18px_45px_rgba(24,55,42,0.12)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:rotate-0">
    <div className="flex items-center gap-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 font-bold text-emerald-800">
        AK
      </div>
      <div className="min-w-0">
        <p className="m-0 truncate text-sm font-bold text-slate-800">
          Ananya Kumar
        </p>
        <p className="m-0 mt-1 text-xs text-slate-500">
          Product Designer
        </p>
      </div>
    </div>
    <div className="mt-3 flex items-center justify-between gap-2">
      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
        Interview
      </span>
      <span className="text-[10px] text-slate-400">Application</span>
    </div>
  </div>

  {/* Secondary candidate card */}
  <div className="absolute bottom-[12%] right-[5%] z-20 w-[205px] rotate-3 rounded-2xl border border-white/80 bg-white/95 p-3.5 shadow-[0_18px_45px_rgba(24,55,42,0.14)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:rotate-0">
    <div className="flex items-center gap-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-100 font-bold text-sky-800">
        RS
      </div>
      <div className="min-w-0">
        <p className="m-0 truncate text-sm font-bold text-slate-800">
          Rahul Sharma
        </p>
        <p className="m-0 mt-1 text-xs text-slate-500">
          Software Engineer
        </p>
      </div>
    </div>
    <div className="mt-3 flex items-center justify-between gap-2">
      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
        Shortlisted
      </span>
      <span className="text-[10px] text-slate-400">In progress</span>
    </div>
  </div>

  {/* Floating progress badge */}
  <div className="absolute right-[3%] top-[8%] z-30 flex items-center gap-2 rounded-xl border border-white bg-white/95 px-3 py-2 shadow-lg">
    <span className="grid size-7 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
      ✓
    </span>
    <div>
      <p className="m-0 text-[10px] text-slate-500">Hiring pipeline</p>
      <p className="m-0 text-xs font-bold text-slate-800">
        Moving forward
      </p>
    </div>
  </div>
</div>

      </section>

      <section className="grid grid-cols-4 gap-[14px] max-[960px]:grid-cols-1 max-sm:grid-cols-2">
        {[
          { label: "Total candidates", value: metrics.totalCandidates },
          { label: "Active pipeline", value: metrics.activePipeline },
          { label: "Hired", value: metrics.hiredCount },
          { label: "Open jobs", value: metrics.openJobs },
        ].map((item, index) => (
          <article
            key={item.label}
            className="rounded-[18px] border border-line bg-panel p-[18px] shadow-panel backdrop-blur-[10px] animate-rise"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <p className="m-0 mb-2 font-semibold text-muted">{item.label}</p>
            <strong className="font-display text-[2rem]">{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-[1.1fr_1fr] gap-[14px] max-[960px]:grid-cols-1">
        <article className="rounded-[18px] border border-line bg-panel p-[18px] shadow-panel backdrop-blur-[10px]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[1.05rem]">Stage breakdown</h2>
          </div>
          <div className="mt-[14px] grid gap-3">
            {metrics.byStage.map((item) => (
              <div key={item.stage}>
                <div className="flex items-center justify-between gap-2.5">
                  <span>{item.stage}</span>
                  <span>{item.count}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-brand/10">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-brand to-[#1ea37a] transition-[width] duration-[450ms]"
                    style={{ width: `${(item.count / maxStage) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[18px] border border-line bg-panel p-[18px] shadow-panel backdrop-blur-[10px]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[1.05rem]">Recent applications</h2>
            <Link className="text-brand-deep" to="/candidates">View all</Link>
          </div>
          <ul className="mt-[14px] grid list-none gap-3 p-0">
            {metrics.recent.map((candidate) => (
              <li key={candidate._id} className="flex items-center justify-between gap-2.5 border-b border-line pb-2.5 last:border-0">
                <div>
                  <strong>{candidate.name}</strong>
                  <p className="m-0 mt-1 text-muted">
                    {candidate.role}
                    {candidate.job?.title ? ` · ${candidate.job.title}` : ""}
                  </p>
                </div>
                <StageBadge stage={candidate.stage} />
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-[18px] border border-line bg-panel p-[18px] shadow-panel backdrop-blur-[10px]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[1.05rem]">Sources</h2>
        </div>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {metrics.bySource.map((item) => (
            <div key={item.source} className="flex min-w-[120px] items-center justify-between gap-2.5 rounded-xl bg-brand/8 px-3 py-2.5">
              <span>{item.source}</span>
              <strong className="grid size-7 min-w-7 place-items-center rounded-full bg-brand/10 text-[0.85rem]">{item.count}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState } from "react";
import { api } from "../api";

export default function Pipeline() {
  const [stages, setStages] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(null);
  const [activeStage, setActiveStage] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [stageList, list] = await Promise.all([
        api.getStages(),
        api.getCandidates(),
      ]);
      setStages(stageList);
      setCandidates(list);
      setActiveStage((current) =>
        stageList.includes(current) ? current : stageList[0] || ""
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function moveToStage(candidateId, stage) {
    try {
      const updated = await api.updateStage(candidateId, stage);
      setCandidates((prev) =>
        prev.map((item) => (item._id === candidateId ? updated : item))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  function onDrop(stage) {
    if (!dragging) return;
    if (dragging.stage !== stage) {
      moveToStage(dragging._id, stage);
    }
    setDragging(null);
  }

  if (loading) return <p className="m-0 text-muted">Loading pipeline...</p>;

  return (
    <div className="grid gap-[18px]">
      <section className="flex items-start justify-between gap-3 max-[960px]:flex-col max-[960px]:items-stretch">
        <div>
          <p className="m-0 mb-2 text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase">
            Hiring stages
          </p>
          <h1>Pipeline</h1>
          <p className="m-0 max-w-[48ch] leading-[1.55] text-muted">
            Choose a stage to see its candidates. Drag a candidate to another stage
            or update their stage from the card.
          </p>
        </div>
      </section>

      {error && <p className="m-0 text-danger">{error}</p>}

      <section className="grid gap-4" aria-label="Candidate pipeline">
        <div
          className="scrollbar-none flex snap-x snap-proximity gap-2.5 overflow-x-auto px-0.5 pt-1 pb-2.5"
          role="tablist"
          aria-label="Pipeline stages"
        >
          {stages.map((stage) => {
            const count = candidates.filter(
              (candidate) => candidate.stage === stage
            ).length;
            const isActive = activeStage === stage;
            return (
              <button
                key={stage}
                type="button"
                role="tab"
                id={`stage-tab-${stages.indexOf(stage)}`}
                aria-selected={isActive}
                aria-controls={`stage-panel-${stages.indexOf(stage)}`}
                aria-expanded={isActive}
                className={`flex min-w-[170px] shrink-0 snap-start cursor-pointer items-center justify-between gap-4 rounded-[15px] border px-[14px] py-[13px] text-left font-bold text-ink shadow-[0_8px_22px_rgba(20,35,28,0.05)] transition-[border-color,background,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(20,35,28,0.09)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/35 max-sm:min-w-[150px] ${
                  isActive
                    ? "border-brand/40 bg-[linear-gradient(145deg,#fff,rgba(15,122,95,0.1))] shadow-[0_10px_26px_rgba(15,122,95,0.12)]"
                    : "border-line bg-white/72"
                }`}
                onClick={() => setActiveStage(isActive ? "" : stage)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => onDrop(stage)}
              >
                <span>{stage}</span>
                <span className="grid size-[30px] min-w-[30px] place-items-center rounded-full bg-brand/10 text-[0.85rem] font-bold text-brand-deep">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {activeStage && (
          <section
            className="min-w-0 animate-rise-fast rounded-[20px] border border-line bg-white/62 p-5 shadow-panel max-sm:px-3 max-sm:py-4"
            id={`stage-panel-${stages.indexOf(activeStage)}`}
            role="tabpanel"
            aria-labelledby={`stage-tab-${stages.indexOf(activeStage)}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => onDrop(activeStage)}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="m-0 mb-1 text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase">
                  Stage candidates
                </p>
                <h2 className="text-[1.2rem]">{activeStage}</h2>
              </div>
              <span className="grid size-[30px] min-w-[30px] place-items-center rounded-full bg-brand/10 text-[0.85rem] font-bold text-brand-deep">
                {candidates.filter((candidate) => candidate.stage === activeStage).length}
              </span>
            </div>
            <div className="grid min-h-[118px] grid-cols-1 gap-3 px-0.5 pt-0.5 pb-1.5 sm:grid-cols-2 xl:grid-cols-4">
              {candidates
                .filter((candidate) => candidate.stage === activeStage)
                .map((candidate) => (
                  <article
                    key={candidate._id}
                    className={`min-w-0 rounded-[15px] border border-line bg-white p-4 shadow-[0_8px_24px_rgba(20,35,28,0.06)] transition-[transform,box-shadow] duration-[180ms] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(20,35,28,0.1)] ${
                      dragging?._id === candidate._id ? "opacity-55" : ""
                    }`}
                    draggable
                    onDragStart={() => setDragging(candidate)}
                    onDragEnd={() => setDragging(null)}
                  >
                    <strong className="font-display">{candidate.name}</strong>
                    <p className="m-0 mt-1 text-muted">{candidate.role}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {candidate.skills.slice(0, 2).map((skill) => (
                        <span key={skill} className="inline-flex items-center rounded-full bg-ink/6 px-2.5 py-1 text-[0.78rem] font-bold text-ink">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <label className="mt-[14px] grid gap-1.5 text-[0.76rem] font-bold text-muted">
                      Move to stage
                      <select
                        className="w-full rounded-[10px] border border-line bg-white px-2.5 py-[9px] text-ink"
                        value={candidate.stage}
                        onChange={(event) =>
                          moveToStage(candidate._id, event.target.value)
                        }
                        onClick={(event) => event.stopPropagation()}
                      >
                        {stages.map((stage) => (
                          <option key={stage} value={stage}>
                            {stage}
                          </option>
                        ))}
                      </select>
                    </label>
                  </article>
                ))}
              {!candidates.some((candidate) => candidate.stage === activeStage) && (
                <p className="col-span-full grid place-items-center rounded-[14px] border border-dashed border-ink/18 p-[26px] text-center text-muted">
                  No candidates in this stage yet.
                </p>
              )}
            </div>
          </section>
        )}
      </section>
    </div>
  );
}

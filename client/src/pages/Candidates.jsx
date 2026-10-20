import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import Modal from "../components/Modal";
import CandidateForm from "../components/CandidateForm";
import StageBadge from "../components/StageBadge";

const panelClass =
  "rounded-[18px] border border-line bg-panel p-[18px] shadow-panel backdrop-blur-[10px]";
const primaryButtonClass =
  "cursor-pointer rounded-xl bg-linear-to-br from-brand to-brand-deep px-4 py-2.5 font-bold text-white shadow-[0_10px_22px_rgba(15,122,95,0.22)] transition duration-150 hover:-translate-y-px";
const ghostButtonClass =
  "cursor-pointer rounded-xl border border-line bg-white px-4 py-2.5 font-bold text-ink transition duration-150 hover:-translate-y-px";
const paginationButtonClass =
  "grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-white text-sm font-semibold text-ink transition hover:border-brand/40 hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-40";

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [stages, setStages] = useState([]);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [list, jobList, stageList] = await Promise.all([
        api.getCandidates({ q, stage, source }),
        api.getJobs(),
        api.getStages(),
      ]);
      setCandidates(list);
      setJobs(jobList);
      setStages(stageList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [q, stage, source]);

  useEffect(() => {
    setPage(1);
  }, [q, stage, source, pageSize]);

  const pageCount = Math.ceil(candidates.length / pageSize);
  const pageCandidates = useMemo(
    () => candidates.slice((page - 1) * pageSize, page * pageSize),
    [candidates, page, pageSize]
  );
  const pageNumbers = useMemo(() => {
    if (!pageCount) return [];
    const firstPage = Math.max(1, Math.min(page - 2, pageCount - 4));
    const visiblePageCount = Math.min(5, pageCount - firstPage + 1);
    return Array.from(
      { length: visiblePageCount },
      (_, index) => firstPage + index
    );
  }, [page, pageCount]);

  useEffect(() => {
    setPage((currentPage) =>
      Math.min(currentPage, Math.max(pageCount, 1))
    );
  }, [pageCount]);

  const countLabel = useMemo(
    () => `${candidates.length} candidate${candidates.length === 1 ? "" : "s"}`,
    [candidates.length]
  );

  async function handleCreate(payload) {
    await api.createCandidate(payload);
    setModal(null);
    await load();
  }

  async function handleUpdate(payload) {
    await api.updateCandidate(selected._id, payload);
    setModal(null);
    setSelected(null);
    await load();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this candidate?")) return;
    await api.deleteCandidate(id);
    setSelected(null);
    await load();
  }

  async function handleAddNote() {
    if (!note.trim() || !selected) return;
    const updated = await api.addNote(selected._id, note.trim());
    setSelected(updated);
    setNote("");
    await load();
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImporting(true);
    setError("");
    setImportResult(null);
    try {
      const result = await api.importExcel(file);
      setImportResult(result);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="grid gap-[18px]">
      <section className="flex items-start justify-between gap-3 max-[960px]:flex-col max-[960px]:items-stretch">
        <div>
          <p className="m-0 mb-2 text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase">
            Talent pool
          </p>
          <h1>Candidates</h1>
          <p className="m-0 max-w-[48ch] leading-[1.55] text-muted">
            {countLabel} matching your filters
          </p>
        </div>
        <div className="flex items-center justify-between gap-3 max-[960px]:flex-col max-[960px]:items-stretch">
          <button className={ghostButtonClass} onClick={() => api.downloadTemplate()}>
            Excel template
          </button>
          <button className={ghostButtonClass} onClick={() => api.exportExcel()}>
            Export Excel
          </button>
          <label
            className={`${ghostButtonClass} inline-flex cursor-pointer items-center ${
              importing ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {importing ? "Importing..." : "Import Excel"}
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              hidden
              disabled={importing}
              onChange={handleImport}
            />
          </label>
          <button className={primaryButtonClass} onClick={() => setModal("create")}>
            Add candidate
          </button>
        </div>
      </section>

      <section className={`${panelClass} grid grid-cols-[1.2fr_1fr] items-start gap-[18px] max-[960px]:grid-cols-1`}>
        <div>
          <h2 className="text-[1.05rem]">Bulk import from Google Form / Excel</h2>
          <p className="m-0 text-muted">
            Download responses as Excel, or use our template. Upload the file and
            candidates are added to the list, pipeline, and dashboard metrics.
          </p>
        </div>
        <ol className="m-0 list-decimal pl-[18px] leading-[1.7] text-muted">
          <li>Download the Excel template (or export Google Form responses)</li>
          <li>Fill rows: Name + Email required; Role, Skills, Stage optional</li>
          <li>Click Import Excel — duplicates by email are skipped</li>
        </ol>
      </section>

      {importResult && (
        <section className={`${panelClass} border-brand/25 bg-brand/6`}>
          <strong className="font-display text-[1.05rem]">{importResult.message}</strong>
          <p className="m-0 text-muted">
            Imported {importResult.imported}
            {importResult.skipped
              ? ` · Skipped ${importResult.skipped} duplicate email(s)`
              : ""}
            {importResult.rowErrors?.length
              ? ` · ${importResult.rowErrors.length} row error(s)`
              : ""}
          </p>
        </section>
      )}

      <section className={`${panelClass} flex flex-wrap items-center justify-between gap-3 p-[14px]`}>
        <input
          className="min-w-[260px] flex-[1_1_260px] rounded-xl border border-line bg-white px-3 py-[11px] text-ink outline-none focus:border-brand"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, role, or skills"
        />
        <select className="w-auto min-w-0 flex-[0_1_180px] rounded-xl border border-line bg-white px-3 py-[11px] text-ink" value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="">All stages</option>
          {stages.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select className="w-auto min-w-0 flex-[0_1_180px] rounded-xl border border-line bg-white px-3 py-[11px] text-ink" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">All sources</option>
          {["LinkedIn", "Referral", "Career Page", "Campus", "Other"].map(
            (item) => (
              <option key={item} value={item}>
                {item}
              </option>
            )
          )}
        </select>
      </section>

      {error && <p className="m-0 text-danger">{error}</p>}
      {loading ? (
        <p className="m-0 text-muted">Loading candidates...</p>
      ) : (
        <section className={`${panelClass} overflow-hidden p-0`}>
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Name", "Role", "Stage", "Source", "Skills", "Exp"].map((heading) => (
                    <th key={heading} className="border-b border-line px-4 py-[14px] text-left align-top text-[0.78rem] font-semibold tracking-[0.08em] text-muted uppercase">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageCandidates.map((candidate) => (
                  <tr
                    key={candidate._id}
                    onClick={() => setSelected(candidate)}
                    className={`cursor-pointer transition-colors hover:bg-brand/5 ${
                      selected?._id === candidate._id ? "bg-brand/5" : ""
                    }`}
                  >
                    <td className="border-b border-line px-4 py-[14px] align-top">
                      <strong>{candidate.name}</strong>
                      <div className="mt-1 text-muted">{candidate.email}</div>
                    </td>
                    <td className="border-b border-line px-4 py-[14px] align-top">{candidate.role}</td>
                    <td className="border-b border-line px-4 py-[14px] align-top">
                      <StageBadge stage={candidate.stage} />
                    </td>
                    <td className="border-b border-line px-4 py-[14px] align-top">{candidate.source}</td>
                    <td className="border-b border-line px-4 py-[14px] align-top">
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.skills.slice(0, 3).map((skill) => (
                          <span key={skill} className="inline-flex items-center rounded-full bg-ink/6 px-2.5 py-1 text-[0.78rem] font-bold text-ink">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="border-b border-line px-4 py-[14px] align-top">{candidate.experienceYears}y</td>
                  </tr>
                ))}
                {!candidates.length && (
                  <tr>
                    <td colSpan="6" className="border-b border-line px-4 py-[14px] text-center text-muted">
                      No candidates found. Try clearing filters or add a new one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              <label htmlFor="candidate-page-size">Rows per page</label>
              <select
                id="candidate-page-size"
                className="rounded-lg border border-line bg-white px-2 py-1.5 text-ink"
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
              >
                {[10, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="ml-2">
                {candidates.length
                  ? `${(page - 1) * pageSize + 1}–${Math.min(
                      page * pageSize,
                      candidates.length
                    )} of ${candidates.length}`
                  : "0 of 0"}
              </span>
            </div>

            <nav className="flex items-center gap-1.5" aria-label="Candidate pages">
              <button
                type="button"
                className={`${paginationButtonClass} w-auto px-3`}
                onClick={() => setPage((currentPage) => currentPage - 1)}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                Previous
              </button>
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={`${paginationButtonClass} ${
                    page === pageNumber
                      ? "bg-white text-ink ring-2 ring-brand hover:bg-brand/5"
                      : ""
                  }`}
                  onClick={() => setPage(pageNumber)}
                  aria-label={`Page ${pageNumber}`}
                  aria-current={page === pageNumber ? "page" : undefined}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                className={`${paginationButtonClass} w-auto px-3`}
                onClick={() => setPage((currentPage) => currentPage + 1)}
                disabled={page >= pageCount}
                aria-label="Next page"
              >
                Next
              </button>
            </nav>
          </div>
        </section>
      )}

      {selected && (
        <section className={`${panelClass} animate-rise`}>
          <div className="flex items-center justify-between gap-3 max-[960px]:flex-col max-[960px]:items-stretch">
            <div>
              <h2>{selected.name}</h2>
              <p className="m-0 text-muted">
                {selected.role} · {selected.email}
              </p>
            </div>
            <div className="flex items-center justify-between gap-3 max-[960px]:flex-col max-[960px]:items-stretch">
              <button
                className={ghostButtonClass}
                onClick={() => setModal("edit")}
              >
                Edit
              </button>
              <button
                className="cursor-pointer rounded-xl bg-danger/8 px-4 py-2.5 font-bold text-danger transition duration-150 hover:-translate-y-px"
                onClick={() => handleDelete(selected._id)}
              >
                Delete
              </button>
            </div>
          </div>

          <div className="my-4 mb-5 grid grid-cols-3 gap-[14px] max-[960px]:grid-cols-1">
            <div>
              <p className="mb-1 text-[0.75rem] tracking-[0.08em] text-muted uppercase">Stage</p>
              <StageBadge stage={selected.stage} />
            </div>
            <div>
              <p className="mb-1 text-[0.75rem] tracking-[0.08em] text-muted uppercase">Source</p>
              <p>{selected.source}</p>
            </div>
            <div>
              <p className="mb-1 text-[0.75rem] tracking-[0.08em] text-muted uppercase">Phone</p>
              <p>{selected.phone || "—"}</p>
            </div>
            <div>
              <p className="mb-1 text-[0.75rem] tracking-[0.08em] text-muted uppercase">Rating</p>
              <p>{selected.rating}/5</p>
            </div>
            <div>
              <p className="mb-1 text-[0.75rem] tracking-[0.08em] text-muted uppercase">Job</p>
              <p>{selected.job?.title || "Unlinked"}</p>
            </div>
            <div>
              <p className="mb-1 text-[0.75rem] tracking-[0.08em] text-muted uppercase">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.skills.map((skill) => (
                  <span key={skill} className="inline-flex items-center rounded-full bg-ink/6 px-2.5 py-1 text-[0.78rem] font-bold text-ink">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2.5 text-base">Notes</h3>
            <div className="flex items-center justify-between gap-3">
              <input
                className="min-w-0 flex-1 rounded-xl border border-line bg-white px-3 py-[11px] text-ink outline-none focus:border-brand"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a hiring note"
              />
              <button className={primaryButtonClass} onClick={handleAddNote}>
                Add
              </button>
            </div>
            <ul className="mt-[14px] grid list-none gap-3 p-0">
              {(selected.notes || []).map((item) => (
                <li key={item._id || item.createdAt} className="border-b border-line py-2.5 last:border-0">
                  <p className="m-0">{item.text}</p>
                  <span className="mt-1 block text-[0.8rem] text-muted">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : ""}
                  </span>
                </li>
              ))}
              {!selected.notes?.length && (
                <li className="text-muted">No notes yet.</li>
              )}
            </ul>
          </div>
        </section>
      )}

      {modal === "create" && (
        <Modal title="Add candidate" onClose={() => setModal(null)} wide>
          <CandidateForm
            stages={stages}
            jobs={jobs}
            onCancel={() => setModal(null)}
            onSubmit={handleCreate}
            submitLabel="Create candidate"
          />
        </Modal>
      )}

      {modal === "edit" && selected && (
        <Modal title="Edit candidate" onClose={() => setModal(null)} wide>
          <CandidateForm
            initial={selected}
            stages={stages}
            jobs={jobs}
            onCancel={() => setModal(null)}
            onSubmit={handleUpdate}
            submitLabel="Update candidate"
          />
        </Modal>
      )}
    </div>
  );
}

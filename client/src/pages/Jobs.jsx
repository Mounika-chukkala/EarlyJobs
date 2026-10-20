import { useEffect, useState } from "react";
import { api } from "../api";
import Modal from "../components/Modal";

const emptyJob = {
  title: "",
  department: "",
  location: "",
  employmentType: "Full-time",
  status: "Open",
  description: "",
};

const panelClass =
  "rounded-[18px] border border-line bg-panel p-[18px] shadow-panel backdrop-blur-[10px]";
const primaryButtonClass =
  "cursor-pointer rounded-xl bg-linear-to-br from-brand to-brand-deep px-4 py-2.5 font-bold text-white shadow-[0_10px_22px_rgba(15,122,95,0.22)] transition duration-150 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60";
const ghostButtonClass =
  "cursor-pointer rounded-xl border border-line bg-white px-4 py-2.5 font-bold text-ink transition duration-150 hover:-translate-y-px";
const fieldClass =
  "w-full rounded-xl border border-line bg-white px-3 py-[11px] text-ink outline-none focus:border-brand";
const labelClass = "grid gap-1.5 text-[0.88rem] font-semibold text-muted";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyJob);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setJobs(await api.getJobs());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createJob(form);
      setOpen(false);
      setForm(emptyJob);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(job) {
    await api.updateJob(job._id, {
      status: job.status === "Open" ? "Closed" : "Open",
    });
    await load();
  }

  async function removeJob(id) {
    if (!confirm("Delete this job?")) return;
    await api.deleteJob(id);
    await load();
  }

  return (
    <div className="grid gap-[18px]">
      <section className="flex items-start justify-between gap-3 max-[960px]:flex-col max-[960px]:items-stretch">
        <div>
          <p className="m-0 mb-2 text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase">
            Openings
          </p>
          <h1>Jobs</h1>
          <p className="m-0 max-w-[48ch] leading-[1.55] text-muted">
            Link candidates to the roles you are hiring for.
          </p>
        </div>
        <button className={primaryButtonClass} onClick={() => setOpen(true)}>
          Add job
        </button>
      </section>

      {error && <p className="m-0 text-danger">{error}</p>}
      {loading ? (
        <p className="m-0 text-muted">Loading jobs...</p>
      ) : (
        <section className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[14px]">
          {jobs.map((job) => (
            <article key={job._id} className={`${panelClass} min-w-0`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-[1.05rem]">{job.title}</h2>
                  <p className="m-0 mt-1 text-muted">
                    {job.department} · {job.location}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.78rem] font-bold ${
                    job.status === "Open"
                      ? "bg-brand/12 text-brand-deep"
                      : "bg-ink/8 text-muted"
                  }`}
                >
                  {job.status}
                </span>
              </div>
              <p className="mt-1 text-muted">{job.description || "No description provided."}</p>
              <p className="mt-1 text-muted">{job.employmentType}</p>
              <div className="flex items-center justify-between gap-3 max-[960px]:flex-col max-[960px]:items-stretch">
                <button className={ghostButtonClass} onClick={() => toggleStatus(job)}>
                  Mark {job.status === "Open" ? "Closed" : "Open"}
                </button>
                <button className="cursor-pointer rounded-xl bg-danger/8 px-4 py-2.5 font-bold text-danger transition duration-150 hover:-translate-y-px" onClick={() => removeJob(job._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
          {!jobs.length && (
            <p className="m-0 text-muted">No jobs yet. Create your first opening.</p>
          )}
        </section>
      )}

      {open && (
        <Modal title="Add job" onClose={() => setOpen(false)}>
          <form className="grid grid-cols-2 gap-3 max-[960px]:grid-cols-1" onSubmit={handleSubmit}>
            <label className={`${labelClass} col-span-full`}>
              Title
              <input
                className={fieldClass}
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label className={labelClass}>
              Department
              <input
                className={fieldClass}
                required
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
              />
            </label>
            <label className={labelClass}>
              Location
              <input
                className={fieldClass}
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </label>
            <label className={labelClass}>
              Employment type
              <select className={fieldClass}
                value={form.employmentType}
                onChange={(e) =>
                  setForm({ ...form, employmentType: e.target.value })
                }
              >
                {["Full-time", "Part-time", "Contract", "Internship"].map(
                  (type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  )
                )}
              </select>
            </label>
            <label className={labelClass}>
              Status
              <select className={fieldClass}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </label>
            <label className={`${labelClass} col-span-full`}>
              Description
              <textarea
                className={fieldClass}
                rows="4"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>
            <div className="col-span-full flex items-center justify-between gap-3 max-[960px]:flex-col max-[960px]:items-stretch">
              <button
                type="button"
                className={ghostButtonClass}
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className={primaryButtonClass} disabled={saving}>
                {saving ? "Saving..." : "Create job"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

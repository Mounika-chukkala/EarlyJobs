import { useState } from "react";

const empty = {
  name: "",
  email: "",
  phone: "",
  role: "",
  experienceYears: 0,
  skills: "",
  stage: "Applied",
  source: "Career Page",
  job: "",
  rating: 0,
  resumeUrl: "",
};

const fieldClass =
  "w-full rounded-xl border border-line bg-white px-3 py-[11px] text-ink outline-none focus:border-brand";
const labelClass =
  "grid gap-1.5 text-[0.88rem] font-semibold text-muted";

export default function CandidateForm({
  initial,
  stages,
  jobs,
  onSubmit,
  onCancel,
  submitLabel = "Save candidate",
}) {
  const [form, setForm] = useState({
    ...empty,
    ...initial,
    skills: Array.isArray(initial?.skills)
      ? initial.skills.join(", ")
      : initial?.skills || "",
    job: initial?.job?._id || initial?.job || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        experienceYears: Number(form.experienceYears) || 0,
        rating: Number(form.rating) || 0,
        job: form.job || null,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="grid grid-cols-2 gap-3 max-[960px]:grid-cols-1" onSubmit={handleSubmit}>
      <label className={labelClass}>
        Full name
        <input
          className={fieldClass}
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Candidate name"
        />
      </label>
      <label className={labelClass}>
        Email
        <input
          className={fieldClass}
          required
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="name@email.com"
        />
      </label>
      <label className={labelClass}>
        Phone
        <input
          className={fieldClass}
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="+91 ..."
        />
      </label>
      <label className={labelClass}>
        Role applied
        <input
          className={fieldClass}
          required
          value={form.role}
          onChange={(e) => update("role", e.target.value)}
          placeholder="Full Stack Developer Intern"
        />
      </label>
      <label className={labelClass}>
        Experience (years)
        <input
          className={fieldClass}
          type="number"
          min="0"
          step="0.5"
          value={form.experienceYears}
          onChange={(e) => update("experienceYears", e.target.value)}
        />
      </label>
      <label className={labelClass}>
        Rating
        <input
          className={fieldClass}
          type="number"
          min="0"
          max="5"
          step="1"
          value={form.rating}
          onChange={(e) => update("rating", e.target.value)}
        />
      </label>
      <label className={labelClass}>
        Stage
        <select className={fieldClass} value={form.stage} onChange={(e) => update("stage", e.target.value)}>
          {stages.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Source
        <select className={fieldClass} value={form.source} onChange={(e) => update("source", e.target.value)}>
          {["LinkedIn", "Referral", "Career Page", "Campus", "Other"].map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </label>
      <label className={`${labelClass} col-span-full`}>
        Linked job
        <select className={fieldClass} value={form.job} onChange={(e) => update("job", e.target.value)}>
          <option value="">No job linked</option>
          {jobs.map((job) => (
            <option key={job._id} value={job._id}>
              {job.title} · {job.department}
            </option>
          ))}
        </select>
      </label>
      <label className={`${labelClass} col-span-full`}>
        Skills (comma separated)
        <input
          className={fieldClass}
          value={form.skills}
          onChange={(e) => update("skills", e.target.value)}
          placeholder="React, Node.js, MongoDB"
        />
      </label>
      <label className={`${labelClass} col-span-full`}>
        Resume / profile URL
        <input
          className={fieldClass}
          value={form.resumeUrl}
          onChange={(e) => update("resumeUrl", e.target.value)}
          placeholder="https://"
        />
      </label>

      {error && <p className="col-span-full m-0 text-danger">{error}</p>}

      <div className="col-span-full flex items-center justify-between gap-3 max-[960px]:flex-col max-[960px]:items-stretch">
        <button
          type="button"
          className="cursor-pointer rounded-xl border border-line bg-white px-4 py-2.5 font-bold text-ink transition duration-150 hover:-translate-y-px"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="cursor-pointer rounded-xl bg-linear-to-br from-brand to-brand-deep px-4 py-2.5 font-bold text-white shadow-[0_10px_22px_rgba(15,122,95,0.22)] transition duration-150 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
          disabled={saving}
        >
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

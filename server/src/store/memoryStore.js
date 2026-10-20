import { randomUUID } from "crypto";
import { STAGES } from "../constants/stages.js";
import { jobsData, candidatesData } from "../data/sampleData.js";

const state = {
  jobs: [],
  candidates: [],
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function populateJob(candidate) {
  const job = candidate.job
    ? state.jobs.find((item) => item._id === candidate.job) || null
    : null;
  return {
    ...clone(candidate),
    job: job
      ? {
          _id: job._id,
          title: job.title,
          department: job.department,
          location: job.location,
          employmentType: job.employmentType,
        }
      : null,
  };
}

function parseSkills(skills) {
  if (Array.isArray(skills)) {
    return skills.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export const memoryStore = {
  async seed({ clear = true } = {}) {
    if (clear) {
      state.jobs = [];
      state.candidates = [];
    }
    if (state.jobs.length && !clear) {
      return { jobs: state.jobs.length, candidates: state.candidates.length };
    }

    const now = new Date().toISOString();
    state.jobs = jobsData.map((job) => ({
      ...job,
      _id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    }));

    const jobByTitle = Object.fromEntries(
      state.jobs.map((job) => [job.title, job._id])
    );

    state.candidates = candidatesData.map((candidate) => ({
      ...clone(candidate),
      _id: randomUUID(),
      job: jobByTitle[candidate.role] || null,
      notes: (candidate.notes || []).map((note) => ({
        _id: randomUUID(),
        text: note.text,
        createdAt: now,
      })),
      createdAt: now,
      updatedAt: now,
    }));

    return { jobs: state.jobs.length, candidates: state.candidates.length };
  },

  async listJobs() {
    return clone(state.jobs).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },

  async createJob(payload) {
    const now = new Date().toISOString();
    const job = {
      title: payload.title,
      department: payload.department,
      location: payload.location,
      employmentType: payload.employmentType || "Full-time",
      status: payload.status || "Open",
      description: payload.description || "",
      _id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    state.jobs.unshift(job);
    return clone(job);
  },

  async updateJob(id, payload) {
    const index = state.jobs.findIndex((job) => job._id === id);
    if (index === -1) return null;
    state.jobs[index] = {
      ...state.jobs[index],
      ...payload,
      _id: id,
      updatedAt: new Date().toISOString(),
    };
    return clone(state.jobs[index]);
  },

  async deleteJob(id) {
    const before = state.jobs.length;
    state.jobs = state.jobs.filter((job) => job._id !== id);
    state.candidates = state.candidates.map((candidate) =>
      candidate.job === id ? { ...candidate, job: null } : candidate
    );
    return before !== state.jobs.length;
  },

  async listCandidates({ q, stage, source, job } = {}) {
    let results = state.candidates.map(populateJob);

    if (stage && STAGES.includes(stage)) {
      results = results.filter((item) => item.stage === stage);
    }
    if (source) results = results.filter((item) => item.source === source);
    if (job) results = results.filter((item) => item.job?._id === job);

    if (q?.trim()) {
      const term = q.trim().toLowerCase();
      results = results.filter((item) => {
        const haystack = [
          item.name,
          item.email,
          item.role,
          ...(item.skills || []),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(term);
      });
    }

    return results.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
  },

  async getCandidate(id) {
    const candidate = state.candidates.find((item) => item._id === id);
    return candidate ? populateJob(candidate) : null;
  },

  async createCandidate(payload) {
    const now = new Date().toISOString();
    const notes = Array.isArray(payload.notes)
      ? payload.notes.map((note) => ({
          _id: randomUUID(),
          text: typeof note === "string" ? note : note.text,
          createdAt: now,
        }))
      : [];

    let jobId = payload.job || null;
    if (!jobId && payload.jobTitle) {
      const match = state.jobs.find(
        (job) =>
          job.title.toLowerCase() === String(payload.jobTitle).toLowerCase()
      );
      jobId = match?._id || null;
    }

    const candidate = {
      name: payload.name,
      email: String(payload.email || "").toLowerCase(),
      phone: payload.phone || "",
      role: payload.role,
      experienceYears: Number(payload.experienceYears) || 0,
      skills: parseSkills(payload.skills),
      stage: STAGES.includes(payload.stage) ? payload.stage : "Applied",
      source: payload.source || "Career Page",
      job: jobId,
      resumeUrl: payload.resumeUrl || "",
      notes,
      rating: Number(payload.rating) || 0,
      _id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    state.candidates.unshift(candidate);
    return populateJob(candidate);
  },

  async bulkCreateCandidates(payloads) {
    const created = [];
    const skipped = [];

    for (const payload of payloads) {
      const email = String(payload.email || "").toLowerCase();
      const exists = state.candidates.some((c) => c.email === email);
      if (exists) {
        skipped.push({ email, reason: "Email already exists", row: payload._row });
        continue;
      }
      created.push(await this.createCandidate(payload));
    }

    return { created, skipped };
  },

  async updateCandidate(id, payload) {
    const index = state.candidates.findIndex((item) => item._id === id);
    if (index === -1) return null;

    const next = {
      ...state.candidates[index],
      ...payload,
      _id: id,
      updatedAt: new Date().toISOString(),
    };

    if (payload.skills !== undefined) next.skills = parseSkills(payload.skills);
    if (payload.job === "") next.job = null;
    if (payload.email) next.email = String(payload.email).toLowerCase();

    state.candidates[index] = next;
    return populateJob(next);
  },

  async updateStage(id, stage) {
    if (!STAGES.includes(stage)) {
      const error = new Error("Invalid stage");
      error.status = 400;
      throw error;
    }
    return this.updateCandidate(id, { stage });
  },

  async addNote(id, text) {
    const index = state.candidates.findIndex((item) => item._id === id);
    if (index === -1) return null;
    const note = {
      _id: randomUUID(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    state.candidates[index].notes.unshift(note);
    state.candidates[index].updatedAt = new Date().toISOString();
    return populateJob(state.candidates[index]);
  },

  async deleteCandidate(id) {
    const before = state.candidates.length;
    state.candidates = state.candidates.filter((item) => item._id !== id);
    return before !== state.candidates.length;
  },

  async metrics() {
    const byStage = STAGES.map((stage) => ({
      stage,
      count: state.candidates.filter((item) => item.stage === stage).length,
    }));

    const sourceMap = {};
    for (const candidate of state.candidates) {
      sourceMap[candidate.source] = (sourceMap[candidate.source] || 0) + 1;
    }

    const bySource = Object.entries(sourceMap)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    const recent = state.candidates
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
      .map((candidate) => {
        const populated = populateJob(candidate);
        return {
          _id: populated._id,
          name: populated.name,
          role: populated.role,
          stage: populated.stage,
          source: populated.source,
          createdAt: populated.createdAt,
          job: populated.job ? { title: populated.job.title } : null,
        };
      });

    const activePipeline = byStage
      .filter((item) => !["Hired", "Rejected"].includes(item.stage))
      .reduce((sum, item) => sum + item.count, 0);

    return {
      totalCandidates: state.candidates.length,
      openJobs: state.jobs.filter((job) => job.status === "Open").length,
      hiredCount: state.candidates.filter((item) => item.stage === "Hired")
        .length,
      activePipeline,
      byStage,
      bySource,
      recent,
    };
  },
};

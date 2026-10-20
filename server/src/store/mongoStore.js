import { Candidate } from "../models/Candidate.js";
import { Job } from "../models/Job.js";
import { STAGES } from "../constants/stages.js";
import { jobsData, candidatesData } from "../data/sampleData.js";

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

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const mongoStore = {
  async seed({ clear = true } = {}) {
    if (clear) {
      await Candidate.deleteMany({});
      await Job.deleteMany({});
    }

    const existingJobs = await Job.countDocuments();
    if (existingJobs > 0 && !clear) {
      return { jobs: existingJobs, candidates: await Candidate.countDocuments() };
    }

    const jobs = await Job.insertMany(jobsData);
    const jobByTitle = Object.fromEntries(jobs.map((job) => [job.title, job._id]));
    const candidates = candidatesData.map((candidate) => ({
      ...candidate,
      job: jobByTitle[candidate.role] || null,
    }));
    await Candidate.insertMany(candidates);
    return { jobs: jobs.length, candidates: candidates.length };
  },

  async listJobs() {
    return Job.find().sort({ createdAt: -1 });
  },

  async createJob(payload) {
    return Job.create(payload);
  },

  async updateJob(id, payload) {
    return Job.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  },

  async deleteJob(id) {
    const job = await Job.findByIdAndDelete(id);
    if (!job) return false;
    await Candidate.updateMany({ job: id }, { $set: { job: null } });
    return true;
  },

  async listCandidates({ q, stage, source, job } = {}) {
    const filter = {};
    if (stage && STAGES.includes(stage)) filter.stage = stage;
    if (source) filter.source = source;
    if (job) filter.job = job;

    if (q?.trim()) {
      const term = q.trim();
      filter.$or = [
        { name: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
        { role: { $regex: term, $options: "i" } },
        { skills: { $regex: term, $options: "i" } },
      ];
    }

    return Candidate.find(filter)
      .populate("job", "title department location")
      .sort({ updatedAt: -1 });
  },

  async getCandidate(id) {
    return Candidate.findById(id).populate(
      "job",
      "title department location employmentType"
    );
  },

  async createCandidate(payload) {
    let jobId = payload.job || null;
    if (!jobId && payload.jobTitle) {
      const match = await Job.findOne({
        title: new RegExp(`^${escapeRegex(payload.jobTitle)}$`, "i"),
      });
      jobId = match?._id || null;
    }

    const candidate = await Candidate.create({
      ...payload,
      skills: parseSkills(payload.skills),
      job: jobId,
      notes: Array.isArray(payload.notes) ? payload.notes : [],
    });
    return candidate.populate("job", "title department location");
  },

  async bulkCreateCandidates(payloads) {
    const created = [];
    const skipped = [];

    for (const payload of payloads) {
      const email = String(payload.email || "").toLowerCase();
      const exists = await Candidate.findOne({ email });
      if (exists) {
        skipped.push({ email, reason: "Email already exists", row: payload._row });
        continue;
      }
      created.push(await this.createCandidate(payload));
    }

    return { created, skipped };
  },

  async updateCandidate(id, payload) {
    const next = { ...payload };
    if (next.skills !== undefined) next.skills = parseSkills(next.skills);
    if (next.job === "") next.job = null;

    return Candidate.findByIdAndUpdate(id, next, {
      new: true,
      runValidators: true,
    }).populate("job", "title department location");
  },

  async updateStage(id, stage) {
    if (!STAGES.includes(stage)) {
      const error = new Error("Invalid stage");
      error.status = 400;
      throw error;
    }
    return Candidate.findByIdAndUpdate(
      id,
      { stage },
      { new: true, runValidators: true }
    ).populate("job", "title department location");
  },

  async addNote(id, text) {
    const candidate = await Candidate.findById(id);
    if (!candidate) return null;
    candidate.notes.unshift({ text: text.trim() });
    await candidate.save();
    return candidate.populate("job", "title department location");
  },

  async deleteCandidate(id) {
    const candidate = await Candidate.findByIdAndDelete(id);
    return Boolean(candidate);
  },

  async metrics() {
    const [totalCandidates, openJobs, hiredCount, stageAgg, sourceAgg, recent] =
      await Promise.all([
        Candidate.countDocuments(),
        Job.countDocuments({ status: "Open" }),
        Candidate.countDocuments({ stage: "Hired" }),
        Candidate.aggregate([{ $group: { _id: "$stage", count: { $sum: 1 } } }]),
        Candidate.aggregate([{ $group: { _id: "$source", count: { $sum: 1 } } }]),
        Candidate.find()
          .populate("job", "title")
          .sort({ createdAt: -1 })
          .limit(6)
          .select("name role stage source createdAt job"),
      ]);

    const byStage = STAGES.map((stage) => ({
      stage,
      count: stageAgg.find((item) => item._id === stage)?.count || 0,
    }));

    const bySource = sourceAgg
      .map((item) => ({ source: item._id || "Other", count: item.count }))
      .sort((a, b) => b.count - a.count);

    const activePipeline = byStage
      .filter((item) => !["Hired", "Rejected"].includes(item.stage))
      .reduce((sum, item) => sum + item.count, 0);

    return {
      totalCandidates,
      openJobs,
      hiredCount,
      activePipeline,
      byStage,
      bySource,
      recent,
    };
  },
};

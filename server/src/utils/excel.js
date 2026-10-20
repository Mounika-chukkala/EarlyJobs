import * as XLSX from "xlsx";
import { STAGES } from "../constants/stages.js";

const SOURCES = ["LinkedIn", "Referral", "Career Page", "Campus", "Other"];

/** Canonical columns used in template + export */
export const EXCEL_COLUMNS = [
  "name",
  "email",
  "phone",
  "role",
  "experienceYears",
  "skills",
  "stage",
  "source",
  "rating",
  "resumeUrl",
  "jobTitle",
  "notes",
];

/** Map common Google Form / spreadsheet headers → our fields */
const HEADER_ALIASES = {
  name: ["name", "full name", "candidate name", "applicant name", "fullname"],
  email: ["email", "email address", "e-mail", "mail"],
  phone: ["phone", "phone number", "mobile", "mobile number", "contact", "contact number"],
  role: [
    "role",
    "position",
    "job role",
    "applied for",
    "role applied",
    "designation",
    "position applied",
  ],
  experienceYears: [
    "experienceyears",
    "experience",
    "years of experience",
    "experience (years)",
    "exp",
    "total experience",
  ],
  skills: ["skills", "skill set", "technical skills", "tech stack"],
  stage: ["stage", "hiring stage", "status", "application status"],
  source: ["source", "application source", "how did you hear", "referral source"],
  rating: ["rating", "score", "candidate rating"],
  resumeUrl: [
    "resumeurl",
    "resume",
    "resume url",
    "resume link",
    "cv",
    "cv link",
    "linkedin",
    "linkedin url",
    "portfolio",
  ],
  jobTitle: ["jobtitle", "job title", "job", "opening", "linked job"],
  notes: ["notes", "note", "comments", "comment", "remark", "remarks"],
};

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function buildHeaderMap(headers) {
  const map = {};
  for (const header of headers) {
    const normalized = normalizeHeader(header);
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.includes(normalized) && map[field] === undefined) {
        map[field] = header;
      }
    }
  }
  return map;
}

function cell(row, headerMap, field) {
  const key = headerMap[field];
  if (!key) return "";
  const value = row[key];
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function normalizeStage(value) {
  if (!value) return "Applied";
  const match = STAGES.find(
    (stage) => stage.toLowerCase() === value.toLowerCase()
  );
  return match || "Applied";
}

function normalizeSource(value) {
  if (!value) return "Career Page";
  const match = SOURCES.find(
    (source) => source.toLowerCase() === value.toLowerCase()
  );
  return match || "Other";
}

/**
 * Parse an uploaded Excel/CSV buffer into candidate payloads.
 */
export function parseCandidatesFromExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw Object.assign(new Error("Excel file has no sheets"), { status: 400 });
  }

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    defval: "",
    raw: false,
  });

  if (!rows.length) {
    throw Object.assign(new Error("Excel sheet is empty"), { status: 400 });
  }

  const headerMap = buildHeaderMap(Object.keys(rows[0]));
  if (!headerMap.name || !headerMap.email) {
    throw Object.assign(
      new Error(
        "Excel must include Name and Email columns (Google Form exports are supported)."
      ),
      { status: 400 }
    );
  }

  const candidates = [];
  const errors = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // header is row 1
    const name = cell(row, headerMap, "name");
    const email = cell(row, headerMap, "email");

    if (!name && !email) return;

    if (!name || !email) {
      errors.push({
        row: rowNumber,
        message: "Name and Email are required",
      });
      return;
    }

    const role =
      cell(row, headerMap, "role") ||
      cell(row, headerMap, "jobTitle") ||
      "General Application";

    const notesText = cell(row, headerMap, "notes");
    const experienceRaw = cell(row, headerMap, "experienceYears");
    const ratingRaw = cell(row, headerMap, "rating");

    candidates.push({
      name,
      email,
      phone: cell(row, headerMap, "phone"),
      role,
      experienceYears: experienceRaw === "" ? 0 : Number(experienceRaw) || 0,
      skills: cell(row, headerMap, "skills"),
      stage: normalizeStage(cell(row, headerMap, "stage")),
      source: normalizeSource(cell(row, headerMap, "source")),
      rating: ratingRaw === "" ? 0 : Math.min(5, Math.max(0, Number(ratingRaw) || 0)),
      resumeUrl: cell(row, headerMap, "resumeUrl"),
      jobTitle: cell(row, headerMap, "jobTitle") || role,
      notes: notesText ? [{ text: notesText }] : [],
      _row: rowNumber,
    });
  });

  return { candidates, errors, headerMap };
}

export function buildTemplateWorkbook() {
  const sample = [
    {
      name: "Aisha Khan",
      email: "aisha.khan@email.com",
      phone: "+91 90000 11111",
      role: "Full Stack Developer Intern",
      experienceYears: 1,
      skills: "React, Node.js, MongoDB",
      stage: "Applied",
      source: "Career Page",
      rating: 0,
      resumeUrl: "https://linkedin.com/in/example",
      jobTitle: "Full Stack Developer Intern",
      notes: "Imported from Google Form",
    },
  ];

  const sheet = XLSX.utils.json_to_sheet(sample, { header: EXCEL_COLUMNS });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Candidates");

  // Help sheet for Google Form mapping
  const help = XLSX.utils.aoa_to_sheet([
    ["Column", "Required?", "Accepted alternate headers"],
    ["name", "Yes", "Full Name, Candidate Name, Applicant Name"],
    ["email", "Yes", "Email Address, E-mail"],
    ["phone", "No", "Phone Number, Mobile, Contact"],
    ["role", "No*", "Position, Applied For, Designation (*uses jobTitle if empty)"],
    ["experienceYears", "No", "Experience, Years of Experience"],
    ["skills", "No", "Skill Set, Technical Skills (comma-separated)"],
    ["stage", "No", "Status — Applied/Screening/Interview/Offer/Hired/Rejected"],
    ["source", "No", "LinkedIn, Referral, Career Page, Campus, Other"],
    ["rating", "No", "0–5"],
    ["resumeUrl", "No", "Resume Link, CV, LinkedIn URL"],
    ["jobTitle", "No", "Job Title — links to an existing job if title matches"],
    ["notes", "No", "Comments, Remarks"],
    [],
    ["Tip", "", "Export Google Form responses as .xlsx and upload directly."],
  ]);
  XLSX.utils.book_append_sheet(workbook, help, "Column Guide");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

export function buildExportWorkbook(candidates) {
  const rows = candidates.map((c) => ({
    name: c.name,
    email: c.email,
    phone: c.phone || "",
    role: c.role,
    experienceYears: c.experienceYears ?? 0,
    skills: Array.isArray(c.skills) ? c.skills.join(", ") : c.skills || "",
    stage: c.stage,
    source: c.source,
    rating: c.rating ?? 0,
    resumeUrl: c.resumeUrl || "",
    jobTitle: c.job?.title || "",
    notes: Array.isArray(c.notes)
      ? c.notes.map((n) => n.text).join(" | ")
      : "",
  }));

  const sheet = XLSX.utils.json_to_sheet(rows, { header: EXCEL_COLUMNS });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Candidates");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

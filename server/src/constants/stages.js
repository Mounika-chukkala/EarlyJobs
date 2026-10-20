export const STAGES = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Hired",
  "Rejected",
];

export const ACTIVE_STAGES = STAGES.filter(
  (stage) => stage !== "Hired" && stage !== "Rejected"
);

const STAGE_CLASS = {
  Applied: "bg-brand/10 text-brand-deep",
  Screening: "bg-brand/10 text-brand-deep",
  Interview: "bg-accent/14 text-stage-gold",
  Offer: "bg-accent/14 text-stage-gold",
  Hired: "bg-brand/16 text-brand-deep",
  Rejected: "bg-danger/10 text-danger",
};

export default function StageBadge({ stage }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.78rem] font-bold ${
        STAGE_CLASS[stage] || "bg-brand/10 text-brand-deep"
      }`}
    >
      {stage}
    </span>
  );
}

export default function Modal({ title, onClose, children, wide = false }) {
  return (
    <div
      className="fixed inset-0 z-40 grid animate-fade place-items-center bg-[rgba(12,24,18,0.45)] p-5"
      onClick={onClose}
    >
      <div
        className={`scrollbar-none max-h-[90vh] w-full overflow-auto rounded-[20px] bg-panel-solid p-[18px] shadow-[0_24px_60px_rgba(0,0,0,0.2)] animate-rise ${
          wide ? "max-w-[760px]" : "max-w-[520px]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-[14px] flex items-center justify-between">
          <h2>{title}</h2>
          <button
            type="button"
            className="grid size-9 cursor-pointer place-items-center rounded-xl bg-ink/5 text-[1.3rem] transition duration-150 hover:-translate-y-px"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

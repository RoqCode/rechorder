import type { ReactNode } from "react";

type CollapsibleSectionProps = {
  index: string;
  title: string;
  readout?: ReactNode;
  actions?: ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function CollapsibleSection({
  index,
  title,
  readout,
  actions,
  isCollapsed,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <section className="border-b border-[var(--rule)] py-9">
      <header className={`${isCollapsed ? "" : "mb-6"} flex flex-wrap items-baseline justify-between gap-4`}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!isCollapsed}
          aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${title}`}
          className="group flex cursor-pointer flex-wrap items-baseline gap-[10px] text-left"
        >
          <span className={`-ml-[2px] font-mono text-[13px] leading-none transition-colors duration-[var(--t)] group-hover:text-[var(--text)] ${
            isCollapsed ? "text-[var(--accent)]" : "text-[var(--text-2)]"
          }`}>
            {isCollapsed ? "▸" : "▾"}
          </span>
          <span className="font-mono text-[10px] uppercase leading-none tracking-[0.10em] text-[var(--text-2)]">
            {index}
          </span>
          <span className="font-mono text-[10px] uppercase leading-none tracking-[0.10em] text-[var(--text-3)]">
            {title}
          </span>
          {readout ? (
            <span className="font-mono text-[10px] uppercase leading-none tracking-[0.10em] text-[var(--text-3)]">
              {readout}
            </span>
          ) : null}
        </button>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {actions}
        </div>
      </header>
      {isCollapsed ? null : children}
    </section>
  );
}

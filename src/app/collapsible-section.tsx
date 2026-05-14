import type { ReactNode } from "react";

type CollapsibleSectionProps = {
  index: string;
  title: string;
  readout?: ReactNode;
  actions?: ReactNode;
  hideActionsWhenCollapsed?: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function CollapsibleSection({
  index,
  title,
  readout,
  actions,
  hideActionsWhenCollapsed = false,
  isCollapsed,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  const shouldShowActions = actions && !(isCollapsed && hideActionsWhenCollapsed);

  return (
    <section className="border-b border-[var(--rule)] py-7 sm:py-9">
      <header className={`${isCollapsed ? "" : "mb-5 sm:mb-6"} grid gap-3 sm:flex sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-4`}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!isCollapsed}
          aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${title}`}
          className="group flex cursor-pointer flex-wrap items-baseline gap-[10px] text-left"
        >
          <span className={`-ml-[2px] inline-flex w-[10px] shrink-0 justify-center font-mono text-[10px] leading-none transition-colors duration-[var(--t)] group-hover:text-[var(--text)] ${
            isCollapsed ? "text-[var(--accent)]" : "text-[var(--text-2)]"
          }`}>
            {isCollapsed ? "▶" : "▼"}
          </span>
          <span className="font-mono text-[10px] uppercase leading-none tracking-[0.10em] text-[var(--text-2)]">
            {index}
          </span>
          <span className="font-mono text-[10px] uppercase leading-none tracking-[0.10em] text-[var(--text-3)]">
            {title}
          </span>
          {readout ? (
            <span className="font-mono text-[10px] uppercase leading-[1.35] tracking-[0.10em] text-[var(--text-3)]">
              {readout}
            </span>
          ) : null}
        </button>
        {shouldShowActions ? (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:justify-end">
            {actions}
          </div>
        ) : null}
      </header>
      {isCollapsed ? null : children}
    </section>
  );
}

"use client";

import { PROGRESSION_TEMPLATES, type ProgressionTemplate } from "@/lib/music/progression-templates";
import { CollapsibleSection } from "./collapsible-section";

type ProgressionTemplatesProps = {
  isCollapsed: boolean;
  onApplyTemplate: (template: ProgressionTemplate) => void;
  onToggleCollapse: () => void;
};

export function ProgressionTemplates({ isCollapsed, onApplyTemplate, onToggleCollapse }: ProgressionTemplatesProps) {
  return (
    <CollapsibleSection
      index="03"
      title="Templates"
      readout="Replace current progression"
      isCollapsed={isCollapsed}
      onToggle={onToggleCollapse}
    >
      <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-5">
        {PROGRESSION_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onApplyTemplate(template)}
            className="group min-h-[104px] cursor-pointer border-[0.5px] border-[var(--hair)] bg-[var(--surface)] p-3 text-left transition duration-[var(--t)] hover:border-[var(--accent)] hover:bg-[var(--accent-bg)]"
            style={{ borderRadius: "var(--radius)" }}
          >
            <div className="font-mono text-[10px] uppercase leading-none tracking-[0.12em] text-[var(--text-3)] transition-colors duration-[var(--t)] group-hover:text-[var(--accent)]">
              {template.degrees.map((degree) => String(degree)).join(" · ")}
            </div>
            <div className="mt-4 text-[24px] font-medium leading-[0.95] tracking-[-0.02em] text-[var(--text)]">
              {template.name}
            </div>
            <div className="mt-3 font-mono text-[10px] uppercase leading-[1.35] tracking-[0.10em] text-[var(--text-3)]">
              {template.description}
            </div>
          </button>
        ))}
      </div>
    </CollapsibleSection>
  );
}

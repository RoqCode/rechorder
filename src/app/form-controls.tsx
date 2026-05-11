import type { ReactNode } from "react";

type ControlGroupProps = {
  label: string;
  children: ReactNode;
};

export function ControlGroup({ label, children }: ControlGroupProps) {
  return (
    <label className="grid gap-1">
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#6f675b]">{label}</span>
      {children}
    </label>
  );
}

type SegmentedControlProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="box-border inline-flex h-9 border-2 border-[#171512]">
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            className={`h-full whitespace-nowrap px-2.5 font-mono text-[9px] uppercase leading-none tracking-normal transition ${
              isSelected ? "bg-[#171512] text-[#fffaf0]" : "bg-[#fffaf0] hover:bg-white"
            }`}
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

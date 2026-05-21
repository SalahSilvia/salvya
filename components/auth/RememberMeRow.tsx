"use client";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint: string;
  disabled?: boolean;
};

export function RememberMeRow({ checked, onChange, label, hint, disabled }: Props) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-xl border border-neutral-100 bg-neutral-50/50 px-3.5 py-3 transition-colors hover:bg-neutral-50/90 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 rounded border-neutral-300 text-blue-600 focus:ring-blue-500/25"
      />
      <span className="min-w-0 text-left">
        <span className="block text-[13px] font-semibold text-neutral-800">{label}</span>
        <span className="mt-0.5 block text-[12px] leading-relaxed text-neutral-500">{hint}</span>
      </span>
    </label>
  );
}

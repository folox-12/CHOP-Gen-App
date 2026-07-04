type Props = {
  label: string;
  value?: string;
  onChange: (value: number) => void;
};

const inputClass =
  "inline-block py-0.5 px-2 outline-gray-400 outline-1 rounded-md w-20 text-base text-gray-600 font-bold";

export const NumberSetting = ({ label, value, onChange }: Props) => (
  <label className="flex items-center gap-2">
    <span className="text-sm min-w-48">{label}:</span>
    <input
      type="number"
      min="0"
      className={inputClass}
      value={Number(value)}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  </label>
);

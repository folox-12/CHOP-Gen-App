import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "@mdi/react";
import { mdiChevronDown } from "@mdi/js";

export type SelectOption = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
};

const triggerClass =
  "w-full py-1 px-3 rounded-md outline-1 outline-gray-400 bg-white text-base text-gray-700 transition-all hover:outline-2 hover:outline-blue-400";

export const Select = ({
  value,
  options,
  onChange,
  placeholder = "",
  className = "",
  editable = false,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectOption = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keyup", handleKey);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keyup", handleKey);
    };
  }, [isOpen]);

  const selected = options.find((el) => el.value === value);

  const visibleOptions = useMemo(() => {
    if (!editable || !value) return options;
    const query = value.toLowerCase();
    return options.filter((el) => el.label.toLowerCase().includes(query));
  }, [editable, value, options]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {editable ? (
        <div className={`${triggerClass} flex items-center gap-2`}>
          <input
            ref={inputRef}
            className="w-full bg-transparent outline-none truncate"
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              onChange(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />
          <span
            className="shrink-0 cursor-pointer flex"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <Icon
              path={mdiChevronDown}
              size={0.8}
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`${triggerClass} flex items-center justify-between gap-2 cursor-pointer`}
        >
          <span className={selected ? "truncate" : "truncate text-gray-400"}>
            {selected ? selected.label : placeholder}
          </span>
          <Icon
            path={mdiChevronDown}
            size={0.8}
            className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      )}

      {isOpen && (editable ? visibleOptions.length > 0 : true) && (
        <ul className="absolute z-30 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white shadow-xl outline-1 outline-gray-200 py-1">
          {!editable && visibleOptions.length === 0 && (
            <li className="px-3 py-1.5 text-gray-400">—</li>
          )}
          {visibleOptions.map((option) => (
            <li
              key={option.value}
              onClick={() => selectOption(option.value)}
              className={`px-3 py-1.5 cursor-pointer transition-colors ${
                option.value === value
                  ? "bg-cyan-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

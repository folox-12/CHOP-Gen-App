import { useEffect, useRef, useState } from "react";
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
};

export const Select = ({
  value,
  options,
  onChange,
  placeholder = "",
  className = "",
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          flex items-center justify-between gap-2 w-full
          py-1 px-3 rounded-md
          outline-1 outline-gray-400 bg-white
          text-base text-gray-700 cursor-pointer
          transition-all hover:outline-2 hover:outline-blue-400
        "
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

      {isOpen && (
        <ul className="absolute z-30 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white shadow-xl outline-1 outline-gray-200 py-1">
          {options.length === 0 && (
            <li className="px-3 py-1.5 text-gray-400">—</li>
          )}
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
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

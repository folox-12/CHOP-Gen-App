type Props = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  active?: boolean;
};

export const BearIcon = ({
  size = 40,
  className,
  style,
  active = true,
}: Props) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    className={className}
    style={{ overflow: "visible", ...style }}
    aria-hidden
  >
    <g stroke="#cbd5e1" strokeWidth="1.5">
      <rect x="21" y="47" width="7" height="13" rx="3.5" fill="#e2e8f0" />
      <rect x="40" y="47" width="7" height="13" rx="3.5" fill="#e2e8f0" />
    </g>

    <circle
      cx="8"
      cy="37"
      r="3"
      fill="#ffffff"
      stroke="#cbd5e1"
      strokeWidth="1.5"
    />

    <ellipse
      cx="30"
      cy="38"
      rx="22"
      ry="12"
      fill="#ffffff"
      stroke="#cbd5e1"
      strokeWidth="1.5"
    />

    <rect
      x="13"
      y="46"
      width="8"
      height="15"
      rx="4"
      fill="#ffffff"
      stroke="#cbd5e1"
      strokeWidth="1.5"
    />

    {/* голова */}
    <g stroke="#cbd5e1" strokeWidth="1.5">
      <circle cx="50" cy="25" r="3" fill="#ffffff" />
      <circle cx="52" cy="32" r="9" fill="#ffffff" />
      <ellipse cx="60" cy="33" rx="4.5" ry="3.5" fill="#ffffff" />
    </g>
    <circle cx="53" cy="30" r="1.5" fill="#334155" />
    <ellipse cx="63" cy="33" rx="1.7" ry="1.4" fill="#334155" />

    <g
      className={active ? "bear-paw" : undefined}
      stroke="#cbd5e1"
      strokeWidth="1.5"
    >
      <rect x="35" y="34" width="8" height="20" rx="4" fill="#ffffff" />
      <circle cx="39" cy="54" r="4.5" fill="#ffffff" />
    </g>
  </svg>
);

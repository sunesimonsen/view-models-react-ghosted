type IconProps = {
  className?: string;
  title?: string;
};

export const GhostIcon = ({ className, title }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 120 120"
    role="img"
    aria-label={title ?? "Ghost"}
  >
    <defs>
      <linearGradient id="ghost-glow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#eaf7ff" />
        <stop offset="1" stopColor="#b7d2ff" />
      </linearGradient>
    </defs>
    <path
      d="M60 16c-20 0-36 16-36 36v38c0 6 4 10 9 10 6 0 7-6 12-6 5 0 7 6 12 6s7-6 12-6c5 0 6 6 12 6 5 0 9-4 9-10V52c0-20-16-36-36-36z"
      fill="url(#ghost-glow)"
      stroke="#5c76b6"
      strokeWidth="4"
    />
    <circle cx="45" cy="54" r="6" fill="#2c3554" />
    <circle cx="75" cy="54" r="6" fill="#2c3554" />
    <path
      d="M44 72c6 6 26 6 32 0"
      stroke="#2c3554"
      strokeWidth="5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const DoorClosedIcon = ({ className, title }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 120 160"
    role="img"
    aria-label={title ?? "Door"}
  >
    <rect x="18" y="12" width="84" height="136" rx="8" fill="#6b3b2a" />
    <rect x="26" y="20" width="68" height="120" rx="6" fill="#8a4b34" />
    <rect x="34" y="28" width="52" height="104" rx="6" fill="#9b5a3d" />
    <circle cx="84" cy="80" r="6" fill="#e8c779" />
  </svg>
);

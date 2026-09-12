const ICONS = {
  drop: <path d="M12 3.2C12 3.2 6.2 10.4 6.2 14.6a5.8 5.8 0 0 0 11.6 0C17.8 10.4 12 3.2 12 3.2Z" />,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  camera: <><rect x="3" y="7.5" width="18" height="12.5" rx="3" /><path d="M8.8 7.5L10.3 5h3.4L15.2 7.5" /><circle cx="12" cy="13.5" r="3.4" /></>,
  download: <><path d="M12 4v11M7.5 11.5L12 16l4.5-4.5M5 20h14" /></>,
  x: <><path d="M6 6l12 12M18 6L6 18" /></>,
  pencil: <path d="M4.5 19.5l1-3.8L16.6 4.6a2 2 0 0 1 2.8 2.8L8.3 18.5l-3.8 1z" />,
  trash: <><path d="M5 7h14M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7M7.5 7l.9 12.5h7.2L16.5 7" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" /></>,
  moon: <path d="M20 13.6A8.2 8.2 0 1 1 10.4 4a6.6 6.6 0 0 0 9.6 9.6z" />,
  check: <path d="M5 12.8l4.2 4.2L19 7.2" />,
  leaf: <><path d="M19.5 4.5C10 4.5 5 9.5 4.5 19.5c10-.5 15-5.5 15-15z" /><path d="M4.5 19.5C8 14 12 10 16.5 7.5" /></>,
  note: <><rect x="4.5" y="4" width="15" height="16" rx="2.5" /><path d="M8.5 9h7M8.5 13h7M8.5 17h4" /></>,
  volume: <><path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4z" /><path d="M15.5 9.2a4 4 0 0 1 0 5.6M18 6.8a7.4 7.4 0 0 1 0 10.4" /></>,
  volumeX: <><path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4z" /><path d="M16 9.5l5 5M21 9.5l-5 5" /></>,
};

export function Ico({ n, size = 18, style }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      {ICONS[n]}
    </svg>
  );
}
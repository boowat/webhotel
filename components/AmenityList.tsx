const CheckIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0 text-brand-600"
    aria-hidden="true"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export function AmenityList({ amenities }: { amenities: string[] }) {
  return (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
      {amenities.map((a) => (
        <li key={a} className="flex items-center gap-2.5 text-slate-700">
          <CheckIcon />
          <span>{a}</span>
        </li>
      ))}
    </ul>
  );
}

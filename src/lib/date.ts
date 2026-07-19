const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];



/** "YYYY-MM-DD" -> "DD Month YYYY" (e.g. "12 July 2026"). Empty in -> empty out. */
export function formatDate(iso: string) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  return `${day} ${MONTHS[Number(month) - 1]} ${year}`;
}

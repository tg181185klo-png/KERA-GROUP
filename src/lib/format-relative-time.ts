type RelativeTimeLabels = {
  justNow: string;
  minutes: (n: number) => string;
  hours: (n: number) => string;
  days: (n: number) => string;
};

export function formatRelativeTime(
  isoDate: string | undefined,
  labels: RelativeTimeLabels,
): string | null {
  if (!isoDate) return null;

  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return null;

  const diffMs = Date.now() - then;
  if (diffMs < 0) return labels.justNow;

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return labels.justNow;
  if (minutes < 60) return labels.minutes(minutes);

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return labels.hours(hours);

  const days = Math.floor(hours / 24);
  if (days < 30) return labels.days(days);

  return labels.days(days);
}

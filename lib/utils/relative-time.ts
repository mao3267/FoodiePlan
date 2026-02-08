const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Unknown date";
  }

  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < MINUTE) {
    return "Just now";
  }

  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes}m ago`;
  }

  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours}h ago`;
  }

  if (diff < 7 * DAY) {
    const days = Math.floor(diff / DAY);
    return `${days}d ago`;
  }

  return date.toLocaleDateString();
}

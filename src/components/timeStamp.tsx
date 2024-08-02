export function timeStamp(createdAt: number): string {
  const now = new Date();
  const createdDate = new Date(createdAt);

  const diffInHours = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `${diffInDays}d`;
  } else if (diffInHours > 1) {
    return `${diffInHours}h`;
  } else {
    const minutes = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60));
    return `${minutes}m`;
  }
}
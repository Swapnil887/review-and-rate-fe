export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getAvatarColor(name: string) {
  const colors = [
    "bg-indigo-700",
    "bg-emerald-600",
    "bg-orange-500",
    "bg-purple-600",
    "bg-sky-600",
    "bg-rose-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function getReviewOwnerId(
  userId: string | { _id: string; name: string; email: string }
) {
  if (typeof userId === "string") return userId;
  return userId?._id ?? null;
}

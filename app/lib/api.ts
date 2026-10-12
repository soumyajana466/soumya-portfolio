export function getApiUrl(): string {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  url = url.trim().replace(/\/+$/, "");

  // If missing protocol, force https://
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  return url;
}

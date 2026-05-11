export const ADMIN_EMAILS = [
  "paul.ws.lee@gmail.com",
  "paul.ws.lee@icloud.com",
  "phal.lee@mac.com"
];

export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

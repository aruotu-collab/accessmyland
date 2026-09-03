export const ADMIN_EMAIL = "aruotu@gmail.com";

export function isAdminEmail(email: string | null | undefined) {
  return (email ?? "").toLowerCase().trim() === ADMIN_EMAIL;
}

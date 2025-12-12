export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = process.env.NEXT_PUBLIC_APP_TITLE || "App";
export const APP_DESCRIPTION = "Boulangerie Saint-Marc";
export const APP_LOGO =
  process.env.NEXT_PUBLIC_APP_LOGO ||
  "https://shadcn.com/favicon.ico";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  return "/login";
};
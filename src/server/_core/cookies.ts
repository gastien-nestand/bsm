export interface SerializeOptions {
  domain?: string;
  encode?(value: string): string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  priority?: 'low' | 'medium' | 'high';
  sameSite?: true | false | 'lax' | 'strict' | 'none';
  secure?: boolean;
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: any) {
  if (req.headers["x-forwarded-proto"] === "https") return true;
  return false;
}

export function getSessionCookieOptions(
  req: any
): SerializeOptions {
  const isProduction = process.env.NODE_ENV === "production";
  const customDomain = process.env.CUSTOM_DOMAIN;

  return {
    httpOnly: true,
    path: "/",
    // Use 'strict' in production for better security, 'lax' in development for localhost compatibility
    sameSite: isProduction ? "strict" : "lax",
    // Always use secure cookies in production (HTTPS), optional in development
    secure: isProduction ? true : isSecureRequest(req),
    // Set domain for custom domain in production
    domain: isProduction && customDomain ? customDomain : undefined,
  };
}

import { Response } from "express";

// Better Auth's `auth.api.*` calls (with asResponse: true) return a standard
// Fetch API Response. We're not using Better Auth's own toNodeHandler for
// these routes (we want our own {success, message, data} envelope instead),
// so its Set-Cookie header(s) must be copied onto Express's res manually.
export const applyAuthCookies = (authHeaders: Headers, res: Response) => {
  const setCookieHeaders = authHeaders.getSetCookie?.() ?? [];
  if (setCookieHeaders.length > 0) {
    res.setHeader("Set-Cookie", setCookieHeaders);
  }
};
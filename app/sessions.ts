// app/sessions.js
import { createCookieSessionStorage } from "remix";

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    // a Cookie from `createCookie` or the CookieOptions to create one
    cookie: {
      name: "__session",

      // all of these are optional
      httpOnly: true,
      sameSite: "lax",
      secrets: ["s3cret"],
      secure: false,
    },
  });

export { getSession, commitSession, destroySession };

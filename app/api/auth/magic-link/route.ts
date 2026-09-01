import { Resend } from "resend";
import {
  appUrl,
  createMagicToken,
  isValidEmail,
} from "@/lib/auth";
import { magicLinkHtml, magicLinkText } from "@/lib/email";

export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: string };
    email = (body.email ?? "").trim().toLowerCase();
  } catch {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return Response.json({ error: "Email sending is not configured." }, { status: 500 });
  }

  const token = createMagicToken(email);
  const url = `${appUrl(request)}/api/auth/verify?token=${encodeURIComponent(token)}`;
  const resend = new Resend(key);
  const preferredFrom =
    process.env.RESEND_FROM ?? "AccessMyLand <hello@accessmyland.com>";
  const payload = {
    to: email,
    subject: "Sign in to AccessMyLand",
    html: magicLinkHtml(url),
    text: magicLinkText(url),
  };

  let { error } = await resend.emails.send({ from: preferredFrom, ...payload });
  if (error) {
    const fallback = await resend.emails.send({
      from: "AccessMyLand <onboarding@resend.dev>",
      ...payload,
    });
    error = fallback.error;
  }

  if (error) {
    return Response.json(
      { error: error.message || "Could not send the sign-in email." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}

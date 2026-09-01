export function magicLinkHtml(signInUrl: string) {
  const button = `#12382b`;
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#111111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;">
      <tr>
        <td style="padding:32px 24px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:24px;">Hi there,</p>
          <p style="margin:0 0 24px;font-size:16px;line-height:24px;">
            Use the secure link below to sign in to your <strong>AccessMyLand</strong> account.
          </p>
          <p style="margin:0 0 12px;font-size:16px;line-height:24px;font-weight:700;">Sign in to AccessMyLand</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:24px;">
            This link is unique to you and should only be used to access your account. For your security, please don't forward or share this email.
          </p>
          <p style="margin:0 0 16px;font-size:16px;line-height:24px;">
            If you didn't request this sign-in link, you can safely ignore this email.
          </p>
          <p style="margin:0 0 28px;font-size:16px;line-height:24px;">Thanks,</p>
          <a href="${signInUrl}" style="display:inline-block;background:${button};color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;line-height:20px;padding:14px 28px;border-radius:999px;">
            Sign in to AccessMyLand
          </a>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function magicLinkText(signInUrl: string) {
  return `Hi there,

Use the secure link below to sign in to your AccessMyLand account.

Sign in to AccessMyLand
${signInUrl}

This link is unique to you and should only be used to access your account. For your security, please don't forward or share this email.

If you didn't request this sign-in link, you can safely ignore this email.

Thanks,`;
}

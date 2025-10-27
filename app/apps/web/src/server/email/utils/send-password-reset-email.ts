import PasswordResetEmail from "~/emails/password-reset-email";
import { env } from "~/env";
import type { authClient } from "~/lib/auth-client";
import { formatEmailDates } from "~/lib/email";
import { getIpLocationString } from "~/lib/ip-location";
import { sendEmail } from "~/server/email";

interface sendResetPasswordEmailProps {
  user: typeof authClient.$Infer.Session.user;
  url: string;
  token: string;
}

// TODO: Extract common date logic

export async function sendResetPasswordEmail(
  { user, url, token }: sendResetPasswordEmailProps,
  request?: Request,
) {
  console.log(user, url, token);

  const requestedFrom = request
    ? await getIpLocationString(request)
    : "Unknown";
  const { requestedAt, relativeExpire } = formatEmailDates({
    requestedAt: new Date(),
    expireAt: new Date(
      new Date().getTime() + env.BETTER_AUTH_RESET_PASSWORD_EXPIRES_IN * 1000,
    ),
  });
  void (await sendEmail({
    to: user.email,
    subject: "Password reset request",
    body: PasswordResetEmail({
      name: user.name,
      resetUrl: url,
      expiresIn: relativeExpire,
      requestedFrom,
      requestedAt,
    }),
  }));
}

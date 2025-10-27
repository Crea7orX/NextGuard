import { Heading, Hr, Link, Section, Text } from "@react-email/components";
import { EmailLayout } from "~/emails/components/email-layout";
import { EmailButton } from "./components/email-button";

interface Props {
  name: string;
  resetUrl: string;
  expiresIn: string;
  requestedFrom: string;
  requestedAt: string;
}

// TODO: Extract common components

export default function PasswordResetEmail({
  name = "John Doe",
  resetUrl = "https://example.com/",
  expiresIn = "15 minutes",
  requestedFrom = "127.0.0.1, Amsterdam, NL",
  requestedAt = "1 January 1970, 00:00 UTC",
}: Props) {
  return (
    <EmailLayout preview="Use the following link to reset your NextGuard password">
      <Section className="px-2">
        <Heading as="h2" className="text-2xl font-bold">
          Password reset request
        </Heading>

        <Section className="mb-6">
          <Text className="mb-2 text-base">
            Hi <span className="font-bold">{name}</span>,
          </Text>
          <Text className="mt-0 text-base">
            We received a request to reset your{" "}
            <span className="font-bold">NextGuard</span> password! You can use
            the following link to reset your password.
          </Text>
        </Section>

        <Section className="mb-6 text-center">
          <EmailButton href={resetUrl}>Reset password</EmailButton>
        </Section>

        <Section className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-6">
          <Text className="mb-2 text-sm font-medium text-amber-800">
            ⚠️ Important security notice
          </Text>
          <Text className="text-sm leading-5 text-amber-700">
            This verification link will expire in{" "}
            <span className="font-bold">{expiresIn}</span>. For security
            reasons, please don&apos;t share this link with anyone.
          </Text>
        </Section>

        <Text className="text-muted-foreground mb-4 text-base">
          If you&apos;re having trouble with the above button,{" "}
          <Link href={resetUrl} className="underline">
            click here
          </Link>
          .
        </Text>

        <Hr className="my-6 border" />

        <Text className="mb-1 text-base font-bold">
          Didn&apos;t request this?
        </Text>
        <Text className="mt-0 text-base">
          This request was made from{" "}
          <span className="font-bold">{requestedFrom}</span>
          at <span className="font-bold">{requestedAt}</span>. If didn&apos;t
          make this request, you can safely ignore this email.
        </Text>
      </Section>
    </EmailLayout>
  );
}

import { VerifyEmail } from "~/components/auth/verify-email";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function VerifyEmailPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Verify your email</CardTitle>
      </CardHeader>
      <CardContent>
        <VerifyEmail />
      </CardContent>
    </Card>
  );
}

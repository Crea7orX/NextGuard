import { VerifyEmailStatus } from "~/components/auth/verify-email-status";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function VerifyEmailTokenPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Verify your email</CardTitle>
      </CardHeader>
      <CardContent>
        <VerifyEmailStatus />
      </CardContent>
    </Card>
  );
}

import { PasswordResetForm } from "~/components/auth/password-reset-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function ResetPasswordTokenPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Reset your password</CardTitle>
      </CardHeader>
      <CardContent>
        <PasswordResetForm />
      </CardContent>
    </Card>
  );
}

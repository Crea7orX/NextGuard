import { RequestPasswordResetForm } from "~/components/auth/request-password-reset-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function ResetPasswordPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Forgot your password?</CardTitle>
      </CardHeader>
      <CardContent>
        <RequestPasswordResetForm />
      </CardContent>
    </Card>
  );
}

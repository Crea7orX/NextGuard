import { SignUpForm } from "~/components/auth/sign-up-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function SignUpPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Create your account</CardTitle>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
    </Card>
  );
}

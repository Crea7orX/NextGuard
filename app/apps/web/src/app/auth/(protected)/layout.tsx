import { headers } from "next/headers";
import { NotLoggedIn } from "~/components/auth/not-logged-in";
import { auth } from "~/lib/auth";

interface Props {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: Props) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return <NotLoggedIn session={session}>{children}</NotLoggedIn>;
}

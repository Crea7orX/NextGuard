import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";

interface Props {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="bg-muted flex flex-1 flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center text-xl font-bold"
        >
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-6" />
          </div>
          NextGuard
        </Link>
        <div className="flex flex-col gap-6">
          {children}
          <div className="text-muted-foreground *:[a]:hover:text-primary max-w-sm self-center text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}

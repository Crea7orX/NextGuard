"use client";

import { AvatarWithFallback } from "~/components/common/avatar-with-fallback";
import { ProfileEmailSection } from "~/components/profile/profile-email-section";
import { ProfilePasswordSection } from "~/components/profile/profile-password-section";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { authClient } from "~/lib/auth-client";

export function ProfileDialog({
  ...props
}: React.ComponentProps<typeof Dialog>) {
  const { data: session, isPending, error } = authClient.useSession();
  const isSessionLoading = !session || isPending || !!error;

  if (isSessionLoading) {
    return null;
  }

  return (
    <Dialog {...props}>
      <DialogContent className="lg:min-w-3xl">
        <DialogHeader>
          <DialogTitle>Profile details</DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="flex items-center gap-2">
          <div className="w-52">
            <p>Profile</p>
          </div>
          <div className="flex flex-1 items-center gap-4">
            <AvatarWithFallback
              image={session.user.image}
              name={session.user.name}
              className="size-12"
            />
            <p className="font-semibold">{session.user.name}</p>
            <Button variant="outline" className="ml-auto">
              Update profile
            </Button>
          </div>
        </div>
        <Separator />
        <ProfileEmailSection />
        <Separator />
        <ProfilePasswordSection />
      </DialogContent>
    </Dialog>
  );
}

import { AccountEmailSection } from "~/components/account/account-email-section";
import { AccountPasswordSection } from "~/components/account/account-password-section";
import { AccountProfileSection } from "~/components/account/account-profile-section";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";

export function AccountDialog({
  ...props
}: React.ComponentProps<typeof Dialog>) {
  return (
    <Dialog {...props}>
      <DialogContent className="flex h-full max-h-[40rem] flex-col overflow-auto sm:max-w-[calc(100%-2rem)] md:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Account details</DialogTitle>
        </DialogHeader>
        <Separator />
        <AccountProfileSection />
        <Separator />
        <AccountEmailSection />
        <Separator />
        <AccountPasswordSection />
      </DialogContent>
    </Dialog>
  );
}

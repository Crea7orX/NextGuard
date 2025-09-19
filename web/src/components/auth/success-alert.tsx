import { CheckCircle2 } from "lucide-react";

interface Props {
  success: string;
}

export function SuccessAlert({ success }: Props) {
  return (
    <div className="bg-primary/5 border-primary text-primary flex items-center gap-4 rounded-md border p-4">
      <CheckCircle2 className="size-6 shrink-0" />
      <p className="text-sm">{success}</p>
    </div>
  );
}

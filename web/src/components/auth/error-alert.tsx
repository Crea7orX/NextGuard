import { TriangleAlert } from "lucide-react";

interface Props {
  error: string;
}

function ErrorAlert({ error }: Props) {
  return (
    <div className="bg-destructive/5 border-destructive text-destructive flex items-center gap-4 rounded-md border p-4">
      <TriangleAlert className="size-6" />
      <p className="text-sm">{error}</p>
    </div>
  );
}

export { ErrorAlert };

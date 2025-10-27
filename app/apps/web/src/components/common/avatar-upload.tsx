import { UploadIcon } from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemPreview,
  FileUploadTrigger,
} from "~/components/ui/file-upload";
import { Label } from "~/components/ui/label";

interface Props {
  invalid?: boolean;
  onChange?: (file: File | undefined) => void;
  onFileReject?: (file: File, message: string) => void;
  onFileClear?: () => void;
  value?: File;
}

export function AvatarUpload({
  onChange,
  onFileClear,
  value,
  ...props
}: Props) {
  const [files, setFiles] = React.useState<File[]>(value ? [value] : []);

  return (
    <FileUpload
      maxFiles={1}
      maxSize={10 * 1024 * 1024}
      className="flex-row gap-4"
      onValueChange={(files) => {
        console.log(files);
        setFiles(files);
        onChange?.(files[0]);
      }}
      accept="image/*"
      {...props}
      value={files}
    >
      {!files[0] ? (
        <FileUploadDropzone className="group size-20 shrink-0 p-1">
          <UploadIcon className="size-4 transition-transform group-hover:scale-130" />
        </FileUploadDropzone>
      ) : (
        <FileUploadItem value={files[0]} className="border-0 p-0">
          <FileUploadItemPreview className="size-20 rounded-md" />
        </FileUploadItem>
      )}
      <div className="flex flex-col justify-center gap-2">
        <FileUploadTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            aria-invalid={props.invalid}
            onClick={() => {
              setFiles([]);
              onChange?.(undefined);
              onFileClear?.();
            }}
          >
            Upload
          </Button>
        </FileUploadTrigger>
        <Label className="text-muted-foreground text-xs">
          Recommended size 1:1, up to 10MB.
        </Label>
      </div>
    </FileUpload>
  );
}

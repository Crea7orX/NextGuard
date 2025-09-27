export function convertToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function convertFromBase64(base64: string, filename = "image") {
  // Validate base64 format
  if (!base64.includes(",")) {
    console.log("Invalid base64 format");
    return undefined;
  }

  // Extract the mime type and base64 data
  const [mimeTypePart, base64Data] = base64.split(",");

  if (!mimeTypePart || !base64Data) {
    console.log("Invalid mime format");
    return undefined;
  }

  const mimeTypeRegex = /:(.*?);/;
  const mimeTypeMatch = mimeTypeRegex.exec(mimeTypePart);
  const mimeType = mimeTypeMatch?.[1] ?? "image/png";

  // Convert base64 to binary
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Create and return the File object
  return new File([bytes], filename, { type: mimeType });
}

export const getFileNameFromUrl = (url: string): string => {
  try {
    const pathname = new URL(url).pathname;
    const fullFileName = pathname.split("/").pop() || "image.jpg";
    return decodeURIComponent(fullFileName);
  } catch {
    return "image.jpg";
  }
};

export async function getBase64ImageFromUrl(
  imageUrl: string,
): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
    });
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function loadNormalizedImage(
  url: string,
  maxPx = 1600,
): Promise<{
  dataUrl: string;
  width: number;
  height: number;
} | null> {
  try {
    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
    });
    const blob = await res.blob();

    const bitmap = await createImageBitmap(blob, {
      imageOrientation: "from-image",
    });

    const scale = Math.min(1, maxPx / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    return { dataUrl: canvas.toDataURL("image/jpeg", 0.85), width, height };
  } catch {
    return null;
  }
}

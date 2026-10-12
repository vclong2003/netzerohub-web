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
    const res = await fetch(imageUrl, { mode: "cors" });
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

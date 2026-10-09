export const getFileNameFromUrl = (url: string): string => {
  try {
    const pathname = new URL(url).pathname;
    const fullFileName = pathname.split("/").pop() || "image.jpg";
    return decodeURIComponent(fullFileName);
  } catch {
    return "image.jpg";
  }
};

const MAX_WIDTH = 640;
const JPEG_QUALITY = 0.75;

/**
 * Read an image file and return a resized JPEG data URL for localStorage.
 */
export function fileToCompressedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Файл має бути зображенням"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Не вдалося прочитати файл"));
    reader.onload = () => {
      const src = typeof reader.result === "string" ? reader.result : "";
      if (!src) {
        reject(new Error("Порожній файл"));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error("Не вдалося завантажити зображення"));
      img.onload = () => {
        const scale = Math.min(1, MAX_WIDTH / img.width);
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas недоступний"));
          return;
        }

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        try {
          resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
        } catch {
          reject(new Error("Не вдалося стиснути зображення"));
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

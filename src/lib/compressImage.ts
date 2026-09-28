/**
 * Shrinks a photo in the browser before it is attached to the contact form.
 *
 * Vercel rejects any function request body over 4.5 MB, and the form posts
 * photos as base64 JSON (a third larger than the file). A single phone photo
 * can be 3 to 6 MB, so without this two photos were enough to fail the whole
 * submission. 1600 px on the long edge is plenty for Grace to judge a hem, and
 * brings a typical phone photo to roughly 200 to 400 KB.
 */

const MAX_EDGE = 1600;
const QUALITY = 0.82;

export type PreparedPhoto = { filename: string; dataUrl: string; bytes: number };

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Approximate decoded size of a base64 data URL. */
export function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return Math.floor((base64.length * 3) / 4);
}

export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITY)
    );
    if (!blob) throw new Error("encode failed");

    // Keep the original if re-encoding somehow made it bigger.
    const source = blob.size < file.size ? blob : file;
    const dataUrl = await readAsDataUrl(source);
    const filename =
      source === blob ? file.name.replace(/\.[^.]+$/, "") + ".jpg" : file.name;
    return { filename, dataUrl, bytes: source.size };
  } catch {
    // Formats the browser cannot decode (HEIC outside Safari) go as they are.
    const dataUrl = await readAsDataUrl(file);
    return { filename: file.name, dataUrl, bytes: file.size };
  }
}

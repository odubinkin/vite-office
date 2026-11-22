/** @fileoverview Browser storage and raster import for the shared Bullets theme. */
import { Size } from "../../../tools/inc/gen";
import { Graphic } from "../../../vcl/source/gdi/graph";
import galleryData from "../../source/tabpages/numpages-bitmap-data.json";

/** One native graphic and its presentation in the Bullets theme. */
interface GalleryItem {
  readonly name: string;
  readonly src: string;
  readonly graphic: Graphic;
}

/** Decodes browser image data for the native model. @param value - Base64 payload. @returns Decoded bytes. */
function decodeBase64(value: string): Uint8Array {
  return Uint8Array.from(
    atob(value),
    /** Reads one binary character. @param character - Encoded byte. @returns Numeric byte. */ (
      character,
    ) => character.charCodeAt(0),
  );
}

const gallery: GalleryItem[] = Object.entries(galleryData).map(
  /** Reads package assets in the native Bullets theme order. @param item - Asset name and PNG bytes. @returns Ready gallery image. */
  ([name, png]) => ({
    name,
    src: `data:image/png;base64,${png}`,
    graphic: new Graphic(decodeBase64(png), "image/png", new Size(240, 240)),
  }),
);

/** Returns the original first entry used to seed an unset numbering rule. @returns Default gallery graphic. */
export function getDefaultBulletGraphic(): Graphic {
  return (gallery[0] as GalleryItem).graphic;
}

const galleryStorageKey = "vite-office.gallery.bullets";
let loadedUserGallery = false;

/** Loads user images once for the shared, editable Bullets theme. @returns Theme entries. */
export function loadGallery(): readonly GalleryItem[] {
  if (loadedUserGallery) return gallery;
  loadedUserGallery = true;
  try {
    const saved: unknown = JSON.parse(globalThis.localStorage.getItem(galleryStorageKey) ?? "[]");
    if (!Array.isArray(saved)) return gallery;
    for (const item of saved) {
      if (
        !item ||
        typeof item !== "object" ||
        typeof item.name !== "string" ||
        typeof item.png !== "string" ||
        !Number.isInteger(item.width) ||
        item.width < 1 ||
        item.width > 30 ||
        !Number.isInteger(item.height) ||
        item.height < 1 ||
        item.height > 30
      )
        continue;
      const graphic = new Graphic(
        decodeBase64(item.png),
        "image/png",
        new Size(item.width * 15, item.height * 15),
      );
      gallery.push({ name: item.name, src: `data:image/png;base64,${item.png}`, graphic });
    }
  } catch {
    return gallery;
  }
  return gallery;
}

const builtInGallerySize = gallery.length;

/** Persists the editable part of the Bullets gallery in the browser profile. @param item - Newly resized image. @returns Updated theme. */
export function addGalleryItem(item: GalleryItem): readonly GalleryItem[] {
  gallery.push(item);
  try {
    const items = gallery.slice(builtInGallerySize).map(
      /** Serializes the user's resized image and dimensions. @param entry - User image. @returns Stored gallery entry. */
      (entry) => {
        const size = entry.graphic.GetPrefSize();
        return {
          name: entry.name,
          png: entry.src.slice("data:image/png;base64,".length),
          width: size.Width() / 15,
          height: size.Height() / 15,
        };
      },
    );
    globalThis.localStorage.setItem(galleryStorageKey, JSON.stringify(items));
  } catch {
    // The current gallery remains available when browser storage is restricted.
  }
  return [...gallery];
}

/** Downscales a local image to the original gallery bounds when requested. @param file - File chosen in the native browser picker. @param limit - Upper bound in device pixels. @returns Embedded gallery image or absence. */
export async function readGalleryFile(file: File, limit: number): Promise<GalleryItem | undefined> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, limit / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.max(1, Math.trunc(bitmap.width * scale));
    canvas.height = Math.max(1, Math.trunc(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) return undefined;
    context.imageSmoothingEnabled = false;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const src = canvas.toDataURL("image/png");
    return {
      name: file.name.replace(/\.[^.]+$/u, ""),
      src,
      graphic: new Graphic(
        decodeBase64(src.slice("data:image/png;base64,".length)),
        "image/png",
        new Size(canvas.width * 15, canvas.height * 15),
      ),
    };
  } finally {
    bitmap.close();
  }
}

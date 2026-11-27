/** @fileoverview Shared ODF package font bytes and browser viewing rights. */

/** One package-backed font face, with bytes attached after validation. */
export interface OdfFontResource {
  readonly faceName: string;
  readonly familyName: string;
  readonly path: string;
  readonly format: string;
  readonly weight: "normal" | "bold";
  readonly style: "normal" | "italic";
  readonly bytes?: Uint8Array;
  readonly canLoad?: boolean;
}

/** Recognizes font bytes produced in another browser realm. @param value - Graph value. @returns Whether the value is a Uint8Array. */
export function isOdfFontBytes(value: unknown): value is Uint8Array {
  return (
    ArrayBuffer.isView(value) && Object.prototype.toString.call(value) === "[object Uint8Array]"
  );
}

/** Stores one resource per ODF package path. */
export class OdfFontResources {
  private readonly fonts = new Map<string, OdfFontResource>();

  /** Registers an authored face or the identical reference to a known resource. @param font - Package font. */
  Register(font: OdfFontResource): void {
    const previous = this.fonts.get(font.path);
    if (previous) {
      if (
        previous.familyName !== font.familyName ||
        previous.weight !== font.weight ||
        previous.style !== font.style ||
        previous.format !== font.format
      )
        throw new Error(`Conflicting ODF embedded font: ${font.path}`);
      return;
    }
    this.fonts.set(font.path, {
      ...font,
      ...(font.bytes ? { bytes: new Uint8Array(font.bytes) } : {}),
    });
  }

  /** Attaches validated bytes. @param path - Registered path. @param bytes - Validated font. @param canLoad - Viewing permission. */
  SetBytes(path: string, bytes: Uint8Array, canLoad: boolean): void {
    const font = this.fonts.get(path);
    if (!font) throw new Error(`Unknown ODF embedded font: ${path}`);
    this.fonts.set(path, { ...font, bytes: new Uint8Array(bytes), canLoad });
  }

  /** Returns independent records for the package and browser boundaries. @returns Font records. */
  GetFonts(): readonly OdfFontResource[] {
    return [...this.fonts.values()].map(
      /** Copies protected resource bytes. @param font - Stored font. @returns Independent record. */
      (font) => ({ ...font, ...(font.bytes ? { bytes: font.bytes.slice() } : {}) }),
    );
  }
}

/** Validates and reads existing ODF package font entries. @param fonts - Declared font faces. @param names - Package catalogue. @param manifest - Media types. @param readEntry - Bounded package reader. @param checkpoint - Optional cooperative cancellation. @returns Fonts with validated bytes and viewing flags. */
export async function readOdfFontResources(
  fonts: readonly OdfFontResource[],
  names: readonly string[],
  manifest: ReadonlyMap<string, string>,
  readEntry: (path: string) => Promise<Uint8Array>,
  checkpoint?: () => void,
): Promise<readonly (OdfFontResource & { bytes: Uint8Array; canLoad: boolean })[]> {
  const result: (OdfFontResource & { bytes: Uint8Array; canLoad: boolean })[] = [];
  let total = 0;
  for (const font of fonts) {
    checkpoint?.();
    if (!/^Fonts\/(?!.*(?:\.\.|\/\/))[^\\?#]+$/u.test(font.path) || font.path.startsWith("Fonts//"))
      throw new Error(`ODF embedded font path is invalid: ${font.path}`);
    if (!names.includes(font.path))
      throw new Error(`ODF embedded font package entry is missing: ${font.path}`);
    const mediaType = manifest.get(font.path);
    if (mediaType !== "application/x-font-ttf" && mediaType !== "application/vnd.ms-opentype")
      throw new Error(`ODF embedded font manifest entry is invalid: ${font.path}`);
    const bytes = await readEntry(font.path);
    total += bytes.length;
    if (bytes.length > 4 * 1024 * 1024 || total > 16 * 1024 * 1024)
      throw new Error("ODF embedded fonts exceed size limit.");
    result.push({ ...font, bytes, canLoad: isViewableOpenTypeFont(bytes) });
  }
  return result;
}

/** Checks the OpenType signature, table bounds and OS/2 embedding flag. @param bytes - Package font. @returns Browser viewing permission. */
function isViewableOpenTypeFont(bytes: Uint8Array): boolean {
  if (bytes.length < 12) throw new Error("ODF embedded font is invalid.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const signature = view.getUint32(0, false);
  if (signature !== 0x00010000 && signature !== 0x4f54544f)
    throw new Error("ODF embedded font format is invalid.");
  const tableCount = view.getUint16(4, false);
  if (12 + tableCount * 16 > bytes.length) throw new Error("ODF embedded font tables are invalid.");
  for (let index = 0; index < tableCount; index++) {
    const offset = 12 + index * 16;
    if (view.getUint32(offset, false) !== 0x4f532f32) continue;
    const tableOffset = view.getUint32(offset + 8, false);
    const tableLength = view.getUint32(offset + 12, false);
    if (tableOffset + tableLength > bytes.length || tableLength < 10)
      throw new Error("ODF embedded font rights table is invalid.");
    return (view.getUint16(tableOffset + 8, false) & 0x0002) === 0;
  }
  return false;
}

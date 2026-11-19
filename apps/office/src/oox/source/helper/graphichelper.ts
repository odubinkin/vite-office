/** @fileoverview Original OOXML graphic helper device conversions and encoded package image import. */
import { OStorageHelper } from "../../../comphelper/inc/storagehelper";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import type { ZipStorage } from "./zipstorage";
import { Color } from "../../../tools/inc/color";

const palette = new Map([
  ["3dDkShadow", 0x716f64],
  ["3dLight", 0xf1efe2],
  ["activeBorder", 0xd4d0c8],
  ["activeCaption", 0x0054e3],
  ["appWorkspace", 0x808080],
  ["background", 0x004e98],
  ["btnFace", 0xece9d8],
  ["btnHighlight", 0xffffff],
  ["btnShadow", 0xaca899],
  ["btnText", 0],
  ["captionText", 0xffffff],
  ["gradientActiveCaption", 0x3d95ff],
  ["gradientInactiveCaption", 0xd8e4f8],
  ["grayText", 0xaca899],
  ["highlight", 0x316ac5],
  ["highlightText", 0xffffff],
  ["hotLight", 0x000080],
  ["inactiveBorder", 0xd4d0c8],
  ["inactiveCaption", 0x7a96df],
  ["inactiveCaptionText", 0xd8e4f8],
  ["infoBk", 0xffffe1],
  ["infoText", 0],
  ["menu", 0xffffff],
  ["menuBar", 0xece9d8],
  ["menuHighlight", 0x316ac5],
  ["menuText", 0],
  ["scrollBar", 0xd4d0c8],
  ["window", 0xffffff],
  ["windowFrame", 0],
  ["windowText", 0],
]);

/** Resolves a native system token and falls back to the color supplied by the source. @param token - Original color name. @param fallback - Optional lexical fallback color. @returns Resolved color or absence. */
export function getSystemColor(token: string, fallback?: Color): Color | undefined {
  const value = palette.get(token);
  return value === undefined ? fallback : new Color(value);
}

/** Immutable encoded source consumed by the native graphic decoder at the shape boundary. */
export class EmbeddedGraphic {
  /** Retains the owned encoded data returned by the package stream. @param bytes - Owned data. @param mediaType - Detected raster format. @returns Encoded source. */
  constructor(
    private readonly bytes: Uint8Array,
    readonly mediaType: string,
  ) {}

  /** Copies the encoded source when handing it to another owner. @returns Independent bytes. */
  GetNativeData(): Uint8Array {
    return this.bytes.slice();
  }
}

/** Owns the native filter device conversions and cache of package graphics. */
export class GraphicHelper {
  private readonly pixelPerHmmX: number;
  private readonly pixelPerHmmY: number;
  private readonly imported = new Map<string, Promise<EmbeddedGraphic | undefined>>();

  /** Uses the device's converted 100000 hundredths of a millimeter on each axis. @param pixelPerMeterX - Horizontal device extent. @param pixelPerMeterY - Vertical device extent. @param storage - Optional package to import from. @returns Graphic helper. */
  constructor(
    pixelPerMeterX: number,
    pixelPerMeterY: number,
    private readonly storage?: ZipStorage,
  ) {
    this.pixelPerHmmX = pixelPerMeterX / 100000;
    this.pixelPerHmmY = pixelPerMeterY / 100000;
  }

  /** Opens an internal fragment and shares successful imports by native package path. @param path - Resolved package part. @returns The encoded JPEG or PNG, if present. */
  async importEmbeddedGraphic(path: string): Promise<EmbeddedGraphic | undefined> {
    if (!path || !this.storage) return undefined;
    let pending = this.imported.get(path);
    if (!pending) {
      pending = this.loadEmbeddedGraphic(this.storage, path);
      this.imported.set(path, pending);
    }
    let graphic: EmbeddedGraphic | undefined;
    try {
      graphic = await pending;
      return graphic;
    } finally {
      if (!graphic && this.imported.get(path) === pending) this.imported.delete(path);
    }
  }

  /** Reads through package storage, preserving UNO error handling and ownership. @param storage - Source package. @param path - Internal part. @returns Encoded graphic. */
  private async loadEmbeddedGraphic(
    storage: ZipStorage,
    path: string,
  ): Promise<EmbeddedGraphic | undefined> {
    const input = await storage.openInputStream(path);
    try {
      return input.is() ? importGraphic(input) : undefined;
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
      return undefined;
    } finally {
      input.dispose();
    }
  }

  /** Converts device X pixels with the original rounding. @param pixel - Horizontal pixels. @returns Hundredths of a millimeter. */
  convertScreenPixelXToHmm(pixel: number): number {
    return convertScreenPixelToHmm(pixel, this.pixelPerHmmX);
  }

  /** Converts device Y pixels with the original rounding. @param pixel - Vertical pixels. @returns Hundredths of a millimeter. */
  convertScreenPixelYToHmm(pixel: number): number {
    return convertScreenPixelToHmm(pixel, this.pixelPerHmmY);
  }
}

/** Keeps the original device guard and scale. @param pixel - Device coordinate. @param pixelPerHmm - Active axis scale. @returns Rounded physical coordinate. */
function convertScreenPixelToHmm(pixel: number, pixelPerHmm: number): number {
  return pixelPerHmm > 0 ? Math.trunc(pixel / pixelPerHmm + 0.5) : 0;
}

/** Reads original encoded raster data through the native stream copy boundary. @param input - Borrowed part input. @returns Encoded graphic for the represented lazy formats. */
function importGraphic(input: Reference<XInputStream>): EmbeddedGraphic | undefined {
  const buffer = new Reference(new UNOMemoryStream());
  const stream = buffer.operatorStar();
  const output = stream.getOutputStream();
  try {
    OStorageHelper.CopyInputToOutput(input, output);
    const length = Number(stream.getLength());
    if (length < 4) return undefined;
    const bytes = new Int8Array(length);
    stream.seek(0n);
    if (stream.readSomeBytes(bytes, length) !== length) return undefined;
    const data = new Uint8Array(bytes.buffer);
    const mediaType = detectRasterMediaType(data);
    return mediaType ? new EmbeddedGraphic(data, mediaType) : undefined;
  } finally {
    output.dispose();
    buffer.dispose();
  }
}

/** Matches the native JPEG marker and full PNG signature checks without unpacking pixels. @param data - Encoded bytes. @returns Recognized media type. */
function detectRasterMediaType(data: Uint8Array): string | undefined {
  const head = new DataView(data.buffer, data.byteOffset, data.byteLength);
  if (head.getUint32(0) >>> 8 === 0xffd8ff) return "image/jpeg";
  if (head.byteLength >= 8 && head.getBigUint64(0) === 0x89504e470d0a1a0an) return "image/png";
  return undefined;
}

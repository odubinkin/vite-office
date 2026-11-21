/** @fileoverview Native ODF embedded graphic naming, payload reuse and package-local loading. */
import { rtl_crc32 } from "../../../sal/rtl/crc";

/** A recognized native raster link at the XML package boundary. */
export interface XMLGraphic {
  readonly bytes: Uint8Array;
  readonly mediaType: string;
}

/** A graphic URL and its optional inline fallback at the import boundary. */
export interface XMLGraphicSource {
  readonly href: string;
  readonly inline?: Uint8Array;
}

const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const extensions: ReadonlyMap<string, string> = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
]);

/** Recognizes the native links represented by the Writer raster filter. @param mediaType - Declared package MIME. @returns Whether represented. */
export function isEmbeddedRaster(mediaType: string): boolean {
  return extensions.has(mediaType);
}

/** Retains original native raster streams for one ODF package. */
export class SvXMLGraphicHelper {
  /** Borrows existing package resources or creates an output resource catalogue. @param entries - Validated package entries. @returns Graphic helper. */
  constructor(private readonly entries = new Map<string, XMLGraphic>()) {}

  /** Resolves only an embedded package resource. @param url - Original xlink href. @returns Local raster asset or absence. */
  loadGraphicByURL(url: string): XMLGraphic | undefined {
    const path = url.startsWith("./") ? url.slice(2) : url;
    if (/^(?:[a-z][a-z\d+.-]*:|\/)/iu.test(path)) return undefined;
    const existing = this.entries.get(path);
    if (existing) return existing;
    try {
      return this.entries.get(decodeURIComponent(path));
    } catch {
      return undefined;
    }
  }

  /** Imports the represented encoded raster streams using the original VCL signatures. @param bytes - Decoded binary stream. @returns Recognized raster or absence. */
  loadGraphicFromBase64(bytes: Uint8Array): XMLGraphic | undefined {
    if (
      pngSignature.every(
        /** Checks one native PNG signature byte. @param byte - Signature byte. @param index - Stream offset. @returns Match. */
        (byte, index) => bytes[index] === byte,
      )
    )
      return { bytes, mediaType: "image/png" };
    if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
      return { bytes, mediaType: "image/jpeg" };
    return undefined;
  }

  /** Stores native raster bytes in Pictures once; the encoded checksum identifies the portable graphic value. @param graphic - Owned encoded input. @returns Internal graphic stream. */
  saveGraphic(graphic: XMLGraphic): string {
    const extension = extensions.get(graphic.mediaType);
    if (!extension || graphic.bytes.length === 0)
      throw new Error("ODF export cannot store this embedded raster image.");
    const checksum = rtl_crc32(0, graphic.bytes, graphic.bytes.length).toString(16);
    const stem = "Pictures/" + checksum;
    let suffix = "";
    let index = 0;
    for (;;) {
      const path = stem + suffix + "." + extension;
      const existing = this.entries.get(path);
      if (!existing) {
        this.entries.set(path, graphic);
        return path;
      }
      if (
        existing.bytes.length === graphic.bytes.length &&
        existing.bytes.every(
          /** Confirms equality even when the encoded checksums match. @param byte - Stored byte. @param position - Offset. @returns Whether equal. */
          (byte, position) => byte === graphic.bytes[position],
        )
      )
        return path;
      suffix = "-" + ++index;
    }
  }

  /** Borrows the package entries for the original manifest and storage writers. @returns Raster resources by path. */
  getEntries(): ReadonlyMap<string, XMLGraphic> {
    return this.entries;
  }
}

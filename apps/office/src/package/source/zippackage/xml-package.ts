/** @fileoverview Unpacked ODF streams for browser persistence; ZIP exists only at the external file boundary. */
import { ZipOutputStream } from "../zipapi/ZipOutputStream";
/** Reads a required XML stream. @param files - Unpacked streams. @param name - Stream path. @returns XML text. */
export function xmlStream(
  files: Readonly<Record<string, string | Uint8Array>>,
  name: string,
): string {
  const value = files[name];
  if (typeof value !== "string") throw new Error(`Missing XML stream: ${name}`);
  return value;
}
/** Creates an external ODF file from unpacked streams. @param files - XML and resources. @returns ZIP bytes. */
export function packXmlPackage(files: Readonly<Record<string, string | Uint8Array>>): Uint8Array {
  const zip = new ZipOutputStream(),
    encoder = new TextEncoder();
  zip.putNextEntry("mimetype", encoder.encode(xmlStream(files, "mimetype")));
  for (const [name, value] of Object.entries(files)) {
    if (name !== "mimetype")
      zip.putNextEntry(name, typeof value === "string" ? encoder.encode(value) : value);
  }
  return zip.finish();
}

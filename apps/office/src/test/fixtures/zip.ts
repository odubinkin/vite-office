/** @fileoverview zip.js fixtures for document-format ZIP admission tests. */
import type { DocumentArchive } from "../../package/source/zippackage/document-archive";
import { ZipWriter, Uint8ArrayReader, Uint8ArrayWriter } from "@zip.js/zip.js";

/** Creates a complete package with a deflated mimetype entry. @param archive - Source package. @returns External ZIP. */
export async function compressedMimetypePackage(archive: DocumentArchive): Promise<Uint8Array> {
  const writer = new ZipWriter(new Uint8ArrayWriter(), { useWebWorkers: false });
  for (const name of archive.getEntryNames())
    await writer.add(name, new Uint8ArrayReader(await archive.readEntry(name)), {
      level: name === "mimetype" ? 6 : 0,
      directory: name.endsWith("/"),
    });
  return writer.close();
}

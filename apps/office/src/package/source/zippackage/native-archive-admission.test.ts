/** @fileoverview Existing document admission rejects actual malformed ZIP metadata after the output producer switches to native core records. No parser/provider/private-state substitutions. */
import { expect, it } from "vitest";
import { readOwnedInput } from "../../../test/oox-input";
import {
  DocumentArchive,
  DocumentArchiveWriter,
  DEFAULT_ARCHIVE_LIMITS,
  ArchiveChecks,
} from "./document-archive";
/** Actual source writer creates a single-file classic ZIP for on-wire damage tests. @returns Wire image. */
async function archive(): Promise<Uint8Array> {
  const writer = new DocumentArchiveWriter();
  writer.putNextEntry("part.xml", new TextEncoder().encode("Actual source bytes"));
  return writer.finish();
}

it("verifies actual STORED data before exposing the admitted native package snapshot", /** Checks CRC protection and caller byte ownership. @returns Completion. */ async () => {
  const image = await archive();
  const admitted = await DocumentArchive.open(image);
  const view = new DataView(image.buffer, image.byteOffset, image.byteLength);
  const data = 30 + view.getUint16(26, true) + view.getUint16(28, true);
  image[data] = (image[data] as number) ^ 1;
  const valid = readOwnedInput(await admitted.openNativeInput());
  expect(valid?.[data]).toBe("A".charCodeAt(0));
  const corrupt = await DocumentArchive.open(image);
  await expect(corrupt.openNativeInput()).rejects.toThrow(/CRC/i);
});
/** Alters only real local/CEN header metadata, without touching an implementation object. @param image - Independent emitted bytes. @param field - Document metadata under test. @param value - On-wire value. @returns Copied malformed archive. */
function damaged(
  image: Uint8Array,
  field: "flags" | "method" | "size" | "compressed",
  value: number,
): Uint8Array {
  const result = image.slice(),
    view = new DataView(result.buffer),
    central = view.getUint32(result.length - 6, true);
  if (view.getUint32(central, true) !== 0x02014b50)
    throw new Error("source central directory absent");
  if (field === "flags" || field === "method") {
    view.setUint16(field === "flags" ? 6 : 8, value, true);
    view.setUint16(central + (field === "flags" ? 8 : 10), value, true);
  } else {
    view.setUint32(field === "size" ? 22 : 18, value, true);
    view.setUint32(central + (field === "size" ? 24 : 20), value, true);
  }
  return result;
}
it("keeps positive finite/integer resource ceiling admission and required entry errors", /** Invalid policies are rejected before ZIP interpretation. @returns Completion. */ async () => {
  const image = await archive();
  for (const value of [0, -1, NaN, Infinity, 1.5])
    await expect(
      DocumentArchive.open(image, { ...DEFAULT_ARCHIVE_LIMITS, maxEntries: value }),
    ).rejects.toThrow("resource limits");
  const result = await DocumentArchive.open(image);
  expect(
    /** Missing entry remains a normal document boundary error. @returns Method. */ () =>
      result.getEntryMethod("absent"),
  ).toThrow("Missing ZIP entry");
  await expect(result.readEntry("absent")).rejects.toThrow("Missing ZIP entry");
});
it("rejects encrypted, unsupported-codec and over-limit wire metadata without decrypting or extracting", /** Both real header copies are changed together; no cipher or codec replacement. @returns Completion. */ async () => {
  const image = await archive();
  await expect(DocumentArchive.open(damaged(image, "flags", 2049))).rejects.toThrow(
    "Encrypted ZIP",
  );
  await expect(DocumentArchive.open(damaged(image, "method", 99))).rejects.toThrow(
    "Unsupported ZIP compression",
  );
  await expect(
    DocumentArchive.open(damaged(image, "size", DEFAULT_ARCHIVE_LIMITS.maxEntryBytes + 1)),
  ).rejects.toThrow("entry exceeds size");
  await expect(DocumentArchive.open(damaged(image, "compressed", 0))).rejects.toThrow(
    "expansion limit",
  );
});
it("preserves directory bytes, ODF first-entry case policy and EOF size verification", /** Native STORED output remains admitted by the existing document reader. @returns Completion. */ async () => {
  const writer = new DocumentArchiveWriter();
  writer.putNextEntry("mimetype", new Uint8Array());
  writer.putNextEntry("folder/", new Uint8Array());
  writer.putNextEntry("part", Uint8Array.of(1));
  writer.putNextEntry("Part", Uint8Array.of(2));
  const image = await writer.finish(),
    result = await DocumentArchive.open(image, undefined, ArchiveChecks.TryCheckInsensitive);
  expect(result.getEntryNames()).toHaveLength(4);
  expect([...(await result.readEntry("folder/"))]).toEqual([]);
  const single = await archive(),
    broken = await DocumentArchive.open(damaged(single, "size", 1));
  await expect(broken.readEntry("part.xml")).rejects.toThrow();
});

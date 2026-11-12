/** @fileoverview Document archive policies and interoperability with independently created zip.js packages. */
import { expect, it } from "vitest";
import { ZipReader, ZipWriter, Uint8ArrayReader, Uint8ArrayWriter } from "@zip.js/zip.js";
import {
  ArchiveChecks,
  DEFAULT_ARCHIVE_LIMITS,
  DocumentArchive,
  DocumentArchiveWriter,
} from "./document-archive";

/** Creates an external compressed package without the application adapter. @param names - Entry paths. @returns ZIP bytes. */
async function externalPackage(names: readonly string[]): Promise<Uint8Array> {
  const writer = new ZipWriter(new Uint8ArrayWriter(), { useWebWorkers: false });
  for (const name of names)
    await writer.add(name, new Uint8ArrayReader(new TextEncoder().encode("Document content 文档")));
  return writer.close();
}

it("imports compressed Unicode document streams created by zip.js", /** Exercises the external package boundary. @returns Completion. */ async () => {
  const archive = await DocumentArchive.open(await externalPackage(["文档/content.xml"]));
  expect(archive.getEntryNames()).toEqual(["文档/content.xml"]);
  expect(archive.getEntryMethod("文档/content.xml")).toBe(8);
  expect(await archive.readTextEntry("文档/content.xml")).toBe("Document content 文档");
});

it("preserves ODF stream order and bytes in independently readable output", /** Exercises package creation rather than ZIP record details. @returns Completion. */ async () => {
  const writer = new DocumentArchiveWriter(),
    bytes = new Uint8Array([0, 255, 17]);
  writer.putNextEntry(
    "mimetype",
    new TextEncoder().encode("application/vnd.oasis.opendocument.text"),
  );
  writer.putNextEntry("Fonts/font.ttf", bytes);
  bytes.fill(0);
  const reader = new ZipReader(new Uint8ArrayReader(await writer.finish()), {
    useWebWorkers: false,
    checkCrc32: true,
  });
  try {
    const entries = await reader.getEntries();
    expect(
      entries.map(
        /** Reads a path. @param entry - Library entry. @returns Path. */ (entry) => entry.filename,
      ),
    ).toEqual(["mimetype", "Fonts/font.ttf"]);
    expect(entries[0]?.compressionMethod).toBe(0);
    const font = entries[1];
    if (font === undefined || font.directory) throw new Error("Missing font entry");
    expect(await font.getData(new Uint8ArrayWriter())).toEqual(new Uint8Array([0, 255, 17]));
  } finally {
    await reader.close();
  }
});

it("applies resource and OOXML case-collision policies to external packages", /** Keeps browser admission limits at the application boundary. @returns Completion. */ async () => {
  const bytes = await externalPackage(["word/document.xml", "word/Document.xml"]);
  await expect(
    DocumentArchive.open(bytes, undefined, ArchiveChecks.CheckInsensitive),
  ).rejects.toThrow("Duplicate ZIP entry");
  expect((await DocumentArchive.open(bytes)).getEntryNames()).toHaveLength(2);
  await expect(
    DocumentArchive.open(bytes, { ...DEFAULT_ARCHIVE_LIMITS, maxEntries: 1 }),
  ).rejects.toThrow("entry count");
  await expect(
    DocumentArchive.open(bytes, { ...DEFAULT_ARCHIVE_LIMITS, maxEntryBytes: 1 }),
  ).rejects.toThrow("entry exceeds size");
  await expect(
    DocumentArchive.open(bytes, { ...DEFAULT_ARCHIVE_LIMITS, maxTotalBytes: 1 }),
  ).rejects.toThrow("total size");
  await expect(
    DocumentArchive.open(bytes, { ...DEFAULT_ARCHIVE_LIMITS, maxArchiveBytes: 1 }),
  ).rejects.toThrow("archive exceeds size");
});

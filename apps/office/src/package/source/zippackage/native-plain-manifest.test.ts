/** @fileoverview Source-derived normal non-recovery package metadata,MIME fallback and folder-consistency cases over actual ZIP archives and native PropertyValue sequences. */
import { expect, it } from "vitest";
import { ZipFile } from "../zipapi/ZipFile";
import { ZipOutputStream } from "../zipapi/ZipOutputStream";
import { applyPlainManifestMetadata, readPlainPackageManifest } from "./ZipPackage";
import { createManifestXml } from "../manifest/ManifestWriter";
import { property, sequence } from "../../../test/fixtures/manifest";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
const mime = "application/vnd.oasis.opendocument.text";
/** Builds an actual archive catalog with optionally supplied manifest XML. @param paths - Real entries. @param xml - Metadata stream. @returns Parsed real ZIP. */
function archive(paths: readonly string[], xml = ""): ZipFile {
  const zip = new ZipOutputStream(),
    encoder = new TextEncoder();
  for (const name of paths)
    zip.putNextEntry(
      name,
      encoder.encode(name === "META-INF/manifest.xml" ? xml : name.endsWith("/") ? "" : "x"),
    );
  return new ZipFile(zip.finish());
}
/** Actual native row producer. @param path - Full path. @param media - Media type. @param version - Optional version property. @returns Sequence. */
function row(path: string, media: string, version?: string) {
  const result = [property("FullPath", path), property("MediaType", media)];
  if (version !== undefined) result.push(property("Version", version));
  return result;
}
it("reads actual archive streams through the shared reader and hides native internal stream metadata", /** Valid ODF metadata and real archive only. @returns Nothing. */ () => {
  const xml = createManifestXml(sequence()),
    zip = archive(
      ["mimetype", "META-INF/manifest.xml", "content.xml", "styles.xml", "meta.xml"],
      xml,
    ),
    result = readPlainPackageManifest(zip, xml, mime);
  expect([
    result.mediaType,
    result.version,
    result.mediaTypeFallbackUsed,
    result.isInconsistent,
  ]).toEqual([mime, "1.3", false, false]);
  expect([...result.streamMediaTypes]).toEqual([
    ["content.xml", "text/xml"],
    ["styles.xml", "text/xml"],
    ["meta.xml", "text/xml"],
  ]);
  expect(result.folderProperties.get("/")).toEqual({ mediaType: mime, version: "1.3" });
});
it("retains only real stream/folder targets,applies duplicates in order and keeps folder aliases on the same metadata", /** Native missing or empty targets are ignored. @returns Nothing. */ () => {
  const zip = archive(["META-INF/manifest.xml", "data/", "data/a", "data/b"]),
    input = [
      row("/", mime, "1.1"),
      row("data/", "folder", "1.0"),
      row("data", "changed", "1.1"),
      row("data/a", "old"),
      row("data/a", "new"),
      row("", "ignored"),
      row("missing", "ignored"),
    ];
  const result = applyPlainManifestMetadata(zip, input);
  expect(result.streamMediaTypes.get("data/a")).toBe("new");
  expect(result.streamMediaTypes.get("data/b")).toBe("");
  expect(result.streamMediaTypes.has("missing")).toBe(false);
  expect(result.folderProperties.get("data/")).toBe(result.folderProperties.get("data"));
  expect(result.folderProperties.get("data/")).toEqual({ mediaType: "changed", version: "1.1" });
  expect(result.isInconsistent).toBe(true);
});
it("uses the normal mimetype fallback and only the first encountered Version property", /** This path does not activate a recovery mode. @returns Nothing. */ () => {
  const zip = archive(["mimetype", "META-INF/manifest.xml"]);
  const first = applyPlainManifestMetadata(
    zip,
    [row("missing", "x", "1.2"), row("later", "x", "1.3")],
    mime,
  );
  expect([first.mediaType, first.version, first.mediaTypeFallbackUsed]).toEqual([
    mime,
    "1.2",
    true,
  ]);
  expect(
    applyPlainManifestMetadata(zip, [row("missing", "x", ""), row("later", "x", "1.3")], mime)
      .version,
  ).toBe("");
  expect(applyPlainManifestMetadata(zip, [row("/", "", "1.1")], mime).version).toBe("1.1");
  expect(applyPlainManifestMetadata(zip, [], mime).version).toBe("");
  expect(applyPlainManifestMetadata(zip, [], "application/zip").mediaType).toBe("");
  expect(
    applyPlainManifestMetadata(
      zip,
      [[property("Unknown", "ignored"), property("Version", new Any(true))]],
      mime,
    ).version,
  ).toBe("");
  expect(
    /** Actual existing root type conflicts with the mimetype stream. @returns Metadata. */ () =>
      applyPlainManifestMetadata(
        zip,
        [row("/", "application/vnd.oasis.opendocument.spreadsheet")],
        mime,
      ),
  ).toThrow("conflicts");
});
it("discards parser partial records before normal package fallback without inventing a recovered document", /** Shared reader and package metadata only. @returns Nothing. */ () => {
  const xml = "<broken",
    zip = archive(["mimetype", "META-INF/manifest.xml", "content.xml"], xml),
    result = readPlainPackageManifest(zip, xml, mime);
  expect([
    result.mediaType,
    result.version,
    result.mediaTypeFallbackUsed,
    result.isInconsistent,
  ]).toEqual([mime, "", true, true]);
});
it("enforces ODF12 stream consistency while retaining signature-name and empty-directory source rules", /** Uses actual ZIP entry catalogs. @returns Nothing. */ () => {
  const input = [row("/", mime, "1.3")];
  for (const paths of [
    ["META-INF/manifest.xml", "extra"],
    ["META-INF/manifest.xml", "META-INF/other"],
    ["META-INF/manifest.xml", "META-INF/sub/"],
  ])
    expect(
      /** Native inconsistent package rejection. @returns Metadata. */ () =>
        applyPlainManifestMetadata(archive(paths), input),
    ).toThrow("not referred");
  expect(
    applyPlainManifestMetadata(
      archive(["META-INF/manifest.xml", "META-INF/documentsignatures.xml", "empty/"]),
      input,
    ).isInconsistent,
  ).toBe(false);
  expect(
    applyPlainManifestMetadata(archive(["META-INF/manifest.xml", "mimetype"]), input)
      .isInconsistent,
  ).toBe(false);
});
it("preserves the original recursive folder assignment that can replace an earlier inconsistency flag", /** Literal logical catalog traversal,not native unordered-map binary bucket order. @returns Nothing. */ () => {
  const input = [row("/", mime, "1.3")];
  expect(
    applyPlainManifestMetadata(archive(["META-INF/manifest.xml", "extra", "empty/"]), input)
      .isInconsistent,
  ).toBe(false);
  expect(
    /** Moving the unexpected stream after the final folder retains its flag. @returns Metadata. */ () =>
      applyPlainManifestMetadata(archive(["META-INF/manifest.xml", "empty/", "extra"]), input),
  ).toThrow("not referred");
});
it("keeps package-profile unsupported/enforced boundaries distinct from manifest parsing", /** No crypto/storage service or recovery object. @returns Nothing. */ () => {
  expect(
    /** Native required metadata stream. @returns Metadata. */ () =>
      applyPlainManifestMetadata(archive(["mimetype"]), [], mime),
  ).toThrow("Could not parse manifest");
  expect(
    /** Unsupported inner encrypted package. @returns Metadata. */ () =>
      applyPlainManifestMetadata(archive(["META-INF/manifest.xml", "encrypted-package"]), [], mime),
  ).toThrow("Encrypted ODF");
  for (const names of [
    ["META-INF/manifest.xml", "a", "a/b"],
    ["META-INF/manifest.xml", "a/", "a"],
  ])
    expect(
      /** Invalid native file/folder graph. @returns Metadata. */ () =>
        applyPlainManifestMetadata(archive(names), [], mime),
    ).toThrow("file/folder conflict");
});

/** @fileoverview Native ReadThroughComponent absent-stream early return uses actual SwDoc defaults rather than fabricated XML or a recovery document. */
import { expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { writeOdtDocument } from "./wrtxml";
import { readOdtDocument } from "./swxml";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
/** Removes actual archive streams,leaving native extra manifest targets unused as upstream does. @param bytes - Real ODT. @param omitted - Missing paths. @returns Real rewritten ODT. */
async function without(bytes: Uint8Array, omitted: readonly string[]): Promise<Uint8Array> {
  const input = new ZipFile(bytes),
    output = new ZipOutputStream();
  for (const name of input.getEntryNames())
    if (!omitted.includes(name)) output.putNextEntry(name, await input.readEntry(name));
  return output.finish();
}
it("retains content and shell metadata fallback when meta.xml or styles.xml is absent", /** Exercises actual shared package metadata and Writer import. @returns Completion. */ async () => {
  const source = new SwDoc();
  source.paragraphs[0]?.SetText("Native optional streams");
  const bytes = writeOdtDocument(source, { title: "saved" });
  for (const omitted of [["meta.xml"], ["styles.xml"], ["styles.xml", "meta.xml"]]) {
    const result = await readOdtDocument(await without(bytes, omitted), { title: "fallback" });
    expect(result.document.paragraphs[0]?.GetText()).toBe("Native optional streams");
    expect(result.document.IsInReading()).toBe(false);
    expect(result.title).toBe(omitted.includes("meta.xml") ? "fallback" : "saved");
  }
});
it("keeps the real default document body when content or all XML payload streams are absent", /** Native optional stream success does not create a synthetic office:text. @returns Completion. */ async () => {
  const bytes = writeOdtDocument(new SwDoc(), { title: "saved" });
  for (const omitted of [["content.xml"], ["styles.xml", "content.xml", "meta.xml"]]) {
    const result = await readOdtDocument(await without(bytes, omitted), { title: "fallback" });
    expect(result.document.paragraphs).toHaveLength(1);
    expect(result.document.paragraphs[0]?.GetText()).toBe("");
    expect(result.document.IsInReading()).toBe(false);
  }
});

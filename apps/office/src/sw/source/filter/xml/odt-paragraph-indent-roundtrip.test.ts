/** @fileoverview Verifies direct Writer paragraph margins through ODT package import and export. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { createWriterDocument } from "../../core/doc/doc";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

/** Creates Writer ODT metadata. @returns Object-shell state. */
function metadata() {
  return createDocument({ id: "odt-margin", suiteId: "writer", title: "Indented" });
}

/** Rewrites one package entry. @param bytes - Source package. @param name - Entry name. @param content - Replacement XML. @returns Rebuilt ODT bytes. */
async function replaceEntry(bytes: Uint8Array, name: string, content: string): Promise<Uint8Array> {
  const input = new ZipFile(bytes);
  const output = new ZipOutputStream();
  for (const entry of input.getEntryNames())
    output.putNextEntry(
      entry,
      entry === name ? new TextEncoder().encode(content) : await input.readEntry(entry),
    );
  return output.finish();
}

describe("Writer ODT paragraph margins", /** Registers paragraph-margin round-trip tests. @returns Nothing. */ () => {
  it("imports and exports direct paragraph left margins", /** Verifies direct margins survive ODT serialization and import. @returns Completion after package reads. */ async () => {
    const writer = createWriterDocument("margin-1");
    const paragraph = writer.paragraphs[0];
    if (paragraph === undefined) throw new Error("Writer margin paragraph is missing.");
    paragraph.SetParagraphTextLeftMargin(1134);
    const bytes = writeOdtDocument(writer, metadata());
    const content = await new ZipFile(bytes).readTextEntry("content.xml");
    expect(content).toContain('fo:margin-left="2.0003cm"');
    expect((await readOdtDocument(bytes, metadata())).document.paragraphs[0]?.textLeftMargin).toBe(
      1134,
    );
    for (const [value, expected] of [
      ["1cm", 567],
      ["1in", 1440],
      ["1mm", 57],
      ["1pt", 20],
    ] as const) {
      const imported = await readOdtDocument(
        await replaceEntry(bytes, "content.xml", content.replace("2.0003cm", value)),
        metadata(),
      );
      expect(imported.document.paragraphs[0]?.textLeftMargin).toBe(expected);
    }
    await expect(
      readOdtDocument(
        await replaceEntry(bytes, "content.xml", content.replace("2.0003cm", "-1cm")),
        metadata(),
      ),
    ).rejects.toThrow("Unsupported ODF paragraph left margin");
  });
});

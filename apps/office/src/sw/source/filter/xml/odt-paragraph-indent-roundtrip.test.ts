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

describe("Writer ODT paragraph margins", () => {
  it("imports and exports direct paragraph left margins", async () => {
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
    const imported = await readOdtDocument(
      await replaceEntry(bytes, "content.xml", content.replace("2.0003cm", "1cm")),
      metadata(),
    );
    expect(imported.document.paragraphs[0]?.textLeftMargin).toBe(567);
  });
});

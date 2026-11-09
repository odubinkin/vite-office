/** @fileoverview Native RTF paragraph shading and browser document transport. */
import { existsSync, readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { writerParagraphBackgroundColor } from "../../core/attr/swatrset";
import type { SwDoc } from "../../core/doc/doc";
import { MarkdownReader } from "../../filter/md/swmd";
import { RtfExport } from "../../filter/ww8/rtfexport";
import { readOdtDocument } from "../../filter/xml/swxml";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { RtfDocumentImpl } from "./rtfdocumentimpl";

/** Imports an actual RTF stream. @param source - Original text. @returns Native document. */
function read(source: string): SwDoc {
  return new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
}

/** Reads the same effective paragraph fill that Writer displays. @param doc - Connected Writer document. @param index - Paragraph position. @returns Effective color. */
function background(doc: SwDoc, index: number): string {
  const paragraph = doc.paragraphs[index];
  assert(paragraph);
  return writerParagraphBackgroundColor(paragraph.GetSwAttrSet());
}

it("keeps source paragraph shading in direct and named style drawing items", /** Checks native style inheritance, zero-index handling and RTF reopen. @returns Nothing. */ () => {
  const document = read(
    String.raw`{\rtf1{\colortbl;\red18\green52\blue86;\red171\green205\blue239;}` +
      String.raw`{\stylesheet{\s0 Normal;}{\s1\sbasedon0\cbpat1 Shaded;}}` +
      String.raw`\pard\s1 Styled\par\pard\s0\cbpat2\cbpat0 Direct\par\pard\s0 Plain}`,
  );
  try {
    const data = RtfExport.WriteDocument(document);
    expect(new TextDecoder().decode(data)).toMatch(/\\cbpat\d+/u);
    const reopened = new RtfDocumentImpl().ResolveBytes(data);
    try {
      for (const doc of [document, reopened]) {
        expect(background(doc, 0)).toBe("#123456");
        expect(background(doc, 1)).toBe("#abcdef");
        expect(background(doc, 2)).not.toMatch(/^#/u);
      }
    } finally {
      reopened.Dispose();
    }
  } finally {
    document.Dispose();
  }
});

it("preserves Markdown HTML paragraph shading through Writer storage and RTF", /** Uses existing Worker and ODT drawing item paths for an imported paragraph. @returns Completion. */ async () => {
  const document = new MarkdownReader().Read(
    new TextEncoder().encode(
      '<p>Before</p><p style="background-color: #123456">Visible</p><p>After</p>',
    ),
  );
  let worker: SwDoc | undefined, odt: SwDoc | undefined, rtf: SwDoc | undefined;
  try {
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(document)));
    const metadata = { title: "Paragraph fill" };
    odt = (await readOdtDocument(writeOdtDocument(worker, metadata), metadata)).document;
    rtf = new RtfDocumentImpl().ResolveBytes(RtfExport.WriteDocument(odt));
    for (const doc of [document, worker, odt, rtf]) {
      const index = doc.paragraphs.findIndex(
        /** Selects the original paragraph outside the HTML insertion joins. @param node - Native text node. @returns Whether this is the shaded paragraph. */
        (node) => node.GetText() === "Visible",
      );
      expect(index).toBeGreaterThanOrEqual(0);
      expect(background(doc, index)).toBe("#123456");
    }
  } finally {
    rtf?.Dispose();
    odt?.Dispose();
    worker?.Dispose();
    document.Dispose();
  }
});

it("keeps the original HTML insertion join's drawing-fill loss on the first paragraph", /** CutImpl's whole-node transfer ends at Writer's HINT_END. @returns Nothing. */ () => {
  const document = new MarkdownReader().Read(
    new TextEncoder().encode('<p style="background-color: #123456">Joined</p>'),
  );
  try {
    expect(document.paragraphs[0]?.GetText()).toBe("Joined");
    expect(background(document, 0)).toBe("transparent");
  } finally {
    document.Dispose();
  }
});

const fixture = "../../vendor/libreoffice-reference/sw/qa/extras/rtfexport/data/fdo47764.rtf";
it.skipIf(!existsSync(fixture))(
  "retains automatic paragraph background in the pinned zero-palette regression",
  /** Uses the original native RTF file. @returns Nothing. */
  () => {
    const document = new RtfDocumentImpl().ResolveBytes(readFileSync(fixture));
    try {
      expect(background(document, 0)).not.toMatch(/^#/u);
    } finally {
      document.Dispose();
    }
  },
);

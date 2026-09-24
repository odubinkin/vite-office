/** @fileoverview Verifies direct Writer paragraph margins through ODT package import and export. */

import { describe, expect, it } from "vitest";

import {
  SvxFirstLineIndentItem,
  SvxLineSpacingItem,
  SvxRightMarginItem,
  SvxULSpaceItem,
} from "../../../../editeng/source/items/paraitem";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { createWriterDocument } from "../../core/doc/doc";
import {
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_LINESPACING,
  RES_UL_SPACE,
} from "../../../inc/hintids";
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
    const writer = createWriterDocument();
    const paragraph = writer.paragraphs[0];
    if (paragraph === undefined) throw new Error("Writer margin paragraph is missing.");
    paragraph.SetParagraphTextLeftMargin(1134);
    const bytes = writeOdtDocument(writer, metadata());
    const content = await new ZipFile(bytes).readTextEntry("content.xml");
    expect(content).toContain('fo:margin-left="2.0003cm"');
    expect(
      (
        await readOdtDocument(bytes, metadata())
      ).document.paragraphs[0]?.GetParagraphTextLeftMargin(),
    ).toBe(1134);
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
      expect(imported.document.paragraphs[0]?.GetParagraphTextLeftMargin()).toBe(expected);
    }
    await expect(
      readOdtDocument(
        await replaceEntry(bytes, "content.xml", content.replace("2.0003cm", "-1cm")),
        metadata(),
      ),
    ).rejects.toThrow("Unsupported ODF paragraph left margin");
  });

  it("round-trips every represented paragraph metric and ignores unknown extension data", /** Verifies symmetric supported properties and tolerant foreign data. @returns Completion after package reads. */ async () => {
    const writer = createWriterDocument();
    const paragraph = writer.paragraphs[0];
    if (paragraph === undefined) throw new Error("Writer paragraph is missing.");
    paragraph.SetAttr(new SvxFirstLineIndentItem(-283, RES_MARGIN_FIRSTLINE));
    paragraph.SetAttr(new SvxRightMarginItem(567, RES_MARGIN_RIGHT));
    paragraph.SetAttr(new SvxULSpaceItem(120, 60, RES_UL_SPACE));
    paragraph.SetAttr(new SvxLineSpacingItem(115, RES_PARATR_LINESPACING));

    const bytes = writeOdtDocument(writer, metadata());
    const content = await new ZipFile(bytes).readTextEntry("content.xml");
    expect(content).toContain('fo:text-indent="-0.4992cm"');
    expect(content).toContain('fo:margin-right="1.0001cm"');
    expect(content).toContain('fo:margin-top="0.2117cm"');
    expect(content).toContain('fo:margin-bottom="0.1058cm"');
    expect(content).toContain('fo:line-height="115%"');

    const onlyUpper = await readOdtDocument(
      await replaceEntry(bytes, "content.xml", content.replace(' fo:margin-bottom="0.1058cm"', "")),
      metadata(),
    );
    expect(
      (onlyUpper.document.paragraphs[0]?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).QueryValue(),
    ).toEqual([120, 0]);
    const onlyLower = await readOdtDocument(
      await replaceEntry(bytes, "content.xml", content.replace(' fo:margin-top="0.2117cm"', "")),
      metadata(),
    );
    expect(
      (onlyLower.document.paragraphs[0]?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).QueryValue(),
    ).toEqual([0, 60]);
    const normal = await readOdtDocument(
      await replaceEntry(bytes, "content.xml", content.replace("115%", "normal")),
      metadata(),
    );
    expect(
      (
        normal.document.paragraphs[0]?.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem
      ).GetPropLineSpace(),
    ).toBe(100);

    const extended = content
      .replace("office:version=", 'xmlns:ext="urn:vite-office:test" office:version=')
      .replace("</text:p>", '<ext:unsupported ext:value="retained-by-source"/></text:p>');
    const opened = await readOdtDocument(
      await replaceEntry(bytes, "content.xml", extended),
      metadata(),
    );
    const node = opened.document.paragraphs[0];
    expect(
      (node?.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem).ResolveTextFirstLineOffset(),
    ).toBe(-283);
    expect((node?.GetAttr(RES_MARGIN_RIGHT) as SvxRightMarginItem).ResolveRight()).toBe(567);
    expect((node?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).QueryValue()).toEqual([120, 60]);
    expect((node?.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem).GetPropLineSpace()).toBe(
      115,
    );
  });

  it("rejects an invalid pooled class before serializing paragraph metrics", /** Verifies exporter type guards. @returns Nothing. */ () => {
    const writer = createWriterDocument();
    writer.paragraphs[0]?.SetAttr(new SfxInt16Item(RES_MARGIN_RIGHT, 12));
    expect(
      /** Serializes an invalid right-margin item. @returns Bytes. */ () =>
        writeOdtDocument(writer, metadata()),
    ).toThrow("ODT paragraph item is invalid");
    const styleWriter = createWriterDocument();
    styleWriter
      .GetTextFormatColl("text-body")
      .SetFormatAttr(new SfxInt16Item(RES_MARGIN_TEXTLEFT, 12));
    expect(
      /** Serializes an invalid named-style left-margin item. @returns Bytes. */ () =>
        writeOdtDocument(styleWriter, metadata()),
    ).toThrow("ODT left-margin item is invalid");
  });
});

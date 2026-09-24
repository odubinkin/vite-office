/** @fileoverview Verifies upstream-mapped Writer color and paragraph compatibility properties through ODT. */

import { describe, expect, it } from "vitest";

import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import {
  SfxBoolItem,
  SfxInt16Item,
  SfxInt16ListItem,
  SfxStringItem,
} from "../../../../svl/source/items/poolitem";
import {
  RES_CHRATR_COLOR,
  RES_CHRATR_HIGHLIGHT,
  RES_KEEP,
  RES_LINENUMBER,
  RES_PARATR_TABSTOP,
} from "../../../inc/hintids";
import { createWriterDocument } from "../../core/doc/doc";
import {
  createWriterTextFragment,
  projectWriterTextRuns,
} from "../../core/txtnode/text-run-projection";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

const metadata = createDocument({ id: "odt-properties", suiteId: "writer", title: "Properties" });

/** Rewrites one package entry. @param bytes - Source package. @param name - Entry path. @param transform - Text transform. @returns Rebuilt bytes. */
async function rewriteEntry(
  bytes: Uint8Array,
  name: string,
  transform: (xml: string) => string,
): Promise<Uint8Array> {
  const input = new ZipFile(bytes);
  const output = new ZipOutputStream();
  for (const entry of input.getEntryNames())
    output.putNextEntry(
      entry,
      entry === name
        ? new TextEncoder().encode(transform(await input.readTextEntry(entry)))
        : await input.readEntry(entry),
    );
  return output.finish();
}

describe("Writer ODT mapped pooled properties", /** Groups symmetric property tests. @returns Nothing. */ () => {
  it("round-trips multiple paragraph tab positions", /** Handles Writer formatting state.  @returns Callback result. */ async () => {
    const writer = createWriterDocument();
    writer.paragraphs[0]?.SetAttr(new SfxInt16ListItem(RES_PARATR_TABSTOP, [720, 1440]));
    const bytes = writeOdtDocument(writer, metadata);
    const content = await new ZipFile(bytes).readTextEntry("content.xml");
    expect(content).toContain('<style:tab-stop style:position="1.27cm"/>');
    expect(content).toContain('<style:tab-stop style:position="2.54cm"/>');
    const reopened = await readOdtDocument(bytes, metadata);
    expect(
      (
        reopened.document.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SfxInt16ListItem
      ).GetValues(),
    ).toEqual([720, 1440]);
  });
  it("round-trips colors, highlight, tab stops, keep-with-next, and line-number participation", /** Verifies direct node and range items survive package serialization. @returns Completion after import. */ async () => {
    const writer = createWriterDocument();
    const paragraph = writer.paragraphs[0];
    if (paragraph === undefined) throw new Error("Writer paragraph is missing.");
    paragraph.SetAttr(new SfxStringItem(RES_CHRATR_COLOR, "#123456"));
    paragraph.SetAttr(new SfxStringItem(RES_CHRATR_HIGHLIGHT, "#fedcba"));
    paragraph.SetAttr(new SfxInt16Item(RES_PARATR_TABSTOP, 720));
    paragraph.SetAttr(new SfxBoolItem(RES_KEEP, true));
    paragraph.SetAttr(new SfxBoolItem(RES_LINENUMBER, false));
    paragraph.ReplaceRange(
      0,
      0,
      createWriterTextFragment(paragraph, [
        {
          attributes: {
            bold: false,
            color: "#abcdef",
            highlight: "transparent",
            italic: false,
            underline: false,
          },
          text: "colored",
        },
      ]),
    );

    const bytes = writeOdtDocument(writer, metadata);
    const content = await new ZipFile(bytes).readTextEntry("content.xml");
    expect(content).toContain('fo:color="#123456"');
    expect(content).toContain('fo:background-color="#fedcba"');
    expect(content).toContain('fo:color="#abcdef"');
    expect(content).toContain('fo:background-color="transparent"');
    expect(content).toContain('fo:keep-with-next="always"');
    expect(content).toContain('text:number-lines="false"');
    expect(content).toContain(
      '<style:tab-stops><style:tab-stop style:position="1.27cm"/></style:tab-stops>',
    );

    const reopened = await readOdtDocument(bytes, metadata);
    const reopenedParagraph = reopened.document.paragraphs[0];
    expect((reopenedParagraph?.GetAttr(RES_CHRATR_COLOR) as SfxStringItem).GetValue()).toBe(
      "#123456",
    );
    expect((reopenedParagraph?.GetAttr(RES_CHRATR_HIGHLIGHT) as SfxStringItem).GetValue()).toBe(
      "#fedcba",
    );
    expect((reopenedParagraph?.GetAttr(RES_PARATR_TABSTOP) as SfxInt16Item).GetValue()).toBe(720);
    expect((reopenedParagraph?.GetAttr(RES_KEEP) as SfxBoolItem).GetValue()).toBe(true);
    expect((reopenedParagraph?.GetAttr(RES_LINENUMBER) as SfxBoolItem).GetValue()).toBe(false);
    expect(projectWriterTextRuns(reopenedParagraph)[0]?.attributes).toMatchObject({
      color: "#abcdef",
      highlight: "transparent",
    });
  });

  it("preserves automatic style colors and rejects unsupported property values", /** Covers upstream automatic-color and strict bounded import behavior. @returns Completion after import failures. */ async () => {
    const writer = createWriterDocument();
    const heading = writer.GetTextFormatColl("heading-1");
    heading.SetFormatAttr(new SfxStringItem(RES_CHRATR_COLOR, "auto"));
    heading.SetFormatAttr(new SfxStringItem(RES_CHRATR_HIGHLIGHT, "transparent"));
    const defaultStyle = writer.GetDfltTextFormatColl();
    defaultStyle.SetFormatAttr(new SfxInt16Item(RES_PARATR_TABSTOP, 360));
    defaultStyle.SetFormatAttr(new SfxBoolItem(RES_KEEP, false));
    defaultStyle.SetFormatAttr(new SfxBoolItem(RES_LINENUMBER, true));
    const bytes = writeOdtDocument(writer, metadata);
    const styles = await new ZipFile(bytes).readTextEntry("styles.xml");
    expect(styles).toContain('style:use-window-font-color="true"');
    expect(styles).toContain('fo:background-color="transparent"');
    expect(styles).toContain('fo:keep-with-next="auto"');
    expect(styles).toContain('text:number-lines="true"');
    const reopened = await readOdtDocument(bytes, metadata);
    expect(
      (
        reopened.document
          .GetTextFormatColl("heading-1")
          .GetAttrSet()
          .Get(RES_CHRATR_COLOR) as SfxStringItem
      ).GetValue(),
    ).toBe("auto");

    await expect(
      readOdtDocument(
        await rewriteEntry(
          bytes,
          "styles.xml",
          /** Injects an invalid highlight. @param xml - Style stream. @returns Changed stream. */ (
            xml,
          ) => xml.replace('fo:background-color="transparent"', 'fo:background-color="pattern"'),
        ),
        metadata,
      ),
    ).rejects.toThrow("Unsupported ODF highlight color");
    await expect(
      readOdtDocument(
        await rewriteEntry(
          bytes,
          "styles.xml",
          /** Injects an invalid foreground color. @param xml - Style stream. @returns Changed stream. */ (
            xml,
          ) => xml.replace('style:use-window-font-color="true"', 'fo:color="named-red"'),
        ),
        metadata,
      ),
    ).rejects.toThrow("Unsupported ODF font color");
    await expect(
      readOdtDocument(
        await rewriteEntry(
          bytes,
          "styles.xml",
          /** Injects an invalid keep value. @param xml - Style stream. @returns Changed stream. */ (
            xml,
          ) => xml.replace('fo:keep-with-next="auto"', 'fo:keep-with-next="sometimes"'),
        ),
        metadata,
      ),
    ).rejects.toThrow("Unsupported ODF keep-with-next");
    await expect(
      readOdtDocument(
        await rewriteEntry(
          bytes,
          "styles.xml",
          /** Injects an invalid ODF boolean. @param xml - Style stream. @returns Changed stream. */ (
            xml,
          ) => xml.replace('text:number-lines="true"', 'text:number-lines="yes"'),
        ),
        metadata,
      ),
    ).rejects.toThrow("paragraph line-number participation");

    const tabWriter = createWriterDocument();
    tabWriter.paragraphs[0]?.SetAttr(new SfxInt16Item(RES_PARATR_TABSTOP, 720));
    tabWriter.GetDfltTextFormatColl().SetFormatAttr(new SfxInt16Item(RES_PARATR_TABSTOP, 360));
    const tabBytes = writeOdtDocument(tabWriter, metadata);
    const multiTabOpened = await readOdtDocument(
      await rewriteEntry(
        tabBytes,
        "content.xml",
        /** Adds a second modeled tab stop. @param xml - Content stream. @returns Changed stream. */ (
          xml,
        ) =>
          xml.replace(
            "</style:tab-stops>",
            '<style:tab-stop style:position="2cm"/></style:tab-stops>',
          ),
      ),
      metadata,
    );
    expect(
      (
        multiTabOpened.document.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SfxInt16ListItem
      ).GetValues(),
    ).toEqual([720, 1134]);
    await expect(
      readOdtDocument(
        await rewriteEntry(
          tabBytes,
          "content.xml",
          /** Replaces the tab-stop child with an invalid property child. @param xml - Content stream. @returns Changed stream. */ (
            xml,
          ) =>
            xml.replace(/<style:tab-stop style:position="[^"]+"\/>/u, "<style:text-properties/>"),
        ),
        metadata,
      ),
    ).rejects.toThrow("Unsupported ODF XML element");

    const textChildBytes = await rewriteEntry(
      bytes,
      "styles.xml",
      /** Adds a paragraph-only element beneath text properties. @param xml - Style stream. @returns Changed stream. */ (
        xml,
      ) =>
        xml.replace(
          /(<style:text-properties[^>]*)\/>/u,
          "$1><style:tab-stops/></style:text-properties>",
        ),
    );
    await expect(readOdtDocument(textChildBytes, metadata)).rejects.toThrow(
      "Unsupported ODF XML element",
    );

    heading.SetFormatAttr(new SfxStringItem(RES_CHRATR_COLOR, "named-red"));
    expect(
      /** Exports an invalid bounded color. @returns Bytes. */ () =>
        writeOdtDocument(writer, metadata),
    ).toThrow("Unsupported ODF font color");
  });
});

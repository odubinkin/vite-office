/** @fileoverview Verifies upstream-mapped Writer color and paragraph compatibility properties through ODT. */

import { describe, expect, it } from "vitest";

import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import {
  SvxTabAdjust,
  SvxTabStop,
  SvxTabStopItem,
  SvxFirstLineIndentItem,
} from "../../../../editeng/source/items/paraitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import {
  RES_CHRATR_COLOR,
  RES_CHRATR_HIGHLIGHT,
  RES_MARGIN_FIRSTLINE,
  RES_KEEP,
  RES_BREAK,
  RES_PAGEDESC,
  RES_PARATR_SPLIT,
  RES_PARATR_ORPHANS,
  RES_PARATR_WIDOWS,
  RES_LINENUMBER,
  RES_PARATR_TABSTOP,
} from "../../../inc/hintids";
import { createWriterDocument } from "../../core/doc/doc";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { createWriterTextFragment } from "../basflt/writer-transfer";
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
  it("preserves direct and inherited pagination items with explicit defaults", /** Checks Writer split, widow, orphan and page-break serialization. @returns Completion after reimport. */ async () => {
    const pageReference = new SwFormatPageDesc("Standard", 3);
    expect(pageReference.QueryValue()).toEqual(["Standard", 3]);
    expect(pageReference.Clone().equals(pageReference)).toBe(true);
    expect(pageReference.equals(new SwFormatPageDesc("Standard", 4))).toBe(false);
    expect(pageReference.equals(new SfxInt16Item(RES_BREAK, 4))).toBe(false);
    expect(new SwFormatPageDesc().QueryValue()).toEqual(["", 0]);
    expect(
      /** Creates an invalid page-number restart. @returns Invalid item. */ () =>
        new SwFormatPageDesc("Standard", 0),
    ).toThrow("page-number offset");
    const writer = createWriterDocument();
    expect(
      (
        writer
          .GetAttrPool()
          .CreateItem({ which: RES_PAGEDESC, value: ["Standard", 3] }) as SwFormatPageDesc
      ).GetNumOffset(),
    ).toBe(3);
    expect(
      (
        writer.GetAttrPool().CreateItem({ which: RES_PAGEDESC, value: ["", 0] }) as SwFormatPageDesc
      ).GetNumOffset(),
    ).toBeUndefined();
    expect(
      (writer.GetAttrPool().CreateItem({ which: RES_BREAK, value: 4 }) as SfxInt16Item).GetValue(),
    ).toBe(4);
    expect(
      (
        writer
          .GetAttrPool()
          .CreateItem({ which: RES_MARGIN_FIRSTLINE, value: [0, 1] }) as SvxFirstLineIndentItem
      ).IsAutoFirst(),
    ).toBe(true);
    const inherited = writer.GetTextFormatColl("heading-1");
    inherited.SetFormatAttr(new SfxInt16Item(RES_PARATR_ORPHANS, 3));
    inherited.SetFormatAttr(new SfxBoolItem(RES_PARATR_SPLIT, false));
    inherited.SetFormatAttr(new SvxFirstLineIndentItem(0, RES_MARGIN_FIRSTLINE, true));
    inherited.SetFormatAttr(new SwFormatPageDesc("Standard"));
    const paragraph = writer.paragraphs[0];
    if (paragraph === undefined) throw new Error("Writer paragraph is missing.");
    paragraph.ChgFormatColl(inherited);
    paragraph.SetAttr(new SfxInt16Item(RES_PARATR_WIDOWS, 0));
    paragraph.SetAttr(new SfxInt16Item(RES_BREAK, 6));
    paragraph.SetAttr(new SwFormatPageDesc("Standard", 3));
    const after = writer.GetNodes().MakeTextNode();
    after.SetAttr(new SfxInt16Item(RES_BREAK, 5));
    after.SetAttr(new SwFormatPageDesc(""));
    const automatic = writer.GetNodes().MakeTextNode();
    automatic.SetAttr(new SfxInt16Item(RES_BREAK, 0));
    automatic.SetAttr(new SfxBoolItem(RES_PARATR_SPLIT, true));
    automatic.SetAttr(new SfxInt16Item(RES_PARATR_ORPHANS, 0));
    const bytes = writeOdtDocument(writer, metadata);
    const content = await new ZipFile(bytes).readTextEntry("content.xml");
    const styles = await new ZipFile(bytes).readTextEntry("styles.xml");
    expect(styles).toContain('fo:keep-together="always"');
    expect(styles).toContain('fo:orphans="3"');
    expect(styles).toContain('style:auto-text-indent="true"');
    expect(styles).toContain('style:master-page-name="Standard"');
    expect(content).toContain('fo:widows="0"');
    expect(content).toContain('fo:break-before="page"');
    expect(content).toContain('fo:break-after="page"');
    expect(content).toContain('style:master-page-name="Standard"');
    expect(content).toContain('style:page-number="3"');
    expect(content).toContain('fo:keep-together="auto"');
    expect(content).toContain('fo:orphans="0"');
    const reopened = await readOdtDocument(bytes, metadata);
    const node = reopened.document.paragraphs[0];
    expect((node?.GetAttr(RES_PARATR_SPLIT) as SfxBoolItem).GetValue()).toBe(false);
    expect((node?.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem).IsAutoFirst()).toBe(
      true,
    );
    expect(node?.GetParagraphFirstLineIndent()).toBeGreaterThan(0);
    expect((node?.GetAttr(RES_PARATR_ORPHANS) as SfxInt16Item).GetValue()).toBe(3);
    expect((node?.GetAttr(RES_PARATR_WIDOWS) as SfxInt16Item).GetValue()).toBe(0);
    expect((node?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(6);
    expect((node?.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetPageDescName()).toBe("Standard");
    expect((node?.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetNumOffset()).toBe(3);
    expect((reopened.document.paragraphs[1]?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(
      5,
    );
    expect((reopened.document.paragraphs[2]?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(
      0,
    );
    expect(
      (reopened.document.paragraphs[2]?.GetAttr(RES_PARATR_SPLIT) as SfxBoolItem).GetValue(),
    ).toBe(true);
    expect(
      (reopened.document.paragraphs[2]?.GetAttr(RES_PARATR_ORPHANS) as SfxInt16Item).GetValue(),
    ).toBe(0);
    expect(
      (reopened.document.paragraphs[1]?.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetNumOffset(),
    ).toBeUndefined();
    for (const invalid of [
      {
        entry: "styles.xml",
        from: 'fo:keep-together="always"',
        to: 'fo:keep-together="sometimes"',
        error: "Unsupported ODF keep-together",
      },
      {
        entry: "styles.xml",
        from: 'style:auto-text-indent="true"',
        to: 'style:auto-text-indent="maybe"',
        error: "Unsupported ODF automatic first-line indent",
      },
      {
        entry: "content.xml",
        from: 'fo:break-before="page"',
        to: 'fo:break-before="column"',
        error: "Unsupported ODF break-before",
      },
      {
        entry: "content.xml",
        from: 'style:page-number="3"',
        to: 'style:page-number="bad"',
        error: "Unsupported ODF page number",
      },
    ])
      await expect(
        readOdtDocument(
          await rewriteEntry(
            bytes,
            invalid.entry,
            /** Inserts one unsupported semantic value. @param xml - Stream. @returns Invalid XML. */
            (xml) => xml.replace(invalid.from, invalid.to),
          ),
          metadata,
        ),
      ).rejects.toThrow(invalid.error);
    await expect(
      readOdtDocument(
        await rewriteEntry(
          bytes,
          "content.xml",
          /** Inserts invalid widow count. @param xml - Stream. @returns Invalid XML. */
          (xml) => xml.replace('fo:widows="0"', 'fo:widows="bad"'),
        ),
        metadata,
      ),
    ).rejects.toThrow("Unsupported ODF widows");
  });
  it("keeps upstream tab alignment and leader choices through ODT", /** Checks tab-stop type and leader serialization. @returns Completion after import. */ async () => {
    const writer = createWriterDocument();
    writer.paragraphs[0]?.SetAttr(
      SvxTabStopItem.FromStops(RES_PARATR_TABSTOP, [
        new SvxTabStop(360, SvxTabAdjust.Left),
        new SvxTabStop(720, SvxTabAdjust.Center, ".", "_"),
        new SvxTabStop(1080, SvxTabAdjust.Default),
        new SvxTabStop(1440, SvxTabAdjust.Right),
        new SvxTabStop(1800, SvxTabAdjust.Decimal, ";", "."),
      ]),
    );
    const bytes = writeOdtDocument(writer, metadata);
    const reopened = await readOdtDocument(bytes, metadata);
    const tabs = reopened.document.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
    expect(
      tabs.GetStops().map(
        /** Projects imported tab alignment. @param stop - Tab stop. @returns Adjustment. */
        (stop) => stop.GetAdjustment(),
      ),
    ).toEqual([
      SvxTabAdjust.Left,
      SvxTabAdjust.Center,
      SvxTabAdjust.Default,
      SvxTabAdjust.Right,
      SvxTabAdjust.Decimal,
    ]);
    expect(tabs.At(1).GetFill()).toBe("_");
    expect(tabs.At(4).GetDecimal()).toBe(";");
    const withoutLeaderText = await readOdtDocument(
      await rewriteEntry(
        bytes,
        "content.xml",
        /** Removes leader text so ODF style defaults apply. @param xml - ODF content. @returns Rewritten content. */
        (xml) =>
          xml.replaceAll(' style:leader-text="_"', "").replaceAll(' style:leader-text="."', ""),
      ),
      metadata,
    );
    const inferredTabs = withoutLeaderText.document.paragraphs[0]?.GetAttr(
      RES_PARATR_TABSTOP,
    ) as SvxTabStopItem;
    expect(inferredTabs.At(1).GetFill()).toBe("_");
    expect(inferredTabs.At(4).GetFill()).toBe(".");
    const withoutLeader = await readOdtDocument(
      await rewriteEntry(
        bytes,
        "content.xml",
        /** Changes a leader to none. @param xml - ODF content. @returns Rewritten content. */
        (xml) => xml.replace('style:leader-style="solid"', 'style:leader-style="none"'),
      ),
      metadata,
    );
    expect(
      (withoutLeader.document.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem)
        .At(1)
        .GetFill(),
    ).toBe(" ");
    await expect(
      readOdtDocument(
        await rewriteEntry(
          bytes,
          "content.xml",
          /** Replaces a supported tab type. @param xml - ODF content. @returns Invalid content. */
          (xml) => xml.replace('style:type="center"', 'style:type="unsupported"'),
        ),
        metadata,
      ),
    ).rejects.toThrow("Unsupported ODF tab-stop type");
  });
  it("keeps an explicit empty tab sequence through ODT", /** Keeps a tab clear distinct from an inherited default. @returns Completion after import. */ async () => {
    const writer = createWriterDocument();
    writer.paragraphs[0]?.SetAttr(SvxTabStopItem.FromStops(RES_PARATR_TABSTOP, []));
    const bytes = writeOdtDocument(writer, metadata);
    expect(await new ZipFile(bytes).readTextEntry("content.xml")).toContain("<style:tab-stops/>");
    const reopened = await readOdtDocument(bytes, metadata);
    expect(
      (reopened.document.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem).Count(),
    ).toBe(0);
  });
  it("round-trips multiple paragraph tab positions", /** Handles Writer formatting state.  @returns Callback result. */ async () => {
    const writer = createWriterDocument();
    writer.paragraphs[0]?.SetAttr(
      SvxTabStopItem.FromStops(RES_PARATR_TABSTOP, [
        new SvxTabStop(720, SvxTabAdjust.Right),
        new SvxTabStop(1440, SvxTabAdjust.Decimal, ".", "."),
      ]),
    );
    const bytes = writeOdtDocument(writer, metadata);
    const content = await new ZipFile(bytes).readTextEntry("content.xml");
    expect(content).toContain('<style:tab-stop style:position="1.27cm" style:type="right"/>');
    expect(content).toContain(
      'style:position="2.54cm" style:type="char" style:char="." style:leader-style="dotted" style:leader-text="."',
    );
    const reopened = await readOdtDocument(bytes, metadata);
    expect(
      (reopened.document.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem).QueryValue()
        .stops,
    ).toEqual([
      { position: 720, adjustment: SvxTabAdjust.Right, decimal: ",", fill: " " },
      { position: 1440, adjustment: SvxTabAdjust.Decimal, decimal: ".", fill: "." },
    ]);
  });
  it("round-trips colors, highlight, tab stops, keep-with-next, and line-number participation", /** Verifies direct node and range items survive package serialization. @returns Completion after import. */ async () => {
    const writer = createWriterDocument();
    const paragraph = writer.paragraphs[0];
    if (paragraph === undefined) throw new Error("Writer paragraph is missing.");
    paragraph.SetAttr(new SfxStringItem(RES_CHRATR_COLOR, "#123456"));
    paragraph.SetAttr(new SfxStringItem(RES_CHRATR_HIGHLIGHT, "#fedcba"));
    paragraph.SetAttr(SvxTabStopItem.FromStops(RES_PARATR_TABSTOP, [new SvxTabStop(720)]));
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
      '<style:tab-stops><style:tab-stop style:position="1.27cm" style:type="left"/></style:tab-stops>',
    );

    const reopened = await readOdtDocument(bytes, metadata);
    const reopenedParagraph = reopened.document.paragraphs[0];
    expect((reopenedParagraph?.GetAttr(RES_CHRATR_COLOR) as SfxStringItem).GetValue()).toBe(
      "#123456",
    );
    expect((reopenedParagraph?.GetAttr(RES_CHRATR_HIGHLIGHT) as SfxStringItem).GetValue()).toBe(
      "#fedcba",
    );
    expect(
      (reopenedParagraph?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem).At(0).GetTabPos(),
    ).toBe(720);
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
    defaultStyle.SetFormatAttr(SvxTabStopItem.FromStops(RES_PARATR_TABSTOP, [new SvxTabStop(360)]));
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
    tabWriter.paragraphs[0]?.SetAttr(
      SvxTabStopItem.FromStops(RES_PARATR_TABSTOP, [new SvxTabStop(720)]),
    );
    tabWriter
      .GetDfltTextFormatColl()
      .SetFormatAttr(SvxTabStopItem.FromStops(RES_PARATR_TABSTOP, [new SvxTabStop(360)]));
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
      (multiTabOpened.document.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem)
        .GetStops()
        .map(
          /** Projects a restored tab. @param stop - Tab stop. @returns Twips. */
          (stop) => stop.GetTabPos(),
        ),
    ).toEqual([720, 1134]);
    await expect(
      readOdtDocument(
        await rewriteEntry(
          tabBytes,
          "content.xml",
          /** Replaces the tab-stop child with an invalid property child. @param xml - Content stream. @returns Changed stream. */ (
            xml,
          ) =>
            xml.replace(
              /<style:tab-stop style:position="[^"]+"[^>]*\/>/u,
              "<style:text-properties/>",
            ),
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

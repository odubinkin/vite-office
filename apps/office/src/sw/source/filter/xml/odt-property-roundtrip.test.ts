/** @fileoverview Verifies upstream-mapped Writer color and paragraph compatibility properties through ODT. */

import { describe, expect, it } from "vitest";

import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import {
  SvxTabAdjust,
  SvxTabStop,
  SvxTabStopItem,
} from "../../../../editeng/source/items/paraitem";
import { SfxBoolItem, SfxStringItem } from "../../../../svl/source/items/poolitem";
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

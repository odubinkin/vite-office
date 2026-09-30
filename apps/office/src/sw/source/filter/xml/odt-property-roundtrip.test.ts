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
import { SvxFirstLineIndentItem } from "../../../../editeng/source/items/frmitems";
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
  it("imports and round-trips signed tab positions in paragraph and inherited style properties", /** Preserves negative ODF positions and their alignment/leader choices across package cycles. @returns Completion after reimport. */ async () => {
    const writer = createWriterDocument();
    const inherited = SvxTabStopItem.FromStops(RES_PARATR_TABSTOP, [
      new SvxTabStop(-360, SvxTabAdjust.Right, ".", "_"),
    ]);
    writer.GetDfltTextFormatColl().SetFormatAttr(inherited);
    writer.paragraphs[0]?.SetAttr(
      SvxTabStopItem.FromStops(RES_PARATR_TABSTOP, [
        new SvxTabStop(720, SvxTabAdjust.Decimal, ";", "."),
        new SvxTabStop(0, SvxTabAdjust.Left, ".", " "),
        new SvxTabStop(1440, SvxTabAdjust.Center, ".", "_"),
      ]),
    );
    const input = await rewriteEntry(
      writeOdtDocument(writer, metadata),
      "content.xml",
      /** Moves the explicit decimal stop to a negative position in the input package. @param xml - ODF content. @returns Signed input. */
      (xml) => xml.replace('style:position="1.27cm"', 'style:position="-1.27cm"'),
    );
    expect(await new ZipFile(input).readTextEntry("content.xml")).toContain(
      'style:position="-1.27cm"',
    );
    const imported = await readOdtDocument(input, metadata);
    const expected = SvxTabStopItem.FromStops(RES_PARATR_TABSTOP, [
      new SvxTabStop(-720, SvxTabAdjust.Decimal, ";", "."),
      new SvxTabStop(0, SvxTabAdjust.Left, ",", " "),
      new SvxTabStop(1440, SvxTabAdjust.Center, ",", "_"),
    ]);
    expect(
      (imported.document.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem).equals(
        expected,
      ),
    ).toBe(true);
    const importedStyle = imported.document
      .GetDfltTextFormatColl()
      .GetAttrSet()
      .Get(RES_PARATR_TABSTOP) as SvxTabStopItem;
    expect(importedStyle.At(0).GetTabPos()).toBe(-360);
    expect(importedStyle.At(0).GetAdjustment()).toBe(SvxTabAdjust.Right);
    expect(importedStyle.At(0).GetFill()).toBe("_");
    const output = writeOdtDocument(imported.document, metadata);
    expect(await new ZipFile(output).readTextEntry("content.xml")).toContain(
      'style:position="-1.27cm"',
    );
    expect(await new ZipFile(output).readTextEntry("styles.xml")).toContain(
      'style:position="-0.635cm"',
    );
    const reopened = await readOdtDocument(output, metadata);
    expect(
      (reopened.document.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem).equals(
        expected,
      ),
    ).toBe(true);
    expect(
      (
        reopened.document
          .GetDfltTextFormatColl()
          .GetAttrSet()
          .Get(RES_PARATR_TABSTOP) as SvxTabStopItem
      ).equals(importedStyle),
    ).toBe(true);
  });

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
  it("keeps tab leaf values independent from ignored descendant subtrees", /** Checks leaf lifecycle, native subtree skipping and sibling selection through direct/inherited package cycles. @returns Completion after reimport. */ async () => {
    const writer = createWriterDocument();
    const placeholder = SvxTabStopItem.FromStops(RES_PARATR_TABSTOP, [new SvxTabStop(360)]);
    writer.GetDfltTextFormatColl().SetFormatAttr(placeholder);
    writer.paragraphs[0]?.SetAttr(placeholder);
    let input = writeOdtDocument(writer, metadata);
    const fixture =
      '<style:tab-stops><style:tab-stop style:position="36pt" style:type="char" style:char=";" style:leader-style="solid" style:leader-text="_">discarded text<style:tab-stops><style:tab-stop style:position="-72pt" style:type="default"/><style:tab-stop style:position="0pt" style:type="right"/></style:tab-stops><probe:container xmlns:probe="urn:tab-leaf-test"><text:p>discarded paragraph<text:span>discarded span</text:span></text:p><style:tab-stop style:position="108pt" style:type="center"/></probe:container></style:tab-stop><style:tab-stop style:position="72pt" style:type="right"/></style:tab-stops>';
    for (const entry of ["content.xml", "styles.xml"])
      input = await rewriteEntry(
        input,
        entry,
        /** Inserts nested known/unknown XML under one leaf. @param xml - Package stream. @returns Literal subtree fixture. */
        (xml) => xml.replace(/<style:tab-stops>[\s\S]*?<\/style:tab-stops>/gu, fixture),
      );
    const imported = await readOdtDocument(input, metadata);
    const reopened = await readOdtDocument(writeOdtDocument(imported.document, metadata), metadata);
    for (const document of [imported.document, reopened.document]) {
      const direct = document.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
      const inherited = document
        .GetDfltTextFormatColl()
        .GetAttrSet()
        .Get(RES_PARATR_TABSTOP) as SvxTabStopItem;
      for (const item of [direct, inherited])
        expect(
          item.GetStops().map(
            /** Projects all tab fields after leaf dispatch. @param stop - Imported tab. @returns Retained fields. */
            (stop) => [stop.GetTabPos(), stop.GetAdjustment(), stop.GetDecimal(), stop.GetFill()],
          ),
        ).toEqual([
          [720, SvxTabAdjust.Decimal, ";", "_"],
          [1440, SvxTabAdjust.Right, ",", " "],
        ]);
      expect(document.paragraphs).toHaveLength(1);
      expect(document.paragraphs[0]?.GetText()).toBe("");
    }
  });

  it("imports native MM100 tab measures and conversion failure through ODT", /** Checks native parse/failure/quantization before Writer conversion through direct and inherited package cycles. @returns Completion after reimport. */ async () => {
    const writer = createWriterDocument();
    const placeholder = SvxTabStopItem.FromStops(RES_PARATR_TABSTOP, [new SvxTabStop(360)]);
    writer.GetDfltTextFormatColl().SetFormatAttr(placeholder);
    writer.paragraphs[0]?.SetAttr(placeholder);
    const base = writeOdtDocument(writer, metadata);
    const cases = [
      {
        name: "malformed position retains zero and other fields",
        xml: '<style:tab-stop style:position="bad" style:type="char" style:char=";" style:leader-style="solid" style:leader-text="_"/>',
        expected: [[0, SvxTabAdjust.Decimal, ";", "_"]],
      },
      {
        name: "empty position",
        xml: '<style:tab-stop style:position=""/>',
        expected: [[0, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "exponent syntax fails",
        xml: '<style:tab-stop style:position="1e3pt"/>',
        expected: [[0, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "positive sign fails",
        xml: '<style:tab-stop style:position="+1pt"/>',
        expected: [[0, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "relative unit fails",
        xml: '<style:tab-stop style:position="1em"/>',
        expected: [[0, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "unit suffix without space fails",
        xml: '<style:tab-stop style:position="1ptjunk"/>',
        expected: [[0, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "tab after unit fails",
        xml: '<style:tab-stop style:position="1pt&#9;"/>',
        expected: [[0, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "positive MM100 quantization differs from direct twips",
        xml: '<style:tab-stop style:position="0.024pt"/>',
        expected: [[1, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "negative MM100 quantization differs from direct twips",
        xml: '<style:tab-stop style:position="-0.024pt"/>',
        expected: [[-1, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "negative half rounds away from zero",
        xml: '<style:tab-stop style:position="-0.025pt"/>',
        expected: [[-1, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "unitless native property units",
        xml: '<style:tab-stop style:position="1"/>',
        expected: [[1, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "unitless positive half",
        xml: '<style:tab-stop style:position=".5"/>',
        expected: [[1, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "unitless negative half",
        xml: '<style:tab-stop style:position="-.5"/>',
        expected: [[-1, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "pixels supported by native MM100 target",
        xml: '<style:tab-stop style:position="1px"/>',
        expected: [[15, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "pica",
        xml: '<style:tab-stop style:position="1pc"/>',
        expected: [[240, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "case insensitive units with native trailing-space grammar",
        xml: '<style:tab-stop style:position="1PT trailing"/>',
        expected: [[20, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "leading and interior whitespace",
        xml: '<style:tab-stop style:position=" &#9;-.5 CM"/>',
        expected: [[-283, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "positive property saturation before Writer conversion",
        xml: '<style:tab-stop style:position="999999999999999999mm"/>',
        expected: [[1217471044, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "negative property saturation before Writer conversion",
        xml: '<style:tab-stop style:position="-999999999999999999mm"/>',
        expected: [[-1217471045, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "colliding converted positions use later native item insertion",
        xml: '<style:tab-stop style:position="0.01pt"/><style:tab-stop style:position="bad" style:type="right" style:leader-style="solid" style:leader-text="!"/>',
        expected: [[0, SvxTabAdjust.Right, ",", "!"]],
      },
    ] as const;
    for (const testCase of cases) {
      let input = base;
      for (const entry of ["content.xml", "styles.xml"]) {
        input = await rewriteEntry(
          input,
          entry,
          /** Injects the literal sequence without sorting it. @param xml - Input stream. @returns Sequence fixture. */
          (xml) =>
            xml.replace(
              /<style:tab-stops>[\s\S]*?<\/style:tab-stops>/gu,
              `<style:tab-stops>${testCase.xml}</style:tab-stops>`,
            ),
        );
      }
      const loaded = await readOdtDocument(input, metadata);
      const reopened = await readOdtDocument(writeOdtDocument(loaded.document, metadata), metadata);
      for (const document of [loaded.document, reopened.document]) {
        const direct = document.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
        const inherited = document
          .GetDfltTextFormatColl()
          .GetAttrSet()
          .Get(RES_PARATR_TABSTOP) as SvxTabStopItem;
        for (const item of [direct, inherited]) {
          expect(
            item.GetStops().map(
              /** Projects all retained tab fields. @param stop - Imported stop. @returns Comparable fields. */
              (stop) => [stop.GetTabPos(), stop.GetAdjustment(), stop.GetDecimal(), stop.GetFill()],
            ),
            testCase.name,
          ).toEqual(testCase.expected);
        }
      }
    }
    expect(placeholder.Count()).toBe(1);
    expect(placeholder.At(0).GetTabPos()).toBe(360);
  });

  it("imports native tab position and alignment defaults through direct and inherited ODT styles", /** Checks literal native initialization and recognized-only overrides through package cycles. @returns Completion after reimport. */ async () => {
    const writer = createWriterDocument();
    const placeholder = SvxTabStopItem.FromStops(RES_PARATR_TABSTOP, [new SvxTabStop(360)]);
    writer.GetDfltTextFormatColl().SetFormatAttr(placeholder);
    writer.paragraphs[0]?.SetAttr(placeholder);
    const base = writeOdtDocument(writer, metadata);
    const cases = [
      { name: "bare tab", xml: "<style:tab-stop/>", expected: [[0, SvxTabAdjust.Left, ",", " "]] },
      {
        name: "missing position with explicit right",
        xml: '<style:tab-stop style:type="right"/>',
        expected: [[0, SvxTabAdjust.Right, ",", " "]],
      },
      {
        name: "empty type",
        xml: '<style:tab-stop style:type=""/>',
        expected: [[0, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "unknown type retains signed position",
        xml: '<style:tab-stop style:position="-18pt" style:type="unsupported"/>',
        expected: [[-360, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "tokens are case sensitive",
        xml: '<style:tab-stop style:type="RIGHT"/>',
        expected: [[0, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "tokens are not trimmed",
        xml: '<style:tab-stop style:type=" right "/>',
        expected: [[0, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "missing type with explicit position",
        xml: '<style:tab-stop style:position="18pt"/>',
        expected: [[360, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "explicit left",
        xml: '<style:tab-stop style:type="left"/>',
        expected: [[0, SvxTabAdjust.Left, ",", " "]],
      },
      {
        name: "explicit center",
        xml: '<style:tab-stop style:type="center"/>',
        expected: [[0, SvxTabAdjust.Center, ",", " "]],
      },
      {
        name: "explicit char and empty decimal",
        xml: '<style:tab-stop style:type="char" style:char=""/>',
        expected: [[0, SvxTabAdjust.Decimal, ",", " "]],
      },
      {
        name: "explicit default",
        xml: '<style:tab-stop style:type="default"/>',
        expected: [[0, SvxTabAdjust.Default, ",", " "]],
      },
      {
        name: "unknown first type stays LEFT and later Default is omitted",
        xml: '<style:tab-stop style:type="unknown"/><style:tab-stop style:position="36pt" style:type="default"/><style:tab-stop style:position="18pt" style:type="right"/>',
        expected: [
          [0, SvxTabAdjust.Left, ",", " "],
          [360, SvxTabAdjust.Right, ",", " "],
        ],
      },
    ] as const;
    for (const testCase of cases) {
      let input = base;
      for (const entry of ["content.xml", "styles.xml"]) {
        input = await rewriteEntry(
          input,
          entry,
          /** Injects the literal sequence without sorting it. @param xml - Input stream. @returns Sequence fixture. */
          (xml) =>
            xml.replace(
              /<style:tab-stops>[\s\S]*?<\/style:tab-stops>/gu,
              `<style:tab-stops>${testCase.xml}</style:tab-stops>`,
            ),
        );
      }
      const loaded = await readOdtDocument(input, metadata);
      const reopened = await readOdtDocument(writeOdtDocument(loaded.document, metadata), metadata);
      for (const document of [loaded.document, reopened.document]) {
        const direct = document.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
        const inherited = document
          .GetDfltTextFormatColl()
          .GetAttrSet()
          .Get(RES_PARATR_TABSTOP) as SvxTabStopItem;
        for (const item of [direct, inherited]) {
          expect(
            item.GetStops().map(
              /** Projects all retained tab fields. @param stop - Imported stop. @returns Comparable fields. */
              (stop) => [stop.GetTabPos(), stop.GetAdjustment(), stop.GetDecimal(), stop.GetFill()],
            ),
            testCase.name,
          ).toEqual(testCase.expected);
        }
      }
    }
    expect(placeholder.Count()).toBe(1);
    expect(placeholder.At(0).GetTabPos()).toBe(360);
  });

  it("selects Default tab entries in XML source order before canonical sorting", /** Checks native first-Default exclusivity and later-Default omission across direct/style package cycles. @returns Completion after reimport. */ async () => {
    const writer = createWriterDocument();
    const placeholder = SvxTabStopItem.FromStops(RES_PARATR_TABSTOP, [new SvxTabStop(360)]);
    writer.GetDfltTextFormatColl().SetFormatAttr(placeholder);
    writer.paragraphs[0]?.SetAttr(placeholder);
    const base = writeOdtDocument(writer, metadata);
    const cases = [
      {
        name: "first default keeps only itself despite following lower signed positions",
        xml: '<style:tab-stops><style:tab-stop style:position="36pt" style:type="default" style:leader-style="solid" style:leader-text="_"/><style:tab-stop style:position="-36pt" style:type="left"/><style:tab-stop style:position="72pt" style:type="right"/><style:tab-stop style:position="0pt" style:type="default"/></style:tab-stops>',
        expected: [[720, SvxTabAdjust.Default, ",", "_"]],
      },
      {
        name: "later defaults are skipped while normal fields and signed positions survive",
        xml: '<style:tab-stops><style:tab-stop style:position="72pt" style:type="right" style:leader-style="solid" style:leader-text="_"/><style:tab-stop style:position="-36pt" style:type="default"/><style:tab-stop style:position="-18pt" style:type="center"/><style:tab-stop style:position="0pt" style:type="default"/><style:tab-stop style:position="36pt" style:type="char" style:char=";" style:leader-style="dotted" style:leader-text="."/></style:tab-stops>',
        expected: [
          [-360, SvxTabAdjust.Center, ",", " "],
          [720, SvxTabAdjust.Decimal, ";", "."],
          [1440, SvxTabAdjust.Right, ",", "_"],
        ],
      },
      {
        name: "multiple defaults retain the first in source order",
        xml: '<style:tab-stops><style:tab-stop style:position="36pt" style:type="default"/><style:tab-stop style:position="-36pt" style:type="default"/></style:tab-stops>',
        expected: [[720, SvxTabAdjust.Default, ",", " "]],
      },
      {
        name: "single signed default is retained",
        xml: '<style:tab-stops><style:tab-stop style:position="-18pt" style:type="default"/></style:tab-stops>',
        expected: [[-360, SvxTabAdjust.Default, ",", " "]],
      },
      {
        name: "normal stops are sorted only after selection",
        xml: '<style:tab-stops><style:tab-stop style:position="72pt" style:type="right"/><style:tab-stop style:position="-36pt" style:type="left"/></style:tab-stops>',
        expected: [
          [-720, SvxTabAdjust.Left, ",", " "],
          [1440, SvxTabAdjust.Right, ",", " "],
        ],
      },
      { name: "empty sequence remains an explicit clear", xml: "<style:tab-stops/>", expected: [] },
    ] as const;
    for (const testCase of cases) {
      let input = base;
      for (const entry of ["content.xml", "styles.xml"]) {
        input = await rewriteEntry(
          input,
          entry,
          /** Injects the literal sequence without sorting it. @param xml - Input stream. @returns Sequence fixture. */
          (xml) => xml.replace(/<style:tab-stops>[\s\S]*?<\/style:tab-stops>/gu, testCase.xml),
        );
      }
      const loaded = await readOdtDocument(input, metadata);
      const reopened = await readOdtDocument(writeOdtDocument(loaded.document, metadata), metadata);
      for (const document of [loaded.document, reopened.document]) {
        const direct = document.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
        const inherited = document
          .GetDfltTextFormatColl()
          .GetAttrSet()
          .Get(RES_PARATR_TABSTOP) as SvxTabStopItem;
        for (const item of [direct, inherited]) {
          expect(
            item.GetStops().map(
              /** Projects all retained tab fields. @param stop - Imported stop. @returns Comparable fields. */
              (stop) => [stop.GetTabPos(), stop.GetAdjustment(), stop.GetDecimal(), stop.GetFill()],
            ),
            testCase.name,
          ).toEqual(testCase.expected);
        }
      }
    }
    expect(placeholder.Count()).toBe(1);
    expect(placeholder.At(0).GetTabPos()).toBe(360);
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
    ).toEqual([SvxTabAdjust.Left, SvxTabAdjust.Center, SvxTabAdjust.Right, SvxTabAdjust.Decimal]);
    expect(tabs.GetPos(1080)).toBe(65535);
    expect(tabs.At(1).GetFill()).toBe("_");
    expect(tabs.At(3).GetDecimal()).toBe(";");
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
    expect(inferredTabs.At(3).GetFill()).toBe(".");
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
    const unknownType = await readOdtDocument(
      await rewriteEntry(
        bytes,
        "content.xml",
        /** Uses an unrecognized type that retains native LEFT. @param xml - ODF content. @returns Defaulted content. */
        (xml) => xml.replace('style:type="center"', 'style:type="unsupported"'),
      ),
      metadata,
    );
    const defaultedTabs = unknownType.document.paragraphs[0]?.GetAttr(
      RES_PARATR_TABSTOP,
    ) as SvxTabStopItem;
    expect(defaultedTabs.At(1).GetAdjustment()).toBe(SvxTabAdjust.Left);
    expect(defaultedTabs.At(1).GetTabPos()).toBe(720);
    expect(defaultedTabs.At(1).GetFill()).toBe("_");
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
    const ignoredTabChild = await readOdtDocument(
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
    );
    expect(
      (
        ignoredTabChild.document.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem
      ).GetStops(),
    ).toHaveLength(0);

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
    const ignoredTextChild = await readOdtDocument(textChildBytes, metadata);
    expect(
      ignoredTextChild.document.paragraphs.map(
        /** Reads visible paragraph text. @param paragraph - Imported node. @returns Text. */ (
          paragraph,
        ) => paragraph.GetText(),
      ),
    ).toEqual(
      reopened.document.paragraphs.map(
        /** Reads visible paragraph text. @param paragraph - Imported node. @returns Text. */ (
          paragraph,
        ) => paragraph.GetText(),
      ),
    );

    heading.SetFormatAttr(new SfxStringItem(RES_CHRATR_COLOR, "named-red"));
    expect(
      /** Exports an invalid bounded color. @returns Bytes. */ () =>
        writeOdtDocument(writer, metadata),
    ).toThrow("Unsupported ODF font color");
  });
});

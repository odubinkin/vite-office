/**
 * @fileoverview Verifies the source-shaped Writer ODF package and XML filter slice.
 */

import { describe, expect, it, vi } from "vitest";

import { SvxAdjust, SvxAdjustItem } from "../../../../editeng/source/items/paraitem";
import {
  FontItalic,
  FontLineStyle,
  FontWeight,
  SvxFontItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { DEFAULT_ZIP_FILE_LIMITS, ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import {
  RES_CHRATR_CJK_POSTURE,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_FONT,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
  RES_PARATR_ADJUST,
} from "../../../inc/hintids";
import { applyWriterParagraphList, projectWriterParagraphList } from "../../core/doc/list";
import { createWriterDocument } from "../../core/doc/doc";
import { createWriterTextFragment } from "../../core/txtnode/text-run-projection";
import { encodeWriterDocument } from "../../../browser/filter/xml/writer-document-codec";
import { readOdtDocument, SwXMLReader } from "./swxml";
import { exportContentXml, exportMetaXml, exportStylesXml } from "./xmlexp";
import { importWriterXml, parseOdfXml } from "./xmlimp";
import { SwXMLWriter, writeOdtDocument } from "./wrtxml";
import type { SwDoc } from "../../core/doc/doc";
import type { OdtExportControl } from "./wrtxml";

/** Creates complete metadata used at the import boundary. @param title - Title. @returns Metadata. */
function metadata(title = "Imported") {
  return createDocument({ id: "odt-1", suiteId: "writer", title });
}

/** Exports a model with explicit target object-shell metadata. @param document - Writer model. @param documentState - Shell metadata. @param control - Export controls. @returns ODT bytes. */
function writeTargetOdt(
  document: SwDoc,
  documentState = metadata(),
  control?: OdtExportControl,
): Uint8Array {
  return writeOdtDocument(document, documentState, control);
}

/** Rebuilds an ODT after changing or removing named entries. @param bytes - Source ODT. @param replacements - Replacement text or null removals. @param order - Optional output order. @returns Rebuilt package. */
async function rewritePackage(
  bytes: Uint8Array,
  replacements: Readonly<Record<string, string | null>>,
  order?: readonly string[],
): Promise<Uint8Array> {
  const input = new ZipFile(bytes);
  const output = new ZipOutputStream();
  for (const name of order ?? input.getEntryNames()) {
    const replacement = replacements[name];
    if (replacement === null) continue;
    output.putNextEntry(
      name,
      replacement === undefined
        ? await input.readEntry(name)
        : new TextEncoder().encode(replacement),
    );
  }
  return output.finish();
}

/** Creates the smallest valid Writer ODT fixture. @returns ODT bytes. */
function basicOdt(): Uint8Array {
  return writeTargetOdt(createWriterDocument());
}

/** Finds a ZIP signature from the end. @param bytes - Archive. @param signature - Little-endian signature. @returns Offset. */
function findZipSignature(bytes: Uint8Array, signature: number): number {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let offset = bytes.length - 4; offset >= 0; offset -= 1)
    if (view.getUint32(offset, true) === signature) return offset;
  throw new Error("test ZIP signature missing");
}

describe("Writer ODF XML filters" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
  it("imports legal comments and processing instructions in ODT XML streams", /** Matches pinned SvXMLImport's inert processing-instruction handler. @returns Imported graph. */ async () => {
    const original = basicOdt();
    const archive = new ZipFile(original);
    const content = await archive.readTextEntry("content.xml");
    const styles = await archive.readTextEntry("styles.xml");
    const meta = await archive.readTextEntry("meta.xml");
    const candidate = await rewritePackage(original, {
      "content.xml": content.replace("<office:text>", "<office:text><!--comment--><?stage data?>"),
      "styles.xml": styles.replace("<office:styles>", "<office:styles><?style data?>"),
      "meta.xml": meta.replace("<office:meta>", "<office:meta><!--metadata-->"),
    });
    const imported = await readOdtDocument(candidate, metadata());
    expect(imported.document.paragraphs).toHaveLength(1);
  });

  it("round-trips Standard page geometry through page-layout and master-page", /** Verifies custom page-layout serialization. @returns A fulfilled import promise. */ async () => {
    const writer = createWriterDocument();
    const page = {
      bottomMargin: 900,
      height: 12_000,
      landscape: true,
      leftMargin: 720,
      name: "Standard" as const,
      paperFormat: "custom" as const,
      rightMargin: 840,
      topMargin: 960,
      width: 16_000,
    };
    writer.ChgPageDesc(page);
    const bytes = writeTargetOdt(writer);
    const styles = await new ZipFile(bytes).readTextEntry("styles.xml");
    expect(styles).toContain('<style:page-layout style:name="pm1">');
    expect(styles).toContain('style:print-orientation="landscape"');
    expect(styles).toContain(
      '<style:master-page style:name="Standard" style:page-layout-name="pm1"/>',
    );
    const imported = await readOdtDocument(bytes, metadata());
    expect(imported.document.GetPageDesc().GetValue()).toEqual(page);
  });

  it("round-trips named master pages and their follow relationship", /** Verifies Writer page descriptor collection ownership across ODF. @returns A fulfilled import promise. */ async () => {
    const writer = createWriterDocument();
    const standard = writer.GetPageDesc();
    const first = writer.MakePageDesc("First Page", standard);
    writer.ChgPageDesc(
      { ...first.GetValue(), topMargin: 720, paperFormat: "custom" },
      first.GetName(),
    );
    first.SetFollow(standard);
    standard.SetFollow(first);
    const bytes = writeTargetOdt(writer);
    const styles = await new ZipFile(bytes).readTextEntry("styles.xml");
    expect(styles).toContain('style:name="First Page"');
    expect(styles).toContain('style:next-style-name="First Page"');
    expect(styles).toContain('style:next-style-name="Standard"');

    const imported = await readOdtDocument(bytes, metadata());
    expect(imported.document.GetPageDescCnt()).toBe(2);
    expect(imported.document.GetPageDesc().GetFollow().GetName()).toBe("First Page");
    expect(imported.document.FindPageDesc("First Page")?.GetFollow().GetName()).toBe("Standard");
    expect(imported.document.FindPageDesc("First Page")?.GetValue().topMargin).toBe(720);
  });

  it("retains a known landscape paper identity through ODT", /** Verifies oriented known-paper detection. @returns A fulfilled import promise. */ async () => {
    const writer = createWriterDocument();
    const initial = writer.GetPageDesc().GetValue();
    writer.ChgPageDesc({
      ...initial,
      height: 12_240,
      landscape: true,
      paperFormat: "Letter",
      width: 15_840,
    });
    const imported = await readOdtDocument(writeTargetOdt(writer), metadata());
    expect(imported.document.GetPageDesc().GetValue()).toMatchObject({
      height: 12_240,
      landscape: true,
      paperFormat: "Letter",
      width: 15_840,
    });
  });
  it("opens LibreOffice ODTs containing a default page layout", /** Verifies the upstream style container accepts the default page-layout subtree even though the bounded Writer model does not consume page properties. @returns Nothing. */ async () => {
    const bytes = basicOdt();
    const archive = new ZipFile(bytes);
    const styles = (await archive.readTextEntry("styles.xml")).replace(
      "<office:styles>",
      "<office:styles><style:default-page-layout><style:page-layout-properties/></style:default-page-layout>",
    );

    const imported = await readOdtDocument(
      await rewritePackage(bytes, { "styles.xml": styles }),
      metadata(),
    );

    expect(imported.document.paragraphs).toHaveLength(1);
  });

  it("opens ODTs containing unknown extension subtrees", /** Verifies upstream-compatible unknown children are diagnosed and skipped without importing their descendants. @returns Nothing. */ async () => {
    const bytes = basicOdt();
    const archive = new ZipFile(bytes);
    const styles = (await archive.readTextEntry("styles.xml")).replace(
      "<office:styles>",
      '<office:styles><foreign:extension xmlns:foreign="urn:foreign"><style:style style:name="Standard" style:family="paragraph"/></foreign:extension>',
    );
    const warn = vi
      .spyOn(console, "warn")
      .mockImplementation(
        /** Suppresses the expected diagnostic. @returns Nothing. */ () => undefined,
      );
    try {
      const imported = await readOdtDocument(
        await rewritePackage(bytes, { "styles.xml": styles }),
        metadata(),
      );
      expect(imported.document.paragraphs).toHaveLength(1);
      expect(warn).toHaveBeenCalledWith("Unknown ODF element ignored: foreign:extension");
    } finally {
      warn.mockRestore();
    }
  });

  it("writes deterministic ODF 1.3 packages and restores canonical formatting" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, async () => {
    const writer = createWriterDocument();
    writer.GetDfltTextFormatColl().SetFormatName("Body < text");
    for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT])
      writer.GetDfltTextFormatColl().SetFormatAttr(new SvxFontItem("Noto Serif", which));
    writer
      .GetDfltTextFormatColl()
      .SetFormatAttr(new SvxAdjustItem(SvxAdjust.Center, RES_PARATR_ADJUST));
    writer
      .GetDfltTextFormatColl()
      .SetFormatAttr(new SvxWeightItem(FontWeight.BOLD, RES_CHRATR_WEIGHT));
    writer
      .GetDfltTextFormatColl()
      .SetFormatAttr(new SvxWeightItem(FontWeight.BOLD, RES_CHRATR_CJK_WEIGHT));
    writer
      .GetDfltTextFormatColl()
      .SetFormatAttr(new SvxWeightItem(FontWeight.BOLD, RES_CHRATR_CTL_WEIGHT));
    writer
      .GetDfltTextFormatColl()
      .SetFormatAttr(new SvxPostureItem(FontItalic.NORMAL, RES_CHRATR_POSTURE));
    writer
      .GetDfltTextFormatColl()
      .SetFormatAttr(new SvxPostureItem(FontItalic.NORMAL, RES_CHRATR_CJK_POSTURE));
    writer
      .GetDfltTextFormatColl()
      .SetFormatAttr(new SvxPostureItem(FontItalic.NORMAL, RES_CHRATR_CTL_POSTURE));
    writer
      .GetDfltTextFormatColl()
      .SetFormatAttr(new SvxUnderlineItem(FontLineStyle.SINGLE, RES_CHRATR_UNDERLINE));
    writer.GetTextFormatColl("heading-1").SetFormatName("Heading & one");
    for (const which of [RES_CHRATR_WEIGHT, RES_CHRATR_CJK_WEIGHT, RES_CHRATR_CTL_WEIGHT])
      writer
        .GetTextFormatColl("heading-1")
        .SetFormatAttr(new SvxWeightItem(FontWeight.NORMAL, which));
    const first = writer.paragraphs[0];
    first?.ChgFormatColl(writer.GetTextFormatColl("heading-1"));
    first?.SetParagraphAlignment("right");
    first?.ReplaceRange(
      0,
      0,
      createWriterTextFragment(first, [
        {
          attributes: { bold: true, fontFamily: "Noto Sans", italic: false, underline: false },
          text: "Bold  text",
        },
        {
          attributes: { bold: false, italic: true, underline: true },
          text: "\titalic\n<&>",
        },
      ]),
    );
    const second = writer.nodes.MakeTextNode();
    second.SetParagraphAlignment("justify");
    for (const which of [RES_CHRATR_WEIGHT, RES_CHRATR_CJK_WEIGHT, RES_CHRATR_CTL_WEIGHT])
      second.SetAttr(new SvxWeightItem(FontWeight.NORMAL, which));
    for (const which of [RES_CHRATR_POSTURE, RES_CHRATR_CJK_POSTURE, RES_CHRATR_CTL_POSTURE])
      second.SetAttr(new SvxPostureItem(FontItalic.NONE, which));
    second.SetAttr(new SvxUnderlineItem(FontLineStyle.NONE, RES_CHRATR_UNDERLINE));
    const third = writer.nodes.MakeTextNode();
    third.SetAttr(new SvxUnderlineItem(FontLineStyle.NONE, RES_CHRATR_UNDERLINE));
    if (first !== undefined) applyWriterParagraphList(first, { kind: "numbered", level: 0 });
    applyWriterParagraphList(second, { kind: "numbered", level: 1 });
    applyWriterParagraphList(third, { kind: "bullet", level: 0 });

    const documentState = metadata("Round & Trip");
    const bytes = writeTargetOdt(writer, documentState);
    expect(new SwXMLWriter().Write(writer, documentState)).toEqual(bytes);
    const archive = new ZipFile(bytes);
    expect(archive.getEntryNames()).toEqual([
      "mimetype",
      "META-INF/manifest.xml",
      "styles.xml",
      "content.xml",
      "meta.xml",
    ]);
    expect(archive.hasEntry("content.xml")).toBe(true);
    expect(archive.hasEntry("missing")).toBe(false);
    const content = await archive.readTextEntry("content.xml");
    expect(content).toContain('office:version="1.3"');
    const styles = await archive.readTextEntry("styles.xml");
    expect(styles).toContain('fo:font-weight="bold"');
    expect(styles).toContain("<office:font-face-decls>");
    expect(styles).toContain('style:name="Noto Serif"');
    expect(styles).toContain('style:font-name="Noto Serif"');
    expect(content).toContain('style:name="Noto Sans"');
    expect(content).toContain('style:font-name="Noto Sans"');
    expect(content).toContain('fo:font-weight="normal"');
    expect(content).toContain('<text:s text:c="2"/>');
    expect(content).toContain("<text:tab/>");
    expect(content).toContain("<text:line-break/>");
    expect(content).toContain("<text:list-style");
    expect(content).toContain("<text:list-item>");
    const restored = await readOdtDocument(bytes, metadata());
    expect(
      encodeWriterDocument((await new SwXMLReader().Read(bytes, metadata())).document),
    ).toEqual(encodeWriterDocument(restored.document));
    expect(restored.title).toBe("Round & Trip");
    expect(restored.document.GetDfltTextFormatColl().GetName()).toBe("Body < text");
    expect(restored.document.GetDfltTextFormatColl().GetAttrSet().GetWeight().GetBoolValue()).toBe(
      true,
    );
    expect(restored.document.GetDfltTextFormatColl().GetAttrSet().GetPosture().GetBoolValue()).toBe(
      true,
    );
    expect(
      restored.document.GetDfltTextFormatColl().GetAttrSet().GetUnderline().GetBoolValue(),
    ).toBe(true);
    expect(restored.document.GetTextFormatColl("heading-1").GetName()).toBe("Heading & one");
    expect(
      restored.document.paragraphs.map(
        /** Executes the enclosing deterministic test or transformation callback. @param node - Callback input. @returns Callback result. */
        (node) => ({
          alignment: node.GetParagraphAlignment(),
          list: projectWriterParagraphList(node),
          style: node.GetParagraphStyle(),
          text: node.GetText(),
        }),
      ),
    ).toEqual(
      writer.paragraphs.map(
        /** Executes the enclosing deterministic test or transformation callback. @param node - Callback input. @returns Callback result. */
        (node) => ({
          alignment: node.GetParagraphAlignment(),
          list: projectWriterParagraphList(node),
          style: node.GetParagraphStyle(),
          text: node.GetText(),
        }),
      ),
    );
  });

  it("imports LibreOffice-shaped nested and continued list blocks" /** Verifies one-level automatic styles become ten-level SwNumRule records and list identity survives continuation segments. @returns Nothing. */, async () => {
    const empty = createWriterDocument();
    const styles = exportStylesXml(empty);
    const listStyles = [
      '<text:list-style style:name="L1" style:display-name="Numbering 1"><text:list-level-style-number text:level="1" style:num-suffix="." style:num-format="1"><style:list-level-properties text:list-level-position-and-space-mode="label-alignment"/></text:list-level-style-number></text:list-style>',
      '<text:list-style style:name="L2"><text:list-level-style-bullet text:level="1" text:bullet-char="●"><style:list-level-properties text:list-level-position-and-space-mode="label-alignment"/></text:list-level-style-bullet></text:list-style>',
    ].join("");
    const body = [
      '<text:list xml:id="list1" text:style-name="L1">',
      "<text:list-item><text:p>alpha</text:p></text:list-item>",
      '<text:list-item><text:p>beta</text:p><text:list text:style-name="L2"><text:list-item><text:p>nested</text:p></text:list-item></text:list></text:list-item>',
      "</text:list>",
      "<text:p>gap</text:p>",
      '<text:list text:continue-list="list1" text:style-name="L1"><text:list-item><text:p>gamma</text:p></text:list-item></text:list>',
    ].join("");
    const content = exportContentXml(empty)
      .replace("</office:automatic-styles>", `${listStyles}</office:automatic-styles>`)
      .replace(/<office:text>[\s\S]*<\/office:text>/, `<office:text>${body}</office:text>`);
    const imported = importWriterXml(styles, content, metadata());
    expect(
      imported.document.paragraphs.map(
        /** Projects a text node into list assertions. @param node - Imported Writer node. @returns Comparable list state. */
        (node) => ({
          listId: node.GetListId(),
          ruleName: node.GetNumRuleName(),
          ...projectWriterParagraphList(node),
          text: node.GetText(),
        }),
      ),
    ).toEqual([
      {
        kind: "numbered",
        level: 0,
        listId: "list1",
        ruleName: "Numbering 1",
        text: "alpha",
      },
      {
        kind: "numbered",
        level: 0,
        listId: "list1",
        ruleName: "Numbering 1",
        text: "beta",
      },
      { kind: "bullet", level: 1, listId: "list1", ruleName: "L2", text: "nested" },
      { kind: "none", level: 0, listId: "", ruleName: "", text: "gap" },
      {
        kind: "numbered",
        level: 0,
        listId: "list1",
        ruleName: "Numbering 1",
        text: "gamma",
      },
    ]);
    expect(imported.document.FindNumRulePtr("L2")?.GetNumFormat(1).GetBulletChar()).toBe("●");
    const roundTripped = await readOdtDocument(
      writeTargetOdt(imported.document, { ...metadata(), title: imported.title }),
      metadata(),
    );
    expect(
      roundTripped.document.paragraphs.map(
        /** Projects a text node into list assertions. @param node - Round-tripped Writer node. @returns Comparable list state. */
        (node) => ({
          listId: node.GetListId(),
          ruleName: node.GetNumRuleName(),
          ...projectWriterParagraphList(node),
          text: node.GetText(),
        }),
      ),
    ).toEqual(
      imported.document.paragraphs.map(
        /** Projects a text node into list assertions. @param node - Imported Writer node. @returns Comparable list state. */
        (node) => ({
          listId: node.GetListId(),
          ruleName: node.GetNumRuleName(),
          ...projectWriterParagraphList(node),
          text: node.GetText(),
        }),
      ),
    );
    expect(roundTripped.document.FindNumRulePtr("L2")?.GetNumFormat(1).GetBulletChar()).toBe("●");
    const restarted = importWriterXml(
      styles,
      content.replace("<text:list-item>", '<text:list-item text:start-value="3">'),
      metadata(),
    );
    expect(
      projectWriterParagraphList(
        restarted.document.paragraphs[0] as import("../../core/txtnode/ndtxt").SwTextNode,
      ),
    ).toMatchObject({
      restart: true,
      startValue: 3,
    });
    const restartedContent = exportContentXml(restarted.document);
    expect(restartedContent).toContain('<text:list-item text:start-value="3">');
    expect(
      projectWriterParagraphList(
        importWriterXml(styles, restartedContent, metadata()).document
          .paragraphs[0] as import("../../core/txtnode/ndtxt").SwTextNode,
      ),
    ).toMatchObject({ restart: true, startValue: 3 });
    expect(
      /** Imports an unsupported numbering suffix. @returns Invalid document. */ () =>
        importWriterXml(
          styles,
          content.replace('style:num-suffix="."', 'style:num-suffix=")"'),
          metadata(),
        ),
    ).toThrow("Unsupported ODF numbering suffix");
    const importWithListStyle =
      /** Imports an additional list-style fragment. @param fragment - ODF style XML. @returns Imported Writer document. */ (
        fragment: string,
      ): ReturnType<typeof importWriterXml> =>
        importWriterXml(
          styles,
          content.replace("</office:automatic-styles>", `${fragment}</office:automatic-styles>`),
          metadata(),
        );
    expect(
      importWithListStyle(
        '<text:list-style style:name="Blank"><text:list-level-style-bullet text:level="1" text:bullet-char=""/></text:list-style>',
      )
        .document.FindNumRulePtr("Blank")
        ?.GetNumFormat(0)
        .GetBulletChar(),
    ).toBe("");
    for (const [fragment, message] of [
      [
        '<text:list-style style:name="L1"><text:list-level-style-number text:level="1" style:num-format="1"/></text:list-style>',
        "Duplicate ODF list style",
      ],
      [
        '<text:list-style style:name="Foreign"><style:list-level-properties/></text:list-style>',
        "Unsupported ODF list style child",
      ],
      [
        '<text:list-style style:name="Image"><text:list-level-style-image text:level="1"/></text:list-style>',
        "Unsupported ODF list level style",
      ],
      [
        '<text:list-style style:name="Duplicate"><text:list-level-style-number text:level="1" style:num-format="1"/><text:list-level-style-bullet text:level="1" text:bullet-char="•"/></text:list-style>',
        "Duplicate ODF list level",
      ],
      [
        '<text:list-style style:name="Bullet"><text:list-level-style-bullet text:level="1"/></text:list-style>',
        "bullet character is missing",
      ],
      [
        '<text:list-style style:name="Roman"><text:list-level-style-number text:level="1" style:num-format="i"/></text:list-style>',
        "Unsupported ODF numbering format",
      ],
      ['<text:list-style style:name="Empty"/>', "has no levels"],
    ] as const)
      expect(
        /** Imports an invalid list-style definition. @returns Invalid document. */ () =>
          importWithListStyle(fragment),
      ).toThrow(message);
    for (const level of ["0", "1.5", "11"])
      expect(
        /** Imports an invalid ODF list level. @returns Invalid document. */ () =>
          importWithListStyle(
            `<text:list-style style:name="BadLevel${level}"><text:list-level-style-number text:level="${level}" style:num-format="1"/></text:list-style>`,
          ),
      ).toThrow("Unsupported ODF list level");
    expect(
      /** Imports matching aliases followed by a conflicting canonical rule name. @returns Invalid document. */ () =>
        importWithListStyle(
          '<text:list-style style:name="Alias1" style:display-name="Shared"><text:list-level-style-bullet text:level="1" text:bullet-char="•"/></text:list-style><text:list-style style:name="Alias2" style:display-name="Shared"><text:list-level-style-bullet text:level="1" text:bullet-char="•"/></text:list-style><text:list-style style:name="Alias3" style:display-name="Shared"><text:list-level-style-number text:level="1" style:num-format="1"/></text:list-style>',
        ),
    ).toThrow("Conflicting ODF list rule");
    expect(
      /** Imports aliases whose canonical bullet characters conflict. @returns Invalid document. */ () =>
        importWithListStyle(
          '<text:list-style style:name="DotAlias" style:display-name="Dots"><text:list-level-style-bullet text:level="1" text:bullet-char="•"/></text:list-style><text:list-style style:name="CircleAlias" style:display-name="Dots"><text:list-level-style-bullet text:level="1" text:bullet-char="●"/></text:list-style>',
        ),
    ).toThrow("Conflicting ODF list rule");
    expect(
      /** Rejects aliases whose visible number suffixes disagree. @returns Invalid document. */ () =>
        importWithListStyle(
          '<text:list-style style:name="PlainAlias" style:display-name="Numbers"><text:list-level-style-number text:level="1" style:num-format="1"/></text:list-style><text:list-style style:name="DottedAlias" style:display-name="Numbers"><text:list-level-style-number text:level="1" style:num-format="1" style:num-suffix="."/></text:list-style>',
        ),
    ).toThrow("Conflicting ODF list rule");
  });

  it("maps every supported SvxAdjust variant and rejects invalid adjustment items" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    for (const [adjust, expected] of [
      [SvxAdjust.Left, "start"],
      [SvxAdjust.ParaStart, "start"],
      [SvxAdjust.Right, "end"],
      [SvxAdjust.ParaEnd, "end"],
      [SvxAdjust.Center, "center"],
      [SvxAdjust.Block, "justify"],
      [SvxAdjust.BlockLine, "justify"],
    ] as const) {
      const writer = createWriterDocument();
      writer.GetDfltTextFormatColl().SetFormatAttr(new SvxAdjustItem(adjust, RES_PARATR_ADJUST));
      expect(exportStylesXml(writer)).toContain(`fo:text-align="${expected}"`);
    }
    const invalidItem = createWriterDocument();
    const invalidSet = invalidItem.GetDfltTextFormatColl().GetAttrSet() as unknown as {
      items: Map<number, unknown>;
    };
    invalidSet.items.set(65, {
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      Which: () => 65,
    });
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => exportStylesXml(invalidItem),
    ).toThrow("adjustment item is invalid");
    const invalidValue = createWriterDocument();
    const item = new SvxAdjustItem(SvxAdjust.ParaStart, RES_PARATR_ADJUST);
    (item as unknown as { adjust: number }).adjust = SvxAdjust.End;
    const valueSet = invalidValue.GetDfltTextFormatColl().GetAttrSet() as unknown as {
      items: Map<number, unknown>;
    };
    valueSet.items.set(65, item);
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => exportStylesXml(invalidValue),
    ).toThrow("adjustment value is unsupported");
  });

  it("validates package order, media type, required streams, and explicit limits" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, async () => {
    const bytes = basicOdt();
    const names = new ZipFile(bytes).getEntryNames();
    const reordered = await rewritePackage(bytes, {}, [
      names[1] as string,
      names[0] as string,
      ...names.slice(2),
    ]);
    await expect(readOdtDocument(reordered, metadata())).rejects.toThrow(
      "mimetype must be the first",
    );
    const wrongType = await rewritePackage(bytes, { mimetype: "application/invalid" });
    await expect(readOdtDocument(wrongType, metadata())).rejects.toThrow(
      "mimetype entry is invalid",
    );
    const compressedType = bytes.slice();
    const compressedView = new DataView(compressedType.buffer);
    const end = findZipSignature(compressedType, 0x06054b50);
    const central = compressedView.getUint32(end + 16, true);
    compressedView.setUint16(8, 8, true);
    compressedView.setUint16(central + 10, 8, true);
    await expect(readOdtDocument(compressedType, metadata())).rejects.toThrow(
      "mimetype must be stored without compression",
    );
    for (const name of [
      "mimetype",
      "META-INF/manifest.xml",
      "styles.xml",
      "content.xml",
      "meta.xml",
    ])
      await expect(
        readOdtDocument(await rewritePackage(bytes, { [name]: null }), metadata()),
      ).rejects.toThrow(name === "mimetype" ? "mimetype must be the first" : "Missing ZIP entry");
    expect(
      (await readOdtDocument(bytes, metadata(), DEFAULT_ZIP_FILE_LIMITS)).document.paragraphs,
    ).toHaveLength(1);
    await expect(
      new SwXMLReader().Read(bytes, metadata(), undefined, { maxXmlStreamBytes: 1 }),
    ).rejects.toThrow("XML stream exceeds size limit");
    expect(
      /** Exports with a deliberately strict complete-package limit. @returns ODT bytes. */ () =>
        new SwXMLWriter().Write(createWriterDocument(), metadata(), { maxOutputBytes: 1 }),
    ).toThrow("export exceeds size limit");
    expect(
      /** Cancels before Writer serialization proceeds. @returns ODT bytes. */ () =>
        writeTargetOdt(createWriterDocument(), metadata(), {
          isCancelled: /** Reports deterministic cancellation. @returns True. */ () => true,
        }),
    ).toThrow("cancelled");
  });

  it("validates XML roots, declarations, required Writer styles, and body structure" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    const writer = createWriterDocument();
    writer.GetTextFormatColl("heading-1");
    const styles = exportStylesXml(writer);
    const content = exportContentXml(writer);
    const meta = exportMetaXml(metadata().title);
    expect(importWriterXml(styles, content, metadata()).title).toBe("Imported");
    expect(
      importWriterXml(
        styles.replace(
          "</office:document-styles>",
          "<office:master-styles/></office:document-styles>",
        ),
        content,
        metadata(),
      ).document.paragraphs,
    ).toHaveLength(1);
    expect(
      importWriterXml(
        styles,
        content,
        metadata(),
        meta.replace("<dc:title>Imported</dc:title>", "<dc:title></dc:title>"),
      ).title,
    ).toBe("Imported");
    expect(
      importWriterXml(
        styles.replaceAll(/ style:display-name="[^"]*"/g, ""),
        content,
        metadata(),
        meta.replace(/<dc:title>[\s\S]*?<\/dc:title>/, ""),
      ).title,
    ).toBe("Imported");
    for (const [xml, root] of [
      ["<!DOCTYPE x>" + content, "document-content"],
      ["<broken", "document-content"],
      [content.replaceAll("document-content", "wrong"), "document-content"],
      [content, "document-styles"],
    ] as const)
      expect(
        /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
        () => parseOdfXml(xml, root),
      ).toThrow("ODF");
    expect(
      /** Parses with the legacy validation boundary's explicit depth ceiling. @returns Nothing. */ () =>
        parseOdfXml(content, "document-content", 1),
    ).toThrow("depth limit");
    expect(
      /** Rejects an unknown requested root name. @returns Nothing. */ () =>
        parseOdfXml(content, "unknown-root"),
    ).toThrow("invalid");
    expect(
      /** Rejects an unknown package root through SwXMLImport. @returns Nothing. */ () =>
        importWriterXml(
          styles.replaceAll("document-styles", "unknown-styles"),
          content,
          metadata(),
        ),
    ).toThrow("Unsupported ODF XML element");
    expect(
      /** Rejects a known root that does not match the active package stream. @returns Nothing. */ () =>
        importWriterXml(
          styles.replaceAll("document-styles", "document-content"),
          content,
          metadata(),
        ),
    ).toThrow("Unsupported ODF XML element");
    expect(
      /** Rejects a known non-text body child. @returns Nothing. */ () =>
        importWriterXml(
          styles,
          content.replace("<office:text>", "<office:styles/>").replace("</office:text>", ""),
          metadata(),
        ),
    ).toThrow("Unsupported ODF XML element");
    const withoutStandard = styles.replace(
      /<style:style style:name="Standard"[\s\S]*?<\/style:style>/,
      "",
    );
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */ () =>
        importWriterXml(withoutStandard, content, metadata(), meta),
    ).toThrow("ODF");
    expect(
      importWriterXml(
        styles.replace(/<style:style style:name="Heading_20_1"[\s\S]*?<\/style:style>/, ""),
        content,
        metadata(),
        meta,
      )
        .document.GetTextFormatColl("heading-1")
        .GetName(),
    ).toBe("Heading 1");
    expect(
      /** Imports an invalid Heading 1 family. @returns Invalid document. */ () =>
        importWriterXml(
          styles.replace(
            /(<style:style style:name="Heading_20_1"[^>]*style:family=")paragraph/,
            "$1text",
          ),
          content,
          metadata(),
          meta,
        ),
    ).toThrow("Heading 1 paragraph style is invalid");
    const alternateFollow = importWriterXml(
      styles.replace(
        /(<style:style style:name="Heading_20_1"[^>]*style:next-style-name=")[^"]+/,
        "$1Standard",
      ),
      content,
      metadata(),
      meta,
    );
    expect(alternateFollow.document.GetTextFormatColl("heading-1").GetNextTextFormatColl()).toBe(
      alternateFollow.document.GetDfltTextFormatColl(),
    );
    expect(
      /** Rejects a text property referencing an undeclared font face. @returns Invalid document. */ () =>
        importWriterXml(
          styles,
          content.replace(
            "<office:automatic-styles>",
            '<office:automatic-styles><style:style style:name="MissingFont" style:family="text"><style:text-properties style:font-name="Missing"/></style:style>',
          ),
          metadata(),
          meta,
        ),
    ).toThrow("ODF XML is malformed");
    expect(
      /** Rejects conflicting declarations sharing an ODF face name. @returns Invalid document. */ () =>
        importWriterXml(
          styles.replace(
            "<office:font-face-decls>",
            '<office:font-face-decls><style:font-face style:name="F" svg:font-family="serif"/><style:font-face style:name="F" svg:font-family="sans-serif"/>',
          ),
          content,
          metadata(),
          meta,
        ),
    ).toThrow("Conflicting ODF font face");
    expect(
      importWriterXml(
        styles.replace(
          "<office:font-face-decls>",
          '<office:font-face-decls><style:font-face style:name="Families" svg:font-family="&apos;Noto Sans&apos;, serif"/><style:font-face style:name="Empty" svg:font-family=""/><style:font-face style:name="MissingFamily"/>',
        ),
        content,
        metadata(),
        meta,
      ).document.paragraphs,
    ).toHaveLength(1);
    expect(
      /** Rejects non-font children in office:font-face-decls. @returns Invalid document. */ () =>
        importWriterXml(
          styles.replace(
            "<office:font-face-decls>",
            '<office:font-face-decls><style:style style:name="Wrong" style:family="text"/>',
          ),
          content,
          metadata(),
          meta,
        ),
    ).toThrow("Unsupported ODF XML element");
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () =>
        importWriterXml(
          styles,
          content.replace("<office:text>", "<office:text/><office:text>"),
          metadata(),
          meta,
        ),
    ).toThrow("exactly one office:text");
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () =>
        importWriterXml(
          styles,
          content.replaceAll("office:text", "office:spreadsheet"),
          metadata(),
          meta,
        ),
    ).toThrow("exactly one office:text");
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () =>
        importWriterXml(
          styles,
          content,
          metadata(),
          meta.replace("</office:meta>", "<dc:title>again</dc:title></office:meta>"),
        ),
    ).toThrow("duplicate titles");
  });

  it("logs and ignores LibreOffice and unknown style attributes", /** Verifies tolerant upstream-shaped attribute import. @returns Nothing. */ () => {
    const writer = createWriterDocument();
    const styles = exportStylesXml(writer).replace(
      'style:family="paragraph"',
      'style:family="paragraph" style:default-outline-level="0" fo:color="#000000"',
    );
    const content = exportContentXml(writer);
    const warn = vi
      .spyOn(console, "warn")
      .mockImplementation(
        /** Suppresses expected diagnostics. @returns Nothing. */ () => undefined,
      );
    try {
      expect(importWriterXml(styles, content, metadata()).document.paragraphs).toHaveLength(1);
      expect(warn).toHaveBeenCalledWith(
        "Unknown ODF attribute ignored: style:default-outline-level",
      );
      expect(warn).toHaveBeenCalledWith("Unsupported ODF style attribute ignored: fo:color");
    } finally {
      warn.mockRestore();
    }
  });

  it("rejects malformed style records and unsupported semantic properties" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    const writer = createWriterDocument();
    const styles = exportStylesXml(writer);
    const content = exportContentXml(writer);
    const meta = exportMetaXml(metadata().title);
    const standardStyle = styles.match(
      /<style:style style:name="Standard"[\s\S]*?<\/style:style>/,
    )?.[0] as string;
    const mutations = [
      [styles.replace(' style:name="Standard"', ""), "style name is missing"],
      [styles.replace(' style:family="paragraph"', ""), "style family is missing"],
      [
        styles.replace('style:family="paragraph"', 'style:family="table"'),
        "Standard paragraph style",
      ],
      [
        styles.replace("</office:styles>", standardStyle + "</office:styles>"),
        "Duplicate ODF style",
      ],
      [
        styles.replace(
          "</style:style>",
          "<style:paragraph-properties/><style:paragraph-properties/></style:style>",
        ),
        "duplicate paragraph-properties",
      ],
      [
        styles.replace(
          "</style:style>",
          "<style:text-properties/><style:text-properties/></style:style>",
        ),
        "duplicate text-properties",
      ],
      [
        styles.replace("<office:styles>", "<office:styles><style:paragraph-properties/>"),
        "Unsupported ODF XML element",
      ],
      [
        styles.replace("</style:style>", "<style:list-level-properties/></style:style>"),
        "Unsupported ODF XML element",
      ],
      [
        styles.replace("</office:document-styles>", "<office:body/></office:document-styles>"),
        "Unsupported ODF XML element",
      ],
      [
        styles.replace(
          "</style:style>",
          '<style:paragraph-properties fo:text-align="match-parent"/></style:style>',
        ),
        "paragraph alignment",
      ],
    ] as const;
    for (const [changed, message] of mutations)
      expect(
        /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
        () => importWriterXml(changed, content, metadata(), meta),
      ).toThrow(message);

    expect(
      /** Rejects a known but invalid metadata child. @returns Invalid document. */ () =>
        importWriterXml(
          styles,
          content,
          metadata(),
          meta.replace("</office:meta>", "<office:body/></office:meta>"),
        ),
    ).toThrow("Unsupported ODF XML element");

    const styledContent = content.replace(
      "</office:automatic-styles>",
      '<style:style style:name="T9" style:family="text"><style:text-properties fo:font-weight="bold"/></style:style></office:automatic-styles>',
    );
    for (const [attribute, value, message] of [
      ["fo:font-weight", "heavy", "font weight"],
      ["fo:font-style", "oblique", "font style"],
      ["style:text-underline-style", "wave", "underline style"],
      ["style:text-underline-width", "bold", "underline width"],
    ] as const) {
      const changed = styledContent.replace('fo:font-weight="bold"', `${attribute}="${value}"`);
      expect(
        /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
        () => importWriterXml(styles, changed, metadata(), meta),
      ).toThrow(message);
    }
    const unknown = styledContent.replace(
      'fo:font-weight="bold"',
      'fo:font-weight="bold" fo:color="#000000"',
    );
    expect(
      importWriterXml(styles, unknown, metadata(), meta).document.paragraphs[0]?.GetText(),
    ).toBe("");
    const mismatchedScript = styledContent.replace(
      'fo:font-weight="bold"',
      'fo:font-weight="bold" style:font-weight-asian="normal"',
    );
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => importWriterXml(styles, mismatchedScript, metadata(), meta),
    ).toThrow("script-specific ODF font weight");
    const mismatchedComplexWeight = styledContent.replace(
      'fo:font-weight="bold"',
      'fo:font-weight="bold" style:font-weight-complex="normal"',
    );
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => importWriterXml(styles, mismatchedComplexWeight, metadata(), meta),
    ).toThrow("script-specific ODF font weight");
    const mismatchedPosture = styledContent.replace(
      'fo:font-weight="bold"',
      'fo:font-weight="bold" fo:font-style="italic" style:font-style-complex="normal"',
    );
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => importWriterXml(styles, mismatchedPosture, metadata(), meta),
    ).toThrow("script-specific ODF font style");
  });
});

/**
 * @fileoverview Verifies the source-shaped Writer ODF package and XML filter slice.
 */

import { describe, expect, it } from "vitest";

import { SvxAdjust, SvxAdjustItem } from "../../../../editeng/source/items/paraitem";
import { createDocument } from "../../../../sfx2/source/doc/docfac";
import { DEFAULT_ZIP_FILE_LIMITS, ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { RES_PARATR_NUMRULE } from "../../../inc/hintids";
import { SwNumRuleItem } from "../../core/para/paratr";
import { createWriterDocument } from "../../core/doc/writer";
import { readOdtDocument, SwXMLReader } from "./swxml";
import { exportContentXml, exportMetaXml, exportStylesXml } from "./xmlexp";
import { importWriterXml, parseOdfXml } from "./xmlimp";
import { SwXMLWriter, writeOdtDocument } from "./wrtxml";

/** Creates complete metadata used at the import boundary. @param title - Title. @returns Metadata. */
function metadata(title = "Imported") {
  return createDocument({ id: "odt-1", suiteId: "writer", title });
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
  return writeOdtDocument(createWriterDocument(metadata("Basic"), "p1"));
}

/** Finds a ZIP signature from the end. @param bytes - Archive. @param signature - Little-endian signature. @returns Offset. */
function findZipSignature(bytes: Uint8Array, signature: number): number {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let offset = bytes.length - 4; offset >= 0; offset -= 1)
    if (view.getUint32(offset, true) === signature) return offset;
  throw new Error("test ZIP signature missing");
}

describe("Writer ODF XML filters" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
  it("writes deterministic ODF 1.3 packages and restores canonical formatting" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, async () => {
    const writer = createWriterDocument(metadata("Round & Trip"), "source-1");
    writer.GetDfltTextFormatColl().SetFormatName("Body < text");
    writer.GetDfltTextFormatColl().SetFormatAttr(new SvxAdjustItem(SvxAdjust.Center));
    writer.GetTextFormatColl("heading-1").SetFormatName("Heading & one");
    const first = writer.paragraphs[0];
    first?.ChgFormatColl(writer.GetTextFormatColl("heading-1"));
    first?.SetParagraphAlignment("right");
    first?.ReplaceRange(0, 0, [
      {
        attributes: { bold: true, italic: false, underline: false },
        text: "Bold  text",
      },
      {
        attributes: { bold: false, italic: true, underline: true },
        text: "\titalic\n<&>",
      },
    ]);
    const second = writer.nodes.MakeTextNode("source-2", "plain");
    second.SetParagraphAlignment("justify");

    const bytes = writeOdtDocument(writer);
    expect(new SwXMLWriter().Write(writer)).toEqual(bytes);
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
    expect(content).toContain('<text:s text:c="2"/>');
    expect(content).toContain("<text:tab/>");
    expect(content).toContain("<text:line-break/>");

    const restored = await readOdtDocument(bytes, metadata());
    expect((await new SwXMLReader().Read(bytes, metadata())).toSnapshot()).toEqual(
      restored.toSnapshot(),
    );
    expect(restored.document.title).toBe("Round & Trip");
    expect(restored.GetDfltTextFormatColl().GetName()).toBe("Body < text");
    expect(restored.GetTextFormatColl("heading-1").GetName()).toBe("Heading & one");
    expect(
      restored.paragraphs.map(
        /** Executes the enclosing deterministic test or transformation callback. @param node - Callback input. @returns Callback result. */
        (node) => ({
          alignment: node.alignment,
          list: node.list,
          runs: node.runs,
          style: node.style,
          text: node.text,
        }),
      ),
    ).toEqual(
      writer.paragraphs.map(
        /** Executes the enclosing deterministic test or transformation callback. @param node - Callback input. @returns Callback result. */
        (node) => ({
          alignment: node.alignment,
          list: node.list,
          runs: node.runs,
          style: node.style,
          text: node.text,
        }),
      ),
    );
  });

  it("rejects unsupported canonical Writer state instead of silently dropping it" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    for (const configure of [
      /** Executes the enclosing deterministic test or transformation callback. @param writer - Callback input. @returns Callback result. */
      (writer: ReturnType<typeof createWriterDocument>) =>
        writer.paragraphs[0]?.SetParagraphList({ kind: "bullet", level: 0 }),
      /** Executes the enclosing deterministic test or transformation callback. @param writer - Callback input. @returns Callback result. */
      (writer: ReturnType<typeof createWriterDocument>) =>
        writer.paragraphs[0]?.SetParagraphList({ kind: "none", level: 1 }),
      /** Executes the enclosing deterministic test or transformation callback. @param writer - Callback input. @returns Callback result. */
      (writer: ReturnType<typeof createWriterDocument>) =>
        writer.paragraphs[0]?.SetParagraphList({ kind: "none", level: 0, styleId: "List" }),
    ]) {
      const writer = createWriterDocument(metadata(), "p1");
      configure(writer);
      expect(
        /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
        () => writeOdtDocument(writer),
      ).toThrow("does not yet support Writer lists");
    }
    const unknownRule = createWriterDocument(metadata(), "p1");
    unknownRule.paragraphs[0]?.SetAttr(new SwNumRuleItem("Missing"));
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => exportContentXml(unknownRule),
    ).toThrow(`WhichId ${RES_PARATR_NUMRULE}`);
    const styleItem = createWriterDocument(metadata(), "p1");
    styleItem.GetTextFormatColl("heading-1").SetFormatAttr(new SwNumRuleItem("Rule"));
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => exportStylesXml(styleItem),
    ).toThrow(`WhichId ${RES_PARATR_NUMRULE}`);
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
      const writer = createWriterDocument(metadata(), "p1");
      writer.GetDfltTextFormatColl().SetFormatAttr(new SvxAdjustItem(adjust));
      expect(exportStylesXml(writer)).toContain(`fo:text-align="${expected}"`);
    }
    const invalidItem = createWriterDocument(metadata(), "p1");
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
    const invalidValue = createWriterDocument(metadata(), "p1");
    const item = new SvxAdjustItem();
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
      (await readOdtDocument(bytes, metadata(), DEFAULT_ZIP_FILE_LIMITS)).paragraphs,
    ).toHaveLength(1);
  });

  it("validates XML roots, declarations, required Writer styles, and body structure" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    const writer = createWriterDocument(metadata(), "p1");
    const styles = exportStylesXml(writer);
    const content = exportContentXml(writer);
    const meta = exportMetaXml(writer);
    expect(importWriterXml(styles, content, metadata()).document.title).toBe("Imported");
    expect(
      importWriterXml(
        styles,
        content,
        metadata(),
        meta.replace("<dc:title>Imported</dc:title>", "<dc:title></dc:title>"),
      ).document.title,
    ).toBe("Imported");
    expect(
      importWriterXml(
        styles.replaceAll(/ style:display-name="[^"]*"/g, ""),
        content,
        metadata(),
        meta.replace(/<dc:title>[\s\S]*?<\/dc:title>/, ""),
      ).document.title,
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
    for (const changed of [
      styles.replace(/<style:style style:name="Standard"[\s\S]*?<\/style:style>/, ""),
      styles.replace(/<style:style style:name="Heading_20_1"[\s\S]*?<\/style:style>/, ""),
      styles.replace('style:parent-style-name="Standard"', 'style:parent-style-name="Other"'),
    ])
      expect(
        /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
        () => importWriterXml(changed, content, metadata(), meta),
      ).toThrow("ODF");
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

  it("rejects malformed style records and unsupported semantic properties" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    const writer = createWriterDocument(metadata(), "p1");
    const styles = exportStylesXml(writer);
    const content = exportContentXml(writer);
    const meta = exportMetaXml(writer);
    const standardStyle = styles.match(
      /<style:style style:name="Standard"[\s\S]*?<\/style:style>/,
    )?.[0] as string;
    const mutations = [
      [styles.replace(' style:name="Standard"', ""), "style name is missing"],
      [styles.replace(' style:family="paragraph"', ""), "style family is missing"],
      [styles.replace('style:family="paragraph"', 'style:family="table"'), "style family"],
      [
        styles.replace("</office:styles>", standardStyle + "</office:styles>"),
        "Duplicate ODF style",
      ],
      [
        styles.replace("</style:style>", "<style:text-properties/></style:style>"),
        "text properties on ODF paragraph",
      ],
      [
        styles
          .replace('style:family="paragraph"', 'style:family="text"')
          .replace("</style:style>", "<style:paragraph-properties/></style:style>"),
        "paragraph properties on ODF text",
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
          '<style:paragraph-properties fo:margin-left="1cm"/></style:style>',
        ),
        "Unsupported ODF style property",
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
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => importWriterXml(styles, unknown, metadata(), meta),
    ).toThrow("Unsupported ODF style property");
  });

  it("imports normal character values and every ODF alignment spelling" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    const writer = createWriterDocument(metadata(), "p1");
    const styles = exportStylesXml(writer);
    const baseContent = exportContentXml(writer);
    const meta = exportMetaXml(writer);
    for (const [value, expected] of [
      ["start", "left"],
      ["left", "left"],
      ["end", "right"],
      ["right", "right"],
      ["center", "center"],
      ["justify", "justify"],
    ] as const) {
      const content = baseContent
        .replace(
          "</office:automatic-styles>",
          `<style:style style:name="P9" style:family="paragraph"><style:paragraph-properties fo:text-align="${value}"/></style:style></office:automatic-styles>`,
        )
        .replace('text:style-name="Standard"', 'text:style-name="P9"');
      expect(importWriterXml(styles, content, metadata(), meta).paragraphs[0]?.alignment).toBe(
        expected,
      );
    }
    const content = baseContent
      .replace(
        "</office:automatic-styles>",
        '<style:style style:name="T9" style:family="text"><style:text-properties fo:font-weight="normal" fo:font-style="normal" style:text-underline-style="none" style:text-underline-width="auto"/></style:style></office:automatic-styles>',
      )
      .replace("</text:p>", '<text:span text:style-name="T9">plain</text:span></text:p>');
    expect(importWriterXml(styles, content, metadata(), meta).paragraphs[0]?.text).toBe("plain");

    for (const [adjust, expected] of [
      [SvxAdjust.Left, "left"],
      [SvxAdjust.Right, "right"],
      [SvxAdjust.Center, "center"],
      [SvxAdjust.Block, "justify"],
    ] as const) {
      const styledWriter = createWriterDocument(metadata(), "p1");
      styledWriter.GetDfltTextFormatColl().SetFormatAttr(new SvxAdjustItem(adjust));
      const imported = importWriterXml(
        exportStylesXml(styledWriter),
        exportContentXml(styledWriter),
        metadata(),
      );
      expect(imported.GetDfltTextFormatColl().GetAttrSet().GetAdjust().GetAdjust()).toBe(
        expected === "left"
          ? SvxAdjust.ParaStart
          : expected === "right"
            ? SvxAdjust.ParaEnd
            : expected === "center"
              ? SvxAdjust.Center
              : SvxAdjust.Block,
      );
    }
    const headingWriter = createWriterDocument(metadata(), "p1");
    headingWriter.GetTextFormatColl("heading-1").SetFormatAttr(new SvxAdjustItem(SvxAdjust.Right));
    expect(
      importWriterXml(exportStylesXml(headingWriter), exportContentXml(headingWriter), metadata())
        .GetTextFormatColl("heading-1")
        .GetAttrSet()
        .GetAdjust()
        .GetAdjust(),
    ).toBe(SvxAdjust.ParaEnd);
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () =>
        importWriterXml(
          styles.replace("</style:style>", "<style:paragraph-properties/></style:style>"),
          baseContent,
          metadata(),
        ),
    ).not.toThrow();
  });
});

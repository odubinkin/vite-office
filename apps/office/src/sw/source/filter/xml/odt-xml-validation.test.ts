/** @fileoverview Checks Writer ODF import validation for XML roots, declarations, styles and body structure. */
import { describe, expect, it } from "vitest";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterDocument } from "../../core/doc/doc";
import { exportContentXml, exportMetaXml, exportStylesXml } from "./xmlexp";
import { importWriterXml, parseOdfXml } from "./xmlimp";

/** Creates the shell identity used by the validation fixtures. @param title - Document title. @returns Writer shell metadata. */
function metadata(title = "Imported") {
  return createDocument({ id: "odt-1", suiteId: "writer", title });
}

describe("Writer ODF XML filters", /** Checks the XML streams before the imported model is adopted. @returns Nothing. */ () => {
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
    ).toThrow("exactly one office:text");
    const withoutStandard = styles.replace(
      /<style:style style:name="Standard"[\s\S]*?<\/style:style>/,
      "",
    );
    const defaulted = importWriterXml(withoutStandard, content, metadata(), meta);
    expect(defaulted.document.paragraphs[0]?.GetText()).toBe(writer.paragraphs[0]?.GetText());
    expect(defaulted.document.GetTextFormatColl("default").GetName()).toBe(
      writer.GetTextFormatColl("default").GetName(),
    );
    const withoutHeading = importWriterXml(
      styles.replace(/<style:style style:name="Heading_20_1"[\s\S]*?<\/style:style>/, ""),
      content,
      metadata(),
      meta,
    ).document.GetTextFormatColl("heading-1");
    expect(withoutHeading.GetName()).toBe("Heading 1");
    const characterHeading = importWriterXml(
      styles.replace(
        /(<style:style style:name="Heading_20_1"[^>]*style:family=")paragraph/,
        "$1text",
      ),
      content,
      metadata(),
      meta,
    ).document.GetTextFormatColl("heading-1");
    expect(characterHeading.GetName()).toBe(withoutHeading.GetName());
    expect(characterHeading.GetAttrSet().entries()).toEqual(withoutHeading.GetAttrSet().entries());
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
    const unknownFont = importWriterXml(
      styles,
      content.replace(
        "<office:automatic-styles>",
        '<office:automatic-styles><style:style style:name="MissingFont" style:family="text"><style:text-properties style:font-name="Missing"/></style:style>',
      ),
      metadata(),
      meta,
    ).document;
    expect(unknownFont.paragraphs.length).toBeGreaterThan(0);
    unknownFont.Dispose();
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
      /** Ignores non-font children without replacing declarations. @returns Invalid document. */ () =>
        importWriterXml(
          styles.replace(
            "<office:font-face-decls>",
            '<office:font-face-decls><style:style style:name="Wrong" style:family="text"/>',
          ),
          content,
          metadata(),
          meta,
        ),
    ).not.toThrow();
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
});

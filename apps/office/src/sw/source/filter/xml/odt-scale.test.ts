/** @fileoverview Verifies bounded streaming ODF import/export at representative document scale. */

import { describe, expect, it } from "vitest";

import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { exportContentXml } from "./xmlexp";
import { importWriterXml } from "./xmlimp";
import { projectWriterTextRuns } from "../../core/txtnode/text-run-projection";

const namespaces = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:fo="${ODF_NAMESPACES.fo}"`;
const styles = `<?xml version="1.0"?><office:document-styles ${namespaces} office:version="1.3"><office:font-face-decls/><office:styles><style:default-style style:family="paragraph"/><style:style style:name="IgnoredTable" style:family="table"><style:text-properties/></style:style><style:style style:name="Standard" style:family="paragraph"/><style:style style:name="Heading_20_1" style:family="paragraph" style:parent-style-name="Standard"/></office:styles></office:document-styles>`;

/** Creates a content.xml fixture. @param body - office:text body. @param automaticStyles - Style definitions. @returns XML stream. */
function content(body: string, automaticStyles = ""): string {
  return `<?xml version="1.0"?><office:document-content ${namespaces} office:version="1.3"><office:automatic-styles>${automaticStyles}</office:automatic-styles><office:body><office:text>${body}</office:text></office:body></office:document-content>`;
}

/** Creates shell metadata. @returns New document state. */
function metadata() {
  return createDocument({ id: "scale", suiteId: "writer", title: "Scale" });
}

describe("Writer streaming XML scale", /** Groups scale scenarios. @returns Nothing. */ () => {
  it("creates Writer's required empty paragraph directly", /** Verifies the empty body transaction. @returns Nothing. */ () => {
    expect(importWriterXml(styles, content(""), metadata()).document.paragraphs).toHaveLength(1);
  });
  it("imports and semantically round-trips thousands of paragraphs", /** Verifies large paragraph streams. @returns Nothing. */ () => {
    const count = 2_000;
    const body = Array.from(
      { length: count },
      /** Creates one paragraph. @param _unused - Empty slot. @param index - Paragraph index. @returns Paragraph XML. */
      (_unused, index) => `<text:p>p${index}</text:p>`,
    ).join("");
    const imported = importWriterXml(styles, content(body), metadata()).document;
    expect(imported.paragraphs).toHaveLength(count);
    const roundTripped = importWriterXml(styles, exportContentXml(imported), metadata()).document;
    expect(roundTripped.paragraphs).toHaveLength(count);
    expect(roundTripped.paragraphs[0]?.text).toBe("p0");
    expect(roundTripped.paragraphs[count - 1]?.text).toBe(`p${count - 1}`);
  });

  it("keeps deeply nested and numerous inline spans bounded to the active paragraph", /** Verifies active-context scaling. @returns Nothing. */ () => {
    const automaticStyle =
      '<style:style style:name="T1" style:family="text"><style:text-properties fo:font-weight="bold"/></style:style>';
    const nested = `${'<text:span text:style-name="T1">'.repeat(64)}deep${"</text:span>".repeat(64)}`;
    const many = Array.from(
      { length: 1_000 },
      /** Creates one inline span. @param _unused - Empty slot. @param index - Span index. @returns Span XML. */
      (_unused, index) => `<text:span text:style-name="T1">${index % 10}</text:span>`,
    ).join("");
    const document = importWriterXml(
      styles,
      content(`<text:p>${nested}</text:p><text:p>${many}</text:p>`, automaticStyle),
      metadata(),
    ).document;
    expect(document.paragraphs[0]?.text).toBe("deep");
    expect(document.paragraphs[1]?.text).toHaveLength(1_000);
    expect(projectWriterTextRuns(document.paragraphs[1])).toHaveLength(1);
  });

  it("observes cooperative cancellation during parsing and both export passes", /** Verifies cancellation checkpoints. @returns Nothing. */ () => {
    const body = Array.from(
      { length: 100 },
      /** Creates one cancellation fixture paragraph. @returns Paragraph XML. */ () =>
        "<text:p>cancel</text:p>",
    ).join("");
    let importChecks = 0;
    expect(
      /** Imports until cancellation. @returns Nothing. */ () =>
        importWriterXml(styles, content(body), metadata(), undefined, {
          isCancelled: /** Cancels during SAX dispatch. @returns Whether cancelled. */ () =>
            ++importChecks > 50,
        }),
    ).toThrow("cancelled");
    const document = importWriterXml(styles, content(body), metadata()).document;
    let exportChecks = 0;
    expect(
      /** Exports until cancellation. @returns Nothing. */ () =>
        exportContentXml(
          document,
          /** Cancels during the second pass. @returns Whether cancelled. */ () =>
            ++exportChecks > 100,
        ),
    ).toThrow("cancelled");
  });
});

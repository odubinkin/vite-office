/** @fileoverview Checks exact ODF declaration routing and explicit semantic diagnostics. */

import fs from "node:fs";
import { describe, expect, it } from "vitest";
import {
  parseOdfXmlStream,
  SvXMLIgnoreContext,
  type OdfXmlDiagnostic,
} from "../../../../xmloff/source/core/xmlimp";
import { getXMLToken, ODF_NAMESPACES, XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { importWriterXml } from "./xmlimp";
import { readOdtDocument } from "./swxml";

const namespaces = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:svg="${ODF_NAMESPACES.svg}" xmlns:loext="${ODF_NAMESPACES.loext}" xmlns:meta="${ODF_NAMESPACES.meta}"`;

/** Builds a minimal named-styles stream. @param definitions - Style children. @returns XML. */
function styles(definitions: string): string {
  return `<office:document-styles ${namespaces}><office:styles><style:style style:name="Standard" style:family="paragraph"/>${definitions}</office:styles></office:document-styles>`;
}

/** Builds a minimal document content stream. @param body - Text children. @returns XML. */
function content(body: string): string {
  return `<office:document-content ${namespaces}><office:body><office:text>${body}</office:text></office:body></office:document-content>`;
}

describe("ODT declaration import", /** Groups declaration policy assertions. @returns Nothing. */ () => {
  it("matches the pinned loext namespace exactly", /** Checks expanded-name tokenization. @returns Nothing. */ () => {
    expect(getXMLToken(ODF_NAMESPACES.loext, "theme")).toBe(XMLToken.LOEXT_THEME);
    expect(getXMLToken("urn:foreign", "theme")).toBe(XMLToken.UNKNOWN);
    expect(getXMLToken(ODF_NAMESPACES.style, "default-outline-level")).toBe(
      XMLToken.STYLE_DEFAULT_OUTLINE_LEVEL,
    );
    expect(getXMLToken(ODF_NAMESPACES.text, "display-outline-level")).toBe(
      XMLToken.TEXT_DISPLAY_OUTLINE_LEVEL,
    );
  });

  it("ignores only theme, sequence and statistic declarations with no modeled effect", /** Checks explicit metadata-only contexts. @returns Nothing. */ () => {
    const diagnostics: OdfXmlDiagnostic[] = [];
    const themed = styles(
      '<loext:theme loext:name="Unused"><loext:theme-colors><loext:color loext:name="Accent" loext:color="#123456"/></loext:theme-colors></loext:theme>',
    );
    const body = content(
      '<text:sequence-decls><text:sequence-decl text:name="Figure" text:display-outline-level="0"/></text:sequence-decls><text:p>Sample</text:p>',
    );
    const meta = `<office:document-meta ${namespaces}><office:meta><meta:document-statistic meta:paragraph-count="1"/></office:meta></office:document-meta>`;
    const imported = importWriterXml(themed, body, { title: "fixture" }, meta, {
      onDiagnostic:
        /** Collects structural events. @param diagnostic - Event. @returns New count. */
        (diagnostic) => diagnostics.push(diagnostic),
    });
    const plain = importWriterXml(styles(""), content("<text:p>Sample</text:p>"), {
      title: "fixture",
    });
    expect(imported.document.paragraphs[0]?.GetText()).toBe(
      plain.document.paragraphs[0]?.GetText(),
    );
    expect(imported.document.GetPageDesc().GetValue()).toEqual(
      plain.document.GetPageDesc().GetValue(),
    );
    expect(diagnostics).toEqual([]);
  });

  it("keeps invalid outline and font metadata explicit for later semantic phases", /** Checks non-metadata attributes remain diagnostic. @returns Nothing. */ () => {
    const diagnostics: OdfXmlDiagnostic[] = [];
    const malformed = styles(
      '<style:style style:name="Heading_20_1" style:family="paragraph" style:default-outline-level="bad"><style:text-properties style:font-family-generic="invalid" style:font-pitch="invalid"/></style:style>',
    );
    importWriterXml(
      malformed,
      content("<text:p>Sample</text:p>"),
      { title: "fixture" },
      undefined,
      {
        onDiagnostic:
          /** Collects structural events. @param diagnostic - Event. @returns New count. */
          (diagnostic) => diagnostics.push(diagnostic),
      },
    );
    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "unsupported-attribute",
          name: "style:default-outline-level",
          stream: "styles.xml",
        }),
        expect.objectContaining({
          kind: "unsupported-attribute",
          name: "style:font-family-generic",
          stream: "styles.xml",
        }),
        expect.objectContaining({
          kind: "unsupported-attribute",
          name: "style:font-pitch",
          stream: "styles.xml",
        }),
      ]),
    );
  });

  it("does not generalize metadata suppression to other ignored subtrees", /** Checks default ignore policy retains diagnostics. @returns Nothing. */ () => {
    const diagnostics: OdfXmlDiagnostic[] = [];
    parseOdfXmlStream(
      `<office:document-content ${namespaces}><foreign:child xmlns:foreign="urn:foreign" foreign:attribute="retained"/></office:document-content>`,
      {
        /** Creates a default ignored root. @returns Context. */
        createFastContext(): SvXMLIgnoreContext {
          return new SvXMLIgnoreContext();
        },
        /** Rejects unknown roots. @returns Null. */
        createUnknownContext(): null {
          return null;
        },
      },
      {
        onDiagnostic: /** Collects events. @param diagnostic - Event. @returns New count. */ (
          diagnostic,
        ) => diagnostics.push(diagnostic),
      },
    );
    expect(diagnostics).toContainEqual(
      expect.objectContaining({ kind: "unknown-attribute", name: "foreign:attribute" }),
    );
  });

  it("keeps pinned styles.odt and feature_text.odt canonical imports while diagnosing font metadata", /** Checks source-backed fixture semantics. @returns Completion after imports. */ async () => {
    const fixtureCases = [
      { file: "src/sw/qa/uitest/data/styles.odt", paragraphs: 5 },
      { file: "src/sw/qa/extras/odfimport/data/feature_text.odt", paragraphs: 1 },
    ];
    for (const fixture of fixtureCases) {
      const diagnostics: OdfXmlDiagnostic[] = [];
      const imported = await readOdtDocument(
        new Uint8Array(fs.readFileSync(fixture.file)),
        { title: fixture.file },
        undefined,
        {
          onDiagnostic:
            /** Collects structural events. @param diagnostic - Event. @returns New count. */
            (diagnostic) => diagnostics.push(diagnostic),
        },
      );
      expect(imported.document.paragraphs).toHaveLength(fixture.paragraphs);
      expect(diagnostics).not.toContainEqual(
        expect.objectContaining({ name: "text:display-outline-level" }),
      );
      if (fixture.file.includes("feature_text"))
        expect(diagnostics).toContainEqual(
          expect.objectContaining({
            kind: "unsupported-attribute",
            name: "style:font-family-generic",
          }),
        );
    }
  });
});

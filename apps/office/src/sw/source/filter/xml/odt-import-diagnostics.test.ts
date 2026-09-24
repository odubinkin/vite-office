/** @fileoverview Verifies opt-in structural diagnostics without changing ordinary ODT warnings. */

import fs from "node:fs";
import { describe, expect, it } from "vitest";
import {
  parseOdfXmlStream,
  SvXMLImportContext,
  type OdfXmlDiagnostic,
  type FastAttributeList,
} from "../../../../xmloff/source/core/xmlimp";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { readOdtDocument } from "./swxml";

describe("ODT structural diagnostic callback", /** Groups diagnostic routing assertions. @returns Nothing. */ () => {
  it("receives the stream from a pinned upstream ODT through SwXMLReader", /** Checks the real reader callback. @returns Completion after import. */ async () => {
    // Pinned odffeatures.cxx fixture; the private certification file is not a test input.
    const bytes = new Uint8Array(
      fs.readFileSync("src/sw/qa/extras/odfimport/data/feature_text.odt"),
    );
    const diagnostics: OdfXmlDiagnostic[] = [];
    const imported = await readOdtDocument(bytes, { title: "fixture" }, undefined, {
      onDiagnostic:
        /** Collects structural events. @param diagnostic - Event. @returns New count. */
        (diagnostic) => diagnostics.push(diagnostic),
    });
    expect(imported.document.paragraphs).toHaveLength(1);
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        kind: "unknown-attribute",
        stream: "content.xml",
        name: "style:font-family-generic",
      }),
    );
  });

  it("reports unknown and context-unsupported attributes and child paths without values", /** Checks exact paths and redaction. @returns Nothing. */ () => {
    const diagnostics: OdfXmlDiagnostic[] = [];
    /** Minimal context that rejects all known attributes and unknown children. */
    class RootContext extends SvXMLImportContext {
      /** Checks the context attribute policy. @param _element - Root token. @param attributes - Tokenized attributes. @returns Nothing. */
      public override startFastElement(_element: number, attributes: FastAttributeList): void {
        attributes.assertOnly([], "test root");
      }
    }
    parseOdfXmlStream(
      `<office:document-content xmlns:office="${ODF_NAMESPACES.office}" xmlns:foreign="urn:foreign" office:version="1.3" foreign:secret="PRIVATE"><foreign:child foreign:value="HIDDEN"/></office:document-content>`,
      {
        /** Creates root context. @returns Context. */
        createFastContext(): SvXMLImportContext {
          return new RootContext();
        },
        /** Rejects unknown root. @returns Null. */
        createUnknownContext(): null {
          return null;
        },
      },
      {
        onDiagnostic:
          /** Collects structural events. @param diagnostic - Event. @returns New count. */
          (diagnostic) => diagnostics.push(diagnostic),
      },
    );
    expect(
      diagnostics.map(
        /** Projects one event kind. @param diagnostic - Event. @returns Kind. */
        (diagnostic) => diagnostic.kind,
      ),
    ).toEqual([
      "unknown-attribute",
      "unsupported-attribute",
      "unknown-attribute",
      "unknown-element",
    ]);
    expect(diagnostics[1]).toMatchObject({
      path: "/office:document-content",
      name: "office:version",
    });
    expect(JSON.stringify(diagnostics)).not.toMatch(/PRIVATE|HIDDEN/u);
  });
});

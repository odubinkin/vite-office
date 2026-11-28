/** @fileoverview Writer ODT PageNumber and continuation fields through native layout and Worker. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { packXmlPackage } from "../../../../package/source/zippackage/xml-package";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import {
  createOdtWorkerDocument,
  restoreOdtWorkerDocumentAsync,
} from "../../../browser/filter/xml/odt-transfer";
import { SwLineNumberInfo } from "../../../inc/lineinfo";
import { SwPageNumSubType } from "../../core/fields/docufld.pagenumber";
import { SwRootFrame } from "../../core/layout/newfrm";
import { SwFrame } from "../../core/layout/wsfrm";
import { SwDoc } from "../../core/doc/doc";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument, writeOdtXml } from "./wrtxml";

const metadata = { title: "Page fields" };
const ns = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:fo="${ODF_NAMESPACES.fo}"`;

it("keeps the original testWhitespace page-number field as a field" /** Loads and saves the pinned upstream document with its original page number portion. @returns Completion. */, async () => {
  const name = "../../vendor/libreoffice-reference/sw/qa/extras/odfexport/data/whitespace.odt";
  const original = await readOdtDocument(new Uint8Array(readFileSync(name)), metadata);
  try {
    const fields = original.document
      .GetNodes()
      .entries()
      .flatMap(
        /** Finds the actual field attached to the native paragraph. @param node - Text or structural node. @returns Native number fields. */
        (node) => node.GetTextNode()?.GetpSwpHints()?.GetPageNumberFields() ?? [],
      );
    expect(fields).toHaveLength(1);
    expect(fields[0]?.GetAttr().GetField().GetSubType()).toBe(SwPageNumSubType.Random);
    const output = await DocumentArchive.open(await writeOdtDocument(original.document, metadata));
    const xml = new DOMParser().parseFromString(
      await output.readTextEntry("content.xml"),
      "application/xml",
    );
    expect(xml.getElementsByTagNameNS(ODF_NAMESPACES.text, "page-number")).toHaveLength(1);
  } finally {
    original.document.Dispose();
  }
});

it("roundtrips page numbering, relative selection and continuation across layout and the Worker" /** Uses actual body frames and a named page descriptor with Roman numerals. @returns Completion. */, async () => {
  const empty = new SwDoc();
  const base = writeOdtXml(empty, metadata).files;
  empty.Dispose();
  const styles = `<office:document-styles ${ns}><office:automatic-styles><style:page-layout style:name="pm1"><style:page-layout-properties fo:page-width="8in" fo:page-height="10in" style:num-format="i"/></style:page-layout></office:automatic-styles><office:master-styles><style:master-page style:name="Standard" style:page-layout-name="pm1"/></office:master-styles></office:document-styles>`;
  const content = `<office:document-content ${ns}><office:automatic-styles><style:style style:family="paragraph" style:name="P1"><style:paragraph-properties fo:break-before="page"/></style:style></office:automatic-styles><office:body><office:text><text:p><text:page-number/>|<text:page-number text:select-page="next" text:page-adjust="-1" style:num-format="I"/>|<text:page-continuation text:select-page="next" text:string-value="Continue">fallback</text:page-continuation></text:p><text:p text:style-name="P1"><text:page-number/>|<text:page-continuation text:select-page="next">More</text:page-continuation></text:p></office:text></office:body></office:document-content>`;
  const input = await packXmlPackage({ ...base, "styles.xml": styles, "content.xml": content });
  const source = await readOdtDocument(input, metadata);
  const document = source.document;
  const root = new SwRootFrame(
    /** Borrows the original document of these formatted frames. @returns Writer document. */
    () => document,
  );
  try {
    expect(document.GetPageDesc().GetNumType().GetNumberingType()).toBe(
      SvxNumType.SVX_NUM_ROMAN_LOWER,
    );
    const snapshot = root.Format(
      document.paragraphs.map(
        /** Measures one authored line per source paragraph. @param node - Actual paragraph. @param index - Source position. @returns Frame input. */
        (node, index) => ({
          id: String(index),
          lines: [{ start: 0, end: node.Len(), height: 200 }],
        }),
      ),
      document.GetPageDesc().GetValue(),
      undefined,
      new SwLineNumberInfo().QueryValue(),
    );
    expect(snapshot.pages).toHaveLength(2);
    const restored = await restoreOdtWorkerDocumentAsync(
      structuredClone(createOdtWorkerDocument(source)),
      undefined,
      /** Keeps the worker restore active for the round trip. @returns False, since the operation remains active. */ () =>
        false,
    );
    try {
      const fields = restored.document.paragraphs[0]?.GetpSwpHints()?.GetPageNumberFields();
      assert(fields);
      expect(
        fields.map(
          /** Reads the original formatted occurrence. @param hint - Page field. @returns Expansion. */
          (hint) => hint.GetAttr().GetField().Expand(),
        ),
      ).toEqual(["i", "I", "Continue"]);
      expect(restored.document.GetPageDesc().GetNumType().GetNumberingType()).toBe(
        SvxNumType.SVX_NUM_ROMAN_LOWER,
      );
      const saved = await DocumentArchive.open(await writeOdtDocument(restored.document, metadata));
      const savedContent = new DOMParser().parseFromString(
        await saved.readTextEntry("content.xml"),
        "application/xml",
      );
      const pages = savedContent.getElementsByTagNameNS(ODF_NAMESPACES.text, "page-number");
      expect(pages[1]?.getAttributeNS(ODF_NAMESPACES.text, "select-page")).toBe("next");
      expect(pages[1]?.getAttributeNS(ODF_NAMESPACES.text, "page-adjust")).toBe("-1");
      const continuations = savedContent.getElementsByTagNameNS(
        ODF_NAMESPACES.text,
        "page-continuation",
      );
      expect(continuations[0]?.textContent).toBe("Continue");
      expect(continuations[1]?.textContent).toBe("");
      expect(continuations[1]?.getAttributeNS(ODF_NAMESPACES.text, "string-value")).toBe("More");
    } finally {
      restored.document.Dispose();
    }
  } finally {
    SwFrame.DestroyFrame(root);
    document.Dispose();
  }
});

/** @fileoverview Ports the original Writer ODF statistics field package regression. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import {
  createOdtWorkerDocument,
  restoreOdtWorkerDocumentAsync,
} from "../../../browser/filter/xml/odt-transfer";
import { SwDocStatSubType } from "../../core/fields/docufld";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

it("roundtrips the original page-count-range from testTdf71583 through the Worker" /** Keeps the original namespace and numbering style from the pinned ODF regression. @returns Completion. */, async () => {
  const file = readFileSync(
    "../../vendor/libreoffice-reference/sw/qa/extras/odfexport/data/tdf71583.odt",
  );
  const metadata = { title: "Page count" };
  const source = await readOdtDocument(new Uint8Array(file), metadata);
  try {
    expect(source.document.getIDocumentStatistics().GetDocStat()).toMatchObject({
      nPage: 1,
      nPara: 1,
      nWord: 5,
      nChar: 24,
    });
    const restored = await restoreOdtWorkerDocumentAsync(
      structuredClone(createOdtWorkerDocument(source)),
      undefined,
      /** Keeps the worker restore active for the round trip. @returns False, since the operation remains active. */ () =>
        false,
    );
    try {
      const field = restored.document.paragraphs[0]
        ?.GetpSwpHints()
        ?.GetDocStatFields()[0]
        ?.GetAttr()
        .GetField();
      expect(field?.GetSubType()).toBe(SwDocStatSubType.PageRange);
      expect(field?.GetFormat()).toBe(SvxNumType.SVX_NUM_ROMAN_LOWER);
      const output = await writeOdtDocument(restored.document, metadata);
      const archive = await DocumentArchive.open(output);
      const content = await archive.readTextEntry("content.xml");
      const xml = new DOMParser().parseFromString(content, "application/xml");
      const paragraph = xml.getElementsByTagNameNS(ODF_NAMESPACES.text, "p")[0];
      const fieldElement = Array.from(paragraph?.children ?? []).find(
        /** Treats ODF's explicit space markup as paragraph text. @param child - Direct paragraph element. @returns Whether the element is a field. */
        (child) => child.namespaceURI !== ODF_NAMESPACES.text || child.localName !== "s",
      );
      expect(fieldElement?.localName).toBe("page-count-range");
      expect(fieldElement?.namespaceURI).toBe(ODF_NAMESPACES.loext);
      expect(fieldElement?.getAttributeNS(ODF_NAMESPACES.style, "num-format")).toBe("i");
    } finally {
      restored.document.Dispose();
    }
  } finally {
    source.document.Dispose();
  }
});

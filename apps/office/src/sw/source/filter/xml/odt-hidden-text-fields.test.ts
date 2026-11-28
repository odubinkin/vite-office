/** @fileoverview Pinned conditional text fixtures and native hidden text ODT fields. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import {
  createOdtWorkerDocument,
  restoreOdtWorkerDocumentAsync,
} from "../../../browser/filter/xml/odt-transfer";
import type { SwDoc } from "../../core/doc/doc";
import { SwHiddenTextField } from "../../core/fields/docufld";
import { SwSetExpField } from "../../core/fields/expfld";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";
import { importWriterXml } from "./xmlimp";

const metadata = { title: "Conditional fields" };

/** Finds the native conditional text fields in document order. @param document - Source Writer document. @returns Attached fields. */
function hiddenFields(document: SwDoc): SwHiddenTextField[] {
  const result: SwHiddenTextField[] = [];
  for (const node of document.GetNodes().entries())
    for (const hint of node.GetTextNode()?.GetpSwpHints()?.GetOrdinaryFields() ?? []) {
      const field = hint.GetAttr().GetField();
      if (field instanceof SwHiddenTextField) result.push(field);
    }
  return result;
}

it.each([
  ["ooxmlexport/data/conditional-text.fodt", "True", "1 < 2", '"True"', '- "False" -'],
  ["uiwriter/data/set-variable-hidden-text.fodt", "Expected", "foo==2", "Expected", "Fail"],
])(
  "keeps the native conditional text from %s",
  /** Replays the original authored fields through ODT and Worker. @param file - Native fixture. @param presentation - Expected displayed branch. @param condition - Original Writer expression. @param yes - Original true branch. @param no - Original false branch. @returns Completion. */ async (
    file,
    presentation,
    condition,
    yes,
    no,
  ) => {
    const content = readFileSync(`../../vendor/libreoffice-reference/sw/qa/extras/${file}`, "utf8")
      .replace("<office:document ", "<office:document-content ")
      .replace("</office:document>", "</office:document-content>");
    const source = importWriterXml(undefined, content, metadata);
    try {
      expect(hiddenFields(source.document)[0]?.Expand()).toBe(presentation);
      const restored = await restoreOdtWorkerDocumentAsync(
        structuredClone(createOdtWorkerDocument(source)),
        undefined,
        /** Keeps the worker restore active for the round trip. @returns False, since the operation remains active. */ () =>
          false,
      );
      try {
        restored.document.getIDocumentFieldsAccess().UpdateExpFields();
        const bytes = await writeOdtDocument(restored.document, metadata);
        const reopened = await readOdtDocument(bytes, metadata);
        try {
          expect(hiddenFields(reopened.document)[0]?.GetData()).toMatchObject({
            condition,
            trueContent: yes,
            falseContent: no,
            hidden: false,
          });
          expect(hiddenFields(reopened.document)[0]?.Expand()).toBe(presentation);
          for (const node of reopened.document.GetNodes().entries())
            for (const hint of node.GetTextNode()?.GetpSwpHints()?.GetOrdinaryFields() ?? []) {
              const field = hint.GetAttr().GetField();
              if (field instanceof SwSetExpField) field.SetFormula("3");
            }
          if (condition === "foo==2") {
            reopened.document.getIDocumentFieldsAccess().UpdateExpFields();
            expect(hiddenFields(reopened.document)[0]?.Expand()).toBe("Fail");
            expect(hiddenFields(reopened.document)[0]?.GetData().hidden).toBe(true);
          }
        } finally {
          reopened.document.Dispose();
        }
      } finally {
        restored.document.Dispose();
      }
    } finally {
      source.document.Dispose();
    }
  },
);

it("keeps native hidden text, legacy content and an unsupported condition's presentation", /** Checks Writer namespace resolution and native flag export. @returns Completion. */ async () => {
  const content = `<office:document-content xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:w="${ODF_NAMESPACES.ooow}" xmlns:other="urn:other"><office:body><office:text><text:p><text:hidden-text text:condition="w:1 EQ 1" office:string-value="Secret" text:is-hidden="true">Secret</text:hidden-text><text:hidden-text text:condition="w:FALSE" text:string-value="Visible"/><text:conditional-text text:condition="other:TRUE" text:string-value-if-true="a" text:string-value-if-false="b">fallback</text:conditional-text></text:p></office:text></office:body></office:document-content>`;
  const source = importWriterXml(undefined, content, metadata);
  try {
    expect(
      hiddenFields(source.document).map(
        /** Expands the native hidden-text field in the first state. @param field - Native Writer field. @returns Visible field text. */ (
          field,
        ) => field.Expand(),
      ),
    ).toEqual(["Secret", ""]);
    source.document.getIDocumentFieldsAccess().UpdateExpFields();
    expect(
      hiddenFields(source.document).map(
        /** Expands the native hidden-text field after updating its owner. @param field - Native Writer field. @returns Visible field text. */ (
          field,
        ) => field.Expand(),
      ),
    ).toEqual(["", "Visible"]);
    const archive = await DocumentArchive.open(await writeOdtDocument(source.document, metadata));
    const serialized = await archive.readTextEntry("content.xml");
    const xml = new DOMParser().parseFromString(serialized, "application/xml");
    const fields = xml.getElementsByTagNameNS(ODF_NAMESPACES.text, "hidden-text");
    expect(fields).toHaveLength(2);
    expect(fields[0]?.getAttributeNS(ODF_NAMESPACES.text, "is-hidden")).toBeNull();
    expect(fields[1]?.getAttributeNS(ODF_NAMESPACES.text, "is-hidden")).toBe("true");
    expect(xml.getElementsByTagNameNS(ODF_NAMESPACES.text, "conditional-text")).toHaveLength(0);
    expect(xml.getElementsByTagNameNS(ODF_NAMESPACES.text, "p")[0]?.textContent).toBe(
      "Visiblefallback",
    );
  } finally {
    source.document.Dispose();
  }
});

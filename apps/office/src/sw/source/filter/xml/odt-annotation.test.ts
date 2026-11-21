/** @fileoverview Exercises native annotations through Writer's ODT import. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import {
  createOdtWriterTransfer,
  restoreOdtWriterTransfer,
} from "../../../browser/filter/xml/odt-transfer";
import { RES_TXTATR_ANNOTATION } from "../../../inc/hintids";
import { SwTextField } from "../../../inc/txtfld";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

it("imports the named annotation and range from the upstream backward-search document", /** Reads the LibreOffice QA sample through the ordinary Writer importer. @returns Completion. */ async () => {
  const sample =
    "../../vendor/libreoffice-reference/sw/qa/extras/uiwriter/data/tdf147583_backwardSearch.odt";
  const { document } = await readOdtDocument(
    new Uint8Array(readFileSync(sample)),
    { title: "ODT annotations" },
    undefined,
    { onDiagnostic: /** Omits unrelated diagnostics. @returns Nothing. */ () => undefined },
  );
  const fields: SwTextField[] = [];
  for (const node of document.GetNodes().entries()) {
    const hints = node.GetTextNode()?.GetpSwpHints();
    for (let index = 0; hints && index < hints.Count(); index++) {
      const hint = hints.Get(index);
      if (hint instanceof SwTextField && hint.Which() === RES_TXTATR_ANNOTATION) fields.push(hint);
    }
  }
  expect(fields).toHaveLength(1);
  const [field] = fields;
  if (!field) throw new Error("Fixture annotation is missing.");
  expect(field.GetAttr().GetField().GetData()).toMatchObject({
    author: "Unknown Author",
    name: "__Annotation__75_3386804513",
    resolved: false,
    text: "Comments are also checked\n\nFor empty paragraphs",
  });
  const mark = document.GetIDocumentMarkAccess().GetAnnotationMark(field.GetAttr());
  expect(mark).toBeDefined();
  expect(mark?.GetMarkEnd().GetNode()).toBe(field.GetTextNode());
  expect(mark?.GetMarkEnd().GetContentIndex()).toBe(field.GetStart() + 1);

  const transfer = createOdtWriterTransfer(document);
  expect(transfer.graph.annotations).toHaveLength(1);
  const restored = restoreOdtWriterTransfer(structuredClone(transfer));
  expect(createOdtWriterTransfer(restored).graph.annotations).toEqual(transfer.graph.annotations);
  const bytes = await writeOdtDocument(restored, { title: "ODT annotations" });
  const xml = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
  expect(xml).toContain('<office:annotation office:name="__Annotation__75_3386804513"');
  expect(xml).toContain('<office:annotation-end office:name="__Annotation__75_3386804513"/>');
  expect(xml).not.toContain("\ufff9");
  const reloaded = await readOdtDocument(bytes, { title: "ODT annotations" });
  const before = transfer.graph.annotations?.[0];
  const after = createOdtWriterTransfer(reloaded.document).graph.annotations?.[0];
  expect(after).toEqual({ ...before, id: after?.id });
});

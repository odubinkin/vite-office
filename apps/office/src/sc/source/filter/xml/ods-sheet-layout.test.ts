/** @fileoverview Pinned Calc ODS sheet writing direction through the native model and Worker. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import type { ScDocument } from "../../../inc/document";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";

it("retains the original LTR and RTL sheets used by testCellMinimalInvalidations", /** Checks the ODS and Worker contracts for both directions in an actual document. @returns Completion. */ async () => {
  const path =
    "../../vendor/libreoffice-reference/sc/qa/unit/tiledrendering/data/cell-invalidations.ods";
  const original = await readOdsDocument(new Uint8Array(readFileSync(path)));
  let worker: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  try {
    expect(original.GetTableCount()).toBe(2);
    expect([original.IsLayoutRTL(0), original.IsLayoutRTL(1)]).toEqual([false, true]);
    expect(original.IsImportingXML()).toBe(false);
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(original)));
    expect([worker.IsLayoutRTL(0), worker.IsLayoutRTL(1)]).toEqual([false, true]);
    const bytes = await writeOdsDocument(worker);
    const content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    expect(content).toMatch(/<style:table-properties[^>]* style:writing-mode="lr-tb"/u);
    expect(content).toMatch(/<style:table-properties[^>]* style:writing-mode="rl-tb"/u);
    reopened = await readOdsDocument(bytes);
    expect([reopened.IsLayoutRTL(0), reopened.IsLayoutRTL(1)]).toEqual([false, true]);
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    original.Dispose();
  }
});

/** @fileoverview Formula input,history,dependency changes and ODS primary persistence share the actual aggregate kernel. */
import { assert, expect, it } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { IndexedDbDocumentStore } from "../../../framework/browser/storage/document-store";
import { createCalcSession } from "../composition/calc-module";
import { ScAddress } from "../../inc/address";
import { FormulaGrammar } from "../../../formula/inc/grammar";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
it("retains native aggregate source and live dependency results across undo,redo,primary save and fresh ODS reopen", /** Uses actual controller,shell,filter,store and document graph. @returns Completion. */ async () => {
  const db = new IndexedDbDocumentStore(crypto.randomUUID(), new IDBFactory()),
    s = createCalcSession(db),
    c = s.controller;
  expect(c.EnterString("4")).toBe(true);
  c.Select(1, 0);
  expect(c.EnterString("6")).toBe(true);
  c.Select(2, 0);
  expect(c.EnterString("=SUM(A1;B1;PRODUCT(2;3))")).toBe(true);
  const p = new ScAddress(2, 0, 0);
  expect(c.shell.GetDocument().GetValue(p)).toBe(16);
  c.Select(0, 0);
  c.EnterString("10");
  expect(c.shell.GetDocument().GetValue(p)).toBe(22);
  c.Undo();
  expect(c.shell.GetDocument().GetValue(p)).toBe(16);
  c.Redo();
  expect(c.shell.GetDocument().GetValue(p)).toBe(22);
  await s.fileWorkflows.Flush();
  const records = await db.list();
  expect(records).toHaveLength(1);
  assert(records[0]);
  const record = await db.load(records[0].id);
  assert(record);
  expect(record.content.files["content.xml"]).toContain(
    'table:formula="of:=SUM([.A1];[.B1];PRODUCT(2;3))"',
  );
  s.Close();
  const reopened = createCalcSession(db);
  await reopened.fileWorkflows.OpenStored(record.id);
  const doc = reopened.controller.shell.GetDocument();
  const cell = doc.GetFormulaCell(p);
  assert(cell);
  expect(text(cell.GetFormula(FormulaGrammar.Grammar.GRAM_NATIVE))).toBe(
    "=SUM(A1;B1;PRODUCT(2;3))",
  );
  expect(doc.GetValue(p)).toBe(22);
  reopened.controller.Select(1, 0);
  reopened.controller.EnterString("20");
  expect(doc.GetValue(p)).toBe(36);
  reopened.Close();
});

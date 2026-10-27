/** @fileoverview Native Calc defaults, invalid coordinates and failed shared-storage admission. */
import { expect, it, vi } from "vitest";
import { ScDocument } from "../../../inc/document";
import { CellType } from "../../../inc/global";
import { ScAddress } from "../../../inc/address";
import { ScInterpreterContext } from "../../../inc/interpretercontext";
import { SharedString } from "../../../../svl/inc/sharedstring";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { TableColumnBlockPositionSet } from "./mtvelements";
import { ScDocumentImport } from "./documentimport";
import { RenameTab } from "./document10";

it("uses original interpreter defaults and default sheet-rename validation", /** Verifies real formatter forwarding and native default arguments. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    name = unicode("Original"),
    replacement = unicode("Renamed");
  try {
    expect(doc.InsertTab(0, name)).toBe(true);
    const context = new ScInterpreterContext(doc, null),
      output = context.NFGetInputLineString(12.5, 0);
    try {
      expect(text(output)).toBe("12.5");
    } finally {
      output.dispose();
    }
    expect(RenameTab.call(doc, 0, replacement)).toBe(true);
    const read = unicode("");
    try {
      expect(doc.GetName(0, read)).toBe(true);
      expect(text(read)).toBe("Renamed");
    } finally {
      read.dispose();
    }
  } finally {
    replacement.dispose();
    name.dispose();
    doc.Dispose();
  }
});

it("retains the native failed-initialization cache entry and rejects invalid raw-string coordinates", /** Checks insertion-before-initialization and real table/column early-return ownership. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    name = unicode("Data"),
    value = unicode("Retained");
  try {
    doc.InsertTab(0, name);
    const table = doc.FetchTable(0);
    if (!table) throw new Error("Expected real table");
    const cache = new TableColumnBlockPositionSet(doc, 0),
      invalid = doc.MaxCol() + 1;
    expect(cache.getBlockPosition(invalid)).toBeNull();
    expect(cache.getBlockPosition(invalid)).not.toBeNull();
    cache.invalidate();
    expect(cache.getBlockPosition(invalid)).toBeNull();
    const shared = doc.GetSharedStringPool().intern(value);
    try {
      table.SetRawString(-1, 0, shared);
      table.CreateColumnIfNotExists(0).SetRawString(-1, shared);
      expect(doc.GetCellType(new ScAddress())).toBe(CellType.CELLTYPE_NONE);
    } finally {
      shared.dispose();
    }
  } finally {
    value.dispose();
    name.dispose();
    doc.Dispose();
  }
});

it("does not publish an empty shared-string allocation during document import", /** Injects a legal allocation-failure result at the public intern boundary and verifies the cell remains unchanged. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    name = unicode("Data"),
    value = unicode("New"),
    failed = new SharedString();
  const spy = vi.spyOn(doc.GetSharedStringPool(), "intern");
  try {
    doc.InsertTab(0, name);
    doc.SetValue(new ScAddress(), 42);
    const importer = new ScDocumentImport(doc);
    spy.mockReturnValueOnce(failed);
    importer.setStringCell(new ScAddress(), value);
    expect(doc.GetValue(new ScAddress())).toBe(42);
  } finally {
    spy.mockRestore();
    failed.dispose();
    value.dispose();
    name.dispose();
    doc.Dispose();
  }
});

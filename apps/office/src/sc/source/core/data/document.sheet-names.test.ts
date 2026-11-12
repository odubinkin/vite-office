/** @fileoverview Native sheet-name lookup, lazy uppercase ownership and load-only rename behavior through actual Calc owners. */
import { assert, expect, it } from "vitest";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScDocumentImport } from "../../../inc/documentimport";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";

it.each(["", "'start", "end'", "a:b", "a\\b", "a/b", "a?b", "a*b", "a[b", "a]b", "ok\0:bad"])(
  "rejects native invalid sheet name %j",
  /** Counted UTF16 validation inspects characters beyond embedded NUL. @param value - Candidate. @returns Nothing. */ (
    value,
  ) => {
    const name = unicode(value);
    try {
      expect(ScDocument.ValidTabName(name)).toBe(false);
    } finally {
      name.dispose();
    }
  },
);
it.each(["inside'apostrophe", "a".repeat(40), "ok\0tail", "字"])(
  "accepts native valid sheet name %j",
  /** No external file-format length policy is introduced. @param value - Candidate. @returns Nothing. */ (
    value,
  ) => {
    const name = unicode(value);
    try {
      expect(ScDocument.ValidTabName(name)).toBe(true);
    } finally {
      name.dispose();
    }
  },
);
it("looks up actual sheets across documents and invalidates the table cache on every assignment", /** The borrowed cache remains the same owner while owned copies retain their old value. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    other = new ScDocument(),
    importer = new ScDocumentImport(doc),
    second = new ScDocumentImport(other);
  const original = unicode("Straße"),
    query = unicode("STRAẞE"),
    renamed = unicode("Renamed"),
    invalid = unicode("bad/name"),
    output: [number] = [99];
  const names: OUString[] = [];
  try {
    expect(doc.GetTable(query, output)).toBe(false);
    expect(output[0]).toBe(0);
    expect(importer.getSheetIndex(query)).toBe(-1);
    expect(importer.appendSheet(original)).toBe(true);
    expect(second.appendSheet(renamed)).toBe(true);
    expect(second.appendSheet(original)).toBe(true);
    const table = doc.FetchTable(0);
    assert(table);
    const borrowed = table.GetUpperName();
    names.push(new OUString(borrowed));
    expect(text(borrowed)).toBe("STRAẞE");
    expect(table.GetUpperName()).toBe(borrowed);
    expect(importer.getSheetIndex(query)).toBe(0);
    expect(second.getSheetIndex(query)).toBe(1);
    expect(doc.ValidNewTabName(query)).toBe(false);
    expect(doc.ValidNewTabName(invalid)).toBe(false);
    expect(doc.ValidNewTabName(renamed)).toBe(true);
    table.SetName(original);
    expect(borrowed.isEmpty()).toBe(true);
    expect(table.GetUpperName()).toBe(borrowed);
    expect(text(names[0] as OUString)).toBe("STRAẞE");
    table.SetStreamValid(true);
    importer.setSheetName(-1, renamed);
    importer.setSheetName(4, renamed);
    importer.setSheetName(0, invalid);
    expect(importer.getSheetIndex(query)).toBe(0);
    importer.setSheetName(65536, renamed);
    expect(table.IsStreamValid()).toBe(true);
    expect(importer.getSheetIndex(query)).toBe(-1);
    expect(importer.getSheetIndex(renamed)).toBe(0);
    expect(importer.getSheetCount()).toBe(1);
    expect(doc.FetchTable(0)).toBe(table);
    expect(doc.RenameTab(0, original)).toBe(true);
    expect(table.IsStreamValid()).toBe(false);
  } finally {
    for (const value of names) value.dispose();
    for (const value of [original, query, renamed, invalid]) value.dispose();
    other.Dispose();
    doc.Dispose();
  }
});
it("copies positional names from a real sparse clipboard document", /** Returned strings outlive their source document and holes retain their indices. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP),
    importer = new ScDocumentImport(doc),
    label = unicode("Last");
  let names: OUString[];
  try {
    for (const value of ["First", "Second"]) {
      const name = unicode(value);
      try {
        importer.appendSheet(name);
      } finally {
        name.dispose();
      }
    }
    importer.appendSheet(label);
    clip.ResetClip(doc, 2);
    names = clip.GetAllTableNames();
    expect(names.map(text)).toEqual(["", "", "baeh"]);
    const tab: [number] = [8];
    expect(clip.GetTable(label, tab)).toBe(false);
    expect(tab[0]).toBe(0);
  } finally {
    clip.Dispose();
    doc.Dispose();
    label.dispose();
  }
  try {
    expect(names.map(text)).toEqual(["", "", "baeh"]);
  } finally {
    for (const name of names) name.dispose();
  }
});

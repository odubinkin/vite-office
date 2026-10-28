/** @fileoverview Native rich-text cell snapshots clone across document commit, release and replacement. */
import { assert, expect, it } from "vitest";
import {
  type EditTextObject,
  EditTextObjectImpl,
  TextRotation,
} from "../../../../editeng/inc/editobj";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { MapUnit } from "../../../../tools/inc/mapunit";
import { ScAddress } from "../../../inc/address";
import { ScCellValue, ScRefCellValue } from "../../../inc/cellvalue";
import { CellType } from "../../../inc/global";
import { ScDocShell } from "../../ui/docshell/docsh";

it("keeps rich-text snapshots independent across copy, commit and release", /** Checks actual EditTextObject ownership while the source and destination cells are replaced. @returns Nothing. */ () => {
  const shell = new ScDocShell();
  const doc = shell.GetDocument();
  const source = new EditTextObjectImpl(
    null,
    MapUnit.Map100thMM,
    false,
    TextRotation.NONE,
    SvtScriptType.LATIN,
  );
  const firstText = unicode("Rich text");
  source.CreateAndInsertContent().SetText(firstText);
  firstText.dispose();
  const owned = new ScCellValue(source);
  const copy = new ScCellValue(owned);
  const snapshot = new ScCellValue();
  try {
    expect(owned.getType()).toBe(CellType.CELLTYPE_EDIT);
    expect(owned.getEditText()).not.toBe(source);
    expect(copy.getEditText()).not.toBe(owned.getEditText());
    const secondText = unicode("Second paragraph");
    source.CreateAndInsertContent().SetText(secondText);
    secondText.dispose();
    expect((owned.getEditText() as EditTextObject).GetParagraphCount()).toBe(1);
    copy.commit(doc, new ScAddress());
    const committed = doc.GetRefCellValue(new ScAddress()).getEditText();
    assert(committed);
    expect(committed).not.toBe(copy.getEditText());
    copy.clear();
    expect(text(committed.GetText(0))).toBe("Rich text");
    snapshot.assign(doc, new ScAddress());
    doc.SetEmptyCell(new ScAddress());
    expect(text((snapshot.getEditText() as EditTextObject).GetText(0))).toBe("Rich text");
    owned.set(source);
    expect((owned.getEditText() as EditTextObject).GetParagraphCount()).toBe(2);
    owned.release(doc, new ScAddress(1, 0, 0));
    expect(owned.isEmpty()).toBe(true);
    const released = new ScCellValue(new ScRefCellValue(doc, new ScAddress(1, 0, 0)));
    try {
      expect((released.getEditText() as EditTextObject).GetParagraphCount()).toBe(2);
      expect(text((released.getEditText() as EditTextObject).GetText(1))).toBe("Second paragraph");
    } finally {
      released.clear();
    }
    expect(
      /** Reads a wrong variant through the native exception boundary. @returns No edit value. */ () =>
        owned.getEditText(),
    ).toThrow("bad_variant_access");
  } finally {
    snapshot.clear();
    copy.clear();
    owned.clear();
    source.dispose();
    shell.Close();
  }
});

it("transfers the exact rich-text owner while retaining the original null EDIT alternative", /** sc/inc/cellvalue.hxx releaseEditText assigns a null EditTextObject pointer to the variant; the caller owns the returned object and may clear the null cell independently. @returns Nothing. */ () => {
  const source = new EditTextObjectImpl(
      null,
      MapUnit.Map100thMM,
      false,
      TextRotation.NONE,
      SvtScriptType.LATIN,
    ),
    content = unicode("Retained after release");
  source.CreateAndInsertContent().SetText(content);
  content.dispose();
  const cell = new ScCellValue(source),
    retained = cell.getEditText();
  assert(retained);
  try {
    expect(retained).not.toBe(source);
    expect(cell.releaseEditText()).toBe(retained);
    expect(cell.getType()).toBe(CellType.CELLTYPE_EDIT);
    expect(cell.isEmpty()).toBe(false);
    expect(cell.getEditText()).toBeNull();
    expect(cell.releaseEditText()).toBeNull();
    cell.clear();
    const releasedText = retained.GetText(0);
    try {
      expect(text(releasedText)).toBe("Retained after release");
    } finally {
      releasedText.dispose();
    }
    expect(cell.isEmpty()).toBe(true);
  } finally {
    retained.dispose();
    cell.clear();
    source.dispose();
  }
});

it("preserves a scalar cell when releaseEditText encounters the wrong variant", /** The original std::get throws before assigning its null EDIT pointer. @returns Nothing. */ () => {
  const cell = new ScCellValue(42);
  try {
    expect(
      /** Calls the actual wrong-variant accessor. @returns Released owner if validation unexpectedly succeeds. */ () =>
        cell.releaseEditText(),
    ).toThrow("bad_variant_access");
    expect(cell.getType()).toBe(CellType.CELLTYPE_VALUE);
    expect(cell.getDouble()).toBe(42);
  } finally {
    cell.clear();
  }
});

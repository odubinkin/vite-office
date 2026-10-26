/** @fileoverview Native rich-text cell snapshots clone across document commit, release and replacement. */
import { assert, expect, it } from "vitest";
import { EditTextObjectImpl, TextRotation } from "../../../../editeng/inc/editobj";
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
    expect(owned.getEditText().GetParagraphCount()).toBe(1);
    copy.commit(doc, new ScAddress());
    const committed = doc.GetRefCellValue(new ScAddress()).getEditText();
    assert(committed);
    expect(committed).not.toBe(copy.getEditText());
    copy.clear();
    expect(text(committed.GetText(0))).toBe("Rich text");
    snapshot.assign(doc, new ScAddress());
    doc.SetEmptyCell(new ScAddress());
    expect(text(snapshot.getEditText().GetText(0))).toBe("Rich text");
    owned.set(source);
    expect(owned.getEditText().GetParagraphCount()).toBe(2);
    owned.release(doc, new ScAddress(1, 0, 0));
    expect(owned.isEmpty()).toBe(true);
    const released = new ScCellValue(new ScRefCellValue(doc, new ScAddress(1, 0, 0)));
    try {
      expect(released.getEditText().GetParagraphCount()).toBe(2);
      expect(text(released.getEditText().GetText(1))).toBe("Second paragraph");
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

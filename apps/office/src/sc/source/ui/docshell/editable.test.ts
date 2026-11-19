/** @fileoverview Native ScEditableTester result accumulation at the document boundary. */
import { expect, it, vi } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScMarkData } from "../../../inc/markdata";
import { ScRange } from "../../../inc/address";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScEditableTester } from "./editable";

it("retains format admission after a matrix result until a protection failure", /** Drives document results without constructing unsupported matrix geometry. @returns Nothing. */ () => {
  const doc = new ScDocument();
  const marks = new ScMarkData(doc.GetSheetLimits());
  let matrixOnly = true;
  const select = vi.spyOn(doc, "IsSelectionEditable").mockImplementation(
    /** Returns a native matrix-only or protection failure. @param _marks - Selection. @param output - Matrix-only failure result. @returns False for failure. */ (
      _marks,
      output,
    ) => {
      if (output) output[0] = matrixOnly;
      return false;
    },
  );
  try {
    const tester = ScEditableTester.CreateAndTestSelection(doc, marks);
    expect(tester.IsEditable()).toBe(false);
    expect(tester.IsFormatEditable()).toBe(true);
    matrixOnly = false;
    tester.TestSelection(doc, marks);
    tester.TestSelection(doc, marks);
    expect(select).toHaveBeenCalledTimes(2);
    expect(tester.IsFormatEditable()).toBe(false);
    expect(tester.GetMessageId()).toBe("Protected cells can not be modified.");
  } finally {
    doc.Dispose();
  }
});

it("stops after the last valid selected sheet and accumulates block failures", /** Checks the source selected-block bound and repeated matrix result propagation. @returns Nothing. */ () => {
  const doc = new ScDocument();
  const name = unicode("Sheet");
  try {
    expect(doc.InsertTab(0, name)).toBe(true);
    const marks = new ScMarkData(doc.GetSheetLimits());
    marks.SetMarkArea(new ScRange());
    marks.SetSelectedTabs([0, 4]);
    const plain = ScEditableTester.CreateAndTestSelectedBlock(doc, 0, 0, 0, 0, marks);
    expect(plain.IsFormatEditable()).toBe(true);
    expect(plain.GetMessageId()).toBe("");
    let matrixOnly = true;
    const block = vi.spyOn(doc, "IsBlockEditable").mockImplementation(
      /** Supplies the native document block decision. @param _tab - Tab. @param _firstCol - Start column. @param _firstRow - Start row. @param _lastCol - End column. @param _lastRow - End row. @param result - Matrix-only output. @returns False for the tested failures. */ (
        _tab,
        _firstCol,
        _firstRow,
        _lastCol,
        _lastRow,
        result,
      ) => {
        if (result) result[0] = matrixOnly;
        return false;
      },
    );
    const tester = ScEditableTester.CreateAndTestSelectedBlock(doc, 0, 0, 0, 0, marks);
    expect(block).toHaveBeenCalledTimes(1);
    expect(tester.IsFormatEditable()).toBe(true);
    matrixOnly = false;
    tester.TestBlock(doc, 0, 0, 0, 0, 0);
    tester.TestBlock(doc, 0, 0, 0, 0, 0);
    expect(block).toHaveBeenCalledTimes(2);
    expect(tester.IsFormatEditable()).toBe(false);
  } finally {
    name.dispose();
    doc.Dispose();
  }
});

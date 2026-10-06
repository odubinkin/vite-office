/** @fileoverview Literal native Insert Table input contracts, without invoking upstream. */
import { describe, expect, it } from "vitest";
import { SwInsTableDlg } from "./instable";
import { SwInsertTableFlags as F } from "../../../inc/itabenum";

describe("native Insert Table input ownership", /** Exercises native contracts. @returns Nothing. */ () => {
  it("initializes Writer registry defaults independently of stored repeat checkbox", /** Verifies pinned defaults and numeric flags. @returns Nothing. */ () => {
    const dlg = new SwInsTableDlg("Table1");
    expect(F).toEqual({
      NONE: 0,
      DefaultBorder: 1,
      Headline: 2,
      SplitLayout: 8,
      HeadlineNoBorder: 10,
      All: 11,
    });
    expect([
      dlg.rows,
      dlg.columns,
      dlg.header,
      dlg.repeatHeader,
      dlg.dontSplit,
      dlg.repeatRows,
      dlg.repeatMaximum,
      dlg.warning,
    ]).toEqual([2, 2, false, true, false, 1, 1, false]);
    expect(dlg.IsRepeatHeaderSensitive()).toBe(false);
    expect(dlg.GetValues()).toEqual({
      name: "Table1",
      rows: 2,
      columns: 2,
      options: { mnInsMode: 8, mnRowsToRepeat: 0 },
    });
    dlg.header = true;
    expect(dlg.IsRepeatHeaderSensitive()).toBe(true);
    expect(dlg.GetValues().options).toEqual({ mnInsMode: 10, mnRowsToRepeat: 1 });
    dlg.repeatHeader = false;
    expect(dlg.IsRepeatGroupSensitive()).toBe(false);
    expect(dlg.GetValues().options).toEqual({ mnInsMode: 10, mnRowsToRepeat: 0 });
  });
  it("admits injected native options and gates repeat count separately", /** Verifies native configuration inputs. @returns Nothing. */ () => {
    const dlg = new SwInsTableDlg("Configured", [], { mnInsMode: F.Headline, mnRowsToRepeat: 0 });
    expect([dlg.header, dlg.repeatHeader, dlg.dontSplit]).toEqual([true, false, true]);
    expect(dlg.GetValues().options).toEqual({ mnInsMode: 2, mnRowsToRepeat: 0 });
    dlg.header = false;
    expect(dlg.GetValues().options).toEqual({ mnInsMode: 0, mnRowsToRepeat: 0 });
  });
  it("restores the last entered repeated count when row capacity returns", /** Verifies the native handler trace. @returns Nothing. */ () => {
    const dlg = new SwInsTableDlg("Linked");
    dlg.ModifyRowCol("rows", "6");
    dlg.ModifyRepeatHeaderNF_Hdl(4);
    dlg.ModifyRowCol("rows", "2");
    expect([dlg.repeatRows, dlg.repeatMaximum]).toEqual([1, 1]);
    dlg.ModifyRowCol("rows", "3");
    expect([dlg.repeatRows, dlg.repeatMaximum]).toEqual([2, 2]);
    dlg.ModifyRowCol("columns", "1");
    expect(dlg.repeatRows).toBe(2);
    dlg.ModifyRowCol("rows", "6");
    expect([dlg.repeatRows, dlg.repeatMaximum]).toEqual([4, 5]);
    dlg.ModifyRowCol("rows", "1");
    expect([dlg.repeatRows, dlg.repeatMaximum]).toEqual([1, 1]);
    dlg.ModifyRepeatHeaderNF_Hdl(0);
    dlg.ModifyRowCol("rows", "6");
    expect(dlg.repeatRows).toBe(1);
    dlg.ModifyRepeatHeaderNF_Hdl(100);
    expect(dlg.repeatRows).toBe(5);
  });
  it.each([
    ["rows", "255", 255, false],
    ["rows", "256", 256, true],
    ["columns", "63", 63, false],
    ["columns", "64", 64, true],
    ["rows", "0", 1, false],
    ["columns", "", 1, false],
    ["rows", "2000001", 2000000, true],
  ] as const)(
    "native dimension %s=%s",
    /** Verifies nonblocking limits and warning. @param field - Dimension. @param value - Entry. @param accepted - Native spin value. @param warning - Warning state. @returns Nothing. */ (
      field,
      value,
      accepted,
      warning,
    ) => {
      const dlg = new SwInsTableDlg("Limits");
      dlg.ModifyRowCol(field, value);
      expect(dlg[field]).toBe(accepted);
      expect(dlg.warning).toBe(warning);
      expect(dlg.IsInsertSensitive()).toBe(true);
      if (accepted === 2000000) expect(dlg.GetValues().rows).toBe(33920);
    },
  );
  it("removes only native forbidden characters and disables existing names", /** Verifies name filtering without trim-based validity rules. @returns Nothing. */ () => {
    const dlg = new SwInsTableDlg("Table1", ["Budget"]);
    dlg.TextFilterHdl("B udg.et<>");
    expect(dlg.name).toBe("Budget");
    expect(dlg.IsInsertSensitive()).toBe(false);
    dlg.TextFilterHdl("Budget_2\t");
    expect(dlg.name).toBe("Budget_2\t");
    expect(dlg.IsInsertSensitive()).toBe(true);
    dlg.TextFilterHdl(" .<>");
    expect(dlg.GetValues().name).toBe("");
    expect(dlg.IsInsertSensitive()).toBe(true);
  });
});

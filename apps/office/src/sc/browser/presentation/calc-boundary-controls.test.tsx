/** @fileoverview Actual Calc metric row workflow, border color application, empty paint windows and relief decoration boundaries. */
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { afterEach, it, expect, vi } from "vitest";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { ScMetricInputDlg } from "./ScMetricInputDlg";
import { ScMetricInputDlg as Metric } from "../../source/ui/miscdlgs/mtrindlg";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { ScCellText } from "./ScCellText";
import { ScPatternAttr } from "../../inc/patattr";
import { SvxCharReliefItem, SvxOverlineItem } from "../../../editeng/source/items/textitem";
import { FontLineStyle } from "../../../tools/inc/fontenum";
import { NamedColor } from "../../../sfx2/inc/namedcolor";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Color } from "../../../tools/inc/color";
import { createCalcGridFrames, calcGridBorderStyle } from "./calc-grid-borders";
import { DispatchBorderItem } from "../../../svx/source/tbxctrls/tbcontrl";
import { SfxRequest } from "../../../sfx2/source/control/request";
import { SfxUInt16Item } from "../../../svl/source/items/intitem";
import type { CommandDispatchResult } from "../../../sfx2/source/control/dispatch";
import { ScInputMode } from "../../inc/global";
afterEach(cleanup);
it("paints no borders for empty windows and assigns internal right/bottom seams once", /** paints no borders for empty windows and assigns internal right/bottom seams once. @returns Observed test result. */ () => {
  const s = createCalcSession();
  try {
    const c = s.controller,
      d = s.frame.GetDispatcher();
    expect(createCalcGridFrames(c.viewData, [], []).rowIndexes.size).toBe(0);
    expect(createCalcGridFrames(c.viewData, [0], []).rowIndexes.size).toBe(0);
    DispatchBorderItem(
      /** Checks the native boundary contract against actual owners. @param u - Actual test input. @param i - Actual test input. @returns Observed test result. */ (
        u,
        i,
      ) => {
        d.Execute(u, i);
      },
      3,
      true,
      0,
    );
    const f = createCalcGridFrames(c.viewData, [0, 1], [0, 1]);
    expect(calcGridBorderStyle(f, 0, 0, true, true).borderRight).not.toBe("none");
    expect(calcGridBorderStyle(f, 0, 0, false, false)).toMatchObject({
      borderRight: "none",
      borderBottom: "none",
    });
  } finally {
    s.Close();
  }
});
it("uses actual relief overline black-to-white rule and leaves colored overlines intact", /** uses actual relief overline black-to-white rule and leaves colored overlines intact. @returns Observed test result. */ () => {
  const s = createCalcSession(),
    p = new ScPatternAttr(s.controller.shell.GetDocument().getCellAttributeHelper());
  try {
    p.ItemSetPut(new SvxCharReliefItem(1, 124));
    const line = new SvxOverlineItem(FontLineStyle.LINESTYLE_SINGLE, 105);
    line.SetColor(new Color(0));
    p.ItemSetPut(line);
    const r = render(<ScCellText pattern={p} text="Relief" />);
    expect(screen.getByText("Relief").style.textDecorationColor).toBe("white");
    line.SetColor(new Color(0xff0000));
    p.ItemSetPut(line);
    r.rerender(<ScCellText pattern={p} text="Relief" />);
    expect(screen.getByText("Relief").style.textDecorationColor).toBe("rgb(255, 0, 0)");
  } finally {
    p.Dispose();
    s.Close();
  }
});
it("renders native row metric labels and submits the actual parsed height", /** renders native row metric labels and submits the actual parsed height. @returns Observed test result. */ () => {
  const model = new Metric("RowHeightDialog", 300, 300, FieldUnit.INCH, 2, 30000, 2);
  let result = 0;
  render(
    <ScMetricInputDlg
      model={model}
      onCancel={
        /** Checks the native boundary contract against actual owners. @returns Observed test result. */ () => {}
      }
      onSubmit={
        /** Checks the native boundary contract against actual owners. @param n - Actual test input. @returns Observed test result. */ (
          n,
        ) => {
          result = n;
        }
      }
    />,
  );
  expect(screen.getByRole("dialog", { name: "Row Height" })).toBeVisible();
  fireEvent.change(screen.getByRole("spinbutton", { name: "Height" }), {
    target: { value: "0.5" },
  });
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(result).toBe(720);
});
it("routes actual typed and dialog row dimensions and declines invalid uncommitted input", /** routes actual typed and dialog row dimensions and declines invalid uncommitted input. @returns Observed test result. */ async () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher();
  try {
    /** Waits for a genuine accepted command result. @param result - Native dispatch. @returns Completion. */
    const complete =
      /** Checks the native boundary contract against actual owners. @param result - Actual test input. @returns Observed test result. */ async (
        result: CommandDispatchResult<unknown>,
      ) => {
        expect(result.status).toBe("executed");
        if (result.status === "executed") await result.value;
      };
    const request = new SfxRequest(26286, [new SfxUInt16Item(26286, 1270)]);
    await complete(d.ExecuteRequest(request));
    expect(c.shell.GetDocument().GetRowHeight(0, 0, false)).toBe(720);
    const pending = d.Execute(".uno:RowHeight");
    const dialog = required(s.sheetWorkflows.metricDialogs.GetSnapshot());
    expect(dialog.request.dialogName).toBe("RowHeightDialog");
    s.sheetWorkflows.metricDialogs.Complete(dialog.id, 600);
    await complete(pending);
    expect(c.shell.GetDocument().GetRowHeight(0, 0, false)).toBe(600);
    const cancelled = d.Execute(".uno:RowHeight");
    s.sheetWorkflows.metricDialogs.Cancel(
      required(s.sheetWorkflows.metricDialogs.GetSnapshot()).id,
    );
    await complete(cancelled);
    c.StartInput(ScInputMode.SC_INPUT_TOP, "=SUM(A1)");
    await complete(d.Execute(".uno:RowHeight"));
    expect(s.sheetWorkflows.metricDialogs.GetSnapshot()).toBeUndefined();
    c.Cancel();
    d.Execute(".uno:HideRow");
    d.Execute(".uno:ShowRow");
    expect(c.shell.GetDocument().RowHidden(0, 0)).toBe(false);
  } finally {
    s.Close();
  }
});
it("applies border recent-color default through shared toolbar without inventing a recent entry", /** applies border recent-color default through shared toolbar without inventing a recent entry. @returns Observed test result. */ () => {
  const s = createCalcSession(),
    c = s.controller;
  try {
    render(
      <CalcWorkbench
        controller={c}
        frame={s.frame}
        fileWorkflows={s.fileWorkflows}
        sheetWorkflows={s.sheetWorkflows}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^Border Color$/ }));
    expect(required(c.viewData.GetViewShell()).GetDefaultFrameLine()?.GetColor().toUInt32()).toBe(
      0x2a6099,
    );
    const missing = vi.spyOn(c.shell, "GetRecentColor").mockReturnValue(undefined);
    try {
      fireEvent.click(screen.getByRole("button", { name: /^Border Color$/ }));
      expect(required(c.viewData.GetViewShell()).GetDefaultFrameLine()?.GetColor().toUInt32()).toBe(
        0x2a6099,
      );
    } finally {
      missing.mockRestore();
    }
    const name = unicode("Authored");
    const recent = new NamedColor(new Color(0x123456), name);
    try {
      c.shell.SetRecentColor(10202, recent);
      fireEvent.click(screen.getByRole("button", { name: /^Border Color$/ }));
      expect(required(c.viewData.GetViewShell()).GetDefaultFrameLine()?.GetColor().toUInt32()).toBe(
        0x123456,
      );
    } finally {
      recent.Dispose();
      name.dispose();
    }
    act(
      /** Checks the native boundary contract against actual owners. @returns Observed test result. */ () => {
        s.frame.GetDispatcher().Execute(".uno:DecrementIndent");
      },
    );
  } finally {
    s.Close();
  }
});

/** Requires an actual test fixture owner and fails at its missing boundary. @param value - Actual fixture value. @returns Present fixture. */
function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("Missing actual fixture owner");
  return value;
}

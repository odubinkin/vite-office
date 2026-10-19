/** @fileoverview Actual native grow/shrink dispatch,script-specific font painting,source limits,history and ODS persistence. */
import { cleanup, render, screen, within, act } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { ScPatternAttr } from "../../inc/patattr";
import { ScAddress } from "../../inc/address";
import { SvxFontHeightItem as Height } from "../../../editeng/inc/fhgtitem";
import { ScFormatShell } from "../../source/ui/view/formatsh";
import { SvtScriptType as Script } from "../../../svl/inc/languageoptions";
import { SfxItemState as State } from "../../../svl/inc/itemset";
import { calcFormatObjectBarItems } from "../../uiconfig/scalc/toolbar/formatobjectbar";
import { readOdsDocument, writeOdsDocument } from "../../source/filter/xml/xmlwrap";
import { ScRange } from "../../inc/address";
import { ScInputMode } from "../../inc/global";
import { SfxRequest } from "../../../sfx2/source/control/request";
afterEach(cleanup);
/** Borrows actual script height. @param session - Actual session. @param which - Script Which. @param col - Column. @returns Item. */
function height(session: ReturnType<typeof createCalcSession>, which = 101, col = 0): Height {
  return (
    session.controller.shell.GetDocument().GetPattern(new ScAddress(col, 0, 0)) as ScPatternAttr
  ).GetItem(which) as Height;
}
/** Sets initialized native pattern values without another formatting model. @param session - Actual session. @param which - Script Which. @param twips - Native height. @param col - Column. @param prop - Relative property. @returns Nothing. */
function seed(
  session: ReturnType<typeof createCalcSession>,
  which: number,
  twips: number,
  col = 0,
  prop = 100,
): void {
  const doc = session.controller.shell.GetDocument(),
    delta = new ScPatternAttr(doc.getCellAttributeHelper());
  delta.ItemSetPut(new Height(twips, prop, which));
  doc.ApplyPatternAreaTab(col, 0, col, 0, 0, delta);
  delta.Dispose();
}

it("paints and queries the actual selected script heights while preserving native hidden toolbar placements", /** Existing shared font controls display the real three-script state rather than Latin-only values. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    d = session.frame.GetDispatcher();
  try {
    c.EnterString("A漢ش");
    seed(session, 101, 200);
    seed(session, 112, 300);
    seed(session, 117, 400);
    render(
      <CalcWorkbench
        controller={c}
        frame={session.frame}
        fileWorkflows={session.fileWorkflows}
        sheetWorkflows={session.sheetWorkflows}
      />,
    );
    const cell = screen.getByRole("gridcell", { name: "A1" });
    expect(within(cell).getByText("A")).toHaveStyle({ fontSize: "10pt" });
    expect(within(cell).getByText("漢")).toHaveStyle({ fontSize: "15pt" });
    expect(within(cell).getByText("ش")).toHaveStyle({ fontSize: "20pt" });
    expect(screen.getByRole("combobox", { name: "Font Size" })).toHaveValue("");
    expect(calcFormatObjectBarItems).not.toContainEqual(
      expect.objectContaining({ commandId: ".uno:Grow" }),
    );
    expect(d.QueryDispatch(".uno:Grow")?.slot.slotId).toBe(11042);
    expect(d.QueryDispatch(".uno:Shrink")?.slot.slotId).toBe(11043);
    expect(d.QueryState(".uno:Grow").enabled).toBe(true);
    expect(d.Execute(".uno:Grow")).toMatchObject({ status: "executed", value: false });
    act(
      /** Runs the actual command within React notification batching. @returns Nothing. */ () => {
        c.EnterString("漢");
      },
    );
    expect(screen.getByRole("combobox", { name: "Font Size" })).toHaveValue("15");
    act(
      /** Runs the actual command within React notification batching. @returns Nothing. */ () => {
        expect(d.Execute(".uno:Grow")).toMatchObject({ status: "executed", value: true });
      },
    );
    expect(height(session, 112).GetHeight()).toBe(340);
    expect(height(session, 101).GetHeight()).toBe(200);
    expect(height(session, 117).GetHeight()).toBe(400);
    expect(screen.getByRole("combobox", { name: "Font Size" })).toHaveValue("17");
    expect(within(cell).getByText("漢")).toHaveStyle({ fontSize: "17pt" });
    act(
      /** Runs the actual command within React notification batching. @returns Nothing. */ () => {
        c.Undo();
      },
    );
    expect(height(session, 112).GetHeight()).toBe(300);
    act(
      /** Runs the actual command within React notification batching. @returns Nothing. */ () => {
        c.Redo();
      },
    );
    expect(height(session, 112).GetHeight()).toBe(340);
    act(
      /** Runs the actual command within React notification batching. @returns Nothing. */ () => {
        d.Execute(".uno:Shrink");
      },
    );
    expect(height(session, 112).GetHeight()).toBe(300);
    expect(d.Execute(".uno:Grow", { ignored: true })).toMatchObject({
      status: "executed",
      value: false,
    });
  } finally {
    session.Close();
  }
});

it("retains native unsigned growth,signed shrink and reset of font-height proportion metadata", /** Literal initialized arithmetic includes counterintuitive native values rather than imposing a browser clamp. @returns Nothing. */ () => {
  const session = createCalcSession(),
    format = new ScFormatShell(session.controller.viewData, session.controller.shell);
  try {
    for (const [initial, grow, expected] of [
      [200, true, 240],
      [200, false, 160],
      [0, false, 40],
      [20, false, 40],
      [19998, true, 19998],
      [22000, true, 19998],
      [0xffffffff, true, 39],
      [0xfffffff0, true, 24],
      [0x80000040, false, 40],
    ] as const) {
      seed(session, 101, initial);
      format.ChangeFontSize(grow, Script.LATIN);
      expect(height(session).GetHeight(), `${initial}/${grow}`).toBe(expected);
    }
    seed(session, 101, 200, 0, 125);
    expect(height(session).GetHeight()).toBe(250);
    expect(format.ChangeFontSize(true, Script.LATIN)).toBe(true);
    expect(height(session).GetHeight()).toBe(290);
    expect(height(session).GetProp()).toBe(100);
  } finally {
    session.Close();
  }
});

it("accepts the complete native FontHeight request and preserves its three-script item metadata", /** Actual Sfx item transport does not flatten the source item to browser points. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    d = session.frame.GetDispatcher();
  try {
    const item = new Height(240, 125, 101);
    expect(d.ExecuteRequest(new SfxRequest(10015, [item]))).toMatchObject({ value: true });
    for (const which of [101, 112, 117])
      expect(height(session, which).QueryValue()).toEqual(item.QueryValue());
    c.Undo();
    expect(height(session).GetHeight()).toBe(200);
    c.Redo();
    expect(height(session).GetProp()).toBe(125);
    expect(
      /** Verifies the native request type boundary. @returns Admission result. */ () =>
        c.SetFontHeight("invalid" as unknown as Height),
    ).toThrow("SvxFontHeightItem");
    c.StartInput(ScInputMode.SC_INPUT_TOP, "=SUM(A1)");
    const count = c.shell.GetUndoManager().GetUndoActionCount();
    expect(c.SetFontHeight(item)).toBe(false);
    expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(count);
  } finally {
    session.Close();
  }
});

it("retains the source reset of mixed unselected script attributes and actual sparse selection history", /** Source pool-cache Put defaults INVALID entries while applying selected-script size. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    d = session.frame.GetDispatcher(),
    doc = c.shell.GetDocument();
  try {
    c.EnterString("a");
    c.Select(1, 0);
    c.EnterString("b");
    for (const col of [0, 1]) seed(session, 101, 240, col);
    seed(session, 112, 300);
    seed(session, 112, 400, 1);
    c.Select(0, 0);
    c.Select(1, 0, true);
    expect(d.Execute(".uno:Grow")).toMatchObject({ status: "executed", value: true });
    for (const col of [0, 1]) {
      expect(height(session, 101, col).GetHeight()).toBe(280);
      expect(
        (doc.GetPattern(new ScAddress(col, 0, 0)) as ScPatternAttr)
          .GetItemSet()
          .GetItemState(112, false),
      ).toBe(State.DEFAULT);
    }
    c.Undo();
    expect(height(session, 112).GetHeight()).toBe(300);
    expect(height(session, 112, 1).GetHeight()).toBe(400);
    c.Redo();
    expect(height(session, 112).GetHeight()).toBe(200);
  } finally {
    session.Close();
  }
});

it("applies only disjoint marked spans and restores them through actual attribute undo and ODS", /** Unselected gaps remain untouched across source-pattern history and package reopening. @returns Completion. */ async () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument(),
    d = session.frame.GetDispatcher();
  try {
    for (const col of [0, 1, 2]) {
      c.Select(col, 0);
      c.EnterString(col === 2 ? "漢" : "text");
      for (const which of [101, 112, 117]) seed(session, which, col === 1 ? 300 : 240, col);
    }
    const marks = c.viewData.GetMarkData();
    marks.ResetMark();
    marks.SelectTable(0, true);
    marks.SetMultiMarkArea(new ScRange(0, 0, 0, 0, 0, 0));
    marks.SetMultiMarkArea(new ScRange(2, 0, 0, 2, 0, 0));
    expect(d.Execute(".uno:Grow")).toMatchObject({ value: true });
    expect(
      [0, 1, 2].map(
        /** Reads an actual marked or untouched column. @param col - Column. @returns Native height. */ (
          col,
        ) => height(session, 101, col).GetHeight(),
      ),
    ).toEqual([280, 300, 280]);
    expect(
      [0, 1, 2].map(
        /** Reads an actual marked or untouched column. @param col - Column. @returns Native height. */ (
          col,
        ) => height(session, 112, col).GetHeight(),
      ),
    ).toEqual([280, 300, 280]);
    expect(
      [0, 1, 2].map(
        /** Reads an actual marked or untouched column. @param col - Column. @returns Native height. */ (
          col,
        ) => height(session, 117, col).GetHeight(),
      ),
    ).toEqual([240, 300, 240]);
    c.Undo();
    expect(
      [0, 1, 2].map(
        /** Reads an actual marked or untouched column. @param col - Column. @returns Native height. */ (
          col,
        ) => height(session, 101, col).GetHeight(),
      ),
    ).toEqual([240, 300, 240]);
    c.Redo();
    expect(
      [0, 1, 2].map(
        /** Reads an actual marked or untouched column. @param col - Column. @returns Native height. */ (
          col,
        ) => height(session, 101, col).GetHeight(),
      ),
    ).toEqual([280, 300, 280]);
    const reopened = await readOdsDocument(writeOdsDocument(doc));
    try {
      expect(
        [0, 1, 2].map(
          /** Reads an actual marked or untouched column. @param col - Column. @returns Native height. */ (
            col,
          ) =>
            (
              (reopened.GetPattern(new ScAddress(col, 0, 0)) as ScPatternAttr).GetItem(
                101,
              ) as Height
            ).GetHeight(),
        ),
      ).toEqual([280, 300, 280]);
    } finally {
      reopened.DisposeAttributes();
    }
    c.Cancel();
    c.StartInput(ScInputMode.SC_INPUT_TOP, "=SUM(A1)");
    const count = c.shell.GetUndoManager().GetUndoActionCount();
    expect(c.ChangeFontSize(true)).toBe(false);
    expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(count);
  } finally {
    session.Close();
  }
});

it("queries whole-sheet fonts within real data bounds while retaining source mark guards", /** View queries clip their own marks; formatting still targets the original selection. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument(),
    marks = c.viewData.GetMarkData();
  const full = new ScRange(0, 0, 0, doc.MaxCol(), doc.MaxRow(), 0);
  try {
    marks.SetMarkArea(full);
    expect(c.GetFontSize()).toBe(10);
    c.EnterString("A");
    seed(session, 101, 280);
    marks.SetMarkArea(full);
    expect(c.GetFontSize()).toBe(14);
    expect(marks.GetMarkArea().aEnd.Col()).toBe(doc.MaxCol());
    for (const range of [
      new ScRange(1, 0, 0, doc.MaxCol(), doc.MaxRow(), 0),
      new ScRange(0, 1, 0, doc.MaxCol(), doc.MaxRow(), 0),
      new ScRange(0, 0, 0, 2, doc.MaxRow(), 0),
      new ScRange(0, 0, 0, doc.MaxCol(), 2, 0),
      new ScRange(0, 0, 0, doc.MaxCol(), doc.MaxRow(), 1),
    ]) {
      marks.ResetMark();
      marks.SetMarkArea(range);
      expect(c.GetFontSize()).not.toBe(14);
    }
    marks.ResetMark();
    marks.SetMarkArea(full);
    marks.SetMultiMarkArea(new ScRange(0, 1, 0, 0, 1, 0));
    marks.SetMarkArea(full);
    expect(c.GetFontSize()).not.toBe(14);
  } finally {
    session.Close();
  }
});

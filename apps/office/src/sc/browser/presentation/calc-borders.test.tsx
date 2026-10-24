/** @fileoverview Actual shared Writer/SVX border controls exercise native presets,default frame-line state,style/color ordering and real attribute history. */
import { render, screen, fireEvent, act } from "@testing-library/react";
import { expect, it } from "vitest";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { ScAddress, ScRange } from "../../inc/address";
import { ScPatternAttr } from "../../inc/patattr";
import { SvxBoxItem } from "../../../editeng/source/items/frmitems";
import { SvxLineItem } from "../../../editeng/inc/lineitem";
import {
  SvxBorderLine,
  SvxBorderLineStyle as Style,
} from "../../../editeng/source/items/borderline";
import { SvxColorItem } from "../../../editeng/inc/colritem";
import { Color } from "../../../tools/inc/color";
import { DispatchBorderItem } from "../../../svx/source/tbxctrls/tbcontrl";
import { getCalcCommandResource } from "../../uiconfig/scalc/menubar/menubar";
/** Reads actual native cell frame. @param session - Real session. @param col - Column. @param row - Row. @returns Actual box. */
function box(session: ReturnType<typeof createCalcSession>, col = 0, row = 0): SvxBoxItem {
  return (
    session.controller.shell.GetDocument().GetPattern(new ScAddress(col, row, 0)) as ScPatternAttr
  ).GetItem(150) as SvxBoxItem;
}
it("uses the shared toolbar preset control with original twelve entries and real native 0.75pt frame/diagonal values", /** Actual production widgets and dispatcher. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher();
  let surface: ReturnType<typeof render> | undefined;
  try {
    surface = render(
      <CalcWorkbench
        controller={c}
        frame={s.frame}
        fileWorkflows={s.fileWorkflows}
        sheetWorkflows={s.sheetWorkflows}
      />,
    );
    const label = getCalcCommandResource(".uno:SetBorderStyle").label;
    const button = screen.getByRole("button", { name: label });
    expect(button).toBeEnabled();
    expect(button).toHaveClass("size-8", "rounded-md", "bg-white");
    fireEvent.click(button);
    fireEvent.click(screen.getByRole("button", { name: "Outer Border" }));
    expect(box(s).GetTop()?.GetWidth()).toBe(15);
    expect(box(s).GetLeft()?.GetWidth()).toBe(15);
    expect(screen.getByRole("gridcell", { name: "A1" })).toHaveStyle({
      borderTopWidth: "0.75pt",
      borderLeftWidth: "0.75pt",
    });
    act(
      /** Moves actual cursor without making a fake cell selection. @returns Nothing. */ () =>
        c.Select(2, 2),
    );
    fireEvent.click(button);
    expect(box(s, 2, 2).GetBottom()?.GetWidth()).toBe(15);
    fireEvent.click(screen.getByText("▾", { selector: `summary[aria-label="${label} presets"]` }));
    fireEvent.click(screen.getByRole("button", { name: "Criss-Cross Border" }));
    expect(document.querySelectorAll("[data-calc-diagonal]")).toHaveLength(2);
    for (const which of [141, 142])
      expect(
        (
          (c.shell.GetDocument().GetPattern(new ScAddress(2, 2, 0)) as ScPatternAttr).GetItem(
            which,
          ) as SvxLineItem
        )
          .GetLine()
          ?.GetWidth(),
      ).toBe(1);
    const before = c.shell.GetUndoManager().GetUndoActionCount();
    DispatchBorderItem(
      /** Forwards genuine source item arguments. @param command - URL. @param items - Real items. @returns Nothing. */ (
        command,
        items,
      ) => {
        d.Execute(command, items);
      },
      1,
      true,
      0,
    );
    expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(before + 3);
    expect(box(s, 2, 2).GetTop()).toBeUndefined();
  } finally {
    surface?.unmount();
    s.Close();
  }
});
it("preserves source style/color defaults,style mixed by color,and complete native request values", /** Source command state and genuine Undo/Redo. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher();
  try {
    expect(d.QueryState(".uno:LineStyle").enabled).toBe(false);
    DispatchBorderItem(
      /** Sends native preset. @param url - Command. @param items - Items. @returns Nothing. */ (
        url,
        items,
      ) => {
        d.Execute(url, items);
      },
      2,
      true,
      0,
    );
    const unchanged = c.shell.GetUndoManager().GetUndoActionCount();
    expect(d.Execute(".uno:LineStyle")).toMatchObject({ value: false });
    expect(box(s).GetTop()?.GetWidth()).toBe(15);
    expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(unchanged);
    const item = new SvxLineItem(10201);
    item.SetLine(new SvxBorderLine(new Color(0xaa0000), 45, Style.DASHED));
    expect(d.Execute(".uno:LineStyle", { LineStyle: item }).status).toBe("executed");
    expect(box(s).GetTop()?.GetWidth()).toBe(45);
    expect(box(s).GetTop()?.GetBorderLineStyle()).toBe(Style.DASHED);
    expect(box(s).GetTop()?.GetColor().toUInt32()).toBe(0);
    d.Execute(".uno:FrameLineColor", { color: new SvxColorItem(new Color(0x228844), 10202) });
    expect(box(s).GetLeft()?.GetColor().toUInt32()).toBe(0x228844);
    expect(box(s).GetLeft()?.GetWidth()).toBe(45);
    c.Undo();
    expect(box(s).GetLeft()?.GetColor().toUInt32()).toBe(0);
    c.Redo();
    expect(box(s).GetLeft()?.GetColor().toUInt32()).toBe(0x228844);
    c.Select(2, 0);
    DispatchBorderItem(
      /** Sends native preset on actual second cell. @param url - Command. @param items - Items. @returns Nothing. */ (
        url,
        items,
      ) => {
        d.Execute(url, items);
      },
      2,
      true,
      0,
    );
    expect(box(s, 2, 0).GetTop()?.GetWidth()).toBe(15);
    expect(box(s, 2, 0).GetTop()?.GetColor().toUInt32()).toBe(0);
    const diagonal = new SvxLineItem(141);
    diagonal.SetLine(new SvxBorderLine(null, 30));
    d.Execute(".uno:BorderTLBR", { BorderTLBR: diagonal });
    d.Execute(".uno:LineStyle", { LineStyle: new SvxLineItem(10201) });
    const cleared = d.QueryState(".uno:BorderTLBR").value as SvxLineItem;
    expect(cleared.GetLine()).not.toBeNull();
    expect(cleared.GetLine()?.isEmpty()).toBe(true);
    expect(box(s, 2, 0).GetTop()).toBeUndefined();
  } finally {
    s.Close();
  }
});
it("keeps unset edges by default,resets them with Shift,and preserves source mixed-style no-history branch", /** Native validity and selection paths. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher(),
    dispatch =
      /** Forwards genuine typed preset requests. @param url - Source URL. @param items - Actual items. @returns Nothing. */ (
        url: string,
        items: readonly import("../../../svl/inc/poolitem").SfxPoolItem[],
      ) => {
        d.Execute(url, items);
      };
  try {
    DispatchBorderItem(dispatch, 2, true, 0);
    DispatchBorderItem(dispatch, 5, true, 0);
    expect(box(s).GetRight()?.GetWidth()).toBe(15);
    DispatchBorderItem(dispatch, 5, true, 0x1000);
    expect(box(s).GetRight()).toBeUndefined();
    expect(box(s).GetLeft()?.GetWidth()).toBe(15);
    c.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 1, 1, 0));
    DispatchBorderItem(dispatch, 2, true, 0);
    const count = c.shell.GetUndoManager().GetUndoActionCount(),
      style = new SvxLineItem(10201);
    style.SetLine(new SvxBorderLine(null, 40, Style.DOTTED));
    d.Execute(".uno:LineStyle", { LineStyle: style });
    expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(count);
    expect(box(s).GetTop()?.GetWidth()).toBe(40);
    expect(box(s, 1, 1).GetBottom()?.GetBorderLineStyle()).toBe(Style.DOTTED);
  } finally {
    s.Close();
  }
});

it("records zero-width replacement and original request completion separately for API border and line-style calls", /** Original ExecuteAttr completion and native recording items. @returns Nothing. */ async () => {
  const { SfxRequest } = await import("../../../sfx2/source/control/request"),
    { SfxCallMode } = await import("../../../sfx2/source/control/bindings"),
    { SvxBoxInfoItem, SvxBoxItemLine } = await import("../../../editeng/source/items/frmitems"),
    s = createCalcSession(),
    c = s.controller;
  try {
    const outer = new SvxBoxItem(150),
      inner = new SvxBoxInfoItem(151);
    outer.SetLine(new SvxBorderLine(), SvxBoxItemLine.TOP);
    const request = new SfxRequest(10188, [outer, inner]);
    expect(c.ExecuteBorder(request)).toBe(true);
    expect(request.IsDone()).toBe(true);
    expect(box(s).GetTop()?.GetWidth()).toBe(20);
    expect(
      (
        request
          .GetArgs()
          .find(
            /** Locates actual recorded outer item. @param item - Native item. @returns Match. */ (
              item,
            ) => item.Which() === 150,
          ) as SvxBoxItem
      )
        .GetTop()
        ?.GetWidth(),
    ).toBe(20);
    const api = new SfxRequest(10188, [outer, inner], SfxCallMode.API);
    c.ExecuteBorder(api);
    expect(api.IsDone()).toBe(false);
    const item = new SvxLineItem(10201);
    item.SetLine(new SvxBorderLine(null, 25, Style.DOTTED));
    const style = new SfxRequest(10201, [item], SfxCallMode.API);
    c.ExecuteBorder(style);
    expect(style.IsDone()).toBe(true);
    expect(box(s).GetTop()?.GetWidth()).toBe(25);
  } finally {
    s.Close();
  }
});

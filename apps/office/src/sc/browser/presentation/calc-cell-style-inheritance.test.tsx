/** @fileoverview Actual Calc column/pattern style inheritance projected by the existing shared Writer UI;StyleApply and Calc style-pool construction remain separate unported paths. */
import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { ScAddress } from "../../inc/address";
import { ScPatternAttr, CellAttributeHolder } from "../../inc/patattr";
import {
  SfxStyleSheetPool,
  SfxStyleSheet,
  SfxStyleFamily,
  SfxStyleSearchBits,
} from "../../../svl/inc/style";
import { SvxFontItem } from "../../../editeng/inc/fontitem";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
it("projects inherited native three-script fonts from the real registered column pattern and detaches to an owned name on style deletion", /** Changes only real native owners;no browser style store is introduced. @returns Nothing. */ () => {
  const session = createCalcSession(),
    doc = session.controller.shell.GetDocument(),
    helper = doc.getCellAttributeHelper(),
    pool = new SfxStyleSheetPool(doc.GetPool()),
    name = unicode("Native inheritance"),
    value = unicode("Latin漢عربي"),
    position = new ScAddress(0, 0, 0),
    pattern = new ScPatternAttr(helper);
  let holder: CellAttributeHolder | undefined, painted: ReturnType<typeof render> | undefined;
  try {
    const style = pool.Make(
      name,
      SfxStyleFamily.Para,
      SfxStyleSearchBits.UserDefined,
    ) as SfxStyleSheet;
    for (const [which, family] of [
      [100, "Latin Face"],
      [111, "Asian Face"],
      [116, "Complex Face"],
    ] as const)
      style.GetItemSet().Put(new SvxFontItem(0, family, "", 0, 0, which));
    doc.SetTextCell(position, value);
    pattern.SetStyleSheet(style);
    holder = new CellAttributeHolder(pattern);
    required(doc.FetchTable(0)).GetColumnData(0).SetPatternArea(0, 0, holder);
    const registered = required(doc.GetPattern(position));
    expect(registered.GetStyleSheet()).toBe(style);
    expect(registered.GetItemSet().GetItemIfSet(100, false)).toBeUndefined();
    painted = render(
      <CalcWorkbench
        controller={session.controller}
        frame={session.frame}
        fileWorkflows={session.fileWorkflows}
        sheetWorkflows={session.sheetWorkflows}
      />,
    );
    expect(screen.getByText("Latin")).toHaveStyle({ fontFamily: "Latin Face" });
    expect(screen.getByText("漢")).toHaveStyle({ fontFamily: "Asian Face" });
    expect(screen.getByText("عربي")).toHaveStyle({ fontFamily: "Complex Face" });
    helper.CellStyleDeleted(style);
    expect(required(doc.GetPattern(position)).GetStyleSheet()).toBeNull();
    expect(text(required(required(doc.GetPattern(position)).GetStyleName()))).toBe(
      "Native inheritance",
    );
    expect(required(doc.GetPattern(position)).GetItemSet().GetParent()).toBeUndefined();
    // Explicit test projection refresh does not claim the missing native repaint/style-command owner.
    painted.rerender(
      <CalcWorkbench
        controller={session.controller}
        frame={session.frame}
        fileWorkflows={session.fileWorkflows}
        sheetWorkflows={session.sheetWorkflows}
      />,
    );
    expect(screen.getByText("Latin")).not.toHaveStyle({ fontFamily: "Latin Face" });
  } finally {
    painted?.unmount();
    holder?.Dispose();
    pattern.Dispose();
    helper.AllStylesToNames();
    pool.Dispose();
    name.dispose();
    value.dispose();
    session.Close();
  }
});

/** Requires a real native owner or value before observing its contract. @param value - Actual source result. @returns Present value. */
function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw Error("Missing native source value");
  return value;
}

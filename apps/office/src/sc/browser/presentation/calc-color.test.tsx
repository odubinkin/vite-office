/** @fileoverview Real shared color palette, Calc native item state, browser painting and attribute history. */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { ScAddress } from "../../inc/address";
import { SvxColorItem } from "../../../editeng/inc/colritem";
import { SvxBrushItem } from "../../../editeng/inc/brushitem";
import { Color, COL_AUTO } from "../../../tools/inc/color";
import { FontPitch } from "../../../tools/inc/fontenum";
import { SvxFontItem } from "../../../editeng/inc/fontitem";
import { ScInputMode } from "../../inc/global";
import { ScPatternAttr } from "../../inc/patattr";
import { ComplexColor } from "../../../docmodel/inc/color/ComplexColor";
import { ThemeColorType } from "../../../docmodel/inc/theme/ThemeColorType";
import { NamedColor } from "../../../sfx2/inc/namedcolor";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { MID_SHADING_VALUE, MID_GRAPHIC_TRANSPARENCY } from "../../../editeng/inc/memberids";

it("uses the actual shared palette and native recent colors for cell painting and history", /** Exercises visible suite controls over the genuine document. @returns Completion. */ async () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument();
  try {
    render(
      <CalcWorkbench
        controller={c}
        frame={session.frame}
        fileWorkflows={session.fileWorkflows}
        sheetWorkflows={session.sheetWorkflows}
      />,
    );
    const a1 = screen.getByRole("gridcell", { name: "A1" });
    fireEvent.click(screen.getByRole("button", { name: "Font Color" }));
    expect(
      (doc.GetPattern(new ScAddress())?.GetItem(109) as SvxColorItem).GetValue().toUInt32(),
    ).toBe(0xc9211e);
    expect(a1).toHaveStyle({ color: "#c9211e" });
    fireEvent.click(screen.getByLabelText("Font Color palette", { exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Font Color #ff0000" }));
    expect(a1).toHaveStyle({ color: "#ff0000" });
    fireEvent.click(screen.getByRole("button", { name: "Background Color" }));
    expect(a1).toHaveStyle({ backgroundColor: "#ffff00" });
    expect(
      (doc.GetPattern(new ScAddress())?.GetItem(148) as SvxBrushItem).GetColor().toUInt32(),
    ).toBe(0xffff00);
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(
      (doc.GetPattern(new ScAddress())?.GetItem(148) as SvxBrushItem).GetColor().GetAlpha(),
    ).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(a1).toHaveStyle({ backgroundColor: "#ffff00" });
    act(
      /** Creates a mixed range through the actual view. @returns Nothing. */ () => {
        c.Select(1, 1, true);
      },
    );
    expect(c.GetColor("font")).toBeUndefined();
    fireEvent.click(screen.getByRole("button", { name: "Font Color" }));
    expect(c.GetColor("font")?.GetValue().toUInt32()).toBe(0xff0000);
    fireEvent.click(screen.getByLabelText("Font Color palette", { exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Automatic" }));
    expect(c.GetColor("font")?.GetValue().equals(COL_AUTO)).toBe(true);
    expect(a1).toHaveStyle({ color: "#000000" });
    act(
      /** Applies a real dark background to the current automatic-font selection. @returns Nothing. */ () => {
        c.SetColor("background", new SvxColorItem(new Color(0), 10186));
      },
    );
    expect(a1).toHaveStyle({ color: "#ffffff" });
    act(
      /** Restores the original light background through attribute history. @returns Nothing. */ () => {
        c.Undo();
      },
    );
    expect(a1).toHaveStyle({ color: "#000000" });
    const recent = c.shell.GetRecentColor(10017);
    expect(recent?.m_aColor.equals(COL_AUTO)).toBe(true);
    recent?.Dispose();
  } finally {
    session.Close();
  }
});

it("preserves full brush metadata and the source distinction between argument and recent-color paths", /** Uses genuine brush members and actual attribute undo documents. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument(),
    pattern = new ScPatternAttr(doc.getCellAttributeHelper()),
    brush = new SvxBrushItem(new Color(0x223344), 148),
    value = new Any([37], "sal_Int32"),
    name = unicode("Recent"),
    recent = new NamedColor(new Color(0x8899aa), name);
  try {
    brush.PutValue(value, MID_SHADING_VALUE);
    value.insert([17], "sal_Int32");
    brush.PutValue(value, MID_GRAPHIC_TRANSPARENCY);
    pattern.ItemSetPut(brush);
    doc.ApplyPatternAreaTab(0, 0, 0, 0, 0, pattern);
    const complex = new ComplexColor();
    complex.setThemeColor(ThemeColorType.Accent3);
    complex.setFinalColor(new Color(0x667788));
    expect(c.SetColor("background", new SvxColorItem(new Color(0x667788), complex, 10186))).toBe(
      true,
    );
    let current = doc.GetPattern(new ScAddress())?.GetItem(148) as SvxBrushItem;
    current.QueryValue(value, MID_SHADING_VALUE);
    const output: [number] = [0];
    value.extract(output, "sal_Int32");
    expect(output[0]).toBe(37);
    current.QueryValue(value, MID_GRAPHIC_TRANSPARENCY);
    value.extract(output, "sal_Int32");
    expect(output[0]).toBe(17);
    expect(current.getComplexColor().getThemeColorType()).toBe(ThemeColorType.Accent3);
    expect(c.GetColor("background")?.getComplexColor().getThemeColorType()).toBe(
      ThemeColorType.Unknown,
    );
    recent.m_nThemeIndex = ThemeColorType.Accent5;
    c.shell.SetRecentColor(10186, recent, false);
    expect(c.SetColor("background")).toBe(true);
    current = doc.GetPattern(new ScAddress())?.GetItem(148) as SvxBrushItem;
    expect(current.GetColor().toUInt32()).toBe(0x8899aa);
    expect(current.getComplexColor().getThemeColorType()).toBe(ThemeColorType.Accent3);
    c.Undo();
    current = doc.GetPattern(new ScAddress())?.GetItem(148) as SvxBrushItem;
    expect(current.GetColor().toUInt32()).toBe(0x667788);
    expect(current.getComplexColor().getThemeColorType()).toBe(ThemeColorType.Accent3);
  } finally {
    pattern.Dispose();
    value.dispose();
    recent.Dispose();
    name.dispose();
    session.Close();
  }
});

it("retains native missing-recent defaults,failed input admission and grouped full-axis color selections", /** Exercises real dispatch and sparse marks without presentation state. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument(),
    dispatcher = session.frame.GetDispatcher();
  try {
    // An explicit default item changes direct-item state even when its effective color is unchanged.
    expect(c.SetColor("font")).toBe(true);
    expect(c.GetColor("font")?.GetValue().equals(COL_AUTO)).toBe(true);
    expect(c.SetColor("font")).toBe(false);
    c.StartInput(ScInputMode.SC_INPUT_TOP, "=SUM(A1)");
    expect(c.SetColor("background", new SvxColorItem(new Color(0x123456), 10186))).toBe(false);
    c.Cancel();
    for (const args of [null, {}, { color: "red" }])
      expect(
        /** Rejects malformed structured arguments. @returns Never. */ () =>
          dispatcher.Execute(".uno:Color", args),
      ).toThrow("SvxColorItem");
    c.InsertSheet();
    c.SelectAllTables();
    c.Select(0, 0);
    c.MarkRows();
    expect(c.SetColor("background", new SvxColorItem(new Color(0x445566), 10186))).toBe(true);
    for (const tab of [0, 1])
      expect(
        (doc.GetPattern(new ScAddress(doc.MaxCol(), 0, tab))?.GetItem(148) as SvxBrushItem)
          .GetColor()
          .toUInt32(),
      ).toBe(0x445566);
    c.Select(2, 0);
    c.MarkColumns();
    expect(c.SetColor("font", new SvxColorItem(new Color(0x778899), 10017))).toBe(true);
    expect(
      (doc.GetPattern(new ScAddress(2, doc.MaxRow(), 0))?.GetItem(109) as SvxColorItem)
        .GetValue()
        .toUInt32(),
    ).toBe(0x778899);
    c.Undo();
    expect(
      (doc.GetPattern(new ScAddress(2, doc.MaxRow(), 0))?.GetItem(109) as SvxColorItem)
        .GetValue()
        .equals(COL_AUTO),
    ).toBe(true);
    c.Redo();
    expect(c.GetColor("font")?.GetValue().toUInt32()).toBe(0x778899);
  } finally {
    session.Close();
  }
});

it("applies full native colors without changing independent font attributes and restores actual snapshots", /** Checks item/history ownership and no-op behavior. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument();
  try {
    const font = new SvxFontItem(0, "Retained", "Book", FontPitch.PITCH_FIXED, 10, 10007);
    c.SetFontFamily(font);
    const color = new SvxColorItem(new Color(0x102030), 10017);
    expect(c.SetColor("font", color)).toBe(true);
    expect(c.SetColor("font", color)).toBe(false);
    expect((doc.GetPattern(new ScAddress())?.GetItem(100) as SvxFontItem).GetStyleName()).toBe(
      "Book",
    );
    expect(c.GetColor("font")?.GetValue().toUInt32()).toBe(0x102030);
    c.Undo();
    expect(c.GetColor("font")?.GetValue().toUInt32()).toBe(0x102030);
    c.Undo();
    expect(c.GetColor("font")?.GetValue().equals(COL_AUTO)).toBe(true);
    c.Redo();
    expect(c.GetColor("font")?.GetValue().toUInt32()).toBe(0x102030);
    c.Redo();
    expect(c.GetColor("font")?.GetValue().toUInt32()).toBe(0x102030);
    expect(
      /** Rejects malformed host input before document mutation. @returns Never. */ () =>
        c.SetColor("font", "red" as unknown as SvxColorItem),
    ).toThrow("SvxColorItem");
  } finally {
    session.Close();
  }
});

/** @fileoverview Actual shared Writer character controls over native Calc selected attributes and history. */
import { createCalcInterface } from "../../sdi/scalc";
import { SfxRequest } from "../../../sfx2/source/control/request";
import { SfxUnoAnyItem } from "../../../sfx2/source/view/frame";
import { ScInputMode } from "../../inc/global";
import { assert, expect, it } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { ScAddress } from "../../inc/address";
import { Color } from "../../../tools/inc/color";
import { ScPatternAttr } from "../../inc/patattr";
import {
  SvxWeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
} from "../../../editeng/source/items/textitem";
import { FontWeight, FontItalic, FontLineStyle } from "../../../tools/inc/fontenum";

it("uses the shared native three-script weight set when Latin and complex are bold but Asian is normal", /** Source compares all scripts before deciding whether the no-argument command should turn bold off. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    d = session.frame.GetDispatcher(),
    doc = c.shell.GetDocument(),
    delta = new ScPatternAttr(doc.getCellAttributeHelper());
  try {
    for (const which of [102, 118])
      delta.ItemSetPut(new SvxWeightItem(FontWeight.WEIGHT_BOLD, which));
    doc.ApplyPatternAreaTab(0, 0, 0, 0, 0, delta);
    expect(c.GetCharacterState("bold")).toBe(true);
    expect(d.Execute(".uno:Bold")).toMatchObject({ value: true });
    for (const which of [102, 113, 118])
      expect(
        (
          (doc.GetPattern(new ScAddress()) as ScPatternAttr).GetItem(which) as SvxWeightItem
        ).GetWeight(),
      ).toBe(FontWeight.WEIGHT_BOLD);
    c.Undo();
    expect(
      (
        (doc.GetPattern(new ScAddress()) as ScPatternAttr).GetItem(113) as SvxWeightItem
      ).GetWeight(),
    ).toBe(FontWeight.WEIGHT_NORMAL);
  } finally {
    delta.Dispose();
    session.Close();
  }
});
it("uses the shared controls with real three-script attributes,mixed ranges and undo", /** No substitute formatting model participates. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument();
  render(
    <CalcWorkbench
      controller={c}
      frame={session.frame}
      fileWorkflows={session.fileWorkflows}
      sheetWorkflows={session.sheetWorkflows}
    />,
  );
  const bold = screen.getByRole("button", { name: "Bold" });
  expect(bold).toBeEnabled();
  expect(bold).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(bold);
  const pattern = doc.GetPattern(new ScAddress()) as ScPatternAttr;
  for (const which of [102, 113, 118])
    expect((pattern.GetItem(which) as SvxWeightItem).GetWeight()).toBe(FontWeight.WEIGHT_BOLD);
  expect(screen.getByRole("gridcell", { name: "A1" })).toHaveStyle({
    fontWeight: 700,
  });
  fireEvent.keyDown(screen.getByRole("grid"), { key: "b", ctrlKey: true });
  expect(c.GetCharacterState("bold")).toBe(false);
  fireEvent.keyDown(screen.getByRole("grid"), { key: "b", metaKey: true });
  expect(c.GetCharacterState("bold")).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Italic" }));
  for (const which of [103, 114, 119])
    expect(
      (
        (doc.GetPattern(new ScAddress()) as ScPatternAttr).GetItem(which) as SvxPostureItem
      ).GetPosture(),
    ).toBe(FontItalic.ITALIC_NORMAL);
  fireEvent.click(screen.getByRole("button", { name: "Underline" }));
  expect(
    (
      (doc.GetPattern(new ScAddress()) as ScPatternAttr).GetItem(104) as SvxUnderlineItem
    ).GetLineStyle(),
  ).toBe(FontLineStyle.LINESTYLE_SINGLE);
  expect(screen.getByRole("gridcell", { name: "A1" })).toHaveStyle({
    fontStyle: "italic",
    textDecorationLine: "underline",
  });
  fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  expect(c.GetCharacterState("underline")).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: "Redo" }));
  expect(c.GetCharacterState("underline")).toBe(true);
  act(
    /** Changes the actual marked range. @returns Nothing. */ () => {
      c.Select(1, 0, true);
    },
  );
  expect(c.GetCharacterState("bold")).toBeUndefined();
  fireEvent.click(bold);
  expect(c.GetCharacterState("bold")).toBe(true);
  fireEvent.click(bold);
  expect(c.GetCharacterState("bold")).toBe(false);
  session.Close();
});
it("persists independent script values,explicit defaults and retained underline color through actual ODS", /** Uses the live document and genuine package reader. @returns Completion. */ async () => {
  const { writeOdsDocument, readOdsDocument } = await import("../../source/filter/xml/xmlwrap"),
    { ScPatternAttr } = await import("../../inc/patattr"),
    { Color } = await import("../../../tools/inc/color"),
    { SfxItemState } = await import("../../../svl/source/items/itemset");
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument();
  c.EnterString("Styled cells");
  c.SetCharacterFormat("bold");
  c.SetCharacterFormat("italic");
  c.SetCharacterFormat("underline");
  const delta = new ScPatternAttr(doc.getCellAttributeHelper()),
    line = new SvxUnderlineItem(FontLineStyle.LINESTYLE_SINGLE, 104);
  line.SetColor(new Color(0x112233));
  delta.ItemSetPut(line);
  delta.ItemSetPut(new SvxWeightItem(FontWeight.WEIGHT_NORMAL, 113));
  doc.ApplyPatternAreaTab(0, 0, 0, 0, 0, delta);
  delta.Dispose();
  c.SetCharacterFormat("underline");
  const loaded = await readOdsDocument(writeOdsDocument(doc)),
    p = loaded.GetPattern(new ScAddress()) as ScPatternAttr;
  expect((p.GetItem(102) as SvxWeightItem).GetWeight()).toBe(FontWeight.WEIGHT_BOLD);
  expect((p.GetItem(113) as SvxWeightItem).GetWeight()).toBe(FontWeight.WEIGHT_NORMAL);
  expect((p.GetItem(118) as SvxWeightItem).GetWeight()).toBe(FontWeight.WEIGHT_BOLD);
  for (const which of [103, 114, 119])
    expect((p.GetItem(which) as SvxPostureItem).GetPosture()).toBe(FontItalic.ITALIC_NORMAL);
  const underline = p.GetItem(104) as SvxUnderlineItem;
  expect(underline.GetLineStyle()).toBe(FontLineStyle.LINESTYLE_NONE);
  expect(underline.GetColor().GetRed()).toBe(17);
  expect(underline.GetColor().GetGreen()).toBe(34);
  expect(underline.GetColor().GetBlue()).toBe(51);
  expect(p.GetItemSet().GetItemState(101, false)).toBe(SfxItemState.DEFAULT);
  loaded.DisposeAttributes();
  session.Close();
});

it("uses original fresh-item underline variants from the shared Format menu", /** Exercises actual menu bindings, native item color and history. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher();
  const delta = new ScPatternAttr(c.shell.GetDocument().getCellAttributeHelper()),
    line = new SvxUnderlineItem(FontLineStyle.LINESTYLE_SINGLE, 104);
  line.SetColor(new Color(0x112233));
  delta.ItemSetPut(line);
  c.shell.GetDocument().ApplyPatternAreaTab(0, 0, 0, 0, 0, delta);
  delta.Dispose();
  render(
    <CalcWorkbench
      controller={c}
      frame={s.frame}
      fileWorkflows={s.fileWorkflows}
      sheetWorkflows={s.sheetWorkflows}
    />,
  );
  expect(screen.getByRole("gridcell", { name: "A1" })).toHaveStyle({
    textDecorationColor: "rgb(17, 34, 51)",
  });
  expect(d.QueryDispatch(".uno:UnderlineSingle")?.slot.slotId).toBe(11196);
  expect(d.QueryDispatch(".uno:UnderlineDouble")?.slot.slotId).toBe(11197);
  fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Text" }));
  fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Double Underline" }));
  expect(c.GetUnderlineStyle()).toBe(FontLineStyle.LINESTYLE_DOUBLE);
  expect(screen.getByRole("button", { name: "Underline" })).toHaveAttribute("aria-pressed", "true");
  expect(
    (
      (c.shell.GetDocument().GetPattern(new ScAddress()) as ScPatternAttr).GetItem(
        104,
      ) as SvxUnderlineItem
    )
      .GetColor()
      .GetAlpha(),
  ).toBe(0);
  expect(screen.getByRole("gridcell", { name: "A1" })).toHaveStyle({
    textDecorationStyle: "double",
  });
  expect(d.QueryState(".uno:UnderlineDouble").checked).toBe(true);
  act(
    /** Toggles matching exact style off. @returns Nothing. */ () => {
      d.Execute(".uno:UnderlineDouble");
    },
  );
  expect(c.GetUnderlineStyle()).toBe(FontLineStyle.LINESTYLE_NONE);
  act(
    /** Restores actual line item. @returns Nothing. */ () => {
      c.Undo();
    },
  );
  expect(c.GetUnderlineStyle()).toBe(FontLineStyle.LINESTYLE_DOUBLE);
  act(
    /** Queries a genuine mixed range. @returns Nothing. */ () => {
      c.Select(1, 0, true);
    },
  );
  expect(d.QueryState(".uno:UnderlineSingle")).toMatchObject({ checked: false, mixed: true });
  act(
    /** Applies source default fallback for mixed selection. @returns Nothing. */ () => {
      d.Execute(".uno:UnderlineSingle");
    },
  );
  expect(c.GetUnderlineStyle()).toBe(FontLineStyle.LINESTYLE_SINGLE);
  s.Close();
});
it("validates explicit host arguments and commits input before native character operations", /** Covers real accepted values, no-op history and rejected formula drafts. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher();
  for (const command of [".uno:Bold", ".uno:Italic", ".uno:Underline"]) {
    const slot = d.QueryDispatch(command);
    assert(slot);
    const slotId = slot.slot.slotId;
    for (const args of [null, {}, { enabled: "yes" }, 1])
      expect(
        /** Rejects malformed request before mutating input. @returns Never. */ () =>
          d.ExecuteRequest(new SfxRequest(slotId, [new SfxUnoAnyItem(slotId, args)])),
      ).toThrow(/boolean enabled/);
    expect(d.Execute(command, { enabled: true })).toMatchObject({ value: true });
    const count = c.shell.GetUndoManager().GetUndoActionCount();
    // Native attribute operations report admitted success even when an equal delta is recorded.
    expect(d.Execute(command, { enabled: true })).toMatchObject({ value: true });
    expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(count + 1);
    expect(d.Execute(command, { enabled: false })).toMatchObject({ value: true });
  }
  c.SetCharacterFormat("italic");
  c.SetCharacterFormat("italic");
  expect(c.GetCharacterState("italic")).toBe(false);
  c.Select(1, 0);
  c.SetCharacterFormat("underline");
  c.Select(0, 0, true);
  expect(c.GetCharacterState("underline")).toBeUndefined();
  expect(c.SetCharacterFormat("underline")).toBe(true);
  c.StartInput(ScInputMode.SC_INPUT_TOP, "=SUM(A1)");
  const count = c.shell.GetUndoManager().GetUndoActionCount();
  expect(c.SetCharacterFormat("bold")).toBe(false);
  expect(c.SetUnderlineStyle(FontLineStyle.LINESTYLE_DOUBLE)).toBe(false);
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(count);
  c.Cancel();
  s.Close();
});

it("formats full axes and grouped sheets with native attribute-only undo", /** Exercises native marks without materializing cells or changing other sheets. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    doc = c.shell.GetDocument();
  c.InsertSheet();
  c.SelectAllTables();
  c.MarkColumns();
  expect(c.SetCharacterFormat("bold")).toBe(true);
  for (const tab of [0, 1]) {
    const p = doc.GetPattern(new ScAddress(0, doc.MaxRow(), tab)) as ScPatternAttr;
    expect((p.GetItem(102) as SvxWeightItem).GetWeight()).toBe(FontWeight.WEIGHT_BOLD);
    expect(doc.GetCellType(new ScAddress(0, doc.MaxRow(), tab))).toBe(0);
  }
  c.Undo();
  expect(c.GetCharacterState("bold")).toBe(false);
  c.Select(0, 0);
  c.MarkRows();
  expect(c.SetUnderlineStyle(FontLineStyle.LINESTYLE_DOUBLE)).toBe(true);
  for (const tab of [0, 1])
    expect(
      (
        (doc.GetPattern(new ScAddress(doc.MaxCol(), 0, tab)) as ScPatternAttr).GetItem(
          104,
        ) as SvxUnderlineItem
      ).GetLineStyle(),
    ).toBe(FontLineStyle.LINESTYLE_DOUBLE);
  c.Undo();
  expect(c.GetUnderlineStyle()).toBe(FontLineStyle.LINESTYLE_NONE);
  s.Close();
});

it("retains native interface defaults when no host accelerator configuration is supplied", /** Checks standalone core interface construction. @returns Nothing. */ () => {
  const ui = createCalcInterface();
  expect(ui.GetSlot(".uno:Bold")?.slotId).toBe(10009);
  expect(ui.GetSlot(".uno:Bold")?.shortcuts).toEqual(["Control+b"]);
  expect(ui.GetSlot(".uno:InputLineEnter")?.shortcuts).toEqual([]);
});

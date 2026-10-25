/** @fileoverview Verifies paragraph dimensional fields retain physical values across display units. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { SwDoc } from "../../source/core/doc/doc";
import { SfxItemSet } from "../../../svl/inc/itemset";
import { SvxTabStopItem, SvxTabStop, SvxTabAdjust } from "../../../editeng/inc/tstpitem";
import { RES_PARATR_TABSTOP } from "../../inc/hintids";
import { WriterParagraphDialog } from "./WriterParagraphDialog";
import { FieldUnit as F } from "../../../tools/inc/fldunit";
import type { WriterParagraphDialogRequest } from "../../source/uibase/dialog/writer-dialog-controller";

const tabContext = new SfxItemSet(new SwDoc().GetAttrPool(), [[1, 12000]]);
const nativeTabs = new SvxTabStopItem(0, 0, SvxTabAdjust.Left, RES_PARATR_TABSTOP);
nativeTabs.Insert(new SvxTabStop(720, SvxTabAdjust.Left));
tabContext.Put(nativeTabs);
const request: WriterParagraphDialogRequest = {
  commandUrl: ".uno:ParagraphDialog",
  kind: "paragraph",
  tabContext,
  paintLineNumbers: false,
  initialValue: {
    upperPt: 72,
    lowerPt: 0,
    firstLineIndentPt: -36,
    contextual: false,
    lineMode: "fixed",
    lineValue: 240,
    tabStopsPt: [36],
    keepWithNext: false,
    countLineNumbers: true,
  },
};

it("edits inch,explicit suffix,and tab values through the unchanged physical paragraph contract", /** Checks text entry and accepted paragraph values. @returns Nothing. */ () => {
  const submit = vi.fn();
  render(
    <WriterParagraphDialog
      dialogRequest={{ id: 1, request }}
      fontSizePt={12}
      unit={F.INCH}
      onDialogCancel={vi.fn()}
      onDialogSubmit={submit}
    />,
  );
  expect(screen.getByRole("spinbutton", { name: "Above paragraph (in)" })).toHaveValue("1.00″");
  expect(screen.getByRole("spinbutton", { name: "First line indent (in)" })).toHaveValue("-0.50″");
  fireEvent.change(screen.getByRole("spinbutton", { name: "Above paragraph (in)" }), {
    target: { value: "12 pt" },
  });
  fireEvent.change(screen.getByRole("spinbutton", { name: "Value (in)" }), {
    target: { value: "0.25 in" },
  });
  fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
  expect(screen.getByRole("option", { name: "0.50″" })).toBeInTheDocument();
  fireEvent.change(screen.getByRole("combobox", { name: "Position" }), {
    target: { value: "1 in" },
  });
  fireEvent.click(screen.getByRole("button", { name: "New" }));
  fireEvent.change(screen.getByRole("listbox", { name: "Tab stops" }), {
    target: { value: "0" },
  });
  expect(screen.getByRole("combobox", { name: "Position" })).toHaveValue("0.50″");
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(submit).toHaveBeenCalledWith(1, {
    tabStopItems: expect.any(SfxItemSet),
    paintLineNumbers: false,
    paragraphFormat: {
      ...request.initialValue,
      upperPt: 12.25,
      lineValue: 360,
      tabStopsPt: [36],
    },
  });
  const accepted = submit.mock.calls[0]?.[1].tabStopItems.Get(RES_PARATR_TABSTOP) as SvxTabStopItem;
  expect(
    Array.from(
      { length: accepted.Count() },
      /** Reads native tab position. @param _ - Unused slot. @param index - Native row. @returns Twips. */ (
        _,
        index,
      ) => accepted.At(index).GetTabPos(),
    ),
  ).toEqual([0, 720, 1440]);
});

it("keeps proportional spacing as a percent when module units change", /** Checks numeric and dimensional boundaries separately. @returns Nothing. */ () => {
  const submit = vi.fn();
  render(
    <WriterParagraphDialog
      dialogRequest={{
        id: 2,
        request: {
          ...request,
          initialValue: { ...request.initialValue, lineMode: "proportional", lineValue: 115 },
        },
      }}
      fontSizePt={12}
      unit={F.MM}
      onDialogCancel={vi.fn()}
      onDialogSubmit={submit}
    />,
  );
  expect(screen.getByRole("spinbutton", { name: "Above paragraph (mm)" })).toHaveValue("25.40 mm");
  fireEvent.change(screen.getByRole("spinbutton", { name: "Value (%)" }), {
    target: { value: "135" },
  });
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(submit.mock.calls[0]?.[1].paragraphFormat).toEqual({
    ...request.initialValue,
    lineMode: "proportional",
    lineValue: 135,
  });
});

it("uses native default metric labels and routes character-unit vertical fields independently", /** Checks actual dialog unit routing without changing the initial physical draft on Cancel. @returns Nothing. */ () => {
  for (const unit of [undefined, F.CHAR]) {
    const cancel = vi.fn(),
      submit = vi.fn();
    render(
      <WriterParagraphDialog
        dialogRequest={{ id: 21, request }}
        fontSizePt={12}
        {...(unit === undefined ? {} : { unit })}
        onDialogCancel={cancel}
        onDialogSubmit={submit}
      />,
    );
    expect(
      screen.getByRole("spinbutton", {
        name: unit === undefined ? "Above paragraph (cm)" : "Above paragraph (line)",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", {
        name: unit === undefined ? "Below paragraph (cm)" : "Below paragraph (line)",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: unit === undefined ? "Value (cm)" : "Value (pt)" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(cancel).toHaveBeenCalledWith(21);
    expect(submit).not.toHaveBeenCalled();
    cleanup();
  }
});

it("exchanges the native tab page with the documented absent first-line scalar default", /** Optional legacy paragraph fields retain zero as their original fallback while tab data stays native. @returns Nothing. */ () => {
  const submit = vi.fn();
  const { firstLineIndentPt, ...initialValue } = request.initialValue;
  void firstLineIndentPt;
  render(
    <WriterParagraphDialog
      dialogRequest={{ id: 31, request: { ...request, initialValue } }}
      fontSizePt={12}
      unit={F.CM}
      onDialogCancel={vi.fn()}
      onDialogSubmit={submit}
    />,
  );
  fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
  fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
  fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(submit.mock.calls[0]?.[1].tabStopItems).toBeInstanceOf(SfxItemSet);
});

it("owns source tab keys before spin steps,retains tab changes and uses native form acceptance", /** Actual tab identity and deactivation survive keyboard and pointer switching. @returns Nothing. */ () => {
  const cancel = vi.fn(),
    submit = vi.fn();
  render(
    <WriterParagraphDialog
      dialogRequest={{ id: 41, request }}
      fontSizePt={12}
      unit={F.INCH}
      onDialogCancel={cancel}
      onDialogSubmit={submit}
    />,
  );
  const first = screen.getByRole("tab", { name: "Indents & Spacing" }),
    flow = screen.getByRole("tab", { name: "Text Flow" }),
    tabs = screen.getByRole("tab", { name: "Tabs" });
  expect(first).toHaveFocus();
  expect(first).toHaveAttribute("tabindex", "0");
  expect(flow).toHaveAttribute("tabindex", "-1");
  fireEvent.keyDown(first, { key: "ArrowLeft" });
  expect(tabs).toHaveFocus();
  expect(tabs).toHaveAttribute("aria-selected", "true");
  fireEvent.change(screen.getByRole("combobox", { name: "Position" }), {
    target: { value: "1 in" },
  });
  fireEvent.click(screen.getByRole("button", { name: "New" }));
  fireEvent.keyDown(screen.getByRole("combobox", { name: "Position" }), {
    key: "PageDown",
    ctrlKey: true,
  });
  expect(first).toHaveFocus();
  const metric = screen.getByLabelText("Above paragraph (in)");
  fireEvent.keyDown(metric, { key: "PageDown", ctrlKey: true });
  expect(flow).toHaveFocus();
  fireEvent.keyDown(flow, { key: "PageDown", ctrlKey: true });
  expect(tabs).toHaveFocus();
  expect(
    screen
      .getAllByRole("option")
      .some(
        /** Identifies the retained new stop. @param option - Actual option. @returns Whether matching. */ (
          option,
        ) => option.textContent === "1.00″",
      ),
  ).toBe(true);
  fireEvent.keyDown(tabs, { key: "PageUp", ctrlKey: true });
  expect(flow).toHaveFocus();
  fireEvent.keyDown(flow, { key: "ArrowRight" });
  expect(tabs).toHaveFocus();
  fireEvent.click(tabs);
  expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", tabs.id);
  expect(tabs).toHaveAttribute("aria-controls", screen.getByRole("tabpanel").id);
  fireEvent.keyDown(tabs, { key: "PageDown", ctrlKey: true, shiftKey: true });
  expect(tabs).toHaveAttribute("aria-selected", "true");
  fireEvent.click(first);
  expect(screen.getByLabelText("Above paragraph (in)")).toHaveValue("1.00″");
  fireEvent.mouseDown(screen.getByRole("dialog").parentElement as HTMLElement);
  expect(cancel).not.toHaveBeenCalled();
  fireEvent.submit(screen.getByRole("dialog"));
  expect(submit).toHaveBeenCalledWith(
    41,
    expect.objectContaining({ paragraphFormat: request.initialValue }),
  );
  fireEvent.keyDown(first, { key: "Escape" });
  expect(cancel).toHaveBeenCalledWith(41);
});
it("cancels the original request from the heading without submitting its draft", /** The shared Close control must retain the paragraph request identity. @returns Nothing. */ () => {
  const cancel = vi.fn(),
    submit = vi.fn();
  render(
    <WriterParagraphDialog
      dialogRequest={{ id: 51, request }}
      fontSizePt={12}
      onDialogCancel={cancel}
      onDialogSubmit={submit}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(cancel).toHaveBeenCalledWith(51);
  expect(submit).not.toHaveBeenCalled();
});

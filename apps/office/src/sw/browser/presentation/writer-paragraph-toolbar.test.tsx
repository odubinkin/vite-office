/** @fileoverview Verifies actual paragraph dialog, toolbar and ruler items through Writer commands. */
import { expect, it } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { tabStops } from "../../../../test/tab-item-fixtures";
import { SvxTabAdjust, SvxTabStopItem } from "../../../editeng/inc/tstpitem";
import { SvxLineSpacingItem } from "../../../editeng/inc/lspcitem";
import { SvxFirstLineIndentItem, SvxULSpaceItem } from "../../../editeng/source/items/frmitems";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../svl/source/items/intitem";
import { SwFormatPageDesc } from "../../source/core/attr/fmtpdsc";
import { projectWriterCharacterAttributes } from "../../source/core/txtnode/txatbase";
import {
  RES_PARATR_LINESPACING,
  RES_PARATR_TABSTOP,
  RES_UL_SPACE,
  RES_KEEP,
  RES_BREAK,
  RES_PAGEDESC,
  RES_MARGIN_FIRSTLINE,
  RES_PARATR_SPLIT,
  RES_PARATR_ORPHANS,
  RES_PARATR_WIDOWS,
} from "../../inc/hintids";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { createCentimetreWriterDocumentSession as createWriterDocumentSession } from "../../../test/writer-measurement-fixtures";
import { WriterWorkbench } from "./writer-view";

/** Opens the actual Format menu placement for the paragraph dialog. @returns Nothing. */
function openParagraphDialog(): void {
  fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
  fireEvent.click(screen.getByRole("menuitem", { name: /Paragraph/ }));
}

it("connects advanced toolbar controls to Writer paragraph items", /** Verifies UI to model formatting. @returns Nothing. */ async () => {
  const session = createWriterDocumentSession();
  session.view.GetModule().ApplyUserMetric(FieldUnit.POINT, false);
  const rendered = render(<WriterWorkbench isActive view={session.view} />);
  const shell = session.view.GetWrtShell();
  fireEvent.click(
    within(screen.getByRole("toolbar", { name: "Writer formatting toolbar" })).getByLabelText(
      "Font Color palette",
    ),
  );
  fireEvent.click(
    within(screen.getByRole("toolbar", { name: "Writer formatting toolbar" })).getByLabelText(
      "Font Color #ff0000",
    ),
  );
  expect(projectWriterCharacterAttributes(shell.GetPendingCharacterItems()).color).toBe("#ff0000");
  expect(
    within(screen.getByRole("toolbar", { name: "Writer formatting toolbar" })).getByRole("button", {
      name: "Line Spacing",
    }),
  ).toBeInTheDocument();
  openParagraphDialog();
  fireEvent.change(screen.getByLabelText("Line spacing"), { target: { value: "preset-150" } });
  fireEvent.change(screen.getByLabelText("Above paragraph (pt)"), { target: { value: "6" } });
  fireEvent.change(screen.getByLabelText("First line indent (pt)"), { target: { value: "9" } });
  fireEvent.click(screen.getByLabelText("Automatic first-line indent"));
  fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
  fireEvent.change(screen.getByRole("combobox", { name: "Position" }), {
    target: { value: "36" },
  });
  fireEvent.click(screen.getByText("New"));
  fireEvent.change(screen.getByRole("combobox", { name: "Position" }), {
    target: { value: "72" },
  });
  fireEvent.click(screen.getByText("New"));
  fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
  fireEvent.change(screen.getByLabelText("Page style"), { target: { value: "Standard" } });
  fireEvent.change(screen.getByLabelText("Page numbering"), { target: { value: "restart" } });
  fireEvent.change(screen.getByLabelText("Start page number"), { target: { value: "2" } });
  fireEvent.change(screen.getByLabelText("Break before"), { target: { value: "page" } });
  fireEvent.change(screen.getByLabelText("Break after"), { target: { value: "page" } });
  fireEvent.click(screen.getByLabelText("Allow to split paragraph"));
  fireEvent.change(screen.getByLabelText("Orphan control (lines)"), { target: { value: "3" } });
  fireEvent.change(screen.getByLabelText("Widow control (lines)"), { target: { value: "4" } });
  fireEvent.click(screen.getByLabelText("Keep with next paragraph"));
  fireEvent.click(screen.getByLabelText("Show line numbers"));
  fireEvent.click(screen.getByText("OK"));
  await waitFor(
    /** Waits for the shell-owned dialog request to finish. @returns Nothing. */ () => {
      expect((shell.GetActiveParagraph().GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(
        120,
      );
    },
  );
  expect((shell.GetActiveParagraph().GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(120);
  expect(
    (
      shell.GetActiveParagraph().GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem
    ).GetPropLineSpace(),
  ).toBe(150);
  expect(
    tabStops(shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem).map(
      /** Projects a tab position. @param stop - Tab stop. @returns Twips. */
      (stop) => stop.GetTabPos(),
    ),
  ).toEqual([720, 1440]);
  expect((shell.GetActiveParagraph().GetAttr(RES_KEEP) as SfxBoolItem).GetValue()).toBe(true);
  expect((shell.GetActiveParagraph().GetAttr(RES_PARATR_SPLIT) as SfxBoolItem).GetValue()).toBe(
    false,
  );
  expect((shell.GetActiveParagraph().GetAttr(RES_PARATR_ORPHANS) as SfxInt16Item).GetValue()).toBe(
    3,
  );
  expect((shell.GetActiveParagraph().GetAttr(RES_PARATR_WIDOWS) as SfxInt16Item).GetValue()).toBe(
    4,
  );
  expect((shell.GetActiveParagraph().GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(6);
  expect(
    (
      shell.GetActiveParagraph().GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
    ).IsAutoFirst(),
  ).toBe(true);
  expect(
    (shell.GetActiveParagraph().GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetNumOffset(),
  ).toBe(2);
  openParagraphDialog();
  expect(screen.getByLabelText("First line indent (pt)")).toHaveValue("9.0 pt");
  expect(screen.getByLabelText("Automatic first-line indent")).toBeChecked();
  fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
  expect(screen.getByLabelText("Page style")).toHaveValue("Standard");
  expect(screen.getByLabelText("Start page number")).toHaveValue(2);
  expect(screen.getByLabelText("Break before")).toHaveValue("page");
  expect(screen.getByLabelText("Break after")).toHaveValue("page");
  expect(screen.getByLabelText("Allow to split paragraph")).not.toBeChecked();
  expect(screen.getByLabelText("Orphan control (lines)")).toHaveValue(3);
  expect(screen.getByLabelText("Widow control (lines)")).toHaveValue(4);
  fireEvent.click(screen.getByText("Cancel"));
  await waitFor(
    /** Waits for cancellation to release the shell dialog request. @returns Nothing. */ () => {
      expect(screen.queryByRole("dialog")).toBeNull();
    },
  );
  const rulerSurface = screen.getByLabelText("Writer horizontal ruler")
    .firstElementChild as HTMLElement;
  fireEvent.pointerDown(rulerSurface, { clientX: 240 });
  fireEvent.pointerUp(window, { clientX: 240 });
  expect(
    tabStops(shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem),
  ).toHaveLength(3);
  openParagraphDialog();
  fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
  fireEvent.click(screen.getByText("Delete All"));
  fireEvent.click(screen.getByText("OK"));
  await waitFor(
    /** Waits for the accepted tab-stop update. @returns Nothing. */ () => {
      expect(
        (shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem).Count(),
      ).toBe(1);
    },
  );
  const cleared = shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
  // Native FillUpWithDefTabs retains a default tab at the document interval (2 cm).
  expect(cleared.Count()).toBe(1);
  expect(cleared.At(0).GetTabPos()).toBe(1134);
  expect(cleared.At(0).GetAdjustment()).toBe(SvxTabAdjust.Default);
  fireEvent.pointerDown(rulerSurface, { clientX: 240 });
  fireEvent.pointerUp(window, { clientX: 240 });
  expect(
    (shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem).At(0).GetTabPos(),
  ).toBeGreaterThan(0);
  const tabHandle = screen.getByRole("button", { name: "Tab stop 1" });
  fireEvent.pointerDown(tabHandle, { clientX: 100 });
  fireEvent.pointerUp(window, { clientX: -1000 });
  const afterRulerDelete = shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
  expect(afterRulerDelete.Count()).toBe(1);
  expect(afterRulerDelete.At(0).GetAdjustment()).toBe(SvxTabAdjust.Default);
  expect(afterRulerDelete.At(0).GetTabPos()).toBe(1134);
  rendered.unmount();
  session.Close();
});

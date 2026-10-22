/** @fileoverview Exact source paper lists and original SvxPaperSizeListBox append/fallback selection behavior. */
import { expect, it } from "vitest";
import { Paper } from "../../../i18nutil/inc/paper";
import { SvxPaperSizeListBox, PaperSizeApp } from "../../inc/papersizelistbox";
it("retains the complete literal37-entry Writer source list and IDs", /** Golden order is independent from dimensional sorting or enum order. @returns Nothing. */ () => {
  const box = new SvxPaperSizeListBox();
  box.FillPaperSizeEntries(PaperSizeApp.Std);
  expect(
    box
      .GetEntries()
      .map(
        /** Reads original tuple. @param row - Source row. @returns Immutable pair. */ (row) => [
          row.paper,
          row.label,
        ],
      ),
  ).toEqual([
    [56, "A6"],
    [5, "A5"],
    [4, "A4"],
    [3, "A3"],
    [2, "A2"],
    [1, "A1"],
    [0, "A0"],
    [12, "B6 (ISO)"],
    [7, "B5 (ISO)"],
    [6, "B4 (ISO)"],
    [65, "B3 (ISO)"],
    [64, "B2 (ISO)"],
    [63, "B1 (ISO)"],
    [62, "B0 (ISO)"],
    [8, "Letter"],
    [9, "Legal"],
    [24, "Long Bond"],
    [10, "Tabloid"],
    [36, "B6 (JIS)"],
    [35, "B5 (JIS)"],
    [34, "B4 (JIS)"],
    [31, "16 Kai"],
    [32, "32 Kai"],
    [33, "Big 32 Kai"],
    [11, "User"],
    [17, "DL Envelope"],
    [15, "C6 Envelope"],
    [16, "C6/5 Envelope"],
    [14, "C5 Envelope"],
    [13, "C4 Envelope"],
    [26, "#6¾ Envelope"],
    [25, "#7¾ (Monarch) Envelope"],
    [27, "#9 Envelope"],
    [28, "#10 Envelope"],
    [29, "#11 Envelope"],
    [30, "#12 Envelope"],
    [46, "Japanese Postcard"],
  ]);
  box.set_active_id(Paper.PAPER_A3);
  expect(box.get_active_id()).toBe(Paper.PAPER_A3);
  box.set_active_id(Paper.PAPER_LEDGER);
  expect(box.get_active_id()).toBe(Paper.PAPER_USER);
});
it("retains original Draw list, actual resource context and append/clear contracts", /** No Writer-only catalog substitutes for the shared original widget. @returns Nothing. */ () => {
  const box = new SvxPaperSizeListBox();
  expect(box.get_active_id()).toBe(Paper.PAPER_A0);
  box.set_active_id(Paper.PAPER_A4);
  expect(box.get_active_id()).toBe(Paper.PAPER_A0);
  box.FillPaperSizeEntries(
    PaperSizeApp.Draw,
    /** Supplies only the native resource label port. @param context - Source context. @param text - Source label. @returns Translated text. */ (
      context,
      text,
    ) => context + ":" + text,
  );
  expect(box.GetEntries()).toHaveLength(35);
  expect(
    box
      .GetEntries()
      .slice(-7)
      .map(
        /** Reads native screen sequence. @param row - Original row. @returns ID. */ (row) =>
          row.paper,
      ),
  ).toEqual([19, 78, 79, 82, 83, 84, 85, 46].slice(-7));
  expect(box.GetEntries()[0]?.label).toBe("RID_SVXSTRARY_PAPERSIZE_DRAW:A6");
  box.set_active_id(Paper.PAPER_SCREEN_16_9);
  expect(box.get_active_id()).toBe(Paper.PAPER_SCREEN_16_9);
  box.FillPaperSizeEntries(PaperSizeApp.Std);
  expect(box.GetEntries()).toHaveLength(72);
  box.set_active_id(Paper.PAPER_USER);
  expect(box.get_active_id()).toBe(Paper.PAPER_USER);
  box.clear();
  expect(box.GetEntries()).toEqual([]);
  expect(box.get_active_id()).toBe(Paper.PAPER_A0);
});

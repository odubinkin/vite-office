/** @fileoverview Verifies actual source split control events and retained rows without mirroring document attributes. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { SvxExtParagraphTabPage } from "../../../cui/source/tabpages/paragrph";
import { WriterParagraphSplitControls } from "./WriterParagraphSplitControls";
afterEach(cleanup);
it("projects every original handler,zero checkbox encoding and inactive row retention", /** Source split toggling changes checkboxes but keeps checked numeric rows sensitive. @returns Nothing. */ () => {
  const page = new SvxExtParagraphTabPage({});
  render(<WriterParagraphSplitControls page={page} />);
  const allow = screen.getByLabelText("Allow to split paragraph"),
    orphan = screen.getByLabelText("Don’t split at beginning of paragraph"),
    widow = screen.getByLabelText("Don’t split at end of paragraph");
  fireEvent.click(allow);
  expect(orphan).toBeDisabled();
  expect(widow).toBeDisabled();
  expect(screen.getByLabelText("Widow control (lines)")).toBeEnabled();
  fireEvent.click(allow);
  fireEvent.change(screen.getByLabelText("Orphan control (lines)"), { target: { value: "4" } });
  fireEvent.change(screen.getByLabelText("Widow control (lines)"), { target: { value: "5" } });
  fireEvent.click(orphan);
  expect(screen.getByLabelText("Orphan control (lines)")).toBeDisabled();
  fireEvent.click(widow);
  expect(allow).toBeDisabled();
  fireEvent.click(orphan);
  expect(allow).toBeEnabled();
  fireEvent.click(widow);
  expect(page.FillItemSet()).toEqual({ orphans: 4, widows: 5 });
  fireEvent.click(orphan);
  fireEvent.click(widow);
  expect(page.FillItemSet()).toEqual({ orphans: 0, widows: 0 });
});

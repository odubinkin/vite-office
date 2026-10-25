/** @fileoverview Pins actual paragraph break widgets,source dependencies and retained draft through native handler ports. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { SvxExtParagraphTabPage } from "../../../cui/source/tabpages/paragrph";
import { WriterParagraphBreakControls } from "./WriterParagraphBreakControls";
afterEach(cleanup);
it("keeps native position/style dependencies and inactive numeric drafts without emitting inactive offsets", /** Exercises actual source draft rather than duplicating attributes in browser state. @returns Nothing. */ () => {
  const page = new SvxExtParagraphTabPage({}, ["Standard", "Other"]);
  render(<WriterParagraphBreakControls page={page} />);
  const insert = screen.getByRole("checkbox", { name: "Insert" }),
    position = screen.getByRole("combobox", { name: "Position" }),
    style = screen.getByLabelText("With page style"),
    names = screen.getByRole("combobox", { name: "Page style" }),
    number = screen.getByRole("spinbutton", { name: "Start page number" }),
    numbered = screen.getByRole("checkbox", { name: "Page number" });
  expect(position).toBeDisabled();
  expect(style).toBeDisabled();
  expect(names).toBeDisabled();
  expect(number).toHaveValue(1);
  expect(page.FillItemSet()).toEqual({});
  fireEvent.click(insert);
  expect(position).toBeEnabled();
  expect(style).toBeEnabled();
  fireEvent.click(style);
  expect(names).toHaveValue("Standard");
  fireEvent.change(names, { target: { value: "Other" } });
  fireEvent.click(numbered);
  fireEvent.change(number, { target: { value: "7" } });
  expect(page.FillItemSet()).toEqual({
    pageStyleName: "Other",
    pageNumber: 7,
    breakBefore: "auto",
    breakAfter: "auto",
  });
  fireEvent.change(position, { target: { value: "after" } });
  expect(style).not.toBeChecked();
  expect(style).toBeDisabled();
  expect(names).toHaveValue("Other");
  expect(names).toBeDisabled();
  expect(number).toHaveValue(7);
  expect(number).toBeDisabled();
  expect(page.FillItemSet()).toEqual({ breakBefore: "auto", breakAfter: "page" });
  fireEvent.change(position, { target: { value: "before" } });
  fireEvent.click(style);
  expect(names).toHaveValue("Standard");
  expect(number).toBeEnabled();
  expect(number).toHaveValue(7);
  fireEvent.click(numbered);
  expect(number).toBeDisabled();
  expect(page.FillItemSet()).not.toHaveProperty("pageNumber");
  fireEvent.click(style);
  expect(names).toHaveValue("");
  fireEvent.click(insert);
  expect(position).toBeDisabled();
  expect(page.FillItemSet()).toEqual({});
});

/** @fileoverview Editable font combo uses original numeric/toolbox owners, real React events and only platform dispatch/focus callbacks. */
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { FontSizeSelect } from "./FontSizeBox";

it("keeps incomplete entry outside document state until Tab and restores unaccepted pointer departure", /** Source textbox edits and native acceptance are separate events. @returns Nothing. */ () => {
  const onSelect = vi.fn(),
    focusDocument = vi.fn();
  const view = render(
    <FontSizeSelect
      value={12}
      enabled
      label="Size"
      onSelect={onSelect}
      focusDocument={focusDocument}
    />,
  );
  const input = screen.getByRole("combobox", { name: "Size" });
  expect(input).toHaveValue("12 pt");
  fireEvent.change(input, { target: { value: "13.3" } });
  expect(onSelect).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: "Tab" });
  expect(onSelect).toHaveBeenCalledExactlyOnceWith(13.300000190734863);
  expect(focusDocument).not.toHaveBeenCalled();
  view.rerender(
    <FontSizeSelect
      value={13.3}
      enabled
      label="Size"
      onSelect={onSelect}
      focusDocument={focusDocument}
    />,
  );
  fireEvent.change(input, { target: { value: "88" } });
  fireEvent.blur(input);
  expect(input).toHaveValue("13.3");
  expect(onSelect).toHaveBeenCalledOnce();
});

it("offers the exact full scalable list and accepts a pointer pick through native focus-before-dispatch", /** No custom entry is injected into the source rows. @returns Nothing. */ () => {
  const order: string[] = [],
    onSelect = vi.fn(
      /** Observes only actual platform command acceptance. @param value - Point height. @returns Nothing. */ (
        value,
      ) => {
        order.push(String(value));
      },
    );
  render(
    <FontSizeSelect
      value={13.3}
      enabled
      label="Size"
      onSelect={onSelect}
      focusDocument={
        /** Observes only frame focus. @returns Nothing. */ () => {
          order.push("focus");
        }
      }
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Show Size" }));
  expect(screen.getAllByRole("option")).toHaveLength(32);
  expect(screen.queryByRole("option", { name: "13.3 pt" })).toBeNull();
  fireEvent.mouseDown(screen.getByRole("option", { name: "10.5 pt" }));
  fireEvent.click(screen.getByRole("option", { name: "10.5 pt" }));
  expect(order).toEqual(["focus", "10.5"]);
  expect(screen.queryByRole("listbox")).toBeNull();
});

it("accepts Enter and keyboard list navigation while Escape restores original status", /** Toolbar cancellation is consumed; ordinary typed input is not autoformatted. @returns Nothing. */ () => {
  const onSelect = vi.fn(),
    focusDocument = vi.fn();
  render(
    <FontSizeSelect
      value={12}
      enabled
      label="Size"
      onSelect={onSelect}
      focusDocument={focusDocument}
    />,
  );
  const input = screen.getByRole("combobox", { name: "Size" });
  fireEvent.change(input, { target: { value: "13.7 pt" } });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(onSelect).toHaveBeenLastCalledWith(13.699999809265137);
  expect(focusDocument).toHaveBeenCalledOnce();
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "ArrowUp" });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(onSelect).toHaveBeenLastCalledWith(6);
  fireEvent.change(input, { target: { value: "99" } });
  fireEvent.keyDown(input, { key: "Escape" });
  expect(input).toHaveValue("12 pt");
  expect(focusDocument).toHaveBeenCalledTimes(3);
});

it("preserves mixed status, disabled state and native empty-versus-invalid acceptance", /** Empty get_value0 is not replaced by an invented preset; nonempty invalid input clamps to2pt. @returns Nothing. */ () => {
  const onSelect = vi.fn(),
    focusDocument = vi.fn();
  const view = render(
    <FontSizeSelect
      value={undefined}
      enabled
      label="Size"
      onSelect={onSelect}
      focusDocument={focusDocument}
      inSidebar
    />,
  );
  const input = screen.getByRole("combobox", { name: "Size" });
  expect(input).toHaveValue("");
  fireEvent.keyDown(input, { key: "Enter" });
  expect(onSelect).toHaveBeenLastCalledWith(0);
  fireEvent.change(input, { target: { value: "invalid" } });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(onSelect).toHaveBeenLastCalledWith(2);
  fireEvent.keyDown(input, { key: "Escape" });
  expect(input).toHaveValue("");
  expect(focusDocument).toHaveBeenCalledTimes(2);
  view.rerender(<FontSizeSelect value={14} enabled={false} label="Size" onSelect={onSelect} />);
  expect(input).toHaveValue("14 pt");
  expect(input).toBeDisabled();
  expect(screen.getByRole("button", { name: "Show Size" })).toBeDisabled();
});

it("retains text during composite focus and begins list traversal at the actual selected standard size", /** Popup ownership is separate from whole-combo focus departure and from uncommitted entry edits. @returns Nothing. */ () => {
  const onSelect = vi.fn();
  render(<FontSizeSelect value={12} enabled label="Size" onSelect={onSelect} />);
  const input = screen.getByRole("combobox", { name: "Size" }),
    toggle = screen.getByRole("button", { name: "Show Size" });
  fireEvent.change(input, { target: { value: "13.8" } });
  fireEvent.blur(input, { relatedTarget: toggle });
  expect(input).toHaveValue("13.8");
  expect(onSelect).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: "Escape" });
  fireEvent.mouseDown(toggle);
  fireEvent.click(toggle);
  expect(screen.getByRole("option", { name: "12 pt" })).toHaveAttribute("aria-selected", "true");
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(screen.getByRole("option", { name: "13 pt" })).toHaveAttribute("aria-selected", "true");
  fireEvent.keyDown(input, { key: "Enter" });
  expect(onSelect).toHaveBeenLastCalledWith(13);
});

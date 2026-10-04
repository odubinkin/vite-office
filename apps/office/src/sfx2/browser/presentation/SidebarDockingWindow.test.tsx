/** @fileoverview Checks the Sidebar parent key boundary and local HTML widget defaults. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SidebarDockingWindow } from "./SidebarDockingWindow";

afterEach(cleanup);

describe("Sidebar docking key boundary", /** Groups native key codes and DOM ownership. @returns Nothing. */ () => {
  for (const key of [
    "ArrowUp",
    "ArrowDown",
    "PageUp",
    "PageDown",
    "Home",
    "End",
    "ArrowLeft",
    "ArrowRight",
    "Backspace",
    "Delete",
    "Insert",
    "Enter",
    "Escape",
  ]) {
    for (const modifiers of [{}, { ctrlKey: true, shiftKey: true, altKey: true, metaKey: true }]) {
      it(`owns ${key} with ${JSON.stringify(modifiers)} after local handlers`, /** Checks each literal source key independently of production's list. @returns Nothing. */ function isolatesLocalKey(): void {
        const global = vi.fn();
        const local = vi.fn();
        render(
          <div onKeyDown={global}>
            <SidebarDockingWindow ariaLabel="Owned sidebar" className="unchanged-layout">
              <div aria-label="Local widget" onKeyDown={local} tabIndex={0} />
            </SidebarDockingWindow>
          </div>,
        );
        const owner = screen.getByLabelText("Local widget");
        owner.focus();
        expect(fireEvent.keyDown(owner, { key, ...modifiers })).toBe(false);
        expect(local).toHaveBeenCalledOnce();
        expect(global).not.toHaveBeenCalled();
        expect(owner).toHaveFocus();
        expect(screen.getByRole("complementary")).toHaveClass("unchanged-layout");
      });
    }
  }

  for (const widget of ["input", "textarea", "select", "editable", "button"] as const) {
    it(`retains local ${widget} defaults while blocking document fallback`, /** Checks default editing or Enter activation remains available. @returns Nothing. */ function retainsWidgetDefault(): void {
      const global = vi.fn();
      render(
        <div onKeyDown={global}>
          <SidebarDockingWindow ariaLabel="Owned sidebar" className="">
            {widget === "input" ? (
              <input aria-label="Local widget" defaultValue="Draft" />
            ) : widget === "textarea" ? (
              <textarea aria-label="Local widget" defaultValue="Draft" />
            ) : widget === "select" ? (
              <select aria-label="Local widget" defaultValue="first">
                <option value="first">First</option>
                <option value="second">Second</option>
              </select>
            ) : widget === "editable" ? (
              <div aria-label="Local widget" contentEditable suppressContentEditableWarning>
                Draft
              </div>
            ) : (
              <button aria-label="Local widget" type="button">
                Action
              </button>
            )}
          </SidebarDockingWindow>
        </div>,
      );
      const owner = screen.getByLabelText("Local widget");
      expect(
        fireEvent.keyDown(owner, { key: widget === "button" ? "Enter" : "Delete", shiftKey: true }),
      ).toBe(true);
      expect(global).not.toHaveBeenCalled();
    });
  }

  it("preserves already consumed child input and ordinary global fallback", /** Checks child priority, unmapped boundary keys and sibling isolation. @returns Nothing. */ () => {
    const global = vi.fn();
    render(
      <div onKeyDown={global}>
        <SidebarDockingWindow ariaLabel="Owned sidebar" className="">
          <button
            onKeyDown={
              /** Consumes the child's own cancellation. @param event - Local key. @returns Nothing. */
              (event) => {
                if (event.key === "Escape") event.preventDefault();
              }
            }
            type="button"
          >
            Owned
          </button>
        </SidebarDockingWindow>
        <button type="button">Sibling</button>
      </div>,
    );
    const owner = screen.getByRole("button", { name: "Owned" });
    expect(fireEvent.keyDown(owner, { key: "Escape" })).toBe(false);
    expect(global).not.toHaveBeenCalled();
    for (const key of ["Tab", "z", "b", "F6", "F8"])
      expect(fireEvent.keyDown(owner, { key, ctrlKey: true })).toBe(true);
    expect(global).toHaveBeenCalledTimes(5);
    expect(
      fireEvent.keyDown(screen.getByRole("button", { name: "Sibling" }), {
        key: "Delete",
        shiftKey: true,
      }),
    ).toBe(true);
    expect(global).toHaveBeenCalledTimes(6);
  });
});

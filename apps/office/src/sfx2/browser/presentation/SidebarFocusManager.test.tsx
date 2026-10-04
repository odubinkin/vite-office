/** @fileoverview Checks owned Sidebar traversal and panel registration lifecycle. */
import { useRef, type ReactNode } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SidebarDeck } from "./SidebarDeck";
import { SidebarPanel } from "./SidebarPanel";
import { SidebarFocusContext, SidebarFocusManager } from "./SidebarFocusManager";

afterEach(cleanup);

/** Builds an actual titled panel with retained content.
 * @param props - Owned panel fixture.
 * @param props.title - Unique panel label.
 * @param props.options - Optional title toolbox.
 * @returns Mounted panel.
 */
function Panel({ title, options }: { readonly title: string; readonly options?: ReactNode }) {
  const content = useRef<HTMLButtonElement>(null);
  return (
    <SidebarPanel
      focusContent={
        /** Focuses this panel's first eligible child. @returns Nothing. */ () =>
          (content.current as HTMLButtonElement).focus()
      }
      initiallyExpanded={false}
      moreOptions={options}
      title={title}
    >
      <button ref={content} type="button">
        {title} content
      </button>
    </SidebarPanel>
  );
}

/** Builds one isolated managed deck.
 * @param props - Deck fixture.
 * @param props.order - Rendered panel order.
 * @param props.name - Owned deck label.
 * @returns Deck with actual managed panels.
 */
function Deck({
  order,
  name = "Properties",
}: {
  readonly order: readonly string[];
  readonly name?: string;
}) {
  return (
    <SidebarDeck ariaLabel={name} title={name}>
      {order.map(
        /** Supplies keyed panel ownership across reorders. @param title - Panel label. @returns Panel. */
        (title) => (
          <Panel
            key={title}
            options={<button type="button">{title} options</button>}
            title={title}
          />
        ),
      )}
    </SidebarDeck>
  );
}

describe("managed Sidebar focus", /** Groups the implemented titled-panel graph. @returns Nothing. */ () => {
  it("enters toolbox before content without expanding at the first Tab", /** Checks native forward traversal on a collapsed panel. @returns Nothing. */ function traversesPanel(): void {
    render(<Deck order={["First"]} />);
    const title = screen.getByRole("button", { name: "First" });
    const options = screen.getByRole("button", { name: "First options" });
    title.focus();
    expect(fireEvent.keyDown(title, { key: "Tab" })).toBe(false);
    expect(options).toHaveFocus();
    expect(title).toHaveAttribute("aria-expanded", "false");
    expect(fireEvent.keyDown(options, { key: "Tab" })).toBe(false);
    expect(screen.getByRole("button", { name: "First content" })).toHaveFocus();
    expect(title).toHaveAttribute("aria-expanded", "true");
  });

  it("enters content directly when the toolbox contains no items", /** Checks a managed title without options. @returns Nothing. */ () => {
    render(
      <SidebarDeck ariaLabel="Properties" title="Properties">
        <Panel title="First" />
      </SidebarDeck>,
    );
    const title = screen.getByRole("button", { name: "First" });
    title.focus();
    expect(fireEvent.keyDown(title, { key: "Tab" })).toBe(false);
    expect(screen.getByRole("button", { name: "First content" })).toHaveFocus();
  });

  it("retains title focus when all existing toolbox items are disabled", /** Distinguishes toolbox item presence from eligible focus targets. @returns Nothing. */ () => {
    render(
      <SidebarDeck ariaLabel="Properties" title="Properties">
        <Panel
          title="First"
          options={
            <button disabled type="button">
              Unavailable
            </button>
          }
        />
      </SidebarDeck>,
    );
    const title = screen.getByRole("button", { name: "First" });
    title.focus();
    expect(fireEvent.keyDown(title, { key: "Tab" })).toBe(false);
    expect(title).toHaveFocus();
    expect(title).toHaveAttribute("aria-expanded", "false");
  });

  it("leaves backward Tab and local content keys to the toolkit", /** Checks only native managed branches are consumed. @returns Nothing. */ () => {
    render(<Deck order={["First"]} />);
    const title = screen.getByRole("button", { name: "First" });
    const options = screen.getByRole("button", { name: "First options" });
    for (const control of [title, options]) {
      control.focus();
      expect(fireEvent.keyDown(control, { key: "Tab", shiftKey: true })).toBe(true);
      expect(fireEvent.keyDown(control, { key: "F8" })).toBe(true);
      expect(control).toHaveFocus();
    }
    fireEvent.keyDown(title, { key: "Enter" });
    const content = screen.getByRole("button", { name: "First content" });
    for (const key of ["Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"]) {
      expect(fireEvent.keyDown(content, { key })).toBe(key === "Tab" || key === "Enter");
      expect(content).toHaveFocus();
    }
  });

  it("respects child-consumed title toolbox navigation", /** Checks nested command ownership precedes managed traversal. @returns Nothing. */ () => {
    render(
      <SidebarDeck ariaLabel="Properties" title="Properties">
        <Panel
          title="First"
          options={
            <button
              onKeyDown={
                /** Retains child-owned keys. @param event - Key input. @returns Nothing. */ (
                  event,
                ) => event.preventDefault()
              }
              type="button"
            >
              Options
            </button>
          }
        />
      </SidebarDeck>,
    );
    const options = screen.getByRole("button", { name: "Options" });
    options.focus();
    for (const key of ["Tab", "ArrowUp", "ArrowDown"]) {
      expect(fireEvent.keyDown(options, { key })).toBe(false);
      expect(options).toHaveFocus();
    }
    expect(screen.getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "false");
  });

  it("traverses the toolbox, rail and expanded panel without activation", /** Checks both toolbox Tab directions and rail routes. @returns Nothing. */ () => {
    render(<Deck order={["First"]} />);
    const close = screen.getByRole("button", { name: "Close Sidebar Deck" });
    const rail = screen.getByRole("button", { name: "Properties" });
    for (const shiftKey of [false, true]) {
      close.focus();
      expect(fireEvent.keyDown(close, { key: "Tab", shiftKey })).toBe(false);
      expect(rail).toHaveFocus();
    }
    expect(fireEvent.keyDown(rail, { key: "Tab", shiftKey: true })).toBe(false);
    expect(close).toHaveFocus();
    rail.focus();
    expect(fireEvent.keyDown(rail, { key: "Tab" })).toBe(false);
    expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
    expect(rail).toHaveAttribute("aria-pressed", "true");
  });

  it("opens retained content through ShowPanel rather than rail activation", /** Checks closed deck entry expands the panel. @returns Nothing. */ () => {
    render(<Deck order={["First"]} />);
    const rail = screen.getByRole("button", { name: "Properties" });
    fireEvent.click(screen.getByRole("button", { name: "Close Sidebar Deck" }));
    expect(rail).toHaveAttribute("aria-pressed", "false");
    rail.focus();
    expect(fireEvent.keyDown(rail, { key: "Tab" })).toBe(false);
    expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
    expect(rail).toHaveAttribute("aria-pressed", "true");
  });

  for (const control of ["title", "options"]) {
    it(`moves ${control} arrows through panels and native boundaries`, /** Checks both directions expand only the destination. @returns Nothing. */ function movesPanels(): void {
      render(<Deck order={["First", "Second", "Third"]} />);
      const second = screen.getByRole("button", {
        name: control === "title" ? "Second" : "Second options",
      });
      for (const key of ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"]) {
        second.focus();
        expect(fireEvent.keyDown(second, { key, altKey: true, shiftKey: true })).toBe(false);
        const target = screen.getByRole("button", {
          name: key === "ArrowLeft" || key === "ArrowUp" ? "First" : "Third",
        });
        expect(target).toHaveFocus();
        expect(target).toHaveAttribute("aria-expanded", "true");
      }
      const first = screen.getByRole("button", {
        name: control === "title" ? "First" : "First options",
      });
      first.focus();
      fireEvent.keyDown(first, { key: "ArrowUp" });
      expect(screen.getByRole("button", { name: "Close Sidebar Deck" })).toHaveFocus();
      const third = screen.getByRole("button", {
        name: control === "title" ? "Third" : "Third options",
      });
      third.focus();
      fireEvent.keyDown(third, { key: "ArrowDown" });
      expect(screen.getByRole("button", { name: "Properties" })).toHaveFocus();
    });
  }

  it("wraps vertical rail arrows and leaves horizontal/toolbox arrows local", /** Checks the one implemented activation button. @returns Nothing. */ () => {
    render(<Deck order={["First"]} />);
    const rail = screen.getByRole("button", { name: "Properties" });
    rail.focus();
    for (const key of ["ArrowUp", "ArrowDown"]) {
      expect(fireEvent.keyDown(rail, { key })).toBe(false);
      expect(rail).toHaveFocus();
    }
    for (const key of ["ArrowLeft", "ArrowRight", "F8"])
      expect(fireEvent.keyDown(rail, { key })).toBe(key === "F8");
    const close = screen.getByRole("button", { name: "Close Sidebar Deck" });
    close.focus();
    for (const key of ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "F8"])
      expect(fireEvent.keyDown(close, { key })).toBe(key === "F8");
    expect(rail).toHaveAttribute("aria-pressed", "true");
  });

  it("respects an enclosing key owner before deck and rail traversal", /** Checks capture-consumed keys preserve focus and deck state. @returns Nothing. */ () => {
    const documentFocus = vi.fn();
    render(
      <div
        onKeyDownCapture={
          /** Models an enclosing modal key owner. @param event - Captured input. @returns Nothing. */
          (event) => event.preventDefault()
        }
      >
        <SidebarDeck ariaLabel="Properties" focusDocument={documentFocus} title="Properties">
          <Panel title="First" />
        </SidebarDeck>
      </div>,
    );
    const rail = screen.getByRole("button", { name: "Properties" });
    const close = screen.getByRole("button", { name: "Close Sidebar Deck" });
    for (const control of [close, rail]) {
      control.focus();
      for (const key of ["Tab", "ArrowUp", "ArrowDown", "Escape"]) {
        expect(fireEvent.keyDown(control, { key })).toBe(false);
        expect(control).toHaveFocus();
      }
    }
    expect(rail).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "false");
    expect(documentFocus).not.toHaveBeenCalled();
  });

  it("uses actual keyed display order and unregisters removed panels", /** Checks DOM order and mounted listener lifetime. @returns Nothing. */ function reordersPanels(): void {
    const view = render(<Deck order={["First", "Second", "Third"]} />);
    view.rerender(<Deck order={["Third", "First", "Second"]} />);
    const rail = screen.getByRole("button", { name: "Properties" });
    rail.focus();
    fireEvent.keyDown(rail, { key: "Tab" });
    expect(screen.getByRole("button", { name: "Third" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("button", { name: "Third" }), { key: "ArrowDown" });
    expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
    view.rerender(<Deck order={["Second", "Third"]} />);
    fireEvent.keyDown(screen.getByRole("button", { name: "Second" }), { key: "ArrowDown" });
    expect(screen.getByRole("button", { name: "Third" })).toHaveFocus();
    expect(screen.queryByRole("button", { name: "First" })).not.toBeInTheDocument();
  });

  it("keeps identical panel names isolated to their owning decks", /** Checks no global query or shared registry crosses ownership. @returns Nothing. */ () => {
    render(
      <>
        <Deck name="Left" order={["Paragraph"]} />
        <Deck name="Right" order={["Paragraph"]} />
      </>,
    );
    const left = within(screen.getByRole("complementary", { name: "Left" }));
    const right = within(screen.getByRole("complementary", { name: "Right" }));
    const rail = right.getByRole("button", { name: "Right" });
    rail.focus();
    fireEvent.keyDown(rail, { key: "Tab" });
    expect(right.getByRole("button", { name: "Paragraph" })).toHaveFocus();
    expect(left.getByRole("button", { name: "Paragraph" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("falls back to the deck title for a missing first panel", /** Checks native invalid-index fallback in an empty managed deck. @returns Nothing. */ () => {
    render(<Deck order={[]} />);
    const rail = screen.getByRole("button", { name: "Properties" });
    rail.focus();
    expect(fireEvent.keyDown(rail, { key: "Tab" })).toBe(false);
    expect(screen.getByRole("button", { name: "Close Sidebar Deck" })).toHaveFocus();
  });

  it("honors both invalid-index fallback policies without showing a panel", /** Checks the literal indexed manager contract, using no upstream implementation. @returns Nothing. */ () => {
    const deck = vi.fn();
    const rail = vi.fn();
    const show = vi.fn();
    const manager = new SidebarFocusManager();
    manager.SetDeck(deck, rail, show);
    manager.FocusPanel(-1, false);
    expect(deck).not.toHaveBeenCalled();
    manager.FocusPanel(99, true);
    expect(deck).toHaveBeenCalledOnce();
    expect(rail).not.toHaveBeenCalled();
    expect(show).not.toHaveBeenCalled();
  });

  it("registers and clears panels in a supplied owned manager", /** Checks cleanup against later indexed traversal. @returns Nothing. */ () => {
    const fallback = vi.fn();
    const manager = new SidebarFocusManager();
    manager.SetDeck(fallback, vi.fn(), vi.fn());
    const view = render(
      <SidebarFocusContext.Provider value={manager}>
        <Panel title="First" />
      </SidebarFocusContext.Provider>,
    );
    view.unmount();
    manager.FocusPanel(0, true);
    expect(fallback).toHaveBeenCalledOnce();
  });
});

/** @fileoverview Checks owned Deck ShowPanel adjustment with literal native rectangle cases. */
import { useRef } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SidebarDeck } from "./SidebarDeck";
import { SidebarPanel } from "./SidebarPanel";

afterEach(
  /** Disposes geometry overrides and owned decks. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
  },
);

/** Supplies a collapsed panel with its own focusable child.
 * @param props - Unique deck label.
 * @param props.name - Owning deck label.
 * @returns Managed deck and panel.
 */
function Deck({ name = "Properties" }: { readonly name?: string }) {
  const content = useRef<HTMLButtonElement>(null);
  return (
    <SidebarDeck ariaLabel={name} title={name}>
      <SidebarPanel
        focusContent={
          /** Enters this panel's child. @returns Nothing. */ () =>
            (content.current as HTMLButtonElement).focus()
        }
        initiallyExpanded={false}
        title="Paragraph"
      >
        <button ref={content} type="button">
          Content
        </button>
      </SidebarPanel>
    </SidebarDeck>
  );
}

/** Models viewport geometry and scroll offsets independently of the adjustment algorithm.
 * @param root - Mounted owning deck root.
 * @param top - Panel content coordinate.
 * @param height - Expanded panel height.
 * @param initial - Existing adjustment value.
 * @param scrollHeight - Existing scrollable extent.
 * @returns Owned controls, geometry and adjustment spy.
 */
function measure(
  root: HTMLElement,
  top: number,
  height: number,
  initial: number,
  scrollHeight = 1000,
) {
  const owner = within(root);
  const panel = owner.getByRole("region", { name: "Paragraph" });
  const title = owner.getByRole("button", { name: "Paragraph" });
  const viewport = panel.parentElement as HTMLElement;
  let position = initial;
  const adjust = vi.fn(
    /** Records browser adjustment assignments. @param next - New position. @returns Nothing. */
    (next: number) => {
      position = next;
    },
  );
  Object.defineProperties(viewport, {
    clientHeight: { configurable: true, value: 100 },
    clientTop: { configurable: true, value: 2 },
    scrollHeight: { configurable: true, value: scrollHeight },
    scrollTop: {
      configurable: true,
      get: /** Supplies current scroll offset. @returns Offset. */ () => position,
      set: adjust,
    },
  });
  vi.spyOn(viewport, "getBoundingClientRect").mockReturnValue(new DOMRect(10, 100, 200, 100));
  const extent = vi.spyOn(panel, "getBoundingClientRect").mockImplementation(
    /** Measures expanded content only after native title focus. @returns Panel DOM rectangle. */ () => {
      expect(title).toHaveFocus();
      return new DOMRect(
        10,
        102 + top - position,
        200,
        title.getAttribute("aria-expanded") === "true" ? height : 36,
      );
    },
  );
  return {
    panel,
    title,
    viewport,
    adjust,
    extent,
    rail: owner.getByRole("button", { name: root.getAttribute("aria-label") as string }),
  };
}

describe("Sidebar Deck ShowPanel", /** Groups source adjustment contracts on owned DOM. @returns Nothing. */ () => {
  for (const sample of [
    { name: "below viewport", top: 250, height: 60, initial: 0, expected: 208 },
    { name: "above viewport", top: 40, height: 60, initial: 180, expected: 40 },
    { name: "already visible", top: 120, height: 40, initial: 100, expected: 100 },
    { name: "oversized panel", top: 250, height: 180, initial: 0, expected: 250 },
    { name: "closed bottom boundary", top: 140, height: 62, initial: 100, expected: 100 },
    { name: "one pixel beyond bottom", top: 140, height: 63, initial: 100, expected: 101 },
    { name: "empty extent", top: 120, height: 0, initial: 100, expected: 100 },
  ]) {
    it(`adjusts ${sample.name} after expansion and focus`, /** Checks literal source outcomes, not a cloned algorithm. @returns Nothing. */ function adjustsPanelExtent(): void {
      render(<Deck />);
      const controls = measure(
        screen.getByRole("complementary"),
        sample.top,
        sample.height,
        sample.initial,
      );
      controls.rail.focus();
      expect(fireEvent.keyDown(controls.rail, { key: "Tab" })).toBe(false);
      expect(controls.title).toHaveFocus();
      expect(controls.title).toHaveAttribute("aria-expanded", "true");
      expect(controls.viewport.scrollTop).toBe(sample.expected);
      expect(controls.adjust).toHaveBeenCalledExactlyOnceWith(sample.expected);
      expect(controls.extent).toHaveBeenCalledOnce();
    });
  }

  for (const scrollHeight of [80, 100]) {
    it(`leaves a nonoverflow viewport of height ${scrollHeight} unmeasured`, /** Checks native no-scroll eligibility before reading panel extents. @returns Nothing. */ () => {
      render(<Deck />);
      const controls = measure(screen.getByRole("complementary"), 40, 60, 0, scrollHeight);
      fireEvent.keyDown(controls.rail, { key: "Tab" });
      expect(controls.title).toHaveFocus();
      expect(controls.extent).not.toHaveBeenCalled();
      expect(controls.adjust).not.toHaveBeenCalled();
      expect(controls.viewport.scrollTop).toBe(0);
    });
  }

  it("opens a closed deck before expanding, focusing and measuring its panel", /** Checks retained panel state and ShowPanel ordering. @returns Nothing. */ () => {
    render(<Deck />);
    const controls = measure(screen.getByRole("complementary"), 250, 180, 0);
    fireEvent.click(screen.getByRole("button", { name: "Close Sidebar Deck" }));
    expect(controls.rail).toHaveAttribute("aria-pressed", "false");
    controls.rail.focus();
    fireEvent.keyDown(controls.rail, { key: "Tab" });
    expect(controls.rail).toHaveAttribute("aria-pressed", "true");
    expect(controls.title).toHaveFocus();
    expect(controls.viewport.scrollTop).toBe(250);
  });

  it("adjusts only the panel and scrollport belonging to its own deck", /** Checks geometry and focus ownership with matching panel names. @returns Nothing. */ () => {
    render(
      <>
        <Deck name="Left" />
        <Deck name="Right" />
      </>,
    );
    const left = measure(screen.getByRole("complementary", { name: "Left" }), 250, 60, 0);
    const rightRoot = screen.getByRole("complementary", { name: "Right" });
    const rightPanel = within(rightRoot).getByRole("region", { name: "Paragraph" });
    expect(rightPanel).not.toBe(left.panel);
    const right = measure(rightRoot, 250, 60, 0);
    fireEvent.keyDown(right.rail, { key: "Tab" });
    expect(right.title).toHaveFocus();
    expect(right.viewport.scrollTop).toBe(208);
    expect(left.viewport.scrollTop).toBe(0);
    expect(left.adjust).not.toHaveBeenCalled();
    expect(left.extent).not.toHaveBeenCalled();
  });
});

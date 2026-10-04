/** @fileoverview Checks native panel expansion, retained content and title entry with owned widgets. */
import { useEffect, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SidebarPanel } from "./SidebarPanel";

/** Supplies content with observable lifetime and an owned draft. @param props - Lifetime observers. @param props.mount - Mount observer. @param props.dispose - Disposal observer. @returns Owned input. */
function Content({
  mount,
  dispose,
}: {
  readonly mount: () => void;
  readonly dispose: () => void;
}): React.JSX.Element {
  const [value, setValue] = useState("Owned value");
  useEffect(
    /** Observes the retained child lifetime. @returns Disposal observer. */ () => {
      mount();
      return dispose;
    },
    [mount, dispose],
  );
  return (
    <input
      aria-label="Owned field"
      onChange={
        /** Updates the retained draft. @param event - Input event. @returns Nothing. */ (event) =>
          setValue(event.target.value)
      }
      value={value}
    />
  );
}

describe("sidebar panel expansion", /** Groups native retained-content and title-entry contracts. @returns Nothing. */ () => {
  it("keeps contents mounted, toolbar available and state stable through reprojection", /** Checks collapse changes visibility rather than child ownership. @returns Nothing. */ function retainsPanelContent(): void {
    const mount = vi.fn(),
      dispose = vi.fn(),
      focusContent = vi.fn();
    const { rerender, unmount } = render(
      <SidebarPanel
        title="Paragraph"
        focusContent={focusContent}
        moreOptions={<button>More Options</button>}
      >
        <Content mount={mount} dispose={dispose} />
      </SidebarPanel>,
    );
    const field = screen.getByLabelText("Owned field");
    fireEvent.change(field, { target: { value: "Retained draft" } });
    fireEvent.click(screen.getByRole("button", { name: "Paragraph" }));
    expect(field).not.toBeVisible();
    expect(screen.getByRole("button", { name: "More Options" })).toBeVisible();
    rerender(
      <SidebarPanel
        title="Changed title"
        focusContent={focusContent}
        initiallyExpanded
        moreOptions={<button>More Options</button>}
      >
        <Content mount={mount} dispose={dispose} />
      </SidebarPanel>,
    );
    const title = screen.getByRole("button", { name: "Changed title" });
    expect(title).toHaveAttribute("aria-expanded", "false");
    expect(title).toHaveAttribute("aria-controls", field.parentElement?.id);
    fireEvent.click(title);
    expect(field).toBeVisible();
    expect(field).toHaveValue("Retained draft");
    expect(mount).toHaveBeenCalledOnce();
    expect(dispose).not.toHaveBeenCalled();
    expect(focusContent).not.toHaveBeenCalled();
    unmount();
    expect(dispose).toHaveBeenCalledOnce();
  });

  for (const moreOptions of [undefined, null]) {
    it(`accepts an initially collapsed panel with toolbar=${moreOptions}`, /** Checks source initial state and absent toolbar. @returns Nothing. */ function initializesCollapsedPanel(): void {
      render(
        <SidebarPanel
          title="Paragraph"
          initiallyExpanded={false}
          focusContent={vi.fn()}
          moreOptions={moreOptions}
        >
          <p>Panel content</p>
        </SidebarPanel>,
      );
      expect(screen.getByText("Panel content")).not.toBeVisible();
      expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Paragraph" }));
      expect(screen.getByText("Panel content")).toBeVisible();
    });
  }

  for (const initiallyExpanded of [false, true]) {
    it(`Enter opens before child focus from expanded=${initiallyExpanded}`, /** Checks native title Return never toggles an open panel closed. @returns Nothing. */ function entersPanelContent(): void {
      const focusContent = vi.fn(
        /** Observes visible retained content before moving focus. @returns Nothing. */ () => {
          const field = screen.getByLabelText("Owned field");
          expect(field).toBeVisible();
          field.focus();
        },
      );
      render(
        <SidebarPanel
          title="Paragraph"
          focusContent={focusContent}
          initiallyExpanded={initiallyExpanded}
        >
          <input aria-label="Owned field" />
        </SidebarPanel>,
      );
      const title = screen.getByRole("button", { name: "Paragraph" });
      title.focus();
      expect(fireEvent.keyDown(title, { key: "Enter" })).toBe(false);
      expect(title).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByLabelText("Owned field")).toHaveFocus();
      expect(focusContent).toHaveBeenCalledOnce();
    });
  }

  it("preserves other title keys and local panel content input", /** Checks this title route does not replace the wider FocusManager. @returns Nothing. */ function preservesOtherPanelKeys(): void {
    const focusContent = vi.fn();
    render(
      <SidebarPanel title="Paragraph" focusContent={focusContent}>
        <input aria-label="Owned field" />
      </SidebarPanel>,
    );
    const title = screen.getByRole("button", { name: "Paragraph" });
    for (const key of [" ", "Tab", "Escape", "ArrowDown"])
      expect(fireEvent.keyDown(title, { key })).toBe(true);
    expect(fireEvent.keyDown(screen.getByLabelText("Owned field"), { key: "Enter" })).toBe(true);
    expect(focusContent).not.toHaveBeenCalled();
    expect(title).toHaveAttribute("aria-expanded", "true");
  });
});

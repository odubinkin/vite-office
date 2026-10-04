/** @fileoverview Checks native-shaped deck state and document focus using owned content. */
import { useEffect, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SidebarDeck } from "./SidebarDeck";

/** Mounts owned content that records lifetime and retains its value. @param props - Lifetime callbacks. @param props.mount - Mount observation. @param props.dispose - Cleanup observation. @returns Owned input. */
function StatefulContent({
  mount,
  dispose,
}: {
  readonly mount: () => void;
  readonly dispose: () => void;
}): React.JSX.Element {
  const [value, setValue] = useState("Owned paragraph");
  useEffect(
    /** Observes the mounted content lifetime. @returns Cleanup observation. */ () => {
      mount();
      return dispose;
    },
    [mount, dispose],
  );
  return (
    <input
      aria-label="Owned panel value"
      onChange={
        /** Updates owned state. @param event - Input change. @returns Nothing. */ (event) =>
          setValue(event.target.value)
      }
      value={value}
    />
  );
}

describe("sidebar deck close and activation", /** Groups source-owned deck lifecycle checks. @returns Nothing. */ () => {
  it("keeps the rail and mounted content when closing and reopens after document focus", /** Checks independent deck lifecycle, retained state and callback ordering. @returns Nothing. */ function retainsDeckContent(): void {
    const mount = vi.fn();
    const dispose = vi.fn();
    const focusDocument = vi.fn(
      /** Observes state before activation changes it. @returns Nothing. */ () =>
        expect(screen.getByLabelText("Owned panel value")).not.toBeVisible(),
    );
    const { rerender, unmount } = render(
      <SidebarDeck ariaLabel="Owned Sidebar" title="Properties" focusDocument={focusDocument}>
        <StatefulContent mount={mount} dispose={dispose} />
      </SidebarDeck>,
    );
    const input = screen.getByLabelText("Owned panel value");
    fireEvent.change(input, { target: { value: "Retained draft" } });
    const close = screen.getByRole("button", { name: "Close Sidebar Deck" });
    fireEvent.click(close);
    fireEvent.click(close);
    expect(input).not.toBeVisible();
    expect(screen.getByRole("complementary", { name: "Owned Sidebar" })).toBeVisible();
    const activation = screen.getByRole("button", { name: "Properties" });
    expect(activation).toHaveAttribute("aria-pressed", "false");
    expect(focusDocument).not.toHaveBeenCalled();
    fireEvent.click(activation);
    expect(input).toBeVisible();
    expect(input).toHaveValue("Retained draft");
    expect(activation).toHaveAttribute("aria-pressed", "true");
    expect(mount).toHaveBeenCalledTimes(1);
    expect(dispose).not.toHaveBeenCalled();
    rerender(
      <SidebarDeck ariaLabel="Owned Sidebar" title="Changed title" focusDocument={focusDocument}>
        <StatefulContent mount={mount} dispose={dispose} />
      </SidebarDeck>,
    );
    expect(screen.getByRole("button", { name: "Changed title" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(input).toHaveValue("Retained draft");
    unmount();
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it("activating the selected deck closes it after returning document focus", /** Checks native toggle and focus ordering from an open deck. @returns Nothing. */ function togglesSelectedDeck(): void {
    const focusDocument = vi.fn(
      /** Observes open state before the toggle. @returns Nothing. */ () =>
        expect(screen.getByText("Panel content")).toBeVisible(),
    );
    render(
      <SidebarDeck ariaLabel="Owned Sidebar" title="Properties" focusDocument={focusDocument}>
        <p>Panel content</p>
      </SidebarDeck>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Properties" }));
    expect(focusDocument).toHaveBeenCalledOnce();
    expect(screen.getByText("Panel content")).not.toBeVisible();
  });

  for (const control of ["Close Sidebar Deck", "Properties"]) {
    it(`Escape from ${control} returns to the document without closing the deck`, /** Checks native deck-toolbox and tab-bar cancellation. @returns Nothing. */ function cancelsDeckFocus(): void {
      const focusDocument = vi.fn();
      render(
        <SidebarDeck ariaLabel="Owned Sidebar" title="Properties" focusDocument={focusDocument}>
          <p>Panel content</p>
        </SidebarDeck>,
      );
      const button = screen.getByRole("button", { name: control });
      expect(fireEvent.keyDown(button, { key: "Escape", ctrlKey: true })).toBe(false);
      expect(focusDocument).toHaveBeenCalledOnce();
      expect(screen.getByText("Panel content")).toBeVisible();
      expect(fireEvent.keyDown(button, { key: "ArrowRight" })).toBe(true);
      expect(focusDocument).toHaveBeenCalledOnce();
    });
  }

  it("collapsed rail Escape does not reopen and content cancellation stays local", /** Checks key routing does not hijack panel content. @returns Nothing. */ function preservesContentKeys(): void {
    const focusDocument = vi.fn();
    render(
      <SidebarDeck ariaLabel="Owned Sidebar" title="Properties" focusDocument={focusDocument}>
        <input aria-label="Panel field" />
      </SidebarDeck>,
    );
    expect(fireEvent.keyDown(screen.getByLabelText("Panel field"), { key: "Escape" })).toBe(true);
    expect(focusDocument).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Close Sidebar Deck" }));
    expect(
      fireEvent.keyDown(screen.getByRole("button", { name: "Properties" }), { key: "Escape" }),
    ).toBe(false);
    expect(screen.getByLabelText("Panel field")).not.toBeVisible();
    expect(focusDocument).toHaveBeenCalledOnce();
  });

  it("standalone chrome can toggle and cancel without a document callback", /** Checks optional standalone presentation ownership. @returns Nothing. */ function supportsUnownedChrome(): void {
    render(
      <SidebarDeck ariaLabel="Owned Sidebar" title="Properties">
        <p>Panel content</p>
      </SidebarDeck>,
    );
    const activation = screen.getByRole("button", { name: "Properties" });
    fireEvent.keyDown(activation, { key: "Escape" });
    fireEvent.click(activation);
    expect(screen.getByText("Panel content")).not.toBeVisible();
    fireEvent.click(activation);
    expect(screen.getByText("Panel content")).toBeVisible();
  });
});

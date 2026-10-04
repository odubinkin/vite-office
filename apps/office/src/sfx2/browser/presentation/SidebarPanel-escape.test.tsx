/** @fileoverview Checks native panel Escape boundaries with owned browser controls. */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SidebarPanel } from "./SidebarPanel";

describe("sidebar panel Escape", /** Groups source-shaped cancellation boundaries. @returns Nothing. */ () => {
  for (const initiallyExpanded of [false, true]) {
    for (const control of ["Paragraph", "More Options"]) {
      it(`returns ${control} to the document from expanded=${initiallyExpanded}`, /** Checks native header cancellation retains expansion and content. @returns Nothing. */ function cancelsPanelHeader(): void {
        const focusContent = vi.fn();
        const focusDocument = vi.fn(
          /** Focuses the actual owning input. @returns Nothing. */ () =>
            screen.getByLabelText("Document").focus(),
        );
        render(
          <>
            <input aria-label="Document" />
            <SidebarPanel
              title="Paragraph"
              focusContent={focusContent}
              focusDocument={focusDocument}
              initiallyExpanded={initiallyExpanded}
              moreOptions={<button>More Options</button>}
            >
              <input aria-label="Draft" defaultValue="Retained value" />
            </SidebarPanel>
          </>,
        );
        const title = screen.getByRole("button", { name: "Paragraph" });
        const draft = screen.getByLabelText("Draft");
        const button = screen.getByRole("button", { name: control });
        button.focus();
        expect(fireEvent.keyDown(button, { key: "Escape" })).toBe(false);
        expect(screen.getByLabelText("Document")).toHaveFocus();
        expect(title).toHaveAttribute("aria-expanded", String(initiallyExpanded));
        expect(draft).toHaveValue("Retained value");
        expect(draft.parentElement?.hidden).toBe(!initiallyExpanded);
        expect(focusDocument).toHaveBeenCalledOnce();
        expect(focusContent).not.toHaveBeenCalled();
      });
    }
  }

  it("returns content to its visible title and preserves the retained draft", /** Checks content Escape is a distinct first stage. @returns Nothing. */ function cancelsPanelContent(): void {
    const focusContent = vi.fn(),
      focusDocument = vi.fn();
    render(
      <SidebarPanel title="Paragraph" focusContent={focusContent} focusDocument={focusDocument}>
        <input aria-label="Draft" defaultValue="Retained value" />
      </SidebarPanel>,
    );
    const draft = screen.getByLabelText("Draft");
    fireEvent.change(draft, { target: { value: "Changed draft" } });
    draft.focus();
    expect(
      fireEvent.keyDown(draft, { key: "Escape", ctrlKey: true, altKey: true, shiftKey: true }),
    ).toBe(false);
    const title = screen.getByRole("button", { name: "Paragraph" });
    expect(title).toHaveFocus();
    expect(title).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByLabelText("Draft")).toBe(draft);
    expect(draft).toHaveValue("Changed draft");
    expect(focusContent).not.toHaveBeenCalled();
    expect(focusDocument).not.toHaveBeenCalled();
  });

  it("preserves child-consumed cancellation in content and toolbar", /** Checks child widgets own already-consumed keys. @returns Nothing. */ function respectsChildCancellation(): void {
    const focusContent = vi.fn(),
      focusDocument = vi.fn();
    const consume =
      /** Keeps cancellation inside the child widget. @param event - Child key input. @returns Nothing. */ (
        event: React.KeyboardEvent<HTMLElement>,
      ): void => event.preventDefault();
    render(
      <SidebarPanel
        title="Paragraph"
        focusContent={focusContent}
        focusDocument={focusDocument}
        moreOptions={<button onKeyDown={consume}>More Options</button>}
      >
        <input aria-label="Draft" onKeyDown={consume} />
      </SidebarPanel>,
    );
    for (const child of [
      screen.getByLabelText("Draft"),
      screen.getByRole("button", { name: "More Options" }),
    ]) {
      child.focus();
      fireEvent.keyDown(child, { key: "Escape" });
      expect(child).toHaveFocus();
    }
    expect(focusContent).not.toHaveBeenCalled();
    expect(focusDocument).not.toHaveBeenCalled();
  });
});

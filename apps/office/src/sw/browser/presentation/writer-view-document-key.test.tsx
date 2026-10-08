/** @fileoverview Checks the Writer frame's direct document focus key using owned sessions. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];

afterEach(
  /** Releases browser listeners before closing owned sessions. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);

/** Mounts one actual Writer frame. @param active - Initial frame eligibility. @param name - Frame identity. @returns Frame controls. */
function mountFrame(active = true, name = "first") {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const fileDialogs = session.fileDialogs;
  const tree =
    /** Renders a frame with stable session ownership. @param isActive - Frame visibility. @returns View. */ (
      isActive: boolean,
    ) => (
      <section aria-label={`${name} frame`}>
        <WriterWorkbench
          fileDialogs={fileDialogs}
          isActive={isActive}
          services={session.services}
          view={session.view}
        />
      </section>
    );
  const rendered = render(tree(active));
  const frame = within(screen.getByLabelText(`${name} frame`));
  return {
    session,
    fileDialogs,
    frame,
    editor: frame.getByLabelText("Writer document body"),
    owner: frame.getByRole("combobox", { name: "Paragraph style", hidden: true }),
    unmount: rendered.unmount,
    setActive:
      /** Updates only frame eligibility. @param next - Next active state. @returns Nothing. */ (
        next: boolean,
      ) => rendered.rerender(tree(next)),
  };
}

/** Dispatches the frame key without invoking upstream. @param options - Browser event overrides. @returns Key event. */
function pressDocumentKey(options: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent("keydown", {
    key: "F6",
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  act(
    /** Delivers the native browser event. @returns Nothing. */ () => {
      window.dispatchEvent(event);
    },
  );
  return event;
}

describe("Writer direct document key", /** Groups frame focus routing. @returns Nothing. */ () => {
  it("focuses the document directly from its formatting toolbar", /** Checks native direct client routing. @returns Nothing. */ function focusesDocumentClient(): void {
    const fixture = mountFrame();
    fixture.owner.focus();
    const execute = vi.spyOn(fixture.session.view.GetViewFrame().GetDispatcher(), "Execute");
    expect(pressDocumentKey().defaultPrevented).toBe(true);
    expect(fixture.editor).toHaveFocus();
    expect(execute).not.toHaveBeenCalled();
  });

  for (const origin of ["root", "popup", "child"] as const) {
    it(`discards saved toolbar focus and closes the ${origin} menu cycle`, /** Checks explicit document focus wins over saved owner. @returns Nothing. */ function closesMenuToDocument(): void {
      const fixture = mountFrame();
      fixture.owner.focus();
      if (origin === "root") pressDocumentKey({ key: "F10", ctrlKey: false });
      else {
        fireEvent.click(fixture.frame.getByRole("button", { name: "View" }));
        if (origin === "child")
          fireEvent.keyDown(fixture.frame.getByRole("menuitem", { name: "Rulers" }), {
            key: "ArrowRight",
          });
      }
      const execute = vi.spyOn(fixture.session.view.GetViewFrame().GetDispatcher(), "Execute");
      pressDocumentKey();
      expect(fixture.editor).toHaveFocus();
      expect(fixture.frame.queryByRole("menu")).not.toBeInTheDocument();
      expect(execute).not.toHaveBeenCalled();
      expect(fixture.frame.getByLabelText("Writer horizontal ruler")).toBeInTheDocument();
      pressDocumentKey({ key: "F10", ctrlKey: false });
      expect(fixture.frame.getByRole("button", { name: "File" })).toHaveFocus();
      pressDocumentKey({ key: "F10", ctrlKey: false });
      expect(fixture.editor).toHaveFocus();
    });
  }

  for (const options of [{ altKey: true }, { metaKey: true }]) {
    it(`retains the native direct-key condition with ${JSON.stringify(options)}`, /** Checks SystemWindow's independent Ctrl/non-Shift condition. @returns Nothing. */ function retainsDirectKeyShape(): void {
      const fixture = mountFrame();
      fixture.owner.focus();
      expect(pressDocumentKey(options).defaultPrevented).toBe(true);
      expect(fixture.editor).toHaveFocus();
    });
  }

  for (const options of [
    { ctrlKey: false },
    { shiftKey: true },
    { ctrlKey: false, shiftKey: true },
    { ctrlKey: false, metaKey: true },
    { key: "F7" },
  ]) {
    it(`leaves ${JSON.stringify(options)} to its current owner`, /** Checks this route does not invent pane cycling. @returns Nothing. */ function preservesOtherKeys(): void {
      const fixture = mountFrame();
      fixture.owner.focus();
      expect(pressDocumentKey(options).defaultPrevented).toBe(false);
      expect(fixture.owner).toHaveFocus();
    });
  }

  it("preserves a previously consumed document key", /** Checks event ownership. @returns Nothing. */ function preservesConsumedKey(): void {
    const fixture = mountFrame();
    fixture.owner.focus();
    const event = new KeyboardEvent("keydown", { key: "F6", ctrlKey: true, cancelable: true });
    event.preventDefault();
    act(
      /** Delivers an already handled key. @returns Nothing. */ () => {
        window.dispatchEvent(event);
      },
    );
    expect(fixture.owner).toHaveFocus();
  });

  it("routes only to the current frame and observes active changes", /** Checks mounted frame ownership. @returns Nothing. */ function routesActiveFrame(): void {
    const first = mountFrame(false);
    const second = mountFrame(true, "second");
    second.owner.focus();
    pressDocumentKey();
    expect(second.editor).toHaveFocus();
    second.setActive(false);
    first.setActive(true);
    first.owner.focus();
    pressDocumentKey();
    expect(first.editor).toHaveFocus();
  });

  it("removes the direct-document listener with its view", /** Checks listener disposal. @returns Nothing. */ function removesFrameListener(): void {
    const fixture = mountFrame();
    fixture.unmount();
    expect(pressDocumentKey().defaultPrevented).toBe(false);
  });

  for (const kind of [
    "paragraph",
    "hyperlink",
    "bookmark",
    "break",
    "page",
    "table",
    "line",
    "open",
    "save-as",
    "export",
  ] as const) {
    it(`keeps the ${kind} modal's focus and resumes after cancellation`, /** Checks every existing modal eligibility owner. @returns Nothing. */ function preservesModalFocus(): void {
      const fixture = mountFrame();
      if (kind === "paragraph" || kind === "page") {
        fireEvent.click(fixture.frame.getByRole("button", { name: "Format" }));
        fireEvent.click(
          fixture.frame.getByRole("menuitem", {
            name: kind === "paragraph" ? /Paragraph/ : /Page Style/,
          }),
        );
      } else if (kind === "hyperlink" || kind === "bookmark") {
        const toolbar = fixture.frame.getByRole("toolbar", { name: "Writer standard toolbar" });
        fireEvent.click(
          within(toolbar).getByRole("button", {
            name: kind === "hyperlink" ? "Hyperlink" : "Bookmark",
          }),
        );
      } else if (kind === "break") {
        fireEvent.click(fixture.frame.getByRole("button", { name: "Insert" }));
        fireEvent.mouseEnter(fixture.frame.getByRole("menuitem", { name: "More Breaks" }));
        fireEvent.click(fixture.frame.getByRole("menuitem", { name: /Manual Break/ }));
      } else if (kind === "table") {
        act(
          /** Opens the registered browser table modal. @returns Nothing. */ () => {
            fixture.session.view
              .GetViewFrame()
              .GetDispatcher()
              .Execute(WRITER_COMMAND_IDS.insertTable);
          },
        );
      } else if (kind === "line") {
        fireEvent.click(fixture.frame.getByRole("button", { name: "Tools" }));
        fireEvent.click(fixture.frame.getByRole("menuitem", { name: /Line Numbering/ }));
      } else
        act(
          /** Requests an owned browser file modal. @returns Nothing. */ () =>
            fixture.fileDialogs.Show(kind),
        );
      const dialog = fixture.frame.getByRole("dialog");
      const actionPanel =
        kind === "bookmark" ? dialog.querySelector<HTMLElement>(".writer-dialog-actions") : dialog;
      if (actionPanel === null) throw new Error("Missing native bookmark action area");
      const cancel = within(actionPanel).getByRole("button", {
        name: ["bookmark", "open", "save-as", "export"].includes(kind) ? "Close" : "Cancel",
      });
      cancel.focus();
      expect(pressDocumentKey().defaultPrevented).toBe(false);
      expect(cancel).toHaveFocus();
      fireEvent.click(cancel);
      fixture.owner.focus();
      expect(pressDocumentKey().defaultPrevented).toBe(true);
      expect(fixture.editor).toHaveFocus();
    });
  }
});

/** @fileoverview Checks actual mounted hyperlink editing retains independent original equal-URL hint ranges and native undo/redo. */
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases mounted native view owners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
it("mounted Edit Hyperlink changes one original equal neighbor with actual history", /** Checks dialog command execution and rendered independent native portions. @returns Completion. */ async () => {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const node = session.docShell.GetDoc().paragraphs[0];
  if (node === undefined) throw Error("Missing body");
  node.SetText("abcdef");
  node.SetHyperlink(0, 3, { url: "https://example.test/same" });
  node.SetHyperlink(3, 6, { url: "https://example.test/same" });
  session.docShell.GetDoc().GetUndoManager().Clear();
  const mounted = render(
      <WriterWorkbench
        isActive
        view={session.view}
        fileDialogs={session.fileDialogs}
        services={session.services}
      />,
    ),
    shell = session.view.GetWrtShell();
  const point = new SwPosition(node, 1);
  act(
    /** Assigns original native caret. @returns Nothing. */ () => {
      shell.SetPaM(point);
    },
  );
  point.Dispose();
  fireEvent.click(screen.getByRole("menuitem", { name: /^Edit$/ }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Hyperlink…" }));
  const url = await screen.findByLabelText("URL");
  fireEvent.change(url, { target: { value: "https://example.test/changed" } });
  fireEvent.click(screen.getByRole("button", { name: /^Apply$/ }));
  await waitFor(
    /** Checks actual original boundary rendering. @returns Nothing. */ () => {
      expect(
        mounted.container.querySelector('a[href="https://example.test/changed"]')?.textContent,
      ).toBe("abc");
      expect(
        mounted.container.querySelector('a[href="https://example.test/same"]')?.textContent,
      ).toBe("def");
    },
  );
  expect(node.GetText()).toBe("abcdef");
  expect(shell.GetCursor().GetPoint().GetNode()).toBe(node);
  expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(1);
  for (let cycle = 0; cycle < 3; cycle++) {
    act(
      /** Replays actual native undo. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    await waitFor(
      /** Checks original equal metadata rendering. @returns Nothing. */ () => {
        expect(
          mounted.container.querySelectorAll('a[href="https://example.test/changed"]'),
        ).toHaveLength(0);
        expect(
          [...mounted.container.querySelectorAll('a[href="https://example.test/same"]')]
            .map(
              /** Reads original rendered text. @param link - Native hint portion. @returns Text. */ (
                link,
              ) => link.textContent,
            )
            .join(""),
        ).toBe("abcdef");
      },
    );
    act(
      /** Replays actual native redo. @returns Nothing. */ () => {
        expect(shell.Redo()).toBe(true);
      },
    );
    await waitFor(
      /** Checks retained neighboring link rendering. @returns Nothing. */ () => {
        expect(
          mounted.container.querySelector('a[href="https://example.test/changed"]')?.textContent,
        ).toBe("abc");
        expect(
          mounted.container.querySelector('a[href="https://example.test/same"]')?.textContent,
        ).toBe("def");
      },
    );
  }
});

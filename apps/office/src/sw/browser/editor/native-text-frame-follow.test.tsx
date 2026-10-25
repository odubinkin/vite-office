/** @fileoverview Checks native original follow-chain lifetime behind actual React editing and history. */
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwLineNumberInfo } from "../../inc/lineinfo";
import { createDefaultWriterPageDescriptor } from "../../../test/writer-page-descriptor";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases actual React subscriptions and native root ownership. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
it("React editing retires original measured follow clients and keeps native node/history ownership", /** Checks actual production view and shell against device-shaped core input without mocked owners. @returns Completion. */ async () => {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    node = doc.paragraphs[0];
  if (node === undefined) throw Error("Missing original body");
  node.SetText("abcdefghi");
  const mounted = render(
    <WriterWorkbench
      isActive
      view={session.view}
      fileDialogs={session.fileDialogs}
      services={session.services}
    />,
  );
  const element = screen
    .getAllByRole("textbox")
    .find(
      /** Finds actual original body text. @param host - Mounted input. @returns Whether target owner. */ (
        host,
      ) => host.textContent === "abcdefghi",
    );
  if (element === undefined) throw Error("Missing native mounted text");
  const shell = session.view.GetWrtShell();
  act(
    /** Places the actual native caret before measuring original follow ownership. @returns Nothing. */ () => {
      expect(shell.StartOfSection()).toBe(true);
    },
  );
  const page = {
      ...createDefaultWriterPageDescriptor("en-GB").GetValue(),
      height: 1000,
      topMargin: 100,
      bottomMargin: 100,
    },
    root = session.view.GetLayout();
  // Device-shaped geometry is public core input; browser shaping itself is checked in Chromium.
  const measured = root.Format(
    [
      {
        id: "body",
        lines: [
          { start: 0, end: 3, height: 500 },
          { start: 3, end: 6, height: 500 },
          { start: 6, end: 9, height: 500 },
        ],
      },
    ],
    page,
    undefined,
    new SwLineNumberInfo().QueryValue(),
    1,
  );
  const frames = measured.pages.flatMap(
    /** Reads original physical clients. @param physical - Native page snapshot. @returns Original frame clients. */ (
      physical,
    ) => physical.textFrames,
  );
  expect(frames).toHaveLength(3);
  expect(frames[0]?.GetFollow()).toBe(frames[1]);
  expect(frames[1]?.GetFollow()).toBe(frames[2]);
  expect(frames[2]?.GetPrecede()).toBe(frames[1]);
  expect(frames[2]?.GetTextNodeFirst()).toBe(node);
  act(
    /** Edits through the original native shell. @returns Nothing. */ () => {
      expect(shell.Insert("X")).toBe(true);
    },
  );
  expect(node.GetText()).toBe("Xabcdefghi");
  expect(element).toHaveTextContent("Xabcdefghi");
  await waitFor(
    /** Waits for actual React-driven reformat to release old native clients. @returns Assertion result. */ () =>
      expect(frames[0]?.IsInDtor()).toBe(true),
  );
  expect(frames[1]?.IsInDtor()).toBe(true);
  expect(frames[2]?.IsInDtor()).toBe(true);
  act(
    /** Undoes through actual original model history. @returns Nothing. */ () => {
      expect(shell.Undo()).toBe(true);
    },
  );
  expect(element).toHaveTextContent("abcdefghi");
  expect(doc.paragraphs[0]).toBe(node);
  act(
    /** Replays the original native edit. @returns Nothing. */ () => {
      expect(shell.Redo()).toBe(true);
    },
  );
  expect(element).toHaveTextContent("Xabcdefghi");
  mounted.unmount();
  session.Close();
  expect(frames[0]?.GetRegisteredIn()).toBeUndefined();
  expect(frames[1]?.GetRegisteredIn()).toBeUndefined();
  expect(frames[2]?.GetRegisteredIn()).toBeUndefined();
});

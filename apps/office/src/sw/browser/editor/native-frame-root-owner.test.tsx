/** @fileoverview Checks original native Root and derived-format lifetime behind mounted Writer editing and history. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwFrame, SwLayoutFrame, SwFrameType } from "../../source/core/layout/wsfrm";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases actual React and native view owners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
it("mounted Writer edits and history retain the original native Root until view close", /** Checks production render and native ownership without substituted layout. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    node = doc.paragraphs[0],
    root = session.view.GetLayout(),
    format = root.GetFormat(),
    parent = doc.GetDfltFrameFormat();
  if (node === undefined) throw Error("Missing original body");
  node.SetText("RootOwner");
  const mounted = render(
    <WriterWorkbench
      isActive
      view={session.view}
      fileDialogs={session.fileDialogs}
      services={session.services}
    />,
  );
  expect(root).toBeInstanceOf(SwLayoutFrame);
  expect(root.GetType()).toBe(SwFrameType.Root);
  expect(root.getRootFrame()).toBe(root);
  expect(root.GetRegisteredIn()).toBe(format);
  expect(format.DerivedFrom()).toBe(parent);
  const frames: SwFrame[] = [];
  node.ForAllListeners(
    /** Reads actual mounted native clients. @param client - Original registered listener. @returns Continue. */ (
      client,
    ) => {
      if (client instanceof SwFrame) frames.push(client);
      return false;
    },
  );
  expect(frames.length).toBeGreaterThan(0);
  for (const frame of frames) expect(frame.getRootFrame()).toBe(root);
  const element = screen
    .getAllByRole("textbox")
    .find(
      /** Finds mounted original text. @param host - Actual input. @returns Whether original body. */ (
        host,
      ) => host.textContent === "RootOwner",
    );
  if (element === undefined) throw Error("Missing native input");
  const shell = session.view.GetWrtShell();
  act(
    /** Places and edits actual native caret. @returns Nothing. */ () => {
      expect(shell.StartOfSection()).toBe(true);
      expect(shell.Insert("X")).toBe(true);
    },
  );
  expect(element).toHaveTextContent("XRootOwner");
  expect(session.view.GetLayout()).toBe(root);
  expect(root.GetFormat()).toBe(format);
  act(
    /** Undoes original edit. @returns Nothing. */ () => {
      expect(shell.Undo()).toBe(true);
    },
  );
  expect(element).toHaveTextContent("RootOwner");
  act(
    /** Replays original edit. @returns Nothing. */ () => {
      expect(shell.Redo()).toBe(true);
    },
  );
  expect(element).toHaveTextContent("XRootOwner");
  expect(doc.paragraphs[0]).toBe(node);
  mounted.unmount();
  session.Close();
  expect(root.IsInDtor()).toBe(true);
  expect(root.GetRegisteredIn()).toBeUndefined();
  expect(format.IsDisposed()).toBe(true);
  expect(parent.IsDisposed()).toBe(false);
  session.Close();
  expect(parent.IsDisposed()).toBe(false);
});

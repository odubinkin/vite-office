/** @fileoverview Checks actual Writer menu state reads complete native internet items and native caret expansion flags. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
import { SwpHints } from "../../source/core/txtnode/ndhints";
import { SwTextINetFormat } from "../../source/core/txtnode/txtatr2";
import { SwFormatINetFormat } from "../../source/core/txtnode/fmtatr2";
import type { SwPoolFormatId } from "../../inc/poolfmt";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases mounted actual owners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
it("mounted Edit Hyperlink is disabled for equal URLs with different native style IDs", /** Checks native mixed state reaches the actual menu without metadata flattening. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    node = doc.paragraphs[0];
  if (node === undefined) throw Error("Missing native body");
  node.SetText("abcdef");
  const first = new SwFormatINetFormat({ url: "https://example.test/same" }),
    second = first.Clone();
  first.SetINetFormatAndId("", 65000 as SwPoolFormatId);
  second.SetINetFormatAndId("", 64000 as SwPoolFormatId);
  node.SetTextHints(
    new SwpHints(doc.GetAttrPool(), [
      new SwTextINetFormat(first, 0, 3),
      new SwTextINetFormat(second, 3, 6),
    ]),
  );
  render(
    <WriterWorkbench
      isActive
      view={session.view}
      fileDialogs={session.fileDialogs}
      services={session.services}
    />,
  );
  const point = new SwPosition(node, 6),
    mark = new SwPosition(node, 0);
  try {
    act(
      /** Assigns actual original selection. @returns Nothing. */ () => {
        session.view.GetWrtShell().SetPaM(point, mark);
      },
    );
  } finally {
    point.Dispose();
    mark.Dispose();
  }
  fireEvent.click(screen.getByRole("button", { name: /^Edit$/ }));
  expect(screen.getByRole("menuitem", { name: "Hyperlink…" })).toBeDisabled();
});
it("mounted hyperlink state honors the original end-expansion flag", /** Checks native caret inheritance controls actual UI enablement. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const node = session.docShell.GetDoc().paragraphs[0];
  if (node === undefined) throw Error("Missing native body");
  node.SetText("abc");
  node.SetHyperlink(0, 3, { url: "https://example.test/end" });
  render(
    <WriterWorkbench
      isActive
      view={session.view}
      fileDialogs={session.fileDialogs}
      services={session.services}
    />,
  );
  const point = new SwPosition(node, 3);
  try {
    act(
      /** Assigns actual end caret. @returns Nothing. */ () => {
        session.view.GetWrtShell().SetPaM(point);
      },
    );
  } finally {
    point.Dispose();
  }
  fireEvent.click(screen.getByRole("button", { name: /^Edit$/ }));
  expect(screen.getByRole("menuitem", { name: "Hyperlink…" })).toBeDisabled();
});

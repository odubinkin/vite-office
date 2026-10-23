/** @fileoverview Source Character Position toolbar over actual Writer native frame, original numbering and complete escapement history. */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SvxEscapementItem } from "../../../editeng/inc/escapementitem";
import { RES_CHRATR_ESCAPEMENT } from "../../inc/hintids";
import { applyWriterParagraphList } from "../../source/core/doc/list";
import { SwPosition } from "../../source/core/crsr/pam";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases actual mounted UI and frame owners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
    vi.restoreAllMocks();
  },
);
it("binds original super/sub pair, body/numbering font and native exclusive state/history", /** Only missing jsdom platform font metrics are supplied. @returns Nothing. */ () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    font: "",
    measureText: vi.fn(
      /** Supplies the actual browser font measurement port. @returns Device values. */ () => ({
        width: 20,
        fontBoundingBoxAscent: 12,
        fontBoundingBoxDescent: 4,
      }),
    ),
  } as unknown as CanvasRenderingContext2D);
  const actual = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation(
    /** Supplies missing font inheritance only. @param element - Actual span. @param pseudo - Requested pseudo. @returns Platform font style. */ (
      element,
      pseudo,
    ) => {
      const style = actual(element, pseudo);
      if (element.hasAttribute("data-native-escapement")) {
        style.fontSize = "16px";
        style.fontFamily = "Liberation Serif";
        style.fontStyle = "normal";
        style.fontWeight = "400";
      }
      return style;
    },
  );
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell(),
    node = shell.GetDoc().paragraphs[0];
  if (!node) throw new Error("Missing text node");
  node.SetText("Positioned number and text");
  node.SetAttr(new SvxEscapementItem(14000, 58, RES_CHRATR_ESCAPEMENT));
  applyWriterParagraphList(node, { kind: "numbered", level: 0, ruleName: "Position" });
  const p = new SwPosition(node, node.Len()),
    m = new SwPosition(node, 0);
  shell.SetPaM(p, m);
  p.Dispose();
  m.Dispose();
  render(<WriterWorkbench isActive view={session.view} />);
  const group = within(
    screen.getByRole("complementary", { name: "Writer properties sidebar" }),
  ).getByRole("group", { name: "Character Position" });
  expect(
    within(group)
      .getAllByRole("button")
      .map(
        /** Reads actual source command labels. @param button - Native bound control. @returns Label. */ (
          button,
        ) => button.getAttribute("aria-label"),
      ),
  ).toEqual(["Superscript", "Subscript"]);
  const superButton = within(group).getByRole("button", { name: "Superscript" }),
    subButton = within(group).getByRole("button", { name: "Subscript" });
  expect(superButton).toHaveAttribute("aria-pressed", "true");
  expect(subButton).toHaveAttribute("aria-pressed", "false");
  expect(
    document.querySelector('[data-writer-list-label] [data-native-escapement="14000"]'),
  ).not.toBeNull();
  expect(
    screen
      .getByRole("textbox", { name: "Writer document text" })
      .querySelector('[data-native-escapement="14000"]'),
  ).not.toBeNull();
  fireEvent.click(subButton);
  expect(subButton).toHaveAttribute("aria-pressed", "true");
  expect(superButton).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  expect(superButton).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(screen.getByRole("button", { name: "Redo" }));
  expect(subButton).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(subButton);
  expect(subButton).toHaveAttribute("aria-pressed", "false");
});

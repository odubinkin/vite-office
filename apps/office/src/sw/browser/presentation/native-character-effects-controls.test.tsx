/** @fileoverview Connects native character items and original numbering font values to actual sidebar controls and rendering. */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SvxCrossedOutItem } from "../../../editeng/inc/crossedoutitem";
import { FontStrikeout as S } from "../../../tools/inc/fontenum";
import { RES_CHRATR_CROSSEDOUT as WHICH } from "../../inc/hintids";
import { applyWriterParagraphList } from "../../source/core/doc/list";
import { SwPosition } from "../../source/core/crsr/pam";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases mounted UI before actual native owners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
    vi.restoreAllMocks();
  },
);
it("paints actual native body/number decoration and preserves source effect order and history state", /** Uses real Writer frames and original command state;only the jsdom device font port is supplied. @returns Nothing. */ () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    font: "",
    fillRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(
      /** Supplies platform font dimensions. @returns Measured values. */ () => ({
        width: 20,
        fontBoundingBoxAscent: 12,
        fontBoundingBoxDescent: 4,
      }),
    ),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
    "data:image/png;base64,Device",
  );
  const realStyle = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation(
    /** Supplies only missing jsdom font inheritance for the actual device. @param element - Actual element. @param pseudo - Actual pseudo selector. @returns Platform style. */ (
      element,
      pseudo,
    ) => {
      const style = realStyle(element, pseudo);
      if (element.hasAttribute("data-native-strikeout")) {
        style.fontSize = "16px";
        style.fontFamily = "Liberation Serif";
        style.fontWeight = "400";
        style.fontStyle = "normal";
      }
      return style;
    },
  );
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell(),
    node = shell.GetDoc().paragraphs[0];
  if (!node) throw new Error("Missing original native text");
  node.SetText("Original numbered text");
  node.SetAttr(new SvxCrossedOutItem(S.STRIKEOUT_SINGLE, WHICH));
  applyWriterParagraphList(node, { kind: "numbered", level: 0, ruleName: "Effects" });
  const point = new SwPosition(node, node.Len()),
    mark = new SwPosition(node, 0);
  shell.SetPaM(point, mark);
  point.Dispose();
  mark.Dispose();
  render(<WriterWorkbench isActive view={session.view} />);
  const effects = within(
    screen.getByRole("complementary", { name: "Writer properties sidebar" }),
  ).getByRole("group", { name: "Font Effects" });
  expect(
    within(effects)
      .getAllByRole("button")
      .map(
        /** Reads actual source order. @param button - Actual command. @returns Label. */ (
          button,
        ) => button.getAttribute("aria-label"),
      ),
  ).toEqual(["Bold", "Italic", "Underline", "Strikethrough"]);
  const button = within(effects).getByRole("button", { name: "Strikethrough" });
  expect(button).toHaveAttribute("aria-pressed", "true");
  expect(
    screen
      .getByRole("textbox", { name: "Writer document text" })
      .querySelector('[data-native-strikeout="1"]'),
  ).not.toBeNull();
  expect(
    document.querySelector('[data-writer-list-label] [data-native-strikeout="1"]'),
  ).not.toBeNull();
  fireEvent.click(button);
  expect(button).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  expect(button).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(screen.getByRole("button", { name: "Redo" }));
  expect(button).toHaveAttribute("aria-pressed", "false");
});

/** @fileoverview Mounts a native Calc clipboard test session and isolates its browser clipboard. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { createCalcSession } from "../sc/browser/composition/calc-module";
import { CalcWorkbench } from "../sc/browser/presentation/calc-workbench";

/** Registers per-test cleanup and exposes the native clipboard controls. @returns Workbench fixture. */
export function createCalcClipboardFixture() {
  let active: ReturnType<typeof createCalcSession> | undefined;
  let restoreClipboard: (() => void) | undefined;
  afterEach(
    /** Disposes the Calc session and restores the clipboard descriptor. @returns Nothing. */ () => {
      cleanup();
      active?.Close();
      active = undefined;
      restoreClipboard?.();
      restoreClipboard = undefined;
    },
  );

  /** Mounts the actual Calc command frame and workbench. @returns Active view. */
  function mount() {
    active = createCalcSession();
    render(<CalcWorkbench {...active} />);
    return active.controller;
  }

  /** Provides native-shaped synchronous browser clipboard data without OS permissions. @param initial - Optional external plain text. @returns Transfer fixture. */
  function transfer(initial?: string) {
    const values = new Map<string, string>();
    if (initial !== undefined) values.set("text/plain", initial);
    return {
      /** Exposes the MIME types carried by the transfer. @returns Types. */
      get types() {
        return [...values.keys()];
      },
      getData:
        /** Reads one clipboard MIME flavor. @param type - MIME type. @returns Clipboard text. */ (
          type: string,
        ) => values.get(type) ?? "",
      setData: vi.fn(
        /** Stores one clipboard MIME flavor. @param type - MIME type. @param value - Clipboard text. @returns Nothing. */ (
          type: string,
          value: string,
        ) => {
          values.set(type, value);
        },
      ),
    };
  }

  /** Returns the keyboard-focusable native grid. @returns Grid. */
  function grid(): HTMLElement {
    return screen.getByRole("grid", { name: "Spreadsheet" });
  }

  /** Selects a source range using the real position box. @param range - Native address string. @returns Nothing. */
  function select(range: string): void {
    const box = screen.getByRole("textbox", { name: "Name Box" });
    fireEvent.change(box, { target: { value: range } });
    fireEvent.keyDown(box, { key: "Enter" });
  }

  /** Installs a test clipboard at the native browser API boundary. @param native - Optional native grid transfer. @returns Clipboard fixture. */
  function browserClipboard(native?: ReturnType<typeof transfer>) {
    const descriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    let plain = "";
    const clipboard = {
      writeText: vi.fn(
        /** Stores browser plain text independently of the native transfer. @param value - Clipboard text. @returns Completion. */ async (
          value: string,
        ) => {
          plain = value;
        },
      ),
      readText: vi.fn(
        /** Reads the last plain-text write. @returns Clipboard text. */ async () => plain,
      ),
      read: vi.fn(
        /** Exposes the native transfer through browser ClipboardItems. @returns Available clipboard items. */ async () =>
          native
            ? [
                {
                  types: native.types.map(
                    /** Applies the browser custom-format prefix. @param type - Native MIME flavor. @returns A browser clipboard type. */ (
                      type,
                    ) => (type === "text/plain" ? type : "web " + type),
                  ),
                  getType:
                    /** Resolves one clipboard flavor to its text reader. @param type - Browser clipboard type. @returns A fixture for the browser data blob. */ async (
                      type: string,
                    ) => ({
                      text: /** Reads the original native MIME flavor. @returns Clipboard text. */ async () =>
                        native.getData(type.replace(/^web /, "")),
                    }),
                },
              ]
            : [],
      ),
    };
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: clipboard });
    restoreClipboard = /** Restores the original clipboard property. @returns Nothing. */ () => {
      if (descriptor) Object.defineProperty(navigator, "clipboard", descriptor);
      else Reflect.deleteProperty(navigator, "clipboard");
    };
    return clipboard;
  }

  /** Opens the source Paste Special dialog from the active grid shortcut. @returns Contents dialog. */
  async function openPasteSpecial() {
    await act(
      /** Presses a key on the selected control. @returns Whether the event's default action is allowed, after dispatch. */ async () =>
        fireEvent.keyDown(grid(), {
          key: "V",
          code: "KeyV",
          ctrlKey: true,
          shiftKey: true,
        }),
    );
    return within(screen.getByRole("dialog", { name: "Paste Special" }));
  }

  return { mount, transfer, grid, select, browserClipboard, openPasteSpecial };
}

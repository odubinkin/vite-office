/** @fileoverview Verifies browser file chooser completion and byte reading. */

import { describe, expect, it, vi } from "vitest";

import { createBrowserDocumentOpenPort, readBrowserFile, selectBrowserFile } from "./browser-file";

describe("browser file selection" /** Groups the platform file adapter. @returns Nothing. */, () => {
  it("configures a single-file chooser and reads selected bytes" /** Verifies accept, selection, cleanup, and byte ownership. @returns A fulfilled assertion promise. */, async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "fixture.odt");
    const input = document.createElement("input");
    const remove = vi.spyOn(input, "remove");
    vi.spyOn(input, "click").mockImplementation(
      /** Supplies one deterministic selected file. @returns Nothing. */
      () => {
        Object.defineProperty(input, "files", { configurable: true, value: [file] });
        input.dispatchEvent(new Event("change"));
      },
    );
    const selected = await selectBrowserFile("application/test,.odt", {
      /** Returns the observable test input. @param tagName - Requested input tag. @returns Fixture input. */
      createElement: (tagName: string) => {
        expect(tagName).toBe("input");
        return input;
      },
    } as Pick<Document, "createElement">);
    expect(input).toMatchObject({ accept: "application/test,.odt", multiple: false, type: "file" });
    expect(selected).toBe(file);
    expect(remove).toHaveBeenCalledOnce();
    await expect(readBrowserFile(file)).resolves.toEqual(new Uint8Array([1, 2, 3]));
  });

  it("resolves cancellation once and ignores a later change" /** Verifies chooser cancellation is deterministic. @returns A fulfilled assertion promise. */, async () => {
    const input = document.createElement("input");
    vi.spyOn(input, "click").mockImplementation(
      /** Cancels then emits an irrelevant later change. @returns Nothing. */
      () => {
        input.dispatchEvent(new Event("cancel"));
        input.dispatchEvent(new Event("change"));
      },
    );
    await expect(
      selectBrowserFile(".odt", {
        /** Returns the cancellation fixture. @returns Fixture input. */
        createElement: () => input,
      } as Pick<Document, "createElement">),
    ).resolves.toBeUndefined();
  });

  it("composes chooser and byte reading behind the shell-neutral open port" /** Verifies Writer consumers receive no DOM File API operations. @returns A fulfilled assertion promise. */, async () => {
    const file = new File(["ODT"], "port.odt");
    const select = vi.fn(
      /** Returns the selected fixture file. @returns Fixture file. */ async () => file,
    );
    const read = vi.fn(
      /** Returns deterministic fixture bytes. @returns Fixture bytes. */ async () =>
        new Uint8Array([7, 8, 9]),
    );
    const port = createBrowserDocumentOpenPort(select, read);
    await expect(port.open(".odt")).resolves.toEqual({
      bytes: new Uint8Array([7, 8, 9]),
      name: "port.odt",
      reference: file,
    });
    expect(select).toHaveBeenCalledWith(".odt");
    expect(read).toHaveBeenCalledWith(file);
  });

  it("preserves file-picker cancellation through the open port", /** Checks the empty selection path. @returns Completion. */ async () => {
    const read = vi.fn();
    const port = createBrowserDocumentOpenPort(
      /** Runs the focused test callback. @returns Operation result. */ async () => undefined,
      read,
    );
    await expect(port.open(".odt,.txt")).resolves.toBeUndefined();
    expect(read).not.toHaveBeenCalled();
  });
});

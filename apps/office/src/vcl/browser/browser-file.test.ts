/** @fileoverview Verifies browser file chooser completion and byte reading. */

import { describe, expect, it, vi } from "vitest";

import { readBrowserFile, selectBrowserFile } from "./browser-file";

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
});

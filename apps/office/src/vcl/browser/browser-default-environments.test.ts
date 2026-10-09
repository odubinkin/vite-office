/** @fileoverview Verifies browser adapters obtain their default capabilities from the actual global environment. */
import { afterEach, expect, it, vi } from "vitest";
import { copyPlainText } from "./browser-clipboard";
import { downloadPlainText } from "./browser-download";
import { selectBrowserFile } from "./browser-file";

afterEach(
  /** Releases every temporary browser capability. @returns Nothing. */ () => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  },
);

it("copies through the global clipboard when no environment is supplied", /** Checks the adapter's real default capability lookup. @returns Completion. */ async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal("navigator", { clipboard: { writeText } });
  await copyPlainText("Default clipboard");
  expect(writeText).toHaveBeenCalledExactlyOnceWith("Default clipboard");
});

it("downloads through the global document and object URL capabilities", /** Checks the default download payload and cleanup. @returns Completion. */ async () => {
  const anchor = document.createElement("a");
  const click = vi
    .spyOn(anchor, "click")
    .mockImplementation(/** Prevents external navigation. @returns Nothing. */ () => undefined);
  const createElement = vi.spyOn(document, "createElement").mockReturnValue(anchor);
  const createObjectURL = vi.fn().mockReturnValue("blob:default-download");
  const revokeObjectURL = vi.fn();
  vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
  downloadPlainText("Default download", "default.txt");
  expect(createElement).toHaveBeenCalledWith("a");
  expect(anchor.download).toBe("default.txt");
  expect(anchor.href).toBe("blob:default-download");
  expect(click).toHaveBeenCalledOnce();
  expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith("blob:default-download");
  const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
  expect(blob.type).toBe("text/plain;charset=utf-8");
  await expect(blob.text()).resolves.toBe("Default download");
});

it("selects a file through the global document when no document is supplied", /** Checks the default chooser and its owned input cleanup. @returns Completion. */ async () => {
  const input = document.createElement("input");
  const file = new File(["Default file"], "default.txt");
  const remove = vi.spyOn(input, "remove");
  vi.spyOn(input, "click").mockImplementation(
    /** Delivers a browser selection event. @returns Nothing. */ () => {
      Object.defineProperty(input, "files", { configurable: true, value: [file] });
      input.dispatchEvent(new Event("change"));
    },
  );
  const createElement = vi.spyOn(document, "createElement").mockReturnValue(input);
  await expect(selectBrowserFile(".txt")).resolves.toBe(file);
  expect(createElement).toHaveBeenCalledWith("input");
  expect(input.type).toBe("file");
  expect(input.accept).toBe(".txt");
  expect(remove).toHaveBeenCalledOnce();
});

/** @fileoverview Shared Writer/Calc primary Save ownership and lifecycle regressions. */
import { cleanup, render, act } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useBrowserSaveShortcut } from "./use-command-shortcuts";
afterEach(cleanup);
/** Installs the actual browser policy. @param props - Hook ports. @returns No chrome. */
function Host(props: Parameters<typeof useBrowserSaveShortcut>[0]) {
  useBrowserSaveShortcut(props);
  return null;
}
/** Dispatches a real cancelable browser key. @param options - Key state. @returns Actual event. */
function key(options: KeyboardEventInit) {
  const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...options });
  window.dispatchEvent(event);
  return event;
}
it("captures only primary Save, forwards failures and releases ownership on inactivity/unmount", /** Checks actual capture phase, filtering and port disposal. @returns Completion. */ async () => {
  const Flush = vi.fn().mockResolvedValue(undefined),
    onError = vi.fn(),
    downstream = vi.fn();
  const mounted = render(<Host isActive autosave={{ Flush }} onError={onError} />);
  window.addEventListener("keydown", downstream);
  await act(
    /** Dispatches capture-phase keys and settles the primary write. @returns Completion. */ async () => {
      expect(key({ key: "s", ctrlKey: true }).defaultPrevented).toBe(true);
      expect(key({ key: "S", metaKey: true }).defaultPrevented).toBe(true);
    },
  );
  expect(Flush).toHaveBeenCalledTimes(2);
  expect(downstream).not.toHaveBeenCalled();
  for (const options of [
    { key: "q", ctrlKey: true },
    { key: "s" },
    { key: "s", ctrlKey: true, altKey: true },
    { key: "s", metaKey: true, shiftKey: true },
  ])
    expect(key(options).defaultPrevented).toBe(false);
  Flush.mockRejectedValueOnce("quota");
  await act(
    /** Dispatches capture-phase keys and settles the primary write. @returns Completion. */ async () => {
      key({ key: "s", metaKey: true });
    },
  );
  expect(onError).toHaveBeenCalledWith("quota");
  mounted.rerender(<Host isActive autosave={undefined} onError={onError} />);
  expect(key({ key: "s", ctrlKey: true }).defaultPrevented).toBe(true);
  mounted.rerender(<Host isActive={false} autosave={{ Flush }} onError={onError} />);
  expect(key({ key: "s", ctrlKey: true }).defaultPrevented).toBe(false);
  mounted.unmount();
  expect(key({ key: "s", ctrlKey: true }).defaultPrevented).toBe(false);
  window.removeEventListener("keydown", downstream);
});

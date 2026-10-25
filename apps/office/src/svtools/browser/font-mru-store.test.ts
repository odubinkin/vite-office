/** @fileoverview Logical FontNameBox file codec and actual browser profile storage failure boundaries. */
import { afterEach, expect, it, vi } from "vitest";
import { decodeFontMruEntries, encodeFontMruEntries } from "../source/control/ctrlbox.fontmru";
import { FONT_MRU_STORAGE_KEY, readFontMruEntries, saveFontMruEntries } from "./font-mru-store";
afterEach(
  /** Restores actual host instrumentation and this test's own profile entry. @returns Nothing. */ () => {
    vi.restoreAllMocks();
    window.localStorage.removeItem(FONT_MRU_STORAGE_KEY);
  },
);
it("preserves first-line semicolon parsing and source two-LF output", /** No normalization,escaping or duplicate removal is introduced. @returns Nothing. */ () => {
  expect(decodeFontMruEntries("A;;B;\r\nIgnored")).toEqual(["A", "B"]);
  expect(decodeFontMruEntries("A\rIgnored")).toEqual(["A"]);
  expect(decodeFontMruEntries("")).toEqual([]);
  expect(encodeFontMruEntries(["A", "B"])).toBe("A;B\n\n");
  expect(encodeFontMruEntries([])).toBeUndefined();
  expect(decodeFontMruEntries(encodeFontMruEntries(["A;B"]) as string)).toEqual(["A", "B"]);
});
it("uses the actual profile entry and preserves old data on an empty save", /** Shares the native logical file across application widgets without a separate history store. @returns Nothing. */ () => {
  expect(readFontMruEntries()).toEqual([]);
  saveFontMruEntries(["A", "B"]);
  expect(readFontMruEntries()).toEqual(["A", "B"]);
  expect(window.localStorage.getItem(FONT_MRU_STORAGE_KEY)).toBe("A;B\n\n");
  saveFontMruEntries([]);
  expect(readFontMruEntries()).toEqual(["A", "B"]);
});
it("treats actual browser storage denial and quota errors as unavailable I/O", /** Host errors are controlled fixtures,not simulated successful storage. @returns Nothing. */ () => {
  vi.spyOn(window, "localStorage", "get").mockImplementationOnce(
    /** Actual browser property denial shape. @returns Never. */ () => {
      throw new DOMException("denied", "SecurityError");
    },
  );
  expect(readFontMruEntries()).toEqual([]);
  vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(
    /** Actual quota failure shape. @returns Never. */ () => {
      throw new DOMException("full", "QuotaExceededError");
    },
  );
  expect(/** Failed host write. @returns Nothing. */ () => saveFontMruEntries(["A"])).not.toThrow();
});
it("propagates unexpected failures rather than hiding programming errors", /** Only the declared browser I/O errors receive native failed-open semantics. @returns Nothing. */ () => {
  vi.spyOn(window, "localStorage", "get").mockImplementationOnce(
    /** Unexpected host integration failure. @returns Never. */ () => {
      throw new Error("unexpected read");
    },
  );
  expect(/** Failed read. @returns Stored names. */ () => readFontMruEntries()).toThrow(
    "unexpected read",
  );
  vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(
    /** Unexpected DOM failure. @returns Never. */ () => {
      throw new DOMException("unexpected write", "InvalidStateError");
    },
  );
  expect(/** Failed write. @returns Nothing. */ () => saveFontMruEntries(["A"])).toThrow(
    "unexpected write",
  );
});

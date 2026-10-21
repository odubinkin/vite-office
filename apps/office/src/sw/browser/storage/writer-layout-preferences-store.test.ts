/** @fileoverview Tests real browser layout persistence independently of document packages. */
import { afterEach, expect, it, vi } from "vitest";
import {
  WriterLayoutPreferenceStore,
  WRITER_LAYOUT_PREFERENCES_KEY as key,
} from "./writer-layout-preferences-store";
import { SwMasterUsrPref } from "../../source/uibase/config/usrpref";
import { FieldUnit as F } from "../../../tools/inc/fldunit";

afterEach(
  /** Releases the actual test browser storage. @returns Nothing. */ () => localStorage.clear(),
);

it("persists exact native properties and explicit independent axes while retaining unrelated layout values", /** Verifies load/save against actual Storage. @returns Nothing. */ () => {
  localStorage.setItem(
    key,
    JSON.stringify({
      "Other/MeasureUnit": F.CM,
      "Window/HorizontalRulerUnit": F.MM,
      future: { value: 7 },
    }),
  );
  const store = new WriterLayoutPreferenceStore(localStorage);
  const preferences = new SwMasterUsrPref();
  store.Load(preferences);
  expect(preferences.GetMetric()).toBe(F.CM);
  expect(preferences.GetHScrollMetric()).toBe(F.MM);
  expect(preferences.IsVScrollMetric()).toBe(false);
  expect(preferences.IsMetricModified()).toBe(false);
  preferences.SetMetric(F.INCH);
  preferences.SetVScrollMetric(F.POINT);
  store.Save(preferences);
  expect(JSON.parse(String(localStorage.getItem(key)))).toEqual({
    "Other/MeasureUnit": F.INCH,
    "Window/HorizontalRulerUnit": F.MM,
    "Window/VerticalRulerUnit": F.POINT,
    future: { value: 7 },
  });
  expect(preferences.IsMetricModified()).toBe(false);
  const reopened = new SwMasterUsrPref();
  store.Load(reopened);
  expect([reopened.GetMetric(), reopened.GetHScrollMetric(), reopened.GetVScrollMetric()]).toEqual([
    F.INCH,
    F.MM,
    F.POINT,
  ]);
});

it.each([null, "{", "null", "[]", "7", '"cm"'])(
  "retains defaults for absent or malformed backend data %s",
  /** Rejects non-record storage. @param text - Stored transport. @returns Nothing. */ (text) => {
    if (text !== null) localStorage.setItem(key, text);
    const preferences = new SwMasterUsrPref({ "Other/MeasureUnit": F.PICA });
    new WriterLayoutPreferenceStore(localStorage).Load(preferences);
    expect(preferences.GetMetric()).toBe(F.PICA);
    expect(preferences.IsHScrollMetric()).toBe(false);
    expect(preferences.IsVScrollMetric()).toBe(false);
  },
);

it.each(["8", null, 1.5, 2147483648, -2147483649])(
  "rejects non-int32 property transport %s",
  /** Checks exact property extraction boundary. @param value - Invalid transport value. @returns Nothing. */ (
    value,
  ) => {
    localStorage.setItem(
      key,
      JSON.stringify({
        "Other/MeasureUnit": value,
        "Window/HorizontalRulerUnit": value,
        "Window/VerticalRulerUnit": value,
      }),
    );
    const preferences = new SwMasterUsrPref({ "Other/MeasureUnit": F.CM });
    new WriterLayoutPreferenceStore(localStorage).Load(preferences);
    expect(preferences.GetMetricProperties()).toEqual({ "Other/MeasureUnit": F.CM });
  },
);

it("keeps native UInt16 casts after valid signed int32 extraction", /** Preserves source casts rather than sanitizing enums. @returns Nothing. */ () => {
  localStorage.setItem(
    key,
    JSON.stringify({
      "Other/MeasureUnit": -1,
      "Window/HorizontalRulerUnit": 65538,
      "Window/VerticalRulerUnit": -2147483648,
    }),
  );
  const preferences = new SwMasterUsrPref();
  new WriterLayoutPreferenceStore(localStorage).Load(preferences);
  expect(preferences.GetMetricProperties()).toEqual({
    "Other/MeasureUnit": 65535,
    "Window/HorizontalRulerUnit": 2,
    "Window/VerticalRulerUnit": 0,
  });
});

it("does not write untouched preferences and removes absent override properties on a genuine save", /** Checks dirty state and optional native properties. @returns Nothing. */ () => {
  localStorage.setItem(
    key,
    JSON.stringify({
      "Window/HorizontalRulerUnit": F.MM,
      "Window/VerticalRulerUnit": F.POINT,
      future: true,
    }),
  );
  const setItem = vi.spyOn(Storage.prototype, "setItem");
  const preferences = new SwMasterUsrPref();
  const store = new WriterLayoutPreferenceStore(localStorage);
  store.Save(preferences);
  expect(setItem).not.toHaveBeenCalled();
  preferences.SetMetric(F.CM);
  store.Save(preferences);
  expect(JSON.parse(String(localStorage.getItem(key)))).toEqual({
    "Other/MeasureUnit": F.CM,
    future: true,
  });
  setItem.mockRestore();
});

it("retains modified state when actual storage rejects a write and tolerates inaccessible reads", /** Verifies platform failure boundaries. @returns Nothing. */ () => {
  const storage = {
    /** Models unavailable browser reads. @returns Never. */ getItem(): never {
      throw new Error("unavailable");
    },
    /** Models a denied browser write. @returns Never. */ setItem(): never {
      throw new Error("quota");
    },
  };
  const preferences = new SwMasterUsrPref({ "Other/MeasureUnit": F.MM });
  const store = new WriterLayoutPreferenceStore(storage);
  store.Load(preferences);
  expect(preferences.GetMetric()).toBe(F.MM);
  preferences.SetMetric(F.INCH);
  expect(
    /** Attempts the real platform save. @returns Nothing. */ () => store.Save(preferences),
  ).toThrow("quota");
  expect(preferences.IsMetricModified()).toBe(true);
});

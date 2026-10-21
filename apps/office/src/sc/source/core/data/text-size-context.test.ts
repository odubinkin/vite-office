/** @fileoverview Native six-input row context,document script-service ownership and cached cell metadata boundaries. */
import { expect, it, vi } from "vitest";
import { BreakIteratorImpl } from "../../../../i18npool/source/breakiterator/breakiteratorImpl";
import { RowHeightContext } from "../../../inc/rowheightcontext";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScGlobal } from "../../../inc/global";
import { ScScriptTypeData } from "../inc/scrdata";
import { SvtScriptType as S } from "../../../../svl/inc/languageoptions";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { setConfiguredSystemUILanguage } from "../../../../i18nlangtag/source/isolang/mslangid";
import { LANGUAGE_SYSTEM, LANGUAGE_ENGLISH_US } from "../../../../i18nlangtag/inc/lang";
it("retains all original scales,zoom,opaque device identity and independently accumulated UInt16 row heights", /** Checks original constructor/accessor contracts without a fake device implementation. @returns Nothing. */ () => {
  const device = { identity: "borrowed host device" },
    c = new RowHeightContext(100, 0.13, 0.17, 1.5, 0.75, device);
  expect([c.getPPTX(), c.getPPTY(), c.getZoomX(), c.getZoomY()]).toEqual([0.13, 0.17, 1.5, 0.75]);
  expect(c.getOutputDevice()).toBe(device);
  expect(c.getExtraHeight()).toBe(0);
  expect(c.isForceAutoSize()).toBe(false);
  expect(c.getHeightArray().GetValue(80)).toBe(0);
  c.getHeightArray().SetValue(3, 8, 321);
  c.setExtraHeight(65539);
  c.setForceAutoSize(true);
  expect(c.getExtraHeight()).toBe(3);
  expect(c.isForceAutoSize()).toBe(true);
  expect(c.getHeightArray().GetValue(4)).toBe(321);
  const other = new RowHeightContext(100, 0, 0, 0, 0, null);
  expect(other.getOutputDevice()).toBeNull();
  expect(other.getHeightArray().GetValue(4)).toBe(0);
  expect([other.getPPTX(), other.getPPTY(), other.getZoomX(), other.getZoomY()]).toEqual([
    0, 0, 0, 0,
  ]);
  c.setForceAutoSize(false);
  expect(c.isForceAutoSize()).toBe(false);
});
it("creates script data and the genuine document-owned service lazily and retains source string flags", /** Exercises actual native loop and real BreakIteratorImpl. @returns Nothing. */ () => {
  const a = new ScDocument(),
    b = new ScDocument(),
    empty = unicode("");
  try {
    expect(new ScScriptTypeData().xBreakIter).toBeNull();
    expect(Reflect.get(a, "pScriptTypeData")).toBeUndefined();
    expect(a.GetStringScriptType(empty)).toBe(S.NONE);
    expect(Reflect.get(a, "pScriptTypeData")).toBeUndefined();
    const factory = vi.fn(
      /** Binds the genuine backend at the host service port. @returns Actual service. */ () =>
        new BreakIteratorImpl(),
    );
    const service = a.GetBreakIterator(factory);
    expect(a.GetBreakIterator()).toBe(service);
    expect(Reflect.get(a, "pScriptTypeData")).toBeInstanceOf(ScScriptTypeData);
    expect(b.GetBreakIterator(factory)).not.toBe(service);
    expect(factory).toHaveBeenCalledTimes(2);
    for (const [input, expected] of [
      ["abc", S.LATIN],
      ["中文", S.ASIAN],
      ["عربي", S.COMPLEX],
      ["abc中ع", S.LATIN | S.ASIAN | S.COMPLEX],
      [" \u00a0😀", S.NONE],
    ] as const) {
      const value = unicode(input);
      try {
        expect(a.GetStringScriptType(value)).toBe(expected);
      } finally {
        value.dispose();
      }
    }
  } finally {
    empty.dispose();
    a.DisposeAttributes();
    b.DisposeAttributes();
  }
});
it("uses the original office UI language for entirely weak text rather than the data language", /** Reads actual configured language ownership. @returns Nothing. */ () => {
  try {
    for (const [language, script] of [
      [LANGUAGE_ENGLISH_US, S.LATIN],
      [0x0804, S.ASIAN],
      [0x0401, S.COMPLEX],
    ] as const) {
      setConfiguredSystemUILanguage(language);
      expect(ScGlobal.GetDefaultScriptType()).toBe(script);
    }
  } finally {
    setConfiguredSystemUILanguage(LANGUAGE_SYSTEM);
  }
});
it("reads UNKNOWN without classifying,updates only existing text metadata,and preserves sparse caller preconditions", /** Exercises real column/table/document storage,not an alternate cache. @returns Nothing. */ () => {
  const d = new ScDocument(),
    name = unicode("Cache");
  try {
    d.InsertTab(0, name);
    const table = d.FetchTable(0);
    if (!table) throw Error("Missing sheet");
    const p = new ScAddress(0, 2, 0);
    expect(d.GetScriptType(p)).toBe(S.NONE);
    expect(table.GetAllocatedColumnsCount()).toBe(1);
    d.SetValue(p, 17);
    expect(d.GetScriptType(p)).toBe(S.UNKNOWN);
    for (const script of [S.NONE, S.LATIN, S.ASIAN, S.COMPLEX, S.LATIN | S.ASIAN | S.COMPLEX]) {
      d.SetScriptType(p, script);
      expect(d.GetScriptType(p)).toBe(script);
    }
    const absent = new ScAddress(0, 8, 0);
    d.SetScriptType(absent, S.COMPLEX);
    expect(d.GetScriptType(absent)).toBe(S.NONE);
    d.SetScriptType(new ScAddress(0, -1, 0), S.ASIAN);
    expect(d.GetScriptType(new ScAddress(0, -1, 0))).toBe(S.NONE);
    d.SetScriptType(new ScAddress(0, 0, 2), S.LATIN);
    expect(d.GetScriptType(new ScAddress(0, 0, 2))).toBe(S.NONE);
    d.SetScriptType(new ScAddress(-1, 0, 0), S.ASIAN);
    expect(d.GetScriptType(new ScAddress(-1, 0, 0))).toBe(S.NONE);
    expect(
      /** Native allocation precondition is not silently repaired. @returns Nothing. */ () =>
        d.SetScriptType(new ScAddress(2, 0, 0), S.ASIAN),
    ).toThrow(TypeError);
    expect(table.GetAllocatedColumnsCount()).toBe(1);
    expect(d.GetScriptType(new ScAddress(2, 0, 0))).toBe(S.NONE);
    d.SetValue(p, 18);
    expect(d.GetScriptType(p)).toBe(S.UNKNOWN);
    d.SetEmptyCell(p);
    expect(d.GetScriptType(p)).toBe(S.NONE);
  } finally {
    name.dispose();
    d.DisposeAttributes();
  }
});

it("retains empty service references and retries genuine host creation only while the reference is unavailable", /** Tests the original lazy-reference guards without an invented global service manager. @returns Nothing. */ () => {
  const d = new ScDocument(),
    value = unicode("Latin");
  try {
    expect(d.GetBreakIterator()).toBeNull();
    expect(d.GetStringScriptType(value)).toBe(S.NONE);
    const factory = vi.fn(
      /** Models an unavailable process binding. @returns Empty native reference. */ () =>
        null as import("../../../../offapi/com/sun/star/i18n/XBreakIterator").XBreakIterator | null,
    );
    expect(d.GetBreakIterator(factory)).toBeNull();
    expect(factory).toHaveBeenCalledTimes(1);
    const actual = new BreakIteratorImpl();
    factory.mockReturnValue(actual);
    expect(d.GetStringScriptType(value, factory)).toBe(S.LATIN);
    expect(factory).toHaveBeenCalledTimes(2);
    expect(d.GetBreakIterator(factory)).toBe(actual);
    expect(factory).toHaveBeenCalledTimes(2);
  } finally {
    value.dispose();
    d.DisposeAttributes();
  }
});

/** @fileoverview Verifies source-defined Locale fields, exact string values and shared ownership special members without upstream files. */
import { describe, it, expect, vi } from "vitest";
import { Locale } from "./Locale";
import { OUString } from "../../../../../sal/inc/rtl/ustring";
import { rtl_stringAllocation } from "../../../../../sal/rtl/strimp.hxx";
import { EmptyStringImpl } from "../../../../../sal/rtl/strtmpl";
import contract from "../../../../../i18nutil/source/utility/casefolding-source-contract.json";

/** Constructs an actual shared string owner from initialized original UTF16 units. @param units - Complete logical units. @returns Owned string. */
function text(units: number[]): OUString {
  return new OUString(new Uint16Array(units), units.length);
}

describe("source-defined Locale value ownership", /** Groups original struct contracts. @returns Nothing. */ () => {
  it("retains all IDL fields and default empty string owners", /** Verifies source fields/defaults without locale normalization. @returns Nothing. */ () => {
    expect(contract.localeFields).toEqual([
      { name: "Language", type: "string", default: "" },
      { name: "Country", type: "string", default: "" },
      { name: "Variant", type: "string", default: "" },
    ]);
    const locale = new Locale(),
      other = new Locale();
    for (const name of ["Language", "Country", "Variant"] as const) {
      expect(locale[name].getLength()).toBe(0);
      expect(locale[name].getStr()[0]).toBe(0);
      expect(locale[name].pData).toBe(other[name].pData);
    }
    expect(locale.equals(other)).toBe(true);
    expect(locale.notEquals(other)).toBe(false);
    other.dispose();
    locale.dispose();
  });

  it("copies, assigns and compares complete exact UTF16 fields", /** Verifies copy identity and ordered generated comparisons. @returns Nothing. */ () => {
    const a = text([116, 114]),
      b = text([84, 82]),
      c = text([65, 0, 55296, 56320]);
    const locale = new Locale(a, b, c),
      copy = new Locale(locale),
      assigned = new Locale();
    expect(a.pData.refCount).toBe(3);
    expect(b.pData.refCount).toBe(3);
    expect(c.pData.refCount).toBe(3);
    expect(copy.Language.pData).toBe(a.pData);
    expect(copy.Country.pData).toBe(b.pData);
    expect(copy.Variant.pData).toBe(c.pData);
    expect(locale.equals(copy)).toBe(true);
    expect(assigned.assign(locale)).toBe(assigned);
    expect(assigned.assign(assigned)).toBe(assigned);
    expect(locale.equals(assigned)).toBe(true);
    const changed = text([84, 82]);
    const languageOwner = assigned.Language;
    assigned.Language = changed;
    expect(assigned.Language).toBe(languageOwner);
    expect(assigned.Language.pData).toBe(changed.pData);
    expect(locale.equals(assigned)).toBe(false);
    expect(locale.notEquals(assigned)).toBe(true);
    assigned.Language = locale.Language;
    assigned.Country = c;
    expect(locale.equals(assigned)).toBe(false);
    assigned.Country = locale.Country;
    assigned.Variant = b;
    expect(locale.equals(assigned)).toBe(false);
    expect([...locale.Variant.getStr().subarray(0, c.getLength())]).toEqual([65, 0, 55296, 56320]);
    assigned.dispose();
    copy.dispose();
    locale.dispose();
    changed.dispose();
    c.dispose();
    b.dispose();
    a.dispose();
  });

  it("preserves memberwise move and self-move contracts", /** Verifies actual OUString transfer/swap semantics in field order. @returns Nothing. */ () => {
    const a = text([113, 108, 116]),
      b = text([90, 90]),
      c = text([116, 114, 45, 84, 82]);
    const source = new Locale(a, b, c),
      target = new Locale();
    const pointers = [source.Language.pData, source.Country.pData, source.Variant.pData];
    const moved = Locale.move(source);
    for (const [i, name] of (["Language", "Country", "Variant"] as const).entries()) {
      expect(moved[name].pData).toBe(pointers[i]);
      expect(source[name].pData).toBe(EmptyStringImpl.data);
    }
    expect(target.moveAssign(moved)).toBe(target);
    expect(target.moveAssign(target)).toBe(target);
    expect(target.Language.pData).toBe(a.pData);
    expect(target.Country.pData).toBe(b.pData);
    expect(target.Variant.pData).toBe(c.pData);
    const old = target.Language.pData;
    expect(moved.moveAssign(target)).toBe(moved);
    expect(moved.Language.pData).toBe(old);
    expect(target.Language.isEmpty()).toBe(true);
    moved.dispose();
    target.dispose();
    source.dispose();
    c.dispose();
    b.dispose();
    a.dispose();
  });

  it("destroys owned fields in reverse declaration order", /** Verifies actual allocation releases and destructor order. @returns Nothing. */ () => {
    const a = text([1]),
      b = text([2]),
      c = text([3]);
    const locale = new Locale(a, b, c);
    const expected = [c.pData, b.pData, a.pData];
    a.dispose();
    b.dispose();
    c.dispose();
    const free = rtl_stringAllocation.rtl_freeString;
    const calls: unknown[] = [];
    const spy = vi.spyOn(rtl_stringAllocation, "rtl_freeString").mockImplementation(
      /** Observes actual shared owner release. @param data - Native-equivalent pointer. @returns Nothing. */
      (data) => {
        calls.push(data);
        free(data);
      },
    );
    try {
      locale.dispose();
      expect(calls).toEqual(expected);
    } finally {
      spy.mockRestore();
    }
  });
});

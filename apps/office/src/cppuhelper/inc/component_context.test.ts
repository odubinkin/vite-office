/** @fileoverview Original context-entry input values preserve member defaults, source field identity and actual Any/Reference ownership. */
import { expect, it } from "vitest";
import { ContextEntry_Init } from "./component_context";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { OWeakObject } from "./weak";
import { WeakReferenceHelper } from "./weakref";
import { unicode, text } from "../../i18nlangtag/source/isolang/isolang.tables";
it("retains original default late-init false and stable copied name/Any fields", /** Explicit member construction and implicit copy do not normalize source names or share mutable field owners. @returns Nothing. */ () => {
  const name = unicode("/singletons/custom\0Ω"),
    value = new Any(true),
    empty = new ContextEntry_Init(),
    entry = new ContextEntry_Init(name, value),
    copy = new ContextEntry_Init(entry);
  try {
    expect([empty.m_bLateInitService, empty.m_sName.isEmpty(), empty.m_aValue.hasValue()]).toEqual([
      false,
      true,
      false,
    ]);
    expect(entry.m_bLateInitService).toBe(false);
    expect(copy.m_aValue.operatorEquals(value)).toBe(true);
    const member = entry.m_sName,
      any = entry.m_aValue;
    entry.m_sName = name;
    entry.m_aValue = value;
    entry.m_bLateInitService = true;
    expect(entry.m_sName).toBe(member);
    expect(entry.m_aValue).toBe(any);
    empty.assign(entry);
    entry.m_sName.clear();
    entry.m_aValue.clear();
    expect(text(copy.m_sName)).toBe("/singletons/custom\0Ω");
    expect(text(empty.m_sName)).toBe("/singletons/custom\0Ω");
    expect(empty.m_bLateInitService).toBe(true);
    expect(copy.m_bLateInitService).toBe(false);
  } finally {
    copy.dispose();
    entry.dispose();
    empty.dispose();
    value.dispose();
    name.dispose();
  }
});
it("retains actual contained interface ownership until every entry copy is destroyed", /** Actual native weak/reference owners prove the real Any member lifetime. @returns Nothing. */ () => {
  const owner = new Reference(new OWeakObject()),
    weak = new WeakReferenceHelper(owner),
    name = unicode("value"),
    any = new Any(owner.getAddress(), "XInterface"),
    entry = new ContextEntry_Init(name, any, true),
    copy = new ContextEntry_Init(entry);
  owner.dispose();
  any.dispose();
  entry.dispose();
  const alive = weak.get();
  try {
    expect(alive.is()).toBe(true);
  } finally {
    alive.dispose();
  }
  copy.dispose();
  const gone = weak.get();
  try {
    expect(gone.is()).toBe(false);
  } finally {
    gone.dispose();
    weak.dispose();
    name.dispose();
  }
});

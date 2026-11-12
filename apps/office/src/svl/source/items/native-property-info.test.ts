/** @fileoverview Genuine ordinary property-info component, borrowed static schemas, copied map caches and lazy property-set ownership. */
import { expect, it } from "vitest";
import { SfxItemPropertySetInfo, SfxItemPropertySet, SfxItemPropertyMap } from "./itemprop";
import { SfxItemPropertyMapEntry } from "../../inc/itemprop";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XPropertySetInfo } from "../../../udkapi/com/sun/star/beans/XPropertySetInfo";
import { XTypeProvider } from "../../../udkapi/com/sun/star/lang/XTypeProvider";
import { UnoType } from "../../../cppu/inc/unotype";
import { WeakReferenceHelper } from "../../../cppuhelper/source/weak";
import { unicode } from "../../../sw/source/core/unocore/unocrsrhelper";
it("exposes the complete ordinary metadata component through actual UNO/weak owners", /** Schema values remain caller-owned until the last component release. @returns Nothing. */ () => {
  const key = unicode("Native"),
    entry = new SfxItemPropertyMapEntry(key, 7, UnoType.get("bool"), 0, 0),
    object = new SfxItemPropertySetInfo([entry]),
    strong = new Reference(object),
    queried = new Reference<XPropertySetInfo>(
      strong,
      UNO_QUERY_THROW,
      XPropertySetInfo.static_type,
    ),
    types = new Reference<XTypeProvider>(strong, UNO_QUERY_THROW, XTypeProvider.static_type),
    weak = new WeakReferenceHelper(strong);
  try {
    expect(queried.get()).toBe(object);
    expect(types.get()).toBe(object);
    expect(object.hasPropertyByName(key)).toBe(true);
    const result = object.getPropertyByName(key);
    try {
      expect(result.Handle).toBe(7);
    } finally {
      result.dispose();
    }
    strong.dispose();
    queried.dispose();
    types.dispose();
    const hardened = weak.get();
    try {
      expect(hardened.is()).toBe(false);
    } finally {
      hardened.dispose();
    }
  } finally {
    weak.dispose();
    entry.dispose();
    key.dispose();
  }
});
it("copies an existing native map and shares cached descriptor storage without owning its schema entries", /** The actual map may die while the copied component and its immutable caller schema remain alive. @returns Nothing. */ () => {
  const key = unicode("Native"),
    entry = new SfxItemPropertyMapEntry(key, 8, UnoType.get("bool"), 0, 0),
    map = new SfxItemPropertyMap([entry]),
    cache = map.getProperties(),
    object = new SfxItemPropertySetInfo(map),
    strong = new Reference(object),
    result = object.getProperties();
  expect(result.get()).toBe(cache.get());
  map.dispose();
  try {
    const second = object.getProperties();
    try {
      expect(second.get()).toBe(result.get());
      expect(second.getLength()).toBe(1);
    } finally {
      second.dispose();
    }
    expect(object.hasPropertyByName(key)).toBe(true);
  } finally {
    result.dispose();
    strong.dispose();
    entry.dispose();
    key.dispose();
  }
});
it("retains one actual lazy info member and lets a copied caller Reference outlive the plain property set", /** No global fake provider or artificial lifetime registry participates. @returns Nothing. */ () => {
  const key = unicode("Native"),
    entry = new SfxItemPropertyMapEntry(key, 9, UnoType.get("bool"), 0, 0),
    set = new SfxItemPropertySet([entry]),
    first = set.getPropertySetInfo(),
    second = set.getPropertySetInfo(),
    caller = new Reference<XPropertySetInfo>(first.get()),
    weak = new WeakReferenceHelper(caller);
  expect(first).toBe(second);
  expect(first.get()).toBe(second.get());
  set.dispose();
  try {
    const component = caller.get() as XPropertySetInfo;
    expect(component.hasPropertyByName(key)).toBe(true);
    const result = component.getProperties();
    try {
      expect(result.getLength()).toBe(1);
    } finally {
      result.dispose();
    }
    caller.dispose();
    const hardened = weak.get();
    try {
      expect(hardened.is()).toBe(false);
    } finally {
      hardened.dispose();
    }
  } finally {
    weak.dispose();
    entry.dispose();
    key.dispose();
  }
});

/** @fileoverview Actual CPPUMaker DocumentProperties interface identities and inheritance through the shared native typelib. No metadata component/provider substitute is constructed. */
import { afterEach, assert, expect, it } from "vitest";
import {
  XDocumentProperties,
  cppu_detail_getUnoType as propertiesType,
  getCppuType as propertiesReferenceType,
} from "./XDocumentProperties";
import {
  XDocumentProperties2,
  cppu_detail_getUnoType as properties2Type,
  getCppuType as properties2ReferenceType,
} from "./XDocumentProperties2";
import {
  XDocumentPropertiesSupplier,
  cppu_detail_getUnoType as supplierType,
  getCppuType as supplierReferenceType,
} from "./XDocumentPropertiesSupplier";
import { TypeDescription } from "../../../../../cppu/inc/typelib/typedescription.hxx";
import type { typelib_InterfaceTypeDescription } from "../../../../../cppu/inc/typelib/typedescription";
import { OUString } from "../../../../../sal/inc/rtl/ustring";
import { read, releaseDomScope } from "../../../../../test/native-dom";
afterEach(releaseDomScope);
it("retains exact published names, cached generated getters and original direct bases", /** Tests the actual descriptions rather than a declared-type factory. @returns Nothing. */ () => {
  for (const [name, getter, deprecated, iface, base] of [
    [
      "XDocumentProperties",
      propertiesType,
      propertiesReferenceType,
      XDocumentProperties,
      "com.sun.star.uno.XInterface",
    ],
    [
      "XDocumentProperties2",
      properties2Type,
      properties2ReferenceType,
      XDocumentProperties2,
      "com.sun.star.document.XDocumentProperties",
    ],
    [
      "XDocumentPropertiesSupplier",
      supplierType,
      supplierReferenceType,
      XDocumentPropertiesSupplier,
      "com.sun.star.uno.XInterface",
    ],
  ] as const) {
    const type = getter();
    expect(getter()).toBe(type);
    expect(iface.static_type()).toBe(type);
    expect(iface.static_type(null)).toBe(type);
    expect(deprecated()).toBe(type);
    expect(deprecated(null)).toBe(type);
    expect(read(type.getTypeName())).toBe("com.sun.star.document." + name);
    const description = new TypeDescription(type.getTypeLibType());
    try {
      const actual = description.get() as unknown as typelib_InterfaceTypeDescription;
      expect(actual.nBaseTypes).toBe(1);
      assert(actual.pBaseTypeDescription);
      expect(read(new OUString(actual.pBaseTypeDescription.aBase.pTypeName))).toBe(base);
    } finally {
      description.dispose();
    }
  }
  expect(
    XDocumentProperties.static_type().isAssignableFrom(XDocumentProperties2.static_type()),
  ).toBe(true);
  expect(
    XDocumentProperties2.static_type().isAssignableFrom(XDocumentProperties.static_type()),
  ).toBe(false);
  expect(
    XDocumentProperties.static_type().isAssignableFrom(XDocumentPropertiesSupplier.static_type()),
  ).toBe(false);
});

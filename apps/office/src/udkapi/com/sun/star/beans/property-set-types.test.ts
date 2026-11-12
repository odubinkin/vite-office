/** @fileoverview Actual generated property-set SDK metadata and declared base contracts; no fake property service/provider or component is supplied. */
import { assert, expect, it } from "vitest";
import {
  XFastPropertySet,
  cppu_detail_getUnoType as fast,
  getCppuType as oldFast,
} from "./XFastPropertySet";
import {
  XMultiPropertySet,
  cppu_detail_getUnoType as multi,
  getCppuType as oldMulti,
} from "./XMultiPropertySet";
import {
  XPropertySetOption,
  cppu_detail_getUnoType as option,
  getCppuType as oldOption,
} from "./XPropertySetOption";
import {
  XPropertiesChangeListener,
  cppu_detail_getUnoType as listener,
  getCppuType as oldListener,
} from "./XPropertiesChangeListener";
import { XEventListener } from "../lang/XEventListener";
import { UnoType } from "../../../../../cppu/inc/unotype";
import { TypeDescription } from "../../../../../cppu/inc/typelib/typedescription.hxx";
import type { typelib_InterfaceTypeDescription } from "../../../../../cppu/inc/typelib/typedescription";
import { text } from "../../../../../i18nlangtag/source/isolang/isolang.tables";
it.each([
  ["XFastPropertySet", XFastPropertySet, fast, oldFast, false],
  ["XMultiPropertySet", XMultiPropertySet, multi, oldMulti, false],
  ["XPropertySetOption", XPropertySetOption, option, oldOption, false],
  ["XPropertiesChangeListener", XPropertiesChangeListener, listener, oldListener, true],
] as const)(
  "retains actual generated %s cache, deprecated getter and direct base",
  /** Only actual CPPU factory metadata is inspected. @param name - IDL name. @param declaration - Generated static API. @param getter - ADL getter. @param deprecated - Deprecated pointer overload. @param eventBase - Original direct base choice. @returns Nothing. */ (
    name,
    declaration,
    getter,
    deprecated,
    eventBase,
  ) => {
    const type = getter();
    expect(type).toBe(getter());
    expect(type.equals(declaration.static_type())).toBe(true);
    expect(type.equals(deprecated())).toBe(true);
    const typeName = type.getTypeName();
    try {
      expect(text(typeName)).toBe("com.sun.star.beans." + name);
    } finally {
      typeName.dispose();
    }
    const description = new TypeDescription(type.getTypeLibType());
    try {
      const actual = description.get() as unknown as typelib_InterfaceTypeDescription;
      expect(actual.nBaseTypes).toBe(1);
      assert(actual.ppBaseTypes);
      const parent = actual.ppBaseTypes[0];
      assert(parent);
      const expected = (
        eventBase ? XEventListener.static_type() : UnoType.get("XInterface")
      ).getTypeLibType();
      assert(expected);
      expect(parent.aBase.pTypeName).toBe(expected.pTypeName);
    } finally {
      description.dispose();
    }
  },
);

import * as XPropertyBagBinding from "./XPropertyBag";
import * as XPropertyContainerBinding from "./XPropertyContainer";
import * as XEnumerationBinding from "../container/XEnumeration";
import * as XEnumerationAccessBinding from "../container/XEnumerationAccess";
import * as XSetBinding from "../container/XSet";
import * as XModifiableBinding from "../../../../../offapi/com/sun/star/util/XModifiable";
import * as XModifyBroadcasterBinding from "../../../../../offapi/com/sun/star/util/XModifyBroadcaster";

it.each([
  [
    XPropertyBagBinding,
    [
      "com.sun.star.beans.XPropertySet",
      "com.sun.star.beans.XPropertyContainer",
      "com.sun.star.beans.XPropertyAccess",
    ],
  ],
  [XPropertyContainerBinding, ["com.sun.star.uno.XInterface"]],
  [XEnumerationBinding, ["com.sun.star.uno.XInterface"]],
  [XEnumerationAccessBinding, ["com.sun.star.container.XElementAccess"]],
  [XSetBinding, ["com.sun.star.container.XEnumerationAccess"]],
  [XModifiableBinding, ["com.sun.star.util.XModifyBroadcaster"]],
  [XModifyBroadcasterBinding, ["com.sun.star.uno.XInterface"]],
] as const)(
  "preserves property service SDK direct base graph and cached legacy type getters",
  /** Executes the actual native-value test operation. @param binding - Declared source operand. @param bases - Declared source operand. @returns Original operation result. */ (
    binding,
    bases,
  ) => {
    const type = binding.cppu_detail_getUnoType();
    expect(binding.getCppuType().equals(type)).toBe(true);
    const declaration = Object.entries(binding).find(
      /** Executes the actual native-value test operation. @param value0 - Declared source operand. @returns Original operation result. */ ([
        name,
      ]) => name.startsWith("X"),
    )?.[1] as {
      static_type(): typeof type;
    };
    expect(declaration.static_type().equals(type)).toBe(true);
    expect(binding.cppu_detail_getUnoType()).toBe(type);
    const description = new TypeDescription(type.getTypeLibType());
    try {
      const actual = description.get() as unknown as typelib_InterfaceTypeDescription;
      expect(actual.nBaseTypes).toBe(bases.length);
      expect(
        actual.ppBaseTypes?.map(
          /** Executes the actual native-value test operation. @param base - Declared source operand. @returns Original operation result. */ (
            base,
          ) => {
            assert(base);
            return text(OUString.unacquired([base.aBase.pTypeName]));
          },
        ),
      ).toEqual(bases);
    } finally {
      description.dispose();
    }
  },
);
import { OUString } from "../../../../../sal/inc/rtl/ustring";

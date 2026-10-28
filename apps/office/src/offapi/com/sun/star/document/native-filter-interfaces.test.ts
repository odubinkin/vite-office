/** @fileoverview Original filter/service SDK type identity and FilterBase's exact ordered class-data declarations. No concrete filter, document, service factory or alternate query provider is manufactured. */
import { expect, expectTypeOf, it } from "vitest";
import { XImporter, getCppuType as importerType } from "./XImporter";
import { XExporter, getCppuType as exporterType } from "./XExporter";
import { XFilter, getCppuType as filterType } from "./XFilter";
import {
  XServiceInfo,
  getCppuType as infoType,
} from "../../../../../udkapi/com/sun/star/lang/XServiceInfo";
import {
  XInitialization,
  getCppuType as initializationType,
} from "../../../../../udkapi/com/sun/star/lang/XInitialization";
import {
  XMultiServiceFactory,
  getCppuType as factoryType,
} from "../../../../../udkapi/com/sun/star/lang/XMultiServiceFactory";
import type { XComponent } from "../../../../../udkapi/com/sun/star/lang/XComponent";
import type { PropertyValue } from "../../../../../udkapi/com/sun/star/beans/PropertyValue";
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import { WeakImplHelper } from "../../../../../cppuhelper/inc/implbase";
import { getTypeEntries } from "../../../../../cppuhelper/source/implbase_ex";
import {
  typelib_typedescription_release,
  type typelib_TypeDescription as D,
  type typelib_InterfaceTypeDescription as I,
} from "../../../../../cppu/inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../../../../cppu/inc/typelib/typeclass";
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import { text } from "../../../../../i18nlangtag/source/isolang/isolang.tables";

it.each([
  [XImporter, importerType, "document.XImporter"],
  [XExporter, exporterType, "document.XExporter"],
  [XFilter, filterType, "document.XFilter"],
  [XServiceInfo, infoType, "lang.XServiceInfo"],
  [XInitialization, initializationType, "lang.XInitialization"],
  [XMultiServiceFactory, factoryType, "lang.XMultiServiceFactory"],
] as const)(
  "retains the real SDK name, root and normal reflection for %s",
  /** Original normal generated getter/Reference overloads use actual cached CPPU ownership. @param declaration - Original SDK declaration. @param deprecated - Deprecated original overload. @param name - Original qualified suffix. @returns Nothing. */ (
    declaration,
    deprecated,
    name,
  ) => {
    const type = declaration.static_type(),
      again = declaration.static_type(null),
      description: [D | null] = [null];
    expect(again).toBe(type);
    expect(deprecated()).toBe(type);
    expect(deprecated(null)).toBe(type);
    expect(Number(type.getTypeClass())).toBe(C.INTERFACE);
    type.getDescription(description);
    const iface = description[0] as unknown as I,
      own = type.getTypeName();
    try {
      expect(text(own)).toBe("com.sun.star." + name);
      expect(iface.aBase.bComplete).toBe(false);
      expect(iface.nBaseTypes).toBe(1);
      const base = (iface.ppBaseTypes as I[])[0] as I,
        root = new OUString(base.aBase.pTypeName);
      try {
        expect(text(root)).toBe("com.sun.star.uno.XInterface");
      } finally {
        root.dispose();
      }
    } finally {
      own.dispose();
      typelib_typedescription_release(description[0] as D);
    }
  },
);
it("retains FilterBase's exact five declared interfaces and the actual helper type-provider tail", /** Checks original compiler declaration data without instantiating an incomplete filter/component. @returns Nothing. */ () => {
  const specialization = WeakImplHelper.specialize(
      XServiceInfo,
      XInitialization,
      XImporter,
      XExporter,
      XFilter,
    ),
    data = specialization.ClassData;
  expect(
    WeakImplHelper.specialize(XServiceInfo, XInitialization, XImporter, XExporter, XFilter),
  ).toBe(specialization);
  expect(data.m_nTypes).toBe(6);
  const entries = getTypeEntries(data),
    names = entries.map(
      /** Borrows actual cached original interface reference names. @param entry - Original type entry. @returns Declared name. */ (
        entry,
      ) => {
        if (!("typeRef" in entry.m_type))
          throw new Error("Native class-data type refs were not initialized");
        const value = new OUString(entry.m_type.typeRef.pTypeName);
        try {
          return text(value);
        } finally {
          value.dispose();
        }
      },
    );
  expect(data.m_storedTypeRefs).toBe(true);
  expect(getTypeEntries(data)).toBe(entries);
  expect(names).toEqual([
    "com.sun.star.lang.XServiceInfo",
    "com.sun.star.lang.XInitialization",
    "com.sun.star.document.XImporter",
    "com.sun.star.document.XExporter",
    "com.sun.star.document.XFilter",
    "com.sun.star.lang.XTypeProvider",
  ]);
});
it("retains source component/descriptor/factory argument and result types without fabricated implementations", /** Compile-time checks cover all six original declared method groups. @returns Nothing. */ () => {
  expectTypeOf<Parameters<XImporter["setTargetDocument"]>>().toEqualTypeOf<
    [Reference<XComponent>]
  >();
  expectTypeOf<Parameters<XExporter["setSourceDocument"]>>().toEqualTypeOf<
    [Reference<XComponent>]
  >();
  expectTypeOf<Parameters<XFilter["filter"]>>().toEqualTypeOf<[Sequence<PropertyValue>]>();
  expectTypeOf<ReturnType<XFilter["filter"]>>().toEqualTypeOf<boolean>();
  expectTypeOf<XFilter["cancel"]>().toEqualTypeOf<() => void>();
  expectTypeOf<Parameters<XInitialization["initialize"]>>().toEqualTypeOf<[Sequence<Any>]>();
  expectTypeOf<ReturnType<XServiceInfo["getImplementationName"]>>().toEqualTypeOf<OUString>();
  expectTypeOf<Parameters<XServiceInfo["supportsService"]>>().toEqualTypeOf<
    [OUStringConstReference]
  >();
  expectTypeOf<ReturnType<XServiceInfo["getSupportedServiceNames"]>>().toEqualTypeOf<
    Sequence<OUString>
  >();
  expectTypeOf<Parameters<XMultiServiceFactory["createInstance"]>>().toEqualTypeOf<
    [OUStringConstReference]
  >();
  expectTypeOf<Parameters<XMultiServiceFactory["createInstanceWithArguments"]>>().toEqualTypeOf<
    [OUStringConstReference, Sequence<Any>]
  >();
  expectTypeOf<ReturnType<XMultiServiceFactory["createInstance"]>>().toEqualTypeOf<
    Reference<XInterface>
  >();
  expectTypeOf<ReturnType<XMultiServiceFactory["createInstanceWithArguments"]>>().toEqualTypeOf<
    Reference<XInterface>
  >();
  expectTypeOf<ReturnType<XMultiServiceFactory["getAvailableServiceNames"]>>().toEqualTypeOf<
    Sequence<OUString>
  >();
});

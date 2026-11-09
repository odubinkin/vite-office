/** @fileoverview Production static component registrations exercised through the real context and service manager. */
import { expect, it } from "vitest";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { PropertyVetoException } from "../../../cppu/inc/com/sun/star/beans/PropertyVetoException";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import {
  BreakIterator_ja,
  BreakIterator_ko,
  BreakIterator_zh,
  BreakIterator_zh_TW,
} from "../../../i18npool/source/breakiterator/breakiterator_cjk";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { BreakIterator } from "../../../offapi/com/sun/star/i18n/BreakIterator";
import { ANYWORD_IGNOREWHITESPACES } from "../../../offapi/com/sun/star/i18n/WordType";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { XNumberText } from "../../../offapi/com/sun/star/linguistic2/XNumberText";
import { READONLY } from "../../../udkapi/com/sun/star/beans/PropertyAttribute";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { InitApplicationServiceManager } from "../../source/app/appinit";
import { implementations } from "./uno-components";

it("installs the original process context and the registered CJK word services", /** Exercises the real service and implementation name lookup. @returns Nothing. */ () => {
  InitApplicationServiceManager(implementations);
  const context = getProcessComponentContext();
  const manager = context.operatorStar().getServiceManager();
  try {
    const iterator = BreakIterator.create(context as Reference<XComponentContext>);
    const value = unicode("word next");
    const locale = new Locale();
    try {
      const service = iterator.operatorStar();
      expect(service.getWordType(value, 0, locale)).toBe(0);
      expect(service.nextWord(value, 0, locale, ANYWORD_IGNOREWHITESPACES)).toEqual({
        startPos: 5,
        endPos: 9,
      });
    } finally {
      locale.dispose();
      value.dispose();
      iterator.dispose();
    }
    const properties = new Reference<XPropertySet>(manager, UNO_QUERY, XPropertySet.static_type);
    const propertyName = unicode("DefaultContext");
    try {
      const service = properties.operatorStar();
      const info = service.getPropertySetInfo();
      const value = service.getPropertyValue(propertyName);
      const stored = new Reference<XComponentContext>(
        value,
        UNO_QUERY,
        XComponentContext.static_type,
      );
      try {
        expect(stored.get()).toBe(context.get());
        const property = info.operatorStar().getPropertyByName(propertyName);
        const all = info.operatorStar().getProperties();
        try {
          expect(property.Attributes).toBe(READONLY);
          expect(property.Handle).toBe(-1);
          expect(all.getLength()).toBe(1);
        } finally {
          all.dispose();
          property.dispose();
        }
        let thrown: unknown;
        try {
          service.setPropertyValue(propertyName, value);
        } catch (error) {
          thrown = error;
        }
        expect(thrown).toBeInstanceOf(PropertyVetoException);
        if (thrown instanceof PropertyVetoException) thrown.dispose();
      } finally {
        stored.dispose();
        value.dispose();
        info.dispose();
      }
    } finally {
      propertyName.dispose();
      properties.dispose();
    }
    for (const [suffix, ctor] of [
      ["ja", BreakIterator_ja],
      ["ko", BreakIterator_ko],
      ["zh", BreakIterator_zh],
      ["zh_TW", BreakIterator_zh_TW],
    ] as const) {
      const service = unicode("com.sun.star.i18n.BreakIterator_" + suffix);
      try {
        const instance = manager
          .operatorStar()
          .createInstanceWithContext(service, context as Reference<XComponentContext>);
        try {
          expect(instance.get()).toBeInstanceOf(ctor);
          const info = new Reference<XServiceInfo>(instance, UNO_QUERY, XServiceInfo.static_type);
          try {
            const name = info.operatorStar().getImplementationName();
            try {
              expect(text(name)).toBe(text(service));
            } finally {
              name.dispose();
            }
          } finally {
            info.dispose();
          }
        } finally {
          instance.dispose();
        }
      } finally {
        service.dispose();
      }
    }
    for (const specifier of [
      "com.sun.star.lingu2.NumberText",
      "com.sun.star.linguistic2.NumberText",
      "NumberText",
    ]) {
      const service = unicode(specifier);
      try {
        const instance = manager
          .operatorStar()
          .createInstanceWithContext(service, context as Reference<XComponentContext>);
        try {
          const typed = new Reference<XNumberText>(instance, UNO_QUERY, XNumberText.static_type);
          try {
            expect(typed.is()).toBe(specifier !== "NumberText");
          } finally {
            typed.dispose();
          }
        } finally {
          instance.dispose();
        }
      } finally {
        service.dispose();
      }
    }
  } finally {
    manager.dispose();
  }
});

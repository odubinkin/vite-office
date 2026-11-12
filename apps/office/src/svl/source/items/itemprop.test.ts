/** @fileoverview Focused generated Property/UnknownPropertyException and SfxItemPropertySetInfo contract checks. */
import { expect, it } from "vitest";
import {
  Property,
  cppu_detail_getUnoType_Property as propertyType,
} from "../../../udkapi/com/sun/star/beans/Property";
import {
  UnknownPropertyException,
  cppu_detail_getUnoType as unknownType,
} from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { UnoType } from "../../../cppu/inc/unotype";
import { SfxItemPropertySetInfo } from "./itemprop";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
it("copies native property metadata without sharing mutable descriptors", /** Executes this bounded native contract operation. @returns Native operation result. */ () => {
  const key = unicode("Value"),
    input = new SfxItemPropertyMapEntry(key, 7, UnoType.get("sal_Int32"), 1, 0),
    info = new SfxItemPropertySetInfo([input]),
    strong = new Reference(info);
  const output = info.getPropertyByName(key);
  expect([
    text(output.Name),
    output.Handle,
    output.Attributes,
    text(output.Type.getTypeName()),
  ]).toEqual(["Value", 7, 1, "long"]);
  output.Attributes = 0;
  const independent = info.getPropertyByName(key);
  expect(independent.Attributes).toBe(1);
  independent.dispose();
  const transported = new Any(output, propertyType),
    restored = new Property();
  expect(transported.extract(restored, propertyType)).toBe(true);
  expect([
    text(restored.Name),
    restored.Handle,
    restored.Attributes,
    text(restored.Type.getTypeName()),
  ]).toEqual(["Value", 7, 0, "long"]);
  transported.dispose();
  restored.dispose();
  output.dispose();
  strong.dispose();
  input.dispose();
  key.dispose();
});
it("throws the generated unknown-property exception and transports its original base fields", /** Executes this bounded native contract operation. @returns Native operation result. */ () => {
  const info = new SfxItemPropertySetInfo([]),
    strong = new Reference(info);
  expect(info.hasPropertyByName(unicode("Missing"))).toBe(false);
  let error: unknown;
  try {
    info.getPropertyByName(unicode("Missing"));
  } catch (caught) {
    error = caught;
  }
  expect(error).toBeInstanceOf(UnknownPropertyException);
  if (!(error instanceof UnknownPropertyException)) throw new Error("Expected generated exception");
  const value = new Any(error, unknownType),
    copy = new UnknownPropertyException();
  error.Message = unicode("Changed");
  expect(value.extract(copy, unknownType)).toBe(true);
  expect(text(copy.Message)).toBe("Missing");
  expect(copy.Context.is()).toBe(false);
  value.dispose();
  copy.dispose();
  error.dispose();
  strong.dispose();
});

import { SfxItemPropertyMapEntry } from "../../inc/itemprop";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";

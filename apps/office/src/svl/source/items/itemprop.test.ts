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
  const input = new Property(unicode("Value"), -1, UnoType.get("sal_Int32"), 1),
    info = new SfxItemPropertySetInfo([input]);
  input.Handle = 99;
  input.Name = unicode("Changed");
  const output = info.getPropertyByName(unicode("Value"));
  expect([
    text(output.Name),
    output.Handle,
    output.Attributes,
    text(output.Type.getTypeName()),
  ]).toEqual(["Value", -1, 1, "long"]);
  output.Attributes = 0;
  expect(info.getPropertyByName(unicode("Value")).Attributes).toBe(1);
  const transported = new Any(output, propertyType),
    restored = new Property();
  expect(transported.extract(restored, propertyType)).toBe(true);
  expect([
    text(restored.Name),
    restored.Handle,
    restored.Attributes,
    text(restored.Type.getTypeName()),
  ]).toEqual(["Value", -1, 0, "long"]);
  transported.dispose();
});
it("throws the generated unknown-property exception and transports its original base fields", /** Executes this bounded native contract operation. @returns Native operation result. */ () => {
  const info = new SfxItemPropertySetInfo([]);
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
});

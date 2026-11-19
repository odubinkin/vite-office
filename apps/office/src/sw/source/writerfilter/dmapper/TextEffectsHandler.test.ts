/** @fileoverview Native Word typographic option values and UNO interoperability shape. */
import { expect, it } from "vitest";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { OOXMLProperty, OOXMLPropertyType, OOXMLValue } from "../ooxml/OOXMLPropertySet";
import { OOXMLFactory_w14 } from "../ooxml/OOXMLFactory_w14";
import { effectIds } from "../ooxml/OOXMLFactory_w14.tables";
import { PropertyMap } from "./PropertyMap";
import {
  makeTextEffect,
  readTextEffect,
  resolveTextEffect,
  TextEffectsHandler,
} from "./TextEffectsHandler";

it("uses native resource IDs and preserves the empty lexical value for an unknown numeric token", /** Verifies the typed callback independently of XML lexical admission. @returns Nothing. */ () => {
  const [root, attribute, definition] = effectIds.ligatures;
  const factory = OOXMLFactory_w14.getInstance();
  const token: [number] = [0];
  expect(factory.getListValue(definition, "standardDiscretional", token)).toBe(true);
  expect(factory.getListValue(definition, "unrecognized", token)).toBe(false);
  const source = OOXMLValue.createInteger(token[0]);
  const handler = new TextEffectsHandler("ligatures");
  handler.attribute(attribute, source);
  const nested = new OOXMLProperty(root, source, OOXMLPropertyType.SPRM);
  handler.sprm(nested);
  handler.attribute(effectIds.numForm[1], OOXMLValue.createInteger(0));
  const bag = handler.getInteropGrabBag();
  const map = new PropertyMap();
  try {
    expect(readTextEffect("CharLigaturesTextEffect", bag)).toEqual([
      "ligatures",
      "standardDiscretional",
    ]);
    expect(resolveTextEffect(nested, map)).toBe(true);
    expect(map.GetPropertyValues()).toHaveLength(0);
    handler.attribute(attribute, OOXMLValue.createInteger(0));
    const fallback = handler.getInteropGrabBag();
    try {
      expect(readTextEffect("CharLigaturesTextEffect", fallback)).toEqual(["ligatures", ""]);
    } finally {
      fallback.dispose();
    }
  } finally {
    map.dispose();
    bag.dispose();
  }
});

it("rejects mismatched and ill-typed UNO properties with a known interoperability key", /** Exercises malformed external modification of the native value. @returns Nothing. */ () => {
  const key = "CharLigaturesTextEffect";
  const voidValue = new Any();
  const mismatched = makeTextEffect("numForm", "lining");
  const name = unicode("ligatures");
  const root = new PropertyValue();
  root.Name = name;
  const missingSequence = new Any(root, propertyType);
  try {
    expect(readTextEffect(key, voidValue)).toBeUndefined();
    expect(readTextEffect(key, mismatched)).toBeUndefined();
    expect(readTextEffect(key, missingSequence)).toBeUndefined();
  } finally {
    missingSequence.dispose();
    root.dispose();
    name.dispose();
    mismatched.dispose();
    voidValue.dispose();
  }
});

/** @fileoverview Native WritingMode property metadata, signed-short item transport and real cursor/style storage over actual Writer owners. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { TypeClass } from "../../../../udkapi/com/sun/star/uno/TypeClass";
import { IllegalArgumentException } from "../../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import { RES_FRAMEDIR } from "../../../inc/hintids";
import { queryItem, putItem } from "./unocrsrhelper";
import { SwUnoPropertyMap } from "./unomap";
/** Extracts the actual native signed-short value and releases the owned Any. @param value - Actual returned property. @returns WritingMode2 scalar. */
function mode(value: Any): number {
  try {
    const result: [number] = [-1];
    expect(value.getValueTypeClass()).toBe(TypeClass.SHORT);
    expect(value.extract(result, "sal_Int16")).toBe(true);
    return result[0];
  } finally {
    value.dispose();
  }
}
it("publishes exact native WritingMode metadata and the Environment default", /** Original unomap1.cxx entry is short/PROPERTY_NONE/member0/RES_FRAMEDIR. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    model = new SwXTextDocument(doc),
    cursor = model.getText().createTextCursor(),
    key = unicode("WritingMode");
  try {
    const property = metadata(cursor.getPropertySetInfo()).getPropertyByName(key);
    try {
      expect(property.Type.getTypeClass()).toBe(TypeClass.SHORT);
      expect(property.Attributes).toBe(0);
      expect(property.Handle).toBe(RES_FRAMEDIR);
    } finally {
      property.Name.dispose();
      property.Type.dispose();
    }
    expect(mode(cursor.getPropertyValue(key))).toBe(4);
  } finally {
    key.dispose();
    cursor.dispose();
    model.dispose();
    doc.Dispose();
  }
});
it.each([0, 1, 2, 3, 4, 5, 6, 7])(
  "transports native cursor WritingMode %s through actual item QueryValue/PutValue",
  /** Native Any and registered source item must retain their identity and signed-short type. @param value - Original WritingMode2 value. @returns Nothing. */ (
    value,
  ) => {
    const doc = new SwDoc(),
      model = new SwXTextDocument(doc),
      cursor = model.getText().createTextCursor(),
      key = unicode("WritingMode"),
      input = new Any([value], "sal_Int16");
    try {
      cursor.setPropertyValue(key, input);
      expect(mode(cursor.getPropertyValue(key))).toBe(value);
      const node = doc.paragraphs[0];
      assert(node);
      const item = node.GetSwAttrSet().Get(RES_FRAMEDIR);
      assert(item instanceof SvxFrameDirectionItem);
      expect(item.QueryValue()).toBe(value);
      expect(doc.GetAttrPool().GetPoolDefaultItem(RES_FRAMEDIR).QueryValue()).toBe(4);
    } finally {
      input.dispose();
      key.dispose();
      cursor.dispose();
      model.dispose();
      doc.Dispose();
    }
  },
);
it("rejects invalid typed enum input without mutating the real pooled source item", /** Original short extraction and WritingMode switch remain in the actual item owner. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    entry = SwUnoPropertyMap.get("WritingMode");
  assert(entry);
  const item = doc.GetAttrPool().GetPoolDefaultItem(RES_FRAMEDIR),
    invalid = new Any([32767], "sal_Int16");
  try {
    let thrown: unknown;
    try {
      putItem(item, entry, invalid);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(IllegalArgumentException);
    if (thrown instanceof IllegalArgumentException) thrown.dispose();
    expect(mode(queryItem(item, entry))).toBe(4);
  } finally {
    invalid.dispose();
    doc.Dispose();
  }
});

import { metadata } from "../../../../test/uno-property-metadata";

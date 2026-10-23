/** @fileoverview Native character automatic-style API identities and direct paragraph versus inline ownership. */
import { expect, it } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { PropertyState } from "../../../../udkapi/com/sun/star/beans/PropertyState";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { text, unicode, stringValue } from "./unocrsrhelper";
import { RES_CHRATR_COLOR } from "../../../inc/hintids";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
/** Reads a typed native color. @param value - Owned Any. @returns RGB integer. */
function color(value: Any): number {
  const result: [number] = [0];
  try {
    expect(value.extract(result, "sal_Int32")).toBe(true);
    return result[0];
  } finally {
    value.dispose();
  }
}
it("interns native style identities and keeps a full-span automatic style separate from paragraph items", /** Exercises actual supplier, item pool, property cursor and range owners. @returns Nothing. */ () => {
  const doc = createWriterDocument(),
    model = new SwXTextDocument(doc),
    cursor = model.getText().createTextCursor();
  const input = unicode("Text"),
    colorName = unicode("CharColor"),
    familyName = unicode("CharacterStyles"),
    autoName = unicode("CharAutoStyleName");
  const base = new Any([0x123456], "sal_Int32"),
    foreground = new Any([0xabcdef], "sal_Int32");
  const property = new PropertyValue(colorName, -1, foreground, PropertyState.DIRECT_VALUE);
  try {
    model.getText().insertString(cursor, input, false);
    cursor.gotoStart(false);
    cursor.gotoEnd(true);
    cursor.setPropertyValue(colorName, base);
    const family = model.getAutoStyles().getByName(familyName),
      first = family.insertStyle([property]),
      second = family.insertStyle([property]);
    const name = first.getPropertyValue(autoName),
      otherName = second.getPropertyValue(autoName);
    try {
      expect(stringValue(name)).toBe(stringValue(otherName));
      const handle = doc
        .GetIStyleAccess()
        .getByName(stringValue(name), SwAutoStyleFamily.AUTO_STYLE_CHAR);
      expect(handle?.Get(RES_CHRATR_COLOR)).toBeInstanceOf(SfxStringItem);
      cursor.setPropertyValue(autoName, name);
      const applied = cursor.getPropertyValue(autoName);
      try {
        expect(stringValue(applied)).toBe(stringValue(name));
      } finally {
        applied.dispose();
      }
    } finally {
      name.dispose();
      otherName.dispose();
    }
    expect(color(cursor.getPropertyValue(colorName))).toBe(0xabcdef);
    expect((doc.paragraphs[0]?.GetAttr(RES_CHRATR_COLOR) as SfxStringItem).GetValue()).toBe(
      "#123456",
    );
    expect(doc.paragraphs[0]?.GetpSwpHints()?.Count()).toBe(1);
    expect(text(cursor.getString())).toBe("Text");
  } finally {
    property.Name.dispose();
    property.Value.dispose();
    base.dispose();
    foreground.dispose();
    for (const value of [input, colorName, familyName, autoName]) value.dispose();
    cursor.dispose();
    model.dispose();
    doc.Dispose();
  }
});

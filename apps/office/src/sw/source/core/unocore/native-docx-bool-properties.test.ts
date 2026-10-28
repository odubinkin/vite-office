/** @fileoverview Actual DOCX-needed Writer bool properties retain native item types, strict UNO transport, worker value restoration and primary ODT roundtrips. */
import { expect, it } from "vitest";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { IllegalArgumentException } from "../../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { SvxWordLineModeItem } from "../../../../editeng/inc/wrlmitem";
import { SvxAutoKernItem } from "../../../../editeng/inc/autokernitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { createWriterDocument } from "../doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { SwUnoPropertyMap } from "./unomap";
import { putItem, unicode, stringAny } from "./unocrsrhelper";
import { RES_CHRATR_WORDLINEMODE as WORD, RES_CHRATR_AUTOKERN as KERN } from "../../../inc/hintids";
import { encodeSfxPoolItem, decodeSfxPoolItem } from "../../../browser/filter/xml/item-codec";
import { DomainMapper } from "../../writerfilter/dmapper/DomainMapper";
import {
  OOXMLProperty,
  OOXMLPropertyType as T,
  OOXMLValue as V,
} from "../../writerfilter/ooxml/OOXMLPropertySet";
import { NS_ooxml as N } from "../../writerfilter/inc/ooxml/resourceids";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import type { SwXTextCursor } from "./unoobj";

/** Reads actual typed bool properties and releases the returned Any. @param cursor - Actual cursor. @param name - UNO name. @returns Bool. */
function query(cursor: SwXTextCursor, name: string): boolean {
  const key = unicode(name),
    value = cursor.getPropertyValue(key),
    out: [boolean] = [false];
  key.dispose();
  try {
    expect(value.extract(out, "bool")).toBe(true);
    return out[0];
  } finally {
    value.dispose();
  }
}

it("retains original Which/slot/default concrete items through typed UNO cloning and worker restoration", /** Verifies real pool items rather than bool DTO surrogates. @returns Nothing. */ () => {
  const doc = createWriterDocument(),
    pool = doc.GetAttrPool();
  try {
    for (const [name, which, slot, type] of [
      ["CharWordMode", WORD, 10011, SvxWordLineModeItem],
      ["CharAutoKerning", KERN, 10067, SvxAutoKernItem],
    ] as const) {
      expect(which).toBe(name === "CharWordMode" ? 16 : 17);
      expect(pool.GetWhichIDFromSlotID(slot)).toBe(which);
      const original = pool.GetPoolDefaultItem(which) as SfxBoolItem,
        entry = SwUnoPropertyMap.get(name) as NonNullable<ReturnType<typeof SwUnoPropertyMap.get>>;
      expect(original).toBeInstanceOf(type);
      expect(original.GetValue()).toBe(false);
      for (const boolean of [true, false]) {
        const value = new Any([boolean], "bool");
        const copy = putItem(original, entry, value) as SfxBoolItem;
        value.dispose();
        expect(copy).toBeInstanceOf(type);
        expect(copy).not.toBe(original);
        expect(copy.GetValue()).toBe(boolean);
        expect(original.GetValue()).toBe(false);
        const restored = decodeSfxPoolItem(pool, encodeSfxPoolItem(copy)) as SfxBoolItem;
        expect(restored).toBeInstanceOf(type);
        expect(restored.GetValue()).toBe(boolean);
      }
      const invalid = stringAny("true");
      let caught: unknown;
      try {
        putItem(original, entry, invalid);
      } catch (error) {
        caught = error;
      } finally {
        invalid.dispose();
      }
      expect(caught).toBeInstanceOf(IllegalArgumentException);
      expect(original.GetValue()).toBe(false);
    }
  } finally {
    doc.Dispose();
  }
});

it.each([0, 2, 28])(
  "maps native DOCX kerning threshold %s to the original bool and retains word-only underline in the real graph and ODT",
  /** Uses production mapper, Writer APIs, XML writer and importer. @param threshold - Word half-point threshold. @returns Roundtrip completion. */ async (
    threshold,
  ) => {
    const model = new SwXTextDocument(createWriterDocument()),
      mapper = new DomainMapper(model, SourceDocumentType.OOXML);
    try {
      mapper.startParagraphGroup();
      mapper.startCharacterGroup();
      mapper.attribute(N.LN_CT_Underline_val, V.createInteger(N.LN_Value_ST_Underline_words));
      mapper.sprm(new OOXMLProperty(N.LN_EG_RPrBase_kern, V.createInteger(threshold), T.SPRM));
      mapper.utext(new Uint16Array([97, 32, 98]));
      mapper.endCharacterGroup();
      mapper.utext(new Uint16Array([13]));
      mapper.endParagraphGroup();
      mapper.finishDocument();
      const cursor = model.getText().createTextCursor();
      cursor.gotoStart(false);
      cursor.goRight(3, true);
      expect(query(cursor, "CharWordMode")).toBe(true);
      expect(query(cursor, "CharAutoKerning")).toBe(threshold !== 0);
      cursor.dispose();
      const bytes = writeOdtDocument(model.GetDoc(), { title: "DOCX bool properties" }),
        zip = new ZipFile(bytes);
      const content = await zip.readTextEntry("content.xml");
      expect(content).toContain('style:text-underline-mode="skip-white-space"');
      expect(content).toContain('style:letter-kerning="' + String(threshold !== 0) + '"');
      const reopened = await readOdtDocument(bytes, { title: "DOCX bool properties" }),
        restored = new SwXTextDocument(reopened.document);
      try {
        const range = restored.getText().createTextCursor();
        range.gotoStart(false);
        range.goRight(3, true);
        expect(query(range, "CharWordMode")).toBe(true);
        expect(query(range, "CharAutoKerning")).toBe(threshold !== 0);
        range.dispose();
      } finally {
        restored.dispose();
      }
    } finally {
      mapper.dispose();
      model.dispose();
    }
  },
);

import { SourceDocumentType } from "../../writerfilter/inc/dmapper/DomainMapperFactory";

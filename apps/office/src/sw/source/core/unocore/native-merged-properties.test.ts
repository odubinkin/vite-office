/** @fileoverview Integration regressions for Writer import APIs sharing the native color and optional page-offset items. */
import { assert, expect, it, vi } from "vitest";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { Color, ColorTransparency } from "../../../../tools/inc/color";
import { ThemeColorType } from "../../../../docmodel/inc/theme/ThemeColorType";
import { RES_CHRATR_COLOR, RES_PAGEDESC } from "../../../inc/hintids";
import { createWriterDocument } from "../doc/doc";
import { SwFormatPageDesc } from "../attr/fmtpdsc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { unicode, putItem, queryItem } from "./unocrsrhelper";
import { SwUnoPropertyMap } from "./unomap";
import { applyTextImportProperties } from "../../../../xmloff/source/text/txtprmap";
import { SwXStyle } from "./unostyle";
import { RuntimeException } from "../../../../cppu/inc/com/sun/star/uno/RuntimeException";

it("preserves native color values and theme metadata across API replacement without mutating the original", /** Exercises the real pooled-item/API boundary with automatic and alpha colors. @returns Nothing. */ () => {
  const entry = SwUnoPropertyMap.get("CharColor");
  assert(entry, "CharColor must be exposed by the actual Writer property map");
  const original = new SvxColorItem(new Color(0x123456), RES_CHRATR_COLOR);
  original.getComplexColor().setThemeColor(ThemeColorType.Accent1);
  for (const packed of [0xabcdef, -1, -2146290602]) {
    const input = new Any([packed], "sal_Int32");
    const result = putItem(original, entry, input) as SvxColorItem;
    const output = queryItem(result, entry);
    try {
      const value: [number] = [0];
      expect(output.extract(value, "sal_Int32")).toBe(true);
      expect(value[0]).toBe(packed);
      expect(result.GetValue().toUInt32()).toBe(
        new Color(ColorTransparency, packed, "ColorTransparencyTag").toUInt32(),
      );
      expect(result.getComplexColor().getThemeColorType()).toBe(ThemeColorType.Accent1);
      expect(original.GetValue().toUInt32()).toBe(0x123456);
    } finally {
      input.dispose();
      output.dispose();
    }
  }
});

it("keeps absent, explicit zero and signed page offsets distinct through the actual text cursor", /** Verifies the merged property facade delegates native optional-value behavior. @returns Nothing. */ () => {
  const document = createWriterDocument();
  const model = new SwXTextDocument(document);
  const cursor = model.getText().createTextCursor();
  const name = unicode("PageNumberOffset");
  const paragraph = document.paragraphs[0];
  assert(paragraph, "Writer starts with a canonical paragraph");
  try {
    const initial = cursor.getPropertyValue(name);
    expect(initial.hasValue()).toBe(false);
    initial.dispose();
    for (const offset of [0, -1, 32767, -32768, undefined]) {
      const input = offset === undefined ? new Any() : new Any([offset], "sal_Int16");
      cursor.setPropertyValue(name, input);
      input.dispose();
      const output = cursor.getPropertyValue(name);
      try {
        expect(output.hasValue()).toBe(offset !== undefined);
        if (offset !== undefined) {
          const actual: [number] = [0];
          expect(output.extract(actual, "sal_Int16")).toBe(true);
          expect(actual[0]).toBe(offset);
        }
        expect((paragraph.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetNumOffset()).toBe(
          offset === undefined ? undefined : offset & 0xffff,
        );
      } finally {
        output.dispose();
      }
    }
    const invalid = new Any([true], "bool");
    try {
      expect(
        /** Rejects incompatible Any values through the real property facade. @returns Nothing. */ () =>
          cursor.setPropertyValue(name, invalid),
      ).toThrow();
      expect((paragraph.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetNumOffset()).toBeUndefined();
    } finally {
      invalid.dispose();
    }
  } finally {
    name.dispose();
    cursor.dispose();
    model.dispose();
    document.Dispose();
  }
});

it("transports XML auto as a void page offset while retaining explicit zero and signed numeric offsets", /** Follows XMLNumberWithAutoForVoidPropHdl through the actual Writer property owner. @returns Nothing. */ () => {
  const document = createWriterDocument();
  const model = new SwXTextDocument(document);
  const cursor = model.getText().createTextCursor();
  const paragraph = document.paragraphs[0];
  assert(paragraph, "Writer starts with a canonical paragraph");
  try {
    paragraph.SetAttr(new SwFormatPageDesc("", 42));
    applyTextImportProperties(cursor, {}, {});
    expect((paragraph.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetNumOffset()).toBe(42);
    for (const pageNumber of ["auto", 0, -1, 32768] as const) {
      applyTextImportProperties(cursor, {}, { pageNumber });
      expect((paragraph.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetNumOffset()).toBe(
        pageNumber === "auto" ? undefined : pageNumber & 65535,
      );
    }
  } finally {
    cursor.dispose();
    model.dispose();
    document.Dispose();
  }
});

it("retries native failed batches individually, retaining valid properties and ignoring only declared conversion and unknown-property failures", /** Exercises FillPropertySet failure isolation through real cursor and page-style services. @returns Nothing. */ () => {
  const document = createWriterDocument();
  const model = new SwXTextDocument(document);
  const cursor = model.getText().createTextCursor();
  const weight = unicode("CharWeight");
  const escapement = unicode("CharEscapementHeight");
  const page = new SwXStyle(document, "PageStyles");
  page.Attach("Native failure isolation");
  try {
    applyTextImportProperties(cursor, { fontWeight: 150, escapementHeight: 0 });
    const bold = cursor.getPropertyValue(weight);
    const normal = cursor.getPropertyValue(escapement);
    const actual: [number] = [0];
    expect(bold.extract(actual, "float")).toBe(true);
    expect(actual[0]).toBe(150);
    expect(normal.extract(actual, "sal_Int8")).toBe(true);
    expect(actual[0]).toBe(100);
    bold.dispose();
    normal.dispose();
    applyTextImportProperties(page, {}, { keepWithNext: true });
    cursor.dispose();
    let error: unknown;
    try {
      applyTextImportProperties(cursor, { fontWeight: 150 });
    } catch (failure) {
      error = failure;
    }
    expect(error).toBeInstanceOf(RuntimeException);
    if (error instanceof RuntimeException) error.dispose();
  } finally {
    weight.dispose();
    escapement.dispose();
    cursor.dispose();
    model.dispose();
    document.Dispose();
  }
});

it("propagates unexpected host failures from the XML property boundary without silently retrying", /** Failure injection observes error ownership on the actual cursor service, without replacing document state. @returns Nothing. */ () => {
  const document = createWriterDocument();
  const model = new SwXTextDocument(document);
  const cursor = model.getText().createTextCursor();
  const failure = new Error("host property failure");
  const batch = vi.spyOn(cursor, "setPropertyValues").mockImplementationOnce(
    /** Injects one unexpected failure at the service boundary. @returns Never. */ () => {
      throw failure;
    },
  );
  const single = vi.spyOn(cursor, "setPropertyValue");
  try {
    expect(
      /** Applies one valid property through the observed native service. @returns Nothing. */ () =>
        applyTextImportProperties(cursor, { fontWeight: 150 }),
    ).toThrow(failure);
    expect(single).not.toHaveBeenCalled();
  } finally {
    batch.mockRestore();
    single.mockRestore();
    cursor.dispose();
    model.dispose();
    document.Dispose();
  }
});

/** @fileoverview Original native Calc service catalog witnesses and exact compatibility lookup; no replacement service factory. */
import { expect, it } from "vitest";
import { ScServiceProviderType as Type } from "../../../inc/servuno";
import { ScServiceProvider } from "./servuno";
import { rtl_uString_assign } from "../../../../sal/rtl/ustring";
import type { SequenceElements } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { rtl_uStringSlot } from "../../../../sal/inc/rtl/ustring.h";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import native from "./servuno.native.json";
it("matches the compiled original catalog order, aliases and exact provider ordinals", /** Original C++ table/method witness uses unchanged name order and enum definitions. @returns Nothing. */ () => {
  const names = ScServiceProvider.GetAllServiceNames();
  try {
    expect(names.getLength()).toBe(native.modern.length);
    for (let i = 0; i < names.getLength(); ++i) {
      const name = OUString.unacquired(names.operatorIndex(i));
      expect(text(name)).toBe(native.modern[i]?.name);
      expect(ScServiceProvider.GetProviderType(name)).toBe(native.modern[i]?.type);
    }
  } finally {
    names.dispose();
  }
});
it("preserves old release-compatible names without advertising them and rejects near matches", /** Does not lowercase, trim or truncate counted service names. @returns Nothing. */ () => {
  const names = ScServiceProvider.GetAllServiceNames();
  try {
    for (const entry of native.old) {
      const name = unicode(entry.name);
      try {
        expect(ScServiceProvider.GetProviderType(name)).toBe(entry.type);
        for (let i = 0; i < names.getLength(); ++i)
          expect(OUString.unacquired(names.operatorIndex(i)).equals(name)).toBe(false);
      } finally {
        name.dispose();
      }
    }
    for (const value of [
      "",
      "com.sun.star.sheet.spreadsheet",
      " com.sun.star.sheet.Spreadsheet",
      "com.sun.star.sheet.Spreadsheet\0suffix",
      "com.sun.star.sheet.Spreadsheet\ud800",
      "stardiv.one.text.textfield.PageCount",
    ]) {
      const name = unicode(value);
      try {
        expect(ScServiceProvider.GetProviderType(name)).toBe(Type.INVALID);
      } finally {
        name.dispose();
      }
    }
  } finally {
    names.dispose();
  }
});
it("returns independent mutable sequences while retaining the original duplicated VBA alias", /** Caller COW mutation cannot alter static source catalog entries. @returns Nothing. */ () => {
  const first = ScServiceProvider.GetAllServiceNames(),
    second = ScServiceProvider.GetAllServiceNames();
  try {
    const replacement = unicode("changed");
    try {
      rtl_uString_assign(
        (first.getArray() as SequenceElements).get(0) as rtl_uStringSlot,
        replacement.pData,
      );
    } finally {
      replacement.dispose();
    }
    expect(text(OUString.unacquired(second.operatorIndex(0)))).toBe(
      "com.sun.star.sheet.Spreadsheet",
    );
    const third = ScServiceProvider.GetAllServiceNames();
    try {
      const values: string[] = [];
      for (let i = 0; i < third.getLength(); ++i)
        values.push(text(OUString.unacquired(third.operatorIndex(i))));
      expect(
        values.filter(
          /** Original identical entries remain identical. @param value - Catalog name. @returns Whether the original VBA alias. */ (
            value,
          ) => value === "ooo.vba.VBAGlobals",
        ),
      ).toHaveLength(2);
      expect(values[0]).toBe("com.sun.star.sheet.Spreadsheet");
    } finally {
      third.dispose();
    }
  } finally {
    second.dispose();
    first.dispose();
  }
});

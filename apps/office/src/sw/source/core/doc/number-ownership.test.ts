/** @fileoverview Compares optional rule formats, base tables and reference Set with literal unchanged pinned native results. */
import {
  createWriterNumFormat,
  getWriterNumFormatBullet,
  SvxNumType,
  SwNumFormat,
  SwNumRule,
  SwNumRuleType,
  type ConstSwNumFormat,
} from "./number";

import { expect, it } from "vitest";
import native from "./number-ownership-native.json";
import none from "./number-none-native.json";
import type { SvxNumPositionAndSpaceMode } from "../../../../editeng/source/items/numitem";
import { createWriterDocument } from "./doc";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";

/** Projects exactly the implemented native fields emitted by the differential oracle. @param format - Const format. @returns Primitive state. */
function state(format: ConstSwNumFormat) {
  const p = format.GetPositionProperties();
  return [
    [
      SvxNumType.SVX_NUM_ARABIC,
      SvxNumType.SVX_NUM_CHAR_SPECIAL,
      SvxNumType.SVX_NUM_NUMBER_NONE,
    ].indexOf(format.GetNumberingType()),
    format.GetStart(),
    format.GetIncludeUpperLevels(),
    getWriterNumFormatBullet(format).codePointAt(0),
    p.absLSpace,
    p.firstLineOffset,
    p.charTextDistance,
    p.firstLineIndent,
    p.indentAt,
    p.listTabPosition,
    ["listtab", "nothing", "space"].indexOf(p.labelFollowedBy),
    ["label-width-and-position", "label-alignment"].indexOf(p.positionAndSpaceMode),
    format.GetPrefix(),
    format.GetSuffix(),
    format.HasListFormat(),
    format.HasListFormat() ? format.GetListFormat() : "",
  ];
}

it("matches all four shared native default tables and optional owned levels", /** Verifies 40 literal native levels, const references and sparse copies. @returns Nothing. */ () => {
  for (const row of native.defaults) {
    const mode = ["label-width-and-position", "label-alignment"][
      row.mode
    ] as SvxNumPositionAndSpaceMode;
    const rule = new SwNumRule("rule", mode, row.type);
    const other = new SwNumRule("other", mode, row.type);
    expect(rule.GetNumFormat(row.level) !== undefined).toBe(row.raw);
    expect(state(rule.Get(row.level))).toEqual(row.value);
    expect(rule.Get(row.level)).toBe(other.Get(row.level));
    expect(rule.clone().Get(row.level)).toBe(rule.Get(row.level));
    expect(rule.clone().GetNumFormat(row.level)).toBeUndefined();
    expect(rule.IsAutoRule()).toBe(true);
    expect(rule.GetDefaultListId()).toBe("");
    expect(rule.GetDefaultNumberFormatPositionAndSpaceMode()).toBe(mode);
    expect(Object.isFrozen(rule.Get(row.level))).toBe(true);
  }
  const settersAreAbsent: Extract<keyof ReturnType<SwNumRule["Get"]>, `Set${string}`> extends never
    ? true
    : false = true;
  expect(settersAreAbsent).toBe(true);
  const protectedFormat = new SwNumRule("const", "label-alignment").Get(0);
  expect(
    /** Checks that a forced JS const violation cannot corrupt shared defaults. @returns Nothing. */ () =>
      (protectedFormat as SwNumFormat).SetStart(99),
  ).toThrow(TypeError);
  expect(
    /** Rejects the established browser blank-name input domain. @returns Rule. */ () =>
      new SwNumRule(" ", "label-alignment"),
  ).toThrow("must not be blank");
  const outline = new SwNumRule("Outline", "label-alignment", SwNumRuleType.OUTLINE_RULE);
  expect(outline.MakeNumString([7], 0)).toBe("");
  const format = outline.Get(0).clone();
  format.SetPrefix("[");
  format.SetSuffix("]");
  outline.Set(0, format);
  expect(outline.MakeNumString([7], 0)).toBe("[]");
  const numeric = new SwNumRule("Numbers", "label-alignment");
  numeric.Set(0, format);
  expect(numeric.MakeNumString([7, 3], 1)).toBe("3.");
  for (const level of [-1, 0.5, 10]) {
    expect(
      /** Rejects an invalid effective level. @returns Format. */ () => numeric.Get(level),
    ).toThrow("outside");
    expect(
      /** Rejects an invalid Set level. @returns Nothing. */ () => numeric.Set(level, format),
    ).toThrow("outside");
  }
});

it("matches native reference Set identity, equality, invalidation and sparse copy", /** Exercises each implemented equality field independently against 19 literal native traces. @returns Nothing. */ () => {
  const operationDocument = createWriterDocument();
  for (const row of native.ownership) {
    const rule = new SwNumRule("rule", "label-alignment");
    const other = new SwNumRule("other", "label-alignment");
    expect(rule.Get(2) === other.Get(2)).toBe(row.sharedDefault);
    rule.Set(2, rule.Get(2));
    const owned = rule.GetNumFormat(2) as ConstSwNumFormat;
    expect(owned).not.toBe(other.Get(2));
    const original = owned.clone();
    const p = original.GetPositionProperties(),
      m = original.GetMarkerProperties();
    let input = original;
    switch (row.change) {
      case 0:
        break;
      case 1:
        input.SetStart(7);
        break;
      case 2:
        input.SetIncludeUpperLevels(3);
        break;
      case 3:
        input.SetPrefix("[");
        break;
      case 4:
        input.SetSuffix("]");
        break;
      case 5:
        input.SetListFormat("");
        break;
      case 6:
        input.SetListFormat();
        break;
      case 7:
        input = createWriterNumFormat("numbered", getWriterNumFormatBullet(original), {
          ...p,
          ...m,
          absLSpace: 11,
        });
        break;
      case 8:
        input = createWriterNumFormat("numbered", getWriterNumFormatBullet(original), {
          ...p,
          ...m,
          firstLineOffset: -11,
        });
        break;
      case 9:
        input = createWriterNumFormat("numbered", getWriterNumFormatBullet(original), {
          ...p,
          ...m,
          charTextDistance: 11,
        });
        break;
      case 10:
        input = createWriterNumFormat("numbered", getWriterNumFormatBullet(original), {
          ...p,
          ...m,
          firstLineIndent: -11,
        });
        break;
      case 11:
        input = createWriterNumFormat("numbered", getWriterNumFormatBullet(original), {
          ...p,
          ...m,
          indentAt: 11,
        });
        break;
      case 12:
        input = createWriterNumFormat("numbered", getWriterNumFormatBullet(original), {
          ...p,
          ...m,
          listTabPosition: 11,
        });
        break;
      case 13:
        input = createWriterNumFormat("numbered", getWriterNumFormatBullet(original), {
          ...p,
          ...m,
          labelFollowedBy: "nothing",
        });
        break;
      case 14:
        input.SetPositionAndSpaceMode("label-width-and-position");
        break;
      case 15:
        input = createWriterNumFormat("bullet", getWriterNumFormatBullet(original), {
          ...p,
          ...m,
          bulletFont: "",
        });
        break;
      case 16:
        input = createWriterNumFormat("numbered", getWriterNumFormatBullet(original), {
          ...p,
          ...m,
          numberingType: "none",
        });
        break;
      case 17:
        input = createWriterNumFormat("numbered", "●", { ...p, ...m });
        break;
      case 18:
        input = createWriterNumFormat("numbered", getWriterNumFormatBullet(original), {
          ...p,
          ...m,
          bulletFont: "Alternate",
        });
        break;
    }
    rule.Validate(operationDocument);
    rule.Set(2, input);
    expect(rule.GetNumFormat(2) === owned).toBe(row.identityRetained);
    expect(rule.IsInvalidRule()).toBe(row.invalid);
    expect(state(rule.Get(2))).toEqual(row.value);
    const copy = rule.clone();
    expect(
      Array.from(
        { length: 10 },
        /** Projects ownership. @param _unused - Slot. @param level - Native level. @returns Presence. */ (
          _unused,
          level,
        ) => rule.GetNumFormat(level),
      ).filter(Boolean),
    ).toHaveLength(row.ownedCount);
    expect(
      Array.from(
        { length: 10 },
        /** Projects clone ownership. @param _unused - Slot. @param level - Native level. @returns Presence. */ (
          _unused,
          level,
        ) => copy.GetNumFormat(level),
      ).filter(Boolean),
    ).toHaveLength(row.copyCount);
    expect(copy.GetNumFormat(2) !== rule.GetNumFormat(2)).toBe(row.copyIndependent);
    expect(copy.Get(2).Equals(rule.Get(2))).toBe(row.copyEqual);
    input.SetStart(99);
    expect(rule.Get(2).GetStart()).not.toBe(99);
    expect(copy.IsInvalidRule()).toBe(true);
  }
  const same = createWriterNumFormat("numbered", "•", { bulletFont: "", listFormat: "" });
  const absent = createWriterNumFormat("numbered", "•", { bulletFont: "" });
  expect(same.Equals(absent)).toBe(false);

  operationDocument.Dispose();
});

it("retains sparse ownership and default selectors in Worker graph v16 with legacy migration", /** Verifies read-only transfer and malformed record rejection while preserving historical explicit formats. @returns Nothing. */ () => {
  const document = createWriterDocument();
  for (const mode of ["label-width-and-position", "label-alignment"] as const) {
    const rule = new SwNumRule(mode, mode, SwNumRuleType.OUTLINE_RULE);
    rule.SetDefaultListId(mode);
    rule.SetAutoRule(false);
    rule.Set(4, rule.Get(4));
    document.AddNumRule(rule);
  }
  const record = encodeWriterDocument(document);
  const copy = decodeWriterDocument(record);
  for (const rule of copy.GetNumRuleTable()) {
    expect(rule.GetNumFormat(0)).toBeUndefined();
    expect(rule.GetNumFormat(4)).toBeDefined();
    expect(rule.Get(0).GetNumberingType()).toBe(SvxNumType.SVX_NUM_NUMBER_NONE);
    expect(rule.GetDefaultNumberFormatPositionAndSpaceMode()).toBe(rule.GetName());
    expect(rule.GetDefaultListId()).toBe(rule.GetName());
    expect(rule.IsAutoRule()).toBe(false);
  }
  const legacy = structuredClone(record);
  for (const rule of legacy.numRules) {
    delete (rule as { ownedLevels?: readonly boolean[] }).ownedLevels;
    delete (rule as { defaultPositionAndSpaceMode?: string }).defaultPositionAndSpaceMode;
    for (const format of rule.formats) delete (format as { numberingType?: string }).numberingType;
  }
  for (const rule of decodeWriterDocument(legacy).GetNumRuleTable()) {
    expect(rule.GetNumFormat(0)).toBeDefined();
    expect(rule.Get(0).GetNumberingType()).toBe(SvxNumType.SVX_NUM_ARABIC);
  }
  for (const mutation of [
    { ownedLevels: [] },
    { ownedLevels: Array(10).fill(1) },
    { formats: [] },
    { defaultPositionAndSpaceMode: "invalid" },
    { ruleType: 2 },
  ]) {
    const malformed = structuredClone(record);
    Object.assign(malformed.numRules[0] as object, mutation);
    expect(
      /** Rejects malformed ownership metadata. @returns Document. */ () =>
        decodeWriterDocument(malformed),
    ).toThrow("invalid");
  }
  const malformed = structuredClone(record);
  Object.assign(malformed.numRules[0]?.formats[0] as object, { numberingType: "invalid" });
  expect(
    /** Rejects malformed format type metadata. @returns Document. */ () =>
      decodeWriterDocument(malformed),
  ).toThrow("format type");
});

it("matches native disabled numbering in valid patterns and legacy joining", /** Checks 16 literal complete native MakeNumString results. @returns Nothing. */ () => {
  for (const row of none) {
    const rule = new SwNumRule("None profile", "label-alignment");
    for (let level = 0; level < 3; level++)
      rule.Set(
        level,
        createWriterNumFormat("numbered", "", {
          numberingType: row.types[level] === 2 ? "none" : "arabic",
          includeUpperLevels: 3,
          prefix: "(",
          suffix: ")",
          ...(row.pattern === null ? {} : { listFormat: row.pattern }),
        }),
      );
    expect(rule.MakeNumString(row.values, 2)).toBe(row.expected);
  }
});

it("rejects the measured native non-progress NONE placeholder profile at the browser boundary", /** Checks the explicit browser guard for the unchanged native timeout input. @returns Nothing. */ () => {
  const rule = new SwNumRule("Non-progress profile", "label-alignment");
  rule.Set(0, createWriterNumFormat("numbered", "", { numberingType: "none" }));
  rule.Set(2, createWriterNumFormat("numbered", "", { listFormat: "%1%" }));
  expect(
    /** Rejects an unsupported non-progress pattern. @returns Marker. */ () =>
      rule.MakeNumString([2, 3, 4], 2),
  ).toThrow("no following placeholder");
});

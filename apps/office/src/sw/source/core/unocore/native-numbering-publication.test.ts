/** @fileoverview Checks native source-owned numbering publication and actual XML/Worker consumers. */
import { expect, it } from "vitest";
import { SwXNumberingRules } from "./unosett";
import { createWriterNumRule } from "../doc/DocumentListsManager";
import { createWriterNumFormat, SvxNumType } from "../doc/number";
import { Font } from "../../../../vcl/source/font/font";
import { SwDoc } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import { SwNumRuleItem } from "../para/paratr";
import { readOdtDocument } from "../../filter/xml/swxml";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";

it("publishes only the active native MM100 geometry group with signed start and source optional predicates", /** Asserts independent pinned unosett literal properties and inactive-field omission. @returns Nothing. */ () => {
  for (const mode of ["label-width-and-position", "label-alignment"] as const) {
    const rule = createWriterNumRule("Publication"),
      format = createWriterNumFormat("bullet", "\0", {
        bulletFont: "",
        prefix: "[",
        suffix: "]",
        start: 65535,
        includeUpperLevels: 10,
        positionAndSpaceMode: mode,
        absLSpace: 72,
        firstLineOffset: -72,
        charTextDistance: 144,
        firstLineIndent: -72,
        indentAt: 144,
        labelFollowedBy: "space",
        listTabPosition: 216,
      });
    rule.Set(9, format);
    const owner = rule.Get(9),
      service = new SwXNumberingRules(rule);
    const expected = {
      kind: "bullet",
      numberingType: 6,
      prefix: "[",
      suffix: "]",
      startWith: -1,
      parentNumbering: 10,
      positionAndSpaceMode: mode,
      bulletChar: "\0",
      ...(mode === "label-width-and-position"
        ? { absLSpace: 127, firstLineOffset: -127, charTextDistance: 254 }
        : { firstLineIndent: -127, indentAt: 254, labelFollowedBy: "space", listTabPosition: 381 }),
    };
    expect(service.getByIndex(9)).toEqual(expected);
    expect(service.getRuleByIndex(9)).toEqual(expected);
    expect(rule.Get(9)).toBe(owner);
    expect(owner.GetPositionProperties()).toEqual({
      positionAndSpaceMode: mode,
      absLSpace: 72,
      firstLineOffset: -72,
      charTextDistance: 144,
      firstLineIndent: -72,
      indentAt: 144,
      labelFollowedBy: "space",
      listTabPosition: 216,
    });
    for (const index of [-1, 10, 1.5, NaN, Infinity])
      expect(
        /** Reads outside the represented native salInt32/MAXLEVEL contract. @returns Nothing. */ () =>
          service.getByIndex(index),
      ).toThrow(RangeError);
  }
});

it("retains native absent present-empty and named Font ownership while returning detached property values", /** Checks CHAR_SPECIAL-only publication, optional ListFormat and original rule updates independently from XML. @returns Nothing. */ () => {
  const rule = createWriterNumRule("Optional"),
    service = new SwXNumberingRules(rule);
  for (const family of [undefined, "", "OpenSymbol"]) {
    const format = createWriterNumFormat("bullet", "🔹", { bulletFont: "" });
    if (family !== undefined) {
      const font = new Font();
      font.SetFamilyName(family);
      format.SetBulletFont(font);
    }
    format.SetListFormat("[%1%/%3%]");
    rule.Set(0, format);
    const owner = rule.Get(0),
      properties = service.getByIndex(0);
    expect(properties.bulletChar).toBe("🔹");
    expect(properties.listFormat).toBe("[%1%/%3%]");
    expect(properties.bulletFont).toEqual(family === undefined ? undefined : { name: family });
    const mutable = properties as { bulletFont?: { name: string }; absLSpace?: number };
    mutable.absLSpace = 999999;
    if (mutable.bulletFont) mutable.bulletFont.name = "Mutated detached descriptor";
    expect(service.getByIndex(0).absLSpace).toBe(0);
    expect(service.getByIndex(0).bulletFont).toEqual(
      family === undefined ? undefined : { name: family },
    );
    expect(rule.Get(0)).toBe(owner);
    format.SetNumberingType(SvxNumType.SVX_NUM_NUMBER_NONE);
    format.SetSuffix("]");
    rule.Set(0, format);
    const numeric = service.getByIndex(0);
    expect(numeric.kind).toBe("numbered");
    expect(numeric.numberingType).toBe(5);
    expect(numeric).not.toHaveProperty("bulletChar");
    expect(numeric).not.toHaveProperty("bulletFont");
    expect(numeric).not.toHaveProperty("listFormat");
  }
});

it("preserves source-owned active properties through common automatic body cell ODT and Worker filters", /** Checks actual package owners rather than a duplicate XML field projection. @returns Completion. */ async () => {
  const source = new SwDoc(),
    body = source.paragraphs[0];
  if (body === undefined) throw Error("Missing body");
  const table = source.GetNodes().MakeTableNode("Properties");
  table.AddColumnWidth(6000);
  const cell = source.GetNodes().AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0];
  if (cell === undefined) throw Error("Missing cell");
  for (const [node, name, kind, mode] of [
    [body, "BodyNative", "bullet", "label-width-and-position"],
    [cell, "CellNative", "numbered", "label-alignment"],
  ] as const) {
    node.SetText(name);
    applyWriterParagraphList(node, { kind, level: 0, ruleName: name });
    const rule = node.GetNumRule();
    if (rule === undefined) throw Error("Missing rule");
    rule.Set(
      0,
      createWriterNumFormat(kind, kind === "bullet" ? "\0" : "", {
        prefix: "[",
        suffix: "]",
        start: 7,
        positionAndSpaceMode: mode,
        absLSpace: 72,
        firstLineOffset: -72,
        charTextDistance: 144,
        firstLineIndent: -72,
        indentAt: 144,
        labelFollowedBy: "space",
        listTabPosition: 216,
      }),
    );
  }
  source.EnsureNumRule("CommonNative", "numbered").Set(
    0,
    createWriterNumFormat("numbered", "", {
      prefix: "[",
      suffix: "]",
      start: 7,
      positionAndSpaceMode: "label-alignment",
      firstLineIndent: -72,
      indentAt: 144,
      labelFollowedBy: "space",
      listTabPosition: 216,
    }),
  );
  source.MakeTextFormatColl("CommonNativeStyle").SetFormatAttr(new SwNumRuleItem("CommonNative"));
  let imported: SwDoc | undefined, reopened: SwDoc | undefined, transferred: SwDoc | undefined;
  try {
    imported = (
      await readOdtDocument(writeOdtDocument(source, { title: "Native" }), { title: "Native" })
    ).document;
    reopened = (
      await readOdtDocument(writeOdtDocument(imported, { title: "Native" }), { title: "Native" })
    ).document;
    transferred = decodeWriterDocument(encodeWriterDocument(imported));
    for (const doc of [imported, reopened, transferred]) {
      for (const name of ["BodyNative", "CellNative", "CommonNative"]) {
        const rule = doc.FindNumRulePtr(name);
        if (rule === undefined) throw Error("Missing imported rule");
        const p = new SwXNumberingRules(rule).getByIndex(0);
        expect(p.startWith).toBe(name === "BodyNative" ? 1 : 7);
        expect(p.prefix).toBe("[");
        expect(p.suffix).toBe("]");
        if (name === "BodyNative") {
          expect(p.bulletChar).toBe("\0");
          expect(p.positionAndSpaceMode).toBe("label-width-and-position");
          expect(p.absLSpace).toBe(127);
          expect(p.firstLineOffset).toBe(-127);
          expect(p.charTextDistance).toBe(254);
          expect(p).not.toHaveProperty("indentAt");
        } else {
          expect(p.positionAndSpaceMode).toBe("label-alignment");
          expect(p.firstLineIndent).toBe(-127);
          expect(p.indentAt).toBe(254);
          expect(p.labelFollowedBy).toBe("space");
          expect(p.listTabPosition).toBe(0);
          expect(p).not.toHaveProperty("absLSpace");
          expect(p).not.toHaveProperty("bulletChar");
        }
      }
      expect(doc.paragraphs[0]?.GetText()).toBe("BodyNative");
      expect(
        doc.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText(),
      ).toBe("CellNative");
    }
  } finally {
    transferred?.Dispose();
    reopened?.Dispose();
    imported?.Dispose();
    source.Dispose();
  }
});

it("exposes source public numbering format and borrowed rule getter entry points", /** Checks native public visibility, static direct ownership and foreign rule arguments across every represented publication predicate. @returns Nothing. */ () => {
  const owner = createWriterNumRule("Owner"),
    foreign = createWriterNumRule("Foreign"),
    service = new SwXNumberingRules(owner);
  for (const mode of ["label-width-and-position", "label-alignment"] as const)
    for (const kind of ["bullet", "numbered"] as const)
      for (const family of [undefined, "", "OpenSymbol"])
        for (const pattern of [false, true]) {
          const format = createWriterNumFormat(kind, "\0", {
            bulletFont: "",
            positionAndSpaceMode: mode,
            firstLineIndent: -72,
            indentAt: 144,
            listTabPosition: 216,
            absLSpace: 72,
            firstLineOffset: -72,
            charTextDistance: 144,
          });
          if (family !== undefined) {
            const font = new Font();
            font.SetFamilyName(family);
            format.SetBulletFont(font);
          }
          if (pattern) format.SetListFormat("[%1%]");
          foreign.Set(3, format);
          const actual = SwXNumberingRules.GetPropertiesForNumFormat(foreign.Get(3));
          expect(service.GetNumberingRuleByIndex(foreign, 3)).toEqual(actual);
          expect(actual.positionAndSpaceMode).toBe(mode);
          expect(actual.bulletChar).toBe(kind === "bullet" ? "\0" : undefined);
          expect(actual.bulletFont).toEqual(
            kind === "bullet" && family !== undefined ? { name: family } : undefined,
          );
          expect(actual.listFormat).toBe(pattern ? "[%1%]" : undefined);
          if (mode === "label-alignment") {
            expect(actual.firstLineIndent).toBe(-127);
            expect(actual.indentAt).toBe(254);
            expect(actual.listTabPosition).toBe(381);
            expect(actual).not.toHaveProperty("absLSpace");
          } else {
            expect(actual.absLSpace).toBe(127);
            expect(actual.firstLineOffset).toBe(-127);
            expect(actual.charTextDistance).toBe(254);
            expect(actual).not.toHaveProperty("indentAt");
          }
        }
});

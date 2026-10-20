/** @fileoverview Native character-property mappings over actual UNO Any. */
import { expect, it } from "vitest";
import { SvXMLUnitConverter } from "../core/xmluconv";
/** Actual converter passed through the native property-handler contract. */
const unitConverter = new SvXMLUnitConverter("twip");
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { XMLFontWeightPropHdl } from "./weighhdl";
import { XMLPosturePropHdl } from "./postuhdl";
import {
  XMLUnderlineTypePropHdl,
  XMLUnderlineStylePropHdl,
  XMLUnderlineWidthPropHdl,
} from "./undlihdl";
import {
  FontSlant,
  cppu_detail_getUnoType_FontSlant as slantType,
} from "../../../offapi/com/sun/star/awt/FontSlant";
it("preserves original weight nearest/tie/clamp mapping and float/int32 export", /** Exercises actual Any. @returns Nothing. */ () => {
  const h = new XMLFontWeightPropHdl(),
    a = new Any(),
    out: [string] = ["old"],
    r: [number] = [0];
  for (const [xml, w] of [
    ["normal", 100],
    ["bold", 150],
    ["100", 50],
    ["200", 60],
    ["300", 75],
    ["350", 90],
    ["500", 105],
    ["600", 110],
    ["800", 175],
    ["900", 200],
    ["150", 60],
    ["149", 50],
    ["", 50],
    ["-", 50],
    ["9999", 200],
  ] as const) {
    expect(h.importXML(xml, a, unitConverter)).toBe(true);
    expect(a.extract(r, "float")).toBe(true);
    expect(r[0]).toBe(w);
  }
  expect(h.importXML("bold ", a, unitConverter)).toBe(false);
  expect(h.importXML("+400", a, unitConverter)).toBe(false);
  for (const [wire, xml] of [
    [0, "0"],
    [50, "100"],
    [60, "200"],
    [75, "300"],
    [90, "350"],
    [100, "normal"],
    [105, "500"],
    [110, "600"],
    [150, "bold"],
    [175, "800"],
    [200, "900"],
    [201, "0"],
  ] as const) {
    a.insert([wire], "float");
    expect(h.exportXML(out, a, unitConverter)).toBe(true);
    expect(out[0]).toBe(xml);
  }
  a.insert([150], "sal_Int32");
  expect(h.exportXML(out, a, unitConverter)).toBe(true);
  expect(out[0]).toBe("bold");
  a.insert([true], "bool");
  out[0] = "old";
  expect(h.exportXML(out, a, unitConverter)).toBe(false);
  expect(out[0]).toBe("old");
  a.dispose();
});
it("retains posture enum mapping and signed fallback", /** Uses generated actual FontSlant type. @returns Nothing. */ () => {
  const h = new XMLPosturePropHdl(),
    a = new Any(),
    out: [string] = ["old"],
    r: [number] = [0];
  for (const [xml, v] of [
    ["normal", FontSlant.NONE],
    ["italic", FontSlant.ITALIC],
    ["oblique", FontSlant.OBLIQUE],
  ] as const) {
    expect(h.importXML(xml, a, unitConverter)).toBe(true);
    expect(a.extract(r, slantType)).toBe(true);
    expect(r[0]).toBe(v);
    expect(h.exportXML(out, a, unitConverter)).toBe(true);
    expect(out[0]).toBe(xml);
  }
  expect(h.importXML("inherit", a, unitConverter)).toBe(false);
  a.insert([FontSlant.REVERSE_ITALIC], "sal_Int32");
  expect(h.exportXML(out, a, unitConverter)).toBe(true);
  expect(out[0]).toBe("italic");
  a.insert([FontSlant.DONTKNOW], slantType);
  out[0] = "old";
  expect(h.exportXML(out, a, unitConverter)).toBe(false);
  expect(out[0]).toBe("old");
  a.insert([true], "bool");
  expect(h.exportXML(out, a, unitConverter)).toBe(false);
  a.dispose();
});
it("retains native underline multi-property merges and export guards", /** Exercises real accumulated Any across the complete line domain. @returns Nothing. */ () => {
  const hs = [
      new XMLUnderlineStylePropHdl(),
      new XMLUnderlineTypePropHdl(),
      new XMLUnderlineWidthPropHdl(),
    ],
    ts = [
      [
        "none",
        "solid",
        "dotted",
        "dash",
        "long-dash",
        "dot-dash",
        "dot-dot-dash",
        "wave",
        "small-wave",
      ],
      ["none", "single", "double"],
      ["auto", "bold", "thin", "medium", "thick"],
    ],
    a = new Any(),
    out: [string] = ["old"];
  for (let i = 0; i < hs.length; i++) {
    const h = hs[i] as (typeof hs)[number];
    for (const token of ts[i] as string[]) {
      a.clear();
      expect(h.importXML(token, a, unitConverter)).toBe(true);
      for (let old = 0; old <= 18; old++) {
        a.insert([old], "sal_Int16");
        expect(h.importXML(token, a, unitConverter)).toBe(true);
      }
    }
    for (let line = 0; line <= 19; line++) {
      a.insert([line], "sal_Int16");
      h.exportXML(out, a, unitConverter);
    }
    expect(h.importXML("invalid", a, unitConverter)).toBe(false);
    a.insert([true], "bool");
    expect(h.exportXML(out, a, unitConverter)).toBe(false);
  }
  const style = hs[0] as XMLUnderlineStylePropHdl,
    type = hs[1] as XMLUnderlineTypePropHdl,
    width = hs[2] as XMLUnderlineWidthPropHdl;
  for (const [handler, token, old, next] of [
    [style, "dotted", 12, 13],
    [style, "dotted", 2, 3],
    [width, "bold", 2, 2],
    [type, "none", 12, 12],
    [style, "none", 12, 12],
  ] as const) {
    a.insert([old], "sal_Int16");
    expect(handler.importXML(token, a, unitConverter)).toBe(true);
    const result: [number] = [0];
    expect(a.extract(result, "sal_Int16")).toBe(true);
    expect(result[0]).toBe(next);
  }
  a.clear();
  style.importXML("wave", a, unitConverter);
  width.importXML("bold", a, unitConverter);
  type.importXML("double", a, unitConverter);
  const r: [number] = [0];
  expect(a.extract(r, "sal_Int16")).toBe(true);
  expect(r[0]).toBe(11);
  expect(type.exportXML(out, a, unitConverter)).toBe(true);
  expect(out[0]).toBe("double");
  a.dispose();
});

/** @fileoverview Literal native shadow and constants handler lexical,Any and failure contracts. */
import { cppu_detail_getUnoType_FontSlant as FontReliefType } from "../../../offapi/com/sun/star/awt/FontSlant";
import { expect, it } from "vitest";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { XMLShadowedPropHdl } from "./shdwdhdl";
import { XMLConstantsPropertyHandler } from "./XMLConstantsPropertyHandler";
import { SvXMLUnitConverter } from "../core/xmluconv";
it("treats only exact none as shadow false and preserves failed export output", /** Uses real typed Any. @returns Nothing. */ () => {
  const handler = new XMLShadowedPropHdl(),
    units = new SvXMLUnitConverter("twip"),
    value = new Any(),
    out: [string] = ["old"];
  try {
    for (const xml of ["none", " none", "NONE", "", "nonsense", "#ff0000 2pt 4pt"]) {
      expect(handler.importXML(xml, value, units)).toBe(true);
      const flag: [boolean] = [false];
      expect(value.extract(flag, "bool")).toBe(true);
      expect(flag[0]).toBe(xml !== "none");
      expect(handler.exportXML(out, value, units)).toBe(true);
      expect(out[0]).toBe(xml === "none" ? "none" : "1pt 1pt");
    }
    value.insert([1], "sal_Int16");
    out[0] = "unchanged";
    expect(handler.exportXML(out, value, units)).toBe(false);
    expect(out[0]).toBe("unchanged");
  } finally {
    value.dispose();
  }
});
it("retains constants signed16 imports and original range/unmapped/output behavior", /** Native conversion is not normalized to convenient bool results. @returns Nothing. */ () => {
  const handler = new XMLConstantsPropertyHandler(
      [
        ["none", 0],
        ["embossed", 1],
        ["engraved", 2],
      ],
      null,
    ),
    units = new SvXMLUnitConverter("twip"),
    value = new Any(),
    out: [string] = ["old"];
  try {
    for (const [token, n] of [
      ["none", 0],
      ["embossed", 1],
      ["engraved", 2],
    ] as const) {
      expect(handler.importXML(token, value, units)).toBe(true);
      const actual: [number] = [9];
      expect(value.extract(actual, "sal_Int16")).toBe(true);
      expect(actual[0]).toBe(n);
      expect(handler.exportXML(out, value, units)).toBe(true);
      expect(out[0]).toBe(token);
    }
    expect(handler.importXML("EMBOSSED", value, units)).toBe(false);
    for (const n of [-1, 65536]) {
      value.insert([n], "sal_Int32");
      out[0] = "old";
      expect(handler.exportXML(out, value, units)).toBe(true);
      expect(out[0]).toBe("old");
    }
    value.insert([99], "sal_Int32");
    expect(handler.exportXML(out, value, units)).toBe(false);
    expect(out[0]).toBe("");
    expect(new XMLConstantsPropertyHandler([], "none").exportXML(out, value, units)).toBe(true);
    expect(out[0]).toBe("none");
  } finally {
    value.dispose();
  }
});
it("exports actual enum Any values and rejects nonnumeric transport without touching output", /** exports actual enum Any values and rejects nonnumeric transport without touching output. @returns Observed test result. */ () => {
  const handler = new XMLConstantsPropertyHandler([["solid", 0]], null),
    units = new SvXMLUnitConverter("twip"),
    value = new Any(),
    out: [string] = ["old"];
  try {
    expect(handler.exportXML(out, value, units)).toBe(false);
    expect(out[0]).toBe("old");
    value.insert([0], FontReliefType);
    expect(handler.exportXML(out, value, units)).toBe(true);
    expect(out[0]).toBe("solid");
  } finally {
    value.dispose();
  }
});

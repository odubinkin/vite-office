/** @fileoverview Original XMLBoolPropHdl lexical conversion,Any assignment and export failure behavior. */
import { expect, it } from "vitest";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { TypeClass } from "../../../udkapi/com/sun/star/uno/TypeClass";
import { XMLBoolPropHdl } from "./xmlbahdl";
import { SvXMLUnitConverter } from "../core/xmluconv";
it("writes an actual bool Any even on failed import and preserves failed export output", /** Uses native Any,not flattened primitives. @returns Nothing. */ () => {
  const handler = new XMLBoolPropHdl(),
    units = new SvXMLUnitConverter("twip"),
    value = new Any();
  try {
    for (const xml of ["true", "false", "1", "0", "TRUE", " true", "false ", ""]) {
      value.insert([123], "sal_Int32");
      expect(handler.importXML(xml, value, units)).toBe(xml === "true" || xml === "false");
      expect(value.getValueTypeClass()).toBe(TypeClass.BOOLEAN);
      const actual: [boolean] = [true],
        output: [string] = ["old"];
      expect(value.extract(actual, "bool")).toBe(true);
      expect(actual[0]).toBe(xml === "true");
      expect(handler.exportXML(output, value, units)).toBe(true);
      expect(output[0]).toBe(xml === "true" ? "true" : "false");
    }
    value.insert([1], "sal_Int16");
    const output: [string] = ["old"];
    expect(handler.exportXML(output, value, units)).toBe(false);
    expect(output[0]).toBe("old");
  } finally {
    value.dispose();
  }
});

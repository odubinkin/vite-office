/** @fileoverview Verifies literal native pointer IDs, cursor pixels, and browser hotspots without upstream access. */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { PointerStyle } from "../ptrstyle";
import { browserPointerStyle } from "./pointer";

it("preserves exact represented native pointer IDs", /** Checks pinned literal enum values. @returns Nothing. */ () => {
  expect([
    PointerStyle.Null,
    PointerStyle.HSizeBar,
    PointerStyle.VSizeBar,
    PointerStyle.TabSelectS,
    PointerStyle.TabSelectE,
    PointerStyle.TabSelectSE,
    PointerStyle.TabSelectW,
    PointerStyle.TabSelectSW,
  ]).toEqual([1, 25, 26, 85, 86, 87, 88, 89]);
  expect(browserPointerStyle(PointerStyle.Null)).toBe("");
  expect(browserPointerStyle(PointerStyle.HSizeBar)).toBe("col-resize");
  expect(browserPointerStyle(PointerStyle.VSizeBar)).toBe("row-resize");
});

it.each([
  ["tblsels", [7, 14], "bc9802433d4d422c7a315f72736ae1e21d8cdb73bf355a3e4783f1ace832a427"],
  ["tblsele", [14, 8], "b043cdc7dd19831dce9f3f9fcbe70192afb10a9800f4cc37349ddde42af376aa"],
  ["tblselse", [14, 14], "ba0d8dc7757564ac1d2ed2073b2dc33a329bd37900d478492492f902d5f31456"],
  ["tblselw", [1, 8], "dbbe6fb11bcf242bba305e6d340467f5a48dc6c4896630830b4a000e53f5e098"],
  ["tblselsw", [1, 14], "2976687442a4313afe4286b958daa02fe55d54d5fd215c0e66c02067f4647d8c"],
] as const)(
  "renders exact native cursor %s pixels and hotspot",
  /** Checks every black, white and transparent pixel from independent literal native digest. @param name - Native asset name. @param hotspot - Literal native hotspot. @param digest - Literal RGBA digest. @returns Nothing. */
  (name, hotspot, digest) => {
    const source = readFileSync("src/vcl/browser/cursors/" + name + ".svg", "utf8");
    const svg = new DOMParser().parseFromString(source, "image/svg+xml");
    expect(svg.documentElement.getAttribute("viewBox")).toBe("0 0 16 16");
    const bytes = new Uint8Array(16 * 16 * 4);
    for (const rect of svg.querySelectorAll("rect")) {
      const x = Number(rect.getAttribute("x")),
        y = Number(rect.getAttribute("y")),
        i = (y * 16 + x) * 4;
      expect(rect.getAttribute("width")).toBe("1");
      expect(rect.getAttribute("height")).toBe("1");
      const value = rect.getAttribute("fill") === "black" ? 0 : 255;
      bytes.set([value, value, value, 255], i);
    }
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(digest);
    const kinds = [
      PointerStyle.TabSelectS,
      PointerStyle.TabSelectE,
      PointerStyle.TabSelectSE,
      PointerStyle.TabSelectW,
      PointerStyle.TabSelectSW,
    ];
    const index = ["tblsels", "tblsele", "tblselse", "tblselw", "tblselsw"].indexOf(name);
    expect(browserPointerStyle(kinds[index] as PointerStyle)).toContain(name + ".svg");
    expect(browserPointerStyle(kinds[index] as PointerStyle)).toContain(
      ") " + hotspot.join(" ") + ", default",
    );
  },
);

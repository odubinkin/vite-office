/** @fileoverview Compares retained SAL table owners against independently extracted pinned native converter descriptors. */
import { expect, it } from "vitest";
import * as encodings from "../inc/rtl/textenc";
import descriptors from "./native-singlebyte-descriptors.json";
import * as latin from "./tcvtlat1";
import * as arabic from "./tcvtarb1";
import * as eastern from "./tcvteas1";
import * as windows from "./tcvtest1";
import * as apple from "./tcvtest1.apple";
import * as ibm from "./tcvtest1.ibm";
import * as iso from "./tcvtest1.iso";
import * as koi from "./tcvtest1.koi";

it("keeps every retained single-byte table identical to the pinned native factory descriptor", /** Independent extracted aggregates detect data drift when either factory or retained source tables change. @returns Nothing. */ () => {
  const ids = new Map(
    Object.entries(encodings).map(
      /** Normalizes only original identifier separators. @param entry - Native constant name and value. @returns Lookup pair. */ ([
        name,
        id,
      ]) => [name.replace("RTL_TEXTENCODING_", "").replaceAll("_", ""), id],
    ),
  );
  const native: Readonly<Record<string, unknown>> = descriptors;
  let compared = 0;
  for (const module of [latin, arabic, eastern, windows, apple, ibm, iso, koi])
    for (const [name, value] of Object.entries(module)) {
      const symbol = /^aImpl(.+)ByteCvtData$/u.exec(name);
      if (symbol === null) continue;
      const id = ids.get(symbol[1] as string);
      expect(id, name).toBeDefined();
      expect(native[String(id)], name).toBeDefined();
      expect(value, name).toEqual(native[String(id)]);
      compared++;
    }
  expect(compared).toBeGreaterThan(40);
});

/** @fileoverview Worker boundary validation for paragraph SDT interoperability values. */
import { expect, it } from "vitest";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SfxGrabBagItem } from "../../../../svl/inc/grabbagitem";
import { RES_PARATR_GRABBAG } from "../../../inc/hintids";
import { decodeParagraphSdt, encodeParagraphSdt } from "./writer-sdt-item-codec";

it("accepts a paragraph marker without a building block", /** Preserves an explicit false UNO boolean and an empty native interoperability item. @returns Nothing. */ () => {
  for (const value of [{ endBefore: false }, {}]) {
    const item = decodeParagraphSdt(structuredClone(value));
    try {
      expect(encodeParagraphSdt(item)).toEqual({ which: RES_PARATR_GRABBAG, value });
    } finally {
      item.Dispose();
    }
  }
});

it("rejects malformed paragraph interoperability snapshots", /** Checks keys, lexical types and UNO integer range at the Worker boundary. @returns Nothing. */ () => {
  const block = { kind: "docPartObj", part: {} };
  for (const snapshot of [
    null,
    [],
    { endBefore: "false" },
    { unknown: false },
    { block: null },
    { block: { ...block, kind: "richText" } },
    { block: { ...block, part: [] } },
    { block: { ...block, part: { unsupported: "" } } },
    { block: { ...block, part: { docPartUnique: true } } },
    { block: { ...block, alias: false } },
    { block: { ...block, id: "42" } },
    { block: { ...block, id: 0.5 } },
    { block: { ...block, id: -2147483649 } },
    { block: { ...block, id: 2147483648 } },
  ]) {
    expect(
      /** Attempts to restore the malformed record. @returns Native item on unexpected success. */
      () => decodeParagraphSdt(snapshot),
    ).toThrow(/Invalid Writer .*SDT snapshot/);
  }
});

it("rejects unknown or mistyped native interoperability data", /** Ensures a Worker transfer cannot silently discard unsupported native data. @returns Nothing. */ () => {
  const value = new Any([0], "sal_Int32");
  try {
    for (const name of ["SdtPr", "ParaSdtEndBefore", "Other"]) {
      const item = new SfxGrabBagItem(RES_PARATR_GRABBAG, new Map([[name, value]]));
      try {
        expect(
          /** Attempts to transfer the incompatible item. @returns Snapshot on unexpected success. */
          () => encodeParagraphSdt(item),
        ).toThrow("Unsupported Writer paragraph interoperability item.");
      } finally {
        item.Dispose();
      }
    }
  } finally {
    value.dispose();
  }
});

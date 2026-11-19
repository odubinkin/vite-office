/** @fileoverview Lossless Worker transfer for the represented native paragraph SDT interoperability entries. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SfxGrabBagItem } from "../../../../svl/inc/grabbagitem";
import type { SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import { RES_PARATR_GRABBAG } from "../../../inc/hintids";
import {
  makeDocPartSdt,
  readDocPartSdt,
  type DocPartSdt,
} from "../../../source/writerfilter/dmapper/SdtHelper";

/** Preserves the native two paragraph interoperability keys. @param item - Owned paragraph interoperability item. @returns Worker snapshot. */
export function encodeParagraphSdt(item: SfxGrabBagItem): SfxPoolItemSnapshot {
  const bag = item.GetGrabBag();
  const block = readDocPartSdt(bag.get("SdtPr"));
  const end = bag.get("ParaSdtEndBefore");
  const flag: [boolean] = [false];
  if (
    (bag.has("SdtPr") && !block) ||
    (end && !end.extract(flag, "bool")) ||
    bag.size !== Number(!!block) + Number(!!end)
  )
    throw new Error("Unsupported Writer paragraph interoperability item.");
  return {
    which: RES_PARATR_GRABBAG,
    value: {
      ...(block ? { block: { ...block, part: { ...block.part } } } : {}),
      ...(end ? { endBefore: flag[0] } : {}),
    },
  };
}

/** Validates the primitive snapshot and recreates actual UNO values. @param value - Untrusted Worker payload. @returns Native paragraph grab bag. */
export function decodeParagraphSdt(value: unknown): SfxGrabBagItem {
  if (
    !plain(value) ||
    Object.keys(value).some(
      /** Rejects unknown interoperability fields to prevent losing data. @param key - Transport field. @returns Whether unknown. */
      (key) => key !== "block" && key !== "endBefore",
    ) ||
    (value.endBefore !== undefined && typeof value.endBefore !== "boolean")
  )
    throw new Error("Invalid Writer paragraph SDT snapshot.");
  const block = value.block;
  if (block !== undefined && !isDocPart(block))
    throw new Error("Invalid Writer block SDT snapshot.");
  const entries = new Map<string, Any>();
  try {
    if (block) entries.set("SdtPr", makeDocPartSdt(block));
    if (typeof value.endBefore === "boolean")
      entries.set("ParaSdtEndBefore", new Any(value.endBefore));
    return new SfxGrabBagItem(RES_PARATR_GRABBAG, entries);
  } finally {
    for (const entry of entries.values()) entry.dispose();
  }
}

/** Accepts only the supported keys and lexical types. @param value - Untrusted building-block snapshot. @returns Whether structurally valid. */
function isDocPart(value: unknown): value is DocPartSdt {
  if (
    !plain(value) ||
    (value.kind !== "docPartObj" && value.kind !== "docPartList") ||
    !plain(value.part)
  )
    return false;
  if (
    !Object.entries(value.part).every(
      /** Validates the exact source building-block fields. @param entry - Snapshot pair. @returns Validity. */
      ([key, field]) =>
        ["docPartGallery", "docPartCategory", "docPartUnique"].includes(key) &&
        typeof field === "string",
    )
  )
    return false;
  return Object.entries(value).every(
    /** Checks types and signed32 narrowing for the represented original extras. @param entry - Snapshot pair. @returns Validity. */
    ([key, field]) =>
      key === "kind" ||
      key === "part" ||
      (["alias", "tag", "lock"].includes(key) && typeof field === "string") ||
      (key === "id" &&
        typeof field === "number" &&
        Number.isInteger(field) &&
        field >= -2147483648 &&
        field <= 2147483647),
  );
}

/** Rejects alternate prototypes at the snapshot boundary. @param value - Candidate. @returns Whether plain object. */
function plain(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype
  );
}

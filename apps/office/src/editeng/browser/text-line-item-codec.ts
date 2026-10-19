/** @fileoverview Shared browser Worker value transport for native underline style and packed color; core item/Which ownership remains in the actual document pool. */
import { SvxUnderlineItem } from "../source/items/textitem";
import { ComplexColor } from "../../docmodel/inc/color/ComplexColor";
import { Color, ColorTransparency } from "../../tools/inc/color";
import type { SfxPoolItem, SfxPoolItemSnapshot } from "../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../svl/source/items/itempool";
/** Native empty complex value; unsupported complex interface state must never be silently flattened. */
const emptyComplex = new ComplexColor();
/** Captures complete represented literal-color state at the structured-clone boundary. @param item - Real underline item. @returns Cloneable record. */
export function encodeTextLineItem(item: SvxUnderlineItem): SfxPoolItemSnapshot {
  const complex = item.getComplexColor();
  if (
    !complex.equals(emptyComplex) ||
    complex.getThemeColorUsage() !== emptyComplex.getThemeColorUsage() ||
    !complex.getFinalColor().equals(emptyComplex.getFinalColor())
  )
    throw new Error("Complex underline color Worker transport is not implemented.");
  return {
    which: item.Which(),
    value: { kind: "svx-text-line", style: item.GetLineStyle(), color: item.GetColor().toUInt32() },
  };
}
/** Recognizes this browser record and restores the actual pool's concrete item. @param pool - Canonical pool. @param snapshot - Cloneable value. @returns Native item or absent for another record family. */
export function decodeTextLineItem(
  pool: SfxItemPool,
  snapshot: SfxPoolItemSnapshot,
): SfxPoolItem | undefined {
  const value = snapshot.value;
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    !("kind" in value) ||
    value.kind !== "svx-text-line"
  )
    return undefined;
  if (
    !("style" in value) ||
    typeof value.style !== "number" ||
    !Number.isInteger(value.style) ||
    !("color" in value) ||
    typeof value.color !== "number" ||
    !Number.isInteger(value.color) ||
    value.color < 0 ||
    value.color > 0xffffffff
  )
    throw new Error("Stored underline Worker value is invalid.");
  const item = pool.CreateItem({ which: snapshot.which, value: value.style });
  if (!(item instanceof SvxUnderlineItem))
    throw new Error("Stored underline Worker WhichId is invalid.");
  item.SetColor(new Color(ColorTransparency, value.color | 0, "ColorTransparencyTag"));
  return item;
}

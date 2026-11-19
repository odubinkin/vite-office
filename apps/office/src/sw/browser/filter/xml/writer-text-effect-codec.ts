/** @fileoverview Worker transport for the represented Word text effects in Writer's native grab bag. */
import { stringAny } from "../../../source/core/unocore/unocrsrhelper";
import {
  isThemeFontProperty,
  readThemeFontProperty,
} from "../../../source/writerfilter/dmapper/ThemeHandler.fonts";
import type { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SfxGrabBagItem } from "../../../../svl/inc/grabbagitem";
import type { SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import { RES_CHRATR_GRABBAG } from "../../../inc/hintids";
import type { SwDoc } from "../../../source/core/doc/doc";
import {
  makeTextEffect,
  isTextEffectChildren,
  readTextEffect,
  textEffectProperty,
  type TextEffectValue,
} from "../../../source/writerfilter/dmapper/TextEffectsHandler";

/** Encodes the native text effects as cloneable typed values. @param item - Writer character grab bag. @returns Worker item record. */
export function encodeTextEffects(item: SfxGrabBagItem): SfxPoolItemSnapshot {
  const effects: ([string] | [string, TextEffectValue])[] = [];
  const fonts: string[][] = [];
  for (const [key, value] of item.GetGrabBag()) {
    if (isThemeFontProperty(key)) {
      const font = readThemeFontProperty(value);
      if (font === undefined) throw new Error("Invalid Writer theme font property: " + key);
      fonts.push([key, font]);
      continue;
    }
    const effect = readTextEffect(key, value);
    if (!effect) throw new Error("Unsupported Writer character grab bag property: " + key);
    const [name, val] = effect;
    effects.push(val === undefined ? [name] : [name, val]);
  }
  return { which: RES_CHRATR_GRABBAG, value: { effects, ...(fonts.length ? { fonts } : {}) } };
}

/** Restores the original native PropertyValue tree after transfer. @param value - Untrusted item payload. @returns Owned native grab bag. */
export function decodeTextEffects(value: unknown): SfxGrabBagItem {
  if (
    typeof value !== "object" ||
    value === null ||
    !("effects" in value) ||
    !Array.isArray(value.effects)
  )
    throw new Error("Writer text effects snapshot is invalid.");
  const entries = new Map<string, Any>();
  try {
    for (const effect of value.effects as readonly unknown[]) {
      if (!Array.isArray(effect) || effect.length < 1 || effect.length > 2)
        throw new Error("Writer text effect is invalid.");
      const [name, val] = effect as readonly unknown[];
      const key = typeof name === "string" ? textEffectProperty(name) : undefined;
      const native =
        typeof name !== "string"
          ? undefined
          : typeof val === "string" && name !== "stylisticSets"
            ? val
            : isTextEffectChildren(name, val)
              ? val
              : undefined;
      if (
        !key ||
        typeof name !== "string" ||
        (effect.length === 2 && native === undefined) ||
        entries.has(key)
      )
        throw new Error("Writer text effect is invalid.");
      entries.set(key, makeTextEffect(name, native));
    }
    if ("fonts" in value) {
      if (!Array.isArray(value.fonts)) throw new Error("Writer theme font snapshot is invalid.");
      for (const entry of value.fonts as readonly unknown[]) {
        if (
          !Array.isArray(entry) ||
          entry.length !== 2 ||
          typeof entry[0] !== "string" ||
          !isThemeFontProperty(entry[0]) ||
          typeof entry[1] !== "string" ||
          entries.has(entry[0])
        )
          throw new Error("Writer theme font property is invalid.");
        entries.set(entry[0], stringAny(entry[1]));
      }
    }
    return new SfxGrabBagItem(RES_CHRATR_GRABBAG, entries);
  } finally {
    for (const value of entries.values()) value.dispose();
  }
}

/** Carries the native character grab bag override to the next Worker or UI model. @param doc - Document. @returns Item snapshot when a default exists. */
export function encodeTextEffectDefault(doc: SwDoc): SfxPoolItemSnapshot | undefined {
  const item = doc.GetAttrPool().GetUserDefaultItem(RES_CHRATR_GRABBAG);
  return item instanceof SfxGrabBagItem ? encodeTextEffects(item) : undefined;
}

/** Restores the optional character grab bag default before model content. @param doc - New document. @param snapshot - Optional Worker item record. @returns Nothing. */
export function restoreTextEffectDefault(doc: SwDoc, snapshot: unknown): void {
  if (snapshot === undefined) return;
  if (
    typeof snapshot !== "object" ||
    snapshot === null ||
    !("which" in snapshot) ||
    snapshot.which !== RES_CHRATR_GRABBAG ||
    !("value" in snapshot)
  )
    throw new Error("Writer text effects default snapshot is invalid.");
  doc.GetAttrPool().SetUserDefaultItem(decodeTextEffects(snapshot.value));
}

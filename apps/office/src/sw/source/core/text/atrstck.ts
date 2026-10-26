/** @fileoverview Represents native atrstck.cxx per-character-item stacks over the implemented automatic hint family. */
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { RES_CHRATR_BEGIN, RES_CHRATR_END } from "../../../inc/hintids";
import { SwFormatAutoFormat, type SwTextAttrEnd } from "../txtnode/txatbase";
import { SwFormatCharFormat, type SwFormatINetFormat } from "../txtnode/fmtatr2";

/** Existing native ranged families; INET style/font effects are not represented yet. */
export type SwAttributeHint = SwTextAttrEnd<
  SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat
>;

/** Original CharFormat namespace's consumed automatic and character-style branches. Internet style lookup remains with its text attribute owner. */
export const CharFormat = {
  /** Borrows a represented native format set. @param format - Actual item. @returns Borrowed set or absent unsupported/empty owner. */
  GetItemSet(
    format: SwFormatAutoFormat | SwFormatCharFormat | SwFormatINetFormat,
  ): SfxItemSet | undefined {
    if (format instanceof SwFormatAutoFormat) return format.GetStyleHandle();
    if (format instanceof SwFormatCharFormat) return format.GetCharFormat()?.GetAttrSet();
    return undefined;
  },
  /** Extracts an explicitly SET item, searching parents for named character formats. @param hint - Actual text attribute. @param which - Requested family. @returns Borrowed item. */
  GetItem(hint: SwAttributeHint, which: number): SfxPoolItem | undefined {
    const format = hint.GetAttr();
    return CharFormat.GetItemSet(format)?.GetItemIfSet(
      which,
      !(format instanceof SwFormatAutoFormat),
    );
  },
  /** Tests the native named/automatic item's represented explicit membership. @param which - Character family. @param hint - Native owner. @returns Membership. */
  IsItemIncluded(which: number, hint: SwAttributeHint): boolean {
    return CharFormat.GetItem(hint, which) !== undefined;
  },
};

/** Owns independent character-item stacks while borrowing actual hints and paragraph defaults. */
export class SwAttrHandler {
  private m_pDefaultArray: SfxItemSet | undefined;
  private readonly m_aAttrStack = new Map<number, SwAttributeHint[]>();

  /** Initializes the represented paragraph/default item source. @param attributes - Effective native node set. @returns Nothing. */
  public Init(attributes: SfxItemSet): void {
    this.m_pDefaultArray = attributes;
  }

  /** Clears active hints while retaining initialized paragraph defaults. @returns Nothing. */
  public Reset(): void {
    this.m_aAttrStack.clear();
  }

  /** Pushes an automatic hint onto each explicitly SET character-item stack. @param hint - Actual owner. @returns Nothing. */
  public PushAndChg(hint: SwAttributeHint): void {
    for (let which = RES_CHRATR_BEGIN; which < RES_CHRATR_END; which++) {
      if (CharFormat.GetItem(hint, which) === undefined) continue;
      const stack = this.m_aAttrStack.get(which) ?? [];
      const top = stack.at(-1);
      if (top === undefined || hint.IsPriorityAttr() || !top.IsPriorityAttr()) stack.push(hint);
      else stack.splice(stack.length - 1, 0, hint);
      this.m_aAttrStack.set(which, stack);
    }
  }

  /** Removes this exact hint identity from every stack without disturbing other families. @param hint - Closing owner. @returns Nothing. */
  public PopAndChg(hint: SwAttributeHint): void {
    for (const stack of this.m_aAttrStack.values()) {
      const index = stack.indexOf(hint);
      if (index !== -1) stack.splice(index, 1);
    }
  }

  /** Borrows the effective item for a platform formatter; this accessor does not emulate SwFont or device shaping. @param which - Character WhichId. @returns Actual effective pooled item. */
  public ReadItem(which: number): SfxPoolItem {
    if (this.m_pDefaultArray === undefined) throw new Error("SwAttrHandler requires Init.");
    const top = this.m_aAttrStack.get(which)?.at(-1);
    return top === undefined
      ? this.m_pDefaultArray.Get(which)
      : (CharFormat.GetItem(top, which) ?? this.m_pDefaultArray.Get(which));
  }
}

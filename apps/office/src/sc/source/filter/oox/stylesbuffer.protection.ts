/** @fileoverview SpreadsheetML protection attribute decoding and original native XF model. */
import type { SaxesAttributeNS } from "saxes";
import { ScProtectionAttr } from "../../../inc/attrib";
import { AttributeList } from "../../../../oox/source/helper/attributelist";
import { FastTokenHandler } from "../../../../oox/source/core/fasttokenhandler";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { FastAttributeList } from "../../../../sax/source/tools/fastattribs";
import { Reference } from "../../../../cppu/inc/com/sun/star/uno/Reference";

const protectionTokenHandler = new FastTokenHandler();

/** Reads native boolean values from the XF and its protection element. @param attributes - Original attributes. @param apply - XF's source apply default. @returns Locked, hidden and apply flags. */
export function readProtection(
  attributes: readonly SaxesAttributeNS[],
  apply = false,
): readonly [boolean, boolean, boolean] {
  const fast = new FastAttributeList(protectionTokenHandler);
  const reference = new Reference(fast);
  const values = new AttributeList(reference);
  try {
    for (const { local, uri, value } of attributes)
      if (uri === "" && (local === "locked" || local === "hidden" || local === "applyProtection"))
        fast.add(token(local), value);
    return [
      values.getBool(token("locked"), true),
      values.getBool(token("hidden"), false),
      values.getBool(token("applyProtection"), apply),
    ];
  } finally {
    values.dispose();
    reference.dispose();
  }
}

/** Original SpreadsheetML protection model and its native Calc item projection. */
export class Protection {
  /** Retains original Excel defaults and parsed style flags. @param locked - Cell locked flag. @param hidden - Formula hidden flag. @returns Model. */
  constructor(
    private readonly locked = true,
    private readonly hidden = false,
  ) {}

  /** Compares the represented native protection settings. @param other - Parent protection. @returns Whether both match. */
  equals(other: Protection): boolean {
    return this.locked === other.locked && this.hidden === other.hidden;
  }

  /** Builds the genuine native cell item. @returns Owned protection item. */
  createItem(): ScProtectionAttr {
    return new ScProtectionAttr(this.locked, this.hidden);
  }
}

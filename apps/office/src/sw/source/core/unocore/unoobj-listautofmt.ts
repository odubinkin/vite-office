/** @fileoverview Consumed ListAutoFormat setter from unoobj.cxx and GetParaListAutoFormat from unocrsrhelper.cxx over real native auto-style handles. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  NamedValue,
  cppu_detail_getUnoType_NamedValue as namedType,
} from "../../../../udkapi/com/sun/star/beans/NamedValue";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import type { rtl_uString } from "../../../../sal/inc/rtl/ustring.h";
import { SfxItemState, SfxItemSet } from "../../../../svl/source/items/itemset";
import { releaseStyleHandle } from "../../../../svl/source/items/stylepool";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
import * as H from "../../../inc/hintids";
import { SwFormatAutoFormat } from "../txtnode/txatbase";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwUnoCharAutoStylePropertyMap } from "./unomap";
import { text, unicode, unknown, putItem, queryItem, stringAny } from "./unocrsrhelper";
import { SwFormatCharFormat } from "../txtnode/fmtatr2";
/** Exact generated sizeof(NamedValue)=32 and real compound storage. */
const NamedValues = Sequence.specialize<NamedValue>(namedType, 32);
/** Original sequence type argument for Any, not a serialized list. */
export const listAutoFormatType = ["Sequence", namedType] as const;
/** Native setter accepts NamedValue sequence or an existing automatic style name; other input is a successful MAYBEVOID no-op. @param node - Selected paragraph. @param value - Actual UNO input. @returns Nothing. */
export function SetParaListAutoFormat(node: SwTextNode, value: Any): void {
  const doc = node.GetDoc(),
    props = new NamedValues();
  let style: SfxItemSet | undefined,
    acquired = false;
  try {
    if (value.extract(props.getAddress(), listAutoFormatType)) {
      const items = new SfxItemSet(doc.GetAttrPool(), [
        [H.RES_CHRATR_BEGIN, H.RES_CHRATR_END - 1],
        [H.RES_TXTATR_CHARFMT, H.RES_TXTATR_CHARFMT],
        [H.RES_UNKNOWNATR_BEGIN, H.RES_UNKNOWNATR_END - 1],
      ]);
      try {
        for (let index = 0; index < props.getLength(); ++index) {
          const address = props.operatorIndex(index) as unknown as { get(offset: number): unknown };
          const name = new OUString((address.get(0) as [rtl_uString])[0]),
            input = new Any(address.get(8) as Any);
          try {
            const key = text(name),
              entry = SwUnoCharAutoStylePropertyMap.get(key);
            if (!entry) unknown("Unknown property: " + key);
            // The represented native character-auto-style map has no READONLY descriptors.
            // Current native insertion profile has no DocShell. SetCharStyle returns before extraction/lookup in this branch.
            if (key === "CharStyleName") continue;
            const item = putItem(items.Get(entry.which), entry, input);
            try {
              items.Put(item);
            } finally {
              item.Dispose();
            }
          } finally {
            input.dispose();
            name.dispose();
          }
        }
        style = doc.GetIStyleAccess().getAutomaticStyle(items, SwAutoStyleFamily.AUTO_STYLE_CHAR);
        acquired = true;
      } finally {
        items.Dispose();
      }
    } else {
      const name = new OUString();
      try {
        if (value.extract(name, "OUString"))
          style = doc.GetIStyleAccess().getByName(text(name), SwAutoStyleFamily.AUTO_STYLE_CHAR);
      } finally {
        name.dispose();
      }
    }
    if (style) {
      const item = new SwFormatAutoFormat(H.RES_PARATR_LIST_AUTOFMT);
      try {
        item.SetStyleHandle(style);
        node.SetAttr(item);
      } finally {
        item.Dispose();
      }
    }
  } finally {
    if (acquired && style) releaseStyleHandle(style);
    props.dispose();
  }
}
/** Original getter iterates the character auto-style map and emits only direct properties; an empty handle returns VOID. @param node - Actual paragraph. @returns Owned native Any. */
export function GetParaListAutoFormat(node: SwTextNode): Any {
  const item = node.GetSwAttrSet().GetItemIfSet(H.RES_PARATR_LIST_AUTOFMT, false);
  if (!(item instanceof SwFormatAutoFormat)) return new Any();
  const set = item.GetStyleHandle();
  if (!set) return new Any();
  const values: NamedValue[] = [];
  try {
    for (const [key, entry] of [...SwUnoCharAutoStylePropertyMap].sort(
      /** Native map name order. @param a - First. @param b - Second. @returns Ordering. */ (
        a,
        b,
      ) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0),
    )) {
      if (set.GetItemState(entry.which, false) !== SfxItemState.SET) continue;
      const direct = set.Get(entry.which),
        name = unicode(key),
        value =
          direct instanceof SwFormatCharFormat
            ? stringAny(direct.QueryValue())
            : queryItem(direct, entry);
      try {
        values.push(new NamedValue(name, value));
      } finally {
        value.dispose();
        name.dispose();
      }
    }
    const sequence = new NamedValues(
      new Map(
        values.map(
          /** Actual generated compound addresses at native element stride. @param value - Native value. @param index - Index. @returns Address/value pair. */ (
            value,
            index,
          ) => [index * 32, value],
        ),
      ),
      values.length,
    );
    try {
      return new Any(sequence.getAddress(), listAutoFormatType);
    } finally {
      sequence.dispose();
    }
  } finally {
    for (const value of values) value.dispose();
  }
}

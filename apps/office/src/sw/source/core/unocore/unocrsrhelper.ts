/** @fileoverview Consumed SwUnoCursorHelper property and CR insertion contracts from pinned unocrsrhelper.cxx; canonical nodes/items remain the only state. */
import { StylePool } from "../../../../svl/source/items/stylepool";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";

import { cppu_detail_getUnoType_BreakType as breakType } from "../../../../offapi/com/sun/star/style/BreakType";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwXNumberingRules } from "./unosett";
import { SwNumRule } from "../doc/number";
import { cppu_detail_getUnoType as indexReplaceType } from "../../../../cppu/inc/com/sun/star/container/XIndexReplace";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Reference, UNO_QUERY } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { IllegalArgumentException } from "../../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { UnknownPropertyException } from "../../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";

import type { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { NoSuchElementException } from "../../../../cppu/inc/com/sun/star/container/NoSuchElementException";
import { ElementExistException } from "../../../../cppu/inc/com/sun/star/container/ElementExistException";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item, SfxUInt16Item } from "../../../../svl/source/items/intitem";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SvxFontItem, SvxUnderlineItem } from "../../../../editeng/source/items/textitem";
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import { SwPaM } from "../crsr/pam";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwFormatINetFormat } from "../txtnode/fmtatr2";
import { SwFormatAutoFormat } from "../txtnode/txatbase";
import { SwFormatPageDesc } from "../attr/fmtpdsc";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { SwNumRuleItem } from "../para/paratr";
import * as H from "../../../inc/hintids";
import { setTextFormatCollAtNode } from "../doc/docfmt";
import { WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";
import { SwUnoPropertyMap, type SwUnoPropertyEntry } from "./unomap";
/** Native argument failure, with the real generated exception value. @param message - Original message input. @returns The represented native operation result. */
export function illegal(message: string): never {
  const value = unicode(message);
  try {
    throw new IllegalArgumentException(value, new Reference(), 0);
  } finally {
    value.dispose();
  }
}
/** Native runtime failure used by invalid text owners/ranges. @param message - Original message input. @returns The represented native operation result. */
export function invalid(message: string): never {
  const value = unicode(message);
  try {
    throw new RuntimeException(value, new Reference());
  } finally {
    value.dispose();
  }
}
/** Native unknown property failure rather than a successful ignored property. @param name - Native property or element name. @returns The represented native operation result. */
export function unknown(name: string): never {
  const value = unicode(name);
  try {
    throw new UnknownPropertyException(value, new Reference());
  } finally {
    value.dispose();
  }
}
/** Extracts through the actual Any conversion engine, retaining typed failure. @param value - Declared native value. @param type - Original type input. @returns The represented native operation result. */
export function scalar(
  value: Any,
  type: "sal_Int32" | "sal_Int16" | "sal_Int8" | "float" | "bool",
): number | boolean {
  const out: [number | boolean] = [0];
  if (!value.extract(out, type)) illegal("Property value has an incompatible type");
  return out[0];
}
/** Extracts an owned Unicode value before projecting the browser string primitive. @param value - Declared native value. @returns The represented native operation result. */
export function stringValue(value: Any): string {
  const out = new OUString();
  try {
    if (!value.extract(out, "OUString")) illegal("Expected a string property");
    return text(out);
  } finally {
    out.dispose();
  }
}
/** Constructs an independent native Any for a string. @param value - Declared native value. @returns The represented native operation result. */
export function stringAny(value: string): Any {
  const s = unicode(value);
  try {
    return new Any(s.getDataAddress(), "OUString");
  } finally {
    s.dispose();
  }
}
/** Reads supported item member values through original item QueryValue owners. @param item - Original item input. @param entry - Original entry input. @returns The represented native operation result. */
export function queryItem(item: SfxPoolItem, entry: SwUnoPropertyEntry): Any {
  if (entry.kind === "autostyle")
    return stringAny(StylePool.nameOf((item as SwFormatAutoFormat).GetStyleHandle()));
  if (entry.kind === "pagedesc") {
    const page = item as SwFormatPageDesc;
    return entry.member === 1
      ? stringAny(page.GetPageDescName())
      : new Any([((page.GetNumOffset() ?? 0) << 16) >> 16], "sal_Int16");
  }
  if (entry.kind === "break") return new Any([(item as SfxInt16Item).GetValue()], breakType);
  if (entry.kind === "string") return stringAny((item as SfxStringItem).GetValue());
  if (entry.kind === "hyperlink") {
    const fields: Record<number, keyof import("../txtnode/fmtatr2").WriterHyperlink> = {
      1: "name",
      4: "url",
      5: "targetFrame",
      6: "visitedStyleName",
      7: "styleName",
    };
    return stringAny(
      (item as SwFormatINetFormat).GetHyperlink()[
        fields[entry.member] ?? illegal("Unknown hyperlink member")
      ] ?? "",
    );
  }
  const out = new Any();
  if (entry.kind === "any") {
    (item as unknown as { QueryValue(out: Any, member: number): boolean }).QueryValue(
      out,
      entry.member,
    );
    return out;
  }
  if (item instanceof SvxUnderlineItem) {
    item.QueryValue(out, entry.member);
    return out;
  }
  let value: unknown;
  if (entry.kind === "font") {
    (item as SvxFontItem).QueryValue(out, entry.member);
    return out;
  }
  if (entry.kind === "color") {
    const color = (item as SfxStringItem).GetValue();
    value =
      color === "auto" || color === "automatic" || color === "transparent"
        ? -1
        : parseInt(color.replace("#", ""), 16);
  } else if (
    item instanceof SfxBoolItem ||
    item instanceof SfxInt16Item ||
    item instanceof SfxUInt16Item
  )
    value = item.GetValue();
  else
    value = (item as unknown as { QueryValue(member: number): unknown }).QueryValue(entry.member);
  out.insert(
    [entry.kind === "byte" ? (Number(value) << 24) >> 24 : value],
    entry.kind === "bool"
      ? "bool"
      : entry.kind === "byte"
        ? "sal_Int8"
        : entry.kind === "short"
          ? "sal_Int16"
          : "sal_Int32",
  );
  return out;
}
/** Clones before applying a property; failed PutValue cannot mutate a pooled item. @param item - Original item input. @param entry - Original entry input. @param value - Declared native value. @returns The represented native operation result. */
export function putItem(item: SfxPoolItem, entry: SwUnoPropertyEntry, value: Any): SfxPoolItem {
  if (entry.kind === "pagedesc") {
    const page = item as SwFormatPageDesc,
      offset =
        entry.member === 0 ? (scalar(value, "sal_Int16") as number) & 0xffff : page.GetNumOffset();
    return new SwFormatPageDesc(
      entry.member === 1 ? stringValue(value) : page.GetPageDescName(),
      offset === 0 ? undefined : offset,
    );
  }
  if (entry.kind === "break") {
    const result: [number] = [0];
    if (!value.extract(result, breakType)) illegal("Expected BreakType");
    return new SfxInt16Item(item.Which(), result[0]);
  }
  if (entry.kind === "string") return new SwNumRuleItem(stringValue(value));
  if (entry.kind === "hyperlink") {
    const fields: Record<number, keyof import("../txtnode/fmtatr2").WriterHyperlink> = {
      1: "name",
      4: "url",
      5: "targetFrame",
      6: "visitedStyleName",
      7: "styleName",
    };
    return new SwFormatINetFormat({
      ...(item as SwFormatINetFormat).GetHyperlink(),
      [fields[entry.member] ?? illegal("Unknown hyperlink member")]: stringValue(value),
    });
  }
  const copy = item.Clone();
  if (copy === null) invalid("Invalid pooled item");
  if (entry.kind === "color") {
    const n = scalar(value, "sal_Int32") as number;
    return new SfxStringItem(
      item.Which(),
      n === -1
        ? item.Which() === H.RES_CHRATR_HIGHLIGHT
          ? "transparent"
          : "auto"
        : `#${(n & 0xffffff).toString(16).padStart(6, "0")}`,
    );
  }
  if (entry.kind === "font") {
    if (!(copy as SvxFontItem).PutValue(value, entry.member)) illegal("Invalid font member");
    return copy;
  }
  if (copy instanceof SvxUnderlineItem) {
    if (!copy.PutValue(value, entry.member)) illegal("Invalid underline value");
    return copy;
  }
  if (copy instanceof SfxBoolItem)
    return new SfxBoolItem(item.Which(), scalar(value, "bool") as boolean);
  if (copy instanceof SfxInt16Item && entry.kind === "byte")
    return new SfxInt16Item(item.Which(), (scalar(value, "sal_Int8") as number) & 0xff);
  if (copy instanceof SfxInt16Item)
    return new SfxInt16Item(item.Which(), scalar(value, "sal_Int16") as number);
  if (copy instanceof SfxUInt16Item)
    return new SfxUInt16Item(item.Which(), scalar(value, "sal_Int16") as number);
  const input =
    entry.kind === "any"
      ? value
      : scalar(
          value,
          entry.kind === "long" ? "sal_Int32" : entry.kind === "bool" ? "bool" : "sal_Int16",
        );
  if (!copy.PutValue(input, entry.member)) illegal("Property value rejected by native item");
  return copy;
}
/** Enumerates paragraph-local spans in one canonical selection, including empty paragraphs. @param pam - Original pam input. @returns The represented native operation result. */
export function spans(pam: SwPaM): { node: SwTextNode; start: number; end: number }[] {
  const first = pam.Start(),
    last = pam.End();
  return first
    .GetNode()
    .GetNodes()
    .entries()
    .slice(first.GetNodeIndex(), last.GetNodeIndex() + 1)
    .filter(
      /** Processes one ordered native value at this boundary. @param node - Canonical text node. @returns The represented native operation result. */
      (node): node is SwTextNode => node instanceof SwTextNode,
    )
    .map(
      /** Processes one ordered native value at this boundary. @param node - Canonical text node. @returns The represented native operation result. */
      (node) => ({
        node,
        start: node === first.GetNode() ? first.GetContentIndex() : 0,
        end: node === last.GetNode() ? last.GetContentIndex() : node.Len(),
      }),
    );
}
/** Applies a native property to selected paragraphs or ranged character items. @param pam - Original pam input. @param name - Native property or element name. @param value - Declared native value. @returns The represented native operation result.  @param mode - Native operation input. */
export function SetPropertyValue(
  pam: SwPaM,
  name: string,
  value: Any,
  mode = SetAttrMode.DEFAULT,
): void {
  const ranges = spans(pam),
    doc = pam.GetPoint().GetNode().GetDoc();
  if (name === "CharAutoStyleName") {
    const handle = doc
      .GetIStyleAccess()
      .getByName(stringValue(value), SwAutoStyleFamily.AUTO_STYLE_CHAR);
    if (handle) doc.InsertPoolItem(pam, new SwFormatAutoFormat(handle), mode);
    return;
  }
  if (name === "NumberingRules") {
    const reference = new Reference(value, UNO_QUERY, indexReplaceType);
    try {
      const service = reference.get();
      if (service instanceof SwXNumberingRules) doc.SetNumRule(pam, service.GetNumRule());
    } finally {
      reference.dispose();
    }
    return;
  }
  if (name === "ParaStyleName") {
    const n = stringValue(value),
      definition = WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL.find(
        /** Processes one ordered native value at this boundary. @param s - Original s input. @returns The represented native operation result. */
        (s) => s.name === n || s.id === n,
      ),
      style =
        doc.FindTextFormatCollByName(n) ??
        doc.FindTextFormatColl(n) ??
        (definition ? doc.GetTextFormatColl(definition.id) : undefined);
    if (!style) illegal("Unknown paragraph style");
    for (const r of ranges) setTextFormatCollAtNode(r.node, style, false);
    return;
  }
  if (name === "NumberingStyleName") {
    const s = stringValue(value);
    if (s && !doc.FindNumRulePtr(s)) illegal("Unknown numbering rule");
    for (const r of ranges) r.node.SetAttr(new SwNumRuleItem(s));
    return;
  }
  if (name === "PageDescName") {
    const s = stringValue(value);
    if (s && !doc.FindPageDesc(s)) illegal("Unknown page style");
    for (const r of ranges)
      r.node.SetAttr(
        new SwFormatPageDesc(
          s,
          (r.node.GetAttr(H.RES_PAGEDESC) as SwFormatPageDesc).GetNumOffset(),
        ),
      );
    return;
  }
  if (
    [
      "NumberingLevel",
      "NumberingStartValue",
      "ParaIsNumberingRestart",
      "NumberingIsNumber",
      "ListId",
    ].includes(name)
  ) {
    const v =
      name === "ListId"
        ? stringValue(value)
        : scalar(
            value,
            name === "NumberingLevel" || name === "NumberingStartValue" ? "sal_Int16" : "bool",
          );
    if (name === "NumberingLevel" && ((v as number) < 0 || (v as number) > 9))
      illegal("Invalid numbering level");
    for (const r of ranges) {
      if (name === "NumberingLevel") r.node.SetAttrListLevel(v as number);
      else if (name === "NumberingStartValue") r.node.SetAttrListRestartValue(v as number);
      else if (name === "ParaIsNumberingRestart") r.node.SetListRestart(v as boolean);
      else if (name === "NumberingIsNumber") r.node.SetCountedInList(v as boolean);
      else r.node.SetListId(v as string);
    }
    return;
  }
  const entry = SwUnoPropertyMap.get(name);
  if (!entry) unknown(name);
  const first = ranges[0];
  if (!first) invalid("No text range");
  const current = effectiveItem(first.node, first.start, entry.which),
    item = putItem(current, entry, value);
  doc.InsertPoolItem(pam, item, mode);
}
/** Queries the item effective at a text offset, including character hints. @param node - Canonical text node. @param offset - Original offset input. @param which - Original which input. @returns The represented native operation result. */
export function effectiveItem(node: SwTextNode, offset: number, which: number): SfxPoolItem {
  let result = node.GetAttr(which);
  for (const hint of node.GetpSwpHints()?.entries() ?? []) {
    if (hint.GetStart() <= offset && offset < (hint.GetEnd() ?? hint.GetStart())) {
      const attr = hint.GetAttr();
      if (attr instanceof SwFormatAutoFormat)
        result = attr.GetStyleHandle().GetItemIfSet(which, false) ?? result;
      else if (attr.Which() === which) result = attr;
    }
  }
  return result;
}
/** Returns native properties; a heterogeneous selection returns VOID (MAYBEVOID). @param pam - Original pam input. @param name - Native property or element name. @returns The represented native operation result. */
export function GetPropertyValue(pam: SwPaM, name: string): Any {
  const r = spans(pam)[0];
  if (!r) invalid("No text range");
  const node = r.node;
  if (name === "CharAutoStyleName") {
    let nameValue: string | undefined;
    for (const span of spans(pam)) {
      const hints = span.node.GetpSwpHints()?.entries() ?? [],
        boundaries = new Set([span.start]);
      for (const hint of hints) {
        if (!(hint.GetAttr() instanceof SwFormatAutoFormat)) continue;
        if (hint.GetStart() > span.start && hint.GetStart() < span.end)
          boundaries.add(hint.GetStart());
        const end = hint.GetEnd();
        if (end !== undefined && end > span.start && end < span.end) boundaries.add(end);
      }
      for (const offset of boundaries) {
        let current = "";
        for (const hint of hints) {
          const format = hint.GetAttr();
          if (
            format instanceof SwFormatAutoFormat &&
            hint.GetStart() <= offset &&
            offset < (hint.GetEnd() ?? hint.GetStart())
          )
            current = StylePool.nameOf(format.GetStyleHandle());
        }
        if (nameValue !== undefined && nameValue !== current) return new Any();
        nameValue = current;
      }
    }
    return stringAny(nameValue ?? "");
  }
  if (name === "NumberingRules") {
    const rule = node.GetNumRule();
    return rule
      ? new Any([new SwXNumberingRules(new SwNumRule(rule))], ["Reference", indexReplaceType])
      : new Any();
  }
  if (name === "ParaStyleName") return stringAny(node.GetTextFormatColl().GetName());
  if (name === "NumberingStyleName") return stringAny(node.GetNumRuleName());
  if (name === "PageDescName")
    return stringAny((node.GetAttr(H.RES_PAGEDESC) as SwFormatPageDesc).GetPageDescName());
  if (name === "ListId") return stringAny(node.GetListId());
  const out = new Any();
  if (name === "NumberingLevel" || name === "NumberingStartValue") {
    out.insert(
      [name === "NumberingLevel" ? node.GetAttrListLevel() : node.GetAttrListRestartValue()],
      "sal_Int16",
    );
    return out;
  }
  if (name === "NumberingIsNumber" || name === "ParaIsNumberingRestart") {
    out.insert(
      [name === "NumberingIsNumber" ? node.IsCountedInList() : node.IsListRestart()],
      "bool",
    );
    return out;
  }
  out.dispose();
  const entry = SwUnoPropertyMap.get(name);
  if (!entry) unknown(name);
  let result: Any | undefined;
  for (const span of spans(pam)) {
    let item: SfxPoolItem;
    if (entry.which < H.RES_CHRATR_END) {
      const set = new SfxItemSet(node.GetDoc().GetAttrPool(), [[entry.which, entry.which]]);
      span.node.GetParaAttr(set, span.start, span.end);
      if (set.GetItemState(entry.which, true) === SfxItemState.INVALID) {
        result?.dispose();
        return new Any();
      }
      item = set.Get(entry.which);
    } else item = effectiveItem(span.node, span.start, entry.which);
    const value = queryItem(item, entry);
    if (result && !result.operatorEquals(value)) {
      result.dispose();
      value.dispose();
      return new Any();
    }
    result?.dispose();
    result = value;
  }
  return result ?? new Any();
}
/** Ordered native multi-property setter. Callers own undo grouping and rollback. @param pam - Original pam input. @param properties - Ordered native property values. @returns The represented native operation result.  @param mode - Native operation input. */
export function SetPropertyValues(
  pam: SwPaM,
  properties: readonly PropertyValue[],
  mode = SetAttrMode.DEFAULT,
): void {
  const sideEffects = new Set([
      "ParaStyleName",
      "NumberingStartValue",
      "NumberingRules",
      "CharAutoStyleName",
    ]),
    items = new Map<number, SfxPoolItem>(),
    special: PropertyValue[] = [],
    regular: PropertyValue[] = [];
  let missing = "";
  for (const property of properties) {
    const name = text(property.Name);
    if (sideEffects.has(name)) special.push(property);
    else regular.push(property);
  }
  for (const property of special) SetPropertyValue(pam, text(property.Name), property.Value, mode);
  const first = spans(pam)[0];
  if (!first) invalid("No text range");
  for (const property of regular) {
    const name = text(property.Name),
      entry = SwUnoPropertyMap.get(name);
    if (entry) {
      const previous =
        items.get(entry.which) ?? effectiveItem(first.node, first.start, entry.which);
      items.set(entry.which, putItem(previous, entry, property.Value));
    } else {
      try {
        SetPropertyValue(pam, name, property.Value, mode);
      } catch (error) {
        if (error instanceof UnknownPropertyException) {
          missing += `Unknown property: '${name}' `;
          error.dispose();
        } else throw error;
      }
    }
  }
  for (const item of items.values())
    pam.GetPoint().GetNode().GetDoc().InsertPoolItem(pam, item, mode);
  if (missing) unknown(missing);
}
/** CR separates paragraphs; LF is a line break, not another paragraph. Control characters reject the whole insertion before mutation. @param pam - Original pam input. @param input - Original input input. @param mode - Original mode input. @returns The represented native operation result. */
export function DocInsertStringSplitCR(
  pam: SwPaM,
  input: OUStringConstReference,
  mode = SwInsertFlags.EMPTYEXPAND,
): boolean {
  const value = text(input);
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) return false;
  }
  const doc = pam.GetPoint().GetNode().GetDoc(),
    ops = doc.GetDocumentContentOperationsManager(),
    parts = value.split("\r");
  for (let i = 0; i < parts.length; i++) {
    if (i) {
      const trailing = ops.SplitNode(pam.GetPoint());
      pam.GetPoint().Assign(trailing, 0);
    }
    ops.InsertString(pam, parts[i] as string, mode);
  }
  return true;
}
/** SelectPam preserves an existing mark for expansion and clears it otherwise. @param pam - Original pam input. @param expand - Preserve the existing selection mark when true. @returns The represented native operation result. */
export function SelectPam(pam: SwPaM, expand: boolean): void {
  if (expand) {
    if (!pam.HasMark()) pam.SetMark();
  } else pam.DeleteMark();
}

/** Native name-container missing-element error. @returns The represented native operation result. */
export function noSuchElement(): never {
  throw new NoSuchElementException();
}
/** Native name-container duplicate-element error. @returns The represented native operation result. */
export function elementExists(): never {
  throw new ElementExistException();
}

/** Reads exact UTF16 units at the native/browser string boundary. @param value - Native string. @returns Logical UTF16 content. */
export function text(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); i++)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}

/** Creates the existing known-length Unicode value from browser UTF16 units. @param value - Logical text. @returns Owned native string. */
export function unicode(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}

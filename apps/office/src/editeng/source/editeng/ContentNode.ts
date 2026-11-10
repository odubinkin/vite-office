/** @fileoverview Original ContentNode text/paragraph/character/wrong-list owners and range-update members. Style-font recalculation uses the real editdoc font assembly; the enclosing engine remains a separate responsibility. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { SfxItemSet, SfxItemState } from "../../../svl/source/items/itemset";
import { SfxItemPool } from "../../../svl/source/items/itempool";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { SfxStyleSheet } from "../../../svl/inc/style";
import { SvxTabStop, SvxTabStopItem } from "../../inc/tstpitem";
import { EE_PARA_START, EE_CHAR_END, EE_PARA_TABS, EE_PARA_BULLETSTATE } from "../../inc/eeitem";
import { CharAttribList } from "./ContentNode.attribs";
import { CH_FEATURE, type EditCharAttrib } from "../../inc/editattr";
import { SvxFont } from "../../inc/svxfont";
import { WrongList } from "../../inc/edtspell";
import { MakeCharAttrib, CreateFont } from "../../inc/editdoc";
import { EditCharAttribField } from "../../inc/editattr";
import {
  EE_CHAR_ESCAPEMENT,
  EE_FEATURE_FIELD,
  EE_FEATURE_TAB,
  EE_FEATURE_LINEBR,
} from "../../inc/eeitem";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";

/** Original paragraph attributes and nonowning style pointer over the actual fixed-range SfxItemSet. */
export class ContentAttribs {
  private mpStyle: SfxStyleSheet | null = null;
  private readonly maAttribSet: SfxItemSet;
  /** Original pool constructor and implicit copy. @param source - Actual item pool or source value. @returns Paragraph attributes. */
  constructor(source: SfxItemPool | ContentAttribs) {
    if (source instanceof ContentAttribs) {
      this.mpStyle = source.mpStyle;
      this.maAttribSet = new SfxItemSet(source.maAttribSet);
    } else this.maAttribSet = new SfxItemSet(source, [[EE_PARA_START, EE_CHAR_END]]);
  }
  /** Original owned item-set destruction; the style is not owned here. @returns Nothing. */
  dispose(): void {
    this.maAttribSet.Dispose();
  }
  /** Original borrowed mutable paragraph set. @returns Actual set. */
  GetItems(): SfxItemSet {
    return this.maAttribSet;
  }
  /** Original borrowed style pointer. @returns Style or null. */
  GetStyleSheet(): SfxStyleSheet | null {
    return this.mpStyle;
  }
  /** Original changed-style-only selective clearing, preserving bullet on/off. @param style - Actual new style or null. @returns Nothing. */
  SetStyleSheet(style: SfxStyleSheet | null): void {
    const changed = this.mpStyle !== style;
    this.mpStyle = style;
    if (!(this.mpStyle && changed)) return;
    const attributes = this.mpStyle.GetItemSet();
    for (let which = EE_PARA_START; which <= EE_CHAR_END; which++)
      if (which !== EE_PARA_BULLETSTATE && attributes.GetItemState(which) === SfxItemState.SET)
        this.maAttribSet.ClearItem(which);
  }
  /** Original hard-attribute priority followed by the selected style's ordinary inherited lookup. @param which - Original ID. @returns Borrowed pooled value. */
  GetItem(which: number): SfxPoolItem {
    const source =
      this.mpStyle && this.maAttribSet.GetItemState(which, false) !== SfxItemState.SET
        ? this.mpStyle.GetItemSet()
        : this.maAttribSet;
    return source.Get(which);
  }
  /** Original hard/style explicit-value predicate. @param which - Original ID. @returns Source predicate. */
  HasItem(which: number): boolean {
    return (
      this.maAttribSet.GetItemState(which, false) === SfxItemState.SET ||
      (this.mpStyle !== null && this.mpStyle.GetItemSet().GetItemState(which) === SfxItemState.SET)
    );
  }
  /** Original explicit/default tab lookup and signed integral default-tab arithmetic. @param position - Original current position. @param defaultTab - Original unsigned16 default distance. @returns Copied tab stop. */
  FindTabStop(position: number, defaultTab: number): SvxTabStop {
    defaultTab &= 0xffff;
    const tabs = this.GetItem(EE_PARA_TABS) as SvxTabStopItem;
    for (let i = 0; i < tabs.Count(); i++) {
      const tab = tabs.At(i);
      if (tab.GetTabPos() > position) return new SvxTabStop(tab);
    }
    if (tabs.GetDefaultDistance()) defaultTab = tabs.GetDefaultDistance() & 0xffff;
    const tab = new SvxTabStop();
    tab.GetTabPos(true)[0] = defaultTab * (Math.trunc(position / defaultTab) + 1);
    return tab;
  }
}

/** Actual source paragraph owner; no array-of-lines or EditTextObject substitutes its text/attribute state. */
export class ContentNode {
  private readonly maString: OUString;
  private readonly maContentAttribs: ContentAttribs;
  private readonly maCharAttribList: CharAttribList;
  private mpWrongList: WrongList | null = null;
  /** Original pool constructor and text/paragraph-attributes constructor. @param args - Actual original overload. @returns Paragraph owner. */
  constructor(
    ...args: [pool: SfxItemPool] | [text: OUStringConstReference, attributes: ContentAttribs]
  ) {
    this.maString = args.length === 1 ? new OUString() : new OUString(args[0]);
    try {
      this.maContentAttribs = new ContentAttribs(args.length === 1 ? args[0] : args[1]);
      try {
        this.maCharAttribList = new CharAttribList();
      } catch (error) {
        this.maContentAttribs.dispose();
        throw error;
      }
    } catch (error) {
      this.maString.dispose();
      throw error;
    }
  }
  /** Original reverse member destruction. @returns Nothing. */
  dispose(): void {
    this.mpWrongList = null;
    this.maCharAttribList.dispose();
    this.maContentAttribs.dispose();
    this.maString.dispose();
  }
  /** Original borrowed paragraph attributes. @returns Actual owner. */
  GetContentAttribs(): ContentAttribs {
    return this.maContentAttribs;
  }
  /** Original borrowed character list/default font. @returns Actual owner. */
  GetCharAttribs(): CharAttribList {
    return this.maCharAttribList;
  }
  /** Original forwarded nonowning style pointer. @returns Style or null. */
  GetStyleSheet(): SfxStyleSheet | null {
    return this.maContentAttribs.GetStyleSheet();
  }
  /** Original style-first then hard-paragraph font assembly. @returns Nothing. */
  CreateDefFont(): void {
    const style = this.maContentAttribs.GetStyleSheet();
    if (style) CreateFont(this.maCharAttribList.GetDefFont(), style.GetItemSet());
    CreateFont(
      this.maCharAttribList.GetDefFont(),
      this.maContentAttribs.GetItems(),
      style === null,
    );
  }
  /** Original selected-style overloads; explicit false skips font recalculation. @param style - Actual nonowning style. @param fontOrRecalc - Source style-font value or original recalc flag. @returns Nothing. */
  SetStyleSheet(style: SfxStyleSheet | null, fontOrRecalc: SvxFont | boolean = true): void {
    this.maContentAttribs.SetStyleSheet(style);
    if (fontOrRecalc instanceof SvxFont) {
      this.maCharAttribList.GetDefFont().assign(fontOrRecalc);
      CreateFont(
        this.maCharAttribList.GetDefFont(),
        this.maContentAttribs.GetItems(),
        style === null,
      );
    } else if (fontOrRecalc) this.CreateDefFont();
  }
  /** Original borrowed text value. @returns Actual member. */
  GetString(): OUStringConstReference {
    return this.maString;
  }
  /** Original UTF16 length. @returns Length. */
  Len(): number {
    return this.maString.getLength();
  }
  /** Original unit query. @param position - Valid source index. @returns Unit. */
  GetChar(position: number): number {
    return this.maString.charAt(position);
  }
  /** Original split propagation, called after the previous node's text is cut. Transfers preserve the source insertion-before-translation order. @param previous - Actual previous paragraph. @param pool - Actual edit pool. @param keepEnding - Original ending-range policy. @returns Nothing. */
  CopyAndCutAttribs(previous: ContentNode, pool: SfxItemPool, keepEnding: boolean): void {
    const cut = previous.Len(),
      attributes = previous.GetCharAttribs().GetAttribs();
    let index = 0;
    while (index < attributes.length) {
      const attribute = attributes[index] as EditCharAttrib;
      if (attribute.GetEnd() < cut) index++;
      else if (attribute.GetEnd() === cut) {
        if (
          keepEnding &&
          !attribute.IsFeature() &&
          !this.maCharAttribList.FindAttrib(attribute.Which(), 0) &&
          attribute.Which() !== EE_CHAR_ESCAPEMENT
        )
          this.maCharAttribList.InsertAttrib(
            MakeCharAttrib(pool, attribute.GetItem() as SfxPoolItem, 0, 0) as EditCharAttrib,
          );
        index++;
      } else if (
        attribute.IsInside(cut) ||
        (!cut && !attribute.GetStart() && !attribute.IsFeature())
      ) {
        this.maCharAttribList.InsertAttrib(
          MakeCharAttrib(
            pool,
            attribute.GetItem() as SfxPoolItem,
            0,
            attribute.GetEnd() - cut,
          ) as EditCharAttrib,
        );
        attribute.GetEnd(true)[0] = cut;
        index++;
      } else {
        this.maCharAttribList.InsertAttrib(attribute);
        attributes.splice(index, 1);
        attribute.MoveBackward(cut);
      }
    }
  }
  /** Original join propagation, called before the next paragraph's text is appended. Matching empty ranges retain the source asymmetric melting rules. @param next - Actual paragraph whose range ownership is transferred. @returns Nothing. */
  AppendAttribs(next: ContentNode): void {
    const newStart = this.maString.getLength(),
      attributes = next.GetCharAttribs().GetAttribs();
    while (attributes.length) {
      const attribute = attributes[0] as EditCharAttrib;
      let melted = false;
      if (attribute.GetStart() === 0 && !attribute.IsFeature()) {
        let candidateIndex = 0;
        const own = this.maCharAttribList.GetAttribs();
        while (!melted && candidateIndex < own.length) {
          const candidate = own[candidateIndex] as EditCharAttrib;
          candidateIndex++;
          if (candidate.GetEnd() === newStart && candidate.Which() === attribute.Which()) {
            if (
              (candidate.GetItem() as SfxPoolItem).equals(attribute.GetItem() as SfxPoolItem) ||
              attribute.GetLen() === 0
            ) {
              candidate.GetEnd(true)[0] += attribute.GetLen();
              next.GetCharAttribs().Remove(0);
              melted = true;
            } else if (candidate.GetLen() === 0) this.maCharAttribList.Remove(--candidateIndex);
          }
        }
      }
      if (!melted) {
        attribute.GetStart(true)[0] += newStart;
        attribute.GetEnd(true)[0] += newStart;
        this.maCharAttribList.InsertAttrib(attribute);
        attributes.splice(0, 1);
      }
    }
  }
  /** Original raw length adjusted by each field's expanded value, independently of its feature flag. @returns Expanded UTF16 length. */
  GetExpandedLen(): number {
    let length = this.Len();
    const attributes = this.maCharAttribList.GetAttribs();
    for (let i = attributes.length; i;) {
      const attribute = attributes[--i] as EditCharAttrib;
      if (attribute.Which() === EE_FEATURE_FIELD) {
        length += (attribute as EditCharAttribField).GetFieldValue().getLength();
        length--;
      }
    }
    return length;
  }
  /** Original feature expansion for a raw half-open text span; literal markers without attributes remain literal. @param start - Raw start. @param end - Raw end, with negative/oversized values selecting paragraph end. @returns Owned expanded value. */
  GetExpandedText(start: number, end: number): OUString {
    if (end < 0 || end > this.Len()) end = this.Len();
    let index = start;
    const result = new OUStringBuffer(256);
    try {
      let feature = this.maCharAttribList.FindFeature(index);
      while (index < end) {
        let chunkEnd = end;
        if (feature && feature.GetStart() < chunkEnd) chunkEnd = feature.GetStart();
        else feature = null;
        if (chunkEnd > index) result.append(this.GetString().subView(index, chunkEnd - index));
        if (feature) {
          switch (feature.Which()) {
            case EE_FEATURE_TAB:
              result.append(Uint16Array.of(9));
              break;
            case EE_FEATURE_LINEBR:
              result.append(Uint16Array.of(10));
              break;
            case EE_FEATURE_FIELD:
              result.append((feature as EditCharAttribField).GetFieldValue());
              break;
          }
          feature = this.maCharAttribList.FindFeature(++chunkEnd);
        }
        index = chunkEnd;
      }
      return result.makeStringAndClear();
    } finally {
      result.dispose();
    }
  }
  /** Original in-place expanded-to-raw index mapping, including field-boundary bias and zero-length-field arithmetic. @param position - Original mutable position lvalue. @param biasStart - Choose start rather than end inside a field. @returns Nothing. */
  UnExpandPosition(position: [number], biasStart: boolean): void {
    for (const attribute of this.maCharAttribList.GetAttribs()) {
      const offset = attribute.GetStart();
      if (offset >= position[0]) return;
      if (attribute.Which() === EE_FEATURE_FIELD) {
        const chunk = (attribute as EditCharAttribField).GetFieldValue().getLength() - 1;
        if (offset + chunk >= position[0]) {
          position[0] = biasStart ? attribute.GetStart() : attribute.GetEnd();
          return;
        }
        position[0] -= chunk;
      }
    }
  }
  /** Original ordered mapping with different biases for the two endpoints. @param start - Mutable expanded start. @param end - Mutable expanded end. @returns Nothing. */
  UnExpandPositions(start: [number], end: [number]): void {
    this.UnExpandPosition(start, true);
    this.UnExpandPosition(end, false);
  }
  /** Original marker-only feature test, independent of the attribute list. @param position - Valid source index. @returns Marker predicate. */
  IsFeature(position: number): boolean {
    return this.maString.charAt(position) === CH_FEATURE;
  }
  /** Original replace-one-character mutation. @param position - Source index. @param character - Original UTF16 unit. @returns Nothing. */
  SetChar(position: number, character: number): void {
    const value = new OUString(character);
    try {
      const replaced = this.maString.replaceAt(position, 1, value);
      try {
        this.maString.assign(replaced);
      } finally {
        replaced.dispose();
      }
    } finally {
      value.dispose();
    }
  }
  /** Original literal insertion; attribute expansion belongs to the separate source call. @param text - Borrowed inserted value. @param position - Source index. @returns Nothing. */
  Insert(text: OUStringConstReference, position: number): void {
    const value = this.maString.replaceAt(position, 0, text);
    try {
      this.maString.assign(value);
    } finally {
      value.dispose();
    }
  }
  /** Original counted-view append. @param text - Source view. @returns Nothing. */
  Append(text: Uint16Array): void {
    this.maString.append(text);
  }
  /** Original truncate/range erase overloads; attribute collapse remains a separate operation. @param position - Source index. @param count - Optional source count. @returns Nothing. */
  Erase(position: number, count?: number): void {
    if (count === undefined) {
      const value = this.maString.copy(0, position);
      try {
        this.maString.assign(value);
      } finally {
        value.dispose();
      }
    } else {
      const empty = new OUString();
      try {
        const value = this.maString.replaceAt(position, count, empty);
        try {
          this.maString.assign(value);
        } finally {
          value.dispose();
        }
      } finally {
        empty.dispose();
      }
    }
  }
  /** Original owned substring overloads. @param position - Source start. @param count - Optional count. @returns Owned copy. */
  Copy(position: number, count?: number): OUString {
    return count === undefined ? this.maString.copy(position) : this.maString.copy(position, count);
  }
  /** Original exact attribute-expansion branch order, edge clearing, erase/resort and wrong-list forwarding. @param index - Original insertion index. @param added - Inserted unit count. @returns Nothing. */
  ExpandAttribs(index: number, added: number): void {
    if (!added) return;
    let resort = false,
      expandedEmptyAtZero = false,
      i = 0;
    const attributes = this.maCharAttribList.GetAttribs();
    while (i < attributes.length) {
      const attribute = attributes[i] as EditCharAttrib;
      if (attribute.GetEnd() >= index) {
        if (attribute.GetStart() > index) attribute.MoveForward(added);
        else if (attribute.IsEmpty() && attribute.IsExpandable()) {
          attribute.Expand(added);
          resort = true;
          if (attribute.GetStart() === 0) expandedEmptyAtZero = true;
        } else if (attribute.GetEnd() === index) {
          if (
            attribute.IsExpandable() &&
            !this.maCharAttribList.FindEmptyAttrib(attribute.Which(), index)
          ) {
            if (!attribute.IsEdge()) attribute.Expand(added);
          } else resort = true;
        } else if (attribute.GetStart() < index && attribute.GetEnd() > index)
          attribute.Expand(added);
        else if (attribute.GetStart() === index) {
          if (!attribute.IsExpandable()) {
            attribute.MoveForward(added);
            resort = true;
          } else {
            let expand = false;
            if (index === 0) {
              expand = true;
              if (expandedEmptyAtZero) {
                const which = (attribute.GetItem() as SfxPoolItem).Which();
                for (let previous = 0; previous < i; previous++) {
                  const value = attributes[previous] as EditCharAttrib;
                  if (
                    value.GetStart() === 0 &&
                    (value.GetItem() as SfxPoolItem).Which() === which
                  ) {
                    expand = false;
                    break;
                  }
                }
              }
            }
            if (expand) {
              attribute.Expand(added);
              resort = true;
            } else attribute.MoveForward(added);
          }
        }
      }
      if (attribute.IsEdge()) attribute.SetEdge(false);
      if (attribute.IsEmpty()) {
        resort = true;
        this.maCharAttribList.Remove(i);
      } else i++;
    }
    if (resort) this.maCharAttribList.ResortAttribs();
    if (this.mpWrongList)
      this.mpWrongList.TextInserted(
        BigInt(index),
        BigInt(added),
        this.maString.charAt(index) === 32 || this.IsFeature(index),
      );
  }
  /** Original exact attribute-collapse branch order, empty-range retention, erase/resort and wrong-list forwarding. @param index - Original deletion index. @param deleted - Removed unit count. @returns Nothing. */
  CollapseAttribs(index: number, deleted: number): void {
    if (!deleted) return;
    let resort = false,
      i = 0;
    const end = index + deleted,
      attributes = this.maCharAttribList.GetAttribs();
    while (i < attributes.length) {
      const attribute = attributes[i] as EditCharAttrib;
      let remove = false;
      if (attribute.GetEnd() >= index) {
        if (attribute.GetStart() >= end) attribute.MoveBackward(deleted);
        else if (attribute.GetStart() >= index && attribute.GetEnd() <= end) {
          if (
            !attribute.IsFeature() &&
            attribute.GetStart() === index &&
            attribute.GetEnd() === end
          ) {
            attribute.GetEnd(true)[0] = index;
            resort = true;
          } else remove = true;
        } else if (attribute.GetStart() <= index && attribute.GetEnd() > index) {
          if (attribute.GetEnd() <= end) attribute.GetEnd(true)[0] = index;
          else attribute.Collaps(deleted);
        } else if (attribute.GetStart() >= index && attribute.GetEnd() > end) {
          if (attribute.IsFeature()) {
            attribute.MoveBackward(deleted);
            resort = true;
          } else {
            attribute.GetStart(true)[0] = end;
            attribute.MoveBackward(deleted);
          }
        }
      }
      if (remove) {
        resort = true;
        this.maCharAttribList.Remove(i);
      } else {
        if (attribute.IsEmpty()) this.maCharAttribList.SetHasEmptyAttribs(true);
        i++;
      }
    }
    if (resort) this.maCharAttribList.ResortAttribs();
    if (this.mpWrongList) this.mpWrongList.TextDeleted(BigInt(index), BigInt(deleted));
  }
  /** Original create-only-if-absent wrapper. @returns Nothing. */
  EnsureWrongList(): void {
    if (!this.mpWrongList) this.CreateWrongList();
  }
  /** Original borrowed list pointer. @returns Actual list or null. */
  GetWrongList(): WrongList | null {
    return this.mpWrongList;
  }
  /** Original transferred unique list ownership. @param value - New list or null. @returns Nothing. */
  SetWrongList(value: WrongList | null): void {
    this.mpWrongList = value;
  }
  /** Original keep-existing-empty, replace-existing-nonempty rule. @returns Nothing. */
  CreateWrongList(): void {
    if (!this.mpWrongList || !this.mpWrongList.empty()) this.mpWrongList = new WrongList();
  }
  /** Original list reset. @returns Nothing. */
  DestroyWrongList(): void {
    this.mpWrongList = null;
  }
  /** Original nonempty-paragraph gate before deleting empty character attributes. @returns Nothing. */
  checkAndDeleteEmptyAttribs(): void {
    if (this.maCharAttribList.HasEmptyAttribs() && this.Len())
      this.maCharAttribList.DeleteEmptyAttribs();
  }
}

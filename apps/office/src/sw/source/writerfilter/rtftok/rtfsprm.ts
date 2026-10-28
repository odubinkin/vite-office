/** @fileoverview Native RTFSprms intrusive copy-on-write list, conflict policies, style/list normalization and RTFSprm resource views from rtfsprm.cxx. */
import { SvRef, SvRefBase } from "../../../../tools/inc/ref";
import type { Id, Properties, Reference, Sprm } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { RTFValue } from "./rtfvalue";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import {
  putNestedAttribute,
  getNestedAttribute,
  getNestedSprm,
  eraseNestedAttribute,
  getParagraphBorder,
} from "./rtfdocumentimpl.properties";
/** Native ordered entry retains the actual mutable intrusive-reference cell. */
export type RTFSprmsEntry = [Id, SvRef<RTFValue>];
/** Original conflict policy ordering from rtfsprm.hxx. */
export enum RTFConflictPolicy {
  Overwrite,
  Append,
  Ignore,
  ReplaceAtStart,
}
/** Actual shared vector payload; last intrusive release destroys all owned value cells. */
class RTFSprmsImpl extends SvRefBase {
  readonly entries: RTFSprmsEntry[] = [];
  /** Original vector member destruction. @returns Nothing. */
  protected override destroy(): void {
    for (const entry of this.entries) entry[1].dispose();
    this.entries.length = 0;
  }
}
/** Native list owner. The optional true argument binds the erased CopyForWrite enum constructor witness; for-of binds original vector iteration. */
export class RTFSprms extends SvRefBase implements Iterable<RTFSprmsEntry> {
  private readonly m_pSprms: SvRef<RTFSprmsImpl>;
  /** Native default/shared copy/eager copy-for-write constructors. @param source - Optional copied list. @param copyForWrite - Original typed enum constructor selection. @returns List. */
  constructor(source?: RTFSprms, copyForWrite = false) {
    super();
    this.m_pSprms =
      source === undefined ? new SvRef(new RTFSprmsImpl()) : new SvRef(source.m_pSprms);
    if (copyForWrite) this.ensureCopyBeforeWrite();
  }
  /** Original compiler-generated copy assignment copies the intrusive payload after the no-op base assignment. @param source - Native source list. @returns This list. */
  override assign(source: RTFSprms): this {
    super.assign(source);
    this.m_pSprms.assign(source.m_pSprms);
    return this;
  }
  /** Original compiler-generated move assignment transfers the actual reference cell without self-move repair. @param source - Native rvalue list. @returns This list. */
  moveAssign(source: RTFSprms): this {
    super.assign(source);
    this.m_pSprms.moveAssign(source.m_pSprms);
    return this;
  }
  /** Original vector iteration over actual entry cells. @returns Iterator. */
  [Symbol.iterator](): ArrayIterator<RTFSprmsEntry> {
    return this.m_pSprms.operatorDereference().entries[Symbol.iterator]();
  }
  /** Original payload size. @returns Entry count. */
  size(): number {
    return this.m_pSprms.operatorDereference().entries.length;
  }
  /** Original empty predicate. @returns Whether empty. */
  empty(): boolean {
    return this.size() === 0;
  }
  /** Original back reference; empty access has no valid native domain. @returns Actual entry. */
  back(): RTFSprmsEntry {
    const entry = this.m_pSprms.operatorDereference().entries.at(-1);
    if (entry === undefined) throw new Error("assert(!empty())");
    return entry;
  }
  /** Original first/last lookup returns an owning SvRef value; write lookup first clones shared payload/value objects. @param keyword - Original resource ID. @param first - First rather than last match. @param forWrite - Native write access. @returns Owned reference, possibly null. */
  find(keyword: Id, first = true, forWrite = false): SvRef<RTFValue> {
    if (forWrite) this.ensureCopyBeforeWrite();
    const entries = this.m_pSprms.operatorDereference().entries;
    let found: RTFSprmsEntry | undefined;
    for (let offset = 0; offset < entries.length; ++offset) {
      const entry = entries[first ? offset : entries.length - offset - 1];
      if (entry?.[0] === keyword) {
        found = entry;
        break;
      }
    }
    return found === undefined ? new SvRef<RTFValue>() : new SvRef(found[1]);
  }
  /** Original conflict policies preserve insertion order and duplicate-key semantics. Raw pointers bind the original implicit SvRef prvalue. @param keyword - Resource ID. @param value - Actual value/reference. @param policy - Conflict policy. @returns Nothing. */
  set(keyword: Id, value: RTFValue | SvRef<RTFValue>, policy = RTFConflictPolicy.Overwrite): void {
    this.ensureCopyBeforeWrite();
    const entries = this.m_pSprms.operatorDereference().entries;
    if (policy === RTFConflictPolicy.ReplaceAtStart) {
      for (let index = entries.length - 1; index >= 0; --index)
        if (entries[index]?.[0] === keyword) {
          entries.splice(index, 1)[0]?.[1].dispose();
        }
      entries.unshift([keyword, new SvRef(value)]);
      return;
    }
    const existing = entries.find(
      /** Selects the first native duplicate. @param entry - Entry. @returns Match. */ (entry) =>
        entry[0] === keyword,
    );
    if (policy === RTFConflictPolicy.Overwrite && existing !== undefined) existing[1].assign(value);
    else if (policy === RTFConflictPolicy.Append || existing === undefined)
      entries.push([keyword, new SvRef(value)]);
  }
  /** Original first-match erase. @param keyword - ID. @returns Whether erased. */
  erase(keyword: Id): boolean {
    this.ensureCopyBeforeWrite();
    const entries = this.m_pSprms.operatorDereference().entries;
    const index = entries.findIndex(
      /** Finds original first duplicate. @param entry - Entry. @returns Match. */ (entry) =>
        entry[0] === keyword,
    );
    if (index < 0) return false;
    entries.splice(index, 1)[0]?.[1].dispose();
    return true;
  }
  /** Original reverse-match erase. @param keyword - ID. @returns Nothing. */
  eraseLast(keyword: Id): void {
    this.ensureCopyBeforeWrite();
    const entries = this.m_pSprms.operatorDereference().entries;
    for (let index = entries.length - 1; index >= 0; --index) {
      if (entries[index]?.[0] === keyword) {
        entries.splice(index, 1)[0]?.[1].dispose();
        break;
      }
    }
  }
  /** Native style normalization including implicit paragraph properties, recursive default insertion, denylist and expected-child pruning. @param reference - Actual style tree. @param styleType - Original style token or0. @param implicitPPr - Unwrap style pPr. @param direct - Root direct tree for list-indent denylist. @returns Owned by-value list. */
  cloneAndDeduplicate(
    reference: RTFSprms,
    styleType: Id,
    implicitPPr = false,
    direct: RTFSprms | null = null,
  ): RTFSprms {
    const result = new RTFSprms(this, true);
    for (const entry of reference) {
      if (implicitPPr && entry[0] === N.LN_CT_Style_pPr) {
        for (const child of entry[1].operatorDereference().getSprms())
          cloneAndDeduplicateSprm(child, result, styleType, direct);
      } else cloneAndDeduplicateSprm(entry, result, styleType, direct);
    }
    return result;
  }
  /** Original invalid-list first-indent deduplication; retains source eraseNestedAttribute alias semantics. @param invalid - Actual level/indent table. @returns Nothing. */
  deduplicateList(invalid: ReadonlyMap<number, number>): void {
    const level = getNestedSprm(this, N.LN_CT_PPrBase_numPr, N.LN_CT_NumPr_ilvl);
    try {
      const expected = invalid.get(level.get()?.getInt() ?? 0);
      if (expected === undefined) return;
      const value = getNestedAttribute(this, N.LN_CT_PPrBase_ind, N.LN_CT_Ind_firstLine);
      try {
        if (value.is() && value.operatorDereference().getInt() === expected)
          eraseNestedAttribute(this, N.LN_CT_PPrBase_ind, N.LN_CT_Ind_firstLine);
      } finally {
        value.dispose();
      }
    } finally {
      level.dispose();
    }
  }
  /** Original list-indent default insertion selects the first matching actual abstract level. @param abstract - Native abstract-list reference. @returns Nothing. */
  duplicateList(abstract: SvRef<RTFValue>): void {
    const levelId = getNestedSprm(this, N.LN_CT_PPrBase_numPr, N.LN_CT_NumPr_ilvl);
    try {
      const level = getListLevel(abstract, levelId.get()?.getInt() ?? 0);
      try {
        if (!level.is()) return;
        const indent = level.operatorDereference().getSprms().find(N.LN_CT_PPrBase_ind);
        try {
          if (!indent.is()) return;
          for (const [id] of indent.operatorDereference().getAttributes()) {
            if (id !== N.LN_CT_Ind_left && id !== N.LN_CT_Ind_right && id !== N.LN_CT_Ind_firstLine)
              continue;
            const existing = getNestedAttribute(this, N.LN_CT_PPrBase_ind, id);
            try {
              if (!existing.is()) {
                const fallback = getDefaultSPRM(id, 0);
                try {
                  putNestedAttribute(this, N.LN_CT_PPrBase_ind, id, fallback);
                } finally {
                  fallback.dispose();
                }
              }
            } finally {
              existing.dispose();
            }
          }
        } finally {
          indent.dispose();
        }
      } finally {
        level.dispose();
      }
    } finally {
      levelId.dispose();
    }
  }
  /** Original order-sensitive deep value equality. @param other - List. @returns Equality. */
  equals(other: RTFSprms): boolean {
    const left = this.m_pSprms.operatorDereference().entries,
      right = other.m_pSprms.operatorDereference().entries;
    return (
      left.length === right.length &&
      left.every(
        /** Compares native ordered entries. @param entry - Left entry. @param index - Position. @returns Equality. */ (
          entry,
          index,
        ) =>
          entry[0] === right[index]?.[0] &&
          entry[1]
            .operatorDereference()
            .equals((right[index] as RTFSprmsEntry)[1].operatorDereference()),
      )
    );
  }
  /** Original clear keeps an unshared payload or replaces a shared payload with a fresh empty one. @returns Nothing. */
  clear(): void {
    const payload = this.m_pSprms.operatorDereference();
    if (payload.GetRefCount() === 1) {
      for (const entry of payload.entries) entry[1].dispose();
      payload.entries.length = 0;
    } else this.m_pSprms.assign(new RTFSprmsImpl());
  }
  /** Original write barrier deep-clones the value objects while their nested lists keep native copy-on-write sharing. @returns Nothing. */
  private ensureCopyBeforeWrite(): void {
    const payload = this.m_pSprms.operatorDereference();
    if (payload.GetRefCount() <= 1) return;
    const copy = new RTFSprmsImpl();
    for (const entry of payload.entries)
      copy.entries.push([entry[0], new SvRef(entry[1].operatorDereference().Clone())]);
    this.m_pSprms.assign(copy);
  }
  /** Logical stack destructor binding. @returns Nothing. */
  dispose(): void {
    this.m_pSprms.clear();
  }
  /** Original virtual destructor releases the payload. @returns Nothing. */
  protected override destroy(): void {
    this.dispose();
  }
}
/** Native modifier borrows the actual pointer cell rather than copying the value. */
export class RTFSprm implements Sprm {
  /** Original keyword and reference-to-value constructor. @param keyword - ID. @param value - Borrowed actual reference cell. @returns Modifier. */
  constructor(
    private readonly keyword: Id,
    private readonly value: SvRef<RTFValue>,
  ) {}
  /** Native ID. @returns ID. */ getId(): Id {
    return this.keyword;
  }
  /** Native borrowed value pointer. @returns Value. */ getValue(): RTFValue | null {
    return this.value.get();
  }
  /** Native nested-property projection. @returns Owned reference container. */ getProps(): Reference<Properties> {
    return this.value.operatorDereference().getProperties();
  }
}
/** Original style-default helper for both character and paragraph/implicit normalization. @param id - Resource token. @param styleType - Original style type. @returns Owned nullable native reference. */
export function getDefaultSPRM(id: Id, styleType: Id): SvRef<RTFValue> {
  if (styleType === N.LN_Value_ST_StyleType_character) {
    switch (id) {
      case N.LN_EG_RPrBase_szCs:
      case N.LN_EG_RPrBase_sz:
        return new SvRef(new RTFValue(24));
      case N.LN_CT_Color_val:
      case N.LN_EG_RPrBase_b:
      case N.LN_EG_RPrBase_i:
        return new SvRef(new RTFValue(0));
      case N.LN_CT_Underline_val:
        return new SvRef(new RTFValue(N.LN_Value_ST_Underline_none));
      case N.LN_CT_Fonts_ascii:
      case N.LN_CT_Fonts_eastAsia:
      case N.LN_CT_Fonts_cs: {
        const text = new OUString(
          new Uint16Array([84, 105, 109, 101, 115, 32, 78, 101, 119, 32, 82, 111, 109, 97, 110]),
          15,
        );
        try {
          return new SvRef(new RTFValue(text));
        } finally {
          text.dispose();
        }
      }
    }
  }
  if (!styleType || styleType === N.LN_Value_ST_StyleType_paragraph) {
    switch (id) {
      case N.LN_CT_PPrBase_spacing: {
        const attrs = new RTFSprms(),
          sprms = new RTFSprms();
        try {
          attrs.set(N.LN_CT_Spacing_after, new RTFValue(0));
          return new SvRef(new RTFValue(attrs, sprms));
        } finally {
          attrs.dispose();
          sprms.dispose();
        }
      }
      case N.LN_CT_Spacing_before:
      case N.LN_CT_Spacing_after:
      case N.LN_CT_Ind_left:
      case N.LN_CT_Ind_right:
      case N.LN_CT_Ind_firstLine:
      case N.LN_CT_NumPr_numId:
        return new SvRef(new RTFValue(0));
      case N.LN_CT_Spacing_lineRule:
        return new SvRef(new RTFValue(N.LN_Value_doc_ST_LineSpacingRule_auto));
      case N.LN_CT_Spacing_line:
        return new SvRef(new RTFValue(240));
      case N.LN_CT_PrBase_pBdr: {
        const attrs = new RTFSprms(),
          sprms = new RTFSprms();
        try {
          for (let index = 0; index < 4; ++index) {
            const childAttrs = new RTFSprms(),
              childSprms = new RTFSprms();
            try {
              childAttrs.set(N.LN_CT_Border_val, new RTFValue(N.LN_Value_ST_Border_none));
              sprms.set(getParagraphBorder(index), new RTFValue(childAttrs, childSprms));
            } finally {
              childAttrs.dispose();
              childSprms.dispose();
            }
          }
          return new SvRef(new RTFValue(attrs, sprms));
        } finally {
          attrs.dispose();
          sprms.dispose();
        }
      }
    }
  }
  return new SvRef<RTFValue>();
}
/** Native dedup denylist including the direct-numbering indent condition. @param id - Token. @param direct - Actual root direct tree. @returns Whether retained. */
function isSPRMDeduplicateDenylist(id: Id, direct: RTFSprms | null): boolean {
  switch (id) {
    case N.LN_CT_Style_type:
    case N.LN_CT_TabStop_val:
    case N.LN_CT_TabStop_leader:
    case N.LN_CT_TabStop_pos:
    case N.LN_CT_Spacing_beforeAutospacing:
    case N.LN_CT_Spacing_afterAutospacing:
    case N.LN_CT_Border_sz:
    case N.LN_CT_Border_val:
    case N.LN_CT_Border_color:
    case N.LN_CT_Border_space:
    case N.LN_CT_Border_shadow:
    case N.LN_CT_Border_frame:
    case N.LN_CT_Border_themeTint:
    case N.LN_CT_Border_themeColor:
      return true;
    case N.LN_CT_Ind_firstLine:
    case N.LN_CT_Ind_left: {
      if (direct === null) return false;
      const reference = direct.find(N.LN_CT_PPrBase_numPr);
      try {
        return reference.is();
      } finally {
        reference.dispose();
      }
    }
    default:
      return false;
  }
}
/** Original child-expectation guard. @param id - Token. @returns Whether empty children remove this modifier. */
function isSPRMChildrenExpected(id: Id): boolean {
  switch (id) {
    case N.LN_CT_PBdr_top:
    case N.LN_CT_PBdr_left:
    case N.LN_CT_PBdr_bottom:
    case N.LN_CT_PBdr_right:
    case N.LN_CT_PrBase_shd:
    case N.LN_CT_PPrBase_ind:
      return true;
    default:
      return false;
  }
}
/** Original recursive per-reference-property deduplication, retaining default and nested ordering. @param entry - Reference entry. @param result - Writable direct tree. @param styleType - Native style type. @param direct - Root direct tree. @returns Nothing. */
function cloneAndDeduplicateSprm(
  entry: RTFSprmsEntry,
  result: RTFSprms,
  styleType: Id,
  direct: RTFSprms | null,
): void {
  const [id, reference] = entry,
    value = result.find(id);
  try {
    const source = reference.operatorDereference(),
      current = value.get();
    if (current !== null) {
      if (source.equals(current)) {
        if (
          styleType === N.LN_Value_ST_StyleType_character &&
          !isSPRMDeduplicateDenylist(id, direct)
        )
          result.erase(id);
      } else if (!source.getSprms().empty() || !source.getAttributes().empty()) {
        const sprms = current
          .getSprms()
          .cloneAndDeduplicate(source.getSprms(), styleType, false, direct);
        const attrs = current
          .getAttributes()
          .cloneAndDeduplicate(source.getAttributes(), styleType, false, direct);
        try {
          if (!isSPRMChildrenExpected(id) || !sprms.empty() || !attrs.empty())
            result.set(id, current.CloneWithSprms(attrs, sprms));
        } finally {
          sprms.dispose();
          attrs.dispose();
        }
      }
    } else {
      const fallback = getDefaultSPRM(id, styleType);
      try {
        if (fallback.is()) result.set(id, fallback);
        else if (!source.getSprms().empty() || !source.getAttributes().empty()) {
          const empty = new RTFSprms();
          const sprms = empty.cloneAndDeduplicate(source.getSprms(), styleType);
          const attrs = empty.cloneAndDeduplicate(source.getAttributes(), styleType);
          try {
            if (!sprms.empty() || !attrs.empty()) result.set(id, new RTFValue(attrs, sprms));
          } finally {
            empty.dispose();
            sprms.dispose();
            attrs.dispose();
          }
        }
      } finally {
        fallback.dispose();
      }
    }
  } finally {
    value.dispose();
  }
}
/** Original abstract-list level search returns the first matching level. @param abstract - Native abstract list. @param level - Level. @returns Owned nullable reference. */
function getListLevel(abstract: SvRef<RTFValue>, level: number): SvRef<RTFValue> {
  for (const [id, value] of abstract.operatorDereference().getSprms()) {
    if (id !== N.LN_CT_AbstractNum_lvl) continue;
    const current = value.operatorDereference().getAttributes().find(N.LN_CT_Lvl_ilvl);
    try {
      if (current.is() && current.operatorDereference().getInt() === level) return new SvRef(value);
    } finally {
      current.dispose();
    }
  }
  return new SvRef<RTFValue>();
}

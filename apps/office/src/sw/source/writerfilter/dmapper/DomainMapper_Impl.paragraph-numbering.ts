/** @fileoverview Native numbering phase of finishParagraph and original numbering-property lookup, operating on the same mapper and property owners. */
import type { DomainMapper_Impl } from "./DomainMapper_Impl";
import { ParagraphPropertyMap } from "./PropertyMap";
import { StyleType, type StyleSheetEntry, type StyleSheetTable } from "./StyleSheetTable";
import { lcl_getListId, lcl_getParent } from "./DomainMapper_Impl.numbering";
import { PropertyIds as P } from "./PropertyIds";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../../cppu/inc/com/sun/star/uno/Exception";
import { text, unicode, stringAny } from "../../core/unocore/unocrsrhelper";
import { Reference, UNO_QUERY } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import { cppu_detail_getUnoType as indexReplaceType } from "../../../../cppu/inc/com/sun/star/container/XIndexReplace";
import { SwXNumberingRules } from "../../core/unocore/unosett";
import type { SwXParagraph } from "../../core/unocore/unoparagraph";
/** Original finishParagraph locals retained across native paragraph creation. */
export interface ParagraphNumbering {
  readonly listId: number;
  readonly entry: StyleSheetEntry | null;
  readonly viaStyle: boolean;
  readonly viaRule: boolean;
}
/** Inserts an owned native scalar, preserving PropertyMap overwrite semantics. @param map - Actual paragraph. @param id - Native property. @param value - Owned value. @param overwrite - Original flag. @returns Nothing. */
function insert(map: ParagraphPropertyMap, id: P, value: Any, overwrite = false): void {
  try {
    map.Insert(id, value, overwrite);
  } finally {
    value.dispose();
  }
}
/** Original source lookup stops at the first property, including its nonzero-ID truth test and direct self-parent guard. @param id - Property. @param initial - Current source style. @param table - Native stylesheet. @returns Owned value. */
export function lcl_GetPropertyFromParaStyleSheetNoNum(
  id: P,
  initial: StyleSheetEntry | null,
  table: StyleSheetTable,
): Any {
  let entry = initial;
  while (entry) {
    const property = entry.m_pProperties.getProperty(id);
    if (property) {
      if (entry.m_pProperties.props().GetListId()) {
        property[1].dispose();
        return new Any();
      }
      return property[1];
    }
    const parent = lcl_getParent(entry, table);
    if (parent === entry) break;
    entry = parent;
  }
  return new Any();
}
/** Original getNumberingProperty resolves the actual named style and uses the native property getter; invalid hand-crafted levels are caught as UNO exceptions. @param this - Actual mapper. @param id - Concrete list ID. @param level - Original level. @param property - Native property name. @returns Signed32 value or zero. */
export function getNumberingProperty(
  this: DomainMapper_Impl,
  id: number,
  level: number,
  property: string,
): number {
  if (id < 0) return 0;
  try {
    if (level < 0) level = 0;
    const list = this.GetListTable().GetList(id);
    if (!list) throw new Error("assert(pList)");
    const familyKey = unicode("NumberingStyles"),
      family = this.GetTextDocument().getStyleFamilies().getByName(familyKey);
    familyKey.dispose();
    const name = unicode(list.GetStyleName());
    const style = family.getStyleByName(name);
    name.dispose();
    try {
      const key = unicode("NumberingRules"),
        value = style.getPropertyValue(key),
        reference = new Reference(value, UNO_QUERY, indexReplaceType);
      key.dispose();
      const rules = reference.get();
      try {
        if (!(rules instanceof SwXNumberingRules)) return 0;
        const propertyName = unicode(property),
          amount: [number] = [0];
        try {
          const result = rules.getPropertyByIndex(level, propertyName);
          try {
            result.extract(amount, "sal_Int32");
            return amount[0];
          } finally {
            result.dispose();
          }
        } finally {
          propertyName.dispose();
        }
      } finally {
        // This style getter returns an owned native rule copy, just as the existing ListDef consumer.
        if (rules instanceof SwXNumberingRules) rules.GetNumRule().Dispose();
        reference.dispose();
        value.dispose();
      }
    } finally {
      style.dispose();
    }
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    error.dispose();
    return 0;
  }
}
/** Original direct-context numbering-property lookup iterates the native property sequence; absent mode-specific fields return zero and index errors propagate. @param this - Actual mapper. @param property - Native name. @returns Signed32 value or zero. */
export function getCurrentNumberingProperty(this: DomainMapper_Impl, property: string): number {
  const context = this.GetTopContext(),
    rulesValue = context?.getProperty(P.PROP_NUMBERING_RULES),
    levelValue = context?.getProperty(P.PROP_NUMBERING_LEVEL),
    level: [number] = [0];
  try {
    levelValue?.[1].extract(level, "sal_Int32");
    if (!rulesValue) return 0;
    const reference = new Reference(rulesValue[1], UNO_QUERY, indexAccessType);
    try {
      const rules = reference.get();
      if (!(rules instanceof SwXNumberingRules)) return 0;
      const value = rules.getByIndex(level[0]),
        sequence = new NumberingPropertySequence();
      try {
        value.extract(sequence.getAddress(), numberingSequenceType);
        for (let index = 0; index < sequence.getLength(); index++) {
          const item = readNumberingProperty(sequence, index);
          try {
            if (text(item.Name) === property) {
              const amount: [number] = [0];
              item.Value.extract(amount, "sal_Int32");
              return amount[0];
            }
          } finally {
            item.Name.dispose();
            item.Value.dispose();
          }
        }
      } finally {
        value.dispose();
        sequence.dispose();
      }
      return 0;
    } finally {
      reference.dispose();
    }
  } finally {
    rulesValue?.[1].dispose();
    levelValue?.[1].dispose();
  }
}
/** Original numbering-resolution phase precedes paragraph creation; direct list rules and style-derived rules retain different indentation priorities. @param this - Actual mapper. @param paragraph - Actual paragraph properties. @param remove - Original removal flag. @param noNumbering - Original list cancellation flag. @returns Original locals for the post-create phase. */
export function PrepareParagraphNumbering(
  this: DomainMapper_Impl,
  paragraph: ParagraphPropertyMap | null,
  remove = false,
  noNumbering = false,
): ParagraphNumbering {
  const table = this.GetStyleSheetTable(),
    entry = table.FindStyleSheetByConvertedStyleName(this.GetCurrentParaStyleName());
  let id = paragraph?.props().GetListId() ?? -1,
    viaStyle = false;
  const viaRule = id > -1;
  if (!remove && entry && paragraph) {
    if (entry.m_nStyleTypeCode !== StyleType.Paragraph) paragraph.Erase(P.PROP_PARA_STYLE_NAME);
    const inherited: [boolean] = [false];
    if (!viaRule) id = lcl_getListId(entry, table, inherited);
    let level = this.GetListLevel(entry, paragraph);
    if (level === -1 && id > (this.IsOOXMLImport() ? 0 : -1)) level = 0;
    if (!noNumbering && level >= 0 && level < 9)
      insert(paragraph, P.PROP_NUMBERING_LEVEL, new Any([level], "sal_Int16"));
    const list = this.GetListTable().GetList(id);
    if (list && !paragraph.isSet(P.PROP_NUMBERING_STYLE_NAME)) {
      if (noNumbering || level === 9) {
        insert(paragraph, P.PROP_NUMBERING_STYLE_NAME, stringAny(""), true);
        paragraph.Erase(P.PROP_NUMBERING_LEVEL);
      } else if (!viaRule) {
        viaStyle = true;
        insert(paragraph, P.PROP_NUMBERING_STYLE_NAME, stringAny(list.GetStyleName()), true);
      } else if (id === lcl_getListId(entry, table, [false]))
        insert(paragraph, P.PROP_NUMBERING_STYLE_NAME, stringAny(list.GetStyleName()), true);
    }
    const parent = lcl_getParent(entry, table);
    const getOptProperty =
      /** Original single-parent margin lookup has a separate inheritance flag for left/first and unconditional parent access for right. @param property - Native property. @param useParent - Original selector. @returns Owned optional value. */ (
        property: P,
        useParent: boolean,
      ): Any | undefined =>
        entry.m_pProperties.getProperty(property)?.[1] ??
        (useParent ? parent?.m_pProperties.getProperty(property)?.[1] : undefined);
    const copyNumberingIndents =
      /** Copies only nonzero numbering offsets, without overwriting direct paragraph geometry. @returns Nothing. */ (): void => {
        for (const [target, name] of [
          [P.PROP_PARA_FIRST_LINE_INDENT, "FirstLineIndent"],
          [P.PROP_PARA_LEFT_MARGIN, "IndentAt"],
        ] as const) {
          const amount = getNumberingProperty.call(this, id, level, name);
          if (amount !== 0) insert(paragraph, target, new Any([amount], "sal_Int32"));
        }
      };
    if (viaStyle) {
      for (const property of [P.PROP_PARA_FIRST_LINE_INDENT, P.PROP_PARA_LEFT_MARGIN]) {
        const value = getOptProperty(property, inherited[0]);
        if (value) insert(paragraph, property, value);
      }
      const right = getOptProperty(P.PROP_PARA_RIGHT_MARGIN, true);
      if (right) {
        const amount: [number] = [0];
        right.extract(amount, "sal_Int32");
        if (amount[0] !== 0) {
          copyNumberingIndents();
          insert(paragraph, P.PROP_PARA_RIGHT_MARGIN, right);
        } else right.dispose();
      }
    } else if (viaRule) {
      const right = this.GetPropertyFromParaStyleSheet(P.PROP_PARA_RIGHT_MARGIN);
      if (right.hasValue()) {
        insert(paragraph, P.PROP_PARA_RIGHT_MARGIN, right);
        copyNumberingIndents();
      } else right.dispose();
    }
    if (id === 0 && !list) {
      for (const property of [P.PROP_PARA_FIRST_LINE_INDENT, P.PROP_PARA_LEFT_MARGIN]) {
        const value = lcl_GetPropertyFromParaStyleSheetNoNum(property, entry, table);
        if (value.hasValue()) insert(paragraph, property, value);
        else {
          value.dispose();
          insert(paragraph, property, new Any([0], "sal_uInt32"));
        }
      }
    }
  }
  return {
    listId: id,
    entry,
    viaStyle,
    viaRule: paragraph?.isSet(P.PROP_NUMBERING_RULES) ?? false,
  };
}
/** Original post-create numbering phase shares actual abstract-list IDs and applies native startOverride only once per concrete list. @param this - Actual mapper. @param paragraph - Actual created paragraph API. @param properties - Native paragraph map. @param numbering - Original locals. @param applied - Original mapper set. @returns Nothing. */
export function FinishParagraphNumbering(
  this: DomainMapper_Impl,
  paragraph: SwXParagraph,
  properties: ParagraphPropertyMap | null,
  numbering: ParagraphNumbering,
  applied: Set<number>,
): void {
  if (!numbering.viaStyle && !numbering.viaRule) return;
  const list = this.GetListTable().GetList(numbering.listId);
  if (!list) return;
  const abstract = list.GetAbstractDefinition();
  if (abstract) {
    const key = unicode("ListId"),
      value = paragraph.getPropertyValue(key),
      id = new OUString();
    try {
      value.extract(id, "OUString");
      if (!id.isEmpty()) {
        const mapped = abstract.MapListId(text(id));
        if (mapped !== text(id)) {
          const changed = stringAny(mapped);
          try {
            paragraph.setPropertyValue(key, changed);
          } finally {
            changed.dispose();
          }
        }
      }
    } finally {
      id.dispose();
      value.dispose();
      key.dispose();
    }
  }
  const level = this.GetListLevel(numbering.entry, properties ?? undefined),
    start = list.GetLevel(level === -1 ? 0 : level)?.GetStartOverride();
  if (start !== undefined && start !== -1 && !applied.has(numbering.listId)) {
    for (const [name, value] of [
      ["ParaIsNumberingRestart", new Any([true], "bool")],
      ["NumberingStartValue", new Any([start], "sal_Int16")],
    ] as const) {
      const key = unicode(name);
      try {
        paragraph.setPropertyValue(key, value);
      } finally {
        key.dispose();
        value.dispose();
      }
    }
    applied.add(numbering.listId);
  }
}

import { cppu_detail_getUnoType as indexAccessType } from "../../../../cppu/inc/com/sun/star/container/XIndexAccess";
import {
  NumberingPropertySequence,
  numberingSequenceType,
  readNumberingProperty,
} from "../../core/unocore/unosett-properties";

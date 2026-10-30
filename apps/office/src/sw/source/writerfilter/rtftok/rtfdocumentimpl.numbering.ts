/** @fileoverview Native list-level character materialization through ListsManager/ListDef, StyleSheetTable and typed SwXNumberingRules. */
import type { RtfDocumentImplContext } from "./rtfdocumentimpl.context";
import {
  ListLevel,
  ResolveListLevelCharacters,
  CreateListLevelCharacterProperties,
} from "../dmapper/NumberingManager";
import { RTFReferenceProperties } from "./rtfreferenceproperties";
import { RTFSprms } from "./rtfsprm";
import { SwNumRule } from "../../core/doc/number";
import type { SwDoc } from "../../core/doc/doc";
import { SwXNumberingRules } from "../../core/unocore/unosett";
import {
  NumberingPropertySequence,
  numberingSequenceType,
} from "../../core/unocore/unosett-properties";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import type { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
/** Native concrete-list traversal creates level styles once, including levels not yet used by a paragraph. @param this - Actual reader. @returns Nothing. */
export function PrepareListLevelCharacters(this: RtfDocumentImplContext): void {
  for (const [override, id] of this["listOverrides"]) {
    const properties: PropertyValue[][] = [];
    this["m_aListLevelProperties"].set(override, properties);
    for (const source of this["listFormats"].get(id) ?? []) {
      const level = new ListLevel(),
        empty = new RTFSprms(),
        reference = new RTFReferenceProperties(empty, source.tableSprms);
      try {
        ResolveListLevelCharacters(this["Mapper"](), level, reference);
        properties.push(CreateListLevelCharacterProperties(this["Mapper"](), level));
      } finally {
        reference.dispose();
        empty.dispose();
        level.dispose();
      }
    }
  }
}
/** Actual native rule copy, typed sequence setter and level commit preserve style registration; no flattened browser record substitutes for CharStyleName. @param doc - Destination. @param rule - Actual rule. @param level - Level index. @param properties - Borrowed generated values. @returns Nothing. */
export function ApplyListLevelCharacters(
  doc: SwDoc,
  rule: SwNumRule,
  level: number,
  properties: readonly PropertyValue[],
): void {
  const copy = new SwNumRule(rule),
    service = new SwXNumberingRules(copy, doc),
    sequence = new NumberingPropertySequence(
      {
        get: /** Native vector addresses use generated48-byte element stride. @param offset - Logical address. @returns Borrowed generated value. */ (
          offset: number,
        ) => properties[offset / 48],
      },
      properties.length,
    );
  try {
    const value = new Any(sequence.getAddress(), numberingSequenceType);
    try {
      service.replaceByIndex(level, value);
      rule.Set(level, service.GetNumRule().Get(level));
    } finally {
      value.dispose();
    }
  } finally {
    sequence.dispose();
    service.release();
    copy.Dispose();
  }
}

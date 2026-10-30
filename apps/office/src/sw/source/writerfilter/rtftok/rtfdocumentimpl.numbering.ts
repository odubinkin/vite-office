/** @fileoverview Native list-level materialization through ListsManager/ListDef, actual NumberingStyles and typed SwXNumberingRules. */
import type { RtfDocumentImplContext } from "./rtfdocumentimpl.context";
import {
  ListLevel,
  ResolveListLevelCharacters,
  CreateListLevelCharacterProperties,
} from "../dmapper/NumberingManager";
import { RTFReferenceProperties } from "./rtfreferenceproperties";
import { RTFSprms } from "./rtfsprm";
import { SwXNumberingRules } from "../../core/unocore/unosett";
import {
  NumberingPropertySequence,
  numberingSequenceType,
} from "../../core/unocore/unosett-properties";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import type { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
/** Native concrete-list traversal creates level styles once, including levels not yet used by a paragraph. @param this - Actual reader. @returns Nothing. */
export function PrepareListNumbering(this: RtfDocumentImplContext): void {
  for (const [override, id] of this["listOverrides"]) {
    const model = this["Mapper"]().model,
      familyName = unicode("NumberingStyles"),
      family = model.getStyleFamilies().getByName(familyName);
    familyName.dispose();
    let name = `WWNum${override}`;
    for (;;) {
      const candidate = unicode(name);
      try {
        if (!family.hasByName(candidate)) break;
      } finally {
        candidate.dispose();
      }
      name += "a";
    }
    const descriptor = model.createNumberingStyle(),
      nativeName = unicode(name);
    try {
      family.insertStyleByName(nativeName, descriptor);
    } finally {
      nativeName.dispose();
    }
    this["m_aListRuleNames"].set(override, name);
    const rulesName = unicode("NumberingRules"),
      rulesAny = descriptor.getPropertyValue(rulesName),
      reference = new Reference(rulesAny, UNO_QUERY, indexReplaceType),
      service = reference.get();
    try {
      if (!(service instanceof SwXNumberingRules))
        throw new Error("Expected native numbering rules");
      try {
        for (const [index, source] of (this["listFormats"].get(id) ?? []).entries()) {
          const level = new ListLevel(),
            empty = new RTFSprms(),
            properties = new RTFReferenceProperties(empty, source.tableSprms);
          try {
            ResolveListLevelCharacters(this["Mapper"](), level, properties);
            const values = CreateListLevelCharacterProperties(this["Mapper"](), level);
            try {
              ApplyListLevelProperties(service, index, values);
            } finally {
              for (const value of values) {
                value.Name.dispose();
                value.Value.dispose();
              }
            }
          } finally {
            properties.dispose();
            empty.dispose();
            level.dispose();
          }
        }
        descriptor.setPropertyValue(rulesName, rulesAny);
      } finally {
        service.GetNumRule().Dispose();
      }
    } finally {
      reference.dispose();
      rulesAny.dispose();
      rulesName.dispose();
    }
  }
}
/** Original typed level replacement operates on the style's actual numbering-service copy; the style setter commits it once after all levels. @param service - Native rule service. @param level - Level index. @param properties - Borrowed generated values. @returns Nothing. */
export function ApplyListLevelProperties(
  service: SwXNumberingRules,
  level: number,
  properties: readonly PropertyValue[],
): void {
  const sequence = new NumberingPropertySequence(
    {
      /** Native generated PropertyValue stride. @param offset - Logical element address. @returns Borrowed property. */
      get: (offset: number) => properties[offset / 48],
    },
    properties.length,
  );
  try {
    const value = new Any(sequence.getAddress(), numberingSequenceType);
    try {
      service.replaceByIndex(level, value);
    } finally {
      value.dispose();
    }
  } finally {
    sequence.dispose();
  }
}
import { unicode } from "../../core/unocore/unocrsrhelper";
import { Reference, UNO_QUERY } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import { cppu_detail_getUnoType as indexReplaceType } from "../../../../cppu/inc/com/sun/star/container/XIndexReplace";

/** @fileoverview Browser persistence codec for the canonical Writer document graph. */

import type { SfxPoolItemSnapshot } from "../../../svl/source/items/poolitem";
import { SwDoc } from "../../source/core/doc/doc";
import {
  isWriterParagraphStyle,
  SwTextFormatColl,
  type WriterParagraphStyle,
} from "../../source/core/doc/fmtcol";
import { SwNumFormat, SwNumRule } from "../../source/core/doc/number";
import type { WriterParagraphStyleGroup } from "../../inc/poolfmt";
import type { WriterParagraphListKind } from "../../source/core/doc/list";
import type { WriterTextRun } from "../../source/core/txtnode/ndtxt";
import { decodeSfxItemSet, encodeSfxItemSet } from "./item-codec";

/** Primitive persistence record for one numbering level. */
interface WriterNumberFormatRecord {
  readonly bulletChar?: string;
  readonly kind: Exclude<WriterParagraphListKind, "none">;
}

/** Primitive persistence record for one document numbering rule. */
interface WriterNumberRuleRecord {
  readonly automatic: boolean;
  readonly formats: readonly WriterNumberFormatRecord[];
  readonly listId: string;
  readonly name: string;
}

/** Primitive persistence record for one paragraph-style collection. */
interface WriterStyleRecord {
  readonly followId: WriterParagraphStyle;
  readonly group: WriterParagraphStyleGroup;
  readonly id: WriterParagraphStyle;
  readonly items: readonly SfxPoolItemSnapshot[];
  readonly name: string;
  readonly parentId?: WriterParagraphStyle;
  readonly poolId: number;
}

/** Primitive persistence record for one ordered text node. */
interface WriterTextNodeRecord {
  readonly autoAttributes: readonly SfxPoolItemSnapshot[];
  readonly formatCollId: WriterParagraphStyle;
  readonly runs: readonly WriterTextRun[];
}

/** Current graph transport. Paragraph identity is array order, never a stored UI key. */
export interface WriterDocumentRecord {
  readonly numRules: readonly WriterNumberRuleRecord[];
  readonly swModelVersion: 8;
  readonly textFormatCollections: readonly WriterStyleRecord[];
  readonly textNodes: readonly WriterTextNodeRecord[];
}

/** Encodes the model at the browser boundary. @param document - Canonical graph. @returns Current record. */
export function encodeWriterDocument(document: SwDoc): WriterDocumentRecord {
  return {
    numRules: document.GetNumRuleTable().map(
      /** Encodes one document rule. @param rule - Model rule. @returns Primitive rule record. */ (
        rule,
      ) => ({
        automatic: rule.IsAutoRule(),
        formats: Array.from(
          { length: 10 },
          /** Encodes one rule level. @param _unused - Array placeholder. @param level - Numbering level. @returns Primitive level record. */ (
            _,
            level,
          ) => {
            const format = rule.GetNumFormat(level);
            return {
              ...(format.GetKind() === "bullet" ? { bulletChar: format.GetBulletChar() } : {}),
              kind: format.GetKind(),
            };
          },
        ),
        listId: rule.GetDefaultListId(),
        name: rule.GetName(),
      }),
    ),
    swModelVersion: 8,
    textFormatCollections: document.GetTextFormatColls().map(
      /** Encodes one paragraph collection. @param collection - Model collection. @returns Primitive style record. */ (
        collection,
      ) => {
        const parent = collection.DerivedFrom();
        return {
          followId: collection.GetNextTextFormatColl().id,
          group: collection.group,
          id: collection.id,
          items: encodeSfxItemSet(collection.GetAttrSet()),
          name: collection.GetName(),
          ...(parent instanceof SwTextFormatColl ? { parentId: parent.id } : {}),
          poolId: collection.poolId,
        };
      },
    ),
    textNodes: document.paragraphs.map(
      /** Encodes one ordered text node. @param node - Canonical node. @returns Primitive node record. */ (
        node,
      ) => {
        const direct = node.GetpSwAttrSet();
        return {
          autoAttributes: direct === undefined ? [] : encodeSfxItemSet(direct),
          formatCollId: node.GetTextFormatColl().id,
          runs: node.runs,
        };
      },
    ),
  };
}

/** Decodes only the current schema; legacy records are intentionally unsupported. @param candidate - Stored value. @returns Canonical graph. */
export function decodeWriterDocument(candidate: unknown): SwDoc {
  if (
    !isRecord(candidate) ||
    candidate.swModelVersion !== 8 ||
    !Array.isArray(candidate.numRules) ||
    !Array.isArray(candidate.textFormatCollections) ||
    !Array.isArray(candidate.textNodes)
  )
    throw new Error("Stored Writer document schema is unsupported.");
  const record = candidate as unknown as WriterDocumentRecord;
  const document = new SwDoc(false);
  for (const style of record.textFormatCollections) {
    if (!isWriterParagraphStyle(style.id)) throw new Error("Stored Writer style is invalid.");
    const collection = document.GetTextFormatColl(style.id);
    collection.SetFormatName(style.name);
    collection.ResetAllFormatAttr();
    decodeSfxItemSet(collection.GetAttrSet(), style.items);
  }
  for (const style of record.textFormatCollections) {
    const collection = document.GetTextFormatColl(style.id);
    collection.SetNextTextFormatColl(document.GetTextFormatColl(style.followId));
    collection.SetDerivedFrom(
      style.parentId === undefined ? undefined : document.GetTextFormatColl(style.parentId),
    );
  }
  for (const rule of record.numRules)
    document.AddNumRule(
      new SwNumRule(
        rule.name,
        rule.formats.map(
          /** Decodes one numbering level. @param format - Primitive format record. @returns Model format. */ (
            format,
          ) => new SwNumFormat(format.kind, format.bulletChar),
        ),
        rule.listId,
        rule.automatic,
      ),
    );
  for (const [index, nodeRecord] of record.textNodes.entries()) {
    if (!isWriterParagraphStyle(nodeRecord.formatCollId))
      throw new Error("Stored Writer paragraph style is invalid.");
    const node = document.nodes.MakeTextNode(`writer-paragraph-${index + 1}`);
    node.ChgFormatColl(document.GetTextFormatColl(nodeRecord.formatCollId));
    for (const item of nodeRecord.autoAttributes)
      node.SetAttr(document.GetAttrPool().CreateItem(item));
    document.GetDocumentListsManager().RegisterListItem(node);
    node.ReplaceRange(0, 0, nodeRecord.runs);
  }
  if (document.paragraphs.length === 0)
    throw new Error("Stored Writer document has no body text node.");
  return document;
}

/** Checks for a non-array object. @param value - Candidate. @returns Whether a record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

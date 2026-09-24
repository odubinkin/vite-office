/** @fileoverview Internal canonical Writer graph codec used behind boundary-specific envelopes. */

import type { SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwPosition } from "../../../source/core/crsr/pam";
import { SwDoc } from "../../../source/core/doc/doc";
import { SwLineNumberInfo, type SwLineNumberInfoValue } from "../../../inc/lineinfo";
import type { DefaultFontDevice } from "../../../source/core/doc/default-font";
import {
  isWriterParagraphStyle,
  SwTextFormatColl,
  type WriterParagraphStyle,
} from "../../../source/core/doc/fmtcol";
import { SwNumFormat, SwNumRule } from "../../../source/core/doc/number";
import type { WriterParagraphStyleGroup } from "../../../inc/poolfmt";
import type { WriterParagraphListKind } from "../../../source/core/doc/list";
import { WRITER_CHARACTER_WHICH_RANGES } from "../../../inc/hintids";
import { SwpHints } from "../../../source/core/txtnode/ndhints";
import { SwFormatINetFormat } from "../../../source/core/txtnode/fmtinfmt";
import { SwFormatAutoFormat, SwTextAttr } from "../../../source/core/txtnode/txatbase";
import type { WriterPageDescriptorValue } from "../../../source/core/layout/pagedesc";
import type { DocumentSettingId } from "../../../source/core/doc/DocumentSettingManager";
import { decodeSfxItemSet, encodeSfxItemSet } from "./item-codec";

/** Primitive graph record for one numbering level. */
interface WriterNumberFormatRecord {
  readonly bulletFont: string;
  readonly bulletChar?: string;
  readonly firstLineIndent: number;
  readonly indentAt: number;
  readonly includeUpperLevels: number;
  readonly kind: Exclude<WriterParagraphListKind, "none">;
  readonly labelFollowedBy: "listtab" | "nothing" | "space";
  readonly listTabPosition: number;
  readonly positionAndSpaceMode: "label-alignment";
  readonly prefix: string;
  readonly start: number;
  readonly suffix: string;
}

/** Primitive graph record for one document numbering rule. */
interface WriterNumberRuleRecord {
  readonly automatic: boolean;
  readonly formats: readonly WriterNumberFormatRecord[];
  readonly listId: string;
  readonly name: string;
}

/** Primitive graph record for one paragraph-style collection. */
interface WriterStyleRecord {
  readonly followId: WriterParagraphStyle;
  readonly group: WriterParagraphStyleGroup;
  readonly id: WriterParagraphStyle;
  readonly items: readonly SfxPoolItemSnapshot[];
  readonly name: string;
  readonly parentId?: WriterParagraphStyle;
  readonly poolId: number;
}

/** Primitive graph record for one ordered text node. */
interface WriterTextNodeRecord {
  readonly autoAttributes: readonly SfxPoolItemSnapshot[];
  readonly formatCollId: WriterParagraphStyle;
  readonly hints: readonly WriterTextHintRecord[];
  readonly listGeometryWins?: boolean;
  readonly text: string;
}

/** Canonical ranged Writer attribute record; browser run projections never cross a boundary. */
type WriterTextHintRecord =
  | Readonly<{
      end: number;
      items: readonly SfxPoolItemSnapshot[];
      kind: "auto-format";
      start: number;
    }>
  | Readonly<{
      end: number;
      hyperlink: ReturnType<SwFormatINetFormat["GetHyperlink"]>;
      kind: "hyperlink";
      start: number;
    }>;

/** Internal graph record. Paragraph identity is array order, never a stored UI key. */
export interface WriterDocumentRecord {
  readonly documentSettings: Readonly<Record<DocumentSettingId, boolean>>;
  readonly lineNumberInfo?: SwLineNumberInfoValue;
  readonly locale: string;
  readonly numRules: readonly WriterNumberRuleRecord[];
  readonly pageDescriptors: readonly Readonly<{
    followName: string;
    value: WriterPageDescriptorValue;
  }>[];
  readonly swModelVersion: 15;
  readonly textFormatCollections: readonly WriterStyleRecord[];
  readonly textNodes: readonly WriterTextNodeRecord[];
}

/** Encodes the model at the browser boundary. @param document - Canonical graph. @returns Current record. */
export function encodeWriterDocument(document: SwDoc): WriterDocumentRecord {
  return {
    documentSettings: document.GetDocumentSettingManager().GetValues(),
    lineNumberInfo: document.GetLineNumberInfo().QueryValue(),
    locale: document.GetLocale(),
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
              bulletFont: format.GetBulletFont(),
              ...(format.GetKind() === "bullet" ? { bulletChar: format.GetBulletChar() } : {}),
              firstLineIndent: format.GetFirstLineIndent(),
              indentAt: format.GetIndentAt(),
              includeUpperLevels: format.GetIncludeUpperLevels(),
              kind: format.GetKind(),
              labelFollowedBy: format.GetLabelFollowedBy(),
              listTabPosition: format.GetListtabPos(),
              positionAndSpaceMode: format.GetPositionAndSpaceMode(),
              prefix: format.GetPrefix(),
              start: format.GetStart(),
              suffix: format.GetSuffix(),
            };
          },
        ),
        listId: rule.GetDefaultListId(),
        name: rule.GetName(),
      }),
    ),
    pageDescriptors: Array.from(
      { length: document.GetPageDescCnt() },
      /** Encodes one stable descriptor identity and its follow link. @param _unused - Array placeholder. @param index - Collection position. @returns Descriptor record. */ (
        _,
        index,
      ) => {
        const descriptor = document.GetPageDesc(index);
        return {
          followName: descriptor.GetFollow().GetName(),
          value: descriptor.GetValue(),
        };
      },
    ),
    swModelVersion: 15,
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
          ...(node.DoesListGeometryWin() ? { listGeometryWins: true } : {}),
          hints:
            node
              .GetpSwpHints()
              ?.entries()
              .map(
                /** Encodes one canonical ranged text attribute. @param hint - Writer hint. @returns Primitive hint record. */ (
                  hint,
                ): WriterTextHintRecord =>
                  hint.format instanceof SwFormatAutoFormat
                    ? {
                        end: hint.end,
                        items: encodeSfxItemSet(hint.format.GetStyleHandle()),
                        kind: "auto-format",
                        start: hint.start,
                      }
                    : {
                        end: hint.end,
                        hyperlink: hint.format.GetHyperlink(),
                        kind: "hyperlink",
                        start: hint.start,
                      },
              ) ?? [],
          text: node.GetText(),
        };
      },
    ),
  };
}

/** Decodes only the current schema; legacy records are intentionally unsupported. @param candidate - Stored value. @param defaultFontDevice - Current output device. @returns Canonical graph. */
export function decodeWriterDocument(
  candidate: unknown,
  defaultFontDevice?: DefaultFontDevice,
): SwDoc {
  if (
    !isRecord(candidate) ||
    candidate.swModelVersion !== 15 ||
    !isRecord(candidate.documentSettings) ||
    typeof candidate.locale !== "string" ||
    candidate.locale.length === 0 ||
    !Array.isArray(candidate.numRules) ||
    !Array.isArray(candidate.pageDescriptors) ||
    candidate.pageDescriptors.length === 0 ||
    !Array.isArray(candidate.textFormatCollections) ||
    !Array.isArray(candidate.textNodes)
  )
    throw new Error("Stored Writer document schema is unsupported.");
  const record = candidate as unknown as WriterDocumentRecord;
  const document = new SwDoc({
    createInitialTextNode: false,
    ...(defaultFontDevice === undefined ? {} : { defaultFontDevice }),
    locale: record.locale,
  });
  if (record.lineNumberInfo !== undefined)
    document.SetLineNumberInfo(SwLineNumberInfo.FromValue(record.lineNumberInfo));
  const firstPageDescriptor = record.pageDescriptors[0];
  if (
    firstPageDescriptor === undefined ||
    !isRecord(firstPageDescriptor) ||
    !isRecord(firstPageDescriptor.value) ||
    typeof firstPageDescriptor.followName !== "string" ||
    firstPageDescriptor.value.name !== "Standard"
  )
    throw new Error("Stored Writer page descriptor collection is invalid.");
  document.ChgPageDesc(firstPageDescriptor.value);
  for (const descriptorRecord of record.pageDescriptors.slice(1)) {
    if (
      !isRecord(descriptorRecord) ||
      !isRecord(descriptorRecord.value) ||
      typeof descriptorRecord.followName !== "string"
    )
      throw new Error("Stored Writer page descriptor collection is invalid.");
    document.MakePageDesc(descriptorRecord.value.name);
    document.ChgPageDesc(descriptorRecord.value, descriptorRecord.value.name);
  }
  for (const descriptorRecord of record.pageDescriptors) {
    const descriptor = document.FindPageDesc(descriptorRecord.value.name);
    const follow = document.FindPageDesc(descriptorRecord.followName);
    if (descriptor === undefined || follow === undefined)
      throw new Error("Stored Writer page descriptor follow link is invalid.");
    descriptor.SetFollow(follow);
  }
  document.GetDocumentSettingManager().SetValues(record.documentSettings);
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
          ) =>
            new SwNumFormat(format.kind, format.bulletChar, {
              bulletFont: format.bulletFont,
              firstLineIndent: format.firstLineIndent,
              indentAt: format.indentAt,
              includeUpperLevels: format.includeUpperLevels,
              labelFollowedBy: format.labelFollowedBy,
              listTabPosition: format.listTabPosition,
              positionAndSpaceMode: format.positionAndSpaceMode,
              prefix: format.prefix,
              start: format.start,
              suffix: format.suffix,
            }),
        ),
        rule.listId,
        rule.automatic,
      ),
    );
  for (const nodeRecord of record.textNodes) {
    if (!isWriterParagraphStyle(nodeRecord.formatCollId))
      throw new Error("Stored Writer paragraph style is invalid.");
    const node = document.nodes.MakeTextNode();
    node.ChgFormatColl(document.GetTextFormatColl(nodeRecord.formatCollId));
    node.SetListGeometryWins(nodeRecord.listGeometryWins === true);
    for (const item of nodeRecord.autoAttributes)
      node.SetAttr(document.GetAttrPool().CreateItem(item));
    const hints = nodeRecord.hints.map(
      /** Restores one canonical text attribute. @param hint - Primitive hint record. @returns Writer hint. */ (
        hint,
      ) => {
        if (hint.kind === "hyperlink")
          return new SwTextAttr(new SwFormatINetFormat(hint.hyperlink), hint.start, hint.end);
        const items = new SfxItemSet(document.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
        decodeSfxItemSet(items, hint.items);
        return new SwTextAttr(new SwFormatAutoFormat(items), hint.start, hint.end);
      },
    );
    const position = new SwPosition(node, 0, "redline");
    try {
      document.GetDocumentContentOperationsManager().InsertTextFragment(position, {
        hints: new SwpHints(document.GetAttrPool(), hints),
        text: nodeRecord.text,
      });
    } finally {
      position.Dispose();
    }
    document.GetDocumentListsManager().RegisterListItem(node);
  }
  if (document.paragraphs.length === 0)
    throw new Error("Stored Writer document has no body text node.");
  return document;
}

/** Checks for a non-array object. @param value - Candidate. @returns Whether a record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

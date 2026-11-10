/** @fileoverview Internal canonical Writer graph codec used behind boundary-specific envelopes. */
import {
  encodeCharacterStyles,
  restoreCharacterStyles,
  decodeCharacterStyleReference,
  type WriterCharacterStyleRecord,
} from "./writer-character-style-codec";
import { encodeNumberFormat, type WriterNumberFormatRecord } from "./writer-number-format-codec";
import { upgradeWriterWhichIds } from "./writer-which-id-migration";
import { runCooperatively, runSynchronously } from "../../../../framework/browser/io/cooperative";
import {
  encodePageFormats,
  restorePageFormats,
  encodeTextGridDefault,
  restoreTextGridDefault,
  type WriterPageFormatRecord,
} from "./writer-page-format-codec";
import { createWriterNumFormat, SwNumRule, SwNumRuleType } from "../../../source/core/doc/number";
import { restoreFontMetadata } from "../../../../vcl/browser/font-metadata-codec";
import { Font } from "../../../../vcl/source/font/font";
import type { SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import { SwLineNumberInfo, type SwLineNumberInfoValue } from "../../../inc/lineinfo";
import type { DefaultFontDevice } from "../../../source/core/doc/default-font";
import {
  isWriterParagraphStyle,
  SwTextFormatColl,
  type WriterParagraphStyle,
} from "../../../source/core/doc/fmtcol";
import type { WriterParagraphStyleGroup } from "../../../inc/poolfmt";
import { RES_PARATR_OUTLINELEVEL } from "../../../inc/hintids";
import { SwTableNode } from "../../../source/core/docnode/node";
import type { SwTextNode } from "../../../source/core/txtnode/ndtxt";
import { SwDoc, type WriterEmbeddedFont } from "../../../source/core/doc/doc";
import {
  sectionTextNodes,
  encodeTextNode,
  decodeTextNode,
  encodeWriterTableSteps,
  decodeWriterTableSteps,
  type WriterTableRecord,
  type WriterTextNodeRecord,
} from "./writer-document-content-codec";
import {
  encodeTextFrames,
  decodeTextFrames,
  type WriterTextFrameRecord,
} from "./writer-text-frame-codec";
import type { WriterPageDescriptorValue } from "../../../source/core/layout/pagedesc";
import {
  getDefaultDocumentSettings,
  type DocumentSettingId,
} from "../../../source/core/doc/DocumentSettingManager";
import { decodeSfxItemSet, encodeSfxItemSet } from "./item-codec";

/** Native scalar rule state transported independently of copy-constructor policy. */
interface WriterNumberRuleScalarState {
  readonly continusNum: boolean;
  readonly absSpaces: boolean;
  readonly hidden: boolean;
  readonly countPhantoms: boolean;
  readonly usedByRedline: boolean;
  readonly poolFormatId: number;
  readonly poolHelpId: number;
  readonly poolHlpFileId: number;
}

/** Primitive graph record for one document numbering rule. */
interface WriterNumberRuleRecord {
  readonly scalarState?: WriterNumberRuleScalarState;
  readonly ruleType?: SwNumRuleType;
  readonly ownedLevels?: readonly boolean[];
  readonly defaultPositionAndSpaceMode?: "label-alignment" | "label-width-and-position";
  readonly automatic: boolean;
  readonly formats: readonly WriterNumberFormatRecord[];
  readonly listId: string;
  readonly name: string;
}

/** Primitive graph record for one paragraph-style collection. */
interface WriterStyleRecord {
  /** Actual collection assignment, distinct from its direct outline-level item; absent only in legacy graph v16 records. */
  readonly outlineAssignment?: boolean;
  readonly followId: WriterParagraphStyle;
  readonly group: WriterParagraphStyleGroup;
  readonly id: WriterParagraphStyle;
  readonly items: readonly SfxPoolItemSnapshot[];
  readonly name: string;
  readonly parentId?: WriterParagraphStyle;
  readonly poolId: number;
}

/** Internal graph record. Paragraph identity is array order, never a stored UI key. */
export interface WriterDocumentRecord {
  readonly bodyOrder?: readonly ("text" | "table")[];
  readonly tables?: readonly WriterTableRecord[];
  readonly textFrames?: readonly WriterTextFrameRecord[];
  readonly bookmarks?: readonly Readonly<{ name: string; nodeIndex: number; offset: number }>[];
  readonly embeddedFonts?: readonly WriterEmbeddedFont[];
  readonly documentSettings: Readonly<Record<DocumentSettingId, boolean>>;
  readonly lineNumberInfo?: SwLineNumberInfoValue;
  readonly locale: string;
  readonly numRules: readonly WriterNumberRuleRecord[];
  /** Actual document outline pointer expressed as an index; legacy graphs have no precreated outline owner. */
  readonly outlineRuleIndex?: number;
  readonly characterFormats?: readonly WriterCharacterStyleRecord[];
  readonly pageDescriptors: readonly Readonly<{
    followName: string;
    value: WriterPageDescriptorValue;
    pageFormat?: WriterPageFormatRecord;
  }>[];
  readonly textGridDefault?: SfxPoolItemSnapshot;
  readonly swModelVersion: 17;
  readonly textFormatCollections: readonly WriterStyleRecord[];
  readonly textNodes: readonly WriterTextNodeRecord[];
}

/** Encodes the model at the browser boundary. @param document - Canonical graph. @returns Current record. */
export function* encodeWriterDocumentSteps(document: SwDoc): Generator<void, WriterDocumentRecord> {
  const textNodes: WriterTextNodeRecord[] = [];
  const tables: WriterTableRecord[] = [];
  for (const node of document.paragraphs) {
    textNodes.push(encodeTextNode(document, node));
    yield;
  }
  for (const table of document.GetTables())
    tables.push(yield* encodeWriterTableSteps(document, table));
  const textOwners = sectionTextNodes(document.nodes.getBodyContent());
  const textFrames = yield* encodeTextFrames(document, textOwners);
  const textGridDefault = encodeTextGridDefault(document);
  return {
    ...(textFrames.length ? { textFrames } : {}),
    embeddedFonts: document.GetEmbeddedFonts(),
    bookmarks: document
      .GetIDocumentMarkAccess()
      .GetBookmarks()
      .map(
        /** Encodes one live collapsed Writer mark. @param mark - Mark. @returns Primitive position. */
        (mark) => ({
          name: mark.GetName(),
          nodeIndex: textOwners.indexOf(mark.GetMarkPos().GetNode() as SwTextNode),
          offset: mark.GetMarkPos().GetContentIndex(),
        }),
      ),
    documentSettings: document.GetDocumentSettingManager().GetValues(),
    lineNumberInfo: document.GetLineNumberInfo().QueryValue(),
    locale: document.GetLocale(),
    characterFormats: encodeCharacterStyles(document),
    outlineRuleIndex: document.GetNumRuleTable().indexOf(document.GetOutlineNumRule()),
    numRules: document.GetNumRuleTable().map(
      /** Encodes one document rule. @param rule - Model rule. @returns Primitive rule record. */ (
        rule,
      ) => ({
        scalarState: {
          continusNum: rule.IsContinusNum(),
          absSpaces: rule.IsAbsSpaces(),
          hidden: rule.IsHidden(),
          countPhantoms: rule.IsCountPhantoms(),
          usedByRedline: rule.IsUsedByRedline(),
          poolFormatId: rule.GetPoolFormatId(),
          poolHelpId: rule.GetPoolHelpId(),
          poolHlpFileId: rule.GetPoolHlpFileId(),
        },
        automatic: rule.IsAutoRule(),
        defaultPositionAndSpaceMode: rule.GetDefaultNumberFormatPositionAndSpaceMode(),
        ownedLevels: Array.from(
          { length: 10 },
          /** Retains native optional level ownership. @param _unused - Placeholder. @param level - Level. @returns Presence. */
          (_unused, level) => rule.GetNumFormat(level) !== undefined,
        ),
        ...(rule.GetRuleType() === SwNumRuleType.NUM_RULE ? {} : { ruleType: rule.GetRuleType() }),
        formats: Array.from(
          { length: 10 },
          /** Encodes one rule level. @param _unused - Array placeholder. @param level - Numbering level. @returns Primitive level record. */ (
            _,
            level,
          ) => {
            return encodeNumberFormat(document, rule.Get(level));
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
          pageFormat: encodePageFormats(descriptor),
        };
      },
    ),
    swModelVersion: 17,
    ...(textGridDefault === undefined ? {} : { textGridDefault }),
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
          outlineAssignment: collection.IsAssignedToListLevelOfOutlineStyle(),
          name: collection.GetName(),
          ...(parent instanceof SwTextFormatColl ? { parentId: parent.id } : {}),
          poolId: collection.poolId,
        };
      },
    ),
    bodyOrder: document.nodes
      .getBodyContent()
      .map(
        /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
          node,
        ) => (node instanceof SwTableNode ? "table" : "text"),
      ),
    tables,
    textNodes,
  };
}

/** Decodes current records and explicitly migrates the former incorrect v16 WhichIds. @param input - Stored value. @param defaultFontDevice - Current output device. @returns Canonical graph. */
export function* decodeWriterDocumentSteps(
  input: unknown,
  defaultFontDevice?: DefaultFontDevice,
): Generator<void, SwDoc> {
  const candidate = upgradeWriterWhichIds(input);
  if (
    !isRecord(candidate) ||
    candidate.swModelVersion !== 17 ||
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
  let complete = false;
  try {
    for (const font of record.embeddedFonts ?? []) {
      if (
        typeof font.path !== "string" ||
        typeof font.faceName !== "string" ||
        typeof font.familyName !== "string" ||
        typeof font.format !== "string" ||
        (font.bytes !== undefined && !(font.bytes instanceof Uint8Array))
      )
        throw new Error("Stored Writer embedded font is invalid.");
      document.RegisterEmbeddedFont(font);
      if (font.bytes !== undefined)
        document.SetEmbeddedFontBytes(font.path, font.bytes, font.canLoad === true);
    }
    if (record.lineNumberInfo !== undefined)
      document.SetLineNumberInfo(SwLineNumberInfo.FromValue(record.lineNumberInfo));
    restoreTextGridDefault(document, record.textGridDefault);
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
      restorePageFormats(descriptor, descriptorRecord.pageFormat);
    }
    const settings = { ...record.documentSettings };
    // Older browser graph records predate this represented native setting.
    // All prior fields retain the strict current-schema validation contract.
    if (!Object.hasOwn(settings, "DO_NOT_RESET_PARA_ATTRS_FOR_NUM_FONT"))
      settings.DO_NOT_RESET_PARA_ATTRS_FOR_NUM_FONT =
        getDefaultDocumentSettings().DO_NOT_RESET_PARA_ATTRS_FOR_NUM_FONT;
    document.GetDocumentSettingManager().SetValues(settings);
    restoreCharacterStyles(document, record.characterFormats);
    if (record.textFormatCollections[0]?.id !== "default")
      throw new Error("Stored Writer style is invalid.");
    for (const style of record.textFormatCollections) {
      if (typeof style.id !== "string" || style.id.length === 0)
        throw new Error("Stored Writer style is invalid.");
      if (!isWriterParagraphStyle(style.id))
        document.MakeTextFormatColl(style.name, undefined, style.id);
    }
    if (
      record.outlineRuleIndex !== undefined &&
      (!Number.isInteger(record.outlineRuleIndex) ||
        record.outlineRuleIndex < 0 ||
        record.outlineRuleIndex >= record.numRules.length)
    )
      throw new Error("Stored Writer outline owner index is invalid.");
    for (const [ruleIndex, rule] of record.numRules.entries()) {
      if (
        rule.ruleType !== undefined &&
        rule.ruleType !== SwNumRuleType.NUM_RULE &&
        rule.ruleType !== SwNumRuleType.OUTLINE_RULE
      )
        throw new Error("Stored Writer numbering rule type is invalid.");
      if (
        rule.formats.length !== 10 ||
        (rule.ownedLevels !== undefined &&
          (rule.ownedLevels.length !== 10 ||
            rule.ownedLevels.some(
              /** Rejects malformed presence bits. @param owned - Candidate. @returns Invalidity. */
              (owned) => typeof owned !== "boolean",
            )))
      )
        throw new Error("Stored Writer numbering ownership is invalid.");
      const mode = rule.defaultPositionAndSpaceMode ?? "label-alignment";
      if (mode !== "label-alignment" && mode !== "label-width-and-position")
        throw new Error("Stored Writer numbering default mode is invalid.");
      const restoredRule = new SwNumRule(rule.name, mode, rule.ruleType ?? SwNumRuleType.NUM_RULE);
      restoredRule.SetDefaultListId(rule.listId);
      restoredRule.SetAutoRule(rule.automatic);
      for (let level = 0; level < 10; level++) {
        const format = rule.formats[level] as WriterNumberFormatRecord;
        if (
          format.numberingType !== undefined &&
          !["arabic", "char-special", "none"].includes(format.numberingType)
        )
          throw new Error("Stored Writer numbering format type is invalid.");
        if (
          (format.bulletFontPresent !== undefined &&
            typeof format.bulletFontPresent !== "boolean") ||
          (format.showSymbol !== undefined && typeof format.showSymbol !== "boolean") ||
          (format.bulletGlyph !== undefined &&
            (!Number.isInteger(format.bulletGlyph) ||
              format.bulletGlyph < 0 ||
              format.bulletGlyph > 0xffffffff))
        )
          throw new Error("Stored Writer numbering marker ownership is invalid.");
        if (
          (format.nativeNumberingType !== undefined &&
            (!Number.isInteger(format.nativeNumberingType) ||
              format.nativeNumberingType < -32768 ||
              format.nativeNumberingType > 32767)) ||
          (format.numAdjust !== undefined &&
            (!Number.isInteger(format.numAdjust) ||
              format.numAdjust < 0 ||
              format.numAdjust > 7)) ||
          (format.isLegal !== undefined && typeof format.isLegal !== "boolean")
        )
          throw new Error("Stored Writer numbering level scalar state is invalid.");
        const metadata = format.bulletFontMetadata;
        if (metadata !== undefined && format.bulletFontPresent !== true)
          throw new Error("Stored Writer numbering font metadata is invalid.");
        const decoded = createWriterNumFormat(format.kind, format.bulletChar, {
          absLSpace: format.absLSpace ?? 0,
          firstLineOffset: format.firstLineOffset ?? 0,
          charTextDistance: format.charTextDistance ?? 0,
          bulletFont: format.bulletFont,
          ...(format.numberingType === undefined ? {} : { numberingType: format.numberingType }),
          firstLineIndent: format.firstLineIndent,
          indentAt: format.indentAt,
          includeUpperLevels: format.includeUpperLevels,
          labelFollowedBy: format.labelFollowedBy,
          listTabPosition: format.listTabPosition,
          positionAndSpaceMode: format.positionAndSpaceMode,
          ...(format.listFormat === undefined ? {} : { listFormat: format.listFormat }),
          prefix: format.prefix,
          start: format.start,
          suffix: format.suffix,
        });
        if (format.nativeNumberingType !== undefined)
          decoded.SetNumberingType(format.nativeNumberingType);
        if (format.numAdjust !== undefined) decoded.SetNumAdjust(format.numAdjust);
        if (format.isLegal !== undefined) decoded.SetIsLegal(format.isLegal);
        decoded.SetCharFormat(decodeCharacterStyleReference(document, format.characterStyle));
        if (format.bulletGlyph !== undefined) decoded.SetBulletChar(format.bulletGlyph);
        if (format.showSymbol !== undefined) decoded.SetShowSymbol(format.showSymbol);
        if (format.bulletFontPresent === true) {
          const font = new Font();
          font.SetFamilyName(format.bulletFont);
          if (metadata !== undefined) restoreFontMetadata(font, metadata);
          decoded.SetBulletFont(font);
        } else if (format.bulletFontPresent === false) decoded.SetBulletFont(undefined);
        if (rule.ownedLevels === undefined || rule.ownedLevels[level])
          restoredRule.Set(level, decoded);
      }
      const owner =
        ruleIndex === record.outlineRuleIndex
          ? document.GetOutlineNumRule().Assign(restoredRule)
          : document.AddNumRule(restoredRule);
      if (owner === document.GetOutlineNumRule()) owner.SetDefaultListId(rule.listId);
      const scalar = rule.scalarState;
      if (scalar !== undefined) {
        if (
          scalar === null ||
          typeof scalar !== "object" ||
          [
            scalar.continusNum,
            scalar.absSpaces,
            scalar.hidden,
            scalar.countPhantoms,
            scalar.usedByRedline,
          ].some(
            /** Rejects malformed native boolean state. @param value - Candidate. @returns Invalidity. */
            (value) => typeof value !== "boolean",
          ) ||
          [scalar.poolFormatId, scalar.poolHelpId, scalar.poolHlpFileId].some(
            /** Enforces native unsigned fields before restoring their narrowed setters. @param value - Candidate. @param index - Field. @returns Invalidity. */
            (value, index) =>
              !Number.isInteger(value) || value < 0 || value > (index === 2 ? 255 : 65535),
          )
        )
          throw new Error("Stored Writer numbering scalar state is invalid.");
        owner.SetContinusNum(scalar.continusNum);
        owner.SetAbsSpaces(scalar.absSpaces);
        owner.SetHidden(scalar.hidden);
        owner.SetCountPhantoms(scalar.countPhantoms);
        owner.SetUsedByRedline(scalar.usedByRedline);
        owner.SetPoolFormatId(scalar.poolFormatId);
        owner.SetPoolHelpId(scalar.poolHelpId);
        owner.SetPoolHlpFileId(scalar.poolHlpFileId);
      }
    }
    for (const style of record.textFormatCollections) {
      const collection = document.GetTextFormatColl(style.id);
      const factoryOutlineLevel = collection.GetAttrOutlineLevel();
      const factoryAssignment = collection.IsAssignedToListLevelOfOutlineStyle();
      if (style.outlineAssignment !== undefined && typeof style.outlineAssignment !== "boolean")
        throw new Error("Stored Writer outline assignment is invalid.");
      if (style.outlineAssignment === false) collection.DeleteAssignmentToListLevelOfOutlineStyle();
      else if (style.outlineAssignment === true && !factoryAssignment)
        collection.AssignToListLevelOfOutlineStyle(0);
      collection.SetFormatName(style.name);
      if (!Number.isInteger(style.poolId) || style.poolId < 0 || style.poolId > 65535)
        throw new Error("Stored Writer paragraph style pool identity is invalid.");
      collection.SetPoolFormatId(style.poolId);
      collection.ResetAllFormatAttr();
      const attributes = collection.GetAttrSet().Clone(false);
      try {
        decodeSfxItemSet(attributes, style.items);
        collection.SetFormatAttrSet(attributes);
      } finally {
        attributes.Dispose();
      }
      if (
        style.outlineAssignment === undefined &&
        factoryAssignment &&
        !style.items.some(
          /** Detects the source-owned outline item already retained by the legacy graph. @param item - Stored item. @returns Whether outline. */
          (item) => item.which === RES_PARATR_OUTLINELEVEL,
        )
      )
        collection.SetAttrOutlineLevel(factoryOutlineLevel);
    }
    for (const style of record.textFormatCollections) {
      const collection = document.GetTextFormatColl(style.id);
      collection.SetNextTextFormatColl(document.GetTextFormatColl(style.followId));
      collection.SetDerivedFrom(
        style.parentId === undefined ? undefined : document.GetTextFormatColl(style.parentId),
      );
    }
    if (record.textNodes.length === 0)
      throw new Error("Stored Writer document has no body text node.");
    const order =
      record.bodyOrder ??
      record.textNodes.map(
        /** Handles the browser table interaction.  @returns Callback result. */ () =>
          "text" as const,
      );
    let textIndex = 0;
    let tableIndex = 0;
    for (const kind of order) {
      if (kind === "text") {
        const nodeRecord = record.textNodes[textIndex++];
        if (nodeRecord === undefined) throw new Error("Stored Writer body order is invalid.");
        decodeTextNode(document, document.nodes.MakeTextNode(), nodeRecord);
        yield;
        continue;
      }
      const tableRecord = record.tables?.[tableIndex++];
      if (tableRecord === undefined) throw new Error("Stored Writer table order is invalid.");
      yield* decodeWriterTableSteps(document, tableRecord);
    }
    if (textIndex !== record.textNodes.length || tableIndex !== (record.tables?.length ?? 0))
      throw new Error("Stored Writer body order is invalid.");
    const textOwners = sectionTextNodes(document.nodes.getBodyContent());
    yield* decodeTextFrames(document, record.textFrames, textOwners);
    if (record.bookmarks !== undefined) {
      if (!Array.isArray(record.bookmarks)) throw new Error("Stored Writer bookmarks are invalid.");
      for (const mark of record.bookmarks) {
        const node = textOwners[mark.nodeIndex];
        if (node === undefined) throw new Error("Stored Writer bookmark position is invalid.");
        document.GetIDocumentMarkAccess().MakeMark(node, mark.offset, mark.name);
      }
    }
    complete = true;
    return document;
  } finally {
    if (!complete) document.Dispose();
  }
}

/** Checks for a non-array object. @param value - Candidate. @returns Whether a record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Encodes canonical graph synchronously for worker/inline callers. @param document - Model. @returns Graph. */
export function encodeWriterDocument(document: SwDoc): WriterDocumentRecord {
  return runSynchronously(encodeWriterDocumentSteps(document));
}
/** Encodes a stable graph while servicing browser tasks. @param document - Model. @param isCancelled - Snapshot guard. @returns Graph. */
export function encodeWriterDocumentAsync(
  document: SwDoc,
  isCancelled: () => boolean,
): Promise<WriterDocumentRecord> {
  return runCooperatively(encodeWriterDocumentSteps(document), isCancelled);
}
/** Restores canonical graph synchronously for worker/inline callers. @param candidate - Record. @param device - Font device. @returns Model. */
export function decodeWriterDocument(candidate: unknown, device?: DefaultFontDevice): SwDoc {
  return runSynchronously(decodeWriterDocumentSteps(candidate, device));
}
/** Restores a candidate in bounded browser tasks before atomic adoption. @param candidate - Record. @param device - Font device. @param isCancelled - Staleness guard. @returns Model. */
export function decodeWriterDocumentAsync(
  candidate: unknown,
  device: DefaultFontDevice | undefined,
  isCancelled: () => boolean,
): Promise<SwDoc> {
  return runCooperatively(decodeWriterDocumentSteps(candidate, device), isCancelled);
}

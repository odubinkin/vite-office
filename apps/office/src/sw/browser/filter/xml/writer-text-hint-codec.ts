/** @fileoverview Transports actual native ranged hint families without flattening named character styles. */
import type { SwDoc } from "../../../source/core/doc/doc";
import { SwFormatAutoFormat, type SwTextAttrEnd } from "../../../source/core/txtnode/txatbase";
import { SwFormatCharFormat, type SwFormatINetFormat } from "../../../source/core/txtnode/fmtatr2";
import { SwTextCharFormat } from "../../../source/core/txtnode/txtatr2";
import { MakeTextAttr } from "../../../source/core/txtnode/thints";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import { WRITER_CHARACTER_WHICH_RANGES } from "../../../inc/hintids";
import {
  encodeCharacterStyleReference,
  decodeCharacterStyleReference,
} from "./writer-character-style-codec";
import {
  encodeSfxItemSet,
  decodeSfxItemSet,
  encodeSwFormatINetFormatRecord,
  decodeSwFormatINetFormatRecord,
  type WriterInternetFormatRecord,
} from "./item-codec";
/** Actual represented native hint families. */
type Hint = SwTextAttrEnd<SwFormatAutoFormat | SwFormatCharFormat | SwFormatINetFormat>;
/** Primitive records retain historical automatic/internet envelopes and add a native character owner. */
export type WriterTextHintRecord = Readonly<{ start: number; end: number }> &
  (
    | Readonly<{ kind: "auto-format"; items: readonly SfxPoolItemSnapshot[] }>
    | Readonly<{ kind: "hyperlink"; hyperlink: WriterInternetFormatRecord }>
    | Readonly<{
        kind: "character-format";
        characterStyle?: number;
        sortNumber: number;
        flags: readonly boolean[];
      }>
  );
/** Encodes one real native attribute. @param doc - Actual model. @param hint - Native owner. @returns Primitive record. */
export function encodeTextHint(doc: SwDoc, hint: Hint): WriterTextHintRecord {
  const range = { start: hint.start, end: hint.end };
  if (hint.format instanceof SwFormatAutoFormat)
    return { ...range, kind: "auto-format", items: encodeSfxItemSet(hint.format.GetStyleHandle()) };
  if (hint.format instanceof SwFormatCharFormat && hint instanceof SwTextCharFormat) {
    const characterStyle = encodeCharacterStyleReference(doc, hint.format.GetCharFormat());
    return {
      ...range,
      kind: "character-format",
      ...(characterStyle === undefined ? {} : { characterStyle }),
      sortNumber: hint.GetSortNumber(),
      flags: [
        hint.DontExpand(),
        hint.IsLockExpandFlag(),
        hint.IsDontMoveAttr(),
        hint.IsPriorityAttr(),
        hint.IsDontExpandStartAttr(),
        hint.IsFormatIgnoreStart(),
        hint.IsFormatIgnoreEnd(),
      ],
    };
  }
  if (hint.format instanceof SwFormatCharFormat)
    throw new Error("Writer character hint has no native text attribute.");
  return { ...range, kind: "hyperlink", hyperlink: encodeSwFormatINetFormatRecord(hint.format) };
}
/** Restores the concrete native owner and actual character-style reference. @param doc - Destination. @param record - Validated primitive record. @returns Native hint. */
export function decodeTextHint(doc: SwDoc, record: WriterTextHintRecord): Hint {
  if (
    !Number.isInteger(record.start) ||
    !Number.isInteger(record.end) ||
    record.start < 0 ||
    record.end < record.start
  )
    throw new Error("Stored Writer text hint range is invalid.");
  if (record.kind === "hyperlink")
    return MakeTextAttr(
      doc,
      decodeSwFormatINetFormatRecord(record.hyperlink),
      record.start,
      record.end,
    );
  if (record.kind === "character-format") {
    if (
      !Number.isInteger(record.sortNumber) ||
      record.sortNumber < 0 ||
      record.sortNumber > 65535 ||
      !Array.isArray(record.flags) ||
      record.flags.length !== 7 ||
      record.flags.some(
        /** Validates primitive native flags. @param flag - Input value. @returns Invalidity. */
        (flag) => typeof flag !== "boolean",
      )
    )
      throw new Error("Stored Writer character hint state is invalid.");
    const hint = new SwTextCharFormat(
      new SwFormatCharFormat(decodeCharacterStyleReference(doc, record.characterStyle)),
      record.start,
      record.end,
    );
    hint.SetSortNumber(record.sortNumber);
    hint.SetDontExpand(record.flags[0] as boolean);
    hint.SetLockExpandFlag(record.flags[1] as boolean);
    hint.dontMoveAttr = record.flags[2] as boolean;
    hint.SetPriorityAttr(record.flags[3] as boolean);
    hint.SetDontExpandStartAttr(record.flags[4] as boolean);
    hint.SetFormatIgnoreStart(record.flags[5] as boolean);
    hint.SetFormatIgnoreEnd(record.flags[6] as boolean);
    return hint;
  }
  if (record.kind !== "auto-format") throw new Error("Stored Writer text hint family is invalid.");
  const items = new SfxItemSet(doc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
  decodeSfxItemSet(items, record.items);
  return MakeTextAttr(doc, items, record.start, record.end);
}

/** @fileoverview Original Word export pool-translation contracts through actual registered SfxItemPool/SfxItemSet and Writer export owners. */
import { assert, expect, it } from "vitest";
import {
  GetSetWhichFromSwDocWhich,
  IsValidSlotWhich,
  TransformWhichBetweenPools,
} from "./writerhelper";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { DocxExport } from "./docxexport";
import { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import { ZipStorage, ZipFragmentStream } from "../../../../oox/source/helper/zipstorage";
import { FastSerializerHelper } from "../../../../sax/inc/fshelper";
import * as W from "../../../inc/hintids";

it.each([
  [0, 1, false],
  [1, 0, false],
  [0, 0, false],
  [7, 7, false],
  [6000, 7, true],
  [65536, 1, false],
  [65543, 7, false],
] as const)(
  "keeps original slot validity %s/%s",
  /** Source zero and identity cases remain distinct. @param slot - Slot. @param which - Which. @param expected - Validity. @returns Nothing. */ (
    slot,
    which,
    expected,
  ) => expect(IsValidSlotWhich(slot, which)).toBe(expected),
);
it("preserves missing destination slot identity and rejects missing source translation", /** Uses real public pool registration instead of replacing lookup methods. @returns Nothing. */ () => {
  const source = new SfxItemPool(),
    destination = new SfxItemPool();
  source.RegisterDefaultItem(new SfxUInt16Item(1, 0), undefined, 6000);
  source.RegisterDefaultItem(new SfxUInt16Item(2, 0));
  destination.RegisterDefaultItem(new SfxUInt16Item(3000, 0), undefined, 6000);
  expect(TransformWhichBetweenPools(destination, source, 1)).toBe(3000);
  expect(TransformWhichBetweenPools(new SfxItemPool(), source, 1)).toBe(6000);
  expect(TransformWhichBetweenPools(destination, source, 2)).toBe(0);
  expect(TransformWhichBetweenPools(destination, source, 0)).toBe(0);
  expect(TransformWhichBetweenPools(destination, source, 65537)).toBe(3000);
});
it("reads real current defaults and alternate-pool font heights without changing either source pool", /** The generic destination pool registers actual font items using the shipped Writer slot metadata; complete EditEngine ownership is not fabricated. @returns Nothing. */ () => {
  const document = new SwDoc(),
    position = new SwPosition(document.GetNodes().GetEndOfContent()),
    range = new SwPaM(position),
    owner = new DocxExport(
      new XmlFilterBase(new ZipStorage()),
      document,
      range,
      range,
      false,
      false,
    ),
    destination = new SfxItemPool(),
    native = new SfxItemSet(document.GetAttrPool(), W.WRITER_CHARACTER_WHICH_RANGES),
    translated = new SfxItemSet(destination, [[3000, 3000]]),
    output = new ZipFragmentStream("word/translated.xml", "application/xml"),
    serializer = new FastSerializerHelper(output, false);
  try {
    const slot = document.GetAttrPool().GetSlotId(W.RES_CHRATR_FONTSIZE);
    assert(SfxItemPool.IsSlot(slot));
    destination.RegisterDefaultItem(new SvxFontHeightItem(330, 100, 3000), undefined, slot);
    owner.m_pISet = native;
    expect(owner.GetItem(W.RES_CHRATR_FONTSIZE)).toBe(native.Get(W.RES_CHRATR_FONTSIZE));
    expect(GetSetWhichFromSwDocWhich(native, document, W.RES_CHRATR_FONTSIZE)).toBe(
      W.RES_CHRATR_FONTSIZE,
    );
    owner.m_pISet = translated;
    expect(GetSetWhichFromSwDocWhich(translated, document, W.RES_CHRATR_FONTSIZE)).toBe(3000);
    expect(owner.GetItem(W.RES_CHRATR_FONTSIZE)).toBe(destination.GetUserOrPoolDefaultItem(3000));
    owner.DocxAttrOutput().SetSerializer(serializer);
    owner.DocxAttrOutput().CharEscapement(new SvxEscapementItem(17, 80, W.RES_CHRATR_ESCAPEMENT));
    owner.DocxAttrOutput().WriteCollectedRunProperties();
    serializer.endDocument();
    expect(new TextDecoder().decode(output.getBytes())).toBe(
      '<w:position w:val="6"/><w:sz w:val="26"/>',
    );
    expect((document.GetDefault(W.RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).toBe(240);
    const boundary = new SfxItemSet(destination, [[W.RES_WHICHHINT_END, W.RES_WHICHHINT_END]]);
    try {
      expect(GetSetWhichFromSwDocWhich(boundary, document, W.RES_CHRATR_FONTSIZE)).toBe(
        W.RES_CHRATR_FONTSIZE,
      );
    } finally {
      boundary.Dispose();
    }
  } finally {
    owner.m_pISet = undefined;
    translated.Dispose();
    native.Dispose();
    owner.dispose();
    range.Dispose();
    position.Dispose();
    document.Dispose();
  }
});

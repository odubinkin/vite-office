/** @fileoverview Complete native font-height state through actual Writer item pool, history and browser graph codec. */
import { expect, it } from "vitest";
import { SwDoc } from "./doc";
import { SvxFontHeightItem as Item } from "../../../../editeng/inc/fhgtitem";
import { MapUnit as M } from "../../../../tools/inc/mapunit";
import { RES_CHRATR_FONTSIZE as W } from "../../../inc/hintids";
import { SwHistorySetAttrSet } from "../undo/rolbck";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
it("keeps stored height property and absolute unit through real graph roundtrips and native history clones", /** The existing Writer persistence boundary restores state through original methods. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  if (node === undefined) throw Error("Missing actual paragraph");
  try {
    const item = new Item(240, 125, W);
    item.SetProp(65535, M.MapPoint);
    node.SetAttr(item);
    const old = node.GetSwAttrSet().CloneAsValue(),
      history = new SwHistorySetAttrSet(old, node.GetIndex(), new Set([W]));
    const snapshot = encodeWriterDocument(doc),
      restored = decodeWriterDocument(snapshot);
    try {
      expect((restored.paragraphs[0]?.GetAttr(W) as Item).QueryValue()).toEqual({
        height: 300,
        prop: 65535,
        propUnit: 8,
      });
      expect(encodeWriterDocument(restored)).toEqual(snapshot);
    } finally {
      restored.Dispose();
    }
    node.SetAttr(new Item(200, 100, W));
    history.SetInDoc(doc, false);
    expect((node.GetAttr(W) as Item).QueryValue()).toEqual({
      height: 300,
      prop: 65535,
      propUnit: 8,
    });
    item.SetProp(75, M.MapRelative);
    node.SetAttr(item);
    const relative = decodeWriterDocument(encodeWriterDocument(doc));
    try {
      expect((relative.paragraphs[0]?.GetAttr(W) as Item).QueryValue()).toEqual({
        height: 300,
        prop: 75,
        propUnit: 13,
      });
    } finally {
      relative.Dispose();
    }
  } finally {
    doc.Dispose();
  }
});

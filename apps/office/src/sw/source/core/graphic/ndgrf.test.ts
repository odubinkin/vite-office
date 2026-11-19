/** @fileoverview Writer embedded graphic nodes, native fly sections and Worker transport. */
import { assert, expect, it, vi } from "vitest";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { Size } from "../../../../tools/inc/gen";
import { CH_TXTATR_BREAKWORD } from "../../../inc/hintids";
import { Graphic } from "../../../../vcl/source/gdi/graph";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { SwFormatAnchor } from "../../../inc/fmtanchr";
import { SwFrameSize, SwFormatFrameSize } from "../../../inc/fmtfsize";
import { RES_FRM_SIZE } from "../../../inc/hintids";
import { aFrameFormatSetRange } from "../bastyp/init";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwDoc } from "../doc/doc";
import { aNoTextNodeSetRange, SwNoTextNode } from "../docnode/ndnotxt";
import {
  CollectGraphicFlyFrames,
  CollectTextFlyFrames,
  IsTextFlyAnchorFrame,
} from "../layout/flycnt";
import { SwTextFrame } from "../text/txtfrm";
import { SwFrame } from "../layout/wsfrm";

const payload = Uint8Array.from([137, 80, 78, 71]);

it("inserts embedded graphics in the native autotext section and restores their anchor and data", /** Checks native pooled styles, independent payloads and the current Worker schema. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const text = doc.paragraphs[0];
  assert(text);
  text.SetText("Before the image");
  const selection = new SwPaM(new SwPosition(text, 3));
  const anchor = new SwFormatAnchor(RndStdIds.FLY_AT_CHAR);
  const flyItems = new SfxItemSet(doc.GetAttrPool(), aFrameFormatSetRange);
  const graphicItems = new SfxItemSet(doc.GetAttrPool(), aNoTextNodeSetRange);
  const graphicSize = new SwFormatFrameSize(SwFrameSize.Fixed, 1210, 810);
  const bytes = payload.slice(),
    extent = new Size(1200, 800);
  const graphic = new Graphic(bytes, "image/png", extent);
  bytes[0] = 0;
  extent.setWidth(1);
  let restored: SwDoc | undefined;
  try {
    anchor.SetAnchor(selection.GetPoint());
    flyItems.Put(anchor);
    const manager = doc.GetDocumentContentOperationsManager();
    graphicItems.Put(graphicSize);
    const format = manager.InsertGraphic(selection, graphic, flyItems, graphicItems);
    const second = manager.InsertGraphic(selection, graphic);
    const defaultFormat = manager.InsertGraphic(
      selection,
      new Graphic(payload, "image/png", new Size(5, 0)),
    );
    expect([format.GetName(), second.GetName(), defaultFormat.GetName()]).toEqual([
      "Image1",
      "Image2",
      "Image3",
    ]);
    expect(second.GetAnchor().GetAnchorId()).toBe(RndStdIds.FLY_AT_PARA);
    expect(defaultFormat.GetFrameSize().GetWidth()).toBe(2268);
    expect(defaultFormat.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Variable);
    expect(CollectTextFlyFrames(doc).size).toBe(0);
    const record = encodeWriterDocument(doc);
    restored = decodeWriterDocument(structuredClone(record));
    for (const copy of [doc, restored]) {
      const fly = copy.GetSpzFrameFormats().GetFormat(0);
      const start = fly.GetContent().GetContentIdx()?.GetNode();
      assert(start?.IsStartNode());
      const node = copy
        .GetNodes()
        .at(start.GetIndex() + 1)
        .GetGrfNode();
      assert(node);
      expect(node).toBeInstanceOf(SwNoTextNode);
      expect(node.GetTextNode()).toBeNull();
      expect(node.Len()).toBe(0);
      expect(node.GetGraphic().GetNativeData()).toEqual(payload);
      expect(node.GetTwipSize().Width()).toBe(1200);
      expect(node.GetTwipSize().Height()).toBe(800);
      expect(node.GetpSwAttrSet()?.GetItemIfSet(RES_FRM_SIZE, false)).toEqual(graphicSize);
      expect(fly.GetAnchor().GetAnchorNode()).toBe(copy.paragraphs[0]);
      expect(fly.GetAnchor().GetAnchorContentOffset()).toBe(3);
      expect(fly.GetFrameSize().GetWidth()).toBe(1200);
      expect(fly.GetFrameSize().GetHeight()).toBe(800);
      expect(fly.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Fixed);
      expect(start.StartOfSectionNode()).toBe(
        copy.GetNodes().GetEndOfAutotext().StartOfSectionNode(),
      );
    }
    expect(encodeWriterDocument(restored)).toEqual(record);
  } finally {
    restored?.Dispose();
    graphicItems.Dispose();
    graphicSize.Dispose();
    flyItems.Dispose();
    anchor.Dispose();
    selection.Dispose();
    doc.Dispose();
  }
});

it("restores exactly one marker for an inline graphic and rejects malformed snapshots", /** Validates ownership and the transported record before native fly construction. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const text = doc.paragraphs[0];
  assert(text);
  const selection = new SwPaM(new SwPosition(text));
  const anchor = new SwFormatAnchor(RndStdIds.FLY_AS_CHAR);
  const inline = new SfxItemSet(doc.GetAttrPool(), aFrameFormatSetRange);
  const graphic = new Graphic(payload, "image/png", new Size(10, 20));
  const frameSize = new SwFormatFrameSize(SwFrameSize.Fixed, 75, 40);
  try {
    inline.Put(anchor);
    const model = doc.GetDocumentContentOperationsManager();
    inline.Put(frameSize);
    const frame = model.InsertGraphic(selection, graphic, inline);
    expect(frame.GetAnchor().GetAnchorId()).toBe(RndStdIds.FLY_AS_CHAR);
    expect(text.GetText()).toBe(CH_TXTATR_BREAKWORD);
    expect(frame.GetFrameSize().GetWidth()).toBe(75);
    expect(frame.GetFrameSize().GetHeight()).toBe(40);
    const record = encodeWriterDocument(doc);
    const first = record.textFrames?.[0];
    assert(first && "graphic" in first);
    for (const invalid of [
      null,
      { bytes: [] },
      { bytes: new Uint8Array() },
      { mediaType: "text/html" },
      { width: -1 },
      { height: Infinity },
      { items: null },
    ]) {
      const damaged = {
        ...record,
        textFrames: [
          { ...first, graphic: invalid === null ? null : { ...first.graphic, ...invalid } },
        ],
      };
      expect(
        /** Attempts to restore an invalid record. @returns Unexpected Writer graph. */
        () => decodeWriterDocument(damaged),
      ).toThrow("Stored Writer graphic frame is invalid.");
    }
    for (const textFrames of [
      [{ ...first, anchor: { ...first.anchor, offset: 1 } }],
      [first, first],
    ])
      expect(
        /** Attempts to claim a missing or consumed marker. @returns Unexpected Writer graph. */
        () => decodeWriterDocument({ ...record, textFrames }),
      ).toThrow("Stored Writer text-frame anchor is invalid.");
    const valid = decodeWriterDocument(record);
    try {
      const attached = valid.GetSpzFrameFormats().GetFormat(0);
      expect(valid.paragraphs[0]?.GetText()).toBe(CH_TXTATR_BREAKWORD);
      expect(
        valid.paragraphs[0]?.GetpSwpHints()?.GetTextAttrForCharAt(0)?.GetAttr().GetFrameFormat(),
      ).toBe(attached);
      expect(attached.GetFrameSize().GetWidth()).toBe(75);
      const attrs = attached.GetAttrSet().GetItemIfSet(RES_FRM_SIZE, false);
      expect(attrs).toBeInstanceOf(SwFormatFrameSize);
    } finally {
      valid.Dispose();
    }
  } finally {
    inline.Dispose();
    anchor.Dispose();
    frameSize.Dispose();
    selection.Dispose();
    doc.Dispose();
  }
});

it("assigns character anchors to the owning fragment after a native follow", /** Verifies the floating sibling path stays independent of the inline paint inputs. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcd");
  const point = new SwPosition(node, 2);
  const range = new SwPaM(point);
  const items = new SfxItemSet(doc.GetAttrPool(), aFrameFormatSetRange);
  const master = new SwTextFrame(node, "anchor", 0, 2, 0, [{ start: 0, end: 2, height: 240 }]);
  const follow = new SwTextFrame(node, "anchor", 2, 4, 0, [{ start: 2, end: 4, height: 240 }]);
  try {
    master.SetFollow(follow);
    const model = doc.GetDocumentContentOperationsManager();
    const image = new Graphic(payload, "image/png", new Size(300, 300));
    const paragraph = model.InsertGraphic(range, image);
    expect(IsTextFlyAnchorFrame(paragraph, master)).toBe(true);
    expect(IsTextFlyAnchorFrame(paragraph, follow)).toBe(false);
    items.Put(new SwFormatAnchor(RndStdIds.FLY_AT_CHAR));
    const character = model.InsertGraphic(range, image, items);
    expect(IsTextFlyAnchorFrame(character, master)).toBe(false);
    expect(IsTextFlyAnchorFrame(character, follow)).toBe(true);
    range.GetPoint().Assign(node, 4);
    const end = model.InsertGraphic(range, image, items);
    expect(IsTextFlyAnchorFrame(end, follow)).toBe(true);
    range.GetPoint().Assign(node, 1);
    const beginning = model.InsertGraphic(range, image, items);
    expect(IsTextFlyAnchorFrame(beginning, follow)).toBe(false);
    items.Put(new SwFormatAnchor(RndStdIds.FLY_AS_CHAR));
    const inline = model.InsertGraphic(range, image, items);
    expect(CollectGraphicFlyFrames(doc).get(node)).toHaveLength(4);
    expect(CollectGraphicFlyFrames(doc, true).get(node)?.at(-1)?.format).toBe(inline);
  } finally {
    SwFrame.DestroyFrame(follow);
    SwFrame.DestroyFrame(master);
    items.Dispose();
    range.Dispose();
    point.Dispose();
    doc.Dispose();
  }
});

it("releases the new native section when the inline marker cannot fit", /** Exercises failure through the public graphic insertion and unchanged outgoing registry. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const node = doc.paragraphs[0];
  assert(node);
  const point = new SwPosition(node);
  const range = new SwPaM(point);
  const items = new SfxItemSet(doc.GetAttrPool(), aFrameFormatSetRange);
  try {
    items.Put(new SwFormatAnchor(RndStdIds.FLY_AS_CHAR));
    const size = doc.GetNodes().Count();
    const model = doc.GetDocumentContentOperationsManager();
    const graphic = new Graphic(payload, "image/png", new Size(300, 300));
    vi.spyOn(node, "GetSpaceLeft").mockReturnValueOnce(0);
    expect(
      /** Exercises a capacity failure in the real format factory. @returns Unexpected graphic frame. */ () =>
        model.InsertGraphic(range, graphic, items),
    ).toThrow("Writer could not insert the graphic frame.");
    expect(node.GetText()).toBe("");
    expect(doc.GetSpzFrameFormats().size()).toBe(0);
    expect(doc.GetNodes().Count()).toBe(size);
  } finally {
    items.Dispose();
    range.Dispose();
    point.Dispose();
    doc.Dispose();
  }
});

it("keeps frame-free Worker records compatible and rejects malformed frame containers", /** Uses a real Writer graph record with the existing optional fly section. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const record = encodeWriterDocument(doc);
    const restored = decodeWriterDocument(record);
    try {
      expect(restored.GetSpzFrameFormats().size()).toBe(0);
    } finally {
      restored.Dispose();
    }
    expect(
      /** Rejects a non-list frame owner. @returns Unexpected document. */ () =>
        decodeWriterDocument({ ...record, textFrames: {} }),
    ).toThrow("Stored Writer text frames are invalid.");
    expect(
      /** Rejects a record missing all frame properties. @returns Unexpected document. */ () =>
        decodeWriterDocument({ ...record, textFrames: [{}] }),
    ).toThrow("Stored Writer text frame is invalid.");
  } finally {
    doc.Dispose();
  }
});

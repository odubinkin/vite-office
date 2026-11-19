/** @fileoverview Writer embedded graphic nodes, native fly sections and Worker transport. */
import { assert, expect, it } from "vitest";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { Size } from "../../../../tools/inc/gen";
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
import { CollectTextFlyFrames } from "../layout/flycnt";

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

it("rejects malformed graphic snapshots and unsupported inline insertion before changing the node graph", /** Validates ownership and the transported record before native fly construction. @returns Nothing. */ () => {
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
    const count = doc.nodes.Count();
    expect(
      /** Attempts to create an inline fly. @returns Unexpected native fly. */
      () => model.InsertGraphic(selection, graphic, inline),
    ).toThrow("Writer inline graphic anchors require inline fly content.");
    expect(doc.nodes.Count()).toBe(count);
    inline.ClearItem(anchor.Which());
    inline.Put(frameSize);
    const frame = model.InsertGraphic(selection, graphic, inline);
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
    const valid = decodeWriterDocument(record);
    try {
      const attached = valid.GetSpzFrameFormats().GetFormat(0);
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

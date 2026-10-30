/** @fileoverview Native paragraph-marker item selection, ListAutoFormat ownership, RTF marker import/export and Worker transport. */
import { afterEach, assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import {
  SwFormatAutoFormat,
  SwFormatCharFormat,
  SwFormatINetFormat,
} from "../../core/txtnode/fmtatr2";
import { MakeTextAttr } from "../../core/txtnode/thints";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { Color } from "../../../../tools/inc/color";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { RtfExport } from "./rtfexport";
import { RtfDocumentImpl } from "../../writerfilter/rtftok/rtfdocumentimpl";
import { GetParagraphMarkerProperties, CollectCharFormatItems } from "./wrtw8nds.paragraph-marker";
import { SetAttrMode } from "../../../inc/swtypes";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  NamedValue,
  cppu_detail_getUnoType_NamedValue as namedType,
} from "../../../../udkapi/com/sun/star/beans/NamedValue";
import {
  SetParaListAutoFormat,
  GetParaListAutoFormat,
  listAutoFormatType,
} from "../../core/unocore/unoobj-listautofmt";
import { unicode, text, GetPropertyValue } from "../../core/unocore/unocrsrhelper";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import * as H from "../../../inc/hintids";
const docs: SwDoc[] = [];
afterEach(
  /** Releases actual model owners. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Supplies an actual Writer document and initial text node. @param content - Real text. @returns Native owners. */
function owner(content = "abc") {
  const doc = new SwDoc();
  docs.push(doc);
  const node = doc.paragraphs[0];
  assert(node);
  node.SetText(content);
  return { doc, node };
}
/** Borrows the represented actual marker handle, without going through the source's list-gated public getter. @param doc - Actual document. @returns Native marker set. */
function marker(doc: SwDoc): SfxItemSet {
  const item = doc.paragraphs[0]?.GetAttr(H.RES_PARATR_LIST_AUTOFMT);
  assert(item instanceof SwFormatAutoFormat);
  const handle = item.GetStyleHandle();
  assert(handle);
  return handle;
}
/** Captures a native EOF automatic attribute from actual character items. @param node - Current paragraph. @param set - Actual attributes. @returns Nothing. */
function endHint(node: ReturnType<typeof owner>["node"], set: SfxItemSet): void {
  node.InsertHint(
    MakeTextAttr(node.GetDoc(), set, node.Len(), node.Len()),
    SetAttrMode.NOHINTADJUST,
  );
}
it("restores native Which defaults and pointer-name Any query", /** Pool defaults have no handle; arbitrary Which construction and immutable API naming follow fmtautofmt.hxx/fmtatr2.cxx. @returns Nothing. */ () => {
  const { doc } = owner();
  for (const which of [H.RES_TXTATR_AUTOFMT, H.RES_PARATR_LIST_AUTOFMT]) {
    const item = doc.GetAttrPool().GetUserOrPoolDefaultItem(which);
    assert(item instanceof SwFormatAutoFormat);
    expect(item.GetStyleHandle()).toBeUndefined();
    expect(item.QueryValue()).toBe("0");
    const value = new Any(),
      name = unicode("");
    try {
      expect(item.QueryValue(value, 254)).toBe(true);
      expect(value.extract(name, "OUString")).toBe(true);
      expect(text(name)).toBe("0");
      expect(item.PutValue(value)).toBe(false);
    } finally {
      name.dispose();
      value.dispose();
    }
  }
});
it("selects paragraph-direct character items only when terminal hints do not supersede them", /** Non-character paragraph items are rejected by the original fixed marker range. @returns Nothing. */ () => {
  const { node } = owner();
  node.SetAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, H.RES_CHRATR_WEIGHT));
  const properties = GetParagraphMarkerProperties(node);
  try {
    expect(properties.GetItemIfSet(H.RES_CHRATR_WEIGHT, false)).toBeDefined();
    expect(properties.GetItemIfSet(H.RES_PARATR_LIST_AUTOFMT, false)).toBeUndefined();
  } finally {
    properties.Dispose();
  }
});
it("uses terminal automatic attributes before direct paragraph formatting", /** The first matching automatic item sets bCharFormatOnly=false. @returns Nothing. */ () => {
  const { doc, node } = owner();
  node.SetAttr(new SvxWeightItem(FontWeight.WEIGHT_NORMAL, H.RES_CHRATR_WEIGHT));
  const set = new SfxItemSet(doc.GetAttrPool(), H.WRITER_CHARACTER_WHICH_RANGES);
  set.Put(new SvxWeightItem(FontWeight.WEIGHT_BOLD, H.RES_CHRATR_WEIGHT));
  try {
    endHint(node, set);
    const selected = GetParagraphMarkerProperties(node),
      flat = CollectCharFormatItems(selected);
    try {
      const weight = flat.GetItemIfSet(H.RES_CHRATR_WEIGHT, false);
      assert(weight instanceof SvxWeightItem);
      expect(weight.GetWeight()).toBe(FontWeight.WEIGHT_BOLD);
    } finally {
      flat.Dispose();
      selected.Dispose();
    }
  } finally {
    set.Dispose();
  }
});
it("keeps character-style-only terminal hints alongside the direct fallback", /** Native named, automatic and direct ordering preserves the direct item as the final winner. @returns Nothing. */ () => {
  const { doc, node } = owner(),
    style = doc.MakeCharFormat("Marker", doc.GetDfltCharFormat());
  style.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_NORMAL, H.RES_CHRATR_WEIGHT));
  node.SetAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, H.RES_CHRATR_WEIGHT));
  const item = new SwFormatCharFormat(style);
  try {
    node.InsertItem(item, node.Len(), node.Len(), SetAttrMode.NOHINTADJUST);
  } finally {
    item.Dispose();
  }
  const selected = GetParagraphMarkerProperties(node),
    flat = CollectCharFormatItems(selected);
  try {
    expect(selected.GetItemIfSet(H.RES_TXTATR_CHARFMT, false)).toBeInstanceOf(SwFormatCharFormat);
    const weight = flat.GetItemIfSet(H.RES_CHRATR_WEIGHT, false);
    assert(weight instanceof SvxWeightItem);
    expect(weight.GetWeight()).toBe(FontWeight.WEIGHT_BOLD);
  } finally {
    flat.Dispose();
    selected.Dispose();
  }
});
it("retains native suppression of fallback by a terminal internet item", /** An INET item is not copied here but still changes bCharFormatOnly in the pinned algorithm. @returns Nothing. */ () => {
  const { node } = owner();
  node.SetAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, H.RES_CHRATR_WEIGHT));
  const item = new SwFormatINetFormat("https://example.test");
  try {
    node.InsertItem(item, node.Len(), node.Len(), SetAttrMode.NOHINTADJUST);
  } finally {
    item.Dispose();
  }
  const selected = GetParagraphMarkerProperties(node);
  try {
    expect(selected.Count()).toBe(0);
  } finally {
    selected.Dispose();
  }
});
it("prioritizes the list/marker automatic handle over terminal hints and direct items", /** The handle exists even outside numbered lists and selects the first upstream branch. @returns Nothing. */ () => {
  const { doc, node } = owner(),
    set = new SfxItemSet(doc.GetAttrPool(), H.WRITER_CHARACTER_WHICH_RANGES);
  set.Put(new SvxColorItem(new Color(0x123456), H.RES_CHRATR_COLOR));
  const item = new SwFormatAutoFormat(H.RES_PARATR_LIST_AUTOFMT);
  try {
    item.SetStyleHandle(set);
    node.SetAttr(item);
  } finally {
    item.Dispose();
  }
  node.SetAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, H.RES_CHRATR_WEIGHT));
  const selected = GetParagraphMarkerProperties(node);
  try {
    expect(selected.GetItemIfSet(H.RES_CHRATR_COLOR, false)).toBeDefined();
    expect(selected.GetItemIfSet(H.RES_CHRATR_WEIGHT, false)).toBeUndefined();
  } finally {
    selected.Dispose();
  }
});
it("uses typed NamedValue input and preserves list-gated getter/state/default quirks", /** No JSON or host object replaces the native sequence contract. @returns Nothing. */ () => {
  const { doc, node } = owner(),
    Values = Sequence.specialize<NamedValue>(namedType, 32),
    name = unicode("CharWeight"),
    scalar = new Any([150], "float"),
    property = new NamedValue(name, scalar),
    sequence = new Values(new Map([[0, property]]), 1),
    value = new Any(sequence.getAddress(), listAutoFormatType);
  try {
    SetParaListAutoFormat(node, value);
    const weight = marker(doc).GetItemIfSet(H.RES_CHRATR_WEIGHT, false);
    assert(weight instanceof SvxWeightItem);
    expect(weight.GetWeight()).toBe(FontWeight.WEIGHT_BOLD);
    const direct = GetParaListAutoFormat(node);
    try {
      expect(direct.hasValue()).toBe(true);
    } finally {
      direct.dispose();
    }
    const position = new SwPosition(node),
      pam = new SwPaM(position);
    position.Dispose();
    const result = GetPropertyValue(pam, "ListAutoFormat");
    try {
      expect(result.hasValue()).toBe(false);
    } finally {
      result.dispose();
      pam.Dispose();
    }
    const model = new SwXTextDocument(doc),
      cursor = model.getText().createTextCursor(),
      key = unicode("ListAutoFormat");
    try {
      expect(cursor.getPropertyState(key)).toBe(0);
      const old = marker(doc);
      cursor.setPropertyToDefault(key);
      expect(marker(doc)).toBe(old);
      const defaultValue = cursor.getPropertyDefault(key);
      try {
        expect(defaultValue.hasValue()).toBe(false);
      } finally {
        defaultValue.dispose();
      }
    } finally {
      key.dispose();
      cursor.dispose();
      model.dispose();
    }
  } finally {
    value.dispose();
    sequence.dispose();
    property.dispose();
    scalar.dispose();
    name.dispose();
  }
});
it("round-trips the marker handle through Worker and native RTF without changing visible text weight", /** The paragraph marker has its own native property owner and cannot overwrite the first text run. @returns Nothing. */ () => {
  const { doc, node } = owner();
  const set = new SfxItemSet(doc.GetAttrPool(), H.WRITER_CHARACTER_WHICH_RANGES);
  set.Put(new SvxWeightItem(FontWeight.WEIGHT_BOLD, H.RES_CHRATR_WEIGHT));
  try {
    endHint(node, set);
  } finally {
    set.Dispose();
  }
  const bytes = RtfExport.WriteDocument(doc),
    rtf = new TextDecoder().decode(bytes);
  expect(rtf).toMatch(/\{[^{}]*\\b[^{}]*\\par\}/u);
  const restored = new RtfDocumentImpl().ResolveBytes(bytes);
  docs.push(restored);
  const weight = marker(restored).GetItemIfSet(H.RES_CHRATR_WEIGHT, false);
  assert(weight instanceof SvxWeightItem);
  expect(weight.GetWeight()).toBe(FontWeight.WEIGHT_BOLD);
  const worker = decodeWriterDocument(structuredClone(encodeWriterDocument(restored)));
  docs.push(worker);
  const copy = marker(worker).GetItemIfSet(H.RES_CHRATR_WEIGHT, false);
  assert(copy instanceof SvxWeightItem);
  expect(copy.GetWeight()).toBe(FontWeight.WEIGHT_BOLD);
  expect(worker.paragraphs[0]?.GetText()).toBe("abc");
});
it("preserves all three empty-paragraph language slots in the actual marker handle", /** LANGFE/ALANG do not need a fabricated paragraph shadow to survive an explicit terminator. @returns Nothing. */ () => {
  const doc = new RtfDocumentImpl().ResolveBytes(
    new TextEncoder().encode(String.raw`{\rtf1\loch\lang1031\dbch\langfe1041\hich\alang1025\par}`),
  );
  docs.push(doc);
  const set = marker(doc);
  for (const [which, id] of [
    [H.RES_CHRATR_LANGUAGE, 0x407],
    [H.RES_CHRATR_CJK_LANGUAGE, 0x411],
    [H.RES_CHRATR_CTL_LANGUAGE, 0x401],
  ] as const) {
    const item = set.GetItemIfSet(which, false);
    assert(item instanceof SvxLanguageItem);
    expect(item.GetLanguage()).toBe(id);
  }
  expect(doc.paragraphs).toHaveLength(1);
});
it("keeps native paragraph-marker font height separate from visible text", /** Empty EOF hints coexist with ListAutoFormat as required by the original mapper comments. @returns Nothing. */ () => {
  const doc = new RtfDocumentImpl().ResolveBytes(
    new TextEncoder().encode(String.raw`{\rtf1\fs20 Text{\fs40\par}}`),
  );
  docs.push(doc);
  const height = marker(doc).GetItemIfSet(H.RES_CHRATR_FONTSIZE, false);
  assert(height instanceof SvxFontHeightItem);
  expect(height.GetHeight()).toBe(400);
  const node = doc.paragraphs[0];
  assert(node);
  const visible = node.GetCharacterItemsAt(0);
  try {
    const item = visible.Get(H.RES_CHRATR_FONTSIZE);
    assert(item instanceof SvxFontHeightItem);
    expect(item.GetHeight()).toBe(200);
  } finally {
    visible.Dispose();
  }
});

it("registers marker-only fonts and colors again after Worker transport", /** Automatic styles must belong to the destination document pool for native font/color enumeration. @returns Nothing. */ () => {
  const original = new RtfDocumentImpl().ResolveBytes(
    new TextEncoder().encode(
      String.raw`{\rtf1{\fonttbl{\f0 Times New Roman;}{\f1 MarkerOnlyFont;}}{\colortbl;\red18\green52\blue86;}Text{\f1\cf1\par}}`,
    ),
  );
  docs.push(original);
  const restored = decodeWriterDocument(structuredClone(encodeWriterDocument(original)));
  docs.push(restored);
  const output = new TextDecoder().decode(RtfExport.WriteDocument(restored));
  expect(output).toContain("MarkerOnlyFont");
  expect(output).toContain(String.raw`\red18\green52\blue86;`);
  expect(output).toMatch(/\{[^{}]*\\cf[1-9][0-9]*[^{}]*\\par\}/u);
});
it("retains actual named-style identity inside marker handles at the Worker boundary", /** Marker recursion must resolve the destination's named owner rather than flattening its items. @returns Nothing. */ () => {
  const { doc, node } = owner(),
    style = doc.MakeCharFormat("MarkerStyle", undefined);
  style.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, H.RES_CHRATR_WEIGHT));
  const set = new SfxItemSet(doc.GetAttrPool(), [[H.RES_TXTATR_CHARFMT, H.RES_TXTATR_CHARFMT]]),
    item = new SwFormatAutoFormat(H.RES_PARATR_LIST_AUTOFMT);
  set.Put(new SwFormatCharFormat(style));
  try {
    item.SetStyleHandle(set);
    node.SetAttr(item);
  } finally {
    item.Dispose();
  }
  const restored = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
  docs.push(restored);
  const reference = marker(restored).GetItemIfSet(H.RES_TXTATR_CHARFMT, false);
  assert(reference instanceof SwFormatCharFormat);
  expect(reference.GetCharFormat()).toBe(
    restored
      .GetCharFormats()
      .find(
        /** Finds the actual destination owner. @param format - Named style. @returns Name match. */ (
          format,
        ) => format.GetName() === "MarkerStyle",
      ),
  );
  const nodeCopy = restored.paragraphs[0];
  assert(nodeCopy);
  const selected = GetParagraphMarkerProperties(nodeCopy),
    flat = CollectCharFormatItems(selected);
  try {
    expect((flat.Get(H.RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight()).toBe(
      FontWeight.WEIGHT_BOLD,
    );
  } finally {
    flat.Dispose();
    selected.Dispose();
  }
});

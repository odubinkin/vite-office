/** @fileoverview Native Writer format help/visibility/favourite and genuine interop-bag ownership; this does not substitute for full DOCX filter QA. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { CopyCharFormat } from "../doc/docfmt";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import { cppu_detail_getUnoType_PropertyValue as propertyType } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { SfxGrabBagItem } from "../../../../svl/inc/grabbagitem";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { OWeakObject } from "../../../../cppuhelper/inc/weak";
import { Reference } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import type { XAdapter } from "../../../../cppu/inc/com/sun/star/uno/XAdapter";
const Properties = Sequence.specialize(propertyType, 48);
/** Builds actual source map/PropertyValue sequence transport. @param entries - Native input map. @returns Owning Any. */
function bag(entries: ReadonlyMap<string, Any>): Any {
  const item = new SfxGrabBagItem(0, entries),
    result = new Any();
  try {
    item.QueryValue(result);
    return result;
  } finally {
    item.Dispose();
  }
}
/** Native long-valued qFormat property. @param value - Native long. @returns Owning property sequence Any. */
function favourite(value: number): Any {
  const number = new Any([value], "sal_Int32");
  try {
    return bag(new Map([["qFormat", number]]));
  } finally {
    number.dispose();
  }
}
it("preserves original metadata defaults, widths and silent flag setters on actual Writer formats", /** Checks inherited core owners rather than a style metadata proxy. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    root = doc.GetDfltCharFormat(),
    style = doc.MakeCharFormat("metadata", root),
    revision = doc.GetDocumentStateManager().GetModelRevision();
  expect(root.IsDefault()).toBe(true);
  expect(style.IsDefault()).toBe(false);
  expect([
    style.GetPoolFormatId(),
    style.GetPoolHelpId(),
    style.GetPoolHlpFileId(),
    style.IsHidden(),
    style.IsFavourite(),
  ]).toEqual([SwPoolFormatId.UNKNOWN, 65535, 255, false, undefined]);
  style.SetPoolHelpId(0x100000002);
  style.SetPoolHlpFileId(0x102);
  expect([style.GetPoolHelpId(), style.GetPoolHlpFileId()]).toEqual([2, 2]);
  style.SetPoolHelpId(-1);
  style.SetPoolHlpFileId(-1);
  expect([style.GetPoolHelpId(), style.GetPoolHlpFileId()]).toEqual([0xffffffff, 255]);
  style.SetHidden(true);
  style.SetFavourite(false);
  expect([style.IsHidden(), style.IsFavourite()]).toEqual([true, false]);
  style.SetPoolFormatId(SwPoolFormatId.UNKNOWN);
  expect(style.IsFavourite()).toBe(true);
  style.SetPoolFormatId(0);
  expect(style.IsFavourite()).toBe(true);
  style.SetFavourite(undefined);
  expect(style.IsFavourite()).toBeUndefined();
  style.SetHidden(false);
  expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
  doc.Dispose();
});
it("returns a genuine empty PropertyValue sequence without changing unknown favourite status", /** Verifies the native no-bag branch and actual Any type. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    style = doc.MakeCharFormat("empty", doc.GetDfltCharFormat()),
    output = new Any(),
    sequence = new Properties();
  style.GetGrabBagItem(output);
  expect(output.extract(sequence.getAddress(), ["Sequence", propertyType])).toBe(true);
  expect(sequence.getLength()).toBe(0);
  expect(style.IsFavourite()).toBeUndefined();
  sequence.dispose();
  output.dispose();
  doc.Dispose();
});
it("parses native qFormat absence, zero and nonzero values while preserving invalid-key state", /** Keeps the source optional-favourite rules used by DOCX export. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    style = doc.MakeCharFormat("qFormat", doc.GetDfltCharFormat());
  for (const number of [0, 1, -3]) {
    const input = favourite(number);
    style.SetGrabBagItem(input);
    input.dispose();
    expect(style.IsFavourite()).toBe(number !== 0);
  }
  const text = new OUString(new Uint16Array([120]), 1),
    wrongValue = new Any(text.getDataAddress(), "OUString"),
    wrongKey = bag(new Map([["qFormat", wrongValue]]));
  style.SetGrabBagItem(wrongKey);
  expect(style.IsFavourite()).toBe(true);
  style.SetFavourite(undefined);
  style.SetGrabBagItem(wrongKey);
  expect(style.IsFavourite()).toBeUndefined();
  const empty = bag(new Map());
  style.SetGrabBagItem(empty);
  expect(style.IsFavourite()).toBe(false);
  empty.dispose();
  wrongKey.dispose();
  wrongValue.dispose();
  text.dispose();
  doc.Dispose();
});
it("ignores a rejected whole grab-bag value and still parses the retained or newly empty map", /** Preserves native unchecked PutValue followed by ParseFavourites. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    style = doc.MakeCharFormat("rejected", doc.GetDfltCharFormat()),
    wrong = new Any([42], "sal_Int32");
  style.SetGrabBagItem(wrong);
  expect(style.IsFavourite()).toBe(false);
  const valid = favourite(1);
  style.SetGrabBagItem(valid);
  valid.dispose();
  style.SetFavourite(false);
  style.SetGrabBagItem(wrong);
  expect(style.IsFavourite()).toBe(true);
  wrong.dispose();
  doc.Dispose();
});
it("keeps a returned interop Any alive after the actual document and format are destroyed", /** Verifies real native interface ownership through SfxGrabBagItem and format teardown. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    style = doc.MakeCharFormat("lifetime", doc.GetDfltCharFormat()),
    owner = new OWeakObject(),
    held = new Reference(owner),
    adapter = owner.queryAdapter(),
    interfaceValue = new Any(held.getAddress(), "XInterface"),
    input = bag(new Map([["owner", interfaceValue]])),
    output = new Any();
  style.SetGrabBagItem(input);
  style.GetGrabBagItem(output);
  input.dispose();
  interfaceValue.dispose();
  held.clear();
  doc.Dispose();
  const alive = (adapter.get() as XAdapter).queryAdapted();
  expect(alive.get()).toBe(owner);
  alive.dispose();
  output.dispose();
  const dead = (adapter.get() as XAdapter).queryAdapted();
  expect(dead.is()).toBe(false);
  dead.dispose();
  adapter.dispose();
});
it("copies native character-style pool help but resets the document-local help-file index", /** Replays the represented native CopyFormat branch, including its UNKNOWN favourite side effect. @returns Nothing. */ () => {
  const sourceDoc = new SwDoc(),
    targetDoc = new SwDoc(),
    source = sourceDoc.MakeCharFormat("copy", sourceDoc.GetDfltCharFormat());
  source.SetPoolHelpId(0x80000001);
  source.SetPoolHlpFileId(3);
  source.SetHidden(true);
  source.SetFavourite(false);
  const copy = CopyCharFormat(targetDoc, source);
  expect(copy).not.toBe(source);
  expect(copy.GetPoolFormatId()).toBe(SwPoolFormatId.UNKNOWN);
  expect(copy.GetPoolHelpId()).toBe(0x80000001);
  expect(copy.GetPoolHlpFileId()).toBe(255);
  expect(copy.IsHidden()).toBe(false);
  expect(copy.IsFavourite()).toBe(true);
  source.SetPoolHelpId(4);
  expect(CopyCharFormat(targetDoc, source)).toBe(copy);
  expect(copy.GetPoolHelpId()).toBe(0x80000001);
  targetDoc.Dispose();
  sourceDoc.Dispose();
});

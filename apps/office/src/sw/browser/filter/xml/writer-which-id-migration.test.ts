/** @fileoverview Verifies obsolete v16 identities migrate at the browser boundary into actual native Writer graphs, without aliases in core. */
import { expect, it } from "vitest";
import { upgradeWriterWhichIds } from "./writer-which-id-migration";
import { encodeWriterDocument, decodeWriterDocument } from "./writer-document-codec";
import { SwDoc } from "../../../source/core/doc/doc";
import { SwTextGridItem } from "../../../inc/tgrditem";
import { RES_TEXTGRID, RES_PARATR_OUTLINELEVEL } from "../../../inc/hintids";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import { SvxBoxItem, SvxProtectItem } from "../../../../editeng/source/items/frmitems";
import { RES_BOX } from "../../../inc/hintids";

/** Requires an actual native graph edge. @param value - Optional owner. @returns Native owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native migration owner.");
  return value;
}

it("migrates two obsolete identity ranges while preserving unrelated numbers, sharing, binary data and caller state", /** Arbitrary properties are retained and original snapshots remain immutable. @returns Nothing. */ () => {
  const bytes = new Uint8Array([1, 2]),
    shared = { which: 83, value: 123 },
    source = {
      swModelVersion: 16,
      items: [
        null,
        false,
        64,
        { which: 63 },
        { which: 64 },
        { which: 82 },
        shared,
        shared,
        { which: 160 },
        { which: 161 },
        { which: 64.5 },
        { which: "64" },
      ],
      bytes,
      sameBytes: bytes,
    };
  const copy = upgradeWriterWhichIds(source) as typeof source;
  expect(copy.swModelVersion).toBe(17);
  expect(copy.items).toEqual([
    null,
    false,
    64,
    { which: 63 },
    { which: 66 },
    { which: 84 },
    { which: 86, value: 123 },
    { which: 86, value: 123 },
    { which: 163 },
    { which: 161 },
    { which: 64.5 },
    { which: "64" },
  ]);
  expect(copy.items[6]).toBe(copy.items[7]);
  expect(copy.bytes).toEqual(bytes);
  expect(copy.bytes).not.toBe(bytes);
  expect(copy.sameBytes).toBe(copy.bytes);
  expect(shared.which).toBe(83);
  expect(source.swModelVersion).toBe(16);
  for (const other of [null, 16, {}, { swModelVersion: 15 }, { swModelVersion: 17 }])
    expect(upgradeWriterWhichIds(other)).toBe(other);
  const cyclic: { swModelVersion: number; self?: unknown } = { swModelVersion: 16 };
  cyclic.self = cyclic;
  const cycle = upgradeWriterWhichIds(cyclic) as typeof cyclic;
  expect(cycle.self).toBe(cycle);
});

it("reopens old literal page, paragraph, style, list and cell identities through the actual document decoder", /** Old numbers are supplied explicitly, independently of the migration algorithm. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText("Старый документ Ω");
  node.SetParagraphAlignment("center");
  node.SetAttrListRestartValue(4);
  doc.GetDfltTextFormatColl().SetFormatAttr(new SfxUInt16Item(RES_PARATR_OUTLINELEVEL, 3));
  const grid = new SwTextGridItem();
  grid.SetLines(27);
  doc.GetAttrPool().SetUserDefaultItem(grid);
  doc.GetPageDesc().GetMaster().SetFormatAttr(grid);
  const protect = new SvxProtectItem(110);
  protect.SetContentProtect(true);
  doc.GetPageDesc().GetMaster().SetFormatAttr(protect);
  const table = doc.nodes.MakeTableNode("Legacy", { width: 3000 });
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 1),
    box = required(row.GetTabBoxes()[0]);
  table.GetFrameFormat().SetFormatAttr(new SwFormatLayoutSplit(false));
  box.GetFrameFormat().SetFormatAttr(new SvxBoxItem(RES_BOX));
  const current = encodeWriterDocument(doc),
    legacy = structuredClone(current) as unknown as Record<string, unknown>;
  legacy.swModelVersion = 16;
  // Exact old identities written by v16, including three master geometry items.
  const old = new Map([
    [66, 64],
    [67, 65],
    [82, 80],
    [89, 86],
    [93, 90],
    [101, 98],
    [102, 99],
    [116, 113],
    [123, 120],
    [125, 122],
    [110, 127],
  ]);
  const pending: unknown[] = [legacy];
  while (pending.length) {
    const value = pending.pop();
    if (value && typeof value === "object")
      for (const [key, child] of Object.entries(value))
        if (key === "which" && typeof child === "number" && child >= 64 && child <= 163) {
          expect(old.has(child as number)).toBe(true);
          (value as Record<string, unknown>)[key] = old.get(child as number);
        } else pending.push(child);
  }
  const restored = decodeWriterDocument(JSON.parse(JSON.stringify(legacy)));
  expect(encodeWriterDocument(restored)).toEqual(current);
  expect(restored.GetPageDesc().GetMaster().GetTextGrid().Which()).toBe(125);
  expect(restored.GetAttrPool().GetUserDefaultItem(RES_TEXTGRID)).toBeInstanceOf(SwTextGridItem);
  doc.Dispose();
  restored.Dispose();
});

/** @fileoverview Original Writer super/sub command, complete item persistence, cursor/history and actual ODT consumer contracts. */
import {
  createSwFormatAutoFormat,
  projectWriterCharacterAttributes,
} from "../../core/txtnode/txatbase";
import { applyTextImportProperties } from "../../../../xmloff/source/text/txtprmap";
import { SwXTextDocument } from "../uno/unotxdoc";

import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SvxEscapementItem as Item } from "../../../../editeng/inc/escapementitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SfxItemSet } from "../../../../svl/inc/itemset";
import { RES_CHRATR_ESCAPEMENT as WHICH } from "../../../inc/hintids";
import { FN_SET_SUPER_SCRIPT, FN_SET_SUB_SCRIPT } from "../../../inc/cmdid";
import { SwPosition } from "../../core/crsr/pam";
import { SwAttrIter } from "../../core/text/itratr";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { encodeSfxPoolItem } from "../../../browser/filter/xml/item-codec";
import { SwEditWin } from "../docvw/edtwin";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";
import {
  createOdtWriterTransfer,
  restoreOdtWriterTransfer,
} from "../../../browser/filter/xml/odt-transfer";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases actual native sessions. @returns Nothing. */ () => {
    for (const s of sessions.splice(0)) s.Close();
  },
);
/** Creates original Writer owners. @returns Fixture. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const view = session.view,
    shell = view.GetWrtShell(),
    doc = shell.GetDoc(),
    node = doc.paragraphs[0] as SwTextNode;
  node.SetText("abcdef");
  return { session, view, shell, doc, node };
}
/** Assigns native range without browser surrogates. @param f - Fixture. @param start - Start. @param end - End. @returns Nothing. */
function select(f: ReturnType<typeof fixture>, start: number, end: number) {
  const p = new SwPosition(f.node, end),
    m = new SwPosition(f.node, start);
  f.shell.SetPaM(p, m);
  p.Dispose();
  m.Dispose();
}
/** Reads actual native iterator item. @param node - Text owner. @param position - Offset. @returns Complete pair. */
function value(node: SwTextNode, position: number) {
  const i = new SwAttrIter(node);
  i.Seek(position);
  const item = i.GetAttrHandler().ReadItem(WHICH) as Item;
  return [item.GetEsc(), item.GetProportionalHeight()];
}
it("keeps source sign toggle and explicit bool ON/OFF with independent slot state", /** No inferred boolean replaces the complete native item. @returns Nothing. */ () => {
  const f = fixture();
  expect(value(f.node, 0)).toEqual([0, 100]);
  select(f, 0, 3);
  f.view.Execute(".uno:SuperScript");
  expect(value(f.node, 0)).toEqual([14000, 58]);
  expect(f.view.QueryState(".uno:SuperScript")).toMatchObject({ checked: true });
  expect(f.view.QueryState(".uno:SubScript").checked).toBe(false);
  f.view.Execute(".uno:SuperScript", [new SfxBoolItem(FN_SET_SUPER_SCRIPT, true)]);
  expect(value(f.node, 0)).toEqual([14000, 58]);
  f.view.Execute(".uno:SubScript");
  expect(value(f.node, 0)).toEqual([-14000, 58]);
  f.view.Execute(".uno:SubScript");
  expect(value(f.node, 0)).toEqual([0, 100]);
  f.view.Execute(".uno:SubScript", [new SfxBoolItem(FN_SET_SUB_SCRIPT, true)]);
  expect(value(f.node, 0)).toEqual([-14000, 58]);
  f.view.Execute(".uno:SubScript", [new SfxBoolItem(FN_SET_SUB_SCRIPT, false)]);
  expect(value(f.node, 0)).toEqual([0, 100]);
  const n = f.doc.GetUndoManager().GetUndoActionCount();
  expect(
    f.view.Execute(".uno:SuperScript", [new SfxStringItem(FN_SET_SUPER_SCRIPT, "bad")]),
  ).toMatchObject({ value: false });
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(n);
});
it("uses exact offset/height aggregation while native slot state remains a non-mixed bool", /** Equal signs with distinct heights must not become a uniform original item. @returns Nothing. */ () => {
  const f = fixture(),
    items = new SfxItemSet(f.doc.GetAttrPool(), [[WHICH, WHICH]]);
  select(f, 0, 3);
  items.Put(new Item(33, 75, WHICH));
  f.shell.SetAttrSet(items);
  select(f, 3, 6);
  items.Put(new Item(33, 58, WHICH));
  f.shell.SetAttrSet(items);
  select(f, 0, 6);
  expect(f.view.QueryState(".uno:SuperScript")).toMatchObject({ checked: false });
  expect(f.view.QueryState(".uno:SuperScript").mixed ?? false).toBe(false);
  const point = f.shell.GetCursor().GetPoint();
  f.view.Execute(".uno:SuperScript");
  expect(f.shell.GetCursor().GetPoint()).toBe(point);
  expect([value(f.node, 0), value(f.node, 4)]).toEqual([
    [14000, 58],
    [14000, 58],
  ]);
  f.shell.Undo();
  expect([value(f.node, 0), value(f.node, 4)]).toEqual([
    [33, 75],
    [33, 58],
  ]);
  f.shell.Redo();
  expect(value(f.node, 4)).toEqual([14000, 58]);
});
it("retains pending automatic offset/height through actual text insertion and undo", /** Ordinary caret shares original native typing and history owners. @returns Nothing. */ () => {
  const f = fixture(),
    p = new SwPosition(f.node, 3);
  f.shell.SetCursor(p);
  p.Dispose();
  f.view.Execute(".uno:SuperScript");
  expect(f.view.QueryState(".uno:SuperScript").checked).toBe(true);
  new SwEditWin(f.view).InsertText("S");
  expect(value(f.node, 3)).toEqual([14000, 58]);
  expect(value(f.node, 2)).toEqual([0, 100]);
  f.shell.Undo();
  expect(f.node.GetText()).toBe("abcdef");
  f.shell.Redo();
  expect(value(f.node, 3)).toEqual([14000, 58]);
});
it.each([
  [0, 100],
  [14000, 58],
  [-14000, 58],
  [33, 75],
  [-8, 83],
  [0, 58],
])(
  "preserves pair %j across complete codec, inherited off and repeated ODT",
  /** Actual Writer graph/zip roundtrip keeps both native fields. @param offset - Native offset. @param height - Native percent. @returns Completion. */ async (
    offset,
    height,
  ) => {
    const f = fixture();
    f.node.GetTextFormatColl().SetFormatAttr(new Item(14000, 58, WHICH));
    select(f, 0, 3);
    const items = new SfxItemSet(f.doc.GetAttrPool(), [[WHICH, WHICH]]);
    items.Put(new Item(offset, height, WHICH));
    f.shell.SetAttrSet(items);
    const native = new Item(offset, height, WHICH),
      restored = f.doc.GetAttrPool().CreateItem(structuredClone(encodeSfxPoolItem(native))) as Item;
    expect(restored).toBeInstanceOf(Item);
    expect([restored.GetEsc(), restored.GetProportionalHeight()]).toEqual([offset, height]);
    const transfer = restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(f.doc)));
    let bytes = writeOdtDocument(transfer, f.session.docShell.GetDocumentState());
    const z = new ZipFile(bytes);
    expect(
      (await z.readTextEntry("content.xml")) + (await z.readTextEntry("styles.xml")),
    ).toContain("style:text-position=");
    for (let pass = 0; pass < 2; pass++) {
      const doc = (await readOdtDocument(bytes, f.session.docShell.GetDocumentState())).document;
      expect([
        value(doc.paragraphs[0] as SwTextNode, 0),
        value(doc.paragraphs[0] as SwTextNode, 4),
      ]).toEqual([
        [offset, height],
        [14000, 58],
      ]);
      bytes = writeOdtDocument(doc, f.session.docShell.GetDocumentState());
    }
  },
);

it("preserves complete legacy character deltas and native factory admission", /** Original numeric fields stay distinct from the old optional browser character projection. @returns Nothing. */ () => {
  const f = fixture(),
    plain = { bold: false, italic: false, underline: false };
  for (const [desired, inherited] of [
    [{ offset: 14000, height: 58 }, undefined],
    [{ offset: 0, height: 58 }, undefined],
    [
      { offset: 0, height: 100 },
      { offset: 14000, height: 58 },
    ],
    [
      { offset: 33, height: 75 },
      { offset: 33, height: 58 },
    ],
    [
      { offset: 33, height: 75 },
      { offset: 33, height: 75 },
    ],
  ] as const) {
    const attrs = { ...plain, escapement: desired },
      previous = { ...plain, ...(inherited === undefined ? {} : { escapement: inherited }) },
      format = createSwFormatAutoFormat(f.doc.GetAttrPool(), attrs, previous);
    expect(format.GetStyleHandle().GetItemIfSet(WHICH, false) !== undefined).toBe(
      desired.offset !== (inherited?.offset ?? 0) || desired.height !== (inherited?.height ?? 100),
    );
    if (inherited) {
      const base = createSwFormatAutoFormat(f.doc.GetAttrPool(), {
        ...plain,
        escapement: inherited,
      }).GetStyleHandle();
      expect(projectWriterCharacterAttributes(format.GetStyleHandle(), base).escapement).toEqual(
        desired,
      );
    } else
      expect(projectWriterCharacterAttributes(format.GetStyleHandle()).escapement).toEqual(desired);
  }
  expect(
    /** Rejects a malformed actual stored native item. @returns Item or throws. */ () =>
      f.doc.GetAttrPool().CreateItem({ which: WHICH, value: 0 }),
  ).toThrow("Invalid escapement item state");
});
it.each([
  [{ escapement: 33 }, [33, 58], true],
  [{ escapementHeight: 75 }, [14000, 75], true],
  [{ escapement: 20000, escapementHeight: 75 }, [14000, 75], true],
  [{ escapement: 33, escapementHeight: 0 }, [33, 58], true],
  [{ escapement: 20000, escapementHeight: 0 }, [14000, 58], false],
])(
  "retains actual independent native import admission %j",
  /** Complete original item PutValue rejects illegal fields independently; inherited untouched fields remain. @param properties - Original filter handoff. @param pair - Expected native pair. @param authored - Whether any direct field was accepted. @returns Nothing. */ (
    properties,
    pair,
    authored,
  ) => {
    const f = fixture();
    f.node.SetAttr(new Item(14000, 58, WHICH));
    const before = f.node.GetAttr(WHICH);
    const model = new SwXTextDocument(f.doc),
      cursor = model.getText().createTextCursor();
    try {
      cursor.gotoEnd(true);
      applyTextImportProperties(cursor, properties);
      expect(value(f.node, 0)).toEqual(pair);
      expect(
        f.node.GetAttr(WHICH) !== before ||
          f.node.CaptureTextFragment(0, f.node.Len()).hints.Count() > 0,
      ).toBe(authored);
    } finally {
      cursor.dispose();
      model.dispose();
    }
  },
);

it("keeps the complete raw native domain in browser transfer independently of narrower UNO property admission", /** Snapshot storage must not silently reduce original signed16 and unsigned8 item fields to an ODT or UI subset. @returns Nothing. */ () => {
  const f = fixture();
  for (const [offset, height] of [
    [32767, 255],
    [-32768, 0],
    [0, 255],
  ] as const) {
    const original = new Item(offset, height, WHICH);
    f.node.SetAttr(original);
    const copy = f.doc
      .GetAttrPool()
      .CreateItem(structuredClone(encodeSfxPoolItem(original))) as Item;
    expect([copy.GetEsc(), copy.GetProportionalHeight()]).toEqual([offset, height]);
    const restored = restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(f.doc)));
    try {
      expect(value(restored.paragraphs[0] as SwTextNode, 0)).toEqual([offset, height]);
    } finally {
      restored.Dispose();
    }
  }
});

/** @fileoverview Verifies original native internet-item state equality and cursor range rules without a TextRuns query projection. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwpHints } from "../txtnode/ndhints";
import { SwTextINetFormat } from "../txtnode/txtatr2";
import { SwFormatINetFormat } from "../txtnode/fmtatr2";
import type { SwPoolFormatId } from "../../../inc/poolfmt";
import { RES_TXTATR_INETFMT } from "../../../inc/hintids";
import { createWriterHyperlinkAction, getWriterHyperlinkAtCursor } from "./editsh";
const shells: SwWrtShell[] = [],
  ranges: SwPaM[] = [];
/** Creates actual native body/cell internet owners with complete pooled metadata. @param cell - Actual cell context. @returns Native fixture. */
function fixture(cell = false) {
  const doc = new SwDoc(),
    body = doc.paragraphs[0],
    table = doc.nodes.MakeTableNode("NativeInternetState");
  table.AddColumnWidth(3000);
  const box = doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0],
    node = cell ? box?.GetParagraphs()[0] : body;
  if (node === undefined) throw Error("Missing native owner");
  node.SetText("abcdef");
  const a = new SwFormatINetFormat("https://example.test/same"),
    b = a.Clone();
  a.SetINetFormatAndId("", 65000 as SwPoolFormatId);
  b.SetINetFormatAndId("", 64000 as SwPoolFormatId);
  a.SetVisitedFormatAndId("", 63000 as SwPoolFormatId);
  b.SetVisitedFormatAndId("", 63000 as SwPoolFormatId);
  node.SetTextHints(
    new SwpHints(doc.GetAttrPool(), [new SwTextINetFormat(a, 0, 3), new SwTextINetFormat(b, 3, 6)]),
  );
  const shell = new SwWrtShell(
    new SwDocShell(
      doc,
      createDocument({ id: "native-internet-state", suiteId: "writer", title: "State" }),
    ),
  );
  shells.push(shell);
  shell.FocusNode(node);
  doc.GetUndoManager().Clear();
  return { doc, node, shell, box };
}
/** Places the original native cursor/mark and releases temporary positions. @param f - Native fixture. @param point - Literal point. @param mark - Optional literal mark. @returns Nothing. */
function select(f: ReturnType<typeof fixture>, point: number, mark?: number) {
  const p = new SwPosition(f.node, point),
    m = mark === undefined ? undefined : new SwPosition(f.node, mark);
  try {
    f.shell.SetPaM(p, m);
  } finally {
    p.Dispose();
    m?.Dispose();
  }
}
/** Returns the actual native internet item from an original hint. @param f - Native fixture. @param offset - Interior source offset. @returns Original item. */
function item(f: ReturnType<typeof fixture>, offset: number) {
  const hint = f.node.GetTextAttrAt(offset, RES_TXTATR_INETFMT);
  if (!(hint?.format instanceof SwFormatINetFormat)) throw Error("Missing actual item");
  return hint.format;
}
afterEach(
  /** Releases actual native subscriptions and rings. @returns Nothing. */ () => {
    for (const range of ranges.splice(0)) range.Dispose();
    for (const shell of shells.splice(0)) shell.Close();
  },
);
it.each([false, true])(
  "same URL with distinct native normal style IDs is mixed cell=%s",
  /** Reproduces native identity loss through the real core query. @param cell - Actual native context. @returns Nothing. */ (
    cell,
  ) => {
    const f = fixture(cell);
    select(f, 6, 0);
    const cursor = f.shell.GetCursor(),
      point = cursor.GetPoint(),
      mark = cursor.GetMark(),
      hints = [...(f.node.GetpSwpHints()?.entries() ?? [])];
    expect(f.shell.GetHyperlinkAtCursor()).toBeUndefined();
    expect(cursor.GetPoint()).toBe(point);
    expect(cursor.GetMark()).toBe(mark);
    expect(f.node.GetpSwpHints()?.entries()).toEqual(hints);
    hints.forEach(
      /** Checks original ownership without a snapshot identity substitute. @param hint - Original owner. @param index - Native map position. @returns Nothing. */ (
        hint,
        index,
      ) => expect(f.node.GetpSwpHints()?.Get(index)).toBe(hint),
    );
    expect([item(f, 1).GetINetFormatId(), item(f, 4).GetINetFormatId()]).toEqual([65000, 64000]);
  },
);
it("uniform full native items stay uniform across automatic character portions and reversed selections", /** Checks character hints do not flatten or affect full-item state. @returns Nothing. */ () => {
  const f = fixture();
  item(f, 4).SetINetFormatAndId("", 65000 as SwPoolFormatId);
  select(f, 2, 1);
  expect(f.shell.ToggleCharacterFormat("bold")).toBe(true);
  select(f, 0, 6);
  expect(f.shell.GetHyperlinkAtCursor()?.url).toBe("https://example.test/same");
  select(f, 6, 0);
  expect(f.shell.GetHyperlinkAtCursor()?.url).toBe("https://example.test/same");
  item(f, 4).SetVisitedFormatAndId("", 62000 as SwPoolFormatId);
  expect(f.shell.GetHyperlinkAtCursor()).toBeUndefined();
});
it.each(["prefix", "interior", "suffix"])(
  "a native %s gap is mixed",
  /** Checks partial INET interval tracking and missing coverage. @param gap - Actual gap. @returns Nothing. */ (
    gap,
  ) => {
    const f = fixture(),
      a = item(f, 1).Clone(),
      spans =
        gap === "prefix"
          ? [[1, 6]]
          : gap === "suffix"
            ? [[0, 3]]
            : [
                [0, 2],
                [4, 6],
              ];
    f.node.SetTextHints(
      new SwpHints(
        f.doc.GetAttrPool(),
        spans.map(
          /** Builds independent original interval owners. @param span - Literal start/end. @returns Native owner. */ (
            span,
          ) => new SwTextINetFormat(a.Clone(), span[0] as number, span[1] as number),
        ),
      ),
    );
    select(f, 6, 0);
    expect(f.shell.GetHyperlinkAtCursor()).toBeUndefined();
  },
);
it("native collapsed state respects DontExpand, zero start and end-equal empty hints", /** Checks literal source containment rather than previous-character DTO inheritance. @returns Nothing. */ () => {
  const f = fixture();
  select(f, 0);
  expect(f.shell.GetHyperlinkAtCursor()?.url).toBe("https://example.test/same");
  select(f, 3);
  expect(f.shell.GetHyperlinkAtCursor()).toBeUndefined();
  f.node.GetTextAttrAt(1, RES_TXTATR_INETFMT)?.SetDontExpand(false);
  expect(f.shell.GetHyperlinkAtCursor()).toBeUndefined();
  f.node.GetTextAttrAt(1, RES_TXTATR_INETFMT)?.SetLockExpandFlag(false);
  f.node.GetTextAttrAt(1, RES_TXTATR_INETFMT)?.SetDontExpand(false);
  expect(f.shell.GetHyperlinkAtCursor()?.url).toBe("https://example.test/same");
  select(f, 6);
  expect(f.shell.GetHyperlinkAtCursor()).toBeUndefined();
  f.node.GetTextAttrAt(4, RES_TXTATR_INETFMT)?.SetLockExpandFlag(false);
  f.node.GetTextAttrAt(4, RES_TXTATR_INETFMT)?.SetDontExpand(false);
  expect(f.shell.GetHyperlinkAtCursor()?.url).toBe("https://example.test/same");
  f.node.SetTextHints(
    new SwpHints(f.doc.GetAttrPool(), [
      new SwTextINetFormat(new SwFormatINetFormat("empty-owner"), 1, 1),
    ]),
  );
  select(f, 1, 1);
  expect(f.shell.GetHyperlinkAtCursor()?.url).toBe("empty-owner");
  select(f, 2);
  expect(f.shell.GetHyperlinkAtCursor()).toBeUndefined();
});
it("full containing attributes win in original start order while equal partial defaults do not author state", /** Checks original full-cover and default comparisons. @returns Nothing. */ () => {
  const f = fixture();
  // Query original low-level Insert owners; InsertURL nesting admission is a separate contract.
  f.node.SetTextHints(new SwpHints(f.doc.GetAttrPool()));
  f.node.GetOrCreateSwpHints().Insert(new SwTextINetFormat(new SwFormatINetFormat("outer"), 0, 6));
  f.node.GetOrCreateSwpHints().Insert(new SwTextINetFormat(new SwFormatINetFormat("inner"), 1, 5));
  select(f, 4, 2);
  expect(f.shell.GetHyperlinkAtCursor()?.url).toBe("inner");
  f.node.SetTextHints(new SwpHints(f.doc.GetAttrPool()));
  const defaults = f.doc
    .GetAttrPool()
    .GetUserOrPoolDefaultItem(RES_TXTATR_INETFMT) as SwFormatINetFormat;
  f.node.GetOrCreateSwpHints().Insert(new SwTextINetFormat(defaults.Clone(), 0, 3));
  select(f, 6, 0);
  expect(f.shell.GetHyperlinkAtCursor()).toBeUndefined();
  select(f, 1);
  expect(f.shell.GetHyperlinkAtCursor()).toEqual(defaults.GetHyperlink());
  f.node.SetTextHints(
    new SwpHints(f.doc.GetAttrPool(), [
      new SwTextINetFormat(new SwFormatINetFormat("before"), 0, 1),
      new SwTextINetFormat(new SwFormatINetFormat("after"), 6, 6),
    ]),
  );
  select(f, 6, 2);
  expect(f.shell.GetHyperlinkAtCursor()).toBeUndefined();
});
it("original multi-node and ring states merge complete items and defaults without changing owners", /** Checks actual native node spans and cursor ring aggregation. @returns Nothing. */ () => {
  const f = fixture();
  f.node.SetTextHints(
    new SwpHints(f.doc.GetAttrPool(), [
      new SwTextINetFormat(new SwFormatINetFormat("uniform"), 0, 6),
    ]),
  );
  const intervening = f.box?.GetParagraphs()[0];
  if (intervening === undefined) throw Error("Missing original cell");
  intervening.SetText("between");
  intervening.SetTextHints(
    new SwpHints(f.doc.GetAttrPool(), [new SwTextINetFormat(item(f, 1).Clone(), 0, 7)]),
  );
  const other = f.doc.nodes.MakeTextNode("xyz");
  other.SetHyperlink(0, 3, {
    url: "uniform",
    styleName: "Internet Link",
    visitedStyleName: "Visited Internet Link",
  });
  // Use identical complete native items rather than lossy portable style IDs.
  other.SetTextHints(
    new SwpHints(f.doc.GetAttrPool(), [new SwTextINetFormat(item(f, 1).Clone(), 0, 3)]),
  );
  const p = new SwPosition(other, 2),
    m = new SwPosition(f.node, 1);
  try {
    f.shell.SetPaM(p, m);
  } finally {
    p.Dispose();
    m.Dispose();
  }
  expect(f.shell.GetHyperlinkAtCursor()?.url).toBe("uniform");
  other.SetTextHints(new SwpHints(f.doc.GetAttrPool()));
  expect(f.shell.GetHyperlinkAtCursor()).toBeUndefined();
  select(f, 1);
  const q = new SwPosition(other, 1),
    ring = new SwPaM(q, undefined, f.shell.GetCursor());
  q.Dispose();
  ranges.push(ring);
  expect(f.shell.GetHyperlinkAtCursor()).toBeUndefined();
  ring.SetInFrontOfLabel_(true);
  expect(f.shell.GetHyperlinkAtCursor()?.url).toBe("uniform");
  f.shell.GetCursor().SetInFrontOfLabel_(true);
  expect(f.shell.GetHyperlinkAtCursor()).toBeUndefined();
});
it("missing and mixed native ring states follow the original defaults-participating matrix", /** Covers actual SET/default/INVALID accumulation in both orders. @returns Nothing. */ () => {
  const f = fixture();
  select(f, 6, 0);
  const q = new SwPosition(f.node, 1),
    ring = new SwPaM(q, undefined, f.shell.GetCursor());
  q.Dispose();
  ranges.push(ring);
  expect(f.shell.GetHyperlinkAtCursor()).toBeUndefined();
  const inside = new SwPosition(f.node, 1);
  f.shell.GetCursor().Assign(inside);
  inside.Dispose();
  const other = f.doc.nodes.MakeTextNode("empty"),
    p = new SwPosition(other, 1),
    mark = new SwPosition(other, 0);
  try {
    ring.Assign(p, mark);
  } finally {
    p.Dispose();
    mark.Dispose();
  }
  expect(f.shell.GetHyperlinkAtCursor()).toBeUndefined();
  const p2 = new SwPosition(other, 1);
  try {
    f.shell.GetCursor().Assign(p2);
  } finally {
    p2.Dispose();
  }
  const p3 = new SwPosition(f.node, 1);
  try {
    ring.Assign(p3);
  } finally {
    p3.Dispose();
  }
  expect(f.shell.GetHyperlinkAtCursor()).toBeUndefined();
  ring.SetInFrontOfLabel_(true);
  expect(f.shell.GetHyperlinkAtCursor()).toBeUndefined();
});
it("an already invalid gap stays invalid across later original partial owners", /** Checks three legal independent hints retain the native mixed-state sentinel. @returns Nothing. */ () => {
  const f = fixture();
  f.node.SetTextHints(
    new SwpHints(
      f.doc.GetAttrPool(),
      [
        [0, 1],
        [2, 3],
        [4, 5],
      ].map(
        /** Creates actual separate hint owners. @param span - Literal native interval. @returns Internet attribute. */ ([
          start,
          end,
        ]) => {
          if (start === undefined || end === undefined) throw Error("Missing interval");
          return new SwTextINetFormat(new SwFormatINetFormat("same"), start, end);
        },
      ),
    ),
  );
  select(f, 6, 0);
  expect(f.shell.GetHyperlinkAtCursor()).toBeUndefined();
});
it("original low-level partial owners matching a later full owner preserve the native format state", /** Checks the original GetParaAttr partial/full comparison without normalizing input owners. @returns Nothing. */ () => {
  const f = fixture();
  f.node.SetTextHints(new SwpHints(f.doc.GetAttrPool()));
  for (const [start, end] of [
    [0, 3],
    [1, 6],
    [3, 6],
  ] as const) {
    f.node
      .GetOrCreateSwpHints()
      .Insert(new SwTextINetFormat(new SwFormatINetFormat("same"), start, end));
  }
  select(f, 6, 2);
  expect(f.shell.GetHyperlinkAtCursor()?.url).toBe("same");
});
it("original ring aggregation participates in default-equal and mixed source item states", /** Checks actual native merge inputs in both orders. @returns Nothing. */ () => {
  const f = fixture();
  const point = new SwPosition(f.node, 1),
    root = new SwPaM(point);
  point.Dispose();
  ranges.push(root);
  const end = new SwPosition(f.node, 6),
    start = new SwPosition(f.node, 0),
    mixed = new SwPaM(end, start, root);
  end.Dispose();
  start.Dispose();
  ranges.push(mixed);
  expect(getWriterHyperlinkAtCursor(f.doc, root)).toBeUndefined();
  f.node.SetTextHints(new SwpHints(f.doc.GetAttrPool()));
  f.node.GetOrCreateSwpHints().Insert(new SwTextINetFormat(new SwFormatINetFormat(), 0, 3));
  const empty = f.doc.nodes.MakeTextNode("plain"),
    p = new SwPosition(empty, 1);
  root.Assign(p);
  p.Dispose();
  const a = new SwPosition(f.node, 2),
    b = new SwPosition(f.node, 0);
  mixed.Assign(a, b);
  a.Dispose();
  b.Dispose();
  expect(getWriterHyperlinkAtCursor(f.doc, root)).toBeUndefined();
  const plain = new SwPosition(empty, 1);
  mixed.Assign(plain);
  plain.Dispose();
  expect(getWriterHyperlinkAtCursor(f.doc, root)).toBeUndefined();
  const items = f.node.GetCharacterItemsAt(1),
    p2 = new SwPosition(f.node, 1),
    m2 = new SwPosition(empty, 1),
    multi = new SwPaM(p2, m2);
  p2.Dispose();
  m2.Dispose();
  ranges.push(multi);
  expect(
    createWriterHyperlinkAction(
      f.doc,
      multi,
      items,
      { activeParagraph: f.node, pendingCharacterItems: items, point: { node: f.node, offset: 1 } },
      undefined,
    ),
  ).toBeUndefined();
});
it("foreign native cursors yield no state without probing the local document", /** Checks original owner protection. @returns Nothing. */ () => {
  const f = fixture(),
    foreign = fixture();
  select(foreign, 1);
  expect(getWriterHyperlinkAtCursor(f.doc, foreign.shell.GetCursor())).toBeUndefined();
});
it("the original cursor-count limit admits10000 and clears state at10001", /** Checks the literal native count boundary using real owned PaMs. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  if (node === undefined) throw Error("Missing native owner");
  node.SetText("x");
  node.SetHyperlink(0, 1, { url: "limit" });
  const position = new SwPosition(node, 0),
    root = new SwPaM(position);
  ranges.push(root);
  try {
    for (let index = 1; index < 10000; index++) ranges.push(new SwPaM(position, undefined, root));
    expect(getWriterHyperlinkAtCursor(doc, root)?.url).toBe("limit");
    ranges.push(new SwPaM(position, undefined, root));
    expect(getWriterHyperlinkAtCursor(doc, root)).toBeUndefined();
  } finally {
    position.Dispose();
  }
});
it("the original node-span limit admits9999 offsets and rejects10000", /** Checks original max-lookup policy on actual graph indices. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    first = doc.paragraphs[0];
  if (first === undefined) throw Error("Missing native owner");
  first.SetText("x");
  first.SetHyperlink(0, 1, { url: "limit" });
  let last = first;
  for (let index = 0; index < 9999; index++) {
    last = doc.nodes.MakeTextNode("x");
    last.SetHyperlink(0, 1, { url: "limit" });
  }
  expect(last.GetIndex() - first.GetIndex()).toBe(9999);
  const mark = new SwPosition(first, 0),
    point = new SwPosition(last, 1),
    cursor = new SwPaM(point, mark);
  ranges.push(cursor);
  try {
    expect(getWriterHyperlinkAtCursor(doc, cursor)?.url).toBe("limit");
    last = doc.nodes.MakeTextNode("x");
    const extra = new SwPosition(last, 1);
    try {
      cursor.Assign(extra, mark);
    } finally {
      extra.Dispose();
    }
    expect(getWriterHyperlinkAtCursor(doc, cursor)).toBeUndefined();
  } finally {
    mark.Dispose();
    point.Dispose();
  }
});

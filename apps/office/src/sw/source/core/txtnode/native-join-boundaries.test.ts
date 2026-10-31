/** @fileoverview Native paragraph join admission, surviving owners, transferred hints and registered cursor/mark offsets required by HTML insertion boundaries. */
import { afterEach, assert, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTextNode } from "./ndtxt";
import { SwPosition, SwPaM, SwNodeIndex } from "../crsr/pam";
import { SwFormatINetFormat } from "./fmtatr2";
import { SetAttrMode } from "../../../inc/swtypes";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_WEIGHT, RES_UL_SPACE } from "../../../inc/hintids";
const docs: SwDoc[] = [];
afterEach(
  /** Releases actual native graphs. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Creates real adjacent paragraphs through the native content manager. @returns Native graph owners. */
function paragraphs() {
  const doc = new SwDoc();
  docs.push(doc);
  const first = doc.paragraphs[0];
  assert(first);
  first.SetText("ABCD");
  const point = new SwPosition(first, first.Len());
  doc.GetDocumentContentOperationsManager().AppendTextNode(point);
  const second = point.GetNode();
  assert(second instanceof SwTextNode);
  second.SetText("EFGH");
  point.Dispose();
  return { doc, first, second };
}
it("updates native join outputs only on success and rejects body/table/cell boundaries", /** Native node types and terminal sentinels provide admission without projected row/layout providers. @returns Nothing. */ () => {
  const { doc, first, second } = paragraphs(),
    index = new SwNodeIndex(second),
    position = new SwPosition(first, 2);
  try {
    expect(first.CanJoinPrev(index)).toBe(false);
    expect(index.GetNode()).toBe(second);
    expect(first.CanJoinNext(position)).toBe(true);
    expect(position.GetNode()).toBe(second);
    expect(position.GetContentIndex()).toBe(0);
    expect(second.CanJoinNext(index)).toBe(false);
    expect(index.GetNode()).toBe(second);
    expect(second.CanJoinPrev(index)).toBe(true);
    expect(index.GetNode()).toBe(first);
    const table = doc.nodes.MakeTableNode("Join barrier"),
      row = doc.nodes.AppendTableRow(table, 2),
      a = row.GetTabBoxes()[0]?.GetParagraphs()[0],
      b = row.GetTabBoxes()[1]?.GetParagraphs()[0];
    assert(a && b);
    expect(a.CanJoinPrev()).toBe(false);
    expect(a.CanJoinNext()).toBe(false);
    expect(b.CanJoinPrev()).toBe(false);
    expect(b.CanJoinNext()).toBe(false);
    const beforeTable = doc.nodes.at(table.GetTableNode().GetIndex() - 1);
    assert(beforeTable instanceof SwTextNode);
    expect(beforeTable.CanJoinNext()).toBe(false);
    position.Assign(second, 2);
    expect(second.CanJoinNext(position)).toBe(false);
    expect(position.GetNode()).toBe(second);
    expect(position.GetContentIndex()).toBe(2);
  } finally {
    position.Dispose();
  }
});
it.each([false, true])(
  "preserves the source SplitNode point contract with before-affinity %s",
  /** The explicit split position follows the trailing start even when its general index affinity keeps other boundary markers before. @param before - Use before affinity. @returns Nothing. */ (
    before,
  ) => {
    const { doc, first } = paragraphs(),
      point = new SwPosition(first, 2, "cursor", before ? "before" : "after"),
      other = new SwPosition(first, 2, "mark", "before");
    try {
      const trailing = doc.GetDocumentContentOperationsManager().SplitNode(point);
      expect([first.GetText(), trailing.GetText()]).toEqual(["AB", "CD"]);
      expect(point.GetNode()).toBe(trailing);
      expect(point.GetContentIndex()).toBe(0);
      expect(other.GetNode()).toBe(first);
      expect(other.GetContentIndex()).toBe(2);
    } finally {
      point.Dispose();
      other.Dispose();
    }
  },
);
it("JoinNext keeps the prefix owner, native source hint and registered source offsets", /** An interior INET attribute is transferred from the real native Cut container and rebound to the survivor. @returns Nothing. */ () => {
  const { doc, first, second } = paragraphs(),
    point = new SwPosition(first, 4),
    sourcePoint = new SwPosition(second, 2),
    pam = new SwPaM(sourcePoint),
    link = second.InsertItem(
      new SwFormatINetFormat("https://example.test/native"),
      1,
      3,
      SetAttrMode.NOTXTATRCHR | SetAttrMode.NOHINTADJUST,
    );
  assert(link);
  try {
    expect(first.JoinNext()).toBe(first);
    expect(doc.paragraphs).toEqual([first]);
    expect(first.GetText()).toBe("ABCDEFGH");
    expect([
      point.GetContentIndex(),
      sourcePoint.GetContentIndex(),
      pam.GetPoint().GetContentIndex(),
    ]).toEqual([4, 6, 6]);
    expect(sourcePoint.GetNode()).toBe(first);
    expect(first.GetpSwpHints()?.entries()).toContain(link);
    expect([link.GetStart(), link.GetAnyEnd()]).toEqual([5, 7]);
    expect(link.m_pHints).toBe(first.GetpSwpHints());
  } finally {
    point.Dispose();
    sourcePoint.Dispose();
    pam.Dispose();
  }
});
it("JoinPrev keeps the trailing owner and shifts its existing indices and hints once", /** The preceding text is inserted at zero; source and existing destination markers retain different native offsets. @returns Nothing. */ () => {
  const { doc, first, second } = paragraphs(),
    source = new SwPosition(first, 1),
    destination = new SwPosition(second, 2),
    link = second.InsertItem(
      new SwFormatINetFormat("https://example.test/tail"),
      1,
      3,
      SetAttrMode.NOTXTATRCHR | SetAttrMode.NOHINTADJUST,
    );
  assert(link);
  try {
    second.JoinPrev();
    expect(doc.paragraphs).toEqual([second]);
    expect(second.GetText()).toBe("ABCDEFGH");
    expect([source.GetNode(), destination.GetNode()]).toEqual([second, second]);
    expect([source.GetContentIndex(), destination.GetContentIndex()]).toEqual([1, 6]);
    expect(second.GetpSwpHints()?.entries()).toContain(link);
    expect([link.GetStart(), link.GetAnyEnd()]).toEqual([5, 7]);
  } finally {
    source.Dispose();
    destination.Dispose();
  }
});
it("joins remain no-ops at fixed section boundaries", /** Original failed admission returns the forward owner and leaves the graph untouched. @returns Nothing. */ () => {
  const { doc, first, second } = paragraphs();
  first.JoinPrev();
  expect(second.JoinNext()).toBe(second);
  expect(doc.paragraphs).toEqual([first, second]);
  expect([first.GetText(), second.GetText()]).toEqual(["ABCD", "EFGH"]);
});
it("manager joins preserve converted direct character values through the native owner", /** Existing manager formatting preparation now uses native JoinNext and actual direct sets. @returns Nothing. */ () => {
  const { doc, first, second } = paragraphs();
  second.SetAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
  expect(doc.GetDocumentContentOperationsManager().JoinTextNodes(first, second)).toBe(4);
  const output = new SfxItemSet(doc.GetAttrPool(), [[RES_CHRATR_WEIGHT, RES_CHRATR_WEIGHT]]);
  try {
    first.GetParaAttr(output, 4, 8, true);
    expect((output.Get(RES_CHRATR_WEIGHT) as SvxWeightItem).GetValue()).toBe(
      FontWeight.WEIGHT_BOLD,
    );
  } finally {
    output.Dispose();
  }
});

it("native empty-destination Cut copies hard paragraph state but excludes source list level", /** Source direct properties are copied before actual hint transfer when destination properties equal their parent. @returns Nothing. */ () => {
  const { first, second } = paragraphs();
  first.SetText("");
  first.SetAttrListLevel(0);
  second.SetAttrListLevel(3);
  second.SetAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
  second.SetAttr(new SvxULSpaceItem(10, 55, RES_UL_SPACE));
  first.JoinNext();
  expect(first.GetText()).toBe("EFGH");
  expect((first.GetAttr(RES_CHRATR_WEIGHT) as SvxWeightItem).GetValue()).toBe(
    FontWeight.WEIGHT_BOLD,
  );
  expect((first.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(55);
  expect(first.GetAttrListLevel()).toBe(0);
});
it("native nonempty-destination Cut keeps source hard character values ranged and retains paragraph state", /** Original nInitSize admission selects only character fields even when the source has paragraph spacing. @returns Nothing. */ () => {
  const { doc, first, second } = paragraphs();
  const before = (first.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetLower();
  second.SetAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
  second.SetAttr(new SvxULSpaceItem(10, 77, RES_UL_SPACE));
  first.JoinNext();
  expect(doc.paragraphs).toEqual([first]);
  expect((first.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(before);
  const set = new SfxItemSet(doc.GetAttrPool(), [[RES_CHRATR_WEIGHT, RES_CHRATR_WEIGHT]]);
  try {
    first.GetParaAttr(set, 4, 8, true);
    expect((set.Get(RES_CHRATR_WEIGHT) as SvxWeightItem).GetValue()).toBe(FontWeight.WEIGHT_BOLD);
  } finally {
    set.Dispose();
  }
});

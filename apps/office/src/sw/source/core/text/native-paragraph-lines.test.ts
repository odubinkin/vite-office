/** @fileoverview Checks original native paragraph ownership and linked iterator contracts, including dummy-line and original attribute state. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTextFrame, type SwTextLine } from "./txtfrm";
import { SwTextInfo, SwTextSizeInfo } from "./inftxt";
import { SwTextIter, SwTextCursor } from "./itrtxt";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { SwFormatAutoFormat, SwTextAttrEnd } from "../txtnode/txatbase";
import { SwLinePortion } from "./porlin";
import { SwLineLayout, SwParaPortion } from "./porlay";
const frames: SwTextFrame[] = [];
/** Creates actual original frame/paragraph objects from a device's measured lines. @param lines - Device lines. @param text - Original node text. @param start - Original frame offset. @returns Original owners. */
function fixture(
  lines: readonly SwTextLine[] = [
    { start: 0, end: 3, height: 100 },
    { start: 3, end: 6, height: 200 },
    { start: 6, end: 9, height: 300 },
  ],
  text = "abcdefghi",
  start = 0,
) {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  if (node === undefined) throw Error("Missing text owner");
  node.SetText(text);
  const frame = new SwTextFrame(node, "native", start, lines.at(-1)?.end ?? start, 0, lines);
  frames.push(frame);
  const info = new SwTextSizeInfo(frame),
    para = frame.GetPara();
  return { doc, node, frame, info, para };
}
afterEach(
  /** Releases original native frame clients and affinity. @returns Nothing. */ () => {
    for (const frame of frames.splice(0)) frame.DestroyImpl();
    SwTextCursor.SetRightMargin(false);
  },
);
it("native paragraph is the original first line and cursor retains original links", /** Checks actual line identities, defaults, paragraph length and measurement detachment. @returns Nothing. */ () => {
  const lines = [
      { start: 0, end: 3, height: 100 },
      { start: 3, end: 6, height: 200 },
    ],
    f = fixture(lines),
    para = f.para;
  if (para === undefined) throw Error("Missing para");
  expect(para).toBeInstanceOf(SwParaPortion);
  expect(para).toBeInstanceOf(SwLineLayout);
  expect(para).toBeInstanceOf(SwLinePortion);
  expect(para.GetLen()).toBe(3);
  expect(para.GetRealHeight()).toBe(100);
  expect(para.GetParLen()).toBe(6);
  const second = para.GetNext();
  if (second === undefined) throw Error("Missing second");
  expect(second.GetNext()).toBeUndefined();
  expect(second.GetLen()).toBe(3);
  expect(second.GetRealHeight()).toBe(200);
  const native = new SwLineLayout();
  expect(native.GetLen()).toBe(0);
  expect(native.GetRealHeight()).toBe(0);
  expect(native.GetNext()).toBeUndefined();
  expect(native.IsDummy()).toBe(false);
  native.SetNext(second);
  expect(native.GetNext()).toBe(second);
  native.SetNext(undefined);
  expect(native.GetNext()).toBeUndefined();
  native.SetDummy(true);
  expect(native.IsDummy()).toBe(true);
  native.SetDummy(false);
  expect(native.IsDummy()).toBe(false);
  lines[0] = { start: 0, end: 1, height: 10 };
  expect(para.GetLen()).toBe(3);
  expect(para.GetRealHeight()).toBe(100);
  const iter = new SwTextCursor(f.frame, f.info);
  expect(f.info.GetParaPortion()).toBe(para);
  expect(f.info.GetTextStart()).toBe(0);
  expect(iter.GetCurr()).toBe(para);
  expect(iter.GetNext()).toBe(second);
  expect(iter.GetPrev()).toBeUndefined();
  expect(iter.Next()).toBe(second);
  expect(iter.GetPrev()).toBe(para);
  expect(iter.Next()).toBeUndefined();
  expect(iter.Prev()).toBe(para);
  expect(iter.GetPrev()).toBeUndefined();
  expect(iter.Prev()).toBeUndefined();
});
it("native previous cache and cumulative offsets heights and line counts survive backward traversal", /** Checks actual three-line iterator state without external offset lookup. @returns Nothing. */ () => {
  const f = fixture(),
    iter = new SwTextIter(f.frame, f.info),
    para = f.para;
  if (para === undefined) throw Error("Missing para");
  const second = para.GetNext(),
    last = second?.GetNext();
  if (second === undefined || last === undefined) throw Error("Missing lines");
  expect(iter.Y()).toBe(0);
  expect(iter.GetLineNr()).toBe(1);
  expect(iter.GetLength()).toBe(3);
  expect(iter.GetEnd()).toBe(3);
  expect(iter.Next()).toBe(second);
  expect(iter.GetStart()).toBe(3);
  expect(iter.Y()).toBe(100);
  expect(iter.GetLineNr()).toBe(2);
  expect(iter.Next()).toBe(last);
  expect(iter.GetStart()).toBe(6);
  expect(iter.Y()).toBe(300);
  expect(iter.GetLineNr()).toBe(3);
  expect(iter.Prev()).toBe(second);
  expect(iter.GetPrev()).toBe(para);
  expect(iter.GetPrev()).toBe(para);
  expect(iter.GetStart()).toBe(3);
  expect(iter.Y()).toBe(100);
  expect(iter.GetLineNr()).toBe(2);
  expect(iter.Prev()).toBe(para);
  expect(iter.GetPrev()).toBeUndefined();
  expect(iter.Y()).toBe(0);
  expect(iter.GetLineNr()).toBe(1);
  iter.CharToLine(8);
  expect(iter.GetCurr()).toBe(last);
  iter.CharToLine(1);
  expect(iter.GetCurr()).toBe(para);
  expect(iter.MaybeHasHints()).toBe(false);
  expect(iter.GetAttrHandler()).toBeDefined();
  iter.Seek(1);
  expect(iter.GetNextAttr()).toBe(9);
});
it("native follow offset and original text size information remain owned by actual node", /** Checks native offset and live owner text. @returns Nothing. */ () => {
  const f = fixture(
      [
        { start: 3, end: 6, height: 120 },
        { start: 6, end: 9, height: 240 },
      ],
      "abcdefghi",
      3,
    ),
    iter = new SwTextCursor(f.frame, f.info);
  expect(f.info.GetTextStart()).toBe(3);
  expect(iter.GetStart()).toBe(3);
  expect(iter.GetEnd()).toBe(6);
  expect(f.info.GetChar(4)).toBe("e");
  expect(f.info.GetChar(99)).toBeUndefined();
  f.node.SetText("ABCdefghi");
  expect(f.info.GetText()).toBe("ABCdefghi");
  expect(f.info.GetChar(0)).toBe("A");
  expect(iter.CharCursorToLine(7)).toBe(f.para?.GetNext());
  expect(iter.GetStart()).toBe(6);
  expect(iter.CharCursorToLine(4)).toBe(f.para);
  expect(iter.GetStart()).toBe(3);
});
it("native previous-line skips original dummy links and retains all-dummy fallback", /** Checks native PrevLine including null and no-stitch identities. @returns Nothing. */ () => {
  const f = fixture(),
    para = f.para,
    second = para?.GetNext();
  if (para === undefined || second === undefined) throw Error("Missing lines");
  const iter = new SwTextCursor(f.frame, f.info);
  expect(iter.PrevLine()).toBeUndefined();
  second.SetDummy(true);
  iter.CharToLine(8);
  expect(iter.PrevLine()).toBe(para);
  expect(iter.GetCurr()).toBe(para);
  expect(iter.GetStart()).toBe(0);
  expect(iter.Y()).toBe(0);
  para.SetDummy(true);
  iter.CharToLine(8);
  expect(iter.PrevLine()).toBe(para);
  expect(iter.GetCurr()).toBe(para);
});
it("native empty and dummy first lines use source line-number transitions", /** Checks source line counter guards at an empty first and dummy follow. @returns Nothing. */ () => {
  const f = fixture(
      [
        { start: 0, end: 0, height: 10 },
        { start: 0, end: 3, height: 20 },
        { start: 3, end: 3, height: 30 },
        { start: 3, end: 6, height: 40 },
      ],
      "abcdef",
    ),
    para = f.para;
  const iter = new SwTextCursor(f.frame, f.info);
  expect(iter.Next()).toBe(para?.GetNext());
  expect(iter.GetLineNr()).toBe(1);
  expect(iter.Prev()).toBe(para);
  expect(iter.GetLineNr()).toBe(1);
  iter.Next();
  iter.Next();
  const dummy = iter.GetCurr();
  dummy.SetDummy(true);
  expect(iter.GetLineNr()).toBe(2);
  iter.Next();
  expect(iter.GetLineNr()).toBe(2);
  iter.Prev();
  expect(iter.GetLineNr()).toBe(2);
  dummy.SetDummy(false);
  iter.Next();
  expect(iter.GetLineNr()).toBe(3);
});
it.each([false, true])(
  "native soft boundary uses original preceding line affinity=%s",
  /** Checks literal native soft-line position. @param affinity - Right margin. @returns Nothing. */ (
    affinity,
  ) => {
    const f = fixture(),
      iter = new SwTextCursor(f.frame, f.info);
    SwTextCursor.SetRightMargin(affinity);
    expect(iter.CharCursorToLine(3)).toBe(affinity ? f.para : f.para?.GetNext());
    expect(iter.GetStart()).toBe(affinity ? 0 : 3);
  },
);
it("native hard break and empty preceding line reject backward affinity", /** Checks source literal break and zero-length prior portions. @returns Nothing. */ () => {
  const f = fixture(
      [
        { start: 0, end: 4, height: 100 },
        { start: 4, end: 7, height: 100 },
      ],
      "abc\ndef",
    ),
    iter = new SwTextCursor(f.frame, f.info);
  SwTextCursor.SetRightMargin(true);
  expect(iter.CharCursorToLine(4)).toBe(f.para?.GetNext());
  expect(iter.GetStart()).toBe(4);
  const empty = fixture(
      [
        { start: 0, end: 0, height: 10 },
        { start: 0, end: 3, height: 20 },
      ],
      "abc",
    ),
    cursor = new SwTextCursor(empty.frame, empty.info);
  SwTextCursor.SetRightMargin(true);
  expect(cursor.CharCursorToLine(0)).toBe(empty.para?.GetNext());
  expect(cursor.GetEnd()).toBe(3);
});
it("native missing paragraph rejects cursor construction while optional information remains absent", /** Checks native constructor precondition instead of nullable array iteration. @returns Nothing. */ () => {
  const f = fixture([], ""),
    info = new SwTextInfo(f.frame);
  expect(info.GetParaPortion()).toBeUndefined();
  expect(info.GetTextStart()).toBe(0);
  expect(
    /** Constructs only to check missing-native-paragraph rejection. @returns Iterator. */ () =>
      new SwTextCursor(f.frame, f.info),
  ).toThrow("SwTextIter requires the original formatted paragraph.");
});

it("native previous search traverses original intermediate links and inherits actual character hints", /** Checks original four-line search and native attribute owner without mocked iteration. @returns Nothing. */ () => {
  const f = fixture([
    { start: 0, end: 2, height: 10 },
    { start: 2, end: 4, height: 20 },
    { start: 4, end: 6, height: 30 },
    { start: 6, end: 9, height: 40 },
  ]);
  const set = new SfxItemSet(f.doc.GetAttrPool(), [[1, 200]]);
  set.Put(new SvxWeightItem(8, 15));
  f.node.GetOrCreateSwpHints().Insert(new SwTextAttrEnd(new SwFormatAutoFormat(set), 2, 6));
  const iter = new SwTextCursor(f.frame, f.info),
    second = f.para?.GetNext(),
    third = second?.GetNext();
  expect(iter.MaybeHasHints()).toBe(true);
  iter.Seek(3);
  expect((iter.GetAttrHandler().ReadItem(15) as SvxWeightItem).GetWeight()).toBe(8);
  expect(iter.GetNextAttr()).toBe(6);
  iter.CharToLine(8);
  expect(iter.GetStart()).toBe(6);
  expect(iter.Prev()).toBe(third);
  expect(iter.GetPrev()).toBe(second);
  expect(iter.GetPrev()).toBe(second);
  expect(iter.GetStart()).toBe(4);
  expect(iter.Y()).toBe(30);
  iter.Seek(7);
  expect((iter.GetAttrHandler().ReadItem(15) as SvxWeightItem).GetWeight()).toBe(5);
  expect(iter.GetNextAttr()).toBe(9);
});

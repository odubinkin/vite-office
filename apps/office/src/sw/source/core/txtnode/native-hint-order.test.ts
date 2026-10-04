/** @fileoverview Checks literal native start/end/Which order through real text, copy, cut and undo owners. */
import { describe, expect, it } from "vitest";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwDoc } from "../doc/doc";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwpHints } from "./ndhints";
import { SwFormatAutoFormat, SwTextAttr } from "./txatbase";
import { SwFormatINetFormat } from "./fmtatr2";
import { projectWriterTextRuns } from "./ndtxt";
const masks = [0, 1, 2, 3, 4, 5, 6, 7];
const boundaries = [
  { auto: [1, 4], link: [1, 4], order: [54, 53] },
  { auto: [0, 4], link: [1, 4], order: [53, 54] },
  { auto: [1, 5], link: [1, 4], order: [53, 54] },
  { auto: [1, 4], link: [1, 5], order: [54, 53] },
] as const;
/** Requires a real graph owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native hint order owner");
  return value;
}
/** Reads concrete type order without reproducing the native comparator. @param hints - Actual container. @returns Literal Which values. */
function order(hints: SwpHints): readonly number[] {
  return hints.entries().map(
    /** Reads one family identifier. @param hint - Actual attribute. @returns Which value. */
    (hint) => hint.Which(),
  );
}
/** Builds a concrete nonempty automatic handle. @param doc - Owner. @returns Format item. */
function automatic(doc: SwDoc): SwFormatAutoFormat {
  const set = new SfxItemSet(doc.GetAttrPool(), [[1, 49]]);
  set.Put(new SvxWeightItem(8, 15));
  return new SwFormatAutoFormat(set);
}
describe("native hint start map ordering", /** Registers source-independent literal order cases. @returns Nothing. */ () => {
  for (const boundary of boundaries)
    for (const reverse of [false, true])
      it.each(masks)(
        "orders " +
          boundary.order.join(",") +
          " with auto " +
          boundary.auto.join("..") +
          " link " +
          boundary.link.join("..") +
          " reversed=" +
          reverse +
          " mask=%s",
        /** Checks native tie direction and continued ownership through actual operations. @param mask - Flag combination. @returns Nothing. */ (
          mask,
        ) => {
          const doc = new SwDoc(),
            source = required(doc.paragraphs[0]),
            target = doc.GetNodes().MakeTextNode();
          source.SetText("abcdef");
          target.SetText("XY");
          const auto = new SwTextAttr(automatic(doc), boundary.auto[0], boundary.auto[1]),
            link = new SwTextAttr(
              new SwFormatINetFormat({ url: "https://example.test/order" }),
              boundary.link[0],
              boundary.link[1],
            );
          for (const hint of [auto, link]) {
            hint.dontExpand = Boolean(mask & 1);
            hint.dontExpandStart = Boolean(mask & 2);
            hint.dontMoveAttr = Boolean(mask & 4);
          }
          const input = new SwpHints(doc.GetAttrPool(), reverse ? [link, auto] : [auto, link]);
          expect(order(input)).toEqual(boundary.order);
          source.SetTextHints(input);
          const owned = required(source.GetpSwpHints()),
            actual = [...owned.entries()],
            snapshot = source.CaptureTextFragment(0, 6),
            copy = source.CloneTo(new SwDoc().GetNodes());
          expect(order(owned)).toEqual(boundary.order);
          expect(order(snapshot.hints)).toEqual(boundary.order);
          expect(order(required(copy.GetpSwpHints()))).toEqual(boundary.order);
          for (let i = 0; i < 2; i++) {
            expect(snapshot.hints.Get(i)).not.toBe(actual[i]);
            expect(required(copy.GetpSwpHints()).Get(i)).not.toBe(actual[i]);
            expect(snapshot.hints.Get(i)).toMatchObject({
              dontExpand: Boolean(mask & 1),
              dontExpandStart: Boolean(mask & 2),
              dontMoveAttr: Boolean(mask & 4),
            });
            expect(required(copy.GetpSwpHints()).Get(i)).toMatchObject({
              dontExpand: false,
              dontExpandStart: false,
              dontMoveAttr: false,
            });
          }
          expect(
            projectWriterTextRuns(source).some(
              /** Finds the overlapping visible bold link portion. @param run - Projection portion. @returns Whether both formats coexist. */
              (run) => run.attributes.bold && run.hyperlink?.url === "https://example.test/order",
            ),
          ).toBe(true);
          const undo = doc.GetUndoManager().GetUndoNodes(),
            id = undo.RetainText(snapshot);
          expect(order(undo.GetText(id).hints)).toEqual(boundary.order);
          doc
            .GetDocumentContentOperationsManager()
            .MoveRange(
              new SwPaM(new SwPosition(source, 6), new SwPosition(source, 0)),
              new SwPosition(target, 1),
            );
          const moved = required(target.GetpSwpHints());
          expect(order(moved)).toEqual(boundary.order);
          expect(source.GetpSwpHints()).toBeUndefined();
          expect(owned.Count()).toBe(0);
          expect(target.GetText()).toBe("XabcdefY");
          for (let i = 0; i < 2; i++) {
            expect(moved.Get(i)).toBe(actual[i]);
            expect(moved.Get(i).format).toBe(actual[i]?.format);
            expect(moved.Get(i).start).toBe(snapshot.hints.Get(i).start + 1);
            expect(moved.Get(i).end).toBe(snapshot.hints.Get(i).end + 1);
          }
          expect(order(undo.GetText(id).hints)).toEqual(boundary.order);
          expect(undo.GetText(id).hints.Get(0)).not.toBe(moved.Get(0));
          undo.Release(id);
        },
      );
  it.each([
    { link: [0, 3], order: [53, 54] },
    { link: [0, 5], order: [54, 53] },
    { link: [1, 4], order: [53, 54] },
  ] as const)(
    "restores order after automatic portions merge beside $link",
    /** Checks end extension can change the already sorted prefix. @param boundary - Independent literal link range and resulting order. @returns Nothing. */ (
      boundary,
    ) => {
      const doc = new SwDoc(),
        format = automatic(doc);
      const head = new SwTextAttr(format, 0, 2),
        tail = new SwTextAttr(format.Clone(), 2, 5),
        link = new SwTextAttr(
          new SwFormatINetFormat({ url: "https://example.test/merge-order" }),
          boundary.link[0],
          boundary.link[1],
        );
      const hints = new SwpHints(doc.GetAttrPool(), [tail, link, head]);
      expect(hints.Count()).toBe(2);
      expect(order(hints)).toEqual(boundary.order);
      const merged = required(
        hints.entries().find(
          /** Selects the merged automatic family. @param hint - Candidate. @returns Whether automatic. */
          (hint) => hint.Which() === 53,
        ),
      );
      expect(merged).toMatchObject({ start: 0, end: 5 });
      expect((merged.format as SwFormatAutoFormat).GetStyleHandle()).toBe(format.GetStyleHandle());
      expect(head.GetEnd()).toBe(2);
      expect(order(hints.clone())).toEqual(boundary.order);
    },
  );
});

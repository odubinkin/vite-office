/** @fileoverview Compares real Writer nodes, caches and notifications against unchanged pinned native attribute handlers. */
import { expect, it } from "vitest";
import { isDeepStrictEqual } from "node:util";
import cases from "../../../../test/writer-native-attributes.json";
import { SwDoc } from "../doc/doc";
import type { SwNodeNum } from "../SwNumberTree/SwNodeNum";
import { SwTextFormatColl } from "../doc/fmtcol";
import { SwNumRuleItem } from "../para/paratr";
import { SwNumRuleType } from "../doc/number";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item, SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";

/** Requires a real native fixture member. @param value - Candidate. @returns Present fixture member. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native fixture member");
  return value;
}

it("matches unchanged native pre/post handlers before validating counter reads", /** Verifies2130 real states and exact native notification order across60 sequences. @returns Nothing. */ () => {
  let states = 0;
  for (const [index, test] of cases.entries()) {
    const doc = new SwDoc(false);
    const rules = ["Counters", "Bullets", "Outline"].map(
      /** Builds a real document numbering rule. @param name - Rule identity. @param i - Marker family position. @returns Owned rule. */ (
        name,
        i,
      ) => doc.EnsureNumRule(name, i === 1 ? "bullet" : "numbered"),
    );
    required(rules[2]).SetRuleType(SwNumRuleType.OUTLINE_RULE);
    const styles = Array.from(
      { length: 3 },
      /** Builds a real collection for the native fixture. @param _unused - Placeholder. @param i - Collection position. @returns Collection. */ (
        _,
        i,
      ) => new SwTextFormatColl(doc.GetAttrPool(), `audit-${i}`, `Audit ${i}`),
    );
    required(styles[1]).SetFormatAttr(new SwNumRuleItem("Counters"));
    required(styles[2]).AssignToListLevelOfOutlineStyle(2);
    required(styles[2]).SetFormatAttr(new SwNumRuleItem("Outline"));
    const nodes = doc.GetNodes();
    const texts = Array.from(
      { length: test.count },
      /** Inserts a native fixture paragraph. @returns Connected node. */ () => {
        const node = nodes.MakeTextNode();
        node.ChgFormatColl(required(styles[0]));
        return node;
      },
    );
    let pendingStyle: number | undefined;
    const events: number[] = [];
    const notify = doc.NotifyModelChange.bind(doc);
    doc.NotifyModelChange =
      /** Captures native order without reading counters. @param hint - Model hint. @returns Nothing. */ (
        hint,
      ) => {
        if (hint.kind === "numbering-changed")
          events.push(
            texts.findIndex(
              /** Finds the notified real paragraph. @param n - Candidate. @returns Whether matching. */ (
                n,
              ) => n.GetIndex() === hint.nodeIndex,
            ),
          );
        notify(hint);
        if (hint.kind === "attribute-set-changed" && pendingStyle !== undefined) {
          const value = pendingStyle;
          pendingStyle = undefined;
          required(
            texts.find(
              /** Finds the directly mutated paragraph during the callback. @param n - Candidate. @returns Whether matching. */
              (n) => n.GetIndex() === hint.nodeIndex,
            ),
          ).ChgFormatColl(required(styles[value]));
        }
      };
    const snapshots = [];
    for (const [step, op] of test.ops.entries()) {
      const [kind, at, value] = op as [number, number, number];
      const node = required(texts[at]);
      events.splice(0);
      if (kind === 19) doc.SetInReading(!!value);
      if (kind === 18) {
        pendingStyle = value;
        node.SetAttrOutlineLevel(4);
      }
      if (kind === 16)
        for (let i = 0; i < 10; i++) required(rules[0]).GetNumFormat(i).SetStart(value);
      if (kind === 17) node.SetAttr(new SwNumRuleItem("unknown"));
      if (kind === 0) node.ChgFormatColl(required(styles[value]));
      if (kind === 1)
        node.SetAttr(new SwNumRuleItem(required(["", "Counters", "Bullets", "Outline"][value])));
      if (kind === 2) node.SetAttrListLevel(value);
      if (kind === 3) node.SetAttr(new SfxStringItem(83, value ? "Retained" : ""));
      if (kind === 4) node.SetAttr(new SfxBoolItem(85, !!value));
      if (kind === 5) node.SetAttr(new SfxBoolItem(87, !!value));
      if (kind === 6) node.SetAttrOutlineLevel(value);
      if (kind === 7) node.ResetAttr(value);
      if (kind === 8) node.SetAttr(new SfxInt16Item(86, value));
      if (kind === 9) node.ResetAllAttr();
      if (kind === 10) {
        const set = new SfxItemSet(doc.GetAttrPool(), [[1, 87]]);
        set.Put(new SfxInt16Item(84, value));
        set.Put(new SfxBoolItem(85, true));
        set.Put(new SfxInt16Item(86, 7));
        set.Put(new SfxBoolItem(87, false));
        node.SetAttr(set);
      }
      if (kind === 11) node.ResetAttr([84, 86, 85, 87]);
      if (kind === 12) node.ResetAttr(84, 87);
      if (kind === 13) node.SetEmptyListStyleDueToSetOutlineLevelAttr();
      if (kind === 14) node.ResetEmptyListStyleDueToResetOutlineLevelAttr();
      if (kind === 15) {
        const set = new SfxItemSet(doc.GetAttrPool(), [[1, 87]]);
        set.Put(new SwNumRuleItem(value ? "Counters" : ""));
        set.Put(new SfxStringItem(83, "Retained"));
        set.Put(new SfxUInt16Item(80, 4));
        set.Put(new SfxInt16Item(84, 2));
        node.SetAttr(set);
      }
      const registry: SwNodeNum[] = [];
      doc.getIDocumentListItems().getNumItems(registry);
      const actual = {
        nodes: texts.map(
          /** Captures raw native state before vector reads. @param n - Paragraph. @returns State record. */ (
            n,
          ) => ({
            rule: n.GetNumRule()?.GetName() ?? "-",
            owned: n.GetNum()?.GetNumRule()?.GetName() ?? "-",
            level: n.GetAttrListLevel(),
            outline: n.GetAttrOutlineLevel(),
            empty: n.IsEmptyListStyleDueToSetOutlineLevelAttr(),
            id: n.GetListId() || "-",
            restart: n.IsListRestart(),
            counted: n.IsCountedInList(),
            start: n.GetActualListStartValue(),
            cached: n.GetNum()?.GetNumber(false) ?? -999,
            attrs: Object.fromEntries(
              (n.GetpSwAttrSet()?.entries() ?? []).map(
                /** Encodes retained direct item identity and value. @param i - Direct item. @returns Primitive item entry. */ (
                  i,
                ) => [
                  String(i.Which()),
                  i.QueryValue() === ""
                    ? "-"
                    : typeof i.QueryValue() === "boolean"
                      ? String(Number(i.QueryValue()))
                      : String(i.QueryValue()),
                ],
              ),
            ),
          }),
        ),
        events: [...events],
        outline: nodes
          .GetOutLineNds()
          .entries()
          .map(
            /** Projects document order independently of vectors. @param n - Paragraph. @returns Fixture index. */ (
              n,
            ) => texts.indexOf(n),
          ),
        rules: rules.map(
          /** Reads real insertion-ordered rule clients. @param r - Rule. @returns Client indexes. */ (
            r,
          ) => {
            const out: typeof texts = [];
            r.GetTextNodeList(out);
            return out.map(
              /** Projects document order independently of vectors. @param n - Paragraph. @returns Fixture index. */ (
                n,
              ) => texts.indexOf(n),
            );
          },
        ),
        registry: registry.map(
          /** Projects a registered shown number record. @param n - Record. @returns Fixture index. */ (
            n,
          ) => texts.indexOf(required(n.GetTextNode())),
        ),
      };
      for (const [i, n] of texts.entries())
        Object.assign(required(actual.nodes[i]), { vector: [...n.GetNumberVector()] });
      states += texts.length;
      snapshots.push(actual);
      if (!isDeepStrictEqual(actual, test.expected[step])) {
        throw new Error(
          `Native comparison mismatch at sequence ${index} step ${step}: ${JSON.stringify({ actual, expected: test.expected[step] })}`,
        );
      }
    }
  }
  expect(states).toBe(2130);
});

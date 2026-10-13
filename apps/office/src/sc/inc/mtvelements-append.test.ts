/** @fileoverview Complete genuine original SharedString/CellTextAttr append forwarding and positional-copy stream. */
import { expect, it } from "vitest";
import fixture from "../../external/mdds/include/mdds/multi_type_vector/soa/native-container-append-cases.json";
import { SharedString } from "../../svl/inc/sharedstring";
import { OUString } from "../../sal/inc/rtl/ustring";
import { CellTextAttr } from "./celltextattr";
import { SvtScriptType } from "../../svl/inc/languageoptions";
import {
  string_block as S,
  celltextattr_block as A,
  string_element_callbacks as C,
  celltextattr_element_callbacks as D,
  CellTextAttrStoreType,
} from "./mtvelements";
import { default_traits } from "../../external/mdds/include/mdds/multi_type_vector/util.ts";
import { element_block_funcs } from "../../external/mdds/include/mdds/multi_type_vector/block_funcs.ts";
import {
  multi_type_vector,
  empty_event_value_ops,
} from "../../external/mdds/include/mdds/multi_type_vector/soa/main.ts";
it("matches complete original Calc append and positional read stream", /** Replays complete real refcounts/metadata/independent value results through existing actual owners. @returns Nothing. */ () => {
  const lines = ["calc"],
    x = new OUString(new Uint16Array([65, 0]), 1),
    a = new SharedString(x),
    b = new SharedString(x);
  const Traits = { ...default_traits, block_funcs: element_block_funcs(S) },
    strings = new multi_type_vector(Traits, empty_event_value_ops);
  /** Complete original string caller state and each live value. @param label - Label. @returns Nothing. */
  function state(label: string): void {
    let line = `${label} ${x.pData.refCount} ${a.getData()?.buffer[0] ?? -1} ${b.getData()?.buffer[0] ?? -1} ${strings.size()} ${strings.block_size()}`;
    for (const it = strings.begin(), end = strings.end(); !it.equals(end); it.increment()) {
      const node = it.get();
      line += ` | ${node.position} ${node.size} ${node.type}`;
      if (node.data) {
        line += ` ${S.capacity(node.data)}`;
        for (
          const begin = S.cbegin(node.data), last = S.cend(node.data);
          !begin.equals(last);
          begin.advance(1)
        )
          line += ` ${begin.get().getData()?.buffer[0] ?? -1}`;
      }
    }
    lines.push(line);
  }
  strings.push_back(a, C);
  state("first");
  strings.push_back_move(b, C);
  state("same_move");
  strings.push_back_empty();
  state("empty_tail");
  strings.push_back_move(a, C);
  state("after_empty_move");
  const result = multi_type_vector.get(strings.position(0), S);
  lines.push(`position_result ${x.pData.refCount} ${result.getData()?.buffer[0]}`);
  result.dispose();
  state("after_position");
  strings.clear();
  state("cleared");
  const v = new CellTextAttr();
  v.mnTextWidth = 9;
  v.mnScriptType = SvtScriptType.LATIN;
  const attrs = new CellTextAttrStoreType();
  /** Complete original text metadata caller state. @param label - Label. @returns Nothing. */
  function attrstate(label: string): void {
    let line = `${label} ${attrs.size()} ${attrs.block_size()} ${v.mnTextWidth}:${v.mnScriptType}`;
    for (const it = attrs.begin(), end = attrs.end(); !it.equals(end); it.increment()) {
      const node = it.get();
      line += ` | ${node.position} ${node.size} ${node.type}`;
      if (node.data) {
        line += ` ${A.capacity(node.data)}`;
        for (
          const begin = A.cbegin(node.data), last = A.cend(node.data);
          !begin.equals(last);
          begin.advance(1)
        ) {
          const item = begin.get();
          line += ` ${item.mnTextWidth}:${item.mnScriptType}`;
        }
      }
    }
    lines.push(line);
  }
  attrs.push_back(v, D);
  attrstate("attr_first");
  v.mnTextWidth = 13;
  attrs.push_back_move(v, D);
  attrstate("attr_same_move");
  attrs.push_back_empty();
  attrs.push_back_move(v, D);
  attrstate("attr_after_empty_move");
  const attr_result = CellTextAttrStoreType.get(attrs.position(0), A);
  attr_result.mnTextWidth = 44;
  lines.push(`attr_position_result ${attr_result.mnTextWidth}:${attr_result.mnScriptType}`);
  attrstate("attr_independent");
  attrs.clear();
  attrstate("attr_cleared");
  attrs.dispose();
  strings.dispose();
  a.dispose();
  b.dispose();
  x.dispose();
  expect(lines.join("\n") + "\n").toBe(fixture.captures.calc);
});

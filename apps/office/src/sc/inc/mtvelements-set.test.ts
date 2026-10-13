/** @fileoverview Complete genuine original SharedString/CellTextAttr single-value writes, original blocks and positional-copy stream. */
import { expect, it } from "vitest";
import fixture from "../../external/mdds/include/mdds/multi_type_vector/soa/native-container-set-cases.json";
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
it("matches complete original Calc single-value write stream", /** Replays complete real refcounts/metadata/independent value results through existing actual owners. @returns Nothing. */ () => {
  const lines = ["calc"],
    x = new OUString(new Uint16Array([65, 0]), 1),
    a = new SharedString(x),
    b = new SharedString(x);
  const Traits = { ...default_traits, block_funcs: element_block_funcs(S) },
    strings = new multi_type_vector(Traits, empty_event_value_ops, 7);
  /** Complete original string caller state and each live value. @param label - Label. @returns Nothing. */
  function state(label: string): void {
    let line = `${label} ${x.pData.refCount} ${strings.size()} ${strings.block_size()}`;
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
  for (const row of [0, 6, 3, 3, 1, 5, 2, 4]) {
    const it = strings.set(strings.position(strings.size() - 1).first, row, row % 2 ? a : b, C),
      node = it.get();
    lines.push(`string_returned ${node.position} ${node.size} ${node.type}`);
    state("set");
  }
  const result = multi_type_vector.get(strings.position(0), S);
  lines.push(`result ${x.pData.refCount} ${result.getData()?.buffer[0]}`);
  result.dispose();
  state("after_result");
  strings.clear();
  state("clear");
  const v = new CellTextAttr();
  v.mnTextWidth = 9;
  v.mnScriptType = SvtScriptType.LATIN;
  const attrs = new CellTextAttrStoreType(7);
  /** Complete original text metadata caller state. @param label - Label. @returns Nothing. */
  function attrstate(label: string): void {
    let line = `${label} ${attrs.size()} ${attrs.block_size()}`;
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
  for (const row of [0, 6, 3, 3, 1, 5, 2, 4]) {
    v.mnTextWidth += 1;
    const it = attrs.set(row, v, D),
      node = it.get();
    lines.push(`attr_returned ${node.position} ${node.size} ${node.type}`);
    attrstate("set");
  }
  const attr_result = CellTextAttrStoreType.get(attrs.position(0), A);
  attr_result.mnTextWidth = 44;
  lines.push(`attr_result ${attr_result.mnTextWidth}:${attr_result.mnScriptType}`);
  attrstate("independent");
  attrs.clear();
  attrstate("clear");
  attrs.dispose();
  strings.dispose();
  a.dispose();
  b.dispose();
  x.dispose();
  expect(lines.join("\n") + "\n").toBe(fixture.captures.calc);
});

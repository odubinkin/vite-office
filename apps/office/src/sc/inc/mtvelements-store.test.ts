/** @fileoverview Whole original SharedString/CellTextAttr container reads using actual shared owners and exact Calc store traits. */
import { expect, it } from "vitest";
import fixture from "../../external/mdds/include/mdds/multi_type_vector/soa/native-container-value-cases.json";
import { SharedString } from "../../svl/inc/sharedstring";
import { OUString } from "../../sal/inc/rtl/ustring";
import { CellTextAttr } from "./celltextattr";
import { SvtScriptType } from "../../svl/inc/languageoptions";
import {
  string_block,
  celltextattr_block,
  string_element_callbacks as C,
  celltextattr_element_callbacks as D,
  string_value_type,
  celltextattr_value_type,
  CellTextAttrStoreType,
  CellTextAttrTraits,
} from "./mtvelements";
import {
  multi_type_vector,
  empty_event_value_ops,
} from "../../external/mdds/include/mdds/multi_type_vector/soa/main.ts";
import { default_traits } from "../../external/mdds/include/mdds/multi_type_vector/util.ts";
import { element_block_funcs } from "../../external/mdds/include/mdds/multi_type_vector/block_funcs.ts";
it("matches complete original string and text attribute container stream", /** Replays real value owners, native refcounts, output identity and independent result defaults. @returns Nothing. */ () => {
  const lines = ["calc"],
    x = new OUString(new Uint16Array([65, 0]), 1),
    value = new SharedString(x),
    out = new SharedString(x),
    output: [SharedString] = [out];
  const Traits = { ...default_traits, block_funcs: element_block_funcs(string_block) };
  const strings = new multi_type_vector(Traits, empty_event_value_ops, 2, C, value),
    empty = new multi_type_vector(Traits, empty_event_value_ops, 2);
  /** Complete original string caller state. @param label - Label. @returns Nothing. */
  function state(label: string): void {
    lines.push(
      `${label} ${x.pData.refCount} ${out.getData()?.buffer[0] ?? -1} ${strings.size()} ${strings.block_size()}`,
    );
  }
  state("fill");
  strings.get(0, C, output);
  state("output");
  const result = strings.get(1, C, string_value_type);
  lines.push(`result ${x.pData.refCount} ${result.getData()?.buffer[0]}`);
  result.dispose();
  state("after_result");
  empty.get(0, C, output);
  state("empty_output");
  const empty_result = empty.get(1, C, string_value_type);
  lines.push(`empty_result ${x.pData.refCount} ${empty_result.getData()?.buffer[0] ?? -1}`);
  empty_result.dispose();
  try {
    strings.get(2, C, string_value_type);
  } catch (error) {
    lines.push(`result_error ${(error as Error).message}`);
  }
  state("after_error");
  strings.clear();
  state("cleared");
  const v = new CellTextAttr();
  v.mnTextWidth = 9;
  v.mnScriptType = SvtScriptType.LATIN;
  const target = new CellTextAttr(),
    attr_output: [CellTextAttr] = [target];
  const attrs = new CellTextAttrStoreType(2, D, v),
    blank = new CellTextAttrStoreType(2);
  /** Complete text metadata owner and caller target state. @param label - Label. @returns Nothing. */
  function attrstate(label: string): void {
    let line = `${label} ${attrs.size()} ${attrs.block_size()}`;
    for (const it = attrs.begin(), end = attrs.end(); !it.equals(end); it.increment()) {
      const node = it.get();
      line += ` | ${node.position} ${node.size} ${node.type}`;
      if (node.data)
        for (
          const begin = celltextattr_block.cbegin(node.data),
            last = celltextattr_block.cend(node.data);
          !begin.equals(last);
          begin.advance(1)
        ) {
          const item = begin.get();
          line += ` ${item.mnTextWidth}:${item.mnScriptType}`;
        }
    }
    lines.push(`${line} ${target.mnTextWidth}:${target.mnScriptType}`);
  }
  attrstate("attr_fill");
  attrs.get(1, D, attr_output);
  attrstate("attr_output");
  const attr_result = attrs.get(0, D, celltextattr_value_type);
  attr_result.mnTextWidth = 44;
  lines.push(`attr_result ${attr_result.mnTextWidth}:${attr_result.mnScriptType}`);
  attrstate("attr_independent");
  blank.get(0, D, attr_output);
  attrstate("attr_empty_output");
  const attr_empty_result = blank.get(1, D, celltextattr_value_type);
  lines.push(
    `attr_empty_result ${attr_empty_result.mnTextWidth}:${attr_empty_result.mnScriptType}`,
  );
  const next = CellTextAttrStoreType.next_position(attrs.position(0));
  lines.push(`attr_next ${next.second}`);
  attrs.clear();
  attrstate("attr_cleared");
  expect(CellTextAttrStoreType.move).toBe(multi_type_vector.move);
  expect(attrs).toBeInstanceOf(multi_type_vector);
  expect(attrs.Traits).toBe(CellTextAttrTraits);
  expect(attr_output[0]).toBe(target);
  expect(output[0]).toBe(out);
  attrs.dispose();
  blank.dispose();
  strings.dispose();
  empty.dispose();
  out.dispose();
  value.dispose();
  x.dispose();
  expect(lines.join("\n") + "\n").toBe(fixture.captures.calc);
});

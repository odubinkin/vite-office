/** @fileoverview Complete genuine original Calc object callbacks over reused SharedString/CellTextAttr and actual mdds owners. */
import { expect, it } from "vitest";
import { SharedString } from "../../svl/inc/sharedstring";
import { OUString } from "../../sal/inc/rtl/ustring";
import { CellTextAttr } from "./celltextattr";
import { SvtScriptType } from "../../svl/inc/languageoptions";
import {
  string_block as S,
  celltextattr_block as A,
  string_element_callbacks as C,
  celltextattr_element_callbacks as D,
} from "./mtvelements";
import fixture from "../../external/mdds/include/mdds/multi_type_vector/native-element-callback-cases.json";
it("matches whole original Calc value callback stream", /** Replays actual output identity, by-value copies, rvalue append and forwarded real constructors against the complete native stream. @returns Nothing. */ () => {
  const lines = ["calc"],
    x = new OUString(new Uint16Array([65, 0]), 1),
    value = new SharedString(x),
    out = new SharedString(x),
    output: [SharedString] = [out];
  const b = C.mdds_mtv_create_new_block(2, value);
  /** Complete original string state. @param label - Label. @returns Nothing. */
  function strings(label: string): void {
    const store = b.store(),
      units: number[] = [];
    for (const it = store.begin(), end = store.end(); !it.equals(end); it.advance(1))
      units.push(it.get().getData()?.buffer[0] ?? -1);
    lines.push(
      `${label} ${store.size()} ${store.capacity()} ${x.pData.refCount}${units.length ? " " + units.join(" ") : ""} ${out.getData()?.buffer[0] ?? -1}`,
    );
  }
  strings("fill");
  C.mdds_mtv_get_empty_value(output);
  strings("empty");
  C.mdds_mtv_get_value(b, 0, output);
  strings("output");
  const result = S.get_value(b, 0);
  lines.push(`result ${x.pData.refCount} ${result.getData()?.buffer[0]}`);
  result.dispose();
  strings("after_result");
  C.mdds_mtv_append_value_move(b, out);
  strings("append_move");
  C.mdds_mtv_emplace_back_construct(
    b,
    value,
    /** Actual SharedString OUString const-reference constructor. @returns Constructed value. */ () =>
      new SharedString(x),
  );
  strings("emplace_args");
  C.mdds_mtv_emplace_back_construct(
    b,
    value,
    /** Actual default constructor pack. @returns Empty value. */ () => new SharedString(),
  );
  strings("emplace_default");
  S.delete_block(b);
  lines.push(`string_remaining ${x.pData.refCount}`);
  const v = new CellTextAttr();
  v.mnTextWidth = 9;
  v.mnScriptType = SvtScriptType.LATIN;
  const target = new CellTextAttr(),
    attrOutput: [CellTextAttr] = [target];
  const a = D.mdds_mtv_create_new_block(2, v);
  /** Complete original metadata state. @param label - Label. @returns Nothing. */
  function attrs(label: string): void {
    const store = a.store(),
      items: string[] = [];
    for (const it = store.begin(), end = store.end(); !it.equals(end); it.advance(1)) {
      const item = it.get();
      items.push(`${item.mnTextWidth}:${item.mnScriptType}`);
    }
    lines.push(
      `${label} ${store.size()} ${store.capacity()}${items.length ? " " + items.join(" ") : ""} ${target.mnTextWidth}:${target.mnScriptType}`,
    );
  }
  attrs("attr_fill");
  D.mdds_mtv_get_value(a, 0, attrOutput);
  attrs("attr_output");
  D.mdds_mtv_get_empty_value(attrOutput);
  attrs("attr_empty");
  const attrResult = A.get_value(a, 0);
  attrResult.mnTextWidth = 44;
  attrs("attr_independent");
  D.mdds_mtv_append_value_move(a, v);
  attrs("attr_append_move");
  D.mdds_mtv_emplace_back_construct(
    a,
    v,
    /** Actual metadata default constructor. @returns Metadata. */ () => new CellTextAttr(),
  );
  attrs("attr_emplace_default");
  A.delete_block(a);
  out.dispose();
  value.dispose();
  x.dispose();
  expect(output[0]).toBe(out);
  expect(attrOutput[0]).toBe(target);
  expect(lines.join("\n") + "\n").toBe(fixture.captures.calc);
});

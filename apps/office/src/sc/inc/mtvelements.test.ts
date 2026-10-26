/** @fileoverview Compares complete original Calc string and text-attribute block observations while reusing actual value owners. */
import { expect, it } from "vitest";
import { SharedString } from "../../svl/inc/sharedstring";
import { OUString } from "../../sal/inc/rtl/ustring";
import { CellTextAttr } from "./celltextattr";
import { SvtScriptType } from "../../svl/inc/languageoptions";
import { string_block as S, celltextattr_block as A, edittext_block } from "./mtvelements";
import { EditTextObjectImpl, TextRotation } from "../../editeng/inc/editobj";
import { MapUnit } from "../../tools/inc/mapunit";
import fixture from "../../external/mdds/include/mdds/multi_type_vector/native-object-value-cases.json";

it("clones native managed rich-text blocks into independent EditTextObject owners", /** Checks the Calc copy constructor specialization and both managed destruction paths. @returns Nothing. */ () => {
  const edit = new EditTextObjectImpl(
    null,
    MapUnit.Map100thMM,
    false,
    TextRotation.NONE,
    SvtScriptType.LATIN,
  );
  const value = new OUString(new Uint16Array([65]), 1);
  edit.CreateAndInsertContent().SetText(value);
  value.dispose();
  const original = edittext_block.create_block(1);
  edittext_block.set_value(original, 0, edit);
  const clone = edittext_block.clone_block(original);
  const copied = edittext_block.begin(clone).get();
  try {
    expect(copied).not.toBe(edit);
    expect(copied?.GetParagraphCount()).toBe(1);
    expect(copied?.GetText(0).getStr()[0]).toBe(65);
    edit.CreateAndInsertContent();
    expect(edit.GetParagraphCount()).toBe(2);
    expect(copied?.GetParagraphCount()).toBe(1);
  } finally {
    edittext_block.delete_block(original);
    edittext_block.delete_block(clone);
  }
  expect(edit.GetParagraphCount()).toBe(0);
  expect(copied?.GetParagraphCount()).toBe(0);
});
it("matches whole original Calc object value block stream", /** Compares actual string refcounts and independent native metadata through every captured operation. @returns Nothing. */ () => {
  const lines = ["calc"];
  const x = new OUString(new Uint16Array([65, 0]), 1);
  const s = new SharedString(x);
  /** Native string value snapshot including actual shared refcounts. @param label - Native label. @param block - Actual block. @returns Nothing. */
  function strings(label: string, block: InstanceType<typeof S>): void {
    const store = block.store();
    const values: string[] = [];
    for (const it = store.begin(), end = store.end(); !it.equals(end); it.advance(1)) {
      const value = it.get(),
        data = value.getData(),
        folded = value.getDataIgnoreCase();
      values.push(
        `${data ? data.buffer[0] : -1}:${data ? data.refCount : 0}:${folded ? folded.refCount : 0}`,
      );
    }
    lines.push(
      `${label} ${store.size()} ${store.capacity()} ${x.pData.refCount}${values.length ? " " + values.join(" ") : ""}`,
    );
  }
  /** Complete native metadata snapshot. @param label - Native label. @param block - Actual block. @returns Nothing. */
  function attrs(label: string, block: InstanceType<typeof A>): void {
    const store = block.store(),
      values: string[] = [];
    for (const it = store.begin(), end = store.end(); !it.equals(end); it.advance(1)) {
      const value = it.get();
      values.push(`${value.mnTextWidth}:${value.mnScriptType}`);
    }
    lines.push(
      `${label} ${store.size()} ${store.capacity()}${values.length ? " " + values.join(" ") : ""}`,
    );
  }
  const d = S.create_block(2);
  strings("string_default", d);
  const f = S.create_block_with_value(3, s);
  strings("string_fill", f);
  S.erase_value(f, 0);
  strings("string_hidden", f);
  const c = S.copy_block(f);
  strings("string_copy", c);
  S.set_value(d, 0, s);
  strings("string_set", d);
  S.append_value(d, d.store().get(0));
  strings("string_alias_append", d);
  S.reserve(f, 0);
  strings("string_clear_hidden", f);
  S.resize_block(d, 1);
  strings("string_resize", d);
  lines.push(`string_equal ${Number(S.equal_block(f, c))}`);
  S.delete_block(c);
  S.delete_block(f);
  S.delete_block(d);
  lines.push(`string_remaining ${x.pData.refCount}`);
  const v = new CellTextAttr();
  v.mnTextWidth = 9;
  v.mnScriptType = SvtScriptType.LATIN;
  const a = A.create_block(2);
  attrs("attr_default", a);
  const b = A.create_block_with_value(3, v);
  attrs("attr_fill", b);
  A.set_value(a, 0, v);
  v.mnTextWidth = 44;
  attrs("attr_independent", a);
  A.erase_value(b, 0);
  const copy = A.copy_block(b);
  attrs("attr_copy_hidden", copy);
  A.resize_block(a, 4);
  attrs("attr_grow", a);
  A.reserve(b, 0);
  attrs("attr_clear_hidden", b);
  A.swap_values(a, b, 0, 0, 1);
  attrs("attr_swap_a", a);
  attrs("attr_swap_b", b);
  A.delete_block(copy);
  A.delete_block(b);
  A.delete_block(a);
  s.dispose();
  x.dispose();
  expect(lines.join("\n") + "\n").toBe(fixture.captures.calc);
});

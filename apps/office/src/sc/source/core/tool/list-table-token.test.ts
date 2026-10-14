/** @fileoverview Complete original list and structured-reference token replay with genuine existing owners and ordinary refs. */
import { gunzipSync } from "node:zlib";
import { expect, it } from "vitest";
import { ScRefListToken, ScTableRefToken, ScSingleRefToken } from "../../../inc/token";
import { ScComplexRefData, ScSingleRefData } from "../../../inc/refdata";
import { ScSheetLimits } from "../../../inc/sheetlimits";
import { FormulaToken, FormulaDoubleToken, StackVar } from "../../../../formula/inc/token";
import fixture from "./native-list-table-token-cases.json";
it("matches complete original list and table reference token state and alias histories", /** Replays original initialized public operations and full native output. @returns Nothing. */ () => {
  const lines: string[] = [],
    number = new FormulaDoubleToken(2.5),
    otherNumber = new FormulaDoubleToken(4.5),
    equalNumber = new FormulaDoubleToken(2.5),
    limits = new ScSheetLimits(20, 30),
    ref = new ScComplexRefData();
  ref.InitRange(1, 2, 3, 4, 5, 6);
  /** Encodes exact native IEEE bits. @param value - Double. @returns Unsigned bits. */
  function bits(value: number): string {
    const d = new DataView(new ArrayBuffer(8));
    d.setFloat64(0, value, true);
    return d.getBigUint64(0, true).toString();
  }
  /** Records public reference data. @param a - Initialized range. @returns State suffix. */
  function data(a: ScComplexRefData): string {
    return ` ${a.Ref1.Col()} ${a.Ref1.Row()} ${a.Ref1.Tab()} ${a.Ref1.FlagValue()} ${a.Ref2.Col()} ${a.Ref2.Row()} ${a.Ref2.Tab()} ${a.Ref2.FlagValue()} ${Number(a.bTrimToData)}`;
  }
  /** Records original token state and live area identity. @param label - Stage. @param a - List/table token. @param expected - Expected original area. @returns Nothing. */
  function state(
    label: string,
    a: ScRefListToken | ScTableRefToken,
    expected: FormulaToken | null = null,
  ): void {
    let line = `${label} ${a.GetType()} ${a.GetOpCode()}`;
    if (a instanceof ScRefListToken) {
      line += ` ${Number(a.IsArrayResult())} ${a.GetRefList().length}`;
      for (const r of a.GetRefList()) line += data(r);
    } else {
      const area = a.GetAreaRefRPN();
      line += ` ${a.GetIndex()} ${a.GetItem()} ${Number(area === expected)} ${area ? area.GetType() : -1}`;
      if (area && area.GetType() === StackVar.svDouble)
        line += ` ${bits((area as FormulaDoubleToken).GetDouble())}`;
      if (area && area.GetType() === StackVar.svRefList) {
        const r = area as ScRefListToken;
        line += ` ${Number(r.IsArrayResult())} ${r.GetRefList().length}`;
      }
    }
    lines.push(line);
  }
  /** Records both directions of original value/text equality. @param label - Stage. @param a - Left token. @param b - Right token. @returns Nothing. */
  function compare(label: string, a: FormulaToken, b: FormulaToken): void {
    lines.push(
      `${label} ${Number(a.equals(b))} ${Number(a.TextEqual(b))} ${Number(b.equals(a))} ${Number(b.TextEqual(a))}`,
    );
  }
  const defaultList = new ScRefListToken();
  state("defaultlist", defaultList);
  for (const flag of [false, true])
    for (let size = 0; size < 4; ++size) {
      const a = new ScRefListToken(flag);
      for (let i = 0; i < size; ++i) {
        ref.InitRange(i, i + 1, i + 2, i + 3, i + 4, i + 5);
        ref.bTrimToData = (i & 1) !== 0;
        a.GetRefList().push(new ScComplexRefData(ref));
      }
      const copy = new ScRefListToken(a),
        cl = a.Clone();
      state("list", a);
      state("listcopy", copy);
      state("listclone", cl);
      compare("listself", a, a);
      compare("listequal", a, copy);
      compare("listcloneequal", a, cl);
      compare("listbase", a, number);
      const member = a.GetRefList(),
        element = size ? member[0] : null,
        moved = ScRefListToken.move(a);
      state("listmoved", moved);
      state("listsource", a);
      lines.push(
        `listidentity ${Number(member === a.GetRefList())} ${Number(member !== moved.GetRefList())} ${Number(size ? element === moved.GetRefList()[0] : true)}`,
      );
      if (size) {
        (moved.GetRefList()[0] as ScComplexRefData).Ref1.InitAddress(9, 10, 11);
        state("listchanged", moved);
        state("listcopyretained", copy);
        (cl.GetRefList().at(-1) as ScComplexRefData).Ref2.InitAddress(12, 13, 14);
        state("listclonechanged", cl);
      }
      ref.InitRange(2, 3, 4, 5, 6, 7);
      a.GetRefList().push(new ScComplexRefData(ref));
      state("listsourceappend", a);
      moved.GetRefList().length = 0;
      state("listcleared", moved);
    }
  const list = new ScRefListToken(true);
  list.GetRefList().push(new ScComplexRefData(ref));
  const sr = new ScSingleRefData();
  sr.InitAddress(1, 2, 3);
  const single = new ScSingleRefToken(limits, sr),
    items = ScTableRefToken.Item;
  for (const index of [-65537, -1, 0, 1, 65535, 65536])
    for (const item of [
      items.TABLE,
      items.ALL,
      items.HEADERS,
      items.DATA,
      items.TOTALS,
      items.THIS_ROW,
      items.HEADERS_DATA,
      items.DATA_TOTALS,
    ])
      for (const area of [null, number, list, single]) {
        const a = new ScTableRefToken(index, item);
        a.SetAreaRefRPN(area);
        const copy = new ScTableRefToken(a),
          cl = a.Clone();
        state("table", a, area);
        state("tablecopy", copy, area);
        state("tableclone", cl, area);
        compare("tableself", a, a);
        compare("tablecopyequal", a, copy);
        compare("tablecloneequal", a, cl);
        compare("tablebase", a, number);
        const di = new ScTableRefToken(index + 1, item),
          dit = new ScTableRefToken(index, item ^ 16),
          da = new ScTableRefToken(index, item);
        di.SetAreaRefRPN(area);
        dit.SetAreaRefRPN(area);
        da.SetAreaRefRPN(area ? null : number);
        compare("tableindex", a, di);
        compare("tableitem", a, dit);
        compare("tablenullarea", a, da);
        const left = new ScTableRefToken(index, item),
          right = new ScTableRefToken(index, item);
        left.SetAreaRefRPN(number);
        right.SetAreaRefRPN(otherNumber);
        compare("tableareaunequal", left, right);
        right.SetAreaRefRPN(equalNumber);
        compare("tableareaequal", left, right);
        for (const added of [items.HEADERS, items.DATA, items.TOTALS, items.THIS_ROW])
          a.AddItem(added);
        a.SetIndex(index + 1);
        state("tablechanged", a, area);
        state("tablecopyretained", copy, area);
        a.SetAreaRefRPN(null);
        state("tablecleared", a);
      }
  const aliased = new ScTableRefToken(2, items.DATA);
  aliased.SetAreaRefRPN(number);
  const independent = new ScTableRefToken(aliased),
    cloned = aliased.Clone();
  number.SetDouble(9.5);
  state("tablealiaschanged", aliased, number);
  state("tableindependent", independent, number);
  state("tableindependentclone", cloned, number);
  expect(lines.join("\n") + "\n").toBe(
    gunzipSync(Buffer.from(fixture.captures.results.gzipBase64, "base64")).toString("utf8"),
  );
});

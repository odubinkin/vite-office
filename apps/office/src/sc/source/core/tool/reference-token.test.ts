/** @fileoverview Complete initialized native reference-token histories with real shared formula/data/bounds owners; no raw ownership observations. */
import { gunzipSync } from "node:zlib";
import { expect, it } from "vitest";
import { ScSingleRefToken, ScDoubleRefToken } from "../../../inc/token";
import { ScSingleRefData, ScComplexRefData } from "../../../inc/refdata";
import { ScSheetLimits } from "../../../inc/sheetlimits";
import { FormulaToken, FormulaDoubleToken } from "../../../../formula/inc/token";
import { OpCode } from "../../../../formula/inc/opcode";
import fixture from "./native-reference-token-cases.json";

it("matches complete original reference-token copy, mutation, flags and text comparisons", /** Replays original initialized genuine-derived-type operations. @returns Nothing. */ () => {
  const lines: string[] = [],
    limits = new ScSheetLimits(20, 30),
    small = new ScSheetLimits(1, 1),
    number = new FormulaDoubleToken(2.5);
  /** Initializes raw coordinates before setting every original flag. @param c - Column. @param r - Row. @param t - Sheet. @param f - Flags. @returns Initialized data. */
  function reference(c: number, r: number, t: number, f: number): ScSingleRefData {
    const a = new ScSingleRefData();
    a.InitAddress(c, r, t);
    a.SetColRel((f & 1) !== 0);
    a.SetColDeleted((f & 2) !== 0);
    a.SetRowRel((f & 4) !== 0);
    a.SetRowDeleted((f & 8) !== 0);
    a.SetTabRel((f & 16) !== 0);
    a.SetTabDeleted((f & 32) !== 0);
    a.SetFlag3D((f & 64) !== 0);
    a.SetRelName((f & 128) !== 0);
    return a;
  }
  /** Reads raw initialized coordinates through a copied public reference. @param a - Data. @returns Native observation suffix. */
  function data(a: ScSingleRefData): string {
    const b = new ScSingleRefData(a);
    b.SetColDeleted(false);
    b.SetRowDeleted(false);
    b.SetTabDeleted(false);
    return ` ${b.Col()} ${b.Row()} ${b.Tab()} ${a.FlagValue()}`;
  }
  /** Records complete original member state. @param label - Stage. @param a - Token. @returns Nothing. */
  function state(label: string, a: ScSingleRefToken | ScDoubleRefToken): void {
    let line = `${label} ${a.GetType()} ${a.GetOpCode()}` + data(a.GetSingleRef());
    if (a instanceof ScDoubleRefToken)
      line += data(a.GetSingleRef2()) + ` ${Number(a.GetDoubleRef().bTrimToData)}`;
    lines.push(line);
  }
  /** Records both directions of value and text equality. @param label - Stage. @param a - Left genuine token. @param b - Right genuine token. @returns Nothing. */
  function compare(label: string, a: FormulaToken, b: FormulaToken): void {
    lines.push(
      `${label} ${Number(a.equals(b))} ${Number(a.TextEqual(b))} ${Number(b.equals(a))} ${Number(b.TextEqual(a))}`,
    );
  }
  for (let f = 0; f < 256; ++f)
    for (const coords of [
      [-1, -1, -1],
      [0, 0, 0],
      [4, 5, 3],
      [100, 200, 10000],
    ] as const)
      for (const op of [OpCode.ocPush, OpCode.ocColRowName]) {
        const a = reference(coords[0], coords[1], coords[2], f),
          original = new ScSingleRefData(a),
          s = new ScSingleRefToken(limits, a, op),
          copy = new ScSingleRefToken(s),
          sc = s.Clone() as ScSingleRefToken;
        state("single", s);
        state("singlecopy", copy);
        state("singleclone", sc);
        compare("singleequal", s, copy);
        compare("singlecloneequal", s, sc);
        compare("singlebase", s, number);
        const different = reference(coords[0], coords[1] + 1, coords[2], f),
          ds = new ScSingleRefToken(limits, different, op),
          fs = new ScSingleRefToken(limits, reference(coords[0], coords[1], coords[2], f ^ 64), op),
          os = new ScSingleRefToken(
            limits,
            original,
            op === OpCode.ocPush ? OpCode.ocColRowName : OpCode.ocPush,
          );
        compare("singlecoords", s, ds);
        compare("singleflags", s, fs);
        compare("singleopcode", s, os);
        a.InitAddress(8, 9, 10);
        state("singleinput", s);
        const member = s.GetSingleRef();
        s.GetSingleRef().InitAddress(11, 12, 13);
        state("singlemutated", s);
        state("singlecopyretained", copy);
        sc.GetSingleRef().InitAddress(14, 15, 16);
        state("singleclonemutated", sc);
        lines.push(
          `singleidentity ${Number(s.GetSingleRef() === member)} ${Number(copy.GetSingleRef() !== member)} ${Number(sc.GetSingleRef() !== member)}`,
        );
        const range = new ScComplexRefData();
        range.Ref1.assign(original);
        range.Ref2.assign(different);
        range.bTrimToData = (f & 1) !== 0;
        const d = new ScDoubleRefToken(limits, range, op),
          dc = new ScDoubleRefToken(d),
          dcl = d.Clone() as ScDoubleRefToken;
        state("double", d);
        state("doublecopy", dc);
        state("doubleclone", dcl);
        compare("doubleequal", d, dc);
        compare("doublecloneequal", d, dcl);
        compare("doublebase", d, number);
        compare("doublekind", d, copy);
        let changed = new ScComplexRefData(range);
        changed.Ref1.assign(reference(coords[0] + 1, coords[1], coords[2], f));
        const dx = new ScDoubleRefToken(limits, changed, op);
        compare("doublecoords", d, dx);
        changed = new ScComplexRefData(range);
        changed.Ref1.assign(reference(coords[0], coords[1], coords[2], f ^ 64));
        const df = new ScDoubleRefToken(limits, changed, op);
        compare("doublefirstflags", d, df);
        changed = new ScComplexRefData(range);
        changed.Ref2.assign(reference(coords[0], coords[1] + 1, coords[2], f ^ 128));
        const d2 = new ScDoubleRefToken(limits, changed, op);
        compare("doublesecondflags", d, d2);
        changed = new ScComplexRefData(range);
        changed.bTrimToData = !changed.bTrimToData;
        const dt = new ScDoubleRefToken(limits, changed, op);
        compare("doubletrim", d, dt);
        const dop = new ScDoubleRefToken(
          limits,
          range,
          op === OpCode.ocPush ? OpCode.ocColRowName : OpCode.ocPush,
        );
        compare("doubleopcode", d, dop);
        range.InitRange(7, 8, 9, 10, 11, 12);
        state("doubleinput", d);
        const dm = d.GetDoubleRef();
        d.GetSingleRef().InitAddress(11, 12, 13);
        d.GetSingleRef2().InitAddress(14, 15, 16);
        state("doublemutated", d);
        state("doublecopyretained", dc);
        dcl.GetDoubleRef().InitRange(17, 18, 19, 20, 21, 22);
        state("doubleclonemutated", dcl);
        lines.push(
          `doubleidentity ${Number(d.GetDoubleRef() === dm)} ${Number(d.GetSingleRef() === dm.Ref1)} ${Number(d.GetSingleRef2() === dm.Ref2)} ${Number(dc.GetDoubleRef() !== dm)} ${Number(dcl.GetDoubleRef() !== dm)}`,
        );
      }
  const defaultSingle = new ScSingleRefToken(limits, reference(1, 2, 3, 0)),
    normal = new ScComplexRefData(),
    reversed = new ScComplexRefData();
  normal.InitRange(1, 2, 3, 4, 5, 6);
  reversed.InitRange(4, 5, 6, 1, 2, 3);
  const defaultDouble = new ScDoubleRefToken(limits, normal),
    reverse = new ScDoubleRefToken(limits, reversed);
  state("defaultsingle", defaultSingle);
  state("defaultdouble", defaultDouble);
  compare("normalized", defaultDouble, reverse);
  const left = new ScSingleRefToken(small, reference(4, 4, 0, 0)),
    right = new ScSingleRefToken(limits, reference(5, 5, 0, 0)),
    leftcopy = new ScSingleRefToken(left),
    lc = left.Clone();
  compare("bounds", left, right);
  compare("copybounds", leftcopy, right);
  compare("clonebounds", lc, right);
  expect(lines.join("\n") + "\n").toBe(
    gunzipSync(Buffer.from(fixture.captures.results.gzipBase64, "base64")).toString("utf8"),
  );
});

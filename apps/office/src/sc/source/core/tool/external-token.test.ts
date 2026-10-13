/** @fileoverview Complete actual external-token initialized copy/move/member histories, reusing shared string and reference owners. */
import { gunzipSync } from "node:zlib";
import { expect, it } from "vitest";
import {
  ScExternalSingleRefToken,
  ScExternalDoubleRefToken,
  ScExternalNameToken,
} from "../../../inc/token";
import { ScSingleRefData, ScComplexRefData } from "../../../inc/refdata";
import { FormulaToken, FormulaDoubleToken } from "../../../../formula/inc/token";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import fixture from "./native-external-token-cases.json";
it("matches complete original external reference and name token value and move stream", /** Replays initialized true external owners without raw count/address/ABI observations. @returns Nothing. */ () => {
  const lines: string[] = [],
    strings: SharedString[] = [],
    texts: OUString[] = [],
    tokens: FormulaToken[] = [],
    number = new FormulaDoubleToken(2.5);
  /** Constructs actual shared UTF16 values, including invalid/empty/embedded-NUL/folded forms. @param mode - Original case. @returns Owned shared value. */
  function name(mode: number): SharedString {
    let result: SharedString;
    if (mode === 0) result = new SharedString();
    else {
      const units =
          mode === 1
            ? []
            : mode === 2
              ? [83, 104, 101, 101, 116, 0, 79, 110, 101]
              : mode === 3
                ? [945, 55357, 56832]
                : [77, 105, 120, 101, 100],
        text = new OUString(new Uint16Array(units), units.length);
      texts.push(text);
      if (mode === 4) {
        const folded = new OUString(new Uint16Array([77, 73, 88, 69, 68]), 5);
        texts.push(folded);
        result = new SharedString(text.pData, folded.pData);
      } else result = new SharedString(text);
    }
    strings.push(result);
    return result;
  }
  /** Tracks actual scalar shared input owner. @param value - ASCII text. @returns Shared value. */
  function text(value: string): SharedString {
    const units = Uint16Array.from(
        value,
        /** Encodes one ASCII unit. @param c - Character. @returns Unit. */ (c) => c.charCodeAt(0),
      ),
      t = new OUString(units, units.length),
      s = new SharedString(t);
    texts.push(t);
    strings.push(s);
    return s;
  }
  /** Records actual shared original/folded content and null-state queries. @param s - Borrowed shared value. @returns Native state suffix. */
  function stringState(s: SharedStringConstReference): string {
    let line = ` ${Number(s.isValid())} ${Number(s.isEmpty())} ${s.getLength()} ${Number(s.getData() === null)} ${Number(s.getDataIgnoreCase() === null)}`;
    for (const v of [s.getString(), s.getIgnoreCaseString()]) {
      line += " |";
      for (let i = 0; i < v.getLength(); ++i) line += ` ${v.getStr()[i]}`;
    }
    return line;
  }
  /** Initializes actual raw values and all flags before use. @param f - Flags. @returns Refdata. */
  function reference(f: number): ScSingleRefData {
    const a = new ScSingleRefData();
    a.InitAddress(-1, 5, 3);
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
  /** Reads raw values through a copied public owner. @param a - Initialized data. @returns Native suffix. */
  function data(a: Readonly<ScSingleRefData>): string {
    const b = new ScSingleRefData(a);
    b.SetColDeleted(false);
    b.SetRowDeleted(false);
    b.SetTabDeleted(false);
    return ` ${b.Col()} ${b.Row()} ${b.Tab()} ${a.FlagValue()}`;
  }
  /** Records all actual member fields and queries. @param label - Stage. @param a - True external token. @returns Nothing. */
  function state(
    label: string,
    a: ScExternalSingleRefToken | ScExternalDoubleRefToken | ScExternalNameToken,
  ): void {
    let line = `${label} ${a.GetType()} ${a.GetOpCode()} ${a.GetFileId()}`;
    if (a instanceof ScExternalSingleRefToken)
      line += data(a.GetSingleRef()) + stringState(a.GetTableName());
    else if (a instanceof ScExternalDoubleRefToken)
      line +=
        data(a.GetSingleRef()) +
        data(a.GetSingleRef2()) +
        ` ${Number(a.GetDoubleRef().bTrimToData)}` +
        stringState(a.GetTableName());
    else line += stringState(a.GetName());
    lines.push(line);
  }
  /** Records both equality directions and inherited virtual text comparison. @param label - Stage. @param a - Left actual owner. @param b - Right actual owner. @returns Nothing. */
  function compare(label: string, a: FormulaToken, b: FormulaToken): void {
    lines.push(
      `${label} ${Number(a.equals(b))} ${Number(a.TextEqual(b))} ${Number(b.equals(a))} ${Number(b.TextEqual(a))}`,
    );
  }
  for (const id of [-65537, -1, 0, 1, 65535, 65536, 65537])
    for (let mode = 0; mode < 5; ++mode)
      for (const f of [0, 1, 2, 4, 8, 16, 32, 64, 128, 255]) {
        let input = name(mode);
        const ref = reference(f),
          range = new ScComplexRefData();
        range.Ref1.assign(ref);
        range.Ref2.assign(ref);
        range.Ref2.InitAddress(4, 6, 7);
        range.bTrimToData = (f & 1) !== 0;
        const a = new ScExternalSingleRefToken(id, input, ref),
          copy = new ScExternalSingleRefToken(a),
          cl = a.Clone();
        tokens.push(a, copy, cl);
        state("single", a);
        state("singlecopy", copy);
        state("singleclone", cl);
        compare("singleequal", a, copy);
        compare("singlecloneequal", a, cl);
        compare("singlebase", a, number);
        const file = new ScExternalSingleRefToken(id + 1, input, ref),
          different = new ScExternalSingleRefToken(id, name(2), reference(f ^ 128)),
          named = new ScExternalSingleRefToken(id, text("Other"), ref);
        tokens.push(file, different, named);
        compare("singlefile", a, file);
        compare("singledifferent", a, different);
        compare("singlename", a, named);
        const member = a.GetTableName(),
          refmember = a.GetSingleRef(),
          oldData = member.getData(),
          moved = ScExternalSingleRefToken.move(a);
        tokens.push(moved);
        state("singlemoved", moved);
        state("singlesource", a);
        lines.push(
          `singleidentity ${Number(member === a.GetTableName())} ${Number(member !== moved.GetTableName())} ${Number(oldData === moved.GetTableName().getData())} ${Number(refmember === a.GetSingleRef())} ${Number(refmember !== moved.GetSingleRef())}`,
        );
        input.assign(text("Changed"));
        ref.InitAddress(8, 9, 10);
        state("singleinputchanged", moved);
        copy.GetSingleRef().InitAddress(11, 12, 13);
        state("singlechanged", copy);
        state("singlecloneretained", cl);
        let rvalue = name(mode);
        const rv = new ScExternalSingleRefToken(id, rvalue, ref, SharedString.move);
        tokens.push(rv);
        state("singlervalue", rv);
        lines.push("singlervalueinput" + stringState(rvalue));
        input = name(mode);
        const d = new ScExternalDoubleRefToken(id, input, range),
          dc = new ScExternalDoubleRefToken(d),
          dcl = d.Clone();
        tokens.push(d, dc, dcl);
        state("double", d);
        state("doublecopy", dc);
        state("doubleclone", dcl);
        compare("doubleequal", d, dc);
        compare("doublecloneequal", d, dcl);
        compare("doublebase", d, number);
        compare("doublekind", d, copy);
        const df = new ScExternalDoubleRefToken(id + 1, input, range),
          dn = new ScExternalDoubleRefToken(id, text("Other"), range);
        tokens.push(df, dn);
        compare("doublefile", d, df);
        compare("doublename", d, dn);
        let changed = new ScComplexRefData(range);
        changed.Ref2.InitAddress(14, 15, 16);
        const dx = new ScExternalDoubleRefToken(id, input, changed);
        tokens.push(dx);
        compare("doubledata", d, dx);
        changed = new ScComplexRefData(range);
        changed.bTrimToData = !changed.bTrimToData;
        const trim = new ScExternalDoubleRefToken(id, input, changed);
        tokens.push(trim);
        compare("doubletrim", d, trim);
        const dm = d.GetDoubleRef(),
          sm = d.GetTableName(),
          oldDoubleData = sm.getData(),
          dmoved = ScExternalDoubleRefToken.move(d);
        tokens.push(dmoved);
        state("doublemoved", dmoved);
        state("doublesource", d);
        lines.push(
          `doubleidentity ${Number(dm === d.GetDoubleRef())} ${Number(dm !== dmoved.GetDoubleRef())} ${Number(dmoved.GetSingleRef() === dmoved.GetDoubleRef().Ref1)} ${Number(dmoved.GetSingleRef2() === dmoved.GetDoubleRef().Ref2)} ${Number(sm === d.GetTableName())} ${Number(sm !== dmoved.GetTableName())} ${Number(oldDoubleData === dmoved.GetTableName().getData())}`,
        );
        range.InitRange(8, 9, 10, 11, 12, 13);
        input.assign(text("Changed"));
        state("doubleinputchanged", dmoved);
        dc.GetDoubleRef().Ref2.InitAddress(17, 18, 19);
        state("doublechanged", dc);
        state("doublecloneretained", dcl);
        rvalue = name(mode);
        const drv = new ScExternalDoubleRefToken(id, rvalue, range, SharedString.move);
        tokens.push(drv);
        state("doublervalue", drv);
        lines.push("doublervalueinput" + stringState(rvalue));
        input = name(mode);
        const n = new ScExternalNameToken(id, input),
          nc = new ScExternalNameToken(n),
          ncl = n.Clone();
        tokens.push(n, nc, ncl);
        state("name", n);
        state("namecopy", nc);
        state("nameclone", ncl);
        compare("nameequal", n, nc);
        compare("namecloneequal", n, ncl);
        compare("namebase", n, number);
        compare("namekind", n, dmoved);
        const nf = new ScExternalNameToken(id + 1, input),
          nn = new ScExternalNameToken(id, text("Other"));
        tokens.push(nf, nn);
        compare("namefile", n, nf);
        compare("namedifferent", n, nn);
        const nm = n.GetName(),
          oldNameData = nm.getData(),
          nmoved = ScExternalNameToken.move(n);
        tokens.push(nmoved);
        state("namemoved", nmoved);
        state("namesource", n);
        lines.push(
          `nameidentity ${Number(nm === n.GetName())} ${Number(nm !== nmoved.GetName())} ${Number(oldNameData === nmoved.GetName().getData())}`,
        );
        input.assign(text("Changed"));
        state("nameinputchanged", nmoved);
        state("namecloneretained", ncl);
        rvalue = name(mode);
        const nrv = new ScExternalNameToken(id, rvalue, SharedString.move);
        tokens.push(nrv);
        state("namervalue", nrv);
        lines.push("namervalueinput" + stringState(rvalue));
      }
  expect(lines.join("\n") + "\n").toBe(
    gunzipSync(Buffer.from(fixture.captures.results.gzipBase64, "base64")).toString("utf8"),
  );
  for (const token of tokens) token.dispose();
  for (const value of strings) value.dispose();
  for (const value of texts) value.dispose();
});

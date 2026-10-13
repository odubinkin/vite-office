/** @fileoverview Full initialized original range-extension clone-path stream with genuine local/external/list owners and GC references. */
import { gunzipSync } from "node:zlib";
import { expect, it } from "vitest";
import {
  extendRangeReference,
  ScSingleRefToken,
  ScDoubleRefToken,
  ScRefListToken,
  ScExternalSingleRefToken,
  ScExternalDoubleRefToken,
  ScExternalNameToken,
} from "../../../inc/token";
import { ScSingleRefData, ScComplexRefData } from "../../../inc/refdata";
import { ScAddress } from "../../../inc/address";
import { ScSheetLimits } from "../../../inc/sheetlimits";
import { FormulaToken, FormulaDoubleToken, StackVar } from "../../../../formula/inc/token";
import { OpCode } from "../../../../formula/inc/opcode";
import { SharedString } from "../../../../svl/inc/sharedstring";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import fixture from "./native-range-extension-cases.json";
it("matches complete original range extension values and clone-path input histories", /** Replays actual initialized peer combinations; native unique-count optimization deliberately outside GC parity. @returns Nothing. */ () => {
  const lines: string[] = [],
    limits = new ScSheetLimits(20, 30),
    texts: OUString[] = [],
    strings: SharedString[] = [],
    owned: FormulaToken[] = [];
  /** Initializes native flags and raw bounded coordinates. @param seed - Position seed. @param f - Flags. @returns Data. */
  function reference(seed: number, f: number): ScSingleRefData {
    const a = new ScSingleRefData();
    a.InitAddress(seed * 2 - 3, seed * 3, seed - 1);
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
  /** Creates actual shared-string value for external metadata. @param value - ASCII name. @returns Shared value. */
  function name(value: string): SharedString {
    const units = Uint16Array.from(
        value,
        /** Encodes ASCII unit. @param c - Character. @returns Unit. */ (c) => c.charCodeAt(0),
      ),
      t = new OUString(units, units.length),
      s = new SharedString(t);
    texts.push(t);
    strings.push(s);
    return s;
  }
  /** Constructs only genuine original concrete token peers. @param kind - Original test family. @param seed - Coordinate seed. @param f - Flags. @returns Token. */
  function make(kind: number, seed: number, f: number): FormulaToken {
    const r = reference(seed, f),
      range = new ScComplexRefData();
    range.Ref1.assign(r);
    range.Ref2.assign(reference(seed + 1, f ^ 16));
    range.bTrimToData = (f & 1) !== 0;
    let result: FormulaToken;
    switch (kind) {
      case 0:
        result = new FormulaDoubleToken(2.5);
        break;
      case 1:
        result = new ScSingleRefToken(limits, r);
        break;
      case 2:
        result = new ScDoubleRefToken(limits, range, f & 4 ? OpCode.ocColRowName : OpCode.ocPush);
        break;
      case 3: {
        const list = new ScRefListToken((f & 128) !== 0);
        list.GetRefList().push(new ScComplexRefData(range));
        range.Ref1.assign(reference(seed + 2, f ^ 64));
        list.GetRefList().push(new ScComplexRefData(range));
        result = list;
        break;
      }
      case 4:
        result = new ScRefListToken();
        break;
      case 5:
        result = new ScExternalSingleRefToken(27, name("Sheet"), r);
        break;
      case 6:
        result = new ScExternalDoubleRefToken(27, name("Sheet"), range);
        break;
      case 7:
        result = new ScExternalNameToken(27, name("Name"));
        break;
      default:
        throw Error("Invalid fixture kind");
    }
    owned.push(result);
    return result;
  }
  /** Reads raw initialized coordinates without private mutation. @param a - Data. @returns Suffix. */
  function data(a: ScSingleRefData): string {
    const b = new ScSingleRefData(a);
    b.SetColDeleted(false);
    b.SetRowDeleted(false);
    b.SetTabDeleted(false);
    return ` ${b.Col()} ${b.Row()} ${b.Tab()} ${a.FlagValue()}`;
  }
  /** Records complete endpoint/trim data. @param a - Range. @returns Suffix. */
  function range(a: ScComplexRefData): string {
    return data(a.Ref1) + data(a.Ref2) + ` ${Number(a.bTrimToData)}`;
  }
  /** Records exact returned/input token state, including original file id. @param label - Stage. @param p - Actual token or null. @returns Nothing. */
  function state(label: string, p: FormulaToken | null): void {
    if (!p) {
      lines.push(label + " null");
      return;
    }
    let line = `${label} ${p.GetType()} ${p.GetOpCode()}`;
    switch (p.GetType()) {
      case StackVar.svSingleRef:
        line += data((p as ScSingleRefToken).GetSingleRef());
        break;
      case StackVar.svDoubleRef:
        line += range((p as ScDoubleRefToken).GetDoubleRef());
        break;
      case StackVar.svExternalSingleRef: {
        const r = p as ScExternalSingleRefToken;
        line += ` ${r.GetFileId()}` + data(r.GetSingleRef());
        break;
      }
      case StackVar.svExternalDoubleRef: {
        const r = p as ScExternalDoubleRefToken;
        line += ` ${r.GetFileId()}` + range(r.GetDoubleRef());
        break;
      }
      case StackVar.svRefList: {
        const v = (p as ScRefListToken).GetRefList();
        line += ` ${v.length}`;
        for (const r of v) line += range(r);
        break;
      }
      default:
        break;
    }
    lines.push(line);
  }
  for (let pos = 0; pos < 2; ++pos)
    for (let k1 = 0; k1 < 8; ++k1)
      for (let k2 = 0; k2 < 8; ++k2)
        for (const f1 of [0, 1, 4, 16, 64, 128, 255])
          for (const f2 of [0, 1, 4, 16, 64, 128, 255])
            for (const reuse of [false, true]) {
              const p = pos ? new ScAddress(2, 3, 1) : new ScAddress(),
                a = make(k1, 1, f1),
                b = make(k2, 2, f2),
                result = extendRangeReference(limits, a, b, p, reuse);
              if (result) owned.push(result);
              lines.push(`case ${pos} ${k1} ${k2} ${f1} ${f2} ${Number(reuse)}`);
              state("result", result);
              state("left", a);
              state("right", b);
              lines.push(`identity ${Number(result === a)} ${Number(result === b)}`);
            }
  expect(lines.join("\n") + "\n").toBe(
    gunzipSync(Buffer.from(fixture.captures.results.gzipBase64, "base64")).toString("utf8"),
  );
  for (const v of owned) v.dispose();
  for (const v of strings) v.dispose();
  for (const v of texts) v.dispose();
});

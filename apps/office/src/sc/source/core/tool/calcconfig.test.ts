/** @fileoverview Whole unchanged native ScCalcConfig instance stream comparison using real shared strings and sorted vectors. */
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { ScCalcConfig, ScRecalcOptions, ForceCalculationType } from "../../../inc/calcconfig";
import { FormulaGrammar, type AddressConvention } from "../../../../formula/inc/grammar";
import { OpCode } from "../../../../formula/inc/opcode";
import { SortedVector } from "../../../../o3tl/inc/sorted_vector";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import fixture from "./native-calc-config-cases.json";
/** Constructs a genuine shared ordered opcode set. @param values - Initialized opcodes. @returns Owner. */
function set(values: Iterable<number>): SortedVector<number> {
  const result = new SortedVector<number>(
    /** Original strict opcode ordering. @param left - First value. @param right - Second value. @returns Less flag. */ (
      left,
      right,
    ) => left < right,
  );
  for (const value of values) result.insert(value);
  return result;
}
/** Assigns original initialized UTF16 contents and releases only the temporary string value. @param config - Recipient. @param text - Contents. @returns Nothing. */
function device(config: ScCalcConfig, text: string): void {
  const units = Uint16Array.from(
    [...text].map(
      /** Encodes initialized UTF16 input. @param char - BMP unit. @returns Code unit. */ (char) =>
        char.charCodeAt(0),
    ),
  );
  const value = new OUString(units, units.length);
  config.maOpenCLDevice.assign(value);
  value.dispose();
}
it("matches complete original document calculation configuration stream", /** Replays complete original initialized field/copy/alias histories. @returns Nothing. */ () => {
  const lines: string[] = [];
  const owners: ScCalcConfig[] = [];
  /** Tracks original value owners for existing shared string cleanup. @param source - Optional copy. @returns Config. */
  function make(source?: ScCalcConfig): ScCalcConfig {
    const q = new ScCalcConfig(source);
    owners.push(q);
    return q;
  }
  /** Appends exact native initialized field contents. @param name - Stage. @param q - Owner. @returns Nothing. */
  function state(name: string, q: ScCalcConfig): void {
    const string = Array.from(q.maOpenCLDevice.getStr().slice(0, q.maOpenCLDevice.getLength()))
      .map(/** Emits one native UTF16 unit. @param u - Unit. @returns Field. */ (u) => u + ",")
      .join("");
    const codes = [...q.mpOpenCLSubsetOpCodes]
      .map(/** Emits one ordered opcode. @param op - Opcode. @returns Field. */ (op) => op + ",")
      .join("");
    lines.push(
      `${name} ${q.meStringRefAddressSyntax} ${q.meStringConversion} ${+q.mbEmptyStringAsZero} ${+q.mbHasStringRefSyntax} ${+q.mbOpenCLSubsetOnly} ${+q.mbOpenCLAutoSelect} ${q.mnOpenCLMinimumFormulaGroupSize} ${string} ${codes}`,
    );
  }
  lines.push(
    "enum " +
      [
        ...Object.values(ScRecalcOptions),
        ...Object.values(ForceCalculationType),
        ...Object.values(ScCalcConfig.StringConversion),
      ].join(" "),
  );
  lines.push(
    "grammar " +
      Object.values(FormulaGrammar.AddressConvention)
        .map(/** Emits original address enum. @param v - Value. @returns Field. */ (v) => v + ",")
        .join(""),
  );
  const a = make(),
    b = make();
  state("default", a);
  lines.push(`shared ${+(a.mpOpenCLSubsetOpCodes === b.mpOpenCLSubsetOpCodes)}`);
  for (const conv of Object.values(FormulaGrammar.AddressConvention)) {
    a.SetStringRefSyntax(conv);
    state("syntax", a);
  }
  a.reset();
  state("reset", a);
  a.meStringConversion = ScCalcConfig.StringConversion.ZERO;
  a.mbEmptyStringAsZero = true;
  a.SetStringRefSyntax(FormulaGrammar.AddressConvention.CONV_ODF);
  a.mbOpenCLSubsetOnly = false;
  a.mbOpenCLAutoSelect = false;
  a.mnOpenCLMinimumFormulaGroupSize = -2147483647;
  device(a, "GPU\0α");
  a.mpOpenCLSubsetOpCodes = set([OpCode.ocSum, OpCode.ocAdd, OpCode.ocSum, OpCode.ocDiv]);
  state("custom", a);
  const copy = make(a);
  state("copy", copy);
  lines.push(
    `copyeq ${+a.equals(copy)} ${+a.notEquals(copy)} ${+(a.mpOpenCLSubsetOpCodes === copy.mpOpenCLSubsetOpCodes)}`,
  );
  device(a, "changed");
  a.mpOpenCLSubsetOpCodes.insert(OpCode.ocMul);
  state("alias", copy);
  state("source", a);
  b.MergeDocumentSpecific(a);
  state("merge", b);
  b.MergeDocumentSpecific(b);
  state("selfmerge", b);
  b.copy_assign(a);
  state("assign", b);
  b.copy_assign(b);
  state("selfassign", b);
  b.setOpenCLConfigToDefault();
  state("partialdefault", b);
  b.reset();
  state("resetall", b);
  const pristine = make();
  for (let field = 0; field < 10; ++field) {
    const q = make(pristine);
    switch (field) {
      case 0:
        q.meStringRefAddressSyntax = FormulaGrammar.AddressConvention.CONV_ODF;
        break;
      case 1:
        q.meStringConversion = ScCalcConfig.StringConversion.ILLEGAL;
        break;
      case 2:
        q.mbEmptyStringAsZero = true;
        break;
      case 3:
        q.mbHasStringRefSyntax = true;
        break;
      case 4:
        q.mbOpenCLSubsetOnly = false;
        break;
      case 5:
        q.mbOpenCLAutoSelect = false;
        break;
      case 6:
        device(q, "gpu");
        break;
      case 7:
        q.mnOpenCLMinimumFormulaGroupSize = 101;
        break;
      case 8:
        q.mpOpenCLSubsetOpCodes = set([]);
        break;
      case 9:
        q.mpOpenCLSubsetOpCodes = set(pristine.mpOpenCLSubsetOpCodes);
        q.mpOpenCLSubsetOpCodes.erase_at(q.mpOpenCLSubsetOpCodes.find(OpCode.ocAdd));
        q.mpOpenCLSubsetOpCodes.insert(OpCode.ocOffset);
        break;
    }
    lines.push(`unequal ${field} ${+pristine.equals(q)} ${+pristine.notEquals(q)}`);
  }
  const equal = make(pristine);
  equal.mpOpenCLSubsetOpCodes = set(pristine.mpOpenCLSubsetOpCodes);
  lines.push(
    `equalset ${+pristine.equals(equal)} ${+(pristine.mpOpenCLSubsetOpCodes === equal.mpOpenCLSubsetOpCodes)}`,
  );
  pristine.mpOpenCLSubsetOpCodes.insert(OpCode.ocOffset);
  try {
    const later = make();
    state("mutateddefault", later);
    later.reset();
    state("mutatedreset", later);
    pristine.mpOpenCLSubsetOpCodes.erase_at(pristine.mpOpenCLSubsetOpCodes.find(OpCode.ocOffset));
    state("restoreddefault", later);
  } finally {
    const index = pristine.mpOpenCLSubsetOpCodes.find(OpCode.ocOffset);
    if (index !== -1) pristine.mpOpenCLSubsetOpCodes.erase_at(index);
    for (const q of owners) q.maOpenCLDevice.dispose();
  }
  const actual = lines.join("\n") + "\n";
  expect(Buffer.byteLength(fixture.output)).toBe(fixture.byteLength);
  expect(createHash("sha256").update(fixture.output).digest("hex")).toBe(fixture.sha256);
  expect(actual).toBe(fixture.output);
  const syntax: AddressConvention = FormulaGrammar.AddressConvention.CONV_ODF;
  expect(syntax).toBe(1);
});

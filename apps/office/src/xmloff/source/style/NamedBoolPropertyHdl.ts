/** @fileoverview Original XMLNamedBoolPropertyHdl exact named-bool import and unconditional export via cppu::any2bool, retaining native unchanged-on-invalid and exception contracts. */
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { any2bool } from "../../../comphelper/inc/extract";
import type { SvXMLUnitConverter } from "../core/xmluconv";

/** Native named boolean handler; constructor strings bind the existing XML lexical boundary. */
export class XMLNamedBoolPropertyHdl {
  /** Original true/false literal association. @param maTrueStr - True token. @param maFalseStr - False token. @returns Handler. */
  constructor(
    private readonly maTrueStr: string,
    private readonly maFalseStr: string,
  ) {}
  /** Native exact token comparison; failure leaves Any untouched. @param input - XML lexeme. @param value - Native Any. @param converter - Unused native converter. @returns Success. */
  importXML(input: string, value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    if (input === this.maTrueStr) {
      value.insert([true], "bool");
      return true;
    }
    if (input === this.maFalseStr) {
      value.insert([false], "bool");
      return true;
    }
    return false;
  }
  /** Original unconditional named export and typed any2bool failure. @param output - XML output. @param value - Native Any. @param converter - Unused native converter. @returns True or throws. */
  exportXML(output: [string], value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    output[0] = any2bool(value) ? this.maTrueStr : this.maFalseStr;
    return true;
  }
}

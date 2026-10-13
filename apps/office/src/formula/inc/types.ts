/** @fileoverview Original FormulaTokenRef and FormulaConstTokenRef typedef binding over the one generic intrusive pointer owner and actual formula ADL hooks. */
import { intrusive_ptr } from "../../external/boost/include/boost/smart_ptr/intrusive_ptr";
import {
  FormulaToken,
  intrusive_ptr_add_ref,
  intrusive_ptr_release,
} from "../source/core/api/token";

/** Original const FormulaToken view retains const reference-counting members and queries. */
export type FormulaTokenConstReference = Readonly<
  Pick<
    FormulaToken,
    | "GetType"
    | "IsFunction"
    | "IsExternalRef"
    | "IsRef"
    | "GetParamCount"
    | "IncRef"
    | "DecRef"
    | "GetRefCntPolicy"
    | "GetRef"
    | "GetOpCode"
    | "IsInForceArray"
    | "GetInForceArray"
    | "Clone"
    | "TextEqual"
    | "equals"
  >
>;

const tokenADL = { intrusive_ptr_add_ref, intrusive_ptr_release };

/** Original mutable typedef, with the erased pointee ADL bound once at its namespace. */
export class FormulaTokenRef extends intrusive_ptr<FormulaToken> {
  /** Original default/raw/copy pointer initialization. @param source - Original pointer value. @param add_ref - Raw-pointer acquisition flag. @returns Bound pointer owner. */
  constructor(source: FormulaToken | null | intrusive_ptr<FormulaToken> = null, add_ref = true) {
    super(
      tokenADL,
      source instanceof intrusive_ptr ? source.get() : source,
      source instanceof intrusive_ptr ? true : add_ref,
    );
  }
}

/** Original const typedef; lifetime hooks remain available because they are const in the original token owner. */
export class FormulaConstTokenRef extends intrusive_ptr<FormulaTokenConstReference> {
  /** Original default/raw/copy pointer initialization. @param source - Original const pointer value. @param add_ref - Raw-pointer acquisition flag. @returns Bound const pointer owner. */
  constructor(
    source: FormulaTokenConstReference | null | intrusive_ptr<FormulaTokenConstReference> = null,
    add_ref = true,
  ) {
    super(
      tokenADL,
      source instanceof intrusive_ptr ? source.get() : source,
      source instanceof intrusive_ptr ? true : add_ref,
    );
  }
}

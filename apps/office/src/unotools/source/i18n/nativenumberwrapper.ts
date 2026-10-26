/** @fileoverview NativeNumberWrapper's represented NATNUM0 forwarding path. */
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { NativeNumberSupplierService } from "../../../i18npool/source/nativenumber/nativenumbersupplier";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";

/** Source wrapper forwards to NativeNumberSupplier2 and catches UNO exceptions only. */
export class NativeNumberWrapper {
  private readonly supplier = new NativeNumberSupplierService();

  /** Returns the source supplier's native-to-ASCII result. */
  getNativeNumberString(input: OUStringConstReference, locale: LocaleConstReference, mode: 0): OUString {
    try {
      return this.supplier.getNativeNumberString(input, locale, mode);
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      return new OUString();
    }
  }
}

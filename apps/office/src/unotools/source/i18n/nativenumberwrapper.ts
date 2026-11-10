/** @fileoverview NativeNumberWrapper's original modes0..11 forwarding and value-owner destruction. */
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { NativeNumberSupplierService } from "../../../i18npool/source/nativenumber/nativenumbersupplier";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";

/** Source wrapper forwards to NativeNumberSupplier2 and catches UNO exceptions only. */
export class NativeNumberWrapper {
  private readonly supplier = new NativeNumberSupplierService();

  /** Returns the original supplier result.  @param input - Input. @param locale - Locale. @param mode - Mode. @returns The OUString result. */
  getNativeNumberString(
    input: OUStringConstReference,
    locale: LocaleConstReference,
    mode: number,
  ): OUString {
    try {
      return this.supplier.getNativeNumberString(input, locale, mode);
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
      return new OUString();
    }
  }
  /** Original parameter overload and UNO-only exception default. @param input - Source text. @param locale - Actual locale. @param mode - Represented mode. @param params - Original parameters. @returns Owned result or empty. */
  getNativeNumberStringParams(
    input: OUStringConstReference,
    locale: LocaleConstReference,
    mode: number,
    params: OUStringConstReference,
  ): OUString {
    try {
      return this.supplier.getNativeNumberStringParams(input, locale, mode, params);
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
      return new OUString();
    }
  }
  /** Original owned service-reference release. @returns Nothing. */
  dispose(): void {
    this.supplier.dispose();
  }
}

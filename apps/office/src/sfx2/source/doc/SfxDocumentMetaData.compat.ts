/** @fileoverview Original CompatWriterDocPropsImpl source subclass and acquired factory, retaining the additional original interface and source DOM-only clone behavior. Production registration waits for complete metadata/storage qualification. */
import { SfxDocumentMetaData, literal } from "./SfxDocumentMetaData";
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { acquire } from "../../../cppuhelper/inc/weak";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { XCompatWriterDocProperties } from "../../../offapi/com/sun/star/document/XCompatWriterDocProperties";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
/** Actual original source subclass; additional strings are neither DOM metadata nor modification notifications. */
export class CompatWriterDocPropsImpl
  extends ImplInheritanceHelper.specialize(SfxDocumentMetaData, XCompatWriterDocProperties)
  implements XCompatWriterDocProperties
{
  private readonly msManager = new OUString();
  private readonly msCategory = new OUString();
  private readonly msCompany = new OUString();
  /** Original native constructor. @param context - Actual context. @returns Source owner. */
  constructor(context: Reference<XComponentContext>) {
    super(context);
  }
  /** Original virtual clone factory returns this source class, with default compatibility strings. @param context - Actual context. @returns Source owner. */
  protected override createMe(context: Reference<XComponentContext>): SfxDocumentMetaData {
    return new CompatWriterDocPropsImpl(context);
  }
  /** Original manager read. @returns Owned string. */ getManager(): OUString {
    return new OUString(this.msManager);
  }
  /** Original manager assignment without modification. @param value - Borrowed string. @returns Nothing. */ setManager(
    value: OUStringConstReference,
  ): void {
    this.msManager.assign(value);
  }
  /** Original category read. @returns Owned string. */ getCategory(): OUString {
    return new OUString(this.msCategory);
  }
  /** Original category assignment without modification. @param value - Borrowed string. @returns Nothing. */ setCategory(
    value: OUStringConstReference,
  ): void {
    this.msCategory.assign(value);
  }
  /** Original company read. @returns Owned string. */ getCompany(): OUString {
    return new OUString(this.msCompany);
  }
  /** Original company assignment without modification. @param value - Borrowed string. @returns Nothing. */ setCompany(
    value: OUStringConstReference,
  ): void {
    this.msCompany.assign(value);
  }
  /** Original implementation name. @returns Owned string. */ override getImplementationName(): OUString {
    return literal("CompatWriterDocPropsImpl");
  }
  /** Original virtual service predicate. @param name - Requested service. @returns Membership. */ override supportsService(
    name: OUStringConstReference,
  ): boolean {
    return supportsService(this, name);
  }
  /** Original writer-specific supported service. @returns Native string sequence. */ override getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const name = literal("com.sun.star.writer.DocumentProperties");
    try {
      return new (Sequence.specialize<rtl_uStringSlot>("OUString", 8))(
        {
          /** Exposes the property-name address to the sequence initializer. @returns Borrowed native string address. */ get() {
            return name.getDataAddress();
          },
        },
        1,
      );
    } finally {
      name.dispose();
    }
  }
  /** Original reverse member/base destruction. @returns Nothing. */ protected override destroy(): void {
    this.msCompany.dispose();
    this.msCategory.dispose();
    this.msManager.dispose();
    super.destroy();
  }
}
/** Original acquired native factory; no service registration is added during incomplete storage work. @param context - Native context. @param args - Ignored arguments. @returns Actual native root. */
export function CompatWriterDocPropsImpl_get_implementation(
  context: XComponentContext | null,
  args: Sequence<Any>,
): XInterface {
  void args;
  const ref = new Reference<XComponentContext>(context);
  try {
    return acquire(new CompatWriterDocPropsImpl(ref));
  } finally {
    ref.dispose();
  }
}

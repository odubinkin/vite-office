/** @fileoverview Original ZipPackageFolderEnumeration borrowed ContentHash traversal and actual UNO XWeak element Any. Rehash/mutation invalidation remains an unqualified native iterator domain. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XEnumeration } from "../../../udkapi/com/sun/star/container/XEnumeration";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { XWeak } from "../../../cppu/inc/com/sun/star/uno/XWeak";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { NoSuchElementException } from "../../../cppu/inc/com/sun/star/container/NoSuchElementException";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import type { FolderContent } from "./ZipPackageFolder.native";
/** Known native ASCII source literal. @param value - Literal. @returns Native string. */
function literal(value: string): OUString {
  return new OUString(
    Uint8Array.from(
      value + "\0",
      /** Source ASCII unit. @param c - Character. @returns Byte. */ (c) => c.charCodeAt(0),
    ),
  );
}
/** Original final enumeration; does not acquire the folder or snapshot its contents. */
export class ZipPackageFolderEnumeration
  extends WeakImplHelper.specialize(XEnumeration, XServiceInfo)
  implements XEnumeration, XServiceInfo
{
  private readonly aIterator: MapIterator<FolderContent>;
  private current: IteratorResult<FolderContent>;
  /** Original begin iterator on borrowed map. @param contents - Actual folder map. @returns Enumeration. */
  constructor(contents: ReadonlyMap<string, FolderContent>) {
    super();
    this.aIterator = contents.values();
    this.current = this.aIterator.next();
  }
  /** Original end comparison. @returns Whether current entry exists. */
  hasMoreElements(): boolean {
    return !this.current.done;
  }
  /** Original element acquisition followed by increment; EOF throws. @returns Acquired component Any. */
  nextElement(): Any {
    if (this.current.done) throw new NoSuchElementException();
    const ref = new Reference<XWeak>(this.current.value.entry.get());
    try {
      const value = new Any(ref.getAddress(), ["Reference", XWeak.static_type]);
      this.current = this.aIterator.next();
      return value;
    } finally {
      ref.dispose();
    }
  }
  /** Original name. @returns Owned string. */
  getImplementationName(): OUString {
    return literal("ZipPackageFolderEnumeration");
  }
  /** Original service predicate. @param name - Demanded service. @returns Membership. */
  supportsService(name: OUString): boolean {
    return supportsService(this, name);
  }
  /** Original singleton service name. @returns Owned sequence. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const name = literal("com.sun.star.packages.PackageFolderEnumeration");
    try {
      return new (Sequence.specialize<rtl_uStringSlot>("OUString", 8))(
        new Map([[0, name.getDataAddress()]]),
        1,
      );
    } finally {
      name.dispose();
    }
  }
}

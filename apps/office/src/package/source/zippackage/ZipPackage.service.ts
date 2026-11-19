/** @fileoverview Original package2.component constructor for ZipPackage. */
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { ZipPackage } from "./ZipPackage";
/** Creates and acquires the actual package. @param context - Actual raw context. @param args - Arguments processed by XInitialization. @returns Acquired package. */
export function package_ZipPackage_get_implementation(
  context: XComponentContext | null,
  args: Sequence<Any>,
): XInterface {
  void args;
  const reference = new Reference(context);
  try {
    const packageOwner = new ZipPackage(reference);
    packageOwner.acquire();
    return packageOwner;
  } finally {
    reference.dispose();
  }
}

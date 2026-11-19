/** @fileoverview Original complete oox::core::FastTokenHandler native interfaces, service identities and signed-byte Sequence contracts. */
import * as TokenMap from "../token/tokenmap";
import { FastTokenHandlerBase } from "../../../sax/source/tools/fastattribs";
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { acquire } from "../../../cppuhelper/inc/weak";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { Sequence, type SequenceConstReference } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Compiler-known original ASCII source literal. @param text - Original literal. @returns Native owned string. */
function literal(text: string): OUString {
  return new OUString(
    Uint8Array.from(
      text + "\0",
      /** Original ASCII literal unit. @param c - Character. @returns Byte. */ (c) =>
        c.charCodeAt(0),
    ),
  );
}
/** Original ImplInheritanceHelper over the actual abstract token-handler base. */
export class FastTokenHandler
  extends ImplInheritanceHelper.specialize(FastTokenHandlerBase, XServiceInfo)
  implements XServiceInfo
{
  /** Original implementation identity. @returns Owned native string. */
  getImplementationName(): OUString {
    return literal("com.sun.star.comp.oox.core.FastTokenHandler");
  }
  /** Original common service predicate. @param name - Borrowed native name. @returns Membership. */
  supportsService(name: OUStringConstReference): boolean {
    return supportsService(this, name);
  }
  /** Original one-entry service list. @returns Owned native sequence. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const name = literal("com.sun.star.xml.sax.FastTokenHandler");
    try {
      return new (Sequence.specialize<rtl_uStringSlot>("OUString", 8))(
        {
          /** Original initializer-list element address. @returns Borrowed native string cell. */ get: () =>
            name.getDataAddress(),
        },
        1,
      );
    } finally {
      name.dispose();
    }
  }
  /** Original value return copies the static native sequence owner, preserving COW. @param token - Native local token ID. @returns Owned signed-byte sequence. */
  getUTF8Identifier(token: number): Sequence<number> {
    return new Bytes(TokenMap.getUtf8TokenName(token));
  }
  /** Original counted sequence-to-string_view lookup, without a second byte owner. @param identifier - Borrowed native signed-byte sequence. @returns Exact token or DONTKNOW. */
  getTokenFromUTF8(identifier: SequenceConstReference<number>): number {
    return TokenMap.getTokenFromUtf8(identifier.getConstArray(), identifier.getLength());
  }
  /** Original direct C++ string_view shortcut. @param token - Exact borrowed XML lexeme. @returns Token or DONTKNOW. */
  getTokenDirect(token: string | Uint8Array): number {
    return TokenMap.getTokenFromUtf8(token);
  }
}
/** Original acquired component factory ignores its context and arguments. @param context - Ignored source context. @param args - Ignored original arguments. @returns Acquired actual component. */
export function com_sun_star_comp_oox_core_FastTokenHandler_get_implementation(
  context: XComponentContext | null,
  args: Sequence<Any>,
): XInterface {
  void context;
  void args;
  return acquire(new FastTokenHandler());
}

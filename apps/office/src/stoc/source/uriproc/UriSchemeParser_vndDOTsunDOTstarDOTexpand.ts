/** @fileoverview Original expand URI parser service and factory; original TODO single-instance behavior remains per-call construction. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { acquire } from "../../../cppuhelper/inc/weak";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { XUriSchemeParser } from "../../../udkapi/com/sun/star/uri/XUriSchemeParser";
import type { XUriReference } from "../../../udkapi/com/sun/star/uri/XUriReference";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { literal } from "./UriReferenceFactory.temporaries";
import { Uri } from "../../../sal/inc/rtl/uri";
import { rtl_UriDecodeMechanism } from "../../../sal/inc/rtl/uri.h";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import { UrlReference } from "./UriSchemeParser_vndDOTsunDOTstarDOTexpand.reference";
/** Original liberal admission includes empty and leading-slash opaque parts. @param part - Borrowed scheme-specific value. @returns Original admission result. */
function parseSchemeSpecificPart(part: OUStringConstReference): boolean {
  if (part.isEmpty()) return true;
  const decoded = Uri.decode(
    part,
    rtl_UriDecodeMechanism.rtl_UriDecodeStrict,
    RTL_TEXTENCODING_UTF8,
  );
  try {
    return !decoded.isEmpty();
  } finally {
    decoded.dispose();
  }
}
/** Original Parser component with real interface facets and service identities. */
export class Parser
  extends WeakImplHelper.specialize(XServiceInfo, XUriSchemeParser)
  implements XServiceInfo, XUriSchemeParser
{
  /** Original implementation identity. @returns Native string. */
  getImplementationName(): OUString {
    return literal("com.sun.star.comp.uri.UriSchemeParser_vndDOTsunDOTstarDOTexpand");
  }
  /** Original source common predicate. @param name - Service name. @returns Membership. */
  supportsService(name: OUStringConstReference): boolean {
    return supportsService(this, name);
  }
  /** Original singleton service sequence. @returns Actual native sequence. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const name = literal("com.sun.star.uri.UriSchemeParser_vndDOTsunDOTstarDOTexpand");
    try {
      return new (Sequence.specialize<rtl_uStringSlot>("OUString", 8))(
        {
          /** Borrows the initialized native source literal. @returns Native field address. */ get() {
            return name.getDataAddress();
          },
        },
        1,
      );
    } finally {
      name.dispose();
    }
  }

  /** Original scheme-specific admission and concrete URL construction. @param scheme - Borrowed scheme. @param part - Borrowed specific part. @returns Real specialized URI or empty reference. */
  parse(scheme: OUStringConstReference, part: OUStringConstReference): Reference<XUriReference> {
    if (!parseSchemeSpecificPart(part)) return new Reference<XUriReference>();
    return new Reference<XUriReference>(new UrlReference(scheme, part));
  }
}
/** Original exported factory ignores context/arguments and creates a fresh Parser. @param context - Ignored original context. @param args - Ignored original arguments. @returns Acquired component. */
export function com_sun_star_comp_uri_UriSchemeParser_vndDOTsunDOTstarDOTexpand_get_implementation(
  context: XComponentContext | null,
  args: Sequence<Any>,
): XInterface {
  void context;
  void args;
  return acquire(new Parser());
}

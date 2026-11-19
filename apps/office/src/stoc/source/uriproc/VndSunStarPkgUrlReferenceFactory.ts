/** @fileoverview Original VndSunStarPkgUrlReferenceFactory.cxx component over genuine URI services and SAL codec. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { acquire } from "../../../cppuhelper/inc/weak";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import {
  Reference,
  type ReferenceConstParameter,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { XVndSunStarPkgUrlReferenceFactory } from "../../../udkapi/com/sun/star/uri/XVndSunStarPkgUrlReferenceFactory";
import { UriReferenceFactory } from "../../../udkapi/com/sun/star/uri/UriReferenceFactory";
import type { XUriReference } from "../../../udkapi/com/sun/star/uri/XUriReference";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { StringConcat } from "../../../sal/inc/rtl/stringconcat";
import { Uri } from "../../../sal/inc/rtl/uri";
import { rtl_UriCharClass, rtl_UriEncodeMechanism } from "../../../sal/inc/rtl/uri.h";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import { ascii, literal } from "./UriReferenceFactory.temporaries";
/** Original Factory owner, retaining its actual by-value context member. */
export class Factory
  extends WeakImplHelper.specialize(XServiceInfo, XVndSunStarPkgUrlReferenceFactory)
  implements XServiceInfo, XVndSunStarPkgUrlReferenceFactory
{
  private readonly m_context: Reference<XComponentContext>;
  /** Original context parameter is moved into the member. @param context - Actual by-value owner. @returns Component. */
  constructor(context: Reference<XComponentContext>) {
    super();
    this.m_context = Reference.move(context);
  }
  /** Original reverse member/base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_context.dispose();
    super.destroy();
  }
  /** Original implementation identity. @returns Native string. */
  getImplementationName(): OUString {
    return literal("com.sun.star.comp.uri.VndSunStarPkgUrlReferenceFactory");
  }
  /** Original source common predicate. @param name - Service name. @returns Membership. */
  supportsService(name: OUStringConstReference): boolean {
    return supportsService(this, name);
  }
  /** Original singleton service sequence. @returns Actual native sequence. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const name = literal("com.sun.star.uri.VndSunStarPkgUrlReferenceFactory");
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

  /** Original package-authority validation and service route. @param authority - Borrowed URI reference. @returns New package URL or empty reference. */
  createVndSunStarPkgUrlReference(
    authority: ReferenceConstParameter<XUriReference>,
  ): Reference<XUriReference> {
    if (!authority.is()) {
      const message = literal(
        "null authority passed to XVndSunStarPkgUrlReferenceFactory.createVndSunStarPkgUrlReference",
      );
      const context = new Reference<XInterface>();
      try {
        throw new RuntimeException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    if (authority.operatorStar().isAbsolute() && !authority.operatorStar().hasFragment()) {
      const source = authority.operatorStar().getUriReference();
      let encoded: OUString;
      try {
        encoded = Uri.encode(
          source,
          rtl_UriCharClass.rtl_UriCharClassRegName,
          rtl_UriEncodeMechanism.rtl_UriEncodeIgnoreEscapes,
          RTL_TEXTENCODING_UTF8,
        );
      } finally {
        source.dispose();
      }
      let buf: OUString;
      try {
        buf = new OUString(new StringConcat(ascii("vnd.sun.star.pkg://"), encoded));
      } finally {
        encoded.dispose();
      }
      try {
        const factory = UriReferenceFactory.create(this.m_context);
        try {
          return factory.operatorStar().parse(buf);
        } finally {
          factory.dispose();
        }
      } finally {
        buf.dispose();
      }
    }
    return new Reference<XUriReference>();
  }
}
/** Original acquired component factory. @param context - Context pointer. @param args - Ignored original arguments. @returns Acquired component root. */
export function com_sun_star_comp_uri_VndSunStarPkgUrlReferenceFactory_get_implementation(
  context: XComponentContext | null,
  args: Sequence<Any>,
): XInterface {
  void args;
  const value = new Reference<XComponentContext>(context);
  try {
    return acquire(new Factory(value));
  } finally {
    value.dispose();
  }
}

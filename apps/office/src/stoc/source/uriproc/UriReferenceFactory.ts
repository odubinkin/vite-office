/** @fileoverview Original UriReferenceFactory.cxx Factory component, service identity, parser dispatch, exception propagation and complete resolution methods. Uses actual native URI owners and UNO services; no parallel string-facing kernel remains. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { acquire, getXWeak } from "../../../cppuhelper/inc/weak";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { getCaughtException } from "../../../cppuhelper/inc/exc_hlp";
import { withCaughtException } from "../../../cppu/inc/uno/exception-context";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { WrappedTargetRuntimeException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetRuntimeException";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { XUriReferenceFactory } from "../../../udkapi/com/sun/star/uri/XUriReferenceFactory";
import { XUriSchemeParser } from "../../../udkapi/com/sun/star/uri/XUriSchemeParser";
import type { XUriReference } from "../../../udkapi/com/sun/star/uri/XUriReference";
import type { RelativeUriExcessParentSegments } from "../../../udkapi/com/sun/star/uri/RelativeUriExcessParentSegments";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { StringConcat } from "../../../sal/inc/rtl/stringconcat";
import {
  isAsciiUpperCase,
  isAsciiLowerCase,
  isAsciiDigit,
  toAsciiLowerCase,
} from "../../../sal/inc/rtl/character";
import { ascii, view, literal } from "./UriReferenceFactory.temporaries";
import { parseScheme, parseGeneric } from "./UriReferenceFactory.generic";
import { makeAbsolute, makeRelative } from "./UriReferenceFactory.resolve";
/** Original complete Factory class on its actual WeakImplHelper receiver. */
export class Factory
  extends WeakImplHelper.specialize(XServiceInfo, XUriReferenceFactory)
  implements XServiceInfo, XUriReferenceFactory
{
  private readonly m_context: Reference<XComponentContext>;
  /** Original by-value context parameter moves into its member. @param context - Actual by-value reference owner. @returns Component. */
  constructor(context: Reference<XComponentContext>) {
    super();
    this.m_context = Reference.move(context);
  }
  /** Original context-before-base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_context.dispose();
    super.destroy();
  }
  /** Original implementation identity. @returns Native string. */
  getImplementationName(): OUString {
    return literal("com.sun.star.comp.uri.UriReferenceFactory");
  }
  /** Original source common predicate. @param name - Service name. @returns Membership. */
  supportsService(name: OUStringConstReference): boolean {
    return supportsService(this, name);
  }
  /** Original singleton service sequence. @returns Actual native sequence. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const name = literal("com.sun.star.uri.UriReferenceFactory");
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
  /** Original parser lookup and native generic fallback with exact original exception translation. @param uriReference - Native URI text. @returns Acquired URI or original parser's empty result. */
  parse(uriReference: OUStringConstReference): Reference<XUriReference> {
    let delimiter = uriReference.indexOf(35);
    if (delimiter === -1) delimiter = uriReference.getLength();
    const scheme = new OUString(),
      specific = new OUString(),
      serviceName = new OUString(),
      parser = new Reference<XUriSchemeParser>();
    try {
      const n = parseScheme(view(uriReference));
      if (!(n < delimiter)) throw new Error("assert(scheme precedes fragment)");
      if (n >= 0) {
        const value = uriReference.copy(0, n),
          part = uriReference.copy(n + 1, delimiter - (n + 1));
        try {
          scheme.assign(value);
          specific.assign(part);
        } finally {
          part.dispose();
          value.dispose();
        }
        const buffer = new OUStringBuffer(128);
        try {
          buffer.append(ascii("com.sun.star.uri.UriSchemeParser_"));
          for (let i = 0; i < scheme.getLength(); ++i) {
            const c = scheme.getStr()[i] as number;
            if (isAsciiUpperCase(c)) buffer.insertChar(buffer.getLength(), toAsciiLowerCase(c));
            else if (c === 43) buffer.append(ascii("PLUS"));
            else if (c === 45) buffer.append(ascii("HYPHEN"));
            else if (c === 46) buffer.append(ascii("DOT"));
            else {
              if (!isAsciiLowerCase(c) && !isAsciiDigit(c))
                throw new Error("assert(valid scheme character)");
              buffer.insertChar(buffer.getLength(), c);
            }
          }
          const name = buffer.makeStringAndClear();
          try {
            serviceName.assign(name);
          } finally {
            name.dispose();
          }
        } finally {
          buffer.dispose();
        }
      } else {
        const part = uriReference.copy(0, delimiter);
        try {
          specific.assign(part);
        } finally {
          part.dispose();
        }
      }
      if (!serviceName.isEmpty()) {
        const manager = this.m_context.operatorStar().getServiceManager();
        try {
          if (manager.is()) {
            const service = new Reference<XInterface>();
            try {
              try {
                const instance = manager
                  .operatorStar()
                  .createInstanceWithContext(serviceName, this.m_context);
                try {
                  service.assign(instance);
                } finally {
                  instance.dispose();
                }
              } catch (error) {
                if (error instanceof RuntimeException) throw error;
                if (!(error instanceof Exception)) throw error;
                try {
                  const caught = withCaughtException(error, getCaughtException),
                    message = new OUString(
                      new StringConcat(ascii("creating service "), serviceName),
                    ),
                    context = new Reference(getXWeak(this));
                  try {
                    throw new WrappedTargetRuntimeException(message, context, caught);
                  } finally {
                    context.dispose();
                    message.dispose();
                    caught.dispose();
                  }
                } finally {
                  error.dispose();
                }
              }
              if (service.is()) parser.set(service, UNO_QUERY_THROW, XUriSchemeParser.static_type);
            } finally {
              service.dispose();
            }
          }
        } finally {
          manager.dispose();
        }
      }
      const result = parser.is()
        ? parser.operatorStar().parse(scheme, specific)
        : parseGeneric(scheme, view(specific));
      try {
        if (result.is() && delimiter !== uriReference.getLength()) {
          const value = uriReference.copy(delimiter + 1);
          try {
            result.operatorStar().setFragment(value);
          } finally {
            value.dispose();
          }
        }
        return result;
      } catch (error) {
        result.dispose();
        throw error;
      }
    } finally {
      parser.dispose();
      serviceName.dispose();
      specific.dispose();
      scheme.dispose();
    }
  }
  /** Original complete absolute-resolution responsibility. @param base - Base URI. @param target - Target URI. @param special - Source processing flag. @param excess - Source enum. @returns Fresh URI or empty reference. */
  makeAbsolute(
    base: Reference<XUriReference>,
    target: Reference<XUriReference>,
    special: boolean,
    excess: RelativeUriExcessParentSegments,
  ): Reference<XUriReference> {
    return makeAbsolute.call(this, base, target, special, excess);
  }
  /** Original complete relative-resolution responsibility. @param base - Base URI. @param target - Target URI. @param authority - Source preference. @param absolute - Source preference. @param encode - Source encoding flag. @returns Fresh URI or empty reference. */
  makeRelative(
    base: Reference<XUriReference>,
    target: Reference<XUriReference>,
    authority: boolean,
    absolute: boolean,
    encode: boolean,
  ): Reference<XUriReference> {
    return makeRelative.call(this, base, target, authority, absolute, encode);
  }
  /** Original private clone operation, visible only for the compiler responsibility split. @param value - Actual source URI. @returns Fresh URI. */
  clone(value: Reference<XUriReference>): Reference<XUriReference> {
    const text = value.operatorStar().getUriReference();
    try {
      return this.parse(text);
    } finally {
      text.dispose();
    }
  }
}
/** Original acquired source factory entry point. @param context - Actual component context pointer. @param args - Original ignored arguments. @returns Acquired component root. */
export function com_sun_star_comp_uri_UriReferenceFactory_get_implementation(
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

/** @fileoverview Original expand UrlReference component on its real composed stoc URI value owner. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import {
  Reference,
  type ReferenceConstParameter,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { XVndSunStarExpandUrlReference } from "../../../udkapi/com/sun/star/uri/XVndSunStarExpandUrlReference";
import { UriReference as Value } from "./UriReference";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { XMacroExpander } from "../../../udkapi/com/sun/star/util/XMacroExpander";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { Uri } from "../../../sal/inc/rtl/uri";
import { rtl_UriDecodeMechanism } from "../../../sal/inc/rtl/uri.h";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import { literal } from "./UriReferenceFactory.temporaries";

/** Original specialized expand URI adapter owns the actual stoc::uriproc value. */
export class UrlReference
  extends WeakImplHelper.specialize(XVndSunStarExpandUrlReference)
  implements XVndSunStarExpandUrlReference
{
  private readonly base_: Value;
  /** Original scheme/path constructor with empty authority and query values. @param scheme - Borrowed scheme. @param path - Borrowed path. @returns Native component. */
  constructor(scheme: OUStringConstReference, path: OUStringConstReference) {
    super();
    const schemeValue = new OUString(scheme),
      pathValue = new OUString(path),
      authority = new OUString(),
      query = new OUString();
    try {
      this.base_ = new Value(schemeValue, false, authority, pathValue, false, query);
    } finally {
      query.dispose();
      authority.dispose();
      pathValue.dispose();
      schemeValue.dispose();
    }
  }
  /** Original helper member destruction precedes base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.base_.dispose();
    super.destroy();
  }
  /** Original forwarding method. @returns Original declared result. */
  getUriReference(): OUString {
    return this.base_.getUriReference();
  }
  /** Original forwarding method. @returns Original declared result. */
  isAbsolute(): boolean {
    return this.base_.isAbsolute();
  }
  /** Original forwarding method. @returns Original declared result. */
  getScheme(): OUString {
    return new OUString(this.base_.getScheme());
  }
  /** Original forwarding method. @returns Original declared result. */
  getSchemeSpecificPart(): OUString {
    return this.base_.getSchemeSpecificPart();
  }
  /** Original forwarding method. @returns Original declared result. */
  isHierarchical(): boolean {
    return this.base_.isHierarchical();
  }
  /** Original forwarding method. @returns Original declared result. */
  hasAuthority(): boolean {
    return this.base_.hasAuthority();
  }
  /** Original forwarding method. @returns Original declared result. */
  getAuthority(): OUString {
    return new OUString(this.base_.getAuthority());
  }
  /** Original forwarding method. @returns Original declared result. */
  getPath(): OUString {
    return this.base_.getPath();
  }
  /** Original forwarding method. @returns Original declared result. */
  hasRelativePath(): boolean {
    return this.base_.hasRelativePath();
  }
  /** Original forwarding method. @returns Original declared result. */
  getPathSegmentCount(): number {
    return this.base_.getPathSegmentCount();
  }
  /** Original forwarding method. @param index - Original declared argument. @returns Original declared result. */
  getPathSegment(index: number): OUString {
    return this.base_.getPathSegment(index);
  }
  /** Original forwarding method. @returns Original declared result. */
  hasQuery(): boolean {
    return this.base_.hasQuery();
  }
  /** Original forwarding method. @returns Original declared result. */
  getQuery(): OUString {
    return new OUString(this.base_.getQuery());
  }
  /** Original forwarding method. @returns Original declared result. */
  hasFragment(): boolean {
    return this.base_.hasFragment();
  }
  /** Original forwarding method. @returns Original declared result. */
  getFragment(): OUString {
    return this.base_.getFragment();
  }
  /** Original forwarding method. @param fragment - Original declared argument. @returns Original declared result. */
  setFragment(fragment: OUStringConstReference): void {
    this.base_.setFragment(fragment);
  }
  /** Original forwarding method. @returns Original declared result. */
  clearFragment(): void {
    this.base_.clearFragment();
  }
  /** Original required-expander check and native decoded full-expression delegation. @param expander - Borrowed real producer. @returns Owned expanded text. */
  expand(expander: ReferenceConstParameter<XMacroExpander>): OUString {
    if (!expander.is()) {
      const message = literal("null expander passed to XVndSunStarExpandUrl.expand"),
        context = new Reference<XInterface>();
      try {
        throw new RuntimeException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    const path = this.getPath();
    try {
      const decoded = Uri.decode(
        path,
        rtl_UriDecodeMechanism.rtl_UriDecodeWithCharset,
        RTL_TEXTENCODING_UTF8,
      );
      try {
        return expander.operatorStar().expandMacros(decoded);
      } finally {
        decoded.dispose();
      }
    } finally {
      path.dispose();
    }
  }
}

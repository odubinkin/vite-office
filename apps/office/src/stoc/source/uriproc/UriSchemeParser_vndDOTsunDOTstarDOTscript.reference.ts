/** @fileoverview Original script UrlReference component on its real composed stoc URI value owner. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { getXWeak } from "../../../cppuhelper/inc/weak";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { XVndSunStarScriptUrlReference } from "../../../udkapi/com/sun/star/uri/XVndSunStarScriptUrlReference";
import { UriReference as Value } from "./UriReference";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { rtl_ustr_compare_WithLength } from "../../../sal/inc/rtl/ustring.h";
import { StringConcat } from "../../../sal/inc/rtl/stringconcat";
import {
  parsePart,
  encodeNameOrParamFragment,
} from "./UriSchemeParser_vndDOTsunDOTstarDOTscript.lexical";
import { ascii, view } from "./UriReferenceFactory.temporaries";
/** Original anonymous generic URI adapter owns the actual stoc::uriproc value. */
export class UrlReference
  extends WeakImplHelper.specialize(XVndSunStarScriptUrlReference)
  implements XVndSunStarScriptUrlReference
{
  private readonly m_base: Value;
  /** Original scheme/path constructor with empty authority and query values. @param scheme - Borrowed scheme. @param path - Borrowed path. @returns Native component. */
  constructor(scheme: OUStringConstReference, path: OUStringConstReference) {
    super();
    const schemeValue = new OUString(scheme),
      pathValue = new OUString(path),
      authority = new OUString(),
      query = new OUString();
    try {
      this.m_base = new Value(schemeValue, false, authority, pathValue, false, query);
    } finally {
      query.dispose();
      authority.dispose();
      pathValue.dispose();
      schemeValue.dispose();
    }
  }
  /** Original helper member destruction precedes base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_base.dispose();
    super.destroy();
  }
  /** Original forwarding method. @returns Original declared result. */
  getUriReference(): OUString {
    return this.m_base.getUriReference();
  }
  /** Original forwarding method. @returns Original declared result. */
  isAbsolute(): boolean {
    return this.m_base.isAbsolute();
  }
  /** Original forwarding method. @returns Original declared result. */
  getScheme(): OUString {
    return new OUString(this.m_base.getScheme());
  }
  /** Original forwarding method. @returns Original declared result. */
  getSchemeSpecificPart(): OUString {
    return this.m_base.getSchemeSpecificPart();
  }
  /** Original forwarding method. @returns Original declared result. */
  isHierarchical(): boolean {
    return this.m_base.isHierarchical();
  }
  /** Original forwarding method. @returns Original declared result. */
  hasAuthority(): boolean {
    return this.m_base.hasAuthority();
  }
  /** Original forwarding method. @returns Original declared result. */
  getAuthority(): OUString {
    return new OUString(this.m_base.getAuthority());
  }
  /** Original forwarding method. @returns Original declared result. */
  getPath(): OUString {
    return this.m_base.getPath();
  }
  /** Original forwarding method. @returns Original declared result. */
  hasRelativePath(): boolean {
    return this.m_base.hasRelativePath();
  }
  /** Original forwarding method. @returns Original declared result. */
  getPathSegmentCount(): number {
    return this.m_base.getPathSegmentCount();
  }
  /** Original forwarding method. @param index - Original declared argument. @returns Original declared result. */
  getPathSegment(index: number): OUString {
    return this.m_base.getPathSegment(index);
  }
  /** Original forwarding method. @returns Original declared result. */
  hasQuery(): boolean {
    return this.m_base.hasQuery();
  }
  /** Original forwarding method. @returns Original declared result. */
  getQuery(): OUString {
    return new OUString(this.m_base.getQuery());
  }
  /** Original forwarding method. @returns Original declared result. */
  hasFragment(): boolean {
    return this.m_base.hasFragment();
  }
  /** Original forwarding method. @returns Original declared result. */
  getFragment(): OUString {
    return this.m_base.getFragment();
  }
  /** Original forwarding method. @param fragment - Original declared argument. @returns Original declared result. */
  setFragment(fragment: OUStringConstReference): void {
    this.m_base.setFragment(fragment);
  }
  /** Original forwarding method. @returns Original declared result. */
  clearFragment(): void {
    this.m_base.clearFragment();
  }
  /** Original name decoder. @returns Owned name. */
  getName(): OUString {
    return parsePart(view(this.m_base.m_path), true, [0]);
  }
  /** Original nonempty name validation and encoded path replacement. @param name - Borrowed unescaped name. @returns Nothing. */
  setName(name: OUStringConstReference): void {
    if (name.isEmpty()) this.illegalArgument();
    const i: [number] = [0];
    parsePart(view(this.m_base.m_path), true, i).dispose();
    const encoded = encodeNameOrParamFragment(name);
    try {
      const value = new OUString(new StringConcat(encoded, this.m_base.m_path.subView(i[0])));
      try {
        this.m_base.m_path.moveAssign(value);
      } finally {
        value.dispose();
      }
    } finally {
      encoded.dispose();
    }
  }
  /** Original membership test without normalization. @param key - Borrowed decoded key. @returns Presence. */
  hasParameter(key: OUStringConstReference): boolean {
    return this.findParameter(view(key)) >= 0;
  }
  /** Original first matching value. @param key - Borrowed key. @returns Owned decoded value or empty. */
  getParameter(key: OUStringConstReference): OUString {
    const i: [number] = [this.findParameter(view(key))];
    return i[0] >= 0 ? parsePart(view(this.m_base.m_path), false, i) : new OUString();
  }
  /** Original first matching replacement or appended parameter. @param key - Borrowed nonempty key. @param value - Borrowed value. @returns Nothing. */
  setParameter(key: OUStringConstReference, value: OUStringConstReference): void {
    if (key.isEmpty()) this.illegalArgument();
    const i: [number] = [this.findParameter(view(key))],
      existent = i[0] >= 0;
    if (!existent) i[0] = this.m_base.m_path.getLength();
    const path = new OUStringBuffer(128);
    try {
      path.append(this.m_base.m_path.subView(0, i[0]));
      if (!existent) {
        path.insertChar(path.getLength(), this.m_base.m_path.indexOf(63) < 0 ? 63 : 38);
        const encoded = encodeNameOrParamFragment(key);
        try {
          path.append(new StringConcat(encoded, ascii("=")));
        } finally {
          encoded.dispose();
        }
      }
      const encoded = encodeNameOrParamFragment(value);
      try {
        path.append(encoded);
      } finally {
        encoded.dispose();
      }
      if (existent) {
        parsePart(view(this.m_base.m_path), false, i).dispose();
        path.append(this.m_base.m_path.subView(i[0]));
      }
      const result = path.makeStringAndClear();
      try {
        this.m_base.m_path.moveAssign(result);
      } finally {
        result.dispose();
      }
    } finally {
      path.dispose();
    }
  }
  /** Original linear decoded-key lookup returning the first value offset. @param key - Borrowed key view. @returns Value offset or -1. */
  private findParameter(key: Uint16Array): number {
    const i: [number] = [0];
    parsePart(view(this.m_base.m_path), true, i).dispose();
    for (;;) {
      if (i[0] === this.m_base.m_path.getLength()) return -1;
      ++i[0];
      const k = parsePart(view(this.m_base.m_path), false, i);
      ++i[0];
      try {
        if (
          k.getLength() === key.length &&
          rtl_ustr_compare_WithLength(k.getStr(), k.getLength(), key, key.length) === 0
        )
          return i[0];
        parsePart(view(this.m_base.m_path), false, i).dispose();
      } finally {
        k.dispose();
      }
    }
  }
  /** Original argument exception captures this component context and position1. @returns Never. */
  private illegalArgument(): never {
    const message = new OUString(),
      context = new Reference(getXWeak(this));
    try {
      throw new IllegalArgumentException(message, context, 1);
    } finally {
      context.dispose();
      message.dispose();
    }
  }
}

/** @fileoverview Complete original ContentIdentifier and private implementation; identifier spelling and lowercase provider scheme retain the source distinction. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XContentIdentifier } from "../../../offapi/com/sun/star/ucb/XContentIdentifier";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
/** Original unique implementation owner, with source field and initialization order. */
class ContentIdentifier_Impl {
  readonly m_aContentId = new OUString();
  readonly m_aProviderScheme = new OUString();
  /** Original first-colon split; the source replaces with aScheme, not its lowercase result. @param url - Borrowed original URL. @returns Actual implementation. */
  constructor(url: OUStringConstReference) {
    const nPos = url.indexOf(58);
    if (nPos !== -1) {
      const aScheme = url.copy(0, nPos);
      try {
        const lowered = aScheme.toAsciiLowerCase();
        try {
          this.m_aProviderScheme.assign(lowered);
        } finally {
          lowered.dispose();
        }
        const contentId = url.replaceAt(0, nPos, aScheme);
        try {
          this.m_aContentId.assign(contentId);
        } finally {
          contentId.dispose();
        }
      } finally {
        aScheme.dispose();
      }
    }
  }
  /** Original reverse field destruction. @returns Nothing. */
  dispose(): void {
    this.m_aProviderScheme.dispose();
    this.m_aContentId.dispose();
  }
}
/** Complete original component; no URI validation or URL normalization is added. */
export class ContentIdentifier
  extends WeakImplHelper.specialize(XContentIdentifier)
  implements XContentIdentifier
{
  private readonly m_pImpl: ContentIdentifier_Impl;
  /** Original implementation allocation. @param url - Borrowed URL. @returns Actual component. */
  constructor(url: OUStringConstReference) {
    super();
    this.m_pImpl = new ContentIdentifier_Impl(url);
  }
  /** Original unique implementation and base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_pImpl.dispose();
    super.destroy();
  }
  /** Original owned string return. @returns Independent copy of the stored identifier. */
  getContentIdentifier(): OUString {
    return new OUString(this.m_pImpl.m_aContentId);
  }
  /** Original owned string return. @returns Independent copy of the lowercase scheme. */
  getContentProviderScheme(): OUString {
    return new OUString(this.m_pImpl.m_aProviderScheme);
  }
}

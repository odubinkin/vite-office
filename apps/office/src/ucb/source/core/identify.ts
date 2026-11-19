/** @fileoverview Original core UCB ContentIdentifier retains all identifier spellings and lazily derives the lowercase provider scheme; its contract intentionally differs from ucbhelper's identifier implementation. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XContentIdentifier } from "../../../offapi/com/sun/star/ucb/XContentIdentifier";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
/** Original broker identifier component. */
export class ContentIdentifier
  extends WeakImplHelper.specialize(XContentIdentifier)
  implements XContentIdentifier
{
  private readonly m_aContentId: OUString;
  private readonly m_aProviderScheme = new OUString();
  /** Original by-value input initializes the owned identifier without URI validation. @param identifier - Borrowed input. @returns Component. */
  constructor(identifier: OUStringConstReference) {
    super();
    this.m_aContentId = new OUString(identifier);
  }
  /** Original reverse member/base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_aProviderScheme.dispose();
    this.m_aContentId.dispose();
    super.destroy();
  }
  /** Original by-value identifier result. @returns Owned copy. */
  getContentIdentifier(): OUString {
    return new OUString(this.m_aContentId);
  }
  /** Original lazy first-colon scheme extraction and ASCII folding. @returns Owned cached-scheme copy. */
  getContentProviderScheme(): OUString {
    if (this.m_aProviderScheme.isEmpty() && !this.m_aContentId.isEmpty()) {
      const position = this.m_aContentId.indexOf(58);
      if (position !== -1) {
        const scheme = this.m_aContentId.copy(0, position);
        try {
          const lower = scheme.toAsciiLowerCase();
          try {
            this.m_aProviderScheme.moveAssign(lower);
          } finally {
            lower.dispose();
          }
        } finally {
          scheme.dispose();
        }
      }
    }
    return new OUString(this.m_aProviderScheme);
  }
}

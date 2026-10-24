/** @fileoverview Consumed HyperlinkInternetTP query-toggle handlers from pinned hyperlinkinternettabpage.cxx;URL parsing,clipboard and mark-window services remain unrepresented. */
// Original namespace-static preference lasts for this module session,including cancellation.
let bRemoveQueryString = false;
/** Original query-control/entry state;the actual Writer controller owns dialog requests and the document owns link metadata. */
export class HyperlinkInternetTP {
  private target: string;
  private removeQueryString = bRemoveQueryString;
  /** Initializes represented entry and checkbox as FillDlgFields does. @param target - Actual existing URL. @returns Nothing. */
  public constructor(target: string) {
    this.target = target;
    if (this.removeQueryString) this.RemoveQueryString();
  }
  /** Returns the actual entry text. @returns Raw target. */
  public GetTarget(): string {
    return this.target;
  }
  /** Returns the original checkbox state. @returns Whether query removal is enabled. */
  public IsRemoveQueryString(): boolean {
    return this.removeQueryString;
  }
  /** Applies the original immediate entry-change behavior. @param target - Changed entry value. @returns Nothing. */
  public ModifiedTargetHdl_Impl(target: string): void {
    this.target = target;
    if (this.removeQueryString && target.includes("?")) this.RemoveQueryString();
  }
  /** Publishes the original session preference and destructive checkbox edit. @param active - Actual checkbox state. @returns Nothing. */
  public ClickRemoveQueryStringHdl_Impl(active: boolean): void {
    bRemoveQueryString = this.removeQueryString = active;
    if (active) this.RemoveQueryString();
  }
  /** Removes from the first literal question mark through the next hash or end,including the source behavior when '?' is inside a fragment. @returns Nothing. */
  public RemoveQueryString(): void {
    const query = this.target.indexOf("?");
    if (query !== -1) {
      const fragment = this.target.indexOf("#", query);
      this.target =
        this.target.slice(0, query) + (fragment === -1 ? "" : this.target.slice(fragment));
    }
  }
}

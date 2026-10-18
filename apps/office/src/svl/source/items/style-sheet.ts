/** @fileoverview Native SfxStyleSheet and SfxStyleSheetPool from style.cxx; shared role mixins translate multiple inheritance while retaining actual style identity and original notification algorithms. */
import { SfxStyleSheetBase, SfxStyleSheetBasePool, SfxStyleSheetHint } from "./style-model";
import { SfxStyleFamily, SfxStyleSearchBits } from "../../inc/style-values";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { SfxBroadcaster, withSfxBroadcaster } from "../notify/SfxBroadcaster";
import { SfxListener, withSfxListener } from "../notify/lstner";
import { SfxHintId, type SfxHint } from "../../inc/hint";
import type { StyleSheetUser } from "../../inc/stylesheetuser";
import type { SfxItemPool } from "./itempool";

/** Actual native three-base style owner; every base role acts on the same object. */
export class SfxStyleSheet
  extends withSfxBroadcaster(withSfxListener(SfxStyleSheetBase))
  implements StyleSheetUser
{
  /** Original field/copy constructors in native base initialization order. @param args - Fields or actual derived copy. @returns Style. */
  public constructor(
    ...args:
      | [
          name: OUStringConstReference,
          pool: SfxStyleSheetBasePool,
          family: SfxStyleFamily,
          mask: SfxStyleSearchBits,
          parent?: OUStringConstReference | undefined,
        ]
      | [source: SfxStyleSheet]
  ) {
    const source = args[0];
    if (source instanceof SfxStyleSheet) {
      super(source);
      this.CopyListenerFrom(source);
      this.CopyBroadcasterFrom(source);
    } else
      super(
        source,
        args[1] as SfxStyleSheetBasePool,
        args[2] as SfxStyleFamily,
        args[3] as SfxStyleSearchBits,
        args[4],
      );
  }
  /** Original early unchanged return, base validation/notification, old detach and new attach order. @param name - Parent. @returns Whether accepted. */
  public override SetParent(name: OUStringConstReference): boolean {
    if (this.aParent.equals(name)) return true;
    const old = new OUString(this.aParent);
    try {
      if (super.SetParent(name)) {
        if (!old.isEmpty()) {
          const parent = this.m_pPool.Find(old, this.nFamily) as SfxStyleSheet | null;
          if (parent) this.EndListening(parent);
        }
        if (!this.aParent.isEmpty()) {
          const parent = this.m_pPool.Find(this.aParent, this.nFamily) as SfxStyleSheet | null;
          if (parent) this.StartListening(parent);
        }
        return true;
      }
      return false;
    } finally {
      old.dispose();
    }
  }
  /** Original forwarding retains the supplied broadcaster and live iteration bound. @param source - Source. @param hint - Hint. @returns Nothing. */
  public override Notify(source: SfxBroadcaster, hint: SfxHint): void {
    this.Forward(source, hint);
  }
  /** Original final StyleSheetUser query delegates virtual usage. @returns Usage. */
  public isUsedByModel(): boolean {
    return this.IsUsed();
  }
  /** Original final dynamic-type query. @returns True. */
  public override IsSfxStyleSheet(): boolean {
    return true;
  }
  /** Original derived notification then broadcaster/listener/base destructors in native order. @returns Nothing. */
  public override Dispose(): void {
    this.Broadcast(new SfxStyleSheetHint(SfxHintId.StyleSheetInDestruction, this));
    SfxBroadcaster.prototype.Dispose.call(this);
    SfxListener.prototype.Dispose.call(this);
    SfxStyleSheetBase.prototype.Dispose.call(this);
  }
}
/** Native pool overrides only the field factory; inherited base-copy factory deliberately remains slicing. */
export class SfxStyleSheetPool extends SfxStyleSheetBasePool {
  /** Original item-pool construction and implicit native copy. @param source - Item pool or copied shared style pool. @returns Pool. */
  public constructor(source: SfxItemPool | SfxStyleSheetPool) {
    super(source);
  }
  /** Original name factory override and exposed inherited copy overload. @param args - Fields or source. @returns Actual derived field style or inherited base copy. */
  protected override Create(
    ...args:
      | [source: SfxStyleSheetBase]
      | [
          name: OUStringConstReference,
          family: SfxStyleFamily,
          mask: SfxStyleSearchBits,
          parent: OUStringConstReference | undefined,
        ]
  ): SfxStyleSheetBase {
    if (args[0] instanceof SfxStyleSheetBase) return super.Create(args[0]);
    return new SfxStyleSheet(
      args[0],
      this,
      args[1] as SfxStyleFamily,
      args[2] as SfxStyleSearchBits,
      args[3],
    );
  }
}

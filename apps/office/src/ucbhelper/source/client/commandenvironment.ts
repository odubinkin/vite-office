/** @fileoverview Original CommandEnvironment and its private implementation retain actual handler References, source base class and acquired getters. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XCommandEnvironment } from "../../../offapi/com/sun/star/ucb/XCommandEnvironment";
import type { XInteractionHandler } from "../../../udkapi/com/sun/star/task/XInteractionHandler";
import type { XProgressHandler } from "../../../offapi/com/sun/star/ucb/XProgressHandler";

/** Original CommandEnvironment_Impl contains exactly the two acquired field owners. */
class CommandEnvironment_Impl {
  readonly m_xInteractionHandler: Reference<XInteractionHandler>;
  readonly m_xProgressHandler: Reference<XProgressHandler>;
  /** Original memberwise Reference construction, in declaration order. @param interaction - Borrowed source handler. @param progress - Borrowed source handler. @returns Actual private owner. */
  constructor(interaction: Reference<XInteractionHandler>, progress: Reference<XProgressHandler>) {
    this.m_xInteractionHandler = new Reference(interaction);
    this.m_xProgressHandler = new Reference(progress);
  }
  /** Original implicit reverse member destruction. @returns Nothing. */
  dispose(): void {
    this.m_xProgressHandler.dispose();
    this.m_xInteractionHandler.dispose();
  }
}
/** Original named template base retained from commandenvironment.hxx. */
class CommandEnvironment_Base extends WeakImplHelper.specialize(XCommandEnvironment) {}

/** Original concrete UCB command environment; it forwards no callback and creates no replacement handler. */
export class CommandEnvironment extends CommandEnvironment_Base implements XCommandEnvironment {
  private readonly m_pImpl: CommandEnvironment_Impl;
  /** Original constructor owns one private implementation. @param interaction - Borrowed handler or empty reference. @param progress - Borrowed handler or empty reference. @returns Actual native component. */
  constructor(interaction: Reference<XInteractionHandler>, progress: Reference<XProgressHandler>) {
    super();
    this.m_pImpl = new CommandEnvironment_Impl(interaction, progress);
  }
  /** Original empty destructor body, private implementation/member destruction, then base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_pImpl.dispose();
    super.destroy();
  }
  /** Original acquired interaction-handler return. @returns Independent Reference owner for the same component. */
  getInteractionHandler(): Reference<XInteractionHandler> {
    return new Reference(this.m_pImpl.m_xInteractionHandler);
  }
  /** Original acquired progress-handler return. @returns Independent Reference owner for the same component. */
  getProgressHandler(): Reference<XProgressHandler> {
    return new Reference(this.m_pImpl.m_xProgressHandler);
  }
}

/**
 * @fileoverview Ports the bounded SfxViewFrame ownership chain from pinned LibreOffice
 * `sfx2/source/view/viewfrm.cxx`.
 */

import { SfxBindings } from "../control/bindings";
import { SfxDispatcher, type SfxShell } from "../control/dispatch";

/** Owns one active view together with its dispatcher, bindings, and shell stack. */
export class SfxViewFrame<View> {
  private activeView: View | undefined;
  private readonly bindings: SfxBindings;
  private readonly dispatcher: SfxDispatcher;

  /** Creates an empty frame and its Sfx control objects. @param dispatcher - Frame dispatcher. @returns Nothing. */
  public constructor(dispatcher: SfxDispatcher = new SfxDispatcher()) {
    this.dispatcher = dispatcher;
    this.bindings = new SfxBindings(this.dispatcher);
  }

  /** Activates one view and installs its shells in bottom-to-top order. @param view - Active suite view. @param shells - Active shell stack. @returns Nothing. */
  public SetActiveView(view: View, shells: readonly SfxShell[]): void {
    this.CloseView();
    this.activeView = view;
    for (const shell of shells) this.dispatcher.Push(shell);
  }

  /** Returns the frame-owned dispatcher. @returns Active dispatcher. */
  public GetDispatcher(): SfxDispatcher {
    return this.dispatcher;
  }

  /** Returns frame-owned bindings. @returns Active bindings. */
  public GetBindings(): SfxBindings {
    return this.bindings;
  }

  /** Returns the active view, when installed. @returns Current view or undefined. */
  public GetActiveView(): View | undefined {
    return this.activeView;
  }

  /** Deactivates every shell and clears the active view. @returns Nothing. */
  public CloseView(): void {
    let shell = this.dispatcher.GetShell(0);
    while (shell !== undefined) {
      this.dispatcher.Pop(shell);
      shell = this.dispatcher.GetShell(0);
    }
    this.activeView = undefined;
  }
}

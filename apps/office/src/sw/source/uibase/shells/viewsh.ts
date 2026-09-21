/** @fileoverview Owns the supported Writer view-shell execute/state registration. */

import { createCommandShell, type SfxShell } from "../../../../sfx2/source/control/dispatch";
import { createWriterViewCommandRegistry, type WriterViewCommandTarget } from "./writercommands";

/** Dedicated view command shell separated from SwView lifecycle coordination. */
export class SwViewCommandShell {
  private readonly shell: SfxShell;

  /** Creates the view-shell slot owner. @param target - Active Writer view. @returns Nothing. */
  public constructor(target: WriterViewCommandTarget) {
    this.shell = createCommandShell(target, createWriterViewCommandRegistry(target));
  }

  /** Returns the dispatcher-facing shell. @returns Registered Sfx shell. */
  public GetShell(): SfxShell {
    return this.shell;
  }
}

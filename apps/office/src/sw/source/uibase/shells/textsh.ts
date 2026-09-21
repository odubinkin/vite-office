/** @fileoverview Owns the supported SwTextShell execute/state registration from textsh1.cxx. */

import { createCommandShell, type SfxShell } from "../../../../sfx2/source/control/dispatch";
import type { WriterDialogController } from "../dialog/writer-dialog-controller";
import { createWriterTextCommandRegistry, type WriterTextCommandTarget } from "./writercommands";

/** Dedicated text context shell; SwWrtShell supplies operations but does not own slot registration. */
export class SwTextShell {
  private readonly shell: SfxShell;

  /** Creates the text-shell slot owner. @param target - Active Writer editing shell. @param dialogs - Writer dialog controller. @returns Nothing. */
  public constructor(target: WriterTextCommandTarget, dialogs: WriterDialogController) {
    this.shell = createCommandShell(target, createWriterTextCommandRegistry(target, dialogs));
  }

  /** Returns the dispatcher-facing shell. @returns Registered Sfx shell. */
  public GetShell(): SfxShell {
    return this.shell;
  }
}

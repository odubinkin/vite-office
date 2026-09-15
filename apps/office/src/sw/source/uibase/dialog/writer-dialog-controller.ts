/** @fileoverview Typed Writer dialog requests completed by an external presentation adapter. */

import { SfxDialogController } from "../../../../sfx2/source/dialog/dialogcontroller";
import type { WriterHyperlink } from "../../core/txtnode/fmtinfmt";

/** Hyperlink child-window request initialized entirely by the Writer shell. */
export interface WriterHyperlinkDialogRequest {
  readonly commandUrl: string;
  readonly initialHyperlink?: WriterHyperlink;
  readonly kind: "hyperlink";
}

/** Hyperlink fields returned by a presentation adapter after user acceptance. */
export interface WriterHyperlinkDialogResult {
  readonly hyperlink: WriterHyperlink;
  readonly text: string;
}

/** Every Writer child-window request supported by the browser presenter. */
export type WriterDialogRequest = WriterHyperlinkDialogRequest;
/** Observable snapshot published by the Writer dialog controller. */
export type WriterDialogSnapshot = ReturnType<WriterDialogController["GetSnapshot"]>;

/** Writer-specific controller facade around the generic Sfx request lifecycle. */
export class WriterDialogController {
  private readonly controller = new SfxDialogController<
    WriterDialogRequest,
    WriterHyperlinkDialogResult
  >();

  public readonly GetSnapshot = this.controller.GetSnapshot;
  public readonly Subscribe = this.controller.Subscribe;

  /** Requests the hyperlink child window and returns its accepted value or cancellation. @param commandUrl - Originating command. @param initialHyperlink - Shell-owned edit state. @returns Accepted fields or undefined. */
  public async RequestHyperlinkDialog(
    commandUrl: string,
    initialHyperlink?: WriterHyperlink,
  ): Promise<WriterHyperlinkDialogResult | undefined> {
    const completion = await this.controller.Request({
      commandUrl,
      ...(initialHyperlink === undefined ? {} : { initialHyperlink }),
      kind: "hyperlink",
    });
    return completion.kind === "accepted" ? completion.result : undefined;
  }

  /** Completes the matching request. @param id - Request identity. @param result - Accepted fields. @returns Whether it matched. */
  public Complete(id: number, result: WriterHyperlinkDialogResult): boolean {
    return this.controller.Complete(id, result);
  }

  /** Cancels the matching request. @param id - Request identity. @returns Whether it matched. */
  public Cancel(id: number): boolean {
    return this.controller.Cancel(id);
  }
}

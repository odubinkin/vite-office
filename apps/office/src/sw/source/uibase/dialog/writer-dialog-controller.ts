/** @fileoverview Typed Writer dialog requests completed by an external presentation adapter. */

import { SfxDialogController } from "../../../../sfx2/source/dialog/basedlgs";
import type { WriterHyperlink } from "../../core/txtnode/fmtatr2";
import type { WriterPageDescriptorValue } from "../../core/layout/pagedesc";
import type { WriterParagraphFormatValue } from "../shells/textsh1";

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
/** Insert/Edit Bookmark request following the pinned Writer bookmark dialog. */
export interface WriterBookmarkDialogRequest {
  readonly commandUrl: string;
  readonly kind: "bookmark";
  readonly names: readonly string[];
  readonly selectedName?: string;
}
/** One accepted bookmark operation. */
export type WriterBookmarkDialogResult = Readonly<
  | { action: "create" | "navigate" | "remove"; name: string }
  | { action: "rename"; name: string; newName: string }
>;
/** Insert Break request; the supported Writer slice exposes a hard page break. */
export interface WriterBreakDialogRequest {
  readonly commandUrl: string;
  readonly kind: "insert-break";
}
/** Accepted break kind. */
export interface WriterBreakDialogResult {
  readonly breakKind: "page";
}
/** Page Style child-window request initialized from the Standard page descriptor. */
export interface WriterPageDialogRequest {
  readonly commandUrl: string;
  readonly initialValue: WriterPageDescriptorValue;
  readonly kind: "page-style";
}
/** Accepted physical page geometry returned by the presentation adapter. */
export interface WriterPageDialogResult {
  readonly pageDescriptor: WriterPageDescriptorValue;
}

/** Every Writer child-window request supported by the browser presenter. */
/** Paragraph dialog request initialized by the text shell. */
export interface WriterParagraphDialogRequest {
  readonly commandUrl: string;
  readonly initialValue: WriterParagraphFormatValue;
  readonly paintLineNumbers: boolean;
  readonly kind: "paragraph";
  readonly pageStyleNames?: readonly string[];
}
/** Accepted paragraph dialog values. */
export interface WriterParagraphDialogResult {
  readonly paragraphFormat: WriterParagraphFormatValue;
  readonly paintLineNumbers: boolean;
}

/** Every Writer child-window request supported by the presenter. */
export type WriterDialogRequest =
  | WriterHyperlinkDialogRequest
  | WriterBookmarkDialogRequest
  | WriterBreakDialogRequest
  | WriterPageDialogRequest
  | WriterParagraphDialogRequest;
/** Every accepted result supported by the Writer dialog presenter. */
export type WriterDialogResult =
  | WriterHyperlinkDialogResult
  | WriterBookmarkDialogResult
  | WriterBreakDialogResult
  | WriterPageDialogResult
  | WriterParagraphDialogResult;
/** Observable snapshot published by the Writer dialog controller. */
export type WriterDialogSnapshot = ReturnType<WriterDialogController["GetSnapshot"]>;

/** Writer-specific controller facade around the generic Sfx request lifecycle. */
export class WriterDialogController {
  private readonly controller = new SfxDialogController<WriterDialogRequest, WriterDialogResult>();

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
    return completion.kind === "accepted"
      ? (completion.result as WriterHyperlinkDialogResult)
      : undefined;
  }

  /** Requests bookmark creation, navigation or editing. @param commandUrl - Insert Bookmark command. @param names - Current mark names. @param selectedName - Mark at the caret. @returns Accepted operation or cancellation. */
  public async RequestBookmarkDialog(
    commandUrl: string,
    names: readonly string[],
    selectedName?: string,
  ): Promise<WriterBookmarkDialogResult | undefined> {
    const completion = await this.controller.Request({
      commandUrl,
      kind: "bookmark",
      names,
      ...(selectedName === undefined ? {} : { selectedName }),
    });
    return completion.kind === "accepted"
      ? (completion.result as WriterBookmarkDialogResult)
      : undefined;
  }

  /** Requests the supported hard page break. @param commandUrl - Insert Break command. @returns Accepted break or cancellation. */
  public async RequestBreakDialog(
    commandUrl: string,
  ): Promise<WriterBreakDialogResult | undefined> {
    const completion = await this.controller.Request({ commandUrl, kind: "insert-break" });
    return completion.kind === "accepted"
      ? (completion.result as WriterBreakDialogResult)
      : undefined;
  }

  /** Requests the Writer Page tab and returns accepted geometry or cancellation. @param commandUrl - Originating command. @param initialValue - Current Standard page geometry. @returns Accepted geometry or undefined. */
  public async RequestPageDialog(
    commandUrl: string,
    initialValue: WriterPageDescriptorValue,
  ): Promise<WriterPageDialogResult | undefined> {
    const completion = await this.controller.Request({
      commandUrl,
      initialValue,
      kind: "page-style",
    });
    return completion.kind === "accepted"
      ? (completion.result as WriterPageDialogResult)
      : undefined;
  }

  /** Requests paragraph settings from the presenter. @param commandUrl - Originating slot. @param initialValue - Current paragraph values. @param paintLineNumbers - Current document line-number visibility. @param pageStyleNames - Available page styles. @returns Accepted values or undefined. */
  public async RequestParagraphDialog(
    commandUrl: string,
    initialValue: WriterParagraphFormatValue,
    paintLineNumbers: boolean,
    pageStyleNames: readonly string[],
  ): Promise<WriterParagraphDialogResult | undefined> {
    const completion = await this.controller.Request({
      commandUrl,
      initialValue,
      kind: "paragraph",
      paintLineNumbers,
      pageStyleNames,
    });
    return completion.kind === "accepted"
      ? (completion.result as WriterParagraphDialogResult)
      : undefined;
  }

  /** Completes the matching request. @param id - Request identity. @param result - Accepted fields. @returns Whether it matched. */
  public Complete(id: number, result: WriterDialogResult): boolean {
    return this.controller.Complete(id, result);
  }

  /** Cancels the matching request. @param id - Request identity. @returns Whether it matched. */
  public Cancel(id: number): boolean {
    return this.controller.Cancel(id);
  }
}

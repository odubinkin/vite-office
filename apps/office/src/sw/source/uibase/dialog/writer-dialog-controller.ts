/** @fileoverview Typed Writer dialog requests completed by an external presentation adapter. */

import { SfxDialogController } from "../../../../sfx2/source/dialog/basedlgs";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import type { SfxItemSet } from "../../../../svl/inc/itemset";
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
  readonly pageInput: SfxItemSet;
  readonly pageStyleNames?: readonly string[];
}
/** Accepted paragraph dialog values. */
export interface WriterParagraphDialogResult {
  readonly pageItems?: SfxItemSet;
  /** Whether one of the existing scalar paragraph controls emitted a changed value. */
  readonly paragraphFormatChanged?: boolean;
  readonly paragraphFormat: WriterParagraphFormatValue;
  readonly paintLineNumbers: boolean;
}

/** Setting in Office.Common/Misc shared by both bulk annotation commands. */
export interface WriterCommentDeleteConfiguration {
  GetQueryDeleteAllComments(): boolean;
  SetQueryDeleteAllComments(value: boolean): void;
}

/** Answer and checkbox value returned by the bulk comment confirmation. */
interface WriterCommentDeleteResult {
  readonly confirmed: boolean;
  readonly dontShowAgain: boolean;
}

/** Every Writer child-window request supported by the presenter. */
export type WriterDialogRequest =
  | Readonly<{
      kind: "new-style";
      commandUrl: string;
      names: readonly string[];
      reservedNames: readonly string[];
    }>
  | WriterHyperlinkDialogRequest
  | WriterBookmarkDialogRequest
  | WriterBreakDialogRequest
  | WriterPageDialogRequest
  | WriterParagraphDialogRequest
  | Readonly<{ kind: "delete-comments"; commandUrl: string; author?: string }>
  | Readonly<{
      kind: "character";
      mode: "annotation" | "standard";
      commandUrl: string;
      input: SfxItemSet;
      initialPage?: string;
    }>;
/** Every accepted result supported by the Writer dialog presenter. */
export type WriterDialogResult =
  | Readonly<{ name: string }>
  | WriterHyperlinkDialogResult
  | WriterBookmarkDialogResult
  | WriterBreakDialogResult
  | WriterPageDialogResult
  | WriterParagraphDialogResult
  | WriterCommentDeleteResult
  | Readonly<{ attributes: SfxItemSet }>;
/** Observable snapshot published by the Writer dialog controller. */
export type WriterDialogSnapshot = ReturnType<WriterDialogController["GetSnapshot"]>;

/** Writer-specific controller facade around the generic Sfx request lifecycle. */
export class WriterDialogController {
  private readonly controller = new SfxDialogController<WriterDialogRequest, WriterDialogResult>();

  public readonly GetSnapshot = this.controller.GetSnapshot;
  public readonly Subscribe = this.controller.Subscribe;

  /** Opens native New Style from Selection with user-defined names. @param commandUrl - Original slot. @param names - Existing user styles. @param reservedNames - Existing builtin names. @returns Raw accepted name or cancellation. */
  public async RequestNewStyleDialog(
    commandUrl: string,
    names: readonly string[],
    reservedNames: readonly string[],
  ): Promise<Readonly<{ name: string }> | undefined> {
    const completion = await this.controller.Request({
      kind: "new-style",
      commandUrl,
      names,
      reservedNames,
    });
    return completion.kind === "accepted"
      ? (completion.result as Readonly<{ name: string }>)
      : undefined;
  }

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

  /** Requests paragraph settings from the presenter. @param commandUrl - Originating slot. @param initialValue - Current paragraph values. @param paintLineNumbers - Current document line-number visibility. @param pageStyleNames - Available page styles. @param pageInput - Actual native page input. @returns Accepted values or undefined. */
  public async RequestParagraphDialog(
    commandUrl: string,
    initialValue: WriterParagraphFormatValue,
    paintLineNumbers: boolean,
    pageStyleNames: readonly string[],
    pageInput: SfxItemSet,
  ): Promise<WriterParagraphDialogResult | undefined> {
    const completion = await this.controller.Request({
      commandUrl,
      initialValue,
      kind: "paragraph",
      paintLineNumbers,
      pageStyleNames,
      pageInput,
    });
    return completion.kind === "accepted"
      ? (completion.result as WriterParagraphDialogResult)
      : undefined;
  }

  /** Requests the original Writer Character dialog. @param commandUrl - Original slot. @param input - Borrowed native attributes. @param mode - Writer dialog mode. @param initialPage - Original tab ID, if supplied. @returns Owned output item set on acceptance. */
  public async RequestCharacterDialog(
    commandUrl: string,
    input: SfxItemSet,
    mode: "annotation" | "standard",
    initialPage?: string,
  ): Promise<SfxItemSet | undefined> {
    const completion = await this.controller.Request({
      kind: "character",
      mode,
      commandUrl,
      input,
      ...(initialPage !== undefined && { initialPage }),
    });
    return completion.kind === "accepted"
      ? (completion.result as Readonly<{ attributes: SfxItemSet }>).attributes
      : undefined;
  }

  /** Opens Writer's configured query before deleting several comments. @param author - Author filter, if supplied. @returns Query answer, if completed. */
  public async RequestDeleteComments(
    author?: string,
  ): Promise<WriterCommentDeleteResult | undefined> {
    const completion = await this.controller.Request({
      kind: "delete-comments",
      commandUrl:
        author === undefined ? WRITER_COMMAND_IDS.deleteAllNotes : WRITER_COMMAND_IDS.deleteAuthor,
      ...(author !== undefined && { author }),
    });
    return completion.kind === "accepted"
      ? (completion.result as WriterCommentDeleteResult)
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

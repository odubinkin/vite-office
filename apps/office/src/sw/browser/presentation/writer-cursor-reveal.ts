/** @fileoverview Reveals Writer's projected native cursor after a browser paint. */
import { useEffect, type RefObject } from "react";
import { SvxSearchCmd } from "../../../svl/inc/srchitem";
import type { WriterSearchFeedback } from "../../source/uibase/uiview/viewsrch";

/** Scrolls to the projected Writer cursor or an explicitly requested physical page. @param host - Retained editing surface. @param page - Optional physical page number. @returns Pending scroll cancellation. */
export function queueWriterCursorReveal(
  host: RefObject<HTMLElement | null>,
  page?: number,
): () => void {
  const frame = requestAnimationFrame(
    /** Reveals the painted selection after the native cursor update is rendered. @returns Nothing. */
    () => {
      const content = host.current;
      if (!content) return;
      if (page !== undefined) {
        content
          .querySelector(`[data-writer-page="${page}"]`)
          ?.scrollIntoView?.({ block: "start", inline: "nearest" });
        return;
      }
      const point = content.ownerDocument.getSelection()?.focusNode;
      if (point && content.contains(point))
        point.parentElement?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    },
  );
  return /** Cancels an obsolete revealed position. @returns Nothing. */ () =>
    cancelAnimationFrame(frame);
}

/** Reveals completed search results without moving focus out of the search controls. @param feedback - Current native search operation feedback. @param host - Editing surface. @returns Nothing. */
export function useWriterSearchCursorReveal(
  feedback: WriterSearchFeedback | undefined,
  host: RefObject<HTMLElement | null>,
): void {
  useEffect(
    /** Applies only to operations with a current selected match. @returns Optional scroll cleanup. */
    () => {
      if (
        feedback?.kind !== "result" ||
        feedback.result.matches === 0 ||
        feedback.command === SvxSearchCmd.REPLACE_ALL
      )
        return;
      return queueWriterCursorReveal(host);
    },
    [feedback, host],
  );
}

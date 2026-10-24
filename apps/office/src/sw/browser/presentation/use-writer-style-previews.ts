/** @fileoverview Shares the actual Writer pool and shell preview ports between toolbar and sidebar style boxes. */
import { createElement, useMemo, useSyncExternalStore } from "react";
import type { SwDocShell } from "../../source/uibase/app/docsh";
import {
  getParagraphStyleItemSetForPreview,
  flattenSwFormatForPreview,
} from "../../source/uibase/app/docstyle";
import { BrowserStylePreviewState } from "../../../svx/browser/tbxctrls/style-preview-state";
import { StylePreviewRow } from "../../../svx/browser/tbxctrls/StylePreviewRow";
import type { StyleToolboxSelectProps } from "../../../svx/browser/tbxctrls/StyleToolboxSelect";
import type { WriterParagraphStyleOption } from "./writer-view-projection";
/** Projects actual owning style items at paint time;the document retains all style state. @param shell - Actual owning shell when attached. @param options - Current style entries. @param resource - Localized resource lookup. @returns Shared style box paint and size ports. */
export function useWriterStylePreviews(
  shell: SwDocShell | undefined,
  options: readonly WriterParagraphStyleOption[],
  resource: (id: string) => { readonly label: string },
): Pick<StyleToolboxSelectProps, "renderItem" | "popupWidth"> {
  const controller = useMemo(
    /** Keeps native optional font members with this actual style box. @returns UI metric owner. */ () =>
      new BrowserStylePreviewState(options),
    [options],
  );
  const popupWidth = useSyncExternalStore(
    controller.Subscribe,
    controller.GetWidth,
    controller.GetWidth,
  );
  if (shell === undefined) return { popupWidth };
  return {
    popupWidth,
    renderItem:
      /** Reads source items from the actual shell during row paint. @param style - Real pool entry. @param selected - Actual popup selection. @returns Preview row. */
      (style, selected) =>
        createElement(StylePreviewRow, {
          id: style.id,
          name: style.resourceId === undefined ? style.name : resource(style.resourceId).label,
          selected,
          source: {
            controller,
            mapUnit: shell.GetMapUnit(),
            getItemSet:
              /** Retains the source default-style fallback after an unsuccessful lookup. @returns Actual flattened preview items or no closed document. */ () => {
                if (shell.GetDocumentState().lifecycle === "closed") return undefined;
                const doc = shell.GetDoc();
                return (
                  getParagraphStyleItemSetForPreview(doc, style.id) ??
                  flattenSwFormatForPreview(doc.GetDfltTextFormatColl())
                );
              },
          },
        }),
  };
}

/**
 * @fileoverview Imports the bounded browser HTML transfer subset at the pinned
 * LibreOffice `sw/source/filter/html/swhtml.cxx` boundary.
 */

import { WRITER_MAX_LIST_LEVEL } from "../../core/doc/list";
import {
  createWriterTextRuns,
  normalizeWriterTextRuns,
  type WriterCharacterAttributes,
  type WriterTextRun,
} from "../../core/txtnode/ndtxt";

/** One safe paragraph imported from a transfer document. */
export interface WriterClipboardPasteParagraph {
  readonly listKind: "bullet" | "none" | "numbered";
  readonly listLevel: number;
  readonly runs: readonly WriterTextRun[];
}

/** Bounded Writer text imported from rich or plain clipboard formats. */
export interface WriterClipboardPaste {
  readonly isBlock: boolean;
  readonly paragraphs: readonly WriterClipboardPasteParagraph[];
  readonly source: "html" | "plain-text";
}

const defaultPasteCharacterAttributes: WriterCharacterAttributes = {
  bold: false,
  italic: false,
  underline: false,
};

/** Imports HTML through the bounded Writer HTML filter and falls back to plain text. @param html - Rich clipboard markup. @param plainText - Plain fallback text. @param document - Detached-element owner for browser parsing. @returns Bounded paste data or undefined when empty. */
export function parseWriterClipboardPaste(
  html: string,
  plainText: string,
  document: Document,
): WriterClipboardPaste | undefined {
  if (html.trim().length > 0) {
    const container = document.createElement("div");
    container.innerHTML = html;
    const parsed = parseWriterClipboardHtmlDocument(container);
    if (
      parsed.paragraphs.some(
        /** Tests one imported paragraph for visible runs. @param paragraph - Imported paragraph. @returns Whether it contains runs. */ (
          paragraph,
        ) => paragraph.runs.length > 0,
      ) ||
      container.textContent === ""
    )
      return { ...parsed, source: "html" };
  }
  if (plainText.length === 0) return undefined;
  const lines = plainText.split(/\r\n?|\n/u);
  return {
    isBlock: lines.length > 1,
    paragraphs: lines.map(
      /** Converts one plain-text line to a Writer paragraph. @param text - Line text. @returns Imported paragraph. */ (
        text,
      ) => ({
        listKind: "none",
        listLevel: 0,
        runs: createWriterTextRuns(text),
      }),
    ),
    source: "plain-text",
  };
}

/** Imports safe block and list structure from one detached HTML document. @param container - Detached parsed HTML root. @returns Imported block structure. */
function parseWriterClipboardHtmlDocument(
  container: HTMLElement,
): Readonly<{ isBlock: boolean; paragraphs: readonly WriterClipboardPasteParagraph[] }> {
  const hasBlockContent = Array.from(container.children).some(isWriterClipboardBlockElement);
  if (!hasBlockContent)
    return {
      isBlock: false,
      paragraphs: [
        {
          listKind: "none",
          listLevel: 0,
          runs: parseWriterClipboardHtml(container, defaultPasteCharacterAttributes),
        },
      ],
    };
  const paragraphs: WriterClipboardPasteParagraph[] = [];
  container.childNodes.forEach(
    /** Imports one root node. @param node - Detached root child. @returns Nothing. */ (node) => {
      if (node instanceof Text) {
        if (node.data.trim().length > 0)
          paragraphs.push({
            listKind: "none",
            listLevel: 0,
            runs: [{ attributes: defaultPasteCharacterAttributes, text: node.data }],
          });
        return;
      }
      if (!(node instanceof HTMLElement)) return;
      if (node.tagName === "OL" || node.tagName === "UL") {
        parseWriterClipboardList(node, 0, paragraphs);
        return;
      }
      if (node.tagName === "P" || node.tagName === "DIV")
        paragraphs.push({
          listKind: "none",
          listLevel: 0,
          runs: parseWriterClipboardHtml(node, defaultPasteCharacterAttributes),
        });
    },
  );
  return { isBlock: true, paragraphs };
}

/** Imports one semantic list and its nested list items in visual order. @param list - Current list element. @param level - Zero-based nesting level. @param paragraphs - Mutable import accumulator. @returns Nothing. */
function parseWriterClipboardList(
  list: HTMLElement,
  level: number,
  paragraphs: WriterClipboardPasteParagraph[],
): void {
  const listKind = list.tagName === "OL" ? "numbered" : "bullet";
  Array.from(list.children).forEach(
    /** Imports one list item. @param child - Candidate list child. @returns Nothing. */ (
      child,
    ) => {
      if (!(child instanceof HTMLElement) || child.tagName !== "LI") return;
      paragraphs.push({
        listKind,
        listLevel: Math.min(level, WRITER_MAX_LIST_LEVEL),
        runs: parseWriterClipboardHtml(child, defaultPasteCharacterAttributes, true),
      });
      Array.from(child.children).forEach(
        /** Recurses into one nested semantic list. @param nested - Candidate nested child. @returns Nothing. */ (
          nested,
        ) => {
          if (nested instanceof HTMLElement && (nested.tagName === "OL" || nested.tagName === "UL"))
            parseWriterClipboardList(nested, level + 1, paragraphs);
        },
      );
    },
  );
}

/** Reports whether one root child establishes supported block structure. @param element - Root HTML child. @returns Whether it is a supported block. */
function isWriterClipboardBlockElement(element: Element): boolean {
  return ["P", "DIV", "OL", "UL"].includes(element.tagName);
}

/** Imports safe semantic descendants as canonical direct-format runs. @param parent - Current HTML parent. @param inheritedAttributes - Attributes inherited from ancestors. @param excludeLists - Whether nested lists are imported separately. @returns Normalized Writer runs. */
function parseWriterClipboardHtml(
  parent: HTMLElement,
  inheritedAttributes: WriterCharacterAttributes,
  excludeLists = false,
): readonly WriterTextRun[] {
  const runs: WriterTextRun[] = [];
  parent.childNodes.forEach(
    /** Imports one inline node. @param node - Current child. @returns Nothing. */ (node) => {
      if (node instanceof Text) {
        runs.push({ attributes: inheritedAttributes, text: node.data });
        return;
      }
      if (!(node instanceof HTMLElement)) return;
      if (node.tagName === "SCRIPT" || node.tagName === "STYLE") return;
      if (excludeLists && (node.tagName === "OL" || node.tagName === "UL")) return;
      if (node.tagName === "BR") {
        runs.push({ attributes: inheritedAttributes, text: "\n" });
        return;
      }
      runs.push(
        ...parseWriterClipboardHtml(
          node,
          getWriterClipboardNodeAttributes(node, inheritedAttributes),
          excludeLists,
        ),
      );
    },
  );
  return normalizeWriterTextRuns(runs);
}

/** Maps the allowlisted HTML inline subset to Writer direct attributes. @param element - Current inline element. @param inheritedAttributes - Parent attributes. @returns Effective Writer attributes. */
function getWriterClipboardNodeAttributes(
  element: HTMLElement,
  inheritedAttributes: WriterCharacterAttributes,
): WriterCharacterAttributes {
  return {
    ...(element.tagName === "SPAN" && element.style.fontFamily.trim().length > 0
      ? { fontFamily: element.style.fontFamily }
      : inheritedAttributes.fontFamily === undefined
        ? {}
        : { fontFamily: inheritedAttributes.fontFamily }),
    bold: inheritedAttributes.bold || element.tagName === "STRONG",
    italic: inheritedAttributes.italic || element.tagName === "EM",
    underline:
      inheritedAttributes.underline ||
      (element.tagName === "SPAN" && element.style.textDecoration === "underline"),
  };
}

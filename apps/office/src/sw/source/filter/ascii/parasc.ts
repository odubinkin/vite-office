/** @fileoverview Owns Unicode clipboard paragraph reading from native parasc.cxx. */
import type { SwPosition } from "../../core/crsr/pam";
import type { SwTextNode } from "../../core/txtnode/ndtxt";

/** Native shellio.hxx plain-text paragraph bound. */
const MAX_ASCII_PARA = 250000;

/** Prepares normalized browser Unicode text with native trailing-separator/control/wrap rules. @param text - Plain clipboard text. @returns Reader paragraphs. */
export function prepareWriterAsciiParagraphs(text: string): readonly string[] {
  if (text.includes("\f")) throw new Error("Writer ASCII page-break import is not implemented.");
  const normalized = text.replace(/\r\n?|\n/gu, "\n"),
    paragraphs: string[] = [],
    line: string[] = [];
  for (let index = 0; index < normalized.length; index++) {
    let character = normalized[index] as string;
    if (character === "\n") {
      if (index !== normalized.length - 1) {
        paragraphs.push(line.join(""));
        line.length = 0;
      }
      continue;
    }
    if (character === "\x1a" && index === normalized.length - 1) continue;
    if (character.charCodeAt(0) < 32 && character !== "\t") character = "#";
    if (
      (line.length >= MAX_ASCII_PARA - 100 && character === " ") ||
      line.length >= MAX_ASCII_PARA - 1
    ) {
      paragraphs.push(line.join(""));
      line.length = 0;
    }
    line.push(character);
  }
  paragraphs.push(line.join(""));
  return paragraphs;
}

/** Reads plain text at one native point using default EMPTYEXPAND and section-preserving splits. @param point - Reader-owned actual position. @param paragraphs - Prepared Unicode paragraphs. @returns Nothing. */
export function readWriterAsciiParagraphs(point: SwPosition, paragraphs: readonly string[]): void {
  const operations = (point.GetNode() as SwTextNode).GetDoc().GetDocumentContentOperationsManager();
  for (const [index, text] of paragraphs.entries()) {
    if (index !== 0) point.Assign(operations.SplitNode(point), 0);
    operations.InsertString(point, text);
  }
}

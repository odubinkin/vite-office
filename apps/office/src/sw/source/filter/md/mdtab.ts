/** @fileoverview Markdown table cell and alignment parsing following sw/source/filter/md/mdtab.cxx. */
import type { WriterParagraphAlignment } from "../../core/txtnode/ndtxt";

/** A represented table cell before native SwTable construction. */
export interface MarkdownCell {
  readonly text: string;
  readonly alignment: WriterParagraphAlignment;
}

/** Splits a GFM table row at actual pipe delimiters, preserving escaped and code-span pipes. @param source - Table line. @returns Cell text. */
export function splitMarkdownTableRow(source: string): readonly string[] {
  const cells: string[] = [];
  let cell = "",
    codeFence = 0;
  const line = source.trim().replace(/^\|/u, "").replace(/\|$/u, "");
  for (let index = 0; index < line.length; index++) {
    const character = line[index] as string;
    if (character === "\\" && line[index + 1] === "|") {
      cell += "|";
      index++;
    } else if (character === "`") {
      let count = 1;
      while (line[index + count] === "`") count++;
      codeFence = codeFence === count ? 0 : codeFence === 0 ? count : codeFence;
      cell += "`".repeat(count);
      index += count - 1;
    } else if (character === "|" && codeFence === 0) {
      cells.push(cell.trim());
      cell = "";
    } else cell += character;
  }
  cells.push(cell.trim());
  return cells;
}

/** Reads one Markdown table separator. @param source - Separator line. @returns Column adjustments, or undefined. */
export function readMarkdownTableAlignment(
  source: string,
): readonly WriterParagraphAlignment[] | undefined {
  const cells = splitMarkdownTableRow(source);
  if (
    cells.length === 0 ||
    cells.some(
      /** Computes the cell result. @param cell - Cell. @returns The computed result. */ (cell) =>
        !/^:?-+:?$/u.test(cell),
    )
  )
    return undefined;
  return cells.map(
    /** Computes the cell result. @param cell - Cell. @returns The computed result. */ (cell) =>
      cell.startsWith(":") && cell.endsWith(":") ? "center" : cell.endsWith(":") ? "right" : "left",
  );
}

/** Builds cell values and retains the first-row column count. @param source - Row line. @param alignments - Column adjustments. @returns Cells. */
export function readMarkdownTableRow(
  source: string,
  alignments: readonly WriterParagraphAlignment[],
): readonly MarkdownCell[] {
  const values = splitMarkdownTableRow(source);
  return alignments.map(
    /** Computes the alignment result. @param alignment - Alignment. @param index - Index. @returns The computed result. */ (
      alignment,
      index,
    ) => ({ text: values[index] ?? "", alignment }),
  );
}

/** @fileoverview Defines the bounded Writer transfer document consumed by browser export filters. */

/** Describes one selected Writer paragraph before a format writer serializes it. */
export interface WriterTransferParagraph {
  readonly html?: string;
  readonly listKind: "bullet" | "none" | "numbered";
  readonly listLevel: number;
  readonly marker: string | undefined;
  readonly style: string;
  readonly text: string;
}

/** @fileoverview Writer's common non-text content node and graphic/frame attribute range. */
import type { Size } from "../../../../tools/inc/gen";
import type { SwGrfFormatColl } from "../../../inc/fmtcol";
import {
  RES_FRMATR_BEGIN,
  RES_FRMATR_END,
  RES_GRFATR_BEGIN,
  RES_GRFATR_END,
  RES_UNKNOWNATR_BEGIN,
  RES_UNKNOWNATR_END,
} from "../../../inc/hintids";
import { SwContentNode, type SwStartNode } from "./node";
import type { SwNodes } from "./nodes";

/** Original Which ranges for the non-text content attribute set. */
export const aNoTextNodeSetRange = [
  [RES_FRMATR_BEGIN, RES_FRMATR_END - 1],
  [RES_GRFATR_BEGIN, RES_GRFATR_END - 1],
  [RES_UNKNOWNATR_BEGIN, RES_UNKNOWNATR_END - 1],
] as const;

/** Native content with physical extent and no text span. */
export abstract class SwNoTextNode extends SwContentNode {
  /** Creates a non-text content node with its actual graphic style. @param nodes - Native array. @param section - Containing section. @param coll - Native graphic format collection. @returns Nothing. */
  constructor(nodes: SwNodes, section: SwStartNode, coll: SwGrfFormatColl) {
    super(nodes, section, coll, "graphic");
  }

  /** Uses the original non-text content length. @returns Zero. */
  Len(): number {
    return 0;
  }

  /** Gets the physical extent of the content. @returns Size in twips. */
  abstract GetTwipSize(): Size;

  /** Selects native frame and graphic attributes. @returns The non-text WhichId range. */
  protected override GetAttrSetRanges(): readonly (readonly [number, number])[] {
    return aNoTextNodeSetRange;
  }
}

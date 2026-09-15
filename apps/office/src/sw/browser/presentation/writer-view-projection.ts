/** @fileoverview Projects the live Writer graph to immutable browser presentation values. */

import type { OfficeDocument } from "../../../sfx2/source/doc/objsh";
import type { SwDoc } from "../../source/core/doc/doc";
import type { WriterParagraphList } from "../../source/core/doc/list";
import type {
  WriterParagraphAlignment,
  WriterTextRun,
  SwTextNode,
} from "../../source/core/txtnode/ndtxt";
import type { WriterParagraphStyle } from "../../source/core/doc/fmtcol";
import type { WriterCursorSelection } from "../../source/uibase/wrtsh/wrtsh-selection";

/** Primitive/resource-ID projection of one text node. */
export interface WriterParagraphProjection {
  readonly alignment: WriterParagraphAlignment;
  readonly bulletChar?: string;
  readonly id: string;
  readonly list: WriterParagraphList;
  readonly listId: string;
  readonly numRuleName: string;
  readonly runs: readonly WriterTextRun[];
  readonly style: WriterParagraphStyle;
  readonly styleDisplayName: string;
  readonly text: string;
}

/** Immutable React store value with no mutable model references. */
export interface WriterPresentationProjection {
  readonly activeParagraph: WriterParagraphProjection;
  readonly activeParagraphIndex: number;
  readonly cursorSelection: WriterCursorSelection;
  readonly documentState: OfficeDocument;
  readonly modelRevision: number;
  readonly paragraphs: readonly WriterParagraphProjection[];
}

/** Keeps React keys outside SwTextNode and projects one live revision at a time. */
export class WriterViewProjection {
  /** Returns a stable view-only key for one live node. @param node - Canonical text node. @returns Projection key. */
  public GetNodeId(node: SwTextNode): string {
    return node.id;
  }

  /** Projects the current model revision without retaining mutable nodes. @param document - Canonical graph. @param activeParagraph - Shell target. @param cursorSelection - Browser cursor DTO. @param documentState - Shell state. @returns Immutable value graph. */
  public Project(
    document: SwDoc,
    activeParagraph: SwTextNode,
    cursorSelection: WriterCursorSelection,
    documentState: OfficeDocument,
  ): WriterPresentationProjection {
    const paragraphs = document.paragraphs.map(
      /** Projects one canonical text node. @param node - Live node. @returns Frozen primitive paragraph. */ (
        node,
      ) => {
        const bulletChar =
          node.list.kind === "bullet"
            ? node.GetNumRule()?.GetNumFormat(node.list.level).GetBulletChar()
            : undefined;
        return Object.freeze({
          alignment: node.alignment,
          ...(bulletChar === undefined ? {} : { bulletChar }),
          id: this.GetNodeId(node),
          list: Object.freeze({ ...node.list }),
          listId: node.GetListId(),
          numRuleName: node.GetNumRuleName(),
          runs: Object.freeze(
            node.runs.map(
              /** Freezes one primitive text run. @param run - Live run value. @returns Frozen run. */ (
                run,
              ) => Object.freeze({ ...run, attributes: Object.freeze({ ...run.attributes }) }),
            ),
          ),
          style: node.style,
          styleDisplayName: node.GetTextFormatColl().GetName(),
          text: node.text,
        });
      },
    );
    const activeParagraphIndex = document.paragraphs.indexOf(activeParagraph);
    return Object.freeze({
      activeParagraph: paragraphs[activeParagraphIndex] as WriterParagraphProjection,
      activeParagraphIndex,
      cursorSelection: Object.freeze(cursorSelection),
      documentState: Object.freeze({ ...documentState }),
      modelRevision: document.GetDocumentStateManager().GetModelRevision(),
      paragraphs: Object.freeze(paragraphs),
    });
  }
}

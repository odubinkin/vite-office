/** @fileoverview Projects the live Writer graph to immutable browser presentation values. */

import type { SwDoc } from "../../source/core/doc/doc";
import type { OfficeDocument } from "../../../sfx2/source/doc/objsh";
import type { WriterCursorSelection } from "../../source/uibase/wrtsh/wrtsh-selection";
import type { SwTextNode } from "../../source/core/txtnode/ndtxt";
import type { SwPaM } from "../../source/core/crsr/pam";
import type {
  WriterParagraphProjection,
  WriterPresentationProjection,
  WriterPresentationProjector,
} from "../../source/uibase/uiview/view";

export type {
  WriterParagraphProjection,
  WriterPresentationProjection,
} from "../../source/uibase/uiview/view";

/** Keeps React keys outside SwTextNode and projects one live revision at a time. */
export class WriterViewProjection implements WriterPresentationProjector {
  private nextNodeId = 1;
  private readonly nodeIds = new WeakMap<SwTextNode, string>();
  private readonly projectedNodes = new Map<string, SwTextNode>();

  /** Returns a stable view-only key for one live node. @param node - Canonical text node. @returns Projection key. */
  public GetNodeId(node: SwTextNode): string {
    const existing = this.nodeIds.get(node);
    if (existing !== undefined) return existing;
    const id = `writer-node-${this.nextNodeId++}`;
    this.nodeIds.set(node, id);
    this.projectedNodes.set(id, node);
    return id;
  }

  /** Resolves a view-only key without adding identity to SwNode. @param document - Expected owner. @param projectionId - View key. @returns Current node. */
  public ResolveNode(document: SwDoc, projectionId: string): SwTextNode | undefined {
    const node = this.projectedNodes.get(projectionId);
    return node?.GetDoc() === document && document.paragraphs.includes(node) ? node : undefined;
  }

  /** Projects the current model revision without retaining mutable nodes. @param document - Canonical graph. @param activeParagraph - Shell target. @param cursorSelection - Browser cursor DTO. @param documentState - Shell state. @returns Immutable value graph. */
  public Project(
    document: SwDoc,
    activeParagraph: SwTextNode,
    cursor: SwPaM,
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
        const number = node.list.kind === "numbered" ? node.GetListItemNumber() : undefined;
        const listMarker = bulletChar ?? (number === undefined ? undefined : `${number}.`);
        return Object.freeze({
          alignment: node.alignment,
          ...(bulletChar === undefined ? {} : { bulletChar }),
          id: this.GetNodeId(node),
          list: Object.freeze({ ...node.list }),
          listId: node.GetListId(),
          ...(listMarker === undefined ? {} : { listMarker }),
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
    const point = cursor.GetPoint();
    const mark = cursor.HasMark() ? cursor.GetMark() : undefined;
    const cursorSelection: WriterCursorSelection = {
      ...(mark === undefined
        ? {}
        : {
            mark: {
              offset: mark.GetContentIndex(),
              paragraphId: this.GetNodeId(mark.GetNode() as SwTextNode),
            },
          }),
      point: {
        offset: point.GetContentIndex(),
        paragraphId: this.GetNodeId(point.GetNode() as SwTextNode),
      },
    };
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

/** @fileoverview Projects the live Writer graph to immutable browser presentation values. */

import type { SwDoc } from "../../source/core/doc/doc";
import type { OfficeDocument } from "../../../sfx2/source/doc/objsh";
import type { SfxMediumOperationStatus } from "../../../sfx2/source/doc/docfile";
import type { WriterCursorSelection } from "../editor/writer-selection-types";
import type { SwTextNode, WriterParagraphAlignment } from "../../source/core/txtnode/ndtxt";
import {
  projectWriterTextRuns,
  type WriterTextRun,
} from "../../source/core/txtnode/text-run-projection";
import type { WriterParagraphList } from "../../source/core/doc/list";
import type { WriterParagraphStyle } from "../../source/core/doc/fmtcol";
import type { SwPaM } from "../../source/core/crsr/pam";
import { SwPosition } from "../../source/core/crsr/pam";
import type { SwWrtShell } from "../../source/uibase/wrtsh/wrtsh";
import type { SwView } from "../../source/uibase/uiview/view";
import {
  SvxFirstLineIndentItem,
  SvxLineSpacingItem,
  SvxRightMarginItem,
  SvxULSpaceItem,
} from "../../../editeng/source/items/paraitem";
import {
  SvxFontHeightItem,
  SvxFontItem,
  SvxPostureItem,
  SvxWeightItem,
} from "../../../editeng/source/items/textitem";
import {
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_POSTURE,
  RES_CHRATR_WEIGHT,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_PARATR_LINESPACING,
  RES_UL_SPACE,
} from "../../inc/hintids";
import { WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL } from "../../inc/poolfmt";

/** Browser selector metadata projected outside React from the Writer style pool. */
export interface WriterParagraphStyleOption {
  readonly depth: number;
  readonly group: (typeof WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL)[number]["group"];
  readonly id: string;
}

const paragraphStyleOptions = createParagraphStyleOptions();
/** Primitive/resource-ID projection of one text node, owned only by the browser presenter. */
export interface WriterParagraphProjection {
  readonly alignment: WriterParagraphAlignment;
  readonly bulletChar?: string;
  readonly computedStyle: WriterParagraphComputedStyle;
  readonly id: string;
  readonly list: WriterParagraphList;
  readonly listLayout?: WriterParagraphListLayout;
  readonly listId: string;
  readonly listMarker?: string;
  readonly textLeftMargin: number;
  readonly numRuleName: string;
  readonly runs: readonly WriterProjectedTextRun[];
  readonly style: WriterParagraphStyle;
  readonly styleDisplayName: string;
  readonly text: string;
}

/** Browser-ready numbering geometry resolved from the paragraph's active SwNumFormat. */
export interface WriterParagraphListLayout {
  readonly firstLineIndentPt: number;
  readonly indentAtPt: number;
  readonly labelFollowedBy: "listtab" | "nothing" | "space";
  readonly listTabPositionPt: number;
}

/** One text run with its linear-time projection boundary. */
export interface WriterProjectedTextRun extends WriterTextRun {
  readonly startOffset: number;
}

/** Browser-ready values projected from effective Writer paragraph items. */
export interface WriterParagraphComputedStyle {
  readonly firstLineIndentPt: number;
  readonly fontFamily?: string;
  readonly fontStyle: "italic" | "normal";
  readonly fontSizePt: number;
  readonly fontWeight: 400 | 700;
  readonly lineHeight: number;
  readonly lowerSpacingPt: number;
  readonly rightMarginPt: number;
  readonly upperSpacingPt: number;
}

/** Immutable browser presentation value with no mutable model references. */
export interface WriterPresentationProjection {
  readonly activeParagraph: WriterParagraphProjection;
  readonly activeParagraphIndex: number;
  readonly cursorSelection: WriterCursorSelection;
  readonly documentState: OfficeDocument;
  readonly modelRevision: number;
  readonly paragraphs: readonly WriterParagraphProjection[];
  readonly paragraphStyleOptions: readonly WriterParagraphStyleOption[];
}

/** Complete browser external-store snapshot. */
export interface WriterViewSnapshot extends WriterPresentationProjection {
  readonly isHorizontalRulerVisible: boolean;
  readonly isPropertiesSidebarVisible: boolean;
  readonly isStoragePending: boolean;
  readonly isStatusBarVisible: boolean;
  readonly mediumOperation: Readonly<SfxMediumOperationStatus>;
  readonly viewVersion: number;
}

/** Keeps React keys outside SwTextNode and projects one live revision at a time. */
export class WriterViewProjection {
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

  /** Resolves one browser projection key before focusing the Writer shell. @param document - Expected document. @param shell - Writer-native edit shell. @param projectionId - View-only paragraph key. @returns Whether the key resolved. */
  public FocusParagraph(document: SwDoc, shell: SwWrtShell, projectionId: string): boolean {
    const node = this.ResolveNode(document, projectionId);
    if (node === undefined) return false;
    shell.FocusNode(node);
    return true;
  }

  /** Converts browser projection endpoints to Writer-native positions before invoking the shell. @param document - Expected document. @param shell - Writer-native edit shell. @param selection - Browser cursor projection. @returns Whether the PaM changed. */
  public SetSelection(
    document: SwDoc,
    shell: SwWrtShell,
    selection: WriterCursorSelection,
  ): boolean {
    const pointNode = this.ResolveNode(document, selection.point.paragraphId);
    const markNode =
      selection.mark === undefined
        ? undefined
        : this.ResolveNode(document, selection.mark.paragraphId);
    if (pointNode === undefined || (selection.mark !== undefined && markNode === undefined))
      return false;
    return shell.SetPaM(
      new SwPosition(pointNode, selection.point.offset),
      selection.mark === undefined || markNode === undefined
        ? undefined
        : new SwPosition(markNode, selection.mark.offset),
    );
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
        const listMarker = node.GetListLabel();
        const listFormat =
          node.list.kind === "none" ? undefined : node.GetNumRule()?.GetNumFormat(node.list.level);
        const spacing = node.GetAttr(RES_UL_SPACE) as SvxULSpaceItem;
        let runOffset = 0;
        return Object.freeze({
          alignment: node.alignment,
          ...(bulletChar === undefined ? {} : { bulletChar }),
          id: this.GetNodeId(node),
          computedStyle: Object.freeze({
            firstLineIndentPt:
              (
                node.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
              ).ResolveTextFirstLineOffset() / 20,
            fontFamily: (node.GetAttr(RES_CHRATR_FONT) as SvxFontItem).GetResolvedFamilyName(),
            fontStyle: (node.GetAttr(RES_CHRATR_POSTURE) as SvxPostureItem).GetBoolValue()
              ? "italic"
              : "normal",
            fontSizePt: (node.GetAttr(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight() / 20,
            fontWeight: (node.GetAttr(RES_CHRATR_WEIGHT) as SvxWeightItem).GetBoolValue()
              ? 700
              : 400,
            lineHeight:
              ((node.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem).GetPropLineSpace() ||
                100) / 100,
            lowerSpacingPt: spacing.GetLower() / 20,
            rightMarginPt:
              (node.GetAttr(RES_MARGIN_RIGHT) as SvxRightMarginItem).ResolveRight() / 20,
            upperSpacingPt: spacing.GetUpper() / 20,
          }),
          list: Object.freeze({ ...node.list }),
          ...(listFormat === undefined
            ? {}
            : {
                listLayout: Object.freeze({
                  firstLineIndentPt: listFormat.GetFirstLineIndent() / 20,
                  indentAtPt: listFormat.GetIndentAt() / 20,
                  labelFollowedBy: listFormat.GetLabelFollowedBy(),
                  listTabPositionPt: listFormat.GetListtabPos() / 20,
                }),
              }),
          listId: node.GetListId(),
          ...(listMarker === undefined ? {} : { listMarker }),
          numRuleName: node.GetNumRuleName(),
          runs: Object.freeze(
            projectWriterTextRuns(node).map(
              /** Freezes one primitive text run. @param run - Live run value. @returns Frozen run. */ (
                run,
              ) => {
                const projected = Object.freeze({
                  ...run,
                  attributes: Object.freeze({ ...run.attributes }),
                  startOffset: runOffset,
                });
                runOffset += run.text.length;
                return projected;
              },
            ),
          ),
          style: node.style,
          styleDisplayName: node.GetTextFormatColl().GetName(),
          text: node.text,
          textLeftMargin: node.textLeftMargin,
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
      paragraphStyleOptions,
    });
  }
}

/** Resolves the immutable Writer style hierarchy once for binding-backed view snapshots. @returns Selector options. */
function createParagraphStyleOptions(): readonly WriterParagraphStyleOption[] {
  const parents = new Map(
    WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL.map(
      /** Indexes one style parent. @param style - Pool style. @returns ID and parent pair. */ (
        style,
      ) => [style.id, style.parentId],
    ),
  );
  return Object.freeze(
    WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL.map(
      /** Projects one style option. @param style - Pool style. @returns Immutable option. */ (
        style,
      ) => {
        let depth = 0;
        let parentId = style.parentId;
        while (parentId !== undefined && depth < 8) {
          depth += 1;
          parentId = parents.get(parentId);
        }
        return Object.freeze({ depth, group: style.group, id: style.id });
      },
    ),
  );
}

/** Owns browser projection caching and external-store subscriptions outside SwView. */
export class WriterViewStore {
  private cachedSnapshot: WriterViewSnapshot | undefined;
  private readonly listeners = new Set<() => void>();
  private readonly unsubscribe: () => void;

  /** Creates a browser store over one attached Writer view. @param view - Active Writer view. @param projection - Browser identity/projector. @returns Nothing. */
  public constructor(
    private readonly view: SwView,
    public readonly projection = new WriterViewProjection(),
  ) {
    this.unsubscribe = view
      .GetViewFrame()
      .GetBindings()
      .Subscribe(
        /** Invalidates and publishes the browser snapshot. @returns Nothing. */ () => {
          this.cachedSnapshot = undefined;
          for (const listener of this.listeners) listener();
        },
      );
  }

  public readonly GetSnapshot =
    /** Returns the immutable snapshot, retaining identity until Sfx invalidation. @returns Browser view snapshot. */
    (): WriterViewSnapshot => {
      if (this.cachedSnapshot !== undefined) return this.cachedSnapshot;
      const document = this.view.GetDocShell().GetDoc();
      const wrtShell = this.view.GetWrtShell();
      const projected = this.projection.Project(
        document,
        wrtShell.GetActiveParagraph(),
        wrtShell.GetCursor(),
        this.view.GetDocShell().GetDocumentState(),
      );
      this.cachedSnapshot = Object.freeze({
        ...projected,
        isHorizontalRulerVisible: this.view.IsHorizontalRulerVisible(),
        isPropertiesSidebarVisible: this.view.IsSidebarVisible(),
        isStatusBarVisible: this.view.IsStatusBarVisible(),
        isStoragePending: this.view.IsStoragePending(),
        mediumOperation: this.view.GetDocShell().GetMedium().GetLastOperation(),
        viewVersion: this.view.GetViewFrame().GetBindings().GetVersion(),
      });
      return this.cachedSnapshot;
    };

  public readonly Subscribe =
    /** Subscribes one browser presentation consumer. @param listener - Store callback. @returns Cleanup. */
    (listener: () => void): (() => void) => {
      this.listeners.add(listener);
      return /** Removes one listener. @returns Whether it existed. */ () =>
        this.listeners.delete(listener);
    };

  /** Releases the Sfx subscription and browser listeners. @returns Nothing. */
  public Close(): void {
    this.unsubscribe();
    this.listeners.clear();
  }
}

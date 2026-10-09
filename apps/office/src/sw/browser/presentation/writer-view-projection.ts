/** @fileoverview Projects the live Writer graph to immutable browser presentation values. */
import { WriterNativeFormatObserver } from "./writer-native-format-observer";
import {
  populateStyleToolbox,
  type StyleToolboxEntry,
} from "../../../svx/browser/tbxctrls/style-toolbox-control";
import { getWriterParagraphStyleCommandId } from "../../uiconfig/swriter/menubar/menubar-commands";
import { getWriterNumFormatBullet } from "../../source/core/doc/number";
import {
  resolveSwListTextLeftMargin,
  resolveSwListFirstLineIndent,
} from "../../source/core/txtnode/ndtxt-list-indent";

import type { SwDoc } from "../../source/core/doc/doc";
import type { SwLineNumberInfoValue } from "../../inc/lineinfo";
import type { SfxObjectShellState } from "../../../sfx2/source/doc/objsh";
import type { SfxMediumOperationStatus } from "../../../sfx2/source/doc/docfile";
import type { WriterCursorSelection } from "../editor/writer-selection-types";
import type { WriterParagraphAlignment } from "../../source/core/txtnode/ndtxt";
import { SwTextNode } from "../../source/core/txtnode/ndtxt";
import { SwAttrIter } from "../../source/core/text/itratr";
import { GetTextAttrMode } from "../../inc/swtypes";
import { SwFormatINetFormat } from "../../source/core/txtnode/fmtatr2";
import { SvxUnderlineItem } from "../../../editeng/source/items/textitem";
import { RES_CHRATR_UNDERLINE, RES_TXTATR_INETFMT } from "../../inc/hintids";
import { projectWriterParagraphList, type WriterParagraphList } from "../../source/core/doc/list";
import type { WriterParagraphStyle } from "../../source/core/doc/fmtcol";
import type { SwPaM } from "../../source/core/crsr/pam";
import { SwTableCursor } from "../../source/core/crsr/swcrsr";
import type { SwView } from "../../source/uibase/uiview/view";
import {
  SvxLineSpacingItem,
  SvxTabAdjust,
  SvxTabStopItem,
} from "../../../editeng/source/items/paraitem";
import {
  SvxFirstLineIndentItem,
  SvxRightMarginItem,
  SvxULSpaceItem,
} from "../../../editeng/source/items/frmitems";
import {
  SvxFontHeightItem,
  SvxFontItem,
  SvxPostureItem,
  SvxWeightItem,
} from "../../../editeng/source/items/textitem";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import {
  RES_CHRATR_COLOR,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_HIGHLIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_WEIGHT,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_PARATR_LINESPACING,
  RES_PARATR_TABSTOP,
  RES_KEEP,
  RES_LINENUMBER,
  RES_UL_SPACE,
} from "../../inc/hintids";
import { WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL } from "../../inc/poolfmt";
import type { WriterPageDescriptorValue } from "../../source/core/layout/pagedesc";
import { projectWriterLineHeightItem } from "../../source/core/text/itrform2";
import { resolveSwNumberPortionBackground } from "../../source/core/text/inftxt";
import type { SwViewOption } from "../../inc/viewopt";
import {
  resolveSwNumberPortionFont,
  type SwNumberPortionFont,
} from "../../source/core/text/txtfld";
import type { SwNumberingTabSettings } from "../../source/core/text/txttab";

/** Detached document style selector metadata. */
export type WriterParagraphStyleOption = StyleToolboxEntry;

/** Primitive/resource-ID projection of one text node, owned only by the browser presenter. */
export interface WriterParagraphProjection {
  /** Device caret painting follows the current native cursor's before-label state. */
  readonly inFrontOfLabel?: boolean;
  /** Minimum occupied label gap, separate from authored list indentation. */
  readonly listMarkerMinimumDistancePt?: number;
  /** Native tab search inputs for label-alignment numbering; legacy numbering has no following tab portion. */
  readonly listTabSettings?: Readonly<SwNumberingTabSettings>;
  /** Window-device decoration derived from the native marked list level and view options. */
  readonly listMarkerBackgroundColor?: string;
  /** Detached native font values used only by the numbering paint device. */
  readonly listMarkerFont?: Readonly<SwNumberPortionFont>;
  readonly alignment: WriterParagraphAlignment;
  readonly bulletChar?: string;
  readonly computedStyle: WriterParagraphComputedStyle;
  readonly id: string;
  readonly list: WriterParagraphList;
  readonly listLayout?: WriterParagraphListLayout;
  readonly listGeometryWins?: boolean;
  readonly listId: string;
  readonly listMarker?: string;
  readonly textLeftMargin: number;
  readonly uncountedListTextLeftPt?: number;
  readonly numRuleName: string;
  readonly nodeIndex: number;
  readonly runs: readonly WriterTextPortion[];
  readonly rulerTabStops?:
    | readonly Readonly<{ index: number; positionPt: number; adjustment: SvxTabAdjust }>[]
    | undefined;
  /** Effective tab spacing and origin; omitted detached values use Writer's 2 cm/relative defaults. */
  readonly rulerTabSettings?: Readonly<{ defaultDistance: number; relativeToIndent: boolean }>;
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

/** One immutable display portion; no filter or transfer record participates in rendering. */
export interface WriterTextPortion {
  readonly attributes: Readonly<{
    bold: boolean;
    italic: boolean;
    underline: boolean;
    color?: string;
    highlight?: string;
    fontFamily?: string;
    fontFamilyGeneric?: string;
    fontSizeTwips?: number;
  }>;
  readonly hyperlink?: Readonly<{ url: string; targetFrame?: string }>;
  readonly startOffset: number;
  readonly text: string;
}

/** Browser-ready values projected from effective Writer paragraph items. */
export interface WriterParagraphComputedStyle {
  /** Effective automatic first-line mode; omitted detached DTOs retain the manual default. */
  readonly autoFirstLineIndent?: boolean;
  readonly color?: string;
  readonly contextualSpacing?: boolean;
  readonly firstLineIndentPt: number;
  readonly fontFamily?: string;
  /** Layout offset distinct from the authored item; omitted detached DTOs retain their raw value. */
  readonly resolvedFirstLineIndentPt?: number;
  readonly fontFamilyGeneric?: string;
  readonly fontStyle: "italic" | "normal";
  readonly fontSizePt: number;
  readonly fontWeight: 400 | 700;
  readonly highlight?: string;
  readonly lineHeight: number;
  readonly lineSpacingMode?: "proportional" | "fixed" | "minimum" | "leading";
  readonly lineSpacingValue?: number;
  readonly fontIndependentLineSpacing?: boolean;
  readonly tabStopPositionPt?: number | undefined;
  readonly tabStopsPt?: readonly number[] | undefined;
  readonly keepWithNext?: boolean;
  readonly countLineNumbers?: boolean;
  readonly lowerSpacingPt: number;
  readonly rightMarginPt: number;
  readonly upperSpacingPt: number;
}

/** Immutable browser presentation value with no mutable model references. */
export interface WriterPresentationProjection {
  readonly selectedTableBoxes: readonly number[];
  readonly activeParagraph: WriterParagraphProjection;
  readonly activeParagraphIndex: number;
  readonly cursorSelection: WriterCursorSelection;
  readonly documentState: SfxObjectShellState;
  readonly lineNumberInfo: SwLineNumberInfoValue;
  readonly modelRevision: number;
  readonly paragraphs: readonly WriterParagraphProjection[];
  readonly textNodes: readonly WriterParagraphProjection[];
  readonly paragraphStyleOptions: readonly WriterParagraphStyleOption[];
  readonly pageDescriptor: WriterPageDescriptorValue;
  readonly pageDescriptors: readonly Readonly<{
    followName: string;
    value: WriterPageDescriptorValue;
  }>[];
  readonly paragraphSpacingSettings: Readonly<{
    paraSpaceMax: boolean;
    paraSpaceMaxAtPages: boolean;
  }>;
}

/** Complete browser external-store snapshot. */
export interface WriterViewSnapshot extends WriterPresentationProjection {
  readonly isHorizontalRulerVisible: boolean;
  readonly isVerticalRulerVisible: boolean;
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

  /** Returns a stable view-only key for one live node. @param node - Canonical text node. @returns Projection key. */
  public GetNodeId(node: SwTextNode): string {
    const existing = this.nodeIds.get(node);
    if (existing !== undefined) return existing;
    const id = `writer-node-${this.nextNodeId++}`;
    this.nodeIds.set(node, id);
    return id;
  }

  /** Projects the current model revision without retaining mutable nodes. @param document - Canonical graph. @param activeParagraph - Shell target. @param cursor - Native cursor. @param documentState - Shell state. @param viewOptions - Actual shell view options, absent for detached callers. @returns Immutable value graph. */
  public Project(
    document: SwDoc,
    activeParagraph: SwTextNode,
    cursor: SwPaM,
    documentState: SfxObjectShellState,
    viewOptions?: SwViewOption,
  ): WriterPresentationProjection {
    const inFrontOfLabel = !cursor.HasMark() && cursor.IsInFrontOfLabel();
    const defaultTabs = document
      .GetAttrPool()
      .GetUserOrPoolDefaultItem(RES_PARATR_TABSTOP) as SvxTabStopItem;
    const defaultTabDistance =
      (defaultTabs.Count() === 0 ? 1134 : defaultTabs.At(0).GetTabPos()) || 1;
    const tabsRelativeToIndent = document
      .GetDocumentSettingManager()
      .get("TABS_RELATIVE_TO_INDENT");
    const nodes = document.nodes.entries().filter(
      /** Selects connected text owners across body and cell sections. @param node - Actual node. @returns Whether text. */
      (node): node is SwTextNode => node instanceof SwTextNode,
    );
    const textNodes = nodes.map(
      /** Projects one canonical text node. @param node - Live node. @returns Frozen primitive paragraph. */ (
        node,
      ) => {
        const list = projectWriterParagraphList(node);
        const bulletChar =
          list.kind === "bullet"
            ? getWriterNumFormatBullet(node.GetNumRule()?.Get(list.level))
            : undefined;
        const listMarker = node.GetListLabel();
        const listMarkerFont = resolveSwNumberPortionFont(node);
        const listMarkerBackgroundColor =
          viewOptions === undefined
            ? undefined
            : resolveSwNumberPortionBackground(node, viewOptions);
        const uncountedTextLeft = node.IsCountedInList()
          ? undefined
          : resolveSwListTextLeftMargin(node);
        const listFormat =
          list.kind === "none" ? undefined : node.GetNum()?.GetNumRule()?.Get(list.level);
        const listTextLeft = resolveSwListTextLeftMargin(node) ?? node.GetParagraphTextLeftMargin();
        const spacing = node.GetAttr(RES_UL_SPACE) as SvxULSpaceItem;
        const lineSpacing = node.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem;
        const firstLine = node.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem;
        const tabItem = node.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
        const explicitTabStops = tabItem.GetStops().flatMap(
          /** Excludes default hit targets while retaining each explicit tab's item index. @param stop - Writer tab stop. @param index - Raw item index. @returns Immutable ruler identity. */
          (stop, index) =>
            stop.GetAdjustment() === SvxTabAdjust.Default
              ? []
              : [
                  Object.freeze({
                    index,
                    positionPt: stop.GetTabPos() / 20,
                    adjustment: stop.GetAdjustment(),
                  }),
                ],
        );
        const rulerTabStops = explicitTabStops.filter(
          /** Writer strips zero-position ruler inputs while retaining their model/format values. @param stop - Primitive explicit tab. @returns Ruler admission. */
          (stop) => stop.positionPt !== 0,
        );
        const tabStopsPt = explicitTabStops.map(
          /** Projects positions for paragraph formatting without discarding ruler identity. @param stop - Immutable ruler tab. @returns Position in points. */
          (stop) => stop.positionPt,
        );
        const color = (node.GetAttr(RES_CHRATR_COLOR) as SfxStringItem).GetValue();
        const highlight = (node.GetAttr(RES_CHRATR_HIGHLIGHT) as SfxStringItem).GetValue();
        const font = node.GetAttr(RES_CHRATR_FONT) as SvxFontItem;
        const fontFamilyGeneric = font.GetGenericFamily();
        return Object.freeze({
          ...(rulerTabStops.length === 0 ? {} : { rulerTabStops: Object.freeze(rulerTabStops) }),
          rulerTabSettings: Object.freeze({
            defaultDistance: tabItem.GetDefaultDistance() || defaultTabDistance,
            relativeToIndent: tabsRelativeToIndent,
          }),
          alignment: node.GetParagraphAlignment(),
          ...(bulletChar === undefined ? {} : { bulletChar }),
          id: this.GetNodeId(node),
          computedStyle: Object.freeze({
            autoFirstLineIndent: firstLine.IsAutoFirst(),
            ...(color === "auto" ? {} : { color }),
            contextualSpacing: spacing.GetContext(),
            firstLineIndentPt: firstLine.ResolveTextFirstLineOffset() / 20,
            resolvedFirstLineIndentPt: node.GetParagraphFirstLineIndent() / 20,
            fontFamily: font.GetResolvedFamilyName(),
            ...(fontFamilyGeneric === undefined ? {} : { fontFamilyGeneric }),
            fontStyle: (node.GetAttr(RES_CHRATR_POSTURE) as SvxPostureItem).GetBoolValue()
              ? "italic"
              : "normal",
            fontSizePt: (node.GetAttr(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight() / 20,
            fontWeight: (node.GetAttr(RES_CHRATR_WEIGHT) as SvxWeightItem).GetBoolValue()
              ? 700
              : 400,
            ...(highlight === "transparent" ? {} : { highlight }),
            lineHeight: projectWriterLineHeightItem(
              lineSpacing,
              (node.GetAttr(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight() / 20,
            ),
            lineSpacingMode: lineSpacing.GetMode(),
            lineSpacingValue: lineSpacing.GetValue(),
            fontIndependentLineSpacing: lineSpacing.IsFontIndependent(),
            tabStopPositionPt: tabStopsPt[0],
            tabStopsPt,
            keepWithNext: (node.GetAttr(RES_KEEP) as SfxBoolItem).GetValue(),
            countLineNumbers: (node.GetAttr(RES_LINENUMBER) as SfxBoolItem).GetValue(),
            lowerSpacingPt: spacing.GetLower() / 20,
            rightMarginPt:
              (node.GetAttr(RES_MARGIN_RIGHT) as SvxRightMarginItem).ResolveRight() / 20,
            upperSpacingPt: spacing.GetUpper() / 20,
          }),
          list: Object.freeze({ ...list }),
          ...(listFormat === undefined
            ? {}
            : {
                listMarkerMinimumDistancePt:
                  listFormat.GetPositionAndSpaceMode() === "label-alignment"
                    ? 0
                    : listFormat.GetCharTextDistance() / 20,
                ...(listFormat.GetPositionAndSpaceMode() === "label-alignment" &&
                listFormat.GetLabelFollowedBy() === "listtab"
                  ? {
                      listTabSettings: Object.freeze({
                        defaultDistance: defaultTabDistance,
                        relativeToIndent: tabsRelativeToIndent,
                        tabCompat: document.GetDocumentSettingManager().get("TAB_COMPAT"),
                        tabAtLeftIndent: document
                          .GetDocumentSettingManager()
                          .get("TAB_AT_LEFT_INDENT_FOR_PARA_IN_LIST"),
                        stops: Object.freeze(
                          tabItem.GetStops().map(
                            /** Copies original native tabs without filtering zero/default entries. @param stop - Original tab. @returns Immutable native inputs. */
                            (stop) =>
                              Object.freeze({
                                position: stop.GetTabPos(),
                                adjustment: stop.GetAdjustment(),
                              }),
                          ),
                        ),
                      }),
                    }
                  : {}),
                listLayout: Object.freeze({
                  firstLineIndentPt: resolveSwListFirstLineIndent(node) / 20,
                  indentAtPt: listTextLeft / 20,
                  labelFollowedBy:
                    listFormat.GetPositionAndSpaceMode() === "label-alignment"
                      ? listFormat.GetLabelFollowedBy()
                      : "listtab",
                  listTabPositionPt:
                    (listFormat.GetPositionAndSpaceMode() === "label-alignment"
                      ? listFormat.GetListtabPos()
                      : listFormat.GetAbsLSpace() + listFormat.GetCharTextDistance()) / 20,
                }),
              }),
          ...(node.DoesListGeometryWin() ? { listGeometryWins: true } : {}),
          listId: node.GetListId(),
          ...(inFrontOfLabel && cursor.GetPoint().GetNode() === node
            ? { inFrontOfLabel: true }
            : {}),
          ...(listMarker === undefined ? {} : { listMarker }),
          ...(listMarkerFont === undefined ? {} : { listMarkerFont }),
          ...(listMarkerBackgroundColor === undefined ? {} : { listMarkerBackgroundColor }),
          numRuleName: node.GetNumRuleName(),
          nodeIndex: node.GetIndex(),
          runs: projectTextPortions(node),
          style: node.GetParagraphStyle(),
          styleDisplayName: node.GetTextFormatColl().GetName(),
          text: node.GetText(),
          textLeftMargin: node.GetParagraphTextLeftMargin(),
          ...(uncountedTextLeft === undefined
            ? {}
            : { uncountedListTextLeftPt: uncountedTextLeft / 20 }),
        });
      },
    );
    const bodyNodes = document.paragraphs;
    const paragraphs = bodyNodes.map(
      /** Keeps body layout separate from cell text owners. @param node - Body node. @returns Immutable display paragraph. */
      (node) => textNodes[nodes.indexOf(node)] as WriterParagraphProjection,
    );
    const activeParagraphIndex = bodyNodes.indexOf(activeParagraph);
    const point = cursor.GetPoint();
    const mark = cursor.HasMark() ? cursor.GetMark() : undefined;
    const cursorSelection: WriterCursorSelection = {
      ...(mark === undefined
        ? {}
        : {
            mark: {
              nodeIndex: mark.GetNodeIndex(),
              offset: mark.GetContentIndex(),
              paragraphId: this.GetNodeId(mark.GetNode() as SwTextNode),
            },
          }),
      point: {
        ...(inFrontOfLabel ? { inFrontOfLabel: true } : {}),
        nodeIndex: point.GetNodeIndex(),
        offset: point.GetContentIndex(),
        paragraphId: this.GetNodeId(point.GetNode() as SwTextNode),
      },
    };
    return Object.freeze({
      selectedTableBoxes: Object.freeze(
        cursor instanceof SwTableCursor
          ? cursor
              .GetSelectedBoxes()
              .map(
                /** Projects actual native table ownership. @param box - Current owner. @returns Operation result. */ (
                  box,
                ) => box.GetStartNode().GetIndex(),
              )
          : [],
      ),
      activeParagraph: textNodes[nodes.indexOf(activeParagraph)] as WriterParagraphProjection,
      activeParagraphIndex,
      cursorSelection: Object.freeze(cursorSelection),
      documentState: Object.freeze({ ...documentState }),
      lineNumberInfo: Object.freeze(document.GetLineNumberInfo().QueryValue()),
      modelRevision: document.GetDocumentStateManager().GetModelRevision(),
      paragraphs: Object.freeze(paragraphs),
      textNodes: Object.freeze(textNodes),
      paragraphStyleOptions: createParagraphStyleOptions(document),
      pageDescriptor: document.GetPageDesc().GetValue(),
      pageDescriptors: Object.freeze(
        Array.from(
          { length: document.GetPageDescCnt() },
          /** Builds one paragraph frame input. @param _ - Source paragraph slot. @param index - Paragraph position. @returns Frame input. */ (
            _,
            index,
          ) => {
            const descriptor = document.GetPageDesc(index);
            return Object.freeze({
              followName: descriptor.GetFollow().GetName(),
              value: descriptor.GetValue(),
            });
          },
        ),
      ),
      paragraphSpacingSettings: Object.freeze({
        paraSpaceMax: document.GetDocumentSettingManager().get("PARA_SPACE_MAX"),
        paraSpaceMaxAtPages: document.GetDocumentSettingManager().get("PARA_SPACE_MAX_AT_PAGES"),
      }),
    });
  }
}

/** Writer InitializeStyles order from native tbcontrl.cxx, before document pool iteration. */
const writerDefaultStyleIds = [
  "default",
  "text-body",
  "title",
  "subtitle",
  "heading-1",
  "heading-2",
  "heading-3",
  "heading-4",
  "quotations",
  "preformatted-text",
] as const;

/** Projects actual names without creating unused pool collections during a read. @param document - Current owner. @returns Immutable selector entries. */
function createParagraphStyleOptions(document: SwDoc): readonly WriterParagraphStyleOption[] {
  /** Resolves actual names and localizable builtin resources. @param id - Stable identity. @param name - Native display name. @returns Detached entry. */
  function entry(id: string, name: string): StyleToolboxEntry {
    const definition = WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL.find(
      /** Finds supported metadata. @param style - Pool metadata. @returns Identity match. */
      (style) => style.id === id,
    );
    const builtinName =
      definition?.name === "Standard" ? "Default Paragraph Style" : definition?.name;
    return {
      id,
      name,
      ...(name === builtinName ? { resourceId: getWriterParagraphStyleCommandId(id) } : {}),
    };
  }
  const collections = document.GetTextFormatColls();
  return populateStyleToolbox({
    defaults: writerDefaultStyleIds.flatMap(
      /** Resolves known defaults without pool materialization. @param id - Builtin identity. @returns Entries. */
      (id) =>
        WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL.filter(
          /** Matches one native default. @param style - Pool metadata. @returns Match. */
          (style) => style.id === id,
        ).map(
          /** Resolves the existing or factory name. @param definition - Pool metadata. @returns Entry. */
          (definition) => {
            const factoryName =
              definition.name === "Standard" ? "Default Paragraph Style" : definition.name;
            return entry(id, document.FindTextFormatColl(id)?.GetName() ?? factoryName);
          },
        ),
    ),
    used: collections
      .filter(
        /** Queries document dependencies. @param collection - Owner. @returns Usage. */
        (collection) => document.IsUsed(collection),
      )
      .map(
        /** Detaches a used owner. @param collection - Owner. @returns Entry. */
        (collection) => entry(collection.id, collection.GetName()),
      ),
    favourites: [],
    userDefined: collections
      .filter(
        /** Selects custom declarations. @param collection - Owner. @returns User-defined flag. */
        (collection) => collection.poolId === 0,
      )
      .map(
        /** Detaches a custom owner. @param collection - Owner. @returns Entry. */
        (collection) => entry(collection.id, collection.GetName()),
      ),
  });
}

/** Owns browser projection caching and external-store subscriptions outside SwView. */
export class WriterViewStore {
  private cachedSnapshot: WriterViewSnapshot | undefined;
  private readonly listeners = new Set<() => void>();
  private readonly unsubscribe: () => void;
  private readonly formatObserver: WriterNativeFormatObserver;

  /** Creates a browser store over one attached Writer view. @param view - Active Writer view. @param projection - Browser identity/projector. @returns Nothing. */
  public constructor(
    private readonly view: SwView,
    public readonly projection = new WriterViewProjection(),
  ) {
    this.formatObserver = new WriterNativeFormatObserver(view);
    this.unsubscribe = view
      .GetViewFrame()
      .GetBindings()
      .Subscribe(
        /** Invalidates and publishes the browser snapshot. @returns Nothing. */ () => {
          this.formatObserver.Sync();
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
        wrtShell.getShellCursor(),
        this.view.GetDocShell().GetDocumentState(),
        wrtShell.GetViewOptions(),
      );
      this.cachedSnapshot = Object.freeze({
        ...projected,
        isHorizontalRulerVisible: this.view.IsHorizontalRulerVisible(),
        isVerticalRulerVisible: this.view.IsVerticalRulerVisible(),
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
    this.formatObserver.Close();
    this.listeners.clear();
  }
}

/** Projects native item stacks at text boundaries into immutable platform display values. @param node - Actual body or cell owner. @returns Frozen display portions. */
function projectTextPortions(node: SwTextNode): readonly WriterTextPortion[] {
  const iterator = new SwAttrIter(node),
    portions: WriterTextPortion[] = [];
  const inherited = node.GetSwAttrSet(),
    handler = iterator.GetAttrHandler();
  /** Tests whether an optional display item is authored or overrides the paragraph default. @param which - Item family. @returns Whether a span needs its value. */
  function authored(which: number): boolean {
    return (
      inherited.GetItemIfSet(which, true) !== undefined ||
      handler.ReadItem(which) !== node.GetAttr(which)
    );
  }
  for (let start = 0; start < node.Len();) {
    iterator.Seek(start);
    const end = iterator.GetNextAttr(),
      font = handler.ReadItem(RES_CHRATR_FONT) as SvxFontItem;
    const inet = node.GetTextAttrAt(start, RES_TXTATR_INETFMT, GetTextAttrMode.Default)?.GetAttr();
    const link = inet instanceof SwFormatINetFormat ? inet.GetHyperlink() : undefined;
    const generic = font.GetGenericFamily();
    portions.push(
      Object.freeze({
        startOffset: start,
        text: node.GetText().slice(start, end),
        attributes: Object.freeze({
          bold: (handler.ReadItem(RES_CHRATR_WEIGHT) as SvxWeightItem).GetBoolValue(),
          italic: (handler.ReadItem(RES_CHRATR_POSTURE) as SvxPostureItem).GetBoolValue(),
          underline: (handler.ReadItem(RES_CHRATR_UNDERLINE) as SvxUnderlineItem).GetBoolValue(),
          ...(authored(RES_CHRATR_COLOR)
            ? { color: (handler.ReadItem(RES_CHRATR_COLOR) as SfxStringItem).GetValue() }
            : {}),
          ...(authored(RES_CHRATR_HIGHLIGHT)
            ? { highlight: (handler.ReadItem(RES_CHRATR_HIGHLIGHT) as SfxStringItem).GetValue() }
            : {}),
          ...(authored(RES_CHRATR_FONT)
            ? {
                fontFamily: font.GetResolvedFamilyName(),
                ...(generic === undefined ? {} : { fontFamilyGeneric: generic }),
              }
            : {}),
          ...(authored(RES_CHRATR_FONTSIZE)
            ? {
                fontSizeTwips: (
                  handler.ReadItem(RES_CHRATR_FONTSIZE) as SvxFontHeightItem
                ).GetHeight(),
              }
            : {}),
        }),
        ...(link === undefined
          ? {}
          : {
              hyperlink: Object.freeze({
                url: link.url,
                ...(link.targetFrame === undefined ? {} : { targetFrame: link.targetFrame }),
              }),
            }),
      }),
    );
    start = end;
  }
  return Object.freeze(portions);
}

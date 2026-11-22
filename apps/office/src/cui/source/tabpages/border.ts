/** @fileoverview Owns the represented native border tab page and separate item-set deltas. */
import { Color } from "../../../tools/inc/color";
import {
  SvxBoxItem,
  SvxBoxInfoItemLine,
  SvxBoxInfoItem,
  SvxBoxInfoItemValidFlags as Valid,
} from "../../../editeng/source/items/frmitems";
import { SvxBorderLineStyle as Style } from "../../../editeng/source/items/borderline";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { SfxItemSet, SfxItemState } from "../../../svl/source/items/itemset";
import { SvxLineItem } from "../../../editeng/inc/lineitem";
import { SvxMarginItem } from "../../../svx/source/items/algitem";
import { SID_ATTR_BORDER_INNER } from "../../../svx/inc/svxids";
import {
  FrameSelector,
  FrameBorderType as Edge,
  FrameBorderState as State,
  FrameSelFlags,
} from "../../../svx/source/dialog/frmsel";

/** Native line-style list order from FillLineListBox_Impl. */
const lineStyles = [
  Style.SOLID,
  Style.DOTTED,
  Style.DASHED,
  Style.FINE_DASHED,
  Style.DASH_DOT,
  Style.DASH_DOT_DOT,
  Style.DOUBLE,
  Style.DOUBLE_THIN,
  Style.THINTHICK_SMALLGAP,
  Style.THINTHICK_MEDIUMGAP,
  Style.THINTHICK_LARGEGAP,
  Style.THICKTHIN_SMALLGAP,
  Style.THICKTHIN_MEDIUMGAP,
  Style.THICKTHIN_LARGEGAP,
  Style.EMBOSSED,
  Style.ENGRAVED,
  Style.OUTSET,
  Style.INSET,
] as const;
/** Native preset point widths, measured in hundredths of a point. */
const lineWidths = [5, 50, 75, 150, 225, 450] as const;
/** Native four outer and two inner item mappings. */
const edges = [
  [Edge.Top, 0, Valid.TOP],
  [Edge.Bottom, 1, Valid.BOTTOM],
  [Edge.Left, 2, Valid.LEFT],
  [Edge.Right, 3, Valid.RIGHT],
  [Edge.Horizontal, 0, Valid.HORI],
  [Edge.Vertical, 1, Valid.VERT],
] as const;
/** Native style transition minimum, in twips. @param style - Native line style. @returns Source transition width. */
function minimumLineWidth(style: Style): number {
  if (style === Style.NONE) return 0;
  if (style === Style.THINTHICK_SMALLGAP || style === Style.THICKTHIN_SMALLGAP) return 20;
  if (style === Style.OUTSET || style === Style.INSET) return 10;
  return 15;
}

/** Native page creation values supplied by the application. */
export interface BorderPageOptions {
  readonly marginWhich?: number;
  readonly defaultWidth?: number;
  readonly styles?: readonly Style[];
  readonly diagonalWhich?: readonly [number, number];
  readonly removeAdjacent?: boolean;
}

/** Owns represented border widgets; shadow/diagonal items remain separate native obligations. */
export class SvxBorderTabPage {
  public readonly frameSelector = new FrameSelector();
  private readonly original: SfxItemSet;
  private readonly oldBox: SvxBoxItem | undefined;
  private readonly oldInfo: SvxBoxInfoItem | undefined;
  private readonly oldMargin: SvxMarginItem | undefined;
  private readonly oldMerge: SfxBoolItem | undefined;
  private merge: boolean | undefined;
  private savedMerge: boolean | undefined;
  private readonly horizontal: boolean;
  private readonly vertical: boolean;
  private readonly distanceVisible: boolean;
  private readonly distances: (number | undefined)[] = [0, 0, 0, 0];
  private readonly savedDistances: (number | undefined)[] = [0, 0, 0, 0];
  private readonly modified: boolean[] = [false, false, false, false];
  private minimumDistance = 0;
  private sync = true;
  private style = Style.SOLID;
  private width = 5;
  private customWidth = false;
  private readonly color = new Color();
  private preset: number | undefined;
  private removeAdjacent = false;
  /** Captures owned input, independent of document mutation. @param input - Native original items. @param boxWhich - Pool's outer box identity. @param mergeWhich - Mapped Writer table-mode item. @param infoWhich - Pool's inner border item identity. @param options - Native app-supplied page defaults. @returns Nothing. */
  public constructor(
    input: SfxItemSet,
    private readonly boxWhich: number,
    private readonly mergeWhich?: number,
    private readonly infoWhich: number = SID_ATTR_BORDER_INNER,
    private readonly options: BorderPageOptions = {},
  ) {
    this.original = input.Clone();
    const box =
      input.GetItemState(boxWhich) >= SfxItemState.DEFAULT ? input.Get(boxWhich) : undefined;
    const info =
      input.GetItemState(this.infoWhich) >= SfxItemState.DEFAULT
        ? input.Get(this.infoWhich)
        : undefined;
    const merge =
      mergeWhich !== undefined && input.GetItemState(mergeWhich) >= SfxItemState.DEFAULT
        ? input.Get(mergeWhich)
        : undefined;
    const margin =
      options.marginWhich === undefined ? undefined : this.original.Get(options.marginWhich);
    this.oldMargin = margin instanceof SvxMarginItem ? margin : undefined;
    this.oldMerge = merge instanceof SfxBoolItem ? merge.Clone() : undefined;
    this.oldBox = box instanceof SvxBoxItem ? box.Clone() : undefined;
    this.oldInfo = info instanceof SvxBoxInfoItem ? info.Clone() : undefined;
    this.horizontal = this.oldInfo?.IsHor() ?? false;
    this.vertical = this.oldInfo?.IsVer() ?? false;
    this.distanceVisible = this.oldMargin !== undefined || (this.oldInfo?.IsDist() ?? false);
    this.Reset();
  }
  /** Restores source frame lines, saved metrics, uniform line controls and selection. @returns Nothing. */
  public Reset(): void {
    this.merge = this.savedMerge = this.oldMerge?.GetValue();
    const selector = this.frameSelector;
    selector.Initialize(
      FrameSelFlags.Outer |
        (this.horizontal ? FrameSelFlags.InnerHorizontal : 0) |
        (this.vertical ? FrameSelFlags.InnerVertical : 0) |
        (this.options.diagonalWhich ? FrameSelFlags.DiagonalTLBR | FrameSelFlags.DiagonalBLTR : 0) |
        (!this.oldInfo?.IsValid(Valid.DISABLE) ? FrameSelFlags.DontCare : 0),
    );
    this.modified.fill(false);
    this.minimumDistance = this.oldInfo?.GetDefDist() ?? 0;
    this.distances.fill(this.minimumDistance);
    if (this.oldBox !== undefined && this.oldInfo !== undefined) {
      for (const [edge, itemEdge, valid] of edges)
        if (selector.GetEnabledBorders().includes(edge)) {
          if (this.oldInfo.IsValid(valid))
            selector.ShowBorder(
              edge,
              edge <= Edge.Bottom
                ? this.oldBox.GetLine(itemEdge)
                : this.oldInfo.GetLine(itemEdge as SvxBoxInfoItemLine),
            );
          else selector.SetBorderDontCare(edge);
        }
      if (this.distanceVisible && !this.oldMargin) {
        for (let edge = 0; edge < 4; edge++) this.distances[edge] = this.oldBox.GetDistance(edge);
        const visible = selector.IsAnyBorderVisible(),
          expected = visible ? this.minimumDistance : 0;
        if (
          (this.oldBox.GetSmallestDistance() !== 0 || visible) &&
          this.distances.some(
            /** Detects source-authored distances that inhibit automatic defaults. @param value - Original metric. @returns Whether different. */ (
              value,
            ) => value !== expected,
          )
        )
          this.modified.fill(true);
      }
    } else {
      selector.HideAllBorders();
      if (this.distanceVisible && this.oldBox === undefined) this.distances.fill(undefined);
    }
    if (this.options.diagonalWhich) {
      for (const [index, which] of this.options.diagonalWhich.entries()) {
        const edge = index === 0 ? Edge.TLBR : Edge.BLTR;
        if (this.original.GetItemState(which) >= SfxItemState.DEFAULT) {
          const item = this.original.Get(which) as SvxLineItem;
          selector.ShowBorder(edge, item.GetLine() ?? undefined);
        } else selector.SetBorderDontCare(edge);
      }
    }
    if (this.oldMargin) {
      const margin = this.oldMargin;
      const state = this.original.GetItemState(margin.Which());
      this.distances.fill(undefined);
      if (state >= SfxItemState.DEFAULT) {
        this.distances[0] = margin.GetTopMargin();
        this.distances[1] = margin.GetBottomMargin();
        this.distances[2] = margin.GetLeftMargin();
        this.distances[3] = margin.GetRightMargin();
      }
    }
    for (let edge = 0; edge < 4; edge++) this.savedDistances[edge] = this.distances[edge];
    if (!selector.IsAnyBorderVisible()) selector.DeselectAllBorders();
    const uniform = selector.GetVisibleWidth(),
      color = new Color(),
      hasColor = selector.GetVisibleColor(color);
    if (uniform !== undefined) this.SetLineWidth(uniform[0] * 5);
    else if (this.options.defaultWidth !== undefined) this.SetLineWidth(this.options.defaultWidth);
    this.style = uniform?.[1] ?? Style.SOLID;
    this.color.assign(color);
    if (uniform !== undefined && hasColor) selector.SelectAllVisibleBorders();
    this.SelStyleHdl_Impl(this.style);
    this.SelColHdl_Impl(this.color);
    this.preset = undefined;
    this.removeAdjacent = false;
    this.LinesChanged_Impl();
    this.sync = this.distances.every(
      /** Determines source Synchronize from all four values. @param value - Original metric. @returns Equality. */ (
        value,
      ) => value === this.distances[0],
    );
  }
  /** Reads Writer table mode presentation for the mapped collapsing item. @returns Visibility. */
  public IsMergeAdjacentVisible(): boolean {
    return this.mergeWhich !== undefined;
  }
  /** Reads the native saved tri-state checkbox. @returns Boolean or indeterminate. */
  public GetMergeAdjacentState(): boolean | undefined {
    return this.merge;
  }
  /** Edits only the native checkbox state. @param value - Checkbox state. @returns Nothing. */
  public SetMergeAdjacentState(value: boolean | undefined): void {
    this.merge = value;
  }
  /** Lists native line styles in the source order. @returns Styles. */
  public GetLineStyles(): readonly Style[] {
    return this.options.styles ?? lineStyles;
  }
  /** Reads displayed native style. @returns Style. */
  public GetLineStyle(): Style {
    return this.style;
  }
  /** Reads displayed point width in hundredths. @returns Width. */
  public GetLineWidth(): number {
    return this.width;
  }
  /** Lists current predefined point widths with DOUBLE_THIN filtering. @returns Width list. */
  public GetLineWidths(): readonly number[] {
    return this.style === Style.DOUBLE_THIN ? lineWidths.slice(3) : lineWidths;
  }
  /** Reads custom spinner visibility. @returns Whether custom. */
  public IsCustomWidth(): boolean {
    return this.customWidth;
  }
  /** Reads displayed RGB. @returns Native color. */
  public GetLineColor(): Readonly<Color> {
    return this.color;
  }
  /** Reads selected arrangement preset. @returns One-based preset or absence. */
  public GetPreset(): number | undefined {
    return this.preset;
  }
  /** Reads padding visibility from native info. @returns Visibility. */
  public IsDistanceVisible(): boolean {
    return this.distanceVisible;
  }
  /** Reads one native padding field. @param edge - Box edge. @returns Twips. */
  public GetDistance(edge: number): number | undefined {
    return this.distances[edge];
  }
  /** Reads native Synchronize. @returns Checked state. */
  public IsSynchronized(): boolean {
    return this.sync;
  }
  /** Changes Synchronize without altering existing fields. @param checked - Native checkbox. @returns Nothing. */
  public SyncHdl_Impl(checked: boolean): void {
    this.sync = checked;
  }
  /** Edits one native metric and source synchronization. @param edge - Box edge. @param value - Native twips. @returns Nothing. */
  public ModifyDistanceHdl_Impl(edge: number, value: number): void {
    this.distances[edge] = Math.max(0, Math.min(Math.round((50 * 1440) / 25.4), Math.round(value)));
    this.modified[edge] = true;
    if (this.sync) this.distances.fill(this.distances[edge]);
  }
  /** Selects predefined width or opens custom spinner without overwriting its value. @param value - Hundredths of a point or -1 for custom. @returns Nothing. */
  public ModifyWidthLBHdl_Impl(value: number): void {
    this.SetLineWidth(value);
    this.ModifyWidthMFHdl_Impl(this.width);
  }
  /** Changes native width and selected frame lines. @param value - Hundredths of a point. @returns Nothing. */
  public ModifyWidthMFHdl_Impl(value: number): void {
    this.width = Math.max(
      this.style === Style.DOUBLE_THIN ? 110 : 5,
      Math.min(900, Math.round(value)),
    );
    this.frameSelector.SetStyleToSelection(Math.round(this.width / 5), this.style);
  }
  /** Dispatches native style transition and DOUBLE_THIN width policy. @param style - Native line style. @returns Nothing. */
  public SelStyleHdl_Impl(style: Style): void {
    const oldWidth = Math.round(this.width / 5),
      oldMinimum = minimumLineWidth(this.frameSelector.getCurrentStyleLineStyle());
    this.style = style;
    let next = oldWidth === oldMinimum ? minimumLineWidth(style) : oldWidth;
    if (style === Style.DOUBLE_THIN && !this.customWidth && [1, 10, 15].includes(oldWidth))
      next = Math.max(30, next);
    if (next !== oldWidth) this.SetLineWidth(next * 5);
    this.width = Math.max(style === Style.DOUBLE_THIN ? 110 : 5, this.width);
    this.frameSelector.SetStyleToSelection(next, style);
  }
  /** Changes current and selected native line color. @param color - RGB. @returns Nothing. */
  public SelColHdl_Impl(color: Readonly<Color>): void {
    this.color.assign(color);
    this.frameSelector.SetColorToSelection(this.color);
  }
  /** Lists the five native source arrangement descriptions for enabled inner lines. @returns Preset labels. */
  public GetPresetNames(): readonly string[] {
    if (!this.horizontal && !this.vertical)
      return [
        "No Borders",
        "All Four Borders",
        "Left and Right Borders Only",
        "Top and Bottom Borders Only",
        this.options.diagonalWhich ? "Diagonal Borders" : "Left Border",
      ];
    return [
      "No Borders",
      "Outer Border Only",
      this.horizontal && this.vertical
        ? "Outer Border and Horizontal Lines"
        : this.horizontal
          ? "Top and Bottom Borders, and All Inner Lines"
          : "Left and Right Borders, and All Inner Lines",
      "Outer Border and All Inner Lines",
      "Outer Border Without Changing Inner Lines",
    ];
  }
  /** Applies native cell/horizontal/vertical/table preset state matrices. @param preset - One-based native preset. @returns Nothing. */
  public SelPreHdl_Impl(preset: number): void {
    const cell = [
        [0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0],
        [1, 1, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0],
        this.options.diagonalWhich ? [0, 0, 0, 0, 0, 0, 1, 1] : [1, 0, 0, 0, 0, 0],
      ],
      hor = [
        [0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 2, 0],
      ],
      ver = [
        [0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0],
        [1, 1, 0, 0, 0, 1],
        [1, 1, 1, 1, 0, 1],
        [1, 1, 1, 1, 0, 2],
      ],
      table = [
        [0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0],
        [1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 2, 2],
      ];
    const states = (this.horizontal ? (this.vertical ? table : hor) : this.vertical ? ver : cell)[
      preset - 1
    ] as readonly number[];
    const selector = this.frameSelector;
    selector.HideAllBorders();
    selector.DeselectAllBorders();
    for (const edge of selector.GetEnabledBorders()) {
      if (states[edge - 1] === 1) selector.SelectBorder(edge);
      else if (states[edge - 1] === 2) selector.SetBorderDontCare(edge);
    }
    if (
      this.style === Style.NONE &&
      selector
        .GetEnabledBorders()
        .some(
          /** Tests whether arrangement selected a line before restoring Solid. @param edge - Enabled native edge. @returns Selection. */ (
            edge,
          ) => selector.IsBorderSelected(edge),
        )
    )
      this.style = Style.SOLID;
    this.SelStyleHdl_Impl(this.style);
    this.SelColHdl_Impl(this.color);
    this.preset = preset;
    this.LinesChanged_Impl();
  }
  /** Reads Calc-only adjacent removal visibility. @returns Control admission. */
  public HasRemoveAdjacent(): boolean {
    return this.options.removeAdjacent === true;
  }

  /** The checkbox is sensitive when an outer edge is removed, or the no-borders preset is chosen. @returns Whether the native checkbox may be toggled. */
  public CanRemoveAdjacent(): boolean {
    if (!this.HasRemoveAdjacent() || !this.oldBox || !this.oldInfo) return false;
    if (this.preset === 1) return true;
    for (const [edge, itemEdge, flag] of edges.slice(0, 4))
      if (
        this.frameSelector.GetFrameBorderState(edge) === State.Hide &&
        (this.oldBox.GetLine(itemEdge) || !this.oldInfo.IsValid(flag))
      )
        return true;
    return false;
  }

  /** Reads the Calc erase-neighbor option. @returns Whether adjacent edges should be removed. */
  public GetRemoveAdjacent(): boolean {
    return this.removeAdjacent && this.CanRemoveAdjacent();
  }

  /** Adopts the Calc erase-neighbor option. @param checked - Checkbox state. @returns Nothing. */
  public SetRemoveAdjacent(checked: boolean): void {
    this.removeAdjacent = checked && this.CanRemoveAdjacent();
  }

  /** Updates source automatic distances after a frame-line transition. @returns Nothing. */
  public LinesChanged_Impl(): void {
    if (!this.CanRemoveAdjacent()) this.removeAdjacent = false;
    if (
      this.distanceVisible &&
      !this.oldMargin &&
      this.frameSelector.IsAnyBorderVisible() &&
      !this.modified.some(
        /** Tests saved edit modification flags before source automatic spacing. @param value - Modified flag. @returns Flag. */ (
          value,
        ) => value,
      )
    )
      this.distances.fill(this.minimumDistance);
  }
  /** Reconstructs fresh native outer/inner items and separately publishes changed values. @param output - Native output set, with original pool/ranges. @returns Whether an item changed. */
  public FillItemSet(output: SfxItemSet): boolean {
    let changed = false;
    if (this.merge !== this.savedMerge) {
      if (this.merge === undefined) output.ClearItem(this.mergeWhich as number);
      else if (this.oldMerge !== undefined) {
        const item = this.oldMerge.Clone();
        item.SetValue(this.merge);
        output.Put(item);
      }
      changed = true;
    }
    if (this.options.diagonalWhich) {
      for (const [index, which] of this.options.diagonalWhich.entries()) {
        const edge = index === 0 ? Edge.TLBR : Edge.BLTR;
        if (this.frameSelector.GetFrameBorderState(edge) === State.DontCare) continue;
        const old = this.original.Get(which) as SvxLineItem;
        const item = old.Clone();
        item.SetLine(this.frameSelector.GetFrameBorderStyle(edge) ?? null);
        if (!item.equals(old) || this.original.GetItemState(which) === SfxItemState.INVALID) {
          output.Put(item, true);
          changed = true;
        } else item.Dispose();
      }
    }
    if (this.oldMargin) {
      const [top, bottom, left, right] = this.distances;
      const original = this.oldMargin;
      const differs = this.distances.some(
        /** Detects a changed cell padding field. @param value - Current value. @param edge - Original edge. @returns Whether the value changed. */
        (value, edge) => value !== this.savedDistances[edge],
      );
      if (differs) {
        output.Put(
          new SvxMarginItem(
            left ?? original.GetLeftMargin(),
            top ?? original.GetTopMargin(),
            right ?? original.GetRightMargin(),
            bottom ?? original.GetBottomMargin(),
            original.Which(),
          ),
          true,
        );
        changed = true;
      } else output.ClearItem(original.Which());
    }
    const box = new SvxBoxItem(this.boxWhich),
      info = new SvxBoxInfoItem(this.infoWhich),
      selector = this.frameSelector;
    box.SetRemoveAdjacentCellBorder(this.GetRemoveAdjacent());
    for (const [edge, itemEdge, valid] of edges) {
      const enabled = selector.GetEnabledBorders().includes(edge);
      const line = enabled ? selector.GetFrameBorderStyle(edge) : undefined;
      if (edge <= Edge.Bottom) box.SetLine(line, itemEdge);
      else info.SetLine(line, itemEdge as SvxBoxInfoItemLine);
      info.SetValid(valid, !enabled || selector.GetFrameBorderState(edge) !== State.DontCare);
    }
    info.EnableHor(this.horizontal);
    info.EnableVer(this.vertical);
    if (this.oldMargin && this.oldInfo?.IsDist()) info.SetDist(true);
    if (this.distanceVisible && !this.oldMargin) {
      info.SetDist(true);
      if (
        this.distances.some(
          /** Detects at least one nonblank native distance field. @param value - Current metric. @returns Whether set. */ (
            value,
          ) => value !== undefined,
        )
      ) {
        const useFields =
          this.oldBox === undefined ||
          this.distances.some(
            /** Tests source field changes or minimum-value normalization. @param value - Current metric. @param edge - Native distance index. @returns Whether field output is required. */ (
              value,
              edge,
            ) => value !== this.savedDistances[edge] || value === this.minimumDistance,
          ) ||
          (this.oldInfo !== undefined && !this.oldInfo.IsValid(Valid.DISTANCE));
        for (let edge = 0; edge < 4; edge++)
          box.SetDistance(
            useFields ? (this.distances[edge] ?? 0) : (this.oldBox as SvxBoxItem).GetDistance(edge),
            edge,
          );
        info.SetValid(Valid.DISTANCE);
      }
    }
    let put = true;
    if (this.original.GetItemState(this.boxWhich, false) === SfxItemState.DEFAULT)
      put = !box.equals(this.original.Get(this.boxWhich));
    if (
      this.original.GetItemState(this.infoWhich, false) === SfxItemState.DEFAULT &&
      this.oldInfo !== undefined
    ) {
      info.SetMinDist(this.oldInfo.IsMinDist());
      info.SetDefDist(this.oldInfo.GetDefDist());
      put ||= !info.equals(this.oldInfo);
    }
    if (!put) {
      output.ClearItem(this.boxWhich);
      output.ClearItem(this.infoWhich);
      return changed;
    }
    if (this.oldBox === undefined || !box.equals(this.oldBox)) {
      output.Put(box);
      changed = true;
    }
    if (this.oldInfo === undefined || !info.equals(this.oldInfo)) {
      output.Put(info);
      changed = true;
    }
    return changed;
  }
  /** Releases the native page's copied inputs. @returns Nothing. */
  public Dispose(): void {
    this.original.Dispose();
    this.oldBox?.Dispose();
    this.oldInfo?.Dispose();
    this.oldMerge?.Dispose();
  }

  /** Resolves native predefined versus custom width presentation. @param value - Hundredths of a point, negative retains spinner value. @returns Nothing. */
  private SetLineWidth(value: number): void {
    if (value >= 0) this.width = value;
    this.customWidth = !lineWidths.includes(value as (typeof lineWidths)[number]);
  }
}

/** @fileoverview The original CUI Alignment page's saved values, sensitivity and pooled exchange. */
import {
  SID_ATTR_ALIGN_HOR_JUSTIFY,
  SID_ATTR_ALIGN_HOR_JUSTIFY_METHOD,
  SID_ATTR_ALIGN_VER_JUSTIFY,
  SID_ATTR_ALIGN_VER_JUSTIFY_METHOD,
  SID_ATTR_FRAMEDIRECTION,
} from "../../../editeng/inc/editids";
import { SvxFrameDirection } from "../../../editeng/inc/frmdir";
import {
  SvxHorJustifyItem,
  SvxJustifyMethodItem,
  SvxVerJustifyItem,
} from "../../../editeng/inc/justifyitem";
import {
  SvxCellHorJustify,
  SvxCellJustifyMethod,
  SvxCellVerJustify,
} from "../../../editeng/inc/svxenum";
import { SvxFrameDirectionItem } from "../../../editeng/source/items/frmitems.direction";
import { IsVerticalTextEnabled } from "../../../svl/source/config/cjkoptions";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { SfxUInt16Item } from "../../../svl/source/items/intitem";
import { SfxItemState, type SfxItemSet } from "../../../svl/source/items/itemset";
import { SvxRotateMode, SvxRotateModeItem } from "../../../svx/inc/rotmodit";
import {
  SID_ATTR_ALIGN_ASIANVERTICAL,
  SID_ATTR_ALIGN_DEGREES,
  SID_ATTR_ALIGN_HYPHENATION,
  SID_ATTR_ALIGN_INDENT,
  SID_ATTR_ALIGN_LINEBREAK,
  SID_ATTR_ALIGN_LOCKPOS,
  SID_ATTR_ALIGN_SHRINKTOFIT,
  SID_ATTR_ALIGN_STACKED,
} from "../../../svx/inc/svxids";
import type { SdrAngleItem } from "../../../svx/source/svdraw/svdattr";

const alignmentSlots = {
  horizontal: SID_ATTR_ALIGN_HOR_JUSTIFY,
  vertical: SID_ATTR_ALIGN_VER_JUSTIFY,
  horizontalMethod: SID_ATTR_ALIGN_HOR_JUSTIFY_METHOD,
  verticalMethod: SID_ATTR_ALIGN_VER_JUSTIFY_METHOD,
  indent: SID_ATTR_ALIGN_INDENT,
  angle: SID_ATTR_ALIGN_DEGREES,
  reference: SID_ATTR_ALIGN_LOCKPOS,
  stacked: SID_ATTR_ALIGN_STACKED,
  asian: SID_ATTR_ALIGN_ASIANVERTICAL,
  wrap: SID_ATTR_ALIGN_LINEBREAK,
  hyphen: SID_ATTR_ALIGN_HYPHENATION,
  shrink: SID_ATTR_ALIGN_SHRINKTOFIT,
  direction: SID_ATTR_FRAMEDIRECTION,
};

const checks = ["stacked", "asian", "wrap", "hyphen", "shrink"] as const;
/** Checkbox names mapped by the original ResetBool helper. */
type Check = (typeof checks)[number];

/** Native Alignment combo box identity for distributed horizontal alignment. */
export const horizontalDistributed = 6;
/** Native Alignment combo box identity for distributed vertical alignment. */
export const verticalDistributed = 5;

/** Native reference-edge palette order and supported modes. */
export const referenceEdges = [
  SvxRotateMode.SVX_ROTATE_MODE_BOTTOM,
  SvxRotateMode.SVX_ROTATE_MODE_TOP,
  SvxRotateMode.SVX_ROTATE_MODE_STANDARD,
] as const;

/** Native FrameDirectionListBox options admitted by this page. */
export const writingDirections = [
  SvxFrameDirection.Horizontal_LR_TB,
  SvxFrameDirection.Horizontal_RL_TB,
  SvxFrameDirection.Environment,
] as const;

/** Saved or pending visible native values with undefined representing mixed or unmatched. */
export interface AlignmentValues {
  horizontal: number | undefined;
  vertical: number | undefined;
  indent: number | undefined;
  angle: number | undefined;
  reference: (typeof referenceEdges)[number] | undefined;
  stacked: boolean | undefined;
  asian: boolean | undefined;
  wrap: boolean | undefined;
  hyphen: boolean | undefined;
  shrink: boolean | undefined;
  direction: (typeof writingDirections)[number] | undefined;
}

/** CUI alignment controls and their exchange with the owning document's actual pool. */
export class AlignmentTabPage {
  private readonly saved: AlignmentValues;
  private current: AlignmentValues;

  /** Loads original native states and maps slots through the supplied pool. @param input - Selection attributes. @returns Alignment page. */
  constructor(private readonly input: SfxItemSet) {
    const horizontal = this.read<SvxHorJustifyItem>("horizontal")?.GetValue();
    const vertical = this.read<SvxVerJustifyItem>("vertical")?.GetValue();
    const reference = this.read<SvxRotateModeItem>("reference")?.GetValue();
    const direction = this.read<SvxFrameDirectionItem>("direction")?.GetValue();
    const angle = this.read<SdrAngleItem>("angle")?.GetValue();
    this.saved = {
      horizontal:
        horizontal === SvxCellHorJustify.Block &&
        this.hasDistributedMethod("horizontal", "horizontalMethod")
          ? horizontalDistributed
          : horizontal,
      vertical:
        vertical === SvxCellVerJustify.Block &&
        this.hasDistributedMethod("vertical", "verticalMethod")
          ? verticalDistributed
          : vertical,
      indent: this.read<SfxUInt16Item>("indent")?.GetValue(),
      angle: angle === undefined ? undefined : ((angle % 36000) + 36000) % 36000,
      reference: referenceEdges.find(
        /** Checks whether the source edge is represented in the original value set. @param edge - Supported rotation mode. @returns Whether it matches. */
        (edge) => edge === reference,
      ),
      direction: writingDirections.find(
        /** Checks whether the source direction has a row in the page. @param mode - Supported direction. @returns Whether it matches. */
        (mode) => mode === direction,
      ),
      stacked: this.read<SfxBoolItem>("stacked")?.GetValue(),
      asian: this.read<SfxBoolItem>("asian")?.GetValue(),
      wrap: this.read<SfxBoolItem>("wrap")?.GetValue(),
      hyphen: this.read<SfxBoolItem>("hyphen")?.GetValue(),
      shrink: this.read<SfxBoolItem>("shrink")?.GetValue(),
    };
    this.current = { ...this.saved };
  }

  /** Returns the native control values. @returns Read-only pending values. */
  GetValues(): Readonly<AlignmentValues> {
    return this.current;
  }

  /** Reads the original enablement rules after an alignment or checkbox change. @returns Controls available for edit. */
  GetSensitivity() {
    const { horizontal, stacked, wrap } = this.current;
    const fill = horizontal === SvxCellHorJustify.Repeat;
    const justify = horizontal === SvxCellHorJustify.Block;
    return {
      indent: horizontal === SvxCellHorJustify.Left,
      stacked: !fill,
      angle: !fill && stacked !== true,
      reference: stacked !== true,
      asian: stacked === true,
      hyphen: wrap === true || justify,
      shrink: wrap === false && !justify && !fill && horizontal !== horizontalDistributed,
    };
  }

  /** Reports the source feature and item-set support for Asian layout. @returns Whether to show the Asian layout control. */
  HasAsianVertical(): boolean {
    return (
      IsVerticalTextEnabled() &&
      this.input.GetItemState(this.which("asian")) !== SfxItemState.UNKNOWN
    );
  }

  /** Updates the typed pending value following a control edit. @param field - Native control. @param value - Edited value. @returns Nothing. */
  SetValue<K extends keyof AlignmentValues>(field: K, value: AlignmentValues[K]): void {
    this.current[field] = value;
  }

  /** Cycles mixed checkboxes in the order used by weld TriStateEnabled. @param field - Native checkbox. @returns Nothing. */
  Toggle(field: Check): void {
    const value = this.current[field];
    this.current[field] =
      this.saved[field] === undefined
        ? value === undefined
          ? false
          : value === false
            ? true
            : undefined
        : !value;
  }

  /** Restores the original snapshot and saved control states. @returns Nothing. */
  Reset(): void {
    this.current = { ...this.saved };
  }

  /** Returns changed values to Calc using the original typed items. @param output - Dialog output. @returns Nothing. */
  FillItemSet(output: SfxItemSet): void {
    const { horizontal, vertical, indent, angle, reference, direction } = this.current;
    if (horizontal !== undefined && horizontal !== this.saved.horizontal)
      output.Put(
        new SvxHorJustifyItem(
          horizontal === horizontalDistributed ? SvxCellHorJustify.Block : horizontal,
          this.which("horizontal"),
        ),
        true,
      );
    if (vertical !== undefined && vertical !== this.saved.vertical)
      output.Put(
        new SvxVerJustifyItem(
          vertical === verticalDistributed ? SvxCellVerJustify.Block : vertical,
          this.which("vertical"),
        ),
        true,
      );
    if (indent !== undefined && indent !== this.saved.indent) {
      const item = (this.input.Get(this.which("indent")) as SfxUInt16Item).Clone();
      item.SetValue(indent);
      output.Put(item, true);
    }
    if (
      angle !== undefined &&
      Math.trunc(angle / 100) !==
        (this.saved.angle === undefined ? undefined : Math.trunc(this.saved.angle / 100))
    ) {
      const item = (this.input.Get(this.which("angle")) as SdrAngleItem).Clone();
      item.SetValue(angle);
      output.Put(item, true);
    }
    if (reference !== undefined && reference !== this.saved.reference)
      output.Put(new SvxRotateModeItem(reference, this.which("reference")), true);
    if (direction !== undefined && direction !== this.saved.direction)
      output.Put(new SvxFrameDirectionItem(direction, this.which("direction")), true);

    for (const field of checks) {
      const value = this.current[field];
      if (value === undefined || value === this.saved[field]) continue;
      const which = this.which(field);
      if (field === "asian") output.Put(new SfxBoolItem(which, value), true);
      else {
        const item = (this.input.Get(which) as SfxBoolItem).Clone();
        item.SetValue(value);
        output.Put(item, true);
      }
    }

    this.writeMethod(output, "horizontalMethod", horizontal === horizontalDistributed);
    this.writeMethod(output, "verticalMethod", vertical === verticalDistributed);
  }

  /** Resolves a native slot using its original item pool. @param field - Control or method identity. @returns Pooled Which ID. */
  private which(field: keyof typeof alignmentSlots): number {
    return this.input.GetPool().GetWhichIDFromSlotID(alignmentSlots[field]);
  }

  /** Reads a proven set or default item, retaining the mixed sentinel in the control. @param field - Control identity. @returns Native value item. */
  private read<T extends SfxPoolItem>(field: keyof AlignmentValues): T | undefined {
    const which = this.which(field);
    return this.input.GetItemState(which) >= SfxItemState.DEFAULT
      ? (this.input.Get(which) as T)
      : undefined;
  }

  /** Uses explicit aligned and distributed items to restore the original combo choice. @param alignment - Axis control. @param method - Axis method identity. @returns Whether the pair is explicitly distributed. */
  private hasDistributedMethod(
    alignment: "horizontal" | "vertical",
    method: "horizontalMethod" | "verticalMethod",
  ): boolean {
    return (
      this.input.GetItemIfSet(this.which(alignment)) !== undefined &&
      (
        this.input.GetItemIfSet(this.which(method)) as SvxJustifyMethodItem | undefined
      )?.GetValue() === SvxCellJustifyMethod.Distribute
    );
  }

  /** Exchanges a changed justification method independently of its alignment enum. @param output - Dialog output. @param method - Axis method identity. @param distribute - Whether the distributed entry is active. @returns Nothing. */
  private writeMethod(
    output: SfxItemSet,
    method: "horizontalMethod" | "verticalMethod",
    distribute: boolean,
  ): void {
    const which = this.which(method);
    if (this.input.GetItemState(which) === SfxItemState.UNKNOWN) return;
    const chosen = distribute ? SvxCellJustifyMethod.Distribute : SvxCellJustifyMethod.Auto;
    if ((this.input.Get(which) as SvxJustifyMethodItem).GetValue() !== chosen)
      output.Put(new SvxJustifyMethodItem(chosen, which), true);
  }
}

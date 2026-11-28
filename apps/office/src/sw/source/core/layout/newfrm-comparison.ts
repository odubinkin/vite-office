/** @fileoverview Compares Writer layout inputs and measured frame positions across formatting passes. */
import type { WriterPageDescriptorValue } from "./pagedesc";
import type { SwPageDescriptorLayout, SwTableFrame } from "./newfrm";
import type { SwTableFrameMeasurement } from "./tabfrm";
import type { SwLineNumberInfoValue } from "../../../inc/lineinfo";
import type {
  SwTextFrame,
  SwTextFrameInput,
  SwTextFrameMeasurement,
  SwTextFrameSettings,
  SwTextLine,
} from "../text/txtfrm";

/** Compares physical page geometry without serializing layout state. @param left - Previous page. @param right - Current page. @returns Whether equal. */
export function pageDescriptorEqual(
  left: WriterPageDescriptorValue,
  right: WriterPageDescriptorValue,
): boolean {
  if (left === right) return true;
  return (
    left.name === right.name &&
    left.width === right.width &&
    left.height === right.height &&
    left.landscape === right.landscape &&
    left.leftMargin === right.leftMargin &&
    left.rightMargin === right.rightMargin &&
    left.topMargin === right.topMargin &&
    left.bottomMargin === right.bottomMargin
  );
}

/** Compares a page descriptor and its follow graph. @param left - Previous descriptor. @param right - Current descriptor. @returns Whether equal. */
export function layoutDescriptorEqual(
  left: WriterPageDescriptorValue | SwPageDescriptorLayout | undefined,
  right: WriterPageDescriptorValue | SwPageDescriptorLayout,
): boolean {
  if (left === right) return true;
  if (left === undefined) return false;
  if ("descriptors" in left && "descriptors" in right)
    return (
      left.initialName === right.initialName &&
      left.descriptors.length === right.descriptors.length &&
      left.descriptors.every(
        /** Compares one page style and follow relationship. @param record - Previous record. @param index - Descriptor order. @returns Whether equal. */ (
          record,
          index,
        ) =>
          record.followName === right.descriptors[index]?.followName &&
          pageDescriptorEqual(
            record.value,
            (right.descriptors[index] as (typeof right.descriptors)[number]).value,
          ),
      )
    );
  if ("descriptors" in left || "descriptors" in right) return false;
  return pageDescriptorEqual(left, right);
}

/** Compares document paragraph-spacing switches. @param left - Previous settings. @param right - Current settings. @returns Whether equal. */
export function textFrameSettingsEqual(
  left: SwTextFrameSettings | undefined,
  right: SwTextFrameSettings | undefined,
): boolean {
  return (
    left === right ||
    (left !== undefined &&
      right !== undefined &&
      left.paraSpaceMax === right.paraSpaceMax &&
      left.paraSpaceMaxAtPages === right.paraSpaceMaxAtPages &&
      left.showHiddenPara === right.showHiddenPara &&
      left.fieldName === right.fieldName)
  );
}

/** Compares document line-number options. @param left - Previous options. @param right - Current options. @returns Whether equal. */
export function lineNumberInfoEqual(
  left: SwLineNumberInfoValue | undefined,
  right: SwLineNumberInfoValue,
): boolean {
  return (
    left === right ||
    (left !== undefined &&
      left.divider === right.divider &&
      left.dividerCountBy === right.dividerCountBy &&
      left.posFromLeft === right.posFromLeft &&
      left.countBy === right.countBy &&
      left.position === right.position &&
      left.paintLineNumbers === right.paintLineNumbers &&
      left.countBlankLines === right.countBlankLines &&
      left.countInFlys === right.countInFlys &&
      left.restartEachPage === right.restartEachPage)
  );
}

/** Compares shaped line geometry. @param left - Previous lines. @param right - Current lines. @returns Whether equal. */
function textLinesEqual(left: readonly SwTextLine[], right: readonly SwTextLine[]): boolean {
  return (
    left === right ||
    (left.length === right.length &&
      left.every(
        /** Compares one source range and height. @param line - Previous line. @param index - Line order. @returns Whether equal. */ (
          line,
          index,
        ) =>
          line.start === right[index]?.start &&
          line.end === right[index]?.end &&
          line.height === right[index]?.height,
      ))
  );
}

/** Checks current device measurements against the last formatted values. @param measurements - Current device lines. @param inputs - Previous core inputs. @returns Whether unchanged. */
export function measurementsMatchInputs(
  measurements: readonly SwTextFrameMeasurement[],
  inputs: readonly SwTextFrameInput[],
): boolean {
  return (
    measurements.length === inputs.length &&
    measurements.every(
      /** Compares one device measurement. @param measurement - Current lines. @param index - Document order. @returns Whether equal. */ (
        measurement,
        index,
      ) =>
        measurement.id === inputs[index]?.id &&
        textLinesEqual(measurement.lines, (inputs[index] as SwTextFrameInput).lines),
    )
  );
}

/** Compares model values and measured lines for one text node. @param left - Current input. @param right - Previous input. @returns Whether equal. */
export function textFrameInputEqual(
  left: SwTextFrameInput,
  right: SwTextFrameInput | undefined,
): boolean {
  return (
    right !== undefined &&
    left.node === right.node &&
    left.id === right.id &&
    left.style === right.style &&
    left.hidden === right.hidden &&
    left.upperSpacing === right.upperSpacing &&
    left.lowerSpacing === right.lowerSpacing &&
    left.contextualSpacing === right.contextualSpacing &&
    left.keepWithNext === right.keepWithNext &&
    left.keepTogether === right.keepTogether &&
    left.orphans === right.orphans &&
    left.widows === right.widows &&
    left.breakBefore === right.breakBefore &&
    left.breakAfter === right.breakAfter &&
    left.pageStyleName === right.pageStyleName &&
    left.pageNumber === right.pageNumber &&
    left.countLineNumbers === right.countLineNumbers &&
    left.lineNumberStartValue === right.lineNumberStartValue &&
    textLinesEqual(left.lines, right.lines)
  );
}

/** Compares one frame's source range and placement. @param left - Current frame. @param right - Previous frame. @returns Whether equal. */
export function textFrameEqual(left: SwTextFrame, right: SwTextFrame | undefined): boolean {
  return (
    right !== undefined &&
    left.GetTextNodeFirst() === right.GetTextNodeFirst() &&
    left.nodeId === right.nodeId &&
    left.start === right.start &&
    left.end === right.end &&
    left.IsFollow() === right.IsFollow() &&
    left.IsHiddenNow() === right.IsHiddenNow() &&
    left.topSpacing === right.topSpacing
  );
}

/** Compares device row measurements across formatting passes. @param left - Previous measurements. @param right - Current measurements. @returns Whether the measurements match. */
export function tableMeasurementsEqual(
  left: readonly SwTableFrameMeasurement[],
  right: readonly SwTableFrameMeasurement[],
): boolean {
  return (
    left.length === right.length &&
    left.every(
      /** Compares the device heights of one table. @param entry - Previous table measurements. @param index - Document order. @returns Whether the table measurements match. */ (
        entry,
        index,
      ) =>
        entry.tableName === right[index]?.tableName &&
        entry.rowHeights.length === right[index]?.rowHeights.length &&
        entry.rowHeights.every(
          /** Checks one measured row height. @param height - Previous height. @param row - Table row. @returns Whether the height matches. */ (
            height,
            row,
          ) => height === right[index]?.rowHeights[row],
        ),
    )
  );
}

/** Compares table fragments for persistent page-frame identity. @param left - Previous frames. @param right - Current frames. @returns Whether the frames match. */
export function tableFramesEqual(
  left: readonly SwTableFrame[],
  right: readonly SwTableFrame[],
): boolean {
  return (
    left.length === right.length &&
    left.every(
      /** Compares one positioned table fragment. @param frame - Previous fragment. @param index - Layout order. @returns Whether the frame identity and placement match. */ (
        frame,
        index,
      ) =>
        frame.table === right[index]?.table &&
        frame.nativeFrame === right[index]?.nativeFrame &&
        frame.printArea.left === right[index]?.printArea.left &&
        frame.printArea.right === right[index]?.printArea.right &&
        frame.firstRow === right[index]?.firstRow &&
        frame.lastRow === right[index]?.lastRow &&
        frame.repeatedHeaderRows === right[index]?.repeatedHeaderRows &&
        frame.afterParagraphIndex === right[index]?.afterParagraphIndex,
    )
  );
}

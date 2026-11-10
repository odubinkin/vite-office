/** @fileoverview Lossless browser transport of actual native SvxBoxItem and SvxBorderLine state, shared by paragraph/page items and table boxes. */
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { SvxBorderLine, type BorderLineRecord } from "../../../../editeng/source/items/borderline";
/** Encodes complete native fields without the lossy UNO BorderLine reconstruction path. @param box - Borrowed item. @returns Cloneable native field values. */
export function encodeNativeBoxItem(box: SvxBoxItem) {
  return {
    which: box.Which(),
    lines: [0, 1, 2, 3].map(
      /** Copies the actual native line state. @param edge - Side. @returns Value or null. */ (
        edge,
      ) => {
        const line = box.GetLine(edge);
        return line ? { ...line.toJSON() } : null;
      },
    ),
    distances: [0, 1, 2, 3].map(
      /** Retains signed distances. @param edge - Side. @returns Raw metric. */ (edge) =>
        box.GetDistance(edge, true),
    ),
    removeAdjacent: box.IsRemoveAdjacentCellBorder(),
  };
}
/** Narrows the existing untrusted browser record domain. @param value - Candidate. @returns Plain record admission. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
/** Validates and restores original native fields, preserving the existing table-box validation contract. @param record - Untrusted field record. @returns Owned native item. */
export function decodeNativeBoxItem(record: unknown): SvxBoxItem {
  if (
    !isRecord(record) ||
    typeof record.which !== "number" ||
    !Number.isInteger(record.which) ||
    record.which < 0 ||
    record.which > 32767 ||
    !Array.isArray(record.lines) ||
    record.lines.length !== 4 ||
    !Array.isArray(record.distances) ||
    record.distances.length !== 4 ||
    typeof record.removeAdjacent !== "boolean"
  )
    throw new Error("Stored Writer native box is invalid.");
  const item = new SvxBoxItem(record.which);
  try {
    for (const edge of [0, 1, 2, 3]) {
      const distance = record.distances[edge];
      if (
        typeof distance !== "number" ||
        !Number.isInteger(distance) ||
        distance < -32768 ||
        distance > 32767
      )
        throw new Error("Stored Writer box distance is invalid.");
      item.SetDistance(distance, edge);
      const line = record.lines[edge];
      if (line === null) continue;
      if (
        !isRecord(line) ||
        typeof line.color !== "number" ||
        !Number.isInteger(line.color) ||
        line.color < 0 ||
        line.color > 0xffffffff ||
        !Number.isSafeInteger(line.width) ||
        typeof line.style !== "number" ||
        !Number.isInteger(line.style) ||
        (line.style !== 32767 && (line.style < 0 || line.style > 17)) ||
        typeof line.scale !== "number" ||
        !Number.isFinite(line.scale) ||
        typeof line.mirror !== "boolean" ||
        typeof line.useLeftTop !== "boolean" ||
        !Array.isArray(line.implementation) ||
        line.implementation.length !== 4 ||
        !Number.isInteger(line.implementation[0]) ||
        line.implementation[0] < 0 ||
        line.implementation[0] > 7 ||
        line.implementation
          .slice(1)
          .some(
            /** Rejects invalid native rate fields. @param rate - Stored rate. @returns Whether malformed. */ (
              rate: unknown,
            ) => typeof rate !== "number" || !Number.isFinite(rate),
          )
      )
        throw new Error("Stored Writer native border line is invalid.");
      item.SetLine(SvxBorderLine.FromRecord(line as unknown as BorderLineRecord), edge);
    }
    item.SetRemoveAdjacentCellBorder(record.removeAdjacent);
    return item;
  } catch (error) {
    item.Dispose();
    throw error;
  }
}

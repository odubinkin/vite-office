/** @fileoverview Original cell shell merge slots from cellsh.sdi, scalc.sdi and sc.hrc. */
import type { ScMergeCommand } from "../source/ui/view/cellsh3";

/** Original merge slots from the Format command range and SID_NEW_SLOTS. */
export const calcMergeCommands = [
  { id: ".uno:ToggleMergeCells", slotId: 26581, label: "Merge and Center Cells", kind: "toggle" },
  { id: ".uno:MergeCells", slotId: 26300, label: "Merge Cells", kind: "merge" },
  { id: ".uno:SplitCell", slotId: 26301, label: "Unmerge Cells", kind: "split" },
] as const satisfies readonly { id: string; slotId: number; label: string; kind: ScMergeCommand }[];

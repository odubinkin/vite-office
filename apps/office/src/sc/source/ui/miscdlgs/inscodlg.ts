/** @fileoverview Paste Special content and preset state from inscodlg.cxx and Common.xcs. */
import { InsertDeleteFlags as F } from "../../../inc/global";

/** The represented original Paste Special options. */
export interface ScInsertContentsState {
  readonly all: boolean;
  readonly flags: F;
  readonly skipEmpty: boolean;
  readonly transpose: boolean;
}

/** The dialog returns its option state even when it is closed without pasting. */
export interface ScInsertContentsResponse {
  readonly accepted: boolean;
  readonly selection: ScInsertContentsState;
}

const values = (F.STRING | F.VALUE | F.DATETIME) as F;

/** Original registry defaults for the represented controls. */
export const defaultPasteSpecial: ScInsertContentsState = {
  all: false,
  flags: values,
  skipEmpty: false,
  transpose: false,
};

/** Original preset labels and the options they replace. */
export const pasteSpecialPresets: readonly { label: string; selection: ScInsertContentsState }[] = [
  { label: "Values Only", selection: defaultPasteSpecial },
  { label: "Values & Formats", selection: { ...defaultPasteSpecial, flags: values | F.ATTRIB } },
  { label: "Formats Only", selection: { ...defaultPasteSpecial, flags: F.ATTRIB } },
  {
    label: "Transpose All",
    selection: {
      ...defaultPasteSpecial,
      all: true,
      flags: values | F.FORMULA | F.ATTRIB,
      transpose: true,
    },
  },
];

/** Gets the native insertion mask from the active All or individual content checks. @param state - Current dialog options. @returns Insertion flags. */
export function GetInsContentsCmdBits(state: ScInsertContentsState): F {
  return state.all ? ((F.CONTENTS | F.ATTRIB) as F) : state.flags;
}

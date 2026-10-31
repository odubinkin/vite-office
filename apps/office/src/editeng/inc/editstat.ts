/** @fileoverview Original EditStatus flag families, mutable words and EVControlBits SetFlags from editstat.hxx. */
/** Original EEControlBits values and masks. */
export enum EEControlBits {
  NONE = 0x00000000,
  USECHARATTRIBS = 0x00000001,
  DOIDLEFORMAT = 0x00000008,
  PASTESPECIAL = 0x00000010,
  AUTOINDENTING = 0x00000020,
  UNDOATTRIBS = 0x00000040,
  ONECHARPERLINE = 0x00000080,
  NOCOLORS = 0x00000100,
  OUTLINER = 0x00000200,
  OUTLINER2 = 0x00000400,
  ALLOWBIGOBJS = 0x00000800,
  ONLINESPELLING = 0x00001000,
  STRETCHING = 0x00002000,
  MARKNONURLFIELDS = 0x00004000,
  MARKURLFIELDS = 0x00008000,
  MARKFIELDS = 0x0000c000, // Original MARKNONURLFIELDS | MARKURLFIELDS.
  RTFSTYLESHEETS = 0x00020000,
  AUTOCORRECT = 0x00080000,
  AUTOCOMPLETE = 0x00100000,
  AUTOPAGESIZEX = 0x00200000,
  AUTOPAGESIZEY = 0x00400000,
  AUTOPAGESIZE = 0x00600000, // Original AUTOPAGESIZEX | AUTOPAGESIZEY.
  ULSPACESUMMATION = 0x01000000,
  SINGLELINE = 0x02000000,
  STACKED = 0x04000000,
}
/** Original EVControlBits values and masks. */
export enum EVControlBits {
  AUTOSCROLL = 0x0001,
  ENABLEPASTE = 0x0004,
  SINGLELINEPASTE = 0x0008,
  OVERWRITE = 0x0010,
  INVONEMORE = 0x0020,
  AUTOSIZEX = 0x0040,
  AUTOSIZEY = 0x0080,
  AUTOSIZE = 0x00c0, // Original AUTOSIZEX | AUTOSIZEY.
}
/** Original EditStatusFlags values and masks. */
export enum EditStatusFlags {
  NONE = 0x0000,
  HSCROLL = 0x0001,
  VSCROLL = 0x0002,
  CURSOROUT = 0x0004,
  TEXTWIDTHCHANGED = 0x0010,
  TextHeightChanged = 0x0020,
  WRONGWORDCHANGED = 0x0040,
}
/** Original SpellCallbackCommand values and masks. */
export enum SpellCallbackCommand {
  IGNOREWORD = 0x0001,
  STARTSPELLDLG = 0x0002,
  ADDTODICTIONARY = 0x0003,
  WORDLANGUAGE = 0x0004,
  PARALANGUAGE = 0x0005,
  AUTOCORRECT_OPTIONS = 0x0006,
}

/** Original EVControlBits reference mutation; no mask normalization beyond source bit operations. @param bits - Original mutable word. @param mask - Selected flags. @param on - Original enable flag. @returns Nothing. */
export function SetFlags(bits: [EVControlBits], mask: EVControlBits, on: boolean): void {
  if (on) bits[0] |= mask;
  else bits[0] &= ~mask;
}
/** Original status/control word owner; Clear resets status alone. SpellCallbackInfo is a separate unported responsibility. */
export class EditStatus {
  protected readonly nStatusBits: [EditStatusFlags] = [EditStatusFlags.NONE];
  protected readonly nControlBits: [EEControlBits] = [EEControlBits.NONE];
  /** Original default and implicit-copy constructor. @param source - Optional source value. @returns Status. */
  constructor(source?: EditStatus) {
    if (source) this.assign(source);
  }
  /** Original implicit memberwise assignment preserving borrowed lvalues. @param source - Actual source. @returns This value. */
  assign(source: EditStatus): this {
    this.nStatusBits[0] = source.nStatusBits[0];
    this.nControlBits[0] = source.nControlBits[0];
    return this;
  }
  /** Original status-only reset. @returns Nothing. */
  Clear(): void {
    this.nStatusBits[0] = EditStatusFlags.NONE;
  }
  /** Original const status word. @returns Stored word. */
  GetStatusWord(): EditStatusFlags;
  /** Original mutable status word lvalue. @param mutable - Erased mutable overload selection. @returns Stable word cell. */
  GetStatusWord(mutable: true): [EditStatusFlags];
  /** Binds original status value/reference overloads. @param mutable - Mutable selection. @returns Value or actual lvalue. */
  GetStatusWord(mutable?: true): EditStatusFlags | [EditStatusFlags] {
    return mutable ? this.nStatusBits : this.nStatusBits[0];
  }
  /** Original mutable control word. @returns Stable source word lvalue. */
  GetControlWord(): [EEControlBits] {
    return this.nControlBits;
  }
}

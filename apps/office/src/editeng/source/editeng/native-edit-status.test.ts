/** @fileoverview Original EditStatus words, independent flag families and complete InternalEditStatus predicates. */
import { expect, it } from "vitest";
import {
  EditStatus,
  EEControlBits as EE,
  EVControlBits as EV,
  EditStatusFlags as Status,
  SetFlags,
} from "../../inc/editstat";
import { InternalEditStatus } from "./editstt2";

it("retains zero defaults, value copies, stable lvalues and status-only Clear", /** Engine constructor flags are deliberately not substituted for the value owner's original NONE default. @returns Nothing. */ () => {
  const status = new EditStatus(),
    control = status.GetControlWord(),
    word = status.GetStatusWord(true);
  expect(control[0]).toBe(EE.NONE);
  expect(word[0]).toBe(Status.NONE);
  control[0] = EE.SINGLELINE | EE.ONLINESPELLING;
  word[0] = Status.TEXTWIDTHCHANGED | Status.WRONGWORDCHANGED;
  const copy = new EditStatus(status);
  status.Clear();
  expect(status.GetControlWord()).toBe(control);
  expect(status.GetStatusWord(true)).toBe(word);
  expect(word[0]).toBe(0);
  expect(control[0]).toBe(EE.SINGLELINE | EE.ONLINESPELLING);
  expect(copy.GetStatusWord()).toBe(Status.TEXTWIDTHCHANGED | Status.WRONGWORDCHANGED);
  expect(copy.GetControlWord()).not.toBe(control);
  copy.assign(status);
  expect(copy.GetStatusWord()).toBe(Status.NONE);
  const view: [EV] = [EV.ENABLEPASTE];
  SetFlags(view, EV.AUTOSCROLL | EV.AUTOSIZE, true);
  expect(view[0]).toBe(0xc5);
  SetFlags(view, EV.AUTOSIZEX, false);
  expect(view[0]).toBe(0x85);
});

it("uses the original complete internal predicates including composite auto-page, field and stacked masks", /** Table pairs name existing source members and literal source flags without a replacement control-policy store. @returns Nothing. */ () => {
  const status = new InternalEditStatus();
  const predicates: [keyof InternalEditStatus, EE][] = [
    ["UseCharAttribs", EE.USECHARATTRIBS],
    ["UseIdleFormatter", EE.DOIDLEFORMAT],
    ["AllowPasteSpecial", EE.PASTESPECIAL],
    ["DoAutoIndenting", EE.AUTOINDENTING],
    ["DoUndoAttribs", EE.UNDOATTRIBS],
    ["OneCharPerLine", EE.ONECHARPERLINE],
    ["IsOutliner", EE.OUTLINER],
    ["DoNotUseColors", EE.NOCOLORS],
    ["AllowBigObjects", EE.ALLOWBIGOBJS],
    ["DoOnlineSpelling", EE.ONLINESPELLING],
    ["DoStretch", EE.STRETCHING],
    ["AutoPageSize", EE.AUTOPAGESIZE],
    ["AutoPageWidth", EE.AUTOPAGESIZEX],
    ["AutoPageHeight", EE.AUTOPAGESIZEY],
    ["MarkNonUrlFields", EE.MARKNONURLFIELDS],
    ["MarkUrlFields", EE.MARKURLFIELDS],
    ["DoImportRTFStyleSheets", EE.RTFSTYLESHEETS],
    ["DoAutoCorrect", EE.AUTOCORRECT],
    ["DoAutoComplete", EE.AUTOCOMPLETE],
    ["ULSpaceSummation", EE.ULSPACESUMMATION],
    ["IsSingleLine", EE.SINGLELINE],
  ];
  for (const [method, flag] of predicates) {
    const read = status[method] as () => boolean;
    status.GetControlWord()[0] = EE.NONE;
    expect(read.call(status)).toBe(false);
    status.TurnOnFlags(flag);
    expect(read.call(status)).toBe(true);
    status.TurnOffFlags(flag);
    expect(read.call(status)).toBe(false);
  }
  status.TurnOnFlags(EE.STACKED);
  expect(status.OneCharPerLine()).toBe(true);
  status.GetControlWord()[0] = EE.MARKFIELDS;
  expect(status.MarkNonUrlFields()).toBe(true);
  expect(status.MarkUrlFields()).toBe(true);
  status.GetControlWord()[0] = EE.AUTOPAGESIZEX;
  expect(status.AutoPageSize()).toBe(true);
  expect(status.AutoPageHeight()).toBe(false);
});

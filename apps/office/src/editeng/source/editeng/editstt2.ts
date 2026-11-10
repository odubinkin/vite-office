/** @fileoverview Original InternalEditStatus control predicates from editstt2.hxx, with original NONE base defaults. */
import { EditStatus, EEControlBits } from "../../inc/editstat";
/** Original internal bit interpretation; actual engine constructor sets its own control-word defaults. */
export class InternalEditStatus extends EditStatus {
  /** Original flag enable. @param flags - Source flags. @returns Nothing. */
  TurnOnFlags(flags: EEControlBits): void {
    this.nControlBits[0] |= flags;
  }
  /** Original flag disable. @param flags - Source flags. @returns Nothing. */
  TurnOffFlags(flags: EEControlBits): void {
    this.nControlBits[0] &= ~flags;
  }
  /** Original UseCharAttribs bit predicate. @returns Source predicate. */
  UseCharAttribs(): boolean {
    return Boolean(this.nControlBits[0] & EEControlBits.USECHARATTRIBS);
  }
  /** Original UseIdleFormatter bit predicate. @returns Source predicate. */
  UseIdleFormatter(): boolean {
    return Boolean(this.nControlBits[0] & EEControlBits.DOIDLEFORMAT);
  }
  /** Original AllowPasteSpecial bit predicate. @returns Source predicate. */
  AllowPasteSpecial(): boolean {
    return Boolean(this.nControlBits[0] & EEControlBits.PASTESPECIAL);
  }
  /** Original DoAutoIndenting bit predicate. @returns Source predicate. */
  DoAutoIndenting(): boolean {
    return Boolean(this.nControlBits[0] & EEControlBits.AUTOINDENTING);
  }
  /** Original DoUndoAttribs bit predicate. @returns Source predicate. */
  DoUndoAttribs(): boolean {
    return Boolean(this.nControlBits[0] & EEControlBits.UNDOATTRIBS);
  }
  /** Original OneCharPerLine bit predicate. @returns Source predicate. */
  OneCharPerLine(): boolean {
    return Boolean(this.nControlBits[0] & (EEControlBits.ONECHARPERLINE | EEControlBits.STACKED));
  }
  /** Original IsOutliner bit predicate. @returns Source predicate. */
  IsOutliner(): boolean {
    return Boolean(this.nControlBits[0] & EEControlBits.OUTLINER);
  }
  /** Original DoNotUseColors bit predicate. @returns Source predicate. */
  DoNotUseColors(): boolean {
    return Boolean(this.nControlBits[0] & EEControlBits.NOCOLORS);
  }
  /** Original AllowBigObjects bit predicate. @returns Source predicate. */
  AllowBigObjects(): boolean {
    return Boolean(this.nControlBits[0] & EEControlBits.ALLOWBIGOBJS);
  }
  /** Original DoOnlineSpelling bit predicate. @returns Source predicate. */
  DoOnlineSpelling(): boolean {
    return Boolean(this.nControlBits[0] & EEControlBits.ONLINESPELLING);
  }
  /** Original DoStretch bit predicate. @returns Source predicate. */
  DoStretch(): boolean {
    return Boolean(this.nControlBits[0] & EEControlBits.STRETCHING);
  }
  /** Original AutoPageSize bit predicate. @returns Source predicate. */
  AutoPageSize(): boolean {
    return Boolean(this.nControlBits[0] & EEControlBits.AUTOPAGESIZE);
  }
  /** Original AutoPageWidth bit predicate. @returns Source predicate. */
  AutoPageWidth(): boolean {
    return Boolean(this.nControlBits[0] & EEControlBits.AUTOPAGESIZEX);
  }
  /** Original AutoPageHeight bit predicate. @returns Source predicate. */
  AutoPageHeight(): boolean {
    return Boolean(this.nControlBits[0] & EEControlBits.AUTOPAGESIZEY);
  }
  /** Original MarkNonUrlFields bit predicate. @returns Source predicate. */
  MarkNonUrlFields(): boolean {
    return Boolean(this.nControlBits[0] & EEControlBits.MARKNONURLFIELDS);
  }
  /** Original MarkUrlFields bit predicate. @returns Source predicate. */
  MarkUrlFields(): boolean {
    return Boolean(this.nControlBits[0] & EEControlBits.MARKURLFIELDS);
  }
  /** Original DoImportRTFStyleSheets bit predicate. @returns Source predicate. */
  DoImportRTFStyleSheets(): boolean {
    return Boolean(this.nControlBits[0] & EEControlBits.RTFSTYLESHEETS);
  }
  /** Original DoAutoCorrect bit predicate. @returns Source predicate. */
  DoAutoCorrect(): boolean {
    return Boolean(this.nControlBits[0] & EEControlBits.AUTOCORRECT);
  }
  /** Original DoAutoComplete bit predicate. @returns Source predicate. */
  DoAutoComplete(): boolean {
    return Boolean(this.nControlBits[0] & EEControlBits.AUTOCOMPLETE);
  }
  /** Original ULSpaceSummation bit predicate. @returns Source predicate. */
  ULSpaceSummation(): boolean {
    return Boolean(this.nControlBits[0] & EEControlBits.ULSPACESUMMATION);
  }
  /** Original IsSingleLine bit predicate. @returns Source predicate. */
  IsSingleLine(): boolean {
    return Boolean(this.nControlBits[0] & EEControlBits.SINGLELINE);
  }
}

/** @fileoverview Queries Writer fields and marks in the original hint start order. */
import { SwTextTOXMark } from "./atrtox";
import { SwTextRefMark } from "./atrref";
import {
  SwTextField,
  type SwTextDateTimeField,
  type SwTextDocInfoField,
  type SwTextDocStatField,
  type SwTextPageNumberField,
  type SwTextChapterField,
  type SwTextSequenceField,
  type SwTextJumpEditField,
  type SwTextDropDownField,
  type SwTextOrdinaryField,
  type SwTextReferenceField,
} from "../../../inc/txtfld";
import { SwSetExpField } from "../fields/expfld";
import { SwJumpEditField } from "../fields/docufld.jumpedit";
import { SwDropDownField } from "../fields/flddropdown";
import { SwChapterField } from "../fields/chpfld";
import { SwGetRefField } from "../fields/reffld";
import { SwPageNumberField } from "../fields/docufld.pagenumber";
import { SwDocInfoField, SwDocStatField, SwHiddenParaField } from "../fields/docufld";
import { SwDateTimeField } from "../fields/flddat";
import { RES_TXTATR_FIELD } from "../../../inc/hintids";
import type { SwpHints } from "./ndhints";

/** Returns native index marks in the same order as other text hints. @param this - Writer text hints. @returns Borrowed index attributes. */
export function GetIndexMarks(this: SwpHints): readonly SwTextTOXMark[] {
  return this["hintsByStart"].filter(
    /** Selects the original index-mark family. @param hint - Owned attribute. @returns Whether index mark. */
    (hint): hint is SwTextTOXMark => hint instanceof SwTextTOXMark,
  );
}

/** Returns native reference marks in start order. @param this - Writer text hints. @returns Borrowed references. */
export function GetReferenceMarks(this: SwpHints): readonly SwTextRefMark[] {
  return this["hintsByStart"].filter(
    /** Selects an owned reference mark. @param hint - Indexed hint. @returns Whether a reference. */
    (hint): hint is SwTextRefMark => hint instanceof SwTextRefMark,
  );
}

/** Returns actual ordinary reference field hints in start order. @param this - Writer text hints. @returns Native field hints. */
export function GetReferenceFields(this: SwpHints): readonly SwTextReferenceField[] {
  return this["hintsByStart"].filter(
    /** Selects the represented ordinary field type. @param hint - Indexed hint. @returns Whether a reference field. */
    (hint): hint is SwTextReferenceField =>
      hint instanceof SwTextField && hint.GetAttr().GetField() instanceof SwGetRefField,
  );
}

/** Applies native equal-weight HiddenParagraph precedence to the current fields. @param this - Writer text hints. @returns Whether a hidden-paragraph field hides this owner. */
export function IsHiddenByParaField(this: SwpHints): boolean {
  let hidden = false;
  for (const hint of this.GetOrdinaryFields()) {
    const field = hint.GetAttr().GetField();
    if (!(field instanceof SwHiddenParaField)) continue;
    if (!field.IsHidden()) return false;
    hidden = true;
  }
  return hidden;
}

/** Borrows the native ordinary field points in text order. @param this - Writer text hints. @returns Ordered field hints. */
export function GetOrdinaryFields(this: SwpHints): readonly SwTextOrdinaryField[] {
  return this["hintsByStart"].filter(
    /** Matches the native ordinary text field attribute. @param hint - Original attribute. @returns Whether it is an ordinary field. */
    (hint): hint is SwTextOrdinaryField =>
      hint instanceof SwTextField && hint.Which() === RES_TXTATR_FIELD,
  );
}

/** Returns native SetExpression sequence fields in text order. @param this - Writer text hints. @returns Ordered field points. */
export function GetSequenceFields(this: SwpHints): readonly SwTextSequenceField[] {
  return this.GetOrdinaryFields().filter(
    /** Identifies an attached sequence field. @param hint - Original text attribute. @returns Whether this is a sequence field. */
    (hint): hint is SwTextSequenceField => {
      const field = hint.GetAttr().GetField();
      return field instanceof SwSetExpField && field.IsSequenceField();
    },
  );
}

/** Returns native placeholders at their original text anchors. @param this - Writer text hints. @returns Ordered fields. */
export function GetJumpEditFields(this: SwpHints): readonly SwTextJumpEditField[] {
  return this["hintsByStart"].filter(
    /** Identifies a native placeholder. @param hint - Text attribute. @returns Whether this is a JumpEdit field. */
    (hint): hint is SwTextJumpEditField =>
      hint instanceof SwTextField && hint.GetAttr().GetField() instanceof SwJumpEditField,
  );
}

/** Returns native drop-downs at their original text anchors. @param this - Writer text hints. @returns Ordered fields. */
export function GetDropDownFields(this: SwpHints): readonly SwTextDropDownField[] {
  return this["hintsByStart"].filter(
    /** Identifies a native drop-down. @param hint - Text attribute. @returns Whether this is a DropDown field. */
    (hint): hint is SwTextDropDownField =>
      hint instanceof SwTextField && hint.GetAttr().GetField() instanceof SwDropDownField,
  );
}

/** Returns native Chapter fields at their original text anchors. @param this - Writer text hints. @returns Ordered fields. */
export function GetChapterFields(this: SwpHints): readonly SwTextChapterField[] {
  return this["hintsByStart"].filter(
    /** Identifies a native Chapter field. @param hint - Text attribute. @returns Whether this is a chapter field. */
    (hint): hint is SwTextChapterField =>
      hint instanceof SwTextField && hint.GetAttr().GetField() instanceof SwChapterField,
  );
}

/** Returns native PageNumber fields at their original text anchors. @param this - Writer text hints. @returns Ordered fields. */
export function GetPageNumberFields(this: SwpHints): readonly SwTextPageNumberField[] {
  return this["hintsByStart"].filter(
    /** Identifies the actual page number field. @param hint - Text attribute. @returns Whether this is a native page number. */
    (hint): hint is SwTextPageNumberField =>
      hint instanceof SwTextField && hint.GetAttr().GetField() instanceof SwPageNumberField,
  );
}

/** Returns native statistic fields in start order. @param this - Writer text hints. @returns Native field hints. */
export function GetDocStatFields(this: SwpHints): readonly SwTextDocStatField[] {
  return this["hintsByStart"].filter(
    /** Identifies the actual statistic field type. @param hint - Native hint. @returns Whether a count field. */
    (hint): hint is SwTextDocStatField =>
      hint instanceof SwTextField && hint.GetAttr().GetField() instanceof SwDocStatField,
  );
}

/** Finds the actual document information fields. @param this - Writer text hints. @returns Ordered native hints. */
export function GetDocInfoFields(this: SwpHints): readonly SwTextDocInfoField[] {
  return this["hintsByStart"].filter(
    /** Selects the actual value class. @param hint - Text attribute. @returns Whether a DocInfo field. */
    (hint): hint is SwTextDocInfoField =>
      hint instanceof SwTextField && hint.GetAttr().GetField() instanceof SwDocInfoField,
  );
}

/** Returns native date and time field hints in start order. @param this - Writer text hints. @returns Native field hints. */
export function GetDateTimeFields(this: SwpHints): readonly SwTextDateTimeField[] {
  return this["hintsByStart"].filter(
    /** Selects the actual field value class. @param hint - Text attribute. @returns Whether a date/time field. */
    (hint): hint is SwTextDateTimeField =>
      hint instanceof SwTextField && hint.GetAttr().GetField() instanceof SwDateTimeField,
  );
}

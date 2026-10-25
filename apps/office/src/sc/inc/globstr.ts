/** @fileoverview Pinned globstr.hrc style resource values at the existing English browser UI boundary. This is resource data,not a ScModule/gettext/locale service. */
export const scStyleNameResourcesEnglish = Object.freeze({
  STR_STYLENAME_HEADING: "Heading",
  STR_STYLENAME_HEADING_1: "Heading 1",
  STR_STYLENAME_HEADING_2: "Heading 2",
  STR_STYLENAME_TEXT: "Text",
  STR_STYLENAME_NOTE: "Note",
  STR_STYLENAME_FOOTNOTE: "Footnote",
  STR_STYLENAME_HYPERLINK: "Hyperlink",
  STR_STYLENAME_STATUS: "Status",
  STR_STYLENAME_GOOD: "Good",
  STR_STYLENAME_NEUTRAL: "Neutral",
  STR_STYLENAME_BAD: "Bad",
  STR_STYLENAME_WARNING: "Warning",
  STR_STYLENAME_ERROR: "Error",
  STR_STYLENAME_ACCENT: "Accent",
  STR_STYLENAME_ACCENT_1: "Accent 1",
  STR_STYLENAME_ACCENT_2: "Accent 2",
  STR_STYLENAME_ACCENT_3: "Accent 3",
  STR_STYLENAME_RESULT: "Result",
  STR_STYLENAME_STANDARD: "Default",
  STR_STYLENAME_RESULT1: "Result2",
  STR_PIVOT_STYLENAME_INNER: "Pivot Table Value",
  STR_PIVOT_STYLENAME_RESULT: "Pivot Table Result",
  STR_PIVOT_STYLENAME_CATEGORY: "Pivot Table Category",
  STR_PIVOT_STYLENAME_TITLE: "Pivot Table Title",
  STR_PIVOT_STYLENAME_FIELDNAME: "Pivot Table Field",
  STR_PIVOT_STYLENAME_TOP: "Pivot Table Corner",
  STR_STYLENAME_REPORT: "Report",
});
/** Actual resolved ScResId values borrowed at native style-name map construction sites. */
export type ScStyleNameResources = Readonly<
  Record<keyof typeof scStyleNameResourcesEnglish, string>
>;

/** Pinned resolved English paste/error resources at the same existing browser boundary;no gettext service is simulated. */
export const scPasteResourcesEnglish = Object.freeze({
  STR_MSSG_PASTEFROMCLIP_0: "Insert into multiple selection not possible",
  STR_PROTECTIONERR: "Protected cells can not be modified.",
  STR_PASTE_FULL: "There is not enough space on the sheet to insert here.",
});

# Calc CSV integration dependency boundary

Task: `202610251610-AQF9AG`. Baseline: LibreOffice `libreoffice-26.8.0.2`, commit `9bc445578031fecf56086729d8e4940c77e14d65`.

The delivery is native CSV behavior in the application's current core slice, connected to its existing UI. It is not a prerequisite to finish all public Calc, SVL, ICU or UNO capabilities. Existing browser-specific save/open/autosave/recovery decisions remain in effect. Required code follows the pinned upstream behavior, including suspected issues; this scope boundary does not authorize a replacement parser, heuristic fallback, invented format key, selective omission from a required initializer or unsupported-option errors absent upstream.

## Dependency admission rule

Every further core addition must identify either a concrete CSV caller below or an initialization dependency required by that caller. An unimplemented branch unrelated to these paths may remain outside the CSV delivery. Already completed shared work is retained. Tests and native witnesses establish only their stated scope, not completion of the entire CSV requirement.

## Required call paths and current gaps

| CSV behavior | Pinned source call path | Current evidence and required work |
| --- | --- | --- |
| Stream/encoding/field parsing | `ScImportExport::ExtText2Doc`, `ReadCsvLine`, `ScanNextFieldFromString`, `lcl_GetFixed` in `sc/source/ui/docshell/impex.cxx` | Local stream, quoting, fixed-width and overflow paths exist. Finish the option-by-option comparison and actual UI acceptance; current tests alone do not prove all options. |
| Ordinary automatic input | `lcl_PutString` -> `ScDocumentImport::setAutoInput` -> `ScColumn::ParseString` | Original ParseString/setAutoInput and the native CSV parameter/caller path are now connected, including formula checks, ownership transfer, preset formats and overwrite rules. All seven recognition cases pass. Dedicated full native differential and option/multiline acceptance remain pending. |
| English column type | `lcl_PutString`, `SC_COL_ENGLISH` -> document formatter `GetStandardIndex(LANGUAGE_ENGLISH_US)` / `IsNumberFormat` | This source branch now calls the actual document formatter GetStandardIndex/IsNumberFormat and writes its numeric result without applying an English cell format, as upstream. The German-import/English-column integration case passes; later auto-input fallback remains pending. |
| Explicit date column types | `lcl_PutString` -> actual calendar/transliteration -> `GetStandardFormat(DATE/DATETIME, documentLanguage)` -> numeric value and number-format attribute | The original explicit-date branch is connected to real primary/secondary calendar and transliteration owners, document language/default format selection and ScDocument/ScTable/ScColumn number-format attributes. DMY/MDY/YMD recognition cases pass;17 additional date cases cover compact inputs, names, year expansion, AM/PM, fractions and ISO fallbacks. Source receiver and timezone-colon findings CALC-358/359 are retained. Dedicated native full-branch differential verification remains pending. |
| Special/scientific number options | `lcl_PutString` -> `ScSetStringParam` with source detection flags / `SpecialNumberOnly` -> `setAutoInput` | Original ScSetStringParam flags now reach ParseString through setAutoInput; special-number false/true integration cases pass with actual Text/Percent attributes. Broader option combinations and source differential verification remain pending. |
| Quoted text and formula-text handling | Source `lcl_PutString` text branch -> source format recognition / standard TEXT format / text-cell APIs | Local handling exists in part; compare source numeric-looking text formatting, quoted-field flags and formula evaluation, including interaction with special-number detection. |
| Multiline cells | `lcl_PutString` -> actual edit-text/document APIs | Local calls `SetTextCell`; verify the actual EditEngine path and relevant row-height/finalization behavior rather than interpreting a passing string comparison as full integration. |
| Numeric/date/formula export | Source export -> `ScCellFormat` / formatter input-line or display-output path, depending on options | General-number export exists. Required date/time and other cell-format families reachable in the current slice need real output behavior. CSV must not serialize fabricated defaults or reject an option merely because a shared output branch is unfinished. |
| Import/export UI | Existing Calc browser file workflow and CSV option dialog -> `ScDocShell` filter dispatch | One existing browser CSV round trip passes. Finish all supported option paths and source UI/core contracts, retaining intentional browser file-management differences. |

## Formatter work required by these callers

`IsNumberFormat`, standard-format selection, null-date/year expansion, locale/calendar recognition and real standard entries are direct dependencies. The format scanner is required to compile those entries. Locale format codes can contain native-number, color or other prefixes, so the original constructor stages needed by the actual locale initializers are also dependencies; a completed bare scanner does not establish that those constructor stages exist. The my-MM standard-entry regression now passes through the connected original constructor, with actual NatNum metadata and a real key0 entry. This proves standard-entry compilation, not native-number display output or complete standard-table generation; the original strict assertion remains enabled.

The formatter constructor now invokes the full original builtin-generation sequence, including both additional-format passes. Connected tests prove all62 builtin entries and actual additional-format allocation for eight locales; the full initializer still needs its own native differential verification. Standard-format selection, complete writable/readonly accessor policies, original currency default insertion and public recognition are now connected and covered by real-owner integration tests. Full native wrapper/currency differential verification remains pending. Broad formatter editing APIs, unrelated service methods and exhaustive implementation of other Calc features are not independent prerequisites for CSV. Any additional output/prefix/calendar branch is justified by a reachable cell format, CSV language option or the original required initializer, not by general completeness alone.

## Immediate implementation order

1. Finish verification of the already ported lexical/type/final scanner and its consumed string primitives. Keep remaining constructor/output gaps explicit.
2. Add end-to-end CSV tests for explicit dates, English columns, special-number flags and format attributes. Use the missing real caller/formatter behavior exposed by those tests to order dependency work.
3. Connect the existing original `ScSetStringParam`, `ScColumn::ParseString`, `ScDocumentImport::setAutoInput` and missing `lcl_PutString` branches to the actual document owners.
4. Complete reachable export formatting and multiline paths, then audit the complete CSV option/UI surface against upstream.

Full-suite cadence remains one run per ten Agentplane tasks; this continuation is still the same open task. Focused module and CSV/browser checks apply to each implementation block.

## Direct contract mismatch found during the audit

The local external column codes used Standard0/Text1, while the pinned `sc/source/ui/inc/csvcontrol.hxx` declares Standard1/Text2. Zero is the grid's separate `CSV_TYPE_DEFAULT` internal index, not the external filter-option code. The external constants and import fallback must use original1/2 values; serialized column options and tests must follow those source values. This is a local defect, not a suspected upstream issue.

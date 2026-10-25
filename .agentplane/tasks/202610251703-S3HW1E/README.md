---
id: "202610251703-S3HW1E"
title: "Complete current Writer model slice across TXT RTF Markdown filters"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 59
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-25T17:03:38.624Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-10-25T17:03:46.873Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-10-25T22:06:05.654Z"
doc_updated_by: "CODER"
description: "Audit represented Writer body, paragraph, character, list, table, and hyperlink contracts against pinned LibreOffice sources; close format import/export gaps in the already approved native filter scope and verify targeted behavior."
sections:
  Summary: |-
    Complete current Writer model slice across TXT RTF Markdown filters

    Audit represented Writer body, paragraph, character, list, table, and hyperlink contracts against pinned LibreOffice sources; close format import/export gaps in the already approved native filter scope and verify targeted behavior.
  Scope: "In scope: current Writer document model body blocks, text runs, hyperlinks, paragraph attributes, lists and tables across native TXT export, RTF and Markdown import/export; filter-to-shell-to-browser connection; pinned upstream comparison; targeted tests and provenance. Out of scope: model features absent from the current core, recovery and browser save/autosave deviations, unrelated formats and full regression suite before task ten."
  Plan: "Audit canonical Writer body and attribute model against pinned LibreOffice TXT RTF Markdown paths; repair all represented import and export gaps in current filter scope; add a capability matrix and targeted round-trip tests; run TypeScript, lint, provenance, registry and module-boundary checks. Keep browser save deviations intact; no full suite before tenth task."
  Verify Steps: "1. Run focused Writer TXT, RTF, Markdown filter and document I/O tests; all pass. 2. Run TypeScript typecheck and ESLint/Prettier for changed source; all pass. 3. Run source-provenance, Writer registry and module-boundary checks; all pass. 4. Review the capability matrix against current SwDoc/SwTextNode/SwTable and pinned upstream sources, recording supported, format-inapplicable and unsupported cases with evidence. 5. Confirm git status has no unintended changes."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    Interim audit; full current-slice closure remains pending. Capability matrix: docs/program/writer-native-text-filter-slice.md. This batch replaces the RTF browser TextDecoder/unsupported-code-page fallback with pinned sal/textenc/textcvt.cxx ImplDummyToUnicode. SAL maps unavailable converters to direct byte-to-U+00xx units, including Apple Arabic/Hebrew code pages 10004/10005 and unknown code pages. WRITER115 documents the pinned nullptr TODO entries and retained behavior. Command: npx vitest run apps/office/src/sal/textenc/textcvt.test.ts apps/office/src/sw/source/writerfilter/rtftok/rtfdocumentimpl.test.ts apps/office/src/sal/textenc/convertiso2022.test.ts apps/office/src/sal/textenc/tcvtutf7.test.ts. Result: pass. Evidence: 108 tests in four related modules; a follow-up RTF-only run passed 97 tests including font-charset routing. Scope: SAL dummy conversion, RTF byte dispatch and adjacent ISO-2022/UTF-7 regressions. Command: npm run typecheck; npx eslint changed source --max-warnings 0; npx prettier --check changed source. Result: pass. Scope: changed TypeScript. Command: npm run check:source-provenance; npm run inventory:parity:writer; npm run inventory:parity:shared; npm run check:dependencies. Result: pass. Evidence: 1407 runtime modules mapped by provenance; Writer/shared registries and 1406 runtime-source boundaries pass. Remaining gaps include full md4c syntax/callback parity and URL normalization, RTF field/style/list/table/paragraph/section differentials, physical font metrics, full byte/code-page and compiled upstream differential comparisons. Pinned md4c source is absent locally; network approval is pending. No final verification or full-slice parity claim yet.

    Markdown style-ancestry batch: sw/source/filter/md/wrtmd.cxx OutMarkdown_SwTextNode scans GetAnyFormatColl().DerivedFrom() for the first built-in Heading 1-6 pool ID and writes the direct quotation marker before the heading marker. The local writer now follows those decisions for document-owned named styles; tests cover multi-level descendants and quote/heading order. Command: npx vitest run apps/office/src/sw/source/filter/md/wrtmd.test.ts apps/office/src/sw/source/filter/md/swmd.test.ts. Result: pass, 26 tests. Command: npm run typecheck --workspace @vite-office/office; npx eslint changed source --max-warnings 0; npx prettier --check changed paths; npm run check:source-provenance; npm run check:dependencies; npm run inventory:parity:writer; git diff --check. Result: pass. Full current-slice closure remains pending; md4c grammar and other matrix gaps remain open.

    Markdown source paragraph-stream batch: pinned sw/source/filter/md/wrtmd.cxx OutMarkdown_SwTextNode writes a preceding separator for every nonfirst nonempty body paragraph (including neighboring list and code paragraphs), writes a newline for each empty paragraph, and writes a leading table separator. The local writer now follows the per-node order and suppresses inline code delimiters inside fenced blocks. The local reader retains the same native list across the single blank line emitted for loose list items. WRITER116 records the source-level unmatched-fence case for an empty leading preformatted paragraph. Command: npm run test:writer --workspace @vite-office/office -- src/sw/source/filter/ascii src/sw/source/filter/ww8 src/sw/source/filter/md src/sw/source/writerfilter/rtftok src/sw/browser/workflows/writer-odt-io.test.ts src/sw/browser/presentation/WriterFileDialog.test.tsx src/sw/browser/composition/writer-module.test.tsx. Result: pass. Evidence: 230 tests in ten related files. Command: npm run typecheck --workspace @vite-office/office; npx eslint changed source --max-warnings 0; npx prettier --check changed paths; npm run check:source-provenance; npm run check:dependencies; npm run inventory:parity:writer; git diff --check. Result: pass. Scope: Markdown writer/reader, adjacent TXT/RTF and Writer UI I/O, source registry and module contracts. Full current-slice closure remains pending; md4c grammar, encoding and other capability-matrix gaps remain open.

    Markdown source-encoding audit: pinned SwAsciiOptions::Reset initializes GetCharSet() from osl_getThreadTextEncoding(); MarkdownReader::Read passes that value to SwMarkdownParser::CallParser, where SvStream::DetectEncoding is conditional on DONTKNOW. The browser default remains UTF-8, rather than adding an unconditional BOM detector that would contradict the default source route. WRITER117 records the suspected unreachable default detection branch. The one source-confirmed byte failure closed here is an empty Markdown stream, now rejected before allocating a replacement document. Command: npm run test:writer --workspace @vite-office/office -- src/sw/source/filter/ascii src/sw/source/filter/ww8 src/sw/source/filter/md src/sw/source/writerfilter/rtftok src/sw/source/uibase/app/docsh.test.ts src/sw/browser/workflows/writer-odt-io.test.ts src/sw/browser/presentation/WriterFileDialog.test.tsx src/sw/browser/composition/writer-module.test.tsx. Result: pass, 249 tests in eleven related files. Command: npm run typecheck --workspace @vite-office/office; npx eslint changed source --max-warnings 0; npx prettier --check changed paths; npm run check:source-provenance; npm run check:dependencies; npm run inventory:parity:writer; git diff --check. Result: pass. Full byte detection through an explicit unknown encoding and compiled md4c parity remain open. Network permission was requested solely for downloading the pinned md4c 0.5.3 source archive after identifying its recorded SHA-256; no network action has occurred.
id_source: "generated"
---
## Summary

Complete current Writer model slice across TXT RTF Markdown filters

Audit represented Writer body, paragraph, character, list, table, and hyperlink contracts against pinned LibreOffice sources; close format import/export gaps in the already approved native filter scope and verify targeted behavior.

## Scope

In scope: current Writer document model body blocks, text runs, hyperlinks, paragraph attributes, lists and tables across native TXT export, RTF and Markdown import/export; filter-to-shell-to-browser connection; pinned upstream comparison; targeted tests and provenance. Out of scope: model features absent from the current core, recovery and browser save/autosave deviations, unrelated formats and full regression suite before task ten.

## Plan

Audit canonical Writer body and attribute model against pinned LibreOffice TXT RTF Markdown paths; repair all represented import and export gaps in current filter scope; add a capability matrix and targeted round-trip tests; run TypeScript, lint, provenance, registry and module-boundary checks. Keep browser save deviations intact; no full suite before tenth task.

## Verify Steps

1. Run focused Writer TXT, RTF, Markdown filter and document I/O tests; all pass. 2. Run TypeScript typecheck and ESLint/Prettier for changed source; all pass. 3. Run source-provenance, Writer registry and module-boundary checks; all pass. 4. Review the capability matrix against current SwDoc/SwTextNode/SwTable and pinned upstream sources, recording supported, format-inapplicable and unsupported cases with evidence. 5. Confirm git status has no unintended changes.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Interim audit; full current-slice closure remains pending. Capability matrix: docs/program/writer-native-text-filter-slice.md. This batch replaces the RTF browser TextDecoder/unsupported-code-page fallback with pinned sal/textenc/textcvt.cxx ImplDummyToUnicode. SAL maps unavailable converters to direct byte-to-U+00xx units, including Apple Arabic/Hebrew code pages 10004/10005 and unknown code pages. WRITER115 documents the pinned nullptr TODO entries and retained behavior. Command: npx vitest run apps/office/src/sal/textenc/textcvt.test.ts apps/office/src/sw/source/writerfilter/rtftok/rtfdocumentimpl.test.ts apps/office/src/sal/textenc/convertiso2022.test.ts apps/office/src/sal/textenc/tcvtutf7.test.ts. Result: pass. Evidence: 108 tests in four related modules; a follow-up RTF-only run passed 97 tests including font-charset routing. Scope: SAL dummy conversion, RTF byte dispatch and adjacent ISO-2022/UTF-7 regressions. Command: npm run typecheck; npx eslint changed source --max-warnings 0; npx prettier --check changed source. Result: pass. Scope: changed TypeScript. Command: npm run check:source-provenance; npm run inventory:parity:writer; npm run inventory:parity:shared; npm run check:dependencies. Result: pass. Evidence: 1407 runtime modules mapped by provenance; Writer/shared registries and 1406 runtime-source boundaries pass. Remaining gaps include full md4c syntax/callback parity and URL normalization, RTF field/style/list/table/paragraph/section differentials, physical font metrics, full byte/code-page and compiled upstream differential comparisons. Pinned md4c source is absent locally; network approval is pending. No final verification or full-slice parity claim yet.

Markdown style-ancestry batch: sw/source/filter/md/wrtmd.cxx OutMarkdown_SwTextNode scans GetAnyFormatColl().DerivedFrom() for the first built-in Heading 1-6 pool ID and writes the direct quotation marker before the heading marker. The local writer now follows those decisions for document-owned named styles; tests cover multi-level descendants and quote/heading order. Command: npx vitest run apps/office/src/sw/source/filter/md/wrtmd.test.ts apps/office/src/sw/source/filter/md/swmd.test.ts. Result: pass, 26 tests. Command: npm run typecheck --workspace @vite-office/office; npx eslint changed source --max-warnings 0; npx prettier --check changed paths; npm run check:source-provenance; npm run check:dependencies; npm run inventory:parity:writer; git diff --check. Result: pass. Full current-slice closure remains pending; md4c grammar and other matrix gaps remain open.

Markdown source paragraph-stream batch: pinned sw/source/filter/md/wrtmd.cxx OutMarkdown_SwTextNode writes a preceding separator for every nonfirst nonempty body paragraph (including neighboring list and code paragraphs), writes a newline for each empty paragraph, and writes a leading table separator. The local writer now follows the per-node order and suppresses inline code delimiters inside fenced blocks. The local reader retains the same native list across the single blank line emitted for loose list items. WRITER116 records the source-level unmatched-fence case for an empty leading preformatted paragraph. Command: npm run test:writer --workspace @vite-office/office -- src/sw/source/filter/ascii src/sw/source/filter/ww8 src/sw/source/filter/md src/sw/source/writerfilter/rtftok src/sw/browser/workflows/writer-odt-io.test.ts src/sw/browser/presentation/WriterFileDialog.test.tsx src/sw/browser/composition/writer-module.test.tsx. Result: pass. Evidence: 230 tests in ten related files. Command: npm run typecheck --workspace @vite-office/office; npx eslint changed source --max-warnings 0; npx prettier --check changed paths; npm run check:source-provenance; npm run check:dependencies; npm run inventory:parity:writer; git diff --check. Result: pass. Scope: Markdown writer/reader, adjacent TXT/RTF and Writer UI I/O, source registry and module contracts. Full current-slice closure remains pending; md4c grammar, encoding and other capability-matrix gaps remain open.

Markdown source-encoding audit: pinned SwAsciiOptions::Reset initializes GetCharSet() from osl_getThreadTextEncoding(); MarkdownReader::Read passes that value to SwMarkdownParser::CallParser, where SvStream::DetectEncoding is conditional on DONTKNOW. The browser default remains UTF-8, rather than adding an unconditional BOM detector that would contradict the default source route. WRITER117 records the suspected unreachable default detection branch. The one source-confirmed byte failure closed here is an empty Markdown stream, now rejected before allocating a replacement document. Command: npm run test:writer --workspace @vite-office/office -- src/sw/source/filter/ascii src/sw/source/filter/ww8 src/sw/source/filter/md src/sw/source/writerfilter/rtftok src/sw/source/uibase/app/docsh.test.ts src/sw/browser/workflows/writer-odt-io.test.ts src/sw/browser/presentation/WriterFileDialog.test.tsx src/sw/browser/composition/writer-module.test.tsx. Result: pass, 249 tests in eleven related files. Command: npm run typecheck --workspace @vite-office/office; npx eslint changed source --max-warnings 0; npx prettier --check changed paths; npm run check:source-provenance; npm run check:dependencies; npm run inventory:parity:writer; git diff --check. Result: pass. Full byte detection through an explicit unknown encoding and compiled md4c parity remain open. Network permission was requested solely for downloading the pinned md4c 0.5.3 source archive after identifying its recorded SHA-256; no network action has occurred.

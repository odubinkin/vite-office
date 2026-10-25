---
id: "202610251549-V4DQJW"
title: "Implement Writer DOCX import export and existing file UI integration"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on:
  - "202610251549-R2DJ64"
tags:
  - "code"
  - "docx"
verify:
  - "DOCX imported upstream fixtures and export/reopen tests for existing Writer features; shell failure/stale-result tests, mounted UI and browser download/reopen; related ODT regressions and quality gates."
plan_approval:
  state: "approved"
  updated_at: "2026-10-25T16:11:33.189Z"
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
    body: "Start: Implement the approved Writer DOCX pipeline using native OOXML values, DomainMapper text/style/table APIs and DocxExport ownership, then connect existing shell and file UI with focused verification."
events:
  -
    type: "status"
    at: "2026-10-25T16:11:33.702Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the approved Writer DOCX pipeline using native OOXML values, DomainMapper text/style/table APIs and DocxExport ownership, then connect existing shell and file UI with focused verification."
doc_version: 3
doc_updated_at: "2026-10-25T17:10:00.979Z"
doc_updated_by: "CODER"
description: "User-approved second cohesive task: preserve pinned WriterFilter OOXML/DomainMapper import and DocxExportFilter/DocxExport ownership while supporting the existing Writer core slice, including paragraphs, runs, pooled formatting, styles, lists, tables, links and page properties where implemented. Integrate asynchronous shell filter routing, existing Open and download UI, errors/cancellation and primary ODT persistence. Refactor old workarounds in touched paths, record suspected upstream issues, provenance and related tests. No recovery/autosave product changes, network or publication."
sections:
  Summary: |-
    Implement Writer DOCX import export and existing file UI integration

    User-approved second cohesive task: preserve pinned WriterFilter OOXML/DomainMapper import and DocxExportFilter/DocxExport ownership while supporting the existing Writer core slice, including paragraphs, runs, pooled formatting, styles, lists, tables, links and page properties where implemented. Integrate asynchronous shell filter routing, existing Open and download UI, errors/cancellation and primary ODT persistence. Refactor old workarounds in touched paths, record suspected upstream issues, provenance and related tests. No recovery/autosave product changes, network or publication.
  Scope: "User-approved second cohesive task, dependent on completed R2DJ64 (implementation 06a4c723d3b6, closure e160641b1dc2). Port consumed sw/source/writerfilter/{filter,ooxml,dmapper} owners, sw/source/filter/ww8 DocxExport/DocxAttributeOutput/table export and any required existing Writer UNO/core contracts. Integrate DOCX with SwDocShell filter selection and existing Open/download controls, preserving ODT primary browser persistence, autosave scheduling and absence of recovery. Support the current represented Writer graph: paragraph/run formatting (including three script families), named paragraph styles, numbering/lists, hyperlinks/bookmarks, table/row/cell formatting, page descriptors and line numbering where represented. Include asynchronous filter/worker adaptation, cancellation/stale results, errors, roundtrips, UI and registry evidence. Approximately 35 production/filter/browser/API paths plus paired records and tests; use upstream owners and extend missing consumed modules rather than DTO or ODT conversion shortcuts. No network, external writes, release/publish, unrelated feature expansion or policy changes."
  Plan: "1. Read pinned WriterFilter -> OOXMLStream/OOXMLDocument -> DomainMapper -> native text/style/table APIs and DocxExportFilter -> DocxExport/DocxAttributeOutput. 2. Implement consumed resource values/property sets, typed property mapping, style/numbering/table/section handlers and real model import in native ownership order. 3. Export canonical nodes/items/format owners directly to DOCX parts and relationships; preserve default and explicit property semantics. 4. Route shell operations through the selected native filter and extend existing browser file format choices, shared asynchronous execution only at the platform boundary. 5. Add meaningful actual-model/upstream-fixture roundtrips, shell failure/stale-generation tests and real UI/browser download-reopen tests. Update source records and suspected issue ledger without parity overclaims. 6. Run related checks, record verification/evaluator evidence and finish locally. Entire three-task plan approved by the user; no further approval is needed for this in-scope work."
  Verify Steps: "Use focused npm run test:writer -- tests for new writerfilter/DOCX modules, impacted UNO/core owners and existing shell/file/browser controls. Require true SwDoc graph assertions for imported styles/runs/lists/tables/page settings and DOCX ZIP XML assertions plus export/reopen; include actual pinned strict/transitional fixtures when local research corpus exists. Verify empty and formatted documents, Unicode/whitespace, nondefault formatting and default fallback, links/bookmarks, supported lists/table structure/cell items, page descriptors, cancellation/concurrent Open, failed import preserving active graph, export preserving primary modified/medium state and downloaded DOCX reopening through the production UI. Measure all newly implemented executable owners at unchanged scoped100 coverage; use relevant ODT/primary-storage regressions. Run typecheck, build, scoped ESLint/Prettier, dependencies/resources/docs/size/tree/provenance/registry/invariants/parity/static, doctor/routing/diff and real production Chromium browser scenarios at desktop/mobile widths. Preserve all thresholds; no full suite due (second task after SWRD7X full checkpoint)."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task's intentional implementation commits, preserving the shared OOXML prerequisite and other task history. Re-run impacted Writer DOCX/ODT shell and file UI tests and typecheck/build; confirm original ODT/TXT workflows and primary-store behavior."
  Findings: |-
    Source routing confirms native filter IDs MS Word 2007 XML and Office Open XML Text both use com.sun.star.comp.Writer.WriterFilter. Native import creates DomainMapper over the destination SwXTextDocument; XML values/properties resolve separately from document model updates. Export delegates to DocxExportFilter. Existing local SwXText.appendTextPortion/finishParagraph/convertToTable and native style suppliers can be reused; do not convert DOCX through ODT or fill browser projection DTOs. New shared OOXML package code is committed and verified. Current task is not implemented/verified yet.

    - Observation: Progress checkpoint: implemented actual OOXMLValue, OOXMLProperty/PropertySet/Table and consumed native receiver interfaces. 52 actual RTL/Any/OUString/resource tests pass; fresh values-owner coverage S120/B93/F42/L101 all100. Added434exact native resource constants generated by unchanged upstream resourceids.py/model.xml; two independent/fulls ubset checks pass with fresh constant-owner coverage100. Current source hashes and exact commands: evidence/resource-checkpoint.json. Typecheck, docs, scoped lint/format, provenance and dependency checks pass; exact original Library_sw sax edge was added after architecture gate identified it.
      Impact: V4DQJW remains DOING. DomainMapper model mapping, document export, selected shell filter, asynchronous behavior and file UI integration are not implemented yet; no DOCX application support or parity is claimed. The broader approved goal and remaining scope are unchanged.
      Resolution: Continue the same cohesive task with native PropertyMap ordering/cache/default behavior, then DomainMapper/OOXML context and Writer export integration. Reuse existing SwXText append/finish/convertToTable and actual style/numbering APIs. Preserve primary ODT storage and product deviations. No full suite is due until the tenth task after SWRD7X.

    - Observation: Writer OOXMLStreamImpl consumes ordered XRelationshipAccess sequences and UriReferenceFactory RETAIN semantics, unlike oox::Relations. DomainMapper toggle129 consumes imported style entry/DocDefaults values rather than UNO pooled style defaults. Native defaults include 10pt in all three script families and auto-kerning disabled.
      Impact: Reusing oox relation admission/resolution or querying finished Writer styles would change DOCX targets and inherited formatting. PropertyMap overwrite/cache and style-cycle guard behavior also require source-exact preservation.
      Resolution: Port separate native Writer stream traversal and generic stoc URI owners, real typed property maps and stylesheet lookup. Preserve surprises in WRITER094-096. Focused tests cover actual Writer model properties and pinned strict/transitional DOCX package streams. Application DOCX model import/export/UI and task-wide coverage/verification remain in progress.

    - Observation: Command: npm run test:coverage with seven selected writerfilter/stoc/OFOPXML test files and explicit includes for 15 checkpoint runtime modules (exact argv in evidence/mapper-stream-checkpoint.json). Result: pass. Evidence: 87 tests; S1218 B610 F135 L1153, all100. Command: npm run typecheck; npm run build; scoped ESLint and Prettier; check:docs, check:dependencies, check:source-provenance, check:file-size, check:source-tree, inventory:registry:build/check, policy routing, ap doctor, static build smoke, git diff --check. Result: pass. Scope: property/stylesheet lookup and package stream checkpoint only.
      Impact: Actual Writer UNO import API regressions also pass47 cases. Coverage includes all code in the 15 measured owners, with unchanged100 thresholds. These results do not establish full DOCX import/export or UI behavior; task-wide acceptance remains pending. Doctor retains the existing hook-readiness warning, unrelated to this task.
      Resolution: Persist source hashes, exact commands, fixture names and remaining responsibilities in a task-local checkpoint artifact, commit the cohesive implementation block, and continue the same approved Writer task into resource parsing and model import. Do not finish/verify the whole task or run the full suite at this second task after SWRD7X.

    - Observation: Full pinned-source table comparison caught eight omitted META_PROP_* name bindings in the new local PropertyIds table. The original has385 enum declarations and382 UNO name bindings; prior spot checks and branch coverage did not establish completeness of static data.
      Impact: The omitted names would have produced the native empty-string fallback for represented table metadata despite valid resource identities.
      Resolution: Regenerate all382 bindings including META_PROP_* from the original source. Add live source-contract tests for all385 IDs,382 names and439 native style-name pairs. Both focused files now pass13 cases. This is a local implementation correction, not an upstream suspected issue.
id_source: "generated"
---
## Summary

Implement Writer DOCX import export and existing file UI integration

User-approved second cohesive task: preserve pinned WriterFilter OOXML/DomainMapper import and DocxExportFilter/DocxExport ownership while supporting the existing Writer core slice, including paragraphs, runs, pooled formatting, styles, lists, tables, links and page properties where implemented. Integrate asynchronous shell filter routing, existing Open and download UI, errors/cancellation and primary ODT persistence. Refactor old workarounds in touched paths, record suspected upstream issues, provenance and related tests. No recovery/autosave product changes, network or publication.

## Scope

User-approved second cohesive task, dependent on completed R2DJ64 (implementation 06a4c723d3b6, closure e160641b1dc2). Port consumed sw/source/writerfilter/{filter,ooxml,dmapper} owners, sw/source/filter/ww8 DocxExport/DocxAttributeOutput/table export and any required existing Writer UNO/core contracts. Integrate DOCX with SwDocShell filter selection and existing Open/download controls, preserving ODT primary browser persistence, autosave scheduling and absence of recovery. Support the current represented Writer graph: paragraph/run formatting (including three script families), named paragraph styles, numbering/lists, hyperlinks/bookmarks, table/row/cell formatting, page descriptors and line numbering where represented. Include asynchronous filter/worker adaptation, cancellation/stale results, errors, roundtrips, UI and registry evidence. Approximately 35 production/filter/browser/API paths plus paired records and tests; use upstream owners and extend missing consumed modules rather than DTO or ODT conversion shortcuts. No network, external writes, release/publish, unrelated feature expansion or policy changes.

## Plan

1. Read pinned WriterFilter -> OOXMLStream/OOXMLDocument -> DomainMapper -> native text/style/table APIs and DocxExportFilter -> DocxExport/DocxAttributeOutput. 2. Implement consumed resource values/property sets, typed property mapping, style/numbering/table/section handlers and real model import in native ownership order. 3. Export canonical nodes/items/format owners directly to DOCX parts and relationships; preserve default and explicit property semantics. 4. Route shell operations through the selected native filter and extend existing browser file format choices, shared asynchronous execution only at the platform boundary. 5. Add meaningful actual-model/upstream-fixture roundtrips, shell failure/stale-generation tests and real UI/browser download-reopen tests. Update source records and suspected issue ledger without parity overclaims. 6. Run related checks, record verification/evaluator evidence and finish locally. Entire three-task plan approved by the user; no further approval is needed for this in-scope work.

## Verify Steps

Use focused npm run test:writer -- tests for new writerfilter/DOCX modules, impacted UNO/core owners and existing shell/file/browser controls. Require true SwDoc graph assertions for imported styles/runs/lists/tables/page settings and DOCX ZIP XML assertions plus export/reopen; include actual pinned strict/transitional fixtures when local research corpus exists. Verify empty and formatted documents, Unicode/whitespace, nondefault formatting and default fallback, links/bookmarks, supported lists/table structure/cell items, page descriptors, cancellation/concurrent Open, failed import preserving active graph, export preserving primary modified/medium state and downloaded DOCX reopening through the production UI. Measure all newly implemented executable owners at unchanged scoped100 coverage; use relevant ODT/primary-storage regressions. Run typecheck, build, scoped ESLint/Prettier, dependencies/resources/docs/size/tree/provenance/registry/invariants/parity/static, doctor/routing/diff and real production Chromium browser scenarios at desktop/mobile widths. Preserve all thresholds; no full suite due (second task after SWRD7X full checkpoint).

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task's intentional implementation commits, preserving the shared OOXML prerequisite and other task history. Re-run impacted Writer DOCX/ODT shell and file UI tests and typecheck/build; confirm original ODT/TXT workflows and primary-store behavior.

## Findings

Source routing confirms native filter IDs MS Word 2007 XML and Office Open XML Text both use com.sun.star.comp.Writer.WriterFilter. Native import creates DomainMapper over the destination SwXTextDocument; XML values/properties resolve separately from document model updates. Export delegates to DocxExportFilter. Existing local SwXText.appendTextPortion/finishParagraph/convertToTable and native style suppliers can be reused; do not convert DOCX through ODT or fill browser projection DTOs. New shared OOXML package code is committed and verified. Current task is not implemented/verified yet.

- Observation: Progress checkpoint: implemented actual OOXMLValue, OOXMLProperty/PropertySet/Table and consumed native receiver interfaces. 52 actual RTL/Any/OUString/resource tests pass; fresh values-owner coverage S120/B93/F42/L101 all100. Added434exact native resource constants generated by unchanged upstream resourceids.py/model.xml; two independent/fulls ubset checks pass with fresh constant-owner coverage100. Current source hashes and exact commands: evidence/resource-checkpoint.json. Typecheck, docs, scoped lint/format, provenance and dependency checks pass; exact original Library_sw sax edge was added after architecture gate identified it.
  Impact: V4DQJW remains DOING. DomainMapper model mapping, document export, selected shell filter, asynchronous behavior and file UI integration are not implemented yet; no DOCX application support or parity is claimed. The broader approved goal and remaining scope are unchanged.
  Resolution: Continue the same cohesive task with native PropertyMap ordering/cache/default behavior, then DomainMapper/OOXML context and Writer export integration. Reuse existing SwXText append/finish/convertToTable and actual style/numbering APIs. Preserve primary ODT storage and product deviations. No full suite is due until the tenth task after SWRD7X.

- Observation: Writer OOXMLStreamImpl consumes ordered XRelationshipAccess sequences and UriReferenceFactory RETAIN semantics, unlike oox::Relations. DomainMapper toggle129 consumes imported style entry/DocDefaults values rather than UNO pooled style defaults. Native defaults include 10pt in all three script families and auto-kerning disabled.
  Impact: Reusing oox relation admission/resolution or querying finished Writer styles would change DOCX targets and inherited formatting. PropertyMap overwrite/cache and style-cycle guard behavior also require source-exact preservation.
  Resolution: Port separate native Writer stream traversal and generic stoc URI owners, real typed property maps and stylesheet lookup. Preserve surprises in WRITER094-096. Focused tests cover actual Writer model properties and pinned strict/transitional DOCX package streams. Application DOCX model import/export/UI and task-wide coverage/verification remain in progress.

- Observation: Command: npm run test:coverage with seven selected writerfilter/stoc/OFOPXML test files and explicit includes for 15 checkpoint runtime modules (exact argv in evidence/mapper-stream-checkpoint.json). Result: pass. Evidence: 87 tests; S1218 B610 F135 L1153, all100. Command: npm run typecheck; npm run build; scoped ESLint and Prettier; check:docs, check:dependencies, check:source-provenance, check:file-size, check:source-tree, inventory:registry:build/check, policy routing, ap doctor, static build smoke, git diff --check. Result: pass. Scope: property/stylesheet lookup and package stream checkpoint only.
  Impact: Actual Writer UNO import API regressions also pass47 cases. Coverage includes all code in the 15 measured owners, with unchanged100 thresholds. These results do not establish full DOCX import/export or UI behavior; task-wide acceptance remains pending. Doctor retains the existing hook-readiness warning, unrelated to this task.
  Resolution: Persist source hashes, exact commands, fixture names and remaining responsibilities in a task-local checkpoint artifact, commit the cohesive implementation block, and continue the same approved Writer task into resource parsing and model import. Do not finish/verify the whole task or run the full suite at this second task after SWRD7X.

- Observation: Full pinned-source table comparison caught eight omitted META_PROP_* name bindings in the new local PropertyIds table. The original has385 enum declarations and382 UNO name bindings; prior spot checks and branch coverage did not establish completeness of static data.
  Impact: The omitted names would have produced the native empty-string fallback for represented table metadata despite valid resource identities.
  Resolution: Regenerate all382 bindings including META_PROP_* from the original source. Add live source-contract tests for all385 IDs,382 names and439 native style-name pairs. Both focused files now pass13 cases. This is a local implementation correction, not an upstream suspected issue.

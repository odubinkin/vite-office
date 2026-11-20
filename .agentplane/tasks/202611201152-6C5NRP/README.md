---
id: "202611201152-6C5NRP"
title: "Align Writer ODT merged cell grid and covered border styles"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "npm run test:writer -- src/sw/source/filter/xml src/xmloff/source/text/txtimp.test.ts --maxWorkers 2 --testTimeout 120000"
  - "npm run typecheck --workspace @vite-office/office"
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T11:52:26.774Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-20T12:21:17.048Z"
  updated_by: "CODER"
  note: "The reviewed Writer ODT table implementation passed the declared 369-test XML filter profile, the pinned vertical-border fixture, Worker decoding, office typecheck, and static validation."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-20T12:21:25.897Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review of the committed Writer ODT table integration against pinned Writer sources and passing deterministic evidence."
  evaluated_sha: "e9436f967d32e94e9aac4b69659b81b333cf02ec"
  blueprint_digest: "e49e384e30ad7ef81a525c0921564f9a68eeea23fc2fe07401e7d8ab37219a12"
  evidence_refs:
    - ".agentplane/tasks/202611201152-6C5NRP/README.md"
    - ".agentplane/tasks/202611201152-6C5NRP/quality/20261120-122125897-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611201152-6C5NRP/quality/20261120-122125897-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611201152-6C5NRP/quality/20261120-122125897-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611201152-6C5NRP/blueprint/resolved-snapshot.json"
    - "e9436f967d32: 369 Writer XML tests, 68 focused ODT and DOCX tests, shared XML table test, typecheck and scoped static checks"
    - "apps/office/src/sw/source/filter/xml/native-independent-column-odf.test.ts"
    - "docs/program/writer-upstream-suspected-issues.md"
  findings:
    - "Grid admission clips at declared columns and occupied vertical slots while the TableRowKeep cursor applies authored covered formats to the native owner."
    - "The original native testVerticallyMergedCellBorder document preserves its two border states through Worker and package export; older Worker records obtain the native false default."
    - "The declared XML filter profile is green. Supplemental RTF header failures reproduce on the prior revision with the same UNO exception."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-20T11:52:38.249Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-20T12:21:17.048Z"
    author: "CODER"
    state: "ok"
    note: "The reviewed Writer ODT table implementation passed the declared 369-test XML filter profile, the pinned vertical-border fixture, Worker decoding, office typecheck, and static validation."
doc_version: 3
doc_updated_at: "2026-11-20T12:21:17.104Z"
doc_updated_by: "CODER"
description: "Port Writer XML table span normalization, reserved-slot handling, covered-cell compatibility and native box style export through ODT and Worker boundaries."
sections:
  Summary: |-
    Align Writer ODT merged cell grid and covered border styles

    Port Writer XML table span normalization, reserved-slot handling, covered-cell compatibility and native box style export through ODT and Worker boundaries.
  Scope: "Writer XML table import/export and shared XML table contexts, represented Writer table geometry and document settings including Worker transport, targeted tests, applicable pinned Writer QA fixture and provenance, and Writer suspected-issues documentation."
  Plan: "Align the streaming table grid cursor with native span clipping, occupied slots, covered-cell marker admission and repeat finalization. Port the TableRowKeep model setting, configuration XML and backward-compatible Worker decoding. Export table and box styles with native stable names and direct covered border properties. Run the pinned vertical-border regression and independent span/repeat coverage."
  Verify Steps: |-
    1. npm run test:writer -- src/sw/source/filter/xml src/xmloff/source/text/txtimp.test.ts --maxWorkers 2 --testTimeout 120000. Cover column bounds, preceding span collisions, existing row and cell repeats, pinned vertical border on original ODT, and the Worker round trip.
    2. npm run typecheck --workspace @vite-office/office. Check all importer and settings consumers.
    3. Run scoped lint, git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-20T12:21:17.048Z — VERIFY — ok

    By: CODER

    Note: The reviewed Writer ODT table implementation passed the declared 369-test XML filter profile, the pinned vertical-border fixture, Worker decoding, office typecheck, and static validation.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T11:52:38.249Z, excerpt_hash=sha256:616836cfe280dc1fa6ff5115ed20b9ec775c215443e8dc5e41a7b6dd604cab7b

    Details:

    Command: npm run test:writer -- src/sw/source/filter/xml src/xmloff/source/text/txtimp.test.ts --maxWorkers 2 --testTimeout 120000
    Result: pass
    Evidence: 61 files and 369 tests passed on e9436f967d32; the untouched vmerge-cell-border.odt passed import, Worker transfer, output, and reopen.
    Scope: Writer ODT import/export, table placement and XML text integration.

    Command: npm run test:writer -- src/sw/source/filter/ww8/docxexport.compat.test.ts src/sw/source/filter/xml/native-independent-column-odf.test.ts src/sw/source/filter/xml/native-row-cell-export-items.test.ts src/sw/source/filter/xml/native-cell-box-roundtrip.test.ts src/sw/source/filter/xml/odt-table-roundtrip.test.ts src/sw/source/filter/xml/odt-list-continuation.test.ts --maxWorkers 2 --testTimeout 120000
    Result: pass
    Evidence: 68 tests passed, including the isolated list and DOCX export retries, and the RTF-origin nested table with TableRowKeep.
    Scope: Settings bridge, table exporter and initial expanded-run recovery.

    Command: npm run test:shared -- src/xmloff/source/table/XMLTableExport-header-count.test.ts --maxWorkers 1
    Result: pass
    Evidence: 1 test passed.
    Scope: Detached table exporter header handling.

    Command: npm run test:writer -- src/sw/source/writerfilter/rtftok/rtfdocumentimpl.document.test.ts --maxWorkers 2 --testTimeout 120000 (included in the expanded Writer run)
    Result: fail
    Evidence: 52 passed and seven RTF repeating-header cases raised UnknownPropertyException. The same seven failed in a clean isolated copy of e5ea95660a13 with the same native fixture; the failure predates this change.
    Scope: Supplementary RTF document coverage.

    Command: npm run typecheck --workspace @vite-office/office; scoped ESLint and Prettier on every changed TypeScript file; git diff HEAD^ HEAD --check; npm run check:dependencies; npm run check:source-tree; node .agentplane/policy/check-routing.mjs; ap doctor
    Result: pass
    Evidence: Typecheck and lint passed, formatting and whitespace clean, module and source paths passed, policy routing OK, doctor OK with one existing managed hook shim warning.
    Scope: office types, changed code, source layout and workflow health.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611201152-6C5NRP/blueprint/resolved-snapshot.json
    - old_digest: e49e384e30ad7ef81a525c0921564f9a68eeea23fc2fe07401e7d8ab37219a12
    - current_digest: e49e384e30ad7ef81a525c0921564f9a68eeea23fc2fe07401e7d8ab37219a12
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611201152-6C5NRP

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611201152-6C5NRP
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the Writer table-merging commit with its pinned fixture tests and issue records."
  Findings: ""
id_source: "generated"
---
## Summary

Align Writer ODT merged cell grid and covered border styles

Port Writer XML table span normalization, reserved-slot handling, covered-cell compatibility and native box style export through ODT and Worker boundaries.

## Scope

Writer XML table import/export and shared XML table contexts, represented Writer table geometry and document settings including Worker transport, targeted tests, applicable pinned Writer QA fixture and provenance, and Writer suspected-issues documentation.

## Plan

Align the streaming table grid cursor with native span clipping, occupied slots, covered-cell marker admission and repeat finalization. Port the TableRowKeep model setting, configuration XML and backward-compatible Worker decoding. Export table and box styles with native stable names and direct covered border properties. Run the pinned vertical-border regression and independent span/repeat coverage.

## Verify Steps

1. npm run test:writer -- src/sw/source/filter/xml src/xmloff/source/text/txtimp.test.ts --maxWorkers 2 --testTimeout 120000. Cover column bounds, preceding span collisions, existing row and cell repeats, pinned vertical border on original ODT, and the Worker round trip.
2. npm run typecheck --workspace @vite-office/office. Check all importer and settings consumers.
3. Run scoped lint, git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-20T12:21:17.048Z — VERIFY — ok

By: CODER

Note: The reviewed Writer ODT table implementation passed the declared 369-test XML filter profile, the pinned vertical-border fixture, Worker decoding, office typecheck, and static validation.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T11:52:38.249Z, excerpt_hash=sha256:616836cfe280dc1fa6ff5115ed20b9ec775c215443e8dc5e41a7b6dd604cab7b

Details:

Command: npm run test:writer -- src/sw/source/filter/xml src/xmloff/source/text/txtimp.test.ts --maxWorkers 2 --testTimeout 120000
Result: pass
Evidence: 61 files and 369 tests passed on e9436f967d32; the untouched vmerge-cell-border.odt passed import, Worker transfer, output, and reopen.
Scope: Writer ODT import/export, table placement and XML text integration.

Command: npm run test:writer -- src/sw/source/filter/ww8/docxexport.compat.test.ts src/sw/source/filter/xml/native-independent-column-odf.test.ts src/sw/source/filter/xml/native-row-cell-export-items.test.ts src/sw/source/filter/xml/native-cell-box-roundtrip.test.ts src/sw/source/filter/xml/odt-table-roundtrip.test.ts src/sw/source/filter/xml/odt-list-continuation.test.ts --maxWorkers 2 --testTimeout 120000
Result: pass
Evidence: 68 tests passed, including the isolated list and DOCX export retries, and the RTF-origin nested table with TableRowKeep.
Scope: Settings bridge, table exporter and initial expanded-run recovery.

Command: npm run test:shared -- src/xmloff/source/table/XMLTableExport-header-count.test.ts --maxWorkers 1
Result: pass
Evidence: 1 test passed.
Scope: Detached table exporter header handling.

Command: npm run test:writer -- src/sw/source/writerfilter/rtftok/rtfdocumentimpl.document.test.ts --maxWorkers 2 --testTimeout 120000 (included in the expanded Writer run)
Result: fail
Evidence: 52 passed and seven RTF repeating-header cases raised UnknownPropertyException. The same seven failed in a clean isolated copy of e5ea95660a13 with the same native fixture; the failure predates this change.
Scope: Supplementary RTF document coverage.

Command: npm run typecheck --workspace @vite-office/office; scoped ESLint and Prettier on every changed TypeScript file; git diff HEAD^ HEAD --check; npm run check:dependencies; npm run check:source-tree; node .agentplane/policy/check-routing.mjs; ap doctor
Result: pass
Evidence: Typecheck and lint passed, formatting and whitespace clean, module and source paths passed, policy routing OK, doctor OK with one existing managed hook shim warning.
Scope: office types, changed code, source layout and workflow health.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611201152-6C5NRP/blueprint/resolved-snapshot.json
- old_digest: e49e384e30ad7ef81a525c0921564f9a68eeea23fc2fe07401e7d8ab37219a12
- current_digest: e49e384e30ad7ef81a525c0921564f9a68eeea23fc2fe07401e7d8ab37219a12
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611201152-6C5NRP

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611201152-6C5NRP
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the Writer table-merging commit with its pinned fixture tests and issue records.

## Findings

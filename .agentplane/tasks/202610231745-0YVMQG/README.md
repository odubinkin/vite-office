---
id: "202610231745-0YVMQG"
title: "Route Writer ODT import through upstream text APIs"
result_summary: "route ODT text, styles, numbering and cell content through upstream Writer APIs; remove SwXMLParagraphTarget and verify the current core slice with 478 focused tests"
status: "DONE"
priority: "high"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-23T17:46:09.531Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-23T18:55:53.089Z"
  updated_by: "CODER"
  note: "478 distinct focused tests passed: Writer ODT 341, API/core 65, shared xmloff 19, font 4, boundary 49; final automatic-style/API rerun 29 passed. Typecheck, scoped ESLint/Prettier, dependency/JSDoc/size/source-tree/provenance and Writer/shared registry checks passed. Exact commands, argv and source hashes: .agentplane/tasks/202610231745-0YVMQG/verification-evidence.json. No full suites, DOCX, network or sibling changes."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-23T18:57:12.950Z"
  updated_by: "EVALUATOR"
  note: "Commit 2bbc8c2dab5c replaces the bespoke ODT paragraph target with shared text import and actual Writer APIs within the represented core slice; all declared targeted checks passed."
  evaluated_sha: "2bbc8c2dab5c7014f1e8e0c438ad2310cbfdf902"
  blueprint_digest: "c5ad82e66be839fa855b2bee10cd19500f8597257782bb672739e21f9fd66b91"
  evidence_refs:
    - ".agentplane/tasks/202610231745-0YVMQG/README.md"
    - ".agentplane/tasks/202610231745-0YVMQG/quality/20261023-185712950-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610231745-0YVMQG/quality/20261023-185712950-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610231745-0YVMQG/quality/20261023-185712950-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610231745-0YVMQG/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610231745-0YVMQG/verification-evidence.json"
  findings:
    - "Verified source hashes match the implementation. Native API integration checks exercise body and cell insertion, paragraph controls, typed properties, styles, numbering and bookmarks. Automatic character styles retain document-pooled handles and distinct paragraph/span ownership. Native table structure remains specialized. Literal numbering/geometry/continuation expectations remain, while obsolete opaque-name/collision/soft-break assumptions follow pinned source. Dependency guards explicitly distinguish the model API from UI and retain reverse-edge protection. Registry parity statuses are preserved."
commit:
  hash: "2bbc8c2dab5c7014f1e8e0c438ad2310cbfdf902"
  message: "🧩 0YVMQG writer: route ODT import through upstream Writer APIs"
comments:
  -
    author: "CODER"
    body: "Start: migrate ordinary ODT content and style import to pinned common Writer APIs, preserving native table responsibilities and targeted regression coverage."
  -
    author: "CODER"
    body: "Verified: ODT text, paragraph properties, styles, numbering, bookmarks and table-cell text now use shared XMLTextImportHelper and actual Writer APIs; specialized native table structure remains in SwXMLTableImport. 478 focused tests and all declared static/source/registry checks pass. Quality review passed for implementation 2bbc8c2dab5c."
events:
  -
    type: "status"
    at: "2026-10-23T17:46:15.331Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: migrate ordinary ODT content and style import to pinned common Writer APIs, preserving native table responsibilities and targeted regression coverage."
  -
    type: "verify"
    at: "2026-10-23T18:55:53.089Z"
    author: "CODER"
    state: "ok"
    note: "478 distinct focused tests passed: Writer ODT 341, API/core 65, shared xmloff 19, font 4, boundary 49; final automatic-style/API rerun 29 passed. Typecheck, scoped ESLint/Prettier, dependency/JSDoc/size/source-tree/provenance and Writer/shared registry checks passed. Exact commands, argv and source hashes: .agentplane/tasks/202610231745-0YVMQG/verification-evidence.json. No full suites, DOCX, network or sibling changes."
  -
    type: "status"
    at: "2026-10-23T18:57:51.580Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: ODT text, paragraph properties, styles, numbering, bookmarks and table-cell text now use shared XMLTextImportHelper and actual Writer APIs; specialized native table structure remains in SwXMLTableImport. 478 focused tests and all declared static/source/registry checks pass. Quality review passed for implementation 2bbc8c2dab5c."
doc_version: 3
doc_updated_at: "2026-10-23T18:57:51.581Z"
doc_updated_by: "CODER"
description: "Replace SwXMLParagraphTarget and direct ordinary ODT text/style/property mutations with pinned upstream XMLTextImportHelper and common Writer API. Preserve native specialized SwXMLTableImport/core responsibilities and all currently represented ODT features. Work only in vite-office; no DOCX or Calc implementation; targeted module tests only."
sections:
  Summary: |-
    Route Writer ODT import through upstream text APIs

    Replace SwXMLParagraphTarget and direct ordinary ODT text/style/property mutations with pinned upstream XMLTextImportHelper and common Writer API. Preserve native specialized SwXMLTableImport/core responsibilities and all currently represented ODT features. Work only in vite-office; no DOCX or Calc implementation; targeted module tests only.
  Scope: "ODT Writer text/style/list/bookmark/paragraph import, shared xmloff text contexts/helper/property application, necessary Writer API/core connections, cell cursor switching in native table import, corresponding focused tests and per-module provenance/runtime records. Preserve all current ODT model state and specialized native direct-core responsibilities. No UI, Calc, DOCX, network, unrelated tests or broad parity promotion."
  Plan: "Use pinned native XMLTextImportHelper/SwXMLImport/SwXMLTableImport as the responsibility map. Remove SwXMLParagraphTarget and its bespoke per-paragraph mutation interface. Make shared text contexts operate through XMLTextImportHelper holding live Writer API text/cursors; use native insertString/control-character/property/service/style routes for represented text, paragraphs, lists, bookmarks, soft page breaks and styles. Extend missing Writer API property/control/content contracts only as required by existing ODT slice. Retain native Writer-specific table structural operations and switch shared cursor into/out of cells. Preserve current ODT feature coverage and canonical data ownership; update exact provenance records. Verify targeted xmloff/Writer API and ODT round-trip files plus type/lint/format/dependency/source checks."
  Verify Steps: "Run ap task verify-show before checks. Run focused Vitest modules for xmloff text dispatch/paragraph/list contexts, Writer import API, ODT import/round-trip text, styles, numbering, hyperlinks/bookmarks/soft breaks, paragraphs/pages and tables touched by this migration; add integration evidence that ordinary ODT text/property calls use actual Writer APIs and no SwXMLParagraphTarget path remains. Preserve direct versus inherited attributes and table/body ordering. Run application typecheck; lint/Prettier on changed files; dependency, JSDoc, file-size, source-tree/provenance and Writer/shared registry validation. Do not run full suites. Record exact passing commands/results and residual limits; record ap verify and commit/close task."
  Verification: |-
    Command: npm run test:writer -- src/sw/source/filter/xml
    Result: pass
    Evidence: 54 files; 341 tests passed
    Scope: Affected modules only; no full suites.

    Command: npm run test:writer -- native-text-import-api.test.ts unostyle-auto.test.ts automatic-style-handles.test.ts txtedt-stylepool.test.ts native-escapement.test.ts
    Result: pass
    Evidence: 5 files; 65 tests passed
    Scope: Affected modules only; no full suites.

    Command: npm run test:writer -- unostyle-auto.test.ts native-text-import-api.test.ts
    Result: pass
    Evidence: 2 files; 29 tests passed after automatic-style getter completion
    Scope: Affected modules only; no full suites.

    Command: npm run test:shared -- text/txtimp.test.ts txtparai.test.ts XMLTextListBlockContext.test.ts style/xmlnumi.test.ts
    Result: pass
    Evidence: 4 files; 19 tests passed
    Scope: Affected modules only; no full suites.

    Command: npm run test:shared -- native-font-family.test.ts
    Result: pass
    Evidence: 1 file; 4 tests passed
    Scope: Affected modules only; no full suites.

    Command: npx vitest run scripts/check-module-boundaries.test.ts scripts/writer-model-api-boundaries.test.ts
    Result: pass
    Evidence: 2 files; 49 tests passed
    Scope: Affected modules only; no full suites.

    Command: npm run typecheck --workspace @vite-office/office
    Result: pass
    Evidence: pass
    Scope: Approved task static/source/registry checks.

    Command: npm run check:dependencies
    Result: pass
    Evidence: 1199 runtime sources; 6030 relative imports; 170 module edges passed
    Scope: Approved task static/source/registry checks.

    Command: npm run check:docs
    Result: pass
    Evidence: 2953 authored files passed
    Scope: Approved task static/source/registry checks.

    Command: npm run check:file-size
    Result: pass
    Evidence: 2957 authored files scanned; no file at or above 1000 lines
    Scope: Approved task static/source/registry checks.

    Command: npm run check:source-tree
    Result: pass
    Evidence: 115 required paths and 32 retired roots passed
    Scope: Approved task static/source/registry checks.

    Command: npm run check:source-provenance
    Result: pass
    Evidence: 1200 runtime modules; 1024 mapped; 153 browser adaptations; 23 local infrastructure passed
    Scope: Approved task static/source/registry checks.

    Command: npm run inventory:parity:writer
    Result: pass
    Evidence: pass; zero semantic violations
    Scope: Approved task static/source/registry checks.

    Command: npm run inventory:parity:shared
    Result: pass
    Evidence: pass; zero semantic violations
    Scope: Approved task static/source/registry checks.

    Command: git diff --check
    Result: pass
    Evidence: pass
    Scope: Approved task static/source/registry checks.

    Command: node_modules/.bin/eslint --max-warnings 0 and node_modules/.bin/prettier --check, with exact file argv recorded in verification-evidence.json.
    Result: pass
    Evidence: zero lint errors/warnings; all matched files formatted.
    Scope: exact task-changed source files; hashes and complete argv retained in .agentplane/tasks/202610231745-0YVMQG/verification-evidence.json.

    478 distinct focused tests passed. The additional 29-test API rerun covers the final automatic-style getter. No full suites were run, per user instruction.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-23T18:55:53.089Z — VERIFY — ok

    By: CODER

    Note: 478 distinct focused tests passed: Writer ODT 341, API/core 65, shared xmloff 19, font 4, boundary 49; final automatic-style/API rerun 29 passed. Typecheck, scoped ESLint/Prettier, dependency/JSDoc/size/source-tree/provenance and Writer/shared registry checks passed. Exact commands, argv and source hashes: .agentplane/tasks/202610231745-0YVMQG/verification-evidence.json. No full suites, DOCX, network or sibling changes.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-23T18:55:52.546Z, excerpt_hash=sha256:324f2790d7a1c6d16228beba03e789c32e928a9c26dd3cac73d5e58838b2818e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610231745-0YVMQG/blueprint/resolved-snapshot.json
    - old_digest: c5ad82e66be839fa855b2bee10cd19500f8597257782bb672739e21f9fd66b91
    - current_digest: c5ad82e66be839fa855b2bee10cd19500f8597257782bb672739e21f9fd66b91
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610231745-0YVMQG

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610231745-0YVMQG -m 🧩 0YVMQG task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task implementation commit and task-specific registry/documentation changes. Preserve the preceding common Writer API port and all unrelated tasks."
  Findings: "Pinned-source migration removes SwXMLParagraphTarget and both obsolete Writer-only property/style sinks. Ordinary text, paragraph terminators, styles, properties, list services, bookmarks and cell text now use actual Writer API owners. Native table structure and endDocAdjustNodes remain specialized core operations. Source-based regression corrections: automatic rule names are opaque; common and automatic list namespaces are separate; named rules export in styles.xml; soft-page-break XML is ignored by native XMLParaContext; list indentation is derived from native items rather than the legacy projection flag. No network, sibling-repository edits, DOCX work or full test suites. Full engine/UNO service coverage and unsupported current-core features remain outside scope. Prior registry statuses and registered I/O deviations are preserved."
extensions:
  implementation_commit:
    hash: "2bbc8c2dab5c7014f1e8e0c438ad2310cbfdf902"
    message: "🧩 0YVMQG writer: route ODT import through upstream Writer APIs"
id_source: "generated"
---
## Summary

Route Writer ODT import through upstream text APIs

Replace SwXMLParagraphTarget and direct ordinary ODT text/style/property mutations with pinned upstream XMLTextImportHelper and common Writer API. Preserve native specialized SwXMLTableImport/core responsibilities and all currently represented ODT features. Work only in vite-office; no DOCX or Calc implementation; targeted module tests only.

## Scope

ODT Writer text/style/list/bookmark/paragraph import, shared xmloff text contexts/helper/property application, necessary Writer API/core connections, cell cursor switching in native table import, corresponding focused tests and per-module provenance/runtime records. Preserve all current ODT model state and specialized native direct-core responsibilities. No UI, Calc, DOCX, network, unrelated tests or broad parity promotion.

## Plan

Use pinned native XMLTextImportHelper/SwXMLImport/SwXMLTableImport as the responsibility map. Remove SwXMLParagraphTarget and its bespoke per-paragraph mutation interface. Make shared text contexts operate through XMLTextImportHelper holding live Writer API text/cursors; use native insertString/control-character/property/service/style routes for represented text, paragraphs, lists, bookmarks, soft page breaks and styles. Extend missing Writer API property/control/content contracts only as required by existing ODT slice. Retain native Writer-specific table structural operations and switch shared cursor into/out of cells. Preserve current ODT feature coverage and canonical data ownership; update exact provenance records. Verify targeted xmloff/Writer API and ODT round-trip files plus type/lint/format/dependency/source checks.

## Verify Steps

Run ap task verify-show before checks. Run focused Vitest modules for xmloff text dispatch/paragraph/list contexts, Writer import API, ODT import/round-trip text, styles, numbering, hyperlinks/bookmarks/soft breaks, paragraphs/pages and tables touched by this migration; add integration evidence that ordinary ODT text/property calls use actual Writer APIs and no SwXMLParagraphTarget path remains. Preserve direct versus inherited attributes and table/body ordering. Run application typecheck; lint/Prettier on changed files; dependency, JSDoc, file-size, source-tree/provenance and Writer/shared registry validation. Do not run full suites. Record exact passing commands/results and residual limits; record ap verify and commit/close task.

## Verification

Command: npm run test:writer -- src/sw/source/filter/xml
Result: pass
Evidence: 54 files; 341 tests passed
Scope: Affected modules only; no full suites.

Command: npm run test:writer -- native-text-import-api.test.ts unostyle-auto.test.ts automatic-style-handles.test.ts txtedt-stylepool.test.ts native-escapement.test.ts
Result: pass
Evidence: 5 files; 65 tests passed
Scope: Affected modules only; no full suites.

Command: npm run test:writer -- unostyle-auto.test.ts native-text-import-api.test.ts
Result: pass
Evidence: 2 files; 29 tests passed after automatic-style getter completion
Scope: Affected modules only; no full suites.

Command: npm run test:shared -- text/txtimp.test.ts txtparai.test.ts XMLTextListBlockContext.test.ts style/xmlnumi.test.ts
Result: pass
Evidence: 4 files; 19 tests passed
Scope: Affected modules only; no full suites.

Command: npm run test:shared -- native-font-family.test.ts
Result: pass
Evidence: 1 file; 4 tests passed
Scope: Affected modules only; no full suites.

Command: npx vitest run scripts/check-module-boundaries.test.ts scripts/writer-model-api-boundaries.test.ts
Result: pass
Evidence: 2 files; 49 tests passed
Scope: Affected modules only; no full suites.

Command: npm run typecheck --workspace @vite-office/office
Result: pass
Evidence: pass
Scope: Approved task static/source/registry checks.

Command: npm run check:dependencies
Result: pass
Evidence: 1199 runtime sources; 6030 relative imports; 170 module edges passed
Scope: Approved task static/source/registry checks.

Command: npm run check:docs
Result: pass
Evidence: 2953 authored files passed
Scope: Approved task static/source/registry checks.

Command: npm run check:file-size
Result: pass
Evidence: 2957 authored files scanned; no file at or above 1000 lines
Scope: Approved task static/source/registry checks.

Command: npm run check:source-tree
Result: pass
Evidence: 115 required paths and 32 retired roots passed
Scope: Approved task static/source/registry checks.

Command: npm run check:source-provenance
Result: pass
Evidence: 1200 runtime modules; 1024 mapped; 153 browser adaptations; 23 local infrastructure passed
Scope: Approved task static/source/registry checks.

Command: npm run inventory:parity:writer
Result: pass
Evidence: pass; zero semantic violations
Scope: Approved task static/source/registry checks.

Command: npm run inventory:parity:shared
Result: pass
Evidence: pass; zero semantic violations
Scope: Approved task static/source/registry checks.

Command: git diff --check
Result: pass
Evidence: pass
Scope: Approved task static/source/registry checks.

Command: node_modules/.bin/eslint --max-warnings 0 and node_modules/.bin/prettier --check, with exact file argv recorded in verification-evidence.json.
Result: pass
Evidence: zero lint errors/warnings; all matched files formatted.
Scope: exact task-changed source files; hashes and complete argv retained in .agentplane/tasks/202610231745-0YVMQG/verification-evidence.json.

478 distinct focused tests passed. The additional 29-test API rerun covers the final automatic-style getter. No full suites were run, per user instruction.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-23T18:55:53.089Z — VERIFY — ok

By: CODER

Note: 478 distinct focused tests passed: Writer ODT 341, API/core 65, shared xmloff 19, font 4, boundary 49; final automatic-style/API rerun 29 passed. Typecheck, scoped ESLint/Prettier, dependency/JSDoc/size/source-tree/provenance and Writer/shared registry checks passed. Exact commands, argv and source hashes: .agentplane/tasks/202610231745-0YVMQG/verification-evidence.json. No full suites, DOCX, network or sibling changes.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-23T18:55:52.546Z, excerpt_hash=sha256:324f2790d7a1c6d16228beba03e789c32e928a9c26dd3cac73d5e58838b2818e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610231745-0YVMQG/blueprint/resolved-snapshot.json
- old_digest: c5ad82e66be839fa855b2bee10cd19500f8597257782bb672739e21f9fd66b91
- current_digest: c5ad82e66be839fa855b2bee10cd19500f8597257782bb672739e21f9fd66b91
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610231745-0YVMQG

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610231745-0YVMQG -m 🧩 0YVMQG task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task implementation commit and task-specific registry/documentation changes. Preserve the preceding common Writer API port and all unrelated tasks.

## Findings

Pinned-source migration removes SwXMLParagraphTarget and both obsolete Writer-only property/style sinks. Ordinary text, paragraph terminators, styles, properties, list services, bookmarks and cell text now use actual Writer API owners. Native table structure and endDocAdjustNodes remain specialized core operations. Source-based regression corrections: automatic rule names are opaque; common and automatic list namespaces are separate; named rules export in styles.xml; soft-page-break XML is ignored by native XMLParaContext; list indentation is derived from native items rather than the legacy projection flag. No network, sibling-repository edits, DOCX work or full test suites. Full engine/UNO service coverage and unsupported current-core features remain outside scope. Prior registry statuses and registered I/O deviations are preserved.

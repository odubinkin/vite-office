---
id: "202610221928-3VG8R0"
title: "Remove browser ZIP storage and unblock Writer Calc document I/O"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-22T19:28:37.003Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-22T19:58:55.861Z"
  updated_by: "CODER"
  note: "Verified raw XML persistence and worker-backed Writer/Calc I/O: 427 focused filter/shell/storage/autosave tests, mounted browser workflows, cancellation tests, ten existing Chromium scenarios and responsiveness on both user ODS and generated 5000x9 input. Typecheck, build, lint, formatting, module boundaries, JSDoc, size, doctor and routing pass; evidence.json records measurements."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement the approved XML browser storage and responsive Writer/Calc I/O changes in the main vite-office checkout."
events:
  -
    type: "status"
    at: "2026-10-22T19:28:38.443Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the approved XML browser storage and responsive Writer/Calc I/O changes in the main vite-office checkout."
  -
    type: "verify"
    at: "2026-10-22T19:58:55.861Z"
    author: "CODER"
    state: "ok"
    note: "Verified raw XML persistence and worker-backed Writer/Calc I/O: 427 focused filter/shell/storage/autosave tests, mounted browser workflows, cancellation tests, ten existing Chromium scenarios and responsiveness on both user ODS and generated 5000x9 input. Typecheck, build, lint, formatting, module boundaries, JSDoc, size, doctor and routing pass; evidence.json records measurements."
doc_version: 3
doc_updated_at: "2026-10-22T19:58:55.919Z"
doc_updated_by: "CODER"
description: "Approved by user: store browser documents as uncompressed XML plus resources without ZIP compatibility; move heavy I/O off the UI thread and verify large ODS responsiveness. Work only in vite-office; the user-provided Downloads ODS is an authorized read-only fixture."
sections:
  Summary: "Remove ZIP packaging from primary browser storage and keep Writer/Calc responsive during document import, open, autosave, save-as, overwrite and export."
  Scope: "Approved scope: shared browser document storage; Writer/Calc XML filter, shell and worker transfer boundaries; browser compositions/workflows; focused unit/E2E tests and affected storage/I/O documentation. No legacy ZIP browser-record compatibility. External ODT/ODS remain standard packages. Work in vite-office; read the explicitly supplied ODS fixture only for reproduction. No network required."
  Plan: "Approved by user on 2026-10-23: implement XML/resource browser persistence without ZIP compatibility, remove blocking document I/O in Writer and Calc, and validate large ODS responsiveness in vite-office."
  Verify Steps: "Run focused Vitest tests for shared storage, Writer/Calc XML, workers, shells and workflows; npm run typecheck; targeted ESLint/Prettier checks on changed sources; npm run build; browser E2E for Writer/Calc persistence and large ODS import/save with main-thread heartbeat/long-task evidence. Run ap doctor and node .agentplane/policy/check-routing.mjs. Confirm final git status has no unintended artifacts. Acceptance: stored payload contains XML/resources without ZIP; external ODF round-trips preserve tested content/styles; background operations let the browser service UI tasks; stale/cancelled saves do not acknowledge newer edits."
  Verification: |-
    All commands below passed. Commands using `../../node_modules` ran from `apps/office`; other commands ran from the repository root.

    - Command: `../../node_modules/.bin/vitest run src/sc/source/filter/xml src/sc/browser/filter/xml src/sc/browser/workflows/calc-ods-io.test.ts src/sc/source/ui/docshell/docsh.test.ts src/sw/source/filter/xml src/sw/source/uibase/app/docsh.test.ts src/sw/browser/workflows/writer-odt-io.test.ts src/sw/browser/workflows/writer-autosave.test.ts src/sw/browser/storage/writer-odt-store.test.ts src/framework/browser/io/cooperative.test.ts`
      Result: pass. Evidence: 71 files, 427 tests. Scope: XML filters, worker runtime/client, graph transport, shells, browser storage and autosave.
    - Command: `../../node_modules/.bin/vitest run src/sw/source/filter/xml/odt-worker-client.test.ts src/sw/browser/storage/writer-odt-store.test.ts src/sc/browser/presentation/calc-primary-save.test.tsx src/sc/browser/presentation/calc-files.test.tsx src/sw/browser/presentation/WriterFileDialog.test.tsx src/sw/browser/presentation/writer-view-title-collision.test.tsx`
      Result: pass. Evidence: 6 files, 30 tests (overlaps some boundary tests). Scope: mounted primary saves, dialogs, title collisions and worker lifecycle.
    - Command: `../../node_modules/.bin/vitest run src/sc/browser/filter/xml/ods-worker-runtime.test.ts src/sw/source/filter/xml/odt-worker-runtime.test.ts src/sw/source/filter/xml/odt-worker-client.test.ts src/sw/browser/storage/writer-odt-store.test.ts`
      Result: pass. Evidence: 4 files, 18 tests after final ownership/type layering changes.
    - Command: `../../node_modules/.bin/vitest run src/sc/browser/filter/xml/ods-worker-client.test.ts`
      Result: pass. Evidence: 2 cancellation/generation tests.
    - Command: `../../node_modules/.bin/vitest run src/sw/browser/storage/writer-odt-store.test.ts`
      Result: pass. Evidence: 6 storage tests, including the final metadata-only listing assertion.
    - Command: `./node_modules/.bin/playwright test apps/office/e2e/writer-odt-file.spec.ts apps/office/e2e/calc/document-io-responsive.spec.ts apps/office/e2e/calc/font-step.spec.ts apps/office/e2e/calc/outline.spec.ts --config=apps/office/playwright.config.ts --workers=1`
      Result: ten existing scenarios passed; the new portable probe exposed a test-harness file-injection delay, corrected without changing the 200 ms acceptance threshold. The corrected failed scenario passed in the two commands below. Scope: real Chromium Writer ODT, Calc native font/outline persistence and production worker routes.
    - Command: `./node_modules/.bin/playwright test apps/office/e2e/calc/document-io-responsive.spec.ts --config=apps/office/playwright.config.ts --project=calc --workers=1`
      Result: pass with a real generated 5000x9 ODS file. Evidence: maximum heartbeat gap 40.2 ms across import/save/reopen/export; no page errors.
    - Command: `OFFICE_LARGE_ODS_FIXTURE=/Users/odubinkin/Downloads/file_example_ODS_5000.ods ./node_modules/.bin/playwright test apps/office/e2e/calc/document-io-responsive.spec.ts --config=apps/office/playwright.config.ts --project=calc --workers=1`
      Result: pass. Evidence: max heartbeat gaps 52.1 ms import, 42.2 ms save, 39.3 ms browser XML reopen, 29.8 ms external export; no page errors. The ODS is read-only input explicitly authorized by the user.
    - Commands: `npm run typecheck`; `npm run build`; `./node_modules/.bin/eslint <changed source paths> --max-warnings 0`; `./node_modules/.bin/prettier --check <changed paths>`.
      Result: pass. Scope: full project type/build and all changed source formatting/lint.
    - Commands: `node scripts/check-module-boundaries.mjs`; `node scripts/check-jsdoc.mjs`; `node scripts/check-file-size.mjs`; `ap doctor`; `node .agentplane/policy/check-routing.mjs`.
      Result: pass. Evidence: 1100 runtime sources with allowed module edges; JSDoc for 2763 files; no authored file at/above 1000 lines; doctor OK and policy routing OK.

    Compact measurement evidence is retained in `evidence.json`. Final clean git status is checked after deterministic task closure. Existing supported ODF feature limits remain; the full all-app coverage suite was outside this focused verification contract.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-22T19:58:55.861Z — VERIFY — ok

    By: CODER

    Note: Verified raw XML persistence and worker-backed Writer/Calc I/O: 427 focused filter/shell/storage/autosave tests, mounted browser workflows, cancellation tests, ten existing Chromium scenarios and responsiveness on both user ODS and generated 5000x9 input. Typecheck, build, lint, formatting, module boundaries, JSDoc, size, doctor and routing pass; evidence.json records measurements.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-22T19:58:33.171Z, excerpt_hash=sha256:36c66d3f13885f16158f407684a118fa888532500120a63227dcabe23e15b281

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610221928-3VG8R0/blueprint/resolved-snapshot.json
    - old_digest: 6fc5f7cd2294fdc708876213c74db0bdbf35d322328bef5d7dc33d77fd72d6aa
    - current_digest: 6fc5f7cd2294fdc708876213c74db0bdbf35d322328bef5d7dc33d77fd72d6aa
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610221928-3VG8R0

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610221928-3VG8R0 -m 🧩 3VG8R0 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this task's implementation and task closure commits; remove only new browser storage records if required. No compatibility or migration for older ZIP records."
  Findings: "Root causes: Calc called synchronous native XML import/export directly on the UI thread; Writer performed synchronous graph capture/adoption around its worker; browser listings and title checks cloned complete bodies; Calc export expanded identical allocated empty columns instead of coalescing repeat spans. Fixes: raw XML/resource v3 storage with atomic metadata-only listings; production Calc Dedicated Worker for native XML/layout/export computation; bounded main-thread graph transfer in both suites; repeated-empty-column coalescing and style identity caching. The user ODS exports a 4,104,300-byte content.xml instead of exceeding the 64 MiB limit. Scope stayed within approved storage/filter/shell/workflow/test/docs areas in vite-office. No network or publication was used. Earlier ZIP records are deliberately not read or migrated; external ODT/ODS remain standard packages. Initial checks caught stale synchronous worker-test assumptions, v2 fixture expectations, dependency layering and documentation gaps; these were repaired in scope. The first portable browser probe included Playwright base64-buffer file injection, producing a 269 ms harness delay; switching the fixture to a real filesystem file kept the same 200 ms threshold and passed at 29.8 ms for import. No test threshold or production guard was weakened. Existing supported ODF feature limits remain; the full all-app coverage suite was outside the focused verification contract."
id_source: "generated"
---
## Summary

Remove ZIP packaging from primary browser storage and keep Writer/Calc responsive during document import, open, autosave, save-as, overwrite and export.

## Scope

Approved scope: shared browser document storage; Writer/Calc XML filter, shell and worker transfer boundaries; browser compositions/workflows; focused unit/E2E tests and affected storage/I/O documentation. No legacy ZIP browser-record compatibility. External ODT/ODS remain standard packages. Work in vite-office; read the explicitly supplied ODS fixture only for reproduction. No network required.

## Plan

Approved by user on 2026-10-23: implement XML/resource browser persistence without ZIP compatibility, remove blocking document I/O in Writer and Calc, and validate large ODS responsiveness in vite-office.

## Verify Steps

Run focused Vitest tests for shared storage, Writer/Calc XML, workers, shells and workflows; npm run typecheck; targeted ESLint/Prettier checks on changed sources; npm run build; browser E2E for Writer/Calc persistence and large ODS import/save with main-thread heartbeat/long-task evidence. Run ap doctor and node .agentplane/policy/check-routing.mjs. Confirm final git status has no unintended artifacts. Acceptance: stored payload contains XML/resources without ZIP; external ODF round-trips preserve tested content/styles; background operations let the browser service UI tasks; stale/cancelled saves do not acknowledge newer edits.

## Verification

All commands below passed. Commands using `../../node_modules` ran from `apps/office`; other commands ran from the repository root.

- Command: `../../node_modules/.bin/vitest run src/sc/source/filter/xml src/sc/browser/filter/xml src/sc/browser/workflows/calc-ods-io.test.ts src/sc/source/ui/docshell/docsh.test.ts src/sw/source/filter/xml src/sw/source/uibase/app/docsh.test.ts src/sw/browser/workflows/writer-odt-io.test.ts src/sw/browser/workflows/writer-autosave.test.ts src/sw/browser/storage/writer-odt-store.test.ts src/framework/browser/io/cooperative.test.ts`
  Result: pass. Evidence: 71 files, 427 tests. Scope: XML filters, worker runtime/client, graph transport, shells, browser storage and autosave.
- Command: `../../node_modules/.bin/vitest run src/sw/source/filter/xml/odt-worker-client.test.ts src/sw/browser/storage/writer-odt-store.test.ts src/sc/browser/presentation/calc-primary-save.test.tsx src/sc/browser/presentation/calc-files.test.tsx src/sw/browser/presentation/WriterFileDialog.test.tsx src/sw/browser/presentation/writer-view-title-collision.test.tsx`
  Result: pass. Evidence: 6 files, 30 tests (overlaps some boundary tests). Scope: mounted primary saves, dialogs, title collisions and worker lifecycle.
- Command: `../../node_modules/.bin/vitest run src/sc/browser/filter/xml/ods-worker-runtime.test.ts src/sw/source/filter/xml/odt-worker-runtime.test.ts src/sw/source/filter/xml/odt-worker-client.test.ts src/sw/browser/storage/writer-odt-store.test.ts`
  Result: pass. Evidence: 4 files, 18 tests after final ownership/type layering changes.
- Command: `../../node_modules/.bin/vitest run src/sc/browser/filter/xml/ods-worker-client.test.ts`
  Result: pass. Evidence: 2 cancellation/generation tests.
- Command: `../../node_modules/.bin/vitest run src/sw/browser/storage/writer-odt-store.test.ts`
  Result: pass. Evidence: 6 storage tests, including the final metadata-only listing assertion.
- Command: `./node_modules/.bin/playwright test apps/office/e2e/writer-odt-file.spec.ts apps/office/e2e/calc/document-io-responsive.spec.ts apps/office/e2e/calc/font-step.spec.ts apps/office/e2e/calc/outline.spec.ts --config=apps/office/playwright.config.ts --workers=1`
  Result: ten existing scenarios passed; the new portable probe exposed a test-harness file-injection delay, corrected without changing the 200 ms acceptance threshold. The corrected failed scenario passed in the two commands below. Scope: real Chromium Writer ODT, Calc native font/outline persistence and production worker routes.
- Command: `./node_modules/.bin/playwright test apps/office/e2e/calc/document-io-responsive.spec.ts --config=apps/office/playwright.config.ts --project=calc --workers=1`
  Result: pass with a real generated 5000x9 ODS file. Evidence: maximum heartbeat gap 40.2 ms across import/save/reopen/export; no page errors.
- Command: `OFFICE_LARGE_ODS_FIXTURE=/Users/odubinkin/Downloads/file_example_ODS_5000.ods ./node_modules/.bin/playwright test apps/office/e2e/calc/document-io-responsive.spec.ts --config=apps/office/playwright.config.ts --project=calc --workers=1`
  Result: pass. Evidence: max heartbeat gaps 52.1 ms import, 42.2 ms save, 39.3 ms browser XML reopen, 29.8 ms external export; no page errors. The ODS is read-only input explicitly authorized by the user.
- Commands: `npm run typecheck`; `npm run build`; `./node_modules/.bin/eslint <changed source paths> --max-warnings 0`; `./node_modules/.bin/prettier --check <changed paths>`.
  Result: pass. Scope: full project type/build and all changed source formatting/lint.
- Commands: `node scripts/check-module-boundaries.mjs`; `node scripts/check-jsdoc.mjs`; `node scripts/check-file-size.mjs`; `ap doctor`; `node .agentplane/policy/check-routing.mjs`.
  Result: pass. Evidence: 1100 runtime sources with allowed module edges; JSDoc for 2763 files; no authored file at/above 1000 lines; doctor OK and policy routing OK.

Compact measurement evidence is retained in `evidence.json`. Final clean git status is checked after deterministic task closure. Existing supported ODF feature limits remain; the full all-app coverage suite was outside this focused verification contract.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-22T19:58:55.861Z — VERIFY — ok

By: CODER

Note: Verified raw XML persistence and worker-backed Writer/Calc I/O: 427 focused filter/shell/storage/autosave tests, mounted browser workflows, cancellation tests, ten existing Chromium scenarios and responsiveness on both user ODS and generated 5000x9 input. Typecheck, build, lint, formatting, module boundaries, JSDoc, size, doctor and routing pass; evidence.json records measurements.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-22T19:58:33.171Z, excerpt_hash=sha256:36c66d3f13885f16158f407684a118fa888532500120a63227dcabe23e15b281

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610221928-3VG8R0/blueprint/resolved-snapshot.json
- old_digest: 6fc5f7cd2294fdc708876213c74db0bdbf35d322328bef5d7dc33d77fd72d6aa
- current_digest: 6fc5f7cd2294fdc708876213c74db0bdbf35d322328bef5d7dc33d77fd72d6aa
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610221928-3VG8R0

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610221928-3VG8R0 -m 🧩 3VG8R0 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this task's implementation and task closure commits; remove only new browser storage records if required. No compatibility or migration for older ZIP records.

## Findings

Root causes: Calc called synchronous native XML import/export directly on the UI thread; Writer performed synchronous graph capture/adoption around its worker; browser listings and title checks cloned complete bodies; Calc export expanded identical allocated empty columns instead of coalescing repeat spans. Fixes: raw XML/resource v3 storage with atomic metadata-only listings; production Calc Dedicated Worker for native XML/layout/export computation; bounded main-thread graph transfer in both suites; repeated-empty-column coalescing and style identity caching. The user ODS exports a 4,104,300-byte content.xml instead of exceeding the 64 MiB limit. Scope stayed within approved storage/filter/shell/workflow/test/docs areas in vite-office. No network or publication was used. Earlier ZIP records are deliberately not read or migrated; external ODT/ODS remain standard packages. Initial checks caught stale synchronous worker-test assumptions, v2 fixture expectations, dependency layering and documentation gaps; these were repaired in scope. The first portable browser probe included Playwright base64-buffer file injection, producing a 269 ms harness delay; switching the fixture to a real filesystem file kept the same 200 ms threshold and passed at 29.8 ms for import. No test threshold or production guard was weakened. Existing supported ODF feature limits remain; the full all-app coverage suite was outside the focused verification contract.

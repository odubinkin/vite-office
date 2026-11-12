---
id: "202611121427-8RHTFM"
title: "Replace custom ZIP implementation with zip.js"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-12T14:27:45.350Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-12T14:47:46.264Z"
  updated_by: "CODER"
  note: "verified-202611121427-8RHTFM"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-12T14:47:39.298Z"
  updated_by: "EVALUATOR"
  note: "ZIP transport fully delegated to zip.js; retired codec and tests removed; scoped verification passes with independently reproduced unrelated baseline failures documented."
  evaluated_sha: "9174de55bf09259dbd0958b34e833294b6118c4b"
  blueprint_digest: "aa8b72c5c0e288639b1b4d0158bc178043c2cad1a8a558be7571dcc86af69d6f"
  evidence_refs:
    - ".agentplane/tasks/202611121427-8RHTFM/README.md"
    - ".agentplane/tasks/202611121427-8RHTFM/quality/20261112-144739298-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611121427-8RHTFM/quality/20261112-144739298-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611121427-8RHTFM/quality/20261112-144739298-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611121427-8RHTFM/blueprint/resolved-snapshot.json"
    - ".agentplane/tmp/zip-migration/e2e.log"
    - ".agentplane/tmp/zip-migration/typecheck-final.log"
  findings:
    - "One existing desktop menu test fails identically on unmodified HEAD; global JSDoc gate reports only unchanged css-style-matchers.ts. Neither is a ZIP migration regression."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-12T14:27:51.566Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-12T14:46:28.339Z"
    author: "CODER"
    state: "ok"
    note: "Task-scope ZIP migration checks pass: types/build/static, affected acceptance tests plus corrected failed-only rerun, 17 ODT inventory tests and 5 production browser cases. One desktop Quotations test is independently reproduced on unmodified HEAD; additional global JSDoc errors are in unchanged css-style-matchers.ts. Full evidence and residuals recorded in README."
  -
    type: "verify"
    at: "2026-11-12T14:47:46.264Z"
    author: "CODER"
    state: "ok"
    note: "verified-202611121427-8RHTFM"
doc_version: 3
doc_updated_at: "2026-11-12T14:47:46.315Z"
doc_updated_by: "CODER"
description: "Use @zip.js/zip.js for all document archive reads and writes, migrate asynchronous callers, remove custom ZIP implementation and implementation-specific tests, and retain document integration coverage. User approved plan and network access."
sections:
  Summary: "Replace the custom archive codec with @zip.js/zip.js across ODF and OOXML."
  Scope: "Office dependency and lock file; ZIP transport and orphaned byte helpers; all archive consumers and asynchronous document export callers; implementation-specific ZIP tests; affected integration tests and source/provenance registry references. Network installation and official API documentation access approved by the user. No external publication."
  Plan: "Install zip.js; replace custom ZIP codec with library-backed document archive adapter; migrate asynchronous consumers and export chains; remove codec-only tests and orphaned helpers; update source metadata; verify build, types and affected integration scenarios."
  Verify Steps: |-
    - npm run typecheck
    - npm run build
    - Run affected package, ODF/OOXML filter and browser workflow integration suites with Vitest.
    - Run inventory ODT diagnostics tests.
    - Run ESLint and Prettier on changed code; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:registry:check.
    - Confirm no runtime import of the retired ZIP codec remains; inspect git diff and git status --short --untracked-files=all.
  Verification: |-
    - Command: npm run typecheck
      Result: pass.
      Evidence: tooling and office TypeScript checks both completed without diagnostics.
      Scope: all runtime, unit tests, tools and browser test callers.
    - Command: npm run build; npm run test:static
      Result: pass.
      Evidence: production build and relative-asset/static endpoint smoke passed.
      Scope: main browser bundle and Writer/Calc worker bundles.
    - Command: affected Vitest run (165 files listed in .agentplane/tmp/zip-migration/test-files.json)
      Result: task-scope pass; one independently reproduced baseline UI failure.
      Evidence: initial run 1348 passed / 2 failed. The font-manifest rejection expectation was corrected and passed a failed-only rerun (1 pass / 9 deliberately unselected). Final ODT/ODS acceptance rerun: 31 passed. The other failure is the existing desktop menu item Quotations, reproduced on an unmodified HEAD archive.
      Scope: package transport, ODT/ODS, DOCX/XLSX stream integration, filter services, workers and affected browser workflows.
    - Command: inventory ODT diagnostics and upstream-fixture Vitest suites
      Result: pass.
      Evidence: 17 tests passed in 2 files.
      Scope: pinned LibreOffice ODT imports, exports and diagnostic privacy.
    - Command: PLAYWRIGHT_BROWSERS_PATH=/Users/odubinkin/Projects/vite-office/.agentplane/tmp/zip-migration/browsers npm exec -- playwright test --config=apps/office/playwright.config.ts --project=writer --project=calc writer-odt-file.spec.ts calc/ods.spec.ts calc/document-io-responsive.spec.ts
      Result: pass.
      Evidence: 5 passed, including 5000x9 ODS import/save/reopen/export; no browser errors.
      Scope: production Worker and external file workflows in Chromium.
    - Command: ESLint and Prettier on changed files; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:registry:check; npm run check:file-size; ap doctor; node .agentplane/policy/check-routing.mjs
      Result: pass.
      Evidence: changed-file lint/format, ownership/provenance registry, size and AgentPlane checks passed.
      Scope: intentional changes, removed-module references and repository governance.
    - Command: npm run check:docs (additional check)
      Result: baseline fail outside task scope.
      Evidence: unchanged apps/office/src/test/css-style-matchers.ts lines 17 and 76 have existing missing/incomplete JSDoc.
      Scope: repository-wide documentation check; no new JSDoc errors in changed files.
    - Command: git diff --check; git status --short --untracked-files=all
      Result: pass before commit.
      Evidence: no whitespace errors and only reviewed task changes/untracked additions. Final clean state is checked after finish.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-12T14:46:28.339Z — VERIFY — ok

    By: CODER

    Note: Task-scope ZIP migration checks pass: types/build/static, affected acceptance tests plus corrected failed-only rerun, 17 ODT inventory tests and 5 production browser cases. One desktop Quotations test is independently reproduced on unmodified HEAD; additional global JSDoc errors are in unchanged css-style-matchers.ts. Full evidence and residuals recorded in README.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-12T14:46:27.779Z, excerpt_hash=sha256:0fe09bcaaabf322cfa94a37ca4481b062793d30f3b110eea91b7e774b5a74cb9

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611121427-8RHTFM/blueprint/resolved-snapshot.json
    - old_digest: aa8b72c5c0e288639b1b4d0158bc178043c2cad1a8a558be7571dcc86af69d6f
    - current_digest: aa8b72c5c0e288639b1b4d0158bc178043c2cad1a8a558be7571dcc86af69d6f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611121427-8RHTFM

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611121427-8RHTFM
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-11-12T14:47:46.264Z — VERIFY — ok

    By: CODER

    Note: verified-202611121427-8RHTFM
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-12T14:46:28.390Z, excerpt_hash=sha256:0fe09bcaaabf322cfa94a37ca4481b062793d30f3b110eea91b7e774b5a74cb9

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611121427-8RHTFM/blueprint/resolved-snapshot.json
    - old_digest: aa8b72c5c0e288639b1b4d0158bc178043c2cad1a8a558be7571dcc86af69d6f
    - current_digest: aa8b72c5c0e288639b1b4d0158bc178043c2cad1a8a558be7571dcc86af69d6f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611121427-8RHTFM

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202611121427-8RHTFM --result verified-202611121427-8RHTFM --commit 9174de55bf09259dbd0958b34e833294b6118c4b
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task's implementation and dependency changes together."
  Findings: |-
    - User approved the implementation plan and network access before task creation. Direct workflow on main; no publication.
    - Added exact dependency @zip.js/zip.js 2.24.0. All ZIP parsing, records, extraction and CRC are delegated to the library. The adapter retains existing resource ceilings, filename safety and format-specific ASCII case policy; ODF output preserves first stored mimetype.
    - Removed custom ZipFile/ZipOutputStream/CRC32, byte helpers/ZipEntry, their dedicated unit/QA tests, and unused ZIP-only binary fixtures. Document tests now use asynchronous operations and zip.js-generated invalid-ODF fixtures instead of patching raw ZIP headers.
    - Retired provenance/runtime records for removed mechanisms, removed stale evidence, and reopened historical ZIP parity claims rather than claiming native mechanism equivalence for a third-party implementation.
    - Initial migration checks caught missing await/async propagation and synchronous rejection matchers; these were corrected and rerun. The embedded-font test now checks the earlier package-manifest consistency rejection.
    - The 165-file run's only remaining failure is desktop.test.tsx: selects local-compatible fonts and sizes and exposes source-backed paragraph styles (missing Quotations menuitemradio). A source archive of unmodified HEAD in .agentplane/tmp/zip-migration/baseline reproduces the same test failure. No ZIP operation occurs in that test; it is outside this change.
    - Additional global JSDoc check reports only two errors in unchanged test/css-style-matchers.ts. No unrelated fixes were made.
    - Initial Chromium was absent; installed a task-local browser and completed all 5 production e2e cases. Initial ad-hoc migration tooling exceeded Node's default 4GB heap; reran with a larger heap, with no production runtime changes for this tooling issue.
    - Exact local check logs are retained under .agentplane/tmp/zip-migration (ignored tooling artifacts). No required acceptance check was skipped; no scope drift or external publication.
id_source: "generated"
---
## Summary

Replace the custom archive codec with @zip.js/zip.js across ODF and OOXML.

## Scope

Office dependency and lock file; ZIP transport and orphaned byte helpers; all archive consumers and asynchronous document export callers; implementation-specific ZIP tests; affected integration tests and source/provenance registry references. Network installation and official API documentation access approved by the user. No external publication.

## Plan

Install zip.js; replace custom ZIP codec with library-backed document archive adapter; migrate asynchronous consumers and export chains; remove codec-only tests and orphaned helpers; update source metadata; verify build, types and affected integration scenarios.

## Verify Steps

- npm run typecheck
- npm run build
- Run affected package, ODF/OOXML filter and browser workflow integration suites with Vitest.
- Run inventory ODT diagnostics tests.
- Run ESLint and Prettier on changed code; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:registry:check.
- Confirm no runtime import of the retired ZIP codec remains; inspect git diff and git status --short --untracked-files=all.

## Verification

- Command: npm run typecheck
  Result: pass.
  Evidence: tooling and office TypeScript checks both completed without diagnostics.
  Scope: all runtime, unit tests, tools and browser test callers.
- Command: npm run build; npm run test:static
  Result: pass.
  Evidence: production build and relative-asset/static endpoint smoke passed.
  Scope: main browser bundle and Writer/Calc worker bundles.
- Command: affected Vitest run (165 files listed in .agentplane/tmp/zip-migration/test-files.json)
  Result: task-scope pass; one independently reproduced baseline UI failure.
  Evidence: initial run 1348 passed / 2 failed. The font-manifest rejection expectation was corrected and passed a failed-only rerun (1 pass / 9 deliberately unselected). Final ODT/ODS acceptance rerun: 31 passed. The other failure is the existing desktop menu item Quotations, reproduced on an unmodified HEAD archive.
  Scope: package transport, ODT/ODS, DOCX/XLSX stream integration, filter services, workers and affected browser workflows.
- Command: inventory ODT diagnostics and upstream-fixture Vitest suites
  Result: pass.
  Evidence: 17 tests passed in 2 files.
  Scope: pinned LibreOffice ODT imports, exports and diagnostic privacy.
- Command: PLAYWRIGHT_BROWSERS_PATH=/Users/odubinkin/Projects/vite-office/.agentplane/tmp/zip-migration/browsers npm exec -- playwright test --config=apps/office/playwright.config.ts --project=writer --project=calc writer-odt-file.spec.ts calc/ods.spec.ts calc/document-io-responsive.spec.ts
  Result: pass.
  Evidence: 5 passed, including 5000x9 ODS import/save/reopen/export; no browser errors.
  Scope: production Worker and external file workflows in Chromium.
- Command: ESLint and Prettier on changed files; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:registry:check; npm run check:file-size; ap doctor; node .agentplane/policy/check-routing.mjs
  Result: pass.
  Evidence: changed-file lint/format, ownership/provenance registry, size and AgentPlane checks passed.
  Scope: intentional changes, removed-module references and repository governance.
- Command: npm run check:docs (additional check)
  Result: baseline fail outside task scope.
  Evidence: unchanged apps/office/src/test/css-style-matchers.ts lines 17 and 76 have existing missing/incomplete JSDoc.
  Scope: repository-wide documentation check; no new JSDoc errors in changed files.
- Command: git diff --check; git status --short --untracked-files=all
  Result: pass before commit.
  Evidence: no whitespace errors and only reviewed task changes/untracked additions. Final clean state is checked after finish.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-12T14:46:28.339Z — VERIFY — ok

By: CODER

Note: Task-scope ZIP migration checks pass: types/build/static, affected acceptance tests plus corrected failed-only rerun, 17 ODT inventory tests and 5 production browser cases. One desktop Quotations test is independently reproduced on unmodified HEAD; additional global JSDoc errors are in unchanged css-style-matchers.ts. Full evidence and residuals recorded in README.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-12T14:46:27.779Z, excerpt_hash=sha256:0fe09bcaaabf322cfa94a37ca4481b062793d30f3b110eea91b7e774b5a74cb9

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611121427-8RHTFM/blueprint/resolved-snapshot.json
- old_digest: aa8b72c5c0e288639b1b4d0158bc178043c2cad1a8a558be7571dcc86af69d6f
- current_digest: aa8b72c5c0e288639b1b4d0158bc178043c2cad1a8a558be7571dcc86af69d6f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611121427-8RHTFM

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611121427-8RHTFM
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-11-12T14:47:46.264Z — VERIFY — ok

By: CODER

Note: verified-202611121427-8RHTFM
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-12T14:46:28.390Z, excerpt_hash=sha256:0fe09bcaaabf322cfa94a37ca4481b062793d30f3b110eea91b7e774b5a74cb9

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611121427-8RHTFM/blueprint/resolved-snapshot.json
- old_digest: aa8b72c5c0e288639b1b4d0158bc178043c2cad1a8a558be7571dcc86af69d6f
- current_digest: aa8b72c5c0e288639b1b4d0158bc178043c2cad1a8a558be7571dcc86af69d6f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611121427-8RHTFM

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202611121427-8RHTFM --result verified-202611121427-8RHTFM --commit 9174de55bf09259dbd0958b34e833294b6118c4b
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task's implementation and dependency changes together.

## Findings

- User approved the implementation plan and network access before task creation. Direct workflow on main; no publication.
- Added exact dependency @zip.js/zip.js 2.24.0. All ZIP parsing, records, extraction and CRC are delegated to the library. The adapter retains existing resource ceilings, filename safety and format-specific ASCII case policy; ODF output preserves first stored mimetype.
- Removed custom ZipFile/ZipOutputStream/CRC32, byte helpers/ZipEntry, their dedicated unit/QA tests, and unused ZIP-only binary fixtures. Document tests now use asynchronous operations and zip.js-generated invalid-ODF fixtures instead of patching raw ZIP headers.
- Retired provenance/runtime records for removed mechanisms, removed stale evidence, and reopened historical ZIP parity claims rather than claiming native mechanism equivalence for a third-party implementation.
- Initial migration checks caught missing await/async propagation and synchronous rejection matchers; these were corrected and rerun. The embedded-font test now checks the earlier package-manifest consistency rejection.
- The 165-file run's only remaining failure is desktop.test.tsx: selects local-compatible fonts and sizes and exposes source-backed paragraph styles (missing Quotations menuitemradio). A source archive of unmodified HEAD in .agentplane/tmp/zip-migration/baseline reproduces the same test failure. No ZIP operation occurs in that test; it is outside this change.
- Additional global JSDoc check reports only two errors in unchanged test/css-style-matchers.ts. No unrelated fixes were made.
- Initial Chromium was absent; installed a task-local browser and completed all 5 production e2e cases. Initial ad-hoc migration tooling exceeded Node's default 4GB heap; reran with a larger heap, with no production runtime changes for this tooling issue.
- Exact local check logs are retained under .agentplane/tmp/zip-migration (ignored tooling artifacts). No required acceptance check was skipped; no scope drift or external publication.

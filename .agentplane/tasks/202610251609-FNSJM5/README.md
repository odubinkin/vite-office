---
id: "202610251609-FNSJM5"
title: "Connect native Writer TXT export and filter shell path"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-25T16:09:50.004Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-25T16:13:53.631Z"
  updated_by: "CODER"
  note: "Native TXT filter and UI route pass 43 focused tests, Office typecheck, targeted formatting/lint, Writer registry check and diff validation."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement the approved Writer TXT native filter export and UI route in the current checkout."
events:
  -
    type: "status"
    at: "2026-10-25T16:09:53.382Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved Writer TXT native filter export and UI route in the current checkout."
  -
    type: "verify"
    at: "2026-10-25T16:13:53.631Z"
    author: "CODER"
    state: "ok"
    note: "Native TXT filter and UI route pass 43 focused tests, Office typecheck, targeted formatting/lint, Writer registry check and diff validation."
doc_version: 3
doc_updated_at: "2026-10-25T16:13:53.706Z"
doc_updated_by: "CODER"
description: "Route Writer TXT download through native ASCII writer and document shell, preserving upstream filter boundaries and browser medium semantics; verify related core and UI behavior."
sections:
  Summary: |-
    Connect native Writer TXT export and filter shell path

    Route Writer TXT download through native ASCII writer and document shell, preserving upstream filter boundaries and browser medium semantics; verify related core and UI behavior.
  Scope: "In scope: Writer ASCII filter full-document range, SwDocShell TXT serialization, browser download adapter, related ASCII/core/UI tests and provenance. Out of scope: unrelated storage and autosave behavior."
  Plan: "Trace upstream ASCII writer defaults and full-document selection. Add a shell-owned TXT serialization path using SwASCWriter over native nodes. Route the browser TXT download through that path and preserve the export medium contract. Add focused core and UI tests, run declared checks, document findings and finish the task."
  Verify Steps: |-
    1. Run npx vitest run apps/office/src/sw/source/filter/ascii/native-ascii-range.test.ts apps/office/src/sw/browser/presentation/WriterFileDialog.test.tsx. Expect native range and TXT UI checks pass.
    2. Run npm run typecheck --workspace @vite-office/office. Expect no type errors.
    3. Run npx prettier --check on changed source and test files, and npx eslint on changed source and test files. Expect no diagnostics.
    4. Inspect TXT export through SwDocShell and SwASCWriter, including list labels, paragraph terminators and export medium status; record evidence and final git status.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-25T16:13:53.631Z — VERIFY — ok

    By: CODER

    Note: Native TXT filter and UI route pass 43 focused tests, Office typecheck, targeted formatting/lint, Writer registry check and diff validation.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-25T16:13:52.983Z, excerpt_hash=sha256:963be0be44d229dc998f584287a39707a9d514a9d7677bd25933e671e05d60c9

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610251609-FNSJM5/blueprint/resolved-snapshot.json
    - old_digest: 07b91867c4c8adf1392230e8bdaaab2cdc9a92450e2218aaf8cb22e29e72661a
    - current_digest: 07b91867c4c8adf1392230e8bdaaab2cdc9a92450e2218aaf8cb22e29e72661a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610251609-FNSJM5

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610251609-FNSJM5
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    Command: npx vitest run --config vitest.writer.config.ts src/sw/source/filter/ascii/native-ascii-range.test.ts src/sw/source/uibase/app/docsh.test.ts src/sw/browser/presentation/WriterFileDialog.test.tsx (from apps/office). Result: pass. Evidence: 3 files, 43 tests. Scope: native ASCII range, shell full text/table serialization, TXT dialog download.
    Command: npm run typecheck --workspace @vite-office/office. Result: pass. Evidence: tsc --noEmit exited 0. Scope: Office TypeScript.
    Command: npx prettier --check and npx eslint on changed sources/tests, plus changed docs JSON/Markdown in Prettier. Result: pass. Evidence: no diagnostics. Scope: task diff formatting and lint.
    Command: npm run inventory:parity:writer. Result: pass. Evidence: semanticViolationCount 0. Scope: Writer registry after provenance update.
    Command: git diff --check. Result: pass. Evidence: no whitespace errors. Scope: task diff.
    The initial root Vitest command lacked the Writer jsdom config; a second root invocation used the config but missed tests because its root is apps/office. The declared tests passed from apps/office with the Writer config. Upstream ASCII single-paragraph numbering suppression is documented in WRITER093. Complete ASCII attributes, fields, redlines, option handling and clipboard table topology remain outside this TXT task.
id_source: "generated"
---
## Summary

Connect native Writer TXT export and filter shell path

Route Writer TXT download through native ASCII writer and document shell, preserving upstream filter boundaries and browser medium semantics; verify related core and UI behavior.

## Scope

In scope: Writer ASCII filter full-document range, SwDocShell TXT serialization, browser download adapter, related ASCII/core/UI tests and provenance. Out of scope: unrelated storage and autosave behavior.

## Plan

Trace upstream ASCII writer defaults and full-document selection. Add a shell-owned TXT serialization path using SwASCWriter over native nodes. Route the browser TXT download through that path and preserve the export medium contract. Add focused core and UI tests, run declared checks, document findings and finish the task.

## Verify Steps

1. Run npx vitest run apps/office/src/sw/source/filter/ascii/native-ascii-range.test.ts apps/office/src/sw/browser/presentation/WriterFileDialog.test.tsx. Expect native range and TXT UI checks pass.
2. Run npm run typecheck --workspace @vite-office/office. Expect no type errors.
3. Run npx prettier --check on changed source and test files, and npx eslint on changed source and test files. Expect no diagnostics.
4. Inspect TXT export through SwDocShell and SwASCWriter, including list labels, paragraph terminators and export medium status; record evidence and final git status.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-25T16:13:53.631Z — VERIFY — ok

By: CODER

Note: Native TXT filter and UI route pass 43 focused tests, Office typecheck, targeted formatting/lint, Writer registry check and diff validation.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-25T16:13:52.983Z, excerpt_hash=sha256:963be0be44d229dc998f584287a39707a9d514a9d7677bd25933e671e05d60c9

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610251609-FNSJM5/blueprint/resolved-snapshot.json
- old_digest: 07b91867c4c8adf1392230e8bdaaab2cdc9a92450e2218aaf8cb22e29e72661a
- current_digest: 07b91867c4c8adf1392230e8bdaaab2cdc9a92450e2218aaf8cb22e29e72661a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610251609-FNSJM5

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610251609-FNSJM5
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Command: npx vitest run --config vitest.writer.config.ts src/sw/source/filter/ascii/native-ascii-range.test.ts src/sw/source/uibase/app/docsh.test.ts src/sw/browser/presentation/WriterFileDialog.test.tsx (from apps/office). Result: pass. Evidence: 3 files, 43 tests. Scope: native ASCII range, shell full text/table serialization, TXT dialog download.
Command: npm run typecheck --workspace @vite-office/office. Result: pass. Evidence: tsc --noEmit exited 0. Scope: Office TypeScript.
Command: npx prettier --check and npx eslint on changed sources/tests, plus changed docs JSON/Markdown in Prettier. Result: pass. Evidence: no diagnostics. Scope: task diff formatting and lint.
Command: npm run inventory:parity:writer. Result: pass. Evidence: semanticViolationCount 0. Scope: Writer registry after provenance update.
Command: git diff --check. Result: pass. Evidence: no whitespace errors. Scope: task diff.
The initial root Vitest command lacked the Writer jsdom config; a second root invocation used the config but missed tests because its root is apps/office. The declared tests passed from apps/office with the Writer config. Upstream ASCII single-paragraph numbering suppression is documented in WRITER093. Complete ASCII attributes, fields, redlines, option handling and clipboard table topology remain outside this TXT task.

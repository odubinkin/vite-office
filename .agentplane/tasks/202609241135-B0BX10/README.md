---
id: "202609241135-B0BX10"
title: "F7 Complete browser-relevant SwTransferable contract"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on:
  - "202609241135-227P0M"
tags:
  - "code"
  - "parity"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T14:00:51.619Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-24T14:15:21.661Z"
  updated_by: "CODER"
  note: "npm run verify passed: 488 office tests, 98 inventory tests, 14 browser E2E cases, static build, JSDoc, inventory/provenance and 100% coverage; focused clipboard tests and git diff --check passed."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Compare pinned Writer transfer formats and ordering, repair browser clipboard selection ownership, and verify failure behavior against focused tests."
events:
  -
    type: "status"
    at: "2026-09-24T14:00:52.678Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Compare pinned Writer transfer formats and ordering, repair browser clipboard selection ownership, and verify failure behavior against focused tests."
  -
    type: "verify"
    at: "2026-09-24T14:15:21.661Z"
    author: "CODER"
    state: "ok"
    note: "npm run verify passed: 488 office tests, 98 inventory tests, 14 browser E2E cases, static build, JSDoc, inventory/provenance and 100% coverage; focused clipboard tests and git diff --check passed."
doc_version: 3
doc_updated_at: "2026-09-24T14:15:21.732Z"
doc_updated_by: "CODER"
description: "Implement F7: compare browser-relevant clipboard formats, ordering, ownership and errors to pinned swdtflvr and add missing behavior."
sections:
  Summary: |-
    F7 Complete browser-relevant SwTransferable contract

    Implement F7: compare browser-relevant clipboard formats, ordering, ownership and errors to pinned swdtflvr and add missing behavior.
  Scope: "In scope: SwTransferable selection ownership, Copy/Cut/Paste format preference and failure behavior for the existing HTML/plain-text browser transfer; browser MIME adapter; focused tests; parity inventory/provenance. Out of scope: introducing unimplemented RTF, Markdown, native object/table and OLE serialization."
  Plan: "1. Compare pinned swdtflvr.cxx advertised formats and Cut/Paste order with current Writer transfer and browser MIME adapter. 2. Keep supported transfer semantics under SwTransferable and repair browser selection ownership, MIME order and error handling. 3. Add focused tests and explicitly record remaining unsupported upstream flavors in parity data. 4. Run required verification and close with task evidence."
  Verify Steps: "1. Inspect pinned swdtflvr.cxx PrepareForCopy, Cut and paste format ordering against local SwTransferable and record supported/omitted browser flavors. 2. Run focused SwTransferable and BrowserWriterEditWindow tests: Writer model selection only, HTML before plain text, failed or stale cuts preserve content, outside Writer selection is not intercepted. 3. Run npm run verify and git diff --check; record summary and residual scope in Verification/Findings."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T14:15:21.661Z — VERIFY — ok

    By: CODER

    Note: npm run verify passed: 488 office tests, 98 inventory tests, 14 browser E2E cases, static build, JSDoc, inventory/provenance and 100% coverage; focused clipboard tests and git diff --check passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T14:15:20.730Z, excerpt_hash=sha256:86ca7b70bf177fc8ee755c03b32b408f242b85c1d8cbd75efe76de74d93b8fe4

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241135-B0BX10/blueprint/resolved-snapshot.json
    - old_digest: bcc73f095cf8756048626daaa23d56015db7f6ad1428c1367d05f7eaf4e0fb2d
    - current_digest: bcc73f095cf8756048626daaa23d56015db7f6ad1428c1367d05f7eaf4e0fb2d
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241135-B0BX10

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202609241135-B0BX10 -m 🧩 B0BX10 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the F7 implementation and task evidence commits, then rerun focused clipboard tests and npm run verify."
  Findings: "Pinned swdtflvr.cxx PrepareForCopyTextRange advertises RTF, desktop RICHTEXT/HTML/MARKDOWN, and STRING, with selection-dependent embedded/object formats; Cut copies before deletion and PasteSpecial prefers HTML ahead of STRING. The implemented text slice has HTML and plain-text filters only. RTF/RICHTEXT/MARKDOWN remain explicit unsupported transfer flavors; embedded objects, tables and OLE remain outside this bounded text-selection scope. The browser adapter now leaves non-Writer selections to native copy/cut and writes HTML before plain text. SwTransferable retains the selected PaM and deletes only after successful platform write; focused tests cover synchronous/asynchronous failures and stale selections."
id_source: "generated"
---
## Summary

F7 Complete browser-relevant SwTransferable contract

Implement F7: compare browser-relevant clipboard formats, ordering, ownership and errors to pinned swdtflvr and add missing behavior.

## Scope

In scope: SwTransferable selection ownership, Copy/Cut/Paste format preference and failure behavior for the existing HTML/plain-text browser transfer; browser MIME adapter; focused tests; parity inventory/provenance. Out of scope: introducing unimplemented RTF, Markdown, native object/table and OLE serialization.

## Plan

1. Compare pinned swdtflvr.cxx advertised formats and Cut/Paste order with current Writer transfer and browser MIME adapter. 2. Keep supported transfer semantics under SwTransferable and repair browser selection ownership, MIME order and error handling. 3. Add focused tests and explicitly record remaining unsupported upstream flavors in parity data. 4. Run required verification and close with task evidence.

## Verify Steps

1. Inspect pinned swdtflvr.cxx PrepareForCopy, Cut and paste format ordering against local SwTransferable and record supported/omitted browser flavors. 2. Run focused SwTransferable and BrowserWriterEditWindow tests: Writer model selection only, HTML before plain text, failed or stale cuts preserve content, outside Writer selection is not intercepted. 3. Run npm run verify and git diff --check; record summary and residual scope in Verification/Findings.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T14:15:21.661Z — VERIFY — ok

By: CODER

Note: npm run verify passed: 488 office tests, 98 inventory tests, 14 browser E2E cases, static build, JSDoc, inventory/provenance and 100% coverage; focused clipboard tests and git diff --check passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T14:15:20.730Z, excerpt_hash=sha256:86ca7b70bf177fc8ee755c03b32b408f242b85c1d8cbd75efe76de74d93b8fe4

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241135-B0BX10/blueprint/resolved-snapshot.json
- old_digest: bcc73f095cf8756048626daaa23d56015db7f6ad1428c1367d05f7eaf4e0fb2d
- current_digest: bcc73f095cf8756048626daaa23d56015db7f6ad1428c1367d05f7eaf4e0fb2d
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241135-B0BX10

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202609241135-B0BX10 -m 🧩 B0BX10 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the F7 implementation and task evidence commits, then rerun focused clipboard tests and npm run verify.

## Findings

Pinned swdtflvr.cxx PrepareForCopyTextRange advertises RTF, desktop RICHTEXT/HTML/MARKDOWN, and STRING, with selection-dependent embedded/object formats; Cut copies before deletion and PasteSpecial prefers HTML ahead of STRING. The implemented text slice has HTML and plain-text filters only. RTF/RICHTEXT/MARKDOWN remain explicit unsupported transfer flavors; embedded objects, tables and OLE remain outside this bounded text-selection scope. The browser adapter now leaves non-Writer selections to native copy/cut and writes HTML before plain text. SwTransferable retains the selected PaM and deletes only after successful platform write; focused tests cover synchronous/asynchronous failures and stale selections.

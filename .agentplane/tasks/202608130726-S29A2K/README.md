---
id: "202608130726-S29A2K"
title: "Align active Writer source paths with LibreOffice module boundaries"
result_summary: "verified-202608130726-S29A2K"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-13T07:33:28.660Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-13T07:33:35.616Z"
  updated_by: "CODER"
  note: "verified-202608130726-S29A2K"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-13T07:33:19.574Z"
  updated_by: "EVALUATOR"
  note: "Active source paths align with exact LibreOffice module boundaries."
  evaluated_sha: "7b542f7500bd1b72c303595180044a340a7f4cf4"
  blueprint_digest: "dbf7f439124a4622a2ca23142a91760d95081e1a28e0a32c58a0d2b27a2863db"
  evidence_refs:
    - ".agentplane/tasks/202608130726-S29A2K/README.md"
    - ".agentplane/tasks/202608130726-S29A2K/quality/20260813-073319574-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608130726-S29A2K/quality/20260813-073319574-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608130726-S29A2K/quality/20260813-073319574-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608130726-S29A2K/blueprint/resolved-snapshot.json"
    - "7b542f7"
  findings:
    - "The fast suite and every specified structural/provenance quality gate passed."
commit:
  hash: "432517a1961e534db63c58c9c86d6779a1f4868c"
  message: "🧾 S29A2K task: record source-path verification"
comments:
  -
    author: "CODER"
    body: "Start: move the approved active-module paths to their pinned LibreOffice boundaries, preserving behavior and traceability."
  -
    author: "CODER"
    body: "Verified: verified-202608130726-S29A2K. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-08-13T07:27:20.949Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: move the approved active-module paths to their pinned LibreOffice boundaries, preserving behavior and traceability."
  -
    type: "verify"
    at: "2026-08-13T07:33:19.141Z"
    author: "CODER"
    state: "ok"
    note: "Verified: exact-path refactor preserves 83 fast tests at 100% coverage; source provenance, source-tree, JSDoc, format, lint, types, stale-path search, diff, doctor, and routing checks passed."
  -
    type: "verify"
    at: "2026-08-13T07:33:35.616Z"
    author: "CODER"
    state: "ok"
    note: "verified-202608130726-S29A2K"
  -
    type: "status"
    at: "2026-08-13T07:33:35.801Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202608130726-S29A2K. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-08-13T07:33:35.801Z"
doc_updated_by: "CODER"
description: "Rename the current browser implementations of docfac, Writer document nodes, and selection shell to their pinned LibreOffice-like paths; update imports, co-located tests, provenance, and source-tree documentation without changing behavior."
sections:
  Summary: |-
    Align active Writer source paths with LibreOffice module boundaries

    Rename the current browser implementations of docfac, Writer document nodes, and selection shell to their pinned LibreOffice-like paths; update imports, co-located tests, provenance, and source-tree documentation without changing behavior.
  Scope: |-
    - In scope: Rename the current browser implementations of docfac, Writer document nodes, and selection shell to their pinned LibreOffice-like paths; update imports, co-located tests, provenance, and source-tree documentation without changing behavior.
    - Out of scope: unrelated refactors not required for "Align active Writer source paths with LibreOffice module boundaries".
  Plan: "1. Move sfx2 document factory to sfx2/source/doc/docfac.ts, Writer paragraph-node helpers to sw/source/core/docnode/node.ts, and browser selection logic to sw/source/uibase/wrtsh/select.ts; move their colocated tests where applicable. 2. Update every production and test import plus the source-provenance manifest and source-tree documentation so each moved module names its exact pinned LibreOffice counterpart. 3. Preserve exports and behavior, remove the superseded paths, and document only genuine browser-only exceptions. 4. Verify the fast suite at 100 percent coverage, provenance/source-tree/docs/format/lint/type checks, and a repository search proving no superseded import remains. Full-suite cadence remains unchanged."
  Verify Steps: "1. Run npm run test:coverage. Expected: the renamed modules retain all fast tests at 100 percent coverage. 2. Run npm run check:source-provenance && npm run check:source-tree && npm run check:docs && npm run format:check && npm run lint && npm run typecheck && git diff --check. Expected: exact LO-like paths, JSDoc, static quality, and a whitespace-clean diff all pass. 3. Run rg -n 'writer-paragraph-structure|writer-dom-selection|sfx2/source/doc/document' apps/office/src docs/program/source-provenance.json docs/program/source-tree.md. Expected: no active source, import, provenance, or source-tree reference remains. 4. Defer npm run verify and full browser matrix under the agreed ten-task cadence; record the residual risk."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-13T07:33:19.141Z — VERIFY — ok

    By: CODER

    Note: Verified: exact-path refactor preserves 83 fast tests at 100% coverage; source provenance, source-tree, JSDoc, format, lint, types, stale-path search, diff, doctor, and routing checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T07:28:33.266Z, excerpt_hash=sha256:a62210a6e6348fac6d09ee2e9a0f192355ee7dd04a552a6650f0f1ea12bbb344

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130726-S29A2K/blueprint/resolved-snapshot.json
    - old_digest: dbf7f439124a4622a2ca23142a91760d95081e1a28e0a32c58a0d2b27a2863db
    - current_digest: dbf7f439124a4622a2ca23142a91760d95081e1a28e0a32c58a0d2b27a2863db
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608130726-S29A2K

    DecisionContextRef:
    - operator_action: provider_action
    - can_execute_now: false
    - safe_command: none
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-08-13T07:33:35.616Z — VERIFY — ok

    By: CODER

    Note: verified-202608130726-S29A2K
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T07:33:19.223Z, excerpt_hash=sha256:a62210a6e6348fac6d09ee2e9a0f192355ee7dd04a552a6650f0f1ea12bbb344

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130726-S29A2K/blueprint/resolved-snapshot.json
    - old_digest: dbf7f439124a4622a2ca23142a91760d95081e1a28e0a32c58a0d2b27a2863db
    - current_digest: dbf7f439124a4622a2ca23142a91760d95081e1a28e0a32c58a0d2b27a2863db
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608130726-S29A2K

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202608130726-S29A2K --result verified-202608130726-S29A2K --commit 432517a1961e534db63c58c9c86d6779a1f4868c
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - Observation: Four browser modules now occupy exact pinned LibreOffice-like paths: docfac, docnode/node, and wrtsh/select, with co-located document-factory test.
      Impact: Runtime ownership, imports, source-tree enforcement, and provenance now agree on active LO directory and file names.
      Resolution: No behavior changed; full suite remains deferred under the agreed ten-task cadence.
extensions:
  implementation_commit:
    hash: "7b542f7500bd1b72c303595180044a340a7f4cf4"
    message: "♻️ S29A2K code: align active source paths with LibreOffice"
id_source: "generated"
---
## Summary

Align active Writer source paths with LibreOffice module boundaries

Rename the current browser implementations of docfac, Writer document nodes, and selection shell to their pinned LibreOffice-like paths; update imports, co-located tests, provenance, and source-tree documentation without changing behavior.

## Scope

- In scope: Rename the current browser implementations of docfac, Writer document nodes, and selection shell to their pinned LibreOffice-like paths; update imports, co-located tests, provenance, and source-tree documentation without changing behavior.
- Out of scope: unrelated refactors not required for "Align active Writer source paths with LibreOffice module boundaries".

## Plan

1. Move sfx2 document factory to sfx2/source/doc/docfac.ts, Writer paragraph-node helpers to sw/source/core/docnode/node.ts, and browser selection logic to sw/source/uibase/wrtsh/select.ts; move their colocated tests where applicable. 2. Update every production and test import plus the source-provenance manifest and source-tree documentation so each moved module names its exact pinned LibreOffice counterpart. 3. Preserve exports and behavior, remove the superseded paths, and document only genuine browser-only exceptions. 4. Verify the fast suite at 100 percent coverage, provenance/source-tree/docs/format/lint/type checks, and a repository search proving no superseded import remains. Full-suite cadence remains unchanged.

## Verify Steps

1. Run npm run test:coverage. Expected: the renamed modules retain all fast tests at 100 percent coverage. 2. Run npm run check:source-provenance && npm run check:source-tree && npm run check:docs && npm run format:check && npm run lint && npm run typecheck && git diff --check. Expected: exact LO-like paths, JSDoc, static quality, and a whitespace-clean diff all pass. 3. Run rg -n 'writer-paragraph-structure|writer-dom-selection|sfx2/source/doc/document' apps/office/src docs/program/source-provenance.json docs/program/source-tree.md. Expected: no active source, import, provenance, or source-tree reference remains. 4. Defer npm run verify and full browser matrix under the agreed ten-task cadence; record the residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-13T07:33:19.141Z — VERIFY — ok

By: CODER

Note: Verified: exact-path refactor preserves 83 fast tests at 100% coverage; source provenance, source-tree, JSDoc, format, lint, types, stale-path search, diff, doctor, and routing checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T07:28:33.266Z, excerpt_hash=sha256:a62210a6e6348fac6d09ee2e9a0f192355ee7dd04a552a6650f0f1ea12bbb344

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130726-S29A2K/blueprint/resolved-snapshot.json
- old_digest: dbf7f439124a4622a2ca23142a91760d95081e1a28e0a32c58a0d2b27a2863db
- current_digest: dbf7f439124a4622a2ca23142a91760d95081e1a28e0a32c58a0d2b27a2863db
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608130726-S29A2K

DecisionContextRef:
- operator_action: provider_action
- can_execute_now: false
- safe_command: none
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-08-13T07:33:35.616Z — VERIFY — ok

By: CODER

Note: verified-202608130726-S29A2K
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T07:33:19.223Z, excerpt_hash=sha256:a62210a6e6348fac6d09ee2e9a0f192355ee7dd04a552a6650f0f1ea12bbb344

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130726-S29A2K/blueprint/resolved-snapshot.json
- old_digest: dbf7f439124a4622a2ca23142a91760d95081e1a28e0a32c58a0d2b27a2863db
- current_digest: dbf7f439124a4622a2ca23142a91760d95081e1a28e0a32c58a0d2b27a2863db
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608130726-S29A2K

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202608130726-S29A2K --result verified-202608130726-S29A2K --commit 432517a1961e534db63c58c9c86d6779a1f4868c
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- Observation: Four browser modules now occupy exact pinned LibreOffice-like paths: docfac, docnode/node, and wrtsh/select, with co-located document-factory test.
  Impact: Runtime ownership, imports, source-tree enforcement, and provenance now agree on active LO directory and file names.
  Resolution: No behavior changed; full suite remains deferred under the agreed ten-task cadence.

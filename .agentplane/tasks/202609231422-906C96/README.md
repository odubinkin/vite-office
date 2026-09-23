---
id: "202609231422-906C96"
title: "Implement Writer pagination and visible page layout"
status: "DOING"
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
  updated_at: "2026-09-23T14:23:14.506Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-23T14:50:49.356Z"
  updated_by: "CODER"
  note: "Full verify passed, including 100% application and inventory coverage, Chromium E2E pagination and ODT reopen, static quality, provenance, parity, and policy checks."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-23T14:51:37.385Z"
  updated_by: "EVALUATOR"
  note: "Writer-owned page and follow text frames replace browser character-count pagination for the supported paragraph slice; all declared checks pass."
  evaluated_sha: "9d6969dd1354159d8187652b1a48cedbdcfd4ee1"
  blueprint_digest: "db079b9773f8838157fad4613ce3fcd2ba005c1f9b20ffa187ee4801a3499ed9"
  evidence_refs:
    - ".agentplane/tasks/202609231422-906C96/README.md"
    - ".agentplane/tasks/202609231422-906C96/quality/20260923-145137385-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609231422-906C96/quality/20260923-145137385-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609231422-906C96/quality/20260923-145137385-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609231422-906C96/blueprint/resolved-snapshot.json"
    - "npm run verify: pass, 100% application and inventory coverage"
    - "apps/office/e2e/writer-odt-file.spec.ts: long paragraph remains one ODT text node across page fragments after reopen"
    - "node .agentplane/policy/check-routing.mjs and ap doctor: pass"
  findings:
    - "Browser line measurement is isolated in a closed Shadow DOM device port and fragment selection uses source-node offsets."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement Writer-owned page frames and text-frame fragments from measured browser lines, then verify selection, page geometry, and ODT reopen."
  -
    author: "CODER"
    body: "Blocked: full verify requires two exact runtime-inventory entries for the new Writer layout modules; requested scope approval because the parity plan excludes inventory data."
  -
    author: "CODER"
    body: "Start: resume approved Writer pagination task, add exact runtime inventory entries for new layout modules, then rerun complete verification."
events:
  -
    type: "status"
    at: "2026-09-23T14:23:19.694Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement Writer-owned page frames and text-frame fragments from measured browser lines, then verify selection, page geometry, and ODT reopen."
  -
    type: "status"
    at: "2026-09-23T14:43:05.557Z"
    author: "CODER"
    from: "DOING"
    to: "BLOCKED"
    note: "Blocked: full verify requires two exact runtime-inventory entries for the new Writer layout modules; requested scope approval because the parity plan excludes inventory data."
  -
    type: "status"
    at: "2026-09-23T14:45:48.032Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: resume approved Writer pagination task, add exact runtime inventory entries for new layout modules, then rerun complete verification."
  -
    type: "verify"
    at: "2026-09-23T14:50:49.356Z"
    author: "CODER"
    state: "ok"
    note: "Full verify passed, including 100% application and inventory coverage, Chromium E2E pagination and ODT reopen, static quality, provenance, parity, and policy checks."
doc_version: 3
doc_updated_at: "2026-09-23T14:50:49.409Z"
doc_updated_by: "CODER"
description: "Implement section 1 of docs/program/vite-office-upstream-parity-plan.md using Writer-owned page frames and split text-frame fragments with browser line measurement and selection mapping."
sections:
  Summary: |-
    Implement Writer pagination and visible page layout

    Implement section 1 of docs/program/vite-office-upstream-parity-plan.md using Writer-owned page frames and split text-frame fragments with browser line measurement and selection mapping.
  Scope: |-
    - In scope: Implement section 1 of docs/program/vite-office-upstream-parity-plan.md using Writer-owned page frames and split text-frame fragments with browser line measurement and selection mapping.
    - Out of scope: unrelated refactors not required for "Implement Writer pagination and visible page layout".
  Plan: "1. Add DOM-neutral Writer text-frame line fragments and page-frame composition under sw/source/core/text and sw/source/core/layout, preserving one source text node per fragment chain. 2. Add browser line measurement for mixed runs and widths, render fragment projections across pages, and map native selections to source paragraph offsets. 3. Remove the character-count pagination estimator and update focused unit and browser tests for long paragraphs, margins, spacing, lists, page resizing, selection, and ODT reopen. 4. Run focused and repository verification; record evidence and finish the task. Scope: sw core text/layout, sw browser editor/presentation, targeted tests and task metadata; no document storage schema or network access."
  Verify Steps: "1. Run focused Vitest suites for Writer layout, browser selection, page rendering, and ODT roundtrip. Expected: split fragments retain one source paragraph identity and correct offsets; page geometry and reopen behavior pass. 2. Run npm run typecheck, npm run lint, npm run format:check, npm run check:docs, npm run check:file-size, npm run check:source-tree, npm run check:source-provenance, and npm run check:dependencies. Expected: all pass. 3. Run npm run verify. Expected: full unit coverage, browser end-to-end, static, inventory, and policy checks pass. 4. Run node .agentplane/policy/check-routing.mjs, ap doctor, git diff --check, and inspect git status --short --untracked-files=all. Expected: clean checks and only intended task changes."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-23T14:50:49.356Z — VERIFY — ok

    By: CODER

    Note: Full verify passed, including 100% application and inventory coverage, Chromium E2E pagination and ODT reopen, static quality, provenance, parity, and policy checks.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T14:50:49.072Z, excerpt_hash=sha256:a4d84bbb27eecbcaa684a7f3fd3216b4368867f82acea32eeead9f3172a645a2

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231422-906C96/blueprint/resolved-snapshot.json
    - old_digest: db079b9773f8838157fad4613ce3fcd2ba005c1f9b20ffa187ee4801a3499ed9
    - current_digest: db079b9773f8838157fad4613ce3fcd2ba005c1f9b20ffa187ee4801a3499ed9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609231422-906C96

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202609231422-906C96 -m 🧩 906C96 task: persist canonical task artifacts --allow-tasks
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
    Command: focused Vitest suites for Writer layout, selection, page UI, browser editor, and ODT roundtrip. Result: pass. Evidence: split paragraph fragments preserve one source node and source-relative caret offsets; styled line measurement, list follows, margins, resize, and ODT reopen pass. Scope: new Writer text/page frames and browser adapter.

    Command: npm run verify. Result: pass. Evidence: application and inventory coverage reached 100%; all browser E2E, static, format, lint, typecheck, dependency, docs, size, source-tree, provenance, invariant, and parity gates passed. Scope: entire repository verification suite.

    Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Result: pass. Evidence: policy routing OK; doctor OK with pre-existing warnings about hook shim and a historical DONE task; whitespace diff clean. Scope: repository policy and task diff.

    Resolution: the initial inventory mismatch was resolved by adding the three new runtime modules to runtime-inventory.json and source-provenance.json, with no generator, validator, or schema changes. The stored document model and ODT format were not changed.
id_source: "generated"
---
## Summary

Implement Writer pagination and visible page layout

Implement section 1 of docs/program/vite-office-upstream-parity-plan.md using Writer-owned page frames and split text-frame fragments with browser line measurement and selection mapping.

## Scope

- In scope: Implement section 1 of docs/program/vite-office-upstream-parity-plan.md using Writer-owned page frames and split text-frame fragments with browser line measurement and selection mapping.
- Out of scope: unrelated refactors not required for "Implement Writer pagination and visible page layout".

## Plan

1. Add DOM-neutral Writer text-frame line fragments and page-frame composition under sw/source/core/text and sw/source/core/layout, preserving one source text node per fragment chain. 2. Add browser line measurement for mixed runs and widths, render fragment projections across pages, and map native selections to source paragraph offsets. 3. Remove the character-count pagination estimator and update focused unit and browser tests for long paragraphs, margins, spacing, lists, page resizing, selection, and ODT reopen. 4. Run focused and repository verification; record evidence and finish the task. Scope: sw core text/layout, sw browser editor/presentation, targeted tests and task metadata; no document storage schema or network access.

## Verify Steps

1. Run focused Vitest suites for Writer layout, browser selection, page rendering, and ODT roundtrip. Expected: split fragments retain one source paragraph identity and correct offsets; page geometry and reopen behavior pass. 2. Run npm run typecheck, npm run lint, npm run format:check, npm run check:docs, npm run check:file-size, npm run check:source-tree, npm run check:source-provenance, and npm run check:dependencies. Expected: all pass. 3. Run npm run verify. Expected: full unit coverage, browser end-to-end, static, inventory, and policy checks pass. 4. Run node .agentplane/policy/check-routing.mjs, ap doctor, git diff --check, and inspect git status --short --untracked-files=all. Expected: clean checks and only intended task changes.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-23T14:50:49.356Z — VERIFY — ok

By: CODER

Note: Full verify passed, including 100% application and inventory coverage, Chromium E2E pagination and ODT reopen, static quality, provenance, parity, and policy checks.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T14:50:49.072Z, excerpt_hash=sha256:a4d84bbb27eecbcaa684a7f3fd3216b4368867f82acea32eeead9f3172a645a2

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231422-906C96/blueprint/resolved-snapshot.json
- old_digest: db079b9773f8838157fad4613ce3fcd2ba005c1f9b20ffa187ee4801a3499ed9
- current_digest: db079b9773f8838157fad4613ce3fcd2ba005c1f9b20ffa187ee4801a3499ed9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609231422-906C96

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202609231422-906C96 -m 🧩 906C96 task: persist canonical task artifacts --allow-tasks
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

Command: focused Vitest suites for Writer layout, selection, page UI, browser editor, and ODT roundtrip. Result: pass. Evidence: split paragraph fragments preserve one source node and source-relative caret offsets; styled line measurement, list follows, margins, resize, and ODT reopen pass. Scope: new Writer text/page frames and browser adapter.

Command: npm run verify. Result: pass. Evidence: application and inventory coverage reached 100%; all browser E2E, static, format, lint, typecheck, dependency, docs, size, source-tree, provenance, invariant, and parity gates passed. Scope: entire repository verification suite.

Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Result: pass. Evidence: policy routing OK; doctor OK with pre-existing warnings about hook shim and a historical DONE task; whitespace diff clean. Scope: repository policy and task diff.

Resolution: the initial inventory mismatch was resolved by adding the three new runtime modules to runtime-inventory.json and source-provenance.json, with no generator, validator, or schema changes. The stored document model and ODT format were not changed.

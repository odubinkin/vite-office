---
id: "202609211242-64B6YF"
title: "Fix remaining Writer P0 parity gaps"
result_summary: "verified-202609211242-64B6YF"
status: "DONE"
priority: "high"
owner: "CODER"
revision: 17
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-21T12:42:38.502Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-21T13:15:08.562Z"
  updated_by: "CODER"
  note: "verified-202609211242-64B6YF"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-21T13:09:57.864Z"
  updated_by: "EVALUATOR"
  note: "P0-3 through P0-5 remediation matches the approved scope and passes the complete repository quality gate."
  evaluated_sha: "279797e577df6c9192127b8e1307b16ab5225ad8"
  blueprint_digest: "c4dee43202b5f10ca35a8de2235a5ebf7c0a938581898d2b897cc36a40df9c41"
  evidence_refs:
    - ".agentplane/tasks/202609211242-64B6YF/README.md"
    - ".agentplane/tasks/202609211242-64B6YF/quality/20260921-130957864-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609211242-64B6YF/quality/20260921-130957864-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609211242-64B6YF/quality/20260921-130957864-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609211242-64B6YF/blueprint/resolved-snapshot.json"
    - "npm run verify"
    - "apps/office/src/sw/source/core/txtnode/ndhints.ts"
    - "apps/office/src/sw/inc/poolfmt.test.ts"
  findings:
    - "Browser identity translation is confined to projection adapters; canonical text mutations and undo use native hints; exposed paragraph styles have supported defaults."
commit:
  hash: "279797e577df6c9192127b8e1307b16ab5225ad8"
  message: "🔧 64B6YF task: close Writer P0 parity gaps"
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Verified: verified-202609211242-64B6YF. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-21T12:42:59.205Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-21T13:09:27.702Z"
    author: "CODER"
    state: "ok"
    note: "PASS: npm run verify; 349 app tests and 95 inventory tests at 100% coverage, 11 e2e tests, all static, architecture, provenance, invariant, parity, doctor, routing, diff, and status checks passed."
  -
    type: "verify"
    at: "2026-09-21T13:09:47.283Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609211242-64B6YF"
  -
    type: "verify"
    at: "2026-09-21T13:10:31.409Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609211242-64B6YF"
  -
    type: "status"
    at: "2026-09-21T13:10:31.508Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609211242-64B6YF. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
  -
    type: "verify"
    at: "2026-09-21T13:15:08.562Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609211242-64B6YF"
doc_version: 3
doc_updated_at: "2026-09-21T13:15:08.622Z"
doc_updated_by: "CODER"
description: "Complete P0-3 through P0-5 remediation found by audit: keep browser projection identities outside sw/source, remove WriterTextRun from canonical mutation paths, and make every exposed paragraph style match supported pinned defaults or remain unavailable. P0-1 stays unchanged."
sections:
  Summary: "Complete the audited Writer P0-3 through P0-5 gaps while preserving the intentionally unchanged P0-1 inventory model."
  Scope: "In scope: move browser selection/projection DTO ownership and paragraph-id resolution out of sw/source; make SwTextNode formatting, hyperlink, and insertion paths operate directly on SwpHints/SwTextAttr/SfxItemSet; retain WriterTextRun only at browser/filter/transfer boundaries; correct or unexpose every currently available built-in paragraph style against the pinned LibreOffice defaults; add focused architectural and exhaustive style tests. Out of scope: P0-1 inventory mechanics, P1/P2 restructuring beyond the minimum dependency-boundary move, persisted schema changes, networking, publication, and unrelated cleanup."
  Plan: "Implement the approved five-step P0-3 through P0-5 remediation and verification plan recorded in the task README, with P0-1 explicitly unchanged."
  Verify Steps: |-
    1. Run focused Sfx/Writer tests proving sw/source has no imports from sw/browser and browser paragraph IDs are converted to SwPosition/SwPaM before SwView/SwWrtShell calls.
    2. Run focused text/hint/undo tests proving insert, direct formatting, font changes, and hyperlinks mutate text plus SwpHints/SfxItemSet without WriterTextRun in core mutation implementations or undo construction.
    3. Run exhaustive style tests over WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL proving each available style has its source-derived supported defaults and that unsupported styles are absent from commands/toolbars.
    4. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:source-tree, and npm run check:source-provenance.
    5. Run npm run test:coverage, npm run test:inventory:coverage, npm run test:e2e, and npm run verify.
    6. Run ap doctor and node .agentplane/policy/check-routing.mjs.
    7. Inspect git diff and git status --short --untracked-files=all; only intentional P0-3 through P0-5 files and task artifacts may change, with P0-1 mechanics untouched.
  Verification: |-
    PASS: npm run verify (349 application tests with 100% coverage; 95 inventory tests with 100% coverage; 11 Playwright e2e tests; build/static/JSDoc/file-size/source-tree/source-provenance/invariants/parity all passed). PASS: focused Writer suite (53 tests before final additions), check:dependencies (140 runtime sources, 476 imports, 12 allowed cross-module edges), ap doctor, policy routing, git diff --check, and architecture rg checks.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-21T13:09:27.702Z — VERIFY — ok

    By: CODER

    Note: PASS: npm run verify; 349 app tests and 95 inventory tests at 100% coverage, 11 e2e tests, all static, architecture, provenance, invariant, parity, doctor, routing, diff, and status checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T13:08:48.486Z, excerpt_hash=sha256:4ef00351a93c9839e0033589f0d793128f4fbe1759b948029f19146d364db7d4

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211242-64B6YF/blueprint/resolved-snapshot.json
    - old_digest: c4dee43202b5f10ca35a8de2235a5ebf7c0a938581898d2b897cc36a40df9c41
    - current_digest: c4dee43202b5f10ca35a8de2235a5ebf7c0a938581898d2b897cc36a40df9c41
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211242-64B6YF

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609211242-64B6YF
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-21T13:09:47.283Z — VERIFY — ok

    By: CODER

    Note: verified-202609211242-64B6YF
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T13:09:27.760Z, excerpt_hash=sha256:4ef00351a93c9839e0033589f0d793128f4fbe1759b948029f19146d364db7d4

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211242-64B6YF/blueprint/resolved-snapshot.json
    - old_digest: c4dee43202b5f10ca35a8de2235a5ebf7c0a938581898d2b897cc36a40df9c41
    - current_digest: c4dee43202b5f10ca35a8de2235a5ebf7c0a938581898d2b897cc36a40df9c41
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211242-64B6YF

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609211242-64B6YF --result verified-202609211242-64B6YF --commit 279797e577df6c9192127b8e1307b16ab5225ad8
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-21T13:10:31.409Z — VERIFY — ok

    By: CODER

    Note: verified-202609211242-64B6YF
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T13:09:47.334Z, excerpt_hash=sha256:4ef00351a93c9839e0033589f0d793128f4fbe1759b948029f19146d364db7d4

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211242-64B6YF/blueprint/resolved-snapshot.json
    - old_digest: c4dee43202b5f10ca35a8de2235a5ebf7c0a938581898d2b897cc36a40df9c41
    - current_digest: c4dee43202b5f10ca35a8de2235a5ebf7c0a938581898d2b897cc36a40df9c41
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211242-64B6YF

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609211242-64B6YF --result verified-202609211242-64B6YF --commit df3ca2c5706576fcd00f8a7f43bae49d90ac75ae
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-21T13:15:08.562Z — VERIFY — ok

    By: CODER

    Note: verified-202609211242-64B6YF
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T13:10:31.509Z, excerpt_hash=sha256:4ef00351a93c9839e0033589f0d793128f4fbe1759b948029f19146d364db7d4

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211242-64B6YF/blueprint/resolved-snapshot.json
    - old_digest: c4dee43202b5f10ca35a8de2235a5ebf7c0a938581898d2b897cc36a40df9c41
    - current_digest: c4dee43202b5f10ca35a8de2235a5ebf7c0a938581898d2b897cc36a40df9c41
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211242-64B6YF

    DecisionContextRef:
    - operator_action: stop
    - can_execute_now: false
    - safe_command: none
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit and deterministic AgentPlane close commit; no storage migration or external state is involved."
  Findings: "P0-3: browser paragraph-id resolution now lives in the browser projection adapter and sw/source is protected from sw/browser imports. P0-4: insertion, formatting, font, hyperlink, and undo paths now use native SwpHints/SwTextAttr/SfxItemSet fragments; obsolete run-based mutation helpers were removed while boundary projections remain. P0-5: HTML list-heading is unavailable until defaults exist, comment defaults match the pinned source-derived values, and the complete exposed style set is tested. P0-1 inventory mechanics remain unchanged; only stale runtime-inventory entries for removed exports were deleted."
id_source: "generated"
---
## Summary

Complete the audited Writer P0-3 through P0-5 gaps while preserving the intentionally unchanged P0-1 inventory model.

## Scope

In scope: move browser selection/projection DTO ownership and paragraph-id resolution out of sw/source; make SwTextNode formatting, hyperlink, and insertion paths operate directly on SwpHints/SwTextAttr/SfxItemSet; retain WriterTextRun only at browser/filter/transfer boundaries; correct or unexpose every currently available built-in paragraph style against the pinned LibreOffice defaults; add focused architectural and exhaustive style tests. Out of scope: P0-1 inventory mechanics, P1/P2 restructuring beyond the minimum dependency-boundary move, persisted schema changes, networking, publication, and unrelated cleanup.

## Plan

Implement the approved five-step P0-3 through P0-5 remediation and verification plan recorded in the task README, with P0-1 explicitly unchanged.

## Verify Steps

1. Run focused Sfx/Writer tests proving sw/source has no imports from sw/browser and browser paragraph IDs are converted to SwPosition/SwPaM before SwView/SwWrtShell calls.
2. Run focused text/hint/undo tests proving insert, direct formatting, font changes, and hyperlinks mutate text plus SwpHints/SfxItemSet without WriterTextRun in core mutation implementations or undo construction.
3. Run exhaustive style tests over WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL proving each available style has its source-derived supported defaults and that unsupported styles are absent from commands/toolbars.
4. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:source-tree, and npm run check:source-provenance.
5. Run npm run test:coverage, npm run test:inventory:coverage, npm run test:e2e, and npm run verify.
6. Run ap doctor and node .agentplane/policy/check-routing.mjs.
7. Inspect git diff and git status --short --untracked-files=all; only intentional P0-3 through P0-5 files and task artifacts may change, with P0-1 mechanics untouched.

## Verification

PASS: npm run verify (349 application tests with 100% coverage; 95 inventory tests with 100% coverage; 11 Playwright e2e tests; build/static/JSDoc/file-size/source-tree/source-provenance/invariants/parity all passed). PASS: focused Writer suite (53 tests before final additions), check:dependencies (140 runtime sources, 476 imports, 12 allowed cross-module edges), ap doctor, policy routing, git diff --check, and architecture rg checks.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-21T13:09:27.702Z — VERIFY — ok

By: CODER

Note: PASS: npm run verify; 349 app tests and 95 inventory tests at 100% coverage, 11 e2e tests, all static, architecture, provenance, invariant, parity, doctor, routing, diff, and status checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T13:08:48.486Z, excerpt_hash=sha256:4ef00351a93c9839e0033589f0d793128f4fbe1759b948029f19146d364db7d4

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211242-64B6YF/blueprint/resolved-snapshot.json
- old_digest: c4dee43202b5f10ca35a8de2235a5ebf7c0a938581898d2b897cc36a40df9c41
- current_digest: c4dee43202b5f10ca35a8de2235a5ebf7c0a938581898d2b897cc36a40df9c41
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211242-64B6YF

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609211242-64B6YF
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-21T13:09:47.283Z — VERIFY — ok

By: CODER

Note: verified-202609211242-64B6YF
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T13:09:27.760Z, excerpt_hash=sha256:4ef00351a93c9839e0033589f0d793128f4fbe1759b948029f19146d364db7d4

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211242-64B6YF/blueprint/resolved-snapshot.json
- old_digest: c4dee43202b5f10ca35a8de2235a5ebf7c0a938581898d2b897cc36a40df9c41
- current_digest: c4dee43202b5f10ca35a8de2235a5ebf7c0a938581898d2b897cc36a40df9c41
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211242-64B6YF

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609211242-64B6YF --result verified-202609211242-64B6YF --commit 279797e577df6c9192127b8e1307b16ab5225ad8
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-21T13:10:31.409Z — VERIFY — ok

By: CODER

Note: verified-202609211242-64B6YF
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T13:09:47.334Z, excerpt_hash=sha256:4ef00351a93c9839e0033589f0d793128f4fbe1759b948029f19146d364db7d4

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211242-64B6YF/blueprint/resolved-snapshot.json
- old_digest: c4dee43202b5f10ca35a8de2235a5ebf7c0a938581898d2b897cc36a40df9c41
- current_digest: c4dee43202b5f10ca35a8de2235a5ebf7c0a938581898d2b897cc36a40df9c41
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211242-64B6YF

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609211242-64B6YF --result verified-202609211242-64B6YF --commit df3ca2c5706576fcd00f8a7f43bae49d90ac75ae
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-21T13:15:08.562Z — VERIFY — ok

By: CODER

Note: verified-202609211242-64B6YF
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T13:10:31.509Z, excerpt_hash=sha256:4ef00351a93c9839e0033589f0d793128f4fbe1759b948029f19146d364db7d4

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211242-64B6YF/blueprint/resolved-snapshot.json
- old_digest: c4dee43202b5f10ca35a8de2235a5ebf7c0a938581898d2b897cc36a40df9c41
- current_digest: c4dee43202b5f10ca35a8de2235a5ebf7c0a938581898d2b897cc36a40df9c41
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211242-64B6YF

DecisionContextRef:
- operator_action: stop
- can_execute_now: false
- safe_command: none
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit and deterministic AgentPlane close commit; no storage migration or external state is involved.

## Findings

P0-3: browser paragraph-id resolution now lives in the browser projection adapter and sw/source is protected from sw/browser imports. P0-4: insertion, formatting, font, hyperlink, and undo paths now use native SwpHints/SwTextAttr/SfxItemSet fragments; obsolete run-based mutation helpers were removed while boundary projections remain. P0-5: HTML list-heading is unavailable until defaults exist, comment defaults match the pinned source-derived values, and the complete exposed style set is tested. P0-1 inventory mechanics remain unchanged; only stale runtime-inventory entries for removed exports were deleted.

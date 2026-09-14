---
id: "202609140558-BBEAFA"
title: "Implement stage 4 canonical cursor and input pipeline"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T06:00:08.159Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-14T06:50:12.791Z"
  updated_by: "CODER"
  note: "verified-202609140558-BBEAFA"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-14T06:49:58.040Z"
  updated_by: "EVALUATOR"
  note: "Stage 4 matches the pinned LibreOffice shell ownership boundaries and passes the complete repository verification suite."
  evaluated_sha: "4d6adb8b313c2c02fce5967016c2c2e4cab1faa5"
  blueprint_digest: "565cedd7bfccad088233fc05b9490b47f4ed504b1458f5b4c0e30496b78ba897"
  evidence_refs:
    - ".agentplane/tasks/202609140558-BBEAFA/README.md"
    - ".agentplane/tasks/202609140558-BBEAFA/quality/20260914-064958040-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609140558-BBEAFA/quality/20260914-064958040-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609140558-BBEAFA/quality/20260914-064958040-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609140558-BBEAFA/blueprint/resolved-snapshot.json"
    - "npm run verify: 206 unit tests and 79 inventory tests at 100% coverage; 8/8 E2E; build, docs, boundaries, and file-size passed"
  findings:
    - "Persistent SwPaM, pre-DOM beforeinput dispatch, extended-text-input transaction, direction-preserving DOM adapter, mixed character-format state, and selection-preserving undo are covered without duplicated document mutation paths."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved Stage 4 canonical cursor, beforeinput, IME composition, DOM selection adapter, and parity verification scope."
events:
  -
    type: "status"
    at: "2026-09-14T06:00:16.426Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Stage 4 canonical cursor, beforeinput, IME composition, DOM selection adapter, and parity verification scope."
  -
    type: "verify"
    at: "2026-09-14T06:49:49.057Z"
    author: "CODER"
    state: "ok"
    note: "Stage 4 canonical Writer cursor, beforeinput, IME, selection, and mixed-format state verified against pinned LibreOffice boundaries; focused Vitest 34/34 and full npm run verify passed."
  -
    type: "verify"
    at: "2026-09-14T06:50:12.791Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609140558-BBEAFA"
doc_version: 3
doc_updated_at: "2026-09-14T06:50:12.865Z"
doc_updated_by: "CODER"
description: "Implement section 8 (Stage 4) of docs/program/vite-office-upstream-parity-plan.md, preserving upstream LibreOffice semantics and avoiding invented domain behavior."
sections:
  Summary: |-
    Implement stage 4 canonical cursor and input pipeline

    Implement section 8 (Stage 4) of docs/program/vite-office-upstream-parity-plan.md, preserving upstream LibreOffice semantics and avoiding invented domain behavior.
  Scope: |-
    - In scope: persistent shell-owned SwPaM; DOM↔model selection mapping; beforeinput-first text, deletion, paragraph split/join pipeline; IME composition lifecycle and one committed undo unit; cursor attribute state; render-time selection restoration; focused parity tests and inventory references required by touched runtime files.
    - Out of scope: Stage 5 medium/recovery, new Writer features, unsupported cross-paragraph rich-text editing beyond Stage 4 requirements, and unrelated refactors.
  Plan: "Implement Stage 4 as a single CODER-owned leaf: preserve one persistent direction-aware SwPaM, route supported edits through beforeinput into shell operations before DOM reconciliation, model IME composition explicitly as one committed undo unit, isolate DOM selection mapping/restoration, retain shell cursor attributes, and verify the six Stage 4 assertions plus repository gates."
  Verify Steps: |-
    1. `npm exec vitest run --workspace @vite-office/office -- src/sw/source/uibase/wrtsh/select.test.ts src/sw/source/uibase/wrtsh/wrtsh.test.ts src/sw/source/uibase/docvw/edtwin.test.tsx src/sw/source/uibase/uiview/view-session.test.tsx src/sw/source/core/doc/writer-model.test.ts` — expected: Stage 4 cursor/input/IME regressions pass.
    2. `npm run typecheck` — expected: TypeScript contracts for shell, DOM adapter, and UI compile.
    3. `npm run verify` — expected: formatting, lint, typecheck, boundaries, unit/inventory coverage, E2E, static build, JSDoc, and file-size checks pass.
    4. `node .agentplane/policy/check-routing.mjs` and `ap doctor` — expected: repository workflow policy remains valid.
    5. `git status --short --untracked-files=all` — expected: only intentional task artifacts/source changes and the pre-existing user plan file are present.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-14T06:49:49.057Z — VERIFY — ok

    By: CODER

    Note: Stage 4 canonical Writer cursor, beforeinput, IME, selection, and mixed-format state verified against pinned LibreOffice boundaries; focused Vitest 34/34 and full npm run verify passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T06:34:32.723Z, excerpt_hash=sha256:9cf1c2b906f584d427b910cb6cb75a91ee206af0a8a9dbf2742012a0ac52b15f

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609140558-BBEAFA/blueprint/resolved-snapshot.json
    - old_digest: 565cedd7bfccad088233fc05b9490b47f4ed504b1458f5b4c0e30496b78ba897
    - current_digest: 565cedd7bfccad088233fc05b9490b47f4ed504b1458f5b4c0e30496b78ba897
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609140558-BBEAFA

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609140558-BBEAFA
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-14T06:50:12.791Z — VERIFY — ok

    By: CODER

    Note: verified-202609140558-BBEAFA
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T06:49:49.138Z, excerpt_hash=sha256:9cf1c2b906f584d427b910cb6cb75a91ee206af0a8a9dbf2742012a0ac52b15f

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609140558-BBEAFA/blueprint/resolved-snapshot.json
    - old_digest: 565cedd7bfccad088233fc05b9490b47f4ed504b1458f5b4c0e30496b78ba897
    - current_digest: 565cedd7bfccad088233fc05b9490b47f4ed504b1458f5b4c0e30496b78ba897
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609140558-BBEAFA

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609140558-BBEAFA --result verified-202609140558-BBEAFA --commit 4d6adb8b313c2c02fce5967016c2c2e4cab1faa5
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert the implementation commit and the deterministic task-close commit if created.
    - Re-run the targeted Writer tests and typecheck to confirm the previous behavior is restored.
    - Preserve the user-owned untracked parity plan file.
  Findings: |-
    - Observation: Full verification passed: 206 unit tests and 79 inventory tests at 100% coverage, 8/8 Chromium E2E, static production build, JSDoc, file-size, policy routing, doctor, and source provenance.
      Impact: SwWrtShell now owns persistent point/mark and modeled edit transactions before DOM mutation; native selection is a reversible view projection.
      Resolution: Implementation commit 4d6adb8b313c contains only Stage 4 source/tests and task artifacts; pre-existing user plan remains untracked.
id_source: "generated"
---
## Summary

Implement stage 4 canonical cursor and input pipeline

Implement section 8 (Stage 4) of docs/program/vite-office-upstream-parity-plan.md, preserving upstream LibreOffice semantics and avoiding invented domain behavior.

## Scope

- In scope: persistent shell-owned SwPaM; DOM↔model selection mapping; beforeinput-first text, deletion, paragraph split/join pipeline; IME composition lifecycle and one committed undo unit; cursor attribute state; render-time selection restoration; focused parity tests and inventory references required by touched runtime files.
- Out of scope: Stage 5 medium/recovery, new Writer features, unsupported cross-paragraph rich-text editing beyond Stage 4 requirements, and unrelated refactors.

## Plan

Implement Stage 4 as a single CODER-owned leaf: preserve one persistent direction-aware SwPaM, route supported edits through beforeinput into shell operations before DOM reconciliation, model IME composition explicitly as one committed undo unit, isolate DOM selection mapping/restoration, retain shell cursor attributes, and verify the six Stage 4 assertions plus repository gates.

## Verify Steps

1. `npm exec vitest run --workspace @vite-office/office -- src/sw/source/uibase/wrtsh/select.test.ts src/sw/source/uibase/wrtsh/wrtsh.test.ts src/sw/source/uibase/docvw/edtwin.test.tsx src/sw/source/uibase/uiview/view-session.test.tsx src/sw/source/core/doc/writer-model.test.ts` — expected: Stage 4 cursor/input/IME regressions pass.
2. `npm run typecheck` — expected: TypeScript contracts for shell, DOM adapter, and UI compile.
3. `npm run verify` — expected: formatting, lint, typecheck, boundaries, unit/inventory coverage, E2E, static build, JSDoc, and file-size checks pass.
4. `node .agentplane/policy/check-routing.mjs` and `ap doctor` — expected: repository workflow policy remains valid.
5. `git status --short --untracked-files=all` — expected: only intentional task artifacts/source changes and the pre-existing user plan file are present.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-14T06:49:49.057Z — VERIFY — ok

By: CODER

Note: Stage 4 canonical Writer cursor, beforeinput, IME, selection, and mixed-format state verified against pinned LibreOffice boundaries; focused Vitest 34/34 and full npm run verify passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T06:34:32.723Z, excerpt_hash=sha256:9cf1c2b906f584d427b910cb6cb75a91ee206af0a8a9dbf2742012a0ac52b15f

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609140558-BBEAFA/blueprint/resolved-snapshot.json
- old_digest: 565cedd7bfccad088233fc05b9490b47f4ed504b1458f5b4c0e30496b78ba897
- current_digest: 565cedd7bfccad088233fc05b9490b47f4ed504b1458f5b4c0e30496b78ba897
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609140558-BBEAFA

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609140558-BBEAFA
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-14T06:50:12.791Z — VERIFY — ok

By: CODER

Note: verified-202609140558-BBEAFA
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T06:49:49.138Z, excerpt_hash=sha256:9cf1c2b906f584d427b910cb6cb75a91ee206af0a8a9dbf2742012a0ac52b15f

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609140558-BBEAFA/blueprint/resolved-snapshot.json
- old_digest: 565cedd7bfccad088233fc05b9490b47f4ed504b1458f5b4c0e30496b78ba897
- current_digest: 565cedd7bfccad088233fc05b9490b47f4ed504b1458f5b4c0e30496b78ba897
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609140558-BBEAFA

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609140558-BBEAFA --result verified-202609140558-BBEAFA --commit 4d6adb8b313c2c02fce5967016c2c2e4cab1faa5
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert the implementation commit and the deterministic task-close commit if created.
- Re-run the targeted Writer tests and typecheck to confirm the previous behavior is restored.
- Preserve the user-owned untracked parity plan file.

## Findings

- Observation: Full verification passed: 206 unit tests and 79 inventory tests at 100% coverage, 8/8 Chromium E2E, static production build, JSDoc, file-size, policy routing, doctor, and source provenance.
  Impact: SwWrtShell now owns persistent point/mark and modeled edit transactions before DOM mutation; native selection is a reversible view projection.
  Resolution: Implementation commit 4d6adb8b313c contains only Stage 4 source/tests and task artifacts; pre-existing user plan remains untracked.

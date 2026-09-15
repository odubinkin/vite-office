---
id: "202609151533-247WK4"
title: "Implement Writer upstream parity Phase 5"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T15:33:51.115Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-15T16:21:35.153Z"
  updated_by: "CODER"
  note: "Phase 5 verified: npm run verify passed; 311 application tests and 88 inventory tests reached 100% coverage, 10 Chromium E2E tests passed, and typecheck/lint/build/static/docs/source-tree/provenance/parity checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-15T16:21:49.380Z"
  updated_by: "EVALUATOR"
  note: "Phase 5 acceptance criteria and repository quality gates pass."
  evaluated_sha: "79a72d7d78af1013f8b7ff64a8c3b678e45ca45d"
  blueprint_digest: "339c03520979b755394d6ad4a1b95d673a6a65870713d8dc40725e06e73f3012"
  evidence_refs:
    - ".agentplane/tasks/202609151533-247WK4/README.md"
    - ".agentplane/tasks/202609151533-247WK4/quality/20260915-162149380-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609151533-247WK4/quality/20260915-162149380-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609151533-247WK4/quality/20260915-162149380-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609151533-247WK4/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/uibase/docvw/edtwin.tsx"
    - "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts"
    - "apps/office/src/sw/source/filter/html/swhtml.ts"
  findings:
    - "The browser editor is a projection of canonical Writer state: selection is centralized, unsupported native mutation is blocked, transfer is SwPaM/model-owned, and React no longer reconciles DOM text."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement Phase 5 browser projection, canonical SwPaM selection, explicit input intents, and model-owned transfer against pinned LibreOffice."
events:
  -
    type: "status"
    at: "2026-09-15T15:33:58.670Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement Phase 5 browser projection, canonical SwPaM selection, explicit input intents, and model-owned transfer against pinned LibreOffice."
  -
    type: "verify"
    at: "2026-09-15T16:21:35.153Z"
    author: "CODER"
    state: "ok"
    note: "Phase 5 verified: npm run verify passed; 311 application tests and 88 inventory tests reached 100% coverage, 10 Chromium E2E tests passed, and typecheck/lint/build/static/docs/source-tree/provenance/parity checks passed."
doc_version: 3
doc_updated_at: "2026-09-15T16:21:35.234Z"
doc_updated_by: "CODER"
description: "Make the browser editor a projection: central DOM-to-SwPaM mapping, complete supported input-intent routing, single rendering owner, and model-based transfer, following pinned LibreOffice 26.8.0.2. No compatibility layer for prior stored model versions."
sections:
  Summary: |-
    Implement Writer upstream parity Phase 5

    Make the browser editor a projection: central DOM-to-SwPaM mapping, complete supported input-intent routing, single rendering owner, and model-based transfer, following pinned LibreOffice 26.8.0.2. No compatibility layer for prior stored model versions.
  Scope: |-
    - In scope: `apps/office/src/sw/browser/editor/**`, Writer editing-host projection code, `SwWrtShell` input/selection operations, `SwTransferable`, bounded HTML/plain-text transfer filters, and directly related unit/integration/E2E tests.
    - Required behavior: the DOM is a projection only; every supported mutation travels through the shell-owned `SwPaM`; copy/cut serialize model data; paste/drop import through Writer operations.
    - Authority: pinned LibreOffice tag `libreoffice-26.8.0.2`, especially `edtwin*.cxx`, `select.cxx`, `wrtsh*.cxx`, and `swdtflvr.cxx`.
    - Browser-only selection, Input Events, IME, pointer geometry, and DataTransfer mechanics remain narrow class-B adapters.
    - Out of scope: unrelated Phase 6 presentation relocation, unsupported desktop transfer formats, and backward compatibility for any superseded stored model schema.
  Plan: |-
    1. Audit the current browser editor, shell, transfer, and tests against Phase 5 and the pinned LibreOffice ownership/behavior boundaries.
    2. Consolidate native selection reads/restoration in one adapter and make shell-owned `SwPaM` authoritative for commands and transfer.
    3. Route supported beforeinput, keyboard, composition, pointer, paste, and drag/drop intents through shell operations; prevent unsupported DOM mutation and remove fallback reconciliation.
    4. Render model runs deterministically with stable projection keys and restore selection without innerHTML comparison or replaceChildren reconciliation.
    5. Make copy/cut/paste/drop model-based through `SwTransferable` and bounded filters, keeping DataTransfer translation at the browser boundary.
    6. Add focused regression/stress coverage, run the declared checks, record verification, commit, finish the task, and push `main`.
  Verify Steps: |-
    1. `npx vitest run apps/office/src/sw/browser/editor apps/office/src/sw/source/uibase/docvw/edtwin.test.tsx apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts` — all selection, intent, IME, projection, clipboard, paste, drop, and undo-focused tests pass.
    2. `npm run typecheck` — application and tool TypeScript contracts pass.
    3. `npm run lint` — no lint warnings or errors.
    4. `npm test` — the complete unit and inventory coverage suites pass at enforced thresholds.
    5. `npm run test:e2e` — built Writer browser flows pass in Chromium.
    6. `npm run build` — production build succeeds.
    7. `ap doctor` and `node .agentplane/policy/check-routing.mjs` — AgentPlane health and policy routing pass.
    8. Source inspection: production Writer editor code has no full-text DOM reconciliation/fallback counters, no model-facing command or clipboard path independently calls `getSelection()`, unsupported `beforeinput` is prevented and canonical state is reprojected, and copy output is independent of rendered DOM shape.
    9. `git status --short --untracked-files=all` — only intentional task artifacts remain before commit and the tracked tree is clean after finish.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-15T16:21:35.153Z — VERIFY — ok

    By: CODER

    Note: Phase 5 verified: npm run verify passed; 311 application tests and 88 inventory tests reached 100% coverage, 10 Chromium E2E tests passed, and typecheck/lint/build/static/docs/source-tree/provenance/parity checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T15:33:58.670Z, excerpt_hash=sha256:c45f6443929ad14977f9def6349c72f9e8eb37d3a2a6511db67c9cb464efa188

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151533-247WK4/blueprint/resolved-snapshot.json
    - old_digest: 339c03520979b755394d6ad4a1b95d673a6a65870713d8dc40725e06e73f3012
    - current_digest: 339c03520979b755394d6ad4a1b95d673a6a65870713d8dc40725e06e73f3012
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609151533-247WK4

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609151533-247WK4
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert the Phase 5 implementation commit and the deterministic AgentPlane close commit.
    - Re-run the focused editor/transfer tests and typecheck to confirm the previous projection behavior is restored.
    - No persistence compatibility migration is retained or introduced.
  Findings: |-
    - Observation: Writer editing, selection, IME, clipboard, drag/drop, and React projection now use canonical SwPaM/SwWrtShell state without DOM reconciliation.
      Impact: DOM shape and browser-native mutations can no longer become an independent Writer document model.
      Resolution: Centralized selection mapping, model-owned SwTransferable serialization, bounded swhtml import, beforeinput intent routing, and deterministic React run projection.
id_source: "generated"
---
## Summary

Implement Writer upstream parity Phase 5

Make the browser editor a projection: central DOM-to-SwPaM mapping, complete supported input-intent routing, single rendering owner, and model-based transfer, following pinned LibreOffice 26.8.0.2. No compatibility layer for prior stored model versions.

## Scope

- In scope: `apps/office/src/sw/browser/editor/**`, Writer editing-host projection code, `SwWrtShell` input/selection operations, `SwTransferable`, bounded HTML/plain-text transfer filters, and directly related unit/integration/E2E tests.
- Required behavior: the DOM is a projection only; every supported mutation travels through the shell-owned `SwPaM`; copy/cut serialize model data; paste/drop import through Writer operations.
- Authority: pinned LibreOffice tag `libreoffice-26.8.0.2`, especially `edtwin*.cxx`, `select.cxx`, `wrtsh*.cxx`, and `swdtflvr.cxx`.
- Browser-only selection, Input Events, IME, pointer geometry, and DataTransfer mechanics remain narrow class-B adapters.
- Out of scope: unrelated Phase 6 presentation relocation, unsupported desktop transfer formats, and backward compatibility for any superseded stored model schema.

## Plan

1. Audit the current browser editor, shell, transfer, and tests against Phase 5 and the pinned LibreOffice ownership/behavior boundaries.
2. Consolidate native selection reads/restoration in one adapter and make shell-owned `SwPaM` authoritative for commands and transfer.
3. Route supported beforeinput, keyboard, composition, pointer, paste, and drag/drop intents through shell operations; prevent unsupported DOM mutation and remove fallback reconciliation.
4. Render model runs deterministically with stable projection keys and restore selection without innerHTML comparison or replaceChildren reconciliation.
5. Make copy/cut/paste/drop model-based through `SwTransferable` and bounded filters, keeping DataTransfer translation at the browser boundary.
6. Add focused regression/stress coverage, run the declared checks, record verification, commit, finish the task, and push `main`.

## Verify Steps

1. `npx vitest run apps/office/src/sw/browser/editor apps/office/src/sw/source/uibase/docvw/edtwin.test.tsx apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts` — all selection, intent, IME, projection, clipboard, paste, drop, and undo-focused tests pass.
2. `npm run typecheck` — application and tool TypeScript contracts pass.
3. `npm run lint` — no lint warnings or errors.
4. `npm test` — the complete unit and inventory coverage suites pass at enforced thresholds.
5. `npm run test:e2e` — built Writer browser flows pass in Chromium.
6. `npm run build` — production build succeeds.
7. `ap doctor` and `node .agentplane/policy/check-routing.mjs` — AgentPlane health and policy routing pass.
8. Source inspection: production Writer editor code has no full-text DOM reconciliation/fallback counters, no model-facing command or clipboard path independently calls `getSelection()`, unsupported `beforeinput` is prevented and canonical state is reprojected, and copy output is independent of rendered DOM shape.
9. `git status --short --untracked-files=all` — only intentional task artifacts remain before commit and the tracked tree is clean after finish.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-15T16:21:35.153Z — VERIFY — ok

By: CODER

Note: Phase 5 verified: npm run verify passed; 311 application tests and 88 inventory tests reached 100% coverage, 10 Chromium E2E tests passed, and typecheck/lint/build/static/docs/source-tree/provenance/parity checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T15:33:58.670Z, excerpt_hash=sha256:c45f6443929ad14977f9def6349c72f9e8eb37d3a2a6511db67c9cb464efa188

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151533-247WK4/blueprint/resolved-snapshot.json
- old_digest: 339c03520979b755394d6ad4a1b95d673a6a65870713d8dc40725e06e73f3012
- current_digest: 339c03520979b755394d6ad4a1b95d673a6a65870713d8dc40725e06e73f3012
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609151533-247WK4

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609151533-247WK4
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert the Phase 5 implementation commit and the deterministic AgentPlane close commit.
- Re-run the focused editor/transfer tests and typecheck to confirm the previous projection behavior is restored.
- No persistence compatibility migration is retained or introduced.

## Findings

- Observation: Writer editing, selection, IME, clipboard, drag/drop, and React projection now use canonical SwPaM/SwWrtShell state without DOM reconciliation.
  Impact: DOM shape and browser-native mutations can no longer become an independent Writer document model.
  Resolution: Centralized selection mapping, model-owned SwTransferable serialization, bounded swhtml import, beforeinput intent routing, and deterministic React run projection.

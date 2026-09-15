---
id: "202609150024-9ZHZPC"
title: "Tolerate unknown ODF attributes during ODT import"
result_summary: "verified-202609150024-9ZHZPC"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "backend"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T00:24:45.378Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-15T00:29:58.500Z"
  updated_by: "CODER"
  note: "verified-202609150024-9ZHZPC"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-15T00:29:34.339Z"
  updated_by: "EVALUATOR"
  note: "Unknown and context-unsupported ODF attributes now warn and are ignored without weakening structural or supported-value validation."
  evaluated_sha: "e08eac7a5b2e0e658a7ebaeca2a4a30e3b6446e8"
  blueprint_digest: "6a4f67c9fd3a6a72ef1a374d633632a22c9279ebd954dca12f32e3e7eab2134c"
  evidence_refs:
    - ".agentplane/tasks/202609150024-9ZHZPC/README.md"
    - ".agentplane/tasks/202609150024-9ZHZPC/quality/20260915-002934339-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609150024-9ZHZPC/quality/20260915-002934339-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609150024-9ZHZPC/quality/20260915-002934339-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609150024-9ZHZPC/blueprint/resolved-snapshot.json"
    - "apps/office/src/xmloff/source/core/xml-parser.test.ts"
    - "apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts"
  findings:
    - "Regression coverage verifies style:default-outline-level, arbitrary unknown attributes, and successful Writer import; the complete repository verification passes."
commit:
  hash: "e08eac7a5b2e0e658a7ebaeca2a4a30e3b6446e8"
  message: "🚧 9ZHZPC task: tolerate unknown ODF attributes"
comments:
  -
    author: "CODER"
    body: "Start: align ODT unknown-attribute handling with pinned LibreOffice and add focused regression coverage."
  -
    author: "CODER"
    body: "Verified: verified-202609150024-9ZHZPC. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-15T00:24:51.797Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align ODT unknown-attribute handling with pinned LibreOffice and add focused regression coverage."
  -
    type: "verify"
    at: "2026-09-15T00:29:33.955Z"
    author: "CODER"
    state: "ok"
    note: "Focused ODF tests passed (14/14); typecheck and lint passed; provenance/parity and Agentplane checks passed; full npm run verify passed with 274 unit tests, 84 inventory tests, 100% coverage, 9 e2e tests, builds, and static checks."
  -
    type: "verify"
    at: "2026-09-15T00:29:42.853Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609150024-9ZHZPC"
  -
    type: "verify"
    at: "2026-09-15T00:29:58.500Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609150024-9ZHZPC"
  -
    type: "status"
    at: "2026-09-15T00:29:58.592Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609150024-9ZHZPC. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-09-15T00:29:58.592Z"
doc_updated_by: "CODER"
description: "Align ODT attribute import with pinned LibreOffice behavior: log and ignore unknown or unsupported attributes so style:default-outline-level does not prevent opening LibreOffice-created files, while retaining structural, security-limit, required-field, and supported-value validation."
sections:
  Summary: "Make ODT import tolerant of unknown and context-unsupported attributes, matching the pinned LibreOffice fast-parser behavior: emit a console warning and continue importing instead of failing the entire document."
  Scope: |-
    - In scope: FastAttributeList unsupported-attribute policy, focused parser/ODT regression tests, and source-provenance metadata only if required by repository validation.
    - Acceptance: LibreOffice style:default-outline-level and arbitrary unknown attributes are warned about and ignored; the document still imports.
    - Preserve: malformed XML rejection, parser resource ceilings, cancellation, duplicate attributes, missing required fields, invalid supported values, current xmloff/sw ownership, and source-shaped file layout.
    - Out of scope: unrelated ODF feature support or broad importer refactoring.
  Plan: |-
    1. Change the existing FastAttributeList policy at the xmloff parser boundary so unsupported attributes are reported with console.warn and omitted from semantic access, following pinned LibreOffice fastparser/fastattribs behavior.
    2. Update focused parser and Writer ODT tests to assert warnings and successful import for style:default-outline-level and an arbitrary unknown property, while retaining strict failure tests for structural and supported-value errors.
    3. Run the declared targeted tests, typecheck/lint/provenance checks, Agentplane route validation, and the broader repository verification if feasible; record exact evidence.
    4. Review the final diff and finish the direct-mode task with traceable commit metadata.
  Verify Steps: |-
    1. Run `npm exec vitest run apps/office/src/xmloff/source/core/xml-parser.test.ts apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts`. Expected: unknown/unsupported attributes warn and do not abort parsing or ODT import; existing strict parser/import cases pass.
    2. Run `npm run typecheck && npm run lint`. Expected: no TypeScript or ESLint errors.
    3. Run `npm run check:source-provenance && npm run inventory:parity`. Expected: pinned upstream mappings and evidence remain valid.
    4. Run `node .agentplane/policy/check-routing.mjs && ap doctor`. Expected: routing and repository workflow checks pass.
    5. Run `npm run verify`. Expected: the full repository verification passes; if an infrastructure-only blocker occurs, record the exact command, failure, residual risk, and obtain approval before any skip.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-15T00:29:33.955Z — VERIFY — ok

    By: CODER

    Note: Focused ODF tests passed (14/14); typecheck and lint passed; provenance/parity and Agentplane checks passed; full npm run verify passed with 274 unit tests, 84 inventory tests, 100% coverage, 9 e2e tests, builds, and static checks.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T00:24:51.797Z, excerpt_hash=sha256:5b80e1e2bc2a34650bd7ceb3b1a6a5f3c7c64d624eaf4d869249e27e166cd382

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150024-9ZHZPC/blueprint/resolved-snapshot.json
    - old_digest: 6a4f67c9fd3a6a72ef1a374d633632a22c9279ebd954dca12f32e3e7eab2134c
    - current_digest: 6a4f67c9fd3a6a72ef1a374d633632a22c9279ebd954dca12f32e3e7eab2134c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150024-9ZHZPC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609150024-9ZHZPC
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T00:29:42.853Z — VERIFY — ok

    By: CODER

    Note: verified-202609150024-9ZHZPC
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T00:29:34.009Z, excerpt_hash=sha256:5b80e1e2bc2a34650bd7ceb3b1a6a5f3c7c64d624eaf4d869249e27e166cd382

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150024-9ZHZPC/blueprint/resolved-snapshot.json
    - old_digest: 6a4f67c9fd3a6a72ef1a374d633632a22c9279ebd954dca12f32e3e7eab2134c
    - current_digest: 6a4f67c9fd3a6a72ef1a374d633632a22c9279ebd954dca12f32e3e7eab2134c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150024-9ZHZPC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609150024-9ZHZPC --result verified-202609150024-9ZHZPC --commit e08eac7a5b2e0e658a7ebaeca2a4a30e3b6446e8
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T00:29:58.500Z — VERIFY — ok

    By: CODER

    Note: verified-202609150024-9ZHZPC
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T00:29:42.906Z, excerpt_hash=sha256:5b80e1e2bc2a34650bd7ceb3b1a6a5f3c7c64d624eaf4d869249e27e166cd382

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150024-9ZHZPC/blueprint/resolved-snapshot.json
    - old_digest: 6a4f67c9fd3a6a72ef1a374d633632a22c9279ebd954dca12f32e3e7eab2134c
    - current_digest: 6a4f67c9fd3a6a72ef1a374d633632a22c9279ebd954dca12f32e3e7eab2134c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150024-9ZHZPC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609150024-9ZHZPC --result verified-202609150024-9ZHZPC --commit 15cc2d1df3e8505ed71690c640ca883ef3cd0f10
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert the task implementation/close commit(s).
    - Re-run the focused ODF parser and round-trip tests to confirm the prior strict behavior is restored without unrelated changes.
  Findings: ""
id_source: "generated"
---
## Summary

Make ODT import tolerant of unknown and context-unsupported attributes, matching the pinned LibreOffice fast-parser behavior: emit a console warning and continue importing instead of failing the entire document.

## Scope

- In scope: FastAttributeList unsupported-attribute policy, focused parser/ODT regression tests, and source-provenance metadata only if required by repository validation.
- Acceptance: LibreOffice style:default-outline-level and arbitrary unknown attributes are warned about and ignored; the document still imports.
- Preserve: malformed XML rejection, parser resource ceilings, cancellation, duplicate attributes, missing required fields, invalid supported values, current xmloff/sw ownership, and source-shaped file layout.
- Out of scope: unrelated ODF feature support or broad importer refactoring.

## Plan

1. Change the existing FastAttributeList policy at the xmloff parser boundary so unsupported attributes are reported with console.warn and omitted from semantic access, following pinned LibreOffice fastparser/fastattribs behavior.
2. Update focused parser and Writer ODT tests to assert warnings and successful import for style:default-outline-level and an arbitrary unknown property, while retaining strict failure tests for structural and supported-value errors.
3. Run the declared targeted tests, typecheck/lint/provenance checks, Agentplane route validation, and the broader repository verification if feasible; record exact evidence.
4. Review the final diff and finish the direct-mode task with traceable commit metadata.

## Verify Steps

1. Run `npm exec vitest run apps/office/src/xmloff/source/core/xml-parser.test.ts apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts`. Expected: unknown/unsupported attributes warn and do not abort parsing or ODT import; existing strict parser/import cases pass.
2. Run `npm run typecheck && npm run lint`. Expected: no TypeScript or ESLint errors.
3. Run `npm run check:source-provenance && npm run inventory:parity`. Expected: pinned upstream mappings and evidence remain valid.
4. Run `node .agentplane/policy/check-routing.mjs && ap doctor`. Expected: routing and repository workflow checks pass.
5. Run `npm run verify`. Expected: the full repository verification passes; if an infrastructure-only blocker occurs, record the exact command, failure, residual risk, and obtain approval before any skip.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-15T00:29:33.955Z — VERIFY — ok

By: CODER

Note: Focused ODF tests passed (14/14); typecheck and lint passed; provenance/parity and Agentplane checks passed; full npm run verify passed with 274 unit tests, 84 inventory tests, 100% coverage, 9 e2e tests, builds, and static checks.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T00:24:51.797Z, excerpt_hash=sha256:5b80e1e2bc2a34650bd7ceb3b1a6a5f3c7c64d624eaf4d869249e27e166cd382

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150024-9ZHZPC/blueprint/resolved-snapshot.json
- old_digest: 6a4f67c9fd3a6a72ef1a374d633632a22c9279ebd954dca12f32e3e7eab2134c
- current_digest: 6a4f67c9fd3a6a72ef1a374d633632a22c9279ebd954dca12f32e3e7eab2134c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150024-9ZHZPC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609150024-9ZHZPC
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T00:29:42.853Z — VERIFY — ok

By: CODER

Note: verified-202609150024-9ZHZPC
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T00:29:34.009Z, excerpt_hash=sha256:5b80e1e2bc2a34650bd7ceb3b1a6a5f3c7c64d624eaf4d869249e27e166cd382

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150024-9ZHZPC/blueprint/resolved-snapshot.json
- old_digest: 6a4f67c9fd3a6a72ef1a374d633632a22c9279ebd954dca12f32e3e7eab2134c
- current_digest: 6a4f67c9fd3a6a72ef1a374d633632a22c9279ebd954dca12f32e3e7eab2134c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150024-9ZHZPC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609150024-9ZHZPC --result verified-202609150024-9ZHZPC --commit e08eac7a5b2e0e658a7ebaeca2a4a30e3b6446e8
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T00:29:58.500Z — VERIFY — ok

By: CODER

Note: verified-202609150024-9ZHZPC
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T00:29:42.906Z, excerpt_hash=sha256:5b80e1e2bc2a34650bd7ceb3b1a6a5f3c7c64d624eaf4d869249e27e166cd382

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150024-9ZHZPC/blueprint/resolved-snapshot.json
- old_digest: 6a4f67c9fd3a6a72ef1a374d633632a22c9279ebd954dca12f32e3e7eab2134c
- current_digest: 6a4f67c9fd3a6a72ef1a374d633632a22c9279ebd954dca12f32e3e7eab2134c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150024-9ZHZPC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609150024-9ZHZPC --result verified-202609150024-9ZHZPC --commit 15cc2d1df3e8505ed71690c640ca883ef3cd0f10
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert the task implementation/close commit(s).
- Re-run the focused ODF parser and round-trip tests to confirm the prior strict behavior is restored without unrelated changes.

## Findings

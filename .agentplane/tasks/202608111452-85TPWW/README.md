---
id: "202608111452-85TPWW"
title: "Support document-wide Writer selection shortcuts"
result_summary: "Implemented bounded document-wide Writer selection and caret navigation."
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
  updated_at: "2026-08-11T14:52:58.242Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-11T15:21:08.589Z"
  updated_by: "REVIEWER"
  note: "Verified: Writer keyboard selection, pointer drags in both directions, caret restoration, and cross-paragraph boundary arrows pass coverage, production E2E, parity, and static checks."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-11T15:21:09.052Z"
  updated_by: "EVALUATOR"
  note: "Writer document selection and caret navigation now work across bounded paragraphs."
  evaluated_sha: "f4998f4e3c39ba9a4047e53399f6075ba5d0d1f7"
  blueprint_digest: "cf5f3d659b100d4681a70623a50e8f04abbb2dbb19b84ea74d19bc2361ca8681"
  evidence_refs:
    - ".agentplane/tasks/202608111452-85TPWW/README.md"
    - ".agentplane/tasks/202608111452-85TPWW/quality/20260811-152109052-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608111452-85TPWW/quality/20260811-152109052-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608111452-85TPWW/quality/20260811-152109052-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608111452-85TPWW/blueprint/resolved-snapshot.json"
    - "f4998f4; coverage; production E2E; parity inventory; static checks"
  findings:
    - "Cross-paragraph pointer selection is bounded to complete crossed paragraphs because browser contenteditable hosts cannot natively preserve partial ranges across host boundaries."
commit:
  hash: "f4998f4e3c39ba9a4047e53399f6075ba5d0d1f7"
  message: "✨ 85TPWW code: support Writer document selection"
comments:
  -
    author: "CODER"
    body: "Start: route document-wide native selection through Writer controls and permit cross-paragraph pointer selection with focused parity coverage."
  -
    author: "CODER"
    body: "Verified: Ctrl/Cmd+A, cross-paragraph pointer selection in both directions, caret restoration after input and joins, and boundary arrow navigation are covered and passing."
events:
  -
    type: "status"
    at: "2026-08-11T14:52:58.873Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: route document-wide native selection through Writer controls and permit cross-paragraph pointer selection with focused parity coverage."
  -
    type: "verify"
    at: "2026-08-11T15:21:08.589Z"
    author: "REVIEWER"
    state: "ok"
    note: "Verified: Writer keyboard selection, pointer drags in both directions, caret restoration, and cross-paragraph boundary arrows pass coverage, production E2E, parity, and static checks."
  -
    type: "status"
    at: "2026-08-11T15:21:18.869Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Ctrl/Cmd+A, cross-paragraph pointer selection in both directions, caret restoration after input and joins, and boundary arrow navigation are covered and passing."
doc_version: 3
doc_updated_at: "2026-08-11T15:21:18.871Z"
doc_updated_by: "CODER"
description: "Make Ctrl/Cmd+A invoke Writer Select All and allow native mouse selections to span visible Writer paragraphs while preserving the sanitized clipboard selection contract."
sections:
  Summary: |-
    Support document-wide Writer selection shortcuts

    Make Ctrl/Cmd+A invoke Writer Select All and allow native mouse selections to span visible Writer paragraphs while preserving the sanitized clipboard selection contract.
  Scope: |-
    - In scope: handle Ctrl/Cmd+A as Edit → Select All only while focus is within the Writer document; preserve browser shortcuts outside Writer.
    - In scope: allow native pointer selection to span rendered Writer paragraphs and retain the existing sanitized plain-text/rich-HTML Copy contract.
    - In scope: component and production E2E coverage, parity mapping, and Writer selection documentation.
    - Out of scope: selection of tables, frames, inline character formatting, object selection, or unrelated editor architecture.
  Plan: |-
    1. Inspect the existing document selection request and editable paragraph ownership to identify why browser Ctrl/Cmd+A and pointer selection stop at one paragraph.
    2. Route the platform select-all shortcut through the existing Writer Select All request and make the document body a single editable selection surface without changing paragraph-model commands.
    3. Add focused component and production-browser tests for Ctrl/Cmd+A and a pointer drag from the first paragraph into a following paragraph; retain sanitized Copy assertions.
    4. Update LO-WRITER-0103 mapping and Writer selection documentation, run focused fast checks plus the target Playwright scenario, and record the approved deferred full-suite cadence.
  Verify Steps: |-
    1. Run `npm run test:coverage`. Expected: all office tests pass at 100 percent coverage, including Ctrl/Cmd+A routing, cross-paragraph selection serialization, and existing copy behavior.
    2. Run `npm run test:e2e -- --grep "document-wide selection"`. Expected: production Chromium confirms Ctrl/Cmd+A selects all Writer paragraphs and pointer drag selection crosses from the leading into the following paragraph.
    3. Run `npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`. Expected: LO-WRITER-0103 resolves the changed source, tests, and documentation evidence.
    4. Run `npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs`. Expected: all pass.
    5. Defer aggregate `npm run verify`, static smoke, inventory coverage, and the full Playwright matrix under the user-approved ten-task cadence; record residual risk.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-11T15:21:08.589Z — VERIFY — ok

    By: REVIEWER

    Note: Verified: Writer keyboard selection, pointer drags in both directions, caret restoration, and cross-paragraph boundary arrows pass coverage, production E2E, parity, and static checks.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T15:21:07.860Z, excerpt_hash=sha256:eb83a0c10186f25886aef8ff7f00b04ff7963977e5249d13939b3ea659e771e5

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111452-85TPWW/blueprint/resolved-snapshot.json
    - old_digest: cf5f3d659b100d4681a70623a50e8f04abbb2dbb19b84ea74d19bc2361ca8681
    - current_digest: cf5f3d659b100d4681a70623a50e8f04abbb2dbb19b84ea74d19bc2361ca8681
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608111452-85TPWW

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608111452-85TPWW
    - diagnostic_command: agentplane task run status 202608111452-85TPWW
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert the task-scoped commit(s).
    - Re-run coverage and the focused document-wide selection E2E scenario to confirm that normal Writer editing and Copy behavior are restored.
  Findings: |-
    Command: npm run test:coverage
    Result: pass
    Evidence: 21 test files and 63 tests passed with 100 percent statements, branches, functions, and lines.
    Scope: Ctrl/Cmd+A, caret restoration after input and paragraph joins, and boundary arrow transitions.

    Command: npm run test:e2e -- --grep "document-wide selection"
    Result: pass
    Evidence: production Chromium verifies Enter focus, Ctrl+A, and pointer drags in both paragraph directions.

    Command: npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference
    Result: pass
    Evidence: LO-WRITER-0103 source, test, and documentation evidence resolves with zero exceptions.

    Command: format, lint, typecheck, JSDoc, file-size, diff, doctor, routing
    Result: pass
    Evidence: JSDoc validates 126 authored source files. WriterPlainTextEditor.tsx is a 517-line decomposition candidate; no file exceeds the mandatory 1000-line limit.

    Deferred: aggregate npm run verify, static smoke, inventory coverage, and full browser matrix.
    Reason: user-approved ten-task cadence.
    Risk: exact partial text selection across separate browser contenteditable hosts is not available natively; the implemented cross-paragraph drag selects each crossed paragraph completely, while partial native selection remains available inside one paragraph.
id_source: "generated"
---
## Summary

Support document-wide Writer selection shortcuts

Make Ctrl/Cmd+A invoke Writer Select All and allow native mouse selections to span visible Writer paragraphs while preserving the sanitized clipboard selection contract.

## Scope

- In scope: handle Ctrl/Cmd+A as Edit → Select All only while focus is within the Writer document; preserve browser shortcuts outside Writer.
- In scope: allow native pointer selection to span rendered Writer paragraphs and retain the existing sanitized plain-text/rich-HTML Copy contract.
- In scope: component and production E2E coverage, parity mapping, and Writer selection documentation.
- Out of scope: selection of tables, frames, inline character formatting, object selection, or unrelated editor architecture.

## Plan

1. Inspect the existing document selection request and editable paragraph ownership to identify why browser Ctrl/Cmd+A and pointer selection stop at one paragraph.
2. Route the platform select-all shortcut through the existing Writer Select All request and make the document body a single editable selection surface without changing paragraph-model commands.
3. Add focused component and production-browser tests for Ctrl/Cmd+A and a pointer drag from the first paragraph into a following paragraph; retain sanitized Copy assertions.
4. Update LO-WRITER-0103 mapping and Writer selection documentation, run focused fast checks plus the target Playwright scenario, and record the approved deferred full-suite cadence.

## Verify Steps

1. Run `npm run test:coverage`. Expected: all office tests pass at 100 percent coverage, including Ctrl/Cmd+A routing, cross-paragraph selection serialization, and existing copy behavior.
2. Run `npm run test:e2e -- --grep "document-wide selection"`. Expected: production Chromium confirms Ctrl/Cmd+A selects all Writer paragraphs and pointer drag selection crosses from the leading into the following paragraph.
3. Run `npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`. Expected: LO-WRITER-0103 resolves the changed source, tests, and documentation evidence.
4. Run `npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs`. Expected: all pass.
5. Defer aggregate `npm run verify`, static smoke, inventory coverage, and the full Playwright matrix under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-11T15:21:08.589Z — VERIFY — ok

By: REVIEWER

Note: Verified: Writer keyboard selection, pointer drags in both directions, caret restoration, and cross-paragraph boundary arrows pass coverage, production E2E, parity, and static checks.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T15:21:07.860Z, excerpt_hash=sha256:eb83a0c10186f25886aef8ff7f00b04ff7963977e5249d13939b3ea659e771e5

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111452-85TPWW/blueprint/resolved-snapshot.json
- old_digest: cf5f3d659b100d4681a70623a50e8f04abbb2dbb19b84ea74d19bc2361ca8681
- current_digest: cf5f3d659b100d4681a70623a50e8f04abbb2dbb19b84ea74d19bc2361ca8681
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608111452-85TPWW

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608111452-85TPWW
- diagnostic_command: agentplane task run status 202608111452-85TPWW
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert the task-scoped commit(s).
- Re-run coverage and the focused document-wide selection E2E scenario to confirm that normal Writer editing and Copy behavior are restored.

## Findings

Command: npm run test:coverage
Result: pass
Evidence: 21 test files and 63 tests passed with 100 percent statements, branches, functions, and lines.
Scope: Ctrl/Cmd+A, caret restoration after input and paragraph joins, and boundary arrow transitions.

Command: npm run test:e2e -- --grep "document-wide selection"
Result: pass
Evidence: production Chromium verifies Enter focus, Ctrl+A, and pointer drags in both paragraph directions.

Command: npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference
Result: pass
Evidence: LO-WRITER-0103 source, test, and documentation evidence resolves with zero exceptions.

Command: format, lint, typecheck, JSDoc, file-size, diff, doctor, routing
Result: pass
Evidence: JSDoc validates 126 authored source files. WriterPlainTextEditor.tsx is a 517-line decomposition candidate; no file exceeds the mandatory 1000-line limit.

Deferred: aggregate npm run verify, static smoke, inventory coverage, and full browser matrix.
Reason: user-approved ten-task cadence.
Risk: exact partial text selection across separate browser contenteditable hosts is not available natively; the implemented cross-paragraph drag selects each crossed paragraph completely, while partial native selection remains available inside one paragraph.

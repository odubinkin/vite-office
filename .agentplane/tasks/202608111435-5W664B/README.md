---
id: "202608111435-5W664B"
title: "Preserve formatted Writer selections on copy"
result_summary: "Implemented and verified sanitized native Copy output with paired rich HTML and plain text."
status: "DONE"
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
  updated_at: "2026-08-11T14:35:22.457Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-11T14:48:40.084Z"
  updated_by: "REVIEWER"
  note: "Verified: Writer menu, toolbar, and native Ctrl/Cmd copy emit sanitized visible plain text and bounded rich HTML; coverage, production E2E, parity inventory, and static checks pass."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-11T14:48:40.539Z"
  updated_by: "EVALUATOR"
  note: "Clipboard behavior now preserves modeled paragraph formatting without leaking accessibility-only style descriptions."
  evaluated_sha: "f73b02aee23e6a254a6fceb4901d313ddb1714e7"
  blueprint_digest: "143ad6092c0ebeae0441c65669f2a1e3d2cb7febef2397524a84336b83cd9589"
  evidence_refs:
    - ".agentplane/tasks/202608111435-5W664B/README.md"
    - ".agentplane/tasks/202608111435-5W664B/quality/20260811-144840539-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608111435-5W664B/quality/20260811-144840539-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608111435-5W664B/quality/20260811-144840539-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608111435-5W664B/blueprint/resolved-snapshot.json"
    - "f73b02a; npm run test:coverage; npm run test:e2e; npm run inventory:parity; format/lint/typecheck/JSDoc/file-size/diff/doctor/routing"
  findings:
    - "Native Writer copy overrides default DOM serialization with visible paragraph-only text/plain and text/html; a Heading 1 uses Heading 1 styling rather than Default Paragraph Style."
commit:
  hash: "f73b02aee23e6a254a6fceb4901d313ddb1714e7"
  message: "✨ 5W664B code: preserve Writer copy formatting"
comments:
  -
    author: "CODER"
    body: "Start: fix Writer copy payload fidelity and preserve bounded paragraph formatting."
  -
    author: "CODER"
    body: "Verified: native Writer copy now serializes only visible selected paragraphs, preserving modeled Heading 1 and alignment formatting without accessibility-only paragraph-style labels."
events:
  -
    type: "status"
    at: "2026-08-11T14:35:22.869Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: fix Writer copy payload fidelity and preserve bounded paragraph formatting."
  -
    type: "verify"
    at: "2026-08-11T14:48:40.084Z"
    author: "REVIEWER"
    state: "ok"
    note: "Verified: Writer menu, toolbar, and native Ctrl/Cmd copy emit sanitized visible plain text and bounded rich HTML; coverage, production E2E, parity inventory, and static checks pass."
  -
    type: "status"
    at: "2026-08-11T14:48:53.476Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native Writer copy now serializes only visible selected paragraphs, preserving modeled Heading 1 and alignment formatting without accessibility-only paragraph-style labels."
doc_version: 3
doc_updated_at: "2026-08-11T14:48:53.478Z"
doc_updated_by: "CODER"
description: "Fix Writer clipboard copy so hidden accessibility descriptions never enter plain text and supported browsers receive sanitized rich HTML with bounded paragraph alignment and style when copying into another editor."
sections:
  Summary: |-
    Preserve formatted Writer selections on copy

    Fix Writer clipboard copy so hidden accessibility descriptions never enter plain text and supported browsers receive sanitized rich HTML with bounded paragraph alignment and style when copying into another editor.
  Scope: |-
    - In scope: Fix Writer clipboard copy so hidden accessibility descriptions never enter plain text and supported browsers receive sanitized rich HTML with bounded paragraph alignment and style when copying into another editor.
    - Out of scope: unrelated refactors not required for "Preserve formatted Writer selections on copy".
  Plan: |-
    1. Keep the bounded work within LO-WRITER-0103: inspect the pinned .uno:Copy menu and toolbar placement plus its Copy/Paste regression coverage, without claiming rich-document parity beyond the local paragraph model.
    2. Replace raw Selection.toString clipboard handling with a Writer-specific sanitized selection payload that excludes accessibility-only descriptions and exposes visible plain text plus inline HTML paragraphs carrying bounded alignment and Heading 1 styling.
    3. Prefer ClipboardItem text/html plus text/plain in supported browsers and retain correct text/plain fallback behavior when rich clipboard write is unavailable or rejected.
    4. Wire the existing Edit Copy and standard-toolbar Copy commands to the new behavior without adding non-Writer UI controls.
    5. Add unit, UI, targeted Chromium E2E, parity-manifest, and documentation evidence. Run fast coverage and targeted E2E plus static checks; defer aggregate verify under the user-approved ten-task cadence.
  Verify Steps: |-
    1. Run `npm run test:coverage`. Expected: all office tests pass at 100 percent coverage, including sanitized selection extraction, rich ClipboardItem payloads, plain-text fallback, and the Writer Copy menu/toolbar outcomes.
    2. Run `npm run test:e2e`. Expected: the production Writer flow continues to copy selected visible text without exposing accessibility-only descriptions and retains its bounded formatting behavior.
    3. Run `npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`. Expected: LO-WRITER-0103 resolves its updated source, tests, and documentation evidence at the pinned baseline.
    4. Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run check:docs`, `npm run check:file-size`, `git diff --check`, `ap doctor`, and `node .agentplane/policy/check-routing.mjs`. Expected: all pass.
    5. Defer aggregate `npm run verify`, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-11T14:48:40.084Z — VERIFY — ok

    By: REVIEWER

    Note: Verified: Writer menu, toolbar, and native Ctrl/Cmd copy emit sanitized visible plain text and bounded rich HTML; coverage, production E2E, parity inventory, and static checks pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T14:48:32.748Z, excerpt_hash=sha256:019cb95c735a048c35ca32d36278b1cb29e02f0c9846f68e69e209d77c9c4459

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111435-5W664B/blueprint/resolved-snapshot.json
    - old_digest: 143ad6092c0ebeae0441c65669f2a1e3d2cb7febef2397524a84336b83cd9589
    - current_digest: 143ad6092c0ebeae0441c65669f2a1e3d2cb7febef2397524a84336b83cd9589
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608111435-5W664B

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608111435-5W664B
    - diagnostic_command: agentplane task run status 202608111435-5W664B
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    Command: npm run test:coverage
    Result: pass
    Evidence: 21 test files and 62 tests passed with 100% statements (570/570), branches (332/332), functions (185/185), and lines (529/529).
    Scope: unit coverage includes bounded Writer selection serialization, native copy-event handling, rich ClipboardItem payloads, and plain-text fallback.

    Command: npm run test:e2e
    Result: pass
    Evidence: 2 production Playwright scenarios passed, including the Writer native copy event assertion for sanitized text/plain and formatted text/html output.
    Scope: verifies a Heading 1 centered paragraph copies without accessibility-only paragraph-style descriptions.

    Command: npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference
    Result: pass
    Evidence: pinned LibreOffice baseline mapping resolved with zero exceptions; LO-WRITER-0103 source, test, and documentation markers resolve.

    Command: npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs
    Result: pass
    Evidence: JSDoc validation covers 125 authored source files; policy routing passed. File-size review reported only the pre-existing 536-line scripts/libreoffice-inventory/contracts.ts candidate.

    Command: git commit -m "✨ 5W664B code: preserve Writer copy formatting"
    Result: pass
    Evidence: f73b02aee23e6a254a6fceb4901d313ddb1714e7

    Deferred verification: aggregate npm run verify, static smoke, inventory coverage, and full browser matrix.
    Reason: user-approved cadence runs full checks after each ten closed feature tasks.
    Residual risk: headless Chromium cannot deterministically validate a system clipboard paste into a separate editor; the production E2E dispatches a real ClipboardEvent with DataTransfer and asserts both MIME payloads, while unit tests cover ClipboardItem and fallback behavior.
id_source: "generated"
---
## Summary

Preserve formatted Writer selections on copy

Fix Writer clipboard copy so hidden accessibility descriptions never enter plain text and supported browsers receive sanitized rich HTML with bounded paragraph alignment and style when copying into another editor.

## Scope

- In scope: Fix Writer clipboard copy so hidden accessibility descriptions never enter plain text and supported browsers receive sanitized rich HTML with bounded paragraph alignment and style when copying into another editor.
- Out of scope: unrelated refactors not required for "Preserve formatted Writer selections on copy".

## Plan

1. Keep the bounded work within LO-WRITER-0103: inspect the pinned .uno:Copy menu and toolbar placement plus its Copy/Paste regression coverage, without claiming rich-document parity beyond the local paragraph model.
2. Replace raw Selection.toString clipboard handling with a Writer-specific sanitized selection payload that excludes accessibility-only descriptions and exposes visible plain text plus inline HTML paragraphs carrying bounded alignment and Heading 1 styling.
3. Prefer ClipboardItem text/html plus text/plain in supported browsers and retain correct text/plain fallback behavior when rich clipboard write is unavailable or rejected.
4. Wire the existing Edit Copy and standard-toolbar Copy commands to the new behavior without adding non-Writer UI controls.
5. Add unit, UI, targeted Chromium E2E, parity-manifest, and documentation evidence. Run fast coverage and targeted E2E plus static checks; defer aggregate verify under the user-approved ten-task cadence.

## Verify Steps

1. Run `npm run test:coverage`. Expected: all office tests pass at 100 percent coverage, including sanitized selection extraction, rich ClipboardItem payloads, plain-text fallback, and the Writer Copy menu/toolbar outcomes.
2. Run `npm run test:e2e`. Expected: the production Writer flow continues to copy selected visible text without exposing accessibility-only descriptions and retains its bounded formatting behavior.
3. Run `npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`. Expected: LO-WRITER-0103 resolves its updated source, tests, and documentation evidence at the pinned baseline.
4. Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run check:docs`, `npm run check:file-size`, `git diff --check`, `ap doctor`, and `node .agentplane/policy/check-routing.mjs`. Expected: all pass.
5. Defer aggregate `npm run verify`, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-11T14:48:40.084Z — VERIFY — ok

By: REVIEWER

Note: Verified: Writer menu, toolbar, and native Ctrl/Cmd copy emit sanitized visible plain text and bounded rich HTML; coverage, production E2E, parity inventory, and static checks pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T14:48:32.748Z, excerpt_hash=sha256:019cb95c735a048c35ca32d36278b1cb29e02f0c9846f68e69e209d77c9c4459

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111435-5W664B/blueprint/resolved-snapshot.json
- old_digest: 143ad6092c0ebeae0441c65669f2a1e3d2cb7febef2397524a84336b83cd9589
- current_digest: 143ad6092c0ebeae0441c65669f2a1e3d2cb7febef2397524a84336b83cd9589
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608111435-5W664B

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608111435-5W664B
- diagnostic_command: agentplane task run status 202608111435-5W664B
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Command: npm run test:coverage
Result: pass
Evidence: 21 test files and 62 tests passed with 100% statements (570/570), branches (332/332), functions (185/185), and lines (529/529).
Scope: unit coverage includes bounded Writer selection serialization, native copy-event handling, rich ClipboardItem payloads, and plain-text fallback.

Command: npm run test:e2e
Result: pass
Evidence: 2 production Playwright scenarios passed, including the Writer native copy event assertion for sanitized text/plain and formatted text/html output.
Scope: verifies a Heading 1 centered paragraph copies without accessibility-only paragraph-style descriptions.

Command: npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference
Result: pass
Evidence: pinned LibreOffice baseline mapping resolved with zero exceptions; LO-WRITER-0103 source, test, and documentation markers resolve.

Command: npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: JSDoc validation covers 125 authored source files; policy routing passed. File-size review reported only the pre-existing 536-line scripts/libreoffice-inventory/contracts.ts candidate.

Command: git commit -m "✨ 5W664B code: preserve Writer copy formatting"
Result: pass
Evidence: f73b02aee23e6a254a6fceb4901d313ddb1714e7

Deferred verification: aggregate npm run verify, static smoke, inventory coverage, and full browser matrix.
Reason: user-approved cadence runs full checks after each ten closed feature tasks.
Residual risk: headless Chromium cannot deterministically validate a system clipboard paste into a separate editor; the production E2E dispatches a real ClipboardEvent with DataTransfer and asserts both MIME payloads, while unit tests cover ClipboardItem and fallback behavior.

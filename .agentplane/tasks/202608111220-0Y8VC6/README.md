---
id: "202608111220-0Y8VC6"
title: "Implement Writer paragraph reordering"
result_summary: "Writer paragraph reordering verified."
risk_level: "low"
status: "DONE"
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
  updated_at: "2026-08-11T12:20:42.517Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-11T12:27:32.196Z"
  updated_by: "REVIEWER"
  note: "Verified: Writer can move one paragraph adjacent up or down while retaining paragraph identity, text, alignment, and style. First/last controls enforce boundaries, the moved paragraph remains active, history restores order, and browser-local snapshots retain the body order. Passed Prettier, lint, typecheck, JSDoc (109 files), file-size review, diff check, 50 focused app tests at 100% coverage, and targeted production Playwright plus axe. Static smoke, inventory, and full aggregation remain deferred under the user-approved every-ten-tasks cadence; targeted Playwright built production assets."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-11T12:27:42.274Z"
  updated_by: "EVALUATOR"
  note: "The Writer reordering slice implements a bounded immutable adjacent-paragraph move that preserves complete paragraph state and uses the durable document-canvas interaction region."
  evaluated_sha: "aaad1b11b055631af1d87f17101b4162bffb8e14"
  blueprint_digest: "fce3a7c19f6d02c9bb0a27c3ba3ce9eeee7c19812d529c691c473651d2122088"
  evidence_refs:
    - ".agentplane/tasks/202608111220-0Y8VC6/README.md"
    - ".agentplane/tasks/202608111220-0Y8VC6/quality/20260811-122742274-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608111220-0Y8VC6/quality/20260811-122742274-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608111220-0Y8VC6/quality/20260811-122742274-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608111220-0Y8VC6/blueprint/resolved-snapshot.json"
    - "Implementation commit aaad1b11b055631af1d87f17101b4162bffb8e14; Prettier, lint, typecheck, JSDoc validation (109 files), file-size review, and diff check passed; 50 focused app tests passed at 100% coverage; targeted production Playwright and axe passed; ap doctor and routing validation passed."
  findings:
    - "No defects found in the approved scope: movement validates direction and bounds, preserves paragraph identity and formatting, retains active focus, participates in history and storage, and is covered by accessibility and production-browser evidence."
commit:
  hash: "837f437596a6f249898285a05ff5dee9566359ce"
  message: "✅ 0Y8VC6 task: record Writer reorder evidence"
comments:
  -
    author: "CODER"
    body: "Start: implementing the approved bounded Writer adjacent-paragraph reordering model, contextual controls, history and storage behavior, provenance documentation, and focused evidence."
  -
    author: "CODER"
    body: "Verified: adjacent Writer paragraph reordering passed strict coverage, production browser accessibility, documentation, and policy checks."
events:
  -
    type: "status"
    at: "2026-08-11T12:20:47.728Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implementing the approved bounded Writer adjacent-paragraph reordering model, contextual controls, history and storage behavior, provenance documentation, and focused evidence."
  -
    type: "verify"
    at: "2026-08-11T12:27:32.196Z"
    author: "REVIEWER"
    state: "ok"
    note: "Verified: Writer can move one paragraph adjacent up or down while retaining paragraph identity, text, alignment, and style. First/last controls enforce boundaries, the moved paragraph remains active, history restores order, and browser-local snapshots retain the body order. Passed Prettier, lint, typecheck, JSDoc (109 files), file-size review, diff check, 50 focused app tests at 100% coverage, and targeted production Playwright plus axe. Static smoke, inventory, and full aggregation remain deferred under the user-approved every-ten-tasks cadence; targeted Playwright built production assets."
  -
    type: "status"
    at: "2026-08-11T12:27:50.542Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: adjacent Writer paragraph reordering passed strict coverage, production browser accessibility, documentation, and policy checks."
doc_version: 3
doc_updated_at: "2026-08-11T12:27:50.544Z"
doc_updated_by: "CODER"
description: "Add a bounded immutable Writer paragraph reordering capability that moves one selected paragraph one position up or down while preserving its text, style, alignment, identity, browser-local persistence, and undo/redo behavior. Expose contextual accessible movement controls in the Writer document canvas and map the narrow operation to pinned Writer MoveParagraph evidence without claiming change tracking, range selection, or layout parity."
sections:
  Summary: |-
    Implement Writer paragraph reordering

    Add a bounded immutable Writer paragraph reordering capability that moves one selected paragraph one position up or down while preserving its text, style, alignment, identity, browser-local persistence, and undo/redo behavior. Expose contextual accessible movement controls in the Writer document canvas and map the narrow operation to pinned Writer MoveParagraph evidence without claiming change tracking, range selection, or layout parity.
  Scope: |-
    - In scope: Add a bounded immutable Writer paragraph reordering capability that moves one selected paragraph one position up or down while preserving its text, style, alignment, identity, browser-local persistence, and undo/redo behavior. Expose contextual accessible movement controls in the Writer document canvas and map the narrow operation to pinned Writer MoveParagraph evidence without claiming change tracking, range selection, or layout parity.
    - Out of scope: unrelated refactors not required for "Implement Writer paragraph reordering".
  Plan: "1. Add a pure Writer-domain transition that moves a named paragraph exactly one adjacent position in the requested direction, preserves all paragraph objects and data, marks a changed document dirty, and rejects absent IDs or out-of-bounds requests. 2. Wire contextual Move paragraph up/down controls into WriterPlainTextEditor; apply movements through immutable history, preserve or deterministically update active focus, and retain the ordering through browser-local save/load. 3. Add domain, storage, React integration, and targeted production-browser accessibility tests for order, boundaries, focus, undo/redo, styles, and alignment retention. 4. Document the bounded feature with pinned MoveParagraph upstream UIWriter provenance and explicit gaps around change tracking, selection, layout, and document formats. 5. Run Prettier, lint, typecheck, JSDoc check, file-size check, focused 100% coverage, targeted Playwright/axe, diff check, AgentPlane doctor, and routing validation. Defer static/inventory/full aggregation under the approved every-ten-tasks cadence and record residual risks."
  Verify Steps: |-
    1. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:file-size, and git diff --check. Expected: all pass; WriterWorkbench remains below the 500-line review threshold after extracting reordering history logic.
    2. Run npm run test:coverage --workspace @vite-office/office. Expected: movement order, identity/format retention, invalid boundary handling, active target, history, storage, and existing application behavior pass at 100% coverage.
    3. Run npm run test:e2e. Expected: production Writer exposes disabled first/last movement boundaries and reorders a paragraph in the accessible document canvas without axe violations.
    4. Run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: required quality gates pass.
    5. Do not run npm run test:static, inventory checks, or npm run verify. Reason: user-approved every-ten-tasks cadence; targeted Playwright performs the production build. Record residual risk.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-11T12:27:32.196Z — VERIFY — ok

    By: REVIEWER

    Note: Verified: Writer can move one paragraph adjacent up or down while retaining paragraph identity, text, alignment, and style. First/last controls enforce boundaries, the moved paragraph remains active, history restores order, and browser-local snapshots retain the body order. Passed Prettier, lint, typecheck, JSDoc (109 files), file-size review, diff check, 50 focused app tests at 100% coverage, and targeted production Playwright plus axe. Static smoke, inventory, and full aggregation remain deferred under the user-approved every-ten-tasks cadence; targeted Playwright built production assets.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T12:25:23.394Z, excerpt_hash=sha256:f53c7fc222cd30cc747977462c4628088c2f016f8d00da50eec765f2dce58f5d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111220-0Y8VC6/blueprint/resolved-snapshot.json
    - old_digest: fce3a7c19f6d02c9bb0a27c3ba3ce9eeee7c19812d529c691c473651d2122088
    - current_digest: fce3a7c19f6d02c9bb0a27c3ba3ce9eeee7c19812d529c691c473651d2122088
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608111220-0Y8VC6

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608111220-0Y8VC6
    - diagnostic_command: agentplane task run status 202608111220-0Y8VC6
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
  Findings: ""
extensions:
  implementation_commit:
    hash: "aaad1b11b055631af1d87f17101b4162bffb8e14"
    message: "✨ 0Y8VC6 code: reorder Writer paragraphs"
id_source: "generated"
---
## Summary

Implement Writer paragraph reordering

Add a bounded immutable Writer paragraph reordering capability that moves one selected paragraph one position up or down while preserving its text, style, alignment, identity, browser-local persistence, and undo/redo behavior. Expose contextual accessible movement controls in the Writer document canvas and map the narrow operation to pinned Writer MoveParagraph evidence without claiming change tracking, range selection, or layout parity.

## Scope

- In scope: Add a bounded immutable Writer paragraph reordering capability that moves one selected paragraph one position up or down while preserving its text, style, alignment, identity, browser-local persistence, and undo/redo behavior. Expose contextual accessible movement controls in the Writer document canvas and map the narrow operation to pinned Writer MoveParagraph evidence without claiming change tracking, range selection, or layout parity.
- Out of scope: unrelated refactors not required for "Implement Writer paragraph reordering".

## Plan

1. Add a pure Writer-domain transition that moves a named paragraph exactly one adjacent position in the requested direction, preserves all paragraph objects and data, marks a changed document dirty, and rejects absent IDs or out-of-bounds requests. 2. Wire contextual Move paragraph up/down controls into WriterPlainTextEditor; apply movements through immutable history, preserve or deterministically update active focus, and retain the ordering through browser-local save/load. 3. Add domain, storage, React integration, and targeted production-browser accessibility tests for order, boundaries, focus, undo/redo, styles, and alignment retention. 4. Document the bounded feature with pinned MoveParagraph upstream UIWriter provenance and explicit gaps around change tracking, selection, layout, and document formats. 5. Run Prettier, lint, typecheck, JSDoc check, file-size check, focused 100% coverage, targeted Playwright/axe, diff check, AgentPlane doctor, and routing validation. Defer static/inventory/full aggregation under the approved every-ten-tasks cadence and record residual risks.

## Verify Steps

1. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:file-size, and git diff --check. Expected: all pass; WriterWorkbench remains below the 500-line review threshold after extracting reordering history logic.
2. Run npm run test:coverage --workspace @vite-office/office. Expected: movement order, identity/format retention, invalid boundary handling, active target, history, storage, and existing application behavior pass at 100% coverage.
3. Run npm run test:e2e. Expected: production Writer exposes disabled first/last movement boundaries and reorders a paragraph in the accessible document canvas without axe violations.
4. Run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: required quality gates pass.
5. Do not run npm run test:static, inventory checks, or npm run verify. Reason: user-approved every-ten-tasks cadence; targeted Playwright performs the production build. Record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-11T12:27:32.196Z — VERIFY — ok

By: REVIEWER

Note: Verified: Writer can move one paragraph adjacent up or down while retaining paragraph identity, text, alignment, and style. First/last controls enforce boundaries, the moved paragraph remains active, history restores order, and browser-local snapshots retain the body order. Passed Prettier, lint, typecheck, JSDoc (109 files), file-size review, diff check, 50 focused app tests at 100% coverage, and targeted production Playwright plus axe. Static smoke, inventory, and full aggregation remain deferred under the user-approved every-ten-tasks cadence; targeted Playwright built production assets.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T12:25:23.394Z, excerpt_hash=sha256:f53c7fc222cd30cc747977462c4628088c2f016f8d00da50eec765f2dce58f5d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111220-0Y8VC6/blueprint/resolved-snapshot.json
- old_digest: fce3a7c19f6d02c9bb0a27c3ba3ce9eeee7c19812d529c691c473651d2122088
- current_digest: fce3a7c19f6d02c9bb0a27c3ba3ce9eeee7c19812d529c691c473651d2122088
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608111220-0Y8VC6

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608111220-0Y8VC6
- diagnostic_command: agentplane task run status 202608111220-0Y8VC6
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

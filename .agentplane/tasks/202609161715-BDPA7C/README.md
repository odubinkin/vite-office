---
id: "202609161715-BDPA7C"
title: "Restore Writer formatting toolbar and paragraph indent parity"
result_summary: "Restored persistent Writer formatting controls and upstream-contextual paragraph indentation with ODT persistence."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 18
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-16T17:19:47.450Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-16T17:35:02.228Z"
  updated_by: "CODER"
  note: "verified-202609161715-BDPA7C"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-16T17:34:32.300Z"
  updated_by: "EVALUATOR"
  note: "Writer toolbar and indent parity implementation passed focused UI, shell, ODT, static, and policy checks."
  evaluated_sha: "330bef55dcc5943df3d15227c3f835c04dd2da21"
  blueprint_digest: "f6dfa777649541818f595a8b52ee74042782e2b44e2cb3a8eda335088cfa3e99"
  evidence_refs:
    - ".agentplane/tasks/202609161715-BDPA7C/README.md"
    - ".agentplane/tasks/202609161715-BDPA7C/quality/20260916-173432300-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609161715-BDPA7C/quality/20260916-173432300-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609161715-BDPA7C/quality/20260916-173432300-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609161715-BDPA7C/blueprint/resolved-snapshot.json"
    - "npm exec --workspace @vite-office/office vitest run src/sw/source/uibase/wrtsh/wrtsh.test.ts src/sw/source/filter/xml/odt-paragraph-indent-roundtrip.test.ts src/sw/browser/presentation/writer-view.test.tsx src/framework/browser/app/desktop.test.tsx src/sw/uiconfig/swriter/menubar/menubar-commands.test.ts src/xmloff/source/text/txtpara.test.ts; npm run format:check; npm run typecheck; npm run check:writer-resources; npm run lint; npm run check:dependencies; npm run check:file-size; ap doctor; node .agentplane/policy/check-routing.mjs"
  findings:
    - "The persistent text toolbar exposes generic indent controls; they change list levels in lists and direct margins otherwise, and ODT round trips preserve fo:margin-left."
commit:
  hash: "74cc55996dcc55492be08ad7e115d186deba589b"
  message: "🧪 BDPA7C task: record verification quality review"
comments:
  -
    author: "CODER"
    body: "Start: implement upstream-contextual Writer indent commands, persistent toolbar controls, and ODT round-trip coverage."
  -
    author: "CODER"
    body: "Verified: verified-202609161715-BDPA7C. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
  -
    author: "CODER"
    body: "Verified: Writer toolbar retains all text controls, context-sensitive indent commands match upstream behavior, and ODT margins round-trip."
events:
  -
    type: "status"
    at: "2026-09-16T17:19:52.840Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement upstream-contextual Writer indent commands, persistent toolbar controls, and ODT round-trip coverage."
  -
    type: "verify"
    at: "2026-09-16T17:34:07.341Z"
    author: "CODER"
    state: "ok"
    note: "Verified: focused Writer UI, shell, and ODT tests passed; format, typecheck, lint, resource generation, dependency, size, doctor, and routing checks passed."
  -
    type: "verify"
    at: "2026-09-16T17:34:23.521Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609161715-BDPA7C"
  -
    type: "verify"
    at: "2026-09-16T17:34:44.472Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609161715-BDPA7C"
  -
    type: "verify"
    at: "2026-09-16T17:35:02.228Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609161715-BDPA7C"
  -
    type: "status"
    at: "2026-09-16T17:35:02.357Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609161715-BDPA7C. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
  -
    type: "status"
    at: "2026-09-16T17:35:34.382Z"
    author: "CODER"
    from: "DONE"
    to: "DONE"
    note: "Verified: Writer toolbar retains all text controls, context-sensitive indent commands match upstream behavior, and ODT margins round-trip."
doc_version: 3
doc_updated_at: "2026-09-16T17:35:34.384Z"
doc_updated_by: "CODER"
description: "Always render the Writer text and numbering controls, and make Increment/Decrement Level apply upstream-aligned paragraph indentation outside lists while retaining list-level behavior."
sections:
  Summary: "Restore the Writer formatting toolbar and upstream-compatible Increment/Decrement Indent behavior, including ODT persistence."
  Scope: "In scope: generated Writer command resources, formatting-toolbar presentation, context-sensitive indent dispatch, paragraph left-margin model and undo, browser rendering, ODT import/export, and targeted tests. Out of scope: unrelated paragraph spacing, right/first-line indents, and unsupported numbering controls."
  Plan: "Implement .uno:IncrementIndent and .uno:DecrementIndent from the pinned textobjectbar. Keep the complete text formatting controls visible regardless of list context. Follow sw/source/uibase/shells/textsh1.cxx: list paragraphs change numbering level, non-list paragraphs use MoveLeftMargin semantics. Persist the direct left margin through the ODT automatic-style pipeline and cover both import and export."
  Verify Steps: "1. Run focused Vitest suites for Writer formatting toolbar, command dispatch/model undo, and ODT XML round trips; expect generic indent controls to be present for list and non-list contexts, list levels to change only in lists, ordinary paragraph margins to change and undo, and ODT round trips to preserve the margin. 2. Run npm run check:writer-resources, npm run typecheck, and npm run lint; expect success. 3. Run agentplane doctor and node .agentplane/policy/check-routing.mjs; expect success. 4. Inspect git diff and git status --short --untracked-files=all; expect only task-scoped changes."
  Verification: |-
    Pending approved implementation and execution of the listed checks.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-16T17:34:07.341Z — VERIFY — ok

    By: CODER

    Note: Verified: focused Writer UI, shell, and ODT tests passed; format, typecheck, lint, resource generation, dependency, size, doctor, and routing checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T17:19:52.840Z, excerpt_hash=sha256:b84ff4dcede1e2a391b9a18fb0f123bacd40b6e4d132d3ef9dc390a5b2c93933

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609161715-BDPA7C/blueprint/resolved-snapshot.json
    - old_digest: f6dfa777649541818f595a8b52ee74042782e2b44e2cb3a8eda335088cfa3e99
    - current_digest: f6dfa777649541818f595a8b52ee74042782e2b44e2cb3a8eda335088cfa3e99
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609161715-BDPA7C

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609161715-BDPA7C
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-16T17:34:23.521Z — VERIFY — ok

    By: CODER

    Note: verified-202609161715-BDPA7C
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T17:34:07.395Z, excerpt_hash=sha256:b84ff4dcede1e2a391b9a18fb0f123bacd40b6e4d132d3ef9dc390a5b2c93933

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609161715-BDPA7C/blueprint/resolved-snapshot.json
    - old_digest: f6dfa777649541818f595a8b52ee74042782e2b44e2cb3a8eda335088cfa3e99
    - current_digest: f6dfa777649541818f595a8b52ee74042782e2b44e2cb3a8eda335088cfa3e99
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609161715-BDPA7C

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609161715-BDPA7C --result verified-202609161715-BDPA7C --commit 330bef55dcc5943df3d15227c3f835c04dd2da21
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-16T17:34:44.472Z — VERIFY — ok

    By: CODER

    Note: verified-202609161715-BDPA7C
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T17:34:23.576Z, excerpt_hash=sha256:b84ff4dcede1e2a391b9a18fb0f123bacd40b6e4d132d3ef9dc390a5b2c93933

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609161715-BDPA7C/blueprint/resolved-snapshot.json
    - old_digest: f6dfa777649541818f595a8b52ee74042782e2b44e2cb3a8eda335088cfa3e99
    - current_digest: f6dfa777649541818f595a8b52ee74042782e2b44e2cb3a8eda335088cfa3e99
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609161715-BDPA7C

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609161715-BDPA7C --result verified-202609161715-BDPA7C --commit 330bef55dcc5943df3d15227c3f835c04dd2da21
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-16T17:35:02.228Z — VERIFY — ok

    By: CODER

    Note: verified-202609161715-BDPA7C
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T17:34:44.524Z, excerpt_hash=sha256:b84ff4dcede1e2a391b9a18fb0f123bacd40b6e4d132d3ef9dc390a5b2c93933

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609161715-BDPA7C/blueprint/resolved-snapshot.json
    - old_digest: f6dfa777649541818f595a8b52ee74042782e2b44e2cb3a8eda335088cfa3e99
    - current_digest: f6dfa777649541818f595a8b52ee74042782e2b44e2cb3a8eda335088cfa3e99
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609161715-BDPA7C

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609161715-BDPA7C --result verified-202609161715-BDPA7C --commit 74cc55996dcc55492be08ad7e115d186deba589b
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the task-scoped commit to restore prior toolbar selection and paragraph serialization behavior."
  Findings: "Upstream evidence: sw/source/uibase/shells/textsh1.cxx dispatches SID_INC_INDENT and SID_DEC_INDENT to NumUpDown for list paragraphs and MoveLeftMargin otherwise. The existing local upstream-ODT fixture pattern is odt-hyperlink-roundtrip.test.ts; a matching margin fixture will be added only if a pinned upstream ODT with the required direct indent can be identified."
extensions:
  implementation_commit:
    hash: "330bef55dcc5943df3d15227c3f835c04dd2da21"
    message: "🧩 BDPA7C task: implement Writer indent toolbar parity"
id_source: "generated"
---
## Summary

Restore the Writer formatting toolbar and upstream-compatible Increment/Decrement Indent behavior, including ODT persistence.

## Scope

In scope: generated Writer command resources, formatting-toolbar presentation, context-sensitive indent dispatch, paragraph left-margin model and undo, browser rendering, ODT import/export, and targeted tests. Out of scope: unrelated paragraph spacing, right/first-line indents, and unsupported numbering controls.

## Plan

Implement .uno:IncrementIndent and .uno:DecrementIndent from the pinned textobjectbar. Keep the complete text formatting controls visible regardless of list context. Follow sw/source/uibase/shells/textsh1.cxx: list paragraphs change numbering level, non-list paragraphs use MoveLeftMargin semantics. Persist the direct left margin through the ODT automatic-style pipeline and cover both import and export.

## Verify Steps

1. Run focused Vitest suites for Writer formatting toolbar, command dispatch/model undo, and ODT XML round trips; expect generic indent controls to be present for list and non-list contexts, list levels to change only in lists, ordinary paragraph margins to change and undo, and ODT round trips to preserve the margin. 2. Run npm run check:writer-resources, npm run typecheck, and npm run lint; expect success. 3. Run agentplane doctor and node .agentplane/policy/check-routing.mjs; expect success. 4. Inspect git diff and git status --short --untracked-files=all; expect only task-scoped changes.

## Verification

Pending approved implementation and execution of the listed checks.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-16T17:34:07.341Z — VERIFY — ok

By: CODER

Note: Verified: focused Writer UI, shell, and ODT tests passed; format, typecheck, lint, resource generation, dependency, size, doctor, and routing checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T17:19:52.840Z, excerpt_hash=sha256:b84ff4dcede1e2a391b9a18fb0f123bacd40b6e4d132d3ef9dc390a5b2c93933

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609161715-BDPA7C/blueprint/resolved-snapshot.json
- old_digest: f6dfa777649541818f595a8b52ee74042782e2b44e2cb3a8eda335088cfa3e99
- current_digest: f6dfa777649541818f595a8b52ee74042782e2b44e2cb3a8eda335088cfa3e99
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609161715-BDPA7C

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609161715-BDPA7C
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-16T17:34:23.521Z — VERIFY — ok

By: CODER

Note: verified-202609161715-BDPA7C
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T17:34:07.395Z, excerpt_hash=sha256:b84ff4dcede1e2a391b9a18fb0f123bacd40b6e4d132d3ef9dc390a5b2c93933

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609161715-BDPA7C/blueprint/resolved-snapshot.json
- old_digest: f6dfa777649541818f595a8b52ee74042782e2b44e2cb3a8eda335088cfa3e99
- current_digest: f6dfa777649541818f595a8b52ee74042782e2b44e2cb3a8eda335088cfa3e99
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609161715-BDPA7C

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609161715-BDPA7C --result verified-202609161715-BDPA7C --commit 330bef55dcc5943df3d15227c3f835c04dd2da21
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-16T17:34:44.472Z — VERIFY — ok

By: CODER

Note: verified-202609161715-BDPA7C
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T17:34:23.576Z, excerpt_hash=sha256:b84ff4dcede1e2a391b9a18fb0f123bacd40b6e4d132d3ef9dc390a5b2c93933

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609161715-BDPA7C/blueprint/resolved-snapshot.json
- old_digest: f6dfa777649541818f595a8b52ee74042782e2b44e2cb3a8eda335088cfa3e99
- current_digest: f6dfa777649541818f595a8b52ee74042782e2b44e2cb3a8eda335088cfa3e99
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609161715-BDPA7C

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609161715-BDPA7C --result verified-202609161715-BDPA7C --commit 330bef55dcc5943df3d15227c3f835c04dd2da21
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-16T17:35:02.228Z — VERIFY — ok

By: CODER

Note: verified-202609161715-BDPA7C
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T17:34:44.524Z, excerpt_hash=sha256:b84ff4dcede1e2a391b9a18fb0f123bacd40b6e4d132d3ef9dc390a5b2c93933

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609161715-BDPA7C/blueprint/resolved-snapshot.json
- old_digest: f6dfa777649541818f595a8b52ee74042782e2b44e2cb3a8eda335088cfa3e99
- current_digest: f6dfa777649541818f595a8b52ee74042782e2b44e2cb3a8eda335088cfa3e99
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609161715-BDPA7C

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609161715-BDPA7C --result verified-202609161715-BDPA7C --commit 74cc55996dcc55492be08ad7e115d186deba589b
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the task-scoped commit to restore prior toolbar selection and paragraph serialization behavior.

## Findings

Upstream evidence: sw/source/uibase/shells/textsh1.cxx dispatches SID_INC_INDENT and SID_DEC_INDENT to NumUpDown for list paragraphs and MoveLeftMargin otherwise. The existing local upstream-ODT fixture pattern is odt-hyperlink-roundtrip.test.ts; a matching margin fixture will be added only if a pinned upstream ODT with the required direct indent can be identified.

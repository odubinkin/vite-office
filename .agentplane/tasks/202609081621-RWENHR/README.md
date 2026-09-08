---
id: "202609081621-RWENHR"
title: "Align Writer core with LibreOffice document model"
result_summary: "verified-202609081621-RWENHR"
status: "DONE"
priority: "high"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-08T16:22:30.507Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-08T17:19:57.763Z"
  updated_by: "CODER"
  note: "verified-202609081621-RWENHR"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-08T17:19:29.304Z"
  updated_by: "EVALUATOR"
  note: "The bounded Writer core realignment preserves the pinned LibreOffice ownership and range model, migrates legacy snapshots, and retains all implemented browser behavior."
  evaluated_sha: "6e1fd9f89fa8050f3f198bf8e1edb0698d76e794"
  blueprint_digest: "4a8845316a1b9a3a5f1c7830837685a09744eff54e779232908b775c287c5df4"
  evidence_refs:
    - ".agentplane/tasks/202609081621-RWENHR/README.md"
    - ".agentplane/tasks/202609081621-RWENHR/quality/20260908-171929304-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609081621-RWENHR/quality/20260908-171929304-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609081621-RWENHR/quality/20260908-171929304-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609081621-RWENHR/blueprint/resolved-snapshot.json"
    - "npm run verify: 110 office tests and 74 inventory tests at 100% coverage; 7 Playwright tests; build/static/JSDoc/file-size gates passed"
    - "npm run check:source-provenance && npm run check:source-tree"
    - "apps/office/src/sw/source/core/doc/writer-model.test.ts"
    - "docs/program/parity/writer-command-slice.json#LO-WRITER-0111"
  findings:
    - "SwDoc owns SwNodes; fixed section sentinel ordering, SwTextNode ownership, SwPosition/SwPaM direction, and SwTextAttr/SwpHints normalization are directly tested."
    - "React and clipboard runs are derived projections, while persistence uses an explicit cycle-free versioned snapshot with legacy migration."
commit:
  hash: "6e1fd9f89fa8050f3f198bf8e1edb0698d76e794"
  message: "🧩 RWENHR code: align Writer core document model"
comments:
  -
    author: "CODER"
    body: "Start: rebase canonical Writer state on the pinned LibreOffice node, position, selection, and text-attribute model while preserving browser behavior."
  -
    author: "CODER"
    body: "Verified: verified-202609081621-RWENHR. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-08T16:22:46.708Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: rebase canonical Writer state on the pinned LibreOffice node, position, selection, and text-attribute model while preserving browser behavior."
  -
    type: "verify"
    at: "2026-09-08T17:18:35.441Z"
    author: "CODER"
    state: "ok"
    note: "Verified: SwDoc owns SwNodes with fixed sections; SwTextNode owns text and SwpHints; SwPosition/SwPaM operations, legacy migration, and existing Writer behavior pass 110 tests at 100% coverage. Inventory passes 74 tests at 100%, 7 Playwright scenarios pass, source provenance/tree, static build, JSDoc, file size, Agentplane doctor, routing, and diff checks pass."
  -
    type: "verify"
    at: "2026-09-08T17:18:51.784Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609081621-RWENHR"
  -
    type: "verify"
    at: "2026-09-08T17:19:57.763Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609081621-RWENHR"
  -
    type: "status"
    at: "2026-09-08T17:19:57.912Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609081621-RWENHR. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-09-08T17:19:57.913Z"
doc_updated_by: "CODER"
description: "Replace the paragraph-array/run DTO as Writer's canonical state with a TypeScript reimplementation of the pinned LibreOffice SwDoc, SwNodes, SwNode/SwTextNode, SwPosition/SwPaM, and text-attribute model; migrate existing Writer behavior and browser projections without treating React state as the document model."
sections:
  Summary: "Rebase the implemented Writer vertical slice on a TypeScript object model that preserves the pinned LibreOffice Writer core entities, ownership relationships, ordering invariants, positions, selections, and range attributes. Browser rendering remains an adapter over the core model."
  Scope: |-
    In scope:
    - Replace WriterDocument.paragraphs and WriterTextRun as canonical document storage with SwDoc-owned SwNodes and SwTextNode content.
    - Implement the bounded TypeScript counterparts of SwNode/SwStartNode/SwEndNode, SwNodes, SwTextNode, SwTextAttr/SwpHints, SwPosition, and SwPaM needed by all currently implemented Writer behavior.
    - Represent bold, italic, underline, paragraph alignment/style, and list metadata through LibreOffice-shaped item and hint boundaries rather than view-ready runs.
    - Route insertion, deletion, split/join, direct formatting, list changes, clipboard preparation, undo snapshots, persistence, and React rendering through the new model or explicit read-only projections.
    - Migrate legacy browser snapshots and preserve all currently implemented Writer behavior.
    - Update tests, architecture documentation, source-tree mapping, source provenance, and parity evidence.
    Expected code scope: apps/office/src/sw/source/core/**, the Writer uibase consumers under apps/office/src/sw/source/uibase/**, Writer storage/history integration under apps/office/src/framework/source/services/desktop.tsx, and directly corresponding tests/docs/provenance records.
    Out of scope for this task: layout frames/pagination, tables, fields, redlines, complete SfxItemPool inheritance, ODT/DOCX filters, and unrelated suite work. These remain required by the persistent program goal and are not declared browser exceptions.
  Plan: |-
    1. Port the bounded Writer document graph from pinned doc.hxx/docnew.cxx, ndarr.hxx/nodes.cxx, node.hxx, ndtxt.hxx/ndtxt.cxx, pam.hxx/pam.cxx, txatbase.cxx, and ndhints.cxx into TypeScript entities with matching ownership and ordering invariants.
    2. Implement range-aware content and attribute algorithms on SwPosition/SwPaM, including hint adjustment for insertion, deletion, split, join, and direct formatting.
    3. Migrate existing list, paragraph, clipboard, command-shell, undo, persistence, and React view paths so SwDoc is canonical and view-ready paragraphs/runs are derived projections only.
    4. Add backward snapshot migration plus focused invariant and behavioral regression tests.
    5. Update architecture, source provenance/tree, and Writer parity evidence to describe the real model and explicitly retain remaining compatibility debt.
    6. Run task verification, record exact evidence, and finish through the direct Agentplane route.
  Verify Steps: |-
    1. Inspect the canonical Writer types and search their consumers. Expected: runtime document state is owned by SwDoc/SwNodes; no canonical state interface stores paragraphs[] or view-ready runs[].
    2. Run focused Vitest coverage for every changed Writer core and uibase test. Expected: node sentinels/order, SwPosition and SwPaM ordering/direction, hint normalization/adjustment, editing, formatting, lists, clipboard, history, and storage migration all pass.
    3. Run npm run check:source-provenance and npm run check:source-tree. Expected: every added mapped source has a pinned LibreOffice counterpart and all mappings validate.
    4. Run npm run verify. Expected: formatting, lint, TypeScript, unit coverage, inventory coverage, Chromium E2E, static build, JSDoc, and file-size gates all pass.
    5. Run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: Agentplane repository and routing policy checks pass.
    6. Inspect git diff --check and git status --short --untracked-files=all. Expected: no whitespace errors or unintended artifacts; only task-scoped changes remain.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-08T17:18:35.441Z — VERIFY — ok

    By: CODER

    Note: Verified: SwDoc owns SwNodes with fixed sections; SwTextNode owns text and SwpHints; SwPosition/SwPaM operations, legacy migration, and existing Writer behavior pass 110 tests at 100% coverage. Inventory passes 74 tests at 100%, 7 Playwright scenarios pass, source provenance/tree, static build, JSDoc, file size, Agentplane doctor, routing, and diff checks pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-08T16:22:46.708Z, excerpt_hash=sha256:d1973e33fcdb3a073243b3183b385d008f5efc3aa5517ff0879cd886634e49ac

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609081621-RWENHR/blueprint/resolved-snapshot.json
    - old_digest: 4a8845316a1b9a3a5f1c7830837685a09744eff54e779232908b775c287c5df4
    - current_digest: 4a8845316a1b9a3a5f1c7830837685a09744eff54e779232908b775c287c5df4
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609081621-RWENHR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609081621-RWENHR
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-08T17:18:51.784Z — VERIFY — ok

    By: CODER

    Note: verified-202609081621-RWENHR
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-08T17:18:35.524Z, excerpt_hash=sha256:d1973e33fcdb3a073243b3183b385d008f5efc3aa5517ff0879cd886634e49ac

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609081621-RWENHR/blueprint/resolved-snapshot.json
    - old_digest: 4a8845316a1b9a3a5f1c7830837685a09744eff54e779232908b775c287c5df4
    - current_digest: 4a8845316a1b9a3a5f1c7830837685a09744eff54e779232908b775c287c5df4
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609081621-RWENHR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609081621-RWENHR --result verified-202609081621-RWENHR --commit 6e1fd9f89fa8050f3f198bf8e1edb0698d76e794
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-08T17:19:57.763Z — VERIFY — ok

    By: CODER

    Note: verified-202609081621-RWENHR
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-08T17:18:51.870Z, excerpt_hash=sha256:d1973e33fcdb3a073243b3183b385d008f5efc3aa5517ff0879cd886634e49ac

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609081621-RWENHR/blueprint/resolved-snapshot.json
    - old_digest: 4a8845316a1b9a3a5f1c7830837685a09744eff54e779232908b775c287c5df4
    - current_digest: 4a8845316a1b9a3a5f1c7830837685a09744eff54e779232908b775c287c5df4
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609081621-RWENHR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609081621-RWENHR --result verified-202609081621-RWENHR --commit 5173378444498a331d318f312ca692d2fe24bb52
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation and close commits together, restoring the prior paragraph-array model and its storage schema. Re-run npm run verify and the Agentplane routing checks after rollback. Do not delete or rewrite existing browser snapshots; migration code must remain backward-reading until a later explicitly approved schema-retirement task."
  Findings: "Initial audit: the current canonical WriterDocument stores OfficeDocument plus paragraphs[], and each paragraph duplicates visible text with formatting runs[]. The pinned LibreOffice model instead has SwDoc own SwNodes, SwTextNode own OUString text plus SwpHints, selections use SwPosition/SwPaM, and content operations mutate ranges while maintaining registered positions and hints. Therefore incremental UI feature work on the current DTO would deepen architectural divergence; this task first replaces that foundation."
id_source: "generated"
---
## Summary

Rebase the implemented Writer vertical slice on a TypeScript object model that preserves the pinned LibreOffice Writer core entities, ownership relationships, ordering invariants, positions, selections, and range attributes. Browser rendering remains an adapter over the core model.

## Scope

In scope:
- Replace WriterDocument.paragraphs and WriterTextRun as canonical document storage with SwDoc-owned SwNodes and SwTextNode content.
- Implement the bounded TypeScript counterparts of SwNode/SwStartNode/SwEndNode, SwNodes, SwTextNode, SwTextAttr/SwpHints, SwPosition, and SwPaM needed by all currently implemented Writer behavior.
- Represent bold, italic, underline, paragraph alignment/style, and list metadata through LibreOffice-shaped item and hint boundaries rather than view-ready runs.
- Route insertion, deletion, split/join, direct formatting, list changes, clipboard preparation, undo snapshots, persistence, and React rendering through the new model or explicit read-only projections.
- Migrate legacy browser snapshots and preserve all currently implemented Writer behavior.
- Update tests, architecture documentation, source-tree mapping, source provenance, and parity evidence.
Expected code scope: apps/office/src/sw/source/core/**, the Writer uibase consumers under apps/office/src/sw/source/uibase/**, Writer storage/history integration under apps/office/src/framework/source/services/desktop.tsx, and directly corresponding tests/docs/provenance records.
Out of scope for this task: layout frames/pagination, tables, fields, redlines, complete SfxItemPool inheritance, ODT/DOCX filters, and unrelated suite work. These remain required by the persistent program goal and are not declared browser exceptions.

## Plan

1. Port the bounded Writer document graph from pinned doc.hxx/docnew.cxx, ndarr.hxx/nodes.cxx, node.hxx, ndtxt.hxx/ndtxt.cxx, pam.hxx/pam.cxx, txatbase.cxx, and ndhints.cxx into TypeScript entities with matching ownership and ordering invariants.
2. Implement range-aware content and attribute algorithms on SwPosition/SwPaM, including hint adjustment for insertion, deletion, split, join, and direct formatting.
3. Migrate existing list, paragraph, clipboard, command-shell, undo, persistence, and React view paths so SwDoc is canonical and view-ready paragraphs/runs are derived projections only.
4. Add backward snapshot migration plus focused invariant and behavioral regression tests.
5. Update architecture, source provenance/tree, and Writer parity evidence to describe the real model and explicitly retain remaining compatibility debt.
6. Run task verification, record exact evidence, and finish through the direct Agentplane route.

## Verify Steps

1. Inspect the canonical Writer types and search their consumers. Expected: runtime document state is owned by SwDoc/SwNodes; no canonical state interface stores paragraphs[] or view-ready runs[].
2. Run focused Vitest coverage for every changed Writer core and uibase test. Expected: node sentinels/order, SwPosition and SwPaM ordering/direction, hint normalization/adjustment, editing, formatting, lists, clipboard, history, and storage migration all pass.
3. Run npm run check:source-provenance and npm run check:source-tree. Expected: every added mapped source has a pinned LibreOffice counterpart and all mappings validate.
4. Run npm run verify. Expected: formatting, lint, TypeScript, unit coverage, inventory coverage, Chromium E2E, static build, JSDoc, and file-size gates all pass.
5. Run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: Agentplane repository and routing policy checks pass.
6. Inspect git diff --check and git status --short --untracked-files=all. Expected: no whitespace errors or unintended artifacts; only task-scoped changes remain.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-08T17:18:35.441Z — VERIFY — ok

By: CODER

Note: Verified: SwDoc owns SwNodes with fixed sections; SwTextNode owns text and SwpHints; SwPosition/SwPaM operations, legacy migration, and existing Writer behavior pass 110 tests at 100% coverage. Inventory passes 74 tests at 100%, 7 Playwright scenarios pass, source provenance/tree, static build, JSDoc, file size, Agentplane doctor, routing, and diff checks pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-08T16:22:46.708Z, excerpt_hash=sha256:d1973e33fcdb3a073243b3183b385d008f5efc3aa5517ff0879cd886634e49ac

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609081621-RWENHR/blueprint/resolved-snapshot.json
- old_digest: 4a8845316a1b9a3a5f1c7830837685a09744eff54e779232908b775c287c5df4
- current_digest: 4a8845316a1b9a3a5f1c7830837685a09744eff54e779232908b775c287c5df4
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609081621-RWENHR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609081621-RWENHR
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-08T17:18:51.784Z — VERIFY — ok

By: CODER

Note: verified-202609081621-RWENHR
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-08T17:18:35.524Z, excerpt_hash=sha256:d1973e33fcdb3a073243b3183b385d008f5efc3aa5517ff0879cd886634e49ac

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609081621-RWENHR/blueprint/resolved-snapshot.json
- old_digest: 4a8845316a1b9a3a5f1c7830837685a09744eff54e779232908b775c287c5df4
- current_digest: 4a8845316a1b9a3a5f1c7830837685a09744eff54e779232908b775c287c5df4
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609081621-RWENHR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609081621-RWENHR --result verified-202609081621-RWENHR --commit 6e1fd9f89fa8050f3f198bf8e1edb0698d76e794
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-08T17:19:57.763Z — VERIFY — ok

By: CODER

Note: verified-202609081621-RWENHR
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-08T17:18:51.870Z, excerpt_hash=sha256:d1973e33fcdb3a073243b3183b385d008f5efc3aa5517ff0879cd886634e49ac

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609081621-RWENHR/blueprint/resolved-snapshot.json
- old_digest: 4a8845316a1b9a3a5f1c7830837685a09744eff54e779232908b775c287c5df4
- current_digest: 4a8845316a1b9a3a5f1c7830837685a09744eff54e779232908b775c287c5df4
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609081621-RWENHR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609081621-RWENHR --result verified-202609081621-RWENHR --commit 5173378444498a331d318f312ca692d2fe24bb52
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation and close commits together, restoring the prior paragraph-array model and its storage schema. Re-run npm run verify and the Agentplane routing checks after rollback. Do not delete or rewrite existing browser snapshots; migration code must remain backward-reading until a later explicitly approved schema-retirement task.

## Findings

Initial audit: the current canonical WriterDocument stores OfficeDocument plus paragraphs[], and each paragraph duplicates visible text with formatting runs[]. The pinned LibreOffice model instead has SwDoc own SwNodes, SwTextNode own OUString text plus SwpHints, selections use SwPosition/SwPaM, and content operations mutate ranges while maintaining registered positions and hints. Therefore incremental UI feature work on the current DTO would deepen architectural divergence; this task first replaces that foundation.

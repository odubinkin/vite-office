---
id: "202609241017-BHFQF9"
title: "Port tdf114287 ODT print bounds regression"
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
  updated_at: "2026-09-24T10:17:55.792Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-24T10:31:34.338Z"
  updated_by: "CODER"
  note: "Local tdf114287 exact print bounds, numbering and paragraph metrics, ODT export/reopen, worker codec, and browser marker precedence passed; npm run verify passed at 100% coverage and 14 browser tests; ap doctor OK."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-24T10:32:16.030Z"
  updated_by: "EVALUATOR"
  note: "Exact tdf114287 print bounds and ODT roundtrip parity are implemented and verified."
  evaluated_sha: "b6ba7e66c86344d51a3cfe8fec6874929109b357"
  blueprint_digest: "d7c4aff4bae5a44b34c1d6065b2b76dffede014d2f29c683b0d543d705e29925"
  evidence_refs:
    - ".agentplane/tasks/202609241017-BHFQF9/README.md"
    - ".agentplane/tasks/202609241017-BHFQF9/quality/20260924-103216030-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609241017-BHFQF9/quality/20260924-103216030-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609241017-BHFQF9/quality/20260924-103216030-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609241017-BHFQF9/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/filter/xml/odt-layout-parity.test.ts"
    - "apps/office/src/sw/browser/editor/WriterEditableParagraph.test.tsx"
    - "npm run verify"
  findings:
    - "Paragraph and list style precedence yields the upstream bounds for paragraphs 2, 9, and 16; the result survives ODT export, worker graph transfer, and browser projection; full npm run verify passed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement exact ODT list and paragraph print-bound precedence with export/reopen regression."
events:
  -
    type: "status"
    at: "2026-09-24T10:18:01.171Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement exact ODT list and paragraph print-bound precedence with export/reopen regression."
  -
    type: "verify"
    at: "2026-09-24T10:31:34.338Z"
    author: "CODER"
    state: "ok"
    note: "Local tdf114287 exact print bounds, numbering and paragraph metrics, ODT export/reopen, worker codec, and browser marker precedence passed; npm run verify passed at 100% coverage and 14 browser tests; ap doctor OK."
doc_version: 3
doc_updated_at: "2026-09-24T10:31:34.387Z"
doc_updated_by: "CODER"
description: "Implement exact Writer list-versus-paragraph print bounds for the repository-owned tdf114287.odt fixture, including ODT export/reopen parity."
sections:
  Summary: |-
    Port tdf114287 ODT print bounds regression

    Implement exact Writer list-versus-paragraph print bounds for the repository-owned tdf114287.odt fixture, including ODT export/reopen parity.
  Scope: "Port all behavioral assertions from pinned LibreOffice testTdf114287 using the copied local tdf114287.odt: numbering-rule geometry, effective paragraph margins, list-rule identity, exact print bounds for paragraphs 2/9/16, and export/reopen parity. Implementation may touch ODF style import/export, Writer model/layout, browser projection, and focused tests needed for exact behavior."
  Plan: "1. Inspect the local tdf114287.odt style chain and current list geometry projection. 2. Preserve the precedence of paragraph margin and list geometry through import/export/reopen. 3. Add Writer print-bound projection that yields exact upstream twip coordinates for paragraphs 2, 9, and 16; integrate with browser rendering as needed. 4. Add a real local-ODT regression for rule and paragraph properties and print bounds before and after ODT export. 5. Run focused tests and full repository verification, record evidence, and close the task."
  Verify Steps: "1. Load repository-owned apps/office/src/sw/qa/extras/odfexport/data/tdf114287.odt; assert list level 1 FirstLineIndent=-700 and IndentAt=1330 mm100 equivalent, paragraphs 2/9/16 first-line=-1000, left=5001, right=0 mm100 equivalent, and all three use the same numbering rule. 2. Assert exact Writer print bounds in twips: paragraphs 2 and 9 left=2268/right=11339; paragraph 16 left=357/right=11339. Reopen an exported ODT and repeat all assertions. 3. Run focused ODT import/export/layout tests and browser projection tests if touched. 4. Run npm run verify, ap doctor, and git diff --check; record results and any residual limitations. 5. Confirm a clean final tracked state."
  Verification: |-
    Command: npm exec --workspace @vite-office/office -- vitest run src/sw/source/filter/xml/odt-layout-parity.test.ts src/sw/browser/editor/WriterEditableParagraph.test.tsx; Result: pass; Evidence: 21 focused tests passed, including exact 2268/11339 and 357/11339 print bounds before and after ODT export; Scope: layout and browser projection.
    Command: npx vitest run --config scripts/libreoffice-inventory/vitest.config.ts scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts; Result: pass; Evidence: 8 local ODT tests passed without vendor fixture access; Scope: repository-owned ODT corpus.
    Command: npm run verify; Result: pass; Evidence: Writer 105 files/477 tests and inventory 34 files/98 tests at 100% coverage; 14 browser tests; static build, docs, source-tree, provenance, invariants, parity all passed; Scope: complete repository.
    Command: ap doctor; Result: pass; Evidence: doctor OK with pre-existing hook and historical task warnings; Scope: AgentPlane health.
    Command: git diff --check; Result: pass; Evidence: no whitespace errors; Scope: task diff.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T10:31:34.338Z — VERIFY — ok

    By: CODER

    Note: Local tdf114287 exact print bounds, numbering and paragraph metrics, ODT export/reopen, worker codec, and browser marker precedence passed; npm run verify passed at 100% coverage and 14 browser tests; ap doctor OK.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T10:31:34.071Z, excerpt_hash=sha256:320acf22cf5522b9cb629b720a5b6c20ed2834e1344f31394ea3f31a2b199b4b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241017-BHFQF9/blueprint/resolved-snapshot.json
    - old_digest: d7c4aff4bae5a44b34c1d6065b2b76dffede014d2f29c683b0d543d705e29925
    - current_digest: d7c4aff4bae5a44b34c1d6065b2b76dffede014d2f29c683b0d543d705e29925
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241017-BHFQF9

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609241017-BHFQF9
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Port tdf114287 ODT print bounds regression

Implement exact Writer list-versus-paragraph print bounds for the repository-owned tdf114287.odt fixture, including ODT export/reopen parity.

## Scope

Port all behavioral assertions from pinned LibreOffice testTdf114287 using the copied local tdf114287.odt: numbering-rule geometry, effective paragraph margins, list-rule identity, exact print bounds for paragraphs 2/9/16, and export/reopen parity. Implementation may touch ODF style import/export, Writer model/layout, browser projection, and focused tests needed for exact behavior.

## Plan

1. Inspect the local tdf114287.odt style chain and current list geometry projection. 2. Preserve the precedence of paragraph margin and list geometry through import/export/reopen. 3. Add Writer print-bound projection that yields exact upstream twip coordinates for paragraphs 2, 9, and 16; integrate with browser rendering as needed. 4. Add a real local-ODT regression for rule and paragraph properties and print bounds before and after ODT export. 5. Run focused tests and full repository verification, record evidence, and close the task.

## Verify Steps

1. Load repository-owned apps/office/src/sw/qa/extras/odfexport/data/tdf114287.odt; assert list level 1 FirstLineIndent=-700 and IndentAt=1330 mm100 equivalent, paragraphs 2/9/16 first-line=-1000, left=5001, right=0 mm100 equivalent, and all three use the same numbering rule. 2. Assert exact Writer print bounds in twips: paragraphs 2 and 9 left=2268/right=11339; paragraph 16 left=357/right=11339. Reopen an exported ODT and repeat all assertions. 3. Run focused ODT import/export/layout tests and browser projection tests if touched. 4. Run npm run verify, ap doctor, and git diff --check; record results and any residual limitations. 5. Confirm a clean final tracked state.

## Verification

Command: npm exec --workspace @vite-office/office -- vitest run src/sw/source/filter/xml/odt-layout-parity.test.ts src/sw/browser/editor/WriterEditableParagraph.test.tsx; Result: pass; Evidence: 21 focused tests passed, including exact 2268/11339 and 357/11339 print bounds before and after ODT export; Scope: layout and browser projection.
Command: npx vitest run --config scripts/libreoffice-inventory/vitest.config.ts scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts; Result: pass; Evidence: 8 local ODT tests passed without vendor fixture access; Scope: repository-owned ODT corpus.
Command: npm run verify; Result: pass; Evidence: Writer 105 files/477 tests and inventory 34 files/98 tests at 100% coverage; 14 browser tests; static build, docs, source-tree, provenance, invariants, parity all passed; Scope: complete repository.
Command: ap doctor; Result: pass; Evidence: doctor OK with pre-existing hook and historical task warnings; Scope: AgentPlane health.
Command: git diff --check; Result: pass; Evidence: no whitespace errors; Scope: task diff.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T10:31:34.338Z — VERIFY — ok

By: CODER

Note: Local tdf114287 exact print bounds, numbering and paragraph metrics, ODT export/reopen, worker codec, and browser marker precedence passed; npm run verify passed at 100% coverage and 14 browser tests; ap doctor OK.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T10:31:34.071Z, excerpt_hash=sha256:320acf22cf5522b9cb629b720a5b6c20ed2834e1344f31394ea3f31a2b199b4b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241017-BHFQF9/blueprint/resolved-snapshot.json
- old_digest: d7c4aff4bae5a44b34c1d6065b2b76dffede014d2f29c683b0d543d705e29925
- current_digest: d7c4aff4bae5a44b34c1d6065b2b76dffede014d2f29c683b0d543d705e29925
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241017-BHFQF9

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609241017-BHFQF9
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

---
id: "202609301433-Z6WPSC"
title: "Preserve signed Writer paragraph side margins"
result_summary: "Signed side margins retain values through model transfer, ODT and undo/redo; full verification passed."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T14:33:45.489Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-30T14:36:21.329Z"
  updated_by: "CODER"
  note: "verified-202609301433-Z6WPSC"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-30T14:36:13.228Z"
  updated_by: "EVALUATOR"
  note: "The signed side-margin correction matches pinned source semantics and passes focused and full validation."
  evaluated_sha: "d17c8bd23af5f1a452774ee6adc353b6559ad823"
  blueprint_digest: "3c9ea5b71d18c425229c973dcb6570f996b88c75c9c2dc6e11e74f523e45205e"
  evidence_refs:
    - ".agentplane/tasks/202609301433-Z6WPSC/README.md"
    - ".agentplane/tasks/202609301433-Z6WPSC/quality/20260930-143613228-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609301433-Z6WPSC/quality/20260930-143613228-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609301433-Z6WPSC/quality/20260930-143613228-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609301433-Z6WPSC/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202609301433-Z6WPSC/verify.log"
    - "apps/office/src/sw/source/uibase/wrtsh/wrtsh-indent.test.ts"
  findings:
    - "Signed paragraph measures and undo/redo are tested; page margins and intentional product exceptions are unchanged. Runtime inventory evidence remains bounded."
commit:
  hash: "d17c8bd23af5f1a452774ee6adc353b6559ad823"
  message: "🐛 Z6WPSC task: preserve signed Writer paragraph side margins"
comments:
  -
    author: "CODER"
    body: "Start: complete the signed paragraph margin correction under the user-approved iterative upstream audit; preserve fixed browser product decisions."
  -
    author: "CODER"
    body: "Verified: signed paragraph side margins and unsnapped decrease now follow pinned LibreOffice contracts; focused and full checks passed."
events:
  -
    type: "status"
    at: "2026-09-30T14:33:51.088Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: complete the signed paragraph margin correction under the user-approved iterative upstream audit; preserve fixed browser product decisions."
  -
    type: "verify"
    at: "2026-09-30T14:34:57.485Z"
    author: "CODER"
    state: "ok"
    note: "Signed paragraph side margins match pinned setters and ODF mappings; 17 focused tests and full npm run verify passed, including 100% required coverage, browser/static/source/inventory checks. Doctor and routing checks passed."
  -
    type: "verify"
    at: "2026-09-30T14:36:21.329Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609301433-Z6WPSC"
  -
    type: "status"
    at: "2026-09-30T14:36:50.050Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: signed paragraph side margins and unsnapped decrease now follow pinned LibreOffice contracts; focused and full checks passed."
doc_version: 3
doc_updated_at: "2026-09-30T14:36:50.052Z"
doc_updated_by: "CODER"
description: "One upstream parity correction: permit signed text-left and right-margin item values and ODT paragraph measures, preserving the negative result of unsnapped MoveLeftMargin and its undo/redo. User authorized iterative existing-function parity fixes on 2026-09-30. Preserve deliberate recovery, save/open and rendering exceptions."
sections:
  Summary: |-
    Preserve signed Writer paragraph side margins

    One upstream parity correction: permit signed text-left and right-margin item values and ODT paragraph measures, preserving the negative result of unsnapped MoveLeftMargin and its undo/redo. User authorized iterative existing-function parity fixes on 2026-09-30. Preserve deliberate recovery, save/open and rendering exceptions.
  Scope: |-
    - In scope: One upstream parity correction: permit signed text-left and right-margin item values and ODT paragraph measures, preserving the negative result of unsnapped MoveLeftMargin and its undo/redo. User authorized iterative existing-function parity fixes on 2026-09-30. Preserve deliberate recovery, save/open and rendering exceptions.
    - Out of scope: unrelated refactors not required for "Preserve signed Writer paragraph side margins".
  Plan: "1. Compare signed paragraph side-margin setters and ODF property mappings with pinned frmitems.cxx, txtprmap.cxx and docfmt.cxx. 2. Correct only paraitem.ts and xmlstyle.ts signed-value rejection; add item-codec, ODT and unsnapped indent undo/redo assertions in the three existing tests. 3. Append focused runtime inventory evidence without promoting whole-module status. 4. Run npm run verify, ap doctor and routing validation; record evidence and commit only the six implementation/evidence files and this task. This bounded correction is an iteration of approved audit 202609240501-C9TN6M; all product exceptions remain preserved."
  Verify Steps: "1. npm run verify passes all formatting, lint, type, source/provenance, resource, inventory, unit coverage, browser and static-build gates. 2. Signed left/right values survive clone and item-codec transfer; ODT imports and round-trips negative paragraph margins while page margins stay unchanged. 3. An unsnapped decrease from 300 by 720 twips yields -420 and supports undo/redo, following pinned SwDoc::MoveLeftMargin. 4. ap doctor and node .agentplane/policy/check-routing.mjs pass; final task diff is limited to the declared six files and task artifacts, with clean tracked checkout after closure."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-30T14:34:57.485Z — VERIFY — ok

    By: CODER

    Note: Signed paragraph side margins match pinned setters and ODF mappings; 17 focused tests and full npm run verify passed, including 100% required coverage, browser/static/source/inventory checks. Doctor and routing checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T14:34:57.006Z, excerpt_hash=sha256:76731779f440e28da560bb761e9ee61bae38dfd40b811535589df85d0199b09c

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301433-Z6WPSC/blueprint/resolved-snapshot.json
    - old_digest: 3c9ea5b71d18c425229c973dcb6570f996b88c75c9c2dc6e11e74f523e45205e
    - current_digest: 3c9ea5b71d18c425229c973dcb6570f996b88c75c9c2dc6e11e74f523e45205e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609301433-Z6WPSC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202609301433-Z6WPSC -m 🧩 Z6WPSC task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-30T14:36:21.329Z — VERIFY — ok

    By: CODER

    Note: verified-202609301433-Z6WPSC
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T14:34:57.559Z, excerpt_hash=sha256:76731779f440e28da560bb761e9ee61bae38dfd40b811535589df85d0199b09c

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301433-Z6WPSC/blueprint/resolved-snapshot.json
    - old_digest: 3c9ea5b71d18c425229c973dcb6570f996b88c75c9c2dc6e11e74f523e45205e
    - current_digest: 3c9ea5b71d18c425229c973dcb6570f996b88c75c9c2dc6e11e74f523e45205e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609301433-Z6WPSC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609301433-Z6WPSC --result verified-202609301433-Z6WPSC --commit d17c8bd23af5f1a452774ee6adc353b6559ad823
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: "Pinned frmitems.cxx setters accept signed side margins; txtprmap.cxx maps paragraph left/right margins with XML_TYPE_MEASURE; docfmt.cxx subtracts a complete tab distance from a positive indent in unsnapped mode. The former local non-negative guards caused five regression assertions to fail, including an exception for 300 -> -420 twips. Two production guards and two import flags were corrected. Focused command: npm exec --workspace @vite-office/office -- vitest run src/editeng/source/items/textitem.test.ts src/sw/source/uibase/wrtsh/wrtsh-indent.test.ts src/sw/source/filter/xml/odt-paragraph-indent-roundtrip.test.ts. Result: pass, 17/17 assertions. Full command: npm run verify. Result: pass; see verify.log. Scope: signed item values, item codec, ODT round-trip and undo/redo. ap doctor and node .agentplane/policy/check-routing.mjs: pass, with existing unrelated hook-shim and historical close-commit warnings. Remaining combined paraitem.ts source ownership and other style/item operations remain unverified; no whole-module parity promotion. Parent audit 202609240501-C9TN6M remains open."
id_source: "generated"
---
## Summary

Preserve signed Writer paragraph side margins

One upstream parity correction: permit signed text-left and right-margin item values and ODT paragraph measures, preserving the negative result of unsnapped MoveLeftMargin and its undo/redo. User authorized iterative existing-function parity fixes on 2026-09-30. Preserve deliberate recovery, save/open and rendering exceptions.

## Scope

- In scope: One upstream parity correction: permit signed text-left and right-margin item values and ODT paragraph measures, preserving the negative result of unsnapped MoveLeftMargin and its undo/redo. User authorized iterative existing-function parity fixes on 2026-09-30. Preserve deliberate recovery, save/open and rendering exceptions.
- Out of scope: unrelated refactors not required for "Preserve signed Writer paragraph side margins".

## Plan

1. Compare signed paragraph side-margin setters and ODF property mappings with pinned frmitems.cxx, txtprmap.cxx and docfmt.cxx. 2. Correct only paraitem.ts and xmlstyle.ts signed-value rejection; add item-codec, ODT and unsnapped indent undo/redo assertions in the three existing tests. 3. Append focused runtime inventory evidence without promoting whole-module status. 4. Run npm run verify, ap doctor and routing validation; record evidence and commit only the six implementation/evidence files and this task. This bounded correction is an iteration of approved audit 202609240501-C9TN6M; all product exceptions remain preserved.

## Verify Steps

1. npm run verify passes all formatting, lint, type, source/provenance, resource, inventory, unit coverage, browser and static-build gates. 2. Signed left/right values survive clone and item-codec transfer; ODT imports and round-trips negative paragraph margins while page margins stay unchanged. 3. An unsnapped decrease from 300 by 720 twips yields -420 and supports undo/redo, following pinned SwDoc::MoveLeftMargin. 4. ap doctor and node .agentplane/policy/check-routing.mjs pass; final task diff is limited to the declared six files and task artifacts, with clean tracked checkout after closure.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-30T14:34:57.485Z — VERIFY — ok

By: CODER

Note: Signed paragraph side margins match pinned setters and ODF mappings; 17 focused tests and full npm run verify passed, including 100% required coverage, browser/static/source/inventory checks. Doctor and routing checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T14:34:57.006Z, excerpt_hash=sha256:76731779f440e28da560bb761e9ee61bae38dfd40b811535589df85d0199b09c

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301433-Z6WPSC/blueprint/resolved-snapshot.json
- old_digest: 3c9ea5b71d18c425229c973dcb6570f996b88c75c9c2dc6e11e74f523e45205e
- current_digest: 3c9ea5b71d18c425229c973dcb6570f996b88c75c9c2dc6e11e74f523e45205e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609301433-Z6WPSC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202609301433-Z6WPSC -m 🧩 Z6WPSC task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-30T14:36:21.329Z — VERIFY — ok

By: CODER

Note: verified-202609301433-Z6WPSC
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T14:34:57.559Z, excerpt_hash=sha256:76731779f440e28da560bb761e9ee61bae38dfd40b811535589df85d0199b09c

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301433-Z6WPSC/blueprint/resolved-snapshot.json
- old_digest: 3c9ea5b71d18c425229c973dcb6570f996b88c75c9c2dc6e11e74f523e45205e
- current_digest: 3c9ea5b71d18c425229c973dcb6570f996b88c75c9c2dc6e11e74f523e45205e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609301433-Z6WPSC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609301433-Z6WPSC --result verified-202609301433-Z6WPSC --commit d17c8bd23af5f1a452774ee6adc353b6559ad823
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Pinned frmitems.cxx setters accept signed side margins; txtprmap.cxx maps paragraph left/right margins with XML_TYPE_MEASURE; docfmt.cxx subtracts a complete tab distance from a positive indent in unsnapped mode. The former local non-negative guards caused five regression assertions to fail, including an exception for 300 -> -420 twips. Two production guards and two import flags were corrected. Focused command: npm exec --workspace @vite-office/office -- vitest run src/editeng/source/items/textitem.test.ts src/sw/source/uibase/wrtsh/wrtsh-indent.test.ts src/sw/source/filter/xml/odt-paragraph-indent-roundtrip.test.ts. Result: pass, 17/17 assertions. Full command: npm run verify. Result: pass; see verify.log. Scope: signed item values, item codec, ODT round-trip and undo/redo. ap doctor and node .agentplane/policy/check-routing.mjs: pass, with existing unrelated hook-shim and historical close-commit warnings. Remaining combined paraitem.ts source ownership and other style/item operations remain unverified; no whole-module parity promotion. Parent audit 202609240501-C9TN6M remains open.

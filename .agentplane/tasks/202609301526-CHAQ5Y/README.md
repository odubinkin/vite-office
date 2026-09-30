---
id: "202609301526-CHAQ5Y"
title: "Align paragraph margin item source ownership"
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
  updated_at: "2026-09-30T15:27:12.778Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-30T15:36:32.653Z"
  updated_by: "CODER"
  note: "Exact class-body comparison, 41 focused tests, complete verification, doctor and policy routing passed; verify.log preserves gate evidence."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-30T15:37:00.265Z"
  updated_by: "EVALUATOR"
  note: "Four frame metric item classes now match pinned source ownership without behavior changes."
  evaluated_sha: "366dc444b000210058ea83f90ab854a576cadb56"
  blueprint_digest: "eaf1dd013c408f04d26018d8861e4bea45382e655f88bb90d2717d07ae937351"
  evidence_refs:
    - ".agentplane/tasks/202609301526-CHAQ5Y/README.md"
    - ".agentplane/tasks/202609301526-CHAQ5Y/quality/20260930-153700265-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609301526-CHAQ5Y/quality/20260930-153700265-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609301526-CHAQ5Y/quality/20260930-153700265-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609301526-CHAQ5Y/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202609301526-CHAQ5Y/verify.log"
  findings:
    - "Reviewed exact class-body equality, twenty direct import updates, relocation of existing assertions, and narrow provenance/inventory data. No forwarding shim, validator changes, or product exception changes. Full verification passed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: perform the approved single source-owner correction for existing frame margin and spacing items, preserving class bodies and behavior."
events:
  -
    type: "status"
    at: "2026-09-30T15:27:13.440Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: perform the approved single source-owner correction for existing frame margin and spacing items, preserving class bodies and behavior."
  -
    type: "verify"
    at: "2026-09-30T15:36:32.653Z"
    author: "CODER"
    state: "ok"
    note: "Exact class-body comparison, 41 focused tests, complete verification, doctor and policy routing passed; verify.log preserves gate evidence."
doc_version: 3
doc_updated_at: "2026-09-30T15:36:32.726Z"
doc_updated_by: "CODER"
description: "One bounded architecture correction under approved iterative upstream audit: move the four existing frame-owned margin and spacing item classes to editeng/source/items/frmitems.ts, update all direct consumers and test ownership, and align provenance/inventory data without changing behavior or validators."
sections:
  Summary: |-
    Align paragraph margin item source ownership

    One bounded architecture correction under approved iterative upstream audit: move the four existing frame-owned margin and spacing item classes to editeng/source/items/frmitems.ts, update all direct consumers and test ownership, and align provenance/inventory data without changing behavior or validators.
  Scope: "One source-owner refactor: new editeng/source/items/frmitems.ts and frmitems.test.ts; existing paraitem.ts and textitem.test.ts; the twenty discovered direct consumers of the four moved classes; docs/program/parity/runtime-inventory.json and docs/program/source-provenance.json; canonical task artifacts. All class bodies and observable runtime behavior remain unchanged. Inventory tooling and conscious save/open/recovery deviations are excluded."
  Plan: "Approved iterative goal permits this single architecture fix. CODER moves unchanged SvxTextLeftMarginItem, SvxFirstLineIndentItem, SvxRightMarginItem and SvxULSpaceItem from editeng/source/items/paraitem.ts into new frmitems.ts (their pinned C++ owner); no forwarding export. Update all twenty current consumers under sw browser/editor, browser/presentation, inc/poolfmt.test.ts, source/filter/xml, source/core/txtnode/ndtxt.ts, core/text/txtfrm.ts, core/attr/swatrset.ts, core/doc/poolfmt-defaults.ts and writer-attributes.test.ts, core/layout/newfrm.test.ts, uibase/shells/textsh1.ts, uibase/wrtsh tests, and editeng/source/items/textitem.test.ts. Move existing frame assertions into new frmitems.test.ts; leave character and line-spacing logic unchanged. Update only data in runtime-inventory.json and source-provenance.json for the new module and relocated evidence. Full focused and repository verification, doctor/routing, recorded review and clean deterministic close. Preserve all product exceptions; no network, inventory schemas/generators/validators, policy, or unrelated runtime changes."
  Verify Steps: "1. Compare the four moved class bodies with pre-change paraitem.ts and confirm exact pinned frmitems.cxx ownership; no forwarding export or stale paraitem imports of the moved symbols remains. 2. Run focused EditEngine item tests and Writer pool default/attribute/ODT/ruler tests to retain signed values, clone/equality, item codec and paragraph behavior. 3. npm run verify passes format, lint, type, dependency, resources, 100% app/inventory coverage, browser, static, docs, size, source-tree, provenance, invariants and parity gates. 4. ap doctor and node .agentplane/policy/check-routing.mjs pass; diff is limited to declared ownership refactor and final git status is clean."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-30T15:36:32.653Z — VERIFY — ok

    By: CODER

    Note: Exact class-body comparison, 41 focused tests, complete verification, doctor and policy routing passed; verify.log preserves gate evidence.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T15:36:32.169Z, excerpt_hash=sha256:72aeba19b4f535f818ade1161ba69363e3e143fa75915bf1e5616283d1a68aee

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301526-CHAQ5Y/blueprint/resolved-snapshot.json
    - old_digest: eaf1dd013c408f04d26018d8861e4bea45382e655f88bb90d2717d07ae937351
    - current_digest: eaf1dd013c408f04d26018d8861e4bea45382e655f88bb90d2717d07ae937351
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609301526-CHAQ5Y

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609301526-CHAQ5Y
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
  Findings: "Command: exact AST comparison against pre-change paraitem.ts. Result: pass. Evidence: all four moved class bodies are identical; no forwarding exports or stale imports. Scope: source-owner refactor, twenty direct consumers, relocated existing frame tests, provenance/inventory data. Command: focused Vitest from apps/office. Result: pass, 8 suites / 41 tests. Initial root-directory invocation could not load app-relative setup; corrected cwd passed without changing test configuration. Command: npm run verify. Result: pass, 117 application suites / 566 tests, 109 inventory tests, 19 browser scenarios, 100% coverage and all required static/source/provenance/invariant/parity gates; semanticViolationCount 0. Command: ap doctor; node .agentplane/policy/check-routing.mjs. Result: pass with only pre-existing doctor warnings. Evidence: verify.log. Each class is now owned by the counterpart of pinned editeng/source/items/frmitems.cxx; broader semantic contracts remain unverified and product exceptions were preserved."
id_source: "generated"
---
## Summary

Align paragraph margin item source ownership

One bounded architecture correction under approved iterative upstream audit: move the four existing frame-owned margin and spacing item classes to editeng/source/items/frmitems.ts, update all direct consumers and test ownership, and align provenance/inventory data without changing behavior or validators.

## Scope

One source-owner refactor: new editeng/source/items/frmitems.ts and frmitems.test.ts; existing paraitem.ts and textitem.test.ts; the twenty discovered direct consumers of the four moved classes; docs/program/parity/runtime-inventory.json and docs/program/source-provenance.json; canonical task artifacts. All class bodies and observable runtime behavior remain unchanged. Inventory tooling and conscious save/open/recovery deviations are excluded.

## Plan

Approved iterative goal permits this single architecture fix. CODER moves unchanged SvxTextLeftMarginItem, SvxFirstLineIndentItem, SvxRightMarginItem and SvxULSpaceItem from editeng/source/items/paraitem.ts into new frmitems.ts (their pinned C++ owner); no forwarding export. Update all twenty current consumers under sw browser/editor, browser/presentation, inc/poolfmt.test.ts, source/filter/xml, source/core/txtnode/ndtxt.ts, core/text/txtfrm.ts, core/attr/swatrset.ts, core/doc/poolfmt-defaults.ts and writer-attributes.test.ts, core/layout/newfrm.test.ts, uibase/shells/textsh1.ts, uibase/wrtsh tests, and editeng/source/items/textitem.test.ts. Move existing frame assertions into new frmitems.test.ts; leave character and line-spacing logic unchanged. Update only data in runtime-inventory.json and source-provenance.json for the new module and relocated evidence. Full focused and repository verification, doctor/routing, recorded review and clean deterministic close. Preserve all product exceptions; no network, inventory schemas/generators/validators, policy, or unrelated runtime changes.

## Verify Steps

1. Compare the four moved class bodies with pre-change paraitem.ts and confirm exact pinned frmitems.cxx ownership; no forwarding export or stale paraitem imports of the moved symbols remains. 2. Run focused EditEngine item tests and Writer pool default/attribute/ODT/ruler tests to retain signed values, clone/equality, item codec and paragraph behavior. 3. npm run verify passes format, lint, type, dependency, resources, 100% app/inventory coverage, browser, static, docs, size, source-tree, provenance, invariants and parity gates. 4. ap doctor and node .agentplane/policy/check-routing.mjs pass; diff is limited to declared ownership refactor and final git status is clean.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-30T15:36:32.653Z — VERIFY — ok

By: CODER

Note: Exact class-body comparison, 41 focused tests, complete verification, doctor and policy routing passed; verify.log preserves gate evidence.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T15:36:32.169Z, excerpt_hash=sha256:72aeba19b4f535f818ade1161ba69363e3e143fa75915bf1e5616283d1a68aee

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301526-CHAQ5Y/blueprint/resolved-snapshot.json
- old_digest: eaf1dd013c408f04d26018d8861e4bea45382e655f88bb90d2717d07ae937351
- current_digest: eaf1dd013c408f04d26018d8861e4bea45382e655f88bb90d2717d07ae937351
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609301526-CHAQ5Y

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609301526-CHAQ5Y
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

Command: exact AST comparison against pre-change paraitem.ts. Result: pass. Evidence: all four moved class bodies are identical; no forwarding exports or stale imports. Scope: source-owner refactor, twenty direct consumers, relocated existing frame tests, provenance/inventory data. Command: focused Vitest from apps/office. Result: pass, 8 suites / 41 tests. Initial root-directory invocation could not load app-relative setup; corrected cwd passed without changing test configuration. Command: npm run verify. Result: pass, 117 application suites / 566 tests, 109 inventory tests, 19 browser scenarios, 100% coverage and all required static/source/provenance/invariant/parity gates; semanticViolationCount 0. Command: ap doctor; node .agentplane/policy/check-routing.mjs. Result: pass with only pre-existing doctor warnings. Evidence: verify.log. Each class is now owned by the counterpart of pinned editeng/source/items/frmitems.cxx; broader semantic contracts remain unverified and product exceptions were preserved.

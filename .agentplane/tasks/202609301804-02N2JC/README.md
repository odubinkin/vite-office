---
id: "202609301804-02N2JC"
title: "Restore native per-tab XML context ownership"
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
  updated_at: "2026-09-30T18:06:36.917Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-30T18:17:14.960Z"
  updated_by: "CODER"
  note: "Native per-tab value/reference ownership verified by pinned source and AST comparison, ODT subtree cycles, full verify 584/109/19 at 100% coverage and all required source/routing checks."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore native per-tab context/value ownership with unchanged metrics/defaults/selection and package evidence."
events:
  -
    type: "status"
    at: "2026-09-30T18:06:37.388Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore native per-tab context/value ownership with unchanged metrics/defaults/selection and package evidence."
  -
    type: "verify"
    at: "2026-09-30T18:17:14.960Z"
    author: "CODER"
    state: "ok"
    note: "Native per-tab value/reference ownership verified by pinned source and AST comparison, ODT subtree cycles, full verify 584/109/19 at 100% coverage and all required source/routing checks."
doc_version: 3
doc_updated_at: "2026-09-30T18:17:15.018Z"
doc_updated_by: "CODER"
description: "Child of C9TN6M. Move one-tab data and parsing into SvxXMLTabStopContext_Impl; store and return leaf contexts, select through getTabStop. Preserve verified metrics/defaults/selection and existing descendant ignore semantics. Broader null-context dispatcher parity remains open."
sections:
  Summary: |-
    Restore native per-tab XML context ownership

    Child of C9TN6M. Move one-tab data and parsing into SvxXMLTabStopContext_Impl; store and return leaf contexts, select through getTabStop. Preserve verified metrics/defaults/selection and existing descendant ignore semantics. Broader null-context dispatcher parity remains open.
  Scope: "Only xmloff/source/style/xmltabi.ts, sw/source/filter/xml/odt-property-roundtrip.test.ts, runtime-inventory.json, source-provenance.json and task evidence. Leaf context owns parsing and value, parent stores/returns leaf contexts and selects via getTabStop. Preserve all existing tab defaults, native MM100 conversion and Default selection; keep current descendant ignore behavior. Global null-context dispatcher contract is a separately recorded audit gap, without an intentional-deviation claim. Registered save/open/recovery decisions excluded."
  Plan: "Restore native per-tab data/context responsibility using internal SvxXMLTabStopContext_Impl with getTabStop. Move the existing initializer unchanged, store and return those leaf contexts, and select their values at container close. Use the existing ignore-context adapter to preserve native subtree-skipping outcomes under the current dispatcher; broader null-handler dispatch remains separately unverified. Add meaningful nested-subtree ODT cycle evidence, record AST/source comparison, update narrow mappings, run all required checks and close leaf."
  Verify Steps: "1. Compare leaf constructor/value getter and parent reference creation/storage/selection with pinned xmltabi.cxx; compare native xmlictxt null-child behavior plus fastparser null-subtree skipping to current dispatcher and record remaining adaptation honestly. 2. AST comparison proves moved tab value initializer and source-order selection predicates unchanged. 3. Focused ODT cases continue to verify defaults/MM100/selection; add real direct/inherited package cycle evidence that nested known/unknown leaf subtrees cannot mutate or append tab values or document text. 4. npm run verify, ap doctor, routing and diff checks pass. Review scoped changes and leave wider module parity unverified."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-30T18:17:14.960Z — VERIFY — ok

    By: CODER

    Note: Native per-tab value/reference ownership verified by pinned source and AST comparison, ODT subtree cycles, full verify 584/109/19 at 100% coverage and all required source/routing checks.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T18:17:14.638Z, excerpt_hash=sha256:e6f168917bd395cb7d53e89c7550216f483c59c9e85649b93847153defbe66f8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301804-02N2JC/blueprint/resolved-snapshot.json
    - old_digest: 21261127fbdec6f32ee961ab19349424ea0fb0b80dd32d059c1657e6928c4359
    - current_digest: 21261127fbdec6f32ee961ab19349424ea0fb0b80dd32d059c1657e6928c4359
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609301804-02N2JC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609301804-02N2JC
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commit if leaf-context lifecycle changes cause a verified regression; preserve unrelated parity fixes."
  Findings: "Command: architecture.mjs. Result: pass. Evidence: architecture.log; pinned baseline AST proves all moved attribute parsing, complete tab value initializer and Default-selection predicates unchanged. Parent creates/stores/returns the same SvxXMLTabStopContext_Impl, selects getTabStop values at close; leaf owns the readonly MM100 record. Source: pinned xmltabi.cxx constructor/getTabStop and maTabStops reference array. Command: focused ODT property test. Result: pass, 11 tests. Evidence: focused.log. New real direct/inherited ODT cycles prove nested known/unknown leaf subtrees do not mutate fields, add stops, change sibling selection or append document text. Existing native default/metric/source-order cases remain green. Command: npm run verify. Result: pass, exit 0; 584 app, 109 inventory, 19 browser tests, 100% required coverage, all source/provenance/invariant/parity gates and semanticViolationCount=0. Evidence: verify.log. Command: ap doctor, routing and diff checks. Result: pass, two pre-existing doctor warnings. Scope: four approved implementation/test/metadata files. Residual: native SvXMLImportContext returns null for children and native SAX skips null-context subtrees; local dispatcher rejects known null children. The existing ignore-context base preserves tab leaf subtree outcomes while this global dispatcher/base-class contract remains unverified; it is not registered as an intentional deviation. Broader null-handler policy and unsupported implemented-feature factory contracts require separate source-backed review. Registered save/open/recovery decisions unchanged."
id_source: "generated"
---
## Summary

Restore native per-tab XML context ownership

Child of C9TN6M. Move one-tab data and parsing into SvxXMLTabStopContext_Impl; store and return leaf contexts, select through getTabStop. Preserve verified metrics/defaults/selection and existing descendant ignore semantics. Broader null-context dispatcher parity remains open.

## Scope

Only xmloff/source/style/xmltabi.ts, sw/source/filter/xml/odt-property-roundtrip.test.ts, runtime-inventory.json, source-provenance.json and task evidence. Leaf context owns parsing and value, parent stores/returns leaf contexts and selects via getTabStop. Preserve all existing tab defaults, native MM100 conversion and Default selection; keep current descendant ignore behavior. Global null-context dispatcher contract is a separately recorded audit gap, without an intentional-deviation claim. Registered save/open/recovery decisions excluded.

## Plan

Restore native per-tab data/context responsibility using internal SvxXMLTabStopContext_Impl with getTabStop. Move the existing initializer unchanged, store and return those leaf contexts, and select their values at container close. Use the existing ignore-context adapter to preserve native subtree-skipping outcomes under the current dispatcher; broader null-handler dispatch remains separately unverified. Add meaningful nested-subtree ODT cycle evidence, record AST/source comparison, update narrow mappings, run all required checks and close leaf.

## Verify Steps

1. Compare leaf constructor/value getter and parent reference creation/storage/selection with pinned xmltabi.cxx; compare native xmlictxt null-child behavior plus fastparser null-subtree skipping to current dispatcher and record remaining adaptation honestly. 2. AST comparison proves moved tab value initializer and source-order selection predicates unchanged. 3. Focused ODT cases continue to verify defaults/MM100/selection; add real direct/inherited package cycle evidence that nested known/unknown leaf subtrees cannot mutate or append tab values or document text. 4. npm run verify, ap doctor, routing and diff checks pass. Review scoped changes and leave wider module parity unverified.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-30T18:17:14.960Z — VERIFY — ok

By: CODER

Note: Native per-tab value/reference ownership verified by pinned source and AST comparison, ODT subtree cycles, full verify 584/109/19 at 100% coverage and all required source/routing checks.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T18:17:14.638Z, excerpt_hash=sha256:e6f168917bd395cb7d53e89c7550216f483c59c9e85649b93847153defbe66f8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301804-02N2JC/blueprint/resolved-snapshot.json
- old_digest: 21261127fbdec6f32ee961ab19349424ea0fb0b80dd32d059c1657e6928c4359
- current_digest: 21261127fbdec6f32ee961ab19349424ea0fb0b80dd32d059c1657e6928c4359
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609301804-02N2JC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609301804-02N2JC
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commit if leaf-context lifecycle changes cause a verified regression; preserve unrelated parity fixes.

## Findings

Command: architecture.mjs. Result: pass. Evidence: architecture.log; pinned baseline AST proves all moved attribute parsing, complete tab value initializer and Default-selection predicates unchanged. Parent creates/stores/returns the same SvxXMLTabStopContext_Impl, selects getTabStop values at close; leaf owns the readonly MM100 record. Source: pinned xmltabi.cxx constructor/getTabStop and maTabStops reference array. Command: focused ODT property test. Result: pass, 11 tests. Evidence: focused.log. New real direct/inherited ODT cycles prove nested known/unknown leaf subtrees do not mutate fields, add stops, change sibling selection or append document text. Existing native default/metric/source-order cases remain green. Command: npm run verify. Result: pass, exit 0; 584 app, 109 inventory, 19 browser tests, 100% required coverage, all source/provenance/invariant/parity gates and semanticViolationCount=0. Evidence: verify.log. Command: ap doctor, routing and diff checks. Result: pass, two pre-existing doctor warnings. Scope: four approved implementation/test/metadata files. Residual: native SvXMLImportContext returns null for children and native SAX skips null-context subtrees; local dispatcher rejects known null children. The existing ignore-context base preserves tab leaf subtree outcomes while this global dispatcher/base-class contract remains unverified; it is not registered as an intentional deviation. Broader null-handler policy and unsupported implemented-feature factory contracts require separate source-backed review. Registered save/open/recovery decisions unchanged.

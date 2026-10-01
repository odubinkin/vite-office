---
id: "202610011627-W77K0Q"
title: "Restore protected explicit-target numbering validation contracts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-01T16:28:23.630Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore protected explicit-target native numbering validation contracts under the persistent user goal, preserving all original assertions and upstream-independent tests; no source copies or registered IO/recovery changes."
events:
  -
    type: "status"
    at: "2026-10-01T16:28:24.071Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore protected explicit-target native numbering validation contracts under the persistent user goal, preserving all original assertions and upstream-independent tests; no source copies or registered IO/recovery changes."
doc_version: 3
doc_updated_at: "2026-10-01T16:28:24.071Z"
doc_updated_by: "CODER"
description: "Iteration49 of the active implemented-runtime parity goal: remove the nonnative public eager no-argument hierarchical validation bridge, require explicit nullable targets on both protected validators, preserve original assertion meaning using source-shaped access, and compare native prefix/cache/null/foreign-target observations from manual local probes. Project tests must neither read nor compile nor invoke pinned upstream; native source must only exist in ignored scratch, never canonical Agentplane artifacts. Registered IO/recovery deviations remain untouched."
sections:
  Summary: "Iteration 49 repairs the remaining nonnative eager hierarchical validation bridge and restores the selected native protected explicit-target contract. The active parent is 202609240501-C9TN6M; full core/browser parity remains the original goal."
  Scope: |-
    Eight semantic paths:
    - apps/office/src/sw/source/core/SwNumberTree/SwNumberTree.ts
    - apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-phantoms.test.ts
    - apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-lifecycle.test.ts
    - apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-policy.test.ts
    - apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-contract.test.ts
    - apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-contract-native.json
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json

    Task-owned evidence/scripts/lifecycle are included. Source pin: 9bc445578031fecf56086729d8e4940c77e14d65. No other implementation, registered save/open/recovery deviations, dependency, policy, gate or completion status changes.
  Plan: |-
    Restore the complete selected protected explicit-target validation contract: both validators require an explicitly supplied SwNumberTreeNode or undefined (native nullptr); hierarchical undefined/foreign targets are no-ops, owned child targets validate only their prefix, and public getters/notifications retain native deferred descendant validation. Remove eager no-argument recursion and public exposure. Preserve every original expected vector/state while adapting test access/setup to source-shaped calls. Add literal manually generated native cache observations and compile-time visibility/argument assertions. Scope is exactly eight semantic paths: SwNumberTree.ts, existing phantom/lifecycle/policy tests, new SwNumberTree-contract.test.ts and SwNumberTree-contract-native.json, source-provenance.json and runtime-inventory.json. Evidence-only metadata changes; no status promotion. Native probes use complete unchanged pinned bodies and named aliases in ignored scratch only, never project tests or source artifacts. Full unchanged verification, isolated focused tests without upstream, CODE/quality/close traceability, clean final state, parent/goal active.

    Execute as current-actor CODER after sequential ORCHESTRATOR approval/start. No delegation, network or outside-repository access. Preserve all original expectation values; diagnostic access to protected methods exists only in tests. No public replacement eager helper.
  Verify Steps: |-
    1. Inspect exact pinned complete ValidateHierarchical, ValidateContinuous, Validate, GetIterator, child comparator and header access/signature contracts. Fresh hashes and complete unchanged native manual probe bodies produce literal null/foreign/owned-prefix/raw-cache and descendant observations with ASan/UBSan, using explicit retained source-shaped adapters. Source is generated only under ignored .agentplane/tmp/upstream-probes; canonical evidence stores hashes/results/generator/logs, never source copies. Project tests do not read/compile/invoke upstream.
    2. Focused RED for eager undefined-target behavior and compile-time public/optional argument contracts, then GREEN. Both validators are protected with required explicit nullable target. Hierarchical absent/foreign targets leave cache unchanged; owned target validates only its child prefix without eager descendant recursion; normal getters/notifications and continuous sentinel behavior retain all prior native expectations. Preserve original assertion meaning and actual owner/tree observations.
    3. Focused suites with vendor/libreoffice-reference temporarily unavailable and restored in finally pass. Unchanged full npm run verify passes every format/lint/tools/app type/dependency/resource/app/inventory/browser/build/static/JSDoc/size/source-tree/provenance/invariant/parity gate with both 100% coverages. ap doctor, policy routing, git diff --check and exact eight-file semantic scope pass. No exclusions or gate weakening.
    4. Record actual post-bookkeeping CODE SHA and exact semantic/artifact path counts. Separate canonical verify, same-actor EVALUATOR quality phase and leaf close; no independent-agent review claim. Final tracked/untracked state clean. Parent/full goal stay active; retain bounded native alias/lifetime gaps and next measured mismatch.
  Verification: "Pending baseline/native differential, implementation, focused isolation and full unchanged gates. No whole-module or goal completion claim."
  Rollback Plan: "Revert only this leaf implementation commit and its eight intentional semantic paths via a follow-up task if required. Preserve task history, source hashes and literal results; never restore upstream source copies into artifacts or rewrite Git history."
  Findings: "Fresh inspection confirms native header methods are protected and require explicit pointer arguments. Native hierarchical GetIterator(nullptr) resolves no child and returns without mutation; current local undefined-target overload instead validates recursively. Current production calls are owned-child only; three legacy diagnostic tests still rely on public/no-argument access. Prior iteration 48 completed with native 960 sequences/69120 states and unchanged full verification. Existing native result fixtures remain independent local test inputs."
id_source: "generated"
---
## Summary

Iteration 49 repairs the remaining nonnative eager hierarchical validation bridge and restores the selected native protected explicit-target contract. The active parent is 202609240501-C9TN6M; full core/browser parity remains the original goal.

## Scope

Eight semantic paths:
- apps/office/src/sw/source/core/SwNumberTree/SwNumberTree.ts
- apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-phantoms.test.ts
- apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-lifecycle.test.ts
- apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-policy.test.ts
- apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-contract.test.ts
- apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-contract-native.json
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

Task-owned evidence/scripts/lifecycle are included. Source pin: 9bc445578031fecf56086729d8e4940c77e14d65. No other implementation, registered save/open/recovery deviations, dependency, policy, gate or completion status changes.

## Plan

Restore the complete selected protected explicit-target validation contract: both validators require an explicitly supplied SwNumberTreeNode or undefined (native nullptr); hierarchical undefined/foreign targets are no-ops, owned child targets validate only their prefix, and public getters/notifications retain native deferred descendant validation. Remove eager no-argument recursion and public exposure. Preserve every original expected vector/state while adapting test access/setup to source-shaped calls. Add literal manually generated native cache observations and compile-time visibility/argument assertions. Scope is exactly eight semantic paths: SwNumberTree.ts, existing phantom/lifecycle/policy tests, new SwNumberTree-contract.test.ts and SwNumberTree-contract-native.json, source-provenance.json and runtime-inventory.json. Evidence-only metadata changes; no status promotion. Native probes use complete unchanged pinned bodies and named aliases in ignored scratch only, never project tests or source artifacts. Full unchanged verification, isolated focused tests without upstream, CODE/quality/close traceability, clean final state, parent/goal active.

Execute as current-actor CODER after sequential ORCHESTRATOR approval/start. No delegation, network or outside-repository access. Preserve all original expectation values; diagnostic access to protected methods exists only in tests. No public replacement eager helper.

## Verify Steps

1. Inspect exact pinned complete ValidateHierarchical, ValidateContinuous, Validate, GetIterator, child comparator and header access/signature contracts. Fresh hashes and complete unchanged native manual probe bodies produce literal null/foreign/owned-prefix/raw-cache and descendant observations with ASan/UBSan, using explicit retained source-shaped adapters. Source is generated only under ignored .agentplane/tmp/upstream-probes; canonical evidence stores hashes/results/generator/logs, never source copies. Project tests do not read/compile/invoke upstream.
2. Focused RED for eager undefined-target behavior and compile-time public/optional argument contracts, then GREEN. Both validators are protected with required explicit nullable target. Hierarchical absent/foreign targets leave cache unchanged; owned target validates only its child prefix without eager descendant recursion; normal getters/notifications and continuous sentinel behavior retain all prior native expectations. Preserve original assertion meaning and actual owner/tree observations.
3. Focused suites with vendor/libreoffice-reference temporarily unavailable and restored in finally pass. Unchanged full npm run verify passes every format/lint/tools/app type/dependency/resource/app/inventory/browser/build/static/JSDoc/size/source-tree/provenance/invariant/parity gate with both 100% coverages. ap doctor, policy routing, git diff --check and exact eight-file semantic scope pass. No exclusions or gate weakening.
4. Record actual post-bookkeeping CODE SHA and exact semantic/artifact path counts. Separate canonical verify, same-actor EVALUATOR quality phase and leaf close; no independent-agent review claim. Final tracked/untracked state clean. Parent/full goal stay active; retain bounded native alias/lifetime gaps and next measured mismatch.

## Verification

Pending baseline/native differential, implementation, focused isolation and full unchanged gates. No whole-module or goal completion claim.

## Rollback Plan

Revert only this leaf implementation commit and its eight intentional semantic paths via a follow-up task if required. Preserve task history, source hashes and literal results; never restore upstream source copies into artifacts or rewrite Git history.

## Findings

Fresh inspection confirms native header methods are protected and require explicit pointer arguments. Native hierarchical GetIterator(nullptr) resolves no child and returns without mutation; current local undefined-target overload instead validates recursively. Current production calls are owned-child only; three legacy diagnostic tests still rely on public/no-argument access. Prior iteration 48 completed with native 960 sequences/69120 states and unchanged full verification. Existing native result fixtures remain independent local test inputs.

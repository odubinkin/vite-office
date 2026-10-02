---
id: "202610020455-0P7YJY"
title: "Restore optional validation policy for protected number vectors"
status: "DOING"
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
  updated_at: "2026-10-02T05:03:51.129Z"
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
    body: "Start: Restore native optional validation flag for protected ancestor vectors with actual document cache/phantom tests, no upstream test access or source/helper task artifacts."
events:
  -
    type: "status"
    at: "2026-10-02T04:56:31.794Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore native optional validation flag for protected ancestor vectors with actual document cache/phantom tests, no upstream test access or source/helper task artifacts."
doc_version: 3
doc_updated_at: "2026-10-02T05:08:52.229Z"
doc_updated_by: "CODER"
description: "Iteration51: restore protected GetNumberVector_(numbers,bValidate=true) signature and recursively forward the selected validation policy. Test raw-cache reads, defaults, explicit true/false, appended output and phantom/ancestor paths with actual project-owned documents. No source/helper scripts in task artifacts, no upstream access from tests, no registered deviation or broad parity promotion."
sections:
  Summary: "Iteration51 restores the optional validation flag and recursive native contract of protected GetNumberVector_."
  Scope: "Four semantic paths: apps/office/src/sw/source/core/SwNumberTree/SwNumberTree.ts; new SwNumberTree-vector.test.ts alongside it; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Active leaf and parent task bookkeeping only. No registered IO/recovery, test gate, existing expectation or whole-module status changes."
  Plan: "Restore protected optional true-default validation parameter and recursively forward it. Four semantic paths only; planned type/runtime RED then GREEN with actual owner/cache/phantom fixtures; source hashes and manual conclusions only, tests independent of upstream, no helper source artifacts. Unchanged full verification and both100% coverage, separate implementation commit/quality/leaf close; parent/full goal remains open."
  Verify Steps: |-
    1. Current pin equals 9bc445578031fecf56086729d8e4940c77e14d65. Fresh SwNumberTree.hxx declaration hash and SwNumberTree.cxx GetNumberVector_/GetNumberVector/GetNumber symbol hashes support manual contract inspection: optional true default, parent-first recursion, caller-owned append, forwarding through all ancestors, no root/orphan entry. No compiled native execution or wider lifetime claim.
    2. Planned RED runtime and argument type failures are recorded, then GREEN. Type contract remains protected and exact [numbers:number[],validate?:boolean|undefined], the compiler representation of an optional defaulted boolean with explicit undefined behavior under exactOptionalPropertyTypes. Real document fixtures with hierarchical/continuous/skipped level9 records compare literal raw/validated vectors and retained prefix/counter/continuation snapshots across reading-suppressed insertion and restart invalidation. Explicit false leaves state untouched; omitted/undefined/true and public path validate consistently; orphan/root preserve prefilled output. No existing expectation changes.
    3. All focused tree suites pass with upstream directory temporarily unavailable and restored in finally. Unchanged full npm run verify passes all gates and both100% coverages; routing and doctor have no new errors, metadata modifies only bounded evidence/responsibilities for the tree row with no status/deviation promotion. Diff contains four semantic paths plus active leaf/parent artifacts; no native/helper source bodies stored.
    4. Canonical verification and separate same-actor EVALUATOR quality phase cite actual implementation SHA. Leaf finishes DONE with clean tracked/untracked state; next measured existing-function gap remains separate and full goal open.
  Verification: "Command: focused vector test and app typecheck. Result: planned RED4runtime profiles and exact argument TS2322, then GREEN6tests. First full verify exposed a new type-oracle tuple error under exactOptionalPropertyTypes; corrected only optional explicit undefined representation, preserving all literal values/behavior criteria. Command: npm run verify. Result: final pass exit0, full log retained alongside first failure. Evidence: app753/168files, inventory109/36files, browser19; app10925 statements/8274 branches/2937 functions/10021lines and inventory1523/1080/384/1464 all100%; every unchanged format/lint/type/dependency/resource/build/static/doc/size/source-tree/provenance/invariant/parity gate passed. Command: all seven tree suites with upstream directory temporarily unavailable and restored in finally. Result:40tests pass, focused-without-upstream.log. Command: fresh pinned file/declaration/symbol hashes and source-artifact/metadata/exact path checks, git diff --check. Result: pass; four semantic paths, two bounded metadata rows with no status/deviation promotion, no helper/native source bodies in artifacts. Native evidence is two file/one declaration/three symbol hashes and manual source inspection only, no compiled native execution/lifetime claim. Command: node .agentplane/policy/check-routing.mjs; ap doctor. Result: pass, zero errors/two existing warnings. Canonical verification and separate quality/close must use actual implementation SHA."
  Rollback Plan: "Revert the implementation commit if required, retaining result/hash evidence and the prohibition on source/helper artifact bodies."
  Findings: |-
    Fresh source inspection confirms header line417 optional true, core line295 recursive forwarding and per-node GetNumber(bValidate). Current local helper takes only the output and forces validation, contrary to its existing upstream contract. Previous goal turn completed iteration50 and is progress; this leaf addresses the next measured defect without broader promotion.

    - Observation: Planned baseline failures established all four raw-vector profiles eagerly validated despite false, and the exact optional argument tuple failed TS2322. The final recursive forwarding change makes all six tests GREEN without changing literal values or existing tests.
      Impact: Raw cache/prefix state remains unchanged on false reads; true-default and explicit true restore normal validating behavior across real and phantom ancestors.
      Resolution: Keep evidence bounded to the selected vector-helper contract; no compiled native owner/lifetime or full-module parity claim.

    - Observation: Next measured access-contract gap: pinned SwNumberTree.hxx places GetRoot under protected at line349, while local SwNumberTree.ts exposes it publicly. Fresh consumer scan finds one external implementation consumer in SwList.GetListItem plus six diagnostic test files.
      Impact: Root behavior currently matches, but public visibility exceeds the native contract and the browser list lookup depends on that exposure.
      Resolution: Keep this separate: next leaf should restore protected access and reconcile the existing list lookup without adding a public surrogate or changing list/root ownership behavior; existing diagnostic assertions must retain their values.

    - Observation: First full verify stopped at the new exact tuple assertion. Compiler API inspection showed defaulted function Parameters is [numbers:number[],validate?:boolean|undefined], while the handwritten optional tuple omitted explicit undefined under exactOptionalPropertyTypes.
      Impact: The implementation flag/default and runtime tests are correct; the new type oracle mismodeled an explicit undefined default call already required by the approved plan. No production inference defect or existing expected-value change.
      Resolution: Correct only the type oracle to exact optional boolean|undefined; keep protected visibility and exact parameter-count checks, and all runtime/default/cache assertions. The preceding single-argument implementation still fails this assertion. Record first full failure and rerun unchanged full gates; scope and behavioral acceptance unchanged.
id_source: "generated"
---
## Summary

Iteration51 restores the optional validation flag and recursive native contract of protected GetNumberVector_.

## Scope

Four semantic paths: apps/office/src/sw/source/core/SwNumberTree/SwNumberTree.ts; new SwNumberTree-vector.test.ts alongside it; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Active leaf and parent task bookkeeping only. No registered IO/recovery, test gate, existing expectation or whole-module status changes.

## Plan

Restore protected optional true-default validation parameter and recursively forward it. Four semantic paths only; planned type/runtime RED then GREEN with actual owner/cache/phantom fixtures; source hashes and manual conclusions only, tests independent of upstream, no helper source artifacts. Unchanged full verification and both100% coverage, separate implementation commit/quality/leaf close; parent/full goal remains open.

## Verify Steps

1. Current pin equals 9bc445578031fecf56086729d8e4940c77e14d65. Fresh SwNumberTree.hxx declaration hash and SwNumberTree.cxx GetNumberVector_/GetNumberVector/GetNumber symbol hashes support manual contract inspection: optional true default, parent-first recursion, caller-owned append, forwarding through all ancestors, no root/orphan entry. No compiled native execution or wider lifetime claim.
2. Planned RED runtime and argument type failures are recorded, then GREEN. Type contract remains protected and exact [numbers:number[],validate?:boolean|undefined], the compiler representation of an optional defaulted boolean with explicit undefined behavior under exactOptionalPropertyTypes. Real document fixtures with hierarchical/continuous/skipped level9 records compare literal raw/validated vectors and retained prefix/counter/continuation snapshots across reading-suppressed insertion and restart invalidation. Explicit false leaves state untouched; omitted/undefined/true and public path validate consistently; orphan/root preserve prefilled output. No existing expectation changes.
3. All focused tree suites pass with upstream directory temporarily unavailable and restored in finally. Unchanged full npm run verify passes all gates and both100% coverages; routing and doctor have no new errors, metadata modifies only bounded evidence/responsibilities for the tree row with no status/deviation promotion. Diff contains four semantic paths plus active leaf/parent artifacts; no native/helper source bodies stored.
4. Canonical verification and separate same-actor EVALUATOR quality phase cite actual implementation SHA. Leaf finishes DONE with clean tracked/untracked state; next measured existing-function gap remains separate and full goal open.

## Verification

Command: focused vector test and app typecheck. Result: planned RED4runtime profiles and exact argument TS2322, then GREEN6tests. First full verify exposed a new type-oracle tuple error under exactOptionalPropertyTypes; corrected only optional explicit undefined representation, preserving all literal values/behavior criteria. Command: npm run verify. Result: final pass exit0, full log retained alongside first failure. Evidence: app753/168files, inventory109/36files, browser19; app10925 statements/8274 branches/2937 functions/10021lines and inventory1523/1080/384/1464 all100%; every unchanged format/lint/type/dependency/resource/build/static/doc/size/source-tree/provenance/invariant/parity gate passed. Command: all seven tree suites with upstream directory temporarily unavailable and restored in finally. Result:40tests pass, focused-without-upstream.log. Command: fresh pinned file/declaration/symbol hashes and source-artifact/metadata/exact path checks, git diff --check. Result: pass; four semantic paths, two bounded metadata rows with no status/deviation promotion, no helper/native source bodies in artifacts. Native evidence is two file/one declaration/three symbol hashes and manual source inspection only, no compiled native execution/lifetime claim. Command: node .agentplane/policy/check-routing.mjs; ap doctor. Result: pass, zero errors/two existing warnings. Canonical verification and separate quality/close must use actual implementation SHA.

## Rollback Plan

Revert the implementation commit if required, retaining result/hash evidence and the prohibition on source/helper artifact bodies.

## Findings

Fresh source inspection confirms header line417 optional true, core line295 recursive forwarding and per-node GetNumber(bValidate). Current local helper takes only the output and forces validation, contrary to its existing upstream contract. Previous goal turn completed iteration50 and is progress; this leaf addresses the next measured defect without broader promotion.

- Observation: Planned baseline failures established all four raw-vector profiles eagerly validated despite false, and the exact optional argument tuple failed TS2322. The final recursive forwarding change makes all six tests GREEN without changing literal values or existing tests.
  Impact: Raw cache/prefix state remains unchanged on false reads; true-default and explicit true restore normal validating behavior across real and phantom ancestors.
  Resolution: Keep evidence bounded to the selected vector-helper contract; no compiled native owner/lifetime or full-module parity claim.

- Observation: Next measured access-contract gap: pinned SwNumberTree.hxx places GetRoot under protected at line349, while local SwNumberTree.ts exposes it publicly. Fresh consumer scan finds one external implementation consumer in SwList.GetListItem plus six diagnostic test files.
  Impact: Root behavior currently matches, but public visibility exceeds the native contract and the browser list lookup depends on that exposure.
  Resolution: Keep this separate: next leaf should restore protected access and reconcile the existing list lookup without adding a public surrogate or changing list/root ownership behavior; existing diagnostic assertions must retain their values.

- Observation: First full verify stopped at the new exact tuple assertion. Compiler API inspection showed defaulted function Parameters is [numbers:number[],validate?:boolean|undefined], while the handwritten optional tuple omitted explicit undefined under exactOptionalPropertyTypes.
  Impact: The implementation flag/default and runtime tests are correct; the new type oracle mismodeled an explicit undefined default call already required by the approved plan. No production inference defect or existing expected-value change.
  Resolution: Correct only the type oracle to exact optional boolean|undefined; keep protected visibility and exact parameter-count checks, and all runtime/default/cache assertions. The preceding single-argument implementation still fails this assertion. Record first full failure and rerun unchanged full gates; scope and behavioral acceptance unchanged.

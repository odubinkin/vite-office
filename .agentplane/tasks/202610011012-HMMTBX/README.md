---
id: "202610011012-HMMTBX"
title: "Separate Writer list restart flag and value setters"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on:
  - "202610010940-WW4SFA"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-10-01T10:12:48.014Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-10-01T10:13:02.808Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-10-01T10:19:35.687Z"
doc_updated_by: "CODER"
description: "Iteration 41: restore pinned SwTextNode SetListRestart(bool) and SetAttrListRestartValue(number) contracts, retain direct values across flag transitions, reproduce signed Int16 casting and USHRT_MAX reset, and migrate existing ODT/test callers without altering registered save/open/recovery deviations."
sections:
  Summary: "Iteration 41 restores the separate native Writer list restart flag/value setters for existing functionality. The continuing user goal authorizes safe local implementation, lifecycle records, validation, and commits. No network or outside-repository access."
  Scope: "SwTextNode ndtxt.ts restart setters; xmlimp.ts existing caller; existing combined-call tests in core/attr, core/txtnode, core/doc, core/SwNumberTree and filter/xml; one source-backed restart contract test and literal native fixture. Optional source-owner helper if required by the 1000-line module gate, with explicit provenance/inventory mapping. Bounded provenance/inventory evidence only; task-local native oracle, baseline and verification artifacts; parent progress. Preserve registered IO/recovery deviations and all unrelated assertions. No full list/default-registry/client/style lifecycle closure."
  Plan: "1. Inventory real callers and record the pre-edit application flag-loss baseline. Extract and compile complete unchanged pinned flag/value/Has/Get/Is definitions with explicit scalar/base/direct-item adapters, hashes and literal supported traces. 2. Make SetListRestart flag-only; add SetAttrListRestartValue with native equality, USHRT_MAX reset and signed Int16 conversion. Migrate the actual ODT caller and existing fixtures to separate setters. Keep getter preconditions and unrelated browser input normalization out of this correction. 3. Verify source-supported value retention, sentinel, equality/no-op, conversion, parent/default, list counters, undo, Worker16 and existing ODT/browser tests; preserve evidence scope. 4. Run full unchanged verify/doctor/routing/diff gates, record actual code SHA and evaluator opinion, finish only this child, and append next measured obligation to the still-open parent."
  Verify Steps: "1. Record actual pre-edit SwDoc/SwTextNode loss of direct value when changing only the flag. Compile complete unchanged pinned native setter/accessor bodies and record source identities, named adapter scope and native trace literals. 2. Application tests must agree with native supported traces for flag-only changes retaining direct values, missing/equal values, explicit zero, USHRT_MAX clearing and signed Int16 narrowing (including negative and wrapped numbers). Verify real list counters and existing Undo/Worker16/ODT behavior with original assertions retained except source-disproved combined-setter assertions. 3. npm run verify passes every unchanged gate, including 100% statements/branches/functions/lines for app and inventory; no coverage exclusions, reduced criteria, broad module-status promotion or IO exceptions added. 4. ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check pass; record intentional paths, actual implementation commit, evaluator result, verification and clean final tracked/untracked state."
  Verification: "Pending source-backed implementation and all declared checks. No skip approved."
  Rollback Plan: "Revert only this child implementation commit and its intentional source/test/provenance edits; preserve immutable completed task evidence and registered deviations."
  Findings: "Confirmed native ndtxt.cxx SetListRestart changes only Which85, while the existing combined setter clears Which86 on false and true-without-value. Native SetAttrListRestartValue separately compares the original signed tSwNumTreeNumber input, resets at USHRT_MAX and casts non-sentinel inputs to sal_Int16. The sole production combined call is XML import; other combined calls are tests. Existing browser list item-set composition already owns explicit combined state. Getter absent-value diagnostics, JS-number domain beyond exact integers, full client/attribute/style lifetime and ODT inactive-value persistence are not implicitly certified by this task. Harness-only failures: native compilation/execution succeeded initially, but fixture copy used a nonexistent src/test/fixtures directory; rg located actual src/test and final copy was repaired. The first focused run passed40 existing/new tests but the native mutation-attempt serializer emitted integer1 for SfxBoolItem true. Correct the named typed JSON serializer, preserve unchanged source bodies; no assertion or production behavior change. Initial logs are retained. Typecheck and lint passed."
id_source: "generated"
---
## Summary

Iteration 41 restores the separate native Writer list restart flag/value setters for existing functionality. The continuing user goal authorizes safe local implementation, lifecycle records, validation, and commits. No network or outside-repository access.

## Scope

SwTextNode ndtxt.ts restart setters; xmlimp.ts existing caller; existing combined-call tests in core/attr, core/txtnode, core/doc, core/SwNumberTree and filter/xml; one source-backed restart contract test and literal native fixture. Optional source-owner helper if required by the 1000-line module gate, with explicit provenance/inventory mapping. Bounded provenance/inventory evidence only; task-local native oracle, baseline and verification artifacts; parent progress. Preserve registered IO/recovery deviations and all unrelated assertions. No full list/default-registry/client/style lifecycle closure.

## Plan

1. Inventory real callers and record the pre-edit application flag-loss baseline. Extract and compile complete unchanged pinned flag/value/Has/Get/Is definitions with explicit scalar/base/direct-item adapters, hashes and literal supported traces. 2. Make SetListRestart flag-only; add SetAttrListRestartValue with native equality, USHRT_MAX reset and signed Int16 conversion. Migrate the actual ODT caller and existing fixtures to separate setters. Keep getter preconditions and unrelated browser input normalization out of this correction. 3. Verify source-supported value retention, sentinel, equality/no-op, conversion, parent/default, list counters, undo, Worker16 and existing ODT/browser tests; preserve evidence scope. 4. Run full unchanged verify/doctor/routing/diff gates, record actual code SHA and evaluator opinion, finish only this child, and append next measured obligation to the still-open parent.

## Verify Steps

1. Record actual pre-edit SwDoc/SwTextNode loss of direct value when changing only the flag. Compile complete unchanged pinned native setter/accessor bodies and record source identities, named adapter scope and native trace literals. 2. Application tests must agree with native supported traces for flag-only changes retaining direct values, missing/equal values, explicit zero, USHRT_MAX clearing and signed Int16 narrowing (including negative and wrapped numbers). Verify real list counters and existing Undo/Worker16/ODT behavior with original assertions retained except source-disproved combined-setter assertions. 3. npm run verify passes every unchanged gate, including 100% statements/branches/functions/lines for app and inventory; no coverage exclusions, reduced criteria, broad module-status promotion or IO exceptions added. 4. ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check pass; record intentional paths, actual implementation commit, evaluator result, verification and clean final tracked/untracked state.

## Verification

Pending source-backed implementation and all declared checks. No skip approved.

## Rollback Plan

Revert only this child implementation commit and its intentional source/test/provenance edits; preserve immutable completed task evidence and registered deviations.

## Findings

Confirmed native ndtxt.cxx SetListRestart changes only Which85, while the existing combined setter clears Which86 on false and true-without-value. Native SetAttrListRestartValue separately compares the original signed tSwNumTreeNumber input, resets at USHRT_MAX and casts non-sentinel inputs to sal_Int16. The sole production combined call is XML import; other combined calls are tests. Existing browser list item-set composition already owns explicit combined state. Getter absent-value diagnostics, JS-number domain beyond exact integers, full client/attribute/style lifetime and ODT inactive-value persistence are not implicitly certified by this task. Harness-only failures: native compilation/execution succeeded initially, but fixture copy used a nonexistent src/test/fixtures directory; rg located actual src/test and final copy was repaired. The first focused run passed40 existing/new tests but the native mutation-attempt serializer emitted integer1 for SfxBoolItem true. Correct the named typed JSON serializer, preserve unchanged source bodies; no assertion or production behavior change. Initial logs are retained. Typecheck and lint passed.

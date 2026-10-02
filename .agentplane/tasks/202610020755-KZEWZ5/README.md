---
id: "202610020755-KZEWZ5"
title: "Restore protected number-tree validity overloads"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-02T07:56:09.605Z"
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
    body: "Start: restore both protected validity overloads and native boundary lookup under continuing goal authorization, without source helpers or upstream test invocation."
events:
  -
    type: "status"
    at: "2026-10-02T07:56:10.716Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore both protected validity overloads and native boundary lookup under continuing goal authorization, without source helpers or upstream test invocation."
doc_version: 3
doc_updated_at: "2026-10-02T07:57:49.565Z"
doc_updated_by: "CODER"
description: "Iteration58 restores both native protected IsValid overloads, explicit nullable child dispatch, self-parent delegation and sorted-container cache-boundary lookup, plus source-equivalent self calls in insertion/invalidation. Owned type/document regressions and manual source hashes prove this correction without upstream test access or saved helpers."
sections:
  Summary: "Iteration58 restores the complete selected protected validity overload contract for existing number-tree prefix behavior. Prior goal turn made progress: insertion-order leaf57 and ignored source cleanup completed; full parity parent/goal remain active."
  Scope: "Exactly4semantic paths: apps/office/src/sw/source/core/SwNumberTree/SwNumberTree.ts; new SwNumberTree/SwNumberTree-validity.test.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Own leaf/parent traceability only. No old test/runtime caller files, dependencies, policy, gates, IO/recovery or new deviations. No upstream/helper source copies anywhere in Agentplane."
  Plan: "Make both IsValid() and IsValid(child: SwNumberTreeNode|undefined) protected overloads. Distinguish no argument from explicit undefined, delegate self validity to the attached parent, retain null/foreign-parent guards and resolve the saved prefix boundary through mChildren.find before comparison under its native stored-boundary invariant. Use native predecessor.IsValid() in AddChild and child.IsValid() in InvalidateChild, leaving the parent-child overload in Validate. Exactly3production method bodies change; other52bodies and every old test remain unchanged. Add4owned type/document/container/phantom-continuous tests for protected subclass access, zero/required-one-argument overload contracts, root/orphan/null/foreign/owned distinctions, reading/raw-prefix/nonvalidating observations, restart/removal/invalidation and exact valid-boundary lookup. No production observers/proxies/casts or native execution. Inspect fresh native declarations/bodies and record only hashes/conclusions. Append1base metadata row evidence/preserved responsibility or justification per manifest, retain every status/default/deviation/enum. Offline focused suites with vendor absent/restored, unchanged full verify all gates/both100%, canonical verification and same-actor EVALUATOR on actual semantic SHA; clean leaf close, parent active."
  Verify Steps: |-
    1. Fresh manual pinned header/core/sorted-container file and declaration/body hashes establish both protected overloads, parent delegation, null/foreign-parent guard and boundary lookup plus native internal self-call sites. No source bodies/helpers saved, no new compiled native or full lifetime claim.
    2. Baseline owned tests/typecheck expose missing protected self overload/private child access and missing boundary-container lookup. Final4tests cover exact zero/required-nullable-child boolean signatures, subclass access/public absence, root/orphan/null/foreign/owned prefixes, raw-cache reading/default behavior, real restart/removal/invalidation and continuous phantom chains. Cache lookup occurs only after native guards and resolves the saved owned boundary. Exactly3runtime method bodies changed/52others unchanged and all old test files byte unchanged.
    3. Focused validity/tree/o3tl/list/lifecycle and boundary tests pass with vendor absent/restored, final types/lint and unchanged npm run verify pass all gates/both100%coverage. Exact4semantic paths/1metadata row evidence/responsibility each with status/default/divergence/sourceResponsibility enum preserved. Pin/hash integrity, zero Python/native/helper artifacts, diff/routing/doctor pass without new errors.
    4. Record canonical verification and distinct same-actor EVALUATOR on actual implementation SHA, close only leaf with clean tracked state. Parent/full goal active; wider protected helper/state/context/dtor/notifiable/client/redline/layout/range/iterator/UI/lifetime obligations remain individually unverified.
  Verification: "Pending."
  Rollback Plan: "Revert only the actual semantic implementation commit if requested. Keep forbidden source/helper cleanup and pinned vendor unchanged."
  Findings: |-
    Preflight main/direct and clean. Pin9bc445578031fecf56086729d8e4940c77e14d65 freshly validated. Native header remains protected from line338; child and self declarations at482/490. Core self body652 delegates parent; child body676 guards saved boundary,nonnull child/exact parent and finds stored boundary before LessThan. Native insertion531 and invalidation1025 call self overload. Local has private child-only IsValid and direct saved-pointer comparison; insertion/invalidation use parent-child predicate. This is one measured contract/helper correction. No full module/status/default/goal promotion and registered save/open/recovery deviations unchanged.

    - Observation: Fresh local execution read confirms the existing invalidation helper is named Invalidate, not InvalidateChild as the planning prose called it.
      Impact: No scope or behavior expansion; the approved native self-validity call concerns this same existing child-invalidation operation.
      Resolution: Use the actual Invalidate method name in implementation evidence and integrity checks; selected3changed bodies are AddChild,IsValid,Invalidate. All52other existing bodies remain unchanged.
id_source: "generated"
---
## Summary

Iteration58 restores the complete selected protected validity overload contract for existing number-tree prefix behavior. Prior goal turn made progress: insertion-order leaf57 and ignored source cleanup completed; full parity parent/goal remain active.

## Scope

Exactly4semantic paths: apps/office/src/sw/source/core/SwNumberTree/SwNumberTree.ts; new SwNumberTree/SwNumberTree-validity.test.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Own leaf/parent traceability only. No old test/runtime caller files, dependencies, policy, gates, IO/recovery or new deviations. No upstream/helper source copies anywhere in Agentplane.

## Plan

Make both IsValid() and IsValid(child: SwNumberTreeNode|undefined) protected overloads. Distinguish no argument from explicit undefined, delegate self validity to the attached parent, retain null/foreign-parent guards and resolve the saved prefix boundary through mChildren.find before comparison under its native stored-boundary invariant. Use native predecessor.IsValid() in AddChild and child.IsValid() in InvalidateChild, leaving the parent-child overload in Validate. Exactly3production method bodies change; other52bodies and every old test remain unchanged. Add4owned type/document/container/phantom-continuous tests for protected subclass access, zero/required-one-argument overload contracts, root/orphan/null/foreign/owned distinctions, reading/raw-prefix/nonvalidating observations, restart/removal/invalidation and exact valid-boundary lookup. No production observers/proxies/casts or native execution. Inspect fresh native declarations/bodies and record only hashes/conclusions. Append1base metadata row evidence/preserved responsibility or justification per manifest, retain every status/default/deviation/enum. Offline focused suites with vendor absent/restored, unchanged full verify all gates/both100%, canonical verification and same-actor EVALUATOR on actual semantic SHA; clean leaf close, parent active.

## Verify Steps

1. Fresh manual pinned header/core/sorted-container file and declaration/body hashes establish both protected overloads, parent delegation, null/foreign-parent guard and boundary lookup plus native internal self-call sites. No source bodies/helpers saved, no new compiled native or full lifetime claim.
2. Baseline owned tests/typecheck expose missing protected self overload/private child access and missing boundary-container lookup. Final4tests cover exact zero/required-nullable-child boolean signatures, subclass access/public absence, root/orphan/null/foreign/owned prefixes, raw-cache reading/default behavior, real restart/removal/invalidation and continuous phantom chains. Cache lookup occurs only after native guards and resolves the saved owned boundary. Exactly3runtime method bodies changed/52others unchanged and all old test files byte unchanged.
3. Focused validity/tree/o3tl/list/lifecycle and boundary tests pass with vendor absent/restored, final types/lint and unchanged npm run verify pass all gates/both100%coverage. Exact4semantic paths/1metadata row evidence/responsibility each with status/default/divergence/sourceResponsibility enum preserved. Pin/hash integrity, zero Python/native/helper artifacts, diff/routing/doctor pass without new errors.
4. Record canonical verification and distinct same-actor EVALUATOR on actual implementation SHA, close only leaf with clean tracked state. Parent/full goal active; wider protected helper/state/context/dtor/notifiable/client/redline/layout/range/iterator/UI/lifetime obligations remain individually unverified.

## Verification

Pending.

## Rollback Plan

Revert only the actual semantic implementation commit if requested. Keep forbidden source/helper cleanup and pinned vendor unchanged.

## Findings

Preflight main/direct and clean. Pin9bc445578031fecf56086729d8e4940c77e14d65 freshly validated. Native header remains protected from line338; child and self declarations at482/490. Core self body652 delegates parent; child body676 guards saved boundary,nonnull child/exact parent and finds stored boundary before LessThan. Native insertion531 and invalidation1025 call self overload. Local has private child-only IsValid and direct saved-pointer comparison; insertion/invalidation use parent-child predicate. This is one measured contract/helper correction. No full module/status/default/goal promotion and registered save/open/recovery deviations unchanged.

- Observation: Fresh local execution read confirms the existing invalidation helper is named Invalidate, not InvalidateChild as the planning prose called it.
  Impact: No scope or behavior expansion; the approved native self-validity call concerns this same existing child-invalidation operation.
  Resolution: Use the actual Invalidate method name in implementation evidence and integrity checks; selected3changed bodies are AddChild,IsValid,Invalidate. All52other existing bodies remain unchanged.

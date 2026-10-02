---
id: "202610020611-HF3XGB"
title: "Restore protected number-tree counting policy contracts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-10-02T06:12:30.700Z"
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
    body: "Start: restore native counting-policy visibility and mandatory abstract contract under existing user authorization, preserving all policy logic, expected values and registered IO/recovery deviations."
events:
  -
    type: "status"
    at: "2026-10-02T06:12:31.345Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore native counting-policy visibility and mandatory abstract contract under existing user authorization, preserving all policy logic, expected values and registered IO/recovery deviations."
doc_version: 3
doc_updated_at: "2026-10-02T06:24:42.627Z"
doc_updated_by: "CODER"
description: "Restore protected abstract HasCountedChildren/IsCountedForNumbering/IsCountPhantoms in the native base and closest TypeScript protected SwNodeNum overrides. Keep existing policy bodies, adapt six diagnostic suites and complete foreign subclass obligation, verify exact types/defaults/virtual dispatch without invoking upstream from tests."
sections:
  Summary: "Iteration54 restores native protected counting-policy contracts for existing number-tree behavior. Pin9bc445578031fecf56086729d8e4940c77e14d65. Parent/full goal remains open."
  Scope: "Eleven semantic paths: SwNumberTree/SwNumberTree.ts and SwNodeNum.ts; existing SwNumberTree.test.ts, SwNumberTree-policy.test.ts, SwNumberTree-children.test.ts, txtnode/node-numbering-lifecycle.test.ts, txtnode/number-classification.test.ts, doc/number-pointer.test.ts; new SwNumberTree-counting-contract.test.ts; docs/program/source-provenance.json and docs/program/parity/runtime-inventory.json. Active leaf/parent bookkeeping allowed. No dependency/coverage/policy/IO/recovery or new registered deviation."
  Plan: "Restore protected abstract HasCountedChildren, IsCountedForNumbering and IsCountPhantoms in the base, use protected concrete overrides as TypeScript's narrowest permitted inherited access, keep all production bodies and values unchanged. Prove private override rejection with an owned inline virtual compiler fixture; no helper file saved. Adapt existing tests through test-only protected observers, complete ForeignNode's newly required numbering policy (true so native Writer type rejection remains meaningful). Add exact public-key/zero-argument/boolean/mandatory-abstract checks and polymorphic count-policy/default/raw-cache behavior checks. Fresh manual native declarations/body/hash evidence only. Focused suites without vendor and unchanged full verify; bounded metadata evidence on2rows, exact scope commits, canonical verification, distinct same-actor quality and clean close. No whole-module/private-C++/native-lifetime certification."
  Verify Steps: |-
    1. Fresh native base/derived declarations show protected pure virtual3policies and private SwNodeNum overrides. Manual body/hash inspection confirms production policies unchanged. Owned TypeScript virtual fixture proves private override is rejected and protected accepted; no source bodies/helpers saved in Agentplane. No project test reads/compiles/invokes pinned upstream.
    2. Baseline exact public-key/type/mandatory-abstract assertions expose preceding mismatch. Final exact zero-argument boolean signatures compile through a test subclass, all3policies absent from public base/derived surface, missing numbered policy is a compile error. Owned connected/unattached/phantom policies and a complete non-Writer subtype verify virtual dispatch, native defaults/counting and raw caches. Preserve all old literal and dynamic expected values across6diagnostic suites, including numbering classification/roundtrip/native-result matrices; method bodies unchanged, no production public proxies/casts.
    3. Focused tree/list/counting/lifecycle/classification tests pass with vendor absent and restored in finally. Full unchanged npm run verify passes all gates and both100%coverage. Metadata changes only2affected rows evidence/responsibilities; no status/default/deviation/gate promotions. Exact11semantic paths, reference pin/hash integrity, zero source/helper artifacts, routing/diff/doctor pass without new errors.
    4. Record actual implementation SHA and EVALUATOR-reviewed SHA, canonical verification and distinct same-actor review. Leaf DONE and checkout clean; parent/full goal stays active. TypeScript protected versus C++private narrowing limitation and native ordered-set/range/redline/lifetime/API gaps remain explicit, no new intentional-deviation registration.
  Verification: "Pending."
  Rollback Plan: "Revert only this leaf's actual implementation commit if requested; do not restore forbidden source/helper artifact copies or alter reference pin."
  Findings: |-
    Previous turn classified progress: native child-container/count restored, full gates passed. Fresh base declares IsCountedForNumbering pure virtual protected, local lacks it; HasCountedChildren and IsCountPhantoms are currently public. Native derived overrides private, a narrowing TypeScript disallows; protected overrides retain inherited polymorphism and remove public access without bridge architecture. No runtime external consumer of these node policies exists; similarly named SwNumRule API remains public and untouched.

    - Observation: New connected policy fixture incorrectly expected numbering after explicit removal; both baseline and changed runtime returnfalse. Native HasNumber depends on retained GetNum and RemoveFromList resets it. Initial type rewrite also missed one diagnostic PolicyRoot subclass call.
      Impact: No production regression or old expected-value change. Baseline type mismatches remain valid; first changed typecheck found only the missed test-only call.
      Resolution: Correct only the new detached numbering expectation tofalse using fresh native evidence; adapt the diagnostic subclass call through the same protected observer.15observer calls total. Preserve failure logs, rerun type and new runtime tests.

    - Observation: First full verify stopped at lint: the deliberately incomplete compile-error test class lacked JSDoc.
      Impact: No runtime/type/coverage gate was executed in this attempt; no production source or old expected value changes required.
      Resolution: Add JSDoc to the new diagnostic class, preserve first log, run focused lint and restart unchanged full verification. Same approved scope and acceptance criteria.
id_source: "generated"
---
## Summary

Iteration54 restores native protected counting-policy contracts for existing number-tree behavior. Pin9bc445578031fecf56086729d8e4940c77e14d65. Parent/full goal remains open.

## Scope

Eleven semantic paths: SwNumberTree/SwNumberTree.ts and SwNodeNum.ts; existing SwNumberTree.test.ts, SwNumberTree-policy.test.ts, SwNumberTree-children.test.ts, txtnode/node-numbering-lifecycle.test.ts, txtnode/number-classification.test.ts, doc/number-pointer.test.ts; new SwNumberTree-counting-contract.test.ts; docs/program/source-provenance.json and docs/program/parity/runtime-inventory.json. Active leaf/parent bookkeeping allowed. No dependency/coverage/policy/IO/recovery or new registered deviation.

## Plan

Restore protected abstract HasCountedChildren, IsCountedForNumbering and IsCountPhantoms in the base, use protected concrete overrides as TypeScript's narrowest permitted inherited access, keep all production bodies and values unchanged. Prove private override rejection with an owned inline virtual compiler fixture; no helper file saved. Adapt existing tests through test-only protected observers, complete ForeignNode's newly required numbering policy (true so native Writer type rejection remains meaningful). Add exact public-key/zero-argument/boolean/mandatory-abstract checks and polymorphic count-policy/default/raw-cache behavior checks. Fresh manual native declarations/body/hash evidence only. Focused suites without vendor and unchanged full verify; bounded metadata evidence on2rows, exact scope commits, canonical verification, distinct same-actor quality and clean close. No whole-module/private-C++/native-lifetime certification.

## Verify Steps

1. Fresh native base/derived declarations show protected pure virtual3policies and private SwNodeNum overrides. Manual body/hash inspection confirms production policies unchanged. Owned TypeScript virtual fixture proves private override is rejected and protected accepted; no source bodies/helpers saved in Agentplane. No project test reads/compiles/invokes pinned upstream.
2. Baseline exact public-key/type/mandatory-abstract assertions expose preceding mismatch. Final exact zero-argument boolean signatures compile through a test subclass, all3policies absent from public base/derived surface, missing numbered policy is a compile error. Owned connected/unattached/phantom policies and a complete non-Writer subtype verify virtual dispatch, native defaults/counting and raw caches. Preserve all old literal and dynamic expected values across6diagnostic suites, including numbering classification/roundtrip/native-result matrices; method bodies unchanged, no production public proxies/casts.
3. Focused tree/list/counting/lifecycle/classification tests pass with vendor absent and restored in finally. Full unchanged npm run verify passes all gates and both100%coverage. Metadata changes only2affected rows evidence/responsibilities; no status/default/deviation/gate promotions. Exact11semantic paths, reference pin/hash integrity, zero source/helper artifacts, routing/diff/doctor pass without new errors.
4. Record actual implementation SHA and EVALUATOR-reviewed SHA, canonical verification and distinct same-actor review. Leaf DONE and checkout clean; parent/full goal stays active. TypeScript protected versus C++private narrowing limitation and native ordered-set/range/redline/lifetime/API gaps remain explicit, no new intentional-deviation registration.

## Verification

Pending.

## Rollback Plan

Revert only this leaf's actual implementation commit if requested; do not restore forbidden source/helper artifact copies or alter reference pin.

## Findings

Previous turn classified progress: native child-container/count restored, full gates passed. Fresh base declares IsCountedForNumbering pure virtual protected, local lacks it; HasCountedChildren and IsCountPhantoms are currently public. Native derived overrides private, a narrowing TypeScript disallows; protected overrides retain inherited polymorphism and remove public access without bridge architecture. No runtime external consumer of these node policies exists; similarly named SwNumRule API remains public and untouched.

- Observation: New connected policy fixture incorrectly expected numbering after explicit removal; both baseline and changed runtime returnfalse. Native HasNumber depends on retained GetNum and RemoveFromList resets it. Initial type rewrite also missed one diagnostic PolicyRoot subclass call.
  Impact: No production regression or old expected-value change. Baseline type mismatches remain valid; first changed typecheck found only the missed test-only call.
  Resolution: Correct only the new detached numbering expectation tofalse using fresh native evidence; adapt the diagnostic subclass call through the same protected observer.15observer calls total. Preserve failure logs, rerun type and new runtime tests.

- Observation: First full verify stopped at lint: the deliberately incomplete compile-error test class lacked JSDoc.
  Impact: No runtime/type/coverage gate was executed in this attempt; no production source or old expected value changes required.
  Resolution: Add JSDoc to the new diagnostic class, preserve first log, run focused lint and restart unchanged full verification. Same approved scope and acceptance criteria.

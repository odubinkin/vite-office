---
id: "202610020854-S2PBHD"
title: "Restore native number-tree prefix invalidation API"
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
  updated_at: "2026-10-02T08:55:04.242Z"
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
    body: "Start: restore complete native protected prefix invalidation API and positional callers under continuing goal authorization; preserve old assertions and IO deviations."
events:
  -
    type: "status"
    at: "2026-10-02T08:55:04.932Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore complete native protected prefix invalidation API and positional callers under continuing goal authorization; preserve old assertions and IO deviations."
doc_version: 3
doc_updated_at: "2026-10-02T09:06:07.053Z"
doc_updated_by: "CODER"
description: "Iteration60 restores complete selected protected prefix API: required iterator-position SetLastValid with false-default validation, zero-argument InvalidateChildren and protected required-child Invalidate, adapting all existing callers to native positions/end. Owned regression tests and fresh manual source evidence; no upstream test access or saved helper/source copies."
sections:
  Summary: "Iteration60 restores the complete selected native protected prefix invalidation API; iteration59 made progress and parent/full goal remain active."
  Scope: "Exactly4semantic paths:apps/office/src/sw/source/core/SwNumberTree/SwNumberTree.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-prefix.test.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Own leaf and parent traceability only. No container API extension, compatibility bridge, policy/dependency/gate/registered IO/recovery changes or new deviations; no upstream/source/helper files in Agentplane."
  Plan: "Restore protected SetLastValid(index:number,validating=false), using the existing sorted-vector/GetIterator numeric index and -1 end representation. Mirror native guarded retained-boundary lookup, assignment, next-uncounted InvalidateChildren call, continuous suffix invalidation and parent GetIterator forwarding. Add protected zero-argument InvalidateChildren forwarding native end with omitted false; expose required-child Invalidate protected and adapt its predecessor index/end. Convert all existing insertion/cleanup/transfer/validation/removal call sites to their native iterator positions rather than pointer arguments, preserving control flow and old expected results. Add owned type and connected-document tests covering exact access/arity/defaults, prefix guards/rewinds/forward validation/end invalidation, next-uncounted helper dispatch, continuous suffix/upward propagation and direct first/middle/last invalidation. Fresh native declaration/body/call-site/hash inspection only; no compiled native or saved source/helpers. Update1base metadata row evidence/responsibility or justification per manifest, statuses/defaults/deviations/enums unchanged. Baseline new tests/typecheck fail prior code; final focused tests vendor absent/restored, types/lint/full unchanged verify all gates/both100%; AST check unchanged unrelated bodies and all old tests/literals byte-identical. Same-actor EVALUATOR actual semantic SHA and clean leaf close, parent/full goal active."
  Verify Steps: |-
    1. Fresh pinned header/core call-site and body hashes establish protected SetLastValid required iterator/false default, protected InvalidateChildren zero-arg end forwarding and protected Invalidate required child; pin exact and files unchanged. Existing numeric index/-1 end and undefined pointer representations remain explicit; no compiled native/full iterator/const/dtor/context lifetime certification.
    2. Baseline new owned prefix tests/typecheck expose preceding private pointer API and absent helper. Final inherited/public absence/required arity/optional boolean/void contracts plus real document prefix/rewind/forward/end/empty, following-uncounted dispatch and hierarchical/continuous suffix/upward/first-middle-last states pass. Old tests/literal fixtures byte unchanged; only approved prefix methods and positional call-site bodies differ, unrelated body AST equality. No aliases or public surrogate.
    3. Focused number-tree/o3tl/list/lifecycle and module-boundary tests pass with vendor absent/restored in finally. Final types/lint and unchanged full npm run verify all gates/both100%; exact4semantic paths,1metadata row each evidence/description only, statuses/defaults/divergences/enums unchanged. Pin/file/log integrity, zero ignored-inclusive Python/bytecode/native/helper artifacts, diff/routing/doctor0newerrors.
    4. Canonical verify and distinct same-actor EVALUATOR reviewed actual semantic SHA; clean leaf close, parent/full goal active. Wider helper access/context/client/dtor/notifiable/redline/layout/range/full iterator/browser/lifetime remain unverified.
  Verification: "Pending."
  Rollback Plan: "Revert only actual semantic commit if requested; preserve source/helper cleanup and pinned vendor. No history rewrite."
  Findings: |-
    Preflight main/direct clean at93c43d48e39097ead8f6aac2fffcef94af9c4fc5. Previous goal turn PROGRESS: iteration59 closed, native protected state restored. Fresh header433..445 and core959..1035 show selected3protected methods and iterator contract; local SetLastValid is private pointer API and next-uncounted code bypasses absent InvalidateChildren. Local GetIterator and sorted-vector find already use numeric positions/-1 end.12call sites require conversion; no old tests invoke these helpers directly. Native invalid iterator UB and C++const/mutable/destructor are outside selected defined-input contract.

    Implementation evidence:9existing prefix/positional-caller bodies change,46other base/derived method bodies remain unchanged and InvalidateChildren is the sole added runtime method. All216old test files remain byte-identical. Final focused81app/19files and7boundary tests pass vendor absent/restored; new5tests all pass. Initial authored optional-tuple type assertion omitted the explicit undefined allowed by TypeScript optional parameters; corrected only the new tuple and bound inherited methods directly for exact signature inspection, then reran final authored tests/typecheck against the unchanged baseline in memory with production restored in finally. Final baseline4runtime regressions and protected/missing/type errors remain; final types/lint pass. No old expected values or gates changed. Native2file/16span hashes unchanged, exact4semantic paths and1metadata evidence/description row each, zero forbidden source/helper artifacts. Full verify is running on live session54060; no completion claim yet.
id_source: "generated"
---
## Summary

Iteration60 restores the complete selected native protected prefix invalidation API; iteration59 made progress and parent/full goal remain active.

## Scope

Exactly4semantic paths:apps/office/src/sw/source/core/SwNumberTree/SwNumberTree.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-prefix.test.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Own leaf and parent traceability only. No container API extension, compatibility bridge, policy/dependency/gate/registered IO/recovery changes or new deviations; no upstream/source/helper files in Agentplane.

## Plan

Restore protected SetLastValid(index:number,validating=false), using the existing sorted-vector/GetIterator numeric index and -1 end representation. Mirror native guarded retained-boundary lookup, assignment, next-uncounted InvalidateChildren call, continuous suffix invalidation and parent GetIterator forwarding. Add protected zero-argument InvalidateChildren forwarding native end with omitted false; expose required-child Invalidate protected and adapt its predecessor index/end. Convert all existing insertion/cleanup/transfer/validation/removal call sites to their native iterator positions rather than pointer arguments, preserving control flow and old expected results. Add owned type and connected-document tests covering exact access/arity/defaults, prefix guards/rewinds/forward validation/end invalidation, next-uncounted helper dispatch, continuous suffix/upward propagation and direct first/middle/last invalidation. Fresh native declaration/body/call-site/hash inspection only; no compiled native or saved source/helpers. Update1base metadata row evidence/responsibility or justification per manifest, statuses/defaults/deviations/enums unchanged. Baseline new tests/typecheck fail prior code; final focused tests vendor absent/restored, types/lint/full unchanged verify all gates/both100%; AST check unchanged unrelated bodies and all old tests/literals byte-identical. Same-actor EVALUATOR actual semantic SHA and clean leaf close, parent/full goal active.

## Verify Steps

1. Fresh pinned header/core call-site and body hashes establish protected SetLastValid required iterator/false default, protected InvalidateChildren zero-arg end forwarding and protected Invalidate required child; pin exact and files unchanged. Existing numeric index/-1 end and undefined pointer representations remain explicit; no compiled native/full iterator/const/dtor/context lifetime certification.
2. Baseline new owned prefix tests/typecheck expose preceding private pointer API and absent helper. Final inherited/public absence/required arity/optional boolean/void contracts plus real document prefix/rewind/forward/end/empty, following-uncounted dispatch and hierarchical/continuous suffix/upward/first-middle-last states pass. Old tests/literal fixtures byte unchanged; only approved prefix methods and positional call-site bodies differ, unrelated body AST equality. No aliases or public surrogate.
3. Focused number-tree/o3tl/list/lifecycle and module-boundary tests pass with vendor absent/restored in finally. Final types/lint and unchanged full npm run verify all gates/both100%; exact4semantic paths,1metadata row each evidence/description only, statuses/defaults/divergences/enums unchanged. Pin/file/log integrity, zero ignored-inclusive Python/bytecode/native/helper artifacts, diff/routing/doctor0newerrors.
4. Canonical verify and distinct same-actor EVALUATOR reviewed actual semantic SHA; clean leaf close, parent/full goal active. Wider helper access/context/client/dtor/notifiable/redline/layout/range/full iterator/browser/lifetime remain unverified.

## Verification

Pending.

## Rollback Plan

Revert only actual semantic commit if requested; preserve source/helper cleanup and pinned vendor. No history rewrite.

## Findings

Preflight main/direct clean at93c43d48e39097ead8f6aac2fffcef94af9c4fc5. Previous goal turn PROGRESS: iteration59 closed, native protected state restored. Fresh header433..445 and core959..1035 show selected3protected methods and iterator contract; local SetLastValid is private pointer API and next-uncounted code bypasses absent InvalidateChildren. Local GetIterator and sorted-vector find already use numeric positions/-1 end.12call sites require conversion; no old tests invoke these helpers directly. Native invalid iterator UB and C++const/mutable/destructor are outside selected defined-input contract.

Implementation evidence:9existing prefix/positional-caller bodies change,46other base/derived method bodies remain unchanged and InvalidateChildren is the sole added runtime method. All216old test files remain byte-identical. Final focused81app/19files and7boundary tests pass vendor absent/restored; new5tests all pass. Initial authored optional-tuple type assertion omitted the explicit undefined allowed by TypeScript optional parameters; corrected only the new tuple and bound inherited methods directly for exact signature inspection, then reran final authored tests/typecheck against the unchanged baseline in memory with production restored in finally. Final baseline4runtime regressions and protected/missing/type errors remain; final types/lint pass. No old expected values or gates changed. Native2file/16span hashes unchanged, exact4semantic paths and1metadata evidence/description row each, zero forbidden source/helper artifacts. Full verify is running on live session54060; no completion claim yet.

---
id: "202610131158-MQBXWY"
title: "Implement Calc matrix storage initialization and coordinate replication"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-13T11:59:05.064Z"
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
    body: "Start: implement approved original matrix storage/coordinate slice under explicit user resume and GC-first constraints, calc checkout only."
events:
  -
    type: "status"
    at: "2026-10-13T11:59:06.899Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved original matrix storage/coordinate slice under explicit user resume and GC-first constraints, calc checkout only."
doc_version: 3
doc_updated_at: "2026-10-13T12:14:01.077Z"
doc_updated_by: "CODER"
description: "Iteration83: genuine ScMatrixImpl matrix/flag traits and three storage constructors plus dimensions, count, coordinate validation/replication and numeric query over reused shared mdds. JavaScript GC owns containers, no native pool/refcounts or interpreter substitutes. Preserve original empty/single-axis coordinate semantics; native source excerpts and scoped raw100 evidence, inventory and docs."
sections:
  Summary: "Iteration83: initialize the actual internal Calc matrix storage and coordinate replication over shared mdds."
  Scope: "Calc branch only. sc/source/core/tool/scmatrix.ts and focused test/native fixture; one native probe helper; current ScMatrix provenance/runtime/capability records, calc-core and GC adaptation docs. Original matrix_traits/matrix_flag_traits and three constructors, explicit content Clear, GetDimensions/GetElementCount/ValidColRow/ValidColRowReplicated/ValidColRowOrReplicated/IsNumeric. No public ScMatrix facade, interpreter substitute, memory pool/refcount/destructor manager, or Writer changes."
  Plan: "Original internal matrix typed storage initialization and coordinate replication over shared mdds, explicit GC adaptation without pool/refcount or fake interpreter; ordinary original native observations, inventory, whole Calc/affected shared raw100, exact review and canonical close."
  Verify Steps: |-
    1. node scripts/calc-matrix-storage-native-probe.mjs --check and complete new storage test: original source constructor/geometry/replication/numeric observations across empty, rectangular, scalar and vector initialization and coordinates. No interpreter or native lifetime parity claim.
    2. node output/playwright/task83-checks/portable.mjs: entire Calc and whole affected shared mdds/SAL/SVL owners with raw S/B/F/L100 and every raw counter positive, source links absent/restored, static build and Calc browser profile.
    3. node output/playwright/task83-checks/gates.mjs: formatting, lint, types, dependencies, docs, size, resources, tree, provenance, inventory registry/invariants, routing, doctor, diff, tooling and inventory tests.
    4. Same-agent separate EVALUATOR exact source/test/fixture/config hashes tied to commit; canonical DONE and clean all-files git status. No full suite before cadence91; no Writer repairs or claims of complete ScMatrix/UI readiness.
  Verification: "Command: node scripts/calc-matrix-storage-native-probe.mjs --write then --check. Result: pass. Evidence: unchanged original selected definitions over449original source hashes and genuine pinned mdds/SAL/SVL,6ordinary positive terminal commands, complete41517-byte storage stream; declaration scaffold only, no sanitizer execution, pool/destructor parity or fake interpreter. Command: node output/playwright/task83-checks/portable.mjs and --checks-only. Result: pass after recorded caller UInt8 serialization/test parameter corrections. Evidence: entire Calc126tests37files24executable owners raw3114S2112B536F2754L and shared242tests48files39executable owners raw4028S2063B829F3611L, all S/B/F/L100 and every raw counter positive. Complete new test replayed on final parameter-name bytes; runtime maps unchanged. Four original links absent/restored, static build and Calc browser profile0UI pass. Command: node output/playwright/task83-checks/gates.mjs. Result:16gates pass,36tooling tests10files and123inventory tests38files configured coverage100. Scope: actual internal matrix initialization/geometry/coordinate slice over existing shared owners, inventory declares GC adaptation. Public matrix facade, interpreter, cell/document/UI remain unported; no Writer changes or native allocation/exception certification. Exact committed-source same-agent separate EVALUATOR pending before canonical close; next full cadence91."
  Rollback Plan: "Revert only intentional iteration83 changes through a new task; no history rewriting, merges or unrelated task changes."
  Findings: |-
    Upstream storage constructors debit a global native element pool and destructor credits it. Per user GC-first instruction omit that memory-management ledger; no fake interpreter binding or public matrix completion claim. Shared mdds and shared string semantics are reused.

    - Observation: Initial targeted launch referenced absent apps/office/vitest.config.ts and did not execute tests. No source/fixture failure. Native capture succeeds with41517bytes.
      Impact: Invocation-only error; use existing Calc configured profile, no verification weakening.
      Resolution: Run declared whole Calc and related shared portable profiles and record actual results.

    - Observation: Typecheck reports unused initializer callback parameter in the new test; constructor/coordinate native stream remains unchanged and checked.
      Impact: Test typing only, no runtime or acceptance drift.
      Resolution: Rename the unused callback parameter and replay complete new test on final bytes, then final gates.

    - Observation: First portable Calc aborts on native caller UInt8 stream formatting: ostream emitted byte255 as a character whereas TS emits its numeric value. All preceding storage/coordinate observations match.
      Impact: Caller serialization error only; no production or original method drift. Failed stream/log retained.
      Resolution: Explicitly print flag UInt8 as int in the native observer, regenerate/check fixture and rerun whole Calc/affected shared profiles.

    - Observation: Calc126/shared242 profiles pass raw100. Static build reveals callback rename changed its JSDoc only because Prettier split the signature across lines.
      Impact: Missed test parameter edit, no runtime/map/fixture drift. Failed static log retained.
      Resolution: Rename actual multiline callback parameter, replay complete new test on final bytes and source-absent build/profile; existing whole runtime raw maps remain valid.

    - Observation: Native storage capture/check, Calc126/shared242 raw100, source-absent static/profile and16final gates pass. Four reference links restored, no Writer/shared runtime modifications.
      Impact: Original internal storage/coordinates are implemented over reused shared containers with an explicit GC allocation-ledger adaptation. Public matrix/interpreter/document/UI remain outside this leaf.
      Resolution: Commit intentional nine source/test/fixture/docs/metadata paths, review exact committed bytes in a separate same-agent EVALUATOR phase and canonical finish; goal remains active after explicit user resume.
id_source: "generated"
---
## Summary

Iteration83: initialize the actual internal Calc matrix storage and coordinate replication over shared mdds.

## Scope

Calc branch only. sc/source/core/tool/scmatrix.ts and focused test/native fixture; one native probe helper; current ScMatrix provenance/runtime/capability records, calc-core and GC adaptation docs. Original matrix_traits/matrix_flag_traits and three constructors, explicit content Clear, GetDimensions/GetElementCount/ValidColRow/ValidColRowReplicated/ValidColRowOrReplicated/IsNumeric. No public ScMatrix facade, interpreter substitute, memory pool/refcount/destructor manager, or Writer changes.

## Plan

Original internal matrix typed storage initialization and coordinate replication over shared mdds, explicit GC adaptation without pool/refcount or fake interpreter; ordinary original native observations, inventory, whole Calc/affected shared raw100, exact review and canonical close.

## Verify Steps

1. node scripts/calc-matrix-storage-native-probe.mjs --check and complete new storage test: original source constructor/geometry/replication/numeric observations across empty, rectangular, scalar and vector initialization and coordinates. No interpreter or native lifetime parity claim.
2. node output/playwright/task83-checks/portable.mjs: entire Calc and whole affected shared mdds/SAL/SVL owners with raw S/B/F/L100 and every raw counter positive, source links absent/restored, static build and Calc browser profile.
3. node output/playwright/task83-checks/gates.mjs: formatting, lint, types, dependencies, docs, size, resources, tree, provenance, inventory registry/invariants, routing, doctor, diff, tooling and inventory tests.
4. Same-agent separate EVALUATOR exact source/test/fixture/config hashes tied to commit; canonical DONE and clean all-files git status. No full suite before cadence91; no Writer repairs or claims of complete ScMatrix/UI readiness.

## Verification

Command: node scripts/calc-matrix-storage-native-probe.mjs --write then --check. Result: pass. Evidence: unchanged original selected definitions over449original source hashes and genuine pinned mdds/SAL/SVL,6ordinary positive terminal commands, complete41517-byte storage stream; declaration scaffold only, no sanitizer execution, pool/destructor parity or fake interpreter. Command: node output/playwright/task83-checks/portable.mjs and --checks-only. Result: pass after recorded caller UInt8 serialization/test parameter corrections. Evidence: entire Calc126tests37files24executable owners raw3114S2112B536F2754L and shared242tests48files39executable owners raw4028S2063B829F3611L, all S/B/F/L100 and every raw counter positive. Complete new test replayed on final parameter-name bytes; runtime maps unchanged. Four original links absent/restored, static build and Calc browser profile0UI pass. Command: node output/playwright/task83-checks/gates.mjs. Result:16gates pass,36tooling tests10files and123inventory tests38files configured coverage100. Scope: actual internal matrix initialization/geometry/coordinate slice over existing shared owners, inventory declares GC adaptation. Public matrix facade, interpreter, cell/document/UI remain unported; no Writer changes or native allocation/exception certification. Exact committed-source same-agent separate EVALUATOR pending before canonical close; next full cadence91.

## Rollback Plan

Revert only intentional iteration83 changes through a new task; no history rewriting, merges or unrelated task changes.

## Findings

Upstream storage constructors debit a global native element pool and destructor credits it. Per user GC-first instruction omit that memory-management ledger; no fake interpreter binding or public matrix completion claim. Shared mdds and shared string semantics are reused.

- Observation: Initial targeted launch referenced absent apps/office/vitest.config.ts and did not execute tests. No source/fixture failure. Native capture succeeds with41517bytes.
  Impact: Invocation-only error; use existing Calc configured profile, no verification weakening.
  Resolution: Run declared whole Calc and related shared portable profiles and record actual results.

- Observation: Typecheck reports unused initializer callback parameter in the new test; constructor/coordinate native stream remains unchanged and checked.
  Impact: Test typing only, no runtime or acceptance drift.
  Resolution: Rename the unused callback parameter and replay complete new test on final bytes, then final gates.

- Observation: First portable Calc aborts on native caller UInt8 stream formatting: ostream emitted byte255 as a character whereas TS emits its numeric value. All preceding storage/coordinate observations match.
  Impact: Caller serialization error only; no production or original method drift. Failed stream/log retained.
  Resolution: Explicitly print flag UInt8 as int in the native observer, regenerate/check fixture and rerun whole Calc/affected shared profiles.

- Observation: Calc126/shared242 profiles pass raw100. Static build reveals callback rename changed its JSDoc only because Prettier split the signature across lines.
  Impact: Missed test parameter edit, no runtime/map/fixture drift. Failed static log retained.
  Resolution: Rename actual multiline callback parameter, replay complete new test on final bytes and source-absent build/profile; existing whole runtime raw maps remain valid.

- Observation: Native storage capture/check, Calc126/shared242 raw100, source-absent static/profile and16final gates pass. Four reference links restored, no Writer/shared runtime modifications.
  Impact: Original internal storage/coordinates are implemented over reused shared containers with an explicit GC allocation-ledger adaptation. Public matrix/interpreter/document/UI remain outside this leaf.
  Resolution: Commit intentional nine source/test/fixture/docs/metadata paths, review exact committed bytes in a separate same-agent EVALUATOR phase and canonical finish; goal remains active after explicit user resume.

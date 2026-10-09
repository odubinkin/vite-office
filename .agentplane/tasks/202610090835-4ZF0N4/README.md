---
id: "202610090835-4ZF0N4"
title: "Restore native table frame layout ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 17
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T08:52:59.156Z"
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
    body: "Start: Restore original native table layout ownership and deterministic temporary-client lifetimes, preserving existing documented I/O/recovery deviations and explicit persistent root/page gaps."
events:
  -
    type: "status"
    at: "2026-10-09T08:36:45.566Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore original native table layout ownership and deterministic temporary-client lifetimes, preserving existing documented I/O/recovery deviations and explicit persistent root/page gaps."
doc_version: 3
doc_updated_at: "2026-10-09T09:19:57.870Z"
doc_updated_by: "CODER"
description: "Iteration251 under C9TN6M: replace the standalone SwTabFrame geometry object with native SwLayoutFrame registration and linked original row/cell ownership, including deterministic lifetime at all temporary production consumers. This is the required table hierarchy prerequisite for persistent page/root/UI integration; preserve documented recovery/open/save/settings deviations."
sections:
  Summary: "Restore native SwTabFrame layout registration and original linked row/cell ownership; eliminate redundant temporary cell registration during width queries and guarantee production temporary-frame cleanup."
  Scope: "Writer only: sw/source/core/layout/tabfrm.ts, wsfrm.ts and newfrm.ts; sw/source/core/frmedt/fetab.ts and tblsel.ts; sw/source/uibase/table/swtablerep.ts; sw/browser/editor/WriterEditableTable.tsx and browser-writer-edit-window.ts. Fresh table-hierarchy/lifetime tests and related native tests as needed for actual contract migration; matching canonical Writer runtime/provenance records, task bounded evidence, append-only parent Findings. No source/helper copies under AgentPlane, dependency setup, network or registered I/O/recovery/settings changes. Persistent page/root ownership and full follows remain subsequent work."
  Plan: "Implement the approved eight-module native table ownership/lifetime scope and sixteen canonical records. Preserve native original identities, callbacks and documented I/O/recovery deviations. Verify with independent hierarchy/width/claim/history/render/exception/mouse lifetime cases and related modules, actual all-four100 plus declared scoped gates. Initial targeted210pass1freshfail produced no V8 maps with reportOnFailure=false; one recovery of the selected profile is required to collect absent actual evidence after explicitly restoring width in the fresh patch test, with reportOnFailure enabled. All subsequent closures failed/new/unexecuted-only; retain raw failures and transfer only complete unchanged source/body/location proofs. Native persistent root/page/follows and scalar table item ownership remain subsequent work, no broad promotion or full251. Record same-agent non-independent evaluator, commit/finish leaf, final clean state."
  Verify Steps: "1. Compare pinned9bc445578031fecf56086729d8e4940c77e14d65 SwTabFrame constructor/DestroyImpl and frame.hxx type bits. Assert original registration and linked row/cell pointers, empty-row admission, native claim/history and deterministic recursive destruction; actual browser rendering, hidden measurement, geometry and mouse replacement/unmount lifetimes. Tests never invoke upstream. 2. Run targeted new/related tests upstream-absent with actual all-four100 coverage. Initial210pass1freshfail emitted no maps because reportOnFailure=false; permit one recovery of the selected profile solely to collect missing actual coverage after correcting the fresh patch-width expectation. Enable reportOnFailure, preserve raw results, and keep later closures failed/new/unexecuted-only. Transfer prior counters only with whole source or complete declaration/body/enclosing-branch/location proof; never lower thresholds or sanitize counters. Last full247, no full251. 3. Scoped format/lint/type/dependency/docs/size/static build upstream-absent, restore finally and preserve exact clean native pin. Canonical registry build/scoped/global/provenance/tree/routing/doctor pass. 4. Bounded task evidence, explicitly non-independent same-agent evaluator, scoped implementation commit/finish semanticSHA and final Writer clean state. Parent/broad goal active; persistent page/root/follows/content/redlines/full native table attributes remain unverified."
  Verification: |-
    Command: declared upstream-absent targeted Vitest coverage profiles, npm run typecheck/check:dependencies/check:docs/check:file-size/test:static, scoped Prettier/ESLint; canonical inventory:registry:build/inventory:parity:writer/inventory:registry:check/check:source-provenance/check:source-tree and routing/doctor.
    Result: pass.
    Evidence: 232 unique cases,12 fresh,0 unresolved. Approved recovery210 passing replay solely for discarded maps; subsequent failed/new/unexecuted-only closures. Exact all-four100 app318 and changed8 source-bound coverage; all declared static and inventory gates exit0.16 canonical records preserve old fields/prefixes/status/default/classification.
    Scope: registered native SwTabFrame lower hierarchy and deterministic production lifetime/width borrowing, not full native page/root/follows/content/redlines/table-item/UI parity. Same-agent evaluator explicitly non-independent. Last full247,no full251. Raw maps/results/helper code remain ignored outside AgentPlane; bounded English identifiers/counts/hashes only committed.
  Rollback Plan: "Normal revert of the scoped implementation if requested; no reset, checkout/dependency change, upstream modification or user merge."
  Findings: |-
    Read-only audit: current SwTabFrame is a standalone geometry facade with no native registration or linked rows. Native inherits SwLayoutFrame and creates SwRowFrame lowers, retaining only nonempty rows. Current production geometry consumers rely on resource-free construction; all must release newly represented native registrations. UI separately reconstructs each row and width query separately constructs a cell; those redundant temporary clients can be removed by borrowing the new table lower hierarchy. Persistent root/page owners and full follow/content layout remain later work.

    - Observation: Initial targeted profile passed210 cases and failed1 fresh width test: SetFormat merges a patch, so omitting width retains explicit zero. reportOnFailure was not enabled and Vitest discarded all V8 maps after the failure.
      Impact: Runtime tests have valid results but no actual changed-module coverage counters were emitted. Source-bound coverage cannot be claimed from these results.
      Resolution: Correct the fresh test to explicitly restore width4000. One recovery profile of the same selected new/related tests is necessary solely to obtain missing actual coverage evidence; enable reportOnFailure and preserve raw results. Subsequent closures remain failed/new/unexecuted-only; no upstream-present profile or full251.

    - Observation: Correction to earlier width-test diagnosis: SwTable.SetFormat replaces the scalar format and AdjustWidths rescales original cells when both widths change. Setting width zero zeroed the cells; explicit table-width restoration does not restore those zero cell widths. The previous patch-merge explanation was incorrect.
      Impact: The fresh fixture conflated owned-cell width adjustment with the print-width zero/default branches; production hierarchy behavior was not the source of the failure.
      Resolution: Use a separately constructed zero-width original table, then explicitly set the original peer cell width3500 before removing table width to prove the default sum4000. Rerun only this failed fresh case; the recovery210pass1fail profile now retains its raw V8 maps.

    Verified targeted closure: 232 unique cases including12 fresh native table hierarchy/lifetime scenarios pass; original fresh width failure corrected and closed failed-only. One approved recovery repeats210 passing cases solely for discarded coverage evidence; later closures add only failed/new/unexecuted cases. Final exact source-bound all-four100: changed8 modules1122 lines1229 statements237 functions973 branch arms; app318 modules18296 lines20091 statements4591 functions14693 branch arms, with310 whole byte-identical old modules and exact unchanged complete declaration/body/enclosing-condition/location proofs for four other modules. Raw threshold failures retained; no counters sanitized, thresholds reduced or unsupported skips. 506 old app acceptance files byte-identical; one native table-lifetime contract migration retains original assertions. All declared static and canonical registry/provenance/tree/routing checks pass; doctor0errors retains three prior warnings. Sixteen canonical records retain historical fields/status/default/classification/evidence prefixes, no broad promotion. Persistent page/root/follows/content/redline/table-item propagation remains unverified; registered I/O/recovery/settings deviations unchanged. Last full247, no full251.

    Tool scaffolding observations: a helper used const for a reassigned test-path variable, then the attempted registry-note append treated provenance evidence as an array. Both local preparation failures occurred before their intended checks; partial additions were inspected and completed without duplicating tests or notes. Raw tool failures retained, production source unchanged by recovery.
id_source: "generated"
---
## Summary

Restore native SwTabFrame layout registration and original linked row/cell ownership; eliminate redundant temporary cell registration during width queries and guarantee production temporary-frame cleanup.

## Scope

Writer only: sw/source/core/layout/tabfrm.ts, wsfrm.ts and newfrm.ts; sw/source/core/frmedt/fetab.ts and tblsel.ts; sw/source/uibase/table/swtablerep.ts; sw/browser/editor/WriterEditableTable.tsx and browser-writer-edit-window.ts. Fresh table-hierarchy/lifetime tests and related native tests as needed for actual contract migration; matching canonical Writer runtime/provenance records, task bounded evidence, append-only parent Findings. No source/helper copies under AgentPlane, dependency setup, network or registered I/O/recovery/settings changes. Persistent page/root ownership and full follows remain subsequent work.

## Plan

Implement the approved eight-module native table ownership/lifetime scope and sixteen canonical records. Preserve native original identities, callbacks and documented I/O/recovery deviations. Verify with independent hierarchy/width/claim/history/render/exception/mouse lifetime cases and related modules, actual all-four100 plus declared scoped gates. Initial targeted210pass1freshfail produced no V8 maps with reportOnFailure=false; one recovery of the selected profile is required to collect absent actual evidence after explicitly restoring width in the fresh patch test, with reportOnFailure enabled. All subsequent closures failed/new/unexecuted-only; retain raw failures and transfer only complete unchanged source/body/location proofs. Native persistent root/page/follows and scalar table item ownership remain subsequent work, no broad promotion or full251. Record same-agent non-independent evaluator, commit/finish leaf, final clean state.

## Verify Steps

1. Compare pinned9bc445578031fecf56086729d8e4940c77e14d65 SwTabFrame constructor/DestroyImpl and frame.hxx type bits. Assert original registration and linked row/cell pointers, empty-row admission, native claim/history and deterministic recursive destruction; actual browser rendering, hidden measurement, geometry and mouse replacement/unmount lifetimes. Tests never invoke upstream. 2. Run targeted new/related tests upstream-absent with actual all-four100 coverage. Initial210pass1freshfail emitted no maps because reportOnFailure=false; permit one recovery of the selected profile solely to collect missing actual coverage after correcting the fresh patch-width expectation. Enable reportOnFailure, preserve raw results, and keep later closures failed/new/unexecuted-only. Transfer prior counters only with whole source or complete declaration/body/enclosing-branch/location proof; never lower thresholds or sanitize counters. Last full247, no full251. 3. Scoped format/lint/type/dependency/docs/size/static build upstream-absent, restore finally and preserve exact clean native pin. Canonical registry build/scoped/global/provenance/tree/routing/doctor pass. 4. Bounded task evidence, explicitly non-independent same-agent evaluator, scoped implementation commit/finish semanticSHA and final Writer clean state. Parent/broad goal active; persistent page/root/follows/content/redlines/full native table attributes remain unverified.

## Verification

Command: declared upstream-absent targeted Vitest coverage profiles, npm run typecheck/check:dependencies/check:docs/check:file-size/test:static, scoped Prettier/ESLint; canonical inventory:registry:build/inventory:parity:writer/inventory:registry:check/check:source-provenance/check:source-tree and routing/doctor.
Result: pass.
Evidence: 232 unique cases,12 fresh,0 unresolved. Approved recovery210 passing replay solely for discarded maps; subsequent failed/new/unexecuted-only closures. Exact all-four100 app318 and changed8 source-bound coverage; all declared static and inventory gates exit0.16 canonical records preserve old fields/prefixes/status/default/classification.
Scope: registered native SwTabFrame lower hierarchy and deterministic production lifetime/width borrowing, not full native page/root/follows/content/redlines/table-item/UI parity. Same-agent evaluator explicitly non-independent. Last full247,no full251. Raw maps/results/helper code remain ignored outside AgentPlane; bounded English identifiers/counts/hashes only committed.

## Rollback Plan

Normal revert of the scoped implementation if requested; no reset, checkout/dependency change, upstream modification or user merge.

## Findings

Read-only audit: current SwTabFrame is a standalone geometry facade with no native registration or linked rows. Native inherits SwLayoutFrame and creates SwRowFrame lowers, retaining only nonempty rows. Current production geometry consumers rely on resource-free construction; all must release newly represented native registrations. UI separately reconstructs each row and width query separately constructs a cell; those redundant temporary clients can be removed by borrowing the new table lower hierarchy. Persistent root/page owners and full follow/content layout remain later work.

- Observation: Initial targeted profile passed210 cases and failed1 fresh width test: SetFormat merges a patch, so omitting width retains explicit zero. reportOnFailure was not enabled and Vitest discarded all V8 maps after the failure.
  Impact: Runtime tests have valid results but no actual changed-module coverage counters were emitted. Source-bound coverage cannot be claimed from these results.
  Resolution: Correct the fresh test to explicitly restore width4000. One recovery profile of the same selected new/related tests is necessary solely to obtain missing actual coverage evidence; enable reportOnFailure and preserve raw results. Subsequent closures remain failed/new/unexecuted-only; no upstream-present profile or full251.

- Observation: Correction to earlier width-test diagnosis: SwTable.SetFormat replaces the scalar format and AdjustWidths rescales original cells when both widths change. Setting width zero zeroed the cells; explicit table-width restoration does not restore those zero cell widths. The previous patch-merge explanation was incorrect.
  Impact: The fresh fixture conflated owned-cell width adjustment with the print-width zero/default branches; production hierarchy behavior was not the source of the failure.
  Resolution: Use a separately constructed zero-width original table, then explicitly set the original peer cell width3500 before removing table width to prove the default sum4000. Rerun only this failed fresh case; the recovery210pass1fail profile now retains its raw V8 maps.

Verified targeted closure: 232 unique cases including12 fresh native table hierarchy/lifetime scenarios pass; original fresh width failure corrected and closed failed-only. One approved recovery repeats210 passing cases solely for discarded coverage evidence; later closures add only failed/new/unexecuted cases. Final exact source-bound all-four100: changed8 modules1122 lines1229 statements237 functions973 branch arms; app318 modules18296 lines20091 statements4591 functions14693 branch arms, with310 whole byte-identical old modules and exact unchanged complete declaration/body/enclosing-condition/location proofs for four other modules. Raw threshold failures retained; no counters sanitized, thresholds reduced or unsupported skips. 506 old app acceptance files byte-identical; one native table-lifetime contract migration retains original assertions. All declared static and canonical registry/provenance/tree/routing checks pass; doctor0errors retains three prior warnings. Sixteen canonical records retain historical fields/status/default/classification/evidence prefixes, no broad promotion. Persistent page/root/follows/content/redline/table-item propagation remains unverified; registered I/O/recovery/settings deviations unchanged. Last full247, no full251.

Tool scaffolding observations: a helper used const for a reassigned test-path variable, then the attempted registry-note append treated provenance evidence as an array. Both local preparation failures occurred before their intended checks; partial additions were inspected and completed without duplicating tests or notes. Raw tool failures retained, production source unchanged by recovery.

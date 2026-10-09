---
id: "202610090835-4ZF0N4"
title: "Restore native table frame layout ownership"
result_summary: "Native table frame ownership restored with232 targeted cases, all-four100 source-bound coverage and16 verified canonical inventory records; persistent page/root parity remains open."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 20
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
  state: "ok"
  updated_at: "2026-10-09T09:21:15.487Z"
  updated_by: "CODER"
  note: "Native table frame ownership verified:232 unique targeted cases,12 fresh,0 unresolved; approved coverage-recovery210 passing replay explicitly recorded, later failed/new/unexecuted-only closures. Source-bound all-four100 app318/changed8; all scoped static and16 canonical inventory gates pass. Upstream-absent runtime/build restored finally; persistent page/root/full parity remains unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-09T09:21:19.353Z"
  updated_by: "EVALUATOR"
  note: "Same-agent non-independent review: original registered native table/row/cell hierarchy and deterministic consumer lifetimes satisfy the bounded leaf scope;232 targeted cases and all declared gates pass."
  evaluated_sha: "1b7dd23819577fb36c0f87fda4327efcf4ba801f"
  blueprint_digest: "2688b63f96bebdadb203e4d8c0cdf9a6a170a7ac2f3149f69495858b57c698ec"
  evidence_refs:
    - ".agentplane/tasks/202610090835-4ZF0N4/README.md"
    - ".agentplane/tasks/202610090835-4ZF0N4/quality/20261009-092119353-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610090835-4ZF0N4/quality/20261009-092119353-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610090835-4ZF0N4/quality/20261009-092119353-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610090835-4ZF0N4/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610090835-4ZF0N4/evidence/checks.json"
    - ".agentplane/tasks/202610090835-4ZF0N4/evidence/coverage.json"
  findings:
    - "SwTabFrame now inherits SwLayoutFrame, registers the original table format, links nonempty original native row/cell lowers, and borrows cell widths. JSX owns one hierarchy; temporary geometry/flow/split/dialog consumers and retained mouse samples release clients in finally or replacement/unmount."
    - "Source-bound exact all-four100 uses actual current maps plus complete unchanged declarations/bodies/enclosing conditions/all mapped locations. Initial discarded maps required one approved210 passing recovery replay; raw failures retained, later closures only failed/new/unexecuted.506 old acceptance files byte-identical, one literal-preserving ownership migration."
    - "All16 canonical runtime/provenance records preserve old status/default/classification and evidence prefixes, without whole module or goal promotion. Registry build/scoped/global/provenance/tree/routing pass;doctor0errors with3 prior warnings."
commit:
  hash: "1b7dd23819577fb36c0f87fda4327efcf4ba801f"
  message: "🛠️ 4ZF0N4 layout: restore native table frame ownership"
comments:
  -
    author: "CODER"
    body: "Start: Restore original native table layout ownership and deterministic temporary-client lifetimes, preserving existing documented I/O/recovery deviations and explicit persistent root/page gaps."
  -
    author: "CODER"
    body: "Verified: Native table hierarchy and deterministic production lifetimes pass232 unique targeted cases and all declared source-bound coverage/static/inventory gates; sixteen canonical records retain historical metadata and registered deviations."
events:
  -
    type: "status"
    at: "2026-10-09T08:36:45.566Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore original native table layout ownership and deterministic temporary-client lifetimes, preserving existing documented I/O/recovery deviations and explicit persistent root/page gaps."
  -
    type: "verify"
    at: "2026-10-09T09:21:15.487Z"
    author: "CODER"
    state: "ok"
    note: "Native table frame ownership verified:232 unique targeted cases,12 fresh,0 unresolved; approved coverage-recovery210 passing replay explicitly recorded, later failed/new/unexecuted-only closures. Source-bound all-four100 app318/changed8; all scoped static and16 canonical inventory gates pass. Upstream-absent runtime/build restored finally; persistent page/root/full parity remains unverified."
  -
    type: "status"
    at: "2026-10-09T09:22:16.540Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Native table hierarchy and deterministic production lifetimes pass232 unique targeted cases and all declared source-bound coverage/static/inventory gates; sixteen canonical records retain historical metadata and registered deviations."
doc_version: 3
doc_updated_at: "2026-10-09T09:22:16.541Z"
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

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T09:21:15.487Z — VERIFY — ok

    By: CODER

    Note: Native table frame ownership verified:232 unique targeted cases,12 fresh,0 unresolved; approved coverage-recovery210 passing replay explicitly recorded, later failed/new/unexecuted-only closures. Source-bound all-four100 app318/changed8; all scoped static and16 canonical inventory gates pass. Upstream-absent runtime/build restored finally; persistent page/root/full parity remains unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T09:19:57.870Z, excerpt_hash=sha256:892ddc163ae8e8587f97b51a9b615fd91c7ceb497620a57b73be3d1672c46697

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610090835-4ZF0N4/blueprint/resolved-snapshot.json
    - old_digest: 2688b63f96bebdadb203e4d8c0cdf9a6a170a7ac2f3149f69495858b57c698ec
    - current_digest: 2688b63f96bebdadb203e4d8c0cdf9a6a170a7ac2f3149f69495858b57c698ec
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610090835-4ZF0N4

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610090835-4ZF0N4
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
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

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T09:21:15.487Z — VERIFY — ok

By: CODER

Note: Native table frame ownership verified:232 unique targeted cases,12 fresh,0 unresolved; approved coverage-recovery210 passing replay explicitly recorded, later failed/new/unexecuted-only closures. Source-bound all-four100 app318/changed8; all scoped static and16 canonical inventory gates pass. Upstream-absent runtime/build restored finally; persistent page/root/full parity remains unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T09:19:57.870Z, excerpt_hash=sha256:892ddc163ae8e8587f97b51a9b615fd91c7ceb497620a57b73be3d1672c46697

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610090835-4ZF0N4/blueprint/resolved-snapshot.json
- old_digest: 2688b63f96bebdadb203e4d8c0cdf9a6a170a7ac2f3149f69495858b57c698ec
- current_digest: 2688b63f96bebdadb203e4d8c0cdf9a6a170a7ac2f3149f69495858b57c698ec
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610090835-4ZF0N4

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610090835-4ZF0N4
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

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

---
id: "202610090732-MND6MH"
title: "Restore native table frame validity on format replacement and history"
result_summary: "verified-202610090732-MND6MH"
status: "DONE"
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
  updated_at: "2026-10-09T07:33:40.027Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T07:59:15.307Z"
  updated_by: "CODER"
  note: "verified-202610090732-MND6MH"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-09T07:57:56.115Z"
  updated_by: "EVALUATOR"
  note: "Same-agent non-independent review: iteration249 bounded native detached frame validity and exact replacement/history state transitions satisfy declared evidence on implementation d4ebd1f5fa81."
  evaluated_sha: "d4ebd1f5fa81202aaceb2fcb3abf01fb160aac15"
  blueprint_digest: "3ecef8a55349efbd44710d9d55a7f864ea9bf7418cf319293bf831703a5bf0dd"
  evidence_refs:
    - ".agentplane/tasks/202610090732-MND6MH/README.md"
    - ".agentplane/tasks/202610090732-MND6MH/quality/20261009-075756115-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610090732-MND6MH/quality/20261009-075756115-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610090732-MND6MH/quality/20261009-075756115-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610090732-MND6MH/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610090732-MND6MH/evidence/verification.json"
    - ".agentplane/tasks/202610090732-MND6MH/evidence/coverage.json"
    - "d4ebd1f5fa81"
  findings:
    - "Reviewed native pinned flags/hooks and row/cell handler order, independent state/owner/real-history cases,132 unique tests and source-bound actual all-four100 coverage. Final command gates and four canonical registry records preserve prior semantic fields and evidence prefixes. Raw failed attempts and partial threshold exits remain retained; no goal or whole-module promotion."
commit:
  hash: "d4ebd1f5fa81202aaceb2fcb3abf01fb160aac15"
  message: "🧩 MND6MH code: restore native table frame validity"
comments:
  -
    author: "CODER"
    body: "Start: Implement approved iteration249 native frame validity and replacement/history invalidation in Writer only; preserve silent shared claims and document remaining persistent UI frame integration."
  -
    author: "CODER"
    body: "Verified: verified-202610090732-MND6MH. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-10-09T07:34:01.037Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved iteration249 native frame validity and replacement/history invalidation in Writer only; preserve silent shared claims and document remaining persistent UI frame integration."
  -
    type: "verify"
    at: "2026-10-09T07:57:54.687Z"
    author: "CODER"
    state: "ok"
    note: "132 unique app cases including19 fresh passed upstream-absent with finally restoration. Current changed wsfrm/tabfrm actual counters188/211/61/114 all-four100;318file application certificate retains316 exact whole sources/maps and complete unchanged regions with current changed function counters. Final type/lint/format/build/dependency/docs/size/source/provenance/scoped+global registry/routing/doctor gates pass. Implementation d4ebd1f5fa81; broad physical root/UI integration remains incomplete."
  -
    type: "verify"
    at: "2026-10-09T07:59:15.307Z"
    author: "CODER"
    state: "ok"
    note: "verified-202610090732-MND6MH"
  -
    type: "status"
    at: "2026-10-09T07:59:15.404Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202610090732-MND6MH. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-10-09T07:59:15.404Z"
doc_updated_by: "CODER"
description: "Iteration249 under C9TN6M: port represented SwFrame validity and paint state and exact row/cell replacement versus history invalidation from pinned LibreOffice. Keep silent shared claims unchanged; prepare native physical-frame invalidation foundation without claiming persistent browser frame integration."
sections:
  Summary: "Restore missing native physical row/cell frame validity transitions on format replacement and history."
  Scope: "apps/office/src/sw/source/core/layout/wsfrm.ts, tabfrm.ts; new native frame invalidation tests and directly related history test additions; matching canonical docs/program/registry/writer/provenance records; this task evidence and append-only parent Findings. No network, upstream artifact copies, registered I/O/recovery changes, or dependency setup task. User's standing iterative-development authorization applies."
  Plan: "1. CODER ports native represented SwFrame validity, allowed/action hooks, complete-paint state and replacement/history row/cell invalidation from pinned frame.hxx/wsfrm.cxx/tabfrm.cxx. Keep physical-client registration and silent ClaimFrameFormat order unchanged. 2. Add independent native state-transition tests including shared peers, lower cell invalidation, repeated clients and real undo/redo. Update only matching canonical Writer provenance with bounded scope and retained status/omissions. 3. Run new/related Writer tests with actual V8 all-four100 for changed modules once upstream is absent; retain unchanged-source certificates only after byte/hash checks. Run scoped format/lint/type/dependency/source/registry checks; restore local symlink in finally. Commit and close leaf only; broad parent remains active. Persistent root/table frame ownership and UI invalidation integration are explicit next work, not claimed here."
  Verify Steps: |-
    1. Compare native initial flags, inline InvalidateSize/Prt/Pos/All and underscore behavior, hooks, complete paint and row/cell replacement/history ordering against pinned9bc445578031fecf56086729d8e4940c77e14d65 source.
    2. Once upstream absent run new+related Writer native ownership/history/layout/render tests; all cases pass. Actual V8 changed wsfrm/tabfrm all-four100, no threshold/counter/skip sanitization. Reuse unchanged source coverage only with source/map/proof SHA validation. No full suite replay this leaf; last full247.
    3. Scoped Prettier/ESLint plus typecheck, dependency/JSDoc/file-size checks and local static build pass upstream absent. Restore link finally, verify pin/clean upstream, registry/provenance/source tree/routing audits. Run AP doctor and same-agent explicitly non-independent evaluator.
    4. Commit scoped implementation then record verification and finish; final Writer git status clean. Broad native UI/layout parity stays incomplete.
  Verification: |-
    Command: node apps/office/node_modules/.cache/parity-coverage/MND6MH-profile.cjs initial; closure; typefix (exact V8 argv and source/map/proof hashes recorded in evidence/verification.json and evidence/coverage.json).
    Result: pass for132 unique app cases including19 new, zero final failed cases. Initial130pass; fresh-only geometry1pass17filtered; current changed reinitialization1pass18filtered. All profiles upstream-absent and finally-restored. Raw focused threshold exit1 retained; actual current changed modules all-four100:188lines211statements61functions114branches. Entire application318files all-four100 from316 byte-identical source/maps with verified246 certificate digests plus complete current changed function and unchanged declaration/body/enclosing branch/location proofs. No passing case replay or counter/threshold/skip normalization.
    Scope: detached native frame validity, original row/cell replacement/history, repeated/shared clients, real UndoRedo and related flat layout/render ownership. Full native page/root/UI physical frames remain unverified.

    Command: npm run typecheck; scoped Prettier and ESLint; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run test:static.
    Result: pass on final source. Scope: implementation contracts,29 supported cross-module edges,1059 JSDoc/1062 file-size sources, static browser build. Existing size review candidates and bundle warning are unchanged. Static checks/build use absent upstream; final symlink restored.

    Command: npm run inventory:registry:build; npm run inventory:parity:writer; npm run inventory:registry:check; npm run check:source-provenance; npm run check:source-tree; node .agentplane/policy/check-routing.mjs; ap doctor.
    Result: pass; four compatibility views generated;321 module records,732 registry records,114 source paths and33 retired roots validated. Four matching canonical runtime/provenance records preserve old semantic fields/evidence prefixes and add exact local/upstream symbols plus bounded tests. Native subtree pin9bc445578031fecf56086729d8e4940c77e14d65 clean.
    Scope: registry schema/identities/source evidence integrity, not whole-project parity. Doctor0errors,3 pre-existing warnings; no hook upgrade or immutable no-op history rewrite.
    Last full247; no full249. Whole goal remains incomplete.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T07:57:54.687Z — VERIFY — ok

    By: CODER

    Note: 132 unique app cases including19 fresh passed upstream-absent with finally restoration. Current changed wsfrm/tabfrm actual counters188/211/61/114 all-four100;318file application certificate retains316 exact whole sources/maps and complete unchanged regions with current changed function counters. Final type/lint/format/build/dependency/docs/size/source/provenance/scoped+global registry/routing/doctor gates pass. Implementation d4ebd1f5fa81; broad physical root/UI integration remains incomplete.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T07:56:31.323Z, excerpt_hash=sha256:e5859cc6e115c2421774c60c71488ab5127d3ac48b8688d721c20f82f43629db

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610090732-MND6MH/blueprint/resolved-snapshot.json
    - old_digest: 3ecef8a55349efbd44710d9d55a7f864ea9bf7418cf319293bf831703a5bf0dd
    - current_digest: 3ecef8a55349efbd44710d9d55a7f864ea9bf7418cf319293bf831703a5bf0dd
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610090732-MND6MH

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610090732-MND6MH
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-10-09T07:59:15.307Z — VERIFY — ok

    By: CODER

    Note: verified-202610090732-MND6MH
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T07:57:54.747Z, excerpt_hash=sha256:e5859cc6e115c2421774c60c71488ab5127d3ac48b8688d721c20f82f43629db

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610090732-MND6MH/blueprint/resolved-snapshot.json
    - old_digest: 3ecef8a55349efbd44710d9d55a7f864ea9bf7418cf319293bf831703a5bf0dd
    - current_digest: 3ecef8a55349efbd44710d9d55a7f864ea9bf7418cf319293bf831703a5bf0dd
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610090732-MND6MH

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610090732-MND6MH --result verified-202610090732-MND6MH --commit fd4ebb79ab255cf22ddbcfda883d8da8eb880997
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this leaf's implementation commit with normal git revert if requested; do not reset user commits or remove environment symlink/dependencies."
  Findings: |-
    Read-only source audit confirmed existing SwRowFrame and SwCellFrame only retarget clients on replacement/history, omitting native validity and painting state. Full geometry, follows, native page/root invalidation and persistent browser physical-frame integration remain unverified.

    - Observation: Three fresh geometry-case scaffolding attempts failed due nonexistent listener enumeration and subsequent correction errors; initial core130 cases were green. Typecheck found a generic this-to-layout assertion. Raw partial V8 threshold exits and no-test discovery output remain ignored-cache evidence.
      Impact: Only the new geometry case and current reinitialization needed closure; no production runtime semantic defect or unchanged passing replay.
      Resolution: Use actual ForAllListeners identity enumeration; fresh geometry case passed. Native static row cast uses explicit unknown intermediate, same represented row discriminator. Current whole reinitialization was separately remeasured and unchanged complete declaration/body/all-location region proofs bind the remaining file. Final lint/type/build and registry gates pass. Persistent page/root/UI physical frame integration, fixed geometry/content/follows/direction/collapsing-border reactions and native area-definition base split remain next work; no complete parity claim.
id_source: "generated"
---
## Summary

Restore missing native physical row/cell frame validity transitions on format replacement and history.

## Scope

apps/office/src/sw/source/core/layout/wsfrm.ts, tabfrm.ts; new native frame invalidation tests and directly related history test additions; matching canonical docs/program/registry/writer/provenance records; this task evidence and append-only parent Findings. No network, upstream artifact copies, registered I/O/recovery changes, or dependency setup task. User's standing iterative-development authorization applies.

## Plan

1. CODER ports native represented SwFrame validity, allowed/action hooks, complete-paint state and replacement/history row/cell invalidation from pinned frame.hxx/wsfrm.cxx/tabfrm.cxx. Keep physical-client registration and silent ClaimFrameFormat order unchanged. 2. Add independent native state-transition tests including shared peers, lower cell invalidation, repeated clients and real undo/redo. Update only matching canonical Writer provenance with bounded scope and retained status/omissions. 3. Run new/related Writer tests with actual V8 all-four100 for changed modules once upstream is absent; retain unchanged-source certificates only after byte/hash checks. Run scoped format/lint/type/dependency/source/registry checks; restore local symlink in finally. Commit and close leaf only; broad parent remains active. Persistent root/table frame ownership and UI invalidation integration are explicit next work, not claimed here.

## Verify Steps

1. Compare native initial flags, inline InvalidateSize/Prt/Pos/All and underscore behavior, hooks, complete paint and row/cell replacement/history ordering against pinned9bc445578031fecf56086729d8e4940c77e14d65 source.
2. Once upstream absent run new+related Writer native ownership/history/layout/render tests; all cases pass. Actual V8 changed wsfrm/tabfrm all-four100, no threshold/counter/skip sanitization. Reuse unchanged source coverage only with source/map/proof SHA validation. No full suite replay this leaf; last full247.
3. Scoped Prettier/ESLint plus typecheck, dependency/JSDoc/file-size checks and local static build pass upstream absent. Restore link finally, verify pin/clean upstream, registry/provenance/source tree/routing audits. Run AP doctor and same-agent explicitly non-independent evaluator.
4. Commit scoped implementation then record verification and finish; final Writer git status clean. Broad native UI/layout parity stays incomplete.

## Verification

Command: node apps/office/node_modules/.cache/parity-coverage/MND6MH-profile.cjs initial; closure; typefix (exact V8 argv and source/map/proof hashes recorded in evidence/verification.json and evidence/coverage.json).
Result: pass for132 unique app cases including19 new, zero final failed cases. Initial130pass; fresh-only geometry1pass17filtered; current changed reinitialization1pass18filtered. All profiles upstream-absent and finally-restored. Raw focused threshold exit1 retained; actual current changed modules all-four100:188lines211statements61functions114branches. Entire application318files all-four100 from316 byte-identical source/maps with verified246 certificate digests plus complete current changed function and unchanged declaration/body/enclosing branch/location proofs. No passing case replay or counter/threshold/skip normalization.
Scope: detached native frame validity, original row/cell replacement/history, repeated/shared clients, real UndoRedo and related flat layout/render ownership. Full native page/root/UI physical frames remain unverified.

Command: npm run typecheck; scoped Prettier and ESLint; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run test:static.
Result: pass on final source. Scope: implementation contracts,29 supported cross-module edges,1059 JSDoc/1062 file-size sources, static browser build. Existing size review candidates and bundle warning are unchanged. Static checks/build use absent upstream; final symlink restored.

Command: npm run inventory:registry:build; npm run inventory:parity:writer; npm run inventory:registry:check; npm run check:source-provenance; npm run check:source-tree; node .agentplane/policy/check-routing.mjs; ap doctor.
Result: pass; four compatibility views generated;321 module records,732 registry records,114 source paths and33 retired roots validated. Four matching canonical runtime/provenance records preserve old semantic fields/evidence prefixes and add exact local/upstream symbols plus bounded tests. Native subtree pin9bc445578031fecf56086729d8e4940c77e14d65 clean.
Scope: registry schema/identities/source evidence integrity, not whole-project parity. Doctor0errors,3 pre-existing warnings; no hook upgrade or immutable no-op history rewrite.
Last full247; no full249. Whole goal remains incomplete.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T07:57:54.687Z — VERIFY — ok

By: CODER

Note: 132 unique app cases including19 fresh passed upstream-absent with finally restoration. Current changed wsfrm/tabfrm actual counters188/211/61/114 all-four100;318file application certificate retains316 exact whole sources/maps and complete unchanged regions with current changed function counters. Final type/lint/format/build/dependency/docs/size/source/provenance/scoped+global registry/routing/doctor gates pass. Implementation d4ebd1f5fa81; broad physical root/UI integration remains incomplete.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T07:56:31.323Z, excerpt_hash=sha256:e5859cc6e115c2421774c60c71488ab5127d3ac48b8688d721c20f82f43629db

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610090732-MND6MH/blueprint/resolved-snapshot.json
- old_digest: 3ecef8a55349efbd44710d9d55a7f864ea9bf7418cf319293bf831703a5bf0dd
- current_digest: 3ecef8a55349efbd44710d9d55a7f864ea9bf7418cf319293bf831703a5bf0dd
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610090732-MND6MH

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610090732-MND6MH
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-10-09T07:59:15.307Z — VERIFY — ok

By: CODER

Note: verified-202610090732-MND6MH
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T07:57:54.747Z, excerpt_hash=sha256:e5859cc6e115c2421774c60c71488ab5127d3ac48b8688d721c20f82f43629db

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610090732-MND6MH/blueprint/resolved-snapshot.json
- old_digest: 3ecef8a55349efbd44710d9d55a7f864ea9bf7418cf319293bf831703a5bf0dd
- current_digest: 3ecef8a55349efbd44710d9d55a7f864ea9bf7418cf319293bf831703a5bf0dd
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610090732-MND6MH

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610090732-MND6MH --result verified-202610090732-MND6MH --commit fd4ebb79ab255cf22ddbcfda883d8da8eb880997
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this leaf's implementation commit with normal git revert if requested; do not reset user commits or remove environment symlink/dependencies.

## Findings

Read-only source audit confirmed existing SwRowFrame and SwCellFrame only retarget clients on replacement/history, omitting native validity and painting state. Full geometry, follows, native page/root invalidation and persistent browser physical-frame integration remain unverified.

- Observation: Three fresh geometry-case scaffolding attempts failed due nonexistent listener enumeration and subsequent correction errors; initial core130 cases were green. Typecheck found a generic this-to-layout assertion. Raw partial V8 threshold exits and no-test discovery output remain ignored-cache evidence.
  Impact: Only the new geometry case and current reinitialization needed closure; no production runtime semantic defect or unchanged passing replay.
  Resolution: Use actual ForAllListeners identity enumeration; fresh geometry case passed. Native static row cast uses explicit unknown intermediate, same represented row discriminator. Current whole reinitialization was separately remeasured and unchanged complete declaration/body/all-location region proofs bind the remaining file. Final lint/type/build and registry gates pass. Persistent page/root/UI physical frame integration, fixed geometry/content/follows/direction/collapsing-border reactions and native area-definition base split remain next work; no complete parity claim.

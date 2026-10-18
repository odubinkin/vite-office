---
id: "202610141822-MZPZ3F"
title: "Implement canonical shared set items for Calc page attributes"
result_summary: "Implement shared set items and canonical base item-set value copies"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T18:23:52.855Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-14T18:33:58.321Z"
  updated_by: "CODER"
  note: "Original shared set items/base copies verified:96related/9files,180Calc/71files,38boundaries;5shared raw S279B188F72L248 and33Calc S4172B2731F821L3720 everycounterpositive100. One Writer-only owner gap measured/left. Portable build/13source gates/635records zero violations,34paths/3819hashes/11pins/four links. CALC-119 retained named-rvalue copy, no move/lifetime/provider fake; full document/UIODS pending. Same-agent quality not independent."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-14T18:33:51.510Z"
  updated_by: "EVALUATOR"
  note: "Original shared set-item ownership and Calc header/footer dependencies meet task140 scope; same-agent review is not independent."
  evaluated_sha: "d575937ec4433a37e47faa2e2ce329517c52e0de"
  blueprint_digest: "09c0093ac4a6b83b41b154dc5aebe46004f375fc1e60d6a4554c1b758dea39ac"
  evidence_refs:
    - ".agentplane/tasks/202610141822-MZPZ3F/README.md"
    - ".agentplane/tasks/202610141822-MZPZ3F/quality/20261014-183351510-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610141822-MZPZ3F/quality/20261014-183351510-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610141822-MZPZ3F/quality/20261014-183351510-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610141822-MZPZ3F/blueprint/resolved-snapshot.json"
    - "output/playwright/task140-checks/verification.json"
    - "output/playwright/task140-checks/source-gates.json"
    - "output/playwright/task140-checks/source-contract-audit.json"
  findings:
    - "Source-grounded base copy slicing and CloneAsValue pool/state/parent rules, actual set-item flag, SfxSetItem abstract ownership and SvxSetItem concrete copy/equality/presentation are implemented through existing services. Named rvalue still copies; CALC-119 documents it without a defect claim or memory engine."
    - "96related cases,180Calc,38boundary cases pass;5complete shared owners and33Calc owners every raw counter positive100. One changed Writer owner coverage-only gap is measured/exempt and untouched; runtime behavior unchanged apart from TS-required override annotation."
    - "Portable build and13source gates pass;635runtime/provenance records zero violations,34intentional paths/3819source hashes/11native pins/four restored links. Native type dependencies are explicit without reverse edges; inline flags have actual header evidence. No full document/UI/ODS or readiness claim."
commit:
  hash: "d575937ec4433a37e47faa2e2ce329517c52e0de"
  message: "Implement MZPZ3F core: canonical shared set items and base value copies"
comments:
  -
    author: "CODER"
    body: "Start: implement original shared set items/base value-copy contracts and Calc183/184 dependencies; preserve native named-rvalue copy and Writer hidden overload without move or lifetime machinery."
  -
    author: "CODER"
    body: "Verified: canonical shared set-item ownership and Calc header/footer183/184 dependencies;96related,180Calc,38boundaries pass, shared/Calc raw100, Writer-only gaps left, portable build/source/inventory gates pass with34intentional paths."
events:
  -
    type: "status"
    at: "2026-10-14T18:23:59.721Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original shared set items/base value-copy contracts and Calc183/184 dependencies; preserve native named-rvalue copy and Writer hidden overload without move or lifetime machinery."
  -
    type: "verify"
    at: "2026-10-14T18:33:58.321Z"
    author: "CODER"
    state: "ok"
    note: "Original shared set items/base copies verified:96related/9files,180Calc/71files,38boundaries;5shared raw S279B188F72L248 and33Calc S4172B2731F821L3720 everycounterpositive100. One Writer-only owner gap measured/left. Portable build/13source gates/635records zero violations,34paths/3819hashes/11pins/four links. CALC-119 retained named-rvalue copy, no move/lifetime/provider fake; full document/UIODS pending. Same-agent quality not independent."
  -
    type: "status"
    at: "2026-10-14T18:34:18.330Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: canonical shared set-item ownership and Calc header/footer183/184 dependencies;96related,180Calc,38boundaries pass, shared/Calc raw100, Writer-only gaps left, portable build/source/inventory gates pass with34intentional paths."
doc_version: 3
doc_updated_at: "2026-10-14T18:34:18.331Z"
doc_updated_by: "CODER"
description: "Task140 ports actual SfxSetItem/SvxSetItem and required SfxItemSet copy/CloneAsValue plus isSetItem flag for real Calc183/184. Both native initial-value overloads copy even rvalue; no move or lifetime engine. Preserve native pool/parent/state behavior and reuse existing item-set ownership."
sections:
  Summary: "Task140 adds actual shared SfxSetItem/SvxSetItem for Calc header/footer sets, with required original SfxItemSet copy/CloneAsValue contracts and item classification flag. User continuation authorizes canonical shared and necessary Writer edits in calc."
  Scope: "At most45intentional source/doc/inventory paths: SfxPoolItem flag and presentation enum header; SfxItemSet original copy/CloneAsValue; SfxSetItem sitem implementation/setitem header; SvxSetItem pageitem implementation/header; required override annotation in SwAttrSet preserving its native hidden overload; Calc183/184/direct source-range item-set tests; focused shared/Writer tests; matching runtime/provenance/capability; calc-core and calc-upstream-suspected-issues docs. Source-backed svl-to-tools and svx-to-sal type dependencies require corresponding check-module-boundaries declarations/tests; no reverse edges. Reuse existing item storage, real OUString/MapUnit. No SfxAllItemSet fake, move/lifetime engine, localization provider, native probe, full DocPool or document stub."
  Plan: "Port original shared set-item ownership, base item-set copy/CloneAsValue and classification, Svx page-set wrapper and no-service presentation for Calc183/184. Both upstream initial overloads copy. Preserve Writer hidden overload behavior, no move/lifetime or fake provider. Bound45paths, strict whole shared/Calc raw100/related Writer tests/portable build/source gates/pins/hashes and clean calc."
  Verify Steps: "Original SfxItemSet copy constructor with SET/INVALID/DISABLED and parent/ranges/pool, independent mutable deltas, slicing real derived set without calling virtual Clone, empty ranges. CloneAsValue defaults and includeItems false, same/foreign pool SET-only semantics, parent/state rules and base-only debug-precondition host guard. Preserve SwAttrSet native CloneAsValue overload and Clone behavior; annotate override only where TypeScript requires it, measure Writer changed-owner gaps but do not repair coverage-only gaps. SfxPoolItem isSetItem false for normal items and true for set items; original SfxItemPresentation Nameless0Complete1. SfxSetItem abstract base, Which/value and copy(pool) construction, independent owned set, concrete same-type nested Equals(true), retained pool/parent identity comparisons; SvxSetItem explicit initial set/copy/default-pool/foreign-pool Clone. Both erased native initial argument categories copy the source, no move/reset. Real OUString base GetPresentation false leaves text; Svx false clears text, all parameters ignored. Calc183/184 sets have actual upstream ranges148,150-152,156-157,160,163-166 and start empty; no fake dynamic ItemInfo provider. Whole changed shared executable owners and whole Calc every raw S/B/F/L counter positive100, related actual Writer tests, reference links absent during tests/build and restored finally. Scoped prettier/eslint, typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff, module-boundary tests, production build. Pin actual native sources, audit exact45paths and source hashes, clean calc. Full suite remains human readiness-gated to real minimum UI plus same-model ODS then repair/pause."
  Verification: |-
    - Command: `node output/playwright/task140-checks/portable.mjs`, then justified `--shared-only` replay after the typed constructor/test updates.
    - Result: pass after completing the selected base-owner coverage.
    - Evidence:96related cases/9files;5complete changed shared executable owners strict raw S279/B188/F72/L248 at100, every counter positive. WholeCalc180cases/71files,33owners strict raw S4172/B2731/F821/L3720 at100, every counter positive. All4reference links absent during runs/restored in finally. Actual Writer notification/history/component and restart cases pass. The complete changed Writer owner swatrset.ts has81statement/75branch/31function zero counters in this selection; these Writer-only coverage gaps are measured and intentionally not repaired. Its production change is the required override annotation only. No repository coverage threshold/exclusion/raw-map modifications.
    - Scope: original base copy/CloneAsValue and derived slicing, nested set ownership/copy/equality/classification, same/foreign pool states/parents, false presentation with actual OUString, actual Calc183/184ranged-set ownership. Initial runtime tests passed, while strict raw gate correctly rejected existing base unsupported-value/invalid-identity paths absent from selection; actual inherited contract assertions close shared gaps. Final related evidence is fresh on exact current shared sources; Calc owners did not change after its complete passing run.

    - Command: `node output/playwright/task140-checks/build-portable.mjs`.
    - Result: pass.
    - Evidence:production build with4source links absent/restored finally. Existing chunk-size advisory retained.
    - Scope: application build; no frontend behavior change or browser-flow run required by this scope.

    - Command: scoped `npx prettier --check`, `npx eslint ... --max-warnings 0`, `npm run typecheck`, `npm run check:docs`, `npm run check:file-size`, `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, `npm run inventory:parity`, `node .agentplane/policy/check-routing.mjs`, `ap doctor`, `git diff --check`, `npx vitest run scripts/check-module-boundaries.test.ts`.
    - Result: pass after explicit tuple typing and primary-file metadata correction.
    - Evidence:1891authored JSDoc files,634runtime dependency sources/2839relative imports/94allowed edges,114required tree paths/33retired roots,635runtime/provenance records with zero semantic violations,38boundary tests.13source gates pass. Source-backed svl-to-tools and svx-to-sal dependencies have no reverse edges. New inline flag witnesses map to the actual poolitem.hxx in evidence without falsely appending header-only names to the existing poolitem.cxx primary-symbol list. Initial gate logs are retained. Final scoped formatting/diff check also passes; existing managed hook-shim warning unchanged.
    - Scope:34intentional paths within45approved,9runtime/provenance pairs and bounded capability.3811to3819non-agent source hashes,26existing changes/8new/3785unchanged;11native source pins/original native HEAD/four restored links/calc branch. Evidence: `output/playwright/task140-checks/verification.json`, `source-gates.json`, `source-contract-audit.json` and retained logs. Source audit confirms named-rvalue copy, exact base-value clone precondition, Calc constants/ranges and actual MapUnit forward declaration/OUString output; initial parser whitespace and assumed direct-header-include checks were corrected by reading the source. This is not C++ execution, generated probes or ABI evidence. Same-agent evaluation is explicitly not independent.

    CALC-119 records the surprising named-rvalue copy as possibly intentional, not a confirmed defect. Native cache/refcount/registration/ABI/assertion infrastructure is not recreated, and unused IntlWrapper stays an erased opaque parameter without a service stub. ItemInfoDynamic/full page services, real ScDocumentPool/ScPatternAttr/ScColumn/ScTable/ScDocument, connected UI and same-model ODS remain pending. Human moved full-suite/pause checkpoint to actual minimum UI+ODS readiness; it is not reached by this task.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-14T18:33:58.321Z — VERIFY — ok

    By: CODER

    Note: Original shared set items/base copies verified:96related/9files,180Calc/71files,38boundaries;5shared raw S279B188F72L248 and33Calc S4172B2731F821L3720 everycounterpositive100. One Writer-only owner gap measured/left. Portable build/13source gates/635records zero violations,34paths/3819hashes/11pins/four links. CALC-119 retained named-rvalue copy, no move/lifetime/provider fake; full document/UIODS pending. Same-agent quality not independent.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T18:33:28.479Z, excerpt_hash=sha256:3dee479264818e07131ffd91328bf8778d20505f273e977e98a7f5b09e863cbb

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610141822-MZPZ3F/blueprint/resolved-snapshot.json
    - old_digest: 09c0093ac4a6b83b41b154dc5aebe46004f375fc1e60d6a4554c1b758dea39ac
    - current_digest: 09c0093ac4a6b83b41b154dc5aebe46004f375fc1e60d6a4554c1b758dea39ac
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610141822-MZPZ3F

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610141822-MZPZ3F -m 🧩 MZPZ3F task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task changes through a subsequent authorized task; no destructive reset, merge or publication."
  Findings: |-
    Native SfxSetItem rvalue overload initializes maSet(pS), which copies the named lvalue. Preserve source behavior and do not infer a move from the signature or build memory machinery. Native CloneAsValue asserts base type; construction from a derived source uses real base copy instead. Existing SwAttrSet hides the C++ nonvirtual method with its native own return type; TypeScript requires an override annotation without new Writer behavior. Same-agent quality review is not independent.

    - Observation: Initial source checks found erased constructor tuple typing incompatible with readonly structural narrowing/explicit undefined, and required native signature edges svl-to-tools and svx-to-sal absent from dependency allowlist.
      Impact: Runtime tests passed; typed native MapUnit/OUString declarations need explicit canonical module dependencies, and tuples must admit existing optional-parent calls. No behavior fallback or source scope expansion beyond native dependencies.
      Resolution: Require actual SfxItemSet class source, admit explicit undefined in tuple arguments, register two source-backed dependencies with boundary tests; rerun affected checks and fresh related raw coverage.

    - Observation: Initial complete raw coverage gate found existing SfxPoolItem base QueryValue/PutValue and invalid SetWhich paths absent from the selected tests; Calc tests passed.
      Impact: Strict shared owner verification required the real inherited unsupported-value and identity-rejection contracts; Writer-only SwAttrSet gaps are separately exempt.
      Resolution: Added actual set-item base QueryValue/PutValue and atomic invalid SetWhich assertions, then fresh complete shared coverage passes every raw counter. One Writer-only owner gap remains measured and unchanged; no threshold/map/exclusion changes.

    - Observation: Source provenance rejected newly appended inline flag names under the existing poolitem.cxx primary symbol list; the actual new methods live in poolitem.hxx.
      Impact: Metadata primary-file scope was overbroad; code and typed/runtime checks were unaffected.
      Resolution: Retained original primary source mapping/history and original primary symbols; new flag method evidence points explicitly to real poolitem.hxx. Recheck provenance/inventory without changing enforcement or application sources.
id_source: "generated"
---
## Summary

Task140 adds actual shared SfxSetItem/SvxSetItem for Calc header/footer sets, with required original SfxItemSet copy/CloneAsValue contracts and item classification flag. User continuation authorizes canonical shared and necessary Writer edits in calc.

## Scope

At most45intentional source/doc/inventory paths: SfxPoolItem flag and presentation enum header; SfxItemSet original copy/CloneAsValue; SfxSetItem sitem implementation/setitem header; SvxSetItem pageitem implementation/header; required override annotation in SwAttrSet preserving its native hidden overload; Calc183/184/direct source-range item-set tests; focused shared/Writer tests; matching runtime/provenance/capability; calc-core and calc-upstream-suspected-issues docs. Source-backed svl-to-tools and svx-to-sal type dependencies require corresponding check-module-boundaries declarations/tests; no reverse edges. Reuse existing item storage, real OUString/MapUnit. No SfxAllItemSet fake, move/lifetime engine, localization provider, native probe, full DocPool or document stub.

## Plan

Port original shared set-item ownership, base item-set copy/CloneAsValue and classification, Svx page-set wrapper and no-service presentation for Calc183/184. Both upstream initial overloads copy. Preserve Writer hidden overload behavior, no move/lifetime or fake provider. Bound45paths, strict whole shared/Calc raw100/related Writer tests/portable build/source gates/pins/hashes and clean calc.

## Verify Steps

Original SfxItemSet copy constructor with SET/INVALID/DISABLED and parent/ranges/pool, independent mutable deltas, slicing real derived set without calling virtual Clone, empty ranges. CloneAsValue defaults and includeItems false, same/foreign pool SET-only semantics, parent/state rules and base-only debug-precondition host guard. Preserve SwAttrSet native CloneAsValue overload and Clone behavior; annotate override only where TypeScript requires it, measure Writer changed-owner gaps but do not repair coverage-only gaps. SfxPoolItem isSetItem false for normal items and true for set items; original SfxItemPresentation Nameless0Complete1. SfxSetItem abstract base, Which/value and copy(pool) construction, independent owned set, concrete same-type nested Equals(true), retained pool/parent identity comparisons; SvxSetItem explicit initial set/copy/default-pool/foreign-pool Clone. Both erased native initial argument categories copy the source, no move/reset. Real OUString base GetPresentation false leaves text; Svx false clears text, all parameters ignored. Calc183/184 sets have actual upstream ranges148,150-152,156-157,160,163-166 and start empty; no fake dynamic ItemInfo provider. Whole changed shared executable owners and whole Calc every raw S/B/F/L counter positive100, related actual Writer tests, reference links absent during tests/build and restored finally. Scoped prettier/eslint, typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff, module-boundary tests, production build. Pin actual native sources, audit exact45paths and source hashes, clean calc. Full suite remains human readiness-gated to real minimum UI plus same-model ODS then repair/pause.

## Verification

- Command: `node output/playwright/task140-checks/portable.mjs`, then justified `--shared-only` replay after the typed constructor/test updates.
- Result: pass after completing the selected base-owner coverage.
- Evidence:96related cases/9files;5complete changed shared executable owners strict raw S279/B188/F72/L248 at100, every counter positive. WholeCalc180cases/71files,33owners strict raw S4172/B2731/F821/L3720 at100, every counter positive. All4reference links absent during runs/restored in finally. Actual Writer notification/history/component and restart cases pass. The complete changed Writer owner swatrset.ts has81statement/75branch/31function zero counters in this selection; these Writer-only coverage gaps are measured and intentionally not repaired. Its production change is the required override annotation only. No repository coverage threshold/exclusion/raw-map modifications.
- Scope: original base copy/CloneAsValue and derived slicing, nested set ownership/copy/equality/classification, same/foreign pool states/parents, false presentation with actual OUString, actual Calc183/184ranged-set ownership. Initial runtime tests passed, while strict raw gate correctly rejected existing base unsupported-value/invalid-identity paths absent from selection; actual inherited contract assertions close shared gaps. Final related evidence is fresh on exact current shared sources; Calc owners did not change after its complete passing run.

- Command: `node output/playwright/task140-checks/build-portable.mjs`.
- Result: pass.
- Evidence:production build with4source links absent/restored finally. Existing chunk-size advisory retained.
- Scope: application build; no frontend behavior change or browser-flow run required by this scope.

- Command: scoped `npx prettier --check`, `npx eslint ... --max-warnings 0`, `npm run typecheck`, `npm run check:docs`, `npm run check:file-size`, `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, `npm run inventory:parity`, `node .agentplane/policy/check-routing.mjs`, `ap doctor`, `git diff --check`, `npx vitest run scripts/check-module-boundaries.test.ts`.
- Result: pass after explicit tuple typing and primary-file metadata correction.
- Evidence:1891authored JSDoc files,634runtime dependency sources/2839relative imports/94allowed edges,114required tree paths/33retired roots,635runtime/provenance records with zero semantic violations,38boundary tests.13source gates pass. Source-backed svl-to-tools and svx-to-sal dependencies have no reverse edges. New inline flag witnesses map to the actual poolitem.hxx in evidence without falsely appending header-only names to the existing poolitem.cxx primary-symbol list. Initial gate logs are retained. Final scoped formatting/diff check also passes; existing managed hook-shim warning unchanged.
- Scope:34intentional paths within45approved,9runtime/provenance pairs and bounded capability.3811to3819non-agent source hashes,26existing changes/8new/3785unchanged;11native source pins/original native HEAD/four restored links/calc branch. Evidence: `output/playwright/task140-checks/verification.json`, `source-gates.json`, `source-contract-audit.json` and retained logs. Source audit confirms named-rvalue copy, exact base-value clone precondition, Calc constants/ranges and actual MapUnit forward declaration/OUString output; initial parser whitespace and assumed direct-header-include checks were corrected by reading the source. This is not C++ execution, generated probes or ABI evidence. Same-agent evaluation is explicitly not independent.

CALC-119 records the surprising named-rvalue copy as possibly intentional, not a confirmed defect. Native cache/refcount/registration/ABI/assertion infrastructure is not recreated, and unused IntlWrapper stays an erased opaque parameter without a service stub. ItemInfoDynamic/full page services, real ScDocumentPool/ScPatternAttr/ScColumn/ScTable/ScDocument, connected UI and same-model ODS remain pending. Human moved full-suite/pause checkpoint to actual minimum UI+ODS readiness; it is not reached by this task.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-14T18:33:58.321Z — VERIFY — ok

By: CODER

Note: Original shared set items/base copies verified:96related/9files,180Calc/71files,38boundaries;5shared raw S279B188F72L248 and33Calc S4172B2731F821L3720 everycounterpositive100. One Writer-only owner gap measured/left. Portable build/13source gates/635records zero violations,34paths/3819hashes/11pins/four links. CALC-119 retained named-rvalue copy, no move/lifetime/provider fake; full document/UIODS pending. Same-agent quality not independent.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T18:33:28.479Z, excerpt_hash=sha256:3dee479264818e07131ffd91328bf8778d20505f273e977e98a7f5b09e863cbb

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610141822-MZPZ3F/blueprint/resolved-snapshot.json
- old_digest: 09c0093ac4a6b83b41b154dc5aebe46004f375fc1e60d6a4554c1b758dea39ac
- current_digest: 09c0093ac4a6b83b41b154dc5aebe46004f375fc1e60d6a4554c1b758dea39ac
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610141822-MZPZ3F

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610141822-MZPZ3F -m 🧩 MZPZ3F task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task changes through a subsequent authorized task; no destructive reset, merge or publication.

## Findings

Native SfxSetItem rvalue overload initializes maSet(pS), which copies the named lvalue. Preserve source behavior and do not infer a move from the signature or build memory machinery. Native CloneAsValue asserts base type; construction from a derived source uses real base copy instead. Existing SwAttrSet hides the C++ nonvirtual method with its native own return type; TypeScript requires an override annotation without new Writer behavior. Same-agent quality review is not independent.

- Observation: Initial source checks found erased constructor tuple typing incompatible with readonly structural narrowing/explicit undefined, and required native signature edges svl-to-tools and svx-to-sal absent from dependency allowlist.
  Impact: Runtime tests passed; typed native MapUnit/OUString declarations need explicit canonical module dependencies, and tuples must admit existing optional-parent calls. No behavior fallback or source scope expansion beyond native dependencies.
  Resolution: Require actual SfxItemSet class source, admit explicit undefined in tuple arguments, register two source-backed dependencies with boundary tests; rerun affected checks and fresh related raw coverage.

- Observation: Initial complete raw coverage gate found existing SfxPoolItem base QueryValue/PutValue and invalid SetWhich paths absent from the selected tests; Calc tests passed.
  Impact: Strict shared owner verification required the real inherited unsupported-value and identity-rejection contracts; Writer-only SwAttrSet gaps are separately exempt.
  Resolution: Added actual set-item base QueryValue/PutValue and atomic invalid SetWhich assertions, then fresh complete shared coverage passes every raw counter. One Writer-only owner gap remains measured and unchanged; no threshold/map/exclusion changes.

- Observation: Source provenance rejected newly appended inline flag names under the existing poolitem.cxx primary symbol list; the actual new methods live in poolitem.hxx.
  Impact: Metadata primary-file scope was overbroad; code and typed/runtime checks were unaffected.
  Resolution: Retained original primary source mapping/history and original primary symbols; new flag method evidence points explicitly to real poolitem.hxx. Recheck provenance/inventory without changing enforcement or application sources.

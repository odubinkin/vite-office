---
id: "202609302111-EA56QR"
title: "Restore independent native numbering positioning modes"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T21:12:46.006Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-30T21:39:31.751Z"
  updated_by: "CODER"
  note: "Independent native position modes/defaults and source-owned geometry verified through context, signed-width C++ comparisons, Writer copy, browser snapshots and real ODT cycles. 88 compiled comparisons and 172 focused tests pass; full verify exit 0 at 612/109/19 with required 100% coverage. Final metadata/routing/doctor/diff pass; broader numbering/UNO/error/layout contracts stay unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-30T21:40:18.766Z"
  updated_by: "EVALUATOR"
  note: "Independent native legacy/alignment numbering geometry is now source-owned and selected by exact XML mode, with preserved raw copy/snapshot state and source-derived ODT evidence; mandatory verification passes."
  evaluated_sha: "6abbf551133de1c90d7e6df2ad3ad09cea5c413b"
  blueprint_digest: "dbfd9dea8ca2dea83aa56b770faac3658d389bb7148fed1a8d72e11d476cecf8"
  evidence_refs:
    - ".agentplane/tasks/202609302111-EA56QR/README.md"
    - ".agentplane/tasks/202609302111-EA56QR/quality/20260930-214018766-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609302111-EA56QR/quality/20260930-214018766-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609302111-EA56QR/quality/20260930-214018766-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609302111-EA56QR/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202609302111-EA56QR/verify.log"
    - ".agentplane/tasks/202609302111-EA56QR/focused.log"
    - ".agentplane/tasks/202609302111-EA56QR/parity-final.log"
    - ".agentplane/tasks/202609302111-EA56QR/native-list-measure-oracle.cxx"
    - ".agentplane/tasks/202609302111-EA56QR/native-position-oracle.cxx"
    - ".agentplane/tasks/202609302111-EA56QR/native-results.json"
    - ".agentplane/tasks/202609302111-EA56QR/native-position-results.json"
    - ".agentplane/tasks/202609302111-EA56QR/compare-native.mjs"
    - "apps/office/src/sw/source/filter/xml/odt-list-position-mode-roundtrip.test.ts"
    - "apps/office/src/editeng/source/items/numitem.test.ts"
    - "apps/office/src/xmloff/source/style/xmlnumi.test.ts"
  findings:
    - "SvxNumberFormat in editeng owns native zero defaults, both geometry groups and mode-dependent getters/widths. SwNumFormat inherits and clones the raw groups. xmlnumi level contexts own defaults and successful-only updates, retaining MM100 until Writer conversion; xmlnume exports selected native fields. No legacy-to-alignment emulation or compatibility re-export remains."
    - "Thirteen literal common/automatic inputs and repeated-properties cycles verify mode absence/spelling, conflicting groups, bounds, signs, failed updates, exact selected XML/reopen and browser raw snapshots. Current command defaults and genuine tdf114287 layout assertions stay intact. Compiled unmodified native bodies agree on 88 scalar/getter cases; full verify passes at 612/109/19 and 100% required coverage."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore independent native numbering position modes, source-owned geometry and exact XML selection/defaults through Writer copy, ODT cycles and browser snapshots; retain registered deviations and verify the full repository gate."
events:
  -
    type: "status"
    at: "2026-09-30T21:12:46.239Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore independent native numbering position modes, source-owned geometry and exact XML selection/defaults through Writer copy, ODT cycles and browser snapshots; retain registered deviations and verify the full repository gate."
  -
    type: "verify"
    at: "2026-09-30T21:39:31.751Z"
    author: "CODER"
    state: "ok"
    note: "Independent native position modes/defaults and source-owned geometry verified through context, signed-width C++ comparisons, Writer copy, browser snapshots and real ODT cycles. 88 compiled comparisons and 172 focused tests pass; full verify exit 0 at 612/109/19 with required 100% coverage. Final metadata/routing/doctor/diff pass; broader numbering/UNO/error/layout contracts stay unverified."
doc_version: 3
doc_updated_at: "2026-09-30T21:41:10.512Z"
doc_updated_by: "CODER"
description: "Child of C9TN6M. Replace the existing legacy-to-alignment workaround with independent source-owned numbering geometry and exact XML mode selection/defaults, preserving both modes through Writer copy, ODT export/reimport and browser model snapshots."
sections:
  Summary: |-
    Restore independent native numbering positioning modes

    Child of C9TN6M. Replace the existing legacy-to-alignment workaround with independent source-owned numbering geometry and exact XML mode selection/defaults, preserving both modes through Writer copy, ODT export/reimport and browser model snapshots.
  Scope: "Existing two numbering position modes and their geometry only: new editeng/source/items/numitem.ts and tests; sw/source/core/doc/number.ts and tests; sw/source/core/unocore/unosett.ts/tests; sw/source/core/layout/newfrm.ts/tests; xmloff/source/style/xmlnumi.ts/tests, xmlnume.ts/tests, xmlstyle.ts/tests; xmloff/source/text/txtparai.ts, txtparae.ts/tests; sw/source/filter/xml/xmlimp.ts, xmlexp.ts, odt-layout-parity.test.ts and new odt-list-position-mode-roundtrip.test.ts; sw/browser/filter/xml/writer-document-codec.ts and relevant codec tests; sw/browser/presentation/writer-view-projection.ts and projection tests; source-derived fixture repairs for intended explicit modern mode; runtime inventory/provenance and task artifacts. Retain existing decimal/bullet families and command defaults. Preserve registered save/open/recovery choices and existing unresolved rendering record. No network/outside-repo access, validator/schema/generator/threshold changes or broad feature promotion."
  Plan: "Restore independent native LABEL_WIDTH_AND_POSITION and LABEL_ALIGNMENT state in the editeng SvxNumberFormat owner with SwNumFormat inheritance and full copy state. Native declared list-level state starts legacy with both numeric groups zero; only exact label-alignment selects modern, independently of nested child presence. Parse legacy MM100 measures with native bounds and assemble LeftMargin/FirstLineOffset/SymbolTextDistance; retain modern leaf values independently until Writer conversion. Emit selected native XML mode/fields with correct signed conversion and legacy omission predicates. Preserve both groups in browser model copy/snapshot, select effective geometry at existing layout projections, and verify pinned source-derived contexts, direct model/codec and literal real ODT cycles. Broader native numbering families, omitted-level/default-rule construction, XML-style UNO replacement failure handling, NEWLINE/extensions and full pixel layout remain separately unverified. The active user goal authorizes this one architectural and behavioral correction."
  Verify Steps: "Inspect pinned xmlnumi level constructor, legacy properties parsing and mode switch; numitem constructor/GetAbsLSpace/GetFirstLineOffset/GetCharTextDistance and SwNumFormat inheritance/copy; unosett numeric conversion and mode-dependent projection; xmlnume legacy attribute omission/sign and modern explicit mode. Add independent raw state, default/mode switching and clone assertions; literal common/automatic ODT inputs cover absent/empty/unknown/case/whitespace/explicit modes, child presence/absence, both field groups and order, partial/invalid measures, signed/bounded geometry and native output/reopen. Verify browser codec state preservation and effective geometry projections, keep existing tdf114287/default-command contracts. Run focused affected suites and npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check. Record evidence and residual scope honestly."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-30T21:39:31.751Z — VERIFY — ok

    By: CODER

    Note: Independent native position modes/defaults and source-owned geometry verified through context, signed-width C++ comparisons, Writer copy, browser snapshots and real ODT cycles. 88 compiled comparisons and 172 focused tests pass; full verify exit 0 at 612/109/19 with required 100% coverage. Final metadata/routing/doctor/diff pass; broader numbering/UNO/error/layout contracts stay unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T21:39:31.300Z, excerpt_hash=sha256:37eac2a0fed66075a6ff27ef79b5475dd0172679b0db29289285f62d8fb3bb58

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609302111-EA56QR/blueprint/resolved-snapshot.json
    - old_digest: dbfd9dea8ca2dea83aa56b770faac3658d389bb7148fed1a8d72e11d476cecf8
    - current_digest: dbfd9dea8ca2dea83aa56b770faac3658d389bb7148fed1a8d72e11d476cecf8
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609302111-EA56QR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609302111-EA56QR
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the scoped implementation commit if independent numbering position state, existing commands, package export/reimport or browser snapshots regress."
  Findings: |-
    Source audit: native xmlnumi constructs legacy mode and zero geometry, then selects alignment only for exact label-alignment. Both attribute groups populate independent fields. Local xmlstyle overwrites one geometry with legacy Twip emulation or modern fields, never reads mode, and local SwNumFormat hardcodes alignment. Native SvxNumberFormat owns both groups and mode-dependent getters; Writer inherits/copies it. Existing modern-intent fixtures lacking the explicit mode are source-invalid and will be corrected or turned into legacy-default assertions. Full native replacement-error/omitted-level rule construction is a distinct audit; no full import or pixel-layout claim is made.

    - Observation: Initial typecheck rejected optional legacy snapshot fields passed explicitly as undefined under exactOptionalPropertyTypes.
      Impact: Compatibility decode helper issue within approved snapshot scope; no source-contract or gate drift.
      Resolution: Use explicit native zero defaults when older v15 snapshot fields are absent, then repeat types and all checks.

    - Observation: Focused ODT/type checks passed; lint rejected three destructured-but-unused legacy fields in the compatibility test helper. Source reread also confirmed successful-only numeric updates belong to the level context across repeated properties/leaf children.
      Impact: In-scope helper repair and source-owned state refinement, with unchanged acceptance/gate scope.
      Resolution: Remove old snapshot fields from a mutable copied record without unused bindings; preserve parent-owned native defaults and only apply successful numeric deltas. Add a literal repeated-context ODT assertion.

    - Observation: The integer-width test table inferred loose number arrays, causing noUncheckedIndexedAccess tuple destructuring errors during types.
      Impact: Test table annotation issue, with no runtime code or verification scope change.
      Resolution: Declared the literal table as const to preserve tuple positions; complete mandatory gate will run on final code.

    - Command: python3 .agentplane/tasks/202609302111-EA56QR/native-oracle.py; npx tsx .agentplane/tasks/202609302111-EA56QR/compare-native.mjs.
      Result: pass.
      Evidence: 74 scalar parser/export/UNO-conversion comparisons plus 14 comparisons against unmodified pinned SvxNumberFormat GetAbsLSpace/GetFirstLineOffset/GetCharTextDistance function bodies; signed sal_Int32/short narrowing and both modes agree. Native C++ files/results and comparison script are retained; temporary binaries were removed.
      Scope: Selected Twip/MM100/CM measure targets and positional getters. Harness platform aliases and native unit ratios are bounded; no native full-object/UNO replacement or whole-module claim.

    - Command: npx vitest run src/editeng/source/items/numitem.test.ts src/sw/source/core/doc/number.test.ts src/sw/source/filter/xml src/xmloff/source/style src/sw/source/core/unocore/unosett.test.ts src/xmloff/source/text/txtparae.test.ts src/sw/source/core/doc/writer-attributes.test.ts src/sw/source/core/layout/newfrm.test.ts src/sw/browser/editor/WriterEditableParagraph.test.tsx --coverage.enabled=false (cwd apps/office).
      Result: pass.
      Evidence: focused.log, 172 tests in 35 files.
      Scope: New base defaults/independent state/native getter widths, Writer clone and browser snapshot compatibility, all affected import/export/context modules, exact genuine tdf114287 geometry, default commands and browser editor projections. Thirteen literal inputs in each common/automatic container plus one repeated-properties input in both verify manual state, exact selected XML and reopen. Four context-only distance cases verify native unsigned-to-short GetProperties assembly without claiming downstream UNO replacement success for invalid negative SymbolTextDistance.

    - Command: npm run verify.
      Result: pass, terminal exit 0.
      Evidence: verify.log, 612 app tests in 130 files and 109 inventory tests in 36 files, 19 browser cases. Both required coverage suites have 100% statements/branches/functions/lines. Format/lint/types/boundaries/resources/build/static/docs/strict file size/source tree/provenance/invariants/parity pass. Boundaries: 198 runtime sources, 814 imports, 12 allowed edges; size: 435 authored files; provenance: 199 modules (123 mapped/60 browser/16 infrastructure); 34 invariants; semanticViolationCount=0. Terminal-completed log is compacted after source provenance with remaining gate summaries.
      Scope: Final runtime code across all mandatory gates. Afterward only obsolete metadata prose about the removed legacy Twip adapter was corrected; npm run check:source-provenance and npm run inventory:parity both pass again, with parity-final.log retained. No validator/schema/generator/config/coverage-threshold changes and no registered save/open/recovery behavior change.

    - Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
      Result: pass.
      Evidence: doctor exit 0, same two pre-existing warnings about old managed hook readiness and an old DONE task close pointer; routing OK; patch clean after completed test-log whitespace sanitation.
      Scope: Local workflow, policy and patch hygiene.

    - Observation: The legacy-to-alignment emulation and merged geometry are removed. SwNumFormat now inherits positional state/getters from the editeng source owner. xmlnumi retains level-owned zero defaults and raw legacy measures, applies numeric changes only on successful conversion and assembles native MM100 properties at the level boundary. Exact mode spelling alone selects alignment; label-follow resets per native leaf while missing/failed numeric fields retain owning level values. ODT XML emits the active group, preserving native loss of inactive fields; Writer copy/browser snapshots preserve both groups.
      Impact: Bare/unknown-mode declarations and conflicting groups no longer borrow command geometry or infer mode from child presence. Shared conversion functions are renamed for both position groups, with direct imports and no compatibility re-export. Existing modern-intent fixtures explicitly select alignment; legacy tests now assert genuine legacy fields instead of fabricated modern state.
      Resolution: Keep full native number/font/graphic/units/assignment breadth, omitted-level/base-rule defaults and FillNumRule replacement failure semantics, NEWLINE/extensions and other export versions/units, exact line/pixel layout and remaining runtime/UI operations separate. In particular pinned xmlnumi.cxx FillNumRule catches replacement exceptions outside the level loop, while unosett.cxx rejects negative SymbolTextDistance produced by sal_Int16 narrowing; local rule application still requires that separate audit. The parent and user goal remain incomplete.

    - Observation: An ad hoc metadata update initially assumed preservedResponsibilities on a browser local-only entry and raised KeyError before writing either JSON file.
      Impact: Metadata helper issue only; no partial artifact or validator/config mutation.
      Resolution: Used the existing responsibilities field for browser entries and preservedResponsibilities for mapped entries; provenance and complete gates pass on the corrected metadata.
id_source: "generated"
---
## Summary

Restore independent native numbering positioning modes

Child of C9TN6M. Replace the existing legacy-to-alignment workaround with independent source-owned numbering geometry and exact XML mode selection/defaults, preserving both modes through Writer copy, ODT export/reimport and browser model snapshots.

## Scope

Existing two numbering position modes and their geometry only: new editeng/source/items/numitem.ts and tests; sw/source/core/doc/number.ts and tests; sw/source/core/unocore/unosett.ts/tests; sw/source/core/layout/newfrm.ts/tests; xmloff/source/style/xmlnumi.ts/tests, xmlnume.ts/tests, xmlstyle.ts/tests; xmloff/source/text/txtparai.ts, txtparae.ts/tests; sw/source/filter/xml/xmlimp.ts, xmlexp.ts, odt-layout-parity.test.ts and new odt-list-position-mode-roundtrip.test.ts; sw/browser/filter/xml/writer-document-codec.ts and relevant codec tests; sw/browser/presentation/writer-view-projection.ts and projection tests; source-derived fixture repairs for intended explicit modern mode; runtime inventory/provenance and task artifacts. Retain existing decimal/bullet families and command defaults. Preserve registered save/open/recovery choices and existing unresolved rendering record. No network/outside-repo access, validator/schema/generator/threshold changes or broad feature promotion.

## Plan

Restore independent native LABEL_WIDTH_AND_POSITION and LABEL_ALIGNMENT state in the editeng SvxNumberFormat owner with SwNumFormat inheritance and full copy state. Native declared list-level state starts legacy with both numeric groups zero; only exact label-alignment selects modern, independently of nested child presence. Parse legacy MM100 measures with native bounds and assemble LeftMargin/FirstLineOffset/SymbolTextDistance; retain modern leaf values independently until Writer conversion. Emit selected native XML mode/fields with correct signed conversion and legacy omission predicates. Preserve both groups in browser model copy/snapshot, select effective geometry at existing layout projections, and verify pinned source-derived contexts, direct model/codec and literal real ODT cycles. Broader native numbering families, omitted-level/default-rule construction, XML-style UNO replacement failure handling, NEWLINE/extensions and full pixel layout remain separately unverified. The active user goal authorizes this one architectural and behavioral correction.

## Verify Steps

Inspect pinned xmlnumi level constructor, legacy properties parsing and mode switch; numitem constructor/GetAbsLSpace/GetFirstLineOffset/GetCharTextDistance and SwNumFormat inheritance/copy; unosett numeric conversion and mode-dependent projection; xmlnume legacy attribute omission/sign and modern explicit mode. Add independent raw state, default/mode switching and clone assertions; literal common/automatic ODT inputs cover absent/empty/unknown/case/whitespace/explicit modes, child presence/absence, both field groups and order, partial/invalid measures, signed/bounded geometry and native output/reopen. Verify browser codec state preservation and effective geometry projections, keep existing tdf114287/default-command contracts. Run focused affected suites and npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check. Record evidence and residual scope honestly.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-30T21:39:31.751Z — VERIFY — ok

By: CODER

Note: Independent native position modes/defaults and source-owned geometry verified through context, signed-width C++ comparisons, Writer copy, browser snapshots and real ODT cycles. 88 compiled comparisons and 172 focused tests pass; full verify exit 0 at 612/109/19 with required 100% coverage. Final metadata/routing/doctor/diff pass; broader numbering/UNO/error/layout contracts stay unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T21:39:31.300Z, excerpt_hash=sha256:37eac2a0fed66075a6ff27ef79b5475dd0172679b0db29289285f62d8fb3bb58

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609302111-EA56QR/blueprint/resolved-snapshot.json
- old_digest: dbfd9dea8ca2dea83aa56b770faac3658d389bb7148fed1a8d72e11d476cecf8
- current_digest: dbfd9dea8ca2dea83aa56b770faac3658d389bb7148fed1a8d72e11d476cecf8
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609302111-EA56QR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609302111-EA56QR
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the scoped implementation commit if independent numbering position state, existing commands, package export/reimport or browser snapshots regress.

## Findings

Source audit: native xmlnumi constructs legacy mode and zero geometry, then selects alignment only for exact label-alignment. Both attribute groups populate independent fields. Local xmlstyle overwrites one geometry with legacy Twip emulation or modern fields, never reads mode, and local SwNumFormat hardcodes alignment. Native SvxNumberFormat owns both groups and mode-dependent getters; Writer inherits/copies it. Existing modern-intent fixtures lacking the explicit mode are source-invalid and will be corrected or turned into legacy-default assertions. Full native replacement-error/omitted-level rule construction is a distinct audit; no full import or pixel-layout claim is made.

- Observation: Initial typecheck rejected optional legacy snapshot fields passed explicitly as undefined under exactOptionalPropertyTypes.
  Impact: Compatibility decode helper issue within approved snapshot scope; no source-contract or gate drift.
  Resolution: Use explicit native zero defaults when older v15 snapshot fields are absent, then repeat types and all checks.

- Observation: Focused ODT/type checks passed; lint rejected three destructured-but-unused legacy fields in the compatibility test helper. Source reread also confirmed successful-only numeric updates belong to the level context across repeated properties/leaf children.
  Impact: In-scope helper repair and source-owned state refinement, with unchanged acceptance/gate scope.
  Resolution: Remove old snapshot fields from a mutable copied record without unused bindings; preserve parent-owned native defaults and only apply successful numeric deltas. Add a literal repeated-context ODT assertion.

- Observation: The integer-width test table inferred loose number arrays, causing noUncheckedIndexedAccess tuple destructuring errors during types.
  Impact: Test table annotation issue, with no runtime code or verification scope change.
  Resolution: Declared the literal table as const to preserve tuple positions; complete mandatory gate will run on final code.

- Command: python3 .agentplane/tasks/202609302111-EA56QR/native-oracle.py; npx tsx .agentplane/tasks/202609302111-EA56QR/compare-native.mjs.
  Result: pass.
  Evidence: 74 scalar parser/export/UNO-conversion comparisons plus 14 comparisons against unmodified pinned SvxNumberFormat GetAbsLSpace/GetFirstLineOffset/GetCharTextDistance function bodies; signed sal_Int32/short narrowing and both modes agree. Native C++ files/results and comparison script are retained; temporary binaries were removed.
  Scope: Selected Twip/MM100/CM measure targets and positional getters. Harness platform aliases and native unit ratios are bounded; no native full-object/UNO replacement or whole-module claim.

- Command: npx vitest run src/editeng/source/items/numitem.test.ts src/sw/source/core/doc/number.test.ts src/sw/source/filter/xml src/xmloff/source/style src/sw/source/core/unocore/unosett.test.ts src/xmloff/source/text/txtparae.test.ts src/sw/source/core/doc/writer-attributes.test.ts src/sw/source/core/layout/newfrm.test.ts src/sw/browser/editor/WriterEditableParagraph.test.tsx --coverage.enabled=false (cwd apps/office).
  Result: pass.
  Evidence: focused.log, 172 tests in 35 files.
  Scope: New base defaults/independent state/native getter widths, Writer clone and browser snapshot compatibility, all affected import/export/context modules, exact genuine tdf114287 geometry, default commands and browser editor projections. Thirteen literal inputs in each common/automatic container plus one repeated-properties input in both verify manual state, exact selected XML and reopen. Four context-only distance cases verify native unsigned-to-short GetProperties assembly without claiming downstream UNO replacement success for invalid negative SymbolTextDistance.

- Command: npm run verify.
  Result: pass, terminal exit 0.
  Evidence: verify.log, 612 app tests in 130 files and 109 inventory tests in 36 files, 19 browser cases. Both required coverage suites have 100% statements/branches/functions/lines. Format/lint/types/boundaries/resources/build/static/docs/strict file size/source tree/provenance/invariants/parity pass. Boundaries: 198 runtime sources, 814 imports, 12 allowed edges; size: 435 authored files; provenance: 199 modules (123 mapped/60 browser/16 infrastructure); 34 invariants; semanticViolationCount=0. Terminal-completed log is compacted after source provenance with remaining gate summaries.
  Scope: Final runtime code across all mandatory gates. Afterward only obsolete metadata prose about the removed legacy Twip adapter was corrected; npm run check:source-provenance and npm run inventory:parity both pass again, with parity-final.log retained. No validator/schema/generator/config/coverage-threshold changes and no registered save/open/recovery behavior change.

- Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
  Result: pass.
  Evidence: doctor exit 0, same two pre-existing warnings about old managed hook readiness and an old DONE task close pointer; routing OK; patch clean after completed test-log whitespace sanitation.
  Scope: Local workflow, policy and patch hygiene.

- Observation: The legacy-to-alignment emulation and merged geometry are removed. SwNumFormat now inherits positional state/getters from the editeng source owner. xmlnumi retains level-owned zero defaults and raw legacy measures, applies numeric changes only on successful conversion and assembles native MM100 properties at the level boundary. Exact mode spelling alone selects alignment; label-follow resets per native leaf while missing/failed numeric fields retain owning level values. ODT XML emits the active group, preserving native loss of inactive fields; Writer copy/browser snapshots preserve both groups.
  Impact: Bare/unknown-mode declarations and conflicting groups no longer borrow command geometry or infer mode from child presence. Shared conversion functions are renamed for both position groups, with direct imports and no compatibility re-export. Existing modern-intent fixtures explicitly select alignment; legacy tests now assert genuine legacy fields instead of fabricated modern state.
  Resolution: Keep full native number/font/graphic/units/assignment breadth, omitted-level/base-rule defaults and FillNumRule replacement failure semantics, NEWLINE/extensions and other export versions/units, exact line/pixel layout and remaining runtime/UI operations separate. In particular pinned xmlnumi.cxx FillNumRule catches replacement exceptions outside the level loop, while unosett.cxx rejects negative SymbolTextDistance produced by sal_Int16 narrowing; local rule application still requires that separate audit. The parent and user goal remain incomplete.

- Observation: An ad hoc metadata update initially assumed preservedResponsibilities on a browser local-only entry and raised KeyError before writing either JSON file.
  Impact: Metadata helper issue only; no partial artifact or validator/config mutation.
  Resolution: Used the existing responsibilities field for browser entries and preservedResponsibilities for mapped entries; provenance and complete gates pass on the corrected metadata.

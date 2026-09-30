---
id: "202609302111-EA56QR"
title: "Restore independent native numbering positioning modes"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
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
doc_version: 3
doc_updated_at: "2026-09-30T21:16:44.887Z"
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
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the scoped implementation commit if independent numbering position state, existing commands, package export/reimport or browser snapshots regress."
  Findings: |-
    Source audit: native xmlnumi constructs legacy mode and zero geometry, then selects alignment only for exact label-alignment. Both attribute groups populate independent fields. Local xmlstyle overwrites one geometry with legacy Twip emulation or modern fields, never reads mode, and local SwNumFormat hardcodes alignment. Native SvxNumberFormat owns both groups and mode-dependent getters; Writer inherits/copies it. Existing modern-intent fixtures lacking the explicit mode are source-invalid and will be corrected or turned into legacy-default assertions. Full native replacement-error/omitted-level rule construction is a distinct audit; no full import or pixel-layout claim is made.

    - Observation: Initial typecheck rejected optional legacy snapshot fields passed explicitly as undefined under exactOptionalPropertyTypes.
      Impact: Compatibility decode helper issue within approved snapshot scope; no source-contract or gate drift.
      Resolution: Use explicit native zero defaults when older v15 snapshot fields are absent, then repeat types and all checks.
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
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the scoped implementation commit if independent numbering position state, existing commands, package export/reimport or browser snapshots regress.

## Findings

Source audit: native xmlnumi constructs legacy mode and zero geometry, then selects alignment only for exact label-alignment. Both attribute groups populate independent fields. Local xmlstyle overwrites one geometry with legacy Twip emulation or modern fields, never reads mode, and local SwNumFormat hardcodes alignment. Native SvxNumberFormat owns both groups and mode-dependent getters; Writer inherits/copies it. Existing modern-intent fixtures lacking the explicit mode are source-invalid and will be corrected or turned into legacy-default assertions. Full native replacement-error/omitted-level rule construction is a distinct audit; no full import or pixel-layout claim is made.

- Observation: Initial typecheck rejected optional legacy snapshot fields passed explicitly as undefined under exactOptionalPropertyTypes.
  Impact: Compatibility decode helper issue within approved snapshot scope; no source-contract or gate drift.
  Resolution: Use explicit native zero defaults when older v15 snapshot fields are absent, then repeat types and all checks.

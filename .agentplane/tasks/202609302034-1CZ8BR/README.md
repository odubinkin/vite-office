---
id: "202609302034-1CZ8BR"
title: "Restore native list label-alignment XML contracts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T20:36:18.288Z"
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
    body: "Start: restore source-owned supported list label-alignment XML defaults, MM100/Writer conversion and native mode/attribute/export contracts; retain registered deviations and verify full package/browser gates."
events:
  -
    type: "status"
    at: "2026-09-30T20:36:18.537Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore source-owned supported list label-alignment XML defaults, MM100/Writer conversion and native mode/attribute/export contracts; retain registered deviations and verify full package/browser gates."
doc_version: 3
doc_updated_at: "2026-09-30T20:36:18.537Z"
doc_updated_by: "CODER"
description: "Child of C9TN6M. Correct the existing label-alignment import/export pipeline: MM100 defaults, parsing/clamps and Writer conversion; explicit ODF mode, nondefault attribute presence and native export quantization. Keep unsupported position modes and broader numbering obligations separate."
sections:
  Summary: |-
    Restore native list label-alignment XML contracts

    Child of C9TN6M. Correct the existing label-alignment import/export pipeline: MM100 defaults, parsing/clamps and Writer conversion; explicit ODF mode, nondefault attribute presence and native export quantization. Keep unsupported position modes and broader numbering obligations separate.
  Scope: "Only existing supported list label-alignment XML pipeline: xmloff/source/style/xmlnume.ts and new xmlnume.test.ts; new xmlnumi.ts and xmlnumi.test.ts; xmlstyle.ts; text/txtparae.ts and txtparae.test.ts; text/txtparai.ts; core/xmltoken.ts and core/xmluconv.ts/tests; sax/source/tools/converter.ts/tests; new sw/source/core/unocore/unosett.ts/tests; sw/source/filter/xml/xmlimp.ts, xmlexp.ts, odt-layout-parity.test.ts and new odt-list-label-alignment-roundtrip.test.ts; runtime inventory/provenance data and task artifacts. Retain modern imported MM100 values/defaults until Writer UNO conversion; keep legacy Twip adapter explicitly separate and unchanged. Export supported label-alignment for ODF 1.3 with explicit mode and native conditional attributes, quantization and CM serialization. Legacy position modes, extension NEWLINE, full numbering/UNO model breadth and other defaults remain separate audits. Do not alter validators, thresholds or registered save/open/recovery deviations. No network/outside-repo access."
  Plan: "Own modern list label-alignment parsing in xmlnumi with native MM100 defaults, Converter grammar/failure and bounds. Use explicit unit-marked import properties to preserve the unaudited legacy Twip path. Delegate Writer property MM100/Twip conversion to its unosett owner. Project exported layout as native MM100, serialize through XML/SAX converter, and follow xmlnume mode/attribute rules without command-specific suppression. Add pinned source-derived assertions and real ODT cycles, correct contradictory fixtures, update metadata and run all mandatory gates. The active iterative goal explicitly authorizes this correction and necessary responsibility refactoring."
  Verify Steps: "Inspect pinned xmlnumi.cxx label-alignment constructor and SHRT MM100 bounds, xmlnume.cxx mode/version/attribute rules, unosett.cxx MM100/Twip numbering properties, tools/UnitConversion.hxx and o3tl signed rounding, SAX/XML measure export to CM. Context/unit assertions cover zero omitted defaults, supported follow modes and unknown fallback, grammar/failure/clamps and two-stage quantization; export assertions verify explicit mode, default-level retention, nonzero indent suppression and listtab-only positive tab output. Literal real ODT common/automatic list definitions and default Writer commands assert manual model values and exact XML through import/export/reimport, including negative geometry, zeros, partial/invalid measures and native unused tab loss. Preserve genuine tdf114287 geometry. Run focused affected suites then full npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. Record narrow evidence and residual obligations; no whole-module promotion."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation commit if source-backed existing list label-alignment contracts regress; retain earlier verified context and item corrections."
  Findings: ""
id_source: "generated"
---
## Summary

Restore native list label-alignment XML contracts

Child of C9TN6M. Correct the existing label-alignment import/export pipeline: MM100 defaults, parsing/clamps and Writer conversion; explicit ODF mode, nondefault attribute presence and native export quantization. Keep unsupported position modes and broader numbering obligations separate.

## Scope

Only existing supported list label-alignment XML pipeline: xmloff/source/style/xmlnume.ts and new xmlnume.test.ts; new xmlnumi.ts and xmlnumi.test.ts; xmlstyle.ts; text/txtparae.ts and txtparae.test.ts; text/txtparai.ts; core/xmltoken.ts and core/xmluconv.ts/tests; sax/source/tools/converter.ts/tests; new sw/source/core/unocore/unosett.ts/tests; sw/source/filter/xml/xmlimp.ts, xmlexp.ts, odt-layout-parity.test.ts and new odt-list-label-alignment-roundtrip.test.ts; runtime inventory/provenance data and task artifacts. Retain modern imported MM100 values/defaults until Writer UNO conversion; keep legacy Twip adapter explicitly separate and unchanged. Export supported label-alignment for ODF 1.3 with explicit mode and native conditional attributes, quantization and CM serialization. Legacy position modes, extension NEWLINE, full numbering/UNO model breadth and other defaults remain separate audits. Do not alter validators, thresholds or registered save/open/recovery deviations. No network/outside-repo access.

## Plan

Own modern list label-alignment parsing in xmlnumi with native MM100 defaults, Converter grammar/failure and bounds. Use explicit unit-marked import properties to preserve the unaudited legacy Twip path. Delegate Writer property MM100/Twip conversion to its unosett owner. Project exported layout as native MM100, serialize through XML/SAX converter, and follow xmlnume mode/attribute rules without command-specific suppression. Add pinned source-derived assertions and real ODT cycles, correct contradictory fixtures, update metadata and run all mandatory gates. The active iterative goal explicitly authorizes this correction and necessary responsibility refactoring.

## Verify Steps

Inspect pinned xmlnumi.cxx label-alignment constructor and SHRT MM100 bounds, xmlnume.cxx mode/version/attribute rules, unosett.cxx MM100/Twip numbering properties, tools/UnitConversion.hxx and o3tl signed rounding, SAX/XML measure export to CM. Context/unit assertions cover zero omitted defaults, supported follow modes and unknown fallback, grammar/failure/clamps and two-stage quantization; export assertions verify explicit mode, default-level retention, nonzero indent suppression and listtab-only positive tab output. Literal real ODT common/automatic list definitions and default Writer commands assert manual model values and exact XML through import/export/reimport, including negative geometry, zeros, partial/invalid measures and native unused tab loss. Preserve genuine tdf114287 geometry. Run focused affected suites then full npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. Record narrow evidence and residual obligations; no whole-module promotion.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation commit if source-backed existing list label-alignment contracts regress; retain earlier verified context and item corrections.

## Findings

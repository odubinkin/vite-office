---
id: "202609301937-HTNKEB"
title: "Restore named and automatic style context ownership"
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
  updated_at: "2026-09-30T19:39:16.310Z"
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
    body: "Start: restore per-container style ownership, active automatic replacement and native direct versus named-parent lookup, verified through genuine ODT inputs."
events:
  -
    type: "status"
    at: "2026-09-30T19:39:16.815Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore per-container style ownership, active automatic replacement and native direct versus named-parent lookup, verified through genuine ODT inputs."
doc_version: 3
doc_updated_at: "2026-09-30T19:39:16.815Z"
doc_updated_by: "CODER"
description: "Child of C9TN6M. Follow native per-container XML style ownership, independent named/active automatic references and automatic-first direct versus named-only parent resolution. Preserve legal common/automatic name collisions and stream replacement through real ODT cycles."
sections:
  Summary: |-
    Restore named and automatic style context ownership

    Child of C9TN6M. Follow native per-container XML style ownership, independent named/active automatic references and automatic-first direct versus named-only parent resolution. Preserve legal common/automatic name collisions and stream replacement through real ODT cycles.
  Scope: "Only xmloff/source/style/xmlstyle.ts, new xmlstyle.test.ts, xmloff/source/text/txtparai.ts and txtparai.test.ts, sw/source/filter/xml/xmlimp.ts, new odt-style-container-roundtrip.test.ts and directly affected existing ODT style/paragraph fixture tests under sw/source/filter/xml, runtime-inventory.json, source-provenance.json and task artifacts. XMLStylesContext owns per-container style context references; Sw import retains separate named and active automatic contexts. Direct application checks automatic first; automatic/common parents use named-only lookup and found automatic deltas still apply. Correct contradictory fixtures which currently use automatic styles as named parents. Same-container duplicate selection, display-name mappings, global null contexts, named document-model breadth and unrelated defaults remain separate audits. Registered save/open/recovery deviations excluded."
  Plan: "Move named definitions into their XMLStylesContext owner using style leaf context references. Replace Sw name maps with independent named and active automatic context references, distinct lookup APIs and native direct/parent precedence. Apply only common paragraph definitions/defaults to named Writer styles, preserve automatic property deltas and native context replacement. Add context ownership and literal real ODT assertions, adapt only source-contradictory parent/container fixtures, update provenance and run complete gates before closing this leaf. The active user goal authorizes this in-scope implementation and refactoring."
  Verify Steps: "1. Compare pinned XML style context AddStyle/FindStyleChildContext, SwXMLImport::CreateStylesContext and SetStyles/SetAutoStyles reference replacement, and SetStyleAndAttrs direct automatic versus named parent lookup/application. 2. Context assertions verify leaf-reference ownership, container isolation and family identity, explicit automatic precedence, named-only parents, empty/missing parents and no automatic parent recursion. 3. Literal real ODT common/automatic collisions, same names across streams, automatic context replacement, named parent chains, automatic overrides, direct/self-named parent scope and built-in paragraph inheritance assert manual model state on import/export/reimport. Update contradictory fixtures with valid named parent placement while preserving intended assertions. 4. Focused affected context/ODT suites and full npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check pass. Record architecture and narrow evidence without module parity promotion."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this scoped implementation commit if source-backed style ownership or lookup semantics introduce a verified regression; retain previously completed corrections."
  Findings: ""
id_source: "generated"
---
## Summary

Restore named and automatic style context ownership

Child of C9TN6M. Follow native per-container XML style ownership, independent named/active automatic references and automatic-first direct versus named-only parent resolution. Preserve legal common/automatic name collisions and stream replacement through real ODT cycles.

## Scope

Only xmloff/source/style/xmlstyle.ts, new xmlstyle.test.ts, xmloff/source/text/txtparai.ts and txtparai.test.ts, sw/source/filter/xml/xmlimp.ts, new odt-style-container-roundtrip.test.ts and directly affected existing ODT style/paragraph fixture tests under sw/source/filter/xml, runtime-inventory.json, source-provenance.json and task artifacts. XMLStylesContext owns per-container style context references; Sw import retains separate named and active automatic contexts. Direct application checks automatic first; automatic/common parents use named-only lookup and found automatic deltas still apply. Correct contradictory fixtures which currently use automatic styles as named parents. Same-container duplicate selection, display-name mappings, global null contexts, named document-model breadth and unrelated defaults remain separate audits. Registered save/open/recovery deviations excluded.

## Plan

Move named definitions into their XMLStylesContext owner using style leaf context references. Replace Sw name maps with independent named and active automatic context references, distinct lookup APIs and native direct/parent precedence. Apply only common paragraph definitions/defaults to named Writer styles, preserve automatic property deltas and native context replacement. Add context ownership and literal real ODT assertions, adapt only source-contradictory parent/container fixtures, update provenance and run complete gates before closing this leaf. The active user goal authorizes this in-scope implementation and refactoring.

## Verify Steps

1. Compare pinned XML style context AddStyle/FindStyleChildContext, SwXMLImport::CreateStylesContext and SetStyles/SetAutoStyles reference replacement, and SetStyleAndAttrs direct automatic versus named parent lookup/application. 2. Context assertions verify leaf-reference ownership, container isolation and family identity, explicit automatic precedence, named-only parents, empty/missing parents and no automatic parent recursion. 3. Literal real ODT common/automatic collisions, same names across streams, automatic context replacement, named parent chains, automatic overrides, direct/self-named parent scope and built-in paragraph inheritance assert manual model state on import/export/reimport. Update contradictory fixtures with valid named parent placement while preserving intended assertions. 4. Focused affected context/ODT suites and full npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check pass. Record architecture and narrow evidence without module parity promotion.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this scoped implementation commit if source-backed style ownership or lookup semantics introduce a verified regression; retain previously completed corrections.

## Findings

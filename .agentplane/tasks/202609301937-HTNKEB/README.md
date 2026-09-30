---
id: "202609301937-HTNKEB"
title: "Restore named and automatic style context ownership"
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
  updated_at: "2026-09-30T19:54:16.198Z"
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
  -
    author: "CODER"
    body: "Start: continue approved context correction with necessary removal of the source-invalid automatic-parent export bridge; preserve exact upstream geometry evidence."
events:
  -
    type: "status"
    at: "2026-09-30T19:39:16.815Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore per-container style ownership, active automatic replacement and native direct versus named-parent lookup, verified through genuine ODT inputs."
  -
    type: "status"
    at: "2026-09-30T19:54:16.444Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: continue approved context correction with necessary removal of the source-invalid automatic-parent export bridge; preserve exact upstream geometry evidence."
doc_version: 3
doc_updated_at: "2026-09-30T20:03:32.093Z"
doc_updated_by: "CODER"
description: "Child of C9TN6M. Follow native per-container XML style ownership, independent named/active automatic references and automatic-first direct versus named-only parent resolution. Preserve legal common/automatic name collisions and stream replacement through real ODT cycles."
sections:
  Summary: |-
    Restore named and automatic style context ownership

    Child of C9TN6M. Follow native per-container XML style ownership, independent named/active automatic references and automatic-first direct versus named-only parent resolution. Preserve legal common/automatic name collisions and stream replacement through real ODT cycles.
  Scope: "Original scoped context ownership, lookup, tests and metadata paths plus xmloff/source/text/txtparae.ts and txtpara.test.ts and sw/source/filter/xml/xmlexp.ts. A pinned tdf114287 export/reimport regression exposes the temporary automatic-parent export chain. Refactor that directly dependent bridge to emit its base into common styles and keep direct list properties automatic, using shared deterministic Writer text export. Same-container duplicate selection, display-name mappings, global null contexts, full named model breadth and unrelated defaults remain separate audits. No network or outside-repository access; registered save/open/recovery deviations preserved."
  Plan: "Retain the approved per-container context ownership and native automatic-first direct versus named-only parent lookup. Resolve the exposed temporary export dependency by emitting inherited list-geometry bases as named styles in styles.xml through shared deterministic text export; do not reintroduce automatic parent recursion or relax the pinned geometry assertions. Verify the genuine tdf114287 import/export/reimport regression and explicit container ownership/collision/replacement cases, focused affected suites, all full gates and provenance. The ongoing user goal explicitly authorizes refactoring temporary solutions and completion of this necessary in-scope dependency."
  Verify Steps: "1. Compare pinned XML style context AddStyle/FindStyleChildContext, SwXMLImport::CreateStylesContext and SetStyles/SetAutoStyles reference replacement, and SetStyleAndAttrs direct automatic versus named parent lookup/application. 2. Context assertions verify leaf-reference ownership, container isolation and family identity, explicit automatic precedence, named-only parents, empty/missing parents and no automatic parent recursion. 3. Literal real ODT common/automatic collisions, same names across streams, automatic context replacement, named parent chains, automatic overrides, direct/self-named parent scope and built-in paragraph inheritance assert manual model state on import/export/reimport. Update contradictory fixtures with valid named parent placement while preserving intended assertions. 4. Focused affected context/ODT suites and full npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check pass. Record architecture and narrow evidence without module parity promotion."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this scoped implementation commit if source-backed style ownership or lookup semantics introduce a verified regression; retain previously completed corrections."
  Findings: |-
    - Observation: Focused ODT suite initially passed 118/119 cases: tdf114287 failed only on export/reopen first-line indent, while imported and browser codec states retained exact upstream values.
      Impact: Correct named-only parent lookup exposed an existing export workaround that emitted its base as an automatic style and depended on unsupported automatic parent recursion.
      Resolution: Reapproved the necessary three-path export dependency under the existing iterative refactoring goal; separated inherited base XML into common styles and shared deterministic Writer export source between styles.xml and content.xml. Preserved all upstream geometry expectations; the affected suite then passed 125/125. Full custom named model ownership and removal of this bounded export bridge remain a later architecture audit.
id_source: "generated"
---
## Summary

Restore named and automatic style context ownership

Child of C9TN6M. Follow native per-container XML style ownership, independent named/active automatic references and automatic-first direct versus named-only parent resolution. Preserve legal common/automatic name collisions and stream replacement through real ODT cycles.

## Scope

Original scoped context ownership, lookup, tests and metadata paths plus xmloff/source/text/txtparae.ts and txtpara.test.ts and sw/source/filter/xml/xmlexp.ts. A pinned tdf114287 export/reimport regression exposes the temporary automatic-parent export chain. Refactor that directly dependent bridge to emit its base into common styles and keep direct list properties automatic, using shared deterministic Writer text export. Same-container duplicate selection, display-name mappings, global null contexts, full named model breadth and unrelated defaults remain separate audits. No network or outside-repository access; registered save/open/recovery deviations preserved.

## Plan

Retain the approved per-container context ownership and native automatic-first direct versus named-only parent lookup. Resolve the exposed temporary export dependency by emitting inherited list-geometry bases as named styles in styles.xml through shared deterministic text export; do not reintroduce automatic parent recursion or relax the pinned geometry assertions. Verify the genuine tdf114287 import/export/reimport regression and explicit container ownership/collision/replacement cases, focused affected suites, all full gates and provenance. The ongoing user goal explicitly authorizes refactoring temporary solutions and completion of this necessary in-scope dependency.

## Verify Steps

1. Compare pinned XML style context AddStyle/FindStyleChildContext, SwXMLImport::CreateStylesContext and SetStyles/SetAutoStyles reference replacement, and SetStyleAndAttrs direct automatic versus named parent lookup/application. 2. Context assertions verify leaf-reference ownership, container isolation and family identity, explicit automatic precedence, named-only parents, empty/missing parents and no automatic parent recursion. 3. Literal real ODT common/automatic collisions, same names across streams, automatic context replacement, named parent chains, automatic overrides, direct/self-named parent scope and built-in paragraph inheritance assert manual model state on import/export/reimport. Update contradictory fixtures with valid named parent placement while preserving intended assertions. 4. Focused affected context/ODT suites and full npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check pass. Record architecture and narrow evidence without module parity promotion.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this scoped implementation commit if source-backed style ownership or lookup semantics introduce a verified regression; retain previously completed corrections.

## Findings

- Observation: Focused ODT suite initially passed 118/119 cases: tdf114287 failed only on export/reopen first-line indent, while imported and browser codec states retained exact upstream values.
  Impact: Correct named-only parent lookup exposed an existing export workaround that emitted its base as an automatic style and depended on unsupported automatic parent recursion.
  Resolution: Reapproved the necessary three-path export dependency under the existing iterative refactoring goal; separated inherited base XML into common styles and shared deterministic Writer export source between styles.xml and content.xml. Preserved all upstream geometry expectations; the affected suite then passed 125/125. Full custom named model ownership and removal of this bounded export bridge remain a later architecture audit.

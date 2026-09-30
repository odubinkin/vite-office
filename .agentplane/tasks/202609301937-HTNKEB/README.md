---
id: "202609301937-HTNKEB"
title: "Restore named and automatic style context ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 24
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T20:14:14.262Z"
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
  -
    author: "CODER"
    body: "Start: preserve verified container and package semantics while extracting existing list label-alignment export into its upstream source owner to satisfy the file-size gate."
  -
    author: "CODER"
    body: "Start: extract unchanged list label-alignment serialization into inspected xmlnume source owner; retain all passing source-derived behavior."
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
  -
    type: "status"
    at: "2026-09-30T20:12:42.934Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: preserve verified container and package semantics while extracting existing list label-alignment export into its upstream source owner to satisfy the file-size gate."
  -
    type: "status"
    at: "2026-09-30T20:14:14.502Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: extract unchanged list label-alignment serialization into inspected xmlnume source owner; retain all passing source-derived behavior."
doc_version: 3
doc_updated_at: "2026-09-30T20:18:18.249Z"
doc_updated_by: "CODER"
description: "Child of C9TN6M. Follow native per-container XML style ownership, independent named/active automatic references and automatic-first direct versus named-only parent resolution. Preserve legal common/automatic name collisions and stream replacement through real ODT cycles."
sections:
  Summary: |-
    Restore named and automatic style context ownership

    Child of C9TN6M. Follow native per-container XML style ownership, independent named/active automatic references and automatic-first direct versus named-only parent resolution. Preserve legal common/automatic name collisions and stream replacement through real ODT cycles.
  Scope: "Previously approved context ownership, lookup, metadata and directly affected tests plus xmloff/source/text/txtparae.ts, txtpara.test.ts and sw/source/filter/xml/xmlexp.ts. Remove the source-invalid automatic-parent export bridge using common styles and shared deterministic export. Extract unchanged existing list label-alignment serialization into xmloff/source/style/xmlnume.ts, matching pinned SvxXMLNumRuleExport::exportLevelStyle in xmlnume.cxx, with txtparae.test.ts caller import and mapped metadata. No serialization/default behavior change from that responsibility move. Same-container duplicates, display names, full named model breadth and other defaults remain separate audits. No external access; registered deviations preserved."
  Plan: "Complete approved style context ownership/direct-parent lookup and common inherited list-base export. Preserve passing exact geometry, ODT and browser contracts. Extract unchanged list label-alignment serialization into the inspected pinned xmlnume.cxx source owner (SvxXMLNumRuleExport::exportLevelStyle), update caller/test imports and provenance, and rerun every mandatory gate. Correct the earlier unverified txtnumre filename assumption before mutation. The active user goal authorizes necessary source-aligned refactoring; no external actions or semantic expansion."
  Verify Steps: "1. Compare pinned XML style context AddStyle/FindStyleChildContext, SwXMLImport::CreateStylesContext and SetStyles/SetAutoStyles reference replacement, and SetStyleAndAttrs direct automatic versus named parent lookup/application. 2. Context assertions verify leaf-reference ownership, container isolation and family identity, explicit automatic precedence, named-only parents, empty/missing parents and no automatic parent recursion. 3. Literal real ODT common/automatic collisions, same names across streams, automatic context replacement, named parent chains, automatic overrides, direct/self-named parent scope and built-in paragraph inheritance assert manual model state on import/export/reimport. Update contradictory fixtures with valid named parent placement while preserving intended assertions. 4. Focused affected context/ODT suites and full npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check pass. Record architecture and narrow evidence without module parity promotion."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this scoped implementation commit if source-backed style ownership or lookup semantics introduce a verified regression; retain previously completed corrections."
  Findings: |-
    - Observation: Focused ODT suite initially passed 118/119 cases: tdf114287 failed only on export/reopen first-line indent, while imported and browser codec states retained exact upstream values.
      Impact: Correct named-only parent lookup exposed an existing export workaround that emitted its base as an automatic style and depended on unsupported automatic parent recursion.
      Resolution: Reapproved the necessary three-path export dependency under the existing iterative refactoring goal; separated inherited base XML into common styles and shared deterministic Writer export source between styles.xml and content.xml. Preserved all upstream geometry expectations; the affected suite then passed 125/125. Full custom named model ownership and removal of this bounded export bridge remain a later architecture audit.

    - Observation: The added export assertion initially used inch serialization instead of the existing centimetre exporter, and the full gate stopped at a new test helper namespace inferred as the style URI literal.
      Impact: Test-only contract and type issues; runtime ODT geometry/container checks passed.
      Resolution: Corrected the manual equivalent centimetre expectations and explicitly typed the attribute namespace string; rerun the focused suites before full gates. No checks skipped or thresholds changed.

    - Observation: Pinned xmlfmt.cxx CreateStylesContext selects separate SetStyles/SetAutoStyles references; core xmlimp.cxx disposes/replaces those references. xmlstyle.cxx retains regular leaf references with AddStyle and searches family/name within that container. txtimp.cxx SetStyleAndAttrs searches active automatic context once, selects its named parent and applies found automatic properties independently; absent names clear style application. CopyAutoStylesToDoc does not run the common CopyStylesToDoc SetDefaults path.
      Impact: The previous merged Writer style maps rejected legal common/automatic collisions, incorrectly retained automatic definitions across streams and followed automatic parents. Existing list export used that invalid parent recursion as a workaround.
      Resolution: Regular paragraph/text leaf contexts now own parsed properties inside their XMLStylesContext. Writer retains independent common/active automatic references; direct lookup is automatic-first and all parents are common-only. Found deltas survive unresolved parents. The necessary list exporter bridge emits its inherited base into common styles. Context identity/default tests, one direct target test, eleven direct/parent literal ODT cases and four replacement/default literal ODT cases verify import/export/reimport; the genuine pinned geometry test is unchanged. Full native named model/display-name/duplicate/default/hint obligations and exporter architecture remain unverified. All repository artifacts remain English; no external access, intentional deviations or enforcement changes.

    - Observation: Full verification passed all 595 application tests but stopped at 99.98% branch coverage: only the empty-map fallback for an entirely absent common container lacked evidence.
      Impact: The new optional container ownership branch needs a real absent-container input; mandatory 100% coverage is unchanged.
      Resolution: Added a literal ODT with no common container to assert the existing bounded missing-Standard diagnostic. Broader upstream missing-Standard acceptance remains a separate default/model audit. Rerun the complete gate after this targeted case.

    - Observation: The full gate passed 596 app tests, 109 inventory tests, 19 browser cases and 100% coverage before the authored-size check rejected txtparae.ts at 1005 lines.
      Impact: The necessary common-style export addition crossed an enforced size boundary; deleting padding or changing enforcement is inappropriate.
      Resolution: Read the actual pinned SvxXMLNumRuleExport::exportLevelStyle in xmloff/source/style/xmlnume.cxx and extracted the existing label-alignment serializer into that owner. Canonical AST body comparison against c80f82d45904 proves identical conditions/defaults/output with only an explicit existing length converter port. No new behavior/default claim: upstream zero/label-followed-by omission and units remain unverified. Source-tree/provenance and parity pass for 196 modules (120 mapped), semanticViolationCount=0; focused 133 tests in 26 files and file-size checks pass. Repeat full gate after the final extraction.
id_source: "generated"
---
## Summary

Restore named and automatic style context ownership

Child of C9TN6M. Follow native per-container XML style ownership, independent named/active automatic references and automatic-first direct versus named-only parent resolution. Preserve legal common/automatic name collisions and stream replacement through real ODT cycles.

## Scope

Previously approved context ownership, lookup, metadata and directly affected tests plus xmloff/source/text/txtparae.ts, txtpara.test.ts and sw/source/filter/xml/xmlexp.ts. Remove the source-invalid automatic-parent export bridge using common styles and shared deterministic export. Extract unchanged existing list label-alignment serialization into xmloff/source/style/xmlnume.ts, matching pinned SvxXMLNumRuleExport::exportLevelStyle in xmlnume.cxx, with txtparae.test.ts caller import and mapped metadata. No serialization/default behavior change from that responsibility move. Same-container duplicates, display names, full named model breadth and other defaults remain separate audits. No external access; registered deviations preserved.

## Plan

Complete approved style context ownership/direct-parent lookup and common inherited list-base export. Preserve passing exact geometry, ODT and browser contracts. Extract unchanged list label-alignment serialization into the inspected pinned xmlnume.cxx source owner (SvxXMLNumRuleExport::exportLevelStyle), update caller/test imports and provenance, and rerun every mandatory gate. Correct the earlier unverified txtnumre filename assumption before mutation. The active user goal authorizes necessary source-aligned refactoring; no external actions or semantic expansion.

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

- Observation: The added export assertion initially used inch serialization instead of the existing centimetre exporter, and the full gate stopped at a new test helper namespace inferred as the style URI literal.
  Impact: Test-only contract and type issues; runtime ODT geometry/container checks passed.
  Resolution: Corrected the manual equivalent centimetre expectations and explicitly typed the attribute namespace string; rerun the focused suites before full gates. No checks skipped or thresholds changed.

- Observation: Pinned xmlfmt.cxx CreateStylesContext selects separate SetStyles/SetAutoStyles references; core xmlimp.cxx disposes/replaces those references. xmlstyle.cxx retains regular leaf references with AddStyle and searches family/name within that container. txtimp.cxx SetStyleAndAttrs searches active automatic context once, selects its named parent and applies found automatic properties independently; absent names clear style application. CopyAutoStylesToDoc does not run the common CopyStylesToDoc SetDefaults path.
  Impact: The previous merged Writer style maps rejected legal common/automatic collisions, incorrectly retained automatic definitions across streams and followed automatic parents. Existing list export used that invalid parent recursion as a workaround.
  Resolution: Regular paragraph/text leaf contexts now own parsed properties inside their XMLStylesContext. Writer retains independent common/active automatic references; direct lookup is automatic-first and all parents are common-only. Found deltas survive unresolved parents. The necessary list exporter bridge emits its inherited base into common styles. Context identity/default tests, one direct target test, eleven direct/parent literal ODT cases and four replacement/default literal ODT cases verify import/export/reimport; the genuine pinned geometry test is unchanged. Full native named model/display-name/duplicate/default/hint obligations and exporter architecture remain unverified. All repository artifacts remain English; no external access, intentional deviations or enforcement changes.

- Observation: Full verification passed all 595 application tests but stopped at 99.98% branch coverage: only the empty-map fallback for an entirely absent common container lacked evidence.
  Impact: The new optional container ownership branch needs a real absent-container input; mandatory 100% coverage is unchanged.
  Resolution: Added a literal ODT with no common container to assert the existing bounded missing-Standard diagnostic. Broader upstream missing-Standard acceptance remains a separate default/model audit. Rerun the complete gate after this targeted case.

- Observation: The full gate passed 596 app tests, 109 inventory tests, 19 browser cases and 100% coverage before the authored-size check rejected txtparae.ts at 1005 lines.
  Impact: The necessary common-style export addition crossed an enforced size boundary; deleting padding or changing enforcement is inappropriate.
  Resolution: Read the actual pinned SvxXMLNumRuleExport::exportLevelStyle in xmloff/source/style/xmlnume.cxx and extracted the existing label-alignment serializer into that owner. Canonical AST body comparison against c80f82d45904 proves identical conditions/defaults/output with only an explicit existing length converter port. No new behavior/default claim: upstream zero/label-followed-by omission and units remain unverified. Source-tree/provenance and parity pass for 196 modules (120 mapped), semanticViolationCount=0; focused 133 tests in 26 files and file-size checks pass. Repeat full gate after the final extraction.

---
id: "202609301846-ZBRNAK"
title: "Restore unresolved character style import fallback"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T18:47:10.296Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-30T19:00:08.460Z"
  updated_by: "CODER"
  note: "Unresolved character styles apply no delta and retain found properties; 11 context and 11 real ODT cases pass. Full verify 588/109/19, 100% required coverage; doctor/routing/diff checks pass."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore family-specific missing character-style fallback and preserve found properties, verified with context and real ODT cases."
events:
  -
    type: "status"
    at: "2026-09-30T18:47:10.790Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore family-specific missing character-style fallback and preserve found properties, verified with context and real ODT cases."
  -
    type: "verify"
    at: "2026-09-30T19:00:08.460Z"
    author: "CODER"
    state: "ok"
    note: "Unresolved character styles apply no delta and retain found properties; 11 context and 11 real ODT cases pass. Full verify 588/109/19, 100% required coverage; doctor/routing/diff checks pass."
doc_version: 3
doc_updated_at: "2026-09-30T19:00:08.525Z"
doc_updated_by: "CODER"
description: "Child of C9TN6M. Follow pinned XMLTextImportHelper::SetStyleAndAttrs family-specific missing style fallback and automatic property application. Unknown/wrong-family character style names must not abort span text import; property-less text styles and unresolved parents retain inherited formatting and found child deltas."
sections:
  Summary: |-
    Restore unresolved character style import fallback

    Child of C9TN6M. Follow pinned XMLTextImportHelper::SetStyleAndAttrs family-specific missing style fallback and automatic property application. Unknown/wrong-family character style names must not abort span text import; property-less text styles and unresolved parents retain inherited formatting and found child deltas.
  Scope: "Only apps/office/src/xmloff/source/text/txtparai.ts, txtpara.test.ts, sw/source/filter/xml/odt-span-roundtrip.test.ts, docs/program/parity/runtime-inventory.json, docs/program/source-provenance.json and task artifacts. Restore no-op unresolved/wrong-family character-style lookup and optional character properties, preserve found child properties and valid parent inheritance. Cycle detection, paragraph/list resolution, family table/display name identity, generic null handlers and wider hint ownership remain separate audits. Registered save/open/recovery deviations excluded."
  Plan: "Make missing/wrong-family character-style resolution return no delta; recurse through valid text-style parents even when local properties are absent, and retain own deltas when parents are missing. Add source-derived context and literal ODT cycle assertions, update narrow provenance, execute full gates and close before resuming the parent audit. User goal authorizes this in-scope correction."
  Verify Steps: "1. Inspect pinned XMLTextImportHelper::SetStyleAndAttrs family lookup, unresolved-name clear and independent automatic property application, plus XMLParaContext character hint invocation. 2. Context assertions cover unknown/case/whitespace/wrong-family names, property-less styles with and without valid parent, missing/wrong-family parents retaining child deltas, explicit false overrides, inheritance and scope restoration, controls and links. Correct the contradictory Missing-name rejection fixture while retaining unrelated failures and cycle assertions. 3. Literal real ODT input/export/reimport cases verify manual Writer text/format/link expectations for those resolution branches. 4. Focused context/span/hyperlink tests, npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check pass. Keep provenance/inventory evidence bounded and semantic statuses unverified."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-30T19:00:08.460Z — VERIFY — ok

    By: CODER

    Note: Unresolved character styles apply no delta and retain found properties; 11 context and 11 real ODT cases pass. Full verify 588/109/19, 100% required coverage; doctor/routing/diff checks pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T19:00:08.053Z, excerpt_hash=sha256:537e4af62e837e6f5c4ce47da054daa7bf90e4e9dd93c97ec00fe770501d9137

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301846-ZBRNAK/blueprint/resolved-snapshot.json
    - old_digest: 1972bf121a90c5f4534081678ff3d82b69fe458ec97c3150949c9c5ac7c86f96
    - current_digest: 1972bf121a90c5f4534081678ff3d82b69fe458ec97c3150949c9c5ac7c86f96
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609301846-ZBRNAK

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609301846-ZBRNAK
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation commit if source-backed no-op lookup behavior produces a verified regression; retain previous completed corrections."
  Findings: "Pinned source: XMLTextImportHelper::SetStyleAndAttrs (txtimp.cxx 1034-1070) performs family-specific automatic and named lookup, clears unavailable names without applying CharStyleName, then independently calls pStyle->FillPropertySet at 1258-1260. XMLParaContext in txtparai.cxx 1856-1870 invokes that helper for character-style hints. Local resolveTextStyle now contributes no delta for unknown/wrong-family definitions, accepts absent local properties, follows valid text parents and retains found child deltas with unresolved parents. Existing cyclic guard and unrelated paragraph/list failures remain unchanged; contradictory Missing-span rejection removed. Command: node_modules/.bin/vitest run --root apps/office src/xmloff/source/text/txtpara.test.ts src/sw/source/filter/xml/odt-span-roundtrip.test.ts src/sw/source/filter/xml/odt-hyperlink-roundtrip.test.ts. Result: pass (3 files, 18 tests), focused.log. Scope: eleven new context cases and eleven literal real ODT package cycles with exact unknown/case/whitespace names, inherited paragraph and character state, missing/wrong-family definitions and parents, property-less styles, valid parent chains, explicit false overrides, scope restoration, controls and links. Real valid parent styles are in styles.xml, automatic children in content.xml to match native lookup ownership. Command: npm run verify. Result: pass (exit 0), verify.log; 588 app tests, 109 inventory tests, 19 browser tests, all required coverage 100%, formatting/lint/type/resource/module/static/docs/size/tree/provenance/invariants/parity gates passed, semanticViolationCount 0. Commands: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass, doctor has no errors and only two preexisting hook-shim/historical close-hash warnings. A metadata update script initially used the wrong provenance root key after successfully writing runtime evidence; recomputed route, inspected actual entries key and completed the intended provenance delta once, with no schema/generator changes. Diff stays scoped. Semantic statuses remain unverified; broader family/common/automatic table identity, display-name mapping, full hint ownership/precedence, cycle semantics, generic null handling and other runtime/UI contracts remain open. Registered save/open/recovery decisions untouched. Next source-backed gap: StyleIndexCompareByName and SvXMLStylesContext_Impl::FindStyleChildContext in pinned style/xmlstyle.cxx compare family plus name, whereas SwXMLImport has a single name-keyed map, getStyle lacks a family argument and registerStyle rejects identical names across paragraph/text families. Resolve this identity/lookup collision separately with source-backed same-name and wrong-family inheritance assertions."
id_source: "generated"
---
## Summary

Restore unresolved character style import fallback

Child of C9TN6M. Follow pinned XMLTextImportHelper::SetStyleAndAttrs family-specific missing style fallback and automatic property application. Unknown/wrong-family character style names must not abort span text import; property-less text styles and unresolved parents retain inherited formatting and found child deltas.

## Scope

Only apps/office/src/xmloff/source/text/txtparai.ts, txtpara.test.ts, sw/source/filter/xml/odt-span-roundtrip.test.ts, docs/program/parity/runtime-inventory.json, docs/program/source-provenance.json and task artifacts. Restore no-op unresolved/wrong-family character-style lookup and optional character properties, preserve found child properties and valid parent inheritance. Cycle detection, paragraph/list resolution, family table/display name identity, generic null handlers and wider hint ownership remain separate audits. Registered save/open/recovery deviations excluded.

## Plan

Make missing/wrong-family character-style resolution return no delta; recurse through valid text-style parents even when local properties are absent, and retain own deltas when parents are missing. Add source-derived context and literal ODT cycle assertions, update narrow provenance, execute full gates and close before resuming the parent audit. User goal authorizes this in-scope correction.

## Verify Steps

1. Inspect pinned XMLTextImportHelper::SetStyleAndAttrs family lookup, unresolved-name clear and independent automatic property application, plus XMLParaContext character hint invocation. 2. Context assertions cover unknown/case/whitespace/wrong-family names, property-less styles with and without valid parent, missing/wrong-family parents retaining child deltas, explicit false overrides, inheritance and scope restoration, controls and links. Correct the contradictory Missing-name rejection fixture while retaining unrelated failures and cycle assertions. 3. Literal real ODT input/export/reimport cases verify manual Writer text/format/link expectations for those resolution branches. 4. Focused context/span/hyperlink tests, npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check pass. Keep provenance/inventory evidence bounded and semantic statuses unverified.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-30T19:00:08.460Z — VERIFY — ok

By: CODER

Note: Unresolved character styles apply no delta and retain found properties; 11 context and 11 real ODT cases pass. Full verify 588/109/19, 100% required coverage; doctor/routing/diff checks pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T19:00:08.053Z, excerpt_hash=sha256:537e4af62e837e6f5c4ce47da054daa7bf90e4e9dd93c97ec00fe770501d9137

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301846-ZBRNAK/blueprint/resolved-snapshot.json
- old_digest: 1972bf121a90c5f4534081678ff3d82b69fe458ec97c3150949c9c5ac7c86f96
- current_digest: 1972bf121a90c5f4534081678ff3d82b69fe458ec97c3150949c9c5ac7c86f96
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609301846-ZBRNAK

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609301846-ZBRNAK
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation commit if source-backed no-op lookup behavior produces a verified regression; retain previous completed corrections.

## Findings

Pinned source: XMLTextImportHelper::SetStyleAndAttrs (txtimp.cxx 1034-1070) performs family-specific automatic and named lookup, clears unavailable names without applying CharStyleName, then independently calls pStyle->FillPropertySet at 1258-1260. XMLParaContext in txtparai.cxx 1856-1870 invokes that helper for character-style hints. Local resolveTextStyle now contributes no delta for unknown/wrong-family definitions, accepts absent local properties, follows valid text parents and retains found child deltas with unresolved parents. Existing cyclic guard and unrelated paragraph/list failures remain unchanged; contradictory Missing-span rejection removed. Command: node_modules/.bin/vitest run --root apps/office src/xmloff/source/text/txtpara.test.ts src/sw/source/filter/xml/odt-span-roundtrip.test.ts src/sw/source/filter/xml/odt-hyperlink-roundtrip.test.ts. Result: pass (3 files, 18 tests), focused.log. Scope: eleven new context cases and eleven literal real ODT package cycles with exact unknown/case/whitespace names, inherited paragraph and character state, missing/wrong-family definitions and parents, property-less styles, valid parent chains, explicit false overrides, scope restoration, controls and links. Real valid parent styles are in styles.xml, automatic children in content.xml to match native lookup ownership. Command: npm run verify. Result: pass (exit 0), verify.log; 588 app tests, 109 inventory tests, 19 browser tests, all required coverage 100%, formatting/lint/type/resource/module/static/docs/size/tree/provenance/invariants/parity gates passed, semanticViolationCount 0. Commands: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass, doctor has no errors and only two preexisting hook-shim/historical close-hash warnings. A metadata update script initially used the wrong provenance root key after successfully writing runtime evidence; recomputed route, inspected actual entries key and completed the intended provenance delta once, with no schema/generator changes. Diff stays scoped. Semantic statuses remain unverified; broader family/common/automatic table identity, display-name mapping, full hint ownership/precedence, cycle semantics, generic null handling and other runtime/UI contracts remain open. Registered save/open/recovery decisions untouched. Next source-backed gap: StyleIndexCompareByName and SvXMLStylesContext_Impl::FindStyleChildContext in pinned style/xmlstyle.cxx compare family plus name, whereas SwXMLImport has a single name-keyed map, getStyle lacks a family argument and registerStyle rejects identical names across paragraph/text families. Resolve this identity/lookup collision separately with source-backed same-name and wrong-family inheritance assertions.

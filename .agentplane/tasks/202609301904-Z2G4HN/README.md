---
id: "202609301904-Z2G4HN"
title: "Restore family-scoped text style identity"
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
  updated_at: "2026-09-30T19:18:19.779Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-30T19:29:36.210Z"
  updated_by: "CODER"
  note: "Native family-plus-name identity restored; context and literal ODT declaration-order cases pass. 14 prior tests unchanged after decomposition. Full verify 590/109/19, 100% required coverage; doctor/routing/diff checks pass."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-30T19:30:26.197Z"
  updated_by: "EVALUATOR"
  note: "Bounded family-plus-name identity follows pinned style index and application contracts; full verification passes."
  evaluated_sha: "4570b3675dc3d3a46946b419c7706e4a1f3969b9"
  blueprint_digest: "b5be320b845c5ce4f87a91cb5a934fb6d9536a1a28c45c8bda008ca45215063f"
  evidence_refs:
    - ".agentplane/tasks/202609301904-Z2G4HN/README.md"
    - ".agentplane/tasks/202609301904-Z2G4HN/quality/20260930-193026197-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609301904-Z2G4HN/quality/20260930-193026197-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609301904-Z2G4HN/quality/20260930-193026197-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609301904-Z2G4HN/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202609301904-Z2G4HN/focused.log"
    - ".agentplane/tasks/202609301904-Z2G4HN/test-decomposition.log"
    - ".agentplane/tasks/202609301904-Z2G4HN/verify.log"
  findings:
    - "Separate family registration and explicit lookup preserve same-name paragraph/text properties, inheritance, built-in style state and scope through order-varied real ODT cycles. Old cross-family failure guard and fixture are corrected. AST comparison preserves all 14 prior tests after required decomposition. Wider container identity and semantics remain unverified."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore family-plus-name style storage and lookup, verified by direct context and literal real ODT inheritance and built-in cases."
events:
  -
    type: "status"
    at: "2026-09-30T19:05:18.595Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore family-plus-name style storage and lookup, verified by direct context and literal real ODT inheritance and built-in cases."
  -
    type: "verify"
    at: "2026-09-30T19:29:36.210Z"
    author: "CODER"
    state: "ok"
    note: "Native family-plus-name identity restored; context and literal ODT declaration-order cases pass. 14 prior tests unchanged after decomposition. Full verify 590/109/19, 100% required coverage; doctor/routing/diff checks pass."
doc_version: 3
doc_updated_at: "2026-09-30T19:29:36.263Z"
doc_updated_by: "CODER"
description: "Child of C9TN6M. Pinned style indexes and text application identify styles by family plus name. Separate paragraph/text registration and require family-specific resolution, preserving same-name definitions and built-in paragraph lookup through real ODT cycles."
sections:
  Summary: |-
    Restore family-scoped text style identity

    Child of C9TN6M. Pinned style indexes and text application identify styles by family plus name. Separate paragraph/text registration and require family-specific resolution, preserving same-name definitions and built-in paragraph lookup through real ODT cycles.
  Scope: "Only xmloff/source/text/txtparai.ts, txtpara.test.ts and new txtparai.test.ts, sw/source/filter/xml/xmlimp.ts, odt-roundtrip.test.ts and new odt-style-family-roundtrip.test.ts, runtime-inventory.json, source-provenance.json and task artifacts. Require explicit implemented paragraph/text family lookup, store definitions independently by family and pass only paragraph definitions to named Writer paragraph application. Split the combined test module into import/export suites to obey mandatory file-size policy with unchanged assertions. Replace the contradictory wrong-family Heading rejection fixture with no-paragraph-leak assertions; preserve same-family duplicate rejection. Common/automatic separation, display-name identity, cycle/default policies and generic null context contracts remain individual follow-ups. Registered save/open/recovery deviations excluded."
  Plan: "Restore family-plus-name style identity and explicit family-first lookup at all consumers. Verify same-name family isolation and order-independent inheritance in contexts and literal real ODT cycles. Move existing import tests unchanged to txtparai.test.ts for required decomposition. Correct the existing wrong-family Heading rejection fixture revealed by focused tests: character definitions must not invalidate named paragraph application; remove its obsolete cross-family guard while retaining actual missing Standard and same-family duplicate checks. These in-scope source-backed corrections and test refactoring are authorized by the active goal. Update bounded provenance, run complete gates, review and close."
  Verify Steps: "1. Compare pinned StyleIndexCompareByName/FindStyleChildContext family-plus-name identity and SetStyleAndAttrs family-specific lookup. 2. Source-derived context tests cover same-name paragraph/text direct and inherited definitions, reverse insertion order, built-in Standard/Heading identity and family-isolated wrong-family parent references. 3. Literal real ODT named/automatic styles assert same-name family coexistence, own and parent property selection, built-in paragraph state and span overrides/scope through import/export/reimport; retain same-family duplicate rejection assertions. 4. Focused context/family/ODT tests, npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check pass. Inventory/provenance evidence remains narrowly bounded with broader semantic statuses unverified."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-30T19:29:36.210Z — VERIFY — ok

    By: CODER

    Note: Native family-plus-name identity restored; context and literal ODT declaration-order cases pass. 14 prior tests unchanged after decomposition. Full verify 590/109/19, 100% required coverage; doctor/routing/diff checks pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T19:29:35.873Z, excerpt_hash=sha256:ed94deb07bc1a343ae5c2ba4938cb2fa2b598e34f9d5a1f7468b9293f5523549

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301904-Z2G4HN/blueprint/resolved-snapshot.json
    - old_digest: b5be320b845c5ce4f87a91cb5a934fb6d9536a1a28c45c8bda008ca45215063f
    - current_digest: b5be320b845c5ce4f87a91cb5a934fb6d9536a1a28c45c8bda008ca45215063f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609301904-Z2G4HN

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609301904-Z2G4HN
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commit if family-specific storage or lookup causes a verified regression; preserve earlier completed parity changes."
  Findings: "Preflight: clean main, direct workflow, only parent C9TN6M active. Pinned source: StyleIndexCompareByName and SvXMLStylesContext_Impl::FindStyleChildContext in xmloff/source/style/xmlstyle.cxx compare family plus name; XMLTextImportHelper::SetStyleAndAttrs likewise requests family-specific lookup. SwXMLImport now holds separate implemented paragraph/text maps, registration checks duplicate names within one family, every getStyle request requires the family first, and named Writer paragraph application receives only paragraph definitions. Obsolete cross-family failure branches are removed. Command: node_modules/.bin/vitest run --root apps/office src/xmloff/source/text/txtpara.test.ts src/xmloff/source/text/txtparai.test.ts src/sw/source/filter/xml/odt-style-family-roundtrip.test.ts src/sw/source/filter/xml/odt-span-roundtrip.test.ts src/sw/source/filter/xml/odt-font-style-roundtrip.test.ts src/sw/source/filter/xml/odt-roundtrip.test.ts. Result: pass (6 files, 35 tests), focused.log. Scope: five new context inputs and six literal ODT cases, each in forward/reverse declaration order, assert same-name direct/parent and Standard/Heading family isolation, paragraph geometry, nested character properties, scope restoration and wrong-family no-leak through import/export/reimport. Existing same-family duplicate and missing Standard failures remain. Initial focused run exposed an old Heading text-family fixture expecting paragraph rejection; corrected to assert the heading paragraph name/items match an absent paragraph definition, preserving broader unaudited defaults. Diagnostic: focused-before-family-fixture.log. New unit cases brought the combined test module to 1006 lines, requiring source-owner test decomposition. Command: node .agentplane/tasks/202609301904-Z2G4HN/test-decomposition.mjs. Result: pass, test-decomposition.log proves all 14 original test bodies unchanged and unduplicated, plus one new family test. Import helper and tests now live in txtparai.test.ts; export tests remain in txtpara.test.ts, and evidence links are updated. Initial full verify stopped at two unused test imports/fixtures after decomposition; removed these and repeated full verification. Diagnostic: verify-before-test-import-cleanup.log. Command: npm run verify. Result: pass (exit 0), verify.log; 590 app tests in 122 files, 109 inventory tests, 19 browser tests; all required coverage 100%; format/lint/type/module/resource/static/docs/size/tree/provenance/invariants/parity gates passed, semanticViolationCount 0. No schema/config/generator/validator weakening. Commands: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass, doctor has no errors and only two preexisting hook-shim/historical close-hash warnings. Broader runtime/UI and module semantic statuses remain unverified; Sw XML source responsibility is honestly unverified rather than promoting the bounded bridge. Registered save/open/recovery deviations untouched. Next source-backed correction: SwXMLDocContext_Impl passes false/true to CreateStylesContext for office:styles/office:automatic-styles; SwXMLImport::CreateStylesContext in xmlfmt.cxx 995-1012 creates a context and retains it independently with SetStyles/SetAutoStyles. SetStyleAndAttrs searches automatic styles for the direct name, then replaces it with that context's parent for lookup in named family tables; it does not recurse through automatic parents. Local SwXMLDocContext constructs the same XMLStylesContext for both containers and registration stores every definition in one map per family; common and automatic names collide, and recursive parent lookup can wrongly select an automatic definition. Separate container ownership and lookup precedence in the next leaf; display names, same-family duplicate selection, cycles/defaults, full hint architecture and global null context policy remain open."
id_source: "generated"
---
## Summary

Restore family-scoped text style identity

Child of C9TN6M. Pinned style indexes and text application identify styles by family plus name. Separate paragraph/text registration and require family-specific resolution, preserving same-name definitions and built-in paragraph lookup through real ODT cycles.

## Scope

Only xmloff/source/text/txtparai.ts, txtpara.test.ts and new txtparai.test.ts, sw/source/filter/xml/xmlimp.ts, odt-roundtrip.test.ts and new odt-style-family-roundtrip.test.ts, runtime-inventory.json, source-provenance.json and task artifacts. Require explicit implemented paragraph/text family lookup, store definitions independently by family and pass only paragraph definitions to named Writer paragraph application. Split the combined test module into import/export suites to obey mandatory file-size policy with unchanged assertions. Replace the contradictory wrong-family Heading rejection fixture with no-paragraph-leak assertions; preserve same-family duplicate rejection. Common/automatic separation, display-name identity, cycle/default policies and generic null context contracts remain individual follow-ups. Registered save/open/recovery deviations excluded.

## Plan

Restore family-plus-name style identity and explicit family-first lookup at all consumers. Verify same-name family isolation and order-independent inheritance in contexts and literal real ODT cycles. Move existing import tests unchanged to txtparai.test.ts for required decomposition. Correct the existing wrong-family Heading rejection fixture revealed by focused tests: character definitions must not invalidate named paragraph application; remove its obsolete cross-family guard while retaining actual missing Standard and same-family duplicate checks. These in-scope source-backed corrections and test refactoring are authorized by the active goal. Update bounded provenance, run complete gates, review and close.

## Verify Steps

1. Compare pinned StyleIndexCompareByName/FindStyleChildContext family-plus-name identity and SetStyleAndAttrs family-specific lookup. 2. Source-derived context tests cover same-name paragraph/text direct and inherited definitions, reverse insertion order, built-in Standard/Heading identity and family-isolated wrong-family parent references. 3. Literal real ODT named/automatic styles assert same-name family coexistence, own and parent property selection, built-in paragraph state and span overrides/scope through import/export/reimport; retain same-family duplicate rejection assertions. 4. Focused context/family/ODT tests, npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check pass. Inventory/provenance evidence remains narrowly bounded with broader semantic statuses unverified.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-30T19:29:36.210Z — VERIFY — ok

By: CODER

Note: Native family-plus-name identity restored; context and literal ODT declaration-order cases pass. 14 prior tests unchanged after decomposition. Full verify 590/109/19, 100% required coverage; doctor/routing/diff checks pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T19:29:35.873Z, excerpt_hash=sha256:ed94deb07bc1a343ae5c2ba4938cb2fa2b598e34f9d5a1f7468b9293f5523549

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301904-Z2G4HN/blueprint/resolved-snapshot.json
- old_digest: b5be320b845c5ce4f87a91cb5a934fb6d9536a1a28c45c8bda008ca45215063f
- current_digest: b5be320b845c5ce4f87a91cb5a934fb6d9536a1a28c45c8bda008ca45215063f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609301904-Z2G4HN

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609301904-Z2G4HN
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commit if family-specific storage or lookup causes a verified regression; preserve earlier completed parity changes.

## Findings

Preflight: clean main, direct workflow, only parent C9TN6M active. Pinned source: StyleIndexCompareByName and SvXMLStylesContext_Impl::FindStyleChildContext in xmloff/source/style/xmlstyle.cxx compare family plus name; XMLTextImportHelper::SetStyleAndAttrs likewise requests family-specific lookup. SwXMLImport now holds separate implemented paragraph/text maps, registration checks duplicate names within one family, every getStyle request requires the family first, and named Writer paragraph application receives only paragraph definitions. Obsolete cross-family failure branches are removed. Command: node_modules/.bin/vitest run --root apps/office src/xmloff/source/text/txtpara.test.ts src/xmloff/source/text/txtparai.test.ts src/sw/source/filter/xml/odt-style-family-roundtrip.test.ts src/sw/source/filter/xml/odt-span-roundtrip.test.ts src/sw/source/filter/xml/odt-font-style-roundtrip.test.ts src/sw/source/filter/xml/odt-roundtrip.test.ts. Result: pass (6 files, 35 tests), focused.log. Scope: five new context inputs and six literal ODT cases, each in forward/reverse declaration order, assert same-name direct/parent and Standard/Heading family isolation, paragraph geometry, nested character properties, scope restoration and wrong-family no-leak through import/export/reimport. Existing same-family duplicate and missing Standard failures remain. Initial focused run exposed an old Heading text-family fixture expecting paragraph rejection; corrected to assert the heading paragraph name/items match an absent paragraph definition, preserving broader unaudited defaults. Diagnostic: focused-before-family-fixture.log. New unit cases brought the combined test module to 1006 lines, requiring source-owner test decomposition. Command: node .agentplane/tasks/202609301904-Z2G4HN/test-decomposition.mjs. Result: pass, test-decomposition.log proves all 14 original test bodies unchanged and unduplicated, plus one new family test. Import helper and tests now live in txtparai.test.ts; export tests remain in txtpara.test.ts, and evidence links are updated. Initial full verify stopped at two unused test imports/fixtures after decomposition; removed these and repeated full verification. Diagnostic: verify-before-test-import-cleanup.log. Command: npm run verify. Result: pass (exit 0), verify.log; 590 app tests in 122 files, 109 inventory tests, 19 browser tests; all required coverage 100%; format/lint/type/module/resource/static/docs/size/tree/provenance/invariants/parity gates passed, semanticViolationCount 0. No schema/config/generator/validator weakening. Commands: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass, doctor has no errors and only two preexisting hook-shim/historical close-hash warnings. Broader runtime/UI and module semantic statuses remain unverified; Sw XML source responsibility is honestly unverified rather than promoting the bounded bridge. Registered save/open/recovery deviations untouched. Next source-backed correction: SwXMLDocContext_Impl passes false/true to CreateStylesContext for office:styles/office:automatic-styles; SwXMLImport::CreateStylesContext in xmlfmt.cxx 995-1012 creates a context and retains it independently with SetStyles/SetAutoStyles. SetStyleAndAttrs searches automatic styles for the direct name, then replaces it with that context's parent for lookup in named family tables; it does not recurse through automatic parents. Local SwXMLDocContext constructs the same XMLStylesContext for both containers and registration stores every definition in one map per family; common and automatic names collide, and recursive parent lookup can wrongly select an automatic definition. Separate container ownership and lookup precedence in the next leaf; display names, same-family duplicate selection, cycles/defaults, full hint architecture and global null context policy remain open.

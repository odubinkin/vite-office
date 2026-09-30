---
id: "202609301823-RR9KXK"
title: "Restore optional text span style contract"
result_summary: "Absent and empty span style names preserve text and inherited formatting without lookup; scoped evidence recorded."
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
  updated_at: "2026-09-30T18:24:56.186Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-30T18:43:01.489Z"
  updated_by: "CODER"
  note: "Optional span styles follow pinned no-hint behavior; six context and eight real ODT cases pass. Full verify 586/109/19, all required coverage 100%, semantic violations zero; doctor/routing/diff checks pass."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-30T18:43:43.670Z"
  updated_by: "EVALUATOR"
  note: "Bounded optional span style contract matches pinned constructor; full verification passes."
  evaluated_sha: "e0a35ca2d44c2d5f176d8b21d7db0b082ec7f6be"
  blueprint_digest: "8a8b9a80aa238190420769bcddee0d0980e4c7e6765ffd9a199e8fbfbf19ca2a"
  evidence_refs:
    - ".agentplane/tasks/202609301823-RR9KXK/README.md"
    - ".agentplane/tasks/202609301823-RR9KXK/quality/20260930-184343670-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609301823-RR9KXK/quality/20260930-184343670-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609301823-RR9KXK/quality/20260930-184343670-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609301823-RR9KXK/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202609301823-RR9KXK/focused.log"
    - ".agentplane/tasks/202609301823-RR9KXK/verify.log"
    - ".agentplane/tasks/202609301823-RR9KXK/verify-before-coverage.log"
  findings:
    - "Only absent and empty names skip character-style lookup. Inherited state, overrides, controls and hyperlink transitions are verified in context and real ODT cycles; unknown named styles and wider hint contracts remain separate audits."
commit:
  hash: "e0a35ca2d44c2d5f176d8b21d7db0b082ec7f6be"
  message: "🛠 RR9KXK task: restore optional span style hints"
comments:
  -
    author: "CODER"
    body: "Start: restore native optional span style behavior and verify inherited inline state through real ODT cycles."
  -
    author: "CODER"
    body: "Verified: optional span hint behavior, inherited inline state and real ODT cycles; full verify 586/109/19 and 100% required coverage."
events:
  -
    type: "status"
    at: "2026-09-30T18:24:56.652Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore native optional span style behavior and verify inherited inline state through real ODT cycles."
  -
    type: "verify"
    at: "2026-09-30T18:43:01.489Z"
    author: "CODER"
    state: "ok"
    note: "Optional span styles follow pinned no-hint behavior; six context and eight real ODT cases pass. Full verify 586/109/19, all required coverage 100%, semantic violations zero; doctor/routing/diff checks pass."
  -
    type: "status"
    at: "2026-09-30T18:43:46.157Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: optional span hint behavior, inherited inline state and real ODT cycles; full verify 586/109/19 and 100% required coverage."
doc_version: 3
doc_updated_at: "2026-09-30T18:43:46.159Z"
doc_updated_by: "CODER"
description: "Child of C9TN6M. Native XMLImpSpanContext_Impl accepts spans with absent/empty style names and applies no additional character-style hint. Preserve inherited inline properties, control content and hyperlinks through ODT import/export/reimport."
sections:
  Summary: |-
    Restore optional text span style contract

    Child of C9TN6M. Native XMLImpSpanContext_Impl accepts spans with absent/empty style names and applies no additional character-style hint. Preserve inherited inline properties, control content and hyperlinks through ODT import/export/reimport.
  Scope: "Only xmloff/source/text/txtparai.ts, txtpara.test.ts, new sw/source/filter/xml/odt-span-roundtrip.test.ts, runtime-inventory.json, source-provenance.json and task evidence. Absent/empty span style means no additional character-style delta. Preserve effective formatting, hyperlink metadata, nested styled children and supported whitespace/control/marker handling. Named-style fallback and global null-context policies remain separate audits. Registered save/open/recovery deviations excluded."
  Plan: "Skip character-style resolution for absent/empty span names, retaining effective inherited state. Add source-derived context and real ODT cycle assertions for plain/nested/styled/control/hyperlink cases, correct contradictory failure fixtures, update bounded provenance/inventory evidence, run mandatory checks, review and close leaf before resuming parent audit."
  Verify Steps: "1. Compare optional style hint, text delivery and child factory with pinned XMLImpSpanContext_Impl constructor/characters/createFastChildContext in txtparai.cxx. 2. Focused context assertions cover bare/empty-style and nested spans, inherited paragraph/character formatting, explicit child overrides and scope restoration, controls and active hyperlinks. Correct contradictory bare-span rejection fixtures while retaining other failure assertions. 3. Real literal ODT packages assert manual text/format/link results on import, export and reimport, including inherited paragraph and named character styles. 4. npm run verify, ap doctor, routing and diff checks pass; metadata evidence remains narrowly bounded without whole-module parity promotion."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-30T18:43:01.489Z — VERIFY — ok

    By: CODER

    Note: Optional span styles follow pinned no-hint behavior; six context and eight real ODT cases pass. Full verify 586/109/19, all required coverage 100%, semantic violations zero; doctor/routing/diff checks pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T18:43:01.136Z, excerpt_hash=sha256:79fa30a7bf1488997fcd3aef8f6aed328828c09bb44b1dcc95064c857f87719d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301823-RR9KXK/blueprint/resolved-snapshot.json
    - old_digest: 8a8b9a80aa238190420769bcddee0d0980e4c7e6765ffd9a199e8fbfbf19ca2a
    - current_digest: 8a8b9a80aa238190420769bcddee0d0980e4c7e6765ffd9a199e8fbfbf19ca2a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609301823-RR9KXK

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609301823-RR9KXK
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert task implementation commit if optional-style handling produces a verified regression; preserve unrelated completed parity corrections."
  Findings: "Command: node_modules/.bin/vitest run --root apps/office src/xmloff/source/text/txtpara.test.ts src/sw/source/filter/xml/odt-span-roundtrip.test.ts src/sw/source/filter/xml/odt-hyperlink-roundtrip.test.ts. Result: pass (3 files, 16 tests). Evidence: focused.log. Scope: six optional-span context cases and eight literal real ODT import/export/reimport cases with manual text/format/link expectations, inherited paragraph/character properties, nested explicit overrides, scope restoration, controls and empty leaves. Pinned XMLImpSpanContext_Impl constructor creates a hint only for nonempty names; characters and child factories remain active without hints. Command: npm run verify. Result: pass (exit 0). Evidence: verify.log, 586 app tests, 109 inventory tests, 19 browser tests; all required coverage 100%; formatting, lint, type, module/resource, static build, docs/size/source-tree/provenance/invariants/parity gates passed; semanticViolationCount 0. Initial full run failed required coverage because corrected bare-span fixtures no longer exercised the separate unknown named-style rejection branch; retained diagnostics in verify-before-coverage.log, added an explicit named Missing fixture and repeated the full gate successfully. No production/config/gate weakening. Commands: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass; doctor has only two preexisting hook-shim/historical close-hash warnings, no errors. Scope is unchanged; provenance/inventory evidence remains narrow and semantic status unverified. Unknown named-style fallback, full hint ownership/precedence, legacy fonts, generic null handler and other runtime/UI contracts remain open. Registered save/open/recovery deviations are untouched. Native XMLTextImportHelper::SetStyleAndAttrs in txtimp.cxx lines 1037-1070 clears unresolved style names rather than throwing; line 1258 applies any found automatic style property set independently. XMLParaContext hint application calls that helper for character styles. This source-backed unknown/empty named character-style resolution is the next separate correction."
id_source: "generated"
---
## Summary

Restore optional text span style contract

Child of C9TN6M. Native XMLImpSpanContext_Impl accepts spans with absent/empty style names and applies no additional character-style hint. Preserve inherited inline properties, control content and hyperlinks through ODT import/export/reimport.

## Scope

Only xmloff/source/text/txtparai.ts, txtpara.test.ts, new sw/source/filter/xml/odt-span-roundtrip.test.ts, runtime-inventory.json, source-provenance.json and task evidence. Absent/empty span style means no additional character-style delta. Preserve effective formatting, hyperlink metadata, nested styled children and supported whitespace/control/marker handling. Named-style fallback and global null-context policies remain separate audits. Registered save/open/recovery deviations excluded.

## Plan

Skip character-style resolution for absent/empty span names, retaining effective inherited state. Add source-derived context and real ODT cycle assertions for plain/nested/styled/control/hyperlink cases, correct contradictory failure fixtures, update bounded provenance/inventory evidence, run mandatory checks, review and close leaf before resuming parent audit.

## Verify Steps

1. Compare optional style hint, text delivery and child factory with pinned XMLImpSpanContext_Impl constructor/characters/createFastChildContext in txtparai.cxx. 2. Focused context assertions cover bare/empty-style and nested spans, inherited paragraph/character formatting, explicit child overrides and scope restoration, controls and active hyperlinks. Correct contradictory bare-span rejection fixtures while retaining other failure assertions. 3. Real literal ODT packages assert manual text/format/link results on import, export and reimport, including inherited paragraph and named character styles. 4. npm run verify, ap doctor, routing and diff checks pass; metadata evidence remains narrowly bounded without whole-module parity promotion.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-30T18:43:01.489Z — VERIFY — ok

By: CODER

Note: Optional span styles follow pinned no-hint behavior; six context and eight real ODT cases pass. Full verify 586/109/19, all required coverage 100%, semantic violations zero; doctor/routing/diff checks pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T18:43:01.136Z, excerpt_hash=sha256:79fa30a7bf1488997fcd3aef8f6aed328828c09bb44b1dcc95064c857f87719d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301823-RR9KXK/blueprint/resolved-snapshot.json
- old_digest: 8a8b9a80aa238190420769bcddee0d0980e4c7e6765ffd9a199e8fbfbf19ca2a
- current_digest: 8a8b9a80aa238190420769bcddee0d0980e4c7e6765ffd9a199e8fbfbf19ca2a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609301823-RR9KXK

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609301823-RR9KXK
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert task implementation commit if optional-style handling produces a verified regression; preserve unrelated completed parity corrections.

## Findings

Command: node_modules/.bin/vitest run --root apps/office src/xmloff/source/text/txtpara.test.ts src/sw/source/filter/xml/odt-span-roundtrip.test.ts src/sw/source/filter/xml/odt-hyperlink-roundtrip.test.ts. Result: pass (3 files, 16 tests). Evidence: focused.log. Scope: six optional-span context cases and eight literal real ODT import/export/reimport cases with manual text/format/link expectations, inherited paragraph/character properties, nested explicit overrides, scope restoration, controls and empty leaves. Pinned XMLImpSpanContext_Impl constructor creates a hint only for nonempty names; characters and child factories remain active without hints. Command: npm run verify. Result: pass (exit 0). Evidence: verify.log, 586 app tests, 109 inventory tests, 19 browser tests; all required coverage 100%; formatting, lint, type, module/resource, static build, docs/size/source-tree/provenance/invariants/parity gates passed; semanticViolationCount 0. Initial full run failed required coverage because corrected bare-span fixtures no longer exercised the separate unknown named-style rejection branch; retained diagnostics in verify-before-coverage.log, added an explicit named Missing fixture and repeated the full gate successfully. No production/config/gate weakening. Commands: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass; doctor has only two preexisting hook-shim/historical close-hash warnings, no errors. Scope is unchanged; provenance/inventory evidence remains narrow and semantic status unverified. Unknown named-style fallback, full hint ownership/precedence, legacy fonts, generic null handler and other runtime/UI contracts remain open. Registered save/open/recovery deviations are untouched. Native XMLTextImportHelper::SetStyleAndAttrs in txtimp.cxx lines 1037-1070 clears unresolved style names rather than throwing; line 1258 applies any found automatic style property set independently. XMLParaContext hint application calls that helper for character styles. This source-backed unknown/empty named character-style resolution is the next separate correction.

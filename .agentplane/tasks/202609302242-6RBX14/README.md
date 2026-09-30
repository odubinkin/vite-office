---
id: "202609302242-6RBX14"
title: "Restore native XML child fallback and unknown event dispatch"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 25
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "parity"
  - "xml"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T22:42:41.649Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-30T23:11:30.906Z"
  updated_by: "CODER"
  note: "Pinned child fallback/event protocol verified by 3 compiled traces /37 events, 70 focused tests and final 623 app /109 inventory /19 browser tests; both suites 100% coverage and all mandatory gates pass."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-30T23:12:05.139Z"
  updated_by: "EVALUATOR"
  note: "Pinned child-null reference and unknown event dispatch is corrected; all unchanged mandatory gates pass on the final code."
  evaluated_sha: "8edc4eb4a6e804b6f574670b14910564aec16ade"
  blueprint_digest: "a9f450b81f4afb6f428d4b7c5848f9188e20311d81d134197343a4a3a3717132"
  evidence_refs:
    - ".agentplane/tasks/202609302242-6RBX14/README.md"
    - ".agentplane/tasks/202609302242-6RBX14/quality/20260930-231205139-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609302242-6RBX14/quality/20260930-231205139-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609302242-6RBX14/quality/20260930-231205139-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609302242-6RBX14/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202609302242-6RBX14/native-traces.json"
    - ".agentplane/tasks/202609302242-6RBX14/verify.log"
    - "apps/office/src/xmloff/source/core/xmlimp.test.ts"
    - "scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts"
  findings:
    - "Known null now creates an inert native-shaped context, unknown null reuses its parent, and separate unknown hooks prevent premature known publication. Source-backed ODT assertions preserve supported descendants and ignored unrelated children. Explicit unsupported native feature guards retain honest admission for sections/list headers and cell lists/sections/nested tables."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Restore pinned child-null fallback and unknown event dispatch under the continuing parity goal."
events:
  -
    type: "status"
    at: "2026-09-30T22:42:42.162Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore pinned child-null fallback and unknown event dispatch under the continuing parity goal."
  -
    type: "verify"
    at: "2026-09-30T23:11:30.906Z"
    author: "CODER"
    state: "ok"
    note: "Pinned child fallback/event protocol verified by 3 compiled traces /37 events, 70 focused tests and final 623 app /109 inventory /19 browser tests; both suites 100% coverage and all mandatory gates pass."
doc_version: 3
doc_updated_at: "2026-09-30T23:11:30.962Z"
doc_updated_by: "CODER"
description: "Match pinned SvXMLImport known-null inert contexts, unknown-null parent reuse and separate unknown callbacks; remove list fallback adapters and verify affected ODT contracts without silently implementing unsupported families."
sections:
  Summary: "Restore pinned child fallback and event dispatch in the XML context stack."
  Scope: "Runtime core/xmlimp.ts and style/xmlnumi.ts; bounded explicit unsupported-feature guards in existing text/table contexts if needed to preserve native-supported but currently unimplemented capabilities. Tests: fastparser.test.ts, xmlnumi.test.ts, odt-list-declaration-defaults.test.ts, odt-roundtrip.test.ts, odt-property-roundtrip.test.ts, odt-table-roundtrip.test.ts, odt-embedded-fonts.test.ts, import diagnostics and new focused XML/ODT protocol fixtures. Runtime parity metadata and task-local differential evidence. No network/outside access, parser security/resource guard changes, policies, verification weakening, snapshot schemas or registered save/open/recovery changes."
  Plan: "Make the base context concrete and add distinct inert startUnknownElement/endUnknownElement hooks. Preserve root rejection as the existing import boundary pending separate severe-error lifecycle audit. Known child null creates a new inert base context; unknown child null reuses the actual parent and receives unknown callbacks, retaining context identity and publication timing. Retain structural diagnostics without document values. Remove obsolete list known-child ignore adapters in favor of native null results. Audit existing null callers and affected literal ODT expectations against primary sources, preserving explicit unsupported native feature errors. Compare representative event traces with unmodified extracted SvXMLImport dispatch bodies in a bounded C++ harness. Run focused fixtures plus the entire unchanged npm run verify and lifecycle/policy checks, then commit/quality/finish and keep parent active."
  Verify Steps: "Assert exact known/unknown start/end and character event order, new inert context identity versus reused parent, nested wrappers, sibling continuation, explicit unknown contexts, root rejection and thrown child factory errors. Compile extracted primary SvXMLImport child dispatch/end bodies with bounded dependency shims and compare manual event traces to local dispatch. Verify literal real ODT font/property/table/style/list unknown and unrelated known children, copy/snapshot/export/reopen where applicable; ensure unknown end callbacks do not prematurely publish owning list/URI/style contexts. Audit native-supported currently unsupported children and retain explicit errors. Run npm run verify unchanged with both 100% coverage suites and all browser/provenance gates; run ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. Record real implementation hash and final clean state."
  Verification: |-
    Command: npm run verify. Result: pass, exit 0 observed at terminal completion of session 69180. Evidence: 623 application tests /133 files; 109 inventory tests /36 files; 19 browser scenarios. Both coverage suites report 100% statements, branches, functions and lines. Format/lint/types/boundaries/resources/static/JSDoc/size/source-tree/provenance/invariants/parity pass; semanticViolationCount=0 proves metadata consistency only. Scope: final child-null dispatch and explicit unsupported-feature admission plus required regressions. Command: focused app protocol/context/ODT run. Result: pass, 70 tests /10 files; final full run covers the last cell-section guard. Command: python3 .agentplane/tasks/202609302242-6RBX14/native-dispatch.py; npx tsx .agentplane/tasks/202609302242-6RBX14/compare-native.mts. Result: pass, three traces /37 exact identity/event entries from unmodified extracted native dispatch and end bodies with bounded reference/namespace/error shims. Scope excludes root severe-error timing and namespace rewind. Command: targeted privacy inventory test. Result: pass; final full inventory has no skipped tests. Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass, zero doctor errors and same two known warnings. Final clean state and real implementation hash are recorded at closure and in parent progress.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-30T23:11:30.906Z — VERIFY — ok

    By: CODER

    Note: Pinned child fallback/event protocol verified by 3 compiled traces /37 events, 70 focused tests and final 623 app /109 inventory /19 browser tests; both suites 100% coverage and all mandatory gates pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T23:11:30.578Z, excerpt_hash=sha256:40bc400caf95c08d1c15a3773a9142bbcecbc6250852242c93dcf0031de8022a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609302242-6RBX14/blueprint/resolved-snapshot.json
    - old_digest: a9f450b81f4afb6f428d4b7c5848f9188e20311d81d134197343a4a3a3717132
    - current_digest: a9f450b81f4afb6f428d4b7c5848f9188e20311d81d134197343a4a3a3717132
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609302242-6RBX14

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609302242-6RBX14
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation commit after inspecting later XML corrections, preserving task evidence."
  Findings: |-
    Previous goal turn was progress: iteration24 child 202609302219-BJJJBT DONE, implementation 161c65ba40f143d4ea8c876afba674d3cc73be25, parent progress 73ab49c97a3b; current clean main/direct, only parent active, no live processes. Persistent user goal authorizes safe local corrections. Pinned libreoffice-26.8.0.2 /9bc445578031fecf56086729d8e4940c77e14d65: xmloff/source/core/xmlimp.cxx startFastElement creates an inert SvXMLImportContext for null children; startUnknownElement reuses maContexts.top() for null children and calls distinct unknown start/end hooks; xmlictxt.cxx base hooks are inert and factories null. Local known null throws, unknown null discards subtree in SvXMLIgnoreContext and delivers known callbacks for explicit unknown contexts. This contradicts native event/reference behavior and prior foreign subtree expectations. Cached XMLFontStylesContext/xmltabi/xmltbli sources confirm unrelated known children return null; no need to relax validators. Root severe-error timing, namespace rewind and complete import ownership remain separate unverified obligations.

    - Observation: Initial focused run passes 52 tests and fails five tests whose old expectations treated unrelated known children as fatal. Native font/tab/style/table sources return null or an inert context for these children.
      Impact: Source-backed acceptance fixtures must assert ignored descendants and unchanged owner state, while preserving errors for native-supported currently unimplemented cell lists/nested tables.
      Resolution: Replace the obsolete rejection expectations with concrete imported state assertions; retain root/semantic/cell feature errors and rerun focus then mandatory gates without criterion changes.

    - Observation: Second focus passes 56 tests and one row fixture still fails because it has no cells after its unrelated paragraph is skipped.
      Impact: The remaining failure is the pre-existing bounded row cardinality error, not child-context dispatch.
      Resolution: Give the fixture its declared cell and assert the unrelated paragraph is skipped; keep separate row cardinality rejection fixtures and add explicit unsupported cell/list-item feature checks.

    - Observation: A new synthetic child-error fixture used a lowercase generic message, which the existing SAX error boundary intentionally normalizes to ODF XML is malformed.
      Impact: This affects only the fixture message; native protocol behavior and existing parser error guards are unchanged.
      Resolution: Use the existing Unsupported ODF error convention in the synthetic explicit-feature test and rerun focused coverage.

    - Observation: The C++ harness initially mismatched optional namespace shim signatures. Separately, XMLTextListItemContext source proves a table child is unrelated and returns null, unlike native table-cell list/table children.
      Impact: Harness dependencies require correction without altering extracted dispatch. A speculative table-in-list error would preserve an incorrect rejection and must be removed.
      Resolution: Adjust only optional namespace shim types, remove the list-item guard and assert native ignore behavior; retain explicit cell list/table guards backed by XMLTextImportHelper.

    - Observation: Initial full verification stops at one missing JSDoc on the synthetic rejecting context. Diff review also finds a formatted one-line list-item guard survived the earlier multiline removal.
      Impact: Test documentation and removal of the contradicted guard are required before final validation; no runtime scope or acceptance drift.
      Resolution: Document the synthetic context, remove the exact remaining guard, keep the native ignore assertion, and rerun the entire mandatory verify command.

    - Observation: The broader app suite passes 622/623 tests; one text context test conflates unrelated children with native-supported unimplemented sections/list headers. Independent docs check reports six undocumented test callbacks.
      Impact: The text caller must preserve explicit sections/list-header capability errors while native unrelated span/list children should be ignored; callback documentation needs completion.
      Resolution: Audit native txtimp/txtparai/list context switches, add bounded explicit guards only for supported unimplemented features, update direct text assertions, document callbacks, and rerun mandatory verify unchanged. Matching txtparai.test.ts is included as the affected direct protocol fixture.

    - Observation: The next complete verify attempt exits 134 immediately: the child npm process aborts before format:check starts (Abort trap: 6). No check assertion or source error is reported; docs check just passed.
      Impact: A terminal process launch failure leaves the full verification unproven.
      Resolution: Preserve the terminal log and retry the exact mandatory command once without changing runtime, Node settings or verification thresholds.

    - Observation: Full app regression passes 623/623 and all four coverage categories at 100%. Inventory has two failures after changed context dispatch: a diagnostic fixture count and one additional inventory assertion require inspection.
      Impact: The final mandatory run remains unproven until native-backed metadata/fixture expectations reflect actual event semantics.
      Resolution: Inspect exact extra diagnostics and affected assertion against pinned sources; update only evidence-based expectations in matching inventory fixtures, preserving mandatory thresholds and runtime state checks.

    - Observation: The exact extra diagnostic is unknown-element style:header-footer-properties under styles.xml/automatic-styles/page-layout/header-style. The privacy failure fixture inserted a valid office:spreadsheet child under office:text, which native null fallback ignores.
      Impact: Old counts and the synthetic failure trigger encoded prior nonnative dispatch; neither indicates changed canonical Writer fixture state.
      Resolution: Record the exact extra structural event and count 92; assert the valid unrelated child imports, then use genuinely mismatched XML with PRIVATE text to preserve sanitized error coverage. Matching inventory ODT tests are evidence fixture corrections, not validator/threshold changes.

    - Observation: The revised malformed XML example throws at diagnoseOdtImport structural preflight before the import-error capture boundary; 108/109 inventory tests otherwise pass including the exact extra diagnostic.
      Impact: This test targets sanitized semantic import failures, not parser preflight failures, so malformed XML is the wrong trigger for the existing API contract.
      Resolution: Use well-formed XML containing the explicitly unsupported native section feature and private attribute value; verify sanitized import-error reporting in the targeted inventory test before the full rerun. Preserve diagnostic API and parser guards unchanged.

    - Observation: Full verification now passes (session 87609 exit 0). Final source admission audit confirms XMLTextImportHelper also supports sections in cells; the local table cell has no section implementation.
      Impact: The dispatch change must retain an explicit unsupported-feature error for cell sections instead of silently discarding native-supported content.
      Resolution: Add the section to the existing bounded cell feature guard and its literal fixture loop. Repeat final mandatory verification on this last runtime change; no feature implementation, policy or criteria drift.

    - Observation: Final native protocol uses new inert base contexts for known null children, actual parent reuse for unknown null children, separate unknown event hooks and source-ordered start-before-push. Native list ignore adapters are removed. Direct protocol and real ODT tests assert publication safety, supported descendants, ignored unrelated children and preserved model state.
      Impact: Previous generic rejection/subtree-discard behavior is corrected. Explicit errors retain supported-but-unimplemented body sections, list headers, and cell lists/sections/nested tables. The extra pinned header-footer diagnostic has exact path evidence; privacy errors remain sanitized.
      Resolution: All required gates pass with no threshold or policy changes and no registered save/open/recovery changes. Matching direct text and inventory fixtures were bounded evidence corrections. Root severe-error lifecycle, namespace rewind, full token coverage, remaining ignore adapters, broader numbered-marker/style/UNO contracts, layout and UI composition remain separately unverified; no full-module promotion. One process launch abort was terminal and resolved by retrying the exact command.
id_source: "generated"
---
## Summary

Restore pinned child fallback and event dispatch in the XML context stack.

## Scope

Runtime core/xmlimp.ts and style/xmlnumi.ts; bounded explicit unsupported-feature guards in existing text/table contexts if needed to preserve native-supported but currently unimplemented capabilities. Tests: fastparser.test.ts, xmlnumi.test.ts, odt-list-declaration-defaults.test.ts, odt-roundtrip.test.ts, odt-property-roundtrip.test.ts, odt-table-roundtrip.test.ts, odt-embedded-fonts.test.ts, import diagnostics and new focused XML/ODT protocol fixtures. Runtime parity metadata and task-local differential evidence. No network/outside access, parser security/resource guard changes, policies, verification weakening, snapshot schemas or registered save/open/recovery changes.

## Plan

Make the base context concrete and add distinct inert startUnknownElement/endUnknownElement hooks. Preserve root rejection as the existing import boundary pending separate severe-error lifecycle audit. Known child null creates a new inert base context; unknown child null reuses the actual parent and receives unknown callbacks, retaining context identity and publication timing. Retain structural diagnostics without document values. Remove obsolete list known-child ignore adapters in favor of native null results. Audit existing null callers and affected literal ODT expectations against primary sources, preserving explicit unsupported native feature errors. Compare representative event traces with unmodified extracted SvXMLImport dispatch bodies in a bounded C++ harness. Run focused fixtures plus the entire unchanged npm run verify and lifecycle/policy checks, then commit/quality/finish and keep parent active.

## Verify Steps

Assert exact known/unknown start/end and character event order, new inert context identity versus reused parent, nested wrappers, sibling continuation, explicit unknown contexts, root rejection and thrown child factory errors. Compile extracted primary SvXMLImport child dispatch/end bodies with bounded dependency shims and compare manual event traces to local dispatch. Verify literal real ODT font/property/table/style/list unknown and unrelated known children, copy/snapshot/export/reopen where applicable; ensure unknown end callbacks do not prematurely publish owning list/URI/style contexts. Audit native-supported currently unsupported children and retain explicit errors. Run npm run verify unchanged with both 100% coverage suites and all browser/provenance gates; run ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. Record real implementation hash and final clean state.

## Verification

Command: npm run verify. Result: pass, exit 0 observed at terminal completion of session 69180. Evidence: 623 application tests /133 files; 109 inventory tests /36 files; 19 browser scenarios. Both coverage suites report 100% statements, branches, functions and lines. Format/lint/types/boundaries/resources/static/JSDoc/size/source-tree/provenance/invariants/parity pass; semanticViolationCount=0 proves metadata consistency only. Scope: final child-null dispatch and explicit unsupported-feature admission plus required regressions. Command: focused app protocol/context/ODT run. Result: pass, 70 tests /10 files; final full run covers the last cell-section guard. Command: python3 .agentplane/tasks/202609302242-6RBX14/native-dispatch.py; npx tsx .agentplane/tasks/202609302242-6RBX14/compare-native.mts. Result: pass, three traces /37 exact identity/event entries from unmodified extracted native dispatch and end bodies with bounded reference/namespace/error shims. Scope excludes root severe-error timing and namespace rewind. Command: targeted privacy inventory test. Result: pass; final full inventory has no skipped tests. Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass, zero doctor errors and same two known warnings. Final clean state and real implementation hash are recorded at closure and in parent progress.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-30T23:11:30.906Z — VERIFY — ok

By: CODER

Note: Pinned child fallback/event protocol verified by 3 compiled traces /37 events, 70 focused tests and final 623 app /109 inventory /19 browser tests; both suites 100% coverage and all mandatory gates pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T23:11:30.578Z, excerpt_hash=sha256:40bc400caf95c08d1c15a3773a9142bbcecbc6250852242c93dcf0031de8022a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609302242-6RBX14/blueprint/resolved-snapshot.json
- old_digest: a9f450b81f4afb6f428d4b7c5848f9188e20311d81d134197343a4a3a3717132
- current_digest: a9f450b81f4afb6f428d4b7c5848f9188e20311d81d134197343a4a3a3717132
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609302242-6RBX14

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609302242-6RBX14
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation commit after inspecting later XML corrections, preserving task evidence.

## Findings

Previous goal turn was progress: iteration24 child 202609302219-BJJJBT DONE, implementation 161c65ba40f143d4ea8c876afba674d3cc73be25, parent progress 73ab49c97a3b; current clean main/direct, only parent active, no live processes. Persistent user goal authorizes safe local corrections. Pinned libreoffice-26.8.0.2 /9bc445578031fecf56086729d8e4940c77e14d65: xmloff/source/core/xmlimp.cxx startFastElement creates an inert SvXMLImportContext for null children; startUnknownElement reuses maContexts.top() for null children and calls distinct unknown start/end hooks; xmlictxt.cxx base hooks are inert and factories null. Local known null throws, unknown null discards subtree in SvXMLIgnoreContext and delivers known callbacks for explicit unknown contexts. This contradicts native event/reference behavior and prior foreign subtree expectations. Cached XMLFontStylesContext/xmltabi/xmltbli sources confirm unrelated known children return null; no need to relax validators. Root severe-error timing, namespace rewind and complete import ownership remain separate unverified obligations.

- Observation: Initial focused run passes 52 tests and fails five tests whose old expectations treated unrelated known children as fatal. Native font/tab/style/table sources return null or an inert context for these children.
  Impact: Source-backed acceptance fixtures must assert ignored descendants and unchanged owner state, while preserving errors for native-supported currently unimplemented cell lists/nested tables.
  Resolution: Replace the obsolete rejection expectations with concrete imported state assertions; retain root/semantic/cell feature errors and rerun focus then mandatory gates without criterion changes.

- Observation: Second focus passes 56 tests and one row fixture still fails because it has no cells after its unrelated paragraph is skipped.
  Impact: The remaining failure is the pre-existing bounded row cardinality error, not child-context dispatch.
  Resolution: Give the fixture its declared cell and assert the unrelated paragraph is skipped; keep separate row cardinality rejection fixtures and add explicit unsupported cell/list-item feature checks.

- Observation: A new synthetic child-error fixture used a lowercase generic message, which the existing SAX error boundary intentionally normalizes to ODF XML is malformed.
  Impact: This affects only the fixture message; native protocol behavior and existing parser error guards are unchanged.
  Resolution: Use the existing Unsupported ODF error convention in the synthetic explicit-feature test and rerun focused coverage.

- Observation: The C++ harness initially mismatched optional namespace shim signatures. Separately, XMLTextListItemContext source proves a table child is unrelated and returns null, unlike native table-cell list/table children.
  Impact: Harness dependencies require correction without altering extracted dispatch. A speculative table-in-list error would preserve an incorrect rejection and must be removed.
  Resolution: Adjust only optional namespace shim types, remove the list-item guard and assert native ignore behavior; retain explicit cell list/table guards backed by XMLTextImportHelper.

- Observation: Initial full verification stops at one missing JSDoc on the synthetic rejecting context. Diff review also finds a formatted one-line list-item guard survived the earlier multiline removal.
  Impact: Test documentation and removal of the contradicted guard are required before final validation; no runtime scope or acceptance drift.
  Resolution: Document the synthetic context, remove the exact remaining guard, keep the native ignore assertion, and rerun the entire mandatory verify command.

- Observation: The broader app suite passes 622/623 tests; one text context test conflates unrelated children with native-supported unimplemented sections/list headers. Independent docs check reports six undocumented test callbacks.
  Impact: The text caller must preserve explicit sections/list-header capability errors while native unrelated span/list children should be ignored; callback documentation needs completion.
  Resolution: Audit native txtimp/txtparai/list context switches, add bounded explicit guards only for supported unimplemented features, update direct text assertions, document callbacks, and rerun mandatory verify unchanged. Matching txtparai.test.ts is included as the affected direct protocol fixture.

- Observation: The next complete verify attempt exits 134 immediately: the child npm process aborts before format:check starts (Abort trap: 6). No check assertion or source error is reported; docs check just passed.
  Impact: A terminal process launch failure leaves the full verification unproven.
  Resolution: Preserve the terminal log and retry the exact mandatory command once without changing runtime, Node settings or verification thresholds.

- Observation: Full app regression passes 623/623 and all four coverage categories at 100%. Inventory has two failures after changed context dispatch: a diagnostic fixture count and one additional inventory assertion require inspection.
  Impact: The final mandatory run remains unproven until native-backed metadata/fixture expectations reflect actual event semantics.
  Resolution: Inspect exact extra diagnostics and affected assertion against pinned sources; update only evidence-based expectations in matching inventory fixtures, preserving mandatory thresholds and runtime state checks.

- Observation: The exact extra diagnostic is unknown-element style:header-footer-properties under styles.xml/automatic-styles/page-layout/header-style. The privacy failure fixture inserted a valid office:spreadsheet child under office:text, which native null fallback ignores.
  Impact: Old counts and the synthetic failure trigger encoded prior nonnative dispatch; neither indicates changed canonical Writer fixture state.
  Resolution: Record the exact extra structural event and count 92; assert the valid unrelated child imports, then use genuinely mismatched XML with PRIVATE text to preserve sanitized error coverage. Matching inventory ODT tests are evidence fixture corrections, not validator/threshold changes.

- Observation: The revised malformed XML example throws at diagnoseOdtImport structural preflight before the import-error capture boundary; 108/109 inventory tests otherwise pass including the exact extra diagnostic.
  Impact: This test targets sanitized semantic import failures, not parser preflight failures, so malformed XML is the wrong trigger for the existing API contract.
  Resolution: Use well-formed XML containing the explicitly unsupported native section feature and private attribute value; verify sanitized import-error reporting in the targeted inventory test before the full rerun. Preserve diagnostic API and parser guards unchanged.

- Observation: Full verification now passes (session 87609 exit 0). Final source admission audit confirms XMLTextImportHelper also supports sections in cells; the local table cell has no section implementation.
  Impact: The dispatch change must retain an explicit unsupported-feature error for cell sections instead of silently discarding native-supported content.
  Resolution: Add the section to the existing bounded cell feature guard and its literal fixture loop. Repeat final mandatory verification on this last runtime change; no feature implementation, policy or criteria drift.

- Observation: Final native protocol uses new inert base contexts for known null children, actual parent reuse for unknown null children, separate unknown event hooks and source-ordered start-before-push. Native list ignore adapters are removed. Direct protocol and real ODT tests assert publication safety, supported descendants, ignored unrelated children and preserved model state.
  Impact: Previous generic rejection/subtree-discard behavior is corrected. Explicit errors retain supported-but-unimplemented body sections, list headers, and cell lists/sections/nested tables. The extra pinned header-footer diagnostic has exact path evidence; privacy errors remain sanitized.
  Resolution: All required gates pass with no threshold or policy changes and no registered save/open/recovery changes. Matching direct text and inventory fixtures were bounded evidence corrections. Root severe-error lifecycle, namespace rewind, full token coverage, remaining ignore adapters, broader numbered-marker/style/UNO contracts, layout and UI composition remain separately unverified; no full-module promotion. One process launch abort was terminal and resolved by retrying the exact command.

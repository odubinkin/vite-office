---
id: "202609302242-6RBX14"
title: "Restore native XML child fallback and unknown event dispatch"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 16
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
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
doc_version: 3
doc_updated_at: "2026-09-30T22:55:54.202Z"
doc_updated_by: "CODER"
description: "Match pinned SvXMLImport known-null inert contexts, unknown-null parent reuse and separate unknown callbacks; remove list fallback adapters and verify affected ODT contracts without silently implementing unsupported families."
sections:
  Summary: "Restore pinned child fallback and event dispatch in the XML context stack."
  Scope: "Runtime core/xmlimp.ts and style/xmlnumi.ts; bounded explicit unsupported-feature guards in existing text/table contexts if needed to preserve native-supported but currently unimplemented capabilities. Tests: fastparser.test.ts, xmlnumi.test.ts, odt-list-declaration-defaults.test.ts, odt-roundtrip.test.ts, odt-property-roundtrip.test.ts, odt-table-roundtrip.test.ts, odt-embedded-fonts.test.ts, import diagnostics and new focused XML/ODT protocol fixtures. Runtime parity metadata and task-local differential evidence. No network/outside access, parser security/resource guard changes, policies, verification weakening, snapshot schemas or registered save/open/recovery changes."
  Plan: "Make the base context concrete and add distinct inert startUnknownElement/endUnknownElement hooks. Preserve root rejection as the existing import boundary pending separate severe-error lifecycle audit. Known child null creates a new inert base context; unknown child null reuses the actual parent and receives unknown callbacks, retaining context identity and publication timing. Retain structural diagnostics without document values. Remove obsolete list known-child ignore adapters in favor of native null results. Audit existing null callers and affected literal ODT expectations against primary sources, preserving explicit unsupported native feature errors. Compare representative event traces with unmodified extracted SvXMLImport dispatch bodies in a bounded C++ harness. Run focused fixtures plus the entire unchanged npm run verify and lifecycle/policy checks, then commit/quality/finish and keep parent active."
  Verify Steps: "Assert exact known/unknown start/end and character event order, new inert context identity versus reused parent, nested wrappers, sibling continuation, explicit unknown contexts, root rejection and thrown child factory errors. Compile extracted primary SvXMLImport child dispatch/end bodies with bounded dependency shims and compare manual event traces to local dispatch. Verify literal real ODT font/property/table/style/list unknown and unrelated known children, copy/snapshot/export/reopen where applicable; ensure unknown end callbacks do not prematurely publish owning list/URI/style contexts. Audit native-supported currently unsupported children and retain explicit errors. Run npm run verify unchanged with both 100% coverage suites and all browser/provenance gates; run ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. Record real implementation hash and final clean state."
  Verification: "Pending."
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

Pending.

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

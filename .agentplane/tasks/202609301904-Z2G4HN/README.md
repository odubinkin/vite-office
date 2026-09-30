---
id: "202609301904-Z2G4HN"
title: "Restore family-scoped text style identity"
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
  updated_at: "2026-09-30T19:10:02.736Z"
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
    body: "Start: restore family-plus-name style storage and lookup, verified by direct context and literal real ODT inheritance and built-in cases."
events:
  -
    type: "status"
    at: "2026-09-30T19:05:18.595Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore family-plus-name style storage and lookup, verified by direct context and literal real ODT inheritance and built-in cases."
doc_version: 3
doc_updated_at: "2026-09-30T19:10:02.271Z"
doc_updated_by: "CODER"
description: "Child of C9TN6M. Pinned style indexes and text application identify styles by family plus name. Separate paragraph/text registration and require family-specific resolution, preserving same-name definitions and built-in paragraph lookup through real ODT cycles."
sections:
  Summary: |-
    Restore family-scoped text style identity

    Child of C9TN6M. Pinned style indexes and text application identify styles by family plus name. Separate paragraph/text registration and require family-specific resolution, preserving same-name definitions and built-in paragraph lookup through real ODT cycles.
  Scope: "Only xmloff/source/text/txtparai.ts, txtpara.test.ts and new txtparai.test.ts, sw/source/filter/xml/xmlimp.ts, new sw/source/filter/xml/odt-style-family-roundtrip.test.ts, runtime-inventory.json, source-provenance.json and task artifacts. Require explicit implemented paragraph/text family lookup, store definitions independently by family and pass only paragraph definitions to named Writer paragraph application. Split the existing combined test module into import/export suites to obey mandatory file-size policy with unchanged assertions. Same-family duplicate rejection, common/automatic separation, display-name identity, cycle/default policies and generic null context contracts remain individual follow-ups. Registered save/open/recovery deviations excluded."
  Plan: "Replace name-only style storage with separate family maps and require the native family-first lookup argument at all consumers. Verify same-name family isolation in contexts and literal real ODT cycles. Preserve all existing import assertions while moving their helper and describe suite unchanged to txtparai.test.ts, leaving export tests in txtpara.test.ts; this necessary test decomposition stays within the user-authorized refactoring goal and mandatory size check. Update moved evidence paths and bounded provenance, run full gates, review and close."
  Verify Steps: "1. Compare pinned StyleIndexCompareByName/FindStyleChildContext family-plus-name identity and SetStyleAndAttrs family-specific lookup. 2. Source-derived context tests cover same-name paragraph/text direct and inherited definitions, reverse insertion order, built-in Standard/Heading identity and family-isolated wrong-family parent references. 3. Literal real ODT named/automatic styles assert same-name family coexistence, own and parent property selection, built-in paragraph state and span overrides/scope through import/export/reimport; retain same-family duplicate rejection assertions. 4. Focused context/family/ODT tests, npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check pass. Inventory/provenance evidence remains narrowly bounded with broader semantic statuses unverified."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commit if family-specific storage or lookup causes a verified regression; preserve earlier completed parity changes."
  Findings: ""
id_source: "generated"
---
## Summary

Restore family-scoped text style identity

Child of C9TN6M. Pinned style indexes and text application identify styles by family plus name. Separate paragraph/text registration and require family-specific resolution, preserving same-name definitions and built-in paragraph lookup through real ODT cycles.

## Scope

Only xmloff/source/text/txtparai.ts, txtpara.test.ts and new txtparai.test.ts, sw/source/filter/xml/xmlimp.ts, new sw/source/filter/xml/odt-style-family-roundtrip.test.ts, runtime-inventory.json, source-provenance.json and task artifacts. Require explicit implemented paragraph/text family lookup, store definitions independently by family and pass only paragraph definitions to named Writer paragraph application. Split the existing combined test module into import/export suites to obey mandatory file-size policy with unchanged assertions. Same-family duplicate rejection, common/automatic separation, display-name identity, cycle/default policies and generic null context contracts remain individual follow-ups. Registered save/open/recovery deviations excluded.

## Plan

Replace name-only style storage with separate family maps and require the native family-first lookup argument at all consumers. Verify same-name family isolation in contexts and literal real ODT cycles. Preserve all existing import assertions while moving their helper and describe suite unchanged to txtparai.test.ts, leaving export tests in txtpara.test.ts; this necessary test decomposition stays within the user-authorized refactoring goal and mandatory size check. Update moved evidence paths and bounded provenance, run full gates, review and close.

## Verify Steps

1. Compare pinned StyleIndexCompareByName/FindStyleChildContext family-plus-name identity and SetStyleAndAttrs family-specific lookup. 2. Source-derived context tests cover same-name paragraph/text direct and inherited definitions, reverse insertion order, built-in Standard/Heading identity and family-isolated wrong-family parent references. 3. Literal real ODT named/automatic styles assert same-name family coexistence, own and parent property selection, built-in paragraph state and span overrides/scope through import/export/reimport; retain same-family duplicate rejection assertions. 4. Focused context/family/ODT tests, npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check pass. Inventory/provenance evidence remains narrowly bounded with broader semantic statuses unverified.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commit if family-specific storage or lookup causes a verified regression; preserve earlier completed parity changes.

## Findings

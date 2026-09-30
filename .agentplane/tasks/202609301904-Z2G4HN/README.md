---
id: "202609301904-Z2G4HN"
title: "Restore family-scoped text style identity"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
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
doc_updated_at: "2026-09-30T19:18:19.310Z"
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
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commit if family-specific storage or lookup causes a verified regression; preserve earlier completed parity changes."
  Findings: ""
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
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commit if family-specific storage or lookup causes a verified regression; preserve earlier completed parity changes.

## Findings

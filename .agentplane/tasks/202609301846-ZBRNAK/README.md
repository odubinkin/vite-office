---
id: "202609301846-ZBRNAK"
title: "Restore unresolved character style import fallback"
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
  updated_at: "2026-09-30T18:47:10.296Z"
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
    body: "Start: restore family-specific missing character-style fallback and preserve found properties, verified with context and real ODT cases."
events:
  -
    type: "status"
    at: "2026-09-30T18:47:10.790Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore family-specific missing character-style fallback and preserve found properties, verified with context and real ODT cases."
doc_version: 3
doc_updated_at: "2026-09-30T18:47:10.790Z"
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
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation commit if source-backed no-op lookup behavior produces a verified regression; retain previous completed corrections."
  Findings: ""
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
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation commit if source-backed no-op lookup behavior produces a verified regression; retain previous completed corrections.

## Findings

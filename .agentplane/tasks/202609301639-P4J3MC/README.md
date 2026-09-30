---
id: "202609301639-P4J3MC"
title: "Preserve signed tab-stop positions and default distances"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T16:40:10.337Z"
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
    body: "Start: align direct tab position/default-distance signed domains and XML negative tab import with pinned sources; preserve all deliberate browser policies."
events:
  -
    type: "status"
    at: "2026-09-30T16:40:11.001Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align direct tab position/default-distance signed domains and XML negative tab import with pinned sources; preserve all deliberate browser policies."
doc_version: 3
doc_updated_at: "2026-09-30T16:40:11.001Z"
doc_updated_by: "CODER"
description: "One source-backed correction under the approved iterative parity audit: preserve signed sal_Int32 tab positions and direct SetDefaultDistance values, and import negative ODF tab lengths without changing UNO PutValue restrictions or deliberate browser product policies."
sections:
  Summary: |-
    Preserve signed tab-stop positions and default distances

    One source-backed correction under the approved iterative parity audit: preserve signed sal_Int32 tab positions and direct SetDefaultDistance values, and import negative ODF tab lengths without changing UNO PutValue restrictions or deliberate browser product policies.
  Scope: "apps/office/src/editeng/source/items/paraitem.ts and paraitem.test.ts; apps/office/src/xmloff/source/text/XMLTextPropertySetContext.ts; apps/office/src/sw/source/filter/xml/odt-property-roundtrip.test.ts; docs/program/parity/runtime-inventory.json and docs/program/source-provenance.json; canonical task artifacts. Bounded signed sal_Int32 position/direct default-distance domain and negative ODF tab positions. Preserve generated-stop spacing constructor unsigned domain, unsupported native APIs, deliberate browser save/open/recovery decisions, validators/schemas/generators and unrelated UI behavior."
  Plan: "CODER performs one signed tab-value correction. Align SvxTabStop position bounds and direct SvxTabStopItem.SetDefaultDistance with sal_Int32 from the pinned constructors/setter; do not apply the separate UNO PutValue negative-distance rejection to direct setter storage. Keep generated count/distance constructor domains unchanged. Allow signed style:position measures at XMLTextPropertySetContext tab import. Add bounded unit regression tests for boundaries, signed ordered replacement, clone/record/Writer item-codec restoration and negative-position ODT round trips. Update only the relevant runtime inventory/provenance evidence with honest unverified module status. Run focused tests, full npm run verify, doctor/routing, then record verification, implementation commit, quality review and close. Work stays local in the current direct checkout; no network, unsupported APIs, validation/schema changes or registered conscious product deviations."
  Verify Steps: "1. Compare pinned tstpitem.hxx/paraitem.cxx and xmltabi.cxx/xmluconv.hxx: SvxTabStop position and direct SetDefaultDistance preserve signed int32; XML tab position accepts negative measures. 2. Focused paraitem/ODT tests prove int32 endpoints, invalid fractional/nonfinite/out-of-domain rejection, signed ordering/replacement, GetPos, independent clone, snapshot and real Writer pool item-codec restoration, negative ODT tab import/export/reimport with alignment/leader preservation, and unchanged nonnegative unsigned constructor spacing. 3. npm run verify passes every required gate at 100% coverage; ap doctor and node .agentplane/policy/check-routing.mjs pass. 4. Source metadata records bounded evidence without whole-module promotion; review scoped diff and finish with clean tracked/untracked git status."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Preserve signed tab-stop positions and default distances

One source-backed correction under the approved iterative parity audit: preserve signed sal_Int32 tab positions and direct SetDefaultDistance values, and import negative ODF tab lengths without changing UNO PutValue restrictions or deliberate browser product policies.

## Scope

apps/office/src/editeng/source/items/paraitem.ts and paraitem.test.ts; apps/office/src/xmloff/source/text/XMLTextPropertySetContext.ts; apps/office/src/sw/source/filter/xml/odt-property-roundtrip.test.ts; docs/program/parity/runtime-inventory.json and docs/program/source-provenance.json; canonical task artifacts. Bounded signed sal_Int32 position/direct default-distance domain and negative ODF tab positions. Preserve generated-stop spacing constructor unsigned domain, unsupported native APIs, deliberate browser save/open/recovery decisions, validators/schemas/generators and unrelated UI behavior.

## Plan

CODER performs one signed tab-value correction. Align SvxTabStop position bounds and direct SvxTabStopItem.SetDefaultDistance with sal_Int32 from the pinned constructors/setter; do not apply the separate UNO PutValue negative-distance rejection to direct setter storage. Keep generated count/distance constructor domains unchanged. Allow signed style:position measures at XMLTextPropertySetContext tab import. Add bounded unit regression tests for boundaries, signed ordered replacement, clone/record/Writer item-codec restoration and negative-position ODT round trips. Update only the relevant runtime inventory/provenance evidence with honest unverified module status. Run focused tests, full npm run verify, doctor/routing, then record verification, implementation commit, quality review and close. Work stays local in the current direct checkout; no network, unsupported APIs, validation/schema changes or registered conscious product deviations.

## Verify Steps

1. Compare pinned tstpitem.hxx/paraitem.cxx and xmltabi.cxx/xmluconv.hxx: SvxTabStop position and direct SetDefaultDistance preserve signed int32; XML tab position accepts negative measures. 2. Focused paraitem/ODT tests prove int32 endpoints, invalid fractional/nonfinite/out-of-domain rejection, signed ordering/replacement, GetPos, independent clone, snapshot and real Writer pool item-codec restoration, negative ODT tab import/export/reimport with alignment/leader preservation, and unchanged nonnegative unsigned constructor spacing. 3. npm run verify passes every required gate at 100% coverage; ap doctor and node .agentplane/policy/check-routing.mjs pass. 4. Source metadata records bounded evidence without whole-module promotion; review scoped diff and finish with clean tracked/untracked git status.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

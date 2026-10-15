---
id: "202610150501-FNSEP3"
title: "Restore canonical XML border handler ownership before Calc attribute containers"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T05:08:08.785Z"
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
    body: "Start: correct the real XML attribute-container prerequisite by restoring shared UNO handler vs Writer item mapping ownership. Remove reverse edge, migrate all users, preserve algorithms and reject cycle exceptions."
events:
  -
    type: "status"
    at: "2026-10-15T05:09:18.747Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: correct the real XML attribute-container prerequisite by restoring shared UNO handler vs Writer item mapping ownership. Remove reverse edge, migrate all users, preserve algorithms and reject cycle exceptions."
doc_version: 3
doc_updated_at: "2026-10-15T05:09:18.747Z"
doc_updated_by: "CODER"
description: "Task143 resolves the real prerequisite discovered before XML attribute value implementation: xmloff border handlers wrongly import Editeng items through Writer browser mapping helpers. Move item mapping to native Writer xmlimpit/xmlexpit responsibility boundaries, keep shared handlers on published UNO types, remove reverse dependency and migrate actual consumers without compatibility reexports. Do not add a cycle exception or change border algorithms. Attribute collection/item implementation follows after this canonical boundary correction."
sections:
  Summary: "Task143 removes the actual reversed dependency blocking canonical XML attribute containers: existing xmloff border code mixes native published UNO handlers with Writer item/presentation adapters. User authorizes correcting shared/Writer modules canonically; native ItemInfo and namespace maps are ready. This prerequisite precedes XML attribute value classes and does not redefine the overall UI/ODS goal."
  Scope: "At most45intentional source/doc/inventory paths: shared xmloff bordrhdl and published BorderLineStyle reuse; actual existing item import/export/shorthand helpers move to Writer xmlimpit.ts/xmlexpit.ts source responsibility boundaries without algorithm changes; migrate all production/test consumers, no compatibility reexports from xmloff. Tighten module ownership by removing xmloff-to-editeng allowlist entry and update precise boundary tests; do not add cycle exceptions, weaken cycle checks or port runtime memory mechanisms. Matching runtime/provenance/capability and calc-core documentation. All behavior and deliberate I/O/recovery choices retained; no full native UNO mapper/Any property pipeline or XML attribute classes are fabricated."
  Plan: "Correct the actual namespace-container prerequisite by moving Writer-specific border item adapters out of shared xmloff to native Writer filter counterparts, reuse published BorderLineStyle, migrate every consumer without compatibility reexports and remove reversed edge. No cycle exception or border algorithm changes. Bound45paths, strict whole shared/Calc raw100, related Writer tests/browser flows, portable build/source gates/helper equivalence/pins/hashes/clean calc."
  Verify Steps: "No production xmloff-to-editeng import remains; shared border handlers use actual published BorderLine2/BorderLineStyle. Native border parsing/emission/presentation values and all existing border/page/cell/Writer history behavior remain unchanged. Import/export/shorthand helper implementations retained verbatim except responsibility imports and shared token-helper binding; all real consumers move, no old-path forwarding/compatibility aliases. Module matrix rejects xmloff-to-editeng, permits existing published offapi edge, leaves SAL/o3tl and every cycle-rejection algorithm unchanged; boundary tests enforce the direction. Entire changed shared executable owner and whole Calc every raw S/B/F/L counter positive100; relevant Writer XML/core/component tests, changed Writer owner coverage-only gaps measured/left.4reference links absent/restored finally during portable tests/build/browser flows. Scoped prettier/eslint, typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff/boundaries; production build and relevant existing Writer border browser scenarios. Audit exact45paths/native reference pins/source hashes, helper-body equivalence/complete consumer migration and clean calc. Full suite stays human-gated to actual minimum connected UI+same-model ODS readiness, then repair/pause."
  Verification: "Pending execution."
  Rollback Plan: "Revert only intentional task changes through a later authorized task; no reset, merge or publication."
  Findings: "Initial exploration suggested an import-cycle exception for the original editeng XML item dependency, but actual source evidence rejects that workaround: native editeng links xo, while native xmloff bordrhdl uses published UNO structs rather than Editeng objects. Existing reverse import is a misplaced Writer adapter. Correct the ownership instead of creating a cycle exception. Native Writer xmlimpit/xmlexpit handle item-property mapping; current browser-shaped adapter behavior remains bounded/unverified rather than falsely declared a full native mapper. Same-agent evaluation is not independent."
id_source: "generated"
---
## Summary

Task143 removes the actual reversed dependency blocking canonical XML attribute containers: existing xmloff border code mixes native published UNO handlers with Writer item/presentation adapters. User authorizes correcting shared/Writer modules canonically; native ItemInfo and namespace maps are ready. This prerequisite precedes XML attribute value classes and does not redefine the overall UI/ODS goal.

## Scope

At most45intentional source/doc/inventory paths: shared xmloff bordrhdl and published BorderLineStyle reuse; actual existing item import/export/shorthand helpers move to Writer xmlimpit.ts/xmlexpit.ts source responsibility boundaries without algorithm changes; migrate all production/test consumers, no compatibility reexports from xmloff. Tighten module ownership by removing xmloff-to-editeng allowlist entry and update precise boundary tests; do not add cycle exceptions, weaken cycle checks or port runtime memory mechanisms. Matching runtime/provenance/capability and calc-core documentation. All behavior and deliberate I/O/recovery choices retained; no full native UNO mapper/Any property pipeline or XML attribute classes are fabricated.

## Plan

Correct the actual namespace-container prerequisite by moving Writer-specific border item adapters out of shared xmloff to native Writer filter counterparts, reuse published BorderLineStyle, migrate every consumer without compatibility reexports and remove reversed edge. No cycle exception or border algorithm changes. Bound45paths, strict whole shared/Calc raw100, related Writer tests/browser flows, portable build/source gates/helper equivalence/pins/hashes/clean calc.

## Verify Steps

No production xmloff-to-editeng import remains; shared border handlers use actual published BorderLine2/BorderLineStyle. Native border parsing/emission/presentation values and all existing border/page/cell/Writer history behavior remain unchanged. Import/export/shorthand helper implementations retained verbatim except responsibility imports and shared token-helper binding; all real consumers move, no old-path forwarding/compatibility aliases. Module matrix rejects xmloff-to-editeng, permits existing published offapi edge, leaves SAL/o3tl and every cycle-rejection algorithm unchanged; boundary tests enforce the direction. Entire changed shared executable owner and whole Calc every raw S/B/F/L counter positive100; relevant Writer XML/core/component tests, changed Writer owner coverage-only gaps measured/left.4reference links absent/restored finally during portable tests/build/browser flows. Scoped prettier/eslint, typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff/boundaries; production build and relevant existing Writer border browser scenarios. Audit exact45paths/native reference pins/source hashes, helper-body equivalence/complete consumer migration and clean calc. Full suite stays human-gated to actual minimum connected UI+same-model ODS readiness, then repair/pause.

## Verification

Pending execution.

## Rollback Plan

Revert only intentional task changes through a later authorized task; no reset, merge or publication.

## Findings

Initial exploration suggested an import-cycle exception for the original editeng XML item dependency, but actual source evidence rejects that workaround: native editeng links xo, while native xmloff bordrhdl uses published UNO structs rather than Editeng objects. Existing reverse import is a misplaced Writer adapter. Correct the ownership instead of creating a cycle exception. Native Writer xmlimpit/xmlexpit handle item-property mapping; current browser-shaped adapter behavior remains bounded/unverified rather than falsely declared a full native mapper. Same-agent evaluation is not independent.

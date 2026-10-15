---
id: "202610150501-FNSEP3"
title: "Restore canonical XML border handler ownership before Calc attribute containers"
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
doc_updated_at: "2026-10-15T05:25:18.475Z"
doc_updated_by: "CODER"
description: "Task143 resolves the real prerequisite discovered before XML attribute value implementation: xmloff border handlers wrongly import Editeng items through Writer browser mapping helpers. Move item mapping to native Writer xmlimpit/xmlexpit responsibility boundaries, keep shared handlers on published UNO types, remove reverse dependency and migrate actual consumers without compatibility reexports. Do not add a cycle exception or change border algorithms. Attribute collection/item implementation follows after this canonical boundary correction."
sections:
  Summary: "Task143 removes the actual reversed dependency blocking canonical XML attribute containers: existing xmloff border code mixes native published UNO handlers with Writer item/presentation adapters. User authorizes correcting shared/Writer modules canonically; native ItemInfo and namespace maps are ready. This prerequisite precedes XML attribute value classes and does not redefine the overall UI/ODS goal."
  Scope: "At most45intentional source/doc/inventory paths: shared xmloff bordrhdl and published BorderLineStyle reuse; actual existing item import/export/shorthand helpers move to Writer xmlimpit.ts/xmlexpit.ts source responsibility boundaries without algorithm changes; migrate all production/test consumers, no compatibility reexports from xmloff. Tighten module ownership by removing xmloff-to-editeng allowlist entry and update precise boundary tests; do not add cycle exceptions, weaken cycle checks or port runtime memory mechanisms. Matching runtime/provenance/capability and calc-core documentation. All behavior and deliberate I/O/recovery choices retained; no full native UNO mapper/Any property pipeline or XML attribute classes are fabricated."
  Plan: "Correct the actual namespace-container prerequisite by moving Writer-specific border item adapters out of shared xmloff to native Writer filter counterparts, reuse published BorderLineStyle, migrate every consumer without compatibility reexports and remove reversed edge. No cycle exception or border algorithm changes. Bound45paths, strict whole shared/Calc raw100, related Writer tests/browser flows, portable build/source gates/helper equivalence/pins/hashes/clean calc."
  Verify Steps: "No production xmloff-to-editeng import remains; shared border handlers use actual published BorderLine2/BorderLineStyle. Native border parsing/emission/presentation values and all existing border/page/cell/Writer history behavior remain unchanged. Import/export/shorthand helper implementations retained verbatim except responsibility imports and shared token-helper binding; all real consumers move, no old-path forwarding/compatibility aliases. Module matrix rejects xmloff-to-editeng, permits existing published offapi edge, leaves SAL/o3tl and every cycle-rejection algorithm unchanged; boundary tests enforce the direction. Entire changed shared executable owner and whole Calc every raw S/B/F/L counter positive100; relevant Writer XML/core/component tests, changed Writer owner coverage-only gaps measured/left.4reference links absent/restored finally during portable tests/build/browser flows. Scoped prettier/eslint, typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff/boundaries; production build and relevant existing Writer border browser scenarios. Audit exact45paths/native reference pins/source hashes, helper-body equivalence/complete consumer migration and clean calc. Full suite stays human-gated to actual minimum connected UI+same-model ODS readiness, then repair/pause."
  Verification: |-
    - Command: `node output/playwright/task143-checks/portable.mjs` (exact test argv, cwd and reference-link absence in `value-shared-manifest.json` and `value-calc-manifest.json`).
      Result: pass.
      Evidence: 312 related tests/25 files; whole Calc182 tests/72 files. Entire shared bordrhdl owner raw S58/B55/F8/L50 and all33 Calc executable owners S4172/B2731/F821/L3720 at100 with every raw statement/branch/function counter positive. Both new Writer helper owners also100. Six existing changed Writer owners have measured coverage-only gaps and are left under explicit user exemption; no repository coverage settings, thresholds or source maps changed.
      Scope: shared border handler, all changed Writer item mapping/presentation/filter consumers, and whole Calc. Native references absent during portable execution and all4 restored finally.
    - Command: `node output/playwright/task143-checks/build-browser-portable.mjs`.
      Result: pass.
      Evidence: production `npm run build` exit0;12 existing Chromium Writer border/cell/history cases in4 specs pass. Exact argv and reference absence/restoration in `build-browser-manifest.json`; no new browser specs or full-suite run.
      Scope: actual Writer browser consumers affected by import migration at desktop/mobile widths; existing deliberate browser I/O choices preserved.
    - Command: every exact argv in `output/playwright/task143-checks/source-gates.json`; `npx prettier --check` on4 corrected new mapper metadata JSON files; `git diff --check`.
      Result: pass.
      Evidence: all13 gates exit0: scoped format/lint, typecheck, docs1900 authored sources, size, dependency graph640 runtime sources/2849 relative imports/93 allowed cross-module edges, source-tree/provenance, inventory with zero semantic violations, routing, doctor, diff,38 boundary tests. Initial new-file inventory classification failed and was corrected without weakening checks; finding retained. Existing hook shim/chunk advisories do not fail checks.
      Scope: all35 intentional implementation/doc/inventory paths; no policy changes, new cycle exceptions, cycle-check relaxation or Writer coverage repair.
    - Command: `npx tsx output/playwright/task143-checks/audit-mapping.ts`; `python3 output/playwright/task143-checks/audit-final.py`.
      Result: pass.
      Evidence:3 moved helper bodies identical; shared bodies identical except actual published enum owner; NONE unchanged; all10 named-import consumers migrated; no shared item import/compatibility export. All3 cycle-rejection functions unchanged.35paths within45 approved bound;3843 source hashes (3836baseline,28changed existing,7new,3808unchanged);8 native pins at9bc445578031fecf56086729d8e4940c77e14d65 and4 exact reference targets restored. Detailed `verification.json`, hash/intentional-path and mapping audits retained in ignored evidence directory.
      Scope: canonical ownership prerequisite only. XML attribute classes, full native UNO item mapper/Any pipeline, ScDocumentPool/model and connected Calc UI/ODS remain pending. Same-agent EVALUATOR review is not independent. Full all-app suite remains deferred until minimum connected UI plus same-model ODS readiness; repair applicable failures then pause as user requested.
  Rollback Plan: "Revert only intentional task changes through a later authorized task; no reset, merge or publication."
  Findings: |-
    Initial exploration suggested an import-cycle exception for the original editeng XML item dependency, but actual source evidence rejects that workaround: native editeng links xo, while native xmloff bordrhdl uses published UNO structs rather than Editeng objects. Existing reverse import is a misplaced Writer adapter. Correct the ownership instead of creating a cycle exception. Native Writer xmlimpit/xmlexpit handle item-property mapping; current browser-shaped adapter behavior remains bounded/unverified rather than falsely declared a full native mapper. Same-agent evaluation is not independent.

    - Observation: Inventory rejects local-only browser-adaptation classification on the actual native Writer xmlimpit/xmlexpit counterpart paths.
      Impact: New mapper-responsibility files need explicit native source mapping; classifying them as browser-only contradicts their actual native counterpart. Algorithms and all runtime tests are unchanged.
      Resolution: Register the two files as unverified/divergent upstream-mechanism foundations with actual native mapper method witnesses and explicit omitted full class/Any pipeline responsibilities. Do not promote parity, fabricate native classes, rename away the source boundary or weaken enforcement.
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

- Command: `node output/playwright/task143-checks/portable.mjs` (exact test argv, cwd and reference-link absence in `value-shared-manifest.json` and `value-calc-manifest.json`).
  Result: pass.
  Evidence: 312 related tests/25 files; whole Calc182 tests/72 files. Entire shared bordrhdl owner raw S58/B55/F8/L50 and all33 Calc executable owners S4172/B2731/F821/L3720 at100 with every raw statement/branch/function counter positive. Both new Writer helper owners also100. Six existing changed Writer owners have measured coverage-only gaps and are left under explicit user exemption; no repository coverage settings, thresholds or source maps changed.
  Scope: shared border handler, all changed Writer item mapping/presentation/filter consumers, and whole Calc. Native references absent during portable execution and all4 restored finally.
- Command: `node output/playwright/task143-checks/build-browser-portable.mjs`.
  Result: pass.
  Evidence: production `npm run build` exit0;12 existing Chromium Writer border/cell/history cases in4 specs pass. Exact argv and reference absence/restoration in `build-browser-manifest.json`; no new browser specs or full-suite run.
  Scope: actual Writer browser consumers affected by import migration at desktop/mobile widths; existing deliberate browser I/O choices preserved.
- Command: every exact argv in `output/playwright/task143-checks/source-gates.json`; `npx prettier --check` on4 corrected new mapper metadata JSON files; `git diff --check`.
  Result: pass.
  Evidence: all13 gates exit0: scoped format/lint, typecheck, docs1900 authored sources, size, dependency graph640 runtime sources/2849 relative imports/93 allowed cross-module edges, source-tree/provenance, inventory with zero semantic violations, routing, doctor, diff,38 boundary tests. Initial new-file inventory classification failed and was corrected without weakening checks; finding retained. Existing hook shim/chunk advisories do not fail checks.
  Scope: all35 intentional implementation/doc/inventory paths; no policy changes, new cycle exceptions, cycle-check relaxation or Writer coverage repair.
- Command: `npx tsx output/playwright/task143-checks/audit-mapping.ts`; `python3 output/playwright/task143-checks/audit-final.py`.
  Result: pass.
  Evidence:3 moved helper bodies identical; shared bodies identical except actual published enum owner; NONE unchanged; all10 named-import consumers migrated; no shared item import/compatibility export. All3 cycle-rejection functions unchanged.35paths within45 approved bound;3843 source hashes (3836baseline,28changed existing,7new,3808unchanged);8 native pins at9bc445578031fecf56086729d8e4940c77e14d65 and4 exact reference targets restored. Detailed `verification.json`, hash/intentional-path and mapping audits retained in ignored evidence directory.
  Scope: canonical ownership prerequisite only. XML attribute classes, full native UNO item mapper/Any pipeline, ScDocumentPool/model and connected Calc UI/ODS remain pending. Same-agent EVALUATOR review is not independent. Full all-app suite remains deferred until minimum connected UI plus same-model ODS readiness; repair applicable failures then pause as user requested.

## Rollback Plan

Revert only intentional task changes through a later authorized task; no reset, merge or publication.

## Findings

Initial exploration suggested an import-cycle exception for the original editeng XML item dependency, but actual source evidence rejects that workaround: native editeng links xo, while native xmloff bordrhdl uses published UNO structs rather than Editeng objects. Existing reverse import is a misplaced Writer adapter. Correct the ownership instead of creating a cycle exception. Native Writer xmlimpit/xmlexpit handle item-property mapping; current browser-shaped adapter behavior remains bounded/unverified rather than falsely declared a full native mapper. Same-agent evaluation is not independent.

- Observation: Inventory rejects local-only browser-adaptation classification on the actual native Writer xmlimpit/xmlexpit counterpart paths.
  Impact: New mapper-responsibility files need explicit native source mapping; classifying them as browser-only contradicts their actual native counterpart. Algorithms and all runtime tests are unchanged.
  Resolution: Register the two files as unverified/divergent upstream-mechanism foundations with actual native mapper method witnesses and explicit omitted full class/Any pipeline responsibilities. Do not promote parity, fabricate native classes, rename away the source boundary or weaken enforcement.

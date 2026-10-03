---
id: "202610032140-6QN81Y"
title: "Handle Writer submenu keyboard events once"
status: "DOING"
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
  updated_at: "2026-10-03T21:45:08.228Z"
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
    body: "Start: reproduce nested Writer popup keyboard ownership under standing goal authorization; no scripts or upstream sources stored in artifacts."
events:
  -
    type: "status"
    at: "2026-10-03T21:45:08.672Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reproduce nested Writer popup keyboard ownership under standing goal authorization; no scripts or upstream sources stored in artifacts."
doc_version: 3
doc_updated_at: "2026-10-03T21:45:08.672Z"
doc_updated_by: "CODER"
description: "Iteration75 under C9TN6M: reproduce and correct duplicate nested popup keyboard handling for existing Writer menu commands/typeahead, preserving native single activation, menu composition and registered I/O exceptions. Owned unit/browser regression tests never access upstream; outcome-only artifacts."
sections:
  Summary: "Iteration75 under C9TN6M reproduces and corrects duplicate keyboard consumption by an existing Writer submenu and its ancestor popup under standing iterative parity authorization."
  Scope: "Five semantic paths: CommandMenuBar.tsx (nearest popup ownership guard only), new owned CommandMenuBar-keyboard-ownership.test.tsx, new real browser writer-submenu-keyboard.spec.ts, and evidence-only updates to the existing CommandMenuBar rows in source-provenance.json/runtime-inventory.json. All prior tests/spec, generated resources, core, menu composition and registered save/open/recovery exceptions unchanged. Tests never read/compile/invoke upstream. Artifacts contain bounded logs/results/hashes/conclusions only, no helper scripts, Python, copied source or binaries."
  Plan: "1. Inspect exact pinned native popup key dispatch and Writer menu resource, record hashes only. 2. Add owned and real browser regressions and capture baseline before assuming duplicate dispatch. 3. Correct only confirmed nearest-popup ownership. 4. Append narrow manifest evidence without status/default/ownership promotion. 5. Focused checks, full verification with existing 100% gates, sequential vendor-absent app/inventory/script/browser suites, scope/storage/doctor/routing. 6. Same-actor separate EVALUATOR phase on exact semantic HEAD, close leaf and record parent findings; parent/goal stay active."
  Verify Steps: "1. Manual complete relevant native popup dispatch and pinned Writer menu resource inspection; exact pin and hashes only, no native execution. 2. Owned before/after regression verifies single nested Enter/Space action/check/radio execution with exact args, root control, disabled command and multi-key nested typeahead; real Chromium existing Writer ruler checkbox toggles once by Enter/Space. Space and prefix typeahead are existing browser adapter contracts, not claims of complete native keyboard equivalence. 3. npm run verify passes all existing checks and 100% coverage. Static CLI source/resource/parity audits may read vendor separately from tests. 4. Temporarily rename vendor only inside repository and restore finally: sequential npm run test, all three noninventory script Vitest files, npm run test:e2e pass without upstream. 5. All prior tests/spec and production source outside the added owner guard unchanged; each manifest one evidence-only row, statuses/defaults/ownership/order/prior conclusions unchanged; ignored-inclusive source/helper/Python/executable task artifacts zero. 6. ap doctor, routing validation, git diff --check, exact semantic quality review and clean final tracked/untracked checkout."
  Verification: "Pending scoped reproduction and implementation; no behavior claim yet."
  Rollback Plan: "Revert only the task semantic commit if necessary; preserve history and registered exceptions. No network/outside-repo access. Temporary vendor rename restored in finally."
  Findings: "Preflight main/direct at 5a435527a70ec08f7d641e0d92acb36de7ccfa1a, no tracked changes; leaf README only new file. Both nested and ancestor popup install handleMenuKeyDown; bubbling may duplicate click and accumulated prefix. This remains a candidate until owned/browser reproduction. Existing Writer graph has depth2, no arbitrary deeper menu scope. Python/helper/source cleanup already committed as 4bf67a64; current ignored-inclusive Python/source/helper task scan empty. Native full menu/mnemonic/lifetime equivalence, parent and goal remain unverified."
id_source: "generated"
---
## Summary

Iteration75 under C9TN6M reproduces and corrects duplicate keyboard consumption by an existing Writer submenu and its ancestor popup under standing iterative parity authorization.

## Scope

Five semantic paths: CommandMenuBar.tsx (nearest popup ownership guard only), new owned CommandMenuBar-keyboard-ownership.test.tsx, new real browser writer-submenu-keyboard.spec.ts, and evidence-only updates to the existing CommandMenuBar rows in source-provenance.json/runtime-inventory.json. All prior tests/spec, generated resources, core, menu composition and registered save/open/recovery exceptions unchanged. Tests never read/compile/invoke upstream. Artifacts contain bounded logs/results/hashes/conclusions only, no helper scripts, Python, copied source or binaries.

## Plan

1. Inspect exact pinned native popup key dispatch and Writer menu resource, record hashes only. 2. Add owned and real browser regressions and capture baseline before assuming duplicate dispatch. 3. Correct only confirmed nearest-popup ownership. 4. Append narrow manifest evidence without status/default/ownership promotion. 5. Focused checks, full verification with existing 100% gates, sequential vendor-absent app/inventory/script/browser suites, scope/storage/doctor/routing. 6. Same-actor separate EVALUATOR phase on exact semantic HEAD, close leaf and record parent findings; parent/goal stay active.

## Verify Steps

1. Manual complete relevant native popup dispatch and pinned Writer menu resource inspection; exact pin and hashes only, no native execution. 2. Owned before/after regression verifies single nested Enter/Space action/check/radio execution with exact args, root control, disabled command and multi-key nested typeahead; real Chromium existing Writer ruler checkbox toggles once by Enter/Space. Space and prefix typeahead are existing browser adapter contracts, not claims of complete native keyboard equivalence. 3. npm run verify passes all existing checks and 100% coverage. Static CLI source/resource/parity audits may read vendor separately from tests. 4. Temporarily rename vendor only inside repository and restore finally: sequential npm run test, all three noninventory script Vitest files, npm run test:e2e pass without upstream. 5. All prior tests/spec and production source outside the added owner guard unchanged; each manifest one evidence-only row, statuses/defaults/ownership/order/prior conclusions unchanged; ignored-inclusive source/helper/Python/executable task artifacts zero. 6. ap doctor, routing validation, git diff --check, exact semantic quality review and clean final tracked/untracked checkout.

## Verification

Pending scoped reproduction and implementation; no behavior claim yet.

## Rollback Plan

Revert only the task semantic commit if necessary; preserve history and registered exceptions. No network/outside-repo access. Temporary vendor rename restored in finally.

## Findings

Preflight main/direct at 5a435527a70ec08f7d641e0d92acb36de7ccfa1a, no tracked changes; leaf README only new file. Both nested and ancestor popup install handleMenuKeyDown; bubbling may duplicate click and accumulated prefix. This remains a candidate until owned/browser reproduction. Existing Writer graph has depth2, no arbitrary deeper menu scope. Python/helper/source cleanup already committed as 4bf67a64; current ignored-inclusive Python/source/helper task scan empty. Native full menu/mnemonic/lifetime equivalence, parent and goal remain unverified.

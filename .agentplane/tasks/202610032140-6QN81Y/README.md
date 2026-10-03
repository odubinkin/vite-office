---
id: "202610032140-6QN81Y"
title: "Handle Writer submenu keyboard events once"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
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
doc_updated_at: "2026-10-03T21:55:12.192Z"
doc_updated_by: "CODER"
description: "Iteration75 under C9TN6M: reproduce and correct duplicate nested popup keyboard handling for existing Writer menu commands/typeahead, preserving native single activation, menu composition and registered I/O exceptions. Owned unit/browser regression tests never access upstream; outcome-only artifacts."
sections:
  Summary: "Iteration75 under C9TN6M reproduces and corrects duplicate keyboard consumption by an existing Writer submenu and its ancestor popup under standing iterative parity authorization."
  Scope: "Five semantic paths: CommandMenuBar.tsx (nearest popup ownership guard only), new owned CommandMenuBar-keyboard-ownership.test.tsx, new real browser writer-submenu-keyboard.spec.ts, and evidence-only updates to the existing CommandMenuBar rows in source-provenance.json/runtime-inventory.json. All prior tests/spec, generated resources, core, menu composition and registered save/open/recovery exceptions unchanged. Tests never read/compile/invoke upstream. Artifacts contain bounded logs/results/hashes/conclusions only, no helper scripts, Python, copied source or binaries."
  Plan: "1. Inspect exact pinned native popup key dispatch and Writer menu resource, record hashes only. 2. Add owned and real browser regressions and capture baseline before assuming duplicate dispatch. 3. Correct only confirmed nearest-popup ownership. 4. Append narrow manifest evidence without status/default/ownership promotion. 5. Focused checks, full verification with existing 100% gates, sequential vendor-absent app/inventory/script/browser suites, scope/storage/doctor/routing. 6. Same-actor separate EVALUATOR phase on exact semantic HEAD, close leaf and record parent findings; parent/goal stay active."
  Verify Steps: "1. Manual complete relevant native popup dispatch and pinned Writer menu resource inspection; exact pin and hashes only, no native execution. 2. Owned before/after regression verifies single nested Enter/Space action/check/radio execution with exact args, root control, disabled command and multi-key nested typeahead; real Chromium existing Writer ruler checkbox toggles once by Enter/Space. Space and prefix typeahead are existing browser adapter contracts, not claims of complete native keyboard equivalence. 3. npm run verify passes all existing checks and 100% coverage. Static CLI source/resource/parity audits may read vendor separately from tests. 4. Temporarily rename vendor only inside repository and restore finally: sequential npm run test, all three noninventory script Vitest files, npm run test:e2e pass without upstream. 5. All prior tests/spec and production source outside the added owner guard unchanged; each manifest one evidence-only row, statuses/defaults/ownership/order/prior conclusions unchanged; ignored-inclusive source/helper/Python/executable task artifacts zero. 6. ap doctor, routing validation, git diff --check, exact semantic quality review and clean final tracked/untracked checkout."
  Verification: "Command: manual pinned popup KeyInput/EndExecute and Writer resource inspection. Result: exact pin and two source hashes match; one enabled native leaf Return selection, no native compilation/execution or copied source. Command: owned Vitest before/after, app typecheck and focused ESLint. Result: baseline7fail/2pass (six duplicate dispatch and one duplicate-prefix case), corrected9pass; types/lint exit0. Command: real Chromium before/after through npm run verify. Result: baseline both Enter/Space ruler cases fail because two toggles leave ruler visible; corrected22browser cases pass including two-direction toggles for both keys. Space/prefix remain browser adapter contracts, complete native mnemonic/menu behavior unverified. Command: npm run verify. Result: exit0,880app/193files,109inventory/36files,22browser,2resource; all100%coverage(app11101statements/8379branches/2955functions/10188lines,tools1523/1080/384/1464),semantic violations0. Command: sequential vendor-absent npm run test, three noninventory script Vitest files, npm run test:e2e. Result: all exit0,880app+109inventory,12scripts,22browser; pinned9bc445578031fecf56086729d8e4940c77e14d65 restoredfinally. Tests never invoke upstream; source/resource CLI audits are separate. Scope: one production owner guard only,243prior tests/spec unchanged, both215-row manifests one existing append-only evidence row with statuses/defaults/ownership/prior conclusions unchanged. Ignored-inclusive task artifacts2559files,source/helper/Python/executable0. Command: ap doctor,routing,git diff --check. Result:0errors/2knownwarnings/2info,routing/diffpass. Evidence: source-inspection,baseline-runtime/browser,corrected-runtime/types,focused-lint,full-verify-summary,offline-results,scope-integrity,auxiliary-checks. No registered I/O/deviation, whole-module/default/parent/goal/native menu completion promotion. Exact semantic quality review and clean closeout follow."
  Rollback Plan: "Revert only the task semantic commit if necessary; preserve history and registered exceptions. No network/outside-repo access. Temporary vendor rename restored in finally."
  Findings: "Reproduction: correctly scoped owned Vitest has 7 failures/2 passes. All six nested Enter/Space action/check/radio cases call Execute twice; nested two-key prefix repeats each key and leaves focus on Beta instead of Bravo. Root/pointer and disabled navigation controls pass. Initial root-cwd invocation failed before test discovery due to app-relative setup path; corrected app-cwd baseline is the actual reproduction, not a product failure. Browser baseline pending terminal result. Native KeyInput/EndExecute inspected manually and two source hashes recorded; no native execution or source/helper storage. Browser baseline also fails both Enter/Space cases: ruler remains visible after two toggles. One closest-popup/currentTarget guard corrects all 9 owned cases; full verify passes app880/inventory109/browser22/resources2 and all 100% coverage gates, semantic violations0. The existing root/pointer/disabled traversal controls are bounded browser regression controls, not certification of native disabled traversal defaults. Separate next candidate discovered by read-only inspection before vendor-absent run: pinned StyleSettings defaults SkipDisabledInMenus=false, and native popup traversal/keyboard preselection honor it; local menus always skip disabled items. Pointer opening also currently preselects the first submenu item while native HighlightChanged passes preselect only for keyboard. Reproduce and scope either obligation in a new single task, not this ownership correction. Source-provenance stale local symbol names remain separate metadata debt; no promotion or unrelated edit. Sequential vendor-absent app/inventory/scripts/browser all pass; restored pin and both inspected hashes rechecked. Storage scan includes ignored files and contains no helper/source/Python/executable task artifacts. Cleanup4bf67a64 already satisfies deletion request; no redundant cleanup or history rewrite. Exact semantic quality review pending."
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

Command: manual pinned popup KeyInput/EndExecute and Writer resource inspection. Result: exact pin and two source hashes match; one enabled native leaf Return selection, no native compilation/execution or copied source. Command: owned Vitest before/after, app typecheck and focused ESLint. Result: baseline7fail/2pass (six duplicate dispatch and one duplicate-prefix case), corrected9pass; types/lint exit0. Command: real Chromium before/after through npm run verify. Result: baseline both Enter/Space ruler cases fail because two toggles leave ruler visible; corrected22browser cases pass including two-direction toggles for both keys. Space/prefix remain browser adapter contracts, complete native mnemonic/menu behavior unverified. Command: npm run verify. Result: exit0,880app/193files,109inventory/36files,22browser,2resource; all100%coverage(app11101statements/8379branches/2955functions/10188lines,tools1523/1080/384/1464),semantic violations0. Command: sequential vendor-absent npm run test, three noninventory script Vitest files, npm run test:e2e. Result: all exit0,880app+109inventory,12scripts,22browser; pinned9bc445578031fecf56086729d8e4940c77e14d65 restoredfinally. Tests never invoke upstream; source/resource CLI audits are separate. Scope: one production owner guard only,243prior tests/spec unchanged, both215-row manifests one existing append-only evidence row with statuses/defaults/ownership/prior conclusions unchanged. Ignored-inclusive task artifacts2559files,source/helper/Python/executable0. Command: ap doctor,routing,git diff --check. Result:0errors/2knownwarnings/2info,routing/diffpass. Evidence: source-inspection,baseline-runtime/browser,corrected-runtime/types,focused-lint,full-verify-summary,offline-results,scope-integrity,auxiliary-checks. No registered I/O/deviation, whole-module/default/parent/goal/native menu completion promotion. Exact semantic quality review and clean closeout follow.

## Rollback Plan

Revert only the task semantic commit if necessary; preserve history and registered exceptions. No network/outside-repo access. Temporary vendor rename restored in finally.

## Findings

Reproduction: correctly scoped owned Vitest has 7 failures/2 passes. All six nested Enter/Space action/check/radio cases call Execute twice; nested two-key prefix repeats each key and leaves focus on Beta instead of Bravo. Root/pointer and disabled navigation controls pass. Initial root-cwd invocation failed before test discovery due to app-relative setup path; corrected app-cwd baseline is the actual reproduction, not a product failure. Browser baseline pending terminal result. Native KeyInput/EndExecute inspected manually and two source hashes recorded; no native execution or source/helper storage. Browser baseline also fails both Enter/Space cases: ruler remains visible after two toggles. One closest-popup/currentTarget guard corrects all 9 owned cases; full verify passes app880/inventory109/browser22/resources2 and all 100% coverage gates, semantic violations0. The existing root/pointer/disabled traversal controls are bounded browser regression controls, not certification of native disabled traversal defaults. Separate next candidate discovered by read-only inspection before vendor-absent run: pinned StyleSettings defaults SkipDisabledInMenus=false, and native popup traversal/keyboard preselection honor it; local menus always skip disabled items. Pointer opening also currently preselects the first submenu item while native HighlightChanged passes preselect only for keyboard. Reproduce and scope either obligation in a new single task, not this ownership correction. Source-provenance stale local symbol names remain separate metadata debt; no promotion or unrelated edit. Sequential vendor-absent app/inventory/scripts/browser all pass; restored pin and both inspected hashes rechecked. Storage scan includes ignored files and contains no helper/source/Python/executable task artifacts. Cleanup4bf67a64 already satisfies deletion request; no redundant cleanup or history rewrite. Exact semantic quality review pending.

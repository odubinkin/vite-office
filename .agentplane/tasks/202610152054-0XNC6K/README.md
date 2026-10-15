---
id: "202610152054-0XNC6K"
title: "Implement native shared style-sheet iterator for Calc style pools"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T20:54:55.409Z"
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
    body: "Start: implement approved native style iterator dependency, preserve source search edge cases, verify related and Calc coverage without native runtime references."
events:
  -
    type: "status"
    at: "2026-10-15T20:55:00.451Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native style iterator dependency, preserve source search edge cases, verify related and Calc coverage without native runtime references."
doc_version: 3
doc_updated_at: "2026-10-15T20:55:00.451Z"
doc_updated_by: "CODER"
description: "Task171: port the complete SfxStyleSheetIterator and exact search flags/predicate from pinned style.hxx/style.cxx, reusing IndexedStyleSheets through erased borrowed native pool/style operation contracts. Preserve and document suspicious visibility and Find/Next indexing behavior; no substitute style/pool owner."
sections:
  Summary: "Implement the real native style iterator dependency required by SfxStyleSheetBasePool and therefore normal Calc style-pool construction. This is a native responsibility boundary, not a replacement pool."
  Scope: "Task171: svl/inc/style.ts search flags and erased borrowed native pool/style operations; svl/source/items/style.ts complete SfxStyleSheetIterator and predicate; related tests and shared Chromium scenario; shared runtime/provenance/capability registry; readiness and Calc suspected-upstream journal. Maximum20 non-task files. No full style/pool owner, memory manager, presentation localization, native probes or all-app run."
  Plan: "1. Audit original iterator declarations, predicate and all method bodies with real indexed collection. 2. Implement full iterator and exact flags, native integer conversions and boundary behavior; borrowed interfaces bind actual native methods without substitute owners. 3. Add source-derived tests for all three search paths, Used/Hidden masks, duplicate names, cursor transitions, failed searches, mutation and valid native boundary failures; preserve suspicious upstream cases. 4. Record inventory and source pins, verify strict changed shared and wholeCalc100, related index/Sfx/Writer consumers,13source gates, production build and actual Chromium. 5. Commit and evaluate with explicit same-agent limitation, close task and leave goal active until UI/ODS milestone."
  Verify Steps: "Run node output/playwright/task171-checks/native-audit.mjs to pin original style.hxx/style.cxx/IndexedStyleSheets sources, exact flag values and complete original iterator method/predicate coverage. Verify source-derived fixtures rather than claiming a nonexistent native iterator QA port. Run node output/playwright/task171-checks/portable.mjs: related actual style-index/Sfx and Writer consumers, exact measured shared owners and all33Calc owners raw S/B/F/L100, Writer-only coverage exempt. Run node output/playwright/task171-checks/source-gates.mjs for13standard gates. Run node output/playwright/task171-checks/build-browser-portable.mjs for production build and1actual style-iterator Chromium scenario. Native references absent during runtime checks/restored afterward. Record CALC147/148 preserved source cases, remaining full pool/document/UI/ODS dependencies and source hashes. No full all-app run before user-defined minimum UI/ODS milestone."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task171 source/registry/docs commits; retain calc checkout, unrelated tasks, prior native Sfx graph and shared reference symlinks. Do not merge or rewrite history."
  Findings: ""
id_source: "generated"
---
## Summary

Implement the real native style iterator dependency required by SfxStyleSheetBasePool and therefore normal Calc style-pool construction. This is a native responsibility boundary, not a replacement pool.

## Scope

Task171: svl/inc/style.ts search flags and erased borrowed native pool/style operations; svl/source/items/style.ts complete SfxStyleSheetIterator and predicate; related tests and shared Chromium scenario; shared runtime/provenance/capability registry; readiness and Calc suspected-upstream journal. Maximum20 non-task files. No full style/pool owner, memory manager, presentation localization, native probes or all-app run.

## Plan

1. Audit original iterator declarations, predicate and all method bodies with real indexed collection. 2. Implement full iterator and exact flags, native integer conversions and boundary behavior; borrowed interfaces bind actual native methods without substitute owners. 3. Add source-derived tests for all three search paths, Used/Hidden masks, duplicate names, cursor transitions, failed searches, mutation and valid native boundary failures; preserve suspicious upstream cases. 4. Record inventory and source pins, verify strict changed shared and wholeCalc100, related index/Sfx/Writer consumers,13source gates, production build and actual Chromium. 5. Commit and evaluate with explicit same-agent limitation, close task and leave goal active until UI/ODS milestone.

## Verify Steps

Run node output/playwright/task171-checks/native-audit.mjs to pin original style.hxx/style.cxx/IndexedStyleSheets sources, exact flag values and complete original iterator method/predicate coverage. Verify source-derived fixtures rather than claiming a nonexistent native iterator QA port. Run node output/playwright/task171-checks/portable.mjs: related actual style-index/Sfx and Writer consumers, exact measured shared owners and all33Calc owners raw S/B/F/L100, Writer-only coverage exempt. Run node output/playwright/task171-checks/source-gates.mjs for13standard gates. Run node output/playwright/task171-checks/build-browser-portable.mjs for production build and1actual style-iterator Chromium scenario. Native references absent during runtime checks/restored afterward. Record CALC147/148 preserved source cases, remaining full pool/document/UI/ODS dependencies and source hashes. No full all-app run before user-defined minimum UI/ODS milestone.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task171 source/registry/docs commits; retain calc checkout, unrelated tasks, prior native Sfx graph and shared reference symlinks. Do not merge or rewrite history.

## Findings

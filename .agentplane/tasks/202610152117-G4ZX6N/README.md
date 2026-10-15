---
id: "202610152117-G4ZX6N"
title: "Implement native style base and indexed pool model owners"
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
  updated_at: "2026-10-15T21:18:50.651Z"
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
    body: "Start: implement approved actual core style base/pool owners with reused shared dependencies and source-faithful notifications and edge cases."
events:
  -
    type: "status"
    at: "2026-10-15T21:18:55.344Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved actual core style base/pool owners with reused shared dependencies and source-faithful notifications and edge cases."
doc_version: 3
doc_updated_at: "2026-10-15T21:18:55.344Z"
doc_updated_by: "CODER"
description: "Task173: construct actual SfxStyleSheetBase and SfxStyleSheetBasePool core model owners, native hints and name/parent/follow/index/item-set contracts using existing Sfx graph, iterator, index and pool ranges. Explicitly leave presentation/UNO/derived SfxStyleSheet responsibilities pending rather than fake services; preserve source edge cases and GC ownership."
sections:
  Summary: "Construct actual core SfxStyleSheetBase and SfxStyleSheetBasePool owners required before derived Calc style pools, using the implemented shared graph/index/iterator/item-set contracts. Preserve original core defaults and notifications; omit presentation/UNO services explicitly rather than fake them."
  Scope: "Task173: actual style base/pool core model and native style hints within svl/source/items, canonical header type references as needed, native source-derived core tests, actual shared Chromium and related Writer functions; shared runtime/provenance/capability registry and readiness/suspected-upstream journal. Maximum30 non-task paths. Keep model owners together where500-line budget permits; if split from existing iterator, use actual core-model responsibility boundary with provenance rationale. No SfxStyleSheet/ScStyleSheet fake subclass, native refcount/WeakImplHelper manager, presentation strings/UNO facade, all-app run or claimed whole-module parity."
  Plan: "1. Audit pinned core base/pool/hint methods and existing source dependencies. 2. Implement actual name/family/mask/parent/follow/hidden/help/item-set core owners and indexed pool construction/create/make/search/reindex/insert/remove/add/copy/assignment/clear/destructor notifications; retain source bugs CALC146/150 and borrowed-copy semantics. Native unsupported presentation/XML/UNO/XComponent/derived style protocols remain absent and explicitly unimplemented. 3. Source-derived tests exercise actual owners, native change notification order, deferred rename, parent cycles/follow validation, owned/borrowed item-set copies, iterator cache and preserved pool-copy behavior; no substitute style/pool witnesses. 4. Strict changed shared and allCalc100, related Writer tests,13source gates, production build and actual Chromium. 5. Record honest inventory and native source audit, verify/commit/evaluate/close; whole UI/ODS goal remains active."
  Verify Steps: "Run node output/playwright/task173-checks/native-audit.mjs for original style/hint/index/broadcaster source pins and method/default/control-flow evidence. Source-derived fixtures must use actual new style/pool owners and existing real metadata/item-set/index/iterator, preserving CALC146/150 and copy owner behavior; no native QA suite port claim without original fixtures. Run node output/playwright/task173-checks/portable.mjs for exact changed shared owner sets raw S/B/F/L100 and all33Calc100, related Writer functions, Writer-only coverage exemption. Run node output/playwright/task173-checks/source-gates.mjs for13standard gates, then build-browser-portable.mjs for production build and actual core style/pool Chromium. Native references absent during runtime/restored afterward. Record that no presentation/UNO/XComponent/derived style or full Calc document/UI/ODS readiness is claimed; no native memory probes. Full all-app run deferred by user until minimum UI/ODS milestone."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task173 source/docs/registry commits while preserving calc checkout, unrelated work/tasks, prior shared owners and native symlinks. Do not merge branches or rewrite history."
  Findings: ""
id_source: "generated"
---
## Summary

Construct actual core SfxStyleSheetBase and SfxStyleSheetBasePool owners required before derived Calc style pools, using the implemented shared graph/index/iterator/item-set contracts. Preserve original core defaults and notifications; omit presentation/UNO services explicitly rather than fake them.

## Scope

Task173: actual style base/pool core model and native style hints within svl/source/items, canonical header type references as needed, native source-derived core tests, actual shared Chromium and related Writer functions; shared runtime/provenance/capability registry and readiness/suspected-upstream journal. Maximum30 non-task paths. Keep model owners together where500-line budget permits; if split from existing iterator, use actual core-model responsibility boundary with provenance rationale. No SfxStyleSheet/ScStyleSheet fake subclass, native refcount/WeakImplHelper manager, presentation strings/UNO facade, all-app run or claimed whole-module parity.

## Plan

1. Audit pinned core base/pool/hint methods and existing source dependencies. 2. Implement actual name/family/mask/parent/follow/hidden/help/item-set core owners and indexed pool construction/create/make/search/reindex/insert/remove/add/copy/assignment/clear/destructor notifications; retain source bugs CALC146/150 and borrowed-copy semantics. Native unsupported presentation/XML/UNO/XComponent/derived style protocols remain absent and explicitly unimplemented. 3. Source-derived tests exercise actual owners, native change notification order, deferred rename, parent cycles/follow validation, owned/borrowed item-set copies, iterator cache and preserved pool-copy behavior; no substitute style/pool witnesses. 4. Strict changed shared and allCalc100, related Writer tests,13source gates, production build and actual Chromium. 5. Record honest inventory and native source audit, verify/commit/evaluate/close; whole UI/ODS goal remains active.

## Verify Steps

Run node output/playwright/task173-checks/native-audit.mjs for original style/hint/index/broadcaster source pins and method/default/control-flow evidence. Source-derived fixtures must use actual new style/pool owners and existing real metadata/item-set/index/iterator, preserving CALC146/150 and copy owner behavior; no native QA suite port claim without original fixtures. Run node output/playwright/task173-checks/portable.mjs for exact changed shared owner sets raw S/B/F/L100 and all33Calc100, related Writer functions, Writer-only coverage exemption. Run node output/playwright/task173-checks/source-gates.mjs for13standard gates, then build-browser-portable.mjs for production build and actual core style/pool Chromium. Native references absent during runtime/restored afterward. Record that no presentation/UNO/XComponent/derived style or full Calc document/UI/ODS readiness is claimed; no native memory probes. Full all-app run deferred by user until minimum UI/ODS milestone.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task173 source/docs/registry commits while preserving calc checkout, unrelated work/tasks, prior shared owners and native symlinks. Do not merge branches or rewrite history.

## Findings

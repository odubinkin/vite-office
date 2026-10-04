---
id: "202610041906-VVXZ0Q"
title: "Restore owned text hint transfer during cuts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on:
  - "202610041849-96ZZRB"
tags:
  - "code"
  - "parity"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T19:07:16.262Z"
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
    body: "Start: implement approved owned cross-node cut transfer while retaining independent snapshots and registered I/O deviations."
events:
  -
    type: "status"
    at: "2026-10-04T19:07:16.689Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved owned cross-node cut transfer while retaining independent snapshots and registered I/O deviations."
doc_version: 3
doc_updated_at: "2026-10-04T19:07:16.689Z"
doc_updated_by: "CODER"
description: "Replace snapshot-based cross-node moves with an owned cut/transfer path matching native CutImpl pointer movement for strictly interior hints and fresh split hints; preserve independent undo snapshots, prior flags and registered I/O deviations."
sections:
  Summary: |-
    Restore owned text hint transfer during cuts

    Replace snapshot-based cross-node moves with an owned cut/transfer path matching native CutImpl pointer movement for strictly interior hints and fresh split hints; preserve independent undo snapshots, prior flags and registered I/O deviations.
  Scope: "Seven semantic paths: apps/office/src/sw/source/core/txtnode/ndhints.ts, apps/office/src/sw/source/core/txtnode/ndtxt.ts, apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts, apps/office/src/sw/source/core/txtnode/owned-hint-cut.test.ts, apps/office/src/sw/source/core/doc/owned-text-move.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Restore physical SwTextAttr/item ownership transfer for existing cross-node moves with strictly interior hints, fresh partial/equal-end hints, retained source hint objects and isolated undo snapshots. Reuse owned normalization and explicit consumable transfer at destination; existing destination formatting normalization remains bounded. Refactor EraseText through existing ReplaceRange to keep ndtxt.ts under unchanged1000-line limit. All334 prior tests byte-identical, all234 existing runtime fields/statuses/defaults/exceptions unchanged except three bounded justification appendices. Native refcount/destruction/listeners, source empty hints, destination Update/BuildPortions parity, same-node adapter, split/join identity and registered I/O deviations remain unverified/unchanged. No network/outside-repo access or upstream/helper/Python AP artifacts; tests do not invoke upstream."
  Plan: |-
    1. Separate owned normalization from caller-copy replace in SwpHints; implement destructive Cut transferring strictly interior hints/items, reconstructing split/equal-end hints and updating retained source ranges without snapshot aliasing.
    2. Allow explicit same-pool consumable transfer in replaceRange while keeping default snapshot behavior. Reject foreign transfer before mutation; preserve constructor/copy boundaries.
    3. Add SwTextNode.CutTextFragment using owned hints/content index update/notifications, wire cross-node MoveRange to this path and destination transfer. Keep same-node adapter and ordinary state restoration; consolidate EraseText through ReplaceRange under1000-line limit.
    4. Add two app-owned files exercising both attribute families/eight masks/native boundary relations, real object/item/handle identity, moved packet consumption, source and independent history ownership, invalid foreign transfer, empty/plain cuts, actual repeated cross-node moves and no source/target snapshot mutation. All334 prior tests remain unchanged.
    5. Append bounded provenance/inventory conclusions without promotion; run static gates then one sequential absent profile followed by restored source audits and exact scope/AP/hash review; commit, verify, finish leaf and parent progress.
  Verify Steps: |-
    1. Inspect pinned ndtxt.cxx CutImpl/CutText and Update, ndhints.cxx Insert/Delete/Cut, thints.cxx MakeTextAttr/InsertHint and txatbase.cxx constructors. Record hashes/conclusions only; expected physical strictly interior pointer transfer, new split hints, retained source owners, snapshots independent. Native holder/refcounts and full destination adjustment remain unclaimed.
    2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:docs and npm run check:file-size; all pass, ndtxt.ts<=1000lines.
    3. Rename vendor/libreoffice-reference inside repo with finally restoration. Run once sequentially: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Expected all pass, both four-metric coverage100%, no upstream invocation. Recovery repeats only failed gates/cases.
    4. After vendor restoration run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Expected all pass, semantic violations0.
    5. Audit exact seven semantic paths, all334 previous test files byte-identical,234 existing runtime fields/statuses/defaults/exceptions unchanged except three bounded appendices, ignored-inclusive source/helper-free AP, native hashes; run ap doctor and node .agentplane/policy/check-routing.mjs. Expected no scope drift/new errors.
    6. Same-actor read-only EVALUATOR review exact semantic SHA, quality pass; CODER verify/finish separate hashes, clean final main/vendor restored, parent/goal remains active.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this leaf through a new traceable task; no history rewrite. Restore vendor directory after interruption."
  Findings: "Native CutImpl Delete/InsertHint transfers the same SwTextAttr pointer for strictly interior attributes, while split/equal-end hints use MakeTextAttr. Current snapshot-based MoveRange replaces both categories with new objects; owned cut/transfer corrects that concrete identity deficit. Native holder/refcount/destruction/listeners, source empty hints, destination Update/BuildPortions and broader parity remain unverified."
id_source: "generated"
---
## Summary

Restore owned text hint transfer during cuts

Replace snapshot-based cross-node moves with an owned cut/transfer path matching native CutImpl pointer movement for strictly interior hints and fresh split hints; preserve independent undo snapshots, prior flags and registered I/O deviations.

## Scope

Seven semantic paths: apps/office/src/sw/source/core/txtnode/ndhints.ts, apps/office/src/sw/source/core/txtnode/ndtxt.ts, apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts, apps/office/src/sw/source/core/txtnode/owned-hint-cut.test.ts, apps/office/src/sw/source/core/doc/owned-text-move.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Restore physical SwTextAttr/item ownership transfer for existing cross-node moves with strictly interior hints, fresh partial/equal-end hints, retained source hint objects and isolated undo snapshots. Reuse owned normalization and explicit consumable transfer at destination; existing destination formatting normalization remains bounded. Refactor EraseText through existing ReplaceRange to keep ndtxt.ts under unchanged1000-line limit. All334 prior tests byte-identical, all234 existing runtime fields/statuses/defaults/exceptions unchanged except three bounded justification appendices. Native refcount/destruction/listeners, source empty hints, destination Update/BuildPortions parity, same-node adapter, split/join identity and registered I/O deviations remain unverified/unchanged. No network/outside-repo access or upstream/helper/Python AP artifacts; tests do not invoke upstream.

## Plan

1. Separate owned normalization from caller-copy replace in SwpHints; implement destructive Cut transferring strictly interior hints/items, reconstructing split/equal-end hints and updating retained source ranges without snapshot aliasing.
2. Allow explicit same-pool consumable transfer in replaceRange while keeping default snapshot behavior. Reject foreign transfer before mutation; preserve constructor/copy boundaries.
3. Add SwTextNode.CutTextFragment using owned hints/content index update/notifications, wire cross-node MoveRange to this path and destination transfer. Keep same-node adapter and ordinary state restoration; consolidate EraseText through ReplaceRange under1000-line limit.
4. Add two app-owned files exercising both attribute families/eight masks/native boundary relations, real object/item/handle identity, moved packet consumption, source and independent history ownership, invalid foreign transfer, empty/plain cuts, actual repeated cross-node moves and no source/target snapshot mutation. All334 prior tests remain unchanged.
5. Append bounded provenance/inventory conclusions without promotion; run static gates then one sequential absent profile followed by restored source audits and exact scope/AP/hash review; commit, verify, finish leaf and parent progress.

## Verify Steps

1. Inspect pinned ndtxt.cxx CutImpl/CutText and Update, ndhints.cxx Insert/Delete/Cut, thints.cxx MakeTextAttr/InsertHint and txatbase.cxx constructors. Record hashes/conclusions only; expected physical strictly interior pointer transfer, new split hints, retained source owners, snapshots independent. Native holder/refcounts and full destination adjustment remain unclaimed.
2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:docs and npm run check:file-size; all pass, ndtxt.ts<=1000lines.
3. Rename vendor/libreoffice-reference inside repo with finally restoration. Run once sequentially: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Expected all pass, both four-metric coverage100%, no upstream invocation. Recovery repeats only failed gates/cases.
4. After vendor restoration run npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Expected all pass, semantic violations0.
5. Audit exact seven semantic paths, all334 previous test files byte-identical,234 existing runtime fields/statuses/defaults/exceptions unchanged except three bounded appendices, ignored-inclusive source/helper-free AP, native hashes; run ap doctor and node .agentplane/policy/check-routing.mjs. Expected no scope drift/new errors.
6. Same-actor read-only EVALUATOR review exact semantic SHA, quality pass; CODER verify/finish separate hashes, clean final main/vendor restored, parent/goal remains active.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this leaf through a new traceable task; no history rewrite. Restore vendor directory after interruption.

## Findings

Native CutImpl Delete/InsertHint transfers the same SwTextAttr pointer for strictly interior attributes, while split/equal-end hints use MakeTextAttr. Current snapshot-based MoveRange replaces both categories with new objects; owned cut/transfer corrects that concrete identity deficit. Native holder/refcount/destruction/listeners, source empty hints, destination Update/BuildPortions and broader parity remain unverified.

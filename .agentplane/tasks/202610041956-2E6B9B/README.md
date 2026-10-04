---
id: "202610041956-2E6B9B"
title: "Restore text hint owner range notifications"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on:
  - "202610041932-R8ZCS3"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T19:57:04.531Z"
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
    body: "Start: restore approved actual hint owner notification and lazy primary-map resort; preserve prior tests and run once absent upstream."
events:
  -
    type: "status"
    at: "2026-10-04T19:57:04.971Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore approved actual hint owner notification and lazy primary-map resort; preserve prior tests and run once absent upstream."
doc_version: 3
doc_updated_at: "2026-10-04T20:09:27.336Z"
doc_updated_by: "CODER"
description: "Iteration119: restore SwTextAttr owner backlink, native SetStart/SetEnd notifications and lazy dirty-range ResortStartMap/GetWithoutResorting for the existing primary map; transfer/replacement/normalization bind or release actual owners, snapshots stay independent. No new native operation families/maps/status promotion or registered I/O changes. Tests once absent upstream; no AP sources/helpers."
sections:
  Summary: "Restore actual hint owner notification and lazy start-map order for existing ranged attributes."
  Scope: |-
    apps/office/src/sw/source/core/txtnode/txatbase.ts
    apps/office/src/sw/source/core/txtnode/ndhints.ts
    apps/office/src/sw/source/core/txtnode/hint-owner-notifications.test.ts
    apps/office/src/sw/source/core/txtnode/owned-hint-notifications.test.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Restore native m_pHints owner reference and SetStart/SetEnd notification semantics on existing ranged SwTextAttr. Keep public start/end as compatible accessor boundaries over native fields; retain existing constructor/end validation and allow temporary start shifts. Primary SwpHints m_HintsByStart uses native clean/full/partial sorting-range sentinels, StartPosChanged/EndPosChanged and lazy ResortStartMap with lower/upper start bounds; GetWithoutResorting exposes raw stable iteration. Every existing internal sorted read uses the primary accessor, without sorting midway through cut loops. Owned normalization/replacement detaches removed/merged objects and binds surviving objects; packet consumption releases owners before rebasing, including temporary prefix/trailing fragments before adoption. Add independent literal actual-range/owner/notification/snapshot/undo/transfer tests. All337prior tests byte-identical,234runtime rows/defaults/statuses/exceptions unchanged except two bounded appendices. Native protected friend visibility is represented by internal owner storage only; extra sorted maps/history/refcounts/destruction/listeners, pointer ties, empty hints/full destination adjustment/same-node/split-join remain unverified. Run six static gates first, one sequential absent upstream build/app/inventory/scripts/Chromium profile with finally restoration; failed gates/cases recovery only; source audits after. No AP sources/helper scripts/probes; exact-SHA same-actor quality review, verify/finish leaf, clean main and active parent."
  Verify Steps: |-
    1. Inspect pinned txatbase.hxx SetStart/m_pHints,txatbase.cxx SetEnd,ndhints.hxx notifications/GetWithoutResorting,ndhints.cxx Insert/ResortStartMap and thints.cxx DeleteAtPos/MergePortions; record only hashes/prose. Expected owner binding/release, unchanged-end no-op, full/partial lazy resort with native order and stable raw iteration.
    2. Run npm run format:check,npm run lint,npm run typecheck,npm run check:dependencies,npm run check:docs,npm run check:file-size. All pass.
    3. Rename vendor/libreoffice-reference inside repo and restore in finally. Run once sequentially npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. All pass,app/inventory four metrics100%. Recover failed gates/cases only; no present profile or concurrent source/scope/AP audits.
    4. After restoration npm exec -- tsx scripts/generate-writer-ui-resources.ts --check;npm run check:source-tree;npm run check:source-provenance;npm run inventory:invariants;npm run inventory:parity. All pass,semantic violations0.
    5. Audit six semantic paths,all337previous tests byte-identical,234runtime fields/statuses/defaults/exceptions unchanged except two justification appendices,provenance only two bounded appendices,native hashes,ignored-inclusive AP source/helper-free. Run ap doctor,node .agentplane/policy/check-routing.mjs; no new errors.
    6. Same-actor read-only EVALUATOR exact semantic SHA quality pass; CODER verify/finish separate commit hashes; clean main/vendor restored;parent/goal active. No broad native/core/UI promotion.
  Verification: "Pending implementation and upstream-absent gates."
  Rollback Plan: "Revert only the task semantic commit through an authorized follow-up; preserve task history, intentional I/O deviations and unrelated changes."
  Findings: "Implemented native owner backlinks, start/end notification boundaries and full/partial lazy primary-map sorting. Owned cut/transfer/replacement release former owners before rebasing and bind actual survivors. Added51 literal independent cases across both supported families/eight flags, raw/sorted reads, snapshots, merge removal, real moves and undo. Six static gates pass. Initial lint rejected two unused secondary-map parameters; retained the four-argument contract via a labeled tuple and repeated only failed lint before running remaining gates. No product tests yet in this iteration. All337 prior tests and234 runtime fields are intended unchanged, pending scope audit. Extra sorted maps, native friend visibility/history/refcounts/destruction/listeners and broad parity remain unverified."
id_source: "generated"
---
## Summary

Restore actual hint owner notification and lazy start-map order for existing ranged attributes.

## Scope

apps/office/src/sw/source/core/txtnode/txatbase.ts
apps/office/src/sw/source/core/txtnode/ndhints.ts
apps/office/src/sw/source/core/txtnode/hint-owner-notifications.test.ts
apps/office/src/sw/source/core/txtnode/owned-hint-notifications.test.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Restore native m_pHints owner reference and SetStart/SetEnd notification semantics on existing ranged SwTextAttr. Keep public start/end as compatible accessor boundaries over native fields; retain existing constructor/end validation and allow temporary start shifts. Primary SwpHints m_HintsByStart uses native clean/full/partial sorting-range sentinels, StartPosChanged/EndPosChanged and lazy ResortStartMap with lower/upper start bounds; GetWithoutResorting exposes raw stable iteration. Every existing internal sorted read uses the primary accessor, without sorting midway through cut loops. Owned normalization/replacement detaches removed/merged objects and binds surviving objects; packet consumption releases owners before rebasing, including temporary prefix/trailing fragments before adoption. Add independent literal actual-range/owner/notification/snapshot/undo/transfer tests. All337prior tests byte-identical,234runtime rows/defaults/statuses/exceptions unchanged except two bounded appendices. Native protected friend visibility is represented by internal owner storage only; extra sorted maps/history/refcounts/destruction/listeners, pointer ties, empty hints/full destination adjustment/same-node/split-join remain unverified. Run six static gates first, one sequential absent upstream build/app/inventory/scripts/Chromium profile with finally restoration; failed gates/cases recovery only; source audits after. No AP sources/helper scripts/probes; exact-SHA same-actor quality review, verify/finish leaf, clean main and active parent.

## Verify Steps

1. Inspect pinned txatbase.hxx SetStart/m_pHints,txatbase.cxx SetEnd,ndhints.hxx notifications/GetWithoutResorting,ndhints.cxx Insert/ResortStartMap and thints.cxx DeleteAtPos/MergePortions; record only hashes/prose. Expected owner binding/release, unchanged-end no-op, full/partial lazy resort with native order and stable raw iteration.
2. Run npm run format:check,npm run lint,npm run typecheck,npm run check:dependencies,npm run check:docs,npm run check:file-size. All pass.
3. Rename vendor/libreoffice-reference inside repo and restore in finally. Run once sequentially npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. All pass,app/inventory four metrics100%. Recover failed gates/cases only; no present profile or concurrent source/scope/AP audits.
4. After restoration npm exec -- tsx scripts/generate-writer-ui-resources.ts --check;npm run check:source-tree;npm run check:source-provenance;npm run inventory:invariants;npm run inventory:parity. All pass,semantic violations0.
5. Audit six semantic paths,all337previous tests byte-identical,234runtime fields/statuses/defaults/exceptions unchanged except two justification appendices,provenance only two bounded appendices,native hashes,ignored-inclusive AP source/helper-free. Run ap doctor,node .agentplane/policy/check-routing.mjs; no new errors.
6. Same-actor read-only EVALUATOR exact semantic SHA quality pass; CODER verify/finish separate commit hashes; clean main/vendor restored;parent/goal active. No broad native/core/UI promotion.

## Verification

Pending implementation and upstream-absent gates.

## Rollback Plan

Revert only the task semantic commit through an authorized follow-up; preserve task history, intentional I/O deviations and unrelated changes.

## Findings

Implemented native owner backlinks, start/end notification boundaries and full/partial lazy primary-map sorting. Owned cut/transfer/replacement release former owners before rebasing and bind actual survivors. Added51 literal independent cases across both supported families/eight flags, raw/sorted reads, snapshots, merge removal, real moves and undo. Six static gates pass. Initial lint rejected two unused secondary-map parameters; retained the four-argument contract via a labeled tuple and repeated only failed lint before running remaining gates. No product tests yet in this iteration. All337 prior tests and234 runtime fields are intended unchanged, pending scope audit. Extra sorted maps, native friend visibility/history/refcounts/destruction/listeners and broad parity remain unverified.

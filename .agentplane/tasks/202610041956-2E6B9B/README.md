---
id: "202610041956-2E6B9B"
title: "Restore text hint owner range notifications"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
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
quality_review:
  state: "pass"
  updated_at: "2026-10-04T20:16:11.974Z"
  updated_by: "EVALUATOR"
  note: "Same-actor read-only quality phase passes approved iteration119 at exact semantic SHA 082670f76dc9b0c8a5075996aa5896d5aee74f4a. No independent-agent review or broad parity promotion."
  evaluated_sha: "082670f76dc9b0c8a5075996aa5896d5aee74f4a"
  blueprint_digest: "5dabbb2bd36fb35b259c2ce2708585153c31d5115796e0bfa7f9093d6731758d"
  evidence_refs:
    - ".agentplane/tasks/202610041956-2E6B9B/README.md"
    - ".agentplane/tasks/202610041956-2E6B9B/quality/20261004-201611974-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610041956-2E6B9B/quality/20261004-201611974-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610041956-2E6B9B/quality/20261004-201611974-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610041956-2E6B9B/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610041956-2E6B9B/evidence/static-gates.json"
    - ".agentplane/tasks/202610041956-2E6B9B/evidence/absent-profile.json"
    - ".agentplane/tasks/202610041956-2E6B9B/evidence/restored-source-audits.json"
    - ".agentplane/tasks/202610041956-2E6B9B/evidence/scope-and-native-hashes.json"
    - "Read-only actual commit byte/path/native-hash/evidence assertions passed at 082670f76dc9b0c8a5075996aa5896d5aee74f4a; no product suite replay."
  findings:
    - "Exact commit six semantic paths and working bytes match.337 prior tests byte-identical;234 inventory fields/statuses/defaults/exceptions unchanged except two appended justifications; two provenance appendices only. Native SetStart/changed-end owner notification and primary dirty interval sorting reviewed against five pinned hashes. Actual owner release/bind behavior and51 new literal tests cover clone/merge/cut/transfer/undo boundaries."
    - "Six static gates pass with failed lint-only recovery. Build/app2124/inventory109/scripts5/Chromium99 each passed once absent; both coverage summaries all four metrics100%. Vendor restored before five source audits,semantic violations0. Ignored-inclusive AP scan forbidden0; doctor0 errors/two unchanged warnings and routing pass."
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
doc_updated_at: "2026-10-04T20:15:00.661Z"
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
  Verification: "Executed declared verification for iteration119. Six static gates pass; initial lint-only unused parameters corrected through the labeled four-value notification tuple and only lint repeated before remaining gates. One sequential upstream-absent profile: build pass,app2124 tests/256 files and inventory109/36 with all four metrics100%,script tests5/2,Chromium99; every gate exit0,no successful suite repeated and no present-upstream product test profile. Vendor restored in finally. Five restored source/resource/inventory audits exit0,semantic violations0. Scope audit confirms exactly six semantic paths,all337 prior test/spec files byte-identical,234 runtime fields/statuses/defaults/exceptions unchanged except two justification appendices and two provenance appendices. Five pinned native source hashes recorded without source copies. Ignored-inclusive AP source/helper scan forbidden0; ap doctor errors0/two unchanged warnings and policy routing pass. Evidence: evidence/static-gates.json,evidence/absent-profile.json,evidence/restored-source-audits.json,evidence/scope-and-native-hashes.json. Read-only same-actor exact-SHA EVALUATOR review required before verify/finish. Broad parity and documented native representation gaps remain unverified."
  Rollback Plan: "Revert only the task semantic commit through an authorized follow-up; preserve task history, intentional I/O deviations and unrelated changes."
  Findings: "Iteration119 implemented owned SwTextAttr range notifications and native lazy primary-map sorting. m_pHints is bound to actual surviving container attributes, detached from merged/removed attributes and released before cut/packet rebasing; cloned snapshots/history remain independently owned. SetStart always marks the map dirty; SetEnd notifies the current owner only for actual valid end changes. Get sorts lazily, Count/raw GetWithoutResorting preserve iteration, and binary lower/upper start bounds sort only the affected interval.51 new literal cases pass. Six semantic paths only; all337 prior test/spec files byte-identical.234 runtime rows retain all fields/statuses/defaults/exceptions apart from two appended justifications; provenance has two bounded appendices. Six static gates pass, only initially failed lint repeated. One upstream-absent build and app2124/256,inventory109/36,scripts5/2,Chromium99 pass; app/inventory lines/statements/functions/branches100%. Finally restored vendor; five source audits pass with semantic violations0. Ignored-inclusive AP scan3774 files,forbidden0. Doctor0 errors/two unchanged warnings,routing pass. Exact semantic-SHA read-only same-actor quality review still pending. Supported primary-map behavior does not establish full native class hierarchy/friend visibility/end/Which maps/history/refcounts/destruction/listeners, empty hints/full destination adjustment or broad core/UI parity. Registered save/open/recovery deviations untouched."
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

Executed declared verification for iteration119. Six static gates pass; initial lint-only unused parameters corrected through the labeled four-value notification tuple and only lint repeated before remaining gates. One sequential upstream-absent profile: build pass,app2124 tests/256 files and inventory109/36 with all four metrics100%,script tests5/2,Chromium99; every gate exit0,no successful suite repeated and no present-upstream product test profile. Vendor restored in finally. Five restored source/resource/inventory audits exit0,semantic violations0. Scope audit confirms exactly six semantic paths,all337 prior test/spec files byte-identical,234 runtime fields/statuses/defaults/exceptions unchanged except two justification appendices and two provenance appendices. Five pinned native source hashes recorded without source copies. Ignored-inclusive AP source/helper scan forbidden0; ap doctor errors0/two unchanged warnings and policy routing pass. Evidence: evidence/static-gates.json,evidence/absent-profile.json,evidence/restored-source-audits.json,evidence/scope-and-native-hashes.json. Read-only same-actor exact-SHA EVALUATOR review required before verify/finish. Broad parity and documented native representation gaps remain unverified.

## Rollback Plan

Revert only the task semantic commit through an authorized follow-up; preserve task history, intentional I/O deviations and unrelated changes.

## Findings

Iteration119 implemented owned SwTextAttr range notifications and native lazy primary-map sorting. m_pHints is bound to actual surviving container attributes, detached from merged/removed attributes and released before cut/packet rebasing; cloned snapshots/history remain independently owned. SetStart always marks the map dirty; SetEnd notifies the current owner only for actual valid end changes. Get sorts lazily, Count/raw GetWithoutResorting preserve iteration, and binary lower/upper start bounds sort only the affected interval.51 new literal cases pass. Six semantic paths only; all337 prior test/spec files byte-identical.234 runtime rows retain all fields/statuses/defaults/exceptions apart from two appended justifications; provenance has two bounded appendices. Six static gates pass, only initially failed lint repeated. One upstream-absent build and app2124/256,inventory109/36,scripts5/2,Chromium99 pass; app/inventory lines/statements/functions/branches100%. Finally restored vendor; five source audits pass with semantic violations0. Ignored-inclusive AP scan3774 files,forbidden0. Doctor0 errors/two unchanged warnings,routing pass. Exact semantic-SHA read-only same-actor quality review still pending. Supported primary-map behavior does not establish full native class hierarchy/friend visibility/end/Which maps/history/refcounts/destruction/listeners, empty hints/full destination adjustment or broad core/UI parity. Registered save/open/recovery deviations untouched.

---
id: "202610041906-VVXZ0Q"
title: "Restore owned text hint transfer during cuts"
result_summary: "Owned cross-node text hint cuts transfer actual interior attributes, reconstruct boundary attributes, preserve retained source owners and consume destination fragments. Added118 app cases;334 previous tests unchanged. All tests absent upstream:app2006/inventory109/scripts5/Chromium99, coverage100%. Only failed app gate recovered; source audits semantic0 and registered deviations unchanged."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 15
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
  state: "ok"
  updated_at: "2026-10-04T19:29:16.829Z"
  updated_by: "CODER"
  note: "Verified bounded owned cross-node hint transfer. Six static gates pass; initial absent build passes, only failed app coverage recovered after new-test corrections. App2006 coverage100%,inventory109 coverage100%,scripts5,Chromium99. Five restored source audits semantic0;334 prior tests unchanged234 runtime fields unchanged except three appendices; AP forbidden0,doctor0errors/routing pass. Same-actor quality pass exact semantic ea8d418fa4402a0bdfca380e2d366ad9f5287e23; full parity remains unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-04T19:28:53.351Z"
  updated_by: "EVALUATOR"
  note: "Same-actor read-only review passes bounded owned text-hint cut transfer at ea8d418fa4402a0bdfca380e2d366ad9f5287e23. Broad native/core/browser parity remains unverified."
  evaluated_sha: "ea8d418fa4402a0bdfca380e2d366ad9f5287e23"
  blueprint_digest: "6d49d4aaacd3838bed6adba109bfb60735c8996af0cb628f60370faed4ded0f3"
  evidence_refs:
    - ".agentplane/tasks/202610041906-VVXZ0Q/README.md"
    - ".agentplane/tasks/202610041906-VVXZ0Q/quality/20261004-192853351-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610041906-VVXZ0Q/quality/20261004-192853351-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610041906-VVXZ0Q/quality/20261004-192853351-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610041906-VVXZ0Q/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610041906-VVXZ0Q/evidence/static-gates.json"
    - ".agentplane/tasks/202610041906-VVXZ0Q/evidence/absent-profile.json"
    - ".agentplane/tasks/202610041906-VVXZ0Q/evidence/absent-recovery-pending.json"
    - ".agentplane/tasks/202610041906-VVXZ0Q/evidence/restored-source-audits.json"
    - ".agentplane/tasks/202610041906-VVXZ0Q/evidence/scope-and-native-hashes.json"
    - "Exact semantic SHA ea8d418fa4402a0bdfca380e2d366ad9f5287e23 reviewed read-only; nine native hashes checked; focused test formatter/lint/typecheck recovery passed."
  findings:
    - "Native strictly interior hint/item objects transfer and consumable fragments empty; split/equal-end attributes reconstruct. Source owners and historical snapshots remain independent. Literal eight-mask boundary/real-node/repeated-transfer tests pass. Erase replacement delegation retains existing behavior; node988lines."
    - "Six static gates pass; new-test-only tuple typecheck recovery passes. Initial absent build passes; only failed app coverage gate recovered after test-only corrections:2006/253 and100%four metrics. Inventory109/36 coverage100,scripts5/2,Chromium99 first absent pass. Five restored audits pass semantic violations0; seven paths334 prior tests unchanged234 runtime fields unchanged except three appendices. AP3755 files forbidden0; doctor0errors/two unchanged warnings,routing pass."
commit:
  hash: "e4d7a34bd4c31e50eec238e1e1f386f8957bdd56"
  message: "🧩 VVXZ0Q task: record successful bounded transfer verification"
comments:
  -
    author: "CODER"
    body: "Start: implement approved owned cross-node cut transfer while retaining independent snapshots and registered I/O deviations."
  -
    author: "CODER"
    body: "Verified: native strictly interior hint/item transfer and independent snapshots, all declared gates pass; full parity remains unverified."
events:
  -
    type: "status"
    at: "2026-10-04T19:07:16.689Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved owned cross-node cut transfer while retaining independent snapshots and registered I/O deviations."
  -
    type: "verify"
    at: "2026-10-04T19:29:16.829Z"
    author: "CODER"
    state: "ok"
    note: "Verified bounded owned cross-node hint transfer. Six static gates pass; initial absent build passes, only failed app coverage recovered after new-test corrections. App2006 coverage100%,inventory109 coverage100%,scripts5,Chromium99. Five restored source audits semantic0;334 prior tests unchanged234 runtime fields unchanged except three appendices; AP forbidden0,doctor0errors/routing pass. Same-actor quality pass exact semantic ea8d418fa4402a0bdfca380e2d366ad9f5287e23; full parity remains unverified."
  -
    type: "status"
    at: "2026-10-04T19:29:33.361Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native strictly interior hint/item transfer and independent snapshots, all declared gates pass; full parity remains unverified."
doc_version: 3
doc_updated_at: "2026-10-04T19:29:33.363Z"
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
    Six static gates pass with new-test-only formatter/lint/typecheck recovery. Upstream-absent build passed once; failed app coverage gate recovered alone after test-only corrections:2006/253 pass and100%four metrics. Inventory109/36 coverage100%,scripts5/2,Chromium99 pass first absent. Vendor restored; five source audits pass semantic violations0. Seven semantic paths,334 prior test files unchanged,234 runtime fields/statuses/defaults/exceptions unchanged except three justification appendices; source provenance only three responsibility appendices. Native hashes9; ignored-inclusive AP forbidden0; doctor0errors/two unchanged warnings,routing pass. Required exact-SHA same-actor quality review precedes verify/finish. Full native holder/listener/empty-hint/destination adjustment/same-node/split-join and broad UI/core parity remain unverified.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-04T19:29:16.829Z — VERIFY — ok

    By: CODER

    Note: Verified bounded owned cross-node hint transfer. Six static gates pass; initial absent build passes, only failed app coverage recovered after new-test corrections. App2006 coverage100%,inventory109 coverage100%,scripts5,Chromium99. Five restored source audits semantic0;334 prior tests unchanged234 runtime fields unchanged except three appendices; AP forbidden0,doctor0errors/routing pass. Same-actor quality pass exact semantic ea8d418fa4402a0bdfca380e2d366ad9f5287e23; full parity remains unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T19:27:39.408Z, excerpt_hash=sha256:e9af4696b0656029592ba93defde4f58cf8991596cf96afa1d8dfb316142007b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610041906-VVXZ0Q/blueprint/resolved-snapshot.json
    - old_digest: 6d49d4aaacd3838bed6adba109bfb60735c8996af0cb628f60370faed4ded0f3
    - current_digest: 6d49d4aaacd3838bed6adba109bfb60735c8996af0cb628f60370faed4ded0f3
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610041906-VVXZ0Q

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610041906-VVXZ0Q
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this leaf through a new traceable task; no history rewrite. Restore vendor directory after interruption."
  Findings: "Implemented owned cross-node cut/transfer and118 new app cases. Native CutImpl strictly interior hints transfer actual pointers/items; partial/equal-end hints reconstruct, retained source objects update in place. SwpHints normalization split preserves caller snapshots. Node cut owns text/index notifications; EraseText delegates bounded replacement. Six initial static gates passed. First absent build passed; initial app1950 passed48 new-test failures from array reference equality, coverage branches99.98. Only new test corrected to deep values plus eight exact-end/interior preview cases; production unchanged. New tuple annotation fixed failed changed-test typecheck; formatter/lint/typecheck pass. Failed app coverage gate alone repeated absent:2006/253 all pass four metrics100. Inventory109/36 coverage100, scripts5/2, Chromium99 first absent pass. No present test profile or successful build repeat. Vendor restored before five source audits, all pass semantic violations0. Seven paths,334 prior tests byte-identical,234 runtime fields unchanged except three appendices, provenance only three appended responsibilities, nine native hashes. Scope-audit comparator corrected for appended array entries; no product change. AP3755 ignored-inclusive files forbidden0; doctor0errors two unchanged warnings, routing pass. Native backlinks/refcounts/destruction/listeners, empty hints, destination Update/BuildPortions/merge identity, same-node move and split/join remain unverified. Parent and goal active; no status promotion or I/O deviation changes."
extensions:
  implementation_commit:
    hash: "ea8d418fa4402a0bdfca380e2d366ad9f5287e23"
    message: "🧩 VVXZ0Q writer: transfer owned cut hints between text nodes"
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

Six static gates pass with new-test-only formatter/lint/typecheck recovery. Upstream-absent build passed once; failed app coverage gate recovered alone after test-only corrections:2006/253 pass and100%four metrics. Inventory109/36 coverage100%,scripts5/2,Chromium99 pass first absent. Vendor restored; five source audits pass semantic violations0. Seven semantic paths,334 prior test files unchanged,234 runtime fields/statuses/defaults/exceptions unchanged except three justification appendices; source provenance only three responsibility appendices. Native hashes9; ignored-inclusive AP forbidden0; doctor0errors/two unchanged warnings,routing pass. Required exact-SHA same-actor quality review precedes verify/finish. Full native holder/listener/empty-hint/destination adjustment/same-node/split-join and broad UI/core parity remain unverified.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-04T19:29:16.829Z — VERIFY — ok

By: CODER

Note: Verified bounded owned cross-node hint transfer. Six static gates pass; initial absent build passes, only failed app coverage recovered after new-test corrections. App2006 coverage100%,inventory109 coverage100%,scripts5,Chromium99. Five restored source audits semantic0;334 prior tests unchanged234 runtime fields unchanged except three appendices; AP forbidden0,doctor0errors/routing pass. Same-actor quality pass exact semantic ea8d418fa4402a0bdfca380e2d366ad9f5287e23; full parity remains unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T19:27:39.408Z, excerpt_hash=sha256:e9af4696b0656029592ba93defde4f58cf8991596cf96afa1d8dfb316142007b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610041906-VVXZ0Q/blueprint/resolved-snapshot.json
- old_digest: 6d49d4aaacd3838bed6adba109bfb60735c8996af0cb628f60370faed4ded0f3
- current_digest: 6d49d4aaacd3838bed6adba109bfb60735c8996af0cb628f60370faed4ded0f3
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610041906-VVXZ0Q

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610041906-VVXZ0Q
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this leaf through a new traceable task; no history rewrite. Restore vendor directory after interruption.

## Findings

Implemented owned cross-node cut/transfer and118 new app cases. Native CutImpl strictly interior hints transfer actual pointers/items; partial/equal-end hints reconstruct, retained source objects update in place. SwpHints normalization split preserves caller snapshots. Node cut owns text/index notifications; EraseText delegates bounded replacement. Six initial static gates passed. First absent build passed; initial app1950 passed48 new-test failures from array reference equality, coverage branches99.98. Only new test corrected to deep values plus eight exact-end/interior preview cases; production unchanged. New tuple annotation fixed failed changed-test typecheck; formatter/lint/typecheck pass. Failed app coverage gate alone repeated absent:2006/253 all pass four metrics100. Inventory109/36 coverage100, scripts5/2, Chromium99 first absent pass. No present test profile or successful build repeat. Vendor restored before five source audits, all pass semantic violations0. Seven paths,334 prior tests byte-identical,234 runtime fields unchanged except three appendices, provenance only three appended responsibilities, nine native hashes. Scope-audit comparator corrected for appended array entries; no product change. AP3755 ignored-inclusive files forbidden0; doctor0errors two unchanged warnings, routing pass. Native backlinks/refcounts/destruction/listeners, empty hints, destination Update/BuildPortions/merge identity, same-node move and split/join remain unverified. Parent and goal active; no status promotion or I/O deviation changes.

---
id: "202610111710-QJTZN0"
title: "Restore native content-node layout-frame lookup"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-11T17:11:32.007Z"
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
    body: "Start: port original no-view-position registered content-node layout lookup and root/master/follow selection, preserve canonical history and IO exceptions, verify actual current-source 100 percent without upstream; correction1 after full checkpoint."
events:
  -
    type: "status"
    at: "2026-10-11T17:11:41.674Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port original no-view-position registered content-node layout lookup and root/master/follow selection, preserve canonical history and IO exceptions, verify actual current-source 100 percent without upstream; correction1 after full checkpoint."
doc_version: 3
doc_updated_at: "2026-10-11T17:28:32.582Z"
doc_updated_by: "CODER"
description: "First correction after full A77JR3: port the original GetFrameOfModify no-view-position branch and SwContentNode.getLayoutFrame over actual registered frame clients, preserving root/master/follow/native position identity. Restore the native query contract as a prerequisite for replacing the measured cursor registry; geometric selection, Calc and margin integration remain explicit further work. Preserve historical inventory and registered IO deviations."
sections:
  Summary: "Restore the original content-node lookup boundary over actual registered native frames, including root and master/follow selection and exact original position routing. This is correction1 after full A77JR3. Previous goal turn completed and verified the full checkpoint; the resumed goal is active. No full run in this task."
  Scope: "Production: new sw/source/core/layout/frmtool.ts and original sw/source/core/docnode/node.ts. Fresh native query tests; canonical runtime/provenance entries for both files and parent/task evidence. No changes to cursor measurements or acceptance values, coverage providers/thresholds, registered recovery/open/save/settings differences or unrelated Calc code."
  Plan: "Read pinned GetFrameOfModify and SwContentNode::getLayoutFrame. Port the actual no-view-position query using original listener/frame/root/flow owners and original SwPosition. Add native literal/identity cases for body and cells, competing roots and masters, missing/non-frame/wrong-type clients, follows at boundary ties, destruction and same-document identity. Update canonical inventory with explicit omitted view geometry/Calc/iterator reentry/multi-listener responsibilities; keep all old status/default/classification/evidence. Run only targeted related tests and whole changed-module 100 percent coverage, static checks without references, then restored-source metadata gates. Record exact semantic review and close clean. Native cursor UI wiring and elimination of duplicate measured client registry remain subsequent work; no broad parity promotion."
  Verify Steps: |-
    1. Compare pinned frmtool.cxx GetFrameOfModify and node.cxx getLayoutFrame; retain native no-view first qualifying master/type/root and original GetFrameAtPos behavior. Confirm no suspicious source issue in represented branch.
    2. With LibreOffice and mdds reference links physically absent run format/lint/TS7/dependencies/docs/file-size/build/static plus Vitest related tests for node.ts and new frmtool.ts with complete whole-file Istanbul maps, original 100 thresholds in all four metrics. Run new literal/identity cases and source-independent root tooling ownership/source-provenance/resource tests. Keep helpers/raw logs/maps only ignored cache and restore refs in finally.
    3. Inspect all current raw IDs/locations/counters and source hashes; require whole changed files all-four100, all executed assertions pass and no skip/flaky/retry, old test files byte-identical, new query routes actual existing production node/frame objects and allocates no model/position copies. No broad full suite for correction1.
    4. After restoration run source-tree/provenance/registry/resource-generation/invariants/parity/routing/doctor/diff metadata gates. Canonical historical semantics/defaults/classifications/registered IO exceptions unchanged.
    5. Persist bounded evidence and exact semantic same-agent non-independent evaluator review; finish clean writer and leave broad goal active.
  Verification: |-
    Result: pass after scoped fixture and environment repairs. Original no-view-position GetFrameOfModify and SwContentNode.getLayoutFrame now borrow actual registered frame clients, use native type-mask/original root identity/master exclusion and original GetFrameAtPos routing. 13990 related cases in507 files, including12 fresh cases, and25 root tooling/resource cases in4 files pass (14015 unique). Entire two production modules current Istanbul100 all four metrics:93lines104statements35functions62branches,201 complete nonnegative integer raw counters. All863 old acceptance files byte-identical; existing two canonical histories/scalars/prefixes retained and two new source-mapped records added with unverified broad status. Actual retained/reflowed pagination queries borrow original objects without cursor-map publication or model/position copies. Native UI margin query integration/geometry/Calc/iterator order and full parity remain pending. Correction1 after the completed full checkpoint; no new full run.

    Scope: sw/source/core/layout/frmtool.ts and sw/source/core/docnode/node.ts; fresh native-content-frame-query.test.ts and their canonical runtime/provenance records. Registered recovery/open/save/settings deviations retained.

    Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run format:check
    Result: pass

    Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run lint
    Result: pass

    Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run typecheck
    Result: initial fail; final causal fixture repair passes

    Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run check:dependencies
    Result: pass

    Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run check:docs
    Result: pass

    Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run check:file-size
    Result: pass

    Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run build
    Result: initial fail; final causal fixture repair passes

    Command: cwd /Users/odubinkin/Projects/vite-office-writer; node scripts/check-static-build.mjs
    Result: initial stale-dist result excluded; final current build static pass

    Command: cwd /Users/odubinkin/Projects/vite-office-writer/apps/office; npm exec -- vitest related src/sw/source/core/docnode/node.ts src/sw/source/core/layout/frmtool.ts --run --coverage --coverage.include=src/sw/source/core/docnode/node.ts --coverage.include=src/sw/source/core/layout/frmtool.ts --coverage.reporter=json --coverage.reporter=json-summary --coverage.reportsDirectory=/Users/odubinkin/Projects/vite-office-writer/apps/office/node_modules/.cache/parity-coverage/QJTZN0/related-coverage --coverage.reportOnFailure --reporter=default --reporter=json --outputFile=/Users/odubinkin/Projects/vite-office-writer/apps/office/node_modules/.cache/parity-coverage/QJTZN0/related-tests.json
    Result: pass

    Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/native-writer-test-ownership.test.ts scripts/check-module-boundaries.test.ts scripts/writer-ui-resource-model.test.ts --reporter=default --reporter=json --outputFile=/Users/odubinkin/Projects/vite-office-writer/apps/office/node_modules/.cache/parity-coverage/QJTZN0/tooling-tests.json
    Result: pass

    Command: cwd /Users/odubinkin/Projects/vite-office-writer; /Users/odubinkin/Projects/vite-office-writer/node_modules/.bin/prettier --check apps/office/src/sw/source/core/layout/native-content-frame-query.test.ts
    Result: pass

    Command: cwd /Users/odubinkin/Projects/vite-office-writer; /Users/odubinkin/Projects/vite-office-writer/node_modules/.bin/eslint apps/office/src/sw/source/core/layout/native-content-frame-query.test.ts --max-warnings 0
    Result: pass

    Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run typecheck
    Result: pass

    Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run build
    Result: pass

    Command: cwd /Users/odubinkin/Projects/vite-office-writer; node scripts/check-static-build.mjs
    Result: pass

    Command: cwd /Users/odubinkin/Projects/vite-office-writer/apps/office; npm exec -- vitest run src/sw/source/core/layout/native-content-frame-query.test.ts -t "body/cell lookup" --reporter=default --reporter=json --outputFile=/Users/odubinkin/Projects/vite-office-writer/apps/office/node_modules/.cache/parity-coverage/QJTZN0/final-body-tests.json
    Result: pass

    Evidence: all runtime/static commands physically absent LibreOffice/mdds references; ICU did not exist until after tests for metadata. Both original links restored in finally. All related/root tests zero runtime failures/skips/todo; fresh12 fixture cases revalidated after protected-constructor repair; final two body/cell cases rerun after actual-base owner correction, with other10 fresh cases deliberately filtered and not replayed. No production changes after initial coverage, actual source hashes verified. No full test replay, threshold/provider/include/exclude source change, source/raw maps/helpers/Python in AgentPlane.

    Evidence: entire module maps derived from unchanged raw current coverage-final.json SHA256 44a73362a0d8ff48738dfeed7c8dd375868261e7614a1e5f3d1d3a060b1fac0e. Exact production hashes {"apps/office/src/sw/source/core/docnode/node.ts":"0a03384579deabd8394538f5f78921bc55be7fa921671865afd79bc70a584710","apps/office/src/sw/source/core/layout/frmtool.ts":"b1689c2ccbb3fce55f4e39d6ad217290034d5424e15eb9295f8f6208c117bba2"}. All2805baseline tracked non-AgentPlane paths preserved except original node.ts plus its two intentional canonical append-only records; all863old acceptance files byte-identical. Exact old canonical scalar and history-prefix proof passes. No coverage filtering/map editing/counter rewrites/older source-map reuse.

    Command: npm run check:source-tree
    Command: npm run check:source-provenance
    Command: npm run inventory:registry:check
    Command: node_modules/.bin/tsx scripts/generate-writer-ui-resources.ts --check
    Command: npm run inventory:invariants
    Command: npm run inventory:parity
    Command: node .agentplane/policy/check-routing.mjs
    Command: ap doctor
    Command: git diff --check
    Result: all9 restored-source metadata gates pass. Initial provenance ENOENT ICU reference resolved by ignored symlink to existing approved vite-office vendor copy; no source modification, network or runtime replay.

    Evidence paths: ignored apps/office/node_modules/.cache/parity-coverage/QJTZN0/{proof.json,results.json,repair-results.json,final-repair-results.json,audit-results.json,audit-final-results.json,execution-hashes.json,before-hashes.json,related-tests.json,tooling-tests.json,related-coverage/coverage-final.json}. Maps/logs/cache helper scripts remain only there.

    Residual: SwIterator native client order/UnwrapMulti/reentry/deletion holders, view-position rectangles/distance/page query, Calc/fly formatting and native non-text content are not represented. SwCursor still uses measured cursor registry; this query is a native foundation, not a claim that UI margin integration or duplicate clients are resolved. Full root/page/content hierarchy/formatter/merged/geometry/table follows and overall core/UI parity incomplete. No suspicious source logic found in represented no-view branch; no suspected-issues entry fabricated. Same-agent non-independent exact semantic review pending; close clean writer and leave goal active.
  Rollback Plan: "Revert this task semantic production and canonical-record diff through a separately approved traceable correction if needed. Restore the original reference link targets in finally. No network or upstream execution."
  Findings: |-
    Authoritative resumed baseline is clean writer HEAD9100ec1c after user integration of Writer and Calc, not the old A77JR3 close SHA. AP direct mode retained. No gateway user-instructions file found. Earlier read-only guesses content-frame.ts/cntfrm.ts/calbck path were absent; rerouted and discovered actual ssfrm.ts/sw/inc/calbck.ts. Prior checkpoint was completed progress. Native view-position selection calls Calc and relies on frame/page geometry and changed-client iteration; these are prerequisites to replacing margin cursor map faithfully and are explicitly not falsely represented by this no-view query.

    - Observation: Initial upstream-absent profile: related native tests and root tooling pass; typecheck and build fail because new fixture directly instantiates the protected SwLayoutFrame constructor. No production type or runtime failure.
      Impact: Runtime results and complete current coverage maps retained. Static build success must be re-established after correcting fixture. Earlier static result only checked pre-existing dist after failed build and is not accepted as the current build gate.
      Resolution: Producer4841 is terminal; restore targets confirmed by finally. Add a public constructor in a derived fixture using the real native base without method replacement or literal acceptance changes; rerun the changed fresh fixture only and failed typecheck/build plus current static build. Preserve prior passing related/tooling evidence and no full suite.

    - Observation: First fixture repair preserved all12 runtime cases but exposed a second static contract error: SwLayoutFrame requires SwFrameFormat, not SwContentNode. Production query and node maps remain unchanged and100.
      Impact: Protected-constructor access alone was insufficient; the wrong-type probe must use the actual SwFrame base whose constructor accepts the original modify owner. Build/static gate remains pending.
      Resolution: Both producers are terminal. Change only the fresh probe to derive from original SwFrame with a public constructor; preserve every literal and original assertion. Revalidate only its two body/cell cases plus targeted format/lint/type/build/current-static, without replaying the related set or other fresh cases.

    - Observation: Restored-source audit source-tree passes; source-provenance fails because the integrated shared ICU provenance now requires vendor/icu-reference, absent in this Writer environment. The same ignored source reference already exists through the approved vite-office vendor directory.
      Impact: Production tests, current whole-module coverage and final static gates already pass without all reference sources. Metadata audit needs the existing local ICU reference; no network, repository-source change or acceptance replay is necessary.
      Resolution: Reuse the existing approved vite-office source-reference boundary with an ignored Writer symlink to ../../vite-office/vendor/icu-reference. This is environment setup inside this task, not a separate repository task. Preserve original LibreOffice/mdds links, rerun only failed/unexecuted metadata gates and record exact audit evidence.
id_source: "generated"
---
## Summary

Restore the original content-node lookup boundary over actual registered native frames, including root and master/follow selection and exact original position routing. This is correction1 after full A77JR3. Previous goal turn completed and verified the full checkpoint; the resumed goal is active. No full run in this task.

## Scope

Production: new sw/source/core/layout/frmtool.ts and original sw/source/core/docnode/node.ts. Fresh native query tests; canonical runtime/provenance entries for both files and parent/task evidence. No changes to cursor measurements or acceptance values, coverage providers/thresholds, registered recovery/open/save/settings differences or unrelated Calc code.

## Plan

Read pinned GetFrameOfModify and SwContentNode::getLayoutFrame. Port the actual no-view-position query using original listener/frame/root/flow owners and original SwPosition. Add native literal/identity cases for body and cells, competing roots and masters, missing/non-frame/wrong-type clients, follows at boundary ties, destruction and same-document identity. Update canonical inventory with explicit omitted view geometry/Calc/iterator reentry/multi-listener responsibilities; keep all old status/default/classification/evidence. Run only targeted related tests and whole changed-module 100 percent coverage, static checks without references, then restored-source metadata gates. Record exact semantic review and close clean. Native cursor UI wiring and elimination of duplicate measured client registry remain subsequent work; no broad parity promotion.

## Verify Steps

1. Compare pinned frmtool.cxx GetFrameOfModify and node.cxx getLayoutFrame; retain native no-view first qualifying master/type/root and original GetFrameAtPos behavior. Confirm no suspicious source issue in represented branch.
2. With LibreOffice and mdds reference links physically absent run format/lint/TS7/dependencies/docs/file-size/build/static plus Vitest related tests for node.ts and new frmtool.ts with complete whole-file Istanbul maps, original 100 thresholds in all four metrics. Run new literal/identity cases and source-independent root tooling ownership/source-provenance/resource tests. Keep helpers/raw logs/maps only ignored cache and restore refs in finally.
3. Inspect all current raw IDs/locations/counters and source hashes; require whole changed files all-four100, all executed assertions pass and no skip/flaky/retry, old test files byte-identical, new query routes actual existing production node/frame objects and allocates no model/position copies. No broad full suite for correction1.
4. After restoration run source-tree/provenance/registry/resource-generation/invariants/parity/routing/doctor/diff metadata gates. Canonical historical semantics/defaults/classifications/registered IO exceptions unchanged.
5. Persist bounded evidence and exact semantic same-agent non-independent evaluator review; finish clean writer and leave broad goal active.

## Verification

Result: pass after scoped fixture and environment repairs. Original no-view-position GetFrameOfModify and SwContentNode.getLayoutFrame now borrow actual registered frame clients, use native type-mask/original root identity/master exclusion and original GetFrameAtPos routing. 13990 related cases in507 files, including12 fresh cases, and25 root tooling/resource cases in4 files pass (14015 unique). Entire two production modules current Istanbul100 all four metrics:93lines104statements35functions62branches,201 complete nonnegative integer raw counters. All863 old acceptance files byte-identical; existing two canonical histories/scalars/prefixes retained and two new source-mapped records added with unverified broad status. Actual retained/reflowed pagination queries borrow original objects without cursor-map publication or model/position copies. Native UI margin query integration/geometry/Calc/iterator order and full parity remain pending. Correction1 after the completed full checkpoint; no new full run.

Scope: sw/source/core/layout/frmtool.ts and sw/source/core/docnode/node.ts; fresh native-content-frame-query.test.ts and their canonical runtime/provenance records. Registered recovery/open/save/settings deviations retained.

Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run format:check
Result: pass

Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run lint
Result: pass

Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run typecheck
Result: initial fail; final causal fixture repair passes

Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run check:dependencies
Result: pass

Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run check:docs
Result: pass

Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run check:file-size
Result: pass

Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run build
Result: initial fail; final causal fixture repair passes

Command: cwd /Users/odubinkin/Projects/vite-office-writer; node scripts/check-static-build.mjs
Result: initial stale-dist result excluded; final current build static pass

Command: cwd /Users/odubinkin/Projects/vite-office-writer/apps/office; npm exec -- vitest related src/sw/source/core/docnode/node.ts src/sw/source/core/layout/frmtool.ts --run --coverage --coverage.include=src/sw/source/core/docnode/node.ts --coverage.include=src/sw/source/core/layout/frmtool.ts --coverage.reporter=json --coverage.reporter=json-summary --coverage.reportsDirectory=/Users/odubinkin/Projects/vite-office-writer/apps/office/node_modules/.cache/parity-coverage/QJTZN0/related-coverage --coverage.reportOnFailure --reporter=default --reporter=json --outputFile=/Users/odubinkin/Projects/vite-office-writer/apps/office/node_modules/.cache/parity-coverage/QJTZN0/related-tests.json
Result: pass

Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/native-writer-test-ownership.test.ts scripts/check-module-boundaries.test.ts scripts/writer-ui-resource-model.test.ts --reporter=default --reporter=json --outputFile=/Users/odubinkin/Projects/vite-office-writer/apps/office/node_modules/.cache/parity-coverage/QJTZN0/tooling-tests.json
Result: pass

Command: cwd /Users/odubinkin/Projects/vite-office-writer; /Users/odubinkin/Projects/vite-office-writer/node_modules/.bin/prettier --check apps/office/src/sw/source/core/layout/native-content-frame-query.test.ts
Result: pass

Command: cwd /Users/odubinkin/Projects/vite-office-writer; /Users/odubinkin/Projects/vite-office-writer/node_modules/.bin/eslint apps/office/src/sw/source/core/layout/native-content-frame-query.test.ts --max-warnings 0
Result: pass

Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run typecheck
Result: pass

Command: cwd /Users/odubinkin/Projects/vite-office-writer; npm run build
Result: pass

Command: cwd /Users/odubinkin/Projects/vite-office-writer; node scripts/check-static-build.mjs
Result: pass

Command: cwd /Users/odubinkin/Projects/vite-office-writer/apps/office; npm exec -- vitest run src/sw/source/core/layout/native-content-frame-query.test.ts -t "body/cell lookup" --reporter=default --reporter=json --outputFile=/Users/odubinkin/Projects/vite-office-writer/apps/office/node_modules/.cache/parity-coverage/QJTZN0/final-body-tests.json
Result: pass

Evidence: all runtime/static commands physically absent LibreOffice/mdds references; ICU did not exist until after tests for metadata. Both original links restored in finally. All related/root tests zero runtime failures/skips/todo; fresh12 fixture cases revalidated after protected-constructor repair; final two body/cell cases rerun after actual-base owner correction, with other10 fresh cases deliberately filtered and not replayed. No production changes after initial coverage, actual source hashes verified. No full test replay, threshold/provider/include/exclude source change, source/raw maps/helpers/Python in AgentPlane.

Evidence: entire module maps derived from unchanged raw current coverage-final.json SHA256 44a73362a0d8ff48738dfeed7c8dd375868261e7614a1e5f3d1d3a060b1fac0e. Exact production hashes {"apps/office/src/sw/source/core/docnode/node.ts":"0a03384579deabd8394538f5f78921bc55be7fa921671865afd79bc70a584710","apps/office/src/sw/source/core/layout/frmtool.ts":"b1689c2ccbb3fce55f4e39d6ad217290034d5424e15eb9295f8f6208c117bba2"}. All2805baseline tracked non-AgentPlane paths preserved except original node.ts plus its two intentional canonical append-only records; all863old acceptance files byte-identical. Exact old canonical scalar and history-prefix proof passes. No coverage filtering/map editing/counter rewrites/older source-map reuse.

Command: npm run check:source-tree
Command: npm run check:source-provenance
Command: npm run inventory:registry:check
Command: node_modules/.bin/tsx scripts/generate-writer-ui-resources.ts --check
Command: npm run inventory:invariants
Command: npm run inventory:parity
Command: node .agentplane/policy/check-routing.mjs
Command: ap doctor
Command: git diff --check
Result: all9 restored-source metadata gates pass. Initial provenance ENOENT ICU reference resolved by ignored symlink to existing approved vite-office vendor copy; no source modification, network or runtime replay.

Evidence paths: ignored apps/office/node_modules/.cache/parity-coverage/QJTZN0/{proof.json,results.json,repair-results.json,final-repair-results.json,audit-results.json,audit-final-results.json,execution-hashes.json,before-hashes.json,related-tests.json,tooling-tests.json,related-coverage/coverage-final.json}. Maps/logs/cache helper scripts remain only there.

Residual: SwIterator native client order/UnwrapMulti/reentry/deletion holders, view-position rectangles/distance/page query, Calc/fly formatting and native non-text content are not represented. SwCursor still uses measured cursor registry; this query is a native foundation, not a claim that UI margin integration or duplicate clients are resolved. Full root/page/content hierarchy/formatter/merged/geometry/table follows and overall core/UI parity incomplete. No suspicious source logic found in represented no-view branch; no suspected-issues entry fabricated. Same-agent non-independent exact semantic review pending; close clean writer and leave goal active.

## Rollback Plan

Revert this task semantic production and canonical-record diff through a separately approved traceable correction if needed. Restore the original reference link targets in finally. No network or upstream execution.

## Findings

Authoritative resumed baseline is clean writer HEAD9100ec1c after user integration of Writer and Calc, not the old A77JR3 close SHA. AP direct mode retained. No gateway user-instructions file found. Earlier read-only guesses content-frame.ts/cntfrm.ts/calbck path were absent; rerouted and discovered actual ssfrm.ts/sw/inc/calbck.ts. Prior checkpoint was completed progress. Native view-position selection calls Calc and relies on frame/page geometry and changed-client iteration; these are prerequisites to replacing margin cursor map faithfully and are explicitly not falsely represented by this no-view query.

- Observation: Initial upstream-absent profile: related native tests and root tooling pass; typecheck and build fail because new fixture directly instantiates the protected SwLayoutFrame constructor. No production type or runtime failure.
  Impact: Runtime results and complete current coverage maps retained. Static build success must be re-established after correcting fixture. Earlier static result only checked pre-existing dist after failed build and is not accepted as the current build gate.
  Resolution: Producer4841 is terminal; restore targets confirmed by finally. Add a public constructor in a derived fixture using the real native base without method replacement or literal acceptance changes; rerun the changed fresh fixture only and failed typecheck/build plus current static build. Preserve prior passing related/tooling evidence and no full suite.

- Observation: First fixture repair preserved all12 runtime cases but exposed a second static contract error: SwLayoutFrame requires SwFrameFormat, not SwContentNode. Production query and node maps remain unchanged and100.
  Impact: Protected-constructor access alone was insufficient; the wrong-type probe must use the actual SwFrame base whose constructor accepts the original modify owner. Build/static gate remains pending.
  Resolution: Both producers are terminal. Change only the fresh probe to derive from original SwFrame with a public constructor; preserve every literal and original assertion. Revalidate only its two body/cell cases plus targeted format/lint/type/build/current-static, without replaying the related set or other fresh cases.

- Observation: Restored-source audit source-tree passes; source-provenance fails because the integrated shared ICU provenance now requires vendor/icu-reference, absent in this Writer environment. The same ignored source reference already exists through the approved vite-office vendor directory.
  Impact: Production tests, current whole-module coverage and final static gates already pass without all reference sources. Metadata audit needs the existing local ICU reference; no network, repository-source change or acceptance replay is necessary.
  Resolution: Reuse the existing approved vite-office source-reference boundary with an ignored Writer symlink to ../../vite-office/vendor/icu-reference. This is environment setup inside this task, not a separate repository task. Preserve original LibreOffice/mdds links, rerun only failed/unexecuted metadata gates and record exact audit evidence.

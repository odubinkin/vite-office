---
id: "202610111710-QJTZN0"
title: "Restore native content-node layout-frame lookup"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
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
doc_updated_at: "2026-10-11T17:11:41.674Z"
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
  Verification: "Pending native implementation and targeted current-source verification. Full upstream parity remains incomplete."
  Rollback Plan: "Revert this task semantic production and canonical-record diff through a separately approved traceable correction if needed. Restore the original reference link targets in finally. No network or upstream execution."
  Findings: "Authoritative resumed baseline is clean writer HEAD9100ec1c after user integration of Writer and Calc, not the old A77JR3 close SHA. AP direct mode retained. No gateway user-instructions file found. Earlier read-only guesses content-frame.ts/cntfrm.ts/calbck path were absent; rerouted and discovered actual ssfrm.ts/sw/inc/calbck.ts. Prior checkpoint was completed progress. Native view-position selection calls Calc and relies on frame/page geometry and changed-client iteration; these are prerequisites to replacing margin cursor map faithfully and are explicitly not falsely represented by this no-view query."
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

Pending native implementation and targeted current-source verification. Full upstream parity remains incomplete.

## Rollback Plan

Revert this task semantic production and canonical-record diff through a separately approved traceable correction if needed. Restore the original reference link targets in finally. No network or upstream execution.

## Findings

Authoritative resumed baseline is clean writer HEAD9100ec1c after user integration of Writer and Calc, not the old A77JR3 close SHA. AP direct mode retained. No gateway user-instructions file found. Earlier read-only guesses content-frame.ts/cntfrm.ts/calbck path were absent; rerouted and discovered actual ssfrm.ts/sw/inc/calbck.ts. Prior checkpoint was completed progress. Native view-position selection calls Calc and relies on frame/page geometry and changed-client iteration; these are prerequisites to replacing margin cursor map faithfully and are explicitly not falsely represented by this no-view query.

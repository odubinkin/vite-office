---
id: "202610140558-J7J6FY"
title: "Restore native table flow links and follow constructor"
status: "DOING"
priority: "high"
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
  updated_at: "2026-10-14T05:59:45.358Z"
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
    body: "Start: reuse original SwFlowFrame component for table flow links and native follow constructor/master lookup; copied table has no rows, split invalidation is master-only. No new adapter/map/manager. Cycle 6/10."
events:
  -
    type: "status"
    at: "2026-10-14T06:00:23.790Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reuse original SwFlowFrame component for table flow links and native follow constructor/master lookup; copied table has no rows, split invalidation is master-only. No new adapter/map/manager. Cycle 6/10."
doc_version: 3
doc_updated_at: "2026-10-14T06:00:23.790Z"
doc_updated_by: "CODER"
description: "Cycle 6/10 prerequisite for actual physical table follows: existing SwFlowFrame component supplies table flow links, original SwTabFrame follow constructor inserts before prior follow without row clone, FindMaster scans original registered table frames, native layout-split reaction excludes follows. One original module, no new manager/adapter/map or visible feature. Preserve registered IO/recovery/Space and all old acceptance."
sections:
  Summary: "Restore original native table flow links, follow constructor and master lookup over existing table format clients."
  Scope: "Production one existing tabfrm.ts, two canonical writer runtime/provenance records; two fresh native source/browser suites. All old acceptance byte-identical. Existing SwFlowFrame component reused, no new module/manager/state map/input engine. Correction 6/10."
  Plan: "Represent native multiple inheritance through the same original SwFlowFrame component pattern already used by content frames. Table exposes typed original GetFollow/GetPrecede/HasFollow/IsFollow/SetFollow, FindMaster scans original registered table frames with default immediate predecessor or original first-master mode. Constructor accepts original SwTable plus sibling or original SwTabFrame follow-copy path; latter uses original frame format/root/table and inserts itself ahead of prior follow with no lower allocation. Actual table DestroyImpl releases lowers/registration and flow neighbors without stitching or recursively destroying other follows, as source flow destructor does. RES_LAYOUT_SPLIT position invalidation occurs only on non-follow, preserving copied descriptor consumption and master behavior."
  Verify Steps: "Read pin tabfrm.cxx master/follow constructors and split reaction, flowfrm.cxx constructor/destructor/SetFollow and table FindMaster, tabfrm.hxx follow contract. Fresh actual native document/root tests cover absent default links, copy identity/root/format/table, no row/cell duplication, insertion before prior follow, first/immediate registered master search and independent roots/chains/lost links, replacement/rechaining, first/middle/last destruction, actual native split notifications and copy-owned descriptor consumption. Fresh actual layout-owned master and borrowed table renderer confirm follow-copy creates no paint lower graph and never substitutes original UI/master identity; explicit native row transfer uses existing links only. Four references physically absent per producer and finally exactrestore. Whole current tabfrm.ts original Istanbul 100% four metrics/positive counters; new+related once and meaningful new/failure-only closure, tooling/current native table Chromium; scoped format/full lint/final TS7/JSDoc/size/deps/build/static. Restored-reference nine metadata gates source-tree/provenance/registry/resources--check/invariants/parity/routing/doctor/diff. All old test bytes and canonical history/scalar/status/default/classification prefixes retained; only exact source-backed obsolete live refs may follow their actual code with recorded move, no alias stub. Accepted source/build/raw-map hashes, same-agent non-independent quality and clean finish. Cycle 6/10; upcoming full continues, following full pauses after repairs."
  Verification: "Pending native original table flow contract and browser integration evidence."
  Rollback Plan: "Revert only scoped semantic commit without rewriting history. Exact four symlink restoration in finally; no upstream/helper/rawsource artifacts in Agentplane, no network/global access/publication/setup tasks."
  Findings: "Writer clean at 8f98bee33755 after actual UI master sharing. Pin9bc445578031fecf56086729d8e4940c77e14d65. SwTabFrame native inherits SwFlowFrame, its follow constructor borrows original format/root/table, starts without rows and inserts into original flow chain. Current represented table has no flow component or follow constructor and treats all split notifications as master. Existing content uses an original flow component, so reuse that pattern without new layer. Source FindMaster scans original registered table frame objects (first master optionally follows actual links). This is a prerequisite contract for physical pagination/row transfer; current root paginator does not yet create native physical follows and pointer ownership remains separate, not a complete page/master/follow/paint/hit parity claim. Native flags/locks/content insertion and geometry remain unverified. No suspected source core bug observed. Protected IO/recovery/Space unchanged."
id_source: "generated"
---
## Summary

Restore original native table flow links, follow constructor and master lookup over existing table format clients.

## Scope

Production one existing tabfrm.ts, two canonical writer runtime/provenance records; two fresh native source/browser suites. All old acceptance byte-identical. Existing SwFlowFrame component reused, no new module/manager/state map/input engine. Correction 6/10.

## Plan

Represent native multiple inheritance through the same original SwFlowFrame component pattern already used by content frames. Table exposes typed original GetFollow/GetPrecede/HasFollow/IsFollow/SetFollow, FindMaster scans original registered table frames with default immediate predecessor or original first-master mode. Constructor accepts original SwTable plus sibling or original SwTabFrame follow-copy path; latter uses original frame format/root/table and inserts itself ahead of prior follow with no lower allocation. Actual table DestroyImpl releases lowers/registration and flow neighbors without stitching or recursively destroying other follows, as source flow destructor does. RES_LAYOUT_SPLIT position invalidation occurs only on non-follow, preserving copied descriptor consumption and master behavior.

## Verify Steps

Read pin tabfrm.cxx master/follow constructors and split reaction, flowfrm.cxx constructor/destructor/SetFollow and table FindMaster, tabfrm.hxx follow contract. Fresh actual native document/root tests cover absent default links, copy identity/root/format/table, no row/cell duplication, insertion before prior follow, first/immediate registered master search and independent roots/chains/lost links, replacement/rechaining, first/middle/last destruction, actual native split notifications and copy-owned descriptor consumption. Fresh actual layout-owned master and borrowed table renderer confirm follow-copy creates no paint lower graph and never substitutes original UI/master identity; explicit native row transfer uses existing links only. Four references physically absent per producer and finally exactrestore. Whole current tabfrm.ts original Istanbul 100% four metrics/positive counters; new+related once and meaningful new/failure-only closure, tooling/current native table Chromium; scoped format/full lint/final TS7/JSDoc/size/deps/build/static. Restored-reference nine metadata gates source-tree/provenance/registry/resources--check/invariants/parity/routing/doctor/diff. All old test bytes and canonical history/scalar/status/default/classification prefixes retained; only exact source-backed obsolete live refs may follow their actual code with recorded move, no alias stub. Accepted source/build/raw-map hashes, same-agent non-independent quality and clean finish. Cycle 6/10; upcoming full continues, following full pauses after repairs.

## Verification

Pending native original table flow contract and browser integration evidence.

## Rollback Plan

Revert only scoped semantic commit without rewriting history. Exact four symlink restoration in finally; no upstream/helper/rawsource artifacts in Agentplane, no network/global access/publication/setup tasks.

## Findings

Writer clean at 8f98bee33755 after actual UI master sharing. Pin9bc445578031fecf56086729d8e4940c77e14d65. SwTabFrame native inherits SwFlowFrame, its follow constructor borrows original format/root/table, starts without rows and inserts into original flow chain. Current represented table has no flow component or follow constructor and treats all split notifications as master. Existing content uses an original flow component, so reuse that pattern without new layer. Source FindMaster scans original registered table frame objects (first master optionally follows actual links). This is a prerequisite contract for physical pagination/row transfer; current root paginator does not yet create native physical follows and pointer ownership remains separate, not a complete page/master/follow/paint/hit parity claim. Native flags/locks/content insertion and geometry remain unverified. No suspected source core bug observed. Protected IO/recovery/Space unchanged.

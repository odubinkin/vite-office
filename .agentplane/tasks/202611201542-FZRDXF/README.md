---
id: "202611201542-FZRDXF"
title: "Set browser cache headers for Docker assets"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "ops"
verify:
  - "Check nginx cache rules against built font and script paths and verify missing assets return 404 without cache headers, using nginx locally if available."
  - "git diff --check -- nginx/default.conf"
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T15:43:22.359Z"
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
    body: "Start: Configure immutable browser caching for Docker-served fonts and versioned scripts."
events:
  -
    type: "status"
    at: "2026-11-20T15:43:25.109Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Configure immutable browser caching for Docker-served fonts and versioned scripts."
doc_version: 3
doc_updated_at: "2026-11-20T15:43:25.109Z"
doc_updated_by: "CODER"
description: "Set one-year immutable caching for font files and 30-day immutable caching for hashed application scripts in nginx."
sections:
  Summary: |-
    Set browser cache headers for Docker assets

    Set one-year immutable caching for font files and 30-day immutable caching for hashed application scripts in nginx.
  Scope: "The Docker runtime nginx configuration, nginx/default.conf, and this task record."
  Plan: "Add immutable browser caching for font files and content-hashed JavaScript, then verify location matching and cache header scope against the existing build."
  Verify Steps: |-
    1. Run git diff --check -- nginx/default.conf.
    2. Check that the font and hashed script location rules match files in the existing Vite build, reject missing files with 404, and set cache headers only on eligible responses. Use nginx for HTTP checks if a local executable or image is already available.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the two nginx cache location blocks."
  Findings: ""
id_source: "generated"
---
## Summary

Set browser cache headers for Docker assets

Set one-year immutable caching for font files and 30-day immutable caching for hashed application scripts in nginx.

## Scope

The Docker runtime nginx configuration, nginx/default.conf, and this task record.

## Plan

Add immutable browser caching for font files and content-hashed JavaScript, then verify location matching and cache header scope against the existing build.

## Verify Steps

1. Run git diff --check -- nginx/default.conf.
2. Check that the font and hashed script location rules match files in the existing Vite build, reject missing files with 404, and set cache headers only on eligible responses. Use nginx for HTTP checks if a local executable or image is already available.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the two nginx cache location blocks.

## Findings

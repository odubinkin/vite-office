---
id: "202609090609-T8H5Y8"
title: "Serve suite routes through nginx SPA fallback"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "ops"
verify:
  - "docker build --tag vite-office:spa-fallback-verify ."
  - "docker run --rm --detach --name vite-office-spa-fallback-verify --publish 127.0.0.1:4180:80 vite-office:spa-fallback-verify"
  - "curl --fail --silent --show-error http://127.0.0.1:4180/ http://127.0.0.1:4180/writer http://127.0.0.1:4180/calc --output /dev/null"
  - "docker stop vite-office-spa-fallback-verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-09T06:10:48.682Z"
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
    body: "Start: Add the approved nginx SPA fallback and verify it through a locally built Docker image and HTTP probes."
events:
  -
    type: "status"
    at: "2026-09-09T06:10:57.891Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Add the approved nginx SPA fallback and verify it through a locally built Docker image and HTTP probes."
doc_version: 3
doc_updated_at: "2026-09-09T06:10:57.891Z"
doc_updated_by: "CODER"
description: "Configure the production nginx image so direct requests to /writer, /calc, and other client-side suite routes serve index.html instead of returning 404, while missing static assets still return 404."
sections:
  Summary: |-
    Serve suite routes through nginx SPA fallback

    Configure the production nginx image so direct requests to /writer, /calc, and other client-side suite routes serve index.html instead of returning 404, while missing static assets still return 404.
  Scope: |-
    - In scope: nginx SPA fallback configuration, Dockerfile wiring, and verification against a locally built/running production container.
    - Out of scope: React source changes, unit tests, Playwright E2E tests, live-server deployment, and reverse-proxy changes outside this repository.
    - Network use is approved only for pulling Docker build dependencies required by the local image build.
  Plan: "Add and wire a minimal nginx SPA fallback for application paths, preserve true 404 responses under /assets, and validate only through a real Docker build plus HTTP probes of the running container as explicitly requested."
  Verify Steps: |-
    1. Run `docker build --tag vite-office:spa-fallback-verify .`. Expected: the production image builds successfully using the new nginx configuration.
    2. Run `docker run --rm --detach --name vite-office-spa-fallback-verify --publish 127.0.0.1:4180:80 vite-office:spa-fallback-verify`. Expected: the container starts and publishes nginx locally.
    3. Run `curl --fail --silent --show-error http://127.0.0.1:4180/ http://127.0.0.1:4180/writer http://127.0.0.1:4180/calc --output /dev/null`. Expected: all three application paths return successful responses.
    4. Extract the emitted JavaScript asset path from `/`, request it, and request `/assets/missing.js`. Expected: the real asset returns 200 and the missing asset returns 404 rather than index.html.
    5. Run `docker stop vite-office-spa-fallback-verify`. Expected: the temporary `--rm` container stops and is removed.
    6. Run `git diff --check` and `git status --short --untracked-files=all`. Expected: no whitespace errors or unintended artifacts; only Dockerfile, the nginx configuration, and task artifacts are changed.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task commit that adds the nginx configuration and Dockerfile copy instruction, rebuild the prior image, and redeploy it. Stop and remove any temporary local verification container."
  Findings: ""
id_source: "generated"
---
## Summary

Serve suite routes through nginx SPA fallback

Configure the production nginx image so direct requests to /writer, /calc, and other client-side suite routes serve index.html instead of returning 404, while missing static assets still return 404.

## Scope

- In scope: nginx SPA fallback configuration, Dockerfile wiring, and verification against a locally built/running production container.
- Out of scope: React source changes, unit tests, Playwright E2E tests, live-server deployment, and reverse-proxy changes outside this repository.
- Network use is approved only for pulling Docker build dependencies required by the local image build.

## Plan

Add and wire a minimal nginx SPA fallback for application paths, preserve true 404 responses under /assets, and validate only through a real Docker build plus HTTP probes of the running container as explicitly requested.

## Verify Steps

1. Run `docker build --tag vite-office:spa-fallback-verify .`. Expected: the production image builds successfully using the new nginx configuration.
2. Run `docker run --rm --detach --name vite-office-spa-fallback-verify --publish 127.0.0.1:4180:80 vite-office:spa-fallback-verify`. Expected: the container starts and publishes nginx locally.
3. Run `curl --fail --silent --show-error http://127.0.0.1:4180/ http://127.0.0.1:4180/writer http://127.0.0.1:4180/calc --output /dev/null`. Expected: all three application paths return successful responses.
4. Extract the emitted JavaScript asset path from `/`, request it, and request `/assets/missing.js`. Expected: the real asset returns 200 and the missing asset returns 404 rather than index.html.
5. Run `docker stop vite-office-spa-fallback-verify`. Expected: the temporary `--rm` container stops and is removed.
6. Run `git diff --check` and `git status --short --untracked-files=all`. Expected: no whitespace errors or unintended artifacts; only Dockerfile, the nginx configuration, and task artifacts are changed.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task commit that adds the nginx configuration and Dockerfile copy instruction, rebuild the prior image, and redeploy it. Stop and remove any temporary local verification container.

## Findings

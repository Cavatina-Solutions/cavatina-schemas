# Project

The single source of truth for Cavatina Solutions' public JSON Schemas. What needs doing is in
`WORK-ITEMS.md`; what has been noticed and might be a problem is in `CONCERNS.md`.

---

## Purpose

So that any system, product or domain at Cavatina that publishes a schema — for internal teams,
partners or external consumers — publishes it in one place, under one set of rules, at a URL that
can be referenced and relied on.

## Premise

A schema's path in this repo is its path on `https://schemas.cavatinasolutions.com/`, and its `$id`
is that URL. Files are served as they are, with no build step, so what is reviewed here is exactly
what consumers fetch.

A published URL is a contract. Only the major version is a URL; minors are edited in place and may
only ever accept more than before, so a consumer pinned to `v1` keeps validating what it validated.
A breaking change is a new file beside the old one, never an edit to it.

The rules that can be checked mechanically are checked by `scripts/verify.ts` rather than by review.

## What it does

- Holds one top-level folder per domain, each with an `index.md` explaining its schemas. `socius/`
  is the only domain so far: the contracts for Socius engineering knowledge artifacts.
- Verifies every schema on every pull request and push to `main`: it parses, it is Draft 2020-12,
  it compiles with every `$ref` resolving locally, its `$id` mirrors its path, its `$comment`
  carries a minor that agrees with its filename, and its domain has an `index.md`.

## Requirements and acceptance criteria

- **Every schema is YAML and a valid Draft 2020-12 document.**
- **Every `$id` is the file's published URL**, and every cross-schema `$ref` is an absolute URL
  against the published domain.
- **A published major keeps resolving to a compatible contract.** Earlier majors stay published.
  A domain that declares itself pre-stable in its `index.md` is exempt until it says otherwise.
- **`make verify` passes**, locally and in CI.

## Assumptions

- **Schemas are fetched rather than vendored.** A consumer holding a stale copy of `v1` behaves as
  though pinned to an old minor, and starts rejecting documents that use newer optional properties.
- **Consumers resolve `$ref`s against these URLs**, or register every schema first the way the
  verifier does. Anything that does neither tries to fetch over the network.
- **Referential integrity between artifacts is the consumer's to check.** IDs linking one Socius
  artifact to another are plain strings that no schema can resolve.

## Scope

- Not the artifacts themselves: those live wherever their authors keep them. This repo holds only
  the contracts.
- Not a validator or SDK for consumers.
- No build or generated output. What is committed is what is served.

## Deviations

None.

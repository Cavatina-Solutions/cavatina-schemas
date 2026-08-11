# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Orientation

A schema registry, not an application. The only code here is the verification script; every other change is a schema edit.

- **Conventions** (layout, naming, `$id`, versioning): see [README.md](README.md).
- **A domain's own model** (what its schemas mean and how they relate): see that domain's `index.md`, e.g. [socius/index.md](socius/index.md).

Read those first. The rest of this file is only what they don't cover.

## Commands

```bash
npm install       # once
npm test          # verify every schema — run after any schema edit
npm run typecheck # type-check scripts/ (npm test does not)
```

`npm test` runs [`scripts/verify.ts`](scripts/verify.ts) directly through Node's TypeScript support. It reports every problem it finds at once and exits non-zero. Add a check there rather than writing a one-off script.

Node strips types without checking them, so a type error won't fail `npm test` — run `npm run typecheck` after editing anything under `scripts/`.

CI runs both on every PR and on pushes to `main` ([`.github/workflows/verify.yml`](.github/workflows/verify.yml)).

## Working notes

- **`$id` is mechanically derived from the file's path** under `https://schemas.cavatinasolutions.com/`. Anything that moves a file must update its `$id` to match.
- **`$id`s are absolute and cross-referenced**, so any rename or restructure is a coordinated pass across every file that refs the old URL. A partial one would break ref resolution silently — `npm test` is what catches it.
- **`$ref`s resolve locally only because the verifier registers every schema before compiling.** Anything that validates these files has to do the same, or it will try to fetch the published URLs over the network.
- **External consumers pin to `$id`s.** Changing what a published URL resolves to is a breaking change; adding a version alongside it isn't. See [Versioning](README.md#versioning) for what counts as contract-altering.

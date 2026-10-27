# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Orientation

A schema registry, not an application. The only code here is the verification script; every other change is a schema edit.

- **Conventions** (layout, naming, `$id`, versioning): see [README.md](README.md).
- **A domain's own model** (what its schemas mean and how they relate): see that domain's `index.md`, e.g. [socius/index.md](socius/index.md).
- **How we work, and the tooling that enforces it**: the `socius-artifacts/` submodule; its [README](socius-artifacts/README.md) covers updating it. This repo's own records are in `.socius/`.

Read those first. The rest of this file is only what they don't cover.

## Commands

```bash
nvm use && make install # once
make test               # verify every schema — run after any schema edit
make verify             # format-check, lint, typecheck and test, as CI runs it
make help               # every target
```

`make test` runs [`scripts/verify.ts`](scripts/verify.ts) through tsx. It reports every problem it finds at once and exits non-zero. Add a check there rather than writing a one-off script.

tsx compiles without checking types, so a type error won't fail `make test` — run `make verify` after editing anything under `scripts/`.

Commits go through `make commit`; the allowed scopes are in [`commitlint.config.ts`](commitlint.config.ts).

CI runs `make verify` on every PR and on pushes to `main` ([`.github/workflows/verify.yml`](.github/workflows/verify.yml)).

## Working notes

- **`$id` is mechanically derived from the file's path** under `https://schemas.cavatinasolutions.com/`. Anything that moves a file must update its `$id` to match.
- **`$id`s are absolute and cross-referenced**, so any rename or restructure is a coordinated pass across every file that refs the old URL. A partial one would break ref resolution silently — `make test` is what catches it.
- **`$ref`s resolve locally only because the verifier registers every schema before compiling.** Anything that validates these files has to do the same, or it will try to fetch the published URLs over the network.
- **External consumers pin to `$id`s.** Changing what a published URL resolves to is a breaking change; adding a version alongside it isn't. See [Versioning](README.md#versioning) for what counts as contract-altering.

# Work items

Everything known to need doing here. Status is the section an item sits in.

---

## To do

### Document hosting and publishing

**Depends on:** nothing

**Relates to:** Requirements — "Every `$id` is the file's published URL"

The README's "Publishing" section is a placeholder. Write down how `schemas.cavatinasolutions.com`
is served from this repo (the `CNAME` suggests GitHub Pages), what triggers a publish, and how
long a change takes to reach consumers.

### Settle the Socius v1 contracts

**Depends on:** nothing

**Relates to:** Requirements — "A published major keeps resolving to a compatible contract"

`socius/index.md` declares the domain pre-stable: which properties belong on which artifact type,
and which are required, is still open. Settle them, then remove the pre-stable note so the
versioning rules apply as written.

---

## In progress

---

## Done

### Put the repo on the Socius toolchain

**Depends on:** nothing

**Relates to:** Requirements — "`make verify` passes"

Vendored `socius-artifacts/` and declared `git-hooks` and `make-ts-tools`. Moved from npm to yarn,
took the Prettier, EditorConfig, ESLint, commitlint, husky, tsconfig and Claude settings samples,
fronted every task with make, and ran the verifier through tsx. CI runs `make verify`.

### Provide `NPM_GITHUB_TOKEN` to CI

**Depends on:** nothing

**Relates to:** Requirements — "`make verify` passes"; concern "CI may not be able to read the
Cavatina packages"

`.github/workflows/verify.yml` installs with `secrets.NPM_GITHUB_TOKEN`, a personal access token
with `read:packages`, which is now available to this repository's Actions. The workflow's own
token cannot read packages published from other repositories, so the secret is what lets
`make install` fetch the `@cavatina-solutions` packages.

# Concerns

Anything noticed that might be a problem. Status is the section a concern sits in.

---

## Raised

---

## Analysed

### CI may not be able to read the Cavatina packages

**Relates to:** Requirements — "`make verify` passes"; work item "Provide `NPM_GITHUB_TOKEN` to
CI"

**Outcome:** real. CI was wired with the workflow's own `github.token`, where `socius-artifacts`
uses the `NPM_GITHUB_TOKEN` secret. The workflow now passes that secret, and making it available
is the work item.

The ESLint config needs `@cavatina-solutions/eslint-plugin` and `@cavatina-solutions/core` from
GitHub Packages, so `make install` needs a token with `read:packages`.

### The verifier's exclusions are a hand-kept list

**Relates to:** Requirements — "Every schema is YAML and a valid Draft 2020-12 document"

**Outcome:** not a problem. A folder missing from `NOT_SCHEMAS` fails verification loudly and
names itself, so it is caught on the first run rather than slipping through.

`scripts/verify.ts` treats every top-level folder as a domain unless it is in `NOT_SCHEMAS`.
Adding `socius-artifacts/` failed verification on its YAML until it was listed.

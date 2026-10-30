# Concerns

Anything noticed that might be a problem. Status is the section a concern sits in.

---

## Raised

---

## Analysed

### Existing scoped artifacts without `sub_stack` now fail

**Relates to:** `socius-scoped-artifact.sub_stack`; work item "Update Practices indexes and
migration guidance"

`sub_stack` is required, with `general` for no specialization. Any scoped artifact already
written without it, in Practices or elsewhere, fails validation against the published v1 until it
states `sub_stack: general`.

**Outcome:** unfounded. No scoped artifacts have been written against these contracts yet.

### Records cite tests that are not in the repo

**Relates to:** work item "Decide long-term contract testing boundary"

The Done item "Verify and review the Socius schema feature branch" and the concern on Reference
item identity point at tests under `tests/unit/`, which were left out of `main` while that
boundary is decided.

**Outcome:** real. The records are true of the tests, not of `main`; they follow the tests to
wherever that work item puts them, and are corrected then.

### A Reference can link to a type that does not exist

**Relates to:** `socius/socius-reference/v1.yaml` → `related_artifacts[].type`

The type is checked against the shape of a type name, so `socius-standrd` passes. An enum of the
concrete types would catch it, at the cost of an edit to Reference whenever a type is added.

**Outcome:** real, and a choice between catching misspellings and editing Reference with every new
type. It belongs to settling the v1 contracts.

### A child can add to an inherited list but never narrow it

**Relates to:** `socius/index.md` → "Artifact inheritance"

**Outcome:** resolved. A child's array of primitive values replaces its parent's, so a child can
narrow a list by stating the shorter one. `apply_when` follows the same rule: a child's conditions
are its own. The index, the future notes and the tests say so.

### A resolved artifact still says its validation is deferred

**Relates to:** `socius/index.md` → "Artifact inheritance"

**Outcome:** resolved. `validation_deferred` is structural metadata, and a resolved artifact does
not carry it.

### Inheritance across major versions is impossible, and nothing says so

**Relates to:** `socius/index.md` → "Artifact inheritance"

**Outcome:** intended. Same type means the same `schema` value, major version included; the index
says so and a test asserts the mismatch fails.

### Item objects in the older schemas accept an empty object

**Relates to:** work item "Bring the older schemas up to the newer types' conventions"

**Outcome:** real. `measurements: [{}]` validates, and a Toolchain whose tools mix with and
without an `id` cannot be inherited.

### Two conventions name an artifact type

**Relates to:** work item "Bring the older schemas up to the newer types' conventions"

**Outcome:** resolved. Both name a type by its `schema` value without the version, such as
`socius-term`.

### Older schemas describe themselves in engineering terms

**Relates to:** work item "Bring the older schemas up to the newer types' conventions"

**Outcome:** real. Descriptions such as "Cavatina engineering knowledge artifacts" contradict the
index's organizational framing.

### Dates are free strings

**Relates to:** work item "Bring the older schemas up to the newer types' conventions"

**Outcome:** real. `format: date` is available now that formats are registered.

### Deferred validation is not yet a complete validation pipeline

**Relates to:** work item "Review inheritance validation and applicability semantics"

**Outcome:** smaller than it looked. Every level of a chain is validated in its resolved form,
not just the selected child, so every value a deferred child supplies is validated once it is
resolved, and a malformed value cannot hide behind a descendant. What a separate stored-overlay
pass would still add is earlier, stored-form diagnostics, and accepting a deferred child's `null`,
which removes an inherited value and which the schemas would otherwise reject. Whether that is worth a second validation mode is part
of the work item.

### Reference item identity is inconsistent with universal identified-array inheritance

**Relates to:** `socius-reference.items`

**Outcome:** resolved. Reference items require an `id`, and an inheriting Reference updates or adds
a fact by ID; `tests/unit/socius/socius-reference/v1.test.ts` asserts it.

### The test suite has not been executed and does not yet cover every artifact schema

**Relates to:** work item "Verify and review the Socius schema feature branch"

**Outcome:** resolved. The suite runs under `make test`, every artifact type has its own test,
and the inheritance rules are tested against every type.

### Approval status is not fully represented by decision backing

**Relates to:** work item "Define deviation approval workflow and migration guidance"

**Outcome:** real, and already that work item. The schema deliberately leaves approval to the
organization's Ways of Working.

### Inherited Guide step insertion remains undefined

**Relates to:** work item "Determine insertion ordering for inherited Guide instructions"

**Outcome:** resolved. The schema requires `order` on every instruction of an ordered Guide,
consumers reject a duplicate, and gaps are permitted.

### Inheritance conditions and independent validation need fixtures

**Relates to:** work item "Review inheritance validation and applicability semantics"

**Outcome:** the fixtures exist: independent and deferred completion are tested for every type,
and `apply_when` for Standards and Ways of Working. A child's `apply_when` replaces its parent's,
and a child's `null` removes an inherited value. How several conditions in one `apply_when`
combine is left to the applicability negotiation.

### HWC toolchain enforcement remains partly outside the current Toolchain contract

**Relates to:** parked work item "Reconcile Toolchain policy with operational tooling"

**Outcome:** real, and already parked as that work item.

### Reference content can age without explicit version metadata

**Relates to:** work item "Reconcile schema contracts with HWC migration examples"

**Outcome:** real, and waits on real migrated References to show which fields are needed,
which is that work item.

### Earlier Guide identity and Deviation authorization mismatches

**Outcome:** Resolved at the schema level. Guide instructions now require stable IDs, and Deviation Decision backing is optional. Ordered insertion and approval workflow remain separate raised concerns.

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

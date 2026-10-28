# Concerns

Anything noticed that might be a problem. Status is the section a concern sits in.

---

## Raised

### HWC deviation recording does not yet match formal authorization

**Relates to:** `socius-deviation`, `socius-decision`, HWC "Building and deploying" and "Redux"

**Finding:** The HWC records project-specific departures in `PROJECT.md`, including hosting constraints and Redux choices. The new Deviation schema requires `authorized_by` referencing a formal Decision. That is a stronger requirement than the current stopgap practice and needs an explicit transition/approval model. Do not silently convert every HWC "exception" into a Deviation; some are qualifications inside an expectation, and others are platform-specific Standards.

### Guide instructions cannot be selectively inherited by ID

**Relates to:** `socius-guide`, universal `inherits`

**Finding:** Guide instructions have `name` and `instructions` but no `id`. Under the agreed universal merge semantics, a child Guide replaces the full instruction array rather than extending/replacing individual instructions. This is consistent with the current schema but may be surprising if Guides are specialized. Needs a deliberate decision, not an automatic change.

### Inheritance conditions and independent validation need fixtures

**Relates to:** `socius-artifact`, `socius-standard`, `socius-way-of-working`, future resolver notes

**Finding:** Primitive arrays concatenate, including `apply_when`, but concatenation itself does not define AND/OR semantics. Required fields are repeated in independently valid children and replace parent values. The docs also describe null as retaining a parent value while current typed schemas generally reject null. Verify the behavior with concrete fixtures before treating the resolver semantics as settled.

### HWC toolchain enforcement remains partly outside the current Toolchain contract

**Relates to:** `socius-toolchain`, HWC "Tooling", "Formatting is not ours to have opinions about", and "Make is the interface"

**Finding:** The HWC treats canonical formatter/linter configurations, custom rules, make targets, and agent supplements as authoritative operational inputs. The Toolchain schema describes tools, versions, and exceptions but not all enforcement/detection/execution wiring. This is an acknowledged parked modeling boundary, not a reason to copy configuration rules into Standards.

### Reference content can age without explicit version metadata

**Relates to:** `socius-reference`, HWC vendor/platform constraints

**Finding:** The HWC records external behavior and vendor constraints that can change across versions. Reference items can describe those qualifications in prose, but no structured vendor-version or evidence field exists. Test real reference migration examples before adding fields.

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

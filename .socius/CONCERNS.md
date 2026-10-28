# Concerns

Anything noticed that might be a problem. Status is the section a concern sits in.

---

## Raised

### Approval status is not fully represented by decision backing

**Relates to:** `socius-deviation`, `backed_by_decision`, Ways of Working

**Finding:** A Deviation may be recorded before formal backing, and `backed_by_decision` is optional. A linked Decision provides evidence of support but is not by itself a universal approval-state machine. The organization's process must determine whether and when a documented departure can be acted upon.

### Inherited Guide step insertion remains undefined

**Relates to:** `socius-guide`, universal `inherits`

**Finding:** Guide instructions now have IDs for selective inheritance, but new child instructions have no explicit insertion point within an ordered inherited sequence. A deterministic ordering rule is still needed if such insertion is a supported use case.

### Inheritance conditions and independent validation need fixtures

**Relates to:** `socius-artifact`, `socius-standard`, `socius-way-of-working`, future resolver notes

**Finding:** Primitive arrays concatenate, including `apply_when`, but concatenation itself does not define AND/OR semantics. Deferred children can now omit required fields that inheritance supplies, but direct JSON Schema validation of incomplete stored children still fails. Inheritance-aware stored-overlay validation and full post-merge validation need fixtures. The docs also describe null as retaining a parent value while current typed schemas generally reject null.

### HWC toolchain enforcement remains partly outside the current Toolchain contract

**Relates to:** `socius-toolchain`, HWC "Tooling", "Formatting is not ours to have opinions about", and "Make is the interface"

**Finding:** The HWC treats canonical formatter/linter configurations, custom rules, make targets, and agent supplements as authoritative operational inputs. The Toolchain schema describes tools, versions, and exceptions but not all enforcement/detection/execution wiring. This is an acknowledged parked modeling boundary, not a reason to copy configuration rules into Standards.

### Reference content can age without explicit version metadata

**Relates to:** `socius-reference`, HWC vendor/platform constraints

**Finding:** The HWC records external behavior and vendor constraints that can change across versions. Reference items can describe those qualifications in prose, but no structured vendor-version or evidence field exists. Test real reference migration examples before adding fields.

---

## Analysed

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

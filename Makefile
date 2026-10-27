YARN = corepack yarn

.PHONY: help
help:
	@echo 'cavatina-schemas — common targets'
	@echo
	@echo '  make install           Install dependencies (immutable; use `make install frozen=false` to update the lockfile)'
	@echo '  make upgrade           Open the interactive dependency upgrade interface'
	@echo '  make commit            Commit through the guided prompt'
	@echo '  make format            Rewrite formatting with Prettier'
	@echo '  make format-check      Check formatting without writing'
	@echo '  make lint              Lint with ESLint, tolerating no warnings'
	@echo '  make lint-fix          Lint and autofix what ESLint can'
	@echo '  make typecheck         Typecheck without emitting'
	@echo '  make test              Verify every schema'
	@echo '  make precommit         The quick subset, for a pre-commit hook: format-check, lint'
	@echo '  make verify            Everything CI would run: format-check, lint, typecheck, test'
	@echo '  make clean             Remove node_modules'

.PHONY: install
install:
ifeq ($(frozen), false)
	$(YARN) install
else
	$(YARN) install --immutable
endif

.PHONY: upgrade
upgrade:
	$(YARN) upgrade-interactive

.PHONY: commit
commit:
	$(YARN) commit

.PHONY: format
format:
	$(YARN) format

.PHONY: format-check
format-check:
	$(YARN) format:check

.PHONY: lint
lint:
	$(YARN) lint

.PHONY: lint-fix
lint-fix:
	$(YARN) lint:fix

.PHONY: typecheck
typecheck:
	$(YARN) typecheck

.PHONY: test
test:
	$(YARN) test

# Named for the occasion rather than its contents, so a repo can put different checks behind it
# and the hook that calls it still means "the quick ones".
.PHONY: precommit
precommit: format-check lint

.PHONY: verify
verify: format-check lint typecheck test

.PHONY: clean
clean:
	rm -rfd ./node_modules

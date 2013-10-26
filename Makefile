MOCHA_OPTS = --check-leaks
REPORTER = dot

test:
	@./node_modules/.bin/mocha --reporter $(REPORTER) test/*.js

.PHONY: test
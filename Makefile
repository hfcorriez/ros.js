TESTS = test/test.js
REPORTER = spec
TIMEOUT = 2000
JSCOVERAGE = jscoverage
MOCHA = ./node_modules/mocha/bin/mocha

test:
	@npm install
	@NODE_ENV=test $(MOCHA) \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		$(TESTS)

coverage:
	@$(JSCOVERAGE) lib lib-cov
	@ROS_COV=1 $(MOCHA) -R html-cov $(TESTS) > coverage.html
	@rm -rf lib-cov

.PHONY: test
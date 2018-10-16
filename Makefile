CODECLIMATE = $(MOD_BIN)/codeclimate-test-reporter
MOD_BIN = ./node_modules/.bin
MOCHA = $(MOD_BIN)/_mocha
NYC = $(MOD_BIN)/nyc

help:											## Show this help.
	@echo ''
	@echo 'Available commands:'
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	@echo ''
.PHONY: help

gen-readme:								## Generate README.md (using docker-verb)
	docker run --rm -v ${PWD}:/opt/verb stefanwalther/verb
.PHONY: gen-readme

build:										## Build the docker image (production)
	docker build --force-rm -t sammlerio/auth-service -f Dockerfile.prod .
.PHONY: build

run:											## Run the docker image
	docker run -it sammlerio/auth-service
.PHONY: run

build-test:								## Build the docker image (test image)
	docker build --force-rm -t sammlerio/auth-service-test -f Dockerfile.test .
.PHONY: build-test

up:												## Get the stack up and running (docker-compose.dev.yml)
	docker-compose --f=docker-compose.dev.yml up
.PHONY: up

down:											## Stop the stack - dev environment (docker-compose down)
	docker-compose --f=docker-compose.dev.yml down -t 0
.PHONY: down

rs: down up
.PHONY: rs

up-test:									## Bring up the test environment (docker-compose up => docker-compose.test.yml)
	docker-compose --f=docker-compose.test.yml up -d
.PHONY: up-test

run-test:									## Run tests
	docker-compose --f=docker-compose.test.yml run auth-service-test npm run test
.PHONY: run-test

up-unit-tests:						## Bring up the test environment (docker-compose up => docker-
	docker-compose --f=docker-compose.unit-tests.yml up -d
.PHONY: up-unit-tests

build-run-unit-tests: build build-test						## Run unit tests, and build related images first
	docker-compose --f=docker-compose.unit-tests.yml run auth-service-test npm run test:unit
.PHONY: build-run-unit-tests

run-unit-tests:						## Run unit tests
	docker-compose --f=docker-compose.unit-tests.yml run auth-service-test npm run test:unit
.PHONY: run-unit-tests

run-integration-tests: 		## Run integration tests
	docker-compose --f=docker-compose.integration-tests.yml run auth-service-test npm run test:integration
.PHONY: run-integration-tests

build-run-integration-tests: build build-test 		## Run integration tests
	docker-compose --f=docker-compose.integration-tests.yml run auth-service-test npm run test:integration
.PHONY: build-run-integration-tests

down-test:								## Tear down the test environment (docker-compose down => docker-compose.test.yml)
	docker-compose --f=docker-compose.test.yml down
.PHONY: down-test

up-deps:									## Run services being dependent on
	docker-compose --f=docker-compose.deps.yml up
.PHONY: up-deps

rs-deps: down-deps up-deps
.PHONY: rs-deps

down-deps:								## Stop services being dependent on
	docker-compose --f=docker-compose.deps.yml down -t 0
.PHONY: down-deps

setup:
	@echo "Setup ... nothing here right now"
.PHONY: setup

test: build build-test run-unit-tests run-integration-tests
.PHONY: test

lint:											## lint everything
	npm run lint
.PHONY: lint

lint-fix: 								## lint & fix everything
	npm run lint:fix
.PHONY: lint-fix



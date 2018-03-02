CODECLIMATE = $(MOD_BIN)/codeclimate-test-reporter
MOD_BIN = ./node_modules/.bin
MOCHA = $(MOD_BIN)/_mocha
NYC = $(MOD_BIN)/nyc

help:								## Show this help.
	@echo ''
	@echo 'Available commands:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	@echo ''
.PHONY: help

gen-readme:					## Generate README.md (using docker-verb)
	docker run --rm -v ${PWD}:/opt/verb stefanwalther/verb
.PHONY: gen-readme

build:							## Build the docker image (production)
	docker build --force-rm -t sammlerio/auth-service -f Dockerfile.prod .
.PHONY: build

run:
	docker run -it sammlerio/auth-service
.PHONY: run

build-test:
	docker build --force-rm -t sammlerio/auth-service-test -f Dockerfile.test .
.PHONY: build-test

d-build:						## Build the docker image
	docker build --force-rm -t sammlerio/auth-service .
.PHONY: d-build

d-run:							## Run the docker image
	docker run -it sammlerio/auth-service
.PHONY: d-run

up:							## Get the stack up and running (docker-compose)
	docker-compose up
.PHONY: up

down:
	docker-compose down
.PHONY: down

up-test:
	docker-compose --f=docker-compose.test.yml up -d
.PHONY: up-test

run-test:
	docker-compose --f=docker-compose.test.yml run auth-service-test
.PHONY: run-test

up-unit-tests:
	docker-compose --f=docker-compose.unit-tests.yml up -d
.PHONY: up-unit-tests

run-unit-tests:
	docker-compose --f=docker-compose.unit-tests.yml run auth-service-test npm run test:unit
.PHONY: run-unit-tests

down-test:
	docker-compose --f=docker-compose.test.yml down
.PHONY: down-test

rs: down up
.PHONY: rs

up-deps:
	docker-compose --f=docker-compose.deps.yml up
.PHONY: up-deps

rs-deps: down-deps up-deps
.PHONY: rs-deps

down-deps:
	docker-compose --f=docker-compose.deps.yml down
.PHONY: down-deps

dc-up-test:
	docker-compose --f=docker-compose.test.yml up
.PHONY: dc-up-test

setup:
	@echo "Setup ... nothing here right now"
.PHONY: setup

test-unit:
	@NODE_ENV=test:unit
	#$(CODECLIMATE) < coverage/lcov.info
.PHONY: test-ci

lint:
	$(MOD_BIN)/eslint
.PHONY: lint



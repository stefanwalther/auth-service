help:								## Show this help.
	@echo ''
	@echo 'Available commands:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	@echo ''
.PHONY: help

gen-readme:					## Generate README.md (using docker-verb)
	docker run --rm -v ${PWD}:/opt/verb stefanwalther/verb
.PHONY: gen-readme

d-build:						## Build the docker image
	docker build --force-rm -t sammlerio/auth-service .
.PHONY: d-build

d-run:							## Run the docker image
	docker run -it sammlerio/auth-service
.PHONY: d-run

dc-up:							## Get the stack up and running (docker-compose)
	docker-compose up
.PHONY: dc-up

dc-down:
	docker-compose down
.PHONY: dc-down

dc-up-deps:
	docker-compose --f=docker-compose.deps.yml up
.PHONY: dc-up-deps

dc-down-deps:
	docker-compose --f=docker-compose.deps.yml down
.PHONY: dc-down-deps

dc-up-test:
	docker-compose --f=docker-compose.test.yml up
.PHONY: dc-up-test

setup:
	@echo "Setup ... nothing here right now"
.PHONY: setup

circleci-validate: 	## Validate the circleci config.
	circleci config validate
.PHONY: circleci-validate

circleci-build:			## Build circleci locally.
	circleci build
.PHONY: circleci-build



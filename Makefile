#!/usr/bin/make

RUN_ARGS := $(wordlist 2,100,$(MAKECMDGOALS))
$(eval $(RUN_ARGS):;@:)

.PHONY: help

help: ## Help
	@grep -E '(^[a-zA-Z0-9_-]+:.*?##.*$$)|(^##)' $(firstword $(MAKEFILE_LIST)) | awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}'

run: dev ## Start dev version

build: start-build ## Try to build project (usefull before commit)

run-install:
	npm install ${RUN_ARGS}

dev:
	npm run dev

up: ## Up docker
	docker compose up -d --build --remove-orphans

start-build:
	npm run build


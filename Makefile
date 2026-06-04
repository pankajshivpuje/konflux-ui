.PHONY: setup test lint type-check dev clean

setup: ## Set up development environment
	./setup.sh

test: ## Run unit tests
	yarn test

lint: ## Run linters
	yarn lint
	yarn lint:restricted-imports

type-check: ## Run TypeScript type checking
	yarn type-checks

dev: ## Start development server
	yarn start

clean: ## Clean build artifacts
	rm -rf dist coverage node_modules/.cache

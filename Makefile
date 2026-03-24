SHELL := /bin/bash

COMPOSE ?= docker compose
POSTGRES_SERVICE ?= postgres
TRACKING_DB_URL ?= postgres://postgres:postgres@localhost:5432/autoapply

.PHONY: help up down restart logs ps n8n-open migrate db-shell install-all lint-all

help:
	@echo "Available targets:"
	@echo "  make up          # Start postgres + n8n"
	@echo "  make down        # Stop and remove containers"
	@echo "  make restart     # Restart stack"
	@echo "  make logs        # Tail compose logs"
	@echo "  make ps          # List services"
	@echo "  make n8n-open    # Show n8n URL"
	@echo "  make migrate     # Apply job_applications migration"
	@echo "  make db-shell    # Open psql shell inside postgres container"
	@echo "  make install-all # npm install in all service packages"
	@echo "  make lint-all    # run npm run lint for all services"

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart: down up

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

n8n-open:
	@echo "Open: http://localhost:$${N8N_PORT:-5678}"

migrate:
	$(COMPOSE) exec -T $(POSTGRES_SERVICE) psql -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-autoapply} -f /docker-entrypoint-initdb.d/001_create_job_applications.sql

db-shell:
	$(COMPOSE) exec $(POSTGRES_SERVICE) psql -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-autoapply}

install-all:
	cd services/jd-analyzer && npm install
	cd services/resume-generator && npm install
	cd services/pdf-compiler && npm install
	cd services/auto-apply && npm install
	cd services/scraper/linkedin && npm install
	cd services/tracking && npm install

lint-all:
	cd services/jd-analyzer && npm run lint
	cd services/resume-generator && npm run lint
	cd services/pdf-compiler && npm run lint
	cd services/auto-apply && npm run lint
	cd services/scraper/linkedin && npm run lint
	cd services/tracking && npm run lint

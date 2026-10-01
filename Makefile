.PHONY: setup install seed test test-unit test-integration eval run-backend run-frontend dev

setup:
	python -m venv .venv
	.venv/Scripts/pip install -r backend/requirements.txt
	cd frontend && npm install

install:
	pip install -r backend/requirements.txt
	cd frontend && npm install

seed:
	python -m backend.app.seed.seeder

test:
	pytest backend/tests -v

test-unit:
	pytest backend/tests/unit -v

test-integration:
	pytest backend/tests/integration -v

eval:
	python -m backend.evaluation.runner

run-backend:
	uvicorn backend.app.main:app --reload --port 8000

run-frontend:
	cd frontend && npm run dev

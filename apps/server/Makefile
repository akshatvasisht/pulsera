.PHONY: install lint format format-check test check-types

install:
	python -m pip install -e ".[dev]"

lint:
	ruff check src tests

format:
	ruff format src tests
	black src tests

format-check:
	ruff check src tests
	black --check src tests

test:
	pytest

check-types:
	pyright


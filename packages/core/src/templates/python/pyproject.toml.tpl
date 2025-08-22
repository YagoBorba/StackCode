[project]
name = "{{projectName}}"
version = "1.0.0"
description = "{{description}}"
authors = [
    {name = "{{authorName}}", email = "user@example.com"}
]
dependencies = [
    "fastapi>=0.103.0",
    "uvicorn[standard]>=0.23.0",
    "pydantic>=2.3.0"
]
requires-python = ">=3.9"
readme = "README.md"
license = {text = "MIT"}

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.21.0",
    "black>=23.7.0",
    "isort>=5.12.0",
    "flake8>=6.0.0",
    "mypy>=1.5.0"
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.black]
line-length = 88
target-version = ['py39']

[tool.isort]
profile = "black"
line_length = 88

[tool.mypy]
python_version = "3.9"
warn_return_any = true
warn_unused_configs = true

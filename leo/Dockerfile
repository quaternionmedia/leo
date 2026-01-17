FROM python:3.11-slim

ENV UV_NO_SYNC_WARNING=1

WORKDIR /app

# Install uv to manage project dependencies
RUN pip install --no-cache-dir uv

COPY pyproject.toml README.md ./
COPY leo ./leo

# Install project dependencies using uv
RUN uv sync

# Expose the default API port
EXPOSE 8000

# Start the FastAPI app via the project CLI for consistent behavior
CMD ["uv", "run", "leo", "serve", "--host", "0.0.0.0", "--port", "8000", "--reload"]

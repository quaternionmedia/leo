FROM python:3.11-slim

WORKDIR /app

ENV PATH=/app/node_modules/.bin:$PATH

# Install system dependencies and Node.js for the frontend toolchain
RUN apt-get update \
	&& apt-get install -y nodejs npm \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/*

# Install uv to drive project workflows
RUN pip install --no-cache-dir uv

COPY pyproject.toml README.md ./
COPY leo ./leo

# Install Python dependencies (including the CLI entrypoint)
RUN uv sync

COPY package.json package-lock.json vite.config.js ./
COPY src ./src
COPY styles ./styles
COPY static ./static
COPY pdf ./pdf
COPY setlist.csv ./setlist.csv
COPY docs ./docs
COPY METRONOME_INTEGRATION.md ./METRONOME_INTEGRATION.md

# Install Node dependencies for the frontend
RUN npm ci

EXPOSE 1234

# Run the Vite dev server via the project CLI for consistency
CMD ["uv", "run", "leo", "serve-frontend", "--host", "0.0.0.0", "--port", "1234"]

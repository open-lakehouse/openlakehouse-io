# openlakehouse-io — task runner
# Run `just` or `just --list` to see available recipes.

# Package manager used by this project.
pm := "bun"

# Default recipe: list available commands.
default:
    @just --list

# Install dependencies.
install:
    {{pm}} install

# Run the Vite dev server.
dev:
    {{pm}} run dev

# Build the production bundle.
build:
    {{pm}} run build

# Build using development mode.
build-dev:
    {{pm}} run build:dev

# Preview the production build locally.
preview:
    {{pm}} run preview

# Lint the codebase.
lint:
    {{pm}} run lint

# Run the test suite once.
test:
    {{pm}} run test

# Run tests in watch mode.
test-watch:
    {{pm}} run test:watch

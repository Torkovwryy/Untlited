# Contributing to Xelus

We love your input! We want to make contributing to Xelus as easy and transparent as possible.

## Development Setup

We use Node.js 20+ and Yarn (Berry).

1. Clone the repository.
2. Enable Corepack: `corepack enable`
3. Install dependencies: `yarn install`
4. Run tests: `yarn test:cov`

## Commit Convention

This project enforces [Conventional Commits](https://www.conventionalcommits.org/). Your commits will be rejected by our Husky hooks if they do not follow this standard.

Good examples:
- `feat(core): add retry middleware`
- `fix(adapter): resolve timeout abortion bug`
- `docs: update readme with middleware examples`

## Pull Request Process

1. Ensure all tests pass with `yarn test:cov` (we require 90%+ coverage).
2. Ensure linting passes with `yarn lint`.
3. Open a PR against the `main` branch.
4. CI will run. Once it's green, a maintainer will squash and merge your code.

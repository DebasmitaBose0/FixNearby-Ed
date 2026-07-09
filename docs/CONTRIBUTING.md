# Contributing to FixNearby

We love your input! We want to make contributing to FixNearby as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features

## Our Development Process

We use GitHub issues to track public bugs and features. All active development happens in feature branches.

### Pull Requests

1. Fork the repo and create your branch from `master`.
2. Implement your changes following our [**Developer Guide**](./DEVELOPER_GUIDE.md).
3. Keep changes focused and isolated.
4. Verify your changes with local tests (`npm test` and `npm run test:new` in `server/`).
5. Ensure the client builds without errors (`cd client && npm run build`).
6. Submit a pull request!

The CI pipeline (defined in `.github/workflows/`) will automatically run tests, linting, and a production build check against your PR. All checks must pass before merging.

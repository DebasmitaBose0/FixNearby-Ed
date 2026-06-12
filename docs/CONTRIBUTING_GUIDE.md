# Contributing Workflow Guidelines

Welcome to the project! To maintain code stability and ease verification, please follow these branch guidelines:

## Branch Naming Policy
- Always create a dedicated branch. Never commit directly to `master`.
- Use descriptive, hyphen-separated, lowercase names:
  - `fix/description` for bugs
  - `feat/description` for features
  - `docs/description` for documentation

## Pull Request Checklist
1. Pull latest master and rebase before pushing:
   ```bash
   git checkout master
   git pull origin master
   git checkout your-branch
   git rebase master
   ```
2. Verify all tests pass locally.
3. Ensure no unrelated changes are included in your PR commits.

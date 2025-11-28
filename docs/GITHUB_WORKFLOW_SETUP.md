# GitHub Workflow & Branch Protection Setup

This document explains the GitHub workflow setup for running tests and preventing merging when tests fail.

## Workflow File

The workflow is defined in `.github/workflows/checks.yml` and includes:

1. **Test Job**: Runs Jest tests with coverage
2. **Lint Job**: Runs ESLint checks

### Trigger Events

The workflow runs on:

- **Pull requests** to `main` and `develop` branches
- **Push** to `main` and `develop` branches

## Branch Protection Rules

To prevent merging when tests fail, you need to set up branch protection rules in GitHub:

### Steps to Configure Branch Protection:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Branches**
3. Click **Add rule** under "Branch protection rules"
4. Configure for branch: `main` (or `develop`)

### Required Settings:

Enable the following options:

- ✅ **Require a pull request before merging**

  - Require approvals: 1 (or more as needed)
  - Dismiss stale pull request approvals when new commits are pushed

- ✅ **Require status checks to pass before merging**

  - Require branches to be up to date before merging
  - Select the following status checks:
    - `test` (from the workflow)
    - `lint` (from the workflow)

- ✅ **Require code reviews before merging**

  - At least 1 approval

- ✅ **Require conversation resolution before merging** (optional)

- ✅ **Require branches to be up to date before merging**

- ✅ **Include administrators** (optional, but recommended for consistency)

### Alternative: Using GitHub CLI

You can also set this up programmatically using GitHub CLI:

```bash
# Protect main branch
gh api repos/carboleda/ai-money-tracker/branches/main/protection \
  -X PUT \
  -f required_status_checks='{"strict":true,"contexts":["test","lint"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":false}' \
  -f restrictions=null
```

## Workflow Output

When a pull request is created:

1. The workflow automatically runs the test and lint jobs
2. Tests must pass before the PR can be merged
3. Coverage reports are automatically posted as a comment on the PR showing coverage details
4. Status checks appear as green ✅ or red ❌ on the PR

## Coverage Report

The workflow uses the `lcov-reporter-action` to automatically comment on pull requests with:

- Overall code coverage percentage
- Line-by-line coverage details
- Comparison with the base branch (if available)

This provides immediate feedback on test coverage without requiring external integrations.

## Notes

- The workflow uses `npm ci` instead of `npm install` for more reliable CI/CD
- Node.js 20.x is used (change in `strategy.matrix.node-version` if needed)
- NPM dependencies are cached for faster builds

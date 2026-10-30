# Contributing to EVIQ

Thanks for helping. Please read [AGENTS.md](AGENTS.md) first: it has the conventions, the data-honesty rule
(never fabricate data or metrics) and the dead-code sweep we do after every change.

## Code of Conduct

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Reporting bugs and suggesting changes

Open an issue at <https://github.com/Rhytam23/eviq-ai/issues> with steps to reproduce (bugs) or the problem you
want solved (features). Security issues: see [SECURITY.md](SECURITY.md), do not open a public issue.

## Pull requests

1. Branch from `main`; do not push to `main`.
2. Run the checks:
   ```bash
   npx prettier --check .
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```
3. Check the map at desktop and mobile widths with no console errors.
4. Open a PR into `main`.

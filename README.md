# Tracking Web

Standalone public tracking web for `tracking.staging.prochain.network` and `tracking.prochain.network`.

## Local development

```bash
npm install
npm run start
```

## Build scripts

```bash
npm run build-staging
npm run build-production
```

## GitHub Actions

This repo now uses GitHub Actions instead of Azure Pipelines:

- `staging-build`: builds on every push to `main`
- `staging-release`: deploys the staging build artifact to `s3://staging-prochain/www/tracking-web`
- `release-please`: manages release PRs and GitHub Releases from `main`
- `production-build`: builds production on GitHub Release publish or manual dispatch
- `production-release`: deploys the production build artifact to `s3://production-prochain/www/tracking-web`

## GitHub Environments

Create these GitHub Environments:

- `staging`
- `production`

Each environment must define:

- `AWS_ROLE_ARN`: IAM role assumed by GitHub Actions via OIDC

Optional environment variable:

- `AWS_REGION`: defaults to `ap-southeast-1`

## Notes

This repo is now structured as a standalone tracking web. It does not import application code from the product supply chain monorepo.

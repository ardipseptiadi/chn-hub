# Cloudflare Pages Functions

This directory contains **optional** Cloudflare Pages Functions (edge functions) for your app.

## What are Pages Functions?

Pages Functions let you run server-side code at the edge alongside your static site. They're powered by Cloudflare Workers.

## Usage

- Files in `functions/` map to API routes automatically
- `functions/api/hello.ts` → `/api/hello`
- `functions/about.ts` → `/about`

## Local Development

```bash
# Install wrangler (already in devDependencies)
bun install

# Run locally with Functions support
wrangler pages dev dist --compatibility-date=2024-01-01
```

## Deployment

When connected via Git, Cloudflare Pages automatically deploys functions from this directory.

## Learn More

- https://developers.cloudflare.com/pages/functions/
- https://developers.cloudflare.com/pages/functions/advanced-mode/

# Cloudflare Worker for scraping free parking spots.

This application is a Cloudflare worker which has a task of scraping the number of free parking spots from a website. It runs on a schedule, every 30 minutes. It's job is to access a website which shows the free parking spots and save it to a database. All should run on Cloudflare Workers.

### Development

#### Running locally

```
npx wrangler dev
```

#### Querying the DB

1. Write the query to `src/adhoc-query.sql`
2. Run
   1. For local DB: `pnpm run adhocquery:local`
   2. For remote DB: `pnpm run adhocquery:remote`

#### Deploy

```
npx wrangler deploy
```

# zerota

Project started as a small discord bot, that posts anilist updates into channel, so we can comment on it. Anilist i and anime/manga aggregation website.

Next grand idea was to aggreate more than just anilist, e.g. goodreads, letterboxd, etc. I thought it would be fun to see some statistics and graphs for months and weeks. So this project begun.

## Packages

I know that it's not optimal, I could substitute tech stack in the future. Just let me have fun and learn..

TODO: Write a proper readme for each package.

db exists to persist data.
providers exist to provide API for getting data.
tracker uses providers to write data to db.
fe shows data from db.

lgtm.

what about importing data mechanic? let's say I started to use app now, but I want stats for previous month, should I add mechanism to do it? can I add mechanism to do it? do I need to think about it now? heh no.

### DB

I heard a lot of good feedback about Convex, so I want to try it.

### Frontend

Just a regular Next frontend. I want to try a TanStack Start in the future tho.

### Providers

Not too sure about the interface yet. Package to share fetch functions for different providers.

### Tracker

Bun server to regulary update our db with new activities.
It uses Effect library. Code looks awful, but I think I like it.

### Utils

Utils.

## Development

```sh
pnpm i
```

Run convex watcher to apply changes from the schema.

```sh
pnpm --filter db dev
```

Run frontend.

```sh
pnpm --filter frontend dev
```

Run tracker.

```sh
pnpm --filter tracker dev
```
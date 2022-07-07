# Peer Professor API

## Docs

[http://localhost:3000/api-docs/](http://localhost:3000/api-docs/) when the API is running locally

## Setup

1. `yarn install`

2. Install MySQL and run `CREATE DATABASE homework_hangover;` from the mysql prompt

3. `cp .env.example .env` and edit the file

Most likely, you'll have

```
DB_HOST=localhost
DB_NAME=homework_hangover
```

## Developing

Run `yarn watch` in one terminal window, and `yarn dev` in another. This will compile TS into JS in `./dist` and auto restart `./dist/index.js` when changes are made

TypeORM syncs schema changes to your DB unless you change

```
synchronize: true
```

in `ormconfig.ts`

To manually sync schema changes, run `typeorm schema:sync` from the root of this project.

To drop all DB tables and "reset", run `typeorm schema:drop && schema:sync`

## Production

Run `yarn build` and then `yarn start`

You might want to set

```
synchronize: false
```

if deploying the app

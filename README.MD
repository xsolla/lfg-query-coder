## @lfgroup/query-coder

URL query coder/decoder with configurable user pattern. It provides the most comfortable experience for encoding and decoding complex nested filter objects. [Check out example for more info](#basic-example).

### Installation

```zsh
yarn add @lfgroup/query-coder
```

### Basic Example

Imaging having a such interface for your querying filters:

```ts
type SearchGroupsFilter = {
  gameId?: "WorldOfWarcraft" | "WildRift" | "LostArk";
  gameMode?: GameMode;
  from?: Date;
  language?: Language;

  lostArk?: LostArkFilterInput;
  wildRift?: WildRiftFilterInput;
  wow?: WowFilterInput;
};
```

Let's take 1 example of this:

```ts
const filters: SearchGroupsFilter = {
  gameId: "WorldOfWarcraft",
  gameMode: GameMode.WowMythicPlus,
  language: Language.En,
  wow: {
    faction: WowFaction.Alliance,
    dungeon: WowDungeon.MistsOfTirnaScithe,
    minRioRating: 1400,
    region: WowRegion.Europe,
  },
};
```

Which should result in this:

```ts
const query =
  "game=wow&mode=mplus&language=en&faction=alliance&dungeon=mots&rating=1400&region=eu";
```

So we want to:

- flatten nested filter object in a query string
- rename certain keys (`gameMode` -> `mode`)
- re-map certain values (`WorldOfWarcraft` -> `wow`)

With this lib, you can init `QueryCoder` and that's it! 🎉

```ts
import { QueryCoder, QueryHandler, Type } from "@lfg/query-coder";

// passing generic interface checks, whether node keys
// are the same as in provided interface
const query = new QueryCoder<SearchGroupsFilter>({
  gameId: new QueryHandler({
    query: "game",
    aliases: {
      WorldOfWarcraft: "wow",
      WildRift: "wr",
      LostArk: "la",
    },
  }),
  gameMode: new QueryHandler({ query: "mode" }),
  language: new QueryHandler({ query: "language" }),
  wow: {
    faction: new QueryHandler({
      query: "faction",
      /**
       * decodeCondition is Partial of generic
       * if decodeCondition is set, search query would be handled
       * with this handler only if decodeCondition matches query
       * For more info, check out section below
       */
      decodeCondition: { gameId: "WorldOfWarcraft" },
    }),
    dungeon: new QueryHandler({
      query: "dungeon",
      decodeCondition: { gameId: "WorldOfWarcraft" },
    }),
    minRioRating: new QueryHandler({
      query: "minRioRating",
      decodeCondition: { gameId: "WorldOfWarcraft" },
      /**
       * You should provide a primitive type, which is different from string
       * Otherwise, url query "foo=313" can result in an unexpected result
       */
      decodeType: Type.Number,
    }),
    region: new QueryHandler({
      query: "region",
      decodeCondition: { gameId: "WorldOfWarcraft" },
    }),
  },
});

query.encode(filters).toString(); // should result in query variable
query.decode(query); // should result in filters variable
```

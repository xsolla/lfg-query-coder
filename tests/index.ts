import { QueryCoder, QueryHandler, Type } from "../src";

enum GameMode {
  WowMythicPlus,
  WowRaid,
}
enum Language {
  En,
  Ru,
  De,
}
enum WowDungeon {
  MistsOfTirnaScithe,
  Dungeon2,
}
enum WowFaction {
  Alliance,
  Horde,
}
enum WowRegion {
  Europe,
  US,
}
enum WildRiftRegion {
  Europe,
  Turkey,
}
enum LostArkRegion {
  Europe,
  US,
}

interface SearchGroupsFilter {
  gameId?: "WorldOfWarcraft" | "WildRift" | "LostArk";
  tags?: string[];
  upcoming?: boolean;
  gameMode?: GameMode;
  from?: Date;
  language?: Language;

  lostArk?: {
    region?: LostArkRegion;
  };
  wildRift?: {
    region?: WildRiftRegion;
  };
  wow?: {
    faction?: WowFaction;
    dungeon?: WowDungeon;
    minRioRating?: number;
    region?: WowRegion;
  };
}

const filters: SearchGroupsFilter = {
  language: Language.En,
  upcoming: false,
  gameId: "LostArk",
  tags: ["wow", "ewew", "rre add"],
  wow: {
    region: WowRegion.Europe,
  },
};

// passing generic interface checks, whether node keys
// are the same as in provided interface
const query = new QueryCoder<SearchGroupsFilter>({
  tags: new QueryHandler({
    query: "tags",
    decodeType: Type.Array,
  }),
  upcoming: new QueryHandler({
    query: "upcoming",
    decodeType: Type.Boolean,
    acceptEmptyValue: true,
  }),
  language: new QueryHandler({
    query: "lang",
    encodable: false,
  }),
  gameId: new QueryHandler({
    query: "game",
    aliases: {
      WorldOfWarcraft: "wow",
      WildRift: "wr",
      LostArk: "la",
    },
  }),
  gameMode: new QueryHandler({ query: "mode" }),
  wow: {
    region: new QueryHandler({
      query: "region",
      decodeCondition: { gameId: "LostArk" },
    }),
  },
  lostArk: {
    region: new QueryHandler({
      query: "region",
      decodeCondition: { gameId: "LostArk" },
    }),
  },
});

const encodedQuery = query.encode(filters); // should result in query variable
// const decodedFilters = query.decode(encodedQuery.toString()); // should result in filters variable
const decodedFilters = query.decode(encodedQuery); // should result in filters variable

console.log(`Initial filters:\n`, filters);
console.log(`Decoded filters:\n`, decodedFilters);
console.log(`Query: `, encodedQuery);

console.log("2323 ", query.handlers.lostArk?.region?.encode(LostArkRegion.US));

// import { QueryCoder, QueryHandler } from "@lfg/query-coder";

interface ObjectToSerialize {
  foo: string;
  arr: string[];
  bar: {
    baz: string;
  };
}

const coder = new QueryCoder<ObjectToSerialize>({
  foo: new QueryHandler({ query: "foo_in_query" }),
  arr: new QueryHandler({ query: "arr" }),
  bar: {
    baz: new QueryHandler({ query: "baz_in_query" }),
  },
});

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
  gameId: "LostArk",
  wow: {
    region: WowRegion.Europe,
  },
  lostArk: {
    region: LostArkRegion.US,
  },
};

// passing generic interface checks, whether node keys
// are the same as in provided interface
const query = new QueryCoder<SearchGroupsFilter>({
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
      decodeType: Type.Number,
      decodeCondition: { gameId: "WorldOfWarcraft" },
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
const decodedFilters = query.decode(`game=la&region=1&lang=De`); // should result in filters variable

console.log(`Initial filters:\n`, filters);
console.log(`Decoded filters:\n`, decodedFilters);
console.log(`Query: `, encodedQuery.toString());

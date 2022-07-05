# @lfgroup/query-coder

![minified + gzipped](https://badgen.net/bundlephobia/minzip/@lfgroup\/query-coder)

URL query coder/decoder with configurable user pattern. It provides the most comfortable experience for encoding and decoding complex nested filter objects. [Check out example for more info](#usage).

1. [Quickstart](#quickstart)
3. [Advanced example](#advanced-example)
4. [Usage](#usage)
    1. [`QueryCoder`](#1-querycoder)
        1. [Encoding and decoding](#encoding-and-decoding)
        2. [Decoding with a default value](#decoding-with-a-default-value)
    3. [`QueryHandler`](#2-queryhandler)
        1. [Ignoring required fields](#ignoring-required-fields)
        2. [Defining value type](#defining-value-type)
        3. [Aliasing query values](#aliasing-query-values)
        4. [Encoding non-string values](#encoding-non-string-values)
        5. [Accessing handlers outside of a coder](#accessing-handlers-outside-of-a-coder)
        6. [Using handlers between different coders](#using-handlers-between-different-coders)
        7. [Excluding values from encoding](#excluding-values-from-encoding)


## Quickstart

```zsh
yarn add @lfgroup/query-coder
```

Query coder is designed to repeat an interface of provided object with `QueryCoder`, only replacing tree leaves with parser instances — `QueryHandlers`.

```ts
WIP
```


## Advanced example
### WIP

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


## Usage
### 1. `QueryCoder`
`QueryCoder` is a main instance you will use to encode and to decode your data. Typically, you should create coders at a global scope and provide a generic of an interface you are planing to encode/decode.

```ts
import { QueryCoder, QueryHandler } from "@lfg/query-coder";


interface ObjectToSerialize {
  foo: string;
  bar: {
    baz: string;
  };
}

const coder = new QueryCoder<ObjectToSerialize>({
  foo: new QueryHandler({ query: "foo_in_query" }),
  bar: {
    baz: new QueryHandler({ query: "baz_in_query" }),
  },
});
```

#### Encoding and decoding
Using a `coder` [we've created above](#1-querycoder) we can encode object to url query or decode query string to an object:
```ts
const object: ObjectToSerialize = {
  foo: 'value of foo',
  bar: {
    baz: 'bazz-value'
  },
};

// Encoding with .encode(T) method, which returns URLSearchParams
const urlSearchParams = coder.encode(object);
console.log(urlSearchParams.toString()); // foo_in_query=value%20of%20foo&baz_in_query=bazz-value

// Decoding with .decode(string) method, which returns T
const decodedObject = coder.decode(urlSearchParams.toString());
console.log(decodedObject); // same as var `object`
```

#### Decoding with a default value 
Sometimes you may want to provide a default value for decoding proccess to fill required gaps of an interface. Providing default value will deep assign decoded object to default object, overwriting default value with decoded if any provided.
```ts
const query = `foo_in_query=url-value`


const defaultObj: ObjectToSerialize = {
  foo: "default",
  bar: {
    baz: "default",
  },
};

const decodedObj = coder.decode(query, { defaultValue: defaultObj });

console.log(decodedObj) // { foo: "url-value", bar: { baz: "default" } }
```

### 2. `QueryHandler`
`QueryHandler` is a handler for each node leaf of a codable object. It must include a name for a query key and provides additional options. You should mind that:

* Only leaves, that have `QueryHandler` will be encoded/decoded
* Values that are not strings should has `decodeType` param
* 

```ts

interface ObjectToSerialize {
  foo: string;
  bar: {
    baz: string;
  };
}

const coder = new QueryCoder<ObjectToSerialize>({
  foo: new QueryHandler({ query: "foo_in_query" }),
  bar: {
    baz: new QueryHandler({ query: "baz_in_query" }),
  },
});

```
#### Ignoring required fields
Refer decode default
#### Defining value type
#### Aliasing query values
#### Encoding non-string values
#### Accessing handlers outside of a coder
#### Using handlers between different coders
#### Excluding values from encoding

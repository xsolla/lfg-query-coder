import { Type, QueryHandlerParams, QueryHandlerTypedParams } from "./types";

export class QueryHandler<T, DC = undefined> {
  /**
   * Type is important to be set,
   * because query "123" provides unrecognized type by itself
   * Make sure, to set it to Type.Number, if you want to decode it to 123
   */
  public type: Type = Type.String;
  /**
   * Path in a parent object.
   * { filter: { wow: { dungeon: "Dungeon#1" }}}
   * results in `filter.wow.dungeon`
   * path is needed to decode
   */
  public path = "";
  /**
   * Query is a title of field in url query.
   * { gameTitle: new QueryHandler({ query: 'g' })}
   * results in URL query g=Wow,
   * but decoded result in gameTitle=Wow
   */
  public query: string;
  /**
   * Decode condition
   * There might be several handlers with the same query title
   * For example, you might not want to explode wow dungeon and lost ark dungeon
   * into two separate keys "wow_dungeon" and "lostark_dungeon", instead, you can make
   * @example
   * {
   *   game: 'wow' | 'lost ark',
   *   wowDungeon: new QueryHandler({ query: "dungeon", decodeCondition: { game: 'wow' } }),
   *   laDungeon: new QueryHandler({ query: "dungeon", decodeCondition: { game: 'lost ark' } }),
   * }
   */
  public decodeCondition: DC | undefined;
  /**
   * Aliases hashmap converts real value T to an alias
   * { mode : { aliases: { WowMythicPlus: 'mplus' }}}
   * results in URL query mode=mplus,
   * but decoded result in mode=WowMythicPlus
   */
  public aliases?: T extends string | number | symbol
    ? Record<T, string>
    : undefined;
  /**
   * Reversed aliases are saved during initialization
   * to do both encode and decode proccess faster
   */
  public reverseAliases?: Record<string, T>;

  constructor(data: QueryHandlerParams<T, DC>) {
    this.query = data.query;
    this.decodeCondition = data.decodeCondition;

    const strData = data as QueryHandlerTypedParams<string | number | symbol>;
    if (strData?.convertMap) {
      const convertMap = strData.convertMap as any;
      this.aliases = convertMap;
      this.reverseAliases = this.reverseMap(convertMap);
    }
  }

  /**
   * Encodes data value to query,
   * applies aliases if needed
   */
  public encode(data: T): string {
    if (this.aliases && this.isPrimitive(data)) {
      const alias = this.aliases[data];

      return encodeURIComponent(alias || String(data));
    }

    return encodeURIComponent(String(data));
  }

  /**
   * Decodes query ("Dungeon#1") into T
   */
  public decode(query: string): T {
    const dataStr = decodeURIComponent(query);
    if (this.reverseAliases) {
      const alias = this.reverseAliases[dataStr];

      return alias;
    }
    switch (this.type) {
      case Type.Boolean:
        return Boolean(dataStr) as any;
      case Type.Number:
        return Number(dataStr) as any;
      case Type.String:
        return dataStr as any;
    }
  }

  public setPath(path: string[]) {
    return path.join(".");
  }

  private isPrimitive(data: any): data is string | number | symbol {
    return (
      typeof data === "string" ||
      typeof data === "number" ||
      typeof data === "symbol"
    );
  }

  private reverseMap(
    data: Record<string | number | symbol, string>
  ): Record<string, T> {
    return Object.keys(data).reduce(
      (acc, key) => ({ ...acc, [data[key]]: key as any }),
      {}
    );
  }
}

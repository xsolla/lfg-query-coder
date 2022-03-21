import { QueryHandler } from "./queryHandler";

export type QueryHandlerParams<T, P = undefined> = {
  query: string;
  decodeCondition?: P;
  decodeType?: Type;
} & QueryHandlerTypedParams<T>;

export type QueryHandlerTypedParams<T> = T extends number | string | symbol
  ? {
      aliases?: Record<T, string>;
    }
  : void;

export enum Type {
  Boolean = "boolean",
  String = "string",
  Number = "number",
}

export type AnyPrimitive = number | string | boolean | null | undefined;

export type DeepQueryCoder<T> = DeepQueryCoderWithParent<T, T>;

/** Makes each property optional and turns each leaf property into any, allowing for type overrides by narrowing any. */
export type DeepQueryCoderWithParent<T, Parent> = {
  [P in keyof T]?: T[P] extends AnyPrimitive
    ? QueryHandler<T[P], Parent>
    : DeepQueryCoderWithParent<T[P], Parent>;
};

/**
 * @example
 * {
 *   "game": new QueryHandler({query: "game", pointer: data => data.filter.game }),
 *   "dungeon": [
 *     new QueryHandler({query: "dungeon", path: "filter.wow.dungeon" }),
 *     new QueryHandler({query: "dungeon", path: "filter.lostArk.cubeDungeon" }),
 *   ],
 * }
 */
export type QueryHandlerMap<T> = Record<string, QueryHandler<any, T>[]>;
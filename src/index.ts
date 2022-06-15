import type { ParsedUrlQuery } from "querystring";

import { QueryHandler } from "./queryHandler";
import { deepAssign, isObject, deepMatch } from "./helpers";
import {
  DeepQueryCoder,
  DeepQueryCoderWithParent,
  QueryHandlerMap,
  Type,
  DecodeOptions,
} from "./types";

export { QueryHandler, Type };

/**
 * QueryCoders
 */
export class QueryCoder<T> {
  /**
   *
   */
  private queryHandlersMap: QueryHandlerMap<T>;
  /**
   * An object with the same structure as T,
   * but with leaves of QueryHandlers
   */
  public handlers: DeepQueryCoder<T>;

  constructor(data: DeepQueryCoder<T>) {
    this.handlers = data;
    this.queryHandlersMap = this.deepCollectHandlers(data);
  }

  /** Flat maps all leaves from coder to find decoder fast */
  private deepCollectHandlers<D>(
    data: DeepQueryCoderWithParent<D, T>,
    path: string[] = []
  ): QueryHandlerMap<T> {
    return Object.keys(data).reduce((acc, keyStr) => {
      const key = keyStr as keyof D;
      const value = data[key as keyof D];

      /** Value must be either node or QueryHandler leaf */
      if (!isObject(value)) {
        console.warn("shallow encoder unexpected type:", value);
        throw new Error("Unexpected type");
      }

      if (value instanceof QueryHandler) {
        if (!acc[value.query]) {
          acc[value.query] = [];
        }
        value.setPath([...path, keyStr]); // filter.wow.dungeon
        acc[value.query].push(value as any);

        return acc;
      }

      const shallowHandlers = this.deepCollectHandlers(
        value as DeepQueryCoderWithParent<D, T>,
        [...path, keyStr]
      );

      Object.keys(shallowHandlers).forEach((queryName) => {
        if (!acc[queryName]) {
          acc[queryName] = [];
        }

        acc[queryName].push(...shallowHandlers[queryName]);
      });

      return acc;
    }, {} as QueryHandlerMap<T>);
  }

  private deepEncode<D = T>(
    data: D,
    encoder: DeepQueryCoder<D>
  ): Record<string, string> {
    return Object.keys(data).reduce((acc, keyStr) => {
      const key = keyStr as keyof D;

      const value = data[key] as unknown;
      const shallowEncoder = encoder[key] as DeepQueryCoder<typeof value>;

      if (!shallowEncoder || value === null || value === undefined) {
        return acc;
      }

      // if node, go deeper
      if (isObject(value)) {
        return { ...acc, ...this.deepEncode(value, shallowEncoder) };
      }

      if (!(shallowEncoder instanceof QueryHandler)) {
        console.warn("shallow encoder unexpected type:", shallowEncoder);
        throw new Error("Unexpected type");
      }

      if (!shallowEncoder.encodable) {
        return acc;
      }

      if (shallowEncoder.acceptEmptyValue && !value) {
        return acc;
      }

      return { ...acc, [shallowEncoder.query]: shallowEncoder.encode(value) };
    }, {} as Record<string, string>);
  }

  /**
   * Encodes object to query string
   * @returns encoded query string
   */
  encode(data: T): string {
    const queryMap = this.deepEncode(data, this.handlers);
    const urlQuery = new URLSearchParams(queryMap).toString();

    const trimmed = urlQuery.replaceAll("=&", "&");

    return trimmed.endsWith("=")
      ? trimmed.slice(0, trimmed.length - 1)
      : trimmed;
  }

  /**
   * Decodes
   * @param query
   * @returns decoded object
   */
  decode(query: string | ParsedUrlQuery, options: DecodeOptions<T> = {}): T {
    const searchParams = new URLSearchParams(query);

    const object = options?.defaultValue || {};

    for (const [key, value] of searchParams) {
      const handlers = this.queryHandlersMap[key];
      if (!handlers) {
        continue;
      }

      const handler = handlers.find(
        (handler) =>
          !handler.decodeCondition || deepMatch(handler.decodeCondition, object)
      );

      if (!handler) {
        continue;
      }

      const parsedValue = handler.decode(value);
      deepAssign(object, handler.path, parsedValue);
    }

    return object as T;
  }
}

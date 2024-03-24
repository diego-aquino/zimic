import { IfAny, Prettify, UnionToIntersection } from '@/types/utils';

import { HttpHeadersSchema } from '../headers/types';
import { HttpSearchParamsSchema } from '../searchParams/types';
import { DefaultBody } from './requests';

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];

// TODO: Add docs
export interface HttpServiceRequestSchema {
  headers?: HttpHeadersSchema;
  searchParams?: HttpSearchParamsSchema;
  body?: DefaultBody;
}

// TODO: Add docs
export interface HttpServiceResponseSchema {
  headers?: HttpHeadersSchema;
  body?: DefaultBody;
}

// TODO: Add docs
export interface HttpServiceResponseSchemaByStatusCode {
  [statusCode: number]: HttpServiceResponseSchema;
}

// TODO: Add docs
export type HttpServiceResponseSchemaStatusCode<
  ResponseSchemaByStatusCode extends HttpServiceResponseSchemaByStatusCode,
> = Extract<keyof ResponseSchemaByStatusCode, number>;

// TODO: Add docs
export interface HttpServiceMethodSchema {
  request?: HttpServiceRequestSchema;
  response?: HttpServiceResponseSchemaByStatusCode;
}

// TODO: Add docs
export type HttpServiceMethodsSchema = {
  [Method in HttpMethod]?: HttpServiceMethodSchema;
};

// TODO: Add docs
export interface HttpServiceSchema {
  [path: string]: HttpServiceMethodsSchema;
}

// TODO: Add docs
export namespace HttpSchema {
  // TODO: Add docs
  export type Paths<Schema extends HttpServiceSchema> = Prettify<Schema>;
  // TODO: Add docs
  export type Methods<Schema extends HttpServiceMethodsSchema> = Prettify<Schema>;
  // TODO: Add docs
  export type Method<Schema extends HttpServiceMethodSchema> = Prettify<Schema>;
  // TODO: Add docs
  export type Request<Schema extends HttpServiceRequestSchema> = Prettify<Schema>;
  // TODO: Add docs
  export type ResponseByStatusCode<Schema extends HttpServiceResponseSchemaByStatusCode> = Prettify<Schema>;
  // TODO: Add docs
  export type Response<Schema extends HttpServiceResponseSchema> = Prettify<Schema>;
  // TODO: Add docs
  export type Headers<Schema extends HttpHeadersSchema> = Prettify<Schema>;
  // TODO: Add docs
  export type SearchParams<Schema extends HttpSearchParamsSchema> = Prettify<Schema>;
  // TODO: Add docs
  export type Body<Schema extends DefaultBody> = Prettify<Schema>;
}

// TODO: Add docs
export type HttpServiceSchemaMethod<Schema extends HttpServiceSchema> = IfAny<
  Schema,
  any, // eslint-disable-line @typescript-eslint/no-explicit-any
  Extract<keyof UnionToIntersection<Schema[keyof Schema]>, HttpMethod>
>;

// TODO: Add docs
export type LiteralHttpServiceSchemaPath<
  Schema extends HttpServiceSchema,
  Method extends HttpServiceSchemaMethod<Schema>,
> = LooseLiteralHttpServiceSchemaPath<Schema, Method>;

// TODO: Add docs
export type LooseLiteralHttpServiceSchemaPath<Schema extends HttpServiceSchema, Method extends HttpMethod> = {
  [Path in Extract<keyof Schema, string>]: Method extends keyof Schema[Path] ? Path : never;
}[Extract<keyof Schema, string>];

export type AllowAnyStringInPathParameters<Path extends string> =
  Path extends `${infer Prefix}:${string}/${infer Suffix}`
    ? `${Prefix}${string}/${AllowAnyStringInPathParameters<Suffix>}`
    : Path extends `${infer Prefix}:${string}`
      ? `${Prefix}${string}`
      : Path;

export type NonLiteralHttpServiceSchemaPath<
  Schema extends HttpServiceSchema,
  Method extends HttpServiceSchemaMethod<Schema>,
> = AllowAnyStringInPathParameters<LiteralHttpServiceSchemaPath<Schema, Method>>;

// TODO: Add docs
export type HttpServiceSchemaPath<Schema extends HttpServiceSchema, Method extends HttpServiceSchemaMethod<Schema>> =
  | LiteralHttpServiceSchemaPath<Schema, Method>
  | NonLiteralHttpServiceSchemaPath<Schema, Method>;

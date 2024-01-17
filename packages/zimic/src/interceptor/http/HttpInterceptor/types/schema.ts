import { JSONValue } from '@/types/json';
import { Default } from '@/types/utils';

import { HttpRequestHandlerContext } from '../../HttpInterceptorWorker/types';

export const HTTP_INTERCEPTOR_METHOD = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const;
export type HttpInterceptorMethod = (typeof HTTP_INTERCEPTOR_METHOD)[number];

export type HttpInterceptorDefaultBody = JSONValue;

export interface HttpInterceptorRequestSchema {
  body?: HttpInterceptorDefaultBody;
}

export interface HttpInterceptorResponseSchema {
  body?: HttpInterceptorDefaultBody;
}

export interface HttpInterceptorResponseSchemaByStatusCode {
  [statusCode: number]: HttpInterceptorResponseSchema;
}

export type HttpInterceptorResponseSchemaStatusCode<
  ResponseSchemaByStatusCode extends HttpInterceptorResponseSchemaByStatusCode,
> = Extract<keyof ResponseSchemaByStatusCode, number>;

export interface HttpInterceptorMethodSchema {
  request?: HttpInterceptorRequestSchema;
  response?: HttpInterceptorResponseSchemaByStatusCode;
}

type HttpInterceptorPathSchema = {
  [Method in HttpInterceptorMethod]?: HttpInterceptorMethodSchema;
};

export interface HttpInterceptorSchema {
  [path: string]: HttpInterceptorPathSchema;
}

export type HttpInterceptorSchemaMethod<Schema extends HttpInterceptorSchema> = Extract<
  keyof Schema[keyof Schema],
  HttpInterceptorMethod
>;

export type LiteralHttpInterceptorSchemaPath<
  Schema extends HttpInterceptorSchema,
  Method extends HttpInterceptorSchemaMethod<Schema>,
> = {
  [Path in Extract<keyof Schema, string>]: keyof Schema[Path] extends Method ? Path : never;
}[Extract<keyof Schema, string>];

type AllowAnyStringInRouteParameters<Path extends string> = Path extends `${infer Prefix}:${string}/${infer Suffix}`
  ? `${Prefix}${string}/${AllowAnyStringInRouteParameters<Suffix>}`
  : Path extends `${infer Prefix}:${string}`
    ? `${Prefix}${string}`
    : Path;

export type NonLiteralHttpInterceptorSchemaPath<
  Schema extends HttpInterceptorSchema,
  Method extends HttpInterceptorSchemaMethod<Schema>,
> = AllowAnyStringInRouteParameters<LiteralHttpInterceptorSchemaPath<Schema, Method>>;

export type HttpInterceptorSchemaPath<
  Schema extends HttpInterceptorSchema,
  Method extends HttpInterceptorSchemaMethod<Schema>,
> = LiteralHttpInterceptorSchemaPath<Schema, Method> | NonLiteralHttpInterceptorSchemaPath<Schema, Method>;

export type HttpInterceptorRequestContext<
  Schema extends HttpInterceptorSchema,
  Method extends HttpInterceptorSchemaMethod<Schema>,
  Path extends HttpInterceptorSchemaPath<Schema, Method>,
> = HttpRequestHandlerContext<Default<Default<Schema[Path][Method]>['request']>['body']>;

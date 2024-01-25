import { Default } from '@/types/utils';

import HttpRequestTracker from '../../HttpRequestTracker';
import {
  AllowAnyStringInRouteParameters,
  HttpInterceptorMethod,
  HttpInterceptorSchema,
  HttpInterceptorSchemaMethod,
  LiteralHttpInterceptorSchemaPath,
} from './schema';

export interface EffectiveHttpInterceptorMethodHandler<
  Schema extends HttpInterceptorSchema,
  Method extends HttpInterceptorSchemaMethod<Schema>,
> {
  <Path extends LiteralHttpInterceptorSchemaPath<Schema, Method>>(
    path: Path,
  ): HttpRequestTracker<Default<Schema[Path][Method]>>;

  <
    Path extends LiteralHttpInterceptorSchemaPath<Schema, Method> | void = void,
    ActualPath extends Exclude<Path, void> = Exclude<Path, void>,
  >(
    path: AllowAnyStringInRouteParameters<ActualPath>,
  ): HttpRequestTracker<Default<Schema[ActualPath][Method]>>;
}

export type EmptyHttpInterceptorMethodHandler = (path: never) => HttpRequestTracker<never>;

export type HttpInterceptorMethodHandler<Schema extends HttpInterceptorSchema, Method extends HttpInterceptorMethod> =
  Method extends HttpInterceptorSchemaMethod<Schema>
    ? EffectiveHttpInterceptorMethodHandler<Schema, Method>
    : EmptyHttpInterceptorMethodHandler;

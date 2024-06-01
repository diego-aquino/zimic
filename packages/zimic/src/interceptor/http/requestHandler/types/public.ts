import HttpHeaders from '@/http/headers/HttpHeaders';
import HttpSearchParams from '@/http/searchParams/HttpSearchParams';
import {
  HttpServiceResponseSchemaStatusCode,
  HttpServiceSchema,
  HttpServiceSchemaMethod,
  HttpServiceSchemaPath,
} from '@/http/types/schema';
import { Default, PossiblePromise } from '@/types/utils';

import {
  HttpRequestHeadersSchema,
  HttpInterceptorRequest,
  HttpRequestHandlerResponseDeclaration,
  HttpRequestHandlerResponseDeclarationFactory,
  HttpRequestSearchParamsSchema,
  TrackedHttpInterceptorRequest,
  HttpRequestBodySchema,
} from './requests';

/**
 * A static headers restriction to match intercepted requests.
 *
 * @see {@link https://github.com/zimicjs/zimic#http-handlerwithrestriction `handler.with()` API reference}
 */
export type HttpRequestHandlerHeadersStaticRestriction<
  Schema extends HttpServiceSchema,
  Path extends HttpServiceSchemaPath<Schema, Method>,
  Method extends HttpServiceSchemaMethod<Schema>,
> =
  | Default<HttpRequestHeadersSchema<Default<Schema[Path][Method]>>>
  | HttpHeaders<Default<HttpRequestHeadersSchema<Default<Schema[Path][Method]>>>>;

/**
 * A static search params restriction to match intercepted requests.
 *
 * @see {@link https://github.com/zimicjs/zimic#http-handlerwithrestriction `handler.with()` API reference}
 */
export type HttpRequestHandlerSearchParamsStaticRestriction<
  Schema extends HttpServiceSchema,
  Path extends HttpServiceSchemaPath<Schema, Method>,
  Method extends HttpServiceSchemaMethod<Schema>,
> =
  | Default<HttpRequestSearchParamsSchema<Default<Schema[Path][Method]>>>
  | HttpSearchParams<Default<HttpRequestSearchParamsSchema<Default<Schema[Path][Method]>>>>;

/**
 * A static body restriction to match intercepted requests.
 *
 * @see {@link https://github.com/zimicjs/zimic#http-handlerwithrestriction `handler.with()` API reference}
 */
export type HttpRequestHandlerBodyStaticRestriction<
  Schema extends HttpServiceSchema,
  Path extends HttpServiceSchemaPath<Schema, Method>,
  Method extends HttpServiceSchemaMethod<Schema>,
> = Default<HttpRequestBodySchema<Default<Schema[Path][Method]>>, null>;

/**
 * A static restriction to match intercepted requests.
 *
 * @see {@link https://github.com/zimicjs/zimic#http-handlerwithrestriction `handler.with()` API reference}
 */
export interface HttpRequestHandlerStaticRestriction<
  Schema extends HttpServiceSchema,
  Path extends HttpServiceSchemaPath<Schema, Method>,
  Method extends HttpServiceSchemaMethod<Schema>,
> {
  /**
   * A set of headers that the intercepted request must contain to match the handler. If exact is `true`, the request
   * must contain exactly these headers and no others.
   */
  headers?: HttpRequestHandlerHeadersStaticRestriction<Schema, Path, Method>;

  /**
   * A set of search params that the intercepted request must contain to match the handler. If exact is `true`, the
   * request must contain exactly these search params and no others.
   */
  searchParams?: HttpRequestHandlerSearchParamsStaticRestriction<Schema, Path, Method>;

  /**
   * The body that the intercepted request must contain to match the handler. If exact is `true`, the request must
   * contain exactly this body and no other.
   */
  body?: HttpRequestHandlerBodyStaticRestriction<Schema, Path, Method>;

  /**
   * If `true`, the request must contain **exactly** the headers, search params, and body declared in this restriction.
   * Otherwise, the request must contain **at least** them.
   */
  exact?: boolean;
}

/**
 * A computed restriction to match intercepted requests.
 *
 * @see {@link https://github.com/zimicjs/zimic#http-handlerwithrestriction `handler.with()` API reference}
 */
export type HttpRequestHandlerComputedRestriction<
  Schema extends HttpServiceSchema,
  Method extends HttpServiceSchemaMethod<Schema>,
  Path extends HttpServiceSchemaPath<Schema, Method>,
> = (request: HttpInterceptorRequest<Path, Default<Schema[Path][Method]>>) => PossiblePromise<boolean>;

/**
 * A restriction to match intercepted requests.
 *
 * @see {@link https://github.com/zimicjs/zimic#http-handlerwithrestriction `handler.with()` API reference}
 */
export type HttpRequestHandlerRestriction<
  Schema extends HttpServiceSchema,
  Method extends HttpServiceSchemaMethod<Schema>,
  Path extends HttpServiceSchemaPath<Schema, Method>,
> =
  | HttpRequestHandlerStaticRestriction<Schema, Path, Method>
  | HttpRequestHandlerComputedRestriction<Schema, Method, Path>;

/**
 * An HTTP request handler to declare responses for intercepted requests.
 *
 * When multiple handlers of the same interceptor match the same method and path, the _last_ handler created with
 * {@link https://github.com/zimicjs/zimic#http-interceptormethodpath `interceptor.<method>(path)`} will be used.
 *
 * @see {@link https://github.com/zimicjs/zimic#httprequesthandler `HttpRequestHandler` API reference}
 */
export interface HttpRequestHandler<
  Schema extends HttpServiceSchema,
  Method extends HttpServiceSchemaMethod<Schema>,
  Path extends HttpServiceSchemaPath<Schema, Method>,
  StatusCode extends HttpServiceResponseSchemaStatusCode<Default<Default<Schema[Path][Method]>['response']>> = never,
> {
  /**
   * @returns The method that matches this handler.
   * @see {@link https://github.com/zimicjs/zimic#http-handlermethod `handler.method()` API reference}
   */
  method: () => Method;

  /**
   * @returns The path that matches this handler. The base URL of the interceptor is not included, but it is used when
   *   matching requests.
   * @see {@link https://github.com/zimicjs/zimic#http-handlerpath `handler.path()` API reference}
   */
  path: () => Path;

  /**
   * Declares a restriction to intercepted request matches. `headers`, `searchParams`, and `body` are supported to limit
   * which requests will match the handler and receive the mock response. If multiple restrictions are declared, either
   * in a single object or with multiple calls to `handler.with()`, all of them must be met, essentially creating an AND
   * condition.
   *
   * By default, restrictions use `exact: false`, meaning that any request **containing** the declared restrictions will
   * match the handler, regardless of having more properties or values. If you want to match only requests with the
   * exact values declared, you can use `exact: true`.
   *
   * A function is also supported to declare restrictions, in case they are dynamic.
   *
   * @param restriction The restriction to match intercepted requests.
   * @returns The same handler, now considering the specified restriction.
   * @see {@link https://github.com/zimicjs/zimic#http-handlerwithrestriction `handler.with()` API reference}
   */

  with: (
    restriction: HttpRequestHandlerRestriction<Schema, Method, Path>,
  ) => HttpRequestHandler<Schema, Method, Path, StatusCode>;

  /**
   * Declares a response to return for matched intercepted requests.
   *
   * When the handler matches a request, it will respond with the given declaration. The response type is statically
   * validated against the schema of the interceptor.
   *
   * @param declaration The response declaration or a factory to create it.
   * @returns The same handler, now including type information about the response declaration based on the specified
   *   status code.
   * @see {@link https://github.com/zimicjs/zimic#http-handlerrespond `handler.respond()` API reference}
   */
  respond: <StatusCode extends HttpServiceResponseSchemaStatusCode<Default<Default<Schema[Path][Method]>['response']>>>(
    declaration:
      | HttpRequestHandlerResponseDeclaration<Default<Schema[Path][Method]>, StatusCode>
      | HttpRequestHandlerResponseDeclarationFactory<Path, Default<Schema[Path][Method]>, StatusCode>,
  ) => HttpRequestHandler<Schema, Method, Path, StatusCode>;

  /**
   * Clears any response declared with
   * [`handler.respond(declaration)`](https://github.com/zimicjs/zimic#http-handlerresponddeclaration), making the
   * handler stop matching requests. The next handler, created before this one, that matches the same method and path
   * will be used if present. If not, the requests of the method and path will not be intercepted.
   *
   * To make the handler match requests again, register a new response with
   * {@link https://github.com/zimicjs/zimic#http-handlerrespond `handler.respond()`}.
   *
   * This method is useful to skip a handler. It is more gentle than
   * [`handler.clear()`](https://github.com/zimicjs/zimic#http-handlerclear), as it only removed the response, keeping
   * restrictions and intercepted requests.
   *
   * @returns The same handler, now without a declared responses.
   * @see {@link https://github.com/zimicjs/zimic#http-handlerbypass `handler.bypass()` API reference}
   */
  bypass: () => HttpRequestHandler<Schema, Method, Path, StatusCode>;

  /**
   * Clears any response declared with
   * [`handler.respond(declaration)`](https://github.com/zimicjs/zimic#http-handlerresponddeclaration), restrictions
   * declared with [`handler.with(restriction)`](https://github.com/zimicjs/zimic#http-handlerwithrestriction), and
   * intercepted requests, making the handler stop matching requests. The next handler, created before this one, that
   * matches the same method and path will be used if present. If not, the requests of the method and path will not be
   * intercepted.
   *
   * To make the handler match requests again, register a new response with
   * {@link https://github.com/zimicjs/zimic#http-handlerrespond `handler.respond()`}.
   *
   * This method is useful to reset handlers to a clean state between tests. It is more aggressive than
   * [`handler.bypass()`](https://github.com/zimicjs/zimic#http-handlerbypass), as it also clears restrictions and
   * intercepted requests.
   *
   * @returns The same handler, now cleared of any declared responses, restrictions, and intercepted requests.
   * @see {@link https://github.com/zimicjs/zimic#http-handlerclear `handler.clear()` API reference}
   */
  clear: () => HttpRequestHandler<Schema, Method, Path, StatusCode>;

  /**
   * @returns The intercepted requests that matched this handler, along with the responses returned to each of them.
   *   This is useful for testing that the correct requests were made by your application.
   * @see {@link https://github.com/zimicjs/zimic#http-handlerrequests `handler.requests()` API reference}
   */
  requests:
    | (() => readonly TrackedHttpInterceptorRequest<Path, Default<Schema[Path][Method]>, StatusCode>[])
    | (() => Promise<readonly TrackedHttpInterceptorRequest<Path, Default<Schema[Path][Method]>, StatusCode>[]>);
}

/**
 * A local HTTP request handler to declare responses for intercepted requests. In a local handler, the mocking
 * operations are synchronous and are executed in the same process where it was created.
 *
 * When multiple handlers of the same interceptor match the same method and path, the _last_ handler created with
 * {@link https://github.com/zimicjs/zimic#http-interceptormethodpath `interceptor.<method>(path)`} will be used.
 *
 * @see {@link https://github.com/zimicjs/zimic#httprequesthandler `HttpRequestHandler` API reference}
 */
export interface LocalHttpRequestHandler<
  Schema extends HttpServiceSchema,
  Method extends HttpServiceSchemaMethod<Schema>,
  Path extends HttpServiceSchemaPath<Schema, Method>,
  StatusCode extends HttpServiceResponseSchemaStatusCode<Default<Default<Schema[Path][Method]>['response']>> = never,
> extends HttpRequestHandler<Schema, Method, Path, StatusCode> {
  readonly type: 'local';

  with: (
    restriction: HttpRequestHandlerRestriction<Schema, Method, Path>,
  ) => LocalHttpRequestHandler<Schema, Method, Path, StatusCode>;

  respond: <StatusCode extends HttpServiceResponseSchemaStatusCode<Default<Default<Schema[Path][Method]>['response']>>>(
    declaration:
      | HttpRequestHandlerResponseDeclaration<Default<Schema[Path][Method]>, StatusCode>
      | HttpRequestHandlerResponseDeclarationFactory<Path, Default<Schema[Path][Method]>, StatusCode>,
  ) => LocalHttpRequestHandler<Schema, Method, Path, StatusCode>;

  bypass: () => LocalHttpRequestHandler<Schema, Method, Path, StatusCode>;

  clear: () => LocalHttpRequestHandler<Schema, Method, Path, StatusCode>;

  requests: () => readonly TrackedHttpInterceptorRequest<Path, Default<Schema[Path][Method]>, StatusCode>[];
}

/**
 * A synced remote HTTP request handler. When a remote handler is synced, it is guaranteed that all of the mocking
 * operations were committed to the connected {@link https://github.com/zimicjs/zimic#zimic-server interceptor server}.
 *
 * @see {@link https://github.com/zimicjs/zimic#httprequesthandler `HttpRequestHandler` API reference}
 */
export interface SyncedRemoteHttpRequestHandler<
  Schema extends HttpServiceSchema,
  Method extends HttpServiceSchemaMethod<Schema>,
  Path extends HttpServiceSchemaPath<Schema, Method>,
  StatusCode extends HttpServiceResponseSchemaStatusCode<Default<Default<Schema[Path][Method]>['response']>> = never,
> extends HttpRequestHandler<Schema, Method, Path, StatusCode> {
  with: (
    restriction: HttpRequestHandlerRestriction<Schema, Method, Path>,
  ) => PendingRemoteHttpRequestHandler<Schema, Method, Path, StatusCode>;

  respond: <StatusCode extends HttpServiceResponseSchemaStatusCode<Default<Default<Schema[Path][Method]>['response']>>>(
    declaration:
      | HttpRequestHandlerResponseDeclaration<Default<Schema[Path][Method]>, StatusCode>
      | HttpRequestHandlerResponseDeclarationFactory<Path, Default<Schema[Path][Method]>, StatusCode>,
  ) => PendingRemoteHttpRequestHandler<Schema, Method, Path, StatusCode>;

  bypass: () => PendingRemoteHttpRequestHandler<Schema, Method, Path, StatusCode>;

  clear: () => PendingRemoteHttpRequestHandler<Schema, Method, Path, StatusCode>;

  requests: () => Promise<readonly TrackedHttpInterceptorRequest<Path, Default<Schema[Path][Method]>, StatusCode>[]>;
}

/**
 * A pending remote HTTP request handler. When a remote handler is pending, it is not guaranteed that all of the mocking
 * operations were committed to the connected {@link https://github.com/zimicjs/zimic#zimic-server interceptor server}.
 *
 * To commit a remote interceptor, you can `await` it or use the methods {@link then handler.then()},
 * {@link catch handler.catch()}, and {@link finally handler.finally()}.
 *
 * @see {@link https://github.com/zimicjs/zimic#httprequesthandler `HttpRequestHandler` API reference}
 */
export interface PendingRemoteHttpRequestHandler<
  Schema extends HttpServiceSchema,
  Method extends HttpServiceSchemaMethod<Schema>,
  Path extends HttpServiceSchemaPath<Schema, Method>,
  StatusCode extends HttpServiceResponseSchemaStatusCode<Default<Default<Schema[Path][Method]>['response']>> = never,
> extends SyncedRemoteHttpRequestHandler<Schema, Method, Path, StatusCode> {
  /**
   * Waits for the remote handler to be synced with the connected
   * {@link https://github.com/zimicjs/zimic#zimic-server interceptor server}.
   */
  then: <FulfilledResult = SyncedRemoteHttpRequestHandler<Schema, Method, Path, StatusCode>, RejectedResult = never>(
    onFulfilled?:
      | ((
          handler: SyncedRemoteHttpRequestHandler<Schema, Method, Path, StatusCode>,
        ) => PossiblePromise<FulfilledResult>)
      | null,
    onRejected?: ((reason: unknown) => PossiblePromise<RejectedResult>) | null,
  ) => Promise<FulfilledResult | RejectedResult>;

  /**
   * Waits for the remote handler to be synced with the connected
   * {@link https://github.com/zimicjs/zimic#zimic-server interceptor server}.
   */
  catch: <RejectedResult = never>(
    onRejected?: ((reason: unknown) => PossiblePromise<RejectedResult>) | null,
  ) => Promise<SyncedRemoteHttpRequestHandler<Schema, Method, Path, StatusCode> | RejectedResult>;

  /**
   * Waits for the remote handler to be synced with the connected
   * {@link https://github.com/zimicjs/zimic#zimic-server interceptor server}.
   */
  finally: (
    onFinally?: (() => void) | null,
  ) => Promise<SyncedRemoteHttpRequestHandler<Schema, Method, Path, StatusCode>>;
}

/**
 * A remote HTTP request handler to declare responses for intercepted requests. In a remote handler, the mocking
 * operations are asynchronous and include remote calls to the connected
 * {@link https://github.com/zimicjs/zimic#zimic-server interceptor server}.
 *
 * When multiple handlers of the same interceptor match the same method and path, the _last_ handler created with
 * {@link https://github.com/zimicjs/zimic#http-interceptormethodpath `interceptor.<method>(path)`} will be used.
 *
 * @see {@link https://github.com/zimicjs/zimic#httprequesthandler `HttpRequestHandler` API reference}
 */
export interface RemoteHttpRequestHandler<
  Schema extends HttpServiceSchema,
  Method extends HttpServiceSchemaMethod<Schema>,
  Path extends HttpServiceSchemaPath<Schema, Method>,
  StatusCode extends HttpServiceResponseSchemaStatusCode<Default<Default<Schema[Path][Method]>['response']>> = never,
> extends PendingRemoteHttpRequestHandler<Schema, Method, Path, StatusCode> {
  readonly type: 'remote';
}

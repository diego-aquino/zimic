import { PathParams } from 'msw';
import type { SetupWorker as BrowserMSWWorker } from 'msw/browser';
import { HttpRequestResolverExtras } from 'msw/lib/core/handlers/HttpHandler';
import { ResponseResolverInfo } from 'msw/lib/core/handlers/RequestHandler';
import type { SetupServer as NodeMSWWorker } from 'msw/node';

import { HttpResponse, DefaultBody } from '@/http/types/requests';
import { PossiblePromise } from '@/types/utils';

export type HttpWorker = BrowserMSWWorker | NodeMSWWorker;
export { BrowserMSWWorker as BrowserHttpWorker, NodeMSWWorker as NodeHttpWorker };

export type HttpRequestHandlerContext<Body extends DefaultBody = DefaultBody> = ResponseResolverInfo<
  HttpRequestResolverExtras<PathParams>,
  Body
>;

export interface EffectiveHttpRequestHandlerResult<Body extends DefaultBody = DefaultBody> {
  bypass?: never;
  response: HttpResponse<Body>;
}

export interface BypassedHttpRequestHandlerResult {
  bypass: true;
  response?: never;
}

export type HttpRequestHandlerResult<Body extends DefaultBody = DefaultBody> =
  | EffectiveHttpRequestHandlerResult<Body>
  | BypassedHttpRequestHandlerResult;

export type HttpRequestHandler<
  RequestBody extends DefaultBody = DefaultBody,
  ResponseBody extends DefaultBody = DefaultBody,
> = (context: HttpRequestHandlerContext<RequestBody>) => PossiblePromise<HttpRequestHandlerResult<ResponseBody>>;

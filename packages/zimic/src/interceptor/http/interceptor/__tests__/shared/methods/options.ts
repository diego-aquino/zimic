import { afterAll, afterEach, beforeAll, expect, expectTypeOf, it } from 'vitest';

import HttpSearchParams from '@/http/searchParams/HttpSearchParams';
import { createHttpInterceptorWorker } from '@/interceptor/http/interceptorWorker/factory';
import HttpInterceptorWorker from '@/interceptor/http/interceptorWorker/HttpInterceptorWorker';
import HttpRequestTracker from '@/interceptor/http/requestTracker/HttpRequestTracker';
import { usingHttpInterceptor } from '@tests/utils/interceptors';

import { HttpInterceptorSchema } from '../../../types/schema';
import { SharedHttpInterceptorTestsOptions } from '../interceptorTests';

export function declareOptionsHttpInterceptorTests({ platform }: SharedHttpInterceptorTestsOptions) {
  const worker = createHttpInterceptorWorker({ platform }) as HttpInterceptorWorker;
  const baseURL = 'http://localhost:3000';

  interface Filters {
    name: string;
  }

  beforeAll(async () => {
    await worker.start();
  });

  afterEach(() => {
    expect(worker.interceptorsWithHandlers()).toHaveLength(0);
  });

  afterAll(async () => {
    await worker.stop();
  });

  it('should support intercepting OPTIONS requests with a static response body', async () => {
    await usingHttpInterceptor<{
      '/filters': {
        OPTIONS: {
          response: {
            200: {};
          };
        };
      };
    }>({ worker, baseURL }, async (interceptor) => {
      const optionsTracker = interceptor.options('/filters').respond({
        status: 200,
      });
      expect(optionsTracker).toBeInstanceOf(HttpRequestTracker);

      const optionsRequests = optionsTracker.requests();
      expect(optionsRequests).toHaveLength(0);

      const optionsResponse = await fetch(`${baseURL}/filters`, { method: 'OPTIONS' });
      expect(optionsResponse.status).toBe(200);

      expect(optionsRequests).toHaveLength(1);
      const [optionsRequest] = optionsRequests;
      expect(optionsRequest).toBeInstanceOf(Request);

      expectTypeOf(optionsRequest.body).toEqualTypeOf<null>();
      expect(optionsRequest.body).toBe(null);

      expectTypeOf(optionsRequest.response.status).toEqualTypeOf<200>();
      expect(optionsRequest.response.status).toEqual(200);

      expectTypeOf(optionsRequest.response.body).toEqualTypeOf<null>();
      expect(optionsRequest.response.body).toBe(null);
    });
  });

  it('should support intercepting OPTIONS requests with a computed response body', async () => {
    await usingHttpInterceptor<{
      '/filters': {
        OPTIONS: {
          request: { body: Filters };
          response: {
            200: {};
          };
        };
      };
    }>({ worker, baseURL }, async (interceptor) => {
      const optionsTracker = interceptor.options('/filters').respond((request) => {
        expectTypeOf(request.body).toEqualTypeOf<Filters>();

        return {
          status: 200,
        };
      });
      expect(optionsTracker).toBeInstanceOf(HttpRequestTracker);

      const optionsRequests = optionsTracker.requests();
      expect(optionsRequests).toHaveLength(0);

      const userName = 'User (other)';

      const optionsResponse = await fetch(`${baseURL}/filters`, {
        method: 'OPTIONS',
        body: JSON.stringify({ name: userName } satisfies Filters),
      });

      expect(optionsResponse.status).toBe(200);

      expect(optionsRequests).toHaveLength(1);
      const [optionsRequest] = optionsRequests;
      expect(optionsRequest).toBeInstanceOf(Request);

      expectTypeOf(optionsRequest.body).toEqualTypeOf<Filters>();
      expect(optionsRequest.body).toEqual<Filters>({ name: userName });

      expectTypeOf(optionsRequest.response.status).toEqualTypeOf<200>();
      expect(optionsRequest.response.status).toEqual(200);

      expectTypeOf(optionsRequest.response.status).toEqualTypeOf<200>();
      expect(optionsRequest.response.status).toEqual(200);

      expectTypeOf(optionsRequest.response.body).toEqualTypeOf<null>();
      expect(optionsRequest.response.body).toBe(null);
    });
  });

  it('should support intercepting OPTIONS requests having search params', async () => {
    type OptionsSearchParams = HttpInterceptorSchema.SearchParams<{
      tag?: string;
    }>;

    await usingHttpInterceptor<{
      '/filters': {
        OPTIONS: {
          request: {
            searchParams: OptionsSearchParams;
          };
          response: {
            200: {};
          };
        };
      };
    }>({ worker, baseURL }, async (interceptor) => {
      const optionsTracker = interceptor.options('/filters').respond((request) => {
        expectTypeOf(request.searchParams).toEqualTypeOf<HttpSearchParams<OptionsSearchParams>>();

        return {
          status: 200,
        };
      });
      expect(optionsTracker).toBeInstanceOf(HttpRequestTracker);

      const optionsRequests = optionsTracker.requests();
      expect(optionsRequests).toHaveLength(0);

      const searchParams = new HttpSearchParams<OptionsSearchParams>({
        tag: 'admin',
      });

      const optionsResponse = await fetch(`${baseURL}/filters?${searchParams.toString()}`, { method: 'OPTIONS' });
      expect(optionsResponse.status).toBe(200);

      expect(optionsRequests).toHaveLength(1);
      const [optionsRequest] = optionsRequests;
      expect(optionsRequest).toBeInstanceOf(Request);

      expectTypeOf(optionsRequest.searchParams).toEqualTypeOf<HttpSearchParams<OptionsSearchParams>>();
      expect(optionsRequest.searchParams).toEqual(searchParams);
      expect(optionsRequest.searchParams.get('tag')).toBe('admin');
    });
  });

  it('should support intercepting OPTIONS requests with a dynamic path', async () => {
    await usingHttpInterceptor<{
      '/filters/:id': {
        OPTIONS: {
          response: {
            200: {};
          };
        };
      };
    }>({ worker, baseURL }, async (interceptor) => {
      const genericOptionsTracker = interceptor.options('/filters/:id').respond({
        status: 200,
      });
      expect(genericOptionsTracker).toBeInstanceOf(HttpRequestTracker);

      const genericOptionsRequests = genericOptionsTracker.requests();
      expect(genericOptionsRequests).toHaveLength(0);

      const genericOptionsResponse = await fetch(`${baseURL}/filters/${1}`, { method: 'OPTIONS' });
      expect(genericOptionsResponse.status).toBe(200);

      expect(genericOptionsRequests).toHaveLength(1);
      const [genericOptionsRequest] = genericOptionsRequests;
      expect(genericOptionsRequest).toBeInstanceOf(Request);

      expectTypeOf(genericOptionsRequest.body).toEqualTypeOf<null>();
      expect(genericOptionsRequest.body).toBe(null);

      expectTypeOf(genericOptionsRequest.response.status).toEqualTypeOf<200>();
      expect(genericOptionsRequest.response.status).toEqual(200);

      expectTypeOf(genericOptionsRequest.response.body).toEqualTypeOf<null>();
      expect(genericOptionsRequest.response.body).toBe(null);

      genericOptionsTracker.bypass();

      const specificOptionsTracker = interceptor.options<'/filters/:id'>(`/filters/${1}`).respond({
        status: 200,
      });
      expect(specificOptionsTracker).toBeInstanceOf(HttpRequestTracker);

      const specificOptionsRequests = specificOptionsTracker.requests();
      expect(specificOptionsRequests).toHaveLength(0);

      const specificOptionsResponse = await fetch(`${baseURL}/filters/${1}`, { method: 'OPTIONS' });
      expect(specificOptionsResponse.status).toBe(200);

      expect(specificOptionsRequests).toHaveLength(1);
      const [specificOptionsRequest] = specificOptionsRequests;
      expect(specificOptionsRequest).toBeInstanceOf(Request);

      expectTypeOf(specificOptionsRequest.body).toEqualTypeOf<null>();
      expect(specificOptionsRequest.body).toBe(null);

      expectTypeOf(specificOptionsRequest.response.status).toEqualTypeOf<200>();
      expect(specificOptionsRequest.response.status).toEqual(200);

      expectTypeOf(specificOptionsRequest.response.body).toEqualTypeOf<null>();
      expect(specificOptionsRequest.response.body).toBe(null);

      const unmatchedOptionsPromise = fetch(`${baseURL}/filters/${2}`, { method: 'OPTIONS' });
      await expect(unmatchedOptionsPromise).rejects.toThrowError();
    });
  });

  it('should not intercept a OPTIONS request without a registered response', async () => {
    await usingHttpInterceptor<{
      '/filters': {
        OPTIONS: {
          response: {
            200: {};
          };
        };
      };
    }>({ worker, baseURL }, async (interceptor) => {
      let fetchPromise = fetch(`${baseURL}/filters`, { method: 'OPTIONS' });
      await expect(fetchPromise).rejects.toThrowError();

      const optionsTrackerWithoutResponse = interceptor.options('/filters');
      expect(optionsTrackerWithoutResponse).toBeInstanceOf(HttpRequestTracker);

      const optionsRequestsWithoutResponse = optionsTrackerWithoutResponse.requests();
      expect(optionsRequestsWithoutResponse).toHaveLength(0);

      let [optionsRequestWithoutResponse] = optionsRequestsWithoutResponse;
      expectTypeOf<typeof optionsRequestWithoutResponse.body>().toEqualTypeOf<null>();
      expectTypeOf<typeof optionsRequestWithoutResponse.response>().toEqualTypeOf<never>();

      fetchPromise = fetch(`${baseURL}/filters`, { method: 'OPTIONS' });
      await expect(fetchPromise).rejects.toThrowError();

      expect(optionsRequestsWithoutResponse).toHaveLength(0);

      [optionsRequestWithoutResponse] = optionsRequestsWithoutResponse;
      expectTypeOf<typeof optionsRequestWithoutResponse.body>().toEqualTypeOf<null>();
      expectTypeOf<typeof optionsRequestWithoutResponse.response>().toEqualTypeOf<never>();

      const optionsTrackerWithResponse = optionsTrackerWithoutResponse.respond({
        status: 200,
      });

      const optionsResponse = await fetch(`${baseURL}/filters`, { method: 'OPTIONS' });
      expect(optionsResponse.status).toBe(200);

      expect(optionsRequestsWithoutResponse).toHaveLength(0);
      const optionsRequestsWithResponse = optionsTrackerWithResponse.requests();
      expect(optionsRequestsWithResponse).toHaveLength(1);

      const [optionsRequestWithResponse] = optionsRequestsWithResponse;
      expect(optionsRequestWithResponse).toBeInstanceOf(Request);
      expect(optionsRequestWithResponse.response.status).toEqual(200);

      expectTypeOf(optionsRequestWithResponse.body).toEqualTypeOf<null>();
      expect(optionsRequestWithResponse.body).toBe(null);

      expectTypeOf(optionsRequestWithResponse.response.status).toEqualTypeOf<200>();
      expect(optionsRequestWithResponse.response.status).toEqual(200);

      expectTypeOf(optionsRequestWithResponse.response.body).toEqualTypeOf<null>();
      expect(optionsRequestWithResponse.response.body).toBe(null);
    });
  });

  it('should consider only the last declared response when intercepting OPTIONS requests', async () => {
    interface ServerErrorResponseBody {
      message: string;
    }

    await usingHttpInterceptor<{
      '/filters': {
        OPTIONS: {
          response: {
            200: {};
            204: {};
            500: { body: ServerErrorResponseBody };
          };
        };
      };
    }>({ worker, baseURL }, async (interceptor) => {
      const optionsTracker = interceptor
        .options('/filters')
        .respond({
          status: 200,
        })
        .respond({
          status: 204,
        });

      const optionsRequests = optionsTracker.requests();
      expect(optionsRequests).toHaveLength(0);

      const optionsResponse = await fetch(`${baseURL}/filters`, { method: 'OPTIONS' });
      expect(optionsResponse.status).toBe(204);

      expect(optionsRequests).toHaveLength(1);
      const [optionsRequest] = optionsRequests;
      expect(optionsRequest).toBeInstanceOf(Request);

      expectTypeOf(optionsRequest.body).toEqualTypeOf<null>();
      expect(optionsRequest.body).toBe(null);

      expectTypeOf(optionsRequest.response.status).toEqualTypeOf<204>();
      expect(optionsRequest.response.status).toEqual(204);

      expectTypeOf(optionsRequest.response.body).toEqualTypeOf<null>();
      expect(optionsRequest.response.body).toBe(null);

      const errorOptionsTracker = interceptor.options('/filters').respond({
        status: 500,
        body: { message: 'Internal server error' },
      });

      const errorOptionsRequests = errorOptionsTracker.requests();
      expect(errorOptionsRequests).toHaveLength(0);

      const otherOptionsResponse = await fetch(`${baseURL}/filters`, { method: 'OPTIONS' });
      expect(otherOptionsResponse.status).toBe(500);

      const serverError = (await otherOptionsResponse.json()) as ServerErrorResponseBody;
      expect(serverError).toEqual<ServerErrorResponseBody>({ message: 'Internal server error' });

      expect(optionsRequests).toHaveLength(1);

      expect(errorOptionsRequests).toHaveLength(1);
      const [errorOptionsRequest] = errorOptionsRequests;
      expect(errorOptionsRequest).toBeInstanceOf(Request);

      expectTypeOf(errorOptionsRequest.body).toEqualTypeOf<null>();
      expect(errorOptionsRequest.body).toBe(null);

      expectTypeOf(errorOptionsRequest.response.status).toEqualTypeOf<500>();
      expect(errorOptionsRequest.response.status).toEqual(500);

      expectTypeOf(errorOptionsRequest.response.body).toEqualTypeOf<ServerErrorResponseBody>();
      expect(errorOptionsRequest.response.body).toEqual<ServerErrorResponseBody>({ message: 'Internal server error' });
    });
  });

  it('should ignore trackers with bypassed responses when intercepting OPTIONS requests', async () => {
    interface ServerErrorResponseBody {
      message: string;
    }

    await usingHttpInterceptor<{
      '/filters': {
        OPTIONS: {
          response: {
            200: {};
            204: {};
            500: { body: ServerErrorResponseBody };
          };
        };
      };
    }>({ worker, baseURL }, async (interceptor) => {
      const optionsTracker = interceptor
        .options('/filters')
        .respond({
          status: 200,
        })
        .bypass();

      const initialOptionsRequests = optionsTracker.requests();
      expect(initialOptionsRequests).toHaveLength(0);

      const optionsPromise = fetch(`${baseURL}/filters`, { method: 'OPTIONS' });
      await expect(optionsPromise).rejects.toThrowError();

      const noContentOptionsTracker = optionsTracker.respond({
        status: 204,
      });

      expect(initialOptionsRequests).toHaveLength(0);
      const optionsRequests = noContentOptionsTracker.requests();
      expect(optionsRequests).toHaveLength(0);

      let optionsResponse = await fetch(`${baseURL}/filters`, { method: 'OPTIONS' });
      expect(optionsResponse.status).toBe(204);

      expect(optionsRequests).toHaveLength(1);
      let [optionsRequest] = optionsRequests;
      expect(optionsRequest).toBeInstanceOf(Request);

      expectTypeOf(optionsRequest.body).toEqualTypeOf<null>();
      expect(optionsRequest.body).toBe(null);

      expectTypeOf(optionsRequest.response.status).toEqualTypeOf<204>();
      expect(optionsRequest.response.status).toEqual(204);

      expectTypeOf(optionsRequest.response.body).toEqualTypeOf<null>();
      expect(optionsRequest.response.body).toBe(null);

      const errorOptionsTracker = interceptor.options('/filters').respond({
        status: 500,
        body: { message: 'Internal server error' },
      });

      const errorOptionsRequests = errorOptionsTracker.requests();
      expect(errorOptionsRequests).toHaveLength(0);

      const otherOptionsResponse = await fetch(`${baseURL}/filters`, { method: 'OPTIONS' });
      expect(otherOptionsResponse.status).toBe(500);

      const serverError = (await otherOptionsResponse.json()) as ServerErrorResponseBody;
      expect(serverError).toEqual<ServerErrorResponseBody>({ message: 'Internal server error' });

      expect(optionsRequests).toHaveLength(1);

      expect(errorOptionsRequests).toHaveLength(1);
      const [errorOptionsRequest] = errorOptionsRequests;
      expect(errorOptionsRequest).toBeInstanceOf(Request);

      expectTypeOf(errorOptionsRequest.body).toEqualTypeOf<null>();
      expect(errorOptionsRequest.body).toBe(null);

      expectTypeOf(errorOptionsRequest.response.status).toEqualTypeOf<500>();
      expect(errorOptionsRequest.response.status).toEqual(500);

      expectTypeOf(errorOptionsRequest.response.body).toEqualTypeOf<ServerErrorResponseBody>();
      expect(errorOptionsRequest.response.body).toEqual<ServerErrorResponseBody>({ message: 'Internal server error' });

      errorOptionsTracker.bypass();

      optionsResponse = await fetch(`${baseURL}/filters`, { method: 'OPTIONS' });
      expect(optionsResponse.status).toBe(204);

      expect(errorOptionsRequests).toHaveLength(1);

      expect(optionsRequests).toHaveLength(2);
      [optionsRequest] = optionsRequests;
      expect(optionsRequest).toBeInstanceOf(Request);

      expectTypeOf(optionsRequest.body).toEqualTypeOf<null>();
      expect(optionsRequest.body).toBe(null);

      expectTypeOf(optionsRequest.response.status).toEqualTypeOf<204>();
      expect(optionsRequest.response.status).toEqual(204);

      expectTypeOf(optionsRequest.response.body).toEqualTypeOf<null>();
      expect(optionsRequest.response.body).toBe(null);
    });
  });

  it('should ignore all trackers after cleared when intercepting OPTIONS requests', async () => {
    await usingHttpInterceptor<{
      '/filters': {
        OPTIONS: {
          response: {
            200: {};
            204: {};
          };
        };
      };
    }>({ worker, baseURL }, async (interceptor) => {
      const optionsTracker = interceptor.options('/filters').respond({
        status: 200,
      });

      interceptor.clear();

      const initialOptionsRequests = optionsTracker.requests();
      expect(initialOptionsRequests).toHaveLength(0);

      const optionsPromise = fetch(`${baseURL}/filters`, { method: 'OPTIONS' });
      await expect(optionsPromise).rejects.toThrowError();
    });
  });

  it('should support creating new trackers after cleared', async () => {
    await usingHttpInterceptor<{
      '/filters': {
        OPTIONS: {
          response: {
            200: {};
            204: {};
          };
        };
      };
    }>({ worker, baseURL }, async (interceptor) => {
      interceptor.options('/filters').respond({
        status: 200,
      });

      interceptor.clear();

      const noContentOptionsTracker = interceptor.options('/filters').respond({
        status: 204,
      });

      const optionsRequests = noContentOptionsTracker.requests();
      expect(optionsRequests).toHaveLength(0);

      const optionsResponse = await fetch(`${baseURL}/filters`, { method: 'OPTIONS' });
      expect(optionsResponse.status).toBe(204);

      expect(optionsRequests).toHaveLength(1);
      const [optionsRequest] = optionsRequests;
      expect(optionsRequest).toBeInstanceOf(Request);

      expectTypeOf(optionsRequest.body).toEqualTypeOf<null>();
      expect(optionsRequest.body).toBe(null);

      expectTypeOf(optionsRequest.response.status).toEqualTypeOf<204>();
      expect(optionsRequest.response.status).toEqual(204);

      expectTypeOf(optionsRequest.response.body).toEqualTypeOf<null>();
      expect(optionsRequest.response.body).toBe(null);
    });
  });

  it('should support reusing previous trackers after cleared', async () => {
    await usingHttpInterceptor<{
      '/filters': {
        OPTIONS: {
          response: {
            200: {};
            204: {};
          };
        };
      };
    }>({ worker, baseURL }, async (interceptor) => {
      const optionsTracker = interceptor.options('/filters');

      optionsTracker.respond({
        status: 200,
      });

      interceptor.clear();

      const noContentOptionsTracker = optionsTracker.respond({
        status: 204,
      });

      const optionsRequests = noContentOptionsTracker.requests();
      expect(optionsRequests).toHaveLength(0);

      const optionsResponse = await fetch(`${baseURL}/filters`, { method: 'OPTIONS' });
      expect(optionsResponse.status).toBe(204);

      expect(optionsRequests).toHaveLength(1);
      const [optionsRequest] = optionsRequests;
      expect(optionsRequest).toBeInstanceOf(Request);

      expectTypeOf(optionsRequest.body).toEqualTypeOf<null>();
      expect(optionsRequest.body).toBe(null);

      expectTypeOf(optionsRequest.response.status).toEqualTypeOf<204>();
      expect(optionsRequest.response.status).toEqual(204);

      expectTypeOf(optionsRequest.response.body).toEqualTypeOf<null>();
      expect(optionsRequest.response.body).toBe(null);
    });
  });
}

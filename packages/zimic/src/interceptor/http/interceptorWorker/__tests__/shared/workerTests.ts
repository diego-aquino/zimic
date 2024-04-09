import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HTTP_METHODS } from '@/http/types/schema';
import { createHttpInterceptor } from '@/interceptor/http/interceptor/factory';
import {
  HttpInterceptorWorker,
  InternalHttpInterceptorWorker,
} from '@/interceptor/http/interceptorWorker/types/public';
import { fetchWithTimeout } from '@/utils/fetch';
import { waitForDelay } from '@/utils/time';
import { expectToThrowFetchError } from '@tests/utils/fetch';
import { expectPossiblePromise } from '@tests/utils/promises';

import NotStartedHttpInterceptorWorkerError from '../../errors/NotStartedHttpInterceptorWorkerError';
import OtherHttpInterceptorWorkerRunningError from '../../errors/OtherHttpInterceptorWorkerRunningError';
import { createHttpInterceptorWorker } from '../../factory';
import LocalHttpInterceptorWorker from '../../LocalHttpInterceptorWorker';
import RemoteHttpInterceptorWorker from '../../RemoteHttpInterceptorWorker';
import { HttpInterceptorWorkerOptions, HttpInterceptorWorkerPlatform } from '../../types/options';
import { HttpRequestHandler } from '../../types/requests';

export function declareSharedHttpInterceptorWorkerTests(options: { platform: HttpInterceptorWorkerPlatform }) {
  const { platform } = options;

  const baseURL = 'http://localhost:3000';

  const workerOptionsArray: HttpInterceptorWorkerOptions[] = [
    { type: 'local' },
    { type: 'remote', mockServerURL: baseURL },
  ];

  describe.each(workerOptionsArray)('Shared (type $type)', (workerOptions) => {
    let worker: LocalHttpInterceptorWorker | RemoteHttpInterceptorWorker | undefined;

    const responseStatus = 200;
    const responseBody = { success: true };

    function requestHandler(..._parameters: Parameters<HttpRequestHandler>): ReturnType<HttpRequestHandler> {
      const response = Response.json(responseBody, { status: responseStatus });
      return { response };
    }

    const spiedRequestHandler = vi.fn(requestHandler);

    function createWorker() {
      const worker = createHttpInterceptorWorker(workerOptions) satisfies HttpInterceptorWorker;
      return worker as LocalHttpInterceptorWorker | RemoteHttpInterceptorWorker;
    }

    function createDefaultHttpInterceptor(worker: LocalHttpInterceptorWorker | RemoteHttpInterceptorWorker) {
      if (worker instanceof LocalHttpInterceptorWorker) {
        return createHttpInterceptor({ worker, baseURL });
      } else {
        return createHttpInterceptor({ worker, pathPrefix: 'path' });
      }
    }

    async function checkedWorkerUse(
      worker: LocalHttpInterceptorWorker | RemoteHttpInterceptorWorker,
      ...parameters: Parameters<InternalHttpInterceptorWorker['use']>
    ) {
      return expectPossiblePromise(worker.use(...parameters), {
        shouldBePromise: worker instanceof RemoteHttpInterceptorWorker,
      });
    }

    async function checkedWorkerClearHandlers(
      worker: LocalHttpInterceptorWorker | RemoteHttpInterceptorWorker,
      ...parameters: Parameters<InternalHttpInterceptorWorker['clearHandlers']>
    ) {
      return expectPossiblePromise(worker.clearHandlers(...parameters), {
        shouldBePromise: worker instanceof RemoteHttpInterceptorWorker,
      });
    }

    async function checkedWorkerInterceptorWithHandlers(
      worker: LocalHttpInterceptorWorker | RemoteHttpInterceptorWorker,
      ...parameters: Parameters<InternalHttpInterceptorWorker['interceptorsWithHandlers']>
    ) {
      return expectPossiblePromise(worker.interceptorsWithHandlers(...parameters), {
        shouldBePromise: worker instanceof RemoteHttpInterceptorWorker,
      });
    }

    async function checkedWorkerClearInterceptorHandlers(
      worker: LocalHttpInterceptorWorker | RemoteHttpInterceptorWorker,
      ...parameters: Parameters<InternalHttpInterceptorWorker['clearInterceptorHandlers']>
    ) {
      return expectPossiblePromise(worker.clearInterceptorHandlers(...parameters), {
        shouldBePromise: worker instanceof RemoteHttpInterceptorWorker,
      });
    }

    beforeEach(async () => {
      if (worker) {
        await checkedWorkerClearHandlers(worker);
      }
      spiedRequestHandler.mockClear();
    });

    afterEach(async () => {
      await worker?.stop();
    });

    it('should initialize using the correct MSW server/worker and platform', async () => {
      worker = createWorker();

      expect(worker.platform()).toBe(null);
      expect(worker).toBeInstanceOf(LocalHttpInterceptorWorker);

      await worker.start();

      expect(worker.platform()).toBe(platform);

      if (worker instanceof LocalHttpInterceptorWorker) {
        expect(worker.hasInternalBrowserWorker()).toBe(platform === 'browser');
        expect(worker.hasInternalNodeWorker()).toBe(platform === 'node');
      }
    });

    it('should not throw an error when started multiple times', async () => {
      worker = createWorker();

      expect(worker.isRunning()).toBe(false);
      await worker.start();
      expect(worker.isRunning()).toBe(true);
      await worker.start();
      expect(worker.isRunning()).toBe(true);
      await worker.start();
      expect(worker.isRunning()).toBe(true);
    });

    it('should not throw an error when stopped without running', async () => {
      worker = createWorker();

      expect(worker.isRunning()).toBe(false);
      await worker.stop();
      expect(worker.isRunning()).toBe(false);
      await worker.stop();
      expect(worker.isRunning()).toBe(false);
      await worker.stop();
      expect(worker.isRunning()).toBe(false);
    });

    it('should not throw an error when stopped multiple times while running', async () => {
      worker = createWorker();

      expect(worker.isRunning()).toBe(false);
      await worker.start();
      expect(worker.isRunning()).toBe(true);
      await worker.stop();
      expect(worker.isRunning()).toBe(false);
      await worker.stop();
      expect(worker.isRunning()).toBe(false);
      await worker.stop();
      expect(worker.isRunning()).toBe(false);
    });

    it('should throw an error if multiple workers are started at the same time', async () => {
      worker = createWorker();
      expect(worker.isRunning()).toBe(false);

      const otherInterceptorWorker = createWorker();
      expect(otherInterceptorWorker.isRunning()).toBe(false);

      await worker.start();
      expect(worker.isRunning()).toBe(true);

      await expect(otherInterceptorWorker.start()).rejects.toThrowError(new OtherHttpInterceptorWorkerRunningError());
      expect(otherInterceptorWorker.isRunning()).toBe(false);

      await worker.stop();
      expect(worker.isRunning()).toBe(false);

      try {
        await otherInterceptorWorker.start();
        expect(otherInterceptorWorker.isRunning()).toBe(true);

        await expect(worker.start()).rejects.toThrowError(new OtherHttpInterceptorWorkerRunningError());
        expect(worker.isRunning()).toBe(false);
      } finally {
        await otherInterceptorWorker.stop();
      }
    });

    describe.each(HTTP_METHODS)('Method: %s', (method) => {
      it(`should intercept ${method} requests after started`, async () => {
        worker = createWorker();

        await worker.start();

        const interceptor = createDefaultHttpInterceptor(worker);
        const url = `${baseURL}/path`;

        await checkedWorkerUse(worker, interceptor, method, url, spiedRequestHandler);

        expect(spiedRequestHandler).not.toHaveBeenCalled();

        const response = await fetch(url, { method });

        expect(spiedRequestHandler).toHaveBeenCalledTimes(1);

        const [handlerContext] = spiedRequestHandler.mock.calls[0];
        expect(handlerContext.request).toBeInstanceOf(Request);
        expect(handlerContext.request.method).toBe(method);
        expect(handlerContext.params).toEqual({});
        expect(handlerContext.cookies).toEqual({});

        expect(response.status).toBe(200);

        const body = (await response.json()) as typeof responseBody;
        expect(body).toEqual(responseBody);
      });

      it(`should intercept ${method} requests after started, considering dynamic paths with a generic match`, async () => {
        worker = createWorker();

        await worker.start();

        const interceptor = createDefaultHttpInterceptor(worker);
        await checkedWorkerUse(worker, interceptor, method, `${baseURL}/path/:id`, spiedRequestHandler);

        expect(spiedRequestHandler).not.toHaveBeenCalled();

        const response = await fetch(`${baseURL}/path/${1}`, { method });

        expect(spiedRequestHandler).toHaveBeenCalledTimes(1);

        const [handlerContext] = spiedRequestHandler.mock.calls[0];
        expect(handlerContext.request).toBeInstanceOf(Request);
        expect(handlerContext.request.method).toBe(method);
        expect(handlerContext.params).toEqual({ id: '1' });
        expect(handlerContext.cookies).toEqual({});

        expect(response.status).toBe(200);

        const body = (await response.json()) as typeof responseBody;
        expect(body).toEqual(responseBody);
      });

      it(`should intercept ${method} requests after started, considering dynamic paths with a specific match`, async () => {
        worker = createWorker();

        await worker.start();

        const interceptor = createDefaultHttpInterceptor(worker);
        await checkedWorkerUse(worker, interceptor, method, `${baseURL}/path/${1}`, spiedRequestHandler);

        expect(spiedRequestHandler).not.toHaveBeenCalled();

        const matchedResponse = await fetch(`${baseURL}/path/${1}`, { method });
        expect(matchedResponse.status).toBe(200);

        const matchedBody = (await matchedResponse.json()) as typeof responseBody;
        expect(matchedBody).toEqual(responseBody);

        expect(spiedRequestHandler).toHaveBeenCalledTimes(1);

        const [matchedCallContext] = spiedRequestHandler.mock.calls[0];
        expect(matchedCallContext.request).toBeInstanceOf(Request);
        expect(matchedCallContext.request.method).toBe(method);
        expect(matchedCallContext.params).toEqual({});
        expect(matchedCallContext.cookies).toEqual({});

        spiedRequestHandler.mockClear();

        const unmatchedResponsePromise = fetch(`${baseURL}/path/${2}`, { method });
        await expectToThrowFetchError(unmatchedResponsePromise);

        expect(spiedRequestHandler).toHaveBeenCalledTimes(0);
      });

      it(`should not intercept bypassed ${method} requests`, async () => {
        worker = createWorker();

        await worker.start();

        const interceptor = createDefaultHttpInterceptor(worker);
        const bypassedSpiedRequestHandler = vi.fn(requestHandler).mockImplementation(() => ({ bypass: true }));

        await checkedWorkerUse(worker, interceptor, method, `${baseURL}/path`, bypassedSpiedRequestHandler);

        expect(bypassedSpiedRequestHandler).not.toHaveBeenCalled();

        const fetchPromise = fetch(`${baseURL}/path`, { method });
        await expectToThrowFetchError(fetchPromise);

        expect(bypassedSpiedRequestHandler).toHaveBeenCalledTimes(1);

        const [handlerContext] = bypassedSpiedRequestHandler.mock.calls[0];
        expect(handlerContext.request).toBeInstanceOf(Request);
        expect(handlerContext.request.method).toBe(method);
        expect(handlerContext.params).toEqual({});
        expect(handlerContext.cookies).toEqual({});
      });

      it(`should support intercepting ${method} requests with a delay`, async () => {
        worker = createWorker();

        await worker.start();

        const interceptor = createDefaultHttpInterceptor(worker);
        const delayedSpiedRequestHandler = vi.fn(requestHandler).mockImplementation(async (context) => {
          await waitForDelay(100);
          return requestHandler(context);
        });

        await checkedWorkerUse(worker, interceptor, method, `${baseURL}/path`, delayedSpiedRequestHandler);

        expect(delayedSpiedRequestHandler).not.toHaveBeenCalled();

        let fetchPromise = fetchWithTimeout(`${baseURL}/path`, { method, timeout: 50 });
        await expectToThrowFetchError(fetchPromise, { canBeAborted: true });

        fetchPromise = fetchWithTimeout(`${baseURL}/path`, { method, timeout: 200 });
        await expect(fetchPromise).resolves.toBeInstanceOf(Response);

        expect(delayedSpiedRequestHandler).toHaveBeenCalledTimes(2);

        for (const [handlerContext] of delayedSpiedRequestHandler.mock.calls) {
          expect(handlerContext.request).toBeInstanceOf(Request);
          expect(handlerContext.request.method).toBe(method);
          expect(handlerContext.params).toEqual({});
          expect(handlerContext.cookies).toEqual({});
        }
      });

      it(`should not intercept ${method} requests before started`, async () => {
        worker = createWorker();

        const interceptor = createDefaultHttpInterceptor(worker);
        await expect(async () => {
          await worker?.use(interceptor, method, `${baseURL}/path`, spiedRequestHandler);
        }).rejects.toThrowError(Error);

        expect(spiedRequestHandler).not.toHaveBeenCalled();

        const fetchPromise = fetchWithTimeout(`${baseURL}/path`, { method, timeout: 200 });
        await expectToThrowFetchError(fetchPromise, { canBeAborted: true });

        expect(spiedRequestHandler).not.toHaveBeenCalled();
      });

      it(`should not intercept ${method} requests after stopped`, async () => {
        worker = createWorker();

        await worker.start();

        const interceptor = createDefaultHttpInterceptor(worker);
        await checkedWorkerUse(worker, interceptor, method, `${baseURL}/path`, spiedRequestHandler);

        await worker.stop();

        const fetchPromise = fetchWithTimeout(`${baseURL}/path`, { method, timeout: 200 });
        await expectToThrowFetchError(fetchPromise, { canBeAborted: true });

        expect(spiedRequestHandler).not.toHaveBeenCalled();
      });

      it(`should clear all ${method} handlers after stopped`, async () => {
        worker = createWorker();

        await worker.start();

        const interceptor = createDefaultHttpInterceptor(worker);
        await checkedWorkerUse(worker, interceptor, method, `${baseURL}/path`, spiedRequestHandler);

        await worker.stop();
        await worker.start();

        const fetchPromise = fetchWithTimeout(`${baseURL}/path`, { method, timeout: 200 });
        await expectToThrowFetchError(fetchPromise, { canBeAborted: true });

        expect(spiedRequestHandler).not.toHaveBeenCalled();
      });

      it(`should not intercept ${method} requests having no handler after cleared`, async () => {
        worker = createWorker();

        await worker.start();

        const interceptor = createDefaultHttpInterceptor(worker);
        await checkedWorkerUse(worker, interceptor, method, `${baseURL}/path`, spiedRequestHandler);

        await checkedWorkerClearHandlers(worker);

        const fetchPromise = fetchWithTimeout(`${baseURL}/path`, { method, timeout: 200 });
        await expectToThrowFetchError(fetchPromise, { canBeAborted: true });

        expect(spiedRequestHandler).not.toHaveBeenCalled();

        await checkedWorkerUse(worker, interceptor, method, `${baseURL}/path`, spiedRequestHandler);

        expect(spiedRequestHandler).not.toHaveBeenCalled();

        const response = await fetch(`${baseURL}/path`, { method });

        expect(spiedRequestHandler).toHaveBeenCalledTimes(1);

        const [handlerContext] = spiedRequestHandler.mock.calls[0];
        expect(handlerContext.request).toBeInstanceOf(Request);
        expect(handlerContext.request.method).toBe(method);
        expect(handlerContext.params).toEqual({});
        expect(handlerContext.cookies).toEqual({});

        expect(response.status).toBe(200);

        const body = (await response.json()) as typeof responseBody;
        expect(body).toEqual(responseBody);
      });

      it(`should not intercept ${method} requests handled by a cleared interceptor`, async () => {
        worker = createWorker();

        await worker.start();

        const okSpiedRequestHandler = vi.fn(spiedRequestHandler).mockImplementation(() => {
          const response = new Response(null, { status: 200 });
          return { response };
        });
        const noContentSpiedRequestHandler = vi.fn(spiedRequestHandler).mockImplementation(() => {
          const response = new Response(null, { status: 204 });
          return { response };
        });

        const interceptor = createDefaultHttpInterceptor(worker);
        await checkedWorkerUse(worker, interceptor, method, `${baseURL}/path`, okSpiedRequestHandler);

        let interceptorsWithHandlers = await checkedWorkerInterceptorWithHandlers(worker);

        expect(interceptorsWithHandlers).toHaveLength(1);
        expect(interceptorsWithHandlers[0]).toBe(interceptor);

        let response = await fetch(`${baseURL}/path`, { method });
        expect(response.status).toBe(200);

        expect(okSpiedRequestHandler).toHaveBeenCalledTimes(1);
        expect(noContentSpiedRequestHandler).toHaveBeenCalledTimes(0);

        let [okHandlerContext] = okSpiedRequestHandler.mock.calls[0];
        expect(okHandlerContext.request).toBeInstanceOf(Request);
        expect(okHandlerContext.request.method).toBe(method);
        expect(okHandlerContext.params).toEqual({});
        expect(okHandlerContext.cookies).toEqual({});

        const otherInterceptor = createDefaultHttpInterceptor(worker);
        await checkedWorkerUse(worker, otherInterceptor, method, `${baseURL}/path`, noContentSpiedRequestHandler);

        interceptorsWithHandlers = await checkedWorkerInterceptorWithHandlers(worker);
        expect(interceptorsWithHandlers).toHaveLength(2);
        expect(interceptorsWithHandlers[0]).toBe(interceptor);
        expect(interceptorsWithHandlers[1]).toBe(otherInterceptor);

        response = await fetch(`${baseURL}/path`, { method });
        expect(response.status).toBe(204);

        expect(okSpiedRequestHandler).toHaveBeenCalledTimes(1);
        expect(noContentSpiedRequestHandler).toHaveBeenCalledTimes(1);

        const [noContentHandlerContext] = noContentSpiedRequestHandler.mock.calls[0];
        expect(noContentHandlerContext.request).toBeInstanceOf(Request);
        expect(noContentHandlerContext.request.method).toBe(method);
        expect(noContentHandlerContext.params).toEqual({});
        expect(noContentHandlerContext.cookies).toEqual({});

        await checkedWorkerClearInterceptorHandlers(worker, otherInterceptor);

        interceptorsWithHandlers = await checkedWorkerInterceptorWithHandlers(worker);
        expect(interceptorsWithHandlers).toHaveLength(1);
        expect(interceptorsWithHandlers[0]).toBe(interceptor);

        response = await fetch(`${baseURL}/path`, { method });
        expect(response.status).toBe(200);

        expect(okSpiedRequestHandler).toHaveBeenCalledTimes(2);
        expect(noContentSpiedRequestHandler).toHaveBeenCalledTimes(1);

        [okHandlerContext] = okSpiedRequestHandler.mock.calls[1];
        expect(okHandlerContext.request).toBeInstanceOf(Request);
        expect(okHandlerContext.request.method).toBe(method);
        expect(okHandlerContext.params).toEqual({});
        expect(okHandlerContext.cookies).toEqual({});

        await checkedWorkerClearInterceptorHandlers(worker, interceptor);

        interceptorsWithHandlers = await checkedWorkerInterceptorWithHandlers(worker);
        expect(interceptorsWithHandlers).toHaveLength(0);

        const fetchPromise = fetchWithTimeout(`${baseURL}/path`, { method, timeout: 200 });
        await expectToThrowFetchError(fetchPromise, { canBeAborted: true });

        expect(okSpiedRequestHandler).toHaveBeenCalledTimes(2);
        expect(noContentSpiedRequestHandler).toHaveBeenCalledTimes(1);
      });

      it(`should thrown an error if trying to apply a ${method} handler before started`, async () => {
        worker = createWorker();

        const interceptor = createDefaultHttpInterceptor(worker);

        await expect(async () => {
          await worker?.use(interceptor, method, `${baseURL}/path`, spiedRequestHandler);
        }).rejects.toThrowError(NotStartedHttpInterceptorWorkerError);
      });
    });
  });
}

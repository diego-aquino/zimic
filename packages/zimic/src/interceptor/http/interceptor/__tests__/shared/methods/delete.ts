import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

import HttpHeaders from '@/http/headers/HttpHeaders';
import HttpSearchParams from '@/http/searchParams/HttpSearchParams';
import { HttpSchema } from '@/http/types/schema';
import { http } from '@/interceptor';
import { promiseIfRemote } from '@/interceptor/http/interceptorWorker/__tests__/utils/promises';
import LocalHttpRequestHandler from '@/interceptor/http/requestHandler/LocalHttpRequestHandler';
import RemoteHttpRequestHandler from '@/interceptor/http/requestHandler/RemoteHttpRequestHandler';
import { JSONValue } from '@/types/json';
import { getCrypto } from '@/utils/crypto';
import { fetchWithTimeout } from '@/utils/fetch';
import { joinURL } from '@/utils/urls';
import { usingIgnoredConsole } from '@tests/utils/console';
import { expectFetchError } from '@tests/utils/fetch';
import { createInternalHttpInterceptor, usingHttpInterceptor } from '@tests/utils/interceptors';

import NotStartedHttpInterceptorError from '../../../errors/NotStartedHttpInterceptorError';
import { HttpInterceptorOptions, UnhandledRequestStrategy } from '../../../types/options';
import { RuntimeSharedHttpInterceptorTestsOptions } from '../types';
import { verifyUnhandledRequestMessage } from '../utils';

export async function declareDeleteHttpInterceptorTests(options: RuntimeSharedHttpInterceptorTestsOptions) {
  const { platform, type, getBaseURL, getInterceptorOptions } = options;

  const crypto = await getCrypto();

  type User = JSONValue<{
    id: string;
    name: string;
  }>;

  const users: User[] = [
    { id: crypto.randomUUID(), name: 'User 1' },
    { id: crypto.randomUUID(), name: 'User 2' },
  ];

  let baseURL: URL;
  let interceptorOptions: HttpInterceptorOptions;

  let Handler: typeof LocalHttpRequestHandler | typeof RemoteHttpRequestHandler;

  beforeEach(() => {
    baseURL = getBaseURL();
    interceptorOptions = getInterceptorOptions();

    Handler = options.type === 'local' ? LocalHttpRequestHandler : RemoteHttpRequestHandler;
  });

  describe('Restrictions', () => {
    it('should support intercepting DELETE requests having headers restrictions', async () => {
      type UserDeletionHeaders = HttpSchema.Headers<{
        'content-language'?: string;
        accept?: string;
      }>;

      await usingHttpInterceptor<{
        '/users/:id': {
          DELETE: {
            request: {
              headers: UserDeletionHeaders;
            };
            response: {
              200: { body: User };
            };
          };
        };
      }>(interceptorOptions, async (interceptor) => {
        const deletionHandler = await promiseIfRemote(
          interceptor
            .delete(`/users/:id`)
            .with({
              headers: { 'content-language': 'en' },
            })
            .with((request) => {
              expectTypeOf(request.headers).toEqualTypeOf<HttpHeaders<UserDeletionHeaders>>();
              expect(request.headers).toBeInstanceOf(HttpHeaders);

              return request.headers.get('accept')?.includes('application/json') ?? false;
            })
            .respond((request) => {
              expectTypeOf(request.headers).toEqualTypeOf<HttpHeaders<UserDeletionHeaders>>();
              expect(request.headers).toBeInstanceOf(HttpHeaders);

              return {
                status: 200,
                body: users[0],
              };
            }),
          interceptor,
        );
        expect(deletionHandler).toBeInstanceOf(Handler);

        let deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
        expect(deletionRequests).toHaveLength(0);

        const headers = new HttpHeaders<UserDeletionHeaders>({
          'content-language': 'en',
          accept: 'application/json',
        });

        let deletionResponse = await fetch(joinURL(baseURL, `/users/${users[0].id}`), { method: 'DELETE', headers });
        expect(deletionResponse.status).toBe(200);
        deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
        expect(deletionRequests).toHaveLength(1);

        headers.append('accept', 'application/xml');

        deletionResponse = await fetch(joinURL(baseURL, `/users/${users[0].id}`), { method: 'DELETE', headers });
        expect(deletionResponse.status).toBe(200);
        deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
        expect(deletionRequests).toHaveLength(2);

        headers.delete('accept');

        let deletionPromise = fetch(joinURL(baseURL, `/users/${users[0].id}`), { method: 'DELETE', headers });
        await expectFetchError(deletionPromise);
        deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
        expect(deletionRequests).toHaveLength(2);

        headers.set('accept', 'application/json');
        headers.set('content-language', 'pt');

        deletionPromise = fetch(joinURL(baseURL, '/users'), { method: 'DELETE', headers });
        await expectFetchError(deletionPromise);
        deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
        expect(deletionRequests).toHaveLength(2);
      });
    });

    it('should support intercepting DELETE requests having search params restrictions', async () => {
      type UserDeletionSearchParams = HttpSchema.SearchParams<{
        tag?: string;
      }>;

      await usingHttpInterceptor<{
        '/users/:id': {
          DELETE: {
            request: {
              searchParams: UserDeletionSearchParams;
            };
            response: {
              200: { body: User };
            };
          };
        };
      }>(interceptorOptions, async (interceptor) => {
        const deletionHandler = await promiseIfRemote(
          interceptor
            .delete('/users/:id')
            .with({
              searchParams: { tag: 'admin' },
            })
            .respond((request) => {
              expectTypeOf(request.searchParams).toEqualTypeOf<HttpSearchParams<UserDeletionSearchParams>>();
              expect(request.searchParams).toBeInstanceOf(HttpSearchParams);

              return {
                status: 200,
                body: users[0],
              };
            }),
          interceptor,
        );
        expect(deletionHandler).toBeInstanceOf(Handler);

        let deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
        expect(deletionRequests).toHaveLength(0);

        const searchParams = new HttpSearchParams<UserDeletionSearchParams>({
          tag: 'admin',
        });

        const deletionResponse = await fetch(joinURL(baseURL, `/users/${users[0].id}?${searchParams.toString()}`), {
          method: 'DELETE',
        });
        expect(deletionResponse.status).toBe(200);
        deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
        expect(deletionRequests).toHaveLength(1);

        searchParams.delete('tag');

        const deletionPromise = fetch(joinURL(baseURL, `/users/${users[0].id}?${searchParams.toString()}`), {
          method: 'DELETE',
        });
        await expectFetchError(deletionPromise);
        deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
        expect(deletionRequests).toHaveLength(1);
      });
    });

    it('should support intercepting DELETE requests having body restrictions', async () => {
      type UserDeletionBody = JSONValue<{
        tags?: string[];
        other?: string;
      }>;

      await usingHttpInterceptor<{
        '/users/:id': {
          DELETE: {
            request: {
              body: UserDeletionBody;
            };
            response: {
              200: { body: User };
            };
          };
        };
      }>(interceptorOptions, async (interceptor) => {
        const deletionHandler = await promiseIfRemote(
          interceptor
            .delete(`/users/:id`)
            .with({
              body: { tags: ['admin'] },
            })
            .with((request) => {
              expectTypeOf(request.body).toEqualTypeOf<UserDeletionBody>();

              return request.body.other?.startsWith('extra') ?? false;
            })
            .respond((request) => {
              expectTypeOf(request.body).toEqualTypeOf<UserDeletionBody>();

              return {
                status: 200,
                body: users[0],
              };
            }),
          interceptor,
        );
        expect(deletionHandler).toBeInstanceOf(Handler);

        let deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
        expect(deletionRequests).toHaveLength(0);

        let deletionResponse = await fetch(joinURL(baseURL, `/users/${users[0].id}`), {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            tags: ['admin'],
            other: 'extra',
          } satisfies UserDeletionBody),
        });
        expect(deletionResponse.status).toBe(200);
        deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
        expect(deletionRequests).toHaveLength(1);

        deletionResponse = await fetch(joinURL(baseURL, `/users/${users[0].id}`), {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            tags: ['admin'],
            other: 'extra-other',
          } satisfies UserDeletionBody),
        });
        expect(deletionResponse.status).toBe(200);
        deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
        expect(deletionRequests).toHaveLength(2);

        let deletionPromise = fetch(joinURL(baseURL, `/users/${users[0].id}`), {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            tags: ['admin'],
          } satisfies UserDeletionBody),
        });
        await expectFetchError(deletionPromise);
        deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
        expect(deletionRequests).toHaveLength(2);

        deletionPromise = fetch(joinURL(baseURL, '/users'), {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            tags: [],
          } satisfies UserDeletionBody),
        });
        await expectFetchError(deletionPromise);
        deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
        expect(deletionRequests).toHaveLength(2);
      });
    });
  });

  describe('Life cycle', () => {
    it('should ignore all handlers after restarted when intercepting DELETE requests', async () => {
      await usingHttpInterceptor<{
        '/users/:id': {
          DELETE: {
            response: {
              200: { body: User };
            };
          };
        };
      }>(interceptorOptions, async (interceptor) => {
        const deletionHandler = await promiseIfRemote(
          interceptor.delete(`/users/${users[0].id}`).respond({
            status: 200,
            body: users[0],
          }),
          interceptor,
        );

        let deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
        expect(deletionRequests).toHaveLength(0);

        const deletionResponse = await fetch(joinURL(baseURL, `/users/${users[0].id}`), { method: 'DELETE' });
        expect(deletionResponse.status).toBe(200);

        deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
        expect(deletionRequests).toHaveLength(1);

        expect(interceptor.isRunning()).toBe(true);
        await interceptor.stop();
        expect(interceptor.isRunning()).toBe(false);

        let deletionPromise = fetchWithTimeout(joinURL(baseURL, `/users/${users[0].id}`), {
          method: 'DELETE',
          timeout: 200,
        });
        await expectFetchError(deletionPromise, { canBeAborted: true });

        deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
        expect(deletionRequests).toHaveLength(1);

        await interceptor.start();
        expect(interceptor.isRunning()).toBe(true);

        deletionPromise = fetch(joinURL(baseURL, `/users/${users[0].id}`), { method: 'DELETE' });
        await expectFetchError(deletionPromise);

        deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
        expect(deletionRequests).toHaveLength(1);
      });
    });

    it('should ignore all handlers after restarted when intercepting DELETE requests, even if another interceptor is still running', async () => {
      await usingHttpInterceptor<{
        '/users/:id': {
          DELETE: {
            response: {
              200: { body: User };
            };
          };
        };
      }>(interceptorOptions, async (interceptor) => {
        const deletionHandler = await promiseIfRemote(
          interceptor.delete(`/users/${users[0].id}`).respond({
            status: 200,
            body: users[0],
          }),
          interceptor,
        );

        let deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
        expect(deletionRequests).toHaveLength(0);

        const deletionResponse = await fetch(joinURL(baseURL, `/users/${users[0].id}`), { method: 'DELETE' });
        expect(deletionResponse.status).toBe(200);

        deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
        expect(deletionRequests).toHaveLength(1);

        await usingHttpInterceptor(interceptorOptions, async (otherInterceptor) => {
          expect(interceptor.isRunning()).toBe(true);
          expect(otherInterceptor.isRunning()).toBe(true);

          await interceptor.stop();
          expect(interceptor.isRunning()).toBe(false);
          expect(otherInterceptor.isRunning()).toBe(true);

          let deletionPromise = fetchWithTimeout(joinURL(baseURL, `/users/${users[0].id}`), {
            method: 'DELETE',
            timeout: 200,
          });
          await expectFetchError(deletionPromise, { canBeAborted: true });

          deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
          expect(deletionRequests).toHaveLength(1);

          await interceptor.start();
          expect(interceptor.isRunning()).toBe(true);
          expect(otherInterceptor.isRunning()).toBe(true);

          deletionPromise = fetch(joinURL(baseURL, `/users/${users[0].id}`), { method: 'DELETE' });
          await expectFetchError(deletionPromise);

          deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
          expect(deletionRequests).toHaveLength(1);
        });
      });
    });

    it('should throw an error when trying to create a DELETE request handler if not running', async () => {
      const interceptor = createInternalHttpInterceptor(interceptorOptions);
      expect(interceptor.isRunning()).toBe(false);

      await expect(async () => {
        await interceptor.delete('/');
      }).rejects.toThrowError(new NotStartedHttpInterceptorError());
    });
  });

  describe('Unhandled requests', () => {
    describe.each([
      { overrideDefault: false as const },
      { overrideDefault: 'static' as const },
      { overrideDefault: 'static-empty' as const },
      { overrideDefault: 'function' as const },
    ])('Logging enabled or disabled: override default $overrideDefault', ({ overrideDefault }) => {
      beforeEach(() => {
        if (overrideDefault === 'static') {
          http.default.onUnhandledRequest({ log: true });
        } else if (overrideDefault === 'static-empty') {
          http.default.onUnhandledRequest({});
        } else if (overrideDefault === 'function') {
          http.default.onUnhandledRequest(async (_request, context) => {
            await context.log();
          });
        }
      });

      if (type === 'local') {
        it('should show a warning when logging is enabled and a DELETE request is unhandled and bypassed', async () => {
          await usingHttpInterceptor<{
            '/users/:id': {
              DELETE: {
                request: { headers: { 'x-value': string } };
                response: {
                  200: { body: User };
                };
              };
            };
          }>(
            {
              ...interceptorOptions,
              onUnhandledRequest: overrideDefault === false ? { log: true } : {},
            },
            async (interceptor) => {
              const deletionHandler = await promiseIfRemote(
                interceptor
                  .delete(`/users/${users[0].id}`)
                  .with({ headers: { 'x-value': '1' } })
                  .respond({
                    status: 200,
                    body: users[0],
                  }),
                interceptor,
              );

              let deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
              expect(deletionRequests).toHaveLength(0);

              await usingIgnoredConsole(['warn', 'error'], async (spies) => {
                const deletionResponse = await fetch(joinURL(baseURL, `/users/${users[0].id}`), {
                  method: 'DELETE',
                  headers: { 'x-value': '1' },
                });
                expect(deletionResponse.status).toBe(200);

                deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
                expect(deletionRequests).toHaveLength(1);

                expect(spies.warn).toHaveBeenCalledTimes(0);
                expect(spies.error).toHaveBeenCalledTimes(0);

                const deletionRequest = new Request(joinURL(baseURL, `/users/${users[0].id}`), { method: 'DELETE' });
                const deletionPromise = fetch(deletionRequest);
                await expectFetchError(deletionPromise);

                deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
                expect(deletionRequests).toHaveLength(1);

                expect(spies.warn).toHaveBeenCalledTimes(1);
                expect(spies.error).toHaveBeenCalledTimes(0);

                const warnMessage = spies.warn.mock.calls[0].join(' ');
                await verifyUnhandledRequestMessage(warnMessage, {
                  type: 'warn',
                  platform,
                  request: deletionRequest,
                });
              });
            },
          );
        });
      }

      if (type === 'remote') {
        it('should show an error when logging is enabled and a DELETE request is unhandled and rejected', async () => {
          await usingHttpInterceptor<{
            '/users/:id': {
              DELETE: {
                request: { headers: { 'x-value': string } };
                response: {
                  200: { body: User };
                };
              };
            };
          }>(
            {
              ...interceptorOptions,
              onUnhandledRequest: overrideDefault === false ? { log: true } : {},
            },
            async (interceptor) => {
              const deletionHandler = await promiseIfRemote(
                interceptor
                  .delete(`/users/${users[0].id}`)
                  .with({ headers: { 'x-value': '1' } })
                  .respond({
                    status: 200,
                    body: users[0],
                  }),
                interceptor,
              );

              let deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
              expect(deletionRequests).toHaveLength(0);

              await usingIgnoredConsole(['warn', 'error'], async (spies) => {
                const deletionResponse = await fetch(joinURL(baseURL, `/users/${users[0].id}`), {
                  method: 'DELETE',
                  headers: { 'x-value': '1' },
                });
                expect(deletionResponse.status).toBe(200);

                deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
                expect(deletionRequests).toHaveLength(1);

                expect(spies.warn).toHaveBeenCalledTimes(0);
                expect(spies.error).toHaveBeenCalledTimes(0);

                const deletionRequest = new Request(joinURL(baseURL, `/users/${users[0].id}`), {
                  method: 'DELETE',
                  headers: { 'x-value': '2' },
                });
                const deletionPromise = fetch(deletionRequest);
                await expectFetchError(deletionPromise);

                deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
                expect(deletionRequests).toHaveLength(1);

                expect(spies.warn).toHaveBeenCalledTimes(0);
                expect(spies.error).toHaveBeenCalledTimes(1);

                const errorMessage = spies.error.mock.calls[0].join(' ');
                await verifyUnhandledRequestMessage(errorMessage, {
                  type: 'error',
                  platform,
                  request: deletionRequest,
                });
              });
            },
          );
        });
      }
    });

    it.each([{ overrideDefault: false }, { overrideDefault: 'static' }, { overrideDefault: 'function' }])(
      'should not show a warning or error when logging is disabled and a DELETE request is unhandled: override default $overrideDefault',
      async ({ overrideDefault }) => {
        if (overrideDefault === 'static') {
          http.default.onUnhandledRequest({ log: false });
        } else if (overrideDefault === 'function') {
          http.default.onUnhandledRequest(vi.fn());
        }

        await usingHttpInterceptor<{
          '/users/:id': {
            DELETE: {
              request: { headers: { 'x-value': string } };
              response: {
                200: { body: User };
              };
            };
          };
        }>(
          {
            ...interceptorOptions,
            onUnhandledRequest: overrideDefault === false ? { log: false } : {},
          },
          async (interceptor) => {
            const deletionHandler = await promiseIfRemote(
              interceptor
                .delete(`/users/${users[0].id}`)
                .with({ headers: { 'x-value': '1' } })
                .respond({
                  status: 200,
                  body: users[0],
                }),
              interceptor,
            );

            let deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
            expect(deletionRequests).toHaveLength(0);

            await usingIgnoredConsole(['warn', 'error'], async (spies) => {
              const deletionResponse = await fetch(joinURL(baseURL, `/users/${users[0].id}`), {
                method: 'DELETE',
                headers: { 'x-value': '1' },
              });
              expect(deletionResponse.status).toBe(200);

              deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
              expect(deletionRequests).toHaveLength(1);

              expect(spies.warn).toHaveBeenCalledTimes(0);
              expect(spies.error).toHaveBeenCalledTimes(0);

              const deletionRequest = new Request(joinURL(baseURL, `/users/${users[0].id}`), {
                method: 'DELETE',
                headers: { 'x-value': '2' },
              });
              const deletionPromise = fetch(deletionRequest);
              await expectFetchError(deletionPromise);

              deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
              expect(deletionRequests).toHaveLength(1);

              expect(spies.warn).toHaveBeenCalledTimes(0);
              expect(spies.error).toHaveBeenCalledTimes(0);
            });
          },
        );
      },
    );

    it('should support a custom unhandled DELETE request handler', async () => {
      const onUnhandledRequest = vi.fn(async (request: Request, context: UnhandledRequestStrategy.HandlerContext) => {
        const url = new URL(request.url);

        if (!url.searchParams.has('name')) {
          await context.log();
        }
      });

      await usingHttpInterceptor<{
        '/users/:id': {
          DELETE: {
            request: {
              headers: { 'x-value': string };
              searchParams: { name?: string };
            };
            response: {
              200: { body: User };
            };
          };
        };
      }>({ ...interceptorOptions, onUnhandledRequest }, async (interceptor) => {
        const deletionHandler = await promiseIfRemote(
          interceptor
            .delete(`/users/${users[0].id}`)
            .with({ headers: { 'x-value': '1' } })
            .respond({
              status: 200,
              body: users[0],
            }),
          interceptor,
        );

        let deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
        expect(deletionRequests).toHaveLength(0);

        await usingIgnoredConsole(['warn', 'error'], async (spies) => {
          const deletionResponse = await fetch(joinURL(baseURL, `/users/${users[0].id}`), {
            method: 'DELETE',
            headers: { 'x-value': '1' },
          });
          expect(deletionResponse.status).toBe(200);

          deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
          expect(deletionRequests).toHaveLength(1);

          expect(onUnhandledRequest).toHaveBeenCalledTimes(0);
          expect(spies.warn).toHaveBeenCalledTimes(0);
          expect(spies.error).toHaveBeenCalledTimes(0);

          const searchParams = new HttpSearchParams({ name: 'User 1' });

          let deletionPromise = fetch(joinURL(baseURL, `/users/${users[0].id}?${searchParams.toString()}`), {
            method: 'DELETE',
            headers: { 'x-value': '2' },
          });
          await expectFetchError(deletionPromise);

          deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
          expect(deletionRequests).toHaveLength(1);

          expect(onUnhandledRequest).toHaveBeenCalledTimes(1);
          expect(spies.warn).toHaveBeenCalledTimes(0);
          expect(spies.error).toHaveBeenCalledTimes(0);

          const deletionRequest = new Request(joinURL(baseURL, `/users/${users[0].id}`), {
            method: 'DELETE',
            headers: { 'x-value': '2' },
          });
          deletionPromise = fetch(deletionRequest);
          await expectFetchError(deletionPromise);

          deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
          expect(deletionRequests).toHaveLength(1);

          expect(onUnhandledRequest).toHaveBeenCalledTimes(2);

          const messageType = type === 'local' ? 'warn' : 'error';
          expect(spies.warn).toHaveBeenCalledTimes(messageType === 'warn' ? 1 : 0);
          expect(spies.error).toHaveBeenCalledTimes(messageType === 'error' ? 1 : 0);

          const errorMessage = spies[messageType].mock.calls[0].join(' ');
          await verifyUnhandledRequestMessage(errorMessage, {
            type: messageType,
            platform,
            request: deletionRequest,
          });
        });
      });
    });

    it('should log an error if a custom unhandled DELETE request handler throws', async () => {
      const error = new Error('Unhandled request.');

      const onUnhandledRequest = vi.fn((request: Request) => {
        const url = new URL(request.url);

        if (!url.searchParams.has('name')) {
          throw error;
        }
      });

      await usingHttpInterceptor<{
        '/users/:id': {
          DELETE: {
            request: {
              headers: { 'x-value': string };
              searchParams: { name?: string };
            };
            response: {
              200: { body: User };
            };
          };
        };
      }>({ ...interceptorOptions, onUnhandledRequest }, async (interceptor) => {
        const deletionHandler = await promiseIfRemote(
          interceptor
            .delete(`/users/${users[0].id}`)
            .with({ headers: { 'x-value': '1' } })
            .respond({
              status: 200,
              body: users[0],
            }),
          interceptor,
        );

        let deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
        expect(deletionRequests).toHaveLength(0);

        await usingIgnoredConsole(['warn', 'error'], async (spies) => {
          const deletionResponse = await fetch(joinURL(baseURL, `/users/${users[0].id}`), {
            method: 'DELETE',
            headers: { 'x-value': '1' },
          });
          expect(deletionResponse.status).toBe(200);

          deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
          expect(deletionRequests).toHaveLength(1);

          expect(onUnhandledRequest).toHaveBeenCalledTimes(0);
          expect(spies.warn).toHaveBeenCalledTimes(0);
          expect(spies.error).toHaveBeenCalledTimes(0);

          const searchParams = new HttpSearchParams({ name: 'User 1' });

          let deletionPromise = fetch(joinURL(baseURL, `/users/${users[0].id}?${searchParams.toString()}`), {
            method: 'DELETE',
            headers: { 'x-value': '2' },
          });
          await expectFetchError(deletionPromise);

          deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
          expect(deletionRequests).toHaveLength(1);

          expect(onUnhandledRequest).toHaveBeenCalledTimes(1);
          expect(spies.warn).toHaveBeenCalledTimes(0);
          expect(spies.error).toHaveBeenCalledTimes(0);

          const deletionRequest = new Request(joinURL(baseURL, `/users/${users[0].id}`), {
            method: 'DELETE',
            headers: { 'x-value': '2' },
          });
          deletionPromise = fetch(deletionRequest);
          await expectFetchError(deletionPromise);

          deletionRequests = await promiseIfRemote(deletionHandler.requests(), interceptor);
          expect(deletionRequests).toHaveLength(1);

          expect(onUnhandledRequest).toHaveBeenCalledTimes(2);

          expect(spies.warn).toHaveBeenCalledTimes(0);
          expect(spies.error).toHaveBeenCalledTimes(1);

          expect(spies.error).toHaveBeenCalledWith(error);
        });
      });
    });
  });
}

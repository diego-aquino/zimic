import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ExtendedURL } from '@/utils/urls';
import { createInternalHttpInterceptor } from '@tests/utils/interceptors';

import UnknownHttpInterceptorTypeError from '../../errors/UnknownHttpInterceptorTypeError';
import { HttpInterceptorType } from '../../types/options';
import { declareBaseURLHttpInterceptorTests } from './baseURLs';
import { declareBodyHttpInterceptorTests } from './bodies';
import { declareBypassHttpInterceptorTests } from './bypass';
import { declareClearHttpInterceptorTests } from './clear';
import { declareDeclareHttpInterceptorTests } from './default';
import { declareDynamicPathsHttpInterceptorTests } from './dynamicPaths';
import { declareHandlerHttpInterceptorTests } from './handlers';
import { declareLifeCycleHttpInterceptorTests } from './lifeCycle';
import { declareRestrictionsHttpInterceptorTests } from './restrictions';
import { SharedHttpInterceptorTestsOptions, RuntimeSharedHttpInterceptorTestsOptions } from './types';
import { declareTypeHttpInterceptorTests } from './typescript';
import { declareUnhandledRequestHttpInterceptorTests } from './unhandledRequests';

export function declareSharedHttpInterceptorTests(options: SharedHttpInterceptorTestsOptions) {
  const { startServer, getBaseURL, stopServer } = options;

  it('should throw an error if created with an unknown type', () => {
    // @ts-expect-error Forcing an unknown type.
    const unknownType: HttpInterceptorType = 'unknown';

    expect(() => {
      // @ts-expect-error
      createInternalHttpInterceptor({ type: unknownType });
    }).toThrowError(new UnknownHttpInterceptorTypeError(unknownType));
  });

  const interceptorTypes: HttpInterceptorType[] = ['local', 'remote'];

  describe.each(interceptorTypes)("Type '%s'", (type) => {
    let baseURL: ExtendedURL;

    beforeAll(async () => {
      if (type === 'remote') {
        await startServer?.();
      }

      baseURL = await getBaseURL(type);
    });

    afterAll(async () => {
      if (type === 'remote') {
        await stopServer?.();
      }
    });

    const runtimeOptions: RuntimeSharedHttpInterceptorTestsOptions = {
      ...options,
      type,
      getBaseURL() {
        return baseURL;
      },
      getInterceptorOptions() {
        return { type, baseURL };
      },
    };

    describe('Default', () => {
      declareDeclareHttpInterceptorTests(runtimeOptions);
    });

    describe('Types', () => {
      declareTypeHttpInterceptorTests(runtimeOptions);
    });

    describe('Base URLs', () => {
      declareBaseURLHttpInterceptorTests(runtimeOptions);
    });

    describe('Handler', () => {
      declareHandlerHttpInterceptorTests(runtimeOptions);
    });

    describe('Dynamic paths', async () => {
      await declareDynamicPathsHttpInterceptorTests(runtimeOptions);
    });

    describe('Bodies', async () => {
      await declareBodyHttpInterceptorTests(runtimeOptions);
    });

    describe('Restrictions', () => {
      declareRestrictionsHttpInterceptorTests(runtimeOptions);
    });

    describe('Bypass', () => {
      declareBypassHttpInterceptorTests(runtimeOptions);
    });

    describe('Clear', () => {
      declareClearHttpInterceptorTests(runtimeOptions);
    });

    describe('Life cycle', () => {
      declareLifeCycleHttpInterceptorTests(runtimeOptions);
    });

    describe('Unhandled requests', () => {
      declareUnhandledRequestHttpInterceptorTests(runtimeOptions);
    });
  });
}

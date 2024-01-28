import { describe, expect, it, vi } from 'vitest';

import { HttpInterceptorMethodSchema } from '../../interceptor/types/schema';
import HttpInterceptorWorker from '../../interceptorWorker/HttpInterceptorWorker';
import NoResponseDefinitionError from '../errors/NoResponseDefinitionError';
import InternalHttpRequestTracker from '../InternalHttpRequestTracker';
import { HttpInterceptorRequest, HttpRequestTrackerResponseDeclaration } from '../types/requests';

describe('InternalHttpRequestTracker', () => {
  const defaultBaseURL = 'http://localhost:3000';

  it('should not match any request if contains no declared response', async () => {
    const tracker = new InternalHttpRequestTracker();

    const request = new Request(defaultBaseURL);
    const parsedRequest = await HttpInterceptorWorker.parseRawRequest(request);
    expect(tracker.matchesRequest(parsedRequest)).toBe(false);
  });

  it('should match any request if contains declared response', async () => {
    const tracker = new InternalHttpRequestTracker().respond({
      status: 200,
      body: {},
    });

    const request = new Request(defaultBaseURL);
    const parsedRequest = await HttpInterceptorWorker.parseRawRequest(request);
    expect(tracker.matchesRequest(parsedRequest)).toBe(true);
  });

  it('should not match any request if bypassed', async () => {
    const tracker = new InternalHttpRequestTracker();

    const request = new Request(defaultBaseURL);
    const parsedRequest = await HttpInterceptorWorker.parseRawRequest(request);
    expect(tracker.matchesRequest(parsedRequest)).toBe(false);

    tracker.bypass();
    expect(tracker.matchesRequest(parsedRequest)).toBe(false);

    tracker.respond({
      status: 200,
      body: {},
    });
    expect(tracker.matchesRequest(parsedRequest)).toBe(true);

    tracker.bypass();
    expect(tracker.matchesRequest(parsedRequest)).toBe(false);
  });

  it('should create response with declared status and body', async () => {
    const responseStatus = 201;
    const responseBody = { success: true };

    const tracker = new InternalHttpRequestTracker().respond({
      status: responseStatus,
      body: responseBody,
    });

    const request = new Request(defaultBaseURL);
    const parsedRequest = await HttpInterceptorWorker.parseRawRequest(request);
    const response = await tracker.applyResponseDeclaration(parsedRequest);

    expect(response.status).toBe(responseStatus);
    expect(response.body).toEqual(responseBody);
  });

  it('should create response with declared status and body factory', async () => {
    const responseStatus = 201;
    const responseBody = { success: true };

    const responseFactory = vi.fn<
      [HttpInterceptorRequest<HttpInterceptorMethodSchema>],
      HttpRequestTrackerResponseDeclaration<HttpInterceptorMethodSchema, number>
    >(() => ({
      status: responseStatus,
      body: responseBody,
    }));

    const tracker = new InternalHttpRequestTracker();
    tracker.respond(responseFactory);

    const request = new Request(defaultBaseURL);
    const parsedRequest = await HttpInterceptorWorker.parseRawRequest(request);
    const response = await tracker.applyResponseDeclaration(parsedRequest);

    expect(response.status).toBe(responseStatus);
    expect(response.body).toEqual(responseBody);

    expect(responseFactory).toHaveBeenCalledTimes(1);
    expect(responseFactory).toHaveBeenCalledWith(request);
  });

  it('should throw an error if trying to create a response without a declared response', async () => {
    const tracker = new InternalHttpRequestTracker();

    const request = new Request(defaultBaseURL);
    const parsedRequest = await HttpInterceptorWorker.parseRawRequest(request);

    await expect(async () => {
      await tracker.applyResponseDeclaration(parsedRequest);
    }).rejects.toThrowError(NoResponseDefinitionError);
  });

  it('should keep track of the intercepted requests and responses', async () => {
    const tracker = new InternalHttpRequestTracker().respond({
      status: 200,
      body: {},
    });

    const firstRequest = new Request(defaultBaseURL);
    const parsedFirstRequest = await HttpInterceptorWorker.parseRawRequest(firstRequest);

    const firstResponseDeclaration = await tracker.applyResponseDeclaration(parsedFirstRequest);
    const firstResponse = Response.json(firstResponseDeclaration.body, {
      status: firstResponseDeclaration.status,
    });
    const parsedFirstResponse = await HttpInterceptorWorker.parseRawResponse<HttpInterceptorMethodSchema, 200>(
      firstResponse,
    );

    tracker.registerInterceptedRequest(parsedFirstRequest, parsedFirstResponse);

    const interceptedRequests = tracker.requests();
    expect(interceptedRequests).toHaveLength(1);

    expect(interceptedRequests[0]).toEqual(firstRequest);
    expect(interceptedRequests[0].response).toEqual(firstResponse);

    const secondRequest = new Request(`${defaultBaseURL}/path`);
    const parsedSecondRequest = await HttpInterceptorWorker.parseRawRequest(secondRequest);
    const secondResponseDeclaration = await tracker.applyResponseDeclaration(parsedSecondRequest);

    const secondResponse = Response.json(secondResponseDeclaration.body, {
      status: secondResponseDeclaration.status,
    });
    const parsedSecondResponse = await HttpInterceptorWorker.parseRawResponse<HttpInterceptorMethodSchema, 200>(
      secondResponse,
    );

    tracker.registerInterceptedRequest(parsedSecondRequest, parsedSecondResponse);

    expect(interceptedRequests).toHaveLength(2);

    expect(interceptedRequests[0]).toEqual(firstRequest);
    expect(interceptedRequests[0].response).toEqual(firstResponse);

    expect(interceptedRequests[1]).toEqual(secondRequest);
    expect(interceptedRequests[1].response).toEqual(secondResponse);
  });
});

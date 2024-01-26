import axios, { AxiosError } from 'axios';

import { convertHeadersToObject, convertObjectToHeaders } from '@tests/utils/headers';

export async function axiosAsFetch(request: Request): Promise<Response> {
  try {
    const axiosResponse = await axios({
      url: request.url,
      method: request.method,
      headers: convertHeadersToObject(request.headers),
      data: await request.text(),
    });

    const stringifiedResponseData = axiosResponse.status === 204 ? null : JSON.stringify(axiosResponse.data);

    return new Response(stringifiedResponseData, {
      status: axiosResponse.status,
      statusText: axiosResponse.statusText,
      headers: convertObjectToHeaders({ ...axiosResponse.headers }),
    });
  } catch (error) {
    /* istanbul ignore next -- @preserve Ignoring as this is expected not to be covered */
    if (!(error instanceof AxiosError) || !error.response) {
      throw error;
    }

    const axiosResponse = error.response;
    const responseBody = JSON.stringify(axiosResponse.data);

    return new Response(responseBody, {
      status: axiosResponse.status,
      statusText: axiosResponse.statusText,
      headers: convertObjectToHeaders({ ...axiosResponse.headers }),
    });
  }
}

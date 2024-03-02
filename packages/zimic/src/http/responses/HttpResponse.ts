import HttpHeaders, { HttpHeadersInit } from '../headers/HttpHeaders';
import { HttpHeadersSchema } from '../headers/types';
import { DefaultBody } from '../types/requests';

/**
 * An HTTP response with a strictly-typed JSON body and status code. Fully compatible with the built-in
 * {@link https://developer.mozilla.org/docs/Web/API/Response Response} class.
 *
 * @see {@link https://github.com/diego-aquino/zimic#httpresponse}
 */
class HttpResponse<
  StrictBody extends DefaultBody = DefaultBody,
  StatusCode extends number = number,
  StrictHeadersSchema extends HttpHeadersSchema = HttpHeadersSchema,
> extends Response {
  readonly status: StatusCode;
  readonly headers: HttpHeaders<StrictHeadersSchema>;

  constructor(
    body: BodyInit | null,
    init: ResponseInit & {
      status: StatusCode;
      headers?: HttpHeadersInit<StrictHeadersSchema>;
    },
  ) {
    super(body, init);
    this.status = init.status;
    this.headers = new HttpHeaders<StrictHeadersSchema>(init.headers);
  }

  json(): Promise<StrictBody> {
    return super.json() as Promise<StrictBody>;
  }
}

export default HttpResponse;

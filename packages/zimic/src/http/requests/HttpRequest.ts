import HttpHeaders, { HttpHeadersInit } from '../headers/HttpHeaders';
import { HttpHeadersSchema } from '../headers/types';
import { DefaultBody } from '../types/requests';

/**
 * An HTTP request with a strictly-typed JSON body. Fully compatible with the built-in
 * {@link https://developer.mozilla.org/docs/Web/API/Request Request} class.
 *
 * @see {@link https://github.com/diego-aquino/zimic#httprequest}
 */
class HttpRequest<
  StrictBody extends DefaultBody = DefaultBody,
  StrictHeadersSchema extends HttpHeadersSchema = HttpHeadersSchema,
> extends Request {
  readonly headers: HttpHeaders<StrictHeadersSchema>;

  constructor(
    input: RequestInfo | URL,
    init?: RequestInit & {
      headers?: HttpHeadersInit<StrictHeadersSchema>;
    },
  ) {
    super(input, init);
    this.headers = new HttpHeaders<StrictHeadersSchema>(init?.headers);
  }

  json(): Promise<StrictBody> {
    return super.json() as Promise<StrictBody>;
  }
}

export default HttpRequest;

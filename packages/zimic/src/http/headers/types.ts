import { Defined } from '@/types/utils';

import HttpHeaders from './HttpHeaders';

/** A schema for strict HTTP headers. */
export interface HttpHeadersSchema {
  [headerName: string]: string | undefined;
}

/** A strict tuple representation of a {@link HttpHeadersSchema}. */
export type HttpHeadersSchemaTuple<Schema extends HttpHeadersSchema> = {
  [Key in keyof Schema & string]: [Key, Defined<Schema[Key]>];
}[keyof Schema & string];

export type HttpHeadersInit<Schema extends HttpHeadersSchema> =
  | Headers
  | Schema
  | HttpHeaders<Schema>
  | HttpHeadersSchemaTuple<Schema>[];

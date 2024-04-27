import { HTTP_METHODS, HttpSchema } from '@/http/types/schema';

const ALLOWED_ACCESS_CONTROL_HTTP_METHODS = HTTP_METHODS.join(',');

export type AccessControlHeaders = HttpSchema.Headers<{
  'access-control-allow-origin': string;
  'access-control-allow-methods': string;
  'access-control-allow-headers': string;
  'access-control-max-age': string;
  'access-control-expose-headers': string;
}>;

export const DEFAULT_ACCESS_CONTROL_HEADERS: AccessControlHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': ALLOWED_ACCESS_CONTROL_HTTP_METHODS,
  'access-control-allow-headers': '*',
  'access-control-expose-headers': '*',
  'access-control-max-age': '0',
};

export const DEFAULT_PREFLIGHT_STATUS_CODE = 204;

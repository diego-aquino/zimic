// Auto-generated by zimic@0.7.1.
// Note! Manual changes to this file will be overwritten.

import type { HttpSchema } from '@/index';

export type MyServiceSchema = HttpSchema.Paths<{
  '/binary-upload': {
    POST: {
      request: {
        body: Blob;
      };
      response: {
        200: {
          body: Blob | null;
        };
      };
    };
  };
}>;
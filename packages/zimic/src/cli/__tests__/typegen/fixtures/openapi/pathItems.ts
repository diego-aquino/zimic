// Auto-generated by zimic@0.7.1.
// Note! Manual changes to this file will be overwritten.

import type { HttpSchema } from '@/index';

export interface MyServiceComponents {
  pathItems: {
    users: HttpSchema.Methods<{
      POST: {
        request: {
          body: {
            name?: string;
          };
        };
        response: {
          200: {
            body: {
              id?: string;
              name?: string;
            };
          };
        };
      };
    }>;
  };
}

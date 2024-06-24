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
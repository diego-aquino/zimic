import type { HttpSchema } from '@/index';

export type MyServiceSchema = HttpSchema.Paths<{
  '/users/:userId': {
    /** Info for a specific user */
    GET: {
      response: {
        /** Success */
        200: {
          body: MyServiceComponents['schemas']['User'];
        };
      };
    };
  };
  '/users/:userId/friends': {
    /** List of friends for a specific user */
    GET: {
      response: {
        /** Success */
        200: {
          body: MyServiceComponents['schemas']['Users'];
        };
      };
    };
  };
  '/users/:userId/friends/:friendId': {
    /** Info for a specific friend of a specific user */
    GET: {
      response: {
        /** Success */
        200: {
          body: MyServiceComponents['schemas']['User'];
        };
      };
    };
  };
}>;
export interface MyServiceComponents {
  schemas: {
    User: {
      /** Format: int64 */
      id: number;
      name: string;
    };
    Users: MyServiceComponents['schemas']['User'][];
  };
}
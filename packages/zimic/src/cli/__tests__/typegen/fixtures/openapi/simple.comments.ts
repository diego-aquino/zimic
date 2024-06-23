import type { HttpSchema } from '@/index';

export type MyServiceSchema = HttpSchema.Paths<{
  '/users': {
    /** List users */
    GET: MyServiceOperations['listUsers'];
    /** Create user */
    POST: MyServiceOperations['createUser'];
  };
}>;
export interface MyServiceOperations {
  listUsers: HttpSchema.Method<{
    request: {
      searchParams: {
        /** How many items to return */
        limit: `${number}`;
      };
    };
    response: {
      /** Success */
      200: {
        body: {
          /**
           * @example
           *   be8253f9-124b-4c32-b046-c25b6fd0af0c
           */
          id: string;
          /**
           * @example
           *   John;
           */
          name?: string;
          /**
           * @example
           *   john@email.com
           */
          email: string;
          /**
           * @example
           *   2024-01-01T00:00:00.000Z
           */
          createdAt: string;
          /**
           * @example
           *   2024-01-01T00:00:00.000Z
           */
          updatedAt: string;
        }[];
      };
      /** Error */
      400: {
        body: {
          message: string;
        };
      };
    };
  }>;
  createUser: HttpSchema.Method<{
    /** The user to create */
    request: {
      body: {
        /**
         * @example
         *   John;
         */
        name?: string;
        /**
         * @example
         *   john@email.com
         */
        email: string;
        /**
         * @example
         *   123456;
         */
        password: string;
      };
    };
    response: {
      /** The user was created successfully */
      200: {
        body: {
          /**
           * @example
           *   be8253f9-124b-4c32-b046-c25b6fd0af0c
           */
          id: string;
          /**
           * @example
           *   John;
           */
          name?: string;
          /**
           * @example
           *   john@email.com
           */
          email: string;
          /**
           * @example
           *   2024-01-01T00:00:00.000Z
           */
          createdAt: string;
          /**
           * @example
           *   2024-01-01T00:00:00.000Z
           */
          updatedAt: string;
        };
      };
      /** Error */
      400: {
        body: {
          message: string;
        };
      };
    };
  }>;
}